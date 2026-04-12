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

  const templates = useLiveQuery(() => 
    db.templates
      .where('category')
      .equals('soap_note')
      .filter(t => !t.userId || t.userId === currentUser?.email)
      .toArray()
  ) || [];

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

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
              {patientName && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <User className="w-3 h-3" />
                  Patient: {patientName}
                </div>
              )}
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
          <div className="flex-1 flex flex-col p-6 space-y-4">
            <div className="flex-1 relative">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                placeholder="Subjective:\nObjective:\nAssessment:\nPlan:"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={handleCopy}
                  title="Copy to clipboard"
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors shadow-sm"
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
