import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import { formatDate, getTodayDate } from '../utils/dateUtils';

const EntryDetailScreen = ({ route, navigation }) => {
  const { entryId } = route.params || {};
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      
      const entryData = {
        title,
        content,
        date,
      };
      
      if (entryId) {
        // Update existing entry
        await updateEntry(entryId, entryData);
      } else {
        // Create new entry
        await addEntry(entryData);
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      // If this is a new entry, go back to home
      if (!entryId) {
        navigation.goBack();
      }
      
      Alert.alert('Success', 'Entry saved successfully');
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
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter title"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#999"
              multiline
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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 5,
    height: 300,
  },
});

export default EntryDetailScreen; 