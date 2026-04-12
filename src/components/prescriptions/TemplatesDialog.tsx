import React from 'react';
import { X, Trash2, Layout } from 'lucide-react';

interface TemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userTemplates: any[];
  setUserTemplates: (t: any[]) => void;
  prescriptionTemplates: Record<string, any>;
  handleLoadTemplate: (category: string, variant: string) => void;
  handleLoadUserTemplate: (template: any) => void;
  setConfirmModal: (modal: any) => void;
}

export function TemplatesDialog({
  isOpen,
  onClose,
  userTemplates,
  setUserTemplates,
  prescriptionTemplates,
  handleLoadTemplate,
  handleLoadUserTemplate,
  setConfirmModal
}: TemplatesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prescription Templates</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-4">
            {userTemplates.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Templates</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userTemplates.map(template => (
                    <div key={template.id} className="relative group">
                      <button 
                        onClick={() => handleLoadUserTemplate(template)}
                        className="w-full text-left p-3 border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      >
                        <p className="font-bold text-indigo-900 dark:text-indigo-300 text-sm">{template.name}</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">{template.items.length} medications</p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            isOpen: true,
                            title: "Delete Template",
                            message: "Are you sure you want to delete this template?",
                            onConfirm: () => {
                              setUserTemplates(userTemplates.filter(t => t.id !== template.id));
                            }
                          });
                        }}
                        className="absolute top-2 right-2 p-1 text-indigo-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete template"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">System Templates</h4>
            {Object.entries(prescriptionTemplates).map(([key, variants]) => (
              <div key={key} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 capitalize mb-2">{key.replace('-', ' ')}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(variants as any).map(v => (
                    <button 
                      key={v}
                      onClick={() => handleLoadTemplate(key, v)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-md transition-colors"
                    >
                      Variant {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
