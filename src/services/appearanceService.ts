import { apiService, CharacterConfig, WellnessCharacter } from './apiService';

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
  // ===== IMPROVED CHARACTER CREATION FLOW =====
  
  /**
   * Smart character creation: Check if user has character, create if needed, update if exists
   */
  async createOrUpdateCharacter(
    name: string, 
    customizationData: {
      selectedBaseModel: number;
      selectedHairStyle: number;
      selectedHairColor: number;
      selectedEyeType: number;
      selectedEyeColor: number;
      selectedEyebrowStyle: number;
      selectedEyebrowColor: number;
      selectedMouthType: number;
      selectedShirtType: number;
      selectedClothesColor: number;
      selectedBackgroundType: number;
      selectedBackgroundColor: number;
    }
  ): Promise<WellnessCharacter> {
    try {
      // First, check if user already has a character
      let existingCharacter: WellnessCharacter | null = null;
      try {
        existingCharacter = await apiService.getMyCharacter();
      } catch (error: any) {
        if (error.response?.status === 404) {
          existingCharacter = null;
        } else {
          throw error;
        }
      }
      
      if (existingCharacter) {
        // User has a character - update its customization
        return await this.updateCharacterCustomization(existingCharacter.id, customizationData);
      } else {
        // User doesn't have a character - create new one
        return await this.createCharacterWithCustomization(name, customizationData);
      }
      
    } catch (error: any) {
      throw error;
    }
  }
  
  /**
   * Complete character creation flow: create character + update customization
   */
  async createCharacterWithCustomization(
    name: string, 
    customizationData: {
      selectedBaseModel: number;
      selectedHairStyle: number;
      selectedHairColor: number;
      selectedEyeType: number;
      selectedEyeColor: number;
      selectedEyebrowStyle: number;
      selectedEyebrowColor: number;
      selectedMouthType: number;
      selectedShirtType: number;
      selectedClothesColor: number;
      selectedBackgroundType: number;
      selectedBackgroundColor: number;
    }
  ): Promise<any> {
    try {
      // First, try to get the current user's character
      let existingCharacter = null;
      
      try {
        existingCharacter = await apiService.getMyCharacter();
      } catch (error: any) {
        if (error.response?.status === 404) {
          existingCharacter = null;
        } else {
          existingCharacter = null;
        }
      }
      
      if (existingCharacter) {
        // User already has a character - update it with new customization
        const frontendData = {
          selectedBaseModel: customizationData.selectedBaseModel,
          selectedHairStyle: customizationData.selectedHairStyle,
          selectedHairColor: customizationData.selectedHairColor,
          selectedEyeType: customizationData.selectedEyeType,
          selectedEyeColor: customizationData.selectedEyeColor,
          selectedEyebrowStyle: customizationData.selectedEyebrowStyle,
          selectedEyebrowColor: customizationData.selectedEyebrowColor,
          selectedMouthType: customizationData.selectedMouthType,
          selectedShirtType: customizationData.selectedShirtType,
          selectedBackgroundType: customizationData.selectedBackgroundType,
        };
        
        const updatedCharacter = await this.updateCharacterCustomization(existingCharacter.id, frontendData);
        return updatedCharacter;
      } else {
        // User doesn't have a character - create new one
        const characterData = {
          name: name,
          selected_base_model: customizationData.selectedBaseModel,
          selected_skin_color: customizationData.selectedBaseModel,
          selected_hair_style: customizationData.selectedHairStyle,
          selected_hair_color: customizationData.selectedHairColor,
          selected_eye_type: customizationData.selectedEyeType,
          selected_eye_color: customizationData.selectedEyeColor,
          selected_eyebrow_style: customizationData.selectedEyebrowStyle,
          selected_eyebrow_color: customizationData.selectedEyebrowColor,
          selected_mouth_type: customizationData.selectedMouthType,
          selected_shirt_type: customizationData.selectedShirtType,
          selected_background_type: customizationData.selectedBackgroundType,
        };
        
        const character = await apiService.createCharacter(characterData);
        return character;
      }
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Update character customization (enhanced with better error handling)
   */
  async updateCharacterCustomization(
    characterId: number, 
    customizationData: {
      selectedBaseModel?: number;
      selectedHairStyle?: number;
      selectedHairColor?: number;
      selectedEyeType?: number;
      selectedEyeColor?: number;
      selectedEyebrowStyle?: number;
      selectedEyebrowColor?: number;
      selectedMouthType?: number;
      selectedShirtType?: number;
      selectedClothesColor?: number;
      selectedBackgroundType?: number;
      selectedBackgroundColor?: number;
    }
  ): Promise<WellnessCharacter> {
    try {
      // Map frontend field names to backend field names
      const backendData: Partial<CharacterConfig> = {};
      
      if (customizationData.selectedBaseModel !== undefined) {
        backendData.selected_base_model = customizationData.selectedBaseModel;
        backendData.selected_skin_color = customizationData.selectedBaseModel; // Skin maps to base model
      }
      if (customizationData.selectedHairStyle !== undefined) {
        backendData.selected_hair_style = customizationData.selectedHairStyle;
      }
      if (customizationData.selectedHairColor !== undefined) {
        backendData.selected_hair_color = customizationData.selectedHairColor;
      }
      if (customizationData.selectedEyeType !== undefined) {
        backendData.selected_eye_type = customizationData.selectedEyeType;
      }
      if (customizationData.selectedEyeColor !== undefined) {
        backendData.selected_eye_color = customizationData.selectedEyeColor;
      }
      if (customizationData.selectedEyebrowStyle !== undefined) {
        backendData.selected_eyebrow_style = customizationData.selectedEyebrowStyle;
      }
      if (customizationData.selectedEyebrowColor !== undefined) {
        backendData.selected_eyebrow_color = customizationData.selectedEyebrowColor;
      }
      if (customizationData.selectedMouthType !== undefined) {
        backendData.selected_mouth_type = customizationData.selectedMouthType;
      }
      if (customizationData.selectedShirtType !== undefined) {
        backendData.selected_shirt_type = customizationData.selectedShirtType;
      }
      if (customizationData.selectedBackgroundType !== undefined) {
        backendData.selected_background_type = customizationData.selectedBackgroundType;
      }
      
      const response = await apiService.updateCharacterCustomization(characterId, backendData);
      return response.character;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user has a character (NEW METHOD)
   */
  async checkUserHasCharacter(): Promise<{ hasCharacter: boolean; character?: WellnessCharacter }> {
    try {
      const character = await apiService.getMyCharacter();
      return { hasCharacter: true, character };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { hasCharacter: false };
      } else {
        throw error;
      }
    }
  }

  /**
   * Get current user's character
   */
  async getMyCharacter(): Promise<WellnessCharacter> {
    try {
      return await apiService.getMyCharacter();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get character customization options
   */
  async getCustomizationOptions(): Promise<CharacterConfig & { option_limits: Record<string, number> }> {
    try {
      return await apiService.getCustomizationOptions();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get home screen data including character and wellness info
   */
  async getHomeData(): Promise<any> {
    try {
      return await apiService.getCharacterHomeData();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get character stats with bonuses
   */
  async getCharacterStats(): Promise<{
    base_stats: Record<string, number>;
    total_stats: Record<string, number>;
    level: number;
    experience: number;
    experience_needed: number;
    experience_progress: number;
    wellness_average: number;
    equipped_tools_count: number;
    character_config: CharacterConfig;
  }> {
    try {
      return await apiService.getCharacterStats();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gain experience
   */
  async gainExperience(characterId: number, experience: number, source?: string): Promise<any> {
    try {
      return await apiService.gainExperience(characterId, experience, source);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gain wellness attributes
   */
  async gainWellness(characterId: number, wellnessGains: Partial<{
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
  }>): Promise<any> {
    try {
      return await apiService.gainWellness(characterId, wellnessGains);
    } catch (error) {
      throw error;
    }
  }

  // ===== WELLNESS TOOLS METHODS =====

  /**
   * Get available coping tools
   */
  async getAvailableCopingTools(): Promise<any[]> {
    try {
      return await apiService.getAvailableCopingTools();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get character's tools
   */
  async getMyTools(): Promise<any[]> {
    try {
      return await apiService.getMyTools();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Acquire a coping tool
   */
  async acquireCopingTool(toolId: number): Promise<any> {
    try {
      return await apiService.acquireCopingTool(toolId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Equip a tool
   */
  async equipTool(toolId: number): Promise<any> {
    try {
      return await apiService.equipTool(toolId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Use a tool
   */
  async useTool(toolId: number, effectivenessRating?: number, notes?: string): Promise<any> {
    try {
      return await apiService.useTool(toolId, effectivenessRating, notes);
    } catch (error) {
      throw error;
    }
  }

  // ===== REFLECTION METHODS =====

  /**
   * Create a reflection entry
   */
  async createReflection(reflectionData: {
    entry_type: 'memory' | 'insight' | 'skill' | 'challenge' | 'growth';
    title: string;
    content: string;
    prompt: string;
    skill_category?: string;
    map_area?: string;
    difficulty?: string;
    wellness_gains?: Record<string, number>;
    tools_unlocked_ids?: number[];
  }): Promise<any> {
    try {
      return await apiService.createReflection(reflectionData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get recent reflections
   */
  async getRecentReflections(): Promise<any[]> {
    try {
      return await apiService.getRecentReflections();
    } catch (error) {
      throw error;
    }
  }

  // ===== UPDATED LEGACY METHODS =====

  /**
   * Main character creation method (UPDATED for smart flow)
   */
  async createCharacter(
    name: string,
    customizationData?: {
      selectedBaseModel?: number;
      selectedHairStyle?: number;
      selectedHairColor?: number;
      selectedEyeType?: number;
      selectedEyeColor?: number;
      selectedEyebrowStyle?: number;
      selectedEyebrowColor?: number;
      selectedMouthType?: number;
      selectedShirtType?: number;
      selectedClothesColor?: number;
      selectedBackgroundType?: number;
      selectedBackgroundColor?: number;
    }
  ): Promise<WellnessCharacter> {
    // Use default customization if none provided
    const defaultCustomization = {
      selectedBaseModel: 0,
      selectedHairStyle: 0,
      selectedHairColor: 0,
      selectedEyeType: 0,
      selectedEyeColor: 0,
      selectedEyebrowStyle: 0,
      selectedEyebrowColor: 0,
      selectedMouthType: 0,
      selectedShirtType: 0,
      selectedClothesColor: 0,
      selectedBackgroundType: 0,
      selectedBackgroundColor: 0,
    };
    
    const finalCustomization = { ...defaultCustomization, ...customizationData };
    
    // Use smart creation that handles existing characters
    return await this.createOrUpdateCharacter(name, finalCustomization);
  }

  /**
   * Legacy method - now maps to getMyCharacter
   */
  async getCharacter(characterId?: number): Promise<WellnessCharacter> {
    return this.getMyCharacter();
  }

  // ===== UTILITY METHODS =====

  /**
   * Map backend character data to frontend format
   */
  mapBackendToFrontend(backendCharacter: WellnessCharacter): {
    selectedBaseModel: number;
    selectedHairStyle: number;
    selectedHairColor: number;
    selectedEyeType: number;
    selectedEyeColor: number;
    selectedEyebrowStyle: number;
    selectedEyebrowColor: number;
    selectedMouthType: number;
    selectedShirtType: number;
    selectedClothesColor: number;
    selectedBackgroundType: number;
    selectedBackgroundColor: number;
  } {
    return {
      selectedBaseModel: backendCharacter.selected_base_model,
      selectedHairStyle: backendCharacter.selected_hair_style,
      selectedHairColor: backendCharacter.selected_hair_color,
      selectedEyeType: backendCharacter.selected_eye_type,
      selectedEyeColor: backendCharacter.selected_eye_color,
      selectedEyebrowStyle: backendCharacter.selected_eyebrow_style,
      selectedEyebrowColor: backendCharacter.selected_eyebrow_color,
      selectedMouthType: backendCharacter.selected_mouth_type,
      selectedShirtType: backendCharacter.selected_shirt_type,
      selectedClothesColor: 0, // Default since backend doesn't have this
      selectedBackgroundType: backendCharacter.selected_background_type,
      selectedBackgroundColor: 0, // Default since backend doesn't have this
    };
  }

  /**
   * Delete character (for testing purposes)
   */
  async deleteCharacter(): Promise<void> {
    try {
      const character = await this.getMyCharacter();
      // Use the standard DELETE endpoint
      await apiService.delete('characters', { urlSuffix: `${character.id}/` });
    } catch (error) {
      throw error;
    }
  }
}

export const appearanceService = new AppearanceService();