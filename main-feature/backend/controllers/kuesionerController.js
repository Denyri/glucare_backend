const db = require("../config/db");
const axios = require("axios");

const submitKuesioner = async (req, res) => {
    try {
        const { 
            user_id, bmi_category, waist_category, hypertension, overweight_history,
        } = req.body;

        if (!user_id ||
            bmi_category === undefined ||
            waist_category === undefined ||
            hypertension === undefined ||
            overweight_history === undefined
        ) {
            return res.status(400).json({ message: "Semua field (selain umur dan gender) wajib diisi" });
        }

        // 1. Ambil data user dari database
        const sqlUser = "SELECT birth_date, gender FROM users WHERE id = ?";
        db.query(sqlUser, [user_id], async (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Gagal mengambil data user dari database" });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "User tidak ditemukan" });
            }

            const user = results[0];

            // 2. Hitung umur (Age) dari birth_date
            if (!user.birth_date) {
                return res.status(400).json({ message: "Data tanggal lahir user belum lengkap di profil" });
            }

            const birthDate = new Date(user.birth_date);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // 3. Mapping umur ke age_band sesuai kamus data AI lama:
            // 0: 20-29 Tahun (atau dibawah 30)
            // 1: 30-39 Tahun
            // 2: 40+ Tahun
            let age_band = 0;
            if (age < 30) {
                age_band = 0;
            } else if (age >= 30 && age <= 39) {
                age_band = 1;
            } else {
                age_band = 2;
            }

            // 4. Pastikan gender menjadi integer
            let gender = parseInt(user.gender);
            if (isNaN(gender)) {
                // Jika di DB disave sebagai teks 'L' atau 'P' dsb.
                // Misal: 0 = Perempuan, 1 = Laki-laki (SESUAIKAN DENGAN AI)
                gender = (user.gender === 'L' || user.gender === 'Laki-laki') ? 1 : 0; 
            }

            const payload = {
                age_band: age_band,
                gender: gender,
                bmi_category: parseInt(bmi_category),
                waist_category: parseInt(waist_category),
                hypertension: parseInt(hypertension),
                overweight_history: parseInt(overweight_history),
            };

            console.log("Payload Questionnaire AI:", payload);

            try {
                // 5. Kirim data ke AI
                const aiResponse = await axios.post(
                    "https://itzvynn-glucare-backend.hf.space/predict/questionnaire",
                    payload,
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                const aiResult = aiResponse.data;
                console.log("Response Questionnaire AI:", aiResult);

                let cta = "";
                switch (aiResult.risk_level?.toLowerCase()) {
                    case "low":
                        cta = "Pertahankan pola hidup sehat dan lakukan evaluasi secara berkala.";
                        break;
                    case "medium":
                        cta = "Disarankan melakukan pemeriksaan laboratorium untuk analisis lebih lanjut";
                        break;
                    default:
                        cta = "Lakukan pemantauan kesehatan secara berkala";
                }

                // 6. Simpan hasil ke database
                const sqlInsert = `
                    INSERT INTO questionnaire_assessments (
                        user_id, age_band, gender, bmi_category, waist_category, hypertension,
                        overweight_history, risk_level, cta
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    user_id, age_band, gender, bmi_category, waist_category, hypertension,
                    overweight_history, aiResult.risk_level, cta, 
                ];

                db.query(sqlInsert, values, (err, result) => {
                    if (err) {
                        console.error("Database Error (Insert):", err);
                        return res.status(500).json({ message: "Gagal menyimpan hasil kuesioner" });
                    }

                    const finalPayload = {
                        assessment_id: result.insertId,
                        risk_level: aiResult.risk_level,
                        cta: cta,
                        mode: "questionnaire",
                        aiResult: aiResult,
                        answers: req.body
                    };

                    const sqlUpsertAnalysis = `
                        INSERT INTO analysis_results (user_id, mode, result_data)
                        VALUES (?, 'questionnaire', ?)
                        ON DUPLICATE KEY UPDATE
                            mode = VALUES(mode),
                            result_data = VALUES(result_data)
                    `;
                    
                    db.query(sqlUpsertAnalysis, [user_id, JSON.stringify(finalPayload)], (errAnalysis) => {
                        if (errAnalysis) console.error("Gagal simpan analysis_results (Kuesioner):", errAnalysis.message);
                    });

                    return res.status(201).json(finalPayload);           
                });
            } catch (error) {
                console.error("Questionnaire AI Error:", JSON.stringify(error.response?.data, null, 2));
                return res.status(500).json({
                    message: "Gagal melakukan prediksi AI",
                    error: error.response?.data,
                });
            }
        });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

const getKuesioner = (req, res) => {
    const { user_id } = req.params;

    const sql = "SELECT * FROM questionnaire_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";

    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data kuesioner" });
        if (results.length === 0) return res.status(404).json({ message: "Data kuesioner belum ada" });
        
        res.status(200).json(results[0]);
    });
};

module.exports = { submitKuesioner, getKuesioner };
