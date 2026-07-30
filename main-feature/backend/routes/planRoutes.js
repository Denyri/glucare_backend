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
        #swagger.description = 'Mendaftarkan pengguna ke program sehat 90 hari.'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Target harian pengguna',
            schema: {
                user_id: 1,
                sleep_target_hours: 8,
                walking_target_minutes: 30,
                nutrition_goal: 100
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
        #swagger.description = 'Menyimpan progres harian pengguna (Tracking Daily).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data harian',
            schema: {
                user_id: 1,
                day: 1,
                sleep_hours: 7,
                walking_minutes: 45,
                nutrition_score: 85
            }
        } 
    */
    next();
}, submitDailyTracking);

router.post("/glucose", (req, res, next) => {
    /*  #swagger.tags = ['Program Plan']
        #swagger.description = 'Menyimpan nilai gula darah pengguna (Tracking Glucose).'
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'Data gula darah',
            schema: {
                user_id: 1,
                day: 1,
                glucose_value: 95
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

router.post("/cancel", cancelPlan);

module.exports = router;
