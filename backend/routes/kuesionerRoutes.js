const express = require("express");
const router = express.Router();
const { submitKuesioner, getKuesioner } = require("../controllers/kuesionerController");

// POST /api/kuesioner/submit - Submit Kuesioner Skrining
router.post("/submit", (req, res, next) => {
    /*  #swagger.tags = ['Questionnaire Assessment']
        #swagger.description = 'Submit data kuesioner skrining gaya hidup untuk evaluasi risiko prediabetes non-invasif.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Jawaban kuesioner pengguna',
            required: true,
            schema: {
                user_id: "usr_12345",
                bmi_category: 1,
                waist_category: 1,
                hypertension: 0,
                overweight_history: 1
            }
        }
    */
    next();
}, submitKuesioner);

// GET /api/kuesioner/:user_id - Ambil Data Kuesioner Pengguna
router.get("/:user_id", (req, res, next) => {
    /*  #swagger.tags = ['Questionnaire Assessment']
        #swagger.description = 'Mengambil data riwayat kuesioner pasien berdasarkan User ID.'
    */
    next();
}, getKuesioner);

module.exports = router;
