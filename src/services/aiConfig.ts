/**
 * Centralized AI Prompt Management
 * This file contains all system instructions and prompts used throughout the application.
 */

export const AI_CONFIG = {
  SYSTEM_INSTRUCTIONS: {
    DEFAULT: "You are an advanced medical AI assistant designed to help doctors and healthcare professionals. Provide accurate, helpful, and concise insights. Always remind users that your advice does not replace professional medical judgment.",
    CLINICAL_TONE: {
      PROFESSIONAL: "Use professional medical terminology. Assume you are speaking peer-to-peer with another doctor.",
      PATIENT_FRIENDLY: "Use patient-friendly language. Explain complex conditions in simple terms so the doctor can read it directly to the patient."
    },
    DETAIL_LEVEL: {
      CONCISE: "Provide very concise, bulleted summaries. Get straight to the point. This is for quick lookups during a patient visit.",
      COMPREHENSIVE: "Provide comprehensive, deep-dive explanations. Include differential diagnoses, potential mechanisms, and citations or guidelines where applicable."
    }
  }
};

/**
 * Generates the system instruction for the Ask AI feature.
 */
export function getAskAiSystemInstruction(settings: { detailLevel: string, clinicalTone: string, specialty: string }, patientContext?: string) {
  let instruction = AI_CONFIG.SYSTEM_INSTRUCTIONS.DEFAULT;

  if (settings.detailLevel === 'concise') {
    instruction += `\n\n${AI_CONFIG.SYSTEM_INSTRUCTIONS.DETAIL_LEVEL.CONCISE}`;
  } else {
    instruction += `\n\n${AI_CONFIG.SYSTEM_INSTRUCTIONS.DETAIL_LEVEL.COMPREHENSIVE}`;
  }

  if (settings.clinicalTone === 'professional') {
    instruction += `\n\n${AI_CONFIG.SYSTEM_INSTRUCTIONS.CLINICAL_TONE.PROFESSIONAL}`;
  } else {
    instruction += `\n\n${AI_CONFIG.SYSTEM_INSTRUCTIONS.CLINICAL_TONE.PATIENT_FRIENDLY}`;
  }

  instruction += `\n\nYour primary specialty focus is: ${settings.specialty}. Tailor your advice and insights from this perspective.`;

  if (patientContext) {
    instruction += `\n\nCURRENT PATIENT CONTEXT:\n${patientContext}\n\nPlease use this patient context to provide personalized and relevant medical insights when answering the user's questions.`;
  }

  return instruction;
}

/**
 * Generates a prompt for generating a structured medical prescription.
 */
export function getGeneratePrescriptionPrompt(patientData: {
  name: string;
  age: string;
  gender: string;
  allergies: string;
  history: string;
  diagnosis: string;
  existingMedications: string;
}) {
  return `As a clinical assistant, generate a structured medical prescription based on the following patient information and diagnosis.
      
      Patient: ${patientData.name}
      Age: ${patientData.age}
      Gender: ${patientData.gender}
      Weight: [Not provided]
      Allergies: ${patientData.allergies}
      Symptoms: [Not provided]
      Physical Exam: [Not provided]
      Lab Findings: [Not provided]
      Renal/Hepatic Impairment: [Not provided]
      
      Patient History Summary:
      ${patientData.history}
      
      Confirmed Diagnosis: ${patientData.diagnosis}
      Existing Medications: ${patientData.existingMedications}
      
      Rules:
      1. The prescription must be medically logical and evidence-based.
      2. Adjust drug dose according to age, weight, sex, allergies, symptoms, physical exam, lab findings, final diagnosis, and renal/hepatic impairment if provided.
      3. Avoid drug interactions.
      4. Prefer first-line guideline-recommended therapies.
      5. Include symptomatic treatment and supportive therapy (fluids/vitamins/supplements) if needed.
      6. Provide alternatives if the first option is contraindicated.
      7. Check for contraindications and avoid unsafe combinations.
      8. Suggest between 3 and 5 appropriate medications. You MUST suggest at least 3 and at most 5 medications.

      Return the suggestions as a JSON array of objects with:
      - medication: string (name)
      - concentration: string (e.g., 500mg, 125mg/5ml)
      - form: string (e.g., Tablet, Capsule)
      - dosage: string (suggested dose)
      - frequency: string (e.g., Daily, BID)
      - duration: string (e.g., 7 days)
      - clinicalInstructions: string (specific instructions for the patient, e.g., Take after meals, Avoid alcohol)
      - reasoning: string (brief clinical reasoning, including contraindication checks and interaction avoidance)
      
      Only return the JSON array.`;
}

/**
 * Generates a prompt for differential diagnosis analysis.
 */
export function getDifferentialDiagnosisPrompt(patient: { name: string, age: number | string, gender: string }, clinicalData: {
  symptoms: string[];
  examFindings: string[];
  vitals: any;
  labResults: string[];
}) {
  return `
        Act as an expert clinical diagnostician. Analyze the following patient data and provide a differential diagnosis.
        
        Patient: ${patient.name}, ${patient.age} years old, ${patient.gender}
        
        Symptoms: ${clinicalData.symptoms.join(", ")}
        Physical Exam: ${clinicalData.examFindings.join(", ")}
        Vitals: BP ${clinicalData.vitals.bp}, HR ${clinicalData.vitals.hr}, Temp ${clinicalData.vitals.temp}°C, RR ${clinicalData.vitals.rr}, SpO2 ${clinicalData.vitals.spo2}% (${clinicalData.vitals.oxygenType === 'oxygen_supply' ? `Oxygen Supply: ${clinicalData.vitals.oxygenDose} ${clinicalData.vitals.oxygenInvasive} - Type: ${clinicalData.vitals.oxygenDeviceType}, Settings: ${clinicalData.vitals.oxygenInvasive === 'invasive' ? `FiO2: ${clinicalData.vitals.fio2}, PEEP: ${clinicalData.vitals.peep}, PS: ${clinicalData.vitals.pressureSupport}` : `Flow: ${clinicalData.vitals.flowRate}`}, Notes: ${clinicalData.vitals.notes}` : 'Room Air'})
        Labs/Imaging: ${clinicalData.labResults.join(", ")}

        Return a JSON object with the following structure:
        {
          "top_diagnosis": {
            "condition": "Name of condition",
            "probability": number (0-100),
            "icd10": "ICD-10 code",
            "reasoning": "Detailed clinical reasoning...",
            "recommendations": ["Next step 1", "Next step 2"],
            "red_flags": ["Critical warning 1"]
          },
          "differentials": [
            {
              "condition": "Name",
              "probability": number,
              "icd10": "Code",
              "reasoning": "Why this is possible but less likely..."
            }
          ],
          "missing_info": ["Key missing data point 1"]
        }
        Only return the JSON object.`;
}

/**
 * Generates a prompt for SOAP note generation.
 */
export function getSoapNotePrompt(patientName: string, clinicalData: {
  symptoms: string[];
  examFindings: string[];
  labResults: string[];
}, selectedDiagnosis: { description: string } | null, reasoning: string) {
  return `
        Generate a structured clinical SOAP note for patient ${patientName}.
        Symptoms: ${clinicalData.symptoms.join(", ")}
        Exam Findings: ${clinicalData.examFindings.join(", ")}
        Lab Results: ${clinicalData.labResults.join(", ")}
        Final Diagnosis: ${selectedDiagnosis ? selectedDiagnosis.description : "Not finalized"}
        Clinical Reasoning: ${reasoning}
        
        Format as:
        S: Subjective (Symptoms)
        O: Objective (Exam, Vitals, Labs)
        A: Assessment (Diagnosis, Reasoning)
        P: Plan (Recommendations)
      `;
}

/**
 * Generates a prompt for patient education summary.
 */
export function getPatientEducationPrompt(diagnosisDescription: string) {
  return `
        Generate a plain-language patient education sheet for the condition: ${diagnosisDescription}.
        Include:
        1. Simple explanation of the condition.
        2. Expected recovery timeline.
        3. Red flags (when to seek emergency care).
      `;
}

/**
 * Generates a prompt for suggesting an alternative medication.
 */
export function getAlternativeMedicationPrompt(medication: string, diagnosis: string, patientData: {
  name: string;
  age: string;
  gender: string;
  allergies: string;
}) {
  return `As a clinical assistant, provide an alternative medication for ${medication} for a patient with diagnosis: ${diagnosis}.
      Patient: ${patientData.name}
      Age: ${patientData.age}
      Gender: ${patientData.gender}
      Weight: [Not provided]
      Allergies: ${patientData.allergies}
      Renal/Hepatic Impairment: [Not provided]
      
      Rules:
      1. Provide a medically logical and evidence-based alternative.
      2. The alternative MUST be in the same therapeutic category as ${medication}.
      3. Adjust drug dose according to patient context (age, weight, allergies, renal/hepatic function).
      4. Avoid drug interactions.
      5. Provide reasoning.
      
      Return the response as a JSON object with:
      - medication: string (name)
      - concentration: string (e.g., 500mg, 125mg/5ml)
      - form: string (e.g., Tablet, Capsule)
      - dosage: string (suggested dose)
      - frequency: string (e.g., Daily, BID)
      - duration: string (e.g., 7 days)
      - clinicalInstructions: string (specific instructions for the patient)
      - reasoning: string (brief clinical reasoning)
      
      Only return the JSON object.`;
}

/**
 * Generates a prompt for checking drug-drug interactions.
 */
export function getInteractionCheckPrompt(medications: string[]) {
  return `Check for potential drug-drug interactions between the following medications: ${medications.join(", ")}.
  Return a JSON array of strings, where each string is a brief description of a potential interaction. If no interactions are found, return an empty array.
  Only return the JSON array.`;
}
