// Export all types from a single location for cleaner imports

// User and authentication types
export type {
    AuthContextType, Character,
    CharacterCreateData,
    CharacterCustomizationData,
    GameData, LoginResponse, ResearchGroup, UserProfile
} from './user';

// Appearance and character customization types
export type {
    Appearance,
    CharacterAppearance,
    CharacterCreateRequest,
    CharacterCustomizationRequest, CharacterHomeData,
    ExperienceGainResponse, WellnessStat
} from './appearance';

// Equipment types
export type {
    EquipmentItem, EquipmentSubtype, EquipmentType, EquippedItems
} from './equipment';

// Game types
export type {
    ExtendedGameData, GameAchievement, GameSession
} from './game';

// Journal types
export type {
    CodexModalProps, JournalEntry, Prompt
} from './journal';

// Wellness system types
export type {
    GearItem,
    GearUnlockSystem,
    ReflectionAnalysis, ReflectionPattern,
    ReflectionPatterns, StatGains,
    StoryGains,
    StoryProgression, WellnessStats
} from '../data/wellnessSystem';

