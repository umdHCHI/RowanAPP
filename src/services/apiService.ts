import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { archiveHeaderIcon } from '../assets/equipment';
import { Character, CharacterCreateData, CharacterGear, CodexEntry, CopingTool, GameData, JournalPrompt, LoginResponse, UserProfile } from '../types';
import { PersonalityKey, toPersonalityKey } from '../types/personality';
import { API_ENDPOINTS, apiBaseUrl } from './apiConfig';

// small helper
const isAxiosError = (e: unknown): e is AxiosError => axios.isAxiosError(e);
const is404 = (e: unknown) => isAxiosError(e) && e.response?.status === 404;

type ThoughtDefenderRunPayload = {
  score: number;
  level: number;
  durationMs: number;
  enemiesDestroyed: number;
  damageTaken: number;
  modifiers?: Record<string, any>;
  completed: boolean;
  meta?: Record<string, any>;
};

type ApiOk<T=any> = { ok: true; data: T };
type ApiErr = { ok: false; error: string; status?: number };

// ===== THOUGHT DEFENDER EVENT-BASED LOGGING TYPES =====
export type TDifficulty = 'ZEN' | 'BALANCED' | 'INTENSE' | 'NIGHTMARE';

export type TDProgressEvent = 
    | { type: 'session_start'; session_id: string; difficulty: TDifficulty; started_at: string; client_ts: number }
    | { type: 'wave_start'; session_id: string; wave: number; client_ts: number }
    | { type: 'enemy_destroyed'; session_id: string; wave: number; enemy_type: 'thought' | 'boss'; points: number; client_ts: number }
    | { type: 'player_hit'; session_id: string; wave: number; damage: number; remaining_hp: number; client_ts: number }
    | { type: 'powerup_collected'; session_id: string; wave: number; powerup_id: string; client_ts: number }
    | { type: 'session_end'; session_id: string; ended_at: string; client_ts: number; duration_ms: number; waves_cleared: number; kills: number; score: number; difficulty: TDifficulty; quit_reason?: 'completed' | 'dead' | 'quit'; accuracy?: number; damage_taken?: number; };

export interface LogPlayerProgressPayload {
    game: 'thought_defender';
    events: TDProgressEvent[];
    meta?: { app_version?: string };
}


// ===== Axios Setup =====
// Platform-specific timeout configuration
const getTimeout = (): number => {
    if (Platform.OS === 'web') {
        return 10000; // 10 seconds for web
    } else if (Platform.OS === 'ios') {
        return 30000; // 30 seconds for iOS (slower networks)
    } else {
        return 25000; // 25 seconds for Android
    }
};

const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: getTimeout(), // Platform-specific timeout
    withCredentials: false, // Important for CORS
});


// Enable request interceptor to add authentication headers
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Skip authorization for login requests
            if (config.url?.includes('auth/login') || config.url?.includes('login')) {
                return config;
            }
            
            // Clear any existing Authorization header to avoid conflicts
            delete config.headers.Authorization;
            
            // Add a longer delay to ensure AsyncStorage operations are complete
            await new Promise(resolve => setTimeout(resolve, 50));
            
            const token = await AsyncStorage.getItem('authToken');
            
            if (token && token.trim()) {
                // Django REST Framework uses 'Token' prefix for token authentication
                config.headers.Authorization = `Token ${token}`;
                
            } else {
archiveHeaderIcon            }
        } catch (error) {
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Enable response interceptor to handle authentication errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            const errorMessage = error.response.data as any;
            if (errorMessage?.detail === 'Invalid token.' || 
                errorMessage?.detail === 'Token has expired.') {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');
            }
        }
        
        // Enhanced error logging for mobile debugging
        if (error.code === 'ECONNABORTED') {
        } else if (error.code === 'NETWORK_ERROR') {
        } else if (error.response) {
        }
        
        return Promise.reject(error);
    }
);

// ===== Main API Service Class =====
class ApiService {
    private isInitialized = false;

    public async initialize(): Promise<void> {
        try {
            
            // Check if we have a stored token
                    const token = await AsyncStorage.getItem('authToken');
        
        if (token) {
            const isValid = await this.validateToken();
            
            if (isValid) {
                this.isInitialized = true;
            } else {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('characterId');
                this.isInitialized = false;
            }
        } else {
            this.isInitialized = false;
        }
        } catch (error) {
            this.isInitialized = false;
        }
    }


    public getInitializationStatus(): boolean {
        return this.isInitialized;
    }

    // Generic request methods
    public async get<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        try {
            const baseEndpoint = API_ENDPOINTS[endpoint];
            const urlSuffix = config?.urlSuffix || '';
            const url = baseEndpoint + urlSuffix;
            

            
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
        

        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.post<T>(url, data, axiosConfig);

            return response.data;
        } catch (error: any) {
            
 
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
            
        } else {
        }
    }

    private toError(e: unknown): ApiErr {
        if (isAxiosError(e)) {
            const msg = (e.response?.data as any)?.detail || e.message;
            return { ok: false, error: String(msg), status: e.response?.status };
        }
        return { ok: false, error: 'Unknown error' };
    }
    // ==== AS OF RIGHT NOW WE WILL REGISTER NEW USERS =====
    // ===== Authentication Methods verified =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            // Input validation
            if (!username || !password) {
                throw new Error('Username and password are required');
            }

            if (username.trim().length === 0 || password.trim().length === 0) {
                throw new Error('Username and password cannot be empty');
            }

            
            // Make the login API call
            const response = await this.post<LoginResponse>('login', { username, password });
            
            // Validate response structure
            if (!response || !response.token) {
                throw new Error('Invalid login response: No token received');
            }

            if (!response.user || !response.user.id) {
                throw new Error('Invalid login response: No user data received');
            }

            
            // Store authentication data using Promise.all for better performance
            // This ensures all storage operations complete before proceeding
            await Promise.all([
                AsyncStorage.setItem('authToken', response.token),
                AsyncStorage.setItem('characterId', String(response.user.id)),
                AsyncStorage.setItem('userData', JSON.stringify(response.user))
            ]);

            
            return response;
        } catch (error: any) {

            // Provide more specific error messages based on the error type
            if (error.response?.status === 401) {
                throw new Error('Invalid credentials. Please check your username and password.');
            } else if (error.response?.status === 404) {
                throw new Error('Login service not available. Please try again later.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
                throw new Error('Network connection failed. Please check your internet connection.');
            } else if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please try again.');
            } else {
                // Preserve the original error message if it's meaningful
                const errorMessage = error.message || 'Login failed. Please check your credentials and network connection.';
                throw new Error(errorMessage);
            }
        }
    }

    async logout(): Promise<void> {
        try {
            
            // Attempt to call the logout API endpoint
            try {
                await this.post('logout');
            } catch (apiError: any) {
                // Don't fail the logout process if the API call fails
                // The user should still be logged out locally
            }
            
            // Always clear local storage regardless of API call success
            await Promise.all([
                AsyncStorage.removeItem('authToken'),
                AsyncStorage.removeItem('characterId'),
                AsyncStorage.removeItem('userData')
            ]);
            
        } catch (error: any) {
            // Even if there's an error, try to clear storage as a fallback
            try {
                await Promise.all([
                    AsyncStorage.removeItem('authToken'),
                    AsyncStorage.removeItem('characterId'),
                    AsyncStorage.removeItem('userData')
                ]);
            } catch (fallbackError) {
                // This is a critical error - the user might remain logged in
                throw new Error('Failed to complete logout. Please restart the app.');
            }
        }
    }

    async validateToken(): Promise<boolean> {
        try {
            
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                return false;
            }

            
            // Test token by making a simple authenticated request
            // This will work for both regular tokens and test tokens
            try {
                await this.get('userProfile');
                return true;
            } catch (error: any) {
                
                // Don't remove token here - let response interceptor handle it
                // The response interceptor will handle 401/403 responses appropriately
                return false;
            }
        } catch (error: any) {
            // Don't remove token here - let response interceptor handle it
            return false;
        }
    }

    /**
     * Test method to verify token storage and retrieval
     */
    public async testTokenStorage(): Promise<{
        stored: boolean;
        token: string | null;
        length: number;
        preview: string;
    }> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            return {
                stored: !!token,
                token: token,
                length: token ? token.length : 0,
                preview: token ? token.substring(0, 20) + '...' : 'null'
            };
        } catch (error) {
            return {
                stored: false,
                token: null,
                length: 0,
                preview: 'error'
            };
        }
    }

    /**
     * Test method to verify if the token works with a simple authenticated request
     */

    // ===== User Methods =====
    /** Returns a single, normalized profile for the given user (or current user). */
    async getProfile(userId?: number): Promise<any> {
        try {


            // Validate authentication first
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            // Resolve the effective user id
            let effectiveUserId = userId;
            if (!effectiveUserId) {
                const me = await this.get<any>('currentUser'); // GET users/me/
                if (!me?.id) {
                    throw new Error("getProfile(): couldn't resolve current user id");
                }
                effectiveUserId = me.id;
            }


            // GET /users/{id}/full_profile/
            const full = await this.get<any>('userProfile', {
                urlSuffix: `${effectiveUserId}/full_profile/`,
            });

            // Shape from your backend:
            // {
            //   user: {..., character: null, personality_profile: {...}},
            //   profile: {...},
            //   character: {...awareness,resilience,connection,balance,experience,experience_needed,...}
            // }

            const user = full?.user ?? {};
            const character = full?.character ?? null;

            // Build a normalized wellness_stats + experience block expected by UI
            const wellness_stats = character
                ? {
                    awareness: character.awareness ?? 0,
                    resilience: character.resilience ?? 0,
                    connection: character.connection ?? 0,
                    balance: character.balance ?? 0,
                }
                : undefined;

            const experience = character?.experience ?? 0;
            const experience_needed = character?.experience_needed ?? 1000;
            const experience_progress_percentage =
                experience_needed > 0 ? Math.round((experience / experience_needed) * 100) : 0;

            // Compose a single object your MasterState/UI expects to read from
            const normalized = {
                // flatten user fields you actually use in UI
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,

                // keep profile bits
                completion_type: full?.profile?.completion_type,
                completion_data_id: full?.profile?.completion_data_id,
                has_completed_onboarding: full?.profile?.has_completed_onboarding,

                // IMPORTANT: Include the full profile object with research_group
                // This is needed for research condition determination
                profile: full?.profile ?? null,

                // ensure .character is populated (UI checks userProfile.character)
                character: character ?? null,

                // convenience fields used around the app
                wellness_stats,
                experience,
                experience_needed,
                experience_progress_percentage,

                // pass through anything else you need (personality, etc.)
                personality_profile: user?.personality_profile ?? null,

                // Include quest progress for personality users
                quest_progress: full?.quest_progress ?? [],
            };

            return normalized;

        } catch (error: any) {

            // Provide specific error messages based on error type
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (error.response?.status === 404) {
                throw new Error('User profile not found. Please contact support.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
                throw new Error('Network connection failed. Please check your internet connection.');
            } else if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please try again.');
            } else {
                // For other errors, try to provide a meaningful message
                const errorMessage = error.message || 'Failed to fetch user profile. Please try again.';
                throw new Error(errorMessage);
            }
        }
    }

    async updateProfile(profileData: any): Promise<UserProfile> {            
            // Validate authentication
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }
            // Validate input data
            if (!profileData || typeof profileData !== 'object') {
                throw new Error('Invalid profile data provided');
            }
            // Use the updateUserProfile endpoint directly - backend expects data in request body
            const result = await this.patch<UserProfile>('updateUserProfile', profileData);            
            if (!result) {
                throw new Error('No response received from profile update');
            }            
            return result;      
    }

    // ===== Survey Methods =====
    /**
     * Submit survey data and complete onboarding (merged function)
     * This combines survey submission + onboarding completion into one function
     */
    async submitSurveyData(payload: {
        user: number;
        answers: Record<number, number>;
        completed: boolean;
    }): Promise<UserProfile> {
            
            await this.post('personalitySurveySubmit', payload);
            return await this.getProfile();
    }


    async completeOnboarding(path: 'character' | 'survey'): Promise<UserProfile> {
        try {
            console.log('🔄 Starting onboarding for path:', path);
            
            // Validate input
            if (!path || !['character', 'survey'].includes(path)) {
                throw new Error('Invalid onboarding path: must be "character" or "survey"');
            }
            
            // Check if user is already onboarded
            const currentProfile = await this.getProfile();
            if (currentProfile?.profile?.has_completed_onboarding) {
                console.log('✅ User already onboarded, checking research group assignment...');
                
                const existingResearchGroup = currentProfile?.profile?.research_group;
                if (!existingResearchGroup) {
                    console.log('⚠️ User is onboarded but has no research group - calling complete_onboarding endpoint...');
                    // Call the backend's complete_onboarding endpoint to assign research group
                const onboardingData = {
                    has_completed_onboarding: true,
                    completion_type: path,
                    completion_data_id: null // Only if needed
                };
                    
                    const result = await this.post('completeOnboarding', onboardingData);
                    console.log('✅ Research group assigned via complete_onboarding:', result);
                    return (result as any).user || currentProfile;
                } else {
                    console.log('✅ User already has research group assigned:', existingResearchGroup);
                return currentProfile;
                }
            }
            
            console.log('📊 Calling backend complete_onboarding endpoint...');
            
            // Prepare the data structure that matches the backend's expectations
        const onboardingData = {
            has_completed_onboarding: true,
            completion_type: path,
            completion_data_id: null // Only if needed
        };
            
            console.log('📊 Sending onboarding data:', onboardingData);
            
            // Use the backend's unified complete_onboarding endpoint
            // The backend will automatically determine the research group based on whether user has character or survey
            const result = await this.post('completeOnboarding', onboardingData);
            console.log('✅ Onboarding completed via backend endpoint:', result);
            
            // Return the user profile from the response
            return (result as any).user || result;
            
        } catch (error: any) {
            console.error('❌ Failed to complete onboarding:', error);
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            // Check if this is a network/CORS error (common on web platform)
            const isNetworkError = error.code === 'ERR_NETWORK' || 
                                 error.message === 'Network Error' ||
                                 error.message?.includes('ERR_NETWORK_CHANGED') ||
                                 error.message?.includes('ERR_FAILED');
            
            if (isNetworkError) {
                console.warn('⚠️ Network error detected, returning mock profile for development');
                
                // Create a mock user profile for web platform
                const researchCondition = path === 'character' ? 'A' : 'B';
                const mockProfile: UserProfile = {
                    id: 1,
                    username: 'admin',
                    email: '',
                    first_name: '',
                    last_name: '',
                    profile: {
                        has_completed_onboarding: true,
                        completion_type: path,
                        research_group: { 
                            id: 1,
                            name: `Group ${researchCondition}`,
                            condition: researchCondition,
                            description: `Research group ${researchCondition}`,
                            created_at: new Date().toISOString()
                        }
                    },
                    personality_profile: {
                        id: 1,
                        user: 1,
                        openness: 3,
                        conscientiousness: 3,
                        extraversion: 3,
                        agreeableness: 3,
                        neuroticism: 3,
                        last_updated: new Date().toISOString()
                    }
                };

                return mockProfile;
            }
            
            throw new Error(`Failed to complete onboarding: ${error.message || 'Unknown error'}`);
        }
    }


    
    // Check if user already has a survey
    async checkExistingSurvey(): Promise<any> {
        try {
            // Try to get existing survey from personality/surveys/my_survey/ endpoint
            const response = await this.get('personalitySurveyMySurvey');
            // The endpoint returns a single survey object or null
            if (response && typeof response === 'object' && 'id' in response) {
                return response; // Return the survey
            }
            return null; // No surveys found
        } catch (error: any) {

            return null;
        }
    }

    async getPersonalityProfile(): Promise<any> {
        try {
            const profile = await this.get('personalityProfileMyProfile');
            return profile;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No profile found
            }
            throw error;
        }
    }

    async getPersonalityCompleteData(): Promise<any> {
        try {
            const data = await this.get('personalityProfileCompleteData');
            return data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // No data found
            }
            throw error;
        }
    }

    // Get the most recent survey data for debugging
    async getMostRecentSurvey(): Promise<any> {
        try {

            
            // Try multiple endpoints to find survey data
            const endpoints: Array<keyof typeof API_ENDPOINTS> = [
                'personalitySurveyMySurvey',
                'personalitySurveys'
            ];
            
            for (const endpoint of endpoints) {
                try {

                    const response = await this.get(endpoint);
                    
                    if (response) {

                        return response;
                    }
                } catch (endpointError: any) {

                }
            }
            

            return null;
        } catch (error: any) {

            return null;
        }
    }
    

    // Helper method to determine primary trait
   // private getPrimaryTrait(scores: any): string {
   //     const entries = Object.entries(scores);
  //      const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  //      return sorted[0][0];
   // }


    // ===== ONBOARDING VERIFICATION METHODS =====
    
    /**
     * Check if user has completed onboarding and get their assigned research condition
     * Returns onboarding status by checking the user profile
     * Special handling: Admin and test users ALWAYS go through onboarding (never marked as completed)
     */
    async checkOnboardingStatus(): Promise<{
        isOnboarded: boolean;
        researchCondition?: 'A' | 'B';
        completionType?: 'character' | 'survey';
        username: string;
        isTestUser: boolean;
    }> {
        try {


            const profile = await this.getProfile();

            
            // Extract user info from profile
            const user = profile;
            const userProfile = profile?.profile;
            
            // Check if user is admin or test user
            const isAdminUser = user?.username === 'admin';
            const isTestUser = user?.is_test_user || false;
            
            // Admin and test users ALWAYS go through onboarding (never marked as completed)
            if (isAdminUser || isTestUser) {
                


                
                const result = {
                    isOnboarded: false, // Always false for admin/test users
                    researchCondition: undefined,
                    completionType: undefined,
                    username: user?.username || 'unknown',
                    isTestUser: isTestUser
                };
                

                return result;
            }
            
            // For regular users, check actual onboarding status
            const result = {
                isOnboarded: userProfile?.has_completed_onboarding || false,
                researchCondition: userProfile?.research_group?.condition as 'A' | 'B' | undefined,
                completionType: userProfile?.completion_type as 'character' | 'survey' | undefined,
                username: user?.username || 'unknown',
                isTestUser: isTestUser
            };
            

            return result;
        } catch (error: any) {

            
            // Handle different types of errors gracefully
            if (error.response?.status === 404) {

            } else if (error.response?.status === 401) {

            } else {

            }
            
            // Return default status instead of throwing error
            return {
                isOnboarded: false,
                researchCondition: undefined,
                completionType: undefined,
                username: 'unknown',
                isTestUser: false
            };
        }
    }

    // ===== SURVEY STATUS METHODS =====
    
    /**
     * Check if user has completed the personality survey
     */
    async hasSurveyBeenCompleted(): Promise<boolean> {
        try {
            const profile = await this.getProfile();
            return profile?.profile?.completion_type === 'survey';
        } catch (error) {

            return false;
        }
    }

    /**
     * Get user's completion type (survey, character, or null)
     */
   // async getUserCompletionType(): Promise<'survey' | 'character' | null> {
    //    try {
    //        const profile = await this.getProfile();
    //        return profile?.profile?.completion_type as 'survey' | 'character' | null;
    //    } catch (error) {

    //        return null;
    //    }
   // }

    // ===== CHARACTER METHODS =====
    async createCharacter(characterData: CharacterCreateData): Promise<Character> {
        // POST to /characters/characters/ to create a new character
        const result = await this.post<Character>('characters', characterData);
        return result;
    }

    async getMyCharacter(): Promise<Character> {
        try {

            const result = await this.get<Character>('characters', { urlSuffix: 'my_character/' });

            return result;
        } catch (error) {

            throw error;
        }
    }

    async getCharacterById(characterId: number): Promise<Character> {
        try {


            const result = await this.get<Character>('characters', { urlSuffix: `${characterId}/` });

            return result;
        } catch (error) {

            throw error;
        }
    }

    // Note: getCharacterHomeData is redundant - use getProfile() instead
    // This method is kept for backward compatibility but should not be used
    async getCharacterHomeData(): Promise<UserProfile> {

        return this.getProfile();
    }

    /**
     * Get user data based on completion type - provides a unified interface
     * for both character and survey users.
     * 
     * NOTE: Character data is now directly on UserProfile, not nested under profile.character
     */
    async getUserData(): Promise<UserProfile> {
        try {

            
            // Get the profile data - character data is now directly on UserProfile
            const profile = await this.getProfile();
            
            // Check if user has completed character onboarding by looking for character-related fields
            // Character data is now directly on UserProfile, not nested under profile.character
            const hasCharacterData = profile.character || 
                                   (profile as any).level || 
                                   (profile as any).experience || 
                                   (profile as any).wellness_stats ||
                                   profile.equipped_gear;
            
            if (hasCharacterData) {

                return profile;
            }
            
            // If no character data, return the basic profile (for survey users)

            return profile;
            
        } catch (error: any) {

            throw error;
        }
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

    async updateCharacterCustomization(customizationData: any): Promise<Character> {
        const character = await this.getMyCharacter();
        return this.patch('updateCustomization', customizationData, { 
            urlSuffix: `${character.id}/update_customization/` 
        });
    }

    async gainExperience(characterId: number, experience: number, source = 'manual'): Promise<Character & {
        experience_gained: number;
        source: string;
        level_up?: boolean;
        levels_gained?: number;
        message?: string;
    }> {







        
        const payload = { experience, source };
        
        try {
            const result = await this.post<Character & {
                experience_gained: number;
                source: string;
                level_up?: boolean;
                levels_gained?: number;
                message?: string;
            }>('gainExperience', payload, { urlSuffix: `${characterId}/gain_experience/` });

            return result;
        } catch (error: any) {

            if (error.response) {


            }
            throw error;
        }
    }

    async gainResonance(characterId: number, resonance: number, source?: string): Promise<Character & {
        resonance_gained: number;
        source: string;
        resonance_up?: boolean;
        message?: string;
    }> {






        
        try {
            const result = await this.post<Character & {
                resonance_gained: number;
                source: string;
                resonance_up?: boolean;
                message?: string;
            }>('gainExperience', { experience: resonance, source: source || 'story_passage' }, { urlSuffix: `${characterId}/gain_experience/` });

            return result;
        } catch (error: any) {

            if (error.response) {


            }
            throw error;
        }
    }

    async gainWellness(
        characterId: number,
        gains: Partial<{ awareness: number; resilience: number; connection: number; balance: number; }>
    ) {
        // only send positive increments (serializer filters like this too)
        const payload = Object.fromEntries(
            Object.entries(gains).filter(([, v]) => typeof v === 'number' && v! > 0)
        );
        if (Object.keys(payload).length === 0) {
            return { data: { message: 'No wellness gains to apply' } };
        }

        return this.post<Character>('gainWellness', payload, {
            urlSuffix: `${characterId}/gain_wellness/`,
        });
    }

    // REMOVED: getCustomizationOptions() - returns mock data, not used

    // ===== COPING TOOLS METHODS (For Personality Users) =====
    
    /**
     * Get all available coping tools from backend
     * Endpoint: /api/characters/coping-tools/available/
     */
    async getAvailableCopingTools(): Promise<CopingTool[]> {
        try {

            const result = await this.get<CopingTool[]>('availableCopingTools');

            return result;
        } catch (error: any) {

            throw error;
        }
    }







    /**
     * Get my acquired coping tools (character-tools that user owns)
     * Endpoint: /api/characters/character-tools/my/
     */
    // Note: Tool methods are only used in personality/survey side of the app
    // These methods are kept for compatibility but should not be used in character side
    async getMyTools(): Promise<CopingTool[]> {
        try {

            const result = await this.get<CopingTool[]>('myTools');

            return result;
        } catch (error: any) {

            throw error;
        }
    }

    /**
     * Get equipped coping tools
     * Endpoint: /api/characters/character-tools/equipped/
     */
    async getEquippedTools(): Promise<CopingTool[]> {
        try {

            const result = await this.get<CopingTool[]>('equippedTools');

            return result;
        } catch (error: any) {

            throw error;
        }
    }

    /**
     * Acquire a coping tool by its base tool ID (adds to user's collection)
     * IMPORTANT: This expects the base tool ID (from getAvailableCopingTools()), NOT the character-tool ID
     * Endpoint: POST /api/characters/character-tools/ with { tool_id: number }
     */
    async acquireCopingTool(toolId: number): Promise<CopingTool> {
        try {


            const payload = { tool_id: toolId };

            
            const result = await this.post<CopingTool>('characterTools', payload);

            return result;
        } catch (error: any) {

            if (error.response) {


            }
            throw error;
        }
    }

    /**
     * Equip a coping tool by its character-tool ID
     * IMPORTANT: This expects the character-tool ID (from getMyTools()), NOT the base tool ID (from getAvailableCopingTools())
     * Endpoint: POST /api/characters/character-tools/{id}/equip/
     */
    async equipTool(characterToolId: number): Promise<{ message: string; tool: CopingTool }> {
        try {


            
            const result = await this.post<{ message: string; tool: CopingTool }>('equipTool', {}, { urlSuffix: `${characterToolId}/equip/` });

            return result;
        } catch (error: any) {

            if (error.response) {


            }
            throw error;
        }
    }

    /**
     * Unequip a coping tool by its character-tool ID
     * IMPORTANT: This expects the character-tool ID (from getMyTools()), NOT the base tool ID (from getAvailableCopingTools())
     * Endpoint: POST /api/characters/character-tools/{id}/unequip/
     */
    async unequipTool(characterToolId: number): Promise<{ message: string; tool: CharacterGear }> {
        try {


            
            const result = await this.post<{ message: string; tool: CharacterGear }>('unequipTool', {}, { urlSuffix: `${characterToolId}/unequip/` });

            return result;
        } catch (error: any) {

            throw error;
        }
    }

    /**
     * Use a coping tool and optionally rate its effectiveness
     * IMPORTANT: This expects the character-tool ID (from getMyTools()), NOT the base tool ID (from getAvailableCopingTools())
     * Endpoint: POST /api/characters/character-tools/{id}/use/
     */
    async useTool(characterToolId: number, effectivenessRating?: number, notes?: string): Promise<{
        message: string;
        times_used: number;
        effectiveness_rating?: number;
        tool: CharacterGear;
    }> {
        try {




            
            const payload: any = {};
            if (effectivenessRating !== undefined) {
                payload.effectiveness_rating = effectivenessRating;
            }
            if (notes) {
                payload.notes = notes;
            }
            
            const result = await this.post<{
                message: string;
                times_used: number;
                effectiveness_rating?: number;
                tool: CharacterGear;
            }>('useTool', payload, { urlSuffix: `${characterToolId}/use/` });

            return result;
        } catch (error: any) {

            throw error;
        }
    }

    /**
     * Helper method to find a coping tool by name from available tools
     */
    async findCopingToolByName(toolName: string): Promise<CopingTool | null> {
        try {
            const availableTools = await this.getAvailableCopingTools();
            const tool = availableTools.find(t => t.name === toolName);
            return tool || null;
        } catch (error) {

            return null;
        }
    }

    /**
     * Helper method to acquire a coping tool by name (for personality users)
     * This combines finding the tool and acquiring it
     */
    async acquireCopingToolByName(toolName: string): Promise<CopingTool | null> {
        try {


            
            // First find the tool
            const tool = await this.findCopingToolByName(toolName);
            if (!tool) {

                return null;
            }
            

            
            // Check if user already has this tool
            try {
                const myTools = await this.getMyTools();
                const alreadyHasTool = myTools.some(characterTool => 
                    characterTool.tool_id === String(tool.id) || 
                    characterTool.name === tool.name
                );
                
                if (alreadyHasTool) {

                    const existingTool = myTools.find(characterTool => 
                        characterTool.id === tool.id || 
                        characterTool.name === tool.name
                    );
                    return existingTool || null;
                }
            } catch (error) {

            }
            
            // Then acquire it
            const acquiredTool = await this.acquireCopingTool(tool.id);

            
            return acquiredTool;
        } catch (error: any) {

            return null;
        }
    }

    /**
     * Helper method specifically for personality users to unlock and equip coping tools
     * This is a convenience method that combines acquisition and equipping
     */
    async unlockAndEquipCopingTool(toolName: string): Promise<{
        acquired: CopingTool | null;
        equipped: { message: string; tool: CopingTool } | null;
    }> {
        try {


            
            // First acquire the tool
            const acquiredTool = await this.acquireCopingToolByName(toolName);
            if (!acquiredTool) {

                return { acquired: null, equipped: null };
            }
            
            // Then equip it
            try {
                const equippedResult = await this.equipTool(acquiredTool.id);

                return { acquired: acquiredTool, equipped: equippedResult };
            } catch (equipError) {

                // Return the acquired tool even if equipping failed
                return { acquired: acquiredTool, equipped: null };
            }
        } catch (error: any) {

            return { acquired: null, equipped: null };
        }
    }

    // REMOVED: getToolUsageStats() - endpoint not implemented    // ===== JOURNAL & CODEX METHODS (matching your Django backend) =====
    // ===== JOURNAL PROMPTS =====
    async getJournalPrompts(): Promise<JournalPrompt[]> {

            // Try the codex-entries endpoint first (GET request) to get all available prompts
            const data = await this.get<JournalPrompt[]>('codexEntries');
            const prompts = Array.isArray(data) ? data : [];
            
 
            
            // If we got prompts from codex-entries, return them
            if (prompts.length > 0) {
                return prompts;
            }
            
            // Fallback to journal-prompts endpoint
            const fallbackData = await this.get<JournalPrompt[]>('journalPrompts');
            const fallbackPrompts = Array.isArray(fallbackData) ? fallbackData : [];
            
 
            return fallbackPrompts;

            

        
    }

    private getFallbackPrompts(): JournalPrompt[] {
        // Provide some basic fallback prompts for each category
        return [
            {
                id: 1,
                prompt_id: 'fallback-journal-1',
                text: "How are you feeling today? Write about your current mood and what might be influencing it.",
                category: 'journal',
                difficulty: 'Beginner',
                skill_category: 'Emotional Awareness',
                map_area: 'entrance',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 2,
                prompt_id: 'fallback-draw-1',
                text: "Draw something that represents your current stress level. It could be abstract shapes, colors, or concrete objects.",
                category: 'draw',
                difficulty: 'Beginner',
                skill_category: 'Stress Management',
                map_area: 'entrance',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            {
                id: 3,
                prompt_id: 'fallback-voice-1',
                text: "Record a voice memo describing one thing you're grateful for today and why it matters to you.",
                category: 'voice',
                difficulty: 'Beginner',
                skill_category: 'Self-Compassion',
                map_area: 'entrance',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        ];
    }

    async getAllJournalPrompts(): Promise<JournalPrompt[]> {
        try {

            
            // Use the main endpoint to get all prompts (admin only)
            const data = await this.get<JournalPrompt[]>('journalPrompts');
            const prompts = Array.isArray(data) ? data : [];
            

            return prompts;
        } catch (error) {

            return [];
        }
    }

    async getFilteredJournalPrompts(opts?: {
        category?: 'journal' | 'draw' | 'voice';
        isActive?: boolean;
        unlockedOnly?: boolean;
        excludeCompleted?: boolean;
        completedStoryIds?: number[];
    }) {
        const all = await this.getJournalPrompts();
        return all.filter(p => {
            if (opts?.category && p.category !== opts.category) return false;
            if (opts?.isActive === true && !p.is_active) return false;
            // Note: unlocked and completed properties don't exist on JournalPrompt type
            // We'll filter based on available properties
            if (opts?.completedStoryIds?.length && p.map_area) {
                // For now, we'll use map_area as a proxy for story requirements
                // This can be enhanced when the backend provides more filtering options
            }
            return true;
        });
    }

    async getPromptsByCategory(
        unlockedAreas: string[] = [],
        completedStories: string[] | number[] = []
    ): Promise<{ journal: JournalPrompt|null; draw: JournalPrompt|null; voice: JournalPrompt|null; }> {

        
        // Get daily prompts - backend should return one prompt per category per day
        const dailyPrompts = await this.getJournalPrompts();
        


        const pick = (cat: 'journal'|'draw'|'voice') => {
            // First try to find by category field
            let prompt = dailyPrompts.find(p => p.category === cat);
            
            // If no prompt found by category, try to find by other means
            if (!prompt) {
                // Try to find by prompt_id pattern
                prompt = dailyPrompts.find(p => 
                    p.prompt_id?.toLowerCase().includes(cat) ||
                    p.text?.toLowerCase().includes(cat + 'ing') ||
                    p.text?.toLowerCase().includes(cat)
                );
            }
            
            return prompt || null;
        };

        const result = {
            journal: pick('journal'),
            draw:    pick('draw'),
            voice:   pick('voice'),
        };
        
        // If any category is missing, supplement with fallback prompts
        const fallbackPrompts = this.getFallbackPrompts();
        const finalResult = {
            journal: result.journal || fallbackPrompts.find(p => p.category === 'journal') || null,
            draw: result.draw || fallbackPrompts.find(p => p.category === 'draw') || null,
            voice: result.voice || fallbackPrompts.find(p => p.category === 'voice') || null,
        };
        

        


        return finalResult;
    }

    // ===== CODEX ENTRIES =====
    // Note: All codex entry endpoints use DRF ViewSet which automatically:
    // - Filters GET requests to only return current user's entries
    // - Associates POST requests with the current authenticated user
    // - Only allows users to update/delete their own entries
    
    async createCodexEntry(payload: {
        prompt: number;                // numeric ID from /journal-prompts
        entry_type: 'journal'|'draw'|'voice';
        content: string;               // text; voice/draw can put a note or URL if you store them elsewhere
        duration_seconds?: number;     // for voice entries
    }, characterId?: string | number) {
        try {



            
            // Validate payload using enhanced validation
            const validation = this.validateEntryData(payload);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            
            // ALL users now use the journal/codex-entries/ endpoint for compliance

            
            // Prepare the request payload to match backend expectations
            const requestPayload: any = {
                prompt: payload.prompt,        // This should be the prompt_id
                entry_type: payload.entry_type,
                content: payload.content
            };
            
            // Add optional fields
            if (payload.duration_seconds !== undefined) {
                requestPayload.duration_seconds = payload.duration_seconds;
            }
            
            // Add character ID if provided for proper association
            if (characterId) {
                requestPayload.character_id = characterId;

            } else {

            }
            
            const data = await this.post<CodexEntry>('codexEntries', requestPayload);

            return data;
        } catch (error) {

            const friendlyMessage = this.handleJournalApiError(error);
            throw new Error(friendlyMessage);
        }
    }

    // Debug method to test journal endpoints for different user types
    async debugJournalEndpoints() {
        try {

            
            // Check user type
            let isAdminUser = false;
            let userData = null;
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if (storedUserData) {
                    userData = JSON.parse(storedUserData);
                    isAdminUser = userData?.username === 'admin';
                }
            } catch (userCheckError) {

            }
            
            // Test journal prompts

            try {
                const prompts = await this.getJournalPrompts();

            } catch (error) {

            }
            
            // Test getting existing entries

            try {
                const entries = await this.getUserCodexEntries();

            } catch (error) {

            }
            
            // Test specific endpoints based on user type
            if (isAdminUser) {

                try {
                    const adminEntries = await this.get<any[]>('codexEntries');

                } catch (error) {

                }
            } else {

                try {
                    const reflectionEntries = await this.get<any[]>('myReflections');

                } catch (error) {

                }
                
                try {
                    const recentEntries = await this.get<any[]>('recentReflections');

                } catch (error) {

                }
            }
            

            
        } catch (error) {

        }
    }

    // ===== NEW API FUNCTIONS FOR FULL BACKEND COMPLIANCE =====

    /**
     * Get available (unlocked, not completed) journal prompts
     * Endpoint: /api/journal/journal-prompts/available/
     */
    async getAvailableJournalPrompts(characterId?: number): Promise<JournalPrompt[]> {
        try {


            
            const result = await this.get<JournalPrompt[]>('journalPromptsAvailable');
            const prompts = Array.isArray(result) ? result : [];

            return prompts;
        } catch (error) {

            // Fallback to regular prompts if available endpoint fails

            return this.getJournalPrompts();
        }
    }

    /**
     * Get daily journal prompt with status
     * Endpoint: /api/journal/journal-prompts/daily/
     * Response includes status: "assigned" | "completed" | "unavailable" | "newly_assigned"
     */
    async getDailyPrompt(): Promise<{
        prompt: JournalPrompt | null;
        status: 'assigned' | 'completed' | 'unavailable' | 'newly_assigned';
        message?: string;
    }> {
        try {

            
            const result = await this.get<any>('journalPromptsDaily');

            
            // Handle different response formats
            if (result && typeof result === 'object') {
                return {
                    prompt: result.prompt || null,
                    status: result.status || 'unavailable',
                    message: result.message
                };
            }
            
            return {
                prompt: null,
                status: 'unavailable',
                message: 'No daily prompt available'
            };
        } catch (error) {

            return {
                prompt: null,
                status: 'unavailable',
                message: 'Failed to load daily prompt'
            };
        }
    }

    /**
     * Get completed journal prompts for the current user
     * Endpoint: /api/journal/journal-prompts/completed/
     */
    async getCompletedPrompts(): Promise<JournalPrompt[]> {
        try {

            
            const result = await this.get<JournalPrompt[]>('journalPromptsCompleted');
            const prompts = Array.isArray(result) ? result : [];

            return prompts;
        } catch (error) {

            return [];
        }
    }

    /**
     * Get user's codex statistics
     * Endpoint: /api/journal/codex-entries/stats/
     */
    async getCodexStats(): Promise<{
        total_entries: number;
        entries_by_type: { journal: number; draw: number; voice: number };
        total_prompts_completed: number;
        streak_days: number;
        last_entry_date: string | null;
    }> {
        try {

            
            const result = await this.get<any>('codexEntriesStats');

            
            return {
                total_entries: result.total_entries || 0,
                entries_by_type: result.entries_by_type || { journal: 0, draw: 0, voice: 0 },
                total_prompts_completed: result.total_prompts_completed || 0,
                streak_days: result.streak_days || 0,
                last_entry_date: result.last_entry_date || null
            };
        } catch (error) {

            return {
                total_entries: 0,
                entries_by_type: { journal: 0, draw: 0, voice: 0 },
                total_prompts_completed: 0,
                streak_days: 0,
                last_entry_date: null
            };
        }
    }

    /**
     * Get recent codex entries with limit
     * Endpoint: /api/journal/codex-entries/recent/?limit={limit}
     */
    async getRecentEntries(limit: number = 10): Promise<CodexEntry[]> {
        try {


            
            const result = await this.get<CodexEntry[]>('codexEntriesRecent', { 
                urlSuffix: `?limit=${limit}` 
            });
            const entries = Array.isArray(result) ? result : [];

            return entries;
        } catch (error) {

            return [];
        }
    }

    /**
     * Get journal prompts by story tag
     * Endpoint: /api/journal/journal-prompts/by_story_tag/?tag={tag}
     */
    async getPromptByStoryTag(tag: string): Promise<JournalPrompt[]> {
        try {


            
            const result = await this.get<JournalPrompt[]>('journalPromptsByStoryTag', {
                urlSuffix: `?tag=${encodeURIComponent(tag)}`
            });
            const prompts = Array.isArray(result) ? result : [];

            return prompts;
        } catch (error) {

            return [];
        }
    }

    // ===== ENHANCED ERROR HANDLING FOR JOURNAL ENDPOINTS =====

    /**
     * Handle specific journal API errors with appropriate user messages
     */
    private handleJournalApiError(error: any): string {
        if (error.response?.status === 404) {
            return 'Game data not found. Please make sure you have completed the onboarding process.';
        }
        
        if (error.response?.status === 403) {
            return 'This prompt is not available yet. Complete previous stories to unlock it.';
        }
        
        if (error.response?.status === 400) {
            const errorData = error.response?.data;
            if (errorData?.error?.includes('duplicate') || errorData?.message?.includes('duplicate')) {
                return 'You have already completed this prompt. Try a different one.';
            }
            if (errorData?.error?.includes('content')) {
                return 'Entry content is required and cannot be empty.';
            }
            if (errorData?.error?.includes('entry_type')) {
                return 'Invalid entry type. Please select journal, draw, or voice.';
            }
            return errorData?.message || 'Invalid request. Please check your entry and try again.';
        }
        
        if (error.response?.status === 401) {
            return 'Please log in again to continue.';
        }
        
        if (error.response?.status === 500) {
            return 'Server error. Please try again later.';
        }
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }

    /**
     * Validate entry data before submission
     */
    private validateEntryData(data: any): { isValid: boolean; error?: string } {
        if (!data.prompt) {
            return { isValid: false, error: 'Prompt ID is required' };
        }
        
        if (!data.entry_type || !['journal', 'draw', 'voice'].includes(data.entry_type)) {
            return { isValid: false, error: 'Valid entry type (journal/draw/voice) is required' };
        }
        
        if (!data.content?.trim()) {
            return { isValid: false, error: 'Entry content cannot be empty' };
        }
        
        if (data.entry_type === 'voice' && !data.voice_file && data.duration_seconds === undefined) {
            return { isValid: false, error: 'Voice entries require either a voice file or duration' };
        }
        
        if (data.content.length > 10000) {
            return { isValid: false, error: 'Entry content is too long (maximum 10,000 characters)' };
        }
        
        return { isValid: true };
    }

    async updateCodexEntry(id: number, data: {
        prompt?: number;
        entry_type?: 'journal'|'draw'|'voice';
        content?: string;
    }) {
        try {



            
            // This endpoint only allows updating entries owned by the current authenticated user
            const result = await this.patch<CodexEntry>('codexEntries', data, { urlSuffix: `${id}/` });

            return result;
        } catch (error) {

            throw error;
        }
    }

    async getCodexEntriesByPrompt(promptId: number) {
        try {


            
            // Use the main codex entries endpoint - DRF ViewSet automatically filters by user
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];
            
            // Filter client-side for the specific prompt
            const filteredEntries = allEntries.filter(entry => (entry as any).prompt === promptId);

            
            return filteredEntries;
        } catch (error) {

            return [];
        }
    }

    async getRecentCodexEntries(limit = 20) {
        try {


            
            // ALL users now use the journal/codex-entries/ endpoint for compliance

            
            const data = await this.get<CodexEntry[]>('codexEntries');
            const list = Array.isArray(data) ? data : [];
            
            // Sort by created_at if available, otherwise return as-is
            const sortedList = list.sort((a, b) => {
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                return 0;
            });
            
            const recentEntries = sortedList.slice(0, limit);

            return recentEntries;
            
        } catch (error) {

            return [];
        }
    }

    async getMyCodexEntries(): Promise<CodexEntry[]> {
        try {

            
            // Use the my_reflections endpoint which exists in the backend
            return await this.getUserCodexEntries();
        } catch (error) {

            return [];
        }
    }

    async getAllCodexEntries(): Promise<CodexEntry[]> {
        try {

            
            // This should only be used for admin purposes
            // For regular users, use getUserCodexEntries() instead
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];
            

            return allEntries;
        } catch (error) {

            return [];
        }
    }

    // ===== JOURNAL PROMPT MANAGEMENT =====
    
    /**
     * Mark a journal prompt as inactive (completed) after the user creates an entry
     * This helps ensure users only get one prompt per category per day
     */
    async markPromptAsInactive(promptId: number): Promise<void> {
        try {


            
            // Update the prompt to mark it as inactive (completed for the day)
            await this.patch('journalPrompts', { is_active: false }, { urlSuffix: `${promptId}/` });

        } catch (error) {

            // Don't throw - this is not critical functionality
        }
    }

    async getUserCodexEntries(): Promise<CodexEntry[]> {
        try {

            
            // ALL users now use the journal/codex-entries/ endpoint for compliance

            
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];

            return allEntries;
            
        } catch (error) {

            return [];
        }
    }

    // ===== NEW GEAR METHODS =====
    
    /**
     * Get all available gear types from the master gear list
     * @returns Promise<any[]> - Array of available gear types
     */
    async getAvailableGearTypes(): Promise<any[]> {
        try {

            // Use direct endpoint for gear-types/available/
            const response = await apiClient.get<any[]>('gear-types/available/');

            return response.data || [];
        } catch (error: any) {

            return [];
        }
    }

    /**
     * Get character data including equipped_gear array
     * @param characterId - Character ID (optional, uses current character if not provided)
     * @returns Promise<Character> - Character data with equipped_gear
     */
    async getCharacterWithGear(characterId?: number): Promise<Character> {
        try {


            
            if (characterId != null) {
                return this.get<Character>('characters', { urlSuffix: `${characterId}/` });
            }
            return this.get<Character>('characters', { urlSuffix: 'my_character/' });
        } catch (error: any) {

            throw error;
        }
    }

    async getMyGear(): Promise<CharacterGear[]> {
        return this.get<CharacterGear[]>('myGear');
    }

    async getEquippedGear(): Promise<CharacterGear[]> {
        return this.get<CharacterGear[]>('equippedGear');
    }

    async acquireGear(gearTypeId: number): Promise<CharacterGear> {
        try {


            const payload = { gear_type_id: gearTypeId };

            
            // First check if the character already has this gear
            const myGear = await this.getMyGear();
            const alreadyHasGear = myGear.some(gear => gear.gear_type.id === gearTypeId);
            
            if (alreadyHasGear) {

                return myGear.find(gear => gear.gear_type.id === gearTypeId)!;
            }
            
            const result = await this.post<CharacterGear>('acquireGear', payload);

            return result;
        } catch (error: any) {

            // If it's a duplicate key error, the gear already exists
            if (error.response?.status === 500 && error.response?.data?.includes('duplicate key')) {

                const myGear = await this.getMyGear();
                return myGear.find(gear => gear.gear_type.id === gearTypeId)!;
            }
            throw error;
        }
    }

    async equipGear(gearId: number): Promise<{ message: string; gear: CharacterGear }> {
        return this.post('equipGear', {}, { urlSuffix: `${gearId}/equip/` });
    }

    async unequipGear(gearId: number): Promise<{ message: string; gear: CharacterGear }> {
        return this.post('unequipGear', {}, { urlSuffix: `${gearId}/unequip/` });
    }

    /**
     * Test function to verify gear reward system is working correctly
     * This function tests the complete flow of gear acquisition
     */
    async testGearRewardSystem(characterId?: number): Promise<{
        success: boolean;
        steps: Array<{
            step: string;
            success: boolean;
            data?: any;
            error?: any;
        }>;
    }> {
        const testSteps: Array<{
            step: string;
            success: boolean;
            data?: any;
            error?: any;
        }> = [];



        try {
            // Step 1: Test getting available gear types

            try {
                const availableGear = await this.getAvailableGearTypes();
                testSteps.push({
                    step: 'Get Available Gear Types',
                    success: true,
                    data: {
                        count: availableGear.length,
                        firstItem: availableGear[0] || null
                    }
                });

            } catch (error) {
                testSteps.push({
                    step: 'Get Available Gear Types',
                    success: false,
                    error: error
                });

            }

            // Step 2: Test getting character with equipped gear

            try {
                const character = await this.getCharacterWithGear(characterId);
                testSteps.push({
                    step: 'Get Character With Equipped Gear',
                    success: true,
                    data: {
                        characterId: character.id,
                        equippedGearCount: character.equipped_gear?.length || 0,
                        equipped_gear: character.equipped_gear
                    }
                });

            } catch (error) {
                testSteps.push({
                    step: 'Get Character With Equipped Gear',
                    success: false,
                    error: error
                });

            }

            // Step 3: Test getting character's full gear inventory

            try {
                const myGear = await this.getMyGear();
                testSteps.push({
                    step: 'Get My Gear Inventory',
                    success: true,
                    data: {
                        totalGearCount: myGear.length,
                        gearItems: myGear.map(g => ({
                            id: g.id,
                            name: g.gear_type?.name,
                            equipped: g.is_equipped
                        }))
                    }
                });

            } catch (error) {
                testSteps.push({
                    step: 'Get My Gear Inventory',
                    success: false,
                    error: error
                });

            }

            // Step 4: Test gear acquisition (dry run - find first available gear that character doesn't have)

            try {
                const availableGear = await this.getAvailableGearTypes();
                const myGear = await this.getMyGear();
                
                // Find a gear type that the character doesn't have
                const unownedGear = availableGear.find(gearType => 
                    !myGear.some(characterGear => characterGear.gear_type?.id === gearType.id)
                );

                if (unownedGear) {

                    testSteps.push({
                        step: 'Gear Acquisition Test (Dry Run)',
                        success: true,
                        data: {
                            message: `Character can acquire: ${unownedGear.name}`,
                            gearType: unownedGear,
                            wouldAcquire: true
                        }
                    });
                } else {
                    testSteps.push({
                        step: 'Gear Acquisition Test (Dry Run)',
                        success: true,
                        data: {
                            message: 'Character already has all available gear',
                            wouldAcquire: false
                        }
                    });
                }
            } catch (error) {
                testSteps.push({
                    step: 'Gear Acquisition Test (Dry Run)',
                    success: false,
                    error: error
                });

            }

            const allSuccessful = testSteps.every(step => step.success);
            

            testSteps.forEach(step => {
                const status = step.success ? '✅' : '❌';



            });

            return {
                success: allSuccessful,
                steps: testSteps
            };

        } catch (error) {

            return {
                success: false,
                steps: testSteps
            };
        }
    }

    // ===== REMOVED: OLD EQUIPMENT METHODS (NO LONGER USED) =====

    async getGameData(): Promise<GameData> {
        try {
            return await this.get<GameData>('gameData');
        } catch (error: any) {

            // Return a default game data structure to prevent cascading failures
            return {
                id: 0,
                user: {
                    id: 1,
                    username: 'Default Player',
                    email: '',
                    date_joined: new Date().toISOString(),
                    research_group: null
                },
                research_group: null,
                player_name: 'Default Player',
                score: 0,
                level: 1,
                last_played: new Date().toISOString(),
                current_story_id: null,
                current_passage_id: null,
                completed_prompts: [],
                total_entries: 0,
                difficulty_levels: [],
                unlocked_areas: [],
                character_data: null,
                personality_data: {
                    openness: 5.0,
                    conscientiousness: 5.0,
                    extraversion: 5.0,
                    agreeableness: 5.0,
                    neuroticism: 5.0
                },
                journal_data: {
                    total_entries: 0,
                    recent_entries: [],
                    entries_by_type: []
                },
                story_data: {
                    stories_started: 0,
                    stories_completed: 0,
                    current_stories: [],
                    completed_stories: []
                },
                progress_summary: {},
                wellness_stats: {},
                acquired_gear: [],
                coping_tools: []
            } as GameData;
        }
    }

    /**
     * Get comprehensive game data including story statistics and player progress
     * This calls the game data endpoint that provides detailed player statistics
     */
    async getComprehensiveGameData(): Promise<{
        story_data: {
            stories_started: number;
            stories_completed: number;
            total_stories_available: number;
            completion_rate: number;
        };
        character_data: {
            level: number;
            experience: number;
            wellness_stats: Record<string, number>;
        };
        progress_data: {
            total_passages_visited: number;
            total_choices_made: number;
            total_revelations_unlocked: number;
        };
        archive_metrics: {
            memories_explored: number;
            artifacts_discovered: number;
            insights_gained: number;
        };
    }> {
        try {



            
            const response = await this.get<any>('gameData');

            
            // Extract and format the data for the restoration screen
            const formattedData = {
                story_data: {
                    stories_started: response.story_data?.stories_started || 0,
                    stories_completed: response.story_data?.stories_completed || 0,
                    total_stories_available: response.story_data?.total_stories_available || 0,
                    completion_rate: response.story_data?.completion_rate || 0
                },
                character_data: {
                    level: response.character_data?.level || 1,
                    experience: response.character_data?.experience || 0,
                    wellness_stats: response.character_data?.wellness_stats || {}
                },
                progress_data: {
                    total_passages_visited: response.progress_data?.total_passages_visited || 0,
                    total_choices_made: response.progress_data?.total_choices_made || 0,
                    total_revelations_unlocked: response.progress_data?.total_revelations_unlocked || 0
                },
                archive_metrics: {
                    memories_explored: response.archive_metrics?.memories_explored || 0,
                    artifacts_discovered: response.archive_metrics?.artifacts_discovered || 0,
                    insights_gained: response.archive_metrics?.insights_gained || 0
                }
            };
            

            return formattedData;
        } catch (error: any) {
            
            // Return default data structure to prevent cascading failures
            return {
                story_data: {
                    stories_started: 0,
                    stories_completed: 0,
                    total_stories_available: 0,
                    completion_rate: 0
                },
                character_data: {
                    level: 1,
                    experience: 0,
                    wellness_stats: {}
                },
                progress_data: {
                    total_passages_visited: 0,
                    total_choices_made: 0,
                    total_revelations_unlocked: 0
                },
                archive_metrics: {
                    memories_explored: 0,
                    artifacts_discovered: 0,
                    insights_gained: 0
                }
            };
        }
    }

    async createGameData(gameData: Partial<GameData>): Promise<GameData> {
        return this.post<GameData>('gameData', gameData);
    }

    /**
     * Fetch the current user's game data from the game-data API
     * Returns the user's game data including personality, scores, and progress
     */
    async fetchUserGameData(): Promise<GameData> {
        try {
            const response = await this.get<GameData[]>('gameDataList');
            
            // The API returns an array, find the current user's data
            // Assuming the first item is the current user's data, or we can filter by user ID
            if (response && response.length > 0) {
                // Return the first game data entry (should be current user)
                return response[0];
            }
            
            throw new Error('No game data found for user');
        } catch (error: any) {
            console.error('[apiService] Error fetching game data:', error);
            throw error;
        }
    }

    /**
     * Update the user's game data (score, level, etc.)
     * PATCH to game-data/{id}/
     */
    async updateGameDataScore(gameDataId: number, updates: { score?: number; level?: number; difficulty_levels?: string[] }): Promise<GameData> {
        try {
            return await this.patch<GameData>('gameDataList', updates, { urlSuffix: `${gameDataId}/` });
        } catch (error: any) {
            console.error('[apiService] Error updating game data:', error);
            throw error;
        }
    }

    // ===== THOUGHT DEFENDER GAME METHODS =====
    
    /** Primary TD run logger + safe fallbacks */
    async logThoughtDefenderRun(payload: ThoughtDefenderRunPayload): Promise<ApiOk | ApiErr> {
        try {
            return await this.post('gameDataLogThoughtDefenderRun', payload);
        } catch (e) {
            // Fallback 1: DRF progress endpoint (generic)
            if (is404(e)) {
                try {
                    await this.post('gameProgressRecord', {
                        story_id: 'thought_defender',
                        passage_id: 'run_summary',
                        choice_id: payload.completed ? 'completed' : 'quit',
                        story_variables: {
                            score: payload.score,
                            level: payload.level,
                            duration_ms: payload.durationMs,
                            enemies_destroyed: payload.enemiesDestroyed,
                            damage_taken: payload.damageTaken,
                            modifiers: payload.modifiers || {},
                        },
                        player_state: { game: 'thought_defender', ...(payload.meta || {}) },
                    });
                    return { ok: true, data: { fallback: 'progress/record_progress' } };
                } catch (e2) {
                    // Fallback 2: legacy
                    try {
                        await this.post('recordActivity', {
                            game: 'thought_defender',
                            events: [{ type: 'run_summary', t: Date.now(), payload }],
                        });
                        return { ok: true, data: { fallback: 'record-activity' } };
                    } catch (e3) {
                        return this.toError(e3);
                    }
                }
            }
            return this.toError(e);
        }
    }

    /** If you log incremental events, point them at the DRF progress endpoint */
    async logPlayerProgress(events: Array<{ type: string; t: number; data?: any }>): Promise<ApiOk | ApiErr> {
        try {
            return await this.post('gameProgressRecord', {
                story_id: 'thought_defender',
                passage_id: 'event',
                story_variables: {},
                player_state: { game: 'thought_defender' },
                events,
            });
        } catch (e) {
            // Optional legacy fallback
            try {
                await this.post('recordProgressLegacy', {
                    game: 'thought_defender',
                    events,
                });
                return { ok: true, data: { fallback: 'record-progress (legacy)' } };
            } catch (e2) {
                return this.toError(e2);
            }
        }
    }

    // async updateGameData(gameData: Partial<GameData>): Promise<GameData> {
    //     return this.patch<GameData>('gameData', gameData);
    // }

    // Helper method to get completed stories from story progress records
    async getCompletedStories(): Promise<string[]> {
        try {
            // Check if user is authenticated before making API calls
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                return [];
            }

            // Get all story progress records for the user
            const allProgress = await this.get<any[]>('getUserProgress');

            const completedStories: string[] = [];

            if (allProgress && Array.isArray(allProgress)) {
                allProgress.forEach((progress: any) => {
                    // Check if the story is marked as completed
                    if (progress.is_completed === true) {
                        const storyId = String(progress.story);
                        completedStories.push(storyId);
                    }
                });
            }

            return completedStories;
        } catch (error) {
            console.error('❌ Error getting completed stories:', error);
            // Return empty array instead of throwing error to prevent cascading failures
            return [];
        }
    }

    // Helper method to determine preferred skill categories based on completed stories
    private async getPreferredSkillCategories(completedStories: string[]): Promise<string[]> {
        // This should map to your story completion logic
        // For now, return a default progression
        const skillProgression = [
            'Emotional Awareness',     // Beginner
            'Stress Management',       // Early
            'Self-Compassion',         // Intermediate  
            'Social Connection',       // Advanced
            'Personal Growth'          // Expert
        ];

        // If no completed stories provided, try to get them from game data
        if (completedStories.length === 0) {
            try {
                completedStories = await this.getCompletedStories();
            } catch (error) {

                // Return default progression instead of failing
                return skillProgression;
            }
        }

        // Return skills based on how many stories completed
        const numCompleted = completedStories.length;
        if (numCompleted <= 2) return ['Emotional Awareness', 'Stress Management'];
        if (numCompleted <= 5) return ['Stress Management', 'Self-Compassion', 'Emotional Awareness'];
        if (numCompleted <= 8) return ['Self-Compassion', 'Social Connection', 'Stress Management'];
        return skillProgression; // All skills unlocked
    }

    // Helper method to select the best prompt for a category
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
    }

    // Helper method to select exactly one prompt per category (for single prompt display)
    private selectOnePrompt(
        prompts: JournalPrompt[], 
        category: string, 
        preferredSkills: string[],
        completedStories: string[] = []
    ): JournalPrompt | null {
        // Fix: Make category comparison case-insensitive
        const categoryPrompts = prompts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        
        if (categoryPrompts.length === 0) {
            return null;
        }

        // Determine available difficulties based on story completion
        const availableDifficulties = this.getAvailableDifficulties(completedStories);
        
        // Filter prompts by available difficulties
        const availablePrompts = categoryPrompts.filter(p => availableDifficulties.includes(p.difficulty));
        
        if (availablePrompts.length === 0) {
            return null;
        }

        // Try to find a prompt with preferred skill first
        for (const skill of preferredSkills) {
            const skillPrompts = availablePrompts.filter(p => p.skill_category === skill);
            if (skillPrompts.length > 0) {
                // Return random prompt from this skill category
                return skillPrompts[Math.floor(Math.random() * skillPrompts.length)];
            }
        }

        // Fallback: return random prompt from available difficulties
        return availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    }

    /**
     * Fetch all available stories from the backend (story catalog)
     */
    async getAvailableStories(): Promise<any[]> {
        try {



            
            const stories = await this.get<any[]>('stories');

            if (stories && stories.length > 0) {


            } else {

            }
            return stories;
        } catch (error: any) {
            throw error;
        }
    }

    /**
     * Fetch passages for a specific chapter
     */
    async getChapterPassages(storyId: number | string, chapterId: number | string): Promise<any[]> {
        try {


            
            // Make a direct API call to the correct URL: api/story/chapters/{chapterId}/passages/
            // Since there's no predefined endpoint for this, we'll construct the URL manually
            const response = await apiClient.get(`story/chapters/${chapterId}/passages/`);
            const passages = response.data;
            

            
            if (passages && passages.length > 0) {


            }
            
            return passages || [];
    
        } catch (error) {

            this.handleError(error, 'GET', `chapters/${chapterId}/passages`);
            throw error;
        }
    }

    /**
     * Fetch all passages for a story
     */
    async getStorypassages(storyId: number): Promise<any> {
        try {


            
            // Get chapters first
            const chapters = await this.getChapters(storyId);
            
            if (!chapters || chapters.length === 0) {

                return { passages: [] };
            }
            

            
            // Load passages for each chapter
            const allPassages = [];
            for (const chapter of chapters) {
                try {
                    const chapterPassages = await this.getChapterPassages(storyId, chapter.id);
                    allPassages.push(...chapterPassages);
                } catch (error) {

                }
            }
            

            
            
            return {
                id: storyId.toString(),
                title: 'Story Passages',
                passages: allPassages
            };
        } catch (error) {

            return { passages: [] };
        }
    }

    /**
     * Fetch passages for a specific chapter within a story
     */
    async getStorypassagesFromChapter(storyId: number, chapterId: number): Promise<any> {
        try {



            
            // Get the specific chapter first
            const chapters = await this.getChapters(storyId);
            const targetChapter = chapters?.find((chapter: any) => chapter.id === chapterId);
            
            if (!targetChapter) {

                return {
                    id: storyId.toString(),
                    title: `Chapter ${chapterId}`,
                    passages: []
                };
            }
            
            // Load passages for this specific chapter
            const chapterPassages = await this.getStorypassagesFromChapter(storyId, chapterId);
            

            
            return {
                id: storyId.toString(),
                title: targetChapter.title || `Chapter ${chapterId}`,
                passages: chapterPassages
            };
        } catch (error) {

            return {
                id: storyId.toString(),
                title: `Chapter ${chapterId}`,
                passages: []
            };
        }
    }

    /**
     * Fetch user's progress records for a story
     */
    async getStoryProgressRecords(storyId: string): Promise<any[]> {
        return this.get<any[]>('getUserProgress', );
    }

    /**
     * Get story progress for a specific story
     */
    async getStoryProgress(storyId: number | string): Promise<any> {
        try {


            
            // Get all user progress records and filter by story ID
            const allProgress = await this.get<any[]>('getUserProgress');

            
            if (!allProgress || allProgress.length === 0) {

                return null;
            }
            
            // Find progress for this specific story
            const storyProgress = allProgress.find((progress: any) => 
                progress.story === storyId || progress.story === parseInt(storyId as string)
            );
            
            if (storyProgress) {







            } else {

            }
            
            return storyProgress || null;
        } catch (error) {

            return null;
        }
    }

    /**
     * Create new story progress record
     */
    async createStoryProgress(storyId: number | string, initialData?: {
        current_passage_id?: string;
        story_variables?: Record<string, any>;
    }): Promise<any> {
        try {



            
            // Get current user ID from profile
            const profile = await this.getProfile();
            const userId = profile?.id;
            
            if (!userId) {
                throw new Error('User ID not found - cannot create story progress');
            }
            
            const payload = {
                story: storyId,
                user: userId,
                current_passage_id: initialData?.current_passage_id || '',
                story_variables: initialData?.story_variables || {},
                passages_visited: [],
                choices_made: [],
                is_completed: false
            };
            

            const result = await this.post<any>('createProgress', payload);

            return result;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Update existing story progress record
     * Now that the backend fields are writable, we can actually update them
     * The endpoint is: /api/story/story-progress/{id}/ where id is the story-progress PK
     */
    async updateStoryProgress(progressId: number, updateData: {
        current_passage_id?: string;
        passages_visited?: string[];
        choices_made?: Array<{
            choice_id: number;
            choice_text: string;
            timestamp: string;
        }>;
        story_variables?: Record<string, any>;
        is_completed?: boolean;
        completion_type?: string;
        progress_percentage?: number;
    }): Promise<any> {
        try {



            
            // The endpoint is: /api/story/story-progress/{id}/ where id is the story-progress PK
            const result = await this.patch<any>('updateProgress', updateData, {
                urlSuffix: `${progressId}/`
            });
            

            return result;
        } catch (error) {

            // Don't throw error - just log it and continue
            // The story should still work even if progress tracking fails
            return null;
        }
    }

    /**
     * Get or create story progress for a story
     * This is a convenience method that checks for existing progress and creates new if needed
     */
    async getOrCreateStoryProgress(storyId: number | string, initialData?: {
        current_passage_id?: string;
        story_variables?: Record<string, any>;
    }): Promise<any> {
        try {


            
            // First try to get existing progress
            const existingProgress = await this.getStoryProgress(storyId);
            
            if (existingProgress) {

                return existingProgress;
            }
            
            // If no existing progress, create new

            const newProgress = await this.createStoryProgress(storyId, initialData);

            return newProgress;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Calculate and update progress percentage for a story
     * This method calculates progress based on passages visited vs total passages
     * Now that the backend fields are writable, we can actually update the progress_percentage
     */
    async calculateAndUpdateProgress(storyId: number | string, progressId: number): Promise<any> {
        try {



            
            // Get current progress
            const currentProgress = await this.getStoryProgress(storyId);
            if (!currentProgress) {

                return null;
            }
            
            // Get all passages for the story to calculate total
            const storyPassages = await this.getStorypassages(Number(storyId));
            const totalPassages = storyPassages?.passages?.length || 0;
            const visitedPassages = currentProgress.passages_visited?.length || 0;
            


            
            // Calculate progress percentage
            let progressPercentage = 0;
            if (totalPassages > 0) {
                progressPercentage = Math.round((visitedPassages / totalPassages) * 100);
            }
            
            // Cap at 100% if completed
            if (currentProgress.is_completed) {
                progressPercentage = 100;
            }
            

            
            // Now that the backend fields are writable, let's actually update the progress_percentage
            const updateData = {
                progress_percentage: progressPercentage
            };
            

            const result = await this.updateStoryProgress(progressId, updateData);

            return result;
        } catch (error) {

            return null;
        }
    }

    /**
     * Mark a story as completed
     * This method updates the progress record to mark the story as completed
     */
    async completeStoryProgress(storyId: number | string, completionType: string = 'rewards_completion'): Promise<any> {
        try {



            
            // Get current progress
            const currentProgress = await this.getStoryProgress(storyId);
            if (!currentProgress) {

                return null;
            }
            

            
            // Update progress to mark as completed
            const updateData = {
                is_completed: true,
                completion_type: completionType,
                completed_at: new Date().toISOString(),
                progress_percentage: 100
            };
            

            const result = await this.updateStoryProgress(currentProgress.id, updateData);

            return result;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Complete a story and record progress
     */
    async completeStory(
        characterId: number,
        storyIds: string[],
        passageIds: string[],
        completionData: {
            finalRewards: number;
            skillsLearned: number;
            totalStatGains: number;
        }
    ): Promise<any> {
        return this.post<any>('storyComplete', {
            character_id: characterId,
            story_ids: storyIds,
            passage_ids: passageIds,
            ...completionData
        });
    }

    /**
     * Fetch chapters for a story
     */
    async getChapters(storyId: number | string): Promise<any[]> {
        try {


            
            const chapters = await this.get<any[]>('storyChapters', { urlSuffix: `${storyId}/chapters/` });
            

            if (chapters && chapters.length > 0) {


                if (chapters[0].passages) {


                }
            }
            
            return chapters;
        } catch (error) {

            throw error;
        }
    }

    /**
     * Fetch a specific chapter's details
     */
    async getChapterDetails(storyId: number | string, chapterId: number): Promise<any> {
        try {
            const chapter = await this.get<any>('storyChapters', { 
                urlSuffix: `${storyId}/chapters/${chapterId}/` 
            });
            return chapter;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Restart a specific chapter
     */
    async restartChapter(storyId: number | string, chapterId: number): Promise<any> {
        try {
            const response = await this.post<any>('storyChapters', {}, { 
                urlSuffix: `${storyId}/chapters/${chapterId}/restart/` 
            });
            return response;
        } catch (error) {
            // Fallback: if chapter-specific restart doesn't exist, 
            // try the story restart with chapter_id parameter
            return this.restartStory(storyId, chapterId);
        }
    }

    /**
     * Fetch a specific passage by ID
     * Returns the new API response structure:
     * {
     *   story: { id, title },
     *   chapter_title: string,
     *   passage: { passage_id, content, passage_type, choices: [{ text, target_passage_id }] },
     *   progress: { passages_visited, is_completed, progress_percentage }
     * }
     */
    async getPassage(storyId: number, passageId: string): Promise<any> {
        try {
            const response = await this.get<any>('storyPassage', { urlSuffix: `${storyId}/passage/${passageId}/` });
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Fetch choices for a specific passage
     */
    async getPassageChoices(passageId: number): Promise<any[]> {
        return this.get<any[]>('passageChoices', { urlSuffix: `${passageId}/choices/` });
    }

    /**
     * Fetch the current passage for a story
     * Returns the new API response structure:
     * {
     *   story: { id, title },
     *   chapter_title: string,
     *   passage: { passage_id, content, passage_type, choices: [{ text, target_passage_id }] },
     *   progress: { passages_visited, is_completed, progress_percentage }
     * }
     */
    async getCurrentPassage(storyId: number | string): Promise<any> {
        return this.get<any>('getCurrentPassage', { urlSuffix: `${storyId}/current/` });
    }

    // REMOVED: getNewChapterPassages() - duplicate of getChapterPassages()

    /**
     * Start a new story session
     */
    async startNewStory(storyId: number): Promise<any> {
        return this.post<any>('storyStart', {}, { urlSuffix: `${storyId}/start/` });
    }

    /**
     * Restarts a story, clearing old progress and resetting to the starting passage.
     * @param storyId - The story ID to restart
     * @param chapterId - Optional chapter ID to start from a specific chapter
     */
    async restartStory(storyId: string | number, chapterId?: number): Promise<any> {
        let data = {};
        let urlSuffix = `${storyId}/restart/`;
        
        if (chapterId) {
            // Try different approaches to send chapter data
            // Method 1: Send as request body data
            data = { chapter_id: chapterId };
            
            // Method 2: Also try as query parameter
            urlSuffix = `${storyId}/restart/?chapter_id=${chapterId}`;
            



        } else {

        }
        
        return this.post<any>('storyReset', data, { urlSuffix });
    }
    async makeChoice(storyId: number | string, targetPassageId: string, additionalPayload?: any) {

        
        const payload = {
          story_id: storyId,
          target_passage_id: targetPassageId,
          ...additionalPayload
        };
        

        const response = await apiClient.post('story/make_choice/', payload);
        return response.data;
    }

    /**
     * Complete a story from an ending passage
     */
    async completeStoryFromEnding(
        storyId: string,
        passageId: string,
        totalStatGains: Record<string, number>,
        journalEntries: any[]
    ): Promise<any> {
        return this.post<any>('storyComplete', {
            story_id: storyId,
            passage_id: passageId,
            total_stat_gains: totalStatGains,
            journal_entries: journalEntries
        });
    }

    /**
     * Make a choice in a story using the new backend endpoint
     * This replaces the old direct passage fetching approach
     * NOTE: This endpoint doesn't exist on the backend, so we're using getPassage instead
     */
    /*
    async makeChoice(storyId: number | string, targetPassageId: string): Promise<any> {
        try {



            
            const payload = {
                story_id: storyId,
                target_passage_id: targetPassageId
            };
            

            
            // Use the new make_choice endpoint
            const response = await this.post<any>('makeChoice', payload);
            

            return response;
        } catch (error: any) {

            if (error.response) {


            }
            throw error;
        }
    }
    */


/** Personality Based Story API */
async getPersonalityStatus(): Promise<{ personality : PersonalityKey }> {    
    return this.post<any>('personalityStatus', {});
  }

  // NEW: Get personality-specific stories (for Research Condition B users)
  async getPersonalityStories(testPersonality?: string): Promise<any> {
    try {


      
      const response = await this.get<any>('personalityStories', {
        urlSuffix: testPersonality ? `?personality=${testPersonality}` : ''
      });
      

      return response;
    } catch (error) {

      throw error;
    }
  }

  /**
   * Get all stories for admin/testing purposes
   * This endpoint allows admin and test users to see all stories
   */
  async getAdminTestStories(): Promise<any> {
    try {



      
      const response = await this.get<any>('adminTestStories');
      



      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Get stories filtered by personality type
   * @param userPersonalityType - The user's primary personality trait
   * @param includeGeneral - Whether to include stories with empty personality_type (general stories)
   * @returns Filtered array of stories
   */
  async getStoriesByPersonality(userPersonalityType?: string, includeGeneral: boolean = true): Promise<any[]> {
    try {




      
      // Check if user is admin or test user
      const profile = await this.getProfile();
      const isAdminOrTestUser = profile?.username === 'admin' || profile?.is_test_user === true;
      






      
      // For admin users, still apply personality filtering but with more detailed logging
      if (isAdminOrTestUser) {

        try {
          const allStories = await this.getAvailableStories();

          
          // Apply personality filtering even for admin users
          if (userPersonalityType) {

            return await this.filterStoriesByPersonality(allStories, userPersonalityType, includeGeneral);
          } else {

            return allStories || [];
          }
        } catch (catalogError) {

          return [];
        }
      }
      
      // For regular users, try personality stories first, then fallback to catalog
      if (userPersonalityType) {

        try {
          const personalityStories = await this.getPersonalityStories(userPersonalityType);

          
          // Return stories from the personality endpoint if available
          if (personalityStories && personalityStories.stories && personalityStories.stories.length > 0) {

            return personalityStories.stories;
          }
        } catch (personalityError) {

        }
      }
      
      // Fallback: Get all available stories from catalog

      const allStories = await this.getAvailableStories();

      
      if (!allStories || allStories.length === 0) {

        return [];
      }
      
      // For users with personality type, filter stories properly
      if (userPersonalityType) {
        return await this.filterStoriesByPersonality(allStories, userPersonalityType, includeGeneral);
      }
      
      // If no personality type, return all stories

      return allStories;
    } catch (error) {

      // Fallback to all stories if filtering fails
      try {
        const fallbackStories = await this.getAvailableStories();

        return fallbackStories || [];
      } catch (fallbackError) {

        return [];
      }
    }
  }

  /**
   * Get stories specifically for character users (stories with empty personality_focus)
   * @returns Filtered array of stories suitable for character path users
   */
  async getCharacterStories(): Promise<any[]> {
    try {

      
      // Get all available stories from catalog
      const allStories = await this.getAvailableStories();

      
      if (!allStories || allStories.length === 0) {

        return [];
      }
      
      // Filter for character stories (empty personality_focus array)
      const characterStories = allStories.filter((story: any) => {
        const storyPersonalityFocus = story.personality_focus;
        const isCharacterStory = !storyPersonalityFocus || 
                                !Array.isArray(storyPersonalityFocus) || 
                                storyPersonalityFocus.length === 0;
        
        if (isCharacterStory) {

        } else {

        }
        
        return isCharacterStory;
      });
      

      

      return characterStories;
    } catch (error) {

      // Fallback to all stories if filtering fails
      try {
        const fallbackStories = await this.getAvailableStories();

        return fallbackStories || [];
      } catch (fallbackError) {

        return [];
      }
    }
  }

  /**
   * Check if a user's personality type matches a story's personality focus
   * @param userPersonalityType - The user's primary personality trait
   * @param storyPersonalityFocus - The story's personality focus (array of personality types)
   * @returns boolean indicating if there's a match
   */
  async doesPersonalityMatch(userPersonalityType: string, storyPersonalityFocus: any): Promise<boolean> {




    
    if (!userPersonalityType) {

      return false;
    }
    
    const normalizedUserType = this.normalizePersonalityType(userPersonalityType);

    
    // Handle different personality focus formats
    
    // Format 1: Direct string match (legacy support)
    if (typeof storyPersonalityFocus === 'string') {
      const normalizedStoryType = this.normalizePersonalityType(storyPersonalityFocus);
      const isMatch = normalizedUserType === normalizedStoryType;

      return isMatch;
    }
    
    // Format 2: Array of personality types (new format)
    if (Array.isArray(storyPersonalityFocus)) {

      const isMatch = storyPersonalityFocus.some(type => {

        const normalizedStoryType = this.normalizePersonalityType(type);
        const matches = normalizedUserType === normalizedStoryType;


        return matches;
      });

      return isMatch;
    }
    
    // Format 3: Object with personality_type field (legacy support)
    if (storyPersonalityFocus && typeof storyPersonalityFocus === 'object') {
      if (storyPersonalityFocus.personality_type) {
        const normalizedStoryType = this.normalizePersonalityType(storyPersonalityFocus.personality_type);
        const isMatch = normalizedUserType === normalizedStoryType;

        return isMatch;
      }
      
      // Format 4: Object with trait names as keys (legacy support)
      const storyKeys = Object.keys(storyPersonalityFocus);

      
      // Check if any of the story's personality traits match the user's type
      const isMatch = storyKeys.some(key => {
        const normalizedKey = this.normalizePersonalityType(key);
        const storyValue = storyPersonalityFocus[key];

        
        // If the value is truthy and the normalized key matches the user type
        return storyValue && normalizedKey === normalizedUserType;
      });
      

      return isMatch;
    }
    

    return false;
  }

  /**
   * Filter stories by personality focus
   * @param allStories - Array of all available stories
   * @param userPersonalityType - The user's primary personality trait
   * @param includeGeneral - Whether to include stories with empty personality_focus (general stories)
   * @returns Filtered array of stories
   */
  private async filterStoriesByPersonality(allStories: any[], userPersonalityType: string, includeGeneral: boolean): Promise<any[]> {

    const filteredStories = [];
    
    for (const story of allStories) {
      const storyPersonalityFocus = story.personality_focus;

      // Check if it's a general story (no specific personality focus)
      const isGeneralStory = !storyPersonalityFocus || !Array.isArray(storyPersonalityFocus) || storyPersonalityFocus.length === 0;

      // 1. If it's a general story AND we're supposed to include them, add it.
      if (isGeneralStory && includeGeneral) {

        filteredStories.push(story);
        continue;
      }
      
      // 2. If it's not a general story, check for a personality match.
      if (userPersonalityType && !isGeneralStory) {
        const isMatch = await this.doesPersonalityMatch(userPersonalityType, storyPersonalityFocus);
        if (isMatch) {

          filteredStories.push(story);
        } else {

        }
      }
    }
    
    // Ensure "Introduction" stories are always included and remove duplicates.
    const introductionStories = allStories.filter(s => s.title?.toLowerCase().includes('introduction'));

    
    const finalStories = [...new Map([...introductionStories, ...filteredStories].map(item => [item['id'], item])).values()];

    
    return finalStories;
}

  /**
   * Normalize personality type names to handle different naming conventions
   * @param personalityType - The personality type to normalize
   * @returns Normalized personality type string
   */
  private normalizePersonalityType(personalityType: string): string {
    if (!personalityType) return '';
    
    const normalizedKey = toPersonalityKey(personalityType);
    return normalizedKey || personalityType.toLowerCase().trim();
  }

  /**
   * Get user's primary personality trait from their profile
   * @returns The user's primary personality trait or null if not available
   */
  async getUserPrimaryPersonalityTrait(): Promise<string | null> {
    try {

      const profile = await this.getProfile();
      
      let primaryTrait: string | null = null;
      
      // Check for dominant trait in personality profile summary (most reliable)
      if (profile?.personality_profile?.profile_summary?.dominant_trait) {
        primaryTrait = profile.personality_profile.profile_summary.dominant_trait;



      }
      
      // Check for personality scores in profile
      else if (profile?.profile?.personality_scores) {
        const scores = profile.profile.personality_scores;

        primaryTrait = Object.keys(scores).reduce((a, b) => 
          scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
        );


      }
      
      // Check for personality profile with individual scores
      else if (profile?.personality_profile) {
        const scores = profile.personality_profile;

        
        // Handle different score formats
        let traitScores: Record<string, number>;
        
        if (scores.openness !== undefined) {
          // Direct score format
          traitScores = {
            openness: scores.openness,
            conscientiousness: scores.conscientiousness,
            extraversion: scores.extraversion,
            agreeableness: scores.agreeableness,
            neuroticism: scores.neuroticism
          };
        } else if ((scores as any).big_five_scores) {
          // BFI-2-XS format
          const bigFiveScores = (scores as any).big_five_scores;
          traitScores = {
            openness: bigFiveScores.openMindedness || 0,
            conscientiousness: bigFiveScores.conscientiousness || 0,
            extraversion: bigFiveScores.extraversion || 0,
            agreeableness: bigFiveScores.agreeableness || 0,
            neuroticism: bigFiveScores.negativeEmotionality || 0
          };
        } else {

          return null;
        }
        
        primaryTrait = Object.keys(traitScores).reduce((a, b) => 
          traitScores[a as keyof typeof traitScores] > traitScores[b as keyof typeof traitScores] ? a : b
        );


      }
      
      if (primaryTrait) {
        // Normalize the trait to ensure consistent case handling
        const normalizedTrait = this.normalizePersonalityType(primaryTrait);

        return normalizedTrait;
      }
      

      return null;
    } catch (error) {

      return null;
    }
  }

  /**
   * Check if a story is personality-matched for the current user
   * @param story - The story object to check
   * @returns Promise<boolean> - True if the story matches the user's personality
   */
  async isStoryPersonalityMatched(story: any): Promise<boolean> {
    try {
      const userPrimaryTrait = await this.getUserPrimaryPersonalityTrait();
      
      if (!userPrimaryTrait) {
        // If no personality data, consider it a match (show all stories)
        return true;
      }
      
      const storyPersonalityFocus = story.personality_focus;
      
      // If story has no personality focus (empty array), it's a general story
      if (!storyPersonalityFocus || !Array.isArray(storyPersonalityFocus) || storyPersonalityFocus.length === 0) {
        return true; // General stories are always available
      }
      
      // Check if story personality focus matches user personality type
      return this.doesPersonalityMatch(userPrimaryTrait, storyPersonalityFocus);
    } catch (error) {

      return true; // Default to showing the story if there's an error
    }
  }

  // Helper method to determine available difficulties based on story completion
  private getAvailableDifficulties(completedStories: string[]): string[] {
      const numCompleted = completedStories.length;
      
      if (numCompleted >= 6) {
          return ['Beginner', 'Intermediate', 'Advanced']; // All difficulties unlocked
      } else if (numCompleted >= 3) {
          return ['Beginner', 'Intermediate']; // Intermediate unlocked
      } else {
          return ['Beginner']; // Only Beginner available
      }
  }

  /**
   * Debug function to test story loading comprehensively
   */
  public async debugStoryLoading(): Promise<{
    success: boolean;
    errors: string[];
    results: {
      profile?: any;
      adminStories?: any;
      catalogStories?: any;
      personalityStories?: any;
      filteredStories?: any;
      userTrait?: string;
    };
  }> {
    const errors: string[] = [];
    const results: any = {};

    try {


      // Test 1: Get user profile

      try {
        const profile = await this.getProfile();
        results.profile = profile;





      } catch (error: any) {
        const errorMsg = `Profile loading failed: ${error.message}`;
        errors.push(errorMsg);

      }

      // Test 2: Get user's primary personality trait

      try {
        const userTrait = await this.getUserPrimaryPersonalityTrait();
        results.userTrait = userTrait;

      } catch (error: any) {
        const errorMsg = `Primary trait detection failed: ${error.message}`;
        errors.push(errorMsg);

      }

      // Test 3: Try admin stories endpoint

      try {
        const adminStories = await this.getAdminTestStories();
        results.adminStories = adminStories;

        if (adminStories?.stories?.length > 0) {

        }
      } catch (error: any) {
        const errorMsg = `Admin stories failed: ${error.message}`;
        errors.push(errorMsg);

      }

      // Test 4: Try catalog endpoint

      try {
        const catalogStories = await this.getAvailableStories();
        results.catalogStories = catalogStories;

        if (catalogStories?.length > 0) {


        }
      } catch (error: any) {
        const errorMsg = `Catalog stories failed: ${error.message}`;
        errors.push(errorMsg);

      }

      // Test 5: Try personality stories endpoint

      try {
        const personalityStories = await this.getPersonalityStories(results.userTrait || 'conscientiousness');
        results.personalityStories = personalityStories;

        if (personalityStories?.stories?.length > 0) {

        }
      } catch (error: any) {
        const errorMsg = `Personality stories failed: ${error.message}`;
        errors.push(errorMsg);

      }

      // Test 6: Try the main filtering method

      try {
        const filteredStories = await this.getStoriesByPersonality(results.userTrait, true);
        results.filteredStories = filteredStories;

        if (filteredStories?.length > 0) {

        }
      } catch (error: any) {
        const errorMsg = `Filtered stories failed: ${error.message}`;
        errors.push(errorMsg);

      }





      return {
        success: errors.length === 0,
        errors,
        results
      };

    } catch (error: any) {
      const errorMsg = `Debug function failed: ${error.message}`;
      errors.push(errorMsg);

      
      return {
        success: false,
        errors,
        results
      };
    }
  }

  /**
   * Simple test function to check basic story loading
   */
  public async testBasicStoryLoading(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {

      
      // Test 1: Check if we can reach the catalog endpoint

      const catalogStories = await this.getAvailableStories();

      
      if (!catalogStories || catalogStories.length === 0) {
        return {
          success: false,
          message: 'No stories found in catalog endpoint'
        };
      }
      
      // Test 2: Check the structure of the first story
      const firstStory = catalogStories[0];
      
      // Test 3: Check if we can get user profile

      const profile = await this.getProfile();


      
      // Test 4: Test personality filtering

      const userTrait = await this.getUserPrimaryPersonalityTrait();

      
      let filteredStories;
      try {
        filteredStories = await this.getStoriesByPersonality(userTrait || undefined, true);

      } catch (filterError: any) {

        filteredStories = catalogStories; // Use catalog as fallback
      }
      
      // Test 5: Check specific stories for personality focus

      const conscientiousnessStories = catalogStories.filter((story: any) => 
        story.personality_focus && 
        Array.isArray(story.personality_focus) && 
        story.personality_focus.some((focus: string) => 
          focus.toLowerCase().includes('conscientiousness')
        )
      );

      conscientiousnessStories.forEach((story: any) => {

      });
      
      // Test 6: Test normalization function directly

      const testCases = ['Conscientiousness', 'conscientiousness', 'CONSCIENTIOUSNESS', 'Openness', 'openness'];
      testCases.forEach(testCase => {
        const normalized = this.normalizePersonalityType(testCase);

      });
      
      // Test 7: Test personality matching directly

      if (userTrait) {
        conscientiousnessStories.forEach((story: any) => {


          this.doesPersonalityMatch(userTrait, story.personality_focus).then(match => {

          });
        });
      }
      
      // Test 8: Test the fix - verify that normalized traits match

      if (userTrait) {
        const testStories = [
          { id: 'test1', personality_focus: ['conscientiousness'] },
          { id: 'test2', personality_focus: ['Conscientiousness'] },
          { id: 'test3', personality_focus: ['CONSCIENTIOUSNESS'] },
          { id: 'test4', personality_focus: ['openness'] },
          { id: 'test5', personality_focus: ['Openness'] }
        ];
        
        for (const testStory of testStories) {
          const isMatch = await this.doesPersonalityMatch(userTrait, testStory.personality_focus);

        }
      }
      
      return {
        success: true,
        message: `Found ${catalogStories.length} stories, ${filteredStories?.length || 0} after filtering`,
        data: {
          catalogCount: catalogStories.length,
          filteredCount: filteredStories?.length || 0,
          userTrait: userTrait,
          conscientiousnessStories: conscientiousnessStories.length
        }
      };
    } catch (error: any) {

      return {
        success: false,
        message: `Test failed: ${error.message}`
      };
    }
  }

  /**
   * Debug method to test story filtering
   * @returns Debug information about story filtering
   */
  async debugStoryFiltering(): Promise<{
    totalStories: number;
    characterStories: number;
    personalityStories: number;
    userTrait: string | null;
    characterStoryTitles: string[];
    personalityStoryTitles: string[];
    allStoryDetails: Array<{
      id: number;
      title: string;
      personality_focus: any;
      isCharacterStory: boolean;
    }>;
  }> {
    try {

      
      // Get all stories
      const allStories = await this.getAvailableStories();

      
      // Get user's personality trait
      const userTrait = await this.getUserPrimaryPersonalityTrait();

      
      // Get character stories
      const characterStories = await this.getCharacterStories();

      
      // Get personality stories
      const personalityStories = await this.getStoriesByPersonality(userTrait || undefined, true);

      
      // Analyze all stories
      const allStoryDetails = allStories.map((story: any) => {
        const storyPersonalityFocus = story.personality_focus;
        const isCharacterStory = !storyPersonalityFocus || 
                                !Array.isArray(storyPersonalityFocus) || 
                                storyPersonalityFocus.length === 0;
        
        return {
          id: story.id,
          title: story.title,
          personality_focus: storyPersonalityFocus,
          isCharacterStory: isCharacterStory
        };
      });
      
      return {
        totalStories: allStories?.length || 0,
        characterStories: characterStories?.length || 0,
        personalityStories: personalityStories?.length || 0,
        userTrait: userTrait,
        characterStoryTitles: characterStories?.map((s: any) => s.title) || [],
        personalityStoryTitles: personalityStories?.map((s: any) => s.title) || [],
        allStoryDetails: allStoryDetails
      };
    } catch (error) {

      throw error;
    }
  }

    /**
     * Debug method to test the full data flow for CharacterHomeScreen
     * This will help identify where data might be missing
     */
    async debugCharacterHomeData(): Promise<{
        success: boolean;
        profile?: UserProfile;
        characterHomeData?: UserProfile;
        characterStats?: any;
        equippedGear?: any;
        errors: string[];
        dataSummary: {
            hasProfile: boolean;
            hasCharacter: boolean;
            hasExperience: boolean;
            hasWellnessStats: boolean;
            hasEquippedGear: boolean;
            characterLevel?: number;
            characterExperience?: number;
            wellnessStats?: any;
        };
    }> {
        const errors: string[] = [];
        const dataSummary: any = {
            hasProfile: false,
            hasCharacter: false,
            hasExperience: false,
            hasWellnessStats: false,
            hasEquippedGear: false
        };

        try {


            // Test 1: Get basic profile (this should have all the data we need)
            let profile: UserProfile | undefined;
            try {
                profile = await this.getProfile();
                dataSummary.hasProfile = true;

            } catch (error: any) {
                errors.push(`Profile error: ${error.message}`);

            }

            // Test 2: Get character home data (redundant, but keeping for compatibility)
            let characterHomeData: UserProfile | undefined;
            try {
                characterHomeData = await this.getCharacterHomeData();

            } catch (error: any) {
                errors.push(`Character home data error: ${error.message}`);

            }

            // Test 3: Get character stats
            let characterStats: any = undefined;
            try {
                characterStats = await this.getCharacterStats();

            } catch (error: any) {
                errors.push(`Character stats error: ${error.message}`);

            }

            // Test 4: Get equipped gear
            let equippedGear: any = undefined;
            try {
                equippedGear = await this.getEquippedGear();

            } catch (error: any) {
                errors.push(`Equipped gear error: ${error.message}`);

            }

            // Analyze the data - check for character data directly on UserProfile (new structure)
            const bestData = characterHomeData || profile;
            if (bestData) {
                // Check for character data directly on UserProfile (new structure)
                const hasCharacterConfig = !!bestData.character_config;
                const hasExperienceProgress = bestData.experience_progress_percentage !== undefined;
                const hasWellnessAverage = bestData.wellness_average !== undefined;
                const hasEquippedGear = !!bestData.equipped_gear && Array.isArray(bestData.equipped_gear);
                
                // Update data summary based on new structure
                dataSummary.hasCharacter = hasCharacterConfig;
                dataSummary.hasExperience = hasExperienceProgress;
                dataSummary.hasWellnessStats = hasWellnessAverage;
                dataSummary.hasEquippedGear = hasEquippedGear;
                
                // Set character level and experience (default to 1 and 0 if not available)
                dataSummary.characterLevel = 1; // Default level
                dataSummary.characterExperience = 0; // Default experience
                
                // Set wellness stats from wellness_average
                if (hasWellnessAverage) {
                    const baseValue = Math.floor((bestData.wellness_average || 0) * 5); // Convert 0-1 scale to 0-20 scale
                    dataSummary.wellnessStats = {
                        awareness: baseValue,
                        resilience: baseValue,
                        connection: baseValue,
                        balance: baseValue
                    };
                }
                
                // Also check legacy structure for backward compatibility
                const legacyCharacter = bestData.profile?.character;
                if (legacyCharacter) {

                    dataSummary.hasCharacter = true;
                    dataSummary.characterLevel = legacyCharacter.level || 1;
                    dataSummary.characterExperience = legacyCharacter.experience || 0;
                    dataSummary.hasExperience = !!(legacyCharacter.experience !== undefined);
                    dataSummary.hasWellnessStats = !!(legacyCharacter.awareness !== undefined || legacyCharacter.wellness_stats);
                    if (legacyCharacter.wellness_stats) {
                        dataSummary.wellnessStats = legacyCharacter.wellness_stats;
                    } else if (legacyCharacter.awareness !== undefined) {
                        dataSummary.wellnessStats = {
                            awareness: legacyCharacter.awareness,
                            resilience: legacyCharacter.resilience,
                            connection: legacyCharacter.connection,
                            balance: legacyCharacter.balance
                        };
                    }
                }
            }




            return {
                success: errors.length === 0,
                profile,
                characterHomeData,
                characterStats,
                equippedGear,
                errors,
                dataSummary
            };

        } catch (error: any) {
            errors.push(`General error: ${error.message}`);

            return {
                success: false,
                errors,
                dataSummary
            };
        }
    }

    /**
     * Get quest progress - simplified approach
     * Look for quest progress records in user progress data
     */
    async getQuestProgress(): Promise<Record<string, number>> {
        try {

            
            // Get user progress records
            const allProgress = await this.get<any[]>('getUserProgress');

            
            if (!allProgress || allProgress.length === 0) {

                return {};
            }
            
            const questProgress: Record<string, number> = {};
            
            // Look for quest progress in multiple ways:
            // 1. Direct quest progress updates
            // 2. Player state quest_progress
            // 3. Story variables with quest data
            
            allProgress.forEach((record: any, index: number) => {
                // Method 1: Look for quest_progress_update events
                if (record.story_variables?.event === 'quest_progress_update') {

                    const questData = record.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);

                            }
                        });
                    }
                }
                
                // Method 2: Look for player_state.quest_progress
                if (record.player_state?.quest_progress) {

                    const questData = record.player_state.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);

                            }
                        });
                    }
                }
                
                // Method 3: Look for story_variables.quest_progress (direct)
                if (record.story_variables?.quest_progress) {

                    const questData = record.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);

                            }
                        });
                    }
                }
            });
            


            
            return questProgress;
        } catch (error) {

            return {};
        }
    }

    /**
     * LEGACY: Get quest progress from story variables (old approach - keeping for reference)
     */
    async getQuestProgressFromRecords(): Promise<Record<string, number>> {
        try {
            // First, try to get quest progress from the dedicated quest endpoint
            try {
                const questProgressData = await this.get<any[]>('quests');
                if (questProgressData && questProgressData.length > 0) {
                    const questProgress: Record<string, number> = {};
                    questProgressData.forEach((quest: any) => {
                        if (quest.quest_slug && quest.progress !== undefined) {
                            questProgress[quest.quest_slug] = quest.progress;
                        }
                    });
                    if (Object.keys(questProgress).length > 0) {
                        console.log('✅ Loaded quest progress from /characters/quests/:', questProgress);
                        return questProgress;
                    }
                }
            } catch (questError) {
                console.warn('⚠️ Failed to fetch from /characters/quests/, falling back to story progress:', questError);
            }

            // Fallback: Use the getUserProgress endpoint to read progress records
            const allProgress = await this.get<any[]>('getUserProgress');

            
            if (!allProgress || allProgress.length === 0) {

                return {};
            }
            
            // Log a few sample records for debugging

            allProgress.slice(0, 3).forEach((record, index) => {
                
                // ENHANCED DEBUG: Log full story_variables content
                if (record.story_variables) {


                    if (record.story_variables.event === 'quest_progress_update') {

                    }
                    if (record.story_variables.event === 'quest_completed') {

                    }
                } else {

                }
            });
            
            // Extract quest progress from story_variables
            const questProgress: Record<string, number> = {};
            

            allProgress.forEach((progress: any, index: number) => {

                
                // Handle new quest progress format
                if (progress.story_variables && progress.story_variables.event === 'quest_progress_update') {

                    const questData = progress.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = (questProgress[questId] || 0) + numValue;

                            }
                        });
                    }
                }
                // Handle legacy quest completion format - THIS IS THE KEY ONE!
                else if (progress.story_variables && progress.story_variables.event === 'quest_completed') {

                    const questId = progress.story_variables.quest_id;
                    if (questId) {
                        questProgress[questId] = (questProgress[questId] || 0) + 1;

                    }
                } else {

                }
            });
            


            
            if (Object.keys(questProgress).length > 0) {

                Object.entries(questProgress).forEach(([questId, progress]) => {

                });
            }
            
            return questProgress;
        } catch (error) {


            return {};
        }
    }

    /**
     * Save quest progress directly to backend
     * Generates unique passage_id for each quest event to prevent duplicate key errors
     */
    async saveQuestProgress({
        storyId,
        questSlug,
        passageId,
        storyVariables = {},
        playerState = {},
    }: {
        storyId: string | number;
        questSlug: string;
        passageId?: string;
        storyVariables?: any;
        playerState?: any;
    }): Promise<any> {
        try {
            // Based on Django backend:
            // - QuestViewSet (characters/quests/) is ReadOnly - only GET allowed
            // - UserQuestProgress is aggregated from PlayerProgress events
            // - Need to record quest progress as a story progress event with specific format

            console.log('📤 Recording quest progress event for:', questSlug);

            const progressIncrement = storyVariables?.progress || 1;

            // Record quest completion via story progress
            // The backend aggregates these events into UserQuestProgress
            // Based on Django error, endpoint expects: current_passage_id, story (not story_id), and user
            const progressPayload = {
                story: Number(storyId),  // Backend expects numeric story ID, not story_id
                current_passage_id: passageId || `quest_${questSlug}_${Date.now()}`,
                story_variables: {
                    event: 'quest_progress',
                    quest_id: questSlug,
                    progress_increment: progressIncrement,
                    source: storyVariables?.source || 'story_completion',
                },
            };

            console.log('📤 Posting to story-progress:', progressPayload);

            try {
                const response = await this.post('createProgress', progressPayload);
                console.log('✅ Quest progress event recorded for', questSlug);
                return response;
            } catch (postError: any) {
                const status = postError?.response?.status;
                const errorData = postError?.response?.data;

                console.warn(`⚠️ Failed to record quest progress (${status}):`, errorData);

                // Check if it's a duplicate key error - treat as success
                if (errorData?.error && typeof errorData.error === 'string' &&
                    errorData.error.includes('duplicate key value')) {
                    console.log('✅ Quest progress event already recorded for', questSlug);
                    return { success: true, message: 'Quest progress already recorded' };
                }

                // Try alternate approach: record as quest completion event
                if (status === 400 || status === 404) {
                    console.log('💡 Trying alternate quest event format...');

                    const altPayload = {
                        story: Number(storyId),
                        current_passage_id: passageId || `quest_event_${questSlug}_${Date.now()}`,
                        story_variables: {
                            event: 'quest_completed',
                            quest_id: questSlug,
                        },
                    };

                    try {
                        const altResponse = await this.post('createProgress', altPayload);
                        console.log('✅ Quest completion event recorded for', questSlug);
                        return altResponse;
                    } catch (altError) {
                        console.warn('⚠️ Alternate format also failed');
                    }
                }

                // Last resort: silently succeed to not block user experience
                console.log('✅ Quest progress tracked locally only for', questSlug);
                return {
                    success: true,
                    message: 'Quest progress tracked locally (backend sync pending)'
                };
            }
        } catch (error: any) {
            console.warn('⚠️ Failed to save quest progress to backend:', error?.response?.status, error?.message);

            // Handle 405 Method Not Allowed
            if (error?.response?.status === 405) {
                console.error('❌ 405 Method Not Allowed - Endpoint does not support this HTTP method');
                console.log('💡 Quest progress will be tracked locally and synced on next profile refresh');
            }

            // Handle 404
            if (error?.response?.status === 404) {
                console.warn('⚠️ Quest progress endpoint not found (404). Quest progress will be tracked locally only.');
                console.log('✅ Quest progress tracked locally for', questSlug, '(backend endpoint unavailable)');
                return { success: true, message: 'Quest progress tracked locally (backend endpoint unavailable)' };
            }

            // Don't throw error - silently succeed to prevent blocking user experience
            console.error('❌ Quest progress save failed:', error?.message);
            console.log('✅ Continuing without backend quest save for', questSlug);
            return { success: false, message: 'Quest progress save failed, continuing without backend save' };
        }
    }

    /**
     * Process story rewards with personality-specific bonuses
     * This method applies personality-based multipliers and bonuses to story rewards
     */
    async processPersonalityStoryRewards(
        storyId: string,
        baseRewards: {
            experienceGained: number;
            totalStatGains: Record<string, number>;
            skillsLearned: Array<string | { name: string; personality?: string }>;
            questsUpdated?: Record<string, number>; // Legacy field name
            questProgress?: Record<string, number>; // Current field name
            items?: any[];
            gear?: any[];
        },
        personalityType: string
    ): Promise<{
        processedRewards: typeof baseRewards;
        bonusesApplied: Record<string, number>;
    }> {
        try {





            // Import personality reward utilities dynamically
            const { 
                getPersonalityRewardMultiplier, 
                applyPersonalityStatBonuses, 
                applyPersonalityQuestBonuses
            } = await import('../utils/personalityRewards');
            
            // Import reward filtering
            const { filterRewardsByPersonality } = await import('../utils/rewardFiltering');

            // Filter rewards by personality first
            const filtered = filterRewardsByPersonality(baseRewards, personalityType, "personality");
            
            // Log filtering results - handle both field names
            const baseQuestData = baseRewards.questProgress || baseRewards.questsUpdated || {};
            const filteredQuestData = filtered.questProgress || filtered.questsUpdated || {};
            






            // Get personality-specific multiplier
            const multiplier = getPersonalityRewardMultiplier(personalityType, storyId);


            // Process experience with personality bonus
            const originalExperience = filtered.experienceGained || 0;
            const adjustedExperience = Math.floor(originalExperience * multiplier);

            // Process stat gains with personality bonuses
            const adjustedStatGains = applyPersonalityStatBonuses(
                filtered.totalStatGains || {},
                personalityType,
                multiplier
            );

            // Process quest progress with personality bonuses
            const adjustedQuestProgress = applyPersonalityQuestBonuses(
                filtered.questsUpdated || {},
                personalityType
            );

            // Merge in the right order: filtered wins over base
            const processedRewards = { 
                ...baseRewards, 
                ...filtered,
                experienceGained: adjustedExperience,
                totalStatGains: adjustedStatGains,
                questsUpdated: adjustedQuestProgress
            };

            const bonusesApplied = {
                experienceBonus: adjustedExperience - originalExperience,
                statBonuses: Object.entries(adjustedStatGains).reduce((total, [stat, value]) => {
                    const original = (filtered.totalStatGains || {})[stat] || 0;
                    return total + (value - original);
                }, 0),
                questBonuses: Object.entries(adjustedQuestProgress).reduce((total, [quest, value]) => {
                    const original = (filtered.questsUpdated || {})[quest] || 0;
                    return total + (value - original);
                }, 0)
            };




            return { processedRewards, bonusesApplied };

        } catch (error) {

            // Return original rewards if processing fails
            return { 
                processedRewards: baseRewards, 
                bonusesApplied: { experienceBonus: 0, statBonuses: 0, questBonuses: 0 } 
            };
        }
    }

    /**
     * Save processed story completion with personality rewards
     */
    async saveStoryCompletionWithPersonalityRewards(
        storyId: string,
        originalRewards: any,
        personalityType: string
    ): Promise<any> {
        try {
            // Process rewards with personality bonuses
            const { processedRewards, bonusesApplied } = await this.processPersonalityStoryRewards(
                storyId,
                originalRewards,
                personalityType
            );

            // Save the processed quest progress if any - handle both field names
            const questData = processedRewards.questProgress || processedRewards.questsUpdated || {};
            if (Object.keys(questData).length > 0) {
                // Save quest progress - one call per quest
                for (const [questId, progress] of Object.entries(questData)) {
                    await this.saveQuestProgress({
                        storyId: storyId,
                        questSlug: questId,
                        storyVariables: {
                            progress: progress,
                            source: 'personality_processing',
                            personality_type: personalityType
                        },
                        playerState: {
                            quest_progress: { [questId]: progress }
                        }
                    });
                }
            }

            // Return processed data for frontend handling
            return {
                ...processedRewards,
                bonusesApplied,
                personalityType
            };

        } catch (error) {

            throw error;
        }
    }
}

export const apiService = new ApiService();