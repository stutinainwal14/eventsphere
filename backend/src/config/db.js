// Import the mysql2 library with Promise support
const mysql = require('mysql2/promise');

require('dotenv').config(); // Load environment variables from the .env file

// Create a connection pool to the MySQL database using environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database username
  database: process.env.DB_NAME, // Name of the database to connect to
  password: process.env.DB_PASSWORD // Password for the database user
});

// Export the database pool for use in other parts of the application
module.exports = db;
