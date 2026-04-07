import React, { useState } from "react";
import Header from "./components/Header";
import InputCard from "./components/InputCard";
import Dashboard from "./components/Dashboard";
import HistoryPage from "./components/HistoryPage";
import ChatWidget from "./components/ChatWidget";
import Homepage from "./components/Homepage";
import "./index.css";
import "./styles/homepage.css";

function App() {
  const [result, setResult] = useState(null);
  const [originalComposition, setOriginalComposition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState("home"); // "home", "dashboard", or "history"

  const handleDashboardClick = () => {
    setCurrentView("dashboard");
    // Reset dashboard state
    setResult(null);
    setError(null);
  };

  const handleBackToHome = () => {
    setCurrentView("home");
  };

  const handleViewHistory = () => {
    setCurrentView("history");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  // Homepage View
  if (currentView === "home") {
    return <Homepage onNavigateToDashboard={handleDashboardClick} />;
  }

  // History View
  if (currentView === "history") {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header 
          result={result} 
          originalComposition={originalComposition} 
          onBack={handleBackToDashboard}
          onViewHistory={null}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HistoryPage />
        </main>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-50">
      <Header 
        result={result} 
        originalComposition={originalComposition} 
        onBack={handleBackToHome}
        onViewHistory={handleViewHistory}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <InputCard
          setResult={setResult}
          setOriginalComposition={setOriginalComposition}
          setLoading={setLoading}
          setError={setError}
        />

        {loading && (
          <div className="mt-8 flex justify-center items-center py-16">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-navy-500 animate-spin"></div>
            </div>
          </div>
        )}

        {result && !loading && <Dashboard data={result} originalComposition={originalComposition} onNavigateToHistory={handleViewHistory} />}

        {!result && !loading && !error && (
          <div className="mt-16 text-center py-12">
            <div className="text-5xl mb-4">🧪</div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Welcome to AI Alloy Designer</h2>
            <p className="text-slate-500">Enter alloy composition to predict properties and optimize formulations</p>
          </div>
        )}
      </main>

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: "fixed", bottom: 24, right: 24,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg,#00ffb3,#00c8ff)",
          border: "none", fontSize: 22, cursor: "pointer",
          zIndex: 1000, boxShadow: "0 4px 20px rgba(0,255,179,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#0a0a14", fontWeight: "bold",
        }}
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div
          style={{
            position: "fixed", bottom: 90, right: 24,
            width: 380, height: 520,
            borderRadius: 16, overflow: "hidden",
            zIndex: 1000,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            border: "1px solid rgba(0,255,179,0.2)",
          }}
        >
          <ChatWidget />
        </div>
      )}
    </div>
  );
}

export default App;
