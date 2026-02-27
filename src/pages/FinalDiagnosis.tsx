import { CheckCircle, Activity, Clipboard, Database, Edit3, Cpu, RefreshCw, Printer, Save } from "lucide-react";

export function FinalDiagnosis() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Final Diagnosis & Clinical Decision Support</h2>
          <p className="text-slate-500">Synthesize data and confirm diagnosis</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
            <Printer className="w-4 h-4" /> Print Summary
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Finalize Record
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">Symptoms Summary</h3>
              </div>
              <div className="p-4 text-sm text-slate-500 flex-1 flex items-center justify-center bg-slate-50/30">
                No symptoms recorded.
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800">Physical Examination</h3>
              </div>
              <div className="p-4 text-sm text-slate-500 flex-1 flex items-center justify-center bg-slate-50/30">
                No examination findings recorded.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Laboratory Findings</h3>
            </div>
            <div className="p-4 text-sm text-slate-500 flex-1 flex items-center justify-center bg-slate-50/30 min-h-[100px]">
                No laboratory results available.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-500" />
              <h3 className="font-semibold text-slate-800">Confirmed Diagnosis</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Final Diagnosis (Search or Override)</label>
                <input type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors" placeholder="Type to search ICD-10 codes or enter manually..." />
              </div>
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-2">Clinical Reasoning & Documentation</label>
                <textarea className="w-full flex-1 min-h-[150px] px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors" placeholder="Document your clinical reasoning..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 h-full">
          <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="border-b border-indigo-100 px-4 py-3 flex justify-between items-center bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600" />
                <h3 className="font-semibold text-indigo-900">AI Decision Support</h3>
              </div>
              <button className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-medium hover:bg-indigo-200 flex items-center gap-1.5 transition-colors">
                <RefreshCw className="w-3 h-3" /> Get Suggestions
              </button>
            </div>
            <div className="p-6 flex-1 flex items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">Select a patient and record clinical data to receive AI diagnostic suggestions based on the latest medical guidelines.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
