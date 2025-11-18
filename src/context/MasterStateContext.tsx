// Composes all modular contexts into a unified provider
// See: src/context/modules/README.md for details

import React, { ReactNode, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

// Import all modular contexts
import {
<<<<<<< HEAD
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
import { apiService } from "../services/apiService";
import { Character, CharacterGear, CodexEntry, CopingTool, EquipmentItem, EquipmentSubtype, EquipmentType, EquippedItems, HomeData, JournalPrompt, MiniGameProgress, PersonalityKey, Story } from "../types";
import { getRarityColors, mapBackendGearToSubtype, mapBackendSlotToFrontendType, mapBackendStatsToWellnessStats } from "../types/equipment";
import { ThoughtDefenderRunDTO, ThoughtDefenderRunResponse } from "../types/thoughtDefender";
import { CategoryConfig, createCharacterCreatorCategories, UserProfile } from "../types/user";
import { getResearchCondition } from "../utils/researchCondition";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";
=======
  ArchiveProvider,
  CharacterProvider,
  EquipmentProvider,
  LoadingProvider,
  OnboardingProvider,
  StoryProvider,
  UIProvider,
  useArchive,
  useCharacter,
  useEquipment,
  useLoading,
  useOnboarding,
  useStory,
  useUI,
  useWellness,
  WellnessProvider,
} from './modules';
>>>>>>> prodOne

// Re-export types for convenience
export type {
  ArchiveContextType,
  CharacterContextType,
  EquipmentContextType,
  LoadingContextType,
  OnboardingContextType,
  StoryContextType,
  UIContextType,
  WellnessContextType
} from './modules';
export type { ArchiveArea, ArchiveFoundation, MentalArtifact } from './modules/types';

// Import types for internal use
import type { LoadingContextType, UIContextType } from './modules';

// ===== BACKWARD COMPATIBLE HOOK =====
// This maintains the old API while using new modular contexts
export const useMasterState = () => {
  const auth = useAuth();
  const theme = useTheme();
  const onboarding = useOnboarding();
  const character = useCharacter();
  const user = useProfile();
  const wellness = useWellness();
  const equipment = useEquipment();
  const archive = useArchive();
  const ui = useUI();
  const story = useStory();
  const loading = useLoading();

  return {
    auth: {
      authToken: auth.authToken,
      characterId: auth.characterId,
      isTestUser: auth.isTestUser,
      user: auth.user,
      login: auth.login,
      logout: auth.logout,
    },
    onboarding: {
      isComplete: onboarding.isComplete,
      assignedPath: onboarding.assignedPath,
      researchGroup: onboarding.researchGroup,
      characterAppearance: onboarding.characterAppearance,
      isLoading: onboarding.isLoading,
      completeCharacter: onboarding.completeCharacter,
      setAssignedPath: onboarding.setAssignedPath,
      setCharacterAppearance: onboarding.setCharacterAppearance,
      resetOnboarding: onboarding.resetOnboarding,
      resetCharacterCreatorToDefaults: onboarding.resetCharacterCreatorToDefaults,
      setIsLoading: onboarding.setIsLoading,
      loadOnboardingStatus: onboarding.loadOnboardingStatus,
    },
    theme: {
      theme: theme.theme,
      themeMode: theme.themeMode,
      toggleTheme: theme.toggleTheme,
      setThemeMode: theme.setThemeMode,
      styles: theme.styles,
      isDark: theme.isDark,
      loginTheme: theme.loginTheme,
      onboardingTheme: theme.onboardingTheme,
      characterCreatorTheme: theme.characterCreatorTheme,
      characterHomeScreenTheme: theme.characterHomeScreenTheme,
      personalitySurveyTheme: theme.personalitySurveyTheme,
    },
    character: {
      backendCharacter: character.backendCharacter,
      userProfileData: character.userProfile, // Legacy - not used in new structure
      characterName: character.characterName,
      selectedBaseModel: character.selectedBaseModel,
      selectedBaseColor: character.selectedBaseColor,
      selectedHairStyle: character.selectedHairStyle,
      selectedHairColor: character.selectedHairColor,
      selectedEyeType: character.selectedEyeType,
      selectedEyeColor: character.selectedEyeColor,
      selectedEyebrowStyle: character.selectedEyebrowStyle,
      selectedEyebrowColor: character.selectedEyebrowColor,
      selectedMouthType: character.selectedMouthType,
      selectedShirtType: character.selectedShirtType,
      selectedClothesColor: character.selectedClothesColor,
      selectedBackgroundType: character.selectedBackgroundType,
      selectedBackgroundColor: character.selectedBackgroundColor,
      styleCategories: character.styleCategories,
      colorCategories: character.colorCategories,
      setCharacterName: character.setCharacterName,
      setSelectedBaseModel: character.setSelectedBaseModel,
      setSelectedBaseColor: character.setSelectedBaseColor,
      setSelectedHairStyle: character.setSelectedHairStyle,
      setSelectedHairColor: character.setSelectedHairColor,
      setSelectedEyeType: character.setSelectedEyeType,
      setSelectedEyeColor: character.setSelectedEyeColor,
      setSelectedEyebrowStyle: character.setSelectedEyebrowStyle,
      setSelectedEyebrowColor: character.setSelectedEyebrowColor,
      setSelectedMouthType: character.setSelectedMouthType,
      setSelectedShirtType: character.setSelectedShirtType,
      setSelectedClothesColor: character.setSelectedClothesColor,
      setSelectedBackgroundType: character.setSelectedBackgroundType,
      setSelectedBackgroundColor: character.setSelectedBackgroundColor,
      getCharacterName: character.getCharacterName,
      getBaseIndex: character.getBaseIndex,
      getHairIndex: character.getHairIndex,
      getClothesIndex: character.getClothesIndex,
      getEyesIndex: character.getEyesIndex,
      getEyebrowsIndex: character.getEyebrowsIndex,
      getHairAsset: character.getHairAsset,
      getClothesAsset: character.getClothesAsset,
      getEyesAsset: character.getEyesAsset,
      getEyebrowsAsset: character.getEyebrowsAsset,
      getCurrentBackgroundAsset: character.getCurrentBackgroundAsset,
      getBaseAsset: character.getBaseAsset,
      getMouthAsset: character.getMouthAsset,
      createCharacter: character.createCharacter,
      updateCharacter: character.updateCharacter,
      loadCharacter: character.loadCharacter,
      gainExperience: character.gainExperience,
      gainLumens: character.gainLumens,
      gainWellness: character.gainWellness,
    },
    wellness: {
      availableTools: wellness.availableTools,
      myTools: wellness.myTools,
      equippedTools: wellness.equippedTools,
      recentCodexEntries: wellness.recentCodexEntries,
      homeData: wellness.homeData,
      availablePrompts: wellness.availablePrompts,
      categoryPrompts: wellness.categoryPrompts,
      loadAvailableTools: wellness.loadAvailableTools,
      loadMyTools: wellness.loadMyTools,
      acquireTool: wellness.acquireTool,
      equipTool: wellness.equipTool,
      unequipTool: wellness.unequipTool,
      useTool: wellness.useTool,
      loadRecentCodexEntries: wellness.loadRecentCodexEntries,
      createCodexEntry: wellness.createCodexEntry,
      quickJournalEntry: wellness.quickJournalEntry,
      loadAvailablePrompts: wellness.loadAvailablePrompts,
      loadCategoryPrompts: wellness.loadCategoryPrompts,
      refreshPrompts: wellness.refreshPrompts,
      markPromptInactive: wellness.markPromptInactive,
      loadHomeData: wellness.loadHomeData,
    },
    equipment: {
      inventory: equipment.inventory,
      equippedItems: equipment.equippedItems,
      backendGear: equipment.backendGear,
      equippedGear: equipment.equippedGear,
      setInventory: equipment.setInventory,
      equipItem: equipment.equipItem,
      unequipItem: equipment.unequipItem,
      getItemIcon: equipment.getItemIcon,
      getRarityColors: equipment.getRarityColors,
      loadBackendGear: equipment.loadBackendGear,
      equipBackendGear: equipment.equipBackendGear,
      unequipBackendGear: equipment.unequipBackendGear,
      acquireEquipmentWithUpgrade: equipment.acquireEquipmentWithUpgrade,
      getPlayerInventory: equipment.getPlayerInventory,
      getStoryReplayCount: equipment.getStoryReplayCount,
      handleEquipmentUpgrade: equipment.handleEquipmentUpgrade,
    },
    archive: {
      completedStories: archive.completedStories,
      codexEntries: archive.codexEntries,
      miniGameProgress: archive.miniGameProgress,
      discoveredArtifacts: archive.discoveredArtifacts,
      finalRewardsArtifacts: archive.finalRewardsArtifacts,
      learnedSkills: archive.learnedSkills,
      archiveFoundations: archive.archiveFoundations,
      restorationMetrics: archive.restorationMetrics,
      handleStoryComplete: archive.handleStoryComplete,
      handleCodexEntry: archive.handleCodexEntry,
      handleMiniGameComplete: archive.handleMiniGameComplete,
      handleArtifactUnlock: archive.handleArtifactUnlock,
      handleSkillLearned: archive.handleSkillLearned,
      handleStoryRewardTracker: archive.handleStoryRewardTracker,
      setFinalRewardsArtifacts: archive.setFinalRewardsArtifacts,
      loadArchiveProgress: archive.loadArchiveProgress,
      saveArchiveProgress: archive.saveArchiveProgress,
      logThoughtDefenderRun: archive.logThoughtDefenderRun,
    },
    ui: {
      activeTab: ui.activeTab,
      researchCondition: ui.researchCondition,
      isCodexVisible: ui.isCodexVisible,
      isThoughtDefenderVisible: ui.isThoughtDefenderVisible,
      isMapVisible: ui.isMapVisible,
      isStoryVisible: ui.isStoryVisible,
      isStoryCatalogVisible: ui.isStoryCatalogVisible,
      currentMapRoomId: ui.currentMapRoomId,
      selectedStory: ui.selectedStory,
      memoryStories: ui.memoryStories,
      setActiveTab: ui.setActiveTab,
      setResearchCondition: ui.setResearchCondition,
      setIsCodexVisible: ui.setIsCodexVisible,
      setIsThoughtDefenderVisible: ui.setIsThoughtDefenderVisible,
      setIsMapVisible: ui.setIsMapVisible,
      setIsStoryVisible: ui.setIsStoryVisible,
      setIsStoryCatalogVisible: ui.setIsStoryCatalogVisible,
      setCurrentMapRoomId: ui.setCurrentMapRoomId,
      setSelectedStory: ui.setSelectedStory,
      setMemoryStories: ui.setMemoryStories,
      openStory: ui.openStory,
      closeStory: ui.closeStory,
    },
    story: {
      currentPassageId: story.currentPassageId,
      totalStatGains: story.totalStatGains,
      recentGains: story.recentGains,
      showStatGain: story.showStatGain,
      unlockedArtifacts: story.unlockedArtifacts,
      learnedSkills: story.learnedSkills,
      showArtifactUnlock: story.showArtifactUnlock,
      newArtifact: story.newArtifact,
      setCurrentPassageId: story.setCurrentPassageId,
      setTotalStatGains: story.setTotalStatGains,
      setRecentGains: story.setRecentGains,
      setShowStatGain: story.setShowStatGain,
      setUnlockedArtifacts: story.setUnlockedArtifacts,
      setLearnedSkills: story.setLearnedSkills,
      setShowArtifactUnlock: story.setShowArtifactUnlock,
      setNewArtifact: story.setNewArtifact,
      handleChoice: story.handleChoice,
      resetStoryState: story.resetStoryState,
    },
    loading: {
      isLoading: loading.isLoading,
      error: loading.error,
      setIsLoading: loading.setIsLoading,
      setError: loading.setError,
      clearError: loading.clearError,
    },
  };
};

// ===== COMPOSED PROVIDER =====
interface MasterStateProviderProps {
  children: ReactNode;
}

// Internal component that wires all contexts together with proper data flow
const ConnectedProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authToken, characterId, isTestUser } = useAuth();
  const loading = useLoading();
  const ui = useUI();

  // Shared refs for character creation tracking
  const didHomeScreenInit = useRef(false);
  const justCreatedCharacter = useRef(false);
  const newlyCreatedCharacter = useRef<any>(null);

<<<<<<< HEAD
  const getBaseIndex = () => {
    const baseModel = backendCharacter?.selected_base_model ?? selectedBaseModel;
    const baseColor = backendCharacter?.selected_skin_color ?? selectedBaseColor;
    return baseModel + baseColor * 12;
  };

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

  const getHairAsset = (useLocalState: boolean = false) => {
    try {
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
      
      const safeHairColor = Math.max(0, Math.min(hairColor, hairArrays.length - 1));
      const colorArray = hairArrays[safeHairColor] || hairOptionsBlack;
      const safeHairStyle = Math.max(0, Math.min(hairStyle, colorArray.length - 1));
      
      return colorArray[safeHairStyle] || colorArray[0];
    } catch (error) {
      return hairOptionsBlack[0];
    }
  };

  const getClothesAsset = (useLocalState: boolean = false) => {
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
    const backendName = backendCharacter?.name;
    const localName = characterName;
    return backendName || localName || '';
  };

  const getBaseAsset = (useLocalState: boolean = false) => {
    try {
      const baseColor = useLocalState ? selectedBaseColor : (backendCharacter?.selected_skin_color ?? selectedBaseColor);
      const safeIndex = Math.max(0, Math.min(baseColor, baseOptions.length - 1));
      const asset = baseOptions[safeIndex] || baseOptions[0];
      return asset;
    } catch {
      return baseOptions[0];
    }
  };

  const getMouthAsset = (useLocalState: boolean = false) => {
    try {
      const mouthType = useLocalState ? selectedMouthType : (backendCharacter?.selected_mouth_type ?? selectedMouthType);
      const safeMouthType = Math.max(0, Math.min(mouthType, mouthOptions.length - 1));
      return mouthOptions[safeMouthType] || mouthOptions[0];
    } catch (error) {
      return mouthOptions[0];
    }
  };

  const getItemIcon = (item: EquipmentItem) => {
    return require("../../assets/equipment/armor/fb1857.png");
  };

  const equipItem = (type: keyof EquippedItems, item: EquipmentItem) => {
  };

  const unequipItem = (type: keyof EquippedItems) => {
  };

  const loadBackendGear = async () => {
    try {
      const [myGear, equippedGearData] = await Promise.all([
        apiService.getMyGear(),
        apiService.getEquippedGear()
      ]);
      
      setBackendGear(myGear);
      setEquippedGear(equippedGearData);
      
      const convertedInventory: EquipmentItem[] = myGear.map(gear => convertBackendGearToEquipmentItem(gear));
      setInventory(convertedInventory);
    } catch {
    }
  };

  const mapEquipmentNameToTypeAndSubtype = (itemName: string): { type: EquipmentType; subtype: EquipmentSubtype } => {
    // Determine slot based on item name patterns, then use shared mapper
    const name = itemName.toLowerCase();
    let slot: 'weapon' | 'armor' | 'helmet' | 'boots' = 'weapon';
    
    if (name.includes('cloak') || name.includes('wrap') || name.includes('armor') || 
        name.includes('robe') || name.includes('shroud')) {
      slot = 'armor';
    } else if (name.includes('helm') || name.includes('crown') || name.includes('hat') ||
               name.includes('filter') || name.includes('guard') || name.includes('ward')) {
      slot = 'helmet';
    } else if (name.includes('boot') || name.includes('foundation') || name.includes('roots') || 
               name.includes('stone') && !name.includes('compass')) {
      slot = 'boots';
    }
    
    const type = mapBackendSlotToFrontendType(slot);
    const subtype = mapBackendGearToSubtype(itemName, slot);
    
    return { type, subtype };
  };

  const equipBackendGear = async (gearId: number) => {
    try {
      const result = await apiService.equipGear(gearId);
      await loadBackendGear();
    } catch {
      Alert.alert('Error', 'Failed to equip gear. Please try again.');
    }
  };

  const unequipBackendGear = async (gearId: number) => {
    try {
      const result = await apiService.unequipGear(gearId);
      await loadBackendGear();
    } catch {
      Alert.alert('Error', 'Failed to unequip gear. Please try again.');
    }
  };

  const calculateFoundationValues = useMemo(() => {
    const baseValues = {
      "Sight Beyond Sight": 2,
      "Unbreakable Will": 2,
      "Heart's Compass": 2,
      "Elemental Harmony": 2,
    };

    completedStories.forEach((storyId) => {
      const story = memoryStories.find((g: Story) => g.id === Number(storyId));
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
    });
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

    Object.keys(baseValues).forEach((key) => {
      baseValues[key as keyof typeof baseValues] = Math.min(
        20,
        baseValues[key as keyof typeof baseValues]
      );
    });

    return baseValues;
  }, [completedStories, codexEntries, miniGameProgress, memoryStories]);

  const getNextUnlock = (foundationLabel: string, currentValue: number) => {
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

  const archiveFoundations = useMemo(() => {
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

  const handleStoryComplete = (StoryId: string) => {
    setCompletedStories((prev) => new Set([...prev, StoryId]));
  };

  const handleCodexEntry = (entry: Omit<CodexEntry, "id" | "created_at" | "updated_at">) => { 
    const newEntry: CodexEntry = {
      id: Date.now(),
      prompt: entry.prompt,
      prompt_id: entry.prompt_id,
      prompt_text: entry.prompt_text,
      entry_type: entry.entry_type,
      content: entry.content,
      content_preview: entry.content_preview,
      skill_category: entry.skill_category,
      difficulty: entry.difficulty,
      word_count: entry.word_count,
      duration_seconds: entry.duration_seconds,
      username: entry.username,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      type: entry.entry_type,
      passages: entry.content,
      skillCategory: entry.skill_category,
      mapArea: entry.skill_category,
    };
    setCodexEntries((prev) => [...prev, newEntry]);
  };

  const handleMiniGameComplete = async (
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

      if (data.experienceGained && data.experienceGained > 0) {
        try {
          await gainExperience(data.experienceGained, `thought_defender_${data.difficulty || 'normal'}`);
        } catch (error) {
        }
      }
    } else if (gameType === "drawing") {
      setMiniGameProgress((prev) => ({
        ...prev,
        drawingEntries: prev.drawingEntries + 1,
      }));
    }
  };

  const logThoughtDefenderRun = async (run: ThoughtDefenderRunDTO) => {
    try {
      const payload = {
        score: run.score,
        level: run.level,
        durationMs: run.durationMs,
        enemiesDestroyed: run.wavesCleared || 0,
        damageTaken: Math.max(0, 3 - run.livesRemaining),
        completed: run.result === 'win',
        modifiers: {
          difficulty: run.difficulty,
          accuracy: run.accuracy,
          shotsFired: run.shotsFired,
          hits: run.hits,
          perksUsed: run.perksUsed,
          powerupsCollected: run.powerupsCollected
        },
        meta: {
          startedAt: run.startedAt,
          finishedAt: run.finishedAt,
          clientVersion: run.clientVersion,
          result: run.result
        }
      };
      
      const res = await apiService.logThoughtDefenderRun(payload);
      await memoizedLoadHomeData();
      return res;
    } catch (e: any) {
      return { ok: false, message: e?.message ?? 'Failed' };
    }
  };

  const handleStoryRewardTracker = (rewardTracker: any) => {
    if (rewardTracker.totalStatGains) {
      Object.entries(rewardTracker.totalStatGains).forEach(([stat, value]) => {
        if (typeof value === 'number' && value > 0) {
          if (backendCharacter) {
            if (researchCondition === "character") {
              if (stat === "resonance") {
                gainResonance(value, `story_${rewardTracker.storyId}`);
              } else if (stat === "experience") {
                gainExperience(value, `story_${rewardTracker.storyId}`);
              } else {
                gainWellness({ [stat]: value });
              }
            } else if (researchCondition === "survey") {
              if (stat === "experience") {
                gainExperience(value, `story_${rewardTracker.storyId}`);
              } else if (stat === "resonance") {
                gainResonance(value, `story_${rewardTracker.storyId}`);
              } else {
                gainWellness({ [stat]: value });
              }
            } else {
              if (stat !== "experience" && stat !== "resonance") {
                gainWellness({ [stat]: value });
              }
            }
          }
        }
      });
    }
    
    if (rewardTracker.finalRewards && rewardTracker.finalRewards.length > 0) {
      rewardTracker.finalRewards.forEach((reward: string) => {
        if (researchCondition === "character") {
          handleArtifactUnlock({ 
            name: reward, 
            type: 'gear_reward', 
            equipped: false, 
            resonance: 1, 
            description: `Equipment earned from story completion`, 
            rarity: 'Common' as any 
          });
        } else if (researchCondition === "survey") {
          handleArtifactUnlock({ 
            name: reward, 
            type: 'coping_tool', 
            equipped: false, 
            resonance: 1, 
            description: `Coping strategy learned from story completion`, 
            rarity: 'Common' as any 
          });
        }
      });
    }
    
    if (rewardTracker.skillsLearned && rewardTracker.skillsLearned.length > 0) {
      handleSkillLearned(rewardTracker.skillsLearned);
    }
    
    if (rewardTracker.questProgress && Object.keys(rewardTracker.questProgress).length > 0) {
      if (researchCondition === "survey") {
        try {
          const questProgressUpdate = {
            timestamp: Date.now(),
            questProgress: rewardTracker.questProgress,
            needsRefresh: true
          };
        } catch {
        }
      }
    }
  };

  const handleEquipmentUpgrade = (upgradeResult: any) => {
    if (upgradeResult && upgradeResult.upgrade) {
      const { upgrade } = upgradeResult;
      const notificationType = upgrade.currentLevel === 0 ? 'new' : 
                              upgrade.currentLevel === upgrade.newLevel ? 'strengthen' : 'upgrade';
      
      if (upgradeResult.isUpgrade) {
        setInventory(prev => prev.filter(item => item.name !== upgradeResult.originalItem));
        const { type, subtype } = mapEquipmentNameToTypeAndSubtype(upgradeResult.upgradedItem);
        const upgradedItem: EquipmentItem = {
          id: Date.now().toString(),
          name: upgradeResult.upgradedItem,
          type: type,
          subtype: subtype,
          description: `Upgraded version of ${upgradeResult.originalItem}`,
          unlockCondition: 'Upgraded through story replay',
          wellnessStats: { awareness: upgrade.statBonus, resilience: upgrade.statBonus },
          effect: `Provides +${upgrade.statBonus} to all stats`,
          rarity: upgrade.rarity,
          level: upgrade.newLevel
        };
        
        setInventory(prev => [...prev, upgradedItem]);
      }
      
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

  const getPlayerInventory = (): string[] => {
    return inventory.map(item => item.name);
  };

  const getStoryReplayCount = (storyId: string): number => {
    return 0;
  };

  const acquireEquipmentWithUpgrade = async (itemName: string, storyId?: string) => {
    try {
      const playerInventory = getPlayerInventory();
      const storyReplayCount = storyId ? getStoryReplayCount(storyId) : 0;
      
      const { checkItemOwnershipAndUpgrade } = await import('../utils/storyRewardIntegration');
      const upgradeResult = checkItemOwnershipAndUpgrade(itemName, playerInventory, storyReplayCount);
      
      if (upgradeResult) {
        handleEquipmentUpgrade(upgradeResult);
        
        if (upgradeResult.isUpgrade || upgradeResult.upgrade.statBonus > 0) {
          const { getBackendGearTypeId } = await import('../utils/rewardsUtils');
          const gearTypeId = getBackendGearTypeId(upgradeResult.upgradedItem);
          
          if (gearTypeId) {
            await apiService.acquireGear(gearTypeId);
          }
        }
        
        return upgradeResult;
      } else {
        const { getBackendGearTypeId } = await import('../utils/rewardsUtils');
        const gearTypeId = getBackendGearTypeId(itemName);
        
        if (gearTypeId) {
          await apiService.acquireGear(gearTypeId);
        }
        return { originalItem: itemName, upgradedItem: itemName, isUpgrade: false };
      }
    } catch (error) {
      throw error;
    }
  };

  const handleArtifactUnlock = (artifact: MentalArtifact) => {
    if (
      !discoveredArtifacts.find((a) => a.name === artifact.name) &&
      !finalRewardsArtifacts.find((a) => a.name === artifact.name)
    ) {
      setDiscoveredArtifacts((prev) => [...prev, artifact]);
    }
  };

  const handleSkillLearned = (skills: string[]) => {
    setLearnedSkills((prev) => [...new Set([...prev, ...skills])]);
  };

  const createCharacter = async () => {
    if (!authToken) {
      setError("No authentication token");
      return;
    }

    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (backendCharacter) {
        const updatedCharacter = await apiService.updateCharacterCustomization({
          ...(backendCharacter || {}),
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
        
        try {
          await completeCharacter();
        } catch {
        }
        
      } else {
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

        const createdCharacter = await apiService.createCharacter(characterData);
        setBackendCharacter(createdCharacter);
        await completeCharacter();
      }

      try {
        await memoizedLoadHomeData();
        await memoizedLoadAvailableTools();
        await memoizedLoadMyTools();
      } catch {
      }
    } catch (error: any) {
      setError(
        "Failed to create character: " + (error?.message || "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateCharacter = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Guard against null backendCharacter
      if (!backendCharacter) {
        setError("No character data available. Please reload the app.");
        return;
      }

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
    
    try {
      // Get character data - either from state or by loading it
      let ch = backendCharacter;
      if (!ch) {
        ch = await memoizedLoadCharacter(true); // Force load for experience gains
        
        if (!ch) {
          // Don't set error for admin users - they can still use the app with fallback data
          return;
        }
      }

      // Get character ID
      const id = Number(ch.id);
      
      if (!id || isNaN(id)) {
        setError("Character ID missing. Please reload the app.");
        return;
      }

      
      const result = await apiService.gainExperience(
        id,
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

  const gainResonance = async (amount: number, source?: string) => {
    
    try {
      // Get character data - either from state or by loading it
      let ch = backendCharacter;
      if (!ch) {
        ch = await memoizedLoadCharacter(true); // Force load for resonance gain
        
        if (!ch) {
          // Don't set error for admin users - they can still use the app with fallback data
          return;
        }
      }

      // Get character ID
      const id = Number(ch.id);
      
      if (!id || isNaN(id)) {
        setError("Character ID missing. Please reload the app.");
        return;
      }

      
      const result = await apiService.gainResonance(
        id,
        amount,
        source
      );
      
      setBackendCharacter(result);

      if (result.resonance_up) {
        Alert.alert(
          "🎉 Resonance Up!",
          `Congratulations! Your resonance increased by ${result.resonance_gained}!`,
          [{ text: "Awesome!", style: "default" }]
        );
      }
    } catch (error: any) {
      setError(
        "Failed to gain resonance: " + (error?.message || "Unknown error")
      );
    }
  };

  const gainWellness = async (gains: Record<string, number>) => {
    
    try {
      // Get character data - either from state or by loading it
      let ch = backendCharacter;
      if (!ch) {
        ch = await memoizedLoadCharacter(true); // Force load for wellness gains
        
        if (!ch) {
          // Don't set error for admin users - they can still use the app with fallback data
          return;
        }
      }

      // Get character ID
      const id = Number(ch.id);
      
      if (!id || isNaN(id)) {
        setError("Character ID missing. Please reload the app.");
        return;
      }


      const result = await apiService.gainWellness(
        id,
        gains
      );
      
      // Check if result is a Character object or a message response
      if (result && 'data' in result && 'message' in result.data) {
        // Handle message response (no gains to apply)
        Alert.alert("Character Attributes", result.data.message, [
          { text: "OK", style: "default" },
        ]);
      } else {
        // Handle Character object response
        setBackendCharacter(result as Character);

        Alert.alert("✨ Attributes Updated!", "Your character attributes have been updated, making you stronger for this journey!", [
          { text: "Great!", style: "default" },
        ]);
      }
    } catch (error: any) {
      setError(
        "Failed to gain wellness: " + (error?.message || "Unknown error")
      );
    }
  };


// ===== COPING TOOL METHODS =====


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
      
      // Check if this is a character-tool ID (from myTools) or a base tool ID (from availableTools)
      const characterTool = myTools.find(tool => tool.id === toolId);
      
      if (characterTool) {
        // This is already a character-tool ID, use it directly
        await apiService.equipTool(toolId);
      } else {
        // This is a base tool ID, we need to find the corresponding character-tool
        const baseTool = availableTools.find(tool => tool.id === toolId);
        if (baseTool) {
          // Find the character-tool instance for this base tool
          const characterToolInstance = myTools.find(tool => 
            tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );
          
          if (characterToolInstance) {
            await apiService.equipTool(characterToolInstance.id);
          } else {
            throw new Error(`Tool not found in your collection. You may need to acquire it first.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }
      
      await memoizedLoadMyTools(); // Refresh tools
    } catch (error: any) {
      setError("Failed to equip tool: " + (error?.message || "Unknown error"));
    }
  };

  const unequipTool = async (toolId: number) => {
    try {
      
      // Check if this is a character-tool ID (from myTools) or a base tool ID (from availableTools)
      const characterTool = myTools.find(tool => tool.id === toolId);
      
      if (characterTool) {
        // This is already a character-tool ID, use it directly
        await apiService.unequipTool(toolId);
      } else {
        // This is a base tool ID, we need to find the corresponding character-tool
        const baseTool = availableTools.find(tool => tool.id === toolId);
        if (baseTool) {
          // Find the character-tool instance for this base tool
          const characterToolInstance = myTools.find(tool => 
            tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );
          
          if (characterToolInstance) {
            await apiService.unequipTool(characterToolInstance.id);
          } else {
            throw new Error(`Tool not found in your collection.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }
      
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
      // Check if this is a character-tool ID (from myTools) or a base tool ID (from availableTools)
      const characterTool = myTools.find(tool => tool.id === toolId);
      
      if (characterTool) {
        // This is already a character-tool ID, use it directly
        await apiService.useTool(toolId, effectiveness, notes);
      } else {
        // This is a base tool ID, we need to find the corresponding character-tool
        const baseTool = availableTools.find(tool => tool.id === toolId);
        if (baseTool) {
          // Find the character-tool instance for this base tool
          const characterToolInstance = myTools.find(tool => 
            tool.tool_id === baseTool.tool_id || tool.name === baseTool.name
          );
          
          if (characterToolInstance) {
            await apiService.useTool(characterToolInstance.id, effectiveness, notes);
          } else {
            throw new Error(`Tool not found in your collection. You may need to acquire it first.`);
          }
        } else {
          throw new Error(`Tool with ID ${toolId} not found.`);
        }
      }
      
      await memoizedLoadMyTools(); // Refresh tools

      Alert.alert("🌟 Tool Used!", "Your tool usage has been recorded.", [
        { text: "Great!", style: "default" },
      ]);
    } catch (error: any) {
      setError("Failed to use tool: " + (error?.message || "Unknown error"));
    }
  };
  const createCodexEntry = async (entryData: {
    prompt: number;
    entry_type: 'journal' | 'draw' | 'voice';
    content: string;
  }) => {
    try {
      const uid = homeData?.userProfile?.user?.id ?? homeData?.userProfile?.id;
      if (!uid) {
        return;
      }
      
      // Get the character ID for proper association
      const currentCharacterId = characterId || homeData?.userProfile?.id;
      
      // Create the entry with character ID
      await apiService.createCodexEntry(entryData, currentCharacterId);
      
      // Mark the prompt as inactive (completed for the day)
      await apiService.markPromptAsInactive(entryData.prompt);
      
      // Refresh entries and prompts
      await memoizedLoadRecentCodexEntries(); // Refresh entries
      await loadCategoryPrompts(); // Refresh prompts so used prompt disappears
      
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
      await createCodexEntry({
        prompt: promptId, // Use the prompt ID number
        entry_type: entryType,
        content: content,
      });

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
  const loadAvailablePrompts = useCallback(async () => {
    try {
      const prompts = await apiService.getJournalPrompts();
      setAvailablePrompts(prompts);
    } catch (error: any) {
      // Handle 401 and 404 errors gracefully - these endpoints might not be implemented yet
      if (error?.response?.status === 401 || error?.response?.status === 404) {
      }
      setAvailablePrompts([]);
    }
  }, []);

  const loadCategoryPrompts = useCallback(async (areas?: string[], completed?: string[]) => {
    try {
      const prompts = await apiService.getPromptsByCategory(areas, completed);
      setCategoryPrompts(prompts);
    } catch {
      try {
        const fallbackPrompts = await apiService.getJournalPrompts();
        const fallbackResult = {
          journal: fallbackPrompts.find(p => p.category === 'journal') || null,
          draw: fallbackPrompts.find(p => p.category === 'draw') || null,
          voice: fallbackPrompts.find(p => p.category === 'voice') || null,
        };
        setCategoryPrompts(fallbackResult);
      } catch {
        setCategoryPrompts({ journal: null, draw: null, voice: null });
      }
    }
  }, []);

  const refreshPrompts = useCallback(async () => {
    try {
      // Get current unlocked areas and completed stories from the archive state
      const unlockedAreas = Array.from(completedStories); // You may need to adjust this logic
      const completedStoriesArray = Array.from(completedStories);
      
      // Reload both available prompts and category-specific prompts
      await Promise.all([
        loadAvailablePrompts(),
        loadCategoryPrompts(unlockedAreas, completedStoriesArray)
      ]);
    } catch (error) {
      // Error refreshing prompts
    }
  }, [completedStories, loadAvailablePrompts, loadCategoryPrompts]);

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
        "📚You Have Finished a Tale. The Archive Watches.",
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
  const memoizedLoadCharacter = useCallback(async (forceLoad: boolean = false): Promise<Character | null> => {
    if (!authToken) {
      return null;
    }

    setIsLoading(true);
    
    try {
      // First try to extract character data from unified homeData
      let characterData: Character | null = null;
      
      if (homeData) {
        characterData = homeData.character || null;
      }
      
      if (!characterData && forceLoad) {
        try {
          characterData = await apiService.getMyCharacter();
        } catch (apiError: any) {
          if (apiError.response?.status !== 404) {
          }
        }
      }

      if (characterData) {
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
      }
      
      return characterData;
    } catch (error: any) {
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [authToken]); // Removed homeData dependency to break the infinite loop
  // Note: homeData is still accessible inside the function via closure, but removing it from
  // dependencies prevents the function from being recreated every time homeData changes

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
      
      // Get equipped tools separately since CopingTool doesn't have is_equipped property
      try {
        const equipped = await apiService.getEquippedTools();
        setEquippedTools(equipped);
      } catch (equippedError: any) {
        setEquippedTools([]);
      }
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
      const entries = await apiService.getUserCodexEntries();
      
      // Entries are already in the correct CodexEntry format from the API
      setRecentCodexEntries(entries);
    } catch (error: any) {
      // Handle error silently
      if (error.response?.status === 404) {
      }
      setRecentCodexEntries([]); // Set empty array on error
    }
  }, []);

  const memoizedLoadHomeData = useCallback(async () => {
    try {
      
      // Use the normalized getProfile() method - no id -> resolves via users/me/
      const profile = await apiService.getProfile();
      
      
      // Update equipment context with equipped gear from UserProfile
      if (profile?.equipped_gear && Array.isArray(profile.equipped_gear)) {
        setEquippedGear(profile.equipped_gear);
        
        // Also update backend gear if not already loaded
        if (backendGear.length === 0) {
          try {
            const myGear = await apiService.getMyGear();
            setBackendGear(myGear);
            
            // Convert backend gear to frontend equipment format for inventory
            const convertedInventory: EquipmentItem[] = myGear.map(gear => convertBackendGearToEquipmentItem(gear));
            setInventory(convertedInventory);
          } catch (error) {
          }
        }
      }
      
      // Determine user type based on research condition
      // Use the utility function to check research_group.condition (A = character, B = personality)
      // Pass profile directly since we have it in this context
      const researchCondition = getResearchCondition({ profile });
      const isCharacterUser = researchCondition === 'character';
      
      
      // Create unified HomeData structure for both user types
      const unifiedHomeData: HomeData = {
        userProfile: profile,
        character: profile?.character || undefined,
        primaryTrait: isCharacterUser ? undefined : 
          (profile?.profile?.primary_trait as PersonalityKey || 
           profile?.personality_profile?.profile_summary?.dominant_trait as PersonalityKey || undefined)
      };
      
      setHomeData(unifiedHomeData);
      
      // Also set character.backendCharacter to the character object from the profile
      if (profile?.character) {
        setBackendCharacter(profile.character);
      }
      
    } catch (error: any) {
      setHomeData(null);
    }
  }, []);

  const memoizedMarkPromptInactive = useCallback(async (promptId: number) => {
    try {
      await apiService.markPromptAsInactive(promptId);
    } catch (error) {
      // Don't throw - this is not critical functionality
    }
  }, []);

  useEffect(() => {
    const initializeApiService = async () => {
      try {
        await apiService.initialize();
      } catch {
      }
    };
    
    initializeApiService();
    
    if (authToken) {
      loadUserOnboardingStatus();
    }
    
  }, [authToken]);

  // Load character data only for users who have completed character onboarding
  useEffect(() => {
    if (authToken && isComplete && assignedPath === 'character') {
      memoizedLoadCharacter(); // Load existing character data
    }
  }, [authToken, isComplete, assignedPath, memoizedLoadCharacter]);

  // Load character data for users on the character home screen (regardless of onboarding status)
  // This is needed for users who have already completed character creation and are viewing their home screen
  // 
  // FIXED: This useEffect previously caused an infinite loop due to memoized function dependencies.
  // The loop was: homeData changes → memoizedLoadCharacter recreates → useEffect runs → loads homeData → repeat
  // 
  // Solution: 
  // 1. Removed memoized function identities from dependencies
  // 2. Added useRef guard to ensure it only runs once per session
  // 3. Added homeData check to prevent reloading when data already exists
  useEffect(() => {
    // Check if we're on the character route and have a character ID in auth context
    if (!authToken || !characterId || backendCharacter !== null || didHomeScreenInit.current) return;

    (async () => {
      didHomeScreenInit.current = true;

      // Load character first (force API fallback if profile lacks character)
      await memoizedLoadCharacter(true);

      // Only load home data if we don't already have it
      if (!homeData) {
        await memoizedLoadHomeData();
      }

      // These can be called once; errors are handled internally
      await Promise.allSettled([
        memoizedLoadAvailableTools(),
        memoizedLoadMyTools(),
      ]);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, characterId, backendCharacter, homeData]);

  // Load prompts when home data is ready
  useEffect(() => {
    if (homeData) {
      const unlockedAreas: string[] = [];            // if you track areas, pass them here
      const completedStoriesArr = Array.from(completedStories);
      loadAvailablePrompts();
      loadCategoryPrompts(unlockedAreas, completedStoriesArr);
    }
  }, [homeData, completedStories, loadAvailablePrompts, loadCategoryPrompts]);

  // Reset character creator to defaults when starting character creation
  useEffect(() => {
    // Only reset when user is explicitly starting character creation (not when they're on home screen)
    if (authToken && !isComplete && assignedPath === 'character' && !characterId) {
      resetCharacterCreatorToDefaults();
    }
  }, [authToken, isComplete, assignedPath, characterId]);

  // Reset character creator when user logs out or auth token changes
  useEffect(() => {
    if (!authToken) {
      resetCharacterCreatorToDefaults();
    }
  }, [authToken]);

  // Reset home screen initialization guard when auth changes
=======
  // Reset refs when auth changes
>>>>>>> prodOne
  useEffect(() => {
    if (!authToken) {
      didHomeScreenInit.current = false;
      justCreatedCharacter.current = false;
      newlyCreatedCharacter.current = null;
    }
  }, [authToken]);

  return (
    <OnboardingProvider
      authToken={authToken}
      isTestUser={isTestUser}
      backendCharacter={null}
      userProfile={null}
      justCreatedCharacter={justCreatedCharacter}
      newlyCreatedCharacter={newlyCreatedCharacter}
      didHomeScreenInit={didHomeScreenInit}
      setBackendCharacter={() => {}}
      onResearchConditionChange={(condition) => {
        ui.setResearchCondition(condition);
      }}
      onCharacterCreatorReset={() => {}}
    >
      <InnerProviders
        authToken={authToken}
        characterId={characterId}
        isTestUser={isTestUser}
        loading={loading}
        ui={ui}
        justCreatedCharacter={justCreatedCharacter}
        newlyCreatedCharacter={newlyCreatedCharacter}
      >
        {children}
      </InnerProviders>
    </OnboardingProvider>
  );
};

// Second level - WellnessProvider
const InnerProviders: React.FC<{
  children: ReactNode;
  authToken: string | null;
  characterId: string | null;
  isTestUser: boolean;
  loading: LoadingContextType;
  ui: UIContextType;
  justCreatedCharacter: React.MutableRefObject<boolean>;
  newlyCreatedCharacter: React.MutableRefObject<any>;
}> = ({
  children,
  authToken,
  characterId,
  isTestUser,
  loading,
  ui,
  justCreatedCharacter,
  newlyCreatedCharacter,
}) => {
  return (
    <WellnessProvider characterId={characterId} onError={loading.setError} completedStories={new Set()}>
      <CharacterProviderWrapper
        authToken={authToken}
        characterId={characterId}
        isTestUser={isTestUser}
        loading={loading}
        ui={ui}
        justCreatedCharacter={justCreatedCharacter}
        newlyCreatedCharacter={newlyCreatedCharacter}
      >
        {children}
      </CharacterProviderWrapper>
    </WellnessProvider>
  );
};

// Third level - CharacterProvider which needs WellnessProvider's homeData
const CharacterProviderWrapper: React.FC<{
  children: ReactNode;
  authToken: string | null;
  characterId: string | null;
  isTestUser: boolean;
  loading: LoadingContextType;
  ui: UIContextType;
  justCreatedCharacter: React.MutableRefObject<boolean>;
  newlyCreatedCharacter: React.MutableRefObject<any>;
}> = ({
  children,
  authToken,
  characterId,
  isTestUser,
  loading,
  ui,
  justCreatedCharacter,
  newlyCreatedCharacter,
}) => {
  const wellness = useWellness();

  return (
    <CharacterProvider
      authToken={authToken}
      characterId={characterId}
      isTestUser={isTestUser}
      homeData={wellness.homeData}
      onLoadingChange={loading.setIsLoading}
      onError={loading.setError}
      justCreatedCharacter={justCreatedCharacter}
      newlyCreatedCharacter={newlyCreatedCharacter}
    >
      <DeepProviders ui={ui} authToken={authToken}>
        {children}
      </DeepProviders>
    </CharacterProvider>
  );
};

// Fourth level - Equipment, Archive, and Story providers that need Character context
const DeepProviders: React.FC<{
  children: ReactNode;
  ui: UIContextType;
  authToken: string | null;
}> = ({ children, ui, authToken }) => {
  const wellness = useWellness();
  const character = useCharacter();

  return (
    <EquipmentProvider authToken={authToken} onWellnessGain={character.gainWellness}>
      <ArchiveProvider
        authToken={authToken}
        memoryStories={ui.memoryStories}
        researchCondition={ui.researchCondition}
        onGainExperience={character.gainExperience}
        onGainLumens={character.gainLumens}
        onGainWellness={character.gainWellness}
        onLoadHomeData={wellness.loadHomeData}
      >
        <FinalProvider ui={ui} authToken={authToken}>
          {children}
        </FinalProvider>
      </ArchiveProvider>
    </EquipmentProvider>
  );
};

// Fifth level - StoryProvider that needs Archive context
const FinalProvider: React.FC<{
  children: ReactNode;
  ui: UIContextType;
  authToken: string | null;
}> = ({ children, ui, authToken }) => {
  const archive = useArchive();

  return (
    <StoryProvider authToken={authToken} onStoryClose={ui.closeStory} onSkillLearned={archive.handleSkillLearned}>
      {children}
    </StoryProvider>
  );
};

export const MasterStateProvider: React.FC<MasterStateProviderProps> = ({ children }) => {
  return (
    <LoadingProvider>
      <UIProvider>
        <ConnectedProviders>{children}</ConnectedProviders>
      </UIProvider>
    </LoadingProvider>
  );
};

// ===== EXPORTS =====
// Export individual hooks for direct usage (recommended)
export {
  useArchive,
  useCharacter,
  useEquipment,
  useLoading,
  useOnboarding,
  useStory,
  useUI,
  useWellness
};
function useProfile() {
  const auth = useAuth();
  return auth.user;
}

