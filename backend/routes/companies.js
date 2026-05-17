const express = require('express');
const router = express.Router();
const { Company, Student } = require('../models');
const { Op } = require('sequelize');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/companies ────────────────────────────────── All authenticated users
router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.findAll();
    res.json({ success: true, count: companies.length, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/companies/eligible ───────────────────────── Eligibility Engine
// Returns only companies the logged-in student is eligible for
router.get('/eligible', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Student') {
      return res.status(403).json({ success: false, message: 'Only students can check eligibility.' });
    }

    const student = await Student.findOne({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found.' });

    const eligibleCompanies = await Company.findAll({
      where: {
        minCgpaRequired: { [Op.lte]: student.cgpa },
        maxBacklogsAllowed: { [Op.gte]: student.backlogs },
      }
    });

    res.json({
      success: true,
      studentCgpa: student.cgpa,
      studentBacklogs: student.backlogs,
      count: eligibleCompanies.length,
      data: eligibleCompanies,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/companies/:id ────────────────────────────── All authenticated users
router.get('/:id', protect, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/companies ───────────────────────────────── Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { companyName, jobRole, salaryPackage, minCgpaRequired, maxBacklogsAllowed } = req.body;

    if (!companyName || !jobRole || salaryPackage === undefined || minCgpaRequired === undefined || maxBacklogsAllowed === undefined) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const company = await Company.create({ companyName, jobRole, salaryPackage, minCgpaRequired, maxBacklogsAllowed });
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/companies/:id ────────────────────────────── Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    
    await company.update(req.body);
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/companies/:id ─────────────────────────── Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
    await company.destroy();
    res.json({ success: true, message: 'Company deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
