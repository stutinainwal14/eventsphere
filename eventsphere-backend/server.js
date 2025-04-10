const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { sequelize } = require('./models'); // Import sequelize from models
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Import routes
const userRoutes = require('./routes/register'); // Adjust route if necessary
app.use('/api/users', userRoutes);

// Basic route handler for GET /
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        // Sync the database with Sequelize
        await sequelize.sync({ force: false }); // Avoid using 'force: true' in production
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection error:', error);
    }
});
