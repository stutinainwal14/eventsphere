const jwt = require('jsonwebtoken');
const db = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
  ? authHeader.split(' ')[1]
  : null;
  const tokenFromCookie = req.cookies && req.cookies.token;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Check if token is blacklisted
    const [rows] = await db.query('SELECT token FROM BlacklistedTokens WHERE token = ?', [token]);
    if (rows.length > 0) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
