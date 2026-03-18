import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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

  // Convert Dexie PatientRecord to UI Patient type
  const uiPatients: Patient[] = patients.map(p => ({
    id: p.id || String(p.localId),
    name: p.name,
    age: p.age,
    gender: p.gender,
    bloodType: p.bloodType,
    lastVisit: p.lastVisit,
    status: p.status,
    allergies: p.allergies
  }));

  return (
    <PatientContext.Provider value={{ 
      selectedPatient, 
      setSelectedPatient, 
      patients: uiPatients, 
      confirmedDiagnosis, 
      setConfirmedDiagnosis,
      isLoading
    }}>
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
