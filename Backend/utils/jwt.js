const jwt = require('jsonwebtoken');


const generateToken = (id, expiresIn = '1h') => {  
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
    
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  } catch (err) {
    console.error("Error generating refresh token:", err);
    throw new Error('Error generating refresh token');
  }
};


const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = { generateToken, generateRefreshToken, verifyToken };
