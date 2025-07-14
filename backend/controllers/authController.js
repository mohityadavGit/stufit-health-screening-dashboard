import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import { generateOtp } from "../utils/generateOtp.js";
import OtpToken from "../models/OtpToken.js";

// 🔐 Admin Signup
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body; // email instead of username

    const exists = await Admin.findOne({ username: email });
    if (exists) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ username: email, password });
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔐 Admin Login → Sends OTP
export const login = async (req, res) => {
  try {
    console.log("Login route hit");
    
    const { email, password } = req.body; // email instead of username

    const admin = await Admin.findOne({ username: email });
    
    if (!admin) {
      console.log("User not found");
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("Invalid credentials")
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = generateOtp();

    await OtpToken.create({ email, otp });

    await sendEmail(email, "OTP Verification", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  OTP Verification → Returns JWT Token
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const validOtp = await OtpToken.findOne({ email, otp });
    if (!validOtp)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    await OtpToken.deleteMany({ email }); // Clean up used OTPs

    const admin = await Admin.findOne({ username: email });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//==========================================
// 🔄 1. Forgot Password (Send OTP)
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ username: email });
    if (!admin)
      return res
        .status(404)
        .json({ message: "Admin with this email does not exist" });

    const otp = generateOtp();

    await OtpToken.create({ email, otp, purpose: "forgotPassword" });

    await sendEmail(email, "Forgot Password OTP", otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email for password reset" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔄 2. Verify Forgot OTP (Return reset token)
export const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpDoc = await OtpToken.findOne({
      email,
      otp,
      purpose: "forgotPassword",
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await OtpToken.deleteMany({ email, purpose: "forgotPassword" }); // Cleanup OTPs

    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m", // 15 minutes reset token
    });

    res.status(200).json({
      message: "OTP verified. Use the token to reset your password.",
      resetToken: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const { newPassword } = req.body;

    if (!token || !newPassword)
      return res
        .status(400)
        .json({ message: "Token and new password are required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const admin = await Admin.findOne({ username: email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Reset link has expired" });
    }
    res.status(500).json({ message: error.message });
  }
};
