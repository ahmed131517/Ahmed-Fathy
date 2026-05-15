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
    labResults: safeParse(p.labResults)
});

export const PatientService = {
  /**
   * Fetches all active patients and maps them to the UI format.
   */
  async getAllPatients(): Promise<Patient[]> {
    const patients = await db.patients.where('isDeleted').equals(0).toArray();
    return patients.map(mapToUIPatient);
  },

  /**
   * Fetches a single patient by ID.
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const patient = await db.patients.where('id').equals(id).first();
    return patient ? mapToUIPatient(patient) : null;
  }
};
