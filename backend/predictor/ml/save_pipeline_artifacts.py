"""
PIPELINE ARTIFACT SAVER
Run this ONCE to save additional artifacts needed for backend alignment.

This script extracts data structures from the trained model and training data,
saving them as pickles for use by the backend.

Usage:
    python save_pipeline_artifacts.py
    
    (Must be run after the main pipeline has trained the model)
"""

import pickle
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics.pairwise import cosine_similarity

# ==============================
# LOAD EXISTING ARTIFACTS
# ==============================
try:
    model = joblib.load("model.pkl")
    scaler = joblib.load("scaler.pkl")
    columns = joblib.load("columns.pkl")
    print("✅ Loaded existing model, scaler, columns")
except Exception as e:
    print(f"❌ Error loading artifacts: {e}")
    print("   Make sure model.pkl, scaler.pkl, columns.pkl exist")
    exit(1)

# ==============================
# LOAD TRAINING DATA
# ==============================
try:
    # Try multiple possible locations for Alloys.csv
    possible_paths = [
        "Alloys.csv",                                    # Same directory
        "../Alloys.csv",                                 # predictor/
        "../../Alloys.csv",                              # backend/
        "../../../Alloys.csv",                           # alloy-ai-system/
        "../../../../Alloys.csv",                        # Alloy_Optimization/
        "D:\\Alloy_Optimization\\Alloys.csv",            # Absolute path
    ]
    
    df = None
    for path in possible_paths:
        try:
            df = pd.read_csv(path)
            print(f"✅ Found Alloys.csv at: {path}")
            break
        except FileNotFoundError:
            continue
    
    if df is None:
        raise FileNotFoundError(f"Alloys.csv not found in any expected location:\n{chr(10).join(possible_paths)}")
    
    df = df.drop_duplicates().dropna()
    df = df.drop(columns=["Alloy"])
    
    target_cols = [
        "Tensile Strength: Ultimate (UTS) (psi)",
        "Melting Completion (Liquidus)"
    ]
    
    X = df.drop(columns=target_cols)
    print(f"✅ Loaded training data with {len(X)} samples and {len(X.columns)} features")
except Exception as e:
    print(f"❌ Error loading training data: {e}")
    print("   Alloys.csv must be in the correct path")
    exit(1)

# ==============================
# EXTRACT PIPELINE ARTIFACTS
# ==============================

# 1. CORRELATION MATRIX (for recommendations)
corr = df.corr()
print("✅ Computed correlation matrix")

# 2. FEATURE IMPORTANCE (for root cause analysis)
# Use first estimator from MultiOutputRegressor
try:
    importances = model.estimators_[0].feature_importances_
    feature_importance = pd.Series(importances, index=X.columns)
    print("✅ Extracted feature importance")
except Exception as e:
    print(f"⚠️  Could not extract feature importance: {e}")
    feature_importance = pd.Series(np.ones(len(X.columns)), index=X.columns)

# 3. COLUMN MEANS (for recommendations and root cause)
df_mean = df[X.columns].mean()
print("✅ Computed column means")

# 4. GRADE DATABASE (for grade matching)
# Select reference grades from training data
grade_db = {
    "Steel_A": X.iloc[10].values,
    "Steel_B": X.iloc[50].values,
    "Steel_C": X.iloc[100].values if len(X) > 100 else X.iloc[-1].values
}
print("✅ Created grade database from training data")

# ==============================
# SAVE ARTIFACTS
# ==============================

artifacts = {
    "correlation_matrix": corr,
    "feature_importance": feature_importance,
    "column_means": df_mean,
    "grade_db": grade_db,
    "target_col": target_cols[0]  # For recommendations (strength column)
}

try:
    with open("pipeline_artifacts.pkl", "wb") as f:
        pickle.dump(artifacts, f)
    print("\n✅ Saved pipeline_artifacts.pkl successfully")
except Exception as e:
    print(f"❌ Error saving artifacts: {e}")
    exit(1)

# ==============================
# VERIFY
# ==============================
print("\n🔍 Verification:")
print(f"   - Correlation matrix shape: {corr.shape}")
print(f"   - Feature importance length: {len(feature_importance)}")
print(f"   - Column means length: {len(df_mean)}")
print(f"   - Grade DB keys: {list(grade_db.keys())}")
print(f"   - Target column: {target_cols[0]}")

print("\n✅✅✅ All artifacts saved! Backend is ready for alignment.")
