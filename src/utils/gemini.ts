import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse, Chat } from "@google/genai";

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

function isRateLimitError(error: any): boolean {
  const errorCode = error?.error?.code || error?.code;
  return errorCode === 429;
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
      if (isRateLimitError(error) && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * INITIAL_DELAY;
        console.warn(`Gemini API rate limited (429). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
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
      if (isRateLimitError(error) && attempt < MAX_RETRIES - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * INITIAL_DELAY;
        console.warn(`Gemini API rate limited (429). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.error("Gemini API error:", error);
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for Gemini API");
}
