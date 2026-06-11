#!/usr/bin/env python3
"""
Complete ML Pipeline Training Script
- Auto-finds Alloys.csv
- Trains model with exact pipeline logic
- Saves all required artifacts
- Displays model accuracy to terminal

Usage:
    cd backend
    python predictor/ml/train.py
"""

import os
import sys
import pandas as pd
import numpy as np
import pickle
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.metrics.pairwise import cosine_similarity


def find_alloys_csv():
    """Auto-detect Alloys.csv from multiple possible locations."""
    script_dir = Path(__file__).resolve().parent
    possible_paths = [
        script_dir / "Alloys.csv",
        script_dir.parent / "Alloys.csv",
        script_dir.parent.parent / "Alloys.csv",
        script_dir.parent.parent.parent / "Alloys.csv",
        Path.cwd() / "Alloys.csv",
        Path.home() / "Alloys.csv",
    ]

    for path in possible_paths:
        if path.exists():
            print(f"Found Alloys.csv at: {path.resolve()}")
            return str(path)

    raise FileNotFoundError(
        "Alloys.csv not found. Searched:\n" +
        "\n".join(str(p) for p in possible_paths)
    )


def predict_with_confidence(comp, model, scaler, X_columns):
    """Predict strength/temp with confidence score."""
    comp_df = pd.DataFrame([comp], columns=X_columns)
    comp_scaled = scaler.transform(comp_df)

    pred = model.predict(comp_scaled)[0]

    tree_preds = [
        tree.predict(comp_scaled)[0]
        for tree in model.estimators_[0].estimators_
    ]

    mean_pred = np.mean(tree_preds)
    std_pred = np.std(tree_preds)

    confidence = max(0, 1 - (std_pred / (mean_pred + 1e-6)))
    confidence = round(confidence * 100, 2)

    return pred, confidence


def recommend_changes(comp, X_columns, corr, target_cols, df):
    """Generate recommendations based on correlations."""
    recs = []
    corr_strength = corr[target_cols[0]]

    for i, col in enumerate(X_columns):
        if corr_strength[col] > 0.1 and comp[i] < df[col].mean():
            recs.append(f"Increase {col}")
        elif corr_strength[col] < -0.1 and comp[i] > df[col].mean():
            recs.append(f"Reduce {col}")

    return recs[:5]


def root_cause(comp, X_columns, feature_importance, df):
    """Identify root causes."""
    issues = []

    for i, col in enumerate(X_columns):
        if feature_importance[col] > 0.05:
            if comp[i] < df[col].mean():
                issues.append(f"Low {col}")
            elif comp[i] > df[col].mean():
                issues.append(f"High {col}")

    return issues[:5]


def match_grade(comp, grade_db):
    """Match to reference grades."""
    sims = {}

    for name, ref in grade_db.items():
        sim = cosine_similarity([comp], [ref])[0][0]
        sims[name] = sim

    best = max(sims, key=sims.get)
    return best, round(sims[best] * 100, 2)


def what_if_analysis(comp, X_columns, model, scaler):
    """Simulate what-if scenarios."""
    results = []

    base_pred, _ = predict_with_confidence(comp, model, scaler, X_columns)

    for i, col in enumerate(X_columns[:5]):
        temp = comp.copy()
        temp[i] += 1

        pred, _ = predict_with_confidence(temp, model, scaler, X_columns)
        change = pred[0] - base_pred[0]

        results.append(f"If {col} +1 → Strength change: {change:.2f}")

    return results


if __name__ == "__main__":
    # ==============================
    # 1. LOAD & PREPARE DATA
    # ==============================
    print("=" * 60)
    print("STARTING MODEL TRAINING PIPELINE")
    print("=" * 60)

    try:
        csv_path = find_alloys_csv()
        print(f"\nLoading data from: {csv_path}")

        df = pd.read_csv(csv_path)
        print(f"   Initial rows: {len(df)}")

        df = df.drop_duplicates().dropna()
        print(f"   After cleaning: {len(df)} rows")

        df = df.drop(columns=["Alloy"])
        print(f"   Columns: {len(df.columns)}")

    except Exception as e:
        print(f"Error loading data: {e}")
        sys.exit(1)

    # ==============================
    # 2. DEFINE TARGETS & FEATURES
    # ==============================
    target_cols = [
        "Tensile Strength: Ultimate (UTS) (psi)",
        "Melting Completion (Liquidus)"
    ]

    X = df.drop(columns=target_cols)
    y = df[target_cols]

    print(f"\nFeatures (X): {len(X.columns)} elements")
    print(f"   Targets (y): {target_cols}")

    # ==============================
    # 3. TRAIN-TEST SPLIT + SCALING
    # ==============================
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print(f"\nData split:")
    print(f"   Train: {len(X_train)} samples")
    print(f"   Test:  {len(X_test)} samples")

    # ==============================
    # 4. TRAIN MODEL
    # ==============================
    print("\nTraining RandomForest model (200 estimators)...")

    model = MultiOutputRegressor(
        RandomForestRegressor(n_estimators=200, random_state=42)
    )

    model.fit(X_train_scaled, y_train)
    print("   Model training complete")

    # ==============================
    # 5. EVALUATE MODEL
    # ==============================
    y_pred = model.predict(X_test_scaled)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print(f"\n{'=' * 60}")
    print("MODEL PERFORMANCE METRICS")
    print(f"{'=' * 60}")
    print(f"\nR2 Score (Model Accuracy):  {r2:.4f} ({r2*100:.2f}%)")
    print(f"   MAE (Mean Absolute Error):    {mae:.4f}")
    print(f"   RMSE (Root Mean Squared):     {rmse:.4f}")
    print(f"\n{'Model Ready!' if r2 > 0.7 else 'Model Performance OK'}")
    print(f"{'=' * 60}")

    # ==============================
    # 6. EXTRACT FEATURE IMPORTANCE
    # ==============================
    importances = model.estimators_[0].feature_importances_
    feature_importance = pd.Series(importances, index=X.columns).sort_values(ascending=False)

    print("\nTop 10 Important Features:")
    for idx, (col, imp) in enumerate(feature_importance.head(10).items(), 1):
        print(f"   {idx}. {col}: {imp:.4f}")

    corr = df.corr()

    # ==============================
    # 7. SAVE ALL ARTIFACTS
    # ==============================
    ml_dir = Path(__file__).resolve().parent

    model_path = ml_dir / "model.pkl"
    scaler_path = ml_dir / "scaler.pkl"
    columns_path = ml_dir / "columns.pkl"
    artifacts_path = ml_dir / "pipeline_artifacts.pkl"

    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    print(f"\nSaved: {model_path.name}")

    with open(scaler_path, "wb") as f:
        pickle.dump(scaler, f)
    print(f"Saved: {scaler_path.name}")

    with open(columns_path, "wb") as f:
        pickle.dump(list(X.columns), f)
    print(f"Saved: {columns_path.name}")

    grade_db = {
        "Steel_A": X.iloc[10].values,
        "Steel_B": X.iloc[50].values if len(X) > 50 else X.iloc[25].values,
        "Steel_C": X.iloc[100].values if len(X) > 100 else X.iloc[75].values
    }

    artifacts = {
        "correlation_matrix": corr,
        "feature_importance": feature_importance,
        "column_means": X.mean().to_dict(),
        "grade_db": grade_db,
        "r2_score": r2,
        "target_col": target_cols[0],
    }

    with open(artifacts_path, "wb") as f:
        pickle.dump(artifacts, f)
    print(f"Saved: {artifacts_path.name}")

    # ==============================
    # 8. VERIFICATION
    # ==============================
    print("\nVerifying saved files...")

    try:
        with open(model_path, "rb") as f:
            loaded_model = pickle.load(f)
        with open(scaler_path, "rb") as f:
            loaded_scaler = pickle.load(f)
        with open(columns_path, "rb") as f:
            loaded_columns = pickle.load(f)
        with open(artifacts_path, "rb") as f:
            loaded_artifacts = pickle.load(f)

        print(f"   All files loaded successfully")
        print(f"   Columns: {len(loaded_columns)}")
        print(f"   Artifacts keys: {list(loaded_artifacts.keys())}")
    except Exception as e:
        print(f"   Verification failed: {e}")

    # ==============================
    # 9. FULL SYSTEM TEST
    # ==============================
    print(f"\n{'=' * 60}")
    print("RUNNING FULL SYSTEM TEST")
    print(f"{'=' * 60}")

    sample = [2.36, 1.09, 0.15, 0.91, 0.67, 2.41, 0.17, 1.89, 2.78, 34.71,
              0.05, 0.01, 4.44, 6.55, 1.93, 2.79, 6.05, 2.64, 1.61, 1.19,
              2.27, 1.86, 7.36, 1.18, 2.95, 4.12, 2.24, 1.02, 2.02, 0.57]

    sample_array = np.array(sample)
    sample_array = (sample_array / sample_array.sum()) * 100

    print(f"\nTest Composition: {len(sample_array)} elements")
    print(f"   Total: {sample_array.sum():.2f}%")

    pred, conf = predict_with_confidence(sample_array, model, scaler, list(X.columns))
    print(f"\nPredictions:")
    print(f"   Strength: {pred[0]:.2f} psi")
    print(f"   Melting:  {pred[1]:.2f} deg C")
    print(f"   Confidence: {conf}%")

    grade, match_score = match_grade(sample_array, grade_db)
    print(f"\nGrade Match:")
    print(f"   Best: {grade} ({match_score}% similarity)")

    print("\nRecommendations:")
    for r in recommend_changes(sample_array, list(X.columns), corr, target_cols, df):
        print(f"   - {r}")

    print("\nRoot Causes:")
    for rc in root_cause(sample_array, list(X.columns), feature_importance, df):
        print(f"   - {rc}")

    print(f"\n{'=' * 60}")
    print("TRAINING COMPLETE - ALL MODELS READY")
    print(f"{'=' * 60}")
