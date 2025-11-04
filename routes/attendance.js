
const express = require('express');
const router = express.Router();
const { Attendance, User } = require('../models');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');


router.post('/', authenticateToken, async (req, res) => {
  const { user_id, date, time, status } = req.body || {};
  if (!user_id || !date || !time || !status) return res.status(400).json({ status: 'error', message: 'Missing fields' });

  
  if (req.user.role !== 'admin' && req.user.id !== Number(user_id)) return res.status(403).json({ status: 'error', message: 'Forbidden to record for other users' });


  const exists = await Attendance.findOne({ where: { user_id: user_id, date: date } });
  if (exists) return res.status(409).json({ status: 'error', message: 'Presensi sudah tercatat untuk user ini pada tanggal tersebut' });

  const att = await Attendance.create({ user_id, date, time, status });
  res.status(201).json({ status: 'success', message: 'Presensi berhasil dicatat', data: att });
});

router.get('/history/:user_id', authenticateToken, async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  if (req.user.role !== 'admin' && req.user.id !== user_id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

  const { start_date, end_date } = req.query;
  const where = { user_id };
  if (start_date) where.date = { [Op.gte]: start_date };
  if (end_date) {
    where.date = where.date ? { ...where.date, [Op.lte]: end_date } : { [Op.lte]: end_date };
  }
  const items = await Attendance.findAll({ where, order: [['date','DESC']] });
  res.json({ status: 'success', data: items });
});


router.get('/summary/:user_id', authenticateToken, async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  if (req.user.role !== 'admin' && req.user.id !== user_id) return res.status(403).json({ status: 'error', message: 'Forbidden' });

  let { month } = req.query; 
  if (!month) {
    const d = new Date();
    month = `${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  }

  let year, m;
  const p = month.split('-');
  if (p[0].length === 4) { year = Number(p[0]); m = Number(p[1]); }
  else { m = Number(p[0]); year = Number(p[1]); }

  const start = new Date(year, m-1, 1).toISOString().slice(0,10);
  const end = new Date(year, m, 0).toISOString().slice(0,10);

  const items = await Attendance.findAll({ where: { user_id, date: { [Op.between]: [start, end] } } });
  const summary = { hadir:0, izin:0, sakit:0, alpa:0 };
  items.forEach(it => {
    const k = String(it.status).toLowerCase();
    if (summary.hasOwnProperty(k)) summary[k] += 1;
    else summary[k] = (summary[k] || 0) + 1;
  });

  res.json({ status: 'success', data: { user_id, month: `${String(m).padStart(2,'0')}-${year}`, attendance_summary: summary } });
});


router.post('/analysis', authenticateToken, requireRole('admin'), async (req, res) => {
  const { start_date, end_date, group_by } = req.body || {};
  if (!start_date || !end_date) return res.status(400).json({ status: 'error', message: 'start_date and end_date required' });


  const items = await Attendance.findAll({ where: { date: { [Op.between]: [start_date, end_date] } } });
  const map = {};
  items.forEach(it => {
    const uid = it.user_id;
    if (!map[uid]) map[uid] = { hadir:0, expected:0 };
    if (String(it.status).toLowerCase() === 'hadir') map[uid].hadir++;
    map[uid].expected++;
  });

  const results = [];
  for (const uidStr of Object.keys(map)) {
    const uid = Number(uidStr);
    const v = map[uid];
    const rate = v.expected > 0 ? (v.hadir / v.expected) * 100 : 0;
    results.push({ user_id: uid, hadir_count: v.hadir, expected_attendance: v.expected, attendance_rate: Math.round(rate*100)/100 });
  }

  res.json({ status: 'success', data: { period: { start_date, end_date }, group_by: group_by || null, results } });
});

module.exports = router;
