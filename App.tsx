/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EntryDetailScreen from './src/screens/EntryDetailScreen';
import NewEntryScreen from './src/screens/NewEntryScreen';

// Context
import { JournalProvider } from './src/context/JournalContext';

const Stack = createStackNavigator();

function App(): React.ReactElement {
  return (
    <JournalProvider>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
        </SafeAreaView>
      </NavigationContainer>
    </JournalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
