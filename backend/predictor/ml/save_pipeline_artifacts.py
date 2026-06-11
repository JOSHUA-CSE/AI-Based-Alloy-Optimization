"""
PIPELINE ARTIFACT SAVER
Run this ONCE after training to save additional artifacts for backend alignment.

Usage:
    cd backend
    python predictor/ml/save_pipeline_artifacts.py
"""

import sys
import pickle
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity


def find_alloys_csv(script_dir):
    """Locate Alloys.csv relative to this script — no hardcoded OS paths."""
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
            return path

    raise FileNotFoundError(
        "Alloys.csv not found. Searched:\n" +
        "\n".join(str(p) for p in possible_paths)
    )


if __name__ == "__main__":
    ml_dir = Path(__file__).resolve().parent

    # ==============================
    # LOAD EXISTING ARTIFACTS
    # ==============================
    try:
        model = joblib.load(ml_dir / "model.pkl")
        scaler = joblib.load(ml_dir / "scaler.pkl")
        columns = joblib.load(ml_dir / "columns.pkl")
        print("Loaded existing model, scaler, columns")
    except Exception as e:
        print(f"Error loading artifacts: {e}")
        print("   Make sure model.pkl, scaler.pkl, columns.pkl exist in the same directory.")
        sys.exit(1)

    # ==============================
    # LOAD TRAINING DATA
    # ==============================
    try:
        csv_path = find_alloys_csv(ml_dir)

        df = pd.read_csv(csv_path)
        df = df.drop_duplicates().dropna()
        df = df.drop(columns=["Alloy"])

        target_cols = [
            "Tensile Strength: Ultimate (UTS) (psi)",
            "Melting Completion (Liquidus)"
        ]

        X = df.drop(columns=target_cols)
        print(f"Loaded training data: {len(X)} samples, {len(X.columns)} features")
    except Exception as e:
        print(f"Error loading training data: {e}")
        sys.exit(1)

    # ==============================
    # EXTRACT PIPELINE ARTIFACTS
    # ==============================

    # 1. Correlation matrix
    corr = df.corr()
    print("Computed correlation matrix")

    # 2. Feature importance
    try:
        importances = model.estimators_[0].feature_importances_
        feature_importance = pd.Series(importances, index=X.columns)
        print("Extracted feature importance")
    except Exception as e:
        print(f"Could not extract feature importance: {e}")
        feature_importance = pd.Series(np.ones(len(X.columns)), index=X.columns)

    # 3. Column means
    df_mean = df[X.columns].mean()
    print("Computed column means")

    # 4. Grade database
    grade_db = {
        "Steel_A": X.iloc[10].values,
        "Steel_B": X.iloc[50].values,
        "Steel_C": X.iloc[100].values if len(X) > 100 else X.iloc[-1].values
    }
    print("Created grade database from training data")

    # ==============================
    # SAVE ARTIFACTS
    # ==============================
    artifacts = {
        "correlation_matrix": corr,
        "feature_importance": feature_importance,
        "column_means": df_mean,
        "grade_db": grade_db,
        "target_col": target_cols[0]
    }

    artifacts_path = ml_dir / "pipeline_artifacts.pkl"
    try:
        with open(artifacts_path, "wb") as f:
            pickle.dump(artifacts, f)
        print(f"\nSaved pipeline_artifacts.pkl to: {artifacts_path}")
    except Exception as e:
        print(f"Error saving artifacts: {e}")
        sys.exit(1)

    # ==============================
    # VERIFY
    # ==============================
    print("\nVerification:")
    print(f"   - Correlation matrix shape: {corr.shape}")
    print(f"   - Feature importance length: {len(feature_importance)}")
    print(f"   - Column means length: {len(df_mean)}")
    print(f"   - Grade DB keys: {list(grade_db.keys())}")
    print(f"   - Target column: {target_cols[0]}")
    print("\nAll artifacts saved. Backend is ready for alignment.")
