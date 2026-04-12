import { generateContentWithRetry, parseJsonResponse } from "../utils/gemini";
import { getInteractionCheckPrompt } from "./aiConfig";
import { ddiService, InteractionResult } from "./ddiService";
import { db } from "@/lib/db";

export async function checkInteractions(medications: string[]): Promise<InteractionResult[]> {
  if (medications.length < 2) return [];

  const results: InteractionResult[] = [];

  // 1. Check Local Database (Primary Layer 1)
  try {
    const allDrugs = await db.drugs.toArray();
    const drugIds = medications
      .map(name => allDrugs.find(d => d.generic_name.toLowerCase() === name.toLowerCase())?.id)
      .filter(id => id !== undefined) as number[];

    if (drugIds.length >= 2) {
      const localInteractions = await db.drug_interactions
        .filter(i => drugIds.includes(i.drug1_id) && drugIds.includes(i.drug2_id))
        .toArray();

      localInteractions.forEach(i => {
        const d1 = allDrugs.find(d => d.id === i.drug1_id)?.generic_name || "Unknown";
        const d2 = allDrugs.find(d => d.id === i.drug2_id)?.generic_name || "Unknown";
        results.push({
          source: 'Local Database',
          severity: i.severity,
          description: i.description,
          drugs: [d1, d2]
        });
      });
    }
  } catch (error) {
    console.error("Local interaction check failed:", error);
  }

  // 2. Check Verified Database (Primary Layer 2 - RxNav API)
  try {
    const verifiedResults = await ddiService.getVerifiedInteractions(medications);
    results.push(...verifiedResults);
  } catch (error) {
    console.error("Verified interaction check failed:", error);
  }

  // 3. AI Insight (Secondary Layer - Gemini)
  // We use AI to summarize, explain, or find interactions missed by the databases
  try {
    const prompt = getInteractionCheckPrompt(medications);
    const response = await generateContentWithRetry({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              severity: { type: "string", enum: ["Major", "Moderate", "Minor"] },
              description: { type: "string" },
              drugs: { type: "array", items: { type: "string" } }
            },
            required: ["severity", "description", "drugs"]
          }
        }
      }
    });

    const aiInteractions = parseJsonResponse<any[]>(response.text, []);
    aiInteractions.forEach(i => {
      // Avoid duplicate alerts if already found in databases
      const isDuplicate = results.some(r => 
        r.drugs.every(d => i.drugs.some((id: string) => id.toLowerCase().includes(d.toLowerCase())))
      );

      if (!isDuplicate) {
        results.push({
          source: 'AI Insight',
          severity: i.severity,
          description: i.description,
          drugs: i.drugs
        });
      }
    });
  } catch (error) {
    console.error("AI interaction check failed:", error);
    // We don't throw here, so database results are still returned
    results.push({
      source: 'AI Insight',
      severity: 'Unknown',
      description: 'AI analysis is currently unavailable due to high demand. Please rely on verified database results.',
      drugs: medications
    });
  }

  return results;
}
