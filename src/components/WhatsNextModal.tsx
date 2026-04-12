import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FlaskConical, Stethoscope, ArrowRight, ClipboardCheck, Loader2, Brain } from "lucide-react";
import { generateContentWithRetry, parseJsonResponse } from "../utils/gemini";
import { toast } from "sonner";

interface SelectedSymptom {
  id: string;
  label: string;
  category: string;
  status: 'incomplete' | 'analyzed' | 'red_flag';
  analysisData?: Record<string, string[]>;
}

interface WhatsNextModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symptoms: SelectedSymptom[];
  patientData?: any;
}

interface Recommendation {
  type: "lab" | "exam" | "imaging" | "referral";
  text: string;
  priority: "urgent" | "routine" | "recommended";
  reason: string;
}

const typeIcons: Record<string, React.ElementType> = {
  lab: FlaskConical,
  exam: Stethoscope,
  imaging: ClipboardCheck,
  referral: ArrowRight,
};

const priorityStyles: Record<string, { badge: "destructive" | "default" | "secondary"; label: string }> = {
  urgent: { badge: "destructive", label: "Urgent" },
  routine: { badge: "default", label: "Routine" },
  recommended: { badge: "secondary", label: "Recommended" },
};

const sectionLabels: Record<string, string> = {
  lab: "Laboratory Tests",
  exam: "Physical Examinations",
  imaging: "Imaging Studies",
  referral: "Referrals",
};

// Simple ScrollArea and Separator components since they are missing from ui/
const ScrollArea = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`overflow-y-auto ${className}`}>
    {children}
  </div>
);

const Separator = () => <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />;

export const WhatsNextModal = ({ open, onOpenChange, symptoms, patientData }: WhatsNextModalProps) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [clinicalReasoning, setClinicalReasoning] = useState("");
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchWorkup = async () => {
    if (symptoms.length === 0) return;
    
    setLoading(true);
    setError("");
    setRecommendations([]);
    setClinicalReasoning("");

    const symptomsPayload = symptoms.map(s => ({
      label: s.label,
      status: s.status,
      analysisDetails: s.analysisData ? Object.entries(s.analysisData).map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`).join("; ") : "",
    }));

    const prompt = `
      As a clinical assistant, analyze the following patient symptoms and context to recommend the next steps in their medical workup.
      
      Patient Context:
      ${JSON.stringify(patientData || {}, null, 2)}
      
      Selected Symptoms:
      ${JSON.stringify(symptomsPayload, null, 2)}
      
      Return a JSON object with:
      - recommendations: Array of objects with { type: "lab" | "exam" | "imaging" | "referral", text: string, priority: "urgent" | "routine" | "recommended", reason: string }
      - clinicalReasoning: string (brief clinical reasoning for these recommendations)
      
      Only return the JSON object.
    `;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const data = parseJsonResponse<any>(response.text, { recommendations: [], clinicalReasoning: "" });
      
      setRecommendations(data?.recommendations || []);
      setClinicalReasoning(data?.clinicalReasoning || "");
      setFetched(true);
    } catch (err: any) {
      setError(err.message || "Failed to get recommendations");
      toast.error(err.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setFetched(false);
      setRecommendations([]);
      setClinicalReasoning("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  useEffect(() => {
    if (open && symptoms.length > 0 && !fetched && !loading) {
      fetchWorkup();
    }
  }, [open, symptoms, fetched, loading]);

  const grouped = recommendations.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-600" /> AI Recommended Workup
          </DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>AI-generated recommendations for educational guidance only. Clinical judgment must always prevail.</p>
        </div>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 p-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <p className="text-sm text-slate-500">Analyzing symptoms and patient data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-sm text-red-600">{error}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={fetchWorkup}>Retry</Button>
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Select symptoms to generate recommendations.</p>
            ) : (
              <>
                {clinicalReasoning && (
                  <div className="rounded-lg border bg-slate-50 dark:bg-slate-900 p-3 text-sm text-slate-600 dark:text-slate-400">
                    <strong className="text-slate-900 dark:text-slate-100">Clinical Reasoning:</strong> {clinicalReasoning}
                  </div>
                )}
                {Object.entries(grouped).map(([type, recs]) => {
                  const Icon = typeIcons[type] || ClipboardCheck;
                  return (
                    <div key={type} className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-500 uppercase tracking-wider">
                        <Icon className="h-4 w-4" /> {sectionLabels[type] || type}
                      </h4>
                      <div className="space-y-1.5">
                        {recs.map((r, i) => {
                          const ps = priorityStyles[r.priority] || priorityStyles.recommended;
                          return (
                            <div key={i} className="flex items-center gap-3 rounded-lg border p-3 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{r.text}</p>
                                <p className="text-xs text-slate-500">Reason: {r.reason}</p>
                              </div>
                              <Badge variant={ps.badge} className="text-[10px] shrink-0">{ps.label}</Badge>
                            </div>
                          );
                        })}
                      </div>
                      <Separator />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
