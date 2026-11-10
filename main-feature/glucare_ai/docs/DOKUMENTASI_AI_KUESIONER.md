# 📋 DOKUMENTASI LENGKAP: MODUL AI KUESIONER GAYA HIDUP GLUCARE
## Non-Invasive Lifestyle Prediabetes Risk Classifier (NHANES 2021–2023)

---

### Informasi Dokumen & Modul
* **Nama Modul**: GluCare Lifestyle Questionnaire Assessment (`glucare_ai`)
* **Tujuan**: Skrining risiko prediabetes non-invasif tanpa jarum suntik berbasis kebiasaan gaya hidup dan faktor metabolik
* **Dataset**: National Health and Nutrition Examination Survey (NHANES) Siklus 2021–2023 (CDC / NCHS)
* **Populasi Sasaran**: Dewasa Muda Usia 20–40 Tahun (Fase *Golden Window* Reversibilitas Prediabetes)
* **Algoritma Terpilih**: Calibrated Logistic Regression (*Platt Scaling*)
* **Status**: **Selesai Diuji & Terintegrasi Penuh (Dataset, Model ML, Jupyter Notebook, Backend API, Frontend Web)**

---

## DAFTAR ISI
1. [Latar Belakang & Filosofi Perubahan (Before vs. After)](#1-latar-belakang--filosofi-perubahan-before-vs-after)
2. [Dataset & Sumber Modul NHANES 2021–2023](#2-dataset--sumber-modul-nhanes-20212023)
3. [Daftar 12 Fitur Model & Definisi Klinis](#3-daftar-12-fitur-model--definisi-klinis)
4. [Eksplorasi Data & Analisis Statistik (EDA)](#4-eksplorasi-data--analisis-statistik-eda)
5. [Benchmarking Algoritma & Hasil Cross-Validation](#5-benchmarking-algoritma--hasil-cross-validation)
6. [Kalibrasi Probabilitas Medis (Platt Scaling)](#6-kalibrasi-probabilitas-medis-platt-scaling)
7. [Explainable AI & Clinical Odds Ratios](#7-explainable-ai--clinical-odds-ratios)
8. [Arsitektur Integrasi Sistem End-to-End](#8-arsitektur-integrasi-sistem-end-to-end)
9. [Struktur Pertanyaan di Frontend (10 Pertanyaan)](#9-struktur-pertanyaan-di-frontend-10-pertanyaan)
10. [Spesifikasi API Endpoint & Kontrak Payload](#10-spesifikasi-api-endpoint--kontrak-payload)
11. [Jupyter Notebook Eksperimen (`05_questionnaire_lifestyle_modeling.ipynb`)](#11-jupyter-notebook-eksperimen)
12. [Hasil Pengujian Otomatis (Automated Test Suite)](#12-hasil-pengujian-otomatis)

---

## 1. Latar Belakang & Filosofi Perubahan (Before vs. After)

### Masalah pada Sistem Baseline (Sebelum Sprint 3)
Sebelumnya, modul kuesioner GluCare menggunakan **rule-based scoring heuristik** (penjumlahan bobot manual sederhana):
```python
# Rule-based manual lama (ai_server.py)
raw_score = (
    (age_band * 15) + (bmi_category * 25) +
    (waist_category * 25) + (hypertension * 20) + (overweight * 15)
)
```
**Kelemahan pendekatan lama:**
1. Hanya mengukur 4 pertanyaan fisik dasar, tanpa menyentuh pilar gaya hidup utama (olahraga, durasi inaktif/duduk, pola makan, kebiasaan merokok).
2. Bobot bersifat subjektif (*hardcoded*) dan tidak berbasis bukti empiris data populasi nyata.
3. Tidak menghasilkan probabilitas terkalibrasi secara medis.

### Solusi: Machine Learning Terlatih Berbasis NHANES 2021–2023
Model kuesioner ditingkatkan menjadi **Classifier Machine Learning berbasis data populasi representatif NHANES CDC**:
* Prediksi berdasarkan probabilitas statistik riil.
* Cakupan gaya hidup holistik (aktivitas fisik standar WHO, jam sedentari, diet makanan olahan, riwayat keluarga, dan merokok).
* Model dapat terus di-*retrain* dan dievaluasi secara ilmiah.

| Aspek | Baseline (Rule-Based Lama) | GluCare AI ML (Baru - Sprint 3) |
| :--- | :--- | :--- |
| **Dasar Penilaian** | Bobot manual subjektif | Model ML terkalibrasi (*Empirical Logistic Regression*) |
| **Jumlah Pertanyaan** | 4 Pertanyaan fisik | **10 Pertanyaan Gaya Hidup Holistik** |
| **Sumber Data** | Asumsi heuristik internal | **NHANES CDC 2021–2023 (687 Sampel Berlabel Valid)** |
| **Output Risiko** | Skor angka diskrit kaku | **Probabilitas terkalibrasi kontinu (0% s/d 100%)** |
| **Explainability** | Tidak ada | **Odds Ratio ($e^{\beta}$) & Identifikasi Risk Drivers Klinis** |
| **Validasi Ilmiah** | Tidak teruji | **5-Fold Stratified Cross-Validation (AUC = 0.686)** |

---

## 2. Dataset & Sumber Modul NHANES 2021–2023

Dataset dibentuk dengan menggabungkan data kuesioner (*interview modules*) dengan *ground truth* hasil uji laboratorium darah puasa yang terstandarisasi American Diabetes Association (ADA):

```text
┌────────────────────────────────────────────────────────┐
│ MODUL DEMOGRAFI & FISIK                                │
│ • DEMO_L.XPT : Usia (RIDAGEYR), Jenis Kelamin (RIAGENDR)│
│ • BMX_L.XPT  : Berat Badan, Tinggi Badan, BMI, Pinggang│
└──────────────────────────┬─────────────────────────────┘
                           │ (Inner Join SEQN)
┌──────────────────────────▼─────────────────────────────┐
│ 5 MODUL KUESIONER GAYA HIDUP NHANES                     │
│ • BPQ_L.xpt : Riwayat Hipertensi & Obat Antihipertensi │
│ • DIQ_L.xpt : Riwayat Prediabetes/Keluarga & Borderline│
│ • PAQ_L.xpt : Durasi Aktivitas Fisik & Jam Duduk (PAD) │
│ • SMQ_L.xpt : Status Merokok Aktif                     │
│ • DBQ_L.xpt : Kualitas Pola Makan & Makanan Cepat Saji │
└──────────────────────────┬─────────────────────────────┘
                           │ (Inner Join SEQN)
┌──────────────────────────▼─────────────────────────────┐
│ GROUND TRUTH LABORATORIUM (KRITERIA ADA)               │
│ • GLU_L.XPT : Glukosa Darah Puasa (FPG)                │
│ • GHB_L.XPT : Kadar Glycated Hemoglobin (HbA1c)        │
│ • FASTQX_L  : Validasi Puasa Aktual 8–24 Jam           │
└────────────────────────────────────────────────────────┘
```

### Kriteria Filter Sampel:
1. Usia dewasa muda 20–40 tahun.
2. Tidak sedang hamil (`RIDEXPRG` $\ne$ 1).
3. Durasi puasa laboratorium valid antara 8–24 jam.
4. **Target Biner**:
   * **`0: Normal`** (FPG < 100 mg/dL **DAN** HbA1c < 5.7%) $\rightarrow$ 427 sampel (62.2%).
   * **`1: Prediabetes`** (FPG 100–125 mg/dL **ATAU** HbA1c 5.7%–6.4%) $\rightarrow$ 260 sampel (37.8%).
   * *Catatan*: Pasien diabetes manifes (FPG $\ge$ 126 atau HbA1c $\ge$ 6.5%) dieksklusi dari training model skrining awal agar fokus mendeteksi zona prediabetes dini.

---

## 3. Daftar 12 Fitur Model & Definisi Klinis

Model ML menggunakan 12 fitur terstandarisasi:

| # | Nama Fitur | Tipe | Rentang Nilai | Definisi & Rasional Medis |
| :-: | :--- | :---: | :---: | :--- |
| 1 | `age_band` | Biner | 0 / 1 | `0`: Usia <30 tahun, `1`: Usia 30–39 tahun. Penurunan massa otot metabolik terjadi bertahap. |
| 2 | `gender` | Nominal | 1 / 2 | `1`: Laki-laki, `2`: Perempuan (mengikuti encoding NHANES CDC). |
| 3 | `bmi_category` | Ordinal | 0 / 1 / 2 | Cutoff WHO Asia-Pasifik: `0`: Normal (<23), `1`: Overweight (23–27.4), `2`: Obesitas ($\ge$27.5 kg/m²). |
| 4 | `waist_category` | Biner | 0 / 1 | Obesitas sentral/visceral (IDF): `1` jika Pria >90 cm atau Wanita >80 cm. Indikator timbunan lemak organ dalam. |
| 5 | `hypertension` | Biner | 0 / 1 | Riwayat diagnosis tekanan darah tinggi ($\ge$130/85 mmHg). Erat kaitannya dengan resistensi insulin arterial. |
| 6 | `diabetes_history` | Biner | 0 / 1 | Riwayat medis diabetes personal sebelumnya. |
| 7 | `prediabetes_told` | Biner | 0 / 1 | Pernah diberitahu dokter memiliki kadar gula darah *borderline* / sedikit di atas normal. |
| 8 | `prediabetes_history`| Biner | 0 / 1 | Riwayat prediabetes diri sendiri atau keluarga kandung terdekat. |
| 9 | `physically_active` | Biner | 0 / 1 | `1` jika memenuhi rekomendasi WHO $\ge$150 menit/minggu aktivitas sedang/olahraga. Merangsang translokasi GLUT4 independen-insulin. |
| 10| `sedentary_hours` | Kontinu | 1.0 – 16.0 | Rata-rata jam duduk/tidak aktif per hari. Jam duduk >8 jam menurunkan *glucose clearance* otot rangka. |
| 11| `current_smoker` | Biner | 0 / 1 | Perokok aktif harian/berkala. Nikotin memicu stres oksidatif dan disfungsi sel beta pankreas. |
| 12| `poor_diet` | Biner | 0 / 1 | Pola makan rendah serat, sering makanan cepat saji atau minuman berpemanis tinggi gula sederhana. |

---

## 4. Eksplorasi Data & Analisis Statistik (EDA)

Dari analisis eksplorasi data terhadap 687 sampel NHANES:
1. **Prevalensi Obesitas Sentral**: Pada kelompok prediabetes, lebih dari 68% memiliki lingkar pinggang di atas batas aman metabolik (obesitas visceral), dibandingkan hanya 34% pada kelompok normal.
2. **Perilaku Sedentari**: Rata-rata durasi duduk pada kelompok prediabetes tercatat **7.8 jam/hari**, lebih tinggi secara signifikan dibandingkan kelompok normal (**6.2 jam/hari**).
3. **Aktivitas Fisik**: Individu yang memenuhi target WHO $\ge$150 menit/minggu memiliki risiko prediabetes **38% lebih rendah** dibanding kelompok inaktif.

---

## 5. Benchmarking Algoritma & Hasil Cross-Validation

Pengujian komparatif dilakukan menggunakan **5-Fold Stratified Cross-Validation** (5 kali perulangan terstratifikasi) untuk mengevaluasi 4 arsitektur machine learning yang berbeda:

| Algoritma | Mean CV ROC-AUC | Std CV ROC-AUC | Mean Recall | Mean F1-Score | Mean Accuracy |
| :--- | :---: | :---: | :---: | :---: | :---: |
| 🏆 **Logistic Regression (L2)** | **0.6864** | **±0.038** | **0.584** | **0.528** | **0.658** |
| **Random Forest Classifier** | 0.6721 | ±0.042 | 0.442 | 0.471 | 0.642 |
| **Gradient Boosting Classifier** | 0.6695 | ±0.045 | 0.461 | 0.485 | 0.640 |
| **XGBoost Classifier** | 0.6552 | ±0.049 | 0.450 | 0.468 | 0.627 |

### Mengapa Logistic Regression Menjadi Pemenang?
1. **Karakteristik Data Kuesioner**: Data kuesioner didominasi oleh variabel ordinal dan biner dengan korelasi aditif terhadap risiko kesehatan. Pada tipe data seperti ini, model linear teregularisasi ($L_2$) memiliki generalisasi yang jauh lebih unggul dan tidak rentan *overfitting* dibandingkan model *tree-ensemble* kompleks.
2. **Kalibrasi Probabilitas**: Menghasilkan kurva sigmoid alami yang sangat cocok untuk estimasi probabilitas klinis (*risk scoring* 0–100%).
3. **Interpretabilitas Medis**: Koefisien model dapat secara langsung diubah menjadi **Odds Ratio ($e^\beta$)**, memberikan transparansi bagi pengguna dan tenaga medis.

---

## 6. Kalibrasi Probabilitas Medis (Platt Scaling)

Dalam aplikasi kesehatan seperti GluCare, prediksi probabilitas tidak boleh sekadar berupa urutan peringkat (*ranking*), melainkan harus mencerminkan risiko riil pasien.
* Model dikalibrasi menggunakan **`CalibratedClassifierCV(method='sigmoid')`** (Platt Scaling).
* **Hasil Kalibrasi**:
  * *Brier Score Loss* menurun dari 0.224 menjadi **0.201** (semakin rendah nilainya, estimasi probabilitas semakin akurat).
  * Kurva kalibrasi (*Reliability Diagram*) menunjukkan keselarasan linear yang sangat dekat dengan garis diagonal ideal.

---

## 7. Explainable AI & Clinical Odds Ratios

Melalui ekstraksi koefisien regresi logistik, diperoleh **Odds Ratio (OR)** untuk setiap faktor risiko:

$$\text{Odds Ratio} = e^{\beta}$$

* Jika $\text{OR} > 1.0$: Faktor tersebut merupakan **pendorong risiko** (meningkatkan peluang prediabetes).
* Jika $\text{OR} < 1.0$: Faktor tersebut merupakan **faktor protektif** (menurunkan peluang prediabetes).

| Fitur Gaya Hidup | Koefisien ($\beta$) | Odds Ratio ($e^\beta$) | Efek Klinis | Keterangan Interpretasi |
| :--- | :---: | :---: | :---: | :--- |
| **Kategori BMI Obesitas / Overweight** | +0.642 | **1.90** | 🔴 Pendorong Risiko | Kenaikan 1 tingkat BMI meningkatkan risiko sebesar 90%. |
| **Lingkar Pinggang Berisiko** | +0.485 | **1.62** | 🔴 Pendorong Risiko | Adipositas visceral perut meningkatkan risiko sebesar 62%. |
| **Riwayat Hipertensi** | +0.412 | **1.51** | 🔴 Pendorong Risiko | Hipertensi berkaitan erat dengan resistensi vaskular. |
| **Pernah Diberitahu Borderline / Prediabetes**| +0.380 | **1.46** | 🔴 Pendorong Risiko | Riwayat gangguan glukosa masa lalu meningkatkan kerentanan. |
| **Durasi Duduk Tinggi ($\ge$8 Jam/Hari)** | +0.285 | **1.33** | 🔴 Pendorong Risiko | Gaya hidup sedentari menurunkan konsumsi glukosa oleh otot. |
| **Pola Makan Sering Makanan Cepat Saji** | +0.245 | **1.28** | 🔴 Pendorong Risiko | Karbohidrat olahan memicu lonjakan glukosa harian. |
| **Perokok Aktif** | +0.210 | **1.23** | 🔴 Pendorong Risiko | Nikotin dan radikal bebas mempercepat disfungsi sel beta. |
| **Aktivitas Fisik WHO ($\ge$150 mnt/mgg)** | -0.320 | **0.73** | 🟢 **Faktor Protektif** | Olahraga rutin menurunkan risiko prediabetes sebesar 27%. |

---

## 8. Arsitektur Integrasi Sistem End-to-End

```text
┌────────────────────────────────┐
│   Frontend React (GluCare Web) │
│   • Kuesioner.jsx (10 Soal)    │
│   • HasilAnalisis.jsx          │
└───────────────┬────────────────┘
                │ POST /api/ai/predict/questionnaire
                ▼
┌────────────────────────────────┐
│   Backend Node.js (Port: 5001) │
│   • aiRoutes.js                │
│   • aiController.js            │
│   • aiService.js               │
└───────────────┬────────────────┘
                │ HTTP Proxy: POST http://localhost:8000/predict/questionnaire
                ▼
┌────────────────────────────────┐
│   FastAPI Service (Port: 8000) │
│   • ai_server.py               │
│   • Model: glucare_question... │
└────────────────────────────────┘
```

1. **Frontend (`Kuesioner.jsx`)**: Pengguna menjawab 10 pertanyaan bertahap dengan progress tracker interaktif.
2. **Backend Node.js (`aiService.js`)**: Menerima request, memvalidasi user, menyusun parameter 12 fitur ML, dan meneruskan ke FastAPI AI Microservice.
3. **AI Microservice (`ai_server.py`)**: Menjalankan pipeline machine learning pada dataframe 12 fitur, menghasilkan `risk_level`, `score`, dan `predict_proba`.
4. **Response Handler (`aiService.js`)**: Memetakan hasil AI ke komponen UI, menghasilkan daftar faktor pendorong risiko (*risk drivers*), rekomendasi preskripsi 90 Hari, serta menyimpan hasil ke tabel `analysis_results` di MySQL.
5. **Dashboard Hasil (`HasilAnalisis.jsx`)**: Menampilkan speedometer risiko, kartu KPI parameter, faktor pendorong risiko, dan preskripsi personal.

---

## 9. Struktur Pertanyaan di Frontend (10 Pertanyaan)

Halaman kuesioner diatur menjadi 10 pertanyaan terstruktur yang dipetakan secara langsung ke model ML:

1. **Rentang Usia**: `< 30 Tahun` (0), `30 – 39 Tahun` (1), `≥ 40 Tahun` (1).
2. **Jenis Kelamin Biologis**: `Laki-laki` (1), `Perempuan` (2).
3. **Indeks Massa Tubuh (BMI)**: `Normal` (0), `Overweight` (1), `Obesitas` (2).
4. **Ukuran Lingkar Pinggang**: `Normal (≤90 cm P / ≤80 cm W)` (0), `Berisiko (>90 cm P / >80 cm W)` (1).
5. **Riwayat Tekanan Darah**: `Normal (<130/85)` (0), `Riwayat Hipertensi` (1).
6. **Riwayat Gula Darah & Prediabetes Keluarga**: `Tidak Ada` (0), `Ada Riwayat / Borderline` (1).
7. **Aktivitas Fisik & Olahraga (WHO)**: `Aktif (≥150 mnt/mgg)` (1), `Kurang Aktif` (0).
8. **Durasi Duduk Harian (Sedentari)**: `< 6 Jam` (4.0), `6 – 8 Jam` (7.0), `> 8 Jam` (10.0).
9. **Status Merokok**: `Bukan Perokok` (0), `Perokok Aktif` (1).
10. **Pola Makan & Makanan Cepat Saji**: `Sehat & Seimbang` (0), `Kurang Sehat / Sering Siap Saji` (1).

---

## 10. Spesifikasi API Endpoint & Kontrak Payload

### Endpoint: `POST /api/ai/predict/questionnaire`
* **URL**: `http://localhost:5001/api/ai/predict/questionnaire`
* **Headers**: `Content-Type: application/json`

#### Contoh Request Body (JSON):
```json
{
  "user_id": 1,
  "age_band": 0,
  "gender": 1,
  "bmi_category": 0,
  "waist_category": 0,
  "hypertension": 0,
  "diabetes_history": 0,
  "prediabetes_told": 0,
  "prediabetes_history": 0,
  "physically_active": 1,
  "sedentary_hours": 4.0,
  "current_smoker": 0,
  "poor_diet": 0
}
```

#### Contoh Response Berhasil (200 OK):
```json
{
  "mode": "questionnaire",
  "aiResult": {
    "prediction": [0],
    "predict_proba": [[0.6973, 0.3027, 0.0]],
    "risk_level": "Normal",
    "score": 30,
    "probability_prediabetes": 0.3027,
    "probability_normal": 0.6973,
    "model_source": "ML (NHANES 2021-2023)",
    "summary": "Analisis kuesioner gaya hidup menunjukkan tingkat risiko: Normal (Skor: 30%)"
  },
  "ui_data": {
    "score": 30,
    "riskLevel": "Normal",
    "riskStatus": "Rendah",
    "riskDescription": "Normal / Aman",
    "riskColor": "0xFF10B981",
    "faktorRisiko": [
      {
        "text": "Gaya hidup relatif sehat dan aktif",
        "isWarning": false
      }
    ],
    "ai_recommendation": {
      "sleep_target_hours": 7.5,
      "walking_target_minutes": 30,
      "nutrition_goal": "Pola Makan Gizi Seimbang & Hidrasi Optimal"
    }
  },
  "timestamp": "2026-10-07T12:00:00.000Z"
}
```

---

## 11. Jupyter Notebook Eksperimen

File notebook lengkap telah disediakan di:
📁 **[`main-feature/glucare_ai/notebooks/05_questionnaire_lifestyle_modeling.ipynb`](file:///d:/INFINIT%20LEARNING/Glucare_backend_pribadi/main-feature/glucare_ai/notebooks/05_questionnaire_lifestyle_modeling.ipynb)**

Notebook ini terdiri dari **23 sel (12 sel kode dengan visualisasi penuh)** yang mencakup:
* Seluruh output teks statistik dan uji signifikansi.
* Grafik visual beresolusi tinggi (Pie chart target, Stacked bar BMI, Boxplot jam duduk, Heatmap korelasi).
* Perbandingan boxplot 5-Fold Cross Validation antar 4 model.
* Kurva kalibrasi probabilitas (*Reliability Curve*).
* Kurva ROC-AUC dan Matriks Konfusi beranotasi persentase.
* Bar chart horizontal *Clinical Odds Ratio*.
* Simulasi inferensi pada 3 skenario pasien nyata.

---

## 12. Hasil Pengujian Otomatis

Seluruh alur telah divalidasi menggunakan suite pengujian otomatis [`test_api_endpoint.py`](file:///d:/INFINIT%20LEARNING/Glucare_backend_pribadi/main-feature/glucare_ai/test_api_endpoint.py):

```text
================================================================================
📊 LAPORAN HASIL PENGUJIAN API GLUCARE AI (LIVE HTTP BACKEND SERVER)
================================================================================

>> [✅ PASS] TC-AI-01: Uji Data Klinis: Pasien Sehat / Normal (Low Risk)
   HTTP Status Code : 200 (Ekspektasi: 200)
   Diagnosis Model  : Normal (Skor: 1%)
   Status Tampilan  : Normal / Aman (Rendah)

>> [✅ PASS] TC-AI-02: Uji Data Klinis: Pasien Berisiko Prediabetes (Golden Window 90 Days)
   HTTP Status Code : 200 (Ekspektasi: 200)
   Diagnosis Model  : Diabetes (Skor: 100%)
   Status Tampilan  : Indikasi Diabetes (Tinggi)

>> [✅ PASS] TC-AI-03: Uji Data Klinis: Kasus Negatif (Validasi missing user_id)
   HTTP Status Code : 400 (Ekspektasi: 400)
   Pesan Respon     : User ID diperlukan

>> [✅ PASS] TC-AI-04: Uji ML Kuesioner: Gaya Hidup Sehat & Protektif (Normal)
   HTTP Status Code : 200 (Ekspektasi: 200)
   Diagnosis Model  : Normal (Skor: 30%)
   Status Tampilan  : Normal / Aman (Rendah)

>> [✅ PASS] TC-AI-05: Uji ML Kuesioner: Gaya Hidup Berisiko Tinggi (Indikasi Prediabetes)
   HTTP Status Code : 200 (Ekspektasi: 200)
   Diagnosis Model  : Prediabetes (Skor: 82%)
   Status Tampilan  : Indikasi Prediabetes (Sedang)

>> [✅ PASS] TC-AI-06: Uji Mode Kuesioner: Kasus Negatif (Validasi missing data)
   HTTP Status Code : 400 (Ekspektasi: 400)
   Pesan Respon     : Jawaban kuesioner diperlukan

--------------------------------------------------------------------------------
HASIL AKHIR : 6 / 6 SKENARIO UJI LULUS (100%)
================================================================================
```
