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
  }
];
