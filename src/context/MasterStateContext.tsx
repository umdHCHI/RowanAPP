import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import {
  baseOptions,
  bgOptionsBlonde, bgOptionsBlue, bgOptionsBlueGreen,
  bgOptionsBrown,
  bgOptionsDark,
  bgOptionsDarkBlue,
  bgOptionsDarkBrown,
  bgOptionsGreen,
  bgOptionsLightBrown, bgOptionsLightGreen, bgOptionsLilac, bgOptionsMagent,
  bgOptionsOrange, bgOptionsPink, bgOptionsRed, bgOptionsWhite,
  clothesOptionsBlonde, clothesOptionsBlue, clothesOptionsBlueGreen,
  clothesOptionsBrown,
  clothesOptionsDark,
  clothesOptionsDarkBlue,
  clothesOptionsDarkBrown,
  clothesOptionsGreen,
  clothesOptionsLightBrown, clothesOptionsLightGreen, clothesOptionsLilac, clothesOptionsMagent,
  clothesOptionsOrange, clothesOptionsPink, clothesOptionsRed, clothesOptionsWhite,
  eyebrowsOptionsBlonde, eyebrowsOptionsBlue, eyebrowsOptionsBlueGreen,
  eyebrowsOptionsBrown,
  eyebrowsOptionsDark,
  eyebrowsOptionsDarkBlue,
  eyebrowsOptionsDarkBrown,
  eyebrowsOptionsGreen,
  eyebrowsOptionsLightBrown, eyebrowsOptionsLightGreen, eyebrowsOptionsLilac, eyebrowsOptionsMagent,
  eyebrowsOptionsOrange, eyebrowsOptionsPink, eyebrowsOptionsRed, eyebrowsOptionsWhite,
  eyesOptionsBlonde, eyesOptionsBlue, eyesOptionsBlueGreen,
  eyesOptionsBrown,
  eyesOptionsDark,
  eyesOptionsDarkBlue,
  eyesOptionsDarkBrown,
  eyesOptionsGreen,
  eyesOptionsLightBrown, eyesOptionsLightGreen, eyesOptionsLilac, eyesOptionsMagent,
  eyesOptionsOrange, eyesOptionsPink, eyesOptionsRed, eyesOptionsWhite,
  hairOptionsBlack, hairOptionsBlonde, hairOptionsBlue, hairOptionsBlueGreen,
  hairOptionsBrown1, hairOptionsBrown2, hairOptionsBrown3, hairOptionsDarkBlue,
  hairOptionsGreen, hairOptionsLightGreen, hairOptionsLilac, hairOptionsMagent,
  hairOptionsOrange, hairOptionsPink, hairOptionsRed, hairOptionsWhite,
  mouthOptions
} from '../assets/characterOptions';
import { sampleInventory } from '../data/sampleEquipment';
import { apiService, appearanceService } from '../services';
import { CharacterTool, CopingTool, HomeData, ReflectionEntry, WellnessCharacter } from '../services/apiService';
import { CharacterAppearance, EquipmentItem, EquippedItems } from '../types';
import { useAuth } from './AuthContext';
import { useOnboarding } from './OnboardingContext';
import { useTheme } from './ThemeContext';

// ===== UPDATED TYPES FOR NEW BACKEND =====

export interface ArchiveFoundation {
  icon: string;
  label: string;
  value: number;
  maxValue: number;
  colors: string[];
  description: string;
  recentGain: number;
  nextUnlock: string;
  storyTriggers: string[];
}

export interface CodexEntry {
  id: string;
  type: string;
  content: string;
  prompt: string;
  skillCategory: string;
  mapArea: string;
  difficulty: string;
  timestamp: number;
}

export interface MiniGameProgress {
  thoughtDefenderLevel: number;
  thoughtDefenderScore: number;
  thoughtDefenderWins: number;
  drawingEntries: number;
  totalGameTime: number;
}

export interface MentalArtifact {
  name: string;
  type: string;
  equipped: boolean;
  resonance: number;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
}

export interface Grimoire {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  timeToComplete: string;
  exploration: number;
  revelations: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  skillFocus: string[];
  atmosphere: string;
  statBoosts: string[];
  unlockLevel: number;
  isLocked?: boolean;
  passages?: any[];
}

export interface ArchiveArea {
  id: string;
  name: string;
  roomNumber: number;
  description: string;
  requiredStories: number;
  requiredEntries: number;
  unlocked: boolean;
  progress: number;
}

// ===== MASTER STATE INTERFACE =====

interface MasterStateContextType {
  // ===== AUTHENTICATION & USER STATE =====
  auth: {
    authToken: string | null;
    characterId: string | null;
    isTestUser: boolean;
    user: { username: string } | null;
    login: (token: string, charId: string) => Promise<void>;
    logout: () => Promise<void>;
  };

  // ===== ONBOARDING STATE =====
  onboarding: {
    isComplete: boolean;
    assignedPath: 'survey' | 'character' | null;
    researchGroup: string | null;
    characterAppearance: CharacterAppearance | undefined;
    isLoading: boolean;
    completeSurvey: () => void;
    completeCharacter: () => void;
    setAssignedPath: (path: 'survey' | 'character' | null) => void;
    setCharacterAppearance: (appearance: CharacterAppearance) => void;
    resetOnboarding: () => void;
    setIsLoading: (loading: boolean) => void;
  };

  // ===== THEME STATE =====
  theme: {
    theme: any;
    themeMode: 'light' | 'dark';
    toggleTheme: () => void;
    setThemeMode: (mode: 'light' | 'dark') => void;
    styles: any;
    isDark: boolean;
  };

  // ===== CHARACTER & APPEARANCE STATE (UPDATED FOR NEW BACKEND) =====
  character: {
    // Backend character data
    backendCharacter: WellnessCharacter | null;
    
    // UI state for character creator (local only)
    characterName: string;
    selectedBaseModel: number;
    selectedHairStyle: number;
    selectedHairColor: number;
    selectedEyeType: number;
    selectedEyeColor: number;
    selectedEyebrowStyle: number;
    selectedEyebrowColor: number;
    selectedMouthType: number;
    selectedShirtType: number;
    selectedClothesColor: number;
    selectedBackgroundType: number;
    selectedBackgroundColor: number;
    
    // Methods
    setCharacterName: (name: string) => void;
    setSelectedBaseModel: (index: number) => void;
    setSelectedHairStyle: (index: number) => void;
    setSelectedHairColor: (index: number) => void;
    setSelectedEyeType: (index: number) => void;
    setSelectedEyeColor: (index: number) => void;
    setSelectedEyebrowStyle: (index: number) => void;
    setSelectedEyebrowColor: (index: number) => void;
    setSelectedMouthType: (index: number) => void;
    setSelectedShirtType: (index: number) => void;
    setSelectedClothesColor: (index: number) => void;
    setSelectedBackgroundType: (index: number) => void;
    setSelectedBackgroundColor: (index: number) => void;
    getHairIndex: () => number;
    getClothesIndex: () => number;
    getEyesIndex: () => number;
    getEyebrowsIndex: () => number;
    getHairAsset: () => any;
    getClothesAsset: () => any;
    getEyesAsset: () => any;
    getEyebrowsAsset: () => any;
    getCurrentBackgroundAsset: () => any;
    getBaseAsset: () => any;
    getMouthAsset: () => any;
    createCharacter: () => Promise<void>;
    updateCharacter: () => Promise<void>;
    loadCharacter: () => Promise<void>;
    gainExperience: (amount: number, source?: string) => Promise<void>;
    gainWellness: (gains: Record<string, number>) => Promise<void>;
  };

  // ===== WELLNESS FEATURES (NEW) =====
  wellness: {
    availableTools: CopingTool[];
    myTools: CharacterTool[];
    equippedTools: CharacterTool[];
    recentReflections: ReflectionEntry[];
    homeData: HomeData | null;
    
    // Tool methods
    loadAvailableTools: () => Promise<void>;
    loadMyTools: () => Promise<void>;
    acquireTool: (toolId: number) => Promise<void>;
    equipTool: (toolId: number) => Promise<void>;
    unequipTool: (toolId: number) => Promise<void>;
    useTool: (toolId: number, effectiveness?: number, notes?: string) => Promise<void>;
    
    // Reflection methods
    loadRecentReflections: () => Promise<void>;
    createReflection: (reflectionData: any) => Promise<void>;
    quickReflect: (title: string, content: string, prompt: string) => Promise<void>;
    
    // Home data
    loadHomeData: () => Promise<void>;
  };

  // ===== EQUIPMENT & INVENTORY STATE =====
  equipment: {
    inventory: EquipmentItem[];
    equippedItems: EquippedItems;
    setInventory: (items: EquipmentItem[]) => void;
    setEquippedItems: (items: EquippedItems) => void;
    equipItem: (type: keyof EquippedItems, item: EquipmentItem) => void;
    unequipItem: (type: keyof EquippedItems) => void;
    getItemIcon: (item: EquipmentItem) => any;
    getRarityColors: (rarity: string) => string[];
  };

  // ===== ARCHIVE PROGRESS STATE =====
  archive: {
    completedStories: Set<string>;
    codexEntries: CodexEntry[];
    miniGameProgress: MiniGameProgress;
    discoveredArtifacts: MentalArtifact[];
    finalRewardsArtifacts: MentalArtifact[];
    learnedSkills: string[];
    archiveFoundations: ArchiveFoundation[];
    restorationMetrics: {
      chroniclesExplored: number;
      artifactsDiscovered: number;
      revelationsUnlocked: number;
    };
    handleStoryComplete: (grimoireId: string) => void;
    handleCodexEntry: (entry: Omit<CodexEntry, 'id' | 'timestamp'>) => void;
    handleMiniGameComplete: (gameType: 'thoughtDefender' | 'drawing', data: any) => void;
    handleArtifactUnlock: (artifact: MentalArtifact) => void;
    handleSkillLearned: (skills: string[]) => void;
    setFinalRewardsArtifacts: (artifacts: MentalArtifact[]) => void;
    loadArchiveProgress: () => Promise<void>;
    saveArchiveProgress: () => Promise<void>;
  };

  // ===== UI STATE =====
  ui: {
    activeTab: string;
    researchCondition: 'character' | 'personality';
    isCodexVisible: boolean;
    isThoughtDefenderVisible: boolean;
    isMapVisible: boolean;
    isStoryVisible: boolean;
    isStoryCatalogVisible: boolean;
    currentMapRoomId: string;
    selectedStory: Grimoire | null;
    memoryGrimoires: Grimoire[];
    setActiveTab: (tab: string) => void;
    setResearchCondition: (condition: 'character' | 'personality') => void;
    setIsCodexVisible: (visible: boolean) => void;
    setIsThoughtDefenderVisible: (visible: boolean) => void;
    setIsMapVisible: (visible: boolean) => void;
    setIsStoryVisible: (visible: boolean) => void;
    setIsStoryCatalogVisible: (visible: boolean) => void;
    setCurrentMapRoomId: (roomId: string) => void;
    setSelectedStory: (story: Grimoire | null) => void;
    setMemoryGrimoires: (grimoires: Grimoire[]) => void;
    openGrimoire: (grimoire: Grimoire) => void;
    closeStory: () => void;
  };

  // ===== STORY & GAMEPLAY STATE =====
  story: {
    currentPassageId: string;
    totalStatGains: { [key: string]: number };
    recentGains: { [key: string]: number };
    showStatGain: boolean;
    unlockedArtifacts: string[];
    learnedSkills: string[];
    showArtifactUnlock: boolean;
    newArtifact: MentalArtifact | null;
    setCurrentPassageId: (id: string) => void;
    setTotalStatGains: (gains: { [key: string]: number }) => void;
    setRecentGains: (gains: { [key: string]: number }) => void;
    setShowStatGain: (show: boolean) => void;
    setUnlockedArtifacts: (artifacts: string[]) => void;
    setLearnedSkills: (skills: string[]) => void;
    setShowArtifactUnlock: (show: boolean) => void;
    setNewArtifact: (artifact: MentalArtifact | null) => void;
    handleChoice: (choice: any) => void;
    resetStoryState: () => void;
  };

  // ===== LOADING & ERROR STATE =====
  loading: {
    isLoading: boolean;
    error: string | null;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearError: () => void;
  };
}

// ===== CONTEXT CREATION =====

const MasterStateContext = createContext<MasterStateContextType | undefined>(undefined);

export const useMasterState = () => {
  const context = useContext(MasterStateContext);
  if (context === undefined) {
    throw new Error('useMasterState must be used within a MasterStateProvider');
  }
  return context;
};

// ===== PROVIDER COMPONENT =====

interface MasterStateProviderProps {
  children: ReactNode;
}

export const MasterStateProvider: React.FC<MasterStateProviderProps> = ({ children }) => {
  // ===== EXTERNAL CONTEXTS =====
  const { authToken, characterId, isTestUser, user, login, logout } = useAuth();
  const { 
    onboardingState, 
    setOnboardingState, 
    completeSurvey, 
    completeCharacter, 
    setAssignedPath, 
    setCharacterAppearance, 
    resetOnboarding 
  } = useOnboarding();
  const { theme, themeMode, toggleTheme, setThemeMode, styles, isDark } = useTheme();

  // ===== CHARACTER STATE (UPDATED FOR NEW BACKEND) =====
  const [backendCharacter, setBackendCharacter] = useState<WellnessCharacter | null>(null);
  
  // Local UI state for character creator (keeps your existing component working)
  const [characterName, setCharacterName] = useState('');
  const [selectedBaseModel, setSelectedBaseModel] = useState(0);
  const [selectedHairStyle, setSelectedHairStyle] = useState(0);
  const [selectedHairColor, setSelectedHairColor] = useState(0);
  const [selectedEyeType, setSelectedEyeType] = useState(0);
  const [selectedEyeColor, setSelectedEyeColor] = useState(0);
  const [selectedEyebrowStyle, setSelectedEyebrowStyle] = useState(0);
  const [selectedEyebrowColor, setSelectedEyebrowColor] = useState(0);
  const [selectedMouthType, setSelectedMouthType] = useState(0);
  const [selectedShirtType, setSelectedShirtType] = useState(0);
  const [selectedClothesColor, setSelectedClothesColor] = useState(0);
  const [selectedBackgroundType, setSelectedBackgroundType] = useState(0);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);

  // ===== WELLNESS STATE (NEW) =====
  const [availableTools, setAvailableTools] = useState<CopingTool[]>([]);
  const [myTools, setMyTools] = useState<CharacterTool[]>([]);
  const [equippedTools, setEquippedTools] = useState<CharacterTool[]>([]);
  const [recentReflections, setRecentReflections] = useState<ReflectionEntry[]>([]);
  const [homeData, setHomeData] = useState<HomeData | null>(null);

  // ===== EQUIPMENT STATE =====
  const [inventory, setInventory] = useState<EquipmentItem[]>(sampleInventory);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});

  // ===== ARCHIVE PROGRESS STATE =====
  const [completedStories, setCompletedStories] = useState<Set<string>>(new Set());
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [miniGameProgress, setMiniGameProgress] = useState<MiniGameProgress>({
    thoughtDefenderLevel: 0,
    thoughtDefenderScore: 0,
    thoughtDefenderWins: 0,
    drawingEntries: 0,
    totalGameTime: 0
  });
  const [discoveredArtifacts, setDiscoveredArtifacts] = useState<MentalArtifact[]>([]);
  const [finalRewardsArtifacts, setFinalRewardsArtifacts] = useState<MentalArtifact[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);

  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState('entrance');
  const [researchCondition, setResearchCondition] = useState<'character' | 'personality'>('character');
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isThoughtDefenderVisible, setIsThoughtDefenderVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [currentMapRoomId, setCurrentMapRoomId] = useState('');
  const [selectedStory, setSelectedStory] = useState<Grimoire | null>(null);
  const [memoryGrimoires, setMemoryGrimoires] = useState<Grimoire[]>([]);

  // ===== STORY STATE =====
  const [currentPassageId, setCurrentPassageId] = useState('start');
  const [totalStatGains, setTotalStatGains] = useState<{[key: string]: number}>({});
  const [recentGains, setRecentGains] = useState<{[key: string]: number}>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [storyLearnedSkills, setStoryLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<MentalArtifact | null>(null);

  // ===== LOADING STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CHARACTER HELPER FUNCTIONS (UNCHANGED) =====
  const getHairIndex = () => selectedHairStyle + (selectedHairColor * 12);
  const getClothesIndex = () => selectedShirtType + (selectedClothesColor * 12);
  const getEyesIndex = () => selectedEyeType + (selectedEyeColor * 12);
  const getEyebrowsIndex = () => selectedEyebrowStyle + (selectedEyebrowColor * 12);

  // Asset getter functions (unchanged)
  const getHairAsset = () => {
    const hairArrays = [
      hairOptionsBlack, hairOptionsBlonde, hairOptionsBlue, hairOptionsBlueGreen,
      hairOptionsBrown1, hairOptionsBrown2, hairOptionsBrown3, hairOptionsDarkBlue,
      hairOptionsGreen, hairOptionsLightGreen, hairOptionsLilac, hairOptionsMagent,
      hairOptionsOrange, hairOptionsPink, hairOptionsRed, hairOptionsWhite
    ];
    const colorArray = hairArrays[selectedHairColor] || hairOptionsBlack;
    return colorArray[selectedHairStyle] || colorArray[0];
  };

  const getClothesAsset = () => {
    const clothesArrays = [
      clothesOptionsBrown, clothesOptionsBlonde, clothesOptionsBlue, clothesOptionsBlueGreen,
      clothesOptionsDarkBrown, clothesOptionsDarkBlue, clothesOptionsDark, clothesOptionsGreen,
      clothesOptionsLightBrown, clothesOptionsLightGreen, clothesOptionsLilac, clothesOptionsMagent,
      clothesOptionsOrange, clothesOptionsPink, clothesOptionsRed, clothesOptionsWhite
    ];
    const colorArray = clothesArrays[selectedClothesColor || 0] || clothesOptionsBrown;
    return colorArray[selectedShirtType] || colorArray[0];
  };

  const getEyesAsset = () => {
    const eyesArrays = [
      eyesOptionsBrown, eyesOptionsBlonde, eyesOptionsBlue, eyesOptionsBlueGreen,
      eyesOptionsDarkBrown, eyesOptionsDarkBlue, eyesOptionsDark, eyesOptionsGreen,
      eyesOptionsLightBrown, eyesOptionsLightGreen, eyesOptionsLilac, eyesOptionsMagent,
      eyesOptionsOrange, eyesOptionsPink, eyesOptionsRed, eyesOptionsWhite
    ];
    const colorArray = eyesArrays[selectedEyeColor] || eyesOptionsBrown;
    return colorArray[selectedEyeType] || colorArray[0];
  };

  const getEyebrowsAsset = () => {
    const eyebrowsArrays = [
      eyebrowsOptionsBrown, eyebrowsOptionsBlonde, eyebrowsOptionsBlue, eyebrowsOptionsBlueGreen,
      eyebrowsOptionsDarkBrown, eyebrowsOptionsDarkBlue, eyebrowsOptionsDark, eyebrowsOptionsGreen,
      eyebrowsOptionsLightBrown, eyebrowsOptionsLightGreen, eyebrowsOptionsLilac, eyebrowsOptionsMagent,
      eyebrowsOptionsOrange, eyebrowsOptionsPink, eyebrowsOptionsRed, eyebrowsOptionsWhite
    ];
    const colorArray = eyebrowsArrays[selectedEyebrowColor] || eyebrowsOptionsBrown;
    return colorArray[selectedEyebrowStyle] || colorArray[0];
  };

  const getCurrentBackgroundAsset = () => {
    const backgroundColorArrays = [
      bgOptionsBrown, bgOptionsBlonde, bgOptionsBlue, bgOptionsBlueGreen,
      bgOptionsDarkBrown, bgOptionsDarkBlue, bgOptionsDark, bgOptionsGreen,
      bgOptionsLightBrown, bgOptionsLightGreen, bgOptionsLilac, bgOptionsMagent,
      bgOptionsOrange, bgOptionsPink, bgOptionsRed, bgOptionsWhite
    ];
    const colorArray = backgroundColorArrays[selectedBackgroundColor || 0] || bgOptionsBrown;
    return colorArray[selectedBackgroundType] || colorArray[0];
  };

  const getBaseAsset = () => {
    return baseOptions[selectedBaseModel] || baseOptions[0];
  };

  const getMouthAsset = () => {
    return mouthOptions[selectedMouthType] || mouthOptions[0];
  };

  // ===== EQUIPMENT HELPER FUNCTIONS =====
  const getItemIcon = (item: EquipmentItem) => {
    return require('../../assets/equipment/armor/fb1857.png');
  };

  const getRarityColors = (rarity: string): string[] => {
    switch (rarity) {
      case 'Legendary': return ['#F97316', '#FCD34D'];
      case 'Epic': return ['#A855F7', '#F472B6'];
      case 'Rare': return ['#3B82F6', '#06B6D4'];
      default: return ['#6B7280', '#9CA3AF'];
    }
  };

  const equipItem = (type: keyof EquippedItems, item: EquipmentItem) => {
    setEquippedItems(prev => ({ ...prev, [type]: item }));
  };

  const unequipItem = (type: keyof EquippedItems) => {
    setEquippedItems(prev => {
      const newItems = { ...prev };
      delete newItems[type];
      return newItems;
    });
  };

  // ===== ARCHIVE PROGRESS CALCULATIONS (UNCHANGED) =====
  const calculateFoundationValues = useMemo(() => {
    const baseValues = {
      'Sight Beyond Sight': 2,
      'Unbreakable Will': 2, 
      "Heart's Compass": 2,
      'Elemental Harmony': 2
    };

    // Add points from completed stories
    completedStories.forEach(storyId => {
      const story = memoryGrimoires.find((g: Grimoire) => g.id === storyId);
      if (story) {
        story.skillFocus.forEach((skill: string) => {
          if (skill.includes('Mindful') || skill.includes('Stress') || skill.includes('Academic')) {
            baseValues['Sight Beyond Sight'] += 3;
          }
          if (skill.includes('Self-Compassion') || skill.includes('Growth') || skill.includes('Inner Critic')) {
            baseValues['Unbreakable Will'] += 3;
          }
          if (skill.includes('Social') || skill.includes('Anxiety') || skill.includes('Authentic')) {
            baseValues["Heart's Compass"] += 3;
          }
          if (skill.includes('Balance') || skill.includes('Time') || skill.includes('Self-Care')) {
            baseValues['Elemental Harmony'] += 3;
          }
        });
      }
    });

    // Add points from codex entries
    codexEntries.forEach(entry => {
      switch (entry.skillCategory) {
        case 'awareness':
        case 'mindfulness':
          baseValues['Sight Beyond Sight'] += 2;
          break;
        case 'resilience':
        case 'perseverance':
          baseValues['Unbreakable Will'] += 2;
          break;
        case 'connection':
        case 'empathy':
          baseValues["Heart's Compass"] += 2;
          break;
        case 'balance':
        case 'harmony':
          baseValues['Elemental Harmony'] += 2;
          break;
        default:
          Object.keys(baseValues).forEach(key => {
            baseValues[key as keyof typeof baseValues] += 1;
          });
      }
    });

    // Add points from mini-game achievements
    if (miniGameProgress.thoughtDefenderWins > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderWins * 2;
      baseValues['Sight Beyond Sight'] += miniGameProgress.thoughtDefenderWins;
    }
    
    if (miniGameProgress.thoughtDefenderLevel > 0) {
      baseValues['Unbreakable Will'] += miniGameProgress.thoughtDefenderLevel;
    }

    if (miniGameProgress.drawingEntries > 0) {
      baseValues['Elemental Harmony'] += miniGameProgress.drawingEntries * 2;
      baseValues["Heart's Compass"] += miniGameProgress.drawingEntries;
    }

    // Cap all values at maxValue (20)
    Object.keys(baseValues).forEach(key => {
      baseValues[key as keyof typeof baseValues] = Math.min(20, baseValues[key as keyof typeof baseValues]);
    });

    return baseValues;
  }, [completedStories, codexEntries, miniGameProgress, memoryGrimoires]);

  const getNextUnlock = (foundationLabel: string, currentValue: number) => {
    const nextLevel = Math.floor(currentValue / 5) + 1;
    const unlocks = {
      'Sight Beyond Sight': [
        'Enhanced Perception - See through deceptive thoughts',
        'Mindful Awareness - Present moment clarity',
        'Pattern Recognition - Identify thought cycles',
        'Truth Sight - Distinguish reality from illusion'
      ],
      'Unbreakable Will': [
        'Iron Resolve - Resist overwhelming stress',
        'Steadfast Determination - Maintain focus under pressure',
        'Unshakeable Core - Weather emotional storms',
        'Indomitable Spirit - Rise above all challenges'
      ],
      "Heart's Compass": [
        'Empathic Mastery - Deep emotional understanding',
        'Connection Wisdom - Navigate relationships skillfully',
        'Compassionate Leadership - Guide others with heart',
        'Universal Love - Embrace all beings with kindness'
      ],
      'Elemental Harmony': [
        'Life Equilibrium - Perfect work-life balance',
        'Flow State Mastery - Effortless action and presence',
        'Cosmic Alignment - Harmony with universal forces',
        'Transcendent Balance - Beyond duality and conflict'
      ]
    };
    
    const foundationUnlocks = unlocks[foundationLabel as keyof typeof unlocks];
    return foundationUnlocks?.[nextLevel - 1] || 'Mastery achieved';
  };

  const archiveFoundations = useMemo(() => {
    const newValues = calculateFoundationValues;
    
    return [
      {
        icon: '👁️',
        label: 'Sight Beyond Sight',
        value: newValues['Sight Beyond Sight'],
        maxValue: 20,
        colors: ['#3B82F6', '#06B6D4'],
        description: 'Your ability to perceive hidden truths and see through illusions of the mind',
        recentGain: 0,
        nextUnlock: getNextUnlock('Sight Beyond Sight', newValues['Sight Beyond Sight']),
        storyTriggers: ['mindfulness_practice', 'reflection_moments', 'self_awareness_choices']
      },
      {
        icon: '⚓',
        label: 'Unbreakable Will',
        value: newValues['Unbreakable Will'],
        maxValue: 20,
        colors: ['#059669', '#10B981'],
        description: 'The fortified strength of your spirit against the storms of adversity',
        recentGain: 0,
        nextUnlock: getNextUnlock('Unbreakable Will', newValues['Unbreakable Will']),
        storyTriggers: ['perseverance_choices', 'facing_fears', 'overcoming_obstacles']
      },
      {
        icon: '🔗',
        label: "Heart's Compass",
        value: newValues["Heart's Compass"],
        maxValue: 20,
        colors: ['#DC2626', '#F472B6'],
        description: 'Your power to forge meaningful bonds and navigate the realm of emotions',
        recentGain: 0,
        nextUnlock: getNextUnlock("Heart's Compass", newValues["Heart's Compass"]),
        storyTriggers: ['connection_choices', 'helping_others', 'vulnerability_moments']
      },
      {
        icon: '⚖️',
        label: 'Elemental Harmony',
        value: newValues['Elemental Harmony'],
        maxValue: 20,
        colors: ['#D97706', '#FCD34D'],
        description: 'Mastery over the delicate balance between all aspects of your existence',
        recentGain: 0,
        nextUnlock: getNextUnlock('Elemental Harmony', newValues['Elemental Harmony']),
        storyTriggers: ['balance_choices', 'priority_setting', 'self_care_actions']
      },
    ];
  }, [calculateFoundationValues]);

  const restorationMetrics = useMemo(() => ({
    chroniclesExplored: completedStories.size,
    artifactsDiscovered: discoveredArtifacts.length + finalRewardsArtifacts.length,
    revelationsUnlocked: learnedSkills.length,
  }), [completedStories, discoveredArtifacts, finalRewardsArtifacts, learnedSkills]);

  // ===== ARCHIVE PROGRESS HANDLERS =====
  const handleStoryComplete = (grimoireId: string) => {
    setCompletedStories(prev => new Set([...prev, grimoireId]));
  };

  const handleCodexEntry = (entry: Omit<CodexEntry, 'id' | 'timestamp'>) => {
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: Date.now(),
    };
    setCodexEntries(prev => [...prev, newEntry]);
  };

  const handleMiniGameComplete = (gameType: 'thoughtDefender' | 'drawing', data: any) => {
    if (gameType === 'thoughtDefender') {
      setMiniGameProgress(prev => ({
        ...prev,
        thoughtDefenderLevel: Math.max(prev.thoughtDefenderLevel, data.level || 0),
        thoughtDefenderScore: Math.max(prev.thoughtDefenderScore, data.score || 0),
        thoughtDefenderWins: prev.thoughtDefenderWins + (data.won ? 1 : 0),
        totalGameTime: prev.totalGameTime + (data.gameTime || 0)
      }));
    } else if (gameType === 'drawing') {
      setMiniGameProgress(prev => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1
      }));
    }
  };

  const handleArtifactUnlock = (artifact: MentalArtifact) => {
    if (!discoveredArtifacts.find(a => a.name === artifact.name) && 
        !finalRewardsArtifacts.find(a => a.name === artifact.name)) {
      setDiscoveredArtifacts(prev => [...prev, artifact]);
    }
  };

  const handleSkillLearned = (skills: string[]) => {
    setLearnedSkills(prev => [...new Set([...prev, ...skills])]);
  };

  // ===== NEW CHARACTER CREATION HANDLERS (UPDATED FOR NEW BACKEND) =====
  const createCharacter = async () => {
    if (!authToken) {
      setError('No authentication token');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const createdCharacter = await appearanceService.createOrUpdateCharacter(
        characterName,
        {
          selectedBaseModel,
          selectedHairStyle,
          selectedHairColor,
          selectedEyeType,
          selectedEyeColor,
          selectedEyebrowStyle,
          selectedEyebrowColor,
          selectedMouthType,
          selectedShirtType,
          selectedClothesColor,
          selectedBackgroundType,
          selectedBackgroundColor,
        }
      );
      
      setBackendCharacter(createdCharacter);
      
      // Complete onboarding
      completeCharacter();
      
      // Load additional data
      await loadHomeData();
      await loadAvailableTools();
      await loadMyTools();
      
    } catch (error: any) {
      setError('Failed to create character: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async () => {
    if (!authToken || !backendCharacter) {
      setError('No authentication token or character');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updatedCharacter = await appearanceService.updateCharacterCustomization(
        backendCharacter.id,
        {
          selectedBaseModel,
          selectedHairStyle,
          selectedHairColor,
          selectedEyeType,
          selectedEyeColor,
          selectedEyebrowStyle,
          selectedEyebrowColor,
          selectedMouthType,
          selectedShirtType,
          selectedClothesColor,
          selectedBackgroundType,
          selectedBackgroundColor,
        }
      );
      
      setBackendCharacter(updatedCharacter);
    } catch (error: any) {
      setError('Failed to update character: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadCharacter = async () => {
    if (!authToken) {
      return;
    }

    setIsLoading(true);
    try {
      const characterData = await appearanceService.getMyCharacter();
      
      if (characterData) {
        setBackendCharacter(characterData);
        
        // Sync UI state with backend data using the mapping function
        const frontendData = appearanceService.mapBackendToFrontend(characterData);
        setCharacterName(characterData.name || '');
        setSelectedBaseModel(frontendData.selectedBaseModel);
        setSelectedHairStyle(frontendData.selectedHairStyle);
        setSelectedHairColor(frontendData.selectedHairColor);
        setSelectedEyeType(frontendData.selectedEyeType);
        setSelectedEyeColor(frontendData.selectedEyeColor);
        setSelectedEyebrowStyle(frontendData.selectedEyebrowStyle);
        setSelectedEyebrowColor(frontendData.selectedEyebrowColor);
        setSelectedMouthType(frontendData.selectedMouthType);
        setSelectedShirtType(frontendData.selectedShirtType);
        setSelectedClothesColor(frontendData.selectedClothesColor);
        setSelectedBackgroundType(frontendData.selectedBackgroundType);
        setSelectedBackgroundColor(frontendData.selectedBackgroundColor);
      }
    } catch (error) {
      // Don't set error state for load failures as they might be expected
    } finally {
      setIsLoading(false);
    }
  };

  const gainExperience = async (amount: number, source?: string) => {
    if (!backendCharacter) {
      setError('No character loaded');
      return;
    }

    try {
      const result = await appearanceService.gainExperience(backendCharacter.id, amount, source);
      setBackendCharacter(result);
      
      if (result.level_up) {
        Alert.alert(
          '🎉 Level Up!',
          `Congratulations! You gained ${result.levels_gained} level(s)!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error: any) {
      setError('Failed to gain experience: ' + (error?.message || 'Unknown error'));
    }
  };

  const gainWellness = async (gains: Record<string, number>) => {
    if (!backendCharacter) {
      setError('No character loaded');
      return;
    }

    try {
      const result = await appearanceService.gainWellness(backendCharacter.id, gains);
      setBackendCharacter(result);
      
      Alert.alert(
        '✨ Wellness Increased!',
        result.message,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error: any) {
      setError('Failed to gain wellness: ' + (error?.message || 'Unknown error'));
    }
  };

  // ===== NEW WELLNESS METHODS =====
  const loadAvailableTools = async () => {
    try {
      const tools = await appearanceService.getAvailableCopingTools();
      setAvailableTools(tools);
    } catch (error) {
      // Handle error silently
    }
  };

  const loadMyTools = async () => {
    try {
      const tools = await appearanceService.getMyTools();
      setMyTools(tools);
      setEquippedTools(tools.filter(tool => tool.is_equipped));
    } catch (error) {
      // Handle error silently
    }
  };

  const acquireTool = async (toolId: number) => {
    try {
      await appearanceService.acquireCopingTool(toolId);
      await loadMyTools(); // Refresh tools
      
      Alert.alert(
        '🛠️ Tool Acquired!',
        'You have acquired a new coping tool!',
        [{ text: 'Excellent!', style: 'default' }]
      );
    } catch (error: any) {
      setError('Failed to acquire tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const equipTool = async (toolId: number) => {
    try {
      await appearanceService.equipTool(toolId);
      await loadMyTools(); // Refresh tools
    } catch (error: any) {
      setError('Failed to equip tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const unequipTool = async (toolId: number) => {
    try {
      await apiService.unequipTool(toolId);
      await loadMyTools(); // Refresh tools
    } catch (error: any) {
      setError('Failed to unequip tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const useTool = async (toolId: number, effectiveness?: number, notes?: string) => {
    try {
      await appearanceService.useTool(toolId, effectiveness, notes);
      await loadMyTools(); // Refresh tools
      
      Alert.alert(
        '🌟 Tool Used!',
        'Your tool usage has been recorded.',
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error: any) {
      setError('Failed to use tool: ' + (error?.message || 'Unknown error'));
    }
  };

  const loadRecentReflections = async () => {
    try {
      const reflections = await appearanceService.getRecentReflections();
      setRecentReflections(reflections);
    } catch (error) {
      // Handle error silently
    }
  };

  const createReflection = async (reflectionData: any) => {
    try {
      await appearanceService.createReflection(reflectionData);
      await loadRecentReflections(); // Refresh reflections
      
      Alert.alert(
        '📝 Reflection Created!',
        'Your reflection has been saved.',
        [{ text: 'Wonderful!', style: 'default' }]
      );
    } catch (error: any) {
      setError('Failed to create reflection: ' + (error?.message || 'Unknown error'));
    }
  };

  const quickReflect = async (title: string, content: string, prompt: string) => {
    try {
      await appearanceService.createReflection({
        entry_type: 'growth',
        title,
        content,
        prompt
      });
      await loadRecentReflections(); // Refresh reflections
      
      Alert.alert(
        '✨ Quick Reflection Saved!',
        'Your thoughts have been captured.',
        [{ text: 'Thank you!', style: 'default' }]
      );
    } catch (error: any) {
      setError('Failed to save quick reflection: ' + (error?.message || 'Unknown error'));
    }
  };

  const loadHomeData = async () => {
    try {
      const data = await appearanceService.getHomeData();
      setHomeData(data);
    } catch (error) {
      // Handle error silently
    }
  };

  // ===== ARCHIVE PROGRESS PERSISTENCE =====
  const loadArchiveProgress = async () => {
    // This would be implemented when archive backend is ready
  };

  const saveArchiveProgress = async () => {
    // This would be implemented when archive backend is ready
  };

  // ===== UI HANDLERS =====
  const openGrimoire = (grimoire: Grimoire) => {
    setSelectedStory(grimoire);
    setIsStoryVisible(true);
  };

  const closeStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
  };

  // ===== STORY HANDLERS =====
  const handleChoice = (choice: any) => {
    const { next, statEffects, skillsLearned, artifactUnlock, isEnding, finalRewards, wisdomGained } = choice;
    
    // Handle stat effects
    if (statEffects) {
      const newRecentGains: {[key: string]: number} = {};
      
      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains(prev => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number)
        }));
      });
      
      setRecentGains(newRecentGains);
      setShowStatGain(true);
      
      setTimeout(() => setShowStatGain(false), 2000);
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setStoryLearnedSkills(prev => [...prev, ...skillsLearned]);
      handleSkillLearned(skillsLearned);
    }

    // Handle artifact unlock
    if (artifactUnlock) {
      setShowArtifactUnlock(true);
      setTimeout(() => setShowArtifactUnlock(false), 4000);
    }
    
    // Check if this is an ending choice
    if (isEnding || (!next && (finalRewards || wisdomGained))) {
      Alert.alert(
        '📚 Grimoire Mastered! ✨',
        `Your journey has transformed your understanding.`,
        [{ text: 'Continue Exploring', style: 'default' }]
      );
      closeStory();
    } else if (next) {
      setTimeout(() => setCurrentPassageId(next), 500);
    }
  };

  const resetStoryState = () => {
    setCurrentPassageId('start');
    setTotalStatGains({});
    setRecentGains({});
    setShowStatGain(false);
    setUnlockedArtifacts([]);
    setStoryLearnedSkills([]);
    setShowArtifactUnlock(false);
    setNewArtifact(null);
  };

  // ===== LOADING HANDLERS =====
  const clearError = () => setError(null);

  // ===== EFFECTS =====
  useEffect(() => {
    if (authToken) {
      loadCharacter();
      loadAvailableTools();
      loadMyTools();
      loadRecentReflections();
      loadHomeData();
    }
  }, [authToken]);

  // ===== CONTEXT VALUE =====
  const value: MasterStateContextType = {
    auth: {
      authToken,
      characterId,
      isTestUser,
      user,
      login,
      logout,
    },
    onboarding: {
      isComplete: onboardingState.isComplete,
      assignedPath: onboardingState.assignedPath,
      researchGroup: onboardingState.researchGroup,
      characterAppearance: onboardingState.characterAppearance,
      isLoading: onboardingState.isLoading,
      completeSurvey,
      completeCharacter,
      setAssignedPath,
      setCharacterAppearance,
      resetOnboarding,
      setIsLoading,
    },
    theme: {
      theme,
      themeMode,
      toggleTheme,
      setThemeMode,
      styles,
      isDark,
    },
    character: {
      backendCharacter,
      characterName,
      selectedBaseModel,
      selectedHairStyle,
      selectedHairColor,
      selectedEyeType,
      selectedEyeColor,
      selectedEyebrowStyle,
      selectedEyebrowColor,
      selectedMouthType,
      selectedShirtType,
      selectedClothesColor,
      selectedBackgroundType,
      selectedBackgroundColor,
      setCharacterName,
      setSelectedBaseModel,
      setSelectedHairStyle,
      setSelectedHairColor,
      setSelectedEyeType,
      setSelectedEyeColor,
      setSelectedEyebrowStyle,
      setSelectedEyebrowColor,
      setSelectedMouthType,
      setSelectedShirtType,
      setSelectedClothesColor,
      setSelectedBackgroundType,
      setSelectedBackgroundColor,
      getHairIndex,
      getClothesIndex,
      getEyesIndex,
      getEyebrowsIndex,
      getHairAsset,
      getClothesAsset,
      getEyesAsset,
      getEyebrowsAsset,
      getCurrentBackgroundAsset,
      getBaseAsset,
      getMouthAsset,
      createCharacter,
      updateCharacter,
      loadCharacter,
      gainExperience,
      gainWellness,
    },
    wellness: {
      availableTools,
      myTools,
      equippedTools,
      recentReflections,
      homeData,
      loadAvailableTools,
      loadMyTools,
      acquireTool,
      equipTool,
      unequipTool,
      useTool,
      loadRecentReflections,
      createReflection,
      quickReflect,
      loadHomeData,
    },
    equipment: {
      inventory,
      equippedItems,
      setInventory,
      setEquippedItems,
      equipItem,
      unequipItem,
      getItemIcon,
      getRarityColors,
    },
    archive: {
      completedStories,
      codexEntries,
      miniGameProgress,
      discoveredArtifacts,
      finalRewardsArtifacts,
      learnedSkills,
      archiveFoundations,
      restorationMetrics,
      handleStoryComplete,
      handleCodexEntry,
      handleMiniGameComplete,
      handleArtifactUnlock,
      handleSkillLearned,
      setFinalRewardsArtifacts,
      loadArchiveProgress,
      saveArchiveProgress,
    },
    ui: {
      activeTab,
      researchCondition,
      isCodexVisible,
      isThoughtDefenderVisible,
      isMapVisible,
      isStoryVisible,
      isStoryCatalogVisible,
      currentMapRoomId,
      selectedStory,
      memoryGrimoires,
      setActiveTab,
      setResearchCondition,
      setIsCodexVisible,
      setIsThoughtDefenderVisible,
      setIsMapVisible,
      setIsStoryVisible,
      setIsStoryCatalogVisible,
      setCurrentMapRoomId,
      setSelectedStory,
      setMemoryGrimoires,
      openGrimoire,
      closeStory,
    },
    story: {
      currentPassageId,
      totalStatGains,
      recentGains,
      showStatGain,
      unlockedArtifacts,
      learnedSkills: storyLearnedSkills,
      showArtifactUnlock,
      newArtifact,
      setCurrentPassageId,
      setTotalStatGains,
      setRecentGains,
      setShowStatGain,
      setUnlockedArtifacts,
      setLearnedSkills: setStoryLearnedSkills,
      setShowArtifactUnlock,
      setNewArtifact,
      handleChoice,
      resetStoryState,
    },
    loading: {
      isLoading,
      error,
      setIsLoading,
      setError,
      clearError,
    },
  };

  return (
    <MasterStateContext.Provider value={value}>
      {children}
    </MasterStateContext.Provider>
  );
};