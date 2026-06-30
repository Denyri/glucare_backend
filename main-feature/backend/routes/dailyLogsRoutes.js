const express = require("express");
const router = express.Router();
const passport = require("passport");
const { cekHariIni, simpanLog } = require("../controllers/dailyLogsController"); 

const auth = passport.authenticate("jwt", { session: false });

router.get("/today", auth, cekHariIni);
router.post("/", auth, simpanLog);

module.exports = router;