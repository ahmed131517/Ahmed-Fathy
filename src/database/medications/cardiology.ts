import { ClinicalMedication } from '../types/medication';

export const CARDIOLOGY_DATABASE: ClinicalMedication[] = [
  {
    id: 'enalapril',
    generic_name: 'Enalapril',
    brand_names: ['Renitec', 'Epaned', 'Ezapril', 'Barotec'],
    ATC_code: 'C09AA02',
    RxNorm: '3827',
    SNOMED: '372671003',
    DrugBank_ID: 'DB00584',
    Drug_Class: 'ACE Inhibitor',
    Subclass: 'Antihypertensive / Heart Failure Agent',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Category D - Major Risk (Major congenital malformations)',
      trimester2: 'Category D - Contraindicated (Fetal renal dysgenesis, oligohydramnios)',
      trimester3: 'Category D - Contraindicated (Fetal death, neonatal anuria, skull hypoplasia)',
      recommendation: 'STRICTLY CONTRAINDICATED IN PREGNANCY. Discontinue immediately upon pregnancy detection.',
      riskLevel: 'Contraindicated',
      category: 'Category D'
    },
    Lactation: {
      milkTransfer: 'Excreted in low concentrations in breast milk',
      infantRisk: 'Low',
      alternativeDrug: 'Captopril or Enalapril under pediatric monitoring',
      advice: 'Compatible in full-term infants; monitor blood pressure and infant hydration.'
    },

    Black_Box_Warning: 'Boxed Warning: Fetal Toxicity. When pregnancy is detected, discontinue Enalapril as soon as possible.',
    Storage: 'Store below 25°C away from excessive humidity.',
    Manufacturer: 'Merck Sharp & Dohme / EIPICO / Kahira',
    Price: 40,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Essential Hypertension',
        icd10: 'I10',
        dose: '5 - 10 mg PO (titrate up to 20-40 mg)',
        frequency: 'QD or BID',
        duration: 'Chronic / Lifelong',
        guideline: 'ACC / AHA 2023 Hypertension Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Heart Failure with Reduced Ejection Fraction (HFrEF)',
        icd10: 'I50.22',
        dose: '2.5 mg PO BID initial (Target: 10-20 mg PO BID)',
        frequency: 'BID',
        duration: 'Chronic',
        guideline: 'AHA / ACC / HFSA Heart Failure Guidelines 2024',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Diabetic Nephropathy / Proteinuria',
        icd10: 'E11.21',
        dose: '5 - 10 mg PO',
        frequency: 'QD',
        duration: 'Chronic',
        guideline: 'KDIGO Clinical Practice Guideline for Diabetes in CKD',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Ezapril 10mg', company: 'EIPICO', price_egp: 28.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Renitec 20mg', company: 'MSD Egypt', price_egp: 52.0, availability: 'Shortage', dosage_forms: ['Tablet'] },
      { brand_name: 'Barotec 5mg', company: 'Sedico', price_egp: 22.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Serum Creatinine / eGFR', 'Serum Potassium (K+)', 'Blood Pressure'],
      during: ['Recheck Creatinine and Potassium within 1–2 weeks after starting or dose increase', 'BP every visit'],
      frequency: '1-2 weeks post-initiation, then every 3-6 months'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered. Skip if near next dose.',
      storage: 'Keep at room temperature.',
      driving: 'May cause lightheadedness or dizziness initially.',
      alcohol: 'Avoid alcohol as it accentuates hypotensive blood pressure drop.',
      food: 'Can be taken with or without food.',
      warningSymptoms: ['Persistent dry cough', 'Mild dizziness on standing'],
      emergencySymptoms: ['Swelling of lip, tongue, throat, or face (Angioedema)', 'Severe fainting or dizziness'],
      pregnancyAdvice: 'MANDATORY CONTRACEPTION. Discontinue immediately if pregnancy is suspected!'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Dose adjustment mandatory in renal impairment to prevent hyperkalemia and acute kidney injury.',
      doseByCrCl: [
        { crclRange: 'CrCl > 30 mL/min', recommendedDose: 'Initial 5 mg PO daily' },
        { crclRange: 'CrCl 10–30 mL/min', recommendedDose: 'Initial 2.5 mg PO daily' },
        { crclRange: 'CrCl < 10 mL/min', recommendedDose: 'Initial 2.5 mg PO on dialysis days' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'No dose adjustment required',
      childPughB: 'No dose adjustment required',
      childPughC: 'Prodrug conversion to Enalaprilat may be delayed; monitor response'
    },

    pediatric_min_age: '1 month (0.08 mg/kg daily)',
    max_daily_dose_mg: 40,
    side_effects: ['Dry Cough', 'Hyperkalemia', 'Angioedema', 'Hypotension', 'Renal Impairment'],
    contraindications: ['History of ACE inhibitor-induced Angioedema', 'Hereditary / Idiopathic Angioedema', 'Concomitant Sacubitril/Valsartan (Entresto) within 36 hours', 'Pregnancy'],
    interactions: [
      { drug: 'Sacubitril/Valsartan', severity: 'Major', mechanism: 'Severe increase in Angioedema risk', management: 'Must allow 36-hour washout period when switching.' },
      { drug: 'Spironolactone / Potassium Supplements', severity: 'Major', mechanism: 'Synergistic hyperkalemia risk', management: 'Monitor serum Potassium closely; avoid high-dose potassium.' },
      { drug: 'NSAIDs (Ibuprofen, Naproxen)', severity: 'Major', mechanism: 'Blunts antihypertensive efficacy and precipitates acute renal failure ("Triple Whammy")', management: 'Avoid chronic NSAID use.' }
    ]
  },

  {
    id: 'atorvastatin',
    generic_name: 'Atorvastatin',
    brand_names: ['Lipitor', 'Ator', 'Lipimax', 'Astator', 'Statrem'],
    ATC_code: 'C10AA05',
    RxNorm: '83367',
    SNOMED: '372862000',
    DrugBank_ID: 'DB01076',
    Drug_Class: 'HMG-CoA Reductase Inhibitor (Statin)',
    Subclass: 'Lipid Lowering Agent',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Category X - Contraindicated (Cholesterol needed for fetal development)',
      trimester2: 'Category X - Contraindicated',
      trimester3: 'Category X - Contraindicated',
      recommendation: 'CONTRAINDICATED IN PREGNANCY AND WOMEN PLANNING PREGNANCY.',
      riskLevel: 'Contraindicated',
      category: 'Category X'
    },
    Lactation: {
      milkTransfer: 'Potential excretion into human milk',
      infantRisk: 'High',
      advice: 'Contraindicated during breastfeeding due to disruption of infant lipid metabolism.'
    },

    Black_Box_Warning: 'None',
    Storage: 'Store at controlled room temperature 20°C - 25°C.',
    Manufacturer: 'Pfizer / EIPICO / Amoun / Delta Pharma',
    Price: 85,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Atherosclerotic Cardiovascular Disease (ASCVD) High-Intensity Therapy',
        icd10: 'I25.10',
        dose: '40 - 80 mg PO',
        frequency: 'QD (Once daily evening)',
        duration: 'Chronic / Lifelong',
        guideline: 'ACC / AHA Cholesterol Guidelines 2023',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Primary Hypercholesterolemia / Moderate Intensity',
        icd10: 'E78.00',
        dose: '10 - 20 mg PO',
        frequency: 'QD',
        duration: 'Chronic',
        guideline: 'ACC / AHA Guidelines',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Ator 20mg', company: 'EIPICO', price_egp: 55.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Lipitor 40mg', company: 'Pfizer Egypt', price_egp: 210.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Lipimax 10mg', company: 'Amoun', price_egp: 45.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Lipid Panel (TC, LDL, HDL, TG)', 'ALT / AST Baseline', 'Creatine Kinase (CK) if muscle pain history'],
      during: ['Lipid Panel after 4–12 weeks of initiation', 'Liver enzymes if symptoms of hepatotoxicity occur'],
      frequency: 'Every 3-12 months once target LDL achieved'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered. Do not double next dose.',
      storage: 'Room temperature.',
      driving: 'No restriction.',
      alcohol: 'Limit heavy alcohol consumption due to hepatic burden.',
      food: 'Can be taken with or without food at any time of day.',
      warningSymptoms: ['Mild muscle aching', 'Fatigue'],
      emergencySymptoms: ['Severe unexplained muscle pain/weakness with dark tea-colored urine (Rhabdomyolysis)', 'Yellowing of skin/eyes'],
      pregnancyAdvice: 'Must discontinue 1-2 months before attempting conception!'
    },

    renal_adjustment: {
      required: false,
      guidance: 'No dosage adjustment required in renal impairment or hemodialysis.',
      doseByCrCl: [
        { crclRange: 'Any CrCl / Dialysis', recommendedDose: 'Standard dosing (10 - 80 mg daily)' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Monitor ALT/AST baseline',
      childPughB: 'Contraindicated in active liver disease or unexplained persistent transaminase elevations',
      childPughC: 'Contraindicated'
    },

    pediatric_min_age: '10 years (Heterozygous familial hypercholesterolemia)',
    max_daily_dose_mg: 80,
    side_effects: ['Myalgia / Muscle Soreness', 'Increased Transaminases', 'Diarrhea', 'Hyperglycemia / Diabetes risk'],
    contraindications: ['Active Liver Disease', 'Pregnancy & Breastfeeding', 'Unexplained Persistent AST/ALT Elevation'],
    interactions: [
      { drug: 'Clarithromycin / Erythromycin', severity: 'Major', mechanism: 'Strong CYP3A4 inhibition increasing Atorvastatin levels 4-fold (Rhabdomyolysis risk)', management: 'Avoid combination or hold Atorvastatin during antibiotic course.' },
      { drug: 'Grapefruit Juice (>1.2 L/day)', severity: 'Moderate', mechanism: 'Inhibits intestinal CYP3A4', management: 'Avoid excessive consumption of grapefruit juice.' }
    ]
  }
];
