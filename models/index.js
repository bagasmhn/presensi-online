
const sequelize = require('../config/db');
const defineUser = require('./user');
const defineAttendance = require('./attendance');

const User = defineUser(sequelize);
const Attendance = defineAttendance(sequelize);

User.hasMany(Attendance, { foreignKey: 'user_id', as: 'attendance' });
Attendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

async function syncModels() {
  await sequelize.sync();
}

module.exports = { sequelize, User, Attendance, syncModels };
