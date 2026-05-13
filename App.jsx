import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize the API (Keep your key in a .env file later!)
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getChatResponse(userPrompt) {
  try {
    // 2. Send the message to Gemini
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text; // This is the message your bot sends back
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my brain right now.";
  }
}
