"""
===============================================================================
GLUCARE AI - LOCAL MICROSERVICE SERVER (FASTAPI / UVICORN)
===============================================================================
Microservice AI Resmi GluCare untuk:
1. POST /predict/clinical       -> Skrining Risiko Prediabetes Klinis (Random Forest + ADA)
2. POST /predict/questionnaire  -> Skrining Kuesioner Gaya Hidup Non-Invasif (12 Fitur NHANES)
3. POST /predict/day30          -> Evaluasi Trajektori Metabolisme Hari ke-30 (XGBoost)
4. POST /predict/day90          -> Evaluasi Capaian Akhir Program Intervensi Hari ke-90
5. POST /predict/daily          -> Evaluasi Harian Kepatuhan 3 Pilar (Tidur, Gerak, Nutrisi)
6. POST /predict/glucose        -> Triase Klinis Glukosa Darah Harian Standar ADA
7. POST /program/enroll         -> Preskripsi AI Personal Program Intervensi 90 Hari
8. GET  /ping & GET /           -> Diagnostic & System Health Probe
9. GET  /docs/export-spec       -> Unduh Spesifikasi OpenAPI 3.0 / Swagger JSON

Dokumentasi Interaktif:
- Swagger UI : http://localhost:8000/docs
- ReDoc      : http://localhost:8000/redoc
- OpenAPI    : http://localhost:8000/openapi.json
===============================================================================
"""

import sys
import os
from pathlib import Path
import warnings
import json

import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import uvicorn

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

warnings.filterwarnings("ignore")

# ===============================================================================
# DESKRIPSI & METADATA OPENAPI SWAGGER DOKUMENTASI
# ===============================================================================
API_DESCRIPTION = """
## 🩺 GluCare AI Engine & Clinical Microservice API (OpenAPI / Swagger 3.0)

Selamat datang di dokumentasi resmi **GluCare AI Engine**. Layanan microservice ini menyediakan model Machine Learning prediktif dan inferensi klinis berbasis bukti (*evidence-based*) yang dirancang khusus untuk deteksi dini, pemantauan, dan pemulihan prediabetes pada populasi usia produktif (20–40 tahun).

---

### 🧠 Arsitektur Model Machine Learning
1. **Clinical Screening Model (Random Forest & ADA Triage)**:
   - Terlatih pada dataset CDC NHANES 2021–2023 dengan 12 fitur klinis: GDP, profil lipid (HDL, Trigliserida, Rasio TG/HDL), antropometri (BMI, Lingkar Pinggang), dan tekanan darah.
   - Metrik Uji Independen: Akurasi **94.66%**, ROC-AUC **0.9634**, Spesifisitas **98.78%**.
2. **Questionnaire Lifestyle Model (Random Forest ML & Heuristic Fallback)**:
   - Skrining non-invasif berbasis 12 parameter gaya hidup, antropometri Asia, dan riwayat medis keluarga tanpa memerlukan jarum/sampel darah.
   - Metrik Uji: ROC-AUC **0.866**, Precision **80.0%**.
3. **90-Day Trajectory Monitoring Model (XGBoost Classifier)**:
   - Evaluasi milestone pada Hari ke-30 untuk memproyeksikan lintasan metabolisme pasien di Hari ke-90 (*Membaik* vs *Memburuk / Stagnan*).
4. **Daily Metabolic Impact Engine & ADA Glucose Triage**:
   - Menghitung skor dampak metabolik harian dari 3 pilar (Tidur, Jalan Kaki, Nutrisi) dan melakukan triase mandiri kadar gula darah sesuai standar American Diabetes Association.

---

### 📌 Navigasi Cepat
- **Swagger UI Interaktif**: [`/docs`](/docs)
- **ReDoc Interactive Reader**: [`/redoc`](/redoc)
- **Skema OpenAPI JSON**: [`/openapi.json`](/openapi.json)
- **Unduh Skema Mandiri**: [`/docs/export-spec`](/docs/export-spec)
"""

tags_metadata = [
    {
        "name": "1. Skrining Risiko (Clinical & Questionnaire)",
        "description": "Endpoint inferensi AI untuk deteksi dini risiko prediabetes: melalui parameter laboratorium klinis lengkap (Random Forest) atau kuesioner gaya hidup non-invasif 12 faktor (NHANES ML Classifier)."
    },
    {
        "name": "2. Monitoring Intervensi 90 Hari (Milestone)",
        "description": "Evaluasi pencapaian lintasan metabolisme (trajectory tracking) pada Hari ke-30 (XGBoost Classifier) dan evaluasi capaian akhir program pada Hari ke-90."
    },
    {
        "name": "3. Telemetri Harian & Glukosa (Daily Tracking)",
        "description": "Pencatatan dan analisis harian waktu nyata untuk 3 pilar gaya hidup (tidur, jalan kaki, nutrisi) serta triase klinis gula darah mandiri berdasarkan standar ADA."
    },
    {
        "name": "4. Preskripsi Program Intervensi (Enrollment)",
        "description": "Algoritma rekomendasi otomatis dan penyesuaian target harian personal untuk program intervensi 90 hari berbasis profil risiko metabolik pengguna."
    },
    {
        "name": "5. Diagnostic & System Health",
        "description": "Pemeriksaan status kesehatan microservice, verifikasi kesiapan model Machine Learning dalam memori, dan ekspor spesifikasi Swagger/OpenAPI."
    }
]


# ===============================================================================
# PYDANTIC INPUT SCHEMAS (REQUEST VALIDATION & SWAGGER UI)
# ===============================================================================
class ClinicalPredictionInput(BaseModel):
    user_id: Optional[str] = Field("usr_test_001", description="ID Pengguna / Pasien (opsional)")
    glucose_fasting: float = Field(105.0, description="Glukosa Darah Puasa / GDP dalam mg/dL (Ambang Normal ADA: <100, Prediabetes: 100-125, Diabetes: >=126)")
    age: int = Field(32, description="Usia pasien (dewasa muda 20-40 tahun)")
    gender: int = Field(1, description="Jenis Kelamin (1: Laki-laki, 2: Perempuan)")
    weight: float = Field(74.5, description="Berat Badan (kg)")
    height: Optional[float] = Field(170.0, description="Tinggi Badan (cm)")
    bmi: float = Field(25.8, description="Indeks Massa Tubuh / BMI (kg/m2, Standar Asia Overweight >=23, Obesitas >=27.5)")
    waist_cm: float = Field(88.0, description="Lingkar Pinggang dalam cm (Ambang berisiko: Pria >90 cm, Wanita >80 cm)")
    bp_systolic: float = Field(122.0, description="Tekanan Darah Sistolik (mmHg)")
    bp_diastolic: float = Field(78.0, description="Tekanan Darah Diastolik (mmHg)")
    hdl: float = Field(48.0, description="Kolesterol HDL (mg/dL, protektif: >50)")
    triglycerides: float = Field(145.0, description="Kadar Trigliserida (mg/dL, optimal: <150)")
    map_pressure: Optional[float] = Field(None, description="Mean Arterial Pressure (opsional, auto-hitung jika kosong)")
    tg_hdl_ratio: Optional[float] = Field(None, description="Rasio Trigliserida / HDL (opsional, penanda resistensi insulin)")
    riwayat_keluarga: Optional[int] = Field(0, description="Riwayat diabetes di keluarga (0: Tidak, 1: Ya)")
    riwayat_diabetes: Optional[int] = Field(0, description="Riwayat diabetes pasien sebelumnya (0: Tidak, 1: Ya)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "glucose_fasting": 105.0,
                "age": 32,
                "gender": 1,
                "weight": 74.5,
                "height": 170.0,
                "bmi": 25.8,
                "waist_cm": 88.0,
                "bp_systolic": 122.0,
                "bp_diastolic": 78.0,
                "hdl": 48.0,
                "triglycerides": 145.0,
                "riwayat_keluarga": 0,
                "riwayat_diabetes": 0
            }
        }
    }


class QuestionnairePredictionInput(BaseModel):
    user_id: Optional[str] = Field("usr_test_001", description="ID Pengguna (opsional)")
    # ── Demografis ────────────────────────────────────────────
    age_band: int = Field(1, description="Kelompok Usia (0: <30 tahun, 1: 30-39 tahun)")
    gender: int = Field(2, description="Jenis Kelamin (1: Laki-laki, 2: Perempuan)")
    # ── Antropometri ─────────────────────────────────────────
    bmi_category: int = Field(1, description="Kategori BMI Standar Asia (0: Normal <23, 1: Overweight 23-27.4, 2: Obesitas >=27.5)")
    waist_category: int = Field(1, description="Lingkar Pinggang Berisiko (0: Normal [Pria<=90, Wanita<=80], 1: Berisiko [Pria>90, Wanita>80])")
    # ── Riwayat Medis ─────────────────────────────────────────
    hypertension: int = Field(0, description="Riwayat Hipertensi / Tekanan Darah Tinggi (0: Tidak, 1: Ya)")
    diabetes_history: int = Field(0, description="Riwayat Diabetes Diri Sendiri (0: Tidak, 1: Ya)")
    prediabetes_told: int = Field(0, description="Pernah Diberitahu Dokter Borderline / Prediabetes (0: Tidak, 1: Ya)")
    prediabetes_history: int = Field(0, description="Riwayat Prediabetes / Keluarga Diabetes (0: Tidak, 1: Ya)")
    # ── Gaya Hidup ────────────────────────────────────────────
    physically_active: int = Field(0, description="Aktivitas Fisik >=150 menit/minggu rekomendasi WHO (0: Tidak, 1: Ya)")
    sedentary_hours: float = Field(6.0, description="Durasi Duduk / Tidak Aktif Fisik per hari (jam)")
    current_smoker: int = Field(0, description="Status Perokok Aktif (0: Tidak, 1: Ya)")
    poor_diet: int = Field(1, description="Pola Makan Kurang Sehat / Tinggi Gula Sederhana (0: Tidak, 1: Ya)")
    # ── Legacy compatibility field ───────────────────────────
    overweight_history: Optional[int] = Field(0, description="[Legacy] Riwayat kelebihan berat badan (0: Tidak, 1: Ya)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "age_band": 1,
                "gender": 2,
                "bmi_category": 1,
                "waist_category": 1,
                "hypertension": 0,
                "diabetes_history": 0,
                "prediabetes_told": 0,
                "prediabetes_history": 0,
                "physically_active": 0,
                "sedentary_hours": 6.0,
                "current_smoker": 0,
                "poor_diet": 1
            }
        }
    }


class Day30PredictionInput(BaseModel):
    patient_id: Optional[str] = Field("usr_test_001", description="ID Pasien/Pengguna")
    glucose_month1_mean: Optional[float] = Field(98.5, description="Rata-rata Glukosa Bulan ke-1 (mg/dL)")
    steps_month1_mean: Optional[float] = Field(7500.0, description="Rata-rata Langkah Harian Bulan ke-1")
    adherence_pct: Optional[float] = Field(90.0, description="Tingkat Kepatuhan Logging Aktivitas (%)")
    records: Optional[List[Dict[str, Any]]] = Field(None, description="Array log telemetri harian bulan ke-1 (opsional)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "patient_id": "usr_test_001",
                "glucose_month1_mean": 98.5,
                "steps_month1_mean": 7500.0,
                "adherence_pct": 90.0
            }
        }
    }


class Day90PredictionInput(BaseModel):
    patient_id: Optional[str] = Field("usr_test_001", description="ID Pasien/Pengguna")
    month1_glucose_values: Optional[List[float]] = Field([108.0, 105.0, 102.0], description="Daftar nilai glukosa puasa bulan ke-1 (mg/dL)")
    month3_glucose_values: Optional[List[float]] = Field([96.0, 94.0, 92.0], description="Daftar nilai glukosa puasa bulan ke-3 (mg/dL)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "patient_id": "usr_test_001",
                "month1_glucose_values": [108.0, 105.0, 102.0],
                "month3_glucose_values": [96.0, 94.0, 92.0]
            }
        }
    }


class DailyPredictionInput(BaseModel):
    user_id: Optional[str] = Field("usr_test_001", description="ID Pengguna")
    day: int = Field(1, description="Hari ke- dalam program (1 sampai 90)")
    sleep_hours: float = Field(7.5, description="Jumlah jam tidur malam ini (jam)")
    walking_minutes: float = Field(45.0, description="Durasi jalan kaki hari ini (menit)")
    nutrition_score: float = Field(85.0, description="Skor kepatuhan nutrisi harian (0-100)")
    glucose_value: Optional[float] = Field(98.0, description="Kadar gula darah harian jika ada (mg/dL)")
    sleep_target_hours: Optional[float] = Field(7.5, description="Target jam tidur pengguna")
    walking_target_minutes: Optional[int] = Field(30, description="Target menit jalan kaki pengguna")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "day": 1,
                "sleep_hours": 7.5,
                "walking_minutes": 45.0,
                "nutrition_score": 85.0,
                "glucose_value": 98.0,
                "sleep_target_hours": 7.5,
                "walking_target_minutes": 30
            }
        }
    }


class GlucosePredictionInput(BaseModel):
    user_id: Optional[str] = Field("usr_test_001", description="ID Pengguna")
    day: int = Field(1, description="Hari ke- dalam program (1 sampai 90)")
    glucose_value: float = Field(104.0, description="Kadar gula darah harian dalam mg/dL")
    fasting: Optional[bool] = Field(True, description="Apakah pengukuran kondisi puasa (True/False)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "day": 1,
                "glucose_value": 104.0,
                "fasting": True
            }
        }
    }


class EnrollPredictionInput(BaseModel):
    user_id: Optional[str] = Field("usr_test_001", description="ID Pengguna")
    risk_level: Optional[str] = Field("Prediabetes", description="Tingkat risiko klinis AI (Normal / Prediabetes / Diabetes)")
    glucose_fasting: Optional[float] = Field(105.0, description="Kadar glukosa darah puasa terakhir (mg/dL)")
    bmi: Optional[float] = Field(26.5, description="Indeks Massa Tubuh (BMI)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "risk_level": "Prediabetes",
                "glucose_fasting": 105.0,
                "bmi": 26.5
            }
        }
    }


# ===============================================================================
# PYDANTIC RESPONSE SCHEMAS (SWAGGER UI RESPONSE SPECIFICATIONS)
# ===============================================================================
class ClinicalPredictionResponse(BaseModel):
    prediction: List[int] = Field(..., description="Prediksi kelas biner (0: Normal, 1: Prediabetes)")
    predict_proba: List[List[float]] = Field(..., description="Array probabilitas [P(Normal), P(Prediabetes), P(Diabetes)]")
    risk_level: str = Field(..., description="Tingkat klasifikasi risiko: 'Normal', 'Prediabetes', atau 'Diabetes'")
    score: int = Field(..., description="Skor risiko prediabetes dalam persen (0-100%)")
    probability_prediabetes: float = Field(..., description="Probabilitas terkalibrasi prediabetes (0.0000 - 1.0000)")
    probability_normal: float = Field(..., description="Probabilitas kondisi sehat / normal (0.0000 - 1.0000)")
    summary: str = Field(..., description="Ringkasan penjelasan diagnosis klinis AI")

    model_config = {
        "json_schema_extra": {
            "example": {
                "prediction": [1],
                "predict_proba": [[0.1500, 0.8500, 0.0]],
                "risk_level": "Prediabetes",
                "score": 85,
                "probability_prediabetes": 0.8500,
                "probability_normal": 0.1500,
                "summary": "Hasil analisis klinis mengindikasikan tingkat risiko: Prediabetes (Skor: 85%)"
            }
        }
    }


class QuestionnairePredictionResponse(BaseModel):
    prediction: List[int] = Field(..., description="Prediksi kelas model (0: Normal, 1: Prediabetes)")
    predict_proba: List[List[float]] = Field(..., description="Array probabilitas model [P(Normal), P(Prediabetes), 0.0]")
    risk_level: str = Field(..., description="Kategori risiko gaya hidup ('Normal' atau 'Prediabetes')")
    score: int = Field(..., description="Skor risiko gaya hidup dalam persen (0-100%)")
    probability_prediabetes: float = Field(..., description="Probabilitas model prediabetes (0.0000 - 1.0000)")
    probability_normal: float = Field(..., description="Probabilitas model normal (0.0000 - 1.0000)")
    model_source: str = Field(..., description="Arsitektur model inferensi ('ML (NHANES 2021-2023)' atau 'heuristic-fallback')")
    summary: str = Field(..., description="Ringkasan interpretasi gaya hidup dari AI")

    model_config = {
        "json_schema_extra": {
            "example": {
                "prediction": [1],
                "predict_proba": [[0.1800, 0.8200, 0.0]],
                "risk_level": "Prediabetes",
                "score": 82,
                "probability_prediabetes": 0.8200,
                "probability_normal": 0.1800,
                "model_source": "ML (NHANES 2021-2023)",
                "summary": "Analisis kuesioner gaya hidup menunjukkan tingkat risiko: Prediabetes (Skor: 82%)"
            }
        }
    }


class Day30PredictionResponse(BaseModel):
    score: int = Field(..., description="Skor trajektori keberhasilan pemulihan (0-100)")
    risk_level: str = Field(..., description="Kategori risiko trajektori ('Low' atau 'Medium')")
    trajectory_status: str = Field(..., description="Arah lintasan metabolisme ('Membaik' atau 'Memburuk / Stagnan')")
    summary: str = Field(..., description="Ringkasan evaluasi trajektori AI bulan ke-1")
    recommendations: str = Field(..., description="Rekomendasi tindakan penyesuaian gaya hidup")
    improving_score_percent: Optional[float] = Field(None, description="Peluang perbaikan metabolisme di Hari ke-90 (%)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "score": 96,
                "risk_level": "Low",
                "trajectory_status": "Membaik",
                "summary": "Tren metabolisme dan kepatuhan gaya hidup Anda di Bulan ke-1 menunjukkan proyeksi positif untuk hari ke-90.",
                "recommendations": "Pertahankan konsistensi jam tidur dan aktivitas fisik harian Anda saat ini.",
                "improving_score_percent": 96.3
            }
        }
    }


class Day90PredictionResponse(BaseModel):
    score: int = Field(..., description="Skor evaluasi akhir program 90 hari (0-100)")
    risk_level: str = Field(..., description="Status risiko akhir ('Low' atau 'Medium')")
    summary: str = Field(..., description="Pernyataan evaluasi keberhasilan 90 hari")
    recommendations: str = Field(..., description="Panduan menjaga kestabilan glukosa jangka panjang")

    model_config = {
        "json_schema_extra": {
            "example": {
                "score": 92,
                "risk_level": "Low",
                "summary": "Selamat! Program 90 Hari GluCare berhasil diselesaikan dengan hasil positif.",
                "recommendations": "Pertahankan kebiasaan makan sehat dan olahraga rutin secara konsisten."
            }
        }
    }


class DailyPredictionResponse(BaseModel):
    status: str = Field(..., description="Status penyimpanan data ('saved')")
    user_id: Optional[str] = Field(None, description="ID Pengguna")
    day: Optional[int] = Field(None, description="Hari ke- dalam program")
    goal_achieved: bool = Field(..., description="Indikator apakah ketiga pilar berhasil tercapai")
    sleep_met: bool = Field(..., description="Status pemenuhan target tidur")
    walking_met: bool = Field(..., description="Status pemenuhan target jalan kaki")
    nutrition_met: bool = Field(..., description="Status pemenuhan target nutrisi")
    metabolic_impact_score: float = Field(..., description="Skor dampak metabolik harian terbobot (0.0 - 100.0)")
    ai_feedback: str = Field(..., description="Feedback fisiologis berbasis sains dari AI")
    tomorrow_tip: str = Field(..., description="Tindakan prioritas esok hari")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "saved",
                "user_id": "usr_test_001",
                "day": 1,
                "goal_achieved": True,
                "sleep_met": True,
                "walking_met": True,
                "nutrition_met": True,
                "metabolic_impact_score": 95.5,
                "ai_feedback": "Luar biasa! Seluruh target 3 pilar hari ini tercapai (Skor Metabolik: 95.5%). Kombinasi jalan kaki 45 menit dan tidur 7.5 jam ini secara langsung mengaktifkan translokasi GLUT4 di otot, membantu menstabilkan glukosa puasa esok pagi.",
                "tomorrow_tip": "Pertahankan ritme ini. Lakukan peregangan ringan 5 menit sebelum tidur untuk mengoptimalkan deep sleep."
            }
        }
    }


class GlucosePredictionResponse(BaseModel):
    status: str = Field(..., description="Status penyimpanan ('saved')")
    user_id: Optional[str] = Field(None, description="ID Pengguna")
    day: Optional[int] = Field(None, description="Hari ke- dalam program")
    glucose_value: float = Field(..., description="Kadar gula darah yang dimasukkan (mg/dL)")
    category: str = Field(..., description="Kategori zona glukosa menurut kriteria ADA")
    is_safe: bool = Field(..., description="Indikator apakah kadar berada dalam batas aman")
    ai_insight: str = Field(..., description="Penjelasan klinis mengenai kadar gula darah")
    recommended_action: str = Field(..., description="Tindakan intervensi segera yang direkomendasikan")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "saved",
                "user_id": "usr_test_001",
                "day": 1,
                "glucose_value": 104.0,
                "category": "Prediabetes Alert (Zona Intervensi)",
                "is_safe": False,
                "ai_insight": "Kadar glukosa darah Anda (104.0 mg/dL) berada di rentang Prediabetes (100 - 125 mg/dL). Ini merupakan sinyal dini toleransi glukosa terganggu, namun masih dalam golden window untuk pemulihan.",
                "recommended_action": "Minum 1-2 gelas air putih, hindari camilan manis, dan lakukan jalan santai 15 menit untuk memicu serapan glukosa otot."
            }
        }
    }


class DailyTargetsSchema(BaseModel):
    sleep_target_hours: float = Field(..., description="Target jam tidur per hari")
    walking_target_minutes: int = Field(..., description="Target menit jalan kaki per hari")
    nutrition_goal: str = Field(..., description="Fokus panduan nutrisi harian")


class EnrollPredictionResponse(BaseModel):
    user_id: Optional[str] = Field(None, description="ID Pengguna")
    program_status: str = Field(..., description="Status pendaftaran ('enrolled')")
    duration_days: int = Field(..., description="Durasi program intervensi (90 hari)")
    program_type: str = Field(..., description="Tipe program spesifik sesuai tingkat risiko klinis")
    daily_targets: DailyTargetsSchema = Field(..., description="Preskripsi target harian 3 pilar yang dipersonalisasi")
    streak_counter: int = Field(..., description="Penghitung konsistensi awal (0)")
    recommendation_summary: str = Field(..., description="Rasional ilmiah di balik preskripsi program")

    model_config = {
        "json_schema_extra": {
            "example": {
                "user_id": "usr_test_001",
                "program_status": "enrolled",
                "duration_days": 90,
                "program_type": "Prediabetes Reversal 90-Day Plan",
                "daily_targets": {
                    "sleep_target_hours": 8.0,
                    "walking_target_minutes": 40,
                    "nutrition_goal": "Defisit Kalori Ringan, Serat >= 30g/hari, Hindari Minuman Manis (Reversal Prediabetes)"
                },
                "streak_counter": 0,
                "recommendation_summary": "AI merekomendasikan program pemulihan prediabetes: target jalan 40 menit dan tidur 8 jam selama 90 hari."
            }
        }
    }


class HealthCheckResponse(BaseModel):
    status: str = Field(..., description="Status server ('ok')")
    service: str = Field(..., description="Nama layanan microservice")
    version: str = Field(..., description="Versi AI Engine")
    models_loaded: Dict[str, bool] = Field(..., description="Status kesiapan pemuatan setiap model ML")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "service": "GluCare AI Local Microservice",
                "version": "2.1.0",
                "models_loaded": {
                    "clinical": True,
                    "questionnaire": True,
                    "monitoring_day30": True
                }
            }
        }
    }


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Pesan deskriptif kesalahan")

    model_config = {
        "json_schema_extra": {
            "example": {
                "detail": "Parameter data tidak valid atau model belum dimuat"
            }
        }
    }


# ===============================================================================
# PATH SETUP & FASTAPI INITIALIZATION
# ===============================================================================
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
CLINICAL_MODEL_PATH        = MODELS_DIR / "glucare_prediabetes_model.joblib"
MONITORING_MODEL_PATH      = MODELS_DIR / "monitoring_day30_model.pkl"
QUESTIONNAIRE_MODEL_PATH   = MODELS_DIR / "glucare_questionnaire_model.joblib"

app = FastAPI(
    title="GluCare AI Engine & Clinical Microservice API",
    description=API_DESCRIPTION,
    version="2.1.0",
    openapi_tags=tags_metadata,
    contact={
        "name": "Tim AI & Medis GluCare",
        "url": "https://glucare.health",
        "email": "ai-dev@glucare.health"
    },
    license_info={
        "name": "Proprietary - GluCare Health",
    },
    swagger_ui_parameters={
        "docExpansion": "list",
        "defaultModelsExpandDepth": 2,
        "displayRequestDuration": True,
        "filter": True
    }
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
clinical_pipeline       = None
clinical_features       = []
monitoring_artifact     = None
questionnaire_pipeline  = None
questionnaire_features  = []


@app.on_event("startup")
def load_models():
    global clinical_pipeline, clinical_features, monitoring_artifact
    global questionnaire_pipeline, questionnaire_features

    # 1. Load Clinical Prediabetes Model
    if CLINICAL_MODEL_PATH.exists():
        artifact = joblib.load(CLINICAL_MODEL_PATH)
        clinical_pipeline = artifact["pipeline"]
        clinical_features = artifact["features"]
        print(f"[OK] Clinical Model: {artifact.get('model_name', 'RF')} ({len(clinical_features)} features)")
    else:
        print(f"[WARN] Clinical model not found at {CLINICAL_MODEL_PATH}")

    # 2. Load Questionnaire ML Model (Sprint 3B)
    if QUESTIONNAIRE_MODEL_PATH.exists():
        q_artifact = joblib.load(QUESTIONNAIRE_MODEL_PATH)
        questionnaire_pipeline = q_artifact["pipeline"]
        questionnaire_features  = q_artifact["features"]
        print(f"[OK] Questionnaire Model: {q_artifact.get('model_name', 'RF')} (AUC={q_artifact.get('cv_auc', 0):.3f}, {len(questionnaire_features)} features)")
    else:
        print(f"[WARN] Questionnaire model not found at {QUESTIONNAIRE_MODEL_PATH} — will use fallback heuristic")

    # 3. Load Day 30 Monitoring Model
    if MONITORING_MODEL_PATH.exists():
        monitoring_artifact = joblib.load(MONITORING_MODEL_PATH)
        print("[OK] Day 30 Monitoring Model loaded (XGBoost)")
    else:
        print(f"[WARN] Monitoring model not found at {MONITORING_MODEL_PATH}")

    # 4. Otomatis ekspor spesifikasi Swagger / OpenAPI JSON ke docs/swagger_ai_spec.json
    try:
        docs_dir = BASE_DIR / "docs"
        docs_dir.mkdir(parents=True, exist_ok=True)
        spec_path = docs_dir / "swagger_ai_spec.json"
        with open(spec_path, "w", encoding="utf-8") as f:
            json.dump(app.openapi(), f, indent=2, ensure_ascii=False)
        print(f"[OK] OpenAPI/Swagger specification exported to: {spec_path}")
    except Exception as e:
        print(f"[WARN] Gagal mengekspor skema OpenAPI: {e}")


# ===============================================================================
# 5. DIAGNOSTIC & SYSTEM HEALTH ENDPOINTS
# ===============================================================================
@app.get(
    "/",
    tags=["5. Diagnostic & System Health"],
    response_model=HealthCheckResponse,
    summary="Cek Status Layanan & Kesiapan Model AI",
    description="Mengembalikan status operasional microservice dan ketersediaan masing-masing model Machine Learning dalam memori."
)
@app.get(
    "/ping",
    tags=["5. Diagnostic & System Health"],
    response_model=HealthCheckResponse,
    summary="Ping Health Check Endpoint",
    description="Endpoint ringan untuk health probe gateway dan monitoring uptime."
)
def health_check():
    return {
        "status": "ok",
        "service": "GluCare AI Local Microservice",
        "version": "2.1.0",
        "models_loaded": {
            "clinical": clinical_pipeline is not None,
            "questionnaire": questionnaire_pipeline is not None,
            "monitoring_day30": monitoring_artifact is not None
        }
    }


@app.get(
    "/docs/export-spec",
    tags=["5. Diagnostic & System Health"],
    summary="Unduh / Lihat Spesifikasi OpenAPI JSON Lengkap",
    description="Mengembalikan seluruh kamus skema OpenAPI 3.0 / Swagger untuk diimpor ke Postman, Insomnia, atau SwaggerHub."
)
def export_openapi_specification():
    return app.openapi()


# ===============================================================================
# 1. SKRINING RISIKO PREDIABETES (CLINICAL & QUESTIONNAIRE)
# ===============================================================================
@app.post(
    "/predict/clinical",
    tags=["1. Skrining Risiko (Clinical & Questionnaire)"],
    response_model=ClinicalPredictionResponse,
    responses={
        200: {"description": "Hasil skrining risiko klinis berhasil diproses"},
        400: {"model": ErrorResponse, "description": "Parameter data klinis tidak valid"},
        500: {"model": ErrorResponse, "description": "Model klinis belum dimuat"}
    },
    summary="Skrining Risiko Prediabetes via Data Klinis / Lab",
    description="Memprediksi tingkat risiko prediabetes berdasarkan parameter biomarker laboratorium (GDP, Lipid, Tekanan Darah, Antropometri) menggunakan model Random Forest terkalibrasi."
)
async def predict_clinical(payload: ClinicalPredictionInput):
    if clinical_pipeline is None:
        raise HTTPException(status_code=500, detail="Clinical AI model belum dimuat")

    body = payload.model_dump()

    # Hitung nilai turunan jika belum ada
    fpg = float(body.get("glucose_fasting") or 90.0)
    age = int(body.get("age") or 30)
    waist = float(body.get("waist_cm") or 85.0)
    weight = float(body.get("weight") or 70.0)
    bmi = float(body.get("bmi") or 24.0)
    hdl = float(body.get("hdl") or 50.0)
    tg = float(body.get("triglycerides") or 120.0)
    sys_bp = float(body.get("bp_systolic") or 120.0)
    dia_bp = float(body.get("bp_diastolic") or 80.0)
    gender = int(body.get("gender") or 1)

    map_p = float(body.get("map_pressure") or ((sys_bp + 2.0 * dia_bp) / 3.0))
    tg_hdl = float(body.get("tg_hdl_ratio") or (tg / hdl if hdl > 0 else 2.0))

    data_row = {
        "age": age,
        "gender": gender,
        "weight": weight,
        "bmi": bmi,
        "waist_cm": waist,
        "bp_systolic": sys_bp,
        "bp_diastolic": dia_bp,
        "map_pressure": round(map_p, 2),
        "glucose_fasting": fpg,
        "hdl": hdl,
        "triglycerides": tg,
        "tg_hdl_ratio": round(tg_hdl, 2)
    }

    df_input = pd.DataFrame([data_row])[clinical_features]
    
    pred = int(clinical_pipeline.predict(df_input)[0])
    probs = clinical_pipeline.predict_proba(df_input)[0]

    prob_normal = float(probs[0])
    prob_prediabetes = float(probs[1])

    # Kategori risiko
    if fpg >= 126 or prob_prediabetes >= 0.95:
        risk_level = "Diabetes"
    elif pred == 1 or prob_prediabetes >= 0.40:
        risk_level = "Prediabetes"
    else:
        risk_level = "Normal"

    score = int(round(prob_prediabetes * 100))

    return {
        "prediction": [pred],
        "predict_proba": [[round(prob_normal, 4), round(prob_prediabetes, 4), 0.0]],
        "risk_level": risk_level,
        "score": score,
        "probability_prediabetes": round(prob_prediabetes, 4),
        "probability_normal": round(prob_normal, 4),
        "summary": f"Hasil analisis klinis mengindikasikan tingkat risiko: {risk_level} (Skor: {score}%)"
    }


@app.post(
    "/predict/questionnaire",
    tags=["1. Skrining Risiko (Clinical & Questionnaire)"],
    response_model=QuestionnairePredictionResponse,
    responses={
        200: {"description": "Hasil skrining kuesioner gaya hidup berhasil diproses"},
        400: {"model": ErrorResponse, "description": "Parameter kuesioner tidak lengkap"},
        500: {"model": ErrorResponse, "description": "Kegagalan internal proses inferensi"}
    },
    summary="Skrining Risiko Prediabetes via Kuesioner Gaya Hidup Non-Invasif",
    description="Memprediksi risiko prediabetes tanpa sampel darah berbasis 12 faktor risiko gaya hidup, antropometri Asia, dan riwayat kesehatan (dilatih pada survei CDC NHANES 2021-2023)."
)
async def predict_questionnaire(payload: QuestionnairePredictionInput):
    body = payload.model_dump()

    # ── ML-based inference (primary path) ────────────────────
    if questionnaire_pipeline is not None:
        data_row = {
            "age_band"           : int(body.get("age_band") or 0),
            "gender"             : int(body.get("gender") or 2),
            "bmi_category"       : int(body.get("bmi_category") or 0),
            "waist_category"     : int(body.get("waist_category") or 0),
            "hypertension"       : int(body.get("hypertension") or 0),
            "diabetes_history"   : int(body.get("diabetes_history") or 0),
            "prediabetes_told"   : int(body.get("prediabetes_told") or 0),
            "prediabetes_history": int(body.get("prediabetes_history") or 0),
            "physically_active"  : int(body.get("physically_active") or 0),
            "sedentary_hours"    : float(body.get("sedentary_hours") or 6.0),
            "current_smoker"     : int(body.get("current_smoker") or 0),
            "poor_diet"          : int(body.get("poor_diet") or 0),
        }

        df_input = pd.DataFrame([data_row])[questionnaire_features]
        pred     = int(questionnaire_pipeline.predict(df_input)[0])
        probs    = questionnaire_pipeline.predict_proba(df_input)[0]

        prob_normal      = float(probs[0])
        prob_prediabetes = float(probs[1])
        score            = int(round(prob_prediabetes * 100))

        if pred == 1 or prob_prediabetes >= 0.40:
            risk_level = "Prediabetes"
        else:
            risk_level = "Normal"

        return {
            "prediction"            : [pred],
            "predict_proba"         : [[round(prob_normal, 4), round(prob_prediabetes, 4), 0.0]],
            "risk_level"            : risk_level,
            "score"                 : score,
            "probability_prediabetes": round(prob_prediabetes, 4),
            "probability_normal"    : round(prob_normal, 4),
            "model_source"          : "ML (NHANES 2021-2023)",
            "summary"               : f"Analisis kuesioner gaya hidup menunjukkan tingkat risiko: {risk_level} (Skor: {score}%)"
        }

    # ── Fallback heuristik (jika model belum dimuat) ─────────
    age_band       = int(body.get("age_band") or 0)
    bmi_category   = int(body.get("bmi_category") or 0)
    waist_category = int(body.get("waist_category") or 0)
    hypertension   = int(body.get("hypertension") or 0)
    overweight     = int(body.get("overweight_history") or 0)

    raw_score = (
        (age_band * 15) + (bmi_category * 25) +
        (waist_category * 25) + (hypertension * 20) + (overweight * 15)
    )
    score = min(max(raw_score, 10), 95)

    if score >= 60:
        risk_level = "Diabetes"; pred = 2; proba = [0.1, 0.3, 0.6]
    elif score >= 30:
        risk_level = "Prediabetes"; pred = 1; proba = [0.2, 0.7, 0.1]
    else:
        risk_level = "Normal"; pred = 0; proba = [0.8, 0.15, 0.05]

    return {
        "prediction"   : [pred],
        "predict_proba": [proba],
        "risk_level"   : risk_level,
        "score"        : score,
        "probability_prediabetes": round(score / 100.0, 4),
        "probability_normal": round(1.0 - (score / 100.0), 4),
        "model_source" : "heuristic-fallback",
        "summary"      : f"Analisis kuesioner menunjukkan indikasi risiko: {risk_level}"
    }


# ===============================================================================
# 2. MONITORING INTERVENSI 90 HARI (MILESTONE EVALUATION)
# ===============================================================================
@app.post(
    "/predict/day30",
    tags=["2. Monitoring Intervensi 90 Hari (Milestone)"],
    response_model=Day30PredictionResponse,
    responses={
        200: {"description": "Evaluasi trajektori hari ke-30 berhasil dihitung"},
        500: {"model": ErrorResponse, "description": "Kegagalan evaluasi model monitoring"}
    },
    summary="Evaluasi Trajektori Metabolisme Hari ke-30",
    description="Mengevaluasi tren glukosa, kepatuhan aktivitas, dan langkah harian selama 30 hari pertama untuk memprediksi arah perbaikan metabolisme di Hari ke-90 menggunakan model XGBoost."
)
async def predict_day30(payload: Day30PredictionInput):
    body = payload.model_dump()

    # Gunakan monitoring model jika tersedia
    if monitoring_artifact is not None:
        from src.monitoring_inference import predict_day30_assessment
        result = predict_day30_assessment(body)
        
        improving_score = result.get("improving_score_percent", 85.0)
        status_traj = result.get("trajectory_status", "Membaik")
        
        return {
            "score": int(improving_score),
            "risk_level": "Low" if status_traj == "Membaik" else "Medium",
            "trajectory_status": status_traj,
            "summary": result.get("summary", ""),
            "recommendations": result.get("recommendation", ""),
            "improving_score_percent": improving_score
        }
    else:
        # Fallback heuristik jika artifact tidak ada
        gluc_mean = float(body.get("glucose_month1_mean") or 100.0)
        steps_mean = float(body.get("steps_month1_mean") or 7000.0)
        
        is_improving = gluc_mean <= 105 and steps_mean >= 6000
        score = 88 if is_improving else 45
        
        return {
            "score": score,
            "risk_level": "Low" if is_improving else "Medium",
            "trajectory_status": "Membaik" if is_improving else "Memburuk / Stagnan",
            "summary": "Proyeksi 90 hari menunjukkan tren metabolisme membaik." if is_improving else "Variabilitas glukosa membutuhkan penyesuaian gaya hidup.",
            "recommendations": "Pertahankan jam tidur dan target langkah harian.",
            "improving_score_percent": float(score)
        }


@app.post(
    "/predict/day90",
    tags=["2. Monitoring Intervensi 90 Hari (Milestone)"],
    response_model=Day90PredictionResponse,
    responses={
        200: {"description": "Evaluasi akhir milestone 90 hari berhasil diselesaikan"}
    },
    summary="Evaluasi Hasil Akhir Program Intervensi Hari ke-90",
    description="Membandingkan profil glukosa bulan ke-1 terhadap bulan ke-3 untuk mengevaluasi keberhasilan intervensi dan memberikan panduan gaya hidup mandiri jangka panjang."
)
async def predict_day90(payload: Day90PredictionInput):
    body = payload.model_dump()

    m1 = body.get("month1_glucose_values") or [100.0]
    m3 = body.get("month3_glucose_values") or [95.0]

    avg_m1 = np.mean(m1) if len(m1) > 0 else 100.0
    avg_m3 = np.mean(m3) if len(m3) > 0 else 95.0

    improvement = avg_m1 - avg_m3
    score = 92 if improvement >= 0 else 75

    return {
        "score": score,
        "risk_level": "Low" if score >= 80 else "Medium",
        "summary": "Selamat! Program 90 Hari GluCare berhasil diselesaikan dengan hasil positif.",
        "recommendations": "Pertahankan kebiasaan makan sehat dan olahraga rutin secara konsisten."
    }


# ===============================================================================
# 3. TELEMETRI HARIAN & GLUKOSA (DAILY TRACKING)
# ===============================================================================
@app.post(
    "/predict/daily",
    tags=["3. Telemetri Harian & Glukosa (Daily Tracking)"],
    response_model=DailyPredictionResponse,
    responses={
        200: {"description": "Log harian tersimpan dan evaluasi AI berhasil dikalkulasi"}
    },
    summary="Evaluasi AI Harian 3 Pilar (Tidur, Aktivitas, Nutrisi)",
    description="Menghitung skor dampak metabolik harian dan memberikan feedback fisiologis cerdas serta rekomendasi fokus untuk esok hari."
)
@app.post("/tracking/daily", tags=["3. Telemetri Harian & Glukosa (Daily Tracking)"], include_in_schema=False)
async def predict_daily(payload: DailyPredictionInput):
    body = payload.model_dump()
    sleep = float(body.get("sleep_hours") or 0)
    walk = float(body.get("walking_minutes") or 0)
    nutrition = float(body.get("nutrition_score") or 0)
    target_sleep = float(body.get("sleep_target_hours") or 7.5)
    target_walk = float(body.get("walking_target_minutes") or 30)

    sleep_met = sleep >= (target_sleep - 0.5)
    walk_met = walk >= target_walk
    nutrition_met = nutrition >= 75.0
    goal_achieved = sleep_met and walk_met and nutrition_met

    # Hitung skor dampak metabolik harian (0-100)
    sleep_score = min(sleep / target_sleep, 1.2) * 35
    walk_score = min(walk / target_walk, 1.5) * 35
    nut_score = (nutrition / 100.0) * 30
    metabolic_impact_score = round(min(sleep_score + walk_score + nut_score, 100.0), 1)

    # Feedback berbasis klinis dari AI
    if goal_achieved:
        ai_feedback = (
            f"Luar biasa! Seluruh target 3 pilar hari ini tercapai (Skor Metabolik: {metabolic_impact_score}%). "
            f"Kombinasi jalan kaki {walk:.0f} menit dan tidur {sleep:.1f} jam ini secara langsung mengaktifkan translokasi "
            f"GLUT4 di otot, membantu menstabilkan glukosa puasa esok pagi."
        )
        tomorrow_tip = "Pertahankan ritme ini. Lakukan peregangan ringan 5 menit sebelum tidur untuk mengoptimalkan deep sleep."
    else:
        deficits = []
        if not walk_met: deficits.append(f"aktivitas fisik ({walk:.0f}/{target_walk:.0f} mnt)")
        if not sleep_met: deficits.append(f"jam tidur ({sleep:.1f}/{target_sleep:.1f} jam)")
        if not nutrition_met: deficits.append("skor nutrisi belum optimal")
        
        ai_feedback = (
            f"Pencatatan harian tersimpan (Skor Metabolik: {metabolic_impact_score}%). "
            f"Hari ini terdapat kekurangan pada {', '.join(deficits)}. "
            f"Kurang tidur dan kurang bergerak dapat memicu kenaikan hormon kortisol yang memperberat resistensi insulin."
        )
        tomorrow_tip = f"Fokus utama besok: usahakan capai minimal {target_walk:.0f} menit jalan kaki santai setelah makan siang atau malam."

    return {
        "status": "saved",
        "user_id": body.get("user_id"),
        "day": body.get("day"),
        "goal_achieved": goal_achieved,
        "sleep_met": sleep_met,
        "walking_met": walk_met,
        "nutrition_met": nutrition_met,
        "metabolic_impact_score": metabolic_impact_score,
        "ai_feedback": ai_feedback,
        "tomorrow_tip": tomorrow_tip
    }


@app.post(
    "/predict/glucose",
    tags=["3. Telemetri Harian & Glukosa (Daily Tracking)"],
    response_model=GlucosePredictionResponse,
    responses={
        200: {"description": "Pengukuran gula darah terklasifikasi menurut standar ADA"}
    },
    summary="Triase Klinis Glukosa Darah Harian Standar ADA",
    description="Mengklasifikasikan kadar gula darah puasa mandiri ke dalam zona Normal, Prediabetes Alert, atau High Risk sesuai kriteria American Diabetes Association."
)
@app.post("/tracking/glucose", tags=["3. Telemetri Harian & Glukosa (Daily Tracking)"], include_in_schema=False)
async def predict_glucose(payload: GlucosePredictionInput):
    body = payload.model_dump()
    glucose = float(body.get("glucose_value") or 100.0)

    if glucose < 100.0:
        category = "Normal (Optimal)"
        is_safe = True
        ai_insight = f"Kadar glukosa darah Anda ({glucose:.1f} mg/dL) berada dalam zona normal optimal standar ADA (< 100 mg/dL). Pankreas bekerja efisien."
        recommended_action = "Pertahankan jadwal sarapan seimbang kaya protein dan serat."
    elif glucose <= 125.0:
        category = "Prediabetes Alert (Zona Intervensi)"
        is_safe = False
        ai_insight = (
            f"Kadar glukosa darah Anda ({glucose:.1f} mg/dL) berada di rentang Prediabetes (100 - 125 mg/dL). "
            f"Ini merupakan sinyal dini toleransi glukosa terganggu, namun masih dalam golden window untuk pemulihan."
        )
        recommended_action = "Minum 1-2 gelas air putih, hindari camilan manis, dan lakukan jalan santai 15 menit untuk memicu serapan glukosa otot."
    else:
        category = "High Risk / Hyperglycemia Alert"
        is_safe = False
        ai_insight = (
            f"Kadar glukosa darah ({glucose:.1f} mg/dL) berada di atas ambang batas normal (>= 126 mg/dL). "
            f"Konsistensi pemantauan dan konsultasi dengan tenaga medis sangat disarankan."
        )
        recommended_action = "Catat pola konsumsi makanan 24 jam terakhir dan konsultasikan ke dokter atau fasilitas kesehatan terdekat."

    return {
        "status": "saved",
        "user_id": body.get("user_id"),
        "day": body.get("day"),
        "glucose_value": glucose,
        "category": category,
        "is_safe": is_safe,
        "ai_insight": ai_insight,
        "recommended_action": recommended_action
    }


# ===============================================================================
# 4. PRESKRIPSI PROGRAM INTERVENSI (ENROLLMENT)
# ===============================================================================
@app.post(
    "/program/enroll",
    tags=["4. Preskripsi Program Intervensi (Enrollment)"],
    response_model=EnrollPredictionResponse,
    responses={
        200: {"description": "Preskripsi target program 90 hari berhasil diformulasikan"}
    },
    summary="Preskripsi AI Target Personal Program 90 Hari",
    description="Menghasilkan preskripsi target tidur, target jalan kaki, dan fokus nutrisi yang dipersonalisasi berdasarkan tingkat risiko klinis pengguna."
)
@app.post("/predict/enroll", tags=["4. Preskripsi Program Intervensi (Enrollment)"], include_in_schema=False)
async def predict_enroll(payload: EnrollPredictionInput):
    body = payload.model_dump()
    risk = (body.get("risk_level") or "Prediabetes").capitalize()
    fpg = float(body.get("glucose_fasting") or 105.0)
    bmi = float(body.get("bmi") or 25.0)

    if risk == "Diabetes" or fpg >= 126.0:
        sleep_target = 8.0
        walking_target = 45
        nutrition_goal = "Diet Rendah Karbohidrat & Rendah Beban Glikemik (Fokus Kontrol Gula)"
        program_type = "Glycemic Control & Stabilization"
        summary = "AI merekomendasikan target intensif 45 menit jalan dan tidur 8 jam untuk meredakan resistensi insulin."
    elif risk == "Prediabetes" or fpg >= 100.0 or bmi >= 25.0:
        sleep_target = 8.0
        walking_target = 40
        nutrition_goal = "Defisit Kalori Ringan, Serat >= 30g/hari, Hindari Minuman Manis (Reversal Prediabetes)"
        program_type = "Prediabetes Reversal 90-Day Plan"
        summary = "AI merekomendasikan program pemulihan prediabetes: target jalan 40 menit dan tidur 8 jam selama 90 hari."
    else:
        sleep_target = 7.5
        walking_target = 30
        nutrition_goal = "Pola Piring Sehat Seimbang (50% sayur, 25% protein, 25% karbohidrat kompleks)"
        program_type = "Metabolic Maintenance & Prevention"
        summary = "AI merekomendasikan program pencegahan: pertahankan 30 menit aktivitas harian dan tidur 7.5 jam."

    return {
        "user_id": body.get("user_id"),
        "program_status": "enrolled",
        "duration_days": 90,
        "program_type": program_type,
        "daily_targets": {
            "sleep_target_hours": sleep_target,
            "walking_target_minutes": walking_target,
            "nutrition_goal": nutrition_goal
        },
        "streak_counter": 0,
        "recommendation_summary": summary
    }


# ===============================================================================
# ALIASES FOR BACKWARD COMPATIBILITY
# ===============================================================================
@app.post("/assessment/day30", tags=["2. Monitoring Intervensi 90 Hari (Milestone)"], include_in_schema=False)
async def alias_assessment_day30(payload: Day30PredictionInput):
    return await predict_day30(payload)


@app.post("/assessment/day90", tags=["2. Monitoring Intervensi 90 Hari (Milestone)"], include_in_schema=False)
async def alias_assessment_day90(payload: Day90PredictionInput):
    return await predict_day90(payload)


def start_server():
    print("[INFO] Menjalankan GluCare AI Microservice di http://localhost:8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


if __name__ == "__main__":
    start_server()
