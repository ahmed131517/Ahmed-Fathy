import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, Chat } from "@google/genai";

const MAX_RETRIES = 5;
const INITIAL_DELAY = 1500;

function isTransientError(error: any): boolean {
  // Extract error code from various possible structures
  let errorCode = error?.error?.code || error?.code;
  
  // If the error message is a string, check for known proxy errors
  const errorMessage = error?.message || (typeof error === 'string' ? error : '');
  
  // If the error is a stringified JSON, try to parse it
  if (!errorCode && typeof errorMessage === 'string' && errorMessage.includes('{')) {
    try {
      const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf('{')));
      errorCode = parsed?.error?.code || parsed?.code;
    } catch {
      // Not JSON, ignore
    }
  }

  // Common transient error codes:
  // 429: Rate limit
  // 500: Server error
  // 503: Service Unavailable
  // 504: Gateway Timeout
  return errorCode === 429 || errorCode === 500 || errorCode === 503 || errorCode === 504 || 
         (typeof errorMessage === 'string' && errorMessage.includes('Rpc failed due to xhr error'));
}

export async function generateContentWithRetry(
  params: GenerateContentParameters,
  apiKey: string = process.env.GEMINI_API_KEY || ""
): Promise<GenerateContentResponse> {
  const ai = new GoogleGenAI({ apiKey });
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      if (isTransientError(error) && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * INITIAL_DELAY;
        console.warn(`Gemini API transient error (${error?.error?.code || error?.code}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Gemini API error:", error);
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for Gemini API");
}

export async function sendMessageStreamWithRetry(
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await chat.sendMessageStream({ message });
    } catch (error: any) {
      if (isTransientError(error) && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * INITIAL_DELAY;
        console.warn(`Gemini API transient error (${error?.error?.code || error?.code}). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Gemini API error:", error);
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for Gemini API");
}

export function parseJsonResponse<T>(text: string | undefined, defaultValue: T): T {
  if (!text) return defaultValue;

  try {
    // Try parsing directly
    return JSON.parse(text.trim());
  } catch (e) {
    console.warn("Direct JSON parsing failed, attempting to extract JSON from response text.", e);
    
    // Try to extract from markdown code blocks
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      try {
        return JSON.parse(markdownMatch[1].trim());
      } catch (e2) {
        console.warn("Markdown JSON extraction failed.", e2);
      }
    }

    // Try to find the first { or [ and last } or ]
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');

    let start = -1;
    let end = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.substring(start, end + 1).trim());
      } catch (e3) {
        console.warn("Brace/Bracket extraction failed.", e3);
      }
    }

    console.error("All JSON parsing attempts failed for text:", text);
    return defaultValue;
  }
}
