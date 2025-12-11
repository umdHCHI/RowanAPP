// Composes all modular contexts into a unified provider
// See: src/context/modules/README.md for details

import React, { ReactNode, useEffect, useRef } from "react";
import { useAuth } from "../components/auth/context/AuthContext";
import { useTheme } from "./ThemeContext";

// Import all modular contexts
import {
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
} from "./modules";

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
} from "./modules";
export type {
  ArchiveArea,
  ArchiveFoundation,
  MentalArtifact
} from "./modules/types";

// Import types for internal use
import type { LoadingContextType, UIContextType } from "./modules";

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
      resetCharacterCreatorToDefaults:
        onboarding.resetCharacterCreatorToDefaults,
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
      gainResonance: character.gainResonance,
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
const ConnectedProviders: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { authToken, characterId, isTestUser } = useAuth();
  const loading = useLoading();
  const ui = useUI();

  // Shared refs for character creation tracking
  const didHomeScreenInit = useRef(false);
  const justCreatedCharacter = useRef(false);
  const newlyCreatedCharacter = useRef<any>(null);

  // Reset refs when auth changes
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
        // Map the internal condition strings to backend condition values
        const mappedCondition: "A" | "B" | "unknown" =
          condition === "character"
            ? "A"
            : condition === "personality"
            ? "B"
            : "unknown";
        ui.setResearchCondition(mappedCondition);
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
    <WellnessProvider
      characterId={characterId}
      onError={loading.setError}
      completedStories={new Set()}
    >
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
    <EquipmentProvider
      authToken={authToken}
      onWellnessGain={character.gainWellness}
    >
      <ArchiveProvider
        authToken={authToken}
        memoryStories={ui.memoryStories}
        researchCondition={ui.researchCondition}
        onGainExperience={character.gainExperience}
        onGainLumens={character.gainLumens}
        onGainResonance={character.gainResonance}
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
    <StoryProvider
      authToken={authToken}
      onStoryClose={ui.closeStory}
      onSkillLearned={archive.handleSkillLearned}
    >
      {children}
    </StoryProvider>
  );
};

export const MasterStateProvider: React.FC<MasterStateProviderProps> = ({
  children,
}) => {
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
