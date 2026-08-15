export interface SNOMEDConcept {
  snomedCode: string;
  term: string;
  canonicalKey: string;
  parentCodes: string[]; // Poly-hierarchical parents
  synonyms: string[];
  description?: string;
}

export const SNOMED_HIERARCHY_DICTIONARY: Record<string, SNOMEDConcept> = {
  // === ROOT CANONICAL PARENTS ===
  "29857009": {
    snomedCode: "29857009",
    term: "Chest Pain",
    canonicalKey: "chest_pain",
    parentCodes: [],
    synonyms: ["Chest Pain", "Thoracic Pain", "Chest Discomfort"],
    description: "Parent concept for all chest pain and thoracic tightness presentations."
  },
  "267036007": {
    snomedCode: "267036007",
    term: "Dyspnea / Shortness of Breath",
    canonicalKey: "dyspnea",
    parentCodes: [],
    synonyms: ["Shortness of Breath", "SOB", "Breathlessness", "Respiratory Distress"],
    description: "Parent concept for respiratory distress and shortness of breath."
  },
  "49727002": {
    snomedCode: "49727002",
    term: "Cough",
    canonicalKey: "cough",
    parentCodes: [],
    synonyms: ["Cough", "Tussis", "Hawking"],
    description: "Parent concept for all cough presentations."
  },
  "27804008": {
    snomedCode: "27804008",
    term: "Sore Throat / Pharyngitis",
    canonicalKey: "sore_throat",
    parentCodes: [],
    synonyms: ["Sore Throat", "Pharyngitis", "Throat Irritation"],
    description: "Parent concept for pharyngeal pain and upper airway inflammation."
  },
  "25064002": {
    snomedCode: "25064002",
    term: "Headache / Cephalea",
    canonicalKey: "headache",
    parentCodes: [],
    synonyms: ["Headache", "Cephalea", "Head Pain"],
    description: "Parent concept for all cranial pain disorders."
  },
  "21522001": {
    snomedCode: "21522001",
    term: "Abdominal Pain",
    canonicalKey: "abdominal_pain",
    parentCodes: [],
    synonyms: ["Abdominal Pain", "Stomach Ache", "Belly Ache"],
    description: "Parent concept for all abdominal and visceral pain."
  },
  "16932000": {
    snomedCode: "16932000",
    term: "Nausea & Vomiting",
    canonicalKey: "nausea_vomiting",
    parentCodes: [],
    synonyms: ["Nausea", "Vomiting", "Emesis"],
    description: "Parent concept for upper gastrointestinal distress."
  },
  "386661006": {
    snomedCode: "386661006",
    term: "Fever / Pyrexia",
    canonicalKey: "fever",
    parentCodes: [],
    synonyms: ["Fever", "Pyrexia", "High Temperature"],
    description: "Parent concept for febrile responses."
  },
  "404640003": {
    snomedCode: "404640003",
    term: "Dizziness & Vertigo",
    canonicalKey: "dizziness",
    parentCodes: [],
    synonyms: ["Dizziness", "Vertigo", "Lightheadedness"],
    description: "Parent concept for vestibular and equilibrium disturbances."
  },
  "49650001": {
    snomedCode: "49650001",
    term: "Painful Urination / Dysuria",
    canonicalKey: "dysuria",
    parentCodes: [],
    synonyms: ["Dysuria", "Painful Urination", "Burning Micturition"],
    description: "Parent concept for lower urinary tract discomfort."
  },

  // === SPECIFIC CHILD CONCEPTS (POLY-HIERARCHICAL GRAPH) ===

  // Chest Pain Children
  "703630003": {
    snomedCode: "703630003",
    term: "Precordial Squeezing",
    canonicalKey: "precordial_squeezing",
    parentCodes: ["29857009"], // Parent: Chest Pain
    synonyms: ["Precordial Squeezing", "Precordial Tightness", "Substernal Squeezing"],
    description: "Specific ischemic chest discomfort symptom."
  },
  "233823000": {
    snomedCode: "233823000",
    term: "Substernal Crushing Pressure",
    canonicalKey: "substernal_crushing_pressure",
    parentCodes: ["703630003", "29857009"], // Poly-hierarchical: Precordial Squeezing + Chest Pain
    synonyms: ["Crushing Chest Pressure", "Substernal Pressure", "Levine Sign"],
    description: "High specificity symptom for acute myocardial ischemia / ACS."
  },
  "832007": {
    snomedCode: "832007",
    term: "Pleuritic Chest Pain",
    canonicalKey: "pleuritic_chest_pain",
    parentCodes: ["29857009"], // Parent: Chest Pain
    synonyms: ["Pleuritic Pain", "Sharp Chest Pain on Inspiration", "Pleural Friction Pain"],
    description: "Sharp chest pain exacerbated by deep breathing or coughing."
  },
  "371807002": {
    snomedCode: "371807002",
    term: "Angina Pectoris",
    canonicalKey: "angina_pectoris",
    parentCodes: ["29857009"],
    synonyms: ["Angina", "Ischemic Chest Pain", "Exertional Chest Pain"],
    description: "Chest discomfort attributable to transient myocardial ischemia."
  },

  // Dyspnea & Respiratory Children
  "60168000": {
    snomedCode: "60168000",
    term: "Orthopnea",
    canonicalKey: "orthopnea",
    parentCodes: ["267036007"], // Parent: Dyspnea
    synonyms: ["Orthopnea", "Positional Dyspnea", "Shortness of breath lying flat"],
    description: "Dyspnea occurring in recumbent posture, classic for heart failure."
  },
  "84089009": {
    snomedCode: "84089009",
    term: "Paroxysmal Nocturnal Dyspnea (PND)",
    canonicalKey: "pnd",
    parentCodes: ["60168000", "267036007"], // Poly-hierarchical: Orthopnea + Dyspnea
    synonyms: ["Paroxysmal Nocturnal Dyspnea", "PND", "Waking up gasping for air"],
    description: "Severe sudden respiratory distress occurring hours after falling asleep."
  },
  "66857006": {
    snomedCode: "66857006",
    term: "Hemoptysis",
    canonicalKey: "hemoptysis",
    parentCodes: ["49727002", "267036007"], // Cough + Dyspnea
    synonyms: ["Hemoptysis", "Coughing Blood", "Blood-tinged sputum"],
    description: "Expectorant of blood originating from respiratory tract."
  },

  // ENT Children
  "28919002": {
    snomedCode: "28919002",
    term: "Odynophagia",
    canonicalKey: "odynophagia",
    parentCodes: ["27804008"], // Parent: Sore Throat
    synonyms: ["Odynophagia", "Painful Swallowing", "Sharp Pain on Deglutition"],
    description: "Severe pain upon swallowing, highly specific child of sore throat / pharyngitis."
  },
  "422587007": {
    snomedCode: "422587007",
    term: "Dysphagia",
    canonicalKey: "dysphagia",
    parentCodes: ["27804008"], // Sore Throat / Esophageal
    synonyms: ["Dysphagia", "Difficulty Swallowing", "Food Sticking in Throat"],
    description: "Difficulty or sensation of obstruction during swallowing pass."
  },

  // Neurological Children
  "271816008": {
    snomedCode: "271816008",
    term: "Thunderclap Sudden Headache",
    canonicalKey: "thunderclap_headache",
    parentCodes: ["25064002"], // Parent: Headache
    synonyms: ["Thunderclap Headache", "Sudden Max Intensity Headache", "Explosive Headache"],
    description: "Headache reaching maximum intensity within seconds; red flag for SAH."
  },
  "247354002": {
    snomedCode: "247354002",
    term: "Nuchal Rigidity",
    canonicalKey: "nuchal_rigidity",
    parentCodes: ["25064002"], // Parent: Headache / Meningismus
    synonyms: ["Nuchal Rigidity", "Stiff Neck", "Neck Stiffness", "Meningismus"],
    description: "Inability to flex neck forward due to meningeal irritation."
  },

  // Abdominal Children
  "247358000": {
    snomedCode: "247358000",
    term: "Epigastric Pain",
    canonicalKey: "epigastric_pain",
    parentCodes: ["21522001"], // Parent: Abdominal Pain
    synonyms: ["Epigastric Pain", "Upper Middle Stomach Pain", "Epigastric Burning"],
    description: "Pain localized to upper central region of abdomen."
  },
  "281014002": {
    snomedCode: "281014002",
    term: "Right Lower Quadrant Pain",
    canonicalKey: "rlq_abdominal_pain",
    parentCodes: ["21522001"], // Parent: Abdominal Pain
    synonyms: ["RLQ Pain", "McBurney Point Pain", "Right Lower Belly Pain"],
    description: "Abdominal pain localized to right iliac fossa; primary appendicitis sign."
  },
  "281013001": {
    snomedCode: "281013001",
    term: "Right Upper Quadrant Pain",
    canonicalKey: "ruq_abdominal_pain",
    parentCodes: ["21522001"], // Parent: Abdominal Pain
    synonyms: ["RUQ Pain", "Biliary Colic", "Right Upper Belly Pain"],
    description: "Pain localized to RUQ; biliary or hepatic etiology."
  },

  // GI Bleed Children
  "271815003": {
    snomedCode: "271815003",
    term: "Coffee-Ground Hematemesis",
    canonicalKey: "hematemesis",
    parentCodes: ["16932000"], // Parent: Nausea & Vomiting
    synonyms: ["Hematemesis", "Vomiting Blood", "Coffee Ground Emesis"],
    description: "Vomiting of altered dark blood from upper GI bleeding source."
  }
};
