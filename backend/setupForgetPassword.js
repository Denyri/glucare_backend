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
    console.log("Database connected untuk pembuatan tabel forget password...");

    const createForgetPasswordTable = `
        CREATE TABLE IF NOT EXISTS forget_password (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            otp VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            is_used BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    db.query(createForgetPasswordTable, (err) => {
        if (err) {
            console.error("Gagal membuat tabel forget_password:", err);
        } else {
            console.log("Tabel 'forget_password' berhasil dibuat / sudah ada di database.");
        }
        
        db.end(() => {
            console.log("Proses selesai.");
            process.exit(0);
        });
    });
});
