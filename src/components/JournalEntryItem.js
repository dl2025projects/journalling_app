import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { formatDate } from '../utils/dateUtils';

const JournalEntryItem = ({ entry, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
    >
      <Text style={styles.date}>{formatDate(entry.date)}</Text>
      <Text style={styles.title}>{entry.title}</Text>
      <Text style={styles.preview} numberOfLines={2}>{entry.content}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  preview: {
    color: '#444',
  },
});

export default JournalEntryItem; 