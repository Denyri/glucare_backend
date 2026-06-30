const express = require("express");
const router = express.Router();
const { submitKuesioner, getKuesioner } = require("../controllers/kuesionerController");

router.post("/submit", submitKuesioner);
router.get("/:user_id", getKuesioner);

module.exports = router;
