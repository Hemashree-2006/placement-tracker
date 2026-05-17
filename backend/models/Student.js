const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dept: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 10
    }
  },
  backlogs: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  skills: {
    type: DataTypes.JSON, // SQLite supports JSON text columns
    defaultValue: []
  },
  resumePath: {
    type: DataTypes.STRING,
    defaultValue: ''
  }
}, { timestamps: true });

module.exports = Student;
