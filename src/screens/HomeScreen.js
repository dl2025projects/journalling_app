import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useJournal } from '../context/JournalContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateUtils';
import { JournalEntryItem, StreakCounter, AnimatedButton } from '../components';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { entries, loading, error, streak, refreshEntries, searchEntries } = useJournal();
  const { logout, userInfo } = useAuth();
  
  const filteredEntries = searchQuery.trim() 
    ? searchEntries(searchQuery) 
    : entries;
  
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshEntries();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleEntryPress = (entryId) => {
    navigation.navigate('EntryDetail', { entryId });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <JournalEntryItem 
      entry={item} 
      onPress={() => handleEntryPress(item.id)}
      index={index}
    />
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Journal</Text>
        <View style={styles.headerRight}>
          <StreakCounter streak={streak} />
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleLogout}
          >
            <Text style={styles.profileText}>
              {userInfo?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search entries..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a6ea9" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <AnimatedButton 
            title="Retry" 
            onPress={refreshEntries}
            style={styles.retryButton}
          />
        </View>
      ) : (
        <FlatList
          data={filteredEntries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4a6ea9']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() ? 'No matching entries found' : 'No journal entries yet'}
              </Text>
            </View>
          }
        />
      )}
      
      <View style={styles.fabContainer}>
        <AnimatedButton
          title="+"
          onPress={() => navigation.navigate('NewEntry')}
          style={styles.addButton}
          textStyle={styles.addButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#4a6ea9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4a6ea9',
  },
  searchInput: {
    margin: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  list: {
    flex: 1,
    padding: 10,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 200,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen; 