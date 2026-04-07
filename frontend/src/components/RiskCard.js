import React from "react";

function RiskCard({ risks, rootCause }) {
  const hasRisks = risks && risks.length > 0;

  // Handle root_cause whether it's array or string
  const rootCauseArray = Array.isArray(rootCause) 
    ? rootCause 
    : rootCause && typeof rootCause === "string" 
      ? rootCause.split(" | ").map(c => c.trim())
      : [];

  const hasRootCauses = rootCauseArray && rootCauseArray.length > 0;

  return (
    <div className="card">
      <h3 className="section-title">⚠️ Risk Analysis</h3>

      <div className="mb-6 pb-6 border-b border-slate-200">
        <p className="text-sm font-medium text-slate-700 mb-3">Detected Risks</p>
        {!hasRisks ? (
          <div className="flex items-center gap-2">
            <span className="badge-success">✓ No major risks detected</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {risks.map((risk, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2 rounded bg-red-50 border border-red-100">
                <span className="text-red-500 font-bold">!</span>
                <span className="text-sm text-red-700">{risk}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Root Causes</p>
        {hasRootCauses ? (
          <ul className="space-y-2">
            {rootCauseArray.slice(0, 5).map((cause, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-navy-500 font-bold mt-0.5">•</span>
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No significant root causes identified</p>
        )}
      </div>
    </div>
  );
}

export default RiskCard;
