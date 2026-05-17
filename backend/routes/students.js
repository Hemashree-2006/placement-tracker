const express = require('express');
const router = express.Router();
const { Student, User } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/students ─────────────────────────────────── Admin only
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: User, attributes: ['email', 'role'] }]
    });
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/students/:id ─────────────────────────────── Admin or own student
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['email', 'role'] }]
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    // Students can only view their own profile
    if (req.user.role === 'Student' && student.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/students/:id ─────────────────────────────── Student updates own profile
router.put('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    if (req.user.role === 'Student' && student.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { name, dept, cgpa, backlogs, skills, resumePath } = req.body;
    if (name)       student.name       = name;
    if (dept)       student.dept       = dept;
    if (cgpa !== undefined) student.cgpa = cgpa;
    if (backlogs !== undefined) student.backlogs = backlogs;
    if (skills)     student.skills     = skills;
    if (resumePath !== undefined) student.resumePath = resumePath;

    await student.save();
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/students/:id ──────────────────────────── Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    await student.destroy();
    res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
