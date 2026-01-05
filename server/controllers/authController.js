// server/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOTP } = require("../utils/emailService");
const { createOTP, verifyOTP } = require("../utils/otpStorage");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "campkartsecret";
const OTP_EXPIRY = Number(process.env.OTP_EXPIRY_MINUTES) || 10;

// Remove password before sending user to frontend
const sanitizeUser = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  const { password, ...safe } = user;
  return safe;
};

// Admins are identified ONLY by their role: "admin" in the database.
// No hardcoded email lists allowed.


/* ============================================================
    STEP 1 — REQUEST OTP
   ============================================================ */
exports.requestOTP = async (req, res) => {
  try {
    const { name, email, password, phone, campus } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find if user exists in DB
    const user = await User.findOne({ email: normalizedEmail });

    // AUTH POLICY CHECK
    const isInstitutional = normalizedEmail.endsWith("@kletech.ac.in");

    // If it's a new signup (no user in DB), we ONLY allow institutional emails
    if (!user && !isInstitutional) {
      return res.status(403).json({
        message: "Only @kletech.ac.in emails allowed for new signups.",
      });
    }

    // Existing users (including Gmail admins already in DB) can request OTP
    if (user && !isInstitutional && user.role !== 'admin') {
      // This covers cases where a non-institutional email somehow got in but isn't an admin
      return res.status(403).json({ message: "Unauthorized account." });
    }

    // If it's a new signup (no user in DB), we require name/password
    if (!user) {
      if (!name || !password) {
        return res.status(400).json({ message: "Name and password required for signup" });
      }
    }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // save temporary user info + OTP
    // If user exists, we only need to verify them. If not, we store signup data.
    createOTP(
      normalizedEmail,
      otp,
      {
        name,
        email: normalizedEmail,
        password,
        phone,
        campus,
        isLoginOnly: !!user
      },
      OTP_EXPIRY
    );

    // send email OTP
    const displayName = user ? user.name : name;
    await sendOTP(normalizedEmail, otp, displayName);

    res.json({
      message: user ? "Login OTP sent" : "Signup OTP sent",
      email: normalizedEmail,
      expiresIn: OTP_EXPIRY,
      isExisting: !!user
    });
  } catch (err) {
    console.error("OTP Request Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ============================================================
    STEP 2 — VERIFY OTP & CREATE ACCOUNT
   ============================================================ */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const result = verifyOTP(normalizedEmail, otp);
    if (!result.success) {
      return res.status(400).json({
        message: result.message,
        attemptsLeft: result.attemptsLeft,
      });
    }

    const tempUser = result.tempUserData;
    let finalUser;

    if (tempUser.isLoginOnly) {
      // Existing User Flow
      finalUser = await User.findOne({ email: normalizedEmail });
      if (!finalUser) {
        return res.status(404).json({ message: "User record lost. Please signup again." });
      }
    } else {
      // Signup Flow
      // safety: double-check user does not already exist
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        finalUser = existing;
      } else {
        // Strict domain check again for safety
        if (!normalizedEmail.endsWith("@kletech.ac.in")) {
          return res.status(403).json({ message: "Only institutional emails allowed for signup." });
        }

        const hashedPassword = await bcrypt.hash(tempUser.password, 10);
        finalUser = await User.create({
          name: tempUser.name,
          email: normalizedEmail,
          phone: tempUser.phone,
          campus: tempUser.campus || "",
          password: hashedPassword,
          isVerifiedStudent: true,
        });
      }
    }

    // issue JWT token
    const token = jwt.sign(
      { id: finalUser._id, email: finalUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: tempUser.isLoginOnly ? "Login successful" : "Account verified successfully",
      token,
      user: sanitizeUser(finalUser),
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* ============================================================
    LOGIN
   ============================================================ */
exports.login = async (req, res) => {
  try {
    console.log("Login attempt:", { email: req.body.email, hasPassword: !!req.body.password });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Login failed: Missing email or password");
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // AUTH POLICY: 
    // 1. If email is @kletech.ac.in -> allowed
    // 2. If email is NOT @kletech.ac.in -> check if in AUTHORIZED_ADMINS
    const isInstitutional = normalizedEmail.endsWith("@kletech.ac.in");

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Role-based access enforcement
    if (!isInstitutional && user.role !== 'admin') {
      return res.status(403).json({
        message: "Access Denied. Only institutional emails or authorized admins allowed."
      });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log("Login failed: Invalid password for email:", normalizedEmail);
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Login successful for:", normalizedEmail);
    res.json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ============================================================
    GET CURRENT USER
   ============================================================ */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
