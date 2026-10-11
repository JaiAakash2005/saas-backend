const mongoose = require("mongoose");

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      select: false,
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema,
);
