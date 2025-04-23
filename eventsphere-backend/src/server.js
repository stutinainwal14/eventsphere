const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes');
//const initConsumer = require('./kafka/consumer');
const { publish } = require('./kafka/producer');
const authMiddleware = require('./middleware/authMiddleware');
const eventRoutes = require('./routes/eventRoutes');
const PORT = process.env.PORT || 8080;

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Test route to see if server is receiving requests
app.get('/', (req, res) => {
    res.send('Server is working!');
  });

app.use('/api', authRoutes);
app.use('/api/events', authMiddleware, eventRoutes);

const start = async () => {
  //await publish();
  //await initConsumer();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();