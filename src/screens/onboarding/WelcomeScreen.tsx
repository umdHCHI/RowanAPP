//should be cleaned up and centralized now 
import React, { useEffect } from 'react';
import { useMasterState } from "../../context/MasterStateContext";
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  router
} from '../../imports';
import { completeOnboarding } from '../../services/onboardingService';

export default function WelcomeScreen() {
  const { theme, auth, onboarding } = useMasterState();
  const { styles } = theme;
  const { authToken, isTestUser } = auth;
  const { isComplete, assignedPath, setAssignedPath, setIsLoading, isLoading } = onboarding;

  useEffect(() => {
    // Only auto-navigate for non-admin users who already have an assigned path
    if (authToken && assignedPath && !isTestUser) {
      if (assignedPath === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else if (assignedPath === 'survey') {
        router.replace('/(onboarding)/personality-test');
      }
    }
  }, [authToken, assignedPath, isTestUser]);

  const handleSurveyChoice = async () => {
    if (!authToken) {
      Alert.alert('Authentication Error', 'Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      // Complete onboarding for survey path
      const updatedProfile = await completeOnboarding('survey');

      await setAssignedPath('survey');
      // Navigate directly to personality test screen
      router.replace('/(onboarding)/personality-test');
    } catch (error: any) {
      Alert.alert(
        'Error', 
        `Failed to assign survey group: ${error.message || 'Unknown error'}. Please try again or contact support.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCharacterChoice = async () => {
    if (!authToken) {
      Alert.alert('Authentication Error', 'Please log in first');
      return;
    }

    setIsLoading(true);
    try {
      // Complete onboarding for character path
      const updatedProfile = await completeOnboarding('character');

      await setAssignedPath('character');
      // Navigate directly to character creator screen
      router.replace('/(onboarding)/character-creator');
    } catch (error: any) {
      Alert.alert(
        'Error', 
        `Failed to assign character group: ${error.message || 'Unknown error'}. Please try again or contact support.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show message
  if (!authToken) {
    return (
      <View style={[styles.screenContainer, styles.welcomeContainer]}>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={[styles.text, styles.welcomeSubtitle]}>
          Please log in to continue with onboarding.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.welcomeButton]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screenContainer, styles.welcomeContainer]}>
      <Text style={styles.title}>Welcome to the Game!</Text>
      <Text style={[styles.text, styles.welcomeSubtitle]}>
        Choose how you want to start your journey:
      </Text>
      <TouchableOpacity
        style={[styles.button, styles.welcomeButton, isLoading && styles.welcomeButtonDisabled]}
        onPress={handleSurveyChoice}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Start Personality Survey'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.welcomeButton, isLoading && styles.welcomeButtonDisabled]}
        onPress={handleCharacterChoice}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Start Character Creator'}
        </Text>
      </TouchableOpacity>
    </View>
  );
} 