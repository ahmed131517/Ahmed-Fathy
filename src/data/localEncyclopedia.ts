export interface EncyclopediaEntry {
  term: string;
  definition: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  prevention: string[];
}

export const LOCAL_ENCYCLOPEDIA: Record<string, EncyclopediaEntry> = {
  "Diabetes Mellitus": {
    term: "Diabetes Mellitus",
    definition: "A chronic condition characterized by high levels of sugar (glucose) in the blood due to insulin resistance or insufficient insulin production.",
    symptoms: ["Increased thirst", "Frequent urination", "Extreme hunger", "Unexplained weight loss", "Fatigue"],
    causes: ["Insulin resistance", "Lack of insulin production", "Genetic factors"],
    treatments: ["Insulin therapy", "Oral medications (e.g., Metformin)", "Dietary changes", "Regular exercise"],
    prevention: ["Healthy diet", "Regular physical activity", "Weight management"]
  },
  "Hypertension": {
    term: "Hypertension",
    definition: "A condition in which the force of the blood against the artery walls is too high.",
    symptoms: ["Often asymptomatic", "Headaches", "Shortness of breath", "Nosebleeds"],
    causes: ["Genetics", "Diet (high salt)", "Lack of exercise", "Stress"],
    treatments: ["Lifestyle changes", "ACE inhibitors", "Diuretics", "Beta blockers"],
    prevention: ["Low-sodium diet", "Regular exercise", "Limiting alcohol", "Managing stress"]
  },
  "Asthma": {
    term: "Asthma",
    definition: "A condition in which your airways narrow and swell and may produce extra mucus.",
    symptoms: ["Shortness of breath", "Chest tightness", "Wheezing", "Coughing"],
    causes: ["Genetics", "Allergens", "Respiratory infections", "Pollution"],
    treatments: ["Inhalers (bronchodilators)", "Corticosteroids", "Avoiding triggers"],
    prevention: ["Avoiding known triggers", "Managing allergies", "Regular check-ups"]
  },
  "Pneumonia": {
    term: "Pneumonia",
    definition: "Infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
    symptoms: ["Cough with phlegm", "Fever", "Shortness of breath", "Chest pain"],
    causes: ["Bacteria", "Viruses", "Fungi"],
    treatments: ["Antibiotics", "Antivirals", "Rest", "Fluids"],
    prevention: ["Vaccination", "Hand hygiene", "Not smoking"]
  },
  "Osteoarthritis": {
    term: "Osteoarthritis",
    definition: "A type of arthritis that occurs when flexible tissue at the ends of bones wears down.",
    symptoms: ["Joint pain", "Stiffness", "Tenderness", "Loss of flexibility"],
    causes: ["Aging", "Joint injury", "Obesity", "Genetics"],
    treatments: ["Pain relievers", "Physical therapy", "Weight loss", "Surgery"],
    prevention: ["Maintaining healthy weight", "Regular exercise", "Avoiding joint injury"]
  },
  "Alzheimer's Disease": {
    term: "Alzheimer's Disease",
    definition: "A progressive disease that destroys memory and other important mental functions.",
    symptoms: ["Memory loss", "Confusion", "Difficulty with familiar tasks", "Personality changes"],
    causes: ["Brain cell degeneration", "Genetic factors", "Age"],
    treatments: ["Cholinesterase inhibitors", "Memantine", "Supportive care"],
    prevention: ["Healthy diet", "Mental stimulation", "Regular exercise", "Managing cardiovascular health"]
  }
};
