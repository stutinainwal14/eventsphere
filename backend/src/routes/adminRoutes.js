// src/routes/adminRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware to check admin users access these routes
const requireAdmin = (req, res, next) => {
  const { role } = req.user;
  if (role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};

// GET /api/admin/users
// Returns a list of all non-sensitive user information (excluding passwords)
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id
// Updates user data excluding admin accounts (to prevent privilege escalation)
router.put('/users/:id', authMiddleware, requireAdmin, async (req, res) => {

  // Check if target user is an admin — disallow
  const [userCheck] = await db.query('SELECT role FROM Users WHERE user_id = ?', [req.params.id]);
  if (userCheck.length > 0 && userCheck[0].role === 'admin') {
    return res.status(403).json({ message: 'Cannot modify admin users' });
  }

  const {
 username, email, role, password
} = req.body;
  const updates = [];
  const params = [];

  // Prevent setting role to admin
  if (role === 'admin') {
    return res.status(403).json({ message: 'Cannot set user role to admin' });
  }

  // Check if new email is already used by another user
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

  // Add other updates if provided
  if (username) {
    updates.push('username = ?');
    params.push(username);
  }

  if (role) {
    updates.push('role = ?');
    params.push(role);
  }

  // Hash new password if provided
  if (password && password.trim() !== '') {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.push('password = ?');
    params.push(hashedPassword);
  }

  // Ensure there is at least one field to update
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

// DELETE /api/admin/users/:id
// Deletes a user account by ID — prevents deleting admin accounts
router.delete('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    // First check if the user being deleted is an admin
    const [userCheck] = await db.query('SELECT role FROM Users WHERE user_id = ?', [req.params.id]);
    if (userCheck.length > 0 && userCheck[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await db.query('DELETE FROM Users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/saved-events
// Returns all saved events across all users (used in admin panel)
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

// DELETE /api/admin/saved-events/:id
// Deletes a saved event entry by its internal DB ID
router.delete('/saved-events/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM SavedEvents WHERE id = ?', [req.params.id]);
    res.json({ message: 'Saved event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
