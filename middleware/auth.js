
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const SECRET_KEY = process.env.SECRET_KEY || 'verysecretkey123';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ status: 'error', message: 'Authorization header missing' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return res.status(401).json({ status: 'error', message: 'Invalid authorization header' });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ status: 'error', message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
}

function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
