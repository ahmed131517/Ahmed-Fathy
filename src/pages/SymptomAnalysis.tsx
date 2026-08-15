import { SpeakButton } from "@/components/SpeakButton";
import { useSymptom } from "@/lib/SymptomContext";
import { useState, MouseEvent, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { User, Headphones, Eye, MessageCircle, Shield, Wind, Heart, Target, Droplets, Layers, X, Activity, HelpCircle, AlertTriangle, CheckCircle2, RefreshCw, ClipboardList, Sparkles, Edit2, ChevronDown, ChevronUp, Loader2, Bone, Brain, TrendingUp, BookOpen, ExternalLink, Info, FileText, FlaskConical, Stethoscope, ArrowRightLeft, Zap, Search, Mars, Venus, Thermometer, Droplet, Smile, ShieldAlert, Baby, Hourglass, Database, Download } from "lucide-react";
import { ALL_MODELS, SymptomModel } from "@/data/symptomModels";
import { cn } from "@/lib/utils";
import { parseJsonResponse } from "../utils/gemini";
import { SOAPNoteModal } from "@/components/SOAPNoteModal";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ClinicalScoresWidget } from "@/components/ClinicalScoresWidget";
import { DifferentialDiagnosisGrid } from "@/components/DifferentialDiagnosisGrid";
import { PertinentNegativesPanel } from "@/components/PertinentNegativesPanel";
import { PertinentNegativeItem } from "@/data/pertinentNegativesDictionary";
import { isSymptomMatch } from "@/services/clinicalAI/differentialEngine";
import { findEMRSymptomByTerm } from "@/data/emrSymptomDictionary";
import { CLINICAL_PATHWAYS, ClinicalPathwayRule } from "@/data/clinicalPathways";
import { ClinicalGuardrails } from "@/components/ClinicalGuardrails";
import { usePatient } from "@/lib/PatientContext";
import { WhatsNextModal } from "@/components/WhatsNextModal";
import { useAISettings } from "@/lib/AISettingsContext";
import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { Diagnosis } from '@/data/diagnosisMappings';
import { saveCustomDiagnosis } from '@/lib/customDiagnoses';
import { generateFhirBundle } from "@/services/clinicalAI/fhirService";

const ALL_CATEGORIES = [
  { id: 'general', name: 'General / Systemic', icon: Activity, domain: 'systemic' },
  { id: 'pediatric', name: 'Pediatric / Development', icon: Baby, maxAge: 17, domain: 'demographic' },
  { id: 'head', name: 'Head, Face, Neck', icon: User, domain: 'neuro_ent' },
  { id: 'ear', name: 'Ear, Hearing', icon: Headphones, domain: 'neuro_ent' },
  { id: 'eye', name: 'Eye, Vision', icon: Eye, domain: 'neuro_ent' },
  { id: 'throat', name: 'Nose / Throat, Mouth', icon: MessageCircle, domain: 'neuro_ent' },
  { id: 'back', name: 'Back, Spine', icon: Activity, domain: 'musculoskeletal_skin' },
  { id: 'lungs', name: 'Lungs, Breathing', icon: Wind, domain: 'cardiopulmonary' },
  { id: 'heart', name: 'Heart, Chest, Circulation', icon: Heart, domain: 'cardiopulmonary' },
  { id: 'digestive', name: 'Intestinal, Digestive', icon: Target, domain: 'digestive_renal' },
  { id: 'kidney', name: 'Kidney, Urine', icon: Droplets, domain: 'digestive_renal' },
  { id: 'male', name: 'Male Reproductive', icon: Mars, gender: 'male', minAge: 12, domain: 'demographic' },
  { id: 'female', name: 'Female Reproductive', icon: Venus, gender: 'female', minAge: 10, domain: 'demographic' },
  { id: 'skin', name: 'Skin, Hair, Nails', icon: Layers, domain: 'musculoskeletal_skin' },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Bone, domain: 'musculoskeletal_skin' },
  { id: 'neurological', name: 'Neurological', icon: Brain, domain: 'neuro_ent' },
  { id: 'geriatric', name: 'Aging / Geriatrics', icon: Hourglass, minAge: 65, domain: 'demographic' },
  { id: 'endocrine', name: 'Endocrine', icon: Thermometer, domain: 'systemic' },
  { id: 'hematologic', name: 'Hematologic / Lymphatic', icon: Droplet, domain: 'systemic' },
  { id: 'psychiatric', name: 'Psychiatric', icon: Smile, minAge: 5, domain: 'systemic' },
  { id: 'immunologic', name: 'Bridge System (Allergic / Immunologic)', icon: ArrowRightLeft, domain: 'systemic' },
  { id: 'trauma', name: 'Trauma & Emergency Injury', icon: ShieldAlert, domain: 'musculoskeletal_skin' },
];

const SYSTEM_DOMAINS = [
  { id: 'all', label: 'All Systems' },
  { id: 'cardiopulmonary', label: 'Cardiopulmonary' },
  { id: 'neuro_ent', label: 'Neuro & ENT' },
  { id: 'digestive_renal', label: 'Digestive & Renal' },
  { id: 'systemic', label: 'Systemic & Metabolic' },
  { id: 'musculoskeletal_skin', label: 'Musculoskeletal, Trauma & Skin' },
  { id: 'demographic', label: 'Demographic Specific' },
];

const QUICK_CLINICAL_PRESETS = [
  {
    title: "Acute Chest Pain / ACS",
    symptoms: [
      { id: "heart_chest_pain", label: "Chest Pain / Pressure", category: "heart", status: "red_flag" as const, analysisData: { character: ["substernal pressure", "radiating to left arm"], redFlags: ["Crushing pressure with diaphoresis"] } },
      { id: "lungs_dyspnea", label: "Shortness of Breath", category: "lungs", status: "analyzed" as const, analysisData: { onset: ["sudden"], severity: ["severe"] } },
      { id: "heart_diaphoresis", label: "Cold Sweats / Diaphoresis", category: "heart", status: "analyzed" as const, analysisData: { character: ["profuse cold sweating"] } }
    ]
  },
  {
    title: "Polytrauma / MVA Triage",
    symptoms: [
      { id: "trauma_head_concussion", label: "Head Injury & Concussion (TBI)", category: "trauma", status: "red_flag" as const, analysisData: { mechanism: ["motor vehicle collision"], lossOfConsciousness: ["1 to 5 minutes"], symptoms: ["confusion/fogginess"] } },
      { id: "trauma_blunt_chest", label: "Blunt Chest Trauma & Rib Injury", category: "trauma", status: "analyzed" as const, analysisData: { mechanism: ["seatbelt sign"], symptoms: ["sharp localized chest pain"] } },
      { id: "trauma_extremity_fracture", label: "Fracture, Dislocation & Limb Trauma", category: "trauma", status: "analyzed" as const, analysisData: { location: ["lower extremity"], findings: ["inability to bear weight"] } }
    ]
  },
  {
    title: "Acute Stroke / TIA Triage",
    symptoms: [
      { id: "neuro_facial_weakness", label: "Facial Weakness / Droop", category: "neurological", status: "red_flag" as const, analysisData: { onset: ["sudden"], redFlags: ["Acute focal neurological deficit"] } },
      { id: "neuro_dysarthria", label: "Slurred Speech / Dysarthria", category: "neurological", status: "red_flag" as const, analysisData: { onset: ["sudden"] } },
      { id: "neuro_focal_weakness", label: "Unilateral Limb Weakness", category: "neurological", status: "red_flag" as const, analysisData: { location: ["right arm and leg"] } }
    ]
  },
  {
    title: "Anaphylaxis / Airway Crisis",
    symptoms: [
      { id: "immuno_hives_urticaria", label: "Hives (Urticaria) & Angioedema", category: "immunologic", status: "red_flag" as const, analysisData: { type: ["hives (Urticaria)", "swelling (Angioedema)"], redFlags: ["Swelling of the lips, tongue, or face"] } },
      { id: "immuno_difficulty_breathing_after_exposure", label: "Difficulty Breathing After Exposure", category: "immunologic", status: "red_flag" as const, analysisData: { character: ["wheezing after exposure", "shortness of breath"] } },
      { id: "immuno_throat_swelling", label: "Throat Swelling", category: "immunologic", status: "analyzed" as const, analysisData: { local: ["throat tightness/hoarseness"] } }
    ]
  },
  {
    title: "Acute Abdomen Crisis",
    symptoms: [
      { id: "digestive_abd_pain", label: "Abdominal Pain", category: "digestive", status: "red_flag" as const, analysisData: { location: ["right lower quadrant"], character: ["sharp constant"], redFlags: ["Rebound tenderness and guarding"] } },
      { id: "digestive_nausea_vomiting", label: "Nausea & Vomiting", category: "digestive", status: "analyzed" as const, analysisData: { frequency: ["frequent"] } },
      { id: "general_fever", label: "Fever / Chills", category: "general", status: "analyzed" as const, analysisData: { temp: ["high grade > 38.5C"] } }
    ]
  },
  {
    title: "Sepsis Screen",
    symptoms: [
      { id: "general_fever", label: "Fever / Chills", category: "general", status: "red_flag" as const, analysisData: { character: ["rigors"], redFlags: ["Fever with altered mental status"] } },
      { id: "lungs_tachypnea", label: "Rapid Breathing / Tachypnea", category: "lungs", status: "analyzed" as const, analysisData: { rate: ["respiratory rate > 22/min"] } },
      { id: "neuro_confusion", label: "Altered Mental Status / Confusion", category: "neurological", status: "red_flag" as const, analysisData: { onset: ["acute delirium"] } }
    ]
  }
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
  const { symptoms: contextSymptoms, setSymptoms: setContextSymptoms, chiefComplaint, setChiefComplaint } = useSymptom();
  const { selectedPatient } = usePatient();
  const { settings: aiSettings } = useAISettings();
  const latestVitals = useLiveQuery(
    () => selectedPatient ? db.vitals.where('patientId').equals(selectedPatient.id).reverse().first() : null,
    [selectedPatient?.id]
  );
  const patientDiagnoses = useLiveQuery(
    () => selectedPatient ? db.diagnoses.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient?.id]
  ) || [];
  const patientPhysicalExams = useLiveQuery(
    () => selectedPatient ? db.physical_exams.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient?.id]
  ) || [];
  const patientNotes = useLiveQuery(
    () => selectedPatient ? db.patient_notes.where('patientId').equals(selectedPatient.id).toArray() : [],
    [selectedPatient?.id]
  ) || [];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [activePertinentNegatives, setActivePertinentNegatives] = useState<PertinentNegativeItem[]>([]);
  const [symptomSearchQuery, setSymptomSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [ccSearchOpen, setCcSearchOpen] = useState(false);

  const COMMON_CHIEF_COMPLAINTS = [
    "Acute Retrosternal Chest Pain & Dyspnea",
    "Severe Throbbing Headache with Photophobia",
    "Shortness of Breath & Productive Cough",
    "Right Lower Quadrant Abdominal Pain & Nausea",
    "Dizziness, Vertigo & Lightheadedness",
    "High Fever, Chills & Generalized Fatigue",
    "Acute Facial Droop & Slurred Speech",
    "Lower Back Pain Radiating Down Leg",
    "Palpitations & Fast Heart Rate",
    "Sore Throat, Dysphagia & Fever",
    "Joint Swelling & Morning Stiffness",
    "Frequency, Urgency & Dysuria",
    "Unintentional Weight Loss & Night Sweats",
    "Skin Rash, Pruritus & Erythema",
    "Epigastric Burning Pain After Meals"
  ];

  const handleTogglePertinentNegative = (item: PertinentNegativeItem) => {
    setActivePertinentNegatives(prev => {
      const exists = prev.some(n => n.id === item.id);
      if (exists) return prev.filter(n => n.id !== item.id);
      return [...prev, item];
    });
  };

  const patientData = useMemo(() => {
    if (selectedPatient) {
      return {
        age: selectedPatient.age,
        gender: selectedPatient.gender?.toLowerCase() || 'female',
        conditions: selectedPatient.chronicConditions || [],
        medications: selectedPatient.medications?.map(m => m.name) || [],
        allergies: selectedPatient.allergies?.map(a => a.name) || []
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

  const fullPatientClinicalContext = useMemo(() => {
    const name = selectedPatient?.name || "Patient";
    const age = selectedPatient?.age ?? 32;
    const gender = selectedPatient?.gender || "female";
    const bloodType = selectedPatient?.bloodType || "N/A";
    const conditions = selectedPatient?.chronicConditions?.length 
      ? selectedPatient.chronicConditions.join(", ") 
      : "None reported";
    const medications = selectedPatient?.medications?.length 
      ? selectedPatient.medications.map(m => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}${m.frequency ? ` (${m.frequency})` : ''}`).join(", ")
      : "None active";
    const allergies = selectedPatient?.allergies?.length
      ? selectedPatient.allergies.map(a => `${a.name}${a.severity ? ` (${a.severity})` : ''}`).join(", ")
      : "No known drug allergies (NKDA)";
    const surgeries = selectedPatient?.surgeries?.length 
      ? selectedPatient.surgeries.join(", ") 
      : "None reported";
    const familyHist = selectedPatient?.familyHistory?.length 
      ? selectedPatient.familyHistory.join(", ") 
      : "None reported";
    const labResults = selectedPatient?.labResults?.length 
      ? selectedPatient.labResults.map(l => `${l.labName}: ${l.value} ${l.unit} [${l.range}]`).join("; ")
      : "No recent laboratory tests recorded";

    let vitalsStr = "None recorded";
    if (latestVitals) {
      vitalsStr = `Blood Pressure: ${latestVitals.bp_systolic && latestVitals.bp_diastolic ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : 'N/A'}, Heart Rate: ${latestVitals.hr ? latestVitals.hr + ' bpm' : 'N/A'}, Resp Rate: ${latestVitals.rr ? latestVitals.rr + '/min' : 'N/A'}, Temp: ${latestVitals.temp ? latestVitals.temp + '°C' : 'N/A'}, SpO2: ${latestVitals.spo2 ? latestVitals.spo2 + '%' : 'N/A'}`;
    } else if (selectedPatient?.vitalsHistory?.length) {
      const v = selectedPatient.vitalsHistory[selectedPatient.vitalsHistory.length - 1];
      vitalsStr = `Blood Pressure: ${v.bloodPressure || 'N/A'}, Heart Rate: ${v.heartRate ? v.heartRate + ' bpm' : 'N/A'}, Weight: ${v.weight ? v.weight + ' kg' : 'N/A'}`;
    }

    let gynObsStr = "";
    if (gender.toLowerCase() === 'female' && (selectedPatient?.gynHistory || selectedPatient?.obsHistory)) {
      const gyn = selectedPatient?.gynHistory;
      const obs = selectedPatient?.obsHistory;
      gynObsStr = `\n- Gynecologic/Obstetric History: ${gyn?.lmp ? `LMP: ${gyn.lmp}, ` : ''}${gyn?.cycleRegularity ? `Cycle: ${gyn.cycleRegularity}, ` : ''}${obs?.gravidity ? `G${obs.gravidity}P${obs.parity}` : ''}`;
    }

    const dxHistoryStr = patientDiagnoses.length
      ? patientDiagnoses.slice(0, 5).map(d => `- [${d.date || 'Recent'}] ${d.code ? `(${d.code}) ` : ''}${d.description || d.condition}`).join("\n")
      : "None recorded in EMR";

    const examHistoryStr = patientPhysicalExams.length
      ? patientPhysicalExams.slice(0, 3).map(e => `- [${e.date || 'Recent'}] Status: ${e.status || 'recorded'}`).join("\n")
      : "None recorded in EMR";

    const notesHistoryStr = patientNotes.length
      ? patientNotes.slice(0, 3).map(n => `- [${n.date || 'Recent'}] (${n.category || 'Clinical Note'}) ${n.title ? `${n.title}: ` : ''}${n.content}`).join("\n")
      : "None recorded in EMR";

    return `PATIENT COMPLETE CLINICAL PROFILE:
- Demographics: ${name}, ${age} years old, ${gender}, Blood Type: ${bloodType}
- PRIMARY CHIEF COMPLAINT (REASON FOR VISIT): ${chiefComplaint || 'Not specified'}
- Vital Signs: ${vitalsStr}
- Known Chronic Conditions: ${conditions}
- Active Medications: ${medications}
- Known Allergies & Sensitivities: ${allergies}
- Past Surgical History: ${surgeries}
- Family Medical History: ${familyHist}${gynObsStr}
- Diagnostic Lab Results: ${labResults}

EHR MEDICAL RECORDS HISTORY:
- Recorded Diagnoses History:
${dxHistoryStr}
- Physical Examination History:
${examHistoryStr}
- Clinical Progress Notes:
${notesHistoryStr}`;
  }, [selectedPatient, latestVitals, chiefComplaint, patientDiagnoses, patientPhysicalExams, patientNotes]);

  const categorySymptomCounts = useMemo(() => {
    const map: Record<string, number> = {};
    Object.entries(ALL_MODELS).forEach(([catId, symptoms]) => {
      map[catId] = symptoms.length;
    });
    return map;
  }, []);

  const categoryRedFlagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    selectedSymptoms.forEach(s => {
      if (s.status === 'red_flag') {
        map[s.category] = (map[s.category] || 0) + 1;
      }
    });
    return map;
  }, [selectedSymptoms]);

  const categories = useMemo(() => {
    return ALL_CATEGORIES.filter(cat => {
      // System Domain filter
      if (selectedDomain !== 'all' && cat.domain !== selectedDomain) return false;

      // Gender filtering
      if (cat.gender && cat.gender !== patientData.gender) return false;
      
      // Age filtering
      // @ts-ignore - custom properties
      if (cat.minAge !== undefined && patientData.age < cat.minAge) return false;
      // @ts-ignore - custom properties
      if (cat.maxAge !== undefined && patientData.age > cat.maxAge) return false;
      
      return true;
    });
  }, [patientData.gender, patientData.age, selectedDomain]);

  const allSymptomsFlattened = useMemo(() => {
    return Object.entries(ALL_MODELS).flatMap(([categoryId, symptoms]) => 
      symptoms.map(s => ({ ...s, categoryId }))
    );
  }, []);

  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    ALL_CATEGORIES.forEach(cat => {
      map[cat.id] = cat.name;
    });
    return map;
  }, []);

  const chiefComplaintSearchResults = useMemo(() => {
    const query = chiefComplaint.trim().toLowerCase();
    
    if (!query) {
      return {
        symptoms: allSymptomsFlattened.slice(0, 15),
        complaints: COMMON_CHIEF_COMPLAINTS.slice(0, 6)
      };
    }

    const matchedSymptoms = allSymptomsFlattened.filter(s => {
      const catName = categoryNameMap[s.categoryId] || '';
      return s.label.toLowerCase().includes(query) ||
             s.id.toLowerCase().includes(query) ||
             catName.toLowerCase().includes(query);
    }).slice(0, 30);

    const matchedComplaints = COMMON_CHIEF_COMPLAINTS.filter(cc =>
      cc.toLowerCase().includes(query)
    );

    return {
      symptoms: matchedSymptoms,
      complaints: matchedComplaints
    };
  }, [chiefComplaint, allSymptomsFlattened, categoryNameMap]);

  const handleSelectSymptomFromSearch = (symptom: { id: string; label: string; categoryId: string }) => {
    setChiefComplaint(symptom.label);
    setCcSearchOpen(false);

    setSelectedSymptoms(prev => {
      if (prev.some(s => s.id === symptom.id)) {
        return prev;
      }
      const newSymptom: SelectedSymptom = {
        id: symptom.id,
        label: symptom.label,
        category: symptom.categoryId,
        status: 'incomplete',
        analysisData: {}
      };
      return [...prev, newSymptom];
    });

    const catName = categoryNameMap[symptom.categoryId] || symptom.categoryId;
    toast.success(`Set Chief Complaint to "${symptom.label}" & added from ${catName}!`);
  };

  const searchResults = useMemo(() => {
    if (!symptomSearchQuery.trim()) return [];
    const query = symptomSearchQuery.toLowerCase();
    const visibleCategoryIds = categories.map(c => c.id);
    
    return allSymptomsFlattened.filter(s => 
      visibleCategoryIds.includes(s.categoryId) && (
        s.label.toLowerCase().includes(query) || 
        s.categoryId.toLowerCase().includes(query)
      )
    );
  }, [symptomSearchQuery, allSymptomsFlattened, categories]);

  const categoriesWithSelection = useMemo(() => {
    const counts: Record<string, number> = {};
    selectedSymptoms.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [selectedSymptoms]);

  // Sync with context on mount
  useEffect(() => {
    if ((contextSymptoms || []).length > 0 && (selectedSymptoms || []).length === 0) {
      setSelectedSymptoms((contextSymptoms || []).map(cs => ({ ...cs })));
    }
  }, []); // Only on mount

  // Sync back to context whenever selectedSymptoms changes
  useEffect(() => {
    // Only update context if there's a real change to avoid loops
    if (JSON.stringify(contextSymptoms || []) !== JSON.stringify(selectedSymptoms || [])) {
      setContextSymptoms((selectedSymptoms || []).map(s => ({ ...s })));
    }
  }, [selectedSymptoms, setContextSymptoms, contextSymptoms]);
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
  const [aiQuestions, setAiQuestions] = useState<Array<{ id: string; question: string; options: string[]; answer?: string }>>([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [diagnosticConclusion, setDiagnosticConclusion] = useState<{ finalDiagnosis?: string; confidence?: number; explanation?: string } | null>(null);
  
  const activePathways = useMemo(() => {
    if (selectedSymptoms.length === 0) return [];
    
    return CLINICAL_PATHWAYS.filter(pathway => {
      const { conditions } = pathway;
      
      // Check symptom IDs
      if (conditions.symptomIds) {
        const hasAllSymptoms = conditions.symptomIds.every(id => 
          selectedSymptoms.some(s => isSymptomMatch(id, s))
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
      const emrDef = findEMRSymptomByTerm(symptom.id) || findEMRSymptomByTerm(symptom.label);
      setSelectedSymptoms(prev => [...prev, {
        id: symptom.id,
        label: symptom.label,
        category: categoryId,
        status: 'incomplete',
        symptom_id: emrDef?.symptom_id || `SYM_${symptom.id.toUpperCase()}`,
        snomed_code: emrDef?.snomed_code || '386661006',
        icd_mapping: emrDef?.icd_mapping || 'R50.9',
        synonyms: emrDef?.synonyms || [symptom.label],
        attributeConfig: emrDef?.attributeConfig || { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
        attributes: {
          severity: 'Moderate',
          duration: '1-3 days',
          onset: 'Gradual'
        }
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
        A patient is presenting with Chief Complaint: "${chiefComplaint || 'Not specified'}" and primary symptom "${model.label}". 
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

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );

      const result = parseJsonResponse(responseText, {} as any);
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
    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      toast.error(err.message || "AI Analysis failed. Please try manual entry.");
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
      const responseText = await clinicalAIRequest(
        [
          {
            role: 'system',
            content: `You are an expert clinical diagnostician assistant helping with patient evaluation and diagnostic narrowing.
${fullPatientClinicalContext}

PRIMARY CHIEF COMPLAINT (REASON FOR VISIT):
${chiefComplaint || 'Not specified'}

PRESENTING SYMPTOMS:
${selectedSymptoms.map(s => `- ${s.label} (${s.status}): ${JSON.stringify(s.analysisData || {})}`).join('\n')}`
          },
          ...conversation.map(m => ({
            role: m.role === 'ai' ? 'assistant' as const : 'user' as const,
            content: m.content
          })),
          {
            role: 'user' as const,
            content: newMessage
          }
        ],
        aiSettings
      );
      
      setConversation(prev => [...prev, { role: 'ai' as const, content: responseText || "No response." }]);
    } catch (err: any) {
      console.error("AI chat failed:", err);
      toast.error(err.message || "Failed to get AI response. Please try again later.");
    }
  };

  const handleFetchAiQuestion = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom first.");
      return;
    }
    setIsGeneratingQuestion(true);
    try {
      const prompt = `You are an expert clinical diagnostician conducting step-by-step diagnostic narrowing.

${fullPatientClinicalContext}

PRIMARY CHIEF COMPLAINT (REASON FOR VISIT):
${chiefComplaint || 'Not specified'}

PRESENTING CLINICAL SYMPTOMS & ANALYSIS:
${selectedSymptoms.map(s => `- ${s.label} [Category: ${s.category}, Status: ${s.status}]
  Dimensional Data: ${JSON.stringify(s.analysisData || {})}`).join('\n')}

CURRENT DIFFERENTIAL DIAGNOSES UNDER CONSIDERATION:
${generatedDiagnoses.length > 0 
  ? generatedDiagnoses.map(d => `- ${d.name} (${d.likelihood || d.matchPercentage}%)`).join('\n')
  : 'None explicitly generated yet'}

PREVIOUS DIAGNOSTIC Q&A HISTORY:
${aiQuestions.length === 0 ? 'No questions asked yet.' : aiQuestions.map((q, i) => `Q${i+1}: ${q.question}\nA${i+1}: ${q.answer || 'Unanswered'}`).join('\n')}

INSTRUCTIONS:
1. Thoroughly incorporate the primary chief complaint ("${chiefComplaint || 'Not specified'}") and all patient background data (age, sex, vitals, chronic conditions, active medications, allergies, labs, surgeries, and family history) when forming the question.
2. Ask the single best, most clinically targeted follow-up question that narrows down the differential diagnosis or rules out severe/life-threatening conditions related to the chief complaint.
3. CRITICAL: Ask exactly ONE atomic question at a time. DO NOT ask compound questions (e.g., do not ask for onset AND exposures in the same question).
4. Tailor options to be concise and clinically informative.
5. If patient background data and Q&A answers are sufficient to establish a clear diagnosis, provide 'possibleFinalDiagnosis' and 'confidence' (70-100) with a detailed 'explanation'.

Return ONLY a valid JSON object matching this schema:
{
  "question": "The targeted clinical diagnostic question",
  "options": ["Option A", "Option B", "Option C", "Other"],
  "possibleFinalDiagnosis": "Optional suspected final diagnosis name or null",
  "confidence": 0 to 100 integer,
  "explanation": "Clinical reasoning integrating primary chief complaint, patient background factors, vitals, and symptoms"
}`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      const data = parseJsonResponse(responseText, null);
      if (data && data.question) {
        const newQ = {
          id: `q_${Date.now()}`,
          question: data.question,
          options: data.options || ["Yes", "No", "Unsure"]
        };
        setAiQuestions(prev => [...prev, newQ]);
        if (data.possibleFinalDiagnosis && data.confidence && data.confidence > 70) {
          setDiagnosticConclusion({
            finalDiagnosis: data.possibleFinalDiagnosis,
            confidence: data.confidence,
            explanation: data.explanation
          });
        }
      } else {
        toast.error("Could not parse AI question response.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to generate AI question.");
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleAnswerQuestion = async (qId: string, answer: string) => {
    const updatedQs = aiQuestions.map(q => q.id === qId ? { ...q, answer } : q);
    setAiQuestions(updatedQs);
    
    try {
      setIsGeneratingQuestion(true);
      const prompt = `You are an expert clinical diagnostician conducting step-by-step diagnostic narrowing.

${fullPatientClinicalContext}

PRIMARY CHIEF COMPLAINT (REASON FOR VISIT):
${chiefComplaint || 'Not specified'}

PRESENTING CLINICAL SYMPTOMS & ANALYSIS:
${selectedSymptoms.map(s => `- ${s.label} [Category: ${s.category}, Status: ${s.status}]
  Dimensional Data: ${JSON.stringify(s.analysisData || {})}`).join('\n')}

CURRENT DIFFERENTIAL DIAGNOSES UNDER CONSIDERATION:
${generatedDiagnoses.length > 0 
  ? generatedDiagnoses.map(d => `- ${d.name} (${d.likelihood || d.matchPercentage}%)`).join('\n')
  : 'None explicitly generated yet'}

COMPLETE DIAGNOSTIC Q&A HISTORY:
${updatedQs.map((q, i) => `Q${i+1}: ${q.question}\nA${i+1}: ${q.answer || 'Unanswered'}`).join('\n')}

INSTRUCTIONS:
Synthesize primary chief complaint ("${chiefComplaint || 'Not specified'}"), all patient background data, vitals, active medications, presenting symptoms, current differential diagnoses, and Q&A answers.
Determine whether a final diagnosis can be reached with sufficient confidence (>=60%), or if a follow-up narrowing question is required.
CRITICAL: If asking a follow-up question, ask exactly ONE atomic question at a time. DO NOT ask compound questions (e.g., do not ask for onset AND exposures in the same question).
Also evaluate if the patient's answer reveals any newly positive symptom that should be recorded.

Return ONLY a valid JSON object matching this schema:
{
  "nextQuestion": "Next targeted clinical narrowing question if not yet final, or null",
  "options": ["Option A", "Option B", "Option C"],
  "finalDiagnosis": "Final suspected diagnosis name if confident (>=60%), or null",
  "confidence": 0 to 100 integer,
  "explanation": "Clinical reasoning directly referencing chief complaint, patient profile, vitals, risk factors, and answers",
  "revealedSymptom": "Name of any newly revealed positive symptom if answer confirmed a new symptom, or null"
}`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      const data = parseJsonResponse(responseText, null);
      if (data) {
        if (data.finalDiagnosis && data.confidence >= 60) {
          setDiagnosticConclusion({
            finalDiagnosis: data.finalDiagnosis,
            confidence: data.confidence,
            explanation: data.explanation
          });
        }
        if (data.revealedSymptom) {
          const symName = data.revealedSymptom.trim();
          const exists = selectedSymptoms.some(s => s.label.toLowerCase() === symName.toLowerCase());
          if (!exists && symName.length > 2 && symName.toLowerCase() !== 'none' && symName.toLowerCase() !== 'no') {
            const newSymId = `revealed_${Date.now()}`;
            setSelectedSymptoms(prev => [
              ...prev,
              {
                id: newSymId,
                label: symName,
                category: selectedSymptoms[0]?.category || 'general',
                status: 'analyzed'
              }
            ]);
            toast.info(`Added newly revealed symptom "${symName}" to Selected Symptoms!`);
          }
        }
        if (data.nextQuestion && (!data.finalDiagnosis || data.confidence < 85)) {
          const newQ = {
            id: `q_${Date.now()}`,
            question: data.nextQuestion,
            options: data.options || ["Yes", "No", "Unsure"]
          };
          setAiQuestions(prev => [...prev, newQ]);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process question answer.");
    } finally {
      setIsGeneratingQuestion(false);
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
      const prompt = `Given the following patient complete context, primary chief complaint, and presenting symptoms, provide a list of possible differential diagnoses.
      
${fullPatientClinicalContext}

PRIMARY CHIEF COMPLAINT (REASON FOR VISIT):
${chiefComplaint || 'Not specified'}

Symptoms:
${selectedSymptoms.map(s => `- ${s.label}: ${JSON.stringify(s.analysisData || {})}`).join('\n')}

Return a JSON array of objects with: name, likelihood (percentage), severity, code (ICD-10), description, rationale, isRedFlag (boolean), and grounding (array of {title, url}), labs (array of {name, reason}), imaging (array of {name, reason}), and comparison (object with matches array and mismatches array).`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      const diagnoses = parseJsonResponse(responseText, []);
      // Add IDs to diagnoses
      const diagnosesWithIds = diagnoses.map((d: any, index: number) => ({ ...d, id: `diag_${index}` }));
      setGeneratedDiagnoses(diagnosesWithIds);
    } catch (error: any) {
      console.error("Error generating diagnoses:", error);
      toast.error(error.message || "Failed to generate possible causes.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateSOAPNote = async () => {
    setIsGeneratingSOAP(true);
    try {
      const prompt = `You are an AI Clinical Scribe. Generate a comprehensive, patient-aware clinical SOAP note based on the patient intake and full clinical profile:

${fullPatientClinicalContext}

CHIEF COMPLAINT:
${chiefComplaint || 'Not explicitly stated'}

PRESENTING SYMPTOMS & SEVERITY:
${selectedSymptoms.map(s => `- ${s.label} (${s.category || 'General'})`).join('\n') || 'None selected'}

INSTRUCTIONS FOR AUTO-DRAFT:
1. Subjective: Integrate Chief Complaint, History of Present Illness (HPI), Review of Systems, and relevant chronic conditions/allergies/home medications.
2. Objective: Include Vital Signs (BP, HR, RR, Temp, SpO2, Weight), physical exam findings inferred from presenting symptoms, and recorded laboratory values.
3. Assessment: Primary differential considerations, synthesis of findings linked with patient comorbidities.
4. Plan: Recommended diagnostic tests, treatment strategy aligned with active medications/allergies, lifestyle counsel, and follow-up flags.

Format as:
Subjective:
[Detailed Subjective Text]

Objective:
[Detailed Objective Text]

Assessment:
[Detailed Assessment Text]

Plan:
[Detailed Plan Text]`;
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      const generatedNote = responseText || "Failed to generate note.";
      sessionStorage.setItem('draft_soap_note', generatedNote);
      toast.success("AI Scribe auto-drafted SOAP note with patient profile context!");
      navigate('/soap-editor');
    } catch (err: any) {
      console.error("SOAP generation failed:", err);
      toast.error(err.message || "Failed to generate SOAP note");
    } finally {
      setIsGeneratingSOAP(false);
    }
  };

  const handleFinalizeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom.");
      return;
    }

    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0];

      // Find existing draft or create new one
      const existingDraft = await db.physical_exams
        .where('patientId')
        .equals(selectedPatient.id)
        .and(exam => exam.status === 'draft')
        .first();

      const newSymptoms = selectedSymptoms.map(s => s.label);

      if (existingDraft) {
        const updatedData = {
          ...existingDraft.data,
          symptoms: newSymptoms,
          // Try to preserve vitals if they exist in the draft, 
          // or use latest vitals if they don't
          vitals: (existingDraft.data?.vitals != null ? Object.fromEntries(
            Object.entries(existingDraft.data.vitals).map(([key, value]) => [key, value === undefined ? null : value])
          ) : (latestVitals ? {
            temperature: latestVitals.temp?.toString() || '',
            bpSystolic: latestVitals.bp_systolic?.toString() || '',
            bpDiastolic: latestVitals.bp_diastolic?.toString() || '',
            pulse: latestVitals.hr?.toString() || '',
            respiratoryRate: latestVitals.rr?.toString() || '',
            oxygenSaturation: latestVitals.spo2?.toString() || '',
            weight: latestVitals.weight?.toString() || '',
            height: latestVitals.height?.toString() || '',
            bmi: latestVitals.bmi?.toString() || ''
          } : null))
        };

        await db.physical_exams.update(existingDraft.localId!, {
          data: updatedData,
          lastModified: timestamp
        });
      } else {
        const examData = {
          vitals: latestVitals ? {
            temperature: latestVitals.temp?.toString() || '',
            bpSystolic: latestVitals.bp_systolic?.toString() || '',
            bpDiastolic: latestVitals.bp_diastolic?.toString() || '',
            pulse: latestVitals.hr?.toString() || '',
            respiratoryRate: latestVitals.rr?.toString() || '',
            oxygenSaturation: latestVitals.spo2?.toString() || '',
            weight: latestVitals.weight?.toString() || '',
            height: latestVitals.height?.toString() || '',
            bmi: latestVitals.bmi?.toString() || ''
          } : null,
          symptoms: newSymptoms,
          generalFindings: { appearance: '', mentalStatus: '', notes: '', status: 'untouched', detailed: {} },
          heentFindings: { heentState: {}, pupilSize: [3], notes: '', status: 'untouched' },
          sseFindings: { fundoscopy: [], otoscopy: [], notes: '', status: 'untouched' },
          respiratoryFindings: { lungs: [], regionalFindings: {}, notes: '', status: 'untouched' },
          cardiovascularFindings: { heart: [], notes: '', status: 'untouched' },
          gastrointestinalFindings: { abdomen: [], notes: '', status: 'untouched' },
          musculoskeletalFindings: { jointExams: [], notes: '', status: 'untouched' },
          neurologicalFindings: { notes: '', status: 'untouched' },
          skinFindings: { lesions: [], notes: '', status: 'untouched' },
          psychiatricFindings: { notes: '', status: 'untouched' },
          geriatricFindings: { notes: '', status: 'untouched' }
        };

        await db.physical_exams.add({
          id: crypto.randomUUID(),
          patientId: selectedPatient.id,
          data: examData,
          status: 'draft',
          date: date,
          lastModified: timestamp,
          isDeleted: 0,
          isSynced: 0
        });
      }

      toast.success("Symptoms saved to patient record.");
      navigate('/final-diagnosis');
    } catch (error) {
      console.error("Failed to save symptoms:", error);
      toast.error("Failed to persist symptom data.");
      // Navigate anyway as we have context
      navigate('/final-diagnosis');
    }
  };

  const activeCategoryData = selectedCategory ? ALL_MODELS[selectedCategory] : [];
  const activeCategoryName = categories.find(c => c.id === selectedCategory)?.name || '';
  const filteredSymptoms = selectedSymptoms.filter(s => filterCategory === 'all' || s.category === filterCategory);

  const handleExportFHIR = () => {
    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }
    try {
      const bundle = generateFhirBundle(
        selectedPatient,
        selectedSymptoms,
        generatedDiagnoses
      );
      
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fhir_bundle_${selectedPatient.id || 'patient'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("FHIR R4 Bundle Exported Successfully");
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to generate FHIR Bundle");
    }
  };

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
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateSOAPNote}
            disabled={isGeneratingSOAP || !selectedPatient}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
            {isGeneratingSOAP ? "Auto-Drafting..." : "AI Scribe Auto-Draft"}
          </button>
          <button 
            onClick={handleExportFHIR}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            disabled={!selectedPatient || selectedSymptoms.length === 0}
          >
            <Download className="w-4 h-4" />
            Export to FHIR R4
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
            onClick={handleFinalizeSymptoms}
            disabled={selectedSymptoms.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalize
          </button>
        </div>
      </div>

      {/* EMERGENCY RED FLAG PROTOCOL BANNER */}
      {triageLevel === 'high' && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl shadow-xs space-y-2 text-red-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
              <span className="font-extrabold text-sm text-red-900 tracking-wide uppercase">
                EMERGENCY RED FLAG PROTOCOL ACTIVATED
              </span>
            </div>
            <span className="px-2.5 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
              STAT CLINICAL ACTION REQUIRED
            </span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            One or more high-risk red flags identified ({selectedSymptoms.filter(s => s.status === 'red_flag').map(s => s.label).join(', ') || "High risk presentation"}). Immediate emergency clinical evaluation recommended.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 bg-white border border-red-200 rounded text-[11px] font-bold text-red-800">
              ⚡ 12-Lead ECG / Continuous Vitals
            </span>
            <span className="px-2.5 py-1 bg-white border border-red-200 rounded text-[11px] font-bold text-red-800">
              🧪 STAT Troponin / CBC / Metabolic Panel
            </span>
            <span className="px-2.5 py-1 bg-white border border-red-200 rounded text-[11px] font-bold text-red-800">
              🚨 Immediate Attending / Senior Consult
            </span>
          </div>
        </div>
      )}

      {/* CHIEF COMPLAINT SEARCH BAR SECTION */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Chief Complaint Search & Selection</h3>
              <p className="text-[11px] text-slate-500">Search presenting complaints, filter common conditions, or type custom symptoms</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
            Primary Clinical Search
          </span>
        </div>

        <div className="space-y-2 relative">
          {/* Main Search Bar */}
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Search className="w-4 h-4 text-indigo-500" />
            </div>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => {
                setChiefComplaint(e.target.value);
                setCcSearchOpen(true);
              }}
              onFocus={() => setCcSearchOpen(true)}
              onBlur={() => setTimeout(() => setCcSearchOpen(false), 200)}
              placeholder="Search or enter Chief Complaint (e.g. Chest Pain, Headache, Dyspnea...)..."
              className="w-full text-sm font-medium bg-slate-50/90 border border-slate-200 rounded-xl pl-10 pr-24 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition-all shadow-xs"
            />
            
            <div className="absolute right-2 flex items-center gap-1">
              {chiefComplaint && (
                <button
                  type="button"
                  onClick={() => setChiefComplaint('')}
                  className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-xs">
                Active
              </span>
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {ccSearchOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {/* Symptoms across all categories header */}
              <div className="p-2 bg-indigo-50/90 text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center justify-between sticky top-0 backdrop-blur-xs z-10 border-b border-indigo-100">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  All System Symptoms ({chiefComplaintSearchResults.symptoms.length})
                </span>
                <span className="text-[9px] font-normal text-indigo-600">Sets Chief Complaint & Adds to Active List</span>
              </div>

              {chiefComplaintSearchResults.symptoms.length > 0 ? (
                chiefComplaintSearchResults.symptoms.map((symptom) => {
                  const catName = categoryNameMap[symptom.categoryId] || symptom.categoryId;
                  const isAlreadyAdded = selectedSymptoms.some(s => s.id === symptom.id);
                  return (
                    <button
                      key={symptom.id + '_' + symptom.categoryId}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSymptomFromSearch(symptom);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 hover:bg-indigo-50/90 hover:text-indigo-900 transition-colors flex items-center justify-between font-medium cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-slate-100 group-hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-900">{symptom.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Category: {catName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-semibold group-hover:bg-indigo-100 group-hover:text-indigo-700">
                          {catName}
                        </span>
                        {isAlreadyAdded ? (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold rounded">
                            Added
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded shadow-2xs">
                            + Select
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No direct symptom matches found for "{chiefComplaint}". You can still use your typed query as the Chief Complaint.
                </div>
              )}

              {/* Common Chief Complaints Section */}
              {chiefComplaintSearchResults.complaints.length > 0 && (
                <>
                  <div className="p-2 bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 border-t border-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Common Clinical Complaints & Syndromes
                  </div>
                  {chiefComplaintSearchResults.complaints.map((ccOption, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setChiefComplaint(ccOption);
                        setCcSearchOpen(false);
                        toast.success(`Selected Chief Complaint: "${ccOption}"`);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        {ccOption}
                      </span>
                      <span className="text-[10px] text-indigo-600 font-semibold">Select Complaint</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Quick Select Search Chips below */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Frequent Searches:
            </span>
            {[
              "Chest Pain",
              "Severe Headache",
              "Dyspnea & Cough",
              "RLQ Abdominal Pain",
              "Dizziness & Vertigo",
              "High Fever & Fatigue",
              "Facial Droop"
            ].map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const matched = COMMON_CHIEF_COMPLAINTS.find(c => c.toLowerCase().includes(tag.toLowerCase())) || tag;
                  setChiefComplaint(matched);
                  toast.info(`Set Chief Complaint: "${matched}"`);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-md text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK CLINICAL SYMPTOM CLUSTER PRESETS */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Quick Triage Symptom Clusters (1-Click Load)
          </span>
          <span className="text-[11px] text-slate-500">Rapid Chief Complaint Presets</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_CLINICAL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setChiefComplaint(preset.title);
                // Merge preset symptoms without duplicates
                setSelectedSymptoms(prev => {
                  const existingIds = new Set(prev.map(s => s.id));
                  const newSymptoms = preset.symptoms.filter(s => !existingIds.has(s.id));
                  return [...prev, ...newSymptoms];
                });
                toast.success(`Loaded "${preset.title}" Symptom Cluster & Chief Complaint!`);
              }}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Select Symptom Category</h3>
                <p className="text-xs text-slate-500">
                  {categories.length} organ system categories active for {patientData.age}yo {patientData.gender}
                </p>
              </div>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={symptomSearchQuery}
                  onChange={(e) => setSymptomSearchQuery(e.target.value)}
                  placeholder="Search symptoms across all categories (e.g., headache, chest pain, rash)..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {symptomSearchQuery && (
                  <button 
                    onClick={() => setSymptomSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ORGAN SYSTEM DOMAIN FILTER TABS */}
            {!symptomSearchQuery.trim() && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SYSTEM_DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => setSelectedDomain(domain.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1",
                      selectedDomain === domain.id
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                    )}
                  >
                    <span>{domain.label}</span>
                  </button>
                ))}
              </div>
            )}

            {symptomSearchQuery.trim() ? (
              <div className="flex-1 overflow-y-auto max-h-[400px]">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                    {searchResults.map(symptom => {
                      const isSelected = selectedSymptoms.some(s => s.id === symptom.id);
                      const catName = ALL_CATEGORIES.find(c => c.id === symptom.categoryId)?.name || symptom.categoryId;
                      return (
                        <div 
                          key={symptom.id}
                          onClick={() => toggleSymptom(symptom as any, symptom.categoryId)}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all flex flex-col gap-1 group",
                            isSelected 
                              ? "border-indigo-500 bg-indigo-50" 
                              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <span className={cn(
                              "font-medium text-sm",
                              isSelected ? "text-indigo-700" : "text-slate-700"
                            )}>
                              {symptom.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                          </div>
                          <span className="text-[10px] text-slate-500 group-hover:text-indigo-500 transition-colors">
                            Category: {catName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">No symptoms found matching "{symptomSearchQuery}"</p>
                    <button 
                      onClick={() => setSymptomSearchQuery("")}
                      className="mt-2 text-sm text-indigo-600 font-medium hover:underline"
                    >
                      Browse all categories
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2">
                {categories.map(cat => {
                  const selectionCount = categoriesWithSelection[cat.id] || 0;
                  const redFlagCount = categoryRedFlagCounts[cat.id] || 0;
                  const totalSymptoms = categorySymptomCounts[cat.id] || 0;
                  const isSelectedCat = selectedCategory === cat.id;

                  return (
                    <div 
                      key={cat.id} 
                      onClick={() => handleCategoryClick(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all text-center group relative",
                        isSelectedCat 
                          ? "border-indigo-500 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-300" 
                          : selectionCount > 0 
                            ? "border-emerald-300 bg-emerald-50/40 hover:border-indigo-400" 
                            : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50"
                      )}
                    >
                      {selectionCount > 0 && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-bold shadow-2xs">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{selectionCount} Selected</span>
                        </div>
                      )}

                      {redFlagCount > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full text-[9px] font-extrabold animate-pulse shadow-2xs">
                          <ShieldAlert className="w-2.5 h-2.5 text-red-600" />
                          <span>{redFlagCount} RED FLAG</span>
                        </div>
                      )}

                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors mt-2",
                        isSelectedCat ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 group-hover:bg-indigo-100 text-slate-600 group-hover:text-indigo-600"
                      )}>
                        <cat.icon className="w-6 h-6 transition-colors" />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold transition-colors leading-snug",
                        isSelectedCat ? "text-indigo-800" : "text-slate-800 group-hover:text-indigo-700"
                      )}>
                        {cat.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 font-medium">
                        {totalSymptoms} symptoms
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        <ClinicalGuardrails activePathways={activePathways} state={{
          selectedSymptoms,
          patient: patientData,
          vitals: {
            heartRate: latestVitals?.hr || 72,
            bpSys: latestVitals?.bp_systolic || 120,
            bpDia: latestVitals?.bp_diastolic || 80,
            temp: latestVitals?.temp || 36.8,
            oxygenSat: latestVitals?.spo2 || 98,
            respRate: latestVitals?.rr || 16,
            oxygenType: latestVitals?.oxygenType || 'room_air'
          }
        }} />
        <PertinentNegativesPanel
          activePositiveSymptoms={selectedSymptoms}
          activePertinentNegatives={activePertinentNegatives}
          onToggleNegative={handleTogglePertinentNegative}
          onClearAll={() => setActivePertinentNegatives([])}
        />
        <DifferentialDiagnosisGrid symptoms={selectedSymptoms} pertinentNegatives={activePertinentNegatives} />
      </div>

      <div className="space-y-6">
        <ClinicalScoresWidget 
          symptoms={selectedSymptoms} 
          patientHistory={patientData} 
          vitals={{
            heartRate: latestVitals?.hr || 72,
            bpSys: latestVitals?.bp_systolic || 120,
            bpDia: latestVitals?.bp_diastolic || 80,
            temp: latestVitals?.temp || 36.8,
            oxygenSat: latestVitals?.spo2 || 98,
            respRate: latestVitals?.rr || 16,
            oxygenType: latestVitals?.oxygenType || 'room_air'
          }}
        />

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
                        "p-3 border-t text-sm space-y-3",
                        isRedFlag ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-slate-50/50"
                      )}>
                        {/* Enterprise EMR Metadata Header */}
                        <div className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-center justify-between font-mono text-[11px] border-b border-slate-800 pb-1">
                            <span className="text-indigo-400 font-semibold flex items-center gap-1">
                              <Database className="w-3 h-3" /> EMR Record ID: {(symptom as any).symptom_id || `SYM_${symptom.id.toUpperCase()}`}
                            </span>
                            <span className="text-slate-400">Category: {symptom.category.toUpperCase()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                              <span className="text-slate-400 block text-[9px]">SNOMED CT Code</span>
                              <span className="text-emerald-400 font-bold">{(symptom as any).snomed_code || '386661006'}</span>
                            </div>
                            <div className="bg-slate-800/80 p-1.5 rounded border border-slate-700/50">
                              <span className="text-slate-400 block text-[9px]">ICD-10 Mapping</span>
                              <span className="text-sky-400 font-bold">{(symptom as any).icd_mapping || 'R50.9'}</span>
                            </div>
                          </div>
                          {(symptom as any).synonyms && (symptom as any).synonyms.length > 0 && (
                            <div className="text-[10px] text-slate-300">
                              <span className="text-slate-400">Synonyms: </span>
                              {(symptom as any).synonyms.join(', ')}
                            </div>
                          )}
                          <div className="mt-1 pt-1 border-t border-slate-800">
                            <span className="text-[9px] text-slate-400 block mb-1">Structured EMR JSON Payload:</span>
                            <pre className="text-[9.5px] font-mono text-indigo-300 bg-slate-950 p-2 rounded overflow-x-auto">
                              {JSON.stringify({
                                symptom: symptom.label,
                                symptom_id: (symptom as any).symptom_id || `SYM_${symptom.id}`,
                                snomed_code: (symptom as any).snomed_code || '386661006',
                                icd_mapping: (symptom as any).icd_mapping || 'R50.9',
                                attributes: (symptom as any).attributes || {
                                  severity: "Moderate",
                                  duration: "1-3 days",
                                  onset: "Gradual"
                                }
                              }, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {!symptom.analysisData || Object.keys(symptom.analysisData).length === 0 ? (
                          <p className="text-slate-500 italic text-xs">No qualitative analysis data yet. Click the AI Analyze or Edit button.</p>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries((symptom.analysisData || {}) as Record<string, string[]>).map(([key, values]) => {
                              if (key === 'redFlags' && (values || []).length > 0) {
                                return (
                                  <div key={key} className="flex flex-col gap-1 mt-3">
                                    <span className="text-xs font-semibold text-red-700 uppercase flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3" /> Red Flags Identified
                                    </span>
                                    <ul className="list-disc list-inside pl-1 text-red-600 text-xs space-y-0.5">
                                      {(values || []).map(v => <li key={v}>{v}</li>)}
                                    </ul>
                                  </div>
                                );
                              }
                              if ((values || []).length > 0 && key !== 'redFlags') {
                                return (
                                  <div key={key} className="flex items-start gap-2">
                                    <span className="text-slate-500 capitalize text-xs font-medium w-20 flex-shrink-0">{key.replace(/_/g, ' ')}:</span>
                                    <span className="text-slate-700 text-xs">{(values || []).join(', ')}</span>
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
                                  {(symptom.severityTimeline || []).map((point, i) => (
                                    <div 
                                      key={i} 
                                      className="flex-1 bg-indigo-100 rounded-t-sm relative group"
                                      style={{ height: `${(point.value || 0) * 10}%` }}
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

        {/* AI Q Section: Step-by-Step Diagnostic Narrowing */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI Q: Diagnostic Narrowing
            </h3>
            <button 
              onClick={handleFetchAiQuestion}
              disabled={isGeneratingQuestion || selectedSymptoms.length === 0 || aiQuestions.some(q => !q.answer)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGeneratingQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {aiQuestions.length === 0 ? "Start Diagnostic Q&A" : "Next AI Question"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Step-by-step clinical questions generated by AI to narrow down differential diagnoses and reach a final diagnosis.
          </p>

          {/* Patient Context Active Indicator */}
          <div className="mb-4 p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between text-xs text-indigo-950 gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                <strong className="font-semibold text-indigo-900">Chief Complaint Focus:</strong> <span className="font-bold text-indigo-700 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-200">{chiefComplaint || 'Not specified'}</span> • {selectedPatient?.name || 'Patient'} ({selectedPatient?.age || 32}yo {selectedPatient?.gender || 'female'}) • {latestVitals?.bp_systolic ? `BP ${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` : 'Vitals On File'}
              </span>
            </div>
            <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded font-medium shrink-0 self-start sm:self-auto">Chief Complaint & Profile Aware</span>
          </div>

          {diagnosticConclusion && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Suspected Final Diagnosis: {diagnosticConclusion.finalDiagnosis} ({diagnosticConclusion.confidence}% Confidence)
              </div>
              <p className="text-xs text-emerald-700">{diagnosticConclusion.explanation}</p>
            </div>
          )}

          {aiQuestions.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
              <p className="text-xs text-slate-500">No questions asked yet. Click "Start Diagnostic Q&A" to begin narrowing differential diagnoses.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {aiQuestions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <div className="font-medium text-slate-800 mb-2 flex items-start gap-2">
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded font-bold">Q{idx+1}</span>
                    <span>{q.question}</span>
                  </div>
                  {q.answer ? (
                    <div className="text-xs text-indigo-900 font-medium bg-indigo-50/80 px-2 py-1 rounded border border-indigo-100 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Answered: {q.answer}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswerQuestion(q.id, opt)}
                          disabled={isGeneratingQuestion}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-700 text-xs rounded-md transition-colors shadow-sm disabled:opacity-50"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
                              const newDiag: Diagnosis = {
                                id: `learned_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                                name: diag.name,
                                system: 'Infectious',
                                severity: (diag.severity as any) || 'Moderate',
                                description: diag.description,
                                commonSymptoms: selectedSymptoms.map(s => s.id),
                                category: 'AI Learned',
                                redFlags: diag.isRedFlag ? [diag.name] : [],
                                icd10: diag.code || 'R69',
                                prevalenceScore: 7,
                                triagePriority: 3,
                                diagnosticTests: (diag.labs || []).map((l: any) => l.name),
                                firstLineTreatments: (diag.treatments || []).map((t: any) => t.name),
                                chronicity: 'Acute'
                              };
                              saveCustomDiagnosis(newDiag);
                              toast.success(`Successfully added "${diag.name}" to Visual Differential Diagnosis database! AI has learned this diagnosis.`);
                            }}
                            className="text-xs font-semibold text-indigo-600 bg-white border border-indigo-200 px-3 py-1 rounded-md hover:bg-indigo-50 flex items-center gap-1"
                            title="Add to Visual Differential Diagnosis Database (Teach AI)"
                          >
                            <Database className="w-3 h-3" /> Add to DB
                          </button>
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

    </div>
  );
}

const GLOBAL_DIMENSIONS = {
  onset: ["Sudden", "Gradual", "Intermittent", "At night", "Upon waking"],
  duration: ["< 24 hours", "1-3 days", "4-7 days", "1-2 weeks", "Chronic (> 1 month)"]
};

function AnalysisModal({ symptom, onClose, onSave }: { symptom: SelectedSymptom, onClose: () => void, onSave: (data: any, timeline?: any) => void }) {
  const { settings: aiSettings } = useAISettings();
  const model = ALL_MODELS[symptom.category]?.find(m => m.id === symptom.id);
  
  const combinedDimensions = useMemo(() => {
    if (!model) return {};
    const dims = { ...model.dimensions };
    if (!dims.onset) dims.onset = GLOBAL_DIMENSIONS.onset;
    if (!dims.duration) dims.duration = GLOBAL_DIMENSIONS.duration;
    return dims;
  }, [model]);

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
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: `Generate 3 clinical follow-up questions for a patient presenting with ${model!.label}. Focus on ruling out differential diagnoses. Return ONLY the questions as a JSON array of strings.` }],
        aiSettings
      );
      
      setFollowUpQuestions(parseJsonResponse(responseText, []));
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

          {Object.keys(combinedDimensions).length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Key Questions
              </h4>
              <div className="space-y-5">
                {Object.entries(combinedDimensions).map(([dim, values]) => (
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
