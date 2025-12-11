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
  createContext, useCallback, useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
export type { ReactNode } from 'react';

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

export { default as CharacterFrame } from './components/CharacterCreator/CharacterFrame';
export { default as CharacterPreview } from './components/CharacterCreator/CharacterPreview';

export { default as EquipmentModal } from './screens/characterStory/components/EquipmentModal';
export { default as PersonalizedArchiveHeader } from './screens/personality/PersonalizedArchiveHeader';
export { default as CodexModal } from './screens/shared/CodexModal';
export { default as DrawingCanvas } from './screens/shared/DrawingCanvas';
export { default as ThoughtDefenderModal } from './screens/shared/ThoughtDefenderModal';

// ===== Character Creator Components =====
export { CategorySelector } from './components/CharacterCreator/CategorySelector';
export { CharacterNameInput } from './components/CharacterCreator/CharacterNameInput';
export { CharacterPreviewSection } from './components/CharacterCreator/CharacterPreviewSection';
export { ColorOptionControls } from './components/CharacterCreator/ColorOptionControls';
export { StyleControls } from './components/CharacterCreator/StyleControls';

export { useCharacterCreation } from './hooks/useCharacterCreation';

// ===== Assets =====
export {
  // Equipment
  // Character options
  baseOptions,
  bgOptions,
  // Frame assets
  equipmentIcons,
  equipmentTypeLabels, getUIAsset, mouthOptions,
  rarityColors,
  uiAssetLabels,
  // UI assets and icons
  uiIcons
} from './assets';

// ===== Data =====
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

// ===== Equipment Utility Functions =====
export {
  getRarityColors,
  mapBackendGearToSubtype,
  mapBackendSlotToFrontendType,
  mapBackendStatsToWellnessStats
} from './types/equipment';

// ===== Context Types =====
export type { PersonalityTrait } from './context/PersonalityContext';

// ===== Personality Types =====
export type PersonalityKey = "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";

// ===== Personality Constants =====
export { PersonalityConfigs } from './constants/personality';

// ===== UI Assets for Personality Wellness Attributes =====
import { sectionIcons } from './assets/ui';

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
      { icon: sectionIcons.lantern, label: "Lantern of Focus", value: 5, color: "#9d4edd", description: "Turning wild ideas into a single beam that guides your steps", wellnessProperty: "awareness" },
      { icon: sectionIcons.tether, label: "Tether of Grounding", value: 5, color: "#06ffa5", description: "Keeping a steady line to the present while you roam the stacks", wellnessProperty: "resilience" },
      { icon: sectionIcons.knot, label: "Weaver's Knot", value: 5, color: "#4cc9f0", description: "Binding scattered notes into a page that holds together", wellnessProperty: "connection" },
      { icon: sectionIcons.glass, label: "Glass of Clarity", value: 5, color: "#f72585", description: "Polishing the lens so the simple shape beneath the swirl appears", wellnessProperty: "balance" }
    ]
  },

  Conscientiousness: {
    attributes: [
      { icon: "🌊", label: "Flexible Spine", value: 5, color: "#2a9d8f", description: "Letting the book bend without breaking its binding", wellnessProperty: "awareness" },
      { icon: "💝", label: "Kind Quill", value: 5, color: "#f4a261", description: "Writing a softer margin note when plans go astray", wellnessProperty: "resilience" },
      { icon: "⚖️", label: "Balanced Scales", value: 5, color: "#e76f51", description: "Setting work, rest, and need on the same shelf", wellnessProperty: "balance" },
      { icon: "🔥", label: "Steady Lamp", value: 5, color: "#264653", description: "Keeping a clean flame that lights the task without burning the page", wellnessProperty: "connection" }
    ]
  },

  Extraversion: {
    attributes: [
      { icon: "🛡️", label: "Ward of Boundaries", value: 5, color: "#f72585", description: "Marking the threshold so your light is shared, not spent", wellnessProperty: "awareness" },
      { icon: "🎭", label: "True Face", value: 5, color: "#ffd60a", description: "Letting the mask drop so your voice sounds like you", wellnessProperty: "resilience" },
      { icon: "🔋", label: "Reserve Cellar", value: 5, color: "#4cc9f0", description: "Storing brightness for quiet rooms and long halls", wellnessProperty: "balance" },
      { icon: "🌟", label: "Clear Signal", value: 5, color: "#f77f00", description: "Sending a call that finds the right listeners", wellnessProperty: "connection" }
    ]
  },

  Agreeableness: {
    attributes: [
      { icon: "🦁", label: "Lion’s Poise", value: 5, color: "#06ffa5", description: "Standing tall without raising the claws", wellnessProperty: "awareness" },
      { icon: "🚪", label: "Threshold Craft", value: 5, color: "#ffffb3", description: "Shaping doors that open kindly and close cleanly", wellnessProperty: "resilience" },
      { icon: "💪", label: "Advocate’s Voice", value: 5, color: "#4cc9f0", description: "Speaking needs in words that stay heard", wellnessProperty: "balance" },
      { icon: "🌸", label: "Peacebinding", value: 5, color: "#f72585", description: "Stitching conflict so the seam holds without hiding the truth", wellnessProperty: "connection" }
    ]
  },

  Neuroticism: {
    attributes: [
      { icon: "🧘", label: "Keeper’s Breath", value: 5, color: "#7209b7", description: "Slowing the aisles until the shelves stop shaking", wellnessProperty: "awareness" },
      { icon: "🌊", label: "Return to Shore", value: 5, color: "#a663cc", description: "Letting the wave pass and finding your footing again", wellnessProperty: "resilience" },
      { icon: "☮️", label: "Still Ink", value: 5, color: "#4cc9f0", description: "Letting thoughts settle so the words become legible", wellnessProperty: "balance" },
      { icon: "🔍", label: "Wider Margin", value: 5, color: "#06ffa5", description: "Giving the story more space so a kinder reading appears", wellnessProperty: "connection" }
    ]
  }
};
// ===== Context Exports =====
export { useAuth } from './components/auth/context/AuthContext';
export { useMasterState } from './context/MasterStateContext';
export { useTheme } from './context/ThemeContext';

// ===== Utility Functions =====
export { createCharacterCreatorCategories } from './types/user';



