export interface EMRCategory {
  category_id: string; // e.g. "GEN", "CVS", "RES", "ENT", "NEU", "GI", "GU", "MSK", "DERM", "TRAUMA", "HEMA", "PSYCH"
  name: string;
  domain: string;
  iconName?: string;
}

export interface EMRAttributeConfig {
  supportsSeverity?: boolean;
  supportsDuration?: boolean;
  supportsOnset?: boolean;
  supportsRadiation?: boolean;
  supportsCharacter?: boolean;
  supportsLaterality?: boolean;
  supportsLocation?: boolean;
}

export interface EMRStructuredAttributes {
  severity?: string;
  duration?: string;
  onset?: string;
  radiation?: string;
  character?: string;
  laterality?: string;
  location?: string;
  temperature?: string;
  [key: string]: string | undefined;
}

export interface EMRSymptomDefinition {
  symptom_id: string; // e.g. "SYM000101" or canonical key
  canonical_key: string; // e.g. "fever", "chest_pain", "headache"
  name: string;
  category_id: string;
  snomed_code: string;
  icd_mapping: string;
  active: boolean;
  synonyms: string[];
  attributeConfig: EMRAttributeConfig;
  redFlags?: string[];
  physicalExamFindings?: string[];
  recommendedInvestigations?: string[];
  clinicalNotes?: string;
  
  // Newly Added Mandated Fields
  medicalDefinition?: string;
  isRedFlag?: boolean;
  applicableSex?: 'Male' | 'Female' | 'Both';
  applicableAgeGroup?: string[]; // e.g. ['adult', 'pediatric', 'geriatric', 'all']
  associatedBodyRegion?: string;
  relatedDifferentialDiagnoses?: string[];
}

export const EMR_CATEGORIES: EMRCategory[] = [
  { category_id: "GEN", name: "General / Systemic", domain: "systemic" },
  { category_id: "RES", name: "Respiratory / Lungs", domain: "respiratory_cardio" },
  { category_id: "CVS", name: "Cardiovascular / Heart", domain: "respiratory_cardio" },
  { category_id: "ENT", name: "Ear, Nose, Throat & Head", domain: "neuro_ent" },
  { category_id: "NEU", name: "Neurological & Spine", domain: "neuro_ent" },
  { category_id: "GI", name: "Gastrointestinal & Digestive", domain: "digestive_renal" },
  { category_id: "GU", name: "Renal & Genitourinary", domain: "digestive_renal" },
  { category_id: "MSK", name: "Musculoskeletal & Joints", domain: "musculoskeletal_skin" },
  { category_id: "DERM", name: "Dermatological & Skin", domain: "musculoskeletal_skin" },
  { category_id: "TRAUMA", name: "Trauma & Emergency Injury", domain: "musculoskeletal_skin" },
  { category_id: "HEMA", name: "Hematologic & Lymphatic", domain: "systemic" },
  { category_id: "PSYCH", name: "Psychiatric & Behavioral", domain: "systemic" },
];

export const EMR_SYMPTOM_DICTIONARY: EMRSymptomDefinition[] = [
  // General
  {
    symptom_id: "SYM000101",
    canonical_key: "fever",
    name: "Fever / Chills",
    category_id: "GEN",
    snomed_code: "386661006",
    icd_mapping: "R50.9",
    active: true,
    synonyms: ["Pyrexia", "High Temperature", "Febrility", "Chills", "Rigors", "Hyperthermia", "General Fever"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsCharacter: true },
    redFlags: ["Fever > 38.5°C with altered mental status", "Rigors with hemodynamic instability", "Fever in immunocompromised host"],
    physicalExamFindings: ["Diaphoretic skin", "Flushed face", "Tachycardia", "Warm extremities"],
    recommendedInvestigations: ["CBC with differential", "Blood cultures x 2", "Urinalysis and culture", "Chest X-ray"],
    clinicalNotes: "Pyrexia of unknown origin requires systematic infectious, inflammatory, and neoplastic workup.",
    medicalDefinition: "An abnormal elevation of body temperature, usually as a result of a pathologic process.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Systemic',
    relatedDifferentialDiagnoses: ["common_cold", "acute_viral_cold", "uri", "influenza", "meningitis", "sepsis", "tb"]
  },
  {
    symptom_id: "SYM000102",
    canonical_key: "fatigue",
    name: "Fatigue & Generalized Weakness",
    category_id: "GEN",
    snomed_code: "84229001",
    icd_mapping: "R53.83",
    active: true,
    synonyms: ["Lethargy", "Malaise", "Tiredness", "Exhaustion", "Asthenia", "Daytime Somnolence"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Unexplained profound weight loss", "Drenching night sweats", "Lymphadenopathy"],
    recommendedInvestigations: ["CBC", "TSH & Free T4", "Serum Iron & Ferritin", "CMP"],
    medicalDefinition: "A subjective feeling of tiredness, exhaustion, or lack of energy that is not relieved by rest.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Systemic',
    relatedDifferentialDiagnoses: ["hypothyroidism", "anemia", "chronic_fatigue_syndrome", "depression", "heart_failure"]
  },
  {
    symptom_id: "SYM000103",
    canonical_key: "weight_loss",
    name: "Unintentional Weight Loss",
    category_id: "GEN",
    snomed_code: "89362005",
    icd_mapping: "R63.4",
    active: true,
    synonyms: ["Cachexia", "Weight Reduction", "Involuntary Weight Loss", "Unexplained Weight Loss"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true },
    redFlags: ["> 5% body weight loss in 6 months without dieting", "Associated palpable abdominal mass", "Persistent fever or night sweats"],
    recommendedInvestigations: ["CT Chest/Abdomen/Pelvis", "Colonoscopy/EGD", "Serum Tumor Markers"],
    medicalDefinition: "A decrease in body weight that occurs when an individual is not attempting to lose weight.",
    isRedFlag: true,
    applicableSex: 'Both',
    applicableAgeGroup: ['adult', 'geriatric'],
    associatedBodyRegion: 'Systemic',
    relatedDifferentialDiagnoses: ["hyperthyroidism", "diabetes", "malignancy", "tb", "hiv"]
  },

  // Cardiovascular
  {
    symptom_id: "SYM000201",
    canonical_key: "chest_pain",
    name: "Chest Pain / Pressure",
    category_id: "CVS",
    snomed_code: "29857009",
    icd_mapping: "R07.9",
    active: true,
    synonyms: ["Chest Pressure", "Tight Chest", "Angina Pectoris", "Substernal Pain", "Precordial Squeezing"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsRadiation: true, supportsCharacter: true },
    redFlags: ["Crushing substernal pressure radiating to left arm/jaw", "Diaphoresis with dyspnea", "Tearing pain radiating to back"],
    physicalExamFindings: ["S3/S4 gallop", "Diaphoretic", "Irregular heart rhythm", "Decreased peripheral pulses"],
    recommendedInvestigations: ["STAT 12-lead ECG", "High-Sensitivity Troponin I/T", "Chest X-ray", "D-Dimer"],
    clinicalNotes: "Rule out acute coronary syndrome (ACS), aortic dissection, and pulmonary embolism (PE).",
    medicalDefinition: "Pain or discomfort in the chest, which may be described as pressure, tightness, squeezing, or sharp pain.",
    isRedFlag: true,
    applicableSex: 'Both',
    applicableAgeGroup: ['adult', 'geriatric'],
    associatedBodyRegion: 'Chest/Thorax',
    relatedDifferentialDiagnoses: ["mi", "myocardial_infarction", "acs", "aortic_dissection", "pe", "pulmonary_embolism", "gerd"]
  },
  {
    symptom_id: "SYM000202",
    canonical_key: "palpitations",
    name: "Palpitations & Racing Heart",
    category_id: "CVS",
    snomed_code: "80313002",
    icd_mapping: "R00.2",
    active: true,
    synonyms: ["Skipped Beats", "Fluttering Heart", "Tachycardia", "Arrhythmia", "Irregular Heartbeat"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Palpitations with syncope/presyncope", "Associated chest pain", "Family history of sudden cardiac death"],
    recommendedInvestigations: ["ECG", "Holter Monitor / Zio Patch", "Echocardiogram", "Serum Electrolytes"],
    medicalDefinition: "A sensation of a rapid, fluttering, or pounding heartbeat.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['adult', 'geriatric'],
    associatedBodyRegion: 'Chest/Thorax',
    relatedDifferentialDiagnoses: ["atrial_fibrillation", "svt", "anxiety", "hyperthyroidism", "anemia"]
  },

  // Respiratory
  {
    symptom_id: "SYM000301",
    canonical_key: "dyspnea",
    name: "Shortness of Breath (Dyspnea)",
    category_id: "RES",
    snomed_code: "267036007",
    icd_mapping: "R06.02",
    active: true,
    synonyms: ["Shortness of Breath", "SOB", "Breathlessness", "Respiratory Distress", "Dyspnea on Exertion"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Inability to speak in full sentences", "Stridor or silent chest", "Hypoxia SpO2 < 90%", "Asymmetric breath sounds"],
    physicalExamFindings: ["Tachypnea", "Accessory muscle use", "Wheezing or crackles", "Cyanosis"],
    recommendedInvestigations: ["Pulse Oximetry", "Chest Radiograph", "ABG / VBG", "CT Pulmonary Angiography"]
  },
  {
    symptom_id: "SYM000302",
    canonical_key: "cough",
    name: "Cough (Dry or Productive)",
    category_id: "RES",
    snomed_code: "49727002",
    icd_mapping: "R05.9",
    active: true,
    synonyms: ["Productive Cough", "Dry Cough", "Hawking", "Chronic Cough", "Hemoptysis"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsCharacter: true },
    redFlags: ["Hemoptysis (coughing blood)", "Night sweats with purulent sputum", "High fever with consolidation"],
    recommendedInvestigations: ["Chest X-Ray", "Sputum Gram Stain & Culture", "Acid-Fast Bacilli Smear"]
  },

  // ENT & Upper Airway
  {
    symptom_id: "SYM000401",
    canonical_key: "sore_throat",
    name: "Sore Throat (Pharyngitis)",
    category_id: "ENT",
    snomed_code: "27804008",
    icd_mapping: "J02.9",
    active: true,
    synonyms: ["Throat Pain", "Pharyngitis", "Odynophagia", "Scratchy Throat", "Ent Sore Throat"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Hot potato voice / inability to swallow secretions", "Trismus or unilateral uvular deviation", "Stridor or airway compromise"],
    physicalExamFindings: ["Tonsillar exudates", "Anterior cervical lymphadenopathy", "Erythematous pharynx"],
    recommendedInvestigations: ["Rapid Strep Test", "Throat Culture", "Monospot Test"],
    medicalDefinition: "Pain, discomfort, or scratchiness in the throat, often worsened by swallowing.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Head and Neck',
    relatedDifferentialDiagnoses: ["strep_throat", "viral_pharyngitis", "mononucleosis", "tonsillitis"]
  },
  {
    symptom_id: "SYM000402",
    canonical_key: "postnasal_drip",
    name: "Postnasal Drip & Nasal Congestion",
    category_id: "ENT",
    snomed_code: "232209002",
    icd_mapping: "R09.82",
    active: true,
    synonyms: ["Postnasal Drip", "Rhinorrhea", "Runny Nose", "Nasal Congestion", "Stuffiness", "Sneezing"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Unilateral purulent rhinorrhea with facial pain", "Clear fluid drainage after head trauma (CSF leak)"],
    recommendedInvestigations: ["Nasal Endoscopy", "Sinus CT Scan (if persistent > 10 days)"],
    medicalDefinition: "Excessive mucus production and drainage from the nasal passages.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Head and Neck',
    relatedDifferentialDiagnoses: ["allergic_rhinitis", "viral_uri", "acute_sinusitis", "chronic_sinusitis"]
  },

  // Neurological
  {
    symptom_id: "SYM000501",
    canonical_key: "headache",
    name: "Headache / Cephalea",
    category_id: "NEU",
    snomed_code: "25064002",
    icd_mapping: "R51.9",
    active: true,
    synonyms: ["Headache", "Cephalea", "Migraine", "Head Pressure", "Temporal Pain", "Throbbing Headache"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsLocation: true, supportsCharacter: true },
    redFlags: ["Thunderclap onset", "Fever and nuchal rigidity", "New neurological deficit or altered mental status"],
    recommendedInvestigations: ["Non-contrast Head CT", "Lumbar Puncture", "Brain MRI"],
    medicalDefinition: "Pain in any region of the head.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Head',
    relatedDifferentialDiagnoses: ["migraine", "tension_headache", "sah", "meningitis", "temporal_arteritis"]
  },
  {
    symptom_id: "SYM000502",
    canonical_key: "dizziness",
    name: "Dizziness & Vertigo",
    category_id: "NEU",
    snomed_code: "404640003",
    icd_mapping: "R42",
    active: true,
    synonyms: ["Vertigo", "Lightheadedness", "Off Balance", "Unsteadiness", "Presyncope", "Spinning Sensation"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Direction-changing nystagmus", "Ataxia preventing standing", "Associated cranial nerve palsy"],
    recommendedInvestigations: ["HINTS Exam", "Orthostatic Vitals", "Brain MRI/MRA"],
    medicalDefinition: "A broad term encompassing sensations of spinning (vertigo), lightheadedness (presyncope), or unsteadiness (disequilibrium).",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Neurological',
    relatedDifferentialDiagnoses: ["bppv", "vestibular_neuritis", "meniere_disease", "orthostatic_hypotension", "stroke"]
  },

  // Gastrointestinal
  {
    symptom_id: "SYM000601",
    canonical_key: "abdominal_pain",
    name: "Abdominal Pain / Stomach Ache",
    category_id: "GI",
    snomed_code: "21522001",
    icd_mapping: "R10.9",
    active: true,
    synonyms: ["Stomach Ache", "Abdominal Cramping", "Belly Pain", "Epigastric Pain", "RLQ Pain", "RUQ Pain"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsLocation: true, supportsRadiation: true },
    redFlags: ["Involuntary abdominal guarding or rigidity", "Rebound tenderness", "Hematemesis or melena", "Hemodynamic instability"],
    recommendedInvestigations: ["Abdominal Ultrasound", "CT Abdomen/Pelvis", "Serum Lipase", "Liver Function Tests"],
    medicalDefinition: "Pain occurring in the area between the chest and the pelvis.",
    isRedFlag: true,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Abdomen',
    relatedDifferentialDiagnoses: ["appendicitis", "cholecystitis", "pancreatitis", "diverticulitis", "gastroenteritis", "sbo"]
  },
  {
    symptom_id: "SYM000602",
    canonical_key: "nausea_vomiting",
    name: "Nausea & Vomiting",
    category_id: "GI",
    snomed_code: "16932000",
    icd_mapping: "R11.2",
    active: true,
    synonyms: ["Nausea", "Vomiting", "Emesis", "Queasiness", "Throwing Up", "Retching"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsCharacter: true },
    redFlags: ["Coffee-ground emesis or frank blood", "Feculent vomiting", "Persistent intractable vomiting with severe dehydration"],
    recommendedInvestigations: ["Basic Metabolic Panel", "Serum Electrolytes", "Abdominal X-Ray"],
    medicalDefinition: "Nausea is a subjective sensation of a desire to vomit. Vomiting is the forceful expulsion of gastrointestinal contents through the mouth.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Abdomen',
    relatedDifferentialDiagnoses: ["gastroenteritis", "food_poisoning", "appendicitis", "migraine", "pregnancy", "sbo"]
  },

  // Renal & Genitourinary
  {
    symptom_id: "SYM000701",
    canonical_key: "dysuria",
    name: "Painful Urination (Dysuria)",
    category_id: "GU",
    snomed_code: "49650001",
    icd_mapping: "R30.0",
    active: true,
    synonyms: ["Dysuria", "Burning Micturition", "Painful Urination", "Urinary Frequency", "Urinary Urgency"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true },
    redFlags: ["Flank tenderness (CVA tenderness)", "High fever and rigors", "Gross hematuria"],
    recommendedInvestigations: ["Urinalysis with Microscopic", "Urine Culture & Sensitivity", "Renal Ultrasound"],
    medicalDefinition: "Pain, discomfort, or a burning sensation during urination.",
    isRedFlag: false,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Pelvis',
    relatedDifferentialDiagnoses: ["uti", "cystitis", "pyelonephritis", "urethritis", "nephrolithiasis", "prostatitis"]
  },

  // Trauma
  {
    symptom_id: "SYM000801",
    canonical_key: "head_trauma",
    name: "Head Injury & Concussion",
    category_id: "TRAUMA",
    snomed_code: "262925000",
    icd_mapping: "S06.0X0A",
    active: true,
    synonyms: ["Concussion", "Traumatic Brain Injury", "TBI", "Head Trauma", "Post-traumatic Amnesia"],
    attributeConfig: { supportsSeverity: true, supportsDuration: true, supportsOnset: true, supportsCharacter: true },
    redFlags: ["Loss of consciousness > 1 min", "Repeated vomiting (> 2 episodes)", "Post-traumatic seizure", "CSF leak from ear/nose"],
    recommendedInvestigations: ["STAT Non-contrast Head CT (Canadian CT Head Rule)", "C-Spine X-ray/CT"],
    medicalDefinition: "An injury to the head that may involve damage to the scalp, skull, or brain.",
    isRedFlag: true,
    applicableSex: 'Both',
    applicableAgeGroup: ['all'],
    associatedBodyRegion: 'Head',
    relatedDifferentialDiagnoses: ["concussion", "subdural_hematoma", "epidural_hematoma", "sah", "skull_fracture"]
  }
];

/**
 * Enterprise Synonym Search & Lookup Engine
 */
export function findEMRSymptomByTerm(searchTerm: string): EMRSymptomDefinition | undefined {
  if (!searchTerm) return undefined;
  const clean = searchTerm.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  return EMR_SYMPTOM_DICTIONARY.find(def => {
    if (def.canonical_key.replace(/_/g, '') === clean) return true;
    if (def.symptom_id.toLowerCase() === clean) return true;
    if (def.snomed_code === clean) return true;
    if (def.icd_mapping.toLowerCase().replace('.', '') === clean) return true;
    if (def.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(clean)) return true;
    
    return def.synonyms.some(syn => {
      const cleanSyn = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanSyn === clean || cleanSyn.includes(clean) || clean.includes(cleanSyn);
    });
  });
}

export function getAllSynonymsForSymptom(keyOrId: string): string[] {
  const match = findEMRSymptomByTerm(keyOrId);
  return match ? [match.name, ...match.synonyms] : [keyOrId];
}
