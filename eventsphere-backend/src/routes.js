// src/routes.js
const express = require('express');
const router = express.Router();

// Point at your auth controller file
const authController = require('./routes/authRoutes');

// POST /api/signup
router.post('/signup', authController.signup);

// POST /api/login
router.post('/login', authController.login);


module.exports = router;