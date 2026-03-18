import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SymptomStatus = 'incomplete' | 'analyzed' | 'red_flag';

export interface Symptom {
  id: string;
  label: string;
  category: string;
  status: SymptomStatus;
  analysisData?: Record<string, string[]>;
  severityTimeline?: { date: string, value: number }[];
  followUpQuestions?: string[];
}

interface SymptomContextType {
  symptoms: Symptom[];
  setSymptoms: (symptoms: Symptom[]) => void;
  addSymptom: (symptom: Symptom) => void;
  removeSymptom: (id: string) => void;
  updateSymptom: (id: string, updates: Partial<Symptom>) => void;
}

const SymptomContext = createContext<SymptomContextType | undefined>(undefined);

export function SymptomProvider({ children }: { children: ReactNode }) {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  const addSymptom = (symptom: Symptom) => {
    setSymptoms(prev => [...prev, symptom]);
  };

  const removeSymptom = (id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const updateSymptom = (id: string, updates: Partial<Symptom>) => {
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <SymptomContext.Provider value={{ symptoms, setSymptoms, addSymptom, removeSymptom, updateSymptom }}>
      {children}
    </SymptomContext.Provider>
  );
}

export function useSymptom() {
  const context = useContext(SymptomContext);
  if (context === undefined) {
    throw new Error('useSymptom must be used within a SymptomProvider');
  }
  return context;
}
