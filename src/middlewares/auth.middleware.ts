import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  role: string;
}

async function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as CustomJwtPayload;
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          message: "You don't have access",
        });
      }
      (req as any).user = decoded;
      next();
    } catch (err) {
      res.status(401).json({
        message: "Unauthorized",
      });
    }
  };
}

export default authorizeRoles;
