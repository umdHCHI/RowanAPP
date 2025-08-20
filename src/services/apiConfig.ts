import Constants from 'expo-constants';

// Get API URLs from environment configuration
const envApiBaseUrl = Constants.expoConfig?.extra?.API_BASE_URL;

// Determine which API URL to use
const getApiBaseUrl = (): string => {
    const baseUrl = envApiBaseUrl;  // Prod environment variable  
    if (baseUrl.includes(':8000')) { // If the URL already has port 8000, return it as is(local development)
        return baseUrl;
    }    
    const url = new URL(baseUrl);
    url.port = '8000';
    return url.href;    
};

export const apiBaseUrl = getApiBaseUrl();

// Updated API endpoints to match the new simplified backend structure
export const API_ENDPOINTS = {
    // Authentication
    login: 'auth/login/', //okay
    logout: 'auth/logout/', //has bugs 

    
    // User endpoints
    users: 'users/',
    currentUser: 'users/me/',
    userProfile: 'users/', //{id}/full_profile/
    //PATCH to update user profile
    updateUserProfile: 'users/update-profile/',

    researchGroupPost: 'users/research-groups/', // POST to join a research group
    
    // ----------------- Character endpoints -----------------
    characters: 'characters/', // Base character endpoint for POST/GET
    characterHomeData: 'characters/', // Character home data endpoint - updated to use direct endpoint
    characterStats: 'characters/', // Character stats endpoint
    gainExperience: 'characters/', // {id}/gain_experience/ USE ME
    gainWellness: 'characters/', // {id}/gain_wellness/ USE ME
    updateCustomization: 'characters/', // {id}/update_customization/ USE ME

    // Wellness & Coping Tools --- for personality type 
    copingTools: 'coping-tools/',
    availableCopingTools: 'coping-tools/available/',
    awardCopingTool: 'coping-tools/award-tool/',
    myTools: 'coping-tools/my-tools/',
    equippedTools: 'coping-tools/equipped/',
    characterTools: 'coping-tools/character-tools/',
    equipTool: 'coping-tools/',
    unequipTool: 'coping-tools/',
    useTool: 'coping-tools/',


    // Journal & Codex - All users use journal endpoints for compliance
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
    
    // Legacy reflections endpoints (deprecated - maintained for backward compatibility only)
    myReflections: 'reflections/my_reflections/', 
    recentReflections: 'reflections/recent/',
    createReflection: 'reflections/',
    
    // User-scoped journal endpoints (Note: These may not be implemented yet)
    userJournalPrompts: 'users/', // {userId}/journal/prompts/by-category/
    // userCodexEntries: 'users/', // {userId}/codex/entries/ - NOT IMPLEMENTED IN BACKEND
    
    // Gear
    gearTypes: 'gear-types/',
    characterGear: 'character-gear/',
    myGear: 'character-gear/my_gear/',
    availableGear: 'gear-types/',
    equippedGear: 'character-gear/equipped/',
    equipGear: 'character-gear/', // {id}/equip/
    unequipGear: 'character-gear/', // {id}/unequip/
    acquireGear: 'character-gear/',

    // Personality & Survey endpoints
    personalityTraits: 'personality/traits/',
    myTraits: 'personality/traits/my-traits/',
    personalitySurveys: 'personality/surveys/',
    personalitySurveySubmit: 'personality/surveys/submit/',
    personalitySurveyMySurvey: 'personality/surveys/my_survey/',
    personalitySurveyUpdateScores: 'personality/surveys/update_scores/',
    personalityStatus: 'story/personality/status/',
    personalityStories: 'story/personality/',
    adminTestStories: 'story/admin/test/',
    
    // Research Groups
    researchGroups: 'research/research-groups/',
    availableResearchGroups: 'research/research-groups/',
    
    // Story endpoints - updated to match actual backend structure
    storyRoot: 'story/',
    stories: 'story/catalog/', // Get all stories (matches Django story_catalog view)
    
    // Game flow endpoints based on actual backend
    storyReset: 'story/stories/', // + {storyId}/reset/
    storyStart: 'story/stories/', // + {storyId}/start/
    getCurrentPassage: 'story/stories/',// + {storyId}/current/
    makeChoice: 'story/make_choice/',  //User for choice progression
    createProgress: 'story/story-progress/', //new progress record
    updateProgress: 'story/story-progress/', //{id}/update/ update progress record
    getUserProgress: 'story/progress/user/',
    restartStory: 'story/stories/', // + {storyId}/restart/
    
    // Legacy endpoints (keeping for compatibility)
    storypassages: 'story/', // {storyId}/passages/ - Get all passages for a story
    storyChapters: 'story/stories/', // {storyId}/chapters/
    storyProgress: 'story/stories/', // {storyId}/progress/
    storyComplete: 'story/storyComplete/',
    storyGameData: 'story/game-data/',
    storyCatalog: 'story/catalog/',
    storyPassage: 'story/stories/', // {storyId}/passage/{passageId}/
    passageChoices: 'story/passages/', // {passageId}/choices/
    choiceSelect: 'story/choices/', // {choiceId}/select/
  
    chapterPassages: 'story/stories/', // {storyId}/chapters/{chapterId}/passages/
    
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
    // PRIMARY: matches nova.urls
    gameDataLogThoughtDefenderRun: 'game/game-data/thought-defender/run/',
    
    // GENERIC progress (DRF ViewSet)
    gameProgressRecord: 'game/progress/record_progress/',
    
    // Quest progress is handled through the existing make_choice endpoint
    // No separate quest progress endpoints needed
    
    // LEGACY fallbacks (keep for compatibility)
    recordActivity: 'game/record-activity/',
    recordProgressLegacy: 'game/record-progress/',
} as const;

// Helper to get full URL
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS): string => {
    if (!apiBaseUrl) {
        throw new Error('API_BASE_URL is not configured');
    }
    return `${apiBaseUrl}${API_ENDPOINTS[endpoint]}`;
};