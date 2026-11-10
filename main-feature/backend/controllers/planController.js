const planService = require("../services/planService");
const apiResponse = require("../utils/apiResponse");

/**
 * 1. POST /plan/enroll
 */
const enrollPlan = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        const { sleep_target_hours, walking_target_minutes, nutrition_goal } = req.body;

        if (!userId) {
            return apiResponse.badRequest(res, "User ID wajib disertakan");
        }

        const result = await planService.enrollPlan({
            user_id: userId,
            sleep_target_hours,
            walking_target_minutes,
            nutrition_goal
        });

        return apiResponse.success(res, result, "Berhasil enroll program 90 Hari (Rekomendasi AI Aktif)");
    } catch (error) {
        console.error("Enroll Plan Error:", error);
        return apiResponse.error(res, "Gagal enroll program", 500, error);
    }
};

/**
 * 2. GET /plan/data/:user_id
 */
const getPlanData = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) {
            return apiResponse.badRequest(res, "User ID wajib disertakan");
        }

        const data = await planService.getPlanData(user_id);
        if (!data) {
            return apiResponse.notFound(res, "User tidak ditemukan");
        }

        return apiResponse.success(res, data, "Data program 90 hari berhasil dimuat");
    } catch (error) {
        console.error("Get Plan Data Error:", error);
        return apiResponse.error(res, "Gagal memuat data program", 500, error);
    }
};

/**
 * 3. POST /plan/daily-tracking
 */
const submitDailyTracking = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        const { day, sleep_hours, walking_minutes, nutrition_score } = req.body;

        if (!userId || !day) {
            return apiResponse.badRequest(res, "Data tidak lengkap (user_id dan day wajib)");
        }

        const result = await planService.submitDailyTracking({
            user_id: userId,
            day,
            sleep_hours,
            walking_minutes,
            nutrition_score
        });

        return apiResponse.success(res, result, result.message || "Tracking harian berhasil disimpan");
    } catch (error) {
        console.error("Daily Tracking Error:", error);
        return apiResponse.error(res, "Gagal menyimpan daily tracking", 500, error);
    }
};

/**
 * 4. POST /plan/glucose-tracking
 */
const submitGlucoseTracking = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        const { day, glucose_value } = req.body;

        if (!userId || !day || glucose_value === undefined) {
            return apiResponse.badRequest(res, "Data tidak lengkap (user_id, day, dan glucose_value wajib)");
        }

        const result = await planService.submitGlucoseTracking({
            user_id: userId,
            day,
            glucose_value
        });

        if (result.alreadyTracked) {
            return apiResponse.badRequest(res, result.message);
        }

        return apiResponse.success(res, result, "Pencatatan glukosa berhasil disimpan");
    } catch (error) {
        console.error("Glucose Tracking Error:", error);
        return apiResponse.error(res, "Gagal menyimpan glucose tracking", 500, error);
    }
};

/**
 * 5. POST /plan/assessment-30
 */
const assessment30 = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) return apiResponse.badRequest(res, "User ID wajib disertakan");

        const result = await planService.processAssessment(userId, 30);
        if (!result) return apiResponse.notFound(res, "User tidak ditemukan");

        return apiResponse.success(res, result, "Evaluasi Hari ke-30 berhasil diproses");
    } catch (error) {
        console.error("Assessment 30 Error:", error);
        return apiResponse.error(res, error.message || "Gagal evaluasi 30 hari", 500, error);
    }
};

/**
 * 6. POST /plan/assessment-90
 */
const assessment90 = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) return apiResponse.badRequest(res, "User ID wajib disertakan");

        const result = await planService.processAssessment(userId, 90);
        if (!result) return apiResponse.notFound(res, "User tidak ditemukan");

        return apiResponse.success(res, result, "Evaluasi Hari ke-90 berhasil diproses");
    } catch (error) {
        console.error("Assessment 90 Error:", error);
        return apiResponse.error(res, error.message || "Gagal evaluasi 90 hari", 500, error);
    }
};

/**
 * 7. GET /plan/daily-tracking/:user_id
 */
const getDailyTracking = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return apiResponse.badRequest(res, "user_id wajib disertakan");

        const rows = await planService.getDailyTracking(user_id);
        return apiResponse.success(res, rows, "Data tracking harian berhasil dimuat");
    } catch (error) {
        console.error("Get Daily Tracking Error:", error);
        return apiResponse.error(res, "Gagal mengambil data tracking harian", 500, error);
    }
};

/**
 * 8. GET /plan/glucose-tracking/:user_id
 */
const getGlucoseTracking = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return apiResponse.badRequest(res, "user_id wajib disertakan");

        const rows = await planService.getGlucoseTracking(user_id);
        return apiResponse.success(res, rows, "Data glukosa berhasil dimuat");
    } catch (error) {
        console.error("Get Glucose Tracking Error:", error);
        return apiResponse.error(res, "Gagal memuat data gula darah", 500, error);
    }
};

/**
 * 9. GET /plan/ai-evaluations/:user_id
 */
const getAiEvaluations = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return apiResponse.badRequest(res, "user_id wajib disertakan");

        const evals = await planService.getAiEvaluations(user_id);
        return apiResponse.success(res, evals, "Data evaluasi AI berhasil dimuat");
    } catch (error) {
        console.error("Get AI Evaluations Error:", error);
        return apiResponse.error(res, "Gagal memuat evaluasi AI", 500, error);
    }
};

/**
 * 10. POST /plan/cancel
 */
const cancelPlan = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.user_id;
        if (!userId) return apiResponse.badRequest(res, "User ID required");

        await planService.cancelPlan(userId);
        return apiResponse.success(res, null, "Program berhasil dibatalkan dan di-reset");
    } catch (error) {
        console.error("Cancel Plan Error:", error);
        return apiResponse.error(res, "Gagal membatalkan program", 500, error);
    }
};

module.exports = {
    enrollPlan,
    getPlanData,
    submitDailyTracking,
    submitGlucoseTracking,
    assessment30,
    assessment90,
    getDailyTracking,
    getGlucoseTracking,
    getAiEvaluations,
    cancelPlan
};
