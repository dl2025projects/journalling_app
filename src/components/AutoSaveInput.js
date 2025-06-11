import React, { useState, useEffect, useRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';

const AutoSaveInput = ({ 
  value, 
  onChangeText, 
  onSave, 
  placeholder, 
  multiline = false,
  style,
  placeholderTextColor = '#999',
  autoSaveDelay = 2000, // milliseconds
  ...props 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [pendingSave, setPendingSave] = useState(null);
  const timeoutRef = useRef(null);
  const maxRetries = 3;
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimeout, setRetryTimeout] = useState(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      // Clear all timeouts on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [retryTimeout]);

  const handleChangeText = (text) => {
    setLocalValue(text);
    onChangeText(text);
    
    // Reset any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset error state when user types
    if (saveError) {
      setSaveError(false);
    }
    
    // Set a new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      handleSave(text);
    }, autoSaveDelay);
  };

  const handleSave = async (textToSave) => {
    if (textToSave === value) {
      // No changes to save
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveError(false);
      await onSave(textToSave);
      
      // Reset retry count on successful save
      setRetryCount(0);
      
      // Show saved indicator briefly
      setShowSavedIndicator(true);
      setTimeout(() => {
        setShowSavedIndicator(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveError(true);
      
      // Store the pending save for retry
      setPendingSave(textToSave);
      
      // Auto-retry with exponential backoff if under max retries
      if (retryCount < maxRetries) {
        const nextRetryDelay = Math.pow(2, retryCount) * 1000; // exponential backoff
        const timeout = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          handleSave(textToSave);
        }, nextRetryDelay);
        
        setRetryTimeout(timeout);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    if (pendingSave) {
      // Reset retry count for manual retry
      setRetryCount(0);
      handleSave(pendingSave);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}
        style={[styles.input, multiline && styles.multilineInput, style]}
        {...props}
      />
      
      {isSaving && (
        <View style={styles.indicator}>
          <ActivityIndicator size="small" color="#4a6ea9" />
        </View>
      )}
      
      {showSavedIndicator && !isSaving && !saveError && (
        <View style={styles.indicator}>
          <Text style={styles.savedText}>Saved</Text>
        </View>
      )}
      
      {saveError && !isSaving && (
        <View style={styles.errorIndicator}>
          <Text style={styles.errorText}>Failed</Text>
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  input: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  multilineInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  indicator: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  savedText: {
    color: '#4caf50',
    fontSize: 12,
  },
  errorIndicator: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginRight: 6,
  },
  retryButton: {
    backgroundColor: '#4a6ea9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 11,
  }
});

export default AutoSaveInput; 