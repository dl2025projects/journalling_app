import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  ActivityIndicator,
  BackHandler
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import { formatDate, getTodayDate } from '../utils/dateUtils';
import { AutoSaveInput, AnimatedButton } from '../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EntryDetailScreen = ({ route, navigation }) => {
  const { entryId } = route.params || {};
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [hasDraft, setHasDraft] = useState(false);
  
  const { getEntry, updateEntry, deleteEntry, addEntry, error: journalError } = useJournal();
  const { refreshTokenIfNeeded, isLoggedIn } = useAuth();

  // Draft keys
  const getDraftTitleKey = () => `draft_title_${entryId || 'new'}`;
  const getDraftContentKey = () => `draft_content_${entryId || 'new'}`;

  useEffect(() => {
    if (entryId) {
      loadEntry();
    } else {
      // New entry
      const today = getTodayDate();
      setDate(today);
      setIsEditing(true);
      loadDrafts(); // Try to load any existing drafts for new entry
    }
    
    // Handle back button to save drafts
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isEditing) {
        saveDraftsAndGoBack();
        return true; // Prevent default behavior
      }
      return false; // Let default back behavior happen
    });
    
    return () => {
      backHandler.remove();
    };
  }, [entryId]);

  // Handle journal context errors
  useEffect(() => {
    if (journalError && journalError.includes('Authorization token')) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    }
  }, [journalError, navigation]);
  
  // Load drafts from AsyncStorage
  const loadDrafts = async () => {
    try {
      const draftTitle = await AsyncStorage.getItem(getDraftTitleKey());
      const draftContent = await AsyncStorage.getItem(getDraftContentKey());
      
      console.log('Loading drafts:', { draftTitle, draftContent });
      
      if (draftTitle) {
        setTitle(draftTitle);
        setHasDraft(true);
      }
      
      if (draftContent) {
        setContent(draftContent);
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };
  
  // Save drafts to AsyncStorage
  const saveDraft = async (key, value) => {
    try {
      console.log('Saving draft:', { key, value });
      if (value && value.trim() !== '') {
        await AsyncStorage.setItem(key, value);
        setHasDraft(true);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };
  
  // Save content specifically
  const saveContentDraft = async (newContent) => {
    console.log('Saving content draft:', newContent);
    await saveDraft(getDraftContentKey(), newContent);
    setContent(newContent);
    return true;
  };

  // Save title specifically
  const saveTitleDraft = async (newTitle) => {
    console.log('Saving title draft:', newTitle);
    await saveDraft(getDraftTitleKey(), newTitle);
    setTitle(newTitle);
    return true;
  };
  
  // Clear drafts when entry is saved
  const clearDrafts = async () => {
    try {
      await AsyncStorage.removeItem(getDraftTitleKey());
      await AsyncStorage.removeItem(getDraftContentKey());
      setHasDraft(false);
    } catch (error) {
      console.error('Error clearing drafts:', error);
    }
  };
  
  // Save drafts and go back
  const saveDraftsAndGoBack = async () => {
    console.log('Saving drafts before going back:', { title, content });
    
    // Save any unsaved changes to drafts
    if (title && title.trim() !== '') {
      await saveDraft(getDraftTitleKey(), title);
    }
    
    if (content && content.trim() !== '') {
      await saveDraft(getDraftContentKey(), content);
    } else {
      // Even save empty content to preserve the state
      await saveDraft(getDraftContentKey(), content || '');
    }
    
    // Check if we have any drafts after saving
    const hasTitleDraft = await AsyncStorage.getItem(getDraftTitleKey());
    const hasContentDraft = await AsyncStorage.getItem(getDraftContentKey());
    
    const hasAnyDraft = !!(hasTitleDraft || hasContentDraft);
    setHasDraft(hasAnyDraft);
    
    if (hasAnyDraft) {
      Alert.alert(
        'Save Draft',
        'Your changes have been saved as a draft. You can continue editing later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      navigation.goBack();
    }
  };

  const loadEntry = async () => {
    try {
      setIsLoading(true);
      
      // Check token validity first
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      
      const entry = await getEntry(entryId);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setDate(entry.date);
      }
      
      // Check if there are drafts that are newer
      await loadDrafts();
    } catch (error) {
      console.error('Error loading entry:', error);
      
      if (error.message && error.message.includes('Authorization token')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', 'Could not load journal entry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async (newTitle) => {
    // Only save draft, don't auto-save to server
    await saveDraft(getDraftTitleKey(), newTitle);
    setTitle(newTitle);
  };

  const handleSaveContent = async (newContent) => {
    // Only save draft, don't auto-save to server
    await saveDraft(getDraftContentKey(), newContent);
    setContent(newContent);
  };

  const handleSave = async (updatedFields = {}) => {
    const updatedEntry = {
      title: updatedFields.title !== undefined ? updatedFields.title : title,
      content: updatedFields.content !== undefined ? updatedFields.content : content,
      date
    };
    
    // Update local state
    if (updatedFields.title !== undefined) setTitle(updatedFields.title);
    if (updatedFields.content !== undefined) setContent(updatedFields.content);
    
    try {
      setSaveStatus('saving');
      
      // Check token validity first
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        setSaveStatus('error');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      
      if (entryId) {
        // Update existing entry
        await updateEntry(entryId, updatedEntry);
      } else {
        // Create new entry
        const newEntry = await addEntry(updatedEntry);
        // If this is a new entry that was just created, navigate back
        if (!entryId && newEntry.id) {
          navigation.replace('EntryDetail', { entryId: newEntry.id });
        }
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error saving entry:', error);
      setSaveStatus('error');
      
      if (error.message && error.message.includes('Authorization token')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', 'Could not save journal entry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullSave = async () => {
    console.log('Handle full save called with:', { title, content });
    
    if (!title || !title.trim()) {
      Alert.alert('Error', 'Please provide title');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check token validity first
      const isTokenValid = await refreshTokenIfNeeded();
      if (!isTokenValid && isLoggedIn) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        return;
      }
      
      // Create the full entry object
      const completeEntry = {
        title: title.trim(),
        content: content || '',
        date: date
      };
      
      console.log('Saving complete entry:', completeEntry);
      
      // Save to server - this uses the addEntry or updateEntry methods
      if (entryId) {
        await updateEntry(entryId, completeEntry);
      } else {
        const newEntry = await addEntry(completeEntry);
        if (newEntry && newEntry.id) {
          // If we have a new ID, update our route params
          navigation.setParams({ entryId: newEntry.id });
        }
      }
      
      // Clear drafts after successful save
      await clearDrafts();
      
      // Exit edit mode
      setIsEditing(false);
      
      // If this is a new entry, go back to home
      if (!entryId) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      
      if (error.message && error.message.includes('Authorization token')) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Error', error.message || 'Could not save journal entry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              // Check token validity first
              const isTokenValid = await refreshTokenIfNeeded();
              if (!isTokenValid && isLoggedIn) {
                Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please log in again.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
                return;
              }
              
              await deleteEntry(entryId);
              await clearDrafts(); // Clear any drafts when entry is deleted
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting entry:', error);
              
              if (error.message && error.message.includes('Authorization token')) {
                Alert.alert(
                  'Session Expired',
                  'Your session has expired. Please log in again.',
                  [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                );
              } else {
                Alert.alert('Error', 'Could not delete journal entry');
              }
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ea9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(date)}</Text>
        <View style={styles.headerButtons}>
          {entryId && !isEditing && (
            <AnimatedButton
              title="Delete"
              onPress={handleDelete}
              danger={true}
              small={true}
              style={[styles.actionButton, styles.deleteButton, styles.buttonSpacing]}
              textStyle={styles.buttonText}
            />
          )}
          {!isEditing ? (
            <AnimatedButton
              title="Edit"
              onPress={() => setIsEditing(true)}
              small={true}
              style={styles.actionButton}
              textStyle={styles.buttonText}
            />
          ) : (
            <AnimatedButton
              title="Done"
              onPress={handleFullSave}
              small={true}
              style={styles.actionButton}
              textStyle={styles.buttonText}
            />
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            <AutoSaveInput
              value={title}
              onChangeText={setTitle}
              onSave={saveTitleDraft}
              placeholder="Enter title"
              placeholderTextColor="#999"
              style={styles.titleInput}
              required={true}  // Make title required
              minLength={1}    // Minimum title length
              autoSaveDelay={5000} // 5 seconds for drafts
              disableAutoSave={true} // Completely disable auto-save to server
            />
            <AutoSaveInput
              value={content}
              onChangeText={setContent}
              onSave={saveContentDraft}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#999"
              multiline={true}
              style={styles.contentInput}
              textAlignVertical="top"
              autoSaveDelay={5000} // 5 seconds for drafts 
              disableAutoSave={true} // Completely disable auto-save to server
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.contentText}>{content}</Text>
          </>
        )}
        
        {hasDraft && !isEditing && (
          <View style={styles.draftIndicator}>
            <Text style={styles.draftText}>You have a draft saved</Text>
            <AnimatedButton
              title="Continue Editing"
              onPress={() => setIsEditing(true)}
              style={styles.draftButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  date: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonSpacing: {
    marginRight: 8,
  },
  actionButton: {
    minWidth: 70,
  },
  deleteButton: {
    paddingHorizontal: 10,
    minWidth: 60,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    padding: 5,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 5,
  },
  draftIndicator: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c2e0ff',
    alignItems: 'center',
  },
  draftText: {
    color: '#4a6ea9',
    marginBottom: 10,
  },
  draftButton: {
    width: '100%',
  }
});

export default EntryDetailScreen; 