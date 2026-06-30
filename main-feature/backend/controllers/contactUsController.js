const db = require("../config/db");

exports.sendMessage = (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "Semua field harus diisi!" });
    }

    const sql = `INSERT INTO contact_us (name, email, message) VALUES (?, ?, ?)`;

    db.query(sql, [name, email, message], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Gagal mengirim pesan" });
        }

        res.status(201).json({ message: "Pesan berhasil dikirim" });
    });
};
