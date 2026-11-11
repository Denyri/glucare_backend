📚 DOKUMENTASI PENGUJIAN API (API TESTING GUIDE)
## Modul Deteksi Dini Prediabetes & Clinical AI — GluCare

Dokumen ini menyediakan panduan komprehensif untuk melakukan pengujian (API Testing) pada endpoint backend GluCare AI, mencakup spesifikasi endpoint, skema payload, skenario uji (*test cases*), serta contoh pengujian menggunakan **cURL**, **Postman**, **Swagger UI**, dan **Python Script**.

---

## DAFTAR ISI
1. [Ringkasan Arsitektur Endpoint](#1-ringkasan-arsitektur-endpoint)
2. [Spesifikasi Endpoint Utama](#2-spesifikasi-endpoint-utama)
   - [A. POST /api/ai/predict/clinical (Prediksi Klinis/Lab)](#a-post-apipredictclinical-prediksi-klinislab)
   - [B. POST /api/ai/predict/questionnaire (Prediksi Kuesioner)](#b-post-apipredictquestionnaire-prediksi-kuesioner)
   - [C. GET /api/ai/result/:userId (Hasil Analisis Terkini)](#c-get-apiairesultuserid-hasil-analisis-terkini)
   - [D. Direct Python AI Endpoint: POST /predict/clinical](#d-direct-python-ai-endpoint-post-predictclinical)
3. [Matriks Skenario Uji (Test Cases Matrix)](#3-matriks-skenario-uji-test-cases-matrix)
4. [Panduan Pengujian dengan Berbagai Alat](#4-panduan-pengujian-dengan-berbagai-alat)
   - [Opsi 1: Pengujian dengan cURL (Terminal / PowerShell)](#opsi-1-pengujian-dengan-curl-terminal--powershell)
   - [Opsi 2: Pengujian dengan Postman](#opsi-2-pengujian-dengan-postman)
   - [Opsi 3: Pengujian dengan Swagger UI](#opsi-3-pengujian-dengan-swagger-ui)
   - [Opsi 4: Skrip Otomatis Pengujian Python (`test_api_endpoint.py`)](#opsi-4-skrip-otomatis-pengujian-python-test_api_endpointpy)

---

## 1. Ringkasan Arsitektur Endpoint

```text
┌────────────────────────┐         POST /api/ai/predict/clinical         ┌─────────────────────────┐
│     Klien / Penguji    │ ────────────────────────────────────────────► │   Backend Node.js API   │
│ (Postman / cURL / Web) │ ◄──────────────────────────────────────────── │      (Port: 5001)       │
└────────────────────────┘          JSON Result & UI Data Payload        └────────────┬────────────┘
                                                                                      │
                                                                           Ekstraksi Parameter Klinis
                                                                                      │
                                                                                      ▼
                                                                         ┌─────────────────────────┐
                                                                         │   GluCare AI Engine     │
                                                                         │ (StandardScaler + RF)   │
                                                                         │ glucare_prediabetes_... │
                                                                         └─────────────────────────┘
```

* **Base URL Backend**: `http://localhost:5001` (Lokal) atau Host Production
* **Base Path AI**: `/api/ai`
* **Content-Type**: `application/json`

---

## 2. Spesifikasi Endpoint Utama

### A. POST `/api/ai/predict/clinical` (Prediksi Klinis/Lab)
Endpoint utama untuk memproses parameter antropometri dan biomarker darah puasa pengguna.

#### URL & Metode
* **Method**: `POST`
* **URL**: `http://localhost:5001/api/ai/predict/clinical`
* **Headers**: `Content-Type: application/json`

#### Request Body Schema
| Parameter | Tipe Data | Wajib? | Satuan / Format | Keterangan Klinis |
| :--- | :---: | :---: | :---: | :--- |
| `user_id` | `String / Int` | **Ya** | ID Unik User | ID pengguna terdaftar |
| `gula_darah_puasa` | `Float` | **Ya** | mg/dL | Nilai glukosa puasa (FPG) |
| `berat_badan` | `Float` | **Ya** | kg | Bobot tubuh aktual |
| `tinggi_badan` | `Float` | **Ya** | cm | Tinggi badan (menghitung BMI) |
| `lingkar_pinggang` | `Float` | **Ya** | cm | Indikator obesitas sentral |
| `tekanan_sistolik` | `Integer` | **Ya** | mmHg | Tekanan darah atas |
| `tekanan_diastolik` | `Integer` | **Ya** | mmHg | Tekanan darah bawah |
| `hdl` | `Float` | **Ya** | mg/dL | Kolesterol baik |
| `trigliserida` | `Float` | **Ya** | mg/dL | Lipid trigliserida |
| `riwayat_keluarga` | `String / Int` | Opsional | "Ada" / "Tidak" / 0 / 1 | Riwayat diabetes pada orang tua/saudara |
| `riwayat_diabetes` | `String / Int` | Opsional | "Ada" / "Tidak" / 0 / 1 | Riwayat pribadi sebelumnya |

#### Contoh Request Body (JSON):
```json
{
  "user_id": 1,
  "gula_darah_puasa": 105.0,
  "berat_badan": 85.0,
  "tinggi_badan": 170.0,
  "lingkar_pinggang": 95.0,
  "tekanan_sistolik": 125,
  "tekanan_diastolik": 82,
  "hdl": 42.0,
  "trigliserida": 160.0,
  "riwayat_keluarga": "Ada",
  "riwayat_diabetes": "Tidak"
}
```

#### Contoh Response Berhasil (200 OK):
```json
{
  "mode": "clinical",
  "aiResult": {
    "prediction": [1],
    "predict_proba": [[0.107, 0.893]],
    "risk_level": "Prediabetes",
    "probability_prediabetes": 0.893
  },
  "ui_data": {
    "score": 89,
    "riskLevel": "Prediabetes",
    "riskStatus": "Sedang",
    "riskDescription": "Indikasi Prediabetes",
    "riskColor": "0xFFF59E0B",
    "faktorRisiko": [
      {
        "text": "Gula Darah Puasa (105 mg/dL) berada di zona Prediabetes.",
        "isWarning": true
      },
      {
        "text": "Kategori BMI Obesitas (29.4) meningkatkan risiko metabolik secara signifikan.",
        "isWarning": true
      },
      {
        "text": "Rasio TG/HDL tinggi (3.8) mengindikasikan kemungkinan resistensi insulin.",
        "isWarning": true
      }
    ],
    "insight": "Analisis AI mendeteksi tanda dini resistensi insulin (Prediabetes). Anda berada di fase emas: dengan Program 90 Hari menjaga pola tidur, aktivitas fisik, dan nutrisi, kadar gula darah sangat berpeluang kembali normal.",
    "cta": "Disarankan mendaftar Program Intervensi 90 Hari GluCare dan evaluasi medis berkala."
  },
  "clinicalParams": {
    "glucose_fasting": 105.0,
    "age": 30,
    "waist_cm": 95.0,
    "bmi": 29.41,
    "hdl": 42.0,
    "triglycerides": 160.0,
    "bp_systolic": 125.0,
    "bp_diastolic": 82.0,
    "gender": 1,
    "map_pressure": 96.33,
    "tg_hdl_ratio": 3.81
  },
  "timestamp": "2026-09-14T14:15:00.000Z"
}
```

---

### B. POST `/api/ai/predict/questionnaire` (Prediksi Kuesioner ML)
Endpoint untuk estimasi risiko non-invasif berbasis Machine Learning Classifier (NHANES 2021–2023 Lifestyle Modules) yang menggantikan heuristik rule-based.

#### Request Body Schema (Full ML Features):
| Parameter | Tipe Data | Wajib? | Nilai / Format | Keterangan |
| :--- | :---: | :---: | :---: | :--- |
| `user_id` | `String / Int` | **Ya** | ID Unik User | ID pengguna terdaftar |
| `age_band` | `Integer` | Opsional | `0`: <30 thn, `1`: ≥30 thn | Kelompok usia |
| `gender` | `Integer` | Opsional | `1`: Laki-laki, `2`: Perempuan | Jenis kelamin biologis (NHANES) |
| `bmi_category` | `Integer` | **Ya** | `0`: Normal, `1`: Overweight, `2`: Obesitas | Kategori BMI WHO Asia-Pasifik |
| `waist_category` | `Integer` | **Ya** | `0`: Normal, `1`: Berisiko | Lingkar pinggang (P>90cm / W>80cm) |
| `hypertension` | `Integer` | **Ya** | `0`: Tidak, `1`: Ya | Riwayat tekanan darah tinggi |
| `diabetes_history` | `Integer` | Opsional | `0`: Tidak, `1`: Ya | Riwayat diabetes / gula darah tinggi |
| `prediabetes_told` | `Integer` | Opsional | `0`: Tidak, `1`: Ya | Pernah diberitahu dokter borderline |
| `prediabetes_history` | `Integer` | Opsional | `0`: Tidak, `1`: Ya | Riwayat keluarga prediabetes |
| `physically_active` | `Integer` | Opsional | `0`: Kurang, `1`: Aktif | Target WHO ≥150 menit/minggu |
| `sedentary_hours` | `Float` | Opsional | Nilai jam (e.g. `4.0`, `7.0`, `10.0`) | Durasi inaktif/duduk per hari |
| `current_smoker` | `Integer` | Opsional | `0`: Tidak, `1`: Ya | Status merokok aktif |
| `poor_diet` | `Integer` | Opsional | `0`: Sehat, `1`: Kurang sehat | Pola makan tinggi olahan/gula |

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
    ]
  }
}
```

---

### C. GET `/api/ai/result/:userId` (Hasil Analisis Terkini)
Mengambil riwayat skor kesehatan dan diagnosis AI terakhir milik pengguna tertentu.

#### URL & Parameter
* **Method**: `GET`
* **URL**: `http://localhost:5001/api/ai/result/1`
* **Param**: `:userId` = ID pengguna

---

### D. Direct Python AI Endpoint: POST `/predict/clinical`
Jika menggunakan mikroservis Python langsung (FastAPI/Flask/HuggingFace), skema inputnya berbentuk 12 fitur mentah:

#### Request Body (Direct AI):
```json
{
  "age": 32,
  "gender": 1,
  "weight": 85.0,
  "bmi": 28.5,
  "waist_cm": 96.0,
  "bp_systolic": 125.0,
  "bp_diastolic": 82.0,
  "map_pressure": 96.33,
  "glucose_fasting": 108.0,
  "hdl": 44.0,
  "triglycerides": 155.0,
  "tg_hdl_ratio": 3.52
}
```

#### Response (Direct AI):
```json
{
  "prediction": 1,
  "status": "Prediabetes",
  "risk_score": 89.3,
  "probability_normal": 0.107,
  "probability_prediabetes": 0.893
}
```

---

## 3. Matriks Skenario Uji (Test Cases Matrix)

| ID Kasus | Judul Uji | Input Parameter Kunci | Ekspektasi Status HTTP | Ekspektasi Diagnosis AI | Kriteria Kelulusan (Pass Criteria) |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **TC-AI-01** | Pasien Sehat / Resiko Rendah | GDP: 85 mg/dL, BMI: 21.5, Tensi: 110/70, TG/HDL: 1.2 | **200 OK** | `Normal / Aman` (Score < 30%) | `riskLevel == 'Normal'`, warna hijau |
| **TC-AI-02** | Pasien Indikasi Prediabetes | GDP: 106 mg/dL, BMI: 29.5, Pinggang: 96 cm, TG/HDL: 3.8 | **200 OK** | `Indikasi Prediabetes` (Score 30–59%) | `riskLevel == 'Prediabetes'`, warna oranye |
| **TC-AI-03** | Pasien Glukosa Tinggi / Diabetes | GDP: 135 mg/dL, BMI: 33.0, Pinggang: 104 cm, Tensi: 140/90 | **200 OK** | `Indikasi Diabetes` (Score ≥ 60%) | `riskLevel == 'Diabetes'`, warna merah |
| **TC-AI-04** | Validasi Missing Parameter `user_id` | Payload tanpa field `user_id` | **400 Bad Request** | Pesan Eror Validasi | Response mengandung `message: "User ID diperlukan"` |
| **TC-AI-05** | Validasi Format JSON Rusak | Body JSON tidak valid (kurang tanda koma/kurung) | **400 Bad Request** | Eror Parsing JSON | Response `Format Body JSON tidak valid` |
| **TC-AI-06** | Query Hasil Terakhir User | GET `/api/ai/result/1` | **200 OK** | Data tersimpan sebelumnya | Nilai `score` dan `timestamp` konsisten |

---

## 4. Panduan Pengujian dengan Berbagai Alat

### Opsi 1: Pengujian dengan cURL (Terminal / PowerShell)

#### Test Case 1: Pasien Sehat (Normal)
```powershell
curl -X POST http://localhost:5001/api/ai/predict/clinical `
  -H "Content-Type: application/json" `
  -d '{
    "user_id": 1,
    "gula_darah_puasa": 86.0,
    "berat_badan": 65.0,
    "tinggi_badan": 172.0,
    "lingkar_pinggang": 76.0,
    "tekanan_sistolik": 112,
    "tekanan_diastolik": 72,
    "hdl": 58.0,
    "trigliserida": 85.0
  }'
```

#### Test Case 2: Pasien Berisiko Prediabetes
```powershell
curl -X POST http://localhost:5001/api/ai/predict/clinical `
  -H "Content-Type: application/json" `
  -d '{
    "user_id": 1,
    "gula_darah_puasa": 106.0,
    "berat_badan": 88.0,
    "tinggi_badan": 168.0,
    "lingkar_pinggang": 98.0,
    "tekanan_sistolik": 128,
    "tekanan_diastolik": 84,
    "hdl": 40.0,
    "trigliserida": 170.0
  }'
```

---

### Opsi 2: Pengujian dengan Postman

1. Buka aplikasi **Postman**.
2. Buat permintaan baru (**New Request**).
3. Pilih metode: **`POST`**.
4. Masukkan URL: `http://localhost:5001/api/ai/predict/clinical`.
5. Buka tab **Headers**, pastikan ada:
   * Key: `Content-Type`, Value: `application/json`
6. Buka tab **Body** ➔ pilih **raw** ➔ pilih format **JSON**.
7. Tempelkan contoh payload JSON (misal Test Case 2).
8. Klik **Send** dan amati response status `200 OK` beserta struktur `ui_data` dan `aiResult`.

---

### Opsi 3: Pengujian dengan Swagger UI

Backend GluCare telah dilengkapi antarmuka interaktif OpenAPI/Swagger:
1. Buka browser dan akses alamat:
   ```text
   http://localhost:5001/api-docs
   ```
2. Cari tag **`AI Predictions`**.
3. Klik pada rute `POST /api/ai/predict/clinical`.
4. Klik tombol **Try it out**.
5. Ubah nilai parameter pada kotak JSON contoh sesuai kebutuhan pengujian.
6. Klik tombol **Execute** dan periksa Response Body serta Status Code secara visual.

---

### Opsi 4: Skrip Otomatis Pengujian Python (`test_api_endpoint.py`)

Untuk pengujian otomatis tanpa manual input, Anda dapat menjalankan skrip otomasi yang telah disediakan:

```powershell
python main-feature/glucare_ai/test_api_endpoint.py
```

Skrip ini akan secara otomatis menembak seluruh test cases (Sehat, Prediabetes, Diabetes, dan Validasi Error), lalu mengeluarkan laporan kelulusan (*Pass/Fail Scorecard*).
