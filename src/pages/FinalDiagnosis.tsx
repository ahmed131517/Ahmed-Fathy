import { 
  CheckCircle, Activity, Clipboard, Database, Edit3, Cpu, RefreshCw, 
  Printer, Save, AlertTriangle, ChevronRight, AlertCircle, ArrowRight,
  Shield, Info, FileText, Mic, Stethoscope, Pill, UserPlus, BookOpen, 
  CheckSquare, UserCheck, GitBranch, Trash2, Plus, X, Heart, Wind, Copy, FolderOpen,
  Sparkles
} from "lucide-react";
import { SpeakButton } from "../components/SpeakButton";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ICD10Search } from "../components/ICD10Search";
import { ICD10Code } from "../data/icd10";
import { usePatient } from "../lib/PatientContext";
import { useSymptom } from "../lib/SymptomContext";
import { useUser } from "../lib/UserContext";
import { GoogleGenAI } from "@google/genai";
import { db } from "../lib/db";
import { cn } from "../lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useLiveQuery } from "dexie-react-hooks";
import { generateContentWithRetry } from "../utils/gemini";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ClinicalData {
  symptoms: string[];
  examFindings: string[];
  labResults: string[];
  vitals: {
    bp: string;
    hr: string;
    temp: string;
    rr: string;
    spo2: string;
    oxygenType: string;
    oxygenDose: string;
    oxygenInvasive: string;
    oxygenDeviceType: string;
    fio2: string;
    peep: string;
    pressureSupport: string;
    flowRate: string;
    notes: string;
    weight: string;
    height: string;
    bmi: string;
  };
}

interface AIDiagnosis {
  condition: string;
  probability: number;
  icd10: string;
  reasoning: string;
  recommendations: string[];
  missingInfo?: string[];
  redFlags?: string[];
}

export function FinalDiagnosis() {
  const { hasRole } = useUser();
  const navigate = useNavigate();
  const { selectedPatient, setConfirmedDiagnosis } = usePatient();
  const { symptoms } = useSymptom();
  
  if (!hasRole('doctor')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
          <p className="text-slate-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AIDiagnosis[] | null>(null);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<ICD10Code | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [soapNote, setSoapNote] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isPeerReview, setIsPeerReview] = useState(false);
  
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [isLoadTemplateModalOpen, setIsLoadTemplateModalOpen] = useState(false);
  const templates = useLiveQuery(() => db.templates.where('category').equals('diagnosis_reasoning').toArray());

  // Editing state
  const [editingField, setEditingField] = useState<keyof ClinicalData | null>(null);
  const [editingValue, setEditingValue] = useState<string[]>([]);
  
  // Live Queries for Clinical Data
  const liveVitals = useLiveQuery(
    () => selectedPatient ? db.vitals.where('patientId').equals(selectedPatient.id).reverse().first() : null,
    [selectedPatient?.id]
  );

  const liveExam = useLiveQuery(
    () => selectedPatient ? db.physical_exams.where('patientId').equals(selectedPatient.id).and(exam => exam.status === 'finalized').reverse().first() : null,
    [selectedPatient?.id]
  );

  const liveLabs = useLiveQuery(
    () => selectedPatient ? db.lab_results.where('patientId').equals(selectedPatient.id).reverse().limit(20).toArray() : [],
    [selectedPatient?.id]
  );

  const [clinicalData, setClinicalData] = useState<ClinicalData>({
    symptoms: symptoms.map(s => s.label),
    examFindings: [],
    labResults: [],
    vitals: {
      bp: "",
      hr: "",
      temp: "",
      rr: "",
      spo2: "",
      oxygenType: "",
      oxygenDose: "",
      oxygenInvasive: "",
      oxygenDeviceType: "",
      fio2: "",
      peep: "",
      pressureSupport: "",
      flowRate: "",
      notes: "",
      weight: "",
      height: "",
      bmi: ""
    }
  });

  const formatExamFindings = useCallback((data: any) => {
    const findings: string[] = [];
    if (!data) return findings;

    const addSection = (title: string, sectionData: any) => {
      if (!sectionData) return;
      
      const sectionFindings: string[] = [];
      
      // Handle checkbox states
      const stateKey = `${title.toLowerCase()}State`;
      if (sectionData[stateKey]) {
        Object.entries(sectionData[stateKey]).forEach(([key, val]: [string, any]) => {
          if (val === true) sectionFindings.push(key.replace(/-/g, ' '));
          else if (typeof val === 'object' && val.value) sectionFindings.push(`${key.replace(/-/g, ' ')}: ${val.value}`);
        });
      }

      // Handle specific fields
      if (sectionData.breathSounds) sectionFindings.push(`Breath Sounds: ${sectionData.breathSounds}`);
      if (sectionData.heartSounds) sectionFindings.push(`Heart Sounds: ${sectionData.heartSounds}`);
      if (sectionData.bowelSounds) sectionFindings.push(`Bowel Sounds: ${sectionData.bowelSounds}`);
      
      // Handle notes
      if (sectionData.notes) sectionFindings.push(`Notes: ${sectionData.notes}`);

      if (sectionFindings.length > 0) {
        findings.push(`${title}: ${sectionFindings.join('; ')}`);
      }
    };

    addSection('General', data.generalFindings);
    addSection('HEENT', data.heentFindings);
    addSection('SSE', data.sseFindings);
    addSection('Respiratory', data.respiratoryFindings);
    addSection('Cardiovascular', data.cardiovascularFindings);
    addSection('Gastrointestinal', data.gastrointestinalFindings);
    addSection('Musculoskeletal', data.musculoskeletalFindings);
    addSection('Neurological', data.neurologicalFindings);
    addSection('Skin', data.skinFindings);
    addSection('Psychiatric', data.psychiatricFindings);
    addSection('Geriatric', data.geriatricFindings);

    return findings;
  }, []);

  const isInitializedRef = useRef(false);
  const isExamInitializedRef = useRef(false);
  const isLabsInitializedRef = useRef(false);

  useEffect(() => {
    if (liveVitals) {
      setClinicalData(prev => ({
        ...prev,
        vitals: {
          bp: (liveVitals.bp_systolic !== undefined && liveVitals.bp_diastolic !== undefined) ? `${liveVitals.bp_systolic}/${liveVitals.bp_diastolic}` : "",
          hr: liveVitals.hr?.toString() || "",
          temp: liveVitals.temp?.toString() || "",
          rr: liveVitals.rr?.toString() || "",
          spo2: liveVitals.spo2?.toString() || "",
          oxygenType: liveVitals.oxygenType || "",
          oxygenDose: liveVitals.oxygenDose || "",
          oxygenInvasive: liveVitals.oxygenInvasive || "",
          oxygenDeviceType: liveVitals.oxygenDeviceType || "",
          fio2: liveVitals.fio2 || "",
          peep: liveVitals.peep || "",
          pressureSupport: liveVitals.pressureSupport || "",
          flowRate: liveVitals.flowRate || "",
          notes: liveVitals.notes || "",
          weight: liveVitals.weight?.toString() || "",
          height: liveVitals.height?.toString() || "",
          bmi: liveVitals.bmi?.toString() || ""
        }
      }));
    }
  }, [liveVitals]);

  useEffect(() => {
    if (!isExamInitializedRef.current && liveExam) {
      const findings = formatExamFindings(liveExam.data);
      setClinicalData(prev => ({
        ...prev,
        examFindings: findings
      }));
      isExamInitializedRef.current = true;
    }
  }, [liveExam, formatExamFindings]);

  useEffect(() => {
    if (!isLabsInitializedRef.current && liveLabs && liveLabs.length > 0) {
      const labStrings = liveLabs.map(l => `${l.testName}: ${l.value} ${l.unit} (${l.status})`);
      setClinicalData(prev => ({
        ...prev,
        labResults: labStrings
      }));
      isLabsInitializedRef.current = true;
    }
  }, [liveLabs]);

  useEffect(() => {
    if (clinicalData.vitals.weight && clinicalData.vitals.height) {
      const weight = parseFloat(clinicalData.vitals.weight);
      const height = parseFloat(clinicalData.vitals.height) / 100; // cm to m
      if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        setClinicalData(prev => ({
          ...prev,
          vitals: { ...prev.vitals, bmi }
        }));
      }
    }
  }, [clinicalData.vitals.weight, clinicalData.vitals.height]);

  useEffect(() => {
    if (!isInitializedRef.current && symptoms.length > 0) {
      setClinicalData(prev => ({
        ...prev,
        symptoms: symptoms.map(s => s.label)
      }));
      isInitializedRef.current = true;
    }
  }, [symptoms]);

  const handleGetSuggestions = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first.");
      return;
    }

    setIsAnalyzing(true);
    setSuggestions(null);

    try {
      const prompt = `
        Act as an expert clinical diagnostician. Analyze the following patient data and provide a differential diagnosis.
        
        Patient: ${selectedPatient.name}, ${selectedPatient.age} years old, ${selectedPatient.gender}
        
        Symptoms: ${clinicalData.symptoms.join(", ")}
        Physical Exam: ${clinicalData.examFindings.join(", ")}
        Vitals: BP ${clinicalData.vitals.bp}, HR ${clinicalData.vitals.hr}, Temp ${clinicalData.vitals.temp}°C, RR ${clinicalData.vitals.rr}, SpO2 ${clinicalData.vitals.spo2}% (${clinicalData.vitals.oxygenType === 'oxygen_supply' ? `Oxygen Supply: ${clinicalData.vitals.oxygenDose} ${clinicalData.vitals.oxygenInvasive} - Type: ${clinicalData.vitals.oxygenDeviceType}, Settings: ${clinicalData.vitals.oxygenInvasive === 'invasive' ? `FiO2: ${clinicalData.vitals.fio2}, PEEP: ${clinicalData.vitals.peep}, PS: ${clinicalData.vitals.pressureSupport}` : `Flow: ${clinicalData.vitals.flowRate}`}, Notes: ${clinicalData.vitals.notes}` : 'Room Air'})
        Labs/Imaging: ${clinicalData.labResults.join(", ")}

        Return a JSON object with the following structure:
        {
          "top_diagnosis": {
            "condition": "Name of condition",
            "probability": number (0-100),
            "icd10": "ICD-10 code",
            "reasoning": "Detailed clinical reasoning...",
            "recommendations": ["Next step 1", "Next step 2"],
            "red_flags": ["Critical warning 1"]
          },
          "differentials": [
            {
              "condition": "Name",
              "probability": number,
              "icd10": "Code",
              "reasoning": "Why this is possible but less likely..."
            }
          ],
          "missing_info": ["Key missing data point 1"]
        }
      `;

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || "{}");
      
      if (data.top_diagnosis) {
        const allSuggestions = [
          data.top_diagnosis,
          ...(data.differentials || [])
        ];
        setSuggestions(allSuggestions);
        setAiConfidence(data.top_diagnosis.probability);
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Failed to generate analysis. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = (suggestion: AIDiagnosis) => {
    const code: ICD10Code = {
      code: suggestion.icd10,
      description: suggestion.condition
    };
    setSelectedDiagnosis(code);
    setReasoning(suggestion.reasoning);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name.");
      return;
    }

    const templateData = {
      diagnosis: selectedDiagnosis,
      reasoning: reasoning,
      symptoms: clinicalData.symptoms,
      examFindings: clinicalData.examFindings,
      labResults: clinicalData.labResults
    };

    try {
      await db.templates.add({
        id: crypto.randomUUID(),
        name: templateName,
        category: 'diagnosis_reasoning',
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
    if (data.diagnosis) setSelectedDiagnosis(data.diagnosis);
    if (data.reasoning) setReasoning(data.reasoning);
    if (data.symptoms) setClinicalData(prev => ({ ...prev, symptoms: data.symptoms }));
    if (data.examFindings) setClinicalData(prev => ({ ...prev, examFindings: data.examFindings }));
    if (data.labResults) setClinicalData(prev => ({ ...prev, labResults: data.labResults }));
    
    setIsLoadTemplateModalOpen(false);
    toast.success(`Template "${template.name}" applied.`);
  };

  const handleFinalize = async () => {
    if (!selectedDiagnosis) {
      toast.error("Please select a final diagnosis.");
      return;
    }
    
    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0];

      // 1. Save Diagnosis
      await db.diagnoses.add({
        id: crypto.randomUUID(),
        patientId: selectedPatient.id,
        condition: selectedDiagnosis.description,
        code: selectedDiagnosis.code,
        description: selectedDiagnosis.description,
        notes: reasoning,
        reasoning: reasoning,
        symptoms: clinicalData.symptoms,
        examFindings: clinicalData.examFindings,
        labResults: clinicalData.labResults,
        date: date,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });

      // 2. Save Vitals if they exist
      const bpParts = clinicalData.vitals.bp.split('/');
      const systolic = parseInt(bpParts[0]);
      const diastolic = parseInt(bpParts[1]);

      await db.vitals.add({
        id: crypto.randomUUID(),
        patientId: selectedPatient.id,
        bp_systolic: isNaN(systolic) ? undefined : systolic,
        bp_diastolic: isNaN(diastolic) ? undefined : diastolic,
        hr: parseInt(clinicalData.vitals.hr) || undefined,
        temp: parseFloat(clinicalData.vitals.temp) || undefined,
        rr: parseInt(clinicalData.vitals.rr) || undefined,
        spo2: parseInt(clinicalData.vitals.spo2) || undefined,
        weight: parseFloat(clinicalData.vitals.weight) || undefined,
        height: parseFloat(clinicalData.vitals.height) || undefined,
        bmi: parseFloat(clinicalData.vitals.bmi) || undefined,
        oxygenType: clinicalData.vitals.oxygenType,
        oxygenDose: clinicalData.vitals.oxygenDose,
        oxygenInvasive: clinicalData.vitals.oxygenInvasive,
        oxygenDeviceType: clinicalData.vitals.oxygenDeviceType,
        fio2: clinicalData.vitals.fio2,
        peep: clinicalData.vitals.peep,
        pressureSupport: clinicalData.vitals.pressureSupport,
        flowRate: clinicalData.vitals.flowRate,
        notes: clinicalData.vitals.notes,
        date: date,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });

      setConfirmedDiagnosis(selectedDiagnosis.description);
      toast.success(`Diagnosis Finalized: ${selectedDiagnosis.description}`);
      
      // Optional: Navigate to medical records or dashboard
      // navigate("/medical-records");
    } catch (error) {
      console.error("Failed to save record:", error);
      toast.error("Failed to save clinical record.");
    }
  };

  const generateSoapNote = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first.");
      return;
    }
    setIsGeneratingNote(true);
    try {
      const prompt = `
        Generate a structured clinical SOAP note for patient ${selectedPatient.name}.
        Symptoms: ${clinicalData.symptoms.join(", ")}
        Exam Findings: ${clinicalData.examFindings.join(", ")}
        Lab Results: ${clinicalData.labResults.join(", ")}
        Final Diagnosis: ${selectedDiagnosis ? selectedDiagnosis.description : "Not finalized"}
        Clinical Reasoning: ${reasoning}
        
        Format as:
        S: Subjective (Symptoms)
        O: Objective (Exam, Vitals, Labs)
        A: Assessment (Diagnosis, Reasoning)
        P: Plan (Recommendations)
      `;
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setSoapNote(response.text || "No note generated.");
      toast.success("SOAP note generated successfully");
    } catch (error) {
      console.error("SOAP note generation failed:", error);
      toast.error("Failed to generate SOAP note.");
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const generatePatientSummary = async () => {
    if (!selectedDiagnosis) {
      toast.error("Please finalize a diagnosis first.");
      return;
    }
    setIsGeneratingSummary(true);
    try {
      const prompt = `
        Generate a plain-language patient education sheet for the condition: ${selectedDiagnosis.description}.
        Include:
        1. Simple explanation of the condition.
        2. Expected recovery timeline.
        3. Red flags (when to seek emergency care).
      `;
      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      toast.success("Patient education summary generated");
      console.log(response.text);
    } catch (error) {
      console.error("Patient summary generation failed:", error);
      toast.error("Failed to generate patient summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Final Diagnosis</h2>
          <p className="text-slate-500">Clinical Decision Support & Record Finalization</p>
        </div>
        
        {/* Diagnostic Journey Timeline */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          {['Analysis', 'Exam', 'Labs', 'Diagnosis'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <span className={cn("text-xs font-medium", i === 3 ? "text-indigo-600" : "text-slate-400")}>{step}</span>
              {i < 3 && <ArrowRight className="w-3 h-3 text-slate-300" />}
            </div>
          ))}
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
          <button 
            onClick={() => {
              toast.info("Printing summary...");
              window.print();
            }}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Summary
          </button>
          <button 
            onClick={handleFinalize}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" /> Finalize Record
          </button>
        </div>
      </div>

      {!selectedPatient ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-300 p-12">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No Patient Selected</h3>
          <p className="text-slate-500 text-center max-w-sm mt-2">
            Please select a patient from the dashboard or patient list to begin the diagnosis process.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* Left Column: Clinical Data Summary */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
            {/* Patient Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                    {selectedPatient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedPatient.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedPatient.age}Y • {selectedPatient.gender} • {selectedPatient.bloodType}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate("/mobile-vitals")}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Update Vitals"
                >
                  <Activity className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                    <Heart className="w-3 h-3" />
                    <span>BP</span>
                  </div>
                  <span className="font-bold text-slate-900">{clinicalData.vitals.bp || "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                    <Activity className="w-3 h-3" />
                    <span>HR</span>
                  </div>
                  <span className="font-bold text-slate-900">{clinicalData.vitals.hr ? `${clinicalData.vitals.hr} bpm` : "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                    <RefreshCw className="w-3 h-3" />
                    <span>Temp</span>
                  </div>
                  <span className={`font-bold ${parseFloat(clinicalData.vitals.temp) > 37.5 ? 'text-red-600' : 'text-slate-900'}`}>
                    {clinicalData.vitals.temp ? `${clinicalData.vitals.temp}°C` : "N/A"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                    <Wind className="w-3 h-3" />
                    <span>RR</span>
                  </div>
                  <span className="font-bold text-slate-900">{clinicalData.vitals.rr ? `${clinicalData.vitals.rr} /min` : "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <div className="flex items-center gap-1 text-slate-500 mb-0.5">
                    <ArrowRight className="w-3 h-3" />
                    <span>SpO2</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {clinicalData.vitals.spo2 ? `${clinicalData.vitals.spo2}%` : "N/A"}
                  </span>
                </div>
              </div>
              {clinicalData.vitals.oxygenType === 'oxygen_supply' && (
                <div className="mt-2 p-2 bg-indigo-50 rounded border border-indigo-100 text-[10px] text-indigo-700">
                  <span className="font-bold">O2 Support:</span> {clinicalData.vitals.oxygenDose} {clinicalData.vitals.oxygenDeviceType?.replace(/_/g, ' ')} 
                  {clinicalData.vitals.oxygenInvasive === 'invasive' ? ` (FiO2: ${clinicalData.vitals.fio2}, PEEP: ${clinicalData.vitals.peep})` : ` (${clinicalData.vitals.flowRate})`}
                </div>
              )}
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Symptoms</h3>
                </div>
                <button 
                  onClick={() => {
                    setEditingField('symptoms');
                    setEditingValue(clinicalData.symptoms);
                  }}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {clinicalData.symptoms.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Exam Findings */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Physical Exam</h3>
                </div>
                <button 
                  onClick={() => {
                    setEditingField('examFindings');
                    setEditingValue(clinicalData.examFindings);
                  }}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {clinicalData.examFindings.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Labs */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Lab Findings</h3>
                </div>
                <button 
                  onClick={() => {
                    setEditingField('labResults');
                    setEditingValue(clinicalData.labResults);
                  }}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Edit
                </button>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {clinicalData.labResults.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Middle Column: Diagnosis & Reasoning */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                <h3 className="font-semibold text-slate-800 text-sm">Confirmed Diagnosis</h3>
              </div>
              <div className="p-6 space-y-6 flex-1 flex flex-col">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Diagnosis</label>
                  <ICD10Search 
                    onSelect={setSelectedDiagnosis} 
                    initialValue={selectedDiagnosis ? `${selectedDiagnosis.code} - ${selectedDiagnosis.description}` : ""}
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Reasoning</label>
                    <button 
                      onClick={() => toast.info("AI Scribe is listening...")}
                      className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
                    >
                      <Mic className="w-3 h-3" /> AI Scribe
                    </button>
                  </div>
                  <Textarea 
                    value={reasoning || ""}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full flex-1 min-h-[200px] px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors text-sm leading-relaxed" 
                    placeholder="Document your clinical reasoning, excluding or including AI suggestions..."
                  ></Textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Decision Support */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 shadow-sm flex flex-col h-full overflow-hidden">
              <div className="border-b border-indigo-100 px-4 py-3 flex justify-between items-center bg-white/60 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-indigo-900 text-sm">AI Decision Support</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider">Beta</span>
                </div>
              </div>
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {!suggestions && !isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                      <RefreshCw className="w-6 h-6 text-indigo-500" />
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2">Generate Analysis</h4>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                      AI will analyze symptoms, vitals, and lab results to suggest differential diagnoses.
                    </p>
                    <button 
                      onClick={handleGetSuggestions}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Analyze Clinical Data
                    </button>
                  </div>
                ) : isAnalyzing ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-slate-900">Analyzing Clinical Data</p>
                      <p className="text-xs text-slate-500 mt-1">Consulting medical knowledge base...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Diagnosis Card */}
                    {suggestions && suggestions.length > 0 && (
                      <div className="bg-white border-l-4 border-indigo-500 rounded-r-lg shadow-sm p-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Most Likely Diagnosis</label>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{suggestions[0].condition}</h3>
                        <SpeakButton text={`${suggestions[0].condition}. Confidence: ${suggestions[0].probability}%. ${suggestions[0].reasoning}`} />
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Confidence</span>
                            <span className="font-bold text-indigo-600">{suggestions[0].probability}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${suggestions[0].probability}%` }}
                            ></div>
                          </div>
                        </div>

                        {suggestions[0].redFlags && suggestions[0].redFlags.length > 0 && (
                          <div className="bg-red-50 border border-red-100 rounded p-2 mb-3">
                            <div className="flex items-center gap-1.5 text-red-700 mb-1">
                              <AlertCircle className="w-3 h-3" />
                              <span className="text-xs font-bold">Red Flags</span>
                            </div>
                            <ul className="list-disc pl-4 text-[10px] text-red-600">
                              {suggestions[0].redFlags.map((flag, i) => (
                                <li key={i}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <button 
                          onClick={() => handleApplySuggestion(suggestions[0])}
                          className="w-full py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                        >
                          Accept Diagnosis <CheckCircle className="w-3 h-3" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button 
                            onClick={() => { console.log("Order Labs clicked"); navigate("/lab-requests"); }}
                            className="py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded text-[10px] font-medium hover:bg-indigo-50 flex items-center justify-center gap-1"
                          >
                            <Stethoscope className="w-3 h-3" /> Order Labs
                          </button>
                          <button 
                            onClick={() => { console.log("Prescribe clicked"); navigate("/prescriptions"); }}
                            className="py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded text-[10px] font-medium hover:bg-indigo-50 flex items-center justify-center gap-1"
                          >
                            <Pill className="w-3 h-3" /> Prescribe
                          </button>
                          <button 
                            onClick={generatePatientSummary}
                            disabled={isGeneratingSummary}
                            className="py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded text-[10px] font-medium hover:bg-indigo-50 flex items-center justify-center gap-1"
                          >
                            {isGeneratingSummary ? <RefreshCw className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />} 
                            {isGeneratingSummary ? "Generating..." : "Education"}
                          </button>
                          <button 
                            onClick={() => { 
                              toast.success("Referral note drafted for specialist consultation.");
                            }}
                            className="py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded text-[10px] font-medium hover:bg-indigo-50 flex items-center justify-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" /> Referral
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Missing Info Alert */}
                    {suggestions && suggestions[0].missingInfo && suggestions[0].missingInfo.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Missing Information</h4>
                          <ul className="list-disc pl-4 text-xs text-amber-700 space-y-0.5">
                            {suggestions[0].missingInfo.map((info, i) => (
                              <li key={i}>{info}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Differentials List */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Differential Diagnoses</h4>
                      <div className="space-y-3">
                        {suggestions?.slice(1).map((suggestion, idx) => (
                          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 hover:border-indigo-300 transition-colors group">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                                  {idx + 2}
                                </span>
                                <span className="font-semibold text-slate-800 text-sm">{suggestion.condition}</span>
                              </div>
                              <SpeakButton text={`${suggestion.condition}. Probability: ${suggestion.probability}%. ${suggestion.reasoning}`} />
                              <span className="text-xs font-bold text-slate-500">{suggestion.probability}%</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2 group-hover:line-clamp-none transition-all">
                              {suggestion.reasoning}
                            </p>
                            <button 
                              onClick={() => handleApplySuggestion(suggestion)}
                              className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                            >
                              Select <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Peer Review & SOAP */}
                    <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isPeerReview}
                          onChange={(e) => setIsPeerReview(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Shield className="w-3 h-3 text-indigo-500" /> Mark for Peer Review
                      </label>
                      <button 
                        onClick={generateSoapNote}
                        disabled={isGeneratingNote}
                        className="w-full py-2 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                      >
                        {isGeneratingNote ? <RefreshCw className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />} 
                        {isGeneratingNote ? "Generating..." : "Generate Final SOAP Note"}
                      </button>
                    </div>

                    {/* Disclaimer */}
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-[10px] text-slate-400 italic text-center">
                        AI suggestions are for informational purposes only. Always use clinical judgment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOAP Note Modal */}
      {soapNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Generated SOAP Note</h3>
              <button onClick={() => setSoapNote(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 whitespace-pre-wrap text-sm text-slate-700">
              {soapNote}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setSoapNote(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Close</button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(soapNote);
                  toast.success("Copied to clipboard");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 capitalize">Edit {editingField.replace(/([A-Z])/g, ' $1')}</h3>
              <button onClick={() => setEditingField(null)} className="p-1 text-slate-400 hover:text-slate-600 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {editingValue.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newValue = [...editingValue];
                      newValue[index] = e.target.value;
                      setEditingValue(newValue);
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <button 
                    onClick={() => setEditingValue(editingValue.filter((_, i) => i !== index))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setEditingValue([...editingValue, ""])}
                className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-sm text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
              <button onClick={() => setEditingField(null)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button 
                onClick={() => {
                  setClinicalData(prev => ({ ...prev, [editingField]: editingValue }));
                  setEditingField(null);
                  toast.success("Updated successfully");
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Template Modals */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Typical Pneumonia Case"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAsTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoadTemplateModalOpen} onOpenChange={setIsLoadTemplateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Template</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {templates && templates.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.localId}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => applyTemplate(template)}
                  >
                    <div>
                      <h4 className="font-medium text-slate-900">{template.name}</h4>
                      <p className="text-xs text-slate-500">
                        Last modified: {new Date(template.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Apply</Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No templates saved yet.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoadTemplateModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
