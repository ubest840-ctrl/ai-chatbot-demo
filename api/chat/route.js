import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  const { message } = await req.json();
  const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(message);
    const response = await result.response;
    return new Response(JSON.stringify({ reply: response.text() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to connect" }), { status: 500 });
  }
      }
