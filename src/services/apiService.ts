import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { AsyncStorage } from '../imports';
import { Character, CharacterCreateData, CharacterGear, CodexEntry, CopingTool, GameData, JournalPrompt, LoginResponse, UserProfile } from '../types';
import { PersonalityKey } from '../types/personality';
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

console.log(`📱 API Client configured for ${Platform.OS} with ${getTimeout()}ms timeout`);

// Enable request interceptor to add authentication headers
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Skip authorization for login requests
            if (config.url?.includes('auth/login') || config.url?.includes('login')) {
                console.log('Skipping auth for login request:', config.url);
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
                
                // Log the full request details for debugging
                console.log('Full request config:', {
                    url: config.url,
                    method: config.method?.toUpperCase(),
                    headers: {
                        ...config.headers,
                        Authorization: config.headers.Authorization
                    },
                    baseURL: config.baseURL,
                    fullURL: `${config.baseURL}${config.url}`,
                    platform: Platform.OS,
                    timeout: config.timeout
                });
            } else {
                console.log('No token found for request:', config.url);
                // Try to get all AsyncStorage keys to debug
                const allKeys = await AsyncStorage.getAllKeys();
                console.log('All AsyncStorage keys:', allKeys);
                
                // Try to get all values to see what's actually stored
                if (allKeys.length > 0) {
                    const allValues = await AsyncStorage.multiGet(allKeys);
                    console.log('All AsyncStorage values:', allValues);
                }
            }
        } catch (error) {
            console.error('Error in request interceptor:', error);
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
            console.error(`⏰ Request timeout on ${Platform.OS}:`, error.config?.url);
        } else if (error.code === 'NETWORK_ERROR') {
            console.error(`🌐 Network error on ${Platform.OS}:`, error.message);
        } else if (error.response) {
            console.error(`📡 HTTP ${error.response.status} on ${Platform.OS}:`, error.response.data);
        }
        
        return Promise.reject(error);
    }
);

// ===== Main API Service Class =====
class ApiService {
    private isInitialized = false;

    public async initialize(): Promise<void> {
        try {
            console.log('=== API SERVICE INITIALIZATION ===');
            
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
            console.error('API service initialization error:', error);
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
        
        console.log('=== API POST REQUEST ===');
        console.log('Endpoint:', endpoint);
        console.log('Base URL:', API_ENDPOINTS[endpoint]);
        console.log('URL Suffix:', config?.urlSuffix);
        console.log('Full URL:', url);
        console.log('Data:', data);
        console.log('Config:', config);

        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.post<T>(url, data, axiosConfig);

            console.log('✅ API POST successful:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ API POST failed:', error);
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            if (error.config) {
                console.error('Request config:', error.config);
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

            console.log('🔄 Starting login process for user:', username);
            
            // Make the login API call
            const response = await this.post<LoginResponse>('login', { username, password });
            
            // Validate response structure
            if (!response || !response.token) {
                throw new Error('Invalid login response: No token received');
            }

            if (!response.user || !response.user.id) {
                throw new Error('Invalid login response: No user data received');
            }

            console.log('✅ Login API call successful, storing authentication data...');
            
            // Store authentication data using Promise.all for better performance
            // This ensures all storage operations complete before proceeding
            await Promise.all([
                AsyncStorage.setItem('authToken', response.token),
                AsyncStorage.setItem('characterId', String(response.user.id)),
                AsyncStorage.setItem('userData', JSON.stringify(response.user))
            ]);

            console.log('✅ Authentication data stored successfully');
            console.log('📊 Login response summary:', {
                hasToken: !!response.token,
                tokenLength: response.token.length,
                userId: response.user.id,
                username: response.user.username,
                needsOnboarding: response.needs_onboarding,
                onboardingType: response.onboarding_type
            });
            
            return response;
        } catch (error: any) {
            console.error('❌ Login failed:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

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
            console.log('🔄 Starting logout process...');
            
            // Attempt to call the logout API endpoint
            try {
                await this.post('logout');
                console.log('✅ Logout API call successful');
            } catch (apiError: any) {
                // Don't fail the logout process if the API call fails
                // The user should still be logged out locally
                console.warn('⚠️ Logout API call failed, continuing with local logout:', apiError.message);
            }
            
            // Always clear local storage regardless of API call success
            console.log('🔄 Clearing local authentication data...');
            await Promise.all([
                AsyncStorage.removeItem('authToken'),
                AsyncStorage.removeItem('characterId'),
                AsyncStorage.removeItem('userData')
            ]);
            
            console.log('✅ Local authentication data cleared successfully');
        } catch (error: any) {
            console.error('❌ Error during logout:', error);
            // Even if there's an error, try to clear storage as a fallback
            try {
                await Promise.all([
                    AsyncStorage.removeItem('authToken'),
                    AsyncStorage.removeItem('characterId'),
                    AsyncStorage.removeItem('userData')
                ]);
                console.log('✅ Fallback: Local authentication data cleared');
            } catch (fallbackError) {
                console.error('❌ Critical: Failed to clear authentication data during logout:', fallbackError);
                // This is a critical error - the user might remain logged in
                throw new Error('Failed to complete logout. Please restart the app.');
            }
        }
    }

    async validateToken(): Promise<boolean> {
        try {
            console.log('🔄 Validating authentication token...');
            
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                console.log('❌ No token found in storage');
                return false;
            }

            console.log('✅ Token found in storage, testing validity...');
            
            // Test token by making a simple authenticated request
            // This will work for both regular tokens and test tokens
            try {
                await this.get('userProfile');
                console.log('✅ Token validation successful');
                return true;
            } catch (error: any) {
                console.log('❌ Token validation failed:', {
                    status: error.response?.status,
                    message: error.message
                });
                
                // Don't remove token here - let response interceptor handle it
                // The response interceptor will handle 401/403 responses appropriately
                return false;
            }
        } catch (error: any) {
            console.error('❌ Error during token validation:', error);
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
            console.log("🔄 getProfile: Fetching current user profile from backend");

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
            console.log(`🔄 getProfile: Fetching profile for user ID: ${effectiveUserId}`);

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

                // ensure .character is populated (UI checks userProfile.character)
                character: character ?? null,

                // convenience fields used around the app
                wellness_stats,
                experience,
                experience_needed,
                experience_progress_percentage,

                // pass through anything else you need (personality, etc.)
                personality_profile: user?.personality_profile ?? null,
            };

            console.log("✅ getProfile: Successfully retrieved normalized user profile");
            console.log("📊 Profile summary:", {
                userId: normalized.id,
                username: normalized.username,
                hasCharacter: !!normalized.character,
                hasWellness: !!normalized.wellness_stats,
                xpPct: normalized.experience_progress_percentage,
            });

            return normalized;

        } catch (error: any) {
            console.error('❌ getProfile: Failed to fetch user profile:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });

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
        try {
            console.log('🔄 updateProfile: Starting profile update...');
            
            // Validate authentication
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            // Validate input data
            if (!profileData || typeof profileData !== 'object') {
                throw new Error('Invalid profile data provided');
            }

            console.log('📤 updateProfile: Profile data being sent:', profileData);
            console.log('📤 updateProfile: Profile data JSON:', JSON.stringify(profileData, null, 2));
            
            const result = await this.patch<UserProfile>('updateUserProfile', profileData);
            
            if (!result) {
                throw new Error('No response received from profile update');
            }

            console.log('✅ updateProfile: Profile updated successfully');
            console.log('📥 updateProfile: Response:', result);
            
            return result;

        } catch (error: any) {
            console.error('❌ updateProfile: Failed to update profile:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
                profileData: profileData
            });

            // Provide specific error messages based on error type
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (error.response?.status === 400) {
                throw new Error(`Invalid profile data: ${error.response?.data?.message || 'Please check your input'}`);
            } else if (error.response?.status === 404) {
                throw new Error('Profile not found. Please contact support.');
            } else if (error.response?.status >= 500) {
                throw new Error('Server error. Please try again later.');
            } else if (error.message.includes('Network Error') || error.code === 'NETWORK_ERROR') {
                throw new Error('Network connection failed. Please check your internet connection.');
            } else if (error.message.includes('timeout')) {
                throw new Error('Request timed out. Please try again.');
            } else {
                // For other errors, try to provide a meaningful message
                const errorMessage = error.message || 'Failed to update profile. Please try again.';
                throw new Error(errorMessage);
            }
        }
    }

    // ===== Survey Methods =====
    /**
     * Submit survey data and complete onboarding (merged function)
     * This combines survey submission + onboarding completion into one function
     */
    async submitSurveyData(surveyData: {
        personality_scores?: Record<string, number> | {
            extraversion: number;
            agreeableness: number;
            conscientiousness: number;
            negativeEmotionality: number;
            openMindedness: number;
        };
        responses?: Record<string, any>;
        completion_time?: number;
        [key: string]: any;
    }): Promise<{
        surveyResult: any;
        onboardingResult: any;
        personality_scores: Record<string, number>;
    }> {
        // Trait to archetype mapping
        const traitToArchetype: Record<string, string> = {
            extraversion: "The Voice",
            agreeableness: "The Healer",
            conscientiousness: "The Architect",
            neuroticism: "The Mirror",
            openness: "The Seeker"
        };

        // Trait name mapping from hook to API
        const traitMapping: Record<string, string> = {
            extraversion: 'extraversion',
            agreeableness: 'agreeableness', 
            conscientiousness: 'conscientiousness',
            negativeEmotionality: 'neuroticism',
            openMindedness: 'openness'
        };

        try {
            console.log('🔄 submitSurveyData: Starting survey submission and onboarding completion...');
            console.log('Raw survey data:', surveyData);
            
            // Validate input data
            if (!surveyData || typeof surveyData !== 'object') {
                throw new Error('Invalid survey data: must be an object');
            }

            // Get current user profile to check research group
            const profile = await this.getProfile();
            console.log('Current user profile:', profile);
            
            // Check if user is admin or test user
            const isAdminOrTestUser = profile?.username === 'admin' || 
                                    profile?.profile?.completion_type === 'test' ||
                                    profile?.profile?.completion_type === 'character';
            
            console.log('Is admin or test user:', isAdminOrTestUser);
            console.log('Username:', profile?.username);
            console.log('Completion type:', profile?.profile?.completion_type);
            console.log('Research group:', profile?.profile?.research_group);
            
            // Format personality scores to match backend structure
            console.log('=== PERSONALITY SCORES DEBUG ===');
            console.log('Raw surveyData.personality_scores:', surveyData.personality_scores);
            console.log('Type of personality_scores:', typeof surveyData.personality_scores);
            console.log('Is personality_scores null/undefined:', surveyData.personality_scores == null);
            
            // Ensure we have valid personality scores, with fallback to calculated values
            let formattedScores;
            if (surveyData.personality_scores && typeof surveyData.personality_scores === 'object') {
                // Handle both Record<string, number> and TraitAverages types
                const scores = surveyData.personality_scores;
                formattedScores = {
                    extraversion: 'extraversion' in scores ? scores.extraversion : 0,
                    agreeableness: 'agreeableness' in scores ? scores.agreeableness : 0,
                    conscientiousness: 'conscientiousness' in scores ? scores.conscientiousness : 0,
                    neuroticism: 'neuroticism' in scores ? scores.neuroticism : 
                                'negativeEmotionality' in scores ? scores.negativeEmotionality : 0,
                    openness: 'openness' in scores ? scores.openness : 
                             'openMindedness' in scores ? scores.openMindedness : 0
                };
            } else {
                console.warn('No valid personality_scores found, using fallback values');
                // Calculate from responses if available
                const responses = surveyData.responses || {};
                const traitCounts = {
                    extraversion: 0,
                    agreeableness: 0,
                    conscientiousness: 0,
                    neuroticism: 0,
                    openness: 0
                };
                const traitSums = {
                    extraversion: 0,
                    agreeableness: 0,
                    conscientiousness: 0,
                    neuroticism: 0,
                    openness: 0
                };
                
                // Map question IDs to traits (this should match your QUESTIONS array)
                const questionToTrait: Record<number, keyof typeof traitSums> = {
                    1: 'extraversion', 2: 'agreeableness', 3: 'conscientiousness', 4: 'neuroticism', 5: 'openness',
                    6: 'extraversion', 7: 'agreeableness', 8: 'conscientiousness', 9: 'neuroticism', 10: 'openness',
                    11: 'extraversion', 12: 'agreeableness', 13: 'conscientiousness', 14: 'neuroticism', 15: 'openness'
                };
                
                Object.entries(responses).forEach(([questionId, answerValue]) => {
                    const trait = questionToTrait[parseInt(questionId)];
                    if (trait && typeof answerValue === 'number') {
                        traitSums[trait] += answerValue;
                        traitCounts[trait] += 1;
                    }
                });
                
                formattedScores = {
                    extraversion: traitCounts.extraversion > 0 ? traitSums.extraversion / traitCounts.extraversion : 0,
                    agreeableness: traitCounts.agreeableness > 0 ? traitSums.agreeableness / traitCounts.agreeableness : 0,
                    conscientiousness: traitCounts.conscientiousness > 0 ? traitSums.conscientiousness / traitCounts.conscientiousness : 0,
                    neuroticism: traitCounts.neuroticism > 0 ? traitSums.neuroticism / traitCounts.neuroticism : 0,
                    openness: traitCounts.openness > 0 ? traitSums.openness / traitCounts.openness : 0
                };
            }
            
            console.log('Formatted personality scores:', formattedScores);
            console.log('=== END PERSONALITY SCORES DEBUG ===');
            
            // Use the research group that was already assigned during onboarding
            const researchGroup = profile?.profile?.research_group?.condition;
            console.log(`=== SURVEY SUBMISSION - RESEARCH GROUP CHECK ===`);
            console.log(`User research group: ${researchGroup}`);
            console.log('Full research group object:', profile?.profile?.research_group);
            console.log('Profile completion type:', profile?.profile?.completion_type);
            
            // Calculate the dominant trait
            const dominantTrait = Object.keys(formattedScores).reduce((a, b) => 
                formattedScores[a as keyof typeof formattedScores] > formattedScores[b as keyof typeof formattedScores] ? a : b
            );
            
            // Use updateUserProfile endpoint for all users to ensure compatibility
            console.log('Using updateUserProfile endpoint for survey submission');
            
            const profilePayload = {
                personality_scores: formattedScores,
                primary_trait: dominantTrait,
                assigned_archetype: traitToArchetype[dominantTrait] || 'Unknown',
                survey_completed_at: new Date().toISOString(),
                completion_type: 'survey',
                onboarding_completed: true
            };
            
            console.log('=== SURVEY PROFILE PAYLOAD ===');
            console.log('Full payload:', JSON.stringify(profilePayload, null, 2));
            console.log('Personality scores in payload:', profilePayload.personality_scores);
            console.log('================================');
            
            const surveyResult = await this.updateProfile(profilePayload);
            console.log('✅ Survey submitted via updateProfile:', surveyResult);
            
            // For Group B users, we also need to submit to the research endpoint for data collection
            if (researchGroup === 'B') {
                console.log('Group B user - also submitting to research endpoint...');
                try {
                    const researchPayload = {
                        survey_type: 'big_five_personality',
                        personality_scores: formattedScores,
                        answers: surveyData.responses || {},
                        trait_averages: formattedScores,
                        completion_time: surveyData.completion_time_seconds || 0,
                        metadata: {
                            version: surveyData.version,
                            started_at: surveyData.started_at,
                            completed_at: surveyData.completed_at,
                            total_questions: surveyData.total_questions,
                            questions_answered: surveyData.questions_answered,
                            completion_percentage: surveyData.completion_percentage,
                            response_distribution: surveyData.response_distribution,
                            trait_counts: surveyData.trait_counts,
                            response_variance: surveyData.response_variance,
                            user_agent: surveyData.user_agent,
                            platform: surveyData.platform,
                            onboarding_path: surveyData.onboarding_path,
                            app_version: surveyData.app_version,
                            is_admin_or_test_user: isAdminOrTestUser
                        }
                    };
                    
                    console.log('=== GROUP B RESEARCH PAYLOAD ===');
                    console.log('Full payload:', JSON.stringify(researchPayload, null, 2));
                    console.log('================================');
                    
                    const researchResult = await this.post('personalitySurveySubmit', researchPayload);
                    console.log('✅ Research data submitted successfully:', researchResult);
                } catch (researchError) {
                    console.warn('⚠️ Failed to submit to research endpoint, but survey data was saved:', researchError);
                    // Don't fail the entire survey submission if research endpoint fails
                }
            }
            
            // Complete onboarding for survey path
            console.log('🔄 Completing onboarding for survey path...');
            const onboardingResult = await this.completeOnboarding('survey');
            console.log('✅ Onboarding completed successfully:', onboardingResult);
            
            return {
                surveyResult,
                onboardingResult,
                personality_scores: formattedScores
            };
        } catch (error: any) {
            console.error('❌ Error submitting survey data and completing onboarding:', error);
            if (error.response) {
                console.error('API Response details:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            throw new Error(`Failed to submit survey data and complete onboarding: ${error.message || 'Unknown error'}`);
        }
    }

    async completeOnboarding(path: 'character' | 'survey'): Promise<UserProfile> {
        try {
            console.log('🔄 completeOnboarding: Starting onboarding completion...');
            console.log('Onboarding path:', path);
            
            // Validate input
            if (!path || !['character', 'survey'].includes(path)) {
                throw new Error('Invalid onboarding path: must be "character" or "survey"');
            }
            
            // Check if user is already onboarded
            const currentProfile = await this.getProfile();
            if (currentProfile?.profile?.has_completed_onboarding) {
                console.log('⚠️ User already completed onboarding, returning current profile');
                return currentProfile;
            }
            
            // Determine research condition based on path
            const researchCondition = path === 'character' ? 'A' : 'B';
            console.log(`Assigning user to research group ${researchCondition} for ${path} path`);
            
            // Update the user profile with onboarding completion data
            const onboardingData = {
                has_completed_onboarding: true,
                completion_type: path,
                research_group: researchCondition,
                onboarding_completed_at: new Date().toISOString()
            };

            console.log('Updating profile with onboarding data:', onboardingData);
            const updatedProfile = await this.updateProfile(onboardingData);
            console.log('✅ Onboarding completed successfully:', updatedProfile);
            return updatedProfile;
            
        } catch (error: any) {
            console.error('❌ Error completing onboarding:', error);
            
            // Check if this is a network/CORS error (common on web platform)
            const isNetworkError = error.code === 'ERR_NETWORK' || 
                                 error.message === 'Network Error' ||
                                 error.message?.includes('ERR_NETWORK_CHANGED') ||
                                 error.message?.includes('ERR_FAILED');
            
            if (isNetworkError) {
                console.warn('⚠️ Network error detected - creating local fallback for web platform');
                
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
                
                console.log('✅ Mock onboarding profile created for web platform:', mockProfile);
                return mockProfile;
            }
            
            // Log detailed error information
            if (error.response) {
                console.error('API Response details:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
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
            console.log('No existing survey found or error checking:', error);
            return null;
        }
    }

    // Get the most recent survey data for debugging
    async getMostRecentSurvey(): Promise<any> {
        try {
            console.log('=== GETTING MOST RECENT SURVEY ===');
            
            // Try multiple endpoints to find survey data
            const endpoints: Array<keyof typeof API_ENDPOINTS> = [
                'personalitySurveyMySurvey',
                'personalitySurveys'
            ];
            
            for (const endpoint of endpoints) {
                try {
                    console.log(`Trying endpoint: ${endpoint}`);
                    const response = await this.get(endpoint);
                    
                    if (response) {
                        console.log(`Found survey data from ${endpoint}:`, response);
                        return response;
                    }
                } catch (endpointError: any) {
                    console.log(`Endpoint ${endpoint} failed:`, endpointError.response?.status || endpointError.message);
                }
            }
            
            console.log('No survey data found from any endpoint');
            return null;
        } catch (error: any) {
            console.error('Error getting most recent survey:', error);
            return null;
        }
    }
    

    // Helper method to determine primary trait
   // private getPrimaryTrait(scores: any): string {
   //     const entries = Object.entries(scores);
  //      const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
  //      return sorted[0][0];
   // }

    /**
     * Complete the character creator onboarding flow (Research Condition A)
     * This combines character creation + onboarding completion
     */
    async completeCharacterOnboarding(characterData: Character): Promise<{
        characterResult: Character;
        onboardingResult: UserProfile;
    }> {
        try {
            
            
            // Validate that character data includes the name
            if (!characterData.name || characterData.name.trim() === '') {
                throw new Error('Character name is required for character creation');
            }
            
            // Ensure we have all necessary character customization data
            const completeCharacterData: Character = {
                id: characterData.id || 0, // Use 0 for new characters
                experience_needed: characterData.experience_needed || 100, // Default experience needed

                name: characterData.name,
                // Visual customization data
                selected_base_model: characterData.selected_base_model || 1,
                selected_skin_color: characterData.selected_skin_color || 1,
                selected_hair_style: characterData.selected_hair_style || 1,
                selected_hair_color: characterData.selected_hair_color || 1,
                selected_eye_type: characterData.selected_eye_type || 1,
                selected_eye_color: characterData.selected_eye_color || 1,
                selected_eyebrow_style: characterData.selected_eyebrow_style || 1,
                selected_eyebrow_color: characterData.selected_eyebrow_color || 1,
                selected_mouth_type: characterData.selected_mouth_type || 1,
                selected_shirt_type: characterData.selected_shirt_type || 1,
                selected_background_type: characterData.selected_background_type || 1,
                user: 0,
                level: 0,
                experience: 0,
                awareness: 0,
                resilience: 0,
                connection: 0,
                balance: 0,
                coins: 0,
                crystals: 0,
                memories_explored: 0,
                coping_skills_learned: 0,
                insights_discovered: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
    
            
            // First create the character
            const characterResult = await this.createCharacter(completeCharacterData);
    
            
            // Then complete the onboarding
            const onboardingResult = await this.completeOnboarding('character');
            console.log('Onboarding completed successfully:', onboardingResult);
            
            return {
                characterResult,
                onboardingResult
            };
        } catch (error: any) {
            console.error('Failed to complete character onboarding:', error);
            throw error;
        }
    }

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

//            console.log('=== CHECKING ONBOARDING STATUS ===');
            const profile = await this.getProfile();
 //           console.log('Profile response:', profile);
            
            // Extract user info from profile
            const user = profile;
            const userProfile = profile?.profile;
            
            // Check if user is admin or test user
            const isAdminUser = user?.username === 'admin';
            const isTestUser = user?.is_test_user || false;
            
            // Admin and test users ALWAYS go through onboarding (never marked as completed)
            if (isAdminUser || isTestUser) {
                
        //        console.log('Admin or test user detected - forcing onboarding to always be available');
        //        console.log('User type:', { isAdmin: isAdminUser, isTest: isTestUser });
                
                const result = {
                    isOnboarded: false, // Always false for admin/test users
                    researchCondition: undefined,
                    completionType: undefined,
                    username: user?.username || 'unknown',
                    isTestUser: isTestUser
                };
                
        //        console.log('Admin/Test user onboarding status result:', result);
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
            
        //    console.log('Regular user onboarding status check result:', result);
            return result;
        } catch (error: any) {
      //      console.error('Error checking onboarding status:', error);
            
            // Handle different types of errors gracefully
            if (error.response?.status === 404) {
        //        console.log('User profile endpoint not found (404) - returning default status');
            } else if (error.response?.status === 401) {
        //        console.log('User not authenticated (401) - returning default status');
            } else {
       //         console.log('Other error checking onboarding status:', error.message);
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
            console.error('Error checking survey completion status:', error);
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
    //        console.error('Error getting user completion type:', error);
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
            console.log('=== GETTING MY CHARACTER ===');
            const result = await this.get<Character>('characters', { urlSuffix: 'my_character/' });
            console.log('✅ My character loaded successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting my character:', error);
            throw error;
        }
    }

    async getCharacterById(characterId: number): Promise<Character> {
        try {
            console.log('=== GETTING CHARACTER BY ID ===');
            console.log('Character ID:', characterId);
            const result = await this.get<Character>('characters', { urlSuffix: `${characterId}/` });
            console.log('✅ Character loaded successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Error getting character by ID:', error);
            throw error;
        }
    }

    // Note: getCharacterHomeData is redundant - use getProfile() instead
    // This method is kept for backward compatibility but should not be used
    async getCharacterHomeData(): Promise<UserProfile> {
        console.warn('⚠️ getCharacterHomeData is deprecated - use getProfile() instead');
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
            console.log('🔄 getUserData: Determining user completion type...');
            
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
                console.log('✅ getUserData: User has character data, returning profile with character data');
                return profile;
            }
            
            // If no character data, return the basic profile (for survey users)
            console.log('✅ getUserData: User has no character data, returning basic profile');
            return profile;
            
        } catch (error: any) {
            console.error('❌ getUserData: Failed to get user data:', error);
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
        console.log('=== GAIN EXPERIENCE API CALL ===');
        console.log('Character ID:', characterId);
        console.log('Experience:', experience);
        console.log('Source:', source);
        console.log('Endpoint:', API_ENDPOINTS.gainExperience);
        console.log('URL Suffix:', `${characterId}/gain_experience/`);
        console.log('Full URL will be:', `${apiBaseUrl}${API_ENDPOINTS.gainExperience}${characterId}/gain_experience/`);
        
        const payload = { experience, source };
        
        try {
            const result = await this.post<Character & {
                experience_gained: number;
                source: string;
                level_up?: boolean;
                levels_gained?: number;
                message?: string;
            }>('gainExperience', payload, { urlSuffix: `${characterId}/gain_experience/` });
            console.log('✅ Gain experience API call successful:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Gain experience API call failed:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
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
        console.log('=== GAIN RESONANCE API CALL ===');
        console.log('Character ID:', characterId);
        console.log('Resonance:', resonance);
        console.log('Source:', source);
        console.log('URL Suffix:', `${characterId}/gain_resonance/`);
        console.log('Full URL will be:', `${apiBaseUrl}characters/characters/${characterId}/gain_resonance/`);
        
        try {
            const result = await this.post<Character & {
                resonance_gained: number;
                source: string;
                resonance_up?: boolean;
                message?: string;
            }>('gainExperience', { resonance, source }, { urlSuffix: `${characterId}/gain_resonance/` });
            console.log('✅ Gain resonance API call successful:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Gain resonance API call failed:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
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
            console.log('=== GETTING AVAILABLE COPING TOOLS ===');
            const result = await this.get<CopingTool[]>('availableCopingTools');
            console.log('Available coping tools:', result);
            return result;
        } catch (error: any) {
            console.error('Failed to get available coping tools:', error);
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
            console.log('=== GETTING MY TOOLS ===');
            const result = await this.get<CopingTool[]>('myTools');
            console.log('My tools:', result);
            return result;
        } catch (error: any) {
            console.error('Failed to get my tools:', error);
            throw error;
        }
    }

    /**
     * Get equipped coping tools
     * Endpoint: /api/characters/character-tools/equipped/
     */
    async getEquippedTools(): Promise<CopingTool[]> {
        try {
            console.log('=== GETTING EQUIPPED TOOLS ===');
            const result = await this.get<CopingTool[]>('equippedTools');
            console.log('Equipped tools:', result);
            return result;
        } catch (error: any) {
            console.error('Failed to get equipped tools:', error);
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
            console.log('=== ACQUIRING COPING TOOL ===');
            console.log('Tool ID:', toolId);
            const payload = { tool_id: toolId };
            console.log('Payload:', payload);
            
            const result = await this.post<CopingTool>('characterTools', payload);
            console.log('✅ Coping tool acquired successfully:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Failed to acquire coping tool:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
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
            console.log('=== EQUIPPING TOOL ===');
            console.log('Character Tool ID:', characterToolId);
            
            const result = await this.post<{ message: string; tool: CopingTool }>('equipTool', {}, { urlSuffix: `${characterToolId}/equip/` });
            console.log('✅ Tool equipped successfully:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Failed to equip tool:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
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
            console.log('=== UNEQUIPPING TOOL ===');
            console.log('Character Tool ID:', characterToolId);
            
            const result = await this.post<{ message: string; tool: CharacterGear }>('unequipTool', {}, { urlSuffix: `${characterToolId}/unequip/` });
            console.log('✅ Tool unequipped successfully:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Failed to unequip tool:', error);
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
            console.log('=== USING TOOL ===');
            console.log('Character Tool ID:', characterToolId);
            console.log('Effectiveness Rating:', effectivenessRating);
            console.log('Notes:', notes);
            
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
            console.log('✅ Tool used successfully:', result);
            return result;
        } catch (error: any) {
            console.error('❌ Failed to use tool:', error);
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
            console.error('Failed to find coping tool by name:', error);
            return null;
        }
    }

    /**
     * Helper method to acquire a coping tool by name (for personality users)
     * This combines finding the tool and acquiring it
     */
    async acquireCopingToolByName(toolName: string): Promise<CopingTool | null> {
        try {
            console.log('=== ACQUIRING COPING TOOL BY NAME ===');
            console.log('Tool name:', toolName);
            
            // First find the tool
            const tool = await this.findCopingToolByName(toolName);
            if (!tool) {
                console.error('❌ Coping tool not found:', toolName);
                return null;
            }
            
            console.log('Found tool:', tool);
            
            // Check if user already has this tool
            try {
                const myTools = await this.getMyTools();
                const alreadyHasTool = myTools.some(characterTool => 
                    characterTool.tool_id === String(tool.id) || 
                    characterTool.name === tool.name
                );
                
                if (alreadyHasTool) {
                    console.log('⚠️ User already has this coping tool:', tool.name);
                    const existingTool = myTools.find(characterTool => 
                        characterTool.id === tool.id || 
                        characterTool.name === tool.name
                    );
                    return existingTool || null;
                }
            } catch (error) {
                console.warn('Could not check existing tools, proceeding with acquisition:', error);
            }
            
            // Then acquire it
            const acquiredTool = await this.acquireCopingTool(tool.id);
            console.log('✅ Tool acquired by name successfully:', acquiredTool);
            
            return acquiredTool;
        } catch (error: any) {
            console.error('❌ Failed to acquire coping tool by name:', error);
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
            console.log('=== UNLOCKING AND EQUIPPING COPING TOOL ===');
            console.log('Tool name:', toolName);
            
            // First acquire the tool
            const acquiredTool = await this.acquireCopingToolByName(toolName);
            if (!acquiredTool) {
                console.error('❌ Could not acquire tool for equipping:', toolName);
                return { acquired: null, equipped: null };
            }
            
            // Then equip it
            try {
                const equippedResult = await this.equipTool(acquiredTool.id);
                console.log('✅ Tool unlocked and equipped successfully:', toolName);
                return { acquired: acquiredTool, equipped: equippedResult };
            } catch (equipError) {
                console.warn('⚠️ Tool acquired but could not be equipped:', equipError);
                // Return the acquired tool even if equipping failed
                return { acquired: acquiredTool, equipped: null };
            }
        } catch (error: any) {
            console.error('❌ Failed to unlock and equip coping tool:', error);
            return { acquired: null, equipped: null };
        }
    }

    // REMOVED: getToolUsageStats() - endpoint not implemented    // ===== JOURNAL & CODEX METHODS (matching your Django backend) =====
    // ===== JOURNAL PROMPTS =====
    async getJournalPrompts(): Promise<JournalPrompt[]> {
        try {
            console.log('=== GETTING JOURNAL PROMPTS ===');
            
            // Try the journal prompts endpoint first
            const data = await this.get<JournalPrompt[]>('journalPrompts');
            const prompts = Array.isArray(data) ? data : [];
            
            console.log(`✅ Found ${prompts.length} journal prompts`);
            return prompts;
        } catch (error: any) {
            console.error('❌ Failed to get journal prompts:', error);
            
            // If journal prompts endpoint doesn't exist, provide fallback prompts
            if (error?.response?.status === 404) {
                console.log('ℹ️ Journal prompts endpoint not found - using fallback prompts');
                return this.getFallbackPrompts();
            }
            
            return [];
        }
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
            console.log('=== GETTING ALL JOURNAL PROMPTS (ADMIN ONLY) ===');
            
            // Use the main endpoint to get all prompts (admin only)
            const data = await this.get<JournalPrompt[]>('journalPrompts');
            const prompts = Array.isArray(data) ? data : [];
            
            console.log(`✅ Found ${prompts.length} total journal prompts (admin view)`);
            return prompts;
        } catch (error) {
            console.error('❌ Failed to get all journal prompts:', error);
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
        console.log('=== GETTING PROMPTS BY CATEGORY ===');
        
        // Get daily prompts - backend should return one prompt per category per day
        const dailyPrompts = await this.getJournalPrompts();

        const pick = (cat: 'journal'|'draw'|'voice') =>
            dailyPrompts.find(p => p.category === cat) || null;

        const result = {
            journal: pick('journal'),
            draw:    pick('draw'),
            voice:   pick('voice'),
        };

        console.log('✅ Prompts by category:', {
            journal: result.journal?.text || 'None',
            draw: result.draw?.text || 'None', 
            voice: result.voice?.text || 'None'
        });

        return result;
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
            console.log('=== CREATING CODEX ENTRY ===');
            console.log('Payload:', payload);
            console.log('Character ID provided:', characterId);
            
            // Validate payload using enhanced validation
            const validation = this.validateEntryData(payload);
            if (!validation.isValid) {
                throw new Error(validation.error);
            }
            
            // ALL users now use the journal/codex-entries/ endpoint for compliance
            console.log('� Using journal/codex-entries/ endpoint for all users');
            
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
                console.log('✅ Added character ID for proper association:', characterId);
            } else {
                console.warn('⚠️ No character ID provided - entry may not be associated correctly');
            }
            
            const data = await this.post<CodexEntry>('codexEntries', requestPayload);
            console.log('✅ Codex entry created successfully:', data);
            return data;
        } catch (error) {
            console.error('❌ Failed to create codex entry:', error);
            const friendlyMessage = this.handleJournalApiError(error);
            throw new Error(friendlyMessage);
        }
    }

    // Debug method to test journal endpoints for different user types
    async debugJournalEndpoints() {
        try {
            console.log('🧪 === DEBUGGING JOURNAL ENDPOINTS ===');
            
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
                console.warn('Could not check user type');
            }
            
            console.log('👤 Current user info:', {
                isAdmin: isAdminUser,
                username: userData?.username || 'unknown'
            });
            
            // Test journal prompts
            console.log('\n📋 Testing journal prompts...');
            try {
                const prompts = await this.getJournalPrompts();
                console.log(`✅ Journal prompts: ${prompts.length} found`);
            } catch (error) {
                console.error('❌ Journal prompts failed:', error);
            }
            
            // Test getting existing entries
            console.log('\n📖 Testing get entries...');
            try {
                const entries = await this.getUserCodexEntries();
                console.log(`✅ User entries: ${entries.length} found`);
            } catch (error) {
                console.error('❌ Get entries failed:', error);
            }
            
            // Test specific endpoints based on user type
            if (isAdminUser) {
                console.log('\n🔧 Testing admin-specific endpoints...');
                try {
                    const adminEntries = await this.get<any[]>('codexEntries');
                    console.log(`✅ Admin journal entries: ${adminEntries.length} found`);
                } catch (error) {
                    console.error('❌ Admin journal entries failed:', error);
                }
            } else {
                console.log('\n👤 Testing regular user endpoints...');
                try {
                    const reflectionEntries = await this.get<any[]>('myReflections');
                    console.log(`✅ My reflections: ${reflectionEntries.length} found`);
                } catch (error) {
                    console.error('❌ My reflections failed:', error);
                }
                
                try {
                    const recentEntries = await this.get<any[]>('recentReflections');
                    console.log(`✅ Recent reflections: ${recentEntries.length} found`);
                } catch (error) {
                    console.error('❌ Recent reflections failed:', error);
                }
            }
            
            console.log('\n🎉 Journal endpoints debug completed!');
            
        } catch (error) {
            console.error('❌ Debug failed:', error);
        }
    }

    // ===== NEW API FUNCTIONS FOR FULL BACKEND COMPLIANCE =====

    /**
     * Get available (unlocked, not completed) journal prompts
     * Endpoint: /api/journal/journal-prompts/available/
     */
    async getAvailableJournalPrompts(characterId?: number): Promise<JournalPrompt[]> {
        try {
            console.log('=== GETTING AVAILABLE JOURNAL PROMPTS ===');
            console.log('Character ID:', characterId);
            
            const result = await this.get<JournalPrompt[]>('journalPromptsAvailable');
            const prompts = Array.isArray(result) ? result : [];
            console.log(`✅ Found ${prompts.length} available journal prompts`);
            return prompts;
        } catch (error) {
            console.error('❌ Failed to get available journal prompts:', error);
            // Fallback to regular prompts if available endpoint fails
            console.log('🔄 Falling back to regular journal prompts...');
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
            console.log('=== GETTING DAILY JOURNAL PROMPT ===');
            
            const result = await this.get<any>('journalPromptsDaily');
            console.log('✅ Daily prompt response:', result);
            
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
            console.error('❌ Failed to get daily prompt:', error);
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
            console.log('=== GETTING COMPLETED JOURNAL PROMPTS ===');
            
            const result = await this.get<JournalPrompt[]>('journalPromptsCompleted');
            const prompts = Array.isArray(result) ? result : [];
            console.log(`✅ Found ${prompts.length} completed journal prompts`);
            return prompts;
        } catch (error) {
            console.error('❌ Failed to get completed prompts:', error);
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
            console.log('=== GETTING CODEX STATISTICS ===');
            
            const result = await this.get<any>('codexEntriesStats');
            console.log('✅ Codex stats:', result);
            
            return {
                total_entries: result.total_entries || 0,
                entries_by_type: result.entries_by_type || { journal: 0, draw: 0, voice: 0 },
                total_prompts_completed: result.total_prompts_completed || 0,
                streak_days: result.streak_days || 0,
                last_entry_date: result.last_entry_date || null
            };
        } catch (error) {
            console.error('❌ Failed to get codex stats:', error);
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
            console.log('=== GETTING RECENT ENTRIES ===');
            console.log('Limit:', limit);
            
            const result = await this.get<CodexEntry[]>('codexEntriesRecent', { 
                urlSuffix: `?limit=${limit}` 
            });
            const entries = Array.isArray(result) ? result : [];
            console.log(`✅ Found ${entries.length} recent entries`);
            return entries;
        } catch (error) {
            console.error('❌ Failed to get recent entries:', error);
            return [];
        }
    }

    /**
     * Get journal prompts by story tag
     * Endpoint: /api/journal/journal-prompts/by_story_tag/?tag={tag}
     */
    async getPromptByStoryTag(tag: string): Promise<JournalPrompt[]> {
        try {
            console.log('=== GETTING PROMPTS BY STORY TAG ===');
            console.log('Tag:', tag);
            
            const result = await this.get<JournalPrompt[]>('journalPromptsByStoryTag', {
                urlSuffix: `?tag=${encodeURIComponent(tag)}`
            });
            const prompts = Array.isArray(result) ? result : [];
            console.log(`✅ Found ${prompts.length} prompts for tag "${tag}"`);
            return prompts;
        } catch (error) {
            console.error('❌ Failed to get prompts by story tag:', error);
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
            console.log('=== UPDATING CODEX ENTRY ===');
            console.log('Entry ID:', id);
            console.log('Update data:', data);
            
            // This endpoint only allows updating entries owned by the current authenticated user
            const result = await this.patch<CodexEntry>('codexEntries', data, { urlSuffix: `${id}/` });
            console.log('✅ Codex entry updated successfully:', result);
            return result;
        } catch (error) {
            console.error('❌ Failed to update codex entry:', error);
            throw error;
        }
    }

    async getCodexEntriesByPrompt(promptId: number) {
        try {
            console.log('=== GETTING CODEX ENTRIES BY PROMPT ===');
            console.log('Prompt ID:', promptId);
            
            // Use the main codex entries endpoint - DRF ViewSet automatically filters by user
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];
            
            // Filter client-side for the specific prompt
            const filteredEntries = allEntries.filter(entry => (entry as any).prompt === promptId);
            console.log(`✅ Found ${filteredEntries.length} entries for prompt ${promptId}`);
            
            return filteredEntries;
        } catch (error) {
            console.error('❌ Failed to get codex entries by prompt:', error);
            return [];
        }
    }

    async getRecentCodexEntries(limit = 20) {
        try {
            console.log('=== GETTING RECENT CODEX ENTRIES ===');
            console.log('Limit:', limit);
            
            // ALL users now use the journal/codex-entries/ endpoint for compliance
            console.log('� Using journal/codex-entries/ endpoint for all users');
            
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
            console.log(`✅ Found ${recentEntries.length} recent entries`);
            return recentEntries;
            
        } catch (error) {
            console.error('❌ Failed to get recent codex entries:', error);
            return [];
        }
    }

    async getMyCodexEntries(): Promise<CodexEntry[]> {
        try {
            console.log('=== GETTING MY CODEX ENTRIES ===');
            
            // Use the my_reflections endpoint which exists in the backend
            return await this.getUserCodexEntries();
        } catch (error) {
            console.error('❌ Failed to get my codex entries:', error);
            return [];
        }
    }

    async getAllCodexEntries(): Promise<CodexEntry[]> {
        try {
            console.log('=== GETTING ALL CODEX ENTRIES (ADMIN ONLY) ===');
            
            // This should only be used for admin purposes
            // For regular users, use getUserCodexEntries() instead
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];
            
            console.log(`✅ Found ${allEntries.length} total codex entries (admin view)`);
            return allEntries;
        } catch (error) {
            console.error('❌ Failed to get all codex entries:', error);
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
            console.log('=== MARKING PROMPT AS INACTIVE ===');
            console.log('Prompt ID:', promptId);
            
            // Update the prompt to mark it as inactive (completed for the day)
            await this.patch('journalPrompts', { is_active: false }, { urlSuffix: `${promptId}/` });
            console.log('✅ Prompt marked as inactive successfully');
        } catch (error) {
            console.error('❌ Failed to mark prompt as inactive:', error);
            // Don't throw - this is not critical functionality
        }
    }

    async getUserCodexEntries(): Promise<CodexEntry[]> {
        try {
            console.log('=== GETTING USER CODEX ENTRIES ===');
            
            // ALL users now use the journal/codex-entries/ endpoint for compliance
            console.log('� Using journal/codex-entries/ endpoint for all users');
            
            const result = await this.get<CodexEntry[]>('codexEntries');
            const allEntries = Array.isArray(result) ? result : [];
            console.log(`✅ Found ${allEntries.length} codex entries`);
            return allEntries;
            
        } catch (error) {
            console.error('❌ Failed to get user codex entries:', error);
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
            console.log('=== GETTING AVAILABLE GEAR TYPES ===');
            // Use direct endpoint for gear-types/available/
            const response = await apiClient.get<any[]>('gear-types/available/');
            console.log('Available gear types response:', response.data);
            return response.data || [];
        } catch (error: any) {
            console.error('Failed to get available gear types:', error);
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
            console.log('=== GETTING CHARACTER WITH GEAR ===');
            console.log('Character ID:', characterId);
            
            if (characterId != null) {
                return this.get<Character>('characters', { urlSuffix: `${characterId}/` });
            }
            return this.get<Character>('characters', { urlSuffix: 'my_character/' });
        } catch (error: any) {
            console.error('❌ Failed to get character with gear:', error);
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
            console.log('=== ACQUIRE GEAR PAYLOAD ===');
            console.log('Gear type ID:', gearTypeId);
            const payload = { gear_type_id: gearTypeId };
            console.log('Payload:', payload);
            
            // First check if the character already has this gear
            const myGear = await this.getMyGear();
            const alreadyHasGear = myGear.some(gear => gear.gear_type.id === gearTypeId);
            
            if (alreadyHasGear) {
                console.log('Character already has this gear type, skipping acquisition');
                return myGear.find(gear => gear.gear_type.id === gearTypeId)!;
            }
            
            const result = await this.post<CharacterGear>('acquireGear', payload);
            console.log('✅ Gear acquired successfully:', result);
            return result;
        } catch (error: any) {
            console.error('Failed to acquire gear:', error);
            // If it's a duplicate key error, the gear already exists
            if (error.response?.status === 500 && error.response?.data?.includes('duplicate key')) {
                console.log('Gear already exists, returning existing gear');
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

        console.log('=== TESTING GEAR REWARD SYSTEM ===');

        try {
            // Step 1: Test getting available gear types
            console.log('Step 1: Testing available gear types...');
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
                console.log('✅ Available gear types loaded:', availableGear.length);
            } catch (error) {
                testSteps.push({
                    step: 'Get Available Gear Types',
                    success: false,
                    error: error
                });
                console.error('❌ Failed to get available gear types:', error);
            }

            // Step 2: Test getting character with equipped gear
            console.log('Step 2: Testing character with equipped gear...');
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
                console.log('✅ Character with equipped gear loaded:', character.equipped_gear?.length || 0, 'items');
            } catch (error) {
                testSteps.push({
                    step: 'Get Character With Equipped Gear',
                    success: false,
                    error: error
                });
                console.error('❌ Failed to get character with equipped gear:', error);
            }

            // Step 3: Test getting character's full gear inventory
            console.log('Step 3: Testing character\'s full gear inventory...');
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
                console.log('✅ Character gear inventory loaded:', myGear.length, 'items');
            } catch (error) {
                testSteps.push({
                    step: 'Get My Gear Inventory',
                    success: false,
                    error: error
                });
                console.error('❌ Failed to get character gear inventory:', error);
            }

            // Step 4: Test gear acquisition (dry run - find first available gear that character doesn't have)
            console.log('Step 4: Testing gear acquisition (dry run)...');
            try {
                const availableGear = await this.getAvailableGearTypes();
                const myGear = await this.getMyGear();
                
                // Find a gear type that the character doesn't have
                const unownedGear = availableGear.find(gearType => 
                    !myGear.some(characterGear => characterGear.gear_type?.id === gearType.id)
                );

                if (unownedGear) {
                    console.log('Found gear that character doesn\'t have:', unownedGear.name);
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
                console.error('❌ Failed gear acquisition test:', error);
            }

            const allSuccessful = testSteps.every(step => step.success);
            
            console.log('=== GEAR REWARD SYSTEM TEST RESULTS ===');
            testSteps.forEach(step => {
                const status = step.success ? '✅' : '❌';
                console.log(`${status} ${step.step}`);
                if (step.data) console.log('   Data:', step.data);
                if (step.error) console.log('   Error:', step.error);
            });

            return {
                success: allSuccessful,
                steps: testSteps
            };

        } catch (error) {
            console.error('❌ Gear reward system test failed:', error);
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
            console.warn('Failed to get game data from backend:', error);
            // Return a default game data structure to prevent cascading failures
            return {
                id: 0,
                user: 1,
                player_name: 'Default Player',
                score: 0,
                level: 1,
                last_played: new Date().toISOString(),
                current_story_id: null,
                current_passage_id: null,
                completed_prompts: [],
                total_entries: 0
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
            console.log('=== GETTING COMPREHENSIVE GAME DATA ===');
            console.log('Endpoint:', API_ENDPOINTS.gameData);
            console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.gameData}`);
            
            const response = await this.get<any>('gameData');
            console.log('Comprehensive game data loaded:', response);
            
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
            
            console.log('Formatted game data:', formattedData);
            return formattedData;
        } catch (error: any) {
            console.error('Failed to get comprehensive game data:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            
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

    // Helper method to get completed stories from game data
    async getCompletedStories(): Promise<string[]> {
        try {
            const gameData = await this.getGameData();
            const completedStories: string[] = [];
            
            // Handle different response structures
            if (gameData && Array.isArray(gameData)) {
                // Handle array response structure
                const userGameData = gameData[0] as any;
                if (userGameData && userGameData.progress) {
                    userGameData.progress.forEach((progress: any) => {
                        if (progress.player_state?.completed_stories) {
                            completedStories.push(...progress.player_state.completed_stories);
                        }
                    });
                }
            } else if (gameData && (gameData as any).progress) {
                // Handle single object response structure
                (gameData as any).progress.forEach((progress: any) => {
                    if (progress.player_state?.completed_stories) {
                        completedStories.push(...progress.player_state.completed_stories);
                    }
                });
            }
            
            // Remove duplicates and return
            return [...new Set(completedStories)];
        } catch (error) {
            console.warn('Failed to get completed stories from game data, returning empty array:', error);
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
                console.warn('Failed to get completed stories for skill categories, using default progression:', error);
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
            console.log('=== GETTING AVAILABLE STORIES ===');
            console.log('Endpoint:', API_ENDPOINTS.stories);
            console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.stories}`);
            
            const stories = await this.get<any[]>('stories');
            console.log('Available stories loaded:', stories?.length || 0);
            if (stories && stories.length > 0) {
                console.log('First story structure:', stories[0]);
                console.log('First story keys:', Object.keys(stories[0]));
            } else {
                console.log('No stories returned from catalog endpoint');
            }
            return stories;
        } catch (error: any) {
            console.error('Failed to load available stories:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url
            });
            throw error;
        }
    }

    /**
     * Fetch passages for a specific chapter
     */
    async getChapterPassages(storyId: number | string, chapterId: number | string): Promise<any[]> {
        try {
            console.log(`=== GETTING CHAPTER PASSAGES (IMPROVED) ===`);
            console.log(`Story ID: ${storyId}, Chapter ID: ${chapterId}`);
            
            // Make a direct API call to the correct URL: api/story/chapters/{chapterId}/passages/
            // Since there's no predefined endpoint for this, we'll construct the URL manually
            const response = await apiClient.get(`story/chapters/${chapterId}/passages/`);
            const passages = response.data;
            
            console.log(`✅ Loaded ${passages?.length || 0} passages for chapter ${chapterId}`);
            
            if (passages && passages.length > 0) {
                console.log(`First passage structure:`, passages[0]);
                console.log(`First passage keys:`, Object.keys(passages[0]));
            }
            
            return passages || [];
    
        } catch (error) {
            console.error(`❌ Failed to get passages for chapter ${chapterId}:`, error);
            this.handleError(error, 'GET', `chapters/${chapterId}/passages`);
            throw error;
        }
    }

    /**
     * Fetch all passages for a story
     */
    async getStorypassages(storyId: number): Promise<any> {
        try {
            console.log('=== GETTING ALL STORY PASSAGES ===');
            console.log('Story ID:', storyId);
            
            // Get chapters first
            const chapters = await this.getChapters(storyId);
            
            if (!chapters || chapters.length === 0) {
                console.log('No chapters found for story');
                return { passages: [] };
            }
            
            console.log(`Found ${chapters.length} chapters, loading passages for each`);
            
            // Load passages for each chapter
            const allPassages = [];
            for (const chapter of chapters) {
                try {
                    const chapterPassages = await this.getChapterPassages(storyId, chapter.id);
                    allPassages.push(...chapterPassages);
                } catch (error) {
                    console.warn(`Failed to load passages for chapter ${chapter.id}:`, error);
                }
            }
            
            console.log(`Total passages loaded: ${allPassages.length}`);
            
            
            return {
                id: storyId.toString(),
                title: 'Story Passages',
                passages: allPassages
            };
        } catch (error) {
            console.warn('Failed to get story passages:', error);
            return { passages: [] };
        }
    }

    /**
     * Fetch passages for a specific chapter within a story
     */
    async getStorypassagesFromChapter(storyId: number, chapterId: number): Promise<any> {
        try {
            console.log('=== GETTING STORY PASSAGES FROM CHAPTER ===');
            console.log('Story ID:', storyId);
            console.log('Chapter ID:', chapterId);
            
            // Get the specific chapter first
            const chapters = await this.getChapters(storyId);
            const targetChapter = chapters?.find((chapter: any) => chapter.id === chapterId);
            
            if (!targetChapter) {
                console.warn(`Chapter ${chapterId} not found in story ${storyId}`);
                return {
                    id: storyId.toString(),
                    title: `Chapter ${chapterId}`,
                    passages: []
                };
            }
            
            // Load passages for this specific chapter
            const chapterPassages = await this.getStorypassagesFromChapter(storyId, chapterId);
            
            console.log(`Loaded ${chapterPassages.length} passages for chapter ${chapterId}`);
            
            return {
                id: storyId.toString(),
                title: targetChapter.title || `Chapter ${chapterId}`,
                passages: chapterPassages
            };
        } catch (error) {
            console.warn('Failed to get chapter passages:', error);
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
            console.log('=== GETTING STORY PROGRESS ===');
            console.log('Story ID:', storyId);
            
            // Get all user progress records and filter by story ID
            const allProgress = await this.get<any[]>('getUserProgress');
            console.log('All progress records:', allProgress);
            
            if (!allProgress || allProgress.length === 0) {
                console.log('No progress records found');
                return null;
            }
            
            // Find progress for this specific story
            const storyProgress = allProgress.find((progress: any) => 
                progress.story === storyId || progress.story === parseInt(storyId as string)
            );
            
            if (storyProgress) {
                console.log('✅ Story progress found:', storyProgress);
                console.log('Progress ID (PK):', storyProgress.id);
                console.log('Story ID:', storyProgress.story);
                console.log('Current passage ID:', storyProgress.current_passage_id);
                console.log('Passages visited count:', storyProgress.passages_visited_count);
                console.log('Choices made count:', storyProgress.choices_made_count);
                console.log('Progress percentage:', storyProgress.progress_percentage);
            } else {
                console.log('❌ No progress found for story ID:', storyId);
            }
            
            return storyProgress || null;
        } catch (error) {
            console.error('Failed to get story progress:', error);
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
            console.log('=== CREATING STORY PROGRESS ===');
            console.log('Story ID:', storyId);
            console.log('Initial data:', initialData);
            
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
            
            console.log('Create progress payload:', payload);
            const result = await this.post<any>('createProgress', payload);
            console.log('Story progress created:', result);
            return result;
        } catch (error) {
            console.error('Failed to create story progress:', error);
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
            console.log('=== UPDATING STORY PROGRESS ===');
            console.log('Progress ID:', progressId);
            console.log('Update data:', updateData);
            
            // The endpoint is: /api/story/story-progress/{id}/ where id is the story-progress PK
            const result = await this.patch<any>('updateProgress', updateData, {
                urlSuffix: `${progressId}/`
            });
            
            console.log('✅ Story progress updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Failed to update story progress:', error);
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
            console.log('=== GET OR CREATE STORY PROGRESS ===');
            console.log('Story ID:', storyId);
            
            // First try to get existing progress
            const existingProgress = await this.getStoryProgress(storyId);
            
            if (existingProgress) {
                console.log('Existing progress found:', existingProgress);
                return existingProgress;
            }
            
            // If no existing progress, create new
            console.log('No existing progress found, creating new progress record');
            const newProgress = await this.createStoryProgress(storyId, initialData);
            console.log('New progress created:', newProgress);
            return newProgress;
        } catch (error) {
            console.error('Failed to get or create story progress:', error);
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
            console.log('=== CALCULATING PROGRESS PERCENTAGE ===');
            console.log('Story ID:', storyId);
            console.log('Progress ID (PK):', progressId);
            
            // Get current progress
            const currentProgress = await this.getStoryProgress(storyId);
            if (!currentProgress) {
                console.log('No progress found for story');
                return null;
            }
            
            // Get all passages for the story to calculate total
            const storyPassages = await this.getStorypassages(Number(storyId));
            const totalPassages = storyPassages?.passages?.length || 0;
            const visitedPassages = currentProgress.passages_visited?.length || 0;
            
            console.log('Total passages in story:', totalPassages);
            console.log('Passages visited:', visitedPassages);
            
            // Calculate progress percentage
            let progressPercentage = 0;
            if (totalPassages > 0) {
                progressPercentage = Math.round((visitedPassages / totalPassages) * 100);
            }
            
            // Cap at 100% if completed
            if (currentProgress.is_completed) {
                progressPercentage = 100;
            }
            
            console.log('Calculated progress percentage:', progressPercentage);
            
            // Now that the backend fields are writable, let's actually update the progress_percentage
            const updateData = {
                progress_percentage: progressPercentage
            };
            
            console.log('Updating progress percentage with data:', updateData);
            const result = await this.updateStoryProgress(progressId, updateData);
            console.log('Progress percentage update result:', result);
            return result;
        } catch (error) {
            console.error('Failed to calculate and update progress:', error);
            return null;
        }
    }

    /**
     * Mark a story as completed
     * This method updates the progress record to mark the story as completed
     */
    async completeStoryProgress(storyId: number | string, completionType: string = 'rewards_completion'): Promise<any> {
        try {
            console.log('=== COMPLETING STORY PROGRESS ===');
            console.log('Story ID:', storyId);
            console.log('Completion type:', completionType);
            
            // Get current progress
            const currentProgress = await this.getStoryProgress(storyId);
            if (!currentProgress) {
                console.log('No progress found for story');
                return null;
            }
            
            console.log('Found progress record with ID:', currentProgress.id);
            
            // Update progress to mark as completed
            const updateData = {
                is_completed: true,
                completion_type: completionType,
                completed_at: new Date().toISOString(),
                progress_percentage: 100
            };
            
            console.log('Updating progress with completion data:', updateData);
            const result = await this.updateStoryProgress(currentProgress.id, updateData);
            console.log('Story progress completion result:', result);
            return result;
        } catch (error) {
            console.error('Failed to complete story progress:', error);
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
            console.log('=== GETTING CHAPTERS FOR STORY ===');
            console.log('Story ID:', storyId);
            
            const chapters = await this.get<any[]>('storyChapters', { urlSuffix: `${storyId}/chapters/` });
            
            console.log('Chapters loaded:', chapters?.length || 0);
            if (chapters && chapters.length > 0) {
                console.log('First chapter structure:', chapters[0]);
                console.log('First chapter keys:', Object.keys(chapters[0]));
                if (chapters[0].passages) {
                    console.log('First chapter has passages:', chapters[0].passages.length);
                    console.log('First passage structure:', chapters[0].passages[0]);
                }
            }
            
            return chapters;
        } catch (error) {
            console.error('Failed to get chapters:', error);
            throw error;
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
            console.log(`=== GETTING PASSAGE ===`);
            console.log(`Story ID: ${storyId}`);
            console.log(`Passage ID: ${passageId}`);
            console.log(`Endpoint: storyPassage`);
            console.log(`URL Suffix: ${storyId}/passage/${passageId}/`);
            console.log(`Full URL: ${apiBaseUrl}story/stories/${storyId}/passage/${passageId}/`);
            
            const response = await this.get<any>('storyPassage', { urlSuffix: `${storyId}/passage/${passageId}/` });
            console.log(`✅ Passage response received:`, response);
            return response;
        } catch (error) {
            console.error(`❌ Failed to get passage ${passageId} for story ${storyId}:`, error);
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
            
            console.log(`🔄 Restarting story ${storyId} for chapter ${chapterId}`);
            console.log(`📤 Sending restart data:`, data);
            console.log(`📤 URL suffix with query param:`, urlSuffix);
        } else {
            console.log(`🔄 Restarting story ${storyId} (no specific chapter)`);
        }
        
        return this.post<any>('storyReset', data, { urlSuffix });
    }
    async makeChoice(storyId: number | string, targetPassageId: string, additionalPayload?: any) {
        console.log(`🚀 POSTing choice to backend: storyId=${storyId}, target_passage_id=${targetPassageId}`);
        
        const payload = {
          story_id: storyId,
          target_passage_id: targetPassageId,
          ...additionalPayload
        };
        
        console.log('Full payload:', payload);
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
            console.log('=== MAKING CHOICE ===');
            console.log('Story ID:', storyId);
            console.log('Target Passage ID:', targetPassageId);
            
            const payload = {
                story_id: storyId,
                target_passage_id: targetPassageId
            };
            
            console.log('Choice payload:', payload);
            
            // Use the new make_choice endpoint
            const response = await this.post<any>('makeChoice', payload);
            
            console.log('Choice response:', response);
            return response;
        } catch (error: any) {
            console.error('Failed to make choice:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
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
      console.log('=== GETTING PERSONALITY STORIES ===');
      console.log('Test personality:', testPersonality);
      
      const response = await this.get<any>('personalityStories', {
        urlSuffix: testPersonality ? `?personality=${testPersonality}` : ''
      });
      
      console.log('Personality stories response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get personality stories:', error);
      throw error;
    }
  }

  /**
   * Get all stories for admin/testing purposes
   * This endpoint allows admin and test users to see all stories
   */
  async getAdminTestStories(): Promise<any> {
    try {
      console.log('=== GETTING ADMIN TEST STORIES ===');
      console.log('Endpoint:', API_ENDPOINTS.adminTestStories);
      console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.adminTestStories}`);
      
      const response = await this.get<any>('adminTestStories');
      
      console.log('Admin test stories response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No keys');
      return response;
    } catch (error: any) {
      console.error('Failed to get admin test stories:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
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
      console.log('=== GETTING STORIES BY PERSONALITY ===');
      console.log('User personality type:', userPersonalityType);
      console.log('User personality type type:', typeof userPersonalityType);
      console.log('Include general stories:', includeGeneral);
      
      // Check if user is admin or test user
      const profile = await this.getProfile();
      const isAdminOrTestUser = profile?.username === 'admin' || profile?.is_test_user === true;
      
      console.log('=== ADMIN DETECTION DEBUG ===');
      console.log('Profile username:', profile?.username);
      console.log('Profile is_test_user:', profile?.is_test_user);
      console.log('Is admin or test user:', isAdminOrTestUser);
      console.log('Full profile:', profile);
      console.log('=== END ADMIN DETECTION DEBUG ===');
      
      // For admin users, still apply personality filtering but with more detailed logging
      if (isAdminOrTestUser) {
        console.log('Admin/test user detected - applying personality filtering with admin privileges');
        try {
          const allStories = await this.getAvailableStories();
          console.log('Admin stories loaded:', allStories?.length || 0);
          
          // Apply personality filtering even for admin users
          if (userPersonalityType) {
            console.log('Admin user has personality type - applying filtering');
            return await this.filterStoriesByPersonality(allStories, userPersonalityType, includeGeneral);
          } else {
            console.log('Admin user has no personality type - returning all stories');
            return allStories || [];
          }
        } catch (catalogError) {
          console.error('Failed to get catalog stories:', catalogError);
          return [];
        }
      }
      
      // For regular users, try personality stories first, then fallback to catalog
      if (userPersonalityType) {
        console.log('User has personality type - trying personality stories endpoint');
        try {
          const personalityStories = await this.getPersonalityStories(userPersonalityType);
          console.log('Personality stories response:', personalityStories);
          
          // Return stories from the personality endpoint if available
          if (personalityStories && personalityStories.stories && personalityStories.stories.length > 0) {
            console.log('Returning personality stories:', personalityStories.stories.length);
            return personalityStories.stories;
          }
        } catch (personalityError) {
          console.warn('Failed to get personality stories, falling back to catalog:', personalityError);
        }
      }
      
      // Fallback: Get all available stories from catalog
      console.log('Using fallback - getting all stories from catalog');
      const allStories = await this.getAvailableStories();
      console.log('Total stories available:', allStories?.length || 0);
      
      if (!allStories || allStories.length === 0) {
        console.log('No stories found in catalog either');
        return [];
      }
      
      // For users with personality type, filter stories properly
      if (userPersonalityType) {
        console.log('Filtering stories by personality focus');
        console.log('About to call filterStoriesByPersonality with:', {
          userPersonalityType,
          storyCount: allStories.length,
          includeGeneral
        });
        return await this.filterStoriesByPersonality(allStories, userPersonalityType, includeGeneral);
      }
      
      // If no personality type, return all stories
      console.log('No personality type - returning all stories');
      return allStories;
    } catch (error) {
      console.error('Failed to get stories by personality:', error);
      // Fallback to all stories if filtering fails
      try {
        const fallbackStories = await this.getAvailableStories();
        console.log('Fallback stories loaded:', fallbackStories?.length || 0);
        return fallbackStories || [];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
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
      console.log('=== GETTING CHARACTER STORIES ===');
      
      // Get all available stories from catalog
      const allStories = await this.getAvailableStories();
      console.log('Total stories available:', allStories?.length || 0);
      
      if (!allStories || allStories.length === 0) {
        console.log('No stories found in catalog');
        return [];
      }
      
      // Filter for character stories (empty personality_focus array)
      const characterStories = allStories.filter((story: any) => {
        const storyPersonalityFocus = story.personality_focus;
        const isCharacterStory = !storyPersonalityFocus || 
                                !Array.isArray(storyPersonalityFocus) || 
                                storyPersonalityFocus.length === 0;
        
        if (isCharacterStory) {
          console.log(`✅ Including character story: "${story.title}" (personality_focus: ${JSON.stringify(storyPersonalityFocus)})`);
        } else {
          console.log(`❌ Excluding personality story: "${story.title}" (personality_focus: ${JSON.stringify(storyPersonalityFocus)})`);
        }
        
        return isCharacterStory;
      });
      
      console.log(`Character stories found: ${characterStories.length} out of ${allStories.length} total stories`);
      
      console.log('Character stories found:', characterStories.length);
      return characterStories;
    } catch (error) {
      console.error('Failed to get character stories:', error);
      // Fallback to all stories if filtering fails
      try {
        const fallbackStories = await this.getAvailableStories();
        console.log('Fallback stories loaded:', fallbackStories?.length || 0);
        return fallbackStories || [];
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
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
    console.log('=== PERSONALITY MATCHING ===');
    console.log('User personality type:', userPersonalityType);
    console.log('Story personality focus:', storyPersonalityFocus);
    console.log('Story personality focus type:', typeof storyPersonalityFocus);
    
    if (!userPersonalityType) {
      console.log('No user personality type - no match');
      return false;
    }
    
    const normalizedUserType = this.normalizePersonalityType(userPersonalityType);
    console.log('Normalized user type:', normalizedUserType);
    
    // Handle different personality focus formats
    
    // Format 1: Direct string match (legacy support)
    if (typeof storyPersonalityFocus === 'string') {
      const normalizedStoryType = this.normalizePersonalityType(storyPersonalityFocus);
      const isMatch = normalizedUserType === normalizedStoryType;
      console.log('String match:', isMatch);
      return isMatch;
    }
    
    // Format 2: Array of personality types (new format)
    if (Array.isArray(storyPersonalityFocus)) {
      console.log('Checking array of personality types:', storyPersonalityFocus);
      const isMatch = storyPersonalityFocus.some(type => {
        console.log(`Processing array element: "${type}" (type: ${typeof type})`);
        const normalizedStoryType = this.normalizePersonalityType(type);
        const matches = normalizedUserType === normalizedStoryType;
        console.log(`Checking type: "${type}" (normalized: "${normalizedStoryType}") - matches: ${matches}`);
        console.log(`Comparing: "${normalizedUserType}" === "${normalizedStoryType}"`);
        return matches;
      });
      console.log('Array match result:', isMatch);
      return isMatch;
    }
    
    // Format 3: Object with personality_type field (legacy support)
    if (storyPersonalityFocus && typeof storyPersonalityFocus === 'object') {
      if (storyPersonalityFocus.personality_type) {
        const normalizedStoryType = this.normalizePersonalityType(storyPersonalityFocus.personality_type);
        const isMatch = normalizedUserType === normalizedStoryType;
        console.log('Object with personality_type field match:', isMatch);
        return isMatch;
      }
      
      // Format 4: Object with trait names as keys (legacy support)
      const storyKeys = Object.keys(storyPersonalityFocus);
      console.log('Story keys:', storyKeys);
      
      // Check if any of the story's personality traits match the user's type
      const isMatch = storyKeys.some(key => {
        const normalizedKey = this.normalizePersonalityType(key);
        const storyValue = storyPersonalityFocus[key];
        console.log(`Checking key: ${key} (normalized: ${normalizedKey}), value: ${storyValue}`);
        
        // If the value is truthy and the normalized key matches the user type
        return storyValue && normalizedKey === normalizedUserType;
      });
      
      console.log('Object with trait keys match:', isMatch);
      return isMatch;
    }
    
    console.log('No match found - unknown format');
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
    console.log('=== FILTERING STORIES BY PERSONALITY (IMPROVED LOGIC) ===');
    const filteredStories = [];
    
    for (const story of allStories) {
      const storyPersonalityFocus = story.personality_focus;

      // Check if it's a general story (no specific personality focus)
      const isGeneralStory = !storyPersonalityFocus || !Array.isArray(storyPersonalityFocus) || storyPersonalityFocus.length === 0;

      // 1. If it's a general story AND we're supposed to include them, add it.
      if (isGeneralStory && includeGeneral) {
        console.log(`✅ Including general story: "${story.title}"`);
        filteredStories.push(story);
        continue;
      }
      
      // 2. If it's not a general story, check for a personality match.
      if (userPersonalityType && !isGeneralStory) {
        const isMatch = await this.doesPersonalityMatch(userPersonalityType, storyPersonalityFocus);
        if (isMatch) {
          console.log(`✅ Including personality-matched story: "${story.title}" (focus: ${JSON.stringify(storyPersonalityFocus)})`);
          filteredStories.push(story);
        } else {
          console.log(`❌ Excluding non-matching story: "${story.title}" (focus: ${JSON.stringify(storyPersonalityFocus)})`);
        }
      }
    }
    
    // Ensure "Introduction" stories are always included and remove duplicates.
    const introductionStories = allStories.filter(s => s.title?.toLowerCase().includes('introduction'));
    console.log(`Found ${introductionStories.length} introduction stories`);
    
    const finalStories = [...new Map([...introductionStories, ...filteredStories].map(item => [item['id'], item])).values()];
    console.log(`Final filtered stories count: ${finalStories.length}`);
    
    return finalStories;
}

  /**
   * Normalize personality type names to handle different naming conventions
   * @param personalityType - The personality type to normalize
   * @returns Normalized personality type string
   */
  private normalizePersonalityType(personalityType: string): string {
    if (!personalityType) return '';
    
    console.log(`Normalizing personality type: "${personalityType}"`);
    const normalized = personalityType.toLowerCase().trim();
    console.log(`After toLowerCase and trim: "${normalized}"`);
    
    // Map different naming conventions to standard names
    const typeMappings: Record<string, string> = {
      // BFI-2-XS names
      'openmindedness': 'openness',
      'negativeemotionality': 'neuroticism',
      
      // Common variations
      'open-mindedness': 'openness',
      'open_mindedness': 'openness',
      'negative_emotionality': 'neuroticism',
      'negative-emotionality': 'neuroticism',
      
      // Full names
      'openness to experience': 'openness',
      'openness to new experiences': 'openness',
      'emotional stability': 'neuroticism',
      'emotional instability': 'neuroticism',
      
      // Abbreviations
      'o': 'openness',
      'c': 'conscientiousness',
      'e': 'extraversion',
      'a': 'agreeableness',
      'n': 'neuroticism'
    };
    
    const result = typeMappings[normalized] || normalized;
    console.log(`Final normalized result: "${result}"`);
    return result;
  }

  /**
   * Get user's primary personality trait from their profile
   * @returns The user's primary personality trait or null if not available
   */
  async getUserPrimaryPersonalityTrait(): Promise<string | null> {
    try {
      console.log('=== GETTING USER PRIMARY PERSONALITY TRAIT ===');
      const profile = await this.getProfile();
      console.log('Profile structure:', {
        hasProfile: !!profile?.profile,
        hasPersonalityProfile: !!profile?.personality_profile,
        hasProfilePersonalityScores: !!profile?.profile?.personality_scores,
        hasPersonalityProfileScores: !!profile?.personality_profile?.profile_summary?.dominant_trait
      });
      
      let primaryTrait: string | null = null;
      
      // Check for dominant trait in personality profile summary (most reliable)
      if (profile?.personality_profile?.profile_summary?.dominant_trait) {
        primaryTrait = profile.personality_profile.profile_summary.dominant_trait;
        console.log('Found dominant trait in profile summary:', primaryTrait);
        console.log('Dominant trait type:', typeof primaryTrait);
        console.log('Dominant trait length:', primaryTrait?.length);
      }
      
      // Check for personality scores in profile
      else if (profile?.profile?.personality_scores) {
        const scores = profile.profile.personality_scores;
        console.log('Found personality scores in profile:', scores);
        primaryTrait = Object.keys(scores).reduce((a, b) => 
          scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
        );
        console.log('Calculated primary trait from profile scores:', primaryTrait);
        console.log('Primary trait type:', typeof primaryTrait);
      }
      
      // Check for personality profile with individual scores
      else if (profile?.personality_profile) {
        const scores = profile.personality_profile;
        console.log('Found personality profile scores:', scores);
        
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
          console.log('Unknown personality profile format:', scores);
          return null;
        }
        
        primaryTrait = Object.keys(traitScores).reduce((a, b) => 
          traitScores[a as keyof typeof traitScores] > traitScores[b as keyof typeof traitScores] ? a : b
        );
        console.log('Calculated primary trait from personality profile:', primaryTrait);
        console.log('Primary trait type:', typeof primaryTrait);
      }
      
      if (primaryTrait) {
        // Normalize the trait to ensure consistent case handling
        const normalizedTrait = this.normalizePersonalityType(primaryTrait);
        console.log('Normalized primary trait:', normalizedTrait);
        return normalizedTrait;
      }
      
      console.log('No personality data found in profile');
      return null;
    } catch (error) {
      console.error('Failed to get user primary personality trait:', error);
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
      console.error('Failed to check story personality match:', error);
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
      console.log('=== COMPREHENSIVE STORY LOADING DEBUG ===');

      // Test 1: Get user profile
      console.log('\n--- Test 1: User Profile ---');
      try {
        const profile = await this.getProfile();
        results.profile = profile;
        console.log('✅ Profile loaded successfully');
        console.log('Username:', profile?.username);
        console.log('Is test user:', profile?.is_test_user);
        console.log('Completion type:', profile?.profile?.completion_type);
        console.log('Research group:', profile?.profile?.research_group?.condition);
      } catch (error: any) {
        const errorMsg = `Profile loading failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // Test 2: Get user's primary personality trait
      console.log('\n--- Test 2: User Primary Trait ---');
      try {
        const userTrait = await this.getUserPrimaryPersonalityTrait();
        results.userTrait = userTrait;
        console.log('✅ User primary trait:', userTrait);
      } catch (error: any) {
        const errorMsg = `Primary trait detection failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // Test 3: Try admin stories endpoint
      console.log('\n--- Test 3: Admin Stories Endpoint ---');
      try {
        const adminStories = await this.getAdminTestStories();
        results.adminStories = adminStories;
        console.log('✅ Admin stories loaded:', adminStories?.stories?.length || 0);
        if (adminStories?.stories?.length > 0) {
          console.log('First admin story:', adminStories.stories[0]);
        }
      } catch (error: any) {
        const errorMsg = `Admin stories failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // Test 4: Try catalog endpoint
      console.log('\n--- Test 4: Catalog Endpoint ---');
      try {
        const catalogStories = await this.getAvailableStories();
        results.catalogStories = catalogStories;
        console.log('✅ Catalog stories loaded:', catalogStories?.length || 0);
        if (catalogStories?.length > 0) {
          console.log('First catalog story:', catalogStories[0]);
          console.log('Story personality_type:', catalogStories[0].personality_type);
        }
      } catch (error: any) {
        const errorMsg = `Catalog stories failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // Test 5: Try personality stories endpoint
      console.log('\n--- Test 5: Personality Stories Endpoint ---');
      try {
        const personalityStories = await this.getPersonalityStories(results.userTrait || 'conscientiousness');
        results.personalityStories = personalityStories;
        console.log('✅ Personality stories loaded:', personalityStories?.stories?.length || 0);
        if (personalityStories?.stories?.length > 0) {
          console.log('First personality story:', personalityStories.stories[0]);
        }
      } catch (error: any) {
        const errorMsg = `Personality stories failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      // Test 6: Try the main filtering method
      console.log('\n--- Test 6: Main Filtering Method ---');
      try {
        const filteredStories = await this.getStoriesByPersonality(results.userTrait, true);
        results.filteredStories = filteredStories;
        console.log('✅ Filtered stories loaded:', filteredStories?.length || 0);
        if (filteredStories?.length > 0) {
          console.log('First filtered story:', filteredStories[0]);
        }
      } catch (error: any) {
        const errorMsg = `Filtered stories failed: ${error.message}`;
        errors.push(errorMsg);
        console.error('❌', errorMsg);
      }

      console.log('\n=== END COMPREHENSIVE DEBUG ===');
      console.log('Total errors:', errors.length);
      console.log('Errors:', errors);

      return {
        success: errors.length === 0,
        errors,
        results
      };

    } catch (error: any) {
      const errorMsg = `Debug function failed: ${error.message}`;
      errors.push(errorMsg);
      console.error('❌', errorMsg);
      
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
      console.log('=== BASIC STORY LOADING TEST ===');
      
      // Test 1: Check if we can reach the catalog endpoint
      console.log('Testing catalog endpoint...');
      const catalogStories = await this.getAvailableStories();
      console.log('Catalog stories count:', catalogStories?.length || 0);
      
      if (!catalogStories || catalogStories.length === 0) {
        return {
          success: false,
          message: 'No stories found in catalog endpoint'
        };
      }
      
      // Test 2: Check the structure of the first story
      const firstStory = catalogStories[0];
      console.log('First story structure:', {
        id: firstStory.id,
        title: firstStory.title,
        personality_type: firstStory.personality_type,
        chapter_count: firstStory.chapter_count
      });
      
      // Test 3: Check if we can get user profile
      console.log('Testing user profile...');
      const profile = await this.getProfile();
      console.log('Profile username:', profile?.username);
      console.log('Profile completion type:', profile?.profile?.completion_type);
      
      // Test 4: Test personality filtering
      console.log('Testing personality filtering...');
      const userTrait = await this.getUserPrimaryPersonalityTrait();
      console.log('User primary trait:', userTrait);
      
      let filteredStories;
      try {
        filteredStories = await this.getStoriesByPersonality(userTrait || undefined, true);
        console.log('Filtered stories count:', filteredStories?.length || 0);
      } catch (filterError: any) {
        console.log('Personality filtering failed:', filterError.message);
        filteredStories = catalogStories; // Use catalog as fallback
      }
      
      // Test 5: Check specific stories for personality focus
      console.log('\n--- Testing Specific Stories ---');
      const conscientiousnessStories = catalogStories.filter((story: any) => 
        story.personality_focus && 
        Array.isArray(story.personality_focus) && 
        story.personality_focus.some((focus: string) => 
          focus.toLowerCase().includes('conscientiousness')
        )
      );
      console.log('Stories with conscientiousness focus:', conscientiousnessStories.length);
      conscientiousnessStories.forEach((story: any) => {
        console.log(`- Story ${story.id}: "${story.title}" (focus: ${JSON.stringify(story.personality_focus)})`);
      });
      
      // Test 6: Test normalization function directly
      console.log('\n--- Testing Normalization ---');
      const testCases = ['Conscientiousness', 'conscientiousness', 'CONSCIENTIOUSNESS', 'Openness', 'openness'];
      testCases.forEach(testCase => {
        const normalized = this.normalizePersonalityType(testCase);
        console.log(`"${testCase}" -> "${normalized}"`);
      });
      
      // Test 7: Test personality matching directly
      console.log('\n--- Testing Direct Personality Matching ---');
      if (userTrait) {
        conscientiousnessStories.forEach((story: any) => {
          console.log(`Testing story ${story.id} with user trait "${userTrait}":`);
          console.log(`  Story focus: ${JSON.stringify(story.personality_focus)}`);
          this.doesPersonalityMatch(userTrait, story.personality_focus).then(match => {
            console.log(`  Match result: ${match}`);
          });
        });
      }
      
      // Test 8: Test the fix - verify that normalized traits match
      console.log('\n--- Testing Normalized Matching ---');
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
          console.log(`Test story ${testStory.id} (${JSON.stringify(testStory.personality_focus)}) with "${userTrait}": ${isMatch}`);
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
      console.error('Test failed:', error);
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
      console.log('=== DEBUGGING STORY FILTERING ===');
      
      // Get all stories
      const allStories = await this.getAvailableStories();
      console.log('Total stories available:', allStories?.length || 0);
      
      // Get user's personality trait
      const userTrait = await this.getUserPrimaryPersonalityTrait();
      console.log('User primary trait:', userTrait);
      
      // Get character stories
      const characterStories = await this.getCharacterStories();
      console.log('Character stories count:', characterStories?.length || 0);
      
      // Get personality stories
      const personalityStories = await this.getStoriesByPersonality(userTrait || undefined, true);
      console.log('Personality stories count:', personalityStories?.length || 0);
      
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
      console.error('Failed to debug story filtering:', error);
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
            console.log('🔍 DEBUG: Starting character home data debug...');

            // Test 1: Get basic profile (this should have all the data we need)
            let profile: UserProfile | undefined;
            try {
                profile = await this.getProfile();
                dataSummary.hasProfile = true;
                console.log('✅ DEBUG: Profile loaded successfully');
            } catch (error: any) {
                errors.push(`Profile error: ${error.message}`);
                console.error('❌ DEBUG: Profile failed:', error);
            }

            // Test 2: Get character home data (redundant, but keeping for compatibility)
            let characterHomeData: UserProfile | undefined;
            try {
                characterHomeData = await this.getCharacterHomeData();
                console.log('✅ DEBUG: Character home data loaded successfully');
            } catch (error: any) {
                errors.push(`Character home data error: ${error.message}`);
                console.error('❌ DEBUG: Character home data failed:', error);
            }

            // Test 3: Get character stats
            let characterStats: any = undefined;
            try {
                characterStats = await this.getCharacterStats();
                console.log('✅ DEBUG: Character stats loaded successfully');
            } catch (error: any) {
                errors.push(`Character stats error: ${error.message}`);
                console.error('❌ DEBUG: Character stats failed:', error);
            }

            // Test 4: Get equipped gear
            let equippedGear: any = undefined;
            try {
                equippedGear = await this.getEquippedGear();
                console.log('✅ DEBUG: Equipped gear loaded successfully');
            } catch (error: any) {
                errors.push(`Equipped gear error: ${error.message}`);
                console.error('❌ DEBUG: Equipped gear failed:', error);
            }

            // Analyze the data - check for character data directly on UserProfile (new structure)
            const bestData = characterHomeData || profile;
            if (bestData) {
                // Check for character data directly on UserProfile (new structure)
                const hasCharacterConfig = !!bestData.character_config;
                const hasExperienceProgress = bestData.experience_progress_percentage !== undefined;
                const hasWellnessAverage = bestData.wellness_average !== undefined;
                const hasEquippedGear = !!bestData.equipped_gear && Array.isArray(bestData.equipped_gear);
                
                console.log('🔍 DEBUG: Data structure analysis:', {
                    hasCharacterConfig,
                    hasExperienceProgress,
                    hasWellnessAverage,
                    hasEquippedGear,
                    experienceProgress: bestData.experience_progress_percentage,
                    wellnessAverage: bestData.wellness_average,
                    equippedGearCount: bestData.equipped_gear?.length || 0,
                    userProfileKeys: Object.keys(bestData)
                });
                
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
                    console.log('🔍 DEBUG: Found legacy character structure');
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

            console.log('📊 DEBUG: Data summary:', dataSummary);
            console.log('❌ DEBUG: Errors found:', errors);

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
            console.error('❌ DEBUG: General error:', error);
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
            console.log('=== GETTING QUEST PROGRESS (SIMPLIFIED) ===');
            
            // Get user progress records
            const allProgress = await this.get<any[]>('getUserProgress');
            console.log('📊 Loaded progress records:', allProgress?.length || 0);
            
            if (!allProgress || allProgress.length === 0) {
                console.log('No progress records found');
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
                    console.log(`� Found quest_progress_update in record ${index + 1}`);
                    const questData = record.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);
                                console.log(`  ✅ Quest ${questId}: ${numValue}`);
                            }
                        });
                    }
                }
                
                // Method 2: Look for player_state.quest_progress
                if (record.player_state?.quest_progress) {
                    console.log(`📈 Found player_state quest_progress in record ${index + 1}`);
                    const questData = record.player_state.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);
                                console.log(`  ✅ Quest ${questId}: ${numValue}`);
                            }
                        });
                    }
                }
                
                // Method 3: Look for story_variables.quest_progress (direct)
                if (record.story_variables?.quest_progress) {
                    console.log(`📈 Found story_variables quest_progress in record ${index + 1}`);
                    const questData = record.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = Math.max(questProgress[questId] || 0, numValue);
                                console.log(`  ✅ Quest ${questId}: ${numValue}`);
                            }
                        });
                    }
                }
            });
            
            console.log('✅ Final quest progress calculated:', questProgress);
            console.log(`📈 Total quests with progress: ${Object.keys(questProgress).length}`);
            
            return questProgress;
        } catch (error) {
            console.error('❌ Failed to load quest progress:', error);
            return {};
        }
    }

    /**
     * LEGACY: Get quest progress from story variables (old approach - keeping for reference)
     */
    async getQuestProgressFromRecords(): Promise<Record<string, number>> {
        try {
            console.log('=== GETTING QUEST PROGRESS FROM BACKEND ===');
            
            // Use the getUserProgress endpoint to read progress records 
            // (gameProgressRecord is for writing/POST only)
            const allProgress = await this.get<any[]>('getUserProgress');
            console.log('📊 Raw progress records loaded:', allProgress?.length || 0);
            
            if (!allProgress || allProgress.length === 0) {
                console.log('No progress records found');
                return {};
            }
            
            // Log a few sample records for debugging
            console.log('Sample progress records (first 3):');
            allProgress.slice(0, 3).forEach((record, index) => {
                console.log(`  Record ${index + 1}:`, {
                    story_variables: record.story_variables,
                    passage_id: record.passage_id,
                    created_at: record.created_at
                });
                
                // ENHANCED DEBUG: Log full story_variables content
                if (record.story_variables) {
                    console.log(`    story_variables content:`, JSON.stringify(record.story_variables, null, 2));
                    console.log(`    story_variables.event:`, record.story_variables.event);
                    if (record.story_variables.event === 'quest_progress_update') {
                        console.log(`    quest_progress data:`, record.story_variables.quest_progress);
                    }
                    if (record.story_variables.event === 'quest_completed') {
                        console.log(`    quest_id:`, record.story_variables.quest_id);
                    }
                } else {
                    console.log(`    NO story_variables found in record`);
                }
            });
            
            // Extract quest progress from story_variables
            const questProgress: Record<string, number> = {};
            
            console.log('🔍 Processing progress records for quest data...');
            allProgress.forEach((progress: any, index: number) => {
                console.log(`  Processing record ${index + 1}:`, progress.story_variables?.event || 'no event');
                
                // Handle new quest progress format
                if (progress.story_variables && progress.story_variables.event === 'quest_progress_update') {
                    console.log('    Found quest_progress_update event');
                    const questData = progress.story_variables.quest_progress;
                    if (questData && typeof questData === 'object') {
                        Object.entries(questData).forEach(([questId, progressValue]) => {
                            const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
                            if (!isNaN(numValue)) {
                                questProgress[questId] = (questProgress[questId] || 0) + numValue;
                                console.log(`✅ Quest progress update: ${questId} += ${numValue} (total: ${questProgress[questId]})`);
                            }
                        });
                    }
                }
                // Handle legacy quest completion format - THIS IS THE KEY ONE!
                else if (progress.story_variables && progress.story_variables.event === 'quest_completed') {
                    console.log('    Found quest_completed event');
                    const questId = progress.story_variables.quest_id;
                    if (questId) {
                        questProgress[questId] = (questProgress[questId] || 0) + 1;
                        console.log(`✅ Quest completion found: ${questId} += 1 (total: ${questProgress[questId]})`);
                    }
                } else {
                    console.log(`    Skipping record - no recognized quest event (event: ${progress.story_variables?.event || 'none'})`);
                }
            });
            
            console.log('✅ Final quest progress extracted:', questProgress);
            console.log(`📈 Total quests with progress: ${Object.keys(questProgress).length}`);
            
            if (Object.keys(questProgress).length > 0) {
                console.log('Quest progress details:');
                Object.entries(questProgress).forEach(([questId, progress]) => {
                    console.log(`  ${questId}: ${progress}`);
                });
            }
            
            return questProgress;
        } catch (error) {
            console.error('❌ Failed to load quest progress from records:', error);
            console.warn('⚠️ Failed to load quest progress, using empty object:', error);
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
            console.log('=== SAVING QUEST PROGRESS ===');
            console.log('Story ID:', storyId);
            console.log('Quest slug:', questSlug);
            console.log('Story variables:', storyVariables);
            console.log('Player state:', playerState);
            
            // Generate unique passage_id if none provided
            const uniquePid = passageId ?? `quest_${questSlug}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
            console.log('Generated unique passage_id:', uniquePid);
            
            // Use the generic progress recording endpoint
            const response = await this.post('gameProgressRecord', {
                story_id: String(storyId ?? 'quest'),
                passage_id: uniquePid,
                story_variables: {
                    event: 'quest_completed',
                    quest_id: questSlug, // MUST match characters.Quest.slug
                    ...storyVariables,
                },
                player_state: playerState,
            });
            
            console.log('✅ Quest progress saved successfully:', response);
            return response;
        } catch (error: any) {
            console.error('❌ Failed to save quest progress:', error);
            
            // Optional: treat duplicate key errors as success
            const msg = error?.response?.data?.error ?? '';
            if (typeof msg === 'string' && msg.includes('duplicate key value')) {
                console.warn('Quest progress already recorded; continuing.');
                return { success: true, message: 'Quest progress already recorded' };
            }
            
            throw error;
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
            console.log('=== PROCESSING PERSONALITY STORY REWARDS ===');
            console.log('Story ID:', storyId);
            console.log('Base rewards:', baseRewards);
            console.log('Personality type:', personalityType);

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
            
            console.log('Quests in:', Object.keys(baseQuestData).length);
            console.log('Quests kept:', Object.keys(filteredQuestData).length);
            console.log('Skills kept:', (filtered.skillsLearned ?? []).length);
            console.log('Items kept:', (filtered.items ?? []).length);
            console.log('Gear kept:', (filtered.gear ?? []).length);

            // Get personality-specific multiplier
            const multiplier = getPersonalityRewardMultiplier(personalityType, storyId);
            console.log('Personality multiplier:', multiplier);

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

            console.log('✅ Processed rewards:', processedRewards);
            console.log('✅ Bonuses applied:', bonusesApplied);

            return { processedRewards, bonusesApplied };

        } catch (error) {
            console.error('❌ Failed to process personality story rewards:', error);
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
            console.error('❌ Failed to save story completion with personality rewards:', error);
            throw error;
        }
    }
}

export const apiService = new ApiService();
