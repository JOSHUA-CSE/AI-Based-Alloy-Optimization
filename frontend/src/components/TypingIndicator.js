import { Bot } from "lucide-react";

const TypingIndicator = () => (
  <div className="flex gap-3 items-end">
    <div
      className="w-9 h-9 rounded-2xl flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#00ffb3,#00c8ff)" }}
    >
      <Bot className="w-4 h-4" style={{ color: "#0a0a14" }} />
    </div>
    <div
      className="rounded-2xl px-4 py-3 flex gap-2 items-center"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(0,255,179,0.2)" }}
    >
      {[
        { delay: "0ms", color: "#00ffb3" },
        { delay: "160ms", color: "#00c8ff" },
        { delay: "320ms", color: "#ff6ef7" },
      ].map(({ delay, color }) => (
        <span
          key={delay}
          className="w-2.5 h-2.5 rounded-full animate-bounce"
          style={{ animationDelay: delay, background: color }}
        />
      ))}
    </div>
  </div>
);

export default TypingIndicator;
