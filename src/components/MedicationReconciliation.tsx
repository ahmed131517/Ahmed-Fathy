import React from 'react';
import { Prescription } from '@/data/patients';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle } from 'lucide-react';

interface MedicationReconciliationProps {
  medications: Prescription[];
  onUpdateStatus: (medicationId: string, status: Prescription['status']) => void;
}

const frequencyMap: Record<string, string> = {
  'BID': 'Twice a day',
  'TID': 'Three times a day',
  'Daily': 'Once a day',
  'QID': 'Four times a day',
  'PRN': 'As needed'
};

export const MedicationReconciliation: React.FC<MedicationReconciliationProps> = ({ medications, onUpdateStatus }) => {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-800">Medication Reconciliation</h4>
      {medications.map((med, index) => (
        <div key={med.medicationId || `med-${index}`} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900">{med.name} <span className="text-xs text-slate-500">{med.dosage} {med.route}</span></p>
            <p className="text-xs text-slate-600">{frequencyMap[med.frequency] || med.frequency}</p>
            <p className="text-[10px] text-slate-400">Status: {med.status}</p>
          </div>
          <div className="flex gap-2">
            {med.status === 'active' && (
              <>
                <button onClick={() => onUpdateStatus(med.medicationId, 'completed')} className="p-1 text-green-600 hover:bg-green-50 rounded">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => onUpdateStatus(med.medicationId, 'discontinued')} className="p-1 text-red-600 hover:bg-red-50 rounded">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
