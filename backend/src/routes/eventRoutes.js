// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const { searchEvents } = require('../services/TicketMasterService');
const { getEventDetails } = require('../services/TicketMasterService');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

/**
 * GET /api/events
 * Search events using TicketMaster API with optional filters: location, keyword.
 */
router.get('/', async (req, res) => {
  try {
    const { location, keyword } = req.query;
    const nowIso = new Date().toISOString();

    const events = await searchEvents({
      location,
      keyword,
      startDate: nowIso
    });

    res.json(events);
  } catch (err) {
    console.error('TicketMaster fetch error:', err.message);
    res.status(502).json({ error: 'Failed to fetch events' });
  }
});


/**
 * GET /api/events/bookmarks
 * Returns all bookmarked events for the authenticated user.
 */
router.get('/bookmarks', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {

    const [rows] = await db.query(
      'SELECT id, event_id, event_data, created_at FROM SavedEvents WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ events: [] });
    }

    // Parse and normalize each saved event
    const events = rows.map((row) => {
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
    res.json({ events });
  } catch (err) {
    console.error('Fetch bookmarks error:', err);
    res.status(500).json({
      error: 'Failed to fetch bookmarked events',
      details: err.message
    });
  }
});

/**
 * POST /api/events/bookmark
 * Bookmarks a new event for the authenticated user.
 */
router.post('/bookmark', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const {
 name, location, date, image, ticketUrl, platform, tags
} = req.body;

  try {
    // Generate unique event_id using event name and timestamp
    const event_id = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    const event_data = {
      name,
      location,
      date,
      image,
      ticketUrl,
      platform
    };

    await db.query(
      'INSERT INTO SavedEvents (user_id, event_id, event_data, tags) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE event_data = VALUES(event_data), tags = VALUES(tags)',
      [userId, event_id, JSON.stringify(event_data), tags || null]
    );

    res.json({ success: true, message: 'Event bookmarked successfully' });
  } catch (err) {
    console.error('Bookmark event error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to bookmark event' });
  }
});

/**
 * DELETE /api/events/bookmark/:eventId
 * Removes a bookmarked event using either DB id or generated event_id.
 */
router.delete('/bookmark/:eventId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  try {
    // Try to remove using DB row ID
    let [result] = await db.query(
      'DELETE FROM SavedEvents WHERE user_id = ? AND id = ?',
      [userId, eventId]
    );

    // Fallback: Try removing using generated event_id
    if (result.affectedRows === 0) {
      [result] = await db.query(
        'DELETE FROM SavedEvents WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
      );
    }

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

/**
 * GET /api/events/:id
 * Fetch full details of an event using TicketMaster API.
 * This must be after other static routes to avoid conflicts.
 */
router.get('/:id', authMiddleware, async (req, res) => {
  const eventId = req.params.id;
  try {
    const event = await getEventDetails(eventId);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/events/saved/search
 * Search saved events by name, location, date, and tags for the authenticated user.
 */
router.get('/saved/search', authMiddleware, async (req, res) => {
  const { id: userId } = req.user;
  const { q = '', date = '', tags = '' } = req.query;

  try {
    // Include the database 'id' field in the query
    const [rows] = await db.query(
      'SELECT id, event_id, event_data, tags FROM SavedEvents WHERE user_id = ?',
      [userId]
    );

    const results = rows.filter(({ event_id, event_data, tags: savedTags }) => {
      const data = typeof event_data === 'string' ? JSON.parse(event_data) : event_data;
      const query = q.toLowerCase();
      const tagList = (tags || '').toLowerCase().split(',').map((t) => t.trim());

      const matchesText = (data.name && data.name.toLowerCase().includes(query))
        || (data.location && data.location.toLowerCase().includes(query))
        || (data.address && data.address.line1 && data.address.line1.toLowerCase().includes(query));

      const matchesDate = date ? (data.date && data.date.startsWith(date)) : true;

      const matchesTags = tagList.length > 0 && savedTags
          ? tagList.every((tag) => savedTags.toLowerCase().includes(tag))
          : true;

      return matchesText && matchesDate && matchesTags;
    });

    // Including both 'id' and 'event_id' in the response
    res.json(
      results.map(({ id, event_id, event_data }) => ({
        id, // Database ID for deletion
        event_id, // Event ID
        ...(typeof event_data === 'string' ? JSON.parse(event_data) : event_data),
      }))
    );
  } catch ({ message }) {
    console.error('Saved events search error:', message);
    res.status(500).json({ error: message });
  }
});

module.exports = router;
