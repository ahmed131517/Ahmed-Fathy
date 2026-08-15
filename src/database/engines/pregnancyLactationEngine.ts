import { findClinicalMedicationByName } from '../medications';

export interface PregnancyEvaluationResult {
  medicationName: string;
  isPregnant: boolean;
  trimester?: 1 | 2 | 3;
  legacyCategory?: string; // Metadata only, e.g. 'A', 'B', 'C', 'D', 'X'
  trimesterAdvice?: string;
  overallRecommendation: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Contraindicated';
  evidenceSummary: string;
}

export interface LactationEvaluationResult {
  medicationName: string;
  isLactating: boolean;
  milkTransfer: string;
  infantRisk: 'Low' | 'Moderate' | 'High' | 'Contraindicated';
  alternativeDrug?: string;
  clinicalAdvice: string;
}

export function evaluatePregnancySafety(medicationName: string, isPregnant: boolean, trimester: 1 | 2 | 3 = 1): PregnancyEvaluationResult {
  const med = findClinicalMedicationByName(medicationName);
  
  if (!isPregnant || !med || !med.Pregnancy) {
    return {
      medicationName: med ? med.generic_name : medicationName,
      isPregnant,
      overallRecommendation: 'No pregnancy safety warnings registered or patient not marked pregnant.',
      riskLevel: 'Low',
      evidenceSummary: 'Standard safety profile.'
    };
  }

  const preg = med.Pregnancy;
  let trimesterAdvice = preg.trimester1;
  if (trimester === 2) trimesterAdvice = preg.trimester2;
  if (trimester === 3) trimesterAdvice = preg.trimester3;

  return {
    medicationName: med.generic_name,
    isPregnant: true,
    trimester,
    legacyCategory: preg.category,
    trimesterAdvice,
    overallRecommendation: preg.recommendation,
    riskLevel: preg.riskLevel,
    evidenceSummary: `Trimester ${trimester} Risk Assessment: ${trimesterAdvice}. Overall Guidance: ${preg.recommendation}`
  };
}

export function evaluateLactationSafety(medicationName: string, isLactating: boolean): LactationEvaluationResult {
  const med = findClinicalMedicationByName(medicationName);

  if (!isLactating || !med || !med.Lactation) {
    return {
      medicationName: med ? med.generic_name : medicationName,
      isLactating,
      milkTransfer: 'Unknown or minimal',
      infantRisk: 'Low',
      clinicalAdvice: 'No lactation precautions required.'
    };
  }

  const lac = med.Lactation;

  return {
    medicationName: med.generic_name,
    isLactating: true,
    milkTransfer: lac.milkTransfer,
    infantRisk: lac.infantRisk,
    alternativeDrug: lac.alternativeDrug,
    clinicalAdvice: lac.advice
  };
}
