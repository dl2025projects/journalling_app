const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection for production (Railway) or development
const sequelize = new Sequelize(
  process.env.DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'Nomispal@69'}@${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'journalapp'}`,
  {
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // For MySQL 8.0+
      charset: 'utf8mb4',
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
      } : false
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