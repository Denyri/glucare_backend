const express = require("express");
const router = express.Router();
const { 
    enrollPlan, 
    getPlanData, 
    submitDailyTracking, 
    submitGlucoseTracking, 
    assessment30,
    assessment90,
    getDailyTracking,
    getGlucoseTracking,
    getAiEvaluations,
    cancelPlan
} = require("../controllers/planController");

router.post("/enroll", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Mendaftarkan pengguna ke program sehat 90 hari (Bisa manual atau otomatis preskripsi target dari AI).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Target harian pengguna (opsional, jika kosong akan otomatis diisi rekomendasi AI)',
            schema: {
                user_id: "usr_12345",
                sleep_target_hours: 8.0,
                walking_target_minutes: 40,
                nutrition_goal: "Defisit Kalori Ringan, Serat >= 30g/hari (Rekomendasi AI)"
            }
        } 
    */
    next();
}, enrollPlan);

router.get("/tracking/daily/:user_id", getDailyTracking);
router.get("/tracking/glucose/:user_id", getGlucoseTracking);
router.get("/daily/:user_id", getDailyTracking);
router.get("/glucose/:user_id", getGlucoseTracking);
router.get("/evaluations/:user_id", getAiEvaluations);
router.get("/:user_id", getPlanData);

router.post("/daily", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Menyimpan progres harian pengguna (Tracking Daily) dan mendapatkan evaluasi AI harian.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data harian',
            schema: {
                user_id: "usr_12345",
                day: 1,
                sleep_hours: 7.5,
                walking_minutes: 45,
                nutrition_score: 85
            }
        } 
    */
    next();
}, submitDailyTracking);

router.post("/glucose", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Menyimpan nilai gula darah pengguna (Tracking Glucose) dan mendapatkan analisis klinis AI ADA.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data gula darah harian',
            schema: {
                user_id: "usr_12345",
                day: 1,
                glucose_value: 104.0
            }
        } 
    */
    next();
}, submitGlucoseTracking);

router.post("/assessment30", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Meminta evaluasi AI untuk pencapaian Hari ke-30.'
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                user_id: 1
            }
        } 
    */
    next();
}, assessment30);

router.post("/assessment90", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Meminta evaluasi AI final untuk pencapaian Hari ke-90.'
        #swagger.parameters['body'] = {
            in: 'body',
            schema: {
                user_id: 1
            }
        } 
    */
    next();
}, assessment90);

router.post("/daily-tracking", submitDailyTracking);
router.post("/glucose-tracking", submitGlucoseTracking);
router.post("/assessment-30", assessment30);
router.post("/assessment-90", assessment90);
router.get("/data/:user_id", getPlanData);

router.post("/cancel", cancelPlan);

module.exports = router;
