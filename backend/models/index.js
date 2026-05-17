const { sequelize } = require('../config/db');

const User = require('./User');
const Student = require('./Student');
const Company = require('./Company');
const Session = require('./Session');
const Application = require('./Application');

// Define Associations

// User -> Student (1:1)
User.hasOne(Student, { foreignKey: 'userId', onDelete: 'CASCADE' });
Student.belongsTo(User, { foreignKey: 'userId' });

// Student -> Application (1:M)
Student.hasMany(Application, { foreignKey: 'StudentId', onDelete: 'CASCADE' });
Application.belongsTo(Student, { foreignKey: 'StudentId' });

// Company -> Application (1:M)
Company.hasMany(Application, { foreignKey: 'CompanyId', onDelete: 'CASCADE' });
Application.belongsTo(Company, { foreignKey: 'CompanyId' });

// Student <-> Session (M:N) for Bookmarks
Student.belongsToMany(Session, { through: 'StudentSessions', foreignKey: 'StudentId', as: 'InterestedSessions' });
Session.belongsToMany(Student, { through: 'StudentSessions', foreignKey: 'SessionId' });

module.exports = {
  sequelize,
  User,
  Student,
  Company,
  Session,
  Application
};
