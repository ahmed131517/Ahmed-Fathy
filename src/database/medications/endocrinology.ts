import { ClinicalMedication } from '../types/medication';

export const ENDOCRINOLOGY_DATABASE: ClinicalMedication[] = [
  {
    id: 'metformin',
    generic_name: 'Metformin Hydrochloride',
    brand_names: ['Glucophage', 'Cidophage', 'Glucovance', 'Diaformin', 'Metfor'],
    ATC_code: 'A10BA02',
    RxNorm: '6809',
    SNOMED: '372567009',
    DrugBank_ID: 'DB00331',
    Drug_Class: 'Biguanide Antidiabetic Agent',
    Subclass: 'Insulin Sensitizer',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Compatible / Low Risk',
      trimester2: 'Compatible / Low Risk',
      trimester3: 'Compatible / Low Risk',
      recommendation: 'Second-line after Insulin for Gestational Diabetes Mellitus (GDM)',
      riskLevel: 'Low',
      category: 'Category B'
    },
    Lactation: {
      milkTransfer: 'Excreted in low concentrations into breast milk',
      infantRisk: 'Low',
      advice: 'Compatible with breastfeeding. Monitor infant growth and blood glucose if symptomatic.'
    },

    Black_Box_Warning: 'Boxed Warning: Lactic Acidosis. Rare but severe metabolic complication; risk increases with renal impairment, sepsis, dehydration, or acute heart failure.',
    Storage: 'Store below 30°C in tight, light-resistant container.',
    Manufacturer: 'Merck / Chemical Industries Development (CID) / EIPICO',
    Price: 35,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Type 2 Diabetes Mellitus (First-Line Therapy)',
        icd10: 'E11.9',
        dose: '500 - 850 mg PO BID with meals (Titrate up to 2000-2550 mg daily)',
        frequency: 'BID or TID',
        duration: 'Chronic / Lifelong',
        guideline: 'ADA Standards of Care in Diabetes 2024',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Polycystic Ovary Syndrome (PCOS) - Insulin Resistance / Anovulation',
        icd10: 'E28.2',
        dose: '1500 - 2000 mg PO daily in divided doses',
        frequency: 'BID or TID',
        duration: 'Chronic / 6-12 months evaluation',
        guideline: 'ACOG Practice Bulletin Polycystic Ovary Syndrome',
        evidenceLevel: 'B-I'
      },
      {
        indication: 'Pre-Diabetes Mellitus (Prevention)',
        icd10: 'R73.03',
        dose: '850 mg PO BID',
        frequency: 'BID',
        duration: 'Chronic',
        guideline: 'ADA Prevention Guidelines',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Cidophage 850mg', company: 'CID Egypt', price_egp: 24.0, availability: 'Available', dosage_forms: ['Tablet'] },
      { brand_name: 'Glucophage 1000mg (XR)', company: 'Merck Egypt', price_egp: 60.0, availability: 'Available', dosage_forms: ['Extended Release Tablet'] },
      { brand_name: 'Glucovance 500/5', company: 'Merck', price_egp: 52.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['eGFR / Serum Creatinine', 'HbA1c', 'Vitamin B12 level', 'Liver Function Tests'],
      during: ['HbA1c every 3 months (if uncontrolled) or 6 months (if stable)', 'eGFR annually', 'Vitamin B12 every 2-3 years'],
      frequency: 'eGFR annually (every 3-6 months if eGFR < 60 mL/min)'
    },

    patient_counseling: {
      missedDose: 'Take with next meal. Do not take double doses.',
      storage: 'Room temperature.',
      driving: 'Metformin alone does not cause hypoglycemia; safe for driving.',
      alcohol: 'AVOID excessive alcohol to prevent severe Lactic Acidosis risk.',
      food: 'ALWAYS take WITH or IMMEDIATELY AFTER meals to minimize nausea, bloating, and diarrhea.',
      warningSymptoms: ['Mild diarrhea', 'Metallic taste', 'Abdominal discomfort'],
      emergencySymptoms: ['Extreme fatigue, muscle weakness, severe stomach pain with hyperventilation (Lactic Acidosis)'],
      pregnancyAdvice: 'Inform doctor if pregnant; insulin may be preferred.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'eGFR-based dosage restriction mandatory to avoid Lactic Acidosis.',
      doseByCrCl: [
        { crclRange: 'eGFR ≥ 60 mL/min', recommendedDose: 'Standard dosing (Max 2550 mg daily)' },
        { crclRange: 'eGFR 45–59 mL/min', recommendedDose: 'Max 2000 mg daily; monitor renal function every 3–6 months' },
        { crclRange: 'eGFR 30–44 mL/min', recommendedDose: 'Max 1000 mg daily; DO NOT START new treatment in this range' },
        { crclRange: 'eGFR < 30 mL/min', recommendedDose: 'CONTRAINDICATED. Discontinue immediately.' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Use with caution',
      childPughB: 'Avoid due to impaired lactate clearance',
      childPughC: 'CONTRAINDICATED due to high risk of Lactic Acidosis'
    },

    pediatric_min_age: '10 years',
    max_daily_dose_mg: 2550,
    side_effects: ['Diarrhea', 'Nausea / Vomiting', 'Abdominal Bloating', 'Vitamin B12 Deficiency', 'Lactic Acidosis (Rare)'],
    contraindications: ['Severe Renal Impairment (eGFR < 30 mL/min)', 'Acute or Chronic Metabolic Acidosis / Diabetic Ketoacidosis', 'Severe Sepsis or Hypoxia', 'Iodinated Radiocontrast administration'],
    interactions: [
      { drug: 'Iodinated Contrast Media', severity: 'Major', mechanism: 'Acute contrast-induced renal failure causing Metformin accumulation and Lactic Acidosis', management: 'Withhold Metformin at time of or prior to procedure; recheck eGFR 48 hrs later.' },
      { drug: 'Cimetidine', severity: 'Moderate', mechanism: 'Inhibits renal tubular clearance of Metformin', management: 'Monitor blood glucose and adjust dose.' }
    ]
  }
];
