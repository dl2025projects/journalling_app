import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import { formatDate, getTodayDate } from '../utils/dateUtils';
import { AutoSaveInput } from '../components';

const EntryDetailScreen = ({ route, navigation }) => {
  const { entryId } = route.params || {};
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  
  const { getEntry, updateEntry, deleteEntry, addEntry } = useJournal();

  useEffect(() => {
    if (entryId) {
      loadEntry();
    } else {
      // New entry
      const today = getTodayDate();
      setDate(today);
      setIsEditing(true);
    }
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setIsLoading(true);
      const entry = await getEntry(entryId);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setDate(entry.date);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'Could not load journal entry');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTitle = async (newTitle) => {
    return handleSave({ title: newTitle });
  };

  const handleSaveContent = async (newContent) => {
    return handleSave({ content: newContent });
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
      Alert.alert('Error', 'Could not save journal entry');
    }
  };

  const handleFullSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      
      await handleSave();
      
      // Exit edit mode
      setIsEditing(false);
      
      // If this is a new entry, go back to home
      if (!entryId) {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Could not save journal entry');
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
              await deleteEntry(entryId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting entry:', error);
              Alert.alert('Error', 'Could not delete journal entry');
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
            <TouchableOpacity 
              style={[styles.button, styles.deleteButton]} 
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          )}
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleFullSave}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            <AutoSaveInput
              value={title}
              onChangeText={setTitle}
              onSave={handleSaveTitle}
              placeholder="Enter title"
              placeholderTextColor="#999"
              style={styles.titleInput}
            />
            <AutoSaveInput
              value={content}
              onChangeText={setContent}
              onSave={handleSaveContent}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#999"
              multiline={true}
              style={styles.contentInput}
              textAlignVertical="top"
            />
          </>
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.contentText}>{content}</Text>
          </>
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#4a6ea9',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
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
});

export default EntryDetailScreen; 