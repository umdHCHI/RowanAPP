import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { AuthContextType } from '../types/user';


const TEST_USER_TOKEN = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;
const FALLBACK_TEST_TOKEN = 'f1cc174d83a2101bc328075957300f2407b68324';

// Debug logging for test token
console.log('AuthContext - Test token configured:', TEST_USER_TOKEN ? 'Yes' : 'No');

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
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedCharacterId = await AsyncStorage.getItem('characterId');
        setAuthToken(storedToken);
        setCharacterId(storedCharacterId);
        setIsTestUser(storedToken === TEST_USER_TOKEN || storedToken === FALLBACK_TEST_TOKEN);
        if (storedToken) {
          // Get user profile from service
          try {
            const profile = await apiService.getProfile();
            setUser({ username: profile.username });
          } catch {
            setUser(null);
          }
        }
      } catch {
        setAuthToken(null);
        setCharacterId(null);
        setIsTestUser(false);
        setUser(null);
      }
    };
    loadStoredAuth();
  }, []);

  const login = async (token: string, charId: string) => {
    // Token is already stored by apiService.login(), so we don't need to store it again
    // Just update the state
    setAuthToken(token);
    setCharacterId(charId);
    setIsTestUser(token === TEST_USER_TOKEN || token === FALLBACK_TEST_TOKEN);
    
    // Add a small delay to ensure the axios interceptor picks up the token
    setTimeout(async () => {
      try {
        const profile = await apiService.getProfile();
        setUser({ username: profile.username });
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
        setUser(null);
      }
    }, 100);
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