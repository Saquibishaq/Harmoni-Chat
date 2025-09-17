const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route (you already have this working)
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const newUser = new User({ username, password }); // no need to hash here, it's done in pre-save
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        username: newUser.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// ✅ Updated Login Route Using model method
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ msg: 'Invalid credentials (user not found)' });

    const isMatch = await user.matchPassword(password); // ✅ using model method
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials (password mismatch)' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
