import { AISettings } from "../lib/AISettingsContext";

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function clinicalAIRequest(
  messages: AIChatMessage[],
  settings?: AISettings,
  systemInstruction?: string
) {
  // Fallback to localStorage if settings not provided (useful for services)
  let activeSettings = settings;
  if (!activeSettings) {
    const saved = localStorage.getItem('ai_settings');
    if (saved) {
      activeSettings = JSON.parse(saved);
    }
  }

  if (!activeSettings) {
    // Default fallback
    activeSettings = {
      aiProvider: 'gemini',
      openRouterModel: 'openai/gpt-4o-mini'
    } as AISettings;
  }

  const provider = activeSettings.aiProvider;
  
  // Use the proxy endpoint for all clinical AI requests to ensure consistency
  // and avoid complex client-side SDK logic for multiple providers
  const response = await fetch("/api/clinical-workflow/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: messages.filter(m => m.role !== 'system'), // Extract system separately
      provider: provider,
      model: provider === 'openrouter' ? activeSettings.openRouterModel : 'gemini-3.1-flash-lite',
      apiKey: provider === 'openrouter' ? activeSettings.openRouterApiKey : undefined,
      systemInstruction: systemInstruction || messages.find(m => m.role === 'system')?.content
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "AI processing failed");
  }

  const data = await response.json();
  return data.content;
}

export async function summarizePatientData(patientData: any, settings: AISettings) {
  const prompt = `Summarize this patient data: ${JSON.stringify(patientData)}`;
  const systemInstruction = "You are a senior clinical analyst. Provide a professional, concise medical summary of the patient data provided. Focus on key trends and urgent issues. Format as professional clinical notes.";
  
  return clinicalAIRequest(
    [{ role: "user", content: prompt }],
    settings,
    systemInstruction
  );
}
