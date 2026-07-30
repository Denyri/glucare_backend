const db = require("../config/db");
const axios = require("axios");
const ss = require("simple-statistics");
const { performCheckin } = require("./streakController");

const AI_BASE_URL = process.env.AI_BASE_URL || "https://itzvynn-glucare-backend.hf.space";

// Helper: Unlock Achievement
const unlockAchievement = async (user_id, achievement_code) => {
    const [existing] = await db.promise().query(
        "SELECT id FROM user_achievements WHERE user_id = ? AND achievement_code = ?",
        [user_id, achievement_code]
    );
    if (existing.length === 0) {
        await db.promise().query(
            "INSERT INTO user_achievements (user_id, achievement_code) VALUES (?, ?)",
            [user_id, achievement_code]
        );
        return true; // Unlocked new
    }
    return false;
};

// 1. Enroll Plan
const enrollPlan = async (req, res) => {
    try {
        const { user_id, sleep_target_hours, walking_target_minutes, nutrition_goal } = req.body;

        if (!user_id || !sleep_target_hours || !walking_target_minutes || !nutrition_goal) {
            return res.status(400).json({ message: "Data enroll tidak lengkap" });
        }

        const now = new Date();
        const wibTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
        const today = wibTime.toISOString().split("T")[0]; // YYYY-MM-DD dalam WIB

        await db.promise().query(
            `UPDATE users SET 
             plan_start_date = COALESCE(plan_start_date, ?),
             sleep_target_hours = ?, 
             walking_target_minutes = ?, 
             nutrition_goal = ? 
             WHERE id = ?`,
            [today, sleep_target_hours, walking_target_minutes, nutrition_goal, user_id]
        );

        // Forward to AI (Obsolete/Removed)
        // AI Endpoint sudah tidak dipakai lagi

        return res.status(200).json({ message: "Berhasil enroll program 90 Hari" });
    } catch (error) {
        console.error("Enroll Error:", error);
        return res.status(500).json({ message: "Gagal enroll", error: error.message });
    }
};

// 2. Get Plan Data
const getPlanData = async (req, res) => {
    try {
        const { user_id } = req.params;

        const [users] = await db.promise().query(
            `SELECT 
                xp, current_streak, best_streak, plan_start_date, 
                sleep_target_hours, walking_target_minutes, nutrition_goal,
                DATEDIFF(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 HOUR), plan_start_date) AS diff_days
             FROM users WHERE id = ?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = users[0];

        // Jika belum enroll
        if (!user.plan_start_date) {
            return res.status(200).json({ enrolled: false });
        }

        // Hitungan hari otomatis dihitung akurat oleh MySQL dari diff_days
        const currentDay = Math.min(Math.max(user.diff_days + 1, 1), 90);

        // Get Today's tracking specifically for current day_index
        const [daily] = await db.promise().query(
            "SELECT * FROM daily_tracking WHERE user_id = ? AND day_index = ?",
            [user_id, currentDay]
        );

        // Get Today's glucose tracking
        const [glucose] = await db.promise().query(
            "SELECT id FROM glucose_tracking WHERE user_id = ? AND day_index = ?",
            [user_id, currentDay]
        );

        // Get Achievements
        const [achievementsData] = await db.promise().query(
            "SELECT achievement_code FROM user_achievements WHERE user_id = ?",
            [user_id]
        );

        // Get Streak Data
        const [streakData] = await db.promise().query(
            "SELECT current_streak, longest_streak FROM user_streaks WHERE user_id = ?",
            [user_id]
        );

        const level = Math.floor(user.xp / 500) + 1;

        return res.status(200).json({
            enrolled: true,
            day: currentDay,
            xp: user.xp,
            level: level,
            xpToNextLevel: 500 - (user.xp % 500),
            currentStreak: streakData.length > 0 ? streakData[0].current_streak : user.current_streak,
            bestStreak: streakData.length > 0 ? streakData[0].longest_streak : user.best_streak,
            targets: {
                sleep: user.sleep_target_hours,
                walking: user.walking_target_minutes,
                nutrition: user.nutrition_goal
            },
            todayTracking: daily.length > 0 ? daily[0] : null,
            todayGlucose: glucose.length > 0,
            achievements: achievementsData.map(a => a.achievement_code)
        });
    } catch (error) {
        console.error("Get Plan Data Error:", error);
        return res.status(500).json({ message: "Gagal memuat data", error: error.message });
    }
};

// 3. Submit Daily Tracking
const submitDailyTracking = async (req, res) => {
    try {
        const { user_id, day, sleep_hours, walking_minutes, nutrition_score } = req.body;

        if (!user_id || !day) return res.status(400).json({ message: "Data tidak lengkap" });

        // Cek double submit
        const [existing] = await db.promise().query(
            "SELECT id FROM daily_tracking WHERE user_id = ? AND day_index = ?",
            [user_id, day]
        );

        if (existing.length > 0) {
            try {
                const streakResult = await performCheckin(user_id, "Asia/Jakarta");
                await db.promise().query(
                    "UPDATE users SET current_streak = ?, best_streak = ? WHERE id = ?",
                    [streakResult.current_streak, streakResult.longest_streak, user_id]
                );
                return res.status(200).json({
                    message: "Tracking hari ini sudah tersimpan dan streak aktif",
                    streak: streakResult
                });
            } catch (e) {
                console.error("Sync streak on duplicate tracking error:", e);
                return res.status(400).json({ message: "Anda sudah melakukan tracking untuk hari ini" });
            }
        }

        // Hitung XP
        let xpGained = 0;
        if (sleep_hours !== undefined && sleep_hours !== null) xpGained += 40;
        if (walking_minutes !== undefined && walking_minutes !== null) xpGained += 40;
        if (nutrition_score !== undefined && nutrition_score !== null) xpGained += 40;

        // Insert
        await db.promise().query(
            "INSERT INTO daily_tracking (user_id, day_index, sleep_hours, walking_minutes, nutrition_score, xp_gained) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, day, sleep_hours, walking_minutes, nutrition_score, xpGained]
        );

        // Update XP
        const [users] = await db.promise().query("SELECT xp FROM users WHERE id = ?", [user_id]);
        let { xp } = users[0];
        xp += xpGained;
        await db.promise().query("UPDATE users SET xp = ? WHERE id = ?", [xp, user_id]);

        // ── Streak: Pakai sistem baru (user_streaks) ────────────────────────
        const streakResult = await performCheckin(user_id, "Asia/Jakarta");
        const current_streak = streakResult.current_streak;
        const best_streak = streakResult.longest_streak;

        // Sinkronisasi ke kolom users untuk backward compatibility
        await db.promise().query(
            "UPDATE users SET current_streak = ?, best_streak = ? WHERE id = ?",
            [current_streak, best_streak, user_id]
        );

        const newAchievements = [];

        // Achievement Logic
        if (await unlockAchievement(user_id, "FIRST_STEP")) newAchievements.push("FIRST_STEP");
        if (current_streak >= 7 && await unlockAchievement(user_id, "STREAK_7")) newAchievements.push("STREAK_7");
        if (current_streak >= 14 && await unlockAchievement(user_id, "STREAK_14")) newAchievements.push("STREAK_14");
        if (current_streak >= 30 && await unlockAchievement(user_id, "STREAK_30")) newAchievements.push("STREAK_30");
        
        const newLevel = Math.floor(xp / 500) + 1;
        if (newLevel >= 5 && await unlockAchievement(user_id, "LEVEL_5")) newAchievements.push("LEVEL_5");
        if (newLevel >= 10 && await unlockAchievement(user_id, "LEVEL_10")) newAchievements.push("LEVEL_10");

        return res.status(200).json({
            xp_gained: xpGained,
            total_xp: xp,
            level: newLevel,
            streak: streakResult,
            newAchievements
        });
    } catch (error) {
        console.error("Daily Tracking Error:", error);
        return res.status(500).json({ message: "Gagal menyimpan daily tracking", error: error.message });
    }
};

// 4. Submit Glucose Tracking
const submitGlucoseTracking = async (req, res) => {
    try {
        const { user_id, day, glucose_value } = req.body;

        if (!user_id || !day || !glucose_value) return res.status(400).json({ message: "Data tidak lengkap" });

        // Cek double submit
        const [existing] = await db.promise().query(
            "SELECT id FROM glucose_tracking WHERE user_id = ? AND day_index = ?",
            [user_id, day]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "Anda sudah mencatat gula darah untuk hari ini. Silakan kembali besok." });
        }

        await db.promise().query(
            "INSERT INTO glucose_tracking (user_id, day_index, glucose_value) VALUES (?, ?, ?)",
            [user_id, day, glucose_value]
        );

        await db.promise().query("UPDATE users SET xp = xp + 50 WHERE id = ?", [user_id]);

        const newAchievements = [];
        if (await unlockAchievement(user_id, "GLUCOSE_TRACKER")) newAchievements.push("GLUCOSE_TRACKER");

        // Forward AI (Obsolete/Removed)
        // AI Endpoint sudah tidak dipakai lagi


        return res.status(200).json({ xp_gained: 50, newAchievements });
    } catch (error) {
        console.error("Glucose Tracking Error:", error);
        return res.status(500).json({ message: "Gagal menyimpan glucose tracking", error: error.message });
    }
};

// 5. & 6. Assessment 30 & 90
const processAssessment = async (req, res, totalDays) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ message: "User ID wajib disertakan" });

        const [users] = await db.promise().query(
            "SELECT best_streak, sleep_target_hours, walking_target_minutes FROM users WHERE id = ?",
            [user_id]
        );
        if (users.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = users[0];

        const [daily] = await db.promise().query(
            "SELECT * FROM daily_tracking WHERE user_id = ? AND day_index <= ? ORDER BY day_index ASC",
            [user_id, totalDays]
        );
        const [glucose] = await db.promise().query(
            "SELECT * FROM glucose_tracking WHERE user_id = ? AND day_index <= ? ORDER BY day_index ASC",
            [user_id, totalDays]
        );

        if (daily.length === 0) return res.status(400).json({ message: "Tidak ada data tracking" });

        // Build arrays
        const sleepArr = daily.map(d => d.sleep_hours || 0);
        const walkArr = daily.map(d => d.walking_minutes || 0);
        const carbsArr = daily.map(d => 100 - (d.nutrition_score || 0)); // Simplifikasi carbs representation
        const glucArr = glucose.map(g => g.glucose_value || 0);

        // Stats
        const glucMean = glucArr.length > 0 ? ss.mean(glucArr) : 100;
        const glucStd = glucArr.length > 1 ? ss.standardDeviation(glucArr) : 0;
        
        let glucSlope = 0;
        if (glucose.length > 1) {
            const coords = glucose.map(g => [g.day_index, g.glucose_value]);
            const l = ss.linearRegression(coords);
            glucSlope = l.m;
        }

        const baseline_glucose = glucArr.length > 0 ? glucArr[0] : 100;
        
        const walkMean = sleepArr.length > 0 ? ss.mean(walkArr) : 0;
        const walkStd = sleepArr.length > 1 ? ss.standardDeviation(walkArr) : 0;
        const walkConsistency = walkMean > 0 ? (walkStd / walkMean) : 0;

        const sleepMean = sleepArr.length > 0 ? ss.mean(sleepArr) : 0;
        const sleepStd = sleepArr.length > 1 ? ss.standardDeviation(sleepArr) : 0;
        const sleepConsistency = sleepMean > 0 ? (sleepStd / sleepMean) : 0;

        const carbsMean = carbsArr.length > 0 ? ss.mean(carbsArr) : 0;

        const sleepAdherence = user.sleep_target_hours ? (sleepMean / user.sleep_target_hours) : 1;
        const walkAdherence = user.walking_target_minutes ? (walkMean / user.walking_target_minutes) : 1;

        // Correlation approximations (if lengths don't match, we pair up by day_index)
        let corrSleep = 0, corrWalk = 0, corrCarbs = 0;
        if (glucose.length > 1) {
            const pairs = [];
            glucose.forEach(g => {
                const d = daily.find(x => x.day_index === g.day_index);
                if(d) pairs.push({ gluc: g.glucose_value, sleep: d.sleep_hours, walk: d.walking_minutes, carbs: 100 - d.nutrition_score });
            });
            if (pairs.length > 1) {
                const pGluc = pairs.map(p => p.gluc);
                const pSleep = pairs.map(p => p.sleep);
                const pWalk = pairs.map(p => p.walk);
                const pCarbs = pairs.map(p => p.carbs);
                
                // ss.sampleCorrelation returns NaN if variance is 0, so fallback to 0
                corrSleep = ss.sampleCorrelation(pSleep, pGluc) || 0;
                corrWalk = ss.sampleCorrelation(pWalk, pGluc) || 0;
                corrCarbs = ss.sampleCorrelation(pCarbs, pGluc) || 0;
            }
        }

        let payload;

        if (totalDays === 30) {
            payload = {
                user_id: parseInt(user_id, 10),
                glucose_month1_mean: glucMean,
                glucose_month1_std: glucStd,
                glucose_slope_month1: glucSlope,
                baseline_glucose: baseline_glucose,
                steps_month1_mean: walkMean,
                steps_consistency_m1: walkConsistency,
                sleep_month1_mean: sleepMean,
                sleep_consistency_m1: sleepConsistency,
                carbs_month1_mean: carbsMean,
                sleep_adherence_m1: sleepAdherence,
                steps_adherence_m1: walkAdherence,
                max_streak_m1: user.best_streak,
                corr_sleep_glucose_m1: corrSleep,
                corr_steps_glucose_m1: corrWalk,
                corr_carbs_glucose_m1: corrCarbs
            };
        } else {
            // Day 90 Assessment Payload Schema
            const month1_glucose = glucose.filter(g => g.day_index <= 30).map(g => g.glucose_value);
            const month3_glucose = glucose.filter(g => g.day_index > 60 && g.day_index <= 90).map(g => g.glucose_value);
            
            payload = {
                user_id: String(user_id),
                month1_glucose_values: month1_glucose.length > 0 ? month1_glucose : [100], // Fallback if empty to avoid AI errors
                month3_glucose_values: month3_glucose.length > 0 ? month3_glucose : [100]
            };
        }

        const endpoint = totalDays === 30 ? "predict/day30" : "predict/day90";
        let aiResponseData = null;

        try {
            console.log(`[AI Assessment] Mengirim ke HuggingFace (${endpoint}):`, JSON.stringify(payload));
            const aiResponse = await axios.post(`${AI_BASE_URL}/${endpoint}`, payload, { timeout: 30000 });
            aiResponseData = aiResponse.data;
            console.log(`[AI Assessment] Response dari HuggingFace:`, JSON.stringify(aiResponseData));

            // Simpan ke analysis_results
            const finalPayload = {
                mode: totalDays === 30 ? "day30" : "day90",
                aiResult: aiResponseData,
                computed_stats: payload,
                timestamp: new Date().toISOString()
            };

            const sqlUpsertAnalysis = `
                INSERT INTO analysis_results (user_id, mode, result_data)
                VALUES (?, ?, ?)
            `;
            await db.promise().query(sqlUpsertAnalysis, [user_id, finalPayload.mode, JSON.stringify(finalPayload)]);
        } catch (aiError) {
            console.error(`[AI Assessment] Gagal menghubungi HuggingFace (${endpoint}):`, aiError.response?.data || aiError.message);
        }

        // Simpan hasil ke database
        let finalScore = totalDays === 30 ? 82 : 90; // Default or calculate from AI?
        // Check if aiResponseData has score
        if (aiResponseData && typeof aiResponseData === 'object' && aiResponseData.score !== undefined) {
            finalScore = aiResponseData.score;
        }

        let riskLevel = aiResponseData?.risk_level || (totalDays === 30 ? "Medium" : "Low");
        let summaryText = aiResponseData?.summary || `Evaluasi program ${totalDays} hari selesai.`;
        let recommendationText = aiResponseData?.recommendations || "Pertahankan gaya hidup sehat.";
        const rawData = JSON.stringify(aiResponseData);

        await db.promise().query(
            "INSERT INTO ai_evaluations (user_id, day_milestone, score, risk_level, summary, recommendation, raw_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, totalDays, finalScore, riskLevel, summaryText, recommendationText, rawData]
        );

        const bonusXp = totalDays === 30 ? 100 : 200;
        await db.promise().query("UPDATE users SET xp = xp + ? WHERE id = ?", [bonusXp, user_id]);

        const newAchievements = [];
        if (totalDays === 90) {
            if (await unlockAchievement(user_id, "PROGRAM_COMPLETED")) newAchievements.push("PROGRAM_COMPLETED");
        }

        return res.status(200).json({
            message: `Evaluasi ${totalDays} hari berhasil`,
            xp_gained: bonusXp,
            newAchievements,
            ai_data: aiResponseData,
            computed_stats: payload
        });

    } catch (error) {
        console.error(`Assessment ${totalDays} Error:`, error);
        return res.status(500).json({ message: "Gagal evaluasi", error: error.message });
    }
};

const assessment30 = (req, res) => processAssessment(req, res, 30);
const assessment90 = (req, res) => processAssessment(req, res, 90);

// 7. Get Daily Tracking Records (for Evaluasi page)
const getDailyTracking = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [rows] = await db.promise().query(
            "SELECT day_index, sleep_hours, walking_minutes, nutrition_score, created_at FROM daily_tracking WHERE user_id = ? ORDER BY day_index ASC",
            [user_id]
        );
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error("Get Daily Tracking Error:", error);
        return res.status(500).json({ message: "Gagal mengambil data tracking harian", error: error.message });
    }
};

// 8. Get Glucose Tracking Records (for Evaluasi page)
const getGlucoseTracking = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [rows] = await db.promise().query(
            "SELECT day_index, glucose_value, created_at FROM glucose_tracking WHERE user_id = ? ORDER BY day_index ASC",
            [user_id]
        );
        return res.status(200).json({ data: rows });
    } catch (error) {
        console.error("Get Glucose Tracking Error:", error);
        return res.status(500).json({ message: "Gagal memuat data gula darah", error: error.message });
    }
};

// 9. Get AI Evaluations History
const getAiEvaluations = async (req, res) => {
    try {
        const { user_id } = req.params;
        const [evals] = await db.promise().query(
            "SELECT * FROM ai_evaluations WHERE user_id = ? ORDER BY created_at DESC",
            [user_id]
        );
        return res.status(200).json(evals);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching evals", error: error.message });
    }
};

// 10. Cancel Plan
const cancelPlan = async (req, res) => {
    try {
        const { user_id } = req.body;
        if (!user_id) return res.status(400).json({ message: "User ID required" });

        // Hapus status enroll
        await db.promise().query(
            "UPDATE users SET plan_start_date = NULL WHERE id = ?",
            [user_id]
        );

        // Hapus histori tracking untuk mereset
        await db.promise().query("DELETE FROM daily_tracking WHERE user_id = ?", [user_id]);
        await db.promise().query("DELETE FROM glucose_tracking WHERE user_id = ?", [user_id]);
        await db.promise().query("DELETE FROM ai_evaluations WHERE user_id = ?", [user_id]);

        return res.status(200).json({ message: "Program berhasil dibatalkan dan di-reset" });
    } catch (error) {
        console.error("Cancel Plan Error:", error);
        return res.status(500).json({ message: "Gagal membatalkan program", error: error.message });
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
