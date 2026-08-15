import { ClinicalMedication } from '../types/medication';

export const GASTRO_DATABASE: ClinicalMedication[] = [
  {
    id: 'omeprazole',
    generic_name: 'Omeprazole',
    brand_names: ['Losec', 'Gastrazole', 'Downoprazole', 'Omepral', 'Risek'],
    ATC_code: 'A02BC01',
    RxNorm: '7646',
    SNOMED: '372813008',
    DrugBank_ID: 'DB00338',
    Drug_Class: 'Proton Pump Inhibitor (PPI)',
    Subclass: 'Gastric Acid Suppressant',
    FDA_Approval: true,
    Egypt_Approval: true,
    Controlled_Drug: false,
    OTC: true,
    Prescription: true,

    Pregnancy: {
      trimester1: 'Category C - Moderate Risk',
      trimester2: 'Category C - Moderate Risk',
      trimester3: 'Category C - Moderate Risk',
      recommendation: 'Use when clinical benefit outweighs potential risk. (Lansoprazole/Pantoprazole Category B preferred)',
      riskLevel: 'Moderate',
      category: 'Category C'
    },
    Lactation: {
      milkTransfer: 'Excreted in low amounts in breast milk',
      infantRisk: 'Low',
      alternativeDrug: 'Pantoprazole or Famotidine',
      advice: 'Compatible with breastfeeding.'
    },

    Black_Box_Warning: 'None',
    Storage: 'Store below 25°C in moisture-resistant container.',
    Manufacturer: 'AstraZeneca / EIPICO / Sedico',
    Price: 40,
    Availability: 'In Stock',

    disease_dosing: [
      {
        indication: 'Gastroesophageal Reflux Disease (GERD) / Erosive Esophagitis',
        icd10: 'K21.0',
        dose: '20 - 40 mg PO',
        frequency: 'QD (30 min before breakfast)',
        duration: '4 - 8 weeks',
        guideline: 'ACG Guidelines for the Diagnosis and Management of GERD 2022',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Peptic Ulcer Disease (PUD) / Duodenal Ulcer',
        icd10: 'K26.9',
        dose: '20 mg PO',
        frequency: 'QD',
        duration: '4 - 8 weeks',
        guideline: 'ACG Guidelines for PUD',
        evidenceLevel: 'A-I'
      },
      {
        indication: 'Helicobacter pylori Eradication Triple Therapy',
        icd10: 'B96.81',
        dose: '20 - 40 mg PO',
        frequency: 'BID',
        duration: '14 days',
        guideline: 'ACG Guideline H. pylori',
        evidenceLevel: 'A-I'
      }
    ],

    egyptian_brands: [
      { brand_name: 'Gastrazole 20mg', company: 'EIPICO', price_egp: 30.0, availability: 'Available', dosage_forms: ['Capsule'] },
      { brand_name: 'Downoprazole 40mg', company: 'Marcyrl', price_egp: 48.0, availability: 'Available', dosage_forms: ['Capsule'] },
      { brand_name: 'Losec 20mg', company: 'AstraZeneca Egypt', price_egp: 85.0, availability: 'Shortage', dosage_forms: ['Capsule'] }
    ],

    monitoring: {
      baseline: ['Serum Magnesium (if planned duration > 1 year)', 'Bone Mineral Density (if osteoporosis risk)'],
      during: ['Magnesium levels periodically', 'Vitamin B12 level if > 3 years therapy'],
      frequency: 'Annual if long-term treatment'
    },

    patient_counseling: {
      missedDose: 'Take as soon as remembered before meal.',
      storage: 'Keep at room temperature.',
      driving: 'No restriction.',
      alcohol: 'Avoid alcohol as it irritates gastric mucosa.',
      food: 'Take 30 - 60 minutes BEFORE the first meal of the day for maximum acid suppression.',
      warningSymptoms: ['Mild headache', 'Diarrhea', 'Flatulence'],
      emergencySymptoms: ['Severe bone pain / fractures', 'Muscle twitching / cramps (Hypomagnesemia)', 'Black tarry stools'],
      pregnancyAdvice: 'Consult physician; Pantoprazole may be preferred.'
    },

    renal_adjustment: {
      required: false,
      guidance: 'No dose adjustment needed in renal impairment.',
      doseByCrCl: [
        { crclRange: 'Any CrCl', recommendedDose: 'Standard dose (20 - 40 mg daily)' }
      ]
    },

    hepatic_adjustment: {
      childPughA: 'No dose adjustment required',
      childPughB: 'Max 20 mg PO daily',
      childPughC: 'Max 10–20 mg PO daily due to increased AUC'
    },

    pediatric_min_age: '1 year (Weight-based dosing)',
    max_daily_dose_mg: 120,
    side_effects: ['Headache', 'Diarrhea', 'Hypomagnesemia (Long-term)', 'Clostridium difficile Infection', 'Vitamin B12 Deficiency'],
    contraindications: ['Hypersensitivity to PPIs', 'Concurrent use with Rilpivirine'],
    interactions: [
      { drug: 'Clopidogrel', severity: 'Major', mechanism: 'Omeprazole inhibits CYP2C19, blunting active metabolite conversion of Clopidogrel and increasing thrombosis risk', management: 'Switch to Pantoprazole or Rabeprazole which have minimal CYP2C19 inhibition.' },
      { drug: 'Ketoconazole / Itraconazole', severity: 'Moderate', mechanism: 'Reduced gastric acidity decreases azole antifungal absorption', management: 'Take acidic beverage (e.g., cola) with antifungal if combination unavoidable.' }
    ]
  }
];
