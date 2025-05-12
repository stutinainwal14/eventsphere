const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
//const initConsumer = require('./kafka/consumer');
const { publish } = require('./kafka/producer');
const authMiddleware = require('./middleware/authMiddleware');
const eventRoutes = require('./routes/eventRoutes');
const { searchEvents } = require('./services/TicketMasterService');
const PORT = process.env.PORT || 8080;

dotenv.config();
require('dotenv').config();

const app = express();
app.use(express.json());

// Test route to see if server is working
app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.use('/api/auth', authRoutes);
app.use('/api/events', authMiddleware, eventRoutes);

app.get('/search-events', async (req, res) => {
  try {
    const now = new Date();
    const startDateKey = req.query.startDate || now.toISOString();
    const defaultEnd = new Date();
    defaultEnd.setDate(now.getDate() + 7);
    const endDateKey = req.query.endDate || defaultEnd.toISOString();

    const events = await searchEvents({
      location: req.query.location || '',
      eventType: req.query.keyword || '',
      startDate: startDateKey,
      endDate: endDateKey,
      sort: req.query.sort || '',
      countryCode: req.query.countryCode || 'AU'
    });

    const callback = req.query.callback;
    if (callback) {
      res.type('text/javascript');
      res.send(`${callback}(${JSON.stringify(events)})`);
    } else {
      res.json(events);
    }
  } catch (err) {
    console.error('Error fetching events:', err.message);

    const callback = req.query.callback;
    if (callback) {
      res.type('text/javascript');
      res.send(`${callback}(${JSON.stringify({ error: err.message })})`);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

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

const start = async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
