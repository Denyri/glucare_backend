const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "glucare1",
    multipleStatements: true,
});

const migration = `
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id VARCHAR(255) PRIMARY KEY,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_activity_date DATE NULL,
    freeze_count INT NOT NULL DEFAULT 0,
    freeze_used_dates JSON NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Jakarta',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS streak_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    activity_date DATE NOT NULL,
    type ENUM('checkin', 'freeze_used') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, activity_date),
    INDEX idx_activity_user_date (user_id, activity_date)
);
`;

db.connect((err) => {
    if (err) {
        console.error("❌ Gagal connect ke database:", err.message);
        process.exit(1);
    }
    console.log("✅ Database connected");

    db.query(migration, (err2) => {
        if (err2) {
            console.error("❌ Migration gagal:", err2.message);
        } else {
            console.log("✅ Migration berhasil: tabel user_streaks & streak_activity_logs dibuat");
        }
        db.end();
    });
});
