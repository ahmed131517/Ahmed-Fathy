import Dexie, { type Table } from 'dexie';

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
  lastModified: number;
  isDeleted: number;
  isSynced: number;
}

export interface LabRequest {
  id?: string;
  localId?: number;
  patientId: string;
  patientName: string;
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

  constructor() {
    super('MedicalAppDB');
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

    // Audit and Sync Hooks
    const tablesToAudit = ['patients', 'appointments', 'prescriptions', 'diagnoses', 'lab_results', 'vitals', 'physical_exams'];
    
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

    tablesToAudit.forEach(tableName => {
      const table = (this as any)[tableName] as Table;
      if (!table) return;

      table.hook('creating', (primKey: any, obj: any) => {
        // Use Dexie.ignoreTransaction to safely write outside the current transaction scope
        Dexie.ignoreTransaction(() => {
          this.audit_logs.add({
            userId: getCurrentUser(),
            action: 'create',
            entity: tableName,
            entityId: String(obj.id || primKey || 'new'),
            timestamp: Date.now()
          }).catch(err => console.error('Audit log (creating) failed:', err));
          
          this.sync_events.add({
            eventId: crypto.randomUUID(),
            entityType: tableName,
            entityId: String(obj.id || primKey),
            action: 'CREATE',
            payload: obj,
            timestamp: Date.now(),
            userId: getCurrentUser()
          }).catch(err => console.error('Sync Event log (creating) failed:', err));
        });
      });

      table.hook('updating', (modifications: any, primKey: any, obj: any) => {
        Dexie.ignoreTransaction(() => {
          this.audit_logs.add({
            userId: getCurrentUser(),
            action: 'update',
            entity: tableName,
            entityId: String(obj.id || primKey),
            timestamp: Date.now()
          }).catch(err => console.error('Audit log (updating) failed:', err));

          this.sync_events.add({
            eventId: crypto.randomUUID(),
            entityType: tableName,
            entityId: String(obj.id || primKey),
            action: 'UPDATE',
            payload: modifications,
            timestamp: Date.now(),
            userId: getCurrentUser()
          }).catch(err => console.error('Sync Event log (updating) failed:', err));
        });
      });

      table.hook('deleting', (primKey: any, obj: any) => {
        Dexie.ignoreTransaction(() => {
          this.audit_logs.add({
            userId: getCurrentUser(),
            action: 'delete',
            entity: tableName,
            entityId: String(primKey),
            timestamp: Date.now()
          }).catch(err => console.error('Audit log (deleting) failed:', err));

          this.sync_events.add({
            eventId: crypto.randomUUID(),
            entityType: tableName,
            entityId: String(obj?.id || primKey),
            action: 'DELETE',
            payload: { id: obj?.id || primKey, isDeleted: 1 },
            timestamp: Date.now(),
            userId: getCurrentUser()
          }).catch(err => console.error('Sync Event log (deleting) failed:', err));
        });
      });
    });

    this.on('blocked', () => {
      console.warn('Dexie database is blocked by another tab');
    });

    this.on('ready', () => {
      console.log('Dexie database is ready');
    });

    // Try to open the database and handle errors
    this.open().catch(err => {
      console.error('Failed to open Dexie database:', err);
      if (err.name === 'UnknownError') {
        console.error('IndexedDB Internal Error detected. This may require a browser restart or clearing site data.');
      }
    });
  }
}

export const db = new AppDatabase();
