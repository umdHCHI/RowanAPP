import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { EquipmentItem, EquippedItems } from '../types/equipment';
import { Character, CharacterCreateData, GameData, LoginResponse, UserProfile } from '../types/user';
import { API_ENDPOINTS, apiBaseUrl } from './apiConfig';

// ===== NEW TYPES FOR WELLNESS BACKEND needs to be moved =====

//move to types

//more to types  - needs to be moved 

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

// New types matching your Django models
export interface Skill {
    id: number;
    title: string;
    description: string;
}

export interface CodexEntry {
    id: number;
    game_data: number; // FK to GameData
    prompt: JournalPrompt;
    entry_type: 'journal' | 'draw' | 'voice';
    content: string; // JSON for drawings, text for journal, file path for voice
    skill_category: string;
    map_area: string;
    difficulty: string;
    created_at: string;
    updated_at: string;
}

export interface JournalPrompt {
    id: number;
    prompt_id: string;
    text: string;
    category: 'journal' | 'draw' | 'voice';
    skill_category: 'Self-Compassion' | 'Social Connection' | 'Stress Management' | 'Emotional Awareness' | 'Personal Growth';
    map_area: 'entrance' | 'garden' | 'library' | 'sanctuary' | 'archive' | 'summit';
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    is_active: boolean;
    created_at: string;
    updated_at: string;
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

// ===== Axios Setup =====
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000, // 10 second timeout
    withCredentials: false, // Important for CORS
});

// Enable request interceptor to add authentication headers
apiClient.interceptors.request.use(
    async (config) => {
        try {
            console.log('=== REQUEST INTERCEPTOR ===');
            console.log('Making request to:', config.url);
            console.log('Method:', config.method?.toUpperCase());
            console.log('Full URL:', `${config.baseURL}${config.url}`);
            
            // Skip authorization for login requests
            if (config.url?.includes('auth/login') || config.url?.includes('login')) {
                console.log('Request interceptor - Login request detected, skipping authorization');
                return config;
            }
            
            // Clear any existing Authorization header to avoid conflicts
            delete config.headers.Authorization;
            
            // Add a small delay to ensure AsyncStorage operations are complete
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const token = await AsyncStorage.getItem('authToken');
            console.log('Request interceptor - Token from AsyncStorage:', token ? 'Yes' : 'No');
            console.log('Token value preview:', token ? `${token.substring(0, 10)}...` : 'null');
            console.log('Token length:', token ? token.length : 0);
            
            if (token && token.trim()) {
                // Django REST Framework uses 'Token' prefix for token authentication
                config.headers.Authorization = `Token ${token}`;
                console.log('Request interceptor - Added Authorization header (Token format)');
                console.log('Authorization header:', config.headers.Authorization);
                console.log('Token length:', token.length);
                console.log('Token starts with:', token.substring(0, 10));
                
                // Log the full request details for debugging
                console.log('Full request config:', {
                    url: config.url,
                    method: config.method?.toUpperCase(),
                    headers: {
                        ...config.headers,
                        Authorization: config.headers.Authorization
                    },
                    baseURL: config.baseURL,
                    fullURL: `${config.baseURL}${config.url}`
                });
            } else {
                console.log('Request interceptor - No valid token found in AsyncStorage');
                
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
            console.error('Authentication error:', error.response.data);
            console.error('Request URL:', error.config?.url);
            console.error('Request headers:', error.config?.headers);
            
            // Only remove token if it's definitely invalid
            // Don't remove on temporary auth issues
            const errorMessage = error.response.data as any;
            if (errorMessage?.detail === 'Invalid token.' || 
                errorMessage?.detail === 'Token has expired.') {
                console.log('Removing invalid/expired token and user data');
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');
            } else {
                console.log('401 error but not removing token - might be temporary issue');
            }
        }
        return Promise.reject(error);
    }
);

// ===== Main API Service Class =====
class ApiService {
    private isInitialized = false;

    /**
     * Initialize the API service - sets up auth tokens and validates existing sessions
     */
    public async initialize(): Promise<void> {
        try {
            console.log('=== API SERVICE INITIALIZATION ===');
            
            // Check if we have a stored token
            const token = await AsyncStorage.getItem('authToken');
            console.log('Initialization - Token from AsyncStorage:', token ? 'Present' : 'Not found');
            
            if (token) {
                console.log('Initialization - Validating existing token...');
                const isValid = await this.validateToken();
                console.log('Initialization - Token validation result:', isValid);
                
                if (isValid) {
                    this.isInitialized = true;
                    console.log('Initialization - API service initialized successfully');
                } else {
                    console.log('Initialization - Token invalid, clearing stored data');
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('userData');
                    await AsyncStorage.removeItem('characterId');
                    this.isInitialized = false;
                }
            } else {
                console.log('Initialization - No token found, service not initialized');
                this.isInitialized = false;
            }
            
            console.log('=== END API SERVICE INITIALIZATION ===');
        } catch (error) {
            console.error('API service initialization error:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Check if the API service has been initialized
     */
    public getInitializationStatus(): boolean {
        return this.isInitialized;
    }

    // Generic request methods
    public async get<T>(endpoint: keyof typeof API_ENDPOINTS, config?: AxiosRequestConfig & { urlSuffix?: string }): Promise<T> {
        try {
            const baseEndpoint = API_ENDPOINTS[endpoint];
            const urlSuffix = config?.urlSuffix || '';
            const url = baseEndpoint + urlSuffix;
            
            // Debug logging to trace URL construction
            console.log(`=== GET REQUEST DEBUG ===`);
            console.log(`Endpoint key: ${endpoint}`);
            console.log(`Base endpoint: ${baseEndpoint}`);
            console.log(`URL suffix: ${urlSuffix}`);
            console.log(`Final URL: ${url}`);
            console.log(`=== END GET REQUEST DEBUG ===`);
            
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
        console.log(`=== POST REQUEST ===`);
        console.log(`URL: ${url}`);
        console.log(`Full URL: ${apiBaseUrl}${url}`);
        console.log(`Data:`, data);
        console.log(`Config:`, config);
        
        try {
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.post<T>(url, data, axiosConfig);
            console.log(`POST ${url} success:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`=== POST REQUEST FAILED ===`);
            console.error(`URL: ${url}`);
            console.error(`Full URL: ${apiBaseUrl}${url}`);
            console.error(`Error:`, error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request method:', error.config.method);
                console.error('Request headers:', error.config.headers);
                console.error('Request data:', error.config.data);
            }
            console.error(`=== END POST REQUEST FAILED ===`);
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
    // ==== AS OF RIGHT NOW WE WILL REGISTER NEW USERS =====
    // ===== Authentication Methods verified =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Username:', username);
            console.log('Login endpoint:', API_ENDPOINTS.login);
            console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.login}`);
            console.log('API Base URL:', apiBaseUrl);
            
            // Test network connectivity first
            console.log('=== TESTING NETWORK CONNECTIVITY ===');
            try {
                const testResponse = await fetch(`${apiBaseUrl}`, { 
                    method: 'GET'
                });
                console.log('Network test response status:', testResponse.status);
                console.log('Network test successful');
            } catch (networkError) {
                console.error('Network connectivity test failed:', networkError);
                console.error('This suggests the device cannot reach the API server');
                console.error('Possible causes:');
                console.error('1. No internet connection');
                console.error('2. API server is down');
                console.error('3. Android network security blocking HTTP traffic');
                console.error('4. Firewall blocking the connection');
            }
            
            const response = await this.post<LoginResponse>('login', { username, password });
            
            console.log('=== LOGIN RESPONSE ===');
            console.log('Response received:', response);
            console.log('Token:', response.token ? 'Present' : 'Missing');
            console.log('User ID:', response.user?.id);
            console.log('Username from response:', response.user?.username);
            
            if (!response.token) {
                throw new Error('No token received from login response');
            }
            
            // Store the token and character ID
            console.log('Storing token in AsyncStorage...');
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('characterId', String(response.user.id));
            
            // Store the complete user data for getProfile() to use
            console.log('Storing user data from login response...');
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
            
            // Add a small delay to ensure AsyncStorage operations complete
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Verify the token was stored
            const storedToken = await AsyncStorage.getItem('authToken');
            console.log('Token verification - stored successfully:', storedToken === response.token);
            console.log('Stored token value:', storedToken);
            console.log('Original token value:', response.token);
            
            // Double verify by getting all AsyncStorage data
            const allKeys = await AsyncStorage.getAllKeys();
            const allValues = await AsyncStorage.multiGet(allKeys);
            console.log('All AsyncStorage after login:', allValues);
            
            // Test the token immediately after login using stored data
            console.log('=== TESTING TOKEN IMMEDIATELY AFTER LOGIN ===');
            try {
                const testProfile = await this.getProfile();
                if (testProfile && testProfile.username) {
                    console.log('✅ Token works immediately after login - profile data available');
                } else {
                    console.log('❌ Token test failed - no valid profile data');
                }
            } catch (testError: any) {
                console.error('❌ Token failed immediately after login:', testError.response?.status, testError.response?.data);
                console.error('❌ Token test error details:', {
                    status: testError.response?.status,
                    data: testError.response?.data,
                    headers: testError.response?.headers,
                    config: testError.config
                });
                
                // Log the exact curl command that would work
                console.log('=== CURL TEST COMMAND ===');
                console.log(`curl -H "Authorization: Token ${response.token}" -H "Content-Type: application/json" ${apiBaseUrl}users/me`);
                console.log('========================');
            }
            
            console.log('=== LOGIN COMPLETE ===');
            return response;
        } catch (error: any) {
            console.error('=== LOGIN ERROR ===');
            console.error('Login error:', error);
            
            // Enhanced error logging for network issues
            if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
                console.error('🔴 NETWORK ERROR DETECTED');
                console.error('This is likely due to:');
                console.error('1. Android blocking HTTP traffic');
                console.error('2. No internet connection');
                console.error('3. API server unreachable');
                console.error('4. Network security configuration issue');
                console.error('');
                console.error('Troubleshooting steps:');
                console.error('1. Check internet connection');
                console.error('2. Verify API server is running');
                console.error('3. Check Android network security config');
                console.error('4. Try using HTTPS instead of HTTP');
            }
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                console.error('Request was made but no response received');
                console.error('Request details:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
            
            throw new Error('Login failed. Please check your credentials and network connection.');
        }
    }

    async logout(): Promise<void> { //needs validation
        try {
            await this.post('logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('characterId');
            await AsyncStorage.removeItem('userData');
        }
    }

    async validateToken(): Promise<boolean> {//needs validation 
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return false;

            // Test token by making a simple authenticated request
            // This will work for both regular tokens and test tokens
            try {
                await this.get('userProfile');
                console.log('Token validation: Success');
                return true;
            } catch (error) {
                console.error('Token validation error:', error);
                // Don't remove token here - let response interceptor handle it
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            // Don't remove token here - let response interceptor handle it
            return false;
        }
    }

    async testTokenAuth(): Promise<{ tokenVerify: boolean, getProfile: boolean, token: string | null, success: boolean }> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            console.log('🧪 Testing token authentication...');
            console.log('Token present:', token ? 'Yes' : 'No');
            
            if (!token) {
                return { tokenVerify: false, getProfile: false, token: null, success: false };
            }

            const results = {
                tokenVerify: true, // Skip the verify test since endpoint doesn't exist
                getProfile: false,
                token: token.substring(0, 20) + '...',
                success: false
            };

            // Test: Try to get stored user data first (from login response)
            try {
                console.log('🧪 Testing getProfile endpoint with stored data...');
                const profile = await this.getProfile();
                if (profile && profile.username) {
                    results.getProfile = true;
                    results.success = true;
                    console.log('✅ getProfile passed using stored data');
                } else {
                    console.log('❌ getProfile failed - no valid profile data');
                    results.getProfile = false;
                    results.success = false;
                }
            } catch (error) {
                console.log('❌ getProfile failed:', error);
                results.getProfile = false;
                results.success = false;
            }

            return results;
        } catch (error) {
            console.error('🧪 testTokenAuth error:', error);
            return { tokenVerify: false, getProfile: false, token: null, success: false };
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
            console.error('Error testing token storage:', error);
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
    public async testTokenAuthentication(): Promise<{
        success: boolean;
        status?: number;
        data?: any;
        error?: string;
    }> {
        try {
            console.log('=== TESTING TOKEN AUTHENTICATION ===');
            const token = await AsyncStorage.getItem('authToken');
            
            if (!token) {
                return { success: false, error: 'No token found' };
            }
            
            // Make a simple authenticated request to test the token
            const response = await apiClient.get('users/me/', {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            
            console.log('Token auth test successful:', response.data);
            return { success: true, status: response.status, data: response.data };
            
        } catch (error: any) {
            console.error('Token auth test failed:', error);
            return { 
                success: false, 
                status: error.response?.status,
                data: error.response?.data,
                error: error.message 
            };
        }
    }

    // ===== User Methods =====
    async getProfile(): Promise<UserProfile> {//verified 
        // Always fetch fresh data from backend to get latest survey results
        try {
            console.log('getProfile: Fetching fresh data from backend');
            const freshProfile = await this.get<UserProfile>('userProfile');
            console.log('getProfile: Fresh profile data received:', freshProfile);
            return freshProfile;
        } catch (error) {
            console.log('getProfile: Failed to fetch fresh data, falling back to stored data');
            
            // Fallback to stored user data from login if API call fails
            try {
                const storedUserData = await AsyncStorage.getItem('userData');
                if (storedUserData) {
                    console.log('getProfile: Using stored user data from login as fallback');
                    const userData = JSON.parse(storedUserData);
                    return userData;
                }
            } catch (fallbackError) {
                console.log('getProfile: No stored user data available');
            }
            
            // If all else fails, make the API call anyway
            return this.get<UserProfile>('userProfile');
        }
    }

    async updateProfile(profileData: any): Promise<UserProfile> {
        return this.patch<UserProfile>('updateUserProfile', profileData);
    }

    // ===== Survey Methods =====
    async submitSurveyData(surveyData: {
        personality_scores?: Record<string, number>;
        responses?: Record<string, any>;
        completion_time?: number;
        [key: string]: any;
    }): Promise<any> {
        // Trait to archetype mapping
        const traitToArchetype: Record<string, string> = {
            extraversion: "The Voice",
            agreeableness: "The Healer",
            conscientiousness: "The Architect",
            neuroticism: "The Mirror",
            openness: "The Seeker"
        };
        try {
            console.log('=== API SERVICE: SUBMITTING SURVEY DATA ===');
            console.log('Survey data:', surveyData);
            
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
                formattedScores = {
                    extraversion: surveyData.personality_scores.extraversion || 0,
                    agreeableness: surveyData.personality_scores.agreeableness || 0,
                    conscientiousness: surveyData.personality_scores.conscientiousness || 0,
                    neuroticism: surveyData.personality_scores.neuroticism || 0,
                    openness: surveyData.personality_scores.openness || 0
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
            
            const surveyResult = await this.patch('updateUserProfile', profilePayload);
            console.log('Survey submitted via updateUserProfile:', surveyResult);
            
            console.log('Survey submission result:', surveyResult);
            
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
                    console.log('Research data submitted successfully:', researchResult);
                } catch (researchError) {
                    console.warn('Failed to submit to research endpoint, but survey data was saved:', researchError);
                    // Don't fail the entire survey submission if research endpoint fails
                }
            }
            
            return {
                survey_result: surveyResult,
                onboarding_result: surveyResult,
                personality_scores: formattedScores
            };
        } catch (error: any) {
            console.error('Error submitting survey data:', error);
            if (error.response) {
                console.error('API Response details:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            throw new Error(`Failed to submit survey data: ${error.message || 'Unknown error'}`);
        }
    }

    async completeOnboarding(path: 'character' | 'survey'): Promise<UserProfile> {
        // Determine research condition based on path
        const researchCondition = path === 'character' ? 'A' : 'B';
        
        try {
            console.log('=== API SERVICE: COMPLETING ONBOARDING ===');
            console.log('Onboarding path:', path);
            console.log(`Assigning user to research group ${researchCondition} for ${path} path`);
            
            // Update the user profile with onboarding completion data
            const onboardingData = {
                has_completed_onboarding: true,
                completion_type: path,
                research_group: researchCondition, // Assign the research group here
                onboarding_completed_at: new Date().toISOString()
            };

            console.log('Updating profile with onboarding data:', onboardingData);
            const updatedProfile = await this.patch<UserProfile>('updateUserProfile', onboardingData);
            console.log('Onboarding completed via profile update:', updatedProfile);
            return updatedProfile;
        } catch (error: any) {
            console.error('Error completing onboarding:', error);
            
            // Check if this is a CORS/network error
            const isNetworkError = error.code === 'ERR_NETWORK' || 
                                 error.message === 'Network Error' ||
                                 error.message?.includes('ERR_NETWORK_CHANGED') ||
                                 error.message?.includes('ERR_FAILED');
            
            if (isNetworkError) {
                console.warn('Onboarding completion failed due to CORS - creating local fallback');
                
                // Create a mock user profile for web platform
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
                
                console.log('Mock onboarding profile created:', mockProfile);
                return mockProfile;
            }
            
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

    /**
     * Complete the survey onboarding flow (Research Condition B)
     * This combines survey submission + onboarding completion
     */
    async completeSurveyOnboarding(surveyData: any): Promise<{
        surveyResult: any;
        onboardingResult?: any;
    }> {
        try {
            console.log('=== COMPLETING SURVEY ONBOARDING ===');
            
            // Always submit to the personality surveys endpoint first
            console.log('Submitting survey to personality/surveys/ endpoint...');
            
            try {
                const surveyResult = await this.submitPersonalitySurvey(surveyData);
                console.log('Survey submitted successfully:', surveyResult);
                
                // Update user profile with personality scores from survey
                console.log('Updating user profile with survey personality scores...');
                const profileUpdatePayload = {
                    personality_scores: surveyData.personality_scores,
                    primary_trait: Object.keys(surveyData.personality_scores).reduce((a, b) => 
                        surveyData.personality_scores[a] > surveyData.personality_scores[b] ? a : b
                    ),
                    completion_type: 'survey',
                    onboarding_completed: true
                };
                
                console.log('Profile update payload:', profileUpdatePayload);
                const profileUpdateResult = await this.patch('updateUserProfile', profileUpdatePayload);
                console.log('Profile updated with survey scores:', profileUpdateResult);
                
                // Then complete onboarding
                const onboardingResult = await this.completeOnboarding('survey');
                console.log('Onboarding completed successfully:', onboardingResult);
                
                return {
                    surveyResult,
                    onboardingResult
                };
                
            } catch (surveyError: any) {
                console.warn('Survey submission failed, falling back to profile update only:', surveyError);
                
                // Check if this is a network error (common on web platform)
                const isNetworkError = surveyError.code === 'ERR_NETWORK' || 
                                     surveyError.message === 'Network Error' ||
                                     surveyError.message?.includes('ERR_NETWORK_CHANGED') ||
                                     surveyError.message?.includes('ERR_FAILED');
                
                // Check if this is a 400 Bad Request (backend validation error)
                const isBadRequest = surveyError.response?.status === 400;
                
                if (isNetworkError) {
                    console.warn('Network error detected - this is likely a CORS issue on web platform');
                    console.warn('The survey data format is correct, but the web browser is blocking the request');
                    console.warn('This is expected behavior on web - the survey will be saved via profile update instead');
                    
                    // Log the exact data that would have been sent for debugging
                    console.log('Survey data that would have been sent to backend:', {
                        answers: Object.keys(surveyData.responses || {}).reduce((acc, key) => {
                            acc[String(key)] = surveyData.responses[key];
                            return acc;
                        }, {} as Record<string, number>),
                        big_five_scores: surveyData.personality_scores,
                        completed: true
                    });
                } else if (isBadRequest) {
                    console.warn('Backend validation error (400 Bad Request) - this suggests the data format needs adjustment');
                    console.warn('Backend response:', surveyError.response?.data);
                    console.warn('The survey data format may need to be adjusted for backend validation');
                    console.warn('Falling back to profile update method instead');
                    
                    // Log the exact data that was sent for debugging
                    console.log('Survey data that was sent to backend (caused 400 error):', {
                        answers: Object.keys(surveyData.responses || {}).reduce((acc, key) => {
                            acc[String(key)] = surveyData.responses[key];
                            return acc;
                        }, {} as Record<string, number>),
                        big_five_scores: surveyData.personality_scores,
                        completed: true
                    });
                }
                
                // For web platform with CORS issues, create a local fallback
                if (isNetworkError) {
                    console.log('Creating local fallback for web platform CORS issue');
                    
                    // Create a mock survey result that simulates what the backend would return
                    const mockSurveyResult = {
                        id: Date.now(), // Use timestamp as mock ID
                        user: 1, // Mock user ID
                        answers: Object.keys(surveyData.responses || {}).reduce((acc, key) => {
                            acc[String(key)] = surveyData.responses[key];
                            return acc;
                        }, {} as Record<string, number>),
                        big_five_scores: surveyData.personality_scores,
                        completed: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    console.log('Mock survey result created:', mockSurveyResult);
                    
                    // Try to update profile, but don't fail if that also has CORS issues
                    try {
                        const profilePayload = {
                            personality_scores: surveyData.personality_scores,
                            primary_trait: Object.keys(surveyData.personality_scores).reduce((a, b) => 
                                surveyData.personality_scores[a] > surveyData.personality_scores[b] ? a : b
                            ),
                            completion_type: 'survey',
                            onboarding_completed: true
                        };
                        
                        const profileResult = await this.patch('updateUserProfile', profilePayload);
                        const onboardingResult = await this.completeOnboarding('survey');
                        
                        return {
                            surveyResult: mockSurveyResult,
                            onboardingResult
                        };
                    } catch (profileError: any) {
                        console.warn('Profile update also failed due to CORS:', profileError);
                        
                        // Return mock results even if profile update fails
                        return {
                            surveyResult: mockSurveyResult,
                            onboardingResult: {
                                id: 1,
                                username: 'admin',
                                profile: {
                                    completion_type: 'survey',
                                    onboarding_completed: true,
                                    personality_scores: surveyData.personality_scores
                                }
                            }
                        };
                    }
                }
                
                // For non-network errors, try the original fallback
                const profilePayload = {
                    personality_scores: surveyData.personality_scores,
                    primary_trait: Object.keys(surveyData.personality_scores).reduce((a, b) => 
                        surveyData.personality_scores[a] > surveyData.personality_scores[b] ? a : b
                    ),
                    completion_type: 'survey',
                    onboarding_completed: true
                };
                
                const profileResult = await this.patch('updateUserProfile', profilePayload);
                const onboardingResult = await this.completeOnboarding('survey');
                
                return {
                    surveyResult: profileResult,
                    onboardingResult
                };
            }
            
        } catch (error: any) {
            console.error('Failed to complete survey onboarding:', error);
            throw error;
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
    
    
    // Submit to personality survey endpoint (for first-time submissions)
    async submitPersonalitySurvey(surveyData: any): Promise<any> {
        try {
            console.log('=== SUBMIT PERSONALITY SURVEY ===');
            console.log('Survey data received:', surveyData);
            console.log('Responses type:', typeof surveyData.responses);
            console.log('Responses keys:', Object.keys(surveyData.responses || {}));
            console.log('Personality scores:', surveyData.personality_scores);
            
            // Test token storage before making the request
            console.log('=== TOKEN STORAGE TEST ===');
            const tokenTest = await this.testTokenStorage();
            console.log('Token storage test result:', tokenTest);
            console.log('=== END TOKEN STORAGE TEST ===');
            
            // Test token authentication before making the request
            console.log('=== TOKEN AUTHENTICATION TEST ===');
            const authTest = await this.testTokenAuthentication();
            console.log('Token authentication test result:', authTest);
            console.log('=== END TOKEN AUTHENTICATION TEST ===');
            
            // Get the current user ID from the auth context
            const userProfile = await this.getProfile();
            const userId = userProfile.id;
            
            console.log('Current user ID for survey submission:', userId);
            
            // Format data to match the backend structure exactly
            const formattedSurveyData = {
                // User ID (required by backend)
                user: userId,
                
                // Raw survey responses (question_id -> answer_value) - convert numeric keys to strings
                answers: Object.keys(surveyData.responses || {}).reduce((acc, key) => {
                    acc[String(key)] = surveyData.responses[key];
                    return acc;
                }, {} as Record<string, number>),
                
                // Big Five scores (calculated from responses)
                big_five_scores: surveyData.personality_scores,
                
                // Mark as completed
                completed: true
            };
            
            console.log('=== SURVEY SUBMISSION PAYLOAD ===');
            console.log('Endpoint: personality/surveys/submit/');
            console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.personalitySurveySubmit}`);
            console.log('Payload:', JSON.stringify(formattedSurveyData, null, 2));
            console.log('Expected backend format:', {
                user: 1, // Example user ID
                answers: { "1": 2, "2": 5, "3": 1, "4": 3, "5": 4, "6": 5, "7": 1, "8": 2, "9": 2, "10": 1, "11": 4, "12": 5, "13": 4, "14": 4, "15": 5 },
                big_five_scores: { "openness": 9.17, "neuroticism": 3.33, "extraversion": 8.33, "agreeableness": 10.0, "conscientiousness": 8.33 },
                completed: true
            });
            console.log('================================');
            
            const result = await this.post('personalitySurveySubmit', formattedSurveyData);
            console.log('Survey submission successful:', result);
            return result;
            
        } catch (error: any) {
            console.error('=== SURVEY SUBMISSION ERROR ===');
            console.error('Failed to submit personality survey:', error);
            
            // Handle network errors specifically
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                console.error('Network error detected - this is likely a CORS issue on web platform');
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                console.error('This usually happens when making HTTP requests from HTTPS contexts or due to CORS restrictions');
            }
            
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            }
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request method:', error.config.method);
                console.error('Request headers:', error.config.headers);
                console.error('Request data:', error.config.data);
            }
            console.error('=== END SURVEY SUBMISSION ERROR ===');
            throw error;
        }
    }
    
    // Update personality scores directly (safe for resubmissions)
    async updatePersonalityScores(scores: any): Promise<any> {
        try {
            console.log('Updating personality scores via updateUserProfile endpoint');
            
            // Use the updateUserProfile endpoint to update personality scores
            const profilePayload = {
                personality_scores: {
                    openness: scores.openness,
                    conscientiousness: scores.conscientiousness,
                    extraversion: scores.extraversion,
                    agreeableness: scores.agreeableness,
                    neuroticism: scores.neuroticism
                }
            };
            
            return await this.patch('updateUserProfile', profilePayload);
            
        } catch (error: any) {
            console.error('Failed to update personality scores:', error);
            throw error;
        }
    }

    
    // Helper method to determine primary trait
    private getPrimaryTrait(scores: any): string {
        const entries = Object.entries(scores);
        const sorted = entries.sort((a, b) => (b[1] as number) - (a[1] as number));
        return sorted[0][0];
    }

    /**
     * Complete the character creator onboarding flow (Research Condition A)
     * This combines character creation + onboarding completion
     */
    async completeCharacterOnboarding(characterData: CharacterCreateData): Promise<{
        characterResult: Character;
        onboardingResult: UserProfile;
    }> {
        try {
            console.log('=== COMPLETING CHARACTER ONBOARDING ===');
            
            // First create the character
            const characterResult = await this.createCharacter(characterData);
            console.log('Character created successfully:', characterResult);
            
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
    async getUserCompletionType(): Promise<'survey' | 'character' | null> {
        try {
            const profile = await this.getProfile();
            return profile?.profile?.completion_type as 'survey' | 'character' | null;
        } catch (error) {
            console.error('Error getting user completion type:', error);
            return null;
        }
    }

    // ===== CHARACTER METHODS =====
    async createCharacter(characterData: CharacterCreateData): Promise<Character> {
        // POST to /api/characters/characters/ - Create new character
        try {

//            console.log('=== API SERVICE: CHARACTER CREATION ===');
//            console.log('API Base URL:', apiBaseUrl);
//            console.log('Endpoint:', API_ENDPOINTS.characters);
//            console.log('Full URL will be:', `${apiBaseUrl}${API_ENDPOINTS.characters}`);
//            console.log('Original character data:', characterData);
            
            // Check if this is a simple name-only request or complete character data
            const isSimpleRequest = Object.keys(characterData).length === 1 && 'name' in characterData;
            
            if (isSimpleRequest) {
                // Simple request - only send the name field
                const cleanData = { name: characterData.name };
        //        console.log('Simple request - cleaned data (name only):', cleanData);
        //        console.log('Simple data JSON:', JSON.stringify(cleanData, null, 2));
        //        console.log('Simple data keys:', Object.keys(cleanData));
                
                // Verify no user field is present
                if ('user' in cleanData) {
                    console.error('ERROR: user field found in clean data!');
                    throw new Error('User field should not be present in character creation data');
                }
                
                const result = await this.post<Character>('characters', cleanData);
        //        console.log('Character created successfully (simple):', result);
                return result;
            } else {
                // Complete request - send all character data including customization
        //        console.log('Complete request - sending full character data:', characterData);
        //        console.log('Complete data JSON:', JSON.stringify(characterData, null, 2));
        //        console.log('Complete data keys:', Object.keys(characterData));
                
                // Verify no user field is present
                if ('user' in characterData) {
                    console.error('ERROR: user field found in character data!');
                    throw new Error('User field should not be present in character creation data');
                }
                
                const result = await this.post<Character>('characters', characterData);
        //          console.log('Character created successfully (complete):', result);
                return result;
            }
        } catch (error: any) {
      //      console.error('Character creation failed:', error);
            if (error.response) {
        //        console.error('Response data:', error.response.data);
        //        console.error('Response status:', error.response.status);
        //        console.error('Response headers:', error.response.headers);
            }
            throw error;
        }
    }

    async getMyCharacter(): Promise<Character> {
        try {
            // Try to get character data from the my_character endpoint
            return await this.get<Character>('myCharacter');
        } catch (error) {
      //          console.error('Error getting character:', error);
            throw error;
        }
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
        return this.post('gainExperience', { experience, source }, { urlSuffix: `${characterId}/gain_experience/` });
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

    // ===== NEW COPING TOOLS METHODS =====delete?
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
        return this.post<CodexEntry>('createCodexEntry', entryData);
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
        // Backend expects gear_type_id as a single integer value
        const payload = { 
            gear_type_id: gearTypeId
        };
        console.log('=== ACQUIRE GEAR PAYLOAD ===');
        console.log('Gear type ID:', gearTypeId);
        console.log('Payload:', payload);
        return this.post<CharacterGear>('acquireGear', payload);
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
            console.error('Failed to get completed stories from game data:', error);
            return [];
        }
    }    // Enhanced journal prompt methods for better filtering
    async getFilteredJournalPrompts(options?: {
        category?: string;
        difficulty?: string;
        skillCategory?: string;
        mapArea?: string;
        isActive?: boolean;
    }): Promise<JournalPrompt[]> {
        const params = new URLSearchParams();
        if (options?.category) params.append('category', options.category);
        if (options?.difficulty) params.append('difficulty', options.difficulty);
        if (options?.skillCategory) params.append('skill_category', options.skillCategory);
        if (options?.mapArea) params.append('map_area', options.mapArea);
        if (options?.isActive !== undefined) params.append('is_active', options.isActive.toString());
        
        const queryString = params.toString();
        const urlSuffix = queryString ? `?${queryString}` : '';
          return this.get<JournalPrompt[]>('journalPrompts', { urlSuffix });
    }

    // Mark a journal prompt as inactive (completed)
    async markJournalPromptInactive(promptId: string): Promise<void> {
        return this.patch<void>('journalPrompts', { is_active: false }, { urlSuffix: `${promptId}/deactivate/` });
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
     //       console.log('🔍 All active prompts:', allPrompts);
     //       console.log('🔍 Prompt categories found:', [...new Set(allPrompts.map(p => p.category))]);
            
            // Show prompts from all areas, not just unlocked ones
            // This allows users to see all available prompts regardless of map progress
            const accessiblePrompts = allPrompts;
       //     console.log('🔍 All prompts (no area filtering):', accessiblePrompts);
       //     console.log('🔍 Unlocked areas:', ['entrance', ...unlockedAreas]);

            // Determine preferred skill categories based on completed stories
            const preferredSkills = await this.getPreferredSkillCategories(completedStories);
       //     console.log('🔍 Preferred skills:', preferredSkills);

            // Select one prompt per category (only one active prompt per category)
            const result = {
                journal: this.selectOnePrompt(accessiblePrompts, 'journal', preferredSkills),
                draw: this.selectOnePrompt(accessiblePrompts, 'draw', preferredSkills),
                voice: this.selectOnePrompt(accessiblePrompts, 'voice', preferredSkills)
            };

       //     console.log('🔍 Final result:', result);
            return result;
        } catch (error) {
      //      console.error('Error fetching prompts by category:', error);
            return { journal: null, draw: null, voice: null };
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
                console.warn('Failed to get completed stories for skill categories:', error);
            }
        }

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
    }

    // Helper method to select exactly one prompt per category (for single prompt display)
    private selectOnePrompt(
        prompts: JournalPrompt[], 
        category: string, 
        preferredSkills: string[]
    ): JournalPrompt | null {
        //    console.log(`🔍 Selecting prompt for category: ${category}`);
        //    console.log(`🔍 Available prompts:`, prompts);
        
        // Fix: Make category comparison case-insensitive
        const categoryPrompts = prompts.filter(p => p.category?.toLowerCase() === category.toLowerCase());
        //    console.log(`🔍 Prompts for category '${category}':`, categoryPrompts);
        
        if (categoryPrompts.length === 0) {
            return null;
        }

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

    /**
     * Fetch all available stories from the backend (story catalog)
     */
    async getAvailableStories(): Promise<any[]> {
        return this.get<any[]>('stories');
    }

    /**
     * Fetch passages for a specific chapter
     */
    async getChapterPassages(storyId: number | string, chapterId: number | string): Promise<any> {
        // The backend doesn't have a direct chapter-specific endpoint
        // We need to get all passages for the story and filter by chapter
        const allPassages = await this.get<any>('storypassages', { urlSuffix: `${storyId}/passages/` });
        
        if (allPassages && allPassages.passages) {
            // Filter passages by chapter if they have chapter information
            const chapterPassages = allPassages.passages.filter((passage: any) => 
                passage.chapter === Number(chapterId) || passage.chapter_id === Number(chapterId)
            );
            
            return chapterPassages;
        }
        
        return allPassages?.passages || [];
    }

    /**
     * Fetch all passages for a story
     */
    async getStorypassages(storyId: number): Promise<any> {
        return this.get<any>('storypassages', { urlSuffix: `${storyId}/passages/` });
    }

    /**
     * Fetch passages for a specific chapter within a story
     */
    async getStorypassagesFromChapter(storyId: number, chapterId: number): Promise<any> {
        // For chapter-based stories, we need to get all passages and filter by chapter
        // The backend doesn't have a direct chapter-specific endpoint
        const allPassages = await this.get<any>('storypassages', { urlSuffix: `${storyId}/passages/` });
        
        if (allPassages && allPassages.passages) {
            // Filter passages by chapter if they have chapter information
            const chapterPassages = allPassages.passages.filter((passage: any) => 
                passage.chapter === chapterId || passage.chapter_id === chapterId
            );
            
            return {
                ...allPassages,
                passages: chapterPassages
            };
        }
        
        return allPassages;
    }

    /**
     * Fetch user's progress records for a story
     */
    async getStoryProgressRecords(storyId: string): Promise<any[]> {
        return this.get<any[]>('storyProgressGet', { urlSuffix: `${storyId}/progress/` });
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
        return this.get<any[]>('storyChapters', { urlSuffix: `${storyId}/chapters/` });
    }

    /**
     * Fetch a specific passage by ID
     */
    async getPassage(storyId: number, passageId: string): Promise<any> {
        return this.get<any>('storyPassage', { urlSuffix: `${storyId}/passage/${passageId}/` });
    }

    /**
     * Fetch choices for a specific passage
     */
    async getPassageChoices(passageId: number): Promise<any[]> {
        return this.get<any[]>('passageChoices', { urlSuffix: `${passageId}/choices/` });
    }

    /**
     * Fetch the current passage for a story
     */
    async getCurrentPassage(storyId: number | string): Promise<any> {
        return this.get<any>('getCurrentPassage', { urlSuffix: `${storyId}/current/` });
    }

    /**
     * Fetch chapter passages (alias for getChapterPassages for compatibility)
     */
    async getNewChapterPassages(storyId: number | string, chapterId: number): Promise<any[]> {
        // Use the same approach as getChapterPassages
        return this.getChapterPassages(storyId, chapterId);
    }

    /**
     * Start a new story session
     */
    async startNewStory(storyId: number): Promise<any> {
        return this.post<any>('storyStart', {}, { urlSuffix: `${storyId}/start/` });
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
}

export const apiService = new ApiService();
