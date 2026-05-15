import { supabase, supabaseEnabled } from '@/lib/supabase';

export interface PrescribingTrend {
  doctorId: string;
  drugName: string;
  count: number;
}

export interface PeerBenchmark {
  drugName: string;
  averageCount: number;
}

/**
 * DoctorAnalyticsService aggregates audit logs to analyze prescribing patterns
 * and compares them against clinic-wide benchmarks.
 */
export const DoctorAnalyticsService = {
  
  /**
   * Fetches prescribing trends for a specific doctor.
   */
  async getDoctorPrescribingTrends(doctorId: string): Promise<PrescribingTrend[]> {
    if (!supabaseEnabled) {
      console.info("Analytics disabled: Supabase not configured");
      return [];
    }

    let query = supabase
      .from('sync_events')
      .select('payload')
      .eq('action', 'CREATE')
      .eq('entity_type', 'prescriptions');
    
    // Check if column is 'user_id' or 'userId' in Supabase
    // Using defensive check
    const { data, error } = await query.eq('user_id', doctorId);

    if (error) {
       console.error("Failed to fetch prescribing trends", error);
       return [];
    }

    // Aggregate trends (simplified)
    const trends: Record<string, number> = {};
    data.forEach(event => {
      const drugName = event.payload.medication_name || 'Unknown';
      trends[drugName] = (trends[drugName] || 0) + 1;
    });

    return Object.entries(trends).map(([drugName, count]) => ({
      doctorId,
      drugName,
      count
    }));
  },

  /**
   * Calculates peer benchmarks for prescribing.
   */
  async getClinicBenchmarks(): Promise<PeerBenchmark[]> {
    if (!supabaseEnabled) return [];

    const { data, error } = await supabase
      .from('sync_events')
      .select('payload, user_id')
      .eq('action', 'CREATE')
      .eq('entity_type', 'prescriptions');

    if (error) {
       console.error("Failed to fetch clinic benchmarks", error);
       return [];
    }

    const totalStats: Record<string, { totalCount: number, doctors: Set<string> }> = {};
    
    data.forEach(event => {
      const drugName = event.payload.medication_name || 'Unknown';
      if (!totalStats[drugName]) {
        totalStats[drugName] = { totalCount: 0, doctors: new Set() };
      }
      totalStats[drugName].totalCount++;
      totalStats[drugName].doctors.add(event.user_id);
    });

    return Object.entries(totalStats).map(([drugName, stats]) => ({
      drugName,
      averageCount: stats.totalCount / stats.doctors.size
    }));
  }
};
