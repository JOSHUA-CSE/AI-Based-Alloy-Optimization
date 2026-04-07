#!/usr/bin/env python3
"""
Complete ML Pipeline Training Script
- Auto-finds Alloys.csv
- Trains model with exact pipeline logic
- Saves all required artifacts
- Displays model accuracy to terminal
"""

import os
import sys
import pandas as pd
import numpy as np
import pickle
from pathlib import Path

# sklearn imports - exact logic from pipeline
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.multioutput import MultiOutputRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.metrics.pairwise import cosine_similarity

# ==============================
# 1. AUTO-FIND ALLOYS.CSV
# ==============================
def find_alloys_csv():
    """Auto-detect Alloys.csv from multiple possible locations"""
    script_dir = Path(__file__).parent
    possible_paths = [
        script_dir / "Alloys.csv",
        script_dir.parent / "Alloys.csv",
        script_dir.parent.parent / "Alloys.csv",
        script_dir.parent.parent.parent / "Alloys.csv",
        Path("Alloys.csv"),
        Path.home() / "Alloys.csv",
        Path("d:\\Alloy_Optimization\\Alloys.csv"),
    ]
    
    for path in possible_paths:
        if path.exists():
            print(f"✅ Found Alloys.csv at: {path.absolute()}")
            return str(path)
    
    raise FileNotFoundError(
        f"Alloys.csv not found. Searched:\n" +
        "\n".join(str(p) for p in possible_paths)
    )

# ==============================
# 2. LOAD & PREPARE DATA
# ==============================
print("=" * 60)
print("🚀 STARTING MODEL TRAINING PIPELINE")
print("=" * 60)

try:
    csv_path = find_alloys_csv()
    print(f"\n📂 Loading data from: {csv_path}")
    
    df = pd.read_csv(csv_path)
    print(f"   Initial rows: {len(df)}")
    
    # Clean data (exact pipeline logic)
    df = df.drop_duplicates().dropna()
    print(f"   After cleaning: {len(df)} rows")
    
    df = df.drop(columns=["Alloy"])
    print(f"   Columns: {len(df.columns)}")
    
except Exception as e:
    print(f"❌ Error loading data: {e}")
    sys.exit(1)

# ==============================
# 3. DEFINE TARGETS & FEATURES
# ==============================
target_cols = [
    "Tensile Strength: Ultimate (UTS) (psi)",
    "Melting Completion (Liquidus)"
]

X = df.drop(columns=target_cols)
y = df[target_cols]

print(f"\n📊 Features (X): {len(X.columns)} elements")
print(f"   Targets (y): {target_cols}")

# ==============================
# 4. TRAIN-TEST SPLIT + SCALING
# ==============================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print(f"\n🔀 Data split:")
print(f"   Train: {len(X_train)} samples")
print(f"   Test:  {len(X_test)} samples")

# ==============================
# 5. TRAIN MODEL
# ==============================
print(f"\n🤖 Training RandomForest model (200 estimators)...")

model = MultiOutputRegressor(
    RandomForestRegressor(n_estimators=200, random_state=42)
)

model.fit(X_train_scaled, y_train)
print("   ✅ Model training complete")

# ==============================
# 6. EVALUATE MODEL - DISPLAY ACCURACY
# ==============================
y_pred = model.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))

print(f"\n" + "=" * 60)
print(f"📈 MODEL PERFORMANCE METRICS")
print(f"=" * 60)
print(f"\n🎯 R² Score (Model Accuracy):  {r2:.4f} ({r2*100:.2f}%)")
print(f"   MAE (Mean Absolute Error):    {mae:.4f}")
print(f"   RMSE (Root Mean Squared):     {rmse:.4f}")
print(f"\n{'✅ Model Ready!' if r2 > 0.7 else '⚠️  Model Performance OK'}")
print(f"=" * 60)

# ==============================
# 7. EXTRACT FEATURE IMPORTANCE
# ==============================
importances = model.estimators_[0].feature_importances_
feature_importance = pd.Series(importances, index=X.columns).sort_values(ascending=False)

print(f"\n🔍 Top 10 Important Features:")
for idx, (col, imp) in enumerate(feature_importance.head(10).items(), 1):
    print(f"   {idx}. {col}: {imp:.4f}")

# Get correlation matrix
corr = df.corr()

# ==============================
# 8. SAVE ALL MODELS
# ==============================
ml_dir = Path(__file__).parent

model_path = ml_dir / "model.pkl"
scaler_path = ml_dir / "scaler.pkl"
columns_path = ml_dir / "columns.pkl"

with open(model_path, "wb") as f:
    pickle.dump(model, f)
print(f"\n💾 Saved: {model_path.name}")

with open(scaler_path, "wb") as f:
    pickle.dump(scaler, f)
print(f"💾 Saved: {scaler_path.name}")

with open(columns_path, "wb") as f:
    pickle.dump(list(X.columns), f)
print(f"💾 Saved: {columns_path.name}")

# ==============================
# 9. SAVE PIPELINE ARTIFACTS
# ==============================
# Extract grades from the data
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
}

artifacts_path = ml_dir / "pipeline_artifacts.pkl"
with open(artifacts_path, "wb") as f:
    pickle.dump(artifacts, f)
print(f"💾 Saved: {artifacts_path.name}")

# ==============================
# 10. VERIFICATION - LOAD & TEST
# ==============================
print(f"\n✔️  Verifying saved files...")

try:
    with open(model_path, "rb") as f:
        loaded_model = pickle.load(f)
    with open(scaler_path, "rb") as f:
        loaded_scaler = pickle.load(f)
    with open(columns_path, "rb") as f:
        loaded_columns = pickle.load(f)
    with open(artifacts_path, "rb") as f:
        loaded_artifacts = pickle.load(f)
    
    print(f"   ✅ All files loaded successfully")
    print(f"   ✅ Columns: {len(loaded_columns)}")
    print(f"   ✅ Artifacts keys: {list(loaded_artifacts.keys())}")
except Exception as e:
    print(f"   ❌ Verification failed: {e}")

# ==============================
# 11. PREDICTION FUNCTIONS (FROM PIPELINE)
# ==============================
def predict_with_confidence(comp):
    """Predict strength/temp with confidence score"""
    comp_df = pd.DataFrame([comp], columns=X.columns)
    comp_scaled = scaler.transform(comp_df)
    
    pred = model.predict(comp_scaled)[0]
    
    # Confidence calculation
    tree_preds = [
        tree.predict(comp_scaled)[0]
        for tree in model.estimators_[0].estimators_
    ]
    
    mean_pred = np.mean(tree_preds)
    std_pred = np.std(tree_preds)
    
    confidence = max(0, 1 - (std_pred / (mean_pred + 1e-6)))
    confidence = round(confidence * 100, 2)
    
    return pred, confidence

def recommend_changes(comp):
    """Generate recommendations based on correlations"""
    recs = []
    corr_strength = corr[target_cols[0]]
    
    for i, col in enumerate(X.columns):
        if corr_strength[col] > 0.1 and comp[i] < df[col].mean():
            recs.append(f"Increase {col}")
        elif corr_strength[col] < -0.1 and comp[i] > df[col].mean():
            recs.append(f"Reduce {col}")
    
    return recs[:5]

def root_cause(comp):
    """Identify root causes"""
    issues = []
    
    for i, col in enumerate(X.columns):
        if feature_importance[col] > 0.05:
            if comp[i] < df[col].mean():
                issues.append(f"Low {col}")
            elif comp[i] > df[col].mean():
                issues.append(f"High {col}")
    
    return issues[:5]

def match_grade(comp):
    """Match to reference grades"""
    sims = {}
    
    for name, ref in grade_db.items():
        sim = cosine_similarity([comp], [ref])[0][0]
        sims[name] = sim
    
    best = max(sims, key=sims.get)
    return best, round(sims[best] * 100, 2)

def what_if_analysis(comp):
    """Simulate what-if scenarios"""
    results = []
    
    base_pred, _ = predict_with_confidence(comp)
    
    for i, col in enumerate(X.columns[:5]):
        temp = comp.copy()
        temp[i] += 1
        
        pred, _ = predict_with_confidence(temp)
        change = pred[0] - base_pred[0]
        
        results.append(f"If {col} +1 → Strength change: {change:.2f}")
    
    return results

# ==============================
# 12. FULL SYSTEM TEST
# ==============================
print(f"\n" + "=" * 60)
print(f"🧪 RUNNING FULL SYSTEM TEST")
print(f"=" * 60)

sample = [2.36, 1.09, 0.15, 0.91, 0.67, 2.41, 0.17, 1.89, 2.78, 34.71, 
          0.05, 0.01, 4.44, 6.55, 1.93, 2.79, 6.05, 2.64, 1.61, 1.19, 
          2.27, 1.86, 7.36, 1.18, 2.95, 4.12, 2.24, 1.02, 2.02, 0.57]

sample_array = np.array(sample)

# Normalize sample to 100%
sample_array = (sample_array / sample_array.sum()) * 100

print(f"\n📋 Test Composition: {len(sample_array)} elements")
print(f"   Total: {sample_array.sum():.2f}%")

pred, conf = predict_with_confidence(sample_array)
print(f"\n🔮 Predictions:")
print(f"   Strength: {pred[0]:.2f} psi")
print(f"   Melting:  {pred[1]:.2f}°C")
print(f"   Confidence: {conf}%")

grade, match = match_grade(sample_array)
print(f"\n🏅 Grade Match:")
print(f"   Best: {grade} ({match}% similarity)")

print(f"\n💡 Recommendations:")
for r in recommend_changes(sample_array):
    print(f"   • {r}")

print(f"\n⚠️  Root Causes:")
for rc in root_cause(sample_array):
    print(f"   • {rc}")

print(f"\n" + "=" * 60)
print(f"✅ TRAINING COMPLETE - ALL MODELS READY")
print(f"=" * 60)
