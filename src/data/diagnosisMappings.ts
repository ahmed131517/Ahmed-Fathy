export interface RedFlag {
  id: string;
  description: string;
  triageAction: 'Emergency' | 'Urgent' | 'Consult';
  urgencyLevel: 1 | 2 | 3; // 1: Immediate/Resuscitation, 2: Emergent, 3: Urgent
}

export interface Diagnosis {
  id: string;
  name: string;
  // New EMR structure (fields optional for backward compatibility)
  system?: 'Cardiovascular' | 'Respiratory' | 'Neurological' | 'Endocrine' | 'Infectious' | 'Hematology' | 'Oncology' | 'Psychiatry' | 'Musculoskeletal' | 'Renal' | 'Gastrointestinal' | 'Dermatological' | 'Reproductive' | 'EENT';
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  description: string;
  inheritsSymptomsFrom?: string[];
  commonSymptoms: string[]; 
  redFlagsStructured?: RedFlag[]; // New structure
  
  // Existing structure (maintained for compatibility)
  category: string;
  redFlags: string[]; 
  icd10: string;
  prevalenceScore?: number;
  triagePriority?: 1 | 2 | 3 | 4 | 5;
  diagnosticTests?: string[];
  firstLineTreatments?: string[];
  prognosis?: string;
}

// ... (SYSTEM_BASES remains)

export const COMMON_DIAGNOSES: Diagnosis[] = [
  // Cardiovascular
  {
    id: "heart_failure",
    name: "Heart Failure",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular", // Maintain for backward compatibility
    redFlags: [], // Maintain for backward compatibility
    description: "A chronic condition in which the heart doesn't pump blood as well as it should.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["leg_swelling_heart", "orthopnea", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'hf_rest_dyspnea', description: "Severe shortness of breath at rest", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hf_frothy_sputum', description: "Pink, frothy sputum", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hf_weight_gain', description: "Sudden weight gain", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "I50.9",
    prevalenceScore: 8,
    triagePriority: 2,
    diagnosticTests: ["Echocardiogram", "BNP blood test", "Chest X-ray"],
    firstLineTreatments: ["ACE inhibitors", "Beta-blockers", "Diuretics"],
    prognosis: "Chronic, requires lifelong management."
  },
  {
    id: "angina_pectoris",
    name: "Angina Pectoris",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular", // Maintain for backward compatibility
    redFlags: [], // Maintain for backward compatibility
    description: "Chest pain or discomfort due to coronary heart disease.",
    inheritsSymptomsFrom: ['chest_discomfort'],
    commonSymptoms: ["chest_tightness", "dyspnea_exertion"],
    redFlagsStructured: [
      { id: 'ang_rad', description: "Pain radiating to jaw or left arm", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ang_rest', description: "Pain not relieved by rest", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ang_diapho', description: "Diaphoresis", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "I20.9",
    prevalenceScore: 7,
    triagePriority: 2,
    diagnosticTests: ["ECG", "Stress test", "Coronary angiography"],
    firstLineTreatments: ["Nitroglycerin", "Beta-blockers", "Calcium channel blockers"],
    prognosis: "Manageable with lifestyle changes and medication."
  },
  {
    id: "atrial_fibrillation",
    name: "Atrial Fibrillation",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "An irregular, often rapid heart rate that commonly causes poor blood flow.",
    inheritsSymptomsFrom: ['heart_palpitations'],
    commonSymptoms: ["dyspnea_exertion", "gen_fatigue", "dizziness"],
    redFlagsStructured: [
      { id: 'af_chest_pain', description: "Severe chest pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'af_syncope', description: "Fainting (syncope)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'af_stroke', description: "Signs of stroke (weakness, speech difficulty)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I48.91",
    prevalenceScore: 9,
    triagePriority: 2,
    diagnosticTests: ["ECG", "Holter monitor", "Echocardiogram"],
    firstLineTreatments: ["Beta-blockers", "Anticoagulants", "Rate control"],
    prognosis: "Depends on rate control and anticoagulation strategy to prevent stroke."
  },
  {
    id: "pericarditis",
    name: "Pericarditis",
    system: 'Cardiovascular',
    severity: 'Mild',
    category: "Cardiovascular",
    redFlags: [],
    description: "Swelling and irritation of the thin, saclike tissue surrounding the heart.",
    inheritsSymptomsFrom: ['chest_discomfort'],
    commonSymptoms: ["pleuritic_chest_pain", "gen_fever"],
    redFlagsStructured: [
      { id: 'peri_tamponade', description: "Cardiac tamponade signs (hypotension, muffled heart sounds)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'peri_shortness_breath', description: "Severe shortness of breath", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "I31.9",
    prevalenceScore: 4,
    triagePriority: 3,
    diagnosticTests: ["ECG", "Echocardiogram", "CRP/ESR"],
    firstLineTreatments: ["NSAIDs", "Colchicine"],
    prognosis: "Generally good with proper anti-inflammatory therapy."
  },
  {
    id: "peripheral_artery_disease",
    name: "Peripheral Artery Disease (PAD)",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "A circulatory condition in which narrowed blood vessels reduce blood flow to the limbs.",
    inheritsSymptomsFrom: ['leg_pain'],
    commonSymptoms: ["claudication", "leg_swelling"],
    redFlagsStructured: [
      { id: 'pad_rest_pain', description: "Rest pain in legs", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'pad_ulcers', description: "Non-healing ulcers on feet", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'pad_pulseless', description: "Cold, pulseless limb", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I73.9",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "aortic_dissection",
    name: "Aortic Dissection",
    system: 'Cardiovascular',
    severity: 'Critical',
    category: "Cardiovascular",
    redFlags: [],
    description: "A serious condition in which the inner layer of the aorta tears.",
    inheritsSymptomsFrom: ['chest_discomfort'],
    commonSymptoms: ["back_pain_upper", "dizziness"],
    redFlagsStructured: [
      { id: 'ad_tearing_pain', description: "Sudden, severe tearing chest/back pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ad_pulse_def', description: "Pulse deficit", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ad_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I71.00",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "coronary_artery_disease",
    name: "Coronary artery disease",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "Narrowing or blockage of the coronary arteries.",
    inheritsSymptomsFrom: ['chest_discomfort'],
    commonSymptoms: ["dyspnea_exertion"],
    redFlagsStructured: [
      { id: 'cad_chest_pain', description: "Severe chest pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cad_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I25.10",
    prevalenceScore: 9,
    triagePriority: 2
  },
  {
    id: "ventricular_tachycardia",
    name: "Ventricular tachycardia",
    system: 'Cardiovascular',
    severity: 'Critical',
    category: "Cardiovascular",
    redFlags: [],
    description: "Fast heart rhythm starting in the lower chambers.",
    inheritsSymptomsFrom: ['heart_palpitations'],
    commonSymptoms: ["dizziness"],
    redFlagsStructured: [
      { id: 'vt_chest_pain', description: "Chest pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'vt_unconsciousness', description: "Loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I47.2",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "ventricular_fibrillation",
    name: "Ventricular fibrillation",
    system: 'Cardiovascular',
    severity: 'Critical',
    category: "Cardiovascular",
    redFlags: [],
    description: "Rapid, inadequate heartbeat with no output.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'vf_arrest', description: "Cardiac arrest", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'vf_unconsciousness', description: "Unconsciousness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I49.01",
    prevalenceScore: 1,
    triagePriority: 1
  },
  {
    id: "cardiomyopathy",
    name: "Cardiomyopathy",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular",
    redFlags: [],
    description: "Disease of the heart muscle.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'cm_edema', description: "Severe edema", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'cm_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I42.9",
    prevalenceScore: 5,
    triagePriority: 2
  },
  {
    id: "aortic_stenosis",
    name: "Aortic stenosis",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "Narrowing of the aortic valve.",
    inheritsSymptomsFrom: ['chest_discomfort', 'dyspnea_exertion'],
    commonSymptoms: ["dizziness"],
    redFlagsStructured: [
      { id: 'as_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'as_angina', description: "Angina", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I35.0",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "mitral_regurgitation",
    name: "Mitral regurgitation",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "Leaking of blood backwards through the mitral valve.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'mr_heart_failure', description: "Signs of heart failure", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "I34.0",
    prevalenceScore: 6,
    triagePriority: 3
  },
  {
    id: "pulmonary_hypertension",
    name: "Pulmonary hypertension",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular",
    redFlags: [],
    description: "High blood pressure in the arteries of the lungs.",
    inheritsSymptomsFrom: ['dyspnea_exertion'],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'ph_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ph_rhf', description: "Right heart failure", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "I27.20",
    prevalenceScore: 4,
    triagePriority: 2
  },
  {
    id: "aortic_aneurysm",
    name: "Aortic aneurysm",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Cardiovascular",
    redFlags: [],
    description: "Bulging/weakening of the aortic wall.",
    inheritsSymptomsFrom: ['chest_discomfort'],
    commonSymptoms: ["abdominal_pain", "back_pain_upper"],
    redFlagsStructured: [
      { id: 'aa_rupture', description: "Severe rupture pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'aa_hypotension', description: "Hypotension", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I71.9",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "myocardial_infarction",
    name: "Myocardial Infarction (Heart Attack)",
    system: 'Cardiovascular',
    severity: 'Critical',
    category: "Cardiovascular",
    redFlags: [],
    description: "Sudden blockage of blood flow to the heart muscle, causing tissue damage and potential heart failure.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["heart_chest_pain", "lungs_shortness_of_breath", "nausea", "gen_fatigue", "chest_tightness", "diaphoresis", "palpitations"],
    redFlagsStructured: [
      { id: 'mi_crushing', description: "Crushing, pressure-like chest pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mi_radiation', description: "Pain radiating to jaw, neck, or left arm", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mi_arrest', description: "Collapse or cardiac arrest", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mi_ams', description: "New onset confusion or syncope", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I21.9",
    prevalenceScore: 8,
    triagePriority: 1,
    diagnosticTests: ["ECG", "Troponin", "Coronary angiography"],
    firstLineTreatments: ["Aspirin", "Nitroglycerin", "P2Y12 inhibitors", "PCI (Primary)"],
    prognosis: "Variable; depends on extent of cardiac muscle damage and timely intervention."
  },

  {
    id: "chronic_bronchitis",
    name: "Chronic bronchitis",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "Long-term inflammation of the bronchi.",
    inheritsSymptomsFrom: ['dyspnea', 'cough'],
    commonSymptoms: [],
    redFlagsStructured: [
      { id: 'cb_dyspnea', description: "Severe dyspnea", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'cb_cyanosis', description: "Cyanosis", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J41.0",
    prevalenceScore: 8,
    triagePriority: 3
  },
  {
    id: "emphysema",
    name: "Emphysema",
    system: 'Respiratory',
    severity: 'Severe',
    category: "Respiratory",
    redFlags: [],
    description: "Damage to the air sacs in the lungs.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: ["wheezing"],
    redFlagsStructured: [
      { id: 'emp_distress', description: "Severe respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'emp_pneumo', description: "Pneumothorax", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J43.9",
    prevalenceScore: 7,
    triagePriority: 2
  },
  {
    id: "bronchiectasis",
    name: "Bronchiectasis",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "The airways in the lungs become widened and damaged.",
    inheritsSymptomsFrom: ['cough'],
    commonSymptoms: ["hemoptysis"],
    redFlagsStructured: [
      { id: 'bronch_hem', description: "Massive hemoptysis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'bronch_fail', description: "Respiratory failure", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J47.9",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "pulmonary_fibrosis",
    name: "Pulmonary fibrosis",
    system: 'Respiratory',
    severity: 'Severe',
    category: "Respiratory",
    redFlags: [],
    description: "Scarring of lung tissue.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: ["cough_dry"],
    redFlagsStructured: [
      { id: 'pf_distress', description: "Severe respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pf_hypoxemia', description: "Hypoxemia", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J84.10",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "acute_respiratory_distress",
    name: "Acute respiratory distress syndrome",
    system: 'Respiratory',
    severity: 'Critical',
    category: "Respiratory",
    redFlags: [],
    description: "Severe lung inflammation.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: [],
    redFlagsStructured: [
      { id: 'ards_hypoxemia', description: "Severe hypoxemia", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ards_failure', description: "Systemic failure", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J80",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "pleural_effusion",
    name: "Pleural effusion",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "Excess fluid around the lungs.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: ["pleuritic_chest_pain"],
    redFlagsStructured: [
      { id: 'ple_dyspnea', description: "Severe dyspnea", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "J90",
    prevalenceScore: 5,
    triagePriority: 3
  },
  {
    id: "sarcoidosis_resp",
    name: "Sarcoidosis",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "Inflammatory disease affecting lungs.",
    inheritsSymptomsFrom: ['cough', 'dyspnea'],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'sarc_lung_decline', description: "Severe lung function decline", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "D86.0",
    prevalenceScore: 3,
    triagePriority: 4
  },
  {
    id: "copd",
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    system: 'Respiratory',
    severity: 'Severe',
    category: "Respiratory",
    redFlags: [],
    description: "A group of lung diseases that block airflow and make it difficult to breathe.",
    inheritsSymptomsFrom: ['dyspnea', 'cough', 'wheezing'],
    commonSymptoms: [],
    redFlagsStructured: [
      { id: 'copd_speak', description: "Inability to speak in full sentences", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'copd_cyanosis', description: "Cyanosis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'copd_mental', description: "Altered mental status", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J44.9",
    prevalenceScore: 9,
    triagePriority: 2
  },

  {
    id: "covid_19",
    name: "COVID-19",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "A highly contagious respiratory disease caused by the SARS-CoV-2 virus.",
    inheritsSymptomsFrom: ['dyspnea', 'cough'],
    commonSymptoms: ["gen_fever", "gen_fatigue", "sore_throat"],
    redFlagsStructured: [
      { id: 'cv_o2', description: "Oxygen saturation < 92%", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cv_distress', description: "Severe shortness of breath", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cv_mental', description: "Confusion", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "U07.1",
    prevalenceScore: 10,
    triagePriority: 2
  },
  {
    id: "tuberculosis",
    name: "Tuberculosis (TB)",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "A potentially serious infectious bacterial disease that mainly affects the lungs.",
    inheritsSymptomsFrom: ['cough'],
    commonSymptoms: ["hemoptysis", "gen_night_sweats", "gen_weight_loss", "gen_fever"],
    redFlagsStructured: [
      { id: 'tb_hemoptysis', description: "Massive hemoptysis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'tb_distress', description: "Severe respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A15.9",
    prevalenceScore: 4,
    triagePriority: 2
  },
  {
    id: "pneumothorax",
    name: "Pneumothorax (Collapsed Lung)",
    system: 'Respiratory',
    severity: 'Critical',
    category: "Respiratory",
    redFlags: [],
    description: "Air leaks into the space between your lung and chest wall, pushing on the outside of your lung.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: ["pleuritic_chest_pain", "tachypnea"],
    redFlagsStructured: [
      { id: 'ptx_tracheal', description: "Tracheal deviation", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ptx_distress', description: "Severe respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ptx_hypo', description: "Hypotension", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J93.9",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "sleep_apnea",
    name: "Obstructive Sleep Apnea",
    system: 'Respiratory',
    severity: 'Moderate',
    category: "Respiratory",
    redFlags: [],
    description: "A sleep disorder in which breathing repeatedly stops and starts.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["sleep_apnea", "gen_fatigue", "headache_tension"],
    redFlagsStructured: [
      { id: 'osa_driving', description: "Falling asleep while driving", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'osa_somnolence', description: "Severe daytime somnolence", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "G47.33",
    prevalenceScore: 8,
    triagePriority: 4
  },
  {
    id: "lung_cancer",
    name: "Lung Cancer",
    system: 'Oncology',
    severity: 'Severe',
    category: "Oncology",
    redFlags: [],
    description: "Cancer that begins in the lungs and most often occurs in people who smoke.",
    inheritsSymptomsFrom: ['cough', 'dyspnea'],
    commonSymptoms: ["hemoptysis", "gen_weight_loss"],
    redFlagsStructured: [
      { id: 'lc_weight', description: "Unexplained significant weight loss", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'lc_hemoptysis', description: "Massive hemoptysis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'lc_stridor', description: "Stridor (high-pitched breathing suggesting airway obstruction)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'lc_svc', description: "Superior vena cava syndrome", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "C34.90",
    prevalenceScore: 4,
    triagePriority: 3
  },
  {
    id: "asthma_exacerbation",
    name: "Asthma Exacerbation",
    system: 'Respiratory',
    severity: 'Severe',
    category: "Respiratory",
    redFlags: [],
    description: "Acute worsening of asthma symptoms like shortness of breath and wheezing.",
    inheritsSymptomsFrom: ['dyspnea', 'cough', 'wheezing'],
    commonSymptoms: [],
    redFlagsStructured: [
      { id: 'asthma_speak', description: "Difficulty speaking in full sentences", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'asthma_cyanosis', description: "Cyanosis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'asthma_silent', description: "Silent chest", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J45.901",
    prevalenceScore: 8,
    triagePriority: 2
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "Infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
    inheritsSymptomsFrom: ['cough', 'dyspnea'],
    commonSymptoms: ["gen_fever", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'pna_o2', description: "Oxygen saturation < 92%", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pna_confusion', description: "Confusion", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'pna_rr', description: "Respiratory rate > 30", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "J18.9",
    prevalenceScore: 9,
    triagePriority: 3,
    diagnosticTests: ["Chest X-ray", "Sputum culture", "CBC"],
    firstLineTreatments: ["Empiric antibiotics", "Rest/Hydration"],
    prognosis: "Favorable in healthy adults; guarded in elderly/immunocompromised."
  },
  {
    id: "bronchitis",
    name: "Acute Bronchitis",
    system: 'Respiratory',
    severity: 'Mild',
    category: "Respiratory",
    redFlags: [],
    description: "Inflammation of the bronchial tubes, usually viral, causing a persistent cough.",
    inheritsSymptomsFrom: ['cough'],
    commonSymptoms: ["wheezing", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'ab_fever', description: "High fever", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'ab_shortness', description: "Shortness of breath", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ab_blood', description: "Bloody sputum", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "J20.9",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "pulmonary_embolism",
    name: "Pulmonary Embolism (PE)",
    system: 'Respiratory',
    severity: 'Critical',
    category: "Vascular",
    redFlags: [],
    description: "A blood clot that travels to the lungs, often originating from a DVT.",
    inheritsSymptomsFrom: ['dyspnea'],
    commonSymptoms: ["pleuritic_chest_pain", "tachypnea"],
    redFlagsStructured: [
      { id: 'pe_sudden', description: "Sudden onset", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pe_hemoptysis', description: "Hemoptysis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pe_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pe_hypo', description: "Hypotension", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I26.99",
    prevalenceScore: 3,
    triagePriority: 1,
    diagnosticTests: ["CT Pulmonary Angiography (CTPA)", "D-Dimer", "V/Q Scan"],
    firstLineTreatments: ["Anticoagulation", "Thrombolytics (if severe)"],
    prognosis: "Potentially life-threatening; good survival with rapid anticoagulation."
  },
  {
    id: "influenza",
    name: "Influenza (Flu)",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "A viral infection that attacks your respiratory system — your nose, throat and lungs, characterized by sudden onset of systemic symptoms.",
    inheritsSymptomsFrom: ['cough'],
    commonSymptoms: ["gen_fever", "gen_fatigue", "sore_throat", "cough_dry", "msk_muscle_pain", "headache_tension"],
    redFlagsStructured: [
      { id: 'flu_sob', description: "Severe shortness of breath", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'flu_resp', description: "Worsening shortness of breath", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'flu_chest', description: "Chest pain", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'flu_mental', description: "Altered mental status", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J11.1",
    prevalenceScore: 10,
    triagePriority: 4,
    diagnosticTests: ["Viral PCR panel", "Rapid Antigen test"],
    firstLineTreatments: ["Supportive fluids", "Oseltamivir"],
    prognosis: "Self-limiting in most patients; potential for serious complications."
  },

  // Gastrointestinal
  {
    id: "gastroenteritis",
    name: "Gastroenteritis",
    system: 'Gastrointestinal',
    severity: 'Moderate',
    category: "Digestive",
    redFlags: [],
    description: "Intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["nausea", "vomiting", "diarrhea", "abdominal_pain", "gen_fever"],
    redFlagsStructured: [
      { id: 'ge_dehydration', description: "Severe dehydration (no urine, sunken eyes)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ge_fluids', description: "Inability to keep fluids down", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ge_blood', description: "Bloody diarrhea or stools", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A09",
    prevalenceScore: 10,
    triagePriority: 4
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    system: 'Gastrointestinal',
    severity: 'Severe',
    category: "Digestive",
    redFlags: [],
    description: "Inflammation of the appendix, a medical emergency.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "gen_fever"],
    redFlagsStructured: [
      { id: 'app_rlq', description: "Severe right lower quadrant pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'app_rebound', description: "Rebound tenderness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'app_rigidity', description: "Rigidity", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "K35.80",
    prevalenceScore: 5,
    triagePriority: 1
  },
  {
    id: "peptic_ulcer_disease",
    name: "Peptic Ulcer Disease",
    system: 'Gastrointestinal',
    severity: 'Moderate',
    category: "Digestive",
    redFlags: [],
    description: "A sore that develops on the lining of the esophagus, stomach, or small intestine.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "belching_hiccups", "blood_in_stool"],
    redFlagsStructured: [
      { id: 'pud_hematemesis', description: "Vomiting blood", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pud_melena', description: "Black, tarry stools", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pud_perforation', description: "Sudden severe abdominal pain (perforation)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "K27.9",
    prevalenceScore: 6,
    triagePriority: 3
  },
  {
    id: "ibs",
    name: "Irritable Bowel Syndrome (IBS)",
    system: 'Gastrointestinal',
    severity: 'Mild',
    category: "Digestive",
    redFlags: [],
    description: "A common disorder that affects the large intestine, causing cramps, pain, and changes in bowel habits.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "diarrhea", "constipation", "bloating_gas"],
    redFlagsStructured: [
      { id: 'ibs_weight_loss', description: "Unexplained weight loss", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'ibs_bleeding', description: "Rectal bleeding", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ibs_onset_age', description: "Onset after age 50", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "K58.9",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "cholecystitis",
    name: "Cholecystitis / Gallstones",
    system: 'Gastrointestinal',
    severity: 'Severe',
    category: "Digestive",
    redFlags: [],
    description: "Inflammation of the gallbladder, often caused by gallstones.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "jaundice"],
    redFlagsStructured: [
      { id: 'chol_fever', description: "High fever with chills", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'chol_ruq', description: "Severe right upper quadrant pain", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'chol_jaundice', description: "Jaundice", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "K81.9",
    prevalenceScore: 7,
    triagePriority: 2
  },
  {
    id: "pancreatitis",
    name: "Acute Pancreatitis",
    system: 'Gastrointestinal',
    severity: 'Critical',
    category: "Digestive",
    redFlags: [],
    description: "Inflammation of the pancreas, causing severe abdominal pain.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "back_pain_upper"],
    redFlagsStructured: [
      { id: 'panc_radiation', description: "Severe, constant abdominal pain radiating to back", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'panc_shock', description: "Signs of shock", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "K85.90",
    prevalenceScore: 4,
    triagePriority: 1
  },
  {
    id: "diverticulitis",
    name: "Diverticulitis",
    system: 'Gastrointestinal',
    severity: 'Moderate',
    category: "Digestive",
    redFlags: [],
    description: "Inflammation or infection in one or more small pouches in the digestive tract.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "gen_fever", "nausea", "diarrhea", "constipation"],
    redFlagsStructured: [
      { id: 'div_llq', description: "Severe left lower quadrant pain", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'div_fever', description: "High fever", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'div_fluids', description: "Inability to tolerate oral fluids", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "K57.92",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "ibd",
    name: "Inflammatory Bowel Disease (Crohn's/UC)",
    system: 'Gastrointestinal',
    severity: 'Moderate',
    category: "Digestive",
    redFlags: [],
    description: "Chronic inflammation of the digestive tract.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "diarrhea", "blood_in_stool", "gen_weight_loss", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'ibd_blood', description: "Severe bloody diarrhea", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ibd_weight', description: "Significant weight loss", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'ibd_pain', description: "Severe abdominal pain", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "K52.9",
    prevalenceScore: 4,
    triagePriority: 3
  },
  {
    id: "hepatitis",
    name: "Hepatitis",
    system: 'Gastrointestinal',
    severity: 'Severe',
    category: "Digestive",
    redFlags: [],
    description: "Inflammation of the liver, often caused by a viral infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["jaundice", "gen_fatigue", "nausea", "abdominal_pain", "loss_of_appetite"],
    redFlagsStructured: [
      { id: 'hep_mental', description: "Altered mental status (encephalopathy)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hep_bleed', description: "Severe bleeding tendency", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hep_ascites', description: "Ascites", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "B19.9",
    prevalenceScore: 4,
    triagePriority: 2
  },
  {
    id: "hemorrhoids",
    name: "Hemorrhoids",
    system: 'Gastrointestinal',
    severity: 'Mild',
    category: "Digestive",
    redFlags: [],
    description: "Swollen and inflamed veins in the rectum and anus that cause discomfort and bleeding.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["blood_in_stool", "constipation"],
    redFlagsStructured: [
      { id: 'hem_bleed', description: "Large volume of bleeding", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'hem_pain', description: "Severe anal pain", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'hem_anemia', description: "Signs of anemia", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "K64.9",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "celiac_disease",
    name: "Celiac Disease",
    system: 'Gastrointestinal',
    severity: 'Moderate',
    category: "Digestive",
    redFlags: [],
    description: "An immune reaction to eating gluten, a protein found in wheat, barley, and rye.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["diarrhea", "bloating_gas", "gen_weight_loss", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'cel_malnutrition', description: "Severe malnutrition", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'cel_refractory', description: "Refractory symptoms despite diet", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "K90.0",
    prevalenceScore: 6,
    triagePriority: 4
  },
  {
    id: "gerd",
    name: "GERD (Acid Reflux)",
    system: 'Gastrointestinal',
    severity: 'Mild',
    category: "Digestive",
    redFlags: [],
    description: "Chronic condition where stomach acid flows back into the esophagus.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["heartburn_reflux", "sore_throat", "cough_dry"],
    redFlagsStructured: [
      { id: 'gerd_swallow', description: "Difficulty swallowing", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'gerd_weight', description: "Weight loss", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'gerd_blood', description: "Vomiting blood", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "K21.9",
    prevalenceScore: 10,
    triagePriority: 4
  },

  // Neurological
  {
    id: "tia",
    name: "Transient Ischemic Attack (TIA)",
    system: 'Neurological',
    severity: 'Severe',
    category: "Neurological",
    redFlags: [],
    description: "A brief stroke-like attack that, despite resolving within minutes to hours, still requires immediate medical attention.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_speech_difficulty", "paralysis", "neuro_coordination", "facial_weakness_paralysis"],
    redFlagsStructured: [
      { id: 'tia_duration', description: "Symptoms lasting > 1 hour", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'tia_crescendo', description: "Crescendo TIAs", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G45.9",
    prevalenceScore: 4,
    triagePriority: 1
  },
  {
    id: "parkinson_disease",
    name: "Parkinson's Disease",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "A progressive disorder of the central nervous system that affects movement, often including tremors.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_tremor", "neuro_coordination", "msk_muscle_weakness", "back_stiffness", "gait_abnormality", "gen_fatigue", "dysphagia"],
    redFlagsStructured: [
      { id: 'pd_progression', description: "Rapid progression", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pd_falls', description: "Frequent falls or severe gait instability", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pd_autonomic', description: "Severe autonomic dysfunction", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pd_swallow', description: "Severe dysphagia", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pd_psychosis', description: "Severe agitation or psychosis", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "G20",
    prevalenceScore: 5,
    triagePriority: 4
  },
  {
    id: "multiple_sclerosis",
    name: "Multiple Sclerosis (MS)",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "A chronic, progressive disease involving damage to the sheaths of nerve cells in the brain and spinal cord.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_coordination", "msk_muscle_weakness", "neuropathic_pain", "vision_blurring", "neuro_numbness", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'ms_weakness', description: "Rapidly progressive weakness", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ms_incontinence', description: "Bowel/bladder incontinence", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ms_vision', description: "Acute severe vision loss (Optic Neuritis)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ms_myelitis', description: "Acute transverse myelitis (paralysis, bowel/bladder retention)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G35",
    prevalenceScore: 4,
    triagePriority: 3
  },
  {
    id: "epilepsy",
    name: "Epilepsy",
    system: 'Neurological',
    severity: 'Severe',
    category: "Neurological",
    redFlags: [],
    description: "A disorder in which nerve cell activity in the brain is disturbed, causing recurrent unprovoked seizures.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_seizures", "neuro_memory_loss", "neuro_tremor", "gen_fatigue", "head_dizziness_vertigo"],
    redFlagsStructured: [
      { id: 'ep_status', description: "Status epilepticus (seizure > 5 mins or not regaining consciousness between)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ep_loc', description: "Failure to regain consciousness between seizures", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ep_injury', description: "Significant injury (head trauma, dislocation) during seizure", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ep_first', description: "First-time seizure", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "G40.909",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "alzheimers",
    name: "Alzheimer's Disease",
    system: 'Neurological',
    severity: 'Severe',
    category: "Neurological",
    redFlags: [],
    description: "A progressive disease that destroys memory and other important mental functions.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_memory_loss", "neuro_speech_difficulty", "neuro_coordination", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'alz_delirium', description: "Sudden onset of confusion (delirium)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'alz_self_care', description: "Inability to care for self", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'alz_wandering', description: "Dangerous wandering / elopement risk", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'alz_swallow', description: "Severe dysphagia (aspiration risk)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'alz_psych', description: "Severe agitation or psychosis posing threat", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "G30.9",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "peripheral_neuropathy",
    name: "Peripheral Neuropathy",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "Weakness, numbness, and pain from nerve damage, usually in the hands and feet.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuropathic_pain", "neuro_numbness", "msk_muscle_weakness"],
    redFlagsStructured: [
      { id: 'pn_ascending', description: "Rapidly ascending weakness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pn_autonomic', description: "Autonomic dysfunction", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pn_motor', description: "Severe motor weakness", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "G62.9",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "bells_palsy",
    name: "Bell's Palsy",
    system: 'Neurological',
    severity: 'Mild',
    category: "Neurological",
    redFlags: [],
    description: "Sudden weakness in the muscles on one half of the face.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["facial_weakness_paralysis", "eye_pain", "ear_pain"],
    redFlagsStructured: [
      { id: 'bell_eye', description: "Inability to close eye completely", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'bell_bilateral', description: "Bilateral facial weakness", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'bell_other', description: "Other neurological deficits", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G51.0",
    prevalenceScore: 5,
    triagePriority: 4
  },
  {
    id: "trigeminal_neuralgia",
    name: "Trigeminal Neuralgia",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "A chronic pain condition that affects the trigeminal nerve, which carries sensation from your face to your brain.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["facial_pain", "neuropathic_pain"],
    redFlagsStructured: [
      { id: 'tn_bilateral', description: "Bilateral pain", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'tn_deficits', description: "Associated neurological deficits", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'tn_age', description: "Onset under age 40", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "G50.0",
    prevalenceScore: 3,
    triagePriority: 4
  },
  {
    id: "migraine",
    name: "Migraine Headache",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "Recurrent headache disorder characterized by moderate to severe throbbing pain, often on one side of the head.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_migraine", "nausea", "gen_fatigue", "photophobia"],
    redFlagsStructured: [
      { id: 'mig_thunderclap', description: "Sudden onset 'thunderclap' headache", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mig_deficits', description: "Neurological deficits", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'mig_fever', description: "Fever with stiff neck", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G43.909",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "tension_headache",
    name: "Tension-Type Headache",
    system: 'Neurological',
    severity: 'Mild',
    category: "Neurological",
    redFlags: [],
    description: "The most common type of headache, often described as a tight band around the head.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_tension", "gen_fatigue", "neck_pain_stiffness"],
    redFlagsStructured: [
      { id: 'ten_age', description: "New headache after age 50", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'ten_trauma', description: "Worsening after head injury", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "G44.209",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "cluster_headache",
    name: "Cluster Headache",
    system: 'Neurological',
    severity: 'Severe',
    category: "Neurological",
    redFlags: [],
    description: "Intensely painful headaches that occur in cycles or clusters.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_cluster", "eye_redness", "eye_discharge"],
    redFlagsStructured: [
      { id: 'clus_first', description: "First ever cluster-like headache", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'clus_duration', description: "Atypical duration", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'clus_confusion', description: "Associated confusion", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "G44.009",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "concussion",
    name: "Concussion",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "Traumatic brain injury that affects brain function, usually temporary.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["head_injury_concussion", "nausea", "gen_fatigue", "neuro_memory_loss"],
    redFlagsStructured: [
      { id: 'conc_loc', description: "Loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'conc_vomit', description: "Repeated vomiting", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'conc_seizure', description: "Seizures", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'conc_confusion', description: "Worsening confusion", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "S06.0X0A",
    prevalenceScore: 8,
    triagePriority: 2
  },

  // Musculoskeletal
  {
    id: "osteoarthritis",
    name: "Osteoarthritis",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A type of arthritis that occurs when flexible tissue at the ends of bones wears down.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "joint_stiffness"],
    redFlagsStructured: [
      { id: 'oa_infection', description: "Hot, red, swollen joint (infection risk)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'oa_weight', description: "Inability to bear weight", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'oa_locking', description: "Joint locking or giving way", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'oa_deformity', description: "Significant joint deformity", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "M19.90",
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
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "gen_fatigue", "gen_fever", "joint_stiffness"],
    redFlagsStructured: [
      { id: 'ra_systemic', description: "Systemic symptoms (high fever, severe weight loss)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ra_spine', description: "Cervical spine involvement", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ra_vasculitis', description: "Signs of systemic vasculitis (skin ulcers, nerve pain)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ra_cervical', description: "Cervical spine instability symptoms (neck pain, neuro deficits)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M06.9",
    prevalenceScore: 6,
    triagePriority: 4
  },
  {
    id: "gout",
    name: "Gout",
    system: 'Musculoskeletal',
    severity: 'Moderate',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A form of arthritis characterized by severe pain, redness, and tenderness in joints.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "skin_redness"],
    redFlagsStructured: [
      { id: 'gout_fever', description: "Fever", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'gout_multi', description: "Multiple joints involved simultaneously", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'gout_septic', description: "Suspicion of septic arthritis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'gout_sepsis', description: "Fever and systemic illness (ruling out septic arthritis)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'gout_poly', description: "Polyarticular involvement (multiple joints simultaneously)", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "M10.9",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "fibromyalgia",
    name: "Fibromyalgia",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory and mood issues.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "gen_fatigue", "neuro_memory_loss", "headache_tension"],
    redFlagsStructured: [
      { id: 'fibro_weight', description: "Severe unexplained weight loss", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'fibro_neuro', description: "Focal neurological signs", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'fm_psych', description: "Severe comorbid depression or anxiety", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "M79.7",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "sciatica",
    name: "Sciatica",
    system: 'Musculoskeletal',
    severity: 'Moderate',
    category: "Musculoskeletal",
    redFlags: [],
    description: "Pain radiating along the sciatic nerve, which runs down one or both legs from the lower back.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["back_pain_lower", "neuropathic_pain", "msk_muscle_weakness", "sciatica"],
    redFlagsStructured: [
      { id: 'sci_saddle', description: "Saddle anesthesia", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sci_incontinence', description: "Bowel or bladder incontinence", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sci_motor', description: "Progressive motor weakness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M54.30",
    prevalenceScore: 8,
    triagePriority: 3
  },
  {
    id: "herniated_disc",
    name: "Herniated Disc",
    system: 'Musculoskeletal',
    severity: 'Moderate',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A problem with a rubbery disk between the spinal bones.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["back_pain_lower", "neuropathic_pain", "back_numbness"],
    redFlagsStructured: [
      { id: 'hd_cauda', description: "Cauda equina syndrome signs", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hd_weakness', description: "Severe progressive weakness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M51.26",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "osteoporosis",
    name: "Osteoporosis (with fracture)",
    system: 'Musculoskeletal',
    severity: 'Severe',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A condition in which bones become weak and brittle.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["back_pain_lower", "back_pain_upper", "msk_bone_pain"],
    redFlagsStructured: [
      { id: 'osteo_back_pain', description: "Sudden severe back pain in elderly", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'osteo_height', description: "Loss of height", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'osteo_neuro', description: "Neurological deficits", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M81.0",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "muscle_strain",
    name: "Muscle Strain / Sprain",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "Stretching or tearing of a muscle or a tissue connecting muscle to bone (tendon).",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_muscle_weakness", "msk_joint_swelling", "msk_joint_pain"],
    redFlagsStructured: [
      { id: 'ms_weight', description: "Inability to bear weight", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'ms_deformity', description: "Visible deformity", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ms_pain', description: "Severe pain out of proportion", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "S39.012",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "plantar_fasciitis",
    name: "Plantar Fasciitis",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "An inflammation of a thick band of tissue that connects the heel bone to the toes.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "gait_abnormality"],
    redFlagsStructured: [
      { id: 'pf_numbness', description: "Numbness or tingling in foot", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'pf_night', description: "Pain that worsens at night", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'pf_fever', description: "Fever", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "M72.2",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "lumbar_strain",
    name: "Acute Lumbar Strain",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "Injury to the lower back muscles or ligaments, often following physical exertion.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["back_pain_lower", "back_spasm", "back_stiffness"],
    redFlagsStructured: [
      { id: 'ls_cauda', description: "Cauda equina symptoms (saddle anesthesia, bowel/bladder incontinence)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ls_fever', description: "Fever", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ls_weight', description: "Weight loss", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "S39.012",
    prevalenceScore: 10,
    triagePriority: 4
  },

  // Endocrine / Metabolic
  {
    id: "diabetes_mellitus",
    name: "Diabetes Mellitus",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "A disease in which the body's ability to produce or respond to the hormone insulin is impaired.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_thirst", "urinary_urgency", "gen_weight_loss", "gen_fatigue", "nycturia"],
    redFlagsStructured: [
      { id: 'dm_odor', description: "Fruity breath odor", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'dm_lethargy', description: "Confusion or lethargy", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'dm_dka', description: "Kussmaul respirations (DKA)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E11.9",
    prevalenceScore: 10,
    triagePriority: 4
  },
  {
    id: "hypothyroidism",
    name: "Hypothyroidism",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "A condition in which the thyroid gland doesn't produce enough of certain crucial hormones.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "constipation", "msk_muscle_weakness", "gen_cold_intolerance"],
    redFlagsStructured: [
      { id: 'hypo_myxedema', description: "Myxedema coma (extreme lethargy, hypothermia, slow heart rate)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hypo_brady', description: "Severe bradycardia", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E03.9",
    prevalenceScore: 8,
    triagePriority: 4
  },
  {
    id: "hyperthyroidism",
    name: "Hyperthyroidism",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "The overproduction of a hormone by the butterfly-shaped gland in the neck (thyroid).",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["palpitations", "gen_weight_loss", "neuro_tremor", "diarrhea", "gen_fatigue", "gen_fever"],
    redFlagsStructured: [
      { id: 'hyper_storm', description: "Thyroid storm (high fever, severe tachycardia, delirium, agitation, confusion)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hyper_arrhythmia', description: "Severe arrhythmias", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E05.90",
    prevalenceScore: 5,
    triagePriority: 3
  },
  {
    id: "cushings_syndrome",
    name: "Cushing's Syndrome",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine",
    redFlags: [],
    description: "A condition that occurs from exposure to high cortisol levels for a long time.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "skin_lesion_changes", "msk_muscle_weakness"],
    redFlagsStructured: [
      { id: 'cush_htn', description: "Severe or resistant hypertension", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'cush_hypoK', description: "Severe hypokalemia", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'cush_psych', description: "Psychosis", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "E24.9",
    prevalenceScore: 2,
    triagePriority: 4
  },
  {
    id: "addisons_disease",
    name: "Addison's Disease",
    system: 'Endocrine',
    severity: 'Severe',
    category: "Endocrine",
    redFlags: [],
    description: "A disorder in which the adrenal glands don't produce enough hormones.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_weight_loss", "nausea", "abdominal_pain"],
    redFlagsStructured: [
      { id: 'add_crisis', description: "Adrenal crisis (severe hypotension, shock)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'add_pain', description: "Severe abdominal pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'add_weakness', description: "Profound weakness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E27.1",
    prevalenceScore: 2,
    triagePriority: 2
  },

  // Renal / Urologic
  {
    id: "kidney_stones",
    name: "Kidney Stones (Nephrolithiasis)",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "A small, hard deposit that forms in the kidneys and is often painful when passed.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["flank_pain", "hematuria", "nausea", "vomiting", "painful_urination"],
    redFlagsStructured: [
      { id: 'ks_infection', description: "Fever and chills (infection with obstruction)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ks_retention', description: "Inability to pass urine", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'ks_pain', description: "Intractable pain", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "N20.0",
    prevalenceScore: 7,
    triagePriority: 2
  },
  {
    id: "pyelonephritis",
    name: "Pyelonephritis (Kidney Infection)",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "Inflammation of the kidney due to a bacterial infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["flank_pain", "gen_fever", "painful_urination", "nausea", "vomiting"],
    redFlagsStructured: [
      { id: 'pyelo_sepsis', description: "Signs of sepsis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pyelo_fluids', description: "Inability to tolerate oral fluids", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'pyelo_preg', description: "Pregnancy", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "N15.9",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "bph",
    name: "Benign Prostatic Hyperplasia (BPH)",
    system: 'Reproductive',
    severity: 'Mild',
    category: "Urologic",
    redFlags: [],
    description: "Age-associated prostate gland enlargement that can cause urination difficulty.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["urinary_urgency", "nycturia", "hesitancy"],
    redFlagsStructured: [
      { id: 'bph_retention', description: "Acute urinary retention", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'bph_hematuria', description: "Gross hematuria", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'bph_renal', description: "Renal failure signs", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N40.1",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "ckd",
    name: "Chronic Kidney Disease",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "Longstanding disease of the kidneys leading to renal failure.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "leg_swelling_heart", "nausea", "urinary_urgency"],
    redFlagsStructured: [
      { id: 'ckd_fluid', description: "Severe fluid overload", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ckd_enceph', description: "Uremic encephalopathy", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ckd_hyperK', description: "Severe hyperkalemia", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N18.9",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (UTI)",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "An infection in any part of your urinary system — your kidneys, ureters, bladder and urethra.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["painful_urination", "frequency_urination", "burning_urination", "abdominal_pain", "gen_fever", "gen_fatigue", "urinary_urgency"],
    redFlagsStructured: [
      { id: 'uti_flank', description: "Flank pain or high fever (risk of pyelonephritis)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'uti_fever', description: "High fever", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'uti_confusion', description: "Confusion or altered mental status in elderly", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'uti_elderly_ams', description: "Altered mental status in elderly", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "N39.0",
    prevalenceScore: 10,
    triagePriority: 4
  },

  // EENT (Eye, Ear, Nose, Throat)
  {
    id: "glaucoma",
    name: "Glaucoma",
    system: 'EENT',
    severity: 'Severe',
    category: "EENT",
    redFlags: [],
    description: "A group of eye conditions that can cause blindness.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["eye_pain", "vision_blurring", "headache_migraine", "nausea"],
    redFlagsStructured: [
      { id: 'glauc_pain', description: "Sudden severe eye pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'glauc_halos', description: "Halos around lights", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'glauc_vision', description: "Rapid vision loss", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "H40.9",
    prevalenceScore: 5,
    triagePriority: 2
  },
  {
    id: "conjunctivitis",
    name: "Conjunctivitis (Pink Eye)",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "Inflammation or infection of the outer membrane of the eyeball and the inner eyelid.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["eye_redness", "eye_discharge", "eye_itching"],
    redFlagsStructured: [
      { id: 'conj_pain', description: "Severe eye pain", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'conj_vision', description: "Decreased vision", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'conj_photo', description: "Photophobia", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "H10.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "cataracts",
    name: "Cataracts",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "Clouding of the normally clear lens of the eye.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["vision_blurring"],
    redFlagsStructured: [
      { id: 'cat_sudden', description: "Sudden vision loss", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'cat_pain', description: "Painful eye", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "H26.9",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "macular_degeneration",
    name: "Macular Degeneration",
    system: 'EENT',
    severity: 'Moderate',
    category: "EENT",
    redFlags: [],
    description: "An eye disease that causes vision loss, typically in the center of the field of vision.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["vision_blurring"],
    redFlagsStructured: [
      { id: 'md_distort', description: "Sudden distortion of vision", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'md_central', description: "Rapid central vision loss", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "H35.30",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "menieres_disease",
    name: "Meniere's Disease",
    system: 'EENT',
    severity: 'Moderate',
    category: "EENT",
    redFlags: [],
    description: "An inner ear disorder that causes episodes of vertigo.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["vertigo", "tinnitus", "hearing_loss_gradual", "nausea"],
    redFlagsStructured: [
      { id: 'men_hearing', description: "Sudden profound hearing loss", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'men_neuro', description: "Neurological deficits", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "H81.09",
    prevalenceScore: 4,
    triagePriority: 4
  },
  {
    id: "bppv",
    name: "Benign Paroxysmal Positional Vertigo (BPPV)",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "Episodes of dizziness and a sensation of spinning with certain head movements.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["vertigo", "nausea", "vomiting"],
    redFlagsStructured: [
      { id: 'bppv_continuous', description: "Continuous vertigo", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'bppv_hearing', description: "Associated hearing loss", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'bppv_neuro', description: "Neurological signs", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "H81.10",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "allergic_rhinitis",
    name: "Allergic Rhinitis",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "An allergic response causing itchy, watery eyes, sneezing, and other similar symptoms.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["cough_dry", "sore_throat", "eye_redness", "frequent_throat_clearing"],
    redFlagsStructured: [
      { id: 'ar_unilateral', description: "Unilateral nasal discharge", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'ar_pain', description: "Severe facial pain", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'ar_epistaxis', description: "Epistaxis", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "J30.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "laryngitis",
    name: "Laryngitis",
    system: 'EENT',
    severity: 'Mild',
    category: "EENT",
    redFlags: [],
    description: "An inflammation of the voice box from overuse, irritation, or infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["throat_hoarseness", "sore_throat", "cough_dry"],
    redFlagsStructured: [
      { id: 'laryn_stridor', description: "Stridor", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'laryn_breath', description: "Difficulty breathing", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'laryn_drool', description: "Drooling", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J04.0",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "strep_throat",
    name: "Streptococcal Pharyngitis (Strep Throat)",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "Bacterial infection of the throat caused by Group A Streptococcus.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["sore_throat", "gen_fever", "swollen_neck_glands"],
    redFlagsStructured: [
      { id: 'strep_swallow', description: "Difficulty swallowing", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'strep_drool', description: "Drooling", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'strep_voice', description: "Muffled voice", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J02.0",
    prevalenceScore: 8,
    triagePriority: 4
  },
  {
    id: "viral_pharyngitis",
    name: "Viral Pharyngitis",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "Inflammation of the pharynx caused by a viral infection (e.g., common cold).",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["sore_throat", "cough_dry", "gen_fever"],
    redFlagsStructured: [
      { id: 'vp_swallow', description: "Severe difficulty swallowing", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'vp_breath', description: "Difficulty breathing", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J02.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "acute_otitis_media",
    name: "Acute Otitis Media",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "Infection of the middle ear, common in children, often following a viral upper respiratory infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["ear_pain", "gen_fever", "ear_discharge_fluid"],
    redFlagsStructured: [
      { id: 'aom_mastoid', description: "Mastoid tenderness", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'aom_palsy', description: "Facial nerve palsy", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'aom_neck', description: "Stiff neck", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "H66.90",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "sinusitis",
    name: "Acute Sinusitis",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "Inflammation or infection of the sinuses, often following a cold.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_sinus", "gen_fever", "cough_productive", "facial_pain"],
    redFlagsStructured: [
      { id: 'sinus_vision', description: "Vision changes", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sinus_headache', description: "Severe headache", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'sinus_orbit', description: "Periorbital swelling", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "J01.90",
    prevalenceScore: 8,
    triagePriority: 5
  },

  // Dermatological
  {
    id: "eczema",
    name: "Eczema (Atopic Dermatitis)",
    system: 'Dermatological',
    severity: 'Mild',
    category: "Dermatological",
    redFlags: [],
    description: "An itchy inflammation of the skin.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_itching", "skin_rash", "skin_redness"],
    redFlagsStructured: [
      { id: 'ecz_infection', description: "Signs of secondary infection (pus, crusting)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'ecz_herpeticum', description: "Eczema herpeticum", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "L20.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    system: 'Dermatological',
    severity: 'Moderate',
    category: "Dermatological",
    redFlags: [],
    description: "A condition in which skin cells build up and form scales and itchy, dry patches.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "skin_lesion_changes", "msk_joint_pain"],
    redFlagsStructured: [
      { id: 'pso_erythro', description: "Erythrodermic psoriasis (widespread redness)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pso_pustular', description: "Pustular psoriasis", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "L40.9",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "contact_dermatitis",
    name: "Contact Dermatitis",
    system: 'Dermatological',
    severity: 'Mild',
    category: "Dermatological",
    redFlags: [],
    description: "A skin rash caused by contact with a certain substance.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "skin_itching", "skin_redness"],
    redFlagsStructured: [
      { id: 'cd_airway', description: "Facial or airway swelling", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cd_blisters', description: "Extensive blistering", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'cd_infection', description: "Signs of infection", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "L23.9",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "melanoma",
    name: "Melanoma",
    system: 'Oncology',
    severity: 'Severe',
    category: "Oncology",
    redFlags: [],
    description: "The most serious type of skin cancer.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_lesion_changes"],
    redFlagsStructured: [
      { id: 'mel_abcde', description: "Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'mel_bleeding', description: "Bleeding mole", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "C43.9",
    prevalenceScore: 4,
    triagePriority: 3
  },
  {
    id: "ringworm",
    name: "Ringworm (Tinea Corporis)",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "A highly contagious, fungal infection of the skin or scalp.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "skin_itching", "skin_lesion_changes"],
    redFlagsStructured: [
      { id: 'rw_extensive', description: "Extensive involvement", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'rw_failure', description: "Failure to respond to topical treatment", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "B35.4",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "scabies",
    name: "Scabies",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "A contagious, intensely itchy skin condition caused by a tiny, burrowing mite.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_itching", "skin_rash"],
    redFlagsStructured: [
      { id: 'scab_crusted', description: "Crusted (Norwegian) scabies", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'scab_infection', description: "Secondary bacterial infection", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "B86",
    prevalenceScore: 6,
    triagePriority: 5
  },
  {
    id: "shingles",
    name: "Shingles (Herpes Zoster)",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "A reactivation of the chickenpox virus in the body, causing a painful rash.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "neuropathic_pain", "skin_itching", "gen_fever"],
    redFlagsStructured: [
      { id: 'shing_eye', description: "Involvement of the eye (Herpes Zoster Ophthalmicus)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'shing_diss', description: "Disseminated rash", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "B02.9",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "cellulitis",
    name: "Cellulitis",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "Bacterial skin infection causing redness, swelling, and warmth.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_redness", "gen_fever", "skin_warmth", "skin_swelling", "skin_lesion_changes"],
    redFlagsStructured: [
      { id: 'cell_spread', description: "Rapidly spreading redness (tracking)", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'cell_pain', description: "Severe pain", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'cell_toxin', description: "Signs of systemic toxicity", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cel_blister', description: "Blistering or dusky skin (risk of necrotizing fasciitis)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "L03.90",
    prevalenceScore: 8,
    triagePriority: 3
  },

  // Infectious (Additional)
  {
    id: "mononucleosis",
    name: "Infectious Mononucleosis",
    system: 'Infectious',
    severity: 'Mild',
    category: "Infectious",
    redFlags: [],
    description: "Often called mono or kissing disease, an infection with the Epstein-Barr virus.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "sore_throat", "gen_fatigue", "swollen_neck_glands"],
    redFlagsStructured: [
      { id: 'mono_spleen', description: "Severe abdominal pain (splenic rupture)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mono_airway', description: "Airway obstruction from tonsils", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "B27.90",
    prevalenceScore: 7,
    triagePriority: 4
  },
  {
    id: "meningitis",
    name: "Meningitis",
    system: 'Infectious',
    severity: 'Critical',
    category: "Infectious",
    redFlags: [],
    description: "Inflammation of brain and spinal cord membranes, typically caused by an infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_migraine", "gen_fever", "nausea", "vomiting", "neck_pain_stiffness"],
    redFlagsStructured: [
      { id: 'men_ams', description: "Altered mental status or lethargy", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_rash', description: "Petechial or purpuric rash (Meningococcal sign)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_seizure', description: "Seizures", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_focal', description: "Focal neurological deficits", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'men_nuchal', description: "Nuchal rigidity (stiff neck)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G03.9",
    prevalenceScore: 5,
    triagePriority: 1
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
    commonSymptoms: ["skin_rash", "gen_fever", "gen_fatigue", "msk_joint_pain", "headache_tension"],
    redFlagsStructured: [
      { id: 'lyme_heart', description: "Heart block (Lyme carditis)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'lyme_neuro', description: "Facial palsy", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'lyme_men', description: "Meningitis symptoms", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A69.20",
    prevalenceScore: 7,
    triagePriority: 3
  },
  {
    id: "sepsis",
    name: "Sepsis",
    system: 'Infectious',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "A life-threatening complication of an infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "tachypnea", "palpitations", "neuro_memory_loss", "lungs_shortness_of_breath"],
    redFlagsStructured: [
      { id: 'sep_hypo', description: "Hypotension", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sep_ams', description: "Altered mental status", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sep_lac', description: "Lactate elevation", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sep_oli', description: "Oliguria", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A41.9",
    prevalenceScore: 8,
    triagePriority: 1
  },
  {
    id: "malaria",
    name: "Malaria",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "A disease caused by a plasmodium parasite, transmitted by the bite of infected mosquitoes.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_night_sweats", "gen_fatigue", "headache_tension", "nausea"],
    redFlagsStructured: [
      { id: 'mal_cereb', description: "Altered consciousness (cerebral malaria)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mal_anemia', description: "Severe anemia", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mal_resp', description: "Respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "B54",
    prevalenceScore: 4,
    triagePriority: 2
  },
  {
    id: "hiv_acute",
    name: "Acute HIV Infection",
    system: 'Infectious',
    severity: 'Moderate',
    category: "Infectious",
    redFlags: [],
    description: "The earliest stage of HIV infection, often presenting with flu-like symptoms.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "sore_throat", "gen_fatigue", "skin_rash", "swollen_neck_glands"],
    redFlagsStructured: [
      { id: 'hiv_oi', description: "Opportunistic infections", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'hiv_neuro', description: "Severe neurological symptoms", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "B20",
    prevalenceScore: 5,
    triagePriority: 3
  },

  // Psychiatric / Systemic / Other / Emergency
  {
    id: "generalized_anxiety",
    name: "Generalized Anxiety Disorder (GAD)",
    system: 'Psychiatry',
    severity: 'Moderate',
    category: "Psychiatric",
    redFlags: [],
    description: "The disorder is characterized by excessive, exaggerated anxiety and worry about everyday life events with no obvious reasons for worry.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["palpitations", "gen_fatigue", "headache_tension", "nausea", "msk_muscle_stiffness"],
    redFlagsStructured: [
      { id: 'gad_suicide', description: "Suicidal ideation or plan", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'gad_impair', description: "Severe impairment in daily functioning", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'gad_panic', description: "Severe panic attacks mimicking physical emergencies", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "F41.1",
    prevalenceScore: 9,
    triagePriority: 4
  },
  {
    id: "panic_attack",
    name: "Panic Attack",
    system: 'Psychiatry',
    severity: 'Severe',
    category: "Psychiatric",
    redFlags: [],
    description: "Sudden episode of intense fear or anxiety and physical symptoms, based on a perceived threat rather than imminent danger.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["palpitations", "lungs_shortness_of_breath", "heart_chest_pain", "head_dizziness_vertigo", "neuro_tremor"],
    redFlagsStructured: [
      { id: 'pa_cardiac', description: "Inability to rule out myocardial infarction", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pa_pe', description: "Inability to rule out pulmonary embolism", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "F41.0",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "major_depression",
    name: "Major Depressive Disorder (MDD)",
    system: 'Psychiatry',
    severity: 'Severe',
    category: "Psychiatric",
    redFlags: [],
    description: "A mental health disorder characterized by persistently depressed mood or loss of interest in activities, causing significant impairment in daily life.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "loss_of_appetite", "gen_weight_loss", "neuro_memory_loss", "sleep_disturbance"],
    redFlagsStructured: [
      { id: 'mdd_suicide', description: "Active suicidal ideation with plan or intent", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mdd_psychosis', description: "Psychotic features (hallucinations or delusions)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mdd_selfcare', description: "Inability to care for basic needs", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'mdd_self_harm', description: "Self-harming behaviors", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "F32.9",
    prevalenceScore: 10,
    triagePriority: 3
  },
  {
    id: "anemia",
    name: "Anemia",
    system: 'Hematology',
    severity: 'Moderate',
    category: "Hematologic",
    redFlags: [],
    description: "A condition in which the blood doesn't have enough healthy red blood cells.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "lungs_shortness_of_breath", "palpitations", "head_dizziness_vertigo"],
    redFlagsStructured: [
      { id: 'ane_sob', description: "Severe shortness of breath at rest", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ane_cp', description: "Ischemic chest pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ane_syncope', description: "Syncope", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ane_bleed', description: "Active, uncontrolled bleeding", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "D64.9",
    prevalenceScore: 6,
    triagePriority: 3
  },
  {
    id: "endometriosis",
    name: "Endometriosis",
    system: 'Reproductive',
    severity: 'Moderate',
    category: "Gynecological",
    redFlags: [],
    description: "A disorder in which tissue that normally lines the uterus grows outside the uterus.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "back_pain_lower", "painful_urination", "diarrhea"],
    redFlagsStructured: [
      { id: 'endo_acute', description: "Severe acute pelvic pain (rule out ectopic or torsion)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'endo_bowel', description: "Severe bowel or urinary obstruction symptoms", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "N80.9",
    prevalenceScore: 5,
    triagePriority: 4
  },
  {
    id: "pcos",
    name: "Polycystic Ovary Syndrome (PCOS)",
    system: 'Endocrine',
    severity: 'Mild',
    category: "Endocrine",
    redFlags: [],
    description: "A hormonal disorder causing enlarged ovaries with small cysts on the outer edges.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "skin_lesion_changes"],
    redFlagsStructured: [
      { id: 'pcos_bleed', description: "Severe, unremitting irregular bleeding", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pcos_hyper', description: "Signs of endometrial hyperplasia/malignancy", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "E28.2",
    prevalenceScore: 6,
    triagePriority: 5
  },
  {
    id: "dvt",
    name: "Deep Vein Thrombosis (DVT)",
    system: 'Cardiovascular',
    severity: 'Severe',
    category: "Vascular",
    redFlags: [],
    description: "Blood clot in a deep vein, usually in the legs.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_leg_swelling_pain"],
    redFlagsStructured: [
      { id: 'dvt_pe_sob', description: "Shortness of breath (suspicion of PE)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'dvt_pe_cp', description: "Chest pain (suspicion of PE)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'dvt_phlegmasia', description: "Severe leg pain with cyanosis (Phlegmasia cerulea dolens)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I82.40",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "anaphylaxis",
    name: "Anaphylaxis",
    system: 'Respiratory', // Often presents with airway compromise
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "Severe, potentially life-threatening allergic reaction.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["lungs_shortness_of_breath", "wheezing", "throat_itching", "hives_urticaria"],
    redFlagsStructured: [
      { id: 'ana_hypo', description: "Hypotension / Shock", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ana_airway', description: "Swelling of tongue/throat or stridor", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ana_loc', description: "Loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "T78.2",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "sle",
    name: "Systemic Lupus Erythematosus (SLE)",
    system: 'Musculoskeletal', // Systemic, but often placed here or Rheumatology
    severity: 'Severe',
    category: "Autoimmune",
    redFlags: [],
    description: "A chronic autoimmune disease that can affect many parts of the body.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "msk_joint_pain", "gen_fever", "gen_fatigue", "chest_tightness"],
    redFlagsStructured: [
      { id: 'sle_renal', description: "Lupus nephritis (signs of acute renal failure)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sle_cns', description: "CNS lupus (seizures, severe psychosis)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sle_pericarditis', description: "Severe pleuritis/pericarditis with effusion", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M32.9",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "sjogrens",
    name: "Sjogren's Syndrome",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Autoimmune",
    redFlags: [],
    description: "An immune system disorder characterized by dry eyes and a dry mouth.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["eye_itching", "throat_itching", "gen_fatigue", "msk_joint_pain"],
    redFlagsStructured: [
      { id: 'sjo_corneal', description: "Severe corneal ulceration", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'sjo_lymph', description: "Rapidly enlarging lymph nodes (lymphoma risk)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'sjo_vasc', description: "Signs of systemic vasculitis", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "M35.00",
    diagnosticTests: ["Schirmer's test", "Anti-SSA/SSB antibodies", "Salivary gland biopsy"],
    firstLineTreatments: ["Artificial tears", "Pilocarpine", "Immunosuppressants"],
    prognosis: "Chronic; manageable with symptomatic relief.",
    prevalenceScore: 4,
    triagePriority: 4
  },
  {
    id: "dengue_fever",
    name: "Dengue Fever",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "A mosquito-borne viral infection causing severe flu-like symptoms.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "headache_migraine", "msk_joint_pain", "nausea", "skin_rash"],
    redFlagsStructured: [
      { id: 'den_dhf', description: "Dengue Hemorrhagic Fever (bleeding, petechiae, low platelets)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'den_abd', description: "Severe abdominal pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'den_vomit', description: "Persistent vomiting", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'den_dss', description: "Dengue Shock Syndrome (hypotension)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "A90",
    prevalenceScore: 5,
    triagePriority: 2
  },
  {
    id: "sickle_cell_anemia",
    name: "Sickle Cell Anemia",
    system: 'Hematology',
    severity: 'Severe',
    category: "Hematologic",
    redFlags: [],
    description: "An inherited group of disorders that cause red blood cells to become misshapen and break down.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_bone_pain", "gen_fatigue", "jaundice", "lungs_shortness_of_breath"],
    redFlagsStructured: [
      { id: 'sca_crisis', description: "Severe vaso-occlusive pain crisis", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sca_chest', description: "Acute chest syndrome (fever, chest pain, infiltrates)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sca_stroke', description: "Stroke symptoms (focal neurological deficits)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sca_priapism', description: "Priapism lasting > 4 hours", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "D57.1",
    diagnosticTests: ["Hemoglobin electrophoresis", "CBC"],
    firstLineTreatments: ["Hydration", "Analgesics", "Hydroxyurea"],
    prognosis: "Chronic, lifelong; variable severity based on genotype and management.",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "stroke_ischemic",
    name: "Ischemic Stroke",
    system: 'Neurological',
    severity: 'Critical',
    category: "Neurological",
    redFlags: [],
    description: "Blocked blood supply to the brain causing tissue death.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_speech_difficulty", "msk_muscle_weakness", "vision_blurring", "head_dizziness_vertigo"],
    redFlagsStructured: [
      { id: 'cva_face', description: "Sudden face drooping", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cva_arm', description: "Sudden arm/leg weakness or numbness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'cva_speech', description: "Sudden slurred speech or aphasia", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I63.9",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "stroke_hemorrhagic",
    name: "Hemorrhagic Stroke",
    system: 'Neurological',
    severity: 'Critical',
    category: "Neurological",
    redFlags: [],
    description: "Bleeding in the brain causing pressure and tissue damage.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_migraine", "neuro_speech_difficulty", "nausea", "vomiting"],
    redFlagsStructured: [
      { id: 'sah_thunderclap', description: "Sudden 'thunderclap' severe headache ('worst of life')", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ich_loc', description: "Rapid loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ich_neuro', description: "Rapidly worsening focal neurological deficit", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I61.9",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "subdural_hematoma",
    name: "Subdural Hematoma",
    system: 'Neurological',
    severity: 'Severe',
    category: "Neurological",
    redFlags: [],
    description: "Bleeding between brain surface and dura mater, often post-trauma.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_migraine", "head_dizziness_vertigo", "neuro_memory_loss", "neuro_coordination"],
    redFlagsStructured: [
      { id: 'sdh_loc', description: "Fluctuating or progressive decline in consciousness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sdh_focal', description: "New focal neurological deficit (weakness, speech)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I62.00",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "myasthenia_gravis",
    name: "Myasthenia Gravis",
    system: 'Neurological',
    severity: 'Moderate',
    category: "Neurological",
    redFlags: [],
    description: "An autoimmune neuromuscular disorder characterized by weakness and rapid fatigue of voluntary muscles.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_muscle_weakness", "vision_blurring", "neuro_speech_difficulty", "throat_hoarseness"],
    redFlagsStructured: [
      { id: 'mg_crisis', description: "Myasthenic crisis (respiratory failure requiring ventilation)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'mg_dysphagia', description: "Severe difficulty swallowing (aspiration risk)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "G70.00",
    diagnosticTests: ["AChR antibody test", "Electromyography (EMG)", "Ice pack test"],
    firstLineTreatments: ["Pyridostigmine", "Immunosuppressants", "Thymectomy"],
    prognosis: "Chronic, but managed well with medication and procedures.",
    prevalenceScore: 2,
    triagePriority: 3
  },
  {
    id: "guillain_barre",
    name: "Guillain-Barré Syndrome (GBS)",
    system: 'Neurological',
    severity: 'Critical',
    category: "Neurological",
    redFlags: [],
    description: "An acute autoimmune inflammatory polyradiculoneuropathy often triggered by an infection.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_muscle_weakness", "neuro_numbness", "neuro_coordination"],
    redFlagsStructured: [
      { id: 'gbs_ascend', description: "Rapidly ascending paralysis (feet to trunk)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'gbs_respiratory', description: "Respiratory distress or difficulty breathing", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'gbs_autonomic', description: "Autonomic instability (blood pressure/heart rate swings)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "G61.0",
    prevalenceScore: 1,
    triagePriority: 1
  },

  {
    id: "bipolar_disorder",
    name: "Bipolar Disorder",
    system: 'Psychiatry',
    severity: 'Moderate',
    category: "Psychiatric",
    redFlags: [],
    description: "A mental health condition that causes extreme mood swings that include emotional highs (mania or hypomania) and lows (depression).",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "neuro_memory_loss", "palpitations"],
    redFlagsStructured: [
      { id: 'bp_mania', description: "Severe mania with psychosis or risk of harm", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'bp_suicide', description: "Suicidal ideation or intent during depressive phase", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'bp_risk', description: "Extreme risk-taking behavior with life-altering impact", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "F31.9",
    diagnosticTests: ["Psychiatric evaluation", "Mood tracking"],
    firstLineTreatments: ["Mood stabilizers", "Antipsychotics", "Psychotherapy"],
    prognosis: "Chronic; requires lifelong management to prevent relapse.",
    prevalenceScore: 4,
    triagePriority: 3
  },
  {
    id: "ptsd",
    name: "Post-Traumatic Stress Disorder (PTSD)",
    system: 'Psychiatry',
    severity: 'Moderate',
    category: "Psychiatric",
    redFlags: [],
    description: "A mental health condition triggered by witnessing or experiencing a terrifying event.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["palpitations", "gen_fatigue", "headache_tension", "neuro_memory_loss"],
    redFlagsStructured: [
      { id: 'ptsd_flash', description: "Severe disabling flashbacks or dissociation", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'ptsd_suicide', description: "Suicidal ideation or self-harm intent", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ptsd_violence', description: "Ideas of violence toward others", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "F43.10",
    prevalenceScore: 5,
    triagePriority: 4
  },
  {
    id: "ectopic_pregnancy",
    name: "Ectopic Pregnancy",
    system: 'Reproductive',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "A pregnancy in which the fertilized egg implants outside the uterus, most commonly in the fallopian tube.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "blood_in_stool", "head_dizziness_vertigo"],
    redFlagsStructured: [
      { id: 'ep_acute_pain', description: "Severe, sudden acute abdominal or pelvic pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ep_shock', description: "Signs of hemorrhagic shock (low BP, high HR, cold/clammy skin)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ep_shoulder', description: "Shoulder tip pain (sign of intra-abdominal bleeding)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "O00.9",
    diagnosticTests: ["Serum beta-hCG", "Transvaginal ultrasound"],
    firstLineTreatments: ["Methotrexate", "Laparoscopic salpingectomy"],
    prognosis: "Potentially life-threatening, but excellent recovery if treated early.",
    triagePriority: 1,
    prevalenceScore: 3
  },
  {
    id: "ovarian_torsion",
    name: "Ovarian Torsion",
    system: 'Reproductive',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "Twisting of the ovary on its supporting ligaments, compromising blood supply.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting"],
    redFlagsStructured: [
      { id: 'ot_sudden_pain', description: "Sudden, severe pelvic or adnexal pain", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ot_mass', description: "Palpable adnexal mass with acute pain", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N83.51",
    diagnosticTests: ["Pelvic ultrasound (doppler)", "CT scan"],
    firstLineTreatments: ["Laparoscopic detorsion", "Oophorectomy (if necrotic)"],
    prognosis: "Favorable if caught early before tissue necrosis.",
    triagePriority: 1,
    prevalenceScore: 2
  },
  {
    id: "testicular_torsion",
    name: "Testicular Torsion",
    system: 'Reproductive',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "Twisting of the spermatic cord, cutting off the blood supply to the testicle.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting"],
    redFlagsStructured: [
      { id: 'tt_pain', description: "Sudden, severe scrotal pain (often awakening from sleep)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'tt_high', description: "High-riding or horizontally oriented testicle", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'tt_cremaster', description: "Absent cremasteric reflex", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N44.00",
    diagnosticTests: ["Scrotal doppler ultrasound", "Clinical examination"],
    firstLineTreatments: ["Manual detorsion", "Emergency surgical orchiopexy"],
    prognosis: "Time-critical; high salvage rate if treated within 6 hours.",
    triagePriority: 1,
    prevalenceScore: 2
  },
  {
    id: "hypertension",
    name: "Essential Hypertension",
    system: 'Cardiovascular',
    severity: 'Moderate',
    category: "Cardiovascular",
    redFlags: [],
    description: "Elevated blood pressure without a clearly identifiable secondary cause.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_tension", "head_dizziness_vertigo", "vision_blurring"],
    redFlagsStructured: [
      { id: 'htn_emergency', description: "Hypertensive crisis / emergency (BP >180/120 with end-organ symptoms)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'htn_neuro', description: "New onset confusion or neurological deficits", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "I10",
    diagnosticTests: ["Blood pressure monitoring", "Renal function tests", "Lipid panel"],
    firstLineTreatments: ["ACE inhibitors", "Calcium channel blockers", "Diuretics"],
    prognosis: "Manageable with lifelong lifestyle and medication adherence.",
    prevalenceScore: 10,
    triagePriority: 5
  },
  {
    id: "hyperlipidemia",
    name: "Hyperlipidemia",
    system: 'Endocrine',
    severity: 'Mild',
    category: "Metabolic",
    redFlags: [],
    description: "High levels of lipids (fats) in the blood, increasing risk of cardiovascular disease.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue"],
    redFlagsStructured: [
      { id: 'hl_xanthoma', description: "Xanthomas (fatty deposits under skin)", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'hl_premature_cvd', description: "Early onset cardiovascular disease history", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "E78.5",
    prevalenceScore: 9,
    triagePriority: 5
  },
  { 
    id: "hypoglycemia", 
    name: "Hypoglycemia", 
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Metabolic", 
    redFlags: [],
    description: "Abnormally low blood sugar level, most common in diabetic patients on insulin or sulfonylureas.", 
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_tremor", "palpitations", "gen_fatigue", "head_dizziness_vertigo", "gen_thirst"], 
    redFlagsStructured: [
      { id: 'hypo_confusion', description: "Confusion or altered mental status", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hypo_seizure', description: "Seizures", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hypo_loc', description: "Loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E16.2", 
    diagnosticTests: ["Fingerstick glucose", "Plasma glucose"], 
    firstLineTreatments: ["Fast-acting carbohydrates", "IV Dextrose"], 
    prognosis: "Immediate resolution with glucose; long-term requires glycemic management.", 
    prevalenceScore: 7,
    triagePriority: 2
  },
  { 
    id: "type1_diabetes", 
    name: "Type 1 Diabetes", 
    system: 'Endocrine',
    severity: 'Severe',
    category: "Endocrine", 
    redFlags: [],
    description: "A chronic condition in which the pancreas produces little or no insulin.", 
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_thirst", "gen_fatigue", "abdominal_pain"], 
    redFlagsStructured: [
      { id: 't1d_dka', description: "Diabetic Ketoacidosis (nausea, vomiting, fruity breath, deep breathing)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E10.9",
    prevalenceScore: 4,
    triagePriority: 3
  },
  { 
    id: "type2_diabetes", 
    name: "Type 2 Diabetes", 
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine", 
    redFlags: [],
    description: "A chronic condition that affects the way the body processes blood sugar (glucose).", 
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_thirst", "gen_fatigue"], 
    redFlagsStructured: [
      { id: 't2d_hhs', description: "Hyperosmolar Hyperglycemic State (extreme dehydration, confusion)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E11.9",
    prevalenceScore: 10,
    triagePriority: 4
  },
  {
    id: "hyperparathyroidism",
    name: "Hyperparathyroidism",
    system: 'Endocrine',
    severity: 'Moderate',
    category: "Endocrine", 
    redFlags: [],
    description: "An excess of parathyroid hormone in the bloodstream due to overactivity of one or more parathyroid glands.", 
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_muscle_weakness", "gen_fatigue", "abdominal_pain"], 
    redFlagsStructured: [
      { id: 'hpth_calcemia', description: "Severe symptomatic hypercalcemia (stones, bones, groans, psychic overtones)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "E21.0",
    prevalenceScore: 3,
    triagePriority: 4
  },
  {
    id: "hyperkalemia",
    name: "Hyperkalemia",
    system: 'Endocrine',
    severity: 'Critical',
    category: "Metabolic",
    redFlags: [],
    description: "High potassium levels in the blood, which can lead to life-threatening cardiac arrhythmias.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["palpitations", "msk_muscle_weakness", "nausea", "neuro_numbness"],
    redFlagsStructured: [
      { id: 'hk_arrest', description: "Cardiac arrest or life-threatening arrhythmias", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'hk_paralysis', description: "Ascending muscle paralysis", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "E87.5",
    prevalenceScore: 5,
    triagePriority: 1
  },
  {
    id: "opioid_overdose",
    name: "Opioid Overdose",
    system: 'Psychiatry',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "Life-threatening condition caused by excessive opioid intake, leading to respiratory depression.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["lungs_shortness_of_breath", "gen_fatigue", "head_dizziness_vertigo"],
    redFlagsStructured: [
      { id: 'od_resp_dep', description: "Respiratory depression (RR < 12/min or shallow breathing)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'od_pinpoint', description: "Pinpoint pupils and unresponsiveness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'od_cyanosis', description: "Cyanosis (bluish skin/lips)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "T40.2X1A",
    prevalenceScore: 4,
    triagePriority: 1
  },
  {
    id: "alcohol_withdrawal",
    name: "Alcohol Withdrawal Syndrome",
    system: 'Psychiatry',
    severity: 'Severe',
    category: "Emergency",
    redFlags: [],
    description: "Symptoms that occur when someone who has been drinking heavily suddenly stops or significantly reduces alcohol intake.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_tremor", "nausea", "vomiting", "palpitations", "gen_fever", "gen_sweating"],
    redFlagsStructured: [
      { id: 'aw_dt', description: "Delirium Tremens (severe confusion, hallucinations, agitation)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'aw_seizure', description: "Withdrawal seizures", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'aw_htn', description: "Severe hypertension and tachycardia", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "F10.239",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "carbon_monoxide_poisoning",
    name: "Carbon Monoxide Poisoning",
    system: 'Neurological',
    severity: 'Critical',
    category: "Emergency",
    redFlags: [],
    description: "Toxic condition caused by inhaling carbon monoxide gas, which binds to hemoglobin and prevents oxygen delivery to tissues.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["headache_tension", "head_dizziness_vertigo", "nausea", "gen_fatigue", "lungs_shortness_of_breath"],
    redFlagsStructured: [
      { id: 'co_confusion', description: "Confusion or altered consciousness", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'co_chest_pain', description: "Chest pain (cardiac ischemia)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'co_loc', description: "Loss of consciousness", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "T58.91XA",
    prevalenceScore: 3,
    triagePriority: 1
  },
  {
    id: "bacteremia",
    name: "Bacteremia",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "The presence of bacteria in the blood.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fever", "gen_night_sweats", "gen_fatigue", "palpitations"],
    redFlagsStructured: [
      { id: 'bac_sepsis', description: "Progression to sepsis (hypotension, confusion)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "R78.81",
    prevalenceScore: 5,
    triagePriority: 2
  },
  {
    id: "pneumonia_bacterial",
    name: "Bacterial Pneumonia",
    system: 'Infectious',
    severity: 'Severe',
    category: "Infectious",
    redFlags: [],
    description: "Infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["lungs_shortness_of_breath", "gen_fever", "cough_productive", "chest_pain"],
    redFlagsStructured: [
      { id: 'pne_hypoxia', description: "Signs of hypoxia (blue lips, confusion)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'pne_resp_failure', description: "Severe respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "J15.9",
    prevalenceScore: 7,
    triagePriority: 2
  },
  {
    id: "anemia_iron_def",
    name: "Iron Deficiency Anemia",
    system: 'Hematology',
    severity: 'Mild',
    category: "Hematology",
    redFlags: [],
    description: "A condition in which blood lacks adequate healthy red blood cells due to insufficient iron.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "lungs_shortness_of_breath", "head_dizziness_vertigo", "palpitations"],
    redFlagsStructured: [
      { id: 'ida_cv', description: "Severe tachycardia or chest pain (hemodynamic instability)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "D50.9",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "anemia_b12_def",
    name: "Vitamin B12 Deficiency Anemia",
    system: 'Hematology',
    severity: 'Moderate',
    category: "Hematology",
    redFlags: [],
    description: "A condition in which your body does not have enough healthy red blood cells because it lacks vitamin B12.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "neuro_numbness", "neuro_coordination", "gen_sore_tongue"],
    redFlagsStructured: [
      { id: 'b12_neuro', description: "Rapid progression of neurological deficits", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "D51.9",
    prevalenceScore: 6,
    triagePriority: 5
  },
  {
    id: "hemolytic_anemia",
    name: "Hemolytic Anemia",
    system: 'Hematology',
    severity: 'Severe',
    category: "Hematology",
    redFlags: [],
    description: "A disorder in which red blood cells are destroyed faster than they can be made.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_jaundice", "abdominal_pain", "gen_dark_urine"],
    redFlagsStructured: [
      { id: 'ha_crisis', description: "Acute hemolytic crisis (severe abdominal/back pain, profound anemia)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'ha_aki', description: "Signs of acute kidney injury", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "D59.9",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "leukemia_all",
    name: "Acute Lymphoblastic Leukemia (ALL)",
    system: 'Oncology',
    severity: 'Critical',
    category: "Hematology",
    redFlags: [],
    description: "A type of cancer of the blood and bone marrow that affects white blood cells.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_fever", "gen_night_sweats", "skin_bruising", "swollen_neck_glands"],
    redFlagsStructured: [
      { id: 'all_bleeding', description: "Uncontrolled bleeding or severe bruising", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'all_infection', description: "Neutropenic fever", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C91.00",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "leukemia_aml",
    name: "Acute Myeloid Leukemia (AML)",
    system: 'Oncology',
    severity: 'Critical',
    category: "Hematology",
    redFlags: [],
    description: "A cancer of the blood and bone marrow with excess immature white blood cells.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "gen_fever", "gen_night_sweats", "skin_bruising"],
    redFlagsStructured: [
      { id: 'aml_leukostasis', description: "Signs of hyperviscosity/leukostasis (visual changes, confusion, dyspnea)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C92.00",
    prevalenceScore: 2,
    triagePriority: 1
  },
  {
    id: "hodgkin_lymphoma",
    name: "Hodgkin Lymphoma",
    system: 'Oncology',
    severity: 'Severe',
    category: "Hematology",
    redFlags: [],
    description: "Cancer of the part of the immune system called the lymphatic system.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["swollen_neck_glands", "gen_fever", "gen_night_sweats", "gen_weight_loss", "skin_itchy"],
    redFlagsStructured: [
      { id: 'hl_compression', description: "Superior Vena Cava Syndrome (facial swelling, dyspnea)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C81.90",
    prevalenceScore: 3,
    triagePriority: 2
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
    commonSymptoms: ["msk_bone_pain", "gen_fatigue", "nausea", "confusion"],
    redFlagsStructured: [
      { id: 'mm_fracture', description: "Pathological fracture", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'mm_cord', description: "Spinal cord compression (back pain + neuro deficits)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C90.00",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "breast_cancer",
    name: "Breast Cancer",
    system: 'Oncology',
    severity: 'Moderate',
    category: "Oncology",
    redFlags: [],
    description: "Cancer that forms in the cells of the breasts.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["skin_rash", "gen_fatigue", "swollen_neck_glands"],
    redFlagsStructured: [
      { id: 'bc_lump', description: "New hard fixed lump in the breast", triageAction: 'Consult', urgencyLevel: 3 },
      { id: 'bc_nipple', description: "Bloody nipple discharge", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "C50.919",
    prevalenceScore: 7,
    triagePriority: 5
  },
  {
    id: "colorectal_cancer",
    name: "Colorectal Cancer",
    system: 'Oncology',
    severity: 'Moderate',
    category: "Oncology",
    redFlags: [],
    description: "Cancer that begins in the colon or rectum.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["blood_in_stool", "abdominal_pain", "gen_fatigue", "gen_weight_loss"],
    redFlagsStructured: [
      { id: 'cc_obstruction', description: "Signs of bowel obstruction (vomiting, inability to pass gas/stool)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "C18.9",
    prevalenceScore: 6,
    triagePriority: 4
  },
  {
    id: "prostate_cancer",
    name: "Prostate Cancer",
    system: 'Oncology',
    severity: 'Moderate',
    category: "Oncology",
    redFlags: [],
    description: "Cancer in a man's prostate, a small walnut-sized gland that produces seminal fluid.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "frequency_urination", "blood_in_urine"],
    redFlagsStructured: [
      { id: 'pc_retention', description: "Acute urinary retention", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'pc_mets', description: "Severe bone pain suggesting metastasis", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "C61",
    prevalenceScore: 7,
    triagePriority: 5
  },
  {
    id: "schizophrenia",
    name: "Schizophrenia",
    system: 'Psychiatry',
    severity: 'Severe',
    category: "Psychiatry",
    redFlags: [],
    description: "A chronic and severe mental disorder that affects how a person thinks, feels, and behaves.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["neuro_memory_loss", "neuro_speech_difficulty", "social_withdrawal"],
    redFlagsStructured: [
      { id: 'sch_command', description: "Command hallucinations (voices telling user to harm self or others)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sch_agitation', description: "Severe acute agitation or violence", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'sch_catatonia', description: "Catatonic behavior", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "F20.9",
    prevalenceScore: 3,
    triagePriority: 2
  },
  {
    id: "eating_disorder_anorexia",
    name: "Anorexia Nervosa",
    system: 'Psychiatry',
    severity: 'Severe',
    category: "Psychiatry",
    redFlags: [],
    description: "An eating disorder characterized by an abnormally low body weight, an intense fear of gaining weight and a distorted perception of weight.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "head_dizziness_vertigo", "gen_thirst", "cold_intolerance"],
    redFlagsStructured: [
      { id: 'anox_cardiac', description: "Severe core body temperature regulation issues or arrhythmias", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'anox_electrolyte', description: "Signs of severe electrolyte imbalance (weakness, confusion)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "F50.00",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "sprain",
    name: "Sprain",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A stretching or tearing of ligaments — the tough bands of fibrous tissue that connect two bones together in your joints.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_swelling", "skin_bruising"],
    redFlagsStructured: [
      { id: 'spr_weight', description: "Inability to bear weight on the joint", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'spr_instability', description: "Significant joint instability", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "S93.409",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "strain",
    name: "Strain",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A stretching or tearing of muscle or tendon. A tendon is a fibrous cord of tissue that connects muscles to bones.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_muscle_pain", "msk_muscle_weakness", "msk_swelling"],
    redFlagsStructured: [
      { id: 'str_rupture', description: "Complete loss of muscle function (muscle/tendon rupture)", triageAction: 'Urgent', urgencyLevel: 3 },
      { id: 'str_gap', description: "Visible gap or deformity in muscle/tendon", triageAction: 'Consult', urgencyLevel: 3 }
    ],
    icd10: "M62.8",
    prevalenceScore: 9,
    triagePriority: 5
  },
  {
    id: "tendinitis",
    name: "Tendinitis",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "Inflammation or irritation of a tendon — the thick fibrous cords that attach muscle to bone.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_swelling"],
    redFlagsStructured: [
      { id: 'ten_rupture', description: "Sudden 'pop' followed by loss of function", triageAction: 'Urgent', urgencyLevel: 3 }
    ],
    icd10: "M75.9",
    prevalenceScore: 8,
    triagePriority: 5
  },
  {
    id: "bursitis",
    name: "Bursitis",
    system: 'Musculoskeletal',
    severity: 'Mild',
    category: "Musculoskeletal",
    redFlags: [],
    description: "A painful condition that affects the small, fluid-filled sacs — called bursae — that cushion the bones, tendons and muscles near your joints.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_joint_pain", "msk_swelling", "skin_redness"],
    redFlagsStructured: [
      { id: 'bur_infection', description: "Severe warmth, redness, and fever (septic bursitis)", triageAction: 'Urgent', urgencyLevel: 2 }
    ],
    icd10: "M71.9",
    prevalenceScore: 7,
    triagePriority: 5
  },
  {
    id: "ankylosing_spondylitis",
    name: "Ankylosing Spondylitis",
    system: 'Musculoskeletal',
    severity: 'Moderate',
    category: "Musculoskeletal",
    redFlags: [],
    description: "An inflammatory disease that, over time, can cause some of the small bones in your spine (vertebrae) to fuse.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["msk_back_pain", "msk_joint_stiffness", "gen_fatigue"],
    redFlagsStructured: [
      { id: 'as_uveitis', description: "Acute painful red eye (uveitis)", triageAction: 'Urgent', urgencyLevel: 2 },
      { id: 'as_neuro', description: "Sudden neurological deficits in the limbs", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "M45.9",
    prevalenceScore: 2,
    triagePriority: 4
  },
  {
    id: "acute_kidney",
    name: "Acute Kidney Injury (AKI)",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "Sudden episode of kidney failure or kidney damage that happens within a few hours or a few days.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["gen_fatigue", "nausea", "legs_swelling"],
    redFlagsStructured: [
      { id: 'aki_anuria', description: "Severe oliguria or anuria (little to no urine output)", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'aki_confusion', description: "Confusion or uremic encephalopathy", triageAction: 'Emergency', urgencyLevel: 2 },
      { id: 'aki_chest_pain', description: "Chest pain or pressure (pericarditis or fluid overload)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N17.9",
    prevalenceScore: 6,
    triagePriority: 2
  },
  {
    id: "end_stage_renal",
    name: "End-Stage Renal Disease (ESRD)",
    system: 'Renal',
    severity: 'Critical',
    category: "Renal",
    redFlags: [],
    description: "The final, permanent stage of chronic kidney disease where kidney function has declined to the point that the kidneys can no longer function on their own.",
    inheritsSymptomsFrom: ['ckd'],
    commonSymptoms: ["gen_fatigue", "lungs_shortness_of_breath", "nausea", "confusion"],
    redFlagsStructured: [
      { id: 'esrd_missed_dialysis', description: "Missed dialysis with respiratory distress", triageAction: 'Emergency', urgencyLevel: 1 },
      { id: 'esrd_access', description: "Bleeding or infection at dialysis access site", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "N18.6",
    prevalenceScore: 4,
    triagePriority: 2
  },
  {
    id: "nephrotic_syndrome",
    name: "Nephrotic Syndrome",
    system: 'Renal',
    severity: 'Moderate',
    category: "Renal",
    redFlags: [],
    description: "A kidney disorder that causes your body to pass too much protein in your urine.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["leg_swelling_heart", "gen_fatigue", "weight_gain"],
    redFlagsStructured: [
      { id: 'ns_thrombosis', description: "Signs of thromboembolism (sudden shortness of breath or leg pain)", triageAction: 'Emergency', urgencyLevel: 2 }
    ],
    icd10: "N04",
    prevalenceScore: 3,
    triagePriority: 4
  },
  {
    id: "nephritic_syndrome",
    name: "Nephritic Syndrome",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "A set of symptoms that occur with some disorders that cause swelling and inflammation of the glomeruli in the kidneys.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "blood_in_urine", "decreased_urine"],
    redFlagsStructured: [
      { id: 'nas_htn_crisis', description: "Hypertensive urgency or emergency", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N05",
    prevalenceScore: 2,
    triagePriority: 3
  },
  {
    id: "glomerulonephritis",
    name: "Glomerulonephritis",
    system: 'Renal',
    severity: 'Severe',
    category: "Renal",
    redFlags: [],
    description: "Inflammation of the tiny filters in your kidneys (glomeruli).",
    inheritsSymptomsFrom: ['nephritic_syndrome'],
    commonSymptoms: ["gen_fatigue", "blood_in_urine", "foamy_urine"],
    redFlagsStructured: [
      { id: 'gn_aki', description: "Rapid decline in urine output", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N00",
    prevalenceScore: 3,
    triagePriority: 3
  },
  {
    id: "hydronephrosis",
    name: "Hydronephrosis",
    system: 'Renal',
    severity: 'Moderate',
    category: "Renal",
    redFlags: [],
    description: "Swelling of a kidney due to a build-up of urine.",
    inheritsSymptomsFrom: [],
    commonSymptoms: ["abdominal_pain", "frequency_urination", "nausea"],
    redFlagsStructured: [
      { id: 'hyd_infection', description: "Fever and flank pain (infected hydronephrosis)", triageAction: 'Emergency', urgencyLevel: 1 }
    ],
    icd10: "N13.30",
    prevalenceScore: 4,
    triagePriority: 3
  },
];
