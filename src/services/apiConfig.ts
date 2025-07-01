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
        
        // Only fall back to local if no remote URL is configured
        if (envApiBaseUrl) {
            console.log('Web platform: Using local API URL as fallback:', envApiBaseUrl);
            return envApiBaseUrl;
        }
        
        // Last resort fallback
        console.warn('Web platform: No API URL configured, using remote fallback');
        return 'http://131.212.41.8/api/';
    } else {
        // For mobile platforms, prefer the main API URL
        if (envApiBaseUrl) {
            console.log('Mobile platform: Using base API URL:', envApiBaseUrl);
            return envApiBaseUrl;
        }
        
        // Fallback to local URL for mobile
        if (envApiBaseUrl) {
            console.log('Mobile platform: Using local API URL as fallback:', envApiBaseUrl);
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
    tokenVerify: 'auth/token/verify/',
    
    // User endpoints
    users: 'users/',
    userProfile: 'users/me/',
    assignResearchGroup: 'users/assign_research_group/',
    completeOnboarding: 'users/complete_onboarding/',
    
    // Character endpoints - updated to match actual backend structure
    characters: 'characters/characters/', // Base character endpoint
    characterCharacters: 'characters/characters/', // Character model operations
    myCharacter: 'characters/characters/my_character/', 
    characterHomeData: 'characters/characters/home_data/',
    characterStats: 'characters/characters/stats/',
    customizationOptions: 'characters/characters/customization_options/',
    
    // Character actions 
    gainExperience: 'characters/characters/', // {id}/gain_experience/
    gainWellness: 'characters/characters/', // {id}/gain_wellness/
    updateCustomization: 'characters/characters/', // {id}/update_customization/
    
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
    characterTools: 'characters/character-tools/',
    
    // Reflections 
    reflections: 'characters/reflections/',
    myReflections: 'characters/reflections/my-reflections/',
    recentReflections: 'characters/reflections/recent/',
    reflectionsByType: 'characters/reflections/by-type/',
    quickReflect: 'characters/reflections/quick-reflect/',
    
    // Gear
    gearTypes: 'characters/gear-types/',
    availableGear: 'characters/gear-types/available/',
    gearBySlot: 'characters/gear-types/by-slot/',
    characterGear: 'characters/character-gear/',
    myGear: 'characters/character-gear/my-gear/',
    equippedGear: 'characters/character-gear/equipped/',
    equipGear: 'characters/character-gear/', // {id}/equip/
    unequipGear: 'characters/character-gear/', // {id}/unequip/
    
    // Personality Traits
    personalityTraits: 'personality/traits/',
    myTraits: 'personality/traits/my-traits/',
    
    // Research Groups
    researchGroups: 'research/research-groups/',
    availableResearchGroups: 'research/research-groups/',
    
    // Story endpoints 
    storyRoot: 'story/',
    stories: 'story/catalog/',
    storypassages: 'story/story/',
    storyChapters: 'story/story/chapters/',//needs helper too 
    passageDetail: (storyId: number, passageId: string) =>
        `story/stories/${storyId}/passage/${encodeURIComponent(passageId)}/`,
    storyProgress: 'game/progress/',
    storyComplete: 'story/complete/',
    storyGameData: 'story/game-data/',
    
    // Corrected story flow endpoints based on actual backend
    storyCatalog: 'story/stories/available/',
    storyChaptersList: 'story/stories/', // {storyId}/chapters/
    storyStart: 'story/stories/', // {storyId}/start/
    storyPassage: 'story/stories/', // {storyId}/passage/{passageId}/
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
    personality: 'personality/',
    journalPrompts: 'game/journal-prompts/',
    gameData: 'game/game-data/',
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured');
    }
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};