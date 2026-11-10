const aiService = require("../services/aiService");
const apiResponse = require("../utils/apiResponse");

/**
 * POST /api/ai/predict/clinical — Prediksi Mode Klinis / Lab
 */
const predictClinical = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) {
            return apiResponse.badRequest(res, "User ID diperlukan");
        }

        const result = await aiService.predictClinical({
            ...req.body,
            user_id: userId
        });

        return apiResponse.success(res, result, "Prediksi klinis berhasil diproses");
    } catch (error) {
        console.error("[AI Clinical] Error:", error.response?.data || error.message);
        return apiResponse.error(
            res,
            "Gagal memproses prediksi klinis",
            error.response?.status || 500,
            error.response?.data || error
        );
    }
};

/**
 * POST /api/ai/predict/questionnaire — Prediksi Mode Kuesioner
 */
const predictQuestionnaire = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) {
            return apiResponse.badRequest(res, "User ID diperlukan");
        }

        const answers = req.body.answers;
        const hasDirectParams = req.body.bmi_category !== undefined || req.body.waist_category !== undefined;

        if (!answers && !hasDirectParams) {
            return apiResponse.badRequest(res, "Jawaban kuesioner diperlukan");
        }

        const result = await aiService.predictQuestionnaire({
            ...req.body,
            user_id: userId,
            answers: answers || req.body
        });

        return apiResponse.success(res, result, "Prediksi kuesioner berhasil diproses");
    } catch (error) {
        console.error("[AI Kuesioner] Error:", error.response?.data || error.message);
        return apiResponse.error(
            res,
            "Gagal memproses prediksi kuesioner",
            error.response?.status || 500,
            error.response?.data || error
        );
    }
};

/**
 * GET /api/ai/result/:userId — Mengambil hasil analisis terakhir (bisa filter ?mode=clinical|questionnaire)
 */
const getLatestAnalysisResult = async (req, res) => {
    try {
        const { userId } = req.params;
        const { mode } = req.query;
        if (!userId) {
            return apiResponse.badRequest(res, "User ID diperlukan");
        }

        const result = await aiService.getLatestAnalysisResult(userId, mode || null);
        if (!result) {
            return apiResponse.notFound(res, "Belum ada hasil analisis");
        }

        return apiResponse.success(res, result, "Hasil analisis berhasil diambil");
    } catch (error) {
        console.error("[AI Result] Error:", error.message);
        return apiResponse.error(res, "Gagal mengambil hasil analisis", 500, error);
    }
};

/**
 * GET /api/ai/history/:userId — Mengambil semua riwayat analisis (bisa filter ?mode=clinical|questionnaire)
 */
const getAnalysisHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { mode } = req.query;
        if (!userId) {
            return apiResponse.badRequest(res, "User ID diperlukan");
        }

        const history = await aiService.getAnalysisHistory(userId, mode || null);
        return apiResponse.success(res, history, "Riwayat analisis berhasil dimuat");
    } catch (error) {
        console.error("[AI History] Error:", error.message);
        return apiResponse.error(res, "Gagal mengambil riwayat analisis", 500, error);
    }
};

module.exports = {
    predictClinical,
    predictQuestionnaire,
    getLatestAnalysisResult,
    getAnalysisHistory
};
