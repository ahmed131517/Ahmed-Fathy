import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

export type SymptomStatus = 'incomplete' | 'analyzed' | 'red_flag';

export interface Symptom {
  id: string;
  label: string;
  category: string;
  status: SymptomStatus;
  analysisData?: Record<string, string[]>;
  severityTimeline?: { date: string, value: number }[];
  followUpQuestions?: string[];
  reviewNotes?: string;
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

  const addSymptom = useCallback((symptom: Symptom) => {
    setSymptoms(prev => [...prev, symptom]);
  }, []);

  const removeSymptom = useCallback((id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSymptom = useCallback((id: string, updates: Partial<Symptom>) => {
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const contextValue = useMemo(() => ({ 
    symptoms, 
    setSymptoms, 
    addSymptom, 
    removeSymptom, 
    updateSymptom 
  }), [symptoms, addSymptom, removeSymptom, updateSymptom]);

  return (
    <SymptomContext.Provider value={contextValue}>
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
