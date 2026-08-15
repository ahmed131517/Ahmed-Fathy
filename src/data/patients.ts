export interface VitalRecord {
  date: string;
  bloodPressure: string;
  heartRate: number;
  weight: number;
}

export interface Prescription {
  medicationId: string;
  name: string;
  dosage: string;
  frequency: string; // e.g., "BID", "TID", "Daily"
  route: string;     // e.g., "PO", "IV", "SubQ"
  startDate: string;
  status: 'active' | 'discontinued' | 'completed';
}

export interface Allergy {
  id: string;
  name: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
}

export type PregnancyStatus = 'unknown' | 'not_pregnant' | 'pregnant' | 'postpartum';
export type LactationStatus = 'unknown' | 'not_lactating' | 'lactating';

export interface StructuredPregnancyProfile {
  status: PregnancyStatus;
  gestationalAgeWeeks?: number;
  trimester?: 1 | 2 | 3;
  EDD?: string;
  lactationStatus?: LactationStatus;
  pregnancyVerificationSource?: 'Urine HCG' | 'Serum HCG' | 'Ultrasound' | 'Patient Reported' | 'Clinical History' | 'Unverified';
  verificationDate?: string;
}

export interface Patient {
  id: string;
  mrn?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  dob?: string;
  gender: string;
  phone?: string;
  bloodType: string;
  lastVisit: string;
  status: string;
  photo?: string;
  allergies?: Allergy[];
  chronicConditions?: string[];
  medications?: Prescription[];
  vitalsHistory?: VitalRecord[];
  surgeries?: string[];
  familyHistory?: string[];
  familyHistoryNotes?: string;
  pastTraumaHistory?: any;
  pastTraumaNotes?: string;
  otherConditions?: string;
  pregnancyProfile?: StructuredPregnancyProfile;
  gynHistory?: {
    menarcheAge?: string;
    lmp?: string;
    cycleRegularity?: string;
    cycleLength?: string;
    contraception?: string;
    papSmear?: string;
    papNotes?: string;
  };
  obsHistory?: {
    gravidity?: string;
    parity?: string;
    term?: string;
    preterm?: string;
    abortions?: string;
    living?: string;
    modeOfDelivery?: string;
    complicationNotes?: string;
  };
  labResults?: { labName: string; value: number; unit: string; range: 'Normal' | 'High' | 'Low' }[];
}
