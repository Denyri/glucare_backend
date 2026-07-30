const db = require("../config/db");

// ─── Config ────────────────────────────────────────────────────────────────
const MAX_FREEZE_COUNT = 3;          // Maksimal freeze yang bisa dimiliki user
const FREEZE_EARN_STREAK_MULTIPLE = 7; // Dapatkan freeze tiap kelipatan 7 hari streak

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Dapatkan tanggal "hari ini" dalam timezone user (format: YYYY-MM-DD)
 */
const getTodayInTimezone = (timezone = "Asia/Jakarta") => {
    const now = new Date();
    const formatted = now.toLocaleDateString("en-CA", { timeZone: timezone });
    return formatted; // format: YYYY-MM-DD
};

/**
 * Konversi Date object (dari kolom DATE MySQL atau JS Date) ke string YYYY-MM-DD secara aman (tanpa pergeseran zona waktu UTC).
 */
const toDateStringSafe = (dateVal) => {
    if (!dateVal) return null;
    if (typeof dateVal === "string") return dateVal.split("T")[0];
    if (dateVal instanceof Date) {
        const year = dateVal.getFullYear();
        const month = String(dateVal.getMonth() + 1).padStart(2, "0");
        const day = String(dateVal.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }
    return String(dateVal).split("T")[0];
};

/**
 * Hitung selisih hari antara dua string tanggal YYYY-MM-DD
 */
const dateDiffInDays = (dateStr1, dateStr2) => {
    const d1 = new Date(dateStr1 + "T00:00:00Z");
    const d2 = new Date(dateStr2 + "T00:00:00Z");
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

/**
 * Hitung jam tersisa sebelum streak hangus (hari berikutnya di timezone user)
 */
const hoursUntilBreak = (timezone = "Asia/Jakarta") => {
    const now = new Date();
    // Cari tengah malam hari berikutnya di timezone user
    const tomorrowMidnight = new Date(
        new Date().toLocaleDateString("en-US", { timeZone: timezone }) + " 23:59:59"
    );
    // Pendekatan lebih akurat: gunakan Intl
    const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const endOfDay = new Date(nowInTz);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay - nowInTz;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
};

/**
 * Tentukan status streak user
 */
const getStreakStatus = (lastActivityDate, today, timezone) => {
    if (!lastActivityDate) return "broken";
    const diff = dateDiffInDays(lastActivityDate, today);
    if (diff === 0) return "active";
    if (diff === 1) return "at_risk"; // belum checkin hari ini, tapi masih bisa
    return "broken";
};

// ─── Ensure user_streaks record exists ─────────────────────────────────────
const ensureStreakRecord = async (conn, user_id) => {
    await conn.query(
        `INSERT IGNORE INTO user_streaks (user_id) VALUES (?)`,
        [user_id]
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// 1. POST /streak/checkin
// ═══════════════════════════════════════════════════════════════════════════
const performCheckinInternal = async (user_id, timezone = "Asia/Jakarta") => {
    if (!user_id) throw new Error("user_id wajib diisi");
    const conn = db.promise();
    try {
        await conn.query("START TRANSACTION");

        const [rows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [user_id]
        );

        if (rows.length === 0) {
            await conn.query(
                `INSERT INTO user_streaks (user_id, timezone) VALUES (?, ?)`,
                [user_id, timezone]
            );
        }

        const [freshRows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [user_id]
        );
        const streak = freshRows[0];

        const today = getTodayInTimezone(streak.timezone || timezone);
        const lastDate = toDateStringSafe(streak.last_activity_date);

        if (lastDate && dateDiffInDays(lastDate, today) === 0) {
            await conn.query("COMMIT");
            return {
                success: true,
                status: "already_checked_in",
                message: "Kamu sudah checkin hari ini",
                data: {
                    current_streak: streak.current_streak,
                    longest_streak: streak.longest_streak,
                    freeze_count: streak.freeze_count,
                    last_activity_date: lastDate,
                },
            };
        }

        let newStreak = streak.current_streak;
        let newLongest = streak.longest_streak;
        let newFreezeCount = streak.freeze_count;
        let freezeUsedDates = streak.freeze_used_dates
            ? (typeof streak.freeze_used_dates === "string"
                ? JSON.parse(streak.freeze_used_dates)
                : streak.freeze_used_dates)
            : [];

        let status;
        let message;
        let logType = "checkin";

        if (!lastDate) {
            newStreak = 1;
            newLongest = Math.max(newLongest, newStreak);
            status = "started";
            message = "Streak dimulai! Selamat datang! 🎉";
        } else {
            const diff = dateDiffInDays(lastDate, today);

            if (diff === 1) {
                newStreak += 1;
                newLongest = Math.max(newLongest, newStreak);
                status = "continued";
                message = `Streak berlanjut! ${newStreak} hari berturut-turut 🔥`;
            } else if (diff === 2) {
                if (newFreezeCount > 0) {
                    const missedDate = new Date(lastDate + "T00:00:00Z");
                    missedDate.setDate(missedDate.getDate() + 1);
                    const missedDateStr = toDateStringSafe(missedDate);

                    freezeUsedDates.push(missedDateStr);
                    newFreezeCount -= 1;
                    newStreak += 1;
                    newLongest = Math.max(newLongest, newStreak);
                    status = "streak_saved_by_freeze";
                    message = `Streak diselamatkan oleh Freeze! ❄️ Sisa freeze: ${newFreezeCount}`;
                    logType = "freeze_used";

                    await conn.query(
                        `INSERT INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'freeze_used')`,
                        [user_id, missedDateStr]
                    );
                } else {
                    newStreak = 1;
                    status = "streak_broken";
                    message = "Streak putus... Semangat mulai lagi! 💪";
                }
            } else {
                newStreak = 1;
                status = "streak_broken";
                message = `Streak putus setelah ${diff - 1} hari absen. Mulai lagi! 💪`;
            }
        }

        await conn.query(
            `UPDATE user_streaks 
             SET current_streak = ?, longest_streak = ?, last_activity_date = ?,
                 freeze_count = ?, freeze_used_dates = ?, timezone = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [newStreak, newLongest, today, newFreezeCount, JSON.stringify(freezeUsedDates), timezone, user_id]
        );

        if (logType === "checkin") {
            await conn.query(
                `INSERT INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'checkin')
                 ON DUPLICATE KEY UPDATE type = 'checkin'`,
                [user_id, today]
            );
        } else {
            await conn.query(
                `INSERT IGNORE INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'checkin')`,
                [user_id, today]
            );
        }

        let earnedFreeze = false;
        if (
            newStreak % FREEZE_EARN_STREAK_MULTIPLE === 0 &&
            newFreezeCount < MAX_FREEZE_COUNT
        ) {
            newFreezeCount = Math.min(newFreezeCount + 1, MAX_FREEZE_COUNT);
            await conn.query(
                `UPDATE user_streaks SET freeze_count = ? WHERE user_id = ?`,
                [newFreezeCount, user_id]
            );
            earnedFreeze = true;
        }

        await conn.query("COMMIT");
        return {
            success: true,
            status,
            message,
            data: {
                current_streak: newStreak,
                longest_streak: newLongest,
                freeze_count: newFreezeCount,
                last_activity_date: today,
                earned_freeze: earnedFreeze,
            },
        };
    } catch (error) {
        await conn.query("ROLLBACK");
        throw error;
    }
};

const checkin = async (req, res) => {
    const { user_id, timezone = "Asia/Jakarta" } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }

    try {
        const result = await performCheckinInternal(user_id, timezone);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Streak checkin error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. POST /streak/freeze/earn — Tambah freeze (dipanggil dari sistem reward)
// ═══════════════════════════════════════════════════════════════════════════
const earnFreeze = async (req, res) => {
    const { user_id, amount = 1 } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }

    const conn = db.promise();
    try {
        await conn.query("START TRANSACTION");
        await ensureStreakRecord(conn, user_id);

        const [rows] = await conn.query(
            `SELECT freeze_count FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [user_id]
        );
        const current = rows[0].freeze_count;

        if (current >= MAX_FREEZE_COUNT) {
            await conn.query("COMMIT");
            return res.status(400).json({
                success: false,
                message: `Freeze sudah mencapai maksimum (${MAX_FREEZE_COUNT})`,
                data: { freeze_count: current },
            });
        }

        const newCount = Math.min(current + amount, MAX_FREEZE_COUNT);
        await conn.query(
            `UPDATE user_streaks SET freeze_count = ? WHERE user_id = ?`,
            [newCount, user_id]
        );

        await conn.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: `Freeze berhasil ditambahkan ❄️`,
            data: { freeze_count: newCount },
        });
    } catch (error) {
        await conn.query("ROLLBACK");
        console.error("Earn freeze error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. POST /streak/freeze/use — Gunakan freeze secara manual
// ═══════════════════════════════════════════════════════════════════════════
const useFreeze = async (req, res) => {
    const { user_id, timezone = "Asia/Jakarta" } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "user_id wajib diisi" });
    }

    const conn = db.promise();
    try {
        await conn.query("START TRANSACTION");
        await ensureStreakRecord(conn, user_id);

        const [rows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [user_id]
        );
        const streak = rows[0];

        if (streak.freeze_count <= 0) {
            await conn.query("COMMIT");
            return res.status(400).json({
                success: false,
                message: "Freeze tidak tersedia",
                data: { freeze_count: 0 },
            });
        }

        const today = getTodayInTimezone(streak.timezone || timezone);
        let freezeUsedDates = streak.freeze_used_dates
            ? (typeof streak.freeze_used_dates === "string"
                ? JSON.parse(streak.freeze_used_dates)
                : streak.freeze_used_dates)
            : [];

        // Cek apakah sudah pakai freeze hari ini
        if (freezeUsedDates.includes(today)) {
            await conn.query("COMMIT");
            return res.status(400).json({
                success: false,
                message: "Freeze sudah digunakan hari ini",
            });
        }

        freezeUsedDates.push(today);
        const newFreezeCount = streak.freeze_count - 1;

        await conn.query(
            `UPDATE user_streaks 
             SET freeze_count = ?, freeze_used_dates = ?, last_activity_date = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [newFreezeCount, JSON.stringify(freezeUsedDates), today, user_id]
        );

        await conn.query(
            `INSERT IGNORE INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'freeze_used')`,
            [user_id, today]
        );

        await conn.query("COMMIT");

        return res.status(200).json({
            success: true,
            message: `Freeze digunakan untuk hari ini ❄️`,
            data: {
                freeze_count: newFreezeCount,
                freeze_used_date: today,
                current_streak: streak.current_streak,
            },
        });
    } catch (error) {
        await conn.query("ROLLBACK");
        console.error("Use freeze error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. GET /streak/:userId — Ambil info streak user
// ═══════════════════════════════════════════════════════════════════════════
const getStreak = async (req, res) => {
    const { userId } = req.params;

    const conn = db.promise();
    try {
        await ensureStreakRecord(conn, userId);

        const timezone = "Asia/Jakarta";
        const today = getTodayInTimezone(timezone);

        // Auto-sync: Cek apakah user sudah melakukan tracking di daily_tracking hari ini (DATE(created_at) = today)
        // atau log checkin di streak_activity_logs, agar status streak sinkron ke 'active'
        const [dailyRows] = await conn.query(
            `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
            [userId, today]
        );
        const [logRows] = await conn.query(
            `SELECT id FROM streak_activity_logs WHERE user_id = ? AND activity_date = ? AND type = 'checkin'`,
            [userId, today]
        );

        let [rows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ?`,
            [userId]
        );
        let streak = rows[0] || {};
        let lastDate = streak.last_activity_date ? toDateStringSafe(streak.last_activity_date) : null;

        if ((dailyRows.length > 0 || logRows.length > 0) && lastDate !== today) {
            try {
                // Jalankan performCheckinInternal otomatis
                await performCheckinInternal(userId, timezone);
                const [rowsAfter] = await conn.query(
                    `SELECT * FROM user_streaks WHERE user_id = ?`,
                    [userId]
                );
                if (rowsAfter.length > 0) {
                    streak = rowsAfter[0];
                    lastDate = toDateStringSafe(streak.last_activity_date);
                }
            } catch (syncErr) {
                console.error("Auto-sync inside getStreak error:", syncErr);
            }
        }

        const status = getStreakStatus(lastDate, today, timezone);
        const hours = hoursUntilBreak(timezone);

        return res.status(200).json({
            success: true,
            data: {
                user_id: streak.user_id || userId,
                current_streak: streak.current_streak || 0,
                longest_streak: streak.longest_streak || 0,
                freeze_count: streak.freeze_count !== undefined ? streak.freeze_count : 0,
                last_activity_date: lastDate,
                status,
                hours_until_break: status === "at_risk" ? hours : null,
                timezone,
            },
        });
    } catch (error) {
        console.error("Get streak error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. GET /streak/:userId/history?days=30 — Kalender aktivitas
// ═══════════════════════════════════════════════════════════════════════════
const getStreakHistory = async (req, res) => {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;
    const monthView = req.query.month === "true" || req.query.view === "month";

    if (!monthView && !([30, 60, 90].includes(days))) {
        return res.status(400).json({ success: false, message: "days harus 30, 60, atau 90" });
    }

    const conn = db.promise();
    try {
        await ensureStreakRecord(conn, userId);
        const [rows] = await conn.query(
            `SELECT user_id, timezone FROM user_streaks WHERE user_id = ?`,
            [userId]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        const timezone = rows[0].timezone || "Asia/Jakarta";
        const today = getTodayInTimezone(timezone);

        let calendar = [];
        if (monthView) {
            const [todayYearStr, todayMonthStr] = today.split("-");
            const year = parseInt(req.query.year) || parseInt(todayYearStr);
            const month = parseInt(req.query.m) || parseInt(req.query.month_num) || parseInt(todayMonthStr);
            const yearStr = String(year);
            const monthStr = String(month).padStart(2, "0");

            const daysInMonth = new Date(year, month, 0).getDate();
            const firstDateOfMonth = `${yearStr}-${monthStr}-01`;
            const lastDateOfMonth = `${yearStr}-${monthStr}-${String(daysInMonth).padStart(2, "0")}`;

            const [logs] = await conn.query(
                `SELECT activity_date, type 
                 FROM streak_activity_logs 
                 WHERE user_id = ? 
                   AND activity_date >= ? AND activity_date <= ?
                 ORDER BY activity_date ASC`,
                [userId, firstDateOfMonth, lastDateOfMonth]
            );

            const logMap = {};
            for (const log of logs) {
                const dateStr = toDateStringSafe(log.activity_date);
                logMap[dateStr] = log.type;
            }

            if (!logMap[today]) {
                const [dailyRows] = await conn.query(
                    `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
                    [userId, today]
                );
                if (dailyRows.length > 0) {
                    try {
                        await performCheckinInternal(userId, timezone);
                    } catch (syncErr) {
                        console.error("Auto-sync inside getStreakHistory error:", syncErr);
                    }
                    logMap[today] = "checkin";
                }
            }

            for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                const dayPadded = String(dayNum).padStart(2, "0");
                const dateStr = `${yearStr}-${monthStr}-${dayPadded}`;
                let type = "missed";
                if (logMap[dateStr]) {
                    type = logMap[dateStr];
                } else if (dateStr === today) {
                    type = "today";
                } else if (dateStr > today) {
                    type = "future";
                }
                calendar.push({
                    date: dateStr,
                    type: type,
                });
            }
        } else {
            // Ambil semua log dalam rentang hari
            const [logs] = await conn.query(
                `SELECT activity_date, type 
                 FROM streak_activity_logs 
                 WHERE user_id = ? 
                   AND activity_date >= DATE_SUB(?, INTERVAL ? DAY)
                 ORDER BY activity_date DESC`,
                [userId, today, days]
            );

            // Buat map tanggal → tipe
            const logMap = {};
            for (const log of logs) {
                const dateStr = toDateStringSafe(log.activity_date);
                logMap[dateStr] = log.type;
            }

            if (!logMap[today]) {
                const [dailyRows] = await conn.query(
                    `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
                    [userId, today]
                );
                if (dailyRows.length > 0) {
                    try {
                        await performCheckinInternal(userId, timezone);
                    } catch (syncErr) {
                        console.error("Auto-sync inside getStreakHistory error:", syncErr);
                    }
                    logMap[today] = "checkin";
                }
            }

            // Buat array kalender dari today mundur N hari
            for (let i = 0; i < days; i++) {
                const d = new Date(today + "T00:00:00Z");
                d.setDate(d.getDate() - i);
                const dateStr = toDateStringSafe(d);
                calendar.push({
                    date: dateStr,
                    type: logMap[dateStr] || (dateStr === today ? "today" : "missed"),
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                user_id: userId,
                view: monthView ? "month" : "days",
                days_requested: monthView ? calendar.length : days,
                calendar,
            },
        });
    } catch (error) {
        console.error("Get streak history error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL: performCheckin — dipanggil dari planController tanpa HTTP layer
// ═══════════════════════════════════════════════════════════════════════════
const performCheckin = async (user_id, timezone = "Asia/Jakarta") => {
    try {
        const res = await performCheckinInternal(user_id, timezone);
        if (res && res.data) {
            return { ...res, ...res.data };
        }
        return res;
    } catch (error) {
        console.error("performCheckin error:", error);
        return { status: "error", current_streak: 0, longest_streak: 0, freeze_count: 0 };
    }
};

module.exports = {
    checkin,
    earnFreeze,
    useFreeze,
    getStreak,
    getStreakHistory,
    performCheckin,  // Internal use by planController
};
