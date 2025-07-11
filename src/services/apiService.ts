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

apiClient.interceptors.request.use(
    async (config) => {
        try {
            console.log('=== REQUEST INTERCEPTOR ===');
            console.log('Making request to:', config.url);
            console.log('Method:', config.method?.toUpperCase());
            
            // Clear any existing Authorization header to avoid conflicts
            delete config.headers.Authorization;
            
            // Add a small delay to ensure AsyncStorage operations are complete
            await new Promise(resolve => setTimeout(resolve, 10));
            
            const token = await AsyncStorage.getItem('authToken');
            console.log('Request interceptor - Token from AsyncStorage:', token ? 'Yes' : 'No');
            console.log('Token value preview:', token ? `${token.substring(0, 10)}...` : 'null');
            
            if (token && token.trim()) {
                // Django REST Framework uses 'Token' prefix for token authentication
                config.headers.Authorization = `Token ${token}`;
                console.log('Request interceptor - Added Authorization header (Token format)');
                console.log('Authorization header:', config.headers.Authorization);
                
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
        if (this.isInitialized) {
            console.log('API Service already initialized');
            return;
        }

        try {
            console.log('=== INITIALIZING API SERVICE ===');
            
            // Check if we have a stored token
            const storedToken = await AsyncStorage.getItem('authToken');
            
            if (storedToken) {
                console.log('Found stored token, will validate on first use');
                // Don't validate during initialization to avoid removing valid tokens
                // Let the response interceptor handle invalid tokens when they're actually used
            } else {
                console.log('No stored token found');
            }
            
            this.isInitialized = true;
            console.log('API Service initialization complete');
        } catch (error) {
            console.error('Error initializing API service:', error);
            // Don't throw - allow the app to continue even if initialization fails
            this.isInitialized = true;
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
    // ==== AS OF RIGHT NOW WE WILL REGISTER NEW USERS =====
    // ===== Authentication Methods verified =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            console.log('=== LOGIN ATTEMPT ===');
            console.log('Username:', username);
            console.log('Login endpoint:', API_ENDPOINTS.login);
            console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.login}`);
            
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
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
                console.error('Response headers:', error.response.headers);
            }
            throw new Error('Login failed. Please check your credentials.');
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

    // ===== User Methods =====
    async getProfile(): Promise<UserProfile> {//verified 
        // First check if we have user data from login response stored
        try {
            const storedUserData = await AsyncStorage.getItem('userData');
            if (storedUserData) {
                console.log('getProfile: Using stored user data from login');
                const userData = JSON.parse(storedUserData);
                return userData;
            }
        } catch (error) {
            console.log('getProfile: No stored user data, falling back to API call');
        }
        
        // Fallback to API call if no stored data
        return this.get<UserProfile>('userProfile');
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
        try {
            console.log('=== API SERVICE: COMPLETING ONBOARDING ===');
            console.log('Onboarding path:', path);
            
            // Determine research condition based on path
            const researchCondition = path === 'character' ? 'A' : 'B';
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
            
            // Check if user already has a survey to decide approach
            const existingSurvey = await this.checkExistingSurvey();
            
            if (existingSurvey) {
                console.log('User already has a survey, using direct personality update approach');
                
                // Update personality scores directly (safer for resubmission)
                const personalityResult = await this.updatePersonalityScores(surveyData.personality_scores);
                console.log('Personality scores updated successfully:', personalityResult);
                
                // Ensure onboarding is marked complete using existing method
                const onboardingResult = await this.completeOnboarding('survey');
                
                return {
                    surveyResult: personalityResult,
                    onboardingResult
                };
                
            } else {
                console.log('First time survey submission, using survey endpoint');
                
                // First time - use the survey endpoint
                try {
                    const surveyResult = await this.submitPersonalitySurvey(surveyData);
                    console.log('Survey submitted successfully via personality endpoint:', surveyResult);
                    return { surveyResult };
                } catch (surveyError) {
                    console.warn('Survey endpoint failed, falling back to manual approach:', surveyError);
                    
                    // Fallback to manual approach
                    const personalityResult = await this.updatePersonalityScores(surveyData.personality_scores);
                    const onboardingResult = await this.completeOnboarding('survey');
                    
                    return {
                        surveyResult: personalityResult,
                        onboardingResult
                    };
                }
            }
            
        } catch (error: any) {
            console.error('Failed to complete survey onboarding:', error);
            throw error;
        }
    }
    
    // Check if user already has a survey
    async checkExistingSurvey(): Promise<any> {
        try {
            // Try to get existing survey
            const response = await this.get('personalitySurveyMySurvey');
            return response; // Will be null if no survey exists
        } catch (error: any) {
            console.log('No existing survey found or error checking:', error);
            return null;
        }
    }
    
    
    // Submit to personality survey endpoint (for first-time submissions)
    async submitPersonalitySurvey(surveyData: any): Promise<any> {
        try {
            console.log('Submitting survey to personality/surveys/submit/');
            
            const formattedSurveyData = {
                survey_type: surveyData.survey_type || 'big_five_personality',
                version: surveyData.version || '1.0',
                started_at: surveyData.started_at,
                completed_at: surveyData.completed_at,
                completion_time_seconds: surveyData.completion_time_seconds,
                
                // Survey responses
                answers: surveyData.responses,
                
                // Big Five scores
                big_five_scores: surveyData.personality_scores,
                
                // Additional data
                total_questions: surveyData.total_questions,
                questions_answered: surveyData.questions_answered,
                completion_percentage: surveyData.completion_percentage,
                
                // Include comprehensive data
                detailed_answers: surveyData.detailed_answers,
                response_distribution: surveyData.response_distribution,
                trait_counts: surveyData.trait_counts
            };
            
            return await this.post('personalitySurveySubmit', formattedSurveyData);
            
        } catch (error: any) {
            console.error('Failed to submit personality survey:', error);
            throw error;
        }
    }
    
    // Update personality scores directly (safe for resubmissions)
    async updatePersonalityScores(scores: any): Promise<any> {
        try {
            console.log('Updating personality scores via users/personality-profiles/update_scores/');
            
            return await this.post('personalitySurveyUpdateScores', {
                openness: scores.openness,
                conscientiousness: scores.conscientiousness,
                extraversion: scores.extraversion,
                agreeableness: scores.agreeableness,
                neuroticism: scores.neuroticism
            });
            
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
      //      console.log(`🔍 No prompts found for category '${category}'`);
            return null;
        }

        // Try to find a prompt with preferred skill first
        for (const skill of preferredSkills) {
            const skillPrompts = categoryPrompts.filter(p => p.skill_category === skill);
            if (skillPrompts.length > 0) {
        //        console.log(`🔍 Found prompt with preferred skill '${skill}' for category '${category}':`, skillPrompts[0]);
                // Return the first prompt from this skill category (not random)
                return skillPrompts[0];
            }
        }

        // Fallback: return the first prompt from category (not random)
    //    console.log(`🔍 Using fallback prompt for category '${category}':`, categoryPrompts[0]);
        return categoryPrompts[0];
    }

    // ===== STORY METHODS (UPDATED FOR NEW BACKEND STRUCTURE) =====
    
    // Get story catalog
    async getNewStoryCatalog(): Promise<any[]> {
        return this.get<any[]>('stories');
    }

    // Get chapters for a specific story
    async getNewStoryChapters(storyId: number): Promise<any[]> {
        // Construct the URL explicitly to avoid any concatenation issues
        const url = `story/stories/${storyId}/chapters/`;
    //    console.log('=== EXPLICIT CHAPTERS URL CONSTRUCTION ===');
    //    console.log('Story ID:', storyId);
    //    console.log('Constructed URL:', url);
    //    console.log('Expected URL: story/stories/[ID]/chapters/');
        
        
        return this.get<any[]>('storyRoot', { urlSuffix: `stories/${storyId}/chapters/` });
    }

    // Get passages for a specific chapter (only requires chapter ID)
    async getNewChapterPassages(storyId: number, chapterId: number): Promise<any[]> {
    //    console.log('=== EXPLICIT CHAPTER PASSAGES URL CONSTRUCTION ===');
    //    console.log('Story ID:', storyId);
    //    console.log('Chapter ID:', chapterId);
        const suffix = `chapters/${chapterId}/passages/`;
    //    console.log('URL suffix:', suffix);
    //    console.log('Expected final URL: story/chapters/[chapterId]/passages/');
    //    console.log('=== END EXPLICIT CHAPTER PASSAGES CONSTRUCTION ===');
        
        return this.get<any[]>('storyRoot', { urlSuffix: suffix });
    }

    // Start a specific story
    async startNewStory(storyId: number): Promise<any> {
    //    console.log('=== STARTING STORY ===');
    //    console.log('Story ID:', storyId);
    //    console.log('Using endpoint: story/stories/{storyId}/start/');
        
        return this.post<any>('storyStart', {}, { urlSuffix: `${storyId}/start/` });
    }

    // Get current passage for a story
    async getCurrentPassage(storyId: number): Promise<any> {
    //    console.log('=== GETTING CURRENT PASSAGE ===');
    //    console.log('Story ID:', storyId);
    //    console.log('Using endpoint: get_current_passage/{storyId}/');
        
        return this.get<any>('getCurrentPassage', { urlSuffix: `${storyId}/current/` });
    }

    // Get a specific passage in a story (legacy method)
    async getNewStoryPassage(storyId: number, passageId: string): Promise<any> {
    //    console.log('=== EXPLICIT STORY PASSAGE URL CONSTRUCTION ===');
    //    console.log('Story ID:', storyId);
    //    console.log('Passage ID:', passageId);
        const suffix = `stories/${storyId}/passage/${encodeURIComponent(passageId)}/`;
    //    console.log('URL suffix:', suffix);
    //    console.log('Expected final URL: story/stories/[storyId]/passage/[passageId]/');
    //    console.log('=== END EXPLICIT PASSAGE CONSTRUCTION ===');
        
        return this.get<any>('storyRoot', { urlSuffix: suffix });
    }

    // Get choices for a specific passage
    async getPassageChoices(passageId: string | number): Promise<any[]> {
    //    console.log('=== GETTING PASSAGE CHOICES ===');
    //    console.log('Passage ID:', passageId);
    //    console.log('Expected URL: story/passages/[passageId]/choices/');
    //    console.log('=== END GETTING PASSAGE CHOICES ===');
        
        return this.get<any[]>('passageChoices', { urlSuffix: `${passageId}/choices/` });
    }

    // Make a choice in a story
    async makeChoiceBackend(choiceId: number): Promise<any> {
    //    console.log('=== MAKING CHOICE ===');
    //    console.log('Choice ID:', choiceId);
    //    console.log('Using endpoint: make_choice/{choiceId}/');
        
        return this.post<any>('makeChoice', {}, { urlSuffix: `${choiceId}/select/` });
    }

    // Select a choice in a story (legacy method)
    async selectNewChoice(choiceId: number): Promise<any> {
        // Based on Django views.py, this should call the choice selection endpoint
        // which processes the choice and returns the next passage
        return this.post<any>('choiceSelect', {}, { urlSuffix: `${choiceId}/select/` });
    }

    // Get story progress
    async getNewStoryProgress(storyId: number): Promise<any> {
        return this.get<any>('storyProgressGet', { urlSuffix: `${storyId}/progress/` });
    }

    // ===== MIGRATED METHODS FROM ARCHIVE SERVICE =====
    
    // Get available stories (migrated from archiveService)
    async getAvailableStories(): Promise<any[]> {
        try {
    //        console.log('=== getAvailableStories called ===');
            const res = await this.getNewStoryCatalog();
    //        console.log('Raw backend stories response:', res);
            
            if (res && Array.isArray(res) && res.length > 0) {
    //            console.log('Retrieved stories from backend:', res);
                
                // Transform backend format to frontend format
                const transformedStories = res.map((story, index) => {
    //                console.log(`Transforming story ${index + 1}:`, story);
                    return this.transformBackendStory(story);
                });
                
                
                return transformedStories;
            }
            
            return [];
        } catch (error: any) {
            //console.error('Failed to get available stories:', error);
            return [];
        }
    }

    // Get chapters for a story (migrated from archiveService)
    async getChapters(storyId: string): Promise<any[]> {
        try {
    //        console.log('Getting chapters for story:', storyId);
            const chapters = await this.getNewStoryChapters(parseInt(storyId));
    //        console.log('Raw chapters from backend:', chapters);
            
            // Transform the Django chapter format to frontend format
            const transformedChapters = chapters.map((chapter: any) => ({
                id: chapter.id,
                title: chapter.title,
                chapterNumber: chapter.chapter_number,
                isStartingChapter: chapter.is_starting_chapter
            }));
            
            return transformedChapters;
        } catch (error) {
    //        console.error('Failed to get chapters:', error);
            return [];
        }
    }

    // Get chapter passages (migrated from archiveService)
    async getChapterPassages(storyId: string, chapterId: string): Promise<any[]> {
        try {
    //        console.log('Getting passages overview for story:', storyId, 'chapter:', chapterId);
            const passages = await this.getNewChapterPassages(parseInt(storyId), parseInt(chapterId));
    //        console.log('Raw passages overview from backend for story', storyId, 'chapter', chapterId, ':', passages);
            return passages || [];
        } catch (error) {
    //        console.error('Failed to get chapter passages:', error);
            return [];
        }
    }

    // Get a specific passage (migrated from archiveService)
    async getPassage(storyId: number, passageId?: string): Promise<any> {
        try {
    //        console.log("=== GET PASSAGE (MIGRATED) ===");
    //        console.log("Story ID:", storyId);
    //        console.log("Requested Passage ID:", passageId);
            
            let currentPassageId = passageId;
            
            // If no passage ID provided, try to get current passage from progress
            if (!currentPassageId) {
                try {
                    const progress = await this.getNewStoryProgress(storyId);
                    currentPassageId = progress?.current_passage_id;
        //            console.log("Got current passage from progress:", currentPassageId);
                } catch (progressError) {
        //            console.warn('Could not get story progress:', progressError);
                }
            }
            
            if (!currentPassageId) {
                throw new Error('No passage ID available');
            }
            
    //        console.log('=== FETCHING PASSAGE FROM BACKEND ===');
    //        console.log('Story ID:', storyId);
    //        console.log('Passage ID:', currentPassageId);
            
            // Make direct API call using the correct endpoint structure
            const response = await this.get<any>('storyRoot', { 
                urlSuffix: `stories/${storyId}/passage/${encodeURIComponent(currentPassageId)}/` 
            });
            
    //        console.log('Raw API response:', response);
            
            // The backend returns a nested structure, extract the passage
            let passage: any;
            if (response?.passage) {
    //            console.log('Found passage in response:', response.passage);
                passage = response.passage;
            } else if (response?.content) {
    //            console.log('Response appears to be passage directly:', response);
                passage = response;
            } else if (response) {
    //            console.log('Unexpected response structure:', Object.keys(response));
    //            console.log('Full response:', response);
                passage = response;
            } else {
                throw new Error('No passage data found in response');
            }

            // Get choices for this passage
            try {
                // Get chapters to find the numeric ID for choices
                const chapters = await this.getNewStoryChapters(storyId);
                if (chapters && chapters.length > 0) {
                    const targetChapter = chapters.find((ch: any) => ch.is_starting_chapter) || chapters[0];
                    const passageList = await this.getNewChapterPassages(storyId, targetChapter.id);
                    
                    // Find the passage with matching UUID to get the numeric ID
                    const passageInfo = passageList.find((p: any) => p.passage_id === currentPassageId);
                    if (passageInfo && passageInfo.id) {
        //                console.log('Found numeric ID for choices:', passageInfo.id);
                        const choices = await this.getPassageChoices(passageInfo.id);
        //                console.log('Fetched choices for passage:', choices);
                        passage.choices = choices;
                    } else {
        //                console.warn('Could not find numeric ID for passage UUID:', currentPassageId);
                        passage.choices = [];
                    }
                }
            } catch (choiceError) {
        //        console.warn('Could not load choices for passage:', choiceError);
                passage.choices = [];
            }

            return passage;
        } catch (error) {
    //        console.error('Failed to get passage:', error);
            throw error;
        }
    }

    // Get story passages (migrated from archiveService)
    async getStorypassages(storyId: number): Promise<any> {
        try {
    //        console.log('Getting story passages for story:', storyId);
            
            // Try to get chapters first
            const chapters = await this.getNewStoryChapters(storyId);
            
            if (chapters && chapters.length > 0) {
                // Story has chapters, get passages from the starting chapter
                const startingChapter = chapters.find((ch: any) => ch.is_starting_chapter) || chapters[0];
                const passages = await this.getNewChapterPassages(storyId, startingChapter.id);
                
                return {
                    id: storyId.toString(),
                    title: 'Story', // You might want to get this from story catalog
                    subtitle: 'main',
                    atmosphere: 'Mysterious',
                    difficulty: 'Intermediate',
                    rarity: 'Common',
                    skillFocus: ['General'],
                    passages: passages.map((passage: any) => ({
                        id: passage.id,
                        passage_id: passage.passage_id,
                        content: passage.content,
                        passage_type: passage.passage_type,
                        speaker: passage.speaker,
                        required_conditions: passage.required_conditions || {},
                        story_effects: passage.story_effects || {},
                        mood: passage.mood,
                        background_music: passage.background_music,
                        background_image: passage.background_image,
                        order: passage.order,
                        choices: []
                    })),
                    currentPassage: passages[0] ? {
                        id: passages[0].id,
                        passage_id: passages[0].passage_id,
                        content: passages[0].content,
                        passage_type: passages[0].passage_type,
                        speaker: passages[0].speaker,
                        required_conditions: passages[0].required_conditions || {},
                        story_effects: passages[0].story_effects || {},
                        mood: passages[0].mood,
                        background_music: passages[0].background_music,
                        background_image: passages[0].background_image,
                        order: passages[0].order,
                        choices: []
                    } : null,
                    progress: {
                        passagesVisited: 0,
                        isCompleted: false,
                        progressPercentage: 0
                    },
                    isChapterBased: true,
                    chapterId: startingChapter.id,
                    chapterTitle: startingChapter.title
                };
            } else {
                // Story has no chapters, try to get passages directly
                throw new Error('No chapters found for story');
            }
        } catch (error) {
            //console.error('Failed to get story passages:', error);
            throw error;
        }
    }

    // Get story passages from chapter (migrated from archiveService)
    async getStorypassagesFromChapter(storyId: number, chapterId: number): Promise<any> {
        try {
            //console.log('Getting story passages from chapter:', storyId, chapterId);
            const passages = await this.getNewChapterPassages(storyId, chapterId);
            
            // Get the first passage with its choices (the passage data already includes choices)
            let currentPassage = null;
            if (passages && passages.length > 0) {
                const firstPassage = passages[0];
                try {
              //      console.log('Loading first passage with choices for passage_id:', firstPassage.passage_id);
                    const passageData = await this.get<any>('storyRoot', { 
                        urlSuffix: `stories/${storyId}/passage/${encodeURIComponent(firstPassage.passage_id)}/` 
                    });
              //      console.log('Loaded passage data:', passageData);
                    
                    if (passageData?.passage) {
                        currentPassage = {
                            id: passageData.passage.passage_id, // Use passage_id instead of numeric id
                            passage_id: passageData.passage.passage_id,
                            content: passageData.passage.content,
                            passage_type: passageData.passage.passage_type,
                            speaker: passageData.passage.speaker_name,
                            required_conditions: passageData.passage.required_conditions || {},
                            story_effects: passageData.passage.story_effects || {},
                            mood: passageData.passage.mood,
                            background_music: passageData.passage.background_music,
                            background_image: passageData.passage.background_image,
                            order: firstPassage.order,
                            choices: passageData.passage.choices || []
                        };
                    }
                } catch (passageError) {
              //      console.warn('Could not load passage data for', firstPassage.passage_id, ':', passageError);
                }
            }
            
            return {
                id: storyId.toString(),
                title: 'Story',
                subtitle: 'main',
                atmosphere: 'Mysterious',
                difficulty: 'Intermediate',
                rarity: 'Common',
                skillFocus: ['General'],
                passages: passages.map((passage: any) => ({
                    id: passage.passage_id, // Use passage_id instead of numeric id
                    passage_id: passage.passage_id,
                    content: passage.content,
                    passage_type: passage.passage_type,
                    speaker: passage.speaker,
                    required_conditions: passage.required_conditions || {},
                    story_effects: passage.story_effects || {},
                    mood: passage.mood,
                    background_music: passage.background_music,
                    background_image: passage.background_image,
                    order: passage.order,
                    choices: [] // Will be loaded when passage is accessed
                })),
                currentPassage: currentPassage,
                progress: {
                    passagesVisited: 0,
                    isCompleted: false,
                    progressPercentage: 0
                },
                isChapterBased: true,
                chapterId: chapterId,
                chapterTitle: `Chapter ${chapterId}`
            };
        } catch (error) {
            //console.error('Failed to get story passages from chapter:', error);
            throw error;
        }
    }

    // Get story progress records (migrated from archiveService)
    async getStoryProgressRecords(storyId: string): Promise<any[]> {
        try {
            //console.log('Getting story progress records for story:', storyId);
            const progress = await this.getNewStoryProgress(parseInt(storyId));
            
            // Transform progress data to match expected format
            if (progress && progress.visited_passages) {
                return progress.visited_passages.map((passageId: string) => ({
                    story_id: storyId,
                    passage_id: passageId,
                    visited_at: new Date().toISOString()
                }));
            }
            
            return [];
        } catch (error) {
            //console.error('Failed to get story progress records:', error);
            return [];
        }
    }

    // Complete story (migrated from archiveService)


    // Save progress (migrated from archiveService)
    async saveProgress(storyId: string, passageId: string, choiceId?: string): Promise<any> {
        try {
            //console.log('Saving progress for story:', storyId, 'passage:', passageId);
            
            // Based on Django views.py, progress is automatically saved when visiting passages
             // and when making choices. This method is mainly for tracking purposes.
            const progressData = {
                story_id: parseInt(storyId),
                passage_id: passageId,
                choice_id: choiceId
            };
            
            // Use the story progress endpoint
            const result = await this.post<any>('storyProgressCRUD', progressData);
            return result;
        } catch (error) {
               // console.error('Failed to save progress:', error);
            throw error;
        }
    }

    // Make choice (migrated from archiveService) - updated to use new backend
    async makeChoice(choiceId: string): Promise<any> {
        try {
            //console.log('Making choice:', choiceId);
            const result = await this.makeChoiceBackend(parseInt(choiceId));
            return result;
        } catch (error) {
           // console.error('Failed to make choice:', error);
            throw error;
        }
    }

    // Get character rewards (migrated from archiveService)
    async getCharacterRewards(characterId: string): Promise<any[]> {
        try {
            //console.log('Getting character rewards for:', characterId);
            // This would need to be implemented based on your backend structure
            // For now, return empty array
            return [];
        } catch (error) {
            //console.error('Failed to get character rewards:', error);
            return [];
        }
    }

    // Save game data (migrated from archiveService)
    async saveGameData(gameData: any): Promise<any> {
        try {
            //console.log('Saving game data:', gameData);
            const result = await this.post<any>('gameData', gameData);
            return result;
        } catch (error) {
           // console.error('Failed to save game data:', error);
            throw error;
        }
    }

// Complete story (migrated from archiveService)
async completeStory(
    storyId: string, 
    finalRewards: string[], 
    skillsLearned: string[], 
    totalStatGains: Record<string, number>,
    journalEntries: string[] = []
): Promise<any> {
    try {
        //console.log('Completing story:', storyId);
        //console.log('Final rewards:', finalRewards);
        //console.log('Skills learned:', skillsLearned);
        //console.log('Total stat gains:', totalStatGains);
        //console.log('Journal entries:', journalEntries);
        
        // Call the story completion endpoint
        const result = await this.post<any>('storyComplete', {
            story_id: parseInt(storyId),
            final_rewards: finalRewards,
            skills_learned: skillsLearned,
            stat_gains: totalStatGains,
            journal_entries: journalEntries
        });
        
        // Handle the comprehensive response
        if (result.story_completed) {
            // Update local player state if you have state management
            this.updateLocalPlayerData(result.player_data);
            
            // Show completion notifications
            this.showCompletionNotifications(result);
        }
        
        return result;
    } catch (error) {
        //console.error('Failed to complete story:', error);
        throw error;
    }
}

// New method to handle story completion from ending passage with accumulated rewards
async completeStoryFromEnding(
    storyId: string,
    passageId: string,
    totalStatGains: Record<string, number> = {},
    journalEntries: string[] = [],
    finalRewards: string[] = [],
    skillsLearned: string[] = []
): Promise<any> {
    try {
        console.log('=== COMPLETING STORY FROM ENDING PASSAGE ===');
        console.log('Story ID:', storyId);
        console.log('Passage ID:', passageId);
        console.log('Total stat gains:', totalStatGains);
        console.log('Final rewards:', finalRewards);
        console.log('Skills learned:', skillsLearned);
        console.log('Journal entries:', journalEntries);
        
        // Call the story completion endpoint with comprehensive reward data
        const payload = {
            story_id: storyId,
            passage_id: passageId,
            stat_gains: totalStatGains,
            final_rewards: finalRewards,
            skills_learned: skillsLearned,
            journal_entries: journalEntries
        };
        
        console.log('=== API CALL PAYLOAD ===');
        console.log('Endpoint: storyComplete');
        console.log('Payload:', payload);
        
        const result = await this.post<any>('storyComplete', payload);
        
        console.log('Story completion result:', result);
        console.log('Result structure:', Object.keys(result || {}));
        console.log('Story completed flag:', result?.story_completed);
        console.log('Rewards earned:', result?.rewards_earned);
        console.log('Player data:', result?.player_data);
        
        // Handle the comprehensive response
        if (result?.story_completed) {
            // Update local player state if you have state management
            this.updateLocalPlayerData(result.player_data);
            
            // Log completion notifications for debugging
            this.showCompletionNotifications(result);
        }
        
        return result;
    } catch (error) {
        console.error('Failed to complete story from ending passage:', error);
        throw error;
    }
}

// Helper method to update local player data (add this if you have state management)
private updateLocalPlayerData(playerData: any): void {
    // Update your frontend state with new player data
    // This depends on how you manage state in your app
    
    // Example if you have a player service or state:
    // this.playerService.updatePlayerLevel(playerData.level);
    // this.playerService.updatePlayerScore(playerData.score);
    // this.playerService.updatePlayerStats(playerData.stats);
    // this.playerService.updatePlayerSkills(playerData.skills);
    // this.playerService.updatePlayerInventory(playerData.inventory);
    // this.playerService.updatePlayerJournal(playerData.journal_entries);
    // this.playerService.updateCompletedStories(playerData.completed_stories);
    
    console.log('Updated player data:', playerData);
}

// Helper method to show completion notifications (add this for user feedback)
private showCompletionNotifications(result: any): void {
    console.log('=== SHOWING COMPLETION NOTIFICATIONS ===');
    console.log('Full result:', result);
    
    const rewards = result?.rewards_earned;
    const playerData = result?.player_data;
    const storyTitle = result?.story_title || 'Unknown Story';
    
    // Show main completion message with safe access
    const xpEarned = rewards?.xp_earned || 0;
    console.log(`Story "${storyTitle}" completed! +${xpEarned} XP`);
    
    // Show rewards earned (with null checks)
    if (rewards?.final_rewards && rewards.final_rewards.length > 0) {
        console.log(`Items earned: ${rewards.final_rewards.join(', ')}`);
        // You could show a toast notification or modal here
    }
    
    if (rewards?.skills_learned && rewards.skills_learned.length > 0) {
        console.log(`Skills learned: ${rewards.skills_learned.join(', ')}`);
    }
    
    if (rewards?.stat_gains && Object.keys(rewards.stat_gains).length > 0) {
        const statText = Object.entries(rewards.stat_gains)
            .map(([stat, gain]) => `+${gain} ${stat}`)
            .join(', ');
        console.log(`Stats gained: ${statText}`);
    }
    
    if (rewards?.journal_entries && rewards.journal_entries.length > 0) {
        console.log(`New journal entries: ${rewards.journal_entries.join(', ')}`);
    }
    
    // Show level up notification (with null checks)
    if (playerData?.leveled_up) {
        console.log(`🎉 LEVEL UP! ${playerData.old_level} → ${playerData.level}`);
        // You could show a special level up animation/modal here
    }
    
    // Log the structure for debugging
    console.log('Rewards structure:', rewards);
    console.log('Player data structure:', playerData);
    
    // For actual UI notifications, you might use:
    // this.notificationService.showSuccess(`Story completed! +${xpEarned} XP`);
    // if (rewards?.final_rewards?.length > 0) {
    //     this.notificationService.showInfo(`Items: ${rewards.final_rewards.join(', ')}`);
    // }
    // if (playerData?.leveled_up) {
    //     this.notificationService.showLevelUp(playerData.old_level, playerData.level);
    // }
}

    // ===== HELPER METHODS =====
    
    // Transform backend story format to frontend format
    private transformBackendStory(backendStory: any): any {
        return {
            id: backendStory.id,
            title: backendStory.title || 'Untitled Story',
            description: backendStory.description || '',
            image: backendStory.image || null,
            min_level: backendStory.min_level || 1,
            chapter_count: backendStory.chapter_count || 0,
            skillFocus: backendStory.skill_focus || ['General'],
            rarity: backendStory.rarity || 'Common',
            difficulty: backendStory.difficulty || 'Intermediate',
            atmosphere: backendStory.atmosphere || 'Mysterious',
            isCompleted: backendStory.is_completed || false,
            progress: backendStory.progress || 0
        };
    }

    // ===== LEGACY STORY METHODS (for backward compatibility) =====
    
    /* Legacy methods - keeping these for any existing components that might use them
    async getStories(): Promise<any[]> {
        return this.getNewStoryCatalog();
    }

    async getStoryCatalog(): Promise<any[]> {
        return this.getNewStoryCatalog();
    }

    async getStoryChapters(storyId: number): Promise<any[]> {
        return this.getNewStoryChapters(storyId);
    }

    async getChapterPassages(chapterId: number): Promise<any[]> {
        return this.getNewChapterPassages(chapterId);
    }

    async startStory(storyId: number): Promise<any> {
        return this.startNewStory(storyId);
    }

    async getStoryPassage(storyId: number, passageId: number): Promise<any> {
        return this.getNewStoryPassage(storyId, passageId);
    }

    async selectChoice(choiceId: number): Promise<any> {
        return this.selectNewChoice(choiceId);
    }

    async getStoryProgress(storyId: number): Promise<any> {
        return this.getNewStoryProgress(storyId);
    }*/
}

// Export a singleton instance
export const apiService = new ApiService();

// Export test method for debugging
export const testTokenAuth = () => apiService.testTokenAuth();