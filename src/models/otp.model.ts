import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      unique: true,
    },

    otpHash: {
      type: String,
      required: [true, "OTP hash is required"],
    },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const OtpModel = mongoose.model("Otp", otpSchema);

export default OtpModel;
