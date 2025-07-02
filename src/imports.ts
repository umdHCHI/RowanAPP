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

// ===== Services =====
export {
    API_ENDPOINTS,
    apiBaseUrl,
    apiService,
    appearanceService,
    archiveService,
    completeOnboarding,
    createProfile,
    getApiUrl,
    getProfile,
    researchGroupService,
    updateProfile
} from './services';

// ===== Components =====

export { default as CharacterFrame } from './components/CharacterFrame';
export { default as CharacterPreview } from './components/CharacterPreview';
export { default as CodexModal } from './components/CodexModal';
export { default as DrawingCanvas } from './components/DrawingCanvas';
export { default as EquipmentModal } from './components/EquipmentModal';
export { HauntedLibraryBG } from './components/HauntedLibrary';
export { default as PixelButton } from './components/PixelButton';
export { default as ThoughtDefenderModal } from './components/ThoughtDefenderModal';

// ===== Character Creator Components =====
export { CategorySelector } from './components/CharacterCreator/CategorySelector';
export { CharacterNameInput } from './components/CharacterCreator/CharacterNameInput';
export { CharacterPreviewSection } from './components/CharacterCreator/CharacterPreviewSection';
export { ColorOptionControls } from './components/CharacterCreator/ColorOptionControls';
export { StyleControls } from './components/CharacterCreator/StyleControls';

// ===== Assets =====
export {
    // Character options
    baseOptions,
    bgOptions,
    // Frame assets
    characterCreatorAssets,
    // Equipment
    ComfortType, equipmentIcons,
    equipmentTypeLabels, FocusType,
    GroundType, mouthOptions,
    rarityColors,
    sampleHeadBar, ShieldType
} from './assets';

// ===== Data =====
export { sampleInventory } from './data/sampleEquipment';

// ===== Constants =====
export { CHARACTER_CREATOR_CONSTANTS } from './constants/characterCreator';

// ===== Hooks =====
export { useArchiveProgress } from './hooks/useArchiveProgress';
export { useCharacterCreation } from './hooks/useCharacterCreation';

// ===== Styles =====
export { createGlobalStyles } from './styles/globalStyles';
export { darkTheme, lightTheme, ThemeColors } from './styles/theme';

// ===== Types =====
export type {
    ArchiveProgress, AuthContextType, Chapter, ChapterPassage, ChapterSummary,
    //UserCharacter System
    Character, CharacterCreateData, CharacterCustomizationData,
    // Equipment
    CharacterGear, Choice, CodexEntry,
    // Journal
    CodexModalProps, EquipmentItem,
    EquipmentSubtype,
    EquipmentType,
    EquippedItems,
    // Game
    ExtendedGameData,
    GameAchievement,
    //User Game Data - Persistent Game Data
    GameData, GameSession, GameState,
    // Wellness system
    GearItem,
    GearUnlockSystem, JournalEntry, JournalPrompt, LocalStoryProgress, // User and authentication
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




// ===== Context Exports =====
export { useAuth } from './context/AuthContext';
export { useMasterState } from './context/MasterStateContext';
export { useTheme } from './context/ThemeContext';

// ===== Utility Functions =====
export { createCharacterCreatorCategories } from './types/user';

