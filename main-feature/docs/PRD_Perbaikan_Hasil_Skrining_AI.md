# PRD Perbaikan Hasil Skrining AI GluCare

27 Oktober 2026 · Deny Riansyah

## Latar belakang

Hasil skrining di aplikasi belum sepenuhnya sesuai dengan rancangan di Bab III proposal (subbab 3.3.4). Ada dua ketidaksesuaian yang perlu diperbaiki sebelum aplikasi didemokan atau masuk tahap pengujian.

- Bab III menyatakan peringatan diabetes hanya berasal dari aturan klinis GDP ≥ 126 mg/dL. API klinis masih menambahkan aturan kedua: probabilitas prediabetes ≥ 0,95 dianggap Diabetes, padahal model tidak pernah dilatih dengan data diabetes.
- Bab III menyatakan hasil skrining dipakai untuk menyesuaikan rekomendasi. Saat ini semua pengguna menerima saran tindak lanjut yang sama, apa pun hasil skriningnya.

Alur hasil saat ini: model → API AI ([ai_server.py](../glucare_ai/ai_server.py)) → backend ([aiService.js](../backend/services/aiService.js)) → halaman hasil ([HasilAnalisis.jsx](../main-featureGlucare/src/pages/HasilAnalisis.jsx)).

## Tujuan dan ruang lingkup

Tujuannya membuat kategori hasil dan saran tindak lanjut sesuai dengan Bab III, tanpa mengubah model atau data latih.

| No | Perbaikan | File | Sifat |
| --- | --- | --- | --- |
| 1 | Hapus aturan probabilitas ≥ 0,95 sebagai Diabetes | `glucare_ai/ai_server.py` | Wajib |
| 2 | Saran tindak lanjut berbeda per kategori hasil | `backend/services/aiService.js` | Wajib |
| 3 | Rapikan endpoint lama kuesioner | `backend/controllers/kuesionerController.js` | Opsional |
| 4 | Perbaiki kode jenis kelamin di jalur klinis | `backend/services/aiService.js`, `glucare_ai/ai_server.py` | Wajib |

**Di luar ruang lingkup:** melatih ulang model, mengubah ambang 0,40, mengubah tampilan halaman hasil, dan mengubah pertanyaan kuesioner.

**Catatan:** skor jalur kuesioner di halaman hasil sudah memakai skor dari API ([HasilAnalisis.jsx:72-76](../main-featureGlucare/src/pages/HasilAnalisis.jsx#L72-L76)). Nilai 25/55/85 hanya cadangan saat API tidak mengirim skor, jadi bagian ini tidak perlu diubah.

## Perbaikan 1: aturan Diabetes di API klinis

Kategori Diabetes hanya boleh muncul dari GDP ≥ 126 mg/dL, bukan dari probabilitas model.

**Lokasi:** [ai_server.py:689](../glucare_ai/ai_server.py#L689), fungsi prediksi klinis.

**Sekarang:**

```python
if fpg >= 126 or prob_prediabetes >= 0.95:
    risk_level = "Diabetes"
```

**Menjadi:**

```python
if fpg >= 126:
    risk_level = "Diabetes"
```

**Alasan:** model dilatih tanpa data diabetes, sehingga probabilitas prediabetes yang tinggi berarti "sangat mungkin prediabetes", bukan "diabetes". Dengan aturan lama, pengguna dengan GDP 110 mg/dL dan probabilitas 0,96 akan mendapat label Risiko Tinggi (Indikasi Diabetes), padahal GDP-nya masih di rentang prediabetes.

**Dampak:** sebagian pengguna yang tadinya berlabel Diabetes akan menjadi Prediabetes (Risiko Sedang). Aturan Prediabetes (probabilitas ≥ 0,40) dan Normal tidak berubah.

## Perbaikan 2: saran tindak lanjut per kategori

Setiap kategori hasil mendapat saran tindak lanjut sendiri, di jalur klinis maupun kuesioner.

**Lokasi:** [aiService.js](../backend/services/aiService.js), di dua tempat: baris 121 (UI klinis) dan baris 256 (UI kuesioner).

**Masalah:** kedua baris memakai `aiResult?.cta`, padahal API AI tidak pernah mengirim `cta`. Akibatnya semua pengguna mendapat saran yang sama: "Jaga pola makan dan aktivitas fisik dengan konsisten."

**Perubahan:** buat satu fungsi pemetaan dari kategori ke saran, lalu panggil di kedua baris tersebut.

```javascript
function getCtaByRisk(riskLevel, mode) {
    if (riskLevel === "Diabetes") {
        return "Nilai gula darah puasa Anda berada di rentang diabetes. Segera konsultasikan ke dokter atau fasilitas kesehatan terdekat untuk pemeriksaan lanjutan.";
    }
    if (riskLevel === "Prediabetes") {
        return mode === "questionnaire"
            ? "Disarankan melakukan pemeriksaan gula darah puasa atau HbA1c untuk memastikan kondisi Anda, lalu ikuti program 90 hari."
            : "Ikuti program 90 hari untuk memperbaiki pola makan, aktivitas fisik, dan tidur, serta lakukan pemeriksaan ulang secara berkala.";
    }
    return "Pertahankan pola hidup sehat dan lakukan skrining ulang secara berkala.";
}

// baris 121 (klinis)
cta: aiResult?.cta || getCtaByRisk(riskLevel, "clinical"),

// baris 256 (kuesioner)
cta: aiResult?.cta || getCtaByRisk(riskLevel, "questionnaire"),
```

| Kategori dari API | Ditampilkan | Saran klinis | Saran kuesioner |
| --- | --- | --- | --- |
| Normal | Risiko Rendah | Pertahankan pola hidup sehat dan skrining ulang berkala | Sama dengan klinis |
| Prediabetes | Risiko Sedang | Ikuti program 90 hari dan periksa ulang berkala | Periksa GDP atau HbA1c, lalu ikuti program 90 hari |
| Diabetes | Risiko Tinggi | Segera konsultasi ke dokter | Tidak muncul di jalur kuesioner |

Teks saran boleh diubah sesuai gaya bahasa aplikasi. Yang wajib hanya: setiap kategori punya saran berbeda, dan saran untuk Diabetes selalu mengarahkan ke tenaga kesehatan.

## Perbaikan 3 (opsional): endpoint lama kuesioner

Endpoint `POST /api/kuesioner/submit` tidak dipanggil oleh aplikasi, karena aplikasi memakai `POST /api/ai/predict/questionnaire`. Perbaikan ini hanya untuk merapikan kode.

**Lokasi:** [kuesionerController.js:91-100](../backend/controllers/kuesionerController.js#L91-L100).

**Masalah:**

- Saran dipilih berdasarkan kategori `low` dan `medium`, padahal API mengirim `Normal` dan `Prediabetes`, sehingga hasilnya selalu jatuh ke saran umum.
- Endpoint ini hanya mengirim 6 jawaban ke API (termasuk `overweight_history` yang sudah tidak dipakai model), sedangkan model membutuhkan 12 fitur.

**Pilihan perbaikan:**

1. **Dihapus (disarankan):** hapus route `/api/kuesioner/submit` dan fungsi `submitKuesioner`. Endpoint `GET /api/kuesioner/:user_id` dicek dulu apakah masih dipakai sebelum ikut dihapus.
2. **Dipertahankan:** ganti blok `switch` dengan `getCtaByRisk(aiResult.risk_level, "questionnaire")` dari Perbaikan 2, lalu lengkapi payload menjadi 12 fitur seperti di `aiService.js`.

## Perbaikan 4: kode jenis kelamin di jalur klinis

Semua pengguna perempuan saat ini dibaca sebagai laki-laki oleh model klinis. Model harus menerima kode jenis kelamin sesuai data latih NHANES: **1 = laki-laki, 2 = perempuan**.

**Penyebab:**

1. Backend mengirim perempuan sebagai `0` ([aiService.js:287-294](../backend/services/aiService.js#L287-L294)).
2. API AI membaca nilainya dengan `int(body.get("gender") or 1)` ([ai_server.py:660](../glucare_ai/ai_server.py#L660)). Di Python, `0` dianggap kosong, sehingga nilainya berubah menjadi `1` (laki-laki).
3. Kalaupun nilai `0` sampai ke model, kode itu tetap salah karena model dilatih dengan kode 1 dan 2.

**Jalur kuesioner tidak terdampak**, karena sudah memakai kode 1 dan 2 ([aiService.js:400-407](../backend/services/aiService.js#L400-L407)).

**Perubahan di backend** (`aiService.js`, fungsi prediksi klinis, sekitar baris 280–295). Samakan dengan cara jalur kuesioner:

```javascript
// Sekarang
let defaultGender = 1;
if (user.gender === "Perempuan" || user.gender === "0" || user.gender === 0) {
    defaultGender = 0;
}
const gender = data.gender !== undefined
    ? (data.gender === "Perempuan" || data.gender === 0 || data.gender === "0" ? 0 : 1)
    : defaultGender;

// Menjadi (1 = laki-laki, 2 = perempuan, sesuai NHANES)
let defaultGender = 1;
if (user.gender === "Perempuan" || user.gender === "2" || user.gender === 2) {
    defaultGender = 2;
}
const gender = data.gender !== undefined
    ? (data.gender === "Perempuan" || parseInt(data.gender) === 2 ? 2 : 1)
    : defaultGender;
```

**Perubahan di API AI** (`ai_server.py`, baris 660). Jangan memakai `or`, karena nilai `0` akan hilang. Tolak nilai selain 1 dan 2:

```python
# Sekarang
gender = int(body.get("gender") or 1)

# Menjadi
gender = int(body.get("gender", 1))
if gender not in (1, 2):
    raise HTTPException(status_code=422, detail="gender harus 1 (laki-laki) atau 2 (perempuan)")
```

Baris 728 (jalur kuesioner) memakai pola `or 2` yang sama. Saat ini tidak bermasalah karena backend selalu mengirim 1 atau 2, tetapi sebaiknya diubah dengan cara yang sama agar konsisten.

**Yang perlu dicek sebelum mengubah:** format nilai kolom `gender` di tabel `users`. Kode di beberapa tempat menganggapnya teks ("Perempuan", "Laki-laki", "L", "P"), sedangkan di tempat lain menganggapnya angka ("0", "1", "2"). Pastikan satu format, lalu sesuaikan kondisi `if` di atas dengan format tersebut.

## Pengujian dan kriteria selesai

Perbaikan dianggap selesai jika kelima skenario di bawah memberi hasil yang diharapkan saat diuji lewat aplikasi atau Swagger.

| No | Jalur | Masukan | Hasil yang diharapkan |
| --- | --- | --- | --- |
| 1 | Klinis | GDP 130 mg/dL, parameter lain normal | Risiko Tinggi (Indikasi Diabetes), saran konsultasi ke dokter |
| 2 | Klinis | GDP 110 mg/dL, IMT 30, TG/HDL tinggi (probabilitas ≥ 0,95) | Risiko Sedang (Indikasi Prediabetes), **bukan** Risiko Tinggi |
| 3 | Klinis | GDP 88 mg/dL, IMT 21,5, parameter lain normal | Risiko Rendah, saran pertahankan pola hidup sehat |
| 4 | Kuesioner | Jawaban dengan banyak faktor risiko (IMT obesitas, hipertensi, kurang aktif) | Risiko Sedang, saran periksa GDP atau HbA1c |
| 5 | Kuesioner | Jawaban tanpa faktor risiko | Risiko Rendah, saran pertahankan pola hidup sehat |
| 6 | Klinis | Akun perempuan, data klinis apa saja | API AI menerima `gender = 2` (cek log backend atau Swagger) |
| 7 | Klinis | Akun laki-laki, data klinis sama dengan skenario 6 | API AI menerima `gender = 1`, dan probabilitasnya berbeda dari skenario 6 |
| 8 | API AI langsung | Kirim `gender = 0` lewat Swagger | API menolak dengan status 422 |

- [ ] Skenario 1–8 lulus
- [ ] Saran Normal, Prediabetes, dan Diabetes tampil berbeda di halaman hasil
- [ ] Tidak ada hasil Risiko Tinggi untuk GDP < 126 mg/dL di jalur klinis
- [ ] Skor (%) di halaman hasil tetap sama dengan probabilitas dari API
- [ ] Hasil skrining tersimpan di riwayat dengan kategori dan saran yang benar

## Urutan pengerjaan dan risiko

Kerjakan dari hulu ke hilir, supaya setiap perubahan bisa diuji sebelum lanjut ke berikutnya.

1. Ubah `ai_server.py` (Perbaikan 1 dan bagian API dari Perbaikan 4), restart layanan AI, lalu jalankan skenario 1–3 dan 8 lewat Swagger AI (`/docs` di port 8000).
2. Ubah `aiService.js` (Perbaikan 2 dan bagian backend dari Perbaikan 4), restart backend, lalu jalankan skenario 1–7 lewat aplikasi.
3. Kerjakan Perbaikan 3 jika sempat, lalu pastikan aplikasi tidak memanggil endpoint yang dihapus.
4. Commit setiap perbaikan secara terpisah, agar mudah dikembalikan kalau ada masalah.

| Risiko | Pencegahan |
| --- | --- |
| Riwayat skrining lama yang tersimpan sebagai Diabetes karena aturan 0,95 tetap berlabel Diabetes | Biarkan sebagai data lama, atau tandai saat demo bahwa data itu dibuat sebelum perbaikan |
| Saran baru terlalu panjang untuk kartu di halaman hasil | Cek tampilan di layar ponsel, lalu persingkat teks bila terpotong |
| Endpoint lama ternyata masih dipakai bagian lain | Cari pemanggilan `/api/kuesioner` di frontend dan backend sebelum menghapus |
| Riwayat skrining klinis lama milik pengguna perempuan dihitung dengan jenis kelamin yang salah | Sarankan pengguna perempuan melakukan skrining ulang, atau jelaskan saat demo bahwa data lama dibuat sebelum perbaikan |
| Format kolom `gender` di basis data tidak seragam | Cek isi tabel `users` terlebih dahulu dan sesuaikan kondisi `if` di backend |
