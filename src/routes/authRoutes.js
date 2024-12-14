const express = require('express');
const jwt = require('jsonwebtoken');
const { validateUser, handleValidation } = require('../middlewares/validate');
const dotenv = require('dotenv');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');
dotenv.config();

const router = express.Router();


// Register Route
router.post('/register', validateUser, handleValidation, async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Sign-In (Login) Route
router.post('/signin', async (req, res) => {

  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in cookies
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // set to true in production
      maxAge: 60 * 60 * 1000, // 1 hour
      signed: true, // ensures cookie is signed
    });

    res.status(200).json({ message: 'Login successful', user: { firstname: user.firstName, lastname: user.lastName, email: user.email}});
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Logout Route
router.post('/logout', authenticate, (req, res) => {
  // Clear the jwt cookie by setting it to null and max-age to 0
  res.clearCookie('jwt');

  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
