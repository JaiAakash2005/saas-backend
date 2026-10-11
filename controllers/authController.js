const userModel = require("../models/User");
const crypto = require("crypto");
const sendOtpEmail = require("../utils/sendOtpEmail");
const PendingRegistration = require("../models/PendingRegistration");
const jwt = require("jsonwebtoken");

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = require("jsonwebtoken").sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must differ from current password",
      });
    }

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;

    // Invalidate any pending password-reset OTP
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired reset session. Please verify your OTP again.",
      });
    }

    if (decoded.purpose !== "password-reset" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid password reset token.",
      });
    }

    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found.",
      });
    }

    user.password = password;

    // Invalidate any outstanding password-reset OTP.
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting the password.",
    });
  }
}

async function forgotPassword(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    const response = {
      success: true,
      message: "A reset OTP will be sent. Shortly",
    };

    if (!user) {
      return res.status(200).json(response);
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOtpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.resetOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOtpAttempts = 0;

    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      user.resetOtpHash = undefined;
      user.resetOtpExpiresAt = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      console.error("OTP email delivery failed:", emailError.message);

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP right now. Please try again later.",
      });
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function requestRegistrationOtp(req, res) {
  try {
    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    const existingUser = await userModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // Replace any previous pending registration for this email.
    await PendingRegistration.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name: name.trim(),
        email: normalizedEmail,
        otpHash,
        otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        otpAttempts: 0,
      },
      { upsert: true, new: true, runValidators: true },
    );

    try {
      await sendOtpEmail(normalizedEmail, otp);
    } catch (emailError) {
      await PendingRegistration.deleteOne({
        email: normalizedEmail,
        otpHash,
      });

      console.error("Registration OTP email failed:", emailError.message);

      return res.status(503).json({
        success: false,
        message: "Unable to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "If delivery succeeds, your verification OTP will arrive shortly.",
    });
  } catch (error) {
    console.error("Registration OTP error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

async function verifyRegistrationOtp(req, res) {
  try {
    const { email, otp, password } = req.body;

    if (!email?.trim() || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and password are required",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pending = await PendingRegistration.findOne({
      email: normalizedEmail,
    }).select("+otpHash +otpExpiresAt +otpAttempts");

    if (!pending || !pending.otpHash || !pending.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Request a new OTP.",
      });
    }

    if (pending.otpExpiresAt.getTime() <= Date.now()) {
      await PendingRegistration.deleteOne({ _id: pending._id });

      return res.status(400).json({
        success: false,
        message: "OTP expired. Request a new one.",
      });
    }

    if (pending.otpAttempts >= 5) {
      await PendingRegistration.deleteOne({ _id: pending._id });

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(pending.otpHash, "hex"),
    );

    if (!isValid) {
      pending.otpAttempts += 1;

      if (pending.otpAttempts >= 5) {
        await PendingRegistration.deleteOne({ _id: pending._id });
      } else {
        await pending.save();
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const existingUser = await userModel.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await PendingRegistration.deleteOne({ _id: pending._id });

      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }
    const user = await userModel.create({
      name: pending.name,
      email: normalizedEmail,
      password,
    });

    await PendingRegistration.deleteOne({ _id: pending._id });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(201).json({
      success: true,
      message: "Email verified and account created successfully",
      token,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration verification error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}
async function verifyResetOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email?.trim() || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message: "OTP must contain exactly 6 digits.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await userModel
      .findOne({ email: normalizedEmail })
      .select("+resetOtpHash +resetOtpExpiresAt +resetOtpAttempts");

    // Use a generic error so account existence isn't disclosed.
    if (!user || !user.resetOtpHash || !user.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Request a new one.",
      });
    }

    if (user.resetOtpExpiresAt.getTime() <= Date.now()) {
      user.resetOtpHash = undefined;
      user.resetOtpExpiresAt = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP expired. Request a new one.",
      });
    }

    if ((user.resetOtpAttempts || 0) >= 5) {
      user.resetOtpHash = undefined;
      user.resetOtpExpiresAt = undefined;
      user.resetOtpAttempts = 0;
      await user.save();

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const submittedHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(user.resetOtpHash, "hex"),
    );

    if (!isValid) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;

      if (user.resetOtpAttempts >= 5) {
        user.resetOtpHash = undefined;
        user.resetOtpExpiresAt = undefined;
        user.resetOtpAttempts = 0;
      }

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    user.resetOtpHash = undefined;
    user.resetOtpExpiresAt = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    // Issue a short-lived token exclusively for password reset.
    const resetToken = jwt.sign(
      {
        userId: user._id,
        purpose: "password-reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      resetToken,
    });
  } catch (error) {
    console.error("Reset OTP verification error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
}
module.exports = {
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  verifyResetOtp,
};
