# 3.4.8 ER Diagram

Entity Relationship Diagram (ERD) digunakan untuk menggambarkan rancangan basis data aplikasi GluCare, yang meliputi entitas, atribut, dan relasi antarentitas. ERD pada Gambar 3.x disusun menggunakan notasi Chen, yaitu entitas digambarkan dengan persegi panjang, atribut dengan elips, relasi dengan belah ketupat, dan primary key ditandai dengan garis bawah. Basis data GluCare terdiri atas sebelas entitas yang saling terhubung untuk mendukung proses akun pengguna, skrining risiko prediabetes, dan Program Intervensi 90 Hari.

**Gambar 3.x ER Diagram Aplikasi GluCare**

*(sisipkan gambar dari ER_Diagram_Aplikasi.drawio)*

Entitas users menjadi pusat relasi pada basis data GluCare. Satu pengguna dapat melakukan banyak skrining, mengikuti banyak program intervensi, menerima banyak notifikasi, meraih banyak lencana, dan mengajukan beberapa kali permintaan reset kata sandi, sehingga relasinya bersifat satu ke banyak (1:N). Setiap hasil skrining memiliki satu data masukan sesuai metode yang dipilih, yaitu data kuesioner atau data klinis, dengan relasi satu ke satu (1:1). Satu hasil skrining juga dapat menjadi dasar satu program intervensi (1:1). Selanjutnya, satu program mencatat banyak catatan misi harian, banyak catatan glukosa darah puasa, dan beberapa hasil evaluasi, sehingga relasinya juga bersifat satu ke banyak (1:N).

Entitas **users** menyimpan data akun dan profil pengguna, yang terdiri atas id sebagai primary key, fullname, email, password yang disimpan dalam bentuk terenkripsi, google_id untuk login dengan akun Google, gender, birth_date, phone, profile_image, is_completed sebagai penanda kelengkapan profil, xp sebagai total poin pengalaman, dan created_at.

Entitas **forget_password** menyimpan kode OTP untuk reset kata sandi. Atributnya meliputi id, user_id sebagai foreign key ke users, otp, expires_at sebagai batas waktu berlaku kode, is_used sebagai penanda kode sudah digunakan, dan created_at.

Entitas **analysis_results** menyimpan hasil skrining dari model AI. Atributnya meliputi id, user_id, mode yang menunjukkan metode skrining (kuesioner atau klinis), score sebagai skor risiko, risk_level sebagai tingkat risiko, risk_factors sebagai faktor yang memengaruhi hasil, recommendation sebagai saran tindak lanjut, dan created_at.

Entitas **questionnaire_data** menyimpan jawaban kuesioner gaya hidup yang menjadi masukan model kuesioner. Atributnya meliputi id, analysis_id sebagai foreign key ke analysis_results, age_band, gender, bmi_category, waist_category, hypertension, diabetes_history, prediabetes_told, prediabetes_history, physically_active, sedentary_hours, current_smoker, dan poor_diet.

Entitas **clinical_data** menyimpan data hasil pemeriksaan kesehatan yang menjadi masukan model klinis. Atributnya meliputi id, analysis_id, age, gender, weight, height, bmi, waist_cm, bp_systolic, bp_diastolic, map_pressure, glucose_fasting, hdl, triglycerides, dan tg_hdl_ratio. Nilai bmi, map_pressure, dan tg_hdl_ratio dihitung otomatis oleh sistem dari data yang dimasukkan pengguna.

Entitas **programs** menyimpan data Program Intervensi 90 Hari yang diikuti pengguna. Atributnya meliputi id, user_id, analysis_id sebagai hasil skrining yang menjadi dasar program, start_date, sleep_target_hours, walking_target_minutes, nutrition_goal, current_streak, best_streak, dan status program (berjalan, selesai, atau dibatalkan).

Entitas **daily_tracking** menyimpan catatan misi harian pengguna selama program. Atributnya meliputi id, program_id sebagai foreign key ke programs, day_index sebagai hari ke- dalam program, sleep_hours, walking_minutes, nutrition_score, xp_gained sebagai poin yang diperoleh pada hari tersebut, dan created_at.

Entitas **glucose_tracking** menyimpan hasil pengukuran glukosa darah puasa yang dicatat mandiri oleh pengguna. Atributnya meliputi id, program_id, day_index, glucose_value dalam satuan mg/dL, dan created_at.

Entitas **ai_evaluations** menyimpan hasil evaluasi AI pada hari ke-30 dan ke-90 program. Atributnya meliputi id, program_id, day_milestone yang bernilai 30 atau 90, score, risk_level, summary sebagai ringkasan perkembangan, recommendation sebagai saran lanjutan, dan created_at.

Entitas **notifications** menyimpan notifikasi untuk pengguna, seperti pengingat misi harian. Atributnya meliputi id, user_id, title, body sebagai isi pesan, is_read sebagai penanda notifikasi sudah dibaca, dan created_at.

Entitas **user_achievements** menyimpan lencana yang diraih pengguna selama mengikuti program. Atributnya meliputi id, user_id, achievement_code sebagai kode lencana, dan created_at.
