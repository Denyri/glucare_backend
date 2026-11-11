const db = require("../config/db");

const TARGET_STEPS = 8000;
const TARGET_SLEEP = 7;

const cekHariIni = (req, res) => {
    const user_id = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    db.query(
        `SELECT day_idx, streak FROM daily_logs WHERE user_id = ? AND DATE(created_at) = ? LIMIT 1`,
        [user_id, today],
        (err, rows) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (rows.length > 0) {
                return res.json({ sudah_input: true, data: rows[0] });
            }
            return res.json({ sudah_input: false, data: null });
        }
    );
};

const simpanLog = (req, res) => {
    const user_id = req.user.id;
    const { glucose_mean, steps, sleep_hours, carbs_g } = req.body;
    const today = new Date().toISOString().slice(0, 10);

    db.query(
        `SELECT id FROM daily_logs WHERE user_id = ? AND DATE(created_at) = ? LIMIT 1`,
        [user_id, today],
        (err, existing) => {
            if (err) return res.status(500).json({ message: "Server error" });
            if (existing.length > 0) return res.status(409).json({ message: "Sudah input hari ini" });

            db.query(
                `SELECT COUNT(*) as total FROM daily_logs WHERE user_id = ?`,
                [user_id],
                (err, countRows) => {
                    if (err) return res.status(500).json({ message: "Server error" });
                    const day_idx = countRows[0].total + 1;

                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().slice(0, 10);

                    db.query(
                        `SELECT streak FROM daily_logs WHERE user_id = ? AND DATE(created_at) = ? LIMIT 1`,
                        [user_id, yesterdayStr],
                        (err, yesterdayLog) => {
                            if (err) return res.status(500).json({ message: "Server error" });
                            const streak = yesterdayLog.length > 0 ? yesterdayLog[0].streak + 1 : 1;

                            db.query(
                                `SELECT glucose_mean FROM daily_logs WHERE user_id = ? ORDER BY created_at ASC LIMIT 1`,
                                [user_id],
                                (err, firstLog) => {
                                    if (err) return res.status(500).json({ message: "Server error" });
                                    const baseline_glucose = firstLog.length > 0 ? firstLog[0].glucose_mean : glucose_mean;

                                    const target_steps_met = steps >= TARGET_STEPS ? 1 : 0;
                                    const target_sleep_met = sleep_hours >= TARGET_SLEEP ? 1 : 0;

                                    db.query(
                                        `INSERT INTO daily_logs (user_id, day_idx, glucose_mean, steps, sleep_hours, carbs_g, streak, baseline_glucose, target_steps_met, target_sleep_met) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                        [user_id, day_idx, glucose_mean, steps, sleep_hours, carbs_g, streak, baseline_glucose, target_steps_met, target_sleep_met],
                                        (err) => {
                                            if (err) return res.status(500).json({ message: "Server error" });
                                            return res.json({ day_idx, streak });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

module.exports = { cekHariIni, simpanLog };