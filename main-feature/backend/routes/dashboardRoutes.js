const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/dashboardController");
const passport = require("passport");

// GET /api/dashboard
router.get("/", passport.authenticate("jwt", { session: false }), getDashboardData);

module.exports = router;
