import { GoogleGenAI } from "@google/genai";

// Initialize the API client
// Note: In a real production app, ensure API_KEY is set securely.
// For this demo, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateSummary = async (text: string): Promise<string> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return "API Key missing. Cannot generate summary.";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `Summarize the following research text into a concise paragraph (max 50 words) suitable for a project timeline card:\n\n${text}`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating summary.";
  }
};