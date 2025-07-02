//should be done and centeralized now 

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useMasterState } from '../../context/MasterStateContext';
import {
  apiService
} from '../../imports';

export default function LoginScreen() {
  const router = useRouter();
  const { auth, theme, onboarding } = useMasterState();
  const { login } = auth;
  const { styles } = theme;
  const { setAssignedPath } = onboarding;
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // 1. Login and get token
      const loginResponse = await apiService.login(username, password);
      const token = loginResponse.token;

      // 2. Store token in context/storage
      await login(token, String(loginResponse.user.id), loginResponse.user);

      // 3. Check user profile and onboarding status
      const userProfile = loginResponse.user;
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = userProfile.profile?.has_completed_onboarding;
      const completionType = userProfile.profile?.completion_type;
      const needsOnboarding = loginResponse.needs_onboarding;
      const onboardingType = loginResponse.onboarding_type;
      const isAdminUser = userProfile.username === 'admin';

      console.log('=== LOGIN FLOW DEBUG ===');
      console.log('Username:', userProfile.username);
      console.log('Is admin user:', isAdminUser);
      console.log('Needs onboarding (backend):', needsOnboarding);
      console.log('Onboarding type (backend):', onboardingType);
      console.log('Has completed onboarding:', hasCompletedOnboarding);
      console.log('Completion type:', completionType);
      
      // Determine if user should go through onboarding
      let shouldRedirectToOnboarding = false;
      let assignedPath: 'character' | 'survey' | null = null;
      
      if (isAdminUser) {
        // Admin users should always go through onboarding (for testing)
        shouldRedirectToOnboarding = true;
        assignedPath = null; // Let them choose
      } else if (needsOnboarding) {
        // User needs onboarding based on backend response
        shouldRedirectToOnboarding = true;
        // Use the onboarding_type from backend if available
        if (onboardingType === 'character' || onboardingType === 'survey') {
          assignedPath = onboardingType;
        } else {
          assignedPath = null; // Let them choose
        }
      } else if (!hasCompletedOnboarding) {
        // User hasn't completed onboarding
        shouldRedirectToOnboarding = true;
        assignedPath = null; // Let them choose
      } else if (hasCompletedOnboarding && completionType) {
        // User has completed onboarding with a proper completion type
        shouldRedirectToOnboarding = false;
        assignedPath = completionType as 'character' | 'survey';
      } else {
        // Fallback - user has completed onboarding but no completion type
        shouldRedirectToOnboarding = true;
        assignedPath = null;
      }
      
      console.log('Should redirect to onboarding:', shouldRedirectToOnboarding);
      console.log('Assigned path:', assignedPath);
      
      if (shouldRedirectToOnboarding) {
        // User needs to complete onboarding
        setAssignedPath(assignedPath);
        if (assignedPath === 'character') {
          router.replace('/(onboarding)/character-creator');
        } else if (assignedPath === 'survey') {
          router.replace('/(onboarding)/personality-test');
        } else {
          router.replace('/(onboarding)/onboarding');
        }
      } else {
        // User has completed onboarding with a proper completion type
        setAssignedPath(assignedPath);
        
        // Navigate based on completion type
        if (assignedPath === 'character') {
          router.replace('/(character)/character');
        } else if (assignedPath === 'survey') {
          router.replace('/(personality)/personality');
        } else {
          // This shouldn't happen if we checked properly above
          router.replace('/(onboarding)/onboarding');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.screenContainer, styles.loginContainer]}>
      <Text style={styles.title}>Welcome Back!</Text>
      
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#666"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        {error ? <Text style={styles.loginErrorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Test User Auto-Login Button */}
        <TouchableOpacity
          style={[styles.button, { marginTop: 10, backgroundColor: '#10B981' }]}
          onPress={async () => {
            setIsLoading(true);
            try {
              // Use the fallback test token for auto-login
              const testToken = '8a71299900898a32febbca89ef5638a406475348';
              const testUserId = '1'; // Assuming test user ID is 1
              
              // For test login, create a mock user object
              const mockUser = { username: 'admin' };
              await login(testToken, testUserId, mockUser);
              
              // Admin users should go through onboarding, so redirect there
              router.replace('/(onboarding)/onboarding');
            } catch (err) {
              setError('Test login failed');
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            Admin Test Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

