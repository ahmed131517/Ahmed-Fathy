import { useState, useEffect } from "react";
import { Sparkles, Loader2, ClipboardCheck, AlertCircle, ChevronRight } from "lucide-react";
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { useAISettings } from "@/lib/AISettingsContext";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ExaminationGuidanceProps {
  patient: any;
  symptoms: any[];
}

export function ExaminationGuidance({ patient, symptoms }: ExaminationGuidanceProps) {
  const { settings: aiSettings } = useAISettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [guidance, setGuidance] = useState<{
    focusedExams: { system: string; rational: string; keySigns: string[] }[];
    clinicalPearls: string[];
    riskFactors: string[];
  } | null>(null);

  useEffect(() => {
    if (symptoms.length > 0 && patient && !guidance) {
      generateGuidance();
    }
  }, [symptoms, patient]);

  const generateGuidance = async () => {
    if (symptoms.length === 0 || !patient) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Based on the patient profile and current symptoms, provide focused clinical examination guidance.
      
      Patient: ${patient.age}y ${patient.gender}, ${patient.occupation || 'N/A'}
      Symptoms: ${symptoms.map(s => s.label).join(", ")}
      
      Return a JSON object with:
      {
        "focusedExams": [
          { "system": "System name", "rational": "Why this system is relevant", "keySigns": ["sign 1", "sign 2"] }
        ],
        "clinicalPearls": ["pearl 1", "pearl 2"],
        "riskFactors": ["factor 1"]
      }`;

      const response = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );

      if (response) {
        // Clean up response if needed
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setGuidance(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (error) {
      console.error("Failed to generate exam guidance:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        <span className="text-sm font-medium text-indigo-700">AI Analysing clinical context for examination guidance...</span>
      </div>
    );
  }

  if (!guidance) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-indigo-100 rounded-xl shadow-sm overflow-hidden mb-6"
    >
      <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">AI Examination Guidance</span>
        </div>
        <button 
          onClick={generateGuidance}
          className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Refresh Analysis
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-500" />
            Focused System Examinations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guidance.focusedExams.map((exam, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{exam.system}</span>
                  <Badge variant="outline" className="text-[9px] bg-white">Priority</Badge>
                </div>
                <p className="text-[11px] text-slate-500 italic leading-tight">{exam.rational}</p>
                <div className="flex flex-wrap gap-1">
                  {exam.keySigns.map((sign, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-indigo-100 text-indigo-700 font-medium whitespace-nowrap">
                      {sign}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Clinical Pearls
            </h4>
            <div className="space-y-2">
              {guidance.clinicalPearls.map((pearl, i) => (
                <div key={i} className="flex gap-2">
                  <ChevronRight className="w-3 h-3 text-indigo-400 mt-1 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-normal">{pearl}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Relevant Risk Factors</h4>
            <div className="flex flex-wrap gap-1.5">
              {guidance.riskFactors.map((factor, i) => (
                <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0 px-2 bg-slate-100 text-slate-600 border-none">
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
