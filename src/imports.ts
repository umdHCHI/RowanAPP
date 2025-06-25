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
    createContext,
    ReactNode,
    useContext,
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

// ===== Context Hooks =====
export { useAuth } from './context/AuthContext';
export { useOnboarding } from './context/OnboardingContext';
export { useTheme } from './context/ThemeContext';

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
export { default as ArchiveMapModal } from './components/ArchiveMapModal';
export { default as Button } from './components/Button';
export { default as CharacterFrame } from './components/CharacterFrame';
export { default as CharacterPreview } from './components/CharacterPreview';
export { default as CodexModal } from './components/CodexModal';
export { default as DrawingCanvas } from './components/DrawingCanvas';
export { default as EquipmentModal } from './components/EquipmentModal';
export { HauntedLibraryBG } from './components/HauntedLibrary';
export { default as PixelButton } from './components/PixelButton';
export { default as ThoughtDefenderModal } from './components/ThoughtDefenderModal';

// ===== Screens =====
export { default as CharacterHomeScreen } from './screens/characterStory/CharacterHomeScreen';
export { default as StoryCatalogScreen } from './screens/characterStory/StoryCatalogScreen';
export { default as StoryScreen } from './screens/characterStory/StoryScreen';
export { default as HomeScreen } from './screens/HomeScreen';
export { default as LoginScreen } from './screens/LoginScreen';
export { default as CharacterCreatorScreen } from './screens/onboarding/CharacterCreatorScreen';
export { default as WelcomeScreen } from './screens/onboarding/WelcomeScreen';
export { default as PersonalityHomeScreen } from './screens/personalityStory/PersonalityHomeScreen';
export { default as PersonalitySurveyScreen } from './screens/PersonalitySurveyScreen';
export { default as ProfileScreen } from './screens/ProfileScreen';
export { default as SettingsScreen } from './screens/SettingsScreen';

// ===== Navigation =====
export { default as TabNavigator } from './navigation/TabNavigator';

// ===== Assets =====
export {
    // Character options
    baseOptions,
    bgOptions,
    // Frame assets
    characterCreatorAssets, clothesOptions,
    // Equipment
    ComfortType,
    equipmentIcons,
    equipmentTypeLabels, eyesOptions, FocusType,
    GroundType, hairOptions,
    mouthOptions, rarityColors, sampleHeadBar, ShieldType
} from './assets';

// ===== Data =====
export { sampleInventory } from './data/sampleEquipment';
export { availableGrimoires } from './data/storyData';

// ===== Hooks =====
export { useArchiveProgress } from './hooks/useArchiveProgress';

// ===== Styles =====
export { createGlobalStyles } from './styles/globalStyles';
export { darkTheme, lightTheme, ThemeColors } from './styles/theme';

// ===== Types =====
export type {
    // Appearance
    Appearance,
    // User and authentication
    AuthContextType,
    Character, CharacterAppearance, CharacterCreateData, CharacterCreateRequest, CharacterCustomizationData, CharacterCustomizationRequest,
    CharacterHomeData,
    // Journal
    CodexModalProps,
    // Equipment
    EquipmentItem,
    EquipmentSubtype,
    EquipmentType,
    EquippedItems, ExperienceGainResponse,
    // Game
    ExtendedGameData,
    GameAchievement, GameData, GameSession,
    // Wellness system
    GearItem,
    GearUnlockSystem, JournalEntry, LoginResponse, Prompt, ReflectionAnalysis,
    ReflectionPattern,
    ReflectionPatterns, ResearchGroup, StatGains,
    StoryGains,
    StoryProgression, UserProfile, WellnessStat, WellnessStats
} from './types';

// ===== Context Types =====
export type { PersonalityTrait } from './context/PersonalityContext';

// ===== Additional Types =====
export type { ArchiveArea } from './components/ArchiveMapModal';
export type { Grimoire } from './screens/characterStory/StoryCatalogScreen';

