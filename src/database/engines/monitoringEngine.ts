import { findClinicalMedicationByName } from '../medications';
import { MonitoringRequirements } from '../types/medication';

export interface LabMonitoringRequirement {
  medicationName: string;
  baselineLabs: string[];
  ongoingLabs: string[];
  frequency: string;
  clinicalAction: string;
}

export function getMonitoringRequirements(medicationName: string): LabMonitoringRequirement | undefined {
  const med = findClinicalMedicationByName(medicationName);
  if (!med) return undefined;

  const monitoring: MonitoringRequirements = med.monitoring || {
    baseline: ['Renal Function (eGFR / Serum Creatinine)', 'Liver Function Tests (ALT / AST)'],
    during: ['Serum Creatinine', 'Serum Electrolytes'],
    frequency: 'Baseline and periodically during therapy'
  };

  let clinicalAction = 'Review lab values prior to initiation and recheck as clinically indicated.';
  const lowerName = med.generic_name.toLowerCase();

  if (lowerName.includes('metformin')) {
    clinicalAction = 'Monitor eGFR annually (or q3-6m if eGFR <60). Check Vitamin B12 every 2-3 years.';
  } else if (lowerName.includes('enalapril') || lowerName.includes('lisinopril') || lowerName.includes('ramipril')) {
    clinicalAction = 'Recheck Serum Creatinine and Potassium 1-2 weeks post-initiation or titration. Hold if K+ > 5.5 mEq/L.';
  } else if (lowerName.includes('atorvastatin') || lowerName.includes('lipitor')) {
    clinicalAction = 'Check lipid panel 4-12 weeks post-initiation. Check ALT/AST if symptoms of hepatotoxicity occur.';
  } else if (lowerName.includes('furosemide') || lowerName.includes('lasix')) {
    clinicalAction = 'Monitor Potassium and Sodium weekly during titration. Maintain K+ between 4.0 - 5.0 mEq/L.';
  } else if (lowerName.includes('warfarin')) {
    clinicalAction = 'Target INR 2.0 - 3.0. Check INR every 3-7 days during initiation, then monthly when stable.';
  }

  return {
    medicationName: med.generic_name,
    baselineLabs: monitoring.baseline,
    ongoingLabs: monitoring.during,
    frequency: monitoring.frequency,
    clinicalAction
  };
}

export function evaluatePatientMonitoringPlan(medicationNames: string[]): LabMonitoringRequirement[] {
  if (!medicationNames || medicationNames.length === 0) return [];
  const plan: LabMonitoringRequirement[] = [];

  for (const name of medicationNames) {
    const req = getMonitoringRequirements(name);
    if (req) {
      plan.push(req);
    }
  }

  return plan;
}
