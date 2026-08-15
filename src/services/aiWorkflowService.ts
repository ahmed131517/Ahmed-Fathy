import { AISettings } from "../lib/AISettingsContext";

export interface AIChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  images?: { mimeType: string; data: string }[];
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
  
  // Check for modelType in localStorage or activeSettings
  let selectedModel = 'gemini-3.6-flash';
  if (provider === 'openrouter') {
    selectedModel = activeSettings.openRouterModel || 'openai/gpt-4o-mini';
  } else {
    try {
      const savedGlobal = localStorage.getItem('clinic_settings');
      if (savedGlobal) {
        const parsed = JSON.parse(savedGlobal);
        if (parsed.modelType) selectedModel = parsed.modelType;
      }
    } catch (e) {}
  }

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
      model: selectedModel,
      apiKey: provider === 'openrouter' ? activeSettings.openRouterApiKey : undefined,
      systemInstruction: systemInstruction || messages.find(m => m.role === 'system')?.content
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMsg = "AI processing failed";
    try {
      const errorData = JSON.parse(responseText);
      errorMsg = errorData.error || errorData.details || errorMsg;
      
      // If errorMsg is stringified JSON, try to parse it
      if (typeof errorMsg === 'string' && errorMsg.startsWith('{')) {
        const parsedNested = JSON.parse(errorMsg);
        if (parsedNested.error?.message) {
          errorMsg = parsedNested.error.message;
        }
      }
      
      // Handle generic resource exhausted / quota exceeded cleanly
      if (typeof errorMsg === 'string' && (errorMsg.includes('quota') || errorMsg.includes('resource_exhausted') || errorMsg.includes('429'))) {
        errorMsg = "AI Quota Exceeded: You have exceeded your API limits for this model. Please check your billing details or wait until your quota resets.";
      }
    } catch {
      if (responseText) errorMsg = responseText;
    }
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  try {
    const data = JSON.parse(responseText);
    return data.content || "";
  } catch {
    throw new Error(responseText || "Invalid JSON response from server");
  }
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
