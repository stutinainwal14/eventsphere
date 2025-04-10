const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// Log when a request hits /api/signup
router.post('/signup', signup);

router.post('/login', login);

module.exports = router;
