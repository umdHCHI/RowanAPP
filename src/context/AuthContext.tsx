import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AsyncStorage } from '../imports';
import { apiService } from '../services/apiService';
import { AuthContextType } from '../types/user';

// 🔧 Set these to your actual app routes
const HOME_ROUTE_CHARACTER = '/(character)/character';
const HOME_ROUTE_PERSONALITY = '/(personality)/personality';
const WELCOME_ROUTE = '/(onboarding)/onboarding';

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
                // ✅ Admin/test detection (explicit only)
                const uname = (userData.username || '').toLowerCase();
                const isAdminUser = uname === 'admin';
                const isTestFlag = Boolean((userData as any)?.is_test_user);
                const isExactTestUsername = uname === 'test';
                const isTestOrAdmin = isAdminUser || isTestFlag || isExactTestUsername;
                setIsTestUser(isTestOrAdmin);
                console.log('AuthContext: User type detection - Admin:', isAdminUser, 'TestFlag:', isTestFlag, 'ExactTestName:', isExactTestUsername, 'Combined:', isTestOrAdmin);
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
      console.log('AuthContext: Processing login data...');
      
      // Update the state immediately for better UX
      setAuthToken(token);
      setCharacterId(charId);
      
      // Use user data from login response if provided
      if (userData) {
        setUser({ username: userData.username });
        // ✅ Admin/test detection (explicit only)
        const uname = (userData.username || '').toLowerCase();
        const isAdminUser = uname === 'admin';
        const isTestFlag = Boolean((userData as any)?.is_test_user);
        const isExactTestUsername = uname === 'test';
        const isTestOrAdmin = isAdminUser || isTestFlag || isExactTestUsername;
        setIsTestUser(isTestOrAdmin);
        console.log('AuthContext: User type detection during login - Admin:', isAdminUser, 'TestFlag:', isTestFlag, 'ExactTestName:', isExactTestUsername, 'Combined:', isTestOrAdmin);
      } else {
        console.log('AuthContext: No user data provided, will fetch profile if needed');
        // Note: We don't need to fetch profile here since apiService.login already stores the data
        // The profile can be fetched when needed by other components
      }
      
      console.log('AuthContext: Login state updated successfully');

      // ✅ Route based on login payload's profile (no extra API call needed)
      const uname = (userData?.username || '').toLowerCase();
      const isAdminUser = uname === 'admin';
      const isTestFlag = Boolean((userData as any)?.is_test_user);
      const isExactTestUsername = uname === 'test';
      const forceWelcome = isAdminUser || isTestFlag || isExactTestUsername;

      const hasCompleted = Boolean(userData?.profile?.has_completed_onboarding);
      const completionType = userData?.profile?.completion_type; // 'character' | 'survey'
      const hasPersonalityProfile = userData?.personality_profile?.profile_summary?.dominant_trait;

      console.log('🔍 Auth routing determination:', {
        hasCompleted,
        completionType,
        hasPersonalityProfile,
        dominantTrait: userData?.personality_profile?.profile_summary?.dominant_trait
      });

      if (forceWelcome) {
        router.replace(WELCOME_ROUTE);
        return;
      }

      if (hasCompleted) {
        // If user has a personality profile, they should go to personality home screen
        // regardless of what completion_type says (backend might be wrong)
        if (hasPersonalityProfile) {
          console.log('🎯 Routing to personality home screen (has personality profile)');
          router.replace(HOME_ROUTE_PERSONALITY);
          return;
        }
        
        // Otherwise, use completion_type as before
        if (completionType === 'character') {
          console.log('🎯 Routing to character home screen (completion_type: character)');
          router.replace(HOME_ROUTE_CHARACTER);
          return;
        }
        if (completionType === 'survey') {
          console.log('🎯 Routing to personality home screen (completion_type: survey)');
          router.replace(HOME_ROUTE_PERSONALITY);
          return;
        }
        // Unknown type → safest to let them choose
        router.replace(WELCOME_ROUTE);
        return;
      }

      // Not completed → Welcome to choose once
      router.replace(WELCOME_ROUTE);
    } catch (error) {
      console.error('AuthContext: Error processing login data:', error);
      // Don't throw here - let the calling component handle login errors
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