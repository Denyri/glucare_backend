const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;

        // Wrap queries in promises
        const queryDB = (sql, params) => new Promise((resolve, reject) => {
            db.query(sql, params, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // 1. Get User Info
        const userRows = await queryDB('SELECT * FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        const user = userRows[0];

        // Level & Program Day
        const level = Math.floor((user.xp || 0) / 100) + 1;
        let programDay = 1;
        if (user.plan_start_date) {
            const diffTime = Math.abs(new Date() - new Date(user.plan_start_date));
            programDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        }

        // 2. Get Analysis Results (Risk Score)
        const analysisRows = await queryDB('SELECT * FROM analysis_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
        let riskScore = 0;
        let riskStatus = 'Aman';
        if (analysisRows.length > 0 && analysisRows[0].result_data) {
            const resultData = typeof analysisRows[0].result_data === 'string' ? JSON.parse(analysisRows[0].result_data) : analysisRows[0].result_data;
            riskScore = resultData.risk_score || resultData.score || 0;
            riskStatus = resultData.risk_status || resultData.status || 'Aman';
        }

        // 3. Get Lab Results (Weight)
        const labRows = await queryDB('SELECT berat_badan, gula_darah_puasa FROM lab_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 2', [userId]);
        let weight = 0.0;
        let weightDifference = 0.0;
        if (labRows.length > 0) {
            weight = labRows[0].berat_badan || 0.0;
            if (labRows.length > 1) {
                weightDifference = parseFloat((weight - (labRows[1].berat_badan || 0)).toFixed(1));
            }
        }

        // 4. Get Glucose Tracking
        const glucoseRows = await queryDB('SELECT glucose_value FROM glucose_tracking WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
        let bloodSugar = 0;
        if (glucoseRows.length > 0 && glucoseRows[0].glucose_value) {
            bloodSugar = glucoseRows[0].glucose_value;
        } else if (labRows.length > 0 && labRows[0].gula_darah_puasa) {
            bloodSugar = labRows[0].gula_darah_puasa;
        }
        
        let bloodSugarStatus = 'Normal';
        if (bloodSugar > 125) bloodSugarStatus = 'Tinggi';
        else if (bloodSugar > 0 && bloodSugar < 70) bloodSugarStatus = 'Rendah';

        // 5. Get Daily Tracking (Missions for today)
        const todayTrackingRows = await queryDB('SELECT * FROM daily_tracking WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
        let isWalkingCompleted = false;
        let isSleepCompleted = false;
        if (todayTrackingRows.length > 0) {
            const track = todayTrackingRows[0];
            const isToday = new Date(track.created_at).toDateString() === new Date().toDateString();
            if (isToday) {
                isWalkingCompleted = (track.walking_minutes || 0) >= (user.walking_target_minutes || 30);
                isSleepCompleted = (track.sleep_hours || 0) >= (user.sleep_target_hours || 7);
            }
        }

        const missions = [
            { id: '1', title: 'Jalan Kaki', isCompleted: isWalkingCompleted, xpReward: 20 },
            { id: '2', title: 'Tidur Cukup', isCompleted: isSleepCompleted, xpReward: 20 },
            { id: '3', title: 'Minum Air', isCompleted: true, xpReward: 10 },
            { id: '4', title: 'Makan Sehat', isCompleted: false, xpReward: 25 },
        ];

        // Construct Response payload
        const dashboardData = {
            name: user.fullname || 'User',
            healthScore: 100 - (riskScore > 100 ? 100 : riskScore),
            healthStatus: riskStatus,
            programDay: programDay,
            programTotalDays: 90,
            xp: user.xp || 0,
            level: level,
            streak: user.current_streak || 0,
            riskScore: riskScore,
            riskStatus: riskStatus,
            weight: weight,
            weightDifference: weightDifference,
            bloodSugar: bloodSugar,
            bloodSugarStatus: bloodSugarStatus,
            missions: missions,
            insight: 'Terus tingkatkan aktivitas harian Anda untuk hasil maksimal!',
            recentActivities: [
                { id: '1', title: 'Tantangan Harian Diperbarui', time: 'Baru saja' }
            ]
        };

        res.status(200).json(dashboardData);

    } catch (error) {
        console.error("Error in getDashboardData:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
