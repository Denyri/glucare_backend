const express = require("express");
const router = express.Router();
const {
    checkin,
    earnFreeze,
    useFreeze,
    getStreak,
    getStreakHistory,
} = require("../controllers/streakController");

// POST /api/streak/checkin
router.post("/checkin", checkin);

// POST /api/streak/freeze/earn
router.post("/freeze/earn", earnFreeze);

// POST /api/streak/freeze/use
router.post("/freeze/use", useFreeze);

// GET /api/streak/:userId
router.get("/:userId", getStreak);

// GET /api/streak/:userId/history?days=30
router.get("/:userId/history", getStreakHistory);

module.exports = router;
