import { clinicalAIRequest, AIChatMessage } from "./aiWorkflowService";
import { parseJsonResponse } from "../utils/gemini";
import { AISettings } from "../lib/AISettingsContext";
import { getInteractionCheckPrompt } from "./aiConfig";
import { ddiService, InteractionResult } from "./ddiService";
import { db } from "@/lib/db";

export async function checkInteractions(medications: string[], settings?: AISettings): Promise<InteractionResult[]> {
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

  // 3. AI Insight (Secondary Layer)
  try {
    const promptConfig = getInteractionCheckPrompt(medications);
    // getInteractionCheckPrompt returns an array of messages for generateContentWithRetry
    // We'll convert it to AIChatMessage format for clinicalAIRequest if needed
    const messages: AIChatMessage[] = (promptConfig as any).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.parts[0].text
    }));

    const responseText = await clinicalAIRequest(
      messages,
      settings
    );

    const aiInteractions = parseJsonResponse<any[]>(responseText, []);
    aiInteractions.forEach(i => {
      if (!Array.isArray(i.drugs)) return;
      
      const isDuplicate = results.some(r => {
        if (!Array.isArray(r.drugs)) return false;
        return r.drugs.every(d => i.drugs.some((id: string) => typeof id === 'string' && typeof d === 'string' && id.toLowerCase().includes(d.toLowerCase())))
      });

      if (!isDuplicate) {
        results.push({
          source: 'AI Insight',
          severity: i.severity || 'Unknown',
          description: i.description || 'No description provided',
          drugs: i.drugs
        });
      }
    });
  } catch (error) {
    console.error("AI interaction check failed:", error);
    results.push({
      source: 'AI Insight',
      severity: 'Unknown',
      description: 'AI analysis is currently unavailable. Please rely on verified database results.',
      drugs: medications
    });
  }

  return results;
}
