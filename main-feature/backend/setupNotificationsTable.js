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
    console.log("Database connected. Creating notifications table...");

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            icon VARCHAR(50),
            color VARCHAR(20),
            bg_color VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `;

    db.query(createTableQuery, (err) => {
        if (err) {
            console.error("Error creating notifications table:", err.message);
            process.exit(1);
        } else {
            console.log("Table 'notifications' created successfully.");
            
            // Insert dummy data for testing
            const dummyQuery = `
                INSERT INTO notifications (user_id, title, body, icon, color, bg_color)
                SELECT id, 'Selamat Datang di GluCare', 'Mulai perjalanan sehatmu sekarang dengan mengatur Program 90 Hari.', 'waving_hand_rounded', '0xFF10B981', '0xFFECFDF5'
                FROM users LIMIT 1
                ON DUPLICATE KEY UPDATE id=id;
            `;
            db.query(dummyQuery, (err) => {
                console.log("Dummy data inserted (if applicable).");
                process.exit(0);
            });
        }
    });
});
