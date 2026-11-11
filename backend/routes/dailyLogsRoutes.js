const express = require("express");
const router = express.Router();
const passport = require("passport");
const { cekHariIni, simpanLog } = require("../controllers/dailyLogsController"); 

const auth = passport.authenticate("jwt", { session: false });

router.get("/today", auth, (req, res, next) => {
    /*  #swagger.tags = ['Daily Logs (Tracking)']
        #swagger.description = 'Mengecek apakah user sudah mengisi log harian untuk hari ini.'
    */
    next();
}, cekHariIni);

router.post("/", auth, (req, res, next) => {
    /*  #swagger.tags = ['Daily Logs (Tracking)']
        #swagger.description = 'Menyimpan log harian manual di luar program 90 Hari.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data log harian',
            schema: {
                glucose_mean: 110.5,
                steps: 5000,
                sleep_hours: 8,
                carbs_g: 200
            }
        } 
    */
    next();
}, simpanLog);

module.exports = router;