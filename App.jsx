import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [persona, setPersona] = useState("hospitality");
  const [messages, setMessages] = useState([
    { role: "assistant", content: `System initialized in ${persona} mode.` }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAnchor = useRef(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const personaInstructions = {
    hospitality: "You are a world-class hotel concierge. Be exceptionally polite, professional, and helpful with guest inquiries.",
    school: "You are a professional school registrar. Be helpful, formal, and accurate when answering student and parent questions."
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsProcessing(true);

    try {
      // Using the verified stable model: gemini-2.0-flash
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash", 
        systemInstruction: personaInstructions[persona] 
      });
      
      const result = await model.generateContent(userInput);
      setMessages([...newMessages, { role: "assistant", content: result.response.text() }]);
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "System Error: Please refresh." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>{persona.toUpperCase()} BOT</h1>
      
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <button onClick={() => setPersona("hospitality")} style={{ padding: "10px", background: persona === "hospitality" ? "#2563eb" : "#1e293b", border: "none", color: "white", borderRadius: "5px" }}>Hospitality</button>
        <button onClick={() => setPersona("school")} style={{ padding: "10px", background: persona === "school" ? "#2563eb" : "#1e293b", border: "none", color: "white", borderRadius: "5px" }}>School</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "80px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ padding: "12px", borderRadius: "10px", background: m.role === "user" ? "#2563eb" : "#1e293b", alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            {m.content}
          </div>
        ))}
        <div ref={scrollAnchor} />
      </div>

      <form onSubmit={handleSend} style={{ position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px", background: "#0f172a", display: "flex", gap: "10px" }}>
        <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "none" }} />
        <button type="submit" disabled={isProcessing} style={{ padding: "10px 20px", background: "#2563eb", color: "white", border: "none", borderRadius: "5px" }}>Send</button>
      </form>
    </div>
  );
}
