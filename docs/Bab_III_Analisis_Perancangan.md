BAB III ANALISIS DAN PERANCANGAN

3.1 Pengumpulan Data
Data yang akan digunakan dalam pengembangan aplikasi GluCare berasal dari dataset publik National Health and Nutrition Examination Survey (NHANES) periode 2021–2023. Dataset ini dikelola oleh National Center for Health Statistics (NCHS), bagian dari Centers for Disease Control and Prevention (CDC), Amerika Serikat. NHANES dipilih karena menyediakan informasi demografi, antropometri, tekanan darah, hasil pemeriksaan laboratorium, serta kebiasaan hidup responden. Informasi tersebut akan digunakan untuk mengembangkan dua jalur skrining GluCare, yaitu skrining berbasis klinis dan skrining berbasis kuesioner.

Data NHANES tersimpan dalam beberapa berkas terpisah yang dapat dihubungkan melalui nomor identitas unik setiap responden, yaitu variabel Respondent Sequence Number (SEQN). Berdasarkan penelusuran awal terhadap dataset, populasi awal untuk kedua jalur adalah subsampel puasa sebanyak 3.996 peserta, yaitu peserta yang memiliki hasil pemeriksaan glukosa darah puasa (GDP). Subsampel ini dipilih karena kedua jalur membutuhkan nilai GDP untuk menentukan label. Angka 3.996 merupakan populasi asal yang sama bagi kedua jalur. Namun, jumlah peserta yang tersedia untuk seleksi berbeda, karena berkas data yang digabungkan pada setiap jalur juga berbeda.

Pada jalur klinis, berkas yang akan digunakan meliputi DEMO_L, BMX_L, BPXO_L, GLU_L, HDL_L, TRIGLY_L, GHB_L, dan FASTQX_L. Berkas-berkas tersebut menyediakan informasi demografi, pengukuran tubuh, tekanan darah, GDP, HDL, trigliserida, HbA1c, dan durasi puasa. Penelusuran awal menunjukkan bahwa seluruh peserta subsampel puasa memiliki data pada berkas-berkas tersebut, sehingga jumlahnya tetap 3.996 setelah penggabungan. Setelah seleksi bertahap berdasarkan status kehamilan, durasi puasa, dan usia 20–40 tahun, serta pemeriksaan kelengkapan data dan pengeluaran responden diabetes, diperkirakan tersedia 653 sampel, terdiri atas 408 sampel Normal dan 245 sampel Prediabetes.

Pada jalur kuesioner, berkas DEMO_L, BMX_L, GLU_L, GHB_L, dan FASTQX_L akan digabungkan dengan berkas kuesioner BPQ_L, DIQ_L, PAQ_L, SMQ_L, dan DBQ_L. Berkas kuesioner tersebut menyediakan informasi riwayat hipertensi, riwayat diabetes dan prediabetes, aktivitas fisik, kebiasaan merokok, dan pola makan. Penggabungan hanya akan mempertahankan peserta yang memiliki data pada seluruh berkas tersebut. Karena tidak semua peserta subsampel puasa mengisi kuesioner, penelusuran awal menunjukkan jumlah peserta turun dari 3.996 menjadi 3.562 sebelum seleksi dilakukan. Setelah seleksi dengan kriteria yang sama dan pengeluaran responden diabetes, diperkirakan tersedia 687 sampel, terdiri atas 427 sampel Normal dan 260 sampel Prediabetes.

Tabel 3. 1 Daftar File Dataset yang Digunakan
No	Nama Berkas	Informasi	Digunakan pada
1	DEMO_L.XPT	Demografi	Klinis dan kuesioner
2	BMX_L.XPT	Antropometri	Klinis dan kuesioner
3	GLU_L.XPT	Glukosa darah puasa	Klinis dan kuesioner
4	GHB_L.XPT	HbA1c	Klinis dan kuesioner
5	FASTQX_L.XPT	Durasi puasa	Klinis dan kuesioner
6	BPXO_L.XPT	Tekanan darah	Klinis
7	HDL_L.XPT	Kolesterol HDL	Klinis
8	TRIGLY_L.XPT	Trigliserida	Klinis
9	BPQ_L.xpt	Riwayat hipertensi	Kuesioner
10	DIQ_L.xpt	Riwayat diabetes dan prediabetes	Kuesioner
11	PAQ_L.xpt	Aktivitas fisik	Kuesioner
12	SMQ_L.xpt	Kebiasaan merokok	Kuesioner
13	DBQ_L.xpt	Pola makan	Kuesioner

Tabel 3. 2 Perbandingan Jumlah Data Sebelum dan Sesudah Preprocessing
Jenis Data	Data Awal	Setelah Penggabungan	Data Akhir
Data klinis	3.996	3.996 	653
Data kuesioner	3.996	3.562 	687

3.2 Preprocessing Data
Data yang telah dikumpulkan perlu melalui tahap preprocessing sebelum digunakan untuk melatih model machine learning. Tahap ini bertujuan untuk menyeleksi, membersihkan, dan menyeragamkan data agar sesuai dengan kebutuhan deteksi dini prediabetes. Zhang et al. (2024) menerapkan pembersihan data dengan menghapus data yang hilang dan nilai tidak normal sebelum mengembangkan model machine learning untuk mengidentifikasi prediabetes dan diabetes. Sementara itu, Riveros Perez dan Avella-Molano (2025) menggunakan variabel gaya hidup dari dataset NHANES untuk membandingkan beberapa algoritma dalam prediksi diabetes.
Berdasarkan pendekatan tersebut, preprocessing pada GluCare direncanakan meliputi penggabungan dataset, seleksi data, pembersihan dan validasi data, penentuan label, serta pemilihan fitur. Tahapan ini akan diterapkan secara terpisah pada data klinis dan data kuesioner karena kedua jalur memiliki karakteristik masukan yang berbeda.

3.2.1 Penggabungan Dataset
Penggabungan dataset akan dilakukan dengan menghubungkan beberapa berkas NHANES berdasarkan nomor identitas responden, sehingga informasi demografi, antropometri, tekanan darah, hasil laboratorium, dan gaya hidup dari responden yang sama tersusun dalam satu baris data. Penggabungan hanya akan mempertahankan responden yang tercatat pada seluruh berkas yang dibutuhkan oleh setiap jalur, sebagaimana ditunjukkan pada Tabel 3.2.

3.2.2 Seleksi Data
Seleksi data akan dilakukan untuk memilih responden yang sesuai dengan kriteria penelitian. Kriteria yang sama diterapkan pada kedua jalur. Responden yang dipertahankan adalah responden berusia 20–40 tahun, tidak sedang hamil, memiliki durasi puasa 8–24 jam agar nilai GDP valid, serta tidak memenuhi kriteria diabetes. Responden diabetes dikeluarkan karena GluCare difokuskan pada pemisahan kelompok Normal dan Prediabetes. Tahapan ini mengacu pada prinsip penentuan populasi penelitian sebelum pemodelan, seperti yang dilakukan Zhang et al. (2024) dalam menetapkan kriteria responden sebelum membangun model prediksi.

3.2.3 Pembersihan dan Validasi Data
Pembersihan dan validasi data akan dilakukan untuk memeriksa kelengkapan dan kewajaran nilai dalam dataset. Pada data klinis, nilai tekanan darah, GDP, HbA1c, HDL, trigliserida, IMT, dan lingkar pinggang akan diperiksa agar berada dalam rentang yang wajar secara fisiologis. Responden yang tidak memiliki data lengkap pada variabel-variabel tersebut akan dikeluarkan.
Pada data kuesioner, responden yang tidak memiliki data GDP, HbA1c, IMT, lingkar pinggang, riwayat hipertensi, atau riwayat diabetes akan dikeluarkan karena variabel-variabel tersebut dibutuhkan untuk label dan fitur utama. Data kosong pada pertanyaan kuesioner lainnya direncanakan diisi dengan nilai pengganti yang wajar, misalnya nilai umum pada populasi atau jawaban "tidak" untuk pertanyaan ya/tidak, agar jumlah sampel tidak berkurang terlalu banyak. Cara pengisian ini akan dicatat agar pengaruhnya dapat dipertimbangkan saat menafsirkan hasil model.

3.2.4 Penentuan Label
Penentuan label dilakukan untuk mengelompokkan responden ke dalam kategori Normal dan Prediabetes. Pelabelan mengacu pada kriteria American Diabetes Association (ADA) dengan menggunakan nilai GDP dan HbA1c, sebagaimana ditunjukkan pada Tabel 3.3.
Tabel 3. 3 Kriteria Penentuan Label Prediabetes
Kategori	Glukosa Darah Puasa	HbA1c	Perlakuan
Normal	<100 mg/dL	<5,7%	Digunakan
Prediabetes	100–125 mg/dL	5,7–6,4%	Digunakan
Diabetes	≥126 mg/dL	≥6,5%	Dikeluarkan

Responden dikategorikan Prediabetes apabila memenuhi salah satu kriteria, yaitu GDP 100–125 mg/dL atau HbA1c 5,7–6,4%. Responden dikategorikan Normal apabila kedua nilai tersebut berada di bawah ambang prediabetes. Responden yang memenuhi salah satu kriteria diabetes dikeluarkan dari dataset. Kriteria yang sama digunakan pada jalur klinis maupun jalur kuesioner.

3.2.5 Pemilihan Fitur
Pemilihan fitur akan dilakukan dengan mempertimbangkan tujuan setiap jalur skrining dan ketersediaan data, baik pada dataset pelatihan maupun pada pengguna aplikasi. Riveros Perez dan Avella-Molano (2025) menunjukkan penggunaan variabel gaya hidup sebagai masukan model prediksi diabetes, sedangkan Zhang et al. (2024) menggunakan indikator pemeriksaan kesehatan untuk mengidentifikasi gangguan metabolisme glukosa.
Fitur jalur klinis direncanakan berjumlah 12, yaitu usia, jenis kelamin, berat badan, indeks massa tubuh (IMT), lingkar pinggang, tekanan darah sistolik, tekanan darah diastolik, tekanan arteri rata-rata (MAP), GDP, HDL, trigliserida, dan rasio trigliserida terhadap HDL (TG/HDL). Tekanan darah sistolik dan diastolik akan diambil dari rata-rata tiga kali pengukuran. IMT, MAP, dan rasio TG/HDL akan dihitung dari variabel yang tersedia, sebagaimana ditunjukkan pada Persamaan (3.1) sampai Persamaan (3.3). HbA1c hanya akan digunakan untuk menentukan label, sehingga tidak dimasukkan sebagai fitur.

$$IMT = \frac{\text{Berat Badan (kg)}}{\text{Tinggi Badan (m)}^2} \quad (3.1)$$

$$MAP = \frac{\text{Sistolik} + 2 \times \text{Diastolik}}{3} \quad (3.2)$$

$$\text{Rasio TG/HDL} = \frac{\text{Trigliserida}}{\text{HDL}} \quad (3.3)$$

Fitur jalur kuesioner juga direncanakan berjumlah 12. Fitur demografi dan kondisi fisik terdiri atas kelompok usia, jenis kelamin, kategori IMT menurut standar Asia-Pasifik, dan kategori lingkar pinggang untuk menandai obesitas sentral. Fitur riwayat kesehatan meliputi riwayat hipertensi, riwayat diabetes, pernah diberi tahu mengalami prediabetes, dan riwayat prediabetes. Fitur gaya hidup meliputi aktivitas fisik, jam duduk per hari, status merokok aktif, dan pola makan kurang sehat. GDP dan HbA1c tidak akan digunakan sebagai fitur pada jalur ini karena keduanya menjadi dasar pembentukan label dan tidak dimiliki oleh pengguna yang belum melakukan pemeriksaan laboratorium.
Kedua kelompok fitur tersebut dirancang untuk memenuhi dua kebutuhan pengguna. Jalur klinis ditujukan bagi pengguna yang telah memiliki hasil pemeriksaan kesehatan, sedangkan jalur kuesioner ditujukan bagi pengguna yang belum memiliki hasil pemeriksaan laboratorium. Daftar fitur ini masih dapat disesuaikan berdasarkan hasil analisis data pada tahap pengembangan.

3.3 Penerapan Metode AI
Penerapan metode kecerdasan buatan pada GluCare bertujuan untuk menghasilkan model yang mampu mengklasifikasikan data kesehatan ke dalam kategori Normal dan Prediabetes. Kedua model dirancang sebagai model klasifikasi dua kelas, sedangkan responden diabetes dikeluarkan dari data pelatihan. Dataset hasil preprocessing akan digunakan sebagai masukan bagi dua model yang dikembangkan secara terpisah, yaitu model klinis dan model kuesioner. Proses pengembangan model direncanakan meliputi pembagian dataset, pemilihan algoritma, pelatihan dan pengujian parameter, proses prediksi, dan evaluasi model. Zhang et al. (2024) membandingkan beberapa algoritma machine learning untuk mengidentifikasi prediabetes dan diabetes berdasarkan indikator kesehatan, sedangkan Riveros Perez dan Avella-Molano (2025) mengkaji penggunaan variabel gaya hidup pada data NHANES. Kedua penelitian tersebut menjadi acuan dalam penerapan metode klasifikasi pada GluCare.

3.3.1 Pembagian Dataset
Setiap dataset akan dibagi menjadi data training dan data testing dengan perbandingan 80:20 menggunakan metode stratified split. Metode ini mempertahankan proporsi kelas Normal dan Prediabetes pada kedua bagian data. Pembagian akan dilakukan dengan pengaturan acak yang tetap, sehingga hasilnya dapat diulang dengan pembagian yang sama. Berdasarkan perkiraan jumlah data pada Tabel 3.2, rencana pembagian dataset ditunjukkan pada Tabel 3.4.

Tabel 3. 4 Pembagian Dataset Training dan Testing
Jenis Data	Data Training (80%)	Data Testing (20%)
Data klinis	522	131
Data kuesioner	549	138

Pembagian akan dilakukan secara terpisah untuk setiap jenis data karena keduanya menggunakan fitur yang berbeda. Data testing akan disimpan dan tidak digunakan dalam pelatihan, pengujian parameter, maupun pemilihan model, sehingga hanya dipakai satu kali untuk evaluasi akhir.

3.3.2 Pemilihan Algoritma
Pemilihan algoritma dilakukan dengan mempertimbangkan karakteristik data klinis dan data kuesioner. Seluruh algoritma pada setiap jalur akan menggunakan dataset dan prosedur evaluasi yang sama, sehingga hasilnya dapat dibandingkan secara konsisten. Model terbaik akan ditentukan berdasarkan hasil pengujian, bukan hanya berdasarkan karakteristik teoretis algoritma.

a. Model Data Kuesioner
Pada data kuesioner akan dibandingkan empat algoritma, yaitu Logistic Regression, Random Forest, Gradient Boosting, dan XGBoost. Logistic Regression dengan regularisasi L2 akan digunakan sebagai model pembanding (baseline) karena pendekatannya sederhana, menghasilkan probabilitas, dan koefisiennya dapat diinterpretasikan. Random Forest dipilih karena mampu mempelajari hubungan nonlinier melalui kombinasi banyak pohon keputusan. Gradient Boosting membangun model secara bertahap dengan memperbaiki kesalahan prediksi dari tahap sebelumnya, sedangkan XGBoost merupakan pengembangan Gradient Boosting yang dilengkapi regularisasi untuk mengendalikan kompleksitas mode.

b. Model Data Klinis
Pada data klinis akan dibandingkan lima algoritma, yaitu keempat algoritma pada model kuesioner ditambah LightGBM. Logistic Regression dengan regularisasi L2 juga akan digunakan sebagai model pembanding. LightGBM ditambahkan untuk mengetahui apakah varian Gradient Boosting lain memberikan hasil yang berbeda pada data klinis yang seluruh fiturnya berupa angka hasil pengukuran.

c. Alur Pemilihan dan Evaluasi Model
Pemilihan model akan dilakukan secara terpisah pada setiap jalur skrining. Setiap algoritma terlebih dahulu akan dievaluasi menggunakan stratified 5-fold cross-validation pada data training. Algoritma dengan rata-rata ROC-AUC validasi tertinggi kemudian dipilih sebagai model terbaik. ROC-AUC digunakan sebagai metrik utama karena tidak bergantung pada satu ambang klasifikasi, sedangkan rata-rata F1-Score dan Recall validasi turut dilaporkan sebagai pembanding. Model terpilih selanjutnya akan dilatih ulang menggunakan seluruh data training, lalu diuji satu kali pada data testing untuk memperoleh performa akhir. Dengan alur ini, data testing tidak memengaruhi pemilihan model, sehingga performa yang dilaporkan menggambarkan kemampuan model pada data yang belum pernah digunakan sebelumnya.

3.3.3 Pelatihan dan Pengujian Parameter Model
Pelatihan model akan dilakukan menggunakan data training. Pada tahap ini, setiap algoritma mempelajari hubungan antara fitur masukan dan label Normal atau Prediabetes. Setiap algoritma memiliki parameter yang dapat memengaruhi hasil klasifikasi, sehingga pengujian parameter direncanakan untuk menemukan konfigurasi yang sesuai dengan karakteristik masing-masing dataset. Pengujian parameter akan dilakukan dengan mencoba beberapa kombinasi nilai dan menilai setiap kombinasi menggunakan stratified 5-fold cross-validation pada data training. Parameter yang direncanakan untuk diuji ditunjukkan pada Tabel 3.5.

Tabel 3. 5 Parameter Pengujian Algoritma Machine Learning
Algoritma	Parameter yang Diuji	Tujuan Pengujian
Logistic Regression	Tingkat pembatasan model (regularisasi)	Menjaga agar model tidak terlalu menghafal data latih, tetapi tetap cukup baik dalam mengenali pola
Random Forest	Jumlah pohon keputusan, kedalaman setiap pohon, dan jumlah data minimal di ujung pohon	Mencari ukuran model yang pas: cukup rinci untuk mengenali pola, tetapi tidak terlalu rumit sehingga hanya cocok untuk data latih
Gradient Boosting	Jumlah tahap perbaikan, besar perbaikan di setiap tahap (laju pembelajaran), dan kedalaman setiap pohon	Mengatur seberapa banyak dan seberapa cepat model memperbaiki kesalahannya secara bertahap
XGBoost	Jumlah tahap perbaikan, besar perbaikan di setiap tahap, kedalaman setiap pohon, serta porsi data dan fitur yang dipakai setiap pohon	Mengatur kerumitan model dan mencegah model terlalu bergantung pada sebagian data atau fitur tertentu
LightGBM	Jumlah tahap perbaikan, besar perbaikan di setiap tahap, kedalaman setiap pohon, dan jumlah cabang akhir pohon	Mengatur kerumitan model agar sesuai dengan ukuran data klinis

Parameter pada Tabel 3.5 merupakan rencana awal dan dapat disesuaikan selama proses pengembangan. Karena dataset berukuran relatif kecil, kedalaman pohon akan dibatasi agar model tidak terlalu menyesuaikan diri dengan data training.

Proporsi kelas pada kedua dataset diperkirakan tidak seimbang, yaitu sekitar 62% Normal dan 38% Prediabetes. Untuk mengurangi kecenderungan model memprediksi kelas mayoritas, pembobotan kelas akan diterapkan agar kelas Prediabetes mendapat bobot lebih besar saat pelatihan. Selain itu, model terpilih akan dikalibrasi agar nilai probabilitas yang ditampilkan di aplikasi lebih sesuai dengan proporsi kejadian sebenarnya.

Khusus pada model klinis, GDP akan digunakan sebagai fitur sekaligus sebagai salah satu dasar penentuan label. Kondisi ini berpotensi menimbulkan kebocoran informasi label (target leakage), karena responden dengan GDP 100–125 mg/dL otomatis berlabel Prediabetes. Untuk menilai pengaruhnya, performa model akan dibandingkan antara versi yang menggunakan fitur GDP dan versi tanpa fitur GDP. Selain itu, model akan dievaluasi pada kelompok responden dengan GDP di bawah 100 mg/dL, yaitu kelompok yang labelnya hanya dapat ditentukan dari HbA1c. Hasil kedua analisis tersebut akan digunakan untuk menafsirkan performa model klinis secara lebih tepat.

3.3.4 Proses Prediksi
Setelah dilatih, model akan digunakan untuk memprediksi kategori Normal atau Prediabetes berdasarkan data yang dimasukkan pengguna. Pada jalur klinis, pengguna akan memasukkan hasil pemeriksaan kesehatan sesuai dengan fitur model, sedangkan nilai MAP dan rasio TG/HDL akan dihitung secara otomatis oleh sistem. Pada jalur kuesioner, pengguna akan menjawab pertanyaan mengenai karakteristik individu, riwayat kesehatan, dan kebiasaan sehari-hari. Jawaban tersebut kemudian diubah ke bentuk yang sama dengan data pelatihan, misalnya nilai IMT diubah menjadi kategori IMT.

Hasil prediksi model berupa kelas Normal atau Prediabetes beserta probabilitasnya. Pada aplikasi, hasil tersebut ditampilkan dalam bentuk tingkat risiko yang lebih mudah dipahami pengguna, yaitu Risiko Rendah untuk kelas Normal dan Risiko Sedang untuk kelas Prediabetes. Pada jalur klinis, apabila nilai GDP yang dimasukkan mencapai 126 mg/dL atau lebih, sistem menampilkan Risiko Tinggi sebagai peringatan kemungkinan diabetes sesuai kriteria ADA. Kategori ini berasal dari aturan klinis, bukan dari prediksi model.

Nilai probabilitas tidak menunjukkan tingkat kepastian diagnosis medis. Hasil klasifikasi akan digunakan untuk menyesuaikan rekomendasi dalam program intervensi gaya hidup selama 90 hari. Hasil prediksi berfungsi sebagai informasi skrining awal dan tidak menggantikan pemeriksaan maupun diagnosis oleh tenaga kesehatan.

3.3.5 Evaluasi Model
Evaluasi akan dilakukan untuk mengetahui kemampuan model dalam mengklasifikasikan data ke dalam kategori Normal dan Prediabetes. Evaluasi akhir akan menggunakan data testing yang tidak terlibat dalam pelatihan, pengujian parameter, maupun pemilihan model. Metrik yang akan digunakan ditunjukkan pada Tabel 3.6.

Tabel 3. 6 Metrik Evaluasi Model Machine Learning
Metrik	Tujuan Pengukuran	Kegunaan dalam GluCare
Accuracy	Mengukur proporsi seluruh prediksi yang benar, baik Normal maupun Prediabetes	Memberikan gambaran umum ketepatan model. Namun, karena jumlah responden Normal lebih banyak, nilai Accuracy bisa tetap tinggi meskipun model sering gagal mengenali Prediabetes, sehingga tidak dapat digunakan sendiri.
Precision	Mengukur seberapa banyak hasil Prediabetes dari model yang memang benar Prediabetes	Menunjukkan seberapa sering sistem memberi peringatan yang tepat. Precision yang rendah berarti banyak pengguna sehat yang mendapat hasil Prediabetes, sehingga mereka bisa cemas tanpa alasan atau melakukan pemeriksaan yang tidak perlu.
Recall	Mengukur seberapa banyak responden Prediabetes yang berhasil dikenali oleh model	Metrik yang paling penting untuk skrining. Recall yang rendah berarti banyak pengguna yang sebenarnya Prediabetes justru mendapat hasil Normal, sehingga mereka tidak menyadari risikonya dan tidak melakukan tindak lanjut.
F1-Score	Menggabungkan Precision dan Recall menjadi satu nilai	Digunakan untuk menilai keseimbangan model. Nilai F1 yang tinggi berarti model mampu mengenali sebagian besar kasus Prediabetes tanpa terlalu banyak memberi peringatan yang salah.
ROC-AUC	Mengukur kemampuan model membedakan responden Normal dan Prediabetes pada berbagai ambang	Digunakan sebagai metrik utama untuk memilih model terbaik, karena tidak bergantung pada satu ambang tertentu. Nilai ini juga membantu menentukan ambang probabilitas yang akan dipakai aplikasi.
Confusion Matrix	Menampilkan jumlah prediksi benar dan salah pada setiap kelas	Menunjukkan jenis kesalahan yang dibuat model, yaitu berapa pengguna Prediabetes yang terlewat (false negative) dan berapa pengguna Normal yang salah diberi peringatan (false positive). Informasi ini digunakan untuk menilai apakah kesalahan model masih dapat diterima untuk tujuan skrining.

Perhitungan metrik evaluasi didasarkan pada komponen confusion matrix, yaitu True Positive (TP) sebagai responden Prediabetes yang diprediksi Prediabetes, True Negative (TN) sebagai responden Normal yang diprediksi Normal, False Positive (FP) sebagai responden Normal yang diprediksi Prediabetes, dan False Negative (FN) sebagai responden Prediabetes yang diprediksi Normal. Nilai Accuracy, Precision, Recall, dan F1-Score dihitung menggunakan Persamaan (3.4) sampai Persamaan (3.7).

$$Accuracy = \frac{TP + TN}{TP + TN + FP + FN} \quad (3.4)$$

$$Precision = \frac{TP}{TP + FP} \quad (3.5)$$

$$Recall = \frac{TP}{TP + FN} \quad (3.6)$$

$$F1\text{-}Score = 2 \times \frac{Precision \times Recall}{Precision + Recall} \quad (3.7)$$

Penggunaan beberapa metrik diperlukan karena Accuracy saja belum tentu menggambarkan kemampuan model dalam mengenali setiap kelas, terutama pada data yang tidak seimbang. Confusion Matrix akan digunakan untuk melihat jumlah responden Prediabetes yang salah diklasifikasikan sebagai Normal (false negative) maupun sebaliknya. Pada konteks skrining awal, Recall kelas Prediabetes mendapat perhatian khusus karena false negative berarti responden yang berisiko tidak terdeteksi. Metrik akan dilaporkan pada ambang klasifikasi yang digunakan aplikasi, sehingga performa yang dilaporkan sesuai dengan perilaku sistem yang sebenarnya.

Hasil evaluasi setiap jalur akan dilaporkan secara terpisah. Hasil evaluasi akhir akan dicantumkan setelah proses pelatihan dan pengujian model dilaksanakan, dan menjadi dasar untuk menentukan model yang diintegrasikan ke dalam aplikasi GluCare.
