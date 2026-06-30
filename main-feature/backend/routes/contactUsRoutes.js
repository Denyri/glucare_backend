const express = require('express');
const router = express.Router();
const contactUsController = require("../controllers/contactUsController");

router.post("/send", contactUsController.sendMessage);

module.exports = router;