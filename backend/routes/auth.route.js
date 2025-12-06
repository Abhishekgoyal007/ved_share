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
  verifyPassword
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Registration flow
router.post("/signup", signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOtp);

// login/logout
router.post("/login", login);
router.post("/logout", logout);

// forgot password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.post("/refresh-token", refreshToken);
router.post("/verify-password", protectRoute, verifyPassword);
router.get("/profile", protectRoute, getProfile);

export default router;
