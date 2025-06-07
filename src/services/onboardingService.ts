import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

export async function completeOnboarding(token: string, path: 'character' | 'survey') {
  try {
    // First, get available research groups
    const groupsRes = await axios.get(`${API_BASE_URL}research-groups/available/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Find the appropriate research group based on the path
    const researchGroup = groupsRes.data.find((group: any) => 
      (path === 'character' && group.condition === 'A') || 
      (path === 'survey' && group.condition === 'B')
    );

    if (!researchGroup) {
      throw new Error('No suitable research group found');
    }

    // Update the user's profile with research group and completion status
    const res = await axios.patch(`${API_BASE_URL}users/update_profile/`, {
      profile: {
        has_completed_onboarding: true,
        completion_type: path,
        research_group: researchGroup.id
      }
    }, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Onboarding completed:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    throw error;
  }
} 