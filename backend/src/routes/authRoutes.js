// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { publish } = require('../kafka/producer');
require('dotenv').config();
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');
const { body, validationResult } = require('express-validator');



router.post(
  '/signup',
  [
    body('username').optional()
      .trim()
      .isLength({ min: 2, max: 30 }).withMessage('Username must be between 2-30 characters'),
    body('email')
      .isEmail().withMessage('Invalid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['user', 'admin']).withMessage('Role must be either user or admin'),
    body('preferences')
      .optional()
      .isObject().withMessage('Preferences must be a JSON object'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role = 'user', preferences = {} } = req.body;

    try {
      const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const [result] = await db.query(
        'INSERT INTO Users (username, email, password, role, preferences) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, JSON.stringify(preferences)]
      );

      const newUserId = result.insertId;
      const [rows] = await db.query(
        'SELECT user_id, username, email, role, preferences FROM Users WHERE user_id = ?',
        [newUserId]
      );

      let newUser = rows[0];
      if (typeof newUser.preferences === 'string') {
        try {
          newUser.preferences = JSON.parse(newUser.preferences);
        } catch {
          newUser.preferences = {};
        }
      }

      publish('user-registered', { id: newUser.user_id, email: newUser.email }).catch(console.error);
      return res.status(201).json({ user: newUser });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);


router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 }),
    body('token').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const { email, password, token: twoFAToken } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.isTwoFactorEnabled) {
      if (!twoFAToken) return res.status(400).json({ message: '2FA token required' });

      const valid2FA = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFAToken,
        window: 1,
      });

      if (!valid2FA) {
        return res.status(400).json({ message: 'Invalid 2FA token' });
      }
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    let { preferences } = user;
    if (typeof preferences === 'string') {
      preferences = JSON.parse(preferences || '{}');
    }

    res.json({
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /profile - Get current user's profile
router.get('/profile', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, role, preferences, avatar FROM Users WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    try {
      user.preferences =
        typeof user.preferences === 'string'
          ? JSON.parse(user.preferences)
          : user.preferences || {};
    } catch {
      user.preferences = {};
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile details' });
  }
});


const multer = require('multer');


// Configure Multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads'); // store in backend/uploads
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Update user profile
router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'),
  [
    body('username')
  .optional()
  .trim()
  .isLength({ min: 2, max: 30 })
  .matches(/^[a-zA-Z0-9\s_'-]+$/)
  .withMessage('Username contains invalid characters'),

    body('email').optional().isEmail().normalizeEmail(),
    body('preferences')
  .optional()
  .customSanitizer(value => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return null; // let the custom() check fail
      }
    }
    return value;
  })
  .custom(value => typeof value === 'object' && value !== null)
  .withMessage('Preferences must be a valid JSON object')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  const userId = req.user.id;
  const { username, email, preferences } = req.body;
  if (email) {
    const [existingEmailRows] = await db.query(
      'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
      [email, userId]
    );
    if (existingEmailRows.length > 0) {
      return res.status(400).json({ message: 'Email already in use by another account' });
    }
  }

  const avatar = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const updates = [];
    const params = [];

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (preferences) {
      updates.push('preferences = ?');
      params.push(JSON.stringify(preferences));
    }

    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No changes provided' });
    }

    params.push(userId);

    await db.query(`UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`, params);

    const [rows] = await db.query('SELECT user_id, username, email, preferences, avatar FROM Users WHERE user_id = ?', [userId]);
    const user = rows[0];
    try {
      user.preferences =
        typeof user.preferences === 'string'
          ? JSON.parse(user.preferences)
          : user.preferences || {};
    } catch {
      user.preferences = {};
    }

    res.json({ message: 'Profile updated', user });

  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


router.get('/2fa/setup', authMiddleware, async (req, res) => {
  const userId = req.user && req.user.id; // You must decode JWT via middleware
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const [users] = await db.query('SELECT email FROM Users WHERE user_id = ?', [userId]);
  const user = users[0];

  const secret = speakeasy.generateSecret({ name: `EventSphere (${user.email})` });

  await db.query('UPDATE Users SET twoFactorSecret = ? WHERE user_id = ?', [
    secret.base32,
    userId,
  ]);

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  res.json({ qrCode, secret: secret.base32 });
});

router.post('/2fa/verify',authMiddleware, async (req, res) => {
  const userId = req.user && req.user.id;
  const { token } = req.body;
  const [users] = await db.query('SELECT twoFactorSecret FROM Users WHERE user_id = ?', [userId]);
  if (!users || users.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[0];


  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!isVerified) {
    return res.status(400).json({ message: 'Invalid 2FA token' });
  }

  await db.query('UPDATE Users SET isTwoFactorEnabled = TRUE WHERE user_id = ?', [userId]);

  res.json({ message: '2FA enabled successfully' });
});

module.exports = router;
