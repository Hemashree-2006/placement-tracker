const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Session = sequelize.define('Session', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sessionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  trainerName: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, { timestamps: true });

module.exports = Session;
