import { useState, useRef, useEffect } from "react";

export default function App() {
  const [activeTenant, setActiveTenant] = useState("school");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Good day! How can I help you today?" }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAnchor = useRef(null);

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const dispatchMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsProcessing(true);

    try {
      // Calling your new backend route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      
      const data = await response.json();
      
      if (data.reply) {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error(data.error || "No response");
      }
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "Error: Could not reach the AI." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>AI Assistant</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "80px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ 
            padding: "12px", 
            borderRadius: "10px", 
            background: m.role === "user" ? "#2563eb" : "#1e293b",
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%"
          }}>
            {m.content}
          </div>
        ))}
        <div ref={scrollAnchor} />
      </div>

      <form onSubmit={dispatchMessage} style={{ 
        position: "fixed", bottom: "20px", left: "20px", right: "20px", 
        display: "flex", gap: "10px" 
      }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "12px", borderRadius: "5px", border: "none" }}
        />
        <button type="submit" disabled={isProcessing} style={{ padding: "10px 20px", cursor: "pointer" }}>
          {isProcessing ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
  }
