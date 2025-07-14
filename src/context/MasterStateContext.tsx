import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import {
  baseOptions,
  bgOptionsBlonde,
  bgOptionsBlue,
  bgOptionsBlueGreen,
  bgOptionsBrown,
  bgOptionsDark,
  bgOptionsDarkBlue,
  bgOptionsDarkBrown,
  bgOptionsGreen,
  bgOptionsLightBrown,
  bgOptionsLightGreen,
  bgOptionsLilac,
  bgOptionsMagent,
  bgOptionsOrange,
  bgOptionsPink,
  bgOptionsRed,
  bgOptionsWhite,
  clothesOptionsBlonde,
  clothesOptionsBlue,
  clothesOptionsBlueGreen,
  clothesOptionsBrown,
  clothesOptionsDark,
  clothesOptionsDarkBlue,
  clothesOptionsDarkBrown,
  clothesOptionsGreen,
  clothesOptionsLightBrown,
  clothesOptionsLightGreen,
  clothesOptionsLilac,
  clothesOptionsMagent,
  clothesOptionsOrange,
  clothesOptionsPink,
  clothesOptionsRed,
  clothesOptionsWhite,
  eyebrowsOptionsBlonde,
  eyebrowsOptionsBlue,
  eyebrowsOptionsBlueGreen,
  eyebrowsOptionsBrown,
  eyebrowsOptionsDark,
  eyebrowsOptionsDarkBlue,
  eyebrowsOptionsDarkBrown,
  eyebrowsOptionsGreen,
  eyebrowsOptionsLightBrown,
  eyebrowsOptionsLightGreen,
  eyebrowsOptionsLilac,
  eyebrowsOptionsMagent,
  eyebrowsOptionsOrange,
  eyebrowsOptionsPink,
  eyebrowsOptionsRed,
  eyebrowsOptionsWhite,
  eyesOptionsBlonde,
  eyesOptionsBlue,
  eyesOptionsBlueGreen,
  eyesOptionsBrown,
  eyesOptionsDark,
  eyesOptionsDarkBlue,
  eyesOptionsDarkBrown,
  eyesOptionsGreen,
  eyesOptionsLightBrown,
  eyesOptionsLightGreen,
  eyesOptionsLilac,
  eyesOptionsMagent,
  eyesOptionsOrange,
  eyesOptionsPink,
  eyesOptionsRed,
  eyesOptionsWhite,
  hairOptionsBlack,
  hairOptionsBlonde,
  hairOptionsBlue,
  hairOptionsBlueGreen,
  hairOptionsBrown1,
  hairOptionsBrown2,
  hairOptionsBrown3,
  hairOptionsDarkBlue,
  hairOptionsGreen,
  hairOptionsLightGreen,
  hairOptionsLilac,
  hairOptionsMagent,
  hairOptionsOrange,
  hairOptionsPink,
  hairOptionsRed,
  hairOptionsWhite,
  mouthOptions,
} from "../assets/characterOptions";
import { apiService, appearanceService } from "../services";
import {
  CharacterGear,
  CharacterTool,
  CopingTool,
  HomeData,
} from "../services/apiService";
import { Character, CodexEntry, EquipmentItem, EquipmentSubtype, EquippedItems, JournalPrompt, MiniGameProgress, Story } from "../types";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";

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



export interface MentalArtifact {
  name: string;
  type: string;
  equipped: boolean;
  resonance: number;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
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
    login: (token: string, charId: string, userData?: any) => Promise<void>;
    logout: () => Promise<void>;
  };

  // ===== ONBOARDING STATE =====
  onboarding: {
    isComplete: boolean;
    assignedPath: "survey" | "character" | null;
    researchGroup: string | null;
    characterAppearance: Character | undefined;
    isLoading: boolean;
    completeCharacter: () => Promise<void>;
    setAssignedPath: (path: "survey" | "character" | null) => void;
    setCharacterAppearance: (appearance: Character) => void;
    resetOnboarding: () => void;
    setIsLoading: (loading: boolean) => void;
    loadOnboardingStatus: () => Promise<void>;
  };

  // ===== THEME STATE =====
  theme: {
    theme: any;
    themeMode: "light" | "dark";
    toggleTheme: () => void;
    setThemeMode: (mode: "light" | "dark") => void;
    styles: any;
    isDark: boolean;
  };

  // ===== CHARACTER & APPEARANCE STATE (UPDATED FOR NEW BACKEND) =====
  character: {
    // Backend character data
    backendCharacter: Character | null;

    // UI state for character creator (local only)
    characterName: string;
    selectedBaseModel: number;
    selectedBaseColor: number; //color index for base model
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
    setSelectedBaseColor: (index: number) => void;
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
    getBaseIndex: () => number;
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
  wellness: {    availableTools: CopingTool[];
    myTools: CharacterTool[];
    equippedTools: CharacterTool[];    recentCodexEntries: CodexEntry[];
    homeData: HomeData | null;
    
    // Journal prompts
    availablePrompts: JournalPrompt[];
    categoryPrompts: {
      journal: JournalPrompt | null;
      draw: JournalPrompt | null;
      voice: JournalPrompt | null;
    };

    // Tool methods
    loadAvailableTools: () => Promise<void>;
    loadMyTools: () => Promise<void>;
    acquireTool: (toolId: number) => Promise<void>;
    equipTool: (toolId: number) => Promise<void>;
    unequipTool: (toolId: number) => Promise<void>;
    useTool: (
      toolId: number,
      effectiveness?: number,
      notes?: string
    ) => Promise<void>;

    // Codex entry methods
    loadRecentCodexEntries: () => Promise<void>;
    createCodexEntry: (entryData: any) => Promise<void>;
    quickJournalEntry: (
      promptId: string,
      content: string,
      entryType: 'journal' | 'draw' | 'voice'
    ) => Promise<void>;

    // Journal prompt methods
    loadAvailablePrompts: () => Promise<void>;
    loadCategoryPrompts: (unlockedAreas: string[], completedStories: string[]) => Promise<void>;
    refreshPrompts: () => Promise<void>;
    markPromptInactive: (promptId: string) => Promise<void>;

    // Home data
    loadHomeData: () => Promise<void>;
  };

  // ===== EQUIPMENT & INVENTORY STATE =====
  equipment: {
    inventory: EquipmentItem[];
    equippedItems: EquippedItems;
    backendGear: CharacterGear[];
    equippedGear: CharacterGear[];
    setInventory: (items: EquipmentItem[]) => void;
    setEquippedItems: (items: EquippedItems) => void;
    equipItem: (type: keyof EquippedItems, item: EquipmentItem) => void;
    unequipItem: (type: keyof EquippedItems) => void;
    getItemIcon: (item: EquipmentItem) => any;
    getRarityColors: (rarity: string) => string[];
    loadBackendGear: () => Promise<void>;
    equipBackendGear: (gearId: number) => Promise<void>;
    unequipBackendGear: (gearId: number) => Promise<void>;
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
    handleStoryComplete: (StoryId: string) => void;
    handleCodexEntry: (entry: Omit<CodexEntry, "id" | "timestamp">) => void;
    handleMiniGameComplete: (
      gameType: "thoughtDefender" | "drawing",
      data: any
    ) => void;
    handleArtifactUnlock: (artifact: MentalArtifact) => void;
    handleSkillLearned: (skills: string[]) => void;
    handleStoryRewardTracker: (rewardTracker: any) => void;
    setFinalRewardsArtifacts: (artifacts: MentalArtifact[]) => void;
    loadArchiveProgress: () => Promise<void>;
    saveArchiveProgress: () => Promise<void>;
  };

  // ===== UI STATE =====
  ui: {
    activeTab: string;
    researchCondition: "character" | "personality";
    isCodexVisible: boolean;
    isThoughtDefenderVisible: boolean;
    isMapVisible: boolean;
    isStoryVisible: boolean;
    isStoryCatalogVisible: boolean;
    currentMapRoomId: string;
    selectedStory: Story | null;
    memoryStorys: Story[];
    setActiveTab: (tab: string) => void;
    setResearchCondition: (condition: "character" | "personality") => void;
    setIsCodexVisible: (visible: boolean) => void;
    setIsThoughtDefenderVisible: (visible: boolean) => void;
    setIsMapVisible: (visible: boolean) => void;
    setIsStoryVisible: (visible: boolean) => void;
    setIsStoryCatalogVisible: (visible: boolean) => void;
    setCurrentMapRoomId: (roomId: string) => void;
    setSelectedStory: (story: Story | null) => void;
    setMemoryStorys: (Storys: Story[]) => void;
    openStory: (Story: Story) => void;
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

const MasterStateContext = createContext<MasterStateContextType | undefined>(
  undefined
);

export const useMasterState = () => {
  const context = useContext(MasterStateContext);
  if (context === undefined) {
    throw new Error("useMasterState must be used within a MasterStateProvider");
  }
  return context;
};

// ===== PROVIDER COMPONENT =====

interface MasterStateProviderProps {
  children: ReactNode;
}

export const MasterStateProvider: React.FC<MasterStateProviderProps> = ({
  children,
}) => {
  // ===== EXTERNAL CONTEXTS =====
  const { authToken, characterId, isTestUser, user, login, logout } = useAuth();
  const { theme, themeMode, toggleTheme, setThemeMode, styles, isDark } =
    useTheme();

  // ===== ONBOARDING STATE (LOCAL) =====
  const [isComplete, setIsComplete] = useState(false);
  const [assignedPath, setAssignedPath] = useState<"survey" | "character" | null>(null);
  const [researchGroup, setResearchGroup] = useState<string | null>("A"); // Default to A
  const [characterAppearance, setCharacterAppearance] = useState<Character | undefined>(undefined);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);



  const completeCharacter = async () => {
    try {
      // Call the backend to mark onboarding as complete with character path
      await apiService.completeOnboarding('character');
      
      // Update local state
      setIsComplete(true);
      setAssignedPath("character");
      setResearchGroup("A");
    } catch (error) {
      // Still update local state even if backend call fails
      setIsComplete(true);
      setAssignedPath("character");
      setResearchGroup("A");
    }
  };

  const resetOnboarding = () => {
    setIsComplete(false);
    setAssignedPath(null);
    setResearchGroup("A");
    setCharacterAppearance(undefined);
  };

  const setOnboardingLoading = (loading: boolean) => {
    setIsOnboardingLoading(loading);
  };

  // ===== LOAD USER ONBOARDING STATUS =====
  const loadUserOnboardingStatus = useCallback(async () => {
    if (!authToken) {
      return;
    }

    try {
      const status = await apiService.checkOnboardingStatus();

      // Check if this is a test/admin user
      const isTestOrAdmin = status.isTestUser || status.username === 'admin' || isTestUser;

      // Handle different onboarding states
      if (status.isOnboarded && !isTestOrAdmin) {
        // Regular user has completed onboarding - they should NOT see onboarding again
        setIsComplete(true);
        
        if (status.completionType) {
          // User has a proper completion type
          setAssignedPath(status.completionType as "survey" | "character");
          
          // Set research group based on completion type
          if (status.completionType === 'character') {
            setResearchGroup("A");
          } else if (status.completionType === 'survey') {
            setResearchGroup("B");
          } else {
            setResearchGroup("A"); // Default fallback
          }
        } else {
          // User completed onboarding but no completion type - treat as incomplete
          setIsComplete(false);
          setAssignedPath(null);
          setResearchGroup("A");
        }
      } else {
        // User hasn't completed onboarding OR is a test/admin user
        // Test/admin users should ALWAYS go through onboarding (for testing purposes)
        setIsComplete(false);
        setAssignedPath(null);
        setResearchGroup("A"); // Default to A
      }
    } catch (error: any) {
      // If it's a 404 error, the endpoint might not exist - that's okay
      if (error.response?.status === 404) {
        // On 404 error, default to incomplete onboarding
        setIsComplete(false);
        setAssignedPath(null);
        setResearchGroup("A");
      } else {
        // On other errors, default to incomplete onboarding
        setIsComplete(false);
        setAssignedPath(null);
        setResearchGroup("A");
      }
    }
  }, [authToken, isTestUser]);

  // ===== CHARACTER STATE (UPDATED FOR NEW BACKEND) =====
  const [backendCharacter, setBackendCharacter] =
    useState<Character | null>(null);

  // Local UI state for character creator (keeps your existing component working)
  const [characterName, setCharacterName] = useState("");
  const [selectedBaseModel, setSelectedBaseModel] = useState(0);
  const [selectedBaseColor, setSelectedBaseColor] = useState(0); // color index for base model

  const debugSetSelectedBaseColor = (value: number) => {
    console.log('[setSelectedBaseColor] value:', value);
    setSelectedBaseColor(value);
  }
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
  const [myTools, setMyTools] = useState<CharacterTool[]>([]);  const [equippedTools, setEquippedTools] = useState<CharacterTool[]>([]);
  const [recentCodexEntries, setRecentCodexEntries] = useState<CodexEntry[]>(
    []
  );
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  
  // Journal prompt state
  const [availablePrompts, setAvailablePrompts] = useState<JournalPrompt[]>([]);
  const [categoryPrompts, setCategoryPrompts] = useState<{
    journal: JournalPrompt | null;
    draw: JournalPrompt | null;
    voice: JournalPrompt | null;
  }>({
    journal: null,
    draw: null,
    voice: null,
  });

  // ===== EQUIPMENT STATE =====
  const [inventory, setInventory] = useState<EquipmentItem[]>([]);
  const [equippedItems, setEquippedItems] = useState<EquippedItems>({});
  const [backendGear, setBackendGear] = useState<CharacterGear[]>([]);
  const [equippedGear, setEquippedGear] = useState<CharacterGear[]>([]);

  // ===== ARCHIVE PROGRESS STATE =====
  const [completedStories, setCompletedStories] = useState<Set<string>>(
    new Set()
  );
  const [codexEntries, setCodexEntries] = useState<CodexEntry[]>([]);
  const [miniGameProgress, setMiniGameProgress] = useState<MiniGameProgress>({
    thoughtDefenderLevel: 0,
    thoughtDefenderScore: 0,
    thoughtDefenderWins: 0,
    drawingEntries: 0,
    totalGameTime: 0,
  });
  const [discoveredArtifacts, setDiscoveredArtifacts] = useState<
    MentalArtifact[]
  >([]);
  const [finalRewardsArtifacts, setFinalRewardsArtifacts] = useState<
    MentalArtifact[]
  >([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);

  // ===== UI STATE =====
  const [activeTab, setActiveTab] = useState("entrance");
  const [researchCondition, setResearchCondition] = useState<
    "character" | "personality"
  >("character");
  const [isCodexVisible, setIsCodexVisible] = useState(false);
  const [isThoughtDefenderVisible, setIsThoughtDefenderVisible] =
    useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [isStoryCatalogVisible, setIsStoryCatalogVisible] = useState(false);
  const [currentMapRoomId, setCurrentMapRoomId] = useState("");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [memoryStorys, setMemoryStorys] = useState<Story[]>([]);

  // ===== STORY STATE =====
  const [currentPassageId, setCurrentPassageId] = useState("start");
  const [totalStatGains, setTotalStatGains] = useState<{
    [key: string]: number;
  }>({});
  const [recentGains, setRecentGains] = useState<{ [key: string]: number }>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [storyLearnedSkills, setStoryLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<MentalArtifact | null>(null);

  // ===== LOADING STATE =====
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===== CHARACTER HELPER FUNCTIONS =====
  const getBaseIndex = () => {
    const baseModel = backendCharacter?.character_config?.selected_base_model ?? selectedBaseModel;
    const baseColor = backendCharacter?.character_config?.selected_base_color ?? selectedBaseColor; // only one base model
    return baseModel + baseColor * 12;
  };

  const getHairIndex = () => {
    const hairStyle = backendCharacter?.character_config?.selected_hair_style ?? selectedHairStyle;
    const hairColor = backendCharacter?.character_config?.selected_hair_color ?? selectedHairColor;
    return hairStyle + hairColor * 12;
  };
  const getClothesIndex = () => {
    const shirtType = backendCharacter?.character_config?.selected_shirt_type ?? selectedShirtType;
    return shirtType + selectedClothesColor * 12;
  };
  const getEyesIndex = () => {
    const eyeType = backendCharacter?.character_config?.selected_eye_type ?? selectedEyeType;
    const eyeColor = backendCharacter?.character_config?.selected_eye_color ?? selectedEyeColor;
    return eyeType + eyeColor * 12;
  };
  const getEyebrowsIndex = () => {
    const eyebrowStyle = backendCharacter?.character_config?.selected_eyebrow_style ?? selectedEyebrowStyle;
    const eyebrowColor = backendCharacter?.character_config?.selected_eyebrow_color ?? selectedEyebrowColor;
    return eyebrowStyle + eyebrowColor * 12;
  };

  // Asset getter functions (updated to use backend character data when available)
  const getHairAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const hairStyle = backendCharacter?.character_config?.selected_hair_style ?? selectedHairStyle;
    const hairColor = backendCharacter?.character_config?.selected_hair_color ?? selectedHairColor;
    
    const hairArrays = [
      hairOptionsBlack,
      hairOptionsBlonde,
      hairOptionsBlue,
      hairOptionsBlueGreen,
      hairOptionsBrown1,
      hairOptionsBrown2,
      hairOptionsBrown3,
      hairOptionsDarkBlue,
      hairOptionsGreen,
      hairOptionsLightGreen,
      hairOptionsLilac,
      hairOptionsMagent,
      hairOptionsOrange,
      hairOptionsPink,
      hairOptionsRed,
      hairOptionsWhite,
    ];
    const colorArray = hairArrays[hairColor] || hairOptionsBlack;
    return colorArray[hairStyle] || colorArray[0];
  };

  const getClothesAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const shirtType = backendCharacter?.character_config?.selected_shirt_type ?? selectedShirtType;
    // For now, use a default color since the API doesn't provide clothes color in character_config
    const clothesColor = selectedClothesColor;
    
    const clothesArrays = [
      clothesOptionsBrown,
      clothesOptionsBlonde,
      clothesOptionsBlue,
      clothesOptionsBlueGreen,
      clothesOptionsDarkBrown,
      clothesOptionsDarkBlue,
      clothesOptionsDark,
      clothesOptionsGreen,
      clothesOptionsLightBrown,
      clothesOptionsLightGreen,
      clothesOptionsLilac,
      clothesOptionsMagent,
      clothesOptionsOrange,
      clothesOptionsPink,
      clothesOptionsRed,
      clothesOptionsWhite,
    ];
    const colorArray =
      clothesArrays[clothesColor || 0] || clothesOptionsBrown;
    return colorArray[shirtType] || colorArray[0];
  };

  const getEyesAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const eyeType = backendCharacter?.character_config?.selected_eye_type ?? selectedEyeType;
    const eyeColor = backendCharacter?.character_config?.selected_eye_color ?? selectedEyeColor;
    
    const eyesArrays = [
      eyesOptionsBrown,
      eyesOptionsBlonde,
      eyesOptionsBlue,
      eyesOptionsBlueGreen,
      eyesOptionsDarkBrown,
      eyesOptionsDarkBlue,
      eyesOptionsDark,
      eyesOptionsGreen,
      eyesOptionsLightBrown,
      eyesOptionsLightGreen,
      eyesOptionsLilac,
      eyesOptionsMagent,
      eyesOptionsOrange,
      eyesOptionsPink,
      eyesOptionsRed,
      eyesOptionsWhite,
    ];
    const colorArray = eyesArrays[eyeColor] || eyesOptionsBrown;
    return colorArray[eyeType] || colorArray[0];
  };

  const getEyebrowsAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const eyebrowStyle = backendCharacter?.character_config?.selected_eyebrow_style ?? selectedEyebrowStyle;
    const eyebrowColor = backendCharacter?.character_config?.selected_eyebrow_color ?? selectedEyebrowColor;
    
    const eyebrowsArrays = [
      eyebrowsOptionsBrown,
      eyebrowsOptionsBlonde,
      eyebrowsOptionsBlue,
      eyebrowsOptionsBlueGreen,
      eyebrowsOptionsDarkBrown,
      eyebrowsOptionsDarkBlue,
      eyebrowsOptionsDark,
      eyebrowsOptionsGreen,
      eyebrowsOptionsLightBrown,
      eyebrowsOptionsLightGreen,
      eyebrowsOptionsLilac,
      eyebrowsOptionsMagent,
      eyebrowsOptionsOrange,
      eyebrowsOptionsPink,
      eyebrowsOptionsRed,
      eyebrowsOptionsWhite,
    ];
    const colorArray =
      eyebrowsArrays[eyebrowColor] || eyebrowsOptionsBrown;
    return colorArray[eyebrowStyle] || colorArray[0];
  };

  const getCurrentBackgroundAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const backgroundType = backendCharacter?.character_config?.selected_background_type ?? selectedBackgroundType;
    // For now, use a default color since the API doesn't provide background color in character_config
    const backgroundColor = selectedBackgroundColor;
    
    const backgroundColorArrays = [
      bgOptionsBrown,
      bgOptionsBlonde,
      bgOptionsBlue,
      bgOptionsBlueGreen,
      bgOptionsDarkBrown,
      bgOptionsDarkBlue,
      bgOptionsDark,
      bgOptionsGreen,
      bgOptionsLightBrown,
      bgOptionsLightGreen,
      bgOptionsLilac,
      bgOptionsMagent,
      bgOptionsOrange,
      bgOptionsPink,
      bgOptionsRed,
      bgOptionsWhite,
    ];
    const colorArray =
      backgroundColorArrays[backgroundColor || 0] || bgOptionsBrown;
    return colorArray[backgroundType] || colorArray[0];
  };

  const getBaseAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const baseColor = backendCharacter?.character_config?.selected_base_color ?? selectedBaseColor;
    console.log('[getBaseAsset] selectedBaseColor:', baseColor);
    // The base asset should be the skin color - use selectedBaseColor to get the correct base file
    const asset = baseOptions[baseColor] || baseOptions[0];
    console.log('[getBaseAsset] using asset:', asset);
    return asset;
  };

  const getMouthAsset = () => {
    // Use backend character data if available, otherwise fall back to local state
    const mouthType = backendCharacter?.character_config?.selected_mouth_type ?? selectedMouthType;
    return mouthOptions[mouthType] || mouthOptions[0];
  };

  // ===== EQUIPMENT HELPER FUNCTIONS =====
  const getItemIcon = (item: EquipmentItem) => {
    return require("../../assets/equipment/armor/fb1857.png");
  };

  const getRarityColors = (rarity: string): string[] => {
    switch (rarity) {
      case "Legendary":
        return ["#F97316", "#FCD34D"];
      case "Epic":
        return ["#A855F7", "#F472B6"];
      case "Rare":
        return ["#3B82F6", "#06B6D4"];
      default:
        return ["#6B7280", "#9CA3AF"];
    }
  };

  const equipItem = (type: keyof EquippedItems, item: EquipmentItem) => {
    setEquippedItems((prev) => ({ ...prev, [type]: item }));
  };

  const unequipItem = (type: keyof EquippedItems) => {
    setEquippedItems((prev) => {
      const newItems = { ...prev };
      delete newItems[type];
      return newItems;
    });
  };

  // ===== BACKEND GEAR INTEGRATION =====
  const loadBackendGear = async () => {
    try {
      const [myGear, equippedGearData] = await Promise.all([
        apiService.getMyGear(),
        apiService.getEquippedGear()
      ]);
      
      setBackendGear(myGear);
      setEquippedGear(equippedGearData);
      
      // Convert backend gear to frontend equipment format
      const convertedInventory: EquipmentItem[] = myGear.map(gear => ({
        id: gear.id.toString(),
        name: gear.gear_type.name,
        type: mapBackendSlotToFrontendType(gear.gear_type.slot),
        subtype: mapBackendGearToSubtype(gear.gear_type.name, gear.gear_type.slot),
        description: gear.gear_type.description,
        unlockCondition: 'Unlocked through story completion',
        wellnessStats: gear.gear_type.stat_bonuses,
        effect: `Provides ${Object.entries(gear.gear_type.stat_bonuses).map(([stat, value]) => `${stat} +${value}`).join(', ')}`,
        rarity: 'common',
        level: 1
      }));
      
      setInventory(convertedInventory);
      
      // Convert equipped gear to frontend format
      const convertedEquippedItems: EquippedItems = {};
      equippedGearData.forEach(gear => {
        const frontendType = mapBackendSlotToFrontendType(gear.gear_type.slot);
        convertedEquippedItems[frontendType] = {
          id: gear.id.toString(),
          name: gear.gear_type.name,
          type: frontendType,
          subtype: mapBackendGearToSubtype(gear.gear_type.name, gear.gear_type.slot),
          description: gear.gear_type.description,
          unlockCondition: 'Unlocked through story completion',
          wellnessStats: gear.gear_type.stat_bonuses,
          effect: `Provides ${Object.entries(gear.gear_type.stat_bonuses).map(([stat, value]) => `${stat} +${value}`).join(', ')}`,
          rarity: 'common',
          level: 1
        };
      });
      
      setEquippedItems(convertedEquippedItems);
    } catch (error) {
      // Keep empty state if backend fails
    }
  };

  const mapBackendSlotToFrontendType = (slot: 'weapon' | 'armor' | 'helmet' | 'boots'): keyof EquippedItems => {
    switch (slot) {
      case 'weapon': return 'focus';
      case 'armor': return 'comfort';
      case 'helmet': return 'shield';
      case 'boots': return 'ground';
      default: return 'focus';
    }
  };

  const mapBackendGearToSubtype = (gearName: string, slot: 'weapon' | 'armor' | 'helmet' | 'boots'): EquipmentSubtype => {
    const name = gearName.toLowerCase();
    
    switch (slot) {
      case 'weapon':
        // Story reward items
        if (name.includes('ancient scroll')) return 'meditation';
        if (name.includes('clarity lens')) return 'meditation';
        if (name.includes('explorer') && name.includes('notebook')) return 'journaling';
        if (name.includes('intuition compass')) return 'meditation';
        if (name.includes('empathy conduit')) return 'meditation';
        if (name.includes('toolkit story')) return 'meditation';
        
        // Generic weapon types
        if (name.includes('meditation') || name.includes('breathing')) return 'meditation';
        if (name.includes('journal')) return 'journaling';
        return 'meditation'; // default for focus items
        
      case 'armor':
        // Story reward items
        if (name.includes('personal style cloak')) return 'social';
        if (name.includes('cultural wisdom wrap')) return 'social';
        if (name.includes('adaptation shield')) return 'social';
        if (name.includes('sanctuary shroud')) return 'social';
        
        // Generic armor types
        if (name.includes('social') || name.includes('friend')) return 'social';
        if (name.includes('hobby') || name.includes('activity')) return 'hobby';
        if (name.includes('nature') || name.includes('outdoor')) return 'nature';
        return 'social'; // default for comfort items
        
      case 'helmet':
        // Story reward items
        if (name.includes('reality filter')) return 'boundary';
        if (name.includes('growth mindset crown')) return 'affirmation';
        if (name.includes('authenticity guard')) return 'boundary';
        if (name.includes('guardian ward')) return 'boundary';
        
        // Generic helmet types
        if (name.includes('boundary') || name.includes('limit')) return 'boundary';
        if (name.includes('affirmation') || name.includes('positive')) return 'affirmation';
        if (name.includes('routine') || name.includes('habit')) return 'routine';
        return 'boundary'; // default for shield items
        
      case 'boots':
        // Story reward items
        if (name.includes('personal values foundation')) return 'exercise';
        if (name.includes('support network roots')) return 'exercise';
        if (name.includes('self-compassion stone')) return 'exercise';
        if (name.includes('foundation stone')) return 'exercise';
        
        // Generic boot types
        if (name.includes('exercise') || name.includes('movement')) return 'exercise';
        if (name.includes('sleep') || name.includes('rest')) return 'sleep';
        if (name.includes('nutrition') || name.includes('food')) return 'nutrition';
        return 'exercise'; // default for ground items
        
      default:
        return 'meditation';
    }
  };

  const equipBackendGear = async (gearId: number) => {
    try {
      const result = await apiService.equipGear(gearId);
      await loadBackendGear(); // Reload gear data
    } catch (error) {
      Alert.alert('Error', 'Failed to equip gear. Please try again.');
    }
  };

  const unequipBackendGear = async (gearId: number) => {
    try {
      const result = await apiService.unequipGear(gearId);
      await loadBackendGear(); // Reload gear data
    } catch (error) {
      Alert.alert('Error', 'Failed to unequip gear. Please try again.');
    }
  };

  // ===== ARCHIVE PROGRESS CALCULATIONS ===== needs to be iplemeted with story progress
  const calculateFoundationValues = useMemo(() => {
    const baseValues = {
      "Sight Beyond Sight": 2,
      "Unbreakable Will": 2,
      "Heart's Compass": 2,
      "Elemental Harmony": 2,
    };

    // Add points from completed stories
    completedStories.forEach((storyId) => {
      const story = memoryStorys.find((g: Story) => g.id === Number(storyId));
      if (story && story.skillFocus) {
        story.skillFocus.forEach((skill: string) => {
          if (
            skill.includes("Mindful") ||
            skill.includes("Stress") ||
            skill.includes("Academic")
          ) {
            baseValues["Sight Beyond Sight"] += 3;
          }
          if (
            skill.includes("Self-Compassion") ||
            skill.includes("Growth") ||
            skill.includes("Inner Critic")
          ) {
            baseValues["Unbreakable Will"] += 3;
          }
          if (
            skill.includes("Social") ||
            skill.includes("Anxiety") ||
            skill.includes("Authentic")
          ) {
            baseValues["Heart's Compass"] += 3;
          }
          if (
            skill.includes("Balance") ||
            skill.includes("Time") ||
            skill.includes("Self-Care")
          ) {
            baseValues["Elemental Harmony"] += 3;
          }
        });
      }
    });    // Add points from codex entries
    codexEntries.forEach((entry) => {
      switch (entry.skillCategory) {
        case "Emotional Awareness":
        case "mindfulness":
          baseValues["Sight Beyond Sight"] += 2;
          break;
        case "Self-Compassion":
        case "Personal Growth":
          baseValues["Unbreakable Will"] += 2;
          break;
        case "Social Connection":
        case "empathy":
          baseValues["Heart's Compass"] += 2;
          break;
        case "Stress Management":
        case "harmony":
          baseValues["Elemental Harmony"] += 2;
          break;
        default:
          Object.keys(baseValues).forEach((key) => {
            baseValues[key as keyof typeof baseValues] += 1;
          });
      }
    });

    // Add points from mini-game achievements
    if (miniGameProgress.thoughtDefenderWins > 0) {
      baseValues["Unbreakable Will"] +=
        miniGameProgress.thoughtDefenderWins * 2;
      baseValues["Sight Beyond Sight"] += miniGameProgress.thoughtDefenderWins;
    }

    if (miniGameProgress.thoughtDefenderLevel > 0) {
      baseValues["Unbreakable Will"] += miniGameProgress.thoughtDefenderLevel;
    }

    if (miniGameProgress.drawingEntries > 0) {
      baseValues["Elemental Harmony"] += miniGameProgress.drawingEntries * 2;
      baseValues["Heart's Compass"] += miniGameProgress.drawingEntries;
    }

    // Cap all values at maxValue (20)
    Object.keys(baseValues).forEach((key) => {
      baseValues[key as keyof typeof baseValues] = Math.min(
        20,
        baseValues[key as keyof typeof baseValues]
      );
    });

    return baseValues;
  }, [completedStories, codexEntries, miniGameProgress, memoryStorys]);

  const getNextUnlock = (foundationLabel: string, currentValue: number) => { // needs to be implemented with story progress
    const nextLevel = Math.floor(currentValue / 5) + 1;
    const unlocks = {
      "Sight Beyond Sight": [
        "Enhanced Perception - See through deceptive thoughts",
        "Mindful Awareness - Present moment clarity",
        "Pattern Recognition - Identify thought cycles",
        "Truth Sight - Distinguish reality from illusion",
      ],
      "Unbreakable Will": [
        "Iron Resolve - Resist overwhelming stress",
        "Steadfast Determination - Maintain focus under pressure",
        "Unshakeable Core - Weather emotional storms",
        "Indomitable Spirit - Rise above all challenges",
      ],
      "Heart's Compass": [
        "Empathic Mastery - Deep emotional understanding",
        "Connection Wisdom - Navigate relationships skillfully",
        "Compassionate Leadership - Guide others with heart",
        "Universal Love - Embrace all beings with kindness",
      ],
      "Elemental Harmony": [
        "Life Equilibrium - Perfect work-life balance",
        "Flow State Mastery - Effortless action and presence",
        "Cosmic Alignment - Harmony with universal forces",
        "Transcendent Balance - Beyond duality and conflict",
      ],
    };

    const foundationUnlocks = unlocks[foundationLabel as keyof typeof unlocks];
    return foundationUnlocks?.[nextLevel - 1] || "Mastery achieved";
  };

  const archiveFoundations = useMemo(() => { // needs to be implemented with story progress
    const newValues = calculateFoundationValues;

    return [
      {
        icon: "👁️",
        label: "Sight Beyond Sight",
        value: newValues["Sight Beyond Sight"],
        maxValue: 20,
        colors: ["#3B82F6", "#06B6D4"],
        description:
          "Your ability to perceive hidden truths and see through illusions of the mind",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Sight Beyond Sight",
          newValues["Sight Beyond Sight"]
        ),
        storyTriggers: [
          "mindfulness_practice",
          "reflection_moments",
          "self_awareness_choices",
        ],
      },
      {
        icon: "⚓",
        label: "Unbreakable Will",
        value: newValues["Unbreakable Will"],
        maxValue: 20,
        colors: ["#059669", "#10B981"],
        description:
          "The fortified strength of your spirit against the storms of adversity",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Unbreakable Will",
          newValues["Unbreakable Will"]
        ),
        storyTriggers: [
          "perseverance_choices",
          "facing_fears",
          "overcoming_obstacles",
        ],
      },
      {
        icon: "🔗",
        label: "Heart's Compass",
        value: newValues["Heart's Compass"],
        maxValue: 20,
        colors: ["#DC2626", "#F472B6"],
        description:
          "Your power to forge meaningful bonds and navigate the realm of emotions",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Heart's Compass",
          newValues["Heart's Compass"]
        ),
        storyTriggers: [
          "connection_choices",
          "helping_others",
          "vulnerability_moments",
        ],
      },
      {
        icon: "⚖️",
        label: "Elemental Harmony",
        value: newValues["Elemental Harmony"],
        maxValue: 20,
        colors: ["#D97706", "#FCD34D"],
        description:
          "Mastery over the delicate balance between all aspects of your existence",
        recentGain: 0,
        nextUnlock: getNextUnlock(
          "Elemental Harmony",
          newValues["Elemental Harmony"]
        ),
        storyTriggers: [
          "balance_choices",
          "priority_setting",
          "self_care_actions",
        ],
      },
    ];
  }, [calculateFoundationValues]);

  const restorationMetrics = useMemo(
    () => ({
      chroniclesExplored: completedStories.size,
      artifactsDiscovered:
        discoveredArtifacts.length + finalRewardsArtifacts.length,
      revelationsUnlocked: learnedSkills.length,
    }),
    [
      completedStories,
      discoveredArtifacts,
      finalRewardsArtifacts,
      learnedSkills,
    ]
  );

  // ===== ARCHIVE PROGRESS HANDLERS =====
  const handleStoryComplete = (StoryId: string) => { //handle for story completetion here - story end set yo end
    setCompletedStories((prev) => new Set([...prev, StoryId]));
  };

  const handleCodexEntry = (entry: Omit<CodexEntry, "id" | "timestamp">) => { //needs to be extended for awards 
    const newEntry = {
      id: Date.now().toString(),
      ...entry,
      timestamp: Date.now(),
    };
    setCodexEntries((prev) => [...prev, newEntry]);
  };

  const handleMiniGameComplete = ( //mini game rewards
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => {
    if (gameType === "thoughtDefender") {
      setMiniGameProgress((prev) => ({
        ...prev,
        thoughtDefenderLevel: Math.max(
          prev.thoughtDefenderLevel,
          data.level || 0
        ),
        thoughtDefenderScore: Math.max(
          prev.thoughtDefenderScore,
          data.score || 0
        ),
        thoughtDefenderWins: prev.thoughtDefenderWins + (data.won ? 1 : 0),
        totalGameTime: prev.totalGameTime + (data.gameTime || 0),
      }));
    } else if (gameType === "drawing") {
      setMiniGameProgress((prev) => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1,
      }));
    }
  };

  // ===== NEW REWARD SYSTEM HANDLERS =====
  const handleStoryRewardTracker = (rewardTracker: any) => {
    // This will be called when a story is completed with accumulated rewards
    
    // Update archive progress with the rewards
    if (rewardTracker.totalStatGains) {
      // Apply stat gains to character
      Object.entries(rewardTracker.totalStatGains).forEach(([stat, value]) => {
        if (typeof value === 'number' && value > 0) {
          // Update character stats through the backend
          if (backendCharacter) {
            gainExperience(value, `story_${rewardTracker.storyId}`);
          }
        }
      });
    }
    
    // Handle final rewards and skills
    if (rewardTracker.finalRewards && rewardTracker.finalRewards.length > 0) {
      rewardTracker.finalRewards.forEach((reward: string) => {
        handleArtifactUnlock({ 
          name: reward, 
          type: 'story_reward', 
          equipped: false, 
          resonance: 1, 
          description: `Earned from story completion`, 
          rarity: 'Common' as any 
        });
      });
    }
    
    if (rewardTracker.skillsLearned && rewardTracker.skillsLearned.length > 0) {
      handleSkillLearned(rewardTracker.skillsLearned);
    }
  };

  const handleArtifactUnlock = (artifact: MentalArtifact) => { // gear unlock and rewrds - gained from story/journal
    if (
      !discoveredArtifacts.find((a) => a.name === artifact.name) &&
      !finalRewardsArtifacts.find((a) => a.name === artifact.name)
    ) {
      setDiscoveredArtifacts((prev) => [...prev, artifact]);
    }
  };

  const handleSkillLearned = (skills: string[]) => { //skills learned from story/journal
    setLearnedSkills((prev) => [...new Set([...prev, ...skills])]);
  };

  // ===== NEW CHARACTER CREATION HANDLERS (UPDATED FOR NEW BACKEND) =====
  const createCharacter = async () => {//character creation
    
    if (!authToken) {
      setError("No authentication token");
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

      // Complete onboarding - await this to ensure it completes before continuing
      await completeCharacter();

      // Load additional data (temporarily disabled until backend endpoints are implemented)
      // await memoizedLoadHomeData();
      // await memoizedLoadAvailableTools();
      // await memoizedLoadMyTools();
    } catch (error: any) {
      setError(
        "Failed to create character: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async () => {
    if (!authToken || !backendCharacter) {
      setError("No authentication token or character");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCharacter =
        await appearanceService.updateCharacterCustomization(
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
      setError(
        "Failed to update character: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };



  const gainExperience = async (amount: number, source?: string) => {
    if (!backendCharacter) {
      setError("No character loaded");
      return;
    }

    try {
      const result = await appearanceService.gainExperience(
        backendCharacter.id,
        amount,
        source
      );
      setBackendCharacter(result);

      if (result.level_up) {
        Alert.alert(
          "🎉 Level Up!",
          `Congratulations! You gained ${result.levels_gained} level(s)!`,
          [{ text: "Awesome!", style: "default" }]
        );
      }
    } catch (error: any) {
      setError(
        "Failed to gain experience: " + (error?.message || "Unknown error")
      );
    }
  };

  const gainWellness = async (gains: Record<string, number>) => {
    if (!backendCharacter) {
      setError("No character loaded");
      return;
    }

    try {
      const result = await appearanceService.gainWellness(
        backendCharacter.id,
        gains
      );
      setBackendCharacter(result);

      Alert.alert("✨ Wellness Increased!", result.message, [
        { text: "Great!", style: "default" },
      ]);
    } catch (error: any) {
      setError(
        "Failed to gain wellness: " + (error?.message || "Unknown error")
      );
    }
  };



  const acquireTool = async (toolId: number) => {
    try {
      await appearanceService.acquireCopingTool(toolId);
      await memoizedLoadMyTools(); // Refresh tools

      Alert.alert("🛠️ Tool Acquired!", "You have acquired a new coping tool!", [
        { text: "Excellent!", style: "default" },
      ]);
    } catch (error: any) {
      setError(
        "Failed to acquire tool: " + (error?.message || "Unknown error")
      );
    }
  };

  const equipTool = async (toolId: number) => {
    try {
      await appearanceService.equipTool(toolId);
      await memoizedLoadMyTools(); // Refresh tools
    } catch (error: any) {
      setError("Failed to equip tool: " + (error?.message || "Unknown error"));
    }
  };

  const unequipTool = async (toolId: number) => {
    try {
      await apiService.unequipTool(toolId);
      await memoizedLoadMyTools(); // Refresh tools
    } catch (error: any) {
      setError(
        "Failed to unequip tool: " + (error?.message || "Unknown error")
      );
    }
  };

  const useTool = async (
    toolId: number,
    effectiveness?: number,
    notes?: string
  ) => {
    try {
      await appearanceService.useTool(toolId, effectiveness, notes);
      await memoizedLoadMyTools(); // Refresh tools

      Alert.alert("🌟 Tool Used!", "Your tool usage has been recorded.", [
        { text: "Great!", style: "default" },
      ]);
    } catch (error: any) {
      setError("Failed to use tool: " + (error?.message || "Unknown error"));
    }
  };
  const createCodexEntry = async (entryData: any) => {
    try {
      await appearanceService.createCodexEntry(entryData);
      await memoizedLoadRecentCodexEntries(); // Refresh entries
    } catch (error: any) {
      setError(
        "Failed to create entry: " + (error?.message || "Unknown error")
      );
      throw error; // Re-throw so the calling component can handle it
    }
  };
  const quickJournalEntry = async (
    promptText: string,
    content: string,
    entryType: 'journal' | 'draw' | 'voice'
  ) => {
    try {
      await appearanceService.createCodexEntry({
        prompt: promptText,
        entry_type: entryType,
        content: content,
      });
      await memoizedLoadRecentCodexEntries(); // Refresh entries

      Alert.alert(
        "✨ Entry Saved!",
        "Your journal entry has been captured.",
        [{ text: "Thank you!", style: "default" }]
      );
    } catch (error: any) {
      setError(
        "Failed to save journal entry: " +
          (error?.message || "Unknown error")
      );
    }
  };

  // ===== JOURNAL PROMPT METHODS =====
  const memoizedLoadAvailablePrompts = useCallback(async () => {
    try {
      const prompts = await apiService.getFilteredJournalPrompts({ isActive: true });
      setAvailablePrompts(prompts);
    } catch (error: any) {
      // Handle 401 and 404 errors gracefully - these endpoints might not be implemented yet
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        // Journal prompts endpoint not available
      }
      setAvailablePrompts([]);
    }
  }, []);

  const loadCategoryPrompts = async (unlockedAreas: string[], completedStories: string[]) => {
    try {
      const prompts = await apiService.getPromptsByCategory(unlockedAreas, completedStories);
      setCategoryPrompts(prompts);
    } catch (error: any) {
      // Handle 401 and 404 errors gracefully - these endpoints might not be implemented yet
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        // Category prompts endpoint not available
      }
      setCategoryPrompts({
        journal: null,
        draw: null,
        voice: null,
      });
    }
  };

  const memoizedLoadCategoryPrompts = useCallback(async (unlockedAreas: string[], completedStories: string[]) => {
    try {
      const prompts = await apiService.getPromptsByCategory(unlockedAreas, completedStories);
      setCategoryPrompts(prompts);
    } catch (error: any) {
      // Handle 401 and 404 errors gracefully - these endpoints might not be implemented yet
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        // Category prompts endpoint not available
      }
      setCategoryPrompts({
        journal: null,
        draw: null,
        voice: null,
      });
    }
  }, []);

  const memoizedRefreshPrompts = useCallback(async () => {
    try {
      // Get current unlocked areas and completed stories from the archive state
      const unlockedAreas = Array.from(completedStories); // You may need to adjust this logic
      const completedStoriesArray = Array.from(completedStories);
      
      // Reload both available prompts and category-specific prompts
      await Promise.all([
        memoizedLoadAvailablePrompts(),
        loadCategoryPrompts(unlockedAreas, completedStoriesArray)
      ]);
    } catch (error) {
      // Error refreshing prompts
    }
  }, [completedStories]);

  // ===== ARCHIVE PROGRESS PERSISTENCE =====
  const loadArchiveProgress = async () => {
    // This would be implemented when archive backend is ready
  };

  const saveArchiveProgress = async () => {
    // This would be implemented when archive backend is ready
  };

  // ===== UI HANDLERS =====
  const openStory = (Story: Story) => {
    setSelectedStory(Story);
    setIsStoryVisible(true);
  };

  const closeStory = () => {
    setIsStoryVisible(false);
    setSelectedStory(null);
  };

  // ===== STORY HANDLERS =====
  const handleChoice = (choice: any) => {
    const {
      next,
      statEffects,
      skillsLearned,
      artifactUnlock,
      isEnding,
      finalRewards,
      wisdomGained,
    } = choice;

    // Handle stat effects
    if (statEffects) {
      const newRecentGains: { [key: string]: number } = {};

      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains((prev) => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number),
        }));
      });

      setRecentGains(newRecentGains);
      setShowStatGain(true);

      setTimeout(() => setShowStatGain(false), 2000);
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setStoryLearnedSkills((prev) => [...prev, ...skillsLearned]);
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
        "📚 Story Mastered! ✨",
        `Your journey has transformed your understanding.`,
        [{ text: "Continue Exploring", style: "default" }]
      );
      closeStory();
    } else if (next) {
      setTimeout(() => setCurrentPassageId(next), 500);
    }
  };

  const resetStoryState = () => {
    setCurrentPassageId("start");
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



  // Memoize the functions to prevent unnecessary re-renders
  const memoizedLoadCharacter = useCallback(async () => {
    if (!authToken) {
      return;
    }

    setIsLoading(true);
    try {
      const characterData = await appearanceService.getMyCharacter();

      if (characterData) {
        setBackendCharacter(characterData);

        // Sync UI state with backend data using the mapping function
        const frontendData =
          appearanceService.mapBackendToFrontend(characterData);
        setCharacterName(characterData.name || "");
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
    } catch (error: any) {
      // Don't set error state for load failures as they might be expected
      if (error.response?.status === 404) {
        // Character endpoint not found (404) - this is expected if the endpoint is not implemented
      } else {
        // Error loading character
      }
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const memoizedLoadAvailableTools = useCallback(async () => {
    try {
      const tools = await appearanceService.getAvailableCopingTools();
      setAvailableTools(tools);
    } catch (error: any) {
      // Handle error silently
      if (error.response?.status === 404) {
        // Available tools endpoint not found (404) - this is expected if the endpoint is not implemented
      } else {
        // Error loading available tools
      }
    }
  }, []);

  const memoizedLoadMyTools = useCallback(async () => {
    try {
      const tools = await appearanceService.getMyTools();
      setMyTools(tools);
      setEquippedTools(tools.filter((tool) => tool.is_equipped));
    } catch (error: any) {
      // Handle error silently
      if (error.response?.status === 404) {
        // My tools endpoint not found (404) - this is expected if the endpoint is not implemented
      } else {
        // Error loading my tools
      }
    }
  }, []);

  const memoizedLoadRecentCodexEntries = useCallback(async () => {
    try {
      const entries = await appearanceService.getRecentCodexEntries();
      setRecentCodexEntries(entries);
    } catch (error: any) {
      // Handle error silently
      if (error.response?.status === 404) {
        // Recent codex entries endpoint not found (404) - this is expected if the endpoint is not implemented
      } else {
        // Error loading recent codex entries
      }
    }
  }, []);

  const memoizedLoadHomeData = useCallback(async () => {
    try {
      const data = await appearanceService.getHomeData();
      setHomeData(data);
    } catch (error: any) {
      // Handle error silently
      if (error.response?.status === 404) {
        // Home data endpoint not found (404) - this is expected if the endpoint is not implemented
      } else {
        // Error loading home data
      }
    }
  }, []);

  const memoizedMarkPromptInactive = useCallback(async (promptId: string) => {
    try {
      await apiService.markJournalPromptInactive(promptId);
    } catch (error) {
      throw error;
    }
  }, []);

  // Update the useEffect to use memoized functions
  useEffect(() => {
    // Only load data when we have both token AND user data AND this is from a fresh login
    // Don't automatically load data on startup with stored token
    
    // Initialize the API service
    const initializeApiService = async () => {
      try {
        await apiService.initialize();
      } catch (error) {
        console.error('MasterStateContext: Failed to initialize API service:', error);
      }
    };
    
    // Always initialize the API service
    initializeApiService();
    
    // Load onboarding status if we have an auth token
    if (authToken) {
      loadUserOnboardingStatus();
    } else {
      console.log('MasterStateContext: No auth token, skipping data load');
    }
    
  }, [authToken, user, loadUserOnboardingStatus, memoizedLoadCharacter, memoizedLoadHomeData, loadBackendGear]);

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
      isComplete,
      assignedPath,
      researchGroup,
      characterAppearance,
      isLoading: isOnboardingLoading,
      completeCharacter,
      setAssignedPath,
      setCharacterAppearance,
      resetOnboarding,
      setIsLoading: setOnboardingLoading,
      loadOnboardingStatus: loadUserOnboardingStatus,
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
      selectedBaseColor,
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
      setSelectedBaseColor: debugSetSelectedBaseColor,
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
      getBaseIndex,
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
      loadCharacter: memoizedLoadCharacter,
      gainExperience,
      gainWellness,
    },
    wellness: {
      availableTools,
      myTools,
      equippedTools,
      recentCodexEntries,
      homeData,
      availablePrompts,
      categoryPrompts,
      loadAvailableTools: memoizedLoadAvailableTools,
      loadMyTools: memoizedLoadMyTools,
      acquireTool,
      equipTool,
      unequipTool,
      useTool,
      loadRecentCodexEntries: memoizedLoadRecentCodexEntries,
      createCodexEntry,
      quickJournalEntry,
      loadAvailablePrompts: memoizedLoadAvailablePrompts,
      loadCategoryPrompts: memoizedLoadCategoryPrompts,
      refreshPrompts: memoizedRefreshPrompts,
      markPromptInactive: memoizedMarkPromptInactive,
      loadHomeData: memoizedLoadHomeData,
    },
    equipment: {
      inventory,
      equippedItems,
      backendGear,
      equippedGear,
      setInventory,
      setEquippedItems,
      equipItem,
      unequipItem,
      getItemIcon,
      getRarityColors,
      loadBackendGear,
      equipBackendGear,
      unequipBackendGear,
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
      handleStoryRewardTracker,
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
      memoryStorys,
      setActiveTab,
      setResearchCondition,
      setIsCodexVisible,
      setIsThoughtDefenderVisible,
      setIsMapVisible,
      setIsStoryVisible,
      setIsStoryCatalogVisible,
      setCurrentMapRoomId,
      setSelectedStory,
      setMemoryStorys,
      openStory,
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
