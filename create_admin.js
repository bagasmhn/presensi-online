require('dotenv').config();
const bcrypt = require('bcrypt');
const { User, sequelize } = require('./models');

async function createAdmin() {
  await sequelize.sync();
  const username = 'admin';
  const found = await User.findOne({ where: { username } });
  if (found) {
    console.log('Admin already exists:', found.toJSON());
    process.exit(0);
  }
  const pw = 'Admin123!';
  const hash = await bcrypt.hash(pw, 10);
  const u = await User.create({ name: 'Admin', username, password_hash: hash, role: 'admin' });
  console.log('Admin created. username:', username, 'password:', pw);
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
