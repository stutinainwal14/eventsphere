const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const events = [
    { id: 1, title: 'Tech Conference 2025', location: 'Sydney', date: '2025-05-10' },
    { id: 2, title: 'Startup Expo', location: 'Melbourne', date: '2025-05-15' },
  ];
  res.json(events);
});

module.exports = router;