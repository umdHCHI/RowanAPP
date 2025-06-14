import Constants from 'expo-constants';

export const apiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;


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
    appearances: 'appearances/',
    gear: 'gear/',
    surveys: 'surveys/',
    storyProgress: 'story-progress/',
    researchGroups: 'research-groups/',
    availableResearchGroups: 'research-groups/available/',
    personality: 'personality/'
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};