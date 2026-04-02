import React, { useState } from 'react';
import { Plus, X, Search, AlertTriangle, CheckCircle, Loader2, Database, BrainCircuit } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateContentWithRetry } from "@/utils/gemini";
import { Type } from "@google/genai";
import { RxNavService, RxNavInteraction } from "@/services/RxNavService";

interface InteractionResult {
  meds: string[];
  severity: 'severe' | 'moderate' | 'mild' | 'none';
  description: string;
  recommendation: string;
}

export function DrugInteractions() {
  const [medications, setMedications] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<InteractionResult[] | null>(null);
  const [rxNavResults, setRxNavResults] = useState<RxNavInteraction[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [rxNavLoading, setRxNavLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<'ai' | 'database'>('ai');

  const addMedication = () => {
    if (input.trim() && !medications.includes(input.trim())) {
      setMedications([...medications, input.trim()]);
      setInput('');
    }
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
    setResults(null);
  };

  const checkInteractions = async () => {
    if (medications.length < 2) return;
    setLoading(true);
    setRxNavLoading(true);
    setResults(null);
    setRxNavResults(null);
    setError(null);

    // 1. RxNav Database Check
    const rxNavPromise = (async () => {
      try {
        const rxcuis = await Promise.all(medications.map(med => RxNavService.getRxCUI(med)));
        const validRxcuis = rxcuis.filter((id): id is string => id !== null);
        if (validRxcuis.length >= 2) {
          const interactions = await RxNavService.getInteractions(validRxcuis);
          setRxNavResults(interactions);
        } else {
          setRxNavResults([]);
        }
      } catch (err) {
        console.error("RxNav error:", err);
        setRxNavResults([]);
      } finally {
        setRxNavLoading(false);
      }
    })();

    // 2. Gemini AI Check
    const geminiPromise = (async () => {
      try {
        const response = await generateContentWithRetry({
          model: "gemini-3-flash-preview",
          contents: `Check for potential drug interactions between the following medications: ${medications.join(', ')}.`,
          config: {
            systemInstruction: "You are a clinical pharmacist. Analyze the provided list of medications for potential drug-drug interactions. Provide a detailed analysis including severity levels (severe, moderate, mild, or none), descriptions of the interactions, and clinical recommendations. Return the response as a JSON array of interaction objects.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  meds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "The pair of medications involved in the interaction."
                  },
                  severity: {
                    type: Type.STRING,
                    enum: ["severe", "moderate", "mild", "none"],
                    description: "The clinical severity of the interaction."
                  },
                  description: {
                    type: Type.STRING,
                    description: "A detailed description of the interaction mechanism and effects."
                  },
                  recommendation: {
                    type: Type.STRING,
                    description: "Clinical recommendation for managing the interaction."
                  }
                },
                required: ["meds", "severity", "description", "recommendation"]
              }
            }
          }
        });

        const text = response.text;
        if (text) {
          const parsedResults = JSON.parse(text);
          setResults(parsedResults);
        } else {
          throw new Error("No response from AI");
        }
      } catch (err) {
        console.error("Error checking interactions:", err);
        setError("Failed to check interactions with AI. Database results may still be available.");
      } finally {
        setLoading(false);
      }
    })();

    await Promise.all([rxNavPromise, geminiPromise]);
  };

  return (
    <div className="space-y-6">
      <div className="section-header">
        <h3 className="text-lg font-bold text-slate-900">Drug Interactions Checker</h3>
        <p className="text-slate-500">Check potential interactions between medications using clinical AI analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
          <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" /> Add Medications
          </h4>
          <div className="flex gap-2 mb-4">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addMedication()}
              placeholder="Enter medication name"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              onClick={addMedication} 
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
            {medications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No medications added</p>
            ) : (
              medications.map((med, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 text-sm shadow-sm">
                  <span className="font-medium text-slate-700">{med}</span>
                  <button onClick={() => removeMedication(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={checkInteractions}
            disabled={medications.length < 2 || loading}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Check Interactions
              </>
            )}
          </button>
          {medications.length === 1 && (
            <p className="text-[10px] text-amber-600 mt-2 text-center">Add at least one more medication to check</p>
          )}
        </div>

        <div className="lg:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200 min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Interaction Results
            </h4>
            {(results || rxNavResults) && (
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveSource('ai')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                    activeSource === 'ai' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <BrainCircuit className="w-3 h-3" /> AI Analysis
                </button>
                <button 
                  onClick={() => setActiveSource('database')}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                    activeSource === 'database' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Database className="w-3 h-3" /> Medical DB
                </button>
              </div>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {loading || rxNavLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
              <p className="font-medium">Consulting multiple sources...</p>
              <p className="text-xs mt-1">Checking clinical AI and medical database (RxNav)</p>
            </div>
          ) : activeSource === 'ai' ? (
            results ? (
              <div className="space-y-4">
                {results.length === 0 || (results.length === 1 && results[0].severity === 'none') ? (
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h5 className="font-bold text-emerald-800">No Significant Interactions (AI)</h5>
                    <p className="text-emerald-700 text-sm mt-1">The AI analysis did not find major interactions between the selected medications.</p>
                  </div>
                ) : (
                  results.map((res, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "p-4 rounded-xl border shadow-sm transition-all",
                        res.severity === 'severe' ? "bg-red-50 border-red-200" :
                        res.severity === 'moderate' ? "bg-amber-50 border-amber-200" :
                        "bg-blue-50 border-blue-200"
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            res.severity === 'severe' ? "bg-red-100 text-red-600" :
                            res.severity === 'moderate' ? "bg-amber-100 text-amber-600" :
                            "bg-blue-100 text-blue-600"
                          )}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <h5 className="font-bold text-slate-900">{res.meds.join(' + ')}</h5>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                          res.severity === 'severe' ? "bg-red-600 text-white" :
                          res.severity === 'moderate' ? "bg-amber-500 text-white" :
                          "bg-blue-500 text-white"
                        )}>
                          {res.severity}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm text-slate-700 leading-relaxed">{res.description}</p>
                        </div>
                        <div className={cn(
                          "p-3 rounded-lg",
                          res.severity === 'severe' ? "bg-red-100/50" :
                          res.severity === 'moderate' ? "bg-amber-100/50" :
                          "bg-blue-100/50"
                        )}>
                          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Clinical Recommendation</p>
                          <p className="text-sm font-medium text-slate-800">{res.recommendation}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <p className="text-[10px] text-slate-400 text-center italic mt-4">
                  Disclaimer: AI analysis is for educational purposes and should be verified with official clinical resources.
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-20">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Ready to Analyze</p>
                <p className="text-sm max-w-xs mx-auto mt-1">Add two or more medications to check for potential clinical interactions.</p>
              </div>
            )
          ) : (
            rxNavResults ? (
              <div className="space-y-4">
                {rxNavResults.length === 0 ? (
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h5 className="font-bold text-emerald-800">No Interactions Found in Database</h5>
                    <p className="text-emerald-700 text-sm mt-1">The RxNav database did not return any known interactions for these medications.</p>
                  </div>
                ) : (
                  rxNavResults.map((res, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                          <Database className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Source: {res.source}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{res.description}</p>
                      {res.severity !== 'N/A' && (
                        <div className="mt-2 text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full w-fit">
                          Severity: {res.severity}
                        </div>
                      )}
                    </div>
                  ))
                )}
                <p className="text-[10px] text-slate-400 text-center italic mt-4">
                  Data provided by the NIH RxNav Interaction API.
                </p>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-20">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Database Lookup</p>
                <p className="text-sm max-w-xs mx-auto mt-1">Check the official NIH RxNav database for documented interactions.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
