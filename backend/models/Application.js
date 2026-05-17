const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Application = sequelize.define('Application', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: {
    type: DataTypes.ENUM('Applied', 'Shortlisted', 'Technical', 'HR', 'Selected', 'Rejected'),
    defaultValue: 'Applied'
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { 
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['StudentId', 'CompanyId']
    }
  ]
});

module.exports = Application;
