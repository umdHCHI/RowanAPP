import EquipmentModal from "../../components/EquipmentModal";
import { useMasterState } from "../../context/MasterStateContext";
import {
  Alert,
  BlurView,
  CharacterPreview,
  CodexModal,
  Dimensions,
  EquipmentItem,
  EquippedItems,
  Icon,
  Image,
  LinearGradient,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ThoughtDefenderModal,
  TouchableOpacity,
  View,
  useEffect,
  useState
} from "../../imports";
// Import StoryScreen directly to avoid circular dependency issues
import { apiService } from "../../services/apiService";
import ChapterScreen from "./ChapterScreen";
import StoryScreen from "./StoryScreen";

const { width, height } = Dimensions.get("window");

const ArchiveInterface: React.FC = () => {
  // Use MasterStateContext instead of individual contexts
  const {
    theme,
    auth,
    onboarding,
    character,
    equipment,
    archive,
    ui,
    loading,
    wellness,
  } = useMasterState();

  // Local state for stories
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  // Chapter selection state
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  // Equipment state is now managed by the MasterStateContext
  // The backend gear data is loaded automatically on mount

  // Load stories from backend
  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      const backendStories = await apiService.getAvailableStories();
      if (backendStories && backendStories.length > 0) {
        setStories(backendStories);
        ui.setMemoryStorys(backendStories);
      } else {
        setStories([]);
        ui.setMemoryStorys([]);
      }
    } catch (error) {
      setStories([]);
      ui.setMemoryStorys([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Load stories from backend on mount
  useEffect(() => {
    loadStories();
  }, []);

  // Load home data and journal prompts on mount (only once)
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load home data for character display
        await wellness.loadHomeData();
        
        // Load available prompts first
        await wellness.loadAvailablePrompts();
        
        // Then load category-specific prompts based on current progress
        const unlockedAreas = ["entrance"]; // Start with entrance, add more based on progress
        const completedStoriesArray = Array.from(archive.completedStories);
        await wellness.loadCategoryPrompts(unlockedAreas, completedStoriesArray);
      } catch (error: any) {
        console.error('Error loading data:', error);
        // Don't retry on 404 errors - the endpoint might not be implemented yet
        if (error?.response?.status === 404) {
          console.log('Some endpoints not found (404) - this is expected if the endpoints are not implemented');
        }
      }
    };

    loadData();
  }, []); // Empty dependency array - only run once on mount

  // Story handlers
  const handleOpenStory = async (Story: any) => {
    try {
      console.log("=== handleOpenStory called ===");
      console.log("Story data:", Story);
      console.log("Story ID:", Story?.id);
      console.log("Story title:", Story?.title);

      // First, check if this story has chapters
      try {
        console.log("Checking for chapters in story:", Story.id);
        const chapters = await apiService.getChapters(String(Story.id));
        console.log("Chapters found:", chapters);
        
        if (chapters && chapters.length > 0) {
          console.log("Story has chapters, showing chapter selection");
          // Story has chapters, show chapter selection
          setSelectedStory(Story);
          setIsChapterScreenVisible(true);
          return;
        }
      } catch (chapterError) {
        console.warn("Could not get chapters, assuming no chapters:", chapterError);
      }

      // No chapters or chapter check failed, proceed with direct story opening
      console.log("No chapters found, opening story directly");
      
      // Start the story using the new backend
      const startResult = await apiService.startNewStory(Story.id);
      console.log('Story started:', startResult);
      
      // Try to get the current passage, but handle errors gracefully
      let currentPassageResult = null;
      try {
        currentPassageResult = await apiService.getCurrentPassage(Story.id);
        console.log('Current passage:', currentPassageResult);
      } catch (error) {
        console.warn('Could not get current passage, using start result:', error);
        // Use the start result if it contains passage data
        if (startResult?.passage) {
          currentPassageResult = startResult;
        }
      }
      
      if (currentPassageResult?.passage) {
        // Set up the story screen with the current passage
        setSelectedStory(Story);
        ui.setSelectedStory(Story);
        ui.setIsStoryVisible(true);
      } else {
        console.error('No passage data received from backend');
        Alert.alert("Error", "No passage data available for this story.", [
          { text: "OK", style: "default" },
        ]);
      }
    } catch (error) {
      console.error("Error in handleOpenStory:", error);
      // Show error to user
      Alert.alert("Error", "Failed to open story. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };

  const handleDirectStoryOpen = async (Story: any) => {
    try {
      // Check if Story is defined and has an id
      if (!Story?.id) {
        console.error("Story is undefined or missing id:", Story);
        Alert.alert("Error", "Invalid story data. Please try again.", [
          { text: "OK", style: "default" },
        ]);
        return;
      }
      
      console.log("=== handleDirectStoryOpen called ===");
      console.log("Story ID:", Story.id);
      console.log("Chapter count:", Story.chapter_count);
      
      // For non-chapter stories, try to get passages directly
      if (Story.chapter_count === 0) {
        console.log("Non-chapter story, getting passages directly");
        try {
          // Try to get passages directly from the story
          const passages = await apiService.get<any[]>('storyRoot', { urlSuffix: `stories/${Story.id}/passages/` });
          console.log("Direct passages for story:", passages);
          
          if (passages && passages.length > 0) {
            // Transform to frontend format
            const storypassages = {
              id: Story.id.toString(),
              title: Story.title || 'Unknown Story',
              subtitle: 'main',
              atmosphere: 'Mysterious',
              difficulty: 'Intermediate',
              rarity: 'Common',
              skillFocus: ['General'],
              passages: passages.map((passage: any) => ({
                id: passage.id,
                passage_id: passage.passage_id,
                content: passage.content,
                passage_type: passage.passage_type,
                speaker: passage.speaker,
                required_conditions: passage.required_conditions || {},
                story_effects: passage.story_effects || {},
                mood: passage.mood,
                background_music: passage.background_music,
                background_image: passage.background_image,
                order: passage.order,
                choices: [] // Will be populated per passage
              })),
              currentPassage: passages[0] ? {
                id: passages[0].id,
                passage_id: passages[0].passage_id,
                content: passages[0].content,
                passage_type: passages[0].passage_type,
                speaker: passages[0].speaker,
                required_conditions: passages[0].required_conditions || {},
                story_effects: passages[0].story_effects || {},
                mood: passages[0].mood,
                background_music: passages[0].background_music,
                background_image: passages[0].background_image,
                order: passages[0].order,
                choices: []
              } : null,
              progress: {
                passagesVisited: 0,
                isCompleted: false,
                progressPercentage: 0
              },
              isChapterBased: false,
              chapterId: null,
              chapterTitle: null
            };
            
            // Get user's progress for this story
            const progressRecords = await apiService.getStoryProgressRecords(String(Story.id));
            console.log("User progress for story:", progressRecords);
            
            // Calculate exploration percentage based on progress
            let exploration = 0;
            if (progressRecords.length > 0) {
              // Count unique passages visited
              const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
              const totalPassages = storypassages.passages?.length || 1;
              exploration = Math.round((uniquePassages.size / totalPassages) * 100);
            }
            
            // Update story with progress information
            const storyWithProgress = {
              ...Story,
              passages: storypassages,
              exploration: exploration
            };
            
            ui.openStory(storyWithProgress);
            return;
          }
        } catch (directError: any) {
          console.error("Failed to get direct passages:", directError);
          console.error("Direct error details:", {
            message: directError.message,
            status: directError.response?.status,
            data: directError.response?.data,
            url: directError.config?.url
          });
        }
      }
      
      // Fallback: try the original getStorypassages method
      console.log("Trying fallback getStorypassages method");
      const storypassages = await apiService.getStorypassages(Story.id);
      if (storypassages) {
        // Get user's progress for this story
        const progressRecords = await apiService.getStoryProgressRecords(String(Story.id));
        console.log("User progress for story:", progressRecords);
        
        // Calculate exploration percentage based on progress
        let exploration = 0;
        if (progressRecords.length > 0) {
          // Count unique passages visited
          const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
          const totalPassages = storypassages.passages?.length || 1;
          exploration = Math.round((uniquePassages.size / totalPassages) * 100);
        }
        
        // Update story with progress information
        const storyWithProgress = {
          ...Story,
          passages: storypassages,
          exploration: exploration
        };
        
        ui.openStory(storyWithProgress);
      } else {
        // Show error if no passages found
        Alert.alert(
          "No passages Available",
          "This story does not have any passages yet.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error: any) {
      console.error("Error opening story:", error);
      Alert.alert("Error", "Failed to load story passages. Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
  };

  // Chapter selection is not needed for Django backend (no chapters)
  const handleChapterSelect = async (chapterId: number) => {
    try {
      console.log("=== handleChapterSelect called ===");
      console.log("Chapter ID:", chapterId);
      console.log("Selected story:", selectedStory);
      console.log("Selected story ID:", selectedStory?.id);

      // Close the chapter selection modal first
      setIsChapterScreenVisible(false);

      // For chapter-based stories, we need to get the story passages with the specific chapter
      if (selectedStory?.id) {
        console.log(
          "Opening story with chapter:",
          selectedStory.id,
          "chapter:",
          chapterId
        );

        // Get story passages from the selected chapter
        console.log("Calling getStorypassagesFromChapter with:", {
          storyId: selectedStory.id,
          chapterId: chapterId
        });
        const storypassages = await apiService.getStorypassagesFromChapter(
          selectedStory.id,
          chapterId
        );
        console.log("Story passages result:", storypassages);
        console.log("Story passages passages:", storypassages?.passages);
        console.log(
          "Story passages passages length:",
          storypassages?.passages?.length
        );

        if (storypassages) {
          console.log("Opening story with chapter passages:", storypassages);
          console.log("Story passages passages:", storypassages.passages);
          console.log(
            "Number of passages in story passages:",
            storypassages.passages?.length
          );

          // Get user's progress for this story
          const progressRecords = await apiService.getStoryProgressRecords(String(selectedStory.id));
          console.log("User progress for story:", progressRecords);
          
          // Calculate exploration percentage based on progress
          let exploration = 0;
          if (progressRecords.length > 0) {
            // Count unique passages visited
            const uniquePassages = new Set(progressRecords.map((p: any) => p.passage_id));
            const totalPassages = storypassages.passages?.length || 1;
            exploration = Math.round((uniquePassages.size / totalPassages) * 100);
          }

          // Create a modified story object with chapter information and progress
          const storyWithChapter = {
            ...selectedStory,
            passages: storypassages, // Pass the entire storypassages object directly
            chapterId: chapterId, // Add the chapter ID to the story object
            exploration: exploration
          };
          console.log(
            "Final story object being passed to StoryScreen:",
            storyWithChapter
          );
          console.log(
            "Final story object passages passages:",
            storyWithChapter.passages?.passages
          );
          console.log(
            "Final story object passages passages length:",
            storyWithChapter.passages?.passages?.length
          );
          ui.openStory(storyWithChapter);
        } else {
          console.log("No passages found for chapter");
          Alert.alert(
            "No passages Available",
            "This chapter does not have any passages yet.",
            [{ text: "OK", style: "default" }]
          );
        }
      } else {
        console.log("No selected story");
        Alert.alert("Error", "No story selected. Please try again.", [
          { text: "OK", style: "default" },
        ]);
      }
    } catch (error) {
      console.error("Error opening chapter:", error);
      Alert.alert(
        "Error",
        "Failed to load chapter passages. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = async (completionData: {
    StoryId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: { [key: string]: number };
  }) => {
    try {
      console.log("=== handleStoryCompleteLocal called ===");
      console.log("Completion data:", completionData);

      // Call the backend to complete the story
      await apiService.completeStory(
        completionData.StoryId,
        completionData.finalRewards,
        completionData.skillsLearned,
        completionData.totalStatGains
      );

      // Update local archive progress
      archive.handleStoryComplete(completionData.StoryId);
      archive.handleSkillLearned(completionData.skillsLearned);

      // Show completion message
      Alert.alert(
        "🎉 Story Completed!",
        "You have successfully completed this story and gained new insights.",
        [
          {
            text: "Continue Exploring",
            onPress: () => {
              handleCloseStory();
              // Optionally refresh the story list
              loadStories();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error completing story:", error);
      Alert.alert(
        "Error",
        "Failed to complete story. Your progress has been saved locally.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  // Codex handlers -- needs to update to backend functionality 
  const handleCodexEntrySubmit = (entry: {
    type: string;
    passages: string;
    prompt: string;
    skillCategory: string;
    mapArea: string;
    difficulty: string;
  }) => {
    archive.handleCodexEntry(entry);

    Alert.alert(
      "📝 Reflection Recorded",
      `Your ${entry.skillCategory} reflection has been added to the Archive.`,
      [{ text: "Continue Exploring", style: "default" }]
    );
  };

  // Mini-game handlers
  const handleMiniGameCompleteSubmit = (
    gameType: "thoughtDefender" | "drawing",
    data: any
  ) => {
    archive.handleMiniGameComplete(gameType, data);

    if (gameType === "thoughtDefender" && data.won) {
      Alert.alert(
        "🏆 Mind Defense Victory!",
        `You've successfully defended your mind!\n\nLevel: ${data.level}\nScore: ${data.score}`,
        [{ text: "Excellent!", style: "default" }]
      );
    } else if (gameType === "drawing") {
      Alert.alert(
        "🎨 Creative Expression Recorded",
        "Your drawing has been added to the Archive.",
        [{ text: "Continue Creating", style: "default" }]
      );
    }
  };

  //Equipment handlers - now using backend gear system
  const handleEquip = async (item: EquipmentItem) => {
    try {
      // Find the corresponding backend gear item
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.gear_type.name === item.name
      );
      
      if (backendGearItem) {
        await equipment.equipBackendGear(backendGearItem.id);
      } else {
        // Fallback to local equipment system
        equipment.equipItem(item.type, item);
      }
    } catch (error) {
      console.error('Error equipping item:', error);
      Alert.alert('Error', 'Failed to equip item. Please try again.');
    }
  };
  
  const handleUnequip = async (item: EquipmentItem) => {
    try {
      // Find the corresponding backend gear item
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.gear_type.name === item.name
      );
      
      if (backendGearItem) {
        await equipment.unequipBackendGear(backendGearItem.id);
      } else {
        // Fallback to local equipment system
        equipment.unequipItem(item.type);
      }
    } catch (error) {
      console.error('Error unequipping item:', error);
      Alert.alert('Error', 'Failed to unequip item. Please try again.');
    }
  };
  // Tab button component
  const TabButton: React.FC<{
    title: string;
    icon: string;
    isActive: boolean;
    onPress: () => void;
  }> = ({ title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[theme.styles.tabButton, isActive && theme.styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <LinearGradient
          colors={["rgba(217, 119, 6, 0.4)", "rgba(251, 146, 60, 0.4)"]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Icon name={icon} size={18} color={isActive ? "#FCD34D" : "#9CA3AF"} />
      <Text
        style={[theme.styles.tabText, isActive && theme.styles.activeTabText]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Character display component - Updated to use home_data consistently
  const CharacterDisplay = () => {
    // Use homeData from wellness context which comes from the home_data endpoint
    const homeData = wellness.homeData;
    const backendCharacter = character.backendCharacter;

    // Check if we have character data from home_data endpoint
    const hasHomeData = homeData?.character;
    const hasBackendCharacter = backendCharacter;

    if (!hasHomeData && !hasBackendCharacter) {
      return (
        <View style={theme.styles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={theme.styles.characterFrame}
          >
            <View style={theme.styles.characterFrameInner}>
              <Text style={[theme.styles.archiveText, { textAlign: "center" }]}>
                No character created yet
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    // Use home_data character if available, otherwise fall back to backend character
    const characterData = hasHomeData ? homeData.character : backendCharacter;
    
    // wellness_stats comes from home_data, not from the character object directly
    const wellnessStats = hasHomeData && (homeData as any).character?.wellness_stats
      ? (homeData as any).character.wellness_stats
      : null;

    // Ensure characterData is not null before using it
    if (!characterData) {
      return (
        <View style={theme.styles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={theme.styles.characterFrame}
          >
            <View style={theme.styles.characterFrameInner}>
              <Text style={[theme.styles.archiveText, { textAlign: "center" }]}>
                Character data unavailable
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={theme.styles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(139, 92, 246, 0.3)",
            "rgba(79, 70, 229, 0.2)",
            "rgba(6, 182, 212, 0.3)",
          ]}
          style={theme.styles.characterFrame}
        >
          <View style={theme.styles.characterFrameInner}>
            {/* Use CharacterPreview component for consistent display with CharacterCreatorScreen */}
            <CharacterPreview
              baseAsset={character.getBaseAsset()}
              background={character.getCurrentBackgroundAsset()}
              hairSheet={character.getHairAsset()}
              clothesSheet={character.getClothesAsset()}
              eyesSheet={character.getEyesAsset()}
              eyebrowsSheet={character.getEyebrowsAsset()}
              mouthSheet={character.getMouthAsset()}
              hairIndex={characterData.character_config?.selected_hair_style || character.getHairIndex()}
              clothesIndex={characterData.character_config?.selected_shirt_type || character.getClothesIndex()}
              eyesIndex={characterData.character_config?.selected_eye_type || character.getEyesIndex()}
              eyebrowsIndex={characterData.character_config?.selected_eyebrow_style || character.getEyebrowsIndex()}
              mouthIndex={characterData.character_config?.selected_mouth_type || character.selectedMouthType}
            />

            {/* Character Level and Status */}
            <View style={theme.styles.characterLevelBadge}>
              <LinearGradient
                colors={["#FCD34D", "#F59E0B"]}
                style={theme.styles.levelBadgeGradient}
              >
                <Text style={theme.styles.levelBadgeText}>
                  Lv.{characterData.level || 1}
                </Text>
              </LinearGradient>
            </View>

            {/* Essence Resonance Indicator */}
            <View style={theme.styles.essenceResonanceIndicator}>
              <LinearGradient
                colors={["rgba(139, 92, 246, 0.8)", "rgba(79, 70, 229, 0.8)"]}
                style={theme.styles.essenceResonanceGradient}
              >
                <Icon name="zap" size={12} color="#FCD34D" />
                <Text style={theme.styles.essenceResonanceText}>
                  {(characterData as any).wellness_average || 87}% Resonance
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>

        {/* Character Mood Bubble */}
        <View style={theme.styles.characterMoodBubble}>
          <LinearGradient
            colors={["#FEF3C7", "#FDE68A"]}
            style={theme.styles.moodBubbleGradient}
          >
            <Text style={theme.styles.moodBubbleText}>
              "Ready to explore the depths of memory..."
            </Text>
          </LinearGradient>
        </View>

        {/* Manage Equipment Button */}
        <TouchableOpacity 
          onPress={() => setShowEquipmentModal(true)}
          style={{
            marginTop: 16,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(139, 92, 246, 0.3)',
            alignSelf: 'center'
          }}
          activeOpacity={0.8}
        >
          <Text style={{
            color: '#FCD34D',
            fontSize: 14,
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Manage Equipment
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={theme.styles.archiveContainer}>
      <StatusBar
        barStyle={
          theme.themeMode === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor={theme.theme.archiveBackground}
      />

      {/* Gothic Background */}
      <LinearGradient
        colors={[
          theme.theme.archiveGradientStart,
          theme.theme.archiveGradientMiddle,
          theme.theme.archiveGradientEnd,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric Overlay */}
      <View style={theme.styles.atmosphericOverlay} />

      <View style={theme.styles.archivepassages}>
        {/* Archive Header */}
        <View style={theme.styles.archiveHeader}>
          <LinearGradient
            colors={[
              "rgba(30, 41, 59, 0.6)",
              "rgba(51, 65, 85, 0.4)",
              "rgba(30, 41, 59, 0.6)",
            ]}
            style={theme.styles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={theme.styles.archiveHeaderpassages}>
              <View style={theme.styles.archiveHeaderLeft}>
                <LinearGradient
                  colors={["#D97706", "#F97316", "#DC2626"]}
                  style={theme.styles.archiveHeaderIcon}
                >
                  <Icon name="book" size={20} color="white" />
                  <View style={theme.styles.archiveHeaderIconOverlay}>
                    <Icon name="zap" size={12} color="#FCD34D" />
                  </View>
                </LinearGradient>
                <View style={theme.styles.archiveHeaderTextContainer}>
                  <Text style={theme.styles.archiveHeaderTitle}>
                    The Archive
                  </Text>
                  <Text style={theme.styles.archiveHeaderSubtitle}>
                    Keeper of Memory • Curator of Hidden Knowledge
                  </Text>
                  <View style={theme.styles.archiveStatusIndicator}>
                    <View style={theme.styles.archiveStatusDot} />
                    <Text style={theme.styles.archiveStatusText}>
                      Archive systems active
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={theme.styles.archiveTabContainer}>
          <LinearGradient
            colors={[
              "rgba(30, 41, 59, 0.8)",
              "rgba(51, 65, 85, 0.9)",
              "rgba(30, 41, 59, 0.8)",
            ]}
            style={theme.styles.archiveTabGradient}
          >
            <BlurView intensity={20} style={theme.styles.archiveTabpassages}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={theme.styles.archiveTabScrollpassages}
              >
                <TabButton
                  title="Entrance Hall"
                  icon="home"
                  isActive={ui.activeTab === "entrance"}
                  onPress={() => ui.setActiveTab("entrance")}
                />
                <TabButton
                  title="Ancient Storys"
                  icon="book-open"
                  isActive={ui.activeTab === "tomes"}
                  onPress={() => ui.setActiveTab("tomes")}
                />
                <TabButton
                  title="Codex"
                  icon="edit-3"
                  isActive={ui.activeTab === "codex"}
                  onPress={() => ui.setActiveTab("codex")}
                />
                <TabButton
                  title="Mind Defender"
                  icon="zap"
                  isActive={ui.activeTab === "defender"}
                  onPress={() => ui.setActiveTab("defender")}
                />
                {/*`<TabButton
                  title="Memory Map"
                  icon="map"
                  isActive={ui.activeTab === "map"}
                  onPress={() => ui.setActiveTab("map")}
                />*/}
                <TabButton
                  title="Restoration"
                  icon="award"
                  isActive={ui.activeTab === "restoration"}
                  onPress={() => ui.setActiveTab("restoration")}
                />
              </ScrollView>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab passages */}
        <ScrollView
          style={theme.styles.archiveTabpassagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Entrance Hall Tab */}
          {ui.activeTab === "entrance" && (
            <View style={theme.styles.tabpassagesArea}>
              {/* Avatar Showcase Section */}
              <View style={theme.styles.avatarShowcaseSection}>
                <LinearGradient
                  colors={[
                    "rgba(30, 41, 59, 0.95)",
                    "rgba(51, 65, 85, 0.8)",
                    "rgba(30, 41, 59, 0.95)",
                  ]}
                  style={theme.styles.avatarShowcaseGradient}
                >
                  {/* Header */}
                  <View style={theme.styles.avatarShowcaseHeader}>
                    <Icon name="user" size={20} color="#A855F7" />
                    <Text style={theme.styles.avatarShowcaseTitle}>
                      Avatar Manifestation
                    </Text>
                    <Icon name="user" size={20} color="#A855F7" />
                  </View>

                  {/* Character Info Bar */}
                  <View style={theme.styles.characterInfoBar}>
                    <View style={theme.styles.characterDetails}>
                      <Text style={theme.styles.characterRarity}>
                        Memory Archivist
                      </Text>
                      <Text style={theme.styles.characterClass}>
                        Keeper of Hidden Knowledge
                      </Text>
                      <Text style={theme.styles.characterName}>
                        {wellness.homeData?.character?.name ||
                          character.characterName ||
                          "Unnamed Character"}
                      </Text>
                    </View>

                    {/*<TouchableOpacity
                      style={theme.styles.researchConditionBadge}
                      onPress={() =>
                        ui.setResearchCondition(
                          ui.researchCondition === "character"
                            ? "personality"
                            : "character"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          ui.researchCondition === "character"
                            ? [
                                "rgba(139, 92, 246, 0.8)",
                                "rgba(79, 70, 229, 0.8)",
                              ]
                            : ["rgba(55, 65, 81, 0.8)", "rgba(75, 85, 99, 0.8)"]
                        }
                        style={theme.styles.researchConditionGradient}
                      >
                        <Text style={theme.styles.researchConditionText}>
                          {ui.researchCondition === "character"
                            ? "✦ Avatar Path ✦"
                            : "⧫ Essence Path ⧫"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>*/}

                  </View>

                  {/* Main Character Display with Gear - Updated for Backend Integration */}
                  <View style={theme.styles.characterDisplaySection}>
                    {/* Left Gear Column */}
                    <View style={theme.styles.gearColumn}>
                      {[
                        {
                          type: "focus" as keyof EquippedItems,
                          label: "Focus Item",
                          icon: "🔮",
                          slot: "weapon" as const,
                        },
                        {
                          type: "comfort" as keyof EquippedItems,
                          label: "Comfort Layer",
                          icon: "📜",
                          slot: "armor" as const,
                        },
                      ].map((slot, i) => (
                        <TouchableOpacity
                          key={i}
                          style={theme.styles.gearSlot}
                          onPress={() => {
                            setShowEquipmentModal(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(51, 65, 85, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                            ]}
                            style={theme.styles.gearSlotGradient}
                          >
                            {equipment.equippedItems[slot.type] ? (
                              <Image
                                source={equipment.getItemIcon(
                                  equipment.equippedItems[slot.type]!
                                )}
                                style={theme.styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={theme.styles.emptyGearSlot}>
                                <Text style={theme.styles.gearSlotIcon}>
                                  {slot.icon}
                                </Text>
                                <Text style={theme.styles.gearSlotLabel}>
                                  {slot.label}
                                </Text>
                                <Text style={{
                                  color: '#6B7280',
                                  fontSize: 6,
                                  textAlign: 'center',
                                  marginTop: 2
                                }}>
                                  Locked
                                </Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Central Character Display */}
                    <CharacterDisplay />

                    {/* Right Gear Column */}
                    <View style={theme.styles.gearColumn}>
                      {[
                        {
                          type: "shield" as keyof EquippedItems,
                          label: "Mind Shield",
                          icon: "🛡️",
                          slot: "helmet" as const,
                        },
                        {
                          type: "ground" as keyof EquippedItems,
                          label: "Ground Stone",
                          icon: "⚓",
                          slot: "boots" as const,
                        },
                      ].map((slot, i) => (
                        <TouchableOpacity
                          key={i}
                          style={theme.styles.gearSlot}
                          onPress={() => {
                            setShowEquipmentModal(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(51, 65, 85, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                            ]}
                            style={theme.styles.gearSlotGradient}
                          >
                            {equipment.equippedItems[slot.type] ? (
                              <Image
                                source={equipment.getItemIcon(
                                  equipment.equippedItems[slot.type]!
                                )}
                                style={theme.styles.gearIcon}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={theme.styles.emptyGearSlot}>
                                <Text style={theme.styles.gearSlotIcon}>
                                  {slot.icon}
                                </Text>
                                <Text style={theme.styles.gearSlotLabel}>
                                  {slot.label}
                                </Text>
                                <Text style={{
                                  color: '#6B7280',
                                  fontSize: 6,
                                  textAlign: 'center',
                                  marginTop: 2
                                }}>
                                  Locked
                                </Text>
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Research Condition Info Could maybe be removed as this is a differernt page */}
                  {ui.researchCondition === "personality" ? null : null}
                </LinearGradient>
              </View>

              {/* Archive Foundations Section - Updated to use home_data metrics */}
              <View style={theme.styles.foundationsSection}>
                <LinearGradient
                  colors={[
                    "rgba(30, 41, 59, 0.9)",
                    "rgba(51, 65, 85, 0.7)",
                    "rgba(30, 41, 59, 0.9)",
                  ]}
                  style={theme.styles.foundationsSectionGradient}
                >
                  <View style={theme.styles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#10B981" />
                    <Text style={theme.styles.foundationsTitle}>
                      Archive Foundations
                    </Text>
                    <Icon name="anchor" size={20} color="#10B981" />
                  </View>
                  <Text style={theme.styles.foundationsSubtitle}>
                    The ethereal pillars that support your mental architecture
                  </Text>

                  <View style={theme.styles.foundationsGrid}>
                    {/* Use home_data wellness_stats if available, otherwise fall back to local archive foundations */}
                    {(
                      (wellness.homeData as any)?.character?.wellness_stats ||
                      archive.archiveFoundations
                    ).map((foundation: any, index: number) => {
                      // Handle both wellness_stats format and archive foundations format
                      const isWellnessStats =
                        "label" in foundation && "value" in foundation;

                      if (isWellnessStats) {
                        // Format from home_data endpoint
                        return (
                          <TouchableOpacity
                            key={index}
                            style={theme.styles.foundationCard}
                            onPress={() =>
                              Alert.alert(
                                `${foundation.label} - Level ${
                                  Math.floor(foundation.value / 5) + 1
                                }`,
                                `Your ${foundation.label.toLowerCase()} foundation\n\n🎯 Current Value: ${
                                  foundation.value
                                }/20`
                              )
                            }
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={[
                                "rgba(51, 65, 85, 0.8)",
                                "rgba(30, 41, 59, 0.6)",
                                "rgba(51, 65, 85, 0.8)",
                              ]}
                              style={theme.styles.foundationCardGradient}
                            >
                              <View
                                style={theme.styles.foundationIconContainer}
                              >
                                <Text style={theme.styles.foundationIcon}>
                                  {foundation.icon}
                                </Text>
                              </View>

                              <View
                                style={theme.styles.foundationValueContainer}
                              >
                                <Text style={theme.styles.foundationValue}>
                                  {foundation.value}
                                  <Text style={theme.styles.foundationMaxValue}>
                                    /20
                                  </Text>
                                </Text>
                                <Text style={theme.styles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>

                              <View
                                style={theme.styles.foundationProgressContainer}
                              >
                                <View
                                  style={theme.styles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={[
                                      foundation.color,
                                      foundation.color,
                                    ]}
                                    style={[
                                      theme.styles.foundationProgressFill,
                                      {
                                        width: `${
                                          (foundation.value / 20) * 100
                                        }%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={theme.styles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>

                              <Text style={theme.styles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={theme.styles.foundationDescription}>
                                Your {foundation.label.toLowerCase()} foundation
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      } else {
                        // Original archive foundations format
                        return (
                          <TouchableOpacity
                            key={index}
                            style={theme.styles.foundationCard}
                            onPress={() =>
                              Alert.alert(
                                `${foundation.label} - Level ${
                                  Math.floor(foundation.value / 2) + 1
                                }`,
                                `${foundation.description}\n\n🎯 Next Unlock: ${foundation.nextUnlock}`
                              )
                            }
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={[
                                "rgba(51, 65, 85, 0.8)",
                                "rgba(30, 41, 59, 0.6)",
                                "rgba(51, 65, 85, 0.8)",
                              ]}
                              style={theme.styles.foundationCardGradient}
                            >
                              <View
                                style={theme.styles.foundationIconContainer}
                              >
                                <Text style={theme.styles.foundationIcon}>
                                  {foundation.icon}
                                </Text>
                                {foundation.recentGain > 0 && (
                                  <View style={theme.styles.recentGainBadge}>
                                    <LinearGradient
                                      colors={["#10B981", "#34D399"]}
                                      style={theme.styles.recentGainGradient}
                                    >
                                      <Text style={theme.styles.recentGainText}>
                                        +{foundation.recentGain}
                                      </Text>
                                    </LinearGradient>
                                  </View>
                                )}
                              </View>

                              <View
                                style={theme.styles.foundationValueContainer}
                              >
                                <Text style={theme.styles.foundationValue}>
                                  {foundation.value}
                                  <Text style={theme.styles.foundationMaxValue}>
                                    /{foundation.maxValue}
                                  </Text>
                                </Text>
                                <Text style={theme.styles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>

                              <View
                                style={theme.styles.foundationProgressContainer}
                              >
                                <View
                                  style={theme.styles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={foundation.colors as any}
                                    style={[
                                      theme.styles.foundationProgressFill,
                                      {
                                        width: `${
                                          (foundation.value /
                                            foundation.maxValue) *
                                          100
                                        }%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={theme.styles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>

                              <Text style={theme.styles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={theme.styles.foundationDescription}>
                                {foundation.description}
                              </Text>

                              <View style={theme.styles.nextUnlockContainer}>
                                <Icon name="lock" size={10} color="#FCD34D" />
                                <Text style={theme.styles.nextUnlockText}>
                                  {foundation.nextUnlock}
                                </Text>
                              </View>
                            </LinearGradient>
                          </TouchableOpacity>
                        );
                      }
                    })}
                  </View>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Ancient Storys Tab - Show Story list directly */}
          {ui.activeTab === "tomes" && (
            <View style={theme.styles.tabpassagesArea}>
              {isLoadingStories ? (
                <View style={theme.styles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={theme.styles.centeredMessageTitle}>
                    Loading Storys...
                  </Text>
                  <Text style={theme.styles.centeredMessageText}>
                    Fetching ancient wisdom from the Archive...
                  </Text>
                </View>
              ) : stories.length > 0 ? (
                stories.map((Story, index) => (
                                        <TouchableOpacity
                        key={index}
                        style={theme.styles.chronicleCard}
                        onPress={() => {
                          console.log("=== STORY CARD CLICKED ===");
                          console.log("Story:", Story);
                          console.log("Story ID:", Story.id);
                          console.log("Story title:", Story.title);
                          console.log("Chapter count:", Story.chapter_count);
                          handleOpenStory(Story);
                        }}
                        activeOpacity={0.8}
                      >
                    <LinearGradient
                      colors={
                        [
                          "rgba(30, 41, 59, 0.95)",
                          "rgba(51, 65, 85, 0.8)",
                          "rgba(30, 41, 59, 0.95)",
                        ] as const
                      }
                      style={theme.styles.chronicleGradient}
                    >
                      <View style={theme.styles.chronicleTopBorder} />

                      <View style={theme.styles.chronicleHeader}>
                        <View style={theme.styles.chronicleInfo}>
                          <Text style={theme.styles.chronicleTitle}>
                            {Story.title || "Untitled Story"}
                          </Text>
                          <View style={theme.styles.chronicleBadges}>
                            <View style={theme.styles.categoryBadge}>
                              <Text style={theme.styles.categoryBadgeText}>
                                {Story.category || "Unknown"}
                              </Text>
                            </View>
                            <View style={theme.styles.difficultyBadge}>
                              <Text style={theme.styles.difficultyBadgeText}>
                                {Story.difficulty || "Unknown"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={theme.styles.chronicleDescriptionContainer}>
                        <Text style={theme.styles.chronicleDescription}>
                          {Story.description || "No description available"}
                        </Text>
                        <Text style={theme.styles.chronicleAtmosphere}>
                          ✦ {Story.atmosphere || "Mysterious atmosphere"} ✦
                        </Text>
                      </View>

                      <View style={theme.styles.explorationContainer}>
                        <View style={theme.styles.explorationHeader}>
                          <Icon name="compass" size={16} color="#06B6D4" />
                          <Text style={theme.styles.explorationLabel}>
                            Exploration Progress
                          </Text>
                          <Text style={theme.styles.explorationValue}>
                            {Story.exploration || 0}%
                          </Text>
                        </View>
                        <View style={theme.styles.explorationBar}>
                          <LinearGradient
                            colors={["#06B6D4", "#A855F7", "#4F46E5"] as const}
                            style={[
                              theme.styles.explorationFill,
                              { width: `${Story.exploration || 0}%` },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={theme.styles.chronicleStats}>
                        <View style={theme.styles.chronicleStat}>
                          <Icon name="key" size={16} color="#FCD34D" />
                          <Text style={theme.styles.chronicleStatText}>
                            {Story.revelations || 0} revelations
                          </Text>
                        </View>
                        <View style={theme.styles.chronicleStat}>
                          <Icon name="clock" size={16} color="#FB923C" />
                          <Text style={theme.styles.chronicleStatText}>
                            {Story.timeToComplete || "Unknown time"}
                          </Text>
                        </View>
                      </View>

                      <View style={theme.styles.chronicleButton}>
                        <LinearGradient
                          colors={["#7C3AED", "#4F46E5", "#7C3AED"] as const}
                          style={theme.styles.chronicleButtonGradient}
                        >
                          <Icon name="book-open" size={18} color="#E0E7FF" />
                          <Text style={theme.styles.chronicleButtonText}>
                            {archive.completedStories.has(Story?.id || "")
                              ? "Restart Exploration"
                              : Story.exploration > 0
                              ? "Resume Exploration"
                              : "Enter Ancient Story"}
                          </Text>
                        </LinearGradient>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={theme.styles.centeredMessageContainer}>
                  <Icon
                    name="book"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={theme.styles.centeredMessageTitle}>
                    No Storys Available
                  </Text>
                  <Text style={theme.styles.centeredMessageText}>
                    The Archive is currently empty. Check back later for new
                    wisdom to discover.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Codex Tab */}
          {ui.activeTab === "codex" && (
            <View style={theme.styles.tabpassagesArea}>
              {/* Journal Prompts Test Section */}
              <View style={theme.styles.centeredMessageContainer}>
                <Icon
                  name="bookmark"
                  size={30}
                  color="#10B981"
                  style={{ marginBottom: 12 }}
                />
                <Text style={[theme.styles.centeredMessageTitle, { fontSize: 18, marginBottom: 12 }]}>
                  Current Journal Prompts
                </Text>
                <TouchableOpacity
                  style={[theme.styles.primaryButton, { marginBottom: 16 }]}
                  onPress={() => {
                    const unlockedAreas = ["entrance"]; // Add more areas as needed
                    const completedStories = Array.from(archive.completedStories);
                    wellness.loadCategoryPrompts(unlockedAreas, completedStories);
                  }}
                >
                  <LinearGradient
                    colors={["#10B981", "#059669"]}
                    style={theme.styles.primaryButtonGradient}
                  >
                    <Icon name="refresh-cw" size={18} color="#D1FAE5" />
                    <Text style={theme.styles.primaryButtonText}>
                      Load Prompts
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Display Current Prompts */}
                <View style={{ width: '100%', marginBottom: 20 }}>
                  {['journal', 'draw', 'voice'].map((category) => {
                    const prompt = wellness.categoryPrompts[category as keyof typeof wellness.categoryPrompts];
                    return (
                      <View key={category} style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)'
                      }}>
                        <Text style={{
                          color: '#A855F7',
                          fontSize: 14,
                          fontWeight: 'bold',
                          marginBottom: 4,
                          textTransform: 'capitalize'
                        }}>
                          {category} Quest:
                        </Text>
                        <Text style={{
                          color: theme.theme.archiveText,
                          fontSize: 12,
                          lineHeight: 16
                        }}>
                          {prompt 
                            ? `${prompt.text} (${prompt.skill_category} - ${prompt.difficulty})`
                            : "No quest available yet"
                          }
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              <View style={theme.styles.centeredMessageContainer}>
                <Icon
                  name="edit-3"
                  size={40}
                  color="#A855F7"
                  style={{ marginBottom: 16 }}
                />
                <Text style={theme.styles.centeredMessageTitle}>The Codex</Text>
                <Text style={theme.styles.centeredMessageText}>
                  Your personal journal for reflections, insights, and tracking
                  your journey of self-discovery.
                </Text>
                <TouchableOpacity
                  style={theme.styles.primaryButton}
                  onPress={() => ui.setIsCodexVisible(true)}
                >
                  <LinearGradient
                    colors={["#7C3AED", "#4F46E5"]}
                    style={theme.styles.primaryButtonGradient}
                  >
                    <Icon name="book-open" size={18} color="#E0E7FF" />
                    <Text style={theme.styles.primaryButtonText}>
                      Open Your Journal
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mind Defender Tab */}
          {ui.activeTab === "defender" && (
            <View style={theme.styles.tabpassagesArea}>
              <View style={theme.styles.centeredMessageContainer}>
                <Icon
                  name="zap"
                  size={40}
                  color="#FCD34D"
                  style={{ marginBottom: 16 }}
                />
                <Text style={theme.styles.centeredMessageTitle}>
                  Mind Defender
                </Text>
                <Text style={theme.styles.centeredMessageText}>
                  A mini-game to train your focus and resilience against
                  intrusive thoughts.
                </Text>
                <TouchableOpacity
                  style={theme.styles.primaryButton}
                  onPress={() => ui.setIsThoughtDefenderVisible(true)}
                >
                  <LinearGradient
                    colors={["#F97316", "#F59E0B"]}
                    style={theme.styles.primaryButtonGradient}
                  >
                    <Icon name="zap" size={18} color="#FEF3C7" />
                    <Text style={theme.styles.primaryButtonText}>Play Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Restoration Tab - Updated to use home_data archive_metrics */}
          {ui.activeTab === "restoration" && (
            <View style={theme.styles.archiveTabpassagesArea}>
              {/* Restoration metrics from home_data */}
              <View style={theme.styles.archiveRestorationGrid}>
                {(
                  wellness.homeData?.archive_metrics || [
                    {
                      icon: "📜",
                      label: "Memories Explored",
                      value: `${archive.restorationMetrics.chroniclesExplored}/12`,
                      progress:
                        (archive.restorationMetrics.chroniclesExplored / 12) *
                        100,
                      description: "Memory fragments fully integrated",
                    },
                    {
                      icon: "💎",
                      label: "Artifacts Discovered",
                      value: `${archive.restorationMetrics.artifactsDiscovered}`,
                      progress:
                        (archive.restorationMetrics.artifactsDiscovered / 50) *
                        100,
                      description: "Coping mechanisms crystallized into tools",
                    },
                    {
                      icon: "🗝️",
                      label: "Revelations Unlocked",
                      value: `${archive.restorationMetrics.revelationsUnlocked}`,
                      progress:
                        (archive.restorationMetrics.revelationsUnlocked / 100) *
                        100,
                      description: "Hidden chambers of self-knowledge opened",
                    },
                  ]
                ).map((metric, index) => (
                  <View key={index} style={theme.styles.archiveRestorationCard}>
                    <LinearGradient
                      colors={[
                        "rgba(30, 41, 59, 0.9)",
                        "rgba(51, 65, 85, 0.7)",
                        "rgba(30, 41, 59, 0.9)",
                      ]}
                      style={theme.styles.archiveRestorationCardGradient}
                    >
                      <Text style={theme.styles.archiveRestorationIcon}>
                        {metric.icon}
                      </Text>
                      <Text style={theme.styles.archiveRestorationLabel}>
                        {metric.label}
                      </Text>
                      <Text style={theme.styles.archiveRestorationValue}>
                        {metric.value}
                      </Text>
                      <Text style={theme.styles.archiveRestorationDescription}>
                        {wellness.homeData?.archive_metrics
                          ? `Progress: ${metric.progress}%`
                          : (metric as any).description ||
                            "Archive progress tracking"}
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modals */}
      {ui.selectedStory && (
        <StoryScreen
          visible={ui.isStoryVisible}
          onClose={handleCloseStory}
          story={ui.selectedStory as any}
          chapter={{ 
            id: (ui.selectedStory as any)?.chapterId || 1, 
            title: ui.selectedStory?.title || "Chapter 1",
            content: ui.selectedStory?.description || "",
            chapter_number: (ui.selectedStory as any)?.chapterId || 1,
            is_starting_chapter: (ui.selectedStory as any)?.chapterId === 1,
            variables: {},
            requirements: {},
            rewards: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            passages: (ui.selectedStory?.passages as any)?.passages || []
          } as any}
          passage={(ui.selectedStory?.passages as any)?.passages?.[0] || {} as any}
          choices={(ui.selectedStory?.passages as any)?.passages?.[0]?.choices || []}
          onStatGain={() => {}} // This would be handled by the master state
          onArtifactUnlock={(artifact: string) => archive.handleArtifactUnlock({ name: artifact } as any)}
          onSkillLearned={archive.handleSkillLearned}
          onStoryComplete={(completionData) => handleStoryCompleteLocal({
            StoryId: completionData.storyId,
            finalRewards: completionData.finalRewards,
            skillsLearned: completionData.skillsLearned,
            totalStatGains: completionData.totalStatGains
          })}
        />
      )}

      {/* Chapter Selection Modal */}
      <ChapterScreen
        visible={isChapterScreenVisible}
        onClose={() => setIsChapterScreenVisible(false)}
        storyId={selectedStory?.id || ""}
        storyTitle={selectedStory?.title || "Unknown Story"}
        onChapterSelect={handleChapterSelect}
      />

      <CodexModal
        visible={ui.isCodexVisible}
        onClose={() => ui.setIsCodexVisible(false)}
        onSave={handleCodexEntrySubmit}
        unlockedAreas={archive.codexEntries.map((entry) => entry.mapArea)}
      />

      <ThoughtDefenderModal
        visible={ui.isThoughtDefenderVisible}
        onClose={() => ui.setIsThoughtDefenderVisible(false)}
        onScoreUpdate={(data: { score: number; level: number; won: boolean }) =>
          handleMiniGameCompleteSubmit("thoughtDefender", data)
        }
      />
      <EquipmentModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        onEquip={handleEquip}
        onUnequip={handleUnequip}
        inventory={equipment.inventory ?? []}
        equippedItems={equipment.equippedItems}
      />

    </View>
  );
};

export default ArchiveInterface;
