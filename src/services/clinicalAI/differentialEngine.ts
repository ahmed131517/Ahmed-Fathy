import { Symptom } from '@/lib/SymptomContext';
import { Diagnosis } from '@/data/diagnosisMappings';
import { Patient } from '@/data/patients';
import { findEMRSymptomByTerm, EMR_SYMPTOM_DICTIONARY } from '@/data/emrSymptomDictionary';
import { checkSNOMEDSubsumption } from './snomedSubsumptionEngine';

export interface RiskModifierRule {
  diagnosisIds: string[]; // partial matches allowed (e.g. 'sah' matches 'neuro_sah')
  symptomIds: string[]; // keys like 'headache', 'cough'
  attributeKey: string; // 'onset', 'severity', 'duration'
  attributeKeywords: string[]; // 'sudden', 'thunderclap', '10/10', 'severe', 'weeks'
  modifierValue: number; // Multiplier, e.g. 4 for 4x probability, 0.2 for reduction
  explanation: string;
}

export const DYNAMIC_RISK_MODIFIERS: RiskModifierRule[] = [
  {
    diagnosisIds: ['sah', 'subarachnoid_hemorrhage', 'hemorrhage', 'stroke'],
    symptomIds: ['headache', 'cephalea', 'neuro_headache'],
    attributeKey: 'onset',
    attributeKeywords: ['sudden', 'thunderclap', 'acute'],
    modifierValue: 4.0,
    explanation: 'Sudden (Thunderclap) Onset for Headache severely increases likelihood of Subarachnoid Hemorrhage/Stroke.'
  },
  {
    diagnosisIds: ['sah', 'subarachnoid_hemorrhage', 'hemorrhage'],
    symptomIds: ['headache', 'cephalea', 'neuro_headache'],
    attributeKey: 'severity',
    attributeKeywords: ['10/10', 'severe', 'worst of life', 'incapacitating'],
    modifierValue: 2.0,
    explanation: 'Severe 10/10 Headache strongly increases SAH likelihood.'
  },
  {
    diagnosisIds: ['tb', 'asthma', 'gerd', 'chronic_bronchitis', 'copd', 'pertussis'],
    symptomIds: ['cough', 'resp_cough', 'lungs_cough'],
    attributeKey: 'duration',
    attributeKeywords: ['> 14 days', '> 2 weeks', 'chronic', 'months', 'weeks', '> 4 weeks'],
    modifierValue: 2.5,
    explanation: 'Chronic cough shifts focus to subacute/chronic respiratory pathways (TB, Asthma, GERD).'
  },
  {
    diagnosisIds: ['acute_viral_cold', 'uri', 'common_cold', 'acute_bronchitis', 'influenza'],
    symptomIds: ['cough', 'resp_cough', 'lungs_cough'],
    attributeKey: 'duration',
    attributeKeywords: ['> 14 days', '> 2 weeks', 'chronic', 'months', 'weeks', '> 4 weeks'],
    modifierValue: 0.15,
    explanation: 'Chronic duration makes acute viral etiology highly unlikely.'
  },
  {
    diagnosisIds: ['aortic_dissection', 'dissection'],
    symptomIds: ['chest_pain', 'chest_discomfort', 'thoracic_pain'],
    attributeKey: 'character',
    attributeKeywords: ['tearing', 'ripping', 'radiating to back'],
    modifierValue: 5.0,
    explanation: 'Tearing/ripping chest pain is a pathognomonic red flag for Aortic Dissection.'
  },
  {
    diagnosisIds: ['mi', 'myocardial_infarction', 'acs', 'acute_coronary'],
    symptomIds: ['chest_pain', 'chest_discomfort'],
    attributeKey: 'radiation',
    attributeKeywords: ['left arm', 'jaw', 'neck', 'shoulder'],
    modifierValue: 3.0,
    explanation: 'Chest pain radiating to left arm or jaw significantly increases ACS probability.'
  }
];

// Common category prefixes used across symptom models & diagnosis mappings
const CATEGORY_PREFIXES = [
  'general_', 'gen_', 'ent_', 'pulm_', 'resp_', 'lungs_', 'cardio_', 'gi_', 
  'neuro_', 'derm_', 'endo_', 'ortho_', 'hema_', 'psych_', 'immuno_', 'trauma_', 
  'peds_', 'gu_', 'renal_', 'gyn_', 'obs_'
];

// Helper to strip category prefixes and normalize string keys
function normalizeKey(key: string): string {
  if (!key) return '';
  let clean = key.toLowerCase().trim();
  for (const prefix of CATEGORY_PREFIXES) {
    if (clean.startsWith(prefix)) {
      clean = clean.slice(prefix.length);
      break;
    }
  }
  return clean.replace(/_/g, '');
}

// Map of canonical aliases/synonyms for common medical terms
const SYNONYM_GROUPS: string[][] = [
  ['fever', 'genfever', 'generalfever', 'feverchills', 'chills', 'pyrexia', 'highgradefever'],
  ['sorethroat', 'entsorethroat', 'throatpain', 'pharyngitis', 'odynophagia'],
  ['postnasaldrip', 'entpostnasaldrip', 'rhinorrhea', 'nasalcongestion', 'runnynose', 'nasalsneezing', 'congestion'],
  ['cough', 'pulmcough', 'lungscough', 'respcough', 'drycough', 'productivecough'],
  ['fatigue', 'genfatigue', 'generalfatigue', 'malaise', 'lethargy', 'tiredness', 'weakness'],
  ['dyspnea', 'shortnessofbreath', 'sob', 'breathlessness', 'dyspneaexertion'],
  ['chestpain', 'angina', 'retrosternalpain', 'thoracicpain'],
  ['headache', 'cephalea', 'migraine', 'headpressure'],
  ['dysuria', 'burningmicturition', 'painfulurination', 'urinaryfrequency', 'urinaryurgency'],
  ['abdominalpain', 'stomachache', 'abdpain', 'epigastricpain'],
  ['nausea', 'vomiting', 'emesis', 'queasiness'],
  ['diarrhea', 'loosestools', 'waterystools'],
  ['rash', 'skinlesion', 'urticaria', 'erythema'],
  ['jointpain', 'arthralgia', 'jointswelling', 'jointstiffness']
];

export function isSymptomMatch(expectedId: string, symptom: Symptom): boolean {
  if (!expectedId || !symptom) return false;

  // 0. Enterprise EMR Dictionary & SNOMED/ICD Matching
  if (symptom.snomed_code || symptom.icd_mapping || symptom.synonyms) {
    const emrDef = findEMRSymptomByTerm(expectedId);
    if (emrDef) {
      if (symptom.snomed_code && symptom.snomed_code === emrDef.snomed_code) return true;
      if (symptom.icd_mapping && symptom.icd_mapping === emrDef.icd_mapping) return true;
      if (symptom.synonyms && symptom.synonyms.some(s => emrDef.synonyms.includes(s) || s === emrDef.name)) return true;
    }
  }

  // 0.5 SNOMED Subsumption matching (Parent-Child Concept Graph)
  // If symptom is a highly specific child (e.g. "Precordial Squeezing")
  // and expectedId is a broader parent (e.g. "Chest Pain"), return true
  const subsumptionCheck = checkSNOMEDSubsumption(symptom.snomed_code || symptom.id, expectedId);
  if (subsumptionCheck.isMatch) {
    return true;
  }

  // 1. Direct ID match
  if (symptom.id === expectedId) return true;

  // 2. Normalized ID match (prefix stripped)
  const normExpected = normalizeKey(expectedId);
  const normSymptomId = normalizeKey(symptom.id);

  if (normExpected && normSymptomId && normExpected === normSymptomId) {
    return true;
  }

  // 3. Synonym / Alias Group match
  if (normExpected && normSymptomId) {
    for (const group of SYNONYM_GROUPS) {
      const inExpected = group.some(term => normExpected.includes(term) || term.includes(normExpected));
      const inSymptom = group.some(term => normSymptomId.includes(term) || term.includes(normSymptomId));
      if (inExpected && inSymptom) return true;
    }
  }

  // 4. Label / Keyword match
  if (symptom.label) {
    const normLabel = symptom.label.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normExpected.length >= 3 && normLabel.includes(normExpected)) {
      return true;
    }
    for (const group of SYNONYM_GROUPS) {
      const inExpected = group.some(term => normExpected.includes(term) || term.includes(normExpected));
      const inLabel = group.some(term => normLabel.includes(term));
      if (inExpected && inLabel) return true;
    }
  }

  return false;
}

// Advanced clinical logic engine implementing Symptom Presentation Match & Bayesian LR weighting
export interface RuleOutImpact {
  negativeLabel: string;
  symptomId: string;
  lrNegative: number;
  explanation: string;
}

export interface DiagnosticMetrics {
  clinicalMatch: number;
  bayesianProbability: number;
  evidenceLevel: 'Strong' | 'Moderate' | 'Weak';
}

export function calculateDiagnosticMetrics(
  diag: Diagnosis,
  symptoms: Symptom[],
  patient?: Patient,
  durationDays?: number,
  pertinentNegatives: (Symptom | { id: string; label: string; symptomId?: string; lrNegative?: number })[] = []
): DiagnosticMetrics {
  const bayesianProbability = calculateWeightedConfidence(diag, symptoms, patient, durationDays, pertinentNegatives);
  
  const expectedSymptoms = Array.from(new Set([
    ...diag.commonSymptoms,
    ...(diag.likelihoodRatios?.map(lr => lr.symptomId) || [])
  ]));

  let pathognomonicFound = false;
  let lrMultiplier = 1.0;
  if (diag.likelihoodRatios) {
    diag.likelihoodRatios.forEach(lr => {
      const isPresent = symptoms.some(s => isSymptomMatch(lr.symptomId, s));
      if (isPresent) {
        if (lr.isPathognomonic) pathognomonicFound = true;
        lrMultiplier *= (lr.lrPositive || 1.2);
      }
    });
  }

  const matchedSymptoms = expectedSymptoms.filter(sId => symptoms.some(s => isSymptomMatch(sId, s)));
  let presentationMatchRatio = expectedSymptoms.length > 0 
    ? (matchedSymptoms.length / expectedSymptoms.length) 
    : 0;

  // Clinical match logic focuses heavily on how closely the user's symptoms map to this specific disease's expected symptoms
  let clinicalMatch = Math.round(presentationMatchRatio * 100);
  if (pathognomonicFound) clinicalMatch = Math.min(100, clinicalMatch + 30);
  if (lrMultiplier > 2.0) clinicalMatch = Math.min(100, clinicalMatch + 15);
  if (clinicalMatch < 5 && matchedSymptoms.length > 0) clinicalMatch = Math.round((matchedSymptoms.length / symptoms.length) * 50);

  let evidenceLevel: 'Strong' | 'Moderate' | 'Weak' = 'Weak';
  if (pathognomonicFound || bayesianProbability > 75 || clinicalMatch > 80) {
    evidenceLevel = 'Strong';
  } else if (bayesianProbability > 35 || clinicalMatch > 45 || lrMultiplier >= 1.5) {
    evidenceLevel = 'Moderate';
  }

  return {
    clinicalMatch,
    bayesianProbability,
    evidenceLevel
  };
}

export function calculateWeightedConfidence(
  diag: Diagnosis,
  symptoms: Symptom[],
  patient?: Patient,
  durationDays?: number,
  pertinentNegatives: (Symptom | { id: string; label: string; symptomId?: string; lrNegative?: number })[] = []
): number {
  const expectedSymptoms = Array.from(new Set([
    ...diag.commonSymptoms,
    ...(diag.likelihoodRatios?.map(lr => lr.symptomId) || [])
  ]));

  if (expectedSymptoms.length === 0 && (!symptoms || symptoms.length === 0)) {
    return (diag.prevalenceScore || 5) * 5;
  }

  const matchedSymptoms = expectedSymptoms.filter(sId => symptoms.some(s => isSymptomMatch(sId, s)));

  // Base presentation match ratio (0 to 1)
  let presentationMatchRatio = expectedSymptoms.length > 0 
    ? (matchedSymptoms.length / expectedSymptoms.length) 
    : 0;

  let lrMultiplier = 1.0;
  let pathognomonicFound = false;

  // 1. Process Positive Symptoms & Likelihood Ratios
  if (diag.likelihoodRatios && diag.likelihoodRatios.length > 0) {
    diag.likelihoodRatios.forEach(lr => {
      const isPresent = symptoms.some(s => isSymptomMatch(lr.symptomId, s));
      const matchingPN = pertinentNegatives.find(pn => {
        const targetKey = (pn as any).symptomId || pn.id;
        return isSymptomMatch(lr.symptomId, { id: targetKey, label: pn.label, category: 'gen', status: 'incomplete' });
      });

      if (isPresent) {
        if (lr.isPathognomonic) pathognomonicFound = true;
        lrMultiplier *= (lr.lrPositive || 1.2);
      } else if (matchingPN) {
        // Strong Likelihood Ratio Negative (LR-) multiplier applied!
        const lrNeg = lr.lrNegative || (matchingPN as any).lrNegative || 0.25;
        lrMultiplier *= lrNeg;
      } else {
        // Implicitly absent (neutral / slight decay)
        lrMultiplier *= 0.95;
      }
    });
  }

  // 2. Process Pertinent Negatives matching Common Symptoms / Rule-Outs
  let ruleOutPenalty = 1.0;
  pertinentNegatives.forEach(pn => {
    const targetKey = (pn as any).symptomId || pn.id;
    const matchesCommon = diag.commonSymptoms.some(cs => isSymptomMatch(cs, { id: targetKey, label: pn.label, category: 'gen', status: 'incomplete' }));
    if (matchesCommon) {
      const lrNeg = (pn as any).lrNegative || 0.3;
      ruleOutPenalty *= lrNeg;
    }
  });

  // Demographic & Lab Context Multiplier
  let contextMultiplier = 1.0;
  if (patient && diag.demographicPrevalence) {
    diag.demographicPrevalence.forEach(ctx => {
      let applies = true;
      if (ctx.ageRange && (patient.age < ctx.ageRange[0] || patient.age > ctx.ageRange[1])) applies = false;
      if (ctx.sex && (patient.gender !== ctx.sex)) applies = false;
      const chronicConditions = (patient as any).chronicConditions || [];
      if (ctx.chronicConditions && !ctx.chronicConditions.some(c => chronicConditions.some((pc: string) => pc.toLowerCase().includes(c.toLowerCase())))) applies = false;
      if (applies) {
        contextMultiplier *= ctx.weight;
      }
    });
  }

  if (patient && diag.associatedLabs && patient.labResults) {
    diag.associatedLabs.forEach(assoc => {
      const matchingLab = patient.labResults?.find((l: any) => l.labName === assoc.labName && l.range === assoc.range);
      if (matchingLab) {
        contextMultiplier *= assoc.weight;
      }
    });
  }

  if (durationDays !== undefined && diag.chronicity) {
    const isChronicDuration = durationDays > 90;
    if (diag.chronicity === 'Acute' && isChronicDuration) contextMultiplier *= 0.3;
    else if (diag.chronicity === 'Chronic' && !isChronicDuration) contextMultiplier *= 0.8;
  }

  // 3. Process Dynamic Attribute-Driven Risk Modifiers
  let dynamicRiskMultiplier = 1.0;
  
  DYNAMIC_RISK_MODIFIERS.forEach(rule => {
    // Check if rule applies to this diagnosis
    const appliesToDiag = rule.diagnosisIds.some(dId => diag.id.toLowerCase().includes(dId) || diag.name.toLowerCase().includes(dId));
    if (!appliesToDiag) return;

    // Check if user has the matching symptom
    const matchingSymptom = symptoms.find(s => rule.symptomIds.some(sId => isSymptomMatch(sId, s)));
    if (!matchingSymptom) return;

    // Check if the symptom has the matching attribute
    let hasAttributeMatch = false;
    const analysisData = (matchingSymptom as any).analysisData || {};
    const values = analysisData[rule.attributeKey] as string[] | undefined;
    
    if (values && Array.isArray(values)) {
      hasAttributeMatch = values.some(val => 
        rule.attributeKeywords.some(keyword => val.toLowerCase().includes(keyword.toLowerCase()))
      );
    } else {
      // Fallback for flat attributes if any
      const flatAttr = (matchingSymptom as any).attributes?.[rule.attributeKey];
      if (flatAttr && typeof flatAttr === 'string') {
        hasAttributeMatch = rule.attributeKeywords.some(keyword => flatAttr.toLowerCase().includes(keyword.toLowerCase()));
      }
    }

    if (hasAttributeMatch) {
      dynamicRiskMultiplier *= rule.modifierValue;
    }
  });

  if (pathognomonicFound && pertinentNegatives.length === 0) return 96;

  // Composite Bayesian score incorporating LR+ and LR- multipliers
  const rawScore = (presentationMatchRatio * 65) + 
                   (Math.min(Math.max(lrMultiplier * ruleOutPenalty, 0.05), 10) * 4) + 
                   ((diag.prevalenceScore || 5) * 2.5 * contextMultiplier * dynamicRiskMultiplier);

  if (symptoms.length === 0) {
    return Math.round((diag.prevalenceScore || 5) * 7 * ruleOutPenalty * dynamicRiskMultiplier);
  }

  const finalScore = matchedSymptoms.length === 0 ? 5 : Math.min(Math.max(rawScore, 5), 95);
  return Math.round(finalScore);
}

export interface AttributeModifierImpact {
  rule: RiskModifierRule;
  symptomLabel: string;
}

export function getAttributeRiskModifiers(
  diag: Diagnosis,
  symptoms: Symptom[]
): AttributeModifierImpact[] {
  const impacts: AttributeModifierImpact[] = [];
  
  DYNAMIC_RISK_MODIFIERS.forEach(rule => {
    const appliesToDiag = rule.diagnosisIds.some(dId => diag.id.toLowerCase().includes(dId) || diag.name.toLowerCase().includes(dId));
    if (!appliesToDiag) return;

    const matchingSymptom = symptoms.find(s => rule.symptomIds.some(sId => isSymptomMatch(sId, s)));
    if (!matchingSymptom) return;

    let hasAttributeMatch = false;
    const analysisData = (matchingSymptom as any).analysisData || {};
    const values = analysisData[rule.attributeKey] as string[] | undefined;
    
    if (values && Array.isArray(values)) {
      hasAttributeMatch = values.some(val => 
        rule.attributeKeywords.some(keyword => val.toLowerCase().includes(keyword.toLowerCase()))
      );
    } else {
      const flatAttr = (matchingSymptom as any).attributes?.[rule.attributeKey];
      if (flatAttr && typeof flatAttr === 'string') {
        hasAttributeMatch = rule.attributeKeywords.some(keyword => flatAttr.toLowerCase().includes(keyword.toLowerCase()));
      }
    }

    if (hasAttributeMatch) {
      impacts.push({
        rule,
        symptomLabel: matchingSymptom.label
      });
    }
  });

  return impacts;
}

export function getRuleOutImpactsForDiagnosis(
  diag: Diagnosis,
  pertinentNegatives: (Symptom | { id: string; label: string; symptomId?: string; lrNegative?: number })[] = []
): RuleOutImpact[] {
  const impacts: RuleOutImpact[] = [];

  pertinentNegatives.forEach(pn => {
    const targetKey = (pn as any).symptomId || pn.id;
    const lrMatch = diag.likelihoodRatios?.find(lr => isSymptomMatch(lr.symptomId, { id: targetKey, label: pn.label, category: 'gen', status: 'incomplete' }));
    const commonMatch = diag.commonSymptoms.some(cs => isSymptomMatch(cs, { id: targetKey, label: pn.label, category: 'gen', status: 'incomplete' }));

    if (lrMatch || commonMatch) {
      const lrNeg = lrMatch?.lrNegative || (pn as any).lrNegative || 0.25;
      impacts.push({
        negativeLabel: pn.label,
        symptomId: targetKey,
        lrNegative: lrNeg,
        explanation: `LR- ${lrNeg} multiplier applied for absent symptom: ${pn.label}`
      });
    }
  });

  return impacts;
}


