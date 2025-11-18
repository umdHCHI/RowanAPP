import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';
import { AuthContextType } from '../types/user';

const HOME_ROUTE_CHARACTER = '/(character)/character';
const HOME_ROUTE_PERSONALITY = '/(personality)/personality';
const WELCOME_ROUTE = '/(onboarding)/onboarding';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [isTestUser, setIsTestUser] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadStoredAuth = async () => {
      // Don't load auth if we're in the middle of logging out
      if (isLoggingOut) {
        return;
      }
      
      try {
        const [storedToken, storedCharId, storedUserData] = await Promise.all([
          AsyncStorage.getItem('authToken'),
          AsyncStorage.getItem('characterId'),
          AsyncStorage.getItem('userData')
        ]);
        
        if (storedToken && storedCharId) {
          setAuthToken(storedToken);
          setCharacterId(storedCharId);
          
          if (storedUserData) {
            try {
              const userData = JSON.parse(storedUserData);
              setUser({ username: userData.username });
              const uname = (userData.username || '').toLowerCase();
              const isAdminUser = uname === 'admin';
              const isTestFlag = Boolean((userData as any)?.is_test_user);
              const isExactTestUsername = uname === 'test';
              const isTestOrAdmin = isAdminUser || isTestFlag || isExactTestUsername;
              setIsTestUser(isTestOrAdmin);
            } catch {
            }
          }
        }
      } catch {
      }
    };
    
    loadStoredAuth();
  }, [isLoggingOut]);
  
  const login = async (token: string, charId: string, userData?: any) => {
    try {
      setAuthToken(token);
      setCharacterId(charId);
      
      if (userData) {
        setUser({ username: userData.username });
        const uname = (userData.username || '').toLowerCase();
        const isAdminUser = uname === 'admin';
        const isTestFlag = Boolean((userData as any)?.is_test_user);
        const isExactTestUsername = uname === 'test';
        const isTestOrAdmin = isAdminUser || isTestFlag || isExactTestUsername;
        setIsTestUser(isTestOrAdmin);
      }

      const uname = (userData?.username || '').toLowerCase();
      const isAdminUser = uname === 'admin';
      const isTestFlag = Boolean((userData as any)?.is_test_user);
      const isExactTestUsername = uname === 'test';
      const forceWelcome = isAdminUser || isTestFlag || isExactTestUsername;

      const hasCompleted = Boolean(userData?.profile?.has_completed_onboarding);
      const completionType = userData?.profile?.completion_type;
      const hasPersonalityProfile = userData?.personality_profile?.profile_summary?.dominant_trait;

      if (forceWelcome) {
        router.replace(WELCOME_ROUTE);
        return;
      }

      if (hasCompleted) {
        if (hasPersonalityProfile) {
          router.replace(HOME_ROUTE_PERSONALITY);
          return;
        }
        
        if (completionType === 'character') {
          router.replace(HOME_ROUTE_CHARACTER);
          return;
        }
        if (completionType === 'survey') {
          router.replace(HOME_ROUTE_PERSONALITY);
          return;
        }
        router.replace(WELCOME_ROUTE);
        return;
      }

      router.replace(WELCOME_ROUTE);
    } catch {
    }
  };

  const logout = async () => {
    // Set logout flag to prevent re-authentication
    setIsLoggingOut(true);
    
    try {
      await apiService.logout();
    } catch (error) {
      // Silently handle logout API errors - local logout still proceeds
    }
    
    // Clear state immediately
    setAuthToken(null);
    setCharacterId(null);
    setIsTestUser(false);
    setUser(null);
    
    // Clear AsyncStorage
    try {
      await AsyncStorage.multiRemove(['authToken', 'characterId', 'userData', 'isTestUser']);
    } catch (error) {
      console.error('[AuthContext] Failed to clear AsyncStorage:', error);
      setIsLoggingOut(false);
      throw error;
    }
    
    // Small delay to ensure state updates propagate
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Navigate to login screen
    try {
      router.replace('/(auth)/login');
    } catch (navError) {
      // Try fallback navigation methods
      try {
        router.push('/(auth)/login');
      } catch (pushError) {
        router.replace('/');
        setTimeout(() => router.replace('/(auth)/login'), 100);
      }
    }
    
    // Reset logout flag after navigation
    setTimeout(() => setIsLoggingOut(false), 1000);
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