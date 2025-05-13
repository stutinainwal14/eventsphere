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

router.post('/signup', async (req, res) => {

  const {
    username,
    email,
    password,
    role = 'user',
    preferences = {},
  } = req.body;

  try {
    // 1) Check for existing user
    const [existing] = await db.query(
      'SELECT user_id FROM Users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3) Insert user, capturing insertId

    const [result] = await db.query(
      'INSERT INTO Users (username, email, password, role, preferences) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, JSON.stringify(preferences)]
    );

    const newUserId = result.insertId;

    // 4) Fetch the newly created user

    const [rows] = await db.query(
      'SELECT user_id, username, email, role, preferences FROM Users WHERE user_id = ?',
      [newUserId]
    );
    let newUser = rows[0];

    // 5) Safely parse preferences (only if it’s a string)

    if (typeof newUser.preferences === 'string') {
      try {
        newUser.preferences = JSON.parse(newUser.preferences);
      }
      catch (err) {
        newUser.preferences = {};
      }
    }

    // 6) Publish Kafka event

    publish('user-registered', { id: newUser.user_id, email: newUser.email })
      .catch(console.error);

    // 7) Respond with the full user object
    return res.status(201).json({ user: newUser });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }

});

router.post('/login', async (req, res) => {
  console.log('Backend received login request');
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
