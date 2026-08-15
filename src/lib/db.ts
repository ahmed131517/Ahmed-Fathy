import Dexie, { type Table } from 'dexie';
import { db as firestoreDb, doc, setDoc, deleteDoc } from './firebase';
import fakeIndexedDB, { IDBKeyRange as FDBKeyRange } from 'fake-indexeddb';

export const isSyncingFromFirestore = { value: 0 };

export interface PatientRecord {
  id?: string;
  localId?: number;
  name: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  age: number;
  nationalId?: string;
  email?: string;
  phone?: string;
  address?: string;
  gender: string;
  bloodType: string;
  referralSource?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  groupNumber?: string;
  insuranceFront?: string;
  insuranceBack?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  hasAllergies?: string;
  allergies?: any; // Replaced JSON string with native array/object support
  hasConditions?: string;
  conditions?: any; // Replaced JSON string with native array/object support
  otherConditions?: string;
  hasMedications?: string;
  medications?: any; // Replaced JSON string with native array/object support
  hasSurgeries?: string;
  surgeries?: string;
  familyHistory?: any; // Replaced JSON string with native array/object support
  familyHistoryNotes?: string;
  pastTraumaHistory?: any;
  pastTraumaNotes?: string;
  gynHistory?: any;
  obsHistory?: any;
  photo?: string;
  signature?: string;
  consentTreatment?: boolean;
  consentPrivacy?: boolean;
  consentFinancial?: boolean;
  communication?: any; // Replaced JSON string with native object support
  lastVisit: string;
  status: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
  labResults?: any; // Native array of lab results
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
  reminderSent?: number; // 0 for false, 1 for true
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

// --- Professional Medication Schema ---

export interface ClinicalDraft {
  id?: string;
  localId?: number;
  patientId: string;
  type: string;
  content: any;
  lastModified: number;
}

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
  code?: string;
  description?: string;
  notes?: string;
  reasoning?: string;
  symptoms?: string[];
  examFindings?: string[];
  labResults?: string[];
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
  glucose?: number; // RBS/FBS
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

export interface PharmacyInventoryItem {
  id?: string;
  localId?: number;
  medicationName: string;
  category?: string;
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface PharmacyBatch {
  id?: string;
  localId?: number;
  inventoryItemId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface Notification {
  id?: string;
  localId?: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'appointment' | 'lab' | 'prescription' | 'system' | 'patient' | 'pharmacy';
  isRead: number; // 0 for false, 1 for true
  link?: string;
  createdAt: number;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface User {
  id?: string;
  localId?: number;
  name: string;
  email: string;
  role: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin';
  clinicId?: string;
  status?: string;
  phone?: string;
  department?: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface LabRequest {
  id?: string;
  localId?: number;
  patientId: string;
  patientName: string;
  clinicId: string; // Add this
  tests: any[]; // Native array of tests
  priority: 'standard' | 'urgent';
  physician: string;
  requestDate: string;
  status: 'pending' | 'collecting' | 'processing' | 'reviewing' | 'completed';
  clinicalInfo: string;
  notes: string;
  results?: any[]; // Native array of results
  aiAnalysis?: string;
  signature?: string;
  uploadedLabUrl?: string;
  notifyPatient: boolean;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface AuditLog {
  id?: string;
  localId?: number;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  timestamp: number;
}

export interface Backup {
  id?: number;
  timestamp: number;
  data: string; // JSON string of the entire DB
  size: number;
}

export interface Template {
  id?: string;
  localId?: number;
  userId?: string; // Personal templates
  name: string;
  category: 'physical_exam' | 'diagnosis_reasoning' | 'soap_note' | 'lab_request';
  content: any;
  lastModified: number;
}

export interface InternalMessage {
  id?: string;
  localId?: number;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId?: string;
  receiverRole?: 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin' | 'all';
  content: string;
  type: 'chat' | 'handover';
  patientId?: string;
  patientName?: string;
  isRead: number;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  patientId?: string;
  timestamp: number;
}

export interface KnowledgeArticle {
  id?: number;
  term: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
  category?: string;
  lastUpdated: number;
}

export interface TreatmentProtocol {
  id?: number;
  condition: string;
  category: string;
  firstLine: string[];
  secondLine: string[];
  monitoring: string[];
  lifestyle: string[];
  clinicalPearls: string;
  lastUpdated: number;
}

export interface LabReference {
  id?: number;
  name: string;
  category: string;
  normalRange: string;
  unit: string;
  description: string;
  clinicalSignificance?: string;
  highCauses?: string[];
  lowCauses?: string[];
  recommendations?: string;
  lastUpdated: number;
}

export interface PatientNote {
  id?: string;
  localId?: number;
  patientId: string;
  title: string;
  content: string;
  category: 'clinical' | 'ai-insight' | 'follow-up' | 'other';
  authorId?: string;
  authorName?: string;
  date: string;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface MentalHealthAssessment {
  id?: string;
  localId?: number;
  patientId: string;
  type: 'PHQ-9' | 'GAD-7';
  scores: Record<string, number>;
  totalScore: number;
  interpretation: string;
  date: string;
  lastModified: number;
  isDeleted: number;
}

export interface ObstetricRecord {
  id?: string;
  localId?: number;
  patientId: string;
  lmp?: string;
  edd?: string;
  ultrasoundDate?: string;
  gestationalAge?: string;
  milestones?: any; // JSON string
  notes?: string;
  date: string;
  lastModified: number;
  isDeleted: number;
}

export interface Task {
  id?: string;
  localId?: number;
  title: string;
  description?: string;
  dueDate: string;
  status: 'pending' | 'completed';
  type: 'follow-up' | 'lab-review' | 'outreach' | 'other';
  priority?: 'high' | 'medium' | 'low';
  patientId?: string;
  patientName?: string;
  assignedTo?: string;
  createdAt: number;
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface SyncEvent {
  id?: number;
  eventId: string;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
  userId: string;
}

export class AppDatabase extends Dexie {
  patients!: Table<PatientRecord>;
  appointments!: Table<Appointment>;
  prescriptions!: Table<Prescription>;
  prescription_items!: Table<PrescriptionItem>;
  diagnoses!: Table<Diagnosis>;
  lab_results!: Table<LabResult>;
  lab_requests!: Table<LabRequest>;
  users!: Table<User>;
  vitals!: Table<Vitals>;
  physical_exams!: Table<PhysicalExamRecord>;
  pharmacy_inventory!: Table<PharmacyInventoryItem>;
  notifications!: Table<Notification>;
  audit_logs!: Table<AuditLog>;
  sync_events!: Table<SyncEvent>;
  backups!: Table<Backup>;
  templates!: Table<Template>;
  chat_messages!: Table<ChatMessage>;
  tasks!: Table<Task>;
  mental_health_assessments!: Table<MentalHealthAssessment>;
  obstetric_records!: Table<ObstetricRecord>;
  pharmacy_batches!: Table<PharmacyBatch>;
  internal_messages!: Table<InternalMessage>;
  clinical_drafts!: Table<ClinicalDraft>;
  
  // Knowledge Base Tables
  knowledge_encyclopedia!: Table<KnowledgeArticle>;
  knowledge_protocols!: Table<TreatmentProtocol>;
  knowledge_labs!: Table<LabReference>;
  patient_notes!: Table<PatientNote>;
  
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

  constructor(options?: { indexedDB?: any; IDBKeyRange?: any }) {
    super('MedicalAppDB', options);
    this.version(19).stores({
      patients: '++localId, id, name, lastModified, isDeleted, isSynced',
      appointments: '++localId, id, patientId, date, lastModified, isDeleted, isSynced',
      prescriptions: '++localId, id, patientId, lastModified, isDeleted, isSynced',
      prescription_items: '++localId, id, prescriptionId',
      diagnoses: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      lab_results: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      lab_requests: '++localId, id, patientId, status, lastModified, isDeleted, isSynced',
      users: '++localId, id, email, role, lastModified, isDeleted, isSynced',
      vitals: '++localId, id, patientId, appointmentId, lastModified, isDeleted, isSynced',
      physical_exams: '++localId, id, patientId, status, lastModified, isDeleted, isSynced',
      pharmacy_inventory: '++localId, id, medicationName, lastModified, isDeleted, isSynced',
      pharmacy_batches: '++localId, id, inventoryItemId, batchNumber, expiryDate, isDeleted',
      notifications: '++localId, id, type, category, isRead, createdAt, lastModified, isDeleted, isSynced',
      audit_logs: '++localId, id, userId, timestamp',
      sync_events: '++id, eventId, entityType, entityId, timestamp',
      backups: '++id, timestamp',
      templates: '++localId, id, category, userId, lastModified',
      chat_messages: 'id, patientId, timestamp',
      tasks: '++localId, id, patientId, status, type, dueDate, lastModified, isDeleted, isSynced',
      mental_health_assessments: '++localId, id, patientId, type, date, isDeleted',
      obstetric_records: '++localId, id, patientId, date, isDeleted',
      internal_messages: '++localId, id, senderId, receiverId, receiverRole, type, patientId, createdAt',
      clinical_drafts: '++localId, id, patientId, type, lastModified',
      
      // Knowledge Base
      knowledge_encyclopedia: '++id, term, category',
      knowledge_protocols: '++id, condition, category',
      knowledge_labs: '++id, name, category',

      patient_notes: '++localId, id, patientId, category, date, lastModified, isDeleted, isSynced',

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

    // All collections to replicate to Firestore
    const tablesToReplicate = [
      'patients', 'appointments', 'prescriptions', 'prescription_items', 
      'diagnoses', 'lab_results', 'lab_requests', 'vitals', 'physical_exams', 
      'pharmacy_inventory', 'pharmacy_batches', 'notifications', 'templates', 
      'tasks', 'mental_health_assessments', 'obstetric_records', 
      'internal_messages', 'clinical_drafts', 'patient_notes', 'chat_messages'
    ];

    const getClinicId = () => {
      try {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
          const profile = JSON.parse(saved);
          return profile.clinicId || 'clinic_a';
        }
      } catch (e) {
        console.warn('Failed to parse user_profile for clinicId', e);
      }
      return 'clinic_a';
    };

    const getCurrentUser = () => {
      try {
        const saved = localStorage.getItem('user_profile');
        if (saved) {
          try {
            const profile = JSON.parse(saved);
            return profile.email || 'system';
          } catch (e) {
            console.warn('Failed to parse user_profile for audit', e);
            return 'system';
          }
        }
      } catch (e) {
        console.error('Failed to get user for audit', e);
      }
      return 'system';
    };

    tablesToReplicate.forEach(tableName => {
      const table = (this as any)[tableName] as Table;
      if (!table) return;

      table.hook('creating', (primKey: any, obj: any) => {
        if (isSyncingFromFirestore.value > 0) return;

        // Ensure global id
        if (!obj.id) {
          obj.id = crypto.randomUUID();
        }
        // Ensure clinicId
        if (!obj.clinicId) {
          obj.clinicId = getClinicId();
        }
        // Ensure modified dates
        obj.lastModified = obj.lastModified || Date.now();
        obj.isSynced = 1;

        Dexie.ignoreTransaction(async () => {
          try {
            // Replicate to audit logs locally
            await this.audit_logs.add({
              userId: getCurrentUser(),
              action: 'create',
              entity: tableName,
              entityId: String(obj.id),
              timestamp: Date.now()
            });
          } catch (err: any) {
            console.error('Audit log failed (create):', err);
            if (err?.name === 'QuotaExceededError' || err?.message?.includes('FILE_ERROR_NO_SPACE') || err?.message?.includes('QuotaExceeded')) {
              switchToFake();
            }
          }

          try {
            // Sanitize object for Firestore (replace undefined with null)
            const sanitizedObj = Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [key, value === undefined ? null : value])
            );

            // Write directly to Firestore (utilizing native offline cache)
            const docId = obj.id;
            const docRef = doc(firestoreDb, tableName, docId);
            await setDoc(docRef, sanitizedObj);
          } catch (e) {
            console.warn(`Firestore background replication error (${tableName}):`, e);
          }
        });
      });

      table.hook('updating', (modifications: any, primKey: any, obj: any) => {
        if (isSyncingFromFirestore.value > 0) return;

        const updatedObj = { ...obj, ...modifications };
        updatedObj.lastModified = Date.now();
        updatedObj.isSynced = 1;
        
        // Ensure clinicId exists
        if (!updatedObj.clinicId) {
          updatedObj.clinicId = getClinicId();
        }

        Dexie.ignoreTransaction(async () => {
          try {
            await this.audit_logs.add({
              userId: getCurrentUser(),
              action: 'update',
              entity: tableName,
              entityId: String(obj.id || primKey),
              timestamp: Date.now()
            });
          } catch (err: any) {
            console.error('Audit log failed (update):', err);
            if (err?.name === 'QuotaExceededError' || err?.message?.includes('FILE_ERROR_NO_SPACE') || err?.message?.includes('QuotaExceeded')) {
              switchToFake();
            }
          }

          try {
            // Sanitize object for Firestore (replace undefined with null)
            const sanitizedObj = Object.fromEntries(
              Object.entries(updatedObj).map(([key, value]) => [key, value === undefined ? null : value])
            );

            const docId = obj.id || String(primKey);
            const docRef = doc(firestoreDb, tableName, docId);
            await setDoc(docRef, sanitizedObj);
          } catch (e) {
            console.warn(`Firestore background replication update error (${tableName}):`, e);
          }
        });
      });

      table.hook('deleting', (primKey: any, obj: any) => {
        if (isSyncingFromFirestore.value > 0) return;

        Dexie.ignoreTransaction(async () => {
          try {
            await this.audit_logs.add({
              userId: getCurrentUser(),
              action: 'delete',
              entity: tableName,
              entityId: String(obj?.id || primKey),
              timestamp: Date.now()
            });
          } catch (err: any) {
            console.error('Audit log failed (delete):', err);
            if (err?.name === 'QuotaExceededError' || err?.message?.includes('FILE_ERROR_NO_SPACE') || err?.message?.includes('QuotaExceeded')) {
              switchToFake();
            }
          }

          try {
            const docId = obj?.id || String(primKey);
            const docRef = doc(firestoreDb, tableName, docId);
            await deleteDoc(docRef);
          } catch (e) {
            console.warn(`Firestore background replication delete error (${tableName}):`, e);
          }
        });
      });
    });

    this.on('blocked', () => {
      console.warn('Dexie database is blocked by another tab');
    });

    this.on('ready', () => {
      console.log('Dexie database is ready');
      // Seed default patients if database is empty
      setTimeout(async () => {
        try {
          const count = await this.patients.count();
          if (count === 0) {
            console.log('Clinic database is empty. Seeding initial patient profiles for clinical reference...');
            const seedPatients = [
              {
                id: "P-1001",
                name: "Sarah Johnson",
                firstName: "Sarah",
                lastName: "Johnson",
                dob: "1985-04-12",
                age: 39,
                nationalId: "NID-850412-98",
                email: "sarah.j@gmail.com",
                phone: "+1 (555) 123-4567",
                address: "123 Elm Street, Metropolis",
                gender: "female",
                bloodType: "O+",
                hasConditions: "yes",
                conditions: ["Hypertension", "Asthma"],
                otherConditions: "",
                hasAllergies: "yes",
                allergies: [{ id: 1, name: "Penicillin", severity: "Severe" }],
                hasMedications: "yes",
                medications: [{ id: 1, name: "Lisinopril", dosage: "10mg", frequency: "Daily" }, { id: 2, name: "Albuterol inhaler", dosage: "90mcg", frequency: "As needed" }],
                hasSurgeries: "yes",
                surgeries: "Appendectomy (2015)",
                familyHistory: [{ id: 1, relation: "Mother", condition: "Breast Cancer", age: "52" }],
                familyHistoryNotes: "Maternal side has strong history of cardiovascular disease.",
                gynHistory: {
                  menarcheAge: "12",
                  lmp: "2026-05-20",
                  cycleRegularity: "Regular",
                  cycleLength: "28",
                  contraception: "Oral Contraceptive Pill",
                  papSmear: "Normal",
                  papNotes: "Last smear in May 2025"
                },
                obsHistory: {
                  gravidity: "2",
                  parity: "2",
                  term: "2",
                  preterm: "0",
                  abortions: "0",
                  living: "2",
                  modeOfDelivery: "Vaginal",
                  complicationNotes: "None"
                },
                lastVisit: "2023-10-15",
                status: "Stable",
                lastModified: Date.now(),
                isDeleted: 0,
                isSynced: 0,
                clinicId: "clinic_a"
              },
              {
                id: "P-1002",
                name: "Michael Chen",
                firstName: "Michael",
                lastName: "Chen",
                dob: "1972-11-08",
                age: 51,
                nationalId: "NID-721108-41",
                email: "m.chen@yahoo.com",
                phone: "+1 (555) 987-6543",
                address: "456 Oak Lane, Metropolis",
                gender: "male",
                bloodType: "A-",
                hasConditions: "yes",
                conditions: ["Hypertension"],
                otherConditions: "Mild hyperlipidemia managed by diet",
                hasAllergies: "no",
                allergies: [],
                hasMedications: "yes",
                medications: [{ id: 1, name: "Amlodipine", dosage: "5mg", frequency: "Daily" }],
                hasSurgeries: "no",
                surgeries: "None",
                familyHistory: [{ id: 1, relation: "Father", condition: "Hypertension", age: "65" }],
                familyHistoryNotes: "Paternal history of high blood pressure.",
                lastVisit: "2023-11-02",
                status: "Stable",
                lastModified: Date.now(),
                isDeleted: 0,
                isSynced: 0,
                clinicId: "clinic_a"
              },
              {
                id: "P-1003",
                name: "Emily Davis",
                firstName: "Emily",
                lastName: "Davis",
                dob: "1990-08-24",
                age: 33,
                nationalId: "NID-900824-32",
                email: "emily.davis@outlook.com",
                phone: "+1 (555) 456-7890",
                address: "789 Pine Road, Metropolis",
                gender: "female",
                bloodType: "A+",
                hasConditions: "yes",
                conditions: ["Diabetes", "Thyroid Disorder"],
                otherConditions: "",
                hasAllergies: "yes",
                allergies: [{ id: 1, name: "Sulfa Drugs", severity: "Moderate" }],
                hasMedications: "yes",
                medications: [{ id: 1, name: "Metformin", dosage: "500mg", frequency: "Daily" }, { id: 2, name: "Levothyroxine", dosage: "50mcg", frequency: "Daily" }],
                hasSurgeries: "yes",
                surgeries: "Gallbladder removal (2021)",
                familyHistory: [{ id: 1, relation: "Father", condition: "Type 2 Diabetes", age: "48" }],
                familyHistoryNotes: "Father and grandfather both have Type 2 Diabetes.",
                gynHistory: {
                  menarcheAge: "13",
                  lmp: "2026-05-15",
                  cycleRegularity: "Irregular",
                  cycleLength: "35",
                  contraception: "IUD",
                  papSmear: "Normal",
                  papNotes: ""
                },
                obsHistory: {
                  gravidity: "3",
                  parity: "2",
                  term: "1",
                  preterm: "1",
                  abortions: "1",
                  living: "2",
                  modeOfDelivery: "C-Section",
                  complicationNotes: "Preeclampsia during second pregnancy"
                },
                lastVisit: "2023-09-28",
                status: "Stable",
                lastModified: Date.now(),
                isDeleted: 0,
                isSynced: 0,
                clinicId: "clinic_a"
              },
              {
                id: "P-1004",
                name: "James Wilson",
                firstName: "James",
                lastName: "Wilson",
                dob: "1965-02-15",
                age: 59,
                nationalId: "NID-650215-77",
                email: "jwilson@gmail.com",
                phone: "+1 (555) 321-0987",
                address: "101 Maple Avenue, Metropolis",
                gender: "male",
                bloodType: "O-",
                hasConditions: "yes",
                conditions: ["Heart Disease"],
                otherConditions: "Mild osteoarthritis of the knee",
                hasAllergies: "yes",
                allergies: [{ id: 1, name: "Aspirin", severity: "Moderate" }],
                hasMedications: "yes",
                medications: [{ id: 1, name: "Atorvastatin", dosage: "20mg", frequency: "Daily" }],
                hasSurgeries: "yes",
                surgeries: "Knee Arthroscopy (2018)",
                familyHistory: [{ id: 1, relation: "Father", condition: "Myocardial Infarction", age: "58" }],
                familyHistoryNotes: "Paternal line has premature coronary artery disease.",
                lastVisit: "2023-11-10",
                status: "Stable",
                lastModified: Date.now(),
                isDeleted: 0,
                isSynced: 0,
                clinicId: "clinic_a"
              },
              {
                id: "P-1005",
                name: "Maria Garcia",
                firstName: "Maria",
                lastName: "Garcia",
                dob: "1988-06-30",
                age: 35,
                nationalId: "NID-880630-15",
                email: "maria.g@gmail.com",
                phone: "+1 (555) 789-0123",
                address: "202 Cedar Way, Metropolis",
                gender: "female",
                bloodType: "B+",
                hasConditions: "yes",
                conditions: ["Depression/Anxiety"],
                otherConditions: "",
                hasAllergies: "no",
                allergies: [],
                hasMedications: "yes",
                medications: [{ id: 1, name: "Sertraline", dosage: "50mg", frequency: "Daily" }],
                hasSurgeries: "no",
                surgeries: "None",
                familyHistory: [],
                familyHistoryNotes: "",
                gynHistory: {
                  menarcheAge: "12",
                  lmp: "2026-05-28",
                  cycleRegularity: "Regular",
                  cycleLength: "28",
                  contraception: "None",
                  papSmear: "Normal"
                },
                obsHistory: {
                  gravidity: "1",
                  parity: "1",
                  term: "1",
                  preterm: "0",
                  abortions: "0",
                  living: "1",
                  modeOfDelivery: "Vaginal"
                },
                lastVisit: "2023-10-05",
                status: "Stable",
                lastModified: Date.now(),
                isDeleted: 0,
                isSynced: 0,
                clinicId: "clinic_a"
              }
            ];
            await this.patients.bulkPut(seedPatients);
            console.log('Successfully seeded default patients into database!');
          }
        } catch (e) {
          console.error('Failed to seed default patients', e);
        }
      }, 500);
    });

    // Try to open the database and handle errors manually on instantiation
  }

  // Override open to catch backing store or iframe-sandboxed IndexedDB errors, and retry on the fallback database
  override open(): any {
    return super.open().catch((err: any) => {
      console.warn('AppDatabase.open() failed, redirecting to in-memory fallback DB:', err);
      switchToFake();
      return activeDbInstance.open().catch((fallbackErr: any) => {
        console.warn('Fallback in-memory DB open failed:', fallbackErr);
      });
    });
  }
}

let useFakeDefault = false;
try {
  if (typeof window !== 'undefined') {
    // 1. Check if sessionStorage is blocked entirely (throws SecurityError on access)
    // 2. Or check if we have already flagged IndexedDB as failed in sessionStorage
    if (!window.sessionStorage) {
      useFakeDefault = true;
    } else if (window.sessionStorage.getItem('indexedDB_failed') === 'true') {
      useFakeDefault = true;
    }
  }
} catch (e) {
  // If accessing sessionStorage throws a SecurityError, we are almost certainly inside a strict sandbox where native storage is disabled
  useFakeDefault = true;
}

let activeDbInstance: AppDatabase;
let isFallbackActive = false;

function switchToFake() {
  if (isFallbackActive) return;
  isFallbackActive = true;
  console.warn('Switching activeDbInstance to fakeIndexedDB (in-memory fallback database).');
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('indexedDB_failed', 'true');
    }
  } catch (e) {}

  const fallbackDb = new AppDatabase({
    indexedDB: fakeIndexedDB,
    IDBKeyRange: FDBKeyRange
  });
  activeDbInstance = fallbackDb;
}

if (useFakeDefault) {
  console.log('Skipping standard IndexedDB on load due to detected sandbox restrictions or previous failure.');
  activeDbInstance = new AppDatabase({
    indexedDB: fakeIndexedDB,
    IDBKeyRange: FDBKeyRange
  });
  isFallbackActive = true;
} else {
  activeDbInstance = new AppDatabase();
}

// Perform a proactive background probe of standard IndexedDB
if (!useFakeDefault && typeof window !== 'undefined' && window.indexedDB) {
  try {
    const probeRequest = window.indexedDB.open('MedicalAppDB_probe', 1);
    probeRequest.onerror = (event) => {
      console.warn('Asynchronous IndexedDB probe failed. Switching fallback on background.');
      switchToFake();
    };
    probeRequest.onsuccess = () => {
      try {
        const pDb = probeRequest.result;
        pDb.close();
        window.indexedDB.deleteDatabase('MedicalAppDB_probe');
      } catch (e) {}
    };
  } catch (e) {
    console.warn('Synchronous throw during IndexedDB probe. Switching fallback.');
    switchToFake();
  }
}

// Also trigger open on the active instance to let the override handle anything that slips through
activeDbInstance.open().catch((err: any) => {
  console.warn('Initial database open failed outside normal path:', err);
});

export const db = new Proxy({}, {
  get(target, prop) {
    const val = Reflect.get(activeDbInstance, prop);
    if (typeof val === 'function') {
      return val.bind(activeDbInstance);
    }
    return val;
  },
  set(target, prop, value) {
    return Reflect.set(activeDbInstance, prop, value);
  }
}) as unknown as AppDatabase;
