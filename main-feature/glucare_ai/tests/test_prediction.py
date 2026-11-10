"""
Interactive Testing Script for GluCare Clinical Prediabetes AI Model
Loads: clinical_model.pkl, clinical_scaler.pkl, and clinical_model_info.json
Runs automated diagnostic test scenarios and allows custom input.
"""

import sys
import json
from pathlib import Path
import joblib
import numpy as np
import pandas as pd

# Reconfigure stdout to UTF-8 if supported
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Setup paths
BASE_DIR = Path(__file__).resolve().parent.parent if Path(__file__).resolve().parent.name == "tests" else Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
NEW_PIPELINE_PATH = MODELS_DIR / "glucare_prediabetes_model.joblib"
MODEL_PATH = MODELS_DIR / "clinical_model.pkl"
SCALER_PATH = MODELS_DIR / "clinical_scaler.pkl"
INFO_PATH = MODELS_DIR / "clinical_model_info.json"


def load_model_assets():
    """Load model pipeline or legacy assets."""
    if NEW_PIPELINE_PATH.exists():
        artifact = joblib.load(NEW_PIPELINE_PATH)
        pipeline = artifact["pipeline"]
        features = artifact["features"]
        info = {
            "model_name": artifact.get("model_name", "Random Forest Pipeline"),
            "features": features,
            "n_features": len(features),
            "classes": {"0": "Normal", "1": "Pre-diabetes"},
            "threshold": 0.5,
            "metrics": artifact.get("test_metrics", {})
        }
        return pipeline, None, info

    if not MODEL_PATH.exists() or not SCALER_PATH.exists():
        raise FileNotFoundError(f"Model assets not found in {MODELS_DIR}")

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    with open(INFO_PATH, "r", encoding="utf-8") as f:
        info = json.load(f)

    return model, scaler, info


def predict_patient(patient_data: dict, model, scaler, info) -> dict:
    """
    Predict risk for a single patient profile.
    Automatically computes MAP (Mean Arterial Pressure) and TG/HDL ratio if not provided.
    """
    data = patient_data.copy()

    # Derived metrics fallback
    if "map_pressure" not in data or data["map_pressure"] is None:
        data["map_pressure"] = (2.0 * data["bp_diastolic"] + data["bp_systolic"]) / 3.0

    if "tg_hdl_ratio" not in data or data["tg_hdl_ratio"] is None:
        data["tg_hdl_ratio"] = data["triglycerides"] / data["hdl"]

    # Order features according to model specification
    features = info["features"]
    feature_values = [data.get(f, 0.0) for f in features]
    X_df = pd.DataFrame([feature_values], columns=features)

    # Scale and predict (using Pipeline if scaler is None, else legacy scaler)
    if scaler is None:
        pred = int(model.predict(X_df)[0])
        probs = model.predict_proba(X_df)[0]
    else:
        X_scaled = scaler.transform(X_df)
        pred = int(model.predict(X_scaled)[0])
        probs = model.predict_proba(X_scaled)[0]

    prob_normal = float(probs[0])
    prob_prediabetes = float(probs[1])

    # Determine risk label and CTA
    class_name = info["classes"].get(str(pred), "Unknown")
    risk_level = "Tinggi (High Risk)" if pred == 1 else "Rendah (Low Risk)"

    if pred == 1:
        cta = "Hasil skrining mengindikasikan risiko prediabetes. Disarankan mendaftar Program Intervensi 90 Hari GluCare, mengurangi konsumsi gula sederhana, dan evaluasi medis berkala."
    else:
        cta = "Profil metabolik dalam rentang sehat/normal. Pertahankan pola makan seimbang, aktivitas fisik rutin, dan pantau kesehatan berkala."

    return {
        "status": class_name,
        "prediction_raw": pred,
        "risk_level": risk_level,
        "risk_score_percent": round(prob_prediabetes * 100, 1),
        "probability_normal": round(prob_normal, 4),
        "probability_prediabetes": round(prob_prediabetes, 4),
        "cta": cta,
    }


def print_patient_report(case_title: str, patient: dict, result: dict):
    """Print the clinical diagnostic report."""
    print("\n" + "=" * 75)
    print(f">> {case_title.upper()}")
    print("=" * 75)
    print("DATA PARAMETER PASIEN:")
    print(f"  * Usia             : {patient['age']} tahun")
    print(f"  * Jenis Kelamin    : {'Laki-laki' if patient['gender'] == 1 else 'Perempuan'}")
    print(f"  * Glukosa Puasa    : {patient['glucose_fasting']} mg/dL")
    print(f"  * Lingkar Perut    : {patient['waist_cm']} cm")
    print(f"  * Indeks Massa BMI : {patient['bmi']} kg/m2")
    map_val = (2 * patient['bp_diastolic'] + patient['bp_systolic']) / 3.0
    print(f"  * Tekanan Darah    : {patient['bp_systolic']}/{patient['bp_diastolic']} mmHg (MAP: {map_val:.1f})")
    print(f"  * Kolesterol HDL   : {patient['hdl']} mg/dL")
    tg_hdl = patient['triglycerides'] / patient['hdl']
    print(f"  * Trigliserida     : {patient['triglycerides']} mg/dL (TG/HDL Ratio: {tg_hdl:.2f})")

    print("-" * 75)
    print("HASIL ANALISIS MODEL AI GLUCARE:")
    badge = "[SEHAT / NORMAL]" if result["prediction_raw"] == 0 else "[BERISIKO PREDIABETES]"
    print(f"  * Diagnosis Model  : {badge}")
    print(f"  * Kategori Risiko  : {result['risk_level']}")
    print(f"  * Skor Risiko      : {result['risk_score_percent']}%")
    print(f"  * Probabilitas     : Normal = {result['probability_normal']*100:.1f}% | Prediabetes = {result['probability_prediabetes']*100:.1f}%")
    print(f"\nREKOMENDASI KLINIS (CTA):\n  {result['cta']}")
    print("=" * 75)


def input_custom_patient(model, scaler, info):
    """Allow user to enter custom clinical values from terminal."""
    print("\n" + "=" * 75)
    print("MASUKKAN DATA PASIEN SECARA MANUAL:")
    print("=" * 75)
    try:
        age = int(input("1. Usia (tahun, contoh: 28): ") or 28)
        gender = int(input("2. Jenis Kelamin (1 = Laki-laki, 2 = Perempuan, contoh: 1): ") or 1)
        glucose = float(input("3. Glukosa Darah Puasa (mg/dL, contoh: 95): ") or 95.0)
        waist = float(input("4. Lingkar Perut (cm, contoh: 80): ") or 80.0)
        bmi = float(input("5. Indeks Massa Tubuh / BMI (contoh: 23.5): ") or 23.5)
        sys_bp = float(input("6. Tekanan Darah Sistolik (mmHg, contoh: 115): ") or 115.0)
        dia_bp = float(input("7. Tekanan Darah Diastolik (mmHg, contoh: 75): ") or 75.0)
        hdl = float(input("8. Kolesterol HDL (mg/dL, contoh: 55): ") or 55.0)
        trig = float(input("9. Trigliserida (mg/dL, contoh: 90): ") or 90.0)

        custom_patient = {
            "glucose_fasting": glucose,
            "age": age,
            "waist_cm": waist,
            "bmi": bmi,
            "hdl": hdl,
            "triglycerides": trig,
            "bp_systolic": sys_bp,
            "bp_diastolic": dia_bp,
            "gender": gender,
        }

        res = predict_patient(custom_patient, model, scaler, info)
        print_patient_report("HASIL UJI PASIEN KUSTOM", custom_patient, res)
    except Exception as e:
        print(f"Input dibatalkan atau tidak valid: {e}")


def run_tests():
    print("\n" + "=" * 75)
    print("MEMULAI UJI INFERENSI MODEL PREDIABETES GLUCARE")
    print("=" * 75)
    model, scaler, info = load_model_assets()
    print(f"Model Name  : {info['model_name']}")
    print(f"Fitur Input : {info['n_features']} parameter laboratorium & fisik")
    print(f"Threshold   : {info['threshold']}")

    if "--custom" in sys.argv or "--input" in sys.argv:
        input_custom_patient(model, scaler, info)
        return

    # Skenario 1: Pasien Sehat / Normal
    pasien_sehat = {
        "glucose_fasting": 86.0,
        "age": 24,
        "waist_cm": 74.0,
        "bmi": 21.8,
        "hdl": 62.0,
        "triglycerides": 72.0,
        "bp_systolic": 110.0,
        "bp_diastolic": 70.0,
        "gender": 1,
    }
    res_sehat = predict_patient(pasien_sehat, model, scaler, info)
    print_patient_report("Skenario 1: Pasien Dewasa Muda Sehat (Gaya Hidup Aktif)", pasien_sehat, res_sehat)

    # Skenario 2: Pasien Berisiko Prediabetes (Gula Darah & Lingkar Perut Tinggi)
    pasien_prediabetes = {
        "glucose_fasting": 112.0,
        "age": 34,
        "waist_cm": 98.5,
        "bmi": 30.2,
        "hdl": 41.0,
        "triglycerides": 182.0,
        "bp_systolic": 132.0,
        "bp_diastolic": 86.0,
        "gender": 1,
    }
    res_prediab = predict_patient(pasien_prediabetes, model, scaler, info)
    print_patient_report("Skenario 2: Pasien Berisiko Prediabetes (Sindrom Metabolik)", pasien_prediabetes, res_prediab)

    # Skenario 3: Pasien Borderline (BMI Normal, Namun Gula Darah Puasa Masuk Batas 104 mg/dL)
    pasien_borderline = {
        "glucose_fasting": 104.0,
        "age": 29,
        "waist_cm": 82.0,
        "bmi": 23.5,
        "hdl": 50.0,
        "triglycerides": 130.0,
        "bp_systolic": 118.0,
        "bp_diastolic": 76.0,
        "gender": 2,
    }
    res_borderline = predict_patient(pasien_borderline, model, scaler, info)
    print_patient_report("Skenario 3: Pasien Borderline / Skrining Dini (BMI Normal, FPG Ringan Tinggi)", pasien_borderline, res_borderline)

    print("\n[TIPS] Anda juga dapat memasukkan data angka sendiri secara interaktif dengan perintah:")
    print("       python main-feature/glucare_ai/test_prediction.py --custom\n")


if __name__ == "__main__":
    run_tests()
