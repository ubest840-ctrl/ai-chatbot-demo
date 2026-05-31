import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API Key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! Ready to chat with Gemini 3.5." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAnchor = useRef(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsProcessing(true);

    try {
      // Using the current stable production model: gemini-3.5-flash
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      
      const result = await model.generateContent(userInput);
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages([...newMessages, { 
        role: "assistant", 
        content: "Error: " + error.message 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.5rem" }}>AI Chatbot</h1>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "80px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            padding: "12px", 
            borderRadius: "10px", 
            background: m.role === "user" ? "#2563eb" : "#1e293b",
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "85%"
          }}>
            {m.content}
          </div>
        ))}
        <div ref={scrollAnchor} />
      </div>

      <form onSubmit={handleSend} style={{ 
        position: "fixed", bottom: "0", left: "0", right: "0", padding: "10px", 
        background: "#0f172a", display: "flex", gap: "10px" 
      }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask me anything..."
          style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "none" }}
        />
        <button type="submit" disabled={isProcessing} style={{ padding: "10px 20px", cursor: "pointer" }}>
          {isProcessing ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
            }
