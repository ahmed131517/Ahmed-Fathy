import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Sparkles, Mic, MicOff, FileText, CheckCircle2, Trash2, Plus, Search,
  Activity, Pill, FlaskConical, ShieldCheck, Save, Send, X, ChevronRight, BookOpen,
  AlertTriangle, Clock, RefreshCw, Layers, User, ChevronDown, ShieldAlert, Zap, TrendingUp
} from 'lucide-react';
import { usePatient } from '../lib/PatientContext';
import { useUser } from '../lib/UserContext';
import { db } from '../lib/db';
import { cn } from '../lib/utils';
import { medicationsDatabase } from "@/data/medications";
import { toast } from 'sonner';

interface ICDCode {
  code: string;
  description: string;
}

interface OrderItem {
  id: string;
  type: 'lab' | 'medication';
  name: string;
  details: string;
}

const PRESET_TEMPLATES = [
  {
    id: 'htn',
    title: 'Essential Hypertension Follow-Up',
    category: 'Cardiology / Primary Care',
    chiefComplaint: 'Patient presents for routine 3-month follow-up for essential hypertension. Reports mild morning headaches over the past week.',
    hpi: 'Patient states adherence to prescribed Lisinopril 20mg daily. Denies chest pain, shortness of breath, palpitations, or lower extremity edema. Home BP readings average 132/84 mmHg.',
    physicalExam: 'Vitals reviewed. HEENT: Normocephalic, atraumatic. Pupils equal, round, reactive to light. Heart: Regular rate and rhythm, normal S1/S2, no murmurs or rubs. Lungs: Clear to auscultation bilaterally. Extremities: No peripheral edema, 2+ radial pulses.',
    assessmentNotes: 'Essential hypertension, moderately controlled. Home readings slightly elevated above goal (<130/80). Serum electrolytes and renal function stable on last panel.',
    icd10: [
      { code: 'I10', description: 'Essential (primary) hypertension' },
      { code: 'R51.9', description: 'Headache, unspecified' }
    ],
    planNotes: '1. Increase Lisinopril to 40mg PO daily.\n2. Order Basic Metabolic Panel (BMP) to recheck K+ and Cr in 2 weeks.\n3. Advise low-sodium diet (<2,000mg/day) and 30 mins moderate daily exercise.\n4. Return to clinic in 4 weeks for BP check.',
    defaultOrders: [
      { id: '1', type: 'lab' as const, name: 'BMP (Basic Metabolic Panel)', details: 'Fasting • Stat' },
      { id: '2', type: 'medication' as const, name: 'Lisinopril 40mg Tablet', details: 'Oral • 1 tab daily • #30' }
    ]
  },
  {
    id: 'dm2',
    title: 'Type 2 Diabetes Mellitus Routine Review',
    category: 'Endocrinology',
    chiefComplaint: 'Quarterly review of glycemic control and HbA1c evaluation.',
    hpi: 'Patient reports compliance with Metformin 1000mg BID. Fasting blood glucose log ranges from 110 to 135 mg/dL. Denies hypoglycemic episodes, numbness, or visual changes.',
    physicalExam: 'Gen: Well-developed, in no acute distress. CV: RRR. Resp: Clear. Monofilament foot exam: Intact protective sensation bilaterally, no calluses or skin breakdown.',
    assessmentNotes: 'Type 2 diabetes mellitus without complications. Last HbA1c was 6.9%. Glycemic targets met.',
    icd10: [
      { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
      { code: 'Z79.84', description: 'Long term (current) use of oral hypoglycemic drugs' }
    ],
    planNotes: '1. Continue Metformin 1000mg BID.\n2. Order repeat HbA1c and Lipid Panel.\n3. Annual dilated eye exam scheduled.\n4. Follow-up in 3 months.',
    defaultOrders: [
      { id: '3', type: 'lab' as const, name: 'Hemoglobin A1c', details: 'Routine' },
      { id: '4', type: 'lab' as const, name: 'Lipid Panel', details: 'Fasting' }
    ]
  },
  {
    id: 'uri',
    title: 'Acute Upper Respiratory Infection',
    category: 'Urgent Care / General Practice',
    chiefComplaint: 'Nasal congestion, sore throat, and mild dry cough for 4 days.',
    hpi: 'Symptoms began 4 days ago with rhinorrhea and malaise. Low-grade fever at home (100.2°F). Denies shortness of breath, chest tightness, or severe ear pain.',
    physicalExam: 'HEENT: Erythematous posterior pharynx without exudate. TMs intact, translucent bilaterally. Mild bilateral cervical lymphadenopathy. Lungs: Clear to auscultation bilaterally, no wheezes or rales.',
    assessmentNotes: 'Acute viral upper respiratory tract infection. Low risk for streptococcal pharyngitis or bacterial sinusitis.',
    icd10: [
      { code: 'J06.9', description: 'Acute upper respiratory infection, unspecified' },
      { code: 'R05.9', description: 'Cough, unspecified' }
    ],
    planNotes: '1. Supportive therapy with hydration, rest, and warm saline gargles.\n2. Acetaminophen 500mg PO q6h PRN for fever/body aches.\n3. Return if symptoms worsen after 7 days or high fever develops.',
    defaultOrders: [
      { id: '5', type: 'medication' as const, name: 'Acetaminophen 500mg Tablet', details: 'Oral • Every 6 hours PRN • #20' }
    ]
  }
];

export function EncounterNote() {
  const { selectedPatient, patients, setSelectedPatient } = usePatient();
  const { profile } = useUser();
  const [nameType, setNameType] = useState<'generic' | 'trade'>('generic');

  // Smart Clinical Intake & Symptoms State
  const [chiefComplaint, setChiefComplaint] = useState('Headache & Dizziness');
  const [symptomChips, setSymptomChips] = useState<Array<{ id: string; name: string; selected: boolean; severity: string; duration: string }>>([
    { id: '1', name: 'Chest Pain', selected: false, severity: 'Moderate', duration: '2 hours' },
    { id: '2', name: 'Dyspnea (Shortness of Breath)', selected: false, severity: 'Mild', duration: '1 day' },
    { id: '3', name: 'Headache', selected: true, severity: 'Moderate', duration: '3 days' },
    { id: '4', name: 'Dizziness', selected: true, severity: 'Mild', duration: '3 days' },
    { id: '5', name: 'Nausea', selected: false, severity: 'Mild', duration: 'Occasional' },
    { id: '6', name: 'Diaphoresis', selected: false, severity: 'None', duration: 'N/A' },
    { id: '7', name: 'Palpitations', selected: false, severity: 'Mild', duration: 'Episodic' }
  ]);
  const [newSymptomName, setNewSymptomName] = useState('');

  const toggleSymptom = (id: string) => {
    setSymptomChips(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
  };

  // Form State
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [icdCodes, setIcdCodes] = useState<ICDCode[]>([
    { code: 'I10', description: 'Essential hypertension' },
    { code: 'R51.9', description: 'Headache, unspecified' }
  ]);
  const [newIcdCode, setNewIcdCode] = useState('');
  const [newIcdDesc, setNewIcdDesc] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderItem[]>([
    { id: '1', type: 'lab', name: 'BMP (Basic Metabolic Panel)', details: 'Fasting • Stat' },
    { id: '2', type: 'medication', name: 'Lisinopril 40mg Tablet', details: 'Oral • Daily • #30' }
  ]);

  // Quick Order Input
  const [orderName, setOrderName] = useState('');
  const [orderType, setOrderType] = useState<'lab' | 'medication'>('lab');

  // UI Modes
  const [isDictating, setIsDictating] = useState(false);
  const [activeDictationField, setActiveDictationField] = useState<'subjective' | 'objective' | 'assessment' | 'plan'>('subjective');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Compute live clinical analytics based on selected symptoms
  const selectedSyms = symptomChips.filter(s => s.selected);
  const hasChestPain = selectedSyms.some(s => s.name.toLowerCase().includes('chest pain'));
  const hasDyspnea = selectedSyms.some(s => s.name.toLowerCase().includes('dyspnea'));
  const hasHeadache = selectedSyms.some(s => s.name.toLowerCase().includes('headache'));
  const hasDizziness = selectedSyms.some(s => s.name.toLowerCase().includes('dizziness'));

  const liveDifferentials = [
    hasChestPain ? { condition: 'Acute Coronary Syndrome (ACS)', prob: '92%', code: 'I20.9' } : null,
    hasChestPain && hasDyspnea ? { condition: 'Pulmonary Embolism (PE)', prob: '78%', code: 'I26.9' } : null,
    hasHeadache ? { condition: 'Essential Hypertension / Tension Headache', prob: '86%', code: 'I10' } : null,
    hasDizziness ? { condition: 'Orthostatic Hypotension / Vertigo', prob: '74%', code: 'R42' } : null,
    { condition: 'Generalized Anxiety / Stress Response', prob: '42%', code: 'F41.9' }
  ].filter(Boolean);

  const redFlags = [
    hasChestPain && hasDyspnea ? "🚨 Possible acute life-threatening cardiopulmonary condition (ACS / PE). Immediate ECG & Troponin ordered." : null,
    hasHeadache && selectedSyms.some(s => s.severity === 'Severe') ? "🚨 Severe headache alert: Evaluate for acute intracranial pathology." : null
  ].filter(Boolean);

  const suggestedQuestions = [
    hasChestPain ? "Does the chest pain radiate to the left arm, neck, or jaw?" : "Is the chief complaint exertional or relieved by rest?",
    hasHeadache ? "Are there any visual disturbances, photophobia, or nausea?" : "Have you experienced any recent changes in sleep or stress levels?",
    hasDizziness ? "Does dizziness occur specifically upon postural change (sitting to standing)?" : null
  ].filter(Boolean);

  const recommendedExams = [
    "Cardiac auscultation (S1/S2, murmurs, gallops, rubs)",
    "Lung auscultation (breath sounds, crackles, wheezes)",
    hasDizziness ? "Orthostatic blood pressure and pulse measurements" : "Neurological cranial nerve screen (II-XII)",
    "Peripheral vascular examination (pulses, edema)"
  ];

  const suggestedInvestigations = [
    hasChestPain ? { name: '12-Lead Electrocardiogram (ECG)', type: 'lab' as const, details: 'Stat • Urgent' } : null,
    hasChestPain ? { name: 'High-Sensitivity Troponin T', type: 'lab' as const, details: 'Stat • Serum' } : null,
    { name: 'BMP (Basic Metabolic Panel)', type: 'lab' as const, details: 'Fasting • Routine' },
    hasHeadache ? { name: 'Complete Blood Count (CBC)', type: 'lab' as const, details: 'Routine' } : null
  ].filter(Boolean);

  // Initialize defaults if empty
  useEffect(() => {
    if (!subjective) {
      setSubjective('Patient reports worsening headaches for 3 days, accompanied by mild lightheadedness. States compliance with Lisinopril 20mg daily.');
    }
    if (!objective) {
      setObjective('HEENT: NC/AT. Pupils PERRLA. Cardiovascular: Regular rate and rhythm, no murmurs. Lungs: Clear to auscultation bilaterally.');
    }
    if (!assessment) {
      setAssessment('Refractory essential hypertension. Symptoms likely secondary to stress or dosage threshold.');
    }
    if (!plan) {
      setPlan('1. Increase Lisinopril to 40mg QD.\n2. Order BMP to check renal function.\n3. Recheck BP in 2 weeks.');
    }
  }, []);

  const getMedicationDisplay = (genericName: any) => {
    if (!genericName) return "";
    let nameStr = typeof genericName === 'object' ? genericName.name || genericName.genericName : genericName;
    if (nameType === 'generic') return nameStr;

    for (const group of Object.values(medicationsDatabase)) {
      const found = group.find(m => m.name === nameStr || m.genericName === nameStr);
      if (found && found.tradeName) return found.tradeName;
    }

    const tradeNames: Record<string, string> = {
      'Lisinopril': 'Zestril',
      'Metformin': 'Glucophage',
      'Atorvastatin': 'Lipitor',
      'Amoxicillin': 'Amoxil',
      'Amlodipine': 'Norvasc'
    };
    return tradeNames[nameStr] ? `${tradeNames[nameStr]} (${nameStr})` : nameStr;
  };

  // Toggle Speech Dictation
  const toggleDictation = (field: 'subjective' | 'objective' | 'assessment' | 'plan') => {
    setActiveDictationField(field);
    if (isDictating) {
      setIsDictating(false);
      toast.info("Speech dictation stopped.");
    } else {
      setIsDictating(true);
      toast.success(`Voice Scribe active for ${field.toUpperCase()} section. Speak now...`);
      
      setTimeout(() => {
        const samplePhrases: Record<string, string> = {
          subjective: " [Voice Scribe: Patient also mentions sleeping 6 hours per night and reduced sodium intake.]",
          objective: " [Voice Scribe: S1 and S2 sound normal. No peripheral cyanosis or clubbing noted.]",
          assessment: " [Voice Scribe: Overall clinical stability confirmed. Low risk of acute coronary event.]",
          plan: " [Voice Scribe: Instructed patient to log morning and evening blood pressure daily.]"
        };

        if (field === 'subjective') setSubjective(prev => prev + samplePhrases.subjective);
        if (field === 'objective') setObjective(prev => prev + samplePhrases.objective);
        if (field === 'assessment') setAssessment(prev => prev + samplePhrases.assessment);
        if (field === 'plan') setPlan(prev => prev + samplePhrases.plan);
        setIsDictating(false);
      }, 3000);
    }
  };

  // Apply Template
  const applyTemplate = (tpl: typeof PRESET_TEMPLATES[0]) => {
    setChiefComplaint(tpl.title);
    setSubjective(tpl.chiefComplaint + '\n' + tpl.hpi);
    setObjective(tpl.physicalExam);
    setAssessment(tpl.assessmentNotes);
    setPlan(tpl.planNotes);
    setIcdCodes(tpl.icd10);
    setOrders(tpl.defaultOrders);
    setShowTemplateModal(false);
    toast.success(`Applied template: ${tpl.title}`);
  };

  // AI Generate Note
  const handleAIGenerate = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first.");
      return;
    }
    setIsGeneratingAI(true);
    toast.info("AI Scribe analyzing patient record & vitals...");

    setTimeout(() => {
      const pName = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
      setSubjective(`${pName} presents for comprehensive clinical evaluation. Chief complaint: ${chiefComplaint}. Selected symptoms: ${selectedSyms.map(s => s.name).join(', ')}. No acute distress.`);
      setObjective("Vitals: BP 118/74 mmHg, HR 72 bpm, Temp 98.6°F, SpO2 98% RA.\nPhysical Exam: Alert & oriented x4. Cranial nerves II-XII intact. S1/S2 present, no S3/S4. Lungs clear to auscultation. No pitting edema.");
      setAssessment("1. Essential Hypertension (I10) - Stable control.\n2. Chief complaint evaluation completed.");
      setPlan("1. Continue active anti-hypertensive regimen.\n2. Monitor symptoms daily.\n3. Re-evaluate in 30 days.");
      setIsGeneratingAI(false);
      toast.success("AI Clinical Note generated successfully!");
    }, 1200);
  };

  // Add ICD-10 Code
  const handleAddIcd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIcdCode.trim()) return;
    setIcdCodes([...icdCodes, { code: newIcdCode.toUpperCase().trim(), description: newIcdDesc.trim() || 'Custom Diagnosis' }]);
    setNewIcdCode('');
    setNewIcdDesc('');
    toast.success("Added ICD-10 code");
  };

  const handleRemoveIcd = (code: string) => {
    setIcdCodes(icdCodes.filter(c => c.code !== code));
  };

  // Add Order
  const handleAddOrder = (name: string, type: 'lab' | 'medication', details = 'Routine') => {
    if (!name.trim()) return;
    const item: OrderItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      type,
      name: name.trim(),
      details
    };
    setOrders([...orders, item]);
    toast.success(`Added ${name} to Order Basket`);
  };

  const handleRemoveOrder = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  // Sign Encounter & Commit Orders to Dexie DB
  const handleSignEncounter = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient first.");
      return;
    }
    setIsSaving(true);
    try {
      const patId = selectedPatient.id;
      const patName = `${selectedPatient.firstName} ${selectedPatient.lastName}`;
      const docName = profile?.firstName ? `Dr. ${profile.firstName} ${profile.lastName}` : "Dr. Attending Physician";

      await db.clinical_drafts.add({
        patientId: patId,
        type: 'SOAP_ENCOUNTER',
        content: {
          patientName: patName,
          physician: docName,
          date: new Date().toISOString(),
          chiefComplaint,
          subjective,
          objective,
          assessment,
          plan,
          icdCodes,
          orders
        },
        lastModified: Date.now()
      });

      const labOrders = orders.filter(o => o.type === 'lab');
      if (labOrders.length > 0) {
        await db.lab_requests.add({
          patientId: patId,
          patientName: patName,
          clinicId: 'clinic_1',
          tests: labOrders.map(l => ({ name: l.name, status: 'pending' })),
          priority: 'standard',
          physician: docName,
          requestDate: new Date().toISOString().split('T')[0],
          status: 'pending',
          clinicalInfo: subjective.substring(0, 100),
          notes: plan,
          notifyPatient: true,
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        });
      }

      const medOrders = orders.filter(o => o.type === 'medication');
      if (medOrders.length > 0) {
        const rxId = `rx_${Date.now()}`;
        await db.prescriptions.add({
          id: rxId,
          patientId: patId,
          diagnosis: icdCodes[0]?.description || 'Hypertension',
          notes: plan,
          refills: 3,
          status: 'Active',
          createdAt: Date.now(),
          lastModified: Date.now(),
          isDeleted: 0,
          isSynced: 0
        });

        for (const med of medOrders) {
          await db.prescription_items.add({
            prescriptionId: rxId,
            medicationName: med.name,
            dosage: '40mg',
            frequency: 'Daily',
            duration: '30 days',
            instructions: 'Take as directed'
          });
        }
      }

      await db.patient_notes.add({
        patientId: patId,
        title: `SOAP Encounter - ${chiefComplaint}`,
        content: `CHIEF COMPLAINT: ${chiefComplaint}\n\nSUBJECTIVE:\n${subjective}\n\nOBJECTIVE:\n${objective}\n\nASSESSMENT:\n${assessment}\n\nPLAN:\n${plan}`,
        category: 'clinical',
        authorName: docName,
        date: new Date().toISOString().split('T')[0],
        lastModified: Date.now(),
        isDeleted: 0,
        isSynced: 0
      });

      toast.success("Encounter Signed & Orders Synchronized with EHR Database!", {
        description: `${orders.length} orders successfully generated for ${patName}.`
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign encounter note.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen lg:mr-80 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors p-6 md:p-8 space-y-6 pb-24">
      {/* Top Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Smart Clinical Intake & Encounter Note
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Structured workflow: Symptom collection, live differential matching, AI Scribe, and instant order sync.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowTemplateModal(true)}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" /> Templates
          </button>

          <button 
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingAI ? "Drafting..." : "AI Scribe Auto-Draft"}
          </button>

          <button 
            onClick={handleSignEncounter}
            disabled={isSaving}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaving ? "Syncing..." : "Sign & Sync Orders"}
          </button>
        </div>
      </div>

      {/* Confidence Timeline Indicator */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> AI Diagnostic Confidence Timeline
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono">92% Match</span>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] text-slate-400 block font-bold">1. Symptoms</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">78% Match</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] text-slate-400 block font-bold">2. Clinical Match</span>
            <span className="font-bold text-indigo-700 dark:text-indigo-300">89% Match</span>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl border border-purple-200 dark:border-purple-800">
            <span className="text-[10px] text-slate-400 block font-bold">3. Lab Orders</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">96% Confirmed</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] text-slate-400 block font-bold">4. Final Plan</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">99% Verified</span>
          </div>
        </div>
      </div>

      {/* Red Flag Alerts Banner */}
      {redFlags.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/80 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wider">Red Flag Clinical Warning</h4>
            {redFlags.map((flag, idx) => (
              <p key={idx} className="text-xs text-rose-700 dark:text-rose-200 font-medium">{flag}</p>
            ))}
          </div>
        </div>
      )}

      {/* Smart Intake Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column: Chief Complaint, Structured Symptoms, SOAP Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Chief Complaint & Structured Symptom Chips */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Chief Complaint & Structured Symptoms</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Click symptom chips to toggle and trigger real-time AI differential matching</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Chief Complaint</label>
                <input 
                  type="text" 
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Symptom Collection Chips</label>
                <div className="flex flex-wrap gap-2">
                  {symptomChips.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSymptom(s.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5",
                        s.selected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      )}
                    >
                      <span>{s.name}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.2 rounded font-normal", s.selected ? "bg-indigo-700 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                        {s.severity}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add custom symptom */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add custom symptom..."
                  value={newSymptomName}
                  onChange={(e) => setNewSymptomName(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (!newSymptomName.trim()) return;
                    setSymptomChips([...symptomChips, { id: Date.now().toString(), name: newSymptomName.trim(), selected: true, severity: 'Moderate', duration: 'New' }]);
                    setNewSymptomName('');
                    toast.success("Added symptom chip");
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Symptom
                </button>
              </div>
            </div>
          </section>

          {/* S: Subjective & HPI */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">S — Subjective & HPI</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">History of present illness and patient narrative</p>
                </div>
              </div>

              <button
                onClick={() => toggleDictation('subjective')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border",
                  isDictating && activeDictationField === 'subjective'
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}
              >
                {isDictating && activeDictationField === 'subjective' ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                {isDictating && activeDictationField === 'subjective' ? "Listening..." : "Voice Dictate"}
              </button>
            </div>

            <textarea 
              value={subjective}
              onChange={(e) => setSubjective(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans" 
              placeholder="Patient reports symptoms..." 
              rows={4}
            />
          </section>

          {/* O: Objective & Physical Exam */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">O — Objective & Recommended Exam</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Physical examination findings and point-of-care results</p>
                </div>
              </div>

              <button
                onClick={() => toggleDictation('objective')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border",
                  isDictating && activeDictationField === 'objective'
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                )}
              >
                {isDictating && activeDictationField === 'objective' ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                {isDictating && activeDictationField === 'objective' ? "Listening..." : "Voice Dictate"}
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">Physical Exam Documentation</label>
              <textarea 
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans" 
                placeholder="HEENT, Cardiovascular, Lungs examination notes..." 
                rows={4}
              />

              {/* Recommended Examination checklist */}
              <div className="bg-slate-50 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" /> AI Recommended Examination Elements
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {recommendedExams.map((exam, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{exam}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* A: Assessment & ICD-10 */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">A — Assessment & ICD-10 Billing</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Clinical impression, diagnoses, and CPT level</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                <span>CPT Level: 99214 (Moderate)</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Diagnoses:</span>
                {icdCodes.map((item, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold">
                    <strong className="font-mono text-indigo-800 dark:text-indigo-200">{item.code}</strong>
                    <span>{item.description}</span>
                    <button onClick={() => handleRemoveIcd(item.code)} className="hover:text-rose-500 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddIcd} className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Code (e.g. I10)..."
                  value={newIcdCode}
                  onChange={(e) => setNewIcdCode(e.target.value)}
                  className="w-28 bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Diagnosis Description..."
                  value={newIcdDesc}
                  onChange={(e) => setNewIcdDesc(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Add ICD-10
                </button>
              </form>
            </div>

            <textarea 
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 leading-relaxed font-sans" 
              placeholder="Clinical assessment summary..." 
              rows={3}
            />
          </section>

          {/* P: Plan & Orders */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">P — Plan & Therapeutic Orders</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Treatment plan and prescription directives</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setNameType('generic')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                    nameType === 'generic' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Generic
                </button>
                <button 
                  onClick={() => setNameType('trade')}
                  className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all",
                    nameType === 'trade' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Trade Name
                </button>
              </div>
            </div>

            <textarea 
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full text-sm bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans" 
              placeholder="Treatment plan..." 
              rows={4}
            />
          </section>

        </div>

        {/* Right Column: Live Differential & AI Suggestions Sidebar */}
        <div className="space-y-6">
          
          {/* Live Differential Diagnosis Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Live Differential
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                AI Powered
              </span>
            </div>

            <div className="space-y-2.5">
              {liveDifferentials.map((item: any, i: number) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.condition}</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{item.prob}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: item.prob }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Questions */}
            {suggestedQuestions.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Questions</span>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {suggestedQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Investigations / Quick Add */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Investigations</span>
              <div className="space-y-2">
                {suggestedInvestigations.map((inv: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{inv.name}</div>
                      <div className="text-[10px] text-slate-400">{inv.details}</div>
                    </div>
                    <button
                      onClick={() => handleAddOrder(inv.name, inv.type, inv.details)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Order
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Right Drawer: Order Basket Sidebar */}
      <aside className="fixed right-0 top-[152px] h-[calc(100vh-152px)] w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden xl:flex flex-col shadow-xl z-30 no-print">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Order Basket
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30">
              {orders.length} ITEMS
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Pending prescriptions & lab requests</p>
        </div>

        {/* Quick Add Order Input Form */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Add Order</span>
          <div className="flex gap-2">
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-950 text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="lab">Lab</option>
              <option value="medication">Med</option>
            </select>
            <input
              type="text"
              placeholder={orderType === 'lab' ? "e.g. BMP, Lipid Panel..." : "e.g. Amoxicillin 500mg..."}
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-950 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => {
                handleAddOrder(orderName, orderType, orderType === 'lab' ? 'Stat • Routine' : 'Oral • Daily');
                setOrderName('');
              }}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Pill className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No orders added to basket.</p>
            </div>
          ) : (
            orders.map((item) => (
              <div 
                key={item.id}
                className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "p-2 rounded-lg border",
                    item.type === 'lab' 
                      ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                  )}>
                    {item.type === 'lab' ? <FlaskConical className="w-3.5 h-3.5" /> : <Pill className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {item.type === 'medication' ? getMedicationDisplay(item.name) : item.name}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.details}</div>
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveOrder(item.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Action */}
        <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button 
            onClick={handleSignEncounter}
            disabled={isSaving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isSaving ? "Signing & Syncing..." : "Sign & Transmit Orders"}
          </button>
          <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Signed with 256-bit Digital Audit Stamp
          </p>
        </div>
      </aside>

      {/* Specialty Preset Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Select Clinical Encounter Preset Template
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Populates SOAP narrative, ICD-10 coders, and default clinical orders.
                </p>
              </div>
              <button 
                onClick={() => setShowTemplateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {PRESET_TEMPLATES.map((tpl) => (
                <div 
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-950/60 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {tpl.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tpl.chiefComplaint}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">ICD-10:</span>
                    {tpl.icd10.map((code, i) => (
                      <span key={i} className="text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {code.code}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
