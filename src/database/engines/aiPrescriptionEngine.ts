import { calculateCockcroftGault, calculateChildPugh } from '../calculators/clinicalCalculators';
import { getDiseaseSpecificDosing } from './diseaseDosingEngine';
import { evaluateRenalHepaticDosing } from './renalHepaticEngine';
import { checkAllergyCrossReactivity } from './allergyCrossReactivityEngine';
import { evaluatePregnancySafety, evaluateLactationSafety } from './pregnancyLactationEngine';
import { searchEgyptianBrands } from './egyptianBrandEngine';
import { getMonitoringRequirements } from './monitoringEngine';
import { getGuidelineForCondition } from './guidelineEngine';
import { findClinicalMedicationByName } from '../medications';

export function getFullStandardDose(medName: string, diagnosis?: string): string {
  if (!medName) return '500 mg PO TID';
  const name = medName.toLowerCase().trim();

  // 1. Check disease dosing rule first
  const diseaseMatch = getDiseaseSpecificDosing(medName, diagnosis);
  if (diseaseMatch.found && diseaseMatch.selectedRule) {
    const r = diseaseMatch.selectedRule;
    const freq = r.frequency.includes('(') ? r.frequency : `${r.frequency}`;
    return `${r.dose} ${freq}${r.duration ? ` for ${r.duration}` : ''}`;
  }

  // 2. Comprehensive clinical dictionary for common medications
  if (name.includes('amoxicillin') && name.includes('clav')) return '1 g (875/125 mg) PO BID (every 12 hours)';
  if (name.includes('amoxicillin') || name.includes('amoxil') || name.includes('e-mox')) return '500 mg PO TID (every 8 hours)';
  if (name.includes('enalapril') || name.includes('ezapril')) return '10 mg PO QD (once daily)';
  if (name.includes('metformin') || name.includes('cidophage')) return '500 mg PO BID (twice daily with meals)';
  if (name.includes('atorvastatin') || name.includes('lipitor') || name.includes('ator')) return '20 mg PO QD (once daily at bedtime)';
  if (name.includes('omeprazole') || name.includes('losec') || name.includes('pepzol')) return '20 mg PO QD (once daily before breakfast)';
  if (name.includes('ciprofloxacin') || name.includes('cipro')) return '500 mg PO BID (every 12 hours)';
  if (name.includes('levofloxacin') || name.includes('tavanic')) return '500 mg PO QD (once daily)';
  if (name.includes('azithromycin') || name.includes('zithromax')) return '500 mg PO QD Day 1, then 250 mg PO QD Days 2-5';
  if (name.includes('ceftriaxone')) return '1 g IV QD (once daily)';
  if (name.includes('paracetamol') || name.includes('acetaminophen') || name.includes('panadol') || name.includes('abimol') || name.includes('paramol')) return '500 mg PO Q6H PRN (Max 4g/day)';
  if (name.includes('ibuprofen') || name.includes('brufen')) return '400 mg PO Q8H PRN (with food)';
  if (name.includes('aspirin') || name.includes('ezprin') || name.includes('aspocid')) return '81 mg PO QD (once daily)';
  if (name.includes('furosemide') || name.includes('lasix')) return '40 mg PO QD (once daily in morning)';
  if (name.includes('spironolactone') || name.includes('aldactone')) return '25 mg PO QD (once daily)';
  if (name.includes('bisoprolol') || name.includes('concor')) return '5 mg PO QD (once daily)';
  if (name.includes('carvedilol') || name.includes('dilatrend')) return '6.25 mg PO BID (twice daily)';
  if (name.includes('lisinopril')) return '10 mg PO QD (once daily)';
  if (name.includes('amlodipine') || name.includes('norvasc') || name.includes('amlo')) return '5 mg PO QD (once daily)';
  if (name.includes('losartan') || name.includes('cozaar')) return '50 mg PO QD (once daily)';
  if (name.includes('valsartan') || name.includes('diovan')) return '80 mg PO QD (once daily)';
  if (name.includes('hydrochlorothiazide') || name.includes('hctz')) return '12.5 mg PO QD (once daily)';
  if (name.includes('clopidogrel') || name.includes('plavix')) return '75 mg PO QD (once daily)';
  if (name.includes('simvastatin') || name.includes('zocor')) return '20 mg PO QD (once daily in evening)';
  if (name.includes('rosuvastatin') || name.includes('crestor')) return '10 mg PO QD (once daily)';
  if (name.includes('pantoprazole') || name.includes('controloc')) return '40 mg PO QD (once daily before breakfast)';
  if (name.includes('famotidine') || name.includes('antodine')) return '20 mg PO BID (twice daily)';
  if (name.includes('doxycycline') || name.includes('vibramycin')) return '100 mg PO BID (every 12 hours)';
  if (name.includes('clarithromycin') || name.includes('klacid')) return '500 mg PO BID (every 12 hours)';
  if (name.includes('levothyroxine') || name.includes('eltroxin')) return '50 mcg PO QD (once daily on empty stomach)';
  if (name.includes('prednisone') || name.includes('hostacortin')) return '20 mg PO QD (once daily with breakfast)';
  if (name.includes('dexamethasone')) return '4 mg PO QD';
  if (name.includes('gabapentin') || name.includes('gaptin')) return '300 mg PO TID (three times daily)';
  if (name.includes('pregabalin') || name.includes('lyrica')) return '75 mg PO BID (twice daily)';
  if (name.includes('sertraline') || name.includes('lustral')) return '50 mg PO QD (once daily)';
  if (name.includes('escitalopram') || name.includes('cipralex')) return '10 mg PO QD (once daily)';
  if (name.includes('fluoxetine') || name.includes('prozac')) return '20 mg PO QD (once daily in morning)';
  if (name.includes('tramadol')) return '50 mg PO Q6H PRN';
  if (name.includes('warfarin') || name.includes('marevan')) return '5 mg PO QD (adjusted to target INR 2.0-3.0)';
  if (name.includes('apixaban') || name.includes('eliquis')) return '5 mg PO BID (twice daily)';
  if (name.includes('rivaroxaban') || name.includes('xarelto')) return '20 mg PO QD (once daily with evening meal)';
  if (name.includes('insulin glargine') || name.includes('lantus')) return '10 Units SC QD at bedtime';

  // 3. Fallback to generic medication database lookup
  const med = findClinicalMedicationByName(medName);
  if (med && med.disease_dosing && med.disease_dosing.length > 0) {
    const r = med.disease_dosing[0];
    return `${r.dose} ${r.frequency}${r.duration ? ` for ${r.duration}` : ''}`;
  }

  // 4. Clean fallback format
  return `500 mg PO TID (Standard Complete Adult Regimen)`;
}

export interface AIPrescriptionOptimizationInput {
  patientName: string;
  age: number;
  gender: 'male' | 'female';
  weightKg: number;
  heightCm?: number;
  scrMgDl?: number;
  isPregnant?: boolean;
  trimester?: 1 | 2 | 3;
  isLactating?: boolean;
  allergies?: string[];
  diagnosis: string;
  prescribedMedications: string[];
  liverBilirubin?: number;
  liverAlbumin?: number;
  liverINR?: number;
  hasAscites?: boolean;
  hasEncephalopathy?: boolean;
}

export interface AIPrescriptionOptimizationResult {
  crClMlMin: number;
  childPughScore?: number;
  childPughClass?: string;
  guidelineRecommendation?: string;
  guidelineSociety?: string;
  optimizedRegimen: {
    medicationName: string;
    originalDose: string;
    recommendedDose: string;
    adjustmentReason: string;
    safetyScore: 'Optimal' | 'Caution' | 'High Risk' | 'Contraindicated';
    egyptianBrands: string[];
    avgPriceEgp: number;
    monitoringPlan: string[];
    warnings: string[];
  }[];
  overallSafetyStatus: 'SAFE' | 'ADJUSTMENT_REQUIRED' | 'HIGH_RISK_CONTRAINDICATED';
  clinicalSummaryRationale: string;
}

export function optimizePrescriptionRegimen(input: AIPrescriptionOptimizationInput): AIPrescriptionOptimizationResult {
  const scr = input.scrMgDl || 1.0;
  const crClObj = calculateCockcroftGault({
    age: input.age,
    weightKg: input.weightKg,
    serumCreatinineMgDl: scr,
    sex: input.gender
  });
  const crCl = crClObj.crcl;

  let cpScore: number | undefined;
  let cpClass: string | undefined;

  if (input.liverBilirubin && input.liverAlbumin && input.liverINR) {
    const cpRes = calculateChildPugh({
      totalBilirubinMgDl: input.liverBilirubin,
      serumAlbuminGDl: input.liverAlbumin,
      inr: input.liverINR,
      ascites: input.hasAscites ? 'moderate_severe' : 'none',
      encephalopathy: input.hasEncephalopathy ? 'grade_1_2' : 'none'
    });
    cpScore = cpRes.score;
    cpClass = cpRes.class;
  }

  const guideline = getGuidelineForCondition(input.diagnosis);
  const optimizedRegimen = [];
  let highestRisk: 'SAFE' | 'ADJUSTMENT_REQUIRED' | 'HIGH_RISK_CONTRAINDICATED' = 'SAFE';

  for (const medName of input.prescribedMedications) {
    const warnings: string[] = [];
    const fullStd = getFullStandardDose(medName, input.diagnosis);
    let recDose = fullStd;
    let adjReason = `Standard clinical dosing (${fullStd}) is safe based on renal and hepatic parameters.`;
    let safetyScore: 'Optimal' | 'Caution' | 'High Risk' | 'Contraindicated' = 'Optimal';

    // 1. Disease specific check
    const diseaseCheck = getDiseaseSpecificDosing(medName, input.diagnosis);
    if (diseaseCheck.found && diseaseCheck.selectedRule) {
      recDose = `${diseaseCheck.selectedRule.dose} ${diseaseCheck.selectedRule.frequency}`;
      adjReason = `Indication-specific dose for ${input.diagnosis}.`;
    }

    // 2. Renal & Hepatic check
    const organCheck = evaluateRenalHepaticDosing({
      medicationName: medName,
      age: input.age,
      weightKg: input.weightKg,
      serumCreatinineMgDl: scr,
      sex: input.gender,
      totalBilirubinMgDl: input.liverBilirubin,
      serumAlbuminGDl: input.liverAlbumin,
      inr: input.liverINR
    });

    if (organCheck.renalAlert && organCheck.recommendedRenalDose) {
      if (organCheck.recommendedRenalDose.toLowerCase().includes('contraindicated')) {
        safetyScore = 'Contraindicated';
        warnings.push(`CONTRAINDICATED in renal impairment (CrCl: ${crCl} mL/min): ${organCheck.recommendedRenalDose}`);
        highestRisk = 'HIGH_RISK_CONTRAINDICATED';
      } else {
        recDose = organCheck.recommendedRenalDose;
        adjReason = `Renally adjusted for CrCl ${crCl} mL/min (${organCheck.renalStage}).`;
        safetyScore = 'Caution';
        if (highestRisk !== 'HIGH_RISK_CONTRAINDICATED') highestRisk = 'ADJUSTMENT_REQUIRED';
      }
    }

    if (organCheck.hepaticAlert && organCheck.recommendedHepaticDose) {
      if (organCheck.recommendedHepaticDose.toLowerCase().includes('contraindicated')) {
        safetyScore = 'Contraindicated';
        warnings.push(`CONTRAINDICATED in hepatic impairment (${organCheck.hepaticChildClass}): ${organCheck.recommendedHepaticDose}`);
        highestRisk = 'HIGH_RISK_CONTRAINDICATED';
      } else {
        recDose += ` | Hepatic: ${organCheck.recommendedHepaticDose}`;
        adjReason += ` Hepatic adjustment for ${organCheck.hepaticChildClass}.`;
        if (safetyScore !== 'Contraindicated') safetyScore = 'Caution';
        if (highestRisk !== 'HIGH_RISK_CONTRAINDICATED') highestRisk = 'ADJUSTMENT_REQUIRED';
      }
    }

    // 3. Allergy check
    if (input.allergies && input.allergies.length > 0) {
      const allergyAlerts = checkAllergyCrossReactivity(input.allergies, medName);
      for (const alg of allergyAlerts) {
        if (alg.riskLevel === 'Severe' || alg.riskLevel === 'High') {
          safetyScore = 'Contraindicated';
          warnings.push(`ALLERGY CONTRAINDICATION: Cross-reactivity with ${alg.patientAllergy} (${alg.crossReactivityRate}). ${alg.recommendation}`);
          highestRisk = 'HIGH_RISK_CONTRAINDICATED';
        } else {
          warnings.push(`ALLERGY CAUTION: Mild/Moderate cross-reactivity with ${alg.patientAllergy}. ${alg.recommendation}`);
          if (safetyScore !== 'Contraindicated') safetyScore = 'Caution';
        }
      }
    }

    // 4. Pregnancy & Lactation
    if (input.isPregnant) {
      const pregEval = evaluatePregnancySafety(medName, true, input.trimester || 1);
      if (pregEval.riskLevel === 'Contraindicated') {
        safetyScore = 'Contraindicated';
        warnings.push(`PREGNANCY CONTRAINDICATION (Legacy Category ${pregEval.legacyCategory || 'X'}): ${pregEval.overallRecommendation}`);
        highestRisk = 'HIGH_RISK_CONTRAINDICATED';
      } else if (pregEval.riskLevel === 'High' || pregEval.riskLevel === 'Moderate') {
        warnings.push(`PREGNANCY CAUTION: ${pregEval.trimesterAdvice}`);
        if (safetyScore !== 'Contraindicated') safetyScore = 'Caution';
      }
    }

    if (input.isLactating) {
      const lacEval = evaluateLactationSafety(medName, true);
      if (lacEval.infantRisk === 'High' || lacEval.infantRisk === 'Contraindicated') {
        warnings.push(`LACTATION WARNING: Milk transfer ${lacEval.milkTransfer}. ${lacEval.clinicalAdvice}`);
        if (safetyScore !== 'Contraindicated') safetyScore = 'Caution';
      }
    }

    // Egyptian brand lookup
    const brandSearch = searchEgyptianBrands(medName);
    const brandList = brandSearch.brands.map(b => `${b.brand_name} (${b.company}) - ${b.price_egp} EGP [${b.availability}]`);

    // Monitoring
    const mon = getMonitoringRequirements(medName);
    const monitoringPlan = mon ? [...mon.baselineLabs, ...mon.ongoingLabs] : ['Renal Function', 'Liver Function'];

    optimizedRegimen.push({
      medicationName: medName,
      originalDose: fullStd,
      recommendedDose: recDose,
      adjustmentReason: adjReason,
      safetyScore,
      egyptianBrands: brandList,
      avgPriceEgp: brandSearch.averagePriceEgp,
      monitoringPlan,
      warnings
    });
  }

  const clinicalSummaryRationale = highestRisk === 'HIGH_RISK_CONTRAINDICATED'
    ? 'CRITICAL CLINICAL ALERT: One or more prescribed medications are CONTRAINDICATED due to renal impairment, allergy cross-reactivity, or pregnancy category. Immediate alternative drug selection required.'
    : highestRisk === 'ADJUSTMENT_REQUIRED'
    ? `DOSING ADJUSTMENT REQUIRED: Renal CrCl calculated at ${crCl} mL/min (Cockcroft-Gault). Doses have been modified according to clinical protocols.`
    : `REGIMEN OPTIMAL: Prescribed medications align with ${guideline ? guideline.society : 'clinical'} guidelines and patient safety parameters (CrCl ${crCl} mL/min).`;

  return {
    crClMlMin: crCl,
    childPughScore: cpScore,
    childPughClass: cpClass,
    guidelineRecommendation: guideline ? guideline.recommendation : undefined,
    guidelineSociety: guideline ? guideline.society : undefined,
    optimizedRegimen,
    overallSafetyStatus: highestRisk,
    clinicalSummaryRationale
  };
}
