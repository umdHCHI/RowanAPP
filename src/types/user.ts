import { PersonalityTrait } from '../imports';
import { GearType } from './equipment';
import { StoryProgress } from './story';
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
    login: (token: string, characterId: string, userData?: any) => Promise<void>;
    logout: () => Promise<void>;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    completion_type?: string | null;
    // Character data is now directly on UserProfile (not nested under profile.character)
    // This includes level, experience, wellness_stats, equipped_gear, etc.
    
    // Backend structure includes nested user, profile, character objects
    user?: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        profile?: {//this is a dupe 
            research_group?: {                
                id: number,
                name: string | null,
                condition: string,
                description: string,
                created_at: string
            }
            has_completed_onboarding?: boolean;
            completion_type?: string | null;
            completion_data_id?: number | null;
            created_at?: string;
            updated_at?: string;
        }
        
        character?: any;
        survey?: any;
    };
    
    // Top-level character object from backend
    character?: {
        id: number;
        user: string | number;
        name: string;
        level: number;
        experience: number;
        experience_needed: number;
        awareness: number;
        resilience: number;
        connection: number;
        balance: number;
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
        selected_shirt_color: number;
        selected_background_type: number;
        selected_background_color: number;
        personality_traits: any[];
        coping_tools: any[];
        equipped_gear: EquippedGear[];
        wellness_stats: Array<{
            icon: string;
            label: string;
            value: number;
            color: string;
        }>;
        experience_needed_for_next_level: number;
        experience_progress_percentage: number;
        wellness_average: number;
        memory_progress: string;
        character_config: {
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
            selected_shirt_color: number;
            selected_background_type: number;
            selected_background_color: number;
        };
        created_at: string;
        updated_at: string;
    };
    
    // Legacy character-related fields (for backward compatibility)
    experience_needed_for_next_level?: number;
    experience_progress_percentage?: number;
    wellness_average?: number;
    memory_progress?: string;
    character_config?: {
        selectedName?: string;
        selected_base_model: number;
        selected_base_color?: number;
        selected_skin_color: number;
        selected_hair_style: number;
        selected_hair_color: number;
        selected_eye_type: number;
        selected_eye_color: number;
        selected_eyebrow_style: number;
        selected_eyebrow_color: number;
        selected_mouth_type: number;
        selected_shirt_type: number;
        selected_shirt_color: number;
        selected_background_type: number;
        selected_background_color: number;
    };
    
    equipped_gear?: EquippedGear[];
    recent_reflections?: RecentReflection[];
    archive_metrics?: Array<{
        icon: string;
        label: string;
        value: string;
        progress: number;
    }>;
    quest_progress?: QuestProgress[];

    profile: {
        research_group?: {
            id: number;
            name: string | null;
            condition: string;
            description: string;
            created_at: string;
        };
        has_completed_onboarding?: boolean;
        completion_type?: string | null;
        completion_data_id?: number | null;
        character?: Character; // Keep this for backward compatibility
        personality_scores?: {
            openness: number;
            conscientiousness: number;
            extraversion: number;
            agreeableness: number;
            neuroticism: number;
        };
        primary_trait?: string;
        created_at?: string;
        updated_at?: string;
    } | null;
    
    personality_profile?: {
        id: number;
        user: number;
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
        profile_summary?: {
            dominant_trait: string;
            scores: {
                openness: number;
                conscientiousness: number;
                extraversion: number;
                agreeableness: number;
                neuroticism: number;
            };
            last_updated: string;
        };
        last_updated: string;
    } | null;
    
    survey?: {
        id: number;
        user: number;
        answers: Record<string, number>;
        big_five_scores: {
            openness: number;
            conscientiousness: number;
            extraversion: number;
            agreeableness: number;
            neuroticism: number;
        };
        completed: boolean;
        created_at: string;
        updated_at: string;
    } | null;
    
    is_test_user?: boolean;
    story_progress?: StoryProgress[];
}

export interface EquippedGear {
    id: number;
    character: number;
    gear_type: GearType;
    is_equipped: boolean;
    acquired_at: string;
}

export interface RecentReflection {
    id: number;
    character: string;
    entry_type: string;
    title: string;
    content: string;
    prompt: string;
    skill_category: string;
    map_area: string;
    difficulty: string;
    wellness_gains: Record<string, any>;
    tools_unlocked: any[];
    created_at: string;
}

export interface QuestProgress {
    id: number;
    quest: {
        quest_id: string;
        title: string;
        description: string;
        total_steps: number;
        personality_focus: string;
    };
    progress: number;
    is_completed: boolean;
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
    user: {
        id: number;
        username: string;
        email: string;
        date_joined: string;
        research_group: {
            id: number;
            condition: string;
            name: string;
        } | null;
    };
    research_group: {
        condition: string;
        name: string;
    } | null;
    player_name: string;
    score: number;
    level: number;
    last_played: string;
    current_story_id: string | null;
    current_passage_id: string | null;
    completed_prompts: string[];
    total_entries: number;
    difficulty_levels: string[];
    unlocked_areas: string[];
    character_data: any | null;
    personality_data: {
        openness: number;
        conscientiousness: number;
        extraversion: number;
        agreeableness: number;
        neuroticism: number;
    };
    journal_data: {
        total_entries: number;
        recent_entries: Array<{
            id: number;
            entry_type: string;
            skill_category: string;
            created_at: string;
        }>;
        entries_by_type: Array<{
            entry_type: string;
            count: number;
        }>;
    };
    story_data: {
        stories_started: number;
        stories_completed: number;
        current_stories: Array<{
            story_id: number;
            story_title: string;
            current_passage: string;
            is_completed: boolean;
            last_played: string;
        }>;
        completed_stories: Array<{
            story_id: number;
            story_title: string;
            completed_at: string;
            completion_type: string;
        }>;
    };
    progress_summary: any;
    wellness_stats: Record<string, any>;
    acquired_gear: any[];
    coping_tools: any[];
    thought_defender_stats?: {
        total_games: number;
        total_wins: number;
        total_losses: number;
        highest_score: number;
        highest_level: number;
        total_waves_cleared: number;
        average_accuracy: number;
        total_shots_fired: number;
        total_hits: number;
        total_survival_time_ms: number;
        difficulties_played: string[];
        last_played?: string;
    };
}




export interface Character {
    id: number;
    user: string | number; // Can be username or user ID
    name: string;
    level: number;
    experience: number;
    experience_needed: number; // Added from API response
    experience_needed_for_next_level?: number; // Computed field from API
    experience_progress_percentage?: number; // Computed field from API
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
    coins?: number; // Made optional as not always in API response
    crystals?: number; // Made optional as not always in API response
    memories_explored: number; // This should align with stories explored
    coping_skills_learned: number; // This should align with rewards from stories
    insights_discovered: number; // This should align with insights from stories
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
    selected_shirt_color?: number; // color index for shirt
    selected_background_type: number;
    selected_background_color?: number; // color index for background
    personality_traits?: any[]; // Array from API response
    coping_tools?: any[]; // Array from API response
    equipped_gear?: EquippedGear[]; // Array from API response
    wellness_average?: number; // Computed field from API
    memory_progress?: string; // String format like "0/5" from API
    wellness_stats?: Array<{
        icon: string;
        label: string;
        value: number;
        color: string;
    }>;
    character_config?: {
        selectedName?: string;
        selected_base_model: number;
        selected_base_color?: number;
        selected_skin_color: number;
        selected_hair_style: number;
        selected_hair_color: number;
        selected_eye_type: number;
        selected_eye_color: number;
        selected_eyebrow_style: number;
        selected_eyebrow_color: number;
        selected_mouth_type: number;
        selected_shirt_type: number;
        selected_shirt_color: number;
        selected_background_type: number;
        selected_background_color: number;
    };
    created_at: string;
    updated_at: string;
    personality_profile?: PersonalityTrait[]; // might be able to handle this not sure
}


// ===== CENTRALIZED CHARACTER CREATOR CATEGORIES =====

export interface CategoryConfig {
  label: string;
  options: number;
  current: number;
  setter: (value: number) => void;
}
export interface CharacterCustomizationData {
    selectedName: string;
    selected_base_model: number;
    selected_base_color?: number; // color index for base model
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

// Add the missing CharacterCreateData type
export type CharacterCreateData = 
  | { name: string } // Simple name-only request
  | Partial<Character>; // Complete character data for creation

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
    selectedBaseColor: number;
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
    setSelectedBaseColor: (value: number) => void; // color index for base model
    setSelectedHairColor: (value: number) => void;
    setSelectedEyeColor: (value: number) => void;
    setSelectedEyebrowColor: (value: number) => void;
    setSelectedClothesColor: (value: number) => void;
    setSelectedBackgroundColor: (value: number) => void;
  }
): CharacterCreatorCategories => {
  const styleCategories: CategoryConfig[] = [
    { label: 'Base Model', options: 1, current: character.selectedBaseModel, setter: setters.setSelectedBaseModel },
    { label: 'Hair Style', options: 32, current: character.selectedHairStyle, setter: setters.setSelectedHairStyle },
    { label: 'Eyes', options: 12, current: character.selectedEyeType, setter: setters.setSelectedEyeType },
    { label: 'Eyebrow', options: 12, current: character.selectedEyebrowStyle, setter: setters.setSelectedEyebrowStyle },
    { label: 'Mouth', options: 12, current: character.selectedMouthType, setter: setters.setSelectedMouthType },
    { label: 'Clothes', options: 12, current: character.selectedShirtType, setter: setters.setSelectedShirtType },
    { label: 'Background', options: 12, current: character.selectedBackgroundType, setter: setters.setSelectedBackgroundType },
  ];

  const colorCategories: CategoryConfig[] = [
    { label: 'Skin Color', options: 12, current: character.selectedBaseColor, setter: setters.setSelectedBaseColor },
    { label: 'Hair Color', options: 16, current: character.selectedHairColor, setter: setters.setSelectedHairColor },
    { label: 'Eye Color', options: 16, current: character.selectedEyeColor, setter: setters.setSelectedEyeColor },
    { label: 'Eyebrow Color', options: 16, current: character.selectedEyebrowColor, setter: setters.setSelectedEyebrowColor },
    { label: 'Clothes Color', options: 16, current: character.selectedClothesColor || 0, setter: setters.setSelectedClothesColor },
    { label: 'Background Color', options: 16, current: character.selectedBackgroundColor || 0, setter: setters.setSelectedBackgroundColor },
  ];

  return { styleCategories, colorCategories };
};