"""
GluCare AI - 90-Day Monitoring (Day 30 Assessment) Inference Module
Evaluates 30-day patient tracking telemetry to forecast Day 90 trajectory:
- Target 1: Membaik (Improving)
- Target 0: Memburuk / Stagnan (Worsening / Stagnant)
"""

import sys
import json
from pathlib import Path
import joblib
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_PATH = MODELS_DIR / "monitoring_day30_model.pkl"

FEATURE_COLS = [
    "glucose_month1_mean",
    "glucose_month1_std",
    "glucose_slope_month1",
    "baseline_glucose",
    "steps_month1_mean",
    "steps_consistency_m1",
    "sleep_month1_mean",
    "sleep_consistency_m1",
    "carbs_month1_mean",
    "sleep_adherence_m1",
    "steps_adherence_m1",
    "max_streak_m1",
    "corr_sleep_glucose_m1",
    "corr_steps_glucose_m1",
    "corr_carbs_glucose_m1"
]


def load_monitoring_model():
    """Load the Day 30 monitoring model artifact."""
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model monitoring tidak ditemukan di: {MODEL_PATH}")
    
    artifact = joblib.load(MODEL_PATH)
    return artifact


def predict_day30_assessment(patient_record: dict) -> dict:
    """
    Run prediction on 15 Day-30 aggregated features.
    
    Returns:
        dict containing trajectory prediction, risk scores, and clinical recommendations.
    """
    artifact = load_monitoring_model()
    model = artifact["model"]
    scaler = artifact.get("scaler")
    
    # Extract features in required order
    feature_values = []
    for f in FEATURE_COLS:
        val = patient_record.get(f)
        if val is None:
            val = 0.0
        feature_values.append(float(val))
        
    df_input = pd.DataFrame([feature_values], columns=FEATURE_COLS)
    
    if scaler is not None:
        X_proc = scaler.transform(df_input)
    else:
        X_proc = df_input
        
    pred = int(model.predict(X_proc)[0])
    probs = model.predict_proba(X_proc)[0]
    
    prob_worsening = float(probs[0])
    prob_improving = float(probs[1])
    
    status = "Membaik" if pred == 1 else "Memburuk / Stagnan"
    
    if pred == 1:
        summary = "Tren metabolisme dan kepatuhan gaya hidup Anda di Bulan ke-1 menunjukkan proyeksi positif untuk hari ke-90."
        recommendation = "Pertahankan konsistensi jam tidur dan aktivitas fisik harian Anda saat ini."
    else:
        summary = "Peringatan Dini: Analisis AI mendeteksi variabilitas glukosa atau kepatuhan yang berisiko stagnan/memburuk di hari ke-90."
        recommendation = "Disarankan meningkatkan konsistensi jam tidur, membatasi asupan karbohidrat tinggi di malam hari, dan menjaga target langkah harian."
        
    return {
        "prediction": pred,
        "trajectory_status": status,
        "probability_improving": round(prob_improving, 4),
        "probability_worsening": round(prob_worsening, 4),
        "improving_score_percent": round(prob_improving * 100, 1),
        "worsening_score_percent": round(prob_worsening * 100, 1),
        "summary": summary,
        "recommendation": recommendation,
        "model_name": artifact.get("model_name", "XGBoost")
    }


if __name__ == "__main__":
    # Test simulation sample
    sample_patient = {
        "glucose_month1_mean": 118.5,
        "glucose_month1_std": 12.3,
        "glucose_slope_month1": -0.8,
        "baseline_glucose": 126.0,
        "steps_month1_mean": 7200.0,
        "steps_consistency_m1": 0.82,
        "sleep_month1_mean": 7.1,
        "sleep_consistency_m1": 0.76,
        "carbs_month1_mean": 185.4,
        "sleep_adherence_m1": 0.8,
        "steps_adherence_m1": 0.74,
        "max_streak_m1": 9,
        "corr_sleep_glucose_m1": -0.31,
        "corr_steps_glucose_m1": -0.28,
        "corr_carbs_glucose_m1": 0.44
    }
    
    res = predict_day30_assessment(sample_patient)
    print("=== HASIL INFERENSI DAY 30 MONITORING GLUCARE AI ===")
    print(json.dumps(res, indent=2))
