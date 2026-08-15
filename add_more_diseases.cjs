const fs = require('fs');

const path = 'src/data/diagnosisMappings.ts';
let content = fs.readFileSync(path, 'utf8');

const newDiseases = `
  ,
  {
    id: "hiv_aids",
    name: "HIV/AIDS",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "A virus that attacks the body's immune system.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_night_sweats", "gen_weight_loss", "gen_fatigue", "diarrhea", "hema_lymphadenopathy", "psych_cognitive_psych"],
    redFlagsStructured: [
      { id: 'hiv_resp', description: "Severe dyspnea (PCP pneumonia)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'hiv_neuro', description: "New onset seizures or focal neuro deficits (Toxoplasmosis/Lymphoma)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "B20",
    prevalenceScore: 5,
    triagePriority: 3
  },
  {
    id: "meningitis",
    name: "Meningitis",
    system: 'Neurological',
    severity: 'Critical',
    category: "Infectious",
    redFlags: [],
    description: "Inflammation of brain and spinal cord membranes, typically caused by an infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache", "gen_fever", "nausea", "vomiting", "psych_cognitive_psych"],
    redFlagsStructured: [
      { id: 'men_neck', description: "Stiff neck (Nuchal rigidity)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_rash', description: "Petechial rash that does not blanch", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_ams', description: "Altered mental status", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G03.9",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "sepsis",
    name: "Sepsis",
    system: 'Infectious',
    severity: 'Critical',
    category: "Infectious",
    redFlags: [],
    description: "A life-threatening complication of an infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "palpitations", "tachypnea", "psych_cognitive_psych"],
    redFlagsStructured: [
      { id: 'sepsis_hypo', description: "Systolic BP < 90", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sepsis_ams', description: "New altered mental status", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sepsis_resp', description: "Respiratory rate > 22", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A41.9",
    prevalenceScore: 5,
    triagePriority: 1
  },
  {
    id: "multiple_myeloma",
    name: "Multiple Myeloma",
    system: 'Oncology',
    severity: 'Severe',
    category: "Hematology",
    redFlags: [],
    description: "A cancer that forms in a type of white blood cell called a plasma cell.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["back_pain", "gen_fatigue", "hema_anemia_symptoms", "hema_systemic_malignancy"],
    redFlagsStructured: [
      { id: 'mm_calcium', description: "Severe confusion or polyuria (hypercalcemia)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'mm_cord', description: "Lower extremity weakness/numbness (Spinal cord compression)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C90.0",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "pulmonary_edema",
    name: "Pulmonary Edema",
    system: 'Respiratory',
    severity: 'Critical',
    category: "Respiratory",
    redFlags: [],
    description: "A condition caused by excess fluid in the lungs, typically from a heart condition.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["dyspnea_exertion", "cough", "wheezing", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'pe_frothy', description: "Coughing up pink, frothy sputum", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pe_rest', description: "Severe shortness of breath at rest", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pe_cyanosis', description: "Blue tinged lips or skin (cyanosis)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J81.0",
    prevalenceScore: 4,
    triagePriority: 1
  },
  {
    id: "endocarditis",
    name: "Infective Endocarditis",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "An infection of the endocardium, which is the inner lining of your heart chambers and heart valves.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "gen_night_sweats", "msk_joint_pain", "hema_skin_bleeding_signs"],
    redFlagsStructured: [
      { id: 'endo_stroke', description: "Sudden weakness or speech difficulty (embolic stroke)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'endo_heart_fail', description: "Rapid onset shortness of breath", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I33.0",
    prevalenceScore: 3,
    triagePriority: 2
  }
`;

content = content.replace(/\]\s*;\s*$/, `${newDiseases}\n];`);
fs.writeFileSync(path, content, 'utf8');
console.log("Added 6 more diseases");
