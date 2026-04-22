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
  otherConditions?: string;
}
