import {
  baseOptions,
  bgOptions,
  clothesOptions,
  eyesOptions,
  hairOptions,
  mouthOptions,
} from '../assets/characterOptions';
import { Appearance } from '../types/appearance';
import { apiService } from './apiService';

// Types for asset mapping
export interface BackendCharacterData {
  selected_base_model: number;
  selected_skin_color: number;
  selected_hair_style: number;
  selected_hair_color: number;
  selected_eye_type: number;
  selected_eye_color: number;
  selected_eyebrow_style?: number;
  selected_eyebrow_color?: number;
  selected_mouth_type: number;
  selected_shirt_type: number;
  selected_background_type: number;
}

export interface FrontendCharacterData {
  baseIndex: number;
  skinIndex: number;
  hairIndex: number;
  eyesIndex: number;
  mouthIndex: number;
  clothesIndex: number;
  backgroundIndex: number;
}

class AppearanceService {
  // ===== API Methods (existing functionality) =====
  
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

  // ===== Asset Mapping Methods (new functionality) =====

  /**
   * Convert backend character data to frontend asset indices
   */
  backendToFrontend(backendData: BackendCharacterData): FrontendCharacterData {
    return {
      baseIndex: this.getBaseIndex(backendData.selected_base_model),
      skinIndex: backendData.selected_base_model, // Use base model for skin display
      hairIndex: this.getHairIndex(backendData.selected_hair_style, backendData.selected_hair_color),
      eyesIndex: this.getEyesIndex(backendData.selected_eye_type, backendData.selected_eye_color),
      mouthIndex: this.getMouthIndex(backendData.selected_mouth_type),
      clothesIndex: this.getClothesIndex(backendData.selected_shirt_type, backendData.selected_skin_color),
      backgroundIndex: this.getBackgroundIndex(backendData.selected_background_type),
    };
  }

  /**
   * Get base model index (clamp to available assets)
   */
  private getBaseIndex(baseModel: number): number {
    return Math.min(baseModel, baseOptions.length - 1);
  }

  /**
   * Calculate hair array index from style and color
   * Hair array structure: 32 styles × 16 colors = 512 total
   */
  private getHairIndex(style: number, color: number): number {
    const maxStyle = 31; // 0-31 styles per color
    const maxColor = 15; // 0-15 colors
    
    const clampedStyle = Math.min(style, maxStyle);
    const clampedColor = Math.min(color, maxColor);
    
    // Formula: style + (color * 32)
    const index = clampedStyle + (clampedColor * 32);
    return Math.min(index, hairOptions.length - 1);
  }

  /**
   * Calculate eyes array index from type and color
   * Eyes array structure: 12 types × 16 colors = 192 total
   */
  private getEyesIndex(type: number, color: number): number {
    const maxType = 11; // 0-11 types per color
    const maxColor = 15; // 0-15 colors
    
    const clampedType = Math.min(type, maxType);
    const clampedColor = Math.min(color, maxColor);
    
    // Formula: type + (color * 12)
    const index = clampedType + (clampedColor * 12);
    return Math.min(index, eyesOptions.length - 1);
  }

  /**
   * Get mouth index (clamp to available assets)
   */
  private getMouthIndex(mouthType: number): number {
    return Math.min(mouthType, mouthOptions.length - 1);
  }

  /**
   * Calculate clothes array index from shirt type and color
   * Clothes array structure: 12 types × 16 colors = 192 total
   */
  private getClothesIndex(shirtType: number, colorVariation: number): number {
    const maxType = 11; // 0-11 shirt types per color
    const maxColor = 15; // 0-15 color variations
    
    const clampedType = Math.min(shirtType, maxType);
    const clampedColor = Math.min(colorVariation, maxColor);
    
    // Formula: type + (color * 12)
    const index = clampedType + (clampedColor * 12);
    return Math.min(index, clothesOptions.length - 1);
  }

  /**
   * Get background index (clamp to available assets)
   */
  private getBackgroundIndex(backgroundType: number): number {
    return Math.min(backgroundType, bgOptions.length - 1);
  }

  /**
   * Get the actual asset require() objects for rendering
   */
  getAssets(frontendData: FrontendCharacterData) {
    return {
      base: baseOptions[frontendData.baseIndex] || baseOptions[0],
      skin: baseOptions[frontendData.skinIndex] || baseOptions[0],
      hair: hairOptions[frontendData.hairIndex] || hairOptions[0],
      eyes: eyesOptions[frontendData.eyesIndex] || eyesOptions[0],
      mouth: mouthOptions[frontendData.mouthIndex] || mouthOptions[0],
      clothes: clothesOptions[frontendData.clothesIndex] || clothesOptions[0],
      background: bgOptions[frontendData.backgroundIndex] || bgOptions[0],
    };
  }

  /**
   * Get asset limits for the character creator UI
   */
  getAssetLimits() {
    return {
      baseModels: Math.min(12, baseOptions.length), // Backend limit: 0-11
      skinColors: 16, // Backend limit: 0-15
      hairStyles: 32, // Backend limit: 0-31 (32 styles per color)
      hairColors: 16, // Backend limit: 0-15
      eyeTypes: 12, // Backend limit: 0-11
      eyeColors: 16, // Backend limit: 0-15
      mouthTypes: Math.min(12, mouthOptions.length), // Backend limit: 0-11
      shirtTypes: 12, // Backend limit: 0-11
      backgroundTypes: Math.min(12, bgOptions.length), // Backend limit: 0-11
    };
  }

  /**
   * Preview character during creation (before backend data exists)
   */
  previewCharacter(params: {
    baseModel: number;
    skinColor: number;
    hairStyle: number;
    hairColor: number;
    eyeType: number;
    eyeColor: number;
    mouthType: number;
    shirtType: number;
    backgroundType: number;
  }) {
    const frontendData = this.backendToFrontend({
      selected_base_model: params.baseModel,
      selected_skin_color: params.skinColor,
      selected_hair_style: params.hairStyle,
      selected_hair_color: params.hairColor,
      selected_eye_type: params.eyeType,
      selected_eye_color: params.eyeColor,
      selected_mouth_type: params.mouthType,
      selected_shirt_type: params.shirtType,
      selected_background_type: params.backgroundType,
    });

    return this.getAssets(frontendData);
  }

  /**
   * Convert character data from API response to renderable assets
   */
  async getCharacterAssets(characterId?: number) {
    try {
      // Get character data from the characters API
      let character: BackendCharacterData;
      
      if (characterId) {
        // Get specific character by ID
        character = await apiService.get<BackendCharacterData>('characters', { urlSuffix: `${characterId}/` });
      } else {
        // Get current user's character
        character = await apiService.get<BackendCharacterData>('myCharacter');
      }
      
      // Convert backend data to frontend format
      const frontendData = this.backendToFrontend({
        selected_base_model: character.selected_base_model,
        selected_skin_color: character.selected_skin_color,
        selected_hair_style: character.selected_hair_style,
        selected_hair_color: character.selected_hair_color,
        selected_eye_type: character.selected_eye_type,
        selected_eye_color: character.selected_eye_color,
        selected_mouth_type: character.selected_mouth_type,
        selected_shirt_type: character.selected_shirt_type,
        selected_background_type: character.selected_background_type,
      });

      // Return renderable assets
      return this.getAssets(frontendData);
    } catch (error) {
      console.error('Error getting character assets:', error);
      throw error;
    }
  }
}

export const appearanceService = new AppearanceService();