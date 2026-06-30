const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { sendOtpEmail } = require("../config/mailer");
const { generateOtp } = require('../utils/otpHelper');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = async (req, res) => {
    const { fullname, email, password, gender, birth_date } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (fullname, email, password, gender, birth_date) VALUES (?, ?, ?, ?, ?)";

        db.query(sql, [fullname, email, hashedPassword, gender || null, birth_date || null], (err, result) => {
            if (err) {
                console.log(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Email sudah terdaftar!" });
                }
                return res.status(500).json({ message: "Register gagal" });
            }

            const token = jwt.sign(
                { id: result.insertId, email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.status(201).json({
                message: "Register berhasil",
                token,
                user: {
                    id: result.insertId,
                    fullname,
                    email,
                    is_completed: 0,
                    gender: gender || null,
                    birth_date: birth_date || null
                },
            });
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const loginUser = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Server error" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        if (user.is_completed === 0) {

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            return res.status(200).json({
                message: "Lengkapi data terlebih dahulu",
                redirectTo: "/input",
                token,
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    email: user.email,
                    is_completed: user.is_completed,
                    gender: user.gender,
                    birth_date: user.birth_date
                }
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                is_completed: user.is_completed,
                gender: user.gender,
                birth_date: user.birth_date
            },
        });
    });
};

const inputData = (req, res) => {
    const { userId, nama, jeniskelamin, tanggallahir, noTelp } = req.body;

    const sql = `
        UPDATE users 
        SET
            fullname = ?,
            gender = ?,
            birth_date = ?,
            phone = ?,
            is_completed = 1
        WHERE id = ?
    `;

    db.query(
        sql, [nama, jeniskelamin, tanggallahir, noTelp, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal simpan profile",
                });
            }

            db.query("SELECT * FROM users WHERE id = ?",
                [userId],
                (err, result) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Gagal mengambil data user",
                        });
                    }

                    const { password, ...userWithoutPassword } = result[0];

                    res.status(200).json({
                        message: "Profile berhasil dilengkapi",
                        user: userWithoutPassword,
                    });
                }
            );
        }
    );
};

const getProfile = (req, res) => {
    const { id } = req.params;

    const sql = "SELECT * FROM users WHERE id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Server error",
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan",
            });
        }

        const { password, ...userWithoutPassword } = result[0];

        res.status(200).json(userWithoutPassword);
    });
};

const updateProfile = (req, res) => {
    const { id } = req.params;
    const { fullname, gender, email, phone, birth_date } = req.body;

    const sql = `UPDATE users SET fullname=?, gender=?, email=?, phone=?, birth_date=? WHERE id=?`;

    db.query(
        sql, [fullname, gender, email, phone, birth_date, id],
        (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Gagal update profile",
                });
            }

            db.query("SELECT * FROM users WHERE id = ?",
                [id], (err, result) => {
                    if (err) {
                        return registerUser.status(500).json({
                            message: "Gagal mengambil data user",
                        });
                    }

                    const { password, ...userWithoutPassword } = result[0];

                    res.status(200).json({
                        message: "Profile berhasil diupdate",
                        user: result[0],
                    });
                }
            );
        }
    );
};

const uploadPhoto = (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({
            message: "File tidak ditemukan",
        });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const sql = `UPDATE users SET profile_image = ? WHERE id = ?`;

    db.query(sql, [imagePath, id], (err) => {
        if (err) {
            return res.status(500).json({
                message: "Gagal upload foto",
            });
        }

        res.status(200).json({
            message: "Upload berhasil", imagePath
        });
    });
};

const changePassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [id], async (err, result) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (result.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

        const user = result[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Password lama salah" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateSql = "UPDATE users SET password = ? WHERE id = ?";

        db.query(updateSql, [hashedPassword, id], (err) => {
            if (err) return res.status(500).json({ message: "Gagal update password" });
            res.status(200).json({ message: "Password berhasil diubah" });
        });
    });
};

const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        // Check if user already exists
        const checkSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkSql, [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Server error" });
            }

            if (result.length > 0) {
                // User exists, log them in
                const user = result[0];
                const jwtToken = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    message: "Login berhasil",
                    token: jwtToken,
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        is_completed: user.is_completed,
                        profile_image: user.profile_image,
                        gender: user.gender,
                        birth_date: user.birth_date
                    }
                });
            } else {
                // User does not exist, register them
                const dummyPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10);
                const insertSql = "INSERT INTO users (fullname, email, password, profile_image, is_completed) VALUES (?, ?, ?, ?, 0)";
                db.query(insertSql, [name, email, dummyPassword, picture], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error(insertErr);
                        return res.status(500).json({ message: "Gagal membuat user baru" });
                    }

                    const insertId = insertResult.insertId;
                    const jwtToken = jwt.sign(
                        { id: insertId, email },
                        process.env.JWT_SECRET,
                        { expiresIn: "1d" }
                    );

                    res.status(201).json({
                        message: "Register dan Login berhasil",
                        token: jwtToken,
                        user: {
                            id: insertId,
                            fullname: name,
                            email,
                            is_completed: 0,
                            profile_image: picture,
                            gender: null,
                            birth_date: null
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error("Google ID Token Verification Error:", error);
        res.status(400).json({ message: "Token Google tidak valid" });
    }
};

const facebookLogin = async (req, res) => {
    const { token } = req.body;

    try {
        // Fetch user data from Facebook Graph API using native fetch
        const fbResponse = await fetch(
            `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`
        );

        if (!fbResponse.ok) {
            return res.status(400).json({ message: "Token Facebook tidak valid" });
        }

        const payload = await fbResponse.json();
        const { name, email, picture } = payload;
        const profileImage = picture?.data?.url || null;

        // Check if user already exists
        const checkSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkSql, [email], async (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Server error" });
            }

            if (result.length > 0) {
                // User exists, log them in
                const user = result[0];
                const jwtToken = jwt.sign(
                    { id: user.id, email: user.email },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                );

                return res.status(200).json({
                    message: "Login berhasil",
                    token: jwtToken,
                    user: {
                        id: user.id,
                        fullname: user.fullname,
                        email: user.email,
                        is_completed: user.is_completed,
                        profile_image: user.profile_image,
                        gender: user.gender,
                        birth_date: user.birth_date
                    }
                });
            } else {
                // User does not exist, register them
                const dummyPassword = await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10);
                const insertSql = "INSERT INTO users (fullname, email, password, profile_image, is_completed) VALUES (?, ?, ?, ?, 0)";
                db.query(insertSql, [name, email, dummyPassword, profileImage], (insertErr, insertResult) => {
                    if (insertErr) {
                        console.error(insertErr);
                        return res.status(500).json({ message: "Gagal membuat user baru" });
                    }

                    const insertId = insertResult.insertId;
                    const jwtToken = jwt.sign(
                        { id: insertId, email },
                        process.env.JWT_SECRET,
                        { expiresIn: "1d" }
                    );

                    res.status(201).json({
                        message: "Register dan Login berhasil",
                        token: jwtToken,
                        user: {
                            id: insertId,
                            fullname: name,
                            email,
                            is_completed: 0,
                            profile_image: profileImage,
                            gender: null,
                            birth_date: null
                        }
                    });
                });
            }
        });
    } catch (error) {
        console.error("Facebook Login Error:", error);
        res.status(500).json({ message: "Terjadi kesalahan sistem saat memproses login Facebook" });
    }
};

const forgetPassword = (req, res) => {
    const { email } = req.body;
    console.log('1 forgetPassword hit, email:' , email);

    if (!email) {
        return res.status(400).json({ message: 'Email wajib diisi' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, users) => {
        console.log('2 query users result:', err, users);
        if (err) return res.status(500).json({ message: 'Server error' });

        if (users.length === 0) {
        return res.status(404).json({ message: 'Email tidak terdaftar' });
        }

        const userId = users[0].id;

        db.query('DELETE FROM forget_password WHERE user_id = ?', [userId], (err) => {
            console.log('3 delete old OTP:', err);
        if (err) return res.status(500).json({ message: 'Server error' });

        const otp = generateOtp();
        console.log('4 OTP generated:', otp);
        db.query(
            'INSERT INTO forget_password (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
            [userId, otp],
            async (err) => {
                console.log('5 insert OTP result:', err);
            if (err) return res.status(500).json({ message: 'Server error' });

            try {
                await sendOtpEmail(email, otp);
                console.log('6 email sent');
                return res.status(200).json({ message: 'OTP berhasil dikirim ke email kamu' });
            } catch (mailErr) {
                console.error('X gagal kirim email:', mailErr);
                console.error('Gagal kirim email:', mailErr);
                return res.status(500).json({ message: 'Gagal mengirim email OTP' });
            }
            }
        );
        });
    });
};

const verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email dan OTP wajib diisi' });
    }

    db.query('SELECT id FROM users WHERE email = ?', [email], (err, users) => {
        if (err) return res.status(500).json({ message: 'Server error' });

        if (users.length === 0) {
        return res.status(404).json({ message: 'Email tidak ditemukan' });
        }

        const userId = users[0].id;

        db.query(
        `SELECT * FROM forget_password WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
        [userId],
        (err, recentRows) => {
            if (err) return res.status(500).json({ message: 'Server error' });

            if (recentRows.length === 0) {
            return res.status(400).json({ message: 'Belum ada OTP yang diminta.' });
            }

            const latestOtp = recentRows[0];
            const nowTime = new Date();
            const expTime = new Date(latestOtp.expires_at);

            if (String(latestOtp.otp).trim() !== String(otp).trim()) {
                return res.status(400).json({ message: `OTP salah. (Tersimpan: ${latestOtp.otp})` });
            }
            if (latestOtp.is_used) {
                return res.status(400).json({ message: 'OTP ini sudah terpakai.' });
            }
            if (expTime < nowTime) {
                return res.status(400).json({ message: `OTP sudah kadaluwarsa. Server time issue.` });
            }

            db.query(
            'UPDATE forget_password SET is_used = TRUE WHERE id = ?',
            [latestOtp.id],
            (err) => {
                if (err) return res.status(500).json({ message: 'Server error' });

                const resetToken = jwt.sign(
                { userId },
                process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'glucare_secret_key',
                { expiresIn: '10m' }
                );

                return res.status(200).json({ message: 'OTP valid', resetToken });
            }
            );
        }
        );
    });
};


const resetPassword = async (req, res) => {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Konfirmasi password tidak cocok' });
    }
    if (newPassword.length < 8) {
        return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    let decoded;
    try {
        decoded = jwt.verify(resetToken, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET || 'glucare_secret_key');
    } catch (err) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    const userId = decoded.userId;

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Gagal update password' });

        db.query('DELETE FROM forget_password WHERE user_id = ?', [userId], (err) => {
            if (err) return res.status(500).json({ message: 'Server error' });

            return res.status(200).json({ message: 'Password berhasil direset, silakan login' });
        });
        });
    } catch (error) {
        console.error('resetPassword error:', error);
        return res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = { 
    registerUser, loginUser, inputData, 
    getProfile, uploadPhoto, updateProfile, 
    changePassword, googleLogin, facebookLogin, 
    forgetPassword, verifyOtp, resetPassword};
