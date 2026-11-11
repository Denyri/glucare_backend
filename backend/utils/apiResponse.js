/**
 * Standardized API Response Formatter for GluCare Backend
 * Provides unified, consistent JSON response structures across all endpoints
 * while maintaining backward compatibility with existing client consumers.
 */

const apiResponse = {
    /**
     * Send standard success response
     * @param {Object} res Express response object
     * @param {*} data Payload data to return
     * @param {string} message Human-readable success message
     * @param {number} statusCode HTTP status code (default: 200)
     */
    success: (res, data = null, message = "Success", statusCode = 200) => {
        const responseBody = {
            success: true,
            message,
            data: data !== null ? data : undefined,
        };

        // For backward compatibility: if data is a non-array object, spread keys to root
        if (data && typeof data === "object" && !Array.isArray(data)) {
            return res.status(statusCode).json({
                ...data,
                ...responseBody,
            });
        }

        return res.status(statusCode).json(responseBody);
    },

    /**
     * Send standard error response
     * @param {Object} res Express response object
     * @param {string} message Error description message
     * @param {number} statusCode HTTP status code (default: 500)
     * @param {*} error Detailed error info (for debugging/logging)
     */
    error: (res, message = "Terjadi kesalahan pada server", statusCode = 500, error = null) => {
        const responseBody = {
            success: false,
            message,
            error: error ? (error.message || String(error)) : undefined,
        };

        return res.status(statusCode).json(responseBody);
    },

    /**
     * Send 400 Bad Request
     */
    badRequest: (res, message = "Data permintaan tidak valid", error = null) => {
        return apiResponse.error(res, message, 400, error);
    },

    /**
     * Send 401 Unauthorized
     */
    unauthorized: (res, message = "Akses ditolak. Silakan login terlebih dahulu.") => {
        return apiResponse.error(res, message, 401);
    },

    /**
     * Send 403 Forbidden
     */
    forbidden: (res, message = "Anda tidak memiliki izin untuk mengakses resource ini.") => {
        return apiResponse.error(res, message, 403);
    },

    /**
     * Send 404 Not Found
     */
    notFound: (res, message = "Resource tidak ditemukan") => {
        return apiResponse.error(res, message, 404);
    },
};

module.exports = apiResponse;
