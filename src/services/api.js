import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config/api.config';

// Base URL from configuration
const BASE_URL = API_URL;

/**
 * Handles API responses
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} - Response data
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorData;
    try {
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
    } catch (e) {
      errorData = { message: 'An unknown error occurred' };
    }
    
    // Handle specific status codes
    if (response.status === 401) {
      // Clear token on auth error
      await AsyncStorage.removeItem('userToken');
      errorData.message = 'Authorization token not found';
    }
    
    throw errorData;
  }
  
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

/**
 * Get stored JWT token from AsyncStorage
 */
const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Set authentication headers
 */
const getAuthHeaders = async () => {
  const token = await getToken();
  
  if (!token) {
    // Throw a specific error when token is missing
    throw { message: 'Authorization token not found' };
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Make API request with automatic token handling
 */
const apiRequest = async (url, options = {}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...headers
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

/**
 * API client for authentication requests
 */
export const authApi = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await handleResponse(response);
    
    // Save token to storage
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
    }
    
    return data;
  },
  
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   */
  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await handleResponse(response);
    
    // Save token to storage
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
    }
    
    return data;
  },
  
  /**
   * Get current user profile
   */
  getProfile: async () => {
    return apiRequest(`${BASE_URL}/users/profile`);
  },
  
  /**
   * Logout user
   */
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
  }
};

/**
 * API client for journal entry requests
 */
export const journalApi = {
  /**
   * Get all journal entries
   */
  getEntries: async () => {
    return apiRequest(`${BASE_URL}/journal`);
  },
  
  /**
   * Get a specific journal entry
   * @param {number} id - Entry ID
   */
  getEntry: async (id) => {
    return apiRequest(`${BASE_URL}/journal/${id}`);
  },
  
  /**
   * Create a new journal entry
   * @param {Object} entryData - Journal entry data
   */
  createEntry: async (entryData) => {
    return apiRequest(`${BASE_URL}/journal`, {
      method: 'POST',
      body: JSON.stringify(entryData)
    });
  },
  
  /**
   * Update a journal entry
   * @param {number} id - Entry ID
   * @param {Object} entryData - Journal entry data
   */
  updateEntry: async (id, entryData) => {
    return apiRequest(`${BASE_URL}/journal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData)
    });
  },
  
  /**
   * Delete a journal entry
   * @param {number} id - Entry ID
   */
  deleteEntry: async (id) => {
    return apiRequest(`${BASE_URL}/journal/${id}`, {
      method: 'DELETE'
    });
  },
  
  /**
   * Search journal entries
   * @param {string} query - Search query
   */
  searchEntries: async (query) => {
    return apiRequest(`${BASE_URL}/journal/search?query=${encodeURIComponent(query)}`);
  },
  
  /**
   * Get streak information
   */
  getStreak: async () => {
    return apiRequest(`${BASE_URL}/journal/streak`);
  }
}; 