# 3.4.7 Skenario Use Case

Skenario use case menjelaskan langkah-langkah interaksi antara pengguna dan sistem pada setiap use case di Gambar 3.2. Alur utama adalah langkah ketika semua berjalan lancar, sedangkan alternative flow adalah langkah ketika terjadi kondisi lain. Nomor alternative flow menunjuk ke langkah alur utama, misalnya 4a berarti kondisi lain pada langkah 4.

---

**Tabel 3.9 Skenario Use Case Registrasi Akun**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Registrasi Akun |
| Aktor | Pengguna |
| Deskripsi | Pengguna membuat akun baru dan melengkapi data profil. |
| Kondisi Awal | Pengguna belum memiliki akun dan berada di halaman registrasi. |
| Alur Utama | 1. Pengguna mengisi nama lengkap, email, dan kata sandi, lalu menyetujui kebijakan privasi dan syarat layanan.<br>2. Pengguna menekan tombol Daftar.<br>3. Sistem memeriksa data dan memastikan email belum terdaftar.<br>4. Sistem menyimpan akun baru dan menampilkan formulir data profil.<br>5. Pengguna mengisi jenis kelamin, tanggal lahir, dan nomor telepon, lalu menekan tombol Simpan.<br>6. Sistem menyimpan data profil dan menampilkan halaman pilihan metode skrining. |
| Alternative Flow | 1a. Pengguna memilih daftar dengan akun Google: sistem memverifikasi akun Google, lalu lanjut ke langkah 4.<br>3a. Data belum lengkap, persetujuan belum diberikan, atau kata sandi tidak sesuai ketentuan: sistem menampilkan pesan kesalahan.<br>3b. Email sudah terdaftar: sistem menampilkan pesan bahwa email sudah digunakan.<br>5a. Data profil belum lengkap: sistem menampilkan pesan bahwa semua data wajib diisi. |
| Kondisi Akhir | Akun dan data profil tersimpan. |

---

**Tabel 3.10 Skenario Use Case Login**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Login |
| Aktor | Pengguna |
| Deskripsi | Pengguna masuk ke aplikasi menggunakan email dan kata sandi atau akun Google. |
| Kondisi Awal | Pengguna sudah memiliki akun dan berada di halaman login. |
| Alur Utama | 1. Pengguna mengisi email dan kata sandi, lalu menekan tombol Masuk.<br>2. Sistem memverifikasi email dan kata sandi.<br>3. Sistem menampilkan halaman beranda. |
| Alternative Flow | 1a. Pengguna memilih login dengan akun Google: sistem memverifikasi akun Google, lalu lanjut ke langkah 3.<br>1b. Pengguna lupa kata sandi: sistem menjalankan use case Reset Kata Sandi.<br>2a. Email atau kata sandi salah: sistem menampilkan pesan kesalahan.<br>3a. Data profil belum lengkap: sistem menampilkan formulir data profil.<br>3b. Pengguna belum pernah skrining: sistem menampilkan halaman pilihan metode skrining. |
| Kondisi Akhir | Pengguna berhasil masuk ke aplikasi. |

---

**Tabel 3.11 Skenario Use Case Kelola Profil**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Kelola Profil |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat dan mengubah data profil serta foto profil. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka menu edit profil.<br>2. Sistem menampilkan data profil pengguna.<br>3. Pengguna mengubah data, lalu menekan tombol Simpan.<br>4. Sistem menyimpan perubahan dan menampilkan pesan berhasil. |
| Alternative Flow | 2a. Email hanya ditampilkan dan tidak dapat diubah karena digunakan untuk login dan reset kata sandi.<br>3a. Pengguna membatalkan perubahan: sistem kembali ke halaman sebelumnya tanpa menyimpan.<br>4a. Data wajib kosong atau format foto tidak didukung: sistem menampilkan pesan kesalahan. |
| Kondisi Akhir | Data profil tersimpan dengan perubahan terbaru. |

---

**Tabel 3.12 Skenario Use Case Pilih Metode Skrining**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Pilih Metode Skrining |
| Aktor | Pengguna |
| Deskripsi | Pengguna memilih metode skrining sesuai data yang dimiliki. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka menu analisis.<br>2. Sistem menampilkan pernyataan bahwa hasil skrining bukan diagnosis medis.<br>3. Pengguna menyetujui pernyataan tersebut.<br>4. Sistem menampilkan pilihan skrining kuesioner dan skrining data klinis.<br>5. Pengguna memilih skrining kuesioner dan sistem menjalankan use case Isi Kuesioner Gaya Hidup. |
| Alternative Flow | 3a. Pengguna tidak menyetujui pernyataan: sistem tidak menampilkan pilihan metode.<br>5a. Pengguna memilih skrining data klinis: sistem menjalankan use case Input Data Klinis. |
| Kondisi Akhir | Sistem menampilkan halaman skrining sesuai metode yang dipilih. |

---

**Tabel 3.13 Skenario Use Case Isi Kuesioner Gaya Hidup**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Isi Kuesioner Gaya Hidup |
| Aktor | Pengguna |
| Deskripsi | Pengguna menjawab pertanyaan tentang data diri, riwayat kesehatan, dan kebiasaan hidup untuk mengetahui risiko prediabetes tanpa data laboratorium. |
| Kondisi Awal | Pengguna sudah memilih skrining kuesioner. |
| Alur Utama | 1. Sistem menampilkan pertanyaan kuesioner.<br>2. Pengguna menjawab pertanyaan tentang usia, jenis kelamin, IMT, lingkar pinggang, riwayat hipertensi, riwayat diabetes, riwayat prediabetes, aktivitas fisik, lama duduk, kebiasaan merokok, dan pola makan, lalu menekan tombol Kirim.<br>3. Sistem mengirim jawaban ke AI untuk diproses.<br>4. Sistem menyimpan hasil dan menjalankan use case Lihat Hasil Skrining AI. |
| Alternative Flow | 2a. Masih ada pertanyaan yang belum dijawab: sistem meminta pengguna menjawabnya terlebih dahulu.<br>3a. AI tidak dapat diakses: sistem menampilkan pesan kesalahan dan meminta pengguna mencoba lagi. |
| Kondisi Akhir | Hasil skrining kuesioner tersimpan. |

---

**Tabel 3.14 Skenario Use Case Input Data Klinis**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Input Data Klinis |
| Aktor | Pengguna |
| Deskripsi | Pengguna memasukkan data hasil pemeriksaan kesehatan untuk mengetahui risiko prediabetes. |
| Kondisi Awal | Pengguna sudah memilih skrining data klinis. |
| Alur Utama | 1. Sistem menampilkan formulir data klinis, dengan usia dan jenis kelamin diambil dari data profil.<br>2. Pengguna mengisi glukosa darah puasa, berat badan, tinggi badan, lingkar pinggang, tekanan darah sistolik dan diastolik, HDL, dan trigliserida, lalu menekan tombol Analisis.<br>3. Sistem memeriksa data, lalu menghitung IMT, MAP, dan rasio TG/HDL.<br>4. Sistem mengirim data ke AI untuk diproses.<br>5. Sistem menyimpan hasil dan menjalankan use case Lihat Hasil Skrining AI. |
| Alternative Flow | 3a. Data kosong atau tidak wajar: sistem menampilkan pesan kesalahan pada kolom terkait.<br>4a. AI tidak dapat diakses: sistem menampilkan pesan kesalahan dan meminta pengguna mencoba lagi. |
| Kondisi Akhir | Hasil skrining klinis tersimpan. |

---

**Tabel 3.15 Skenario Use Case Lihat Hasil Skrining AI**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Hasil Skrining AI |
| Aktor | Pengguna |
| Deskripsi | Sistem menampilkan hasil skrining dari AI beserta rekomendasi program. |
| Kondisi Awal | Data skrining sudah diproses oleh AI. |
| Alur Utama | 1. Sistem menampilkan skor dan tingkat risiko (Risiko Rendah atau Risiko Sedang), faktor yang memengaruhi hasil, serta saran tindak lanjut.<br>2. Sistem menampilkan rekomendasi target tidur, jalan kaki, dan nutrisi untuk program 90 hari.<br>3. Pengguna menekan tombol Mulai Program 90 Hari dan sistem menjalankan use case Mulai Program Intervensi 90 Hari. |
| Alternative Flow | 1a. Glukosa darah puasa pada skrining klinis 126 mg/dL atau lebih: sistem menampilkan Risiko Tinggi dan menyarankan pengguna berkonsultasi dengan tenaga kesehatan.<br>3a. Pengguna memilih kembali ke beranda atau skrining ulang: sistem menampilkan halaman yang dipilih. |
| Kondisi Akhir | Pengguna mengetahui tingkat risiko dan saran tindak lanjut. |

---

**Tabel 3.16 Skenario Use Case Mulai Program Intervensi 90 Hari**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Mulai Program Intervensi 90 Hari |
| Aktor | Pengguna |
| Deskripsi | Pengguna memulai program gaya hidup 90 hari dengan target sesuai hasil skrining. |
| Kondisi Awal | Pengguna sudah login dan memiliki hasil skrining. |
| Alur Utama | 1. Pengguna memilih mulai program 90 hari.<br>2. Sistem mendaftarkan pengguna ke program dengan target dari hasil skrining.<br>3. Sistem menampilkan rencana program berisi hari ke-, fase berjalan, dan target harian.<br>4. Sistem menampilkan tiga fase program, yaitu Stabilisasi Dasar (hari 1–30), Optimasi Metabolik (hari 31–60), dan Konsolidasi (hari 61–90). |
| Alternative Flow | 1a. Pengguna belum memiliki hasil skrining: sistem mengarahkan pengguna untuk skrining terlebih dahulu.<br>1b. Pengguna sudah memiliki program yang berjalan: sistem menampilkan program tersebut.<br>3a. Pengguna membatalkan program: sistem meminta konfirmasi, lalu menghentikan program. |
| Kondisi Akhir | Program 90 hari aktif. |

---

**Tabel 3.17 Skenario Use Case Catat Misi Harian**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Catat Misi Harian |
| Aktor | Pengguna |
| Deskripsi | Pengguna menandai misi tidur, jalan kaki, dan nutrisi yang sudah dijalankan hari ini. |
| Kondisi Awal | Pengguna sudah login dan memiliki program aktif. |
| Alur Utama | 1. Pengguna membuka menu misi harian.<br>2. Sistem menampilkan tiga misi hari ini beserta targetnya.<br>3. Pengguna menandai misi yang sudah dijalankan, lalu menekan tombol Simpan.<br>4. Sistem menyimpan catatan, menambahkan poin XP sesuai misi yang dijalankan, serta memperbarui progres dan streak. |
| Alternative Flow | 2a. Misi hari ini sudah dicatat: sistem menampilkan catatan yang tersimpan.<br>4a. Penyimpanan gagal: sistem menampilkan pesan kesalahan.<br>4b. Pengguna meraih lencana baru: sistem menampilkan pemberitahuan lencana. |
| Kondisi Akhir | Catatan misi harian tersimpan, serta poin XP, progres, dan streak diperbarui. |

---

**Tabel 3.18 Skenario Use Case Catat Glukosa Darah Puasa**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Catat Glukosa Darah Puasa |
| Aktor | Pengguna |
| Deskripsi | Pengguna mencatat hasil pengukuran glukosa darah puasa selama program. |
| Kondisi Awal | Pengguna sudah login dan memiliki program aktif. |
| Alur Utama | 1. Pengguna membuka menu catat glukosa darah puasa.<br>2. Pengguna mengisi nilai glukosa darah puasa (mg/dL), lalu menekan tombol Simpan.<br>3. Sistem memeriksa dan menyimpan nilai tersebut.<br>4. Sistem menampilkan umpan balik dan memperbarui progres. |
| Alternative Flow | 3a. Nilai kosong atau tidak wajar: sistem menampilkan pesan kesalahan.<br>4a. Nilai 126 mg/dL atau lebih: sistem menyarankan pengguna berkonsultasi dengan tenaga kesehatan. |
| Kondisi Akhir | Nilai glukosa darah puasa tersimpan. |

---

**Tabel 3.19 Skenario Use Case Lihat Dashboard Progres**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Dashboard Progres |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat ringkasan perkembangan selama program 90 hari. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka halaman beranda.<br>2. Sistem menampilkan status risiko terakhir, hari dan fase program, status misi hari ini, total poin XP, streak, serta lencana. |
| Alternative Flow | 2a. Pengguna belum skrining atau belum memulai program: sistem menampilkan ajakan untuk memulainya.<br>2b. Program sudah mencapai hari ke-30 atau ke-90: sistem menampilkan menu evaluasi dan menjalankan use case Lihat Evaluasi Hari ke-30 atau Lihat Evaluasi Hari ke-90. |
| Kondisi Akhir | Pengguna mengetahui perkembangan programnya. |

---

**Tabel 3.20 Skenario Use Case Lihat Evaluasi Hari ke-30**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Evaluasi Hari ke-30 |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat evaluasi perkembangan di akhir fase pertama program. |
| Kondisi Awal | Program sudah mencapai hari ke-30. |
| Alur Utama | 1. Pengguna memilih menu evaluasi hari ke-30 di dashboard progres.<br>2. Sistem mengirim catatan misi dan glukosa darah puasa selama 30 hari ke AI.<br>3. Sistem menyimpan dan menampilkan hasil evaluasi beserta saran untuk fase berikutnya. |
| Alternative Flow | 2a. Evaluasi sudah pernah dijalankan: sistem menampilkan hasil yang tersimpan.<br>3a. Evaluasi gagal diproses: sistem menampilkan pesan kesalahan dan meminta pengguna mencoba lagi. |
| Kondisi Akhir | Hasil evaluasi hari ke-30 tersimpan. |

---

**Tabel 3.21 Skenario Use Case Lihat Evaluasi Hari ke-90**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Evaluasi Hari ke-90 |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat evaluasi akhir setelah program 90 hari selesai. |
| Kondisi Awal | Program sudah mencapai hari ke-90. |
| Alur Utama | 1. Pengguna memilih menu evaluasi hari ke-90 di dashboard progres.<br>2. Sistem mengirim seluruh catatan misi dan glukosa darah puasa ke AI.<br>3. Sistem menyimpan dan menampilkan hasil evaluasi akhir.<br>4. Sistem menandai program selesai dan menyarankan skrining ulang. |
| Alternative Flow | 2a. Evaluasi sudah pernah dijalankan: sistem menampilkan hasil yang tersimpan.<br>3a. Evaluasi gagal diproses: sistem menampilkan pesan kesalahan dan meminta pengguna mencoba lagi. |
| Kondisi Akhir | Hasil evaluasi akhir tersimpan dan program selesai. |

---

**Tabel 3.22 Skenario Use Case Lihat Riwayat Skrining**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Riwayat Skrining |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat hasil skrining yang pernah dilakukan. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka menu riwayat skrining.<br>2. Sistem menampilkan daftar skrining beserta tanggal, metode, dan tingkat risiko.<br>3. Pengguna memilih salah satu riwayat dan sistem menampilkan detailnya. |
| Alternative Flow | 2a. Belum ada riwayat: sistem menampilkan pesan riwayat kosong. |
| Kondisi Akhir | Pengguna melihat riwayat skrining. |

---

**Tabel 3.23 Skenario Use Case Lihat Notifikasi**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Lihat Notifikasi |
| Aktor | Pengguna |
| Deskripsi | Pengguna melihat pengingat misi harian dan informasi program. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka menu notifikasi.<br>2. Sistem menampilkan daftar notifikasi terbaru.<br>3. Pengguna membuka notifikasi dan sistem menandainya sudah dibaca. |
| Alternative Flow | 2a. Belum ada notifikasi: sistem menampilkan pesan notifikasi kosong. |
| Kondisi Akhir | Notifikasi yang dibuka ditandai sudah dibaca. |

---

**Tabel 3.24 Skenario Use Case Logout**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Logout |
| Aktor | Pengguna |
| Deskripsi | Pengguna keluar dari aplikasi. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna memilih menu logout.<br>2. Sistem menampilkan konfirmasi logout.<br>3. Pengguna mengonfirmasi, lalu sistem mengakhiri sesi dan menampilkan halaman login. |
| Alternative Flow | 3a. Pengguna membatalkan: pengguna tetap di halaman sebelumnya. |
| Kondisi Akhir | Pengguna keluar dari aplikasi. |

---

**Tabel 3.25 Skenario Use Case Reset Kata Sandi**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Reset Kata Sandi |
| Aktor | Pengguna |
| Deskripsi | Pengguna mengatur ulang kata sandi menggunakan kode OTP yang dikirim ke email. |
| Kondisi Awal | Pengguna memilih menu lupa kata sandi di halaman login. |
| Alur Utama | 1. Pengguna memasukkan email akun.<br>2. Sistem mengirim kode OTP ke email tersebut.<br>3. Pengguna memasukkan kode OTP dan sistem memverifikasinya.<br>4. Pengguna memasukkan kata sandi baru dan konfirmasi kata sandi.<br>5. Sistem menyimpan kata sandi baru dan menampilkan halaman login. |
| Alternative Flow | 2a. Email tidak terdaftar: sistem menampilkan pesan kesalahan.<br>3a. Kode OTP salah atau kedaluwarsa: sistem menampilkan pesan kesalahan dan pengguna dapat meminta kode baru.<br>4a. Konfirmasi tidak sama atau kata sandi tidak sesuai ketentuan: sistem menampilkan pesan kesalahan. |
| Kondisi Akhir | Kata sandi baru tersimpan. |

---

**Tabel 3.26 Skenario Use Case Ubah Kata Sandi**

| Item | Deskripsi |
|---|---|
| Nama Use Case | Ubah Kata Sandi |
| Aktor | Pengguna |
| Deskripsi | Pengguna yang sudah login mengganti kata sandi akunnya. |
| Kondisi Awal | Pengguna sudah login. |
| Alur Utama | 1. Pengguna membuka menu ubah kata sandi.<br>2. Pengguna mengisi kata sandi lama, kata sandi baru, dan konfirmasi kata sandi, lalu menekan tombol Simpan.<br>3. Sistem memverifikasi kata sandi lama dan memeriksa kata sandi baru.<br>4. Sistem menyimpan kata sandi baru dan menampilkan pesan berhasil. |
| Alternative Flow | 3a. Kata sandi lama salah: sistem menampilkan pesan kesalahan.<br>3b. Konfirmasi tidak sama atau kata sandi baru tidak sesuai ketentuan: sistem menampilkan pesan kesalahan. |
| Kondisi Akhir | Kata sandi baru tersimpan. |
