import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  logoutUser,
  refreshToken,
  logoutAll,
  resetPassword,
} from "../controllers/auth.controller";
import {
  forgotPasswordLimiter,
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from "../middlewares/rateLimit.middleware";
const router = express.Router();

router.post("/register", registerLimiter, registerUser);
router.post("/verify-email", otpLimiter, verifyEmail);
router.post("/login", loginLimiter, loginUser);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.post("/logout-All", logoutAll);

export default router;
