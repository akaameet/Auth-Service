import dotenv from "dotenv";
import userModel from "../models/user.model";
import type { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15min" },
    );
    res.cookie("token", token, {
      httpOnly: true, // Js (frontend can't access this protect from XSS attacks)
      secure: false, //only in development false later change to true in production for https
      sameSite: "strict", //Prevents sending cookie from other sites. Helps prevent CSRF attacks
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "User crested successfully",
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server Error",
    });
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

    const token = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "15min",
      },
    );

    res.cookie("token", token, {
      httpOnly: true, // Js (frontend can't access this protect from XSS attacks)
      secure: false, //only in development false later change to true in production for https
      sameSite: "strict", //Prevents sending cookie from other sites. Helps prevent CSRF attacks
      maxAge: 15 * 60 * 1000,
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

export { registerUser, loginUser };
