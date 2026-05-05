import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Connected to Db");
  } catch (err) {
    console.log("Database connection failed:", err);
  }
}

export default connectDB;
