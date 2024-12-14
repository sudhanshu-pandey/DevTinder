const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../models/User')
dotenv.config();

const authenticate = async(req, res, next) => {
  const token = req.signedCookies.jwt;
  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    console.log("user",user);
    req.user = user; // Attach the user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = authenticate;
