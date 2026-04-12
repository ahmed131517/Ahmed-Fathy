import React from 'react';
import { Activity, Clock, AlertCircle } from 'lucide-react';

interface PatientMedicationListProps {
  medications: any[];
}

export function PatientMedicationList({ medications }: PatientMedicationListProps) {
  if (medications.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4 text-indigo-500" /> Active Medications
        </h3>
      </div>
      <div className="p-2 max-h-[200px] overflow-y-auto">
        <div className="space-y-1">
          {medications.map((med) => (
            <div key={med.id} className="p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-slate-700">{med.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-bold uppercase">Active</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <p className="text-[11px] text-slate-500">{med.dose} • {med.frequency}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
