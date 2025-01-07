const express = require("express");
const { generateOtp, validateOtp } = require("../controllers/AuthController");

const router = express.Router();


router.post("/generate-otp", generateOtp);
router.post("/validate-otp", validateOtp);

router.post("/refresh-token", async (req, res) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
  
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }
  
    try {
      
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }
  
      
      const newAccessToken = generateToken(user._id);
  
      res.json({ accessToken: newAccessToken });
    } catch (err) {
      console.error("Error refreshing token:", err);
      return res.status(401).json({ error: "Invalid refresh token" });
    }
  });
module.exports = router;
