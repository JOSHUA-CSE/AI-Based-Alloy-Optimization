import React from "react";

function RecommendationCard({ recommendations, deviationScore }) {
  return (
    <div className="card">
      <h3 className="section-title">💡 Recommendations</h3>

      <div className="mb-6 pb-6 border-b border-slate-200">
        <p className="text-sm font-medium text-slate-700 mb-3">Deviation Score</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Optimality Gap</span>
            <span className="font-semibold text-navy-500">{deviationScore?.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              style={{ width: `${Math.min(100, (100 - deviationScore * 5))}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Suggested Changes</p>
        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.slice(0, 4).map((rec, idx) => {
              const isIncrease = rec.includes("Increase");
              return (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-100">
                  <span className={isIncrease ? "badge-success" : "badge-danger"}>
                    {isIncrease ? "↑" : "↓"}
                  </span>
                  <span className="text-sm text-slate-700">{rec}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Composition is already optimal</p>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;
