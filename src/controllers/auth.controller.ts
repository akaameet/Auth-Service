import dotenv from "dotenv";
import userModel from "../models/user.model";
import type { Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto, { hash } from "crypto";
import sessionModel from "../models/session.model";
import { generateOTP, generateOtpHTML } from "../utils/util";
import { sendEmail } from "../services/email.service";
import redisClient from "../config/redis.config";

dotenv.config();

interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: string;
}

async function registerUser(req: Request, res: Response) {
  const { username, email, password, role } = req.body;
  try {
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (isUserAlreadyExist) {
      return res.status(409).json({
        message: "User already exist",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username,
      email,
      password: hash,
      role,
    });

    const otp = generateOTP();
    const otpHtml = generateOtpHTML(otp);

    await sendEmail({
      to: email,
      subject: "Verify your email",
      text: `Your OTP is: ${otp}`,
      html: otpHtml,
    });
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await redisClient.set(`otp:${email}`, otpHash, {
      EX: 300,
    });
    console.log("OTP SAVED:", await redisClient.get(`otp:${email}`));

    res.status(201).json({
      message: "User registered. Please verify your email",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        verified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const { otp, email } = req.body;
    const hash = crypto.createHash("sha256").update(otp).digest("hex");

    const storedOtp = await redisClient.get(`otp:${email}`);

    if (!storedOtp) {
      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (storedOtp !== hash) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }
    const user = await userModel.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    await redisClient.del(`otp:${email}`);

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        username: user.username,
        email: user.email,
        verified: user.isVerified,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function loginUser(req: Request, res: Response) {
  const { username, email, password } = req.body;
  try {
    const user = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (!user) {
      return res.status(401).json({
        message: "User doesn't exist. Please register!",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid Credential",
      });
    }

    const refreshToken = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await sessionModel.create({
      user: user._id,
      refreshToken: refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "10min",
      },
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Js (frontend can't access this protect from XSS attacks)
      secure: false, //only in development false later change to true in production for https
      sameSite: "strict", //Prevents sending cookie from other sites. Helps prevent CSRF attacks
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User login successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json("Server Error");
  }
}

async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await redisClient.set(
      `passwordReset:${hashResetToken}`,
      user._id.toString(),
      {
        EX: 10 * 60, // 10 min
      },
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    });
    res.json({
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
}

async function resetPassword(req: Request, res: Response) {
  try {
    const token = req.query.token as string;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const userId = await redisClient.get(`passwordReset:${hashedToken}`);

    if (!userId) {
      return res.status(400).json({
        message: "Invalid or expired token",
      });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    await user.save();

    // Delete reset token from Redis
    await redisClient.del(`passwordReset:${hashedToken}`);

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function refreshToken(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "No refresh token",
      });
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    ) as CustomJwtPayload;

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
      refreshToken: hash,
      revoked: false,
    });
    if (!session) {
      return res.status(400).json({
        message: "No session found",
      });
    }

    //new rotation
    const newRefreshToken = jwt.sign(
      {
        id: decoded.id,
        role: decoded.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    session.refreshToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await session.save();

    const accessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15min" },
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      // This sends the NEW access token to frontend
      accessToken,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

async function logoutUser(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        message: "No refresh token",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    ) as CustomJwtPayload;

    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({
      refreshToken: hash,
      revoked: false,
    });

    if (session) {
      ((session.revoked = true), await session.save());
    }

    res.clearCookie("refreshToken");
    res.json({ message: "Logout user successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function logoutAll(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET as string,
    ) as CustomJwtPayload;

    await sessionModel.updateMany(
      {
        user: decoded.id,
        revoked: false,
      },
      { revoked: true },
    );
    res.clearCookie("refreshToken");

    res.json({
      message: "Logged out from all devices",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
}

export {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  logoutAll,
};
