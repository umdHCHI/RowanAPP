//should be cleaned up and centralized now 
import React, { useEffect } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  completeOnboarding,
  router,
  useAuth,
  useOnboarding,
  useTheme
} from '../../imports';

export default function WelcomeScreen() {
  const { styles } = useTheme();
  const { authToken, isTestUser } = useAuth();
  const { onboardingState, setAssignedPath, setIsLoading } = useOnboarding();

  useEffect(() => {
    // Only auto-navigate for non-admin users who already have an assigned path
    if (authToken && onboardingState.assignedPath && !isTestUser) {
      if (onboardingState.assignedPath === 'character') {
        router.replace('/(onboarding)/character-creator');
      } else if (onboardingState.assignedPath === 'survey') {
        router.replace('/(onboarding)/personality-test');
      }
    }
  }, [authToken, onboardingState.assignedPath, isTestUser]);

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
        style={[styles.button, styles.welcomeButton, onboardingState.isLoading && styles.welcomeButtonDisabled]}
        onPress={handleSurveyChoice}
        disabled={onboardingState.isLoading}
      >
        <Text style={styles.buttonText}>
          {onboardingState.isLoading ? 'Processing...' : 'Start Personality Survey'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.welcomeButton, onboardingState.isLoading && styles.welcomeButtonDisabled]}
        onPress={handleCharacterChoice}
        disabled={onboardingState.isLoading}
      >
        <Text style={styles.buttonText}>
          {onboardingState.isLoading ? 'Processing...' : 'Start Character Creator'}
        </Text>
      </TouchableOpacity>
    </View>
  );
} 