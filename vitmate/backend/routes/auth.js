const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route  POST /api/auth/register
// @desc   Register new user
// @access Public
router.post('/register', async (req, res) => {
  try {
    const { name, regNo, password, branch, year, rank } = req.body;

    // Validation
    if (!name || !regNo || !password || !branch || !year || !rank) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ regNo: regNo.toUpperCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Register number already exists' });
    }

    // Create user
    const user = await User.create({ name, regNo: regNo.toUpperCase(), password, branch, year, rank });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      regNo: user.regNo,
      branch: user.branch,
      year: user.year,
      rank: user.rank,
      currentGroup: user.currentGroup,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post('/login', async (req, res) => {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ message: 'Please provide register number and password' });
    }

    const user = await User.findOne({ regNo: regNo.toUpperCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid register number or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      regNo: user.regNo,
      branch: user.branch,
      year: user.year,
      rank: user.rank,
      currentGroup: user.currentGroup,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/auth/me
// @desc   Get current user profile
// @access Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentGroup');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  PUT /api/auth/profile
// @desc   Update profile
// @access Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, branch, year, rank } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, branch, year, rank },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
