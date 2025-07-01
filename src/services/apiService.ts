import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { EquipmentItem, EquippedItems } from '../types/equipment';
import { Prompt } from '../types/journal';
import { CharacterCreateData, GameData, LoginResponse, ResearchGroup, UserProfile } from '../types/user';
import { API_ENDPOINTS, apiBaseUrl } from './apiConfig';

const testToken = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;

// Debug logging for test token
console.log('Test token configured:', testToken ? 'Yes' : 'No');
if (!testToken) {
    console.warn('TEST_USER_TOKEN not configured in environment variables');
}

const FALLBACK_TEST_TOKEN = '8a71299900898a32febbca89ef5638a406475348';

// ===== NEW TYPES FOR WELLNESS BACKEND =====
export interface WellnessCharacter {
    id: number;
    user: string;
    name: string;
    level: number;
    experience: number;
    // Wellness attributes
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
    // Resources
    coins: number;
    crystals: number;
    // Progress
    memories_explored: number;
    coping_skills_learned: number;
    insights_discovered: number;
    // Customization indices (frontend maps these to assets)
    selected_base_model: number;
    selected_skin_color: number;
    selected_hair_style: number;
    selected_hair_color: number;
    selected_eye_type: number;
    selected_eye_color: number;
    selected_eyebrow_style: number;
    selected_eyebrow_color: number;
    selected_mouth_type: number;
    selected_shirt_type: number;
    selected_background_type: number;
    // Calculated fields
    experience_needed_for_next_level: number;
    experience_progress_percentage: number;
    wellness_average: number;
    memory_progress: string;
    wellness_stats: WellnessStats[];
    character_config: CharacterConfig;
    coping_tools: CharacterTool[];
    equipped_gear: CharacterGear[];
    created_at: string;
    updated_at: string;
}

export interface CharacterConfig {
    selected_base_model: number;
    selected_skin_color: number;
    selected_hair_style: number;
    selected_hair_color: number;
    selected_eye_type: number;
    selected_eye_color: number;
    selected_eyebrow_style: number;
    selected_eyebrow_color: number;
    selected_mouth_type: number;
    selected_shirt_type: number;
    selected_background_type: number;
}

export interface WellnessStats {
    icon: string;
    label: string;
    value: number;
    color: string;
}

export interface CopingTool {
    id: number;
    name: string;
    tool_type: 'focus' | 'comfort' | 'shield' | 'ground';
    subtype: string;
    description: string;
    emoji_icon: string;
    awareness_bonus: number;
    resilience_bonus: number;
    connection_bonus: number;
    balance_bonus: number;
    level_required: number;
    memories_required: number;
    insights_required: number;
    wellness_bonuses: Record<string, number>;
    is_unlocked_for_character: boolean;
    created_at: string;
}

export interface CharacterTool {
    id: number;
    tool: CopingTool;
    is_equipped: boolean;
    times_used: number;
    effectiveness_rating?: number;
    acquired_at: string;
}

export interface ReflectionEntry {
    id: number;
    character: string;
    entry_type: 'memory' | 'insight' | 'skill' | 'challenge' | 'growth';
    title: string;
    passages: string;
    prompt: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
    wellness_gains: Record<string, number>;
    tools_unlocked: CopingTool[];
    created_at: string;
}

export interface CharacterGear {
    id: number;
    gear_type: {
        id: number;
        name: string;
        slot: 'weapon' | 'armor' | 'helmet' | 'boots';
        description: string;
        emoji_icon: string;
        stat_bonuses: Record<string, number>;
    };
    is_equipped: boolean;
    acquired_at: string;
}

export interface HomeData {
    character: WellnessCharacter;
    archive_metrics: {
        icon: string;
        label: string;
        value: string;
        progress: number;
    }[];
    recent_reflections: ReflectionEntry[];
    available_tools: CopingTool[];
}

// ===== Axios Setup =====
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'passages-Type': 'application/json',
        'Accept': 'application/json'
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            console.log('Request interceptor - Token present:', token ? 'Yes' : 'No');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
                console.log('Request interceptor - Added Authorization header');
            } else {
                console.log('Request interceptor - No token found');
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error('Authentication error:', error.response.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request headers:', error.config?.headers);
            await AsyncStorage.removeItem('authToken');
        }
        return Promise.reject(error);
    }
);

// ===== Main API Service Class =====
class ApiService {
    // Generic request methods
    public async get<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        try {
            const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.get<T>(url, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'GET', API_ENDPOINTS[endpoint]);
            throw error;
        }
    }

    public async post<T>(endpoint: keyof typeof API_ENDPOINTS, data?: any, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
        console.log(`POST ${url}`, { data, config });
        
        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.post<T>(url, data, axiosConfig);
            console.log(`POST ${url} success:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`POST ${url} failed:`, error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            this.handleError(error, 'POST', url);
            throw error;
        }
    }

    public async patch<T>(endpoint: keyof typeof API_ENDPOINTS, data: any, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        try {
            const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.patch<T>(url, data, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'PATCH', API_ENDPOINTS[endpoint]);
            throw error;
        }
    }

    public async delete<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        try {
            const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.delete<T>(url, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'DELETE', API_ENDPOINTS[endpoint]);
            throw error;
        }
    }

    private handleError(error: any, method: string, endpoint: string | ((storyId: number, passageId: string) => string)) {
        const endpointStr = typeof endpoint === 'function' ? 'function' : endpoint;
        
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`Error in ${method} ${endpointStr}:`, {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
                headers: axiosError.config?.headers,
                url: axiosError.config?.url,
            });
            
            if (axiosError.response?.data) {
                console.error('Full error response:', axiosError.response.data);
            }
        } else {
            console.error(`Error in ${method} ${endpointStr}:`, error);
        }
    }

    // ===== Authentication Methods =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.post<LoginResponse>('login', { username, password });
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('characterId', String(response.user.id));
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Login failed. Please check your credentials.');
        }
    }

    async logout(): Promise<void> {
        try {
            await this.post('logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('characterId');
        }
    }

    async validateToken(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return false;

            if (token === testToken || token === FALLBACK_TEST_TOKEN) {
                return true;
            }

            await this.post('tokenVerify', { token });
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            await AsyncStorage.removeItem('authToken');
            return false;
        }
    }

    // ===== User Methods =====
    async getProfile(): Promise<UserProfile> {
        return this.get<UserProfile>('userProfile');
    }

    async updateProfile(profileData: any): Promise<UserProfile> {
        return this.patch<UserProfile>('users', profileData);
    }

    async assignResearchGroup(groupId: number): Promise<void> {
        await this.post('assignResearchGroup', { research_group_id: groupId });
    }

    async assignResearchGroupByCondition(condition: 'A' | 'B'): Promise<void> {
        const availableGroups = await this.getAvailableGroups();
        const targetGroup = availableGroups.find(group => group.condition === condition);
        
        if (!targetGroup) {
            console.log(`No research group found with condition ${condition}, attempting to create one...`);
            try {
                const newGroup = await this.createResearchGroup(condition);
                await this.post('assignResearchGroup', { research_group_id: newGroup.id });
            } catch (createError) {
                console.error('Failed to create research group:', createError);
                throw new Error(`No research group available for condition ${condition} and could not create one`);
            }
        } else {
            await this.post('assignResearchGroup', { research_group_id: targetGroup.id });
        }
    }

    async getAvailableGroups(): Promise<ResearchGroup[]> {
        return this.get<ResearchGroup[]>('availableResearchGroups');
    }

    async getAllGroups(): Promise<ResearchGroup[]> {
        return this.get<ResearchGroup[]>('researchGroups');
    }

    async createResearchGroup(condition: 'A' | 'B'): Promise<ResearchGroup> {
        return this.post<ResearchGroup>('researchGroups', { 
            condition,
            description: condition === 'A' ? 'Character System Group' : 'Big 5 Personality Survey Group'
        });
    }

    async completeOnboarding(path: 'character' | 'survey'): Promise<UserProfile> {
        try {
            console.log('=== API SERVICE: COMPLETING ONBOARDING ===');
            console.log('Path:', path);
            
            // First, try to get the current user profile
            let currentProfile;
            try {
                currentProfile = await this.getProfile();
                console.log('Current profile found:', currentProfile);
            } catch (error) {
                console.log('No existing profile found');
                currentProfile = null;
            }

            // Prepare the onboarding data
            const onboardingData: any = {
                has_completed_onboarding: true,
                completion_type: path
            };

            console.log('Sending onboarding data:', onboardingData);

            // Try to complete onboarding using the endpoint
            const updatedProfile = await this.post<UserProfile>('completeOnboarding', onboardingData);
            console.log('Onboarding completed successfully:', updatedProfile);
            return updatedProfile;
        } catch (error: any) {
            console.error('Error completing onboarding:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    // ===== Character Methods =====
    async createCharacter(characterData: CharacterCreateData): Promise<WellnessCharacter> {
        // POST to /api/characters/characters/ - Create new character
        try {
            console.log('=== API SERVICE: CHARACTER CREATION ===');
            console.log('API Base URL:', apiBaseUrl);
            console.log('Endpoint:', API_ENDPOINTS.characters);
            console.log('Full URL will be:', `${apiBaseUrl}${API_ENDPOINTS.characters}`);
            console.log('Original character data:', characterData);
            
            // Check if this is a simple name-only request or complete character data
            const isSimpleRequest = Object.keys(characterData).length === 1 && 'name' in characterData;
            
            if (isSimpleRequest) {
                // Simple request - only send the name field
                const cleanData = { name: characterData.name };
                console.log('Simple request - cleaned data (name only):', cleanData);
                console.log('Simple data JSON:', JSON.stringify(cleanData, null, 2));
                console.log('Simple data keys:', Object.keys(cleanData));
                
                // Verify no user field is present
                if ('user' in cleanData) {
                    console.error('ERROR: user field found in clean data!');
                    throw new Error('User field should not be present in character creation data');
                }
                
                const result = await this.post<WellnessCharacter>('characters', cleanData);
                console.log('Character created successfully (simple):', result);
                return result;
            } else {
                // Complete request - send all character data including customization
                console.log('Complete request - sending full character data:', characterData);
                console.log('Complete data JSON:', JSON.stringify(characterData, null, 2));
                console.log('Complete data keys:', Object.keys(characterData));
                
                // Verify no user field is present
                if ('user' in characterData) {
                    console.error('ERROR: user field found in character data!');
                    throw new Error('User field should not be present in character creation data');
                }
                
                const result = await this.post<WellnessCharacter>('characters', characterData);
                console.log('Character created successfully (complete):', result);
                return result;
            }
        } catch (error: any) {
            console.error('Character creation failed:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    async getMyCharacter(): Promise<WellnessCharacter> {
        return this.get<WellnessCharacter>('myCharacter');
    }

    async getCharacterHomeData(): Promise<HomeData> {
        return this.get<HomeData>('characterHomeData');
    }

    async getCharacterStats(): Promise<{
        base_stats: Record<string, number>;
        total_stats: Record<string, number>;
        level: number;
        experience: number;
        experience_needed: number;
        experience_progress: number;
        wellness_average: number;
        equipped_tools_count: number;
        character_config: CharacterConfig;
    }> {
        return this.get('characterStats');
    }

    async updateCharacterCustomization(characterId: number, customizationData: Partial<CharacterConfig>): Promise<{
        message: string;
        character: WellnessCharacter;
        character_config: CharacterConfig;
    }> {
        return this.patch('characters', customizationData, { urlSuffix: `${characterId}/` });
    }

    async gainExperience(characterId: number, experience: number, source?: string): Promise<WellnessCharacter & {
        experience_gained: number;
        source: string;
        level_up?: boolean;
        levels_gained?: number;
        message?: string;
    }> {
        return this.post('gainExperience', { experience, source }, { urlSuffix: `${characterId}/gain-experience/` });
    }

    async gainWellness(characterId: number, wellnessGains: Partial<{
        awareness: number;
        resilience: number;
        connection: number;
        balance: number;
    }>): Promise<WellnessCharacter & {
        wellness_gained: Record<string, number>;
        new_values: Record<string, number>;
        message: string;
    }> {
        return this.post('gainWellness', wellnessGains, { urlSuffix: `${characterId}/gain-wellness/` });
    }

    async getCustomizationOptions(): Promise<CharacterConfig & { option_limits: Record<string, number> }> {
        return this.get('customizationOptions');
    }

    // ===== NEW COPING TOOLS METHODS =====
    async getAvailableCopingTools(): Promise<CopingTool[]> {
        return this.get<CopingTool[]>('availableCopingTools');
    }

    async getAllCopingTools(): Promise<CopingTool[]> {
        return this.get<CopingTool[]>('copingTools');
    }

    async getCopingToolsByType(type?: string, subtype?: string): Promise<CopingTool[]> {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (subtype) params.append('subtype', subtype);
        
        const queryString = params.toString();
        return this.get<CopingTool[]>('copingToolsByType', { 
            urlSuffix: queryString ? `?${queryString}` : '' 
        });
    }

    async getMyTools(): Promise<CharacterTool[]> {
        return this.get<CharacterTool[]>('myTools');
    }

    async getEquippedTools(): Promise<CharacterTool[]> {
        return this.get<CharacterTool[]>('equippedTools');
    }

    async acquireCopingTool(toolId: number): Promise<CharacterTool> {
        return this.post<CharacterTool>('characterTools', { tool_id: toolId });
    }

    async equipTool(toolId: number): Promise<{ message: string; tool: CharacterTool }> {
        return this.post('equipTool', {}, { urlSuffix: `${toolId}/equip/` });
    }

    async unequipTool(toolId: number): Promise<{ message: string; tool: CharacterTool }> {
        return this.post('unequipTool', {}, { urlSuffix: `${toolId}/unequip/` });
    }

    async useTool(toolId: number, effectivenessRating?: number, notes?: string): Promise<{
        message: string;
        times_used: number;
        effectiveness_rating?: number;
        tool: CharacterTool;
    }> {
        return this.post('useTool', {
            effectiveness_rating: effectivenessRating,
            notes
        }, { urlSuffix: `${toolId}/use/` });
    }

    async getToolUsageStats(): Promise<{
        total_tools: number;
        equipped_tools: number;
        total_usage: number;
        tools_with_ratings: number;
        average_effectiveness: number;
        most_used_tool?: {
            name: string;
            times_used: number;
            effectiveness?: number;
        };
    }> {
        return this.get('toolUsageStats');
    }

    // ===== NEW REFLECTION METHODS =====
    async getMyReflections(): Promise<ReflectionEntry[]> {
        return this.get<ReflectionEntry[]>('myReflections');
    }

    async getRecentReflections(): Promise<ReflectionEntry[]> {
        return this.get<ReflectionEntry[]>('recentReflections');
    }

    async createReflection(reflectionData: {
        entry_type: 'memory' | 'insight' | 'skill' | 'challenge' | 'growth';
        title: string;
        passages: string;
        prompt: string;
        skill_category?: string;
        map_area?: string;
        difficulty?: string;
        wellness_gains?: Record<string, number>;
        tools_unlocked_ids?: number[];
    }): Promise<ReflectionEntry> {
        return this.post<ReflectionEntry>('reflections', reflectionData);
    }

    async quickReflect(reflectionData: {
        title: string;
        passages: string;
        prompt: string;
    }): Promise<{ message: string; reflection: ReflectionEntry }> {
        return this.post('quickReflect', reflectionData);
    }

    async getReflectionsByType(type: string): Promise<ReflectionEntry[]> {
        return this.get<ReflectionEntry[]>('reflectionsByType', { urlSuffix: `?type=${type}` });
    }

    // ===== NEW GEAR METHODS =====
    async getAvailableGear(): Promise<any[]> {
        return this.get<any[]>('availableGear');
    }

    async getMyGear(): Promise<CharacterGear[]> {
        return this.get<CharacterGear[]>('myGear');
    }

    async getEquippedGear(): Promise<CharacterGear[]> {
        return this.get<CharacterGear[]>('equippedGear');
    }

    async acquireGear(gearTypeId: number): Promise<CharacterGear> {
        return this.post<CharacterGear>('characterGear', { gear_type_id: gearTypeId });
    }

    async equipGear(gearId: number): Promise<{ message: string; gear: CharacterGear }> {
        return this.post('equipGear', {}, { urlSuffix: `${gearId}/equip/` });
    }

    async unequipGear(gearId: number): Promise<{ message: string; gear: CharacterGear }> {
        return this.post('unequipGear', {}, { urlSuffix: `${gearId}/unequip/` });
    }

    // ===== EXISTING METHODS (KEEP FOR COMPATIBILITY) =====
    async getInventory(characterId: string): Promise<EquipmentItem[]> {
        return this.get<EquipmentItem[]>('characters', { urlSuffix: `${characterId}/inventory` });
    }

    async getEquippedItems(characterId: string): Promise<EquippedItems> {
        return this.get<EquippedItems>('characters', { urlSuffix: `${characterId}/equipment` });
    }

    async equipItem(characterId: string, itemId: string): Promise<void> {
        await this.post('characters', null, { urlSuffix: `${characterId}/equipment/${itemId}` });
    }

    async unequipItem(characterId: string, itemId: string): Promise<void> {
        await this.delete('characters', { urlSuffix: `${characterId}/equipment/${itemId}` });
    }

    async getGameData(): Promise<GameData> {
        return this.get<GameData>('gameData');
    }

    async createGameData(gameData: Partial<GameData>): Promise<GameData> {
        return this.post<GameData>('gameData', gameData);
    }

    async updateGameData(gameData: Partial<GameData>): Promise<GameData> {
        return this.patch<GameData>('gameData', gameData);
    }

    async getJournalPrompts(): Promise<Prompt[]> {
        return this.get<Prompt[]>('journalPrompts');
    }

    // ===== STORY METHODS (UPDATED FOR NEW BACKEND STRUCTURE) =====
    
    // Get story catalog
    async getNewStoryCatalog(): Promise<any[]> {
        return this.get<any[]>('storyCatalog');
    }

    // Get chapters for a specific story
    async getNewStoryChapters(storyId: number): Promise<any[]> {
        return this.get<any[]>('storyChaptersList', { urlSuffix: `${storyId}/chapters/` });
    }

    // Get passages for a specific chapter
    async getNewChapterPassages(chapterId: number): Promise<any[]> {
        return this.get<any[]>('chapterPassages', { urlSuffix: `${chapterId}/passages/` });
    }

    // Get specific passage passages
    async getNewPassagepassages(storyId: number, passageId: string): Promise<any> {
        return this.get<any>('storyPassage', { urlSuffix: `${storyId}/passage/${encodeURIComponent(passageId)}/` });
    }

    // Get story progress
    async getNewStoryProgress(storyId: number): Promise<any> {
        return this.get<any>('storyProgressGet', { urlSuffix: `${storyId}/progress/` });
    }

    // Start a story
    async startNewStory(storyId: number): Promise<any> {
        return this.post<any>('storyStart', {}, { urlSuffix: `${storyId}/start/` });
    }

    // Make a choice in the story
    async makeNewStoryChoice(choiceId: string, choiceData?: any): Promise<any> {
        return this.post<any>('choiceSelect', choiceData || {}, { urlSuffix: `${choiceId}/select/` });
    }

    // Complete a story
    async completeNewStory(storyId: number, completionData: any): Promise<any> {
        return this.post<any>('storyComplete', completionData, { urlSuffix: `${storyId}/complete/` });
    }

    // ===== LEGACY STORY METHODS (KEEP FOR COMPATIBILITY) =====
    async getStoryRoot(): Promise<{
        stories: string;
        catalog: string;
        'game-data': string;
        progress: string;
    }> {
        return this.get('storyRoot');
    }

    async getStories(): Promise<any[]> {
        return this.get<any[]>('stories');
    }

    async getStorypassages(storyId: string): Promise<any> {
        return this.get<any>('storypassages', { urlSuffix: `${storyId}/` });
    }

    async getStoryPassage(storyId: string, passageId: string): Promise<any> {
        return this.get<any>('storypassages', { urlSuffix: `${storyId}/passage/${passageId}/` });
    }

    async makeStoryChoice(storyId: string, choiceId: string, choiceData?: any): Promise<any> {
        return this.post<any>('storypassages', choiceData || {}, { urlSuffix: `${storyId}/choice/${choiceId}/` });
    }

    async getStoryDetailedProgress(storyId: string): Promise<any> {
        return this.get<any>('storypassages', { urlSuffix: `${storyId}/progress/` });
    }

    async restartStory(storyId: string): Promise<any> {
        return this.post<any>('storypassages', {}, { urlSuffix: `${storyId}/restart/` });
    }

    async completeSpecificStory(storyId: string, completionData: any): Promise<any> {
        return this.post<any>('storypassages', completionData, { urlSuffix: `${storyId}/complete/` });
    }

    async getStoryGameData(characterId: string): Promise<any> {
        return this.get<any>('storyGameData');
    }

    async updateStoryGameData(characterId: string, gameData: any): Promise<any> {
        return this.patch<any>('storyGameData', gameData, { urlSuffix: `${characterId}/` });
    }

    // ===== TESTING METHODS =====
    async testBackendEndpoints(): Promise<void> {
        console.log('=== TESTING BACKEND ENDPOINTS ===');
        
        try {
            // Test 1: Get user profile
            console.log('Test 1: Getting user profile...');
            const profile = await this.getProfile();
            console.log('User profile:', profile);
            
            // Test 2: Try to update profile directly
            console.log('Test 2: Trying to update profile...');
            try {
                const updatedProfile = await this.patch<UserProfile>('userProfile', {
                    has_completed_onboarding: true,
                    completion_type: 'character'
                });
                console.log('Profile updated successfully:', updatedProfile);
            } catch (updateError) {
                console.log('Profile update failed:', updateError);
            }
            
            // Test 3: Try different endpoints
            console.log('Test 3: Testing different endpoints...');
            const endpoints = [
                'users/me/',
                'users/',
                'users/complete_onboarding/',
                'users/1/'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Testing endpoint: ${endpoint}`);
                    const response = await apiClient.get(endpoint);
                    console.log(`Endpoint ${endpoint} success:`, response.data);
                } catch (error: any) {
                    console.log(`Endpoint ${endpoint} failed:`, error.response?.status, error.response?.data);
                }
            }
            
        } catch (error) {
            console.error('Backend endpoint test failed:', error);
        }
    }
}

// Export a singleton instance
export const apiService = new ApiService();