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
    description: "Increased risk of bleeding."
  },
  {
    drugA: "ACE inhibitors",
    drugB: "Diuretics",
    severity: "Moderate",
    description: "Increased risk of hypotension and renal impairment."
  }
];
