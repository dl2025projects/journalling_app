/**
 * Journal App with MySQL Database Integration
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';
import LoginScreen from './src/screens/LoginScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { JournalProvider } from './src/context/JournalContext';

const Stack = createStackNavigator();

// Auth Stack - for unauthenticated users
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

// App Stack - for authenticated users
const AppStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4a6ea9',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EntryDetail" 
        component={EntryDetailScreen}
        options={{ title: 'Journal Entry' }}
      />
      <Stack.Screen 
        name="NewEntry" 
        component={NewEntryScreen}
        options={{ title: 'New Entry' }}
      />
    </Stack.Navigator>
  );
};

// Main navigation component
const Navigation = () => {
  const { isLoading, isLoggedIn } = useAuth();

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6ea9" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {isLoggedIn ? <AppStack /> : <AuthStack />}
      </SafeAreaView>
    </NavigationContainer>
  );
};

function App(): React.ReactElement {
  return (
    <AuthProvider>
      <JournalProvider>
        <Navigation />
      </JournalProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
