import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Scale, 
  Activity, 
  Droplets, 
  Check, 
  AlertCircle,
  Sparkles,
  Zap,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { parseStructuredStrength } from '@/data/medications';

export interface CalculatorApplyData {
  concentration: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface WeightCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientWeight?: string;
  patientAge?: number | string;
  initialConcentration?: string;
  medicationName: string;
  form?: string;
  onApply: (
    data: CalculatorApplyData | string,
    instructions?: string,
    concentration?: string,
    frequency?: string,
    duration?: string
  ) => void;
}

// Pediatric Reference Presets for common syrups & drops
interface PediatricPreset {
  keywords: string[];
  name: string;
  category: 'Antipyretics & Analgesics' | 'Antibiotics & Antimicrobials' | 'Antihistamines & Allergy' | 'Gastrointestinal & Anti-emetics' | 'Respiratory & Steroids' | 'Central Nervous System & Anticonvulsants' | 'Cardiovascular & Hematology';
  doseValue: number;
  mode: 'mg/kg/dose' | 'mg/kg/day';
  frequency: string;
  concentrationValue: string;
  concentrationVolume: string;
  maxSingleDoseMg: number;
  note: string;
  duration?: string;
}

const PEDIATRIC_PRESETS: PediatricPreset[] = [
  // --- Antipyretics & Analgesics ---
  {
    keywords: ['paracetamol', 'acetaminophen', 'panadol', 'cetamol', 'calpol', 'fevadol', 'tempra', 'cetal', 'adol'],
    name: 'Paracetamol / Acetaminophen',
    category: 'Antipyretics & Analgesics',
    doseValue: 15,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '120',
    concentrationVolume: '5',
    maxSingleDoseMg: 1000,
    note: '10–15 mg/kg/dose q4–6h PRN (Max 60 mg/kg/day)'
  },
  {
    keywords: ['ibuprofen', 'brufen', 'advil', 'motrin', 'profen'],
    name: 'Ibuprofen',
    category: 'Antipyretics & Analgesics',
    doseValue: 10,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '100',
    concentrationVolume: '5',
    maxSingleDoseMg: 400,
    note: '5–10 mg/kg/dose q6–8h with food (Max 40 mg/kg/day)'
  },
  {
    keywords: ['diclofenac', 'catafly', 'voltaren', 'diclac', 'epifenac'],
    name: 'Diclofenac Sodium (>1 year)',
    category: 'Antipyretics & Analgesics',
    doseValue: 1,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '2',
    concentrationVolume: '1',
    maxSingleDoseMg: 50,
    note: '0.5–1 mg/kg/dose q8–12h (Max 3 mg/kg/day)'
  },
  {
    keywords: ['ketoprofen', 'profid', 'ketofan'],
    name: 'Ketoprofen',
    category: 'Antipyretics & Analgesics',
    doseValue: 1,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '12.5',
    concentrationVolume: '5',
    maxSingleDoseMg: 50,
    note: '0.5–1 mg/kg/dose q8h'
  },
  {
    keywords: ['mefenamic', 'ponstan'],
    name: 'Mefenamic Acid',
    category: 'Antipyretics & Analgesics',
    doseValue: 6.5,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '50',
    concentrationVolume: '5',
    maxSingleDoseMg: 250,
    note: '6.5 mg/kg/dose q8h'
  },
  {
    keywords: ['naproxen', 'prosyn', 'naprosyn'],
    name: 'Naproxen',
    category: 'Antipyretics & Analgesics',
    doseValue: 5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '5–7.5 mg/kg/dose q12h'
  },

  // --- Antibiotics & Antimicrobials ---
  {
    keywords: ['amoxicillin', 'amoxil', 'amox', 'e-mox', 'emox'],
    name: 'Amoxicillin (Standard Dose)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 45,
    mode: 'mg/kg/day',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 1000,
    note: '45 mg/kg/day divided BID (High dose otitis: 90 mg/kg/day)'
  },
  {
    keywords: ['amoxicillin high dose', 'amox high'],
    name: 'Amoxicillin (High Dose - Otitis)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 90,
    mode: 'mg/kg/day',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 1500,
    note: '80–90 mg/kg/day divided BID for resistant Otitis Media'
  },
  {
    keywords: ['augmentin', 'clavulanate', 'curam', 'hibiotic', 'megamox', 'klavox', 'klavocin', 'amoclan'],
    name: 'Amoxicillin / Clavulanate (Augmentin)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 45,
    mode: 'mg/kg/day',
    frequency: 'BID',
    concentrationValue: '312',
    concentrationVolume: '5',
    maxSingleDoseMg: 1000,
    note: '25–45 mg/kg/day (up to 90 mg/kg/day) divided BID'
  },
  {
    keywords: ['azithromycin', 'zithromax', 'zithro', 'zmax', 'azimycin', 'neozithro'],
    name: 'Azithromycin',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 10,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '200',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '10 mg/kg OD on day 1, then 5 mg/kg OD on days 2–5'
  },
  {
    keywords: ['cefixime', 'suprax', 'magnacef', 'winex'],
    name: 'Cefixime (Suprax)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 8,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '100',
    concentrationVolume: '5',
    maxSingleDoseMg: 400,
    note: '8 mg/kg/day once daily or divided BID'
  },
  {
    keywords: ['cephalexin', 'keflex', 'cefalexin', 'ceporin'],
    name: 'Cephalexin (Keflex)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 25,
    mode: 'mg/kg/day',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 1000,
    note: '25–50 mg/kg/day divided BID or QID'
  },
  {
    keywords: ['cefdinir', 'omnicef', 'dinir'],
    name: 'Cefdinir (Omnicef)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 14,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 600,
    note: '14 mg/kg/day once daily or divided BID'
  },
  {
    keywords: ['cefpodoxime', 'cepodem', 'orelox'],
    name: 'Cefpodoxime',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 10,
    mode: 'mg/kg/day',
    frequency: 'BID',
    concentrationValue: '100',
    concentrationVolume: '5',
    maxSingleDoseMg: 400,
    note: '10 mg/kg/day divided BID q12h'
  },
  {
    keywords: ['cefprozil', 'cefzil'],
    name: 'Cefprozil',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 15,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '15 mg/kg/dose q12h (30 mg/kg/day total)'
  },
  {
    keywords: ['cefuroxime', 'zinnat', 'zoref'],
    name: 'Cefuroxime Axetil (Zinnat)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 15,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '10–15 mg/kg/dose q12h (30 mg/kg/day max)'
  },
  {
    keywords: ['ceftriaxone', 'rocephin', 'ceftriax'],
    name: 'Ceftriaxone (IM/IV)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 50,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '500',
    concentrationVolume: '2',
    maxSingleDoseMg: 2000,
    note: '50–75 mg/kg/day (Meningitis: 100 mg/kg/day)'
  },
  {
    keywords: ['cefotaxime', 'claforan'],
    name: 'Cefotaxime (IM/IV)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 50,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '500',
    concentrationVolume: '2',
    maxSingleDoseMg: 2000,
    note: '50 mg/kg/dose q6–8h (100–200 mg/kg/day)'
  },
  {
    keywords: ['clarithromycin', 'klacid', 'claritt'],
    name: 'Clarithromycin (Klacid)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 7.5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '7.5 mg/kg/dose q12h (15 mg/kg/day)'
  },
  {
    keywords: ['erythromycin', 'erythrocin'],
    name: 'Erythromycin',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 10,
    mode: 'mg/kg/dose',
    frequency: 'QID',
    concentrationValue: '200',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '30–50 mg/kg/day divided QID'
  },
  {
    keywords: ['clindamycin', 'dalacin', 'clinda'],
    name: 'Clindamycin (Dalacin)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 6,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '75',
    concentrationVolume: '5',
    maxSingleDoseMg: 450,
    note: '8–25 mg/kg/day divided TID or QID'
  },
  {
    keywords: ['metronidazole', 'flagyl', 'dumazole'],
    name: 'Metronidazole (Flagyl)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 7.5,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '7.5 mg/kg/dose q8h (22.5 mg/kg/day)'
  },
  {
    keywords: ['cotrimoxazole', 'bactrim', 'septrin', 'sutrim', 'sulfamethoxazole', 'trimethoprim'],
    name: 'Co-Trimoxazole / Bactrim',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 4,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '200',
    concentrationVolume: '5',
    maxSingleDoseMg: 160,
    note: 'Based on TMP component: 4 mg/kg TMP per dose q12h'
  },
  {
    keywords: ['vancomycin', 'vancocin'],
    name: 'Vancomycin (IV)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 15,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '500',
    concentrationVolume: '10',
    maxSingleDoseMg: 1000,
    note: '15 mg/kg/dose q6–8h IV infusion'
  },
  {
    keywords: ['fluconazole', 'diflucan', 'flucoral'],
    name: 'Fluconazole',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 6,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '50',
    concentrationVolume: '5',
    maxSingleDoseMg: 400,
    note: '6 mg/kg/day loading dose, then 3–6 mg/kg/day OD'
  },
  {
    keywords: ['acyclovir', 'zovirax', 'lovir'],
    name: 'Acyclovir (Zovirax)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 20,
    mode: 'mg/kg/dose',
    frequency: 'QID',
    concentrationValue: '200',
    concentrationVolume: '5',
    maxSingleDoseMg: 800,
    note: '20 mg/kg/dose QID for varicella/herpes'
  },
  {
    keywords: ['nystatin', 'mycostatin', 'fungistatin'],
    name: 'Nystatin Oral Drops',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 1,
    mode: 'mg/kg/dose',
    frequency: 'QID',
    concentrationValue: '100000',
    concentrationVolume: '1',
    maxSingleDoseMg: 500000,
    note: '100,000 units (1 ml) QID after feeding for oral thrush'
  },
  {
    keywords: ['gentamicin', 'garamycin'],
    name: 'Gentamicin (IM/IV)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 5,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '80',
    concentrationVolume: '2',
    maxSingleDoseMg: 240,
    note: '5–7.5 mg/kg once daily IV/IM'
  },
  {
    keywords: ['amikacin', 'amikin'],
    name: 'Amikacin (IM/IV)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 15,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '250',
    concentrationVolume: '2',
    maxSingleDoseMg: 1000,
    note: '15 mg/kg once daily IV/IM'
  },
  {
    keywords: ['ciprofloxacin', 'cipro', 'ciprobay'],
    name: 'Ciprofloxacin',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 15,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '10–15 mg/kg/dose q12h'
  },
  {
    keywords: ['nitrofurantoin', 'uvamin', 'macrodantin'],
    name: 'Nitrofurantoin',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 1.5,
    mode: 'mg/kg/dose',
    frequency: 'QID',
    concentrationValue: '25',
    concentrationVolume: '5',
    maxSingleDoseMg: 100,
    note: '1.25–1.75 mg/kg/dose q6h with food'
  },
  {
    keywords: ['nitazoxanide', 'nanazoxid', 'cryptaz'],
    name: 'Nitazoxanide (Nanazoxid)',
    category: 'Antibiotics & Antimicrobials',
    doseValue: 10,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '100',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '100mg BID (1–3 yrs), 200mg BID (4–11 yrs) (~10 mg/kg/dose)'
  },

  // --- Antihistamines & Allergy ---
  {
    keywords: ['cetirizine', 'zyrtec', 'zirtek', 'finistil', 'fenistil', 'levocetirizine', 'histazine'],
    name: 'Cetirizine / Antihistamine Drops',
    category: 'Antihistamines & Allergy',
    doseValue: 0.25,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.25 mg/kg/day once daily at bedtime'
  },
  {
    keywords: ['chlorpheniramine', 'histop', 'piriton', 'allerfin'],
    name: 'Chlorpheniramine (Piriton)',
    category: 'Antihistamines & Allergy',
    doseValue: 0.1,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '2',
    concentrationVolume: '5',
    maxSingleDoseMg: 4,
    note: '0.1 mg/kg/dose q6–8h PRN'
  },
  {
    keywords: ['loratadine', 'claritin', 'mosedin'],
    name: 'Loratadine (Claritin)',
    category: 'Antihistamines & Allergy',
    doseValue: 0.2,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.2 mg/kg/day once daily (Max 10 mg)'
  },
  {
    keywords: ['desloratadine', 'aerius', 'delarex'],
    name: 'Desloratadine (Aerius)',
    category: 'Antihistamines & Allergy',
    doseValue: 0.1,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '2.5',
    concentrationVolume: '5',
    maxSingleDoseMg: 5,
    note: '1.25 mg OD (1–5 yrs), 2.5 mg OD (6–11 yrs)'
  },
  {
    keywords: ['fexofenadine', 'telfast', 'fexo'],
    name: 'Fexofenadine (Telfast)',
    category: 'Antihistamines & Allergy',
    doseValue: 2.5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '30',
    concentrationVolume: '5',
    maxSingleDoseMg: 60,
    note: '30 mg BID (2–11 yrs)'
  },
  {
    keywords: ['hydroxyzine', 'atarax'],
    name: 'Hydroxyzine (Atarax)',
    category: 'Antihistamines & Allergy',
    doseValue: 0.5,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '10',
    concentrationVolume: '5',
    maxSingleDoseMg: 25,
    note: '0.5 mg/kg/dose q6–8h PRN for pruritus'
  },
  {
    keywords: ['diphenhydramine', 'benadryl'],
    name: 'Diphenhydramine',
    category: 'Antihistamines & Allergy',
    doseValue: 1.25,
    mode: 'mg/kg/dose',
    frequency: 'QID',
    concentrationValue: '12.5',
    concentrationVolume: '5',
    maxSingleDoseMg: 50,
    note: '1.25 mg/kg/dose q6h PRN'
  },
  {
    keywords: ['ketotifen', 'zaditen'],
    name: 'Ketotifen (Zaditen)',
    category: 'Antihistamines & Allergy',
    doseValue: 0.05,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '1',
    concentrationVolume: '5',
    maxSingleDoseMg: 1,
    note: '0.05 mg/kg/dose BID with meals'
  },

  // --- Gastrointestinal & Anti-emetics ---
  {
    keywords: ['ondansetron', 'zofran', 'dasetron'],
    name: 'Ondansetron (Zofran)',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 0.15,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '4',
    concentrationVolume: '5',
    maxSingleDoseMg: 8,
    note: '0.15 mg/kg/dose q8h for nausea/vomiting'
  },
  {
    keywords: ['domperidone', 'motilium', 'gastromotil'],
    name: 'Domperidone (Motilium)',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 0.25,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.25–0.5 mg/kg/dose q8h 15 min before meals'
  },
  {
    keywords: ['metoclopramide', 'primperan', 'plasil'],
    name: 'Metoclopramide',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 0.1,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.1–0.15 mg/kg/dose q8h'
  },
  {
    keywords: ['zinc', 'zincat', 'zincemia'],
    name: 'Zinc Sulfate',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 10,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '10',
    concentrationVolume: '5',
    maxSingleDoseMg: 20,
    note: '10 mg OD (<6 months), 20 mg OD (>6 months) for diarrhea'
  },
  {
    keywords: ['lactulose', 'duphalac', 'sedalac'],
    name: 'Lactulose',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 0.5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '3.3',
    concentrationVolume: '5',
    maxSingleDoseMg: 15,
    note: '0.5–1 ml/kg/day divided BID for constipation'
  },
  {
    keywords: ['simethicone', 'disflatyl', 'dentinox', 'baby calm'],
    name: 'Simethicone Infant Drops',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 20,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '40',
    concentrationVolume: '1',
    maxSingleDoseMg: 40,
    note: '20–40 mg (0.5–1 ml) after feeds for colic'
  },
  {
    keywords: ['racecadotril', 'hydrasec'],
    name: 'Racecadotril (Hydrasec)',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 1.5,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '10',
    concentrationVolume: '1',
    maxSingleDoseMg: 30,
    note: '1.5 mg/kg/dose q8h for acute watery diarrhea'
  },
  {
    keywords: ['hyoscine', 'buscopan', 'spasmo'],
    name: 'Hyoscine Butylbromide (Buscopan)',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 0.3,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.3 mg/kg/dose q8h for abdominal cramps'
  },
  {
    keywords: ['omeprazole', 'losec', 'gastrazole'],
    name: 'Omeprazole',
    category: 'Gastrointestinal & Anti-emetics',
    doseValue: 1,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '10',
    concentrationVolume: '5',
    maxSingleDoseMg: 20,
    note: '0.7–1 mg/kg/day once daily before breakfast'
  },

  // --- Respiratory & Steroids ---
  {
    keywords: ['salbutamol', 'albuterol', 'ventolin', 'farcolin'],
    name: 'Salbutamol (Ventolin)',
    category: 'Respiratory & Steroids',
    doseValue: 0.1,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '2',
    concentrationVolume: '5',
    maxSingleDoseMg: 4,
    note: '0.1–0.15 mg/kg/dose q8h'
  },
  {
    keywords: ['prednisolone', 'hostacortin', 'xilone', 'apedone', 'prednisone'],
    name: 'Prednisolone Syrup',
    category: 'Respiratory & Steroids',
    doseValue: 1,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '15',
    concentrationVolume: '5',
    maxSingleDoseMg: 60,
    note: '1–2 mg/kg/day for acute asthma burst (3–5 days)'
  },
  {
    keywords: ['dexamethasone', 'oradexon', 'fortecortin'],
    name: 'Dexamethasone',
    category: 'Respiratory & Steroids',
    doseValue: 0.15,
    mode: 'mg/kg/dose',
    frequency: 'OD',
    concentrationValue: '0.5',
    concentrationVolume: '5',
    maxSingleDoseMg: 10,
    note: '0.15–0.6 mg/kg single dose for croup'
  },
  {
    keywords: ['hydrocortisone', 'solu-cortef'],
    name: 'Hydrocortisone (IV/IM)',
    category: 'Respiratory & Steroids',
    doseValue: 2,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '100',
    concentrationVolume: '2',
    maxSingleDoseMg: 100,
    note: '2–4 mg/kg/dose q6–8h for acute shock or severe asthma'
  },
  {
    keywords: ['montelukast', 'singulair', 'sedonair'],
    name: 'Montelukast (Singulair)',
    category: 'Respiratory & Steroids',
    doseValue: 4,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '4',
    concentrationVolume: '1',
    maxSingleDoseMg: 10,
    note: '4 mg OD (6m–5y), 5 mg OD (6–14y) at bedtime'
  },
  {
    keywords: ['carbocisteine', 'mucolyte', 'rhinathiol'],
    name: 'Carbocisteine Mucolytic',
    category: 'Respiratory & Steroids',
    doseValue: 5,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '125',
    concentrationVolume: '5',
    maxSingleDoseMg: 250,
    note: '5 mg/kg/dose q8h'
  },
  {
    keywords: ['ambroxol', 'mucosolvan', 'mucoangin'],
    name: 'Ambroxol (Mucosolvan)',
    category: 'Respiratory & Steroids',
    doseValue: 1.25,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '15',
    concentrationVolume: '5',
    maxSingleDoseMg: 30,
    note: '1.25 mg/kg/dose q12h'
  },

  // --- Central Nervous System & Anticonvulsants ---
  {
    keywords: ['phenobarbital', 'luminal', 'sominal'],
    name: 'Phenobarbital',
    category: 'Central Nervous System & Anticonvulsants',
    doseValue: 2.5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '15',
    concentrationVolume: '5',
    maxSingleDoseMg: 100,
    note: '2.5–5 mg/kg/day divided BID maintenance'
  },
  {
    keywords: ['valproic', 'valproate', 'depakene', 'depakine'],
    name: 'Valproic Acid / Depakene',
    category: 'Central Nervous System & Anticonvulsants',
    doseValue: 10,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '250',
    concentrationVolume: '5',
    maxSingleDoseMg: 500,
    note: '10–15 mg/kg/dose q12h (Max 60 mg/kg/day)'
  },
  {
    keywords: ['levetiracetam', 'keppra', 'tiratam'],
    name: 'Levetiracetam (Keppra)',
    category: 'Central Nervous System & Anticonvulsants',
    doseValue: 10,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '100',
    concentrationVolume: '1',
    maxSingleDoseMg: 1500,
    note: '10 mg/kg/dose q12h (up to 30 mg/kg/dose BID)'
  },
  {
    keywords: ['carbamazepine', 'tegretol', 'mazetol'],
    name: 'Carbamazepine (Tegretol)',
    category: 'Central Nervous System & Anticonvulsants',
    doseValue: 5,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '100',
    concentrationVolume: '5',
    maxSingleDoseMg: 400,
    note: '5–10 mg/kg/dose q12h'
  },

  // --- Cardiovascular & Hematology ---
  {
    keywords: ['ferrous', 'iron', 'haemopex', 'ferroglobe', 'ferromix'],
    name: 'Ferrous Sulfate / Iron Drops',
    category: 'Cardiovascular & Hematology',
    doseValue: 3,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '25',
    concentrationVolume: '1',
    maxSingleDoseMg: 100,
    note: '3–6 mg/kg/day elemental iron once daily between meals'
  },
  {
    keywords: ['furosemide', 'lasix', 'diusemide'],
    name: 'Furosemide (Lasix)',
    category: 'Cardiovascular & Hematology',
    doseValue: 1,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '10',
    concentrationVolume: '1',
    maxSingleDoseMg: 40,
    note: '1–2 mg/kg/dose q12h'
  },
  {
    keywords: ['spironolactone', 'aldactone'],
    name: 'Spironolactone (Aldactone)',
    category: 'Cardiovascular & Hematology',
    doseValue: 1,
    mode: 'mg/kg/dose',
    frequency: 'BID',
    concentrationValue: '25',
    concentrationVolume: '5',
    maxSingleDoseMg: 50,
    note: '1–3 mg/kg/day divided BID'
  },
  {
    keywords: ['captopril', 'capoten'],
    name: 'Captopril',
    category: 'Cardiovascular & Hematology',
    doseValue: 0.15,
    mode: 'mg/kg/dose',
    frequency: 'TID',
    concentrationValue: '25',
    concentrationVolume: '5',
    maxSingleDoseMg: 25,
    note: '0.15–0.3 mg/kg/dose q8h'
  },
  {
    keywords: ['vitamin d', 'vi-de3', 'sterogyl', 'vidrop'],
    name: 'Vitamin D3 Drops',
    category: 'Cardiovascular & Hematology',
    doseValue: 400,
    mode: 'mg/kg/day',
    frequency: 'OD',
    concentrationValue: '400',
    concentrationVolume: '1',
    maxSingleDoseMg: 1000,
    note: '400 IU daily routine supplementation'
  }
];

export const WeightCalculatorModal: React.FC<WeightCalculatorModalProps> = ({
  isOpen,
  onClose,
  patientWeight,
  patientAge,
  initialConcentration,
  medicationName,
  form = "",
  onApply
}) => {
  const [calcMode, setCalcMode] = useState<'auto' | 'manual'>('auto');
  const [weight, setWeight] = useState(patientWeight || "");
  const [doseValue, setDoseValue] = useState("10");
  const [dosingMode, setDosingMode] = useState<'mg/kg/dose' | 'mg/kg/day'>('mg/kg/dose');
  const [frequency, setFrequency] = useState("TID");
  const [concentrationValue, setConcentrationValue] = useState("");
  const [concentrationVolume, setConcentrationVolume] = useState("5");
  const [dropsPerMl, setDropsPerMl] = useState("20");
  const [selectedPreset, setSelectedPreset] = useState<PediatricPreset | null>(null);

  // Sync weight from props when modal opens or patient weight changes & auto-select guideline preset in automatic mode
  useEffect(() => {
    if (isOpen) {
      if (patientWeight) {
        setWeight(patientWeight);
      }
      
      if (calcMode === 'auto') {
        // Automatic Guideline Preset Selection based on Medication Name and Form
        const searchStr = `${medicationName || ""} ${form || ""}`.toLowerCase();
        let matched = PEDIATRIC_PRESETS.find(p => 
          p.keywords.some(k => searchStr.includes(k))
        );

        // Dynamic fallback pattern matching (e.g., if medication name includes "15mg/kg" or "20 mg/kg/day")
        if (!matched) {
          const mgKgMatch = searchStr.match(/(\d+(?:\.\d+)?)\s*mg\s*\/\s*kg(?:\s*\/\s*(dose|day))?/i);
          if (mgKgMatch) {
            const dVal = parseFloat(mgKgMatch[1]);
            const mode = (mgKgMatch[2] && mgKgMatch[2].toLowerCase() === 'day') ? 'mg/kg/day' : 'mg/kg/dose';
            
            let cVal = "100";
            let cVol = "5";
            if (initialConcentration) {
              const parsedInit = parseStructuredStrength(initialConcentration, form);
              if (parsedInit.strength_value !== null) {
                cVal = parsedInit.strength_value.toString();
                cVol = (parsedInit.concentration_volume || 5).toString();
              }
            }

            matched = {
              keywords: [medicationName.toLowerCase()],
              name: medicationName || 'Dynamic Guideline',
              category: 'Antibiotics & Antimicrobials',
              doseValue: dVal,
              mode: mode,
              frequency: mode === 'mg/kg/day' ? 'OD' : 'TID',
              concentrationValue: cVal,
              concentrationVolume: cVol,
              maxSingleDoseMg: dVal * 50,
              note: `Auto-extracted guideline: ${dVal} ${mode}`
            };
          }
        }

        if (matched) {
          setSelectedPreset(matched);
          setDoseValue(matched.doseValue.toString());
          setDosingMode(matched.mode);
          setFrequency(matched.frequency);
          
          // Parse initial concentration using structured strength parser
          if (initialConcentration) {
            const parsedInit = parseStructuredStrength(initialConcentration, form);
            if (parsedInit.strength_value !== null) {
              setConcentrationValue(parsedInit.strength_value.toString());
              setConcentrationVolume((parsedInit.concentration_volume || 5).toString());
            } else {
              setConcentrationValue(matched.concentrationValue);
              setConcentrationVolume(matched.concentrationVolume);
            }
          } else {
            setConcentrationValue(matched.concentrationValue);
            setConcentrationVolume(matched.concentrationVolume);
          }
        } else {
          setSelectedPreset(null);
          if (initialConcentration) {
            const parsedInit = parseStructuredStrength(initialConcentration, form);
            if (parsedInit.strength_value !== null) {
              setConcentrationValue(parsedInit.strength_value.toString());
              setConcentrationVolume((parsedInit.concentration_volume || 5).toString());
            }
          }
        }
      }
    }
  }, [isOpen, calcMode, patientWeight, medicationName, form, initialConcentration]);

  // Calculation Results
  const [result, setResult] = useState<{
    singleDoseMg: number;
    totalDailyMg: number;
    volumeMl: number;
    drops: number;
    units: number;
    isCapped: boolean;
    maxSingleMg: number;
    displayText: string;
    subText: string;
  } | null>(null);

  useEffect(() => {
    const w = parseFloat(weight);
    const d = parseFloat(doseValue);

    if (!isNaN(w) && w > 0 && !isNaN(d) && d > 0) {
      let freqFactor = 1;
      if (frequency === 'BID') freqFactor = 2;
      else if (frequency === 'TID') freqFactor = 3;
      else if (frequency === 'QID') freqFactor = 4;
      else if (frequency === 'OD') freqFactor = 1;
      else if (frequency === 'PRN') freqFactor = 3;

      let singleDoseMg = 0;
      let totalDailyMg = 0;

      if (dosingMode === 'mg/kg/day') {
        totalDailyMg = w * d;
        singleDoseMg = totalDailyMg / freqFactor;
      } else {
        singleDoseMg = w * d;
        totalDailyMg = singleDoseMg * freqFactor;
      }

      // Check max dose capping if preset exists
      let isCapped = false;
      const maxSingleMg = selectedPreset?.maxSingleDoseMg || 1000;
      if (singleDoseMg > maxSingleMg) {
        isCapped = true;
      }

      const val = parseFloat(concentrationValue);
      const vol = parseFloat(concentrationVolume) || 1;
      const dPerMl = parseFloat(dropsPerMl) || 20;

      const isDropForm = /drop|gtt|oral drop|pediatric drop/i.test(form) || /drop|gtt/i.test(medicationName);
      const isLiquid = /syrup|suspension|liquid|solution|elixir|drop|gtt/i.test(form) || isDropForm;
      const isSolid = /tab|cap|tablet|capsule/i.test(form);

      let volumeMl = 0;
      let calculatedDrops = 0;
      let units = 0;
      let displayText = `${singleDoseMg.toFixed(1)} mg per dose`;

      if (!isNaN(val) && val > 0) {
        if (isLiquid) {
          volumeMl = (singleDoseMg * vol) / val;
          calculatedDrops = Math.round(volumeMl * dPerMl);

          if (isDropForm) {
            displayText = `${volumeMl.toFixed(2)} ml (${calculatedDrops} drops) per dose`;
          } else {
            displayText = `${volumeMl.toFixed(1)} ml (${singleDoseMg.toFixed(1)} mg) per dose`;
          }
        } else if (isSolid) {
          units = singleDoseMg / val;
          const unitLabel = form.toLowerCase().includes('cap') ? 'capsule' : 'tablet';
          displayText = `${singleDoseMg.toFixed(1)} mg (${units % 1 === 0 ? units : units.toFixed(1)} ${unitLabel}) per dose`;
        }
      }

      const subText = dosingMode === 'mg/kg/day'
        ? `${w} kg × ${d} mg/kg/day = ${totalDailyMg.toFixed(1)} mg/day (${singleDoseMg.toFixed(1)} mg/dose ${frequency})`
        : `${w} kg × ${d} mg/kg/dose = ${singleDoseMg.toFixed(1)} mg/dose (${totalDailyMg.toFixed(1)} mg/day total)`;

      setResult({
        singleDoseMg,
        totalDailyMg,
        volumeMl,
        drops: calculatedDrops,
        units,
        isCapped,
        maxSingleMg,
        displayText,
        subText
      });
    } else {
      setResult(null);
    }
  }, [weight, doseValue, dosingMode, frequency, concentrationValue, concentrationVolume, dropsPerMl, form, medicationName, selectedPreset]);

  if (!isOpen) return null;

  const isDropForm = /drop|gtt|oral drop/i.test(form) || /drop|gtt/i.test(medicationName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                <Calculator className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg leading-tight">Pediatric Weight-Based Calculator</h3>
                  {patientAge !== undefined && patientAge !== "" && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full">
                      Age: {patientAge} y/o
                    </span>
                  )}
                </div>
                <p className="text-indigo-100 text-xs font-medium mt-0.5">{medicationName} {form ? `(${form})` : ''}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Patient Vitals Weight Alert / Bar */}
            <div className="flex items-center justify-between p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-bold text-indigo-900">Child's Weight from Vitals: </span>
                  <span className="text-xs font-black text-indigo-700">
                    {patientWeight ? `${patientWeight} kg` : 'Not recorded in vitals'}
                  </span>
                </div>
              </div>
              {patientWeight && weight !== patientWeight && (
                <button
                  onClick={() => setWeight(patientWeight)}
                  className="px-2.5 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Use Vitals Weight
                </button>
              )}
            </div>

            {/* Calculation Method Mode Switcher: Automatic (Guideline-Based) vs Manual (Custom) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-indigo-600" />
                  Calculation Method Mode
                </label>
                {calcMode === 'auto' && selectedPreset && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Automatic Guideline Applied
                  </span>
                )}
                {calcMode === 'manual' && (
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Manual Custom Mode
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCalcMode('auto')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    calcMode === 'auto'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  ⚡ Automatic (Guideline-Based)
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('manual')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    calcMode === 'manual'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  ✏️ Manual (Custom Input)
                </button>
              </div>
            </div>

            {/* Quick Clinical Presets selector */}
            {(() => {
              const isCustomized = selectedPreset && (
                parseFloat(doseValue) !== selectedPreset.doseValue ||
                dosingMode !== selectedPreset.mode ||
                frequency !== selectedPreset.frequency ||
                concentrationValue !== selectedPreset.concentrationValue ||
                concentrationVolume !== selectedPreset.concentrationVolume
              );

              const categories = [
                'Antipyretics & Analgesics',
                'Antibiotics & Antimicrobials',
                'Antihistamines & Allergy',
                'Gastrointestinal & Anti-emetics',
                'Respiratory & Steroids',
                'Central Nervous System & Anticonvulsants',
                'Cardiovascular & Hematology'
              ] as const;

              return (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      {calcMode === 'auto' ? 'Matched Drug Dosing Guideline' : 'Reference Drug Dosing Guideline'}
                    </label>
                    <div className="flex items-center gap-2">
                      {selectedPreset && !isCustomized && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-600" /> {selectedPreset.doseValue} {selectedPreset.mode} ({selectedPreset.frequency})
                        </span>
                      )}
                      {selectedPreset && isCustomized && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Customized Dose
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setDoseValue(selectedPreset.doseValue.toString());
                              setDosingMode(selectedPreset.mode);
                              setFrequency(selectedPreset.frequency);
                              setConcentrationValue(selectedPreset.concentrationValue);
                              setConcentrationVolume(selectedPreset.concentrationVolume);
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <select
                    value={selectedPreset?.name || ""}
                    onChange={(e) => {
                      const pName = e.target.value;
                      const found = PEDIATRIC_PRESETS.find(p => p.name === pName);
                      if (found) {
                        setSelectedPreset(found);
                        setDoseValue(found.doseValue.toString());
                        setDosingMode(found.mode);
                        setFrequency(found.frequency);
                        setConcentrationValue(found.concentrationValue);
                        setConcentrationVolume(found.concentrationVolume);
                      } else {
                        setSelectedPreset(null);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-2xs cursor-pointer"
                  >
                    <option value="">
                      {calcMode === 'auto' ? '── Select / Override Drug Guideline ──' : '✏️ Custom / Manual Dose Input'}
                    </option>
                    {categories.map((cat) => {
                      const presetsInCat = PEDIATRIC_PRESETS.filter(p => p.category === cat);
                      if (presetsInCat.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`── ${cat} ──`}>
                          {presetsInCat.map((p, idx) => (
                            <option key={idx} value={p.name}>
                              {p.name} — {p.doseValue} {p.mode} ({p.frequency})
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>

                  {selectedPreset && (
                    <div className="p-3 bg-indigo-50/80 border border-indigo-100 rounded-xl flex items-start gap-2.5 text-xs text-indigo-950 shadow-2xs">
                      <Activity className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-indigo-900">{selectedPreset.name} Dosing Reference:</p>
                        <p className="text-slate-700">{selectedPreset.note}</p>
                      </div>
                    </div>
                  )}

                  {calcMode === 'auto' && !selectedPreset && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">No exact guideline preset auto-matched for "{medicationName}". </span>
                        <span>Select a guideline preset from the dropdown above or switch to Manual Mode to enter custom parameters.</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Dosing Mode Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Calculation Standard</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDosingMode('mg/kg/dose')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    dosingMode === 'mg/kg/dose'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  mg / kg / dose
                </button>
                <button
                  type="button"
                  onClick={() => setDosingMode('mg/kg/day')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    dosingMode === 'mg/kg/day'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  mg / kg / day (Total Daily)
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Weight (kg)</label>
                <div className="relative">
                  <input 
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="kg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  {dosingMode === 'mg/kg/day' ? 'Dose (mg/kg/day)' : 'Dose (mg/kg/dose)'}
                </label>
                <input 
                  type="number"
                  step="0.5"
                  value={doseValue}
                  onChange={(e) => setDoseValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="OD">OD (1x daily)</option>
                  <option value="BID">BID (2x daily)</option>
                  <option value="TID">TID (3x daily)</option>
                  <option value="QID">QID (4x daily)</option>
                  <option value="PRN">PRN (As needed)</option>
                </select>
              </div>
            </div>

            {/* Concentration & Liquid / Drop Parameters */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700 uppercase">Syrup / Drop Concentration</span>
                </div>
                {isDropForm && (
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Oral Drops Detected
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Amount (mg)</label>
                  <input 
                    type="number"
                    value={concentrationValue}
                    onChange={(e) => setConcentrationValue(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                    placeholder="e.g. 250"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Per Volume (ml)</label>
                  <input 
                    type="number"
                    value={concentrationVolume}
                    onChange={(e) => setConcentrationVolume(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold bg-white"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              {isDropForm && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-3">
                  <label className="text-xs font-medium text-slate-600">Drops per 1 mL:</label>
                  <input 
                    type="number"
                    value={dropsPerMl}
                    onChange={(e) => setDropsPerMl(e.target.value)}
                    className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-xs font-bold text-center bg-white"
                    placeholder="20"
                  />
                </div>
              )}
            </div>

            {/* Calculation Result Panel */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-2xl text-center overflow-hidden border ${
                    result.isCapped 
                      ? 'bg-amber-50 border-amber-200 text-amber-900' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      result.isCapped ? 'text-amber-700' : 'text-emerald-700'
                    }`}>
                      Calculated Single Dose ({frequency})
                    </span>
                    {result.isCapped && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Exceeds adult max cap ({result.maxSingleMg}mg)
                      </span>
                    )}
                  </div>

                  <p className={`text-2xl font-black ${result.isCapped ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {result.displayText}
                  </p>
                  
                  <p className="text-xs mt-1.5 font-medium text-slate-600">
                    {result.subText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-slate-600 font-bold text-sm hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              disabled={!result}
              onClick={() => {
                if (result) {
                  let dosageStr = "";
                  if (result.volumeMl > 0) {
                    if (isDropForm) {
                      dosageStr = `${result.volumeMl.toFixed(2)} ml (${result.drops} drops)`;
                    } else {
                      dosageStr = `${result.volumeMl.toFixed(1)} ml`;
                    }
                  } else if (result.units > 0) {
                    const unitLabel = form.toLowerCase().includes('cap') ? 'cap' : 'tab';
                    dosageStr = `${result.units % 1 === 0 ? result.units : result.units.toFixed(1)} ${unitLabel}`;
                  } else {
                    dosageStr = `${result.singleDoseMg.toFixed(1)} mg`;
                  }

                  let concStr = "";
                  if (concentrationValue) {
                    if (concentrationVolume && parseFloat(concentrationVolume) > 0) {
                      concStr = `${concentrationValue}mg/${concentrationVolume}ml`;
                    } else {
                      concStr = `${concentrationValue}mg`;
                    }
                  } else if (initialConcentration) {
                    concStr = initialConcentration;
                  }

                  const durStr = selectedPreset?.duration || "5 - 7 days";
                  const modeNotice = dosingMode === 'mg/kg/day' ? `${doseValue} mg/kg/day` : `${doseValue} mg/kg/dose`;
                  const instructionStr = `Give ${dosageStr} ${frequency}. (Weight: ${weight} kg @ ${modeNotice}).${selectedPreset?.note ? ` Guideline: ${selectedPreset.note}` : ''}`;

                  onApply(
                    {
                      concentration: concStr,
                      dosage: dosageStr,
                      frequency: frequency,
                      duration: durStr,
                      instructions: instructionStr
                    },
                    instructionStr,
                    concStr,
                    frequency,
                    durStr
                  );
                }
              }}
              className="flex-[2] flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-100"
            >
              <Check className="w-4 h-4" />
              Apply to Prescription
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

