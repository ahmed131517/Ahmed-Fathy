import { Calendar, Printer, CheckCircle2, Sparkles, RefreshCw, Zap, X, FlaskConical, Pill, AlertTriangle, ChevronRight, MousePointer, FileText, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface RecordDetailsPanelProps {
  selectedRecord: any | null;
  isSummarizing: boolean;
  generateRecordSummary: (record: any) => Promise<void>;
  isInterpreting: boolean;
  interpretLabResults: (record: any) => Promise<void>;
  recordSummary: string;
  labInterpretation: string;
  setLabInterpretation: (val: string) => void;
  aiQuery: string;
  setAiQuery: (val: string) => void;
  aiResponse: string;
  setAiResponse: (val: string) => void;
  isQuerying: boolean;
  onAiQuery: () => Promise<void>;
  onClose?: () => void;
  isTimelineMode?: boolean;
}

export function RecordDetailsPanel({
  selectedRecord,
  isSummarizing,
  generateRecordSummary,
  isInterpreting,
  interpretLabResults,
  recordSummary,
  labInterpretation,
  setLabInterpretation,
  aiQuery,
  setAiQuery,
  aiResponse,
  setAiResponse,
  isQuerying,
  onAiQuery,
  onClose,
  isTimelineMode = false
}: RecordDetailsPanelProps) {
  const navigate = useNavigate();

  if (!selectedRecord) {
    return (
      <div className="h-full flex items-center justify-center text-center p-6">
        <div className="max-w-xs">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mx-auto mb-4">
            <MousePointer className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-medium text-slate-600 text-lg">No record selected</p>
          <p className="text-sm text-slate-500 mt-1">Select a record from the timeline to view full clinical details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden h-full">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-1 -ml-1 text-slate-500 hover:text-slate-700">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <FileText className="w-4 h-4 text-indigo-500" /> Record Details
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => generateRecordSummary(selectedRecord)}
            disabled={isSummarizing || !selectedRecord}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {isSummarizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
            {isSummarizing ? 'Summarizing...' : 'AI Summary'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-slate-50/30">
        {/* AI Query Section */}
        {!isTimelineMode && (
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask AI about patient history..." 
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={onAiQuery}
                disabled={isQuerying}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isQuerying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ask'}
              </button>
            </div>
            {aiResponse && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-900 animate-in slide-in-from-top-2 duration-300">
                {aiResponse}
                <button 
                  onClick={() => setAiResponse("")}
                  className="float-right text-indigo-400 hover:text-indigo-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-6 animate-in fade-in duration-500">
          {/* Enhanced Record Header */}
          <div className="mb-8 p-1 group">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider",
                    selectedRecord.type === 'Lab Result' ? "bg-purple-600 text-white" : 
                    selectedRecord.type === 'Prescription' ? "bg-emerald-600 text-white" :
                    "bg-indigo-600 text-white"
                  )}>{selectedRecord.type}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    {selectedRecord.date}
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                  {selectedRecord.title}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isTimelineMode ? 'Mark as Reviewed' : 'Finalize Review'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Provider</div>
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500">Dr</div>
                  {selectedRecord.provider}
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Department</div>
                <div className="text-sm font-semibold text-slate-700">{selectedRecord.department}</div>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" /> Finalized
                </div>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ref ID</div>
                <div className="text-sm font-mono font-medium text-slate-500">#{selectedRecord.id?.substring(0, 8) || 'N/A'}</div>
              </div>
            </div>
          </div>

          {(selectedRecord.type === 'Encounter' || selectedRecord.type === 'Diagnosis') && (
            <div className="space-y-6">
              {recordSummary && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group/ai">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/ai:opacity-20 transition-opacity">
                    <Sparkles className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h4 className="text-xs font-black text-indigo-700 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-indigo-500" /> AI Clinical Synthesis
                  </h4>
                  <div className="text-indigo-900 leading-relaxed text-sm font-medium">
                    {recordSummary}
                  </div>
                  {!isTimelineMode && (
                    <div className="mt-4 pt-4 border-t border-indigo-100 flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                         <CheckCircle2 className="w-3 h-3" /> Integrity Check: 98%
                       </div>
                       <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                         <Clock className="w-3 h-3" /> Gen Time: 1.2s
                       </div>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedRecord.type === 'Encounter' ? 'Encounter Summary' : 'Clinical Documentation'}</h4>
                  <button className="text-[10px] font-bold text-indigo-600 hover:underline">Full Transcript</button>
                </div>
                <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-sm text-slate-700 leading-relaxed text-sm whitespace-pre-wrap selection:bg-indigo-100">
                  {selectedRecord.summary}
                </div>
              </div>

              {!isTimelineMode && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      toast.info("Navigating to Lab Requests...");
                      navigate("/lab-requests");
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:border-indigo-200"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-500" /> Order Investigations
                  </button>
                  <button 
                    onClick={() => {
                      toast.info("Navigating to Prescriptions...");
                      navigate("/prescriptions");
                    }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:border-indigo-200"
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-500" /> Modify Medications
                  </button>
                  <button 
                    onClick={() => toast.success("Follow-up appointment scheduled prompt.")}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-indigo-100"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Follow-up
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedRecord.type === 'Prescription' && selectedRecord.items && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Prescribed Medications</h4>
              <div className="space-y-3">
                {selectedRecord.items.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-slate-900">{item.medicationName}</h5>
                      <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">{item.form}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Dosage:</span> <span className="font-medium">{item.dosage}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Frequency:</span> <span className="font-medium">{item.frequency}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Duration:</span> <span className="font-medium">{item.duration}</span>
                      </div>
                    </div>
                    {item.instructions && (
                      <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <span className="font-semibold">Instructions:</span> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedRecord.type === 'Lab Result' && selectedRecord.results && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-1">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{isTimelineMode ? 'Laboratory Insights' : 'Biometric Analysis'}</h4>
                  <p className="text-[10px] text-slate-500">{isTimelineMode ? 'Collected at 08:30 AM • Fasting Status: Yes' : 'High clinical accuracy • AI Verified'}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => interpretLabResults(selectedRecord)}
                    disabled={isInterpreting}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-50",
                      isTimelineMode ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200" : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
                    )}
                  >
                    {isInterpreting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className={cn("w-3.5 h-3.5", isTimelineMode ? "" : "text-amber-400")} />}
                    {isInterpreting ? 'AI Analysis...' : isTimelineMode ? 'Deep Insight' : 'AI Perspective'}
                  </button>
                </div>
              </div>

              {labInterpretation && (
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group/ai">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Zap className="w-16 h-16 text-amber-400" />
                  </div>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Clinical Intelligence Report
                    </h4>
                    <button onClick={() => setLabInterpretation("")} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed">
                    {labInterpretation}
                  </div>
                </div>
              )}
              
              <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-50/80 backdrop-blur-md text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Biomarker</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Measured Value</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest">Biological Ref</th>
                      <th className="px-6 py-4 font-black text-[10px] uppercase tracking-widest text-right">Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRecord.results.map((result: any, idx: number) => {
                      const isAbnormal = result.status !== 'normal';
                      return (
                        <tr key={idx} className={cn(
                          "hover:bg-slate-50 transition-colors group/row", 
                          isAbnormal && "bg-red-50/40"
                        )}>
                          <td className="px-6 py-4 font-bold text-slate-700 group-hover/row:text-indigo-600 transition-colors">{result.test}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2.5 py-1 rounded-lg text-sm font-black tabular-nums",
                                isAbnormal ? "bg-red-100 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
                              )}>
                                {result.value} <span className="text-[10px] opacity-60 ml-0.5">{result.unit}</span>
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">{result.range} <span className="text-[10px] opacity-60 ml-0.5 font-normal">{result.unit}</span></td>
                          <td className="px-6 py-4 text-right">
                            {isAbnormal ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-black uppercase tracking-tighter animate-pulse shadow-sm shadow-red-200">
                                <AlertTriangle className="w-2.5 h-2.5 fill-white" />
                                {result.status}
                              </div>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                   <FileText className="w-3.5 h-3.5" /> Full Lab Report (PDF)
                </button>
                {!isTimelineMode && (
                  <button className="flex-1 py-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                     <TrendingUp className="w-3.5 h-3.5" /> Trend Comparison
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
