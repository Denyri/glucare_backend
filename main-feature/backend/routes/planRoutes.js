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
    getGlucoseTracking
} = require("../controllers/planController");

router.post("/enroll", enrollPlan);
router.get("/tracking/daily/:user_id", getDailyTracking);
router.get("/tracking/glucose/:user_id", getGlucoseTracking);
router.get("/:user_id", getPlanData);
router.post("/daily", submitDailyTracking);
router.post("/glucose", submitGlucoseTracking);
router.post("/assessment30", assessment30);
router.post("/assessment90", assessment90);

module.exports = router;
