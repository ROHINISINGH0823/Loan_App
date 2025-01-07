const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    console.error("Error hashing password:", err);
    throw new Error('Error hashing password');
  }
};


const comparePassword = async (enteredPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    console.error("Error comparing passwords:", err);
    throw new Error('Error comparing passwords');
  }
};


const generateToken = (id, expiresIn = '5m') => {  
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
  } catch (err) {
    console.error("Error generating token:", err);
    throw new Error('Error generating token');
  }
};


const generateRefreshToken = (id) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }
    
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10m' });
  } catch (err) {
    console.error("Error generating refresh token:", err);
    throw new Error('Error generating refresh token');
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
};
