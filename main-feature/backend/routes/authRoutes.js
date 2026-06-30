const express = require("express");
const router = express.Router();
const { 
    registerUser, loginUser, inputData, 
    getProfile, updateProfile, uploadPhoto, 
    changePassword, googleLogin, facebookLogin, 
    forgetPassword, verifyOtp, resetPassword 
    } = require("../controllers/authController");
const upload = require("../uploads/uploads");
const passport = require("passport");


router.post("/facebook", facebookLogin);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/inputData", inputData);
router.get("/profile/:id",
            passport.authenticate("jwt", { session: false}), getProfile,
            (req, res) => {
                res.json({
                    message: "Profile berhasil di akses",
                    user: req.user,
                });
            }
        );
router.put("/upload-photo/:id", upload.single("image"), uploadPhoto);
router.put("/update-profile/:id", updateProfile);
router.put("/change-password/:id", changePassword);
router.post('/forgot-password', forgetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);


module.exports = router;