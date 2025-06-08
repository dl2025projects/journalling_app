import React from 'react';
import { 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { formatDate } from '../utils/dateUtils';
import AnimatedListItem from './AnimatedListItem';

const JournalEntryItem = ({ entry, onPress, index = 0 }) => {
  return (
    <AnimatedListItem index={index}>
      <TouchableOpacity 
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.date}>{formatDate(entry.date)}</Text>
        <Text style={styles.title}>{entry.title}</Text>
        <Text style={styles.preview} numberOfLines={2}>{entry.content}</Text>
      </TouchableOpacity>
    </AnimatedListItem>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
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