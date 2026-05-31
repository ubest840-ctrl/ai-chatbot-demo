import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [persona, setPersona] = useState("hospitality");
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Initialized in ${persona} mode.` }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const personaInstructions = {
    hospitality: "You are a hotel concierge. Be polite and helpful.",
    school: "You are a school administrator. Be formal and helpful."
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsProcessing(true);

    try {
      // Use 'gemini-1.5-flash' - this is the most consistently available model
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", 
        systemInstruction: personaInstructions[persona] 
      });
      
      const result = await model.generateContent(userInput);
      setMessages([...newMessages, { role: "assistant", content: result.response.text() }]);
    } catch (error) {
      // This will now show the REAL error instead of a generic message
      setMessages([...newMessages, { role: "assistant", content: "DEBUG ERROR: " + error.message }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>{persona.toUpperCase()} BOT</h1>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <button onClick={() => setPersona("hospitality")} style={{ padding: "10px", background: persona === "hospitality" ? "#2563eb" : "#1e293b", border: "none", color: "white" }}>Hospitality</button>
        <button onClick={() => setPersona("school")} style={{ padding: "10px", background: persona === "school" ? "#2563eb" : "#1e293b", border: "none", color: "white" }}>School</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "80px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ padding: "12px", borderRadius: "10px", background: m.role === "user" ? "#2563eb" : "#1e293b", maxWidth: "85%" }}>{m.content}</div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px", background: "#0f172a", display: "flex", gap: "10px" }}>
        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} style={{ flex: 1, padding: "12px" }} />
        <button type="submit" disabled={isProcessing}>Send</button>
      </form>
    </div>
  );
    }
