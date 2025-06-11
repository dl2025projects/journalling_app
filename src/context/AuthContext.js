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
          // Verify token validity
          const isValid = await verifyToken(token);
          
          if (isValid) {
            setUserToken(token);
            
            // Fetch user profile
            try {
              const userProfile = await authApi.getProfile();
              setUserInfo(userProfile);
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // If we can't get the profile, clear the token
              await logout();
            }
          } else {
            // If token is invalid, clear it
            await logout();
          }
        }
      } catch (e) {
        console.error('Restoration error:', e);
        await logout();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Verify token validity
  const verifyToken = async (token) => {
    try {
      if (!token) {
        console.log('No token provided to verify');
        return false;
      }
      
      // Store token temporarily
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      
      // Try to access a protected endpoint to verify token
      try {
        await authApi.getProfile();
        return true;
      } catch (error) {
        if (error.message === 'Session expired. Please log in again.') {
          console.log('Token expired during verification');
          await AsyncStorage.removeItem('userToken');
          setUserToken(null);
        }
        console.error('Profile fetch failed during token verification:', error);
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // Refresh token if needed
  const refreshTokenIfNeeded = async () => {
    try {
      // Check if we have a token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;
      
      // Verify current token
      const isValid = await verifyToken(token);
      if (isValid) return true;
      
      // If invalid, try to refresh (implementation depends on your backend)
      // This would be where you'd call a refresh token endpoint
      // For now, just return false to indicate we couldn't refresh
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to login with email:', email);
      
      // First clear any existing token to prevent conflicts
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
      
      // Attempt login
      const response = await authApi.login({ email, password });
      
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Set token and user info
      setUserToken(response.token);
      setUserInfo({
        id: response.id,
        username: response.username,
        email: response.email
      });
      
      console.log('Login successful, token set');
      return true;
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      setError(error.message || 'Failed to login');
      // Clear any partial token data on error
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
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
      console.log('Logging out user, clearing token');
      // Clear token from storage first
      await AsyncStorage.removeItem('userToken');
      
      // Try to call logout API if possible
      try {
        await authApi.logout();
      } catch (error) {
        console.log('API logout failed, but continuing with local logout');
      }
      
      // Clear state regardless of API success
      setUserToken(null);
      setUserInfo(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force state clear even on error
      setUserToken(null);
      setUserInfo(null);
      await AsyncStorage.removeItem('userToken');
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
    refreshTokenIfNeeded,
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