// src/routes.js
const express = require('express'); // Import the Express framework
const router = express.Router(); // Create a new Express router instance

// Import route modules
// These handle the logic for authentication and event-related APIs
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

// Mount the authRoutes under the /api/auth path
router.use('/api/auth', authRoutes);

// Mount the eventRoutes under the /api/events path
router.use('/api/events', eventRoutes);

module.exports = router;
