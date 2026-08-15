export interface PediatricDosingRule {
  drugNames: string[];
  minAgeYears?: number;
  minAgeMonths?: number;
  maxAgeYears?: number;
  recommendedMgPerKgPerDose?: number;
  maxMgPerKgPerDay?: number;
  absoluteMaxDailyMg?: number;
  usualFrequency?: string;
  contraindications?: Array<{
    reason: string;
    conditionPattern?: RegExp;
    minAgeYears?: number;
    severity: 'Contraindicated' | 'Severe' | 'Major';
  }>;
  liquidConcentrationsMgPerMl?: number[];
  clinicalNotes?: string;
}

export interface PediatricDosingEvaluationInput {
  drugName: string;
  ageYears: number;
  weightKg?: number;
  prescribedDoseMg?: number;
  prescribedFrequency?: string;
  prescribedVolumeMl?: number;
  concentrationMgPerMl?: number;
  indication?: string;
  renalImpairment?: boolean;
  hepaticImpairment?: boolean;
}

export interface PediatricDosingEvaluationResult {
  isPediatric: boolean;
  ageAppropriate: boolean;
  weightProvided: boolean;
  calculatedMgPerKgPerDose?: number;
  calculatedMgPerKgPerDay?: number;
  calculatedDailyTotalMg?: number;
  recommendedMgPerKgPerDose?: number;
  recommendedMaxMgPerKgPerDay?: number;
  absoluteMaxDailyMg?: number;
  suggestedSingleDoseMgRange?: [number, number];
  suggestedVolumeMlRange?: [number, number];
  alerts: Array<{
    id: string;
    severity: 'Contraindicated' | 'Severe' | 'Major' | 'Moderate' | 'Minor';
    title: string;
    message: string;
    actionRequired?: string;
  }>;
}

// Built-in evidence-based pediatric dosing reference database
const PEDIATRIC_DOSING_RULES: PediatricDosingRule[] = [
  {
    drugNames: ['acetaminophen', 'paracetamol', 'panadol', 'ceraless', 'adwol'],
    minAgeMonths: 1,
    recommendedMgPerKgPerDose: 12.5, // 10-15 mg/kg/dose
    maxMgPerKgPerDay: 60, // 60 mg/kg/day max (max 75 mg/kg/day short term)
    absoluteMaxDailyMg: 4000,
    usualFrequency: 'Q4-6H (max 4-5 doses/24h)',
    liquidConcentrationsMgPerMl: [24, 32], // e.g. 120mg/5ml = 24mg/ml; 160mg/5ml = 32mg/ml
    clinicalNotes: 'Do not exceed 5 doses in 24 hours. Hepatotoxicity risk with overdose.'
  },
  {
    drugNames: ['ibuprofen', 'brufen', 'advil', 'motrin'],
    minAgeMonths: 6,
    recommendedMgPerKgPerDose: 10, // 5-10 mg/kg/dose
    maxMgPerKgPerDay: 40,
    absoluteMaxDailyMg: 2400,
    usualFrequency: 'Q6-8H',
    liquidConcentrationsMgPerMl: [20, 40], // e.g. 100mg/5ml = 20mg/ml; 200mg/5ml = 40mg/ml
    contraindications: [
      { reason: 'Avoid in infants under 6 months due to renal toxicity risk.', minAgeYears: 0.5, severity: 'Contraindicated' },
      { reason: 'Use with caution in dehydration or renal impairment.', conditionPattern: /dehydrat|renal|kidney/i, severity: 'Severe' }
    ]
  },
  {
    drugNames: ['amoxicillin', 'emox', 'amoxil'],
    minAgeMonths: 1,
    recommendedMgPerKgPerDose: 22.5, // High-dose otitis media: 80-90 mg/kg/day divided BID
    maxMgPerKgPerDay: 90,
    absoluteMaxDailyMg: 3000,
    usualFrequency: 'BID or TID',
    liquidConcentrationsMgPerMl: [25, 50, 80], // 125mg/5ml, 250mg/5ml, 400mg/5ml
    clinicalNotes: 'Standard dose 45 mg/kg/day divided BID; High-dose otitis media 80-90 mg/kg/day.'
  },
  {
    drugNames: ['amoxicillin-clavulanate', 'augmentin', 'hibiotic', 'curam', 'megamox'],
    minAgeMonths: 2,
    recommendedMgPerKgPerDose: 22.5, // 45-90 mg/kg/day of amoxicillin component
    maxMgPerKgPerDay: 90,
    absoluteMaxDailyMg: 2000,
    usualFrequency: 'BID or TID',
    liquidConcentrationsMgPerMl: [31.25, 45.7, 80], // 156mg/5ml, 228mg/5ml, 457mg/5ml
    clinicalNotes: 'Use 7:1 ratio formulations for high-dose regimens to avoid clavulanate-induced diarrhea.'
  },
  {
    drugNames: ['azithromycin', 'zithromax', 'zithron'],
    minAgeMonths: 6,
    recommendedMgPerKgPerDose: 10, // Day 1: 10 mg/kg, Days 2-5: 5 mg/kg
    maxMgPerKgPerDay: 10,
    absoluteMaxDailyMg: 500,
    usualFrequency: 'OD (Once Daily)',
    liquidConcentrationsMgPerMl: [20, 40], // 100mg/5ml, 200mg/5ml
  },
  {
    drugNames: ['ceftriaxone', 'rocephin'],
    minAgeYears: 0,
    recommendedMgPerKgPerDose: 50, // 50-100 mg/kg/day
    maxMgPerKgPerDay: 100,
    absoluteMaxDailyMg: 4000,
    usualFrequency: 'OD or BID',
    contraindications: [
      { reason: 'Contraindicated in neonates (<= 28 days) receiving calcium-containing IV solutions due to fatal precipitate risk.', minAgeYears: 0.08, severity: 'Contraindicated' },
      { reason: 'Contraindicated in hyperbilirubinemic neonates (displaces bilirubin from albumin).', conditionPattern: /jaundice|hyperbilirubin/i, severity: 'Contraindicated' }
    ]
  },
  {
    drugNames: ['aspirin', 'acetylsalicylic acid'],
    minAgeYears: 18,
    contraindications: [
      { reason: 'Risk of Reye\'s Syndrome (fatal encephalopathy & hepatic failure) in children with viral illness.', severity: 'Contraindicated' }
    ]
  },
  {
    drugNames: ['promethazine', 'phenergan'],
    minAgeYears: 2,
    contraindications: [
      { reason: 'Black Box Warning: Severe respiratory depression risk in children under 2 years of age.', minAgeYears: 2, severity: 'Contraindicated' }
    ]
  },
  {
    drugNames: ['ciprofloxacin', 'levofloxacin', 'fluoroquinolone'],
    minAgeYears: 18,
    contraindications: [
      { reason: 'Fluoroquinolones cause arthropathy and cartilage lesions in juvenile animal models. Reserve for severe pseudomonal or complicated infections.', severity: 'Major' }
    ]
  },
  {
    drugNames: ['doxycycline', 'tetracycline'],
    minAgeYears: 8,
    contraindications: [
      { reason: 'Tetracyclines bind to calcium in teeth & bones causing permanent dental enamel discoloration and bone growth inhibition in children under 8 years.', minAgeYears: 8, severity: 'Contraindicated' }
    ]
  }
];

export function evaluatePediatricDosing(input: PediatricDosingEvaluationInput): PediatricDosingEvaluationResult {
  const isPediatric = input.ageYears < 18;
  const alerts: PediatricDosingEvaluationResult['alerts'] = [];

  if (!isPediatric) {
    return {
      isPediatric: false,
      ageAppropriate: true,
      weightProvided: !!input.weightKg,
      alerts: []
    };
  }

  const normDrug = input.drugName.toLowerCase().trim();
  const rule = PEDIATRIC_DOSING_RULES.find(r => r.drugNames.some(d => normDrug.includes(d)));

  // Age restriction evaluation
  if (rule?.minAgeYears !== undefined && input.ageYears < rule.minAgeYears) {
    alerts.push({
      id: `ped-min-age-${input.drugName}`,
      severity: 'Contraindicated',
      title: `Pediatric Age Restriction (${input.drugName})`,
      message: `Minimum safe age is ${rule.minAgeYears} year(s). Patient is ${input.ageYears} year(s) old.`,
      actionRequired: `Select an age-appropriate alternative.`
    });
  }

  if (rule?.minAgeMonths !== undefined) {
    const ageMonths = input.ageYears * 12;
    if (ageMonths < rule.minAgeMonths) {
      alerts.push({
        id: `ped-min-months-${input.drugName}`,
        severity: 'Contraindicated',
        title: `Infant Age Restriction (${input.drugName})`,
        message: `Minimum safe age is ${rule.minAgeMonths} month(s). Patient is ${Math.round(ageMonths)} month(s) old.`,
        actionRequired: `Select a formulation/drug indicated for neonates/young infants.`
      });
    }
  }

  // Check specific contraindications
  if (rule?.contraindications) {
    for (const c of rule.contraindications) {
      let match = false;
      if (c.minAgeYears !== undefined && input.ageYears < c.minAgeYears) match = true;
      if (c.conditionPattern && input.indication && c.conditionPattern.test(input.indication)) match = true;
      if (!c.minAgeYears && !c.conditionPattern) match = true; // absolute contraindication for pediatric

      if (match) {
        alerts.push({
          id: `ped-contra-${input.drugName}`,
          severity: c.severity,
          title: `Pediatric Safety Alert (${input.drugName})`,
          message: c.reason,
          actionRequired: 'Discontinue drug and review pediatric guidelines.'
        });
      }
    }
  }

  // Weight-based dosing validation
  if (!input.weightKg || input.weightKg <= 0) {
    alerts.push({
      id: `ped-no-weight-${input.drugName}`,
      severity: 'Severe',
      title: `Missing Patient Weight for Pediatric Dosing`,
      message: `Pediatric prescriptions require exact weight in kg for safe mg/kg dosing calculations.`,
      actionRequired: `Record patient weight (kg) to calculate correct pediatric mg/kg dose.`
    });

    return {
      isPediatric: true,
      ageAppropriate: alerts.length === 0,
      weightProvided: false,
      alerts
    };
  }

  // Calculate doses
  let calculatedMgPerKgPerDose: number | undefined;
  let calculatedMgPerKgPerDay: number | undefined;
  let calculatedDailyTotalMg: number | undefined;

  if (input.prescribedDoseMg && input.prescribedDoseMg > 0) {
    calculatedMgPerKgPerDose = input.prescribedDoseMg / input.weightKg;

    // Estimate daily dose multiplier based on frequency
    let freqMultiplier = 1;
    const freq = (input.prescribedFrequency || '').toLowerCase();
    if (freq.includes('qid') || freq.includes('q6h') || freq.includes('4 times')) freqMultiplier = 4;
    else if (freq.includes('tid') || freq.includes('q8h') || freq.includes('3 times')) freqMultiplier = 3;
    else if (freq.includes('bid') || freq.includes('q12h') || freq.includes('2 times')) freqMultiplier = 2;
    else if (freq.includes('q4h') || freq.includes('every 4 hours')) freqMultiplier = 6;

    calculatedDailyTotalMg = input.prescribedDoseMg * freqMultiplier;
    calculatedMgPerKgPerDay = calculatedDailyTotalMg / input.weightKg;

    // Compare with rule
    if (rule) {
      if (rule.maxMgPerKgPerDay && calculatedMgPerKgPerDay > rule.maxMgPerKgPerDay * 1.1) { // 10% tolerance
        alerts.push({
          id: `ped-overdose-mgkgday-${input.drugName}`,
          severity: 'Severe',
          title: `Pediatric Overdose Alert: Exceeds Safe mg/kg/day (${input.drugName})`,
          message: `Prescribed dose yields ~${calculatedMgPerKgPerDay.toFixed(1)} mg/kg/day (Weight: ${input.weightKg} kg). Maximum recommended is ${rule.maxMgPerKgPerDay} mg/kg/day.`,
          actionRequired: `Reduce single dose or dose frequency.`
        });
      }

      if (rule.recommendedMgPerKgPerDose) {
        if (calculatedMgPerKgPerDose > rule.recommendedMgPerKgPerDose * 1.5) {
          alerts.push({
            id: `ped-overdose-mgkgdose-${input.drugName}`,
            severity: 'Severe',
            title: `Pediatric Single Dose Overdose (${input.drugName})`,
            message: `Single dose yields ~${calculatedMgPerKgPerDose.toFixed(1)} mg/kg/dose. Usual target is ${rule.recommendedMgPerKgPerDose} mg/kg/dose.`,
            actionRequired: `Verify single dose calculation.`
          });
        } else if (calculatedMgPerKgPerDose < rule.recommendedMgPerKgPerDose * 0.5) {
          alerts.push({
            id: `ped-underdose-mgkgdose-${input.drugName}`,
            severity: 'Moderate',
            title: `Pediatric Underdosing Risk (${input.drugName})`,
            message: `Single dose yields ~${calculatedMgPerKgPerDose.toFixed(1)} mg/kg/dose, which is below therapeutic range (~${rule.recommendedMgPerKgPerDose} mg/kg/dose). Risk of treatment failure.`,
            actionRequired: `Adjust dose to therapeutic target.`
          });
        }
      }

      if (rule.absoluteMaxDailyMg && calculatedDailyTotalMg > rule.absoluteMaxDailyMg) {
        alerts.push({
          id: `ped-exceeds-adult-max-${input.drugName}`,
          severity: 'Contraindicated',
          title: `Pediatric Dose Exceeds Adult Daily Ceiling (${input.drugName})`,
          message: `Total daily dose (${calculatedDailyTotalMg} mg) exceeds maximum adult/pediatric ceiling of ${rule.absoluteMaxDailyMg} mg/day.`,
          actionRequired: `Cap dose at ${rule.absoluteMaxDailyMg} mg/day.`
        });
      }
    }
  }

  // Liquid Volume calculation check
  if (input.prescribedVolumeMl && input.concentrationMgPerMl) {
    const calculatedMgFromVol = input.prescribedVolumeMl * input.concentrationMgPerMl;
    if (input.prescribedDoseMg && Math.abs(calculatedMgFromVol - input.prescribedDoseMg) > 2) {
      alerts.push({
        id: `ped-vol-mismatch-${input.drugName}`,
        severity: 'Major',
        title: `Volume & Dose Concentration Discrepancy (${input.drugName})`,
        message: `Prescribed ${input.prescribedVolumeMl} mL at ${input.concentrationMgPerMl} mg/mL equals ${calculatedMgFromVol} mg, but prescribed dose is stated as ${input.prescribedDoseMg} mg.`,
        actionRequired: `Align liquid mL volume with suspension concentration mg.`
      });
    }
  }

  // Renal & Hepatic Pediatric Modifiers
  if (input.renalImpairment) {
    alerts.push({
      id: `ped-renal-mod-${input.drugName}`,
      severity: 'Major',
      title: `Pediatric Renal Impairment Dose Reduction Needed (${input.drugName})`,
      message: `Pediatric renal clearance is reduced. Dose extension or 25-50% dose reduction recommended based on Schwartz eGFR.`,
      actionRequired: `Calculate pediatric eGFR using Schwartz formula: eGFR = (0.413 * Height_cm) / Cr.`
    });
  }

  // Suggested ranges
  let suggestedSingleDoseMgRange: [number, number] | undefined;
  let suggestedVolumeMlRange: [number, number] | undefined;

  if (rule && rule.recommendedMgPerKgPerDose && input.weightKg) {
    const targetMg = rule.recommendedMgPerKgPerDose * input.weightKg;
    suggestedSingleDoseMgRange = [Math.round(targetMg * 0.8), Math.round(targetMg * 1.2)];

    if (rule.liquidConcentrationsMgPerMl && rule.liquidConcentrationsMgPerMl.length > 0) {
      const conc = rule.liquidConcentrationsMgPerMl[0];
      suggestedVolumeMlRange = [
        parseFloat((suggestedSingleDoseMgRange[0] / conc).toFixed(1)),
        parseFloat((suggestedSingleDoseMgRange[1] / conc).toFixed(1))
      ];
    }
  }

  return {
    isPediatric: true,
    ageAppropriate: alerts.filter(a => a.severity === 'Contraindicated').length === 0,
    weightProvided: true,
    calculatedMgPerKgPerDose: calculatedMgPerKgPerDose ? parseFloat(calculatedMgPerKgPerDose.toFixed(2)) : undefined,
    calculatedMgPerKgPerDay: calculatedMgPerKgPerDay ? parseFloat(calculatedMgPerKgPerDay.toFixed(2)) : undefined,
    calculatedDailyTotalMg,
    recommendedMgPerKgPerDose: rule?.recommendedMgPerKgPerDose,
    recommendedMaxMgPerKgPerDay: rule?.maxMgPerKgPerDay,
    absoluteMaxDailyMg: rule?.absoluteMaxDailyMg,
    suggestedSingleDoseMgRange,
    suggestedVolumeMlRange,
    alerts
  };
}
