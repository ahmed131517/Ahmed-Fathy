import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { PrescriptionPreview } from '@/components/PrescriptionPreview';

interface PrescriptionPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: any;
  vitals: any;
  diagnosis: string;
  currentPrescription: any[];
  onSaveAndPrint: () => void;
}

export function PrescriptionPreviewDialog({
  isOpen,
  onClose,
  patientData,
  vitals,
  diagnosis,
  currentPrescription,
  onSaveAndPrint
}: PrescriptionPreviewDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0 print:static print:block print-modal">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:max-h-none print:static print:block">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center no-print">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Prescription Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 bg-slate-100 dark:bg-slate-950 print:bg-white print:p-0 print:overflow-visible">
          <div id="prescription-to-print" className="print:m-0">
            <PrescriptionPreview data={{
              id: patientData?.id || "PREVIEW",
              name: patientData?.name || "",
              age: String(patientData?.age || ""),
              gender: patientData?.gender || "",
              contact: patientData?.phone || "",
              ph: vitals.ph,
              co: vitals.co,
              bp: vitals.bp,
              p: vitals.p,
              temp: vitals.temp,
              rr: vitals.rr,
              sao2: vitals.sao2,
              rbs: vitals.rbs,
              oe: vitals.oe,
              dx: diagnosis || "",
              medications: currentPrescription.map(item => ({
                name: item.medication,
                concentration: item.concentration || item.form,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions
              }))
            }} />
          </div>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900 rounded-b-xl no-print">
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors"
            >
              Close Preview
            </button>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => {
                setTimeout(() => {
                  window.focus();
                  window.print();
                }, 100);
              }} 
              className="px-6 py-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Printer className="w-5 h-5" /> Print Only
            </button>
            <button 
              onClick={onSaveAndPrint} 
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <CheckCircle className="w-5 h-5" /> Save & Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
