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
  let instruction = `[ENHANCED AI AWARENESS FRAMEWORK]
You are an advanced medical digital twin and clinical analyst assistant. 
Your primary goal is to provide exhaustive, data-aware insights based on the selected patient's full medical record.

Your specialty focus is: ${settings.specialty}. Tailor all responses from this perspective.

[OPERATIONAL GUIDELINES]
1. CONTEXT PRIORITIZATION: Always prioritize the provided [PATIENT CONTEXT] categories when formulating responses.
2. PROFESSIONALISM: ${settings.clinicalTone === 'professional' ? AI_CONFIG.SYSTEM_INSTRUCTIONS.CLINICAL_TONE.PROFESSIONAL : AI_CONFIG.SYSTEM_INSTRUCTIONS.CLINICAL_TONE.PATIENT_FRIENDLY}
3. DENSITY: ${settings.detailLevel === 'concise' ? AI_CONFIG.SYSTEM_INSTRUCTIONS.DETAIL_LEVEL.CONCISE : AI_CONFIG.SYSTEM_INSTRUCTIONS.DETAIL_LEVEL.COMPREHENSIVE}
4. PREDICTIVE MODELING: If the user initiates "Patient Twin Simulation", provide probabilistic outcomes based on physiological baselines and proposed interventions.
5. SAFETY: Always include relevant red flags and monitoring requirements for any recommended treatments.`;

  if (patientContext) {
    instruction += `\n\n[PATIENT CONTEXT]\n${patientContext}\n\nUse this data as the single source of truth for this patient encounter. Any recommendation, summary, or analysis must be specifically tailored to these records.`;
  } else {
    instruction += `\n\n[PATIENT CONTEXT]: No patient selected. Provide general evidence-based medical knowledge until a patient context is provided.`;
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
  weight?: string;
  symptoms?: string;
  physicalExam?: string;
  labFindings?: string;
  renalHepaticStatus?: string;
}) {
  return `As a clinical assistant, analyze the patient clinical data and generate a structured medical prescription assessment.

[PATIENT CLINICAL PROFILE]
Patient Name: ${patientData.name}
Age: ${patientData.age}
Gender: ${patientData.gender}
Weight: ${patientData.weight || "[Not provided]"}
Allergies: ${patientData.allergies}
Symptoms: ${patientData.symptoms || "[Not provided]"}
Physical Exam: ${patientData.physicalExam || "[Not provided]"}
Lab Findings: ${patientData.labFindings || "[Not provided]"}
Renal/Hepatic Status: ${patientData.renalHepaticStatus || "[Not provided]"}

Patient Medical History:
${patientData.history || "None reported"}

Confirmed Diagnosis: ${patientData.diagnosis}
Existing Medications: ${patientData.existingMedications || "None"}

[CLINICAL DATA SUFFICIENT CLASSIFICATION MANDATE]
1. STEP 1 - EVALUATE DATA SUFFICIENT VS INSUFFICIENT:
   - DATA SUFFICIENT: Required clinical parameters (age, weight if pediatric/geriatric, renal/hepatic function if indicated, allergy history, disease severity) are known well enough to safely select and dose medications.
   - DATA INSUFFICIENT: Critical parameters required for safe prescribing are missing (e.g. unknown weight in pediatric patient, missing renal function/creatinine for age >65 or nephrotoxic/renal-cleared drugs, unverified severe allergy status, or ambiguous disease severity).

2. STEP 2 - PRESCRIPTION GENERATION MANDATE:
   - Even if the status is classified as "INSUFFICIENT" (due to missing weight, renal function, or other parameters), you MUST STILL GENERATE the full structured prescription. Never leave the suggestions list empty.
   - The suggestions list MUST contain AT LEAST 3 or more medications/drugs that are relevant/indicated or reasonable empirical/symptom-relief treatments for the patient's condition/confirmed diagnosis (e.g., standard therapeutic combinations, symptomatic treatments, or supportive care).
   - Any suggested medications in INSUFFICIENT status must be flagged as PROVISIONAL and include explicit warnings regarding missing data in their reasoning.

Return a SINGLE valid JSON object with the following schema:
{
  "dataSufficiency": "SUFFICIENT" | "INSUFFICIENT",
  "dataSufficiencyReasoning": "Brief clinical reasoning explaining whether the available data is sufficient for safe prescribing.",
  "missingCriticalVariables": ["Array of specific missing parameters needed for safe dosing, e.g. 'Patient weight for pediatric dosing', 'Serum Creatinine/eGFR for renal dose adjustment'"],
  "suggestions": [
    {
      "medication": "string (generic or brand name)",
      "concentration": "string (e.g. 500mg, 125mg/5ml)",
      "form": "string (e.g. Tablet, Capsule, Suspension)",
      "dosage": "string (e.g. 500 mg)",
      "frequency": "string (e.g. BID, Q8H)",
      "duration": "string (e.g. 7 days)",
      "clinicalInstructions": "string (patient instructions)",
      "reasoning": "string (clinical reasoning & safety checks)"
    }
  ]
}

Return ONLY the JSON object.`;
}

/**
 * Generates a prompt for generating specific instructions for a single medication.
 */
export function getMedicationInstructionsPrompt(medication: string, context: {
  diagnosis: string;
  dosage: string;
  frequency: string;
  patientAllergies: string;
  formulation?: string;
  route?: string;
  renalFunction?: string;
  hepaticFunction?: string;
  age?: number | string;
  pregnancyStatus?: string;
  duration?: string;
}) {
  return `As an expert clinical pharmacologist and medical assistant, generate a comprehensive patient medication counseling and safety analysis JSON object for the following medication.

      Medication: ${medication}
      Formulation/Form: ${context.formulation || "Not specified"}
      Route of Administration: ${context.route || "Oral (assumed)"}
      Dosage: ${context.dosage}
      Frequency: ${context.frequency}
      Diagnosis (Indication): ${context.diagnosis}
      Duration: ${context.duration || "Not specified"}

      Patient Profile:
      Age: ${context.age || "Not specified"}
      Pregnancy Status: ${context.pregnancyStatus || "Not specified / Not pregnant"}
      Patient Allergies: ${context.patientAllergies}
      Renal Function/Labs: ${context.renalFunction || "Normal / No severe impairment documented"}
      Hepatic Function/Labs: ${context.hepaticFunction || "Normal / No severe impairment documented"}

      You must consider food interactions, administration timing, missed doses, and essential laboratory or clinical monitoring parameters specific to this drug class.

      Return ONLY a valid JSON object matching the following structure. Do NOT include markdown blocks, JSON syntax wrapping (such as \`\`\`json), or any surrounding text.

      {
        "administration": "Clear, precise patient-friendly administration instructions including timing, food relationship, and technique (e.g., 'Take 1 tablet by mouth daily in the morning with a full glass of water, ideally with food.')",
        "safetyWarnings": [
          "Crucial warning 1 (e.g., 'Avoid alcohol due to risk of liver stress')",
          "Crucial warning 2 (e.g., 'May cause extreme drowsiness; do not operate heavy machinery')"
        ],
        "monitoring": [
          "Monitoring parameter 1 (e.g., 'Requires blood pressure check twice weekly')",
          "Monitoring parameter 2 (e.g., 'Periodic lipid panel checks needed')"
        ],
        "missedDose": "Specific advice on what to do if a dose is missed (e.g., 'Take as soon as you remember, but skip if the next dose is less than 12 hours away. Do not double dose.')",
        "redFlags": [
          "Emergency symptom 1 (e.g., 'Sudden swelling of face, lips, or throat')",
          "Emergency symptom 2 (e.g., 'Unexplained muscle pain accompanied by fever')"
        ]
      }`;
}

/**
 * Generates a prompt for a comprehensive contraindication and clinical safety check.
 */
export function getContraindicationCheckPrompt(input: {
  medication: string;
  age?: number | string;
  allergies?: string;
  pregnancyStatus?: string;
  renalFunction?: string;
  hepaticFunction?: string;
  comorbidities?: string;
  currentMedications?: string[];
  vitals?: string;
  relevantLabs?: string;
}) {
  return `As an expert clinical safety and pharmacovigilance intelligence engine, perform a comprehensive contraindication and clinical safety check for the following drug prescription.

      Medication to Check: ${input.medication}

      Patient Context:
      - Age: ${input.age ?? "Not specified"}
      - Allergies: ${input.allergies ?? "None documented"}
      - Pregnancy/Lactation Status: ${input.pregnancyStatus ?? "Not specified / Not pregnant"}
      - Renal Function: ${input.renalFunction ?? "Normal / No severe impairment documented"}
      - Hepatic Function: ${input.hepaticFunction ?? "Normal / No severe impairment documented"}
      - Comorbidities / Chronic Conditions: ${input.comorbidities ?? "None documented"}
      - Active Home Medications: ${input.currentMedications?.join(", ") || "None"}
      - Vitals: ${input.vitals ?? "None documented"}
      - Laboratory Results: ${input.relevantLabs ?? "None documented"}

      Analyze the following clinical safety categories:
      1. Absolute Contraindications: Any severe, life-threatening reason why this drug must not be given (e.g., severe renal failure, previous anaphylaxis, absolute pregnancy contraindication like Retinoids/ACE Inhibitors, drug-drug contraindications like Sildenafil + Nitrates).
      2. Warnings & Relative Contraindications: Moderate or major cautions requiring close monitoring, dose modification, or high vigilance (e.g., geriatric high risk, potential allergy cross-reactivity, moderate renal/hepatic impairment).
      3. Missing Critical Data: Any clinical laboratory or patient assessment data that is highly recommended to be checked before prescribing this medication (e.g., checking potassium before ACE inhibitors, checking liver enzymes before statins, checking pregnancy test for women of childbearing potential).

      Return ONLY a valid JSON object matching the following structure. Do NOT include markdown blocks, JSON syntax wrapping (such as \`\`\`json), or any surrounding text.

      {
        "safe": true, // boolean (false if any serious/absolute contraindications exist, true otherwise)
        "severity": "NONE", // "NONE", "MINOR", "MODERATE", or "MAJOR"
        "contraindications": [], // Array of strings detailing absolute contraindications
        "warnings": [], // Array of strings detailing clinical warnings / cautions
        "requiredData": [] // Array of strings detailing missing or recommended lab tests/assessments before/during therapy
      }`;
}

/**
 * Generates a prompt for a comprehensive multi-stage clinical prescription safety validation.
 */
export function getMultiStageSafetyValidationPrompt(input: {
  medications: Array<{
    id: string;
    medication: string;
    form?: string;
    concentration?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }>;
  patient: {
    name: string;
    age?: number | string;
    gender?: string;
    allergies?: string;
    chronicConditions?: string[];
    homeMedications?: string[];
    vitals?: string;
    renalFunction?: string;
    hepaticFunction?: string;
    relevantLabs?: string;
  };
  diagnosis: string;
}) {
  const medsFormatted = input.medications
    .map(
      (m, idx) =>
        `${idx + 1}. Name: ${m.medication} | Form: ${m.form || "N/A"} | Concentration: ${m.concentration || "N/A"} | Dosage: ${m.dosage || "N/A"} | Frequency: ${m.frequency || "N/A"} | Duration: ${m.duration || "N/A"}`
    )
    .join("\n");

  return `As an expert clinical pharmacologist and safety automation engine, perform a rigorous, multi-stage clinical safety and dose-validation audit for the following proposed prescription list.

      Patient: ${input.patient.name} (${input.patient.age || "N/A"} y/o, ${input.patient.gender || "N/A"})
      Primary Final Diagnosis: ${input.diagnosis}
      Documented Allergies: ${input.patient.allergies || "None reported"}
      Chronic Conditions / Comorbidities: ${input.patient.chronicConditions?.join(", ") || "None documented"}
      Current Active Home Medications: ${input.patient.homeMedications?.join(", ") || "None"}
      Vitals: ${input.patient.vitals || "Not specified"}
      Renal Indicators: ${input.patient.renalFunction || "Normal / No severe impairment reported"}
      Hepatic Indicators: ${input.patient.hepaticFunction || "Normal / No severe impairment reported"}
      Lab Findings: ${input.patient.relevantLabs || "None reported"}

      Proposed Prescription Items:
      ${medsFormatted}

      Execute the 7-stage Clinical Safety Validation Pipeline exactly. 
      For STAGES 1 through 6, you MUST perform a systematic Evidence Hierarchy assessment:
      1. Define the precise Clinical Question being asked.
      2. Document the exact Clinical Evidence / Guideline parameter retrieved from your internal corpus of peer-reviewed medicine and FDA specifications.
      3. Perform step-by-step Clinical Reasoning linking this retrieved parameter directly to the patient's demographics, vitals, labs, and comorbidities.
      4. Formulate the clinical Recommendation.
      5. Provide verified, non-hallucinated Citations (specific guidelines, clinical studies, or official prescribing monographs) that serve as the direct source of authority for this reasoning.

      STAGE 1: Dose Validation
      - Check each medication's dose, frequency, and duration.
      - Are these parameters safe for the patient's age and weight?
      - Note any pediatric, geriatric, or weight-based over-dosage or sub-therapeutic dosing.

      STAGE 2: Interaction Check
      - Inspect for drug-drug interactions among the proposed drugs, and between the proposed drugs and the active home medications.
      - Highlight major and moderate interactions.

      STAGE 3: Contraindication Check
      - Check for absolute drug-disease contraindications against the primary diagnosis and all comorbidities.

      STAGE 4: Allergy Check
      - Check if any drug or its chemical class has cross-reactivity with the patient's documented allergies.

      STAGE 5: Renal/Hepatic Adjustment
      - Inspect the labs/indicators for renal (e.g. eGFR, creatinine) or hepatic (e.g. ALT, AST, bilirubin) impairment.
      - State whether any proposed medication requires a dose reduction, alternative formulation, or is completely contraindicated.

      STAGE 6: Duplicate Therapy Check
      - Determine if there is any overlapping therapeutic class or double prescribing (e.g., prescribing two different NSAIDs, two ACE inhibitors, etc.).

      STAGE 7: Final Clinical Status
      - Synthesize all checks. Decide if this prescription is medically SAFE to sign-off, requires WARNINGS / MODIFICATIONS, or is strictly BLOCKED due to life-threatening risk.

      Return ONLY a valid JSON object matching the following structure. Do not include markdown blocks like \`\`\`json, backticks, or any conversational text.

      {
        "doseValidation": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "What is the maximum therapeutic daily dose of X for age/weight Y?",
          "evidenceRetrieved": "FDA approved standard dosing guidelines for X...",
          "clinicalReasoning": "Comparing patient's dose Z with standard limits, we find...",
          "recommendation": "Maintain dose or reduce to...",
          "citations": [
            { "source": "FDA Prescribing Information for [Drug]", "url": "Official search or registry link", "description": "Section 2.1: Dosage guidelines" }
          ]
        },
        "interactions": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "Does coadministration of drug A and drug B present clinical hazard?",
          "evidenceRetrieved": "Pharmacokinetic / CYP450 metabolism profiles or therapeutic synergism parameters...",
          "clinicalReasoning": "Patient takes drug A which inhibits CYP3A4, causing increased levels of drug B...",
          "recommendation": "Separate dosing, adjust dose, or substitute...",
          "citations": [
            { "source": "Lexicomp/Micromedex Interactions Index", "url": "Official search or registry link", "description": "Major interaction warning on class synergy" }
          ]
        },
        "contraindications": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "Are any of the proposed drugs contraindicated in patients with [Diagnosis/chronicConditions]?",
          "evidenceRetrieved": "AHA/ACC, ADA, or standard specialty society guidelines on disease contraindications...",
          "clinicalReasoning": "Using drug X in a patient with condition Y causes severe exacerbation because...",
          "recommendation": "Avoid drug X; substitute with safe alternative...",
          "citations": [
            { "source": "AHA Heart Failure Management Guidelines", "url": "Official search or registry link", "description": "Class III recommendation against using NSAIDs in Stage C/D HF" }
          ]
        },
        "allergies": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "Do any prescribed substances cross-react with reported patient allergies?",
          "evidenceRetrieved": "Chemical structure, hapten conjugation, and allergic cross-reactivity literature...",
          "clinicalReasoning": "The patient is allergic to sulfa; drug Z contains a sulfonamide moiety which presents a cross-reactivity risk of...",
          "recommendation": "Discontinue drug Z, substitute with...",
          "citations": [
            { "source": "ACAAI Allergic Cross-Reactivity Position Statement", "url": "Official search or registry link", "description": "Allergy practice parameters on sulfonamide cross-reactivity" }
          ]
        },
        "renalHepatic": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "Does the patient's renal indicators (eGFR/creatinine) or hepatic indicators require dosage adjustments?",
          "evidenceRetrieved": "KDIGO renal dosing clinical trials, Child-Pugh class pharmacokinetic adjustments...",
          "clinicalReasoning": "Patient's eGFR is [val], which is Stage [stage] renal impairment. Drug X clearance is predominantly renal and standard guidelines suggest...",
          "recommendation": "Reduce dose of drug X by 50% or prolong interval...",
          "citations": [
            { "source": "KDIGO Clinical Practice Guideline for CKD Dosing", "url": "Official search or registry link", "description": "Table 4: Dosage adjustments based on eGFR categories" }
          ]
        },
        "duplicateTherapy": {
          "status": "PASSED" | "WARNING" | "FAILED",
          "clinicalQuestion": "Do the proposed drugs present redundant therapeutic classes or mechanism overlap?",
          "evidenceRetrieved": "ATC (Anatomical Therapeutic Chemical) class and pharmacodynamic mechanisms...",
          "clinicalReasoning": "Both Drug A and Drug B are NSAIDs. Co-prescribing multiple NSAIDs increases GI bleeding risk without therapeutic synergy...",
          "recommendation": "Deselect Drug A or Drug B; use monotherapy for pain control...",
          "citations": [
            { "source": "ASHP Guidelines on Duplicate Therapy Prevention", "url": "Official search or registry link", "description": "Section 4.2: Therapeutic duplication criteria" }
          ]
        },
        "finalVerdict": {
          "safe": boolean,
          "decision": "APPROVED" | "CAUTION_REQUIRED" | "BLOCKED",
          "clinicalSummary": "Comprehensive concise clinical justification summarizing the final action needed"
        }
      }`;
}

/**
 * Generates a prompt for generating general prescription notes / patient advice.
 */
export function getPrescriptionNotesPrompt(prescription: {
  medications: string[];
  diagnosis: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientAllergies?: string;
  patientChronicConditions?: string;
  vitals?: string;
}) {
  return `Review the patient's data, and prescribed medications.

Patient Name: ${prescription.patientName}
Patient Age: ${prescription.patientAge || "Not specified"}
Patient Gender: ${prescription.patientGender || "Not specified"}
Diagnosis: ${prescription.diagnosis}
Allergies: ${prescription.patientAllergies || "None documented"}
Chronic Conditions / Comorbidities: ${prescription.patientChronicConditions || "None documented"}
Vitals: ${prescription.vitals || "Not documented"}

Prescribed Medications:
${prescription.medications.join("\n")}

Generate ONLY the required laboratory monitoring tests for the prescribed medications.

For each laboratory test provide:
1. Test Name
2. Monitoring Frequency
3. Brief Clinical Reason (1 sentence maximum)

Format will be as the following example:
1. HbA1c: Baseline and every 3–6 months to assess glycemic control.
2. Renal Function (eGFR/Serum Creatinine): Baseline and annually; monitor kidney function and determine whether medication dose adjustment is required.
3. Vitamin B12: Annually during long-term therapy to monitor for medication-associated deficiency.

Rules:
- Include only clinically indicated laboratory tests.
- Consolidate duplicate monitoring requirements from multiple medications.
- Consider patient-specific factors such as age, renal impairment, hepatic impairment, diabetes, heart failure, pregnancy, and other comorbidities.
- Prioritize the most important monitoring tests.
- Do not provide medication recommendations.
- Do not provide treatment plans.
- Do not explain your reasoning.
- Return ONLY the monitoring list in the format shown above, with no extra text.`;
}

/**
 * Generates a prompt for differential diagnosis analysis.
 */
export function getDifferentialDiagnosisPrompt(
  patient: { name: string, age: number | string, gender: string, chronicConditions?: string[] }, 
  clinicalData: {
    symptoms: string[];
    examFindings: string[];
    vitals: any;
    labResults: string[];
    currentMedications?: string[];
    labTrends?: string;
  }
) {
  return `
        Act as an expert clinical diagnostician. Analyze the following patient data and provide a differential diagnosis.
        
        Patient: ${patient.name}, ${patient.age} years old, ${patient.gender}
        Known Chronic Conditions: ${patient.chronicConditions?.join(", ") || "None documented"}
        
        Symptoms: ${clinicalData.symptoms.join(", ")}
        Physical Exam: ${clinicalData.examFindings.join(", ")}
        Vitals: BP ${clinicalData.vitals.bp}, HR ${clinicalData.vitals.hr}, Temp ${clinicalData.vitals.temp}°C, RR ${clinicalData.vitals.rr}, SpO2 ${clinicalData.vitals.spo2}% (${clinicalData.vitals.oxygenType === 'oxygen_supply' ? `Oxygen Supply: ${clinicalData.vitals.oxygenDose} ${clinicalData.vitals.oxygenInvasive} - Type: ${clinicalData.vitals.oxygenDeviceType}, Settings: ${clinicalData.vitals.oxygenInvasive === 'invasive' ? `FiO2: ${clinicalData.vitals.fio2}, PEEP: ${clinicalData.vitals.peep}, PS: ${clinicalData.vitals.pressureSupport}` : `Flow: ${clinicalData.vitals.flowRate}`}, Notes: ${clinicalData.vitals.notes}` : 'Room Air'})
        
        Current Lab Results: ${clinicalData.labResults.join(", ")}
        ${clinicalData.labTrends ? `Lab Trends/History: ${clinicalData.labTrends}` : ""}
        
        Current Medications: ${clinicalData.currentMedications?.join(", ") || "None documented"}

        Analysis Instructions:
        1. Consider potential side effects or drug-induced symptoms of the current medications.
        2. Evaluate the current lab results in the context of recent trends provided (e.g., changes over time).
        3. Correlate symptoms and exam findings with known chronic conditions.
        
        Return a JSON object with the following structure:
        {
          "top_diagnosis": {
            "condition": "Name of condition",
            "likelihood": "Very High" | "High" | "Moderate" | "Low" | "Very Low",
            "evidenceStrength": "Strong" | "Moderate" | "Weak",
            "supportingFeatures": ["Array of symptoms, signs, or lab findings supporting this diagnosis"],
            "contradictingFeatures": ["Array of symptoms or clinical markers that conflict with or weaken this diagnosis"],
            "missingFeatures": ["Array of diagnostics, labs, or clinical findings needed to fully confirm or rule out"],
            "probability": number (0-100, estimated equivalent based on likelihood and evidence strength, e.g. Very High is 85-95, High is 70-80, Moderate is 40-60, Low is 15-30, Very Low is <15),
            "icd10": "ICD-10 code",
            "reasoning": "Detailed clinical reasoning. You MUST include a section titled '### Summary of Clinical Approach' containing a Markdown table with columns: | Step | Rational | Severity |.",
            "recommendations": ["Next step 1", "Next step 2"],
            "red_flags": ["Critical warning 1"],
            "references": [
              { "title": "Resource Name (e.g. PubMed: Pneumonia Guidelines)", "url": "Search URL or direct link" }
            ]
          },
          "differentials": [
            {
              "condition": "Name",
              "likelihood": "Very High" | "High" | "Moderate" | "Low" | "Very Low",
              "evidenceStrength": "Strong" | "Moderate" | "Weak",
              "supportingFeatures": ["Array of supporting points"],
              "contradictingFeatures": ["Array of contradicting or conflicting points"],
              "missingFeatures": ["Array of missing pieces of evidence needed"],
              "probability": number (0-100),
              "icd10": "Code",
              "reasoning": "Why this is possible but less likely...",
              "references": [{ "title": "Resource Name", "url": "URL" }]
            }
          ],
          "missing_info": ["Key missing data point 1"]
        }
        Only return the JSON object.`;
}

/**
 * Generates a prompt for SOAP note generation.
 */
export function getSoapNotePrompt(patientOrName: any, clinicalData: {
  symptoms: string[];
  examFindings: string[];
  labResults: string[];
}, selectedDiagnosis: { description: string } | null, reasoning: string, extraContext?: string) {
  let patientProfileText = "";
  if (typeof patientOrName === 'object' && patientOrName !== null) {
    const p = patientOrName;
    const allergies = p.allergies?.map((a: any) => `${a.name}${a.severity ? ` (${a.severity})` : ''}`).join(', ') || 'No known drug allergies (NKDA)';
    const chronic = p.chronicConditions?.join(', ') || 'None documented';
    const meds = p.medications?.map((m: any) => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`).join(', ') || 'None active';
    const vitals = p.vitalsHistory?.[0] ? `BP ${p.vitalsHistory[0].bloodPressure}, HR ${p.vitalsHistory[0].heartRate} bpm, Weight ${p.vitalsHistory[0].weight} kg` : 'Not recorded';
    const labs = p.labResults?.map((l: any) => `${l.labName}: ${l.value} ${l.unit}`).join('; ') || 'None';

    patientProfileText = `[PATIENT PROFILE CONTEXT]
Patient Name: ${p.name}
Age: ${p.age} years | Gender: ${p.gender} | MRN: ${p.mrn || 'N/A'} | Blood Type: ${p.bloodType || 'N/A'}
Known Allergies: ${allergies}
Chronic Conditions: ${chronic}
Active Medications: ${meds}
Latest Vital Signs: ${vitals}
Recent Laboratory Results: ${labs}`;
  } else {
    patientProfileText = `Patient Name: ${patientOrName}`;
  }

  return `
        You are an advanced AI Clinical Scribe. Generate a professional, highly detailed, patient-aware clinical SOAP note for the encounter.

        ${patientProfileText}
        ${extraContext ? `\nExtra Clinical Context:\n${extraContext}` : ""}

        ENCOUNTER FINDINGS:
        Presenting Symptoms: ${clinicalData.symptoms.join(", ") || "None specified"}
        Physical Examination Findings: ${clinicalData.examFindings.join(", ") || "Unremarkable"}
        Laboratory & Diagnostic Tests: ${clinicalData.labResults.join(", ") || "None"}
        Final Diagnosis: ${selectedDiagnosis ? selectedDiagnosis.description : "Not finalized"}
        Physician Clinical Reasoning: ${reasoning || "Pending final clinical synthesis"}

        INSTRUCTIONS:
        1. Subjective: Integrate Chief Complaint, HPI, Review of Systems, and relevant chronic conditions/allergies/home medications.
        2. Objective: Integrate Vital Signs, physical exam findings, and lab values in medical terminology.
        3. Assessment: Synthesize the diagnosis with clinical rationale, considering patient age, comorbidities, and risk factors.
        4. Plan: Document the physician's established clinical decisions, follow-up parameters, and red-flag warning signs. Do NOT independently invent or propose new drug therapies or prescriptions unless they have been explicitly specified in the physician's clinical reasoning, encounter findings, or context. Focus on organizing, structuring, and documenting the plan directed by the clinician.

        Format strictly as:
        Subjective:
        [Detailed Subjective Text]

        Objective:
        [Detailed Objective Text]

        Assessment:
        [Detailed Assessment Text]

        Plan:
        [Detailed Plan Text]
      `;
}

/**
 * Generates a prompt for patient education summary.
 */
export function getPatientEducationPrompt(diagnosisDescription: string, planText?: string) {
  return `
        Generate a plain-language patient education sheet for the condition: ${diagnosisDescription}.
        
        ${planText ? `Current Treatment Plan being discussed:
        ${planText}
        ` : ''}

        Instructions:
        1. Simple explanation of the condition (avoid medical jargon).
        2. Expected recovery timeline.
        3. Red flags (specific to this condition and plan).
        4. Clear instructions on the next steps from the plan provided.
        
        Format the output clearly using Markdown headings. Keep it compassionate and clear for a patient.
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
  weight?: string;
  renalHepaticStatus?: string;
  reasonUnsuitable?: string;
}) {
  return `As a clinical assistant, select a safe and effective alternative medication for ${medication} for a patient diagnosed with ${diagnosis}.

[PATIENT CLINICAL CONTEXT]
Patient: ${patientData.name}
Age: ${patientData.age}
Gender: ${patientData.gender}
Weight: ${patientData.weight || "[Not provided]"}
Allergies: ${patientData.allergies}
Renal/Hepatic Status: ${patientData.renalHepaticStatus || "[Not provided]"}
${patientData.reasonUnsuitable ? `Reason ${medication} is unsuitable/contraindicated: ${patientData.reasonUnsuitable}` : ''}

[CLINICAL ALTERNATIVE SELECTION RULES]
1. Assess why ${medication} may be unsuitable (e.g. contraindication, severe allergy, renal/hepatic impairment, QT prolongation, dangerous drug interaction, side effect profile, or failure).
2. Determine the core therapeutic objective of ${medication} for ${diagnosis}.
3. Preserve the intended therapeutic goal unless the clinical context or safety contraindications require selecting a medication from a different therapeutic class.
4. Adjust drug choice, dosage, frequency, and duration based on patient age, weight, allergies, and organ function.
5. Ensure the alternative avoids known contraindications and drug interactions.

Return the response as a SINGLE valid JSON object:
{
  "medication": "string (name)",
  "concentration": "string (e.g., 500mg, 125mg/5ml)",
  "form": "string (e.g., Tablet, Capsule, Oral Suspension)",
  "dosage": "string (suggested dose)",
  "frequency": "string (e.g., Daily, BID, Q8H)",
  "duration": "string (e.g., 7 days)",
  "clinicalInstructions": "string (specific patient instructions)",
  "reasoning": "string (clinical rationale explaining why this alternative was chosen and whether therapeutic class was preserved or switched for patient safety)"
}

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

/**
 * Generates a prompt for medical content translation.
 */
export function getTranslationPrompt(content: string, targetLanguage: string) {
  return `Translate the following medical content into ${targetLanguage}. 
  Ensure the tone remains compassionate and the medical instructions remain accurate and easy for a patient to understand.
  Keep all Markdown formatting.
  
  Content:
  ${content}
  
  Only return the translated content.`;
}
