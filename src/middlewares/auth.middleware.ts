import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized - No access Token",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as CustomJwtPayload;

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized - No access Token",
    });
  }
}
