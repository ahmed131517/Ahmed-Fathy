import { generateContentWithRetry } from "../utils/gemini";

export async function checkInteractions(medications: string[]): Promise<string[]> {
  if (medications.length < 2) return [];

  const prompt = `Check for potential drug-drug interactions between the following medications: ${medications.join(", ")}.
  Return a JSON array of strings, where each string is a brief description of a potential interaction. If no interactions are found, return an empty array.
  Only return the JSON array.`;

  try {
    const response = await generateContentWithRetry({
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
