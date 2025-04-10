const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const PORT = process.env.PORT || 8080;

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Test route to see if server is receiving requests
app.get('/', (req, res) => {
    res.send('Server is working!');
  });

app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
