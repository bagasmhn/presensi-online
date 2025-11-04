
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || 'verysecretkey123';
const EXPIRE_MIN = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10);

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ status: 'error', message: 'username and password required' });

  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(401).json({ status: 'error', message: 'Username atau password salah' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ status: 'error', message: 'Username atau password salah' });

  const token = jwt.sign({ sub: user.id, role: user.role }, SECRET_KEY, { expiresIn: `${EXPIRE_MIN}m` });
  res.json({ status: 'success', message: 'Login berhasil', token });
});

module.exports = router;
