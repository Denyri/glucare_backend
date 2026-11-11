# Perubahan Database GluCare (Lama → Rancangan Baru)

Dokumen ini menjadi acuan migrasi saat aplikasi dikembangkan ulang. ERD rancangan baru ada di `ER_Diagram_Aplikasi.drawio`.

## Ringkasan

Jumlah tabel berkurang dari 15 menjadi 11. Data program dipisahkan dari `users`, penyimpanan streak dijadikan satu, tabel skrining yang dobel digabung, dan tabel yang tidak dipakai dihapus.

## Pemetaan Tabel

| Tabel Lama | Tindakan | Tabel Baru | Catatan |
|---|---|---|---|
| users | Dipertahankan | users | Kolom `plan_start_date`, `sleep_target_hours`, `walking_target_minutes`, `nutrition_goal`, `current_streak`, `best_streak` pindah ke `programs`. Kolom `xp` tetap dipertahankan. Kolom `google_id` ditambah untuk login Google. |
| forget_password | Dipertahankan | forget_password | Tidak berubah. |
| analysis_results | Dipertahankan | analysis_results | Kolom JSON `result_data` dipecah menjadi `score`, `risk_level`, `risk_factors`, `recommendation`. Data masukan dipindah ke `questionnaire_data` atau `clinical_data`. |
| questionnaires, questionnaire_assessments | Digabung | questionnaire_data | Kolom disesuaikan dengan 12 fitur model kuesioner dan dihubungkan ke `analysis_results`. Kolom lama yang tidak dipakai model (`makanan_manis`, `gejala_diabetes`, `jam_tidur`, `tingkat_stress`, `cta`) dihapus. |
| lab_results | Diganti | clinical_data | Kolom `hba1c`, `riwayat_keluarga`, `riwayat_diabetes` dihapus. Kolom ditambah sesuai 12 fitur model klinis beserta `height`. Dihubungkan ke `analysis_results`. |
| — | Baru | programs | Menyimpan program 90 hari: tanggal mulai, target, streak, dan status. Terhubung ke `users` dan `analysis_results`. |
| daily_tracking, daily_logs | Digabung | daily_tracking | Kolom `xp_gained` tetap dipertahankan. FK diganti dari `user_id` menjadi `program_id`. |
| glucose_tracking | Dipertahankan | glucose_tracking | FK diganti dari `user_id` menjadi `program_id`. |
| ai_evaluations | Dipertahankan | ai_evaluations | FK diganti dari `user_id` menjadi `program_id`. Kolom `raw_data` dihapus. |
| user_achievements | Dipertahankan | user_achievements | Tidak berubah. |
| notifications | Dipertahankan | notifications | Kolom `icon`, `color`, `bg_color` dihapus (diatur di tampilan). Kolom `is_read` ditambah. |
| user_streaks, streak_activity_logs | Dihapus | — | Streak cukup disimpan di `programs`. Tipe `user_id` di tabel lama juga tidak cocok dengan `users.id`. |
| contact_us | Dihapus | — | Tidak termasuk kebutuhan fungsional. |

## Relasi

| Tabel | Relasi | Tabel | Kardinalitas |
|---|---|---|---|
| users | performs | analysis_results | 1 : N |
| analysis_results | has | questionnaire_data | 1 : 1 |
| analysis_results | has | clinical_data | 1 : 1 |
| analysis_results | based_on | programs | 1 : 1 |
| users | joins | programs | 1 : N |
| programs | records | daily_tracking | 1 : N |
| programs | records | glucose_tracking | 1 : N |
| programs | generates | ai_evaluations | 1 : N |
| users | receives | notifications | 1 : N |
| users | earns | user_achievements | 1 : N |
| users | requests | forget_password | 1 : N |
