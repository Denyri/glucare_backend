const axios = require("axios");
const db = require("../config/db");

const AI_BASE_URL = process.env.AI_BASE_URL || "https://itzvynn-glucare-backend.hf.space";

// ─────────────────────────────────────────────────────────────
// UI Generators for Backend-Driven UI
// ─────────────────────────────────────────────────────────────
function generateClinicalUI(aiResult, clinicalParams) {
    let aiScore = 25;
    let riskLevel = "Normal";

    if (aiResult && aiResult.predict_proba) {
        let proba = aiResult.predict_proba;
        if (Array.isArray(proba) && proba.length > 0 && Array.isArray(proba[0])) {
            proba = proba[0];
        }
        if (Array.isArray(proba) && proba.length >= 3) {
            aiScore = Math.round((proba[1] + proba[2]) * 100);
        }
    }

    if (aiScore >= 60) riskLevel = "Diabetes";
    else if (aiScore >= 30) riskLevel = "Prediabetes";

    let riskStatus = "Rendah";
    let riskDescription = "Normal / Aman";
    let riskColor = "0xFF10B981"; // Green (Flutter format)

    if (riskLevel === "Diabetes") {
        riskStatus = "Tinggi";
        riskDescription = "Indikasi Diabetes";
        riskColor = "0xFFEF4444"; // Red
    } else if (riskLevel === "Prediabetes") {
        riskStatus = "Sedang";
        riskDescription = "Indikasi Prediabetes";
        riskColor = "0xFFF59E0B"; // Orange
    }

    let faktorRisiko = [];
    const gdpVal = clinicalParams.glucose_fasting || 0;
    const bmiVal = clinicalParams.bmi || 0;
    const tgHdl = clinicalParams.tg_hdl_ratio || 0;
    const sistolikVal = clinicalParams.bp_systolic || 0;
    const diastolikVal = clinicalParams.bp_diastolic || 0;
    const lingkarPinggang = clinicalParams.waist_cm || 0;

    if (gdpVal >= 126) faktorRisiko.push({ text: `Gula Darah Puasa (${Math.round(gdpVal)} mg/dL) mengindikasikan level Diabetes.`, isWarning: true });
    else if (gdpVal >= 100) faktorRisiko.push({ text: `Gula Darah Puasa (${Math.round(gdpVal)} mg/dL) berada di zona Prediabetes.`, isWarning: true });

    if (bmiVal >= 27.5) faktorRisiko.push({ text: `Kategori BMI Obesitas (${bmiVal.toFixed(1)}) meningkatkan risiko metabolik secara signifikan.`, isWarning: true });
    else if (bmiVal >= 23) faktorRisiko.push({ text: `Kategori BMI Overweight (${bmiVal.toFixed(1)}) memicu risiko metabolik.`, isWarning: true });

    if (tgHdl >= 3) faktorRisiko.push({ text: `Rasio TG/HDL tinggi (${tgHdl.toFixed(1)}) mengindikasikan kemungkinan resistensi insulin.`, isWarning: true });
    if (sistolikVal >= 130 || diastolikVal >= 85) faktorRisiko.push({ text: `Tekanan darah (${Math.round(sistolikVal)}/${Math.round(diastolikVal)} mmHg) berada di atas rentang optimal.`, isWarning: true });

    if (lingkarPinggang > 90) faktorRisiko.push({ text: `Lingkar pinggang (${Math.round(lingkarPinggang)} cm) berisiko tinggi.`, isWarning: true });

    if (faktorRisiko.length === 0) faktorRisiko.push({ text: 'Tidak ada parameter klinis spesifik yang memicu risiko tinggi.', isWarning: false });

    let insight = "Analisis AI menunjukkan metabolisme glukosa dan parameter kesehatan Anda dalam rentang optimal. Pertahankan gaya hidup sehat untuk pencegahan jangka panjang.";
    if (riskLevel === "Diabetes") {
        insight = "Analisis AI mendeteksi parameter yang mengarah pada intoleransi glukosa atau diabetes. Intervensi gaya hidup terstruktur dan pendampingan rutin disarankan untuk mengendalikan glukosa darah.";
    } else if (riskLevel === "Prediabetes") {
        insight = "Analisis AI mendeteksi tanda dini resistensi insulin (Prediabetes). Anda berada di fase emas: dengan Program 90 Hari menjaga pola tidur, aktivitas fisik, dan nutrisi, kadar gula darah sangat berpeluang kembali normal.";
    }

    return {
        score: aiScore,
        riskLevel: riskLevel,
        riskStatus: riskStatus,
        riskDescription: riskDescription,
        riskColor: riskColor,
        faktorRisiko: faktorRisiko,
        insight: aiResult?.insight || aiResult?.explanation || aiResult?.summary || insight,
        cta: aiResult?.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten."
    };
}

function generateQuestionnaireUI(aiResult, questionnaireParams) {
    let aiScore = 25;
    let riskLevel = "Normal";

    if (aiResult && aiResult.predict_proba) {
        let proba = aiResult.predict_proba;
        if (Array.isArray(proba) && proba.length > 0 && Array.isArray(proba[0])) {
            proba = proba[0];
        }
        if (Array.isArray(proba) && proba.length >= 3) {
            aiScore = Math.round((proba[1] + proba[2]) * 100);
        }
    } else {
        let pred = aiResult?.prediction;
        if (Array.isArray(pred) && pred.length > 0) pred = pred[0];
        if (pred == 2 || pred == "Diabetes") aiScore = 85;
        else if (pred == 1 || pred == "Prediabetes") aiScore = 55;
    }

    if (aiScore >= 60) riskLevel = "Diabetes";
    else if (aiScore >= 30) riskLevel = "Prediabetes";

    let riskStatus = "Rendah";
    let riskDescription = "Normal / Aman";
    let riskColor = "0xFF10B981"; // Green

    if (riskLevel === "Diabetes") {
        riskStatus = "Tinggi";
        riskDescription = "Indikasi Diabetes";
        riskColor = "0xFFEF4444"; // Red
    } else if (riskLevel === "Prediabetes") {
        riskStatus = "Sedang";
        riskDescription = "Indikasi Prediabetes";
        riskColor = "0xFFF59E0B"; // Orange
    }

    let faktorRisiko = [];
    const bmiCat = questionnaireParams.bmi_category || 0;
    const waistCat = questionnaireParams.waist_category || 0;
    const hyper = questionnaireParams.hypertension || 0;
    const owHist = questionnaireParams.overweight_history || 0;

    if (bmiCat === 1) faktorRisiko.push({ text: 'Kategori BMI Overweight', isWarning: true });
    else if (bmiCat === 2) faktorRisiko.push({ text: 'Kategori BMI Obesitas', isWarning: true });
    
    if (waistCat === 1) faktorRisiko.push({ text: 'Lingkar pinggang berisiko', isWarning: true });
    if (hyper === 1) faktorRisiko.push({ text: 'Memiliki hipertensi', isWarning: true });
    if (owHist === 1) faktorRisiko.push({ text: 'Ada riwayat kelebihan berat badan', isWarning: true });

    if (faktorRisiko.length === 0) faktorRisiko.push({ text: 'Gaya hidup relatif sehat', isWarning: false });

    let insight = "Analisis AI menunjukkan parameter kebiasaan dan profil kesehatan Anda dalam rentang optimal. Pertahankan pola hidup aktif dan seimbang.";
    if (riskLevel === "Diabetes") {
        insight = "Analisis AI berdasarkan pola kebiasaan mendeteksi risiko tinggi terhadap gangguan metabolisme glukosa. Mulai perubahan kebiasaan secara disiplin untuk menurunkan risiko komplikasi.";
    } else if (riskLevel === "Prediabetes") {
        insight = "Analisis AI mendeteksi risiko menengah (Prediabetes) berdasarkan kebiasaan dan parameter fisik Anda. Program gaya hidup 90 Hari akan membantu mengembalikan metabolisme tubuh Anda ke jalur yang sehat.";
    }

    return {
        score: aiScore,
        riskLevel: riskLevel,
        riskStatus: riskStatus,
        riskDescription: riskDescription,
        riskColor: riskColor,
        faktorRisiko: faktorRisiko,
        insight: aiResult?.insight || aiResult?.explanation || aiResult?.summary || insight,
        cta: aiResult?.cta || "Jaga pola makan dan aktivitas fisik dengan konsisten."
    };
}

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
        const ui_data = generateClinicalUI(aiResult, clinicalParams);
        
        const finalPayload = {
            mode: "clinical",
            aiResult: aiResult,
            ui_data: ui_data,
            clinicalParams: {
                ...clinicalParams,
                hba1c: 0,
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
        const ui_data = generateQuestionnaireUI(aiResult, questionnaireParams);
        
        const finalPayload = {
            mode: "questionnaire",
            aiResult: aiResult,
            ui_data: ui_data,
            answers: answers,
            timestamp: new Date().toISOString()
        };

        const sqlUpsertAnalysis = `
            INSERT INTO analysis_results (user_id, mode, result_data)
            VALUES (?, 'questionnaire', ?)
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
            "SELECT mode, result_data, created_at FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
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

// GET /api/ai/history/:userId - Mengambil semua riwayat analisis
const getAnalysisHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID diperlukan" });
        }

        const [results] = await db.promise().query(
            "SELECT id, mode, result_data, created_at FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        const history = results.map(data => {
            let payload = {};
            try {
                payload = typeof data.result_data === 'string' ? JSON.parse(data.result_data) : data.result_data;
            } catch(e) {
                payload = data.result_data;
            }
            return {
                id: data.id,
                mode: data.mode,
                ...payload,
                saved_at: data.created_at
            };
        });

        return res.status(200).json(history);

    } catch (error) {
        console.error("[AI History] Error:", error.message);
        return res.status(500).json({
            message: "Gagal mengambil riwayat analisis",
            error: error.message
        });
    }
};

module.exports = { predictClinical, predictQuestionnaire, getLatestAnalysisResult, getAnalysisHistory };
