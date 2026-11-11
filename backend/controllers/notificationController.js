const db = require("../config/db");

// Ambil notifikasi berdasarkan user_id
exports.getNotifications = (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching notifications:", err);
            return res.status(500).json({ error: "Terjadi kesalahan pada server" });
        }
        res.json(results);
    });
};

// Tambah notifikasi baru (Bisa dipanggil oleh route atau controller lain)
exports.addNotification = (req, res) => {
    const { userId, title, body, icon, color, bgColor } = req.body;

    if (!userId || !title || !body) {
        return res.status(400).json({ error: "userId, title, dan body wajib diisi" });
    }

    const query = `
        INSERT INTO notifications (user_id, title, body, icon, color, bg_color) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
        userId, 
        title, 
        body, 
        icon || 'notifications_outlined', 
        color || '0xFF2563EB', 
        bgColor || '0xFFEFF6FF'
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error adding notification:", err);
            return res.status(500).json({ error: "Gagal menambahkan notifikasi" });
        }
        res.json({ message: "Notifikasi berhasil ditambahkan", id: result.insertId });
    });
};

// Helper internal untuk menambah notifikasi dari backend saja (bukan via API HTTP)
exports.createInternalNotification = (userId, title, body, icon, color, bgColor) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO notifications (user_id, title, body, icon, color, bg_color) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            userId, 
            title, 
            body, 
            icon || 'notifications_outlined', 
            color || '0xFF2563EB', 
            bgColor || '0xFFEFF6FF'
        ];
        db.query(query, values, (err, result) => {
            if (err) {
                console.error("Error adding internal notification:", err);
                return reject(err);
            }
            resolve(result);
        });
    });
};
