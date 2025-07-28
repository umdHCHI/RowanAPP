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
import { apiService } from "../services";
import {
  CharacterGear,
  CharacterTool,
  CopingTool,
  HomeData,
} from "../services/apiService";
import { Character, CodexEntry, EquipmentItem, EquipmentSubtype, EquippedItems, JournalPrompt, MiniGameProgress, Story } from "../types";
import { CategoryConfig, createCharacterCreatorCategories, UserProfile } from "../types/user";
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
    loginTheme: any;
    onboardingTheme: any;
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

    // Character creator categories (memoized)
    styleCategories: CategoryConfig[];
    colorCategories: CategoryConfig[];

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
    getCharacterName: () => string;
    getBaseIndex: () => number;
    getHairIndex: () => number;
    getClothesIndex: () => number;
    getEyesIndex: () => number;
    getEyebrowsIndex: () => number;
    getHairAsset: (useLocalState?: boolean) => any;
    getClothesAsset: (useLocalState?: boolean) => any;
    getEyesAsset: (useLocalState?: boolean) => any;
    getEyebrowsAsset: (useLocalState?: boolean) => any;
    getCurrentBackgroundAsset: (useLocalState?: boolean) => any;
    getBaseAsset: (useLocalState?: boolean) => any;
    getMouthAsset: (useLocalState?: boolean) => any;
    createCharacter: () => Promise<void>;
    updateCharacter: () => Promise<void>;
    loadCharacter: () => Promise<void>;
    gainExperience: (amount: number, source?: string) => Promise<void>;
    gainResonance: (amount: number, source?: string) => Promise<void>;
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
    createCodexEntry: (entryData: {
        prompt: number;
        entry_type: 'journal' | 'draw' | 'voice';
        content: string;
    }) => Promise<void>;
    quickJournalEntry: (
      promptId: number, // Changed from string to number
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
    // New upgrade system functions
    acquireEquipmentWithUpgrade: (itemName: string, storyId?: string) => Promise<any>;
    getPlayerInventory: () => string[];
    getStoryReplayCount: (storyId: string) => number;
    handleEquipmentUpgrade: (upgradeResult: any) => void;
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
  const { theme, themeMode, toggleTheme, setThemeMode, styles, isDark, loginTheme, onboardingTheme } =
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

  // REMOVED: debugSetSelectedBaseColor - no longer needed
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
    const baseModel = backendCharacter?.selected_base_model ?? selectedBaseModel;
    const baseColor = backendCharacter?.selected_skin_color ?? selectedBaseColor; // only one base model
    return baseModel + baseColor * 12;
  };

  // ===== CHARACTER CREATOR CATEGORIES (MEMOIZED) =====
  const { styleCategories, colorCategories } = useMemo(() => 
    createCharacterCreatorCategories(
      {
        selectedHairStyle,
        selectedEyeType,
        selectedEyebrowStyle,
        selectedMouthType,
        selectedShirtType,
        selectedBackgroundType,
        selectedBaseModel,
        selectedBaseColor,
        selectedHairColor,
        selectedEyeColor,
        selectedEyebrowColor,
        selectedClothesColor,
        selectedBackgroundColor,
      },
      {
        setSelectedHairStyle,
        setSelectedEyeType,
        setSelectedEyebrowStyle,
        setSelectedMouthType,
        setSelectedShirtType,
        setSelectedBackgroundType,
        setSelectedBaseModel,
        setSelectedBaseColor,
        setSelectedHairColor,
        setSelectedEyeColor,
        setSelectedEyebrowColor,
        setSelectedClothesColor,
        setSelectedBackgroundColor,
      }
    ),
    [
      characterName,
      selectedHairStyle,
      selectedEyeType,
      selectedEyebrowStyle,
      selectedMouthType,
      selectedShirtType,
      selectedBackgroundType,
      selectedBaseModel,
      selectedBaseColor,
      selectedHairColor,
      selectedEyeColor,
      selectedEyebrowColor,
      selectedClothesColor,
      selectedBackgroundColor,
    ]
  );

  const getHairIndex = () => {
    const hairStyle = backendCharacter?.selected_hair_style ?? selectedHairStyle;
    const hairColor = backendCharacter?.selected_hair_color ?? selectedHairColor;
    return hairStyle + hairColor * 12;
  };
  const getClothesIndex = () => {
    const shirtType = backendCharacter?.selected_shirt_type ?? selectedShirtType;
    const clothesColor = backendCharacter?.selected_shirt_color ?? selectedClothesColor;
    return shirtType + clothesColor * 12;
  };
  const getEyesIndex = () => {
    const eyeType = backendCharacter?.selected_eye_type ?? selectedEyeType;
    const eyeColor = backendCharacter?.selected_eye_color ?? selectedEyeColor;
    return eyeType + eyeColor * 12;
  };
  const getEyebrowsIndex = () => {
    const eyebrowStyle = backendCharacter?.selected_eyebrow_style ?? selectedEyebrowStyle;
    const eyebrowColor = backendCharacter?.selected_eyebrow_color ?? selectedEyebrowColor;
    return eyebrowStyle + eyebrowColor * 12;
  };

  // Asset getter functions (updated to use backend character data when available)
  const getHairAsset = (useLocalState: boolean = false) => {
    try {
      // Use local state for character creation, backend data for display
      const hairStyle = useLocalState ? selectedHairStyle : (backendCharacter?.selected_hair_style ?? selectedHairStyle);
      const hairColor = useLocalState ? selectedHairColor : (backendCharacter?.selected_hair_color ?? selectedHairColor);
      

      
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
      
      // Ensure indices are within bounds
      const safeHairColor = Math.max(0, Math.min(hairColor, hairArrays.length - 1));
      const colorArray = hairArrays[safeHairColor] || hairOptionsBlack;
      const safeHairStyle = Math.max(0, Math.min(hairStyle, colorArray.length - 1));
      
      return colorArray[safeHairStyle] || colorArray[0];
    } catch (error) {
      console.error('[getHairAsset] Error loading hair asset:', error);
      return hairOptionsBlack[0];
    }
  };

  const getClothesAsset = (useLocalState: boolean = false) => {
    // Use local state for character creation, backend data for display
    const shirtType = useLocalState ? selectedShirtType : (backendCharacter?.selected_shirt_type ?? selectedShirtType);
    const clothesColor = useLocalState ? selectedClothesColor : (backendCharacter?.selected_shirt_color ?? selectedClothesColor);
    

    
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

  const getEyesAsset = (useLocalState: boolean = false) => {
    // Use local state for character creation, backend data for display
    const eyeType = useLocalState ? selectedEyeType : (backendCharacter?.selected_eye_type ?? selectedEyeType);
    const eyeColor = useLocalState ? selectedEyeColor : (backendCharacter?.selected_eye_color ?? selectedEyeColor);
    

    
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

  const getEyebrowsAsset = (useLocalState: boolean = false) => {
    // Use local state for character creation, backend data for display
    const eyebrowStyle = useLocalState ? selectedEyebrowStyle : (backendCharacter?.selected_eyebrow_style ?? selectedEyebrowStyle);
    const eyebrowColor = useLocalState ? selectedEyebrowColor : (backendCharacter?.selected_eyebrow_color ?? selectedEyebrowColor);
    
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

  const getCurrentBackgroundAsset = (useLocalState: boolean = false) => {
    // Use local state for character creation, backend data for display
    const backgroundType = useLocalState ? selectedBackgroundType : (backendCharacter?.selected_background_type ?? selectedBackgroundType);
    const backgroundColor = useLocalState ? selectedBackgroundColor : (backendCharacter?.selected_background_color ?? selectedBackgroundColor);
    
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

  const getCharacterName = () => {
    // Prioritize the main name field from backend, then local state
    const backendName = backendCharacter?.name;
    const localName = characterName;
    
    return backendName || localName || '';
  };

  const getBaseAsset = (useLocalState: boolean = false) => {
    try {
      // Use local state for character creation, backend data for display
      const baseColor = useLocalState ? selectedBaseColor : (backendCharacter?.selected_skin_color ?? selectedBaseColor);

      
      // Ensure baseColor is within bounds
      const safeIndex = Math.max(0, Math.min(baseColor, baseOptions.length - 1));
      
      // The base asset should be the skin color - use baseColor to get the correct base file
      const asset = baseOptions[safeIndex] || baseOptions[0];
      return asset;
    } catch (error) {
      console.error('[getBaseAsset] Error loading base asset:', error);
      // Return a safe fallback
      return baseOptions[0];
    }
  };

  const getMouthAsset = (useLocalState: boolean = false) => {
    try {
      // Use local state for character creation, backend data for display
      const mouthType = useLocalState ? selectedMouthType : (backendCharacter?.selected_mouth_type ?? selectedMouthType);
      const safeMouthType = Math.max(0, Math.min(mouthType, mouthOptions.length - 1));
      return mouthOptions[safeMouthType] || mouthOptions[0];
    } catch (error) {
      console.error('[getMouthAsset] Error loading mouth asset:', error);
      return mouthOptions[0];
    }
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

  const handleMiniGameComplete = async ( //mini game rewards
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => {
    if (gameType === "thoughtDefender") {
      // Update local progress
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

      // Award experience for Thought Defender completion
      if (data.experienceGained && data.experienceGained > 0) {
        try {
          await gainExperience(data.experienceGained, `thought_defender_${data.difficulty || 'normal'}`);
          console.log('✅ Thought Defender experience awarded:', data.experienceGained);
        } catch (error) {
          console.error('❌ Failed to award Thought Defender experience:', error);
        }
      }
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
            // Use resonance for character condition, experience for personality condition
            if (researchCondition === "character" && stat === "resonance") {
              gainResonance(value, `story_${rewardTracker.storyId}`);
            } else if (researchCondition === "personality" && stat === "experience") {
              gainExperience(value, `story_${rewardTracker.storyId}`);
            } else if (stat !== "experience" && stat !== "resonance") {
              // Handle other stats (wellness stats)
              gainWellness({ [stat]: value });
            }
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

  // ===== ENHANCED EQUIPMENT UPGRADE HANDLERS =====
  const handleEquipmentUpgrade = (upgradeResult: any) => {
    // Handle equipment upgrades from the new upgrade system
    if (upgradeResult && upgradeResult.upgrade) {
      const { upgrade } = upgradeResult;
      
      // Show upgrade notification with appropriate styling
      const notificationType = upgrade.currentLevel === 0 ? 'new' : 
                              upgrade.currentLevel === upgrade.newLevel ? 'strengthen' : 'upgrade';
      
      // Update local inventory if needed
      if (upgradeResult.isUpgrade) {
        // Remove old item and add new upgraded item
        setInventory(prev => prev.filter(item => item.name !== upgradeResult.originalItem));
        
        // Add the upgraded item
        const upgradedItem: EquipmentItem = {
          id: Date.now().toString(),
          name: upgradeResult.upgradedItem,
          type: 'focus', // This would be determined by the item type
          subtype: 'meditation', // This would be determined by the item subtype
          description: `Upgraded version of ${upgradeResult.originalItem}`,
          unlockCondition: 'Upgraded through story replay',
          wellnessStats: { awareness: upgrade.statBonus, resilience: upgrade.statBonus },
          effect: `Provides +${upgrade.statBonus} to all stats`,
          rarity: upgrade.rarity.toLowerCase(),
          level: upgrade.newLevel
        };
        
        setInventory(prev => [...prev, upgradedItem]);
      }
      
      // Apply stat boosts if any
      if (upgrade.statBonus > 0) {
        const statGains = {
          awareness: upgrade.statBonus,
          resilience: upgrade.statBonus,
          connection: upgrade.statBonus,
          balance: upgrade.statBonus
        };
        
        gainWellness(statGains);
      }
    }
  };

  // Get player inventory for upgrade system
  const getPlayerInventory = (): string[] => {
    return inventory.map(item => item.name);
  };

  // Get story replay count (this would be tracked per story)
  const getStoryReplayCount = (storyId: string): number => {
    // This would be implemented to track how many times a story has been replayed
    // For now, return 0 as default
    return 0;
  };

  // Enhanced equipment acquisition with upgrade system
  const acquireEquipmentWithUpgrade = async (itemName: string, storyId?: string) => {
    try {
      const playerInventory = getPlayerInventory();
      const storyReplayCount = storyId ? getStoryReplayCount(storyId) : 0;
      
      // Check for upgrade opportunities using the new system
      const { checkItemOwnershipAndUpgrade } = await import('../utils/rewardsUtils');
      const upgradeResult = checkItemOwnershipAndUpgrade(itemName, playerInventory, storyReplayCount);
      
      if (upgradeResult) {
        // Handle the upgrade result
        handleEquipmentUpgrade(upgradeResult);
        
        // Save to backend
        if (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0) {
                          // Map the upgraded item name to gear type ID using proper backend mapping
        const { getBackendGearTypeId } = await import('../utils/rewardsUtils');
        const gearTypeId = getBackendGearTypeId(upgradeResult.upgradedItem);
        
        if (gearTypeId) {
          await apiService.acquireGear(gearTypeId);
        } else {
          console.log(`No backend gear type ID found for: ${upgradeResult.upgradedItem}`);
        }
        }
        
        return upgradeResult;
      } else {
        // Fall back to regular acquisition
        const { getBackendGearTypeId } = await import('../utils/rewardsUtils');
        const gearTypeId = getBackendGearTypeId(itemName);
        
        if (gearTypeId) {
          await apiService.acquireGear(gearTypeId);
        } else {
          console.log(`No backend gear type ID found for: ${itemName}`);
        }
        return { originalItem: itemName, upgradedItem: itemName, isUpgrade: false };
      }
    } catch (error) {
      console.error('Failed to acquire equipment with upgrade:', error);
      throw error;
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
      // Check if we already have a character (for updates)
      if (backendCharacter) {
        // Update existing character - include character_config to ensure backend syncs both
        const updatedCharacter = await apiService.updateCharacterCustomization({
          ...backendCharacter,
          name: characterName,
          selected_base_model: selectedBaseModel,
          selected_skin_color: selectedBaseColor,
          selected_hair_style: selectedHairStyle,
          selected_hair_color: selectedHairColor,
          selected_eye_type: selectedEyeType,
          selected_eye_color: selectedEyeColor,
          selected_eyebrow_style: selectedEyebrowStyle,
          selected_eyebrow_color: selectedEyebrowColor,
          selected_mouth_type: selectedMouthType,
          selected_shirt_type: selectedShirtType,
          selected_shirt_color: selectedClothesColor,
          selected_background_type: selectedBackgroundType,
          selected_background_color: selectedBackgroundColor,
          // Also update character_config to ensure backend syncs both
          character_config: {
            selected_base_model: selectedBaseModel,
            selected_skin_color: selectedBaseColor,
            selected_hair_style: selectedHairStyle,
            selected_hair_color: selectedHairColor,
            selected_eye_type: selectedEyeType,
            selected_eye_color: selectedEyeColor,
            selected_eyebrow_style: selectedEyebrowStyle,
            selected_eyebrow_color: selectedEyebrowColor,
            selected_mouth_type: selectedMouthType,
            selected_shirt_type: selectedShirtType,
            selected_shirt_color: selectedClothesColor,
            selected_background_type: selectedBackgroundType,
            selected_background_color: selectedBackgroundColor,
          },
        });
        
        setBackendCharacter(updatedCharacter);
        
        // Don't reload character data since we already have the updated data
        // The backend might return old character_config values, so we keep our local state
      } else {
        // Create new character - send ALL customization fields
        const characterData = {
          name: characterName,
          character_config: {
            selected_base_model: selectedBaseModel,
            selected_skin_color: selectedBaseColor,
            selected_hair_style: selectedHairStyle,
            selected_hair_color: selectedHairColor,
            selected_eye_type: selectedEyeType,
            selected_eye_color: selectedEyeColor,
            selected_eyebrow_style: selectedEyebrowStyle,
            selected_eyebrow_color: selectedEyebrowColor,
            selected_mouth_type: selectedMouthType,
            selected_shirt_type: selectedShirtType,
            selected_shirt_color: selectedClothesColor,
            selected_background_type: selectedBackgroundType,
            selected_background_color: selectedBackgroundColor,
          },
          // Also send the main character fields
          selected_base_model: selectedBaseModel,
          selected_skin_color: selectedBaseColor,
          selected_hair_style: selectedHairStyle,
          selected_hair_color: selectedHairColor,
          selected_eye_type: selectedEyeType,
          selected_eye_color: selectedEyeColor,
          selected_eyebrow_style: selectedEyebrowStyle,
          selected_eyebrow_color: selectedEyebrowColor,
          selected_mouth_type: selectedMouthType,
          selected_shirt_type: selectedShirtType,
          selected_shirt_color: selectedClothesColor,
          selected_background_type: selectedBackgroundType,
          selected_background_color: selectedBackgroundColor,
        };

        // Create character by updating user profile with character data
        // The backend should handle both creation and updates through this endpoint
        const createdCharacter = await apiService.patch<Character>('updateUserProfile', characterData);
        
        // If backend returns "Hero" as name, we need to update the character name properly
        if (createdCharacter?.name === 'Hero' && characterName && characterName !== 'Hero') {
          console.log('🔄 Backend returned "Hero" as name, updating to:', characterName);
          
          // Update the character name using the updateUserProfile endpoint
          try {
            const nameUpdateData = {
              name: characterName,
              character: {
                ...createdCharacter,
                name: characterName,
              }
            };
            
            const updatedProfile = await apiService.patch<UserProfile>('updateUserProfile', nameUpdateData);
            console.log('✅ Character name updated successfully via profile update');
            
            // Update the character object with the new name
            const updatedCharacter = {
              ...createdCharacter,
              name: characterName,
            };
            setBackendCharacter(updatedCharacter);
          } catch (updateError) {
            console.error('❌ Failed to update character name:', updateError);
            // Fallback: keep the local name in the character object
            createdCharacter.name = characterName;
            setBackendCharacter(createdCharacter);
          }
        } else {
          setBackendCharacter(createdCharacter);
        }
        
        // Complete onboarding separately
        await apiService.completeOnboarding('character');
      }

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


    setIsLoading(true);
    setError(null);

    try {
      const updatedCharacter =
        await apiService.updateCharacterCustomization({
          ...backendCharacter,
          name: characterName,
          selected_base_model: selectedBaseModel,
          selected_skin_color: selectedBaseColor,
          selected_hair_style: selectedHairStyle,
          selected_hair_color: selectedHairColor,
          selected_eye_type: selectedEyeType,
          selected_eye_color: selectedEyeColor,
          selected_eyebrow_style: selectedEyebrowStyle,
          selected_eyebrow_color: selectedEyebrowColor,
          selected_mouth_type: selectedMouthType,
          selected_shirt_type: selectedShirtType,
          selected_shirt_color: selectedClothesColor,
          selected_background_type: selectedBackgroundType,
          selected_background_color: selectedBackgroundColor,
        });

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
    console.log('🎁 gainExperience called with:', { amount, source });
    console.log('🎁 backendCharacter:', backendCharacter);
    console.log('🎁 characterId from auth:', characterId);
    
    try {
      // If no backend character is loaded, try to load it first
      if (!backendCharacter) {
        console.log('🔄 No character loaded, attempting to load character data...');
        await memoizedLoadCharacter(true); // Force load for experience gains
        
        // If still no character after loading, try to get character ID from auth context
        if (!backendCharacter && characterId) {
          console.log('🔄 Attempting to load character with ID:', characterId);
          try {
            const characterData = await apiService.getMyCharacter();
            if (characterData) {
              setBackendCharacter(characterData);
            } else {
              console.error('❌ Failed to load character data');
              setError("No character found. Please create a character first.");
              return;
            }
          } catch (loadError: any) {
            console.error('❌ Error loading character:', loadError);
            setError("Failed to load character data. Please try again.");
            return;
          }
        }
        
        // If still no character, we can't proceed
        if (!backendCharacter) {
          console.error('❌ No character available for experience gain');
          setError("No character available. Please create a character first.");
          return;
        }
      }

      // Handle nested character structure
      const targetCharacterId = (backendCharacter as any).character?.id || backendCharacter.id;
      
      if (!targetCharacterId) {
        console.error('❌ Backend character has no ID:', backendCharacter);
        setError("Character ID missing. Please reload the app.");
        return;
      }

      console.log('🎁 Awarding experience:', amount, 'to character:', targetCharacterId, 'from source:', source);
      console.log('🎁 Full character data:', backendCharacter);
      
      const result = await apiService.gainExperience(
        targetCharacterId,
        amount,
        source
      );
      
      console.log('✅ Experience awarded successfully:', result);
      setBackendCharacter(result);

      if (result.level_up) {
        Alert.alert(
          "🎉 Level Up!",
          `Congratulations! You gained ${result.levels_gained} level(s)!`,
          [{ text: "Awesome!", style: "default" }]
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to gain experience:', error);
      console.error('❌ Error details:', {
        characterId: backendCharacter?.id,
        amount,
        source,
        error: error?.message || error
      });
      setError(
        "Failed to gain experience: " + (error?.message || "Unknown error")
      );
    }
  };

  const gainResonance = async (amount: number, source?: string) => {
    console.log('🎁 gainResonance called with:', { amount, source });
    console.log('🎁 backendCharacter:', backendCharacter);
    console.log('🎁 characterId from auth:', characterId);
    
    try {
      // If no backend character is loaded, try to load it first
      if (!backendCharacter) {
        console.log('🔄 No character loaded, attempting to load character data...');
        await memoizedLoadCharacter(true); // Force load for resonance gain
        
        // If still no character after loading, try to get character ID from auth context
        if (!backendCharacter && characterId) {
          console.log('🔄 Attempting to load character with ID:', characterId);
          try {
            const characterData = await apiService.getMyCharacter();
            if (characterData) {
              setBackendCharacter(characterData);
            } else {
              console.error('❌ Failed to load character data');
              setError("No character found. Please create a character first.");
              return;
            }
          } catch (loadError: any) {
            console.error('❌ Error loading character:', loadError);
            setError("Failed to load character data. Please try again.");
            return;
          }
        }
        
        // If still no character, we can't proceed
        if (!backendCharacter) {
          console.error('❌ No character available for resonance gain');
          setError("No character available. Please create a character first.");
          return;
        }
      }

      // Handle nested character structure
      const targetCharacterId = (backendCharacter as any).character?.id || backendCharacter.id;
      
      if (!targetCharacterId) {
        console.error('❌ Backend character has no ID:', backendCharacter);
        setError("Character ID missing. Please reload the app.");
        return;
      }

      console.log('🎁 Awarding resonance:', amount, 'to character:', targetCharacterId, 'from source:', source);
      console.log('🎁 Full character data:', backendCharacter);
      
      const result = await apiService.gainResonance(
        targetCharacterId,
        amount,
        source
      );
      
      console.log('✅ Resonance gain successful:', result);
      setBackendCharacter(result);

      if (result.resonance_up) {
        Alert.alert(
          "🎉 Resonance Up!",
          `Congratulations! Your resonance increased by ${result.resonance_gained}!`,
          [{ text: "Awesome!", style: "default" }]
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to gain resonance:', error);
      console.error('❌ Error details:', {
        characterId: backendCharacter?.id,
        amount,
        source,
        error: error?.message || error
      });
      setError(
        "Failed to gain resonance: " + (error?.message || "Unknown error")
      );
    }
  };

  const gainWellness = async (gains: Record<string, number>) => {
    console.log('🎁 gainWellness called with:', gains);
    console.log('🎁 backendCharacter:', backendCharacter);
    console.log('🎁 characterId from auth:', characterId);
    
    // If no backend character is loaded, try to load it first
    if (!backendCharacter) {
      console.log('🔄 No character loaded, attempting to load character data...');
      try {
        await memoizedLoadCharacter(true); // Force load for wellness gains
        
        // If still no character after loading, try to get character ID from auth context
        if (!backendCharacter && characterId) {
          console.log('🔄 Attempting to load character with ID:', characterId);
          try {
            const characterData = await apiService.getMyCharacter();
            if (characterData) {
              setBackendCharacter(characterData);
            } else {
              console.error('❌ Failed to load character data');
              setError("No character found. Please create a character first.");
              return;
            }
          } catch (loadError: any) {
            console.error('❌ Error loading character:', loadError);
            setError("Failed to load character data. Please try again.");
            return;
          }
        }
        
        // If still no character, we can't proceed
        if (!backendCharacter) {
          console.error('❌ No character available for wellness gain');
          setError("No character available. Please create a character first.");
          return;
        }
      } catch (loadError: any) {
        console.error('❌ Failed to load character for wellness gain:', loadError);
        setError("Failed to load character. Please try again.");
        return;
      }
    }

    // Handle nested character structure
    const targetCharacterId = (backendCharacter as any).character?.id || backendCharacter.id;
    
    if (!targetCharacterId) {
      console.error('❌ Backend character has no ID:', backendCharacter);
      setError("Character ID missing. Please reload the app.");
      return;
    }

    console.log('🎁 Using character ID:', targetCharacterId, 'for wellness gain');

    try {
      const result = await apiService.gainWellness(
        targetCharacterId,
        gains
      );
      console.log('✅ Wellness gain successful:', result);
      setBackendCharacter(result);

      Alert.alert("✨ Wellness Increased!", result.message, [
        { text: "Great!", style: "default" },
      ]);
    } catch (error: any) {
      console.error('❌ Failed to gain wellness:', error);
      console.error('❌ Error details:', {
        characterId: targetCharacterId,
        gains,
        error: error?.message || error
      });
      setError(
        "Failed to gain wellness: " + (error?.message || "Unknown error")
      );
    }
  };



  const acquireTool = async (toolId: number) => {
    try {
      await apiService.acquireCopingTool(toolId);
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
      await apiService.equipTool(toolId);
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
      await apiService.useTool(toolId, effectiveness, notes);
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
      await apiService.createCodexEntry(entryData);
      await memoizedLoadRecentCodexEntries(); // Refresh entries
    } catch (error: any) {
      setError(
        "Failed to create entry: " + (error?.message || "Unknown error")
      );
      throw error; // Re-throw so the calling component can handle it
    }
  };
  const quickJournalEntry = async (
    promptId: number, // Changed from string to number
    content: string,
    entryType: 'journal' | 'draw' | 'voice'
  ) => {
    try {
      await apiService.createCodexEntry({
        prompt: promptId, // Use the prompt ID number
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
  const memoizedLoadCharacter = useCallback(async (forceLoad: boolean = false) => {
    if (!authToken) {
      return;
    }

    console.log('🔄 Loading character data...');
    setIsLoading(true);
    try {
      const characterData = await apiService.getMyCharacter();

      if (characterData) {
        console.log('✅ Character data loaded:', characterData);
        setBackendCharacter(characterData);

        // Always load character name from backend if it exists and is not "Hero"
        // This ensures the character name is properly displayed
        if (characterData.name && characterData.name !== 'Hero') {
          setCharacterName(characterData.name);
        }
        
        setSelectedBaseModel(characterData.selected_base_model || 0);
        setSelectedBaseColor(characterData.selected_skin_color || 0); // Sync skin color
        setSelectedHairStyle(characterData.selected_hair_style || 0);
        setSelectedHairColor(characterData.selected_hair_color || 0);
        setSelectedEyeType(characterData.selected_eye_type || 0);
        setSelectedEyeColor(characterData.selected_eye_color || 0);
        setSelectedEyebrowStyle(characterData.selected_eyebrow_style || 0);
        setSelectedEyebrowColor(characterData.selected_eyebrow_color || 0);
        setSelectedMouthType(characterData.selected_mouth_type || 0);
        setSelectedShirtType(characterData.selected_shirt_type || 0);
        setSelectedClothesColor(characterData.selected_shirt_color || 0);
        setSelectedBackgroundType(characterData.selected_background_type || 0);
        setSelectedBackgroundColor(characterData.selected_background_color || 0);
      } else {
        console.log('⚠️ No character data returned from API');
      }
    } catch (error: any) {
      // Don't set error state for load failures as they might be expected
      if (error.response?.status === 404) {
        // Character endpoint not found (404) - this is expected if the endpoint is not implemented
        console.log('⚠️ Character endpoint not found (404)');
      } else {
        // Error loading character
        console.error('❌ Error loading character:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  const memoizedLoadAvailableTools = useCallback(async () => {
    try {
      const tools = await apiService.getAvailableCopingTools();
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
      const tools = await apiService.getMyTools();
      setMyTools(tools);
      setEquippedTools(tools.filter((tool: CharacterTool) => tool.is_equipped));
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
      const entries = await apiService.getMyCodexEntries();
      // Convert API service CodexEntry to frontend CodexEntry format
      const convertedEntries = entries.map(entry => ({
        id: entry.id.toString(),
        prompt: typeof entry.prompt === 'string' ? entry.prompt : entry.prompt?.text || '',
        content: entry.content || '',
        entry_type: entry.entry_type || 'journal',
        timestamp: new Date(entry.created_at || Date.now()).getTime(),
        type: 'journal',
        passages: entry.content || '',
        skillCategory: 'General',
        mapArea: 'entrance',
        difficulty: 'easy'
      }));
      setRecentCodexEntries(convertedEntries);
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
      const data = await apiService.getCharacterHomeData();
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
    
    // Load onboarding status and character data if we have an auth token
    if (authToken) {
      loadUserOnboardingStatus();
      memoizedLoadCharacter(); // Load character data including name
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
      loginTheme,
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
      styleCategories,
      colorCategories,
      setCharacterName,
      setSelectedBaseModel,
      setSelectedBaseColor,
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
      getCharacterName,
      createCharacter,
      updateCharacter,
      loadCharacter: memoizedLoadCharacter,
      gainExperience,
      gainResonance,
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
      // New upgrade system functions
      acquireEquipmentWithUpgrade,
      getPlayerInventory,
      getStoryReplayCount,
      handleEquipmentUpgrade,
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
