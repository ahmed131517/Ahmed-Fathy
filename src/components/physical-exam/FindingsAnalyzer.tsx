import { useState, useEffect } from "react";
import { Brain, AlertTriangle, Lightbulb, Stethoscope, ArrowRight, Maximize2, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { useAISettings } from "@/lib/AISettingsContext";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";

interface FindingsAnalyzerProps {
  findings: any;
  vitals: any;
}

export function FindingsAnalyzer({ findings, vitals }: FindingsAnalyzerProps) {
  const { settings: aiSettings } = useAISettings();
  const [isMaximized, setIsMaximized] = useState(false);
  const [analysis, setAnalysis] = useState<{
    interpretation: string;
    missingCriticalChecks: string[];
    differentials: string[];
    pathophysiology?: string; // Added for maximized view
    redFlags?: string[]; // Added for maximized view
  } | null>(null);

  // Debounce analysis to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeFindings();
    }, 2000);
    return () => clearTimeout(timer);
  }, [findings, vitals]);

  const analyzeFindings = async () => {
    // Only analyze if there's enough data
    const hasData = Object.values(findings).some((f: any) => f && (Array.isArray(f) ? f.length > 0 : f.status === 'abnormal'));
    if (!hasData) return;

    try {
      const prompt = `Analyze these physical exam findings and vitals. Act as a senior clinical consultant.
      Vitals: ${JSON.stringify(vitals)}
      Findings: ${JSON.stringify(findings)}
      
      Return JSON:
      {
        "interpretation": "1-2 sentence clinical summary",
        "missingCriticalChecks": ["What else should be checked now?"],
        "differentials": ["3 most likely diagnoses based on findings alone"],
        "pathophysiology": "Brief explanation of the mechanisms at play here",
        "redFlags": ["Immediate dangers to exclude"]
      }`;

      const response = await clinicalAIRequest([{ role: "user", content: prompt }], aiSettings);
      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) setAnalysis(JSON.parse(jsonMatch[0]));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!analysis) return null;

  const AnalyzerContent = ({ isFull = false }: { isFull?: boolean }) => (
    <div className={isFull ? "space-y-6" : "space-y-4"}>
      <div>
        <p className={isFull ? "text-sm leading-relaxed text-slate-300 italic" : "text-[11px] leading-relaxed text-slate-300 italic"}>
          "{analysis.interpretation}"
        </p>
      </div>

      {isFull && analysis.pathophysiology && (
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
          <h5 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
            <Lightbulb className="w-4 h-4" /> Pathophysiological Context
          </h5>
          <p className="text-sm text-slate-300 leading-relaxed">
            {analysis.pathophysiology}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h5 className={isFull ? "text-xs font-bold text-slate-500 uppercase flex items-center gap-2" : "text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"}>
          <AlertTriangle className={isFull ? "w-4 h-4 text-amber-500" : "w-3 h-3 text-amber-500"} /> Suggested Next Steps
        </h5>
        <ul className="space-y-1.5">
          {analysis.missingCriticalChecks.map((check, i) => (
            <li key={i} className={isFull ? "text-sm flex items-start gap-3 text-slate-200" : "text-[10px] flex items-center gap-2 text-slate-200"}>
              <div className={isFull ? "w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" : "w-1 h-1 rounded-full bg-indigo-500"} />
              {check}
            </li>
          ))}
        </ul>
      </div>

      {isFull && analysis.redFlags && (
        <div className="space-y-3">
          <h5 className="text-xs font-bold text-red-400 uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Critical Red Flags to Exclude
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.redFlags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-xs text-red-200">
                <X className="w-3 h-3" /> {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2 border-t border-slate-800">
        <h5 className={isFull ? "text-xs font-bold text-slate-500 uppercase flex items-center gap-2" : "text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"}>
          <Stethoscope className={isFull ? "w-4 h-4 text-indigo-400" : "w-3 h-3 text-indigo-400"} /> Emergent Considerations
        </h5>
        <div className="flex flex-wrap gap-2">
          {analysis.differentials.map((dx, i) => (
            <span key={i} className={isFull ? "text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium" : "text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"}>
              {dx}
            </span>
          ))}
        </div>
      </div>

      {!isFull && (
        <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-2 mt-2">
          Review Differential Grid <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900 text-white rounded-xl p-4 space-y-4 shadow-xl border border-slate-800 max-h-[500px] overflow-y-auto scrollbar-hide"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Clinical Intelligence</h4>
          </div>
          <button 
            onClick={() => setIsMaximized(true)}
            className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <AnalyzerContent />
      </motion.div>

      <Dialog.Root open={isMaximized} onOpenChange={setIsMaximized}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-0 z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-xl">
                    <Brain className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <Dialog.Title className="text-lg font-bold text-white mb-0.5">Clinical Analysis & Guidance</Dialog.Title>
                    <Dialog.Description className="text-xs text-slate-400">AI-powered diagnostic support based on live observation</Dialog.Description>
                  </div>
                </div>
                <Dialog.Close className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </Dialog.Close>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <AnalyzerContent isFull={true} />
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Real-time analysis active
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsMaximized(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                  <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20">
                    Apply to Differential
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
