import { ClinicalIntelligenceService, TherapeuticGapAlert, IndicationAlert } from "@/services/clinical.intelligence.service";
import { InteractionResult } from "@/services/ddiService";
import { checkSafetyAlerts, SafetyAlert } from "@/services/safetyService";
import { PrescriptionService } from "@/services/prescription.service";
import { MedicationReconciliation } from "@/components/MedicationReconciliation";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FileText, Layout, Cpu, History, Eye, CheckCircle, 
  Search, ShoppingCart, Trash2, AlertCircle, X, PlusCircle,
  Hash, Clock, Calendar, Info, Sparkles, Loader2, RefreshCw,
  Activity, Printer, AlertTriangle, ShieldCheck, Calculator,
  Shuffle, BrainCircuit, Zap, ArrowRight, Plus
} from "lucide-react";
import { WeightCalculatorModal } from "@/components/prescriptions/WeightCalculatorModal";
import { DosageFormBadge } from "@/components/prescriptions/DosageFormBadge";
import { FavoritesQuickBar } from "@/components/prescriptions/FavoritesQuickBar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { medicationsDatabase, enrichDrug, deriveMedicationDefaults } from "@/data/medications";
import { prescriptionTemplates } from "@/data/templates";
import { PrescriptionPreview } from "@/components/PrescriptionPreview";
import { usePatient } from "@/lib/PatientContext";
import { useSettings } from "@/lib/SettingsContext";
import { useAISettings } from '../lib/AISettingsContext';
import { clinicalAIRequest } from '@/services/aiWorkflowService';
import { getGeneratePrescriptionPrompt, getAlternativeMedicationPrompt, getMedicationInstructionsPrompt, getPrescriptionNotesPrompt } from "@/services/aiConfig";
import { parseJsonResponse } from "../utils/gemini";
import { toast } from "sonner";
import { medicationService, Drug } from "@/services/medicationService";
import { PatientHistoryService } from "@/services/PatientHistoryService";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

// Flatten medications for "All" category
const allMedications = Object.values(medicationsDatabase).flat().map(m => enrichDrug(m));

export function formatPositiveFindings(data: any): string {
  if (!data) return "";
  
  const findings: string[] = [];
  
  // Helper to parse arrays/objects
  const parseValue = (val: any): string => {
    if (val === null || val === undefined || val === '') return '';
    if (Array.isArray(val)) {
      const filtered = val.filter(v => v && !['normal', 'wnl', 'none', 'clear', 'appropriate', 'euthymic', 'linear', 'good'].includes(String(v).toLowerCase().trim()));
      return filtered.join(', ');
    }
    if (typeof val === 'object') {
      return Object.entries(val)
        .filter(([_, v]) => v === true || (typeof v === 'object' && (v as any).value))
        .map(([k, v]) => {
          if (typeof v === 'object') {
            const innerVal = (v as any).value;
            if (innerVal && !['normal', 'wnl', 'none', 'clear', 'appropriate', 'euthymic', 'linear', 'good'].includes(String(innerVal).toLowerCase().trim())) {
              return `${k}: ${innerVal}`;
            }
            return '';
          }
          return k;
        })
        .filter(Boolean)
        .join(', ');
    }
    const valStr = String(val);
    if (['normal', 'wnl', 'none', 'clear', 'appropriate', 'euthymic', 'linear', 'good'].includes(valStr.toLowerCase().trim())) return '';
    return valStr;
  };

  // 1. Symptoms if any
  if (data.symptoms && Array.isArray(data.symptoms) && data.symptoms.length > 0) {
    findings.push(`Symptoms: ${data.symptoms.join(', ')}`);
  }

  // 2. General Findings
  if (data.generalFindings) {
    const gf = data.generalFindings;
    const general = [];
    if (gf.appearance && !['normal', 'wnl', 'well', 'no acute distress', 'nad'].includes(String(gf.appearance).toLowerCase().trim())) {
      general.push(`Appearance: ${gf.appearance}`);
    }
    if (gf.mentalStatus && !['normal', 'wnl', 'alert', 'alert & oriented'].includes(String(gf.mentalStatus).toLowerCase().trim())) {
      general.push(`Mental Status: ${gf.mentalStatus}`);
    }
    if (gf.detailed) {
      Object.entries(gf.detailed).forEach(([key, val]) => {
        const parsed = parseValue(val);
        if (parsed) general.push(`${key}: ${parsed}`);
      });
    }
    if (gf.notes) general.push(gf.notes);
    if (general.length > 0) {
      findings.push(`General: ${general.join('; ')}`);
    }
  }

  // 3. HEENT
  if (data.heentFindings) {
    const hf = data.heentFindings;
    const heent: string[] = [];
    if (hf.heentState) {
      Object.entries(hf.heentState).forEach(([part, stateVal]: [string, any]) => {
        if (stateVal?.status === 'abnormal' && stateVal.findings) {
          const partFindings = Object.entries(stateVal.findings)
            .filter(([_, fData]: [string, any]) => fData?.present)
            .map(([fKey, fData]: [string, any]) => {
              return fData.description ? `${fKey} (${fData.description})` : fKey;
            });
          if (partFindings.length > 0) {
            heent.push(`${part}: ${partFindings.join(', ')}`);
          }
        }
      });
    }
    if (hf.notes) heent.push(hf.notes);
    if (heent.length > 0) findings.push(`HEENT: ${heent.join('; ')}`);
  }

  // 4. Special Senses (SSE)
  if (data.sseFindings) {
    const sse = data.sseFindings;
    const sseList = [];
    if (sse.fundoscopy && sse.fundoscopy.length > 0) {
      const parsed = parseValue(sse.fundoscopy);
      if (parsed) sseList.push(`Fundoscopy: ${parsed}`);
    }
    if (sse.otoscopy && sse.otoscopy.length > 0) {
      const parsed = parseValue(sse.otoscopy);
      if (parsed) sseList.push(`Otoscopy: ${parsed}`);
    }
    if (sse.weber && !['midline', 'normal'].includes(String(sse.weber).toLowerCase().trim())) {
      sseList.push(`Weber: ${sse.weber}`);
    }
    if (sse.rinneR && !['positive', 'normal'].includes(String(sse.rinneR).toLowerCase().trim())) {
      sseList.push(`Rinne Right: ${sse.rinneR}`);
    }
    if (sse.rinneL && !['positive', 'normal'].includes(String(sse.rinneL).toLowerCase().trim())) {
      sseList.push(`Rinne Left: ${sse.rinneL}`);
    }
    if (sse.notes) sseList.push(sse.notes);
    if (sseList.length > 0) findings.push(`SSE: ${sseList.join('; ')}`);
  }

  // 5. Respiratory
  if (data.respiratoryFindings) {
    const rf = data.respiratoryFindings;
    const resp = [];
    if (rf.lungs && rf.lungs.length > 0) {
      const parsed = parseValue(rf.lungs);
      if (parsed) resp.push(`Lungs: ${parsed}`);
    }
    if (rf.regionalFindings) {
      Object.entries(rf.regionalFindings).forEach(([region, vals]: [string, any]) => {
        const regionFindings = [];
        const insp = parseValue(vals.inspection);
        const palp = parseValue(vals.palpationPercussion);
        const aus = parseValue(vals.auscultation);
        
        if (insp) regionFindings.push(`Insp: ${insp}`);
        if (palp) regionFindings.push(`Palp/Perc: ${palp}`);
        if (aus) regionFindings.push(`Aus: ${aus}`);
        if (vals.description) regionFindings.push(vals.description);
        
        if (regionFindings.length > 0) resp.push(`${region}: [${regionFindings.join(' | ')}]`);
      });
    }
    if (rf.notes) resp.push(rf.notes);
    if (resp.length > 0) findings.push(`Respiratory: ${resp.join('; ')}`);
  }

  // 6. Cardiovascular
  if (data.cardiovascularFindings) {
    const cf = data.cardiovascularFindings;
    const cv = [];
    if (cf.heart && cf.heart.length > 0) {
      const parsed = parseValue(cf.heart);
      if (parsed) cv.push(`Heart: ${parsed}`);
    }
    if (cf.pulses && !['normal', 'wnl'].includes(String(cf.pulses).toLowerCase().trim())) {
      cv.push(`Pulses: ${cf.pulses}`);
    }
    if (cf.notes) cv.push(cf.notes);
    if (cv.length > 0) findings.push(`Cardiovascular: ${cv.join('; ')}`);
  }

  // 7. Gastrointestinal
  if (data.gastrointestinalFindings) {
    const gif = data.gastrointestinalFindings;
    const gi = [];
    if (gif.abdomen && gif.abdomen.length > 0) {
      const parsed = parseValue(gif.abdomen);
      if (parsed) gi.push(`Abdomen: ${parsed}`);
    }
    if (gif.notes) gi.push(gif.notes);
    if (gi.length > 0) findings.push(`Gastrointestinal: ${gi.join('; ')}`);
  }

  // 8. Musculoskeletal
  if (data.musculoskeletalFindings) {
    const mf = data.musculoskeletalFindings;
    const msk = [];
    if (mf.galsScreen === 'abnormal') msk.push('abnormal GALS screen');
    if (mf.gaitPosture && mf.gaitPosture.length > 0) {
      const parsed = parseValue(mf.gaitPosture);
      if (parsed) msk.push(`Gait/Posture: ${parsed}`);
    }
    if (mf.mrcUpper && parseInt(mf.mrcUpper) < 5) msk.push(`Upper Power: ${mf.mrcUpper}/5`);
    if (mf.mrcLower && parseInt(mf.mrcLower) < 5) msk.push(`Lower Power: ${mf.mrcLower}/5`);
    if (mf.jointExams && mf.jointExams.length > 0) {
      const nonNormalJoints = mf.jointExams
        .filter((j: any) => j && (j.rom === 'abnormal' || j.stability === 'abnormal'))
        .map((j: any) => `${j.joint} (${j.rom === 'abnormal' ? 'restricted ROM' : ''}${j.rom === 'abnormal' && j.stability === 'abnormal' ? ', ' : ''}${j.stability === 'abnormal' ? 'unstable' : ''})`);
      if (nonNormalJoints.length > 0) msk.push(`Joints: ${nonNormalJoints.join(', ')}`);
    }
    if (mf.notes) msk.push(mf.notes);
    if (msk.length > 0) findings.push(`Musculoskeletal: ${msk.join('; ')}`);
  }

  // 9. Neurological
  if (data.neurologicalFindings) {
    const nf = data.neurologicalFindings;
    const neuro = [];
    if (nf.mental && nf.mental.length > 0) {
      const parsed = parseValue(nf.mental);
      if (parsed) neuro.push(`Mental status: ${parsed}`);
    }
    if (nf.motorBulk && !['normal', 'wnl'].includes(String(nf.motorBulk).toLowerCase().trim())) {
      neuro.push(`Bulk: ${nf.motorBulk}`);
    }
    if (nf.motorTone && !['normal', 'wnl'].includes(String(nf.motorTone).toLowerCase().trim())) {
      neuro.push(`Tone: ${nf.motorTone}`);
    }
    if (nf.plantarResponse && !['normal', 'wnl', 'flexor'].includes(String(nf.plantarResponse).toLowerCase().trim())) {
      neuro.push(`Plantar: ${nf.plantarResponse}`);
    }
    if (nf.clonus && !['normal', 'wnl', 'absent'].includes(String(nf.clonus).toLowerCase().trim())) {
      neuro.push(`Clonus: ${nf.clonus}`);
    }
    if (nf.notes) neuro.push(nf.notes);
    if (neuro.length > 0) findings.push(`Neurological: ${neuro.join('; ')}`);
  }

  // 10. Skin
  if (data.skinFindings) {
    const sf = data.skinFindings;
    const skin = [];
    if (sf.color && !['normal', 'wnl', 'healthy'].includes(String(sf.color).toLowerCase().trim())) {
      skin.push(`Color: ${sf.color}`);
    }
    if (sf.temp && !['normal', 'wnl', 'warm'].includes(String(sf.temp).toLowerCase().trim())) {
      skin.push(`Temp: ${sf.temp}`);
    }
    if (sf.lesions && sf.lesions.length > 0) {
      const parsed = parseValue(sf.lesions);
      if (parsed) skin.push(`Lesions: ${parsed}`);
    }
    if (sf.notes) skin.push(sf.notes);
    if (skin.length > 0) findings.push(`Skin: ${skin.join('; ')}`);
  }

  // 11. Psychiatric
  if (data.psychiatricFindings) {
    const pf = data.psychiatricFindings;
    const psych = [];
    if (pf.mood && !['euthymic', 'normal', 'wnl'].includes(String(pf.mood).toLowerCase().trim())) {
      psych.push(`Mood: ${pf.mood}`);
    }
    if (pf.affect && !['appropriate', 'normal', 'wnl'].includes(String(pf.affect).toLowerCase().trim())) {
      psych.push(`Affect: ${pf.affect}`);
    }
    if (pf.thoughtProcess && !['linear', 'normal', 'wnl'].includes(String(pf.thoughtProcess).toLowerCase().trim())) {
      psych.push(`Thought process: ${pf.thoughtProcess}`);
    }
    if (pf.insight && !['good', 'normal', 'wnl'].includes(String(pf.insight).toLowerCase().trim())) {
      psych.push(`Insight: ${pf.insight}`);
    }
    if (pf.judgment && !['good', 'normal', 'wnl'].includes(String(pf.judgment).toLowerCase().trim())) {
      psych.push(`Judgment: ${pf.judgment}`);
    }
    if (pf.notes) psych.push(pf.notes);
    if (psych.length > 0) findings.push(`Psychiatric: ${psych.join('; ')}`);
  }

  // 12. Geriatric
  if (data.geriatricFindings) {
    const gef = data.geriatricFindings;
    const geri = [];
    if (gef.frailty && !['robust', 'normal', 'wnl'].includes(String(gef.frailty).toLowerCase().trim())) {
      geri.push(`Frailty: ${gef.frailty}`);
    }
    if (gef.gait && !['normal', 'wnl'].includes(String(gef.gait).toLowerCase().trim())) {
      geri.push(`Gait: ${gef.gait}`);
    }
    if (gef.notes) geri.push(gef.notes);
    if (geri.length > 0) findings.push(`Geriatric: ${geri.join('; ')}`);
  }

  return findings.length > 0 ? findings.join(' | ') : 'No positive/abnormal findings.';
}

function parseClinicalNotes(notes: string) {
  const labs: string[] = [];
  const followUp: string[] = [];

  if (!notes) return { labs, followUp };

  const lines = notes.split('\n');
  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const cleanLine = trimmed.replace(/\*/g, '').trim();

    // Check if it's a list item starting with a digit like "1." or "1-" or "1) " or a bullet like "-", "•", "*"
    if (/^\d+\s*[.)-]?\s*/.test(cleanLine) || /^[-•*]/.test(cleanLine)) {
      const content = cleanLine.replace(/^\d+\s*[.)-]?\s*/, '').replace(/^[-•*]\s*/, '').trim();
      if (content) {
        labs.push(content);
      }
    } else {
      // If it doesn't start with a digit/bullet but is non-empty, include it as a lab line unless it looks like general instruction/header
      if (cleanLine.length > 3 && !cleanLine.toLowerCase().includes("rules:") && !cleanLine.toLowerCase().includes("format:")) {
        labs.push(cleanLine);
      }
    }
  }

  return { labs, followUp };
}


export function Prescriptions() {
  const { settings: aiSettings } = useAISettings();
  const { selectedPatient, confirmedDiagnosis, setConfirmedDiagnosis } = usePatient();
  const { customPrescriptionTemplates } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [nameType, setNameType] = useState<'generic' | 'trade'>('generic');
  
  const [promptModal, setPromptModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, title: '', message: '', defaultValue: '', onConfirm: () => {} });
  const [promptValue, setPromptValue] = useState("");

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  
  // State for new prescription being built
  const [currentPrescription, setCurrentPrescription] = useState<any[]>([]);
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [auditedLabSuggestions, setAuditedLabSuggestions] = useState<string[] | undefined>(undefined);
  const [refills, setRefills] = useState("0");
  const [vitals, setVitals] = useState({
    bp: "",
    p: "",
    temp: "",
    rr: "",
    sao2: "",
    rbs: "",
    oe: "",
    co: "",
    ph: "",
    weight: ""
  });
  const [interactionAlerts, setInteractionAlerts] = useState<InteractionResult[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [gapAlerts, setGapAlerts] = useState<TherapeuticGapAlert[]>([]);
  const [indicationAlerts, setIndicationAlerts] = useState<IndicationAlert[]>([]);
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [labs, setLabs] = useState<any[]>([]);
  
  const allTemplates = useMemo(() => {
    return { ...prescriptionTemplates, ...customPrescriptionTemplates };
  }, [customPrescriptionTemplates]);
  
  // State for user-created templates
  const [userTemplates, setUserTemplates] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('userTemplates');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to load templates", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('userTemplates', JSON.stringify(userTemplates));
  }, [userTemplates]);

  // Automatically populate vitals when a patient is selected
  useEffect(() => {
    const fetchLatestVitals = async () => {
      if (!selectedPatient?.id) return;
      
      try {
        // Fetch latest vitals from DB
        const latestVitals = await db.vitals
          .where('patientId')
          .equals(selectedPatient.id)
          .reverse()
          .first();

        // Fetch latest physical exam to retrieve RBS and positive findings (O/E)
        const latestExam = await db.physical_exams
          .where('patientId')
          .equals(selectedPatient.id)
          .reverse()
          .first();

        let bpVal = "";
        let pVal = "";
        let tempVal = "";
        let rrVal = "";
        let sao2Val = "";
        let weightVal = "";
        let coVal = "";
        let rbsVal = "";
        let oeVal = "";

        if (latestVitals) {
          bpVal = latestVitals.bp_systolic && latestVitals.bp_diastolic 
            ? `${latestVitals.bp_systolic}/${latestVitals.bp_diastolic}` 
            : "";
          pVal = latestVitals.hr?.toString() || "";
          tempVal = latestVitals.temp?.toString() || "";
          rrVal = latestVitals.rr?.toString() || "";
          sao2Val = latestVitals.spo2 ? `${latestVitals.spo2}%` : "";
          weightVal = latestVitals.weight?.toString() || "";
          coVal = latestVitals.notes || "";
        }

        if (latestExam && latestExam.data) {
          const examData = latestExam.data;
          
          if (examData.vitals?.rbs) {
            rbsVal = examData.vitals.rbs;
          }
          
          oeVal = formatPositiveFindings(examData);

          if (!bpVal && examData.vitals?.bpSystolic && examData.vitals?.bpDiastolic) {
            bpVal = `${examData.vitals.bpSystolic}/${examData.vitals.bpDiastolic}`;
          }
          if (!pVal && examData.vitals?.pulse) {
            pVal = examData.vitals.pulse;
          }
          if (!tempVal && examData.vitals?.temperature) {
            tempVal = examData.vitals.temperature;
          }
          if (!rrVal && examData.vitals?.respiratoryRate) {
            rrVal = examData.vitals.respiratoryRate;
          }
          if (!sao2Val && examData.vitals?.oxygenSaturation) {
            sao2Val = examData.vitals.oxygenSaturation ? `${examData.vitals.oxygenSaturation}%` : "";
          }
          if (!weightVal && examData.vitals?.weight) {
            weightVal = examData.vitals.weight;
          }
        }

        if (latestVitals || latestExam) {
          setVitals({
            bp: bpVal,
            p: pVal,
            temp: tempVal,
            rr: rrVal,
            sao2: sao2Val,
            weight: weightVal,
            rbs: rbsVal,
            oe: oeVal,
            co: coVal,
            ph: ""
          });
        } else {
          setVitals({
            bp: "",
            p: "",
            temp: "",
            rr: "",
            sao2: "",
            weight: "",
            rbs: "",
            oe: "",
            co: "",
            ph: ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch latest vitals:", error);
      }
    };
    
        fetchLatestVitals();
    
    const fetchLatestLabs = async () => {
      if (!selectedPatient?.id) return;
      try {
        const latestLabs = await db.lab_results
          .where('patientId')
          .equals(selectedPatient.id)
          .toArray();
        setLabs(latestLabs);
      } catch (error) {
        console.error("Failed to fetch latest labs:", error);
      }
    };
    
    fetchLatestLabs();
    
    const fetchLatestDiagnosis = async () => {
      if (!selectedPatient?.id || confirmedDiagnosis !== undefined && confirmedDiagnosis !== null && confirmedDiagnosis !== "") return;
      
      try {
        const latestDiagnosis = await db.diagnoses
          .where('patientId')
          .equals(selectedPatient.id)
          .reverse()
          .first();
          
        if (latestDiagnosis) {
          const diagText = latestDiagnosis.description || latestDiagnosis.condition;
          if (diagText && diagText !== confirmedDiagnosis) {
            setConfirmedDiagnosis(diagText);
          }
        }
      } catch (error) {
        console.error("Failed to fetch latest diagnosis:", error);
      }
    };
    
    fetchLatestDiagnosis();
  }, [selectedPatient, confirmedDiagnosis, setConfirmedDiagnosis]);

  useEffect(() => {
    const check = async () => {
      const meds = currentPrescription.map(item => item.medication);
      
      // Update safety alerts
      if (selectedPatient) {
        // Create a temporary patient object with the current prescription items as medications
        const tempPatient = {
          ...selectedPatient,
          medications: currentPrescription.map(item => ({
            medicationId: item.id,
            name: item.medication,
            dosage: item.dosage,
            frequency: item.frequency,
            route: item.form,
            startDate: new Date().toISOString(),
            status: 'active' as const
          }))
        };
        const alerts = checkSafetyAlerts(tempPatient, { name: confirmedDiagnosis || "" });
        const organAlerts = ClinicalIntelligenceService.checkOrganFunctionSafety(
          meds,
          {
            age: selectedPatient.age,
            weightKg: parseFloat(vitals.weight) || 0,
            isFemale: selectedPatient.gender?.toLowerCase() === 'female',
            creatinine: parseFloat(labs.find(l => l.testName.toLowerCase().includes('creatinine'))?.value) || 0,
            alt: parseFloat(labs.find(l => l.testName.toLowerCase().includes('alt'))?.value) || 0,
            hasLiverDisease: selectedPatient.chronicConditions?.some((c: string) => 
              /liver|hepatic|cirrhosis|hepatitis/i.test(c)
            )
          }
        );

        const combinedAlerts = [...alerts, ...organAlerts] as SafetyAlert[];
        
        // Only update if alerts have changed to avoid unnecessary re-renders
        setSafetyAlerts(prev => {
          if (JSON.stringify(prev) === JSON.stringify(combinedAlerts)) return prev;
          return combinedAlerts;
        });

        // 3. Therapeutic Gap Analysis
        const conditions = [
          ...(selectedPatient.chronicConditions || []),
          ...(confirmedDiagnosis ? [confirmedDiagnosis] : [])
        ];
        const gaps = await ClinicalIntelligenceService.checkTherapeuticGaps(conditions, meds);
        setGapAlerts(prev => {
          if (JSON.stringify(prev) === JSON.stringify(gaps)) return prev;
          return gaps;
        });

        // 4. Indication Auditor
        const indications = await ClinicalIntelligenceService.auditMedicationIndications(meds, conditions);
        setIndicationAlerts(prev => {
          if (JSON.stringify(prev) === JSON.stringify(indications)) return prev;
          return indications;
        });
      }

      if (meds.length < 2) {
        setInteractionAlerts(prev => prev.length === 0 ? prev : []);
        return;
      }
      setIsCheckingInteractions(true);
      const alerts = await ClinicalIntelligenceService.checkInteractions(meds);
      setInteractionAlerts(prev => {
        if (JSON.stringify(prev) === JSON.stringify(alerts)) return prev;
        return alerts;
      });
      setIsCheckingInteractions(false);
    };
    check();
  }, [currentPrescription, selectedPatient, confirmedDiagnosis, labs, vitals.weight]);

  // Handle data returning from audit page
  useEffect(() => {
    if (location.state?.items) {
      setCurrentPrescription(location.state.items);
      if (location.state?.audited) {
        toast.success("Prescription audited and approved.");
        if (location.state.labSuggestions && Array.isArray(location.state.labSuggestions)) {
          setAuditedLabSuggestions(location.state.labSuggestions);
        }
      }
    }
  }, [location.state]);

  // Reset suggestions when the prescription is modified manually
  useEffect(() => {
    if (location.state?.items !== currentPrescription) {
      setAuditedLabSuggestions(undefined);
    }
  }, [currentPrescription]);

  // Modals and UI states
  const [selectedMedForForms, setSelectedMedForForms] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Weight calculator state
  const [calculatorState, setCalculatorState] = useState<{
    isOpen: boolean;
    itemId: string | null;
    medicationName: string;
    concentration: string;
    form: string;
  }>({
    isOpen: false,
    itemId: null,
    medicationName: "",
    concentration: "",
    form: ""
  });
  const [isAiSuggestOpen, setIsAiSuggestOpen] = useState(false);
  const [isCustomMedOpen, setIsCustomMedOpen] = useState(false);
  const [customMedName, setCustomMedName] = useState("");
  const [customMedForm, setCustomMedForm] = useState("");
  const [customMedConcentration, setCustomMedConcentration] = useState("");
  const [customMedDosage, setCustomMedDosage] = useState("");
  const [customMedFrequency, setCustomMedFrequency] = useState("");
  const [customMedDuration, setCustomMedDuration] = useState("");
  const [customMedInstructions, setCustomMedInstructions] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);
  const [dbMeds, setDbMeds] = useState<Drug[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [itemsGeneratingAI, setItemsGeneratingAI] = useState<string[]>([]);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const handleAiDiscover = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    setIsDiscovering(true);
    try {
      const prompt = `You are a medical AI. The user is searching for a medication named "${searchQuery}".
Provide comprehensive details about this medication in JSON format. Use sources like OpenFDA, DailyMed, RxNorm, and an Egyptian drug database for local trade names if applicable.
If it is a valid medication, return:
{
  "isValid": true,
  "generic_name": "Generic Name",
  "drug_class": "Drug Class",
  "atc_code": "ATC Code",
  "brands": ["Brand 1", "Brand 2"],
  "mechanism_of_action": "Mechanism of Action",
  "adult_dose": "Adult Dose",
  "pediatric_dose": "Pediatric Dose",
  "renal_dose": "Renal Dose",
  "hepatic_dose": "Hepatic Dose",
  "pregnancy_category": "Pregnancy Category",
  "lactation": "Lactation information",
  "food_interactions": ["Interaction 1"],
  "monitoring_parameters": ["Parameter 1"],
  "lab_tests": ["Lab test 1"],
  "storage": "Storage info",
  "patient_counseling": ["Counseling point 1"],
  "references": ["Ref 1", "Ref 2"],
  "side_effects": ["Side effect 1"],
  "contraindications": ["Contraindication 1"]
}
If it is not a valid medication, return:
{
  "isValid": false
}`;
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      const data = parseJsonResponse<any>(responseText, { isValid: false });
      if (data.isValid) {
        await medicationService.discoverAndAddDrug({
          generic_name: data.generic_name,
          drug_class: data.drug_class,
          atc_code: data.atc_code,
          brands: data.brands,
          mechanism_of_action: data.mechanism_of_action,
          adult_dose: data.adult_dose,
          pediatric_dose: data.pediatric_dose,
          renal_dose: data.renal_dose,
          hepatic_dose: data.hepatic_dose,
          pregnancy_category: data.pregnancy_category,
          lactation: data.lactation,
          food_interactions: data.food_interactions,
          monitoring_parameters: data.monitoring_parameters,
          lab_tests: data.lab_tests,
          storage: data.storage,
          patient_counseling: data.patient_counseling,
          references: data.references,
          side_effects: data.side_effects,
          contraindications: data.contraindications
        });
        toast.success(`${data.generic_name} discovered and added to database!`);
        // Trigger a re-search
        const results = await medicationService.searchDrugs(searchQuery);
        setDbMeds(results);
      } else {
        toast.error(`Could not find a valid medication matching "${searchQuery}".`);
      }
    } catch (error) {
      console.error("AI Discover failed:", error);
      toast.error("Failed to discover medication via AI.");
    } finally {
      setIsDiscovering(false);
    }
  };

  // Fetch active medications from database
  const activePrescriptions = useLiveQuery(
    () => {
      if (!selectedPatient) return [];
      const patientId = selectedPatient.id;
      if (!patientId) return [];
      return db.prescriptions
        .where('patientId')
        .equals(patientId)
        .toArray();
    },
    [selectedPatient]
  ) || [];

  const dbActiveItems = useLiveQuery(
    async () => {
      if (activePrescriptions.length === 0) return [];
      const ids = activePrescriptions.map(p => p.id).filter(Boolean) as string[];
      return db.prescription_items
        .where('prescriptionId')
        .anyOf(ids)
        .toArray();
    },
    [activePrescriptions]
  ) || [];

  const patientMedications = useMemo(() => {
    return dbActiveItems.map(item => ({
      id: item.id,
      name: item.medicationName,
      dose: item.dosage,
      frequency: item.frequency,
      status: 'Active',
      prescribedDate: activePrescriptions.find(p => p.id === item.prescriptionId)?.createdAt || Date.now()
    }));
  }, [dbActiveItems, activePrescriptions]);

  // Fetch medications from database when searching
  useEffect(() => {
    const searchMeds = async () => {
      if (searchQuery.length < 2) {
        setDbMeds([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await medicationService.searchDrugs(searchQuery, nameType === 'generic' ? 'generic' : 'trade');
        setDbMeds(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchMeds, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, nameType]);

  // Fetch prescription history from database
  const prescriptionHistory = useLiveQuery(
    async () => {
      if (!selectedPatient) return [];
      const patientId = selectedPatient.id;
      if (!patientId) return [];
      
      const prescriptions = await db.prescriptions
        .where('patientId')
        .equals(patientId)
        .reverse()
        .sortBy('createdAt');
        
      const historyWithItems = await Promise.all(prescriptions.map(async (p) => {
        const items = await db.prescription_items
          .where('prescriptionId')
          .equals(p.id!)
          .toArray();
        return {
          ...p,
          date: new Date(p.createdAt).toISOString().split('T')[0],
          physician: "Dr. Ahmed Fathy",
          items: items.map(i => ({
            medication: i.medicationName,
            dosage: i.dosage,
            frequency: i.frequency,
            duration: i.duration,
            instructions: i.instructions,
            form: i.form
          }))
        };
      }));
      
      return historyWithItems;
    },
    [selectedPatient]
  ) || [];

  const filteredCatalog = useMemo(() => {
    let meds = [];
    if (searchQuery.length >= 2) {
      meds = [...dbMeds];
    } else {
      meds = selectedCategory === "all" 
        ? [...allMedications] 
        : [...(medicationsDatabase[selectedCategory] || [])];
    }
    
    return meds.sort((a, b) => {
      const nameA = a.name || a.generic_name || "";
      const nameB = b.name || b.generic_name || "";
      return nameA.localeCompare(nameB);
    });
  }, [selectedCategory, searchQuery, dbMeds]);

    const handleMedicationSelect = async (med: any) => {
    if (med.id && typeof med.id === 'number') {
      try {
        const details = await medicationService.getMedicationDetails(med.id);
        const mappedMed = enrichDrug({
          ...details,
          id: details.id,
          name: details.generic_name,
          generic_name: details.generic_name,
          forms: details.brands && details.brands.length > 0 
            ? details.brands.map(b => ({ id: `brand_${b.id}`, name: b.brand_name }))
            : [{ id: `generic_${details.id}`, name: "Generic Form" }]
        });
        setSelectedMedForForms(mappedMed);
      } catch (error) {
        setSelectedMedForForms(enrichDrug(med));
      }
    } else {
      setSelectedMedForForms(enrichDrug(med));
    }
  };

  const handleAddMedication = (medName: string, form: any, fullMedDetails?: any) => {
    const isCustom = typeof form !== 'object' || form === null;
    const formName = isCustom ? (typeof form === 'string' ? form : 'Tablet') : (form.name || 'Tablet');
    const medDetails = fullMedDetails || selectedMedForForms || {};

    const defaults = deriveMedicationDefaults(medName, form, medDetails);

    const newItem = {
      id: "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
      medication: medName,
      form: formName,
      concentration: (!isCustom && form.concentration) ? form.concentration : defaults.concentration,
      dosage: (!isCustom && form.dosage) ? form.dosage : defaults.dosage,
      frequency: (!isCustom && form.frequency) ? form.frequency : defaults.frequency,
      duration: (!isCustom && form.duration) ? form.duration : defaults.duration,
      instructions: (!isCustom && form.instructions) ? form.instructions : defaults.instructions
    };

    const updatedPrescription = [...currentPrescription, newItem];
    setCurrentPrescription(updatedPrescription);
    setSelectedMedForForms(null);

    // Auto-generate instructions if diagnosis is present and instructions are empty
    if (confirmedDiagnosis && !newItem.instructions) {
      handleAutoGenerateItemInstructions(newItem.id);
    }
  };

  const handleRemoveFromPrescription = (id: string) => {
    setCurrentPrescription(currentPrescription.filter(m => m.id !== id));
  };

  const handleAutoGenerateItemInstructions = async (itemId: string) => {
    const item = currentPrescription.find(i => i.id === itemId);
    if (!item || !item.medication) return;

    setItemsGeneratingAI(prev => [...prev, itemId]);
    try {
      const prompt = getMedicationInstructionsPrompt(item.medication, {
        diagnosis: confirmedDiagnosis || "Not provided",
        dosage: item.dosage || "Not provided",
        frequency: item.frequency || "Not provided",
        patientAllergies: selectedPatient?.allergies?.map((a: any) => a.name).join(", ") || "None reported"
      });

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      if (responseText) {
        handleUpdatePrescriptionItem(itemId, 'instructions', responseText.trim());
        toast.success(`AI instructions for ${item.medication} generated`);
      }
    } catch (error) {
      console.error("Failed to generate item instructions:", error);
      toast.error("Failed to generate instructions via AI");
    } finally {
      setItemsGeneratingAI(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleAutoGeneratePrescriptionNotes = async () => {
    if (currentPrescription.length === 0) {
      toast.error("Add medications first");
      return;
    }

    setIsGeneratingNotes(true);
    try {
      const prompt = getPrescriptionNotesPrompt({
        medications: currentPrescription.map(i => `${i.medication} (${i.concentration || ''} ${i.form || ''} ${i.dosage || ''} ${i.frequency || ''})`),
        diagnosis: confirmedDiagnosis || "Not provided",
        patientName: selectedPatient?.name || "Patient",
        patientAge: selectedPatient?.age ? String(selectedPatient.age) : "Not specified",
        patientGender: selectedPatient?.gender || "Not specified",
        patientAllergies: selectedPatient?.allergies?.map((a: any) => a.name).join(", ") || "None reported",
        patientChronicConditions: selectedPatient?.chronicConditions?.join(", ") || "None documented",
        vitals: `BP: ${vitals.bp}, HR/Pulse: ${vitals.p}, Temp: ${vitals.temp}, Weight: ${vitals.weight}`
      });

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );

      if (responseText) {
        setPrescriptionNotes(responseText.trim());
        toast.success("Prescription notes auto-filled by AI");
      }
    } catch (error) {
      console.error("Failed to generate prescription notes:", error);
      toast.error("Failed to generate notes via AI");
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleUpdatePrescriptionItem = (id: string, field: string, value: string) => {
    setCurrentPrescription(currentPrescription.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handleLoadTemplate = (templateName: string, variant: string) => {
    const template = allTemplates[templateName]?.[variant];
    if (template) {
      if (currentPrescription.length > 0) {
        setConfirmModal({
          isOpen: true,
          title: "Load Template",
          message: "Replace current items with template?",
          onConfirm: () => {
            const newItems = template.map(item => ({
              id: "item_" + Date.now() + Math.random(),
              concentration: item.concentration || item.form,
              ...item
            }));
            setCurrentPrescription(newItems);
            setIsTemplatesOpen(false);
          }
        });
        return;
      }
      const newItems = template.map(item => ({
        id: "item_" + Date.now() + Math.random(),
        concentration: item.concentration || item.form,
        ...item
      }));
      setCurrentPrescription(newItems);
      setIsTemplatesOpen(false);
    }
  };

  const handleSavePrescription = async () => {
    if (currentPrescription.length === 0) {
      toast.error("Please add at least one medication.");
      return;
    }
    
    const incomplete = currentPrescription.some(i => !i.dosage || !i.frequency || !i.duration);
    if (incomplete) {
      toast.error("Please complete all medication details.");
      return;
    }

    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      await PrescriptionService.savePrescription(
        selectedPatient.id,
        confirmedDiagnosis || "",
        prescriptionNotes,
        parseInt(refills),
        currentPrescription
      );

      toast.success("Prescription saved successfully!");
      setCurrentPrescription([]);
      setPrescriptionNotes("");
      setRefills("0");
      setActiveTab('active');
    } catch (error) {
      console.error("Failed to save prescription", error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error("Storage full. Please clear some space or delete old backups in Settings.");
      } else {
        toast.error("Failed to save prescription");
      }
    }
  };

  const handleSaveAsTemplate = () => {
    if (currentPrescription.length === 0) {
      toast.error("Add medications to the prescription first.");
      return;
    }
    setPromptValue("");
    setPromptModal({
      isOpen: true,
      title: "Save as Template",
      message: "Enter a name for this template:",
      defaultValue: "",
      onConfirm: (templateName) => {
        if (templateName) {
          const newTemplate = {
            id: "ut-" + Date.now(),
            name: templateName,
            items: currentPrescription.map(({ id, ...rest }) => rest)
          };
          setUserTemplates([...userTemplates, newTemplate]);
          toast.success("Template saved! You can find it in the Templates menu.");
        }
      }
    });
  };

  const handleLoadUserTemplate = (template: any) => {
    if (currentPrescription.length > 0) {
      setConfirmModal({
        isOpen: true,
        title: "Load Template",
        message: "Replace current items with template?",
        onConfirm: () => {
          const newItems = template.items.map((item: any) => ({
            id: "item_" + Date.now() + Math.random(),
            concentration: item.concentration || item.form,
            ...item
          }));
          setCurrentPrescription(newItems);
          setIsTemplatesOpen(false);
        }
      });
      return;
    }
    const newItems = template.items.map((item: any) => ({
      id: "item_" + Date.now() + Math.random(),
      ...item
    }));
    setCurrentPrescription(newItems);
    setIsTemplatesOpen(false);
  };

  const handleAiSuggest = async () => {
    if (!confirmedDiagnosis) {
      toast.error("Please finalize a diagnosis in the Final Diagnosis page first.");
      return;
    }
    
    setIsAiLoading(true);
    setIsAiSuggestOpen(true);
    try {
      const history = await PatientHistoryService.getPatientHistory(selectedPatient.id);
      const allergies = selectedPatient.allergies || [];
      const allergiesStr = allergies.length > 0 ? allergies.map((a: any) => `${a.name} (${a.severity})`).join(", ") : "None reported";
      
      const prompt = getGeneratePrescriptionPrompt({
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr,
        history: history.map(h => `${h.date}: ${h.type} - ${h.title} - ${h.description}`).join("\n"),
        diagnosis: confirmedDiagnosis || "Not provided",
        existingMedications: patientMedications.map(m => m.name).join(", ")
      });

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );

      const data = parseJsonResponse(responseText, []);
      setAiSuggestions(data);
      setSelectedSuggestions([]);
    } catch (error: any) {
      console.error("AI Suggestion failed:", error);
      const isQuotaError = error?.error?.code === 429 || error?.code === 429;
      toast.error(isQuotaError ? "AI quota exceeded. Please wait a moment before trying again." : "Failed to get AI suggestions. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    setSelectedSuggestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  };

  const applySelectedSuggestions = () => {
    const newItems = selectedSuggestions.map(index => {
      const suggestion = aiSuggestions[index];
      return {
        id: "item_" + Date.now() + Math.random() + index,
        medication: suggestion.medication,
        form: suggestion.form,
        concentration: suggestion.concentration,
        dosage: suggestion.dosage,
        frequency: suggestion.frequency,
        duration: suggestion.duration,
        instructions: suggestion.clinicalInstructions || ""
      };
    });
    setCurrentPrescription([...currentPrescription, ...newItems]);
    setIsAiSuggestOpen(false);
    setAiSuggestions([]);
    setSelectedSuggestions([]);
  };

  const applyAiSuggestion = (suggestion: any) => {
    const newItem = {
      id: "item_" + Date.now() + Math.random(),
      medication: suggestion.medication,
      form: suggestion.form,
      concentration: suggestion.concentration,
      dosage: suggestion.dosage,
      frequency: suggestion.frequency,
      duration: suggestion.duration,
      instructions: suggestion.clinicalInstructions || ""
    };
    setCurrentPrescription([...currentPrescription, newItem]);
    setIsAiSuggestOpen(false);
    setAiSuggestions([]);
  };

  const handleGetAlternative = async (suggestion: any, idx: number) => {
    setIsAiLoading(true);
    try {
      const allergiesStr = (() => {
        const allergies = selectedPatient?.allergies || [];
        return allergies.length > 0 ? allergies.map((a: any) => `${a.name} (${a.severity})`).join(", ") : "None reported";
      })();

      const prompt = getAlternativeMedicationPrompt(suggestion.medication, confirmedDiagnosis, {
        name: selectedPatient?.name || "Unknown",
        age: String(selectedPatient?.age || "N/A"),
        gender: selectedPatient?.gender || "N/A",
        allergies: allergiesStr
      });
      
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      
      const alternative = parseJsonResponse(responseText, {} as any);
      if (alternative && alternative.medication) {
        const newSuggestions = [...aiSuggestions];
        newSuggestions[idx] = alternative;
        setAiSuggestions(newSuggestions);
        toast.success("Alternative medication suggested.");
      }
    } catch (e: any) {
      console.error("Failed to get alternative:", e);
      const isQuotaError = e?.error?.code === 429 || e?.code === 429;
      toast.error(isQuotaError ? "AI quota exceeded. Please wait a moment before trying again." : "Failed to get alternative medication.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleUpdateMedicationStatus = async (medicationId: string, status: 'active' | 'discontinued' | 'completed') => {
    try {
      // Find the prescription item in the DB
      const item = await db.prescription_items.get(medicationId);
      if (item) {
        // In a real app, we might update the item status or the parent prescription status
        // For this demo, we'll show a success toast
        toast.success(`Medication ${status === 'discontinued' ? 'discontinued' : 'marked as ' + status}`);
      }
    } catch (error) {
      console.error("Failed to update medication status:", error);
      toast.error("Failed to update status");
    }
  };

  const getMedicationDisplay = (genericName: any) => {
    if (!genericName) return "";
    
    if (typeof genericName === 'object') {
      const extracted = genericName.name || genericName.generic_name || genericName.medication;
      genericName = typeof extracted === 'string' ? extracted : "Unknown Medication";
    }

    if (nameType === 'generic') return genericName;
    
    const tradeNames: Record<string, string> = {
      'Amoxicillin': 'Amoxil',
      'Lisinopril': 'Prinivil / Zestril',
      'Metformin': 'Glucophage',
      'Atorvastatin': 'Lipitor',
      'Ibuprofen': 'Advil / Motrin',
      'Azithromycin': 'Zithromax',
      'Sertraline': 'Zoloft',
      'Levothyroxine': 'Synthroid',
      'Amlodipine': 'Norvasc',
      'Omeprazole': 'Prilosec',
      'Losartan': 'Cozaar',
      'Spironolactone': 'Aldactone',
      'Metoprolol': 'Lopressor',
      'Gabapentin': 'Neurontin',
      'Furosemide': 'Lasix',
      'Albuterol': 'Ventolin'
    };

    const trade = tradeNames[genericName];
    return trade ? `${trade} (${genericName})` : genericName;
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-y-auto custom-scrollbar pb-6 pr-2">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Medications</h2>
          <p className="text-slate-500">Manage patient medications and write new prescriptions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('new')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === 'new' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          New Prescription
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === 'reconciliation' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          Reconciliation
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            activeTab === 'active' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
          )}
        >
          Active Medications
        </button>
      </div>

      {activeTab === 'reconciliation' && selectedPatient && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <MedicationReconciliation 
            medications={selectedPatient.medications || []} 
            onUpdateStatus={handleUpdateMedicationStatus} 
          />
        </div>
      )}

      {activeTab === 'new' ? (
        <>
          {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentPrescription.length > 0) {
                setConfirmModal({
                  isOpen: true,
                  title: "New Prescription",
                  message: "Start a new prescription? Current items will be cleared.",
                  onConfirm: () => {
                    setCurrentPrescription([]);
                    setPrescriptionNotes("");
                  }
                });
              }
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" /> New
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => setIsAiSuggestOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Cpu className="w-4 h-4" /> AI Suggest
          </button>
          <button 
            onClick={() => setIsTemplatesOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Layout className="w-4 h-4" /> Templates
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (currentPrescription.length === 0) {
                toast.error("Please add at least one medication.");
                return;
              }
              navigate('/clinical-audit', { 
                state: { 
                  items: currentPrescription,
                  notes: prescriptionNotes,
                  refills: refills
                } 
              });
            }}
            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" /> Check
          </button>
          <button 
            onClick={() => {
              if (currentPrescription.length === 0) {
                toast.error("Please add at least one medication.");
                return;
              }
              setIsPreviewOpen(true);
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button 
            onClick={handleSavePrescription}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Save & Finish
          </button>
        </div>
      </div>

      {/* Favorite Medications Quick-Bar directly below toolbar header */}
      <FavoritesQuickBar onSelectMedication={handleAddMedication} />

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Medication Catalog & Vitals */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-[500px] lg:min-h-0">
          {/* Vitals Section */}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" /> All Medications Catalog
                </h3>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                   <button 
                     onClick={() => setNameType('generic')}
                     className={cn(
                       "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                       nameType === 'generic' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                   >
                     Generic
                   </button>
                   <button 
                     onClick={() => setNameType('trade')}
                     className={cn(
                       "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                       nameType === 'trade' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                     )}
                   >
                     Trade
                   </button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-slate-50 focus:bg-white transition-colors" 
                  placeholder="Search drug name..." 
                />
              </div>
            </div>
            
            <div className="flex overflow-x-auto p-3 gap-2 border-b border-slate-100 bg-slate-50/50 scrollbar-hide">
              {[
                { id: 'all', label: 'All' },
                { id: 'acne_treatments', label: 'Acne Treatments' },
                { id: 'antihistamines', label: 'Allergy' },
                { id: 'alzheimers', label: 'Alzheimer\'s' },
                { id: 'analgesics', label: 'Analgesics' },
                { id: 'antacids', label: 'Antacids' },
                { id: 'anti_glaucoma', label: 'Anti-glaucoma' },
                { id: 'anti_gout', label: 'Anti-gout' },
                { id: 'antianginal', label: 'Antianginal' },
                { id: 'antiarrhythmics', label: 'Antiarrhythmics' },
                { id: 'antibiotic_creams', label: 'Antibiotic Creams' },
                { id: 'antibiotics', label: 'Antibiotics' },
                { id: 'anticoagulants', label: 'Anticoagulants' },
                { id: 'antidiabetics', label: 'Antidiabetics' },
                { id: 'antidiarrheals', label: 'Antidiarrheals' },
                { id: 'antiemetics', label: 'Antiemetics' },
                { id: 'antifungals', label: 'Antifungal' },
                { id: 'antifungal_creams', label: 'Antifungal Creams' },
                { id: 'antihypertensives', label: 'Antihypertensives' },
                { id: 'antimalarials', label: 'Antimalarials' },
                { id: 'antiparasitics', label: 'Antiparasitics' },
                { id: 'antiplatelets', label: 'Antiplatelets' },
                { id: 'antipsychotics', label: 'Antipsychotic' },
                { id: 'antitubercular', label: 'Antitubercular' },
                { id: 'antivirals', label: 'Antiviral' },
                { id: 'anxiolytics', label: 'Anxiolytics' },
                { id: 'artificial_tears', label: 'Artificial Tears' },
                { id: 'bph_drugs', label: 'BPH Drugs' },
                { id: 'bronchodilators', label: 'Bronchodilators' },
                { id: 'chemotherapy_agents', label: 'Chemotherapy' },
                { id: 'corticosteroids', label: 'Corticosteroids' },
                { id: 'cough_suppressants', label: 'Cough Suppressants' },
                { id: 'diuretics', label: 'Diuretics' },
                { id: 'dmards', label: 'DMARDs' },
                { id: 'ear_drops', label: 'Ear Drops' },
                { id: 'emergency_drugs', label: 'Emergency Drugs' },
                { id: 'antiepileptics', label: 'Epilepsy' },
                { id: 'erectile_dysfunction', label: 'Erectile Dysfunction' },
                { id: 'h2_blockers', label: 'H2 Blockers' },
                { id: 'heart_failure', label: 'Heart Failure' },
                { id: 'hematinics', label: 'Hematinics' },
                { id: 'hemostatic_agents', label: 'Hemostatic Agents' },
                { id: 'hormones', label: 'Hormones' },
                { id: 'ibd', label: 'IBD Drugs' },
                { id: 'immunoglobulins', label: 'Immunoglobulins' },
                { id: 'immunosuppressants', label: 'Immunosuppressants' },
                { id: 'immunotherapy', label: 'Immunotherapy' },
                { id: 'inhaled_corticosteroids', label: 'Inhaled Corticosteroids' },
                { id: 'insulins', label: 'Insulins' },
                { id: 'iv_fluids', label: 'IV Fluids' },
                { id: 'laxatives', label: 'Laxatives' },
                { id: 'leukotriene_antagonists', label: 'Leukotriene Antagonists' },
                { id: 'lipid_lowering', label: 'Lipid-lowering' },
                { id: 'monoclonal_antibodies', label: 'Monoclonal Antibodies' },
                { id: 'mucolytics', label: 'Mucolytics' },
                { id: 'muscle_relaxants', label: 'Muscle Relaxants' },
                { id: 'mydriatics_miotics', label: 'Mydriatics & Miotics' },
                { id: 'nasal_decongestants', label: 'Nasal Decongestants' },
                { id: 'nsaids', label: 'NSAIDs' },
                { id: 'ophthalmic_antibiotics', label: 'Ophthalmic Antibiotics' },
                { id: 'osteoporosis', label: 'Osteoporosis' },
                { id: 'parkinsonism', label: 'Parkinsonism' },
                { id: 'ppis', label: 'PPIs' },
                { id: 'psoriasis_treatments', label: 'Psoriasis Treatments' },
                { id: 'antidepressants', label: 'Psych' },
                { id: 'sedatives_hypnotics', label: 'Sedatives/Hypnotics' },
                { id: 'sex_hormones', label: 'Sex Hormones' },
                { id: 'thrombolytics', label: 'Thrombolytics' },
                { id: 'thyroid', label: 'Thyroid' },
                { id: 'topical_corticosteroids', label: 'Topical Corticosteroids' },
                { id: 'toxoids', label: 'Toxoids' },
                { id: 'urinary_antispasmodics', label: 'Urinary Antispasmodics' },
                { id: 'vaccines', label: 'Vaccines' },
                { id: 'vitamins', label: 'Vitamins' }
              ].map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                    selectedCategory === cat.id 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-3">
              {filteredCatalog.length > 0 ? (
                <div className="space-y-2">
                  {filteredCatalog.map(med => {
                    const query = searchQuery?.toLowerCase() || '';
                    const matchedSideEffect = query && med.sideEffects?.find((se: string) => se?.toLowerCase().includes(query));
                    const matchedInteraction = query && med.interactions?.find((int: string) => int?.toLowerCase().includes(query));

                    return (
                      <div 
                        key={med.id} 
                        onClick={() => handleMedicationSelect(med)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-all border",
                          selectedMedForForms?.id === med.id
                            ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                            : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm">{getMedicationDisplay(med.name || med.generic_name)}</p>
                          <DosageFormBadge form={med.dosage_form || (med.forms?.[0]?.name) || 'Tablet'} size="xs" />
                        </div>
                        {(matchedSideEffect || matchedInteraction) && (
                          <div className="mt-1 text-[10px] text-slate-500">
                            {matchedSideEffect && <p>Matches side effect: <span className="font-medium text-indigo-600">{matchedSideEffect}</span></p>}
                            {matchedInteraction && <p>Matches interaction: <span className="font-medium text-indigo-600">{matchedInteraction}</span></p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Search className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm mb-4">No medications found.</p>
                  {searchQuery.length >= 2 && (
                    <button
                      onClick={handleAiDiscover}
                      disabled={isDiscovering}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      AI Discover "{searchQuery}"
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <button 
                onClick={() => setIsCustomMedOpen(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add Custom Medication
              </button>
            </div>
          </div>

          {/* Form Selection Card */}
          {selectedMedForForms && (
            <div className="bg-white rounded-xl border border-indigo-200 shadow-md overflow-hidden animate-in slide-in-from-bottom-4">
              <div className="bg-indigo-600 text-white p-3 flex justify-between items-center">
                <h4 className="font-medium text-sm">{selectedMedForForms.name}</h4>
                <button onClick={() => setSelectedMedForForms(null)} className="text-indigo-100 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-3 border-b border-slate-100 bg-slate-50 space-y-3 max-h-[400px] overflow-y-auto">
                {/* Badges */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {selectedMedForForms.drug_class && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold">
                      Class: {selectedMedForForms.drug_class}
                    </span>
                  )}
                  {selectedMedForForms.route && (
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-medium">
                      Route: {selectedMedForForms.route}
                    </span>
                  )}
                  {selectedMedForForms.strength && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
                      Strength: {selectedMedForForms.strength}
                    </span>
                  )}
                  {selectedMedForForms.dosage_form && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">
                      Form: {selectedMedForForms.dosage_form}
                    </span>
                  )}
                </div>

                {/* Egyptian Brands */}
                {selectedMedForForms.brand_names_egypt && Array.isArray(selectedMedForForms.brand_names_egypt) && selectedMedForForms.brand_names_egypt.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">🇪🇬 Brand Names (Egypt)</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedForForms.brand_names_egypt.map((b: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">
                          {typeof b === 'string' ? b : b?.brand_name || b?.name || String(b)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mechanism of Action */}
                {selectedMedForForms.mechanism_of_action && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Mechanism of Action</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedMedForForms.mechanism_of_action}</p>
                  </div>
                )}

                {/* Indications */}
                {selectedMedForForms.indications && Array.isArray(selectedMedForForms.indications) && selectedMedForForms.indications.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Indications</h5>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                      {selectedMedForForms.indications.map((ind: string, i: number) => <li key={i}>{ind}</li>)}
                    </ul>
                  </div>
                )}

                {/* Contraindications */}
                {selectedMedForForms.contraindications && Array.isArray(selectedMedForForms.contraindications) && selectedMedForForms.contraindications.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-500" /> Contraindications
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedMedForForms.contraindications.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dosing Guidelines */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
                  {selectedMedForForms.adult_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Adult Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.adult_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.pediatric_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Pediatric Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.pediatric_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.renal_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Renal Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.renal_dose}</span>
                    </div>
                  )}
                  {selectedMedForForms.hepatic_dose && (
                    <div>
                      <span className="font-semibold text-slate-700 block text-[10px] uppercase">Hepatic Dose</span>
                      <span className="text-slate-600 text-[11px]">{selectedMedForForms.hepatic_dose}</span>
                    </div>
                  )}
                </div>

                {/* Pregnancy & Lactation */}
                {(selectedMedForForms.pregnancy_category || selectedMedForForms.lactation) && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-xs">
                    {selectedMedForForms.pregnancy_category && (
                      <div>
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase">Pregnancy Category</span>
                        <span className="text-slate-600 text-[11px]">{selectedMedForForms.pregnancy_category}</span>
                      </div>
                    )}
                    {selectedMedForForms.lactation && (
                      <div>
                        <span className="font-semibold text-slate-700 block text-[10px] uppercase">Lactation</span>
                        <span className="text-slate-600 text-[11px]">{selectedMedForForms.lactation}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Side Effects & Interactions */}
                {selectedMedForForms.sideEffects && Array.isArray(selectedMedForForms.sideEffects) && selectedMedForForms.sideEffects.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Side Effects</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.sideEffects.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.interactions && Array.isArray(selectedMedForForms.interactions) && selectedMedForForms.interactions.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Drug Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.interactions.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.food_interactions && Array.isArray(selectedMedForForms.food_interactions) && selectedMedForForms.food_interactions.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Food Interactions</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.food_interactions.join(", ")}</p>
                  </div>
                )}

                {/* Monitoring & Labs */}
                {selectedMedForForms.monitoring_parameters && Array.isArray(selectedMedForForms.monitoring_parameters) && selectedMedForForms.monitoring_parameters.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Monitoring Parameters</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.monitoring_parameters.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.lab_tests && Array.isArray(selectedMedForForms.lab_tests) && selectedMedForForms.lab_tests.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Lab Tests</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.lab_tests.join(", ")}</p>
                  </div>
                )}

                {selectedMedForForms.storage && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-0.5">Storage</h5>
                    <p className="text-xs text-slate-600">{selectedMedForForms.storage}</p>
                  </div>
                )}

                {/* Patient Counseling */}
                {selectedMedForForms.patient_counseling && Array.isArray(selectedMedForForms.patient_counseling) && selectedMedForForms.patient_counseling.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Patient Counseling</h5>
                    <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                      {selectedMedForForms.patient_counseling.map((c: string, i: number) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}

                {/* References */}
                {selectedMedForForms.references && Array.isArray(selectedMedForForms.references) && selectedMedForForms.references.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">References</h5>
                    <p className="text-[10px] text-slate-500 italic">{selectedMedForForms.references.join(" • ")}</p>
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Dosage Form</h5>
                {selectedMedForForms.forms.map((form: any) => (
                  <button
                    key={form.id}
                    onClick={() => handleAddMedication(selectedMedForForms.name, form, selectedMedForForms)}
                    className="w-full text-left p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-500 hover:shadow-sm transition-all flex justify-between items-center group gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <DosageFormBadge form={form.name} size="sm" />
                    </div>
                    {form.minDose && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="text-[10px] font-semibold text-slate-600">
                          {form.minDose} - {form.maxDose}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: The Prescription Pad */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-3 text-indigo-600">
              <FileText className="w-8 h-8" />
              <span className="text-xl font-bold tracking-widest">PRESCRIPTION</span>
            </div>
            <div className="flex gap-6">
              <button 
                onClick={handleSaveAsTemplate}
                className="px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
              >
                Save as Template
              </button>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" className="text-sm font-medium text-slate-900 bg-transparent border-none outline-none p-0" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rx ID</label>
                <span className="text-sm font-medium text-slate-900">#NEW</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-y-auto bg-white">
            <div className="flex-1 mb-6">
              {interactionAlerts.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Potential Drug-Drug Interactions Detected</span>
                  </div>
                  <div className="space-y-3">
                    {interactionAlerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-white border border-red-100 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {Array.isArray(alert.drugs) ? alert.drugs.join(" + ") : "Unknown"}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            alert.severity === 'Major' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Source: {alert.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {safetyAlerts.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>Clinical Safety Alerts</span>
                  </div>
                  <div className="space-y-3">
                    {safetyAlerts.map((alert, i) => (
                      <div key={i} className="p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {alert.type}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            (alert.severity === 'Severe' || alert.severity === 'Major') ? 'bg-red-100 text-red-700' :
                            alert.severity === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{alert.message}</p>
                      </div>
                    ))}
                  </div>

                  {gapAlerts.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm bg-indigo-50 p-2.5 rounded-lg mb-3">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>Therapeutic Gap Analysis</span>
                      </div>
                      <div className="space-y-3">
                        {gapAlerts.map((gap, i) => (
                          <div key={i} className="p-3 bg-white border border-indigo-100 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                Missing Therapy
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                gap.priority === 'High' ? 'bg-red-100 text-red-700' :
                                gap.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {gap.priority}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 mb-1">{gap.condition}</p>
                            <p className="text-xs text-slate-600 mb-2">{gap.message}</p>
                            {gap.clinicalContext && (
                              <div className="text-[10px] bg-slate-50 p-1.5 rounded text-slate-500 border border-slate-100">
                                <strong>Guideline:</strong> {gap.clinicalContext}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {indicationAlerts.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-sm bg-rose-50 p-2.5 rounded-lg mb-3">
                        <CheckCircle className="w-4 h-4 text-rose-600" />
                        <span>Indication Auditor</span>
                      </div>
                      <div className="space-y-3">
                        {indicationAlerts.map((alert, i) => (
                          <div key={i} className="p-3 bg-white border border-rose-100 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">
                                Missing Indication
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-700">
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 mb-1">{alert.drug}</p>
                            <p className="text-xs text-slate-600">{alert.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {currentPrescription.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 p-8 text-center bg-slate-50/50">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mb-4" />
                  <p className="font-medium text-slate-600 text-lg">No medications added yet</p>
                  <p className="text-sm mt-1">Select a medication from the catalog to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentPrescription.map((item, index) => (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200 group">
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <DosageFormBadge form={item.form} size="md" />
                          <h4 className="font-bold text-lg text-slate-900 m-0">{getMedicationDisplay(item.medication)}</h4>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromPrescription(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concentration</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                  type="text" 
                                  value={item.concentration || ""}
                                  onChange={(e) => handleUpdatePrescriptionItem(item.id, 'concentration', e.target.value)}
                                  placeholder="e.g., 500mg"
                                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                              </div>
                              <button 
                                onClick={() => setCalculatorState({
                                  isOpen: true,
                                  itemId: item.id,
                                  medicationName: item.medication,
                                  concentration: item.concentration || "",
                                  form: item.form || ""
                                })}
                                title="Weight-based calculator"
                                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
                              >
                                <Calculator className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dosage</label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={item.dosage}
                                onChange={(e) => handleUpdatePrescriptionItem(item.id, 'dosage', e.target.value)}
                                placeholder="e.g., 1 tab"
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={item.frequency}
                                onChange={(e) => handleUpdatePrescriptionItem(item.id, 'frequency', e.target.value)}
                                placeholder="e.g., BID"
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={item.duration}
                                onChange={(e) => handleUpdatePrescriptionItem(item.id, 'duration', e.target.value)}
                                placeholder="e.g., 7 days"
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 md:col-span-4">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Instructions</label>
                              <button
                                onClick={() => handleAutoGenerateItemInstructions(item.id)}
                                disabled={itemsGeneratingAI.includes(item.id)}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 disabled:opacity-50"
                                title="Auto-generate clinical instructions via AI"
                              >
                                {itemsGeneratingAI.includes(item.id) ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3" />
                                )}
                                Auto-Fill Instructions
                              </button>
                            </div>
                            <div className="relative">
                              <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input 
                                type="text" 
                                value={item.instructions}
                                onChange={(e) => handleUpdatePrescriptionItem(item.id, 'instructions', e.target.value)}
                                placeholder="e.g., Take after meals"
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t-2 border-slate-100 pt-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Notes / Instructions</label>
                  <button
                    onClick={handleAutoGeneratePrescriptionNotes}
                    disabled={isGeneratingNotes || currentPrescription.length === 0}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 disabled:opacity-50 shadow-sm"
                  >
                    {isGeneratingNotes ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                    )}
                    Generate Structured Clinical Notes
                  </button>
                </div>
                <Textarea 
                  value={prescriptionNotes || ""}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="AI can auto-generate structured goals, regimen details, follow-up, and safety monitoring..."
                  className="w-full p-4 border-2 border-slate-200 rounded-xl text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[160px] transition-all bg-white shadow-inner text-slate-900 placeholder:text-slate-400"
                ></Textarea>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Refills</label>
                  <input 
                    type="number" 
                    value={refills}
                    onChange={(e) => setRefills(e.target.value)}
                    min="0"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic</label>
                  <input 
                    type="text" 
                    defaultValue="Physician Hiclinic"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Doctor</label>
                  <input 
                    type="text" 
                    defaultValue="Dr. Ahmed Fathy"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      ) : activeTab === 'active' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 min-h-0">
          <div className="p-6 border-b border-slate-200 shrink-0">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Active Medications</h3>
              <p className="text-sm text-slate-500">Manage current patient medications</p>
            </div>
          </div>
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar max-h-[60vh]">
            {patientMedications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p>No active medications found for this patient.</p>
              </div>
            ) : (
              <div className="space-y-4 pr-2">
                {patientMedications.map(med => (
                  <div key={med.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-slate-50">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-slate-900">{getMedicationDisplay(med.name)}</h4>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          {med.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {med.dose} • {med.frequency}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Prescribed: {new Date(med.prescribedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setPromptValue(med.dose);
                          setPromptModal({
                            isOpen: true,
                            title: "Update Dosage",
                            message: `Update dosage for ${med.name}:`,
                            defaultValue: med.dose,
                            onConfirm: async (newDose) => {
                              if (newDose) {
                                try {
                                  await db.prescription_items.update(med.id, { dosage: newDose });
                                  toast.success("Dosage updated");
                                } catch (e) {
                                  toast.error("Failed to update dosage");
                                }
                              }
                            }
                          });
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Update Dose
                      </button>
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "Discontinue Medication",
                            message: `Are you sure you want to discontinue ${med.name}?`,
                            onConfirm: async () => {
                              try {
                                await db.prescription_items.delete(med.id);
                                toast.success("Medication discontinued");
                              } catch (e) {
                                toast.error("Failed to discontinue medication");
                              }
                            }
                          });
                        }}
                        className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Discontinue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Modals */}
      <WeightCalculatorModal 
        isOpen={calculatorState.isOpen}
        onClose={() => setCalculatorState(prev => ({ ...prev, isOpen: false }))}
        patientWeight={vitals.weight}
        medicationName={calculatorState.medicationName}
        initialConcentration={calculatorState.concentration}
        form={calculatorState.form}
        onApply={(dosage, instructions) => {
          if (calculatorState.itemId === "CUSTOM") {
            setCustomMedDosage(dosage);
            // Concatenate with existing instructions if needed or set it
            const newInstructions = customMedInstructions ? `${customMedInstructions}. ${instructions}` : instructions;
            setCustomMedInstructions(newInstructions);
          } else if (calculatorState.itemId) {
            handleUpdatePrescriptionItem(calculatorState.itemId, 'dosage', dosage);
            handleUpdatePrescriptionItem(calculatorState.itemId, 'instructions', instructions);
          }
          setCalculatorState(prev => ({ ...prev, isOpen: false }));
          toast.success("Dosage calculated and applied");
        }}
      />
      {isTemplatesOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Prescription Templates</h3>
              <button onClick={() => setIsTemplatesOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="space-y-4">
                {userTemplates.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Your Templates</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userTemplates.map(template => (
                        <div key={template.id} className="relative group">
                          <button 
                            onClick={() => handleLoadUserTemplate(template)}
                            className="w-full text-left p-3 border border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <p className="font-bold text-indigo-900 text-sm">{template.name}</p>
                            <p className="text-[10px] text-indigo-600 mt-1">{template.items.length} medications</p>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmModal({
                                isOpen: true,
                                title: "Delete Template",
                                message: "Are you sure you want to delete this template?",
                                onConfirm: () => {
                                  setUserTemplates(userTemplates.filter(t => t.id !== template.id));
                                }
                              });
                            }}
                            className="absolute top-2 right-2 p-1 text-indigo-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Delete template"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Templates</h4>
                {Object.entries(allTemplates).map(([key, variants]) => (
                  <div key={key} className="border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-800 capitalize mb-2">{key.replace(/-/g, ' ')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(variants).map(v => (
                        <button 
                          key={v}
                          onClick={() => handleLoadTemplate(key, v)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-sm font-medium rounded-md transition-colors"
                        >
                          {v.startsWith('Variation') ? v : `Variant ${v}`}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isAiSuggestOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" /> AI Clinical Assistant
              </h3>
              <button onClick={() => setIsAiSuggestOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {!aiSuggestions.length && !isAiLoading && (
                <div className="mb-6">
                  <p className="text-sm text-slate-600">
                    AI will suggest medications based on the confirmed diagnosis: 
                    <span className="font-bold text-indigo-900"> {confirmedDiagnosis}</span>
                  </p>
                </div>
              )}
              
              {(isAiLoading || !aiSuggestions.length) && (
                <button 
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  {isAiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Generate Suggestions
                    </>
                  )}
                </button>
              )}

              {aiSuggestions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Medications</h4>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => {setAiSuggestions([]); handleAiSuggest();}}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Regenerate
                      </button>
                      {selectedSuggestions.length > 0 && (
                        <button 
                          onClick={applySelectedSuggestions}
                          className="text-xs text-emerald-600 font-bold hover:underline"
                        >
                          Add Selected ({selectedSuggestions.length})
                        </button>
                      )}
                    </div>
                  </div>
                  {aiSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-4 border rounded-xl transition-all cursor-pointer",
                        selectedSuggestions.includes(idx) 
                          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" 
                          : "border-indigo-100 bg-indigo-50/30 hover:border-indigo-300"
                      )}
                      onClick={() => toggleSuggestion(idx)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded border flex items-center justify-center mt-0.5 transition-colors",
                            selectedSuggestions.includes(idx)
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-white border-slate-300"
                          )}>
                            {selectedSuggestions.includes(idx) && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="font-bold text-indigo-900">{suggestion.medication}</p>
                            <p className="text-xs text-indigo-600 font-medium">{suggestion.concentration} • {suggestion.dosage} • {suggestion.frequency} • {suggestion.duration}</p>
                            {suggestion.clinicalInstructions && (
                              <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                                <span className="font-semibold">Instructions:</span> {suggestion.clinicalInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGetAlternative(suggestion, idx);
                            }}
                            className="p-1.5 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Get alternative"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              applyAiSuggestion(suggestion);
                            }}
                            className="px-3 py-1 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic ml-8">
                        <span className="font-bold not-italic">Reasoning:</span> {suggestion.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              
              {isAiLoading && (
                <div className="py-12 text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <Cpu className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="text-slate-500 text-sm animate-pulse">Consulting clinical knowledge base...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0 print:static print:block print-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[95vh] flex flex-col print:shadow-none print:border-none print:w-full print:max-w-none print:max-h-none print:static print:block">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center no-print">
              <h3 className="text-lg font-bold text-slate-900">Prescription Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
              <div id="prescription-to-print" className="print:m-0">
                <PrescriptionPreview data={{
                  id: selectedPatient?.id || "PREVIEW",
                  name: selectedPatient?.name || "",
                  age: String(selectedPatient?.age || ""),
                  gender: selectedPatient?.gender || "",
                  contact: selectedPatient?.phone || "",
                  ph: vitals.ph,
                  co: vitals.co,
                  bp: vitals.bp,
                  p: vitals.p,
                  temp: vitals.temp,
                  rr: vitals.rr,
                  sao2: vitals.sao2,
                  rbs: vitals.rbs,
                  oe: vitals.oe,
                  dx: confirmedDiagnosis || "",
                  medications: currentPrescription.map(item => ({
                    name: item.medication,
                    concentration: item.concentration,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    instructions: item.instructions
                  })),
                  requiredLabMonitoring: auditedLabSuggestions || (parseClinicalNotes(prescriptionNotes).labs.length > 0 ? parseClinicalNotes(prescriptionNotes).labs : undefined),
                  followUpSchedule: parseClinicalNotes(prescriptionNotes).followUp.length > 0 ? parseClinicalNotes(prescriptionNotes).followUp : undefined
                }} />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50 rounded-b-xl no-print">
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Close Preview
                </button>
              </div>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    window.focus();
                    window.print();
                  }} 
                  className="px-6 py-2.5 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
                >
                  <Printer className="w-5 h-5" /> Print Only
                </button>
                <button 
                  onClick={async () => {
                    // Print first
                    window.focus();
                    window.print();
                    // Then save which clears the state
                    await handleSavePrescription();
                    setIsPreviewOpen(false);
                  }} 
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <CheckCircle className="w-5 h-5" /> Save & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" /> Prescription History
              </h3>
              <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              {prescriptionHistory.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {prescriptionHistory.map((rx) => (
                    <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{rx.date}</p>
                          <p className="text-xs text-slate-500">Prescribed by {rx.physician}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setCurrentPrescription(rx.items.map((item: any) => ({ ...item, id: "item_" + Date.now() + Math.random() })));
                            setIsHistoryOpen(false);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Re-order
                        </button>
                      </div>
                      <div className="space-y-2">
                        {rx.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                            <span className="font-medium text-slate-800">
                              {typeof item.medication === 'object' 
                                ? (item.medication.name || item.medication.generic_name || "Unknown") 
                                : item.medication}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-600">{item.dosage}, {item.frequency}</span>
                          </div>
                        ))}
                      </div>
                      {rx.notes && (
                        <p className="mt-3 text-xs text-slate-500 italic bg-slate-100 p-2 rounded">
                          Note: {rx.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No prescription history found for this patient.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Medication Modal */}
      {isCustomMedOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" /> Add Custom Medication
              </h3>
              <button onClick={() => setIsCustomMedOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Medication Name *</label>
                <input 
                  type="text" 
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="e.g., Vitamin C"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Form</label>
                  <input 
                    type="text" 
                    value={customMedForm}
                    onChange={(e) => setCustomMedForm(e.target.value)}
                    placeholder="e.g., Tablet"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Concentration</label>
                  <div className="flex gap-1">
                    <input 
                      type="text" 
                      value={customMedConcentration}
                      onChange={(e) => setCustomMedConcentration(e.target.value)}
                      placeholder="e.g., 500mg"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={() => setCalculatorState({
                        isOpen: true,
                        itemId: "CUSTOM",
                        medicationName: customMedName || "Custom Medication",
                        concentration: customMedConcentration || "",
                        form: customMedForm || ""
                      })}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                    >
                      <Calculator className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dosage</label>
                  <input 
                    type="text" 
                    value={customMedDosage}
                    onChange={(e) => setCustomMedDosage(e.target.value)}
                    placeholder="e.g., 1 tab"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Frequency</label>
                  <input 
                    type="text" 
                    value={customMedFrequency}
                    onChange={(e) => setCustomMedFrequency(e.target.value)}
                    placeholder="e.g., BID"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Duration</label>
                  <input 
                    type="text" 
                    value={customMedDuration}
                    onChange={(e) => setCustomMedDuration(e.target.value)}
                    placeholder="e.g., 7 days"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-bold text-slate-700">Clinical Instructions</label>
                  <button
                    onClick={async () => {
                      if (!customMedName || !confirmedDiagnosis) {
                        toast.error("Please enter med name and ensure diagnosis is finalized");
                        return;
                      }
                      try {
                        const prompt = getMedicationInstructionsPrompt(customMedName, {
                          diagnosis: confirmedDiagnosis,
                          dosage: customMedDosage || "Not specified",
                          frequency: customMedFrequency || "Not specified",
                          patientAllergies: selectedPatient?.allergies?.map((a: any) => a.name).join(", ") || "None reported"
                        });
                        const responseText = await clinicalAIRequest([{ role: "user", content: prompt }], aiSettings);
                        if (responseText) setCustomMedInstructions(responseText.trim());
                      } catch (e) {
                        toast.error("Failed to generate instructions");
                      }
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100"
                  >
                    AI Generate
                  </button>
                </div>
                <input 
                  type="text" 
                  value={customMedInstructions}
                  onChange={(e) => setCustomMedInstructions(e.target.value)}
                  placeholder="e.g., Take after meals"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 rounded-b-xl">
              <button 
                onClick={() => setIsCustomMedOpen(false)} 
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (!customMedName.trim()) {
                    toast.error("Please enter a medication name.");
                    return;
                  }
                  handleAddMedication(customMedName.trim(), {
                    name: customMedForm.trim() || "Custom",
                    concentration: customMedConcentration.trim(),
                    dosage: customMedDosage.trim(),
                    frequency: customMedFrequency.trim(),
                    duration: customMedDuration.trim(),
                    instructions: customMedInstructions.trim()
                  });
                  setCustomMedName("");
                  setCustomMedForm("");
                  setCustomMedConcentration("");
                  setCustomMedDosage("");
                  setCustomMedFrequency("");
                  setCustomMedDuration("");
                  setCustomMedInstructions("");
                  setIsCustomMedOpen(false);
                }}
                className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Add to Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{confirmModal.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-slate-700">{confirmModal.message}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Modal */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{promptModal.title}</h3>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-700">{promptModal.message}</p>
              <input 
                type="text"
                autoFocus
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setPromptModal({ ...promptModal, isOpen: false })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  promptModal.onConfirm(promptValue);
                  setPromptModal({ ...promptModal, isOpen: false });
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
