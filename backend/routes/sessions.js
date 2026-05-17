const express = require('express');
const router = express.Router();
const { Session, Student } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/sessions ─────────────────────────────────── All authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await Session.findAll({ order: [['sessionDate', 'ASC']] });
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sessions/selected ────────────────────────── Student only
// IMPORTANT: Must be BEFORE /:id to avoid Express matching "selected" as an id
router.get('/selected', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can have selected sessions.' });
    }
    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const sessions = await student.getInterestedSessions({ order: [['sessionDate', 'ASC']] });
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/sessions/:id/select ─────────────────────── Student only
// IMPORTANT: Must be BEFORE /:id DELETE/PUT to avoid route conflicts
router.post('/:id/select', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can select sessions.' });
    }
    const student = await Student.findOne({ where: { userId: req.user.id } });
    const session = await Session.findByPk(req.params.id);

    if (!student || !session) return res.status(404).json({ success: false, message: 'Student or session not found.' });

    await student.addInterestedSession(session);
    res.json({ success: true, message: 'Session added to selected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/sessions/:id/select ───────────────────── Student only
router.delete('/:id/select', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can unselect sessions.' });
    }
    const student = await Student.findOne({ where: { userId: req.user.id } });
    const session = await Session.findByPk(req.params.id);

    if (!student || !session) return res.status(404).json({ success: false, message: 'Student or session not found.' });

    await student.removeInterestedSession(session);
    res.json({ success: true, message: 'Session removed from selected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sessions/:id ─────────────────────────────── All authenticated users
router.get('/:id', protect, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/sessions ────────────────────────────────── Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { category, sessionDate, trainerName } = req.body;
    if (!category || !sessionDate || !trainerName) {
      return res.status(400).json({ success: false, message: 'category, sessionDate, and trainerName are required.' });
    }

    const session = await Session.create({ category, sessionDate, trainerName });
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/sessions/:id ─────────────────────────────── Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    await session.update(req.body);
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/sessions/:id ──────────────────────────── Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    await session.destroy();
    res.json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
