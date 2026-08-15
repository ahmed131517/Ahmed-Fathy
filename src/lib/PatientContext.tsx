import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Patient } from '../data/patients';
import { PatientService } from '../services/patient.service';
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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(() => {
    const storedId = localStorage.getItem('selectedPatientId');
    return null; // Will initialize after patients list loads
  });

  const [confirmedDiagnosis, setConfirmedDiagnosis] = useState<string | null>(null);

  const patients = useLiveQuery(
    () => PatientService.getAllPatients(),
    []
  ) || [];

  useEffect(() => {
    if (patients.length > 0) {
      const storedId = localStorage.getItem('selectedPatientId');
      if (storedId) {
        const patient = patients.find(p => p.id === storedId);
        if (patient) {
          setSelectedPatient(patient);
          return;
        }
      }
      if (!selectedPatient) {
        setSelectedPatient(patients[0]);
      }
    }
  }, [patients]);

  useEffect(() => {
    if (selectedPatient) {
      localStorage.setItem('selectedPatientId', selectedPatient.id);
    } else {
      localStorage.removeItem('selectedPatientId');
    }
  }, [selectedPatient]);

  const isLoading = patients.length === 0; // Simplified loading state

  const contextValue = useMemo(() => ({ 
    selectedPatient, 
    setSelectedPatient, 
    patients, 
    confirmedDiagnosis, 
    setConfirmedDiagnosis,
    isLoading
  }), [selectedPatient, patients, confirmedDiagnosis, isLoading]);

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
