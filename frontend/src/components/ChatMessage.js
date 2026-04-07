import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

const ChatMessage = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`flex gap-3 items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center"
        style={isUser
          ? { background: "linear-gradient(135deg,#ff6ef7,#ff9a3c)" }
          : { background: "linear-gradient(135deg,#00ffb3,#00c8ff)" }}
      >
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4" style={{ color: "#0a0a14" }} />}
      </div>
      <div
        className="max-w-[75%] px-4 py-3 text-sm rounded-2xl"
        style={isUser
          ? { background: "linear-gradient(135deg,#ff6ef7,#ff9a3c)", color: "#fff" }
          : { background: "rgba(255,255,255,0.06)", color: "#e8e8f0", border: "1px solid rgba(0,255,179,0.2)" }}
      >
        {isUser
          ? <p className="whitespace-pre-wrap">{content}</p>
          : <ReactMarkdown>{content}</ReactMarkdown>}
      </div>
    </div>
  );
};

export default ChatMessage;
