import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Eye, Wind, Heart, Activity, Move, Cpu, Feather as FeatherIcon, Clipboard, Save, Check, Thermometer, Droplets, Scale, Ruler, Mic, Sparkles, FileText, RefreshCw, CheckCircle2, AlertCircle, Camera, Trash2, CheckCircle, ChevronDown, ChevronUp, Edit2, X, Plus, AlertTriangle, Stethoscope, Ear, Hand, Info, Maximize2, Minimize2, MapPin, TrendingUp, History, Baby, Zap, ArrowRight, Calculator, ShieldAlert } from "lucide-react";
import { clinicalAIRequest } from "../services/aiWorkflowService";
import { useAISettings } from "../lib/AISettingsContext";
import { cn } from "@/lib/utils";
import { CheckboxFindings } from "@/components/physical-exam/CheckboxFindings";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ExaminationGuidance } from "@/components/physical-exam/ExaminationGuidance";
import { FindingsAnalyzer } from "@/components/physical-exam/FindingsAnalyzer";
import { JointBodyMap } from "./msk/JointBodyMap";
import { JointExamCard } from "./msk/JointExamCard";
import { AIDifferentialGenerator } from "@/components/physical-exam/AIDifferentialGenerator";
import { AnatomicalBodyMap, BodyPin } from "@/components/physical-exam/AnatomicalBodyMap";
import { LongitudinalMatrix } from "@/components/physical-exam/LongitudinalMatrix";
import { DemographicExamAdaptive } from "@/components/physical-exam/DemographicExamAdaptive";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { usePatient } from "@/lib/PatientContext";
import { useSymptom } from "@/lib/SymptomContext";

interface SectionHeaderProps {
  title: string;
  onMarkNormal: () => void;
  onClear: () => void;
}

function SectionHeader({ title, onMarkNormal, onClear }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 mt-2">
      <h4 className="font-semibold text-base text-slate-900">{title}</h4>
      <div className="flex gap-2">
        <button 
          onClick={onMarkNormal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm"
        >
          <CheckCircle className="w-3.5 h-3.5" /> All Normal
        </button>
        <button 
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import heartImage from "@/assets/heart.png";
import chestImage from "@/assets/lungs.png";
import abdomenImage from "@/assets/abdomen.png";

const lungRegions = [
  { id: 'right-upper', label: 'Right Upper Lobe', x: '65%', y: '30%' },
  { id: 'right-middle', label: 'Right Middle Lobe', x: '65%', y: '50%' },
  { id: 'right-lower', label: 'Right Lower Lobe', x: '65%', y: '70%' },
  { id: 'left-upper', label: 'Left Upper Lobe', x: '35%', y: '35%' },
  { id: 'left-lower', label: 'Left Lower Lobe', x: '35%', y: '65%' },
];

const giRegions = [
  { id: 'ruq', label: 'Right Upper Quadrant' },
  { id: 'luq', label: 'Left Upper Quadrant' },
  { id: 'rlq', label: 'Right Lower Quadrant' },
  { id: 'llq', label: 'Left Lower Quadrant' },
  { id: 'epigastric', label: 'Epigastric' },
];

const msRegions = [
  { id: 'cervical', label: 'Cervical Spine' },
  { id: 'thoracic', label: 'Thoracic Spine' },
  { id: 'lumbar', label: 'Lumbar Spine' },
  { id: 'upper-extremities', label: 'Upper Extremities' },
  { id: 'lower-extremities', label: 'Lower Extremities' },
];

const cranialNerves = [
  { id: "cn1", name: "CN I", fn: "Olfactory" },
  { id: "cn2", name: "CN II", fn: "Optic" },
  { id: "cn3", name: "CN III", fn: "Oculomotor" },
  { id: "cn4", name: "CN IV", fn: "Trochlear" },
  { id: "cn5", name: "CN V", fn: "Trigeminal" },
  { id: "cn6", name: "CN VI", fn: "Abducent" },
  { id: "cn7", name: "CN VII", fn: "Facial" },
  { id: "cn8", name: "CN VIII", fn: "Vestibulocochlear" },
  { id: "cn9", name: "CN IX", fn: "Glossopharyngeal" },
  { id: "cn10", name: "CN X", fn: "Vagus" },
  { id: "cn11", name: "CN XI", fn: "Accessory" },
  { id: "cn12", name: "CN XII", fn: "Hypoglossal" },
];

const powerMuscles = [
  { label: "Shoulder Abduction (C5)", id: "shoulder" },
  { label: "Elbow Flexion (C5-6)", id: "elbow-flex" },
  { label: "Elbow Extension (C7-8)", id: "elbow-ext" },
  { label: "Wrist Extension (C6-7)", id: "wrist" },
  { label: "Finger Abduction (T1)", id: "finger-abd" },
  { label: "Grip Strength / Finger Flexion (C8)", id: "grip" },
  { label: "Hip Flexion (L2-3)", id: "hip-flex" },
  { label: "Hip Abduction (L4-S1)", id: "hip-abd" },
  { label: "Knee Extension (L3-4)", id: "knee-ext" },
  { label: "Knee Flexion (L5-S2)", id: "knee-flex" },
  { label: "Ankle Dorsiflexion (L4-5)", id: "ankle-df" },
  { label: "Great Toe Extension (L5)", id: "toe-ext" },
  { label: "Ankle Plantarflexion (S1)", id: "ankle-pf" },
];

const reflexes = [
  { label: "Biceps (C5-6)", id: "biceps" },
  { label: "Brachioradialis (C5-6)", id: "brach" },
  { label: "Triceps (C7-8)", id: "triceps" },
  { label: "Patellar (L3-4)", id: "patellar" },
  { label: "Achilles (S1-2)", id: "achilles" },
  { label: "Supinator (C5-6)", id: "supinator" },
];

const sensoryModalities = [
  { label: "Light Touch", id: "light-touch" },
  { label: "Pain / Pinprick", id: "pain" },
  { label: "Temperature", id: "temperature" },
  { label: "Vibration (128Hz)", id: "vibration" },
  { label: "Proprioception (Joint Position)", id: "proprioception" },
  { label: "Two-point Discrimination", id: "two-point" },
  { label: "Point Localization", id: "point-loc" },
];

const powerOptions = ["5/5", "4/5", "3/5", "2/5", "1/5", "0/5"];
const reflexOptions = ["2+ (Normal)", "0 (Absent)", "1+ (Hypo)", "3+ (Brisk)", "4+ (Clonus)"];
const sensoryOptions = ["Normal", "Decreased (Hypesthesia)", "Absent (Anesthesia)", "Increased (Hyperesthesia)", "Paresthesia", "Dysesthesia"];

interface Lesion {
  id: number;
  morphology: string;
  location: string;
  length: string;
  width: string;
  color: string;
  borders: string;
  secondaryFeatures: string[];
  abcde: string[];
  description: string;
}

const morphologyOptions = [
  { v: "macule", l: "Macule (<1cm, flat)" },
  { v: "patch", l: "Patch (>1cm, flat)" },
  { v: "papule", l: "Papule (<1cm, raised)" },
  { v: "plaque", l: "Plaque (>1cm, raised)" },
  { v: "nodule", l: "Nodule (>1cm, deep)" },
  { v: "vesicle", l: "Vesicle (<1cm, fluid)" },
  { v: "bulla", l: "Bulla (>1cm, fluid)" },
  { v: "pustule", l: "Pustule (pus-filled)" },
  { v: "wheal", l: "Wheal (urticarial)" },
  { v: "cyst", l: "Cyst (encapsulated)" },
  { v: "ulcer", l: "Ulcer (loss of epidermis)" },
];

const secondaryFeatureOptions = [
  { id: "scaling", label: "Scaling" },
  { id: "crusting", label: "Crusting" },
  { id: "atrophy", label: "Atrophy" },
  { id: "excoriation", label: "Excoriation" },
  { id: "lichenification", label: "Lichenification" },
  { id: "telangiectasia", label: "Telangiectasia" },
];

const abcdeLabels = [
  { id: "A", label: "A", title: "Asymmetry" },
  { id: "B", label: "B", title: "Border Irregularity" },
  { id: "C", label: "C", title: "Color Variegation" },
  { id: "D", label: "D", title: "Diameter > 6mm" },
  { id: "E", label: "E", title: "Evolution / Evolving" },
];

const specialTests: Record<string, string[]> = {
  'Shoulder (L)': ['Hawkins-Kennedy', 'Neer Sign', 'Empty Can', 'Belly Press', 'Apprehension Test', 'Drop Arm'],
  'Shoulder (R)': ['Hawkins-Kennedy', 'Neer Sign', 'Empty Can', 'Belly Press', 'Apprehension Test', 'Drop Arm'],
  'Elbow (L)': ['Tennis Elbow Test', 'Golfer Elbow Test', 'Cozen Test', 'Mill Test'],
  'Elbow (R)': ['Tennis Elbow Test', 'Golfer Elbow Test', 'Cozen Test', 'Mill Test'],
  'Wrist (L)': ['Phalen Test', 'Tinel Sign', 'Finkelstein Test', 'Watson Shift'],
  'Wrist (R)': ['Phalen Test', 'Tinel Sign', 'Finkelstein Test', 'Watson Shift'],
  'Hip (L)': ['Thomas Test', 'Trendelenburg Sign', 'FABER Test', 'Log Roll', 'Scour Test'],
  'Hip (R)': ['Thomas Test', 'Trendelenburg Sign', 'FABER Test', 'Log Roll', 'Scour Test'],
  'Knee (L)': ['Lachman Test', 'Anterior Drawer', 'Posterior Drawer', 'McMurray Test', 'Patellar Tap', 'Valgus Stress', 'Varus Stress'],
  'Knee (R)': ['Lachman Test', 'Anterior Drawer', 'Posterior Drawer', 'McMurray Test', 'Patellar Tap', 'Valgus Stress', 'Varus Stress'],
  'Ankle (L)': ['Anterior Drawer', 'Talar Tilt', 'Thompson Test', 'Squeeze Test'],
  'Ankle (R)': ['Anterior Drawer', 'Talar Tilt', 'Thompson Test', 'Squeeze Test'],
  'Cervical Spine': ['Spurling Test', 'Lhermitte Sign', 'Distraction Test'],
  'Lumbar Spine': ['Straight Leg Raise', 'Schober Test', 'Slump Test', 'Bragard Sign'],
  'TMJ': ['Opening Range', 'Lateral Deviation', 'Palpable Click'],
  'SI Joint': ['Gaenslen Test', 'Patrick (FABER) Test', 'Thigh Thrust'],
};

export interface JointExam {
  id: number;
  joint: string;
  rom: string;
  stability: string;
  inspection: string[];
  palpation: string[];
  specialTestResults: string[];
  notes: string;
}

const respSmartPhrases = [
  { label: "CTA Bilat", text: "Lungs CTA (Clear To Auscultation) bilaterally." },
  { label: "No Adventitious", text: "No wheezes, rales, or rhonchi noted." },
  { label: "Normal Effort", text: "Normal respiratory effort without accessory muscle use." },
  { label: "RUL Crackles", text: "Fine crackles noted in RUL." },
  { label: "LUL Wheezes", text: "Expiratory wheezes noted in LUL." },
  { label: "Decreased BS RLL", text: "Decreased breath sounds in RLL." },
];

const mskSmartPhrases = [
  { label: "Normal GALS", text: "GALS screen normal. Normal gait, posture, and joint ROM." },
  { label: "No Effusion", text: "No joint effusions or swelling noted." },
  { label: "Full ROM", text: "Full range of motion in all major joints without pain." },
  { label: "Strength 5/5", text: "Muscle strength 5/5 in all major muscle groups bilaterally." },
  { label: "NV Intact", text: "Neurovascular status intact: distal pulses 2+, sensation normal, cap refill < 2s." },
];

const neuroSmartPhrases = [
  { label: "CN II-XII Intact", text: "Cranial nerves II-XII grossly intact." },
  { label: "Normal Tone", text: "Normal muscle tone and bulk throughout." },
  { label: "Sensory Intact", text: "Sensation to light touch and pinprick intact in all dermatomes." },
  { label: "Reflexes 2+", text: "Deep tendon reflexes 2+ and symmetric throughout." },
  { label: "Coordination NL", text: "Coordination normal: finger-to-nose and heel-to-shin intact." },
  { label: "Negative Babinski", text: "Plantar response flexor bilaterally (Negative Babinski)." },
];


const tabs = [
  { id: 'general', name: 'General', icon: UserCheck },
  { id: 'heent', name: 'HEENT & Neck', icon: Stethoscope },
  { id: 'sse', name: 'Specialized Sensory Exam (SSE)', icon: Eye },
  { id: 'respiratory', name: 'Respiratory', icon: Wind },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: Heart },
  { id: 'gastrointestinal', name: 'Gastrointestinal', icon: Activity },
  { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Move },
  { id: 'neurological', name: 'Neurological', icon: Cpu },
  { id: 'skin', name: 'Skin', icon: FeatherIcon },
  { id: 'psychiatric', name: 'Psychiatric', icon: Sparkles },
  { id: 'body-map', name: 'Anatomical Body Map', icon: MapPin },
  { id: 'longitudinal', name: 'Longitudinal Matrix', icon: History },
  { id: 'adaptive-demo', name: 'Demographic Normals', icon: Baby },
];

// Full SSE mapping from heent-module.js
const sseMapping: Record<string, any> = {
  'head': { title: 'Head', normal: 'Normocephalic, atraumatic', options: [
    { id: 'head-hematoma', text: 'Hematoma', type: 'checkbox' },
    { id: 'head-laceration', text: 'Laceration', type: 'checkbox' },
    { id: 'head-tenderness', text: 'Tenderness', type: 'checkbox' },
  ]},
  'head-hair': { title: 'Hair', normal: 'Normal distribution', options: [
    { id: 'hair-thinning', text: 'Thinning', type: 'checkbox' },
    { id: 'hair-alopecia', text: 'Alopecia', type: 'checkbox' },
  ]},
  'sinus-frontal': { title: 'Frontal Sinus', normal: 'Non-tender', options: [
    { id: 'sinus-frontal-tender', text: 'Tenderness', type: 'select', values: ['Mild', 'Moderate', 'Severe'] },
  ]},
  'sinus-maxillary': { title: 'Maxillary Sinus', normal: 'Non-tender', options: [
    { id: 'sinus-maxillary-tender', text: 'Tenderness', type: 'select', values: ['Mild', 'Moderate', 'Severe'] },
  ]},
  'eyes-pupils': { title: 'Pupils', normal: 'PERRLA', options: [
    { id: 'pupils-sluggish', text: 'Sluggish reaction', type: 'checkbox' },
    { id: 'pupils-nonreactive', text: 'Non-reactive', type: 'checkbox' },
    { id: 'pupils-anisocoria', text: 'Anisocoria', type: 'checkbox' },
  ]},
  'eyes-eom': { title: 'EOM', normal: 'Intact', options: [
    { id: 'eom-restricted', text: 'Restricted movement', type: 'checkbox', bilateral: true },
  ]},
  'eyes-conjunctiva': { title: 'Conjunctiva', normal: 'Clear', options: [
    { id: 'conj-injection', text: 'Injection', type: 'checkbox', bilateral: true },
    { id: 'conj-pallor', text: 'Pallor', type: 'checkbox', bilateral: true },
  ]},
  'eyes-sclera': { title: 'Sclera', normal: 'Clear', options: [
    { id: 'sclera-icterus', text: 'Icterus', type: 'checkbox' },
  ]},
  'eyes-vf': { title: 'Visual Fields', normal: 'Intact', options: [
    { id: 'vf-deficit', text: 'Deficit', type: 'checkbox' },
  ]},
  'ears-canals': { title: 'Canals', normal: 'Clear', options: [
    { id: 'ears-discharge', text: 'Discharge', type: 'select', values: ['Serous', 'Purulent', 'Bloody', 'Mucoid'], bilateral: true },
    { id: 'ears-erythema-canals', text: 'Erythema', type: 'checkbox', bilateral: true },
  ]},
  'ears-tms': { title: 'TMs', normal: 'Normal light reflex', options: [
    { id: 'tm-erythema', text: 'Erythema', type: 'checkbox', bilateral: true },
    { id: 'tm-cerumen', text: 'Cerumen', type: 'checkbox', bilateral: true },
    { id: 'tm-bulging', text: 'Bulging', type: 'checkbox', bilateral: true },
  ]},
  'ears-pinna': { title: 'Pinna/Tragus', normal: 'Non-tender', options: [
    { id: 'pinna-tender', text: 'Tenderness', type: 'checkbox', bilateral: true },
  ]},
  'nose-patency': { title: 'Nose', normal: 'Patent', options: [
    { id: 'nose-discharge', text: 'Discharge', type: 'select', values: ['Serous', 'Purulent', 'Bloody'] },
    { id: 'nose-congestion', text: 'Congestion', type: 'checkbox' },
  ]},
  'throat-op': { title: 'Oropharynx', normal: 'Clear', options: [
    { id: 'op-erythema', text: 'Erythema', type: 'checkbox' },
    { id: 'op-thrush', text: 'Thrush', type: 'checkbox' },
    { id: 'op-exudate', text: 'Exudate', type: 'checkbox' },
  ]},
  'throat-mucosa': { title: 'Mucosa', normal: 'Moist', options: [
    { id: 'mucosa-dry', text: 'Dry', type: 'checkbox' },
  ]},
  'throat-tonsils': { title: 'Tonsils', normal: 'Normal', options: [
    { id: 'tonsil-grade', text: 'Tonsil Grade', type: 'tonsil' },
  ]},
  'neck-rom': { title: 'Neck/ROM', normal: 'Supple', options: [
    { id: 'neck-meningismus', text: 'Meningismus', type: 'checkbox' },
    { id: 'neck-rom-limited', text: 'Limited ROM', type: 'compass' },
  ]},
  'neck-trachea': { title: 'Trachea', normal: 'Midline', options: [
    { id: 'trachea-deviated', text: 'Deviated', type: 'checkbox' },
  ]},
  'neck-thyroid': { title: 'Thyroid', normal: 'Normal', options: [
    { id: 'thyroid-enlarged', text: 'Enlarged', type: 'checkbox' },
    { id: 'thyroid-nodular', text: 'Nodular', type: 'checkbox' },
    { id: 'thyroid-tender', text: 'Tender', type: 'checkbox' },
  ]},
  'neck-lymph': { title: 'Lymph Nodes', normal: 'No lymphadenopathy', options: [
    { id: 'lymph-supraclav', text: 'Supraclavicular', type: 'checkbox' },
    { id: 'lymph-cervical', text: 'Cervical', type: 'checkbox' },
  ]},
  'neck-carotids': { title: 'Carotids', normal: 'No bruits', options: [
    { id: 'carotid-bruit', text: 'Bruit', type: 'checkbox', bilateral: true },
  ]},
};

const sseSections = [
  { key: "head", title: "Head & Sinuses", parts: ["head", "head-hair", "sinus-frontal", "sinus-maxillary"] },
  { key: "eyes", title: "Eyes & Vision", parts: ["eyes-pupils", "eyes-eom", "eyes-conjunctiva", "eyes-sclera", "eyes-vf"] },
  { key: "ears", title: "Ears & Hearing", parts: ["ears-canals", "ears-tms", "ears-pinna"] },
  { key: "noseMouth", title: "Nose & Mouth", parts: ["nose-patency", "throat-op", "throat-mucosa", "throat-tonsils"] },
  { key: "neck", title: "Neck & Thyroid", parts: ["neck-rom", "neck-trachea", "neck-thyroid", "neck-lymph", "neck-carotids"] },
];

const smartPhrases = [
  { label: "No Lymph", text: "No cervical lymphadenopathy." },
  { label: "OP Clear", text: "Oropharynx clear without exudate or erythema." },
  { label: "TMs Normal", text: "TMs clear with normal light reflex bilaterally." },
  { label: "PERRLA", text: "Pupils equal, round, reactive to light and accommodation." },
];

export function MusculoskeletalTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    galsScreen,
    gaitPosture,
    mrcUpper,
    mrcLower,
    nvStatus,
    jointExams,
    notes
  } = findings;

  const [selectedJoint, setSelectedJoint] = useState("");

  const addJoint = (joint?: string) => {
    const j = joint || selectedJoint;
    if (!j) return;
    const newJoint: JointExam = {
      id: Date.now(), joint: j, rom: "normal", stability: "stable",
      inspection: [], palpation: [], specialTestResults: [], notes: ""
    };
    onChange('jointExams', [...(jointExams || []), newJoint]);
    setSelectedJoint("");
  };

  const removeJoint = (id: number) => {
    onChange('jointExams', (jointExams || []).filter((j: JointExam) => j.id !== id));
  };

  const updateJoint = (id: number, field: keyof JointExam, value: any) => {
    onChange('jointExams', (jointExams || []).map((j: JointExam) => j.id === id ? { ...j, [field]: value } : j));
  };

  const toggleSpecialTest = (examId: number, test: string) => {
    onChange('jointExams', (jointExams || []).map((j: JointExam) => {
      if (j.id !== examId) return j;
      const results = (j.specialTestResults || []).includes(test)
        ? (j.specialTestResults || []).filter(t => t !== test)
        : [...(j.specialTestResults || []), test];
      return { ...j, specialTestResults: results };
    }));
  };

  const handleJointMapClick = (joint: string) => {
    setSelectedJoint(joint);
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Musculoskeletal System" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      {/* GALS Screen */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">GALS Screen (Gait, Arms, Legs, Spine)</Label>
        <div className="flex gap-4">
          {(["normal", "abnormal"] as const).map(v => (
            <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio" name="gals" value={v}
                checked={galsScreen === v}
                onChange={() => onChange('galsScreen', v)}
                className="accent-primary"
              />
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {galsScreen === "abnormal" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Gait & Posture */}
          <CheckboxFindings
            label="Gait & Posture"
            options={[
              { id: "normal-gait", label: "Normal Gait" },
              { id: "antalgic", label: "Antalgic" },
              { id: "ataxic", label: "Ataxic" },
              { id: "trendelenburg", label: "Trendelenburg" },
              { id: "normal-posture", label: "Normal Posture" },
              { id: "scoliosis", label: "Scoliosis" },
              { id: "kyphosis", label: "Kyphosis" },
            ]}
            selected={gaitPosture}
            onChange={(v) => onChange('gaitPosture', v)}
          />

          {/* MRC Scale */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Muscle Strength (MRC Scale 0-5)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Upper Extremities</Label>
                <Select value={mrcUpper} onValueChange={(v) => onChange('mrcUpper', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5/5 - Normal</SelectItem>
                    <SelectItem value="4">4/5 - Against resistance</SelectItem>
                    <SelectItem value="3">3/5 - Against gravity</SelectItem>
                    <SelectItem value="2">2/5 - Gravity eliminated</SelectItem>
                    <SelectItem value="1">1/5 - Flicker</SelectItem>
                    <SelectItem value="0">0/5 - No contraction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Lower Extremities</Label>
                <Select value={mrcLower} onValueChange={(v) => onChange('mrcLower', v)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5/5 - Normal</SelectItem>
                    <SelectItem value="4">4/5 - Against resistance</SelectItem>
                    <SelectItem value="3">3/5 - Against gravity</SelectItem>
                    <SelectItem value="2">2/5 - Gravity eliminated</SelectItem>
                    <SelectItem value="1">1/5 - Flicker</SelectItem>
                    <SelectItem value="0">0/5 - No contraction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Neurovascular Status */}
          <div className="grid sm:grid-cols-2 gap-4">
            <CheckboxFindings
              label="Neurovascular Status"
              options={[
                { id: "pulses-intact", label: "Distal Pulses Intact" },
                { id: "sensation-intact", label: "Sensation Intact" },
                { id: "cap-refill-normal", label: "Capillary Refill < 2s" },
                { id: "cyanosis-absent", label: "No Cyanosis" },
                { id: "edema-absent", label: "No Edema" },
              ]}
              selected={nvStatus}
              onChange={(v) => onChange('nvStatus', v)}
            />

            <CheckboxFindings
              label="General MSK Findings"
              options={[
                { id: "atrophy-none", label: "No Muscle Atrophy" },
                { id: "deformity-none", label: "No Deformities" },
                { id: "nodules-none", label: "No Subcutaneous Nodules" },
                { id: "scars-none", label: "No Surgical Scars" },
                { id: "inflammation-none", label: "No Signs of Inflammation" },
              ]}
              selected={findings.generalMsk || []}
              onChange={(v) => onChange('generalMsk', v)}
            />
          </div>

          {/* Interactive Joint Map + Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Joint Examination</Label>
            <div className="flex gap-6 items-start">
              <JointBodyMap
                selectedJoint={selectedJoint}
                onJointClick={handleJointMapClick}
                examinedJoints={(jointExams || []).map((j: JointExam) => j.joint)}
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Select value={selectedJoint} onValueChange={setSelectedJoint}>
                    <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Select joint" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(specialTests).map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => addJoint()} className="gap-1 h-9">
                    <Plus className="h-3.5 w-3.5" /> Add Joint Exam
                  </Button>
                </div>
                {selectedJoint && (
                  <p className="text-xs text-muted-foreground">
                    Selected: <span className="font-semibold text-primary">{selectedJoint}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Joint Exam Cards */}
          {(jointExams || []).map(exam => (
            <div key={exam.id}>
              <JointExamCard
                exam={exam}
                specialTests={specialTests[exam.joint] || []}
                onRemove={() => removeJoint(exam.id)}
                onUpdate={updateJoint}
                onToggleSpecialTest={toggleSpecialTest}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm font-medium">Smart Phrases</Label>
        <div className="flex flex-wrap gap-2">
          {mskSmartPhrases.map(phrase => (
            <Button key={phrase.label} variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => onChange('notes', notes ? `${notes}\n${phrase.text}` : phrase.text)}>
              {phrase.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Additional MSK Notes</Label>
        <Textarea placeholder="Enter detailed MSK findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function NeurologicalTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    mental,
    showCranial,
    showMotor,
    showSensory,
    showReflexes,
    involuntary,
    coordination,
    sensoryLevel,
    stereognosis,
    graphesthesia,
    hoffmann,
    frontalSigns,
    notes,
    cranialNervesFindings,
    motorBulk,
    motorTone,
    motorPower,
    sensoryModalitiesFindings,
    reflexesFindings,
    plantarResponse,
    clonus
  } = findings;

  const setShowMotor = (value: boolean) => onChange('showMotor', value);
  const setShowSensory = (value: boolean) => onChange('showSensory', value);
  const setShowReflexes = (value: boolean) => onChange('showReflexes', value);


  const handleNestedChange = (field: string, subField: string, value: any, side?: 'right' | 'left') => {
    if (side) {
      const current = findings[field] || {};
      const subCurrent = current[subField] || { right: 'Normal', left: 'Normal' };
      if (field === 'motorPower' && !current[subField]) {
        subCurrent.right = '5/5'; subCurrent.left = '5/5';
      }
      if (field === 'reflexesFindings' && !current[subField]) {
        subCurrent.right = '2+ (Normal)'; subCurrent.left = '2+ (Normal)';
      }
      onChange(field, { ...current, [subField]: { ...subCurrent, [side]: value } });
    } else {
      const current = findings[field] || {};
      onChange(field, { ...current, [subField]: value });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Neurological System" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <div className="space-y-4">
        <Label className="font-semibold text-slate-800">Mental Status</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">Conscious Level</Label>
            <Select value={mental?.consciousLevel} onValueChange={(v) => onChange('mental', { ...mental, consciousLevel: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..."/></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="lethargic">Lethargic</SelectItem>
                <SelectItem value="obtunded">Obtunded</SelectItem>
                <SelectItem value="stuporous">Stuporous</SelectItem>
                <SelectItem value="comatose">Comatose</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Alertness</Label>
            <Select value={mental?.alertness} onValueChange={(v) => onChange('mental', { ...mental, alertness: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select..."/></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="drowsy">Drowsy</SelectItem>
                <SelectItem value="hyper-alert">Hyper-alert</SelectItem>
                <SelectItem value="agitated">Agitated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <CheckboxFindings
          label="Orientation"
          options={[
            { id: "time", label: "Time" },
            { id: "person", label: "Person" },
            { id: "place", label: "Place" },
            { id: "situation", label: "Situation" },
          ]}
          selected={mental?.orientation || []}
          onChange={(v) => onChange('mental', { ...mental, orientation: v })}
        />
      </div>

      {/* Cranial Nerves */}
      <div className="space-y-2">
        <CheckboxFindings
          label="Cranial Nerves"
          options={[
            { id: "cn-intact", label: "Intact" },
            { id: "cn-abnormal", label: "Detailed Exam" },
          ]}
          selected={showCranial ? ["cn-abnormal"] : []}
          onChange={v => onChange('showCranial', v.includes("cn-abnormal"))}
        />
        {showCranial && (
          <div className="rounded-lg border overflow-hidden animate-in fade-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nerve</TableHead>
                  <TableHead className="text-xs">Function</TableHead>
                  <TableHead className="text-xs">Finding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cranialNerves.map(cn => (
                  <TableRow key={cn.id}>
                    <TableCell className="text-xs font-medium py-1">{cn.name}</TableCell>
                    <TableCell className="text-xs py-1">{cn.fn}</TableCell>
                    <TableCell className="py-1">
                      <Select 
                        value={(cranialNervesFindings || {})[cn.id] || "normal"} 
                        onValueChange={(v) => handleNestedChange('cranialNervesFindings', cn.id, v)}
                      >
                        <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="abnormal">Abnormal</SelectItem>
                          <SelectItem value="not-tested">Not Tested</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Motor System */}
      <div className="space-y-2">
        <CheckboxFindings
          label="Motor System"
          options={[
            { id: "motor-intact", label: "Intact (5/5 all groups)" },
            { id: "motor-detailed", label: "Detailed Exam" },
          ]}
          selected={showMotor ? ["motor-detailed"] : []}
          onChange={v => setShowMotor(v.includes("motor-detailed"))}
        />
        {showMotor && (
          <div className="space-y-3 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Muscle Bulk</Label>
                <Select value={motorBulk} onValueChange={(v) => onChange('motorBulk', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal / Symmetric</SelectItem>
                    <SelectItem value="atrophy-generalized">Generalized Atrophy</SelectItem>
                    <SelectItem value="atrophy-focal">Focal Atrophy</SelectItem>
                    <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Muscle Tone</Label>
                <Select value={motorTone} onValueChange={(v) => onChange('motorTone', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="spastic">Increased (Spasticity)</SelectItem>
                    <SelectItem value="rigid">Increased (Rigidity)</SelectItem>
                    <SelectItem value="decreased">Decreased (Hypotonia)</SelectItem>
                    <SelectItem value="cogwheel">Cogwheel Rigidity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Power Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Movement / Myotome</TableHead>
                    <TableHead className="text-xs">Right</TableHead>
                    <TableHead className="text-xs">Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {powerMuscles.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs font-medium py-1">{m.label}</TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(motorPower || {})[m.id]?.right || "5/5"} 
                          onValueChange={(v) => handleNestedChange('motorPower', m.id, v, 'right')}
                        >
                          <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {powerOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(motorPower || {})[m.id]?.left || "5/5"} 
                          onValueChange={(v) => handleNestedChange('motorPower', m.id, v, 'left')}
                        >
                          <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {powerOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

      {/* Coordination & Involuntary Movements */}
      <div className="grid sm:grid-cols-2 gap-4">
        <CheckboxFindings
          label="Coordination"
          options={[
            { id: "coord-fn", label: "Finger-to-Nose Normal" },
            { id: "coord-hs", label: "Heel-to-Shin Normal" },
            { id: "coord-ram", label: "RAM Normal" },
            { id: "coord-dysmetria", label: "Dysmetria" },
            { id: "coord-dysdiadochokinesia", label: "Dysdiadochokinesia" },
          ]}
          selected={coordination}
          onChange={(v) => onChange('coordination', v)}
        />

        <CheckboxFindings
          label="Involuntary Movements"
          options={[
            { id: "inv-none", label: "No Involuntary Movements" },
            { id: "inv-tremor-rest", label: "Resting Tremor" },
            { id: "inv-tremor-action", label: "Action Tremor" },
            { id: "inv-fasciculations", label: "Fasciculations" },
            { id: "inv-chorea", label: "Chorea" },
            { id: "inv-dystonia", label: "Dystonia" },
            { id: "inv-myoclonus", label: "Myoclonus" },
            { id: "inv-tics", label: "Tics" },
          ]}
          selected={involuntary}
          onChange={(v) => onChange('involuntary', v)}
        />
      </div>

      {/* Gait & Station */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Gait & Station</Label>
        <div className="grid sm:grid-cols-2 gap-4">
          <CheckboxFindings
            label="Gait Types"
            options={[
              { id: "gait-normal", label: "Normal" },
              { id: "gait-antalgic", label: "Antalgic" },
              { id: "gait-ataxic", label: "Ataxic" },
              { id: "gait-spastic", label: "Spastic / Scissoring" },
              { id: "gait-parkinsonian", label: "Parkinsonian / Shuffling" },
              { id: "gait-steppage", label: "Steppage" },
              { id: "gait-waddling", label: "Waddling" },
            ]}
            selected={findings.gaitTypes || []}
            onChange={(v) => onChange('gaitTypes', v)}
          />
          <CheckboxFindings
            label="Station & Balance"
            options={[
              { id: "romberg-neg", label: "Romberg Negative" },
              { id: "romberg-pos", label: "Romberg Positive" },
              { id: "pronator-drift-neg", label: "No Pronator Drift" },
              { id: "pronator-drift-pos", label: "Pronator Drift Present" },
              { id: "tandem-normal", label: "Tandem Gait Normal" },
              { id: "tandem-impaired", label: "Tandem Gait Impaired" },
            ]}
            selected={findings.stationBalance || []}
            onChange={(v) => onChange('stationBalance', v)}
          />
        </div>
      </div>

      {/* Meningeal Signs */}
      <CheckboxFindings
        label="Meningeal Signs"
        options={[
          { id: "men-none", label: "No Meningeal Signs" },
          { id: "men-nuchal", label: "Nuchal Rigidity" },
          { id: "men-kernig", label: "Kernig Sign" },
          { id: "men-brudzinski", label: "Brudzinski Sign" },
        ]}
        selected={findings.meningealSigns || []}
        onChange={(v) => onChange('meningealSigns', v)}
      />
          </div>
        )}
      </div>

      {/* Sensory System */}
      <div className="space-y-2">
        <CheckboxFindings
          label="Sensory System"
          options={[
            { id: "sensory-intact", label: "Intact" },
            { id: "sensory-detailed", label: "Detailed Exam" },
          ]}
          selected={showSensory ? ["sensory-detailed"] : []}
          onChange={v => setShowSensory(v.includes("sensory-detailed"))}
        />
        {showSensory && (
          <div className="space-y-3 animate-in fade-in">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Modality</TableHead>
                    <TableHead className="text-xs">Right</TableHead>
                    <TableHead className="text-xs">Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sensoryModalities.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs font-medium py-1">{m.label}</TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(sensoryModalitiesFindings || {})[m.id]?.right || "Normal"} 
                          onValueChange={(v) => handleNestedChange('sensoryModalitiesFindings', m.id, v, 'right')}
                        >
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {sensoryOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(sensoryModalitiesFindings || {})[m.id]?.left || "Normal"} 
                          onValueChange={(v) => handleNestedChange('sensoryModalitiesFindings', m.id, v, 'left')}
                        >
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {sensoryOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Stereognosis</Label>
                <Select value={stereognosis} onValueChange={(v) => onChange('stereognosis', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="impaired">Impaired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Graphesthesia</Label>
                <Select value={graphesthesia} onValueChange={(v) => onChange('graphesthesia', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="impaired">Impaired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sensory Level / Dermatome</Label>
                <Input value={sensoryLevel} onChange={e => onChange('sensoryLevel', e.target.value)}
                  placeholder="e.g., T10, L4 dermatome" className="h-8 text-xs" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reflexes */}
      <div className="space-y-2">
        <CheckboxFindings
          label="Reflexes"
          options={[
            { id: "reflexes-intact", label: "Intact (2+ symmetric)" },
            { id: "reflexes-detailed", label: "Detailed Exam" },
          ]}
          selected={showReflexes ? ["reflexes-detailed"] : []}
          onChange={v => setShowReflexes(v.includes("reflexes-detailed"))}
        />
        {showReflexes && (
          <div className="space-y-3 animate-in fade-in">
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Reflex (Root)</TableHead>
                    <TableHead className="text-xs">Right</TableHead>
                    <TableHead className="text-xs">Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {(reflexes || []).map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-medium py-1">{r.label}</TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(reflexesFindings || {})[r.id]?.right || "2+ (Normal)"} 
                          onValueChange={(v) => handleNestedChange('reflexesFindings', r.id, v, 'right')}
                        >
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {reflexOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={(reflexesFindings || {})[r.id]?.left || "2+ (Normal)"} 
                          onValueChange={(v) => handleNestedChange('reflexesFindings', r.id, v, 'left')}
                        >
                          <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {reflexOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Plantar Response</Label>
                <Select value={plantarResponse} onValueChange={(v) => onChange('plantarResponse', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexor">Flexor (Normal)</SelectItem>
                    <SelectItem value="extensor">Extensor (Babinski +)</SelectItem>
                    <SelectItem value="equivocal">Equivocal</SelectItem>
                    <SelectItem value="no-response">No Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Clonus</Label>
                <Select value={clonus} onValueChange={(v) => onChange('clonus', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="present-r">Present Right</SelectItem>
                    <SelectItem value="present-l">Present Left</SelectItem>
                    <SelectItem value="present-bilateral">Bilateral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Hoffmann Sign</Label>
                <Select value={hoffmann} onValueChange={(v) => onChange('hoffmann', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="positive-r">Positive Right</SelectItem>
                    <SelectItem value="positive-l">Positive Left</SelectItem>
                    <SelectItem value="positive-b">Positive Bilateral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frontal Release</Label>
                <CheckboxFindings label="" options={[
                  { id: "snout", label: "Snout" },
                  { id: "grasp", label: "Grasp" },
                  { id: "palmomental", label: "Palmomental" },
                ]} selected={frontalSigns} onChange={(v) => onChange('frontalSigns', v)} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Smart Phrases</Label>
        <div className="flex flex-wrap gap-2">
          {neuroSmartPhrases.map(phrase => (
            <Button key={phrase.label} variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => onChange('notes', notes ? `${notes}\n${phrase.text}` : phrase.text)}>
              {phrase.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed neurological findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function SkinTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    showDetailed,
    color,
    temp,
    moisture,
    turgor,
    edema,
    nails,
    vascular,
    hairDist,
    lesions,
    notes
  } = findings;

  const addLesion = () => {
    onChange('lesions', [...lesions, {
      id: Date.now(), morphology: "", location: "", length: "", width: "",
      color: "erythematous", borders: "well-defined", secondaryFeatures: [], abcde: [], description: ""
    }]);
  };

  const updateLesion = (id: number, field: keyof Lesion, value: any) => {
    onChange('lesions', lesions.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const toggleLesionFeature = (lesionId: number, feature: string) => {
    onChange('lesions', lesions.map(l => {
      if (l.id !== lesionId) return l;
      const features = l.secondaryFeatures.includes(feature)
        ? l.secondaryFeatures.filter(f => f !== feature)
        : [...l.secondaryFeatures, feature];
      return { ...l, secondaryFeatures: features };
    }));
  };

  const toggleAbcde = (lesionId: number, letter: string) => {
    onChange('lesions', lesions.map(l => {
      if (l.id !== lesionId) return l;
      const abcde = l.abcde.includes(letter)
        ? l.abcde.filter(a => a !== letter)
        : [...l.abcde, letter];
      return { ...l, abcde };
    }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Skin Examination" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <CheckboxFindings
        label="Skin Assessment"
        options={[
          { id: "intact", label: "Intact / Normal" },
          { id: "detailed", label: "Detailed Exam" },
        ]}
        selected={showDetailed ? ["detailed"] : []}
        onChange={v => onChange('showDetailed', v.includes("detailed"))}
      />

      {showDetailed && (
        <div className="space-y-6 animate-in fade-in">
          <div className="space-y-2">
            <Label className="text-sm font-medium">General Inspection</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Color", value: color, onChange: (v: any) => onChange('color', v), options: [
                  { v: "normal", l: "Normal / Pink" }, { v: "pallor", l: "Pallor" },
                  { v: "cyanosis-central", l: "Central Cyanosis" }, { v: "cyanosis-peripheral", l: "Peripheral Cyanosis" },
                  { v: "jaundice", l: "Jaundice" }, { v: "erythema", l: "Erythema" },
                ]},
                { label: "Temperature", value: temp, onChange: (v: any) => onChange('temp', v), options: [
                  { v: "warm", l: "Warm (Normal)" }, { v: "cool", l: "Cool" }, { v: "hot", l: "Hot / Febrile" },
                ]},
                { label: "Moisture", value: moisture, onChange: (v: any) => onChange('moisture', v), options: [
                  { v: "normal", l: "Normal" }, { v: "dry", l: "Dry / Xerosis" }, { v: "clammy", l: "Clammy" }, { v: "diaphoretic", l: "Diaphoretic" },
                ]},
                { label: "Turgor", value: turgor, onChange: (v: any) => onChange('turgor', v), options: [
                  { v: "normal", l: "Normal / Instant Recoil" }, { v: "decreased", l: "Decreased (Tenting)" },
                ]},
              ].map(field => (
                <div key={field.label} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {field.options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Findings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Edema</Label>
              <Select value={edema} onValueChange={(v) => onChange('edema', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="1plus">1+ (Mild, 2mm)</SelectItem>
                  <SelectItem value="2plus">2+ (Moderate, 4mm)</SelectItem>
                  <SelectItem value="3plus">3+ (Deep, 6mm)</SelectItem>
                  <SelectItem value="4plus">4+ (Very Deep, 8mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <CheckboxFindings label="Nails" options={[
              { id: "normal-nails", label: "Normal" }, { id: "clubbing", label: "Clubbing" },
              { id: "pitting", label: "Pitting" }, { id: "splinter", label: "Splinter Hemorrhages" },
            ]} selected={nails} onChange={(v) => onChange('nails', v)} />
          </div>

          {/* Vascular & Hair */}
          <CheckboxFindings label="Vascular" options={[
            { id: "petechiae", label: "Petechiae" }, { id: "purpura", label: "Purpura" },
            { id: "ecchymosis", label: "Ecchymosis" }, { id: "spider-angiomas", label: "Spider Angiomas" },
          ]} selected={vascular} onChange={(v) => onChange('vascular', v)} />

          <div className="space-y-1">
            <Label className="text-xs">Hair Distribution</Label>
            <Select value={hairDist} onValueChange={(v) => onChange('hairDist', v)}>
              <SelectTrigger className="h-8 text-xs w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alopecia-focal">Focal Alopecia</SelectItem>
                <SelectItem value="alopecia-diffuse">Diffuse Alopecia</SelectItem>
                <SelectItem value="hirsutism">Hirsutism</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lesions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Lesion Assessment</Label>
              <Button size="sm" variant="outline" onClick={addLesion} className="gap-1 h-7 text-xs">
                <Plus className="h-3 w-3" /> Add Lesion
              </Button>
            </div>
            {(lesions || []).map(lesion => (
              <div key={lesion.id} className="rounded-lg border bg-card p-4 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">Lesion Assessment</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                    onClick={() => onChange('lesions', lesions.filter(l => l.id !== lesion.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Primary Morphology</Label>
                    <Select value={lesion.morphology} onValueChange={v => updateLesion(lesion.id, "morphology", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {(morphologyOptions || []).map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Location / Distribution</Label>
                    <Input className="h-8 text-xs" placeholder="e.g., Right malar, dermatomal L4"
                      value={lesion.location} onChange={e => updateLesion(lesion.id, "location", e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Size (mm)</Label>
                    <div className="flex items-center gap-1">
                      <Input type="number" className="h-8 text-xs" placeholder="Length"
                        value={lesion.length} onChange={e => updateLesion(lesion.id, "length", e.target.value)} />
                      <span className="text-xs text-muted-foreground">×</span>
                      <Input type="number" className="h-8 text-xs" placeholder="Width"
                        value={lesion.width} onChange={e => updateLesion(lesion.id, "width", e.target.value)} />
                      <span className="text-xs text-muted-foreground">mm</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color & Borders</Label>
                    <div className="flex gap-2">
                      <Select value={lesion.color} onValueChange={v => updateLesion(lesion.id, "color", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="erythematous">Erythematous</SelectItem>
                          <SelectItem value="hyperpigmented">Hyperpigmented</SelectItem>
                          <SelectItem value="hypopigmented">Hypopigmented</SelectItem>
                          <SelectItem value="violaceous">Violaceous</SelectItem>
                          <SelectItem value="flesh">Flesh-colored</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={lesion.borders} onValueChange={v => updateLesion(lesion.id, "borders", v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="well-defined">Well-defined</SelectItem>
                          <SelectItem value="ill-defined">Ill-defined</SelectItem>
                          <SelectItem value="irregular">Irregular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Secondary Features */}
                <div className="space-y-1">
                  <Label className="text-xs">Secondary Features</Label>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {(secondaryFeatureOptions || []).map(f => (
                      <div key={f.id} className="flex items-center gap-1.5">
                        <Checkbox
                          checked={(lesion.secondaryFeatures || []).includes(f.id)}
                          onCheckedChange={() => toggleLesionFeature(lesion.id, f.id)}
                          id={`${lesion.id}-${f.id}`}
                          className="h-3.5 w-3.5"
                        />
                        <Label htmlFor={`${lesion.id}-${f.id}`} className="text-xs cursor-pointer">{f.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ABCDE Assessment */}
                <div className={cn(
                  "p-3 rounded-lg border",
                  lesion.abcde.length > 1 ? "bg-destructive/5 border-destructive/30" : "bg-muted/30"
                )}>
                  <Label className="text-xs font-semibold flex items-center gap-1.5 mb-2">
                    {lesion.abcde.length > 1 && <AlertTriangle className="h-3 w-3 text-destructive" />}
                    Pigmented Lesion Risk (ABCDE) — {lesion.abcde.length}/5
                  </Label>
                  <div className="flex gap-3">
                    {(abcdeLabels || []).map(a => (
                      <label key={a.id} title={a.title}
                        className="flex items-center gap-1 text-xs cursor-pointer">
                        <Checkbox
                          checked={(lesion.abcde || []).includes(a.id)}
                          onCheckedChange={() => toggleAbcde(lesion.id, a.id)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="font-bold">{a.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Assessment / Notes</Label>
                  <Textarea className="text-xs min-h-[50px]" placeholder="e.g., Suspicious for BCC, likely Seborrheic Keratosis..."
                    value={lesion.description || ""} onChange={e => updateLesion(lesion.id, "description", e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed skin examination findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

// Full HEENT mapping from heent-module.js
const heentMapping: Record<string, HeentPart> = {
  'head': { title: 'Head & Facies', normal: 'Normocephalic, atraumatic (NC/AT), symmetric facies', options: [
    { id: 'head-hematoma', text: 'Hematoma', type: 'checkbox' },
    { id: 'head-laceration', text: 'Laceration', type: 'checkbox' },
    { id: 'head-tenderness', text: 'Scalp / Skull Tenderness', type: 'checkbox' },
    { id: 'head-mass', text: 'Scalp Mass / Lesion', type: 'checkbox' },
    { id: 'head-facial-asymmetry', text: 'Facial Asymmetry / Droop (CN VII Palsy)', type: 'select', values: ['Left CN VII Palsy', 'Right CN VII Palsy', 'Bilateral'] },
  ]},
  'head-hair': { title: 'Hair & Scalp', normal: 'Normal distribution & hair texture', options: [
    { id: 'hair-thinning', text: 'Thinning', type: 'checkbox' },
    { id: 'hair-alopecia', text: 'Alopecia (Areata / Diffuse)', type: 'checkbox' },
    { id: 'hair-lesions', text: 'Scalp Lesions / Tinea Capitis', type: 'checkbox' },
  ]},
  'head-temporal': { title: 'Temporal Artery', normal: 'Normal pulses, non-tender', options: [
    { id: 'temporal-tenderness', text: 'Temporal Artery Tenderness (Giant Cell Arteritis Screen)', type: 'checkbox', bilateral: true },
    { id: 'temporal-induration', text: 'Induration / Thickened Nodular Vessel', type: 'checkbox', bilateral: true },
    { id: 'temporal-pulse-reduced', text: 'Reduced / Absent Temporal Pulse', type: 'checkbox', bilateral: true },
  ]},
  'sinus-frontal': { title: 'Frontal Sinus', normal: 'Non-tender to percussion', options: [
    { id: 'sinus-frontal-tender', text: 'Tenderness to Percussion', type: 'select', values: ['Mild', 'Moderate', 'Severe'], bilateral: true },
  ]},
  'sinus-maxillary': { title: 'Maxillary Sinus', normal: 'Non-tender to percussion', options: [
    { id: 'sinus-maxillary-tender', text: 'Tenderness to Percussion', type: 'select', values: ['Mild', 'Moderate', 'Severe'], bilateral: true },
  ]},
  'eyes-pupils': { title: 'Pupils (PERRLA)', normal: 'PERRLA (Pupils Equal, Round, Reactive to Light & Accommodation)', options: [
    { id: 'pupils-sluggish', text: 'Sluggish reaction', type: 'checkbox', bilateral: true },
    { id: 'pupils-nonreactive', text: 'Non-reactive (Fixed)', type: 'checkbox', bilateral: true },
    { id: 'pupils-anisocoria', text: 'Anisocoria (Unequal Pupil Diameter)', type: 'checkbox' },
    { id: 'pupils-rapd', text: 'Marcus Gunn RAPD (Relative Afferent Pupillary Defect)', type: 'checkbox', bilateral: true },
  ]},
  'eyes-eom': { title: 'EOM & Cranial Nerves', normal: 'Full EOM intact without nystagmus or diplopia', options: [
    { id: 'eom-restricted', text: 'Restricted Movement', type: 'checkbox', bilateral: true },
    { id: 'eom-nystagmus', text: 'Nystagmus', type: 'select', values: ['Horizontal', 'Vertical', 'Rotary', 'Direction-Changing'] },
    { id: 'eom-diplopia', text: 'Diplopia (Double Vision)', type: 'checkbox' },
    { id: 'eom-cn3-palsy', text: 'CN III Oculomotor Palsy', type: 'checkbox', bilateral: true },
    { id: 'eom-cn4-palsy', text: 'CN IV Trochlear Palsy', type: 'checkbox', bilateral: true },
    { id: 'eom-cn6-palsy', text: 'CN VI Abducens Palsy', type: 'checkbox', bilateral: true },
  ]},
  'eyes-lids': { title: 'Lids & Lacrimal', normal: 'Normal lids & lacrimal apparatus', options: [
    { id: 'lids-ptosis', text: 'Ptosis (Drooping Lid)', type: 'checkbox', bilateral: true },
    { id: 'lids-xanthelasma', text: 'Xanthelasma', type: 'checkbox', bilateral: true },
    { id: 'lids-edema', text: 'Periorbital Edema', type: 'checkbox', bilateral: true },
    { id: 'lids-cellulitis', text: 'Periorbital Erythema / Preseptal Cellulitis', type: 'checkbox', bilateral: true },
    { id: 'lids-dacryocystitis', text: 'Dacryocystitis / Lacrimal Sac Inflammation', type: 'checkbox', bilateral: true },
  ]},
  'eyes-cornea': { title: 'Cornea & Chamber', normal: 'Clear cornea, quiet anterior chamber', options: [
    { id: 'cornea-arcus', text: 'Arcus Senilis', type: 'checkbox' },
    { id: 'cornea-abrasion', text: 'Corneal Abrasion / Ulcer', type: 'checkbox', bilateral: true },
    { id: 'cornea-hyphema', text: 'Hyphema (Blood in AC)', type: 'checkbox', bilateral: true },
    { id: 'cornea-hypopyon', text: 'Hypopyon (Pus in AC)', type: 'checkbox', bilateral: true },
  ]},
  'eyes-conjunctiva': { title: 'Conjunctiva', normal: 'Clear, pink, non-injected', options: [
    { id: 'conj-injection', text: 'Conjunctival Injection / Redness', type: 'select', values: ['Mild', 'Moderate', 'Ciliary Flush / Severe'], bilateral: true },
    { id: 'conj-pallor', text: 'Subconjunctival Pallor (Anemia Screen)', type: 'checkbox', bilateral: true },
    { id: 'conj-hemorrhage', text: 'Subconjunctival Hemorrhage', type: 'checkbox', bilateral: true },
  ]},
  'eyes-sclera': { title: 'Sclera', normal: 'Anicteric, white sclera', options: [
    { id: 'sclera-icterus', text: 'Scleral Icterus (Jaundice)', type: 'checkbox' },
  ]},
  'eyes-vf': { title: 'Visual Fields', normal: 'Full by confrontation bilaterally', options: [
    { id: 'vf-deficit', text: 'Visual Field Deficit (Hemianopia / Quadrantanopia)', type: 'select', values: ['Bitemporal Hemianopia', 'Left Homonymous Hemianopia', 'Right Homonymous Hemianopia', 'Scotoma'] },
  ]},
  'eyes-fundoscopy': { title: 'Fundoscopy', normal: 'Sharp optic disc margins, normal C/D ratio (0.3), no hemorrhages', options: [
    { id: 'fundus-papilledema', text: 'Papilledema (Optic Disc Swelling)', type: 'checkbox', bilateral: true },
    { id: 'fundus-cupping', text: 'Increased Cup-to-Disc Ratio (>0.5)', type: 'checkbox', bilateral: true },
    { id: 'fundus-av-nicking', text: 'AV Nicking / Hypertensive Retinopathy', type: 'checkbox', bilateral: true },
    { id: 'fundus-cotton-wool', text: 'Cotton Wool Spots', type: 'checkbox', bilateral: true },
    { id: 'fundus-hemorrhage', text: 'Retinal Hemorrhages (Flame / Dot-Blot)', type: 'checkbox', bilateral: true },
  ]},
  'ears-canals': { title: 'Canals (EAC)', normal: 'Clear of cerumen or foreign bodies', options: [
    { id: 'ears-discharge', text: 'Otorrhea / Discharge', type: 'select', values: ['Serous', 'Purulent', 'Bloody', 'Mucoid'], bilateral: true },
    { id: 'ears-erythema-canals', text: 'Erythema / Swelling (Otitis Externa)', type: 'checkbox', bilateral: true },
    { id: 'ears-cerumen-impacted', text: 'Impacted Cerumen', type: 'checkbox', bilateral: true },
    { id: 'ears-foreign-body', text: 'Foreign Body in EAC', type: 'checkbox', bilateral: true },
  ]},
  'ears-tms': { title: 'Tympanic Membranes', normal: 'Intact, translucent, sharp cone of light', options: [
    { id: 'tm-erythema', text: 'TM Erythema / Hyperemia', type: 'checkbox', bilateral: true },
    { id: 'tm-bulging', text: 'TM Bulging (Acute Otitis Media)', type: 'checkbox', bilateral: true },
    { id: 'tm-fluid', text: 'Fluid / Air-Fluid Levels (Serous OM)', type: 'checkbox', bilateral: true },
    { id: 'tm-hemotympanum', text: 'Hemotympanum (Basilar Trauma)', type: 'checkbox', bilateral: true },
    { id: 'tm-perforation', text: 'TM Perforation', type: 'checkbox', bilateral: true },
    { id: 'tm-retraction', text: 'Retraction Pocket / Cholesteatoma', type: 'checkbox', bilateral: true },
    { id: 'tm-pneumatic-mobility', text: 'Reduced Mobility on Pneumatic Otoscopy', type: 'checkbox', bilateral: true },
  ]},
  'ears-pinna': { title: 'Pinna & Tragus', normal: 'Non-tender, no lesions', options: [
    { id: 'pinna-tender', text: 'Tragus / Auricle Tenderness (Otitis Externa Sign)', type: 'checkbox', bilateral: true },
    { id: 'pinna-tophi', text: 'Gouty Tophi', type: 'checkbox', bilateral: true },
  ]},
  'ears-mastoid': { title: 'Mastoid Process', normal: 'Non-tender, no ecchymosis', options: [
    { id: 'mastoid-tender', text: 'Mastoid Tenderness (Mastoiditis Screen)', type: 'checkbox', bilateral: true },
    { id: 'mastoid-erythema', text: 'Mastoid Erythema & Fluctuance', type: 'checkbox', bilateral: true },
    { id: 'mastoid-battles', text: "Battle's Sign (Retroauricular Ecchymosis)", type: 'checkbox', bilateral: true },
  ]},
  'ears-hearing': { title: 'Hearing & Tuning Fork', normal: 'Gross hearing intact, Weber midline, Rinne AC > BC', options: [
    { id: 'hearing-whisper-deficit', text: 'Gross Hearing Deficit / Whisper Test Failure', type: 'checkbox', bilateral: true },
    { id: 'hearing-weber', text: 'Weber Test Lateralization (512 Hz)', type: 'select', values: ['Midline (Normal)', 'Lateralizes Left', 'Lateralizes Right'] },
    { id: 'hearing-rinne', text: 'Rinne Test Result', type: 'select', values: ['AC > BC (Normal / Sensorineural)', 'BC > AC Left (Conductive Loss L)', 'BC > AC Right (Conductive Loss R)'] },
  ]},
  'nose-patency': { title: 'Nose & Airflow', normal: 'Patent nares bilaterally, clear airflow', options: [
    { id: 'nose-discharge', text: 'Rhinorrhea / Discharge', type: 'select', values: ['Clear / Serous', 'Purulent / Green', 'Bloody (Epistaxis)', 'CSF Rhinorrhea'] },
    { id: 'nose-congestion', text: 'Nasal Congestion / Obstruction', type: 'checkbox', bilateral: true },
    { id: 'nose-epistaxis', text: 'Active Epistaxis', type: 'select', values: ['Anterior Kiesselbach', 'Posterior Bleed'] },
  ]},
  'nose-septum-mucosa': { title: 'Nasal Septum & Mucosa', normal: 'Pink, moist mucosa; septum midline', options: [
    { id: 'nose-septal-deviation', text: 'Septal Deviation', type: 'select', values: ['Deviated Left', 'Deviated Right'] },
    { id: 'nose-septal-perforation', text: 'Septal Perforation / Hematoma', type: 'checkbox' },
    { id: 'nose-turbinate-hypertrophy', text: 'Turbinate Hypertrophy / Boggy Allergic Mucosa', type: 'checkbox', bilateral: true },
    { id: 'nose-polyps', text: 'Nasal Polyps', type: 'checkbox', bilateral: true },
  ]},
  'throat-op': { title: 'Oropharynx', normal: 'Clear mucosal lining without exudates', options: [
    { id: 'op-erythema', text: 'Oropharyngeal Erythema', type: 'checkbox' },
    { id: 'op-thrush', text: 'Oral Candidiasis / Thrush', type: 'checkbox' },
    { id: 'op-exudate', text: 'Posterior Pharyngeal Exudate', type: 'checkbox' },
    { id: 'op-cobblestoning', text: 'Lymphoid Cobblestoning', type: 'checkbox' },
  ]},
  'throat-uvula': { title: 'Uvula', normal: 'Midline without edema', options: [
    { id: 'uvula-deviated', text: 'Uvular Deviation (Peritonsillar Abscess Sign)', type: 'select', values: ['Deviated Left', 'Deviated Right'] },
    { id: 'uvula-edema', text: 'Uvular Edema (Quincke Edema)', type: 'checkbox' },
  ]},
  'throat-tongue': { title: 'Tongue & Palate', normal: 'Normal mucosal appearance, tongue midline', options: [
    { id: 'tongue-fasciculations', text: 'Tongue Fasciculations (ALS / Lower Motor Neuron)', type: 'checkbox' },
    { id: 'tongue-glossitis', text: 'Atrophic Glossitis / Smooth Red Tongue', type: 'checkbox' },
    { id: 'tongue-strawberry', text: 'Strawberry Tongue (Kawasaki / Scarlet Fever)', type: 'checkbox' },
    { id: 'tongue-deviation', text: 'Tongue Deviation on Protrusion (CN XII Palsy)', type: 'select', values: ['Deviated Left', 'Deviated Right'] },
    { id: 'tongue-leukoplakia', text: 'Oral Leukoplakia / Erythroplakia', type: 'checkbox' },
    { id: 'throat-palate-palsy', text: 'Soft Palate Elevation Palsy (CN IX, X)', type: 'checkbox' },
  ]},
  'throat-dentition': { title: 'Dentition & Gums', normal: 'Good oral hygiene, dentition intact', options: [
    { id: 'dentition-dentures', text: 'Dentures', type: 'select', values: ['Upper Partial', 'Lower Partial', 'Full Dentures'] },
    { id: 'dentition-loose', text: 'Loose Teeth / Dental Trauma', type: 'checkbox' },
    { id: 'dentition-caries', text: 'Dental Caries', type: 'checkbox' },
    { id: 'dentition-gingivitis', text: 'Gingival Hyperplasia / Bleeding Gums', type: 'checkbox' },
    { id: 'dentition-abscess', text: 'Periapical / Dental Abscess', type: 'checkbox' },
  ]},
  'throat-salivary': { title: 'Salivary Glands', normal: 'Non-tender, unswollen salivary glands', options: [
    { id: 'salivary-parotid', text: 'Parotid Gland Swelling / Tenderness (Mumps / Sialadenitis)', type: 'checkbox', bilateral: true },
    { id: 'salivary-submandibular', text: 'Submandibular Gland Swelling / Stone', type: 'checkbox', bilateral: true },
  ]},
  'throat-mucosa': { title: 'Oral Mucosa', normal: 'Moist, intact mucosa', options: [
    { id: 'mucosa-dry', text: 'Dry Mucosa / Dehydration Sign', type: 'checkbox' },
    { id: 'mucosa-ulcers', text: 'Aphthous Ulcers / Stomatitis', type: 'checkbox' },
  ]},
  'throat-tonsils': { title: 'Tonsils & Airway', normal: 'Tonsils Grade 1+, no exudates or airway obstruction', options: [
    { id: 'tonsil-grading', text: 'Tonsillar Size Grading', type: 'select', values: ['Grade 0 (Surgically Removed)', 'Grade 1+ (<25% Airway)', 'Grade 2+ (25-50% Airway)', 'Grade 3+ (50-75% Airway)', 'Grade 4+ (Kissing Tonsils >75%)'] },
    { id: 'tonsil-exudate', text: 'Tonsillar Exudate / Cryptic Pus', type: 'checkbox', bilateral: true },
    { id: 'tonsil-asymmetry', text: 'Tonsillar Asymmetry / PTA Bulging', type: 'checkbox' },
    { id: 'throat-trismus', text: 'Trismus (Inability to open mouth - PTA / Tetanus)', type: 'checkbox' },
  ]},
  'neck-rom': { title: 'Neck & Meningeal Signs', normal: 'Supple, full ROM, negative Brudzinski/Kernig', options: [
    { id: 'neck-nuchal-rigidity', text: 'Nuchal Rigidity / Stiff Neck', type: 'checkbox' },
    { id: 'neck-brudzinski-kernig', text: 'Positive Brudzinski or Kernig Sign (Meningitis)', type: 'checkbox' },
    { id: 'neck-limited-rom', text: 'Limited Cervical ROM / Muscle Spasm', type: 'checkbox' },
  ]},
  'neck-trachea': { title: 'Trachea', normal: 'Midline without tugging', options: [
    { id: 'trachea-deviated', text: 'Deviated Trachea (Tension Pneumothorax / Mass)', type: 'select', values: ['Deviated Left', 'Deviated Right'] },
  ]},
  'neck-thyroid': { title: 'Thyroid Gland', normal: 'Normal size, smooth, non-tender, no nodules or bruits', options: [
    { id: 'thyroid-enlarged', text: 'Thyromegaly / Goiter', type: 'checkbox' },
    { id: 'thyroid-nodular', text: 'Thyroid Nodule(s)', type: 'select', values: ['Single Solitary Nodule', 'Multinodular'] },
    { id: 'thyroid-tender', text: 'Thyroid Tenderness (Subacute Thyroiditis)', type: 'checkbox' },
    { id: 'thyroid-bruit', text: 'Thyroid Bruit (Graves Disease)', type: 'checkbox' },
  ]},
  'neck-lymph': { title: 'Lymph Node Chains', normal: 'No lymphadenopathy (non-tender, soft, mobile)', options: [
    { id: 'lymph-anterior-cervical', text: 'Anterior Cervical Nodes', type: 'checkbox', bilateral: true },
    { id: 'lymph-posterior-cervical', text: 'Posterior Cervical Nodes', type: 'checkbox', bilateral: true },
    { id: 'lymph-submandibular', text: 'Submandibular Nodes', type: 'checkbox', bilateral: true },
    { id: 'lymph-submental', text: 'Submental Nodes', type: 'checkbox' },
    { id: 'lymph-occipital', text: 'Occipital Nodes', type: 'checkbox', bilateral: true },
    { id: 'lymph-auricular', text: 'Pre / Post-Auricular Nodes', type: 'checkbox', bilateral: true },
    { id: 'lymph-supraclavicular', text: 'Supraclavicular Node (Virchow Node / Malignancy)', type: 'checkbox', bilateral: true },
    { id: 'lymph-infraclavicular', text: 'Infraclavicular Nodes', type: 'checkbox', bilateral: true },
  ]},
  'neck-jvp': { title: 'JVP & Venous Pulsations', normal: 'No JVD, JVP ≤ 3cm above sternal angle', options: [
    { id: 'jvp-elevated', text: 'Elevated JVP (> 3cm above sternal angle)', type: 'checkbox' },
    { id: 'jvp-jvd-present', text: 'Jugular Venous Distension (JVD)', type: 'checkbox' },
    { id: 'jvp-kussmaul', text: 'Kussmaul Sign (Inspiratory JVP Rise)', type: 'checkbox' },
  ]},
  'neck-carotids': { title: 'Carotid Arteries', normal: 'No bruits, 2+ symmetric pulses', options: [
    { id: 'carotid-bruit', text: 'Carotid Bruit', type: 'checkbox', bilateral: true },
    { id: 'carotid-character', text: 'Pulse Character', type: 'select', values: ['Normal 2+', 'Weak / Thready 1+', 'Bounding 3+', 'Bisferiens / Pulsus Alternans'], bilateral: true },
    { id: 'carotid-reduced', text: 'Reduced / Absent Pulse', type: 'checkbox', bilateral: true },
  ]},
};

interface HeentOption {
  id: string;
  text: string;
  type: 'checkbox' | 'select';
  values?: string[];
  bilateral?: boolean;
}

interface HeentPart {
  title: string;
  normal: string;
  options: HeentOption[];
}

interface FindingData {
  active: boolean;
  value?: string;
  side?: 'L' | 'B' | 'R';
}

type HeentState = Record<string, { status: 'normal' | 'abnormal'; findings: Record<string, FindingData> }>;

const heentSections = [
  { key: "head", title: "Head & Sinuses", parts: ["head", "head-hair", "head-temporal", "sinus-frontal", "sinus-maxillary"] },
  { key: "eyes", title: "Eyes & Vision", parts: ["eyes-pupils", "eyes-eom", "eyes-lids", "eyes-cornea", "eyes-conjunctiva", "eyes-sclera", "eyes-vf", "eyes-fundoscopy"] },
  { key: "ears", title: "Ears & Hearing", parts: ["ears-canals", "ears-tms", "ears-pinna", "ears-mastoid", "ears-hearing"] },
  { key: "noseMouth", title: "Nose & Mouth", parts: ["nose-patency", "nose-septum-mucosa", "throat-op", "throat-uvula", "throat-tongue", "throat-dentition", "throat-salivary", "throat-mucosa", "throat-tonsils"] },
  { key: "neck", title: "Neck & Thyroid", parts: ["neck-rom", "neck-trachea", "neck-thyroid", "neck-lymph", "neck-jvp", "neck-carotids"] },
];

const heentSmartPhrases = [
  { 
    label: "NC/AT, Pupils PERRLA, EOM", 
    category: "Eyes & Head",
    text: "NC/AT. Pupils PERRLA. EOM intact. Sclera anicteric, conjunctiva clear." 
  },
  { 
    label: "TMs Intact & Clear Canals", 
    category: "Ears",
    text: "TMs intact, translucent bilaterally with good light reflex. External canals clear." 
  },
  { 
    label: "Oropharynx & Tonsils 1+", 
    category: "Mouth & Throat",
    text: "Oropharynx clear without erythema or exudates. Mucosa moist. Tonsils grade 1+." 
  },
  { 
    label: "Neck Supple, Midline, No JVD", 
    category: "Neck",
    text: "Neck supple, non-tender. Trachea midline. No thyromegaly or cervical lymphadenopathy. No JVD." 
  },
  { 
    label: "No Cervical Lymphadenopathy", 
    category: "Neck",
    text: "No cervical, supraclavicular, or submandibular lymphadenopathy." 
  },
  { 
    label: "PERRLA Complete", 
    category: "Eyes & Head",
    text: "Pupils equal, round, reactive to light and accommodation bilaterally." 
  },
  { 
    label: "JVP Normal ≤ 3cm", 
    category: "Neck",
    text: "No JVD noted, JVP ≤ 3cm above sternal angle." 
  },
  { 
    label: "Temporal Non-tender", 
    category: "Eyes & Head",
    text: "Temporal arteries non-tender without induration bilaterally." 
  },
  { 
    label: "Dentition Intact", 
    category: "Mouth & Throat",
    text: "Good dentition and oral hygiene without dental caries or loose teeth." 
  },
];

function HeentInteractiveDiagram({ 
  heentState, 
  onJumpToSection, 
  onMarkSectionNormal,
  onClearSection,
  onOpenPartAbnormalModal,
  onChangePartStatus
}: { 
  heentState: HeentState, 
  onJumpToSection: (secKey: string) => void,
  onMarkSectionNormal: (secKey: string) => void,
  onClearSection: (secKey: string) => void,
  onOpenPartAbnormalModal?: (partId: string) => void,
  onChangePartStatus?: (partId: string, status: 'normal' | 'abnormal' | undefined) => void
}) {
  const [selectedRegionModalKey, setSelectedRegionModalKey] = useState<string | null>(null);

  const getRegionStats = (secKey: string) => {
    const sec = heentSections.find(s => s.key === secKey);
    if (!sec) return { total: 0, normal: 0, abnormal: 0, untouched: 0 };
    let normal = 0;
    let abnormal = 0;
    let untouched = 0;
    sec.parts.forEach(p => {
      const st = (heentState || {})[p]?.status;
      if (st === 'normal') normal++;
      else if (st === 'abnormal') abnormal++;
      else untouched++;
    });
    return { total: sec.parts.length, normal, abnormal, untouched };
  };

  const regions = [
    { key: 'head', title: 'Head & Sinuses', icon: '🧠', partsLabel: 'Cranium, Scalp, Sinuses' },
    { key: 'eyes', title: 'Eyes & Vision', icon: '👁️', partsLabel: 'Pupils, EOM, Lids, Sclera' },
    { key: 'ears', title: 'Ears & Hearing', icon: '👂', partsLabel: 'Canals, TMs, Mastoid' },
    { key: 'noseMouth', title: 'Nose & Mouth', icon: '👄', partsLabel: 'Oropharynx, Tonsils, Dentition' },
    { key: 'neck', title: 'Neck & Thyroid', icon: '🧣', partsLabel: 'Thyroid, Trachea, JVP, Lymph' },
  ];

  const selectedSec = heentSections.find(s => s.key === selectedRegionModalKey);
  const selectedRegionInfo = regions.find(r => r.key === selectedRegionModalKey);
  const regionStats = selectedRegionModalKey ? getRegionStats(selectedRegionModalKey) : { total: 0, normal: 0, abnormal: 0, untouched: 0 };
  const abnormalParts = (selectedSec?.parts || []).filter(p => (heentState || {})[p]?.status === 'abnormal');

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>HEENT Anatomic Region Quick Navigator</span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-full border border-indigo-500/30 uppercase tracking-wider font-semibold">
                1-Tap Pop-Up Exam
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Click any region card to open detailed findings modal and review abnormal results.
            </p>
          </div>
        </div>
      </div>

      {/* Region Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {regions.map(r => {
          const stats = getRegionStats(r.key);
          const isAbnormal = stats.abnormal > 0;
          const isAllNormal = stats.normal === stats.total;

          return (
            <div 
              key={r.key}
              className={cn(
                "p-3.5 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between space-y-2.5 shadow-sm hover:shadow-md",
                isAbnormal ? "bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/50 hover:border-rose-400" :
                isAllNormal ? "bg-emerald-950/30 border-emerald-500/40 hover:bg-emerald-900/40 hover:border-emerald-400" :
                "bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 hover:border-indigo-500/50"
              )}
              onClick={() => setSelectedRegionModalKey(r.key)}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className="text-base">{r.icon}</span>
                  <span>{r.title}</span>
                </span>

                {isAbnormal ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    {stats.abnormal} Abnormal
                  </span>
                ) : isAllNormal ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    WNL
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-700 text-slate-300 border border-slate-600">
                    {stats.normal}/{stats.total} Checked
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-1 leading-tight">
                {r.partsLabel}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-700/50 text-[10px]" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setSelectedRegionModalKey(r.key)}
                  className="text-indigo-300 hover:text-indigo-100 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Open Region Modal</span>
                  <Maximize2 className="w-3 h-3 text-indigo-400" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMarkSectionNormal(r.key)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                    title="Mark all items in this section as Normal"
                  >
                    ✓ All Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => onClearSection(r.key)}
                    className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    title="Clear section selection"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Region Pop-Up Findings Modal */}
      <Dialog open={!!selectedRegionModalKey} onOpenChange={(open) => { if (!open) setSelectedRegionModalKey(null); }}>
        <DialogContent className="max-w-xl bg-white text-slate-900 border-slate-200 shadow-2xl rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{selectedRegionInfo?.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedRegionInfo?.title} Examination Modal</h3>
                  <p className="text-xs text-slate-500 font-normal">Detailed findings breakdown & abnormal summary</p>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Summary Status Banner */}
            {regionStats.abnormal > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{regionStats.abnormal} Abnormal Finding{regionStats.abnormal > 1 ? 's' : ''} Recorded</span>
                </div>
                <p className="text-xs text-rose-900 font-medium">
                  Abnormal physical findings detected in this anatomical region.
                </p>
              </div>
            ) : regionStats.normal === regionStats.total && regionStats.total > 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All {regionStats.total} Parts Marked Normal (Within Normal Limits)</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between">
                <span>Region Progress: <strong>{regionStats.normal} Normal</strong>, <strong>{regionStats.abnormal} Abnormal</strong>, {regionStats.untouched} Unexamined</span>
              </div>
            )}

            {/* Abnormal Findings List */}
            {abnormalParts.length > 0 && (
              <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                <h5 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider flex items-center justify-between">
                  <span>Active Abnormal Findings ({abnormalParts.length})</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-200 text-rose-900 font-bold rounded-full">
                    Positive Results
                  </span>
                </h5>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {abnormalParts.map(partId => {
                    const partInfo = heentMapping[partId];
                    const partState = (heentState || {})[partId];
                    const activeFindingsKeys = Object.keys(partState?.findings || {}).filter(k => partState?.findings[k]?.active);

                    return (
                      <div key={partId} className="p-2.5 bg-white border border-rose-200 rounded-lg shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            {partInfo?.title || partId}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenPartAbnormalModal) onOpenPartAbnormalModal(partId);
                            }}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit Options</span>
                          </button>
                        </div>

                        {activeFindingsKeys.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {activeFindingsKeys.map(optId => {
                              const optData = partState?.findings[optId];
                              const optDef = partInfo?.options?.find(o => o.id === optId);
                              const textLabel = optDef?.text || optId;

                              return (
                                <span key={optId} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-900 border border-rose-200">
                                  <span>{textLabel}</span>
                                  {optData?.side && <span className="font-extrabold text-[9px] px-1 bg-rose-200 text-rose-950 rounded">({optData.side})</span>}
                                  {optData?.value && <span className="font-bold text-[10px] text-rose-800">: {optData.value}</span>}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-rose-700 italic">
                            Abnormal flag toggled (no specific checkbox selected). Click 'Edit Options' to specify details.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Region Parts Checklist */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Region Exam Checklist ({selectedSec?.parts?.length || 0} Items)
              </h5>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {(selectedSec?.parts || []).map(pId => {
                  const pInfo = heentMapping[pId];
                  const status = (heentState || {})[pId]?.status;

                  return (
                    <div key={pId} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 transition-colors">
                      <div className="pr-2">
                        <span className="text-xs font-semibold text-slate-900 block">{pInfo?.title || pId}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">WNL: {pInfo?.normal}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (onChangePartStatus) {
                              onChangePartStatus(pId, status === 'normal' ? undefined : 'normal');
                            }
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer shadow-2xs",
                            status === 'normal' 
                              ? "bg-emerald-600 text-white" 
                              : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-300"
                          )}
                        >
                          ✓ Normal
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenPartAbnormalModal) {
                              onOpenPartAbnormalModal(pId);
                            }
                          }}
                          className={cn(
                            "px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs",
                            status === 'abnormal' 
                              ? "bg-rose-600 text-white" 
                              : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
                          )}
                        >
                          <span>Abnormal</span>
                          {status === 'abnormal' && <Edit2 className="w-3 h-3" />}
                        </button>

                        {status && (
                          <button
                            type="button"
                            onClick={() => {
                              if (onChangePartStatus) {
                                onChangePartStatus(pId, undefined);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Clear"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedRegionModalKey) onMarkSectionNormal(selectedRegionModalKey);
                }}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-xs font-semibold cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                All Normal
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedRegionModalKey) onClearSection(selectedRegionModalKey);
                }}
                className="text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  const keyToJump = selectedRegionModalKey;
                  setSelectedRegionModalKey(null);
                  if (keyToJump) onJumpToSection(keyToJump);
                }}
                className="text-xs font-semibold cursor-pointer"
              >
                Jump to Exam Card
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedRegionModalKey(null)}
                className="text-xs font-bold cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
              >
                Close Modal
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HeentSpecializedCalculators({ onInsertToNotes }: { onInsertToNotes: (text: string) => void }) {
  // Centor / McIsaac state
  const [centorAge, setCentorAge] = useState<string>("15-44");
  const [centorFever, setCentorFever] = useState(false);
  const [centorNoCough, setCentorNoCough] = useState(false);
  const [centorNodes, setCentorNodes] = useState(false);
  const [centorExudate, setCentorExudate] = useState(false);

  const centorScore = useMemo(() => {
    let score = 0;
    if (centorFever) score += 1;
    if (centorNoCough) score += 1;
    if (centorNodes) score += 1;
    if (centorExudate) score += 1;
    if (centorAge === "3-14") score += 1;
    if (centorAge === ">=45") score -= 1;
    return Math.max(0, score);
  }, [centorAge, centorFever, centorNoCough, centorNodes, centorExudate]);

  const centorRecommendation = useMemo(() => {
    if (centorScore <= 1) {
      return { risk: "< 10%", rec: "Low risk. No throat culture or antibiotic therapy indicated.", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    } else if (centorScore <= 3) {
      return { risk: "15 - 32%", rec: "Intermediate risk. Perform Rapid Antigen Detection Test (RADT) or throat culture; treat if positive.", badgeColor: "bg-amber-100 text-amber-800 border-amber-300" };
    } else {
      return { risk: "38 - 56%", rec: "High risk. Perform RADT/culture or consider empiric antibiotic treatment per clinical judgment.", badgeColor: "bg-rose-100 text-rose-900 border-rose-300" };
    }
  }, [centorScore]);

  // Airway Red Flags state
  const [airwayStridor, setAirwayStridor] = useState(false);
  const [airwayDrooling, setAirwayDrooling] = useState(false);
  const [airwayMuffledVoice, setAirwayMuffledVoice] = useState(false);
  const [airwayTripod, setAirwayTripod] = useState(false);
  const [airwayTrismus, setAirwayTrismus] = useState(false);

  const hasAirwayRedFlag = airwayStridor || airwayDrooling || airwayMuffledVoice || airwayTripod || airwayTrismus;

  // HINTS state
  const [hintsImpulse, setHintsImpulse] = useState<string>("none");
  const [hintsNystagmus, setHintsNystagmus] = useState<string>("none");
  const [hintsSkew, setHintsSkew] = useState<string>("none");

  const hintsResult = useMemo(() => {
    if (hintsImpulse === "none" && hintsNystagmus === "none" && hintsSkew === "none") return null;
    const isCentral = hintsImpulse === "normal" || hintsNystagmus === "direction_changing" || hintsSkew === "skew";
    if (isCentral) {
      return {
        type: "CENTRAL (High Suspicion for Posterior Circulation Stroke)",
        desc: "🚨 CRITICAL: Normal head impulse test, direction-changing nystagmus, OR skew deviation indicates a CENTRAL acute vestibular syndrome. Immediate brain MRI with diffusion-weighted imaging (DWI) and neurology consult required.",
        isWarning: true
      };
    } else {
      return {
        type: "PERIPHERAL (Consistent with Acute Vestibular Neuritis / Labyrinthitis)",
        desc: "Abnormal head impulse (catch-up saccade), unidirectional horizontal nystagmus, and no skew deviation suggest peripheral vestibular etiology.",
        isWarning: false
      };
    }
  }, [hintsImpulse, hintsNystagmus, hintsSkew]);

  return (
    <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Specialized High-Yield Triage & Clinical Decision Rules
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
          Section 7 Decision Support
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Centor / McIsaac Score Calculator */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600" />
                <span>Centor / McIsaac GAS Score</span>
              </span>
              <span className={cn("px-2 py-0.5 rounded text-xs font-extrabold border", centorRecommendation.badgeColor)}>
                Score: {centorScore}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Patient Age:</span>
                <select
                  value={centorAge}
                  onChange={e => setCentorAge(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-0.5 font-medium"
                >
                  <option value="3-14">3 - 14 yrs (+1)</option>
                  <option value="15-44">15 - 44 yrs (0)</option>
                  <option value=">=45">≥ 45 yrs (-1)</option>
                </select>
              </div>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700">Fever &gt; 38.0°C (100.4°F)</span>
                <Checkbox checked={centorFever} onCheckedChange={v => setCentorFever(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700">Absence of Cough</span>
                <Checkbox checked={centorNoCough} onCheckedChange={v => setCentorNoCough(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700">Tender Anterior Cervical Nodes</span>
                <Checkbox checked={centorNodes} onCheckedChange={v => setCentorNodes(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700">Tonsillar Exudate / Swelling</span>
                <Checkbox checked={centorExudate} onCheckedChange={v => setCentorExudate(!!v)} />
              </label>
            </div>

            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-0.5">
              <div className="font-bold text-slate-800">GAS Strep Risk: {centorRecommendation.risk}</div>
              <p className="text-slate-600 leading-tight">{centorRecommendation.rec}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const text = `[Centor/McIsaac GAS Strep Score]: ${centorScore} (Age: ${centorAge}, Temp>38C: ${centorFever?'Yes':'No'}, No Cough: ${centorNoCough?'Yes':'No'}, Tender Ant Cervical Nodes: ${centorNodes?'Yes':'No'}, Tonsillar Exudate: ${centorExudate?'Yes':'No'}). Estimated GAS Strep Risk: ${centorRecommendation.risk}. Plan: ${centorRecommendation.rec}`;
              onInsertToNotes(text);
              toast.success("Appended Centor/McIsaac Score to Notes!");
            }}
            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200 cursor-pointer"
          >
            + Append Centor Result to Notes
          </button>
        </div>

        {/* 2. Airway Red-Flag Triage Banner & Assessment */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Airway & Epiglottitis Red-Flag Triage</span>
              </span>
              {hasAirwayRedFlag && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-bold animate-pulse">
                  CRITICAL
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium">Stridor (Inspiratory / Expiratory)</span>
                <Checkbox checked={airwayStridor} onCheckedChange={v => setAirwayStridor(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium">Drooling / Inability to Swallow</span>
                <Checkbox checked={airwayDrooling} onCheckedChange={v => setAirwayDrooling(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium">"Hot Potato" Muffled Voice</span>
                <Checkbox checked={airwayMuffledVoice} onCheckedChange={v => setAirwayMuffledVoice(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium">Tripod Positioning (Sniffing Posture)</span>
                <Checkbox checked={airwayTripod} onCheckedChange={v => setAirwayTripod(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium">Trismus (Inability to open jaw)</span>
                <Checkbox checked={airwayTrismus} onCheckedChange={v => setAirwayTrismus(!!v)} />
              </label>
            </div>

            {hasAirwayRedFlag ? (
              <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-[11px] space-y-1 text-rose-950">
                <div className="font-extrabold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>EMERGENCY AIRWAY ALERT</span>
                </div>
                <p className="leading-tight">
                  🚨 High risk for Epiglottitis, Peritonsillar Abscess (PTA), or Retropharyngeal Abscess. Avoid forceful oral instrumentation with tongue depressor. Prepare airway resuscitation & urgent ENT consult.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Check any positive red-flag symptoms to activate automated emergency airway protocols.
              </div>
            )}
          </div>

          {hasAirwayRedFlag && (
            <button
              type="button"
              onClick={() => {
                const flags = [];
                if (airwayStridor) flags.push("Stridor");
                if (airwayDrooling) flags.push("Drooling");
                if (airwayMuffledVoice) flags.push("Hot potato voice");
                if (airwayTripod) flags.push("Tripod positioning");
                if (airwayTrismus) flags.push("Trismus");
                const text = `[AIRWAY RED-FLAG TRIAGE ALERT]: Positive for ${flags.join(", ")}. High clinical concern for impending airway compromise (Epiglottitis / PTA / Ludwig's). Avoid oral instrumentation. ENT consult & airway management readiness advised.`;
                onInsertToNotes(text);
                toast.success("Appended Airway Alert to Notes!");
              }}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              + Append Airway Alert to Notes
            </button>
          )}
        </div>

        {/* 3. HINTS Exam Cross-Link */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>HINTS Exam (Acute Vestibular Syndrome)</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-600 font-medium text-[11px]">Head Impulse Test (HI):</span>
                <select
                  value={hintsImpulse}
                  onChange={e => setHintsImpulse(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium"
                >
                  <option value="none">Select finding...</option>
                  <option value="abnormal">Abnormal / Catch-up saccade (Peripheral)</option>
                  <option value="normal">Normal / No saccade (CENTRAL STROKE!)</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-600 font-medium text-[11px]">Nystagmus (N):</span>
                <select
                  value={hintsNystagmus}
                  onChange={e => setHintsNystagmus(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium"
                >
                  <option value="none">Select finding...</option>
                  <option value="unidirectional">Unidirectional horizontal (Peripheral)</option>
                  <option value="direction_changing">Direction-changing / Vertical (CENTRAL STROKE!)</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-600 font-medium text-[11px]">Test of Skew (TS):</span>
                <select
                  value={hintsSkew}
                  onChange={e => setHintsSkew(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium"
                >
                  <option value="none">Select finding...</option>
                  <option value="none_skew">No skew deviation (Peripheral)</option>
                  <option value="skew">Vertical skew deviation present (CENTRAL STROKE!)</option>
                </select>
              </div>
            </div>

            {hintsResult ? (
              <div className={cn("p-2 rounded-lg text-[11px] border space-y-0.5", hintsResult.isWarning ? "bg-rose-50 border-rose-300 text-rose-950 font-medium" : "bg-emerald-50 border-emerald-300 text-emerald-950")}>
                <div className="font-bold">{hintsResult.type}</div>
                <p className="leading-tight text-[10px]">{hintsResult.desc}</p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Evaluate HI-N-TS to differentiate central posterior circulation stroke from peripheral vestibular neuritis in continuous vertigo.
              </div>
            )}
          </div>

          {hintsResult && (
            <button
              type="button"
              onClick={() => {
                const text = `[HINTS EXAM]: Head Impulse=${hintsImpulse}, Nystagmus=${hintsNystagmus}, Test of Skew=${hintsSkew}. Assessment: ${hintsResult.type}. ${hintsResult.desc}`;
                onInsertToNotes(text);
                toast.success("Appended HINTS Exam Result to Notes!");
              }}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors border border-slate-300 cursor-pointer"
            >
              + Append HINTS Result to Notes
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function HeentTab({ 
  findings, 
  onChange, 
  onMarkNormal, 
  onClear,
  onNavigateToTab,
  onSyncToSse
}: { 
  findings: any, 
  onChange: (field: string, value: any) => void, 
  onMarkNormal: () => void, 
  onClear: () => void,
  onNavigateToTab?: (tabId: string) => void,
  onSyncToSse?: () => void
}) {
  const { heentState = {}, pupilSize = [3], notes = "" } = findings || {};
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState<string | null>(null);
  const [modalFindings, setModalFindings] = useState<Record<string, FindingData>>({});
  const [isRedFlagsCollapsed, setIsRedFlagsCollapsed] = useState(false);
  const [activeSmartCategory, setActiveSmartCategory] = useState<string>("All");

  const handleJumpToSection = (secKey: string) => {
    const el = document.getElementById(`heent-sec-${secKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-indigo-500', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-indigo-500');
      }, 2000);
    }
  };

  const handleMarkSectionNormal = (secKey: string) => {
    const sec = heentSections.find(s => s.key === secKey);
    if (!sec) return;
    const updates: HeentState = {};
    (sec.parts || []).forEach(p => { updates[p] = { status: 'normal', findings: {} }; });
    onChange('heentState', { ...heentState, ...updates });
    toast.success(`Marked ${sec.title} as Normal!`);
  };

  const handleClearSection = (secKey: string) => {
    const sec = heentSections.find(s => s.key === secKey);
    if (!sec) return;
    const next = { ...heentState };
    (sec.parts || []).forEach(p => { delete next[p]; });
    onChange('heentState', next);
    toast.info(`Cleared ${sec.title}.`);
  };

  // Automated HEENT Emergency Red-Flag Banner calculation
  const heentRedFlags = useMemo(() => {
    const flags: { title: string; category: string; description: string; urgency: 'critical' | 'warning' }[] = [];

    const isOptActive = (partId: string, optId: string) => {
      return !!(heentState || {})[partId]?.findings?.[optId]?.active;
    };

    // 1. Tracheal Deviation + Neck Vein Distension ➔ Suspect Tension Pneumothorax
    const tracheaDev = isOptActive('neck-trachea', 'trachea-deviated');
    const jvd = isOptActive('neck-jvp', 'jvp-elevated') || isOptActive('neck-jvp', 'jvp-jvd-present');
    if (tracheaDev && jvd) {
      flags.push({
        title: "Tracheal Deviation + Elevated JVP / JVD",
        category: "Tension Pneumothorax",
        description: "🚨 CRITICAL: Tracheal deviation combined with jugular venous distension indicates obstructive shock secondary to tension pneumothorax. Requires immediate needle thoracostomy decompression.",
        urgency: "critical"
      });
    } else if (tracheaDev) {
      flags.push({
        title: "Tracheal Deviation",
        category: "Airway / Pleural Emergency",
        description: "Tracheal deviation noted. Rule out tension pneumothorax, massive pleural effusion, severe atelectasis, or substernal goiter.",
        urgency: "warning"
      });
    }

    // 2. Temporal Artery Tenderness + Visual Changes ➔ Suspect Giant Cell Arteritis (GCA)
    const temporalTender = isOptActive('head-temporal', 'temporal-tenderness') || isOptActive('head-temporal', 'temporal-induration') || isOptActive('head-temporal', 'temporal-pulse-reduced');
    const visualChanges = isOptActive('eyes-vf', 'vf-deficit') || isOptActive('eyes-pupils', 'pupils-rapd') || isOptActive('eyes-pupils', 'pupils-sluggish');
    if (temporalTender && visualChanges) {
      flags.push({
        title: "Temporal Artery Tenderness + Visual Field / Pupillary Deficit",
        category: "Giant Cell Arteritis (GCA)",
        description: "🚨 CRITICAL: High risk of Anterior Ischemic Optic Neuropathy (AION) and permanent vision loss. Immediate high-dose systemic corticosteroid therapy, ESR/CRP, and temporal artery biopsy needed.",
        urgency: "critical"
      });
    } else if (temporalTender) {
      flags.push({
        title: "Temporal Artery Tenderness / Induration",
        category: "Giant Cell Arteritis",
        description: "Tenderness or nodular induration over temporal artery. Evaluate for headache, jaw claudication, ESR/CRP, and GCA risk.",
        urgency: "warning"
      });
    }

    // 3. Nuchal Rigidity / Positive Brudzinski or Kernig Sign ➔ Suspect Acute Meningitis
    const nuchalRigidity = isOptActive('neck-rom', 'neck-meningismus') || isOptActive('neck-rom', 'neck-nuchal-rigidity') || isOptActive('neck-rom', 'neck-brudzinski-kernig');
    if (nuchalRigidity) {
      flags.push({
        title: "Nuchal Rigidity / Positive Brudzinski or Kernig Sign",
        category: "Acute Meningitis",
        description: "🚨 CRITICAL: Meningeal irritation signs detected. Urgent lumbar puncture, blood cultures, STAT head CT (if focal neuro deficits), and empiric IV antibiotics + dexamethasone indicated.",
        urgency: "critical"
      });
    }

    // 4. Uvular Deviation + Trismus + Unilateral Tonsillar Exudate/Bulging ➔ Suspect Peritonsillar Abscess
    const uvulaDev = isOptActive('throat-uvula', 'uvula-deviated');
    const trismus = isOptActive('throat-tonsils', 'throat-trismus');
    const tonsillarExudateBulge = isOptActive('throat-tonsils', 'tonsil-exudate') || isOptActive('throat-tonsils', 'tonsil-asymmetry') || isOptActive('throat-op', 'op-exudate');
    if (uvulaDev && (trismus || tonsillarExudateBulge)) {
      flags.push({
        title: "Uvular Deviation + Trismus / Unilateral Tonsillar Exudate",
        category: "Peritonsillar Abscess (Quinsy)",
        description: "🚨 CRITICAL: Signs of deep neck infection / peritonsillar abscess. Risk of acute airway compromise or carotid sheath extension. Urgent ENT consult for needle aspiration or I&D.",
        urgency: "critical"
      });
    } else if (uvulaDev) {
      flags.push({
        title: "Uvular Deviation",
        category: "Oropharyngeal Emergency",
        description: "Uvular deviation noted. Rule out peritonsillar abscess (Quinsy) or cranial nerve X neuropathy.",
        urgency: "warning"
      });
    }

    // 5. Mastoid Tenderness + Erythema ➔ Suspect Acute Mastoiditis / Battle's Sign
    const mastoidTender = isOptActive('ears-mastoid', 'mastoid-tender') || isOptActive('ears-mastoid', 'mastoid-erythema');
    const battlesSign = isOptActive('ears-mastoid', 'mastoid-battles');
    if (mastoidTender) {
      flags.push({
        title: "Mastoid Tenderness & Erythema",
        category: "Acute Mastoiditis",
        description: "🚨 CRITICAL: Complication of acute otitis media with risk of intracranial spread (epidural abscess, venous sinus thrombosis). Urgent temporal bone CT & IV antibiotics required.",
        urgency: "critical"
      });
    }
    if (battlesSign) {
      flags.push({
        title: "Battle's Sign (Mastoid Ecchymosis)",
        category: "Basilar Skull Fracture",
        description: "🚨 CRITICAL: Retroauricular ecchymosis indicating basilar skull fracture. Rule out CSF otorrhea/rhinorrhea and neurotrauma emergency.",
        urgency: "critical"
      });
    }

    // 6. Acute Unilateral Ptosis + Anisocoria ➔ Suspect Horner's Syndrome or 3rd Nerve Palsy (Aneurysm)
    const ptosis = isOptActive('eyes-lids', 'lids-ptosis');
    const anisocoria = isOptActive('eyes-pupils', 'pupils-anisocoria');
    if (ptosis && anisocoria) {
      flags.push({
        title: "Unilateral Ptosis + Anisocoria",
        category: "Horner's / 3rd Nerve Palsy (Aneurysm)",
        description: "🚨 CRITICAL: Unilateral ptosis with anisocoria. Rule out carotid artery dissection (Horner's) or expanding Posterior Communicating Artery (PCoA) aneurysm (painful CN III palsy). Emergency CTA/MRA head & neck required.",
        urgency: "critical"
      });
    }

    return flags;
  }, [heentState]);

  const handleInsertRedFlagsToNotes = () => {
    if (heentRedFlags.length === 0) return;
    const flagText = heentRedFlags
      .map(f => `[HEENT RED FLAG - ${f.category}]: ${f.title} - ${f.description}`)
      .join('\n');
    const updatedNotes = notes ? `${notes}\n\n${flagText}` : flagText;
    onChange('notes', updatedNotes);
    toast.success(`${heentRedFlags.length} HEENT Red Flags appended to Examination Notes & SOAP Feed!`);
  };

  const getChipStatus = (partId: string) => (heentState || {})[partId]?.status;

  const openAbnormalModal = (partId: string) => {
    setCurrentPart(partId);
    setModalFindings((heentState || {})[partId]?.findings || {});
    setModalOpen(true);
  };

  const handleChipClick = (partId: string) => {
    const current = (heentState || {})[partId]?.status;
    if (!current) {
      onChange('heentState', { ...heentState, [partId]: { status: 'normal', findings: {} } });
    } else if (current === 'normal') {
      openAbnormalModal(partId);
    } else {
      const next = { ...heentState };
      delete next[partId];
      onChange('heentState', next);
    }
  };

  const saveAbnormalFindings = () => {
    if (!currentPart) return;
    const hasFindings = Object.values(modalFindings).some((f: any) => f.active);
    onChange('heentState', {
      ...heentState,
      [currentPart]: hasFindings
        ? { status: 'abnormal', findings: modalFindings }
        : { status: 'normal', findings: {} }
    });
    setModalOpen(false);
  };

  const setPartNormal = () => {
    if (!currentPart) return;
    onChange('heentState', { ...heentState, [currentPart]: { status: 'normal', findings: {} } });
    setModalOpen(false);
  };

  const toggleModalFinding = (optId: string, checked: boolean) => {
    setModalFindings(prev => ({
      ...prev,
      [optId]: { ...prev[optId], active: checked, side: prev[optId]?.side || 'B' }
    }));
  };

  const setModalFindingValue = (optId: string, value: string) => {
    setModalFindings(prev => ({
      ...prev,
      [optId]: { ...prev[optId], active: true, value, side: prev[optId]?.side || 'B' }
    }));
  };

  const setModalFindingSide = (optId: string, side: 'L' | 'B' | 'R') => {
    setModalFindings(prev => ({
      ...prev,
      [optId]: { ...prev[optId], active: true, side }
    }));
  };

  const currentPartInfo = currentPart ? heentMapping[currentPart] : null;

  const categories = ["All", "Eyes & Head", "Ears", "Mouth & Throat", "Neck"];
  const filteredSmartPhrases = activeSmartCategory === "All" 
    ? heentSmartPhrases 
    : heentSmartPhrases.filter(p => p.category === activeSmartCategory);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="HEENT & Neck Examination" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      {/* Interactive HEENT Mini-Diagram / Region Selector */}
      <HeentInteractiveDiagram 
        heentState={heentState || {}}
        onJumpToSection={handleJumpToSection}
        onMarkSectionNormal={handleMarkSectionNormal}
        onClearSection={handleClearSection}
        onOpenPartAbnormalModal={openAbnormalModal}
        onChangePartStatus={(partId, newStatus) => {
          if (!newStatus) {
            const next = { ...heentState };
            delete next[partId];
            onChange('heentState', next);
          } else if (newStatus === 'normal') {
            onChange('heentState', { ...heentState, [partId]: { status: 'normal', findings: {} } });
          } else if (newStatus === 'abnormal') {
            openAbnormalModal(partId);
          }
        }}
      />

      {/* High-Risk Red Flag Alerts Banner */}
      {heentRedFlags.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400/80 rounded-xl p-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-2.5">
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => setIsRedFlagsCollapsed(prev => !prev)}
            >
              <div className="p-1.5 bg-rose-600 text-white rounded-lg animate-pulse shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <span>HEENT Emergency Red Flag Alert ({heentRedFlags.length})</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded-full font-bold">
                    CRITICAL POSITIVES
                  </span>
                </h4>
                <p className="text-[11px] text-rose-800 font-medium">
                  Automated clinical emergency warnings detected from selected physical findings.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleInsertRedFlagsToNotes}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Feed into SOAP & AI ({heentRedFlags.length})
              </button>
              <button
                type="button"
                onClick={() => setIsRedFlagsCollapsed(prev => !prev)}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-rose-200 shrink-0"
                title={isRedFlagsCollapsed ? "Expand Red Flags" : "Collapse Red Flags"}
              >
                {isRedFlagsCollapsed ? (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {!isRedFlagsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
              {heentRedFlags.map((flag, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border text-xs space-y-1 shadow-2xs",
                    flag.urgency === 'critical' ? "bg-rose-100/90 border-rose-300 text-rose-950" : "bg-amber-50 border-amber-300 text-amber-950"
                  )}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className={cn("w-4 h-4 shrink-0", flag.urgency === 'critical' ? "text-rose-600" : "text-amber-600")} />
                      <span>{flag.title}</span>
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ml-2",
                      flag.urgency === 'critical' ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                    )}>
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-snug pl-5">
                    {flag.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main HEENT Examination Section Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(heentSections || []).map(section => (
          <div key={section.key} id={`heent-sec-${section.key}`} className="rounded-lg border bg-card p-4 space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-primary">{section.title}</h5>
              <div className="flex gap-1">
                <Button
                  size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  onClick={() => handleMarkSectionNormal(section.key)}
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> All Normal
                </Button>
                <Button
                  size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                  onClick={() => handleClearSection(section.key)}
                >
                  <Trash2 className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(section.parts || []).map(partId => {
                const part = heentMapping[partId];
                const status = getChipStatus(partId);
                const hasAbnormalFindings = (heentState || {})[partId]?.status === 'abnormal' &&
                  Object.values((heentState || {})[partId]?.findings || {}).some((f: any) => f.active);
                return (
                  <button
                    key={partId}
                    type="button"
                    onClick={() => handleChipClick(partId)}
                    className={cn(
                      "px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer font-medium",
                      status === "normal" && "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-700",
                      status === "abnormal" && "bg-destructive/10 text-destructive border-destructive/30",
                      !status && "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:border-primary/30"
                    )}
                  >
                    {status === "normal" && <CheckCircle className="h-3 w-3 inline mr-0.5" />}
                    {status === "abnormal" && <AlertCircle className="h-3 w-3 inline mr-0.5" />}
                    {part?.title}
                    {hasAbnormalFindings && " •"}
                  </button>
                );
              })}
            </div>

            {section.key === "eyes" && (
              <div className="space-y-2 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Pupil Size: {pupilSize[0]}mm</Label>
                  <Slider min={1} max={9} step={1} value={pupilSize} onValueChange={(v) => onChange('pupilSize', v)} className="w-full" />
                </div>
                {onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('sse')}
                    className="w-full px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Visual Acuity & Fundoscopy in SSE</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {section.key === "ears" && onNavigateToTab && (
              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => onNavigateToTab('sse')}
                  className="w-full px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors border border-indigo-200 dark:border-indigo-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Ear className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Otoscopy & Weber/Rinne Hearing in SSE</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Abnormal Findings Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle>Abnormal: {currentPartInfo?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {(currentPartInfo?.options || []).map(opt => (
              <div key={opt.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                {opt.type === 'checkbox' ? (
                  <>
                    <Checkbox
                      checked={!!(modalFindings || {})[opt.id]?.active}
                      onCheckedChange={(v) => toggleModalFinding(opt.id, !!v)}
                    />
                    <span className="text-sm flex-1">{opt.text}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm flex-1">{opt.text}</span>
                    <Select
                      value={(modalFindings || {})[opt.id]?.value || ""}
                      onValueChange={v => setModalFindingValue(opt.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {(opt.values || []).map(v => (
                          <SelectItem key={v} value={v?.toLowerCase() || ''}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
                {opt.bilateral && (
                  <div className="flex gap-0.5 border rounded-md overflow-hidden">
                    {(['L', 'B', 'R'] as const).map(side => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setModalFindingSide(opt.id, side)}
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold transition-colors",
                          ((modalFindings || {})[opt.id]?.side || 'B') === side
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={setPartNormal}>Mark Normal</Button>
            <Button size="sm" onClick={saveAbnormalFindings}>Save Findings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section 7: Specialized High-Yield Triage & Clinical Decision Rules */}
      <HeentSpecializedCalculators onInsertToNotes={(text) => onChange('notes', notes ? `${notes}\n${text}` : text)} />

      {/* Expanded Smart Phrase Library */}
      <div className="space-y-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Expanded Smart Phrase Chips (1-Tap Narrative Descriptors)</span>
          </Label>

          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveSmartCategory(cat)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer",
                  activeSmartCategory === cat 
                    ? "bg-indigo-600 text-white shadow-2xs" 
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
          {filteredSmartPhrases.map(phrase => (
            <button 
              key={phrase.label} 
              type="button"
              onClick={() => {
                onChange('notes', notes ? `${notes}\n${phrase.text}` : phrase.text);
                toast.success(`Appended: "${phrase.label}" to Notes`);
              }}
              className="p-2.5 text-left bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-lg transition-all cursor-pointer group shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950 group-hover:text-indigo-700">
                <span>{phrase.label}</span>
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                  <span>+ Insert</span>
                  <Plus className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                "{phrase.text}"
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-800">HEENT Examination Notes</Label>
        <Textarea 
          placeholder="Enter detailed clinical narrative about HEENT findings..." 
          value={notes || ""} 
          onChange={e => onChange('notes', e.target.value)} 
          className="min-h-[90px] border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm" 
        />
      </div>
    </div>
  );
}

function SseSpecializedCalculators({ onInsertToNotes }: { onInsertToNotes: (text: string) => void }) {
  // Audiology Tuning Fork Interpreter
  const [tfWeber, setTfWeber] = useState<string>("midline");
  const [tfRinneR, setTfRinneR] = useState<string>("ac>bc");
  const [tfRinneL, setTfRinneL] = useState<string>("ac>bc");

  const audiologyInterpretation = useMemo(() => {
    const rinneR_cond = tfRinneR === "bc>ac";
    const rinneL_cond = tfRinneL === "bc>ac";

    if (tfWeber === "midline" && !rinneR_cond && !rinneL_cond) {
      return { dx: "Normal Hearing Bilaterally (or Symmetric Sensorineural Loss)", desc: "Weber is midline and Rinne is positive (AC > BC) bilaterally." };
    }
    if (tfWeber === "right") {
      if (rinneR_cond) {
        return { dx: "RIGHT Conductive Hearing Loss", desc: "Weber lateralizes to Right AND Rinne Right shows BC > AC (Conductive defect in Right ear, e.g. cerumen, otitis, ET dysfunction)." };
      }
      if (!rinneR_cond && !rinneL_cond) {
        return { dx: "LEFT Sensorineural Hearing Loss", desc: "Weber lateralizes to Right AND Rinne is AC > BC bilaterally (Sensorineural deficit in contralateral Left ear)." };
      }
    }
    if (tfWeber === "left") {
      if (rinneL_cond) {
        return { dx: "LEFT Conductive Hearing Loss", desc: "Weber lateralizes to Left AND Rinne Left shows BC > AC (Conductive defect in Left ear, e.g. cerumen, effusion, perforation)." };
      }
      if (!rinneR_cond && !rinneL_cond) {
        return { dx: "RIGHT Sensorineural Hearing Loss", desc: "Weber lateralizes to Left AND Rinne is AC > BC bilaterally (Sensorineural deficit in contralateral Right ear)." };
      }
    }
    if (rinneR_cond && rinneL_cond) {
      return { dx: "Bilateral Conductive Hearing Loss", desc: "Both Rinne tests show BC > AC, indicating bilateral middle/outer ear conductive impairment." };
    }
    return { dx: "Complex / Mixed Hearing Loss Pattern", desc: "Combined sensorineural and conductive components. Formal audiogram recommended." };
  }, [tfWeber, tfRinneR, tfRinneL]);

  // Acute Angle-Closure Glaucoma Red Flag Triage
  const [glaucomaPain, setGlaucomaPain] = useState(false);
  const [glaucomaHalos, setGlaucomaHalos] = useState(false);
  const [glaucomaHighIOP, setGlaucomaHighIOP] = useState(false);
  const [glaucomaFixedPupil, setGlaucomaFixedPupil] = useState(false);
  const [glaucomaHazyCornea, setGlaucomaHazyCornea] = useState(false);
  const [glaucomaNausea, setGlaucomaNausea] = useState(false);

  const glaucomaRedFlagsCount = [glaucomaPain, glaucomaHalos, glaucomaHighIOP, glaucomaFixedPupil, glaucomaHazyCornea, glaucomaNausea].filter(Boolean).length;
  const isGlaucomaAlert = glaucomaRedFlagsCount >= 2;

  // SSNHL Red Flag Triage
  const [ssnhlSuddenDrop, setSsnhlSuddenDrop] = useState(false);
  const [ssnhlUnilateral, setSsnhlUnilateral] = useState(false);
  const [ssnhlTinnitus, setSsnhlTinnitus] = useState(false);
  const [ssnhlFullness, setSsnhlFullness] = useState(false);

  const isSsnhlAlert = ssnhlSuddenDrop && ssnhlUnilateral;

  // BPPV Dix-Hallpike
  const [bppvEar, setBppvEar] = useState<string>("right");
  const [bppvNystagmus, setBppvNystagmus] = useState(false);
  const [bppvLatency, setBppvLatency] = useState(true);
  const [bppvFatigue, setBppvFatigue] = useState(true);

  return (
    <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Specialized Sensory Exam (SSE) Triage & Diagnostic Decision Rules
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
          Sensory Decision Support
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Tuning Fork Audiology Interpreter */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Ear className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weber/Rinne Audiology Logic</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <Label className="text-[11px] text-slate-600 font-medium">Weber Test (512Hz):</Label>
                <select
                  value={tfWeber}
                  onChange={e => setTfWeber(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium mt-0.5"
                >
                  <option value="midline">Midline (No Lateralization)</option>
                  <option value="right">Lateralizes to RIGHT Ear</option>
                  <option value="left">Lateralizes to LEFT Ear</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] text-slate-600 font-medium">Rinne RIGHT Ear:</Label>
                <select
                  value={tfRinneR}
                  onChange={e => setTfRinneR(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium mt-0.5"
                >
                  <option value="ac>bc">AC {'>'} BC (Positive / Normal)</option>
                  <option value="bc>ac">BC {'>'} AC (Negative / Conductive)</option>
                </select>
              </div>

              <div>
                <Label className="text-[11px] text-slate-600 font-medium">Rinne LEFT Ear:</Label>
                <select
                  value={tfRinneL}
                  onChange={e => setTfRinneL(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium mt-0.5"
                >
                  <option value="ac>bc">AC {'>'} BC (Positive / Normal)</option>
                  <option value="bc>ac">BC {'>'} AC (Negative / Conductive)</option>
                </select>
              </div>
            </div>

            <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[11px] space-y-0.5">
              <div className="font-bold text-indigo-950">{audiologyInterpretation.dx}</div>
              <p className="text-indigo-800 leading-tight text-[10px]">{audiologyInterpretation.desc}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const text = `[Tuning Fork Audiology Assessment]: Weber=${tfWeber}, Rinne R=${tfRinneR}, Rinne L=${tfRinneL}. Impression: ${audiologyInterpretation.dx}. ${audiologyInterpretation.desc}`;
              onInsertToNotes(text);
              toast.success("Appended Audiology Assessment to Notes!");
            }}
            className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors border border-indigo-200 cursor-pointer"
          >
            + Append Result to Notes
          </button>
        </div>

        {/* 2. Acute Angle-Closure Glaucoma Red Flag Triage */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Acute Glaucoma Triage</span>
              </span>
              {isGlaucomaAlert && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-bold animate-pulse">
                  HIGH RISK
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Severe Eye Pain / Headache</span>
                <Checkbox checked={glaucomaPain} onCheckedChange={v => setGlaucomaPain(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Rainbow Halos Around Lights</span>
                <Checkbox checked={glaucomaHalos} onCheckedChange={v => setGlaucomaHalos(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Elevated IOP (&gt;30 mmHg / Firm Globe)</span>
                <Checkbox checked={glaucomaHighIOP} onCheckedChange={v => setGlaucomaHighIOP(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Mid-Dilated Fixed Pupil</span>
                <Checkbox checked={glaucomaFixedPupil} onCheckedChange={v => setGlaucomaFixedPupil(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Hazy / Steamy Cornea</span>
                <Checkbox checked={glaucomaHazyCornea} onCheckedChange={v => setGlaucomaHazyCornea(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-0.5 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Nausea / Vomiting</span>
                <Checkbox checked={glaucomaNausea} onCheckedChange={v => setGlaucomaNausea(!!v)} />
              </label>
            </div>

            {isGlaucomaAlert ? (
              <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-[11px] space-y-1 text-rose-950">
                <div className="font-extrabold flex items-center gap-1 text-rose-700">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>EMERGENCY OPHTHALMIC ALERT</span>
                </div>
                <p className="leading-tight text-[10px]">
                  🚨 High suspicion for Acute Angle-Closure Glaucoma. Immediate IOP lowering agents (Timolol 0.5%, Apraclonidine 1%, Acetazolamide IV/oral) & urgent Ophthalmology consult for laser peripheral iridotomy.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Check symptoms to evaluate acute ocular pressure crisis risk.
              </div>
            )}
          </div>

          {isGlaucomaAlert && (
            <button
              type="button"
              onClick={() => {
                const text = `[ACUTE ANGLE-CLOSURE GLAUCOMA ALERT]: High clinical concern (${glaucomaRedFlagsCount}/6 criteria). Immediate STAT Ophthalmology consultation & pressure lowering therapy initiated.`;
                onInsertToNotes(text);
                toast.success("Appended Glaucoma Alert to Notes!");
              }}
              className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              + Append Glaucoma Alert
            </button>
          )}
        </div>

        {/* 3. Sudden Sensorineural Hearing Loss (SSNHL) Protocol */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Sudden SSNHL Triage</span>
              </span>
              {isSsnhlAlert && (
                <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[10px] rounded font-bold animate-pulse">
                  URGENT 72h WINDOW
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Sudden Hearing Loss (&lt;72h)</span>
                <Checkbox checked={ssnhlSuddenDrop} onCheckedChange={v => setSsnhlSuddenDrop(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Unilateral Deficit</span>
                <Checkbox checked={ssnhlUnilateral} onCheckedChange={v => setSsnhlUnilateral(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Associated Tinnitus</span>
                <Checkbox checked={ssnhlTinnitus} onCheckedChange={v => setSsnhlTinnitus(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Aural Fullness / Dizziness</span>
                <Checkbox checked={ssnhlFullness} onCheckedChange={v => setSsnhlFullness(!!v)} />
              </label>
            </div>

            {isSsnhlAlert ? (
              <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-[11px] space-y-1 text-amber-950">
                <div className="font-extrabold flex items-center gap-1 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>SUDDEN SENSORINEURAL LOSS</span>
                </div>
                <p className="leading-tight text-[10px]">
                  ⚠️ Otologic Emergency: Initiate oral high-dose corticosteroids (Oral Prednisone 1 mg/kg/day x 14 days) or IT Dexamethasone. Schedule urgent audiogram within 24-48 hours.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Sudden unilateral hearing loss requires rapid steroid administration to prevent permanent inner ear damage.
              </div>
            )}
          </div>

          {isSsnhlAlert && (
            <button
              type="button"
              onClick={() => {
                const text = `[SUDDEN SENSORINEURAL HEARING LOSS ALERT]: Unilateral sudden hearing loss <72h. High-dose steroid protocol initiated. Urgent ENT & audiogram referral submitted.`;
                onInsertToNotes(text);
                toast.success("Appended SSNHL Protocol to Notes!");
              }}
              className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              + Append SSNHL Protocol
            </button>
          )}
        </div>

        {/* 4. Dix-Hallpike & BPPV Management */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-3 flex flex-col justify-between shadow-2xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
                <span>Dix-Hallpike & BPPV Maneuver</span>
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <Label className="text-[11px] text-slate-600 font-medium">Tested Ear:</Label>
                <select
                  value={bppvEar}
                  onChange={e => setBppvEar(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1 font-medium mt-0.5"
                >
                  <option value="right">Right Ear Down</option>
                  <option value="left">Left Ear Down</option>
                </select>
              </div>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Torsional Upbeating Nystagmus</span>
                <Checkbox checked={bppvNystagmus} onCheckedChange={v => setBppvNystagmus(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Latency Period (2 - 15 sec)</span>
                <Checkbox checked={bppvLatency} onCheckedChange={v => setBppvLatency(!!v)} />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 hover:bg-slate-50 rounded px-1">
                <span className="text-slate-700 font-medium text-[11px]">Fatiguing with Repetition</span>
                <Checkbox checked={bppvFatigue} onCheckedChange={v => setBppvFatigue(!!v)} />
              </label>
            </div>

            {bppvNystagmus ? (
              <div className="p-2 bg-teal-50 border border-teal-300 rounded-lg text-[11px] space-y-1 text-teal-950">
                <div className="font-bold text-teal-900">POSITIVE DIX-HALLPIKE ({bppvEar.toUpperCase()} EAR)</div>
                <p className="leading-tight text-[10px]">
                  Diagnosis: Classic Posterior Canal BPPV ({bppvEar.toUpperCase()} Canalithiasis). Recommended Immediate Treatment: Epley Canalith Repositioning Maneuver.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Perform Dix-Hallpike test to trigger posterior semicircular canal BPPV nystagmus and guide Epley maneuver.
              </div>
            )}
          </div>

          {bppvNystagmus && (
            <button
              type="button"
              onClick={() => {
                const text = `[DIX-HALLPIKE TEST]: Positive for ${bppvEar.toUpperCase()} posterior canal BPPV (torsional upbeating nystagmus with latency and fatigue). Epley Canalith Repositioning Maneuver performed with resolution of symptoms.`;
                onInsertToNotes(text);
                toast.success("Appended BPPV Result to Notes!");
              }}
              className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              + Append BPPV & Epley Guide
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SseTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const { 
    visualAcuityR, visualAcuityL, visualAcuityOU, pinholeAcuity, colorVision, iopOD, iopOS, visualFields, pupilsSse, fundoscopy, 
    weber, rinneR, rinneL, whisperTest, vestibularExam, otoscopy, 
    olfactoryExam, gustatoryExam, trigeminalSensory, monofilamentTest, twoPointDiscrimination, notes 
  } = findings;

  const [normalModalOpen, setNormalModalOpen] = useState(false);

  // SSE Smart Phrase Library
  const sseSmartPhrases = [
    { title: "Normal Comprehensive SSE", text: "SPECIALIZED SENSORY EXAM: Visual acuity 20/20 OD, OS, OU uncorrected. Color vision intact (Ishihara 14/14). Visual fields full to confrontation. IOP 14 mmHg OD, 15 mmHg OS. PERRLA, no RAPD. Fundoscopy: Sharp disc margins, normal C/D ratio (0.3), no hemorrhages/exudates. Hearing intact to whisper test bilaterally. Weber midline; Rinne AC > BC bilaterally. Otoscopy: Intact TMs with crisp light reflexes. Olfactory testing: Intact smell discrimination (CN I). Gustatory testing: Intact taste perception (sweet, sour, salty, bitter). Trigeminal touch & pinprick intact across V1-V3. Corneal reflex intact. Monofilament (10g) 10/10 sites felt bilaterally." },
    { title: "Optic Neuritis / RAPD Pattern", text: "VISION/OPTIC NERVE: Reduced visual acuity OD (20/80). Red cap desaturation present OD (10/10 OS vs 3/10 OD). Positive Right Relative Afferent Pupillary Defect (Marcus Gunn Pupil). Sluggish direct light response OD with intact consensual. Swollen right optic disc with blurred margins on fundoscopy. Compatible with Acute Optic Neuritis." },
    { title: "Sensorineural Hearing Loss (Presbycusis)", text: "AUDITORY SENSORY: Symmetrical high-frequency hearing loss on whisper test. Weber test midline without lateralization. Rinne test positive bilaterally (Air conduction > Bone conduction). Intact TMs without effusion or cerumen. Clinical pattern consistent with bilateral sensorineural presbycusis." },
    { title: "Diabetic Sensory Polyneuropathy", text: "SOMATOSENSORY: Symmetric distal length-dependent sensory loss. Semmes-Weinstein 10g monofilament impaired (felt only 3/10 sites on right plantar foot, 2/10 on left). Impaired vibration perception (128 Hz tuning fork < 4 seconds at hallux). Impaired 2-point discrimination (>12 mm at fingertips). Proprioception intact at ankles." },
    { title: "Anosmia & Ageusia Screen", text: "OLFACTORY & GUSTATORY: Complete anosmia on smell identification testing (CN I). Associated hypogeusia with intact basic taste detection (salty/sour) but loss of complex flavor perception. Nasal mucosal exam without polyps or acute obstruction." }
  ];

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Specialized Sensory Exam (SSE)" 
        onMarkNormal={() => setNormalModalOpen(true)} 
        onClear={onClear} 
      />

      {/* Confirmation Modal for Mark All Normal */}
      <Dialog open={normalModalOpen} onOpenChange={setNormalModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-indigo-950">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Mark All SSE Findings Normal?</span>
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-600 leading-relaxed">
            This will set Visual Acuity (20/20 OD/OS/OU), Color Vision (14/14), IOP (14/15 mmHg), Visual Fields (Full), PERRLA (Intact), Fundoscopy (Sharp Discs), Hearing (Intact), Weber (Midline), Rinne (AC &gt; BC bilaterally), Otoscopy (Normal TMs), Olfaction (Intact CN I), Gustation (Intact), Trigeminal (Intact V1-V3), and Monofilament (10/10 sites).
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setNormalModalOpen(false)}>Cancel</Button>
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => {
                onMarkNormal();
                onChange('visualAcuityR', '20/20');
                onChange('visualAcuityL', '20/20');
                onChange('visualAcuityOU', '20/20');
                onChange('colorVision', '14/14 Ishihara');
                onChange('iopOD', '14');
                onChange('iopOS', '15');
                onChange('weber', 'midline');
                onChange('rinneR', 'ac>bc');
                onChange('rinneL', 'ac>bc');
                onChange('fundoscopy', ['normal-fundus']);
                onChange('otoscopy', ['normal-tm']);
                onChange('olfactoryExam', ['normosmia']);
                onChange('gustatoryExam', ['normal-taste']);
                onChange('trigeminalSensory', ['v1-intact', 'v2-intact', 'v3-intact', 'corneal-intact']);
                onChange('monofilamentTest', '10/10 Sites Intact Bilaterally');
                toast.success("Marked All SSE Findings as Normal!");
                setNormalModalOpen(false);
              }}
            >
              Confirm Mark Normal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5-Domain Specialized Sensory Exam Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* DOMAIN 1: Visual Sensory System */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              1. Vision & Ocular Sensory System (CN II, III, IV, VI)
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs font-bold text-slate-800">Visual Acuity (Snellen Chart)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                <div>
                  <Label className="text-[11px] text-slate-500">Right (OD)</Label>
                  <Input value={visualAcuityR || ""} onChange={e => onChange('visualAcuityR', e.target.value)} placeholder="20/20" className="h-8 text-xs mt-0.5" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">Left (OS)</Label>
                  <Input value={visualAcuityL || ""} onChange={e => onChange('visualAcuityL', e.target.value)} placeholder="20/20" className="h-8 text-xs mt-0.5" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">Both (OU)</Label>
                  <Input value={visualAcuityOU || ""} onChange={e => onChange('visualAcuityOU', e.target.value)} placeholder="20/20" className="h-8 text-xs mt-0.5" />
                </div>
                <div>
                  <Label className="text-[11px] text-slate-500">Pinhole / Near</Label>
                  <Input value={pinholeAcuity || ""} onChange={e => onChange('pinholeAcuity', e.target.value)} placeholder="Jaeger J1" className="h-8 text-xs mt-0.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-slate-800">Color Vision & Red Cap Test</Label>
                <Input value={colorVision || ""} onChange={e => onChange('colorVision', e.target.value)} placeholder="14/14 Ishihara (Red cap symmetric)" className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-800">Intraocular Pressure (IOP mm Hg)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={iopOD || ""} onChange={e => onChange('iopOD', e.target.value)} placeholder="OD: 14" className="h-8 text-xs flex-1" />
                  <Input value={iopOS || ""} onChange={e => onChange('iopOS', e.target.value)} placeholder="OS: 15" className="h-8 text-xs flex-1" />
                </div>
              </div>
            </div>

            <CheckboxFindings
              label="Pupils & RAPD (Marcus Gunn)"
              options={[
                { id: "perrla-intact", label: "PERRLA (Pupils Equal, Round, Reactive)" },
                { id: "rapd-right", label: "Right RAPD (Marcus Gunn Pupil)" },
                { id: "rapd-left", label: "Left RAPD (Marcus Gunn Pupil)" },
                { id: "light-near-dissociation", label: "Light-Near Dissociation (Argyll Robertson / Adie's)" },
              ]}
              selected={pupilsSse || []}
              onChange={(v) => onChange('pupilsSse', v)}
            />

            <CheckboxFindings
              label="Visual Fields by Confrontation"
              options={[
                { id: "vf-full", label: "Full to Confrontation Bilaterally" },
                { id: "bitemporal-hemianopia", label: "Bitemporal Hemianopia (Pituitary Adenoma)" },
                { id: "homonymous-left", label: "Left Homonymous Hemianopia" },
                { id: "homonymous-right", label: "Right Homonymous Hemianopia" },
              ]}
              selected={visualFields || []}
              onChange={(v) => onChange('visualFields', v)}
            />

            <CheckboxFindings
              label="Fundoscopy & Ophthalmoscopy"
              options={[
                { id: "normal-fundus", label: "Normal Fundus / Sharp Optic Discs" },
                { id: "papilledema", label: "Papilledema (Raised ICP)" },
                { id: "av-nicking", label: "AV Nicking / Hypertensive Retinopathy" },
                { id: "hemorrhages", label: "Retinal Flame Hemorrhages / Microaneurysms" },
                { id: "exudates", label: "Cotton Wool Spots / Hard Exudates" },
                { id: "cupping", label: "Increased Cup-to-Disc Ratio (>0.5 / Glaucoma)" },
              ]}
              selected={fundoscopy || []}
              onChange={(v) => onChange('fundoscopy', v)}
            />
          </div>
        </div>

        {/* DOMAIN 2: Auditory & Vestibular System */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Ear className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Auditory & Vestibular Sensory System (CN VIII)
            </h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-800">Tuning Fork Tests (512 Hz)</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-[11px] text-slate-500">Weber Test</Label>
                  <Select value={weber || "midline"} onValueChange={(v) => onChange('weber', v)}>
                    <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="midline">Midline (Normal / Symmetric)</SelectItem>
                      <SelectItem value="right">Lateralizes to Right Ear</SelectItem>
                      <SelectItem value="left">Lateralizes to Left Ear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] text-slate-500">Rinne (Right Ear)</Label>
                    <Select value={rinneR || "ac>bc"} onValueChange={(v) => onChange('rinneR', v)}>
                      <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac>bc">AC {'>'} BC (Normal / Sensorineural)</SelectItem>
                        <SelectItem value="bc>ac">BC {'>'} AC (Conductive Deficit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-slate-500">Rinne (Left Ear)</Label>
                    <Select value={rinneL || "ac>bc"} onValueChange={(v) => onChange('rinneL', v)}>
                      <SelectTrigger className="h-8 text-xs mt-0.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac>bc">AC {'>'} BC (Normal / Sensorineural)</SelectItem>
                        <SelectItem value="bc>ac">BC {'>'} AC (Conductive Deficit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <CheckboxFindings
              label="Whisper Voice & Audiometry Screen"
              options={[
                { id: "whisper-intact", label: "Whisper Test Intact Bilaterally" },
                { id: "whisper-impaired-r", label: "Impaired Hearing Right Ear" },
                { id: "whisper-impaired-l", label: "Impaired Hearing Left Ear" },
              ]}
              selected={whisperTest || []}
              onChange={(v) => onChange('whisperTest', v)}
            />

            <CheckboxFindings
              label="Vestibular, Balance & Dix-Hallpike"
              options={[
                { id: "romberg-negative", label: "Romberg Test Negative (Stable balance)" },
                { id: "romberg-positive", label: "Romberg Test Positive (Sensory Ataxia)" },
                { id: "fukuda-intact", label: "Fukuda Stepping Test Normal (<30° rotation)" },
                { id: "dix-hallpike-pos-r", label: "Dix-Hallpike Positive Right (Posterior BPPV)" },
                { id: "dix-hallpike-pos-l", label: "Dix-Hallpike Positive Left (Posterior BPPV)" },
              ]}
              selected={vestibularExam || []}
              onChange={(v) => onChange('vestibularExam', v)}
            />

            <CheckboxFindings
              label="Otoscopy & Tympanic Membranes"
              options={[
                { id: "normal-tm", label: "Normal TMs / Crisp Light Reflex" },
                { id: "erythema", label: "TM Erythema / Bulging (AOM)" },
                { id: "effusion", label: "Middle Ear Effusion (Serous OM)" },
                { id: "perforation", label: "TM Perforation" },
                { id: "cerumen", label: "Impacted Cerumen" },
              ]}
              selected={otoscopy || []}
              onChange={(v) => onChange('otoscopy', v)}
            />
          </div>
        </div>

        {/* DOMAIN 3: Olfactory System */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Wind className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              3. Olfactory Sensory System (CN I)
            </h3>
          </div>

          <div className="space-y-3">
            <CheckboxFindings
              label="Smell Identification & Olfactory Status"
              options={[
                { id: "normosmia", label: "Normosmia (Intact smell discrimination bilaterally)" },
                { id: "anosmia-bilateral", label: "Bilateral Anosmia (Complete loss of smell)" },
                { id: "anosmia-right", label: "Unilateral Anosmia (Right Nare)" },
                { id: "anosmia-left", label: "Unilateral Anosmia (Left Nare)" },
                { id: "hyposmia", label: "Hyposmia (Reduced smell perception)" },
                { id: "parosmia", label: "Parosmia / Dysosmia (Distorted smell perception)" },
                { id: "phantosmia", label: "Phantosmia (Olfactory Hallucinations)" },
              ]}
              selected={olfactoryExam || []}
              onChange={(v) => onChange('olfactoryExam', v)}
            />

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Clinical High-Yield Note (CN I):</span>
              <p>
                Unilateral anosmia suggests anterior cranial fossa tumor (e.g. Olfactory Groove Meningioma - Foster Kennedy Syndrome). Bilateral anosmia warrants screening for Parkinson's disease, post-viral neuropathy (COVID-19), or cribriform trauma.
              </p>
            </div>
          </div>
        </div>

        {/* DOMAIN 4: Gustatory System */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              4. Gustatory System (CN VII, IX, X)
            </h3>
          </div>

          <div className="space-y-3">
            <CheckboxFindings
              label="Taste Perception & Discrimination"
              options={[
                { id: "normal-taste", label: "Normogeusia (Intact Sweet, Sour, Salty, Bitter)" },
                { id: "ageusia", label: "Ageusia (Complete loss of taste)" },
                { id: "hypogeusia", label: "Hypogeusia (Diminished taste acuity)" },
                { id: "dysgeusia-metallic", label: "Dysgeusia / Metallic Taste (Drug-Induced)" },
                { id: "cn7-anterior-taste-loss", label: "Anterior 2/3 Tongue Taste Loss (Chorda Tympani / CN VII)" },
                { id: "cn9-posterior-taste-loss", label: "Posterior 1/3 Tongue Taste Loss (CN IX)" },
              ]}
              selected={gustatoryExam || []}
              onChange={(v) => onChange('gustatoryExam', v)}
            />

            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">Anatomical Innervation:</span>
              <p>
                Anterior 2/3 of tongue taste is mediated by CN VII (Chorda Tympani). Posterior 1/3 is mediated by CN IX (Glossopharyngeal). Epiglottis/Pharynx taste is CN X. Dysgeusia is common with Zinc deficiency, Metronidazole, Terbinafine, or ACE inhibitors.
              </p>
            </div>
          </div>
        </div>

        {/* DOMAIN 5: Somatosensory & Trigeminal System */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Hand className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              5. Trigeminal Facial & Peripheral Somatosensory System (CN V & Peripheral Tracks)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CheckboxFindings
              label="Trigeminal Cranial Divisions (CN V)"
              options={[
                { id: "v1-intact", label: "CN V1 Ophthalmic Division Intact (Forehead / Corneal)" },
                { id: "v2-intact", label: "CN V2 Maxillary Division Intact (Cheek / Upper Lip)" },
                { id: "v3-intact", label: "CN V3 Mandibular Division Intact (Jaw / Lower Lip)" },
                { id: "corneal-intact", label: "Corneal Reflex Intact Bilaterally (CN V1 / VII)" },
                { id: "trigeminal-neuralgia", label: "Trigeminal Trigger Point Pain (Tic Douloureux)" },
              ]}
              selected={trigeminalSensory || []}
              onChange={(v) => onChange('trigeminalSensory', v)}
            />

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-800">Semmes-Weinstein 10g Monofilament (Diabetic Neuropathy)</Label>
                <Input value={monofilamentTest || ""} onChange={e => onChange('monofilamentTest', e.target.value)} placeholder="10/10 Sites Intact Bilaterally" className="h-8 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-800">2-Point Discrimination & Vibration (128 Hz)</Label>
                <Input value={twoPointDiscrimination || ""} onChange={e => onChange('twoPointDiscrimination', e.target.value)} placeholder="2-Point < 5mm at fingertips; Vibration >10s at hallux" className="h-8 text-xs mt-1" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Triage & Clinical Decision Rules Component */}
      <SseSpecializedCalculators onInsertToNotes={(text) => onChange('notes', notes ? `${notes}\n${text}` : text)} />

      {/* Expanded Smart Phrase Library */}
      <div className="space-y-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Expanded Smart Phrase Library for SSE
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Click any chip to append phrase to Clinical Notes</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {sseSmartPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                const updated = notes ? `${notes}\n\n${phrase.text}` : phrase.text;
                onChange('notes', updated);
                toast.success(`Inserted "${phrase.title}" into notes!`);
              }}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{phrase.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-slate-800">Specialized Sensory Exam Clinical Narrative Notes</Label>
        <Textarea 
          placeholder="Enter detailed clinical narrative about SSE findings..." 
          value={notes || ""} 
          onChange={e => onChange('notes', e.target.value)} 
          className="min-h-[100px] border-slate-200 focus:ring-2 focus:ring-indigo-500 text-sm" 
        />
      </div>
    </div>
  );
}

const cardioHeartRegions = [
  { id: "aortic", label: "Aortic", x: "55%", y: "18%" },
  { id: "pulmonic", label: "Pulmonic", x: "38%", y: "18%" },
  { id: "erbs", label: "Erb's", x: "42%", y: "38%" },
  { id: "tricuspid", label: "Tricuspid", x: "50%", y: "55%" },
  { id: "mitral", label: "Mitral", x: "60%", y: "70%" },
];

const cardioAuscultationFindings = [
  { id: "s1-normal", label: "S1 Normal" },
  { id: "s2-normal", label: "S2 Normal" },
  { id: "s3-gallop", label: "S3 Gallop" },
  { id: "s4-gallop", label: "S4 Gallop" },
  { id: "systolic-murmur", label: "Systolic Murmur" },
  { id: "diastolic-murmur", label: "Diastolic Murmur" },
  { id: "mid-systolic-click", label: "Mid-systolic Click" },
  { id: "opening-snap", label: "Opening Snap" },
  { id: "pericardial-rub", label: "Pericardial Rub" },
  { id: "mediastinal-crunch", label: "Mediastinal Crunch" },
];

const cardioInspectionFindings = [
  { id: "jvd-elevated", label: "JVD Elevated" },
  { id: "visible-pulsations", label: "Visible Pulsations" },
  { id: "cyanosis", label: "Cyanosis" },
  { id: "clubbing", label: "Clubbing" },
  { id: "edema", label: "Peripheral Edema" },
  { id: "xanthoma", label: "Xanthoma" },
  { id: "surgical-scar", label: "Surgical Scar" },
];

const cardioPalpationFindings = [
  { id: "normal-apex", label: "Normal Apex Beat" },
  { id: "displaced-apex", label: "Displaced Apex" },
  { id: "parasternal-heave", label: "Parasternal Heave" },
  { id: "thrills", label: "Thrills" },
  { id: "palpable-p2", label: "Palpable P2" },
  { id: "tender-chest", label: "Chest Wall Tenderness" },
];

const cardioAllFindingsList = [...cardioAuscultationFindings, ...cardioInspectionFindings, ...cardioPalpationFindings];

const cardioFindingAnalysis: Record<string, { severity?: string[]; timing?: string[]; character?: string[]; grade?: string[]; radiation?: string[]; maneuver?: string[]; significance: string }> = {
  "systolic-murmur": {
    grade: ["I/VI", "II/VI", "III/VI", "IV/VI", "V/VI", "VI/VI"],
    timing: ["Early Systolic", "Mid-Systolic", "Late Systolic", "Pan-Systolic"],
    character: ["Blowing", "Harsh", "Musical", "Crescendo-Decrescendo", "Plateau"],
    radiation: ["Axilla", "Carotids", "Back", "None"],
    maneuver: ["Increases with Squatting", "Decreases with Valsalva", "Increases with Handgrip"],
    significance: "Consider aortic stenosis (mid-systolic, harsh), mitral regurgitation (pan-systolic, blowing), or HOCM (increases with Valsalva).",
  },
  "diastolic-murmur": {
    grade: ["I/IV", "II/IV", "III/IV", "IV/IV"],
    timing: ["Early Diastolic", "Mid-Diastolic", "Late Diastolic (Presystolic)"],
    character: ["Blowing", "Rumbling"],
    maneuver: ["Handgrip increases AR", "Inspiration increases right-sided", "Left lateral decubitus increases MS"],
    significance: "Always pathological. Consider aortic regurgitation (early, blowing) or mitral stenosis (mid, rumbling).",
  },
  "mid-systolic-click": {
    significance: "Classic sign of Mitral Valve Prolapse (MVP). Often followed by a late systolic murmur.",
  },
  "opening-snap": {
    significance: "High-pitched sound following S2, characteristic of Mitral Stenosis. S2-OS interval inverse to severity.",
  },
  "s3-gallop": {
    significance: "Suggests volume overload or ventricular dysfunction — consider heart failure or mitral regurgitation. Normal in young adults/pregnancy.",
  },
  "s4-gallop": {
    significance: "Suggests reduced ventricular compliance — consider hypertension, aortic stenosis, or hypertrophic cardiomyopathy.",
  },
  "pericardial-rub": {
    character: ["Scratchy", "Grating", "Three-component"],
    significance: "Suggests pericarditis. Often louder when leaning forward in expiration.",
  },
  "mediastinal-crunch": {
    significance: "Hamman's sign: Crunching/clicking sound synchronous with heart beat. Suggests pneumomediastinum.",
  },
  "jvd-elevated": {
    severity: ["Mild", "Moderate", "Severe"],
    significance: "Suggests elevated right atrial pressure — consider right heart failure, PE, cardiac tamponade, or constrictive pericarditis.",
  },
  "cyanosis": {
    severity: ["Mild", "Moderate", "Severe"],
    character: ["Central", "Peripheral"],
    significance: "Central: cardiopulmonary disease, R-to-L shunt. Peripheral: poor perfusion, vasoconstriction.",
  },
  "edema": {
    severity: ["Trace", "1+ (2mm)", "2+ (4mm)", "3+ (6mm)", "4+ (8mm)"],
    significance: "Suggests right heart failure, venous insufficiency, or systemic fluid overload.",
  },
  "displaced-apex": {
    significance: "Suggests left ventricular enlargement — consider dilated cardiomyopathy, severe aortic/mitral valve disease.",
  },
  "parasternal-heave": {
    significance: "Suggests right ventricular hypertrophy — consider pulmonary hypertension, right heart failure.",
  },
  thrills: {
    significance: "Palpable vibration corresponding to loud murmur (≥ grade IV). Indicates significant valvular pathology.",
  },
  "clubbing": {
    significance: "Consider congenital heart disease, infective endocarditis, or chronic hypoxia.",
  },
  "s1-normal": { significance: "Normal first heart sound." },
  "s2-normal": { significance: "Normal second heart sound." },
  "visible-pulsations": { significance: "May indicate aortic regurgitation or aneurysm." },
  "xanthoma": { significance: "Suggests familial hyperlipidemia — cardiovascular risk marker." },
  "normal-apex": { significance: "Apex beat in normal position (5th ICS, MCL) — normal finding." },
  "palpable-p2": { significance: "Suggests pulmonary hypertension." },
};

interface FindingDetail {
  regionId: string;
  regionLabel: string;
  findingId: string;
  findingLabel: string;
}

export function CardiovascularTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    heart = [],
    pulses = "normal",
    regionFindings = {},
    notes = ""
  } = findings || {};

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<FindingDetail | null>(null);

  const getRegionFindings = (region: string, tab: string): string[] =>
    (regionFindings || {})[region]?.[tab] || [];

  const setRegionTabFindings = (region: string, tab: string, findingsList: string[]) => {
    const currentRegion = (regionFindings || {})[region] || {
      auscultation: [],
      inspection: [],
      palpation: []
    };
    
    onChange('regionFindings', {
      ...(regionFindings || {}),
      [region]: {
        ...currentRegion,
        [tab]: findingsList,
      },
    });
  };

  const getRegionFindingCount = (regionId: string): number => {
    const region = (regionFindings || {})[regionId];
    if (!region) return 0;
    return (region.auscultation?.length || 0) + (region.inspection?.length || 0) + (region.palpation?.length || 0);
  };

  const getRegionFindingItems = (regionId: string): { findingId: string; label: string }[] => {
    const region = (regionFindings || {})[regionId];
    if (!region) return [];
    const items: { findingId: string; label: string }[] = [];
    
    ['auscultation', 'inspection', 'palpation'].forEach(tab => {
      ((region || {})[tab] || []).forEach((id: string) => {
        const match = cardioAllFindingsList.find(f => id.endsWith(f.id));
        if (match) items.push({ findingId: match.id, label: match.label });
      });
    });
    return items;
  };

  const getDetail = (regionId: string, findingId: string, prop: string) =>
    findings.findingDetails?.[`${regionId}::${findingId}::${prop}`]?.value || "";

  const setDetail = (regionId: string, findingId: string, prop: string, value: string) => {
    const key = `${regionId}::${findingId}::${prop}`;
    const currentDetails = findings.findingDetails || {};
    onChange('findingDetails', { ...currentDetails, [key]: { value } });
  };

  const hasDetailData = (regionId: string, findingId: string): boolean => {
    const prefix = `${regionId}::${findingId}::`;
    return Object.keys(findings.findingDetails || {}).some(k => k.startsWith(prefix) && findings.findingDetails[k]?.value);
  };

  const analysis = analysisTarget ? cardioFindingAnalysis[analysisTarget.findingId] : null;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Cardiovascular System" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <CheckboxFindings
        label="Heart"
        options={[
          { id: "regular-rate", label: "Regular Rate" },
          { id: "regular-rhythm", label: "Regular Rhythm" },
          { id: "normal-s1", label: "Normal S1" },
          { id: "normal-s2", label: "Normal S2" },
          { id: "no-murmurs", label: "No Murmurs" },
          { id: "no-gallops", label: "No Gallops" },
        ]}
        selected={heart}
        onChange={(v) => onChange('heart', v)}
      />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Pulses & Circulation</Label>
        <RadioGroup value={pulses} onValueChange={(v) => onChange('pulses', v)} className="flex gap-4">
          {["Normal", "Weak", "Bounding"].map(v => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v?.toLowerCase() || ''} id={`pulse-${v}`} />
              <Label htmlFor={`pulse-${v}`} className="text-sm cursor-pointer">{v}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Heart Map */}
        <div className="relative mx-auto w-fit">
          <img src={heartImage} alt="Heart Map" className="w-64 h-64 object-contain opacity-80" />
          {(cardioHeartRegions || []).map(region => {
            const count = getRegionFindingCount(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={cn(
                  "absolute w-9 h-9 rounded-full border-2 transition-all -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold",
                  count > 0
                    ? "bg-destructive/15 border-destructive/50 text-destructive"
                    : "bg-background/60 border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10"
                )}
                style={{ left: region.x, top: region.y }}
                title={region.label}
              >
                {count > 0 ? count : region.label.slice(0, 3)}
              </button>
            );
          })}
        </div>

        {/* Finding badges */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-slate-700 border-b pb-2">Findings Summary</h5>
          {cardioHeartRegions.some(r => getRegionFindingCount(r.id) > 0) ? (
            <div className="space-y-3">
              {cardioHeartRegions.filter(r => getRegionFindingCount(r.id) > 0).map(region => (
                <div key={region.id} className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 block">{region.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getRegionFindingItems(region.id).map((item, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          "text-[10px] h-5 cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-colors border",
                          hasDetailData(region.id, item.findingId)
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-transparent"
                        )}
                        onClick={() => setAnalysisTarget({ regionId: region.id, regionLabel: region.label, findingId: item.findingId, findingLabel: item.label })}
                      >
                        {item.label}
                        {hasDetailData(region.id, item.findingId) && <Info className="h-2.5 w-2.5 ml-0.5" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic py-4 text-center border border-dashed rounded-lg">
              No findings recorded yet.<br/>Click on the map regions to add findings.
            </div>
          )}
        </div>
      </div>

      {/* Region Findings Modal */}
      <Dialog open={!!selectedRegion} onOpenChange={(open) => { if (!open) setSelectedRegion(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {cardioHeartRegions.find(r => r.id === selectedRegion)?.label} Area Findings
            </DialogTitle>
          </DialogHeader>
          {selectedRegion && (
            <Tabs defaultValue="auscultation" className="space-y-3">
              <TabsList className="h-8 p-0.5 bg-muted/50 w-full">
                <TabsTrigger value="auscultation" className="gap-1 text-xs h-7 flex-1">
                  <Ear className="h-3 w-3" />Auscultation
                </TabsTrigger>
                <TabsTrigger value="inspection" className="gap-1 text-xs h-7 flex-1">
                  <Eye className="h-3 w-3" />Inspection
                </TabsTrigger>
                <TabsTrigger value="palpation" className="gap-1 text-xs h-7 flex-1">
                  <Hand className="h-3 w-3" />Palpation
                </TabsTrigger>
              </TabsList>
              <TabsContent value="auscultation">
                <CheckboxFindings
                  label="Auscultation"
                  options={(cardioAuscultationFindings || []).map(f => ({ id: `${selectedRegion}-ausc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "auscultation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "auscultation", v)}
                />
              </TabsContent>
              <TabsContent value="inspection">
                <CheckboxFindings
                  label="Inspection"
                  options={(cardioInspectionFindings || []).map(f => ({ id: `${selectedRegion}-insp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "inspection")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "inspection", v)}
                />
              </TabsContent>
              <TabsContent value="palpation">
                <CheckboxFindings
                  label="Palpation"
                  options={(cardioPalpationFindings || []).map(f => ({ id: `${selectedRegion}-palp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "palpation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "palpation", v)}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Finding Analysis Modal */}
      <Dialog open={!!analysisTarget} onOpenChange={(open) => { if (!open) setAnalysisTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          {analysisTarget && analysis && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">
                  <span className="text-primary">{analysisTarget.findingLabel}</span>
                  <span className="text-muted-foreground font-normal"> — {analysisTarget.regionLabel}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {analysis.grade && (
                  <div className="space-y-1">
                    <Label className="text-xs">Grade</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "grade")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "grade", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select grade" /></SelectTrigger>
                      <SelectContent>{(analysis.grade || []).map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.severity && (
                  <div className="space-y-1">
                    <Label className="text-xs">Severity</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "severity")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "severity", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select severity" /></SelectTrigger>
                      <SelectContent>{analysis.severity.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.timing && (
                  <div className="space-y-1">
                    <Label className="text-xs">Timing</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "timing")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "timing", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select timing" /></SelectTrigger>
                      <SelectContent>{analysis.timing.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.character && (
                  <div className="space-y-1">
                    <Label className="text-xs">Character</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "character")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "character", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select character" /></SelectTrigger>
                      <SelectContent>{analysis.character.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.radiation && (
                  <div className="space-y-1">
                    <Label className="text-xs">Radiation</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "radiation")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "radiation", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select radiation" /></SelectTrigger>
                      <SelectContent>{(analysis.radiation || []).map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="rounded-md bg-muted/50 border border-border p-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Clinical Significance: </span>
                    {analysis.significance}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed cardiovascular findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

const auscultationFindings = [
  { id: "wheeze", label: "Wheeze" },
  { id: "rales", label: "Rales/Crackles" },
  { id: "rhonchi", label: "Rhonchi" },
  { id: "decreased-bs", label: "Decreased Breath Sounds" },
  { id: "stridor", label: "Stridor" },
  { id: "pleural-rub", label: "Pleural Rub" },
  { id: "bronchial-bs", label: "Bronchial Breath Sounds" },
  { id: "vesicular-bs", label: "Vesicular Breath Sounds" },
];

const percussionFindings = [
  { id: "resonant", label: "Resonant" },
  { id: "hyperresonant", label: "Hyperresonant" },
  { id: "dull", label: "Dull" },
  { id: "stony-dull", label: "Stony Dull" },
  { id: "tympanitic", label: "Tympanitic" },
];

const palpationFindings = [
  { id: "normal-expansion", label: "Normal Expansion" },
  { id: "reduced-expansion", label: "Reduced Expansion" },
  { id: "tactile-fremitus-increased", label: "Tactile Fremitus ↑" },
  { id: "tactile-fremitus-decreased", label: "Tactile Fremitus ↓" },
  { id: "tender", label: "Tender" },
  { id: "subcutaneous-emphysema", label: "Subcutaneous Emphysema" },
];

const allFindingsList = [...auscultationFindings, ...percussionFindings, ...palpationFindings];

// Finding-specific analysis options
const findingAnalysis: Record<string, { severity?: string[]; timing?: string[]; character?: string[]; pattern?: string[]; significance: string }> = {
  wheeze: {
    severity: ["Mild", "Moderate", "Severe"],
    timing: ["Inspiratory", "Expiratory", "Both"],
    character: ["Monophonic", "Polyphonic"],
    pattern: ["Localized", "Diffuse"],
    significance: "Suggests airway narrowing — consider asthma, COPD, bronchospasm, or foreign body.",
  },
  rales: {
    severity: ["Few", "Moderate", "Profuse"],
    timing: ["Early Inspiratory", "Late Inspiratory", "Pan-Inspiratory"],
    character: ["Fine (Velcro-like)", "Coarse"],
    significance: "Fine crackles suggest pulmonary fibrosis or early CHF. Coarse crackles suggest pneumonia, bronchiectasis, or pulmonary edema.",
  },
  rhonchi: {
    severity: ["Mild", "Moderate", "Severe"],
    timing: ["Inspiratory", "Expiratory", "Both"],
    character: ["Low-pitched", "Sonorous"],
    significance: "Indicates secretions in larger airways — consider bronchitis, COPD, or aspiration.",
  },
  "decreased-bs": {
    severity: ["Mildly Decreased", "Markedly Decreased", "Absent"],
    significance: "Consider pleural effusion, pneumothorax, atelectasis, or severe hyperinflation (emphysema).",
  },
  stridor: {
    severity: ["Mild", "Moderate", "Severe"],
    timing: ["Inspiratory", "Expiratory", "Biphasic"],
    significance: "Upper airway obstruction — urgent evaluation needed. Consider croup, epiglottitis, foreign body, or anaphylaxis.",
  },
  "pleural-rub": {
    timing: ["Inspiratory", "Expiratory", "Both"],
    character: ["Creaking", "Grating"],
    significance: "Suggests pleuritis — consider infection, PE, autoimmune conditions, or malignancy.",
  },
  "bronchial-bs": {
    significance: "Bronchial sounds heard peripherally suggest consolidation (e.g., lobar pneumonia). Normal over trachea/mainstem.",
  },
  "vesicular-bs": {
    significance: "Normal breath sounds. Absence or asymmetry may indicate underlying pathology.",
  },
  resonant: {
    significance: "Normal percussion finding over aerated lung tissue.",
  },
  hyperresonant: {
    significance: "Suggests air trapping or pneumothorax. Consider emphysema or tension pneumothorax.",
  },
  dull: {
    significance: "Suggests consolidation (pneumonia), atelectasis, or pleural thickening.",
  },
  "stony-dull": {
    significance: "Classic for pleural effusion. Consider transudate vs exudate workup.",
  },
  tympanitic: {
    significance: "Suggests large pneumothorax or large air-filled cavity.",
  },
  "normal-expansion": {
    significance: "Symmetrical chest expansion — normal finding.",
  },
  "reduced-expansion": {
    pattern: ["Unilateral", "Bilateral"],
    significance: "Unilateral: effusion, pneumothorax, collapse. Bilateral: COPD, restrictive disease, neuromuscular weakness.",
  },
  "tactile-fremitus-increased": {
    significance: "Increased fremitus suggests consolidation (solid tissue transmits vibration better).",
  },
  "tactile-fremitus-decreased": {
    significance: "Decreased fremitus suggests effusion, pneumothorax, or thick chest wall.",
  },
  tender: {
    severity: ["Mild", "Moderate", "Severe"],
    pattern: ["Localized", "Diffuse"],
    significance: "Consider costochondritis, rib fracture, muscle strain, or referred visceral pain.",
  },
  "subcutaneous-emphysema": {
    severity: ["Minimal (Crepitus)", "Moderate", "Extensive"],
    significance: "Air in subcutaneous tissue — consider pneumothorax, pneumomediastinum, esophageal rupture, or post-procedural.",
  },
};



export function RespiratoryTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    lungs,
    regionalFindings,
    notes
  } = findings;

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<FindingDetail | null>(null);

  const getRegionFindings = (region: string, tab: string): string[] => {
    return regionalFindings[region]?.[tab] || [];
  };

  const setRegionTabFindings = (region: string, tab: string, findingsList: string[]) => {
    const currentRegion = regionalFindings[region] || {
      inspection: [],
      palpationPercussion: [],
      auscultation: [],
      description: '',
      severity: 'Mild',
      analysis: '',
      redFlags: [],
      suggestedLabs: [],
      suggestedPrescriptions: []
    };
    
    onChange('regionalFindings', {
      ...regionalFindings,
      [region]: {
        ...currentRegion,
        [tab]: findingsList,
      },
    });
  };

  const getRegionFindingCount = (regionId: string): number => {
    const region = regionalFindings[regionId];
    if (!region) return 0;
    return (region.inspection?.length || 0) + (region.palpationPercussion?.length || 0) + (region.auscultation?.length || 0);
  };

  const getRegionFindingItems = (regionId: string): { findingId: string; label: string }[] => {
    const region = regionalFindings[regionId];
    if (!region) return [];
    const items: { findingId: string; label: string }[] = [];
    
    ['inspection', 'palpationPercussion', 'auscultation'].forEach(tab => {
      (region[tab] || []).forEach((id: string) => {
        const match = allFindingsList.find(f => id.endsWith(f.id));
        if (match) items.push({ findingId: match.id, label: match.label });
      });
    });
    return items;
  };

  const getDetail = (regionId: string, findingId: string, prop: string) => {
    // In the new structure, we might need to store finding-specific details differently
    // or keep a separate findingDetails object in the state.
    // For now, let's assume we keep findingDetails in the parent state too.
    return findings.findingDetails?.[`${regionId}::${findingId}::${prop}`]?.value || "";
  };

  const setDetail = (regionId: string, findingId: string, prop: string, value: string) => {
    const key = `${regionId}::${findingId}::${prop}`;
    const currentDetails = findings.findingDetails || {};
    onChange('findingDetails', { ...currentDetails, [key]: { value } });
  };

  const hasDetailData = (regionId: string, findingId: string): boolean => {
    const prefix = `${regionId}::${findingId}::`;
    return Object.keys(findings.findingDetails || {}).some(k => k.startsWith(prefix) && findings.findingDetails[k]?.value);
  };

  const handleBadgeClick = (regionId: string, regionLabel: string, findingId: string, findingLabel: string) => {
    setAnalysisTarget({ regionId, regionLabel, findingId, findingLabel });
  };

  const analysis = analysisTarget ? findingAnalysis[analysisTarget.findingId] : null;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Respiratory System" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <CheckboxFindings
        label="Lungs"
        options={[
          { id: "clear-breath-sounds", label: "Clear Breath Sounds" },
          { id: "equal-expansion", label: "Equal Expansion" },
          { id: "no-wheezes", label: "No Wheezes" },
          { id: "no-rales", label: "No Rales" },
          { id: "no-rhonchi", label: "No Rhonchi" },
        ]}
        selected={lungs}
        onChange={(v) => onChange('lungs', v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Lung Map */}
        <div className="relative mx-auto w-fit">
          <img src={chestImage} alt="Lung Map" className="w-64 h-64 object-contain opacity-80" />
          {(lungRegions || []).map(region => {
            const count = getRegionFindingCount(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={cn(
                  "absolute w-9 h-9 rounded-full border-2 transition-all -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold",
                  count > 0
                    ? "bg-destructive/15 border-destructive/50 text-destructive"
                    : "bg-white/60 dark:bg-slate-950/60 border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10"
                )}
                style={{ left: region.x, top: region.y }}
                title={region.label}
              >
                {count > 0 ? count : region.label.split(" ").map(w => w[0]).join("")}
              </button>
            );
          })}
        </div>

        {/* Clickable findings summary badges */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-slate-700 border-b pb-2">Findings Summary</h5>
          {lungRegions.some(r => getRegionFindingCount(r.id) > 0) ? (
            <div className="space-y-3">
              {lungRegions.filter(r => getRegionFindingCount(r.id) > 0).map(region => (
                <div key={region.id} className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 block">{region.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(getRegionFindingItems(region.id) || []).map((item, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          "text-[10px] h-5 cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-colors border",
                          hasDetailData(region.id, item.findingId)
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-transparent"
                        )}
                        onClick={() => handleBadgeClick(region.id, region.label, item.findingId, item.label)}
                      >
                        {item.label}
                        {hasDetailData(region.id, item.findingId) && (
                          <Info className="h-2.5 w-2.5 ml-0.5" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic py-4 text-center border border-dashed rounded-lg">
              No findings recorded yet.<br/>Click on the map regions to add findings.
            </div>
          )}
        </div>
      </div>

      {/* Region Findings Modal */}
      <Dialog open={!!selectedRegion} onOpenChange={(open) => { if (!open) setSelectedRegion(null); }}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {lungRegions.find(r => r.id === selectedRegion)?.label} Findings
            </DialogTitle>
          </DialogHeader>

          {selectedRegion && (
            <Tabs defaultValue="auscultation" className="space-y-3">
              <TabsList className="h-8 p-0.5 bg-muted/50 w-full">
                <TabsTrigger value="auscultation" className="gap-1 text-xs h-7 flex-1">
                  <Ear className="h-3 w-3" />Auscultation
                </TabsTrigger>
                <TabsTrigger value="percussion" className="gap-1 text-xs h-7 flex-1">
                  <Hand className="h-3 w-3" />Percussion
                </TabsTrigger>
                <TabsTrigger value="palpation" className="gap-1 text-xs h-7 flex-1">
                  <Wind className="h-3 w-3" />Palpation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="auscultation">
                <CheckboxFindings
                  label="Auscultation"
                  options={(auscultationFindings || []).map(f => ({ id: `${selectedRegion}-ausc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "auscultation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "auscultation", v)}
                />
              </TabsContent>
              <TabsContent value="percussion">
                <CheckboxFindings
                  label="Percussion"
                  options={(percussionFindings || []).map(f => ({ id: `${selectedRegion}-perc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "percussion")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "percussion", v)}
                />
              </TabsContent>
              <TabsContent value="palpation">
                <CheckboxFindings
                  label="Palpation"
                  options={(palpationFindings || []).map(f => ({ id: `${selectedRegion}-palp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "palpation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "palpation", v)}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Finding Analysis Modal */}
      <Dialog open={!!analysisTarget} onOpenChange={(open) => { if (!open) setAnalysisTarget(null); }}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-slate-950">
          {analysisTarget && analysis && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">
                  <span className="text-primary">{analysisTarget.findingLabel}</span>
                  <span className="text-muted-foreground font-normal"> — {analysisTarget.regionLabel}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                {analysis.severity && (
                  <div className="space-y-1">
                    <Label className="text-xs">Severity</Label>
                    <Select
                      value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "severity")}
                      onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "severity", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select severity" /></SelectTrigger>
                      <SelectContent>
                        {(analysis.severity || []).map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {analysis.timing && (
                  <div className="space-y-1">
                    <Label className="text-xs">Timing</Label>
                    <Select
                      value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "timing")}
                      onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "timing", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select timing" /></SelectTrigger>
                      <SelectContent>
                        {(analysis.timing || []).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {analysis.character && (
                  <div className="space-y-1">
                    <Label className="text-xs">Character</Label>
                    <Select
                      value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "character")}
                      onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "character", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select character" /></SelectTrigger>
                      <SelectContent>
                        {(analysis.character || []).map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {analysis.pattern && (
                  <div className="space-y-1">
                    <Label className="text-xs">Pattern</Label>
                    <Select
                      value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "pattern")}
                      onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "pattern", v)}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select pattern" /></SelectTrigger>
                      <SelectContent>
                        {(analysis.pattern || []).map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="rounded-md bg-muted/50 border border-border p-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Clinical Significance: </span>
                    {analysis.significance}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea
          placeholder="Enter detailed notes about respiratory findings..."
          value={notes || ""}
          onChange={e => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}

const giAbdomenRegions = [
  { id: "right-upper-quadrant", label: "RUQ", x: "35%", y: "30%" },
  { id: "left-upper-quadrant", label: "LUQ", x: "65%", y: "30%" },
  { id: "right-lower-quadrant", label: "RLQ", x: "35%", y: "70%" },
  { id: "left-lower-quadrant", label: "LLQ", x: "65%", y: "70%" },
  { id: "epigastric", label: "Epi", x: "50%", y: "15%" },
  { id: "umbilical", label: "Umb", x: "50%", y: "50%" },
  { id: "suprapubic", label: "SP", x: "50%", y: "88%" },
];

const giPalpationFindings = [
  { id: "tenderness", label: "Tenderness" },
  { id: "rebound", label: "Rebound Tenderness" },
  { id: "guarding", label: "Guarding" },
  { id: "rigidity", label: "Rigidity" },
  { id: "mass", label: "Mass" },
  { id: "hepatomegaly", label: "Hepatomegaly" },
  { id: "splenomegaly", label: "Splenomegaly" },
];

const giAuscultationFindings = [
  { id: "normal-bs", label: "Normal Bowel Sounds" },
  { id: "hyperactive-bs", label: "Hyperactive Bowel Sounds" },
  { id: "hypoactive-bs", label: "Hypoactive Bowel Sounds" },
  { id: "absent-bs", label: "Absent Bowel Sounds" },
  { id: "bruit", label: "Bruit" },
];

const giPercussionFindings = [
  { id: "tympanitic", label: "Tympanitic" },
  { id: "dull", label: "Dull" },
  { id: "shifting-dullness", label: "Shifting Dullness" },
  { id: "fluid-thrill", label: "Fluid Thrill" },
];

const giInspectionFindings = [
  { id: "distension", label: "Distension" },
  { id: "scars", label: "Scars" },
  { id: "visible-peristalsis", label: "Visible Peristalsis" },
  { id: "caput-medusae", label: "Caput Medusae" },
  { id: "striae", label: "Striae" },
];

const giAllFindingsList = [...giPalpationFindings, ...giAuscultationFindings, ...giPercussionFindings, ...giInspectionFindings];

const giFindingAnalysis: Record<string, { severity?: string[]; timing?: string[]; character?: string[]; pattern?: string[]; significance: string }> = {
  tenderness: {
    severity: ["Mild", "Moderate", "Severe"],
    character: ["Superficial", "Deep"],
    significance: "Localized tenderness helps narrow differential — RUQ (cholecystitis), RLQ (appendicitis), LLQ (diverticulitis), epigastric (PUD, pancreatitis).",
  },
  rebound: {
    severity: ["Mild", "Moderate", "Severe"],
    significance: "Suggests peritoneal irritation — consider peritonitis, appendicitis, or perforated viscus. Urgent surgical evaluation may be needed.",
  },
  guarding: {
    character: ["Voluntary", "Involuntary"],
    significance: "Involuntary guarding strongly suggests peritonitis. Voluntary guarding may be due to anxiety or pain anticipation.",
  },
  rigidity: {
    pattern: ["Localized", "Diffuse (Board-like)"],
    significance: "Board-like rigidity is a surgical emergency — suggests generalized peritonitis from perforation.",
  },
  mass: {
    character: ["Firm", "Soft", "Pulsatile", "Mobile", "Fixed"],
    significance: "Pulsatile mass: consider AAA. Fixed firm mass: consider malignancy. Characterize size, location, and mobility.",
  },
  hepatomegaly: {
    severity: ["Mild (1-2cm)", "Moderate (3-5cm)", "Severe (>5cm)"],
    character: ["Smooth", "Nodular", "Tender"],
    significance: "Smooth tender: hepatitis, CHF. Nodular: cirrhosis, metastases. Measure span in MCL.",
  },
  splenomegaly: {
    severity: ["Mild", "Moderate", "Massive"],
    significance: "Consider infections (mono, malaria), hematologic malignancies, portal hypertension, or hemolytic anemias.",
  },
  "hyperactive-bs": {
    significance: "Suggests increased GI motility — consider gastroenteritis, early obstruction, or GI bleed.",
  },
  "hypoactive-bs": {
    significance: "Suggests decreased motility — consider ileus, post-operative state, or peritonitis.",
  },
  "absent-bs": {
    significance: "Suggests paralytic ileus or late mechanical obstruction. Listen for full 2 minutes before documenting.",
  },
  bruit: {
    pattern: ["Unilateral", "Bilateral"],
    significance: "Abdominal bruit suggests renal artery stenosis or aortic atherosclerosis. Consider in hypertensive patients.",
  },
  "shifting-dullness": {
    significance: "Suggests ascites (>500mL). Consider cirrhosis, malignancy, CHF, or nephrotic syndrome.",
  },
  "fluid-thrill": {
    significance: "Confirms large-volume ascites. Correlate with shifting dullness.",
  },
  distension: {
    severity: ["Mild", "Moderate", "Severe"],
    significance: "Consider the 5 F's: Fat, Fluid, Flatus, Feces, Fetus. Also consider obstruction or organomegaly.",
  },
  "visible-peristalsis": {
    significance: "Suggests mechanical bowel obstruction, especially in thin patients.",
  },
  "caput-medusae": {
    significance: "Dilated periumbilical veins suggest portal hypertension — classic sign of cirrhosis.",
  },
  "normal-bs": { significance: "Normal bowel sounds present — no concern." },
  tympanitic: { significance: "Normal over gas-filled bowel. Increased tympany may suggest obstruction or ileus." },
  dull: { significance: "Dullness over solid organs (liver, spleen) is normal. Unexpected dullness may suggest mass or fluid." },
  scars: { significance: "Document location and type — indicates previous surgical history." },
  striae: { significance: "Purple striae may suggest Cushing's syndrome. Silver/white striae are common post-pregnancy or weight change." },
};

export function GastrointestinalTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const {
    abdomen = [],
    regionFindings = {},
    notes = ""
  } = findings || {};

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<FindingDetail | null>(null);

  const getRegionFindings = (region: string, tab: string): string[] =>
    (regionFindings || {})[region]?.[tab] || [];

  const setRegionTabFindings = (region: string, tab: string, findingsList: string[]) => {
    const currentRegion = (regionFindings || {})[region] || {
      palpation: [],
      auscultation: [],
      percussion: [],
      inspection: []
    };
    
    onChange('regionFindings', {
      ...(regionFindings || {}),
      [region]: {
        ...currentRegion,
        [tab]: findingsList,
      },
    });
  };

  const getRegionFindingCount = (regionId: string): number => {
    const region = (regionFindings || {})[regionId];
    if (!region) return 0;
    return (region.palpation?.length || 0) + (region.auscultation?.length || 0) + (region.percussion?.length || 0) + (region.inspection?.length || 0);
  };

  const getRegionFindingItems = (regionId: string): { findingId: string; label: string }[] => {
    const region = (regionFindings || {})[regionId];
    if (!region) return [];
    const items: { findingId: string; label: string }[] = [];
    
    ['palpation', 'auscultation', 'percussion', 'inspection'].forEach(tab => {
      ((region || {})[tab] || []).forEach((id: string) => {
        const match = giAllFindingsList.find(f => id.endsWith(f.id));
        if (match) items.push({ findingId: match.id, label: match.label });
      });
    });
    return items;
  };

  const getDetail = (regionId: string, findingId: string, prop: string) =>
    findings.findingDetails?.[`${regionId}::${findingId}::${prop}`]?.value || "";

  const setDetail = (regionId: string, findingId: string, prop: string, value: string) => {
    const key = `${regionId}::${findingId}::${prop}`;
    const currentDetails = findings.findingDetails || {};
    onChange('findingDetails', { ...currentDetails, [key]: { value } });
  };

  const hasDetailData = (regionId: string, findingId: string): boolean => {
    const prefix = `${regionId}::${findingId}::`;
    return Object.keys(findings.findingDetails || {}).some(k => k.startsWith(prefix) && findings.findingDetails[k]?.value);
  };

  const analysis = analysisTarget ? giFindingAnalysis[analysisTarget.findingId] : null;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Gastrointestinal System" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <CheckboxFindings
        label="Abdomen"
        options={[
          { id: "soft", label: "Soft" },
          { id: "non-tender", label: "Non-tender" },
          { id: "non-distended", label: "Non-distended" },
          { id: "normal-bowel-sounds", label: "Normal Bowel Sounds" },
          { id: "no-masses", label: "No Masses" },
          { id: "no-organomegaly", label: "No Organomegaly" },
        ]}
        selected={abdomen}
        onChange={(v) => onChange('abdomen', v)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Abdomen Map */}
        <div className="relative mx-auto w-fit">
          <img src={abdomenImage} alt="Abdomen Map" className="w-64 h-64 object-contain opacity-80" />
          {(giAbdomenRegions || []).map(region => {
            const count = getRegionFindingCount(region.id);
            return (
              <button
                key={region.id}
                type="button"
                onClick={() => setSelectedRegion(region.id)}
                className={cn(
                  "absolute w-10 h-10 rounded-full border-2 transition-all -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold",
                  count > 0
                    ? "bg-destructive/15 border-destructive/50 text-destructive"
                    : "bg-background/60 border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/10"
                )}
                style={{ left: region.x, top: region.y }}
                title={region.label}
              >
                {count > 0 ? count : region.label}
              </button>
            );
          })}
        </div>

        {/* Finding badges */}
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-slate-700 border-b pb-2">Findings Summary</h5>
          {giAbdomenRegions.some(r => getRegionFindingCount(r.id) > 0) ? (
            <div className="space-y-3">
              {giAbdomenRegions.filter(r => getRegionFindingCount(r.id) > 0).map(region => (
                <div key={region.id} className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 block">{region.label}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {getRegionFindingItems(region.id).map((item, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className={cn(
                          "text-[10px] h-5 cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-colors border",
                          hasDetailData(region.id, item.findingId)
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-transparent"
                        )}
                        onClick={() => setAnalysisTarget({ regionId: region.id, regionLabel: region.label, findingId: item.findingId, findingLabel: item.label })}
                      >
                        {item.label}
                        {hasDetailData(region.id, item.findingId) && <Info className="h-2.5 w-2.5 ml-0.5" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic py-4 text-center border border-dashed rounded-lg">
              No findings recorded yet.<br/>Click on the map regions to add findings.
            </div>
          )}
        </div>
      </div>

      {/* Region Findings Modal */}
      <Dialog open={!!selectedRegion} onOpenChange={(open) => { if (!open) setSelectedRegion(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {giAbdomenRegions.find(r => r.id === selectedRegion)?.label} Findings
            </DialogTitle>
          </DialogHeader>
          {selectedRegion && (
            <Tabs defaultValue="palpation" className="space-y-3">
              <TabsList className="h-8 p-0.5 bg-muted/50 w-full">
                <TabsTrigger value="palpation" className="gap-1 text-xs h-7 flex-1">
                  <Hand className="h-3 w-3" />Palpation
                </TabsTrigger>
                <TabsTrigger value="auscultation" className="gap-1 text-xs h-7 flex-1">
                  <Ear className="h-3 w-3" />Auscultation
                </TabsTrigger>
                <TabsTrigger value="percussion" className="gap-1 text-xs h-7 flex-1">
                  <Hand className="h-3 w-3" />Percussion
                </TabsTrigger>
                <TabsTrigger value="inspection" className="gap-1 text-xs h-7 flex-1">
                  <Eye className="h-3 w-3" />Inspection
                </TabsTrigger>
              </TabsList>
              <TabsContent value="palpation">
                <CheckboxFindings
                  label="Palpation"
                  options={giPalpationFindings.map(f => ({ id: `${selectedRegion}-palp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "palpation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "palpation", v)}
                />
              </TabsContent>
              <TabsContent value="auscultation">
                <CheckboxFindings
                  label="Auscultation"
                  options={giAuscultationFindings.map(f => ({ id: `${selectedRegion}-ausc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "auscultation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "auscultation", v)}
                />
              </TabsContent>
              <TabsContent value="percussion">
                <CheckboxFindings
                  label="Percussion"
                  options={giPercussionFindings.map(f => ({ id: `${selectedRegion}-perc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "percussion")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "percussion", v)}
                />
              </TabsContent>
              <TabsContent value="inspection">
                <CheckboxFindings
                  label="Inspection"
                  options={giInspectionFindings.map(f => ({ id: `${selectedRegion}-insp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "inspection")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "inspection", v)}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Finding Analysis Modal */}
      <Dialog open={!!analysisTarget} onOpenChange={(open) => { if (!open) setAnalysisTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          {analysisTarget && analysis && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm">
                  <span className="text-primary">{analysisTarget.findingLabel}</span>
                  <span className="text-muted-foreground font-normal"> — {analysisTarget.regionLabel}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {analysis.severity && (
                  <div className="space-y-1">
                    <Label className="text-xs">Severity</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "severity")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "severity", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select severity" /></SelectTrigger>
                      <SelectContent>{analysis.severity.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.timing && (
                  <div className="space-y-1">
                    <Label className="text-xs">Timing</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "timing")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "timing", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select timing" /></SelectTrigger>
                      <SelectContent>{analysis.timing.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.character && (
                  <div className="space-y-1">
                    <Label className="text-xs">Character</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "character")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "character", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select character" /></SelectTrigger>
                      <SelectContent>{analysis.character.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                {analysis.pattern && (
                  <div className="space-y-1">
                    <Label className="text-xs">Pattern</Label>
                    <Select value={getDetail(analysisTarget.regionId, analysisTarget.findingId, "pattern")} onValueChange={(v) => setDetail(analysisTarget.regionId, analysisTarget.findingId, "pattern", v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select pattern" /></SelectTrigger>
                      <SelectContent>{analysis.pattern.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="rounded-md bg-muted/50 border border-border p-2.5">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Clinical Significance: </span>
                    {analysis.significance}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed GI findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function PsychiatricTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const { mood, affect, thoughtProcess, thoughtContent, insight, judgment, appearance, behavior, speech, perception, cognition, notes } = findings;
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Psychiatric Assessment" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Mood</Label>
            <Select value={mood || ''} onValueChange={(v) => onChange('mood', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="euthymic">Euthymic (Normal)</SelectItem>
                <SelectItem value="depressed">Depressed</SelectItem>
                <SelectItem value="anxious">Anxious</SelectItem>
                <SelectItem value="euphoric">Euphoric / Manic</SelectItem>
                <SelectItem value="irritable">Irritable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Affect</Label>
            <Select value={affect || ''} onValueChange={(v) => onChange('affect', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="appropriate">Appropriate / Full Range</SelectItem>
                <SelectItem value="blunted">Blunted</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="labile">Labile</SelectItem>
                <SelectItem value="incongruent">Incongruent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CheckboxFindings
            label="Appearance"
            options={[
              { id: "well-groomed", label: "Well-groomed" },
              { id: "untidy", label: "Untidy" },
              { id: "disheveled", label: "Disheveled" },
              { id: "appropriate", label: "Appropriate" },
              { id: "bizarre", label: "Bizarre" },
            ]}
            selected={appearance || []}
            onChange={(v) => onChange('appearance', v)}
          />
          <CheckboxFindings
            label="Behavior"
            options={[
              { id: "cooperative", label: "Cooperative" },
              { id: "agitated", label: "Agitated" },
              { id: "withdrawn", label: "Withdrawn" },
              { id: "guarded", label: "Guarded" },
              { id: "uncooperative", label: "Uncooperative" },
              { id: "normal", label: "Normal" },
            ]}
            selected={behavior || []}
            onChange={(v) => onChange('behavior', v)}
          />
          <CheckboxFindings
            label="Speech"
            options={[
              { id: "normal", label: "Normal" },
              { id: "pressured", label: "Pressured" },
              { id: "slowed", label: "Slowed" },
              { id: "slurred", label: "Slurred" },
              { id: "monotone", label: "Monotone" },
              { id: "fluent", label: "Fluent" },
            ]}
            selected={speech || []}
            onChange={(v) => onChange('speech', v)}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Thought Process</Label>
            <Select value={thoughtProcess || ''} onValueChange={(v) => onChange('thoughtProcess', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear / Goal-directed</SelectItem>
                <SelectItem value="circumstantial">Circumstantial</SelectItem>
                <SelectItem value="tangential">Tangential</SelectItem>
                <SelectItem value="flight-of-ideas">Flight of Ideas</SelectItem>
                <SelectItem value="loose-associations">Loose Associations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CheckboxFindings
            label="Thought Content"
            options={[
              { id: "normal-content", label: "Normal / No Suicidal Ideation" },
              { id: "suicidal", label: "Suicidal Ideation" },
              { id: "homicidal", label: "Homicidal Ideation" },
              { id: "delusions", label: "Delusions" },
              { id: "hallucinations", label: "Hallucinations" },
              { id: "obsessions", label: "Obsessions" },
            ]}
            selected={thoughtContent}
            onChange={(v) => onChange('thoughtContent', v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Insight</Label>
              <Select value={insight || ''} onValueChange={(v) => onChange('insight', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor / Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Judgment</Label>
              <Select value={judgment || ''} onValueChange={(v) => onChange('judgment', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor / Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <CheckboxFindings
            label="Perception"
            options={[
              { id: "normal", label: "Normal" },
              { id: "auditory-hallucinations", label: "Hallucinations (Auditory)" },
              { id: "visual-hallucinations", label: "Hallucinations (Visual)" },
              { id: "illusions", label: "Illusions" },
              { id: "depersonalization", label: "Depersonalization" },
            ]}
            selected={perception || []}
            onChange={(v) => onChange('perception', v)}
          />
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Psychiatric Tests</Label>
            <div className="flex flex-wrap gap-2">
              {['MMSE', 'MoCA', 'GDS'].map(test => (
                <Button key={test} variant="outline" size="sm" className="h-7 text-xs" onClick={() => setSelectedTest(test)}>
                  {test}
                </Button>
              ))}
            </div>
            <CheckboxFindings
              label="Cognition"
              options={[
                { id: "alert", label: "Alert" },
                { id: "disoriented", label: "Disoriented" },
                { id: "memory-impairment", label: "Memory Impairment" },
                { id: "attention-deficit", label: "Attention Deficit" },
                { id: "normal", label: "Normal" },
              ]}
              selected={cognition || []}
              onChange={(v) => onChange('cognition', v)}
            />
          </div>
      </div>
      
      <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTest}</DialogTitle>
          </DialogHeader>
          <div className="text-sm">
            {selectedTest === 'MMSE' && "Mini-Mental State Examination details..."}
            {selectedTest === 'MoCA' && "Montreal Cognitive Assessment details..."}
            {selectedTest === 'GDS' && "Geriatric Depression Scale details..."}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed psychiatric assessment..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function GeriatricTab({ findings, onChange, onMarkNormal, onClear }: { findings: any, onChange: (field: string, value: any) => void, onMarkNormal: () => void, onClear: () => void }) {
  const { moca, mmse, frailty, adl, iadl, gait, notes } = findings;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Geriatric & Functional Assessment" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">MoCA Score</Label>
              <Input type="number" placeholder="/30" value={moca || ''} onChange={e => onChange('moca', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">MMSE Score</Label>
              <Input type="number" placeholder="/30" value={mmse || ''} onChange={e => onChange('mmse', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Clinical Frailty Scale</Label>
            <Select value={frailty || ''} onValueChange={(v) => onChange('frailty', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="robust">1 - Very Fit (Robust)</SelectItem>
                <SelectItem value="well">2 - Well</SelectItem>
                <SelectItem value="managing">3 - Managing Well</SelectItem>
                <SelectItem value="vulnerable">4 - Vulnerable</SelectItem>
                <SelectItem value="mildly-frail">5 - Mildly Frail</SelectItem>
                <SelectItem value="moderately-frail">6 - Moderately Frail</SelectItem>
                <SelectItem value="severely-frail">7 - Severely Frail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Gait & Balance</Label>
            <Select value={gait || ''} onValueChange={(v) => onChange('gait', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal / Steady</SelectItem>
                <SelectItem value="slow">Slow Gait Speed</SelectItem>
                <SelectItem value="unsteady">Unsteady / High Fall Risk</SelectItem>
                <SelectItem value="assistive">Requires Assistive Device</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <CheckboxFindings
            label="ADLs (Activities of Daily Living)"
            options={[
              { id: "bathing", label: "Bathing" },
              { id: "dressing", label: "Dressing" },
              { id: "toileting", label: "Toileting" },
              { id: "transferring", label: "Transferring" },
              { id: "continence", label: "Continence" },
              { id: "feeding", label: "Feeding" },
            ]}
            selected={adl}
            onChange={(v) => onChange('adl', v)}
          />

          <CheckboxFindings
            label="IADLs (Instrumental ADLs)"
            options={[
              { id: "telephone", label: "Telephone" },
              { id: "shopping", label: "Shopping" },
              { id: "food-prep", label: "Food Prep" },
              { id: "housekeeping", label: "Housekeeping" },
              { id: "laundry", label: "Laundry" },
              { id: "transportation", label: "Transportation" },
              { id: "medications", label: "Medications" },
              { id: "finances", label: "Finances" },
            ]}
            selected={iadl}
            onChange={(v) => onChange('iadl', v)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed geriatric assessment..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function PhysicalExam() {
  const { settings: aiSettings } = useAISettings();
  const { selectedPatient } = usePatient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [examSummary, setExamSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const { symptoms } = useSymptom();

  const handleMarkAllNormal = (tabId: string) => {
    switch(tabId) {
      case 'general':
        handleGeneralChange('appearance', 'normal', 'normal');
        handleGeneralChange('detailed', {
          consciousLevel: ['Alert'],
          alertness: ['Normal'],
          orientation: ['Time', 'Person', 'Place', 'Situation'],
          skinSigns: [],
          extremities: [],
          lymphatic: [],
          generalLook: ['Well-nourished', 'Well-developed'],
          build: ['Normal'],
          posture: ['Normal Posture'],
          gait: ['Normal Gait'],
          facialExpression: ['Normal']
        });
        break;
      case 'heent':
        setHeentFindings({
          heentState: {
            'scalp': ['Normal'],
            'eyelids': ['Normal'],
            'conjunctiva': ['Normal'],
            'sclera': ['Normal'],
            'pupils': ['Normal'],
            'throat': ['Normal'],
            'ears': ['Normal'],
            'nose': ['Normal'],
            'lips': ['Normal'],
            'tongue': ['Normal'],
            'neck': ['Normal']
          },
          pupilSize: [3],
          notes: 'Routine HEENT exam unremarkable.',
          status: 'normal'
        });
        break;
      case 'cardiovascular':
        setCardiovascularFindings(prev => ({
          ...prev,
          heart: ['Regular S1, S2', 'No murmurs/rubs/gallops'],
          pulses: 'normal',
          status: 'normal'
        }));
        break;
      case 'respiratory':
        setRespiratoryFindings(prev => ({
          ...prev,
          lungs: ['Clear to auscultation bilaterally', 'Normal breath sounds'],
          status: 'normal'
        }));
        break;
      case 'gastrointestinal':
        setGastrointestinalFindings(prev => ({
          ...prev,
          abdomen: ['Soft', 'Non-tender', 'No organomegaly', 'Bowel sounds present'],
          status: 'normal'
        }));
        break;
      case 'musculoskeletal':
        setMusculoskeletalFindings(prev => ({
          ...prev,
          galsScreen: 'normal',
          nvStatus: ["pulses-intact", "sensation-intact", "cap-refill-normal"],
          status: 'normal'
        }));
        break;
      case 'neurological':
        setNeurologicalFindings(prev => ({
          ...prev,
          mental: {
            consciousLevel: 'alert',
            alertness: 'awake',
            orientation: ['person', 'place', 'time', 'situation']
          },
          motorBulk: 'normal',
          motorTone: 'normal',
          plantarResponse: 'flexor',
          clonus: 'absent',
          status: 'normal'
        }));
        break;
      case 'sse':
        setSseFindings({
          visualAcuityR: '20/20',
          visualAcuityL: '20/20',
          fundoscopy: ['normal-fundus'],
          weber: 'midline',
          rinneR: 'ac>bc',
          rinneL: 'ac>bc',
          otoscopy: ['normal-tm'],
          notes: '',
          status: 'normal'
        });
        break;
      case 'psychiatric':
        setPsychiatricFindings({
          mood: 'euthymic',
          affect: 'appropriate',
          thoughtProcess: 'linear',
          thoughtContent: ['normal-content'],
          insight: 'good',
          judgment: 'good',
          appearance: ['well-groomed', 'appropriate'],
          behavior: ['cooperative', 'normal'],
          speech: ['normal', 'fluent'],
          perception: ['normal'],
          cognition: ['alert', 'normal'],
          notes: '',
          status: 'normal'
        });
        break;
      case 'geriatric':
        setGeriatricFindings({
          moca: '30',
          mmse: '30',
          frailty: 'robust',
          adl: [],
          iadl: [],
          gait: 'normal',
          notes: '',
          status: 'normal'
        });
        break;
      case 'skin':
        setSkinFindings(prev => ({
          ...prev,
          color: 'normal',
          temp: 'warm',
          moisture: 'normal',
          turgor: 'normal',
          edema: 'none',
          status: 'normal'
        }));
        break;
    }
    toast.success(`${tabId.charAt(0).toUpperCase() + tabId.slice(1)} marked as normal`);
  };

  const handleClearTab = (tabId: string) => {
    switch(tabId) {
      case 'general':
        setGeneralFindings({
          appearance: '',
          mentalStatus: '',
          detailed: {
            consciousLevel: [],
            alertness: [],
            orientation: [],
            skinSigns: [],
            extremities: [],
            lymphatic: [],
            generalLook: [],
            build: [],
            posture: [],
            gait: [],
            facialExpression: []
          },
          notes: '',
          status: 'untouched'
        });
        break;
      case 'heent':
        setHeentFindings({
          heentState: {},
          pupilSize: [3],
          notes: '',
          status: 'untouched'
        });
        break;
      case 'sse':
        setSseFindings({
          visualAcuityR: '20/20',
          visualAcuityL: '20/20',
          fundoscopy: [],
          weber: 'midline',
          rinneR: 'ac>bc',
          rinneL: 'ac>bc',
          otoscopy: [],
          notes: '',
          status: 'untouched'
        });
        break;
      case 'respiratory':
        setRespiratoryFindings({
          lungs: [],
          regionalFindings: {},
          notes: '',
          status: 'untouched'
        });
        break;
      case 'cardiovascular':
        setCardiovascularFindings({
          heart: [],
          pulses: 'normal',
          regionFindings: {},
          findingDetails: {},
          notes: '',
          status: 'untouched'
        });
        break;
      case 'gastrointestinal':
        setGastrointestinalFindings({
          abdomen: [],
          regionFindings: {},
          findingDetails: {},
          notes: '',
          status: 'untouched'
        });
        break;
      case 'musculoskeletal':
        setMusculoskeletalFindings({
          galsScreen: '',
          gaitPosture: [],
          mrcUpper: '5',
          mrcLower: '5',
          nvStatus: ["pulses-intact", "sensation-intact", "cap-refill-normal"],
          jointExams: [],
          notes: '',
          status: 'untouched'
        });
        break;
      case 'neurological':
        setNeurologicalFindings({
          mental: {
            consciousLevel: '',
            alertness: '',
            orientation: []
          },
          showCranial: false,
          showMotor: false,
          showSensory: false,
          showReflexes: false,
          involuntary: [],
          coordination: [],
          sensoryLevel: '',
          stereognosis: 'normal',
          graphesthesia: 'normal',
          hoffmann: 'negative',
          frontalSigns: [],
          cranialNervesFindings: {},
          motorBulk: 'normal',
          motorTone: 'normal',
          motorPower: {},
          sensoryModalitiesFindings: {},
          reflexesFindings: {},
          plantarResponse: 'flexor',
          clonus: 'absent',
          notes: '',
          status: 'untouched'
        });
        break;
      case 'skin':
        setSkinFindings({
          showDetailed: false,
          color: 'normal',
          temp: 'warm',
          moisture: 'normal',
          turgor: 'normal',
          edema: 'none',
          nails: [],
          vascular: [],
          hairDist: 'normal',
          lesions: [],
          notes: '',
          status: 'untouched'
        });
        break;
      case 'psychiatric':
        setPsychiatricFindings({
          mood: 'euthymic',
          affect: 'appropriate',
          thoughtProcess: 'linear',
          thoughtContent: [],
          insight: 'good',
          judgment: 'good',
          appearance: [],
          behavior: [],
          speech: [],
          perception: [],
          cognition: [],
          notes: '',
          status: 'untouched'
        });
        break;
      case 'geriatric':
        setGeriatricFindings({
          moca: '',
          mmse: '',
          frailty: 'robust',
          adl: [],
          iadl: [],
          gait: 'normal',
          notes: '',
          status: 'untouched'
        });
        break;
    }
    toast.info(`${tabId.charAt(0).toUpperCase() + tabId.slice(1)} cleared`);
  };

  const handleFinalize = async () => {
    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0];

      await db.vitals.add({
        id: crypto.randomUUID(),
        patientId: selectedPatient.id,
        date: date,
        bp_systolic: isNaN(parseInt(vitals.bpSystolic)) ? null : parseInt(vitals.bpSystolic),
        bp_diastolic: isNaN(parseInt(vitals.bpDiastolic)) ? null : parseInt(vitals.bpDiastolic),
        hr: isNaN(parseInt(vitals.pulse)) ? null : parseInt(vitals.pulse),
        temp: isNaN(parseFloat(vitals.temperature)) ? null : parseFloat(vitals.temperature),
        rr: isNaN(parseInt(vitals.respiratoryRate)) ? null : parseInt(vitals.respiratoryRate),
        spo2: isNaN(parseInt(vitals.oxygenSaturation)) ? null : parseInt(vitals.oxygenSaturation),
        weight: isNaN(parseFloat(vitals.weight)) ? null : parseFloat(vitals.weight),
        height: isNaN(parseFloat(vitals.height)) ? null : parseFloat(vitals.height),
        bmi: isNaN(parseFloat(vitals.bmi)) ? null : parseFloat(vitals.bmi),
        oxygenType: vitals.oxygenType,
        oxygenDose: vitals.oxygenDose,
        oxygenInvasive: vitals.oxygenInvasive,
        oxygenDeviceType: vitals.oxygenDeviceType,
        fio2: vitals.fio2,
        peep: vitals.peep,
        pressureSupport: vitals.pressureSupport,
        flowRate: vitals.flowRate,
        notes: vitals.notes,
        lastModified: timestamp,
        isDeleted: 0,
        isSynced: 0
      });

      const sanitizedVitals = Object.fromEntries(
        Object.entries(vitals).map(([key, value]) => [key, value === undefined ? null : value])
      );

      const examData = {
        vitals: sanitizedVitals,
        symptoms: symptoms.map(s => s.label),
        generalFindings,
        heentFindings,
        sseFindings,
        respiratoryFindings,
        cardiovascularFindings,
        gastrointestinalFindings,
        musculoskeletalFindings,
        neurologicalFindings,
        skinFindings,
        psychiatricFindings,
        geriatricFindings
      };

      // Mark any existing draft as finalized or just delete it
      const existingDraft = await db.physical_exams
        .where('patientId')
        .equals(selectedPatient.id)
        .and(exam => exam.status === 'draft')
        .first();

      if (existingDraft) {
        await db.physical_exams.update(existingDraft.localId!, {
          data: examData,
          status: 'finalized',
          lastModified: timestamp
        });
      } else {
        await db.physical_exams.add({
          id: crypto.randomUUID(),
          patientId: selectedPatient.id,
          data: examData,
          status: 'finalized',
          date: date,
          lastModified: timestamp,
          isDeleted: 0,
          isSynced: 0
        });
      }

      toast.success("Examination finalized and vitals saved.");
    } catch (error) {
      console.error("Failed to finalize exam:", error);
      toast.error("Failed to save clinical record.");
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedPatient) {
      toast.error("No patient selected.");
      return;
    }

    try {
      const timestamp = Date.now();
      const date = new Date().toISOString().split('T')[0];

      const sanitizedVitals = Object.fromEntries(
        Object.entries(vitals).map(([key, value]) => [key, value === undefined ? null : value])
      );

      const examData = {
        vitals: sanitizedVitals,
        generalFindings,
        heentFindings,
        sseFindings,
        respiratoryFindings,
        cardiovascularFindings,
        gastrointestinalFindings,
        musculoskeletalFindings,
        neurologicalFindings,
        skinFindings,
        psychiatricFindings,
        geriatricFindings
      };

      const existingDraft = await db.physical_exams
        .where('patientId')
        .equals(selectedPatient.id)
        .and(exam => exam.status === 'draft')
        .first();

      if (existingDraft) {
        await db.physical_exams.update(existingDraft.localId!, {
          data: examData,
          lastModified: timestamp
        });
      } else {
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

      toast.success("Draft saved successfully.");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft.");
    }
  };

  useEffect(() => {
    const loadDraft = async () => {
      if (selectedPatient) {
        const draft = await db.physical_exams
          .where('patientId')
          .equals(selectedPatient.id)
          .and(exam => exam.status === 'draft')
          .first();

        if (draft && draft.data) {
          const data = draft.data;
          if (data.vitals) setVitals(data.vitals);
          if (data.generalFindings) setGeneralFindings(data.generalFindings);
          if (data.heentFindings) setHeentFindings(data.heentFindings);
          if (data.sseFindings) setSseFindings(data.sseFindings);
          if (data.respiratoryFindings) setRespiratoryFindings(data.respiratoryFindings);
          if (data.cardiovascularFindings) setCardiovascularFindings(data.cardiovascularFindings);
          if (data.gastrointestinalFindings) setGastrointestinalFindings(data.gastrointestinalFindings);
          if (data.musculoskeletalFindings) setMusculoskeletalFindings(data.musculoskeletalFindings);
          if (data.neurologicalFindings) setNeurologicalFindings(data.neurologicalFindings);
          if (data.skinFindings) setSkinFindings(data.skinFindings);
          if (data.psychiatricFindings) setPsychiatricFindings(data.psychiatricFindings);
          if (data.geriatricFindings) setGeriatricFindings(data.geriatricFindings);
          
          toast.info("Draft loaded for this patient.");
        }
      }
    };
    loadDraft();
  }, [selectedPatient]);

  const [heentFindings, setHeentFindings] = useState({
    heentState: {} as Record<string, any>,
    pupilSize: [3],
    notes: '',
    status: 'untouched'
  });

  const [sseFindings, setSseFindings] = useState({
    visualAcuityR: '20/20',
    visualAcuityL: '20/20',
    fundoscopy: [] as string[],
    weber: 'midline',
    rinneR: 'ac>bc',
    rinneL: 'ac>bc',
    otoscopy: [] as string[],
    notes: '',
    status: 'untouched'
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [listeningField, setListeningField] = useState<string | null>(null);
  
  const [vitals, setVitals] = useState({
    temperature: '',
    bpSystolic: '',
    bpDiastolic: '',
    pulse: '',
    rbs: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    oxygenType: 'RA',
    oxygenDose: '',
    oxygenInvasive: '',
    oxygenDeviceType: '',
    fio2: '',
    peep: '',
    pressureSupport: '',
    tidalVolume: '',
    pressureControl: '',
    setRR: '',
    ieRatio: '',
    pip: '',
    flowRate: '',
    notes: '',
    weight: '',
    height: '',
    bmi: ''
  });

  useEffect(() => {
    const weight = parseFloat(vitals.weight);
    const height = parseFloat(vitals.height);
    const bmi = (weight > 0 && height > 0) 
      ? (weight / ((height / 100) * (height / 100))).toFixed(1)
      : '';
      
    setVitals(prev => {
      if (prev.bmi === bmi) return prev;
      return { ...prev, bmi };
    });
  }, [vitals.weight, vitals.height]);

  const [generalFindings, setGeneralFindings] = useState({
    appearance: '',
    mentalStatus: '',
    detailed: {
      consciousLevel: [],
      alertness: [],
      orientation: [],
      skinSigns: [],
      extremities: [],
      lymphatic: [],
      generalLook: [],
      build: [],
      posture: [],
      gait: [],
      facialExpression: []
    },
    notes: '',
    status: 'untouched' // untouched, normal, abnormal
  });

  const [respiratoryFindings, setRespiratoryFindings] = useState({
    lungs: [] as string[],
    regionalFindings: {} as Record<string, {
      inspection: string[],
      palpationPercussion: string[],
      auscultation: string[],
      description: string,
      severity: 'Mild' | 'Moderate' | 'Severe',
      analysis: string,
      redFlags: string[],
      suggestedLabs: string[],
      suggestedPrescriptions: string[]
    }>,
    notes: '',
    status: 'untouched'
  });

  const [cardiovascularFindings, setCardiovascularFindings] = useState({
    heart: [] as string[],
    pulses: 'normal',
    regionFindings: {} as Record<string, Record<string, string[]>>,
    findingDetails: {} as Record<string, any>,
    notes: '',
    status: 'untouched'
  });

  const [gastrointestinalFindings, setGastrointestinalFindings] = useState({
    abdomen: [] as string[],
    regionFindings: {} as Record<string, Record<string, string[]>>,
    findingDetails: {} as Record<string, any>,
    notes: '',
    status: 'untouched'
  });

  const [musculoskeletalFindings, setMusculoskeletalFindings] = useState({
    galsScreen: '' as "normal" | "abnormal" | "",
    gaitPosture: [] as string[],
    mrcUpper: '5',
    mrcLower: '5',
    nvStatus: ["pulses-intact", "sensation-intact", "cap-refill-normal"] as string[],
    jointExams: [] as JointExam[],
    notes: '',
    status: 'untouched'
  });

  const [neurologicalFindings, setNeurologicalFindings] = useState({
    mental: {
      consciousLevel: '',
      alertness: '',
      orientation: [] as string[]
    },
    showCranial: false,
    showMotor: false,
    showSensory: false,
    showReflexes: false,
    involuntary: [] as string[],
    coordination: [] as string[],
    sensoryLevel: '',
    stereognosis: 'normal',
    graphesthesia: 'normal',
    hoffmann: 'negative',
    frontalSigns: [] as string[],
    cranialNervesFindings: {} as Record<string, string>,
    motorBulk: 'normal',
    motorTone: 'normal',
    motorPower: {} as Record<string, { right: string, left: string }>,
    sensoryModalitiesFindings: {} as Record<string, { right: string, left: string }>,
    reflexesFindings: {} as Record<string, { right: string, left: string }>,
    plantarResponse: 'flexor',
    clonus: 'absent',
    notes: '',
    status: 'untouched'
  });

  const [skinFindings, setSkinFindings] = useState({
    showDetailed: false,
    color: 'normal',
    temp: 'warm',
    moisture: 'normal',
    turgor: 'normal',
    edema: 'none',
    nails: [] as string[],
    vascular: [] as string[],
    hairDist: 'normal',
    lesions: [] as any[],
    notes: '',
    status: 'untouched'
  });

  const [psychiatricFindings, setPsychiatricFindings] = useState({
    mood: 'euthymic',
    affect: 'appropriate',
    thoughtProcess: 'linear',
    thoughtContent: [] as string[],
    insight: 'good',
    judgment: 'good',
    appearance: [] as string[],
    behavior: [] as string[],
    speech: [] as string[],
    perception: [] as string[],
    cognition: [] as string[],
    notes: '',
    status: 'untouched'
  });

  const [geriatricFindings, setGeriatricFindings] = useState({
    moca: '',
    mmse: '',
    frailty: 'robust',
    adl: [] as string[],
    iadl: [] as string[],
    gait: 'normal',
    notes: '',
    status: 'untouched'
  });

  const [bodyPins, setBodyPins] = useState<BodyPin[]>([]);

  const handleMarkAllSystemsWNL = () => {
    setGeneralFindings(prev => ({ ...prev, appearance: 'normal', status: 'normal', notes: 'Well-developed, well-nourished, in no acute distress.' }));
    setHeentFindings(prev => ({ ...prev, status: 'normal', notes: 'Normocephalic, atraumatic. Pupils equal, round, reactive to light. EOMI. Oropharynx clear. TMs clear bilaterally. Neck supple, no lymphadenopathy.' }));
    setSseFindings(prev => ({ ...prev, status: 'normal', notes: 'Visual acuity 20/20 OU. TMs clear with normal light reflex bilaterally. Hearing intact.' }));
    setRespiratoryFindings(prev => ({ ...prev, status: 'normal', notes: 'Clear to auscultation bilaterally. No wheezes, rales, or rhonchi. Good symmetric air entry.' }));
    setCardiovascularFindings(prev => ({ ...prev, status: 'normal', notes: 'Regular rate and rhythm. Normal S1 and S2. No murmurs, gallops, or rubs. Peripheral pulses intact, no edema.' }));
    setGastrointestinalFindings(prev => ({ ...prev, status: 'normal', notes: 'Soft, non-tender, non-distended. Normal active bowel sounds. No organomegaly or peritoneal signs.' }));
    setMusculoskeletalFindings(prev => ({ ...prev, status: 'normal', notes: 'Normal active range of motion in all joints. No joint swelling, erythema, or tenderness. Muscle strength 5/5 throughout.' }));
    setNeurologicalFindings(prev => ({ ...prev, status: 'normal', notes: 'Alert and oriented x 4. Cranial nerves II-XII intact. Sensation and reflexes normal throughout. Gait steady.' }));
    setSkinFindings(prev => ({ ...prev, status: 'normal', notes: 'Warm, dry, intact. Normal skin turgor. No suspicious rash or lesions.' }));
    setPsychiatricFindings(prev => ({ ...prev, status: 'normal', notes: 'Normal affect, appropriate mood, pleasant and cooperative. Coherent thought process.' }));
    setGeriatricFindings(prev => ({ ...prev, status: 'normal', notes: 'Unimpaired mobility, normal Mini-Cog cognition screen.' }));

    toast.success("Complete WNL Baseline Applied!", {
      description: "Marked all 10 organ systems as Within Normal Limits (WNL)."
    });
  };

  const handleGeneralChange = (field: string, value: any, status: string = 'abnormal') => {
    setGeneralFindings(prev => ({ ...prev, [field]: value, status }));
  };

  const handleRespiratoryChange = (field: string, value: any) => {
    setRespiratoryFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleCardiovascularChange = (field: string, value: any) => {
    setCardiovascularFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleGastrointestinalChange = (field: string, value: any) => {
    setGastrointestinalFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleMusculoskeletalChange = (field: string, value: any) => {
    setMusculoskeletalFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleNeurologicalChange = (field: string, value: any) => {
    setNeurologicalFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleSkinChange = (field: string, value: any) => {
    setSkinFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }));
  };

  const handleDictation = (fieldId: string, currentValue: string, setter: (val: string) => void) => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListeningField(fieldId);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setter(currentValue ? `${currentValue} ${transcript}` : transcript);
    };
    recognition.onerror = () => setListeningField(null);
    recognition.onend = () => setListeningField(null);
    recognition.start();
  };

  const getVitalColor = (field: string, value: string) => {
    if (!value) return 'border-slate-200 focus:ring-indigo-500';
    const num = parseFloat(value);
    if (isNaN(num)) return 'border-slate-200 focus:ring-indigo-500';
    
    switch(field) {
      case 'pulse': return num < 60 || num > 100 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'oxygenSaturation': return num < 95 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'bpSystolic': return num > 140 || num < 90 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'bpDiastolic': return num > 90 || num < 60 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'temperature': return num > 37.5 || num < 36.0 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'respiratoryRate': return num > 20 || num < 12 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      case 'rbs': return num > 140 || num < 70 ? 'border-red-500 text-red-700 focus:ring-red-500 bg-red-50' : 'border-emerald-500 focus:ring-emerald-500 bg-emerald-50/30';
      default: return 'border-slate-200 focus:ring-indigo-500';
    }
  };

  const getTabStatusIcon = (tabId: string) => {
    let status = 'untouched';
    switch(tabId) {
      case 'general': status = generalFindings.status; break;
      case 'heent': status = heentFindings.status; break;
      case 'sse': status = sseFindings.status; break;
      case 'respiratory': status = respiratoryFindings.status; break;
      case 'cardiovascular': status = cardiovascularFindings.status; break;
      case 'gastrointestinal': status = gastrointestinalFindings.status; break;
      case 'musculoskeletal': status = musculoskeletalFindings.status; break;
      case 'neurological': status = neurologicalFindings.status; break;
      case 'skin': status = skinFindings.status; break;
      case 'psychiatric': status = psychiatricFindings.status; break;
      case 'geriatric': status = geriatricFindings.status; break;
    }
    
    if (status === 'normal') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />;
    if (status === 'abnormal') return <AlertCircle className="w-3.5 h-3.5 text-amber-500 ml-1" />;
    return null;
  };

  const generateExamSummary = async () => {
    setIsGenerating(true);
    try {
      const examData = {
        vitals,
        generalFindings,
        heentFindings,
        sseFindings,
        respiratoryFindings,
        cardiovascularFindings,
        gastrointestinalFindings,
        musculoskeletalFindings,
        neurologicalFindings,
        skinFindings,
        psychiatricFindings,
        geriatricFindings
      };

      const prompt = `Synthesize the following physical exam findings into a professional clinical summary. Keep it concise, structured, and use standard medical terminology. Only include relevant positive and negative findings based on the provided data.

Exam Data:
${JSON.stringify(examData, null, 2)}

Format the output as a professional medical note under the heading "Physical Examination Summary".`;

      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }],
        aiSettings
      );
      setExamSummary(responseText || "Summary generation failed.");
    } catch (error) {
      console.error("Summary generation failed:", error);
      setExamSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };


  const handleVitalChange = (field: string, value: string) => {
    setVitals(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'oxygenType' && value === 'RA') {
        updated.oxygenDose = '';
        updated.oxygenInvasive = '';
        updated.oxygenDeviceType = '';
      } else if (field === 'oxygenInvasive') {
        updated.oxygenDeviceType = '';
        updated.fio2 = '';
        updated.peep = '';
        updated.pressureSupport = '';
        updated.tidalVolume = '';
        updated.pressureControl = '';
        updated.setRR = '';
        updated.ieRatio = '';
        updated.pip = '';
        updated.flowRate = '';
        updated.notes = '';
      }
      return updated;
    });
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-y-auto pb-8 [&::-webkit-scrollbar]:hidden px-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Physical Examination</h2>
          <p className="text-slate-500">Conduct and document comprehensive physical examinations</p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* One-Click WNL Macro Button */}
          <button
            type="button"
            onClick={handleMarkAllSystemsWNL}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            Mark All Normal (WNL)
          </button>

          {/* AI Differential Generator Modal Trigger */}
          <AIDifferentialGenerator
            abnormalFindings={{
              general: generalFindings,
              heent: heentFindings,
              sse: sseFindings,
              respiratory: respiratoryFindings,
              cardiovascular: cardiovascularFindings,
              gastrointestinal: gastrointestinalFindings,
              musculoskeletal: musculoskeletalFindings,
              neurological: neurologicalFindings,
              skin: skinFindings,
              psychiatric: psychiatricFindings,
              geriatric: geriatricFindings
            }}
            vitals={vitals}
            patientId={selectedPatient?.id}
            patientName={selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined}
            onExportToSoap={(text) => {
              setExamSummary((prev) => (prev ? `${prev}\n\n[AI Assessment Differential]\n${text}` : text));
            }}
          />

          <button 
            onClick={generateExamSummary}
            disabled={isGenerating}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />} 
            {isGenerating ? 'Generating...' : 'Summary'}
          </button>

          <button 
            onClick={handleFinalize}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" /> Finalize
          </button>
        </div>
      </div>

      {/* AI Examination Guidance */}
      {selectedPatient && <ExaminationGuidance patient={selectedPatient} symptoms={symptoms} />}

      {/* Vital Signs Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Vital Signs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="space-y-1.5 col-span-2 md:col-span-1 lg:col-span-2">
            <label className="text-xs font-medium text-slate-600">Blood Pressure (mmHg)</label>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={vitals.bpSystolic || ''}
                onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('bpSystolic', vitals.bpSystolic)}`}
                placeholder="120" 
              />
              <span className="text-slate-400 font-medium">/</span>
              <input 
                type="number" 
                value={vitals.bpDiastolic || ''}
                onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('bpDiastolic', vitals.bpDiastolic)}`}
                placeholder="80" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Pulse (bpm)</label>
            <div className="relative">
              <Heart className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.pulse || ''}
                onChange={(e) => handleVitalChange('pulse', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('pulse', vitals.pulse)}`}
                placeholder="72" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Temp (°C)</label>
            <div className="relative">
              <Thermometer className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.temperature || ''}
                onChange={(e) => handleVitalChange('temperature', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('temperature', vitals.temperature)}`}
                placeholder="37.2" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">RBS (mg/dL)</label>
            <div className="relative">
              <Droplets className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.rbs || ''}
                onChange={(e) => handleVitalChange('rbs', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('rbs', vitals.rbs)}`}
                placeholder="110" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Resp (cycle)</label>
            <div className="relative">
              <Wind className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.respiratoryRate || ''}
                onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('respiratoryRate', vitals.respiratoryRate)}`}
                placeholder="16" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Weight (kg)</label>
            <div className="relative">
              <Scale className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.weight || ''}
                onChange={(e) => handleVitalChange('weight', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="70" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Height (cm)</label>
            <div className="relative">
              <Ruler className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.height || ''}
                onChange={(e) => handleVitalChange('height', e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="170" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">BMI</label>
            <input 
              type="text" 
              value={vitals.bmi || ''}
              readOnly
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 outline-none" 
              placeholder="--" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">SpO2 (%)</label>
            <div className="relative">
              <Droplets className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="number" 
                value={vitals.oxygenSaturation || ''}
                onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('oxygenSaturation', vitals.oxygenSaturation)}`}
                placeholder="98" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">O2 Supply</label>
            <select
              value={vitals.oxygenType || ''}
              onChange={(e) => handleVitalChange('oxygenType', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="RA">Room Air (RA)</option>
              <option value="oxygen_supply">Oxygen Supply</option>
            </select>
          </div>
          {vitals.oxygenType === 'oxygen_supply' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">O2 Dose</label>
                <input 
                  type="text" 
                  value={vitals.oxygenDose || ''}
                  onChange={(e) => handleVitalChange('oxygenDose', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. 2L/min" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">O2 Invasive</label>
                <select
                  value={vitals.oxygenInvasive || ''}
                  onChange={(e) => handleVitalChange('oxygenInvasive', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select...</option>
                  <option value="non_invasive">Non-invasive</option>
                  <option value="invasive">Invasive</option>
                </select>
              </div>
              {vitals.oxygenInvasive && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">Mode Types</label>
                    <select
                      value={vitals.oxygenDeviceType || ''}
                      onChange={(e) => handleVitalChange('oxygenDeviceType', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select...</option>
                      {vitals.oxygenInvasive === 'non_invasive' ? (
                        <>
                          <option value="nasal_cannula">Nasal Cannula</option>
                          <option value="simple_mask">Simple Face Mask</option>
                          <option value="nrbm">Non-Rebreather Mask</option>
                          <option value="venturi">Venturi Mask</option>
                          <option value="hfnc">High Flow Nasal Cannula</option>
                          <option value="cpap">CPAP</option>
                          <option value="bipap">BiPAP</option>
                          <option value="other">Other</option>
                        </>
                      ) : (
                        <>
                          <option value="ac_vc">Assist-Control Volume (AC-VC)</option>
                          <option value="ac_pc">Assist-Control Pressure (AC-PC)</option>
                          <option value="simv">SIMV</option>
                          <option value="psv">Pressure Support (PSV)</option>
                          <option value="prvc">PRVC</option>
                          <option value="aprv">APRV</option>
                          <option value="other">Other</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600">
                      {vitals.oxygenInvasive === 'invasive' ? 'MV parameters' : 'Details/Settings'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {vitals.oxygenInvasive === 'invasive' ? (
                        <>
                          <input type="text" value={vitals.fio2 || ''} onChange={(e) => handleVitalChange('fio2', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="FiO2 (%)" />
                          <input type="text" value={vitals.peep || ''} onChange={(e) => handleVitalChange('peep', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PEEP (cmH2O)" />
                          <input type="text" value={vitals.pressureSupport || ''} onChange={(e) => handleVitalChange('pressureSupport', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PS (cmH2O)" />
                          <input type="text" value={vitals.tidalVolume || ''} onChange={(e) => handleVitalChange('tidalVolume', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Vt (mL)" />
                          <input type="text" value={vitals.pressureControl || ''} onChange={(e) => handleVitalChange('pressureControl', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PC (cmH2O)" />
                          <input type="text" value={vitals.setRR || ''} onChange={(e) => handleVitalChange('setRR', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Set RR (bpm)" />
                          <input type="text" value={vitals.ieRatio || ''} onChange={(e) => handleVitalChange('ieRatio', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="I:E Ratio" />
                          <input type="text" value={vitals.pip || ''} onChange={(e) => handleVitalChange('pip', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PIP (cmH2O)" />
                        </>
                      ) : (
                        <>
                          <input type="text" value={vitals.flowRate || ''} onChange={(e) => handleVitalChange('flowRate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Flow Rate (L/min)" />
                          <input type="text" value={vitals.fio2 || ''} onChange={(e) => handleVitalChange('fio2', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="FiO2 (%)" />
                        </>
                      )}
                      <input type="text" value={vitals.notes || ''} onChange={(e) => handleVitalChange('notes', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm col-span-2" placeholder="Additional notes" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Examination Tabs and Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Examination Tabs */}
        <div className={cn(
          "bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[500px] transition-all duration-300",
          isFullWidth ? "lg:col-span-3" : "lg:col-span-2"
        )}>
        <div className="flex overflow-x-auto border-b border-slate-200 p-2 gap-1 bg-slate-50 items-center justify-between">
          <div className="flex gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id 
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
                {getTabStatusIcon(tab.id)}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 mr-2"
            title={isFullWidth ? "Exit Full Width" : "Full Width"}
          >
            {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-300">
              <GeneralTab 
                findings={generalFindings} 
                onChange={handleGeneralChange}
                onDictation={handleDictation}
                listeningField={listeningField}
                onMarkNormal={() => handleMarkAllNormal('general')}
                onClear={() => handleClearTab('general')}
                vitals={vitals}
              />
            </div>
          )}

          {activeTab === 'heent' && (
            <div className="animate-in fade-in duration-300">
              <HeentTab 
                findings={heentFindings} 
                onChange={(field, value) => setHeentFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} 
                onMarkNormal={() => handleMarkAllNormal('heent')}
                onClear={() => handleClearTab('heent')}
                onNavigateToTab={(tabId) => setActiveTab(tabId)}
                onSyncToSse={() => {
                  setActiveTab('sse');
                  toast.success("HEENT exam findings synced & navigated to Specialized Sensory Exam (SSE)!");
                }}
              />
            </div>
          )}

          {activeTab === 'sse' && (
            <div className="animate-in fade-in duration-300">
              <SseTab 
                findings={sseFindings} 
                onChange={(field, value) => setSseFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} 
                onMarkNormal={() => handleMarkAllNormal('sse')}
                onClear={() => handleClearTab('sse')}
              />
            </div>
          )}

          {activeTab === 'respiratory' && (
            <div className="animate-in fade-in duration-300">
              <RespiratoryTab 
                findings={respiratoryFindings} 
                onChange={(field, value) => setRespiratoryFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} 
                onMarkNormal={() => handleMarkAllNormal('respiratory')}
                onClear={() => handleClearTab('respiratory')}
              />
            </div>
          )}

          {activeTab === 'cardiovascular' && (
            <div className="animate-in fade-in duration-300">
              <CardiovascularTab 
                findings={cardiovascularFindings} 
                onChange={handleCardiovascularChange} 
                onMarkNormal={() => handleMarkAllNormal('cardiovascular')}
                onClear={() => handleClearTab('cardiovascular')}
              />
            </div>
          )}

          {activeTab === 'gastrointestinal' && (
            <div className="animate-in fade-in duration-300">
              <GastrointestinalTab 
                findings={gastrointestinalFindings} 
                onChange={handleGastrointestinalChange} 
                onMarkNormal={() => handleMarkAllNormal('gastrointestinal')}
                onClear={() => handleClearTab('gastrointestinal')}
              />
            </div>
          )}

          {activeTab === 'musculoskeletal' && (
            <div className="animate-in fade-in duration-300">
              <MusculoskeletalTab 
                findings={musculoskeletalFindings} 
                onChange={handleMusculoskeletalChange} 
                onMarkNormal={() => handleMarkAllNormal('musculoskeletal')}
                onClear={() => handleClearTab('musculoskeletal')}
              />
            </div>
          )}

          {activeTab === 'neurological' && (
            <div className="animate-in fade-in duration-300">
              <NeurologicalTab 
                findings={neurologicalFindings} 
                onChange={handleNeurologicalChange} 
                onMarkNormal={() => handleMarkAllNormal('neurological')}
                onClear={() => handleClearTab('neurological')}
              />
            </div>
          )}

          {activeTab === 'skin' && (
            <div className="animate-in fade-in duration-300">
              <SkinTab 
                findings={skinFindings} 
                onChange={handleSkinChange} 
                onMarkNormal={() => handleMarkAllNormal('skin')}
                onClear={() => handleClearTab('skin')}
              />
            </div>
          )}

          {activeTab === 'psychiatric' && (
            <div className="animate-in fade-in duration-300">
              <PsychiatricTab 
                findings={psychiatricFindings} 
                onChange={(field, value) => setPsychiatricFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} 
                onMarkNormal={() => handleMarkAllNormal('psychiatric')}
                onClear={() => handleClearTab('psychiatric')}
              />
            </div>
          )}

          {activeTab === 'geriatric' && (
            <div className="animate-in fade-in duration-300">
              <GeriatricTab 
                findings={geriatricFindings} 
                onChange={(field, value) => setGeriatricFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} 
                onMarkNormal={() => handleMarkAllNormal('geriatric')}
                onClear={() => handleClearTab('geriatric')}
              />
            </div>
          )}

          {activeTab === 'body-map' && (
            <div className="animate-in fade-in duration-300">
              <AnatomicalBodyMap
                pins={bodyPins}
                onPinsChange={setBodyPins}
                onSummaryGenerate={(sum) => setExamSummary(prev => prev ? `${prev}\n\n[Anatomical Annotations]\n${sum}` : `[Anatomical Annotations]\n${sum}`)}
              />
            </div>
          )}

          {activeTab === 'longitudinal' && (
            <div className="animate-in fade-in duration-300">
              <LongitudinalMatrix
                patientId={selectedPatient?.id}
                currentExamData={{
                  general: generalFindings,
                  respiratory: respiratoryFindings,
                  cardiovascular: cardiovascularFindings,
                  gastrointestinal: gastrointestinalFindings,
                  neurological: neurologicalFindings
                }}
                currentVitals={vitals}
              />
            </div>
          )}

          {activeTab === 'adaptive-demo' && (
            <div className="animate-in fade-in duration-300">
              <DemographicExamAdaptive
                patient={{
                  age: selectedPatient?.age ? Number(selectedPatient.age) : undefined,
                  name: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : undefined
                }}
              />
            </div>
          )}
        </div>
        </div>

        {/* Examination Summary */}
        {!isFullWidth && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sticky top-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Clipboard className="w-5 h-5 text-indigo-600" />
                  Examination Summary
                </h3>
                <button 
                  onClick={generateExamSummary}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
                  {isGenerating ? 'Generating...' : 'Auto-Generate with AI'}
                </button>
              </div>
              <Textarea 
                value={examSummary || ""}
                onChange={(e) => setExamSummary(e.target.value)}
                className="w-full min-h-[400px] p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
                placeholder="Enter your overall assessment and examination summary..."
              />
            </div>

            <FindingsAnalyzer 
              vitals={vitals} 
              findings={{
                general: generalFindings,
                heent: heentFindings,
                sse: sseFindings,
                respiratory: respiratoryFindings,
                cardiovascular: cardiovascularFindings,
                gastrointestinal: gastrointestinalFindings,
                musculoskeletal: musculoskeletalFindings,
                neurological: neurologicalFindings,
                skin: skinFindings,
                psychiatric: psychiatricFindings,
                geriatric: geriatricFindings
              }} 
            />
          </div>
        )}
        </div>
      </div>
);
}

interface GeneralTabProps {
  findings: any;
  onChange: (field: string, value: any, status?: string) => void;
  onDictation: (field: string, currentValue: string, setter: (val: string) => void) => void;
  listeningField: string | null;
  onMarkNormal: () => void;
  onClear: () => void;
  vitals?: Record<string, any>;
}

function GeneralTab({ findings, onChange, onDictation, listeningField, onMarkNormal, onClear, vitals = {} }: GeneralTabProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [isRedFlagsCollapsed, setIsRedFlagsCollapsed] = useState(true);

  // Sync active categories with findings on mount
  useEffect(() => {
    const active = Object.keys(findings?.detailed || {}).filter(key => (findings?.detailed || {})[key] && (findings?.detailed || {})[key].length > 0);
    setActiveCategories(prev => Array.from(new Set([...prev, ...active])));
  }, [findings.detailed]);

  // Compute Vitals & BMI Auto-Sync Suggestions
  const vitalsSuggestions = useMemo(() => {
    const suggestions: { id: string; category: string; option: string; reason: string; badge: string }[] = [];

    // BMI Calculation & Build Sync
    const bmiNum = Number(vitals.bmi);
    let derivedBmi = bmiNum;
    if ((!derivedBmi || isNaN(derivedBmi)) && vitals.weight && vitals.height) {
      const wKg = Number(vitals.weight);
      const hM = Number(vitals.height) / 100;
      if (wKg > 0 && hM > 0) derivedBmi = Number((wKg / (hM * hM)).toFixed(1));
    }

    if (derivedBmi > 0) {
      if (derivedBmi < 18.5) {
        suggestions.push({
          id: 'bmi-underweight',
          category: 'build',
          option: 'Underweight',
          reason: `Calculated BMI ${derivedBmi} (< 18.5)`,
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        });
      } else if (derivedBmi >= 18.5 && derivedBmi <= 24.9) {
        suggestions.push({
          id: 'bmi-normal',
          category: 'build',
          option: 'Normal',
          reason: `Calculated BMI ${derivedBmi} (18.5–24.9)`,
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        });
      } else if (derivedBmi >= 25.0 && derivedBmi <= 29.9) {
        suggestions.push({
          id: 'bmi-overweight',
          category: 'build',
          option: 'Overweight',
          reason: `Calculated BMI ${derivedBmi} (25.0–29.9)`,
          badge: 'bg-amber-100 text-amber-800 border-amber-300'
        });
      } else if (derivedBmi >= 30.0 && derivedBmi <= 39.9) {
        suggestions.push({
          id: 'bmi-obese',
          category: 'build',
          option: 'Obese',
          reason: `Calculated BMI ${derivedBmi} (30.0–39.9)`,
          badge: 'bg-rose-100 text-rose-800 border-rose-300'
        });
      } else if (derivedBmi >= 40.0) {
        suggestions.push({
          id: 'bmi-morbid',
          category: 'build',
          option: 'Morbidly Obese',
          reason: `Calculated BMI ${derivedBmi} (>= 40.0)`,
          badge: 'bg-purple-100 text-purple-800 border-purple-300'
        });
      }
    }

    // Oxygen Saturation < 92% -> Cyanosis & Distress
    const spo2 = Number(vitals.oxygenSaturation);
    if (spo2 > 0 && spo2 < 92) {
      suggestions.push({
        id: 'spo2-cyanosis-skin',
        category: 'skinSigns',
        option: 'Cyanosis',
        reason: `Hypoxia SpO2 ${spo2}% (< 92%)`,
        badge: 'bg-sky-100 text-sky-800 border-sky-300'
      });
      suggestions.push({
        id: 'spo2-cyanosis-ext',
        category: 'extremities',
        option: 'Cyanosis',
        reason: `Peripheral hypoxia SpO2 ${spo2}%`,
        badge: 'bg-sky-100 text-sky-800 border-sky-300'
      });
      suggestions.push({
        id: 'spo2-distressed',
        category: 'generalLook',
        option: 'Distressed',
        reason: `Respiratory distress from SpO2 ${spo2}%`,
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      });
    }

    // BP Hypo / Hypertensive Crisis
    const sys = Number(vitals.bpSystolic);
    const dia = Number(vitals.bpDiastolic);
    if (sys > 0 && sys < 90) {
      suggestions.push({
        id: 'bp-pallor',
        category: 'skinSigns',
        option: 'Pallor',
        reason: `Hypotension BP ${sys}/${dia || 60} mmHg`,
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      });
      suggestions.push({
        id: 'bp-cold-ext',
        category: 'extremities',
        option: 'Cold extremities',
        reason: `Hypoperfusion BP ${sys}/${dia || 60} mmHg`,
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      });
    } else if (sys >= 180 || dia >= 120) {
      suggestions.push({
        id: 'bp-distress',
        category: 'generalLook',
        option: 'Distressed',
        reason: `Hypertensive urgency/crisis ${sys}/${dia} mmHg`,
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      });
    }

    // Temperature > 38.0°C / 100.4°F
    const temp = Number(vitals.temperature);
    if (temp >= 38.0 || temp >= 100.4) {
      suggestions.push({
        id: 'fever-ill',
        category: 'generalLook',
        option: 'Ill-appearing',
        reason: `Febrile temperature ${temp}°`,
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      });
      suggestions.push({
        id: 'fever-dehydration',
        category: 'skinSigns',
        option: 'Dehydration',
        reason: `Febrile losses (${temp}°)`,
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      });
    }

    // Pain Scale >= 7
    const pain = Number(vitals.painScale);
    if (pain >= 7) {
      suggestions.push({
        id: 'pain-grimace',
        category: 'facialExpression',
        option: 'Grimace',
        reason: `Severe Pain Scale ${pain}/10`,
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      });
      suggestions.push({
        id: 'pain-distress',
        category: 'generalLook',
        option: 'Distressed',
        reason: `Severe Pain Scale ${pain}/10`,
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      });
    }

    return suggestions;
  }, [vitals]);

  const handleApplySingleSuggestion = (s: { category: string; option: string; reason: string }) => {
    const currentDetailed = findings.detailed || {};
    const currentOptions = currentDetailed[s.category] || [];
    if (!currentOptions.includes(s.option)) {
      const updated = { ...currentDetailed, [s.category]: [...currentOptions, s.option] };
      onChange('detailed', updated, 'abnormal');
      toast.success(`Applied ${s.option}`, { description: s.reason });
    }
  };

  const handleApplyAllVitalsSuggestions = () => {
    if (vitalsSuggestions.length === 0) return;
    const updatedDetailed = { ...(findings.detailed || {}) };
    vitalsSuggestions.forEach(s => {
      const existing = updatedDetailed[s.category] || [];
      if (!existing.includes(s.option)) {
        updatedDetailed[s.category] = [...existing, s.option];
      }
    });
    onChange('detailed', updatedDetailed, 'abnormal');
    toast.success('Synced All Vitals Indications', {
      description: `Applied ${vitalsSuggestions.length} vital sign / BMI cross-referenced findings.`
    });
  };

  const toggleCategory = (category: string, checked: boolean) => {
    if (checked) {
      setActiveCategories(prev => [...prev, category]);
    } else {
      setActiveCategories(prev => prev.filter(c => c !== category));
      // Clear findings for this category
      const newDetailed = { ...findings.detailed, [category]: [] };
      onChange('detailed', newDetailed);
    }
  };

  const handleOptionChange = (category: string, option: string, checked: boolean) => {
    const currentOptions = findings.detailed[category] || [];
    let newOptions;
    if (checked) {
      newOptions = [...currentOptions, option];
    } else {
      newOptions = currentOptions.filter((o: string) => o !== option);
    }
    onChange('detailed', { ...findings.detailed, [category]: newOptions });
  };

  const categories = [
    { 
      id: 'consciousLevel', 
      label: 'Conscious Level', 
      options: ['Alert', 'Not Alert', 'Lethargic', 'Obtunded', 'Stuporous', 'Comatose'] 
    },
    { 
      id: 'alertness', 
      label: 'Alertness', 
      options: ['Normal', 'Drowsy', 'Hyper-alert', 'Agitated'] 
    },
    { 
      id: 'orientation', 
      label: 'Orientation', 
      options: ['Time', 'Person', 'Place', 'Situation'] 
    },
    { 
      id: 'skinSigns', 
      label: 'Skin & Mucosal Signs', 
      options: ['Pallor', 'Cyanosis', 'Jaundice', 'Pigmentation', 'Skin rashes', 'Dehydration'] 
    },
    { 
      id: 'extremities', 
      label: 'Extremities & Nails', 
      options: ['Clubbing', 'Oedema (Limbs)', 'Capillary refill > 2s', 'Cyanosis', 'Cold extremities'] 
    },
    { 
      id: 'lymphatic', 
      label: 'Lymphatic System', 
      options: ['Lymphadenopathy', 'Tender lymph nodes', 'Matted lymph nodes'] 
    },
    { 
      id: 'generalLook', 
      label: 'General Look', 
      options: ['Ill-appearing', 'Distressed', 'Lethargic', 'Well-nourished', 'Well-developed', 'Cachectic'] 
    },
    { 
      id: 'build', 
      label: 'Build', 
      options: ['Cachexia', 'Underweight', 'Normal', 'Overweight', 'Obese', 'Morbidly Obese'] 
    },
    { 
      id: 'posture', 
      label: 'Posture', 
      options: ['Normal Posture', 'Kyphosis', 'Scoliosis', 'Lordosis', 'Stooped', 'Decorticate', 'Decerebrate'] 
    },
    { 
      id: 'gait', 
      label: 'Gait', 
      options: ['Normal Gait', 'Antalgic', 'Ataxic', 'Shuffling', 'Steppage', 'Waddling', 'Hemiplegic'] 
    },
    { 
      id: 'facialExpression', 
      label: 'Facial Expression', 
      options: ['Normal', 'Grimace', 'Mask-like', 'Staring', 'Asymmetrical', 'Flat affect', 'Anxious'] 
    }
  ];

  // Compute High-Risk Red Flag Alerts
  const redFlags = useMemo(() => {
    const flags: { title: string; category: string; description: string; urgency: 'critical' | 'high' }[] = [];
    const detailed = findings.detailed || {};

    // Consciousness
    if (detailed.consciousLevel?.includes('Comatose')) {
      flags.push({ title: 'Comatose State', category: 'Consciousness', description: 'Immediate airway protection & GCS evaluation required.', urgency: 'critical' });
    } else if (detailed.consciousLevel?.includes('Stuporous') || detailed.consciousLevel?.includes('Obtunded')) {
      flags.push({ title: 'Obtunded / Stuporous Sensorium', category: 'Consciousness', description: 'Depressed level of consciousness; evaluate for encephalopathy, acute stroke, or metabolic collapse.', urgency: 'critical' });
    }

    // Posture
    if (detailed.posture?.includes('Decerebrate') || detailed.posture?.includes('Decorticate')) {
      flags.push({ title: 'Pathologic Posturing (Decerebrate/Decorticate)', category: 'Neurologic', description: 'Severe brainstem/corticospinal dysfunction; urgent neurosurgical evaluation.', urgency: 'critical' });
    }
    if (detailed.posture?.includes('Stooped') && detailed.generalLook?.includes('Ill-appearing')) {
      flags.push({ title: 'Severe Antalgic / Guarding Posture', category: 'Physical Distress', description: 'Significant pain or acute abdominal/musculoskeletal pathology.', urgency: 'high' });
    }

    // Skin & Perfusion
    if (detailed.skinSigns?.includes('Cyanosis') || detailed.skinSigns?.includes('Dehydration') && detailed.skinSigns?.includes('Pallor')) {
      flags.push({ title: 'Central Cyanosis / Severe Hypoperfusion', category: 'Oxygenation & Perfusion', description: 'Inadequate tissue oxygenation or acute blood loss/shock state.', urgency: 'critical' });
    }
    if (detailed.extremities?.includes('Cold extremities') && detailed.extremities?.includes('Capillary refill > 2s')) {
      flags.push({ title: 'Poor Peripheral Perfusion / Shock Signs', category: 'Hemodynamics', description: 'Delayed capillary refill and cold extremities indicate systemic hypoperfusion.', urgency: 'critical' });
    }

    // Build & General Look
    if (detailed.generalLook?.includes('Cachectic') || detailed.build?.includes('Cachexia')) {
      flags.push({ title: 'Severe Cachexia / Metabolic Wasting', category: 'Nutritional / Malignancy', description: 'Severe catabolic state; screen for underlying malignancy, severe heart failure, or end-stage illness.', urgency: 'high' });
    }

    // Distress Tier & Pain
    if (findings.distressTier === 'unstable') {
      flags.push({ title: 'Hemodynamically Unstable Appearance', category: 'Triage Tier', description: 'Critical status requiring immediate resuscitation protocol & continuous monitoring.', urgency: 'critical' });
    } else if (findings.distressTier === 'severe') {
      flags.push({ title: 'Severe Clinical Distress', category: 'Triage Tier', description: 'Acute physiologic distress or severe acute pain presentation.', urgency: 'high' });
    }

    if ((findings.painScale ?? vitals.painScale ?? 0) >= 9) {
      flags.push({ title: `Extreme Pain (Score: ${findings.painScale ?? vitals.painScale}/10)`, category: 'Analgesia', description: 'Requires rapid parenteral analgesia and targeted diagnostic workup.', urgency: 'high' });
    }

    return flags;
  }, [findings, vitals]);

  const handleInsertRedFlagsToNotes = () => {
    if (redFlags.length === 0) return;
    const text = `[RED FLAG CRITICAL FINDINGS]:\n` + redFlags.map(f => `• ${f.title} (${f.category}): ${f.description}`).join('\n');
    const currentNote = findings.notes || "";
    if (!currentNote.trim()) {
      onChange('notes', text);
    } else if (!currentNote.includes('[RED FLAG CRITICAL FINDINGS]')) {
      onChange('notes', `${currentNote}\n\n${text}`);
    }
    toast.success('Inserted Red Flags into Notes', {
      description: 'Critical findings are now embedded in the exam summary and AI differential.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SectionHeader 
        title="General Appearance" 
        onMarkNormal={onMarkNormal} 
        onClear={onClear} 
      />

      {/* Triage & Distress Assessment Scale (Pain & Instability) */}
      <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Triage & Distress Scale (Pain & Clinical Instability)
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">Standardized Triage Assessment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 0-10 Pain Scale Slider */}
          <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                Pain Scale (NRS 0–10)
              </label>
              <div className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-bold border",
                (findings.painScale ?? vitals.painScale ?? 0) == 0 && "bg-emerald-50 text-emerald-700 border-emerald-200",
                (findings.painScale ?? vitals.painScale ?? 0) >= 1 && (findings.painScale ?? vitals.painScale ?? 0) <= 3 && "bg-emerald-100 text-emerald-800 border-emerald-300",
                (findings.painScale ?? vitals.painScale ?? 0) >= 4 && (findings.painScale ?? vitals.painScale ?? 0) <= 6 && "bg-amber-100 text-amber-800 border-amber-300",
                (findings.painScale ?? vitals.painScale ?? 0) >= 7 && (findings.painScale ?? vitals.painScale ?? 0) <= 9 && "bg-rose-100 text-rose-800 border-rose-300",
                (findings.painScale ?? vitals.painScale ?? 0) == 10 && "bg-purple-100 text-purple-900 border-purple-300"
              )}>
                Score: {findings.painScale ?? vitals.painScale ?? 0} / 10
                {" "}
                {(findings.painScale ?? vitals.painScale ?? 0) == 0 ? "😀 (No Pain)" :
                 (findings.painScale ?? vitals.painScale ?? 0) <= 3 ? "🙂 (Mild)" :
                 (findings.painScale ?? vitals.painScale ?? 0) <= 6 ? "😐 (Moderate)" :
                 (findings.painScale ?? vitals.painScale ?? 0) <= 9 ? "😣 (Severe)" : "😫 (Unbearable)"}
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={findings.painScale ?? vitals.painScale ?? 0}
              onChange={(e) => {
                const pVal = Number(e.target.value);
                onChange('painScale', pVal);
                // Auto sync distress tier if set to severe pain
                if (pVal >= 7 && (!findings.distressTier || findings.distressTier === 'none' || findings.distressTier === 'mild')) {
                  onChange('distressTier', 'severe');
                }
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium px-0.5">
              <span>0 (None)</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10 (Worst)</span>
            </div>

            <div className="flex gap-1.5 pt-1">
              {[0, 2, 5, 8, 10].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    onChange('painScale', p);
                    if (p >= 7) onChange('distressTier', 'severe');
                  }}
                  className={cn(
                    "flex-1 py-1 text-[11px] rounded-lg border font-medium transition-all cursor-pointer",
                    (findings.painScale ?? vitals.painScale ?? 0) === p
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  )}
                >
                  {p === 0 ? "0 Pain" : p === 10 ? "10 Max" : `${p}`}
                </button>
              ))}
            </div>
          </div>

          {/* Distress Tier Indicator */}
          <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Visual Distress Tier Indicator
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Select clinical tier</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'none', label: '🟢 None (NAD)', sub: 'Comfortable, no acute distress', color: 'border-emerald-200 bg-emerald-50 text-emerald-900', ring: 'ring-emerald-500' },
                { id: 'mild', label: '🟡 Mild Distress', sub: 'Mild pain/discomfort', color: 'border-amber-200 bg-amber-50 text-amber-900', ring: 'ring-amber-500' },
                { id: 'moderate', label: '🟠 Moderate Distress', sub: 'Tachypneic, grimacing', color: 'border-orange-200 bg-orange-50 text-orange-900', ring: 'ring-orange-500' },
                { id: 'severe', label: '🔴 Severe Distress', sub: 'Tripoding, accessory muscle use', color: 'border-rose-200 bg-rose-50 text-rose-900', ring: 'ring-rose-500' },
                { id: 'unstable', label: '🟣 Hemodynamically Unstable', sub: 'Hypoperfused, altered, critically ill', color: 'border-purple-200 bg-purple-50 text-purple-950', ring: 'ring-purple-500' }
              ].map(tier => {
                const isSelected = (findings.distressTier || 'none') === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      onChange('distressTier', tier.id);
                      if (tier.id !== 'none') {
                        onChange('appearance', 'abnormal', 'abnormal');
                      }
                      toast.info(`Set Distress Tier: ${tier.label.split(' ')[1] || tier.label}`);
                    }}
                    className={cn(
                      "p-2 rounded-lg border text-left transition-all cursor-pointer text-xs flex flex-col justify-between",
                      tier.color,
                      tier.id === 'unstable' && 'sm:col-span-2',
                      isSelected && `ring-2 ${tier.ring} font-bold shadow-xs bg-white`
                    )}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{tier.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal mt-0.5 leading-tight">{tier.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Vitals & BMI Auto-Sync Suggestions Panel */}
      {vitalsSuggestions.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Vitals & BMI Cross-Reference Suggestions ({vitalsSuggestions.length})
              </span>
            </div>
            <button
              type="button"
              onClick={handleApplyAllVitalsSuggestions}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              Sync All ({vitalsSuggestions.length})
            </button>
          </div>

          <p className="text-xs text-indigo-800/80">
            Detected clinical indications from recorded vitals & BMI. Click any badge to apply:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {vitalsSuggestions.map((s) => {
              const isAlreadyAdded = (findings.detailed?.[s.category] || []).includes(s.option);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleApplySingleSuggestion(s)}
                  disabled={isAlreadyAdded}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-2xs",
                    s.badge,
                    isAlreadyAdded && "opacity-50 cursor-not-allowed bg-slate-100 text-slate-500 border-slate-200"
                  )}
                >
                  <span className="font-bold">{s.option}</span>
                  <span className="text-[10px] opacity-80 font-mono">({s.reason})</span>
                  {isAlreadyAdded ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* High-Risk Red Flag Alerts Banner */}
      {redFlags.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-400/80 rounded-xl p-4 space-y-3 shadow-md animate-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-2.5">
            <div 
              className="flex items-center gap-2.5 cursor-pointer select-none group"
              onClick={() => setIsRedFlagsCollapsed(prev => !prev)}
            >
              <div className="p-1.5 bg-rose-600 text-white rounded-lg animate-pulse shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <span>High-Risk Red Flag Alert ({redFlags.length})</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded-full font-bold">
                    CRITICAL POSITIVES
                  </span>
                </h4>
                <p className="text-[11px] text-rose-800 font-medium">
                  High-priority clinical warnings requiring immediate attention and targeted workup.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleInsertRedFlagsToNotes}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                Feed into SOAP & AI ({redFlags.length})
              </button>
              <button
                type="button"
                onClick={() => setIsRedFlagsCollapsed(prev => !prev)}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-rose-200 shrink-0"
                title={isRedFlagsCollapsed ? "Expand Red Flags" : "Collapse Red Flags"}
              >
                {isRedFlagsCollapsed ? (
                  <>
                    <span>Expand</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Collapse</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {!isRedFlagsCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
              {redFlags.map((flag, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border text-xs space-y-1 shadow-2xs",
                    flag.urgency === 'critical' ? "bg-rose-100/90 border-rose-300 text-rose-950" : "bg-amber-50 border-amber-300 text-amber-950"
                  )}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className={cn("w-4 h-4 shrink-0", flag.urgency === 'critical' ? "text-rose-600" : "text-amber-600")} />
                      <span>{flag.title}</span>
                    </span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      flag.urgency === 'critical' ? "bg-rose-600 text-white" : "bg-amber-600 text-white"
                    )}>
                      {flag.category}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-snug pl-5">
                    {flag.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <label className="text-sm font-medium text-slate-700">Appearance:</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="appearance" 
                value="normal"
                checked={findings.appearance === 'normal'}
                onChange={() => {
                  onChange('appearance', 'normal', 'normal');
                }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Normal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="appearance" 
                value="abnormal"
                checked={findings.appearance === 'abnormal'}
                onChange={() => onChange('appearance', 'abnormal', 'abnormal')}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Abnormal</span>
            </label>
          </div>
        </div>

        {findings.appearance === 'abnormal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4 border-l-2 border-indigo-100">
            {categories.map(cat => (
              <CheckboxFindings
                key={cat.id}
                label={cat.label}
                options={cat.options.map(opt => ({ 
                  id: opt, 
                  label: opt,
                  severity: (opt.toLowerCase().includes('normal') || opt.toLowerCase().includes('alert')) ? 'normal' : 'abnormal'
                }))}
                selected={findings.detailed[cat.id] || []}
                onChange={(selected) => onChange('detailed', { ...findings.detailed, [cat.id]: selected })}
                allowSearch={true}
              />
            ))}
          </div>
        )}

        <div className="space-y-2 pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-900">Notes</label>
            <button 
              onClick={() => onDictation('general-notes', findings.notes, (val) => onChange('notes', val))}
              className={`p-1.5 rounded-full transition-colors ${listeningField === 'general-notes' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              title="Dictate Notes"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <Textarea 
            className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
            placeholder="Enter detailed notes about general appearance..."
            value={findings.notes || ""}
            onChange={(e) => onChange('notes', e.target.value)}
          />

          {/* Smart Phrase Library for General Narrative */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Smart Phrase Library (1-Tap Narrative Chips)
              </span>
              <span className="text-[10px] text-slate-400">Click chip to append to notes</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Sits comfortably on exam table, in no acute distress.",
                "Appears stated age, clean and appropriately dressed.",
                "Presents in wheelchair, unkempt appearance, slow response to commands.",
                "Alert, oriented x4, cooperative with physical examination.",
                "Mild distress secondary to acute pain, protective posture.",
                "Well-nourished, well-developed, interactive and articulate.",
                "Frail appearance, reduced body mass, slurred speech."
              ].map((phrase, idx) => {
                const isIncluded = (findings.notes || "").includes(phrase);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const currentNote = findings.notes || "";
                      if (!currentNote.trim()) {
                        onChange('notes', phrase);
                      } else if (!currentNote.includes(phrase)) {
                        const separator = currentNote.endsWith('.') || currentNote.endsWith('\n') ? ' ' : '. ';
                        onChange('notes', currentNote + separator + phrase);
                      }
                      toast.success('Inserted Smart Phrase', { description: `"${phrase}"` });
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg border text-xs text-left transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:shadow-xs",
                      isIncluded 
                        ? "bg-indigo-50 text-indigo-900 border-indigo-300 font-medium" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    )}
                  >
                    <Plus className="w-3 h-3 text-indigo-600 shrink-0" />
                    <span>"{phrase}"</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}