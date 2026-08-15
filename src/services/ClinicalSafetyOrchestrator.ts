import { DRUG_INTERACTIONS } from '@/data/drugInteractions';
import { Patient } from '@/data/patients';
import { checkDuplicateTherapy, DuplicateTherapyAlert } from '@/database/engines/duplicateTherapyEngine';
import { checkAllergyCrossReactivity, AllergyCrossReactivityAlert } from '@/database/engines/allergyCrossReactivityEngine';
import { evaluateDetailedDrugInteractions, DetailedInteraction } from '@/database/engines/interactionDetailEngine';
import { evaluatePregnancySafety, evaluateLactationSafety } from '@/database/engines/pregnancyLactationEngine';
import { evaluateRenalHepaticDosing } from '@/database/engines/renalHepaticEngine';
import { evaluatePediatricDosing } from '@/database/engines/pediatricDosingEngine';
import { ddiService } from '@/services/ddiService';

export type UnifiedSafetySeverity = 'Minor' | 'Moderate' | 'Major' | 'Severe' | 'Contraindicated';

export type OverallSafetyStatus = 'SAFE' | 'CAUTION' | 'WARNING' | 'CONTRAINDICATED';

export type SafetyModuleSource = 
  | 'Allergy' 
  | 'DDI' 
  | 'Drug-Disease' 
  | 'Pregnancy' 
  | 'Lactation' 
  | 'Pediatric' 
  | 'Renal' 
  | 'Hepatic' 
  | 'DuplicateTherapy' 
  | 'MaxDose' 
  | 'EmergencyRules';

export interface UnifiedSafetyAlert {
  id: string;
  sourceEngine: SafetyModuleSource;
  severity: UnifiedSafetySeverity;
  drug?: string;
  title: string;
  message: string;
  clinicalMechanism?: string;
  actionRequired?: string;
  reference?: string;
}

export interface SafetyEvaluationInput {
  patient: Patient;
  medications?: Array<{
    name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    pregnancy_category?: string;
    lactation_safety?: string;
    pediatric_min_age?: string;
    renal_adjustment_required?: boolean;
    renal_dose_guidance?: string;
    max_daily_dose_mg?: number;
    [key: string]: any;
  }>;
  diagnosis?: {
    name?: string;
    code?: string;
    category?: string;
  } | string;
  vitals?: {
    bp?: string;
    hr?: number | string;
    temp?: number | string;
    spo2?: number | string;
    weightKg?: number;
    [key: string]: any;
  };
  labs?: Array<{
    testName: string;
    value: string;
    unit?: string;
  }>;
  options?: {
    includeAsyncRxNav?: boolean;
    trimester?: 1 | 2 | 3;
  };
}

export interface SubEngineResults {
  allergy: UnifiedSafetyAlert[];
  ddi: UnifiedSafetyAlert[];
  drugDisease: UnifiedSafetyAlert[];
  pregnancy: UnifiedSafetyAlert[];
  lactation: UnifiedSafetyAlert[];
  pediatric: UnifiedSafetyAlert[];
  renal: UnifiedSafetyAlert[];
  hepatic: UnifiedSafetyAlert[];
  duplicateTherapy: UnifiedSafetyAlert[];
  maxDose: UnifiedSafetyAlert[];
  emergencyRules: UnifiedSafetyAlert[];
}

export interface UnifiedSafetyReport {
  overallStatus: OverallSafetyStatus;
  maxSeverity: UnifiedSafetySeverity;
  isPrescriptionBlocked: boolean;
  summary: string;
  totalAlertsCount: number;
  criticalAlertsCount: number;
  alerts: UnifiedSafetyAlert[];
  subEngineResults: SubEngineResults;
  evaluatedAt: string;
}

// Global therapeutic classes map for fallback checks
const THERAPEUTIC_CLASSES: Record<string, string[]> = {
  'ACE Inhibitors': ['Lisinopril', 'Enalapril', 'Ramipril', 'Benazepril', 'Captopril', 'Fosinopril'],
  'ARBs': ['Losartan', 'Valsartan', 'Candesartan', 'Irbesartan', 'Olmesartan', 'Telmisartan'],
  'Statins': ['Atorvastatin', 'Simvastatin', 'Rosuvastatin', 'Pravastatin', 'Lovastatin', 'Fluvastatin'],
  'NSAIDs': ['Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Meloxicam', 'Indomethacin', 'Ketorolac', 'Aspirin'],
  'Proton Pump Inhibitors': ['Omeprazole', 'Pantoprazole', 'Lansoprazole', 'Esomeprazole', 'Rabeprazole'],
  'Beta Blockers': ['Metoprolol', 'Atenolol', 'Carvedilol', 'Propranolol', 'Bisoprolol', 'Labetalol', 'Nadolol'],
  'SSRIs': ['Sertraline', 'Fluoxetine', 'Escitalopram', 'Citalopram', 'Paroxetine', 'Fluvoxamine'],
  'Calcium Channel Blockers': ['Amlodipine', 'Diltiazem', 'Verapamil', 'Nifedipine', 'Felodipine'],
  'Loop Diuretics': ['Furosemide', 'Bumetanide', 'Torsemide'],
};

/**
 * Single Authoritative Clinical Safety Orchestrator
 * Centralized, deterministic safety arbitration across all sub-engines.
 */
export class ClinicalSafetyOrchestrator {

  /**
   * Evaluates all safety modules synchronously (and optionally async for RxNav)
   * and returns a single, arbitrated UnifiedSafetyReport.
   */
  public static async evaluate(input: SafetyEvaluationInput): Promise<UnifiedSafetyReport> {
    const report = this.evaluateSync(input);

    // If async RxNav verification is requested, integrate external DDI findings
    if (input.options?.includeAsyncRxNav) {
      const medNames = (input.medications || input.patient.medications || []).map(m => m.name).filter(Boolean);
      if (medNames.length >= 2) {
        try {
          const rxNavResults = await ddiService.getVerifiedInteractions(medNames);
          for (const res of rxNavResults) {
            const exists = report.subEngineResults.ddi.some(a => 
              a.message.toLowerCase().includes(res.description.toLowerCase())
            );
            if (!exists) {
              const alert: UnifiedSafetyAlert = {
                id: `ddi-rxnav-${Math.random().toString(36).substr(2, 6)}`,
                sourceEngine: 'DDI',
                severity: res.severity === 'Major' ? 'Major' : res.severity === 'Moderate' ? 'Moderate' : 'Minor',
                drug: res.drugs.join(' + '),
                title: `RxNav NLM DDI (${res.drugs.join(' & ')})`,
                message: res.description,
                reference: 'National Library of Medicine RxNav'
              };
              report.subEngineResults.ddi.push(alert);
              report.alerts.push(alert);
            }
          }
          // Re-arbitrate with new DDI findings
          return this.arbitrate(report.subEngineResults);
        } catch (err) {
          console.warn('[ClinicalSafetyOrchestrator] RxNav query warning:', err);
        }
      }
    }

    return report;
  }

  /**
   * Synchronous core safety evaluation
   */
  public static evaluateSync(input: SafetyEvaluationInput): UnifiedSafetyReport {
    const { patient, vitals, labs } = input;
    const diagnosisName = typeof input.diagnosis === 'string' 
      ? input.diagnosis 
      : input.diagnosis?.name || '';

    const rawMeds = input.medications || patient.medications || [];
    const activeMeds = rawMeds.map(m => {
      if (typeof m === 'string') {
        return { name: m };
      }
      return m;
    }).filter(m => m && m.name);
    const medNames = activeMeds.map(m => m.name);

    const subResults: SubEngineResults = {
      allergy: [],
      ddi: [],
      drugDisease: [],
      pregnancy: [],
      lactation: [],
      pediatric: [],
      renal: [],
      hepatic: [],
      duplicateTherapy: [],
      maxDose: [],
      emergencyRules: []
    };

    // --- 1. ALLERGY & CROSS-REACTIVITY SUB-ENGINE ---
    if (patient.allergies && patient.allergies.length > 0 && activeMeds.length > 0) {
      const allergyList = patient.allergies.map(a => a.name);

      for (const med of activeMeds) {
        // Advanced cross-reactivity engine
        const crossAlerts: AllergyCrossReactivityAlert[] = checkAllergyCrossReactivity(allergyList, med.name);
        for (const ca of crossAlerts) {
          const mappedSeverity: UnifiedSafetySeverity = 
            ca.riskLevel === 'Severe' || ca.riskLevel === 'High' ? 'Severe' : 'Moderate';
          subResults.allergy.push({
            id: `allergy-cross-${med.name}-${ca.patientAllergy}`,
            sourceEngine: 'Allergy',
            severity: mappedSeverity,
            drug: med.name,
            title: `Allergy / Cross-Reactivity (${ca.patientAllergy} vs ${ca.prescribedDrug})`,
            message: `${ca.crossReactivityRate}. Mechanism: ${ca.mechanism}`,
            clinicalMechanism: ca.mechanism,
            actionRequired: ca.recommendation
          });
        }

        // Direct allergy check fallback
        if (crossAlerts.length === 0) {
          const directMatch = patient.allergies.find(a => 
            a.name.toLowerCase().trim() === med.name.toLowerCase().trim()
          );
          if (directMatch) {
            const mappedSev: UnifiedSafetySeverity = 
              directMatch.severity === 'Severe' ? 'Severe' : 
              directMatch.severity === 'Moderate' ? 'Moderate' : 'Minor';
            subResults.allergy.push({
              id: `allergy-direct-${med.name}`,
              sourceEngine: 'Allergy',
              severity: mappedSev,
              drug: med.name,
              title: `Direct Medication Allergy (${med.name})`,
              message: `Patient has a documented direct allergy to ${med.name} (Severity: ${directMatch.severity}).`,
              actionRequired: 'Discontinue drug immediately and select an non-cross-reactive alternative.'
            });
          }
        }
      }
    }

    // --- 2. DDI (DRUG-DRUG INTERACTION) SUB-ENGINE ---
    if (medNames.length >= 2) {
      const detailedInters: DetailedInteraction[] = evaluateDetailedDrugInteractions(medNames);
      for (const det of detailedInters) {
        const mappedSev: UnifiedSafetySeverity = det.severityLevel === 'Major' ? 'Major' : det.severityLevel === 'Moderate' ? 'Moderate' : 'Minor';
        subResults.ddi.push({
          id: `ddi-detailed-${det.drug1}-${det.drug2}`,
          sourceEngine: 'DDI',
          severity: mappedSev,
          drug: `${det.drug1} + ${det.drug2}`,
          title: `Drug Interaction (${det.drug1} & ${det.drug2})`,
          message: det.clinicalRisk,
          clinicalMechanism: det.mechanism,
          actionRequired: det.management,
          reference: det.reference
        });
      }

      for (let i = 0; i < activeMeds.length; i++) {
        for (let j = i + 1; j < activeMeds.length; j++) {
          const interaction = DRUG_INTERACTIONS.find(
            (inter) =>
              (inter.drugA === activeMeds[i].name && inter.drugB === activeMeds[j].name) ||
              (inter.drugA === activeMeds[j].name && inter.drugB === activeMeds[i].name)
          );
          if (interaction && !detailedInters.some(d => (d.drug1 === interaction.drugA && d.drug2 === interaction.drugB) || (d.drug1 === interaction.drugB && d.drug2 === interaction.drugA))) {
            const mappedSev: UnifiedSafetySeverity = interaction.severity === 'Severe' ? 'Severe' : interaction.severity === 'Moderate' ? 'Moderate' : 'Minor';
            subResults.ddi.push({
              id: `ddi-db-${interaction.drugA}-${interaction.drugB}`,
              sourceEngine: 'DDI',
              severity: mappedSev,
              drug: `${interaction.drugA} + ${interaction.drugB}`,
              title: `Drug Interaction (${interaction.drugA} & ${interaction.drugB})`,
              message: interaction.description,
              actionRequired: 'Monitor closely or adjust timing/dosage.'
            });
          }
        }
      }
    }

    // --- 3. DRUG-DISEASE CONTRAINDICATIONS SUB-ENGINE ---
    const combinedConditions = [
      diagnosisName,
      ...(patient.chronicConditions || [])
    ].filter(Boolean);

    if (activeMeds.length > 0 && combinedConditions.length > 0) {
      const contraindicationRules = [
        { 
          condition: /heart failure|chf/i, 
          meds: ['NSAIDs', 'Ibuprofen', 'Naproxen', 'Diclofenac', 'Celecoxib', 'Pioglitazone'], 
          message: 'Can cause fluid retention and increase risk of CHF exacerbation.',
          severity: 'Severe' as UnifiedSafetySeverity
        },
        { 
          condition: /asthma|copd/i, 
          meds: ['Propranolol', 'Atenolol', 'Metoprolol', 'Beta Blockers', 'Carvedilol', 'Labetalol'], 
          message: 'Non-selective beta-blockers can trigger severe bronchospasm.',
          severity: 'Severe' as UnifiedSafetySeverity
        },
        { 
          condition: /diabetes|hyperglycemia/i, 
          meds: ['Prednisone', 'Dexamethasone', 'Steroids', 'Hydrocortisone'], 
          message: 'Corticosteroids significantly elevate blood glucose levels.',
          severity: 'Moderate' as UnifiedSafetySeverity
        },
        { 
          condition: /peptic ulcer|gastritis|gastro/i, 
          meds: ['NSAIDs', 'Aspirin', 'Ibuprofen', 'Anticoagulants', 'Warfarin', 'Rivaroxaban'], 
          message: 'Increases risk of gastrointestinal bleeding/perforation.',
          severity: 'Severe' as UnifiedSafetySeverity
        },
        { 
          condition: /pregnancy|pregnant/i, 
          meds: ['Lisinopril', 'Enalapril', 'Losartan', 'Valsartan', 'Statins', 'Warfarin', 'Methotrexate', 'Phenytoin', 'Valproic Acid'], 
          message: 'Teratogenic risk: Contraindicated in pregnancy.',
          severity: 'Contraindicated' as UnifiedSafetySeverity
        },
        {
          condition: /hypertension/i,
          meds: ['Pseudoephedrine', 'Phenylephrine', 'NSAIDs'],
          message: 'May increase blood pressure or antagonize antihypertensive therapy.',
          severity: 'Moderate' as UnifiedSafetySeverity
        },
        {
          condition: /glaucoma/i,
          meds: ['Atropine', 'Scopolamine', 'Amitriptyline', 'Diphenhydramine'],
          message: 'Anticholinergics can exacerbate narrow-angle glaucoma.',
          severity: 'Major' as UnifiedSafetySeverity
        },
        {
          condition: /gout/i,
          meds: ['Thiazide', 'Hydrochlorothiazide', 'Aspirin'],
          message: 'May increase uric acid levels and trigger gout flares.',
          severity: 'Moderate' as UnifiedSafetySeverity
        },
        {
          condition: /bradycardia|heart block/i,
          meds: ['Beta Blockers', 'Propranolol', 'Metoprolol', 'Atenolol', 'Verapamil', 'Diltiazem', 'Digoxin'],
          message: 'May further decrease heart rate and worsen heart block.',
          severity: 'Severe' as UnifiedSafetySeverity
        },
        {
          condition: /parkinson/i,
          meds: ['Metoclopramide', 'Prochlorperazine', 'Promethazine', 'Haloperidol', 'Risperidone'],
          message: 'Dopamine antagonists may exacerbate Parkinsonian extrapyramidal symptoms.',
          severity: 'Major' as UnifiedSafetySeverity
        },
        {
          condition: /dementia|alzheimer/i,
          meds: ['Amitriptyline', 'Diphenhydramine', 'Oxybutynin', 'Hydroxyzine', 'Scopolamine'],
          message: 'Anticholinergic drugs deteriorate cognitive function in dementia.',
          severity: 'Major' as UnifiedSafetySeverity
        },
        {
          condition: /benign prostatic hyperplasia|bph/i,
          meds: ['Amitriptyline', 'Diphenhydramine', 'Pseudoephedrine', 'Phenylephrine'],
          message: 'May precipitate acute urinary retention in BPH.',
          severity: 'Moderate' as UnifiedSafetySeverity
        }
      ];

      contraindicationRules.forEach(rule => {
        const matchingCondition = combinedConditions.find(c => rule.condition.test(c));
        if (!matchingCondition) return;

        for (const med of activeMeds) {
          const matchMed = rule.meds.some(pattern => med.name.toLowerCase().includes(pattern.toLowerCase()));
          if (matchMed) {
            subResults.drugDisease.push({
              id: `drug-disease-${med.name}-${matchingCondition}`,
              sourceEngine: 'Drug-Disease',
              severity: rule.severity,
              drug: med.name,
              title: `Drug-Disease Contraindication (${med.name} & ${matchingCondition})`,
              message: rule.message,
              actionRequired: 'Evaluate therapeutic alternative or adjust clinical monitoring.'
            });
          }
        }
      });
    }

    // --- 4. PREGNANCY SUB-ENGINE ---
    const isFemale = patient.gender?.toLowerCase() === 'female' || (patient as any).isFemale;
    const patientAge = patient.age || 30;
    const isChildbearingAge = isFemale && patientAge >= 12 && patientAge <= 55;

    // Structured pregnancy status determination
    let pregnancyStatus: 'unknown' | 'not_pregnant' | 'pregnant' | 'postpartum' = 
      patient.pregnancyProfile?.status || 'unknown';

    // If status was not explicitly structured in profile, infer from clinical text
    if (patient.pregnancyProfile?.status === undefined) {
      const hasPregnancyCondition = 
        /pregnan|gestat/i.test(diagnosisName) || 
        patient.chronicConditions?.some((c: string) => /pregnan|gestat/i.test(c)) ||
        false;
      if (hasPregnancyCondition) {
        pregnancyStatus = 'pregnant';
      } else if (isChildbearingAge) {
        pregnancyStatus = 'unknown'; // UNKNOWN ≠ NO
      } else {
        pregnancyStatus = 'not_pregnant';
      }
    }

    // High Teratogenicity / High Fetal Risk medications map for UNKNOWN status checks
    const TERATOGENIC_MEDS = [
      'lisinopril', 'enalapril', 'ramipril', 'captopril', 'losartan', 'valsartan', 'candesartan',
      'atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'warfarin', 'methotrexate',
      'isotretinoin', 'valproic acid', 'valproate', 'phenytoin', 'carbamazepine', 'topiramate', 'misoprostol'
    ];

    if (pregnancyStatus === 'pregnant') {
      const trimester = patient.pregnancyProfile?.trimester || input.options?.trimester || 1;
      for (const med of activeMeds) {
        const evalPreg = evaluatePregnancySafety(med.name, true, trimester);
        if (evalPreg.riskLevel === 'Contraindicated' || evalPreg.riskLevel === 'High') {
          const mappedSev: UnifiedSafetySeverity = evalPreg.riskLevel === 'Contraindicated' ? 'Contraindicated' : 'Severe';
          subResults.pregnancy.push({
            id: `pregnancy-${med.name}`,
            sourceEngine: 'Pregnancy',
            severity: mappedSev,
            drug: med.name,
            title: `Pregnancy Risk Alert (${med.name} - Trimester ${trimester})`,
            message: `${evalPreg.evidenceSummary}${evalPreg.legacyCategory ? ` [Legacy FDA Category: ${evalPreg.legacyCategory}]` : ''}`,
            actionRequired: evalPreg.overallRecommendation
          });
        } else if (evalPreg.riskLevel === 'Moderate') {
          subResults.pregnancy.push({
            id: `pregnancy-${med.name}`,
            sourceEngine: 'Pregnancy',
            severity: 'Moderate',
            drug: med.name,
            title: `Pregnancy Caution (${med.name})`,
            message: `${evalPreg.evidenceSummary}${evalPreg.legacyCategory ? ` [Legacy FDA Category: ${evalPreg.legacyCategory}]` : ''}`,
            actionRequired: evalPreg.overallRecommendation
          });
        }
      }
    } else if (pregnancyStatus === 'unknown' && isChildbearingAge) {
      // CLINICAL SAFETY PRINCIPLE: UNKNOWN ≠ NO
      for (const med of activeMeds) {
        const isTeratogenic = TERATOGENIC_MEDS.some(t => med.name.toLowerCase().includes(t));
        if (isTeratogenic) {
          subResults.pregnancy.push({
            id: `pregnancy-unverified-${med.name}`,
            sourceEngine: 'Pregnancy',
            severity: 'Major',
            drug: med.name,
            title: `Unverified Pregnancy Status (Female Age ${patientAge}) - ${med.name}`,
            message: `CLINICAL PRINCIPLE: Unknown ≠ No. Patient pregnancy status is unverified/unknown. ${med.name} carries significant teratogenic or fetal toxicity risks.`,
            actionRequired: 'Verify pregnancy status (e.g. Urine or Serum HCG test) before dispensing or administering therapy.'
          });
        }
      }
    }

    // --- 5. LACTATION SUB-ENGINE ---
    let isLactating = false;
    if (patient.pregnancyProfile?.lactationStatus) {
      isLactating = patient.pregnancyProfile.lactationStatus === 'lactating';
    } else {
      isLactating = isFemale && (
        /lactat|breastfeed|nursing/i.test(diagnosisName) ||
        patient.chronicConditions?.some((c: string) => /lactat|breastfeed|nursing/i.test(c)) ||
        false
      );
    }

    if (isLactating) {
      for (const med of activeMeds) {
        const evalLac = evaluateLactationSafety(med.name, true);
        if (evalLac.infantRisk === 'Contraindicated' || evalLac.infantRisk === 'High') {
          const mappedSev: UnifiedSafetySeverity = evalLac.infantRisk === 'Contraindicated' ? 'Contraindicated' : 'Severe';
          subResults.lactation.push({
            id: `lactation-${med.name}`,
            sourceEngine: 'Lactation',
            severity: mappedSev,
            drug: med.name,
            title: `Lactation Safety Risk (${med.name})`,
            message: evalLac.clinicalAdvice,
            actionRequired: evalLac.alternativeDrug ? `Consider alternative: ${evalLac.alternativeDrug}` : 'Discontinue during breastfeeding.'
          });
        } else if (evalLac.infantRisk === 'Moderate') {
          subResults.lactation.push({
            id: `lactation-${med.name}`,
            sourceEngine: 'Lactation',
            severity: 'Moderate',
            drug: med.name,
            title: `Lactation Caution (${med.name})`,
            message: evalLac.clinicalAdvice,
            actionRequired: 'Monitor infant for sedation, rash, or GI distress.'
          });
        }
      }
    }

    // --- 6. PEDIATRIC SUB-ENGINE ---
    const hasRenalCond = patient.chronicConditions?.some((c: string) => /kidney|renal|ckd|nephro|dialysis/i.test(c)) ||
      /kidney|renal|ckd|nephro|dialysis/i.test(diagnosisName);

    const hasHepaticCond = patient.chronicConditions?.some((c: string) => /liver|hepatic|cirrhosis|hepatitis/i.test(c)) ||
      /liver|hepatic|cirrhosis|hepatitis/i.test(diagnosisName);

    if (patient.age !== undefined && patient.age > 0 && patient.age < 18) {
      const patientWeightKg = vitals?.weightKg || (patient as any).weightKg;

      for (const med of activeMeds) {
        // Extract prescribed numerical mg dose from dosage string (e.g. "250 mg" -> 250)
        let prescribedDoseMg: number | undefined;
        if (med.dosage) {
          const m = med.dosage.match(/(\d+(\.\d+)?)\s*mg/i);
          if (m) prescribedDoseMg = parseFloat(m[1]);
        }

        const pedEval = evaluatePediatricDosing({
          drugName: med.name,
          ageYears: patient.age,
          weightKg: patientWeightKg,
          prescribedDoseMg,
          prescribedFrequency: med.frequency,
          indication: diagnosisName,
          renalImpairment: hasRenalCond,
          hepaticImpairment: hasHepaticCond
        });

        for (const alert of pedEval.alerts) {
          let mappedSev: UnifiedSafetySeverity = 'Moderate';
          if (alert.severity === 'Contraindicated') mappedSev = 'Contraindicated';
          else if (alert.severity === 'Severe') mappedSev = 'Severe';
          else if (alert.severity === 'Major') mappedSev = 'Major';
          else if (alert.severity === 'Moderate') mappedSev = 'Moderate';
          else mappedSev = 'Minor';

          subResults.pediatric.push({
            id: alert.id,
            sourceEngine: 'Pediatric',
            severity: mappedSev,
            drug: med.name,
            title: alert.title,
            message: alert.message,
            actionRequired: alert.actionRequired
          });
        }
      }
    }

    // --- 7 & 8. RENAL & HEPATIC SUB-ENGINES ---
    const labCreatinine = labs ? parseFloat(labs.find(l => l.testName.toLowerCase().includes('creatinine'))?.value || '') : undefined;
    const labALT = labs ? parseFloat(labs.find(l => l.testName.toLowerCase().includes('alt'))?.value || '') : undefined;
    const weightKg = vitals?.weightKg || 70;

    for (const med of activeMeds) {
      const renalHepaticRes = evaluateRenalHepaticDosing({
        medicationName: med.name,
        age: patient.age,
        weightKg: weightKg,
        serumCreatinineMgDl: labCreatinine,
        sex: isFemale ? 'female' : 'male'
      });

      if (hasRenalCond || renalHepaticRes.renalAlert || (med as any).renal_adjustment_required) {
        subResults.renal.push({
          id: `renal-${med.name}`,
          sourceEngine: 'Renal',
          severity: renalHepaticRes.renalAlert ? 'Severe' : 'Moderate',
          drug: med.name,
          title: `Renal Dosing Guidance (${med.name})`,
          message: (med as any).renal_dose_guidance || renalHepaticRes.summaryGuidance.join(' ') || 'Dose adjustment required based on eGFR / CrCl.',
          actionRequired: renalHepaticRes.recommendedRenalDose || 'Adjust dosage per renal clearance calculation.'
        });
      }

      if (hasHepaticCond || renalHepaticRes.hepaticAlert || (labALT && labALT > 100)) {
        subResults.hepatic.push({
          id: `hepatic-${med.name}`,
          sourceEngine: 'Hepatic',
          severity: 'Major',
          drug: med.name,
          title: `Hepatic Impairment Guidance (${med.name})`,
          message: renalHepaticRes.recommendedHepaticDose || 'Use with caution in liver impairment. Monitor LFTs.',
          actionRequired: 'Reduce starting dose or monitor liver function closely.'
        });
      }
    }

    // --- 9. DUPLICATE THERAPY SUB-ENGINE ---
    if (medNames.length >= 2) {
      const dupAlerts: DuplicateTherapyAlert[] = checkDuplicateTherapy(medNames);
      for (const dup of dupAlerts) {
        const mappedSev: UnifiedSafetySeverity = dup.severity === 'Severe' ? 'Severe' : 'Major';
        subResults.duplicateTherapy.push({
          id: `duplicate-${dup.drugClass}`,
          sourceEngine: 'DuplicateTherapy',
          severity: mappedSev,
          drug: dup.duplicatingDrugs.join(' + '),
          title: `Therapeutic Duplication (${dup.drugClass})`,
          message: `${dup.duplicatingDrugs.join(' and ')} belong to the same therapeutic class (${dup.drugClass}). ${dup.clinicalRisk}`,
          actionRequired: dup.recommendation
        });
      }
    }

    // --- 10. MAXIMUM DOSE CEILING SUB-ENGINE ---
    for (const med of activeMeds) {
      const maxMg = (med as any).max_daily_dose_mg;
      if (maxMg && med.dosage) {
        const matchDose = med.dosage.match(/(\d+(\.\d+)?)\s*mg/i);
        const doseMg = matchDose ? parseFloat(matchDose[1]) : 0;
        
        let multiplier = 1;
        const freq = (med.frequency || "").toLowerCase();
        if (freq.includes("qid") || freq.includes("6 hour") || freq.includes("4 times")) multiplier = 4;
        else if (freq.includes("tid") || freq.includes("8 hour") || freq.includes("3 times")) multiplier = 3;
        else if (freq.includes("bid") || freq.includes("12 hour") || freq.includes("2 times")) multiplier = 2;
        else if (freq.includes("q4h") || freq.includes("every 4 hours")) multiplier = 6;

        const totalDaily = doseMg * multiplier;
        if (totalDaily > maxMg) {
          subResults.maxDose.push({
            id: `maxdose-${med.name}`,
            sourceEngine: 'MaxDose',
            severity: 'Severe',
            drug: med.name,
            title: `Maximum Safe Daily Dose Exceeded (${med.name})`,
            message: `Prescribed total daily dose (~${totalDaily} mg) exceeds maximum recommended threshold of ${maxMg} mg/day.`,
            actionRequired: `Reduce dose or frequency to remain below ${maxMg} mg/day.`
          });
        }
      }
    }

    // --- 11. EMERGENCY & GERIATRIC RULES SUB-ENGINE ---
    // Geriatric Beers Criteria
    if (patient.age && patient.age >= 65) {
      const BeersPIMs = [
        { meds: ['Amitriptyline', 'Nortriptyline', 'Imipramine'], message: 'Highly anticholinergic; risk of orthostatic hypotension, confusion, and falls.' },
        { meds: ['Diphenhydramine', 'Hydroxyzine'], message: 'High risk of cognitive impairment, dry mouth, and urinary retention.' },
        { meds: ['Diazepam', 'Alprazolam', 'Chlordiazepoxide'], message: 'Increased risk of motor impairment, delirium, ataxia, and hip fractures.' },
        { meds: ['Glyburide'], message: 'High risk of severe prolonged hypoglycemia in elderly.' },
        { meds: ['Indomethacin', 'Ketorolac'], message: 'Increased risk of acute kidney injury and GI ulceration.' }
      ];

      BeersPIMs.forEach(rule => {
        const found = activeMeds.find(m => rule.meds.some(p => m.name.toLowerCase().includes(p.toLowerCase())));
        if (found) {
          subResults.emergencyRules.push({
            id: `beers-${found.name}`,
            sourceEngine: 'EmergencyRules',
            severity: 'Major',
            drug: found.name,
            title: `Geriatric Safety (Beers Criteria) - ${found.name}`,
            message: rule.message,
            actionRequired: 'Deprescribe or replace with safer age-adjusted agent.'
          });
        }
      });
    }

    // Emergency Vitals Check
    if (vitals) {
      if (vitals.bp) {
        const [sbp] = vitals.bp.split('/').map((s: string) => parseInt(s.trim(), 10));
        if (sbp && sbp >= 180) {
          subResults.emergencyRules.push({
            id: 'emergency-hypertension',
            sourceEngine: 'EmergencyRules',
            severity: 'Severe',
            title: 'Emergency Safety Flag: Hypertensive Crisis',
            message: `Systolic BP is ${sbp} mmHg (>= 180 mmHg). High risk of acute end-organ damage.`,
            actionRequired: 'Immediate emergency medical stabilization required.'
          });
        }
      }

      if (vitals.hr) {
        const hr = typeof vitals.hr === 'number' ? vitals.hr : parseInt(vitals.hr, 10);
        if (hr && hr < 45) {
          subResults.emergencyRules.push({
            id: 'emergency-bradycardia',
            sourceEngine: 'EmergencyRules',
            severity: 'Severe',
            title: 'Emergency Safety Flag: Severe Bradycardia',
            message: `Heart rate is ${hr} bpm (< 45 bpm).`,
            actionRequired: 'Hold all AV-nodal blocking agents (Beta-blockers, CCBs, Digoxin).'
          });
        }
      }
    }

    // --- ARBITRATION & FINAL DECISION ---
    return this.arbitrate(subResults);
  }

  /**
   * Deterministic Arbitration across all sub-engine results
   */
  private static arbitrate(subResults: SubEngineResults): UnifiedSafetyReport {
    const allAlerts: UnifiedSafetyAlert[] = Object.values(subResults).flat();

    // Severity order weights
    const severityWeight: Record<UnifiedSafetySeverity, number> = {
      'Contraindicated': 5,
      'Severe': 4,
      'Major': 3,
      'Moderate': 2,
      'Minor': 1
    };

    let maxWeight = 0;
    let maxSeverity: UnifiedSafetySeverity = 'Minor';

    allAlerts.forEach(a => {
      const w = severityWeight[a.severity] || 0;
      if (w > maxWeight) {
        maxWeight = w;
        maxSeverity = a.severity;
      }
    });

    let overallStatus: OverallSafetyStatus = 'SAFE';
    let isPrescriptionBlocked = false;

    if (maxWeight >= 4) { // Contraindicated or Severe
      overallStatus = 'CONTRAINDICATED';
      isPrescriptionBlocked = true;
    } else if (maxWeight === 3) { // Major
      overallStatus = 'WARNING';
      isPrescriptionBlocked = false;
    } else if (maxWeight === 2) { // Moderate
      overallStatus = 'CAUTION';
      isPrescriptionBlocked = false;
    } else {
      overallStatus = 'SAFE';
      isPrescriptionBlocked = false;
    }

    const criticalCount = allAlerts.filter(a => a.severity === 'Contraindicated' || a.severity === 'Severe').length;

    let summary = 'No significant clinical safety alerts identified. Prescription signed-off safe.';
    if (overallStatus === 'CONTRAINDICATED') {
      summary = `CRITICAL CONTRAINDICATION DETECTED (${criticalCount} critical alert(s)). Prescription is BLOCKED until clinical override or modification.`;
    } else if (overallStatus === 'WARNING') {
      summary = `Major clinical safety warnings identified (${allAlerts.length} total alert(s)). Require clinical review before proceeding.`;
    } else if (overallStatus === 'CAUTION') {
      summary = `Moderate clinical cautions identified (${allAlerts.length} total alert(s)). Monitor patient during therapy.`;
    }

    return {
      overallStatus,
      maxSeverity,
      isPrescriptionBlocked,
      summary,
      totalAlertsCount: allAlerts.length,
      criticalAlertsCount: criticalCount,
      alerts: allAlerts.sort((a, b) => (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0)),
      subEngineResults: subResults,
      evaluatedAt: new Date().toISOString()
    };
  }
}
