import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../services/apiConfig';

export default function WelcomeScreen() {
  const { styles } = useTheme();
  const { authToken } = useAuth();
  const { onboardingState, setAssignedPath } = useOnboarding();

  useEffect(() => {
    // If user is authenticated and has an assigned path, navigate directly
    if (authToken && onboardingState.assignedPath) {
      if (onboardingState.assignedPath === 'character') {
        router.replace('/character-creator');
      } else if (onboardingState.assignedPath === 'survey') {
        router.replace('/personality-test');
      }
    }
  }, [authToken, onboardingState.assignedPath]);

  const createUserProfile = async (researchGroupId: number) => {
    try {
      console.log('Creating user profile with research group:', researchGroupId);
      const requestData = {
        profile: {
          research_group: researchGroupId,
          has_completed_onboarding: false
        }
      };
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      console.log('Request URL:', `${API_BASE_URL}users/update_profile/`);
      console.log('Request headers:', {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json'
      });
      
      const response = await axios.patch(
        `${API_BASE_URL}users/update_profile/`,
        requestData,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Profile created:', response.data);
      
      // Check if profile was updated successfully
      if (!response.data.profile?.research_group) {
        throw new Error('Failed to update research group');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating profile:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      throw error;
    }
  };

  const handleSurveyChoice = async () => {
    try {
      console.log('Setting survey path');
      
      // First get available research groups
      const groupsResponse = await axios.get(`${API_BASE_URL}research-groups/available/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Available research groups:', groupsResponse.data);
      
      // Find Group B (Survey group)
      const surveyGroup = groupsResponse.data.find((group: any) => group.condition === 'B');
      if (!surveyGroup) {
        throw new Error('Survey research group not found');
      }
      
      console.log('Found survey group:', surveyGroup);
      
      // Assign user to research group B
      const response = await axios.post(
        `${API_BASE_URL}users/assign_research_group/`,
        {
          research_group_id: surveyGroup.id
        },
        {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Research group assignment response:', response.data);
      
      // Verify the profile was updated correctly
      const verifyResponse = await axios.get(`${API_BASE_URL}users/me/`, {
        headers: {
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Verification response:', verifyResponse.data);
      
      const profile = verifyResponse.data.profile;
      if (!profile?.research_group || profile.research_group.condition !== 'B') {
        throw new Error('Failed to set research group - verification failed');
      }
      
      // If we get here, everything is set correctly
      await setAssignedPath('survey');
      router.replace('/personality-test');
      
    } catch (error) {
      console.error('Error in handleSurveyChoice:', error);
      // Handle error appropriately
    }
  };

  const handleCharacterChoice = async () => {
    try {
      console.log('Setting character path');
      // Research group ID 1 is for Group A (Character)
      const response = await createUserProfile(1);
      console.log('Profile update response:', response);
      
      // Only proceed if we have a valid profile with research group
      if (response.profile?.research_group) {
        await setAssignedPath('character');
        router.replace('/character-creator');
      } else {
        throw new Error('Failed to set research group');
      }
    } catch (error) {
      console.error('Error in handleCharacterChoice:', error);
      // Handle error appropriately
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