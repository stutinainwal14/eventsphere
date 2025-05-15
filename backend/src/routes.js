// src/routes.js
const express = require('express');
const router = express.Router();

// Point at your auth controller file
const authRoutes = require('./routes/authRoutes');

router.use('/api/auth', authRoutes);

module.exports = router;
