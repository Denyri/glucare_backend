# DOKUMEN LAPORAN SPRINT: PENGEMBANGAN MODUL AI GLUCARE
## Clinical Data Preparation, Exploratory Data Analysis, & Machine Learning Modeling Pipeline

---

### Informasi Dokumen & Proyek
* **Nama Proyek**: Aplikasi GluCare (Sistem Deteksi Dini & Intervensi Risiko Prediabetes)
* **Modul**: GluCare Clinical AI (`glucare_ai`)
* **Sumber Data**: National Health and Nutrition Examination Survey (NHANES) Siklus 2021–2023 (CDC / NCHS)
* **Populasi Target Utama**: Dewasa Muda Usia 20–40 Tahun (Pencegahan Dini Prediabetes)
* **Tanggal Pembaruan**: 4 September 2026
* **Status Pelaksanaan**: **Sprint 1 (Data Preparation) & Sprint 2 (Modeling) Selesai — Model Siap Terintegrasi API**

---

## DAFTAR ISI
1. [Latar Belakang & Tujuan Proyek](#1-latar-belakang--tujuan-proyek)
2. [Alur End-to-End Workflow AI GluCare](#2-alur-end-to-end-workflow-ai-glucare)
3. [Sprint 1: Data Preparation (Step 1 s/d Step 7)](#3-sprint-1-data-preparation-step-1-sd-step-7)
4. [Sprint 2: Machine Learning Modeling (Step 8 s/d Step 13)](#4-sprint-2-machine-learning-modeling-step-8-sd-step-13)
   - [Step 8 — Exploratory Data Analysis (EDA) & Clinical Feature Analysis](#step-8--exploratory-data-analysis-eda--clinical-feature-analysis)
   - [Step 9 — Stratified Train/Test Split (80:20)](#step-9--stratified-traintest-split-8020)
   - [Step 10 — Model Training & Baseline Benchmarking](#step-10--model-training--baseline-benchmarking)
   - [Step 11 — Stratified 5-Fold Cross-Validation & Test Evaluation](#step-11--stratified-5-fold-cross-validation--test-evaluation)
   - [Step 12 — Feature Importance & Explainability](#step-12--feature-importance--explainability)
   - [Step 13 — Model Serialization & Backend Integration](#step-13--model-serialization--backend-integration)
5. [Hasil Uji & Metrik Performa Model Final](#5-hasil-uji--metrik-performa-model-final)
6. [Panduan Integrasi Backend GluCare (`/predict/clinical`)](#6-panduan-integrasi-backend-glucare-predictclinical)

---

## 1. Latar Belakang & Tujuan Proyek

Aplikasi **GluCare** dirancang sebagai solusi terpadu untuk pencegahan dan manajemen dini gangguan metabolik, khususnya prediabetes dan diabetes melitus tipe 2 pada usia dewasa muda (20–40 tahun). 

Salah satu pilar utama GluCare adalah **Clinical Assessment**, di mana pengguna memasukkan parameter fisik dan hasil laboratorium sederhana untuk mendapatkan estimasi tingkat risiko metabolik secara presisi. Agar model AI memiliki validitas ilmiah dan generalisasi klinis yang tinggi, modul ini dilatih menggunakan dataset representatif berskala nasional dari **NHANES 2021–2023**.

Sprint 1 (Data Preparation: Step 1–7) menghasilkan 653 sampel kandidat training yang bersih. Sprint 2 (Modeling: Step 8–13) mengimplementasikan analisis EDA mendalam, pelatihan model komparatif, evaluasi terstratifikasi, analisis kepentingan fitur klinis, hingga serialisasi model siap integrasi.

---

## 2. Alur End-to-End Workflow AI GluCare

```text
                  NHANES 2021–2023
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│ SPRINT 1: DATA PREPARATION                      │
├─────────────────────────────────────────────────┤
│ • Step 1: Project Setup & Arsitektur Repositori │
│ • Step 2: Data Acquisition (8 Modul NHANES)     │
│ • Step 3: Data Ingestion & Merging on SEQN      │
│ • Step 4: Clinical Feature Engineering          │
│ • Step 5: Data Cleaning & QA (Filter Usia 20–40)│
│ • Step 6: Clinical Ground Truth / Labeling      │
│           (Normal: 408 | Prediabetes: 245)      │
│           (Diabetes: 21 → EXCLUDE Opsi A)       │
│ • Step 7: Pipeline Automation & Documentation   │
└────────────────────────┬────────────────────────┘
                         ▼
                    653 samples
                         │
                         ▼
┌─────────────────────────────────────────────────┐
│ SPRINT 2: MACHINE LEARNING MODELING             │
├─────────────────────────────────────────────────┤
│ • Step 8:  EDA & Feature Distribution Analysis  │
│ • Step 9:  Train/Test Split (Stratified 80:20)  │
│ • Step 10: Model Training (Logistic, RF, GB)    │
│ • Step 11: 5-Fold Cross-Validation & Test Eval  │
│ • Step 12: Feature Importance & Explainability  │
│ • Step 13: Model Export & API Integration Ready │
└─────────────────────────────────────────────────┘
```

---

## 3. Sprint 1: Data Preparation (Step 1 s/d Step 7)

Tahapan data preparation telah diselesaikan dan menghasilkan dataset `nhanes_glucare_target_20_40.csv` (653 sampel) dengan rincian:
* **Step 1 — Setup**: Folder modular `data/raw`, `data/processed`, `notebooks`, `src`, `models`.
* **Step 2 — Akuisisi Data**: 8 modul NHANES (DEMO, BMX, BPXO, GLU, HDL, TRIGLY, GHB, FASTQX).
* **Step 3 — Merge**: Inner join pada `SEQN` (3.996 sampel puasa pagi).
* **Step 4 — Feature Engineering**: Penurunan MAP, rasio TG/HDL, dan rata-rata tekanan darah.
* **Step 5 — Cleaning**: Validasi puasa (8–24 jam), eksklusi kehamilan, segmentasi usia 20–40 tahun (0 missing values).
* **Step 6 — Ground Truth**: Standar ADA (408 Bukan Prediabetes [Label 0], 245 Prediabetes [Label 1], 21 Diabetes dieksklusi sesuai Opsi A).
* **Step 7 — Otomasi**: Script `src/data_preprocessing.py`, notebook `01_data_cleaning_and_preprocessing.ipynb`, dan `data_dictionary.md`.

---

## 4. Sprint 2: Machine Learning Modeling (Step 8 s/d Step 13)

### Step 8 — Exploratory Data Analysis (EDA) & Clinical Feature Analysis
* **Tujuan**: Memeriksa apakah fitur-fitur klinis GluCare memang memiliki pola pemisahan statistik yang signifikan antara kelompok Bukan Prediabetes (`0`) vs Prediabetes (`1`).
* **Hasil Uji Statistik (Mann-Whitney U Test & Cohen's d)**:

| Fitur Klinis | Rata-rata Bukan Prediabetes (0) | Rata-rata Prediabetes (1) | Selisih Mean | Cohen's d (Effect Size) | Signifikansi Statistik |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `glucose_fasting` (mg/dL) | **91.92** | **103.60** | +11.68 | **1.977** | $p < 0.001$ (Sangat Signifikan) |
| `waist_cm` (cm) | **92.29** | **101.14** | +8.84 | **0.515** | $p < 0.001$ (Sangat Signifikan) |
| `weight` (kg) | **78.52** | **89.60** | +11.08 | **0.500** | $p < 0.001$ (Sangat Signifikan) |
| `bmi` ($kg/m^2$) | **27.62** | **31.17** | +3.55 | **0.477** | $p < 0.001$ (Sangat Signifikan) |
| `hdl` (mg/dL) | **54.62** | **48.99** | -5.63 | **-0.465** | $p < 0.001$ (Lebih rendah pada prediabetes) |
| `map_pressure` (mmHg) | **84.48** | **88.82** | +4.34 | **0.458** | $p < 0.001$ (Sangat Signifikan) |
| `bp_diastolic` (mmHg) | **71.31** | **75.45** | +4.14 | **0.440** | $p < 0.001$ (Sangat Signifikan) |
| `bp_systolic` (mmHg) | **110.82** | **115.56** | +4.75 | **0.403** | $p < 0.001$ (Sangat Signifikan) |
| `tg_hdl_ratio` (rasio) | **1.90** | **2.63** | +0.72 | **0.352** | $p < 0.001$ (Sangat Signifikan) |
| `triglycerides` (mg/dL) | **92.45** | **113.67** | +21.22 | **0.328** | $p < 0.001$ (Sangat Signifikan) |
| `age` (tahun) | **30.52** | **32.29** | +1.78 | **0.304** | $p < 0.001$ (Sangat Signifikan) |
| `height` (cm) | **168.44** | **169.73** | +1.29 | **0.133** | $p \ge 0.05$ (*Not Significant*) |

* **Kesimpulan EDA**: Seluruh fitur antropometri, glikemik, lipid, dan tekanan darah yang digunakan pada payload GluCare terbukti secara empiris memiliki perbedaan yang sangat signifikan ($p < 0.001$) antara individu normal dan prediabetes. Tinggi badan (`height`) secara terpisah tidak signifikan ($p \ge 0.05$), yang sesuai secara medis karena tinggi badan bukan faktor etiologi metabolik.

---

### Step 9 — Stratified Train/Test Split (80:20)
* **Tujuan**: Membagi dataset secara terstratifikasi agar proporsi kelas (62.5% : 37.5%) tetap identik di set latih dan uji.
* **Hasil Partisi Data**:
  - **Training Set (80%)**: **522 sampel** (326 Bukan Prediabetes, 196 Prediabetes).
  - **Testing Set (20% Held-out)**: **131 sampel** (82 Bukan Prediabetes, 49 Prediabetes) — tidak pernah dilihat model saat pelatihan.

---

### Step 10 & 11 — Model Training & Cross-Validation Benchmarking
* **Tujuan**: Melatih model komparatif dan mengukur performa generalisasi menggunakan **Stratified 5-Fold Cross-Validation** pada Training Set:

| Algoritma Model | CV Accuracy | CV Recall (Sensitivitas) | CV Precision | CV F1-Score | CV ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** (Baseline) | 88.90% | **89.27%** | 82.77% | 85.81% | 0.9420 |
| **Random Forest** (Selected) | **94.06%** | 86.19% | **97.75%** | **91.50%** | **0.9521** |
| **Gradient Boosting** | **94.06%** | 86.19% | **97.78%** | **91.51%** | 0.9467 |

---

### Evaluasi Performa pada Held-out Test Set (131 Sampel)

Uji independen pada data uji murni yang belum pernah dilihat model:

| Model | Test Accuracy | Test Recall (Sensitivitas) | Test Precision | Test F1-Score | Test ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 87.02% | **85.71%** | 80.77% | 83.17% | 0.9219 |
| **Random Forest (Final Model)** | **92.37%** | 81.63% | **97.56%** | **88.89%** | **0.9567** |
| **Gradient Boosting** | **92.37%** | 81.63% | **97.56%** | **88.89%** | 0.9564 |

* **Confusion Matrix Random Forest pada Test Set**:
  - True Negative (Sehat terdeteksi Sehat): **81 sampel**
  - False Positive (Sehat keliru didiagnosis Prediabetes): **1 sampel** (Presisi sangat tinggi: 97.6%)
  - False Negative (Prediabetes terlewat): **9 sampel**
  - True Positive (Prediabetes terdeteksi akurat): **40 sampel**

---

### Step 12 — Feature Importance & Explainability
Peringkat kontribusi variabel klinis pada model Random Forest final:

```text
1. glucose_fasting  : 0.6496 (65.0% - Sinyal Utama Metabolisme Glukosa)
2. waist_cm         : 0.0511 ( 5.1% - Adipositas Sentral / Visceral Fat)
3. weight           : 0.0472 ( 4.7% - Beban Massa Tubuh)
4. hdl              : 0.0436 ( 4.4% - Dislipidemia Aterogenik)
5. tg_hdl_ratio     : 0.0361 ( 3.6% - Biomarker Resistensi Insulin)
6. map_pressure     : 0.0345 ( 3.5% - Tekanan Vaskular)
7. bp_diastolic     : 0.0290 ( 2.9%)
8. bmi              : 0.0282 ( 2.8%)
9. bp_systolic      : 0.0277 ( 2.8%)
10. age             : 0.0251 ( 2.5%)
11. triglycerides   : 0.0227 ( 2.3%)
12. gender          : 0.0051 ( 0.5%)
```

---

### Step 13 — Model Serialization & Backend Integration
Model akhir telah diekspor dan siap diintegrasikan:
* **File Pipeline Model**: `main-feature/glucare_ai/models/glucare_prediabetes_model.joblib` (402 KB)
* **File Metrik Evaluasi**: `main-feature/glucare_ai/models/model_evaluation_metrics.json`
* **Inference Pipeline**: Terdiri dari `StandardScaler` + `RandomForestClassifier` terkalibrasi yang langsung menerima data mentah pengguna tanpa perlu penskalaan manual di backend.

---

## 5. Ringkasan File & Artefak yang Dihasilkan

| Kategori | File Path | Deskripsi |
| :--- | :--- | :--- |
| **Dataset Bersih** | `data/processed/nhanes_glucare_target_20_40.csv` | 653 sampel klinis usia 20–40 tahun (0 missing values) |
| **Pipeline Preprocessing** | `src/data_preprocessing.py` | Modul otomatis data cleaning & ground truth ADA |
| **Modul Analisis EDA** | `src/eda_analysis.py` | Modul kalkulasi statistik, Mann-Whitney U & Cohen's d |
| **Modul Modeling Latih** | `src/model_training.py` | Modul training komparatif 4 model, CV, & ekspor |
| **Modul Inferensi Monitoring**| `src/monitoring_inference.py` | Engine inferensi lokal untuk evaluasi Milestone Hari ke-30 |
| **Notebook 10 Langkah** | `notebooks/04_clinical_modeling_10_steps.ipynb`| Notebook interaktif 10 langkah modeling terkalibrasi |
| **Artefak Model Klinis** | `models/glucare_clinical_calibrated_pipeline.joblib` | Model XGBoost Calibrated Pipeline (ROC-AUC: 0.9662) |
| **Artefak Model Monitoring** | `models/monitoring_day30_model.pkl` | Model evaluasi Day 30 trajectory prediction (LOPO-CV: 0.896) |
| **Visualisasi Matriks** | `models/confusion_matrix_comparison.png` | Plot 2x2 Heatmap Confusion Matrix 4 Model |
| **Metadata Manifest** | `models/model_metadata_10_steps.json` | Rekap metrik komparasi & spesifikasi fitur |
| **Skrip Uji Klinis** | `test_prediction.py` | Uji simulasi interaktif untuk Model Skrining Lab |
| **Skrip Uji Monitoring** | `test_monitoring_prediction.py` | Uji simulasi interaktif untuk Model Monitoring 90 Hari |

---

## 6. Panduan Pengujian Interaktif via Terminal (Interactive Testing Scripts)

Di dalam repositori ini telah disediakan dua script pengujian mandiri tanpa perlu membuka antarmuka web:

### A. Pengujian Skrining Klinis Lab (`test_prediction.py`)
Script ini memuat model klinis terkalibrasi dan menguji skenario pasien dengan parameter lab:
```powershell
python main-feature/glucare_ai/test_prediction.py
```
* **Fitur Utama**:
  1. Menjalankan skenario diagnostik otomatis (Pasien Sehat, Borderline, Prediabetes Berat).
  2. Menyediakan mode interaktif di terminal di mana pengguna bisa memasukkan nilai GDP, tensi, dan profil lipid sendiri.
  3. Menghitung otomatis MAP dan rasio TG/HDL jika tidak disediakan.

### B. Pengujian Monitoring 90 Hari (`test_monitoring_prediction.py`)
Script ini memuat model monitoring Day 30 untuk memproyeksikan kondisi pasien di hari ke-90:
```powershell
python main-feature/glucare_ai/test_monitoring_prediction.py
```
* **Hasil Pengujian**:
  * **Skenario Pasien Disiplin**: Status Trajektori **MEMBAIK** (Peluang: 96.3%).
  * **Skenario Pasien Berisiko**: Status Trajektori **MEMBURUK / STAGNAN** (Peluang: 83.0%) ➔ Memicu saran intervensi dini pola tidur dan pembatasan karbohidrat.

---

## 7. Panduan Integrasi Backend GluCare

### Endpoint 1: Skrining Lab (`/predict/clinical`)
```python
import joblib
import pandas as pd

# 1. Load pipeline model terkalibrasi
model_artifact = joblib.load("main-feature/glucare_ai/models/glucare_clinical_calibrated_pipeline.joblib")
pipeline = model_artifact["pipeline"]

# 2. Format input payload dari permintaan pengguna (sesuai labController.js)
user_payload = pd.DataFrame([{
    "age": 32, "gender": 1, "weight": 85.0, "bmi": 28.5, "waist_cm": 96.0,
    "bp_systolic": 125.0, "bp_diastolic": 82.0, "map_pressure": 96.33,
    "glucose_fasting": 108.0, "hdl": 44.0, "triglycerides": 155.0, "tg_hdl_ratio": 3.52
}])

# 3. Prediksi risiko dan estimasi probabilitas terkalibrasi
pred_label = pipeline.predict(user_payload)[0]          # 0 = Bukan Prediabetes, 1 = Prediabetes
probabilities = pipeline.predict_proba(user_payload)[0]  # [prob_normal, prob_prediabetes]

print({
    "prediction": int(pred_label),
    "status": "Prediabetes" if pred_label == 1 else "Normal",
    "risk_score": round(float(probabilities[1] * 100), 1),
    "probability_normal": round(float(probabilities[0]), 4),
    "probability_prediabetes": round(float(probabilities[1]), 4)
})
```

### Endpoint 2: Monitoring 90 Hari (`/assessment/day30`)
```python
from src.monitoring_inference import predict_day30_assessment

# Dipanggil otomatis oleh planController.js saat pasien mencapai hari ke-30
result = predict_day30_assessment(patient_30d_telemetry)
# Output: {"trajectory_status": "Membaik", "improving_score_percent": 96.3, "recommendation": ...}
```
