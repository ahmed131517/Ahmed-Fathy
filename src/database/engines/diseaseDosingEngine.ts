import { findClinicalMedicationByName } from '../medications';
import { DiseaseDosingRule } from '../types/medication';

export interface DiseaseDosingMatch {
  medicationName: string;
  found: boolean;
  selectedRule?: DiseaseDosingRule;
  availableRules?: DiseaseDosingRule[];
  defaultNote?: string;
}

export function getDiseaseSpecificDosing(medicationName: string, diagnosisQuery?: string): DiseaseDosingMatch {
  const med = findClinicalMedicationByName(medicationName);
  if (!med || !med.disease_dosing || med.disease_dosing.length === 0) {
    return {
      medicationName,
      found: false,
      defaultNote: 'No disease-specific dosing rule registered. Using standard reference dosing.'
    };
  }

  if (diagnosisQuery) {
    const dq = diagnosisQuery.toLowerCase().trim();
    const matchedRule = med.disease_dosing.find(rule => 
      rule.indication.toLowerCase().includes(dq) ||
      (rule.icd10 && rule.icd10.toLowerCase().includes(dq)) ||
      dq.includes(rule.indication.toLowerCase())
    );

    if (matchedRule) {
      return {
        medicationName: med.generic_name,
        found: true,
        selectedRule: matchedRule,
        availableRules: med.disease_dosing
      };
    }
  }

  // Return default first indication rule if no specific query matched
  return {
    medicationName: med.generic_name,
    found: true,
    selectedRule: med.disease_dosing[0],
    availableRules: med.disease_dosing,
    defaultNote: 'Showing primary indication dosing rule.'
  };
}
