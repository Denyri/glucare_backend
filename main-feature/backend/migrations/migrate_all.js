require("dotenv").config({ path: __dirname + "/../.env" });
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect(async (err) => {
    if (err) {
        console.error("Gagal terhubung ke database:", err);
        return process.exit(1);
    }
    console.log("Database connected untuk migration...");

    const promiseQuery = (sql) => {
        return new Promise((resolve, reject) => {
            db.query(sql, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    };

    try {
        console.log("Menghapus tabel yang ada...");
        // Drop tables in reverse order of foreign key dependencies
        await promiseQuery("DROP TABLE IF EXISTS user_achievements");
        await promiseQuery("DROP TABLE IF EXISTS glucose_tracking");
        await promiseQuery("DROP TABLE IF EXISTS daily_tracking");
        await promiseQuery("DROP TABLE IF EXISTS daily_logs");
        await promiseQuery("DROP TABLE IF EXISTS lab_results");
        await promiseQuery("DROP TABLE IF EXISTS questionnaires");
        await promiseQuery("DROP TABLE IF EXISTS contact_us");
        await promiseQuery("DROP TABLE IF EXISTS users");

        console.log("Membuat tabel...");

        // 1. Users Table
        await promiseQuery(`
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullname VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                gender VARCHAR(50),
                birth_date DATE,
                phone VARCHAR(50),
                is_completed TINYINT DEFAULT 0,
                profile_image VARCHAR(255),
                xp INT DEFAULT 0,
                current_streak INT DEFAULT 0,
                best_streak INT DEFAULT 0,
                plan_start_date DATE,
                sleep_target_hours FLOAT,
                walking_target_minutes INT,
                nutrition_goal VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Tabel 'users' berhasil dibuat.");

        // 2. Contact Us Table
        await promiseQuery(`
            CREATE TABLE contact_us (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Tabel 'contact_us' berhasil dibuat.");

        // 3. Questionnaires Table
        await promiseQuery(`
            CREATE TABLE questionnaires (
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
        `);
        console.log("Tabel 'questionnaires' berhasil dibuat.");

        // 4. Lab Results Table
        await promiseQuery(`
            CREATE TABLE lab_results (
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
        `);
        console.log("Tabel 'lab_results' berhasil dibuat.");

        // 5. Daily Logs Table (For AI)
        await promiseQuery(`
            CREATE TABLE daily_logs (
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
        `);
        console.log("Tabel 'daily_logs' berhasil dibuat.");

        // 6. Daily Tracking Table
        await promiseQuery(`
            CREATE TABLE daily_tracking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                day_index INT NOT NULL,
                sleep_hours FLOAT,
                walking_minutes INT,
                nutrition_score FLOAT,
                xp_gained INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Tabel 'daily_tracking' berhasil dibuat.");

        // 7. Glucose Tracking Table
        await promiseQuery(`
            CREATE TABLE glucose_tracking (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                day_index INT NOT NULL,
                glucose_value FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Tabel 'glucose_tracking' berhasil dibuat.");

        // 8. User Achievements Table
        await promiseQuery(`
            CREATE TABLE user_achievements (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                achievement_code VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Tabel 'user_achievements' berhasil dibuat.");

        console.log("🎉 Semua migration berhasil diselesaikan.");
    } catch (error) {
        console.error("Terjadi kesalahan saat migration:", error);
    } finally {
        db.end(() => {
            console.log("Koneksi database ditutup.");
            process.exit(0);
        });
    }
});
