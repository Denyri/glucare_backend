const express = require("express");
const router = express.Router();
const { predictClinical, predictQuestionnaire, getLatestAnalysisResult } = require("../controllers/aiController");

// POST /api/ai/predict/clinical — Prediksi mode klinis/lab
router.post("/predict/clinical", predictClinical);

// POST /api/ai/predict/questionnaire - Prediksi mode kuesioner
router.post("/predict/questionnaire", predictQuestionnaire);

// GET /api/ai/result/:userId - Mengambil hasil analisis terakhir
router.get("/result/:userId", getLatestAnalysisResult);

module.exports = router;
