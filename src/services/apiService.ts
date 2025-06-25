import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import { EquipmentItem, EquippedItems } from '../types/equipment';
import { Prompt } from '../types/journal';
import { Character, CharacterCreateData, CharacterCustomizationData, GameData, LoginResponse, ResearchGroup, UserProfile } from '../types/user';
import { API_ENDPOINTS, apiBaseUrl } from './apiConfig';

const testToken = Constants.expoConfig?.extra?.TEST_USER_TOKEN as string;

// Debug logging for test token
console.log('Test token configured:', testToken ? 'Yes' : 'No');
if (!testToken) {
    console.warn('TEST_USER_TOKEN not configured in environment variables');
}

const FALLBACK_TEST_TOKEN = 'f1cc174d83a2101bc328075957300f2407b68324';

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
                headers: axiosError.config?.headers,
                url: axiosError.config?.url,
            });
            
            // Log the full error response for debugging
            if (axiosError.response?.data) {
                console.error('Full error response:', axiosError.response.data);
            }
        } else {
            console.error(`Error in ${method} ${url}:`, error);
        }
    }

    // ===== Authentication Methods =====
    async login(username: string, password: string): Promise<LoginResponse> {
        try {
            // Call the real login endpoint for all users
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
        return this.patch<UserProfile>('updateProfile', { profile: profileData });
    }

    async getUsers(): Promise<UserProfile[]> {
        return this.get<UserProfile[]>('users');
    }

    async assignResearchGroup(groupId: number): Promise<void> {
        await this.post('assignResearchGroup', { research_group_id: groupId });
    }

    async assignResearchGroupByCondition(condition: 'A' | 'B'): Promise<void> {
        // First, get available research groups
        const availableGroups = await this.getAvailableGroups();
        
        // Find a group with the matching condition
        const targetGroup = availableGroups.find(group => group.condition === condition);
        
        if (!targetGroup) {
            // If no group exists with this condition, try to create one
            console.log(`No research group found with condition ${condition}, attempting to create one...`);
            try {
                const newGroup = await this.createResearchGroup(condition);
                await this.post('assignResearchGroup', { research_group_id: newGroup.id });
            } catch (createError) {
                console.error('Failed to create research group:', createError);
                throw new Error(`No research group available for condition ${condition} and could not create one`);
            }
        } else {
            // Assign to existing group
            await this.post('assignResearchGroup', { research_group_id: targetGroup.id });
        }
    }

    // ===== Research Group Methods =====
    async getAvailableGroups(): Promise<ResearchGroup[]> {
        console.log('Fetching user\'s research group...');
        // Get the user's assigned research group (if any)
        const userGroups = await this.get<ResearchGroup[]>('availableResearchGroups');
        console.log('User\'s research groups received:', userGroups);
        return userGroups;
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

            const updatedProfile = await this.post<UserProfile>('completeOnboarding', {
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
    async createCharacter(characterData: CharacterCreateData): Promise<Character> {
        return this.post<Character>('characters', characterData);
    }

    async getMyCharacter(): Promise<Character> {
        return this.get<Character>('myCharacter');
    }

    async getCharacterHomeData(): Promise<any> {
        return this.get<any>('characterHomeData');
    }

    async updateCharacterCustomization(characterId: number, customizationData: CharacterCustomizationData): Promise<Character> {
        return this.patch<Character>('characterCustomization', customizationData, { urlSuffix: `${characterId}/update_customization/` });
    }

    async updateCharacterStats(characterId: number, statsData: any): Promise<Character> {
        return this.patch<Character>('characterStats', statsData, { urlSuffix: `${characterId}/update_stats/` });
    }

    async gainExperience(characterId: number, experience: number): Promise<any> {
        return this.post<any>('characterExperience', { experience }, { urlSuffix: `${characterId}/gain_experience/` });
    }

    async equipGear(characterId: number, gearData: any): Promise<any> {
        return this.post<any>('characterGear', gearData, { urlSuffix: `${characterId}/equip_gear/` });
    }

    async getCustomizationOptions(): Promise<any> {
        return this.get<any>('customizationOptions');
    }

    async uploadAppearanceAsset(assetType: string, assetId: number, imageFile: any): Promise<any> {
        const formData = new FormData();
        formData.append('asset_type', assetType);
        formData.append('asset_id', assetId.toString());
        formData.append('image', imageFile);
        
        return this.post('appearanceUpload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    async getMyAppearance(): Promise<any> {
        return this.get<any>('myAppearance');
    }

    async getAssetImages(): Promise<any> {
        return this.get<any>('assetImages');
    }

    // ===== Equipment Methods =====
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

    // ===== Game Data Methods =====
    async getGameData(): Promise<GameData> {
        return this.get<GameData>('gameData');
    }

    async createGameData(gameData: Partial<GameData>): Promise<GameData> {
        return this.post<GameData>('gameData', gameData);
    }

    async updateGameData(gameData: Partial<GameData>): Promise<GameData> {
        return this.patch<GameData>('gameData', gameData);
    }

    // ===== Journal Methods =====
    async getJournalPrompts(): Promise<Prompt[]> {
        return this.get<Prompt[]>('journalPrompts');
    }
}

// Export a singleton instance
export const apiService = new ApiService();