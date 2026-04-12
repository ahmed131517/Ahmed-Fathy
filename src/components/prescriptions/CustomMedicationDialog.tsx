import React from 'react';
import { X, PlusCircle } from 'lucide-react';

interface CustomMedicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customMedName: string;
  setCustomMedName: (n: string) => void;
  customMedForm: string;
  setCustomMedForm: (f: string) => void;
  onAdd: (name: string, form: string) => void;
}

export function CustomMedicationDialog({
  isOpen,
  onClose,
  customMedName,
  setCustomMedName,
  customMedForm,
  setCustomMedForm,
  onAdd
}: CustomMedicationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-t-xl">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-600" /> Add Custom Medication
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Medication Name</label>
            <input 
              type="text" 
              value={customMedName}
              onChange={(e) => setCustomMedName(e.target.value)}
              placeholder="e.g., Vitamin C"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Form</label>
            <input 
              type="text" 
              value={customMedForm}
              onChange={(e) => setCustomMedForm(e.target.value)}
              placeholder="e.g., Tablet, Syrup, Injection"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => onAdd(customMedName, customMedForm)}
            className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Add to Prescription
          </button>
        </div>
      </div>
    </div>
  );
}
