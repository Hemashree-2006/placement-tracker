const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student } = require('../models');

// Helper: generate JWT
const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ── POST /api/auth/register ──────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, dept, cgpa, backlogs, skills } = req.body;

    if (!email || !password || !name || !dept || cgpa === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashedPassword, role: 'Student' });

    const newStudent = await Student.create({
      userId: user.id,
      name,
      dept,
      cgpa,
      backlogs: backlogs || 0,
      skills: skills || [],
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ success: true, token, role: user.role, userId: user.id, studentId: newStudent.id, message: 'Registration successful.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Get student profile if role is Student
    let studentProfile = null;
    if (user.role === 'Student') {
      studentProfile = await Student.findOne({ where: { userId: user.id } });
    }

    const token = generateToken(user.id, user.role);
    res.json({
      success: true,
      token,
      role: user.role,
      userId: user.id,
      studentId: studentProfile ? studentProfile.id : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
