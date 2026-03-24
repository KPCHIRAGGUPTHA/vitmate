const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ✅ REGISTER
router.post('/register', (req, res) => {
  const { name, registerNumber, password } = req.body;

  if (!name || !registerNumber || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  // fake user (no DB for now)
  const user = {
    name,
    regNo: registerNumber
  };

  const token = jwt.sign(
    { id: registerNumber },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user
  });
});

// ✅ LOGIN
router.post('/login', (req, res) => {
  const { registerNumber, password } = req.body;

  if (!registerNumber || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const user = {
    name: "User",
    regNo: registerNumber
  };

  const token = jwt.sign(
    { id: registerNumber },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user
  });
});

module.exports = router;