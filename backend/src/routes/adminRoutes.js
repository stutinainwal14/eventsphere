// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check for admin role
const requireAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// GET /api/admin/users - List all users
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id - Update any user
router.put('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
    const { username, email, role } = req.body;
    const updates = [];
    const params = [];

    // Check if email is being updated and already exists
    if (email) {
      const [existingEmailRows] = await db.query(
        'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
        [email, req.params.id]
      );
      if (existingEmailRows.length > 0) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }

      updates.push('email = ?');
      params.push(email);
    }

    if (username) {
      updates.push('username = ?');
      params.push(username);
    }

    if (role) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    params.push(req.params.id);

    try {
      await db.query(`UPDATE Users SET ${updates.join(', ')} WHERE user_id = ?`, params);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/saved-events - Get all saved events
router.get('/saved-events', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM SavedEvents');
    const events = rows.map((row) => ({
      ...row,
      event_data: typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/saved-events/:id - Remove saved event by ID
router.delete('/saved-events/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM SavedEvents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Saved event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
