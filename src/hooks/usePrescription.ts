import { useState, useMemo, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { medicationService, Drug } from "@/services/medicationService";
import { checkInteractions } from "@/services/interactionService";
import { InteractionResult } from "@/services/ddiService";
import { toast } from "sonner";
import { getGeneratePrescriptionPrompt, getAlternativeMedicationPrompt } from "@/services/aiConfig";
import { generateContentWithRetry } from "../utils/gemini";
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
      if (!selectedPatientId || confirmedDiagnosis) return;
      
      try {
        const latestDiagnosis = await db.diagnoses
          .where('patientId')
          .equals(selectedPatientId)
          .reverse()
          .first();
          
        if (latestDiagnosis) {
          setConfirmedDiagnosis(latestDiagnosis.description || latestDiagnosis.condition);
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
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
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
      let allergies = [];
      try {
        allergies = selectedPatient.allergies && selectedPatient.allergies !== "[object Object]" ? JSON.parse(selectedPatient.allergies) : [];
      } catch (e) {
        allergies = [];
      }
      
      const allergiesStr = allergies.length > 0 ? allergies.map((a: any) => `${a.name} (${a.reaction})`).join(", ") : "None reported";
      
      const prompt = getGeneratePrescriptionPrompt({
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr,
        history: history.map(h => `${h.date}: ${h.type} - ${h.title} - ${h.description}`).join("\n"),
        diagnosis: confirmedDiagnosis || "Not provided",
        existingMedications: patientMedications.map(m => m.name).join(", ")
      });

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "[]");
      setAiSuggestions(data);
    } catch (error) {
      console.error("AI Suggestion failed:", error);
      toast.error("Failed to generate AI suggestions.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGetAlternative = async (suggestion: any, idx: number) => {
    setIsAiLoading(true);
    try {
      const allergiesStr = (() => {
        try {
          const parsed = selectedPatient?.allergies && selectedPatient.allergies !== "[object Object]" ? JSON.parse(selectedPatient.allergies) : [];
          return Array.isArray(parsed) && parsed.length > 0 ? parsed.map((a: any) => `${a.name} (${a.reaction})`).join(", ") : "None reported";
        } catch (e) {
          return "None reported";
        }
      })();

      const prompt = getAlternativeMedicationPrompt(suggestion.medication, confirmedDiagnosis, {
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr
      });
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const alternative = JSON.parse(response.text || "{}");
      if (alternative.medication) {
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
    isAiLoading,
    setIsAiLoading,
    selectedSuggestions,
    setSelectedSuggestions,
    handleAiSuggest,
    handleGetAlternative
  };
}
