export interface DrugInteraction {
  drugA: string;
  drugB: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  description: string;
}

export const DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    drugA: "Warfarin",
    drugB: "Aspirin",
    severity: "Severe",
    description: "Increased risk of bleeding due to combined anticoagulant and antiplatelet effects."
  },
  {
    drugA: "Warfarin",
    drugB: "Ibuprofen",
    severity: "Severe",
    description: "Increased risk of GI bleeding and potentially elevated INR."
  },
  {
    drugA: "Lisinopril",
    drugB: "Spironolactone",
    severity: "Moderate",
    description: "Increased risk of hyperkalemia (high potassium levels)."
  },
  {
    drugA: "Sildenafil",
    drugB: "Nitroglycerin",
    severity: "Severe",
    description: "Risk of life-threatening hypotension."
  },
  {
    drugA: "Simvastatin",
    drugB: "Amlodipine",
    severity: "Moderate",
    description: "Increased risk of myopathy; simvastatin dose should be limited."
  },
  {
    drugA: "Fluoxetine",
    drugB: "Tramadol",
    severity: "Moderate",
    description: "Increased risk of serotonin syndrome."
  },
  {
    drugA: "ACE inhibitors",
    drugB: "Diuretics",
    severity: "Moderate",
    description: "Increased risk of hypotension and renal impairment."
  },
  {
    drugA: "Metformin",
    drugB: "Contrast Media",
    severity: "Severe",
    description: "Risk of lactic acidosis. Metformin should be withheld 48 hours before/after contrast study."
  },
  {
    drugA: "Clopidogrel",
    drugB: "Omeprazole",
    severity: "Moderate",
    description: "Omeprazole may reduce the antiplatelet effect of clopidogrel (CYP2C19 inhibition)."
  },
  {
    drugA: "Digoxin",
    drugB: "Amiodarone",
    severity: "Severe",
    description: "Amiodarone increases digoxin levels; digoxin dose should be reduced by 50%."
  },
  {
    drugA: "Lithium",
    drugB: "NSAIDs",
    severity: "Severe",
    description: "NSAIDs reduce renal lithium clearance, increasing risk of lithium toxicity."
  },
  {
    drugA: "Azithromycin",
    drugB: "Ondansetron",
    severity: "Moderate",
    description: "Additive effect on QT interval prolongation."
  }
];
