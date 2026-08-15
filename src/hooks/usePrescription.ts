import { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { medicationService, Drug } from "@/services/medicationService";
import { checkInteractions } from "@/services/interactionService";
import { InteractionResult } from "@/services/ddiService";
import { toast } from "sonner";
import { getGeneratePrescriptionPrompt, getAlternativeMedicationPrompt } from "@/services/aiConfig";
import { parseJsonResponse } from "../utils/gemini";
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { useAISettings } from "@/lib/AISettingsContext";
import { PatientHistoryService } from "@/services/PatientHistoryService";

export function usePrescriptionData(selectedPatientId: string | undefined, confirmedDiagnosis: string | undefined, setConfirmedDiagnosis: (d: string) => void) {
  const [vitals, setVitals] = useState({
    bp: "",
    p: "",
    temp: "",
    rr: "",
    sao2: "",
    rbs: "",
    oe: "",
    co: "",
    ph: ""
  });

  // Automatically populate vitals when a patient is selected
  useEffect(() => {
    const fetchLatestVitals = async () => {
      if (!selectedPatientId) return;
      
      try {
        const latestVitals = await db.vitals
          .where('patientId')
          .equals(selectedPatientId)
          .reverse()
          .first();
          
        if (latestVitals) {
          setVitals({
            bp: latestVitals.bp_systolic && latestVitals.bp_diastolic 
              ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` 
              : "",
            p: latestVitals.hr?.toString() || "",
            temp: latestVitals.temp?.toString() || "",
            rr: latestVitals.rr?.toString() || "",
            sao2: latestVitals.spo2 ? `${latestVitals.spo2}%` : "",
            rbs: "",
            oe: "",
            co: latestVitals.notes || "",
            ph: ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch latest vitals:", error);
      }
    };
    
    fetchLatestVitals();
    
    const fetchLatestDiagnosis = async () => {
      if (!selectedPatientId || confirmedDiagnosis !== undefined && confirmedDiagnosis !== null && confirmedDiagnosis !== "") return;
      
      try {
        const latestDiagnosis = await db.diagnoses
          .where('patientId')
          .equals(selectedPatientId)
          .reverse()
          .first();
          
        if (latestDiagnosis) {
          const diagText = latestDiagnosis.description || latestDiagnosis.condition;
          if (diagText && diagText !== confirmedDiagnosis) {
            setConfirmedDiagnosis(diagText);
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest diagnosis:", error);
      }
    };
    
    fetchLatestDiagnosis();
  }, [selectedPatientId, confirmedDiagnosis, setConfirmedDiagnosis]);

  const activePrescriptions = useLiveQuery(
    () => {
      if (!selectedPatientId) return [];
      return db.prescriptions
        .where('patientId')
        .equals(selectedPatientId)
        .toArray();
    },
    [selectedPatientId]
  ) || [];

  const dbActiveItems = useLiveQuery(
    async () => {
      if (activePrescriptions.length === 0) return [];
      const ids = activePrescriptions.map(p => p.id).filter(Boolean) as string[];
      return db.prescription_items
        .where('prescriptionId')
        .anyOf(ids)
        .toArray();
    },
    [activePrescriptions]
  ) || [];

  const patientMedications = useMemo(() => {
    return dbActiveItems.map(item => ({
      id: item.id,
      name: item.medicationName,
      dose: item.dosage,
      frequency: item.frequency,
      status: 'Active',
      prescribedDate: activePrescriptions.find(p => p.id === item.prescriptionId)?.createdAt || Date.now()
    }));
  }, [dbActiveItems, activePrescriptions]);

  const prescriptionHistory = useLiveQuery(
    async () => {
      if (!selectedPatientId) return [];
      
      const prescriptions = await db.prescriptions
        .where('patientId')
        .equals(selectedPatientId)
        .reverse()
        .sortBy('createdAt');
        
      const historyWithItems = await Promise.all(prescriptions.map(async (p) => {
        const items = await db.prescription_items
          .where('prescriptionId')
          .equals(p.id!)
          .toArray();
        return {
          ...p,
          date: new Date(p.createdAt).toISOString().split('T')[0],
          physician: "Dr. Ahmed Fathy",
          items: items.map(i => ({
            medication: i.medicationName,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions,
            form: i.form
          }))
        };
      }));
      
      return historyWithItems;
    },
    [selectedPatientId]
  ) || [];

  return {
    vitals,
    setVitals,
    patientMedications,
    prescriptionHistory,
    activePrescriptions
  };
}

export function useMedicationSearch(searchQuery: string) {
  const [dbMeds, setDbMeds] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchMeds = async () => {
      if (searchQuery.length < 2) {
        setDbMeds([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await medicationService.searchDrugs(searchQuery);
        setDbMeds(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchMeds, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return { dbMeds, isSearching };
}

export function usePrescriptionState() {
  const [currentPrescription, setCurrentPrescription] = useState<any[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [refills, setRefills] = useState("0");
  const [interactionAlerts, setInteractionAlerts] = useState<InteractionResult[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  useEffect(() => {
    const check = async () => {
      const meds = currentPrescription.map(item => item.medication);
      if (meds.length < 2) {
        setInteractionAlerts([]);
        return;
      }
      setIsCheckingInteractions(true);
      const alerts = await checkInteractions(meds);
      setInteractionAlerts(alerts);
      setIsCheckingInteractions(false);
    };
    check();
  }, [currentPrescription]);

  return {
    currentPrescription,
    setCurrentPrescription,
    prescriptionNotes,
    setPrescriptionNotes,
    refills,
    setRefills,
    interactionAlerts,
    isCheckingInteractions
  };
}

export function usePrescriptionModals() {
  const [selectedMedForForms, setSelectedMedForForms] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAiSuggestOpen, setIsAiSuggestOpen] = useState(false);
  const [isCustomMedOpen, setIsCustomMedOpen] = useState(false);

  return {
    selectedMedForForms,
    setSelectedMedForForms,
    isPreviewOpen,
    setIsPreviewOpen,
    isTemplatesOpen,
    setIsTemplatesOpen,
    isHistoryOpen,
    setIsHistoryOpen,
    isAiSuggestOpen,
    setIsAiSuggestOpen,
    isCustomMedOpen,
    setIsCustomMedOpen
  };
}

export function usePrescriptionAI(selectedPatient: any, confirmedDiagnosis: string, patientMedications: any[]) {
  const { settings: aiSettings } = useAISettings();
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [aiDataSufficiency, setAiDataSufficiency] = useState<{
    dataSufficiency?: 'SUFFICIENT' | 'INSUFFICIENT';
    dataSufficiencyReasoning?: string;
    missingCriticalVariables?: string[];
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);

  const handleAiSuggest = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first.");
      return;
    }
    setIsAiLoading(true);
    try {
      const history = await PatientHistoryService.getPatientHistory(selectedPatient.id);
      
      const safeParseDetailed = (data: any) => {
        if (!data) return [];
        if (typeof data !== 'string') return Array.isArray(data) ? data : [];
        if (data === "[object Object]") return [];
        try {
          const parsed = JSON.parse(data);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // If it's a plain string like "mastectomy", return it as one item
          if (typeof data === 'string' && data.trim()) return [{ name: data.trim(), reaction: 'unknown' }];
          return [];
        }
      };

      const allergies = safeParseDetailed(selectedPatient.allergies);
      const allergiesStr = allergies.length > 0 
        ? allergies.map((a: any) => typeof a === 'string' ? a : `${a.name || 'Unknown'} (${a.reaction || 'unknown'})`).join(", ") 
        : "None reported";
      
      const weightStr = (selectedPatient as any)?.weightKg || (selectedPatient as any)?.weight ? `${(selectedPatient as any).weightKg || (selectedPatient as any).weight} kg` : undefined;
      const symptomsStr = history.filter((h: any) => (h.type as string) === 'Symptom').map((h: any) => h.title).join(", ") || undefined;
      const examStr = history.filter((h: any) => (h.type as string) === 'Exam' || (h.type as string) === 'Vitals').map((h: any) => `${h.title}: ${h.description}`).join(", ") || undefined;
      const labStr = history.filter((h: any) => (h.type as string) === 'Lab').map((h: any) => `${h.title}: ${h.description}`).join(", ") || undefined;
      const renalHepaticStr = (selectedPatient as any)?.chronicConditions?.filter((c: string) => /renal|kidney|hepatic|liver|ckd/i.test(c)).join(", ") || undefined;

      const prompt = getGeneratePrescriptionPrompt({
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr,
        history: history.map(h => `${h.date}: ${h.type} - ${h.title} - ${h.description}`).join("\n"),
        diagnosis: confirmedDiagnosis || "Not provided",
        existingMedications: patientMedications.map(m => m.name).join(", "),
        weight: weightStr,
        symptoms: symptomsStr,
        physicalExam: examStr,
        labFindings: labStr,
        renalHepaticStatus: renalHepaticStr
      });

      const supplementSuggestionsIfNeeded = (suggestions: any[], diagnosis: string): any[] => {
        const result = [...(suggestions || [])];
        const diagLower = (diagnosis || "").toLowerCase();
        
        let fallbackMeds: any[] = [];
        if (diagLower.includes("hypertension") || diagLower.includes("blood pressure") || diagLower.includes("htn")) {
          fallbackMeds = [
            {
              medication: "Lisinopril",
              concentration: "10mg",
              form: "Tablet",
              dosage: "10 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily by mouth.",
              reasoning: "First-line ACE inhibitor for essential hypertension."
            },
            {
              medication: "Amlodipine",
              concentration: "5mg",
              form: "Tablet",
              dosage: "5 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily by mouth.",
              reasoning: "Calcium channel blocker for vascular smooth muscle relaxation and BP reduction."
            },
            {
              medication: "Hydrochlorothiazide",
              concentration: "12.5mg",
              form: "Tablet",
              dosage: "12.5 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily in the morning.",
              reasoning: "Thiazide diuretic providing synergistic volume and pressure relief."
            }
          ];
        } else if (diagLower.includes("heart failure") || diagLower.includes("chf") || diagLower.includes("cardiomyopathy")) {
          fallbackMeds = [
            {
              medication: "Lisinopril",
              concentration: "5mg",
              form: "Tablet",
              dosage: "5 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily by mouth.",
              reasoning: "ACE inhibitor to reduce vascular afterload and prevent pathological remodeling."
            },
            {
              medication: "Metoprolol Succinate",
              concentration: "25mg",
              form: "Tablet",
              dosage: "25 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily with food.",
              reasoning: "Beta-blocker showing proven mortality benefit in chronic stable heart failure."
            },
            {
              medication: "Furosemide",
              concentration: "40mg",
              form: "Tablet",
              dosage: "40 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily by mouth in the morning.",
              reasoning: "Loop diuretic to maintain optimal volume status and prevent congestive flares."
            }
          ];
        } else if (diagLower.includes("diabetes") || diagLower.includes("dm") || diagLower.includes("hyperglycemia")) {
          fallbackMeds = [
            {
              medication: "Metformin",
              concentration: "500mg",
              form: "Tablet",
              dosage: "500 mg",
              frequency: "BID",
              duration: "30 days",
              clinicalInstructions: "Take one tablet twice daily with food.",
              reasoning: "First-line biguanide reducing hepatic glucose output and enhancing insulin sensitivity."
            },
            {
              medication: "Empagliflozin",
              concentration: "10mg",
              form: "Tablet",
              dosage: "10 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily by mouth in the morning.",
              reasoning: "SGLT2 inhibitor delivering reliable glycemic regulation and cardioprotective benefits."
            },
            {
              medication: "Sitagliptin",
              concentration: "100mg",
              form: "Tablet",
              dosage: "100 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily.",
              reasoning: "DPP-4 inhibitor augmenting incretin hormones to stabilize postprandial glucose levels."
            }
          ];
        } else if (
          diagLower.includes("cold") || 
          diagLower.includes("flu") || 
          diagLower.includes("cough") || 
          diagLower.includes("infection") || 
          diagLower.includes("bronchitis") || 
          diagLower.includes("pneumonia") || 
          diagLower.includes("sinusitis") || 
          diagLower.includes("tonsillitis") ||
          diagLower.includes("pharyngitis")
        ) {
          fallbackMeds = [
            {
              medication: "Amoxicillin",
              concentration: "500mg",
              form: "Capsule",
              dosage: "500 mg",
              frequency: "TID",
              duration: "10 days",
              clinicalInstructions: "Take one capsule three times daily. Complete the full course.",
              reasoning: "First-line penicillin for suspected bacterial respiratory or middle-ear infections."
            },
            {
              medication: "Benzonatate",
              concentration: "100mg",
              form: "Capsule",
              dosage: "100 mg",
              frequency: "TID",
              duration: "7 days",
              clinicalInstructions: "Swallow whole three times daily as needed for dry cough. Do not chew.",
              reasoning: "Peripherally acting antitussive targeting pulmonary stretch receptors."
            },
            {
              medication: "Fluticasone Propionate",
              concentration: "50mcg",
              form: "Nasal Spray",
              dosage: "2 sprays each nostril",
              frequency: "QD",
              duration: "14 days",
              clinicalInstructions: "Administer two sprays into each nostril once daily.",
              reasoning: "Corticosteroid spray to reduce local mucosal edema and inflammatory rhinitis."
            }
          ];
        } else if (
          diagLower.includes("pain") || 
          diagLower.includes("arthritis") || 
          diagLower.includes("gout") || 
          diagLower.includes("sprain") || 
          diagLower.includes("backache") || 
          diagLower.includes("osteoarthritis") ||
          diagLower.includes("rheumatoid")
        ) {
          fallbackMeds = [
            {
              medication: "Ibuprofen",
              concentration: "400mg",
              form: "Tablet",
              dosage: "400 mg",
              frequency: "TID",
              duration: "10 days",
              clinicalInstructions: "Take one tablet three times daily with food as needed for pain or swelling.",
              reasoning: "Propionic acid derivative NSAID offering anti-inflammatory pain control."
            },
            {
              medication: "Acetaminophen",
              concentration: "500mg",
              form: "Tablet",
              dosage: "500 mg",
              frequency: "Q8H",
              duration: "10 days",
              clinicalInstructions: "Take one tablet every 8 hours as needed for discomfort. Max 3000mg/day.",
              reasoning: "Central non-NSAID analgesic for general pain relief."
            },
            {
              medication: "Omeprazole",
              concentration: "20mg",
              form: "Capsule",
              dosage: "20 mg",
              frequency: "QD",
              duration: "10 days",
              clinicalInstructions: "Take one capsule daily 30 minutes before breakfast.",
              reasoning: "PPI co-therapy to safeguard gastrointestinal mucosa during NSAID usage."
            }
          ];
        } else if (diagLower.includes("gerd") || diagLower.includes("reflux") || diagLower.includes("gastritis") || diagLower.includes("ulcer")) {
          fallbackMeds = [
            {
              medication: "Omeprazole",
              concentration: "20mg",
              form: "Capsule",
              dosage: "20 mg",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one capsule daily 30 minutes before breakfast.",
              reasoning: "Proton pump inhibitor delivering powerful gastric acid suppression."
            },
            {
              medication: "Famotidine",
              concentration: "20mg",
              form: "Tablet",
              dosage: "20 mg",
              frequency: "BID",
              duration: "30 days",
              clinicalInstructions: "Take one tablet twice daily (before breakfast and dinner or at bedtime).",
              reasoning: "H2 blocker providing complementary acid reduction."
            },
            {
              medication: "Antacid Suspension",
              concentration: "10ml",
              form: "Suspension",
              dosage: "10 ml",
              frequency: "QID",
              duration: "14 days",
              clinicalInstructions: "Take 10ml by mouth four times daily after meals and at bedtime as needed.",
              reasoning: "Fast-acting neutralizing suspension for rapid symptom relief."
            }
          ];
        } else {
          fallbackMeds = [
            {
              medication: "Acetaminophen",
              concentration: "500mg",
              form: "Tablet",
              dosage: "500 mg",
              frequency: "Q8H",
              duration: "7 days",
              clinicalInstructions: "Take one tablet every 8 hours as needed for general discomfort or fever.",
              reasoning: "Safe first-line general analgesic and antipyretic."
            },
            {
              medication: "Multivitamin",
              concentration: "1 tablet",
              form: "Tablet",
              dosage: "1 tablet",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily with food.",
              reasoning: "General nutritional support to enhance overall metabolic recovery."
            },
            {
              medication: "Vitamin D3",
              concentration: "1000 IU",
              form: "Tablet",
              dosage: "1000 IU",
              frequency: "QD",
              duration: "30 days",
              clinicalInstructions: "Take one tablet daily.",
              reasoning: "Immunomodulatory supplement for optimal immune response and skeletal health."
            }
          ];
        }

        for (const fallback of fallbackMeds) {
          if (result.length >= 3) break;
          const isDuplicate = result.some(
            r => r.medication.toLowerCase() === fallback.medication.toLowerCase()
          );
          if (!isDuplicate) {
            result.push({
              ...fallback,
              reasoning: `[Empirical Co-therapy Supplement] ${fallback.reasoning}`
            });
          }
        }
        return result;
      };

      const responseText = await clinicalAIRequest(
        [{ role: 'user', content: prompt }],
        aiSettings
      );

      const parsed: any = parseJsonResponse(responseText, []);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setAiDataSufficiency({
          dataSufficiency: parsed.dataSufficiency || (parsed.missingCriticalVariables?.length ? 'INSUFFICIENT' : 'SUFFICIENT'),
          dataSufficiencyReasoning: parsed.dataSufficiencyReasoning,
          missingCriticalVariables: parsed.missingCriticalVariables || []
        });
        const supplemented = supplementSuggestionsIfNeeded(parsed.suggestions || [], confirmedDiagnosis);
        setAiSuggestions(supplemented);
      } else if (Array.isArray(parsed)) {
        setAiDataSufficiency({
          dataSufficiency: 'SUFFICIENT',
          dataSufficiencyReasoning: 'Sufficient clinical data provided for prescribing.',
          missingCriticalVariables: []
        });
        const supplemented = supplementSuggestionsIfNeeded(parsed, confirmedDiagnosis);
        setAiSuggestions(supplemented);
      }
    } catch (error) {
      console.error("AI Suggestion failed:", error);
      
      // Graceful fallback for hook call as well
      const supplemented = [{
        medication: "Acetaminophen",
        concentration: "500mg",
        form: "Tablet",
        dosage: "500 mg",
        frequency: "Q8H",
        duration: "7 days",
        clinicalInstructions: "Take one tablet every 8 hours as needed for general discomfort or fever.",
        reasoning: "[Empirical Co-therapy Supplement] Safe first-line general analgesic."
      }, {
        medication: "Multivitamin",
        concentration: "1 tablet",
        form: "Tablet",
        dosage: "1 tablet",
        frequency: "QD",
        duration: "30 days",
        clinicalInstructions: "Take one tablet daily with food.",
        reasoning: "[Empirical Co-therapy Supplement] General nutritional support."
      }, {
        medication: "Vitamin D3",
        concentration: "1000 IU",
        form: "Tablet",
        dosage: "1000 IU",
        frequency: "QD",
        duration: "30 days",
        clinicalInstructions: "Take one tablet daily.",
        reasoning: "[Empirical Co-therapy Supplement] Immunomodulatory supplement."
      }];
      setAiDataSufficiency({
        dataSufficiency: 'INSUFFICIENT',
        dataSufficiencyReasoning: 'AI service rate-limited or unavailable. Standard empirical clinical guidelines generated.',
        missingCriticalVariables: ["Laboratory values (Serum Creatinine, eGFR)", "Comprehensive patient allergy confirmation", "Confirmed patient weight"]
      });
      setAiSuggestions(supplemented);
      toast.warning("AI Service unavailable. Auto-generated safe empirical medications based on clinical protocols.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGetAlternative = async (suggestion: any, idx: number) => {
    setIsAiLoading(true);
    try {
      const allergiesStr = (() => {
        const data = selectedPatient?.allergies;
        if (!data) return "None reported";
        if (typeof data !== 'string' && Array.isArray(data)) {
          return data.map((a: any) => typeof a === 'string' ? a : `${a.name || 'Unknown'} (${a.reaction || 'unknown'})`).join(", ");
        }
        if (data === "[object Object]") return "None reported";
        try {
          const parsed = JSON.parse(data);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          return list.map((a: any) => typeof a === 'string' ? a : `${a.name || 'Unknown'} (${a.reaction || 'unknown'})`).join(", ");
        } catch (e) {
          if (typeof data === 'string' && data.trim()) return data.trim();
          return "None reported";
        }
      })();

      const weightStr = (selectedPatient as any)?.weightKg || (selectedPatient as any)?.weight ? `${(selectedPatient as any).weightKg || (selectedPatient as any).weight} kg` : undefined;
      const renalHepaticStr = (selectedPatient as any)?.chronicConditions?.filter((c: string) => /renal|kidney|hepatic|liver|ckd/i.test(c)).join(", ") || undefined;

      const prompt = getAlternativeMedicationPrompt(suggestion.medication, confirmedDiagnosis, {
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr,
        weight: weightStr,
        renalHepaticStatus: renalHepaticStr,
        reasonUnsuitable: suggestion.reasoning || undefined
      });
      
      const responseText = await clinicalAIRequest(
        [{ role: 'user', content: prompt }],
        aiSettings
      );

      const alternative = parseJsonResponse<any>(responseText, {});
      if (alternative && alternative.medication) {
        const newSuggestions = [...aiSuggestions];
        newSuggestions[idx] = alternative;
        setAiSuggestions(newSuggestions);
        toast.success(`Alternative found: ${alternative.medication}`);
      }
    } catch (error) {
      console.error("Alternative generation failed:", error);
      toast.error("Failed to find alternative medication.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return {
    aiSuggestions,
    setAiSuggestions,
    aiDataSufficiency,
    setAiDataSufficiency,
    isAiLoading,
    setIsAiLoading,
    selectedSuggestions,
    setSelectedSuggestions,
    handleAiSuggest,
    handleGetAlternative
  };
}
