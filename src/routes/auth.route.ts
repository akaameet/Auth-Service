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
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);
router.post("/logout-All", logoutAll);

export default router;
