const { User } = require("../models/User");
const { UserProfile } = require("../models/UserProfile");
const otpService = require("../services/otpService"); // Import otpService

const moment = require("moment");
const jwt = require("jsonwebtoken");

// Controller to generate OTP
exports.generateOtp = async (req, res) => {
  try {
    const { mobile_number, email } = req.body;

    
    if (!mobile_number || !email) {
      return res.status(400).json({ error: "Both mobile number and email are required" });
    }

    console.log("Request received with mobile number:", mobile_number);

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobile_number)) {
      return res.status(400).json({ error: "Invalid mobile number format" });
    }

    
    const existingUser = await User.findOne({ mobile_number });

   
    const { otp, otpHash, otpExpiry } = otpService.generateOtp();

    console.log("Generated OTP:", otp);

   
    if (existingUser) {
      existingUser.otp = otpHash;
      existingUser.otp_expiry = otpExpiry;
      existingUser.created_at = new Date();
      await existingUser.save();
    } else {
      
      const newUser = new User({
        mobile_number,
        email,
        otp: otpHash,
        otp_expiry: otpExpiry,
        created_at: new Date(),
      });
      await newUser.save();
      
      
      const userProfile = new UserProfile({
        user_id: newUser._id,
        name: "Default Name", 
        address: "Default Address",
        email: newUser.email,
        mobile_number: newUser.mobile_number, 
        phone: newUser.mobile_number, 
      });
      
      await userProfile.save();
      newUser.userProfile = userProfile._id; 
      await newUser.save();
    }

    res.status(200).json({ status: "success", message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error generating OTP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller to validate OTP
exports.validateOtp = async (req, res) => {
  const { mobile_number, otp } = req.body;

  try {
    
    const user = await User.findOne({ mobile_number });

    if (!user) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    
    const { valid, message } = otpService.validateOtp(otp, user.otp, user.otp_expiry);

    if (!valid) {
      return res.status(400).json({ status: "error", message });
    }

    
    if (!user.userProfile) {
      const userProfile = new UserProfile({
        user_id: user._id,
        name: "Default Name", 
        address: "Default Address", 
        email: user.email,
        phone: user.mobile_number, 
      });

      await userProfile.save();
      user.userProfile = userProfile._id; 
      await user.save();
    }

   
    const accessToken = jwt.sign(
      { id: user._id, mobile_number: user.mobile_number },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );

    
    const refreshToken = jwt.sign(
      { id: user._id, mobile_number: user.mobile_number },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } 
    );

    
    return res.json({
      status: "success",
      message: "OTP validated and profile linked",
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error("Error validating OTP:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
