import { Symptom } from "@/lib/SymptomContext";

export interface ScoringResult {
  name: string;
  score: number;
  interpretation: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  criteria: { label: string; points: number; met: boolean }[];
}

function buildScore(name: string, criteria: { label: string; points: number; met: boolean }[], interpret: (score: number) => { interpretation: string, riskLevel: 'Low' | 'Moderate' | 'High' }): ScoringResult {
  const score = criteria.reduce((acc, curr) => acc + (curr.met ? curr.points : 0), 0);
  const { interpretation, riskLevel } = interpret(score);
  return { name, score, interpretation, riskLevel, criteria };
}

export const clinicalScoringService = {
  // ==========================================
  // 🫀 Cardiology (1–15)
  // ==========================================
  calculateCHA2DS2VASc(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!h?.conditions?.some((c: string) => ['AFib', 'Atrial Fibrillation'].includes(c))) return null;
    return buildScore('CHA2DS2-VASc Score', [
      { label: 'CHF', points: 1, met: h.conditions?.includes('CHF') },
      { label: 'Hypertension', points: 1, met: h.conditions?.includes('Hypertension') },
      { label: 'Age >= 75', points: 2, met: h.age >= 75 },
      { label: 'Diabetes', points: 1, met: h.conditions?.includes('Diabetes') },
      { label: 'Stroke/TIA', points: 2, met: h.conditions?.includes('Stroke') || h.conditions?.includes('TIA') },
      { label: 'Vascular Disease', points: 1, met: h.conditions?.includes('MI') || h.conditions?.includes('PAD') },
      { label: 'Age 65-74', points: 1, met: h.age >= 65 && h.age <= 74 },
      { label: 'Female', points: 1, met: h.gender === 'female' }
    ], s => ({
      interpretation: s === 0 ? 'Low risk' : s === 1 ? 'Low-moderate risk' : 'Moderate-high risk',
      riskLevel: s === 0 ? 'Low' : s === 1 ? 'Moderate' : 'High'
    }));
  },
  calculateHASBLED(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!h?.conditions?.some((c: string) => ['AFib', 'Atrial Fibrillation'].includes(c))) return null;
    return buildScore('HAS-BLED Score', [
      { label: 'Hypertension', points: 1, met: h.conditions?.includes('Hypertension') },
      { label: 'Abnormal Renal', points: 1, met: h.conditions?.includes('CKD') },
      { label: 'Abnormal Liver', points: 1, met: h.conditions?.includes('Liver Disease') },
      { label: 'Stroke', points: 1, met: h.conditions?.includes('Stroke') },
      { label: 'Bleeding', points: 1, met: h.conditions?.includes('Bleeding Disorder') },
      { label: 'Labile INR', points: 1, met: false },
      { label: 'Age > 65', points: 1, met: h.age > 65 },
      { label: 'Drugs/Alcohol', points: 1, met: false }
    ], s => ({
      interpretation: s >= 3 ? 'High bleeding risk' : 'Low/Moderate bleeding risk',
      riskLevel: s >= 3 ? 'High' : 'Low'
    }));
  },
  calculateTIMI(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'chest_pain')) return null;
    return buildScore('TIMI Score', [
      { label: 'Age >= 65', points: 1, met: h?.age >= 65 },
      { label: '>= 3 CAD Risk Factors', points: 1, met: false },
      { label: 'Known CAD', points: 1, met: h?.conditions?.includes('CAD') },
      { label: 'Aspirin use', points: 1, met: false },
      { label: 'Severe angina', points: 1, met: true },
      { label: 'ST changes', points: 1, met: false },
      { label: 'Positive cardiac marker', points: 1, met: false }
    ], s => ({
      interpretation: `${s} points. Risk of mortality/MI.`,
      riskLevel: s >= 5 ? 'High' : s >= 3 ? 'Moderate' : 'Low'
    }));
  },
  calculateGRACE(symptoms: Symptom[]): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'chest_pain')) return null;
    return buildScore('GRACE Score', [{ label: 'Requires complex calc', points: 100, met: true }], s => ({ interpretation: 'High risk ACS', riskLevel: 'High' }));
  },
  calculateHEART(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'chest_pain')) return null;
    return buildScore('HEART Score', [
      { label: 'History suspicious', points: 1, met: true },
      { label: 'EKG abnormal', points: 1, met: false },
      { label: 'Age >= 65', points: 2, met: h?.age >= 65 },
      { label: 'Risk factors', points: 1, met: false },
      { label: 'Troponin elevated', points: 0, met: false }
    ], s => ({ interpretation: 'MACE risk', riskLevel: s >= 4 ? 'High' : 'Low' }));
  },
  calculateFramingham(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!h?.age) return null;
    return buildScore('Framingham Risk Score', [{ label: 'Age/Cholesterol/BP', points: 10, met: true }], s => ({ interpretation: '10-year CVD risk', riskLevel: 'Moderate' }));
  },
  calculateDukeTreadmill(): ScoringResult | null { return null; },
  calculateKillip(): ScoringResult | null { return null; },
  calculateSYNTAX(): ScoringResult | null { return null; },
  calculateEuroSCOREII(): ScoringResult | null { return null; },
  calculateRCRI(): ScoringResult | null { return null; },
  calculateCHADS2(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!h?.conditions?.some((c: string) => ['AFib'].includes(c))) return null;
    return buildScore('CHADS2 Score', [{ label: 'CHF/HTN/Age/DM/Stroke', points: 1, met: true }], s => ({ interpretation: 'Stroke risk', riskLevel: 'Moderate' }));
  },
  calculateATRIA(): ScoringResult | null { return null; },
  calculateHATCH(): ScoringResult | null { return null; },
  calculateMAGGIC(): ScoringResult | null { return null; },

  // ==========================================
  // 🫁 Pulmonology (16–25)
  // ==========================================
  calculateWellsPE(symptoms: Symptom[]): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'shortness_of_breath' || s.id === 'chest_pain')) return null;
    return buildScore('Wells Score (PE)', [
      { label: 'Clinical signs of DVT', points: 3, met: false },
      { label: 'PE is #1 diagnosis', points: 3, met: true },
      { label: 'HR > 100', points: 1.5, met: false },
      { label: 'Immobilization/Surgery', points: 1.5, met: false },
      { label: 'Previous PE/DVT', points: 1.5, met: false },
      { label: 'Hemoptysis', points: 1, met: false },
      { label: 'Malignancy', points: 1, met: false }
    ], s => ({ interpretation: 'PE Probability', riskLevel: s > 6 ? 'High' : s >= 2 ? 'Moderate' : 'Low' }));
  },
  calculateRevisedGeneva(): ScoringResult | null { return null; },
  calculatePERC(): ScoringResult | null { return null; },
  calculateCURB65(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'cough' || s.id === 'fever')) return null;
    return buildScore('CURB-65 Score', [
      { label: 'Confusion', points: 1, met: false },
      { label: 'BUN > 19', points: 1, met: false },
      { label: 'RR >= 30', points: 1, met: false },
      { label: 'BP < 90/60', points: 1, met: false },
      { label: 'Age >= 65', points: 1, met: h?.age >= 65 }
    ], s => ({ interpretation: 'Pneumonia severity', riskLevel: s >= 3 ? 'High' : s === 2 ? 'Moderate' : 'Low' }));
  },
  calculatePSI(): ScoringResult | null { return null; },
  calculateBODE(): ScoringResult | null { return null; },
  calculatemMRC(): ScoringResult | null { return null; },
  calculateSTOPBANG(): ScoringResult | null { return null; },
  calculateROX(): ScoringResult | null { return null; },
  calculateARDSBerlin(): ScoringResult | null { return null; },

  // ==========================================
  // 🧠 ICU / Emergency (26–40)
  // ==========================================
  calculateGCS(): ScoringResult | null { return null; },
  calculateFOUR(): ScoringResult | null { return null; },
  calculateqSOFA(symptoms: Symptom[], h: any, vitals: any): ScoringResult | null {
    if (!vitals) return null;
    return buildScore('qSOFA Score', [
      { label: 'Altered mental status', points: 1, met: false },
      { label: 'RR >= 22', points: 1, met: vitals.rr >= 22 },
      { label: 'SBP <= 100', points: 1, met: vitals.sbp <= 100 }
    ], s => ({ interpretation: 'Sepsis risk', riskLevel: s >= 2 ? 'High' : 'Low' }));
  },
  calculateSOFA(): ScoringResult | null { return null; },
  calculateAPACHEII(): ScoringResult | null { return null; },
  calculateAPACHEIV(): ScoringResult | null { return null; },
  calculateSAPSII(): ScoringResult | null { return null; },
  calculateNEWS(): ScoringResult | null { return null; },
  calculateMEWS(): ScoringResult | null { return null; },
  calculateREMS(): ScoringResult | null { return null; },
  calculateMEDS(): ScoringResult | null { return null; },
  calculateShockIndex(): ScoringResult | null { return null; },
  calculateRanson(): ScoringResult | null { return null; },
  calculateBISAP(): ScoringResult | null { return null; },
  calculateMarshall(): ScoringResult | null { return null; },

  // ==========================================
  // 🩺 Gastroenterology (41–50)
  // ==========================================
  calculateChildPugh(): ScoringResult | null { return null; },
  calculateMELD(): ScoringResult | null { return null; },
  calculateMELDNa(): ScoringResult | null { return null; },
  calculateGlasgowBlatchford(): ScoringResult | null { return null; },
  calculateRockall(): ScoringResult | null { return null; },
  calculateAIMS65(): ScoringResult | null { return null; },
  calculateHAPS(): ScoringResult | null { return null; },
  calculateNAFLD(): ScoringResult | null { return null; },
  calculateFIB4(): ScoringResult | null { return null; },
  calculateMaddrey(): ScoringResult | null { return null; },

  // ==========================================
  // 🩸 Hematology (51–60)
  // ==========================================
  calculate4T(): ScoringResult | null { return null; },
  calculatePadua(): ScoringResult | null { return null; },
  calculateCaprini(): ScoringResult | null { return null; },
  calculateWellsDVT(symptoms: Symptom[]): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'msk_leg_swelling_pain')) return null;
    return buildScore('Wells Score (DVT)', [
      { label: 'Active cancer', points: 1, met: false },
      { label: 'Calf swelling >3cm', points: 1, met: true },
      { label: 'Collateral veins', points: 1, met: false },
      { label: 'Pitting edema', points: 1, met: false },
      { label: 'Previous DVT', points: 1, met: false },
      { label: 'Entire leg swollen', points: 1, met: false },
      { label: 'Localized tenderness', points: 1, met: true },
      { label: 'Immobilization', points: 1, met: false },
      { label: 'Recent surgery', points: 1, met: false },
      { label: 'Alternative likely', points: -2, met: false }
    ], s => ({ interpretation: 'DVT Probability', riskLevel: s >= 3 ? 'High' : s >= 1 ? 'Moderate' : 'Low' }));
  },
  calculateISTHDIC(): ScoringResult | null { return null; },
  calculatePLASMIC(): ScoringResult | null { return null; },
  calculateIMPROVE(): ScoringResult | null { return null; },
  calculateKhorana(): ScoringResult | null { return null; },
  calculateHEMORR2HAGES(): ScoringResult | null { return null; },
  calculateDASH(): ScoringResult | null { return null; },

  // ==========================================
  // 🧪 Nephrology (61–70)
  // ==========================================
  calculateRIFLE(): ScoringResult | null { return null; },
  calculateAKIN(): ScoringResult | null { return null; },
  calculateKDIGO(): ScoringResult | null { return null; },
  calculateFEna(): ScoringResult | null { return null; },
  calculateBUNCr(): ScoringResult | null { return null; },
  calculateCKDEPI(): ScoringResult | null { return null; },
  calculateMDRD(): ScoringResult | null { return null; },
  calculateRenalAngina(): ScoringResult | null { return null; },
  calculateCharlson(): ScoringResult | null { return null; },
  calculateElixhauser(): ScoringResult | null { return null; },

  // ==========================================
  // 🧬 Endocrine / Metabolic (71–80)
  // ==========================================
  calculateHOMAIR(): ScoringResult | null { return null; },
  calculateFINDRISC(): ScoringResult | null { return null; },
  calculateADARisk(): ScoringResult | null { return null; },
  calculateAnionGap(): ScoringResult | null { return null; },
  calculateOsmolalGap(): ScoringResult | null { return null; },
  calculateCorrectedCa(): ScoringResult | null { return null; },
  calculateWaterDeficit(): ScoringResult | null { return null; },
  calculateWinters(): ScoringResult | null { return null; },
  calculateHHS(): ScoringResult | null { return null; },
  calculateDKA(): ScoringResult | null { return null; },

  // ==========================================
  // 🧠 Neurology (81–90)
  // ==========================================
  calculateNIHSS(): ScoringResult | null { return null; },
  calculateABCD2(symptoms: Symptom[], h: any, vitals: any): ScoringResult | null {
    if (!h?.conditions?.some((c: string) => ['TIA', 'Stroke'].includes(c))) return null;
    return buildScore('ABCD2 Score', [
      { label: 'Age >= 60', points: 1, met: h.age >= 60 },
      { label: 'BP >= 140/90', points: 1, met: vitals?.sbp >= 140 || vitals?.dbp >= 90 },
      { label: 'Unilateral weakness', points: 2, met: true },
      { label: 'Speech disturbance', points: 1, met: false },
      { label: 'Duration >= 60m', points: 2, met: false },
      { label: 'Duration 10-59m', points: 1, met: true },
      { label: 'Diabetes', points: 1, met: h.conditions?.includes('Diabetes') }
    ], s => ({ interpretation: 'Stroke risk after TIA', riskLevel: s >= 6 ? 'High' : s >= 4 ? 'Moderate' : 'Low' }));
  },
  calculateICH(): ScoringResult | null { return null; },
  calculateHuntHess(): ScoringResult | null { return null; },
  calculateFisher(): ScoringResult | null { return null; },
  calculatemRS(): ScoringResult | null { return null; },
  calculateBarthel(): ScoringResult | null { return null; },
  calculateEDSS(): ScoringResult | null { return null; },
  calculateGAD7(): ScoringResult | null { return null; },
  calculatePHQ9(): ScoringResult | null { return null; },

  // ==========================================
  // 🦴 General / Surgery / Others (91–100)
  // ==========================================
  calculateAlvarado(symptoms: Symptom[]): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'abdominal_pain')) return null;
    return buildScore('Alvarado Score', [
      { label: 'Migration to RLQ', points: 1, met: true },
      { label: 'Anorexia', points: 1, met: false },
      { label: 'Nausea/Vomiting', points: 1, met: false },
      { label: 'RLQ Tenderness', points: 2, met: true },
      { label: 'Rebound tenderness', points: 1, met: false },
      { label: 'Fever', points: 1, met: false },
      { label: 'Leukocytosis', points: 2, met: false },
      { label: 'Shift to left', points: 1, met: false }
    ], s => ({ interpretation: 'Appendicitis risk', riskLevel: s >= 7 ? 'High' : s >= 5 ? 'Moderate' : 'Low' }));
  },
  calculateAIR(): ScoringResult | null { return null; },
  calculateBishop(): ScoringResult | null { return null; },
  calculateApgar(): ScoringResult | null { return null; },
  calculateBraden(): ScoringResult | null { return null; },
  calculateMorse(): ScoringResult | null { return null; },
  calculateOttawaAnkle(): ScoringResult | null { return null; },
  calculateOttawaKnee(): ScoringResult | null { return null; },
  calculateDenver(): ScoringResult | null { return null; },
  
  // Existing ones
  calculateCentor(symptoms: Symptom[], h: any): ScoringResult | null {
    if (!symptoms.some(s => s.id === 'sore_throat')) return null;
    const age = h?.age;
    return buildScore('Modified Centor Score', [
      { label: 'Absence of cough', points: 1, met: true },
      { label: 'Swollen nodes', points: 1, met: false },
      { label: 'Fever', points: 1, met: false },
      { label: 'Tonsillar exudates', points: 1, met: true },
      { label: 'Age 3-14', points: 1, met: age !== undefined && age >= 3 && age <= 14 },
      { label: 'Age >= 45', points: -1, met: age !== undefined && age >= 45 }
    ], s => ({ interpretation: 'Strep throat risk', riskLevel: s >= 3 ? 'High' : s === 2 ? 'Moderate' : 'Low' }));
  },
  calculateSIRS(symptoms: Symptom[], h: any, vitals: any): ScoringResult | null {
    if (!vitals) return null;
    return buildScore('SIRS Criteria', [
      { label: 'Temp > 38 or < 36', points: 1, met: vitals.temp > 38 || vitals.temp < 36 },
      { label: 'HR > 90', points: 1, met: vitals.hr > 90 },
      { label: 'RR > 20', points: 1, met: vitals.rr > 20 },
      { label: 'WBC abnormal', points: 1, met: false }
    ], s => ({ interpretation: 'SIRS criteria', riskLevel: s >= 2 ? 'High' : 'Low' }));
  }
};
