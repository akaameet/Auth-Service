import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
const router = express.Router();

router.post("/register", registerUser);
router.get("/login", loginUser);

export default router;
