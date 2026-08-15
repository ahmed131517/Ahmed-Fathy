import { Diagnosis } from '@/data/diagnosisMappings';

export function getCustomDiagnoses(): Diagnosis[] {
  try {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('custom_learned_diagnoses');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveCustomDiagnosis(diag: Diagnosis): void {
  try {
    if (typeof window === 'undefined') return;
    const current = getCustomDiagnoses();
    if (!current.some(d => d.id === diag.id || d.name.toLowerCase() === diag.name.toLowerCase())) {
      const updated = [...current, diag];
      localStorage.setItem('custom_learned_diagnoses', JSON.stringify(updated));
    }
  } catch (e) {
    console.error(e);
  }
}
