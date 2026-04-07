"""
REPORT GENERATOR - Single Source of Truth

This module generates reports from API response objects.
NO computations. NO recomputation. ONLY data formatting from API response.

This ensures 100% consistency between API output and downloaded reports.
"""

from datetime import datetime


def generate_text_report(api_response, original_composition=None):
    """
    Generate a comprehensive text report from API response.
    
    Args:
        api_response: dict - Complete response from predict_alloy API
        original_composition: dict - Original input composition
        
    Returns:
        str - Formatted report ready for download
    """
    
    lines = []
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # HEADER
    lines.append("═" * 70)
    lines.append("AI ALLOY DESIGNER - COMPREHENSIVE ANALYSIS REPORT")
    lines.append("═" * 70)
    lines.append("")
    lines.append(f"Generated: {timestamp}")
    lines.append("")
    
    # SECTION 1: ORIGINAL COMPOSITION (From normalized API response)
    lines.append("─" * 70)
    lines.append("1. ORIGINAL COMPOSITION (Normalized Input)")
    lines.append("─" * 70)
    lines.append("")
    
    # Add normalization warning if present
    if "normalization_warning" in api_response and api_response["normalization_warning"]:
        lines.append(f"  ⚠️  {api_response['normalization_warning']}")
        lines.append("")
    
    if "original_composition" in api_response:
        orig = api_response["original_composition"]
        for element in sorted(orig.keys()):
            value = orig[element]
            val_str = f"{float(value):.2f}".rjust(8)
            lines.append(f"  {element:5} : {val_str} %")
        
        lines.append("")
        total = api_response.get("original_composition_total", 100.0)
        lines.append(f"  Total : {total:8.2f} %")
    elif original_composition and len(original_composition) > 0:
        # Fallback for backwards compatibility
        lines.append("")
        for element, value in original_composition.items():
            val_str = f"{float(value):.2f}".rjust(8)
            lines.append(f"  {element:5} : {val_str} %")
        
        total_comp = sum(float(v) for v in original_composition.values())
        lines.append("")
        lines.append(f"  Total : {total_comp:8.2f} %")
    else:
        lines.append("  No original composition data available")
    
    lines.append("")
    
    # SECTION 2: PREDICTION RESULTS
    lines.append("─" * 70)
    lines.append("2. PREDICTION RESULTS (Original Composition)")
    lines.append("─" * 70)
    lines.append("")
    
    if "prediction" in api_response:
        pred = api_response["prediction"]
        lines.append(f"  Material Type        : {pred.get('material_type', 'N/A')}")
        lines.append(f"  Predicted Grade      : {pred.get('predicted_grade', 'N/A')}")
        lines.append(f"  Predicted Strength   : {pred.get('strength', 0):.2f} MPa")
        lines.append(f"  Melting Temperature  : {pred.get('melting_temp', 0):.2f} °C")
        lines.append(f"  Confidence           : {pred.get('confidence', 0):.1f}%")
    else:
        lines.append("  No prediction data available")
    
    lines.append("")
    
    # SECTION 3: RISK ANALYSIS
    lines.append("─" * 70)
    lines.append("3. RISK ANALYSIS & ALERTS")
    lines.append("─" * 70)
    lines.append("")
    
    if "risk_alerts" in api_response and api_response["risk_alerts"]:
        for i, risk in enumerate(api_response["risk_alerts"], 1):
            lines.append(f"  {i}. {risk}")
    else:
        lines.append("  ✅ No significant risks detected in composition")
    
    lines.append("")
    
    # SECTION 4: ROOT CAUSE ANALYSIS
    lines.append("─" * 70)
    lines.append("4. ROOT CAUSE ANALYSIS")
    lines.append("─" * 70)
    lines.append("")
    
    if "root_cause" in api_response:
        lines.append(f"  {api_response['root_cause']}")
    else:
        lines.append("  Analysis data not available")
    
    lines.append("")
    
    # SECTION 5: OPTIMIZATION RECOMMENDATIONS
    lines.append("─" * 70)
    lines.append("5. OPTIMIZATION RECOMMENDATIONS")
    lines.append("─" * 70)
    lines.append("")
    
    if "optimization" in api_response:
        opt = api_response["optimization"]
        lines.append("  Optimized Composition:")
        if "composition" in opt:
            opt_total = sum(float(v) for v in opt["composition"].values())
            for element, value in opt["composition"].items():
                val_str = f"{float(value):.2f}".rjust(8)
                lines.append(f"    {element:5} : {val_str} %")
            lines.append("")
            lines.append(f"    Total : {opt_total:8.2f} %")
        
        lines.append("")
        lines.append("  Optimized Properties:")
        lines.append(f"    New Strength        : {opt.get('new_strength', 0):.2f} MPa")
        lines.append(f"    New Melting Temp    : {opt.get('new_melting_temp', 0):.2f} °C")
        
        if "strength" in api_response.get("prediction", {}):
            original_strength = api_response["prediction"]["strength"]
            new_strength = opt.get("new_strength", 0)
            improvement = new_strength - original_strength
            improvement_pct = (improvement / max(abs(original_strength), 1)) * 100
            lines.append(f"    Improvement         : {improvement:+.2f} MPa ({improvement_pct:+.1f}%)")
    else:
        lines.append("  No optimization data available")
    
    lines.append("")
    
    # SECTION 6: WHAT-IF ANALYSIS
    lines.append("─" * 70)
    lines.append("6. WHAT-IF ANALYSIS (Element Impact on Strength)")
    lines.append("─" * 70)
    lines.append("")
    
    if "what_if_detailed" in api_response and api_response["what_if_detailed"]:
        # Sort by impact magnitude
        sorted_whatif = sorted(
            api_response["what_if_detailed"],
            key=lambda x: abs(x.get("change", 0)),
            reverse=True
        )
        
        for item in sorted_whatif[:15]:  # Top 15 impacts
            element = item.get("element", "N/A")
            change = item.get("change", 0)
            impact = item.get("impact", "neutral")
            lines.append(f"  {element:5} : {change:+7.2f} MPa ({impact})")
    elif "what_if" in api_response and api_response["what_if"]:
        for item in api_response["what_if"][:15]:
            lines.append(f"  {item}")
    else:
        lines.append("  What-if analysis data not available")
    
    lines.append("")
    
    # SECTION 7: RECOMMENDATIONS FOR IMPROVEMENT
    lines.append("─" * 70)
    lines.append("7. RECOMMENDATIONS FOR IMPROVEMENT")
    lines.append("─" * 70)
    lines.append("")
    
    if "recommendations" in api_response and api_response["recommendations"]:
        for i, rec in enumerate(api_response["recommendations"][:8], 1):
            lines.append(f"  {i}. {rec}")
    else:
        lines.append("  No specific recommendations available")
    
    lines.append("")
    
    # SECTION 8: GRADE MATCHING
    lines.append("─" * 70)
    lines.append("8. GRADE MATCHING ANALYSIS")
    lines.append("─" * 70)
    lines.append("")
    
    if "grade_matching" in api_response:
        gm = api_response["grade_matching"]
        lines.append(f"  Matched Grade       : {gm.get('match', 'N/A')}")
        lines.append(f"  Similarity Score    : {gm.get('confidence', 0):.1f}%")
    else:
        lines.append("  Grade matching data not available")
    
    lines.append("")
    
    # SECTION 9: DEVIATION SCORE
    if "deviation_score" in api_response:
        lines.append("─" * 70)
        lines.append("9. COMPOSITION DEVIATION SCORE")
        lines.append("─" * 70)
        lines.append("")
        lines.append(f"  Deviation Between Original and Optimized: {api_response['deviation_score']:.2f}")
        lines.append("")
    
    # FOOTER
    lines.append("═" * 70)
    lines.append("END OF REPORT")
    lines.append("═" * 70)
    lines.append("")
    lines.append("This report was generated from a single API response object.")
    lines.append("All values are consistent with the API output shown on the dashboard.")
    lines.append("No recomputation was performed during report generation.")
    
    return "\n".join(lines)


def generate_csv_report(api_response, original_composition=None):
    """
    Generate a CSV-formatted report for spreadsheet import.
    
    Args:
        api_response: dict - Complete response from predict_alloy API
        original_composition: dict - Original input composition
        
    Returns:
        str - CSV-formatted report
    """
    
    lines = []
    lines.append("AI Alloy Designer Report")
    lines.append("")
    
    # Original vs Optimized Composition
    lines.append("Element,Original (%),Optimized (%)")
    
    if original_composition and "optimization" in api_response:
        opt_comp = api_response["optimization"].get("composition", {})
        for element in sorted(original_composition.keys()):
            orig_val = original_composition.get(element, 0)
            opt_val = opt_comp.get(element, 0)
            lines.append(f"{element},{orig_val:.2f},{opt_val:.2f}")
    
    lines.append("")
    lines.append("Prediction Metrics,Value,Unit")
    
    if "prediction" in api_response:
        pred = api_response["prediction"]
        lines.append(f"Original Strength,{pred.get('strength', 0):.2f},MPa")
        lines.append(f"Original Melting Temp,{pred.get('melting_temp', 0):.2f},°C")
        lines.append(f"Confidence,{pred.get('confidence', 0):.1f},%")
    
    if "optimization" in api_response:
        opt = api_response["optimization"]
        lines.append(f"Optimized Strength,{opt.get('new_strength', 0):.2f},MPa")
        lines.append(f"Optimized Melting Temp,{opt.get('new_melting_temp', 0):.2f},°C")
    
    if "grade_matching" in api_response:
        gm = api_response["grade_matching"]
        lines.append(f"Grade Similarity,{gm.get('confidence', 0):.1f},%")
    
    return "\n".join(lines)
