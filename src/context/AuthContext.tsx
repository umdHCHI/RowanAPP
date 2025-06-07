import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  authToken: string;
  characterId: number | null;
  setAuthToken: (token: string) => void;
  setCharacterId: (id: number) => void;
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'authToken';
const CHARACTER_ID_KEY = 'characterId';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthTokenState] = useState('');
  const [characterId, setCharacterIdState] = useState<number | null>(null);

  // Load stored auth data on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedCharacterId] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(CHARACTER_ID_KEY)
        ]);

        if (storedToken) {
          setAuthTokenState(storedToken);
        }
        if (storedCharacterId) {
          setCharacterIdState(parseInt(storedCharacterId, 10));
        }
      } catch (error) {
        console.error('Failed to load auth data from storage:', error);
      }
    };

    loadStoredAuth();
  }, []);

  const setAuthToken = async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      setAuthTokenState(token);
    } catch (error) {
      console.error('Failed to save auth token:', error);
    }
  };

  const setCharacterId = async (id: number) => {
    try {
      await AsyncStorage.setItem(CHARACTER_ID_KEY, id.toString());
      setCharacterIdState(id);
    } catch (error) {
      console.error('Failed to save character ID:', error);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(CHARACTER_ID_KEY)
      ]);
      setAuthTokenState('');
      setCharacterIdState(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ authToken, characterId, setAuthToken, setCharacterId, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
} 