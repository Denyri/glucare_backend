"""
Interactive Test Script for GluCare AI Monitoring (Day 30 Assessment)
Run this script to test the 90-Day Smart Monitoring AI locally.
"""

import sys
import json
from pathlib import Path

# Add root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent if Path(__file__).resolve().parent.name == "tests" else Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from src.monitoring_inference import predict_day30_assessment

def run_tests():
    print("=" * 75)
    print("GLUCARE AI - PENGUJIAN MODEL MONITORING 90 HARI (DAY 30 ASSESSMENT)")
    print("=" * 75)
    
    # Kasus 1: Pasien Disiplin (Tren Membaik)
    patient_improving = {
        "glucose_month1_mean": 108.0,
        "glucose_month1_std": 8.5,
        "glucose_slope_month1": -1.2, # Tren gula darah turun
        "baseline_glucose": 125.0,
        "steps_month1_mean": 8500.0,
        "steps_consistency_m1": 0.85,
        "sleep_month1_mean": 7.5,
        "sleep_consistency_m1": 0.82,
        "carbs_month1_mean": 160.0,
        "sleep_adherence_m1": 0.90,
        "steps_adherence_m1": 0.88,
        "max_streak_m1": 14,
        "corr_sleep_glucose_m1": -0.35,
        "corr_steps_glucose_m1": -0.40,
        "corr_carbs_glucose_m1": 0.30
    }
    
    # Kasus 2: Pasien Kurang Disiplin (Tren Berisiko Memburuk/Stagnan)
    patient_worsening = {
        "glucose_month1_mean": 132.0,
        "glucose_month1_std": 22.4, # Gula darah sangat fluktuatif
        "glucose_slope_month1": +0.9, # Tren gula darah naik
        "baseline_glucose": 115.0,
        "steps_month1_mean": 3200.0,
        "steps_consistency_m1": 0.35,
        "sleep_month1_mean": 5.2,
        "sleep_consistency_m1": 0.40,
        "carbs_month1_mean": 260.0,
        "sleep_adherence_m1": 0.45,
        "steps_adherence_m1": 0.30,
        "max_streak_m1": 2,
        "corr_sleep_glucose_m1": 0.10,
        "corr_steps_glucose_m1": 0.05,
        "corr_carbs_glucose_m1": 0.65
    }
    
    scenarios = [
        ("SKENARIO 1: PASIEN DENGAN KEPATUHAN TINGGI (POLA SEHAT)", patient_improving),
        ("SKENARIO 2: PASIEN DENGAN KEPATUHAN RENDAH (RISIKO STAGNAN/BURUK)", patient_worsening)
    ]
    
    for title, data in scenarios:
        res = predict_day30_assessment(data)
        print(f"\n>> {title}")
        print("-" * 75)
        print(f"Status Trajektori AI : {res['trajectory_status'].upper()}")
        print(f"Peluang Membaik      : {res['improving_score_percent']}%")
        print(f"Peluang Memburuk     : {res['worsening_score_percent']}%")
        print(f"Ringkasan AI         : {res['summary']}")
        print(f"Saran Intervensi     : {res['recommendation']}")
        
    print("\n" + "=" * 75)
    print("PENGUJIAN LOKAL BERHASIL LENGKAP!")
    print("=" * 75)

if __name__ == "__main__":
    run_tests()
