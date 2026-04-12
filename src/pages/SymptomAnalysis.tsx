import { SpeakButton } from "@/components/SpeakButton";
import { useSymptom } from "@/lib/SymptomContext";
import { useState, MouseEvent, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Headphones, Eye, MessageCircle, Shield, Wind, Heart, Target, Droplets, Layers, X, Activity, HelpCircle, AlertTriangle, CheckCircle2, RefreshCw, ClipboardList, Sparkles, Edit2, ChevronDown, ChevronUp, Loader2, Bone, Brain, TrendingUp, BookOpen, ExternalLink, Info, FileText, FlaskConical, Stethoscope, ArrowRightLeft, Zap } from "lucide-react";
import { ALL_MODELS, SymptomModel } from "@/data/symptomModels";
import { cn } from "@/lib/utils";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { generateContentWithRetry } from "../utils/gemini";
import { SOAPNoteModal } from "@/components/SOAPNoteModal";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ClinicalScoresWidget } from "@/components/ClinicalScoresWidget";
import { DifferentialDiagnosisGrid } from "@/components/DifferentialDiagnosisGrid";
import { CLINICAL_PATHWAYS, ClinicalPathwayRule } from "@/data/clinicalPathways";
import { ClinicalGuardrails } from "@/components/ClinicalGuardrails";
import { usePatient } from "@/lib/PatientContext";
import { WhatsNextModal } from "@/components/WhatsNextModal";

const categories = [
  { id: 'general', name: 'General / Systemic', icon: Activity },
  { id: 'head', name: 'Head, Face, Neck', icon: User },
  { id: 'ear', name: 'Ear, Hearing', icon: Headphones },
  { id: 'eye', name: 'Eye, Vision', icon: Eye },
  { id: 'throat', name: 'Nose/Throat, Mouth', icon: MessageCircle },
  { id: 'back', name: 'Trunk, Back, Pelvis', icon: Shield },
  { id: 'lungs', name: 'Lungs, Breathing', icon: Wind },
  { id: 'heart', name: 'Heart, Chest, Circulation', icon: Heart },
  { id: 'digestive', name: 'Intestinal, Digestive', icon: Target },
  { id: 'kidney', name: 'Kidney, Urine', icon: Droplets },
  { id: 'skin', name: 'Skin, Hair, Nails', icon: Layers },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Bone },
  { id: 'neurological', name: 'Neurological', icon: Brain },
];

type SymptomStatus = 'incomplete' | 'analyzed' | 'red_flag';

interface SelectedSymptom {
  id: string;
  label: string;
  category: string;
  status: SymptomStatus;
  analysisData?: Record<string, string[]>;
  severityTimeline?: { date: string, value: number }[];
  followUpQuestions?: string[];
  reviewNotes?: string;
}

export function SymptomAnalysis() {
  const navigate = useNavigate();
  const { symptoms: contextSymptoms, setSymptoms: setContextSymptoms } = useSymptom();
  const { selectedPatient } = usePatient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);

  // Sync with context on mount
  useEffect(() => {
    if (contextSymptoms.length > 0 && selectedSymptoms.length === 0) {
      setSelectedSymptoms(contextSymptoms.map(cs => ({
        id: cs.id,
        label: cs.label,
        category: cs.category,
        status: cs.status,
        analysisData: cs.analysisData,
        severityTimeline: cs.severityTimeline,
        followUpQuestions: cs.followUpQuestions
      })));
    }
  }, [contextSymptoms]);

  // Sync back to context whenever selectedSymptoms changes
  useEffect(() => {
    setContextSymptoms(selectedSymptoms.map(s => ({
      id: s.id,
      label: s.label,
      category: s.category,
      status: s.status,
      analysisData: s.analysisData,
      severityTimeline: s.severityTimeline,
      followUpQuestions: s.followUpQuestions
    })));
  }, [selectedSymptoms, setContextSymptoms]);
  const [analyzingSymptom, setAnalyzingSymptom] = useState<SelectedSymptom | null>(null);
  const [showCauses, setShowCauses] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedDiagnoses, setGeneratedDiagnoses] = useState<any[]>([]);
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedSymptomId, setExpandedSymptomId] = useState<string | null>(null);
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);
  const [triageLevel, setTriageLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [soapNote, setSoapNote] = useState<string | null>(null);
  const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
  const [isGeneratingSOAP, setIsGeneratingSOAP] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [isWhatsNextOpen, setIsWhatsNextOpen] = useState(false);
  const [conversation, setConversation] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const patientData = useMemo(() => {
    if (selectedPatient) {
      return {
        age: selectedPatient.age,
        gender: selectedPatient.gender.toLowerCase(),
        conditions: selectedPatient.chronicConditions || [],
        medications: selectedPatient.medications || [],
        allergies: selectedPatient.allergies ? [selectedPatient.allergies] : []
      };
    }
    return {
      age: 32,
      gender: 'female',
      conditions: ['Asthma', 'Hypertension'],
      medications: ['Albuterol', 'Lisinopril'],
      allergies: ['Penicillin']
    };
  }, [selectedPatient]);

  const activePathways = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    
    return CLINICAL_PATHWAYS.filter(pathway => {
      const { conditions } = pathway;
      
      // Check symptom IDs
      if (conditions.symptomIds) {
        const hasAllSymptoms = conditions.symptomIds.every(id => 
          selectedSymptoms.some(s => s.id === id)
        );
        if (!hasAllSymptoms) return false;
      }
      
      // Check patient age
      if (conditions.patientAgeMin !== undefined && patientData.age < conditions.patientAgeMin) return false;
      if (conditions.patientAgeMax !== undefined && patientData.age > conditions.patientAgeMax) return false;
      
      // Check patient gender
      if (conditions.patientGender !== undefined && patientData.gender !== conditions.patientGender) return false;
      
      // Check red flags
      if (conditions.hasRedFlag !== undefined) {
        const hasRedFlag = selectedSymptoms.some(s => s.status === 'red_flag');
        if (hasRedFlag !== conditions.hasRedFlag) return false;
      }
      
      // Check required analysis data
      if (conditions.requiredAnalysisData) {
        const matchesAnalysisData = Object.entries(conditions.requiredAnalysisData).every(([key, values]) => {
          return selectedSymptoms.some(s => 
            s.analysisData?.[key]?.some(v => values.includes(v))
          );
        });
        if (!matchesAnalysisData) return false;
      }

      // Check required chronic conditions
      if (conditions.requiredChronicConditions) {
        const hasCondition = conditions.requiredChronicConditions.some(c => 
          patientData.conditions.some(pc => pc.toLowerCase().includes(c.toLowerCase()))
        );
        if (!hasCondition) return false;
      }

      // Check required medications
      if (conditions.requiredMedications) {
        const hasMedication = conditions.requiredMedications.some(m => 
          patientData.medications.some(pm => pm.toLowerCase().includes(m.toLowerCase()))
        );
        if (!hasMedication) return false;
      }
      
      return true;
    });
  }, [selectedSymptoms, patientData]);

  useEffect(() => {
    // Calculate Triage Level
    const hasRedFlag = selectedSymptoms.some(s => s.status === 'red_flag');
    const highSeverity = selectedSymptoms.some(s => s.analysisData?.severity?.includes('severe') || s.analysisData?.severity?.includes('incapacitating'));
    
    // Check if any active pathway forces a high triage level
    const forcedHighTriage = activePathways.some(p => p.actions.triageLevel === 'high');
    
    if (hasRedFlag || forcedHighTriage) setTriageLevel('high');
    else if (highSeverity || selectedSymptoms.length > 3) setTriageLevel('medium');
    else setTriageLevel('low');

    // Notify user of triggered pathways
    if (activePathways.length > 0) {
      const highPriority = activePathways.filter(p => p.actions.triageLevel === 'high');
      if (highPriority.length > 0) {
        toast.error(`CRITICAL: ${highPriority[0].title} Triggered`, {
          description: highPriority[0].actions.alertMessage || "Immediate action required.",
          duration: 5000
        });
      }
    }
  }, [selectedSymptoms, activePathways]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const toggleSymptom = (symptom: SymptomModel, categoryId: string) => {
    const exists = selectedSymptoms.find(s => s.id === symptom.id);
    if (exists) {
      setSelectedSymptoms(prev => prev.filter(s => s.id !== symptom.id));
    } else {
      setSelectedSymptoms(prev => [...prev, {
        id: symptom.id,
        label: symptom.label,
        category: categoryId,
        status: 'incomplete'
      }]);
    }
  };

  const handleAnalyzeSymptom = (symptom: SelectedSymptom) => {
    setAnalyzingSymptom(symptom);
  };

  const handleSaveAnalysis = (analysisData: Record<string, string[]>, severityTimeline?: { date: string, value: number }[]) => {
    if (!analyzingSymptom) return;
    
    const hasRedFlags = analysisData.redFlags && analysisData.redFlags.length > 0;
    
    setSelectedSymptoms(prev => prev.map(s => 
      s.id === analyzingSymptom.id 
        ? { ...s, analysisData, status: hasRedFlags ? 'red_flag' : 'analyzed', severityTimeline }
        : s
    ));
    setAnalyzingSymptom(null);
  };

  const handleAIAnalyze = async (symptom: SelectedSymptom, e: MouseEvent) => {
    e.stopPropagation();
    setAiAnalyzingId(symptom.id);
    
    try {
      const model = ALL_MODELS[symptom.category]?.find(m => m.id === symptom.id);
      if (!model) return;

      const conversationText = conversation.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const prompt = `
        A patient is presenting with ${model.label}. 
        Based on the following conversation, extract the values for these dimensions:
        ${JSON.stringify(model.dimensions)}
        
        Also, check for these red flags:
        ${JSON.stringify(model.redFlags)}
        
        Conversation:
        ${conversationText}
        
        Return a JSON object with the extracted data:
        {
          "analysisData": { "dimensionName": ["value1", "value2"], ... },
          "redFlags": ["flag1", ...],
          "reviewNotes": "Brief clinical review of the findings."
        }
        Only use values from the provided dimensions list if possible. If not mentioned, leave empty.
      `;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysisData: { type: Type.OBJECT },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              reviewNotes: { type: Type.STRING }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      const hasRedFlag = result.redFlags && result.redFlags.length > 0;
      
      setSelectedSymptoms(prev => prev.map(s => 
        s.id === symptom.id 
          ? { 
              ...s, 
              analysisData: { ...result.analysisData, redFlags: result.redFlags }, 
              status: hasRedFlag ? 'red_flag' : 'analyzed',
              reviewNotes: result.reviewNotes
            }
          : s
      ));
      
      setExpandedSymptomId(symptom.id);
      toast.success(`${symptom.label} analyzed by AI`);
    } catch (err) {
      console.error("AI Analysis failed:", err);
      toast.error("AI Analysis failed. Please try manual entry.");
    } finally {
      setAiAnalyzingId(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = { role: 'user' as const, content: newMessage };
    setConversation(prev => [...prev, userMessage]);
    setNewMessage('');
    
    // Call AI
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [...conversation, userMessage].map(m => m.content).join('\n'),
      });
      
      setConversation(prev => [...prev, { role: 'ai' as const, content: response.text || "No response." }]);
    } catch (err) {
      console.error("AI chat failed:", err);
      toast.error("Failed to get AI response. Please try again later.");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSymptomId(prev => prev === id ? null : id);
  };

  const handleShowCauses = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom first.");
      return;
    }
    setShowCauses(true);
    setIsAnalyzing(true);
    
    try {
      const prompt = `Given the following patient symptoms and their analysis, provide a list of possible differential diagnoses.
      
      Symptoms:
      ${selectedSymptoms.map(s => `- ${s.label}: ${JSON.stringify(s.analysisData)}`).join('\n')}
      
      Return a JSON array of objects with: name, likelihood (percentage), severity, code (ICD-10), description, rationale, isRedFlag (boolean), and grounding (array of {title, url}), labs (array of {name, reason}), imaging (array of {name, reason}), and comparison (object with matches array and mismatches array).`;
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      
      const diagnoses = JSON.parse(response.text || '[]');
      // Add IDs to diagnoses
      const diagnosesWithIds = diagnoses.map((d: any, index: number) => ({ ...d, id: `diag_${index}` }));
      setGeneratedDiagnoses(diagnosesWithIds);
    } catch (error) {
      console.error("Error generating diagnoses:", error);
      toast.error("Failed to generate possible causes.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSOAPNote = async () => {
    setIsGeneratingSOAP(true);
    try {
      const prompt = `Generate a professional clinical SOAP note for a patient with the following symptoms: ${selectedSymptoms.map(s => s.label).join(', ')}. 
      Patient History: ${patientData.conditions.join(', ')}. 
      Format as Subjective, Objective, Assessment, Plan.`;
      
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }]
      });
      setSoapNote(response.text || "Failed to generate note.");
      setIsSoapModalOpen(true);
    } catch (err) {
      console.error("SOAP generation failed:", err);
      toast.error("Failed to generate SOAP note");
    } finally {
      setIsGeneratingSOAP(false);
    }
  };

  const activeCategoryData = selectedCategory ? ALL_MODELS[selectedCategory] : [];
  const activeCategoryName = categories.find(c => c.id === selectedCategory)?.name || '';
  const filteredSymptoms = selectedSymptoms.filter(s => filterCategory === 'all' || s.category === filterCategory);

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Symptom Analysis</h2>
            <p className="text-slate-500">Identify and analyze patient symptoms</p>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full flex items-center gap-2 border animate-pulse",
            triageLevel === 'low' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
            triageLevel === 'medium' ? "bg-amber-50 border-amber-200 text-amber-700" :
            "bg-red-50 border-red-200 text-red-700 font-bold"
          )}>
            <div className={cn("w-2 h-2 rounded-full", 
              triageLevel === 'low' ? "bg-emerald-500" :
              triageLevel === 'medium' ? "bg-amber-500" :
              "bg-red-500"
            )} />
            <span className="text-xs uppercase tracking-wider">Triage: {triageLevel} Risk</span>
          </div>
          {selectedPatient ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-700">
              <User className="w-3 h-3" />
              Patient: {selectedPatient.name} ({selectedPatient.age}y {selectedPatient.gender})
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-xs font-medium text-amber-700">
              <AlertTriangle className="w-3 h-3" />
              No Patient Selected (Using Default)
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateSOAPNote}
            disabled={selectedSymptoms.length === 0 || isGeneratingSOAP}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isGeneratingSOAP ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate SOAP Note
          </button>
          <button 
            onClick={() => setSelectedSymptoms([])}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            New Case
          </button>
          <button 
            onClick={() => setIsWhatsNextOpen(true)}
            disabled={selectedSymptoms.length === 0}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            What's Next
          </button>
          <button 
            onClick={handleShowCauses}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Show Possible Causes
          </button>
          <button 
            onClick={() => navigate('/final-diagnosis')}
            disabled={selectedSymptoms.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalize
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Symptom Category</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all text-center group",
                  selectedCategory === cat.id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-500 hover:bg-indigo-50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                  selectedCategory === cat.id ? "bg-indigo-100" : "bg-slate-100 group-hover:bg-indigo-100"
                )}>
                  <cat.icon className={cn(
                    "w-6 h-6 transition-colors",
                    selectedCategory === cat.id ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"
                  )} />
                </div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  selectedCategory === cat.id ? "text-indigo-700" : "text-slate-700 group-hover:text-indigo-700"
                )}>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
        <ClinicalGuardrails activePathways={activePathways} />
        <DifferentialDiagnosisGrid symptoms={selectedSymptoms} />
      </div>

      <div className="space-y-6">
        <ClinicalScoresWidget symptoms={selectedSymptoms} patientHistory={patientData} />

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Selected Symptoms</h3>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          {selectedSymptoms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
              <p className="text-slate-500 text-sm">No symptoms selected yet. Click on a category to begin.</p>
            </div>
          ) : filteredSymptoms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
              <p className="text-slate-500 text-sm">No symptoms match the selected category.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {filteredSymptoms.map(symptom => {
                const isExpanded = expandedSymptomId === symptom.id;
                const isRedFlag = symptom.status === 'red_flag';
                
                return (
                  <div 
                    key={symptom.id} 
                    className={cn(
                      "border rounded-lg transition-colors overflow-hidden",
                      isRedFlag ? "border-red-300 bg-red-50/30" : "border-slate-200 hover:border-indigo-300 bg-white"
                    )}
                  >
                    <div 
                      className="flex items-center justify-between p-3 cursor-pointer"
                      onClick={() => toggleExpand(symptom.id)}
                    >
                      <div className="flex-1">
                        <div className={cn("font-medium text-sm", isRedFlag ? "text-red-900" : "text-slate-800")}>
                          {symptom.label}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            symptom.status === 'incomplete' && "bg-slate-100 text-slate-600",
                            symptom.status === 'analyzed' && "bg-emerald-100 text-emerald-700",
                            symptom.status === 'red_flag' && "bg-red-100 text-red-700"
                          )}>
                            {symptom.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => handleAIAnalyze(symptom, e)}
                          disabled={symptom.status !== 'incomplete' || aiAnalyzingId === symptom.id}
                          title="AI Analyze"
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-transparent rounded-md transition-colors"
                        >
                          {aiAnalyzingId === symptom.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAnalyzeSymptom(symptom); }}
                          title="Manual Edit"
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedSymptoms(prev => prev.filter(s => s.id !== symptom.id)); }}
                          title="Remove"
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                        <div className="p-1 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className={cn(
                        "p-3 border-t text-sm",
                        isRedFlag ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-slate-50/50"
                      )}>
                        {!symptom.analysisData || Object.keys(symptom.analysisData).length === 0 ? (
                          <p className="text-slate-500 italic text-xs">No analysis data yet. Click the AI Analyze or Edit button.</p>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries(symptom.analysisData as Record<string, string[]>).map(([key, values]) => {
                              if (key === 'redFlags' && values.length > 0) {
                                return (
                                  <div key={key} className="flex flex-col gap-1 mt-3">
                                    <span className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Red Flags Identified
                                    </span>
                                    <ul className="list-disc list-inside pl-1 text-red-600 text-xs space-y-0.5">
                                      {values.map(v => <li key={v}>{v}</li>)}
                                    </ul>
                                  </div>
                                );
                              }
                              if (values.length > 0 && key !== 'redFlags') {
                                return (
                                  <div key={key} className="flex items-start gap-2">
                                    <span className="text-slate-500 capitalize text-xs font-medium w-20 flex-shrink-0">{key.replace(/_/g, ' ')}:</span>
                                    <span className="text-slate-700 text-xs">{values.join(', ')}</span>
                                  </div>
                                );
                              }
                              return null;
                            })}
                            {symptom.reviewNotes && (
                              <div className="mt-3 p-2 bg-indigo-50/50 border border-indigo-100 rounded text-[10px] text-indigo-800 flex gap-2">
                                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <p><strong>AI Review:</strong> {symptom.reviewNotes}</p>
                              </div>
                            )}
                            {symptom.severityTimeline && symptom.severityTimeline.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <span className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1 mb-2">
                                  <TrendingUp className="w-3 h-3" /> Severity Progression
                                </span>
                                <div className="flex items-end gap-1 h-12">
                                  {symptom.severityTimeline.map((point, i) => (
                                    <div 
                                      key={i} 
                                      className="flex-1 bg-indigo-100 rounded-t-sm relative group"
                                      style={{ height: `${point.value * 10}%` }}
                                    >
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[8px] px-1 rounded whitespace-nowrap">
                                        {point.date}: {point.value}/10
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Patient History Conversation</h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-60">
              {conversation.map((msg, i) => (
                <div key={i} className={cn("p-3 rounded-lg text-sm flex items-start gap-2", msg.role === 'user' ? "bg-indigo-100 text-indigo-900 ml-auto max-w-[80%]" : "bg-slate-100 text-slate-800 mr-auto max-w-[80%]")}>
                  <div className="flex-1">{msg.content}</div>
                  {msg.role === 'ai' && <SpeakButton text={msg.content} className="p-0.5 hover:bg-slate-200" />}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Ask clarifying question..."
              />
              <button onClick={sendMessage} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Category Symptoms Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">{activeCategoryName} Symptoms</h3>
              <button onClick={() => setSelectedCategory(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {activeCategoryData && activeCategoryData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeCategoryData.map(symptom => {
                    const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                    return (
                      <div 
                        key={symptom.id}
                        onClick={() => toggleSymptom(symptom, selectedCategory)}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-all flex justify-between items-center",
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                            : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700"
                        )}
                      >
                        <span className="font-medium text-sm">{symptom.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">No symptoms available for this category.</p>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end">
              <button 
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Symptom Analysis Modal */}
      {analyzingSymptom && (
        <AnalysisModal 
          symptom={analyzingSymptom} 
          onClose={() => setAnalyzingSymptom(null)} 
          onSave={handleSaveAnalysis} 
        />
      )}

      {/* What's Next Modal */}
      <WhatsNextModal 
        open={isWhatsNextOpen} 
        onOpenChange={setIsWhatsNextOpen} 
        symptoms={selectedSymptoms} 
        patientData={patientData}
      />

      {/* Causes Modal */}
      {showCauses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Possible Causes</h3>
              <button onClick={() => setShowCauses(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-600 font-medium">Analyzing symptoms...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800">Phase 3 Compliance: AI Advisor Only</h4>
                      <p className="text-xs text-amber-700 mt-1">These suggestions are generated by AI for informational purposes. They must be reviewed, verified, and signed off by a licensed clinician before any clinical action is taken.</p>
                    </div>
                  </div>
                  
                  {/* Generated Diagnoses */}
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Differential Diagnoses</h4>
                    <button 
                      onClick={() => setShowComparison(!showComparison)}
                      className="text-xs font-medium text-indigo-600 flex items-center gap-1 hover:underline"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      {showComparison ? "Hide Comparison" : "Compare Diagnoses"}
                    </button>
                  </div>

                  {generatedDiagnoses.map((diag, index) => (
                    <div key={diag.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className={cn("p-4 border-b border-slate-100 flex justify-between items-center", diag.isRedFlag ? "bg-red-50" : index === 0 ? "bg-amber-50" : "bg-slate-50")}>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900">{diag.name}</h4>
                          {index === 0 && <span className="text-[8px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">Primary Suspect</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-slate-600">{diag.likelihood}</span>
                          <button 
                            onClick={() => {
                              navigate('/final-diagnosis');
                              toast.success("Diagnosis selected for verification.");
                            }}
                            className="text-xs font-semibold text-emerald-600 bg-white border border-emerald-200 px-3 py-1 rounded-md hover:bg-emerald-50 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Verify
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">SEVERITY: {diag.severity}</span>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">CODE: {diag.code}</span>
                        </div>

                        {showComparison && (
                          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-emerald-700 uppercase">Matches Presentation</p>
                              <ul className="text-[10px] text-slate-600 list-disc list-inside">
                                {diag.comparison.matches.map((m: string) => <li key={m}>{m}</li>)}
                              </ul>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-red-700 uppercase">Atypical Findings</p>
                              <ul className="text-[10px] text-slate-600 list-disc list-inside">
                                {diag.comparison.mismatches.map((m: string) => <li key={m}>{m}</li>)}
                              </ul>
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-slate-600">{diag.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <FlaskConical className="w-3 h-3" /> Recommended Labs
                            </h5>
                            <div className="space-y-1">
                              {diag.labs.map((lab: any, i: number) => (
                                <div key={i} className="text-[10px] p-2 bg-indigo-50 border border-indigo-100 rounded">
                                  <span className="font-bold text-indigo-700">{lab.name}</span>
                                  <p className="text-indigo-600 opacity-70">{lab.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Stethoscope className="w-3 h-3" /> Recommended Imaging
                            </h5>
                            <div className="space-y-1">
                              {diag.imaging.map((img: any, i: number) => (
                                <div key={i} className="text-[10px] p-2 bg-emerald-50 border border-emerald-100 rounded">
                                  <span className="font-bold text-emerald-700">{img.name}</span>
                                  <p className="text-emerald-600 opacity-70">{img.reason}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-lg border-l-2 border-slate-300 text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Rationale:</span> {diag.rationale}
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Medical Literature Grounding
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {diag.grounding.map((link: any, i: number) => (
                              <a 
                                key={i} 
                                href={link.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[10px] flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                {link.title} <ExternalLink className="w-2 h-2" />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SOAP Note Modal */}
      <SOAPNoteModal 
        isOpen={isSoapModalOpen}
        onClose={() => setIsSoapModalOpen(false)}
        initialContent={soapNote || ""}
        patientName={selectedPatient?.name}
      />
    </div>
  );
}

function AnalysisModal({ symptom, onClose, onSave }: { symptom: SelectedSymptom, onClose: () => void, onSave: (data: any, timeline?: any) => void }) {
  const model = ALL_MODELS[symptom.category]?.find(m => m.id === symptom.id);
  const [formData, setFormData] = useState<Record<string, string[]>>(symptom.analysisData || {});
  const [severityTimeline, setSeverityTimeline] = useState<{ date: string, value: number }[]>(symptom.severityTimeline || [
    { date: '3 days ago', value: 2 },
    { date: '2 days ago', value: 4 },
    { date: 'Yesterday', value: 7 },
    { date: 'Today', value: 5 },
  ]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>(symptom.followUpQuestions || []);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  useEffect(() => {
    if (followUpQuestions.length === 0 && model) {
      generateFollowUpQuestions();
    }
  }, []);

  const generateFollowUpQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Generate 3 clinical follow-up questions for a patient presenting with ${model.label}. Focus on ruling out differential diagnoses.` }] }],
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      setFollowUpQuestions(JSON.parse(response.text || "[]"));
    } catch (err) {
      console.error("Failed to generate questions:", err);
      toast.error("Failed to generate follow-up questions");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  if (!model) return null;

  const handleCheckboxChange = (dimension: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const current = prev[dimension] || [];
      if (checked) {
        return { ...prev, [dimension]: [...current, value] };
      } else {
        return { ...prev, [dimension]: current.filter(v => v !== value) };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            {model.label} Analysis
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Severity Timeline */}
          <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Severity Timeline (0-10)
            </h4>
            <div className="space-y-4">
              {severityTimeline.map((point, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 w-20">{point.date}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={point.value}
                    onChange={(e) => {
                      const newTimeline = [...severityTimeline];
                      newTimeline[i].value = parseInt(e.target.value);
                      setSeverityTimeline(newTimeline);
                    }}
                    className="flex-1 h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-bold text-indigo-600 w-4">{point.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Follow-up Questions */}
          <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Follow-up Questions
              </h4>
              {isGeneratingQuestions && <Loader2 className="w-3 h-3 animate-spin text-amber-600" />}
            </div>
            <div className="space-y-3">
              {followUpQuestions.map((q, i) => (
                <div key={i} className="flex gap-3 bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                  <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>

          {model.dimensions && Object.keys(model.dimensions).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Key Questions
              </h4>
              <div className="space-y-5">
                {Object.entries(model.dimensions).map(([dim, values]) => (
                  <div key={dim} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <h5 className="text-sm font-medium text-slate-700 mb-3 capitalize">{dim.replace(/_/g, ' ')}</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {values.map(val => (
                        <label key={val} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                            checked={(formData[dim] || []).includes(val)}
                            onChange={(e) => handleCheckboxChange(dim, val, e.target.checked)}
                          />
                          <span className="text-sm text-slate-600 group-hover:text-slate-900">{val}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {model.redFlags && model.redFlags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags
              </h4>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 space-y-2">
                {model.redFlags.map(flag => (
                  <label key={flag} className="flex items-start gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 mt-0.5 text-red-600 rounded border-red-300 focus:ring-red-500"
                      checked={(formData.redFlags || []).includes(flag)}
                      onChange={(e) => handleCheckboxChange('redFlags', flag, e.target.checked)}
                    />
                    <span className="text-sm text-red-800 group-hover:text-red-900">{flag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSave(formData, severityTimeline)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Save Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
