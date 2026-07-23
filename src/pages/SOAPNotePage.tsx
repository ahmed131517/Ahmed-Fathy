import React, { useState, useEffect, useCallback } from 'react';
import { usePatient } from '../lib/PatientContext';
import { cn } from '../lib/utils';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  FolderOpen, 
  Clock, 
  Tag, 
  Plus,
  ArrowLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Info,
  RefreshCw,
  ClipboardList,
  User,
  X,
  ShieldCheck,
  ShieldAlert,
  Mic,
  Activity,
  Printer,
  ChevronDown,
  ChevronUp,
  Heart,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  Award,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';

function CheckListItem({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" height="16" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

import { useAISettings } from '../lib/AISettingsContext';
import { clinicalAIRequest } from '@/services/aiWorkflowService';
import { parseJsonResponse } from "../utils/gemini";
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ClinicalService, ClinicalInteraction, SuggestedTask } from "../services/clinical.service";

export function SOAPNotePage() {
  const { settings: aiSettings } = useAISettings();
  const { selectedPatient } = usePatient();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [sections, setSections] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  
  // Custom states for upgraded features
  const [isPatientInfoExpanded, setIsPatientInfoExpanded] = useState(true);
  const [scribeInput, setScribeInput] = useState("");
  const [isScribeProcessing, setIsScribeProcessing] = useState(false);
  const [processingSection, setProcessingSection] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  
  // Sidebar States
  const [showTasks, setShowTasks] = useState(true);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // CDSS States
  const [interactions, setInteractions] = useState<ClinicalInteraction[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  // Task Extraction States
  const [suggestedTasks, setSuggestedTasks] = useState<SuggestedTask[]>([]);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  const [committedTasks, setCommittedTasks] = useState<string[]>([]);
  const [isPlanVerified, setIsPlanVerified] = useState(false);

  // Clinical macros preset definitions
  const sectionMacros = {
    subjective: [
      { label: "Pt general follow-up", phrase: "Patient presents for routine follow-up of chronic conditions. Overall feeling well. Denies acute symptoms, nausea, fever, or chest pain." },
      { label: "Acute cough/URI", phrase: "Patient c/o acute onset persistent cough, sore throat, and watery nasal discharge x3 days. Cough productive of yellow phlegm. No fever." },
      { label: "Lubmar Spine Ache", phrase: "Patient reports aching pain in lumbar back, sharp upon sitting x1 week. Denies saddle anesthesia, urinary incontinence, or radicular pain." }
    ],
    objective: [
      { label: "All normal vitals", phrase: "Vitals normal. Well-developed, nourished in no distress. Chest: clear to auscultation bilaterally. Heart: S1 S2 normal, RRR, no murmurs." },
      { label: "HEENT & Chest Clear", phrase: "Oropharynx: clear without erythema or exudate. Lungs: vesicular breath sounds intact, negative wheezes. Neck soft, NT." },
      { label: "Abdomen Soft/NT", phrase: "Abdomen: soft, non-distended, non-tender to light/deep palpation. Positive bowel sounds in all 4 quadrants. No organomegaly." }
    ],
    assessment: [
      { label: "HTN & DM Control", phrase: "1. Primary Essential Hypertension - Well controlled under active amlodipine therapy.\n2. Type 2 Diabetes Mellitus - Controlled with Metformin." },
      { label: "Acute Upper Resp", phrase: "1. Acute Upper Respiratory Tract Infection - Likely viral etiology. Resolving symptoms, no current secondary signs." },
      { label: "Muscular Backache", phrase: "1. Acute Lumbar Myofascial Strain - Secondary to posture/strain. R/o nerve compression." }
    ],
    plan: [
      { label: "Chronic Maintenance", phrase: "Continue ongoing home daily prescriptions. Monitor blood pressures. Schedule general outpatient metabolic panel check in 3 months." },
      { label: "URI Symptomatic", phrase: "Advised adequate fluids, rest. Take Paracetamol 500mg PO PRN q6h for headache, muscle ache, or temp. Return if dyspnea develops." },
      { label: "Back rehabilitation", phrase: "Prescribed Ibuprofen 400mg q8h x5d. Avoid heavy weights, apply warm compress. Ref to physical therapy if unimproved in 2 weeks." }
    ]
  };

  // Initialize content from drafts or session storage
  useEffect(() => {
    const loadInitialData = async () => {
      if (selectedPatient?.id) {
        const draft = await db.clinical_drafts.where('id').equals(`soap_${selectedPatient.id}`).first();
        if (draft && draft.content) {
          setSections(draft.content);
          setLastSaved(draft.lastModified);
          return;
        }
      }

      const savedNote = sessionStorage.getItem('draft_soap_note');
      const hasAutoFormatted = sessionStorage.getItem('soap_auto_formatted');
      
      if (savedNote) {
        setContent(savedNote);
        const parsed = parseSOAP(savedNote);
        setSections(parsed);
        
        if (!hasAutoFormatted && savedNote.trim().length > 0) {
          handleBeautify(savedNote);
          sessionStorage.setItem('soap_auto_formatted', 'true');
        }
      }
    };

    loadInitialData();
  }, [selectedPatient?.id]);

  // Persistence: Auto-save to Dexie drafts (Debounced)
  useEffect(() => {
    if (!selectedPatient?.id || (!sections.subjective && !sections.objective && !sections.assessment && !sections.plan)) return;

    const saveDraft = async () => {
      setIsSaving(true);
      try {
        const draftId = `soap_${selectedPatient.id}`;
        const existing = await db.clinical_drafts.where('id').equals(draftId).first();
        
        if (existing) {
          await db.clinical_drafts.update(existing.localId!, {
            content: sections,
            lastModified: Date.now()
          });
        } else {
          await db.clinical_drafts.add({
            id: draftId,
            patientId: selectedPatient.id,
            type: 'SOAP',
            content: sections,
            lastModified: Date.now()
          });
        }
        setLastSaved(Date.now());
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [sections, selectedPatient?.id]);

  // Task & DDI Check: Real-time Analysis (Debounced)
  useEffect(() => {
    const trimmedPlan = sections.plan.trim();
    if (!trimmedPlan || trimmedPlan.length < 15 || !/[a-zA-Z]{3,}/.test(trimmedPlan)) {
      setInteractions([]);
      setSuggestedTasks([]);
      return;
    }

    const timer = setTimeout(() => {
      if (selectedPatient?.medications?.length) checkInteractions();
      extractTasks();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sections.plan]);

  const checkInteractions = async () => {
    const trimmedPlan = sections.plan.trim();
    if (!trimmedPlan || trimmedPlan.length < 15 || !/[a-zA-Z]{3,}/.test(trimmedPlan) || !selectedPatient?.medications?.length) {
      setInteractions([]);
      return;
    }

    setIsCheckingInteractions(true);
    try {
      const results = await ClinicalService.checkMedicationInteractions(
        sections.plan, 
        selectedPatient.medications
      );
      setInteractions(results);
    } catch (err) {
      console.error("DDI Check failed:", err);
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  const extractTasks = async () => {
    const trimmedPlan = sections.plan.trim();
    if (!trimmedPlan || trimmedPlan.length < 15 || !/[a-zA-Z]{3,}/.test(trimmedPlan)) {
      setSuggestedTasks([]);
      return;
    }

    setIsExtractingTasks(true);
    try {
      const results = await ClinicalService.extractTasksFromPlan(sections.plan);
      setSuggestedTasks(results);
    } catch (err) {
      console.error("Task extraction failed:", err);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const commitTask = async (task: SuggestedTask) => {
    if (!selectedPatient) return;
    
    try {
      const patientId = selectedPatient.id || "unknown";
      await ClinicalService.commitTask(task, patientId, selectedPatient.name);
      setCommittedTasks(prev => [...prev, task.title]);
      toast.success(`Task assigned: ${task.title}`);
    } catch (err) {
      toast.error("Failed to commit task");
    }
  };

  const templates = useLiveQuery(() => 
    db.templates
      .where('category')
      .equals('soap_note')
      .toArray()
  );

  function parseSOAP(text: string) {
    const subjective = text.match(/(?:Subjective:|S:)\s*([\s\S]*?)(?=(?:Objective:|O:|Assessment:|A:|Plan:|P:|$))/i)?.[1]?.trim() || "";
    const objective = text.match(/(?:Objective:|O:)\s*([\s\S]*?)(?=(?:Assessment:|A:|Plan:|P:|Subjective:|S:|$))/i)?.[1]?.trim() || "";
    const assessment = text.match(/(?:Assessment:|A:)\s*([\s\S]*?)(?=(?:Plan:|P:|Subjective:|S:|Objective:|O:|$))/i)?.[1]?.trim() || "";
    const plan = text.match(/(?:Plan:|P:)\s*([\s\S]*?)(?=(0?:Subjective:|S:|Objective:|O:|Assessment:|A:|$))/i)?.[1]?.trim() || "";

    if (!subjective && !objective && !assessment && !plan && text.trim()) {
      return { subjective: text.trim(), objective: "", assessment: "", plan: "" };
    }

    return { subjective, objective, assessment, plan };
  }

  const updateSection = (key: keyof typeof sections, value: string) => {
    const newSections = { ...sections, [key]: value };
    setSections(newSections);
    
    // Reconstruct raw content
    const reconstructed = `Subjective:\n${newSections.subjective}\n\nObjective:\n${newSections.objective}\n\nAssessment:\n${newSections.assessment}\n\nPlan:\n${newSections.plan}`;
    setContent(reconstructed);
  };

  // Upgraded Feature: AI Scribble Processing
  const handleScribeProcess = async () => {
    if (!scribeInput.trim()) {
      toast.error("Please enter some clinical notes or dictation scribble.");
      return;
    }
    setIsScribeProcessing(true);
    try {
      const prompt = `You are a highly skilled clinical AI scribe. Take the following unstructured, messy notes (which might be raw spoken speech, abbreviations, vitals, and bullet thoughts) and professionally synthesize them. 
Organize and expand them into a complete structured SOAP clinical note representing the patient encounter.

Scribble notes:
"${scribeInput}"

Format the output strictly as a JSON object with keys: "subjective", "objective", "assessment", "plan".
Ensure clinical terminology is correct, abbreviations are expanded where necessary, chest exam and symptoms are formal.

Return ONLY direct, raw JSON. Do not include markdown codeblock characters or wrap in backticks.`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      const parsed = parseJsonResponse(responseText, { subjective: "", objective: "", assessment: "", plan: "" });
      if (parsed.subjective || parsed.objective || parsed.assessment || parsed.plan) {
        setSections(parsed);
        const reconstructed = `Subjective:\n${parsed.subjective}\n\nObjective:\n${parsed.objective}\n\nAssessment:\n${parsed.assessment}\n\nPlan:\n${parsed.plan}`;
        setContent(reconstructed);
        setScribeInput("");
        toast.success("AI Scribe populated SOAP structure successfully!");
      } else {
        throw new Error("Unable to parse structured JSON from scribe response");
      }
    } catch (err) {
      console.error("Scribe failure:", err);
      toast.error("Failed to parse scribe notes. Populating raw text into Subjective instead.");
      updateSection("subjective", scribeInput);
      setScribeInput("");
    } finally {
      setIsScribeProcessing(false);
    }
  };

  // Upgraded Feature: Section-level micro-AI prompts
  const handleEnhanceSection = async (sectionId: "subjective" | "objective" | "assessment" | "plan", mode: string) => {
    const currentVal = (sections as any)[sectionId];
    if (!currentVal?.trim()) {
      toast.info(`Please write some initial ${sectionId} text first.`);
      return;
    }

    setProcessingSection(sectionId);
    try {
      let prompt = "";
      if (sectionId === "subjective") {
        prompt = `Refine this subjective history into a polished Clinical HPI (History of Present Illness) using standard frameworks (OPQRST) and introducing elegant clinical prose.\n\nOriginal draft:\n${currentVal}`;
      } else if (sectionId === "objective") {
        prompt = `Take this medical objective record and generate a pristine full physical examination layout covering critical organ systems (Constitutional, Respiratory, Cardiovascular, Abdomen, Neuro). If physical details are limited, complete regular systems findings appropriately.\n\nOriginal draft:\n${currentVal}`;
      } else if (sectionId === "assessment") {
        prompt = `Generate a rigorous clinical assessment and prioritized differential diagnoses list with reasoning/justification bullets based on these indications:\n\nOriginal draft:\n${currentVal}`;
      } else {
        prompt = `Structure this clinical treatment plan into specific prescriptions, dosage frequencies, recommended follow-ups, strict warning flags (when to seek emergency care), and helpful lifestyle advice.\n\nOriginal draft:\n${currentVal}`;
      }

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings,
        "You are an expert academic physician. Return only the improved medical text. Do not write intros or outtros."
      );

      if (responseText) {
        updateSection(sectionId, responseText.trim());
        toast.success(`Enhanced ${sectionId} with AI successfully!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process section with AI.");
    } finally {
      setProcessingSection(null);
    }
  };

  const handleBeautify = async (initialText?: string) => {
    const textToProcess = initialText || content;
    if (!textToProcess?.trim()) return;
    
    setIsBeautifying(true);
    try {
      const prompt = `Refine and beautify the following clinical SOAP note into a highly professional, well-structured format. 
Ensure clear headings (Subjective:, Objective:, Assessment:, Plan:), expand medical abbreviations where appropriate for clarity, organize findings into bullet points, and use formal clinical language. 
      
Original Note:
${textToProcess}
      
Return ONLY the refined SOAP note text.`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      const refinedText = responseText || textToProcess;
      setContent(refinedText);
      setSections(parseSOAP(refinedText));
      if (!initialText) toast.success("Note professionally formatted");
    } catch (err) {
      console.error("Beautify failed:", err);
      if (!initialText) toast.error("Failed to format note");
    } finally {
      setIsBeautifying(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      await db.templates.add({
        name: templateName,
        content: content,
        category: 'soap_note',
        lastModified: Date.now()
      });
      toast.success("Template saved successfully");
      setTemplateName("");
      setIsSavingTemplate(false);
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const handleApplyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setSections(parseSOAP(templateContent));
    setShowTemplates(false);
    toast.success("Template applied");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  const handleSignEncounter = () => {
    toast.success("Encounter signed and finalized");
    sessionStorage.removeItem('draft_soap_note');
    sessionStorage.removeItem('soap_auto_formatted');
    navigate('/medical-records');
  };

  // Helper macro injection
  const injectMacro = (sectionId: keyof typeof sections, phrase: string) => {
    const currentText = sections[sectionId];
    const newText = currentText ? `${currentText.trim()}\n\n${phrase}` : phrase;
    updateSection(sectionId, newText);
    toast.success("Clinical phrase macro applied");
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-slate-50/50">
      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-6 pb-28 max-w-6xl mx-auto w-full">
        
        {/* Top Header Row with status & meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">Clinical SOAP Note Editor</h1>
              
              {isSaving ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Auto-saving...</span>
                </div>
              ) : lastSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">
                    Saved {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
            <Link 
              to="/medical-records"
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Clinical Records
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsSavingTemplate(!isSavingTemplate)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                isSavingTemplate ? "bg-indigo-650 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <Save className="w-3.5 h-3.5" />
              Save As Template
            </button>
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                showTemplates ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Favorites ({templates?.length || 0})
            </button>
            <button 
              onClick={() => setShowTasks(!showTasks)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all",
                showTasks ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              )}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Dynamic Task Tray
            </button>
            <button 
              onClick={() => setShowPrintPreview(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              Print Letterhead
            </button>

            <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-xl border border-slate-300 ml-2">
              <button 
                onClick={() => setViewMode('structured')}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'structured' 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                )}
              >
                Structured
              </button>
              <button 
                onClick={() => setViewMode('raw')}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all",
                  viewMode === 'raw' 
                    ? "bg-white text-indigo-700 shadow-sm" 
                    : "text-slate-600 hover:text-slate-800"
                )}
              >
                Raw Text
              </button>
            </div>
          </div>
        </div>

        {/* Upgraded Dashboard Component 1: Sticky Collapsible Clinical Reference Panel */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div 
              onClick={() => setIsPatientInfoExpanded(!isPatientInfoExpanded)}
              className="px-5 py-3.5 bg-slate-50/50 flex items-center justify-between cursor-pointer hover:bg-slate-50 select-none border-b border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase border border-indigo-100 shadow-sm">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 tracking-tight">
                    {selectedPatient.name} <span className="text-slate-400 font-semibold text-[11px] ml-1">MRN: {selectedPatient.mrn || "N/A"}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedPatient.gender} • {selectedPatient.age} years • DOB: {selectedPatient.dob || "Unknown"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-5">
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <span className="text-[10px] bg-red-100/90 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                      ⚠️ Allergies: {selectedPatient.allergies.length}
                    </span>
                  )}
                  {selectedPatient.vitalsHistory && selectedPatient.vitalsHistory.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-bold">
                      Latest BP: <span className="text-slate-800 font-extrabold">{selectedPatient.vitalsHistory[0].bloodPressure}</span>
                    </span>
                  )}
                </div>
                <div className="text-slate-400">
                  {isPatientInfoExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isPatientInfoExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 text-xs bg-white">
                    {/* Column 1: Allergy Alerts */}
                    <div className="md:col-span-4 bg-red-50/20 border border-red-100/60 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-red-800 font-bold tracking-tight text-[11px] uppercase mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Allergies & Contraindications
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(!selectedPatient.allergies || selectedPatient.allergies.length === 0) ? (
                          <span className="text-slate-400 text-[11px] italic">No known drug allergies reported.</span>
                        ) : (
                          selectedPatient.allergies.map((allergy) => (
                            <span 
                              key={allergy.id} 
                              className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-md border",
                                allergy.severity === "Severe" ? "bg-red-50 border-red-200 text-red-700" :
                                allergy.severity === "Moderate" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                "bg-slate-50 border-slate-200 text-slate-600"
                              )}
                            >
                              {allergy.name} ({allergy.severity})
                            </span>
                          ))
                        )}
                      </div>
                      
                      <div className="pt-2 border-t border-red-100/30">
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Chronic States</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.chronicConditions && selectedPatient.chronicConditions.map((cond, i) => (
                            <span key={i} className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Active Medications Panel */}
                    <div className="md:col-span-4 bg-blue-50/20 border border-blue-100/60 p-3.5 rounded-xl space-y-2">
                      <div className="text-blue-800 font-bold tracking-tight text-[11px] uppercase flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                        Current Home Medications
                      </div>
                      <div className="space-y-1.5 max-h-[105px] overflow-y-auto custom-scrollbar">
                        {(!selectedPatient.medications || selectedPatient.medications.length === 0) ? (
                          <span className="text-slate-400 text-[11px] italic">No active maintenance medications.</span>
                        ) : (
                          selectedPatient.medications.map((med, i) => (
                            <div key={i} className="flex justify-between items-center bg-white p-1.5 rounded-lg border border-slate-100 shadow-3xs">
                              <div>
                                <span className="font-extrabold text-slate-800 text-[11px] block leading-none">{med.name}</span>
                                <span className="text-[10px] text-slate-500">{med.dosage} • {med.frequency}</span>
                              </div>
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-1.5 py-0.2 rounded">
                                Active
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Column 3: Patient Vitals Monitor */}
                    <div className="md:col-span-4 bg-emerald-50/10 border border-emerald-100/40 p-3.5 rounded-xl space-y-2">
                      <div className="text-slate-800 font-bold tracking-tight text-[11px] uppercase flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Latest Vitals Screen
                      </div>
                      {selectedPatient.vitalsHistory && selectedPatient.vitalsHistory.length > 0 ? (
                        (() => {
                          const v = selectedPatient.vitalsHistory[0];
                          const bpSystolic = parseInt(v.bloodPressure.split("/")[0]);
                          const bpDiastolic = parseInt(v.bloodPressure.split("/")[1]);
                          const isHighBP = bpSystolic >= 130 || bpDiastolic >= 85;
                          
                          return (
                            <div className="grid grid-cols-3 gap-2.5 pt-1">
                              <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <span className="text-[9px] text-slate-400 block font-semibold leading-none mb-1">Blood Pressure</span>
                                <span className={cn(
                                  "font-extrabold text-xs block",
                                  isHighBP ? "text-rose-600" : "text-emerald-700"
                                )}>
                                  {v.bloodPressure}
                                </span>
                                {isHighBP && <span className="text-[8px] text-rose-500 font-bold leading-none block mt-0.5">Elevated</span>}
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <span className="text-[9px] text-slate-400 block font-semibold leading-none mb-1 font-sans">Heart Rate</span>
                                <span className="font-extrabold text-slate-800 text-xs block">
                                  {v.heartRate} <span className="text-[8px] font-medium text-slate-400">bpm</span>
                                </span>
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-100 text-center">
                                <span className="text-[9px] text-slate-400 block font-semibold leading-none mb-1">Weight</span>
                                <span className="font-extrabold text-slate-800 text-xs block">
                                  {v.weight} <span className="text-[8px] font-medium text-slate-400">kg</span>
                                </span>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-slate-400 text-center py-4">No historic vital vitals documented.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Upgraded Dashboard Component 2: Ambient AI Scribe Simulator Console */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 md:p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Mic className="w-5 h-5 text-indigo-300 animate-pulse" />
              </div>
              <div>
                <h2 className="font-sans text-md font-extrabold tracking-tight text-white flex items-center gap-2">
                  Ambient Scribe & Clinical Parser
                  <span className="bg-indigo-500/35 text-[9px] text-indigo-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Gemini 3.5</span>
                </h2>
                <p className="text-xs text-indigo-200/70 font-medium">Type unstructured physician bullet summaries or raw vocal dictations to auto-fill the SOAP note.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 relative z-10">
            <textarea 
              value={scribeInput}
              onChange={(e) => setScribeInput(e.target.value)}
              className="w-full min-h-[95px] text-sm bg-black/30 border border-indigo-500/20 text-indigo-100 placeholder-slate-400/80 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed custom-scrollbar shadow-inner"
              placeholder="Example: '65yo male, bp 143/86, here for HTN follow-up. Sticking to low-salt, walking daily. Refills needed. Exam: chest clear, heart rhythm regular. Raise dose of amlodipine.'"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Supports healthcare acronyms (HPI, DM, URI, qd, prn)</span>
              </div>
              <button 
                onClick={handleScribeProcess}
                disabled={isScribeProcessing || !scribeInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
              >
                {isScribeProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Structuring with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-100" />
                    Structure clinical note
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Template Quick Save Input Box */}
        <AnimatePresence>
          {isSavingTemplate && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Enter template name (e.g. URI Follow-up)..."
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <button 
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
                >
                  Save Template
                </button>
                <button onClick={() => setIsSavingTemplate(false)} className="text-slate-400 hover:text-slate-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Layout Container */}
        <div className="grid grid-cols-12 gap-6 pb-12">
          
          {/* Left Grid: Workspace Editor Area */}
          <div className={cn("transition-all duration-300", 
            (showTemplates && showTasks) ? "lg:col-span-4" : 
            (showTemplates || showTasks) ? "lg:col-span-8" : "lg:col-span-12"
          )}>
            <AnimatePresence mode="wait">
              {isBeautifying ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 animate-pulse" />
                  </div>
                  <h3 className="mt-6 font-headline text-md font-extrabold text-indigo-950 tracking-tight">Synthesizing Notes...</h3>
                  <p className="mt-1 text-slate-500 text-xs max-w-[280px] text-center">
                    Auto-structuring language patterns, expanding medical vocabulary, and polishing.
                  </p>
                </motion.div>
              ) : viewMode === 'structured' ? (
                <motion.div 
                  key="structured"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-1 gap-6"
                >
                  {[
                    { id: 'subjective', label: 'Subjective (S)', icon: 'chat_bubble', actionLabel: "Write HPI details", hint: "History of present illness, primary complaint symptoms, dates, onset times..." },
                    { id: 'objective', label: 'Objective (O)', icon: 'visibility', actionLabel: "Generate physical exam", hint: "Physical exam vitals, systemic reviews, cardio, pulmonary, and lab checks..." },
                    { id: 'assessment', label: 'Assessment (A)', icon: 'assignment_turned_in', actionLabel: "Build Differential List", hint: "Primary diagnosis, secondary issues, ICD considerations, differentials discussion..." },
                    { id: 'plan', label: 'Plan (P)', icon: 'event_note', actionLabel: "Structure Instructions & Rx", hint: "Prescriptions/dosages, patient warnings (red flags), next schedule follow-up..." }
                  ].map((section) => (
                    <section key={section.id} className="bg-white rounded-2xl shadow-xs border border-slate-200 hover:border-slate-300 transition-all overflow-hidden flex flex-col">
                      <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-indigo-600 text-md">{section.icon}</span>
                          <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">{section.label}</h3>
                        </div>
                        <button 
                          onClick={() => handleEnhanceSection(section.id as any, "")}
                          disabled={processingSection !== null}
                          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-50 text-indigo-650 rounded-xl text-[10px] font-black transition-all border border-slate-250 shadow-3xs"
                        >
                          {processingSection === section.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />}
                          {section.actionLabel}
                        </button>
                      </div>

                      <div className="p-4 flex-1">
                        <textarea 
                          value={(sections as any)[section.id]}
                          onChange={(e) => updateSection(section.id as any, e.target.value)}
                          className={cn(
                            "w-full min-h-[145px] text-xs border-none bg-slate-50/50 focus:ring-1 focus:ring-indigo-500/50 rounded-xl p-3.5 text-slate-750 resize-none transition-all leading-relaxed custom-scrollbar",
                            processingSection === section.id && "animate-pulse select-none opacity-60"
                          )}
                          placeholder={`${section.hint}...`}
                        />
                        
                        {/* Upgraded Dashboard Tool: Handy Clinical Shorthand Macros */}
                        <div className="mt-2 pt-2.5 border-t border-slate-100">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Clinical Macros (Shorthand)</span>
                          <div className="flex flex-wrap gap-1">
                            {sectionMacros[section.id as keyof typeof sectionMacros].map((macro, idx) => (
                              <button 
                                key={idx}
                                onClick={() => injectMacro(section.id as any, macro.phrase)}
                                className="text-[9px] bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 px-2 py-0.5 rounded transition-colors font-bold"
                              >
                                {macro.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {section.id === 'plan' && (
                          <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-slate-100">
                            {isCheckingInteractions && (
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold animate-pulse px-1">
                                <RefreshCw className="w-3" />
                                Analyzing plan for drug interactions...
                              </div>
                            )}

                            {/* Safety Checkbox */}
                            <div className={cn(
                              "px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3",
                              isPlanVerified 
                               ? "bg-emerald-50 border-emerald-105 text-emerald-800" 
                               : "bg-slate-50 border-slate-150 text-slate-500 hover:bg-slate-100"
                            )} onClick={() => setIsPlanVerified(!isPlanVerified)}>
                              <div className={cn(
                                "w-4 h-4 rounded flex items-center justify-center border transition-all",
                                isPlanVerified ? "bg-emerald-600 border-emerald-600" : "border-slate-350"
                              )}>
                                {isPlanVerified && <ShieldCheck className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <div className="leading-tight">
                                <p className="text-[11px] font-extrabold block">Mark as Clinically Verified</p>
                                <p className="text-[9px] text-slate-500 mt-0.5">I have scrutinized drug doses, safety parameters, and patient metrics.</p>
                              </div>
                            </div>

                            {!isPlanVerified && sections.plan.trim() && (
                              <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl flex items-start gap-2 text-amber-800">
                                <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <p className="text-[9.5px] leading-relaxed font-semibold">
                                  <span className="font-extrabold uppercase bg-amber-200 text-amber-900 px-1 py-0.1 rounded text-[8px] mr-1">Alert</span>
                                  Please double-check medication list safety limits prior to finalizing the SOAP discharge.
                                </p>
                              </div>
                            )}

                            <AnimatePresence>
                              {interactions.map((alert, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className={cn(
                                    "p-3 rounded-xl border flex gap-3 items-start overflow-hidden",
                                    alert.severity === 'Major' ? "bg-red-50 border-red-150 text-red-700" :
                                    alert.severity === 'Moderate' ? "bg-amber-50 border-amber-150 text-amber-700" :
                                    "bg-blue-50 border-blue-150 text-blue-700"
                                  )}
                                >
                                  <div className="p-1 rounded bg-white">
                                    <AlertTriangle className={cn("w-3.5 h-3.5", alert.severity === 'Major' ? "text-red-600" : "text-amber-500")} />
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black uppercase tracking-wider mb-0.5 leading-none">{alert.severity} Safety Concern</p>
                                    <p className="text-xs font-semibold leading-relaxed">{alert.description}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </section>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="raw"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col space-y-4"
                >
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw Note Synced View</p>
                     <button 
                       onClick={() => handleBeautify()}
                       className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black hover:bg-indigo-100 transition-colors border border-indigo-100"
                     >
                       <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                       Polish note with AI
                     </button>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[480px] shadow-sm">
                    <textarea 
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setSections(parseSOAP(e.target.value));
                      }}
                      className="w-full h-full min-h-[430px] bg-transparent border-none font-mono text-xs leading-relaxed outline-none resize-none text-slate-700 custom-scrollbar focus:ring-0"
                      placeholder="Type details straight into SOAP sections here..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Grid Sidebar 1: Templates List */}
          <AnimatePresence>
            {showTemplates && (
              <motion.aside 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="col-span-12 lg:col-span-4"
              >
                <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col h-[calc(100vh-140px)] shadow-xs">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h4 className="font-sans font-extrabold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      Quick Custom Templates
                    </h4>
                    <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                    {templates?.length === 0 && (
                      <div className="text-center py-10">
                        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Save notes here to create reusable quick templates.</p>
                      </div>
                    )}
                    {templates?.map((tpl) => (
                      <div 
                        key={tpl.id} 
                        className="group p-3 bg-slate-50 border border-slate-150 rounded-xl hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all cursor-pointer relative"
                        onClick={() => handleApplyTemplate(tpl.content)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="text-[11px] font-black text-slate-700">{tpl.name}</h5>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              db.templates.delete(tpl.id!);
                              toast.success("Template discarded");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {tpl.content}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(tpl.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => setIsSavingTemplate(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-250 hover:bg-white hover:border-indigo-450 rounded-xl text-xs font-bold text-indigo-650 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Current View
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Right Grid Sidebar 2: Orders & Tasks Sidebar */}
          <AnimatePresence>
            {showTasks && (
              <motion.aside 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className={cn("col-span-12", 
                  showTemplates ? "lg:col-span-4" : "lg:col-span-4"
                )}
              >
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sticky top-8 flex flex-col h-[600px]">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                       <ClipboardList className="w-4 h-4 text-emerald-600" />
                       <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wide">Orders & Actionable Tasks</h3>
                    </div>
                    <button onClick={() => setShowTasks(false)} className="text-slate-300 hover:text-slate-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {isExtractingTasks && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-black animate-pulse px-1">
                        <RefreshCw className="w-3.5 animate-spin" />
                        AI extracting clinician tasks...
                      </div>
                    )}

                    {!isExtractingTasks && suggestedTasks.length === 0 && (
                      <div className="text-center py-10">
                        <div className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckListItem className="w-4 h-4 text-slate-350" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Add clinical drug plans or referrals in plan card first.</p>
                      </div>
                    )}

                    {suggestedTasks.map((task, idx) => {
                      const isCommitted = committedTasks.includes(task.title);
                      return (
                        <div 
                          key={idx}
                          className={cn(
                            "group p-3 rounded-xl border transition-all relative overflow-hidden",
                            isCommitted 
                              ? "bg-slate-50 border-slate-100 opacity-60" 
                              : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs cursor-pointer"
                          )}
                          onClick={() => !isCommitted && commitTask(task)}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={cn(
                              "p-1.5 rounded flex-shrink-0 transition-colors",
                              isCommitted ? "bg-slate-250" : "bg-emerald-50 group-hover:bg-emerald-100"
                            )}>
                              {isCommitted ? <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" /> : <Plus className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between mb-0.5">
                                 <span className={cn(
                                   "text-[9px] font-bold uppercase tracking-wider",
                                   task.priority === 'high' ? "text-rose-500" : "text-slate-400"
                                 )}>
                                   {task.priority || 'standard'} • {task.type || 'order'}
                                 </span>
                               </div>
                               <h4 className={cn(
                                 "text-[11px] font-extrabold truncate leading-tight",
                                 isCommitted ? "text-slate-400 line-through" : "text-slate-750"
                               )}>{task.title}</h4>
                            </div>
                          </div>
                          
                          {!isCommitted && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                               <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded shadow-3xs">Assign Order</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 bg-white">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2 leading-none">Nursing & Pharmacy Handoff</span>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] text-slate-600 italic leading-relaxed">
                        "Nursing staff: Please perform the {suggestedTasks.length} patient treatment orders identified in the plan for {selectedPatient?.name || 'this patient'}."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upgraded Dashboard Component 3: Print preview sheet modal */}
      <AnimatePresence>
        {showPrintPreview && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-indigo-650" />
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">SOAP Patient Consultation Record Letterhead</h3>
                </div>
                <button 
                  onClick={() => setShowPrintPreview(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Area preview panel */}
              <div id="clinical-soap-document" className="p-8 flex-1 overflow-y-auto bg-slate-100 custom-scrollbar">
                <div className="bg-white border text-slate-900 p-10 max-w-2xl mx-auto shadow-md rounded-lg space-y-6 min-h-[750px] font-sans">
                  {/* Clinics Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-700 pb-4">
                    <div>
                      <h4 className="text-md font-black tracking-tight text-slate-900">AI CLINICAL CARE CENTER</h4>
                      <p className="text-[10px] text-slate-500 leading-none mt-1">100 Innovation District, Biotech Boulevard</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Telephone: (555) 124-9000 | Contact: care@aistudio.org</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                        Official Consultation record
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Client biodata summary in print */}
                  <div className="bg-slate-50/55 p-4 rounded-lg border border-slate-150 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                    <div>
                      <span className="text-slate-400 uppercase font-black tracking-wider block">Patient Name</span>
                      <span className="font-extrabold text-slate-800">{selectedPatient?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-black tracking-wider block">MRN Reference</span>
                      <span className="font-extrabold text-slate-800">{selectedPatient?.mrn || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-black tracking-wider block">Age & Gender</span>
                      <span className="font-extrabold text-slate-800">{selectedPatient?.gender} / {selectedPatient?.age} yrs</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-black tracking-wider block">Vitals BP</span>
                      <span className="font-extrabold text-slate-800">{selectedPatient?.vitalsHistory?.[0]?.bloodPressure || "Unrecorded"}</span>
                    </div>
                  </div>

                  {/* Formatted SOAP values */}
                  <div className="space-y-4 pt-2">
                    {sections.subjective && (
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-indigo-650 pl-2 leading-none">Subjective</h5>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-2">{sections.subjective}</p>
                      </div>
                    )}
                    
                    {sections.objective && (
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-indigo-650 pl-2 leading-none">Objective</h5>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-2">{sections.objective}</p>
                      </div>
                    )}

                    {sections.assessment && (
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-indigo-650 pl-2 leading-none">Assessment</h5>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-2">{sections.assessment}</p>
                      </div>
                    )}

                    {sections.plan && (
                      <div className="space-y-1">
                        <h5 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest border-l-2 border-indigo-650 pl-2 leading-none">Plan of Treatment</h5>
                        <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed pl-2">{sections.plan}</p>
                      </div>
                    )}
                  </div>

                  {/* Doctors Sign Block */}
                  <div className="pt-10 flex justify-between items-end border-t border-slate-150">
                    <div>
                      <span className="text-[8px] text-slate-400 uppercase block tracking-wider font-extrabold">Auto-generated signature block</span>
                      <span className="font-headline font-extrabold text-indigo-900 text-xs tracking-tight">DR. AHMED FATHY ALI</span>
                      <p className="text-[9px] text-slate-500">Clinical AI Integration Specialist</p>
                    </div>
                    <div className="text-right">
                      <div className="w-20 h-5 border-b border-dashed border-slate-400 mb-1" />
                      <span className="text-[9px] text-slate-400 font-bold">Authorized signature</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-3xl">
                <button 
                  onClick={() => setShowPrintPreview(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    window.print();
                    setShowPrintPreview(false);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/10"
                >
                  <Printer className="w-4 h-4" />
                  Print Consultation Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Persistence Bar / Signature Hub */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-xl flex items-center justify-center gap-6 z-50 no-print">
         <div className="hidden sm:flex items-center gap-3 pr-6 border-r border-slate-200">
           <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
             <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
           </div>
           <div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Local Synched state</p>
             <p className="text-xs font-bold text-slate-600 leading-none mt-0.5">Dexie Secure DB Active</p>
           </div>
         </div>
         
         <div className="flex gap-3">
           <button 
            onClick={handleCopy}
            className="px-5 py-2.5 border border-slate-255 text-slate-650 font-extrabold text-xs rounded-xl hover:bg-slate-50 flex items-center gap-2 transition-colors active:scale-95"
           >
             <Copy className="w-4 h-4 text-slate-400" />
             Copy Note Text
           </button>
           <button 
            onClick={handleSignEncounter}
            className="px-8 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-sans font-black text-xs rounded-xl shadow-lg hover:shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-2"
           >
             <FileText className="w-4 h-4 text-indigo-200" />
             Sign & Finalize Encounter
           </button>
         </div>
      </div>
    </div>
  );
}
