import { generateContentWithRetry } from '@/utils/gemini';
import { Patient } from '@/data/patients';
import { Diagnosis } from '@/data/diagnosisMappings';

export interface SOAPNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export async function generateSoapNote(
  patient: Patient,
  symptoms: string[],
  diagnosis: Diagnosis,
  redFlags: string[]
): Promise<string> {
  const prompt = `
    Generate a professional SOAP note for the following patient encounter:
    Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}
    Chronic Conditions: ${patient.chronicConditions?.join(', ')}
    Medications: ${patient.medications?.join(', ')}
    
    Subjective: Patient reports symptoms: ${symptoms.join(', ')}.
    Red Flags ruled out: ${redFlags.join(', ')}
    
    Assessment: Primary diagnosis: ${diagnosis.name}.
    
    Please structure the note as follows:
    S: Subjective findings
    O: Objective findings (based on symptoms and patient history)
    A: Assessment including the diagnosis and rationale
    P: Plan including diagnostic tests and treatments: ${diagnosis.diagnosticTests?.join(', ')}, ${diagnosis.firstLineTreatments?.join(', ')}

    Keep it concise and professional.
  `;

  const response = await generateContentWithRetry({
    model: 'gemini-1.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  return response.text || "Failed to generate SOAP note.";
}
