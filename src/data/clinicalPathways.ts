export interface ClinicalPathwayRule {
  id: string;
  title: string;
  description: string;
  conditions: {
    symptomIds?: string[];
    patientAgeMin?: number;
    patientAgeMax?: number;
    patientGender?: 'male' | 'female' | 'other';
    requiredAnalysisData?: Record<string, string[]>; // e.g., { severity: ['severe'] }
    hasRedFlag?: boolean;
    requiredChronicConditions?: string[];
    requiredMedications?: string[];
  };
  actions: {
    triageLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    alertMessage?: string;
  };
}

export const CLINICAL_PATHWAYS: ClinicalPathwayRule[] = [
  {
    id: "diabetic_ketoacidosis_risk",
    title: "DKA Risk Assessment",
    description: "Nausea and vomiting in a patient with Type 1 Diabetes.",
    conditions: {
      symptomIds: ["vomiting", "nausea"],
      requiredChronicConditions: ["Diabetes Type 1", "Diabetes"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Check blood glucose levels",
        "Check urine ketones",
        "Assess for fruity breath odor",
        "Immediate IV fluids if ketones positive"
      ],
      alertMessage: "CRITICAL: High risk for Diabetic Ketoacidosis (DKA)."
    }
  },
  {
    id: "anticoagulant_head_injury",
    title: "Anticoagulant Head Injury Protocol",
    description: "Headache or dizziness in a patient on blood thinners.",
    conditions: {
      symptomIds: ["headache_migraine", "head_dizziness_vertigo"],
      requiredMedications: ["Warfarin", "Apixaban", "Rivaroxaban", "Aspirin", "Clopidogrel"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Urgent Non-contrast CT Head",
        "Check INR (if on Warfarin)",
        "Neurological observations every 15 mins",
        "Assess for reversal agents if hemorrhage found"
      ],
      alertMessage: "CRITICAL: High risk for intracranial hemorrhage due to anticoagulation."
    }
  },
  {
    id: "heart_failure_exacerbation",
    title: "Heart Failure Exacerbation",
    description: "Shortness of breath in a patient with known Heart Failure.",
    conditions: {
      symptomIds: ["lungs_shortness_of_breath"],
      requiredChronicConditions: ["Heart Failure", "CHF", "Congestive Heart Failure"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Assess for peripheral edema",
        "Check for JVD (Jugular Venous Distension)",
        "Auscultate for lung crackles",
        "BNP level and Chest X-ray"
      ],
      alertMessage: "WARNING: Potential acute decompensated heart failure."
    }
  },
  {
    id: "anaphylaxis_risk",
    title: "Anaphylaxis Alert",
    description: "Sudden onset of respiratory distress with skin symptoms.",
    conditions: {
      symptomIds: ["lungs_shortness_of_breath", "hives_urticaria"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Administer Epinephrine 0.3mg IM immediately",
        "Maintain airway and provide supplemental oxygen",
        "IV fluid resuscitation",
        "Administer antihistamines and corticosteroids"
      ],
      alertMessage: "CRITICAL: Potential Anaphylaxis. Life-threatening emergency."
    }
  },
  {
    id: "meningitis_risk",
    title: "Acute Meningitis Protocol",
    description: "Fever, headache, and neck stiffness triad.",
    conditions: {
      symptomIds: ["gen_fever", "headache_migraine", "neck_pain_stiffness"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Immediate blood cultures",
        "Stat IV antibiotics (Ceftriaxone + Vancomycin)",
        "Urgent CT Head followed by Lumbar Puncture",
        "Droplet precautions"
      ],
      alertMessage: "CRITICAL: Suspected Bacterial Meningitis. Immediate intervention required."
    }
  },
  {
    id: "glaucoma_risk",
    title: "Acute Angle-Closure Glaucoma",
    description: "Severe eye pain with vision changes and nausea.",
    conditions: {
      symptomIds: ["eye_pain", "vision_blurring", "nausea"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Urgent ophthalmology consultation",
        "Measure intraocular pressure (IOP)",
        "Administer pressure-lowering eye drops",
        "Assess for fixed, mid-dilated pupil"
      ],
      alertMessage: "CRITICAL: Potential Acute Glaucoma. Risk of permanent vision loss."
    }
  },
  {
    id: "ectopic_pregnancy_risk",
    title: "Ectopic Pregnancy Screening",
    description: "Abdominal pain in a female of childbearing age.",
    conditions: {
      symptomIds: ["abdominal_pain"],
      patientGender: "female",
      patientAgeMin: 12,
      patientAgeMax: 50
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Stat urine or serum hCG (pregnancy test)",
        "Transvaginal ultrasound if hCG positive",
        "Assess for signs of shock (rupture)",
        "Surgical consultation if ectopic suspected"
      ],
      alertMessage: "WARNING: Abdominal pain in childbearing age. Must rule out ectopic pregnancy."
    }
  },
  {
    id: "appendicitis_risk",
    title: "Acute Appendicitis Protocol",
    description: "Abdominal pain with fever and nausea.",
    conditions: {
      symptomIds: ["abdominal_pain", "gen_fever", "nausea"]
    },
    actions: {
      triageLevel: "medium",
      recommendations: [
        "Assess for RLQ tenderness (McBurney's point)",
        "Check for rebound and guarding",
        "WBC count with differential",
        "Consider CT Abdomen/Pelvis or Ultrasound"
      ],
      alertMessage: "WARNING: Potential Acute Appendicitis. Surgical evaluation recommended."
    }
  },
  {
    id: "preeclampsia_risk",
    title: "Preeclampsia Alert",
    description: "Headache and vision changes in a pregnant patient.",
    conditions: {
      symptomIds: ["headache_migraine", "vision_blurring"],
      patientGender: "female",
      requiredChronicConditions: ["Pregnancy"]
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Immediate blood pressure measurement",
        "Check urine for protein (dipstick or 24h)",
        "Assess for RUQ pain or hyperreflexia",
        "Fetal monitoring and OB consultation"
      ],
      alertMessage: "CRITICAL: Suspected Preeclampsia. Risk of eclampsia/seizures."
    }
  },
  {
    id: "pulmonary_embolism_risk",
    title: "Pulmonary Embolism (PE) Protocol",
    description: "Sudden shortness of breath and chest pain.",
    conditions: {
      symptomIds: ["lungs_shortness_of_breath", "heart_chest_pain"],
      hasRedFlag: true
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Urgent CT Pulmonary Angiogram (CTPA)",
        "Check D-dimer (if low clinical probability)",
        "Assess for DVT signs (unilateral leg swelling)",
        "Start anticoagulation if suspicion is high and no contraindications"
      ],
      alertMessage: "CRITICAL: High suspicion for Pulmonary Embolism. Life-threatening condition."
    }
  },
  {
    id: "debug_pathway",
    title: "System Verification Pathway",
    description: "This pathway triggers when any symptom is selected to verify the Clinical Guardrails system is active.",
    conditions: {
      patientAgeMin: 0
    },
    actions: {
      triageLevel: "low",
      recommendations: [
        "System check complete",
        "Clinical guardrails are monitoring inputs"
      ]
    }
  },
  {
    id: "cardiac_risk_high",
    title: "High-Risk Cardiac Presentation",
    description: "Chest pain and shortness of breath in an older patient.",
    conditions: {
      symptomIds: ["heart_chest_pain", "lungs_shortness_of_breath"],
      patientAgeMin: 50
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Immediate 12-lead EKG",
        "Cardiac enzymes (Troponin)",
        "Continuous cardiac monitoring",
        "Aspirin (if not contraindicated)"
      ],
      alertMessage: "CRITICAL: High risk for ACS. Immediate EKG and stabilization required."
    }
  },
  {
    id: "stroke_risk_high",
    title: "Acute Neurological Deficit (Stroke Concern)",
    description: "Sudden onset of facial weakness or neurological symptoms.",
    conditions: {
      symptomIds: ["facial_weakness_paralysis", "headache_migraine"], // migraine can have neuro deficits but sudden weakness is stroke until proven otherwise
      hasRedFlag: true
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Activate Stroke Protocol",
        "Non-contrast CT Head",
        "Assess 'Time Last Known Well'",
        "Neurology consultation"
      ],
      alertMessage: "CRITICAL: Potential Stroke. Time-sensitive intervention required."
    }
  },
  {
    id: "cauda_equina_risk",
    title: "Cauda Equina Syndrome Concern",
    description: "Back pain with neurological deficits or saddle anesthesia.",
    conditions: {
      symptomIds: ["back_numbness"],
      requiredAnalysisData: {
        location: ["buttocks", "legs"]
      },
      hasRedFlag: true
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Urgent MRI Spine",
        "Neurosurgery consultation",
        "Bladder scan for post-void residual"
      ],
      alertMessage: "CRITICAL: Possible Cauda Equina Syndrome. Surgical emergency."
    }
  },
  {
    id: "sepsis_concern",
    title: "Sepsis Screening Triggered",
    description: "Fever with altered mental status or rapid breathing.",
    conditions: {
      symptomIds: ["tachypnea"],
      hasRedFlag: true
    },
    actions: {
      triageLevel: "high",
      recommendations: [
        "Lactate level",
        "Blood cultures x2",
        "IV Fluid resuscitation",
        "Broad-spectrum antibiotics"
      ],
      alertMessage: "CRITICAL: Sepsis suspected. Initiate sepsis bundle immediately."
    }
  },
  {
    id: "pediatric_dehydration",
    title: "Pediatric Dehydration Warning",
    description: "Vomiting/diarrhea in a young child with signs of dehydration.",
    conditions: {
      patientAgeMax: 5,
      symptomIds: ["vomiting", "diarrhea"],
      hasRedFlag: true
    },
    actions: {
      triageLevel: "medium",
      recommendations: [
        "Assess capillary refill time",
        "Check mucous membranes",
        "Trial of oral rehydration solution (ORS)",
        "Weight-based fluid calculation"
      ],
      alertMessage: "WARNING: High risk for rapid dehydration in pediatric patient."
    }
  },
  {
    id: "geriatric_fall_risk",
    title: "Geriatric Fall & Fracture Risk",
    description: "Dizziness or weakness in an elderly patient.",
    conditions: {
      patientAgeMin: 75,
      symptomIds: ["head_dizziness_vertigo", "msk_muscle_weakness"]
    },
    actions: {
      triageLevel: "medium",
      recommendations: [
        "Orthostatic vitals",
        "Medication review (polypharmacy)",
        "Home safety assessment",
        "Physical therapy referral"
      ]
    }
  }
];
