import { useState, useEffect } from "react";
import { Sparkles, Loader2, ClipboardCheck, AlertCircle, ChevronRight, X } from "lucide-react";
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { useAISettings } from "@/lib/AISettingsContext";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as Dialog from "@radix-ui/react-dialog";

interface ExaminationGuidanceProps {
  patient: any;
  symptoms: any[];
}

export function ExaminationGuidance({ patient, symptoms }: ExaminationGuidanceProps) {
  const { settings: aiSettings } = useAISettings();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [guidance, setGuidance] = useState<{
    focusedExams: { system: string; rational: string; keySigns: string[] }[];
    clinicalPearls: string[];
    riskFactors: string[];
  } | null>(null);

  useEffect(() => {
    if (patient && !guidance && !isGenerating) {
      generateGuidance();
    }
  }, [patient]);

  const generateLocalGuidance = (patientObj: any, symptomsArr: any[]) => {
    const focusedExams: { system: string; rational: string; keySigns: string[] }[] = [];
    const clinicalPearls: string[] = [];
    const riskFactors: string[] = [];

    const sympText = (symptomsArr || []).map((s: any) => (s.label || s.name || '').toLowerCase()).join(" ");

    if (sympText.includes("cough") || sympText.includes("sob") || sympText.includes("breath") || sympText.includes("chest")) {
      focusedExams.push({
        system: "Respiratory System",
        rational: "Assess for adventitious breath sounds, consolidation, or airway obstruction.",
        keySigns: ["Auscultation (wheezes/crackles)", "Percussion note", "Tactile fremitus", "SpO2 & Respiratory Rate"]
      });
      focusedExams.push({
        system: "Cardiovascular System",
        rational: "Rule out cardiac cause for shortness of breath or chest distress.",
        keySigns: ["Heart sounds (S1, S2, S3/S4)", "Jugular venous pressure (JVP)", "Peripheral edema"]
      });
      clinicalPearls.push("Always evaluate respiratory rate and work of breathing before detailed auscultation.");
    }

    if (sympText.includes("pain") || sympText.includes("abdo") || sympText.includes("nausea") || sympText.includes("vomit")) {
      focusedExams.push({
        system: "Abdominal System",
        rational: "Evaluate for peritoneal signs, organomegaly, or localized tenderness.",
        keySigns: ["Light & deep palpation", "Rebound tenderness / Guarding", "Bowel sounds", "Murphy / McBurney sign if indicated"]
      });
      clinicalPearls.push("Auscultate bowel sounds prior to palpation to avoid altering peristaltic activity.");
    }

    if (sympText.includes("headache") || sympText.includes("dizz") || sympText.includes("numb") || sympText.includes("weak")) {
      focusedExams.push({
        system: "Neurological System",
        rational: "Assess cranial nerves, motor/sensory function, and cerebellar signs.",
        keySigns: ["Cranial nerves II-XII", "Deep tendon reflexes", "Gait & Romberg test", "Focal motor power"]
      });
      clinicalPearls.push("Perform fundoscopy if severe headache or elevated BP is present to rule out papilledema.");
    }

    if (focusedExams.length === 0) {
      focusedExams.push({
        system: "General & Vital Signs",
        rational: "Baseline physiological assessment and general physical appearance.",
        keySigns: ["BP, HR, RR, Temp, SpO2", "Pallor, Jaundice, Cyanosis", "Hydration status"]
      });
      focusedExams.push({
        system: "Cardiopulmonary Screen",
        rational: "Routine screening of heart and lungs based on demographic profile.",
        keySigns: ["Dual heart sounds without murmurs", "Vesicular breath sounds bilaterally", "No peripheral edema"]
      });
    }

    if (patientObj?.age && Number(patientObj.age) > 50) {
      riskFactors.push("Age > 50 (Higher cardiovascular & metabolic risk)");
      riskFactors.push("Screen for hypertension & vascular changes");
    } else {
      riskFactors.push("Standard demographic risk profile");
    }

    if (patientObj?.gender?.toLowerCase() === "female") {
      riskFactors.push("Check relevant gynecological & endocrine history if applicable");
    }

    return {
      focusedExams,
      clinicalPearls: clinicalPearls.length > 0 ? clinicalPearls : [
        "Always correlate physical exam findings with full clinical history.",
        "Ensure patient comfort and proper positioning prior to palpation and auscultation."
      ],
      riskFactors
    };
  };

  const generateGuidance = async () => {
    if (!patient) return;
    
    setIsGenerating(true);
    setError(false);
    setIsFallbackMode(false);

    try {
      const prompt = `Based on the patient profile ${symptoms.length > 0 ? 'and current symptoms' : 'and general context'}, provide focused clinical examination guidance.
      
      Patient: ${patient.age}y ${patient.gender}, ${patient.occupation || 'N/A'}
      Symptoms: ${symptoms.length > 0 ? symptoms.map(s => s.label || s.name || s).join(", ") : 'None reported yet. Provide a standard age/gender appropriate physical exam overview.'}
      
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
        aiSettings,
        "You are a clinical AI. Always respond with only valid JSON."
      );

      if (response) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setGuidance(JSON.parse(jsonMatch[0]));
          return;
        }
      }
      throw new Error("Invalid response format");
    } catch (err: any) {
      console.warn("AI exam guidance unavailable, using structured clinical fallback:", err?.message || err);
      // Fallback to structured clinical guidance when AI service is unavailable or quota exceeded
      setGuidance(generateLocalGuidance(patient, symptoms));
      setIsFallbackMode(true);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 flex items-center justify-center gap-3 mb-6">
        <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        <span className="text-sm font-medium text-indigo-700">AI Analysing clinical context for examination guidance...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Failed to generate AI examination guidance.</span>
        </div>
        <button 
          onClick={generateGuidance}
          className="px-3 py-1.5 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!guidance) return null;

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-3 mb-6 shadow-sm">
        <div className="flex items-center gap-3 text-indigo-900">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold">AI Examination Guidance Ready</h4>
            <p className="text-xs text-indigo-700/80">Personalized examination focus points based on patient profile</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          View Guidance
        </button>
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-3xl bg-white rounded-2xl shadow-2xl p-0 z-50 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-bold text-indigo-900 mb-0.5">AI Examination Guidance</Dialog.Title>
                  <Dialog.Description className="text-xs font-medium text-indigo-700/80">
                    Focused examination recommendations
                  </Dialog.Description>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    generateGuidance();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  Refresh Analysis
                </button>
                <Dialog.Close className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-indigo-700" />
                </Dialog.Close>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="md:col-span-2 space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-emerald-500" />
                  Focused System Examinations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guidance.focusedExams.map((exam, i) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{exam.system}</span>
                        <Badge variant="outline" className="text-[9px] bg-white border-indigo-100 text-indigo-600">Priority</Badge>
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

              <div className="space-y-6">
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

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Relevant Risk Factors</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {guidance.riskFactors.map((factor, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] font-normal py-0.5 px-2 bg-rose-50 text-rose-700 border border-rose-100">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
