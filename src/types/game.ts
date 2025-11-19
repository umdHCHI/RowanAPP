import { GameData as BaseGameData } from './user';

// Extended game data with additional game-specific fields
export interface ExtendedGameData extends BaseGameData {
  // Additional game-specific fields can be added here
  current_quest?: string;
  achievements?: string[];
  game_settings?: {
    sound_enabled: boolean;
    notifications_enabled: boolean;
    difficulty_level: 'easy' | 'medium' | 'hard';
  };
}

// Game session data
export interface GameSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  total_play_time: number;
  activities_completed: string[];
  wellness_gains: Record<string, number>;
}

// Game achievement types
export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at?: string;
  progress?: number;
  max_progress: number;
  category: 'wellness' | 'exploration' | 'social' | 'creative';
}

// Skill types
export interface Skill {
    id: number;
    title: string;
    description: string;
}

// Minigame types 
export interface MiniGameProgress {
  thoughtDefenderLevel: number;
  thoughtDefenderScore: number;
  thoughtDefenderWins: number;
  drawingEntries: number;
  totalGameTime: number;
}


//chosing a path
export interface PathData {
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  curatorNote: string;
  benefits: string[];
  atmosphere: string;
  color: string;
  secondaryColor: string;
  gradientColors: string[];
  buttonText: string;
  journey: string;
}

export type PathType = 'character' | 'personality';

export interface PathCardProps {
  
  pathKey: PathType;
  pathData: PathData;
  isSelected: boolean;
  onSelect: (pathKey: PathType) => void;
  onChoose: (pathType: PathType) => Promise<void>;
  isLoading: boolean;
  onboardingStyles: any;
}