import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import API_URL, { getBaseUrl } from '../config/api.config';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const { login, register, isLoading, error, clearError } = useAuth();

  // Show error in alert if one occurs
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Test server connection
  const testConnection = async () => {
    setDebugInfo('Testing connection...');
    try {
      // Use the base URL for health check, not the API URL
      const baseUrl = getBaseUrl();
      setDebugInfo(`Trying to connect to: ${baseUrl}/health`);
      
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.text();
      setDebugInfo(`Connection successful: ${data}`);
    } catch (err) {
      setDebugInfo(`Connection error: ${err.message}`);
      console.error('Connection test error:', err);
    }
  };

  const handleSubmit = async () => {
    if (isLogin) {
      // Login mode
      if (!email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      setDebugInfo('Logging in...');
      const success = await login(email, password);
      
      if (success) {
        setDebugInfo('Login successful');
        // Navigation is handled by App.js based on auth state
      } else {
        setDebugInfo('Login failed: ' + (error || 'Unknown error'));
      }
    } else {
      // Register mode
      if (!username || !email || !password) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }
      
      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
      
      setDebugInfo('Registering...');
      const success = await register(username, email, password);
      
      if (success) {
        setDebugInfo('Registration successful');
        // Navigation is handled by App.js based on auth state
      } else {
        setDebugInfo('Registration failed: ' + (error || 'Unknown error'));
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>
            {isLogin ? 'Login to Your Journal' : 'Create Account'}
          </Text>
          
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          )}
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={styles.button}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : 'Register'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={toggleMode}
          >
            <Text style={styles.toggleText}>
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, {marginTop: 20, backgroundColor: '#888'}]}
            onPress={testConnection}
          >
            <Text style={styles.buttonText}>
              Test Connection
            </Text>
          </TouchableOpacity>

          {debugInfo ? (
            <Text style={styles.debugText}>{debugInfo}</Text>
          ) : null}
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4a6ea9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4a6ea9',
    fontSize: 16,
  },
  debugText: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
    fontSize: 12
  }
});

export default LoginScreen; 