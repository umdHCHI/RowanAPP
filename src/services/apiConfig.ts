import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URLs from environment configuration
const envApiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;
//const envApiLocalUrl = Constants.expoConfig?.extra?.API_LOCAL_URL;

// Determine which API URL to use based on platform and environment
const getApiBaseUrl = (): string => {
    console.log('Environment variables:', { envApiBaseUrl });
    console.log('Platform:', Platform.OS, 'DEV mode:', __DEV__);
    
    // For web platform, always prefer the remote API for now
    if (Platform.OS === 'web') {
        // Always use the remote API URL for web to avoid CORS issues with localhost
        if (envApiBaseUrl) {
            console.log('Web platform: Using remote API URL:', envApiBaseUrl);
            return envApiBaseUrl;
        }
        
        // Last resort fallback
        console.warn('Web platform: No API URL configured, using remote fallback');
        return 'http://131.212.41.8/api/'; //this needs to be removed to .env file 
    } else {
        // For mobile platforms, prefer the main API URL
        if (envApiBaseUrl) {
            console.log('Mobile platform: Using base API URL:', envApiBaseUrl);
            return envApiBaseUrl;
        }
        
        console.error('Mobile platform: No API URL configured');
        throw new Error('API_BASE_URL is not configured');
    }
};

export const apiBaseUrl = getApiBaseUrl();

console.log('=== API Configuration ===');
console.log('Platform:', Platform.OS);
console.log('Environment API Base URL:', envApiBaseUrl);
console.log('Environment API Local URL:', envApiBaseUrl);
console.log('Selected API Base URL:', apiBaseUrl);
console.log('Is Development:', __DEV__);
console.log('========================');

if (!apiBaseUrl) {
    console.error('Failed to determine API base URL');
    throw new Error('API_BASE_URL could not be determined');
}

// Updated API endpoints to match the new simplified backend structure
export const API_ENDPOINTS = {
    // Authentication
    login: 'auth/login/',
    logout: 'auth/logout/',
    // Note: tokenVerify endpoint doesn't exist on backend
    
    // User endpoints
    users: 'users/',
    userProfile: 'users/me/',
    //PATCH to update user profile
    updateUserProfile: 'users/update_profile/',


    
    // Character endpoints - updated to match actual backend structure
    characters: 'characters/characters/', // Base character endpoint for POST/GET
    characterCharacters: 'characters/characters/', // Character model operations
    myCharacter: 'characters/characters/my_character/', // Get specific character data
    characterHomeData: 'characters/characters/home_data/', // Character home data endpoint
    characterStats: 'characters/characters/stats/', // Character stats endpoint
    customizationOptions: 'characters/characters/customization_options/', // Character customization options
    
    // Character actions 
    gainExperience: 'users/update_profile/', // {id}/gain_experience/
    gainWellness: 'users/update_profile/', // {id}/gain_wellness/
    updateCustomization: 'users/update_profile/', // {id}/update_customization/
    
    // User survey endpoints - now handled directly via updateUserProfile
    // postUserSurvey: 'users/update_profile/', // Removed - using updateUserProfile directly
    
    // Wellness & Coping Tools 
    copingTools: 'characters/coping-tools/',
    availableCopingTools: 'characters/coping-tools/available/',
    copingToolsByType: 'characters/coping-tools/by-type/',
    
    // Character Tools 
    myTools: 'characters/character-tools/',
    //myTools: 'characters/character-tools/my-tools/',
    equippedTools: 'characters/character-tools/equipped/',
    equipTool: 'characters/character-tools/', // {id}/equip/
    unequipTool: 'characters/character-tools/', // {id}/unequip/
    useTool: 'characters/character-tools/', // {id}/use/
    toolUsageStats: 'characters/character-tools/usage-stats/',
    characterTools: 'characters/character-tools/',    // Journal & Codex (your actual backend structure)
    journalPrompts: 'journal/journal-prompts/',
    codexEntries: 'journal/codex-entries/',
    myCodexEntries: 'journal/codex-entries/my-entries/',
    createCodexEntry: 'journal/codex-entries/',
    
    // Gear
    gearTypes: 'characters/gear-types/',
    characterGear: 'characters/character-gear/',
    myGear: 'characters/character-tools/',
    availableGear: 'characters/gear-types/',
    equippedGear: 'characters/character-gear/equipped/',
    equipGear: 'characters/character-gear/', // {id}/equip/
    unequipGear: 'characters/character-gear/', // {id}/unequip/
    
    // Personality & Survey endpoints
    personalityTraits: 'personality/traits/',
    myTraits: 'personality/traits/my-traits/',
    personalitySurveys: 'personality/surveys/',
    personalitySurveySubmit: 'personality/surveys/submit/',
    personalitySurveyMySurvey: 'personality/surveys/my_survey/',
    personalitySurveyUpdateScores: 'personality/surveys/update_scores/',
    
    // Research Groups
    researchGroups: 'research/research-groups/',
    availableResearchGroups: 'research/research-groups/',
    
    // Story endpoints - updated to match actual backend structure
    storyRoot: 'story/',
    stories: 'story/catalog/', // Get all stories (matches Django story_catalog view)
    
    // Game flow endpoints based on actual backend
    storyStart: 'story/stories/', // + {storyId}/start/
    getCurrentPassage: 'story/stories/',// + {storyId}/current/
    makeChoice: 'story/choices/',  // + {choiceId}/select/
    getUserProgress: 'story/progress/user/',
    restartStory: 'story/stories/', // + {storyId}/restart/
    
    // Legacy endpoints (keeping for compatibility)
    storypassages: 'story/stories/', // Game flow endpoints
    storyChapters: 'story/stories/', // {storyId}/chapters/
    storyProgress: 'story/stories/', // {storyId}/progress/
    storyComplete: 'story/storyComplete/',
    storyGameData: 'story/game-data/',
    storyCatalog: 'story/catalog/',
    storyPassage: 'story/stories/', // {storyId}/passage/{passageId}/
    passageChoices: 'story/passages/', // {passageId}/choices/
    choiceSelect: 'story/choices/', // {choiceId}/select/
    storyProgressGet: 'story/stories/', // {storyId}/progress/
    chapterPassages: 'story/chapters/', // {chapterId}/passages/
    
    // CRUD Operations endpoints
    storiesCRUD: 'stories/',
    chaptersCRUD: 'chapters/',
    passagesCRUD: 'passages/',
    choicesCRUD: 'choices/',
    npcsCRUD: 'npcs/',
    storyProgressCRUD: 'story-progress/',
    
      // Other endpoints
    surveys: 'surveys/',
    surveySubmit: 'surveys/submit/',
    personality: 'personality/',
    gameData: 'game/game-data/',
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured');
    }
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};