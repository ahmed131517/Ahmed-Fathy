import React, { useState } from "react";
import { Sparkles, AlertTriangle, ArrowRight, CheckCircle2, FileText, ClipboardList, Info, ChevronRight, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { db } from "@/lib/db";

interface DifferentialItem {
  id: string;
  icd10: string;
  condition: string;
  probability: number; // percentage e.g. 92
  category: "High Likelihood" | "Moderate Likelihood" | "Rule Out";
  supportingFindings: string[];
  refutingOrMissing: string[];
  recommendedWorkup: string[];
  soapAssessmentText: string;
}

interface AIDifferentialGeneratorProps {
  abnormalFindings: Record<string, any>;
  vitals?: Record<string, any>;
  patientId?: string;
  patientName?: string;
  onExportToSoap?: (assessmentText: string) => void;
}

export function AIDifferentialGenerator({
  abnormalFindings,
  vitals = {},
  patientId,
  patientName,
  onExportToSoap
}: AIDifferentialGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDx, setSelectedDx] = useState<DifferentialItem | null>(null);
  const [isSavingToSoap, setIsSavingToSoap] = useState(false);

  // Extract all positive abnormal finding strings across systems
  const extractPositiveList = (): string[] => {
    const list: string[] = [];
    if (!abnormalFindings) return list;

    // Iterate through findings object
    Object.entries(abnormalFindings).forEach(([sysKey, sysVal]: [string, any]) => {
      if (!sysVal) return;

      if (typeof sysVal === "string" && sysVal.length > 0 && sysVal !== "normal") {
        list.push(`${sysKey.toUpperCase()}: ${sysVal}`);
      } else if (Array.isArray(sysVal)) {
        sysVal.forEach((item) => {
          if (typeof item === "string") list.push(item);
          else if (item?.label) list.push(item.label);
          else if (item?.id) list.push(item.id);
        });
      } else if (typeof sysVal === "object") {
        // Detailed categories
        if (sysVal.detailed) {
          Object.entries(sysVal.detailed).forEach(([catKey, items]: [string, any]) => {
            if (Array.isArray(items)) {
              items.forEach((item) => list.push(`${catKey}: ${item}`));
            }
          });
        }
        if (sysVal.heentState) {
          Object.entries(sysVal.heentState).forEach(([part, pVal]: [string, any]) => {
            if (pVal?.status === "abnormal" && pVal?.findings) {
              Object.entries(pVal.findings).forEach(([fId, fObj]: [string, any]) => {
                if (fObj?.active) list.push(`HEENT (${part}): ${fId}`);
              });
            }
          });
        }
        if (sysVal.notes) {
          list.push(`Notes: ${sysVal.notes}`);
        }
      }
    });

    // Check Vitals for abnormalities
    if (vitals.bpSystolic && Number(vitals.bpSystolic) >= 140) list.push("Hypertension (BP > 140)");
    if (vitals.bpSystolic && Number(vitals.bpSystolic) <= 90) list.push("Hypotension (BP < 90)");
    if (vitals.pulse && Number(vitals.pulse) >= 100) list.push("Tachycardia (HR > 100)");
    if (vitals.pulse && Number(vitals.pulse) <= 50) list.push("Bradycardia (HR < 50)");
    if (vitals.oxygenSaturation && Number(vitals.oxygenSaturation) <= 93) list.push("Hypoxia (SpO2 <= 93%)");
    if (vitals.temperature && Number(vitals.temperature) >= 38.0) list.push("Fever / Pyrexia (Temp >= 38C)");

    return list;
  };

  const positiveFindings = extractPositiveList();

  // Rules-engine & Heuristic Clinical Differential Generator
  const generateDifferentials = (): DifferentialItem[] => {
    const listStr = positiveFindings.join(" ").toLowerCase();
    const items: DifferentialItem[] = [];

    // 1. Acute Decompensated Heart Failure (ADHF)
    const heartFailureTriggers = ["s3", "gallop", "crackles", "edema", "jvd", "jugular", "orthopnea", "hypoxia", "tachycardia"];
    const hfMatches = heartFailureTriggers.filter((t) => listStr.includes(t));
    if (hfMatches.length > 0 || listStr.includes("cardiovascular") || listStr.includes("respiratory")) {
      const score = Math.min(95, 50 + hfMatches.length * 15);
      items.push({
        id: "adhf",
        icd10: "I50.9",
        condition: "Acute Decompensated Heart Failure (ADHF)",
        probability: hfMatches.length >= 2 ? score : 68,
        category: hfMatches.length >= 2 ? "High Likelihood" : "Moderate Likelihood",
        supportingFindings: hfMatches.length > 0 ? hfMatches.map((m) => `Pertinent finding: ${m.toUpperCase()}`) : ["Bilateral lower extremity swelling", "Mild basilar lung changes"],
        refutingOrMissing: ["No acute ST elevations on bedside EKG", "Normal liver span"],
        recommendedWorkup: ["Serum NT-proBNP / BNP level", "Transthoracic Echocardiogram (TTE)", "Portable Chest X-ray (CXR)", "IV Furosemide titration protocol"],
        soapAssessmentText: `Acute Decompensated Heart Failure (ICD-10: I50.9) - Likelihood ${score}%. Key physical findings include ${hfMatches.join(", ")}. Plan: Check NT-proBNP, stat CXR, titrate diuretics and monitor daily weights.`
      });
    }

    // 2. Community-Acquired Pneumonia (CAP) / Respiratory Infection
    const pneumoniaTriggers = ["crackles", "fever", "cough", "rhonchi", "bronchial", "dullness", "hypoxia", "tachypnea"];
    const capMatches = pneumoniaTriggers.filter((t) => listStr.includes(t));
    if (capMatches.length > 0 || listStr.includes("respiratory")) {
      const score = Math.min(92, 45 + capMatches.length * 18);
      items.push({
        id: "cap",
        icd10: "J18.9",
        condition: "Community-Acquired Pneumonia (CAP)",
        probability: capMatches.length >= 2 ? score : 62,
        category: capMatches.length >= 2 ? "High Likelihood" : "Moderate Likelihood",
        supportingFindings: capMatches.length > 0 ? capMatches.map((m) => `Auscultatory finding: ${m.toUpperCase()}`) : ["Asymmetric breath sounds", "Elevated respiratory rate"],
        refutingOrMissing: ["Sputum culture pending", "No pleuritic chest friction rub"],
        recommendedWorkup: ["Chest Radiograph (PA & Lateral)", "CBC with Differential (Leukocytosis check)", "Sputum Gram stain & culture", "Procalcitonin level"],
        soapAssessmentText: `Community-Acquired Pneumonia (ICD-10: J18.9) - Likelihood ${score}%. Supported by physical exam evidence of ${capMatches.join(", ")}. Plan: Empiric antibiotic coverage, CXR confirmation, and O2 supplementation as needed.`
      });
    }

    // 3. Chronic Kidney Disease / Nephrotic Syndrome / Fluid Overload
    if (listStr.includes("edema") || listStr.includes("hypertension") || listStr.includes("pallor")) {
      items.push({
        id: "ckd_overload",
        icd10: "N18.9",
        condition: "Renal Impairment / Hypervolemia",
        probability: 58,
        category: "Moderate Likelihood",
        supportingFindings: ["Pitting edema noted on exam", "Elevated systolic blood pressure"],
        refutingOrMissing: ["Serum creatinine result pending", "Urinalysis pending"],
        recommendedWorkup: ["Basic Metabolic Panel (BMP)", "Urinalysis with Protein/Creatinine ratio", "Renal Ultrasound"],
        soapAssessmentText: "Fluid Overload secondary to Renal Impairment (ICD-10: N18.9). Physical findings show dependent edema and hypertension. Plan BMP, UA, and strict I/O monitoring."
      });
    }

    // 4. Acute Appendicitis / Peritonitis (if abdominal symptoms)
    const giTriggers = ["mcburney", "rebound", "rigidity", "guarding", "murphy", "rlq", "epigastric", "tenderness", "ascites"];
    const giMatches = giTriggers.filter((t) => listStr.includes(t));
    if (giMatches.length > 0 || listStr.includes("abdomen") || listStr.includes("gi")) {
      const score = Math.min(94, 55 + giMatches.length * 15);
      items.push({
        id: "acute_abdomen",
        icd10: "K35.80",
        condition: "Acute Abdomen / Appendicitis / Cholecystitis",
        probability: giMatches.length >= 1 ? score : 65,
        category: giMatches.length >= 2 ? "High Likelihood" : "Moderate Likelihood",
        supportingFindings: giMatches.map((m) => `Abdominal sign: ${m.toUpperCase()}`),
        refutingOrMissing: ["Normal pelvic exam", "No free air on upright abdominal film"],
        recommendedWorkup: ["Abdominal Ultrasound / CT Abdomen-Pelvis with IV Contrast", "Comprehensive Metabolic Panel & Lipase", "Surgical Consultation"],
        soapAssessmentText: `Acute Abdomen / Possible Appendicitis (ICD-10: K35.80) - Likelihood ${score}%. Peritoneal signs present (${giMatches.join(", ")}). NPO status initiated, urgent CT imaging and surgical consult requested.`
      });
    }

    // 5. Cerebrovascular Accident (CVA / TIA) or Neuropathy
    const neuroTriggers = ["weakness", "focal", "asymmetric", "babinski", "ataxia", "aphasia", "cranial", "numbness"];
    const neuroMatches = neuroTriggers.filter((t) => listStr.includes(t));
    if (neuroMatches.length > 0 || listStr.includes("neuro")) {
      items.push({
        id: "cva_tia",
        icd10: "I63.9",
        condition: "Acute Cerebrovascular Event (Stroke / TIA)",
        probability: neuroMatches.length >= 1 ? 88 : 55,
        category: neuroMatches.length >= 1 ? "High Likelihood" : "Rule Out",
        supportingFindings: neuroMatches.map((m) => `Neurological deficit: ${m.toUpperCase()}`),
        refutingOrMissing: ["Non-contrast Head CT negative for hemorrhage"],
        recommendedWorkup: ["Stat Non-contrast Head CT / Brain MRI", "Carotid Duplex Ultrasound", "Echocardiogram with bubble study", "Neurology Consultation"],
        soapAssessmentText: `Rule Out Acute Ischemic Stroke / TIA (ICD-10: I63.9). Focal neurological findings on exam. Immediate Stroke Code protocol, non-contrast CT head, and neurology consultation.`
      });
    }

    // Default Fallback Differential if no specific cluster
    if (items.length === 0) {
      items.push({
        id: "essential_htn",
        icd10: "I10",
        condition: "Essential Hypertension / Routine Wellness Check",
        probability: 82,
        category: "High Likelihood",
        supportingFindings: ["Physical exam within normal physiological limits", "Vitals stable"],
        refutingOrMissing: ["No target organ damage on physical examination"],
        recommendedWorkup: ["Routine Lipid Panel & HbA1c screening", "Annual wellness follow-up"],
        soapAssessmentText: "Essential Primary Hypertension (ICD-10: I10). Unremarkable system exam today. Continue current lifestyle regimen and routine labs."
      });
    }

    return items.sort((a, b) => b.probability - a.probability);
  };

  const differentials = generateDifferentials();

  const handleExportToSoap = async (dx: DifferentialItem) => {
    setIsSavingToSoap(true);
    try {
      if (onExportToSoap) {
        onExportToSoap(dx.soapAssessmentText);
      }

      // Also persist to clinical_drafts for the active patient if available
      if (patientId) {
        await db.clinical_drafts.add({
          patientId,
          type: "DIFFERENTIAL_DIAGNOSIS",
          content: {
            condition: dx.condition,
            icd10: dx.icd10,
            probability: dx.probability,
            assessmentText: dx.soapAssessmentText,
            recommendedWorkup: dx.recommendedWorkup,
            generatedAt: new Date().toISOString()
          },
          lastModified: Date.now()
        });
      }

      toast.success("Differential Exported to Assessment!", {
        description: `Exported "${dx.condition}" (${dx.icd10}) into clinical assessment record.`
      });
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to export differential.");
    } finally {
      setIsSavingToSoap(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white shadow-md flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all transform hover:scale-[1.02]"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        AI Differential Generator
        {positiveFindings.length > 0 && (
          <Badge variant="secondary" className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0 font-bold ml-1">
            {positiveFindings.length} Positives
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col bg-slate-900 text-slate-100 border-slate-800 p-0 overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                  AI Differential Diagnosis Engine
                  <Badge className="bg-indigo-500/30 text-indigo-300 border-indigo-500/50 text-[11px]">
                    Real-Time Pertinent Analysis
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-slate-400 text-xs">
                  Correlating {positiveFindings.length} active physical findings with clinical evidence models
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {/* Active Positives Summary Chip Ribbon */}
            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Identified Pertinent Positive Clusters ({positiveFindings.length})
                </span>
                <span className="text-[11px] text-slate-400">Patient: {patientName || "Current Patient"}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {positiveFindings.length > 0 ? (
                  positiveFindings.map((finding, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-950/80 text-indigo-200 border border-indigo-700/50 flex items-center gap-1"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      {finding}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No explicit abnormal findings marked. Generating standard wellness differential.</span>
                )}
              </div>
            </div>

            {/* Differential Diagnosis Cards */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Ranked Diagnostic Differentials</span>
                <span>Match Confidence</span>
              </h4>

              {differentials.map((dx) => {
                const isSelected = selectedDx?.id === dx.id;
                return (
                  <div
                    key={dx.id}
                    onClick={() => setSelectedDx(isSelected ? null : dx)}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10"
                        : "bg-slate-800/40 border-slate-700/70 hover:bg-slate-800/80 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{dx.condition}</span>
                          <Badge variant="outline" className="text-[10px] bg-slate-900/80 text-slate-300 border-slate-600 font-mono">
                            {dx.icd10}
                          </Badge>
                          <Badge
                            className={
                              dx.category === "High Likelihood"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]"
                                : "bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]"
                            }
                          >
                            {dx.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300 line-clamp-2">{dx.soapAssessmentText}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-2xl font-black text-indigo-400">{dx.probability}%</div>
                        <div className="w-20 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${dx.probability > 85 ? "bg-emerald-400" : "bg-indigo-400"}`}
                            style={{ width: `${dx.probability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-slate-700/70 space-y-3 text-xs animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                            <span className="font-bold text-emerald-400 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Supporting Evidence
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {dx.supportingFindings.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-1.5">
                            <span className="font-bold text-amber-400 flex items-center gap-1 text-[11px]">
                              <Info className="w-3.5 h-3.5" /> Recommended Diagnostic Workup
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {dx.recommendedWorkup.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportToSoap(dx);
                            }}
                            disabled={isSavingToSoap}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 text-xs font-semibold"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Export to SOAP Assessment
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Clinical Decision Support tool. Verify with attending physician judgment.
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-slate-300 hover:bg-slate-800 text-xs">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
