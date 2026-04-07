import React from "react";

function WhatIfCard({ whatIfData, gradeMatching }) {
  return (
    <div className="card">
      <h3 className="section-title">📈 What-If Simulation</h3>

      <div className="mb-6 pb-6 border-b border-slate-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-2 font-semibold text-slate-700">Scenario</th>
              <th className="text-right py-3 px-2 font-semibold text-slate-700">Impact</th>
            </tr>
          </thead>
          <tbody>
            {whatIfData && whatIfData.slice(0, 5).map((scenario, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-2 text-slate-700">{scenario}</td>
                <td className="py-3 px-2 text-right">
                  <span className="badge-gold">Analyzed</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {gradeMatching && (
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-3">Closest Grade Match</p>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-navy-600">{gradeMatching.match}</p>
              <p className="text-sm text-slate-500">Reference alloy</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gold-500">{gradeMatching.confidence}%</p>
              <p className="text-xs text-slate-500">Match Score</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatIfCard;
