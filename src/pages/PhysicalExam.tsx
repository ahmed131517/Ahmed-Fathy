import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Eye, Wind, Heart, Activity, Move, Cpu, Feather as FeatherIcon, Clipboard, Save, Check, Thermometer, Droplets, Scale, Ruler, Mic, Sparkles, FileText, RefreshCw, CheckCircle2, AlertCircle, Camera, Trash2, CheckCircle, ChevronDown, ChevronUp, Edit2, X, Plus, AlertTriangle, Stethoscope, Ear, Hand, Info } from "lucide-react";
import { generateContentWithRetry } from "../utils/gemini";
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
import { JointBodyMap } from "./msk/JointBodyMap";
import { JointExamCard } from "./msk/JointExamCard";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { usePatient } from "@/lib/PatientContext";
import { useSymptom } from "@/lib/SymptomContext";

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
  { id: 'geriatric', name: 'Geriatric', icon: Scale },
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

export function MusculoskeletalTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
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
    onChange('jointExams', [...jointExams, newJoint]);
    setSelectedJoint("");
  };

  const removeJoint = (id: number) => {
    onChange('jointExams', jointExams.filter((j: JointExam) => j.id !== id));
  };

  const updateJoint = (id: number, field: keyof JointExam, value: any) => {
    onChange('jointExams', jointExams.map((j: JointExam) => j.id === id ? { ...j, [field]: value } : j));
  };

  const toggleSpecialTest = (examId: number, test: string) => {
    onChange('jointExams', jointExams.map((j: JointExam) => {
      if (j.id !== examId) return j;
      const results = j.specialTestResults.includes(test)
        ? j.specialTestResults.filter(t => t !== test)
        : [...j.specialTestResults, test];
      return { ...j, specialTestResults: results };
    }));
  };

  const handleJointMapClick = (joint: string) => {
    setSelectedJoint(joint);
  };

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-base">Musculoskeletal System</h4>

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
                examinedJoints={jointExams.map((j: JointExam) => j.joint)}
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
          {jointExams.map(exam => (
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

export function NeurologicalTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
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
      <h4 className="font-semibold text-base">Neurological System</h4>

      <CheckboxFindings
        label="Mental Status"
        options={[
          { id: "alert", label: "Alert" },
          { id: "oriented-x3", label: "Oriented x3" },
          { id: "normal-speech", label: "Normal Speech" },
          { id: "normal-memory", label: "Normal Memory" },
          { id: "follows-commands", label: "Follows Commands" },
        ]}
        selected={mental}
        onChange={(v) => onChange('mental', v)}
      />

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
                        value={cranialNervesFindings[cn.id] || "normal"} 
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
                          value={motorPower[m.id]?.right || "5/5"} 
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
                          value={motorPower[m.id]?.left || "5/5"} 
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
                          value={sensoryModalitiesFindings[m.id]?.right || "Normal"} 
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
                          value={sensoryModalitiesFindings[m.id]?.left || "Normal"} 
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
                  {reflexes.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs font-medium py-1">{r.label}</TableCell>
                      <TableCell className="py-1">
                        <Select 
                          value={reflexesFindings[r.id]?.right || "2+ (Normal)"} 
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
                          value={reflexesFindings[r.id]?.left || "2+ (Normal)"} 
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

export function SkinTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
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
      <h4 className="font-semibold text-base">Skin Examination</h4>

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
            {lesions.map(lesion => (
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
                        {morphologyOptions.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
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
                    {secondaryFeatureOptions.map(f => (
                      <div key={f.id} className="flex items-center gap-1.5">
                        <Checkbox
                          checked={lesion.secondaryFeatures.includes(f.id)}
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
                    {abcdeLabels.map(a => (
                      <label key={a.id} title={a.title}
                        className="flex items-center gap-1 text-xs cursor-pointer">
                        <Checkbox
                          checked={lesion.abcde.includes(a.id)}
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
    { id: 'tonsil-hypertrophy', text: 'Hypertrophy', type: 'select', values: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4'] },
  ]},
  'neck-rom': { title: 'Neck/ROM', normal: 'Supple', options: [
    { id: 'neck-meningismus', text: 'Meningismus', type: 'checkbox' },
    { id: 'neck-limited-rom', text: 'Limited ROM', type: 'checkbox' },
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
  { key: "head", title: "Head & Sinuses", parts: ["head", "head-hair", "sinus-frontal", "sinus-maxillary"] },
  { key: "eyes", title: "Eyes & Vision", parts: ["eyes-pupils", "eyes-eom", "eyes-conjunctiva", "eyes-sclera", "eyes-vf"] },
  { key: "ears", title: "Ears & Hearing", parts: ["ears-canals", "ears-tms", "ears-pinna"] },
  { key: "noseMouth", title: "Nose & Mouth", parts: ["nose-patency", "throat-op", "throat-mucosa", "throat-tonsils"] },
  { key: "neck", title: "Neck & Thyroid", parts: ["neck-rom", "neck-trachea", "neck-thyroid", "neck-lymph", "neck-carotids"] },
];

const heentSmartPhrases = [
  { label: "No Lymph", text: "No cervical lymphadenopathy." },
  { label: "OP Clear", text: "Oropharynx clear without exudate or erythema." },
  { label: "TMs Normal", text: "TMs clear with normal light reflex bilaterally." },
  { label: "PERRLA", text: "Pupils equal, round, reactive to light and accommodation." },
];

export function HeentTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const { heentState, pupilSize, notes } = findings;
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPart, setCurrentPart] = useState<string | null>(null);
  const [modalFindings, setModalFindings] = useState<Record<string, FindingData>>({});

  const getChipStatus = (partId: string) => heentState[partId]?.status;

  const openAbnormalModal = (partId: string) => {
    setCurrentPart(partId);
    setModalFindings(heentState[partId]?.findings || {});
    setModalOpen(true);
  };

  const handleChipClick = (partId: string) => {
    const current = heentState[partId]?.status;
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

  const markAllNormal = () => {
    const all: HeentState = {};
    Object.keys(heentMapping).forEach(partId => {
      all[partId] = { status: 'normal', findings: {} };
    });
    onChange('heentState', all);
  };

  const clearAll = () => onChange('heentState', {});

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base">HEENT & Neck Examination</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={markAllNormal} className="gap-1 h-7 text-xs">
            <CheckCircle className="h-3 w-3" /> All Normal
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll} className="gap-1 h-7 text-xs">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {heentSections.map(section => (
          <div key={section.key} className="rounded-lg border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold text-primary">{section.title}</h5>
              <Button
                size="sm" variant="ghost" className="h-6 text-[10px] px-2"
                onClick={() => {
                  const updates: HeentState = {};
                  section.parts.forEach(p => { updates[p] = { status: 'normal', findings: {} }; });
                  onChange('heentState', { ...heentState, ...updates });
                }}
              >
                ✓ Normal
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {section.parts.map(partId => {
                const part = heentMapping[partId];
                const status = getChipStatus(partId);
                const hasAbnormalFindings = heentState[partId]?.status === 'abnormal' &&
                  Object.values(heentState[partId]?.findings || {}).some((f: any) => f.active);
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
                    {part.title}
                    {hasAbnormalFindings && " •"}
                  </button>
                );
              })}
            </div>
            {section.key === "eyes" && (
              <div className="space-y-1 pt-2 border-t">
                <Label className="text-xs text-muted-foreground">Pupil Size: {pupilSize[0]}mm</Label>
                <Slider min={1} max={9} step={1} value={pupilSize} onValueChange={(v) => onChange('pupilSize', v)} className="w-full" />
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
            {currentPartInfo?.options.map(opt => (
              <div key={opt.id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30">
                {opt.type === 'checkbox' ? (
                  <>
                    <Checkbox
                      checked={!!modalFindings[opt.id]?.active}
                      onCheckedChange={(v) => toggleModalFinding(opt.id, !!v)}
                    />
                    <span className="text-sm flex-1">{opt.text}</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm flex-1">{opt.text}</span>
                    <Select
                      value={modalFindings[opt.id]?.value || ""}
                      onValueChange={v => setModalFindingValue(opt.id, v)}
                    >
                      <SelectTrigger className="h-7 text-xs w-28"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {opt.values?.map(v => (
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
                          (modalFindings[opt.id]?.side || 'B') === side
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

      <div className="space-y-2">
        <Label className="text-sm font-medium">Smart Phrases</Label>
        <div className="flex flex-wrap gap-2">
          {heentSmartPhrases.map(phrase => (
            <Button key={phrase.label} variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => onChange('notes', notes ? `${notes}\n${phrase.text}` : phrase.text)}>
              {phrase.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed notes about HEENT findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} className="min-h-[80px]" />
      </div>
    </div>
  );
}

export function SseTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const { visualAcuityR, visualAcuityL, fundoscopy, weber, rinneR, rinneL, otoscopy, notes } = findings;

  const markAllNormal = () => {
    onChange('visualAcuityR', '20/20');
    onChange('visualAcuityL', '20/20');
    onChange('fundoscopy', ['normal-fundus']);
    onChange('weber', 'midline');
    onChange('rinneR', 'ac>bc');
    onChange('rinneL', 'ac>bc');
    onChange('otoscopy', ['normal-tm']);
  };

  const clearAll = () => {
    onChange('visualAcuityR', '');
    onChange('visualAcuityL', '');
    onChange('fundoscopy', []);
    onChange('weber', '');
    onChange('rinneR', '');
    onChange('rinneL', '');
    onChange('otoscopy', []);
    onChange('notes', '');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-base">Specialized Sensory Exam (SSE)</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={markAllNormal} className="gap-1 h-7 text-xs">
            <CheckCircle className="h-3 w-3" /> All Normal
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll} className="gap-1 h-7 text-xs">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Visual Acuity (Snellen)</Label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Right Eye (OD)</Label>
                <Input value={visualAcuityR} onChange={e => onChange('visualAcuityR', e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Left Eye (OS)</Label>
                <Input value={visualAcuityL} onChange={e => onChange('visualAcuityL', e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
          </div>

          <CheckboxFindings
            label="Fundoscopy"
            options={[
              { id: "normal-fundus", label: "Normal Fundus / Sharp Discs" },
              { id: "papilledema", label: "Papilledema" },
              { id: "av-nicking", label: "AV Nicking" },
              { id: "hemorrhages", label: "Retinal Hemorrhages" },
              { id: "exudates", label: "Cotton Wool Spots / Exudates" },
            ]}
            selected={fundoscopy}
            onChange={(v) => onChange('fundoscopy', v)}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hearing Tests (Tuning Fork)</Label>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Weber Test</Label>
                <Select value={weber} onValueChange={(v) => onChange('weber', v)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="midline">Midline (Normal)</SelectItem>
                    <SelectItem value="lateral-right">Lateralizes to Right</SelectItem>
                    <SelectItem value="lateral-left">Lateralizes to Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Rinne (Right)</Label>
                  <Select value={rinneR} onValueChange={(v) => onChange('rinneR', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac>bc">AC {'>'} BC (Normal/Sensorineural)</SelectItem>
                      <SelectItem value="bc>ac">BC {'>'} AC (Conductive Loss)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Rinne (Left)</Label>
                  <Select value={rinneL} onValueChange={(v) => onChange('rinneL', v)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ac>bc">AC {'>'} BC (Normal/Sensorineural)</SelectItem>
                      <SelectItem value="bc>ac">BC {'>'} AC (Conductive Loss)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <CheckboxFindings
            label="Otoscopy"
            options={[
              { id: "normal-tm", label: "Normal TMs / Light Reflex Intact" },
              { id: "erythema", label: "Erythema / Bulging" },
              { id: "effusion", label: "Middle Ear Effusion" },
              { id: "perforation", label: "Perforation" },
              { id: "cerumen", label: "Impacted Cerumen" },
            ]}
            selected={otoscopy}
            onChange={(v) => onChange('otoscopy', v)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed SSE findings..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
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
  { id: "ejection-click", label: "Ejection Click" },
  { id: "opening-snap", label: "Opening Snap" },
  { id: "pericardial-rub", label: "Pericardial Rub" },
];

const cardioInspectionFindings = [
  { id: "jvd-elevated", label: "JVD Elevated" },
  { id: "visible-pulsations", label: "Visible Pulsations" },
  { id: "cyanosis", label: "Cyanosis" },
  { id: "clubbing", label: "Clubbing" },
  { id: "edema", label: "Peripheral Edema" },
  { id: "xanthoma", label: "Xanthoma" },
];

const cardioPalpationFindings = [
  { id: "normal-apex", label: "Normal Apex Beat" },
  { id: "displaced-apex", label: "Displaced Apex" },
  { id: "parasternal-heave", label: "Parasternal Heave" },
  { id: "thrills", label: "Thrills" },
  { id: "palpable-p2", label: "Palpable P2" },
];

const cardioAllFindingsList = [...cardioAuscultationFindings, ...cardioInspectionFindings, ...cardioPalpationFindings];

const cardioFindingAnalysis: Record<string, { severity?: string[]; timing?: string[]; character?: string[]; grade?: string[]; radiation?: string[]; significance: string }> = {
  "systolic-murmur": {
    grade: ["I/VI", "II/VI", "III/VI", "IV/VI", "V/VI", "VI/VI"],
    timing: ["Early Systolic", "Mid-Systolic", "Late Systolic", "Pan-Systolic"],
    character: ["Crescendo", "Decrescendo", "Crescendo-Decrescendo", "Plateau"],
    radiation: ["Axilla", "Carotids", "Back", "None"],
    significance: "Consider aortic stenosis, mitral regurgitation, VSD, or flow murmur. Grade and radiation help differentiate.",
  },
  "diastolic-murmur": {
    grade: ["I/IV", "II/IV", "III/IV", "IV/IV"],
    timing: ["Early Diastolic", "Mid-Diastolic", "Late Diastolic (Presystolic)"],
    character: ["Blowing", "Rumbling"],
    significance: "Always pathological. Consider aortic regurgitation (early, blowing) or mitral stenosis (mid, rumbling).",
  },
  "s3-gallop": {
    significance: "Suggests volume overload or ventricular dysfunction — consider heart failure, mitral regurgitation, or high-output states. Normal in young adults.",
  },
  "s4-gallop": {
    significance: "Suggests reduced ventricular compliance — consider hypertension, aortic stenosis, hypertrophic cardiomyopathy, or ischemia.",
  },
  "pericardial-rub": {
    character: ["Scratchy", "Grating", "Squeaky"],
    significance: "Suggests pericarditis — consider viral, uremic, post-MI (Dressler's), or autoimmune etiology.",
  },
  "ejection-click": {
    timing: ["Early Systolic"],
    significance: "Suggests bicuspid aortic valve or pulmonic stenosis.",
  },
  "opening-snap": {
    significance: "Classic for mitral stenosis. Interval from S2 to OS inversely correlates with stenosis severity.",
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

export function CardiovascularTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const {
    heart,
    pulses,
    regionFindings,
    notes
  } = findings;

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<FindingDetail | null>(null);

  const getRegionFindings = (region: string, tab: string): string[] =>
    regionFindings[region]?.[tab] || [];

  const setRegionTabFindings = (region: string, tab: string, findingsList: string[]) => {
    const currentRegion = regionFindings[region] || {
      auscultation: [],
      inspection: [],
      palpation: []
    };
    
    onChange('regionFindings', {
      ...regionFindings,
      [region]: {
        ...currentRegion,
        [tab]: findingsList,
      },
    });
  };

  const getRegionFindingCount = (regionId: string): number => {
    const region = regionFindings[regionId];
    if (!region) return 0;
    return (region.auscultation?.length || 0) + (region.inspection?.length || 0) + (region.palpation?.length || 0);
  };

  const getRegionFindingItems = (regionId: string): { findingId: string; label: string }[] => {
    const region = regionFindings[regionId];
    if (!region) return [];
    const items: { findingId: string; label: string }[] = [];
    
    ['auscultation', 'inspection', 'palpation'].forEach(tab => {
      (region[tab] || []).forEach((id: string) => {
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
      <h4 className="font-semibold text-base">Cardiovascular System</h4>

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
          {cardioHeartRegions.map(region => {
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
                  options={cardioAuscultationFindings.map(f => ({ id: `${selectedRegion}-ausc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "auscultation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "auscultation", v)}
                />
              </TabsContent>
              <TabsContent value="inspection">
                <CheckboxFindings
                  label="Inspection"
                  options={cardioInspectionFindings.map(f => ({ id: `${selectedRegion}-insp-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "inspection")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "inspection", v)}
                />
              </TabsContent>
              <TabsContent value="palpation">
                <CheckboxFindings
                  label="Palpation"
                  options={cardioPalpationFindings.map(f => ({ id: `${selectedRegion}-palp-${f.id}`, label: f.label }))}
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
                      <SelectContent>{analysis.grade.map(g => <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>)}</SelectContent>
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
                      <SelectContent>{analysis.radiation.map(r => <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>)}</SelectContent>
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



export function RespiratoryTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
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
      <h4 className="font-semibold text-base">Respiratory System</h4>

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
          {lungRegions.map(region => {
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
                  options={auscultationFindings.map(f => ({ id: `${selectedRegion}-ausc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "auscultation")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "auscultation", v)}
                />
              </TabsContent>
              <TabsContent value="percussion">
                <CheckboxFindings
                  label="Percussion"
                  options={percussionFindings.map(f => ({ id: `${selectedRegion}-perc-${f.id}`, label: f.label }))}
                  selected={getRegionFindings(selectedRegion, "percussion")}
                  onChange={(v) => setRegionTabFindings(selectedRegion, "percussion", v)}
                />
              </TabsContent>
              <TabsContent value="palpation">
                <CheckboxFindings
                  label="Palpation"
                  options={palpationFindings.map(f => ({ id: `${selectedRegion}-palp-${f.id}`, label: f.label }))}
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
                        {analysis.severity.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
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
                        {analysis.timing.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
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
                        {analysis.character.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
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
                        {analysis.pattern.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
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

export function GastrointestinalTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const {
    abdomen,
    regionFindings,
    notes
  } = findings;

  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [analysisTarget, setAnalysisTarget] = useState<FindingDetail | null>(null);

  const getRegionFindings = (region: string, tab: string): string[] =>
    regionFindings[region]?.[tab] || [];

  const setRegionTabFindings = (region: string, tab: string, findingsList: string[]) => {
    const currentRegion = regionFindings[region] || {
      palpation: [],
      auscultation: [],
      percussion: [],
      inspection: []
    };
    
    onChange('regionFindings', {
      ...regionFindings,
      [region]: {
        ...currentRegion,
        [tab]: findingsList,
      },
    });
  };

  const getRegionFindingCount = (regionId: string): number => {
    const region = regionFindings[regionId];
    if (!region) return 0;
    return (region.palpation?.length || 0) + (region.auscultation?.length || 0) + (region.percussion?.length || 0) + (region.inspection?.length || 0);
  };

  const getRegionFindingItems = (regionId: string): { findingId: string; label: string }[] => {
    const region = regionFindings[regionId];
    if (!region) return [];
    const items: { findingId: string; label: string }[] = [];
    
    ['palpation', 'auscultation', 'percussion', 'inspection'].forEach(tab => {
      (region[tab] || []).forEach((id: string) => {
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
      <h4 className="font-semibold text-base">Gastrointestinal System</h4>

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
          {giAbdomenRegions.map(region => {
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

export function PsychiatricTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const { mood, affect, thoughtProcess, thoughtContent, insight, judgment, notes } = findings;

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-base">Psychiatric Assessment</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Mood</Label>
            <Select value={mood} onValueChange={(v) => onChange('mood', v)}>
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
            <Select value={affect} onValueChange={(v) => onChange('affect', v)}>
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

          <div className="space-y-1.5">
            <Label className="text-sm">Thought Process</Label>
            <Select value={thoughtProcess} onValueChange={(v) => onChange('thoughtProcess', v)}>
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
        </div>

        <div className="space-y-4">
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
              <Select value={insight} onValueChange={(v) => onChange('insight', v)}>
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
              <Select value={judgment} onValueChange={(v) => onChange('judgment', v)}>
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

      <div className="space-y-1.5">
        <Label className="text-sm">Notes</Label>
        <Textarea placeholder="Enter detailed psychiatric assessment..." value={notes || ""} onChange={e => onChange('notes', e.target.value)} />
      </div>
    </div>
  );
}

export function GeriatricTab({ findings, onChange }: { findings: any, onChange: (field: string, value: any) => void }) {
  const { moca, mmse, frailty, adl, iadl, gait, notes } = findings;

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-base">Geriatric & Functional Assessment</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">MoCA Score</Label>
              <Input type="number" placeholder="/30" value={moca} onChange={e => onChange('moca', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">MMSE Score</Label>
              <Input type="number" placeholder="/30" value={mmse} onChange={e => onChange('mmse', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Clinical Frailty Scale</Label>
            <Select value={frailty} onValueChange={(v) => onChange('frailty', v)}>
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
            <Select value={gait} onValueChange={(v) => onChange('gait', v)}>
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
  const { selectedPatient } = usePatient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [examSummary, setExamSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [cranialNervesFindings, setCranialNervesFindings] = useState<Record<string, string>>({});
  const [showMotor, setShowMotor] = useState(false);
  const [motorBulk, setMotorBulk] = useState("normal");
  const [motorTone, setMotorTone] = useState("normal");
  const [motorPower, setMotorPower] = useState<Record<string, string>>({});
  const [showSensory, setShowSensory] = useState(false);
  const [sensoryModalitiesFindings, setSensoryModalitiesFindings] = useState<Record<string, string>>({});
  const [showReflexes, setShowReflexes] = useState(false);
  const [reflexesFindings, setReflexesFindings] = useState<Record<string, string>>({});
  const [plantarResponse, setPlantarResponse] = useState("flexor");
  const [clonus, setClonus] = useState("absent");

  const { symptoms } = useSymptom();

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
        bp_systolic: parseInt(vitals.bpSystolic) || undefined,
        bp_diastolic: parseInt(vitals.bpDiastolic) || undefined,
        hr: parseInt(vitals.pulse) || undefined,
        temp: parseFloat(vitals.temperature) || undefined,
        rr: parseInt(vitals.respiratoryRate) || undefined,
        spo2: parseInt(vitals.oxygenSaturation) || undefined,
        weight: parseFloat(vitals.weight) || undefined,
        height: parseFloat(vitals.height) || undefined,
        bmi: parseFloat(vitals.bmi) || undefined,
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

      const examData = {
        vitals,
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
    if (vitals.weight && vitals.height) {
      const weight = parseFloat(vitals.weight);
      const height = parseFloat(vitals.height) / 100; // cm to m
      if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        setVitals(prev => ({ ...prev, bmi }));
      }
    }
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
      Generallook: [],
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
    mental: [] as string[],
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
      alert('Speech recognition is not supported in this browser.');
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

      const response = await generateContentWithRetry({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setExamSummary(response.text || "Summary generation failed.");
    } catch (error) {
      console.error("Summary generation failed:", error);
      setExamSummary("Error generating summary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate BMI automatically
  useEffect(() => {
    const weight = parseFloat(vitals.weight);
    const height = parseFloat(vitals.height);
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi }));
    } else {
      setVitals(prev => ({ ...prev, bmi: '' }));
    }
  }, [vitals.weight, vitals.height]);

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
    <div className="space-y-6 h-full flex flex-col overflow-y-auto pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Physical Examination</h2>
          <p className="text-slate-500">Conduct and document comprehensive physical examinations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generateExamSummary}
            disabled={isGenerating}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} 
            {isGenerating ? 'Generating...' : 'Generate Summary'}
          </button>
          <button 
            onClick={handleSaveDraft}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save as Draft
          </button>
          <button 
            onClick={handleFinalize}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" /> Finalize Examination
          </button>
        </div>
      </div>

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
                value={vitals.bpSystolic}
                onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('bpSystolic', vitals.bpSystolic)}`}
                placeholder="120" 
              />
              <span className="text-slate-400 font-medium">/</span>
              <input 
                type="number" 
                value={vitals.bpDiastolic}
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
                value={vitals.pulse}
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
                value={vitals.temperature}
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
                value={vitals.rbs}
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
                value={vitals.respiratoryRate}
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
                value={vitals.weight}
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
                value={vitals.height}
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
              value={vitals.bmi}
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
                value={vitals.oxygenSaturation}
                onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none transition-colors ${getVitalColor('oxygenSaturation', vitals.oxygenSaturation)}`}
                placeholder="98" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">O2 Supply</label>
            <select
              value={vitals.oxygenType}
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
                  value={vitals.oxygenDose}
                  onChange={(e) => handleVitalChange('oxygenDose', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. 2L/min" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">O2 Invasive</label>
                <select
                  value={vitals.oxygenInvasive}
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
                      value={vitals.oxygenDeviceType}
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
                          <input type="text" value={vitals.fio2} onChange={(e) => handleVitalChange('fio2', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="FiO2 (%)" />
                          <input type="text" value={vitals.peep} onChange={(e) => handleVitalChange('peep', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PEEP (cmH2O)" />
                          <input type="text" value={vitals.pressureSupport} onChange={(e) => handleVitalChange('pressureSupport', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PS (cmH2O)" />
                          <input type="text" value={vitals.tidalVolume} onChange={(e) => handleVitalChange('tidalVolume', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Vt (mL)" />
                          <input type="text" value={vitals.pressureControl} onChange={(e) => handleVitalChange('pressureControl', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PC (cmH2O)" />
                          <input type="text" value={vitals.setRR} onChange={(e) => handleVitalChange('setRR', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Set RR (bpm)" />
                          <input type="text" value={vitals.ieRatio} onChange={(e) => handleVitalChange('ieRatio', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="I:E Ratio" />
                          <input type="text" value={vitals.pip} onChange={(e) => handleVitalChange('pip', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="PIP (cmH2O)" />
                        </>
                      ) : (
                        <>
                          <input type="text" value={vitals.flowRate} onChange={(e) => handleVitalChange('flowRate', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Flow Rate (L/min)" />
                          <input type="text" value={vitals.fio2} onChange={(e) => handleVitalChange('fio2', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="FiO2 (%)" />
                        </>
                      )}
                      <input type="text" value={vitals.notes} onChange={(e) => handleVitalChange('notes', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm col-span-2" placeholder="Additional notes" />
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col flex-1 overflow-hidden min-h-[500px]">
        <div className="flex overflow-x-auto border-b border-slate-200 p-2 gap-1 bg-slate-50">
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

        <div className="flex-1 p-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {activeTab === 'general' && (
            <div className="animate-in fade-in duration-300">
              <GeneralTab 
                findings={generalFindings} 
                onChange={handleGeneralChange}
                onDictation={handleDictation}
                listeningField={listeningField}
              />
            </div>
          )}

          {activeTab === 'heent' && (
            <div className="animate-in fade-in duration-300">
              <HeentTab findings={heentFindings} onChange={(field, value) => setHeentFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} />
            </div>
          )}

          {activeTab === 'sse' && (
            <div className="animate-in fade-in duration-300">
              <SseTab findings={sseFindings} onChange={(field, value) => setSseFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} />
            </div>
          )}

          {activeTab === 'respiratory' && (
            <div className="animate-in fade-in duration-300">
              <RespiratoryTab findings={respiratoryFindings} onChange={(field, value) => setRespiratoryFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} />
            </div>
          )}

          {activeTab === 'cardiovascular' && (
            <div className="animate-in fade-in duration-300">
              <CardiovascularTab findings={cardiovascularFindings} onChange={handleCardiovascularChange} />
            </div>
          )}

          {activeTab === 'gastrointestinal' && (
            <div className="animate-in fade-in duration-300">
              <GastrointestinalTab findings={gastrointestinalFindings} onChange={handleGastrointestinalChange} />
            </div>
          )}

          {activeTab === 'musculoskeletal' && (
            <div className="animate-in fade-in duration-300">
              <MusculoskeletalTab findings={musculoskeletalFindings} onChange={handleMusculoskeletalChange} />
            </div>
          )}

          {activeTab === 'neurological' && (
            <div className="animate-in fade-in duration-300">
              <NeurologicalTab findings={neurologicalFindings} onChange={handleNeurologicalChange} />
            </div>
          )}

          {activeTab === 'skin' && (
            <div className="animate-in fade-in duration-300">
              <SkinTab findings={skinFindings} onChange={handleSkinChange} />
            </div>
          )}

          {activeTab === 'psychiatric' && (
            <div className="animate-in fade-in duration-300">
              <PsychiatricTab findings={psychiatricFindings} onChange={(field, value) => setPsychiatricFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} />
            </div>
          )}

          {activeTab === 'geriatric' && (
            <div className="animate-in fade-in duration-300">
              <GeriatricTab findings={geriatricFindings} onChange={(field, value) => setGeriatricFindings(prev => ({ ...prev, [field]: value, status: 'abnormal' }))} />
            </div>
          )}
        </div>
        </div>

        {/* Examination Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sticky top-6">
          <div className="flex items-center justify-between mb-4">
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
          className="w-full flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50 focus:bg-white transition-colors"
          placeholder="Enter your overall assessment and examination summary..."
        />
      </div>
    </div>
  </div>
);
}

interface GeneralTabProps {
  findings: any;
  onChange: (field: string, value: any, status?: string) => void;
  onDictation: (field: string, currentValue: string, setter: (val: string) => void) => void;
  listeningField: string | null;
}

function GeneralTab({ findings, onChange, onDictation, listeningField }: GeneralTabProps) {
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

  // Sync active categories with findings on mount
  useEffect(() => {
    const active = Object.keys(findings.detailed).filter(key => findings.detailed[key] && findings.detailed[key].length > 0);
    setActiveCategories(prev => Array.from(new Set([...prev, ...active])));
  }, []);

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
      id: 'Generallook', 
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-2 mb-4">General Appearance</h3>
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-slate-100">
              {categories.map(cat => (
                <div key={cat.id} className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={activeCategories.includes(cat.id)}
                      onChange={(e) => toggleCategory(cat.id, e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-medium text-slate-900">{cat.label}</span>
                  </label>

                  {activeCategories.includes(cat.id) && (
                    <div className="flex flex-wrap gap-2 pl-6">
                      {cat.options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                            checked={findings.detailed[cat.id]?.includes(opt)}
                            onChange={(e) => handleOptionChange(cat.id, opt, e.target.checked)}
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}