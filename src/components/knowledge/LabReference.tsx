import React, { useState, useEffect } from 'react';
import { Search, FileText, Info, AlertCircle, ArrowUp, ArrowDown, Loader2, BookOpen } from 'lucide-react';
import { cn } from "@/lib/utils";
import { generateContentWithRetry } from "@/utils/gemini";
import { Type } from "@google/genai";
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { SavedKnowledgeService } from '@/lib/SavedKnowledgeService';
import { Bookmark, Check } from 'lucide-react';

interface LabTest {
  name: string;
  category: string;
  normalRange: string;
  unit: string;
  description: string;
}

interface LabAnalysis {
  testName: string;
  clinicalSignificance: string;
  highCauses: string[];
  lowCauses: string[];
  recommendations: string;
}

const commonLabTests: LabTest[] = [
  { name: 'Hemoglobin (Hgb)', category: 'Hematology', normalRange: '13.5-17.5 (M), 12.0-15.5 (F)', unit: 'g/dL', description: 'Measures the amount of oxygen-carrying protein in the blood.' },
  { name: 'White Blood Cell (WBC)', category: 'Hematology', normalRange: '4,500-11,000', unit: 'cells/mcL', description: 'Measures the number of infection-fighting cells in the blood.' },
  { name: 'Platelets', category: 'Hematology', normalRange: '150,000-450,000', unit: 'cells/mcL', description: 'Measures the number of cells that help blood clot.' },
  { name: 'Sodium', category: 'Electrolytes', normalRange: '135-145', unit: 'mEq/L', description: 'Helps maintain fluid balance and nerve/muscle function.' },
  { name: 'Potassium', category: 'Electrolytes', normalRange: '3.6-5.2', unit: 'mmol/L', description: 'Crucial for heart function and muscle contraction.' },
  { name: 'Creatinine', category: 'Renal', normalRange: '0.7-1.3 (M), 0.6-1.1 (F)', unit: 'mg/dL', description: 'Waste product filtered by kidneys; indicator of kidney function.' },
  { name: 'Glucose (Fasting)', category: 'Metabolic', normalRange: '70-99', unit: 'mg/dL', description: 'Measures blood sugar levels after fasting.' },
  { name: 'HbA1c', category: 'Metabolic', normalRange: '< 5.7%', unit: '%', description: 'Average blood sugar levels over the past 2-3 months.' },
  { name: 'ALT (Alanine Aminotransferase)', category: 'Liver', normalRange: '7-55', unit: 'U/L', description: 'Enzyme found mostly in the liver; released when liver is damaged.' },
  { name: 'TSH (Thyroid Stimulating Hormone)', category: 'Endocrine', normalRange: '0.4-4.0', unit: 'mIU/L', description: 'Measures how much thyroid hormone the body is being told to make.' },
];

export function LabReference() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [analysis, setAnalysis] = useState<LabAnalysis | null>(null);
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
  }, [selectedTest]);

  const handleSave = async () => {
    if (!selectedTest || !analysis) return;
    
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
      await SavedKnowledgeService.saveKnowledge('lab', selectedTest.name, analysis);
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving lab test:", error);
    }
  };

  const filteredTests = commonLabTests.filter(test => 
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const analyzeTest = async (test: LabTest) => {
    setSelectedTest(test);
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: `Provide a clinical analysis for the lab test: ${test.name}. Include clinical significance, common causes for high values, common causes for low values, and general clinical recommendations.`,
        config: {
          systemInstruction: "You are a clinical pathologist. Provide accurate, evidence-based information about laboratory tests. Return the response as a JSON object.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              testName: { type: Type.STRING },
              clinicalSignificance: { type: Type.STRING },
              highCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
              lowCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.STRING }
            },
            required: ["testName", "clinicalSignificance", "highCauses", "lowCauses", "recommendations"]
          }
        }
      });

      if (response.text) {
        setAnalysis(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error analyzing lab test:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Search and List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search lab tests..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-3 bg-white border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Common Lab Tests</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
              {filteredTests.map((test, i) => (
                <button
                  key={i}
                  onClick={() => analyzeTest(test)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-white transition-all group",
                    selectedTest?.name === test.name ? "bg-white ring-2 ring-inset ring-indigo-500" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{test.name}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{test.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{test.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Details and AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTest ? (
            <div className="space-y-6">
              {/* Basic Info Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTest.name}</h3>
                    <p className="text-sm text-slate-500">{selectedTest.category} Reference</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Normal Range</p>
                    <p className="text-lg font-bold text-slate-900">{selectedTest.normalRange} <span className="text-sm font-medium text-slate-500">{selectedTest.unit}</span></p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedTest.description}</p>
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <h4 className="font-bold">Clinical AI Analysis</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    {analysis && !loading && (
                      <button
                        onClick={handleSave}
                        disabled={isSaved}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all",
                          isSaved 
                            ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/30" 
                            : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
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
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  </div>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                      <p className="font-medium">Synthesizing clinical data...</p>
                      <p className="text-xs mt-1">Analyzing reference ranges and clinical significance</p>
                    </div>
                  ) : analysis ? (
                    <div className="space-y-8">
                      <section>
                        <h5 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-indigo-500" /> Clinical Significance
                        </h5>
                        <p className="text-sm text-slate-700 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          {analysis.clinicalSignificance}
                        </p>
                      </section>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <section>
                          <h5 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                            <ArrowUp className="w-4 h-4" /> Causes of High Values
                          </h5>
                          <ul className="space-y-2">
                            {analysis.highCauses.map((cause, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 p-2 rounded-lg border border-red-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </section>

                        <section>
                          <h5 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                            <ArrowDown className="w-4 h-4" /> Causes of Low Values
                          </h5>
                          <ul className="space-y-2">
                            {analysis.lowCauses.map((cause, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-blue-50 p-2 rounded-lg border border-blue-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </section>
                      </div>

                      <section className="pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-amber-600 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          <h5 className="text-sm font-bold uppercase tracking-wider">Clinical Recommendations</h5>
                        </div>
                        <p className="text-sm font-medium text-slate-800 bg-amber-50 p-4 rounded-xl border border-amber-100">
                          {analysis.recommendations}
                        </p>
                      </section>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>Select a lab test to view clinical analysis</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">Lab Reference Guide</h3>
              <p className="text-slate-400 max-w-xs mx-auto mt-2 text-center">
                Select a laboratory test from the list to view reference ranges and AI-powered clinical interpretations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
