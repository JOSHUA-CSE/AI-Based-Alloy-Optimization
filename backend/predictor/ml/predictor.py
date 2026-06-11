import numpy as np
import pandas as pd
import joblib
import pickle
import logging
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

_ML_DIR = Path(__file__).resolve().parent

# ---------------------------------------------------------------------------
# Core ML artifact loading — absolute paths, Gunicorn/Linux safe
# ---------------------------------------------------------------------------
_model_path = _ML_DIR / "model.pkl"
_scaler_path = _ML_DIR / "scaler.pkl"
_columns_path = _ML_DIR / "columns.pkl"

for _artifact, _path in [("model.pkl", _model_path), ("scaler.pkl", _scaler_path), ("columns.pkl", _columns_path)]:
    if not _path.exists():
        raise FileNotFoundError(
            f"Required ML artifact not found: {_path}\n"
            f"Run 'python predictor/ml/train.py' from the backend directory to generate artifacts."
        )

model = joblib.load(_model_path)
scaler = joblib.load(_scaler_path)
columns = joblib.load(_columns_path)
logger.info("ML artifacts loaded: model, scaler, columns")

# ---------------------------------------------------------------------------
# Pipeline artifacts — optional but logged clearly when missing
# ---------------------------------------------------------------------------
pipeline_artifacts = None
_pipeline_path = _ML_DIR / "pipeline_artifacts.pkl"

try:
    with open(_pipeline_path, "rb") as f:
        pipeline_artifacts = pickle.load(f)
    logger.info("Pipeline artifacts loaded successfully")
except FileNotFoundError:
    logger.warning(
        "pipeline_artifacts.pkl not found at %s. "
        "Recommendations and grade matching will use fallback logic. "
        "Run 'python predictor/ml/save_pipeline_artifacts.py' to generate.",
        _pipeline_path,
    )
except Exception as e:
    logger.warning("Failed to load pipeline_artifacts.pkl: %s", e)

if pipeline_artifacts:
    corr_matrix = pipeline_artifacts.get("correlation_matrix")
    feature_importance = pipeline_artifacts.get("feature_importance")
    column_means = pipeline_artifacts.get("column_means")
    grade_db = pipeline_artifacts.get("grade_db")
    target_column = pipeline_artifacts.get("target_col", "Tensile Strength: Ultimate (UTS) (psi)")
else:
    corr_matrix = None
    feature_importance = None
    column_means = None
    grade_db = None
    target_column = "Tensile Strength: Ultimate (UTS) (psi)"


def predict_with_confidence(comp):
    """Return model prediction and a 0-100 confidence score."""
    comp_df = pd.DataFrame([comp], columns=columns)
    comp_scaled = scaler.transform(comp_df)

    pred = model.predict(comp_scaled)[0]

    try:
        if hasattr(model, 'estimators_'):
            tree_preds = [tree.predict(comp_scaled)[0] for tree in model.estimators_]
        else:
            tree_preds = [pred]
    except Exception:
        tree_preds = [pred]

    mean_pred = np.mean(tree_preds) if len(tree_preds) > 0 else pred
    std_pred = np.std(tree_preds) if len(tree_preds) > 1 else 0

    raw_confidence = max(0, min(1, 1 - (std_pred / (mean_pred + 1e-6)))) if mean_pred != 0 else 0.8
    confidence = round(raw_confidence * 100, 2)
    confidence = max(0, min(100, confidence))

    return pred, confidence


def recommend_changes(comp):
    """Return up to 8 recommended element changes as a list of dicts."""
    recs = []
    if corr_matrix is not None and column_means is not None:
        try:
            corr_strength = corr_matrix[target_column]
            for i, col in enumerate(columns):
                col_mean = column_means.get(col, 0) if hasattr(column_means, 'get') else column_means[col]
                col_corr = corr_strength.get(col, 0) if hasattr(corr_strength, 'get') else corr_strength[col]

                current_val = float(comp[i])

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
            logger.warning("Error in correlation-based recommendations: %s", e)
            recs = []

    if not recs:
        logger.warning("Using fallback recommendations (no pipeline data)")

    sorted_recs = sorted(recs, key=lambda x: abs(x["change"]), reverse=True)
    return sorted_recs[:8]


def root_cause_analysis(comp):
    """Return up to 5 root-cause strings based on feature importance or simple fallbacks."""
    issues = []
    if feature_importance is not None and column_means is not None:
        try:
            for i, col in enumerate(columns):
                col_importance = feature_importance.get(col, 0) if hasattr(feature_importance, 'get') else feature_importance[col]
                if col_importance > 0.05:
                    col_mean = column_means.get(col, 0) if hasattr(column_means, 'get') else column_means[col]
                    if comp[i] < col_mean:
                        issues.append(f"Low {col}")
                    elif comp[i] > col_mean:
                        issues.append(f"High {col}")
        except Exception as e:
            logger.warning("Error in feature importance analysis: %s", e)
            issues = []

    if not issues:
        logger.warning("Using fallback root cause analysis (no pipeline data)")
        for i, col in enumerate(columns):
            if comp[i] == 0:
                issues.append(f"Missing {col} element")
            elif comp[i] < 2:
                issues.append(f"Low {col} concentration")

    return issues[:5]


def what_if_analysis(comp):
    """Return impact of adding 1% to each element (list of dicts)."""
    results = []
    base_pred, _ = predict_with_confidence(comp)
    base_strength = float(base_pred[0])

    for i, col in enumerate(columns):
        temp = comp.copy()
        temp[i] += 1
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
    """Return best matching grade name and similarity (0-100)."""
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
            logger.warning("Error in grade matching: %s", e)

    logger.warning("Using fallback grade matching (no grade_db)")
    ref = np.ones(len(comp)) * 5
    raw_similarity = cosine_similarity([comp], [ref])[0][0]
    similarity = round(raw_similarity * 100, 2)
    similarity = max(0, min(100, similarity))
    return "Standard Alloy", similarity


def risk_analysis(comp_array, comp_dict=None):
    """Return list of risk messages for a composition."""
    risks = []
    if comp_dict:
        c_val = float(comp_dict.get("C", 0)) if comp_dict.get("C") else 0
        cr_val = float(comp_dict.get("Cr", 0)) if comp_dict.get("Cr") else 0
        ni_val = float(comp_dict.get("Ni", 0)) if comp_dict.get("Ni") else 0
    else:
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
    """Return an optimized composition (normalized to 100%)."""
    best = np.array(comp, dtype=float)
    best_pred, _ = predict_with_confidence(best)
    best_score = best_pred[0] - 0.03 * best_pred[1]

    for _ in range(100):
        trial = best + np.random.normal(0, 0.3, len(comp))
        trial = np.clip(trial, 0, 100)

        trial_sum = trial.sum()
        if trial_sum > 0:
            trial = (trial / trial_sum) * 100

        pred, _ = predict_with_confidence(trial)
        trial_score = float(pred[0]) - 0.03 * float(pred[1])

        if trial_score > best_score:
            best_score = trial_score
            best = trial

    final_sum = best.sum()
    if final_sum > 0:
        best = (best / final_sum) * 100

    return best


def deviation_score(original, optimized):
    """Return normalized deviation (0-100) between two compositions."""
    deviation = float(np.linalg.norm(original - optimized))
    return min(100, deviation)


def what_if_element_variation(comp, element_name, variation_percentage, num_steps=21):
    """Simulate varying a single element; return detailed results and sensitivities."""
    if element_name not in columns:
        raise ValueError(f"Element {element_name} not found in composition")

    element_idx = columns.index(element_name)
    base_element_value = float(comp[element_idx])

    base_pred, base_conf = predict_with_confidence(comp)
    baseline_strength = float(base_pred[0])
    baseline_melting_temp = float(base_pred[1])

    min_variation = max(0, base_element_value - variation_percentage)
    max_variation = min(100, base_element_value + variation_percentage)

    variations_list = []
    strength_values = []
    melting_temp_values = []

    for step in range(num_steps):
        progress = step / (num_steps - 1) if num_steps > 1 else 0
        new_element_value = min_variation + progress * (max_variation - min_variation)

        trial = np.array(comp, dtype=float)
        original_other_sum = np.sum(trial) - trial[element_idx]

        trial[element_idx] = new_element_value
        current_total = new_element_value + original_other_sum

        if current_total > 0:
            trial = (trial / current_total) * 100

        try:
            pred, conf = predict_with_confidence(trial)
            strength = float(pred[0])
            melting_temp = float(pred[1])
        except Exception:
            strength = baseline_strength
            melting_temp = baseline_melting_temp

        variations_list.append({
            "element_percentage": round(new_element_value, 2),
            "strength": round(strength, 2),
            "melting_temp": round(melting_temp, 2),
            "strength_delta": round(strength - baseline_strength, 2),
            "melting_temp_delta": round(melting_temp - baseline_melting_temp, 2)
        })

        strength_values.append(strength)
        melting_temp_values.append(melting_temp)

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
    """Compare multiple compositions and return results, baseline and count."""
    results = []
    baseline_pred = None

    for i, comp in enumerate(compositions_list):
        try:
            pred, conf = predict_with_confidence(comp)
            strength = float(pred[0])
            melting_temp = float(pred[1])
        except Exception as e:
            logger.error("Error predicting composition %d: %s", i, e)
            strength = 0
            melting_temp = 0
            conf = 0

        if i == 0:
            baseline_pred = {"strength": strength, "melting_temp": melting_temp}

        result_entry = {
            "index": i,
            "composition": {col: round(float(val), 2) for col, val in zip(columns, comp.tolist())},
            "strength": round(strength, 2),
            "melting_temp": round(melting_temp, 2),
            "confidence": int(conf)
        }

        if baseline_pred:
            strength_delta = strength - baseline_pred["strength"]
            melting_temp_delta = melting_temp - baseline_pred["melting_temp"]

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

    return {"results": results, "baseline": results[0] if results else None, "composition_count": len(results)}
