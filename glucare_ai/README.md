# 🩺 GluCare AI Engine & Machine Learning Microservice
### Sistem Deteksi Dini Prediabetes & Intervensi Gaya Hidup 90 Hari

GluCare AI adalah modul *Machine Learning* dan *Microservice API* berbasis Python yang memberdayakan aplikasi **GluCare**. Modul ini dilatih menggunakan dataset representatif berskala nasional dari **NHANES 2021–2023 (CDC / NCHS)** untuk memberikan deteksi risiko prediabetes secara presisi pada kelompok usia dewasa muda (20–40 tahun).

---

## 🏗️ 3 Pilar Modul AI GluCare

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            EKOSISTEM GLUCARE AI                             │
├──────────────────────────┬──────────────────────────┬───────────────────────┤
│ 1. Mode Klinikal / Lab   │ 2. Mode Kuesioner        │ 3. Monitoring Day 30  │
├──────────────────────────┼──────────────────────────┼───────────────────────┤
│ • Input: 12 Biomarker Lab│ • Input: 10 Soal Kebiasan│ • Input: 30 Hari Log  │
│   (GDP, HbA1c, HDL, TG,  │   (BMI, duduk, diet,     │   (Glukosa, langkah,  │
│   MAP, tensi, pinggang)  │   olahraga WHO, merokok) │   tidur, kepatuhan)   │
│ • Algoritma: XGBoost / RF│ • Algoritma: Calibrated  │ • Algoritma: XGBoost  │
│ • ROC-AUC: 0.969 (96.9%) │   Logistic Regression    │ • ROC-AUC: 0.896      │
│ • Status: Invasif Presisi│ • ROC-AUC: 0.686 (68.6%) │ • Status: Evaluasi    │
│                          │ • Status: Non-Invasif    │   Milestone 90 Hari   │
└──────────────────────────┴──────────────────────────┴───────────────────────┘
```

---

## 📁 Struktur Direktori Repositori

```text
main-feature/glucare_ai/
│
├── README.md                         📖 Dokumen Utama Navigasi Proyek AI
├── ai_server.py                      ⚡ Microservice FastAPI (Port 8000)
├── start_ai_service.bat              🚀 Script Batch Menjalankan AI Microservice
├── requirements.txt                  📦 Daftar Dependensi Pustaka Python
│
├── docs/                             📚 DOKUMENTASI LENGKAP & LAPORAN SPRINT
│   ├── DOKUMENTASI_AI_KUESIONER.md   • Panduan komprehensif Model Kuesioner ML
│   ├── DOKUMENTASI_API_TESTING.md    • Panduan pengujian endpoint API HTTP
│   ├── DOKUMEN_SPRINT_GLUCARE_AI.md  • Laporan formal Sprint 1 & 2 (Klinis)
│   └── Dokumen_Sprint_GluCare_AI.docx• Dokumen Word laporan resmi capstone
│
├── tests/                            🧪 SUITE PENGUJIAN OTOMATIS
│   ├── run_all_tests.py              • Runner terpadu (menjalankan seluruh tes)
│   ├── test_api_endpoint.py          • Uji kontrak API live HTTP backend (6 Test Cases)
│   ├── test_kebenaran_ai.py          • Audit skor kebenaran klinis 131 pasien uji
│   ├── test_monitoring_prediction.py • Uji simulasi model monitoring Hari ke-30
│   └── test_prediction.py            • Uji terminal diagnostik model klinis
│
├── notebooks/                        📓 JUPYTER NOTEBOOK EKSPERIMEN ILMIAH
│   ├── 01_data_cleaning_and_preprocessing.ipynb
│   ├── 02_exploratory_data_analysis.ipynb
│   ├── 03_model_training_and_evaluation.ipynb
│   ├── 04_clinical_modeling_10_steps.ipynb
│   └── 05_questionnaire_lifestyle_modeling.ipynb
│
├── models/                           🤖 ARTEFAK MODEL TERLATIH (.joblib & .pkl)
│   ├── glucare_prediabetes_model.joblib        (Model Klinis Utama)
│   ├── glucare_questionnaire_model.joblib      (Model Kuesioner Utama)
│   ├── questionnaire_model.pkl                 (Salinan PKL Kuesioner)
│   ├── monitoring_day30_model.pkl              (Model Monitoring Day 30)
│   ├── clinical_model.pkl & clinical_scaler.pkl(Artefak Klinis Standar)
│   ├── model_evaluation_metrics.json           (Metrik Evaluasi Klinis)
│   └── questionnaire_model_metrics.json        (Metrik Evaluasi Kuesioner)
│
├── data/                             📊 DATASET NHANES CDC 2021–2023
│   ├── raw/nhanes_2021_2023/         (File XPT asli dari CDC)
│   └── processed/                    (CSV hasil filter usia 20-40 & clean)
│
└── src/                              ⚙️ PIPELINE SOURCE CODE
    ├── data_preprocessing.py         • Preprocessing data klinis
    ├── eda_analysis.py               • Kalkulasi statistik korelasi & Mann-Whitney U
    ├── model_training.py             • Script training model klinikal
    ├── monitoring_inference.py       • Engine inferensi monitoring 90 hari
    ├── questionnaire_preprocessing.py• Preprocessing data kuesioner NHANES
    └── questionnaire_training.py     • Script training model kuesioner ML
```

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### 1. Instalasi Dependensi
Pastikan Python 3.10+ telah terpasang, lalu jalankan:
```bash
pip install -r requirements.txt
```

### 2. Menjalankan Microservice AI (FastAPI Port 8000)
Gunakan launcher Windows:
```cmd
start_ai_service.bat
```
Atau jalankan langsung via Python:
```bash
python ai_server.py
```
* **Swagger UI API Docs**: `http://localhost:8000/docs`
* **ReDoc Interactive Docs**: `http://localhost:8000/redoc`
* **OpenAPI JSON Specification**: `http://localhost:8000/openapi.json`
* **Unduh Spesifikasi Mandiri**: `http://localhost:8000/docs/export-spec`
* **Panduan Lengkap Swagger AI**: [SWAGGER_AI_GUIDE.md](docs/SWAGGER_AI_GUIDE.md)
* **Health Check**: `http://localhost:8000/ping`

### 3. Menjalankan Suite Pengujian Otomatis
Untuk memverifikasi seluruh modul AI berfungsi normal, jalankan runner pengujian:
```bash
python tests/run_all_tests.py
```

Atau uji endpoint API secara spesifik:
```bash
python tests/test_api_endpoint.py
```

---

## 📋 Indeks Endpoint API AI Microservice (`ai_server.py`)

| Method | Endpoint | Tag / Kategori | Deskripsi | Input Utama |
| :---: | :--- | :--- | :--- | :--- |
| `GET` | `/ping` & `/` | Diagnostic & Health | Health Check Service & Status Model | — |
| `GET` | `/docs/export-spec` | Diagnostic & Health | Ekspor Skema OpenAPI 3.0 / Swagger JSON | — |
| `POST`| `/predict/clinical` | Skrining Risiko | Skrining Risiko Prediabetes Klinis / Lab | GDP, Tensi, HDL, TG, Lingkar Pinggang, BMI |
| `POST`| `/predict/questionnaire` | Skrining Risiko | Skrining Kuesioner Gaya Hidup Non-Invasif | 12 Parameter Gaya Hidup (NHANES CDC) |
| `POST`| `/predict/day30` | Monitoring 90 Hari | Evaluasi Trajektori Metabolisme Hari ke-30 | Rata-rata glukosa M1, langkah, kepatuhan |
| `POST`| `/predict/day90` | Monitoring 90 Hari | Evaluasi Akhir Rapor Program 90 Hari | Glukosa Bulan ke-1 vs Bulan ke-3 |
| `POST`| `/predict/daily` | Telemetri Harian | Evaluasi AI Kepatuhan Harian 3 Pilar | Jam tidur, menit jalan kaki, skor nutrisi |
| `POST`| `/predict/glucose` | Telemetri Harian | Triase Klinis Glukosa Darah Harian ADA | Kadar glukosa darah harian (mg/dL) |
| `POST`| `/program/enroll` | Preskripsi Program | Rekomendasi AI Target Personal 90 Hari | Kategori risiko metabolik & target harian |

