import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { usePatient } from "@/lib/PatientContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Legend } from 'recharts';
import { Baby, TrendingUp, Ruler, Scale, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified WHO Weight-for-age (Boys 0-5 years) - Median, 5th, 95th
const WHO_WEIGHT_BOYS = [
  { month: 0, m: 3.3, p5: 2.5, p95: 4.4 },
  { month: 6, m: 7.9, p5: 6.4, p95: 9.8 },
  { month: 12, m: 9.6, p5: 7.7, p95: 12.0 },
  { month: 24, m: 12.2, p5: 9.7, p95: 15.3 },
  { month: 36, m: 14.3, p5: 11.3, p95: 18.3 },
  { month: 48, m: 16.3, p5: 12.7, p95: 21.2 },
  { month: 60, m: 18.3, p5: 14.1, p95: 24.2 },
];

// Simplified WHO Height-for-age (Boys 0-5 years)
const WHO_HEIGHT_BOYS = [
  { month: 0, m: 49.9, p5: 46.1, p95: 53.7 },
  { month: 6, m: 67.6, p5: 63.3, p95: 71.9 },
  { month: 12, m: 75.7, p5: 71.0, p95: 80.5 },
  { month: 24, m: 87.1, p5: 81.0, p95: 93.2 },
  { month: 36, m: 96.1, p5: 88.7, p95: 103.5 },
  { month: 48, m: 103.3, p5: 94.9, p95: 111.7 },
  { month: 60, m: 110.0, p5: 100.7, p95: 119.2 },
];

export function PediatricGrowthChart() {
  const { selectedPatient } = usePatient();

  const vitals = useLiveQuery(
    () => selectedPatient ? db.vitals.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient]
  ) || [];

  const patientData = useMemo(() => {
    if (!selectedPatient || !selectedPatient.dob) return [];
    
    const dob = new Date(selectedPatient.dob);
    return vitals
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(v => {
        const vDate = new Date(v.date);
        const ageInMonths = (vDate.getFullYear() - dob.getFullYear()) * 12 + (vDate.getMonth() - dob.getMonth());
        return {
          month: ageInMonths,
          weight: v.weight,
          height: v.height,
          date: vDate.toLocaleDateString()
        };
      });
  }, [vitals, selectedPatient]);

  const weightChartData = useMemo(() => {
    // Merge WHO data with patient data for plotting
    const combined = [...WHO_WEIGHT_BOYS].map(ref => {
      const pData = patientData.find(p => Math.abs(p.month - ref.month) <= 1);
      return {
        ...ref,
        patientWeight: pData?.weight
      };
    });
    
    // Add patient points that don't align with WHO milestones
    patientData.forEach(p => {
      if (!combined.find(c => c.month === p.month)) {
        combined.push({ month: p.month, patientWeight: p.weight } as any);
      }
    });

    return combined.sort((a, b) => a.month - b.month);
  }, [patientData]);

  const heightChartData = useMemo(() => {
    const combined = [...WHO_HEIGHT_BOYS].map(ref => {
      const pData = patientData.find(p => Math.abs(p.month - ref.month) <= 1);
      return {
        ...ref,
        patientHeight: pData?.height
      };
    });
    
    patientData.forEach(p => {
      if (!combined.find(c => c.month === p.month)) {
        combined.push({ month: p.month, patientHeight: p.height } as any);
      }
    });

    return combined.sort((a, b) => a.month - b.month);
  }, [patientData]);

  if (!selectedPatient) return null;

  const isPediatric = selectedPatient.age < 18;

  if (!isPediatric) {
    return (
      <div className="card-panel p-6 flex flex-col items-center justify-center text-center opacity-50 grayscale">
        <Baby className="w-12 h-12 text-slate-200 mb-3" />
        <h3 className="text-slate-900 dark:text-white font-bold">Pediatric Growth Charts</h3>
        <p className="text-xs text-slate-500 mt-1">This tool is only available for pediatric patients (under 18).</p>
      </div>
    );
  }

  return (
    <div className="card-panel p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Baby className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-white">Pediatric Growth Charts (WHO)</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/50">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase">Tracking Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Weight-for-age</h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 10 }} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 10 }} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="p95" stroke="none" fill="#e2e8f0" fillOpacity={0.3} name="95th Percentile" />
                <Area type="monotone" dataKey="p5" stroke="none" fill="#fff" fillOpacity={1} name="5th Percentile" />
                <Line type="monotone" dataKey="m" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="WHO Median" />
                <Line type="monotone" dataKey="patientWeight" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} name="Patient Weight" connectNulls />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Height Chart */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Height-for-age</h4>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={heightChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 10 }} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <YAxis label={{ value: 'cm', angle: -90, position: 'insideLeft', fontSize: 10 }} axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                <Tooltip />
                <Area type="monotone" dataKey="p95" stroke="none" fill="#e2e8f0" fillOpacity={0.3} name="95th Percentile" />
                <Area type="monotone" dataKey="p5" stroke="none" fill="#fff" fillOpacity={1} name="5th Percentile" />
                <Line type="monotone" dataKey="m" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="WHO Median" />
                <Line type="monotone" dataKey="patientHeight" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Patient Height" connectNulls />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex gap-3 items-start">
        <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
        <p className="text-xs text-indigo-900 dark:text-indigo-300 leading-relaxed">
          Growth charts are based on WHO Child Growth Standards (0-5 years). Shaded area represents the 5th to 95th percentile range. 
          Values outside this range may require clinical evaluation.
        </p>
      </div>
    </div>
  );
}
