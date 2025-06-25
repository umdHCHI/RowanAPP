import { apiService } from './apiService';
import { appearanceService } from './appearanceService';

/**
 * Example usage of the updated character customization and appearance upload services
 */

// Example 1: Create a character (Group A users only)
export async function createCharacterExample() {
  try {
    const characterData = {
      name: "Hero"
    };

    const result = await apiService.createCharacter(characterData);
    console.log('Character created:', result);
    return result;
  } catch (error) {
    console.error('Failed to create character:', error);
    throw error;
  }
}

// Example 2: Update character customization with all required fields
export async function updateCharacterExample(characterId: number) {
  try {
    const customizationData = {
      selected_base_model: 1,
      selected_skin_color: 2,
      selected_hair_style: 3,
      selected_hair_color: 4,
      selected_eye_type: 1,
      selected_eye_color: 2,
      selected_eyebrow_style: 1,
      selected_eyebrow_color: 3,
      selected_mouth_type: 2,
      selected_shirt_type: 1,
      selected_background_type: 1
    };

    const result = await appearanceService.updateCharacterCustomization(characterId, customizationData);
    console.log('Character customization updated:', result);
    return result;
  } catch (error) {
    console.error('Failed to update character customization:', error);
    throw error;
  }
}

// Example 3: Get character home data
export async function getCharacterHomeDataExample() {
  try {
    const homeData = await apiService.getCharacterHomeData();
    console.log('Character home data:', homeData);
    return homeData;
  } catch (error) {
    console.error('Failed to get character home data:', error);
    throw error;
  }
}

// Example 4: Gain experience
export async function gainExperienceExample(characterId: number, experience: number) {
  try {
    const result = await apiService.gainExperience(characterId, experience);
    console.log('Experience gained:', result);
    return result;
  } catch (error) {
    console.error('Failed to gain experience:', error);
    throw error;
  }
}

// Example 5: Update character stats
export async function updateCharacterStatsExample(characterId: number) {
  try {
    const statsData = {
      awareness: 15,
      resilience: 12,
      connection: 18,
      balance: 10
    };

    const result = await apiService.updateCharacterStats(characterId, statsData);
    console.log('Character stats updated:', result);
    return result;
  } catch (error) {
    console.error('Failed to update character stats:', error);
    throw error;
  }
}

// Example 6: Get customization options
export async function getCustomizationOptionsExample() {
  try {
    const options = await apiService.getCustomizationOptions();
    console.log('Customization options:', options);
    return options;
  } catch (error) {
    console.error('Failed to get customization options:', error);
    throw error;
  }
}

// Example 7: Upload appearance asset
export async function uploadAppearanceAssetExample(assetType: string, assetId: number, imageFile: any) {
  try {
    const result = await appearanceService.uploadAppearanceAsset(assetType, assetId, imageFile);
    console.log('Appearance asset uploaded:', result);
    return result;
  } catch (error) {
    console.error('Failed to upload appearance asset:', error);
    throw error;
  }
}

// Example 8: Get my appearance
export async function getMyAppearanceExample() {
  try {
    const appearance = await apiService.getMyAppearance();
    console.log('My appearance:', appearance);
    return appearance;
  } catch (error) {
    console.error('Failed to get my appearance:', error);
    throw error;
  }
}

// Example 9: Complete onboarding
export async function completeOnboardingExample(path: 'character' | 'survey') {
  try {
    const result = await apiService.completeOnboarding(path);
    console.log('Onboarding completed:', result);
    return result;
  } catch (error) {
    console.error('Failed to complete onboarding:', error);
    throw error;
  }
}

// Example 4: Upload specific asset types
export async function uploadSpecificAssetsExample() {
  try {
    // Example image file (you would get this from file picker or camera)
    const imageFile = {
      uri: 'file://path/to/image.jpg',
      type: 'image/jpeg',
      name: 'hair_style_3.jpg'
    };

    // Upload hair style asset
    await appearanceService.uploadHairStyleAsset(3, imageFile);
    
    // Upload eye style asset
    await appearanceService.uploadEyeStyleAsset(1, imageFile);
    
    // Upload mouth style asset
    await appearanceService.uploadMouthStyleAsset(2, imageFile);
    
    console.log('All assets uploaded successfully');
  } catch (error) {
    console.error('Failed to upload assets:', error);
    throw error;
  }
}

// Example 5: Get character assets for rendering
export async function getCharacterAssetsExample(characterId?: number) {
  try {
    const assets = await appearanceService.getCharacterAssets(characterId);
    console.log('Character assets retrieved:', assets);
    return assets;
  } catch (error) {
    console.error('Failed to get character assets:', error);
    throw error;
  }
}

// Example 6: Preview character during creation
export function previewCharacterExample() {
  const previewAssets = appearanceService.previewCharacter({
    baseModel: 1,
    skinColor: 2,
    hairStyle: 3,
    hairColor: 4,
    eyeType: 1,
    eyeColor: 2,
    eyebrowStyle: 1,
    eyebrowColor: 3,
    mouthType: 2,
    shirtType: 1,
    backgroundType: 1
  });
  
  console.log('Character preview assets:', previewAssets);
  return previewAssets;
} 