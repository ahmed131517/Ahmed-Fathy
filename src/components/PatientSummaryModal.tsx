import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Share2, Smartphone, Mail, X, CheckCircle2, AlertTriangle, Clock, Info, Globe, Languages, RefreshCw } from "lucide-react";
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { generateContentWithRetry } from "@/utils/gemini";
import { getTranslationPrompt } from "@/services/aiConfig";
import { cn } from "@/lib/utils";

interface PatientSummaryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  summaryText: string;
  planText?: string;
  diagnosis: string;
}

export function PatientSummaryModal({ 
  isOpen, 
  onOpenChange, 
  patientName, 
  summaryText, 
  planText,
  diagnosis 
}: PatientSummaryModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translations, setTranslations] = useState<{
    summary: string;
    diagnosis: string;
    plan: string;
  }>({
    summary: summaryText,
    diagnosis: diagnosis,
    plan: planText || ""
  });

  const availableLanguages = [
    { name: 'English', flag: '🇺🇸' },
    { name: 'Spanish', flag: '🇪🇸' },
    { name: 'Arabic', flag: '🇸🇦' },
    { name: 'French', flag: '🇫🇷' },
    { name: 'German', flag: '🇩🇪' },
    { name: 'Hindi', flag: '🇮🇳' },
    { name: 'Chinese', flag: '🇨🇳' }
  ];

  useEffect(() => {
    // Reset translations when input text changes
    setTranslations({
      summary: summaryText,
      diagnosis: diagnosis,
      plan: planText || ""
    });
    setTargetLanguage('English');
  }, [summaryText, diagnosis, planText]);

  const handleTranslate = async (lang: string) => {
    if (lang === 'English') {
      setTranslations({
        summary: summaryText,
        diagnosis: diagnosis,
        plan: planText || ""
      });
      setTargetLanguage('English');
      return;
    }

    setIsTranslating(true);
    setTargetLanguage(lang);
    try {
      const prompt = `You are a medical translator. Translate the following fields into ${lang}. 
      Keep medical accuracy but ensure the tone is compassionate for a patient.
      Return exactly as a JSON object with keys: "summary", "diagnosis", "plan".
      
      Fields to translate:
      Summary: ${summaryText}
      Diagnosis: ${diagnosis}
      Plan: ${planText || "N/A"}
      `;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text);
      setTranslations(result);
      toast.success(`Translated to ${lang}`);
    } catch (err) {
      console.error("Translation failed:", err);
      toast.error("Translation failed. Please try again.");
      setTargetLanguage('English');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text('Patient Care Summary', 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Patient: ${patientName}`, 20, 28);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 33);
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(20, 38, pageWidth - 20, 38);

      // Diagnosis Section
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text('Diagnosis', 20, 50);
      doc.setFontSize(11);
      doc.text(translations.diagnosis, 20, 58);

      // Plan Section
      let currentY = 70;
      if (translations.plan) {
        doc.setFontSize(14);
        doc.text('Your Treatment Plan', 20, currentY);
        doc.setFontSize(10);
        
        const splitPlan = doc.splitTextToSize(translations.plan, pageWidth - 40);
        doc.text(splitPlan, 20, currentY + 8);
        currentY += (splitPlan.length * 5) + 15;
      }

      // Education Section
      doc.setFontSize(14);
      doc.text('Health Education', 20, currentY);
      doc.setFontSize(10);
      const splitSummary = doc.splitTextToSize(translations.summary.replace(/[#*]/g, ''), pageWidth - 40);
      doc.text(splitSummary, 20, currentY + 8);

      // Footer
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text('Consult your doctor if symptoms worsen. This summary is for educational purposes only.', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }

      doc.save(`Patient_Summary_${patientName.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF generated successfully");
    } catch (err) {
      console.error("PDF Export failed:", err);
      toast.error("Failed to generate PDF");
    }
  };

  const currentSummary = translations.summary;
  const currentDiagnosis = translations.diagnosis;
  const currentPlan = translations.plan;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white relative">
          <div className="absolute top-4 right-4">
             <button 
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
             >
                <X className="w-5 h-5 text-white/80" />
             </button>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white tracking-tight">Patient Care Loop</DialogTitle>
              <DialogDescription className="text-white/80 text-sm font-medium">Simplified summary for {patientName}</DialogDescription>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
               {availableLanguages.slice(0, 4).map((lang) => (
                 <button
                   key={lang.name}
                   onClick={() => handleTranslate(lang.name)}
                   disabled={isTranslating}
                   className={cn(
                     "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                     targetLanguage === lang.name 
                      ? "bg-white text-indigo-600 shadow-lg scale-105" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                   )}
                 >
                   <span>{lang.flag}</span>
                   <span className="hidden md:inline">{lang.name}</span>
                 </button>
               ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 custom-scrollbar">
          {isTranslating && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Globe className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 text-sm">Translating Clinical Plan...</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Applying Cultural Sensitivity</p>
                </div>
              </div>
            </div>
          )}
          {/* Mobile Preview View */}
          <div className="max-w-md mx-auto bg-white rounded-[2.5rem] border-[12px] border-slate-900 shadow-2xl overflow-hidden relative aspect-[9/19]">
            <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 flex justify-center items-end pb-1">
              <div className="w-20 h-4 bg-slate-900 rounded-full"></div>
            </div>
            
            <div className="h-full pt-10 pb-8 px-6 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 font-bold">
                  {patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{patientName}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

                  <div className="space-y-6">
                  {/* Current Diagnosis */}
                  <section className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                     <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                       <CheckCircle2 className="w-3 h-3" /> Current Status
                     </h5>
                     <p className="text-sm font-bold text-slate-800">{currentDiagnosis}</p>
                  </section>

                  {/* The Plan */}
                  {currentPlan && (
                    <section>
                       <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                         <CheckSquare className="w-3 h-3" /> Your Care Plan
                       </h5>
                       <div className="text-xs text-slate-600 leading-relaxed space-y-2 whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                         {currentPlan}
                       </div>
                    </section>
                  )}

                  {/* Learning More */}
                  <section>
                     <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                       <Info className="w-3 h-3" /> Understanding Your Health
                     </h5>
                     <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed text-slate-600 font-medium">
                       <Markdown>{currentSummary}</Markdown>
                     </div>
                  </section>

                 {/* Emergency Flag */}
                 <section className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-700 mb-2">
                       <AlertTriangle className="w-4 h-4" />
                       <h5 className="text-xs font-bold">When to seek help</h5>
                    </div>
                    <p className="text-[10px] text-rose-600 leading-relaxed">
                      If you experience sudden shortness of breath, severe chest pain, or a fever over 39°C, please visit the emergency room immediately.
                    </p>
                 </section>
              </div>

              <div className="mt-auto pt-8 flex flex-col items-center gap-4">
                 <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-2">
                    <div className="w-full h-full bg-slate-200 rounded grid grid-cols-4 grid-rows-4 gap-1 p-1 opacity-50">
                       {[...Array(16)].map((_, i) => <div key={i} className="bg-slate-400 rounded-sm"></div>)}
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold mt-2 uppercase">Scan to sync</p>
                 </div>
                 <p className="text-[10px] text-slate-300 font-medium">Powered by Antigravity Health Hub</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-white border-t border-slate-100 gap-4 sm:justify-center">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="px-8 py-6 rounded-2xl border-indigo-100 text-indigo-600 font-bold hover:bg-indigo-50 flex gap-2"
          >
            <FileDown className="w-5 h-5" /> Export PDF Summary
          </Button>
          <Button 
            className="px-8 py-6 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 flex gap-2 shadow-xl shadow-indigo-100"
            onClick={() => {
              toast.success("Care plan sent to patient's mobile app");
              onOpenChange(false);
            }}
          >
            <Share2 className="w-5 h-5" /> Push to Patient App
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Internal icons helper for the modal
function CheckSquare({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}
