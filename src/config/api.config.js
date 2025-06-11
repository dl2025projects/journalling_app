import { Platform } from 'react-native';

/**
 * API Configuration
 * This file provides a centralized configuration for API endpoints
 */

// Development URLs
const DEV_ANDROID_URL = 'http://10.0.2.2:3000/api';
const DEV_IOS_URL = 'http://localhost:3000/api';

// Production URL from Render - Remove /api suffix for base URL
const PRODUCTION_URL = 'https://journal-app-server.onrender.com';
const API_PATH = '/api';

/**
 * Get the appropriate API URL based on environment and platform
 */
const getApiUrl = () => {
  // For testing with the production API even in development
  return PRODUCTION_URL + API_PATH;
  
  // Check if running in production
  if (__DEV__ === false) {
    return PRODUCTION_URL + API_PATH;
  }
  
  // For development - use appropriate localhost URL based on platform
  return Platform.OS === 'android' ? DEV_ANDROID_URL : DEV_IOS_URL;
};

// Export the base URL without /api for health checks and other root endpoints
export const getBaseUrl = () => PRODUCTION_URL;

export default getApiUrl(); 