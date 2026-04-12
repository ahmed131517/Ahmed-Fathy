import React, { useState, useEffect } from 'react';
import { Search, Book, Info, Loader2, AlertCircle, ChevronRight, BookOpen, Heart, Activity, Stethoscope, Microscope } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateContentWithRetry } from "@/utils/gemini";
import { Type } from "@google/genai";
import { SavedKnowledgeService } from '@/lib/SavedKnowledgeService';
import { Bookmark, Check } from 'lucide-react';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { LOCAL_ENCYCLOPEDIA } from '@/data/localEncyclopedia';
import { db } from '@/lib/db';

interface EncyclopediaEntry {
  term: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
}

const categories = [
  { name: 'Diseases & Conditions', icon: Activity, color: 'text-red-500', bg: 'bg-red-50' },
  { name: 'Procedures & Tests', icon: Stethoscope, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Anatomy & Physiology', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Medical Specialties', icon: BookOpen, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { name: 'Medical Terminology', icon: Microscope, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

const encyclopediaData: Record<string, string[]> = {
  'Diseases & Conditions': [
    "Diabetes Mellitus", "Hypertension", "Myocardial Infarction", "Asthma", "Pneumonia",
    "Osteoarthritis", "Alzheimer's Disease", "COPD", "Rheumatoid Arthritis", "GERD",
    "Atrial Fibrillation", "Multiple Sclerosis", "Parkinson's Disease", "Crohn's Disease",
    "Ulcerative Colitis", "Psoriasis", "Systemic Lupus Erythematosus", "Celiac Disease",
    "Sleep Apnea", "Hypothyroidism", "Hyperthyroidism", "Anemia", "Sepsis", "Stroke",
    "Migraine", "Epilepsy", "Gout", "Fibromyalgia", "Endometriosis", "PCOS"
  ],
  'Procedures & Tests': [
    "Echocardiogram", "Colonoscopy", "Endoscopy", "MRI Scan", "CT Scan", "PET Scan",
    "Electrocardiogram (ECG)", "Lumbar Puncture", "Biopsy", "Angiography",
    "Stress Test", "Pulmonary Function Test", "Mammogram", "Ultrasound",
    "Blood Culture", "Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)",
    "Liver Function Test", "Thyroid Panel", "Urinalysis"
  ],
  'Anatomy & Physiology': [
    "Cardiovascular System", "Respiratory System", "Nervous System", "Digestive System",
    "Endocrine System", "Musculoskeletal System", "Immune System", "Renal System",
    "Integumentary System", "Reproductive System", "Lymphatic System", "Homeostasis",
    "Metabolism", "Cell Biology", "Genetics"
  ],
  'Medical Specialties': [
    "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Hematology",
    "Infectious Disease", "Nephrology", "Neurology", "Oncology", "Ophthalmology",
    "Orthopedics", "Otolaryngology", "Pediatrics", "Psychiatry", "Pulmonology",
    "Rheumatology", "Urology", "Gynecology", "Obstetrics"
  ],
  'Medical Terminology': [
    "Acute vs Chronic", "Benign vs Malignant", "Idiopathic", "Iatrogenic", "Prognosis",
    "Etiology", "Pathogenesis", "Epidemiology", "Symptom vs Sign", "Syndrome",
    "Comorbidity", "Contraindication", "Efficacy", "Placebo", "Systemic"
  ]
};

const commonTerms = [
  "Diabetes Mellitus", "Hypertension", "Myocardial Infarction", "Asthma", "Pneumonia",
  "Osteoarthritis", "Alzheimer's Disease", "COPD", "Rheumatoid Arthritis", "GERD"
];

export function Encyclopedia() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [entry, setEntry] = useState<EncyclopediaEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  const displayTerms = activeCategory ? encyclopediaData[activeCategory] : commonTerms;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setIsSaved(false);
  }, [selectedTerm]);

  const handleSave = async () => {
    if (!selectedTerm || !entry) return;
    
    let currentUser = user;
    if (!currentUser) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        currentUser = result.user;
        setUser(currentUser);
      } catch (error) {
        console.error("Error signing in:", error);
        setError("You must be signed in to save knowledge.");
        return;
      }
    }

    try {
      await SavedKnowledgeService.saveKnowledge('encyclopedia', selectedTerm, entry);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving encyclopedia entry:", error);
      setError("Failed to save entry. Please try again.");
    }
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const fetchEntry = async (term: string) => {
    if (!term.trim()) return;
    setSelectedTerm(term);
    setLoading(true);
    setEntry(null);
    setError(null);

    // Update recent searches
    setRecentSearches(prev => [term, ...prev.filter(t => t !== term)].slice(0, 5));

    // Check local data first
    if (LOCAL_ENCYCLOPEDIA[term]) {
      setEntry(LOCAL_ENCYCLOPEDIA[term]);
      setLoading(false);
      return;
    }

    // Check Dexie cache
    try {
      const cached = await db.knowledge_encyclopedia.where('term').equalsIgnoreCase(term).first();
      if (cached) {
        setEntry({
          term: cached.term,
          definition: cached.definition,
          symptoms: cached.symptoms,
          causes: cached.causes,
          treatments: cached.treatments,
          prevention: cached.prevention
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("Dexie cache check failed", e);
    }

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Provide a comprehensive medical encyclopedia entry for: ${term}. Include a clear definition, common symptoms, primary causes, standard treatments, and prevention strategies.`,
        config: {
          systemInstruction: "You are a medical educator. Provide clear, accurate, and easy-to-understand medical information for a professional encyclopedia. Return the response as a JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              term: { type: Type.STRING },
              definition: { type: Type.STRING },
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              causes: { type: Type.ARRAY, items: { type: Type.STRING } },
              treatments: { type: Type.ARRAY, items: { type: Type.STRING } },
              prevention: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["term", "definition", "symptoms", "causes", "treatments", "prevention"]
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        setEntry(parsed);
        
        // Save to Dexie cache
        await db.knowledge_encyclopedia.add({
          ...parsed,
          lastUpdated: Date.now()
        });
      } else {
        throw new Error("No content received from AI");
      }
    } catch (error) {
      console.error("Error fetching encyclopedia entry:", error);
      setError("Failed to retrieve medical data. Please try again or search for a different term.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: Search and Browse */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search medical terms..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchEntry(searchTerm)}
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Browse Categories</h3>
              </div>
              <div className="p-2 space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-sm font-medium group",
                      activeCategory === cat.name ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-md transition-colors", cat.bg, cat.color)}>
                      <cat.icon className="w-4 h-4" />
                    </div>
                    <span className="group-hover:text-slate-900">{cat.name}</span>
                    <ChevronRight className={cn("w-3 h-3 ml-auto transition-all", activeCategory === cat.name ? "text-indigo-500 rotate-90" : "text-slate-300")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alphabetical Browse</h3>
              </div>
              <div className="p-3 grid grid-cols-6 gap-1">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => fetchEntry(letter)}
                    className="aspect-square flex items-center justify-center text-xs font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-md transition-all"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {activeCategory ? `${activeCategory} Terms` : 'Common Terms'}
                </h3>
              </div>
              <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                {displayTerms.map((term) => (
                  <button
                    key={term}
                    onClick={() => fetchEntry(term)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg text-sm transition-all flex items-center justify-between group",
                      selectedTerm === term ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {term}
                    <ChevronRight className={cn("w-3 h-3 transition-all", selectedTerm === term ? "text-indigo-500" : "text-slate-300 group-hover:text-slate-500")} />
                  </button>
                ))}
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Searches</h3>
                </div>
                <div className="p-2 space-y-1">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => fetchEntry(term)}
                      className="w-full text-left p-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Entry Details */}
        <div className="lg:col-span-2">
          {selectedTerm ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                      <Book className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{selectedTerm}</h3>
                      <p className="text-sm text-slate-500">Medical Encyclopedia Entry</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {entry && !loading && (
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
                      onClick={() => setSelectedTerm(null)}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                    <p className="font-medium">Retrieving medical information...</p>
                    <p className="text-xs mt-1">Synthesizing clinical data and educational content</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-red-50 text-red-600 rounded-full mb-4">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">Retrieval Error</h4>
                    <p className="text-sm text-slate-500 max-w-xs">{error}</p>
                    <button 
                      onClick={() => fetchEntry(selectedTerm)}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      Retry Search
                    </button>
                  </div>
                ) : entry ? (
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" /> Definition
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                        {entry.definition}
                      </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Symptoms
                        </h4>
                        <ul className="space-y-2">
                          {entry.symptoms.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Causes
                        </h4>
                        <ul className="space-y-2">
                          {entry.causes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 p-2 rounded-lg border border-red-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section>
                        <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4" /> Treatments
                        </h4>
                        <ul className="space-y-2">
                          {entry.treatments.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4" /> Prevention
                        </h4>
                        <ul className="space-y-2">
                          {entry.prevention.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Medical Encyclopedia</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 text-center">
                Search for a medical term or select one from the common terms list to view detailed clinical information.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
