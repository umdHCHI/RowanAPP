import { apiService } from './apiService';
import { ResearchGroup } from '../types/user';

class ResearchGroupService {
    async getAvailableGroups(): Promise<ResearchGroup[]> {
        return apiService.getAvailableGroups();
    }

    async assignGroup(groupId: number): Promise<void> {
        return apiService.assignResearchGroup(groupId);
    }
}

export const researchGroupService = new ResearchGroupService();