const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine the database dialect from environment or default to mysql
const DIALECT = process.env.DB_DIALECT || 'mysql';

// Database connection for production or development
const sequelize = new Sequelize(
  process.env.DATABASE_URL || `mysql://${process.env.DB_USER || 'root'}:${process.env.DB_PASSWORD || 'Nomispal@69'}@${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'journalapp'}`,
  {
    dialect: DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      // SSL configuration for production databases
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
      } : false,
      // For MySQL 8.0+
      charset: DIALECT === 'mysql' ? 'utf8mb4' : undefined
    },
    // For Render's PostgreSQL which uses self-signed certificates
    ...(DIALECT === 'postgres' && process.env.NODE_ENV === 'production' ? {
      ssl: true,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    } : {}),
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
    console.log(`Database connection established successfully using ${DIALECT}.`);
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize; 