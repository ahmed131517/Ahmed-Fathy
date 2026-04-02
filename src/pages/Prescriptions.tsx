import { checkInteractions } from "@/services/interactionService";
import { useState, useMemo, useEffect } from "react";
import { 
  FileText, Plus, Layout, Cpu, History, Eye, CheckCircle, 
  Search, ShoppingCart, Trash2, AlertCircle, X, PlusCircle,
  Hash, Clock, Calendar, Info, Sparkles, Loader2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { medicationsDatabase } from "@/data/medications";
import { prescriptionTemplates } from "@/data/templates";
import { usePatient } from "@/lib/PatientContext";
import { generateContentWithRetry } from "../utils/gemini";
import { toast } from "sonner";
import { medicationService, Drug } from "@/services/medicationService";
import { PatientHistoryService } from "@/services/PatientHistoryService";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

// Flatten medications for "All" category
const allMedications = Object.values(medicationsDatabase).flat();

export function Prescriptions() {
  const { selectedPatient, confirmedDiagnosis } = usePatient();
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: () => {} });
  const [promptValue, setPromptValue] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  // State for new prescription being built
  const [currentPrescription, setCurrentPrescription] = useState<any[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [refills, setRefills] = useState("0");
  const [interactionAlerts, setInteractionAlerts] = useState<string[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  
  // State for user-created templates
  const [userTemplates, setUserTemplates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('userTemplates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load templates", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
  }, [userTemplates]);

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

  // Modals and UI states
  const [selectedMedForForms, setSelectedMedForForms] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAiSuggestOpen, setIsAiSuggestOpen] = useState(false);
  const [isCustomMedOpen, setIsCustomMedOpen] = useState(false);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedForm, setCustomMedForm] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);
  const [dbMeds, setDbMeds] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch active medications from database
  const activePrescriptions = useLiveQuery(
    () => {
      if (!selectedPatient) return [];
      const patientId = selectedPatient.id;
      if (!patientId) return [];
      return db.prescriptions
        .where('patientId')
        .equals(patientId)
        .toArray();
    },
    [selectedPatient]
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

  // Fetch medications from database when searching
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

  // Fetch prescription history from database
  const prescriptionHistory = useLiveQuery(
    async () => {
      if (!selectedPatient) return [];
      const patientId = selectedPatient.id;
      if (!patientId) return [];
      
      const prescriptions = await db.prescriptions
        .where('patientId')
        .equals(patientId)
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
    [selectedPatient]
  ) || [];

  const filteredCatalog = useMemo(() => {
    if (searchQuery.length >= 2) return dbMeds;

    let meds = selectedCategory === "all" 
      ? allMedications 
      : medicationsDatabase[selectedCategory] || [];
      
    return meds;
  }, [selectedCategory, searchQuery, dbMeds]);

  const handleMedicationSelect = async (med: any) => {
    if (med.id && typeof med.id === 'number') {
      // It's a DB med
      try {
        const details = await medicationService.getMedicationDetails(med.id);
        // Map DB details to the format expected by the UI
        const mappedMed = {
          id: details.id,
          name: details.generic_name,
          contraindications: details.contraindications,
          sideEffects: details.sideEffects,
          interactions: details.interactions,
          forms: details.brands.map(b => ({ id: `brand_${b.id}`, name: b.brand_name }))
        };
        // If no brands, check strengths or just use generic
        if (mappedMed.forms.length === 0) {
          mappedMed.forms = [{ id: `generic_${details.id}`, name: "Generic" }];
        }
        setSelectedMedForForms(mappedMed);
      } catch (error) {
        console.error("Failed to get med details", error);
        toast.error("Failed to load medication details");
      }
    } else {
      // It's a mock med
      setSelectedMedForForms(med);
    }
  };

  const handleAddMedication = (medName: string, formName: string) => {
    const newItem = {
      id: "item_" + Date.now(),
      medication: medName,
      form: formName,
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    };
    setCurrentPrescription([...currentPrescription, newItem]);
    setSelectedMedForForms(null);
  };

  const handleRemoveFromPrescription = (id: string) => {
    setCurrentPrescription(currentPrescription.filter(m => m.id !== id));
  };

  const handleUpdatePrescriptionItem = (id: string, field: string, value: string) => {
    setCurrentPrescription(currentPrescription.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleLoadTemplate = (templateName: string, variant: string) => {
    const template = prescriptionTemplates[templateName]?.[variant];
    if (template) {
      if (currentPrescription.length > 0) {
        setConfirmModal({
          isOpen: true,
          title: "Load Template",
          message: "Replace current items with template?",
          onConfirm: () => {
            const newItems = template.map(item => ({
              id: "item_" + Date.now() + Math.random(),
              ...item
            }));
            setCurrentPrescription(newItems);
            setIsTemplatesOpen(false);
          }
        });
        return;
      }
      const newItems = template.map(item => ({
        id: "item_" + Date.now() + Math.random(),
        ...item
      }));
      setCurrentPrescription(newItems);
      setIsTemplatesOpen(false);
    }
  };

  const handleSavePrescription = async () => {
    if (currentPrescription.length === 0) {
      toast.error("Please add at least one medication.");
      return;
    }
    
    const incomplete = currentPrescription.some(i => !i.dosage || !i.frequency || !i.duration);
    if (incomplete) {
      toast.error("Please complete all medication details.");
      return;
    }

    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      const timestamp = Date.now();
      const prescriptionId = crypto.randomUUID();

      // Save to local Dexie DB
      await db.prescriptions.add({
        id: prescriptionId,
        patientId: selectedPatient.id,
        diagnosis: confirmedDiagnosis || "",
        notes: prescriptionNotes,
        refills: parseInt(refills),
        status: 'Pending',
        createdAt: timestamp,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });

      for (const item of currentPrescription) {
        await db.prescription_items.add({
          id: crypto.randomUUID(),
          prescriptionId: prescriptionId,
          medicationName: item.medication,
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions,
          form: item.form
        } as any);
      }

      toast.success("Prescription saved successfully!");
      setCurrentPrescription([]);
      setPrescriptionNotes("");
      setRefills("0");
      setActiveTab('active');
    } catch (error) {
      console.error("Failed to save prescription", error);
      toast.error("Failed to save prescription");
    }
  };

  const handleSaveAsTemplate = () => {
    if (currentPrescription.length === 0) {
      toast.error("Add medications to the prescription first.");
      return;
    }
    setPromptValue("");
    setPromptModal({
      isOpen: true,
      title: "Save as Template",
      message: "Enter a name for this template:",
      defaultValue: "",
      onConfirm: (templateName) => {
        if (templateName) {
          const newTemplate = {
            id: "ut-" + Date.now(),
            name: templateName,
            items: currentPrescription.map(({ id, ...rest }) => rest)
          };
          setUserTemplates([...userTemplates, newTemplate]);
          toast.success("Template saved! You can find it in the Templates menu.");
        }
      }
    });
  };

  const handleLoadUserTemplate = (template: any) => {
    if (currentPrescription.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "Load Template",
        message: "Replace current items with template?",
        onConfirm: () => {
          const newItems = template.items.map((item: any) => ({
            id: "item_" + Date.now() + Math.random(),
            ...item
          }));
          setCurrentPrescription(newItems);
          setIsTemplatesOpen(false);
        }
      });
      return;
    }
    const newItems = template.items.map((item: any) => ({
      id: "item_" + Date.now() + Math.random(),
      ...item
    }));
    setCurrentPrescription(newItems);
    setIsTemplatesOpen(false);
  };

  const handleAiSuggest = async () => {
    if (!confirmedDiagnosis) {
      toast.error("Please finalize a diagnosis in the Final Diagnosis page first.");
      return;
    }
    
    setIsAiLoading(true);
    setIsAiSuggestOpen(true);
    try {
      const history = await PatientHistoryService.getPatientHistory(selectedPatient.id);
      const allergies = selectedPatient.allergies ? JSON.parse(selectedPatient.allergies) : [];
      
      const prompt = `As a clinical assistant, generate a structured medical prescription based on the following patient information and diagnosis.
      
      Patient: ${selectedPatient?.name || "Unknown"}
      Age: ${selectedPatient?.age || "N/A"}
      Gender: ${selectedPatient?.gender || "N/A"}
      Weight: [Not provided]
      Allergies: ${allergies.length > 0 ? allergies.map((a: any) => `${a.name} (${a.reaction})`).join(", ") : "None reported"}
      Symptoms: [Not provided]
      Physical Exam: [Not provided]
      Lab Findings: [Not provided]
      Renal/Hepatic Impairment: [Not provided]
      
      Patient History Summary:
      ${history.map(h => `${h.date}: ${h.type} - ${h.title} - ${h.description}`).join("\n")}
      
      Confirmed Diagnosis: ${confirmedDiagnosis || "Not provided"}
      Existing Medications: ${patientMedications.map(m => m.name).join(", ")}
      
      Rules:
      1. The prescription must be medically logical and evidence-based.
      2. Adjust drug dose according to age, weight, sex, allergies, symptoms, physical exam, lab findings, final diagnosis, and renal/hepatic impairment if provided.
      3. Avoid drug interactions.
      4. Prefer first-line guideline-recommended therapies.
      5. Include symptomatic treatment and supportive therapy (fluids/vitamins/supplements) if needed.
      6. Provide alternatives if the first option is contraindicated.
      7. Check for contraindications and avoid unsafe combinations.
      8. Suggest between 3 and 5 appropriate medications. You MUST suggest at least 3 and at most 5 medications.

      Return the suggestions as a JSON array of objects with:
      - medication: string (name)
      - form: string (e.g., Tablet, Capsule)
      - dosage: string (suggested dose)
      - frequency: string (e.g., Daily, BID)
      - duration: string (e.g., 7 days)
      - reasoning: string (brief clinical reasoning, including contraindication checks and interaction avoidance)
      
      Only return the JSON array.`;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "[]");
      setAiSuggestions(data);
      setSelectedSuggestions([]);
    } catch (error) {
      console.error("AI Suggestion failed:", error);
      toast.error("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const applySelectedSuggestions = () => {
    const newItems = selectedSuggestions.map(index => {
      const suggestion = aiSuggestions[index];
      return {
        id: "item_" + Date.now() + Math.random() + index,
        medication: suggestion.medication,
        form: suggestion.form,
        dosage: suggestion.dosage,
        frequency: suggestion.frequency,
        duration: suggestion.duration,
        instructions: ""
      };
    });
    setCurrentPrescription([...currentPrescription, ...newItems]);
    setIsAiSuggestOpen(false);
    setAiSuggestions([]);
    setSelectedSuggestions([]);
  };

  const applyAiSuggestion = (suggestion: any) => {
    const newItem = {
      id: "item_" + Date.now() + Math.random(),
      medication: suggestion.medication,
      form: suggestion.form,
      dosage: suggestion.dosage,
      frequency: suggestion.frequency,
      duration: suggestion.duration,
      instructions: ""
    };
    setCurrentPrescription([...currentPrescription, newItem]);
    setIsAiSuggestOpen(false);
    setAiSuggestions([]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medications</h2>
          <p className="text-slate-500">Manage patient medications and write new prescriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('new')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === 'new' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          New Prescription
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === 'active' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          Active Medications
        </button>
      </div>

      {activeTab === 'new' ? (
        <>
          {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentPrescription.length > 0) {
                setConfirmModal({
                  isOpen: true,
                  title: "New Prescription",
                  message: "Start a new prescription? Current items will be cleared.",
                  onConfirm: () => {
                    setCurrentPrescription([]);
                    setPrescriptionNotes("");
                  }
                });
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => setIsAiSuggestOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Cpu className="w-4 h-4" /> AI Suggest
          </button>
          <button 
            onClick={() => setIsTemplatesOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Layout className="w-4 h-4" /> Templates
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentPrescription.length === 0) {
                toast.error("Please add at least one medication.");
                return;
              }
              setIsPreviewOpen(true);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button 
            onClick={handleSavePrescription}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Save & Finish
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Side: Medication Catalog */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-slate-500" /> Medications
              </h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" 
                  placeholder="Search drug name..." 
                />
              </div>
            </div>
            
            <div className="flex overflow-x-auto p-3 gap-2 border-b border-slate-100 bg-slate-50/50 scrollbar-hide">
              {[
                { id: 'all', label: 'All' },
                { id: 'antibiotics', label: 'Antibiotics' },
                { id: 'analgesics', label: 'Analgesics' },
                { id: 'cardiovascular', label: 'Cardio' },
                { id: 'respiratory', label: 'Resp' }
              ].map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    selectedCategory === cat.id 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {filteredCatalog.length > 0 ? (
                <div className="space-y-2">
                  {filteredCatalog.map(med => {
                    const query = searchQuery?.toLowerCase() || '';
                    const matchedSideEffect = query && med.sideEffects?.find((se: string) => se?.toLowerCase().includes(query));
                    const matchedInteraction = query && med.interactions?.find((int: string) => int?.toLowerCase().includes(query));

                    return (
                      <div 
                        key={med.id} 
                        onClick={() => handleMedicationSelect(med)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all border",
                          selectedMedForForms?.id === med.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                            : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <p className="font-medium text-sm">{med.name}</p>
                        {(matchedSideEffect || matchedInteraction) && (
                          <div className="mt-1 text-[10px] text-slate-500">
                            {matchedSideEffect && <p>Matches side effect: <span className="font-medium text-indigo-600">{matchedSideEffect}</span></p>}
                            {matchedInteraction && <p>Matches interaction: <span className="font-medium text-indigo-600">{matchedInteraction}</span></p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Search className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm">No medications found.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button 
                onClick={() => setIsCustomMedOpen(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Custom Medication
              </button>
            </div>
          </div>

          {/* Form Selection Card */}
          {selectedMedForForms && (
            <div className="bg-white rounded-xl border border-indigo-200 shadow-md overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
                <h4 className="font-medium text-sm">{selectedMedForForms.name}</h4>
                <button onClick={() => setSelectedMedForForms(null)} className="text-indigo-100 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-3 border-b border-slate-100 bg-slate-50 space-y-3">
                {selectedMedForForms.contraindications && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" /> Contraindications
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedForForms.contraindications.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedMedForForms.sideEffects && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Common Side Effects</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.sideEffects.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.interactions && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Key Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.interactions.join(", ")}</p>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Dosage Form</h5>
                {selectedMedForForms.forms.map((form: any) => (
                  <button
                    key={form.id}
                    onClick={() => handleAddMedication(selectedMedForForms.name, form.name)}
                    className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all flex justify-between items-center group"
                  >
                    <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{form.name}</span>
                    {form.minDose && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="text-[10px] font-semibold text-slate-600">
                          {form.minDose} - {form.maxDose}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: The Prescription Pad */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3 text-indigo-600">
              <FileText className="w-8 h-8" />
              <span className="text-xl font-bold tracking-widest">PRESCRIPTION</span>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={handleSaveAsTemplate}
                className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
              >
                Save as Template
              </button>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" className="text-sm font-medium text-slate-900 bg-transparent border-none outline-none p-0" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rx ID</label>
                <span className="text-sm font-medium text-slate-900">#NEW</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-white">
            <div className="flex-1 mb-6">
              {interactionAlerts.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6">
                  <h4 className="text-red-800 font-semibold flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" /> Potential Drug Interactions
                  </h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {interactionAlerts.map((alert, i) => <li key={i}>{alert}</li>)}
                  </ul>
                </div>
              )}
              {currentPrescription.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 p-8 text-center bg-slate-50/50">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="font-medium text-slate-600 text-lg">No medications added yet</p>
                  <p className="text-sm mt-1">Select a medication from the catalog to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPrescription.map((item, index) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 group">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {item.form}
                          </span>
                          <h4 className="font-bold text-lg text-slate-900 m-0">{item.medication}</h4>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromPrescription(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors"
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
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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

            <div className="border-t-2 border-slate-100 pt-6">
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Notes / Instructions</label>
                <Textarea 
                  value={prescriptionNotes || ""}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Enter specific instructions for the patient or pharmacist..."
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[80px] transition-all bg-slate-50 focus:bg-white"
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
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic</label>
                  <input 
                    type="text" 
                    defaultValue="Physician Hiclinic"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor</label>
                  <input 
                    type="text" 
                    defaultValue="Dr. Ahmed Fathy"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Active Medications</h3>
            <p className="text-sm text-slate-500">Manage current patient medications</p>
          </div>
          <div className="p-6">
            {patientMedications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No active medications found for this patient.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientMedications.map(med => (
                  <div key={med.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{med.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {med.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {med.dose} • {med.frequency}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Prescribed: {new Date(med.prescribedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setPromptValue(med.dose);
                          setPromptModal({
                            isOpen: true,
                            title: "Update Dosage",
                            message: `Update dosage for ${med.name}:`,
                            defaultValue: med.dose,
                            onConfirm: async (newDose) => {
                              if (newDose) {
                                try {
                                  await db.prescription_items.update(med.id, { dosage: newDose });
                                  toast.success("Dosage updated");
                                } catch (e) {
                                  toast.error("Failed to update dosage");
                                }
                              }
                            }
                          });
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Update Dose
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Discontinue Medication",
                            message: `Are you sure you want to discontinue ${med.name}?`,
                            onConfirm: async () => {
                              try {
                                await db.prescription_items.delete(med.id);
                                toast.success("Medication discontinued");
                              } catch (e) {
                                toast.error("Failed to discontinue medication");
                              }
                            }
                          });
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Discontinue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isTemplatesOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Prescription Templates</h3>
              <button onClick={() => setIsTemplatesOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {userTemplates.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Templates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userTemplates.map(template => (
                        <div key={template.id} className="relative group">
                          <button 
                            onClick={() => handleLoadUserTemplate(template)}
                            className="w-full text-left p-3 border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <p className="font-bold text-indigo-900 text-sm">{template.name}</p>
                            <p className="text-[10px] text-indigo-600 mt-1">{template.items.length} medications</p>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: "Delete Template",
                                message: "Are you sure you want to delete this template?",
                                onConfirm: () => {
                                  setUserTemplates(userTemplates.filter(t => t.id !== template.id));
                                }
                              });
                            }}
                            className="absolute top-2 right-2 p-1 text-indigo-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete template"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">System Templates</h4>
                {Object.entries(prescriptionTemplates).map(([key, variants]) => (
                  <div key={key} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-800 capitalize mb-2">{key.replace('-', ' ')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(variants).map(v => (
                        <button 
                          key={v}
                          onClick={() => handleLoadTemplate(key, v)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-sm font-medium rounded-md transition-colors"
                        >
                          Variant {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAiSuggestOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" /> AI Clinical Assistant
              </h3>
              <button onClick={() => setIsAiSuggestOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!aiSuggestions.length && !isAiLoading && (
                <div className="mb-6">
                  <p className="text-sm text-slate-600">
                    AI will suggest medications based on the confirmed diagnosis: 
                    <span className="font-bold text-indigo-900"> {confirmedDiagnosis}</span>
                  </p>
                </div>
              )}
              
              {(isAiLoading || !aiSuggestions.length) && (
                <button 
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate Suggestions
                    </>
                  )}
                </button>
              )}

              {aiSuggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Medications</h4>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {setAiSuggestions([]); handleAiSuggest();}}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Regenerate
                      </button>
                      {selectedSuggestions.length > 0 && (
                        <button 
                          onClick={applySelectedSuggestions}
                          className="text-xs text-emerald-600 font-bold hover:underline"
                        >
                          Add Selected ({selectedSuggestions.length})
                        </button>
                      )}
                    </div>
                  </div>
                  {aiSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-4 border rounded-xl transition-all cursor-pointer",
                        selectedSuggestions.includes(idx) 
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
                          : "border-indigo-100 bg-indigo-50/30 hover:border-indigo-300"
                      )}
                      onClick={() => toggleSuggestion(idx)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors",
                            selectedSuggestions.includes(idx)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-300"
                          )}>
                            {selectedSuggestions.includes(idx) && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-bold text-indigo-900">{suggestion.medication}</p>
                            <p className="text-xs text-indigo-600">{suggestion.dosage} • {suggestion.frequency}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            applyAiSuggestion(suggestion);
                          }}
                          className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic ml-8">
                        <span className="font-bold not-italic">Reasoning:</span> {suggestion.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {isAiLoading && (
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Cpu className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-sm animate-pulse">Consulting clinical knowledge base...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Prescription Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 font-sans">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 m-0">Physician Hiclinic</h2>
                  <p className="text-slate-600 text-sm mt-1">123 Medical Plaza, Suite 101</p>
                  <p className="text-slate-600 text-sm">Phone: (555) 123-4567</p>
                </div>
                <div className="text-5xl font-bold text-slate-900 leading-none">℞</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-6 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Patient:</span>
                  <p className="font-medium text-slate-900">John Doe</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Date:</span>
                  <p className="font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6 mb-8">
                {currentPrescription.map((item, idx) => (
                  <div key={item.id} className="border-b border-slate-200 pb-4 last:border-0">
                    <p className="font-bold text-lg text-slate-900">{idx + 1}. {item.medication} <span className="text-sm font-normal text-slate-500">({item.form})</span></p>
                    <p className="text-slate-700 mt-1"><strong>Sig:</strong> {item.dosage}, {item.frequency}, for {item.duration}</p>
                    {item.instructions && <p className="text-slate-600 text-sm mt-1">{item.instructions}</p>}
                  </div>
                ))}
              </div>

              {prescriptionNotes && (
                <div className="bg-slate-50 p-4 rounded-lg mb-8">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</h4>
                  <p className="text-slate-700 text-sm">{prescriptionNotes}</p>
                </div>
              )}

              <div className="flex justify-end mt-12">
                <div className="w-64 text-center">
                  <div className="border-t border-slate-800 mb-2"></div>
                  <p className="font-bold text-slate-900">Dr. Ahmed Fathy</p>
                  <p className="text-xs text-slate-500">License #: MD12345</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button onClick={() => window.print()} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" /> Print
              </button>
              <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">
                Close
              </button>
              <button onClick={() => {
                setIsPreviewOpen(false);
                handleSavePrescription();
              }} className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium">
                Save & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> Prescription History
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {prescriptionHistory.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {prescriptionHistory.map((rx) => (
                    <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{rx.date}</p>
                          <p className="text-xs text-slate-500">Prescribed by {rx.physician}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setCurrentPrescription(rx.items.map((item: any) => ({ ...item, id: "item_" + Date.now() + Math.random() })));
                            setIsHistoryOpen(false);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Re-order
                        </button>
                      </div>
                      <div className="space-y-2">
                        {rx.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                            <span className="font-medium text-slate-800">{item.medication}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-600">{item.dosage}, {item.frequency}</span>
                          </div>
                        ))}
                      </div>
                      {rx.notes && (
                        <p className="mt-3 text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
                          Note: {rx.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No prescription history found for this patient.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Medication Modal */}
      {isCustomMedOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" /> Add Custom Medication
              </h3>
              <button onClick={() => setIsCustomMedOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Medication Name</label>
                <input 
                  type="text" 
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="e.g., Vitamin C"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Form</label>
                <input 
                  type="text" 
                  value={customMedForm}
                  onChange={(e) => setCustomMedForm(e.target.value)}
                  placeholder="e.g., Tablet, Syrup, Injection"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => setIsCustomMedOpen(false)} 
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!customMedName.trim()) {
                    toast.error("Please enter a medication name.");
                    return;
                  }
                  handleAddMedication(customMedName.trim(), customMedForm.trim() || "Custom");
                  setCustomMedName("");
                  setCustomMedForm("");
                  setIsCustomMedOpen(false);
                }}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Add to Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-slate-700">{confirmModal.message}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{promptModal.title}</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-700">{promptModal.message}</p>
              <input 
                type="text"
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setPromptModal({ ...promptModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  promptModal.onConfirm(promptValue);
                  setPromptModal({ ...promptModal, isOpen: false });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
