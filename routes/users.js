
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');


router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { name, username, password, role } = req.body || {};
  if (!name || !username || !password || !role) return res.status(400).json({ status: 'error', message: 'Missing fields' });

  const exists = await User.findOne({ where: { username } });
  if (exists) return res.status(409).json({ status: 'error', message: 'Username sudah digunakan' });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, username, password_hash: hash, role });
  res.status(201).json({ status: 'success', message: 'Pengguna berhasil ditambahkan', data: user });
});

router.put('/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ status: 'error', message: 'Pengguna tidak ditemukan' });

  if (req.user.role !== 'admin' && req.user.id !== user.id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

  const { name, username, password, role } = req.body || {};
  if (username && username !== user.username) {
    const e = await User.findOne({ where: { username } });
    if (e) return res.status(409).json({ status: 'error', message: 'Username sudah digunakan' });
    user.username = username;
  }
  if (name) user.name = name;
  if (role) user.role = role;
  if (password) user.password_hash = await bcrypt.hash(password, 10);

  await user.save();
  res.json({ status: 'success', message: 'Pengguna berhasil diubah', data: user });
});


router.get('/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ status: 'error', message: 'Pengguna tidak ditemukan' });

  if (req.user.role !== 'admin' && req.user.id !== user.id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

  res.json({ status: 'success', data: user });
});


router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  const { role } = req.query;
  const where = {};
  if (role) where.role = role;
  const users = await User.findAll({ where });
  res.json({ status: 'success', data: users });
});

module.exports = router;
