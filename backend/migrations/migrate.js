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
    console.log("Database connected untuk migration...");

    // Tabel Kuesioner (Sesuai Frontend)
    const createQuestionnairesTable = `
        CREATE TABLE IF NOT EXISTS questionnaires (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            usia VARCHAR(50),
            riwayat_keluarga VARCHAR(50),
            olahraga VARCHAR(50),
            makanan_manis VARCHAR(50),
            lingkar_pinggang VARCHAR(50),
            gejala_diabetes VARCHAR(50),
            jam_tidur VARCHAR(50),
            tingkat_stress VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    // Tabel Lab Results (Sesuai Frontend)
    const createLabResultsTable = `
        CREATE TABLE IF NOT EXISTS lab_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            hba1c FLOAT,
            gula_darah_puasa FLOAT,
            berat_badan FLOAT,
            tinggi_badan FLOAT,
            riwayat_keluarga VARCHAR(50),
            riwayat_diabetes VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    // Tabel Daily Logs (Untuk AI Monitoring)
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

    db.query("DROP TABLE IF EXISTS questionnaires", () => {
        db.query("DROP TABLE IF EXISTS lab_results", () => {
            db.query("DROP TABLE IF EXISTS daily_logs", () => {
                db.query(createQuestionnairesTable, (err) => {
                    if (err) {
                        console.error("Gagal membuat tabel questionnaires:", err);
                    } else {
                        console.log("Tabel 'questionnaires' berhasil dibuat sesuai frontend.");
                    }

                    db.query(createLabResultsTable, (err) => {
                        if (err) {
                            console.error("Gagal membuat tabel lab_results:", err);
                        } else {
                            console.log("Tabel 'lab_results' berhasil dibuat sesuai frontend.");
                        }
                        
                        db.query(createDailyLogsTable, (err) => {
                            if (err) {
                                console.error("Gagal membuat tabel daily_logs:", err);
                            } else {
                                console.log("Tabel 'daily_logs' berhasil dibuat sesuai frontend.");
                            }

                            db.end(() => {
                                console.log("Migration (Rebuild) selesai.");
                                process.exit(0);
                            });
                        });
                    });
                });
            });
        });
    });
});
