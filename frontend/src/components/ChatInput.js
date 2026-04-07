import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

const ChatInput = ({ onSend, disabled }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    console.log("✉️ User input:", trimmed);

    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  }, [input]);

  const active = input.trim() && !disabled;

  return (
    <div
      className="px-4 pb-4 pt-3 border-t border-white/10"
      style={{ background: "rgba(10,10,22,0.95)" }}
    >
      <div
        className="flex items-end gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.1)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about alloys..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none"
          style={{ color: "#e8e8f0" }}
        />

        <button
          onClick={handleSend}
          disabled={!active}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={
            active
              ? {
                  background: "linear-gradient(135deg,#00ffb3,#00c8ff)",
                  color: "#0a0a14",
                }
              : {
                  background: "rgba(255,255,255,0.08)",
                  color: "#555",
                }
          }
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;