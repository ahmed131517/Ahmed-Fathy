import { Symptom } from '@/lib/SymptomContext';
import { Diagnosis } from '@/data/diagnosisMappings';
import { Patient } from '@/data/patients';

// Advanced clinical logic engine implementing LR weighting and demographic adjustment
export function calculateWeightedConfidence(
  diag: Diagnosis,
  symptoms: Symptom[],
  patient?: Patient,
  durationDays?: number
): number {
  // 1. Establish Baseline Prevalence Score
  let prevalenceMultiplier = 1.0;
  if (patient) {
    const p = patient as any; 
    diag.demographicPrevalence?.forEach(ctx => {
      let applies = true;
      if (ctx.ageRange && (patient.age < ctx.ageRange[0] || patient.age > ctx.ageRange[1])) applies = false;
      if (ctx.sex && (patient.gender !== ctx.sex)) applies = false;
      
      const chronicConditions = p.chronicConditions || [];
      if (ctx.chronicConditions && !ctx.chronicConditions.some(c => chronicConditions.some((pc: string) => pc.toLowerCase().includes(c.toLowerCase())))) applies = false;
      
      if (applies) {
        prevalenceMultiplier *= ctx.weight;
      }
    });

    // Association Mapping: Labs
    if (diag.associatedLabs && p.labResults) {
      diag.associatedLabs.forEach(assoc => {
        const matchingLab = p.labResults.find((l: any) => l.labName === assoc.labName && l.range === assoc.range);
        if (matchingLab) {
          prevalenceMultiplier *= assoc.weight;
        }
      });
    }

    // Temporal Trending: Duration
    if (durationDays !== undefined && diag.chronicity) {
      const isChronicDuration = durationDays > 90; // 3 months
      if (diag.chronicity === 'Acute' && isChronicDuration) {
        prevalenceMultiplier *= 0.2; // Massive penalty for acute condition in chronic timeframe
      } else if (diag.chronicity === 'Chronic' && !isChronicDuration) {
        prevalenceMultiplier *= 0.8; // Minor penalty for chronic condition in acute timeframe (could be early presentation)
      }
    }
  }

  const basePrevalence = (diag.prevalenceScore || 5) * prevalenceMultiplier;
  
  // 2. Likelihood Ratio (LR) Adjustment
  // We use a simplified Bayesian approach: Odds_post = Odds_pre * LR
  let clinicalScore = basePrevalence * 8; // Scaled base
  let pathognomonicFound = false;

  if (diag.likelihoodRatios && diag.likelihoodRatios.length > 0) {
    diag.likelihoodRatios.forEach(lr => {
      const isPresent = symptoms.some(s => s.id === lr.symptomId);
      if (isPresent) {
        if (lr.isPathognomonic) {
          pathognomonicFound = true;
        }
        clinicalScore *= lr.lrPositive;
      } else {
        clinicalScore *= lr.lrNegative;
      }
    });
  } else {
    // 3. Fallback to basic match ratio if no specific LR data exists
    const matchedSymptoms = diag.commonSymptoms.filter(sId => symptoms.some(s => s.id === sId));
    const matchRatio = matchedSymptoms.length / Math.max(diag.commonSymptoms.length, 1);
    clinicalScore = (matchRatio * 70) + (basePrevalence * 3);
  }

  // 4. Overrides & Final Normalization
  if (pathognomonicFound) return 98; // High confidence for pathognomonic signs

  // Penalize missing common symptoms if they are not specifically handled by LRs
  const missingCount = diag.commonSymptoms.filter(sId => !symptoms.some(s => s.id === sId)).length;
  const penalty = Math.min(missingCount * 5, 40);

  let finalScore = clinicalScore - penalty;

  // Range normalization for non-pathognomonic
  return Math.max(Math.min(finalScore, 95), 5);
}
