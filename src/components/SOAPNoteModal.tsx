import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  X, 
  Save, 
  Copy, 
  FolderOpen, 
  Plus, 
  Trash2, 
  CheckCircle2,
  Clock,
  User,
  Sparkles
} from 'lucide-react';
import { db, Template } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useUser } from '@/lib/UserContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { generateContentWithRetry } from '@/utils/gemini';

interface SOAPNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent: string;
  onSave?: (content: string) => void;
  patientName?: string;
}

export function SOAPNoteModal({ isOpen, onClose, initialContent, onSave, patientName }: SOAPNoteModalProps) {
  const { profile: currentUser } = useUser();
  const [content, setContent] = useState(initialContent);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');
  const [isBeautifying, setIsBeautifying] = useState(false);

  const templates = useLiveQuery(() => 
    db.templates
      .where('category')
      .equals('soap_note')
      .filter(t => !t.userId || t.userId === currentUser?.email)
      .toArray()
  , [currentUser?.email]) || [];

  const parseSOAP = (text: string) => {
    const sections = { subjective: '', objective: '', assessment: '', plan: '' };
    if (!text) return sections;

    // More robust regex to handle markdown, colons, and different spacing
    // Matches: "Subjective:", "S:", "### Subjective", "**Subjective**", etc.
    const findSection = (headerKeywords: string[], nextKeywords: string[]) => {
      const headerReg = new RegExp(`(?:^|\\n)(?:#+\\s*|\\*+)?(?:${headerKeywords.join('|')})[:\\s]*\\*?`, 'i');
      const nextReg = new RegExp(`(?:^|\\n)(?:#+\\s*|\\*+)?(?:${nextKeywords.join('|')})[:\\s]*\\*?`, 'i');
      
      const start = text.search(headerReg);
      if (start === -1) return "";

      // Find where the actual content starts after the header match
      const match = text.match(headerReg);
      const contentStart = start + (match ? match[0].length : 0);
      
      // Find the start of the next section
      let contentEnd = text.length;
      const nextMatch = text.slice(contentStart).search(nextReg);
      if (nextMatch !== -1) {
        contentEnd = contentStart + nextMatch;
      }

      return text.slice(contentStart, contentEnd).trim();
    };

    sections.subjective = findSection(['Subjective', 'S'], ['Objective', 'Assessment', 'Plan', 'O', 'A', 'P']);
    sections.objective = findSection(['Objective', 'O'], ['Subjective', 'Assessment', 'Plan', 'S', 'A', 'P']);
    sections.assessment = findSection(['Assessment', 'A'], ['Subjective', 'Objective', 'Plan', 'S', 'O', 'P']);
    sections.plan = findSection(['Plan', 'P'], ['Subjective', 'Objective', 'Assessment', 'S', 'O', 'A']);

    // If it's totally unformatted but has content, put it all in subjective for basic visualization
    if (!sections.subjective && !sections.objective && !sections.assessment && !sections.plan && text.trim()) {
      sections.subjective = text.trim();
    }
    
    return sections;
  };

  const [sections, setSections] = useState(parseSOAP(initialContent));

  useEffect(() => {
    setContent(initialContent);
    setSections(parseSOAP(initialContent));
  }, [initialContent]);

  const updateSection = (key: keyof typeof sections, value: string) => {
    const newSections = { ...sections, [key]: value };
    setSections(newSections);
    const reconstructed = `Subjective:\n${newSections.subjective}\n\nObjective:\n${newSections.objective}\n\nAssessment:\n${newSections.assessment}\n\nPlan:\n${newSections.plan}`;
    setContent(reconstructed);
  };

  const handleBeautify = async () => {
    if (!content.trim()) return;
    setIsBeautifying(true);
    try {
      const prompt = `Refine and beautify the following clinical SOAP note into a highly professional, well-structured format. 
      Ensure clear headings (Subjective:, Objective:, Assessment:, Plan:), expand medical abbreviations where appropriate for clarity, organize findings into bullet points, and use formal clinical language. 
      
      Original Note:
      ${content}
      
      Return ONLY the refined SOAP note text.`;
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }]
      });
      
      const refinedText = response.text || content;
      setContent(refinedText);
      setSections(parseSOAP(refinedText));
      toast.success("Note professionally formatted");
    } catch (err) {
      console.error("Beautify failed:", err);
      toast.error("Failed to format note");
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
        id: crypto.randomUUID(),
        name: templateName,
        category: 'soap_note',
        content: content,
        userId: currentUser?.email,
        lastModified: Date.now()
      });
      toast.success("Template saved successfully");
      setIsSavingTemplate(false);
      setTemplateName("");
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleApplyTemplate = (template: Template) => {
    setContent(template.content);
    setSections(parseSOAP(template.content));
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await db.templates.delete(id);
        toast.success("Template deleted");
      } catch (error) {
        toast.error("Failed to delete template");
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                SOAP Note Editor
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {patientName && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    {patientName}
                  </div>
                )}
                <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-md">
                  <button 
                    onClick={() => setViewMode('structured')}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded transition-all",
                      viewMode === 'structured' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
                    )}
                  > Structured </button>
                  <button 
                    onClick={() => setViewMode('raw')}
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-bold rounded transition-all",
                      viewMode === 'raw' ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm" : "text-slate-500"
                    )}
                  > Raw </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                showTemplates ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              )}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Templates
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Main Editor */}
          <div className="flex-1 flex flex-col p-8 space-y-6">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              {/* Header Context Section - Clinical Overview Style */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-headline text-2xl font-bold text-blue-900 dark:text-blue-400">Clinical SOAP Note</h2>
                    {content && (
                      <div className="flex bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-800">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">AI Synthesized</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Structured encounter documentation with AI-powered synthesis</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl border border-outline-variant/10">
                  <button 
                    onClick={() => setViewMode('structured')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
                      viewMode === 'structured' 
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
                    )}
                  >
                    <span className="material-symbols-outlined text-sm">dashboard</span>
                    Structured View
                  </button>
                  <button 
                    onClick={() => setViewMode('raw')}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all",
                      viewMode === 'raw' 
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 font-medium"
                    )}
                  >
                    <span className="material-symbols-outlined text-sm">subject</span>
                    Raw Text
                  </button>
                </div>
              </div>

              {isBeautifying ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-900/50 rounded-3xl border border-outline-variant/10 shadow-sm"
                >
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-50 dark:border-blue-900/30 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="mt-8 font-headline text-lg font-bold text-blue-900 dark:text-blue-200 tracking-tight">Synthesizing Encounter Data...</h3>
                  <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm max-w-[280px] text-center">
                    Applying clinical reasoning, expanding medical shorthand, and structuring findings.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {viewMode === 'structured' ? (
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
                           onClick={handleBeautify}
                           disabled={isBeautifying}
                           className={cn(
                             "flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100",
                             isBeautifying && "opacity-50 cursor-not-allowed"
                           )}
                         >
                           <Sparkles className="w-3.5 h-3.5" />
                           Improve & Auto-format Notes
                         </button>
                      </div>
                    {[
                      { id: 'subjective', label: 'Subjective', icon: 'chat_bubble' },
                      { id: 'objective', label: 'Objective', icon: 'visibility' },
                      { id: 'assessment', label: 'Assessment', icon: 'assignment_turned_in' },
                      { id: 'plan', label: 'Plan', icon: 'event_note' }
                    ].map((section) => (
                      <section key={section.id} className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
                        <div className="px-6 py-3 border-b border-outline-variant/10 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">{section.icon}</span>
                            <h3 className="font-headline font-bold text-blue-900 dark:text-blue-400 text-sm tracking-tight">{section.label}</h3>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{section.id.charAt(0)}</span>
                        </div>
                        <div className="p-4">
                          <textarea 
                            value={(sections as any)[section.id]}
                            onChange={(e) => updateSection(section.id as any, e.target.value)}
                            className="w-full min-h-[120px] text-sm border-none bg-surface-container-low dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 rounded-xl p-4 text-on-surface dark:text-slate-300 resize-none transition-all leading-relaxed"
                            placeholder={`Complete ${section.label.toLowerCase()} section...`}
                          />
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
                    className="h-full flex flex-col space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Raw Clinical Text</p>
                       <button 
                         onClick={handleBeautify}
                         disabled={isBeautifying}
                         className={cn(
                           "flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold transition-all border border-indigo-100 dark:border-indigo-900/50",
                           isBeautifying ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-100"
                         )}
                       >
                         <Sparkles className={cn("w-3 h-3", isBeautifying && "animate-spin")} />
                         {isBeautifying ? "Thinking..." : "Beautify & Format"}
                       </button>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800 p-8 min-h-[500px]">
                      <textarea 
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value);
                          setSections(parseSOAP(e.target.value));
                        }}
                        className="w-full h-full bg-transparent border-none font-mono text-sm leading-relaxed outline-none resize-none text-slate-700 dark:text-slate-300"
                        placeholder="Subjective:\nObjective:\nAssessment:\nPlan:"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            </div>
            
            <div className="flex justify-between items-center no-print">
               <div className="flex items-center gap-2">
                 <button 
                   onClick={handleCopy}
                   className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
                   title="Copy to clipboard"
                 >
                   <Copy className="w-4 h-4" />
                 </button>
               </div>
            </div>

            {isSavingTemplate ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30"
              >
                <input 
                  type="text" 
                  placeholder="Template Name (e.g. Common Cold Shorthand)"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button 
                  onClick={handleSaveTemplate}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700"
                >
                  Save
                </button>
                <button 
                  onClick={() => setIsSavingTemplate(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => setIsSavingTemplate(true)}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save as personal shorthand template
                </button>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 italic">
                  <Sparkles className="w-3 h-3" />
                  AI can help refine this note
                </div>
              </div>
            )}
          </div>

          {/* Templates Sidebar */}
          <AnimatePresence>
            {showTemplates && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Templates</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {templates.length > 0 ? (
                    templates.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => handleApplyTemplate(t)}
                        className="group p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all relative"
                      >
                        <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 pr-6">{t.name}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{t.content}</p>
                        <div className="mt-2 flex items-center gap-2 text-[8px] text-slate-400">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(t.lastModified).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={(e) => handleDeleteTemplate(e, t.id!)}
                          className="absolute top-3 right-3 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 opacity-50">
                      <FolderOpen className="w-8 h-8 mb-2" />
                      <p className="text-xs">No templates saved yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (onSave) onSave(content);
              onClose();
            }}
            className="px-8 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalize Note
          </button>
        </div>
      </motion.div>
    </div>
  );
}
