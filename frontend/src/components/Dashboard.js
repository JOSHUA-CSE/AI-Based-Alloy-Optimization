import React from "react";
import PredictionCard from "./PredictionCard";
import ConfidenceCard from "./ConfidenceCard";
import RiskCard from "./RiskCard";
import RecommendationCard from "./RecommendationCard";
import OptimizationCard from "./OptimizationCard";
import WhatIfCard from "./WhatIfCard";
import ManagerDecisionPanel from "./ManagerDecisionPanel";

function Dashboard({ data, originalComposition, onNavigateToHistory }) {
  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Row 1: Predictions & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PredictionCard prediction={data.prediction} />
        <ConfidenceCard confidence={data.prediction?.confidence} strength={data.prediction?.strength} />
      </div>

      {/* Row 2: Risk & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RiskCard risks={data.risk_alerts} rootCause={data.root_cause} />
        <RecommendationCard recommendations={data.recommendations} deviationScore={data.deviation_score} />
      </div>

      {/* Row 3: Optimization & What-If */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OptimizationCard optimization={data.optimization} deviation={data.deviation_score} originalComposition={originalComposition} />
        <WhatIfCard whatIfData={data.what_if} gradeMatching={data.grade_matching} />
      </div>

      {/* Row 4: Manager Decision Panel */}
      <div className="grid grid-cols-1 gap-6">
        <ManagerDecisionPanel
          recommendations={data.recommendations}
          originalComposition={originalComposition}
          data={data}
          onDecisionSubmit={onNavigateToHistory}
        />
      </div>
    </div>
  );
}

export default Dashboard;
