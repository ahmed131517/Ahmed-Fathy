import React, { useState, useEffect } from 'react';
import { Search, Database, Pill, Info, ExternalLink, Loader2, AlertCircle, X, AlertTriangle, ShieldAlert, ListChecks } from 'lucide-react';
import { RxNavService } from '@/services/RxNavService';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { generateContentWithRetry } from '@/utils/gemini';
import { Type } from '@google/genai';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { SavedKnowledgeService } from '@/lib/SavedKnowledgeService';
import { Bookmark, Check } from 'lucide-react';

interface DrugDetail {
  classes: any[];
  properties: any[];
  summary?: {
    sideEffects: string[];
    contraindications: string[];
    interactions: string;
  };
}

export function DrugDatabase() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<string | null>(null);
  const [details, setDetails] = useState<DrugDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeClass, setActiveClass] = useState<string | null>(null);
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
  }, [selectedDrug]);

  const handleSave = async () => {
    if (!selectedDrug || !details) return;
    
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
      await SavedKnowledgeService.saveKnowledge('drug', selectedDrug, details);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving drug:", error);
    }
  };

  const drugClasses = [
    { id: 'J01', name: 'Antibiotics' },
    { id: 'N02', name: 'Analgesics' },
    { id: 'C', name: 'Cardiovascular' },
    { id: 'A10', name: 'Antidiabetics' },
    { id: 'C02', name: 'Antihypertensives' },
    { id: 'R', name: 'Respiratory' },
    { id: 'A', name: 'Gastrointestinal' },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length > 2) {
        setSearching(true);
        const results = await RxNavService.searchDrugs(searchTerm);
        setSuggestions(results);
        setSearching(false);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectDrug = async (name: string) => {
    setSearchTerm(name);
    setSuggestions([]);
    setSelectedDrug(name);
    setLoading(true);
    
    try {
      const rxcui = await RxNavService.getRxCUI(name);
      let drugDetails: DrugDetail = { classes: [], properties: [] };
      
      if (rxcui) {
        const navDetails = await RxNavService.getDrugDetails(rxcui);
        if (navDetails) {
          drugDetails = { ...drugDetails, ...navDetails };
        }
      }

      // Fetch clinical summary from Gemini
      const aiResponse = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Provide a clinical summary for the drug: ${name}. Include common side effects, major contraindications, and significant drug-drug interactions.`,
        config: {
          systemInstruction: "You are a clinical pharmacist. Provide accurate, concise medical information about drugs. Return the response as a JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sideEffects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of common side effects."
              },
              contraindications: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of major contraindications."
              },
              interactions: {
                type: Type.STRING,
                description: "Summary of significant drug-drug interactions."
              }
            },
            required: ["sideEffects", "contraindications", "interactions"]
          }
        }
      });

      if (aiResponse.text) {
        drugDetails.summary = JSON.parse(aiResponse.text);
      }

      setDetails(drugDetails);
    } catch (error) {
      console.error("Error fetching drug details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClassFilter = async (classId: string) => {
    if (activeClass === classId) {
      setActiveClass(null);
      setSuggestions([]);
      return;
    }
    
    setActiveClass(classId);
    setSearching(true);
    setSearchTerm('');
    const results = await RxNavService.getDrugsByClass(classId);
    setSuggestions(results);
    setSearching(false);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
            placeholder="Search for a medication (e.g., Lisinopril, Metformin)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setActiveClass(null);
            }}
          />
          {searching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {drugClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleClassFilter(cls.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                activeClass === cls.id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              )}
            >
              {cls.name}
            </button>
          ))}
        </div>

        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-w-4xl bg-white shadow-lg rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {activeClass ? `Common drugs in ${drugClasses.find(c => c.id === activeClass)?.name}` : 'Search Results'}
            </div>
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((name, i) => (
                <button
                  key={i}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 flex items-center gap-2"
                  onClick={() => handleSelectDrug(name)}
                >
                  <Pill className="w-4 h-4 text-indigo-500" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <Database className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-400">Search the Drug Database</h3>
        <p className="text-slate-400 max-w-xs mx-auto mt-2">
          Enter a medication name above to access official clinical data, therapeutic classes, and synonyms.
        </p>
      </div>

      <AnimatePresence>
        {(loading || details) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Pill className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">{selectedDrug}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {details && !loading && (
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
                  <button 
                    onClick={() => {
                    setDetails(null);
                    setLoading(false);
                  }}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                    <p className="font-medium">Fetching clinical data from multiple sources...</p>
                    <p className="text-xs mt-1">Querying NIH RxNav and Clinical AI Knowledge Base</p>
                  </div>
                ) : details && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* AI Summary Section */}
                      {details.summary && (
                        <div className="space-y-6">
                          <section>
                            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> Contraindications
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {details.summary.contraindications.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 p-2 rounded-lg border border-red-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>

                          <section>
                            <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Side Effects
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {details.summary.sideEffects.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>

                          <section>
                            <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <ListChecks className="w-4 h-4" /> Drug Interactions
                            </h4>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {details.summary.interactions}
                              </p>
                            </div>
                          </section>
                        </div>
                      )}

                      {/* RxNav Properties */}
                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4" /> RxNorm Properties
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {details.properties.filter(p => ['TTY', 'SY', 'BN'].includes(p.propName)).map((prop, i) => (
                            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{prop.propName === 'TTY' ? 'Term Type' : prop.propName === 'SY' ? 'Synonym' : 'Brand Name'}</p>
                              <p className="text-sm font-medium text-slate-700">{prop.propValue}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    <div className="space-y-6">
                      <section>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Therapeutic Classes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {details.classes.length > 0 ? (
                            details.classes.map((cls, i) => (
                              <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                                {cls.className}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500 italic">No classes found.</p>
                          )}
                        </div>
                      </section>

                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 text-amber-800 font-bold text-xs mb-2">
                          <AlertCircle className="w-4 h-4" />
                          Clinical Disclaimer
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          This information is synthesized from multiple clinical sources. Always verify with institutional protocols and patient history.
                        </p>
                      </div>

                      <section>
                        <h4 className="text-sm font-bold text-slate-900 mb-3">External Resources</h4>
                        <div className="space-y-2">
                          <a 
                            href={`https://medlineplus.gov/druginfo/meds/a601032.html`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
                          >
                            <span className="text-xs font-medium text-slate-600">MedlinePlus Reference</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                          </a>
                          <a 
                            href={`https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${selectedDrug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group"
                          >
                            <span className="text-xs font-medium text-slate-600">RxNav API Data</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                          </a>
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
