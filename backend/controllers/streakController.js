const streakService = require("../services/streakService");
const apiResponse = require("../utils/apiResponse");

/**
 * POST /api/streak/checkin
 */
const checkin = async (req, res) => {
    try {
        const { user_id, timezone = "Asia/Jakarta" } = req.body;
        const uid = req.user?.id || user_id;
        if (!uid) {
            return apiResponse.badRequest(res, "user_id wajib diisi");
        }
        const result = await streakService.performCheckin(uid, timezone);
        return apiResponse.success(res, result, result.message || "Checkin berhasil!");
    } catch (error) {
        console.error("Streak checkin error:", error);
        return apiResponse.error(res, "Gagal melakukan check-in", 500, error);
    }
};

/**
 * POST /api/streak/freeze/earn
 */
const earnFreeze = async (req, res) => {
    try {
        const { user_id, amount = 1 } = req.body;
        const uid = req.user?.id || user_id;
        if (!uid) {
            return apiResponse.badRequest(res, "user_id wajib diisi");
        }
        const result = await streakService.earnFreeze(uid, amount);
        return apiResponse.success(res, result, result.message || "Freeze berhasil didapatkan");
    } catch (error) {
        console.error("Earn freeze error:", error);
        return apiResponse.error(res, "Gagal menambahkan freeze", 500, error);
    }
};

/**
 * POST /api/streak/freeze/use
 */
const useFreeze = async (req, res) => {
    try {
        const { user_id, timezone = "Asia/Jakarta" } = req.body;
        const uid = req.user?.id || user_id;
        if (!uid) {
            return apiResponse.badRequest(res, "user_id wajib diisi");
        }
        const result = await streakService.useFreeze(uid, timezone);
        if (result && result.error) {
            return apiResponse.badRequest(res, result.message);
        }
        return apiResponse.success(res, result, result?.message || "Freeze berhasil digunakan");
    } catch (error) {
        console.error("Use freeze error:", error);
        return apiResponse.error(res, "Gagal menggunakan freeze", 500, error);
    }
};

/**
 * GET /api/streak/:userId
 */
const getStreak = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return apiResponse.badRequest(res, "userId wajib diisi");
        }
        const result = await streakService.getStreak(userId);
        return apiResponse.success(res, result, "Data streak berhasil diambil");
    } catch (error) {
        console.error("Get streak error:", error);
        return apiResponse.error(res, "Gagal mengambil data streak", 500, error);
    }
};

/**
 * GET /api/streak/:userId/history?days=30&month=YYYY-MM
 */
const getStreakHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { days = 30, month } = req.query;
        if (!userId) {
            return apiResponse.badRequest(res, "userId wajib diisi");
        }

        let monthView = false;
        let reqYear = null;
        let reqMonth = null;
        if (month) {
            const parts = month.split("-");
            if (parts.length === 2) {
                monthView = true;
                reqYear = parseInt(parts[0]);
                reqMonth = parseInt(parts[1]);
            }
        }

        const result = await streakService.getStreakHistory(userId, days, monthView, reqYear, reqMonth);
        return apiResponse.success(res, result, "Riwayat streak berhasil diambil");
    } catch (error) {
        console.error("Get streak history error:", error);
        return apiResponse.error(res, "Gagal mengambil riwayat streak", 500, error);
    }
};

module.exports = {
    checkin,
    earnFreeze,
    useFreeze,
    getStreak,
    getStreakHistory,
    performCheckin: streakService.performCheckin, // Maintain backward compatibility
};
