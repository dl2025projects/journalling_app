import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your actual server URL
const BASE_URL = 'http://192.168.10.26:3000/api';

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
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
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
    
    return handleResponse(response);
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/users/profile`, {
      headers
    });
    
    return handleResponse(response);
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
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal`, {
      headers
    });
    
    return handleResponse(response);
  },
  
  /**
   * Get a specific journal entry
   * @param {number} id - Entry ID
   */
  getEntry: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal/${id}`, {
      headers
    });
    
    return handleResponse(response);
  },
  
  /**
   * Create a new journal entry
   * @param {Object} entryData - Journal entry data
   */
  createEntry: async (entryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal`, {
      method: 'POST',
      headers,
      body: JSON.stringify(entryData)
    });
    
    return handleResponse(response);
  },
  
  /**
   * Update a journal entry
   * @param {number} id - Entry ID
   * @param {Object} entryData - Journal entry data
   */
  updateEntry: async (id, entryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(entryData)
    });
    
    return handleResponse(response);
  },
  
  /**
   * Delete a journal entry
   * @param {number} id - Entry ID
   */
  deleteEntry: async (id) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal/${id}`, {
      method: 'DELETE',
      headers
    });
    
    return handleResponse(response);
  },
  
  /**
   * Search journal entries
   * @param {string} query - Search query
   */
  searchEntries: async (query) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal/search?query=${encodeURIComponent(query)}`, {
      headers
    });
    
    return handleResponse(response);
  },
  
  /**
   * Get streak information
   */
  getStreak: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/journal/streak`, {
      headers
    });
    
    return handleResponse(response);
  }
}; 