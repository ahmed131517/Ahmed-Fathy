import React from 'react';
import { X, History, Trash2 } from 'lucide-react';

interface HistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prescriptionHistory: any[];
  setCurrentPrescription: (items: any[]) => void;
}

export function HistoryDialog({
  isOpen,
  onClose,
  prescriptionHistory,
  setCurrentPrescription
}: HistoryDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" /> Prescription History
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-0 overflow-y-auto flex-1">
          {prescriptionHistory.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptionHistory.map((rx) => (
                <div key={rx.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{rx.date}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Prescribed by {rx.physician}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setCurrentPrescription(rx.items.map((item: any) => ({ ...item, id: "item_" + Date.now() + Math.random() })));
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                      Re-order
                    </button>
                  </div>
                  <div className="space-y-2">
                    {rx.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.medication}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-600 dark:text-slate-400">{item.dosage}, {item.frequency}</span>
                      </div>
                    ))}
                  </div>
                  {rx.notes && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      Note: {rx.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No prescription history found for this patient.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
