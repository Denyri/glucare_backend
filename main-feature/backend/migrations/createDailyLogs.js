require("dotenv").config({ path: __dirname + "/../.env" });
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("Gagal terhubung ke database:", err);
        return process.exit(1);
    }
    console.log("Database connected untuk pembuatan tabel daily_logs...");

    const createDailyLogsTable = `
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            day_idx INT NOT NULL,
            glucose_mean FLOAT,
            steps INT,
            sleep_hours FLOAT,
            carbs_g FLOAT,
            target_sleep_met FLOAT,
            target_steps_met FLOAT,
            streak INT,
            baseline_glucose FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    db.query(createDailyLogsTable, (err) => {
        if (err) {
            console.error("Gagal membuat tabel daily_logs:", err);
        } else {
            console.log("Tabel 'daily_logs' berhasil dibuat / sudah ada di database.");
        }
        
        db.end(() => {
            console.log("Proses selesai.");
            process.exit(0);
        });
    });
});
