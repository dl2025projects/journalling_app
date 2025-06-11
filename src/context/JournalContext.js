import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { journalApi } from '../services/api';
import { calculateStreak } from '../utils/dateUtils';
import { useAuth } from './AuthContext';

// Create context
const JournalContext = createContext();

// Custom hook to use the journal context
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};

// Journal provider component
export const JournalProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streak, setStreak] = useState(0);
  const { isLoggedIn, refreshTokenIfNeeded } = useAuth();

  // Load entries from storage or API when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadEntries();
    } else {
      // Clear entries when logged out
      setEntries([]);
    }
  }, [isLoggedIn]);

  // Load entries from API
  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        return;
      }
      
      // Fetch entries from API
      const fetchedEntries = await journalApi.getEntries();
      setEntries(fetchedEntries);
      
      // Get streak information from API
      try {
        const streakData = await journalApi.getStreak();
        setStreak(streakData.currentStreak);
      } catch (streakError) {
        console.error('Error loading streak:', streakError);
        // Fallback to client-side calculation
        if (fetchedEntries.length > 0) {
          const dates = fetchedEntries.map(entry => entry.date);
          const currentStreak = calculateStreak(dates);
          setStreak(currentStreak);
        }
      }
    } catch (err) {
      console.error('Error loading entries:', err);
      setError(err.message || 'Failed to load journal entries');
      setEntries([]); // Clear entries on error
    } finally {
      setLoading(false);
    }
  };

  // Add a new entry
  const addEntry = async (entry) => {
    try {
      // Validate entry before proceeding
      if (!entry.title || entry.title.trim() === '') {
        setError('Please provide title and content');
        throw new Error('Please provide title and content');
      }

      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      // Add entry via API
      const newEntry = await journalApi.createEntry(entry);
      
      // Update state with new entry
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      // Update streak
      try {
        const streakData = await journalApi.getStreak();
        setStreak(streakData.currentStreak);
      } catch (streakError) {
        console.error('Error updating streak:', streakError);
      }
      
      return newEntry;
    } catch (err) {
      console.error('Error adding entry:', err);
      setError(err.message || 'Failed to add journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing entry
  const updateEntry = async (id, updatedEntry) => {
    try {
      // Validate entry before proceeding
      if (!updatedEntry.title || updatedEntry.title.trim() === '') {
        setError('Please provide title and content');
        throw new Error('Please provide title and content');
      }

      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      // Update entry via API
      const result = await journalApi.updateEntry(id, updatedEntry);
      
      // Update state with updated entry
      const updatedEntries = entries.map(entry => 
        entry.id === id ? { ...entry, ...result } : entry
      );
      setEntries(updatedEntries);
      
      return result;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError(err.message || 'Failed to update journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an entry
  const deleteEntry = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      // Delete entry via API
      await journalApi.deleteEntry(id);
      
      // Update state to remove entry
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      
      return true;
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Failed to delete journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single entry by ID
  const getEntry = async (id) => {
    try {
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      // Check if the entry is in the current state
      const existingEntry = entries.find(entry => entry.id === id);
      
      if (existingEntry) {
        return existingEntry;
      }
      
      // If not found in state, get from API
      const entry = await journalApi.getEntry(id);
      return entry;
    } catch (err) {
      console.error('Error getting entry:', err);
      setError('Failed to get journal entry');
      throw err;
    }
  };

  // Search entries by keyword
  const searchEntries = async (keyword) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      if (!keyword || keyword.trim() === '') {
        return entries;
      }
      
      // Search entries via API
      const searchResults = await journalApi.searchEntries(keyword);
      return searchResults;
    } catch (err) {
      console.error('Error searching entries:', err);
      setError('Failed to search journal entries');
      
      // Fallback to local search if API fails
      const lowercaseKeyword = keyword.toLowerCase();
      return entries.filter(entry => 
        entry.title.toLowerCase().includes(lowercaseKeyword) || 
        entry.content.toLowerCase().includes(lowercaseKeyword)
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh entries from API
  const refreshEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure token is valid before making API calls
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setError('Session expired. Please log in again.');
        throw new Error('Authorization token not found');
      }
      
      // Fetch fresh entries from API
      const freshEntries = await journalApi.getEntries();
      
      // Update state
      setEntries(freshEntries);
      
      // Update streak
      try {
        const streakData = await journalApi.getStreak();
        setStreak(streakData.currentStreak);
      } catch (streakError) {
        console.error('Error updating streak:', streakError);
      }
      
      return freshEntries;
    } catch (err) {
      console.error('Error refreshing entries:', err);
      setError('Failed to refresh journal entries');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    entries,
    loading,
    error,
    streak,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    searchEntries,
    refreshEntries,
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export default JournalContext; 