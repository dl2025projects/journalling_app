import React from 'react';
import EntryDetailScreen from './EntryDetailScreen';

const NewEntryScreen = ({ navigation, route }) => {
  // We can reuse the EntryDetailScreen component for creating new entries
  // Just pass empty params so it knows it's a new entry
  return <EntryDetailScreen navigation={navigation} route={{params: {}}} />;
};

export default NewEntryScreen; 