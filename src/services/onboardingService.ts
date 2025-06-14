import { apiService } from './apiService';
import { UserProfile } from '../types/user';

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
  return apiService.completeOnboarding(path);
}