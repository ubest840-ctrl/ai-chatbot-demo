import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your key from the Environment Variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function sendMessageToGemini(userMessage) {
  try {
    // We use gemini-1.5-flash for speed and low latency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to connect to AI engine");
  }
}
