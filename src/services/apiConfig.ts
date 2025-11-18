import Constants from 'expo-constants';

// Get API URLs from environment configuration with multiple fallback strategies
const getApiBaseUrl = (): string => {
    // Try multiple ways to access the API base URL
    const envApiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

    // Ensure the URL ends with a slash for consistent endpoint construction
    let baseUrl = envApiBaseUrl;
    if (!baseUrl.endsWith('/')) {
        baseUrl += '/';
    }

    // Handle development vs production URL patterns
    if (baseUrl.includes(':8000')) {
        // Already has development port, return as is
        return baseUrl;
    }
    
    // For production URLs, check if we need to add port
    try {
        const url = new URL(baseUrl);
        // Only add port 8000 if we're in development mode
        if (__DEV__ && !url.port) {
            url.port = '8000';
            return url.href;
        }
        return baseUrl;
    } catch (error) {
        console.warn('[apiConfig] Invalid URL format, using fallback:', error);
        return "http://131.212.41.8/api/";
    }
};

export const apiBaseUrl = getApiBaseUrl();

// Validate that we have a valid API URL
if (!apiBaseUrl) {
    console.error('[apiConfig] API_BASE_URL is undefined! Check your app.config.js configuration.');
    throw new Error('API_BASE_URL is not configured properly. Check your app.config.js file.');
}



// Define API endpoints
export const API_ENDPOINTS = {
    // Authentication
    login: 'auth/login/',
    logout: 'auth/logout/',

    // User endpoints
    users: 'users/',
    currentUser: 'users/me/',
    userProfile: 'users/',
    updateUserProfile: 'users/update_profile/',
    completeOnboarding: 'users/complete_onboarding/',

    //researchGroupPost: 'users/research-groups/',
    
    // Character endpoints
    characters: 'characters/',
    characterHomeData: 'characters/',
    characterStats: 'characters/',
    gainExperience: 'characters/',
    gainWellness: 'characters/',
    updateCustomization: 'characters/',

    // Quest endpoints
    quests: 'personality/quests/',
    questProgress: 'personality/quests/',
    myQuests: 'personality/quests/my_quests/',
    userQuestProgress: 'personality/quests/',

    // Wellness & Coping Tools
    copingTools: 'coping-tools/',
    availableCopingTools: 'coping-tools/available/',
    awardCopingTool: 'coping-tools/award-tool/',
    myTools: 'coping-tools/my-tools/',
    equippedTools: 'coping-tools/equipped/',
    characterTools: 'coping-tools/character-tools/',
    equipTool: 'coping-tools/',
    unequipTool: 'coping-tools/',
    useTool: 'coping-tools/',

    // Journal & Codex
    journalPrompts: 'journal/journal-prompts/',
    journalPromptsAvailable: 'journal/journal-prompts/available/',
    journalPromptsDaily: 'journal/journal-prompts/daily/',
    journalPromptsCompleted: 'journal/journal-prompts/completed/',
    journalPromptsByStoryTag: 'journal/journal-prompts/by_story_tag/',
    codexEntries: 'journal/codex-entries/',
    codexEntriesStats: 'journal/codex-entries/stats/',
    codexEntriesRecent: 'journal/codex-entries/recent/',
    createCodexEntry: 'journal/codex-entries/',
    uploadAudio: 'journal/upload-audio/',
    uploadDrawing: 'journal/upload-drawing/',
    
    // Legacy reflections endpoints
    myReflections: 'reflections/my_reflections/',
    recentReflections: 'reflections/recent/',
    createReflection: 'reflections/',
    
    // User-scoped journal endpoints
    userJournalPrompts: 'users/',
    
    // Gear
    gearTypes: 'gear-types/',
    characterGear: 'character-gear/',
    myGear: 'character-gear/my_gear/',
    availableGear: 'gear-types/',
    equippedGear: 'character-gear/equipped/',
    equipGear: 'character-gear/',
    unequipGear: 'character-gear/',
    acquireGear: 'character-gear/',

    // Personality & Survey endpoints
    personalityTraits: 'personality/traits/',
    myTraits: 'personality/traits/my-traits/',
    personalitySurveys: 'personality/surveys/',
    personalitySurveySubmit: 'personality/surveys/submit/',
    personalitySurveyMySurvey: 'personality/surveys/my_survey/',
    personalitySurveyUpdateScores: 'personality/surveys/update_scores/',
    personalityProfiles: 'personality/profiles/',
    personalityProfileMyProfile: 'personality/profiles/my_profile/',
    personalityProfileCompleteData: 'personality/profiles/complete_data/',
    personalityStatus: 'story/personality/status/',
    personalityStories: 'story/personality/',
    adminTestStories: 'story/admin/test/',
    
    // Research Groups
    researchGroups: 'research/research-groups/',
    availableResearchGroups: 'research/research-groups/',
    
    // Story endpoints
    storyRoot: 'story/',
    stories: 'story/catalog/',
    
    // Game flow endpoints
    storyReset: 'story/stories/',
    storyStart: 'story/stories/',
    getCurrentPassage: 'story/stories/',
    makeChoice: 'story/make_choice/',
    createProgress: 'story/story-progress/',
    updateProgress: 'story/story-progress/',
    getUserProgress: 'story/progress/user/',
    restartStory: 'story/stories/',
    
    // Legacy endpoints
    storypassages: 'story/',
    storyChapters: 'story/stories/',
    storyProgress: 'story/stories/',
    storyComplete: 'story/storyComplete/',
    storyGameData: 'story/game-data/',
    storyCatalog: 'story/catalog/',
    storyPassage: 'story/stories/',
    passageChoices: 'story/passages/',
    choiceSelect: 'story/choices/',
    chapterPassages: 'story/stories/',
    
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
    gameData: 'game/my-data/',
    
    // Game endpoints
    gameDataList: 'game/game-data/',
    gameDataLogThoughtDefenderRun: 'game/game-data/thought-defender/run/',
    gameProgressRecord: 'game/progress/record_progress/',
    
    // Legacy fallbacks
    recordActivity: 'game/record-activity/',
    recordProgressLegacy: 'game/record-progress/',
} as const;

// Helper to get full URL with validation
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured - check your app.config.js file');
    }
    
    const fullUrl = `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
    console.log(`[apiConfig] Generated URL for ${endpoint}:`, fullUrl);
    return fullUrl;
};