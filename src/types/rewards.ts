// ===== REWARD SYSTEM TYPE DEFINITIONS =====
// Centralized type definitions for the reward system
// Used across story rewards, journal rewards, mini-game rewards, and quest tracking

// ===== STORY REWARD TYPES =====

export interface StoryReward {
  type: 'passage' | 'choice';
  source: string; // passage_id or choice_id
  effects: Record<string, any>; // The actual effects from backend
  timestamp: number;
}

export interface StoryRewardTracker {
  storyId: string;
  rewards: StoryReward[];
  totalStatGains: Record<string, number>;
  finalRewards: string[];
  skillsLearned: string[];
  journalEntries: string[];
  questProgress: Record<string, number>; // e.g., {"neuroticism_1": 1, "openness_2": 2}
}

// ===== JOURNAL & ACTIVITY REWARD TYPES =====

export interface JournalReward {
  experience: number;
  wellnessStats: {
    awareness?: number;
    resilience?: number;
    connection?: number;
    balance?: number;
  };
  message: string;
}

export interface RewardResult {
  success: boolean;
  rewards: JournalReward;
  newLevel?: number;
  levelsGained?: number;
  error?: string;
}

// ===== MINI-GAME REWARD TYPES =====

export interface ThoughtDefenderReward {
  experience: number;
  wellnessStats: {
    exploration?: number;
    courage?: number;
    connection?: number;
    fear?: number;
  };
  foundationGains: {
    'Sight Beyond Sight'?: number;
    'Unbreakable Will'?: number;
    'Heart\'s Compass'?: number;
    'Elemental Harmony'?: number;
  };
  message: string;
  difficulty: string;
  performance: {
    score: number;
    level: number;
    thoughtsCleared: number;
    accuracy: number;
    survivalTime: number;
  };
}

export interface ThoughtDefenderResult {
  success: boolean;
  rewards: ThoughtDefenderReward;
  newLevel?: number;
  levelsGained?: number;
  error?: string;
}

// ===== EQUIPMENT UPGRADE TYPES =====

export interface EquipmentUpgrade {
  itemName: string;
  currentLevel: number;
  newLevel: number;
  statBonus: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  upgradeMessage: string;
}

export interface UpgradedEquipmentReward {
  originalItem: string;
  upgradedItem: string;
  upgrade: EquipmentUpgrade;
  isUpgrade: boolean;
}

// ===== QUEST PROGRESS TYPES =====

export interface QuestProgress {
  questId: string;
  currentProgress: number;
  totalRequired: number;
  isCompleted: boolean;
  questTitle: string;
  questDescription: string;
  questReward: string;
}

// ===== REWARD FILTERING & PROCESSING TYPES =====

// Used for filtering and processing rewards by personality before applying them
export interface ProcessedRewards {
  experienceGained?: number;
  totalStatGains?: Record<string, number>;
  skillsLearned?: Array<string | { name: string; personality?: string }>;
  questsUpdated?: Record<string, number>; // Legacy field name
  questProgress?: Record<string, number>; // Current field name
  items?: Array<{ id?: number; name: string; personality?: string }>;
  gear?: Array<{ id?: number; name: string; personality?: string }>;
}

// ===== STORY REWARD INTEGRATION TYPES =====

export interface GearCache {
  availableGearTypes?: any[];
  myGear?: any[];
  characterWithGear?: any;
  timestamp?: number;
}

export interface NotificationData {
  message: string;
  type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  icon?: string;
  iconImage?: any;
  statName?: string;
}
