// Export all types from a single location for cleaner imports

// User and authentication types
export type {
    AuthContextType, Character,
    CharacterCreateData,
    CharacterCustomizationData,
    GameData, LoginResponse, ResearchGroup, UserProfile
} from './user';



// Equipment types
export type {
    CharacterGear, EquipmentItem, EquipmentSubtype, EquipmentType, EquippedItems
} from './equipment';

// Game types
export type {
    ExtendedGameData, GameAchievement, GameSession, MiniGameProgress, Skill
} from './game';

// Journal types
export type { CodexEntry, CodexModalProps, JournalEntry, JournalPrompt, WellnessStats } from './journal';

// Wellness system types -- might need to be standardized further
export type {
    GearItem,
    GearUnlockSystem,
    StatGains,
    StoryGains,
    StoryProgression
} from '../data/wellnessSystem';

// Story types
export type { ArchiveProgress, Chapter, ChapterPassage, ChapterSummary, Choice, LocalStoryProgress, MiniGameResult, NPC, Passage, SavedRewards, Story, StoryDetail, StoryProgress, StoryScreenProps } from './story';

// MiniGame types
export type { GameState, PowerUp, Projectile, Thought } from './thoughtGame';

