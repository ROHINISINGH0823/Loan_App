const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db"); // MongoDB connection setup
const otpRoutes = require("./routes/otp");
const emailRoutes = require("./routes/email");
const authRoutes = require("./routes/auth");
const rateLimit = require('express-rate-limit');
const profileRoutes = require('./routes/profile'); // Import the profile routes
dotenv.config();

const app = express();

// Enable CORS for frontend requests (React app running on localhost:3000)
app.use(
  cors({
    origin: "http://localhost:3000", // Your frontend URL
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Rate Limiting for OTP requests
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // Limit each IP to 5 OTP requests per 15 minutes
  message: 'Too many OTP requests from this IP, please try again after 15 minutes',
  headers: true,  // Include rate limit info in the response headers
});

// Connect to MongoDB
connectDB();

// Apply Rate Limiting to OTP generation route
app.use('/api/otp/generate-otp', otpRateLimiter);

// Define API Routes
app.use("/api/email", emailRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use('/api', profileRoutes);  // Profile route should be protected with JWT

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
