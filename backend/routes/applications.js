const express = require('express');
const router = express.Router();
const { Application, Student, Company, sequelize } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');
const { QueryTypes } = require('sequelize');

const VALID_STATUSES = ['Applied', 'Shortlisted', 'Technical', 'HR', 'Selected', 'Rejected'];

// ── GET /api/applications ─────────────────────────────── Admin: all | Student: own
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'Student') {
      const student = await Student.findOne({ where: { userId: req.user.id } });
      if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });
      query.StudentId = student.id;
    }

    const applications = await Application.findAll({
      where: query,
      include: [
        { model: Student, attributes: ['name', 'dept', 'cgpa'] },
        { model: Company, attributes: ['companyName', 'jobRole', 'salaryPackage'] }
      ]
    });

    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/applications/analytics ──────────────────── Admin: placement stats
router.get('/analytics', protect, adminOnly, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        c.companyName, c.jobRole, c.salaryPackage,
        COUNT(a.id) as totalApplicants,
        SUM(CASE WHEN a.status = 'Selected' THEN 1 ELSE 0 END) as selected,
        SUM(CASE WHEN a.status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
        SUM(CASE WHEN a.status IN ('Applied', 'Technical', 'HR') THEN 1 ELSE 0 END) as inProcess
      FROM Applications a
      JOIN Companies c ON a.CompanyId = c.id
      GROUP BY c.id
      ORDER BY totalApplicants DESC
    `;

    const overallQuery = `
      SELECT
        COUNT(id) as total,
        SUM(CASE WHEN status = 'Selected' THEN 1 ELSE 0 END) as selected,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected
      FROM Applications
    `;

    const stats = await sequelize.query(statsQuery, { type: QueryTypes.SELECT });
    const overallResults = await sequelize.query(overallQuery, { type: QueryTypes.SELECT });
    const overall = overallResults[0] || { total: 0, selected: 0, rejected: 0 };

    res.json({
      success: true,
      overall,
      byCompany: stats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/applications ────────────────────────────── Student: apply
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can apply.' });
    }

    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ success: false, message: 'companyId is required.' });

    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });

    // ── Eligibility Engine check ──────────────────────────────────
    if (student.cgpa < company.minCgpaRequired) {
      return res.status(400).json({
        success: false,
        message: `Not eligible. Your CGPA (${student.cgpa}) is below the required minimum (${company.minCgpaRequired}).`,
      });
    }
    if (student.backlogs > company.maxBacklogsAllowed) {
      return res.status(400).json({
        success: false,
        message: `Not eligible. Your backlogs (${student.backlogs}) exceed the allowed maximum (${company.maxBacklogsAllowed}).`,
      });
    }

    const application = await Application.create({
      StudentId: student.id,
      CompanyId: company.id,
    });

    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully.' });
  } catch (err) {
    // Unique constraint violation (already applied)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'You have already applied to this company.' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/applications/:id/status ─────────────────── Admin: update status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    application.status = status;
    await application.save();

    // Re-fetch with associations
    const updatedApplication = await Application.findByPk(req.params.id, {
      include: [
        { model: Student, attributes: ['name', 'dept', 'cgpa'] },
        { model: Company, attributes: ['companyName', 'jobRole'] }
      ]
    });

    res.json({ success: true, data: updatedApplication });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/applications/:id ─────────────────────── Student: withdraw
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can withdraw applications.' });
    }

    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const application = await Application.findByPk(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found.' });

    // Verify ownership
    if (application.StudentId !== student.id) {
      return res.status(403).json({ success: false, message: 'You can only withdraw your own applications.' });
    }

    // Optional: Prevent withdrawing if already selected/rejected, but for now we allow it.
    await application.destroy();

    res.json({ success: true, message: 'Application withdrawn successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
