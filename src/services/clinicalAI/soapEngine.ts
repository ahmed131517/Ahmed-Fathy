import { AISettings } from '@/lib/AISettingsContext';
import { clinicalAIRequest } from '@/services/aiWorkflowService';
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
  redFlags: string[],
  aiSettings: AISettings
): Promise<string> {
  const allergies = patient.allergies?.map(a => `${a.name}${a.severity ? ` (${a.severity})` : ''}`).join(', ') || 'No known drug allergies (NKDA)';
  const chronic = patient.chronicConditions?.join(', ') || 'None documented';
  const meds = patient.medications?.map(m => `${m.name}${m.dosage ? ` ${m.dosage}` : ''}`).join(', ') || 'None active';
  const vitals = patient.vitalsHistory?.[0] ? `BP ${patient.vitalsHistory[0].bloodPressure}, HR ${patient.vitalsHistory[0].heartRate} bpm, Weight ${patient.vitalsHistory[0].weight} kg` : 'Not recorded';
  const labs = patient.labResults?.map(l => `${l.labName}: ${l.value} ${l.unit}`).join('; ') || 'None';

  const prompt = `
    You are an AI Clinical Scribe. Generate a professional, patient-aware SOAP note for the encounter:
    
    [PATIENT PROFILE]
    Patient: ${patient.name}, Age: ${patient.age}, Gender: ${patient.gender}, MRN: ${patient.mrn || 'N/A'}, Blood Type: ${patient.bloodType || 'N/A'}
    Allergies: ${allergies}
    Chronic Conditions: ${chronic}
    Active Home Medications: ${meds}
    Latest Vitals: ${vitals}
    Recent Lab Results: ${labs}
    
    [ENCOUNTER DATA]
    Presenting Symptoms: ${symptoms.join(', ')}
    Red Flags Evaluated: ${redFlags.join(', ')}
    Primary Diagnosis: ${diagnosis.name}
    Recommended Diagnostic Tests: ${diagnosis.diagnosticTests?.join(', ') || 'None'}
    First-Line Treatments: ${diagnosis.firstLineTreatments?.join(', ') || 'None'}
    
    Structure the note as follows:
    Subjective: Subjective findings, HPI, ROS, and relevant chronic history/allergies/meds.
    Objective: Objective findings based on vitals, physical exam, and labs.
    Assessment: Assessment including the primary diagnosis, differential considerations, and rationale.
    Plan: Plan including diagnostic tests, medication orders, patient education, and red flag precautions.

    Keep it professional and clinical.
  `;

  const responseText = await clinicalAIRequest(
    [{ role: 'user', content: prompt }],
    aiSettings
  );

  return responseText || "Failed to generate SOAP note.";
}
