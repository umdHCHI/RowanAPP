import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { AuthContextType } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isTestUser, setIsTestUser] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // Initialize the API service first
        await apiService.initialize();
        
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedCharacterId = await AsyncStorage.getItem('characterId');
        
        console.log('AuthContext: Loaded stored token:', storedToken ? 'Present' : 'Not found');
        console.log('AuthContext: Loaded stored character ID:', storedCharacterId);
        
        setAuthToken(storedToken);
        setCharacterId(storedCharacterId);
        setIsTestUser(false); // Remove test user logic
        
        // Only try to get user profile if we have a valid token
        if (storedToken) {
          console.log('AuthContext: Found stored token, but deferring profile fetch until login');
          // Don't automatically fetch profile on startup to avoid 401 errors
          // Let the login flow handle profile fetching
          setUser(null);
        } else {
          console.log('AuthContext: No stored token, skipping profile fetch');
        }
      } catch (error) {
        console.error('AuthContext: Error loading stored auth data:', error);
        setAuthToken(null);
        setCharacterId(null);
        setIsTestUser(false);
        setUser(null);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (token: string, charId: string, userData?: any) => {
    console.log('=== AUTHCONTEXT LOGIN ===');
    console.log('AuthContext: Login called with token:', token ? 'Present' : 'Not found');
    console.log('AuthContext: Login called with character ID:', charId);
    console.log('AuthContext: Login called with user data:', userData);
    console.log('Token preview:', token ? `${token.substring(0, 10)}...` : 'null');
    
    // Verify the token is actually stored in AsyncStorage
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      console.log('AuthContext: Token already stored:', storedToken ? 'Yes' : 'No');
      console.log('AuthContext: Stored token matches provided:', storedToken === token);
      
      if (!storedToken || storedToken !== token) {
        console.log('AuthContext: Token mismatch, storing provided token...');
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('characterId', charId);
        
        // Verify storage worked
        const verifyToken = await AsyncStorage.getItem('authToken');
        console.log('AuthContext: Token storage verification:', verifyToken === token);
      }
    } catch (error) {
      console.error('AuthContext: Error verifying/storing token:', error);
    }
    
    // Update the state
    setAuthToken(token);
    setCharacterId(charId);
    setIsTestUser(false); // Remove test user logic
    
    // Use user data from login response if provided, otherwise fetch it
    if (userData) {
      console.log('AuthContext: Using provided user data');
      setUser({ username: userData.username });
    } else {
      console.log('AuthContext: No user data provided, fetching profile');
      // Fallback: try to fetch user profile
      setTimeout(async () => {
        try {
          const profile = await apiService.getProfile();
          setUser({ username: profile.username });
          console.log('AuthContext: Successfully fetched user profile after login');
        } catch (error: any) {
          console.error('AuthContext: Failed to fetch user profile after login:', error);
          // If it's a 404 error, the endpoint might not exist - that's okay
          if (error.response?.status === 404) {
            console.log('AuthContext: User profile endpoint not found (404) - this is expected if the endpoint is not implemented');
            setUser(null);
          } else {
            console.error('AuthContext: Unexpected error fetching user profile after login:', error);
            setUser(null);
          }
        }
      }, 100);
    }
  };

  const logout = async () => {
    await apiService.logout();
    // AsyncStorage removal is handled by apiService.logout()
    setAuthToken(null);
    setCharacterId(null);
    setIsTestUser(false);
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ authToken, characterId, isTestUser, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}