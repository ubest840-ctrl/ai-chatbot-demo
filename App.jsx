import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Enterprise Multi-Tenant Configuration
const LOCAL_BUSINESSES = {
  school: {
    name: "Bright Minds Tutorial Centre",
    tagline: "Anambra State's Premier Academic Hub",
    themeColor: "#2563eb",
    avatar: "📚",
    systemPrompt: "You are the professional, highly welcoming AI front-desk receptionist for Bright Minds Tutorial Centre in Anambra State, Nigeria. Your goal is to answer parents' inquiries and guide them to register. Fees: Primary ₦15,000/month, JSS ₦18,000/month, SSS ₦22,000/month. Lesson hours: 2 PM - 6 PM daily. IMPORTANT: Once a parent shows genuine interest, politely ask for their Name and WhatsApp number so the administrator can follow up with registration forms. When they give it to you, acknowledge it warmly."
  },
  hotel: {
    name: "Luxe Haven Suites",
    tagline: "Experience Premium Comfort & Security",
    themeColor: "#16a34a",
    avatar: "🏨",
    systemPrompt: "You are the luxury virtual concierge AI for Luxe Haven Suites in Nigeria. You provide flawless hospitality support. Room Rates: Deluxe ₦85,000/night, Executive ₦150,000/night. Amenities include 24/7 power, premium security, and a rooftop pool. IMPORTANT: When a guest wants to reserve a room, ask for their full name and mobile number to temporarily hold the slot. Acknowledge the details immediately once provided."
  },
  realestate: {
    name: "Sarah Real Estate Assistant",
    tagline: "Secure High-Yield Land & Property Assets",
    themeColor: "#7c3aed",
    avatar: "🏡",
    systemPrompt: "You are Sarah, an expert AI real estate consultant specializing in prime lands and luxury residential developments across Lagos and Abuja. Always ask the client for their budget range and preferred location early. IMPORTANT: Once they show interest in booking a site physical inspection, ask for their full name and active WhatsApp number to confirm their inspection pass. Let them know a human agent will contact them shortly."
  }
};

// Define the structural schema so Gemini knows exactly how to format the lead data
const leadCaptureDeclaration = {
  name: "captureCustomerLead",
  description: "Extracts customer contact data when they voluntarily offer their name, phone number, or booking intent.",
  parameters: {
    type: "OBJECT",
    properties: {
      fullName: { type: "STRING", description: "The full name of the customer." },
      phoneNumber: { type: "STRING", description: "The WhatsApp or phone number provided by the user." },
      notes: { type: "STRING", description: "Context such as 'Wants to book Deluxe room' or 'Parent looking at JSS fees'." }
    },
    required: ["fullName", "phoneNumber"]
  }
};

// Initialize Safe Serverless AI Bridge
const apiKey = import.meta.env.VITE_GEMINI_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export default function App() {
  const [activeTenant, setActiveTenant] = useState("school");
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Real-time UI dashboard storage for captured leads
  const [capturedLeads, setCapturedLeads] = useState([]);
  
  const scrollAnchor = useRef(null);
  const business = LOCAL_BUSINESSES[activeTenant];

  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  useEffect(() => {
    setMessages([
      {
        id: "init-welcome",
        role: "assistant",
        content: `Good day! Welcome to ${business.name}. I am your automated assistant. How can I help you with our services today?`
      }
    ]);
  }, [activeTenant]);

  // Production-grade backend gateway script simulator
  const saveLeadToDatabase = (fullName, phoneNumber, notes) => {
    const newLead = {
      id: crypto.randomUUID(),
      business: business.name,
      name: fullName,
      phone: phoneNumber,
      notes: notes || "No additional remarks",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setCapturedLeads((prev) => [newLead, ...prev]);
    console.log("🚀 Lead securely saved to local cluster:", newLead);
    
    // Developer Tip: This is where you call a simple fetch() to send the lead to an external Google Sheet API or webhook.
  };

  const dispatchMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const nativeText = userInput.trim();
    setUserInput("");

    const userPayload = { id: crypto.randomUUID(), role: "user", content: nativeText };
    setMessages((prev) => [...prev, userPayload]);
    setIsProcessing(false); // set to true if api works, but let logic flow

    if (!genAI) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "System Alert: Configuration error. Please define the VITE_GEMINI_KEY environment variable inside your Vercel Dashboard settings."
        }]);
      }, 600);
      return;
    }

    setIsProcessing(true);

    try {
      // Connect to Gemini 2.5 Flash and supply the Function Calling tools configuration
      const runtimeModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: business.systemPrompt,
        tools: [{ functionDeclarations: [leadCaptureDeclaration] }]
      });

      const computation = await runtimeModel.generateContent(nativeText);
      const responseStream = await computation.response;
      
      // Check if Gemini decided to invoke our data extraction tool
      const functionCalls = responseStream.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "captureCustomerLead") {
          const { fullName, phoneNumber, notes } = call.args;
          
          // Trigger internal database safe write execution
          saveLeadToDatabase(fullName, phoneNumber, notes);

          // Request the model to smoothly continue the dialogue after reading the data
          const followUpModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: business.systemPrompt + `\n\nCONTEXT: The user just gave their name (${fullName}) and number (${phoneNumber}). Acknowledge receipt of these specific details and give a definitive reassuring closing statement. Do not repeat the function name.`,
          });
          const followUpComputation = await followUpModel.generateContent(nativeText);
          const followUpStream = await followUpComputation.response;
          
          setMessages((prev) => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: followUpStream.text()
          }]);
        }
      } else {
        // Standard textual narrative path
        const definitiveReply = responseStream.text();
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: definitiveReply
        }]);
      }
    } catch (fault) {
      console.error("AI Communication Fault:", fault);
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Network response delayed. Please retry your submission."
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#0b0f19", color: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      
      {/* Structural Control Sidebar */}
      <div style={{ width: "280px", backgroundColor: "#111827", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "16px", borderRight: "1px solid #1f2937" }}>
        <div style={{ paddingBottom: "12px", borderBottom: "1px solid #1f2937" }}>
          <h1 style={{ fontSize: "16px", margin: 0, fontWeight: "bold", letterSpacing: "0.5px", color: "#38bdf8" }}>Local AI Agency</h1>
          <p style={{ fontSize: "12px", margin: "4px 0 0 0", color: "#6b7280" }}>Active Client Multi-Demos</p>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Object.keys(LOCAL_BUSINESSES).map((id) => (
            <button
              key={id}
              onClick={() => setActiveTenant(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: "14px",
                fontWeight: "600",
                backgroundColor: activeTenant === id ? LOCAL_BUSINESSES[id].themeColor : "#1f2937",
                color: "#ffffff",
                transition: "background-color 0.2s"
              }}
            >
              <span style={{ fontSize: "18px" }}>{LOCAL_BUSINESSES[id].avatar}</span>
              <span>{LOCAL_BUSINESSES[id].name.split(" ")[0]} Project</span>
            </button>
          ))}
        </div>

        {/* Live Internal Agency CRM Dashboard */}
        <div style={{ flex: 1, marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid #1f2937", paddingTop: "20px", overflowY: "auto" }}>
          <h3 style={{ fontSize: "12px", margin: 0, textTransform: "uppercase", color: "#94a3b8", letterSpacing: "0.5px" }}>Captured Live Leads ({capturedLeads.length})</h3>
          {capturedLeads.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#4b5563", fontStyle: "italic", margin: 0 }}>No lead captures triggered yet. Try feeding the bot a name and phone number to test.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {capturedLeads.map((lead) => (
                <div key={lead.id} style={{ padding: "10px", borderRadius: "8px", backgroundColor: "#1f2937", fontSize: "12px", borderLeft: `3px solid ${business.themeColor}` }}>
                  <div style={{ fontWeight: "bold", display: "flex", justifyContent: "between", alignItems: "center" }}>
                    <span>{lead.name}</span>
                    <span style={{ fontSize: "10px", color: "#6b7280", marginLeft: "auto" }}>{lead.timestamp}</span>
                  </div>
                  <div style={{ color: "#38bdf8", margin: "2px 0" }}>{lead.phone}</div>
                  <div style={{ color: "#94a3b8", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lead.notes}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Communication Frame */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#0f172a" }}>
        
        {/* Top Operational Header */}
        <div style={{ padding: "20px 32px", borderBottom: "1px solid #1f2937", backgroundColor: "#111827", display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "28px", padding: "10px", borderRadius: "12px", backgroundColor: "#1f2937" }}>{business.avatar}</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{business.name}</h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>{business.tagline}</p>
          </div>
        </div>

        {/* Messaging History Container */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {messages.map((item) => (
            <div 
              key={item.id} 
              style={{ 
                display: "flex", 
                justifyContent: item.role === "user" ? "flex-end" : "flex-start" 
              }}
            >
              <div style={{
                maxWidth: "65%",
                padding: "14px 18px",
                borderRadius: "14px",
                lineHeight: "1.6",
                fontSize: "14.5px",
                backgroundColor: item.role === "user" ? business.themeColor : "#1e293b",
                color: "#ffffff",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}>
                {item.content}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "12px 18px", borderRadius: "14px", backgroundColor: "#1e293b", color: "#94a3b8", fontSize: "13px" }}>
                AI processing context...
              </div>
            </div>
          )}
          <div ref={scrollAnchor} />
        </div>

        {/* User Interaction Input Form */}
        <form onSubmit={dispatchMessage} style={{ padding: "24px 32px", borderTop: "1px solid #1f2937", backgroundColor: "#111827", display: "flex", gap: "16px" }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Ask ${business.name} anything...`}
            style={{
              flex: 1,
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #334155",
              backgroundColor: "#1e293b",
              color: "#ffffff",
              fontSize: "14.5px",
              outline: "none"
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: "0 28px", 
              borderRadius: "10px", 
              border: "none", 
              backgroundColor: business.themeColor, 
              color: "#ffffff", 
              fontSize: "14.5px", 
              fontWeight: "700", 
              cursor: "pointer" 
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
