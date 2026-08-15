import { ClinicalMedication } from '../types/medication';

export const NEPHROLOGY_DATABASE: ClinicalMedication[] = [
  {
    id: 'furosemide',
    generic_name: 'Furosemide',
    brand_names: ['Lasix', 'Salex', 'Diusemide', 'Furosemide EIPICO'],
    ATC_code: 'C03CA01',
    RxNorm: '4603',
    SNOMED: '372665008',
    DrugBank_ID: 'DB00695',
    Drug_Class: 'Loop Diuretic',
    Subclass: 'Antihypertensive / Anti-edematous Agent',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: false,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Category C - Risk',
      trimester2: 'Category C - Risk',
      trimester3: 'Category C - Risk (May decrease placental perfusion and maternal blood volume)',
      recommendation: 'Use only for fluid overload refractoriness, not for routine gestational edema',
      riskLevel: 'Moderate',
      category: 'Category C'
    },
    Lactation: {
      milkTransfer: 'Excreted in human milk',
      infantRisk: 'Low',
      advice: 'May suppress lactation. Monitor infant for hydration.'
    },

    Black_Box_Warning: 'Boxed Warning: Profound Diuresis. Furosemide is a potent diuretic that if given in excessive amounts can lead to profound diuresis with water and electrolyte depletion.',
    Storage: 'Protect from light. Store below 25°C.',
    Manufacturer: 'Sanofi / EIPICO / CID',
    Price: 25,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Congestive Heart Failure Edema',
        icd10: 'I50.9',
        dose: '20 - 40 mg PO initial (Titrate up to 80-240 mg daily in divided doses)',
        frequency: 'QD or BID',
        duration: 'Chronic / As needed for edema',
        guideline: 'AHA Heart Failure Guidelines 2024',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Acute Pulmonary Edema',
        icd10: 'J81.0',
        dose: '40 mg IV bolus (repeat with 80 mg IV if insufficient response within 1 hr)',
        frequency: 'PRN',
        duration: 'Acute care setting',
        guideline: 'ESC Heart Failure Guidelines',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Cirrhotic Ascites / Peripheral Edema',
        icd10: 'R18.8',
        dose: '40 mg PO daily (in combination with Spironolactone 100 mg daily ratio 40:100)',
        frequency: 'QD',
        duration: 'Chronic',
        guideline: 'AASLD Cirrhosis Ascites Guidelines',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Lasix 40mg', company: 'Sanofi Egypt', price_egp: 21.0, availability: 'Available', dosage_forms: ['Tablet', 'Ampoule'] },
      { brand_name: 'Salex 40mg', company: 'EIPICO', price_egp: 16.0, availability: 'Available', dosage_forms: ['Tablet'] }
    ],

    monitoring: {
      baseline: ['Serum Electrolytes (Potassium, Sodium, Magnesium, Calcium)', 'Serum Creatinine / BUN', 'Blood Pressure', 'Body Weight'],
      during: ['Potassium and Creatinine every 1-2 weeks post initiation', 'Daily weight logs'],
      frequency: 'Weekly during acute titration, then every 1-3 months'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered. Avoid taking late at night to prevent sleep disruption from frequent urination (nocturia).',
      storage: 'Room temperature away from light.',
      driving: 'Caution if feeling dizzy from hypotension.',
      alcohol: 'Avoid alcohol to prevent severe postural dizziness.',
      food: 'Can be taken with food if stomach upset occurs.',
      warningSymptoms: ['Increased urination', 'Mild dizziness on standing'],
      emergencySymptoms: ['Severe muscle cramps / weakness (Hypokalemia)', 'Severe dizziness / syncope', 'Hearing loss / tinnitus (Ototoxicity)'],
      pregnancyAdvice: 'Use only if specifically prescribed for severe fluid overload.'
    },

    renal_adjustment: {
      required: true,
      guidance: 'Higher doses required in severe renal failure due to blunted tubular secretion.',
      doseByCrCl: [
        { crclRange: 'CrCl ≥ 50 mL/min', recommendedDose: 'Standard dose (20 - 80 mg daily)' },
        { crclRange: 'CrCl 20–50 mL/min', recommendedDose: 'Higher initial dose (40 - 160 mg daily)' },
        { crclRange: 'CrCl < 20 mL/min / ESRD', recommendedDose: 'Refractory dose up to 240–500 mg daily' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'Standard dosing',
      childPughB: 'Monitor closely to prevent hepatic encephalopathy from electrolyte shifts',
      childPughC: 'Initiate in hospital setting with strict electrolyte monitoring'
    },

    pediatric_min_age: 'Neonate (1 mg/kg/dose)',
    max_daily_dose_mg: 600,
    side_effects: ['Hypokalemia', 'Hyponatremia', 'Hypomagnesemia', 'Hyperuricemia / Gout', 'Ototoxicity (at high IV rates)'],
    contraindications: ['Anuria', 'Severe Electrolyte Depletion', 'Hepatic Coma / Encephalopathy', 'Hypersensitivity to Sulfonamides'],
    interactions: [
      { drug: 'Aminoglycosides (Gentamicin, Amikacin)', severity: 'Major', mechanism: 'Synergistic ototoxicity and nephrotoxicity', management: 'Avoid combination or monitor hearing and renal parameters strictly.' },
      { drug: 'Digoxin', severity: 'Major', mechanism: 'Furosemide-induced hypokalemia significantly increases Digoxin toxicity & arrhythmia risk', management: 'Maintain serum Potassium between 4.0 - 5.0 mEq/L.' }
    ]
  }
];
