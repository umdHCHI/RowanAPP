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

export interface AuthContextType {
  authToken: string | null;
  characterId: string | null;
  isTestUser: boolean;
  user: { username: string } | null;
  login: (token: string, characterId: string) => Promise<void>;
  logout: () => Promise<void>;
}
