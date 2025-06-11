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

// Get bookmarked events
router.get('/bookmarks', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    console.log(`Fetching bookmarks for user ID: ${userId}`); // Debug log

    const [rows] = await db.query(
      'SELECT id, event_id, event_data, created_at FROM SavedEvents WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    console.log(`Found ${rows.length} bookmarked events for user ${userId}`); // Debug log

    if (rows.length === 0) {
      return res.json({ events: [] });
    }

    const events = rows.map(row => {
      let parsedData;
      try {
        if (typeof row.event_data === 'string') {
          parsedData = JSON.parse(row.event_data);
        } else {
          parsedData = row.event_data || {};
        }
      } catch (err) {
        console.error('Error parsing event_data for row:', row.id, err);
        parsedData = {
          name: 'Unknown Event',
          location: 'Unknown Location',
          date: 'Date TBA',
          platform: 'Unknown Platform'
        };
      }

      return {
        id: row.id, // Use the database ID for removal
        event_id: row.event_id,
        name: parsedData.name || 'Unknown Event',
        location: parsedData.location || 'Unknown Location',
        date: parsedData.date || 'Date TBA',
        image: parsedData.image || '/public/homepage/assets/images/event.png',
        ticketUrl: parsedData.ticketUrl || '#',
        platform: parsedData.platform || 'Unknown Platform',
        created_at: row.created_at
      };
    });

    console.log('Returning events:', events.length, 'events'); // Debug log
    res.json({ events });
  } catch (err) {
    console.error('Fetch bookmarks error:', err);
    res.status(500).json({
      error: 'Failed to fetch bookmarked events',
      details: err.message
    });
  }
});

// Bookmark an event (compatible with home.js)
router.post('/bookmark', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { name, location, date, image, ticketUrl, platform } = req.body;

  try {
    // Create a unique event_id from the data
    const event_id = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    const event_data = {
      name,
      location,
      date,
      image,
      ticketUrl,
      platform
    };

    console.log('Bookmarking event:', { userId, event_id, event_data });

    await db.query(
      'INSERT INTO SavedEvents (user_id, event_id, event_data) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE event_data = VALUES(event_data)',
      [userId, event_id, JSON.stringify(event_data)]
    );

    res.json({ success: true, message: 'Event bookmarked successfully' });
  } catch (err) {
    console.error('Bookmark event error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to bookmark event' });
  }
});

// Remove bookmark (compatible with profile.js)
router.delete('/bookmark/:eventId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM SavedEvents WHERE user_id = ? AND id = ?',
      [userId, eventId]
    );

    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Bookmark removed successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Bookmark not found' });
    }
  } catch (err) {
    console.error('Remove bookmark error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to remove bookmark' });
  }
});

// Parameterized route - MUST be placed after specific routes
router.get('/:id', authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await getEventDetails(eventId);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;