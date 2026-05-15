import { db } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export interface TrendInterpretation {
  parameter: string;
  trend: 'Improving' | 'Worsening' | 'Stable' | 'Critical';
  severity: 'Low' | 'Moderate' | 'High';
  recommendation: string;
}

/**
 * TrendAnalysisService analyzes numerical trends in patient clinical logs.
 */
export const TrendAnalysisService = {
  
  async analyzeLabTrend(patientId: string, testName: string): Promise<TrendInterpretation | null> {
    // 1. Fetch recent history from DB
    const results = await db.lab_results
      .where('patientId')
      .equals(patientId)
      .and(r => r.testName === testName)
      .reverse()
      .sortBy('date');

    if (results.length < 2) return null;

    // 2. Perform Trend Analysis
    const latest = parseFloat(results[0].value || "0");
    const previous = parseFloat(results[1].value || "0");
    
    // Simplistic analysis logic (customize based on test type)
    let trend: TrendInterpretation['trend'] = 'Stable';
    let severity: TrendInterpretation['severity'] = 'Low';
    let recommendation = "Continue monitoring.";

    // Example logic for HbA1c
    if (testName === 'HbA1c') {
      if (latest > previous + 0.5) {
        trend = 'Worsening';
        severity = 'High';
        recommendation = "HbA1c has elevated significantly. Consider medication adjustment or lifestyle intervention.";
      } else if (latest < previous - 0.5) {
        trend = 'Improving';
        severity = 'Low';
        recommendation = "HbA1c is improving. Maintain current protocol.";
      }
    }

    return {
      parameter: testName,
      trend,
      severity,
      recommendation
    };
  }
};
