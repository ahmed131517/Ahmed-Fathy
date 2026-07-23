import { db, PatientRecord } from '../lib/db';
import { Patient } from '../data/patients';

/**
 * PatientService encapsulates data access and transformation for patient records.
 * Provides a clean interface between the UI and the underlying local/remote databases.
 */

const safeParse = (data: any, defaultValue: any = []) => {
  if (!data) return defaultValue;
  if (typeof data !== 'string') return data;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    if (typeof data === 'string' && data.trim()) {
      return [data.trim()];
    }
    return defaultValue;
  }
};

const safeParseObject = (data: any, defaultValue: any = null) => {
  if (!data) return defaultValue;
  if (typeof data !== 'string') return data;
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (e) {
    return defaultValue;
  }
};

const mapToUIPatient = (p: PatientRecord): Patient => ({
    id: p.id || String(p.localId),
    mrn: p.nationalId || p.id || String(p.localId),
    name: p.name,
    firstName: p.firstName || p.name.split(' ')[0],
    lastName: p.lastName || p.name.split(' ').slice(1).join(' '),
    age: p.age,
    dob: p.dob,
    gender: p.gender,
    phone: p.phone,
    bloodType: p.bloodType,
    lastVisit: p.lastVisit,
    status: p.status,
    photo: p.photo,
    allergies: safeParse(p.allergies),
    chronicConditions: safeParse(p.conditions),
    medications: safeParse(p.medications),
    surgeries: safeParse(p.surgeries),
    familyHistory: safeParse(p.familyHistory),
    familyHistoryNotes: p.familyHistoryNotes,
    otherConditions: p.otherConditions,
    gynHistory: safeParseObject(p.gynHistory, null),
    obsHistory: safeParseObject(p.obsHistory, null),
    labResults: safeParse(p.labResults)
});

export const PatientService = {
  /**
   * Fetches all active patients and maps them to the UI format.
   */
  async getAllPatients(): Promise<Patient[]> {
    const patients = await db.patients.where('isDeleted').equals(0).toArray();
    const mapped = patients.map(mapToUIPatient);
    const seen = new Set<string>();
    return mapped.filter(p => {
      const id = p.id;
      if (!id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  },

  /**
   * Fetches a single patient by ID.
   * Supports both UUID (remote) and localId (numeric).
   */
  async getPatientById(id: string): Promise<Patient | null> {
    console.log("PatientService: lookup id:", id);
    // 1. Try to find by UUID (remote ID)
    let patient = await db.patients.where('id').equals(id).first();
    console.log("PatientService: Found by UUID:", !!patient);
    
    // 2. If not found, try to find by numeric localId
    if (!patient) {
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        patient = await db.patients.where('localId').equals(numericId).first();
      }
      console.log("PatientService: Found by localId:", !!patient);
    }
    
    return patient ? mapToUIPatient(patient) : null;
  }
};
