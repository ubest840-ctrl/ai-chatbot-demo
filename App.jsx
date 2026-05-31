import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function App() {
  const [log, setLog] = useState("Status: Ready. Type to test.");

  const testConnection = async () => {
    setLog("Testing...");
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API KEY MISSING in Vercel!");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Say hello");
      setLog("SUCCESS: " + result.response.text());
    } catch (err) {
      setLog("ERROR: " + err.message);
    }
  };

  return (
    <div style={{ padding: "50px", color: "white", background: "#000", minHeight: "100vh" }}>
      <h1>Connection Test</h1>
      <button onClick={testConnection} style={{ padding: "20px" }}>Test Gemini Connection</button>
      <p style={{ marginTop: "20px", color: "yellow" }}>{log}</p>
    </div>
  );
             }
