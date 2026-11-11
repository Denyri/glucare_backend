const db = require("../config/db");
const axios = require("axios");
const ss = require("simple-statistics");
const streakService = require("./streakService");

const AI_BASE_URL = process.env.AI_BASE_URL || "http://localhost:8000";

/**
 * Helper: Unlock Achievement for user if not yet unlocked
 */
const unlockAchievement = async (user_id, achievement_code) => {
    return false;
};

/**
 * 1. Enroll Plan (Manual or AI-prescribed targets)
 */
const enrollPlan = async ({ user_id, sleep_target_hours, walking_target_minutes, nutrition_goal }) => {
    const uid = String(user_id);

    // Jika target belum ditentukan, ambil preskripsi target otomatis dari AI
    if (!sleep_target_hours || !walking_target_minutes || !nutrition_goal) {
        try {
            const [aiRows] = await db.promise().query(
                "SELECT result_data FROM analysis_results WHERE user_id = ? ORDER BY id DESC LIMIT 1",
                [uid]
            );

            let riskLevel = "Prediabetes";
            let fpg = 105;
            let bmi = 25.5;

            if (aiRows.length > 0 && aiRows[0].result_data) {
                const parsed = typeof aiRows[0].result_data === "string" 
                    ? JSON.parse(aiRows[0].result_data) 
                    : aiRows[0].result_data;
                riskLevel = parsed.aiResult?.risk_level || parsed.ui_data?.riskLevel || "Prediabetes";
                fpg = parsed.clinicalParams?.glucose_fasting || 105;
                bmi = parsed.clinicalParams?.bmi || 25.5;
            }

            const aiEnroll = await axios.post(`${AI_BASE_URL}/program/enroll`, {
                user_id: uid,
                risk_level: riskLevel,
                glucose_fasting: fpg,
                bmi: bmi
            }, { timeout: 5000 });

            if (aiEnroll.data && aiEnroll.data.daily_targets) {
                sleep_target_hours = sleep_target_hours || aiEnroll.data.daily_targets.sleep_target_hours;
                walking_target_minutes = walking_target_minutes || aiEnroll.data.daily_targets.walking_target_minutes;
                nutrition_goal = nutrition_goal || aiEnroll.data.daily_targets.nutrition_goal;
            }
        } catch (aiErr) {
            console.warn("AI Auto-enroll fallback:", aiErr.message);
            sleep_target_hours = sleep_target_hours || 8.0;
            walking_target_minutes = walking_target_minutes || 40;
            nutrition_goal = nutrition_goal || "Defisit Kalori Ringan, Serat >= 30g/hari (Rekomendasi AI)";
        }
    }

    const now = new Date();
    const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const today = wibTime.toISOString().split("T")[0]; // YYYY-MM-DD WIB

    await db.promise().query(
        `UPDATE users SET 
         plan_start_date = COALESCE(plan_start_date, ?),
         sleep_target_hours = ?, 
         walking_target_minutes = ?, 
         nutrition_goal = ? 
         WHERE id = ?`,
        [today, sleep_target_hours, walking_target_minutes, nutrition_goal, uid]
    );

    return {
        enrolled: true,
        daily_targets: {
            sleep_target_hours,
            walking_target_minutes,
            nutrition_goal
        }
    };
};

/**
 * 2. Get Plan Data
 */
const getPlanData = async (user_id) => {
    const uid = String(user_id);

    const [users] = await db.promise().query(
        `SELECT 
            xp, current_streak, best_streak, plan_start_date, 
            sleep_target_hours, walking_target_minutes, nutrition_goal,
            DATEDIFF(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 HOUR), plan_start_date) AS diff_days
         FROM users WHERE id = ?`,
        [uid]
    );

    if (users.length === 0) {
        return null;
    }

    const user = users[0];

    if (!user.plan_start_date) {
        return { enrolled: false };
    }

    const currentDay = Math.min(Math.max((user.diff_days || 0) + 1, 1), 90);

    const [daily] = await db.promise().query(
        "SELECT * FROM daily_tracking WHERE user_id = ? AND day_index = ?",
        [uid, currentDay]
    );

    const [glucose] = await db.promise().query(
        "SELECT id FROM glucose_tracking WHERE user_id = ? AND day_index = ?",
        [uid, currentDay]
    );

    const [achievementsData] = await db.promise().query(
        "SELECT achievement_code FROM user_achievements WHERE user_id = ?",
        [uid]
    );

    const [streakData] = await db.promise().query(
        "SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ?",
        [uid]
    );

    return {
        enrolled: true,
        day: currentDay,
        xp: 0,
        level: 1,
        xpToNextLevel: 0,
        currentStreak: streakData.length > 0 ? streakData[0].current_streak : (user.current_streak || 0),
        bestStreak: streakData.length > 0 ? streakData[0].longest_streak : (user.best_streak || 0),
        targets: {
            sleep: user.sleep_target_hours,
            walking: user.walking_target_minutes,
            nutrition: user.nutrition_goal
        },
        todayTracking: daily.length > 0 ? daily[0] : null,
        todayGlucose: glucose.length > 0,
        achievements: []
    };
};

/**
 * 3. Submit Daily Tracking
 */
const submitDailyTracking = async ({ user_id, day, sleep_hours, walking_minutes, nutrition_score }) => {
    const uid = String(user_id);

    // Cek double submit untuk hari yang sama
    const [existing] = await db.promise().query(
        "SELECT id FROM daily_tracking WHERE user_id = ? AND day_index = ?",
        [uid, day]
    );

    if (existing.length > 0) {
        const streakResult = await streakService.performCheckin(uid, "Asia/Jakarta");
        await db.promise().query(
            "UPDATE users SET current_streak = ?, best_streak = ? WHERE id = ?",
            [streakResult.current_streak, streakResult.longest_streak, uid]
        );
        return {
            alreadyTracked: true,
            message: "Tracking hari ini sudah tersimpan dan streak aktif",
            streak: streakResult
        };
    }

    await db.promise().query(
        "INSERT INTO daily_tracking (user_id, day_index, sleep_hours, walking_minutes, nutrition_score, xp_gained) VALUES (?, ?, ?, ?, ?, ?)",
        [uid, day, sleep_hours, walking_minutes, nutrition_score, 0]
    );

    // Checkin log kepatuhan via streakService
    const streakResult = await streakService.performCheckin(uid, "Asia/Jakarta");
    const current_streak = streakResult.current_streak;
    const best_streak = streakResult.longest_streak;

    await db.promise().query(
        "UPDATE users SET current_streak = ?, best_streak = ? WHERE id = ?",
        [current_streak, best_streak, uid]
    );

    let aiFeedback = null;
    try {
        const aiResp = await axios.post(`${AI_BASE_URL}/predict/daily`, {
            user_id: uid,
            day: parseInt(day),
            sleep_hours: parseFloat(sleep_hours) || 0,
            walking_minutes: parseFloat(walking_minutes) || 0,
            nutrition_score: parseFloat(nutrition_score) || 0
        }, { timeout: 4000 });
        aiFeedback = aiResp.data;
    } catch (aiErr) {
        console.warn("[Plan] AI Daily Feedback warning:", aiErr.message);
    }

    return {
        xp_gained: xpGained,
        total_xp: xp,
        level: newLevel,
        streak: streakResult,
        newAchievements,
        ai_feedback: aiFeedback
    };
};

/**
 * 4. Submit Glucose Tracking
 */
const submitGlucoseTracking = async ({ user_id, day, glucose_value }) => {
    const uid = String(user_id);

    const [existing] = await db.promise().query(
        "SELECT id FROM glucose_tracking WHERE user_id = ? AND day_index = ?",
        [uid, day]
    );

    if (existing.length > 0) {
        return {
            alreadyTracked: true,
            message: "Anda sudah mencatat gula darah untuk hari ini. Silakan kembali besok."
        };
    }

    await db.promise().query(
        "INSERT INTO glucose_tracking (user_id, day_index, glucose_value) VALUES (?, ?, ?)",
        [uid, day, glucose_value]
    );

    // Pencatatan kepatuhan glukosa klinis tanpa kalkulasi XP / lencana game

    let aiFeedback = null;
    try {
        const aiResp = await axios.post(`${AI_BASE_URL}/predict/glucose`, {
            user_id: uid,
            day: parseInt(day),
            glucose_value: parseFloat(glucose_value)
        }, { timeout: 4000 });
        aiFeedback = aiResp.data;
    } catch (aiErr) {
        console.warn("[Plan] AI Glucose Feedback warning:", aiErr.message);
    }

    return { 
        xp_gained: 50, 
        newAchievements,
        ai_feedback: aiFeedback
    };
};

/**
 * 5. & 6. Assessment 30 & 90 Days
 */
const processAssessment = async (user_id, totalDays) => {
    const uid = String(user_id);

    const [users] = await db.promise().query(
        "SELECT best_streak, sleep_target_hours, walking_target_minutes FROM users WHERE id = ?",
        [uid]
    );
    if (users.length === 0) return null;

    const user = users[0];

    const [daily] = await db.promise().query(
        "SELECT * FROM daily_tracking WHERE user_id = ? AND day_index <= ? ORDER BY day_index ASC",
        [uid, totalDays]
    );
    const [glucose] = await db.promise().query(
        "SELECT * FROM glucose_tracking WHERE user_id = ? AND day_index <= ? ORDER BY day_index ASC",
        [uid, totalDays]
    );

    if (daily.length === 0) {
        throw new Error("Tidak ada data tracking untuk dievaluasi");
    }

    const sleepArr = daily.map(d => d.sleep_hours || 0);
    const walkArr = daily.map(d => d.walking_minutes || 0);
    const carbsArr = daily.map(d => 100 - (d.nutrition_score || 0));
    const glucArr = glucose.map(g => g.glucose_value || 0);

    const glucMean = glucArr.length > 0 ? ss.mean(glucArr) : 100;
    const glucStd = glucArr.length > 1 ? ss.standardDeviation(glucArr) : 0;
    
    let glucSlope = 0;
    if (glucose.length > 1) {
        const coords = glucose.map(g => [g.day_index, g.glucose_value]);
        const l = ss.linearRegression(coords);
        glucSlope = l.m;
    }

    const sleepMean = sleepArr.length > 0 ? ss.mean(sleepArr) : 7;
    const walkMean = walkArr.length > 0 ? ss.mean(walkArr) : 30;
    const carbsMean = carbsArr.length > 0 ? ss.mean(carbsArr) : 50;

    let targetSleepDays = 0;
    let targetWalkDays = 0;
    const tSleep = user.sleep_target_hours || 7;
    const tWalk = user.walking_target_minutes || 30;

    daily.forEach(d => {
        if ((d.sleep_hours || 0) >= tSleep) targetSleepDays++;
        if ((d.walking_minutes || 0) >= tWalk) targetWalkDays++;
    });

    const sleepCompliance = (targetSleepDays / daily.length) * 100;
    const walkCompliance = (targetWalkDays / daily.length) * 100;
    const overallCompliance = (sleepCompliance + walkCompliance) / 2;

    const aiPayload = {
        user_id: uid,
        days_evaluated: totalDays,
        actual_tracking_days: daily.length,
        sleep_mean: parseFloat(sleepMean.toFixed(1)),
        walk_mean: parseFloat(walkMean.toFixed(1)),
        carbs_mean: parseFloat(carbsMean.toFixed(1)),
        glucose_mean: parseFloat(glucMean.toFixed(1)),
        glucose_std: parseFloat(glucStd.toFixed(1)),
        glucose_slope: parseFloat(glucSlope.toFixed(2)),
        sleep_compliance_pct: parseFloat(sleepCompliance.toFixed(1)),
        walk_compliance_pct: parseFloat(walkCompliance.toFixed(1)),
        overall_compliance_pct: parseFloat(overallCompliance.toFixed(1))
    };

    let evaluationResult = null;
    try {
        const endpoint = totalDays === 30 ? "/evaluation/day30" : "/evaluation/day90";
        const aiResponse = await axios.post(`${AI_BASE_URL}${endpoint}`, aiPayload, { timeout: 6000 });
        evaluationResult = aiResponse.data;
    } catch (aiError) {
        console.warn(`AI Assessment ${totalDays} Fallback:`, aiError.message);
        evaluationResult = {
            status: "Simulated Assessment",
            days_evaluated: totalDays,
            compliance_score: Math.round(overallCompliance),
            metabolic_status: glucMean < 100 ? "Optimal" : "Stabilisasi Diperlukan",
            recommendations: [
                "Pertahankan konsistensi tidur dan aktivitas jalan kaki.",
                "Pantau asupan karbohidrat sederhana secara bertahap."
            ]
        };
    }

    await db.promise().query(
        "INSERT INTO ai_evaluations (user_id, evaluation_type, compliance_score, ai_notes) VALUES (?, ?, ?, ?)",
        [uid, `DAY_${totalDays}`, Math.round(overallCompliance), JSON.stringify(evaluationResult)]
    );

    return evaluationResult;
};

/**
 * 7. Get Daily Tracking Records
 */
const getDailyTracking = async (user_id) => {
    const uid = String(user_id);
    const [rows] = await db.promise().query(
        "SELECT day_index, sleep_hours, walking_minutes, nutrition_score, created_at FROM daily_tracking WHERE user_id = ? ORDER BY day_index ASC",
        [uid]
    );
    return rows;
};

/**
 * 8. Get Glucose Tracking Records
 */
const getGlucoseTracking = async (user_id) => {
    const uid = String(user_id);
    const [rows] = await db.promise().query(
        "SELECT day_index, glucose_value, created_at FROM glucose_tracking WHERE user_id = ? ORDER BY day_index ASC",
        [uid]
    );
    return rows;
};

/**
 * 9. Get AI Evaluations
 */
const getAiEvaluations = async (user_id) => {
    const uid = String(user_id);
    const [evals] = await db.promise().query(
        "SELECT * FROM ai_evaluations WHERE user_id = ? ORDER BY created_at DESC",
        [uid]
    );
    return evals;
};

/**
 * 10. Cancel Plan
 */
const cancelPlan = async (user_id) => {
    const uid = String(user_id);

    await db.promise().query(
        "UPDATE users SET plan_start_date = NULL WHERE id = ?",
        [uid]
    );

    await db.promise().query("DELETE FROM daily_tracking WHERE user_id = ?", [uid]);
    await db.promise().query("DELETE FROM glucose_tracking WHERE user_id = ?", [uid]);
    await db.promise().query("DELETE FROM ai_evaluations WHERE user_id = ?", [uid]);

    return { success: true };
};

module.exports = {
    enrollPlan,
    getPlanData,
    submitDailyTracking,
    submitGlucoseTracking,
    processAssessment,
    getDailyTracking,
    getGlucoseTracking,
    getAiEvaluations,
    cancelPlan,
    unlockAchievement
};
