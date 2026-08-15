export interface PertinentNegativeItem {
  id: string; // e.g. "no_diaphoresis"
  symptomId: string; // canonical symptom key, e.g. "diaphoresis" or "chest_pain_radiation"
  label: string; // e.g. "No Diaphoresis"
  category: string; // "CVS", "RES", "NEU", "GI", "GEN", "GU"
  description: string; // Clinical explanation why this negative is high yield
  associatedRuleOuts: string[]; // e.g. ["Acute Coronary Syndrome", "Pulmonary Embolism"]
  lrNegative: number; // Likelihood Ratio Negative (e.g. 0.2)
  snomed_code?: string;
}

export const PERTINENT_NEGATIVES_LIBRARY: PertinentNegativeItem[] = [
  // Cardiovascular
  {
    id: "no_diaphoresis",
    symptomId: "diaphoresis",
    label: "No Diaphoresis / Cold Sweats",
    category: "CVS",
    description: "Absence of diaphoresis significantly lowers likelihood of Acute Coronary Syndrome (ACS).",
    associatedRuleOuts: ["Acute Coronary Syndrome", "Myocardial Infarction"],
    lrNegative: 0.25,
    snomed_code: "386661006"
  },
  {
    id: "no_arm_radiation",
    symptomId: "chest_pain_radiation",
    label: "No Pain Radiation to Left Arm / Jaw",
    category: "CVS",
    description: "Lack of radiation to left arm or jaw rules down severe myocardial ischemia.",
    associatedRuleOuts: ["Acute Coronary Syndrome", "Angina Pectoris"],
    lrNegative: 0.20
  },
  {
    id: "no_syncope",
    symptomId: "syncope",
    label: "No Loss of Consciousness / Syncope",
    category: "CVS",
    description: "Rules down critical aortic dissection, massive PE, and life-threatening arrhythmia.",
    associatedRuleOuts: ["Aortic Dissection", "Pulmonary Embolism", "Ventricular Tachycardia"],
    lrNegative: 0.15
  },
  {
    id: "no_orthopnea",
    symptomId: "orthopnea",
    label: "No Orthopnea / PND",
    category: "CVS",
    description: "Absence of orthopnea or paroxysmal nocturnal dyspnea makes acute decompensated heart failure unlikely.",
    associatedRuleOuts: ["Heart Failure"],
    lrNegative: 0.22
  },

  // Respiratory
  {
    id: "no_dyspnea",
    symptomId: "dyspnea",
    label: "No Shortness of Breath (Dyspnea)",
    category: "RES",
    description: "Absence of dyspnea strongly rules down pulmonary embolism, pneumothorax, and severe asthma.",
    associatedRuleOuts: ["Pulmonary Embolism", "Pneumothorax", "Asthma Exacerbation"],
    lrNegative: 0.15
  },
  {
    id: "no_hemoptysis",
    symptomId: "hemoptysis",
    label: "No Hemoptysis (Coughing Blood)",
    category: "RES",
    description: "Rules down pulmonary infarction, TB, bronchial malignancy, and Wegener's.",
    associatedRuleOuts: ["Pulmonary Embolism", "Tuberculosis", "Lung Malignancy"],
    lrNegative: 0.10
  },
  {
    id: "no_pleuritic_pain",
    symptomId: "pleuritic_chest_pain",
    label: "No Pleuritic Pain (Sharp on Inspiration)",
    category: "RES",
    description: "Rules down pleurisy, pulmonary embolism, and pericarditis.",
    associatedRuleOuts: ["Pulmonary Embolism", "Pericarditis", "Pleurisy"],
    lrNegative: 0.30
  },
  {
    id: "no_leg_swelling",
    symptomId: "unilateral_leg_swelling",
    label: "No Unilateral Leg Swelling / DVT Signs",
    category: "RES",
    description: "Lack of asymmetric calf swelling lowers Well's score for DVT / PE.",
    associatedRuleOuts: ["Deep Vein Thrombosis", "Pulmonary Embolism"],
    lrNegative: 0.25
  },

  // Neurological
  {
    id: "no_stiff_neck",
    symptomId: "nuchal_rigidity",
    label: "No Neck Stiffness / Nuchal Rigidity",
    category: "NEU",
    description: "Absence of meningismus / stiff neck lowers probability of bacterial meningitis.",
    associatedRuleOuts: ["Bacterial Meningitis", "Subarachnoid Hemorrhage"],
    lrNegative: 0.12
  },
  {
    id: "no_altered_mental_status",
    symptomId: "altered_mental_status",
    label: "No Altered Mental Status / Confusion",
    category: "NEU",
    description: "Rules down severe encephalopathy, sepsis-associated delirium, and acute stroke.",
    associatedRuleOuts: ["Meningitis", "Sepsis", "Acute Stroke"],
    lrNegative: 0.20
  },
  {
    id: "no_focal_deficit",
    symptomId: "focal_neurological_deficit",
    label: "No Focal Weakness or Facial Droop",
    category: "NEU",
    description: "Absence of focal neurological deficits reduces stroke/TIA risk dramatically.",
    associatedRuleOuts: ["Acute Ischemic Stroke", "Intracranial Hemorrhage"],
    lrNegative: 0.15
  },

  // Gastrointestinal
  {
    id: "no_vomiting_blood",
    symptomId: "vomiting_blood",
    label: "No Hematemesis (Vomiting Blood)",
    category: "GI",
    description: "Rules out severe upper GI bleeding, Mallory-Weiss tears, and esophageal varices.",
    associatedRuleOuts: ["Upper GI Bleed", "Esophageal Varices"],
    lrNegative: 0.10
  },
  {
    id: "no_melena",
    symptomId: "melena",
    label: "No Dark / Black Tarry Stools (Melena)",
    category: "GI",
    description: "Absence of melena or hematochezia rules down active gastrointestinal hemorrhage.",
    associatedRuleOuts: ["Peptic Ulcer Bleed", "GI Hemorrhage"],
    lrNegative: 0.18
  },
  {
    id: "no_guarding",
    symptomId: "abdominal_guarding",
    label: "No Abdominal Guarding / Rigidity",
    category: "GI",
    description: "Lack of involuntary guarding rules out acute peritonitis and visceral perforation.",
    associatedRuleOuts: ["Peritonitis", "Bowel Perforation", "Acute Appendicitis"],
    lrNegative: 0.15
  },

  // General & Systemic
  {
    id: "no_fever",
    symptomId: "gen_fever",
    label: "No Fever or Chills",
    category: "GEN",
    description: "Absence of pyrexia lowers likelihood of active acute infection or bacteremia.",
    associatedRuleOuts: ["Sepsis", "Pneumonia", "Pyelonephritis", "Infectious Endocarditis"],
    lrNegative: 0.35
  },
  {
    id: "no_weight_loss",
    symptomId: "unintentional_weight_loss",
    label: "No Unintentional Weight Loss",
    category: "GEN",
    description: "Absence of systemic B-symptoms reduces likelihood of occult malignancy or chronic infection.",
    associatedRuleOuts: ["Lymphoma", "Occult Malignancy", "Tuberculosis"],
    lrNegative: 0.40
  },

  // Renal & Genitourinary
  {
    id: "no_dysuria",
    symptomId: "dysuria",
    label: "No Painful Urination (Dysuria)",
    category: "GU",
    description: "Rules down acute cystitis, urethritis, and lower urinary tract infection.",
    associatedRuleOuts: ["Urinary Tract Infection", "Acute Cystitis"],
    lrNegative: 0.20
  }
];

export function getSuggestedRuleOutsForSymptoms(activeSymptomIds: string[]): PertinentNegativeItem[] {
  if (!activeSymptomIds || activeSymptomIds.length === 0) {
    return PERTINENT_NEGATIVES_LIBRARY.slice(0, 6);
  }

  // Find relevant rule-outs based on category or active presentation
  const suggested = PERTINENT_NEGATIVES_LIBRARY.filter(item => {
    // If the patient already has this symptom as positive, don't suggest its negative
    const alreadyPositive = activeSymptomIds.some(id => id.includes(item.symptomId) || item.symptomId.includes(id));
    if (alreadyPositive) return false;

    // Suggest matching cardiovascular negatives if patient has chest pain
    if (activeSymptomIds.some(id => id.includes('chest') || id.includes('cardio') || id.includes('angina')) && item.category === 'CVS') {
      return true;
    }
    // Suggest respiratory negatives if patient has dyspnea or cough
    if (activeSymptomIds.some(id => id.includes('cough') || id.includes('breath') || id.includes('resp') || id.includes('pulm')) && item.category === 'RES') {
      return true;
    }
    // Suggest neuro negatives if headache or dizziness
    if (activeSymptomIds.some(id => id.includes('headache') || id.includes('neuro') || id.includes('dizziness')) && item.category === 'NEU') {
      return true;
    }
    // Suggest GI negatives if abdominal pain or nausea
    if (activeSymptomIds.some(id => id.includes('abd') || id.includes('gi') || id.includes('stomach') || id.includes('nausea')) && item.category === 'GI') {
      return true;
    }
    return false;
  });

  if (suggested.length < 4) {
    // Fill up with high yield general ones
    const defaults = PERTINENT_NEGATIVES_LIBRARY.filter(i => !suggested.some(s => s.id === i.id));
    return [...suggested, ...defaults].slice(0, 8);
  }

  return suggested.slice(0, 8);
}
