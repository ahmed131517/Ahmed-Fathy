export interface TherapeuticGapRule {
  id: string;
  condition: string;
  conditionRegex: string; // Regex to match the condition in the patient's record
  requiredMedicationClasses: string[]; // List of drug classes that satisfy the requirement
  message: string;
  priority: 'High' | 'Medium' | 'Low';
  clinicalContext?: string;
  evidence?: string;
  guidelineUrl?: string;
}

export const THERAPEUTIC_GAP_RULES: TherapeuticGapRule[] = [
  {
    id: 'gap_htn',
    condition: 'Hypertension',
    conditionRegex: 'hypertension|htn|high blood pressure',
    requiredMedicationClasses: [
      'ACE Inhibitor', 'ARB', 'Calcium Channel Blocker', 'Thiazide Diuretic', 'Beta Blocker'
    ],
    message: 'Hypertension detected without active antihypertensive medication.',
    priority: 'High',
    clinicalContext: 'Standard first-line therapy includes ACEi, ARB, CCB, or Thiazide diuretics.',
    evidence: 'AHA/ACC 2017 Hypertension Clinical Practice Guidelines.',
    guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065'
  },
  {
    id: 'gap_dm2',
    condition: 'Diabetes Mellitus Type 2',
    conditionRegex: 'diabetes|dm2|type 2 diabetes|t2dm',
    requiredMedicationClasses: [
      'Biguanide', 'Metformin', 'Sulfonylurea', 'SGLT2 Inhibitor', 'DPP-4 Inhibitor', 'GLP-1 Agonist', 'Insulin'
    ],
    message: 'Diabetes detected without active glucose-lowering therapy.',
    priority: 'High',
    evidence: 'ADA 2024 Standards of Care in Diabetes.',
    guidelineUrl: 'https://diabetesjournals.org/care/issue/47/Supplement_1'
  },
  {
    id: 'gap_hf',
    condition: 'Heart Failure',
    conditionRegex: 'heart failure|chf|congestive heart failure',
    requiredMedicationClasses: [
      'ACE Inhibitor', 'ARB', 'Beta Blocker', 'Mineralocorticoid Receptor Antagonist', 'ARNI', 'SGLT2 Inhibitor'
    ],
    message: 'Heart Failure detected without foundational Guideline-Directed Medical Therapy (GDMT).',
    priority: 'High',
    evidence: 'AHA/ACC/HFSA 2022 Guideline for the Management of Heart Failure.',
    clinicalContext: 'SGLT2 inhibitors are now recommended for HFrEF regardless of diabetes status (Class 1A recommendation).',
    guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063'
  },
  {
    id: 'gap_dyslipidemia',
    condition: 'Dyslipidemia',
    conditionRegex: 'dyslipidemia|hyperlipidemia|high cholesterol',
    requiredMedicationClasses: [
      'Statin', 'Ezetimibe', 'PCSK9 Inhibitor', 'Fibrate'
    ],
    message: 'Hyperlipidemia detected without lipid-lowering therapy.',
    priority: 'Medium',
    evidence: 'AHA/ACC 2018 Guideline on the Management of Blood Cholesterol.',
    guidelineUrl: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625'
  },
  {
    id: 'gap_asthma',
    condition: 'Asthma',
    conditionRegex: 'asthma',
    requiredMedicationClasses: [
      'SABA', 'Inhaled Corticosteroid', 'ICS', 'LABA', 'Leukotriene Modifier'
    ],
    message: 'Asthma history detected without rescue or controller therapy.',
    priority: 'Medium'
  },
  {
    id: 'gap_hypothyroidism',
    condition: 'Hypothyroidism',
    conditionRegex: 'hypothyroidism|hashimoto',
    requiredMedicationClasses: [
      'Thyroid Hormone', 'Levothyroxine'
    ],
    message: 'Hypothyroidism detected without thyroid replacement therapy.',
    priority: 'Medium'
  }
];
