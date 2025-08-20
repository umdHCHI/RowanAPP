import { apiService } from '../services/apiService';

/**
 * Utility functions for personality-based story filtering
 */

/**
 * Check if a story matches the current user's personality type
 * @param story - The story object to check
 * @returns Promise<boolean> - True if the story matches the user's personality
 */
export const isStoryPersonalityMatched = async (story: any): Promise<boolean> => {
  return await apiService.isStoryPersonalityMatched(story);
};

/**
 * Get stories filtered by the current user's personality type
 * Excludes general stories (empty personality_focus) except for the Introduction story
 * @param includeGeneral - Legacy parameter, no longer used - general stories are always excluded except introduction
 * @returns Promise<any[]> - Filtered array of stories
 */
export const getStoriesByUserPersonality = async (includeGeneral: boolean = true): Promise<any[]> => {
  const userPrimaryTrait = await apiService.getUserPrimaryPersonalityTrait();
  // Note: includeGeneral is ignored - we always exclude general stories except introduction
  return await apiService.getStoriesByPersonality(userPrimaryTrait || undefined, includeGeneral);
};

/**
 * Get all stories for admin/testing purposes
 * @returns Promise<any[]> - All stories available for admin/test users
 */
export const getAdminTestStories = async (): Promise<any[]> => {
  try {
    const response = await apiService.getAdminTestStories();
    return response.stories || [];
  } catch (error) {
    console.error('Failed to get admin test stories:', error);
    return [];
  }
};

/**
 * Get the current user's primary personality trait
 * @returns Promise<string | null> - The user's primary personality trait or null if not available
 */
export const getUserPrimaryPersonalityTrait = async (): Promise<string | null> => {
  return await apiService.getUserPrimaryPersonalityTrait();
};

/**
 * Check if a story is a general story (no specific personality focus)
 * @param story - The story object to check
 * @returns boolean - True if the story is general (empty personality_focus array) and NOT the introduction story
 */
export const isGeneralStory = (story: any): boolean => {
  // Introduction story (ID 12) should always be included for everyone
  if (story.id === 12) {
    return false; // Don't filter out introduction story
  }
  
  const personalityFocus = story.personality_focus;
  
  // Check if personality_focus is empty or null
  if (!personalityFocus) {
    return true; // This is a general story that should be filtered out
  }
  
  // Check if personality_focus is an empty array
  if (Array.isArray(personalityFocus) && personalityFocus.length === 0) {
    return true; // This is a general story that should be filtered out
  }
  
  return false; // This story has specific personality focus, don't filter it out
};

/**
 * Check if a story is personality-specific (has a personality focus)
 * @param story - The story object to check
 * @returns boolean - True if the story has a specific personality focus or is the introduction story
 */
export const isPersonalitySpecificStory = (story: any): boolean => {
  // Introduction story (ID 12) should always be included
  if (story.id === 12) {
    return true;
  }
  
  return !isGeneralStory(story);
};

/**
 * Get personality focus display name for a story
 * @param story - The story object
 * @returns string - Display name for the personality focus or "General" if no specific focus
 */
export const getStoryPersonalityDisplayName = (story: any): string => {
  // Introduction story should be labeled as "Universal"
  if (story.id === 12) {
    return "Universal";
  }
  
  if (isGeneralStory(story)) {
    return "General";
  }
  
  const personalityFocus = story.personality_focus;
  
  // Handle array format
  if (Array.isArray(personalityFocus) && personalityFocus.length > 0) {
    return personalityFocus[0]; // Return the first personality focus
  }
  
  // Handle string format
  if (typeof personalityFocus === 'string') {
    return personalityFocus;
  }
  
  // Handle object format
  if (personalityFocus && typeof personalityFocus === 'object') {
    if (personalityFocus.personality_focus) {
      return personalityFocus.personality_focus;
    }
    
    // Return the first personality trait if it's an object with trait names as keys
    const keys = Object.keys(personalityFocus);
    if (keys.length > 0) {
      return keys[0];
    }
  }
  
  return "Unknown";
};

/**
 * Debug function to test story loading for admin users
 */
export const debugAdminStoryLoading = async () => {
  console.log('=== DEBUGGING ADMIN STORY LOADING ===');
  
  try {
    // Test 1: Get user profile
    console.log('\n--- Test 1: User Profile ---');
    const profile = await apiService.getProfile();
    console.log('Profile username:', profile?.username);
    console.log('Profile is_test_user:', profile?.is_test_user);
    console.log('Is admin:', profile?.username === 'admin');
    
    // Test 2: Try admin stories endpoint
    console.log('\n--- Test 2: Admin Stories Endpoint ---');
    try {
      const adminStories = await apiService.getAdminTestStories();
      console.log('Admin stories success:', adminStories);
      console.log('Admin stories count:', adminStories.stories?.length || 0);
    } catch (adminError: any) {
      console.log('Admin stories failed:', adminError.message);
      console.log('Admin error status:', adminError.response?.status);
    }
    
    // Test 3: Try catalog endpoint
    console.log('\n--- Test 3: Catalog Endpoint ---');
    try {
      const catalogStories = await apiService.getAvailableStories();
      console.log('Catalog stories success:', catalogStories);
      console.log('Catalog stories count:', catalogStories?.length || 0);
    } catch (catalogError: any) {
      console.log('Catalog stories failed:', catalogError.message);
      console.log('Catalog error status:', catalogError.response?.status);
    }
    
    // Test 4: Try personality stories endpoint
    console.log('\n--- Test 4: Personality Stories Endpoint ---');
    try {
      const personalityStories = await apiService.getPersonalityStories('conscientiousness');
      console.log('Personality stories success:', personalityStories);
      console.log('Personality stories count:', personalityStories.stories?.length || 0);
    } catch (personalityError: any) {
      console.log('Personality stories failed:', personalityError.message);
      console.log('Personality error status:', personalityError.response?.status);
    }
    
    // Test 5: Try the main filtering method
    console.log('\n--- Test 5: Main Filtering Method ---');
    try {
      const filteredStories = await apiService.getStoriesByPersonality(undefined, true);
      console.log('Filtered stories success:', filteredStories);
      console.log('Filtered stories count:', filteredStories?.length || 0);
    } catch (filterError: any) {
      console.log('Filtered stories failed:', filterError.message);
      console.log('Filter error status:', filterError.response?.status);
    }
    
    console.log('=== END DEBUGGING ===');
  } catch (error: any) {
    console.error('Debug function failed:', error);
  }
};

/**
 * Example usage and testing function
 */
export const testPersonalityStoryFiltering = async () => {
  console.log('=== TESTING PERSONALITY STORY FILTERING ===');
  
  try {
    // Get user's primary personality trait
    const userTrait = await getUserPrimaryPersonalityTrait();
    console.log('User primary personality trait:', userTrait);
    
    // Test admin stories endpoint
    console.log('\n--- Testing Admin Stories Endpoint ---');
    try {
      const adminStories = await getAdminTestStories();
      console.log('Admin stories count:', adminStories.length);
      console.log('Admin story IDs:', adminStories.map((s: any) => s.id));
    } catch (adminError: any) {
      console.log('Admin stories endpoint not accessible (expected for non-admin users):', adminError.message);
    }
    
    // Test personality stories endpoint
    if (userTrait) {
      console.log('\n--- Testing Personality Stories Endpoint ---');
      try {
        const personalityStories = await apiService.getPersonalityStories(userTrait);
        console.log('Personality stories response:', personalityStories);
        console.log('Personality stories count:', personalityStories.stories?.length || 0);
      } catch (personalityError: any) {
        console.log('Personality stories endpoint error:', personalityError.message);
      }
    }
    
    // Get all available stories from catalog
    const allStories = await apiService.getAvailableStories();
    console.log('\n--- Catalog Stories ---');
    console.log('Total stories available:', allStories?.length || 0);
    
    if (allStories && allStories.length > 0) {
      // Test each story
      for (const story of allStories.slice(0, 3)) { // Test first 3 stories
        console.log(`\n--- Testing Story: ${story.title} (ID: ${story.id}) ---`);
        console.log('Story personality_type:', story.personality_type);
        console.log('Is general story:', isGeneralStory(story));
        console.log('Is personality-specific:', isPersonalitySpecificStory(story));
        console.log('Personality display name:', getStoryPersonalityDisplayName(story));
        
        const isMatched = await isStoryPersonalityMatched(story);
        console.log('Matches user personality:', isMatched);
      }
      
      // Test filtered stories
      const filteredStories = await getStoriesByUserPersonality(true);
      console.log('\n--- Filtered Stories ---');
      console.log('Filtered stories count:', filteredStories.length);
      console.log('Filtered story IDs:', filteredStories.map((s: any) => s.id));
    }
    
    console.log('=== END TESTING ===');
  } catch (error) {
    console.error('Error testing personality story filtering:', error);
  }
}; 