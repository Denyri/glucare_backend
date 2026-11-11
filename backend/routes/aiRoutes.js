const express = require("express");
const router = express.Router();
const { predictClinical, predictQuestionnaire, getLatestAnalysisResult, getAnalysisHistory } = require("../controllers/aiController");

// POST /api/ai/predict/clinical — Prediksi mode klinis/lab
router.post("/predict/clinical", (req, res) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Skrining risiko prediabetes menggunakan biomarker laboratorium klinis (Random Forest + Standar ADA).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data indikator laboratorium klinis pasien',
            schema: { $ref: '#/definitions/ClinicalPredictionInput' }
        }
    */
    predictClinical(req, res);
});

// POST /api/ai/predict/questionnaire - Prediksi mode kuesioner
router.post("/predict/questionnaire", (req, res) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Skrining risiko prediabetes non-invasif berbasis kuesioner gaya hidup (12 faktor risiko NHANES).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data jawaban kuesioner gaya hidup 12 faktor risiko',
            schema: { $ref: '#/definitions/QuestionnairePredictionInput' }
        }
    */
    predictQuestionnaire(req, res);
});

// GET /api/ai/result/:userId - Mengambil hasil analisis terakhir
router.get("/result/:userId", (req, res) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Mengambil hasil deteksi risiko (health score) terbaru milik user.'
    */
    getLatestAnalysisResult(req, res);
});

// GET /api/ai/history/:userId - Mengambil riwayat analisis
router.get("/history/:userId", (req, res) => {
    /*  #swagger.tags = ['AI Predictions']
        #swagger.description = 'Mengambil seluruh riwayat hasil analisis pengguna dari waktu ke waktu.'
    */
    getAnalysisHistory(req, res);
});

module.exports = router;
