import { ImageSourcePropType } from 'react-native';
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        profile?: {
            research_group?: any;
            has_completed_onboarding?: boolean;
            completion_type?: string | null;
            completion_data_id?: number | null;
            character?: Character;
            created_at?: string;
            updated_at?: string;
        } | null;
        personality_profile?: any;
    };
    character_id?: number | null;
    research_group?: any;
    needs_onboarding?: boolean;
    onboarding_type?: string | null;
}
export interface AuthContextType {
    authToken: string | null;
    characterId: string | null;
    isTestUser: boolean;
    user: { username: string } | null;
    login: (token: string, characterId: string) => Promise<void>;
    logout: () => Promise<void>;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    profile: {
        research_group?: any;
        has_completed_onboarding?: boolean;
        completion_type?: string | null;
        completion_data_id?: number | null;
        character?: Character;
        created_at?: string;
        updated_at?: string;
    } | null;
    personality_profile: any;
}

export interface ResearchGroup {
    id: number;
    user?: number; // ForeignKey to User
    condition: string; // 'A' or 'B'
    description: string;
    created_at: string;
}


export interface GameData {
    id: number;
    user: number;
    player_name: string;
    score: number;
    level: number;
    last_played: string;
    current_story_id: string | null;
    current_passage_id: string | null;
    unlocked_areas: string[];
    completed_prompts: string[];
    total_entries: number;
}



// Character types matching backend Character model
export interface Character {
    id: number;
    user: number;
    name: string;
    level: number;
    experience: number;
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
    coins: number;
    crystals: number;
    memories_explored: number;
    coping_skills_learned: number;
    insights_discovered: number;
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
    created_at: string;
    updated_at: string;
}

export interface CharacterCreateData {
    name: string;
    // Include all customization fields for initial character creation
    selected_base_model?: number;
    selected_skin_color?: number;
    selected_hair_style?: number;
    selected_hair_color?: number;
    selected_eye_type?: number;
    selected_eye_color?: number;
    selected_eyebrow_style?: number;
    selected_eyebrow_color?: number;
    selected_mouth_type?: number;
    selected_shirt_type?: number;
    selected_background_type?: number;
}

export type CharacterFrameProps = {
  children: React.ReactNode;
  frame?: ImageSourcePropType;
  size?: number;
};

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


// ===== CENTRALIZED CHARACTER CREATOR CATEGORIES =====

export interface CategoryConfig {
  label: string;
  options: number;
  current: number;
  setter: (value: number) => void;
}
export interface CharacterCustomizationData {
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
    selected_background_color?: number;
    selected_clothes_color?: number;
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