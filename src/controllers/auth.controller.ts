import dotenv from "dotenv";
import userModel from "../models/user.model";
import type { Request, Response } from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

async function registerUser(req: Request, res: Response) {
  const { username, email, password, role = "user" } = req.body;

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
  );
  res.cookie("token", token);

  res.status(200).json({
    message: "User crested successfully",
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

export { registerUser };
