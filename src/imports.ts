// ===== MASTER IMPORTS FILE =====

// ===== React & React Native Core =====
export {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, useColorScheme, View
} from 'react-native';

export {
  createContext, ReactNode, useCallback, useContext,
  useEffect,
  useState
} from 'react';

export { default as React } from 'react';

// ===== Expo & Navigation =====
export { FontAwesome } from '@expo/vector-icons';
export { BlurView } from 'expo-blur';
export { default as Constants } from 'expo-constants';
export { LinearGradient } from 'expo-linear-gradient';
export { router, Tabs, useRouter } from 'expo-router';

// ===== Third Party Libraries =====
export { default as AsyncStorage } from '@react-native-async-storage/async-storage';
export { default as axios } from 'axios';
export { default as Icon } from 'react-native-vector-icons/Feather';

// ===== API Configuration Only (NOT the full services) =====
export {
  API_ENDPOINTS,
  apiBaseUrl,
  getApiUrl
} from './services/apiConfig';


// ===== Components =====
export { default as AssetLabel } from './components/AssetLabel';
export { default as CharacterFrame } from './components/CharacterCreator/CharacterFrame';
export { default as CharacterPreview } from './components/CharacterCreator/CharacterPreview';
export { default as CodexModal } from './components/CodexModal';
export { default as DrawingCanvas } from './components/DrawingCanvas';
export { default as EquipmentModal } from './components/EquipmentModal';
export { default as FloatingIcon } from './components/FloatingIcon';
export { default as PersonalizedArchiveHeader } from './components/personality/PersonalizedArchiveHeader';
export { default as ThoughtDefenderModal } from './components/ThoughtDefenderModal';

// ===== Character Creator Components =====
export { CategorySelector } from './components/CharacterCreator/CategorySelector';
export { CharacterNameInput } from './components/CharacterCreator/CharacterNameInput';
export { CharacterPreviewSection } from './components/CharacterCreator/CharacterPreviewSection';
export { ColorOptionControls } from './components/CharacterCreator/ColorOptionControls';
export { StyleControls } from './components/CharacterCreator/StyleControls';
export { default as FloatingElement } from './components/FloatingElement';
export { useCharacterCreation } from './hooks/useCharacterCreation';

// ===== Assets =====
export {
  // Equipment
  // Character options
  baseOptions,
  bgOptions,
  // Frame assets
  characterCreatorAssets, equipmentIcons,
  equipmentTypeLabels, getUIAsset, mouthOptions,
  rarityColors,
  sampleHeadBar, uiAssetLabels,
  // UI assets and icons
  uiIcons
} from './assets';

// ===== Data =====
export { sampleInventory } from './data/sampleEquipment';
export { PersonalityQuests } from './types/personality';

// ===== Constants =====
export { CHARACTER_CREATOR_CONSTANTS } from './constants/characterCreator';

// ===== Styles =====
export { createGlobalStyles } from './styles/globalStyles';
export { darkTheme, lightTheme } from './styles/theme';
export type { ThemeColors } from './styles/theme';

// ===== Types =====
export type {
  ArchiveProgress, AuthContextType, Chapter, ChapterPassage, ChapterSummary,
  //UserCharacter System
  Character, CharacterCreateData, CharacterCustomizationData,
  // Equipment
  CharacterGear, Choice, CodexEntry,
  // Journal
  CodexModalProps, CopingTool, CopingToolsCollectionProps,
  //Personality Types
  DailyCuratorMessages, EquipmentItem,
  EquipmentSubtype,
  EquipmentType,
  EquippedItems,
  // Game
  ExtendedGameData,
  GameAchievement,
  //User Game Data - Persistent Game Data
  GameData, GameSession, GameState,
  // Wellness system
  GearItem, GearUnlockSystem, JournalEntry, JournalPrompt, LocalStoryProgress, // User and authentication
  LoginResponse,
  // MiniGame Types 
  MiniGameProgress, MiniGameResult, NPC, Passage, PowerUp, Projectile,
  //User Research Group
  ResearchGroup, SavedRewards, Skill, StatGains,
  //story imports 
  Story, StoryDetail, StoryGains, StoryProgress, StoryProgression, StoryScreenProps, Thought,
  // User Profile
  UserProfile, WellnessStats
} from './types';

// ===== Context Types =====
export type { PersonalityTrait } from './context/PersonalityContext';

// ===== Personality Types =====
export type PersonalityKey = "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";

// ===== Personality Constants =====
export { PersonalityConfigs } from './constants/personality';

export const PERSONALITY_TABS: Record<PersonalityKey, Array<{ key: string; label: string; icon: string }>> = {
  Openness: [
    { key: "entrance", label: "Dreamscape", icon: "🌌" },
    { key: "stories", label: "Chronicles", icon: "📖" },
    { key: "codex", label: "Wisdom", icon: "🔮" },
    { key: "defender", label: "Curiosity", icon: "🎭" },
    { key: "restoration", label: "Growth", icon: "🌱" },
  ],
  Conscientiousness: [
    { key: "entrance", label: "Sanctum", icon: "🏛️" },
    { key: "stories", label: "Archives", icon: "📚" },
    { key: "codex", label: "Order", icon: "⚖️" },
    { key: "defender", label: "Discipline", icon: "🛡️" },
    { key: "restoration", label: "Growth", icon: "📈" },
  ],
  Extraversion: [
    { key: "entrance", label: "Assembly", icon: "🎪" },
    { key: "stories", label: "Tales", icon: "📖" },
    { key: "codex", label: "Connection", icon: "🤝" },
    { key: "defender", label: "Empathy", icon: "💚" },
    { key: "restoration", label: "Growth", icon: "🌟" },
  ],
  Agreeableness: [
    { key: "entrance", label: "Gardens", icon: "🌸" },
    { key: "stories", label: "Harmony", icon: "🕊️" },
    { key: "codex", label: "Peace", icon: "☮️" },
    { key: "defender", label: "Empathy", icon: "💚" },
    { key: "restoration", label: "Growth", icon: "🌱" },
  ],
  Neuroticism: [
    { key: "entrance", label: "Chambers", icon: "🌙" },
    { key: "stories", label: "Depths", icon: "🔍" },
    { key: "codex", label: "Reflection", icon: "💎" },
    { key: "defender", label: "Awareness", icon: "🧘" },
    { key: "restoration", label: "Growth", icon: "🌊" },
  ],
};

export const PERSONALITY_BUILDS: Record<PersonalityKey, {
  title: string;
  class: string;
  description: string;
  baseStats: {
    awareness: number;
    resilience: number;
    connection: number;
    balance: number;
  };
  storyCategories: string[];
  storyThemes: string[];
}> = {
  Openness: {
    title: "The Sage Explorer",
    class: "Creative Pathfinder",
    description: "Masters the art of perspective and boundless curiosity",
    baseStats: { awareness: 8, resilience: 6, connection: 6, balance: 5 },
    storyCategories: ["Mystery", "Discovery", "Innovation", "Exploration"],
    storyThemes: ["curiosity", "imagination", "new experiences", "creative thinking"],
  },
  Conscientiousness: {
    title: "The Methodical Guardian",
    class: "Structured Keeper",
    description: "Builds strength through order and disciplined practice",
    baseStats: { awareness: 6, resilience: 8, connection: 5, balance: 7 },
    storyCategories: ["Challenge", "Growth", "Achievement", "Structure"],
    storyThemes: ["goal-setting", "organization", "perseverance", "self-discipline"],
  },
  Extraversion: {
    title: "The Social Catalyst",
    class: "Community Builder",
    description: "Draws power from connection and shared experiences",
    baseStats: { awareness: 6, resilience: 6, connection: 8, balance: 6 },
    storyCategories: ["Adventure", "Cooperation", "Leadership", "Social"],
    storyThemes: ["teamwork", "communication", "social connection", "collaboration"],
  },
  Agreeableness: {
    title: "The Harmonious Healer",
    class: "Empathic Guide",
    description: "Transforms conflict into understanding and growth",
    baseStats: { awareness: 7, resilience: 5, connection: 8, balance: 7 },
    storyCategories: ["Healing", "Relationships", "Harmony", "Empathy"],
    storyThemes: ["compassion", "understanding", "conflict resolution", "emotional intelligence"],
  },
  Neuroticism: {
    title: "The Depth Walker",
    class: "Emotional Alchemist",
    description: "Transforms sensitivity into profound wisdom",
    baseStats: { awareness: 8, resilience: 5, connection: 6, balance: 5 },
    storyCategories: ["Transformation", "Inner Journey", "Resilience", "Emotional Depth"],
    storyThemes: ["emotional awareness", "self-reflection", "coping strategies", "personal growth"],
  },
};

export const PersonalityWellnessAttributes = {
  Openness: {
    attributes: [
      { icon: "🎯", label: "Focus", value: 5, color: "#9d4edd", description: "Channeling creative energy into purposeful action", wellnessProperty: "awareness" },
      { icon: "🌱", label: "Grounding", value: 5, color: "#06ffa5", description: "Staying centered while exploring new possibilities", wellnessProperty: "resilience" },
      { icon: "🧩", label: "Integration", value: 5, color: "#4cc9f0", description: "Connecting diverse ideas into meaningful wholes", wellnessProperty: "connection" },
      { icon: "⚡", label: "Clarity", value: 5, color: "#f72585", description: "Seeing through complexity to find simple truths", wellnessProperty: "balance" }
    ]
  },
  Conscientiousness: {
    attributes: [
      { icon: "🌊", label: "Flexibility", value: 5, color: "#2a9d8f", description: "Adapting plans while maintaining core values", wellnessProperty: "awareness" },
      { icon: "💝", label: "Self-Compassion", value: 5, color: "#f4a261", description: "Being kind to yourself when standards aren't met", wellnessProperty: "resilience" },
      { icon: "⚖️", label: "Balance", value: 5, color: "#e76f51", description: "Harmonizing work, rest, and personal needs", wellnessProperty: "balance" },
      { icon: "🔥", label: "Sustainable Drive", value: 5, color: "#264653", description: "Maintaining motivation without burning out", wellnessProperty: "connection" }
    ]
  },
  Extraversion: {
    attributes: [
      { icon: "🛡️", label: "Boundaries", value: 5, color: "#f72585", description: "Protecting your energy while staying connected", wellnessProperty: "awareness" },
      { icon: "🎭", label: "Authenticity", value: 5, color: "#ffd60a", description: "Being true to yourself in social situations", wellnessProperty: "resilience" },
      { icon: "🔋", label: "Energy Management", value: 5, color: "#4cc9f0", description: "Balancing social engagement with personal recharge", wellnessProperty: "balance" },
      { icon: "🌟", label: "Confident Expression", value: 5, color: "#f77f00", description: "Sharing your thoughts and feelings with confidence", wellnessProperty: "connection" }
    ]
  },
  Agreeableness: {
    attributes: [
      { icon: "🦁", label: "Assertiveness", value: 5, color: "#06ffa5", description: "Standing up for yourself with kindness", wellnessProperty: "awareness" },
      { icon: "🚪", label: "Healthy Boundaries", value: 5, color: "#ffffb3", description: "Saying no while maintaining relationships", wellnessProperty: "resilience" },
      { icon: "💪", label: "Self-Advocacy", value: 5, color: "#4cc9f0", description: "Speaking up for your needs and values", wellnessProperty: "balance" },
      { icon: "🌸", label: "Conflict Resolution", value: 5, color: "#f72585", description: "Navigating disagreements with grace and wisdom", wellnessProperty: "connection" }
    ]
  },
  Neuroticism: {
    attributes: [
      { icon: "🧘", label: "Emotional Regulation", value: 5, color: "#7209b7", description: "Managing intense emotions with skillful awareness", wellnessProperty: "awareness" },
      { icon: "🌊", label: "Resilience", value: 5, color: "#a663cc", description: "Bouncing back from setbacks with renewed strength", wellnessProperty: "resilience" },
      { icon: "☮️", label: "Inner Calm", value: 5, color: "#4cc9f0", description: "Finding peace within the storm of thoughts", wellnessProperty: "balance" },
      { icon: "🔍", label: "Perspective", value: 5, color: "#06ffa5", description: "Seeing situations from multiple angles", wellnessProperty: "connection" }
    ]
  }
};

// ===== Context Exports =====
export { useAuth } from './context/AuthContext';
export { useMasterState } from './context/MasterStateContext';
export { useTheme } from './context/ThemeContext';

// ===== Utility Functions =====
export { createCharacterCreatorCategories } from './types/user';



