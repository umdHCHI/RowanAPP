import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useTheme } from '../../context/ThemeContext';
import * as onboardingService from '../../services/onboardingService';

export default function WelcomeScreen() {
  const { styles } = useTheme();
  const { authToken, isTestUser } = useAuth();
  const { onboardingState, setAssignedPath } = useOnboarding();
  const [isLoading, setIsLoading] = useState(false);

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

    console.log('Starting survey choice with auth token:', authToken ? 'Present' : 'Missing');
    setIsLoading(true);
    try {
      // Update user profile to mark survey choice
      console.log('Updating user profile for survey choice...');
      const updatedProfile = await onboardingService.updateProfile({
        has_completed_onboarding: false,
        completion_type: 'survey',
      });
      console.log('Updated profile:', updatedProfile);

      await setAssignedPath('survey');
      // Navigate directly to personality test screen
      router.replace('/(onboarding)/personality-test');
    } catch (error) {
      console.error('Error in handleSurveyChoice:', error);
      Alert.alert(
        'Error', 
        'Failed to assign survey group. Please try again or contact support.'
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
      // Update user profile to mark character choice
      console.log('Updating user profile for character choice...');
      const updatedProfile = await onboardingService.updateProfile({
        has_completed_onboarding: false,
        completion_type: 'character',
      });
      console.log('Updated profile:', updatedProfile);

      await setAssignedPath('character');
      // Navigate directly to character creator screen
      router.replace('/(onboarding)/character-creator');
    } catch (error) {
      console.error('Error in handleCharacterChoice:', error);
      Alert.alert(
        'Error', 
        'Failed to assign character group. Please try again or contact support.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // If not authenticated, show message
  if (!authToken) {
    return (
      <View style={[styles.screenContainer, localStyles.container]}>
        <Text style={styles.title}>Authentication Required</Text>
        <Text style={[styles.text, localStyles.subtitle]}>
          Please log in to continue with onboarding.
        </Text>
        <TouchableOpacity
          style={[styles.button, localStyles.button]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const profile = await onboardingService.getProfile();
      console.log('API test successful:', profile);
      console.log('User details:', {
        id: profile.id,
        username: profile.username,
        isTestUser: authToken === 'f1cc174d83a2101bc328075957300f2407b68324',
        profile: profile.profile,
        hasCompletedOnboarding: profile.profile?.has_completed_onboarding,
        completionType: profile.profile?.completion_type,
        researchGroup: profile.profile?.research_group
      });
      Alert.alert('Success', 'API connection working! Check console for user details.');
    } catch (error) {
      console.error('API test failed:', error);
      Alert.alert('Error', 'API connection failed. Check console for details.');
    }
  };

  const testResearchGroups = async () => {
    try {
      console.log('Testing research groups endpoints...');
      
      // Test different possible endpoints
      const endpoints = [
        'research-groups/',
        'research/research-groups/',
        'research-groups/available/',
        'research/research-groups/available/'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Testing endpoint: ${endpoint}`);
          const response = await fetch(`http://131.212.41.8/api/${endpoint}`, {
            headers: {
              'Authorization': `Token ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          console.log(`Endpoint ${endpoint} status:`, response.status);
          if (response.ok) {
            const data = await response.json();
            console.log(`Endpoint ${endpoint} data:`, data);
          }
        } catch (error) {
          console.log(`Endpoint ${endpoint} failed:`, error);
        }
      }
      
      // Test creating a research group
      console.log('Testing research group creation...');
      try {
        const response = await fetch(`http://131.212.41.8/api/research/research-groups/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            condition: 'A',
            description: 'Character System Group'
          })
        });
        console.log('Create research group status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Created research group:', data);
        } else {
          const errorData = await response.text();
          console.log('Create research group error:', errorData);
          console.log('Full error response:', errorData);
        }
      } catch (error) {
        console.log('Create research group failed:', error);
      }

      // Test assigning research group via users endpoint
      console.log('Testing assign research group endpoint...');
      try {
        // First, get available research groups
        const groupsResponse = await fetch(`http://131.212.41.8/api/research/research-groups/`, {
          headers: {
            'Authorization': `Token ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Get research groups status:', groupsResponse.status);
        if (groupsResponse.ok) {
          const groups = await groupsResponse.json();
          console.log('Available research groups:', groups);
          
          if (groups.length > 0) {
            // Try to assign to the first available group
            const firstGroup = groups[0];
            console.log('Attempting to assign to group:', firstGroup);
            
            const assignResponse = await fetch(`http://131.212.41.8/api/users/assign_research_group/`, {
              method: 'POST',
              headers: {
                'Authorization': `Token ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ research_group_id: firstGroup.id })
            });
            console.log('Assign research group status:', assignResponse.status);
            if (assignResponse.ok) {
              const data = await assignResponse.json();
              console.log('Assigned research group:', data);
            } else {
              const errorData = await assignResponse.text();
              console.log('Assign research group error:', errorData);
              console.log('Full assign error response:', errorData);
            }
          } else {
            console.log('No research groups available');
          }
        } else {
          const errorData = await groupsResponse.text();
          console.log('Get research groups error:', errorData);
        }
      } catch (error) {
        console.log('Assign research group failed:', error);
      }
      
      Alert.alert('Debug Complete', 'Check console for research groups endpoint test results');
    } catch (error) {
      console.error('Research groups test failed:', error);
      Alert.alert('Error', 'Research groups test failed. Check console for details.');
    }
  };

  return (
    <View style={[styles.screenContainer, localStyles.container]}>
      <Text style={styles.title}>Welcome to the Game!</Text>
      <Text style={[styles.text, localStyles.subtitle]}>
        Choose how you want to start your journey:
      </Text>
      <TouchableOpacity
        style={[styles.button, localStyles.button, isLoading && localStyles.buttonDisabled]}
        onPress={handleSurveyChoice}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Start Personality Survey'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, localStyles.button, isLoading && localStyles.buttonDisabled]}
        onPress={handleCharacterChoice}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Start Character Creator'}
        </Text>
      </TouchableOpacity>
      
      {/* Debug button for testing API connection */}
      <TouchableOpacity
        style={[styles.button, localStyles.button, { marginTop: 20, backgroundColor: '#666' }]}
        onPress={testApiConnection}
      >
        <Text style={styles.buttonText}>Test API Connection</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, localStyles.button, { marginTop: 20, backgroundColor: '#666' }]}
        onPress={testResearchGroups}
      >
        <Text style={styles.buttonText}>Test Research Groups & Assignment</Text>
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
  buttonDisabled: {
    opacity: 0.7,
  },
}); 