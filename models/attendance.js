
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    time: { type: DataTypes.TIME, allowNull: false },
    status: { type: DataTypes.STRING(50), allowNull: false } // hadir/izin/sakit/alpa
  }, {
    tableName: 'attendance',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  return Attendance;
};
