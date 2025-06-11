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
  required = false, // Whether this field is required for saving
  minLength = 0,    // Minimum length required to save
  disableAutoSave = false, // Disable auto-save functionality
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
  
  // Store locally for draft functionality
  const [draft, setDraft] = useState(value || '');
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    setLocalValue(value);
    setDraft(value || '');
  }, [value]);
  
  // Load draft from AsyncStorage on mount
  useEffect(() => {
    loadDraft();
  }, []);

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
  
  // Load draft from storage (simulated for now)
  const loadDraft = async () => {
    // This would typically load from AsyncStorage
    // For now, we just use the state
    if (draft && draft !== value) {
      setLocalValue(draft);
      onChangeText(draft);
    }
  };
  
  // Save draft locally
  const saveDraft = (text) => {
    setDraft(text);
    // In a real implementation, you would save to AsyncStorage here
    // AsyncStorage.setItem('draft_' + fieldId, text);
  };

  const handleChangeText = (text) => {
    setLocalValue(text);
    onChangeText(text);
    
    // Always save draft immediately
    saveDraft(text);
    
    // Always call onSave function for drafts
    // This will be caught by our custom saveContentDraft/saveTitleDraft functions
    // regardless of auto-save setting
    try {
      onSave(text);
    } catch (err) {
      console.error('Error saving draft via onSave:', err);
    }
    
    // Reset any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Reset error states when user types
    if (saveError) {
      setSaveError(false);
    }
    if (validationError) {
      setValidationError(null);
    }
    
    // If auto-save is disabled, don't set a timeout for server save
    if (disableAutoSave) {
      return;
    }
    
    // Set a new timeout for auto-save to server
    timeoutRef.current = setTimeout(() => {
      validateAndSave(text);
    }, autoSaveDelay);
  };
  
  const validateAndSave = (textToSave) => {
    // Skip empty required fields for auto-save (don't report error)
    if (required && (!textToSave || textToSave.trim() === '')) {
      return;
    }
    
    // Skip too short content for auto-save (don't report error)
    if (minLength > 0 && textToSave && textToSave.length < minLength) {
      return;
    }
    
    // Only auto-save if there are actual changes
    if (textToSave === value) {
      return;
    }
    
    // Proceed with save
    handleSave(textToSave);
  };

  const handleSave = async (textToSave) => {
    // Skip auto-saving if validation fails
    if (required && (!textToSave || textToSave.trim() === '')) {
      setValidationError('This field is required');
      return;
    }
    
    if (minLength > 0 && textToSave && textToSave.length < minLength) {
      setValidationError(`Minimum ${minLength} characters required`);
      return;
    }
    
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
        style={[
          styles.input, 
          multiline && styles.multilineInput, 
          validationError && styles.inputError,
          style
        ]}
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
      
      {validationError && !isSaving && (
        <View style={styles.validationError}>
          <Text style={styles.errorText}>{validationError}</Text>
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
  inputError: {
    borderBottomColor: '#f44336',
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
  },
  validationError: {
    position: 'absolute',
    right: 10,
    top: 10,
  }
});

export default AutoSaveInput; 