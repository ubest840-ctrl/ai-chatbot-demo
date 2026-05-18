import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Add this line

// --- YOUR EXISTING INDUSTRIES OBJECT (Keep this as is) ---
const INDUSTRIES = {
  school: {
    name: "Bright Minds Tutorial Centre",
    systemPrompt: "You are the AI receptionist for Bright Minds Tutorial Centre in Anambra State, Nigeria. Fees: Primary ₦15,000/month, JSS ₦18,000/month... [your existing prompt]",
    // ... rest of your school data
  },
  // ... hotel, realestate
};

// --- START OF UPDATED LOGIC ---

// Initialize Gemini (In production, use VITE_GEMINI_KEY in .env)
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");

function App() {
  const [messages, setMessages] = useState([]);
  const [currentIndustry, setCurrentIndustry] = useState("school");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Add User Message to UI
    const newUserMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      // 2. Prepare Gemini Model with your System Prompt
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: INDUSTRIES[currentIndustry].systemPrompt 
      });

      // 3. Generate Response
      const result = await model.generateContent(text);
      const response = await result.response;
      const botText = response.text();

      // 4. Add Bot Message to UI
      setMessages((prev) => [...prev, { role: "assistant", content: botText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Abeg, I'm having a small network issue. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Your industry selector and chat UI code here */}
      {/* Ensure your Send button calls handleSendMessage */}
    </div>
  );
}

export default App;
