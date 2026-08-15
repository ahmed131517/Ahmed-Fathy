const fs = require('fs');
const path = 'src/data/diagnosisMappings.ts';

const content = `export interface RedFlag {
  id: string;
  description: string;
  triageAction: 'Emergency' | 'Urgent' | 'Consult';
  urgencyLevel: 1 | 2 | 3;
}

export interface LikelihoodRatio {
  symptomId: string;
  lrPositive: number;
  lrNegative: number;
  isPathognomonic?: boolean;
}

export interface PrevalenceContext {
  ageRange?: [number, number];
  sex?: 'Male' | 'Female';
  chronicConditions?: string[];
  weight: number;
}

export interface Diagnosis {
  id: string;
  name: string;
  system?: 'Cardiovascular' | 'Respiratory' | 'Neurological' | 'Endocrine' | 'Infectious' | 'Hematology' | 'Oncology' | 'Psychiatry' | 'Musculoskeletal' | 'Renal' | 'Gastrointestinal' | 'Dermatological' | 'Reproductive' | 'EENT';
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  description: string;
  inheritsSymptomsFrom?: string[];
  commonSymptoms: string[]; 
  redFlagsStructured?: RedFlag[];
  likelihoodRatios?: LikelihoodRatio[];
  demographicPrevalence?: PrevalenceContext[];
  distinguishingFeatures?: string[];
  category: string;
  redFlags: string[]; 
  icd10: string;
  prevalenceScore?: number;
  triagePriority?: 1 | 2 | 3 | 4 | 5;
  diagnosticTests?: string[];
  firstLineTreatments?: string[];
  prognosis?: string;
  matchPercentage?: number;
  associatedLabs?: { labName: string; range: 'High' | 'Low' | 'Normal'; weight?: number }[];
  chronicity?: 'Acute' | 'Chronic' | 'Both';
}

export const COMMON_DIAGNOSES: Diagnosis[] = [
  {
    id: "common_cold",
    name: "Common Cold",
    system: 'EENT',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "A common viral infection of the upper respiratory tract affecting the nose and throat.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "rhinorrhea", "nasal_congestion", "nasal_sneezing", "sore_throat", "lungs_cough"],
    likelihoodRatios: [
      { symptomId: "rhinorrhea", lrPositive: 3.0, lrNegative: 0.2 },
      { symptomId: "nasal_congestion", lrPositive: 2.5, lrNegative: 0.3 },
      { symptomId: "sore_throat", lrPositive: 2.0, lrNegative: 0.5 },
      { symptomId: "nasal_sneezing", lrPositive: 2.5, lrNegative: 0.4 },
      { symptomId: "gen_fever", lrPositive: 1.2, lrNegative: 0.8 }
    ],
    distinguishingFeatures: ["Predominantly nasal symptoms (rhinorrhea, sneezing)", "Gradual onset", "Low-grade or absent fever"],
    redFlagsStructured: [],
    icd10: "J00",
    prevalenceScore: 10,
    triagePriority: 5,
    diagnosticTests: ["Clinical evaluation"],
    firstLineTreatments: ["Rest", "Hydration", "Analgesics", "Decongestants"]
  },
  {
    id: "influenza",
    name: "Influenza (Flu)",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "A viral infection that attacks your respiratory system with sudden onset of high fever and myalgia.",
    inheritsSymptomsFrom: ['lungs_cough'],
    commonSymptoms: ["gen_fever", "gen_fatigue", "sore_throat", "lungs_cough", "msk_muscle_pain", "headache_general", "rhinorrhea", "nasal_congestion"],
    likelihoodRatios: [
      { symptomId: "gen_fever", lrPositive: 3.5, lrNegative: 0.1, isPathognomonic: false },
      { symptomId: "msk_muscle_pain", lrPositive: 4.0, lrNegative: 0.4 },
      { symptomId: "gen_fatigue", lrPositive: 3.0, lrNegative: 0.2 },
      { symptomId: "rhinorrhea", lrPositive: 1.5, lrNegative: 0.7 }
    ],
    distinguishingFeatures: ["Abrupt onset of high fever and severe body aches", "Prominent fatigue and chills"],
    redFlagsStructured: [
      { id: 'flu_sob', description: "Severe shortness of breath", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "J11.1",
    prevalenceScore: 9,
    triagePriority: 4,
    diagnosticTests: ["Rapid Influenza Diagnostic Test (RIDT)", "RT-PCR"],
    firstLineTreatments: ["Oseltamivir (Tamiflu) if within 48 hours", "Supportive care"]
  },
  {
    id: "allergic_rhinitis",
    name: "Allergic Rhinitis",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "An allergic response causing itchy, watery eyes, sneezing, and nasal congestion triggered by allergens.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["rhinorrhea", "nasal_congestion", "nasal_sneezing", "eye_redness", "lungs_cough"],
    likelihoodRatios: [
      { symptomId: "nasal_sneezing", lrPositive: 4.0, lrNegative: 0.2 },
      { symptomId: "eye_redness", lrPositive: 5.0, lrNegative: 0.6 },
      { symptomId: "rhinorrhea", lrPositive: 2.5, lrNegative: 0.3 },
      { symptomId: "gen_fever", lrPositive: 0.1, lrNegative: 1.5, isPathognomonic: false }
    ],
    distinguishingFeatures: ["Itchy, watery eyes and frequent sneezing", "Lack of fever", "Seasonal or allergen trigger pattern"],
    redFlagsStructured: [
      { id: 'ar_unilateral', description: "Unilateral nasal discharge", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "J30.9",
    prevalenceScore: 8,
    triagePriority: 5,
    diagnosticTests: ["Allergy skin prick test", "Serum IgE"],
    firstLineTreatments: ["Intranasal corticosteroids", "Antihistamines"]
  },
  {
    id: "pneumonia",
    name: "Community-Acquired Pneumonia",
    system: 'Respiratory',
    severity: 'Severe',
    category: "Respiratory",
    redFlags: [],
    description: "An infection that inflames air sacs in one or both lungs, which may fill with fluid or pus.",
    inheritsSymptomsFrom: ['lungs_cough'],
    commonSymptoms: ["gen_fever", "lungs_cough", "lungs_dyspnea", "chest_pain", "gen_fatigue"],
    likelihoodRatios: [
      { symptomId: "gen_fever", lrPositive: 2.8, lrNegative: 0.3 },
      { symptomId: "chest_pain", lrPositive: 2.2, lrNegative: 0.5 },
      { symptomId: "lungs_dyspnea", lrPositive: 3.1, lrNegative: 0.4 }
    ],
    distinguishingFeatures: ["Productive cough with rust-colored or purulent sputum", "Fever and focal breath sounds (crackles)"],
    redFlagsStructured: [
      { id: 'pna_hypoxia', description: "Oxygen saturation < 92%", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J18.9",
    prevalenceScore: 7,
    triagePriority: 2,
    diagnosticTests: ["Chest X-Ray", "Complete Blood Count", "Sputum Culture"],
    firstLineTreatments: ["Empiric Antibiotics (Azithromycin / Amoxicillin)", "Oxygen therapy"]
  },
  {
    id: "appendicitis",
    name: "Acute Appendicitis",
    system: 'Gastrointestinal',
    severity: 'Severe',
    category: "Gastrointestinal",
    redFlags: [],
    description: "Inflammation of the appendix, causing acute right lower quadrant abdominal pain.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "gen_fever"],
    likelihoodRatios: [
      { symptomId: "abdominal_pain", lrPositive: 4.5, lrNegative: 0.1 },
      { symptomId: "nausea", lrPositive: 2.0, lrNegative: 0.5 },
      { symptomId: "gen_fever", lrPositive: 1.8, lrNegative: 0.6 }
    ],
    distinguishingFeatures: ["Periumbilical pain migrating to Right Lower Quadrant (McBurney's point)", "Rebound tenderness"],
    redFlagsStructured: [
      { id: 'app_perforation', description: "Signs of peritonitis / appendix rupture", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "K35.80",
    prevalenceScore: 6,
    triagePriority: 1,
    diagnosticTests: ["Abdominal Ultrasound", "CT Abdomen/Pelvis", "Complete Blood Count"],
    firstLineTreatments: ["Appendectomy", "IV Antibiotics"]
  },
  {
    id: "myocardial_infarction",
    name: "Acute Myocardial Infarction",
    system: 'Cardiovascular',
    severity: 'Critical',
    category: "Cardiovascular",
    redFlags: [],
    description: "Blockage of blood flow to the heart muscle, causing tissue death (heart attack).",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["chest_pain", "gen_fatigue", "nausea"],
    likelihoodRatios: [
      { symptomId: "chest_pain", lrPositive: 6.0, lrNegative: 0.1 },
      { symptomId: "gen_fatigue", lrPositive: 1.5, lrNegative: 0.8 }
    ],
    distinguishingFeatures: ["Crushing retrosternal chest pain radiating to left arm or jaw", "Diaphoresis and shortness of breath"],
    redFlagsStructured: [
      { id: 'mi_stemi', description: "STEMI ECG changes", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I21.9",
    prevalenceScore: 5,
    triagePriority: 1,
    diagnosticTests: ["12-Lead ECG", "Troponin T/I", "Cardiac Enzymes"],
    firstLineTreatments: ["Aspirin", "Nitroglycerin", "Primary PCI / Catheterization"]
  },
  {
    id: "migraine",
    name: "Migraine Headache",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "A neurological condition characterized by intense, debilitating throbbing headaches often with nausea and light sensitivity.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_general", "nausea"],
    likelihoodRatios: [
      { symptomId: "headache_general", lrPositive: 4.0, lrNegative: 0.2 },
      { symptomId: "nausea", lrPositive: 2.5, lrNegative: 0.5 }
    ],
    distinguishingFeatures: ["Unilateral throbbing headache", "Photophobia and phonophobia", "Duration 4-72 hours"],
    redFlagsStructured: [
      { id: 'mig_thunder', description: "Worst headache of life (Thunderclap)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G43.9",
    prevalenceScore: 8,
    triagePriority: 3,
    diagnosticTests: ["Clinical criteria (ICHD-3)"],
    firstLineTreatments: ["Triptans (Sumatriptan)", "NSAIDs", "Antiemetics"]
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (Cystitis)",
    system: 'Renal',
    severity: 'Mild',
    category: "Renal",
    redFlags: [],
    description: "An infection in any part of the urinary system, most commonly the bladder and urethra.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["frequency_urination", "gen_fever"],
    likelihoodRatios: [
      { symptomId: "frequency_urination", lrPositive: 4.0, lrNegative: 0.2 },
      { symptomId: "gen_fever", lrPositive: 1.5, lrNegative: 0.7 }
    ],
    distinguishingFeatures: ["Dysuria (painful urination)", "Urinary frequency and urgency", "Suprapubic tenderness"],
    redFlagsStructured: [
      { id: 'uti_pyelo', description: "Flank pain and high fever (Pyelonephritis)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "N39.0",
    prevalenceScore: 9,
    triagePriority: 4,
    diagnosticTests: ["Urinalysis", "Urine Culture"],
    firstLineTreatments: ["Nitrofurantoin", "Trimethoprim-sulfamethoxazole", "Hydration"]
  },
  {
    id: "heart_failure",
    name: "Heart Failure",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular",
    redFlags: [],
    description: "A chronic condition in which the heart doesn't pump blood as well as it should.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["leg_swelling_heart", "orthopnea", "gen_fatigue"],
    likelihoodRatios: [
      { symptomId: "orthopnea", lrPositive: 5.0, lrNegative: 0.3 },
      { symptomId: "leg_swelling_heart", lrPositive: 4.0, lrNegative: 0.4 },
      { symptomId: "gen_fatigue", lrPositive: 2.0, lrNegative: 0.6 }
    ],
    distinguishingFeatures: ["Exertional dyspnea and orthopnea", "Peripheral pitting edema", "Elevated JVP"],
    redFlagsStructured: [
      { id: 'hf_acute', description: "Acute decompensated pulmonary edema", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I50.9",
    prevalenceScore: 6,
    triagePriority: 2,
    diagnosticTests: ["Echocardiogram", "BNP / NT-proBNP", "Chest X-Ray"],
    firstLineTreatments: ["ACE inhibitors / ARNI", "Beta-blockers", "Loop diuretics"]
  }
];
`;

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully updated diagnosisMappings.ts!");
