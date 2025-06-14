import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { apiBaseUrl } from '../services/apiConfig';
import { researchGroupService } from '../services/researchGroupService';
import { userService } from '../services/userService';
import * as onboardingService from '../services/onboardingService';

export default function WelcomeScreen() {
  const { styles } = useTheme();
  const { authToken } = useAuth();
  const { onboardingState, setAssignedPath } = useOnboarding();

  useEffect(() => {
    // If user is authenticated and has an assigned path, navigate directly
    if (authToken && onboardingState.assignedPath) {
      if (onboardingState.assignedPath === 'character') {
        router.replace('/(character)');
      } else if (onboardingState.assignedPath === 'survey') {
        router.replace('/(personality)');
      }
    }
  }, [authToken, onboardingState.assignedPath]);


  const handleSurveyChoice = async () => {
    try {
      // Get available research groups
      const groupsResponse = await researchGroupService.getAvailableGroups();
      const surveyGroup = groupsResponse.find((group) => group.condition === 'B');
      if (!surveyGroup) throw new Error('Survey research group not found');

      // Assign user to research group B
      await researchGroupService.assignGroup(surveyGroup.id);

      // Verify the profile was updated correctly
      const profile = await onboardingService.getProfile();
      if (!profile.profile?.research_group || profile.profile.research_group.condition !== 'B') {
        throw new Error('Failed to set research group - verification failed');
      }

      await setAssignedPath('survey');
      router.replace('/(onboarding)/personality-test');
    } catch (error) {
      console.error('Error in handleSurveyChoice:', error);
    }
  };
      


  const handleCharacterChoice = async () => {
    try {
      // Update user profile for Group A (Character)
      const response = await onboardingService.updateProfile({
        research_group: 1,
        has_completed_onboarding: false,
      });

      // Only proceed if we have a valid profile with research group
      const profile = await onboardingService.getProfile();
      if (profile.profile?.research_group) {
        await setAssignedPath('character');
        router.replace('/(onboarding)/character-creator');
      } else {
        throw new Error('Failed to set research group');
      }
    } catch (error) {
      console.error('Error in handleCharacterChoice:', error);
    }
  };

  return (
    <View style={[styles.screenContainer, localStyles.container]}>
      <Text style={styles.title}>Welcome to the Game!</Text>
      <Text style={[styles.text, localStyles.subtitle]}>
        Choose how you want to start your journey:
      </Text>
      <TouchableOpacity
        style={[styles.button, localStyles.button]}
        onPress={handleSurveyChoice}
      >
        <Text style={styles.buttonText}>Start Personality Survey</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, localStyles.button]}
        onPress={handleCharacterChoice}
      >
        <Text style={styles.buttonText}>Start Character Creator</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: '80%',
    marginVertical: 10,
  },
}); 