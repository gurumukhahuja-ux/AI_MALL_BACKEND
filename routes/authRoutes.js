import express from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/User.js";
import generateTokenAndSetCookies from "../utils/generateTokenAndSetCookies.js";
import { generateOTP } from "../utils/verifiacitonCode.js";
import { sendVerificationEmail } from "../utils/Email.js";

const router = express.Router();

// Test routes
router.get("/", (req, res) => {
  res.send("This is the auth");
});

router.get("/signup", (req, res) => {
  res.send("this is signup");
});

// ====================== SIGNUP =======================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    // Check user exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User Already Exists With This Email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateOTP();

    // Create user
    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      role: role || 'user',
      companyName: companyName || ''
    });

    // Generate token cookie
    const token = generateTokenAndSetCookies(res, newUser._id, newUser.email, newUser.name);

    // Try to send OTP email (non-blocking)
    try {
      await sendVerificationEmail(newUser.email, newUser.name, newUser.verificationCode);
    } catch (emailErr) {
      console.warn('Email sending failed (non-critical):', emailErr.message);
    }

    res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      message: "Account created successfully",
      token: token,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Server error during signup", details: err.message });
  }
});

// ====================== LOGIN =======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare hashed password
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate token
    const token = generateTokenAndSetCookies(res, user._id, user.email, user.name);

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      message: "LogIn Successfully",
      token: token,
      role: user.role
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
