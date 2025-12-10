import { GoogleGenAI } from "@google/genai";
import { MarketInsight } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getTokenInsight = async (tokenSymbol: string): Promise<MarketInsight> => {
  if (!apiKey) {
    return {
      analysis: "API Key not configured. Unable to fetch real-time insights.",
      sources: []
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `What is the current market sentiment, recent news, and price trend for ${tokenSymbol}? Keep it brief (under 100 words).`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No analysis available.";
    
    // Extract sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
      .filter((source: any) => source !== null) as { title: string; uri: string }[];

    return {
      analysis: text,
      sources: sources
    };
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      analysis: "Failed to load market insights. Please try again later.",
      sources: []
    };
  }
};
