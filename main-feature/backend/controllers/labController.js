const db = require("../config/db");
const axios = require("axios");

const submitLabResult = async (req, res) => {
    try {
        const {
            user_id,
            age,
            gender,
            glucose_fasting,
            waist_cm,
            weight,
            height,
            hdl,
            triglycerides,
            bp_systolic,
            bp_diastolic,
        } = req.body;

        // Validasi sederhana
        if (
            !user_id ||
            !age ||
            gender === undefined ||
            !glucose_fasting ||
            !waist_cm ||
            !weight ||
            !height ||
            !hdl ||
            !triglycerides ||
            !bp_systolic ||
            !bp_diastolic
        ) {
            return res.status(400).json({
                message: "Semua field wajib diisi",
            });
        }

        // Hitung nilai yang dibutuhkan AI
        const bmi = (
            parseFloat(weight) /
            Math.pow(parseFloat(height) / 100, 2)
        ).toFixed(2);

        const map_pressure = (
            (2 * parseFloat(bp_diastolic) +
                parseFloat(bp_systolic)) /
            3
        ).toFixed(2);

        const tg_hdl_ratio = (
            parseFloat(triglycerides) /
            parseFloat(hdl)
        ).toFixed(2);

        const payload ={
            glucose_fasting: parseFloat(glucose_fasting),
            age: parseInt(age),
            waist_cm: parseFloat(waist_cm),
            bmi: parseFloat(bmi),
            hdl: parseFloat(hdl),
            triglycerides: parseFloat(triglycerides),
            bp_systolic: parseInt(bp_systolic),
            bp_diastolic: parseInt(bp_diastolic),
            gender: parseInt(gender),
            map_pressure: parseFloat(map_pressure),
            tg_hdl_ratio: parseFloat(tg_hdl_ratio),
        };

        console.log("Payload untuk AI:", payload);

        // Panggil AI API
        const aiResponse = await axios.post(
            "https://itzvynn-glucare-backend.hf.space/predict/clinical", payload
        );

        console.log("Response dari AI:", aiResponse.data);
        const aiResult = aiResponse.data;

        // Simpan ke database
        const sql = `
            INSERT INTO clinical_assessments (
                user_id,
                age,
                gender,
                glucose_fasting,
                waist_cm,
                weight,
                height,
                hdl,
                triglycerides,
                bp_systolic,
                bp_diastolic,
                bmi,
                map_pressure,
                tg_hdl_ratio,
                prediction_raw,
                risk_level,
                cta,
                probability_normal,
                probability_prediabetes,
                probability_diabetes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            user_id,
            age,
            gender,
            glucose_fasting,
            waist_cm,
            weight,
            height,
            hdl,
            triglycerides,
            bp_systolic,
            bp_diastolic,
            bmi,
            map_pressure,
            tg_hdl_ratio,
            aiResult.prediction_raw,
            aiResult.risk_level,
            aiResult.cta,
            aiResult.predict_proba[0],
            aiResult.predict_proba[1],
            aiResult.predict_proba[2],
        ];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database Error:", err);

                return res.status(500).json({
                    message:
                        "Gagal menyimpan hasil assessment",
                });
            }

            return res.status(201).json({
                assessment_id: result.insertId,
                ...aiResult,
            });
        });
    } catch (error) {
        console.error(
            "AI Error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message:
                "Gagal melakukan prediksi AI",
            error:
                error.response?.data ||
                error.message,
        });
    }
};

const getLabResult = (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT *
        FROM clinical_assessments
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    `;

    db.query(sql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({
                message:
                    "Gagal mengambil data assessment",
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message:
                    "Data assessment belum ada",
            });
        }

        res.status(200).json(results[0]);
    });
};

module.exports = {
    submitLabResult,
    getLabResult,
};