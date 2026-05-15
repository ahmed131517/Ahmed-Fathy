export interface OrganSafetyRule {
  drug: string;
  type: 'Renal' | 'Hepatic';
  thresholdField?: 'eGFR' | 'Creatinine' | 'ALT' | 'AST' | 'Bilirubin';
  thresholdValue?: number;
  operator?: '<' | '>' | '>=';
  severity: 'Major' | 'Moderate' | 'Minor';
  action: 'Avoid' | 'Dose Adjustment' | 'Caution';
  message: string;
  detailedGuideline?: string;
}

export const RENAL_HEPATIC_RULES: OrganSafetyRule[] = [
  // Renal Rules
  {
    drug: 'Metformin',
    type: 'Renal',
    thresholdField: 'eGFR',
    thresholdValue: 30,
    operator: '<',
    severity: 'Major',
    action: 'Avoid',
    message: 'Metformin is contraindicated in patients with eGFR < 30 ml/min/1.73m².',
    detailedGuideline: 'Risk of lactic acidosis. For eGFR 30-45, limit dose to 1000mg daily and monitor closely.'
  },
  {
    drug: 'Ibuprofen',
    type: 'Renal',
    thresholdField: 'eGFR',
    thresholdValue: 60,
    operator: '<',
    severity: 'Moderate',
    action: 'Caution',
    message: 'NSAIDs should be avoided or used with extreme caution in patients with eGFR < 60.',
    detailedGuideline: 'NSAIDs can cause acute kidney injury and promote fluid retention.'
  },
  {
    drug: 'Spironolactone',
    type: 'Renal',
    thresholdField: 'eGFR',
    thresholdValue: 30,
    operator: '<',
    severity: 'Major',
    action: 'Avoid',
    message: 'Spironolactone should be avoided if eGFR < 30 due to risk of hyperkalemia.',
  },
  {
    drug: 'Rivaroxaban',
    type: 'Renal',
    thresholdField: 'eGFR',
    thresholdValue: 15,
    operator: '<',
    severity: 'Major',
    action: 'Avoid',
    message: 'Rivaroxaban is not recommended for eGFR < 15.',
    detailedGuideline: 'For eGFR 15-50, dose reduction (e.g., 15mg QD vs 20mg) may be required.'
  },
  {
    drug: 'Nitrofurantoin',
    type: 'Renal',
    thresholdField: 'eGFR',
    thresholdValue: 30,
    operator: '<',
    severity: 'Major',
    action: 'Avoid',
    message: 'Nitrofurantoin is ineffective and carries risk of toxicity if eGFR < 30.',
  },

  // Hepatic Rules
  {
    drug: 'Paracetamol',
    type: 'Hepatic',
    severity: 'Moderate',
    action: 'Dose Adjustment',
    message: 'In known hepatic impairment, limit total Paracetamol (Acetaminophen) to 2-3g daily.',
  },
  {
    drug: 'Methotrexate',
    type: 'Hepatic',
    severity: 'Major',
    action: 'Avoid',
    message: 'Methotrexate is contraindicated in severe hepatic impairment or chronic liver disease.',
  },
  {
    drug: 'Atorvastatin',
    type: 'Hepatic',
    severity: 'Moderate',
    action: 'Caution',
    message: 'Use with caution in patients with active liver disease or elevated transaminases.',
  },
  {
    drug: 'Simvastatin',
    type: 'Hepatic',
    severity: 'Moderate',
    action: 'Caution',
    message: 'Statins should be used with caution in hepatic impairment.',
  }
];
