import React, { useState, useEffect, useRef } from 'react';
import { 
  TextInput, 
  StyleSheet, 
  View,
  Text,
  ActivityIndicator
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
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      // Clear timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChangeText = (text) => {
    setLocalValue(text);
    onChangeText(text);
    
    // Reset any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
      await onSave(textToSave);
      
      // Show saved indicator briefly
      setShowSavedIndicator(true);
      setTimeout(() => {
        setShowSavedIndicator(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
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
      
      {showSavedIndicator && !isSaving && (
        <View style={styles.indicator}>
          <Text style={styles.savedText}>Saved</Text>
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
  }
});

export default AutoSaveInput; 