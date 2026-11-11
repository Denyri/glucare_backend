const db = require("../config/db");

// ─── Config ────────────────────────────────────────────────────────────────
const MAX_FREEZE_COUNT = 3;
const FREEZE_EARN_STREAK_MULTIPLE = 7;

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Dapatkan tanggal "hari ini" dalam timezone user (format: YYYY-MM-DD)
 */
const getTodayInTimezone = (timezone = "Asia/Jakarta") => {
    const now = new Date();
    return now.toLocaleDateString("en-CA", { timeZone: timezone });
};

/**
 * Konversi Date object ke string YYYY-MM-DD secara aman (tanpa timezone shift)
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
 * Hitung jam tersisa sebelum streak hangus
 */
const hoursUntilBreak = (timezone = "Asia/Jakarta") => {
    const now = new Date();
    const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const endOfDay = new Date(nowInTz);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay - nowInTz;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
};

/**
 * Tentukan status streak user (active, at_risk, broken)
 */
const getStreakStatus = (lastActivityDate, today, timezone) => {
    if (!lastActivityDate) return "broken";
    const diff = dateDiffInDays(lastActivityDate, today);
    if (diff === 0) return "active";
    if (diff === 1) return "at_risk";
    return "broken";
};

/**
 * Pastikan baris user_streaks ada di database
 */
const ensureStreakRecord = async (conn, user_id) => {
    const uid = String(user_id);
    await conn.query(
        `INSERT IGNORE INTO user_streaks (user_id) VALUES (?)`,
        [uid]
    );
};

// ─── Service Methods ───────────────────────────────────────────────────────

/**
 * Catat checkin streak user
 */
const performCheckin = async (user_id, timezone = "Asia/Jakarta") => {
    if (!user_id) throw new Error("user_id wajib diisi");
    const uid = String(user_id);
    const conn = db.promise();

    await conn.query("START TRANSACTION");
    try {
        const [rows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [uid]
        );

        if (rows.length === 0) {
            await conn.query(
                `INSERT INTO user_streaks (user_id, timezone) VALUES (?, ?)`,
                [uid, timezone]
            );
        }

        const [freshRows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [uid]
        );
        const streak = freshRows[0];

        const today = getTodayInTimezone(streak.timezone || timezone);
        const lastDate = toDateStringSafe(streak.last_activity_date);

        // Jika sudah checkin hari ini
        if (lastDate && dateDiffInDays(lastDate, today) === 0) {
            await conn.query("COMMIT");
            return {
                success: true,
                status: "already_checked_in",
                message: "Kamu sudah checkin hari ini",
                current_streak: streak.current_streak,
                longest_streak: streak.longest_streak,
                freeze_count: streak.freeze_count,
                last_activity_date: lastDate,
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
            message = "Konsistensi harian dimulai! Tetap jaga pola hidup sehat.";
        } else {
            const diff = dateDiffInDays(lastDate, today);

            if (diff === 1) {
                newStreak += 1;
                newLongest = Math.max(newLongest, newStreak);
                status = "continued";
                message = `Konsistensi berlanjut! ${newStreak} hari aktif berturut-turut.`;
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
                        [uid, missedDateStr]
                    );
                } else {
                    newStreak = 1;
                    status = "streak_broken";
                    message = "Catatan konsistensi dimulai kembali hari ini.";
                }
            } else {
                newStreak = 1;
                status = "streak_broken";
                message = `Catatan konsistensi dimulai kembali setelah jeda.`;
            }
        }

        await conn.query(
            `UPDATE user_streaks 
             SET current_streak = ?, longest_streak = ?, last_activity_date = ?,
                 freeze_count = ?, freeze_used_dates = ?, timezone = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [newStreak, newLongest, today, newFreezeCount, JSON.stringify(freezeUsedDates), timezone, uid]
        );

        // Sinkronisasi ke tabel users
        await conn.query(
            `UPDATE users SET current_streak = ?, best_streak = ? WHERE id = ?`,
            [newStreak, newLongest, uid]
        );

        if (logType === "checkin") {
            await conn.query(
                `INSERT INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'checkin')
                 ON DUPLICATE KEY UPDATE type = 'checkin'`,
                [uid, today]
            );
        } else {
            await conn.query(
                `INSERT IGNORE INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'checkin')`,
                [uid, today]
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
                [newFreezeCount, uid]
            );
            earnedFreeze = true;
        }

        await conn.query("COMMIT");

        return {
            success: true,
            status,
            message,
            current_streak: newStreak,
            longest_streak: newLongest,
            freeze_count: newFreezeCount,
            last_activity_date: today,
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

/**
 * Ambil status streak user
 */
const getStreak = async (user_id) => {
    const uid = String(user_id);
    const conn = db.promise();
    await ensureStreakRecord(conn, uid);

    const timezone = "Asia/Jakarta";
    const today = getTodayInTimezone(timezone);

    // Auto-sync jika sudah ada log tracking hari ini
    const [dailyRows] = await conn.query(
        `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
        [uid, today]
    );
    const [logRows] = await conn.query(
        `SELECT id FROM streak_activity_logs WHERE user_id = ? AND activity_date = ? AND type = 'checkin'`,
        [uid, today]
    );

    let [rows] = await conn.query(
        `SELECT * FROM user_streaks WHERE user_id = ?`,
        [uid]
    );
    let streak = rows[0] || {};
    let lastDate = streak.last_activity_date ? toDateStringSafe(streak.last_activity_date) : null;

    if ((dailyRows.length > 0 || logRows.length > 0) && lastDate !== today) {
        try {
            await performCheckin(uid, timezone);
            const [rowsAfter] = await conn.query(
                `SELECT * FROM user_streaks WHERE user_id = ?`,
                [uid]
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

    return {
        user_id: streak.user_id || uid,
        current_streak: streak.current_streak || 0,
        longest_streak: streak.longest_streak || 0,
        freeze_count: streak.freeze_count !== undefined ? streak.freeze_count : 0,
        last_activity_date: lastDate,
        status,
        is_checked_in_today: lastDate === today,
        hours_until_break: status === "at_risk" ? hours : null,
        timezone,
    };
};

/**
 * Ambil riwayat kalender streak user (hari/bulan)
 */
const getStreakHistory = async (user_id, days = 30, monthView = false, reqYear = null, reqMonth = null) => {
    const uid = String(user_id);
    const numDays = Math.min(Math.max(parseInt(days) || 30, 1), 90);
    const conn = db.promise();

    await ensureStreakRecord(conn, uid);
    const [rows] = await conn.query(
        `SELECT user_id, timezone FROM user_streaks WHERE user_id = ?`,
        [uid]
    );
    if (rows.length === 0) {
        throw new Error("User tidak ditemukan");
    }

    const timezone = rows[0].timezone || "Asia/Jakarta";
    const today = getTodayInTimezone(timezone);

    let calendar = [];
    if (monthView) {
        const [todayYearStr, todayMonthStr] = today.split("-");
        const year = parseInt(reqYear) || parseInt(todayYearStr);
        const month = parseInt(reqMonth) || parseInt(todayMonthStr);
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
            [uid, firstDateOfMonth, lastDateOfMonth]
        );

        const logMap = {};
        for (const log of logs) {
            const dateStr = toDateStringSafe(log.activity_date);
            logMap[dateStr] = log.type;
        }

        if (!logMap[today]) {
            const [dailyRows] = await conn.query(
                `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
                [uid, today]
            );
            if (dailyRows.length > 0) {
                try {
                    await performCheckin(uid, timezone);
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
        const [logs] = await conn.query(
            `SELECT activity_date, type 
             FROM streak_activity_logs 
             WHERE user_id = ? 
               AND activity_date >= DATE_SUB(?, INTERVAL ? DAY)
             ORDER BY activity_date DESC`,
            [uid, today, numDays]
        );

        const logMap = {};
        for (const log of logs) {
            const dateStr = toDateStringSafe(log.activity_date);
            logMap[dateStr] = log.type;
        }

        if (!logMap[today]) {
            const [dailyRows] = await conn.query(
                `SELECT id FROM daily_tracking WHERE user_id = ? AND DATE(created_at) = ?`,
                [uid, today]
            );
            if (dailyRows.length > 0) {
                try {
                    await performCheckin(uid, timezone);
                } catch (syncErr) {
                    console.error("Auto-sync inside getStreakHistory error:", syncErr);
                }
                logMap[today] = "checkin";
            }
        }

        for (let i = 0; i < numDays; i++) {
            const d = new Date(today + "T00:00:00Z");
            d.setDate(d.getDate() - i);
            const dateStr = toDateStringSafe(d);
            calendar.push({
                date: dateStr,
                type: logMap[dateStr] || (dateStr === today ? "today" : "missed"),
            });
        }
    }

    return {
        user_id: uid,
        view: monthView ? "month" : "days",
        days_requested: monthView ? calendar.length : numDays,
        calendar,
    };
};

/**
 * Tambah freeze point untuk user
 */
const earnFreeze = async (user_id, amount = 1) => {
    const uid = String(user_id);
    const conn = db.promise();
    await conn.query("START TRANSACTION");
    try {
        await ensureStreakRecord(conn, uid);
        const [rows] = await conn.query(
            `SELECT freeze_count FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [uid]
        );
        const current = rows[0].freeze_count;

        if (current >= MAX_FREEZE_COUNT) {
            await conn.query("COMMIT");
            return {
                earned: false,
                freeze_count: current,
                message: `Freeze sudah mencapai maksimum (${MAX_FREEZE_COUNT})`,
            };
        }

        const newCount = Math.min(current + amount, MAX_FREEZE_COUNT);
        await conn.query(
            `UPDATE user_streaks SET freeze_count = ? WHERE user_id = ?`,
            [newCount, uid]
        );
        await conn.query("COMMIT");

        return {
            earned: true,
            freeze_count: newCount,
            message: "Freeze berhasil ditambahkan ❄️",
        };
    } catch (error) {
        await conn.query("ROLLBACK");
        throw error;
    }
};

/**
 * Gunakan freeze secara manual
 */
const useFreeze = async (user_id, timezone = "Asia/Jakarta") => {
    const uid = String(user_id);
    const conn = db.promise();
    await conn.query("START TRANSACTION");
    try {
        await ensureStreakRecord(conn, uid);
        const [rows] = await conn.query(
            `SELECT * FROM user_streaks WHERE user_id = ? FOR UPDATE`,
            [uid]
        );
        const streak = rows[0];

        if (streak.freeze_count <= 0) {
            await conn.query("COMMIT");
            return {
                used: false,
                freeze_count: 0,
                message: "Freeze tidak tersedia",
            };
        }

        const today = getTodayInTimezone(streak.timezone || timezone);
        let freezeUsedDates = streak.freeze_used_dates
            ? (typeof streak.freeze_used_dates === "string"
                ? JSON.parse(streak.freeze_used_dates)
                : streak.freeze_used_dates)
            : [];

        if (freezeUsedDates.includes(today)) {
            await conn.query("COMMIT");
            return {
                used: false,
                message: "Freeze sudah digunakan hari ini",
            };
        }

        freezeUsedDates.push(today);
        const newFreezeCount = streak.freeze_count - 1;

        await conn.query(
            `UPDATE user_streaks 
             SET freeze_count = ?, freeze_used_dates = ?, last_activity_date = ?, updated_at = NOW()
             WHERE user_id = ?`,
            [newFreezeCount, JSON.stringify(freezeUsedDates), today, uid]
        );

        await conn.query(
            `INSERT IGNORE INTO streak_activity_logs (user_id, activity_date, type) VALUES (?, ?, 'freeze_used')`,
            [uid, today]
        );

        await conn.query("COMMIT");

        return {
            used: true,
            freeze_count: newFreezeCount,
            freeze_used_date: today,
            current_streak: streak.current_streak,
            message: "Freeze digunakan untuk hari ini ❄️",
        };
    } catch (error) {
        await conn.query("ROLLBACK");
        throw error;
    }
};

module.exports = {
    performCheckin,
    getStreak,
    getStreakHistory,
    earnFreeze,
    useFreeze,
    getTodayInTimezone,
    toDateStringSafe,
};
