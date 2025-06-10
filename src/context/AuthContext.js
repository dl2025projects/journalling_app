import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

// Create the context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is logged in on app startup
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Get token from storage
        const token = await AsyncStorage.getItem('userToken');
        
        if (token) {
          setUserToken(token);
          
          // Fetch user profile
          try {
            const userProfile = await authApi.getProfile();
            setUserInfo(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // If we can't get the profile, clear the token
            await authApi.logout();
            setUserToken(null);
          }
        }
      } catch (e) {
        console.error('Restoration error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ email, password });
      setUserToken(response.token);
      setUserInfo({
        id: response.id,
        username: response.username,
        email: response.email
      });
      return true;
    } catch (error) {
      setError(error.message || 'Failed to login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register({ username, email, password });
      setUserToken(response.token);
      setUserInfo({
        id: response.id,
        username: response.username,
        email: response.email
      });
      return true;
    } catch (error) {
      setError(error.message || 'Failed to register');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      await authApi.logout();
      setUserToken(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value to expose
  const authContext = {
    isLoading,
    userToken,
    userInfo,
    error,
    login,
    register,
    logout,
    clearError,
    isLoggedIn: !!userToken
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 