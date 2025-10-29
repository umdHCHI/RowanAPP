// ===== STORY REWARD INTEGRATION TEST UTILITIES =====
// Test functions for verifying gear acquisition and reward system functionality

import { apiService } from '../../services/apiService';

describe('apiService Integration: Personality Quest Logic', () => {


    test('should fetch user profile and match personality quests', async () => {
        const userProfile = await apiService.getProfile();
        expect(userProfile).toBeDefined();
        expect(userProfile).toHaveProperty('personality_profile');
        expect(userProfile.personality_profile).toBeDefined();
        expect(userProfile.personality_profile).toHaveProperty('primary_trait');

        const primaryTrait = userProfile.personality_profile.primary_trait;
        expect(primaryTrait).toBeDefined();
        expect(typeof primaryTrait).toBe('string');
        console.log('Primary Personality Trait:', primaryTrait);
    });
    test('should match user primary trait with story personality', async () => {

    //check the primary_trait and make sure that it aligns 
   

    test('should fetch all stories and filter by user personality', async () => {
        const userProfile = await apiService.getProfile();
        expect(userProfile).toBeDefined();
        expect(userProfile).toHaveProperty('personality_profile');
    });

});

});
