const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/apiResponse");

/**
 * Middleware untuk memverifikasi JWT Token pada protected API endpoints.
 * Menyuntikkan data user yang terdekripsi ke `req.user`.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        return apiResponse.unauthorized(res, "Token otentikasi tidak ditemukan. Silakan login.");
    }

    const secret = process.env.JWT_SECRET || "glucare_secret_key";

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return apiResponse.unauthorized(res, "Sesi login Anda telah berakhir. Silakan login kembali.");
            }
            return apiResponse.forbidden(res, "Token otentikasi tidak valid.");
        }

        req.user = decoded;
        next();
    });
};

/**
 * Middleware otentikasi opsional.
 * Jika token ada, decode dan suntikkan ke `req.user`. Jika tidak ada, lanjutkan tanpa error.
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        req.user = null;
        return next();
    }

    const secret = process.env.JWT_SECRET || "glucare_secret_key";
    jwt.verify(token, secret, (err, decoded) => {
        req.user = err ? null : decoded;
        next();
    });
};

module.exports = {
    authenticateToken,
    optionalAuth,
};
