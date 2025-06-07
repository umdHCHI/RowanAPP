import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../services/apiConfig';

export default function LoginScreen() {
  const { styles } = useTheme();
  const { setAuthToken, setCharacterId } = useAuth();
  const { onboardingState, setAssignedPath } = useOnboarding();
  const { path } = useLocalSearchParams<{ path: string }>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login to:', `${API_BASE_URL}auth/login/`);
      
      const response = await axios.post(`${API_BASE_URL}auth/login/`, {
        username,
        password,
      });

      console.log('Login response:', response.data);
      
      const { token, user, character_id, research_group, needs_onboarding, onboarding_type } = response.data;
      
      // Store the token and character ID
      await setAuthToken(token);
      if (character_id) {
        await setCharacterId(character_id);
      }

      // If user needs onboarding and has no research group, send them to welcome screen
      if (needs_onboarding && !research_group) {
        console.log('User needs onboarding and has no research group, navigating to welcome screen');
        router.replace('/');
        return;
      }

      // If user has a research group but needs onboarding, set the path based on their group
      if (needs_onboarding && research_group) {
        const assignedPath = research_group.condition === 'A' ? 'character' : 'survey';
        console.log('Setting assigned path based on research group:', assignedPath);
        await setAssignedPath(assignedPath);
        
        if (assignedPath === 'character') {
          console.log('Navigating to character creator');
          router.replace('/character-creator');
        } else {
          console.log('Navigating to personality test');
          router.replace('/personality-test');
        }
        return;
      }

      // If user has a path from welcome screen, use that
      if (path === 'survey' || path === 'character') {
        console.log('Setting assigned path from welcome screen:', path);
        await setAssignedPath(path);
        
        if (path === 'character') {
          console.log('Navigating to character creator');
          router.replace('/character-creator');
        } else {
          console.log('Navigating to personality test');
          router.replace('/personality-test');
        }
        return;
      }

      // If no onboarding needed, go to main screen
      console.log('No onboarding needed, navigating to home');
      router.replace('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        
        if (error.response.status === 500) {
          setError('Server error. Please try again later or contact support.');
        } else if (error.response.status === 401) {
          setError('Invalid username or password');
        } else if (error.response.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError('Failed to login. Please try again.');
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please check your internet connection.');
      } else {
        console.error('Error setting up request:', error.message);
        setError('An unexpected error occurred. Please try again.');
      }
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
          Test Account: username: test, password: test
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

