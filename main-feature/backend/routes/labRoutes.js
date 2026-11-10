const express = require("express");
const router = express.Router();
const { submitLabResult, getLabResult } = require("../controllers/labController");

// POST /api/lab/submit - Submit Hasil Lab Klinis
router.post("/submit", (req, res, next) => {
    /*  #swagger.tags = ['Lab Assessment']
        #swagger.description = 'Submit data hasil pemeriksaan laboratorium klinis pasien untuk analisis risiko prediabetes.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Parameter data klinis dan lab lengkap',
            required: true,
            schema: {
                user_id: "usr_12345",
                age: 32,
                gender: 1,
                glucose_fasting: 105.0,
                waist_cm: 88.0,
                weight: 74.5,
                height: 170.0,
                hdl: 48.0,
                triglycerides: 145.0,
                bp_systolic: 122,
                bp_diastolic: 78
            }
        }
    */
    next();
}, submitLabResult);

// GET /api/lab/:user_id - Ambil Hasil Lab Terakhir
router.get("/:user_id", (req, res, next) => {
    /*  #swagger.tags = ['Lab Assessment']
        #swagger.description = 'Mengambil data riwayat hasil lab klinis pasien berdasarkan User ID.'
    */
    next();
}, getLabResult);

module.exports = router;
