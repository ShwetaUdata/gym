// server/config.js - Configuration file for backend

const dotenv = require('dotenv');
dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',

  // Email Configuration
  email: {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@powerfit.com',
    service: 'gmail',
  },

  // Database Configuration
  database: {
    path: process.env.DB_PATH || './gym.db',
  },

  // Scheduled Jobs Configuration
  jobs: {
    // Birthday email check - runs at 12:02 AM daily
    birthdayEmail: {
      enabled: true,
      schedule: '2 0 * * *', // Cron format: minute hour day month dayOfWeek
      description: 'Check and send birthday emails at 12:02 AM',
    },
  },

  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    corsOrigin: process.env.CORS_ORIGIN || ['http://localhost:5173', 'http://localhost:3000'],
  },
};

// Validation
export function validateConfig() {
  const errors = [];

  if (!config.email.user) {
    errors.push('EMAIL_USER environment variable is not set');
  }

  if (!config.email.password) {
    errors.push('EMAIL_PASSWORD environment variable is not set');
  }

  if (errors.length > 0) {
    console.error('Configuration errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nPlease update your .env file with the required values.');
    return false;
  }

  return true;
}

export default config;
