
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Always use the process.env.API_KEY directly when initializing the GoogleGenAI client instance
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameAdvice = async (history: ChatMessage[], userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: "You are Galaxy, the AI mascot for Galaxy Games. Your job is to provide game tips, recommend games based on user preference, and chat about retro and web gaming culture. Keep responses concise, friendly, and gamer-oriented. If someone asks for cheat codes, give them fun 'pro-tips' instead.",
        temperature: 0.7,
      },
    });

    // Directly access the .text property of GenerateContentResponse
    return response.text || "I'm having a bit of lag. Try again in a second!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The server is currently out of lives. Please check your connection!";
  }
};
