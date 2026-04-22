import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Patient } from '../data/patients';
import { db } from './db';
import { useLiveQuery } from 'dexie-react-hooks';

interface PatientContextType {
  selectedPatient: Patient | null;
  setSelectedPatient: (patient: Patient | null) => void;
  patients: Patient[];
  confirmedDiagnosis: string | null;
  setConfirmedDiagnosis: (diagnosis: string | null) => void;
  isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [confirmedDiagnosis, setConfirmedDiagnosis] = useState<string | null>(null);
  
  // Use Dexie live query to automatically update UI when DB changes
  const patients = useLiveQuery(
    () => db.patients.where('isDeleted').equals(0).toArray(),
    []
  ) || [];

  const [isLoading, setIsLoading] = useState(false);

  // Helper to safely parse JSON strings from DB
  const safeParse = (data: any, defaultValue: any = []) => {
    if (!data) return defaultValue;
    if (typeof data !== 'string') return data;
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.warn('JSON Parse Error:', e, data);
      // If it's a non-empty string but not JSON, wrap it in an array if it looks like a single item
      if (typeof data === 'string' && data.trim()) {
        return [data.trim()];
      }
      return defaultValue;
    }
  };

  // Convert Dexie PatientRecord to UI Patient type
  const uiPatients: Patient[] = useMemo(() => patients.map(p => ({
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
    otherConditions: p.otherConditions
  })), [patients]);

  const contextValue = useMemo(() => ({ 
    selectedPatient, 
    setSelectedPatient, 
    patients: uiPatients, 
    confirmedDiagnosis, 
    setConfirmedDiagnosis,
    isLoading
  }), [selectedPatient, uiPatients, confirmedDiagnosis, isLoading]);

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
