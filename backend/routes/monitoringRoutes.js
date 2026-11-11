const express = require("express");
const router = express.Router();
const { getPrediction } = require("../controllers/monitoringController");

// POST /api/monitoring/predict - Evaluasi Telemetri Hari ke-30
router.post("/predict", (req, res, next) => {
    /*  #swagger.tags = ['AI Monitoring']
        #swagger.description = 'Memprediksi lintasan metabolisme (trajectory status) pasien pada Hari ke-30 menggunakan telemetri 30 hari.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data log 30 hari pasien',
            required: true,
            schema: {
                patient_id: "usr_12345",
                records: [
                    {
                        day_idx: 0,
                        fpg_pred: 105.0,
                        glucose_mean: 108.5,
                        steps: 6500,
                        sleep_hours: 7.5,
                        carbs_g: 180.0
                    }
                ]
            }
        }
    */
    next();
}, getPrediction);

module.exports = router;
