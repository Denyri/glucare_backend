const axios = require("axios");
const db = require("../config/db");

const AI_BASE_URL = process.env.AI_BASE_URL || "https://itzvynn-glucare-backend.hf.space";

// ─────────────────────────────────────────────────────────────
// POST /api/ai/predict/clinical — Prediksi Mode Klinis / Lab
// ─────────────────────────────────────────────────────────────
const predictClinical = async (req, res) => {
    try {
        const {
            user_id,
            gula_darah_puasa,
            berat_badan,
            tinggi_badan,
            lingkar_pinggang,
            hdl,
            trigliserida,
            tekanan_sistolik,
            tekanan_diastolik,
            riwayat_keluarga,
            riwayat_diabetes
        } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID diperlukan" });
        }

        // ── Ambil profil user (usia & gender) dari database ──
        const [users] = await db.promise().query(
            "SELECT birth_date, gender FROM users WHERE id = ?",
            [user_id]
        );

        let age = 30; // default
        let gender = 1; // default Laki-laki

        if (users.length > 0) {
            const user = users[0];
            if (user.birth_date) {
                const birthYear = new Date(user.birth_date).getFullYear();
                const currentYear = new Date().getFullYear();
                age = currentYear - birthYear;
            }
            if (user.gender === "Perempuan") {
                gender = 0;
            }
        }

        // ── Hitung parameter turunan ──
        const bb = parseFloat(berat_badan) || 0;
        const tbM = (parseFloat(tinggi_badan) || 0) / 100;
        const bmi = tbM > 0 ? bb / (tbM * tbM) : 25;

        // Gunakan data dari form user (bukan default)
        const waist_cm = parseFloat(lingkar_pinggang) || 90;
        const hdlVal = parseFloat(hdl) || 50;
        const triglycerides = parseFloat(trigliserida) || 150;
        const bp_systolic = parseFloat(tekanan_sistolik) || 120;
        const bp_diastolic = parseFloat(tekanan_diastolik) || 80;

        const clinicalParams = {
            glucose_fasting: parseFloat(gula_darah_puasa) || 0,
            age: age,
            waist_cm: waist_cm,
            bmi: parseFloat(bmi.toFixed(2)),
            hdl: hdlVal,
            triglycerides: triglycerides,
            bp_systolic: bp_systolic,
            bp_diastolic: bp_diastolic,
            gender: gender,
            map_pressure: parseFloat(((bp_systolic + 2 * bp_diastolic) / 3).toFixed(2)),
            tg_hdl_ratio: parseFloat((triglycerides / hdlVal).toFixed(2))
        };

        console.log("[AI Clinical] Mengirim ke HuggingFace:", JSON.stringify(clinicalParams));

        // ── Panggil HuggingFace API ──
        const aiResponse = await axios.post(
            `${AI_BASE_URL}/predict/clinical`,
            clinicalParams,
            { timeout: 30000 }
        );

        const aiResult = aiResponse.data;
        console.log("[AI Clinical] Response dari HuggingFace:", JSON.stringify(aiResult));

        // ── Simpan data lab ke database ──
        const sqlInsert = `
            INSERT INTO lab_results (
                user_id, hba1c, gula_darah_puasa,
                berat_badan, tinggi_badan, riwayat_keluarga, riwayat_diabetes
            ) VALUES (?, 0, ?, ?, ?, ?, ?)
        `;

        db.query(sqlInsert, [
            user_id,
            parseFloat(gula_darah_puasa) || 0,
            bb,
            parseFloat(tinggi_badan) || 0,
            riwayat_keluarga || "",
            riwayat_diabetes || ""
        ], (err) => {
            if (err) console.error("[AI Clinical] Gagal simpan ke DB:", err.message);
        });

        // Simpan hasil prediksi AI ke database (Tabel analysis_results)
        const finalPayload = {
            mode: "clinical",
            aiResult: aiResult,
            clinicalParams: {
                ...clinicalParams,
                hba1c: parseFloat(hba1c) || 0,
                berat_badan: bb,
                tinggi_badan: parseFloat(tinggi_badan) || 0,
                riwayat_keluarga: riwayat_keluarga || "",
                riwayat_diabetes: riwayat_diabetes || ""
            },
            timestamp: new Date().toISOString()
        };

        const sqlUpsertAnalysis = `
            INSERT INTO analysis_results (user_id, mode, result_data)
            VALUES (?, 'clinical', ?)
            ON DUPLICATE KEY UPDATE
                mode = VALUES(mode),
                result_data = VALUES(result_data)
        `;
        db.query(sqlUpsertAnalysis, [user_id, JSON.stringify(finalPayload)], (err) => {
            if (err) console.error("[AI Clinical] Gagal simpan analysis_results:", err.message);
        });

        // ── Kembalikan response gabungan ──
        return res.status(200).json(finalPayload);

    } catch (error) {
        console.error("[AI Clinical] Error:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: "Gagal memproses prediksi klinis",
            error: error.response?.data || error.message
        });
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/ai/predict/questionnaire — Prediksi Mode Kuesioner
// ─────────────────────────────────────────────────────────────
const predictQuestionnaire = async (req, res) => {
    try {
        const { user_id, answers } = req.body;

        if (!user_id) {
            return res.status(400).json({ message: "User ID diperlukan" });
        }

        if (!answers || typeof answers !== "object") {
            return res.status(400).json({ message: "Jawaban kuesioner diperlukan" });
        }

        // ── Ambil gender dari profil user ──
        const [users] = await db.promise().query(
            "SELECT gender FROM users WHERE id = ?",
            [user_id]
        );

        let gender = 1; // default Laki-laki
        if (users.length > 0 && users[0].gender === "Perempuan") {
            gender = 0;
        }

        // ── Mapping jawaban ke parameter AI ──
        // Q0: Usia → age_band (0: 20-29, 1: 30-39, 2: 40+)
        const age_band = answers[0] === "20-29 Tahun" ? 0
            : answers[0] === "30-39 Tahun" ? 1
            : 2;

        // Q4: Lingkar pinggang → bmi_category & waist_category
        const waist_val = answers[4] === "Normal" ? 0
            : answers[4] === "Agak Besar" ? 1
            : 2;

        // Q4: Overweight history (jika pinggang besar)
        const overweight = waist_val === 2 ? 1 : 0;

        // Q7: Stress tinggi sebagai proksi hipertensi
        const hypertension = answers[7] === "Tinggi" ? 1 : 0;

        const questionnaireParams = {
            age_band: age_band,
            gender: gender,
            bmi_category: waist_val,
            waist_category: waist_val,
            hypertension: hypertension,
            overweight_history: overweight
        };

        console.log("[AI Kuesioner] Mengirim ke HuggingFace:", JSON.stringify(questionnaireParams));

        // ── Panggil HuggingFace API ──
        const aiResponse = await axios.post(
            `${AI_BASE_URL}/predict/questionnaire`,
            questionnaireParams,
            { timeout: 30000 }
        );

        const aiResult = aiResponse.data;
        console.log("[AI Kuesioner] Response dari HuggingFace:", JSON.stringify(aiResult));

        // ── Simpan jawaban ke database ──
        const sqlInsert = `
            INSERT INTO questionnaires (
                user_id, usia, riwayat_keluarga, olahraga,
                makanan_manis, lingkar_pinggang, gejala_diabetes,
                jam_tidur, tingkat_stress
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlInsert, [
            user_id,
            answers[0] || "",
            answers[1] || "",
            answers[2] || "",
            answers[3] || "",
            answers[4] || "",
            answers[5] || "",
            answers[6] || "",
            answers[7] || ""
        ], (err) => {
            if (err) console.error("[AI Kuesioner] Gagal simpan ke DB:", err.message);
        });

        // Simpan hasil prediksi AI ke database (Tabel analysis_results)
        const finalPayload = {
            mode: "questionnaire",
            aiResult: aiResult,
            answers: answers,
            timestamp: new Date().toISOString()
        };

        const sqlUpsertAnalysis = `
            INSERT INTO analysis_results (user_id, mode, result_data)
            VALUES (?, 'questionnaire', ?)
            ON DUPLICATE KEY UPDATE
                mode = VALUES(mode),
                result_data = VALUES(result_data)
        `;
        db.query(sqlUpsertAnalysis, [user_id, JSON.stringify(finalPayload)], (err) => {
            if (err) console.error("[AI Kuesioner] Gagal simpan analysis_results:", err.message);
        });

        // ── Kembalikan response gabungan ──
        return res.status(200).json(finalPayload);

    } catch (error) {
        console.error("[AI Kuesioner] Error:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            message: "Gagal memproses prediksi kuesioner",
            error: error.response?.data || error.message
        });
    }
};

// GET /api/ai/result/:userId - Mengambil hasil analisis terakhir
const getLatestAnalysisResult = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID diperlukan" });
        }

        const [results] = await db.promise().query(
            "SELECT mode, result_data, created_at FROM analysis_results WHERE user_id = ?",
            [userId]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Belum ada hasil analisis" });
        }

        const data = results[0];
        let payload = {};
        try {
            payload = typeof data.result_data === 'string' ? JSON.parse(data.result_data) : data.result_data;
        } catch(e) {
            payload = data.result_data;
        }

        return res.status(200).json({
            mode: data.mode,
            ...payload,
            saved_at: data.created_at
        });

    } catch (error) {
        console.error("[AI Result] Error:", error.message);
        return res.status(500).json({
            message: "Gagal mengambil hasil analisis",
            error: error.message
        });
    }
};

module.exports = { predictClinical, predictQuestionnaire, getLatestAnalysisResult };
