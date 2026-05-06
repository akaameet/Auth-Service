import authorizeRoles from "../middlewares/authorizedRole";
import { authMiddleware } from "../middlewares/auth.middleware";
import express from "express";
const router = express.Router();

router.get("/user", authMiddleware, authorizeRoles("user"), (req, res) => {
  res.json({
    user: (req as any).user,
  });
});

router.get("/admin", authMiddleware, authorizeRoles("admin"), (req, res) => {
  res.json({
    message: "Admin Dashboard",
  });
});

export default router;
