import Dexie, { type Table } from 'dexie';

export interface PatientRecord {
  id?: string;
  localId?: number;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  lastVisit: string;
  status: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
  allergies?: string; // JSON string of allergies
}

export interface Appointment {
  id?: string;
  localId?: number;
  patientId?: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: string;
  doctor: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

// --- Professional Medication Schema ---

export interface Drug {
  id?: number;
  generic_name: string;
  drug_class: string;
  atc_code: string;
}

export interface DrugBrand {
  id?: number;
  drug_id: number;
  brand_name: string;
  manufacturer: string;
}

export interface DosageForm {
  id?: number;
  form_name: string;
}

export interface DrugStrength {
  id?: number;
  drug_id: number;
  strength: string;
  unit: string;
}

export interface DrugDosageGuideline {
  id?: number;
  drug_id: number;
  indication: string;
  adult_dose: string;
  pediatric_dose: string;
  max_dose: string;
  frequency: string;
}

export interface DrugInteraction {
  id?: number;
  drug1_id: number;
  drug2_id: number;
  severity: 'Minor' | 'Moderate' | 'Major';
  description: string;
}

export interface DrugContraindication {
  id?: number;
  drug_id: number;
  condition: string;
  severity: 'Moderate' | 'Major';
}

export interface DrugSideEffect {
  id?: number;
  drug_id: number;
  side_effect: string;
  frequency: string;
}

export interface DrugIndication {
  id?: number;
  drug_id: number;
  disease: string;
}

export interface Prescription {
  id?: string;
  localId?: number;
  patientId: string;
  doctorId?: string;
  diagnosis?: string;
  notes?: string;
  refills: number;
  status: string;
  createdAt: number;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface PrescriptionItem {
  id?: string;
  localId?: number;
  prescriptionId: string; // Local or remote ID
  drugId?: number;
  medicationName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  form?: string;
}

export interface Diagnosis {
  id?: string;
  localId?: number;
  patientId: string;
  appointmentId?: string;
  condition: string;
  notes?: string;
  date: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface LabResult {
  id?: string;
  localId?: number;
  patientId: string;
  appointmentId?: string;
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  date: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface Vitals {
  id?: string;
  localId?: number;
  patientId: string;
  appointmentId?: string;
  bp_systolic?: number;
  bp_diastolic?: number;
  hr?: number;
  temp?: number;
  rr?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  oxygenType?: string;
  oxygenDose?: string;
  oxygenInvasive?: string;
  oxygenDeviceType?: string;
  fio2?: string;
  peep?: string;
  pressureSupport?: string;
  flowRate?: string;
  notes?: string;
  date: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface PhysicalExamRecord {
  id?: string;
  localId?: number;
  patientId: string;
  data: any;
  status: 'draft' | 'finalized';
  date: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export class AppDatabase extends Dexie {
  patients!: Table<PatientRecord>;
  appointments!: Table<Appointment>;
  prescriptions!: Table<Prescription>;
  prescription_items!: Table<PrescriptionItem>;
  diagnoses!: Table<Diagnosis>;
  lab_results!: Table<LabResult>;
  vitals!: Table<Vitals>;
  physical_exams!: Table<PhysicalExamRecord>;
  
  // Medication Tables
  drugs!: Table<Drug>;
  drug_brands!: Table<DrugBrand>;
  dosage_forms!: Table<DosageForm>;
  drug_strengths!: Table<DrugStrength>;
  drug_dosage_guidelines!: Table<DrugDosageGuideline>;
  drug_interactions!: Table<DrugInteraction>;
  drug_contraindications!: Table<DrugContraindication>;
  drug_side_effects!: Table<DrugSideEffect>;
  drug_indications!: Table<DrugIndication>;

  constructor() {
    super('MedicalAppDB');
    this.version(6).stores({
      patients: '++localId, id, name, lastModified, isDeleted, isSynced',
      appointments: '++localId, id, patientId, date, lastModified, isDeleted, isSynced',
      prescriptions: '++localId, id, patientId, lastModified, isDeleted, isSynced',
      prescription_items: '++localId, id, prescriptionId',
      diagnoses: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      lab_results: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      vitals: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      physical_exams: '++localId, id, patientId, status, lastModified, isDeleted, isSynced',
      drugs: '++id, generic_name, atc_code',
      drug_brands: '++id, drug_id, brand_name',
      dosage_forms: '++id, form_name',
      drug_strengths: '++id, drug_id',
      drug_dosage_guidelines: '++id, drug_id, indication',
      drug_interactions: '++id, drug1_id, drug2_id',
      drug_contraindications: '++id, drug_id, condition',
      drug_side_effects: '++id, drug_id',
      drug_indications: '++id, drug_id, disease'
    });
  }
}

export const db = new AppDatabase();
