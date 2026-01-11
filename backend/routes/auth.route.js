import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile,
  verifyOTP,
  resendOtp,
  forgotPassword,
  resetPassword,
  verifyPassword,
  googleAuth
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authLimiter, sensitiveRouteLimiter, verifyCaptcha } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Registration flow (with rate limiting and optional captcha)
router.post("/signup", authLimiter, verifyCaptcha, signup);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', sensitiveRouteLimiter, resendOtp);

// login/logout (with rate limiting)
router.post("/login", authLimiter, verifyCaptcha, login);
router.post("/logout", logout);

// Google Auth
router.post("/google", authLimiter, googleAuth);

// forgot password (with stricter rate limiting)
router.post('/forgot-password', sensitiveRouteLimiter, verifyCaptcha, forgotPassword);
router.post('/reset-password/:token', sensitiveRouteLimiter, resetPassword);

router.post("/refresh-token", refreshToken);
router.post("/verify-password", protectRoute, verifyPassword);
router.get("/profile", protectRoute, getProfile);

export default router;
