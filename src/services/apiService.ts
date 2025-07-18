import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { PersonalityType } from '../types/';
import { PersonalityStories } from '../types/personality';
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

            
            // Skip authorization for login requests
            if (config.url?.includes('auth/login') || config.url?.includes('login')) {
                return config;
            }
            
            // Clear any existing Authorization header to avoid conflicts
            delete config.headers.Authorization;
            
            // Add a small delay to ensure AsyncStorage operations are complete
            await new Promise(resolve => setTimeout(resolve, 10));
            
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
                    fullURL: `${config.baseURL}${config.url}`
                });
            } else {

                
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
    // ==== AS OF RIGHT NOW WE WILL REGISTER NEW USERS =====
    // ===== Authentication Methods verified =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            
            const response = await this.post<LoginResponse>('login', { username, password });
            
            if (!response.token) {
                throw new Error('No token received from login response');
            }
            
            // Store the token and character ID
            await AsyncStorage.setItem('authToken', response.token);
            await AsyncStorage.setItem('characterId', String(response.user.id));
            
            // Store the complete user data for getProfile() to use
            await AsyncStorage.setItem('userData', JSON.stringify(response.user));
            
            // Add a small delay to ensure AsyncStorage operations complete
            await new Promise(resolve => setTimeout(resolve, 50));
            return response;
        } catch (error: any) {
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
                return true;
            } catch (error) {
                // Don't remove token here - let response interceptor handle it
                return false;
            }
        } catch (error) {
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
    public async testTokenAuthentication(): Promise<{
        success: boolean;
        status?: number;
        data?: any;
        error?: string;
    }> {
        try {
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
            
            return { success: true, status: response.status, data: response.data };
            
        } catch (error: any) {
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
        console.log('=== UPDATE PROFILE DEBUG ===');
        console.log('Profile data being sent:', profileData);
        console.log('Profile data JSON:', JSON.stringify(profileData, null, 2));
        console.log('================================');
        const result = await this.patch<UserProfile>('updateUserProfile', profileData);
        console.log('=== UPDATE PROFILE RESPONSE ===');
        console.log('Response:', result);
        
        console.log('================================');
        return result;
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
                const surveyResult = await this.submitSurveyData(surveyData);
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
    
    
    // REMOVED: submitPersonalitySurvey() - duplicate of submitSurveyData()
    
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
                
                const result = await this.patch<Character>('updateUserProfile', cleanData);
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
                
                const result = await this.patch<Character>('updateUserProfile', characterData);
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
            // Try to get character data from the home data endpoint
            const homeData = await this.get<HomeData>('characterHomeData');
            return homeData.character;
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

    async updateCharacterCustomization(customizationData: Character): Promise<Character> {
        // Use the specific character update endpoint
        return this.patch('updateCustomization', customizationData, { 
            urlSuffix: `${customizationData.id}/update_customization/` 
        });
    }

    async gainExperience(characterId: number, experience: number, source?: string): Promise<Character & {
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
        
        try {
            const result = await this.post<Character & {
                experience_gained: number;
                source: string;
                level_up?: boolean;
                levels_gained?: number;
                message?: string;
            }>('gainExperience', { experience, source }, { urlSuffix: `${characterId}/gain_experience/` });
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

    // REMOVED: getCustomizationOptions() - returns mock data, not used

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

    // REMOVED: getToolUsageStats() - endpoint not implemented    // ===== JOURNAL & CODEX METHODS (matching your Django backend) =====
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
        prompt: number; // Changed from string to number - should be the prompt ID
        entry_type: 'journal' | 'draw' | 'voice';
        content: string;
    }): Promise<CodexEntry> {
        console.log('=== CREATING CODEX ENTRY ===');
        console.log('Entry data:', entryData);
        console.log('Endpoint:', API_ENDPOINTS.createCodexEntry);
        console.log('Full URL:', `${apiBaseUrl}${API_ENDPOINTS.createCodexEntry}`);
        
        try {
            const result = await this.post<CodexEntry>('codexEntries', entryData);
            console.log('Codex entry created successfully:', result);
            return result;
        } catch (error: any) {
            console.error('Failed to create codex entry:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    }    // ===== NEW GEAR METHODS =====
    // REMOVED: getAvailableGear() - not used in current implementation

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
            console.warn('Failed to get completed stories from game data, returning empty array:', error);
            // Return empty array instead of throwing error to prevent cascading failures
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
        try {
            const params = new URLSearchParams();
            if (options?.category) params.append('category', options.category);
            if (options?.difficulty) params.append('difficulty', options.difficulty);
            if (options?.skillCategory) params.append('skill_category', options.skillCategory);
            if (options?.mapArea) params.append('map_area', options.mapArea);
            if (options?.isActive !== undefined) params.append('is_active', options.isActive.toString());
            
            const queryString = params.toString();
            const urlSuffix = queryString ? `?${queryString}` : '';
            return await this.get<JournalPrompt[]>('journalPrompts', { urlSuffix });
        } catch (error) {
            console.warn('Failed to get filtered journal prompts, returning empty array:', error);
            // Return empty array instead of throwing error to prevent cascading failures
            return [];
        }
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
            console.log('🔍 All active prompts:', allPrompts);
            console.log('🔍 Prompt categories found:', [...new Set(allPrompts.map(p => p.category))]);
            
            // Show prompts from all areas, not just unlocked ones
            // This allows users to see all available prompts regardless of map progress
            const accessiblePrompts = allPrompts;
            console.log('🔍 All prompts (no area filtering):', accessiblePrompts);
            console.log('🔍 Unlocked areas:', ['entrance', ...unlockedAreas]);

            // Determine preferred skill categories based on completed stories
            const preferredSkills = await this.getPreferredSkillCategories(completedStories);
            console.log('🔍 Preferred skills:', preferredSkills);

            // Select one prompt per category (only one active prompt per category)
            const result = {
                journal: this.selectOnePrompt(accessiblePrompts, 'journal', preferredSkills, completedStories),
                draw: this.selectOnePrompt(accessiblePrompts, 'draw', preferredSkills, completedStories),
                voice: this.selectOnePrompt(accessiblePrompts, 'voice', preferredSkills, completedStories)
            };

            console.log('🔍 Final result:', result);
            
            // If no prompts from backend, provide fallback prompts
            if (!result.journal && !result.draw && !result.voice) {
                console.log('🔍 No prompts from backend, providing fallback prompts');
                return this.getFallbackPrompts();
            }
            
            return result;
        } catch (error) {
            console.warn('Error fetching prompts by category, returning fallback prompts:', error);
            // Return fallback prompts instead of empty prompts
            return this.getFallbackPrompts();
        }
    }

    // Provide fallback prompts when backend doesn't have any
    private getFallbackPrompts(): {
        journal: JournalPrompt | null;
        draw: JournalPrompt | null;
        voice: JournalPrompt | null;
    } {
        const fallbackPrompts = {
            journal: {
                id: 1,
                prompt_id: 'fallback-journal-1',
                text: 'Reflect on a moment today when you felt proud of yourself. What did you accomplish, and how did it make you feel?',
                category: 'journal' as const,
                skill_category: 'Self-Compassion' as const,
                map_area: 'entrance' as const,
                difficulty: 'Beginner' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            draw: {
                id: 2,
                prompt_id: 'fallback-draw-1',
                text: 'Draw a symbol that represents your inner strength. What does it look like to you?',
                category: 'draw' as const,
                skill_category: 'Emotional Awareness' as const,
                map_area: 'entrance' as const,
                difficulty: 'Beginner' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            voice: {
                id: 3,
                prompt_id: 'fallback-voice-1',
                text: 'Record a voice message about something that made you smile today. Share the details and why it mattered to you.',
                category: 'voice' as const,
                skill_category: 'Social Connection' as const,
                map_area: 'entrance' as const,
                difficulty: 'Beginner' as const,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        };
        
        console.log('🔍 Using fallback prompts (Beginner only):', fallbackPrompts);
        return fallbackPrompts;
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
            // 1. Fetch the list of all chapters for the story. This is efficient.
            const chapters = await this.getChapters(storyId);
            if (!chapters || chapters.length === 0) {
                console.warn(`No chapters found for story ${storyId}`);
                return [];
            }
    
            // Debug: Log all available chapters and their IDs
            console.log(`🔍 Available chapters for story ${storyId}:`, chapters.map((chap: any) => ({ id: chap.id, title: chap.title })));
            console.log(`🎯 Looking for chapter ID: ${chapterId} (type: ${typeof chapterId})`);
    
            // 2. Find the specific chapter the user requested from the list.
            const targetChapter = chapters.find((chap: any) => chap.id === chapterId);
    
            if (!targetChapter) {
                console.error(`❌ Chapter with ID ${chapterId} not found in story ${storyId}`);
                console.error(`Available chapter IDs:`, chapters.map((chap: any) => chap.id));
                return [];
            }
            
            console.log(`✅ Found target chapter: ${targetChapter.title} (ID: ${targetChapter.id})`);
    
            // 3. Return the 'passages' array that is already nested within the chapter data.
            // This avoids fetching all passages for the entire story.
            console.log(`✅ Found chapter "${targetChapter.title}". Returning its ${targetChapter.passages?.length || 0} nested passages.`);
            return targetChapter.passages || [];
    
        } catch (error) {
            this.handleError(error, 'GET', `chapters for story ${storyId}`);
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
            const chapterPassages = await this.getChapterPassages(storyId, chapterId);
            
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
            
            const payload = {
                story: storyId,
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
async getPersonalityStatus(): Promise<{ personality : PersonalityType }> {    
    return this.post<any>('personalityStatus', {});
  }

  // NEW: Get personality-specific stories (for Research Condition B users)
  async getPersonalityStories(testPersonality?: string): Promise<PersonalityStories> {
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
}

export const apiService = new ApiService();
