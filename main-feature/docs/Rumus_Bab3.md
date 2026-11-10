# Bagian Bab III yang Memuat Rumus

## A. Untuk Subbab 3.2 Preprocessing Data (bagian pembentukan fitur)

Selain menggunakan variabel yang tersedia langsung pada dataset, beberapa fitur pada model klinis dibentuk dari variabel lain, yaitu Indeks Massa Tubuh (IMT), Mean Arterial Pressure (MAP), dan rasio trigliserida terhadap HDL. IMT diperoleh dari perbandingan berat badan (kg) terhadap kuadrat tinggi badan (m). MAP menggambarkan rata-rata tekanan darah dalam satu siklus detak jantung dan dihitung menggunakan Persamaan (3.1).

$$MAP = \frac{\text{Sistolik} + 2 \times \text{Diastolik}}{3} \quad (3.1)$$

Rasio trigliserida terhadap HDL digunakan sebagai indikator gangguan metabolisme lemak yang berkaitan dengan resistensi insulin dan dihitung menggunakan Persamaan (3.2).

$$\text{Rasio TG/HDL} = \frac{\text{Trigliserida}}{\text{HDL}} \quad (3.2)$$

---

## B. Untuk Subbab 3.3.5 Evaluasi Model

Kinerja model dievaluasi pada data uji menggunakan confusion matrix yang terdiri atas True Positive (TP), True Negative (TN), False Positive (FP), dan False Negative (FN). TP adalah data Prediabetes yang diprediksi Prediabetes, TN adalah data Normal yang diprediksi Normal, FP adalah data Normal yang diprediksi Prediabetes, dan FN adalah data Prediabetes yang diprediksi Normal.

Metrik yang digunakan meliputi accuracy, precision, recall, F1-score, dan ROC-AUC. Accuracy menunjukkan proporsi prediksi yang benar dari seluruh data uji. Precision dan recall dihitung menggunakan Persamaan (3.3) dan (3.4).

$$Precision = \frac{TP}{TP + FP} \quad (3.3)$$

$$Recall = \frac{TP}{TP + FN} \quad (3.4)$$

Recall menjadi metrik yang penting dalam skrining karena menunjukkan kemampuan model menemukan pengguna yang benar-benar berisiko prediabetes. F1-score merupakan rata-rata harmonik dari precision dan recall yang dihitung menggunakan Persamaan (3.5).

$$F1\text{-}Score = 2 \times \frac{Precision \times Recall}{Precision + Recall} \quad (3.5)$$

ROC-AUC digunakan untuk mengukur kemampuan model membedakan kelas Prediabetes dan Normal dengan nilai antara 0 sampai 1, dan semakin mendekati 1 menunjukkan kemampuan yang semakin baik. Pemilihan model terbaik dilakukan berdasarkan rata-rata ROC-AUC dari 5-fold cross-validation pada data latih.

Pada model klinis, LightGBM terpilih sebagai model terbaik. Pengujian pada 131 data uji menghasilkan TP = 43, TN = 81, FP = 1, dan FN = 6, sehingga diperoleh accuracy 0,9466, precision 0,9773, recall 0,8776, F1-score 0,9247, dan ROC-AUC 0,9634. Pada model kuesioner, Logistic Regression terpilih dengan rata-rata ROC-AUC cross-validation sebesar 0,6864 dan ROC-AUC data uji sebesar 0,6385. Nilai yang lebih rendah ini disebabkan model kuesioner tidak menggunakan hasil pemeriksaan laboratorium, sehingga hasilnya diposisikan sebagai skrining awal.
