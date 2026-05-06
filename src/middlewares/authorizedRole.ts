import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  role: string;
}

function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: "You don't have access",
      });
    }

    next();
  };
}

export default authorizeRoles;
