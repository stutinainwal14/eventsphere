const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'mysql',
  username: 'root', // Replace with your MySQL username
  password: 'Stuti14@', // Replace with your MySQL password
  database: 'eventsphere', // Replace with your database name
});

// Export sequelize and DataTypes
module.exports = { sequelize, DataTypes };
