import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

// Get the user's character if it exists
export async function getCharacter(token: string) {
  try {
    const res = await axios.get(`${API_BASE_URL}characters/`, {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    // Return the first character if the response is an array
    return Array.isArray(res.data) ? res.data[0] : res.data;
  } catch (error) {
    console.error('Error getting character:', error);
    return null;
  }
}

// Create or update a character for the user
export async function createCharacter(token: string, appearanceData: any) {
  try {
    console.log('Creating/updating character with token:', token);
    console.log('Appearance data:', appearanceData);
    
    // First check if user already has a character
    const existingCharacter = await getCharacter(token);
    console.log('Existing character:', existingCharacter);
    
    const characterData = {
      name: 'My Character', // Default name, can be updated later
      level: 1,
      experience: 0,
      health_current: 100,
      health_max: 100,
      mana_current: 50,
      mana_max: 50,
      coins: 1000,
      potions: 10,
      crystals: 5
    };

    let character;
    if (existingCharacter && existingCharacter.id) {
      // Update existing character
      console.log('Updating existing character:', existingCharacter);
      const res = await axios.patch(`${API_BASE_URL}characters/${existingCharacter.id}/`, characterData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      character = res.data;
      
      // Update appearance
      if (existingCharacter.appearance && existingCharacter.appearance.id) {
        console.log('Updating existing appearance:', existingCharacter.appearance.id);
        await updateAppearance(token, existingCharacter.appearance.id, appearanceData);
      } else {
        console.log('Creating new appearance for existing character');
        await createAppearance(token, existingCharacter.id, appearanceData);
      }
    } else {
      // Create new character
      console.log('Creating new character');
      const res = await axios.post(`${API_BASE_URL}characters/`, characterData, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      character = res.data;
      
      // Create appearance for new character
      console.log('Creating appearance for new character');
      await createAppearance(token, character.id, appearanceData);
    }
    
    // Fetch the updated character with appearance
    const updatedCharacter = await getCharacter(token);
    console.log('Updated character with appearance:', updatedCharacter);
    return updatedCharacter;
  } catch (error: any) {
    console.error('Error creating/updating character:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    throw error;
  }
}

// Get the appearance for a character
export async function getAppearance(token: string, characterId: number) {
  try {
    console.log('Fetching full profile data');
    const res = await axios.get(`${API_BASE_URL}users/full_profile/`, {
      headers: { 
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // If we have appearance data in the profile, return it
    if (res.data.appearance) {
      console.log('Appearance data received:', res.data.appearance);
      return res.data.appearance;
    }

    // If no appearance data but we have a character, try to get appearance directly
    if (res.data.character) {
      const appearanceRes = await axios.get(`${API_BASE_URL}appearances/${res.data.character.appearance}/`, {
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Appearance data received from direct endpoint:', appearanceRes.data);
      return appearanceRes.data;
    }

    // If we get here, the user hasn't completed onboarding yet
    console.log('No appearance data found in profile - user may not have completed onboarding');
    return null;
  } catch (error: any) {
    console.error('Error fetching appearance:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    // Return null instead of throwing to allow fallback to onboarding state
    return null;
  }
}

// Create a new appearance for a character
export async function createAppearance(token: string, characterId: number, appearanceData: any) {
  console.log('Creating appearance with token:', token);
  console.log('Character ID:', characterId);
  console.log('Appearance data:', appearanceData);
  
  const headers = {
    'Authorization': `Token ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const res = await axios.post(`${API_BASE_URL}appearances/`, {
      ...appearanceData,
      character: characterId
    }, { headers });
    console.log('Appearance created:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Error creating appearance:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
}

// Update the appearance for a character (PATCH)
export async function updateAppearance(token: string, appearanceId: number, appearanceData: {
  gender: 'masculine' | 'feminine' | 'nonbinary';
  skin: string;
  hair: string;
  clothes: string;
  glasses: string;
  eyes: string;
  mouth: string;
}) {
  try {
    console.log('Updating appearance with ID:', appearanceId);
    console.log('Appearance data:', appearanceData);
    
    const res = await axios.patch(
      `${API_BASE_URL}appearances/${appearanceId}/`,
      appearanceData,
      {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Appearance update response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error updating appearance:', error);
    throw error;
  }
}