const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();
const speakeasy = require('speakeasy'); // Used for Two-Factor Authentication
const qrcode = require('qrcode'); // Generates QR code for 2FA setup
const authMiddleware = require('../middleware/authMiddleware');
const path = require('path');
const { body, validationResult } = require('express-validator');

// SIGNUP
router.post(
  '/signup',
  [
    // Validation checks
    body('username').optional()
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Username must be between 2-30 characters'),
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
      .isObject().withMessage('Preferences must be a JSON object')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
 username, email, password, role = 'user', preferences = {}
} = req.body;

    try {
      // Check if user already exists
      const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password and insert user
      const hashedPassword = await bcrypt.hash(password, 12);
      const [result] = await db.query(
        'INSERT INTO Users (username, email, password, role, preferences) VALUES (?, ?, ?, ?, ?)',
        [username, email, hashedPassword, role, JSON.stringify(preferences)]
      );

      // Fetch newly created user
      const newUserId = result.insertId;
      const [rows] = await db.query(
        'SELECT user_id, username, email, role, preferences FROM Users WHERE user_id = ?',
        [newUserId]
      );

      let newUser = rows[0];
      if (typeof newUser.preferences === 'string') {
        try {
          newUser.preferences = JSON.parse(newUser.preferences);
        } catch (err) {
          newUser.preferences = {};
        }
      }
      return res.status(201).json({ user: newUser });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// LOGIN
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 1 }),
    body('token').optional().isString() // 2FA token
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, token: twoFAToken } = req.body;

    try {
      // Lookup user
      const [users] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      const user = users[0];

      // Check password match
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // If 2FA is enabled, verify token
      if (user.isTwoFactorEnabled) {
        if (!twoFAToken) return res.status(400).json({ message: '2FA token required' });

        const valid2FA = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: twoFAToken,
          window: 1
        });

        if (!valid2FA) {
          return res.status(400).json({ message: 'Invalid 2FA token' });
        }
      }

      // Generate JWT
      const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d'
      });

      // Parse user preferences
      let { preferences } = user;
      if (typeof preferences === 'string') {
        preferences = JSON.parse(preferences || '{}');
      }

      // Set token in cookie and return user info
      res
    .cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })
    .json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        preferences
      }
    });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// LOGOUT
router.post('/logout', authMiddleware, async (req, res) => {
    try {
      const token = (req.cookies && req.cookies.token)
        || (req.headers.authorization && req.headers.authorization.split(' ')[1]);


      if (!token) {
        return res.status(400).json({ message: 'No token provided' });
      }

      await db.query('INSERT INTO BlacklistedTokens (token) VALUES (?)', [token]);

      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax'
      });

      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      console.error('Logout error:', err.message);
      res.status(500).json({ error: 'Failed to log out' });
    }
  });

// UPDATE PASSWORD
router.put(
  '/update-password',
  authMiddleware,
  [
    body('oldPassword')
      .isLength({ min: 1 }).withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    try {
      // Fetch user's current hashed password
      const [users] = await db.query('SELECT password FROM Users WHERE user_id = ?', [userId]);
      if (users.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = users[0];

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Old password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await db.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedNewPassword, userId]);

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Update password error:', err.message);
      res.status(500).json({ error: 'Failed to update password' });
    }
  }
);


// GET PROFILE
router.get('/profile', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    // Check if avatar column exists in the table
    const [tableInfo] = await db.query("SHOW COLUMNS FROM Users LIKE 'avatar'");
    const hasAvatarColumn = tableInfo.length > 0;

    // Build query based on whether avatar column exists
    let selectQuery;
    if (hasAvatarColumn) {
      selectQuery = 'SELECT user_id, username, email, role, preferences, avatar, isTwoFactorEnabled FROM Users WHERE user_id = ?';
    } else {
      selectQuery = 'SELECT user_id, username, email, role, preferences, isTwoFactorEnabled FROM Users WHERE user_id = ?';
    }

    const [rows] = await db.query(selectQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];

    // Parse preferences
    try {
      user.preferences = typeof user.preferences === 'string'
          ? JSON.parse(user.preferences)
          : user.preferences || {};
    } catch (error) {
      console.error('Error parsing preferences:', error);
      user.preferences = {};
    }

    // Handle avatar path
    if (hasAvatarColumn && user.avatar) {

      // If avatar exists and doesn't start with http (not external URL)
      if (!user.avatar.startsWith('http')) {

        // Ensure avatar path starts with /uploads/
        if (!user.avatar.startsWith('/uploads/')) {
          user.avatar = `/uploads/${user.avatar}`;
        }
      }
    } else {
      user.avatar = null;
    }

    res.json({ user });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile details' });
  }
});

// UPDATE PROFILE
const multer = require('multer');
const fs = require('fs');

// Configure Multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads'); // Adjusted path based on your structure

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Add file filter for security
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'),
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .matches(/^[a-zA-Z0-9\u00C0-\u017F\s._'-]+$/)
      .withMessage('Username contains invalid characters'),

    body('email').optional().isEmail().normalizeEmail(),
    body('preferences')
      .optional()
      .customSanitizer((value) => {
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch (err){
            return null;
          }
        }
        return value;
      })
      .custom((value) => value === null || value === undefined || (typeof value === 'object' && value !== null))
      .withMessage('Preferences must be a valid JSON object')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { username, email, preferences } = req.body;

    try {
      // Check if email is already in use by another user
      if (email) {
        const [existingEmailRows] = await db.query(
          'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
          [email, userId]
        );
        if (existingEmailRows.length > 0) {
          return res.status(400).json({ message: 'Email already in use by another account' });
        }
      }

      // Check if avatar column exists
      const [tableInfo] = await db.query("SHOW COLUMNS FROM Users LIKE 'avatar'");
      const hasAvatarColumn = tableInfo.length > 0;

      if (!hasAvatarColumn) {
        console.warn('Avatar column does not exist in Users table. Please run: ALTER TABLE Users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL;');
      }

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

      // Only handle avatar if the column exists and a file was uploaded
      if (req.file && hasAvatarColumn) {
        const avatar = `/uploads/${req.file.filename}`;
        updates.push('avatar = ?');
        params.push(avatar);
      } else if (req.file && !hasAvatarColumn) {
        console.warn('Avatar file uploaded but avatar column does not exist in database');
        return res.status(400).json({
          message: 'Avatar upload failed: database not configured for avatars. Please contact administrator.'
        });
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No changes provided' });
      }

      params.push(userId);

      await db.query(`UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`, params);

      // Fetch updated user data
      let selectQuery;
      if (hasAvatarColumn) {
        selectQuery = 'SELECT user_id, username, email, preferences, avatar FROM Users WHERE user_id = ?';
      } else {
        selectQuery = 'SELECT user_id, username, email, preferences FROM Users WHERE user_id = ?';
      }

      const [rows] = await db.query(selectQuery, [userId]);
      const user = rows[0];

      // Parse preferences safely
      try {
        user.preferences = typeof user.preferences === 'string'
            ? JSON.parse(user.preferences)
            : user.preferences || {};
      } catch (err) {
        user.preferences = {};
      }

      // Handle avatar path
      if (!hasAvatarColumn) {
        user.avatar = null;
      } else if (user.avatar && !user.avatar.startsWith('http')) {
        if (!user.avatar.startsWith('/uploads/')) {
          user.avatar = `/uploads/${user.avatar}`;
        }
      }

      res.json({ message: 'Profile updated successfully', user });

    } catch (err) {
      console.error('Profile update error:', err.message);
      res.status(500).json({ error: 'Failed to update profile: ' + err.message });
    }
  }
);

// 2FA SETUP
router.get('/2fa/setup', authMiddleware, async (req, res) => {
  const userId = req.user && req.user.id; // You must decode JWT via middleware
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const [users] = await db.query('SELECT email FROM Users WHERE user_id = ?', [userId]);
  const user = users[0];

  const secret = speakeasy.generateSecret({ name: `EventSphere (${user.email})` });

  await db.query('UPDATE Users SET twoFactorSecret = ? WHERE user_id = ?', [
    secret.base32,
    userId
  ]);

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  res.json({ qrCode, secret: secret.base32 });
});

// 2FA VERIFY
router.post('/2fa/verify', authMiddleware, async (req, res) => {
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
    window: 1
  });

  if (!isVerified) {
    return res.status(400).json({ message: 'Invalid 2FA token' });
  }

  await db.query('UPDATE Users SET isTwoFactorEnabled = TRUE WHERE user_id = ?', [userId]);

  res.json({ message: '2FA enabled successfully' });
});

module.exports = router;
