import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { userService } from '../../src/services/userService';
import { useTheme } from '../../src/context/ThemeContext';
import { useLocalSearchParams } from 'expo-router';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { apiBaseUrl } from '../../src/services/apiConfig';
import { createGlobalStyles } from '../../src/styles/globalStyles';
import { useThemeColor } from '@/app-example/hooks/useThemeColor';

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
    const loginResponse = await userService.login(username, password);
    const token = loginResponse.token;

    // 2. Store token in context/storage
    await login(token, String(loginResponse.user.id));

    // 3. For admin/test, reset onboarding on backend and locally
    if (username === 'admin' || username === 'test') {
      try {

        await userService.updateProfile({ has_completed_onboarding: false });
      } catch (e) {

        console.warn('Could not reset onboarding on backend:', e);
      }
    }

    // 4. Always fetch the latest profile and update onboarding context
    const updatedProfile = await userService.getProfile();
    setOnboardingState(prev => ({
      ...prev,
      isComplete: updatedProfile.profile?.has_completed_onboarding ?? false,
      
    }));

    // 5. Navigate to onboarding
    router.replace('/(onboarding)/onboarding');
  } catch (err: any) {
    setError('Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};
  return (
    <View style={[styles.screenContainer, localStyles.container]}>
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

        {error ? <Text style={localStyles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, isLoading && localStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.text, { marginTop: 16, textAlign: 'center', fontSize: 12 }]}>
          Test Account: username: admin, password: admin
        </Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

