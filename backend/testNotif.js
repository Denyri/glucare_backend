require("dotenv").config({ path: __dirname + "/.env" });
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) return console.error("DB Error:", err);

    // Ambil ID User pertama
    db.query("SELECT id FROM users LIMIT 1", (err, results) => {
        if (err || results.length === 0) {
            console.log("Tidak ada user ditemukan. Buat akun di aplikasi dulu!");
            process.exit(1);
        }
        
        const userId = results[0].id;
        console.log(`Mengirim notifikasi tes untuk User ID: ${userId}...`);

        const query = `
            INSERT INTO notifications (user_id, title, body, icon, color, bg_color) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId, 
            'Notifikasi Percobaan', 
            'Ini adalah pesan notifikasi untuk mengecek integrasi database. Sukses!', 
            'star_rounded', 
            '0xFFF59E0B', 
            '0xFFFFFBEB'
        ];

        db.query(query, values, (err) => {
            if (err) console.error("Gagal menambahkan notifikasi:", err);
            else console.log("Notifikasi berhasil ditambahkan! Silakan cek menu Riwayat Notifikasi di aplikasi Anda.");
            process.exit(0);
        });
    });
});
