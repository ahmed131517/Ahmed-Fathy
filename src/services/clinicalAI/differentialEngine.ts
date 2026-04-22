import { Symptom } from '@/lib/SymptomContext';
import { Diagnosis } from '@/data/diagnosisMappings';
import { Patient } from '@/data/patients';

// Initial probabilistic scoring engine placeholder
export function calculateWeightedConfidence(
  diag: Diagnosis,
  symptoms: Symptom[],
  patient?: Patient
): number {
  // 1. Positive Evidence: Percentage of common symptoms found
  const matchedSymptoms = diag.commonSymptoms.filter(sId => symptoms.some(s => s.id === sId));
  const positiveProbability = (matchedSymptoms.length / diag.commonSymptoms.length);
  
  // Use prevalence score to weight the positive probability
  // Assuming a neutral prevalence of 5
  const prevalenceWeight = (diag.prevalenceScore || 5) / 5;
  const positiveScore = (positiveProbability * prevalenceWeight) * 70;

  // 2. Negative Evidence (Penalty): Missing mandatory or key symptoms
  // For now, penalizing missing symptoms that were not found
  const missingCount = diag.commonSymptoms.filter(sId => !symptoms.some(s => s.id === sId)).length;
  // Penalty of -5 points for every missing key symptom, up to 30 points max
  const negativePenalty = Math.min(missingCount * 5, 30);

  // 3. Clinical Factors (Contextual Boosts)
  let contextBoost = 0;
  if (patient) {
    const hasChronicCondition = patient.chronicConditions.some(c => diag.name.toLowerCase().includes(c.toLowerCase()));
    if (hasChronicCondition) contextBoost += 10;
    if (patient.age > 65 && diag.category === 'Cardiovascular') contextBoost += 10;
  }
  
  const finalScore = positiveScore - negativePenalty + contextBoost;

  return Math.max(Math.min(finalScore, 100), 0);
}
