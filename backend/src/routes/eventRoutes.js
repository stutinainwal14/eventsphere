// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { searchEvents } = require('../services/TicketMasterService');
const { getEventDetails } = require('../services/TicketMasterService');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

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

router.post('/save', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { event_id, event_data } = req.body;

  try {
    await db.query(
      'INSERT INTO SavedEvents (user_id, event_id, event_data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE event_data = VALUES(event_data)',
      [userId, event_id, JSON.stringify(event_data)]
    );
    res.status(200).json({ message: 'Event saved' });
  } catch (err) {
    console.error('Save event error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/saved', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;

  try {
    const [rows] = await db.query('SELECT event_id, event_data FROM SavedEvents WHERE user_id = ?', [userId]);
    const events = rows.map(({ event_id, event_data }) => {
      let parsedData;
      if (typeof event_data === 'string') {
        try {
          parsedData = JSON.parse(event_data);
        } catch (err) {
          parsedData = {};
        }
      } else {
        parsedData = event_data;
      }

      return {
        event_id,
        ...parsedData
      };
    });

    res.json(events);
  } catch ({ message }) {
    console.error('Fetch saved events error:', message);
    res.status(500).json({ error: message });
  }
});


router.delete('/unsave/:eventId', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const { eventId } = req.params;

  try {
    await db.query('DELETE FROM SavedEvents WHERE user_id = ? AND event_id = ?', [userId, eventId]);
    res.status(200).json({ message: 'Event unsaved' });
  } catch ({ message }) {
    console.error('Unsave event error:', message);
    res.status(500).json({ error: message });
  }
});

router.get('/saved/search', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const { q = '', date = '', tags = '' } = req.query;

  try {
    const [rows] = await db.query(
      'SELECT event_id, event_data, tags FROM SavedEvents WHERE user_id = ?',
      [userId]
    );

    const results = rows.filter(({ event_id, event_data, tags: savedTags }) => {
      const data = typeof event_data === 'string' ? JSON.parse(event_data) : event_data;
      const query = q.toLowerCase();
      const tagList = (tags || '').toLowerCase().split(',').map(t => t.trim());

      const matchesText =
        data.name?.toLowerCase().includes(query) ||
        data.location?.toLowerCase().includes(query) ||
        data.address?.line1?.toLowerCase().includes(query);

      const matchesDate =
        date ? data.date?.startsWith(date) : true;

      const matchesTags =
        tagList.length > 0 && savedTags
          ? tagList.every(tag => savedTags.toLowerCase().includes(tag))
          : true;

      return matchesText && matchesDate && matchesTags;
    });

    res.json(
      results.map(({ event_id, event_data }) => ({
        event_id,
        ...(typeof event_data === 'string' ? JSON.parse(event_data) : event_data),
      }))
    );
  } catch ({ message }) {
    console.error('Saved events search error:', message);
    res.status(500).json({ error: message });
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
