import numpy as np
import pandas as pd
import joblib
import pickle
import logging
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# ==============================
# LOAD ARTIFACTS
# ==============================

# Core ML artifacts
model = joblib.load("predictor/ml/model.pkl")
scaler = joblib.load("predictor/ml/scaler.pkl")
columns = joblib.load("predictor/ml/columns.pkl")

# Pipeline artifacts (for logic alignment)
pipeline_artifacts = None
try:
    with open("predictor/ml/pipeline_artifacts.pkl", "rb") as f:
        pipeline_artifacts = pickle.load(f)
    logger.info("✅ Loaded pipeline artifacts for logic alignment")
except Exception as e:
    logger.warning(f"⚠️  pipeline_artifacts.pkl not found: {e}")
    logger.warning("   Run: python predictor/ml/save_pipeline_artifacts.py")
    pipeline_artifacts = None

# Extract pipeline data (with fallbacks)
if pipeline_artifacts:
    corr_matrix = pipeline_artifacts.get("correlation_matrix")
    feature_importance = pipeline_artifacts.get("feature_importance")
    column_means = pipeline_artifacts.get("column_means")
    grade_db = pipeline_artifacts.get("grade_db")
    target_column = pipeline_artifacts.get("target_col", "Tensile Strength: Ultimate (UTS) (psi)")
else:
    # Fallbacks (for testing without artifacts)
    corr_matrix = None
    feature_importance = None
    column_means = None
    grade_db = None
    target_column = "Tensile Strength: Ultimate (UTS) (psi)"

# Define correct 30-element order (SINGLE SOURCE OF TRUTH)
EXPECTED_ELEMENTS = [
    "Al", "As", "B", "C", "Ca", "Ce", "Co", "Cr", "Cu", "Fe",
    "La", "Mg", "Mn", "Mo", "N", "Nb", "Ni", "O", "P", "Pb",
    "S", "Se", "Si", "Sn", "Ta", "Ti", "V", "W", "Zn", "Zr"
]


def predict_with_confidence(comp):
    """
    Predict strength and melting temperature with confidence score.
    
    Args:
        comp: numpy array of element composition
        
    Returns:
        tuple: (predictions_array, confidence_0_to_100)
    """
    comp_df = pd.DataFrame([comp], columns=columns)
    comp_scaled = scaler.transform(comp_df)

    pred = model.predict(comp_scaled)[0]

    # Calculate confidence from tree predictions
    try:
        if hasattr(model, 'estimators_'):
            # Direct RandomForestRegressor
            tree_preds = [tree.predict(comp_scaled)[0] for tree in model.estimators_]
        elif hasattr(model, 'estimators_'):
            # MultiOutputRegressor wrapping RandomForest
            tree_preds = [tree.predict(comp_scaled)[0] for tree in model.estimators_[0].estimators_]
        else:
            # Fallback
            tree_preds = [pred]
    except:
        tree_preds = [pred]

    mean_pred = np.mean(tree_preds) if len(tree_preds) > 0 else pred
    std_pred = np.std(tree_preds) if len(tree_preds) > 1 else 0

    # Calculate confidence (0-1 scale, then convert to 0-100)
    raw_confidence = max(0, min(1, 1 - (std_pred / (mean_pred + 1e-6)))) if mean_pred != 0 else 0.8
    confidence = round(raw_confidence * 100, 2)  # NOW between 0-100
    
    # CRITICAL: Clamp to 0-100 to prevent invalid values
    confidence = max(0, min(100, confidence))

    return pred, confidence


def recommend_changes(comp):
    """
    Generate detailed recommendations with exact numerical changes.
    
    PIPELINE LOGIC:
    - Uses correlation matrix
    - If corr > 0.1 and current < mean → Increase
    - If corr < -0.1 and current > mean → Reduce
    
    Returns:
    - List of dicts with: element, current, recommended, change, action, reason
    """
    recs = []
    
    # Try to use pipeline data
    if corr_matrix is not None and column_means is not None:
        try:
            corr_strength = corr_matrix[target_column]
            
            for i, col in enumerate(columns):
                col_mean = column_means.get(col, 0) if hasattr(column_means, 'get') else column_means[col]
                col_corr = corr_strength.get(col, 0) if hasattr(corr_strength, 'get') else corr_strength[col]
                
                current_val = float(comp[i])
                
                # Positive correlation: increase if below mean
                if col_corr > 0.1 and current_val < col_mean:
                    recommended_val = float(col_mean)
                    change = round(recommended_val - current_val, 4)
                    recs.append({
                        "element": col,
                        "current": round(current_val, 4),
                        "recommended": round(recommended_val, 4),
                        "change": change,
                        "action": "increase",
                        "reason": f"Positive correlation with strength (r={round(col_corr, 3)})"
                    })
                
                # Negative correlation: reduce if above mean
                elif col_corr < -0.1 and current_val > col_mean:
                    recommended_val = float(col_mean)
                    change = round(recommended_val - current_val, 4)
                    recs.append({
                        "element": col,
                        "current": round(current_val, 4),
                        "recommended": round(recommended_val, 4),
                        "change": change,
                        "action": "decrease",
                        "reason": f"Negative correlation with strength (r={round(col_corr, 3)})"
                    })
        except Exception as e:
            logger.warning(f"Error in correlation-based recommendations: {e}")
            recs = []
    
    # Fallback: if no pipeline data, return empty recommendations
    if not recs:
        logger.warning("Using fallback recommendations (no pipeline data)")
        recs = []
    
    # Sort by absolute change magnitude and return top 8
    sorted_recs = sorted(recs, key=lambda x: abs(x["change"]), reverse=True)
    return sorted_recs[:8]


def root_cause_analysis(comp):
    """
    Analyze root causes based on feature importance.
    
    PIPELINE LOGIC:
    - Only consider features with importance > 0.05
    - If below mean → "Low X"
    - If above mean → "High X"
    """
    issues = []
    
    # Try to use pipeline data
    if feature_importance is not None and column_means is not None:
        try:
            for i, col in enumerate(columns):
                # Get feature importance
                col_importance = feature_importance.get(col, 0) if hasattr(feature_importance, 'get') else feature_importance[col]
                
                # Only analyze important features (> 0.05 threshold)
                if col_importance > 0.05:
                    col_mean = column_means.get(col, 0) if hasattr(column_means, 'get') else column_means[col]
                    
                    if comp[i] < col_mean:
                        issues.append(f"Low {col}")
                    elif comp[i] > col_mean:
                        issues.append(f"High {col}")
        except Exception as e:
            logger.warning(f"Error in feature importance analysis: {e}")
            issues = []
    
    # Fallback
    if not issues:
        logger.warning("Using fallback root cause analysis (no pipeline data)")
        for i, col in enumerate(columns):
            if comp[i] == 0:
                issues.append(f"Missing {col} element")
            elif comp[i] < 2:
                issues.append(f"Low {col} concentration")
    
    return issues[:5]


def what_if_analysis(comp):
    """
    Analyze impact of +1% change in each element.
    Covers ALL 30 elements.
    
    Input composition must already be normalized to 100%.
    """
    results = []
    base_pred, _ = predict_with_confidence(comp)
    base_strength = float(base_pred[0])

    # Analyze impact of each element (ALL 30 elements)
    for i, col in enumerate(columns):
        temp = comp.copy()
        
        # Add 1% to this element
        temp[i] += 1
        
        # Normalize back to 100% (proportional redistribution)
        temp_sum = temp.sum()
        if temp_sum > 0:
            temp = (temp / temp_sum) * 100

        pred, _ = predict_with_confidence(temp)
        new_strength = float(pred[0])
        change = new_strength - base_strength

        impact = "↑ positive" if change > 0 else "↓ negative" if change < 0 else "→ neutral"
        results.append({
            "element": col,
            "change": change,
            "impact": impact,
            "summary": f"{col} +1%: Strength {impact} by {abs(change):.2f} MPa"
        })

    return results


def match_grade(comp):
    """
    Match composition to reference grade.
    
    PIPELINE LOGIC:
    - Uses grade_db with reference compositions
    - Computes cosine similarity
    - Returns best match and similarity score (0-100)
    """
    if grade_db is not None and len(grade_db) > 0:
        try:
            sims = {}
            for name, ref in grade_db.items():
                sim = cosine_similarity([comp], [ref])[0][0]
                sims[name] = sim
            
            best = max(sims, key=sims.get)
            best_sim = round(sims[best] * 100, 2)
            
            return best, best_sim
        except Exception as e:
            logger.warning(f"Error in grade matching: {e}")
    
    # Fallback: generic match
    logger.warning("Using fallback grade matching (no grade_db)")
    ref = np.ones(len(comp)) * 5
    raw_similarity = cosine_similarity([comp], [ref])[0][0]
    similarity = round(raw_similarity * 100, 2)
    similarity = max(0, min(100, similarity))
    
    return "Standard Alloy", similarity


def risk_analysis(comp_array, comp_dict=None):
    """
    Analyze risks in alloy composition.
    
    Args:
        comp_array: numpy array of composition
        comp_dict: dictionary version for element lookup (optional)
    """
    risks = []

    # Dictionary lookup for specific elements
    if comp_dict:
        c_val = float(comp_dict.get("C", 0)) if comp_dict.get("C") else 0
        cr_val = float(comp_dict.get("Cr", 0)) if comp_dict.get("Cr") else 0
        ni_val = float(comp_dict.get("Ni", 0)) if comp_dict.get("Ni") else 0
    else:
        # Array lookup
        c_idx = columns.index("C") if "C" in columns else -1
        cr_idx = columns.index("Cr") if "Cr" in columns else -1
        ni_idx = columns.index("Ni") if "Ni" in columns else -1
        
        c_val = float(comp_array[c_idx]) if c_idx >= 0 else 0
        cr_val = float(comp_array[cr_idx]) if cr_idx >= 0 else 0
        ni_val = float(comp_array[ni_idx]) if ni_idx >= 0 else 0

    if c_val > 0.3:
        risks.append("⚠️ High Carbon: Brittleness risk - Consider reducing C below 0.3%")

    if cr_val > 0 and cr_val < 10.5:
        risks.append("⚠️ Low Chromium: Corrosion risk - Increase Cr to 10.5%+ for better protection")

    if ni_val > 35:
        risks.append("⚠️ High Nickel: Cost increase - Ni is expensive above 35%")

    if not risks:
        risks.append("✅ No major risks detected in composition")

    return risks


def optimize(comp):
    """
    Optimize alloy composition for better properties.
    
    PIPELINE LOGIC:
    - Uses weighted score: score = pred[0] - 0.03 * pred[1]
    - Optimizes for strength (pred[0]) while penalizing high melting temp (pred[1])
    - Iterates 100 times with random perturbations
    - Normalizes to 100% at each step
    
    Input composition must already be normalized to 100%.
    Output will also be normalized to 100%.
    """
    best = np.array(comp, dtype=float)
    best_pred, _ = predict_with_confidence(best)
    best_score = best_pred[0] - 0.03 * best_pred[1]
    best_strength = float(best_pred[0])

    for iteration in range(100):
        # Generate trial with random perturbations
        trial = best + np.random.normal(0, 0.3, len(comp))
        trial = np.clip(trial, 0, 100)
        
        # Normalize trial to 100% (CRITICAL - ensure consistent normalization)
        trial_sum = trial.sum()
        if trial_sum > 0:
            trial = (trial / trial_sum) * 100

        pred, _ = predict_with_confidence(trial)
        trial_strength = float(pred[0])
        trial_melting_temp = float(pred[1])
        
        # Use PIPELINE LOGIC: weighted score
        trial_score = trial_strength - 0.03 * trial_melting_temp

        # Keep trial if better
        if trial_score > best_score:
            best_score = trial_score
            best = trial
            best_strength = trial_strength

    # Ensure final output is normalized to 100%
    final_sum = best.sum()
    if final_sum > 0:
        best = (best / final_sum) * 100
    
    return best


def deviation_score(original, optimized):
    """
    Calculate deviation between original and optimized composition.
    Returns normalized score (0-100).
    """
    deviation = float(np.linalg.norm(original - optimized))
    # Normalize to 0-100 scale
    normalized = min(100, deviation)
    return normalized


def what_if_element_variation(comp, element_name, variation_percentage, num_steps=21):
    """
    Simulate varying a single element across a range while keeping composition at 100%.
    Remaining elements adjusted proportionally.
    
    Args:
        comp: numpy array of normalized composition (100%)
        element_name: name of element to vary (e.g., "Fe", "C")
        variation_percentage: ±percentage to vary (e.g., 1.0 = ±1%)
        num_steps: number of simulation points (default 21 = 0%, 5%, 10%, ..., 100%)
    
    Returns:
        dict with:
            - variations: list of {current_pct, strength, melting_temp, other_elements}
            - element_index: index in composition array
            - baseline_strength: strength at current composition
            - baseline_melting_temp: melting temp at current composition
            - sensitivity: estimated property change per 1% element change
    """
    
    if element_name not in columns:
        raise ValueError(f"Element {element_name} not found in composition")
    
    element_idx = columns.index(element_name)
    base_element_value = float(comp[element_idx])
    
    # Get baseline predictions
    base_pred, base_conf = predict_with_confidence(comp)
    baseline_strength = float(base_pred[0])
    baseline_melting_temp = float(base_pred[1])
    
    # Calculate variation range
    min_variation = max(0, base_element_value - variation_percentage)
    max_variation = min(100, base_element_value + variation_percentage)
    
    # Generate steps
    variations_list = []
    strength_values = []
    melting_temp_values = []
    
    for step in range(num_steps):
        # Linear interpolation from min to max
        progress = step / (num_steps - 1) if num_steps > 1 else 0
        new_element_value = min_variation + progress * (max_variation - min_variation)
        
        # Create modified composition
        trial = np.array(comp, dtype=float)
        original_other_sum = np.sum(trial) - trial[element_idx]
        
        # Update element value
        trial[element_idx] = new_element_value
        new_other_sum = original_other_sum
        current_total = new_element_value + new_other_sum
        
        # Normalize to 100%
        if current_total > 0:
            trial = (trial / current_total) * 100
        
        # Make prediction
        try:
            pred, conf = predict_with_confidence(trial)
            strength = float(pred[0])
            melting_temp = float(pred[1])
        except:
            strength = baseline_strength
            melting_temp = baseline_melting_temp
        
        # Store variation data
        variations_list.append({
            "element_percentage": round(new_element_value, 2),
            "strength": round(strength, 2),
            "melting_temp": round(melting_temp, 2),
            "strength_delta": round(strength - baseline_strength, 2),
            "melting_temp_delta": round(melting_temp - baseline_melting_temp, 2)
        })
        
        strength_values.append(strength)
        melting_temp_values.append(melting_temp)
    
    # Calculate sensitivity (change in property per 1% element change)
    range_span = max_variation - min_variation
    if range_span > 0 and len(strength_values) > 1:
        strength_sensitivity = (strength_values[-1] - strength_values[0]) / range_span
        melting_temp_sensitivity = (melting_temp_values[-1] - melting_temp_values[0]) / range_span
    else:
        strength_sensitivity = 0
        melting_temp_sensitivity = 0
    
    return {
        "variations": variations_list,
        "element_index": element_idx,
        "element_name": element_name,
        "baseline_strength": round(baseline_strength, 2),
        "baseline_melting_temp": round(baseline_melting_temp, 2),
        "strength_sensitivity": round(strength_sensitivity, 4),
        "melting_temp_sensitivity": round(melting_temp_sensitivity, 4),
        "variation_range": {
            "min": round(min_variation, 2),
            "max": round(max_variation, 2)
        }
    }


def compare_compositions(compositions_list):
    """
    Compare multiple alloy compositions.
    
    Args:
        compositions_list: list of numpy arrays (each normalized to 100%)
    
    Returns:
        dict with comparison results including:
            - results: list of predictions for each composition
            - deltas: property changes vs first (baseline) composition
            - percent_changes: percentage changes vs baseline
    """
    
    results = []
    baseline_pred = None
    
    for i, comp in enumerate(compositions_list):
        # Make prediction
        try:
            pred, conf = predict_with_confidence(comp)
            strength = float(pred[0])
            melting_temp = float(pred[1])
        except Exception as e:
            logger.error(f"Error predicting composition {i}: {e}")
            strength = 0
            melting_temp = 0
            conf = 0
        
        # Store baseline
        if i == 0:
            baseline_pred = {
                "strength": strength,
                "melting_temp": melting_temp
            }
        
        # Build result
        result_entry = {
            "index": i,
            "composition": {col: round(float(val), 2) for col, val in zip(columns, comp.tolist())},
            "strength": round(strength, 2),
            "melting_temp": round(melting_temp, 2),
            "confidence": int(conf)
        }
        
        # Add deltas vs baseline
        if baseline_pred:
            strength_delta = strength - baseline_pred["strength"]
            melting_temp_delta = melting_temp - baseline_pred["melting_temp"]
            
            # Calculate percentage change
            strength_pct_change = (strength_delta / baseline_pred["strength"] * 100) if baseline_pred["strength"] != 0 else 0
            melting_temp_pct_change = (melting_temp_delta / baseline_pred["melting_temp"] * 100) if baseline_pred["melting_temp"] != 0 else 0
            
            result_entry["vs_baseline"] = {
                "strength_delta": round(strength_delta, 2),
                "strength_percent_change": round(strength_pct_change, 2),
                "melting_temp_delta": round(melting_temp_delta, 2),
                "melting_temp_percent_change": round(melting_temp_pct_change, 2),
                "is_improvement": strength_delta >= 0
            }
        
        results.append(result_entry)
    
    return {
        "results": results,
        "baseline": results[0] if results else None,
        "composition_count": len(results)
    }
