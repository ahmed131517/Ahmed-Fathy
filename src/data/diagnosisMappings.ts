export interface Diagnosis {
  id: string;
  name: string;
  category: string;
  description: string;
  commonSymptoms: string[];
  redFlags: string[];
  icd10?: string;
}

export const COMMON_DIAGNOSES: Diagnosis[] = [
  // Cardiovascular
  {
    id: "heart_failure",
    name: "Heart Failure",
    category: "Cardiovascular",
    description: "A chronic condition in which the heart doesn't pump blood as well as it should.",
    commonSymptoms: ["heart_shortness_of_breath_exertion", "leg_swelling_heart", "orthopnea", "gen_fatigue"],
    redFlags: ["Severe shortness of breath at rest", "Pink, frothy sputum", "Sudden weight gain"],
    icd10: "I50.9"
  },
  {
    id: "angina_pectoris",
    name: "Angina Pectoris",
    category: "Cardiovascular",
    description: "Chest pain or discomfort due to coronary heart disease.",
    commonSymptoms: ["heart_chest_pain", "chest_tightness", "heart_shortness_of_breath_exertion"],
    redFlags: ["Pain radiating to jaw or left arm", "Pain not relieved by rest", "Diaphoresis"],
    icd10: "I20.9"
  },
  {
    id: "atrial_fibrillation",
    name: "Atrial Fibrillation",
    category: "Cardiovascular",
    description: "An irregular, often rapid heart rate that commonly causes poor blood flow.",
    commonSymptoms: ["palpitations", "heart_shortness_of_breath_exertion", "gen_fatigue", "head_dizziness_vertigo"],
    redFlags: ["Severe chest pain", "Fainting (syncope)", "Signs of stroke (weakness, speech difficulty)"],
    icd10: "I48.91"
  },
  {
    id: "pericarditis",
    name: "Pericarditis",
    category: "Cardiovascular",
    description: "Swelling and irritation of the thin, saclike tissue surrounding the heart.",
    commonSymptoms: ["heart_chest_pain", "pleuritic_chest_pain", "gen_fever"],
    redFlags: ["Cardiac tamponade signs (hypotension, muffled heart sounds)", "Severe shortness of breath"],
    icd10: "I31.9"
  },
  {
    id: "peripheral_artery_disease",
    name: "Peripheral Artery Disease (PAD)",
    category: "Cardiovascular",
    description: "A circulatory condition in which narrowed blood vessels reduce blood flow to the limbs.",
    commonSymptoms: ["msk_leg_swelling_pain", "msk_muscle_cramps"],
    redFlags: ["Rest pain in legs", "Non-healing ulcers on feet", "Cold, pulseless limb"],
    icd10: "I73.9"
  },
  {
    id: "aortic_dissection",
    name: "Aortic Dissection",
    category: "Cardiovascular",
    description: "A serious condition in which the inner layer of the aorta tears.",
    commonSymptoms: ["heart_chest_pain", "back_pain_upper", "head_dizziness_vertigo"],
    redFlags: ["Sudden, severe tearing chest/back pain", "Pulse deficit", "Syncope"],
    icd10: "I71.00"
  },
  {
    id: "myocardial_infarction",
    name: "Myocardial Infarction (Heart Attack)",
    category: "Cardiovascular",
    description: "Sudden blockage of blood flow to the heart muscle, causing tissue damage.",
    commonSymptoms: ["heart_chest_pain", "lungs_shortness_of_breath", "nausea", "gen_fatigue", "chest_tightness"],
    redFlags: ["Crushing chest pain", "Radiation to jaw/left arm", "Diaphoresis"],
    icd10: "I21.9"
  },

  // Respiratory
  {
    id: "copd",
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    category: "Respiratory",
    description: "A group of lung diseases that block airflow and make it difficult to breathe.",
    commonSymptoms: ["lungs_shortness_of_breath", "cough_productive", "wheezing"],
    redFlags: ["Inability to speak in full sentences", "Cyanosis", "Altered mental status"],
    icd10: "J44.9"
  },
  {
    id: "covid_19",
    name: "COVID-19",
    category: "Infectious",
    description: "A highly contagious respiratory disease caused by the SARS-CoV-2 virus.",
    commonSymptoms: ["gen_fever", "cough_dry", "gen_fatigue", "lungs_shortness_of_breath", "sore_throat"],
    redFlags: ["Oxygen saturation < 92%", "Severe shortness of breath", "Confusion"],
    icd10: "U07.1"
  },
  {
    id: "tuberculosis",
    name: "Tuberculosis (TB)",
    category: "Infectious",
    description: "A potentially serious infectious bacterial disease that mainly affects the lungs.",
    commonSymptoms: ["cough_productive", "hemoptysis", "gen_night_sweats", "gen_weight_loss", "gen_fever"],
    redFlags: ["Massive hemoptysis", "Severe respiratory distress"],
    icd10: "A15.9"
  },
  {
    id: "pneumothorax",
    name: "Pneumothorax (Collapsed Lung)",
    category: "Respiratory",
    description: "Air leaks into the space between your lung and chest wall, pushing on the outside of your lung.",
    commonSymptoms: ["pleuritic_chest_pain", "lungs_shortness_of_breath", "tachypnea"],
    redFlags: ["Tracheal deviation", "Severe respiratory distress", "Hypotension"],
    icd10: "J93.9"
  },
  {
    id: "sleep_apnea",
    name: "Obstructive Sleep Apnea",
    category: "Respiratory",
    description: "A sleep disorder in which breathing repeatedly stops and starts.",
    commonSymptoms: ["sleep_apnea", "gen_fatigue", "headache_tension"],
    redFlags: ["Falling asleep while driving", "Severe daytime somnolence"],
    icd10: "G47.33"
  },
  {
    id: "lung_cancer",
    name: "Lung Cancer",
    category: "Oncology",
    description: "Cancer that begins in the lungs and most often occurs in people who smoke.",
    commonSymptoms: ["cough_dry", "hemoptysis", "gen_weight_loss", "lungs_shortness_of_breath"],
    redFlags: ["Unexplained significant weight loss", "Massive hemoptysis", "Superior vena cava syndrome"],
    icd10: "C34.90"
  },
  {
    id: "asthma_exacerbation",
    name: "Asthma Exacerbation",
    category: "Respiratory",
    description: "Acute worsening of asthma symptoms like shortness of breath and wheezing.",
    commonSymptoms: ["lungs_shortness_of_breath", "cough_dry", "wheezing"],
    redFlags: ["Difficulty speaking in full sentences", "Cyanosis", "Silent chest"],
    icd10: "J45.901"
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    category: "Infectious",
    description: "Infection that inflames the air sacs in one or both lungs, which may fill with fluid or pus.",
    commonSymptoms: ["cough_productive", "gen_fever", "lungs_shortness_of_breath", "gen_fatigue"],
    redFlags: ["Oxygen saturation < 92%", "Confusion", "Respiratory rate > 30"],
    icd10: "J18.9"
  },
  {
    id: "bronchitis",
    name: "Acute Bronchitis",
    category: "Respiratory",
    description: "Inflammation of the bronchial tubes, usually viral, causing a persistent cough.",
    commonSymptoms: ["cough_productive", "wheezing", "gen_fatigue"],
    redFlags: ["High fever", "Shortness of breath", "Bloody sputum"],
    icd10: "J20.9"
  },
  {
    id: "pulmonary_embolism",
    name: "Pulmonary Embolism (PE)",
    category: "Vascular",
    description: "A blood clot that travels to the lungs, often originating from a DVT.",
    commonSymptoms: ["lungs_shortness_of_breath", "pleuritic_chest_pain", "tachypnea"],
    redFlags: ["Sudden onset", "Hemoptysis", "Syncope", "Hypotension"],
    icd10: "I26.99"
  },
  {
    id: "influenza",
    name: "Influenza (Flu)",
    category: "Infectious",
    description: "Viral infection that attacks the respiratory system, characterized by sudden onset of systemic symptoms.",
    commonSymptoms: ["gen_fever", "cough_dry", "gen_fatigue", "sore_throat"],
    redFlags: ["Severe shortness of breath", "Chest pain", "Altered mental status"],
    icd10: "J11.1"
  },

  // Gastrointestinal
  {
    id: "gastroenteritis",
    name: "Gastroenteritis",
    category: "Digestive",
    description: "Intestinal infection marked by diarrhea, cramps, nausea, vomiting, and fever.",
    commonSymptoms: ["nausea", "vomiting", "diarrhea", "abdominal_pain", "gen_fever"],
    redFlags: ["Severe dehydration", "Inability to keep fluids down", "Bloody diarrhea"],
    icd10: "A09"
  },
  {
    id: "appendicitis",
    name: "Appendicitis",
    category: "Digestive",
    description: "Inflammation of the appendix, a medical emergency.",
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "gen_fever"],
    redFlags: ["Severe right lower quadrant pain", "Rebound tenderness", "Rigidity"],
    icd10: "K35.80"
  },
  {
    id: "peptic_ulcer_disease",
    name: "Peptic Ulcer Disease",
    category: "Digestive",
    description: "A sore that develops on the lining of the esophagus, stomach, or small intestine.",
    commonSymptoms: ["abdominal_pain", "nausea", "belching_hiccups", "blood_in_stool"],
    redFlags: ["Vomiting blood", "Black, tarry stools", "Sudden severe abdominal pain (perforation)"],
    icd10: "K27.9"
  },
  {
    id: "ibs",
    name: "Irritable Bowel Syndrome (IBS)",
    category: "Digestive",
    description: "A common disorder that affects the large intestine, causing cramps, pain, and changes in bowel habits.",
    commonSymptoms: ["abdominal_pain", "diarrhea", "constipation", "bloating_gas"],
    redFlags: ["Unexplained weight loss", "Rectal bleeding", "Onset after age 50"],
    icd10: "K58.9"
  },
  {
    id: "cholecystitis",
    name: "Cholecystitis / Gallstones",
    category: "Digestive",
    description: "Inflammation of the gallbladder, often caused by gallstones.",
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "jaundice"],
    redFlags: ["High fever with chills", "Severe right upper quadrant pain", "Jaundice"],
    icd10: "K81.9"
  },
  {
    id: "pancreatitis",
    name: "Acute Pancreatitis",
    category: "Digestive",
    description: "Inflammation of the pancreas, causing severe abdominal pain.",
    commonSymptoms: ["abdominal_pain", "nausea", "vomiting", "back_pain_upper"],
    redFlags: ["Severe, constant abdominal pain radiating to back", "Signs of shock"],
    icd10: "K85.90"
  },
  {
    id: "diverticulitis",
    name: "Diverticulitis",
    category: "Digestive",
    description: "Inflammation or infection in one or more small pouches in the digestive tract.",
    commonSymptoms: ["abdominal_pain", "gen_fever", "nausea", "diarrhea", "constipation"],
    redFlags: ["Severe left lower quadrant pain", "High fever", "Inability to tolerate oral fluids"],
    icd10: "K57.92"
  },
  {
    id: "ibd",
    name: "Inflammatory Bowel Disease (Crohn's/UC)",
    category: "Digestive",
    description: "Chronic inflammation of the digestive tract.",
    commonSymptoms: ["abdominal_pain", "diarrhea", "blood_in_stool", "gen_weight_loss", "gen_fatigue"],
    redFlags: ["Severe bloody diarrhea", "Significant weight loss", "Severe abdominal pain"],
    icd10: "K52.9"
  },
  {
    id: "hepatitis",
    name: "Hepatitis",
    category: "Digestive",
    description: "Inflammation of the liver, often caused by a viral infection.",
    commonSymptoms: ["jaundice", "gen_fatigue", "nausea", "abdominal_pain", "loss_of_appetite"],
    redFlags: ["Altered mental status (encephalopathy)", "Severe bleeding tendency", "Ascites"],
    icd10: "B19.9"
  },
  {
    id: "hemorrhoids",
    name: "Hemorrhoids",
    category: "Digestive",
    description: "Swollen and inflamed veins in the rectum and anus that cause discomfort and bleeding.",
    commonSymptoms: ["blood_in_stool", "constipation"],
    redFlags: ["Large volume of bleeding", "Severe anal pain", "Signs of anemia"],
    icd10: "K64.9"
  },
  {
    id: "celiac_disease",
    name: "Celiac Disease",
    category: "Digestive",
    description: "An immune reaction to eating gluten, a protein found in wheat, barley, and rye.",
    commonSymptoms: ["diarrhea", "bloating_gas", "gen_weight_loss", "gen_fatigue"],
    redFlags: ["Severe malnutrition", "Refractory symptoms despite diet"],
    icd10: "K90.0"
  },
  {
    id: "gerd",
    name: "GERD (Acid Reflux)",
    category: "Digestive",
    description: "Chronic condition where stomach acid flows back into the esophagus.",
    commonSymptoms: ["heartburn_reflux", "sore_throat", "cough_dry"],
    redFlags: ["Difficulty swallowing", "Weight loss", "Vomiting blood"],
    icd10: "K21.9"
  },

  // Neurological
  {
    id: "stroke",
    name: "Stroke (CVA)",
    category: "Neurological",
    description: "Damage to the brain from interruption of its blood supply.",
    commonSymptoms: ["neuro_speech_difficulty", "paralysis", "neuro_coordination", "head_dizziness_vertigo", "facial_weakness_paralysis"],
    redFlags: ["Sudden onset of neurological deficits", "Loss of consciousness", "Severe headache"],
    icd10: "I63.9"
  },
  {
    id: "tia",
    name: "Transient Ischemic Attack (TIA)",
    category: "Neurological",
    description: "A brief stroke-like attack that, despite resolving within minutes to hours, still requires immediate medical attention.",
    commonSymptoms: ["neuro_speech_difficulty", "paralysis", "neuro_coordination", "facial_weakness_paralysis"],
    redFlags: ["Symptoms lasting > 1 hour", "Crescendo TIAs"],
    icd10: "G45.9"
  },
  {
    id: "parkinsons",
    name: "Parkinson's Disease",
    category: "Neurological",
    description: "A disorder of the central nervous system that affects movement, often including tremors.",
    commonSymptoms: ["neuro_tremor", "neuro_coordination", "msk_muscle_weakness", "back_stiffness", "gait_abnormality"],
    redFlags: ["Rapid progression", "Early falls", "Severe autonomic dysfunction"],
    icd10: "G20"
  },
  {
    id: "multiple_sclerosis",
    name: "Multiple Sclerosis (MS)",
    category: "Neurological",
    description: "A disease in which the immune system eats away at the protective covering of nerves.",
    commonSymptoms: ["neuro_coordination", "msk_muscle_weakness", "neuropathic_pain", "vision_blurring", "neuro_numbness"],
    redFlags: ["Rapidly progressive weakness", "Bowel/bladder incontinence", "Acute vision loss"],
    icd10: "G35"
  },
  {
    id: "epilepsy",
    name: "Epilepsy",
    category: "Neurological",
    description: "A disorder in which nerve cell activity in the brain is disturbed, causing seizures.",
    commonSymptoms: ["neuro_seizures", "neuro_memory_loss"],
    redFlags: ["Status epilepticus (>5 mins)", "Failure to regain consciousness between seizures", "First-time seizure"],
    icd10: "G40.909"
  },
  {
    id: "alzheimers",
    name: "Alzheimer's Disease / Dementia",
    category: "Neurological",
    description: "A progressive disease that destroys memory and other important mental functions.",
    commonSymptoms: ["neuro_memory_loss", "neuro_speech_difficulty", "neuro_coordination"],
    redFlags: ["Sudden onset of confusion (delirium)", "Inability to care for self", "Wandering"],
    icd10: "G30.9"
  },
  {
    id: "peripheral_neuropathy",
    name: "Peripheral Neuropathy",
    category: "Neurological",
    description: "Weakness, numbness, and pain from nerve damage, usually in the hands and feet.",
    commonSymptoms: ["neuropathic_pain", "neuro_numbness", "msk_muscle_weakness"],
    redFlags: ["Rapidly ascending weakness", "Autonomic dysfunction", "Severe motor weakness"],
    icd10: "G62.9"
  },
  {
    id: "bells_palsy",
    name: "Bell's Palsy",
    category: "Neurological",
    description: "Sudden weakness in the muscles on one half of the face.",
    commonSymptoms: ["facial_weakness_paralysis", "eye_pain", "ear_pain"],
    redFlags: ["Inability to close eye completely", "Bilateral facial weakness", "Other neurological deficits"],
    icd10: "G51.0"
  },
  {
    id: "trigeminal_neuralgia",
    name: "Trigeminal Neuralgia",
    category: "Neurological",
    description: "A chronic pain condition that affects the trigeminal nerve, which carries sensation from your face to your brain.",
    commonSymptoms: ["facial_pain", "neuropathic_pain"],
    redFlags: ["Bilateral pain", "Associated neurological deficits", "Onset under age 40"],
    icd10: "G50.0"
  },
  {
    id: "migraine",
    name: "Migraine Headache",
    category: "Neurological",
    description: "Recurrent headache disorder characterized by moderate to severe throbbing pain, often on one side of the head.",
    commonSymptoms: ["headache_migraine", "nausea", "gen_fatigue", "photophobia"],
    redFlags: ["Sudden onset 'thunderclap' headache", "Neurological deficits", "Fever with stiff neck"],
    icd10: "G43.909"
  },
  {
    id: "tension_headache",
    name: "Tension-Type Headache",
    category: "Neurological",
    description: "The most common type of headache, often described as a tight band around the head.",
    commonSymptoms: ["headache_tension", "gen_fatigue", "neck_pain_stiffness"],
    redFlags: ["New headache after age 50", "Worsening after head injury"],
    icd10: "G44.209"
  },
  {
    id: "cluster_headache",
    name: "Cluster Headache",
    category: "Neurological",
    description: "Intensely painful headaches that occur in cycles or clusters.",
    commonSymptoms: ["headache_cluster", "eye_redness", "eye_discharge"],
    redFlags: ["First ever cluster-like headache", "Atypical duration", "Associated confusion"],
    icd10: "G44.009"
  },
  {
    id: "concussion",
    name: "Concussion",
    category: "Neurological",
    description: "Traumatic brain injury that affects brain function, usually temporary.",
    commonSymptoms: ["head_injury_concussion", "nausea", "gen_fatigue", "neuro_memory_loss"],
    redFlags: ["Loss of consciousness", "Repeated vomiting", "Seizures", "Worsening confusion"],
    icd10: "S06.0X0A"
  },

  // Musculoskeletal
  {
    id: "osteoarthritis",
    name: "Osteoarthritis",
    category: "Musculoskeletal",
    description: "A type of arthritis that occurs when flexible tissue at the ends of bones wears down.",
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "joint_stiffness"],
    redFlags: ["Hot, red, swollen joint (infection risk)", "Inability to bear weight"],
    icd10: "M19.90"
  },
  {
    id: "rheumatoid_arthritis",
    name: "Rheumatoid Arthritis",
    category: "Musculoskeletal",
    description: "A chronic inflammatory disorder affecting many joints, including those in the hands and feet.",
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "gen_fatigue", "gen_fever", "joint_stiffness"],
    redFlags: ["Systemic symptoms (high fever, severe weight loss)", "Cervical spine involvement"],
    icd10: "M06.9"
  },
  {
    id: "gout",
    name: "Gout",
    category: "Musculoskeletal",
    description: "A form of arthritis characterized by severe pain, redness, and tenderness in joints.",
    commonSymptoms: ["msk_joint_pain", "msk_joint_swelling", "skin_redness"],
    redFlags: ["Fever", "Multiple joints involved simultaneously", "Suspicion of septic arthritis"],
    icd10: "M10.9"
  },
  {
    id: "fibromyalgia",
    name: "Fibromyalgia",
    category: "Musculoskeletal",
    description: "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory and mood issues.",
    commonSymptoms: ["msk_joint_pain", "gen_fatigue", "neuro_memory_loss", "headache_tension"],
    redFlags: ["Severe unexplained weight loss", "Focal neurological signs"],
    icd10: "M79.7"
  },
  {
    id: "sciatica",
    name: "Sciatica",
    category: "Musculoskeletal",
    description: "Pain radiating along the sciatic nerve, which runs down one or both legs from the lower back.",
    commonSymptoms: ["back_pain_lower", "neuropathic_pain", "msk_muscle_weakness", "sciatica"],
    redFlags: ["Saddle anesthesia", "Bowel or bladder incontinence", "Progressive motor weakness"],
    icd10: "M54.30"
  },
  {
    id: "herniated_disc",
    name: "Herniated Disc",
    category: "Musculoskeletal",
    description: "A problem with a rubbery disk between the spinal bones.",
    commonSymptoms: ["back_pain_lower", "neuropathic_pain", "back_numbness"],
    redFlags: ["Cauda equina syndrome signs", "Severe progressive weakness"],
    icd10: "M51.26"
  },
  {
    id: "osteoporosis",
    name: "Osteoporosis (with fracture)",
    category: "Musculoskeletal",
    description: "A condition in which bones become weak and brittle.",
    commonSymptoms: ["back_pain_lower", "back_pain_upper", "msk_bone_pain"],
    redFlags: ["Sudden severe back pain in elderly", "Loss of height", "Neurological deficits"],
    icd10: "M81.0"
  },
  {
    id: "muscle_strain",
    name: "Muscle Strain / Sprain",
    category: "Musculoskeletal",
    description: "Stretching or tearing of a muscle or a tissue connecting muscle to bone (tendon).",
    commonSymptoms: ["msk_muscle_weakness", "msk_joint_swelling", "msk_joint_pain"],
    redFlags: ["Inability to bear weight", "Visible deformity", "Severe pain out of proportion"],
    icd10: "S39.012"
  },
  {
    id: "plantar_fasciitis",
    name: "Plantar Fasciitis",
    category: "Musculoskeletal",
    description: "An inflammation of a thick band of tissue that connects the heel bone to the toes.",
    commonSymptoms: ["msk_joint_pain", "gait_abnormality"],
    redFlags: ["Numbness or tingling in foot", "Pain that worsens at night", "Fever"],
    icd10: "M72.2"
  },
  {
    id: "lumbar_strain",
    name: "Acute Lumbar Strain",
    category: "Musculoskeletal",
    description: "Injury to the lower back muscles or ligaments, often following physical exertion.",
    commonSymptoms: ["back_pain_lower", "back_spasm", "back_stiffness"],
    redFlags: ["Cauda equina symptoms (saddle anesthesia, bowel/bladder incontinence)", "Fever", "Weight loss"],
    icd10: "S39.012"
  },

  // Endocrine / Metabolic
  {
    id: "diabetes_mellitus",
    name: "Diabetes Mellitus",
    category: "Endocrine",
    description: "A disease in which the body's ability to produce or respond to the hormone insulin is impaired.",
    commonSymptoms: ["gen_thirst", "urinary_urgency", "gen_weight_loss", "gen_fatigue", "nycturia"],
    redFlags: ["Fruity breath odor", "Confusion or lethargy", "Kussmaul respirations (DKA)"],
    icd10: "E11.9"
  },
  {
    id: "hypothyroidism",
    name: "Hypothyroidism",
    category: "Endocrine",
    description: "A condition in which the thyroid gland doesn't produce enough thyroid hormone.",
    commonSymptoms: ["gen_fatigue", "constipation", "msk_muscle_weakness"],
    redFlags: ["Myxedema coma (severe lethargy, hypothermia)", "Severe bradycardia"],
    icd10: "E03.9"
  },
  {
    id: "hyperthyroidism",
    name: "Hyperthyroidism",
    category: "Endocrine",
    description: "The overproduction of a hormone by the butterfly-shaped gland in the neck (thyroid).",
    commonSymptoms: ["palpitations", "gen_weight_loss", "neuro_tremor", "diarrhea"],
    redFlags: ["Thyroid storm (high fever, severe tachycardia, delirium)", "Severe arrhythmias"],
    icd10: "E05.90"
  },
  {
    id: "cushings_syndrome",
    name: "Cushing's Syndrome",
    category: "Endocrine",
    description: "A condition that occurs from exposure to high cortisol levels for a long time.",
    commonSymptoms: ["gen_fatigue", "skin_lesion_changes", "msk_muscle_weakness"],
    redFlags: ["Severe hypertension", "Severe hypokalemia", "Psychosis"],
    icd10: "E24.9"
  },
  {
    id: "addisons_disease",
    name: "Addison's Disease",
    category: "Endocrine",
    description: "A disorder in which the adrenal glands don't produce enough hormones.",
    commonSymptoms: ["gen_fatigue", "gen_weight_loss", "nausea", "abdominal_pain"],
    redFlags: ["Adrenal crisis (severe hypotension, shock)", "Severe abdominal pain", "Profound weakness"],
    icd10: "E27.1"
  },

  // Renal / Urologic
  {
    id: "kidney_stones",
    name: "Kidney Stones (Nephrolithiasis)",
    category: "Renal",
    description: "A small, hard deposit that forms in the kidneys and is often painful when passed.",
    commonSymptoms: ["flank_pain", "hematuria", "nausea", "vomiting", "painful_urination"],
    redFlags: ["Fever and chills (infection with obstruction)", "Inability to pass urine", "Intractable pain"],
    icd10: "N20.0"
  },
  {
    id: "pyelonephritis",
    name: "Pyelonephritis (Kidney Infection)",
    category: "Renal",
    description: "Inflammation of the kidney due to a bacterial infection.",
    commonSymptoms: ["flank_pain", "gen_fever", "painful_urination", "nausea", "vomiting"],
    redFlags: ["Signs of sepsis", "Inability to tolerate oral fluids", "Pregnancy"],
    icd10: "N15.9"
  },
  {
    id: "bph",
    name: "Benign Prostatic Hyperplasia (BPH)",
    category: "Urologic",
    description: "Age-associated prostate gland enlargement that can cause urination difficulty.",
    commonSymptoms: ["urinary_urgency", "nycturia", "hesitancy"],
    redFlags: ["Acute urinary retention", "Gross hematuria", "Renal failure signs"],
    icd10: "N40.1"
  },
  {
    id: "ckd",
    name: "Chronic Kidney Disease",
    category: "Renal",
    description: "Longstanding disease of the kidneys leading to renal failure.",
    commonSymptoms: ["gen_fatigue", "leg_swelling_heart", "nausea", "urinary_urgency"],
    redFlags: ["Severe fluid overload", "Uremic encephalopathy", "Severe hyperkalemia"],
    icd10: "N18.9"
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (UTI)",
    category: "Infectious",
    description: "Infection in any part of the urinary system, most commonly the bladder (cystitis).",
    commonSymptoms: ["painful_urination", "gen_fever", "gen_fatigue", "urinary_urgency"],
    redFlags: ["Flank pain", "High fever", "Confusion in elderly"],
    icd10: "N39.0"
  },

  // EENT (Eye, Ear, Nose, Throat)
  {
    id: "glaucoma",
    name: "Glaucoma",
    category: "EENT",
    description: "A group of eye conditions that can cause blindness.",
    commonSymptoms: ["eye_pain", "vision_blurring", "headache_migraine", "nausea"],
    redFlags: ["Sudden severe eye pain", "Halos around lights", "Rapid vision loss"],
    icd10: "H40.9"
  },
  {
    id: "conjunctivitis",
    name: "Conjunctivitis (Pink Eye)",
    category: "EENT",
    description: "Inflammation or infection of the outer membrane of the eyeball and the inner eyelid.",
    commonSymptoms: ["eye_redness", "eye_discharge", "eye_itching"],
    redFlags: ["Severe eye pain", "Decreased vision", "Photophobia"],
    icd10: "H10.9"
  },
  {
    id: "cataracts",
    name: "Cataracts",
    category: "EENT",
    description: "Clouding of the normally clear lens of the eye.",
    commonSymptoms: ["vision_blurring"],
    redFlags: ["Sudden vision loss", "Painful eye"],
    icd10: "H26.9"
  },
  {
    id: "macular_degeneration",
    name: "Macular Degeneration",
    category: "EENT",
    description: "An eye disease that causes vision loss, typically in the center of the field of vision.",
    commonSymptoms: ["vision_blurring"],
    redFlags: ["Sudden distortion of vision", "Rapid central vision loss"],
    icd10: "H35.30"
  },
  {
    id: "menieres_disease",
    name: "Meniere's Disease",
    category: "EENT",
    description: "An inner ear disorder that causes episodes of vertigo.",
    commonSymptoms: ["vertigo", "tinnitus", "hearing_loss_gradual", "nausea"],
    redFlags: ["Sudden profound hearing loss", "Neurological deficits"],
    icd10: "H81.09"
  },
  {
    id: "bppv",
    name: "Benign Paroxysmal Positional Vertigo (BPPV)",
    category: "EENT",
    description: "Episodes of dizziness and a sensation of spinning with certain head movements.",
    commonSymptoms: ["vertigo", "nausea", "vomiting"],
    redFlags: ["Continuous vertigo", "Associated hearing loss", "Neurological signs"],
    icd10: "H81.10"
  },
  {
    id: "allergic_rhinitis",
    name: "Allergic Rhinitis",
    category: "EENT",
    description: "An allergic response causing itchy, watery eyes, sneezing, and other similar symptoms.",
    commonSymptoms: ["cough_dry", "sore_throat", "eye_redness", "frequent_throat_clearing"],
    redFlags: ["Unilateral nasal discharge", "Severe facial pain", "Epistaxis"],
    icd10: "J30.9"
  },
  {
    id: "laryngitis",
    name: "Laryngitis",
    category: "EENT",
    description: "An inflammation of the voice box from overuse, irritation, or infection.",
    commonSymptoms: ["throat_hoarseness", "sore_throat", "cough_dry"],
    redFlags: ["Stridor", "Difficulty breathing", "Drooling"],
    icd10: "J04.0"
  },
  {
    id: "strep_throat",
    name: "Streptococcal Pharyngitis (Strep Throat)",
    category: "Infectious",
    description: "Bacterial infection of the throat caused by Group A Streptococcus.",
    commonSymptoms: ["sore_throat", "gen_fever", "swollen_neck_glands"],
    redFlags: ["Difficulty swallowing", "Drooling", "Muffled voice"],
    icd10: "J02.0"
  },
  {
    id: "viral_pharyngitis",
    name: "Viral Pharyngitis",
    category: "Infectious",
    description: "Inflammation of the pharynx caused by a viral infection (e.g., common cold).",
    commonSymptoms: ["sore_throat", "cough_dry", "gen_fever"],
    redFlags: ["Severe difficulty swallowing", "Difficulty breathing"],
    icd10: "J02.9"
  },
  {
    id: "acute_otitis_media",
    name: "Acute Otitis Media",
    category: "Infectious",
    description: "Infection of the middle ear, common in children, often following a viral upper respiratory infection.",
    commonSymptoms: ["ear_pain", "gen_fever", "ear_discharge_fluid"],
    redFlags: ["Mastoid tenderness", "Facial nerve palsy", "Stiff neck"],
    icd10: "H66.90"
  },
  {
    id: "sinusitis",
    name: "Acute Sinusitis",
    category: "Infectious",
    description: "Inflammation or infection of the sinuses, often following a cold.",
    commonSymptoms: ["headache_sinus", "gen_fever", "cough_productive", "facial_pain"],
    redFlags: ["Vision changes", "Severe headache", "Periorbital swelling"],
    icd10: "J01.90"
  },

  // Dermatological
  {
    id: "eczema",
    name: "Eczema (Atopic Dermatitis)",
    category: "Dermatological",
    description: "An itchy inflammation of the skin.",
    commonSymptoms: ["skin_itching", "skin_rash", "skin_redness"],
    redFlags: ["Signs of secondary infection (pus, crusting)", "Eczema herpeticum"],
    icd10: "L20.9"
  },
  {
    id: "psoriasis",
    name: "Psoriasis",
    category: "Dermatological",
    description: "A condition in which skin cells build up and form scales and itchy, dry patches.",
    commonSymptoms: ["skin_rash", "skin_lesion_changes", "msk_joint_pain"],
    redFlags: ["Erythrodermic psoriasis (widespread redness)", "Pustular psoriasis"],
    icd10: "L40.9"
  },
  {
    id: "contact_dermatitis",
    name: "Contact Dermatitis",
    category: "Dermatological",
    description: "A skin rash caused by contact with a certain substance.",
    commonSymptoms: ["skin_rash", "skin_itching", "skin_redness"],
    redFlags: ["Facial or airway swelling", "Extensive blistering", "Signs of infection"],
    icd10: "L23.9"
  },
  {
    id: "melanoma",
    name: "Melanoma",
    category: "Oncology",
    description: "The most serious type of skin cancer.",
    commonSymptoms: ["skin_lesion_changes"],
    redFlags: ["Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving", "Bleeding mole"],
    icd10: "C43.9"
  },
  {
    id: "ringworm",
    name: "Ringworm (Tinea Corporis)",
    category: "Infectious",
    description: "A highly contagious, fungal infection of the skin or scalp.",
    commonSymptoms: ["skin_rash", "skin_itching", "skin_lesion_changes"],
    redFlags: ["Extensive involvement", "Failure to respond to topical treatment"],
    icd10: "B35.4"
  },
  {
    id: "scabies",
    name: "Scabies",
    category: "Infectious",
    description: "A contagious, intensely itchy skin condition caused by a tiny, burrowing mite.",
    commonSymptoms: ["skin_itching", "skin_rash"],
    redFlags: ["Crusted (Norwegian) scabies", "Secondary bacterial infection"],
    icd10: "B86"
  },
  {
    id: "shingles",
    name: "Shingles (Herpes Zoster)",
    category: "Infectious",
    description: "A reactivation of the chickenpox virus in the body, causing a painful rash.",
    commonSymptoms: ["skin_rash", "neuropathic_pain", "skin_itching", "gen_fever"],
    redFlags: ["Involvement of the eye (Herpes Zoster Ophthalmicus)", "Disseminated rash"],
    icd10: "B02.9"
  },
  {
    id: "cellulitis",
    name: "Cellulitis",
    category: "Infectious",
    description: "Bacterial skin infection causing redness, swelling, and warmth.",
    commonSymptoms: ["skin_redness", "gen_fever", "skin_lesion_changes"],
    redFlags: ["Rapidly spreading redness", "Severe pain", "Signs of systemic toxicity"],
    icd10: "L03.90"
  },

  // Infectious (Additional)
  {
    id: "mononucleosis",
    name: "Infectious Mononucleosis",
    category: "Infectious",
    description: "Often called mono or kissing disease, an infection with the Epstein-Barr virus.",
    commonSymptoms: ["gen_fever", "sore_throat", "gen_fatigue", "swollen_neck_glands"],
    redFlags: ["Severe abdominal pain (splenic rupture)", "Airway obstruction from tonsils"],
    icd10: "B27.90"
  },
  {
    id: "meningitis",
    name: "Meningitis",
    category: "Infectious",
    description: "Inflammation of brain and spinal cord membranes, typically caused by an infection.",
    commonSymptoms: ["headache_migraine", "gen_fever", "nausea", "vomiting", "neck_pain_stiffness"],
    redFlags: ["Altered mental status", "Petechial rash", "Seizures", "Focal neurological deficits"],
    icd10: "G03.9"
  },
  {
    id: "lyme_disease",
    name: "Lyme Disease",
    category: "Infectious",
    description: "A tick-borne illness caused by the bacterium Borrelia burgdorferi.",
    commonSymptoms: ["skin_rash", "gen_fever", "gen_fatigue", "msk_joint_pain", "headache_tension"],
    redFlags: ["Heart block (Lyme carditis)", "Facial palsy", "Meningitis symptoms"],
    icd10: "A69.20"
  },
  {
    id: "sepsis",
    name: "Sepsis",
    category: "Emergency",
    description: "A life-threatening complication of an infection.",
    commonSymptoms: ["gen_fever", "tachypnea", "palpitations", "neuro_memory_loss", "lungs_shortness_of_breath"],
    redFlags: ["Hypotension", "Altered mental status", "Lactate elevation", "Oliguria"],
    icd10: "A41.9"
  },
  {
    id: "malaria",
    name: "Malaria",
    category: "Infectious",
    description: "A disease caused by a plasmodium parasite, transmitted by the bite of infected mosquitoes.",
    commonSymptoms: ["gen_fever", "gen_night_sweats", "gen_fatigue", "headache_tension", "nausea"],
    redFlags: ["Altered consciousness (cerebral malaria)", "Severe anemia", "Respiratory distress"],
    icd10: "B54"
  },
  {
    id: "hiv_acute",
    name: "Acute HIV Infection",
    category: "Infectious",
    description: "The earliest stage of HIV infection, often presenting with flu-like symptoms.",
    commonSymptoms: ["gen_fever", "sore_throat", "gen_fatigue", "skin_rash", "swollen_neck_glands"],
    redFlags: ["Opportunistic infections", "Severe neurological symptoms"],
    icd10: "B20"
  },

  // Psychiatric / Systemic / Other / Emergency
  {
    id: "generalized_anxiety",
    name: "Generalized Anxiety Disorder (GAD)",
    category: "Psychiatric",
    description: "Severe, ongoing anxiety that interferes with daily activities.",
    commonSymptoms: ["palpitations", "gen_fatigue", "headache_tension", "nausea"],
    redFlags: ["Suicidal ideation", "Severe impairment in functioning"],
    icd10: "F41.1"
  },
  {
    id: "panic_attack",
    name: "Panic Attack",
    category: "Psychiatric",
    description: "Sudden episode of intense fear or anxiety and physical symptoms, based on a perceived threat rather than imminent danger.",
    commonSymptoms: ["palpitations", "lungs_shortness_of_breath", "heart_chest_pain", "head_dizziness_vertigo", "neuro_tremor"],
    redFlags: ["Must rule out myocardial infarction or pulmonary embolism first"],
    icd10: "F41.0"
  },
  {
    id: "major_depression",
    name: "Major Depressive Disorder",
    category: "Psychiatric",
    description: "A mental health disorder characterized by persistently depressed mood or loss of interest in activities.",
    commonSymptoms: ["gen_fatigue", "loss_of_appetite", "gen_weight_loss", "neuro_memory_loss"],
    redFlags: ["Suicidal ideation or plan", "Psychotic features", "Inability to care for self"],
    icd10: "F32.9"
  },
  {
    id: "anemia",
    name: "Anemia",
    category: "Hematologic",
    description: "A condition in which the blood doesn't have enough healthy red blood cells.",
    commonSymptoms: ["gen_fatigue", "lungs_shortness_of_breath", "palpitations", "head_dizziness_vertigo"],
    redFlags: ["Severe shortness of breath at rest", "Chest pain", "Syncope", "Active bleeding"],
    icd10: "D64.9"
  },
  {
    id: "endometriosis",
    name: "Endometriosis",
    category: "Gynecological",
    description: "A disorder in which tissue that normally lines the uterus grows outside the uterus.",
    commonSymptoms: ["abdominal_pain", "back_pain_lower", "painful_urination", "diarrhea"],
    redFlags: ["Severe acute pelvic pain (rule out ectopic pregnancy or torsion)"],
    icd10: "N80.9"
  },
  {
    id: "pcos",
    name: "Polycystic Ovary Syndrome (PCOS)",
    category: "Endocrine",
    description: "A hormonal disorder causing enlarged ovaries with small cysts on the outer edges.",
    commonSymptoms: ["gen_fatigue", "skin_lesion_changes"],
    redFlags: ["Severe irregular bleeding", "Signs of endometrial hyperplasia"],
    icd10: "E28.2"
  },
  {
    id: "dvt",
    name: "Deep Vein Thrombosis (DVT)",
    category: "Vascular",
    description: "Blood clot in a deep vein, usually in the legs.",
    commonSymptoms: ["msk_leg_swelling_pain"],
    redFlags: ["Shortness of breath", "Chest pain (signs of PE)"],
    icd10: "I82.40"
  },
  {
    id: "anaphylaxis",
    name: "Anaphylaxis",
    category: "Emergency",
    description: "Severe, potentially life-threatening allergic reaction.",
    commonSymptoms: ["lungs_shortness_of_breath", "wheezing", "throat_itching", "hives_urticaria"],
    redFlags: ["Hypotension", "Swelling of tongue/throat", "Loss of consciousness"],
    icd10: "T78.2"
  }
];
