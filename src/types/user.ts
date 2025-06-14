export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        profile?: any;
    };
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
    } | null;
    personality_profile: any;
}

export interface ResearchGroup {
    id: number;
    name: string;
    condition: string;
    description: string;
    created_at: string;
}

export interface AuthContextType {
  authToken: string | null;
  characterId: string | null;
  isTestUser: boolean;
  user: { username: string } | null;
  login: (token: string, characterId: string) => Promise<void>;
  logout: () => Promise<void>;
}
