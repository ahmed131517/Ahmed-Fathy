export interface IndicationRule {
  medication: string;
  medicationRegex?: string;
  validConditions: string[]; // Regex patterns for valid indications
  message: string;
}

export const INDICATION_RULES: IndicationRule[] = [
  {
    medication: 'Metformin',
    validConditions: ['diabetes', 'dm2', 't2dm', 'insulin resistance', 'pcos'],
    message: 'Metformin usually requires an indication of Diabetes or PCOS.'
  },
  {
    medication: 'Lisinopril',
    validConditions: ['hypertension', 'htn', 'heart failure', 'chf', 'myocardial infarction', 'mi', 'nephropathy'],
    message: 'Lisinopril is typically indicated for Hypertension, Heart Failure, or Renal Protection.'
  },
  {
    medication: 'Atorvastatin',
    validConditions: ['dyslipidemia', 'hyperlipidemia', 'cholesterol', 'cardiovascular', 'ascvd', 'mi', 'stroke'],
    message: 'Atorvastatin is indicated for Lipid-lowering or Cardiovascular prophylaxis.'
  },
  {
    medication: 'Ibuprofen',
    validConditions: ['pain', 'inflammation', 'fever', 'arthritis', 'headache', 'injury', 'dysmenorrhea'],
    message: 'NSAIDs like Ibuprofen should be linked to an inflammatory or pain-related condition.'
  },
  {
    medication: 'Amoxicillin',
    validConditions: ['infection', 'bacterial', 'otitis', 'sinusitis', 'pharyngitis', 'pneumonia', 'uti'],
    message: 'Antibiotics require a documented or suspected bacterial infection.'
  },
  {
    medication: 'Sertraline',
    validConditions: ['depression', 'mdd', 'anxiety', 'gad', 'ocd', 'ptsd', 'panic'],
    message: 'Sertraline is indicated for Mood or Anxiety disorders.'
  },
  {
    medication: 'Levothyroxine',
    validConditions: ['hypothyroidism', 'thyroiditis', 'goiter', 'thyroid cancer'],
    message: 'Levothyroxine requires a diagnosis of Hypothyroidism or Thyroid enlargement.'
  },
  {
    medication: 'Amlodipine',
    validConditions: ['hypertension', 'htn', 'angina', 'cad'],
    message: 'Amlodipine is indicated for Hypertension or Angina.'
  },
  {
    medication: 'Omeprazole',
    validConditions: ['gerd', 'reflux', 'peptic ulcer', 'pud', 'gastritis', 'dyspepsia'],
    message: 'Proton Pump Inhibitors are indicated for Acid-related GI conditions.'
  },
  {
    medication: 'Losartan',
    validConditions: ['hypertension', 'htn', 'heart failure', 'nephropathy', 'stroke'],
    message: 'Losartan is indicated for Hypertension or Diabetic Nephropathy.'
  },
  {
    medication: 'Spironolactone',
    validConditions: ['heart failure', 'chf', 'hypertension', 'htn', 'cirrhosis', 'ascites', 'edema', 'pcos', 'acne'],
    message: 'Spironolactone is used in Heart Failure, Cirrhosis, or as an anti-androgen.'
  },
  {
    medication: 'Albuterol',
    validConditions: ['asthma', 'copd', 'bronchitis', 'wheezing', 'shortness of breath', 'sob'],
    message: 'Albuterol (Salbutamol) is indicated for reactive airway disease or bronchospasm.'
  }
];
