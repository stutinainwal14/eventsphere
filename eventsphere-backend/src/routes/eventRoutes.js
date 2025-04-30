// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { searchEvents } = require('../services/TicketMasterService');

router.get('/', async (req, res) => {
  try {
    const { location, keyword } = req.query;
    const nowIso = new Date().toISOString();

    const events = await searchEvents({
      location,
      keyword,
      startDate: nowIso,
    });

    res.json(events);
  } catch (err) {
    console.error('TicketMaster fetch error:', err.message);
    res.status(502).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
