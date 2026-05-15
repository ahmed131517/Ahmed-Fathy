import { AISettings } from "../lib/AISettingsContext";
import { clinicalAIRequest } from "./aiWorkflowService";
import { parseJsonResponse } from "../utils/gemini";

export interface ClinicalAnalysis {
  interpretation: string;
  redFlags: string[];
  suggestedLabs: string[];
  suggestedPrescriptions: string[];
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export const analyzeClinicalFindings = async (
  system: string,
  findings: any,
  patientHistory: any,
  vitals: any,
  settings?: AISettings
): Promise<ClinicalAnalysis> => {
  const prompt = `Analyze the following clinical findings for the ${system} system:
  Findings: ${JSON.stringify(findings)}
  Patient History: ${JSON.stringify(patientHistory)}
  Vitals: ${JSON.stringify(vitals)}

  Provide a JSON response with the following structure:
  {
    "interpretation": "Concise clinical interpretation.",
    "redFlags": ["List of red flags if any"],
    "suggestedLabs": ["List of suggested labs"],
    "suggestedPrescriptions": ["List of suggested prescriptions"],
    "severity": "Mild" | "Moderate" | "Severe"
  }`;

  const responseText = await clinicalAIRequest(
    [{ role: "user", content: prompt }],
    settings
  );

  return parseJsonResponse<ClinicalAnalysis>(responseText, {
    interpretation: "Analysis failed.",
    redFlags: [],
    suggestedLabs: [],
    suggestedPrescriptions: [],
    severity: 'Mild'
  });
};
