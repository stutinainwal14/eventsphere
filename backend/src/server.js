// Import required modules
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const eventRoutes = require('./routes/eventRoutes');
const { searchEvents, getEventDetails } = require('./services/TicketMasterService');
const adminRoutes = require('./routes/adminRoutes');


// Load environment variables
dotenv.config();
require('dotenv').config();

// Set port from .env or default to 8080
const PORT = process.env.PORT || 8080;


// Initialize Express app
const app = express();

// Serve static frontend files from /auth directory
app.use(express.static(path.join(__dirname, '../auth')));

// Parse incoming JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Test route to see if server is working
app.get('/', (req, res) => {
  res.send('Server is working!');
});

// Ensure /uploads directory exists for file storage (e.g., avatars)
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploaded files

// Authenticated Ticketmaster search route (general-purpose search)
app.get('/search-events', authMiddleware, async (req, res) => {
  try {
    // Extracting all parameters from the request
    const {
      location,
      keyword,
      startDateTime,
      endDateTime,
      sort,
      countryCode
    } = req.query;

    const events = await searchEvents({
      location: location || '',
      keyword: keyword || '',
      startDateTime: startDateTime || undefined,
      endDateTime: endDateTime || undefined,
      sort: sort || '',
      countryCode: countryCode || 'AU'
    });

    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin-only route to fetch count of upcoming trending events (within 7 days)
app.get('/api/admin/trending-count', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const now = new Date();
    const defaultEnd = new Date();
    defaultEnd.setDate(now.getDate() + 7);

    const events = await searchEvents({
      startDate: now.toISOString(),
      endDate: defaultEnd.toISOString(),
      sort: 'date,asc',
      countryCode: 'AU'
    });

    // Count trending events (events with high popularity or recent activity)
    let trendingCount = 0;
    if (events && events['_embedded'] && events['_embedded'].events) {
      trendingCount = events['_embedded'].events.length;
    }

    res.json({ count: trendingCount });
  } catch (err) {
    console.error('Error fetching trending events count:', err.message);
    res.status(500).json({ error: err.message });
  }
});


// Admin-only route to fetch all upcoming events in AU (max 200)
app.get('/api/admin/all-events', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Get all events from Australia - remove the location parameter
    // and rely on countryCode instead
    const events = await searchEvents({
      location: '', // Remove 'Australia' - use empty string or specific cities
      keyword: '',
      // Don't restrict by date to get all available events
      startDateTime: undefined,
      endDateTime: undefined,
      sort: 'date,asc',
      countryCode: 'AU',
      size: 200 // Get more events (TicketMaster default is 20)
    });

    let formattedEvents = [];

    if (events && events['_embedded'] && events['_embedded'].events) {
      formattedEvents = events['_embedded'].events.map((event) => {
        let location = 'Australia';
        if (
          event['_embedded'] &&
          event['_embedded'].venues &&
          event['_embedded'].venues[0]
        ) {
          if (event['_embedded'].venues[0].name) {
            location = event['_embedded'].venues[0].name;
          } else if (
            event['_embedded'].venues[0].city &&
            event['_embedded'].venues[0].city.name
          ) {
            location = event['_embedded'].venues[0].city.name;
          }
        }
        let image = 'https://via.placeholder.com/60';
        if (event.images && event.images[0] && event.images[0].url) {
          image = event.images[0].url;
        }
        let date = 'TBD';
        if (event.dates && event.dates.start && event.dates.start.localDate) {
          date = event.dates.start.localDate;
        }

        const link = event.url || '#';

        return {
          id: event.id,
          name: event.name,
          location,
          image,
          date,
          source: 'TicketMaster',
          link
        };
      });
    }



    res.json({
      events: formattedEvents,
      total: formattedEvents.length,
      page: 1,
      totalPages: Math.ceil(formattedEvents.length / 7),
      rawResponse: events // Include raw response for debugging
    });
  } catch (err) {
    console.error('Error fetching all events:', err.message);
    console.error('Full error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Admin-only placeholder route for deleting events (TicketMaster doesn’t support deletion)
app.delete('/api/admin/events/:eventId', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { eventId } = req.params;

    // Note: TicketMaster API doesn't allow deleting events
    // This is just a placeholder response
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Public route to fetch trending events within a date range
app.get('/trending-events', async (req, res) => {
  try {
    const now = new Date();
    const startDateKey = req.query.startDate || now.toISOString();
    // Set default endDate to 7 days from now if not provided
    const defaultEnd = new Date();
    defaultEnd.setDate(now.getDate() + 7);
    const endDateKey = req.query.endDate || defaultEnd.toISOString();

    const events = await searchEvents({
      startDate: startDateKey,
      endDate: endDateKey,
      sort: req.query.sort || '',
      countryCode: req.query.countryCode || 'AU'
    });
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Admin-only route to get total number of available events
app.get('/api/admin/events-count', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Get first page to access total count metadata
    const events = await searchEvents({
      location: '',
      keyword: '',
      startDateTime: undefined,
      endDateTime: undefined,
      sort: 'date,asc',
      countryCode: 'AU',
      size: 1 // Only need 1 event to get total count
    });

    let totalCount = 0;

    if (events && events.page && events.page.totalElements) {
      totalCount = events.page.totalElements;
    } else if (events && events['_embedded'] && events['_embedded'].events) {
      // Fallback if totalElements is not available
      totalCount = events['_embedded'].events.length;
    }

    res.json({ count: totalCount });
  } catch (err) {
    console.error('Error fetching events count:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
// Event details route
app.get('/api/events/details/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventDetails = await getEventDetails(eventId);
    res.json(eventDetails);
  } catch (err) {
    console.error('Error fetching event details:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
