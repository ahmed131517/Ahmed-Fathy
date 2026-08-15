const fs = require('fs');

const path = 'src/data/diagnosisMappings.ts';
let content = fs.readFileSync(path, 'utf8');

const newDiseases = `
  {
    id: "diabetes_mellitus",
    name: "Diabetes Mellitus",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "A disease in which the body's ability to produce or respond to the hormone insulin is impaired.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_weight_loss", "frequency_urination"],
    redFlagsStructured: [
      { id: 'dm_dka', description: "Fruity breath, Kussmaul respirations, altered mental status (DKA)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'dm_hypo', description: "Severe hypoglycemia (unconsciousness, seizures)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E11.9",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "hypothyroidism",
    name: "Hypothyroidism",
    system: 'Endocrine',
    severity: 'Mild',
    category: "Endocrine",
    redFlags: [],
    description: "A condition in which the thyroid gland doesn't produce enough thyroid hormone.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_weight_gain", "constipation", "muscle_weakness", "psych_depression"],
    redFlagsStructured: [
      { id: 'hypo_myxedema', description: "Myxedema coma (hypothermia, bradycardia, altered mental status)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E03.9",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "hyperthyroidism",
    name: "Hyperthyroidism",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "Overactivity of the thyroid gland, resulting in a rapid heartbeat and an increased rate of metabolism.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_weight_loss", "palpitations", "psych_anxiety_general", "diarrhea", "heat_intolerance"],
    redFlagsStructured: [
      { id: 'hyper_storm', description: "Thyroid storm (high fever, severe tachycardia, delirium)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E05.9",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (UTI)",
    system: 'Renal',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "An infection in any part of the urinary system, the kidneys, bladder, or urethra.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["frequency_urination", "painful_urination", "blood_in_urine", "abdominal_pain"],
    redFlagsStructured: [
      { id: 'uti_pyelo', description: "High fever, chills, and flank pain (Pyelonephritis)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'uti_sepsis', description: "Signs of sepsis (hypotension, confusion)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N39.0",
    prevalenceScore: 10,
    triagePriority: 4
  },
  {
    id: "kidney_stones",
    name: "Nephrolithiasis (Kidney Stones)",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "A small, hard deposit that forms in the kidneys and is often painful when passed.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "back_pain", "nausea", "vomiting", "blood_in_urine"],
    redFlagsStructured: [
      { id: 'ks_infection', description: "Fever and chills with stone (obstructed infected kidney)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ks_anuria', description: "Inability to pass urine", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "N20.0",
    prevalenceScore: 8,
    triagePriority: 3
  },
  {
    id: "lyme_disease",
    name: "Lyme Disease",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "A tick-borne illness caused by the bacterium Borrelia burgdorferi.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_fatigue", "msk_joint_pain", "headache", "rash"],
    redFlagsStructured: [
      { id: 'lyme_heart', description: "Heart block or palpitations (Lyme carditis)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'lyme_neuro', description: "Facial palsy or meningitis symptoms", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "A69.20",
    prevalenceScore: 6,
    triagePriority: 4
  },
  {
    id: "migraine",
    name: "Migraine",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "A headache of varying intensity, often accompanied by nausea and sensitivity to light and sound.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_migraine", "nausea", "vision_blurring", "photophobia", "phonophobia"],
    redFlagsStructured: [
      { id: 'migraine_neuro', description: "New focal neurological deficits not typical of previous aura", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'migraine_worst', description: "Worst headache of life (Thunderclap)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G43.9",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "osteoarthritis",
    name: "Osteoarthritis",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A type of arthritis that occurs when flexible tissue at the ends of bones wears down.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_joint_stiffness", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'oa_infection', description: "Hot, red, swollen joint with fever (Septic arthritis)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "M19.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "rheumatoid_arthritis",
    name: "Rheumatoid Arthritis",
    system: 'Musculoskeletal',
    severity: 'Moderate',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A chronic inflammatory disorder affecting many joints, including those in the hands and feet.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_joint_stiffness", "gen_fatigue", "gen_fever"],
    redFlagsStructured: [
      { id: 'ra_cervical', description: "Cervical spine instability (neck pain with neuro symptoms)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ra_vasculitis', description: "Systemic vasculitis signs", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "M06.9",
    prevalenceScore: 6,
    triagePriority: 4
  }
`;

// Insert before the last ];
content = content.replace(/\]\s*;\s*$/, `${newDiseases}\n];`);

fs.writeFileSync(path, content, 'utf8');
console.log("Added 9 new diseases");
