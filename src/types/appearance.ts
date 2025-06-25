export interface Appearance {
    id: number;
    gender: 'masculine' | 'feminine' | 'nonbinary';
    skin: number;
    hair: number;
    clothes: number;
    glasses: number;
    background: number;
    eyes: number;
    mouth: number;
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

// Consolidated Appearance types - single source of truth
export interface Appearance {
  id: number;
  character: number;
  
  // Asset image mappings (JSON fields)
  base_model_images: Record<string, string>;
  skin_color_images: Record<string, string>;
  hair_style_images: Record<string, string>;
  hair_color_images: Record<string, string>;
  eye_images: Record<string, string>;
  eye_color_images: Record<string, string>;
  eyebrow_images: Record<string, string>;
  mouth_images: Record<string, string>;
  shirt_images: Record<string, string>;
  background_images: Record<string, string>;
  
  // Generated character image
  character_image?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Frontend character appearance for onboarding context
export interface CharacterAppearance {
  gender: 'masculine' | 'feminine' | 'nonbinary';
  skin: number;      // Frontend asset index
  hair: number;      // Frontend asset index
  clothes: number;   // Frontend asset index
  eyes: number;      // Frontend asset index
  mouth: number;     // Frontend asset index
  background: number; // Frontend asset index
  glasses: number;
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

// Import Character type from user.ts to avoid duplication
import { Character } from './user';

