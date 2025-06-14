import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { userService } from '../services/userService';
import Constants from 'expo-constants';
import { AuthContextType } from '../types/user';


const TEST_USER_TOKEN = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;

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
        setIsTestUser(storedToken === TEST_USER_TOKEN);
        if (storedToken) {
          // Get user profile from service
          try {
            const profile = await userService.getProfile();
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
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('characterId', charId);
    setAuthToken(token);
    setCharacterId(charId);
    setIsTestUser(token === TEST_USER_TOKEN);
    try {
      const profile = await userService.getProfile();
      setUser({ username: profile.username });
    } catch {
      setUser(null);
    }
  };

  const logout = async () => {
    await userService.logout();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('characterId');
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