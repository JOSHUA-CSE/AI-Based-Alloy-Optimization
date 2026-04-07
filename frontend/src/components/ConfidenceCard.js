import React from "react";

function ConfidenceCard({ confidence, strength }) {
  const getReliability = (conf) => {
    if (conf >= 85) return "High Reliability";
    if (conf >= 70) return "Good Reliability";
    return "Moderate Reliability";
  };

  const getColor = (conf) => {
    if (conf >= 85) return "text-emerald-500";
    if (conf >= 70) return "text-blue-500";
    return "text-orange-500";
  };

  return (
    <div className="card flex flex-col items-center justify-center py-8">
      <div className="relative w-40 h-40 mb-6">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#grad)"
            strokeWidth="8"
            strokeDasharray={`${(confidence / 100) * 339.3} 339.3`}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4c542" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl font-bold text-navy-500">{confidence}%</p>
            <p className="text-xs text-slate-500 mt-1">Confidence</p>
          </div>
        </div>
      </div>

      <p className={`text-lg font-semibold ${getColor(confidence)}`}>
        ✓ {getReliability(confidence)}
      </p>
      <p className="text-sm text-slate-500 mt-2">Based on {strength?.toFixed(0)} MPa prediction</p>
    </div>
  );
}

export default ConfidenceCard;
