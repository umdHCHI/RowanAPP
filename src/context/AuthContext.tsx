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
        console.log('AuthContext: Loading stored authentication data...');
        const [storedToken, storedCharId, storedUserData] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('characterId'),
          AsyncStorage.getItem('userData')
        ]);
        
        console.log('AuthContext: Stored token present:', !!storedToken);
        console.log('AuthContext: Stored character ID present:', !!storedCharId);
        console.log('AuthContext: Stored user data present:', !!storedUserData);
        
        if (storedToken && storedCharId) {
          console.log('AuthContext: Restoring authentication from storage');
          setAuthToken(storedToken);
          setCharacterId(storedCharId);
          
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              setUser({ username: userData.username });
              const isTestOrAdmin = userData.username === 'admin' || userData.profile?.completion_type === 'test';
              setIsTestUser(isTestOrAdmin);
            } catch (parseError) {
              console.error('AuthContext: Failed to parse stored user data:', parseError);
            }
          }
        } else {
          console.log('AuthContext: No stored authentication data found');
        }
      } catch (error) {
        console.error('AuthContext: Error loading stored auth data:', error);
      }
    };
    
    loadStoredAuth();
  }, []);
  
  const login = async (token: string, charId: string, userData?: any) => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken'); 
      if (!storedToken || storedToken !== token) {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('characterId', charId);
        // Verify storage worked
        const verifyToken = await AsyncStorage.getItem('authToken');
      }
    } catch (error) {
      console.error('AuthContext: Error verifying/storing token:', error);
    } 
    // Update the state
    setAuthToken(token);
    setCharacterId(charId);
    
    // Use user data from login response if provided, otherwise fetch it
    if (userData) {
      setUser({ username: userData.username });
      // Check if this is a test/admin user
      const isTestOrAdmin = userData.username === 'admin' || userData.profile?.completion_type === 'test';
      setIsTestUser(isTestOrAdmin);
      
    } else {
      console.log('AuthContext: No user data provided, fetching profile');
      // Fallback: try to fetch user profile
      setTimeout(async () => {
        try {
          const profile = await apiService.getProfile();
          setUser({ username: profile.username });
          
          // Check if this is a test/admin user
          const isTestOrAdmin = profile.username === 'admin' || profile.profile?.completion_type === 'test';
          setIsTestUser(isTestOrAdmin);      
        } catch (error: any) {
          console.error('AuthContext: Failed to fetch user profile after login:', error);
          // If it's a 404 error, the endpoint might not exist - that's okay
          if (error.response?.status === 404) {      
            setUser(null);
            setIsTestUser(false);
          } else {
            console.error('AuthContext: Unexpected error fetching user profile after login:', error);
            setUser(null);
            setIsTestUser(false);
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