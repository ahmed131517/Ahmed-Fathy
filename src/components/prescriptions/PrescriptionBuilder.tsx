import React from 'react';
import { 
  ShoppingCart, Trash2, AlertCircle, FileText, 
  Hash, Clock, Calendar, Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

interface PrescriptionBuilderProps {
  currentPrescription: any[];
  handleRemoveFromPrescription: (id: string) => void;
  handleUpdatePrescriptionItem: (id: string, field: string, value: string) => void;
  prescriptionNotes: string;
  setPrescriptionNotes: (n: string) => void;
  refills: string;
  setRefills: (r: string) => void;
  interactionAlerts: string[];
  handleSaveAsTemplate: () => void;
  handleSavePrescription: () => void;
}

export function PrescriptionBuilder({
  currentPrescription,
  handleRemoveFromPrescription,
  handleUpdatePrescriptionItem,
  prescriptionNotes,
  setPrescriptionNotes,
  refills,
  setRefills,
  interactionAlerts,
  handleSaveAsTemplate,
  handleSavePrescription
}: PrescriptionBuilderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <FileText className="w-8 h-8" />
          <span className="text-xl font-bold tracking-widest">PRESCRIPTION</span>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={handleSaveAsTemplate}
            className="px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded border border-indigo-200 dark:border-indigo-500/30 transition-colors"
          >
            Save as Template
          </button>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
            <span className="text-sm font-medium text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rx ID</label>
            <span className="text-sm font-medium text-slate-900 dark:text-white">#NEW</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-white dark:bg-slate-900">
        <div className="flex-1 mb-6">
          {interactionAlerts.length > 0 && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-4 rounded-xl mb-6">
              <h4 className="text-red-800 dark:text-red-400 font-semibold flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" /> Potential Drug Interactions
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                {interactionAlerts.map((alert, i) => <li key={i}>{alert}</li>)}
              </ul>
            </div>
          )}
          {currentPrescription.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
              <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
              <p className="font-medium text-slate-600 dark:text-slate-400 text-lg">No medications added yet</p>
              <p className="text-sm mt-1">Select a medication from the catalog to begin.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentPrescription.map((item) => (
                <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 dark:hover:border-indigo-500/30 group">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {item.form}
                      </span>
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white m-0">{item.medication}</h4>
                    </div>
                    <button 
                      onClick={() => handleRemoveFromPrescription(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage</label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={item.dosage}
                            onChange={(e) => handleUpdatePrescriptionItem(item.id, 'dosage', e.target.value)}
                            placeholder="e.g., 500mg"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={item.frequency}
                            onChange={(e) => handleUpdatePrescriptionItem(item.id, 'frequency', e.target.value)}
                            placeholder="e.g., BID"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={item.duration}
                            onChange={(e) => handleUpdatePrescriptionItem(item.id, 'duration', e.target.value)}
                            placeholder="e.g., 7 days"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Instructions</label>
                        <div className="relative">
                          <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            value={item.instructions}
                            onChange={(e) => handleUpdatePrescriptionItem(item.id, 'instructions', e.target.value)}
                            placeholder="e.g., Take after meals"
                            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t-2 border-slate-100 dark:border-slate-800 pt-6">
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Notes / Instructions</label>
            <Textarea 
              value={prescriptionNotes || ""}
              onChange={(e) => setPrescriptionNotes(e.target.value)}
              placeholder="Enter specific instructions for the patient or pharmacist..."
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[80px] transition-all bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white"
            ></Textarea>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Refills</label>
              <input 
                type="number" 
                value={refills}
                onChange={(e) => setRefills(e.target.value)}
                min="0"
                className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic</label>
              <input 
                type="text" 
                defaultValue="Physician Hiclinic"
                className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor</label>
              <input 
                type="text" 
                defaultValue="Dr. Ahmed Fathy"
                className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
