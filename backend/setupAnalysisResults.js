require("dotenv").config({ path: __dirname + "/.env" });
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
    console.log("Database connected untuk pembuatan tabel analysis_results...");

    const createAnalysisResultsTable = `
        CREATE TABLE IF NOT EXISTS analysis_results (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL UNIQUE,
            mode ENUM('clinical', 'questionnaire') NOT NULL,
            result_data JSON NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    db.query(createAnalysisResultsTable, (err) => {
        if (err) {
            console.error("Gagal membuat tabel analysis_results:", err);
        } else {
            console.log("Tabel analysis_results berhasil dibuat atau sudah ada.");
        }
        process.exit(0);
    });
});
