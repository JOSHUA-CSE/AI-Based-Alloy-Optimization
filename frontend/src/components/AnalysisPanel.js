import React, { useState } from "react";
import Dashboard from "./Dashboard";
import ComparisonInput from "./ComparisonInput";
import ComparisonTable from "./ComparisonTable";
import ComparisonChart from "./ComparisonChart";
import WhatIfScenario from "./WhatIfScenario";
import { compareCompositions, runWhatIfScenario } from "../services/api";

function AnalysisPanel({ data, originalComposition, onNavigateToHistory }) {
  const [activeTab, setActiveTab] = useState("single");
  const [comparisonResults, setComparisonResults] = useState(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  
  const tabs = [
    { id: "single", label: "Single Prediction", icon: "📊" },
    { id: "compare", label: "Compare Compositions", icon: "⚖️" },
    { id: "whatif", label: "What-If Analysis", icon: "🔍" },
  ];

  const handleCompare = async (compositions, comparisonName) => {
    try {
      setComparisonLoading(true);
      const response = await compareCompositions(compositions, comparisonName);
      setComparisonResults(response.data.comparison);
    } catch (error) {
      console.error("Comparison error:", error);
      alert("Error running comparison. Please try again.");
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 font-semibold transition border-b-2 text-sm md:text-base ${
                activeTab === tab.id
                  ? "border-b-4 border-blue-600 text-blue-600 bg-blue-50"
                  : "border-b-2 border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab 1: Single Prediction */}
          {activeTab === "single" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Single Alloy Prediction</h2>
              <Dashboard
                data={data}
                originalComposition={originalComposition}
                onNavigateToHistory={onNavigateToHistory}
              />
            </div>
          )}

          {/* Tab 2: Compare Compositions */}
          {activeTab === "compare" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Compare Multiple Alloy Compositions</h2>

              {!comparisonResults ? (
                <ComparisonInput
                  onCompare={handleCompare}
                  loading={comparisonLoading}
                  originalComposition={originalComposition}
                />
              ) : (
                <div className="space-y-6">
                  {/* Back Button */}
                  <button
                    onClick={() => setComparisonResults(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    ← Back to Input
                  </button>

                  {/* Results */}
                  <div className="space-y-6">
                    <ComparisonTable comparisonData={comparisonResults} />
                    <ComparisonChart comparisonData={comparisonResults} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: What-If Analysis */}
          {activeTab === "whatif" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Advanced What-If Scenarios</h2>
              <WhatIfScenario
                data={data}
                originalComposition={originalComposition}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnalysisPanel;
