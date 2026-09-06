# Data Dictionary - GluCare Clinical Datasets

Dokumentasi ini menjelaskan metadata, struktur fitur, formula turunan, dan kriteria klinis yang digunakan dalam pembuatan dataset terstruktur dari data mentah **NHANES 2021–2023** untuk **Clinical Model GluCare**, termasuk penentuan **Step 6: Clinical Ground Truth Labeling**.

---

## 1. Ikhtisar File Dataset

| File | Populasi & Strategi | Jumlah Baris | Jumlah Kolom | Tujuan Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| `nhanes_glucare_target_20_40.csv` | Dewasa Muda Usia 20–40 tahun (*Opsi A: Eksklusi Diabetes*) | 653 | 20 | Dataset Ground Truth Step 6 untuk deteksi dini prediabetes (**1 = Prediabetes, 0 = Bukan Prediabetes**) |
| `nhanes_glucare_cleaned_adult.csv` | Seluruh Dewasa Usia ≥ 20 tahun (*Multi-Class Termasuk Diabetes*) | 2.661 | 20 | Dataset komprehensif untuk benchmarking & klasifikasi multi-kelas (*Normal, Prediabetes, Diabetes*) |

---

## 2. Definisi Variabel & Pemetaan Sumber NHANES

| Nama Kolom | Sumber File & Kolom NHANES | Tipe Data | Format / Unit | Deskripsi Klinis |
| :--- | :--- | :--- | :--- | :--- |
| `seqn` | `DEMO_L.XPT` (`SEQN`) | Integer | ID | *Respondent sequence number* (ID unik responden). |
| `age` | `DEMO_L.XPT` (`RIDAGEYR`) | Integer | Tahun | Usia responden saat pemeriksaan skrining. |
| `gender` | `DEMO_L.XPT` (`RIAGENDR`) | Integer | Kategori | Jenis kelamin: `1` = Laki-laki (*Male*), `2` = Perempuan (*Female*). |
| `weight` | `BMX_L.XPT` (`BMXWT`) | Float | kg | Berat badan responden (dibulatkan 2 desimal). |
| `height` | `BMX_L.XPT` (`BMXHT`) | Float | cm | Tinggi badan berdiri responden (dibulatkan 2 desimal). |
| `bmi` | `BMX_L.XPT` (`BMXBMI`) | Float | $kg/m^2$ | Indeks Massa Tubuh (dihitung ulang dari berat/tinggi jika kosong). |
| `waist_cm` | `BMX_L.XPT` (`BMXWAIST`) | Float | cm | Lingkar perut / pinggang responden (dibulatkan 2 desimal). |
| `bp_systolic` | `BPXO_L.XPT` (`BPXOSY1..3`) | Float | mmHg | Rata-rata dari pembacaan sistolik oscillometric yang valid. |
| `bp_diastolic`| `BPXO_L.XPT` (`BPXODI1..3`) | Float | mmHg | Rata-rata dari pembacaan diastolik oscillometric yang valid. |
| `map_pressure`| Dihitung secara klinis | Float | mmHg | *Mean Arterial Pressure*: $(2 \times \text{bp\_diastolic} + \text{bp\_systolic}) / 3$. |
| `glucose_fasting` | `GLU_L.XPT` (`LBXGLU`) | Float | mg/dL | Kadar glukosa plasma puasa (*Fasting Plasma Glucose*). |
| `hdl` | `HDL_L.XPT` (`LBDHDD`) | Float | mg/dL | Kolesterol *High-Density Lipoprotein* (HDL). |
| `triglycerides` | `TRIGLY_L.XPT` (`LBXTLG`) | Float | mg/dL | Kadar trigliserida serum puasa. |
| `tg_hdl_ratio` | Dihitung secara klinis | Float | Rasio | Rasio Trigliserida terhadap HDL ($\text{triglycerides} / \text{hdl}$). |
| `hba1c` | `GHB_L.XPT` (`LBXGH`) | Float | % | Hemoglobin terglikasi (*Glycohemoglobin* / HbA1c). |
| `fasting_hours`| `FASTQX_L.XPT` (`PHAFSTHR`) | Float | Jam | Durasi puasa makanan sebelum sampel darah diambil. |
| `ground_truth_status` | Standar ADA (Step 6) | String | Kategori | Status ground truth klinis: `'Prediabetes'`, `'Bukan Prediabetes'`, `'Diabetes'`, atau `'UNKNOWN'`. |
| `label_prediabetes` | Standar ADA (Step 6) | Integer | `0`, `1` | **Label Target Pembelajaran Biner**: `1` = Prediabetes, `0` = Bukan Prediabetes. |
| `diabetes_status` | Standar ADA | String | Label | Status klinis multi-kelas: `'Normal'`, `'Prediabetes'`, `'Diabetes'`. |
| `target` | Standar ADA | Integer | `0`, `1`, `2` | Label numerik multi-kelas (`0`=Normal, `1`=Prediabetes, `2`=Diabetes). |

---

## 3. Kriteria Ground Truth Step 6 (American Diabetes Association - ADA)

Kombinasi Glukosa Puasa (`glucose_fasting`) dan HbA1c (`hba1c`):

1. **Prediabetes (`label_prediabetes = 1`, `ground_truth_status = 'Prediabetes'`)**:
   - $(100.0 \le \text{glucose\_fasting} < 126.0\text{ mg/dL})$ **ATAU** $(5.7\% \le \text{hba1c} < 6.5\%)$
2. **Bukan Prediabetes (`label_prediabetes = 0`, `ground_truth_status = 'Bukan Prediabetes'`)**:
   - $\text{glucose\_fasting} < 100.0\text{ mg/dL}$ **DAN** $\text{hba1c} < 5.7\%$
3. **Data Tidak Cukup (`ground_truth_status = 'UNKNOWN'`)**:
   - Jika $\text{glucose\_fasting}$ dan $\text{hba1c}$ kosong / tidak tersedia. Pada tahap pembersihan data latih, data `UNKNOWN` disaring keluar sehingga seluruh sampel training memiliki ground truth yang dapat ditentukan secara objektif berdasarkan kriteria FPG/HbA1c yang digunakan.
4. **Kasus Diabetes Murni ($\text{glucose\_fasting} \ge 126$ atau $\text{hba1c} \ge 6.5$)**:
   - Pada dataset target usia 20–40 tahun (`nhanes_glucare_target_20_40.csv`), sesuai **Opsi A**, kasus diabetes murni (21 orang) dieksklusi agar fokus pelatihan AI adalah membedakan individu sehat (0) dan yang berisiko prediabetes (1).

---

## 4. Distribusi Target Step 6

### Target Usia 20–40 Tahun (`nhanes_glucare_target_20_40.csv`):
- **Bukan Prediabetes (`label_prediabetes = 0`)**: 408 sampel (62.5%)
- **Prediabetes (`label_prediabetes = 1`)**: 245 sampel (37.5%)
- **Total Sampel Latih**: **653 sampel** (0 missing values, 0 UNKNOWN, 0 duplikat).
