import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AppRecommendation {
  clothing: string[];
  summary: string;
  activityRating: number; // 0 to 10
  specialNote?: string;
}

export async function getWeatherInsights(weatherData: any): Promise<AppRecommendation> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this weather data, provide clothing recommendations and a cinematic weather summary.
      Data: ${JSON.stringify(weatherData)}`,
      config: {
        systemInstruction: "You are 'Nova', a futuristic AI weather assistant. Your tone is cinematic, informative, and slightly poetic. Respond in JSON format only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clothing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recommended clothing items for today's weather."
            },
            summary: {
              type: Type.STRING,
              description: "A cinematic, immersive summary of the weather conditions."
            },
            activityRating: {
              type: Type.NUMBER,
              description: "A score from 0-10 on how good the day is for outdoor activities."
            },
            specialNote: {
              type: Type.STRING,
              description: "Any alerts or special considerations (e.g., high UV, upcoming storm)."
            }
          },
          required: ["clothing", "summary", "activityRating"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insight Error:", error);
    return {
      clothing: ["Appropriate outdoor gear"],
      summary: "Current conditions are evolving across the horizon.",
      activityRating: 5
    };
  }
}

export async function processVoiceCommand(command: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User says to weather assistant: "${command}". 
      Analyze the intent (e.g. check weather, add favorite city, change settings) and respond with a short cinematic acknowledgment.`,
      config: {
        systemInstruction: "You are Nova, a futuristic weather AI. Keep responses brief, immersive, and helpful."
      }
    });
    return response.text;
  } catch (error) {
    return "I'm processing your request across the datastreams...";
  }
}
