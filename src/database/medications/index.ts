import { ClinicalMedication } from '../types/medication';
import { ANTIBIOTICS_DATABASE } from './antibiotics';
import { CARDIOLOGY_DATABASE } from './cardiology';
import { ENDOCRINOLOGY_DATABASE } from './endocrinology';
import { GASTRO_DATABASE } from './gastro';
import { NEPHROLOGY_DATABASE } from './nephrology';
import { NEUROLOGY_DATABASE } from './neurology';

export const CLINICAL_KNOWLEDGE_BASE: ClinicalMedication[] = [
  ...ANTIBIOTICS_DATABASE,
  ...CARDIOLOGY_DATABASE,
  ...ENDOCRINOLOGY_DATABASE,
  ...GASTRO_DATABASE,
  ...NEPHROLOGY_DATABASE,
  ...NEUROLOGY_DATABASE
];

export function findClinicalMedicationByName(query: string): ClinicalMedication | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return CLINICAL_KNOWLEDGE_BASE.find(m => 
    m.generic_name.toLowerCase().includes(q) ||
    m.brand_names.some(b => b.toLowerCase().includes(q)) ||
    (m.egyptian_brands && m.egyptian_brands.some(eb => eb.brand_name.toLowerCase().includes(q)))
  );
}

export function getClinicalMedicationsByClass(drugClass: string): ClinicalMedication[] {
  if (!drugClass) return [];
  const q = drugClass.toLowerCase();
  return CLINICAL_KNOWLEDGE_BASE.filter(m => m.Drug_Class.toLowerCase().includes(q));
}
