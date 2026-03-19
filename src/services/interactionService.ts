import { GoogleGenAI } from "@google/genai";

export async function checkInteractions(medications: string[]): Promise<string[]> {
  if (medications.length < 2) return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Gemini API key is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Check for potential drug-drug interactions between the following medications: ${medications.join(", ")}.
  Return a JSON array of strings, where each string is a brief description of a potential interaction. If no interactions are found, return an empty array.
  Only return the JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Interaction check failed:", error);
    return [];
  }
}
