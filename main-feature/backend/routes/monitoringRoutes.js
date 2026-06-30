const express = require("express");
const router = express.Router();
const { getPrediction } = require("../controllers/monitoringController");

router.post("/predict", getPrediction);

module.exports = router;
