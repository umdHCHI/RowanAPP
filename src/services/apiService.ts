import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, LoginResponse, ResearchGroup } from '../types/user';  
import { apiBaseUrl } from './apiConfig';
import { EquipmentItem, EquippedItems } from '../types/equipment'; 
import Constants from 'expo-constants';
const testToken = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;

export const API_ENDPOINTS = {
    // Authentication
    login: 'auth/login/',
    logout: 'auth/logout/',
    tokenVerify: 'auth/token/verify/',
    
    // User endpoints
    users: 'users/',
    userProfile: 'users/me/',
    updateProfile: 'users/update_profile/',
    assignResearchGroup: 'users/assign_research_group/',
    
    // Content endpoints
    characters: 'characters/',
    appearances: 'appearances/',
    gear: 'gear/',
    surveys: 'surveys/',
    storyProgress: 'story-progress/',
    researchGroups: 'research-groups/',
    availableResearchGroups: 'research-groups/available/',
    personality: 'personality/'
} as const;

// ===== Axios Setup =====
const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
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
        try {
            const url = API_ENDPOINTS[endpoint] + (config?.urlSuffix || '');
            const axiosConfig = { ...config };
            delete (axiosConfig as any).urlSuffix;
            const response = await apiClient.post<T>(url, data, axiosConfig);
            return response.data;
        } catch (error) {
            this.handleError(error, 'POST', API_ENDPOINTS[endpoint]);
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

    private handleError(error: any, method: string, url: string) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`Error in ${method} ${url}:`, {
                status: axiosError.response?.status,
                data: axiosError.response?.data,
                message: axiosError.message,
            });
        } else {
            console.error(`Error in ${method} ${url}:`, error);
        }
    }

    // ===== Authentication Methods =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            // For test user, use the hardcoded token
            if (username.toLowerCase() === 'test' || username.toLowerCase() === 'testuser') {
                await AsyncStorage.setItem('authToken', testToken);
                
                return {
                    token: testToken,
                    user: {
                        id: 1,
                        username: 'testuser',
                        email: 'test@example.com',
                        profile: {
                            has_completed_onboarding: false,
                            research_group: null
                        }
                    }
                };
            }

            // For real users, call the login endpoint
            const response = await this.post<LoginResponse>('login', { username, password });
            await AsyncStorage.setItem('authToken', response.token);
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
        }
    }

    async validateToken(): Promise<boolean> {
        try {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return false;

            if (token === testToken) {
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
        return this.patch<UserProfile>('updateProfile', { profile: profileData });
    }

    async getUsers(): Promise<UserProfile[]> {
        return this.get<UserProfile[]>('users');
    }

    async assignResearchGroup(groupId: number): Promise<void> {
        await this.post('assignResearchGroup', { research_group_id: groupId });
    }

    // ===== Research Group Methods =====
    async getAvailableGroups(): Promise<ResearchGroup[]> {
        return this.get<ResearchGroup[]>('availableResearchGroups');
    }

    async getAllGroups(): Promise<ResearchGroup[]> {
        return this.get<ResearchGroup[]>('researchGroups');
    }

    // ===== Onboarding Methods =====
    async completeOnboarding(path: 'character' | 'survey'): Promise<UserProfile> {
        try {
            const groups = await this.getAvailableGroups();
            const researchGroup = groups.find((group) => 
                (path === 'character' && group.condition === 'A') || 
                (path === 'survey' && group.condition === 'B')
            );

            if (!researchGroup) {
                throw new Error('No suitable research group found');
            }

            const updatedProfile = await this.updateProfile({
                has_completed_onboarding: true,
                completion_type: path,
                research_group: researchGroup.id
            });

            console.log('Onboarding completed:', updatedProfile);
            return updatedProfile;
        } catch (error) {
            console.error('Error completing onboarding:', error);
            throw error;
        }
    }
    // ===== Character Methods =====
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


}


    




// Export a singleton instance
export const apiService = new ApiService();