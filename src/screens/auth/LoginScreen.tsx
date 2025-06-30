//should be done and centeralized now 

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  apiService,
  useAuth,
  useOnboarding,
  useTheme
} from '../../imports';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { styles } = useTheme();
  const { onboardingState, setOnboardingState } = useOnboarding();

  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      // 1. Login and get token
      const loginResponse = await apiService.login(username, password);
      const token = loginResponse.token;

      // 2. Store token in context/storage
      await login(token, String(loginResponse.user.id));

      // 3. Check user profile and onboarding status
      const userProfile = loginResponse.user;
      
      // Check if user has completed onboarding
      const hasCompletedOnboarding = userProfile.profile?.has_completed_onboarding;
      const completionType = userProfile.profile?.completion_type;

      // User needs onboarding if:
      // 1. They haven't completed onboarding, OR
      // 2. They have completed onboarding but don't have a completion_type set
      const needsOnboarding = !hasCompletedOnboarding || (hasCompletedOnboarding && !completionType);
      
      if (needsOnboarding) {
        // User needs to complete onboarding
        setOnboardingState(prev => ({
          ...prev,
          isComplete: false,
          assignedPath: null
        }));
        router.replace('/(onboarding)/onboarding');
      } else {
        // User has completed onboarding with a proper completion type
        setOnboardingState(prev => ({
          ...prev,
          isComplete: true,
          assignedPath: completionType as 'character' | 'survey' | null
        }));
        
        // Navigate based on completion type
        if (completionType === 'character') {
          router.replace('/(character)/character');
        } else if (completionType === 'survey') {
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
      </View>
    </View>
  );
}

