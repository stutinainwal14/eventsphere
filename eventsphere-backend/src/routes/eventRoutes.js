// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { searchEvents } = require('../services/TicketMasterService');
const { getEventDetails } = require('../services/TicketMasterService');
const authMiddleware = require('../middleware/authMiddleware');

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

router.get('/:id',authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await getEventDetails(eventId);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
