import { useState, useMemo, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { 
  FilePlus, Search, Droplet, Box, LifeBuoy, PieChart, Zap, Database, 
  Activity, Filter, Shield, FlaskConical, Image as ImageIcon, Heart, 
  Layers, AlertTriangle, Target, Thermometer, Wind, Cpu, Clock, 
  CheckCircle, Trash2, Eye, Send, Printer, X, ChevronRight, AlertOctagon, Info, Sparkles, RefreshCw,
  PenTool, TrendingUp, History, Bell, ClipboardCheck, ArrowRight, Beaker, Loader2, Copy, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { usePatient } from "@/lib/PatientContext";
import { LAB_REFERENCE_DATA, ALL_TESTS, LabTest } from "@/data/labReferenceData";
import { generateContentWithRetry } from "../utils/gemini";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from "motion/react";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  { id: 'hematology', name: 'Hematology', icon: Droplet },
  { id: 'renal', name: 'Kidney Function', icon: Box },
  { id: 'hepatic', name: 'Liver Function', icon: LifeBuoy },
  { id: 'lipids', name: 'Lipid Profile', icon: PieChart },
  { id: 'electrolytes', name: 'Electrolytes', icon: Zap },
  { id: 'pancreatic', name: 'Pancreatic Function', icon: Database },
  { id: 'metabolic', name: 'General Biochemistry', icon: Activity },
  { id: 'microbiology', name: 'Microbiology', icon: Filter },
  { id: 'serology', name: 'Serology & Immunology', icon: Shield },
  { id: 'urine', name: 'Urinalysis', icon: FlaskConical },
  { id: 'imaging', name: 'Diagnostic Imaging', icon: ImageIcon },
  { id: 'cardiology', name: 'Cardiology', icon: Heart },
  { id: 'endocrinology', name: 'Endocrinology', icon: Layers },
  { id: 'toxicology', name: 'Toxicology & Drugs', icon: AlertTriangle },
  { id: 'tumor-markers', name: 'Tumor Markers', icon: Target },
  { id: 'special-chemistry', name: 'Special Chemistry', icon: Thermometer },
  { id: 'stool-analysis', name: 'Stool Analysis', icon: Wind },
  { id: 'body-fluids', name: 'CSF & Body Fluids', icon: Droplet },
  { id: 'molecular', name: 'Molecular / DNA', icon: Cpu },
];

interface SelectedTest extends LabTest {
  instructions: string;
  collectionGuide?: string;
  preparation?: string;
}

interface LabRequest {
  id?: string;
  localId?: number;
  patientId: string;
  patientName: string;
  tests: SelectedTest[];
  priority: 'standard' | 'urgent';
  physician: string;
  requestDate: string;
  status: 'pending' | 'collecting' | 'processing' | 'reviewing' | 'completed';
  clinicalInfo: string;
  notes: string;
  results?: any[];
  aiAnalysis?: string;
  signature?: string;
  notifyPatient: boolean;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export function LabRequests() {
  const { selectedPatient } = usePatient();
  const [activeTab, setActiveTab] = useState('new');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
  const [priority, setPriority] = useState<'standard' | 'urgent'>('standard');
  const [clinicalInfo, setClinicalInfo] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [physician, setPhysician] = useState("Dr. Ahmed Fathy");
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifyPatient, setNotifyPatient] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showTrendId, setShowTrendId] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
  const templates = useLiveQuery(() => db.templates.where('category').equals('lab_request').toArray());

  const sigCanvas = useRef<SignatureCanvas | null>(null);

  // Fetch real historical data for trends
  const historicalLabResults = useLiveQuery(
    () => selectedPatient ? db.lab_results.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient]
  ) || [];

  // Group and format data for Recharts
  const trendData = useMemo(() => {
    const grouped: Record<string, any> = {};
    historicalLabResults.forEach(res => {
      if (!grouped[res.date]) grouped[res.date] = { date: res.date };
      grouped[res.date][res.testName] = parseFloat(res.value);
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [historicalLabResults]);

  // Get all unique test names for the legend
  const testNames = useMemo(() => {
    const names = new Set<string>();
    historicalLabResults.forEach(res => names.add(res.testName));
    return Array.from(names);
  }, [historicalLabResults]);

  const requests = useLiveQuery(() => db.lab_requests.toArray()) || [];

  const filteredTests = useMemo(() => {
    if (searchQuery.length >= 2) {
      return ALL_TESTS.filter(t => 
        t.name?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
        t.category?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
      );
    }
    if (selectedCategory) {
      return LAB_REFERENCE_DATA[selectedCategory] || [];
    }
    return [];
  }, [selectedCategory, searchQuery]);

  const toggleTest = (test: LabTest) => {
    setSelectedTests(prev => {
      const exists = prev.find(t => t.name === test.name);
      if (exists) {
        return prev.filter(t => t.name !== test.name);
      }
      return [...prev, { 
        ...test, 
        instructions: "", 
        preparation: test.name.includes("Glucose") || test.name.includes("Lipid") ? "Fasting for 8-12 hours required." : "No special preparation required.",
        collectionGuide: test.category === 'hematology' ? "Lavender top tube (EDTA). Invert 8 times." : "Gold/Red top tube (Serum). Allow to clot for 30 mins."
      }];
    });
  };

  const removeTest = (name: string) => {
    setSelectedTests(prev => prev.filter(t => t.name !== name));
  };

  const getAISuggestions = async () => {
    if (!clinicalInfo || clinicalInfo.length < 10) return;
    setIsSuggesting(true);
    try {
      const prompt = `Based on this clinical information: "${clinicalInfo}", suggest 3-5 most relevant lab tests. Return only a JSON array of test names.`;
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const suggestions = JSON.parse(response.text || "[]");
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error("AI Suggestions failed:", err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const clearSignature = () => sigCanvas.current?.clear();
  const saveSignature = () => {
    if (sigCanvas.current) {
      if (sigCanvas.current.isEmpty()) {
        alert("Please provide a signature before confirming.");
        return;
      }
      const data = sigCanvas.current.toDataURL('image/png');
      setSignatureData(data);
      setShowSignature(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    if (selectedTests.length === 0) return;

    const newRequest: LabRequest = {
      id: `REQ-${Math.floor(Math.random() * 10000)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      tests: [...selectedTests],
      priority,
      physician,
      requestDate,
      status: 'pending',
      clinicalInfo,
      notes: additionalNotes,
      signature: signatureData || undefined,
      notifyPatient,
      lastModified: Date.now(),
      isDeleted: 0,
      isSynced: 0
    };

    await db.lab_requests.add(newRequest);
    setSelectedTests([]);
    setClinicalInfo("");
    setAdditionalNotes("");
    setSignatureData(null);
    setActiveTab('pending');
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    const templateData = {
      tests: selectedTests,
      priority: priority,
      clinicalInfo: clinicalInfo,
      notes: additionalNotes
    };

    try {
      await db.templates.add({
        id: crypto.randomUUID(),
        name: templateName,
        category: 'lab_request',
        content: templateData,
        lastModified: Date.now()
      });
      toast.success("Template saved successfully.");
      setIsTemplateModalOpen(false);
      setTemplateName('');
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template.");
    }
  };

  const applyTemplate = (template: any) => {
    const data = template.content;
    if (data.tests) setSelectedTests(data.tests);
    if (data.priority) setPriority(data.priority);
    if (data.clinicalInfo) setClinicalInfo(data.clinicalInfo);
    if (data.notes) setAdditionalNotes(data.notes);
    
    setIsLoadTemplateModalOpen(false);
    toast.success(`Template "${template.name}" applied.`);
  };

  const analyzeResults = async (request: LabRequest) => {
    if (!request.results || request.aiAnalysis) return;
    
    setIsAnalyzing(true);
    try {
      const prompt = `
        Analyze the following lab results for a patient named ${request.patientName}.
        Clinical Info: ${request.clinicalInfo}
        
        Results:
        ${JSON.stringify(request.results, null, 2)}
        
        Please provide a structured analysis in Markdown format:
        ### 1. Summary of Abnormal Findings
        - [List abnormal findings here]
        
        ### 2. Clinical Correlations
        - [Discuss correlations with clinical info]
        
        ### 3. Recommended Actions
        - [List follow-up tests or actions]
        
        Keep it concise and clinical.
      `;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      const text = response.text;
      
      await db.lab_requests.update(request.localId!, { aiAnalysis: text });
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast.error("AI Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const syncToRecords = async (request: LabRequest) => {
    if (!request.results || !selectedPatient) return;
    
    try {
      const timestamp = Date.now();
      const date = request.requestDate;

      await db.transaction('rw', [db.lab_results], async () => {
        for (const res of request.results!) {
          await db.lab_results.add({
            id: crypto.randomUUID(),
            patientId: selectedPatient.id,
            testName: res.test,
            value: res.value.toString(),
            unit: res.unit,
            referenceRange: res.range,
            status: res.status === 'normal' ? 'normal' : 'abnormal',
            date: date,
            lastModified: timestamp,
            isDeleted: 0,
            isSynced: 0
          });
        }
      });
      
      toast.success("Lab results synced to medical records.");
    } catch (error) {
      console.error("Failed to sync lab results:", error);
      toast.error("Failed to sync lab results. Please try again.");
    }
  };

  // Safety Alerts Logic
  const safetyAlerts = useMemo(() => {
    const alerts: { type: 'error' | 'warning' | 'info', message: string, icon: any }[] = [];
    
    if (priority === 'urgent' && clinicalInfo.length < 10) {
      alerts.push({ 
        type: 'warning', 
        message: "Urgent requests require detailed clinical justification.", 
        icon: AlertTriangle 
      });
    }

    const testNames = selectedTests.map(t => t.name?.toLowerCase());
    if (testNames.some(n => n.includes('troponin')) && priority !== 'urgent') {
      alerts.push({ 
        type: 'info', 
        message: "Troponin test typically requires 'Urgent' priority.", 
        icon: Info 
      });
    }

    if (selectedPatient?.gender?.toLowerCase() === 'female') {
      const radiationTests = selectedTests.filter(t => 
        t.name?.toLowerCase().includes('x-ray') || 
        t.name?.toLowerCase().includes('ct')
      );
      if (radiationTests.length > 0) {
        alerts.push({ 
          type: 'warning', 
          message: "Pregnancy status must be verified before radiation-based imaging.", 
          icon: AlertOctagon 
        });
      }
    }

    return alerts;
  }, [selectedTests, priority, clinicalInfo, selectedPatient]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lab Requests</h2>
          <p className="text-slate-500">Order and track laboratory tests</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsLoadTemplateModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <FolderOpen className="w-4 h-4" /> Load Template
          </button>
          <button 
            onClick={() => setIsTemplateModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" /> Save as Template
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'new', label: 'New Lab Request' },
            { id: 'pending', label: 'Pending Tests' },
            { id: 'completed', label: 'Completed Tests' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-4 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id 
                  ? "border-indigo-600 text-indigo-600 bg-white" 
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {!selectedPatient ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No patient selected</h3>
                <p className="text-slate-500 mt-2">Please select a patient from the header to manage lab requests.</p>
              </div>
            </div>
          ) : activeTab === 'new' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="lg:col-span-2 space-y-8">
                {/* Categories & Search */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <FilePlus className="w-5 h-5 text-indigo-500" /> Test Categories
                    </h3>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (e.target.value.length >= 2) setSelectedCategory(null);
                        }}
                        placeholder="Search tests (e.g., CBC, Glucose)..." 
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSearchQuery("");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-4 border rounded-xl transition-all text-center group",
                          selectedCategory === cat.id 
                            ? "border-indigo-600 bg-indigo-50 shadow-sm" 
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
                          selectedCategory === cat.id ? "bg-indigo-100" : "bg-slate-100 group-hover:bg-indigo-50"
                        )}>
                          <cat.icon className={cn(
                            "w-5 h-5 transition-colors",
                            selectedCategory === cat.id ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-500"
                          )} />
                        </div>
                        <span className={cn(
                          "text-[11px] font-medium transition-colors",
                          selectedCategory === cat.id ? "text-indigo-700" : "text-slate-700 group-hover:text-indigo-600"
                        )}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Tests Table */}
                {selectedTests.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-indigo-500" />
                      <h4 className="font-semibold text-slate-800">Selected Tests</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left bg-slate-50/50 border-b border-slate-200">
                            <th className="px-4 py-3 font-medium text-slate-600">Test Name</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Preparation</th>
                            <th className="px-4 py-3 font-medium text-slate-600">Collection Guide</th>
                            <th className="px-4 py-3 font-medium text-slate-600 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedTests.map((test) => (
                            <tr key={test.name} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-slate-800">{test.name}</div>
                                <div className="text-[10px] text-slate-500 capitalize">{test.category}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Info className="w-3 h-3 text-indigo-400" />
                                  {test.preparation}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                  <Beaker className="w-3 h-3 text-emerald-400" />
                                  {test.collectionGuide}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => removeTest(test.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request Details Form */}
                {selectedTests.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-300 delay-75">
                    <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                      <FilePlus className="w-4 h-4 text-indigo-500" /> Request Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Priority</label>
                        <div className="flex gap-2">
                          {(['standard', 'urgent'] as const).map(p => (
                            <button
                              key={p}
                              onClick={() => setPriority(p)}
                              className={cn(
                                "flex-1 py-2 px-4 rounded-lg text-sm font-medium border transition-all",
                                priority === p 
                                  ? p === 'urgent' ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-500/20" : "bg-indigo-50 border-indigo-200 text-indigo-700 ring-2 ring-indigo-500/20"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Request Date</label>
                        <input 
                          type="date" 
                          value={requestDate}
                          onChange={(e) => setRequestDate(e.target.value)}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-700">Clinical Information</label>
                        <button 
                          onClick={getAISuggestions}
                          disabled={isSuggesting || clinicalInfo.length < 10}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
                        >
                          {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          Suggest Relevant Tests
                        </button>
                      </div>
                      <Textarea 
                        value={clinicalInfo || ""}
                        onChange={(e) => setClinicalInfo(e.target.value)}
                        rows={3}
                        placeholder="Relevant clinical findings, symptoms, or suspected diagnosis..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors resize-none"
                      />
                      {aiSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Suggested:
                          </span>
                          {aiSuggestions.map(s => (
                            <button 
                              key={s}
                              onClick={() => {
                                const test = ALL_TESTS.find(t => t.name?.toLowerCase().includes(s?.toLowerCase()));
                                if (test) toggleTest(test);
                              }}
                              className="text-[10px] px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors"
                            >
                              + {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-700">Communication & Compliance</label>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={notifyPatient}
                              onChange={(e) => setNotifyPatient(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                                Notify Patient
                              </span>
                              <span className="text-[10px] text-slate-500">Send SMS/Email when results are ready</span>
                            </div>
                          </label>
                          <div className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <PenTool className="w-3.5 h-3.5 text-indigo-500" />
                                Physician Signature
                              </span>
                              {!signatureData && (
                                <button 
                                  onClick={() => setShowSignature(true)}
                                  className="text-xs font-medium text-indigo-600 hover:underline"
                                >
                                  Sign Now
                                </button>
                              )}
                            </div>
                            {signatureData ? (
                              <div className="relative group">
                                <img src={signatureData} alt="Signature" className="h-12 w-auto mx-auto" />
                                <button 
                                  onClick={() => setSignatureData(null)}
                                  className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="h-12 border border-dashed border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400">
                                No signature provided
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Additional Instructions</label>
                        <Textarea 
                          value={additionalNotes || ""}
                          onChange={(e) => setAdditionalNotes(e.target.value)}
                          rows={4}
                          placeholder="Notes for the laboratory technician..."
                          className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button 
                        onClick={() => toast.info("Preview functionality coming soon!")}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button 
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
                      >
                        <Send className="w-4 h-4" /> Submit Request
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Side Panel: Test Selection & Safety */}
              <div className="space-y-6">
                {/* Test Selection Modal-like Panel */}
                {(selectedCategory || searchQuery.length >= 2) && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-800 text-sm">
                        {searchQuery ? `Search: "${searchQuery}"` : categories.find(c => c.id === selectedCategory)?.name}
                      </h4>
                      <button onClick={() => { setSelectedCategory(null); setSearchQuery(""); }} className="text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-2 max-h-[400px] overflow-y-auto">
                      {filteredTests.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          {filteredTests.map(test => (
                            <button
                              key={test.name}
                              onClick={() => toggleTest(test)}
                              className={cn(
                                "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group",
                                selectedTests.some(t => t.name === test.name)
                                  ? "bg-indigo-50 text-indigo-700 font-medium"
                                  : "hover:bg-slate-50 text-slate-700"
                              )}
                            >
                              <span>{test.name}</span>
                              {selectedTests.some(t => t.name === test.name) ? (
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-sm italic">
                          No tests found.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Safety Intelligence Panel */}
                <div className="bg-gradient-to-br from-indigo-50/50 to-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                  <div className="bg-white/50 backdrop-blur-sm px-4 py-3 border-b border-indigo-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-900 text-sm">Clinical Safety Analysis</h4>
                  </div>
                  <div className="p-4 space-y-4">
                    {safetyAlerts.length > 0 ? (
                      safetyAlerts.map((alert, idx) => (
                        <div key={idx} className={cn(
                          "p-3 rounded-lg border text-xs flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                          alert.type === 'error' ? "bg-red-50 border-red-100 text-red-800" :
                          alert.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-800" :
                          "bg-blue-50 border-blue-100 text-blue-800"
                        )}>
                          <alert.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{alert.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckCircle className="w-5 h-5 text-indigo-300" />
                        </div>
                        <p className="text-xs text-slate-400 italic">No safety concerns detected for current selection.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'pending' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {requests.filter(r => r.status !== 'completed').length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {requests.filter(r => r.status !== 'completed').map(req => (
                    <div key={req.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-indigo-300 transition-all group">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-indigo-600 font-mono">{req.id}</span>
                          <span className="text-[10px] text-slate-500">{req.requestDate}</span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                          req.priority === 'urgent' ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                        )}>
                          {req.priority}
                        </span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="flex flex-wrap gap-1.5">
                          {req.tests.map(t => (
                            <span key={t.name} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                              {t.name}
                            </span>
                          ))}
                        </div>
                        
                        {/* Status Timeline */}
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            <span>Status Timeline</span>
                            <span className="text-indigo-600">{req.status.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[
                              { id: 'pending', icon: ClipboardCheck },
                              { id: 'collecting', icon: Beaker },
                              { id: 'processing', icon: RefreshCw },
                              { id: 'reviewing', icon: Eye }
                            ].map((step, idx, arr) => {
                              const steps = ['pending', 'collecting', 'processing', 'reviewing', 'completed'];
                              const currentIdx = steps.indexOf(req.status);
                              const stepIdx = steps.indexOf(step.id);
                              const isActive = stepIdx <= currentIdx;
                              
                              return (
                                <div key={step.id} className="flex items-center flex-1">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                    isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-300"
                                  )}>
                                    <step.icon className="w-3 h-3" />
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <div className={cn(
                                      "h-0.5 flex-1 mx-1",
                                      stepIdx < currentIdx ? "bg-indigo-600" : "bg-slate-100"
                                    )} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Est. 24-48h</span>
                          <button 
                            onClick={() => {
                              // Open modal to enter results
                              // For now, just simulate entering results
                              const results = [
                                { test: "Hemoglobin", value: 13.5, unit: "g/dL", range: "12.0-15.5", status: "normal" },
                                { test: "WBC", value: 7.5, unit: "K/uL", range: "4.5-11.0", status: "normal" }
                              ];
                              db.lab_requests.update(req.localId!, { 
                                status: 'completed', 
                                results: results,
                                lastModified: Date.now()
                              }).then(() => {
                                syncToRecords({ ...req, results, status: 'completed' });
                                toast.success("Results entered and synced.");
                              });
                            }}
                            className="text-indigo-600 font-medium hover:underline flex items-center gap-1"
                          >
                            Enter Results <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 max-w-md">
                    <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No pending tests</h3>
                    <p className="text-slate-500 mt-2 text-sm">Tests that have been ordered but not yet resulted will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {requests.filter(r => r.status === 'completed').length > 0 ? (
                requests.filter(r => r.status === 'completed').map(req => (
                  <div key={req.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-slate-900">{req.patientName}</h3>
                        <p className="text-xs text-slate-500">ID: {req.id} • {req.requestDate}</p>
                      </div>
                      <button 
                        onClick={() => analyzeResults(req)}
                        disabled={isAnalyzing || !!req.aiAnalysis}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                          req.aiAnalysis 
                            ? "bg-emerald-100 text-emerald-700 cursor-default" 
                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                        )}
                      >
                        {isAnalyzing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : req.aiAnalysis ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        {req.aiAnalysis ? "Analysis Complete" : isAnalyzing ? "Analyzing..." : "AI Analysis"}
                      </button>
                      <button 
                        onClick={() => syncToRecords(req)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                      >
                        <Database className="w-4 h-4 text-indigo-500" />
                        Sync to Records
                      </button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Lab Results</h4>
                          <button 
                            onClick={() => setShowTrendId(showTrendId === req.id ? null : req.id)}
                            className="text-xs font-medium text-indigo-600 flex items-center gap-1 hover:underline"
                          >
                            <TrendingUp className="w-3 h-3" />
                            {showTrendId === req.id ? "Hide Trends" : "View Trends"}
                          </button>
                        </div>

                        {showTrendId === req.id ? (
                          <div className="h-64 w-full bg-slate-50 rounded-xl border border-slate-200 p-4 animate-in zoom-in-95 duration-300">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                />
                                {testNames.map((name, i) => (
                                  <Line key={name} type="monotone" dataKey={name} stroke={['#6366f1', '#10b981', '#f59e0b'][i % 3]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} name={name} />
                                ))}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {req.results?.map((res, idx) => (
                              <div key={idx} className={cn(
                                "flex justify-between items-center p-3 rounded-lg border transition-all",
                                res.status === 'high' || res.status === 'low' ? "bg-red-50 border-red-100 shadow-sm" : "bg-slate-50 border-slate-100"
                              )}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-700">{res.test}</span>
                                  {(res.status === 'high' || res.status === 'low') && (
                                    <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className={cn(
                                    "font-bold",
                                    res.status === 'high' || res.status === 'low' ? "text-red-600" : "text-slate-900"
                                  )}>
                                    {res.value} <span className="text-xs font-normal text-slate-500">{res.unit}</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400">Ref: {res.range}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {req.aiAnalysis && (
                        <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-5 animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-bold text-indigo-900 text-sm">AI Interpretation</h4>
                          </div>
                          <div className="prose prose-sm prose-indigo max-w-none text-slate-700">
                            <p className="whitespace-pre-line leading-relaxed">{req.aiAnalysis}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center py-20">
                  <div className="text-center bg-slate-50 p-12 rounded-2xl border-2 border-dashed border-slate-200 max-w-md">
                    <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No completed tests</h3>
                    <p className="text-slate-500 mt-2 text-sm">Resulted tests will appear here.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Signature Modal */}
      <AnimatePresence>
        {showSignature && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-600" />
                  Physician Signature
                </h3>
                <button onClick={() => setShowSignature(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="bg-white border-2 border-slate-200 rounded-lg overflow-hidden flex justify-center">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{ 
                      width: 400, 
                      height: 200, 
                      className: 'sigCanvas cursor-crosshair bg-white' 
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">Sign above using your mouse or touch screen</p>
              </div>
              <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={clearSignature}
                  className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button 
                  onClick={saveSignature}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Confirm Signature
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Template Modals */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save these lab requests as a template for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                placeholder="e.g., Routine Checkup, Cardiac Panel"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Template Modal */}
      <Dialog open={isLoadTemplateModalOpen} onOpenChange={setIsLoadTemplateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
            <DialogDescription>
              Select a template to apply to these lab requests.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-2 py-4">
            {templates && templates.length > 0 ? (
              templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="font-medium text-slate-900 group-hover:text-blue-700">
                    {template.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Last modified: {new Date(template.lastModified).toLocaleDateString()}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                No templates saved yet.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoadTemplateModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

