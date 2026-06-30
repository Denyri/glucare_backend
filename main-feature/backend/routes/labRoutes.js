const express = require("express");
const router = express.Router();
const { submitLabResult, getLabResult } = require("../controllers/labController");

router.post("/submit", submitLabResult);
router.get("/:user_id", getLabResult);

module.exports = router;
