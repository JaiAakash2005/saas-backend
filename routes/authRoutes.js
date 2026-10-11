const express = require("express");
const router = express.Router();

const {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  verifyResetOtp,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

// Registration with email verification
router.post("/register/request-otp", requestRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);

// Login
router.post("/login", login);

// Forgot and reset password
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

// Authenticated routes
router.get("/me", authMiddleware, getMe);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
