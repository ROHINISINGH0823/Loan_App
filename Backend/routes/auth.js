const express = require("express");
const User = require('../models/UserProfile');
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
} = require("../utils/authUtils");
const jwt = require("jsonwebtoken"); 
const router = express.Router();


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const accessToken = generateToken(user._id);  
    const refreshToken = generateRefreshToken(user._id);  
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); 

    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    res.status(201).json({ user: sanitizedUser, accessToken, refreshToken });
  } catch (err) {
    console.error("Error in /register route:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const accessToken = generateToken(user._id);  
    const refreshToken = generateRefreshToken(user._id);  
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 }); 

    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({ user: sanitizedUser, accessToken, refreshToken });
  } catch (err) {
    console.error("Error in /login route:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});




module.exports = router;
