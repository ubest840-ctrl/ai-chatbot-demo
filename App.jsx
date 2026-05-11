import { useState, useRef, useEffect } from "react";

const INDUSTRIES = {
  school: {
    name: "Bright Minds Tutorial Centre",
    emoji: "🎓",
    color: "#1a73e8",
    accent: "#fbbc04",
    tagline: "Excellence in Learning",
    avatar: "BM",
    systemPrompt: `You are the AI receptionist for Bright Minds Tutorial Centre in Anambra State, Nigeria. 
You help parents and students with:
- FAQs about programs (Primary, JSS, SSS, JAMB, WAEC prep)
- Fees: Primary ₦15,000/month, JSS ₦18,000/month, SSS ₦22,000/month, JAMB Intensive ₦35,000
- Booking trial classes (Mon-Sat, 8am-6pm)
- Lead capture (name, phone, child's class)
- Generating fee quotes

Be warm, professional, speak like a Nigerian educator. Keep responses short and helpful. 
If they want to enroll or book, ask for: Name, Child's name, Class/Level, Phone number.
Format quotes clearly with ₦ currency. Always end with a helpful follow-up question.`,
    quickReplies: ["What are your fees?", "Book a trial class", "JAMB prep program", "Contact details"],
  },
  hotel: {
    name: "Oasis Guesthouse & Suites",
    emoji: "🏨",
    color: "#2d6a4f",
    accent: "#f4a261",
    tagline: "Your Comfort, Our Pride",
    avatar: "OG",
    systemPrompt: `You are the AI concierge for Oasis Guesthouse & Suites in Anambra State, Nigeria.
You help guests with:
- Room types & prices: Standard ₦15,000/night, Deluxe ₦22,000/night, Suite ₦35,000/night
- Amenities: Free WiFi, AC, 24hr security, complimentary breakfast on Deluxe/Suite
- Booking appointments and reservations
- FAQs about check-in (12pm), check-out (11am), parking, food options
- Lead capture for bookings

Be hospitable, warm, Nigerian-friendly. Keep responses concise.
For bookings, collect: Guest name, phone, check-in date, check-out date, room type, number of guests.
Always confirm availability enthusiastically and upsell gently.`,
    quickReplies: ["Room prices", "Book a room", "Amenities & services", "Check-in info"],
  },
  realestate: {
    name: "Apex Properties Nigeria",
    emoji: "🏠",
    color: "#7b2d8b",
    accent: "#e9c46a",
    tagline: "Find Your Dream Property",
    avatar: "AP",
    systemPrompt: `You are the AI property consultant for Apex Properties Nigeria in Anambra State.
You help clients with:
- Property listings: 2-bedroom flats from ₦800k/yr rent, 3-bedroom ₦1.2M/yr, Land from ₦2M, Houses for sale from ₦15M
- Booking inspection appointments (Mon-Sat, 9am-5pm)
- FAQs about buying, renting, land documentation (C of O, Survey)
- Lead capture for serious buyers/renters
- Generating property quotes and estimates

Be confident, knowledgeable, professional. Speak with authority on Nigerian real estate.
For leads, collect: Name, phone, budget, property interest (rent/buy/land), preferred area.
Always create urgency — "properties move fast in Anambra."`,
    quickReplies: ["Available properties", "Book inspection", "Rental prices", "Buy land/house"],
  },
};

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", background: "#f1f3f4", borderRadius: "18px 18px 18px 4px", width: "fit-content", marginBottom: 8 }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 8, height: 8, borderRadius: "50%", background: "#999",
        animation: "bounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

const Message = ({ msg, color }) => {
  const isBot = msg.role === "assistant";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 10 }}>
      <div style={{
        maxWidth: "78%",
        padding: "11px 15px",
        borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
        background: isBot ? "#f1f3f4" : color,
        color: isBot ? "#1a1a1a" : "#fff",
        fontSize: 14,
        lineHeight: 1.55,
        whiteSpace: "pre-wrap",
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}>
        {msg.content}
      </div>
    </div>
  );
};

function ChatWindow({ industry, onClose }) {
  const biz = INDUSTRIES[industry];
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hello! Welcome to ${biz.name} 👋\n\nI'm your AI assistant. I can help you with pricing, bookings, FAQs, and more.\n\nHow can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: biz.systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again shortly." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      fontFamily: "'Segoe UI', sans-serif", background: "#fff", borderRadius: 16, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
    }}>
      {/* Header */}
      <div style={{ background: biz.color, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 14, color: "#fff",
        }}>{biz.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{biz.name}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, background: "#4cff91", borderRadius: "50%", display: "inline-block" }} />
            AI Assistant • Online now
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", opacity: 0.8 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", background: "#fafafa" }}>
        {messages.map((m, i) => <Message key={i} msg={m} color={biz.color} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div style={{ padding: "8px 14px 0", display: "flex", gap: 7, flexWrap: "wrap", background: "#fff" }}>
        {biz.quickReplies.map(q => (
          <button key={q} onClick={() => send(q)} disabled={loading} style={{
            padding: "6px 12px", borderRadius: 20, border: `1.5px solid ${biz.color}`,
            background: "#fff", color: biz.color, fontSize: 12, cursor: "pointer", fontWeight: 600,
            opacity: loading ? 0.5 : 1, transition: "all 0.2s",
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px 14px", background: "#fff", display: "flex", gap: 8, alignItems: "center" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 24, border: "1.5px solid #e0e0e0",
            fontSize: 14, outline: "none", background: "#f5f5f5",
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{
          width: 40, height: 40, borderRadius: "50%", background: biz.color,
          border: "none", color: "#fff", fontSize: 18, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: (!input.trim() || loading) ? 0.5 : 1, transition: "opacity 0.2s",
        }}>➤</button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeIndustry, setActiveIndustry] = useState(null);
  const [openChat, setOpenChat] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Segoe UI', sans-serif", padding: "30px 20px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card:hover { transform: translateY(-4px) !important; box-shadow: 0 16px 40px rgba(0,0,0,0.35) !important; }
        .card { transition: all 0.25s ease !important; }
        .try-btn:hover { opacity: 0.9 !important; transform: scale(1.03) !important; }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp 0.7s ease" }}>
        <div style={{ fontSize: 13, color: "#a78bfa", letterSpacing: 3, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>
          🤖 AI Chatbot Demo Suite
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(24px, 5vw, 42px)", fontWeight: 800, margin: "0 0 12px", lineHeight: 1.2 }}>
          AI Chatbots for<br /><span style={{ color: "#a78bfa" }}>Local Nigerian Businesses</span>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
          Live demos — click any business below and chat with a real AI assistant trained for that industry.
        </p>
      </div>

      {/* Industry Cards */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", maxWidth: 900, width: "100%", marginBottom: 40 }}>
        {Object.entries(INDUSTRIES).map(([key, biz], i) => (
          <div key={key} className="card" style={{
            background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20,
            padding: "28px 24px", width: 240, cursor: "pointer",
            animation: `fadeUp 0.6s ease ${i * 0.15}s both`,
          }} onClick={() => { setActiveIndustry(key); setOpenChat(key); }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{biz.emoji}</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{biz.name}</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 18 }}>{biz.tagline}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {["FAQs", "Leads", "Booking", "Quotes"].map(tag => (
                <span key={tag} style={{
                  background: `${biz.color}33`, color: biz.accent,
                  borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                }}>{tag}</span>
              ))}
            </div>
            <button className="try-btn" style={{
              width: "100%", padding: "10px 0", borderRadius: 10,
              background: biz.color, border: "none", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
            }}>💬 Chat Now</button>
          </div>
        ))}
      </div>

      {/* Value Props */}
      <div style={{
        display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
        maxWidth: 760, marginBottom: 30,
      }}>
        {[
          { icon: "⚡", text: "Responds in seconds, 24/7" },
          { icon: "🇳🇬", text: "Trained for Nigerian market" },
          { icon: "📲", text: "Website + WhatsApp ready" },
          { icon: "💰", text: "Captures leads automatically" },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 10,
            padding: "10px 18px", color: "rgba(255,255,255,0.75)",
            fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <span style={{ fontSize: 18 }}>{icon}</span> {text}
          </div>
        ))}
      </div>

      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textAlign: "center" }}>
        Built with Claude AI • Customizable for any business in 24hrs
      </div>

      {/* Chat Modal */}
      {openChat && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 16, backdropFilter: "blur(4px)",
        }} onClick={e => e.target === e.currentTarget && setOpenChat(null)}>
          <div style={{ width: "100%", maxWidth: 400, height: 580, animation: "fadeUp 0.3s ease" }}>
            <ChatWindow industry={openChat} onClose={() => setOpenChat(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
