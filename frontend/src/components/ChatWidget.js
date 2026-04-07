import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";

const CHAT_URL = "http://localhost:8000/api/chat/";

const SUGGESTIONS = [
  "What is Steel?",
  "Explain Titanium alloys",
  "Best alloy for aerospace?",
];

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const sendMessage = async (input) => {
    if (!input.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      console.log("📤 Sending:", input);

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await resp.json();
      console.log("📥 Response:", data);

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ Unexpected response from server." },
        ]);
      }
    } catch (e) {
      console.error("❌ Error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "linear-gradient(160deg,#0a0a14,#0d0d1a)" }}>
      
      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <div>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>
              Alloy AI Assistant
            </p>
            <p style={{ color: "#00ffb3", fontSize: 11, margin: 0 }}>
              ⬤ Powered by Groq
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#8888aa", marginTop: 24 }}>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
              How can I help you?
            </p>
            <p style={{ fontSize: 12, marginBottom: 20 }}>
              Ask me anything about alloys and materials.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(0,255,179,0.25)",
                    borderRadius: 12,
                    color: "#e8e8f0",
                    padding: "8px 14px",
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}

        {isLoading && <TypingIndicator />}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWidget;