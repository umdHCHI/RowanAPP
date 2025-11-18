import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { uiIcons } from "../../assets/ui";
import { useMasterState } from "../../context/MasterStateContext";
import {
  BlurView,
  CodexModal,
  Dimensions,
  LinearGradient,
  ScrollView,
  StatusBar,
  StyleSheet,
  ThoughtDefenderModal,
  View,
  useEffect,
  useState
} from "../../imports";
import EquipmentModal from "../../screens/characterStory/components/EquipmentModal";
import { getStoryStyles } from "../../styles/globalStyles";
import { createCharacterHomeStyles } from "../../styles/screens/characterHome";
import AttributeInfoModal from "./components/AttributeInfoModal";

import { apiService } from "../../services/apiService";
import { getResearchCondition } from "../../utils/researchCondition";
import ChapterScreen from "./ChapterScreen";
import { ArchiveHeader } from './components/ArchiveHeader';
import { TabButton } from './components/TabButton';
import { TutorialModal } from './components/TutorialModal';
import { useAttributeModal } from './hooks/useAttributeModal';
import { useEquipmentHandlers } from './hooks/useEquipmentHandlers';
import { useGameData } from './hooks/useGameData';
import { useJournalStats } from './hooks/useJournalStats';
import { useMiniGameStats } from './hooks/useMiniGameStats';
import { useStoryData } from './hooks/useStoryData';
import { useStoryHandlers } from './hooks/useStoryHandlers';
import { useTutorial } from './hooks/useTutorial';
import StoryScreen from "./StoryScreen";
import { AtriumTab, DefenderTab, InscriptionsTab, PassagesTab, RestorationTab } from './tabs';
import { handleCodexEntrySubmission } from './utils/codexHelpers';
import { selectProfileAndCharacter } from "./utils/profileHelpers";
const { width, height } = Dimensions.get("window");



const ArchiveInterface: React.FC = () => {
  const {
    theme,
    auth,
    onboarding,
    character,
    equipment,
    archive,
    ui,
    loading,
    wellness
  } = useMasterState();
  const {
    showTutorial,
    currentTutorialStep,
    hasSeenTutorial,
    tutorialChecked,
    startTutorial,
    nextTutorialStep,
    previousTutorialStep,
    completeTutorial,
    skipTutorial
  } = useTutorial({
    userId: auth.characterId || auth.user?.username || 'default',
    authToken: auth.authToken ?? undefined
  });

  const {
    stories,
    isLoadingStories,
    loadStories,
    setStories
  } = useStoryData();
  const {
    gameData,
    isLoadingGameData,
    loadGameData,
    setGameData
  } = useGameData();
  const {
    journalStats,
    isLoadingJournalStats,
    loadJournalStats,
    setJournalStats
  } = useJournalStats();
  const {
    selectedStory,
    isChapterScreenVisible,
    isRefreshingData,
    setIsChapterScreenVisible,
    handleOpenStory,
    handleChapterSelect,
    handleCloseStory,
    handleStoryCompleteLocal
  } = useStoryHandlers({
    ui,
    archive,
    wellness,
    equipment,
    loadStories
  });
    const {
    thoughtDefenderStats,
    setThoughtDefenderStats,
    handleMiniGameComplete: handleMiniGameCompleteSubmit
  } = useMiniGameStats({ archiveContext: archive });
  const {
    handleEquip,
    handleUnequip
  } = useEquipmentHandlers({
    equipment,
    wellness
  });
  const {
    showAttributeModal,
    selectedAttribute,
    openAttributeModal,
    closeAttributeModal
  } = useAttributeModal();

  const router = useRouter();
  const params = useLocalSearchParams();
  const homeStyles = createCharacterHomeStyles(theme.characterHomeScreenTheme);
  const homeTheme = theme.characterHomeScreenTheme || {};

  // Helper function to safely get color values, ensuring they're never null/undefined
  const safeColor = (value: any, fallback: string): string => {
    return (typeof value === 'string' && value.length > 0) ? value : fallback;
  };

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  const [isLoadingCharacterData, setIsLoadingCharacterData] = useState(false);
  const storyStyles = getStoryStyles(theme.theme);



  const wellnessStatsForDisplay = (() => {
    const homeData = wellness.homeData;
    const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);

    const normalizedBackendCharacter = (() => {
      let char: any = character.backendCharacter;

      if (Array.isArray(char)) {
        char = char[0];
      }

      if (char && typeof char === 'object' && 'character' in char) {
        char = char.character;
      }

      return char;
    })();

    // Determine if this is a character user based on research_group.condition
    // homeData structure: wellness.homeData.userProfile.profile.research_group.condition
    const isCharacterUser =
      (homeData as any)?.userProfile?.profile?.research_group?.condition === "A" ||
      (homeData as any)?.userProfile?.completion_type === "character";


    const characterWellnessStats = (normalizedBackendCharacter as any)?.wellness_stats || backendCharacterData?.wellness_stats;
    if (characterWellnessStats && Array.isArray(characterWellnessStats) && characterWellnessStats.length > 0) {
      // If this is a character user, replace emoji icons with image icons
      if (isCharacterUser) {
        return characterWellnessStats.map((stat: any) => {
          const statLabel = stat.label?.toLowerCase();
          if (statLabel === 'exploration') {
            return { ...stat, icon: uiIcons.sectionIcons.exploration, useImage: true };
          } else if (statLabel === 'courage') {
            return { ...stat, icon: uiIcons.sectionIcons.courage, useImage: true };
          } else if (statLabel === 'fear') {
            return { ...stat, icon: uiIcons.sectionIcons.fear, useImage: true };
          }
          return stat; // Keep connection as emoji
        });
      }
      return characterWellnessStats;
    }
    
    // Check for character stats (exploration, courage, fear)
    if (normalizedBackendCharacter && (
      (normalizedBackendCharacter as any).exploration !== undefined ||
      (normalizedBackendCharacter as any).courage !== undefined ||
      (normalizedBackendCharacter as any).fear !== undefined
    )) {
      return [
        {
          icon: uiIcons.sectionIcons.exploration,
          label: "Exploration",
          value: (normalizedBackendCharacter as any).exploration || 0,
          color: "#4A90E2",
          useImage: true
        },
        {
          icon: uiIcons.sectionIcons.courage,
          label: "Courage",
          value: (normalizedBackendCharacter as any).courage || 0,
          color: "#2ECC71",
          useImage: true
        },
        {
          icon: "🤝",
          label: "Connection",
          value: (normalizedBackendCharacter as any).connection || 0,
          color: "#E74C3C"
        },
        {
          icon: uiIcons.sectionIcons.fear,
          label: "Fear",
          value: (normalizedBackendCharacter as any).fear || 0,
          color: "#F39C12",
          useImage: true
        }
      ];
    }

    // Check for personality stats (awareness, resilience, balance)
    if (normalizedBackendCharacter && (
      (normalizedBackendCharacter as any).awareness !== undefined ||
      (normalizedBackendCharacter as any).resilience !== undefined ||
      (normalizedBackendCharacter as any).balance !== undefined
    )) {
      return [
        {
          icon: "🧘",
          label: "Awareness",
          value: (normalizedBackendCharacter as any).awareness || 0,
          color: "#4A90E2"
        },
        {
          icon: "💪",
          label: "Resilience",
          value: (normalizedBackendCharacter as any).resilience || 0,
          color: "#2ECC71"
        },
        {
          icon: "🤝",
          label: "Connection",
          value: (normalizedBackendCharacter as any).connection || 0,
          color: "#E74C3C"
        },
        {
          icon: "⚖️",
          label: "Balance",
          value: (normalizedBackendCharacter as any).balance || 0,
          color: "#F39C12"
        }
      ];
    }
    
    const wellnessAverage = (normalizedBackendCharacter as any)?.wellness_average || backendCharacterData?.wellness_average;
    if (wellnessAverage !== undefined) {
      const baseValue = Math.floor(wellnessAverage * 5);
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: baseValue, 
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: baseValue, 
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: baseValue, 
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: baseValue, 
          color: "#F39C12" 
        }
      ];
    }
    
    // Determine user type based on research condition
    // Pass profile directly since we have it in this context
    const researchCondition = getResearchCondition({ profile: userProfile });
    const hasCompletionDataId = !!(userProfile?.completion_data_id || (normalizedBackendCharacter as any)?.completion_data_id);

    if (researchCondition === 'character' && hasCompletionDataId && !normalizedBackendCharacter && !backendCharacterData) {
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: 5,
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: 5,
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: 5,
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: 5,
          color: "#F39C12" 
        }
      ];
    }
    
    return archive.archiveFoundations;
  })();



  const loadThoughtDefenderStats = async () => {
      // Get game data which includes ThoughtDefender info
      const gameDataResponse = await apiService.fetchUserGameData();
      
      // For now, use basic stats from gameData
      // In the future, we can add an endpoint to get detailed TD run history
      const stats = {
        totalGames: 0,
        highScore: gameDataResponse.score || 0,
        maxLevel: gameDataResponse.level || 1,
        totalMissedShots: 0,
        averageAccuracy: 0,
        maxDynamicDifficulty: 1.0,
        gamesWon: 0,
        gamesLost: 0,
      };
      
      setThoughtDefenderStats(stats);
  };

  useEffect(() => {
    if (ui.activeTab === "passages" || ui.activeTab === "restoration") {
      // Only load if stories haven't been loaded yet
      if (stories.length === 0 && !isLoadingStories) {
        loadStories();
      }
      if (!gameData && !isLoadingGameData) {
        loadGameData(async () => loadStories());
      }
    }
    
    // Load journal prompts when navigating to inscriptions tab
    if (ui.activeTab === "inscriptions") {
      const loadPromptsForTab = async () => {
          const areas: string[] = [];
          const completed = Array.from(archive.completedStories ?? []);
          await wellness.loadCategoryPrompts(areas, completed);
      };
      loadPromptsForTab();
    }
    
    // Load ThoughtDefender stats when navigating to defender tab
    if (ui.activeTab === "defender") {
      loadThoughtDefenderStats();
    }
  }, [ui.activeTab, stories.length, gameData, isLoadingStories, isLoadingGameData]);
  

  // This prevents new users from seeing cached data from previous users
  useEffect(() => {
    if (!auth.authToken) {
      // User logged out - clear all local state immediately
      setStories([]);
      setGameData(null);
      setJournalStats(null);
      setThoughtDefenderStats(null);
      setShowEquipmentModal(false);

      
      // Clear tutorial state so new user can see it

    }
  }, [auth.authToken]);


  // This ensures each user only sees their own data
  useEffect(() => {
    if (auth.authToken && auth.characterId) {
      // Clear all local state first
      setStories([]);
      setGameData(null);
      setJournalStats(null);
      setThoughtDefenderStats(null);


      // Then load fresh data for this user
      const initializeData = async () => {
          setIsLoadingCharacterData(true);
          try {
            // Load home data first - this is critical for character display
            await wellness.loadHomeData();
            // Then load character data
            await character.loadCharacter();
            // Load other data in parallel
            await Promise.all([
              loadStories(),
              loadGameData(async () => loadStories()),
              loadJournalStats(),
              equipment.loadBackendGear(),
            ]);
          } finally {
            setIsLoadingCharacterData(false);
          }
      };

      initializeData();
    }
  }, [auth.authToken, auth.characterId]);

  useEffect(() => {
    const validTabs = ["atrium", "passages", "inscriptions", "defender", "restoration"];
    if (!validTabs.includes(ui.activeTab)) {
      ui.setActiveTab("atrium");
    }
  }, []);

  // Watch for refresh parameter from character creator
  useEffect(() => {
    if (params.refreshCharacter) {
      const refreshCharacterData = async () => {
          setIsLoadingCharacterData(true);
          try {
            await wellness.loadHomeData();
            const reloadedCharacter = await character.loadCharacter(true); // Force reload from backend
            await equipment.loadBackendGear();
          } finally {
            setIsLoadingCharacterData(false);
          }
      };

      refreshCharacterData();
    }
  }, [params.refreshCharacter]);



  const handleCodexEntrySubmit = (entry: {
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    handleCodexEntrySubmission(entry, archive);
  };







  return (
    <View style={[homeStyles.archiveContainer, { paddingTop: 20 }]}>
      <StatusBar
        barStyle={
          theme.themeMode === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor="#0a0b0f"
      />

      <LinearGradient
        colors={[
          safeColor(theme.theme?.archiveGradientStart, '#0a0b0f'),
          safeColor(theme.theme?.archiveGradientMiddle, '#1e293b'),
          safeColor(theme.theme?.archiveGradientEnd, '#0a0b0f'),
        ]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      <View style={[homeStyles.atmosphericOverlay, { opacity: 0.15 }]} pointerEvents="none" />

      <View style={homeStyles.archivepassages}>
        <ArchiveHeader
          homeStyles={homeStyles}
          wellness={wellness}
          auth={auth}
          character={character}
          startTutorial={startTutorial}
        />

        <View style={homeStyles.archiveTabContainer}>

            <BlurView intensity={20} style={homeStyles.archiveTabpassages}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={homeStyles.archiveTabScrollpassages}
              >
                <TabButton
                  title="The Atrium"
                  icon={uiIcons.sectionIcons.atrium}
                  isActive={ui.activeTab === "atrium"}
                  onPress={() => ui.setActiveTab("atrium")}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
                <TabButton
                  title="Passages"
                  icon={uiIcons.sectionIcons.passages}
                  isActive={ui.activeTab === "passages"}
                  onPress={() => ui.setActiveTab("passages")}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
                <TabButton
                  title="Inscriptions"
                  icon={uiIcons.sectionIcons.inscriptions}
                  isActive={ui.activeTab === "inscriptions"}
                  onPress={() => ui.setActiveTab("inscriptions")}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />
                <TabButton
                  title="Mind Defender"
                  icon={uiIcons.sectionIcons.defender}
                  isActive={ui.activeTab === "defender"}
                  onPress={() => ui.setActiveTab("defender")}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />

                <TabButton
                  title="Restoration"
                  icon={uiIcons.sectionIcons.restoration}
                  isActive={ui.activeTab === "restoration"}
                  onPress={() => ui.setActiveTab("restoration")}
                  homeStyles={homeStyles}
                  homeTheme={homeTheme}
                />

              </ScrollView>
            </BlurView>
        </View>

        <ScrollView
          style={homeStyles.archiveTabpassagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {ui.activeTab === "atrium" && (
            <AtriumTab
              homeStyles={homeStyles}
              homeTheme={homeTheme}
              wellness={wellness}
              equipment={equipment}
              character={character}
              setShowEquipmentModal={setShowEquipmentModal}
              openAttributeModal={openAttributeModal}
              wellnessStatsForDisplay={wellnessStatsForDisplay}
              auth={auth}
              params={params}
              isLoadingCharacterData={isLoadingCharacterData}
            />
          )}

          {ui.activeTab === "passages" && (
            <PassagesTab
              homeStyles={homeStyles}
              storyStyles={storyStyles}
              isLoadingStories={isLoadingStories}
              stories={stories}
              archive={archive}
              handleOpenStory={handleOpenStory}
            />
          )}

          {ui.activeTab === "inscriptions" && (
            <InscriptionsTab
              homeStyles={homeStyles}
              storyStyles={storyStyles}
              homeTheme={homeTheme}
              wellness={wellness}
              ui={ui}
              archive={archive}
            />
          )}

          {ui.activeTab === "defender" && (
            <DefenderTab
              homeStyles={homeStyles}
              storyStyles={storyStyles}
              theme={theme}
              ui={ui}
            />
          )}

          {ui.activeTab === "restoration" && (
            <RestorationTab
              homeStyles={homeStyles}
              storyStyles={storyStyles}
              homeTheme={homeTheme}
              theme={theme}
              wellness={wellness}
              auth={auth}
              router={router}
              stories={stories}
              journalStats={journalStats}
              archive={archive}
              isLoadingStories={isLoadingStories}
              apiService={apiService}
              ui={ui}
            />
          )}
        </ScrollView>
      </View>

      {ui.selectedStory && (
        <StoryScreen
          visible={ui.isStoryVisible}
          onClose={handleCloseStory}
          story={ui.selectedStory as any}
          chapter={{ 
            id: (ui.selectedStory as any)?.chapterId || null, 
            title: (ui.selectedStory as any)?.chapterTitle || ui.selectedStory?.title || "Story",
            content: ui.selectedStory?.description || "",
            chapter_number: (ui.selectedStory as any)?.chapterId || null,
            is_starting_chapter: (ui.selectedStory as any)?.chapterId === 1 || (ui.selectedStory as any)?.chapterId === null,
            variables: {},
            requirements: {},
            rewards: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passages: (ui.selectedStory?.passages as any)?.passages || []
          } as any}
          passage={(ui.selectedStory?.passages as any)?.passages?.[0] || {} as any}
          choices={(ui.selectedStory?.passages as any)?.passages?.[0]?.choices || []}
          onStatGain={() => {}}
          onArtifactUnlock={(artifact: string) => archive.handleArtifactUnlock({ name: artifact } as any)}
          onSkillLearned={(skill: string) => archive.handleSkillLearned([skill])}
          onStoryComplete={handleStoryCompleteLocal as any}
        />
      )}

      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={selectedStory?.id?.toString() || ""} 
        storyTitle={selectedStory?.title || "Unknown Story"}
        onChapterSelect={handleChapterSelect}
      />

      <CodexModal
        visible={ui.isCodexVisible}
        onClose={() => ui.setIsCodexVisible(false)}
        onSave={handleCodexEntrySubmit}
      />

      <ThoughtDefenderModal
          visible={ui.isThoughtDefenderVisible}
          onClose={() => ui.setIsThoughtDefenderVisible(false)}
          onScoreUpdate={(data: { 
            score: number; 
            level: number; 
            won: boolean;
            difficulty: string;
            accuracy: number;
            missedShots: number;
            dynamicDifficultyMultiplier: number;
            shotsFired: number;
            hits: number;
          }) => handleMiniGameCompleteSubmit("thoughtDefender", data)}
        />
      <EquipmentModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        inventory={equipment.inventory ?? []}
        equippedItems={equipment.equippedItems}
        backendGear={equipment.backendGear}
        equippedGear={equipment.equippedGear}
      />

      <TutorialModal
        showTutorial={showTutorial}
        currentTutorialStep={currentTutorialStep}
        nextTutorialStep={nextTutorialStep}
        previousTutorialStep={previousTutorialStep}
        skipTutorial={skipTutorial}
      />

        <AttributeInfoModal
          visible={showAttributeModal}
          onClose={closeAttributeModal}
          attribute={selectedAttribute}
        />

    </View>
  );
};

export default ArchiveInterface;
