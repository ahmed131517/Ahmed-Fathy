import { findClinicalMedicationByName } from '../medications';
import { calculateCockcroftGault, calculateChildPugh, CockcroftGaultResult, ChildPughResult } from '../calculators/clinicalCalculators';

export interface RenalHepaticEvaluationInput {
  medicationName: string;
  age?: number;
  weightKg?: number;
  serumCreatinineMgDl?: number;
  sex?: 'male' | 'female';
  totalBilirubinMgDl?: number;
  serumAlbuminGDl?: number;
  inr?: number;
  ascites?: 'none' | 'mild' | 'moderate_severe';
  encephalopathy?: 'none' | 'grade_1_2' | 'grade_3_4';
}

export interface RenalHepaticEvaluationResult {
  medicationName: string;
  renalAlert: boolean;
  renalCrCl?: number;
  renalStage?: string;
  recommendedRenalDose?: string;
  
  hepaticAlert: boolean;
  hepaticChildClass?: string;
  recommendedHepaticDose?: string;
  
  summaryGuidance: string[];
}

export function evaluateRenalHepaticDosing(input: RenalHepaticEvaluationInput): RenalHepaticEvaluationResult {
  const {
    medicationName,
    age,
    weightKg,
    serumCreatinineMgDl,
    sex,
    totalBilirubinMgDl,
    serumAlbuminGDl,
    inr,
    ascites,
    encephalopathy
  } = input;

  const med = findClinicalMedicationByName(medicationName);
  const summaryGuidance: string[] = [];

  let renalAlert = false;
  let renalCrCl: number | undefined;
  let renalStage: string | undefined;
  let recommendedRenalDose: string | undefined;

  // 1. Evaluate Renal CrCl if lab parameters provided
  if (age && weightKg && serumCreatinineMgDl && sex) {
    const cgResult: CockcroftGaultResult = calculateCockcroftGault({
      age,
      weightKg,
      serumCreatinineMgDl,
      sex
    });

    renalCrCl = cgResult.crcl;
    renalStage = cgResult.stage;

    if (med && med.renal_adjustment) {
      if (cgResult.crcl < 50 && med.renal_adjustment.required) {
        renalAlert = true;
        summaryGuidance.push(`Renal Impairment Detected (CrCl: ${cgResult.crcl} mL/min): ${med.renal_adjustment.guidance}`);

        if (med.renal_adjustment.doseByCrCl) {
          const matchedDoseRule = med.renal_adjustment.doseByCrCl.find(r => {
            if (cgResult.crcl < 10 && r.crclRange.includes('< 10')) return true;
            if (cgResult.crcl < 30 && (r.crclRange.includes('10–30') || r.crclRange.includes('< 30'))) return true;
            if (cgResult.crcl < 50 && (r.crclRange.includes('30–50') || r.crclRange.includes('30–49'))) return true;
            return false;
          });

          if (matchedDoseRule) {
            recommendedRenalDose = matchedDoseRule.recommendedDose;
          }
        }
      }
    }
  }

  // 2. Evaluate Hepatic Child-Pugh if lab parameters provided
  let hepaticAlert = false;
  let hepaticChildClass: string | undefined;
  let recommendedHepaticDose: string | undefined;

  if (totalBilirubinMgDl && serumAlbuminGDl && inr) {
    const cpResult: ChildPughResult = calculateChildPugh({
      totalBilirubinMgDl,
      serumAlbuminGDl,
      inr,
      ascites: ascites || 'none',
      encephalopathy: encephalopathy || 'none'
    });

    hepaticChildClass = cpResult.class;

    if (cpResult.class === 'Class B' || cpResult.class === 'Class C') {
      hepaticAlert = true;
      if (med && med.hepatic_adjustment) {
        const advice = cpResult.class === 'Class B' ? med.hepatic_adjustment.childPughB : med.hepatic_adjustment.childPughC;
        recommendedHepaticDose = advice;
        summaryGuidance.push(`Hepatic Dysfunction Detected (${cpResult.class}): ${advice}`);
      } else {
        summaryGuidance.push(`Hepatic Dysfunction (${cpResult.class}): Monitor liver enzymes closely.`);
      }
    }
  }

  return {
    medicationName: med ? med.generic_name : medicationName,
    renalAlert,
    renalCrCl,
    renalStage,
    recommendedRenalDose,
    hepaticAlert,
    hepaticChildClass,
    recommendedHepaticDose,
    summaryGuidance
  };
}
