/**
 * Clinical Calculator Engine
 * Handles exact clinical mathematical formulas for renal, hepatic, cardiovascular & severity scoring
 */

export interface CockcroftGaultInput {
  age: number;
  weightKg: number;
  serumCreatinineMgDl: number;
  sex: 'male' | 'female';
}

export interface CockcroftGaultResult {
  crcl: number; // mL/min
  stage: string;
  recommendation: string;
}

export function calculateCockcroftGault(input: CockcroftGaultInput): CockcroftGaultResult {
  const { age, weightKg, serumCreatinineMgDl, sex } = input;
  if (!serumCreatinineMgDl || serumCreatinineMgDl <= 0 || !weightKg || !age) {
    return { crcl: 0, stage: 'Unknown', recommendation: 'Insufficient laboratory data' };
  }

  let crcl = ((140 - age) * weightKg) / (72 * serumCreatinineMgDl);
  if (sex === 'female') {
    crcl *= 0.85;
  }

  crcl = Math.round(crcl * 10) / 10;

  let stage = 'Normal (CrCl ≥ 90 mL/min)';
  let recommendation = 'Standard dosing';

  if (crcl < 15) {
    stage = 'End-Stage Renal Disease (CrCl < 15 mL/min)';
    recommendation = 'Avoid or severe dose reduction / dialysis adjustment';
  } else if (crcl < 30) {
    stage = 'Severe Impairment (CrCl 15–29 mL/min)';
    recommendation = 'Significant dose reduction (50% or extend dosing interval)';
  } else if (crcl < 50) {
    stage = 'Moderate Impairment (CrCl 30–49 mL/min)';
    recommendation = 'Moderate dose adjustment (25-50% dose reduction)';
  } else if (crcl < 80) {
    stage = 'Mild Impairment (CrCl 50–79 mL/min)';
    recommendation = 'Minor adjustment may be needed for highly renal-cleared drugs';
  }

  return { crcl, stage, recommendation };
}

export interface ChildPughInput {
  totalBilirubinMgDl: number; // <2 = 1, 2-3 = 2, >3 = 3
  serumAlbuminGDl: number;     // >3.5 = 1, 2.8-3.5 = 2, <2.8 = 3
  inr: number;                 // <1.7 = 1, 1.7-2.3 = 2, >2.3 = 3
  ascites: 'none' | 'mild' | 'moderate_severe'; // 1, 2, 3
  encephalopathy: 'none' | 'grade_1_2' | 'grade_3_4'; // 1, 2, 3
}

export interface ChildPughResult {
  score: number;
  class: 'Class A' | 'Class B' | 'Class C';
  severity: string;
  hepaticDoseAdvice: string;
}

export function calculateChildPugh(input: ChildPughInput): ChildPughResult {
  let score = 0;

  // Bilirubin
  if (input.totalBilirubinMgDl < 2.0) score += 1;
  else if (input.totalBilirubinMgDl <= 3.0) score += 2;
  else score += 3;

  // Albumin
  if (input.serumAlbuminGDl > 3.5) score += 1;
  else if (input.serumAlbuminGDl >= 2.8) score += 2;
  else score += 3;

  // INR
  if (input.inr < 1.7) score += 1;
  else if (input.inr <= 2.3) score += 2;
  else score += 3;

  // Ascites
  if (input.ascites === 'none') score += 1;
  else if (input.ascites === 'mild') score += 2;
  else score += 3;

  // Encephalopathy
  if (input.encephalopathy === 'none') score += 1;
  else if (input.encephalopathy === 'grade_1_2') score += 2;
  else score += 3;

  let childClass: 'Class A' | 'Class B' | 'Class C' = 'Class A';
  let severity = 'Mild hepatic impairment (Well-compensated)';
  let hepaticDoseAdvice = 'No routine dose adjustment required for most hepatically cleared drugs.';

  if (score >= 10) {
    childClass = 'Class C';
    severity = 'Severe hepatic impairment (Decompensated)';
    hepaticDoseAdvice = 'Contraindicated or reduce dose by 50-75%. Close monitoring required.';
  } else if (score >= 7) {
    childClass = 'Class B';
    severity = 'Moderate hepatic impairment';
    hepaticDoseAdvice = 'Reduce dose by 25-50% for hepatically metabolized drugs.';
  }

  return { score, class: childClass, severity, hepaticDoseAdvice };
}

export function calculateBMI(heightCm: number, weightKg: number): { bmi: number; category: string } {
  if (!heightCm || !weightKg) return { bmi: 0, category: 'Unknown' };
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi >= 25 && bmi < 30) category = 'Overweight';
  else if (bmi >= 30) category = 'Obese';

  return { bmi, category };
}

export function calculateBSA(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 1.73; // Standard adult BSA default
  // Mosteller formula: BSA (m²) = sqrt([Height(cm) x Weight(kg)] / 3600)
  return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
}
