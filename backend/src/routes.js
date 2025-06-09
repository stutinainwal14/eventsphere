// src/routes.js
const express = require('express');
const router = express.Router();

// Point at your auth controller file
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

router.use('/api/auth', authRoutes);
router.use('/api/events', eventRoutes);

module.exports = router;
