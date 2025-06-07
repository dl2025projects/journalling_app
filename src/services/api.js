import axios from 'axios';

// Base URL for API calls
const API_URL = 'http://localhost:3000/api'; // This will be replaced with the actual API URL

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // In a real app, we would get the token from storage
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Journal entry related API calls
const journalApi = {
  // Get all journal entries
  getEntries: async () => {
    try {
      // In a real app, this would be a real API call
      // const response = await api.get('/entries');
      // return response.data;
      
      // For now, return mock data
      return [
        { id: '1', date: '2025-06-07', title: 'My First Entry', content: 'Today was a great day...' },
        { id: '2', date: '2025-06-06', title: 'Learning React Native', content: 'I started learning...' },
      ];
    } catch (error) {
      console.error('Error fetching entries:', error);
      throw error;
    }
  },
  
  // Get a single journal entry by ID
  getEntry: async (id) => {
    try {
      // In a real app, this would be a real API call
      // const response = await api.get(`/entries/${id}`);
      // return response.data;
      
      // For now, return mock data
      return {
        id,
        title: 'My Journal Entry',
        content: 'This is the content of my journal entry. It was a wonderful day filled with coding and learning new things about React Native.',
        date: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error(`Error fetching entry ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new journal entry
  createEntry: async (entry) => {
    try {
      // In a real app, this would be a real API call
      // const response = await api.post('/entries', entry);
      // return response.data;
      
      // For now, return mock data with a generated ID
      return {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
      };
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  },
  
  // Update an existing journal entry
  updateEntry: async (id, entry) => {
    try {
      // In a real app, this would be a real API call
      // const response = await api.put(`/entries/${id}`, entry);
      // return response.data;
      
      // For now, return the updated entry
      return {
        ...entry,
        id,
      };
    } catch (error) {
      console.error(`Error updating entry ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a journal entry
  deleteEntry: async (id) => {
    try {
      // In a real app, this would be a real API call
      // await api.delete(`/entries/${id}`);
      // return true;
      
      // For now, just return true
      return true;
    } catch (error) {
      console.error(`Error deleting entry ${id}:`, error);
      throw error;
    }
  },
  
  // Get streak information
  getStreak: async () => {
    try {
      // In a real app, this would be a real API call
      // const response = await api.get('/streak');
      // return response.data;
      
      // For now, return mock data
      return {
        currentStreak: 5,
        longestStreak: 10,
        lastEntryDate: new Date().toISOString().split('T')[0],
      };
    } catch (error) {
      console.error('Error fetching streak info:', error);
      throw error;
    }
  },
};

export default journalApi; 