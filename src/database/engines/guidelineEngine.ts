export interface GuidelineRecommendation {
  condition: string;
  society: 'ADA' | 'ACC/AHA' | 'IDSA' | 'ACG' | 'KDIGO' | 'GINA';
  recommendation: string;
  firstLineTherapy: string[];
  secondLineTherapy: string[];
  evidenceLevel: 'Class I (Level A)' | 'Class I (Level B)' | 'Class IIa (Level B)' | 'Grade A';
  notes: string;
}

const CLINICAL_GUIDELINES: GuidelineRecommendation[] = [
  {
    condition: 'Type 2 Diabetes Mellitus',
    society: 'ADA',
    recommendation: 'First-line therapy depends on comorbidities (ASCVD, CKD, Heart Failure). Metformin + lifestyle modification remains foundational unless contraindicated.',
    firstLineTherapy: ['Metformin 500mg - 1000mg BID', 'SGLT2 Inhibitor (Dapagliflozin/Empagliflozin) if CKD/HF', 'GLP-1 RA if high ASCVD risk'],
    secondLineTherapy: ['DPP-4 Inhibitor (Linagliptin)', 'Sulfonylurea (Glimepiride 1-2mg daily)', 'Basal Insulin'],
    evidenceLevel: 'Grade A',
    notes: 'Hold Metformin if eGFR < 30 mL/min. Adjust dose if eGFR 30-45 mL/min.'
  },
  {
    condition: 'Hypertension',
    society: 'ACC/AHA',
    recommendation: 'Target BP < 130/80 mmHg. Initial monotherapy with ACEi/ARB, CCB, or Thiazide diuretic in non-Black patients. Dual combination therapy if BP > 20/10 mmHg over target.',
    firstLineTherapy: ['Enalapril 5mg - 20mg BID', 'Amlodipine 5mg - 10mg daily', 'Hydrochlorothiazide 12.5mg - 25mg daily'],
    secondLineTherapy: ['ARBs (Valsartan/Losartan)', 'Beta Blockers (Bisoprolol / Carvedilol if HFrEF)'],
    evidenceLevel: 'Class I (Level A)',
    notes: 'Avoid ACEi in pregnancy (Class X). Monitor serum K+ and creatinine.'
  },
  {
    condition: 'Community-Acquired Pneumonia (Outpatient)',
    society: 'IDSA',
    recommendation: 'Empiric coverage for S. pneumoniae, Mycoplasma, and atypicals. Monotherapy with Amoxicillin or Macrolide in healthy outpatients without comorbidities.',
    firstLineTherapy: ['Amoxicillin 1g TID', 'Azithromycin 500mg Day 1 then 250mg daily', 'Doxycycline 100mg BID'],
    secondLineTherapy: ['Augmentin (Amoxicillin/Clavulanate) 1g BID + Macrolide', 'Respiratory Fluoroquinolone (Levofloxacin 750mg)'],
    evidenceLevel: 'Class I (Level B)',
    notes: 'If comorbid heart/lung/kidney disease, use combination beta-lactam + macrolide or respiratory fluoroquinolone.'
  },
  {
    condition: 'Gastroesophageal Reflux Disease (GERD) & Peptic Ulcer',
    society: 'ACG',
    recommendation: '8-week course of once-daily PPI taken 30-60 minutes before breakfast. Eradicate H. pylori if present.',
    firstLineTherapy: ['Omeprazole 20mg - 40mg daily', 'Esomeprazole 40mg daily', 'Pantoprazole 40mg daily'],
    secondLineTherapy: ['H2 Receptor Antagonist (Famotidine 20mg BID)', 'Vonoprazan'],
    evidenceLevel: 'Grade A',
    notes: 'Re-evaluate long-term PPI use due to hypomagnesemia and fracture risk.'
  },
  {
    condition: 'Acute Uncomplicated Cystitis (UTI)',
    society: 'IDSA',
    recommendation: 'First-line empiric antimicrobial therapy based on local resistance patterns.',
    firstLineTherapy: ['Nitrofurantoin 100mg BID x 5 days', 'Trimethoprim-Sulfamethoxazole (Bactrim DS) BID x 3 days', 'Fosfomycin 3g single dose'],
    secondLineTherapy: ['Ciprofloxacin 250mg BID x 3 days', 'Amoxicillin-Clavulanate 625mg BID x 7 days'],
    evidenceLevel: 'Class I (Level A)',
    notes: 'Avoid Fluoroquinolones (Ciprofloxacin) as first-line due to adverse event risks unless alternative agents unavailable.'
  }
];

export function getGuidelineForCondition(conditionName: string): GuidelineRecommendation | undefined {
  if (!conditionName) return undefined;
  const lower = conditionName.toLowerCase();

  return CLINICAL_GUIDELINES.find(g => 
    lower.includes(g.condition.toLowerCase()) || 
    g.condition.toLowerCase().includes(lower) ||
    (lower.includes('diabetes') && g.condition.includes('Diabetes')) ||
    (lower.includes('hypertension') || lower.includes('htn') && g.condition.includes('Hypertension')) ||
    (lower.includes('pneumonia') || lower.includes('cap') && g.condition.includes('Pneumonia')) ||
    (lower.includes('gerd') || lower.includes('ulcer') || lower.includes('gastritis') && g.condition.includes('GERD')) ||
    (lower.includes('uti') || lower.includes('cystitis') && g.condition.includes('Cystitis'))
  );
}

export function getAllClinicalGuidelines(): GuidelineRecommendation[] {
  return CLINICAL_GUIDELINES;
}
