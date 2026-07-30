require('dotenv').config();
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
db.connect(err => {
    if (err) return console.log(err);
    db.query('CREATE TABLE IF NOT EXISTS ai_evaluations (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, day_milestone INT NOT NULL, score INT, risk_level VARCHAR(50), summary TEXT, recommendation TEXT, raw_data JSON, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)', err => {
        if (err) console.log(err);
        else console.log('Table ai_evaluations created');
        db.end();
    });
});
