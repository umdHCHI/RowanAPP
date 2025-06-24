import Constants from 'expo-constants';

// Get API URL from environment configuration
export const apiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

if (!apiBaseUrl) {
    console.warn('API_BASE_URL is not configured in environment variables');
}

// All API endpoints in one place
export const API_ENDPOINTS = {
    // Authentication
    login: 'auth/login/',
    logout: 'auth/logout/',
    tokenVerify: 'auth/token/verify/',
    
    // User endpoints
    users: 'users/',
    userProfile: 'users/me/',
    updateProfile: 'users/update_profile/',
    assignResearchGroup: 'users/assign_research_group/',
    
    // Content endpoints
    characters: 'characters/',
    myCharacter: 'characters/my_character/',
    appearances: 'appearances/',
    gear: 'gear/',
    surveys: 'surveys/',
    storyProgress: 'story-progress/',
    researchGroups: 'research-groups/',
    availableResearchGroups: 'research-groups/available/',
    personality: 'personality/',
    journalPrompts: 'game/journal-prompts/',
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured');
    }
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};