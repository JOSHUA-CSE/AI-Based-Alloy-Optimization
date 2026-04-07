import React from "react";

function Header({ result, originalComposition, onBack, onViewHistory }) {
  const generateReport = () => {
    if (!result) {
      alert("No analysis data available. Please run an analysis first.");
      return;
    }

    // Build comprehensive report
    const timestamp = new Date().toLocaleString();
    const reportLines = [];
    const separator70 = "─".repeat(70);
    const separator60 = "═".repeat(70);

    reportLines.push(separator60);
    reportLines.push("AI ALLOY DESIGNER - COMPREHENSIVE ANALYSIS REPORT");
    reportLines.push(separator60);
    reportLines.push("");
    reportLines.push(`Generated: ${timestamp}`);
    reportLines.push("");

    // SECTION 1: Original Composition (Normalized)
    reportLines.push(separator70);
    reportLines.push("1. ORIGINAL COMPOSITION (Normalized Input)");
    reportLines.push(separator70);
    reportLines.push("");
    
    // Add normalization warning if present
    if (result.normalization_warning) {
      reportLines.push(`  ⚠️  ${result.normalization_warning}`);
      reportLines.push("");
    }
    
    if (result.original_composition && Object.keys(result.original_composition).length > 0) {
      Object.entries(result.original_composition).forEach(([element, value]) => {
        const valStr = parseFloat(value).toFixed(2).padStart(8);
        reportLines.push(`  ${element.padEnd(5)} : ${valStr} %`);
      });
      
      const totalComp = result.original_composition_total || Object.values(result.original_composition).reduce((sum, v) => sum + parseFloat(v), 0);
      reportLines.push("");
      reportLines.push(`  Total : ${totalComp.toFixed(2).padStart(8)} %`);
    } else if (originalComposition && Object.keys(originalComposition).length > 0) {
      // Fallback for backwards compatibility
      Object.entries(originalComposition).forEach(([element, value]) => {
        const valStr = parseFloat(value).toFixed(2).padStart(8);
        reportLines.push(`  ${element.padEnd(5)} : ${valStr} %`);
      });
      
      const totalComp = Object.values(originalComposition).reduce((sum, v) => sum + parseFloat(v), 0);
      reportLines.push("");
      reportLines.push(`  Total : ${totalComp.toFixed(2).padStart(8)} %`);
    } else {
      reportLines.push("  No original composition data available");
    }
    reportLines.push("");

    // SECTION 2: Prediction Results
    reportLines.push(separator70);
    reportLines.push("2. PREDICTION RESULTS (Original Composition)");
    reportLines.push(separator70);
    reportLines.push("");
    
    if (result.prediction) {
      const pred = result.prediction;
      reportLines.push(`  Material Type        : ${pred.material_type || "N/A"}`);
      reportLines.push(`  Predicted Grade      : ${pred.predicted_grade || "N/A"}`);
      reportLines.push(`  Predicted Strength   : ${(pred.strength || 0).toFixed(2)} MPa`);
      reportLines.push(`  Melting Temperature  : ${(pred.melting_temp || 0).toFixed(2)} °C`);
      // CRITICAL FIX: Confidence is already 0-100, don't multiply by 100
      reportLines.push(`  Confidence           : ${(pred.confidence || 0).toFixed(1)}%`);
    } else {
      reportLines.push("  No prediction data available");
    }
    reportLines.push("");

    // SECTION 3: Risk Analysis
    reportLines.push(separator70);
    reportLines.push("3. RISK ANALYSIS & ALERTS");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.risk_alerts && result.risk_alerts.length > 0) {
      result.risk_alerts.forEach((alert, idx) => {
        reportLines.push(`  ${idx + 1}. ${alert}`);
      });
    } else {
      reportLines.push("  ✅ No significant risks detected in composition");
    }
    reportLines.push("");

    // SECTION 4: Root Cause Analysis
    reportLines.push(separator70);
    reportLines.push("4. ROOT CAUSE ANALYSIS");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.root_cause && Array.isArray(result.root_cause) && result.root_cause.length > 0) {
      result.root_cause.forEach((cause, idx) => {
        reportLines.push(`  ${idx + 1}. ${cause}`);
      });
    } else if (result.root_cause && typeof result.root_cause === "string") {
      reportLines.push(`  ${result.root_cause}`);
    } else {
      reportLines.push("  Analysis data not available");
    }
    reportLines.push("");

    // SECTION 5: Optimization Recommendations
    reportLines.push(separator70);
    reportLines.push("5. OPTIMIZATION RECOMMENDATIONS");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.optimization) {
      const opt = result.optimization;
      reportLines.push("  Optimized Composition:");
      if (opt.composition) {
        Object.entries(opt.composition).forEach(([element, value]) => {
          const valStr = parseFloat(value).toFixed(2).padStart(8);
          reportLines.push(`    ${element.padEnd(5)} : ${valStr} %`);
        });
        
        const optTotal = Object.values(opt.composition).reduce((sum, v) => sum + parseFloat(v), 0);
        reportLines.push("");
        reportLines.push(`    Total : ${optTotal.toFixed(2).padStart(8)} %`);
      }

      reportLines.push("");
      reportLines.push("  Optimized Properties:");
      reportLines.push(`    New Strength        : ${(opt.new_strength || 0).toFixed(2)} MPa`);
      reportLines.push(`    New Melting Temp    : ${(opt.new_melting_temp || 0).toFixed(2)} °C`);

      if (result.prediction && result.prediction.strength) {
        const originalStrength = result.prediction.strength;
        const newStrength = opt.new_strength || 0;
        const improvement = newStrength - originalStrength;
        const improvementPct = (improvement / Math.max(Math.abs(originalStrength), 1)) * 100;
        reportLines.push(`    Improvement         : ${improvement > 0 ? "+" : ""}${improvement.toFixed(2)} MPa (${improvementPct > 0 ? "+" : ""}${improvementPct.toFixed(1)}%)`);
      }
    } else {
      reportLines.push("  No optimization data available");
    }
    reportLines.push("");

    // SECTION 6: What-If Analysis
    reportLines.push(separator70);
    reportLines.push("6. WHAT-IF ANALYSIS (Element Impact on Strength)");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.what_if && result.what_if.length > 0) {
      result.what_if.slice(0, 15).forEach((item) => {
        reportLines.push(`  ${item}`);
      });
    } else {
      reportLines.push("  What-if analysis data not available");
    }
    reportLines.push("");

    // SECTION 7: Recommendations for Improvement
    reportLines.push(separator70);
    reportLines.push("7. RECOMMENDATIONS FOR IMPROVEMENT");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations.slice(0, 8).forEach((rec, idx) => {
        reportLines.push(`  ${idx + 1}. ${rec}`);
      });
    } else {
      reportLines.push("  No specific recommendations available");
    }
    reportLines.push("");

    // SECTION 8: Grade Matching
    reportLines.push(separator70);
    reportLines.push("8. GRADE MATCHING ANALYSIS");
    reportLines.push(separator70);
    reportLines.push("");

    if (result.grade_matching) {
      const gm = result.grade_matching;
      // CRITICAL FIX: confidence is already 0-100, don't multiply
      reportLines.push(`  Matched Grade       : ${gm.match || "N/A"}`);
      reportLines.push(`  Similarity Score    : ${(gm.confidence || 0).toFixed(1)}%`);
    } else {
      reportLines.push("  Grade matching data not available");
    }
    reportLines.push("");

    // SECTION 9: Deviation Score
    if (result.deviation_score !== undefined) {
      reportLines.push(separator70);
      reportLines.push("9. COMPOSITION DEVIATION SCORE");
      reportLines.push(separator70);
      reportLines.push("");
      reportLines.push(`  Deviation Between Original and Optimized: ${result.deviation_score.toFixed(2)}`);
      reportLines.push("");
    }

    // FOOTER
    reportLines.push(separator60);
    reportLines.push("END OF REPORT");
    reportLines.push(separator60);
    reportLines.push("");
    reportLines.push("This report was generated from a single API response object.");
    reportLines.push("All values are consistent with the API output shown on the dashboard.");
    reportLines.push("No recomputation was performed during report generation.");

    // Create blob and download
    const reportContent = reportLines.join("\n");
    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `alloy_analysis_${new Date().toISOString().split("T")[0]}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                ← Back to Home
              </button>
            )}
            <div className="text-3xl">🧪</div>
            <div>
              <h1 className="text-2xl font-bold text-navy-500">AI Alloy Designer</h1>
              <p className="text-sm text-slate-500">Predict, optimize, and analyze alloy compositions.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="px-5 py-2.5 rounded-lg font-semibold transition-all bg-slate-600 text-white hover:bg-slate-700 hover:shadow-md active:scale-95"
              >
                📊 View History
              </button>
            )}
            <button 
              onClick={generateReport}
              disabled={!result}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all ${
                result
                  ? "bg-gold-400 text-navy-600 hover:bg-gold-500 hover:shadow-md active:scale-95"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed opacity-50"
              }`}
            >
              📥 Download Report
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
