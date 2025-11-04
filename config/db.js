
require('dotenv').config();
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./data/app.db';

const sequelize = new Sequelize(databaseUrl, {
  logging: false
});

module.exports = sequelize;
