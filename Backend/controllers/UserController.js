const { User } = require('../models/User');
const { UserProfile } = require('../models/UserProfile');
const { generateOtp, validateOtp } = require('../services/otpService');
const sendEmail = require('../services/emailService');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;  

    const user = await User.findById(userId).populate('userProfile');

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    return res.status(200).json({
      status: "success",
      userProfile: user.userProfile,
    });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  const { profile, mobile_number, otp } = req.body;

  try {
    const userId = req.user.id; 
    const user = await User.findById(userId).populate('userProfile');

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

   
    if (otp) {
      const otpValidationResult = validateOtp(otp, user.otp, user.otp_expiry);
      if (!otpValidationResult.valid) {
        return res.status(400).json({ status: "error", message: otpValidationResult.message });
      }
    }

    
    if (profile) {
      user.userProfile.name = profile.name || user.userProfile.name;
      user.userProfile.address = profile.address || user.userProfile.address;
      user.userProfile.email = profile.email || user.userProfile.email;
    }

   
    await user.userProfile.save();

    return res.status(200).json({ status: "success", message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};



exports.generateOtpForEmailChange = async (req, res) => {
  const { mobile_number, email } = req.body;

  try {
    const { otp, otpHash, otpExpiry } = generateOtp();

    let user = await User.findOne({ mobile_number });

    if (!user) {
      user = new User({
        mobile_number,
        email,
        otp: otpHash,
        otp_expiry: otpExpiry,
        created_at: new Date(),
      });
      await user.save();
    } else {
      user.otp = otpHash;
      user.otp_expiry = otpExpiry;
      await user.save();
    }

    const subject = "Your OTP for Email Update";
    const content = `<p>Your OTP for updating your email is: <strong>${otp}</strong></p>`;
    await sendEmail(email, subject, content);

    return res.status(200).json({ status: "success", message: "OTP sent successfully" });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
