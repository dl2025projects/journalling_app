import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import journalApi from '../services/api';
import { calculateStreak } from '../utils/dateUtils';

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

  // Load entries from storage or API
  useEffect(() => {
    loadEntries();
  }, []);

  // Calculate streak whenever entries change
  useEffect(() => {
    if (entries.length > 0) {
      const dates = entries.map(entry => entry.date);
      const currentStreak = calculateStreak(dates);
      setStreak(currentStreak);
    }
  }, [entries]);

  // Load entries from API and save to local storage
  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get entries from AsyncStorage first
      const storedEntries = await AsyncStorage.getItem('journal_entries');
      
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      } else {
        // If no stored entries, fetch from API
        const fetchedEntries = await journalApi.getEntries();
        setEntries(fetchedEntries);
        // Save to AsyncStorage
        await AsyncStorage.setItem('journal_entries', JSON.stringify(fetchedEntries));
      }
    } catch (err) {
      console.error('Error loading entries:', err);
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Add a new entry
  const addEntry = async (entry) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add entry via API
      const newEntry = await journalApi.createEntry(entry);
      
      // Update state with new entry
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('journal_entries', JSON.stringify(updatedEntries));
      
      return newEntry;
    } catch (err) {
      console.error('Error adding entry:', err);
      setError('Failed to add journal entry');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing entry
  const updateEntry = async (id, updatedEntry) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update entry via API
      const result = await journalApi.updateEntry(id, updatedEntry);
      
      // Update state with updated entry
      const updatedEntries = entries.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      );
      setEntries(updatedEntries);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('journal_entries', JSON.stringify(updatedEntries));
      
      return result;
    } catch (err) {
      console.error('Error updating entry:', err);
      setError('Failed to update journal entry');
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
      
      // Delete entry via API
      await journalApi.deleteEntry(id);
      
      // Update state to remove entry
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('journal_entries', JSON.stringify(updatedEntries));
      
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
      // Check if the entry is in the current state
      const existingEntry = entries.find(entry => entry.id === id);
      
      if (existingEntry) {
        return existingEntry;
      }
      
      // If not found in state, try to get from API
      const entry = await journalApi.getEntry(id);
      return entry;
    } catch (err) {
      console.error('Error getting entry:', err);
      setError('Failed to get journal entry');
      throw err;
    }
  };

  // Search entries by keyword
  const searchEntries = (keyword) => {
    if (!keyword) return entries;
    
    const lowercaseKeyword = keyword.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(lowercaseKeyword) || 
      entry.content.toLowerCase().includes(lowercaseKeyword)
    );
  };

  // Refresh entries from API
  const refreshEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch fresh entries from API
      const freshEntries = await journalApi.getEntries();
      
      // Update state
      setEntries(freshEntries);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('journal_entries', JSON.stringify(freshEntries));
      
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