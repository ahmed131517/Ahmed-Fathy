import React, { useState, useEffect } from 'react';
import { Star, Sparkles, Stethoscope, Heart, Baby, Activity, ShieldCheck, Flame, ChevronRight, Check, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { DosageFormBadge } from './DosageFormBadge';
import { cn } from '@/lib/utils';
import { deriveMedicationDefaults } from '@/data/medications';

export interface QuickMedication {
  id: string;
  name: string;
  brandName?: string;
  form: string;
  specialty: string;
  rank?: number;
  badge?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isCustom?: boolean;
}

export const TOP_PRESCRIBED_BY_SPECIALTY: Record<string, { label: string; icon: string; meds: QuickMedication[] }> = {
  gp: {
    label: 'General Practice',
    icon: '🩺',
    meds: [
      { id: 'gp_1', name: 'Paracetamol', brandName: 'Panadol Extra (Paracetamol)', form: '500mg Tablet', specialty: 'gp', badge: 'Top #1', dosage: '1 - 2 tablets', frequency: 'TID (Every 8 hours)', duration: '5 days', instructions: 'Take after meals for fever or pain' },
      { id: 'gp_2', name: 'Amoxicillin / Clavulanic Acid', brandName: 'Augmentin 1g (Amoxicillin / Clavulanic Acid)', form: '1000mg Tablet', specialty: 'gp', badge: '1st Line Antibiotic', dosage: '1 tablet', frequency: 'BID (Every 12 hours)', duration: '7 days', instructions: 'Take at the start of a meal to prevent stomach upset' },
      { id: 'gp_3', name: 'Ibuprofen', brandName: 'Brufen 400 (Ibuprofen)', form: '400mg Tablet', specialty: 'gp', dosage: '1 tablet', frequency: 'TID (Every 8 hours)', duration: '5 days', instructions: 'Take with food or glass of milk' },
      { id: 'gp_4', name: 'Omeprazole', brandName: 'Losec / Omez (Omeprazole)', form: '20mg Capsule', specialty: 'gp', dosage: '1 capsule', frequency: 'OD (Once daily in the morning)', duration: '14 days', instructions: 'Take 30 minutes before breakfast' },
      { id: 'gp_5', name: 'Cetirizine', brandName: 'Zyrtec (Cetirizine)', form: '10mg Tablet', specialty: 'gp', dosage: '1 tablet', frequency: 'OD (Once daily at bedtime)', duration: '7 days', instructions: 'May cause mild drowsiness' },
      { id: 'gp_6', name: 'Paracetamol / Pseudoephedrine', brandName: 'Congestal (Paracetamol / Pseudoephedrine)', form: 'Tablet', specialty: 'gp', badge: 'Cold & Flu', dosage: '1 tablet', frequency: 'TID (Every 8 hours)', duration: '5 days', instructions: 'Drink plenty of fluids' },
    ],
  },
  cardio: {
    label: 'Cardiology',
    icon: '🫀',
    meds: [
      { id: 'car_1', name: 'Bisoprolol', brandName: 'Concor 5mg (Bisoprolol)', form: '5mg Tablet', specialty: 'cardio', badge: 'Beta Blocker', dosage: '1 tablet', frequency: 'OD (Once daily in the morning)', duration: '30 days', instructions: 'Do not discontinue abruptly without medical advice' },
      { id: 'car_2', name: 'Atorvastatin', brandName: 'Lipitor 20 (Atorvastatin)', form: '20mg Tablet', specialty: 'cardio', badge: 'Lipid Lowering', dosage: '1 tablet', frequency: 'OD (Once daily at bedtime)', duration: '30 days', instructions: 'Take regularly at evening' },
      { id: 'car_3', name: 'Amlodipine', brandName: 'Norvasc 5 (Amlodipine)', form: '5mg Tablet', specialty: 'cardio', dosage: '1 tablet', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Monitor blood pressure regularly' },
      { id: 'car_4', name: 'Valsartan', brandName: 'Tareg / Diovan (Valsartan)', form: '80mg Tablet', specialty: 'cardio', dosage: '1 tablet', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Take with or without food' },
      { id: 'car_5', name: 'Clopidogrel', brandName: 'Plavix 75 (Clopidogrel)', form: '75mg Tablet', specialty: 'cardio', badge: 'Antiplatelet', dosage: '1 tablet', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Take same time every day' },
      { id: 'car_6', name: 'Furosemide', brandName: 'Lasix 40 (Furosemide)', form: '40mg Tablet', specialty: 'cardio', badge: 'Diuretic', dosage: '1 tablet', frequency: 'OD (Once daily in the morning)', duration: '30 days', instructions: 'Take in morning to prevent nighttime urination' },
    ],
  },
  peds: {
    label: 'Pediatrics',
    icon: '👶',
    meds: [
      { id: 'ped_1', name: 'Paracetamol Pediatric', brandName: 'Cetal / Panadol Baby (Paracetamol Pediatric)', form: '120mg/5ml Syrup', specialty: 'peds', badge: 'Peds Antipyretic', dosage: '5 ml', frequency: 'QID (Every 6 hours as needed)', duration: '3 - 5 days', instructions: 'Calculate exact weight dose before giving' },
      { id: 'ped_2', name: 'Amoxicillin Pediatric', brandName: 'E-Mox Susp 250 (Amoxicillin Pediatric)', form: '250mg/5ml Liquid', specialty: 'peds', badge: 'Peds Antibiotic', dosage: '5 ml', frequency: 'TID (Every 8 hours)', duration: '7 days', instructions: 'Shake bottle thoroughly before each dose' },
      { id: 'ped_3', name: 'Salbutamol Syrup', brandName: 'Ventolin Syrup (Salbutamol Syrup)', form: '2mg/5ml Liquid', specialty: 'peds', dosage: '2.5 ml - 5 ml', frequency: 'TID (Every 8 hours)', duration: '5 days', instructions: 'For wheezing or bronchospasm' },
      { id: 'ped_4', name: 'Domperidone Drops', brandName: 'Gastromotil Drops (Domperidone Drops)', form: '10mg/ml Oral Drops', specialty: 'peds', badge: 'Pediatric Antiemetic', dosage: '5 - 10 drops', frequency: 'TID (Every 8 hours before feed)', duration: '3 days', instructions: 'Administer 15 minutes prior to feeding' },
      { id: 'ped_5', name: 'Zinc Sulfate Syrup', brandName: 'Zincorigin (Zinc Sulfate Syrup)', form: '20mg/5ml Liquid', specialty: 'peds', badge: 'Diarrhea Adjuvant', dosage: '5 ml', frequency: 'OD (Once daily)', duration: '10 - 14 days', instructions: 'Essential oral rehydration therapy adjuvant' },
    ],
  },
  gastro: {
    label: 'Gastroenterology',
    icon: '🧪',
    meds: [
      { id: 'gas_1', name: 'Esomeprazole', brandName: 'Nexium 40 (Esomeprazole)', form: '40mg Tablet', specialty: 'gastro', badge: 'Potent PPI', dosage: '1 tablet', frequency: 'OD (Once daily in morning)', duration: '14 days', instructions: 'Swallow whole with liquid 1 hour before meal' },
      { id: 'gas_2', name: 'Mebeverine HCl', brandName: 'Colona / Duspatalin (Mebeverine HCl)', form: '135mg Tablet', specialty: 'gastro', badge: 'IBS Antispasmodic', dosage: '1 tablet', frequency: 'TID (Every 8 hours before meals)', duration: '14 days', instructions: 'Take 20 minutes before meals' },
      { id: 'gas_3', name: 'Metoclopramide', brandName: 'Plasil / Primperan (Metoclopramide)', form: '10mg Tablet', specialty: 'gastro', dosage: '1 tablet', frequency: 'TID (Every 8 hours before meals)', duration: '5 days', instructions: 'Take 30 min before food for nausea' },
      { id: 'gas_4', name: 'Lactulose', brandName: 'Duphalac (Lactulose)', form: '10g/15ml Liquid', specialty: 'gastro', badge: 'Osmotic Laxative', dosage: '15 ml', frequency: 'BID (Every 12 hours)', duration: '7 days', instructions: 'Mix with fruit juice or water if preferred' },
      { id: 'gas_5', name: 'Probiotic Mixture', brandName: 'Lacteol Fort (Probiotic Mixture)', form: 'Sachet / Powder', specialty: 'gastro', badge: 'Gut Flora', dosage: '1 sachet in water', frequency: 'BID (Every 12 hours)', duration: '7 days', instructions: 'Dissolve in half glass of room temp water' },
    ],
  },
  derm: {
    label: 'Dermatology',
    icon: '🧴',
    meds: [
      { id: 'der_1', name: 'Hydrocortisone 1%', brandName: 'Dermocort (Hydrocortisone 1%)', form: 'Topical Cream', specialty: 'derm', badge: 'Mild Steroid', dosage: 'Apply thin layer', frequency: 'BID (Every 12 hours)', duration: '7 days', instructions: 'Gently rub into affected skin area only' },
      { id: 'der_2', name: 'Fusidic Acid 2%', brandName: 'Fucidin Cream (Fusidic Acid 2%)', form: 'Topical Cream', specialty: 'derm', badge: 'Topical Antibiotic', dosage: 'Apply thin layer', frequency: 'TID (Every 8 hours)', duration: '7 days', instructions: 'Cleanse affected area before applying' },
      { id: 'der_3', name: 'Terbinafine 1%', brandName: 'Lamisil Cream (Terbinafine 1%)', form: 'Topical Cream', specialty: 'derm', badge: 'Antifungal', dosage: 'Apply thin layer', frequency: 'BID (Every 12 hours)', duration: '14 days', instructions: 'Continue application for full 2 weeks' },
      { id: 'der_4', name: 'Isotretinoin', brandName: 'Netlook / Roaccutane (Isotretinoin)', form: '20mg Capsule', specialty: 'derm', badge: 'Acne Therapy', dosage: '1 capsule', frequency: 'OD (Once daily with main meal)', duration: '30 days', instructions: 'Strict pregnancy prevention & monitor LFTs' },
    ],
  },
  pulmo: {
    label: 'Pulmonology',
    icon: '🫁',
    meds: [
      { id: 'pul_1', name: 'Salbutamol Inhaler', brandName: 'Ventolin Evohaler (Salbutamol Inhaler)', form: '100mcg/puff Inhaler', specialty: 'pulmo', badge: 'Rescue Inhaler', dosage: '1 - 2 puffs', frequency: 'PRN (As needed for dyspnea)', duration: '30 days', instructions: 'Inhale deeply and hold breath for 10 seconds' },
      { id: 'pul_2', name: 'Budesonide / Formoterol', brandName: 'Symbicort 160/4.5 (Budesonide / Formoterol)', form: 'Inhaler / Respiratory', specialty: 'pulmo', badge: 'ICS + LABA', dosage: '1 - 2 puffs', frequency: 'BID (Every 12 hours)', duration: '30 days', instructions: 'Rinse mouth thoroughly with water after use' },
      { id: 'pul_3', name: 'Acetylcysteine', brandName: 'Fluimucil 600 (Acetylcysteine)', form: '600mg Sachet', specialty: 'pulmo', badge: 'Mucolytic', dosage: '1 sachet in water', frequency: 'OD (Once daily after lunch)', duration: '7 days', instructions: 'Dissolve in half glass of water' },
      { id: 'pul_4', name: 'Montelukast', brandName: 'Singulair 10 (Montelukast)', form: '10mg Tablet', specialty: 'pulmo', badge: 'Leukotriene Blocker', dosage: '1 tablet', frequency: 'OD (Once daily at bedtime)', duration: '30 days', instructions: 'Take in the evening for asthma/allergy control' },
    ],
  },
  neuro: {
    label: 'Neurology',
    icon: '🧠',
    meds: [
      { id: 'neu_1', name: 'Pregabalin', brandName: 'Lyrica / Lyrolin (Pregabalin)', form: '75mg Capsule', specialty: 'neuro', badge: 'Neuropathic Pain', dosage: '1 capsule', frequency: 'BID (Every 12 hours)', duration: '30 days', instructions: 'May cause drowsiness; avoid driving initially' },
      { id: 'neu_2', name: 'Gabapentin', brandName: 'Gaptin (Gabapentin)', form: '300mg Capsule', specialty: 'neuro', dosage: '1 capsule', frequency: 'TID (Every 8 hours)', duration: '30 days', instructions: 'Do not discontinue suddenly' },
      { id: 'neu_3', name: 'Levetiracetam', brandName: 'Keppra 500 (Levetiracetam)', form: '500mg Tablet', specialty: 'neuro', badge: 'Antiepileptic', dosage: '1 tablet', frequency: 'BID (Every 12 hours)', duration: '30 days', instructions: 'Maintain consistent 12-hour dosing interval' },
      { id: 'neu_4', name: 'Amitriptyline', brandName: 'Tryptizol 25 (Amitriptyline)', form: '25mg Tablet', specialty: 'neuro', badge: 'Migraine / Pain', dosage: '1 tablet', frequency: 'OD (Once daily at bedtime)', duration: '30 days', instructions: 'Take 1 - 2 hours before sleep' },
    ],
  },
  endo: {
    label: 'Endocrinology',
    icon: '🩸',
    meds: [
      { id: 'end_1', name: 'Metformin', brandName: 'Glucophage 500 (Metformin)', form: '500mg Tablet', specialty: 'endo', badge: 'Diabetes 1st Line', dosage: '1 tablet', frequency: 'BID (Every 12 hours with meals)', duration: '30 days', instructions: 'Take with main meals to prevent GI discomfort' },
      { id: 'end_2', name: 'Levothyroxine', brandName: 'Euthyrox 50 (Levothyroxine)', form: '50mcg Tablet', specialty: 'endo', badge: 'Hypothyroidism', dosage: '1 tablet', frequency: 'OD (Once daily on empty stomach)', duration: '30 days', instructions: 'Take 30-60 min before breakfast with water' },
      { id: 'end_3', name: 'Empagliflozin', brandName: 'Jardiance 10 (Empagliflozin)', form: '10mg Tablet', specialty: 'endo', badge: 'SGLT2 Inhibitor', dosage: '1 tablet', frequency: 'OD (Once daily in morning)', duration: '30 days', instructions: 'Maintain adequate fluid hydration' },
      { id: 'end_4', name: 'Sitagliptin', brandName: 'Januvia 100 (Sitagliptin)', form: '100mg Tablet', specialty: 'endo', badge: 'DPP-4 Inhibitor', dosage: '1 tablet', frequency: 'OD (Once daily)', duration: '30 days', instructions: 'Take with or without food' },
    ],
  },
  ortho: {
    label: 'Orthopedics',
    icon: '🦴',
    meds: [
      { id: 'ort_1', name: 'Meloxicam', brandName: 'Mobic 15 (Meloxicam)', form: '15mg Tablet', specialty: 'ortho', badge: 'Joint NSAID', dosage: '1 tablet', frequency: 'OD (Once daily after meal)', duration: '10 days', instructions: 'Take with food and full glass of water' },
      { id: 'ort_2', name: 'Celecoxib', brandName: 'Celebrex 200 (Celecoxib)', form: '200mg Capsule', specialty: 'ortho', badge: 'COX-2 Selective', dosage: '1 capsule', frequency: 'OD (Once daily after meal)', duration: '14 days', instructions: 'Gentler on stomach; take with food' },
      { id: 'ort_3', name: 'Glucosamine / Chondroitin', brandName: 'Dorofen / Genuphil (Glucosamine / Chondroitin)', form: 'Tablet', specialty: 'ortho', badge: 'Cartilage Care', dosage: '1 tablet', frequency: 'TID (Every 8 hours after meals)', duration: '30 days', instructions: 'Take regularly for cartilage support' },
      { id: 'ort_4', name: 'Diclofenac Gel', brandName: 'Voltaren Emulgel (Diclofenac Gel)', form: 'Topical Gel', specialty: 'ortho', badge: 'Topical Analgesic', dosage: 'Apply thin layer', frequency: 'TID (Every 8 hours)', duration: '10 days', instructions: 'Gently massage onto painful joint' },
    ],
  },
  ent: {
    label: 'ENT & Eye',
    icon: '👁️',
    meds: [
      { id: 'ent_1', name: 'Xylometazoline', brandName: 'Otrivin Adult (Xylometazoline)', form: 'Topical Spray', specialty: 'ent', badge: 'Nasal Decongestant', dosage: '1 - 2 sprays', frequency: 'TID (Every 8 hours)', duration: '3 - 5 days max', instructions: 'Do NOT use for more than 5 consecutive days' },
      { id: 'ent_2', name: 'Tobramycin / Dexamethasone', brandName: 'Tobradex Drops (Tobramycin / Dexamethasone)', form: 'Ophthalmic Drops', specialty: 'ent', badge: 'Antibiotic + Steroid', dosage: '1 - 2 drops', frequency: 'QID (Every 6 hours)', duration: '7 days', instructions: 'Instill into affected eye; keep tip clean' },
      { id: 'ent_3', name: 'Sodium Hyaluronate', brandName: 'Polyfresh / Tears (Sodium Hyaluronate)', form: 'Ophthalmic Drops', specialty: 'ent', badge: 'Artificial Tears', dosage: '1 - 2 drops', frequency: 'PRN (As needed for dry eyes)', duration: '30 days', instructions: 'Instill when experiencing dryness or strain' },
      { id: 'ent_4', name: 'Ciprofloxacin Otic', brandName: 'Ciprocin Ear Drops (Ciprofloxacin Otic)', form: 'Ear Drops', specialty: 'ent', badge: 'Otic Antibiotic', dosage: '3 - 4 drops', frequency: 'BID (Every 12 hours)', duration: '7 days', instructions: 'Lie with affected ear up for 2 minutes after drops' },
    ],
  },
};

const FAVORITES_STORAGE_KEY = 'clinic_custom_favorite_meds_v1';
const CUSTOM_MEDS_LIST_KEY = 'clinic_user_added_custom_meds_v1';

interface FavoritesQuickBarProps {
  onSelectMedication: (medName: string, form: any, fullDetails?: any) => void;
  className?: string;
}

export function FavoritesQuickBar({ onSelectMedication, className = '' }: FavoritesQuickBarProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [pinnedMedIds, setPinnedMedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default initial pinned items
    return ['gp_1', 'gp_2', 'gp_4', 'car_1', 'peds_1', 'pul_1'];
  });

  const [customUserMeds, setCustomUserMeds] = useState<QuickMedication[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_MEDS_LIST_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // New custom drug form state
  const [newMedName, setNewMedName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newForm, setNewForm] = useState('500mg Tablet');
  const [newSpecialty, setNewSpecialty] = useState('gp');
  const [newDosage, setNewDosage] = useState('1 tablet');
  const [newFrequency, setNewFrequency] = useState('BID (Every 12 hours)');
  const [newDuration, setNewDuration] = useState('7 days');

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(pinnedMedIds));
    } catch {
      // ignore
    }
  }, [pinnedMedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_MEDS_LIST_KEY, JSON.stringify(customUserMeds));
    } catch {
      // ignore
    }
  }, [customUserMeds]);

  const togglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPinnedMedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add a brand new custom medication
  const handleAddCustomDrugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const createdMed: QuickMedication = {
      id: newId,
      name: newMedName.trim(),
      brandName: newBrandName.trim() || undefined,
      form: newForm || 'Tablet',
      specialty: newSpecialty,
      badge: '★ My Favorite',
      dosage: newDosage || '1 tablet',
      frequency: newFrequency || 'OD (Once daily)',
      duration: newDuration || '7 days',
      instructions: 'Take as directed by doctor',
      isCustom: true,
    };

    setCustomUserMeds((prev) => [createdMed, ...prev]);
    setPinnedMedIds((prev) => [newId, ...prev]);

    // Reset form
    setNewMedName('');
    setNewBrandName('');
    setIsAddModalOpen(false);
  };

  // Collect all medications across categories including custom ones
  const allMeds = React.useMemo(() => {
    const list: QuickMedication[] = [...customUserMeds];
    Object.values(TOP_PRESCRIBED_BY_SPECIALTY).forEach((spec) => {
      spec.meds.forEach((m) => {
        if (!list.some((existing) => existing.id === m.id)) {
          list.push(m);
        }
      });
    });
    return list;
  }, [customUserMeds]);

  // Filtered medications to render
  const currentMeds = React.useMemo(() => {
    if (selectedSpecialty === 'pinned') {
      return allMeds.filter((m) => pinnedMedIds.includes(m.id));
    }
    if (selectedSpecialty === 'all') {
      // Show top favorites + custom + general practice
      const pinned = allMeds.filter((m) => pinnedMedIds.includes(m.id));
      const gpMeds = TOP_PRESCRIBED_BY_SPECIALTY.gp.meds;
      const combined = [...pinned];
      gpMeds.forEach((m) => {
        if (!combined.some((c) => c.id === m.id)) {
          combined.push(m);
        }
      });
      return combined;
    }
    return allMeds.filter((m) => m.specialty === selectedSpecialty || TOP_PRESCRIBED_BY_SPECIALTY[selectedSpecialty]?.meds.some(x => x.id === m.id));
  }, [selectedSpecialty, pinnedMedIds, allMeds]);

  const handleMedClick = (med: QuickMedication) => {
    setAddedSuccessId(med.id);
    setTimeout(() => setAddedSuccessId(null), 1200);

    const formObj = {
      id: `form_quick_${med.id}`,
      name: med.form,
      concentration: med.strength || med.form,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
    };

    const fullDetails = {
      name: med.name,
      generic_name: med.name,
      dosage_form: med.form,
      brand_names_egypt: med.brandName ? [med.brandName] : [med.name],
      adult_dose: `${med.dosage} ${med.frequency}`,
      patient_counseling: [med.instructions],
      forms: [formObj],
    };

    onSelectMedication(med.name, formObj, fullDetails);
  };

  return (
    <div className={`bg-gradient-to-br from-indigo-900/95 via-slate-900 to-indigo-950 text-white rounded-xl p-3.5 shadow-md border border-indigo-700/40 relative overflow-hidden transition-all ${className}`}>
      {/* Decorative subtle background elements */}
      <div className="absolute -right-8 -top-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-28 h-28 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      {/* QuickBar Header */}
      <div className={cn("flex flex-wrap items-center justify-between gap-2 px-0.5", !isCollapsed && "mb-2.5")}>
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 cursor-pointer group select-none flex-1 min-w-[200px]"
          title={isCollapsed ? "Click to expand Quick-Select bar" : "Click to collapse Quick-Select bar"}
        >
          <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg border border-amber-400/30 group-hover:bg-amber-400/30 transition-colors">
            <Star className="w-4 h-4 fill-amber-400 text-amber-300" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5 group-hover:text-amber-200 transition-colors">
              Quick-Select Top Prescribed
            </h4>
            <p className="text-[11px] text-slate-300 font-medium">
              {isCollapsed ? "Collapsed • Click header or arrow to expand quick medication pills" : "Click ⭐ star on any pill to pin it, or add your custom quick drugs!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm border border-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Drug</span>
            </button>
          )}

          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setSelectedSpecialty(selectedSpecialty === 'pinned' ? 'all' : 'pinned')}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border",
                selectedSpecialty === 'pinned'
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-sm"
                  : "bg-slate-800/80 text-amber-300 border-amber-400/30 hover:bg-slate-800"
              )}
            >
              <Star className={cn("w-3 h-3", selectedSpecialty === 'pinned' ? "fill-slate-950" : "fill-amber-400")} />
              <span>Pinned ({pinnedMedIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-indigo-500/40 hover:border-indigo-400 transition-all flex items-center gap-1 shadow-sm"
            title={isCollapsed ? "Expand Quick-Select Bar" : "Collapse Quick-Select Bar"}
          >
            {isCollapsed ? (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300 px-1">Expand</span>
                <ChevronDown className="w-4 h-4 text-amber-300" />
              </>
            ) : (
              <>
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-300 px-1">Collapse</span>
                <ChevronUp className="w-4 h-4 text-slate-300" />
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Specialty Filter Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-2 scrollbar-hide border-b border-indigo-800/50">
        <button
          type="button"
          onClick={() => setSelectedSpecialty('all')}
          className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border",
            selectedSpecialty === 'all'
              ? "bg-indigo-500 text-white border-indigo-400 shadow-xs"
              : "bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
          )}
        >
          <span>🌟 Popular</span>
        </button>

        {Object.entries(TOP_PRESCRIBED_BY_SPECIALTY).map(([key, spec]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedSpecialty(key)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 border",
              selectedSpecialty === key
                ? "bg-indigo-500 text-white border-indigo-400 shadow-xs"
                : "bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white"
            )}
          >
            <span>{spec.icon}</span>
            <span>{spec.label}</span>
          </button>
        ))}
      </div>

      {/* Medication Quick Pills List */}
      <div className="mt-2.5 flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
        {currentMeds.length === 0 ? (
          <div className="w-full text-center py-4 text-xs text-slate-400 italic">
            No pinned favorite drugs in this category. Click "+ Add Custom Drug" above or toggle ⭐ on any drug to pin it!
          </div>
        ) : (
          currentMeds.map((med) => {
            const isPinned = pinnedMedIds.includes(med.id);
            const isJustAdded = addedSuccessId === med.id;

            return (
              <div
                key={med.id}
                onClick={() => handleMedClick(med)}
                className={cn(
                  "group relative cursor-pointer flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-lg border transition-all text-left shadow-2xs select-none",
                  isJustAdded
                    ? "bg-emerald-500 text-white border-emerald-300 scale-95"
                    : "bg-slate-800/90 hover:bg-indigo-600/90 text-white border-indigo-500/30 hover:border-indigo-400 shadow-sm"
                )}
                title={`Click to add ${med.name} (${med.form}) with clinical defaults`}
              >
                {/* Pin/Unpin Star Button */}
                <button
                  type="button"
                  onClick={(e) => togglePin(e, med.id)}
                  className="p-1 -ml-1 text-slate-400 hover:text-amber-300 transition-colors shrink-0"
                  title={isPinned ? 'Unpin from Quick-Bar' : 'Pin to Quick-Bar'}
                >
                  <Star className={cn('w-3.5 h-3.5', isPinned ? 'fill-amber-400 text-amber-400' : '')} />
                </button>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate max-w-[140px] text-white group-hover:text-amber-200">
                      {med.name}
                    </span>
                    {med.brandName && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-indigo-950/80 text-indigo-200 rounded border border-indigo-400/20 font-medium truncate max-w-[100px]">
                        {med.brandName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <DosageFormBadge form={med.form} size="xs" />
                    {med.badge && (
                      <span className="text-[9px] font-bold px-1 py-0.2 bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                        {med.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-1 pl-1.5 border-l border-indigo-700/50 text-indigo-300 group-hover:text-white shrink-0">
                  {isJustAdded ? (
                    <Check className="w-3.5 h-3.5 text-white animate-bounce" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Modal to Add Custom Drug to Quick Bar */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 max-w-md w-full text-slate-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Add Custom Favorite Drug</h3>
                <p className="text-xs text-slate-400">Save a new medication to your 1-click Quick-Select Bar</p>
              </div>
            </div>

            <form onSubmit={handleAddCustomDrugSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Generic Drug Name *</label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g. Ciprofloxacin"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Brand Name (Egyptian Trade Name)</label>
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Ciprofar / Serviflox"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dosage Form</label>
                  <input
                    type="text"
                    value={newForm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewForm(val);
                      const derived = deriveMedicationDefaults(newMedName, val);
                      setNewDosage(derived.dosage);
                      setNewFrequency(derived.frequency);
                      setNewDuration(derived.duration);
                    }}
                    placeholder="e.g. 500mcg Suppository"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Specialty</label>
                  <select
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                  >
                    <option value="gp">General Practice</option>
                    <option value="cardio">Cardiology</option>
                    <option value="peds">Pediatrics</option>
                    <option value="gastro">Gastroenterology</option>
                    <option value="derm">Dermatology</option>
                    <option value="pulmo">Pulmonology</option>
                    <option value="neuro">Neurology</option>
                    <option value="endo">Endocrinology</option>
                    <option value="ortho">Orthopedics</option>
                    <option value="ent">ENT & Eye</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Dose</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm"
                >
                  Save & Pin to Quick-Bar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

