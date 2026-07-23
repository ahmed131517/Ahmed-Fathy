import { GoogleGenAI, Chat } from "@google/genai";
import { clinicalAIRequest } from "@/services/aiWorkflowService";

export interface GenerateContentParameters {
  model?: string;
  contents: any;
  systemInstruction?: any;
  config?: any;
}

export interface GenerateContentResponse {
  text: string;
  response: {
    text: () => string;
    candidates: any[];
  };
}

const MAX_RETRIES = 6;
const INITIAL_DELAY = 2000;

// --- Circuit Breaker ---
let failureCount = 0;
let isCircuitOpen = false;
let lastFailureTime = 0;
const CIRCUIT_THRESHOLD = 5; // Increased threshold
const CIRCUIT_OPEN_DURATION = 20000; // 20 seconds
let lastErrorType: 'quota' | 'server' | 'unknown' = 'unknown';

function checkCircuitBreaker() {
  if (isCircuitOpen) {
    if (Date.now() - lastFailureTime > CIRCUIT_OPEN_DURATION) {
      console.log("Circuit breaker timeout passed, attempting reset.");
      isCircuitOpen = false;
      failureCount = 0;
      return true;
    }
    const message = lastErrorType === 'quota' 
      ? "AI quota exceeded. Please wait a moment before trying again." 
      : "AI services are temporarily unavailable. Retrying in 20 seconds.";
    throw new Error(message);
  }
  return true;
}

function reportSuccess() {
  failureCount = 0;
  isCircuitOpen = false;
}

function reportFailure(error: any) {
  const errorCode = error?.error?.code || error?.code;
  if (errorCode === 429) lastErrorType = 'quota';
  else if (errorCode >= 500) lastErrorType = 'server';
  else lastErrorType = 'unknown';

  failureCount++;
  if (failureCount >= CIRCUIT_THRESHOLD) {
    isCircuitOpen = true;
    lastFailureTime = Date.now();
    console.error(`Circuit breaker opened due to persistent ${lastErrorType} errors.`);
  }
}

function isTransientError(error: any): boolean {
  let errorCode = error?.error?.code || error?.code;
  const errorMessage = error?.message || (typeof error === 'string' ? error : '');
  
  // Handle stringified JSON in message if needed
  if (!errorCode && typeof errorMessage === 'string' && errorMessage.includes('{')) {
    try {
      const parsed = JSON.parse(errorMessage.substring(errorMessage.indexOf('{')));
      errorCode = parsed?.error?.code || parsed?.code;
    } catch { }
  }

  // 429: Rate limit
  // 500: Server error
  // 503: Service Unavailable
  // 504: Gateway Timeout
  const isTransient = errorCode === 429 || errorCode === 500 || errorCode === 503 || errorCode === 504 || 
                      (typeof errorMessage === 'string' && errorMessage.includes('Rpc failed due to xhr error'));
                      
  return !!isTransient;
}

/**
 * Modernized wrapper that routes through clinicalAIRequest to support provider switching.
 */
export async function generateContentWithRetry(
  params: GenerateContentParameters
): Promise<GenerateContentResponse> {
  try {
    let messages: any[] = [];
    const contents = params.contents;
    
    // Normalize format to clinicalAIRequest format
    if (typeof contents === 'string') {
      messages = [{ role: 'user', content: contents }];
    } else if (Array.isArray(contents)) {
      messages = contents.map((c: any) => ({
        role: ['model', 'assistant', 'ai'].includes(c.role?.toLowerCase()) ? 'assistant' : 'user',
        content: typeof c.parts?.[0] === 'string' ? c.parts[0] : (c.parts?.[0] as any)?.text || ""
      }));
    } else if (contents && typeof contents === 'object') {
      const c = contents as any;
      messages = [{
        role: ['model', 'assistant', 'ai'].includes(c.role?.toLowerCase()) ? 'assistant' : 'user',
        content: typeof c.parts?.[0] === 'string' ? c.parts[0] : (c.parts?.[0] as any)?.text || ""
      }];
    }

    const systemInstruction = typeof (params as any).systemInstruction === 'string' 
      ? (params as any).systemInstruction 
      : ((params as any).systemInstruction as any)?.parts?.[0]?.text;

    const responseText = await clinicalAIRequest(messages, undefined, systemInstruction);

    // Return Gemini-compatible shape for legacy callers
    return {
      text: responseText,
      response: {
        text: () => responseText,
        candidates: [{ content: { parts: [{ text: responseText }] } }]
      }
    } as GenerateContentResponse;
  } catch (err) {
    console.error("generateContentWithRetry failure:", err);
    throw err;
  }
}

export async function sendMessageStreamWithRetry(
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      checkCircuitBreaker();
      const result = await chat.sendMessageStream({ message });
      reportSuccess();
      
      async function* wrapResult(): AsyncIterable<GenerateContentResponse> {
        for await (const chunk of result) {
          yield {
            text: chunk.text || "",
            response: {
              text: () => chunk.text || "",
              candidates: chunk.candidates || []
            }
          } as GenerateContentResponse;
        }
      }
      return wrapResult();
    } catch (error: any) {
      if (isTransientError(error) && attempt < MAX_RETRIES - 1) {
        attempt++;
        
        // Exponential backoff with jitter
        const baseDelay = Math.pow(2, attempt) * INITIAL_DELAY;
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        
        console.warn(`Gemini API transient error in stream (${error?.error?.code || error?.code}). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        reportFailure(error);
        console.error("Gemini API stream error (final attempt reached or non-transient):", error);
        throw error;
      }
    }
  }
  throw new Error("Max retries reached for Gemini API stream");
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

    console.warn("All JSON parsing attempts resolved with default value for text:", text);
    return defaultValue;
  }
}
