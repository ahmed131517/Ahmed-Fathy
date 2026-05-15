import { db } from '@/lib/db';
import { parseJsonResponse } from "@/utils/gemini";
import { clinicalAIRequest } from './aiWorkflowService';
import { getInteractionCheckPrompt } from "./aiConfig";
import { ddiService, InteractionResult } from "./ddiService";
import { RulesEngineService } from "./rules.service";
import { ClinicalRule } from "../types/rules";
import { RENAL_HEPATIC_RULES } from "@/data/renalHepaticRules";
import { ClinicalCalculators } from "./clinical.calculators";
import { THERAPEUTIC_GAP_RULES } from "@/data/therapeuticGaps";
import { INDICATION_RULES } from "@/data/indicationMap";

export interface OrganSafetyAlert {
  type: 'Renal' | 'Hepatic';
  severity: 'Major' | 'Moderate' | 'Minor';
  message: string;
  drug: string;
}

export interface TherapeuticGapAlert {
  id: string;
  condition: string;
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  clinicalContext?: string;
  evidence?: string;
  guidelineUrl?: string;
}

export interface IndicationAlert {
  drug: string;
  message: string;
  severity: 'Moderate' | 'Minor';
}

/**
 * ClinicalIntelligenceService centralizes advanced clinical logic:
 * - Comprehensive Drug-Drug Interactions (DDI)
 * - Organ function safety checks (Renal/Hepatic)
 * - Therapeutic Gap Analysis
 * - Indication Auditing (Medication without indication)
 * - Rule-based clinical alerts
 */
export const ClinicalIntelligenceService = {
  
  /**
   * Audits medication list to ensure every medication has a corresponding indication.
   */
  async auditMedicationIndications(
    medicationNames: string[],
    conditions: string[]
  ): Promise<IndicationAlert[]> {
    const alerts: IndicationAlert[] = [];

    medicationNames.forEach(medName => {
      const rule = INDICATION_RULES.find(r => 
        medName.toLowerCase() === r.medication.toLowerCase() ||
        medName.toLowerCase().includes(r.medication.toLowerCase())
      );

      if (rule) {
        // Check if any condition matches a valid indication for this drug
        const hasIndication = conditions.some(cond => 
          rule.validConditions.some(validCond => 
            new RegExp(validCond, 'i').test(cond)
          )
        );

        if (!hasIndication) {
          alerts.push({
            drug: medName,
            message: rule.message,
            severity: 'Moderate'
          });
        }
      }
    });

    return alerts;
  },
  
  /**
   * Analyzes therapeutic gaps between patient conditions and medications.
   */
  async checkTherapeuticGaps(
    conditions: string[], 
    medicationNames: string[]
  ): Promise<TherapeuticGapAlert[]> {
    const alerts: TherapeuticGapAlert[] = [];
    
    // 1. Get drug classes for all active medications
    const allDrugs = await db.drugs.toArray();
    const activeDrugClasses = new Set<string>();
    
    medicationNames.forEach(name => {
      const dbDrug = allDrugs.find(d => 
        d.generic_name.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(d.generic_name.toLowerCase())
      );
      if (dbDrug && dbDrug.drug_class) {
        activeDrugClasses.add(dbDrug.drug_class);
      }
    });

    // 2. Evaluate each gap rule
    THERAPEUTIC_GAP_RULES.forEach(rule => {
      // Check if patient has the condition
      const hasCondition = conditions.some(c => 
        new RegExp(rule.conditionRegex, 'i').test(c)
      );

      if (hasCondition) {
        // Check if any active medication class satisfies the rule
        const isTreated = rule.requiredMedicationClasses.some(reqClass => 
          activeDrugClasses.has(reqClass) ||
          // Also check by name keywords just in case
          medicationNames.some(med => med.toLowerCase().includes(reqClass.toLowerCase()))
        );

        if (!isTreated) {
          alerts.push({
            id: rule.id,
            condition: rule.condition,
            message: rule.message,
            priority: rule.priority,
            clinicalContext: rule.clinicalContext,
            evidence: rule.evidence,
            guidelineUrl: rule.guidelineUrl
          });
        }
      }
    });

    return alerts;
  },

  /**
   * Checks organ function safety (Renal/Hepatic) for a list of medications.
   */
  checkOrganFunctionSafety(medications: string[], context: {
    age?: number;
    weightKg?: number;
    isFemale?: boolean;
    creatinine?: number;
    alt?: number;
    hasLiverDisease?: boolean;
  }): OrganSafetyAlert[] {
    const alerts: OrganSafetyAlert[] = [];
    
    // Calculate eGFR if data available
    let egfr = 0;
    if (context.age && context.weightKg && (context.creatinine !== undefined && context.creatinine > 0)) {
      egfr = ClinicalCalculators.calculateEGFR(
        context.age, 
        context.weightKg, 
        context.creatinine, 
        !!context.isFemale
      );
    }

    medications.forEach(medName => {
      const rules = RENAL_HEPATIC_RULES.filter(r => 
        r.drug.toLowerCase() === medName.toLowerCase() ||
        medName.toLowerCase().includes(r.drug.toLowerCase())
      );

      rules.forEach(rule => {
        let isTriggered = false;
        
        if (rule.type === 'Renal') {
          if (rule.thresholdField === 'eGFR' && egfr > 0) {
            if (rule.operator === '<' && egfr < (rule.thresholdValue || 0)) isTriggered = true;
          }
        } else if (rule.type === 'Hepatic') {
          if (context.hasLiverDisease) isTriggered = true;
          if (context.alt && rule.thresholdField === 'ALT' && context.alt > (rule.thresholdValue || 0)) isTriggered = true;
        }

        if (isTriggered) {
          alerts.push({
            type: rule.type,
            severity: rule.severity,
            message: rule.message,
            drug: medName
          });
        }
      });
    });

    return alerts;
  },
  
  /**
    * Performs comprehensive DDI checks.
    */
  async checkInteractions(medications: string[]): Promise<InteractionResult[]> {
    if (medications.length < 2) return [];

    const results: InteractionResult[] = [];

    // 1. Check Local Database
    try {
      const allDrugs = await db.drugs.toArray();
      const drugIds = medications
        .map(name => allDrugs.find(d => d.generic_name.toLowerCase() === name.toLowerCase())?.id)
        .filter(id => id !== undefined) as number[];

      if (drugIds.length >= 2) {
        const localInteractions = await db.drug_interactions
          .filter(i => drugIds.includes(i.drug1_id) && drugIds.includes(i.drug2_id))
          .toArray();

        localInteractions.forEach(i => {
          const d1 = allDrugs.find(d => d.id === i.drug1_id)?.generic_name || "Unknown";
          const d2 = allDrugs.find(d => d.id === i.drug2_id)?.generic_name || "Unknown";
          results.push({
            source: 'Local Database',
            severity: i.severity,
            description: i.description,
            drugs: [d1, d2]
          });
        });
      }
    } catch (error) {
      console.error("Local interaction check failed:", error);
    }

    // 2. Check Verified Database (RxNav API)
    try {
      const verifiedResults = await ddiService.getVerifiedInteractions(medications);
      results.push(...verifiedResults);
    } catch (error) {
      console.error("Verified interaction check failed:", error);
    }

    // 3. AI Insight
    try {
      const prompt = getInteractionCheckPrompt(medications);
      const responseText = await clinicalAIRequest(
        [{ role: "user", content: prompt }]
      );

      const aiInteractions = parseJsonResponse<any[]>(responseText, []);
      aiInteractions.forEach(i => {
        if (!Array.isArray(i.drugs)) return;
        
        const isDuplicate = results.some(r => {
          if (!Array.isArray(r.drugs)) return false;
          return r.drugs.every(d => i.drugs.some((id: string) => typeof id === 'string' && typeof d === 'string' && id.toLowerCase().includes(d.toLowerCase())))
        });

        if (!isDuplicate) {
          results.push({
            source: 'AI Insight',
            severity: i.severity || 'Unknown',
            description: i.description || 'No description provided.',
            drugs: i.drugs
          });
        }
      });
    } catch (error) {
      console.error("AI interaction check failed:", error);
    }

    return results;
  },

  /**
   * Evaluates clinical rules against patient data (vitals, labs, etc)
   */
  async checkClinicalRules(clinicalData: any): Promise<any[]> {
    // In production, fetch dynamic rules from Supabase
    const activeRules: ClinicalRule[] = [
      {
        id: "hypertension_alert",
        name: "Hypertensive Crisis Alert",
        conditions: [
            { field: 'vitals.bp_systolic', operator: '>', value: 180 },
            { field: 'vitals.bp_diastolic', operator: '>', value: 110 }
        ],
        logic: 'AND',
        action: 'ALERT',
        message: 'BP 180/110+ detected: Potential Hypertensive Crisis.',
        priority: 'high'
      }
    ];

    return RulesEngineService.evaluateRules(clinicalData, activeRules);
  },

  // ... (mapConditionToICD10 placeholder)
};
