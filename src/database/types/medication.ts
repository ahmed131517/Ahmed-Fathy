export interface PregnancyDetails {
  trimester1: string;
  trimester2: string;
  trimester3: string;
  recommendation: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Contraindicated';
  category?: string;
}

export interface LactationDetails {
  milkTransfer: string;
  infantRisk: 'Low' | 'Moderate' | 'High' | 'Contraindicated';
  alternativeDrug?: string;
  advice: string;
}

export interface DiseaseDosingRule {
  indication: string;
  icd10?: string;
  dose: string;
  frequency: string;
  duration: string;
  guideline: string;
  evidenceLevel: 'A-I' | 'A-II' | 'B-I' | 'B-II' | 'C-I' | 'C-II' | string;
}

export interface EgyptianBrand {
  brand_name: string;
  company: string;
  price_egp: number;
  availability: 'Available' | 'Shortage' | 'Discontinued';
  dosage_forms: string[];
}

export interface MonitoringRequirements {
  baseline: string[];
  during: string[];
  frequency: string;
}

export interface PatientCounselingDetails {
  missedDose: string;
  storage: string;
  driving: string;
  alcohol: string;
  food: string;
  warningSymptoms: string[];
  emergencySymptoms: string[];
  pregnancyAdvice: string;
}

export interface RenalAdjustmentRule {
  required: boolean;
  guidance: string;
  doseByCrCl?: Array<{
    crclRange: string;
    recommendedDose: string;
  }>;
}

export interface HepaticAdjustmentRule {
  childPughA: string;
  childPughB: string;
  childPughC: string;
}

export interface ClinicalMedication {
  id: string;
  generic_name: string;
  brand_names: string[];
  ATC_code?: string;
  RxNorm?: string;
  SNOMED?: string;
  DrugBank_ID?: string;
  Drug_Class: string;
  Subclass?: string;
  FDA_Approval?: boolean;
  Egypt_Approval?: boolean;
  Controlled_Drug?: boolean | string;
  OTC?: boolean;
  Prescription?: boolean;
  
  Pregnancy?: PregnancyDetails;
  Lactation?: LactationDetails;
  Black_Box_Warning?: string;
  Storage?: string;
  Manufacturer?: string;
  Price?: number;
  Availability?: 'In Stock' | 'Shortage' | 'Prescription Only';

  disease_dosing?: DiseaseDosingRule[];
  egyptian_brands?: EgyptianBrand[];
  monitoring?: MonitoringRequirements;
  patient_counseling?: PatientCounselingDetails;
  renal_adjustment?: RenalAdjustmentRule;
  hepatic_adjustment?: HepaticAdjustmentRule;
  
  pediatric_min_age?: string;
  max_daily_dose_mg?: number | null;
  side_effects?: string[];
  contraindications?: string[];
  interactions?: Array<{
    drug: string;
    severity: 'Major' | 'Moderate' | 'Minor';
    mechanism: string;
    management: string;
  }>;
}
