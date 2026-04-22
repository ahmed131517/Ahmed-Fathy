import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';

function CheckListItem({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
import { generateContentWithRetry, parseJsonResponse } from "../utils/gemini";
import { db } from "../lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export function SOAPNotePage() {
  const { selectedPatient } = usePatient();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [sections, setSections] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
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
  const [interactions, setInteractions] = useState<{ severity: 'Minor' | 'Moderate' | 'Major'; description: string }[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  // Task Extraction States
  const [suggestedTasks, setSuggestedTasks] = useState<{ title: string; type: any; priority: any }[]>([]);
  const [isExtractingTasks, setIsExtractingTasks] = useState(false);
  const [committedTasks, setCommittedTasks] = useState<string[]>([]);

  // Initialize content from drafts or session storage
  useEffect(() => {
    const loadInitialData = async () => {
      // 1. Try to load from persistent Dexie drafts first
      if (selectedPatient?.id) {
        const draft = await db.clinical_drafts.where('id').equals(`soap_${selectedPatient.id}`).first();
        if (draft && draft.content) {
          setSections(draft.content);
          setLastSaved(draft.lastModified);
          return;
        }
      }

      // 2. Fallback to session storage (for AI-generated notes)
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
    if (!sections.plan.trim()) return;

    const timer = setTimeout(() => {
      if (selectedPatient?.medications?.length) checkInteractions();
      extractTasks();
    }, 2000);

    return () => clearTimeout(timer);
  }, [sections.plan]);

  const checkInteractions = async () => {
    if (!sections.plan.trim() || !selectedPatient?.medications?.length) {
      setInteractions([]);
      return;
    }

    setIsCheckingInteractions(true);
    try {
      const prompt = `Act as a clinical decision support system. Analyze the following patient medications and the proposed plan. 
      Identify ANY potential drug-drug interactions between the patient's existing medications and the new treatments mentioned in the plan.
      
      Patient Existing Medications: ${JSON.stringify(selectedPatient.medications)}
      Proposed Treatment Plan:
      ${sections.plan}
      
      Return a JSON array of objects with the following structure:
      [
        {
          "severity": "Minor" | "Moderate" | "Major",
          "description": "Short explanation of the interaction..."
        }
      ]
      If no interactions are found, return exactly []. 
      Only include active interactions.`;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseMimeType: "application/json"
        }
      });

      const results = parseJsonResponse(response.text, []);
      setInteractions(results);
    } catch (err) {
      console.error("DDI Check failed:", err);
    } finally {
      setIsCheckingInteractions(false);
    }
  };

  const extractTasks = async () => {
    if (!sections.plan.trim()) {
      setSuggestedTasks([]);
      return;
    }

    setIsExtractingTasks(true);
    try {
      const prompt = `Analyze the following clinical treatment plan and extract actionable tasks for the medical staff (nurses, receptionists, or the doctor). 
      Identify things like laboratory orders, follow-up scheduling, referrals, or specific patient outreach.
      
      Plan:
      ${sections.plan}
      
      Return a JSON array of objects with the following structure:
      [
        {
          "title": "Short descriptive title (e.g., Order CBC/Diff)",
          "type": "follow-up" | "lab-review" | "outreach" | "other",
          "priority": "high" | "medium" | "low"
        }
      ]
      If no actionable tasks are found, return exactly [].`;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const results = parseJsonResponse(response.text, []);
      setSuggestedTasks(results);
    } catch (err) {
      console.error("Task extraction failed:", err);
    } finally {
      setIsExtractingTasks(false);
    }
  };

  const commitTask = async (task: any) => {
    if (!selectedPatient) return;
    
    try {
      await db.tasks.add({
        title: task.title,
        status: 'pending',
        type: task.type,
        priority: task.priority,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        dueDate: new Date().toISOString(),
        createdAt: Date.now(),
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });
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
    const plan = text.match(/(?:Plan:|P:)\s*([\s\S]*?)(?=(?:Subjective:|S:|Objective:|O:|Assessment:|A:|$))/i)?.[1]?.trim() || "";

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
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const refinedText = response.text || textToProcess;
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

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Main Content Area */}
      <div className="p-8 space-y-6 pb-24 max-w-5xl mx-auto w-full">
        {/* Header Title Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="font-headline text-2xl font-bold text-blue-900">Clinical SOAP Note Editor</h2>
              {content && (
                <div className="flex bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                   <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                   <span className="text-xs font-bold text-blue-700">AI Synthesized</span>
                </div>
              )}

              {isSaving ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                  <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">Auto-saving...</span>
                </div>
              ) : lastSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                    Saved to Clinical Cloud {new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
            <Link 
              to="/medical-records"
              className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              back to Medical Records
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-4">
              <button 
                onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  isSavingTemplate ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <Save className="w-4 h-4" />
                Save as Template
              </button>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  showTemplates ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                My Templates
              </button>
              <button 
                onClick={() => setShowTasks(!showTasks)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  showTasks ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                )}
              >
                <ClipboardList className="w-4 h-4" />
                Orders & Tasks
              </button>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-outline-variant/10">
              <button 
                onClick={() => setViewMode('structured')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
                viewMode === 'structured' 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 font-medium"
              )}
            >
              <span className="material-symbols-outlined text-sm">dashboard</span>
              Structured
            </button>
            <button 
              onClick={() => setViewMode('raw')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
                viewMode === 'raw' 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 font-medium"
              )}
            >
              <span className="material-symbols-outlined text-sm">subject</span>
              Raw text
            </button>
          </div>
        </div>
      </div>

      {/* Template Quick Save Bar */}
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
                  className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Main Editor Logic */}
        <div className="grid grid-cols-12 gap-6 pb-20">
          {/* Main Workspace */}
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
                  className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-outline-variant/10 shadow-sm"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="mt-8 font-headline text-lg font-bold text-blue-900 tracking-tight">Synthesizing Encounter Data...</h3>
                  <p className="mt-2 text-slate-500 text-sm max-w-[280px] text-center">
                    Applying clinical reasoning, expanding medical shorthand, and structuring findings.
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
                   <div className="flex items-center justify-between mb-2 px-2">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Record Sections</h4>
                     <button 
                       onClick={() => handleBeautify()}
                       className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold transition-all border border-indigo-100 hover:bg-indigo-100"
                     >
                       <Sparkles className="w-3.5 h-3.5" />
                       Improve & Auto-format Notes
                     </button>
                  </div>
                  
                  {[
                    { id: 'subjective', label: 'Subjective', icon: 'chat_bubble', hint: 'History of present illness, symptoms, SOCIAL history' },
                    { id: 'objective', label: 'Objective', icon: 'visibility', hint: 'Physical exam findings, vitals, lab results' },
                    { id: 'assessment', label: 'Assessment', icon: 'assignment_turned_in', hint: 'Diagnoses, clinical reasoning, prioritized list' },
                    { id: 'plan', label: 'Plan', icon: 'event_note', hint: 'Medications, follow-up, patient education, referrals' }
                  ].map((section) => (
                    <section key={section.id} className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden hover:border-primary/20 transition-all">
                      <div className="px-6 py-4 border-b border-outline-variant/10 bg-slate-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary">{section.icon}</span>
                          <h3 className="font-headline font-bold text-slate-800 text-sm tracking-tight">{section.label}</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{section.id}</span>
                      </div>
                      <div className="p-4 bg-white">
                        <textarea 
                          value={(sections as any)[section.id]}
                          onChange={(e) => updateSection(section.id as any, e.target.value)}
                          className="w-full min-h-[160px] text-sm border-none bg-slate-50/50 focus:ring-2 focus:ring-primary/10 rounded-xl p-4 text-slate-700 resize-none transition-all leading-relaxed custom-scrollbar"
                          placeholder={`${section.hint}...`}
                        />
                        
                        {section.id === 'plan' && (
                          <div className="mt-4 flex flex-col gap-2">
                             {isCheckingInteractions && (
                               <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold animate-pulse px-2">
                                 <RefreshCw className="w-3 h-3 animate-spin" />
                                 Scanning for Drug Interactions...
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
                                     "p-3 rounded-xl border flex gap-3 items-start",
                                     alert.severity === 'Major' ? "bg-red-50 border-red-100 text-red-700" :
                                     alert.severity === 'Moderate' ? "bg-amber-50 border-amber-100 text-amber-700" :
                                     "bg-blue-50 border-blue-100 text-blue-700"
                                   )}
                                 >
                                   <div className={cn(
                                      "p-1.5 rounded-lg",
                                      alert.severity === 'Major' ? "bg-red-100" : "bg-amber-100"
                                   )}>
                                     <AlertTriangle className={cn("w-3.5 h-3.5", alert.severity === 'Major' ? "text-red-600" : "text-amber-600")} />
                                   </div>
                                   <div>
                                     <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5">{alert.severity} Interaction Alert</p>
                                     <p className="text-xs leading-relaxed font-medium">{alert.description}</p>
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
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinical Synthesis View</p>
                     <button 
                       onClick={() => handleBeautify()}
                       className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                     >
                       <Sparkles className="w-3 h-3" />
                       Manually Re-format Note
                     </button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 min-h-[500px] shadow-sm">
                    <textarea 
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        setSections(parseSOAP(e.target.value));
                      }}
                      className="w-full h-full min-h-[450px] bg-transparent border-none font-sans text-base font-medium leading-relaxed outline-none resize-none text-slate-700 dark:text-slate-300 custom-scrollbar"
                      placeholder="Enter raw note content here..."
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Templates (Transitions in) */}
          <AnimatePresence>
            {showTemplates && (
              <motion.aside 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="col-span-12 lg:col-span-4"
              >
                <div className="sticky top-24 bg-surface-container-low rounded-2xl border border-outline-variant/10 p-6 flex flex-col h-[calc(100vh-140px)] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-headline font-bold text-sm text-slate-800 flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      Saved Templates
                    </h4>
                    <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {templates?.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs text-slate-400">No templates saved yet.</p>
                      </div>
                    )}
                    {templates?.map((tpl) => (
                      <div 
                        key={tpl.id} 
                        className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative"
                        onClick={() => handleApplyTemplate(tpl.content)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="text-xs font-bold text-slate-700">{tpl.name}</h5>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              db.templates.delete(tpl.id!);
                              toast.success("Template deleted");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                          {tpl.content}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(tpl.lastModified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <button 
                      onClick={() => setIsSavingTemplate(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Template
                    </button>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Orders & Tasks Sidebar */}
          <AnimatePresence>
            {showTasks && (
              <motion.aside 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className={cn("transition-all duration-300", 
                  showTemplates ? "lg:col-span-4" : "lg:col-span-4"
                )}
              >
                <div className="bg-white rounded-3xl border border-outline-variant/10 shadow-sm p-6 sticky top-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                       <ClipboardList className="w-5 h-5 text-emerald-600" />
                       <h3 className="font-headline font-bold text-slate-800 text-sm">Orders & Tasks</h3>
                    </div>
                    <button onClick={() => setShowTasks(false)} className="text-slate-300 hover:text-slate-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {isExtractingTasks && (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold animate-pulse px-2 pb-4">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Analyzing Plan for Actionable Orders...
                      </div>
                    )}

                    {!isExtractingTasks && suggestedTasks.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckListItem className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-xs text-slate-400 font-medium">No tasks detected in the Plan yet.</p>
                      </div>
                    )}

                    {suggestedTasks.map((task, idx) => {
                      const isCommitted = committedTasks.includes(task.title);
                      return (
                        <div 
                          key={idx}
                          className={cn(
                            "group p-4 rounded-2xl border transition-all relative overflow-hidden",
                            isCommitted 
                              ? "bg-slate-50 border-slate-100 opacity-60" 
                              : "bg-white border-slate-100 hover:border-emerald-200 hover:shadow-md cursor-pointer"
                          )}
                          onClick={() => !isCommitted && commitTask(task)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-xl flex-shrink-0 transition-colors",
                              isCommitted ? "bg-slate-200" : "bg-emerald-50 group-hover:bg-emerald-100"
                            )}>
                              {isCommitted ? <CheckCircle2 className="w-4 h-4 text-slate-500" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center justify-between mb-1">
                                 <span className={cn(
                                   "text-[9px] font-bold uppercase tracking-widest",
                                   task.priority === 'high' ? "text-rose-500" : "text-slate-400"
                                 )}>
                                   {task.priority || 'standard'} • {task.type || 'order'}
                                 </span>
                                 {isCommitted && (
                                   <span className="text-[9px] text-slate-400 font-medium">
                                     Committed {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                 )}
                               </div>
                               <h4 className={cn(
                                 "text-xs font-bold truncate",
                                 isCommitted ? "text-slate-400 line-through" : "text-slate-700"
                               )}>{task.title}</h4>
                            </div>
                          </div>
                          
                          {!isCommitted && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">Commit Task</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                       <User className="w-3 h-3" />
                       Handoff Summary
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[11px] text-slate-600 italic leading-relaxed">
                        "Nursing: Please perform the {suggestedTasks.length} pending orders identified in the plan for {selectedPatient?.name || 'this patient'}."
                      </p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Persistence Bar / Signature Hub */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/10 p-4 shadow-2xl flex items-center justify-center gap-6 z-50 no-print">
         <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
           <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
           </div>
           <div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-save Active</p>
             <p className="text-xs font-medium text-slate-600">Last updated: Just now</p>
           </div>
         </div>
         
         <div className="flex gap-4">
           <button 
            onClick={handleCopy}
            className="px-6 py-3 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 flex items-center gap-2"
           >
             <Copy className="w-4 h-4" />
             Copy Note
           </button>
           <button 
            onClick={handleSignEncounter}
            className="px-10 py-3 bg-primary text-white font-headline font-bold text-sm rounded-xl shadow-lg hover:bg-primary-container active:scale-95 transition-all flex items-center gap-2"
           >
             <FileText className="w-4 h-4" />
             Sign & Close Note
           </button>
         </div>
      </div>
    </div>
  );
}
