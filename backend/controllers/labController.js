const db = require("../config/db");
const aiService = require("../services/aiService");

const submitLabResult = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) {
            return res.status(400).json({ message: "User ID diperlukan" });
        }

        const result = await aiService.predictClinical({
            ...req.body,
            user_id: userId
        });

        return res.status(200).json({
            success: true,
            message: "Data lab berhasil diproses dan dianalisis",
            ...result
        });
    } catch (error) {
        console.error("[Lab Submit] Error:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Gagal melakukan prediksi AI klinis",
            error: error.response?.data || error.message,
        });
    }
};

const getLabResult = async (req, res) => {
    const { user_id } = req.params;

    try {
        const result = await aiService.getLatestAnalysisResult(user_id, "clinical");
        if (!result) {
            return res.status(404).json({ message: "Data assessment belum ada" });
        }
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: "Gagal mengambil data assessment" });
    }
};

module.exports = {
    submitLabResult,
    getLabResult,
};