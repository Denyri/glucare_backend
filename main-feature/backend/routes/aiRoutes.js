const express = require("express");
const router = express.Router();
const { predictClinical, predictQuestionnaire, getLatestAnalysisResult, getAnalysisHistory } = require("../controllers/aiController");

// POST /api/ai/predict/clinical — Prediksi mode klinis/lab
router.post("/predict/clinical", (req, res, next) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Endpoint untuk memprediksi tingkat risiko menggunakan mode data klinis (lab).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data indikator klinis',
            schema: {
                user_id: "string_id_123",
                gula_darah_puasa: 90.5,
                berat_badan: 70.0,
                tinggi_badan: 170.0,
                lingkar_pinggang: 80.0,
                hdl: 50.0,
                trigliserida: 150.0,
                tekanan_sistolik: 120,
                tekanan_diastolik: 80,
                riwayat_keluarga: 0,
                riwayat_diabetes: 0
            }
        } 
    */
    next();
}, predictClinical);

// POST /api/ai/predict/questionnaire - Prediksi mode kuesioner
router.post("/predict/questionnaire", (req, res, next) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Endpoint untuk memprediksi tingkat risiko menggunakan kuesioner umum.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data jawaban kuesioner',
            schema: {
                user_id: "string_id_123",
                bmi_category: "Normal",
                waist_category: "Normal",
                hypertension: 0,
                overweight_history: 0
            }
        } 
    */
    next();
}, predictQuestionnaire);

// GET /api/ai/result/:userId - Mengambil hasil analisis terakhir
router.get("/result/:userId", (req, res, next) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Mengambil hasil deteksi risiko (health score) terbaru milik user.' */
    next();
}, getLatestAnalysisResult);

// GET /api/ai/history/:userId - Mengambil riwayat analisis
router.get("/history/:userId", (req, res, next) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Mengambil seluruh riwayat hasil analisis pengguna dari waktu ke waktu.' */
    next();
}, getAnalysisHistory);

module.exports = router;
