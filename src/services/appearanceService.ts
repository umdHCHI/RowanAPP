import { apiService } from './apiService';
import { Appearance } from '../types/appearance';

class AppearanceService {
  async getAppearance(characterId: number): Promise<Appearance | null> {
    try {
      return await apiService.get<Appearance>('appearances', { params: { character: characterId } });
    } catch (error) {
      console.error('Error fetching appearance:', error);
      return null;
    }
  }

  async updateAppearance(appearanceId: number, appearanceData: Partial<Appearance>): Promise<Appearance> {
    try {
      return await apiService.patch<Appearance>('appearances', appearanceData, { urlSuffix: `${appearanceId}/` });
    } catch (error) {
      console.error('Error updating appearance:', error);
      throw error;
    }
  }

  async createAppearance(characterId: number, appearanceData: Omit<Appearance, 'id' | 'created_at' | 'updated_at'>): Promise<Appearance> {
    try {
      return await apiService.post<Appearance>('appearances', { ...appearanceData, character: characterId });
    } catch (error) {
      console.error('Error creating appearance:', error);
      throw error;
    }
  }
}

export const appearanceService = new AppearanceService();