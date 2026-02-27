import { Folder, Clock, RefreshCw, FileText, Zap, Printer, MousePointer } from "lucide-react";

export function MedicalRecords() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medical Records</h2>
          <p className="text-slate-500">View patient history and clinical encounters</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Timeline Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Timeline
            </h3>
            <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Patient History Timeline</span>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center text-center bg-slate-50/30">
            <div>
              <div className="w-10 h-10 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-medium text-slate-600">Loading records...</p>
              <p className="text-xs text-slate-400 mt-1">Fetching patient history</p>
            </div>
          </div>
        </div>

        {/* Record Details Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" /> Record Details
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-md text-sm font-medium flex items-center gap-1.5 cursor-not-allowed opacity-50">
                <Zap className="w-3.5 h-3.5" /> AI-report
              </button>
              <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-400 rounded-md text-sm font-medium flex items-center gap-1.5 cursor-not-allowed opacity-50">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center text-center bg-slate-50/30">
            <div className="max-w-xs">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
                <MousePointer className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-600 text-lg">No record selected</p>
              <p className="text-sm text-slate-500 mt-1">Select a record from the timeline to view full clinical details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
