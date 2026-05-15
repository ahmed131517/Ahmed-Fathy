import { clinicalAIRequest } from "@/services/aiWorkflowService";
import { Scenario, ChatMessage, SimulationEvaluation } from "./osceTypes";

export async function generatePatientResponse(
  scenario: Scenario,
  messageHistory: ChatMessage[],
  mode: string,
  aiSettings: any
): Promise<string> {
  let modeInstructions = "";
  if (mode === "Diagnostic Challenge") {
    modeInstructions = "You are slightly confused or withhold some key information making it harder to diagnose unless explicitly asked very precise questions. You might emphasize a minor symptom over the major one.";
  } else if (mode === "Communication") {
    modeInstructions = "You are highly emotional, anxious, or frightened. Your responses should heavily focus on your feelings and fears about your symptoms. You need empathy from the doctor.";
  } else if (mode === "Emergency") {
    modeInstructions = "You are in severe distress, and your sentences should be short. You might express feeling like you are getting worse or fading.";
  }

  const systemPrompt = `You are a virtual patient in a medical OSCE simulation.
Your name is ${scenario.patientInfo.name}, you are a ${scenario.patientInfo.age}-year-old ${scenario.patientInfo.gender}.
Your personality: ${scenario.patientInfo.personality}.
Your current condition is: ${scenario.patientInfo.startingCondition}.

Your chief complaint: ${scenario.chiefComplaint}.
Your actual diagnosis (DO NOT REVEAL UNLESS DIAGNOSED): ${scenario.diagnosis}.
Your full medical history (REVEAL ONLY WHEN ASKED): ${scenario.history}.
Your medications: ${scenario.medications}.
Your allergies: ${scenario.allergies}.

Mode specific instructions: ${modeInstructions}

Rules:
1. NEVER reveal your exact diagnosis unless the doctor explicitly diagnoses you and explains it.
2. NEVER volunteer unasked information. Only answer what the doctor specifically asks.
3. Answer naturally like a real patient, show emotions appropriate to your personality and pain level.
4. Keep your language conversational, avoiding medical jargon unless you're a medical professional.
5. If the doctor asks an irrelevant question, express confusion.
6. Do NOT provide physical exam findings. If the doctor says "I am checking your chest", you can respond with "Okay doctor", but DO NOT say "you hear crackles". The system handles exam findings.
7. Maintain case consistency. Use your history.
`;

  const msgs = messageHistory.map(m => ({
    role: m.role === 'doctor' ? 'user' : 'model',
    content: m.content
  }));

  try {
    const responseText = await clinicalAIRequest(
      msgs as any, // type cast since 'model' vs 'assistant' might vary depending on genai types, clinicalAIRequest expects user/assistant or user/model
      aiSettings,
      systemPrompt
    );
    return responseText || "I'm not feeling well...";
  } catch (err) {
    console.error("Failed to generate patient response:", err);
    return "I didn't quite catch that. Can you repeat?";
  }
}

export async function evaluatePerformance(
  scenario: Scenario,
  messageHistory: ChatMessage[],
  finalDiagnosis: string,
  differentials: string[],
  orderedInvestigations: string[],
  doctorNotes: string,
  aiSettings: any
): Promise<SimulationEvaluation | null> {
  const systemPrompt = `You are an expert OSCE examiner and clinical supervisor, specialized in standardized medical board exams like USMLE Step 2 CS and MRCP PACES.
Evaluate the doctor's performance in this clinical simulation scenario using these global standards.

Case Diagnosis: ${scenario.diagnosis}
Expected Red Flags: ${scenario.redFlags.join(', ')}

Rubric Focus:
1. Data Gathering (History & Exam): Efficiency, relevance, and finding potential red flags.
2. Clinical Reasoning (Differentials & Investigations): Logical progression towards a diagnosis.
3. Communication & Interpersonal Skills (CIS): Empathy, open-ended questioning, professional bridging, and lack of jargon.
4. Patient Handover (if applicable): Clarity and structure (SBAR).

Provide a JSON object with the following exact structure:
{
  "score": <overall score out of 100>,
  "historyTaking": <score out of 100>,
  "differentialDiagnosis": <score out of 100>,
  "investigations": <score out of 100>,
  "communication": <score out of 100>,
  "strengths": ["string", "string"],
  "weaknesses": ["string", "string"],
  "feedback": "string (Start with a professional summary of their board-readiness)",
  "missedRedFlags": ["string", "string"],
  "suggestedDifferentials": ["string", "string"],
  "educationalNotes": "string"
}

Ensure the feedback is constructive, educational, and clinically accurate.`;

  const prompt = `Evaluate This Encounter:
Final Diagnosis: ${finalDiagnosis}

Differential Diagnoses Considered:
${differentials.join(', ')}

Conversation History:
${messageHistory.map(m => "[" + m.role.toUpperCase() + "]: " + m.content).join('\\n')}

Doctor Notes:
${doctorNotes}

Investigations Ordered:
${orderedInvestigations.join(', ')}
`;

  try {
    const responseText = await clinicalAIRequest(
      [{ role: 'user', content: prompt }],
      aiSettings,
      systemPrompt
    );

    let jsonText = responseText || '{}';
    // Try to clean up any markdown blocks if present
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Try to parse JSON
    const jsonStr = jsonText.match(/\{[\s\S]*\}/)?.[0] || '{}';
    const json = JSON.parse(jsonStr);
    
    return {
      score: json.score || 0,
      historyTaking: json.historyTaking || 0,
      differentialDiagnosis: json.differentialDiagnosis || 0,
      investigations: json.investigations || 0,
      communication: json.communication || 0,
      strengths: Array.isArray(json.strengths) ? json.strengths : [],
      weaknesses: Array.isArray(json.weaknesses) ? json.weaknesses : [],
      feedback: json.feedback || "Evaluation incomplete.",
      missedRedFlags: Array.isArray(json.missedRedFlags) ? json.missedRedFlags : [],
      suggestedDifferentials: Array.isArray(json.suggestedDifferentials) ? json.suggestedDifferentials : [],
      educationalNotes: json.educationalNotes || ""
    };
  } catch (err) {
    console.error("Failed to generate evaluation:", err);
    return null;
  }
}

export async function generateScenario(
  mode: string,
  specialty: string,
  difficulty: string,
  focusKeywords: string,
  aiSettings: any
): Promise<Scenario | null> {
  const systemPrompt = `You are an expert medical educator creating a clinical OSCE scenario for a medical student or resident.
Generate a realistic and medically accurate clinical scenario.

Parameters:
Mode: ${mode}
Specialty: ${specialty !== 'All' ? specialty : 'Any'}
Difficulty: ${difficulty !== 'All' ? difficulty : 'Appropriate for a med student'}
Focus Keywords: ${focusKeywords || 'None'}

Return ONLY a valid JSON object matching this exact structure:
{
  "id": "gen-${Date.now()}",
  "title": "Short descriptive title (e.g. 45yo M with Chest Pain)",
  "specialty": "One of: Cardiology, Internal Medicine, Pediatrics, Emergency, Surgery, Psychiatry, ENT, Dermatology",
  "difficulty": "One of: Beginner, Intermediate, Advanced",
  "chiefComplaint": "Patient's exact words",
  "patientInfo": {
    "name": "First Last",
    "age": 45,
    "gender": "Male",
    "personality": "Brief description of demeanor",
    "startingCondition": "One of: Stable, Deteriorating, Critical"
  },
  "initialVitals": {
    "bp": "120/80",
    "hr": 80,
    "rr": 16,
    "temp": 37.0,
    "spo2": 98
  },
  "diagnosis": "The actual underlying diagnosis",
  "history": "Full HPI, PMH, Social, Family history",
  "medications": "Current meds",
  "allergies": "Known allergies",
  "physicalExamFindings": {
    "general": "Appearance",
    "cardiovascular": "Heart exam",
    "respiratory": "Lung exam",
    "abdominal": "Abdomen exam",
    "neurological": "Neuro exam",
    "extremities": "Extremities exam"
  },
  "investigations": {
    "ECG": "Results if ordered",
    "CBC": "Results if ordered",
    "CXR": "Results if ordered"
  },
  "progressionLogic": "What happens if not treated properly",
  "redFlags": ["String array of red flags in history/exam"]
}

Constraints:
1. Ensure the scenario is clinically realistic and challenging appropriate to the difficulty.
2. Provide at least 3 relevant investigations in the 'investigations' object.
3. Be completely consistent with the patient's age and gender.
4. Output nothing but valid JSON.`;

  try {
    const responseText = await clinicalAIRequest(
      [{ role: 'user', content: 'Generate Scenario' }],
      aiSettings,
      systemPrompt
    );

    let jsonText = responseText || '{}';
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // In case there is text before or after, extract the json block
    const match = jsonText.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not find JSON in response");
    
    const jsonStr = match[0];
    const scenarioData: Scenario = JSON.parse(jsonStr);
    
    // Quick validation
    if (!scenarioData.title || !scenarioData.diagnosis || !scenarioData.patientInfo) {
      throw new Error("Invalid scenario schema returned.");
    }
    
    // ensure id
    scenarioData.id = `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return scenarioData;
  } catch (err) {
    console.error("Failed to generate scenario:", err);
    return null;
  }
}

export async function getClinicalHint(
  scenario: Scenario,
  messageHistory: ChatMessage[],
  differentials: string[],
  aiSettings: any
): Promise<string> {
  const systemPrompt = `You are a helpful clinical mentor observing a medical trainee. 
Provide a concise, helpful hint for the next step in the clinical encounter. 
Avoid giving the answer away directly, but guide them towards the right history question, physical exam, or investigation.
Current Case: ${scenario.title} (Mental Diagnosis: ${scenario.diagnosis})
Differentials they are considering: ${differentials.join(', ')}

Rules:
1. Be brief (max 2 sentences).
2. Be encouraging.
3. Reference their current differentials if relevant.`;

  const prompt = `Current Conversation:
${messageHistory.map(m => "[" + m.role.toUpperCase() + "]: " + m.content).join('\\n')}

Provide a hint for the trainee.`;

  try {
    const responseText = await clinicalAIRequest(
      [{ role: 'user', content: prompt }],
      aiSettings,
      systemPrompt
    );
    return responseText || "Think about the most life-threatening possibilities first.";
  } catch (err) {
    return "Consider asking about the patient's past medical history.";
  }
}

export async function generateHandoverResponse(
  scenario: Scenario,
  handoverContent: string,
  messageHistory: ChatMessage[],
  aiSettings: any
): Promise<string> {
  const systemPrompt = `You are a Senior Consultant Doctor. A trainee is handing over a patient to you using the SBAR (Situation, Background, Assessment, Recommendation) framework.
Analyze their handover based on the actual case: ${scenario.title} (Diagnosis: ${scenario.diagnosis}).

Rules:
1. If their handover is good, ask a challenging follow-up question about clinical reasoning, pathophysiology, or next management steps.
2. If it's missing key info (like red flags or actual vitals), call it out professionally.
3. Be strict but educational.
4. Keep the response to 1-2 paragraphs.`;

  const prompt = `HANDOVER FROM TRAINEE:
${handoverContent}

Case Details:
Diagnosis: ${scenario.diagnosis}
Vitals during encounter: ${scenario.initialVitals.bp}, HR ${scenario.initialVitals.hr}
Red Flags: ${scenario.redFlags.join(', ')}

Previous conversation context:
${messageHistory.map(m => "[" + m.role.toUpperCase() + "]: " + m.content).join('\\n')}

Respond as the Senior Consultant.`;

  try {
    const responseText = await clinicalAIRequest(
      [{ role: 'user', content: prompt }],
      aiSettings,
      systemPrompt
    );
    return responseText || "Thank you for the handover. What is your top differential diagnosis for this patient and why?";
  } catch (err) {
    return "I see. And what management steps do you propose next?";
  }
}
