import { Platform } from 'react-native';

/**
 * API Configuration
 * This file provides a centralized configuration for API endpoints
 */

// Development URLs
const DEV_ANDROID_URL = 'http://10.0.2.2:3000/api';
const DEV_IOS_URL = 'http://localhost:3000/api';

// Production URL - Change this when deploying to Railway
const PRODUCTION_URL = 'https://your-railway-app-url.railway.app/api'; 

/**
 * Get the appropriate API URL based on environment and platform
 */
const getApiUrl = () => {
  // For production builds
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_URL;
  }
  
  // For development - use appropriate localhost URL based on platform
  return Platform.OS === 'android' ? DEV_ANDROID_URL : DEV_IOS_URL;
};

export default getApiUrl(); 