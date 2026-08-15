import { ClinicalMedication } from '../types/medication';

export const NEUROLOGY_DATABASE: ClinicalMedication[] = [
  {
    id: 'paracetamol',
    generic_name: 'Paracetamol (Acetaminophen)',
    brand_names: ['Panadol', 'Cetal', 'Abimol', 'Paramol', 'Pyral', 'Tylenol'],
    ATC_code: 'N02BE01',
    RxNorm: '161',
    SNOMED: '387517004',
    DrugBank_ID: 'DB00316',
    Drug_Class: 'Analgesic & Antipyretic',
    Subclass: 'Non-Opioid Analgesic',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: true,
    Prescription: false,

    Pregnancy: {
      trimester1: 'Compatible / Low Risk',
      trimester2: 'Compatible / Low Risk',
      trimester3: 'Compatible / Low Risk',
      recommendation: 'First-line choice for analgesia and antipyresis during pregnancy at lowest effective dose',
      riskLevel: 'Low',
      category: 'Category B'
    },
    Lactation: {
      milkTransfer: 'Excreted in low amounts into human milk',
      infantRisk: 'Low',
      advice: 'Compatible with breastfeeding. Preferred analgesic during lactation.'
    },

    Black_Box_Warning: 'Boxed Warning: Severe Hepatotoxicity. Exceeding 4000 mg/day (4 g/day) or taking multiple acetaminophen-containing products can lead to severe acute liver failure requiring liver transplant or causing death.',
    Storage: 'Store below 30°C.',
    Manufacturer: 'GlaxoSmithKline / EIPICO / CID / Amoun',
    Price: 25,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Mild to Moderate Pain / Headache',
        icd10: 'R51.9',
        dose: '500 - 1000 mg PO',
        frequency: 'q4h - q6h PRN (Max 4000 mg daily)',
        duration: 'Short-term PRN',
        guideline: 'WHO Pain Relief Ladder',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Fever Reduction (Pyrexia)',
        icd10: 'R50.9',
        dose: '500 - 1000 mg PO',
        frequency: 'q4h - q6h PRN',
        duration: '3 - 5 days',
        guideline: 'NICE Fever in Under 5s / Adult Fever Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Pediatric Fever / Pain',
        icd10: 'R50.9',
        dose: '10 - 15 mg/kg PO',
        frequency: 'q4h - q6h PRN (Max 60 mg/kg/day or 2000 mg daily)',
        duration: 'PRN',
        guideline: 'AAP Pediatric Analgesia Guidelines',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Cetal 500mg', company: 'EIPICO', price_egp: 18.0, availability: 'Available', dosage_forms: ['Tablet', 'Syrup', 'Drops', 'Suppository'] },
      { brand_name: 'Panadol Advance 500mg', company: 'GSK Egypt', price_egp: 45.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Abimol 500mg', company: 'Glaxo Egypt', price_egp: 15.0, availability: 'Available', dosage_forms: ['Tablet', 'Syrup'] }
    ],

    monitoring: {
      baseline: ['Liver Function Tests if history of chronic alcoholism or liver disease'],
      during: ['Total daily dose tracking across all OTC cough/cold multi-ingredient medications'],
      frequency: 'PRN or baseline'
    },

    patient_counseling: {
      missedDose: 'Take as needed for pain or fever. Do not exceed recommended interval.',
      storage: 'Room temperature.',
      driving: 'No impairment.',
      alcohol: 'DO NOT combine with heavy alcohol consumption (≥ 3 drinks/day increases severe liver injury risk).',
      food: 'Can be taken with or without food.',
      warningSymptoms: ['Nausea', 'Mild stomach upset'],
      emergencySymptoms: ['Severe upper right abdominal pain', 'Nausea, vomiting, dark urine, yellow eyes (Acetaminophen Overdose Hepatotoxicity)'],
      pregnancyAdvice: 'Safe during pregnancy when taken at recommended doses.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Extend dosing interval in severe renal failure.',
      doseByCrCl: [
        { crclRange: 'CrCl ≥ 50 mL/min', recommendedDose: 'Every 4–6 hours PRN (Max 4000 mg daily)' },
        { crclRange: 'CrCl 10–50 mL/min', recommendedDose: 'Every 6 hours PRN (Max 3000 mg daily)' },
        { crclRange: 'CrCl < 10 mL/min', recommendedDose: 'Every 8 hours PRN (Max 2000 mg daily)' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Max 3000 mg daily',
      childPughB: 'Max 2000 mg daily',
      childPughC: 'Avoid or max 1000–2000 mg daily under strict supervision'
    },

    pediatric_min_age: '2 months (10-15 mg/kg dose)',
    max_daily_dose_mg: 4000,
    side_effects: ['Nausea', 'Rash', 'Hepatotoxicity (at toxic doses > 4g/day)'],
    contraindications: ['Severe Active Hepatic Impairment / Acute Liver Failure', 'Hypersensitivity to Acetaminophen'],
    interactions: [
      { drug: 'Warfarin', severity: 'Moderate', mechanism: 'Chronic paracetamol (> 2g/day for > 3 days) may enhance hypoprothrombinemic response and elevate INR', management: 'Monitor INR if taking high-dose paracetamol regularly.' },
      { drug: 'Alcohol', severity: 'Major', mechanism: 'Induces CYP2E1, converting Paracetamol into toxic NAPQI metabolite leading to hepatotoxicity', management: 'Limit alcohol intake.' }
    ]
  },

  {
    id: 'ibuprofen',
    generic_name: 'Ibuprofen',
    brand_names: ['Brufen', 'Ibugesic', 'Marcofen', 'Profen', 'Advil'],
    ATC_code: 'M01AE01',
    RxNorm: '5640',
    SNOMED: '387207008',
    DrugBank_ID: 'DB01050',
    Drug_Class: 'Nonsteroidal Anti-inflammatory Drug (NSAID)',
    Subclass: 'Propionic Acid Derivative',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: true,
    Prescription: false,

    Pregnancy: {
      trimester1: 'Category C - Risk',
      trimester2: 'Category C - Risk',
      trimester3: 'Category D - CONTRAINDICATED (Premature closure of fetal ductus arteriosus & oligohydramnios)',
      recommendation: 'AVOID IN 3RD TRIMESTER (≥20 WEEKS GESTATION). Use Paracetamol instead.',
      riskLevel: 'Contraindicated',
      category: 'Category D in 3rd trimester'
    },
    Lactation: {
      milkTransfer: 'Excreted in extremely low quantities in breast milk',
      infantRisk: 'Low',
      advice: 'Compatible with breastfeeding. Preferred NSAID for nursing mothers.'
    },

    Black_Box_Warning: 'Boxed Warning: Cardiovascular Risk (Increased risk of serious thrombotic events, MI, and stroke) & Gastrointestinal Risk (Increased risk of serious GI bleeding, ulceration, and perforation).',
    Storage: 'Store below 25°C.',
    Manufacturer: 'Abbott / EIPICO / Kahira',
    Price: 30,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Mild to Moderate Acute Inflammatory Pain / Dysmenorrhea',
        icd10: 'N94.6',
        dose: '400 mg PO',
        frequency: 'q4h - q6h PRN (Max 2400 mg daily)',
        duration: '3 - 5 days',
        guideline: 'ACOG Dysmenorrhea Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Rheumatoid Arthritis / Osteoarthritis',
        icd10: 'M19.90',
        dose: '600 - 800 mg PO',
        frequency: 'TID or QID (every 6-8 hours)',
        duration: 'Chronic / Periodic evaluation',
        guideline: 'ACR Osteoarthritis Management Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Pediatric Fever & Pain',
        icd10: 'R50.9',
        dose: '5 - 10 mg/kg PO',
        frequency: 'q6h - q8h PRN (Max 40 mg/kg/day)',
        duration: '3 - 5 days',
        guideline: 'AAP Guidelines',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Brufen 400mg', company: 'Abbott Egypt', price_egp: 38.0, availability: 'Available', dosage_forms: ['Tablet', 'Syrup'] },
      { brand_name: 'Marcofen 600mg', company: 'Marcyrl', price_egp: 28.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Blood Pressure', 'Renal Function (CrCl/eGFR)', 'CBC / Hemoglobin if ulcer history'],
      during: ['BP recheck', 'Renal function if chronic use > 2 weeks', 'Stool for occult blood if dyspeptic'],
      frequency: 'Every 3-6 months for chronic therapy'
    },

    patient_counseling: {
      missedDose: 'Take as needed with food.',
      storage: 'Room temperature.',
      driving: 'No restriction.',
      alcohol: 'Avoid alcohol as it multiplies stomach bleeding risk.',
      food: 'ALWAYS take WITH FOOD or MILK to protect stomach lining.',
      warningSymptoms: ['Heartburn', 'Mild stomach upset'],
      emergencySymptoms: ['Black tarry stools or vomiting blood (GI Bleed)', 'Sudden chest pain / shortness of breath (MI/Stroke)', 'Sudden decrease in urination / leg swelling (AKI)'],
      pregnancyAdvice: 'STRICTLY AVOID after 20 weeks of pregnancy!'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Inhibits renal prostaglandins; can precipitate Acute Kidney Injury.',
      doseByCrCl: [
        { crclRange: 'CrCl ≥ 30 mL/min', recommendedDose: 'Standard dosing (Max 2400 mg daily)' },
        { crclRange: 'CrCl < 30 mL/min', recommendedDose: 'AVOID / CONTRAINDICATED in advanced kidney disease' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Use lowest effective dose',
      childPughB: 'Avoid due to increased bleeding risk and fluid retention',
      childPughC: 'CONTRAINDICATED'
    },

    pediatric_min_age: '6 months',
    max_daily_dose_mg: 2400,
    side_effects: ['Dyspepsia / Gastritis', 'Peptic Ulcer / GI Bleeding', 'Renal Impairment', 'Fluid Retention / Hypertension', 'Cardiovascular Thrombosis'],
    contraindications: ['Active Peptic Ulcer or GI Bleeding', 'History of Aspirin/NSAID-induced Asthma or Anaphylaxis', 'CABG Surgery Peri-operative Pain', '3rd Trimester Pregnancy (≥20 weeks)'],
    interactions: [
      { drug: 'Aspirin (Cardioprotective Low-Dose)', severity: 'Major', mechanism: 'Ibuprofen competitively blocks Aspirin binding to COX-1, attenuating antiplatelet cardioprotection', management: 'Take low-dose Aspirin at least 30-60 minutes BEFORE Ibuprofen or 8 hours AFTER Ibuprofen.' },
      { drug: 'Enalapril / Lisinopril', severity: 'Major', mechanism: 'NSAIDs blunt antihypertensive effect and risk acute renal failure', management: 'Monitor Blood Pressure and Serum Creatinine.' }
    ]
  }
];
