import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const LOCAL_BUSINESSES = {
  school: {
    name: "Bright Minds Tutorial Centre",
    tagline: "Anambra State's Premier Academic Hub",
    themeColor: "#2563eb",
    avatar: "📚",
    systemPrompt: "You are the professional, highly welcoming AI front-desk receptionist."
  },
  hotel: {
    name: "Luxe Haven Suites",
    tagline: "Experience Premium Comfort & Security",
    themeColor: "#163a34",
    avatar: "🏨",
    systemPrompt: "You are the luxury virtual concierge AI for Luxe Haven Suites."
  },
  realestate: {
    name: "Sarah Real Estate Assistant",
    tagline: "Secure High-Yield Land & Property Assets",
    themeColor: "#7c3aed",
    avatar: "🏠",
    systemPrompt: "You are Sarah, an expert AI real estate consultant."
  }
};

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function App() {
  const [activeTenant, setActiveTenant] = useState("school");
  const [messages, setMessages] = useState([{ role: "assistant", content: `Good day! Welcome to ${LOCAL_BUSINESSES[activeTenant].name}. How can I help you today?` }]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAnchor = useRef(null);
  const business = LOCAL_BUSINESSES[activeTenant];

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const dispatchMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !genAI) return;

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");
    setIsProcessing(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({ history: [] });
      const result = await chat.sendMessage(userInput);
      const response = await result.response;
      setMessages([...newMessages, { role: "assistant", content: response.text() }]);
    } catch (error) {
      console.error("API Error:", error);
      setMessages([...newMessages, { role: "assistant", content: "Network response delayed. Please retry your submission." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "white", padding: "20px" }}>
      <h1>{business.name}</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ padding: "10px", background: m.role === "user" ? "#2563eb" : "#1e293b", borderRadius: "10px" }}>
            {m.content}
          </div>
        ))}
        <div ref={scrollAnchor} />
      </div>

      <form onSubmit={dispatchMessage} style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Ask ${business.name} anything...`}
          style={{ flex: 1, padding: "10px", borderRadius: "5px" }}
        />
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
        }
