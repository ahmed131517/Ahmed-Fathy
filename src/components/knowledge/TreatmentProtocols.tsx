import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, Activity, ShieldCheck, Info, Loader2, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateContentWithRetry } from "@/utils/gemini";
import { Type } from "@google/genai";
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { SavedKnowledgeService } from '@/lib/SavedKnowledgeService';
import { Bookmark, Check } from 'lucide-react';

interface Protocol {
  condition: string;
  firstLine: string[];
  secondLine: string[];
  monitoring: string[];
  lifestyle: string[];
  clinicalPearls: string;
}

const commonConditions = [
  "Hypertension",
  "Type 2 Diabetes Mellitus",
  "Asthma (Acute Exacerbation)",
  "Community-Acquired Pneumonia",
  "Heart Failure (HFrEF)",
  "Atrial Fibrillation",
  "Urinary Tract Infection (Uncomplicated)",
  "Hyperlipidemia",
  "Major Depressive Disorder",
  "Gastroesophageal Reflux Disease (GERD)"
];

export function TreatmentProtocols() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [selectedCondition]);

  const handleSave = async () => {
    if (!selectedCondition || !protocol) return;
    
    let currentUser = user;
    if (!currentUser) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
        setUser(currentUser);
      } catch (error) {
        console.error("Error signing in:", error);
        return;
      }
    }

    try {
      await SavedKnowledgeService.saveKnowledge('protocol', selectedCondition, protocol);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving protocol:", error);
    }
  };

  const filteredConditions = commonConditions.filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchProtocol = async (condition: string) => {
    setSelectedCondition(condition);
    setLoading(true);
    setProtocol(null);

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Provide a clinical treatment protocol for: ${condition}. Include first-line therapy, second-line therapy, monitoring parameters, lifestyle modifications, and clinical pearls.`,
        config: {
          systemInstruction: "You are a senior clinical physician. Provide evidence-based, concise treatment protocols following current international guidelines (e.g., ACC/AHA, ADA, GINA). Return the response as a JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING },
              firstLine: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary pharmacological or non-pharmacological interventions." },
              secondLine: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Alternative or add-on therapies." },
              monitoring: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key parameters to track (labs, symptoms, etc.)." },
              lifestyle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Non-pharmacological recommendations." },
              clinicalPearls: { type: Type.STRING, description: "Key clinical tips or warnings." }
            },
            required: ["condition", "firstLine", "secondLine", "monitoring", "lifestyle", "clinicalPearls"]
          }
        }
      });

      if (response.text) {
        setProtocol(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error fetching protocol:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Condition List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conditions..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 bg-white border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Common Conditions</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
              {filteredConditions.map((condition, i) => (
                <button
                  key={i}
                  onClick={() => fetchProtocol(condition)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-white transition-all group flex items-center justify-between",
                    selectedCondition === condition ? "bg-white ring-2 ring-inset ring-indigo-500" : ""
                  )}
                >
                  <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{condition}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-all" />
                </button>
              ))}
              {searchTerm && !commonConditions.some(c => c.toLowerCase() === searchTerm.toLowerCase()) && (
                <button
                  onClick={() => fetchProtocol(searchTerm)}
                  className="w-full text-left p-4 hover:bg-white transition-all group flex items-center gap-2 text-indigo-600 font-medium italic"
                >
                  <Search className="w-4 h-4" />
                  Analyze "{searchTerm}"
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content: Protocol Details */}
        <div className="lg:col-span-2">
          {selectedCondition ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900">{selectedCondition}</h3>
                    <p className="text-sm text-slate-500">Evidence-Based Treatment Protocol</p>
                  </div>
                  {protocol && !loading && (
                    <button
                      onClick={handleSave}
                      disabled={isSaved}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        isSaved 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5" />
                          Save to Library
                        </>
                      )}
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                    <p className="font-medium">Synthesizing clinical guidelines...</p>
                    <p className="text-xs mt-1">Generating structured treatment protocol</p>
                  </div>
                ) : protocol ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> First-Line Therapy
                        </h4>
                        <ul className="space-y-2">
                          {protocol.firstLine.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Second-Line / Add-on
                        </h4>
                        <ul className="space-y-2">
                          {protocol.secondLine.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" /> Monitoring
                        </h4>
                        <ul className="space-y-2">
                          {protocol.monitoring.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Lifestyle
                        </h4>
                        <ul className="space-y-2">
                          {protocol.lifestyle.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <section className="pt-6 border-t border-slate-100">
                      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <BookOpen className="w-24 h-24" />
                        </div>
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Clinical Pearls</h4>
                        <p className="text-sm leading-relaxed font-medium">
                          {protocol.clinicalPearls}
                        </p>
                      </div>
                    </section>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Treatment Protocols</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 text-center">
                Select a condition from the list or search for one to generate a structured, evidence-based treatment protocol.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
