import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { CharacterGear, EquipmentItem, EquippedItems } from '../types/equipment';
import { CodexEntry, JournalPrompt } from '../types/journal';
import { Chapter, Choice, NPC, Passage, Story, StoryProgress } from '../types/story';
import { Character, CharacterCreateData, GameData, LoginResponse, ResearchGroup, UserProfile } from '../types/user';
import { API_ENDPOINTS, apiBaseUrl } from './apiConfig';

const testToken = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;

// Debug logging for test token
console.log('Test token configured:', testToken ? 'Yes' : 'No');
if (!testToken) {
    console.warn('TEST_USER_TOKEN not configured in environment variables');
}

const FALLBACK_TEST_TOKEN = '8a71299900898a32febbca89ef5638a406475348';

// ===== TOKEN MANAGEMENT =====
class TokenManager {
    private cachedToken: string | null = null;
    private isInitialized = false;
    private initializationPromise: Promise<void> | null = null;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.loadTokenFromStorage();
        await this.initializationPromise;
        this.isInitialized = true;
    }

    private async loadTokenFromStorage(): Promise<void> {
        try {
            this.cachedToken = await AsyncStorage.getItem('authToken');
            console.log('TokenManager: Token loaded from storage:', this.cachedToken ? 'Present' : 'Not found');
            console.log('TokenManager: Token value:', this.cachedToken);
        } catch (error) {
            console.error('TokenManager: Error loading token from storage:', error);
            this.cachedToken = null;
        }
    }

    getToken(): string | null {
        return this.cachedToken;
    }

    async setToken(token: string): Promise<void> {
        this.cachedToken = token;
        try {
            await AsyncStorage.setItem('authToken', token);
            console.log('TokenManager: Token saved to storage');
        } catch (error) {
            console.error('TokenManager: Error saving token to storage:', error);
        }
    }

    async clearToken(): Promise<void> {
        this.cachedToken = null;
        try {
            await AsyncStorage.removeItem('authToken');
            console.log('TokenManager: Token cleared from storage');
        } catch (error) {
            console.error('TokenManager: Error clearing token from storage:', error);
        }
    }

    isTestToken(): boolean {
        return this.cachedToken === testToken || this.cachedToken === FALLBACK_TEST_TOKEN;
    }
}

// ===== REQUEST TRACKING =====
class RequestTracker {
    private pendingRequests = new Map<string, Promise<any>>();

    generateKey(method: string, url: string, data?: any): string {
        return `${method}:${url}:${JSON.stringify(data || {})}`;
    }

    isPending(key: string): boolean {
        return this.pendingRequests.has(key);
    }

    addRequest(key: string, promise: Promise<any>): void {
        this.pendingRequests.set(key, promise);
        
        // Clean up when request completes
        promise.finally(() => {
            this.pendingRequests.delete(key);
        });
    }

    getPendingRequest(key: string): Promise<any> | undefined {
        return this.pendingRequests.get(key);
    }
}

// ===== TYPES FOR WELLNESS BACKEND =====
// Using existing interfaces from types files
// WellnessCharacter = Character (from user.ts)
// CharacterConfig = Character (from user.ts)
// WellnessStats = from journal.ts
// CopingTool = EquipmentItem (from equipment.ts)
// CharacterTool = EquippedItems (from equipment.ts)
// Story, NPC, Passage, Choice = from story.ts

// Additional types needed for the API service
export interface StoryVariable {
    id: number;
    user: number; // FK to User
    story: number; // FK to Story
    variable_name: string;
    variable_value: any;
}

// Extended CopingTool interface for backend compatibility
export interface CopingTool extends Omit<EquipmentItem, 'subtype'> {
    tool_type: 'focus' | 'comfort' | 'shield' | 'ground';
    subtype: string; // Override with string type for backend compatibility
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

// Extended CharacterTool interface for backend compatibility
export interface CharacterTool {
    id: number;
    tool: CopingTool;
    is_equipped: boolean;
    times_used: number;
    effectiveness_rating?: number;
    acquired_at: string;
}

export interface HomeData {
    character: Character;
    archive_metrics: {
        icon: string;
        label: string;
        value: string;
        progress: number;
    }[];
    recent_codex_entries: CodexEntry[];
    available_tools: CopingTool[];
}

// ===== GLOBAL INSTANCES =====
const tokenManager = new TokenManager();
const requestTracker = new RequestTracker();

// ===== Axios Setup =====
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000, // 30 second timeout
});

// Fixed request interceptor - no async operations, uses cached token
apiClient.interceptors.request.use(
    (config) => {
        // Skip token for login and token verification endpoints
        const skipTokenEndpoints = ['/api/auth/login/', '/api/auth/token/verify/'];
        const shouldSkipToken = skipTokenEndpoints.some(endpoint => 
            config.url?.includes(endpoint)
        );

        if (!shouldSkipToken) {
            const token = tokenManager.getToken();
            console.log('Request interceptor: URL:', config.url);
            console.log('Request interceptor: Token available:', !!token);
            console.log('Request interceptor: Token value:', token);
            if (token) {
                config.headers.Authorization = `Token ${token}`;
                console.log('Request interceptor: Added Authorization header');
            } else {
                console.log('Request interceptor: No token available');
            }
        }

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Fixed response interceptor - handles 401 errors without triggering loops
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.error('Authentication error (401):', {
                url: error.config?.url,
                method: error.config?.method,
                data: error.response.data
            });
            
            // Only clear token for certain endpoints that should require authentication
            // Don't clear token for endpoints that might not be implemented yet
            const url = error.config?.url || '';
            const shouldClearToken = !url.includes('journal/journal-prompts') && 
                                   !url.includes('story/stories') &&
                                   !url.includes('characters/coping-tools') &&
                                   !url.includes('characters/character-tools');
            
            if (shouldClearToken) {
                console.log('Clearing token due to 401 error on authenticated endpoint');
                await tokenManager.clearToken();
            } else {
                console.log('Not clearing token for 401 error on potentially unimplemented endpoint:', url);
            }
            
            // Don't retry the request - let the calling code handle it
        }
        return Promise.reject(error);
    }
);

// ===== Main API Service Class =====
class ApiService {
    private isInitialized = false;

    // Initialize the API service
    async initialize(): Promise<void> {
        if (this.isInitialized) return;
        
        console.log('ApiService: Initializing...');
        await tokenManager.initialize();
        this.isInitialized = true;
        console.log('ApiService: Initialized successfully');
    }

    // Generic request methods with request deduplication
    public async get<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
        const key = requestTracker.generateKey('GET', url);
        
        // Check for pending request
        if (requestTracker.isPending(key)) {
            console.log('ApiService: Returning pending GET request for:', url);
            return requestTracker.getPendingRequest(key)!;
        }

        const promise = this.executeGet<T>(url, config);
        requestTracker.addRequest(key, promise);
        return promise;
    }

    private async executeGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.get<T>(url, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'GET', url);
            throw error;
        }
    }

    public async post<T>(endpoint: keyof typeof API_ENDPOINTS, data?: any, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
        const key = requestTracker.generateKey('POST', url, data);
        
        // Check for pending request
        if (requestTracker.isPending(key)) {
            console.log('ApiService: Returning pending POST request for:', url);
            return requestTracker.getPendingRequest(key)!;
        }

        const promise = this.executePost<T>(url, data, config);
        requestTracker.addRequest(key, promise);
        return promise;
    }

    private async executePost<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        console.log(`POST ${url}`, { data });
        
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
            }
            this.handleError(error, 'POST', url);
            throw error;
        }
    }

    public async patch<T>(endpoint: keyof typeof API_ENDPOINTS, data: any, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
        const key = requestTracker.generateKey('PATCH', url, data);
        
        if (requestTracker.isPending(key)) {
            console.log('ApiService: Returning pending PATCH request for:', url);
            return requestTracker.getPendingRequest(key)!;
        }

        const promise = this.executePatch<T>(url, data, config);
        requestTracker.addRequest(key, promise);
        return promise;
    }

    private async executePatch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.patch<T>(url, data, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'PATCH', url);
            throw error;
        }
    }

    public async delete<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
        const key = requestTracker.generateKey('DELETE', url);
        
        if (requestTracker.isPending(key)) {
            console.log('ApiService: Returning pending DELETE request for:', url);
            return requestTracker.getPendingRequest(key)!;
        }

        const promise = this.executeDelete<T>(url, config);
        requestTracker.addRequest(key, promise);
        return promise;
    }

    private async executeDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.delete<T>(url, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'DELETE', url);
            throw error;
        }
    }

    private handleError(error: any, method: string, endpoint: string) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`Error in ${method} ${endpoint}:`, {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
                url: axiosError.config?.url,
            });
        } else {
            console.error(`Error in ${method} ${endpoint}:`, error);
        }
    }

    // ===== Authentication Methods =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.post<LoginResponse>('login', { username, password });
            await tokenManager.setToken(response.token);
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
            await tokenManager.clearToken();
            await AsyncStorage.removeItem('characterId');
        }
    }

    async validateToken(): Promise<boolean> {
        try {
            const token = tokenManager.getToken();
            if (!token) return false;

            if (tokenManager.isTestToken()) {
                return true;
            }

            await this.post('tokenVerify', { token });
            return true;
        } catch (error) {
            console.error('Token validation error:', error);
            await tokenManager.clearToken();
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
        try {
            // Assign user to research group using the correct endpoint
            await this.post('assignResearchGroup', { research_group_id: groupId });
            console.log('User assigned to research group ID:', groupId);
        } catch (error) {
            console.error('Failed to assign research group:', error);
            console.log('Research group assignment failed - this is expected if the backend is not properly configured');
            // Don't throw error, just log it and continue
        }
    }

    async assignResearchGroupByCondition(condition: 'A' | 'B'): Promise<void> {
        try {
            console.log('Assigning research group condition:', condition);
            
            // Get available research groups (should be 2 groups: A and B)
            const availableGroups = await this.getAvailableGroups();
            console.log('Available research groups:', availableGroups);
            
            // Find the group with the matching condition
            const targetGroup = availableGroups.find(group => group.condition === condition);
            
            if (!targetGroup) {
                console.error(`No research group found with condition ${condition}`);
                console.log('Available groups:', availableGroups);
                return;
            }
            
            console.log('Found target research group:', targetGroup);
            
            // Assign user to this research group
            await this.assignResearchGroup(targetGroup.id);
            console.log('User assigned to research group successfully');
            
        } catch (error) {
            console.error('Failed to assign research group by condition:', error);
            console.log('Research group assignment failed - this is expected if the backend is not properly configured');
            // Don't throw error, just log it and continue
        }
    }

    async getAvailableGroups(): Promise<ResearchGroup[]> {
        try {
            return await this.get<ResearchGroup[]>('availableResearchGroups');
        } catch (error) {
            console.error('Failed to get available research groups:', error);
            console.log('Research groups endpoint not available - returning empty array');
            return [];
        }
    }

    async getAllGroups(): Promise<ResearchGroup[]> {
        try {
            return await this.get<ResearchGroup[]>('researchGroups');
        } catch (error) {
            console.error('Failed to get all research groups:', error);
            console.log('Research groups endpoint not available - returning empty array');
            return [];
        }
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
    async createCharacter(characterData: CharacterCreateData): Promise<Character> {
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
                
                const result = await this.post<Character>('characters', cleanData);
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
                
                const result = await this.post<Character>('characters', characterData);
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

    async getMyCharacter(): Promise<Character> {
        return this.get<Character>('myCharacter');
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
        character_config: Character;
    }> {
        return this.get('characterStats');
    }

    async updateCharacterCustomization(characterId: number, customizationData: Partial<Character>): Promise<{
        message: string;
        character: Character;
        character_config: Character;
    }> {
        return this.patch('characters', customizationData, { urlSuffix: `${characterId}/` });
    }

    async gainExperience(characterId: number, experience: number, source?: string): Promise<Character & {
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
    }>): Promise<Character & {
        wellness_gained: Record<string, number>;
        new_values: Record<string, number>;
        message: string;
    }> {
        return this.post('gainWellness', wellnessGains, { urlSuffix: `${characterId}/gain-wellness/` });
    }

    async getCustomizationOptions(): Promise<Character & { option_limits: Record<string, number> }> {
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
    }    // ===== JOURNAL & CODEX METHODS (matching your Django backend) =====
    async getJournalPrompts(): Promise<JournalPrompt[]> {
        return this.get<JournalPrompt[]>('journalPrompts');
    }

    async getMyCodexEntries(): Promise<CodexEntry[]> {
        return this.get<CodexEntry[]>('myCodexEntries');
    }

    async getAllCodexEntries(): Promise<CodexEntry[]> {
        return this.get<CodexEntry[]>('codexEntries');
    }

    async createCodexEntry(entryData: {
        prompt_id: string;
        entry_type: 'journal' | 'draw' | 'voice';
        content: string;
        skill_category: string;
        map_area: string;
        difficulty: string;
    }): Promise<CodexEntry> {
        return this.post<CodexEntry>('codexEntries', entryData);
    }    // ===== NEW GEAR METHODS =====
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
    }    // Enhanced journal prompt methods for better filtering
    async getFilteredJournalPrompts(options?: {
        category?: string;
        difficulty?: string;
        skillCategory?: string;
        mapArea?: string;
        isActive?: boolean;
    }): Promise<JournalPrompt[]> {
        try {
            // Get all journal prompts from the base endpoint
            const allPrompts = await this.get<JournalPrompt[]>('journalPrompts');
            
            // Filter client-side based on the provided options
            let filteredPrompts = allPrompts;
            
            if (options?.isActive !== undefined) {
                filteredPrompts = filteredPrompts.filter(prompt => prompt.is_active === options.isActive);
            }
            
            if (options?.category) {
                filteredPrompts = filteredPrompts.filter(prompt => prompt.category === options.category);
            }
            
            if (options?.difficulty) {
                filteredPrompts = filteredPrompts.filter(prompt => prompt.difficulty === options.difficulty);
            }
            
            if (options?.skillCategory) {
                filteredPrompts = filteredPrompts.filter(prompt => prompt.skill_category === options.skillCategory);
            }
            
            if (options?.mapArea) {
                filteredPrompts = filteredPrompts.filter(prompt => prompt.map_area === options.mapArea);
            }
            
            return filteredPrompts;
        } catch (error) {
            console.error('Error fetching journal prompts:', error);
            return [];
        }
    }

    // Get one prompt per category with smart difficulty selection
    async getPromptsByCategory(unlockedAreas: string[], completedStories: string[]): Promise<{
        journal: JournalPrompt | null;
        draw: JournalPrompt | null;
        voice: JournalPrompt | null;
    }> {
        try {
            // Get all active prompts
            const allPrompts = await this.getFilteredJournalPrompts({ isActive: true });
            
            // Filter prompts by unlocked areas (always include 'entrance')
            const accessibleAreas = ['entrance', ...unlockedAreas];
            const accessiblePrompts = allPrompts.filter(prompt => 
                accessibleAreas.includes(prompt.map_area)
            );

            // Determine preferred skill categories based on completed stories
            const preferredSkills = this.getPreferredSkillCategories(completedStories);

            // Select one prompt per category
            const result = {
                journal: this.selectBestPrompt(accessiblePrompts, 'journal', preferredSkills),
                draw: this.selectBestPrompt(accessiblePrompts, 'draw', preferredSkills),
                voice: this.selectBestPrompt(accessiblePrompts, 'voice', preferredSkills)
            };

            return result;
        } catch (error) {
            console.error('Error fetching prompts by category:', error);
            return { journal: null, draw: null, voice: null };
        }
    }

    // Helper method to determine preferred skill categories based on completed stories
    private getPreferredSkillCategories(completedStories: string[]): string[] {
        // This should map to your story completion logic
        // For now, return a default progression
        const skillProgression = [
            'Emotional Awareness',     // Beginner
            'Stress Management',       // Early
            'Self-Compassion',         // Intermediate  
            'Social Connection',       // Advanced
            'Personal Growth'          // Expert
        ];

        // Return skills based on how many stories completed
        const numCompleted = completedStories.length;
        if (numCompleted <= 2) return ['Emotional Awareness', 'Stress Management'];
        if (numCompleted <= 5) return ['Stress Management', 'Self-Compassion', 'Emotional Awareness'];
        if (numCompleted <= 8) return ['Self-Compassion', 'Social Connection', 'Stress Management'];
        return skillProgression; // All skills unlocked
    }    // Helper method to select the best prompt for a category
    private selectBestPrompt(
        prompts: JournalPrompt[], 
        category: string, 
        preferredSkills: string[]
    ): JournalPrompt | null {
        const categoryPrompts = prompts.filter(p => p.category === category);
        if (categoryPrompts.length === 0) return null;

        // Try to find a prompt with preferred skill first
        for (const skill of preferredSkills) {
            const skillPrompts = categoryPrompts.filter(p => p.skill_category === skill);
            if (skillPrompts.length > 0) {
                // Return random prompt from this skill category
                return skillPrompts[Math.floor(Math.random() * skillPrompts.length)];
            }
        }

        // Fallback: return random prompt from category
        return categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)];
    }    // ===== STORY METHODS (UPDATED FOR DJANGO BACKEND STRUCTURE) =====
    
    // Get all available stories
    async getStoryCatalog(): Promise<Story[]> {
        return this.get<Story[]>('storyCatalog');
    }

    // Get all stories (alias for catalog)
    async getStories(): Promise<Story[]> {
        return this.getStoryCatalog();
    }

    // Get passages for a specific story
    async getStoryPassages(storyId: number): Promise<Passage[]> {
        // Get chapters first, then get passages from each chapter
        const chapters = await this.get<Chapter[]>('storyChapters', { urlSuffix: `${storyId}/chapters/` });
        const allPassages: Passage[] = [];
        
        for (const chapter of chapters) {
            const chapterPassages = await this.get<Passage[]>('chapterPassages', { urlSuffix: `${chapter.id}/passages/` });
            allPassages.push(...chapterPassages);
        }
        
        return allPassages;
    }

    // Get a specific passage in a story
    async getStoryPassage(storyId: number, passageId: string): Promise<Passage> {
        // Use the story passage endpoint
        return this.get<Passage>('storyPassage', { urlSuffix: `${storyId}/passage/${encodeURIComponent(passageId)}/` });
    }

    // Get choices for a specific passage
    async getPassageChoices(passageId: number): Promise<Choice[]> {
        return this.get<Choice[]>('passagesCRUD', { urlSuffix: `${passageId}/choices/` });
    }

    // Start a specific story
    async startStory(storyId: number): Promise<StoryProgress> {
        return this.post<StoryProgress>('startStory', null, { urlSuffix: `${storyId}/start/` }); 
    }

    // Select a choice in a story
    async selectChoice(choiceId: number, storyProgressId?: number): Promise<{
        story_progress: StoryProgress;
        next_passage: Passage;
        effects_applied: Record<string, any>;
    }> {
        return this.post('choicesCRUD', { 
            story_progress_id: storyProgressId 
        }, { urlSuffix: `${choiceId}/select/` });
    }

    // Get story progress for current user
    async getStoryProgress(storyId: number): Promise<StoryProgress | null> {
        try {
            return this.get<StoryProgress>('storyProgress', { urlSuffix: `${storyId}/progress/` }); 
        } catch (error) {
            // Return null if no progress found
            return null;
        }
    }



    // Update story progress
    async updateStoryProgress(storyId: number): Promise<StoryProgress> {
        return this.patch<StoryProgress>('storyProgress', {}, { urlSuffix: `${storyId}/progress/` }); 
    }

    // Set story variable
    async setStoryVariable(storyId: number, variableName: string, value: any): Promise<StoryVariable> {
        return this.post<StoryVariable>('storyVariables', {
            story: storyId,
            variable_name: variableName,
            variable_value: value
        });
    }

    // Get story variables
    async getStoryVariables(storyId: number): Promise<StoryVariable[]> {
        return this.get<StoryVariable[]>('storyVariables', { 
            urlSuffix: `?story=${storyId}` 
        });
    }

    // Get all NPCs
    async getNPCs(): Promise<NPC[]> {
        return this.get<NPC[]>('npcsCRUD');
    }

    // Get specific NPC
    async getNPC(npcId: number): Promise<NPC> {
        return this.get<NPC>('npcsCRUD', { urlSuffix: `${npcId}/` });
    }

    // Complete story
    async completeStory(storyId: number, completionType?: string): Promise<StoryProgress> {
        const progress = await this.getStoryProgress(storyId);
        if (!progress) {
            throw new Error('No story progress found');
        }

        return this.patch<StoryProgress>('storyProgressCRUD', {
            is_completed: true,
            completion_type: completionType,
            completed_at: new Date().toISOString()
        }, { urlSuffix: `${progress.id}/` });
    }

    // ===== LEGACY STORY METHODS (DEPRECATED - kept for compatibility) =====
    
    async getNewStoryCatalog(): Promise<Story[]> {
        return this.getStoryCatalog();
    }

    async getNewStoryChapters(storyId: number): Promise<any[]> {
        // Your Django model doesn't have chapters, so return passages grouped by story
        console.warn('getNewStoryChapters is deprecated - your Django model uses passages directly');
        return this.getStoryPassages(storyId);
    }

    async getNewChapterPassages(chapterId: number): Promise<any[]> {
        console.warn('getNewChapterPassages is deprecated - your Django model uses passages directly');
        return [];
    }

    async startNewStory(storyId: number): Promise<StoryProgress> {
        return this.startStory(storyId);
    }

    async getNewStoryPassage(storyId: number, passageId: string): Promise<Passage> {
        return this.getStoryPassage(storyId, passageId);
    }

    async selectNewChoice(choiceId: number): Promise<any> {
        return this.selectChoice(choiceId);
    }

    async getNewStoryProgress(storyId: number): Promise<StoryProgress | null> {
        return this.getStoryProgress(storyId);
    }

    // Legacy aliases
    async getStoryChapters(storyId: number): Promise<any[]> {
        return this.getNewStoryChapters(storyId);
    }

    async getChapterPassages(chapterId: number): Promise<any[]> {
        return this.getNewChapterPassages(chapterId);
    }

    // ===== STORY UTILITY METHODS =====
    
    // Navigate to next passage in story flow
    async navigateToPassage(storyId: number, passageId: string, choiceId?: number): Promise<{
        passage: Passage;
        choices: Choice[];
        storyProgress: StoryProgress;
    }> {
        try {
            // Get the passage
            const passage = await this.getStoryPassage(storyId, passageId);
            
            // Get choices for this passage
            const choices = await this.getPassageChoices(passage.id);
            
            // Update or create story progress
            let storyProgress = await this.getStoryProgress(storyId);
            
            if (!storyProgress) {
                // Start the story if no progress exists
                storyProgress = await this.startStory(storyId);
            } else {
                // Update current passage
                storyProgress = await this.updateStoryProgress(storyProgress.id);
            }

            // Apply passage effects if any
            if (passage.story_effects && Object.keys(passage.story_effects).length > 0) {
                await this.applyPassageEffects(passage.story_effects, storyProgress);
            }

            return {
                passage,
                choices: choices.filter(choice => this.isChoiceAvailable(choice, storyProgress)),
                storyProgress
            };
        } catch (error) {
            console.error('Error navigating to passage:', error);
            throw error;
        }
    }

    // Make a choice and navigate to the next passage
    async makeChoice(choiceId: number, storyProgressId: number): Promise<{
        nextPassage: Passage;
        choices: Choice[];
        storyProgress: StoryProgress;
        effectsApplied: Record<string, any>;
    }> {
        try {
            // Select the choice and get results
            const choiceResult = await this.selectChoice(choiceId, storyProgressId);
            
            // Get choices for the next passage
            const choices = await this.getPassageChoices(choiceResult.next_passage.id);
            
            return {
                nextPassage: choiceResult.next_passage,
                choices: choices.filter(choice => 
                    this.isChoiceAvailable(choice, choiceResult.story_progress)
                ),
                storyProgress: choiceResult.story_progress,
                effectsApplied: choiceResult.effects_applied
            };
        } catch (error) {
            console.error('Error making choice:', error);
            throw error;
        }
    }

    // Check if a choice should be available to the player
    private isChoiceAvailable(choice: Choice, storyProgress: StoryProgress): boolean {
        // Check basic required conditions
        if (!choice.required_conditions || Object.keys(choice.required_conditions).length === 0) {
            return true;
        }

        // Check level requirements
        if (choice.required_conditions.level) {
            // You'd get character level from somewhere
            // For now, assume available
        }

        // Check story variables
        if (choice.required_conditions.variables) {
            for (const [varName, requiredValue] of Object.entries(choice.required_conditions.variables)) {
                const currentValue = storyProgress.story_variables[varName];
                if (currentValue !== requiredValue) {
                    return false;
                }
            }
        }

        return true;
    }

    // Apply effects from passages (experience, items, story variables, etc.)
    private async applyPassageEffects(effects: Record<string, any>, storyProgress: StoryProgress): Promise<void> {
        try {
            // Apply experience gains
            if (effects.experience) {
                const character = await this.getMyCharacter();
                await this.gainExperience(character.id, effects.experience, 'story_passage');
            }

            // Apply wellness gains
            const wellnessGains: Record<string, number> = {};
            if (effects.awareness) wellnessGains.awareness = effects.awareness;
            if (effects.resilience) wellnessGains.resilience = effects.resilience;
            if (effects.connection) wellnessGains.connection = effects.connection;
            if (effects.balance) wellnessGains.balance = effects.balance;

            if (Object.keys(wellnessGains).length > 0) {
                const character = await this.getMyCharacter();
                await this.gainWellness(character.id, wellnessGains);
            }

            // Apply story variables
            if (effects.set_variables) {
                const updatedVariables = { ...storyProgress.story_variables, ...effects.set_variables };
                await this.updateStoryProgress(storyProgress.id);
            }

            // Add items to inventory (if you have an inventory system)
            if (effects.add_items) {
                // Implement item addition logic
                console.log('Adding items:', effects.add_items);
            }

        } catch (error) {
            console.error('Error applying passage effects:', error);
            // Don't throw - effects failing shouldn't break story flow
        }
    }

    // Get available stories for character (filtered by level, etc.)
    async getAvailableStories(): Promise<Story[]> {
        try {
            const character = await this.getMyCharacter();
            const level = character.level || 1;
            
            // Use the available stories endpoint that filters by level
            return await this.get<Story[]>('storyCatalog', { 
                params: { level } 
            });
        } catch (error) {
            console.error('Error getting available stories:', error);
            // Fallback to getting all stories and filtering client-side
            try {
                const allStories = await this.getStoryCatalog();
                const character = await this.getMyCharacter();
                
                return allStories.filter(story => {
                    // Check level requirement
                    if (story.min_level > character.level) {
                        return false;
                    }
                    // Add other filtering logic as needed
                    return true;
                });
            } catch (fallbackError) {
                console.error('Error in fallback story loading:', fallbackError);
                throw error; // Throw original error
            }
        }
    }

    // Get story completion status for current user
    async getStoryCompletionStatus(): Promise<Record<number, {
        isCompleted: boolean;
        completionType?: string;
        currentPassageId?: string;
        progressPercentage: number;
    }>> {
        try {
            const [allStories, allProgress] = await Promise.all([
                this.getStoryCatalog(),
                this.get<any[]>('storyProgressCRUD')
            ]);

            const status: Record<number, any> = {};

            for (const story of allStories) {
                const progress = allProgress.find((p: any) => p.story === story.id);
                
                if (!progress) {
                    status[story.id] = {
                        isCompleted: false,
                        progressPercentage: 0
                    };
                } else {
                    // Calculate progress percentage based on passages visited
                    const storyPassages = await this.getStoryPassages(story.id);
                    const progressPercentage = Math.round(
                        (progress.passages_visited.length / storyPassages.length) * 100
                    );

                    status[story.id] = {
                        isCompleted: progress.is_completed,
                        completionType: progress.completion_type,
                        currentPassageId: progress.current_passage_id,
                        progressPercentage
                    };
                }
            }

            return status;
        } catch (error) {
            console.error('Error getting story completion status:', error);
            throw error;
        }
    }

    // Reset story progress (for repeatable stories)
    async resetStoryProgress(storyId: number): Promise<StoryProgress> {
        try {
            const currentProgress = await this.getStoryProgress(storyId);
            if (!currentProgress) {
                throw new Error('No story progress found to reset');
            }

            const story = await this.get<Story>('storyCatalog', { urlSuffix: `${storyId}/` });
            
            return await this.patch<StoryProgress>('storyProgressCRUD', {
                current_passage_id: story.starting_passage_id,
                passages_visited: [],
                choices_made: [],
                story_variables: {},
                is_completed: false,
                completion_type: undefined,
                completed_at: undefined,
                last_played: new Date().toISOString()
            }, { urlSuffix: `${currentProgress.id}/` });
        } catch (error) {
            console.error('Error resetting story progress:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const apiService = new ApiService();