import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface MedicationFormCardProps {
  selectedMed: any;
  onClose: () => void;
  onAddMedication: (name: string, form: any) => void;
}

export function MedicationFormCard({ selectedMed, onClose, onAddMedication }: MedicationFormCardProps) {
  if (!selectedMed) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-500/30 shadow-md overflow-hidden animate-in slide-in-from-bottom-4">
      <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
        <h4 className="font-medium text-sm">{selectedMed.name}</h4>
        <button onClick={onClose} className="text-indigo-100 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
        {selectedMed.contraindications && selectedMed.contraindications.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-red-500" /> Contraindications
            </h5>
            <div className="flex flex-wrap gap-1">
              {selectedMed.contraindications.map((c: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded text-[10px] font-medium">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {selectedMed.sideEffects && selectedMed.sideEffects.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Common Side Effects</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400">{selectedMed.sideEffects.join(", ")}</p>
          </div>
        )}

        {selectedMed.interactions && selectedMed.interactions.length > 0 && (
          <div>
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Interactions</h5>
            <p className="text-xs text-slate-600 dark:text-slate-400">{selectedMed.interactions.join(", ")}</p>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Dosage Form</h5>
        {selectedMed.forms.map((form: any) => (
          <button
            key={form.id}
            onClick={() => onAddMedication(selectedMed.name, form)}
            className="w-full text-left p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex justify-between items-center group"
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{form.name}</span>
            {form.minDose && (
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  {form.minDose} - {form.maxDose}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
