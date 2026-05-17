const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Company = sequelize.define('Company', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jobRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  salaryPackage: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0 }
  },
  minCgpaRequired: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0, max: 10 }
  },
  maxBacklogsAllowed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0 }
  }
}, { timestamps: true });

module.exports = Company;
