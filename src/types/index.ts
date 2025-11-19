// Export all types from a single location for cleaner imports

import { Character, PersonalityKey, UserProfile } from '../imports';

// User and authentication types
export type {
    AuthContextType, Character,
    CharacterCreateData,
    CharacterCustomizationData,
    GameData, LoginResponse, ResearchGroup, UserProfile
} from './user';

// Character Creator component types
export type {
    CategorySelectorProps,
    CharacterCreationSetters,
    CharacterCreationState,
    CharacterCreatorData,
    CharacterCreatorStylesType,
    CharacterFrameProps,
    CharacterNameInputProps,
    CharacterObject,
    CharacterPreviewProps,
    CharacterPreviewSectionProps,
    ColorOptionControlsProps,
    GlobalCharacterCreatorStyles,
    StyleControlsProps
} from './characterCreator';



// Equipment types
export type {
    CharacterGear, CopingTool, CopingToolsCollectionProps, EQUIPMENT_CATEGORIES, EquipmentItem, EquipmentSubtype, EquipmentType, EquippedItems, GearType, RARITY_COLORS
} from './equipment';

// Equipment utility functions
export {
    getRarityColors,
    mapBackendGearToSubtype,
    mapBackendSlotToFrontendType,
    mapBackendStatsToWellnessStats
} from './equipment';

// Game types
export type {
    ExtendedGameData, GameAchievement, GameSession, MiniGameProgress, PathCardProps, PathData, PathType, Skill
} from './game';

// Journal types
export type {
    CodexEntry,
    CodexEntryData,
    CodexModalProps,
    CodexStatistics,
    DailyPromptResponse,
    JournalApiError,
    JournalEntry,
    JournalPrompt,
    WellnessStats
} from './journal';

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


export type {
    DailyCuratorMessages,
    PersonalityHomeData,
    PersonalityKey,
    PersonalityQuests,
    PersonalityRewardConfig,
    PersonalityWellnessAttributes
} from './personality';

// Reward system types
export type {
    EquipmentUpgrade,
    GearCache,
    JournalReward,
    NotificationData,
    ProcessedRewards,
    QuestProgress,
    RewardResult,
    StoryReward,
    StoryRewardTracker, ThoughtDefenderResult, ThoughtDefenderReward, UpgradedEquipmentReward
} from './rewards';

// Unified HomeData type for consistent data structure
export type HomeData = {
  userProfile: UserProfile;
  character?: Character;         // present for character users
  primaryTrait?: PersonalityKey; // present for personality users
};

export type {
    WellnessAttributesDisplayProps
} from './wellness';


//floating elements for rewards 

export type {
    FloatingElementProps
} from './floatingElements';
