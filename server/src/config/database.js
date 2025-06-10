const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance with MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'journalapp',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Nomispal@69',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // For MySQL 8.0+
      charset: 'utf8mb4'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize; 