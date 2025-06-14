import { apiService } from './apiService';
import { UserProfile, LoginResponse } from '../types/user';

class UserService {
    async login(username: string, password: string): Promise<LoginResponse> {
        return apiService.login(username, password);
    }

    async logout(): Promise<void> {
        return apiService.logout();
    }

    async updateProfile(profileData: any): Promise<UserProfile> {
        return apiService.updateProfile(profileData);
    }

    async getProfile(): Promise<UserProfile> {
        return apiService.getProfile();
    }

    async isAuthenticated(): Promise<boolean> {
        return apiService.validateToken();
    }
}

export const userService = new UserService();