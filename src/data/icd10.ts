export interface ICD10Code {
  code: string;
  description: string;
  category?: string;
}

export const commonICD10Codes: ICD10Code[] = [
  // --- Respiratory System ---
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified", category: "Respiratory" },
  { code: "J01.90", description: "Acute sinusitis, unspecified", category: "Respiratory" },
  { code: "J02.9", description: "Acute pharyngitis, unspecified", category: "Respiratory" },
  { code: "J03.90", description: "Acute tonsillitis, unspecified", category: "Respiratory" },
  { code: "J15.9", description: "Unspecified bacterial pneumonia", category: "Respiratory" },
  { code: "J18.9", description: "Pneumonia, unspecified organism", category: "Respiratory" },
  { code: "J20.9", description: "Acute bronchitis, unspecified", category: "Respiratory" },
  { code: "J44.9", description: "Chronic obstructive pulmonary disease, unspecified (COPD)", category: "Respiratory" },
  { code: "J45.909", description: "Unspecified asthma, uncomplicated", category: "Respiratory" },
  { code: "J30.9", description: "Allergic rhinitis, unspecified", category: "Respiratory" },
  { code: "J96.00", description: "Acute respiratory failure, unspecified", category: "Respiratory" },
  { code: "J81.0", description: "Acute pulmonary edema", category: "Respiratory" },

  // --- Circulatory / Cardiovascular System ---
  { code: "I10", description: "Essential (primary) hypertension", category: "Cardiovascular" },
  { code: "I11.9", description: "Hypertensive heart disease without heart failure", category: "Cardiovascular" },
  { code: "I20.9", description: "Angina pectoris, unspecified", category: "Cardiovascular" },
  { code: "I21.9", description: "Acute myocardial infarction, unspecified (AMI)", category: "Cardiovascular" },
  { code: "I25.10", description: "Atherosclerotic heart disease of native coronary artery without angina", category: "Cardiovascular" },
  { code: "I50.9", description: "Heart failure, unspecified", category: "Cardiovascular" },
  { code: "I48.91", description: "Unspecified atrial fibrillation", category: "Cardiovascular" },
  { code: "I63.9", description: "Cerebral infarction, unspecified (Ischemic Stroke)", category: "Cardiovascular" },
  { code: "I87.2", description: "Venous insufficiency (chronic) (peripheral)", category: "Cardiovascular" },
  { code: "I80.209", description: "Phlebitis and thrombophlebitis of deep vessels of lower extremity (DVT)", category: "Cardiovascular" },
  { code: "I73.9", description: "Peripheral vascular disease, unspecified", category: "Cardiovascular" },

  // --- Endocrine, Nutritional & Metabolic Diseases ---
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications", category: "Endocrine & Metabolic" },
  { code: "E11.65", description: "Type 2 diabetes mellitus with hyperglycemia", category: "Endocrine & Metabolic" },
  { code: "E11.22", description: "Type 2 diabetes mellitus with diabetic chronic kidney disease", category: "Endocrine & Metabolic" },
  { code: "E10.9", description: "Type 1 diabetes mellitus without complications", category: "Endocrine & Metabolic" },
  { code: "E03.9", description: "Hypothyroidism, unspecified", category: "Endocrine & Metabolic" },
  { code: "E05.90", description: "Thyrotoxicosis without thyrotoxic crisis or storm (Hyperthyroidism)", category: "Endocrine & Metabolic" },
  { code: "E78.5", description: "Hyperlipidemia, unspecified", category: "Endocrine & Metabolic" },
  { code: "E66.9", description: "Obesity, unspecified", category: "Endocrine & Metabolic" },
  { code: "E87.1", description: "Hypo-osmolality and hyponatremia", category: "Endocrine & Metabolic" },
  { code: "E87.6", description: "Hypokalemia", category: "Endocrine & Metabolic" },
  { code: "E55.9", description: "Vitamin D deficiency, unspecified", category: "Endocrine & Metabolic" },
  { code: "E79.0", description: "Hyperuricemia without signs of inflammatory arthritis (Gout precursor)", category: "Endocrine & Metabolic" },

  // --- Gastrointestinal & Digestive System ---
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis (GERD)", category: "Gastrointestinal" },
  { code: "K25.9", description: "Gastric ulcer, unspecified", category: "Gastrointestinal" },
  { code: "K29.70", description: "Gastritis, unspecified, without bleeding", category: "Gastrointestinal" },
  { code: "K35.80", description: "Unspecified acute appendicitis", category: "Gastrointestinal" },
  { code: "K80.20", description: "Calculus of gallbladder without cholecystitis (Gallstones)", category: "Gastrointestinal" },
  { code: "K81.9", description: "Cholecystitis, unspecified", category: "Gastrointestinal" },
  { code: "K52.9", description: "Noninfective gastroenteritis and colitis, unspecified", category: "Gastrointestinal" },
  { code: "K58.9", description: "Irritable bowel syndrome (IBS), unspecified", category: "Gastrointestinal" },
  { code: "K57.92", description: "Diverticulitis of intestine, part unspecified, without abscess or bleeding", category: "Gastrointestinal" },
  { code: "K76.0", description: "Fatty change of liver, not elsewhere classified (NAFLD/MASLD)", category: "Gastrointestinal" },
  { code: "K60.2", description: "Anal fissure, unspecified", category: "Gastrointestinal" },
  { code: "K64.9", description: "Unspecified hemorrhoids", category: "Gastrointestinal" },

  // --- Musculoskeletal & Connective Tissue ---
  { code: "M54.5", description: "Low back pain", category: "Musculoskeletal" },
  { code: "M54.2", description: "Cervicalgia (Neck pain)", category: "Musculoskeletal" },
  { code: "M17.9", description: "Osteoarthritis of knee, unspecified", category: "Musculoskeletal" },
  { code: "M16.9", description: "Osteoarthritis of hip, unspecified", category: "Musculoskeletal" },
  { code: "M10.9", description: "Gout, unspecified", category: "Musculoskeletal" },
  { code: "M79.7", description: "Fibromyalgia", category: "Musculoskeletal" },
  { code: "M81.0", description: "Age-related osteoporosis without current pathological fracture", category: "Musculoskeletal" },
  { code: "M75.100", description: "Unspecified rotator cuff tear or rupture of shoulder", category: "Musculoskeletal" },
  { code: "M25.569", description: "Pain in unspecified knee", category: "Musculoskeletal" },
  { code: "M06.9", description: "Rheumatoid arthritis, unspecified", category: "Musculoskeletal" },

  // --- Mental, Behavioral & Neurodevelopmental Disorders ---
  { code: "F41.1", description: "Generalized anxiety disorder", category: "Psychiatry" },
  { code: "F41.0", description: "Panic disorder [episodic paroxysmal anxiety]", category: "Psychiatry" },
  { code: "F32.9", description: "Major depressive disorder, single episode, unspecified", category: "Psychiatry" },
  { code: "F33.1", description: "Major depressive disorder, recurrent, moderate", category: "Psychiatry" },
  { code: "F10.20", description: "Alcohol dependence, uncomplicated", category: "Psychiatry" },
  { code: "F17.210", description: "Nicotine dependence, cigarettes, uncomplicated", category: "Psychiatry" },
  { code: "F43.10", description: "Post-traumatic stress disorder (PTSD), unspecified", category: "Psychiatry" },
  { code: "F90.9", description: "Attention-deficit hyperactivity disorder (ADHD), unspecified", category: "Psychiatry" },
  { code: "F51.01", description: "Primary insomnia", category: "Psychiatry" },

  // --- Nervous System & Neurological Disorders ---
  { code: "G43.909", description: "Migraine, unspecified, not intractable, without status migrainosus", category: "Neurology" },
  { code: "G44.209", description: "Tension-type headache, unspecified, not intractable", category: "Neurology" },
  { code: "G40.909", description: "Epilepsy, unspecified, not intractable, without status epilepticus", category: "Neurology" },
  { code: "G47.33", description: "Obstructive sleep apnea (adult) (pediatric)", category: "Neurology" },
  { code: "G30.9", description: "Alzheimer's disease, unspecified", category: "Neurology" },
  { code: "G20", description: "Parkinson's disease", category: "Neurology" },
  { code: "G56.00", description: "Carpal tunnel syndrome, unspecified upper limb", category: "Neurology" },
  { code: "G81.90", description: "Hemiplegia, unspecified affecting unspecified side", category: "Neurology" },

  // --- Genitourinary System ---
  { code: "N39.0", description: "Urinary tract infection, site not specified (UTI)", category: "Genitourinary" },
  { code: "N20.1", description: "Calculus of ureter / kidney stone", category: "Genitourinary" },
  { code: "N18.9", description: "Chronic kidney disease, unspecified (CKD)", category: "Genitourinary" },
  { code: "N17.9", description: "Acute kidney failure, unspecified (AKI)", category: "Genitourinary" },
  { code: "N40.0", description: "Benign prostatic hyperplasia (BPH) without lower urinary symptoms", category: "Genitourinary" },
  { code: "N94.6", description: "Dysmenorrhea, unspecified", category: "Genitourinary" },
  { code: "N92.6", description: "Irregular menstruation, unspecified", category: "Genitourinary" },

  // --- Infectious & Parasitic Diseases ---
  { code: "A09", description: "Infectious gastroenteritis and colitis, unspecified", category: "Infectious Diseases" },
  { code: "A41.9", description: "Sepsis, unspecified organism", category: "Infectious Diseases" },
  { code: "B34.9", description: "Viral infection, unspecified", category: "Infectious Diseases" },
  { code: "B00.9", description: "Herpesviral infection, unspecified", category: "Infectious Diseases" },
  { code: "B02.9", description: "Zoster without complications (Shingles)", category: "Infectious Diseases" },
  { code: "B37.0", description: "Candidal stomatitis (Oral Thrush)", category: "Infectious Diseases" },
  { code: "A15.0", description: "Tuberculosis of lung", category: "Infectious Diseases" },
  { code: "B97.29", description: "Other coronavirus as the cause of diseases classified elsewhere (COVID-19)", category: "Infectious Diseases" },

  // --- Dermatology & Subcutaneous Tissue ---
  { code: "L03.90", description: "Cellulitis, unspecified", category: "Dermatology" },
  { code: "L20.9", description: "Atopic dermatitis, unspecified (Eczema)", category: "Dermatology" },
  { code: "L23.9", description: "Allergic contact dermatitis, unspecified cause", category: "Dermatology" },
  { code: "L40.9", description: "Psoriasis, unspecified", category: "Dermatology" },
  { code: "L70.0", description: "Acne vulgaris", category: "Dermatology" },
  { code: "L50.9", description: "Urticaria, unspecified (Hives)", category: "Dermatology" },
  { code: "L98.499", description: "Non-pressure chronic ulcer of unspecified part of lower leg", category: "Dermatology" },

  // --- Hematology & Oncology ---
  { code: "D50.9", description: "Iron deficiency anemia, unspecified", category: "Hematology & Oncology" },
  { code: "D64.9", description: "Anemia, unspecified", category: "Hematology & Oncology" },
  { code: "D69.6", description: "Thrombocytopenia, unspecified", category: "Hematology & Oncology" },
  { code: "C34.90", description: "Malignant neoplasm of unspecified bronchus or lung", category: "Hematology & Oncology" },
  { code: "C50.919", description: "Malignant neoplasm of unspecified female breast", category: "Hematology & Oncology" },
  { code: "C61", description: "Malignant neoplasm of prostate", category: "Hematology & Oncology" },
  { code: "C18.9", description: "Malignant neoplasm of colon, unspecified", category: "Hematology & Oncology" },

  // --- ENT, Ophthalmology & Sensory Organs ---
  { code: "H10.9", description: "Unspecified conjunctivitis", category: "ENT & Ophthalmology" },
  { code: "H00.019", description: "Hordeolum externum unspecified eye (Stye)", category: "ENT & Ophthalmology" },
  { code: "H40.9", description: "Unspecified glaucoma", category: "ENT & Ophthalmology" },
  { code: "H25.9", description: "Unspecified age-related cataract", category: "ENT & Ophthalmology" },
  { code: "H66.90", description: "Otitis media, unspecified, unspecified ear", category: "ENT & Ophthalmology" },
  { code: "H60.90", description: "Unspecified otitis externa, unspecified ear", category: "ENT & Ophthalmology" },
  { code: "H81.10", description: "Benign paroxysmal vertigo, unspecified ear (BPPV)", category: "ENT & Ophthalmology" },

  // --- Symptoms, Signs & Abnormal Clinical Findings ---
  { code: "R05", description: "Cough", category: "Symptoms & Signs" },
  { code: "R07.9", description: "Chest pain, unspecified", category: "Symptoms & Signs" },
  { code: "R06.02", description: "Shortness of breath (Dyspnea)", category: "Symptoms & Signs" },
  { code: "R50.9", description: "Fever, unspecified", category: "Symptoms & Signs" },
  { code: "R51.9", description: "Headache, unspecified", category: "Symptoms & Signs" },
  { code: "R42", description: "Dizziness and giddiness", category: "Symptoms & Signs" },
  { code: "R53.83", description: "Other fatigue", category: "Symptoms & Signs" },
  { code: "R10.9", description: "Unspecified abdominal pain", category: "Symptoms & Signs" },
  { code: "R11.2", description: "Nausea with vomiting, unspecified", category: "Symptoms & Signs" },
  { code: "R00.0", description: "Tachycardia, unspecified", category: "Symptoms & Signs" },
  { code: "R55", description: "Syncope and collapse (Fainting)", category: "Symptoms & Signs" },
  { code: "R60.9", description: "Edema, unspecified", category: "Symptoms & Signs" },

  // --- Injury, Trauma & External Causes ---
  { code: "S06.0X0A", description: "Concussion without loss of consciousness, initial encounter", category: "Trauma & Injury" },
  { code: "S93.409A", description: "Sprain of unspecified ligament of ankle, initial encounter", category: "Trauma & Injury" },
  { code: "S62.609A", description: "Fracture of unspecified phalanx of finger, initial encounter", category: "Trauma & Injury" },
  { code: "T78.40XA", description: "Allergy, unspecified, initial encounter", category: "Trauma & Injury" },
  { code: "T30.0", description: "Burn of unspecified body region, unspecified degree", category: "Trauma & Injury" },

  // --- Factors Influencing Health Status & Routine Encounters ---
  { code: "Z00.00", description: "Encounter for general adult medical examination without abnormal findings", category: "Health Encounters" },
  { code: "Z23", description: "Encounter for immunization", category: "Health Encounters" },
  { code: "Z01.419", description: "Encounter for gynecological examination without abnormal findings", category: "Health Encounters" },
  { code: "Z79.4", description: "Long term (current) use of insulin", category: "Health Encounters" },
  { code: "Z79.01", description: "Long term (current) use of anticoagulants", category: "Health Encounters" },
  { code: "Z88.0", description: "Allergy status to penicillin", category: "Health Encounters" }
];

