import Constants from 'expo-constants';

// Get API URL from environment configuration
export const apiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

console.log('API Base URL configured:', apiBaseUrl);

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
    updateProfile: 'profile/update/',
    assignResearchGroup: 'profile/research_group/',
    completeOnboarding: 'profile/onboarding/',
    
    // Character endpoints (matching backend structure)
    characters: 'characters/characters/', // Base for character operations
    myCharacter: 'characters/characters/my_character/',
    characterCustomization: 'characters/characters/', // Base for character customization
    characterHomeData: 'characters/characters/home_data/',
    characterStats: 'characters/characters/', // Base for stats updates
    characterExperience: 'characters/characters/', // Base for experience gain
    characterGear: 'characters/characters/', // Base for gear operations
    customizationOptions: 'characters/characters/customization_options/',
    
    // Appearance endpoints
    appearances: 'characters/appearances/',
    myAppearance: 'characters/appearances/my_appearance/',
    appearanceUpload: 'characters/appearances/upload_asset/',
    assetImages: 'characters/appearances/asset_images/',
    
    // Gear endpoints
    gear: 'characters/gear/',
    availableGear: 'characters/gear/available/',
    myGear: 'characters/gear/my_gear/',
    
    // Other endpoints
    surveys: 'surveys/',
    storyProgress: 'story-progress/',
    researchGroups: 'research/research-groups/',
    availableResearchGroups: 'research/research-groups/',
    personality: 'personality/',
    journalPrompts: 'game/journal-prompts/',
    
    // Game data endpoints
    gameData: 'game/game-data/',
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured');
    }
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};