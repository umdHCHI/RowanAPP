import { UserProfile } from '../types/user';
import { apiService } from './apiService';

// Get the current user's profile
export async function getProfile(): Promise<UserProfile> {
  return apiService.getProfile();
}

// Create a new user profile (if your backend supports this)
export async function createProfile(profileData: any): Promise<UserProfile> {
  // If your backend requires POST to 'users/' to create a profile:
  return apiService.post<UserProfile>('users', profileData);
}

// Update the current user's profile
export async function updateProfile(profileData: any): Promise<UserProfile> {
  return apiService.updateProfile(profileData);
}

// Complete onboarding (updates profile with onboarding info)
export async function completeOnboarding(path: 'character' | 'survey') {
  try {
    console.log('Completing onboarding for path:', path);
    
    // First, try to get the current user profile to see if it exists
    let userProfile;
    try {
      userProfile = await apiService.getProfile();
      console.log('Current user profile:', userProfile);
    } catch (error) {
      console.log('No existing profile found, will create one');
      userProfile = null;
    }

    // Assign research group based on path (optional - backend may not be configured)
    try {
      const researchCondition = path === 'character' ? 'A' : 'B';
      console.log('Assigning research group condition:', researchCondition);
      await apiService.assignResearchGroupByCondition(researchCondition);
      console.log('Research group assigned successfully');
    } catch (researchError) {
      console.error('Failed to assign research group:', researchError);
      console.log('Research group assignment failed - this is expected if the backend endpoint is not properly configured');
      // Continue with onboarding even if research group assignment fails
      // The frontend will handle the research group logic locally
    }

    // Prepare onboarding data
    const onboardingData = {
      has_completed_onboarding: true,
      completion_type: path
    };

    console.log('Sending onboarding data:', onboardingData);

    // Complete onboarding
    const result = await apiService.completeOnboarding(path);
    console.log('Onboarding completion result:', result);
    
    return result;
  } catch (error) {
    console.error('Error in completeOnboarding:', error);
    throw error;
  }
}

// Create a user profile if it doesn't exist
export async function ensureUserProfile() {
  try {
    // Try to get existing profile
    const profile = await apiService.getProfile();
    console.log('User profile exists:', profile);
    return profile;
  } catch (error) {
    console.log('No profile found, creating one...');
    
    // Create a basic profile
    const profileData = {
      has_completed_onboarding: false,
      completion_type: null
    };
    
    try {
      const newProfile = await apiService.post<UserProfile>('users', profileData);
      console.log('Created new profile:', newProfile);
      return newProfile;
    } catch (createError) {
      console.error('Failed to create profile:', createError);
      throw createError;
    }
  }
}