export interface RedFlag {
  id: string;
  description: string;
  triageAction: 'Emergency' | 'Urgent' | 'Consult';
  urgencyLevel: 1 | 2 | 3; // 1: Immediate/Resuscitation, 2: Emergent, 3: Urgent
}

export interface LikelihoodRatio {
  symptomId: string;
  lrPositive: number; // LR+ > 1 increases probability
  lrNegative: number; // LR- < 1 decreases probability
  isPathognomonic?: boolean; // If true and present, weight is extremely high
}

export interface PrevalenceContext {
  ageRange?: [number, number];
  sex?: 'Male' | 'Female';
  chronicConditions?: string[];
  weight: number; // multiplier for prevalenceScore
}

export interface Diagnosis {
  id: string;
  name: string;
  // New EMR structure (fields optional for backward compatibility)
  system?: 'Cardiovascular' | 'Respiratory' | 'Neurological' | 'Endocrine' | 'Infectious' | 'Hematology' | 'Oncology' | 'Psychiatry' | 'Musculoskeletal' | 'Renal' | 'Gastrointestinal' | 'Dermatological' | 'Reproductive' | 'EENT';
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  description: string;
  inheritsSymptomsFrom?: string[];
  commonSymptoms: string[]; 
  redFlagsStructured?: RedFlag[]; 
  
  // Clinical Logic & Accuracy Fields
  likelihoodRatios?: LikelihoodRatio[];
  demographicPrevalence?: PrevalenceContext[];
  distinguishingFeatures?: string[]; // Features that rule out or strongly rule in
  
  // Existing structure (maintained for compatibility)
  category: string;
  redFlags: string[]; 
  icd10: string;
  prevalenceScore?: number;
  triagePriority?: 1 | 2 | 3 | 4 | 5;
  diagnosticTests?: string[];
  firstLineTreatments?: string[];
  prognosis?: string;
  matchPercentage?: number;
  
  // Association Mapping & Temporal Trending
  associatedLabs?: { labName: string; range: 'High' | 'Low' | 'Normal'; weight?: number }[];
  chronicity?: 'Acute' | 'Chronic' | 'Both';
}

// ... (SYSTEM_BASES remains)

export const COMMON_DIAGNOSES: Diagnosis[] = [
  // Cardiovascular
  {
    id: "heart_failure",
    name: "Heart Failure",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular", // Maintain for backward compatibility
    redFlags: [], // Maintain for backward compatibility
    description: "A chronic condition in which the heart doesn't pump blood as well as it should.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["leg_swelling_heart", "orthopnea", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'endo_stroke', description: "Sudden weakness or speech difficulty (embolic stroke)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I33.0",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "common_cold",
    name: "Common Cold",
    system: 'EENT',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "A common viral infection of the nose and throat.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "rhinorrhea", "nasal_congestion", "nasal_sneezing", "sore_throat", "lungs_cough"],
    likelihoodRatios: [
      { symptomId: "rhinorrhea", lrPositive: 3.0, lrNegative: 0.2 },
      { symptomId: "nasal_congestion", lrPositive: 2.5, lrNegative: 0.3 },
      { symptomId: "sore_throat", lrPositive: 2.0, lrNegative: 0.5 },
      { symptomId: "gen_fever", lrPositive: 1.2, lrNegative: 0.8 }
    ],
    redFlagsStructured: [],
    icd10: "J00",
    prevalenceScore: 10,
    triagePriority: 5
  }
];


