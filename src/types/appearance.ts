import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { Character } from './user';

// Consolidated Appearance type that matches the backend character model structure
export interface Appearance {
  id: number;
  character: number;
  
  // Character customization fields (matching backend Character model)
  selected_base_model: number;
  selected_skin_color: number;
  selected_hair_style: number;
  selected_hair_color: number;
  selected_eye_type: number;
  selected_eye_color: number;
  selected_eyebrow_style: number;
  selected_eyebrow_color: number;
  selected_mouth_type: number;
  selected_shirt_type: number;
  selected_background_type: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface AppearanceData {
  gender: 'masculine' | 'feminine' | 'nonbinary';
  skin: string;
  hair: string;
  clothes: string;
  glasses: string;
  eyes: string;
  mouth: string;
}

export interface CharacterAppearance {
  gender: 'masculine' | 'feminine' | 'nonbinary';
  skin: number;
  hair: number;
  clothes: number;
  glasses: number;
  eyes: number;
  mouth: number;
  background: number;
  isComplete: boolean;
}

// Character creation request payload
export interface CharacterCreateRequest {
  name: string;
}

// Character customization update payload
export interface CharacterCustomizationRequest {
  selected_base_model: number;
  selected_skin_color: number;
  selected_hair_style: number;
  selected_hair_color: number;
  selected_eye_type: number;
  selected_eye_color: number;
  selected_mouth_type: number;
  selected_shirt_type: number;
  selected_background_type: number;
  selected_eyebrow_style?: number;
  selected_eyebrow_color?: number;
}

// Wellness stats for display
export interface WellnessStat {
  icon: string;
  label: string;
  value: number;
  color: string;
}

// Character home data response
export interface CharacterHomeData {
  character: Character;
  wellness_stats: WellnessStat[];
  experience_progress: number;
  level_progress: string;
  daily_quest?: any;
  equipped_gear?: any[];
}

// Experience gain response
export interface ExperienceGainResponse {
  levels_gained: number;
  new_level: number;
  new_experience: number;
  wellness_updates?: Record<string, number>;
}

export type CharacterPreviewProps = {
  baseAsset: ImageSourcePropType;
  background: ImageSourcePropType;
  hairSheet: ImageSourcePropType;
  clothesSheet: ImageSourcePropType;
  eyesSheet: ImageSourcePropType;
  eyebrowsSheet: ImageSourcePropType;
  mouthSheet: ImageSourcePropType;
  hairIndex: number;
  clothesIndex: number;
  eyesIndex: number;
  eyebrowsIndex: number;
  mouthIndex: number;
};

export type CharacterFrameProps = {
  children: React.ReactNode;
  frame?: ImageSourcePropType;
  size?: number;
};

// ===== CENTRALIZED CHARACTER CREATOR CATEGORIES =====

export interface CategoryConfig {
  label: string;
  options: number;
  current: number;
  setter: (value: number) => void;
}

export interface CharacterCreatorCategories {
  styleCategories: CategoryConfig[];
  colorCategories: CategoryConfig[];
}

// Utility function to create category configurations
export const createCharacterCreatorCategories = (
  character: {
    selectedHairStyle: number;
    selectedEyeType: number;
    selectedEyebrowStyle: number;
    selectedMouthType: number;
    selectedShirtType: number;
    selectedBackgroundType: number;
    selectedBaseModel: number;
    selectedHairColor: number;
    selectedEyeColor: number;
    selectedEyebrowColor: number;
    selectedClothesColor: number;
    selectedBackgroundColor: number;
  },
  setters: {
    setSelectedHairStyle: (value: number) => void;
    setSelectedEyeType: (value: number) => void;
    setSelectedEyebrowStyle: (value: number) => void;
    setSelectedMouthType: (value: number) => void;
    setSelectedShirtType: (value: number) => void;
    setSelectedBackgroundType: (value: number) => void;
    setSelectedBaseModel: (value: number) => void;
    setSelectedHairColor: (value: number) => void;
    setSelectedEyeColor: (value: number) => void;
    setSelectedEyebrowColor: (value: number) => void;
    setSelectedClothesColor: (value: number) => void;
    setSelectedBackgroundColor: (value: number) => void;
  }
): CharacterCreatorCategories => {
  const styleCategories: CategoryConfig[] = [
    { label: 'Hair Style', options: 12, current: character.selectedHairStyle, setter: setters.setSelectedHairStyle },
    { label: 'Eyes', options: 12, current: character.selectedEyeType, setter: setters.setSelectedEyeType },
    { label: 'Eyebrow Style', options: 12, current: character.selectedEyebrowStyle, setter: setters.setSelectedEyebrowStyle },
    { label: 'Mouth', options: 12, current: character.selectedMouthType, setter: setters.setSelectedMouthType },
    { label: 'Clothes', options: 12, current: character.selectedShirtType, setter: setters.setSelectedShirtType },
    { label: 'Background', options: 11, current: character.selectedBackgroundType, setter: setters.setSelectedBackgroundType },
  ];

  const colorCategories: CategoryConfig[] = [
    { label: 'Skin Color', options: 16, current: character.selectedBaseModel, setter: setters.setSelectedBaseModel },
    { label: 'Hair Color', options: 16, current: character.selectedHairColor, setter: setters.setSelectedHairColor },
    { label: 'Eye Color', options: 16, current: character.selectedEyeColor, setter: setters.setSelectedEyeColor },
    { label: 'Eyebrow Color', options: 16, current: character.selectedEyebrowColor, setter: setters.setSelectedEyebrowColor },
    { label: 'Clothes Color', options: 16, current: character.selectedClothesColor || 0, setter: setters.setSelectedClothesColor },
    { label: 'Background Color', options: 16, current: character.selectedBackgroundColor || 0, setter: setters.setSelectedBackgroundColor },
  ];

  return { styleCategories, colorCategories };
}; 