import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { useTheme } from '../../src/context/ThemeContext';
import { apiService } from '../../src/services/apiService';

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

    // 3. For admin user, always go to onboarding regardless of backend state
    if (username.toLowerCase() === 'admin') {
      // Reset onboarding state to ensure fresh start
      setOnboardingState(prev => ({
        ...prev,
        isComplete: false,
        assignedPath: null // Clear any previous path assignment
      }));
      
      // Always navigate to onboarding welcome screen
      router.replace('/(onboarding)/onboarding');
    } else {
      // For non-admin users, use the original smart navigation logic
      const userProfile = loginResponse.user;
      const needsOnboarding = loginResponse.needs_onboarding || !userProfile.profile?.has_completed_onboarding;
      
      if (needsOnboarding) {
        // User needs to complete onboarding
        if (userProfile.profile?.completion_type === 'character') {
          // User has already chosen character path, go to character creator
          setOnboardingState(prev => ({
            ...prev,
            assignedPath: 'character',
            isComplete: false
          }));
          router.replace('/(onboarding)/character-creator');
        } else if (userProfile.profile?.completion_type === 'survey') {
          // User has already chosen survey path, go to personality test
          setOnboardingState(prev => ({
            ...prev,
            assignedPath: 'survey',
            isComplete: false
          }));
          router.replace('/(onboarding)/personality-test');
        } else {
          // User hasn't chosen a path yet, go to welcome screen
          setOnboardingState(prev => ({
            ...prev,
            isComplete: false
          }));
          router.replace('/(onboarding)/onboarding');
        }
      } else {
        // User has completed onboarding, go to main app
        setOnboardingState(prev => ({
          ...prev,
          isComplete: true,
          assignedPath: userProfile.profile?.completion_type as 'character' | 'survey' | null
        }));
        
        if (userProfile.profile?.completion_type === 'character') {
          router.replace('/(character)/character');
        } else {
          router.replace('/(personality)/personality');
        }
      }
    }
  } catch (err: any) {
    console.error('Login error:', err);
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

