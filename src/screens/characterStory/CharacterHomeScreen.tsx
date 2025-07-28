import { useFocusEffect, useRouter } from "expo-router";
import { Linking } from "react-native";
import EquipmentModal from "../../components/EquipmentModal";
import { useMasterState } from "../../context/MasterStateContext";
import {
  Alert,
  AsyncStorage,
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
  Story,
  StyleSheet,
  Text,
  ThoughtDefenderModal,
  TouchableOpacity,
  View,
  useEffect,
  useState
} from "../../imports";
// Import StoryScreen directly to avoid circular dependency issues
import React from "react";
import { archiveHeaderIcon, equipmentIcons } from "../../assets/equipment";
import { apiService } from "../../services/apiService";
import ChapterScreen from "./ChapterScreen";
import StoryScreen from "./StoryScreen";

const { width, height } = Dimensions.get("window"); //remove

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

  const router = useRouter();

  // Local state for stories
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  // Chapter selection state
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  // Helper function to get equipped gear for a specific slot
  const getEquippedGearForSlot = (slot: 'weapon' | 'armor' | 'helmet' | 'boots') => {
    return equipment.equippedGear.find(gear => gear.gear_type.slot === slot);
  };

  // Helper function to get equipment image for gear slots
  const getGearSlotImage = (gear: any) => {
    const slot = gear.gear_type.slot;
    const name = gear.gear_type.name.toLowerCase();
    
    // Map backend slot to frontend equipment type
    let equipmentType: string;
    let subtype: string;
    
    switch (slot) {
      case 'weapon':
        // Check for specific weapon types first
        if (name.includes('scroll') || name.includes('stillness')) {
          equipmentType = 'focus';
          subtype = 'scroll';
        } else if (name.includes('wand') || name.includes('magic')) {
          equipmentType = 'focus';
          subtype = 'magicWand';
        } else if (name.includes('staff') || name.includes('topaz')) {
          equipmentType = 'focus';
          subtype = 'topazStaff';
        } else if (name.includes('sapphire')) {
          equipmentType = 'focus';
          subtype = 'sapphireStaff';
        } else if (name.includes('torch')) {
          equipmentType = 'focus';
          subtype = 'torch';
        } else if (name.includes('sword') || name.includes('iron')) {
          equipmentType = 'combat';
          subtype = 'ironSword';
        } else if (name.includes('golden') || name.includes('gold')) {
          equipmentType = 'combat';
          subtype = 'goldenSword';
        } else if (name.includes('shield')) {
          if (name.includes('iron')) {
            equipmentType = 'combat';
            subtype = 'ironShield';
          } else {
            equipmentType = 'combat';
            subtype = 'woodenShield';
          }
        } else {
          // Default focus items
          equipmentType = 'focus';
          if (name.includes('breathing') || name.includes('breath')) {
            subtype = 'breathing';
          } else if (name.includes('journal') || name.includes('notebook')) {
            subtype = 'journaling';
          } else {
            subtype = 'meditation';
          }
        }
        break;
        
      case 'armor':
        // Check for specific armor types
        if (name.includes('item_27') || name.includes('item27')) {
          equipmentType = 'comfort';
          subtype = 'item27';
        } else if (name.includes('item_29') || name.includes('item29')) {
          equipmentType = 'comfort';
          subtype = 'item29';
        } else if (name.includes('item_31') || name.includes('item31')) {
          equipmentType = 'comfort';
          subtype = 'item31';
        } else {
          // Default comfort mapping
          equipmentType = 'comfort';
          if (name.includes('social') || name.includes('friend') || name.includes('style')) {
            subtype = 'social';
          } else if (name.includes('hobby') || name.includes('activity')) {
            subtype = 'hobby';
          } else if (name.includes('nature') || name.includes('outdoor')) {
            subtype = 'nature';
          } else {
            subtype = 'social';
          }
        }
        break;
        
      case 'helmet':
        // Check for specific helmet types
        if (name.includes('wizard') || name.includes('hat')) {
          equipmentType = 'shield';
          subtype = 'wizardHat';
        } else if (name.includes('helm') && !name.includes('iron') && !name.includes('leather')) {
          equipmentType = 'shield';
          subtype = 'helm';
        } else if (name.includes('iron')) {
          equipmentType = 'shield';
          subtype = 'ironHelmet';
        } else if (name.includes('leather')) {
          equipmentType = 'shield';
          subtype = 'leatherHelmet';
        } else {
          // Default shield mapping
          equipmentType = 'shield';
          if (name.includes('boundary') || name.includes('limit')) {
            subtype = 'boundary';
          } else if (name.includes('affirmation') || name.includes('positive')) {
            subtype = 'affirmation';
          } else if (name.includes('routine') || name.includes('habit')) {
            subtype = 'routine';
          } else {
            subtype = 'boundary';
          }
        }
        break;
        
      case 'boots':
        // Check for specific boot types
        if (name.includes('iron')) {
          equipmentType = 'ground';
          subtype = 'ironBoot';
        } else if (name.includes('leather')) {
          equipmentType = 'ground';
          subtype = 'leatherBoot';
        } else {
          // Default ground mapping
          equipmentType = 'ground';
          if (name.includes('exercise') || name.includes('movement')) {
            subtype = 'exercise';
          } else if (name.includes('sleep') || name.includes('rest')) {
            subtype = 'sleep';
          } else if (name.includes('nutrition') || name.includes('food')) {
            subtype = 'nutrition';
          } else {
            subtype = 'exercise';
          }
        }
        break;
        
      default:
        equipmentType = 'focus';
        subtype = 'meditation';
    }
    
    // Try to get the specific asset, fall back to default if not found
    try {
      const asset = (equipmentIcons as any)[equipmentType][subtype];
      if (asset) {
        return asset;
      }
    } catch (error) {
      console.warn(`Asset not found for ${equipmentType}.${subtype}, falling back to default`);
    }
    
    // Fallback to default assets
    switch (slot) {
      case 'weapon':
        return equipmentIcons.focus.meditation;
      case 'armor':
        return equipmentIcons.comfort.social;
      case 'helmet':
        return equipmentIcons.shield.boundary;
      case 'boots':
        return equipmentIcons.ground.exercise;
      default:
        return equipmentIcons.focus.meditation;
    }
  };





  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      // For the Character path, get only character stories (empty personality_focus)
      const backendStories = await apiService.getCharacterStories();
      const allProgressRecords = await apiService.getStoryProgressRecords('');
      const progressMap = new Map(allProgressRecords.map((p: any) => [p.story, p]));

      // Combine stories with their progress. DO NOT load chapters or passages.
      const storiesWithProgress = backendStories.map((story: any) => {
        const progress = progressMap.get(story.id);
        return {
          ...story,
          exploration: progress?.progress_percentage || 0,
          revelations: progress?.choices_made_count || 0,
        };
      });

      setStories(storiesWithProgress);
      ui.setMemoryStorys(storiesWithProgress);
    } catch (error) {
      console.error("Failed to load stories:", error);
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Function to restart all stories and refresh the display
  const restartAllStories = async () => {
    setIsLoadingStories(true);
    try {
      console.log('=== RESTARTING ALL CHARACTER STORIES ===');
      
      // Get all character stories
      const backendStories = await apiService.getCharacterStories();
      console.log('Found stories to restart:', backendStories?.length || 0);
      
      if (backendStories && backendStories.length > 0) {
        let successCount = 0;
        let failCount = 0;
        
        // Restart each story
        for (const story of backendStories) {
          try {
            console.log(`🔄 Restarting story: ${story.id} - ${story.title}`);
            
            // Call the restart endpoint
            const restartResponse = await apiService.restartStory(story.id);
            console.log(`✅ Successfully restarted story ${story.id}:`, restartResponse);
            successCount++;
            
            // Add a small delay to avoid overwhelming the backend
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.warn(`⚠️ Failed to restart story ${story.id}:`, error);
            failCount++;
          }
        }
        
        console.log(`📊 Restart Summary: ${successCount} successful, ${failCount} failed`);
        
        // Clear any cached story progress data
        console.log('🧹 Clearing cached story data...');
        
        // Clear any story-related state that might be cached
        try {
          const allKeys = await AsyncStorage.getAllKeys();
          const storyCacheKeys = allKeys.filter((key: string) => 
            key.includes('storyState') || 
            key.includes('currentPassage') || 
            key.includes('storyProgress') ||
            key.includes('storyEngine') ||
            key.includes('story') || 
            key.includes('progress') || 
            key.includes('passage') ||
            key.includes('current') ||
            key.includes('chapter') ||
            key.includes('choice')
          );
          if (storyCacheKeys.length > 0) {
            console.log('🧹 Clearing story cache keys:', storyCacheKeys);
            await AsyncStorage.multiRemove(storyCacheKeys);
          }
        } catch (cacheError) {
          console.warn('⚠️ Could not clear story cache:', cacheError);
        }
        
        // Reload stories with fresh progress data (all should show 0% progress now)
        await loadStories();
        
        console.log('✅ All stories restarted and reloaded');
        
        // Show a comprehensive alert with instructions
        Alert.alert(
          "Story Restart Complete!",
          `✅ ${successCount} stories restarted successfully\n⚠️ ${failCount} stories failed to restart\n\nAll stories have been reset to the beginning. You can now start fresh!`,
          [{ text: "Continue Exploring", style: "default" }]
        );
        
      } else {
        console.log('No stories found to restart');
        Alert.alert('No Stories Found', 'No character stories found to restart.');
      }
    } catch (error: any) {
      console.error('❌ Failed to restart stories:', error);
      Alert.alert('Restart Failed', `Failed to restart stories: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Load stories from backend on mount and when switching to relevant tabs
  useEffect(() => {
    if (ui.activeTab === "tomes" || ui.activeTab === "restoration") {
      loadStories();
    }
  }, [ui.activeTab]);
  
  // Initial load
  useEffect(() => {
    loadStories();
    // Load backend gear data on component mount
    equipment.loadBackendGear();
  }, []);




  // Load home data and journal prompts on mount (only once)
  useFocusEffect(
    React.useCallback(() => {
      loadStories();
      equipment.loadBackendGear();
      character.loadCharacter();
      wellness.loadHomeData();

    }, [])
  );

  const handleOpenStory = async (storyToOpen: Story) => {
    setSelectedStory(storyToOpen);
    if (storyToOpen.chapter_count && storyToOpen.chapter_count > 0) {
      // Story has chapters, so open the chapter selection screen.
      setIsChapterScreenVisible(true);
    } else {
      // No chapters, so restart and open the story directly.
      await apiService.restartStory(storyToOpen.id);
      const storyWithoutChapter = {
        ...storyToOpen,
        chapterId: undefined, // Ensure chapterId is not set
      };
      ui.openStory(storyWithoutChapter);
    }
  };

  const handleChapterSelect = async (chapterId: number) => {
    try {
      if (!selectedStory?.id) {
        Alert.alert("Error", "No story selected. Please try again.");
        return;
      }
  
      setIsChapterScreenVisible(false);
      console.log(`✅ Chapter ${chapterId} selected for story ${selectedStory.id}`);
  
      // Create a NEW story object with the chapterId attached.
      const storyWithChapterInfo = {
        ...selectedStory,
        chapterId: chapterId,
        passages: undefined, // Explicitly remove any pre-loaded passage data
      };
      
      // Open the story screen, passing the updated story object.
      ui.openStory(storyWithChapterInfo);
  
    } catch (error) {
      console.error("Failed to handle chapter selection:", error);
      Alert.alert("Error", "Failed to load chapter. Please try again.");
    }
  };



  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = (completionData: { storyId: string; }) => {
    archive.handleStoryComplete(completionData.storyId);
    handleCloseStory();
    loadStories(); // Refresh the story list to show updated progress
    Alert.alert("🎉 Story Completed!", "You have successfully completed this story.");
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
      // Find the corresponding backend gear item by ID (since we pass gearId in the modal)
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.id.toString() === item.id
      );
      
      if (backendGearItem) {
        await equipment.equipBackendGear(backendGearItem.id);
        // Refresh gear data after equipping
        await equipment.loadBackendGear();
        // Refresh home data to update stats immediately
        await wellness.loadHomeData();
      } else {
        // Fallback to local equipment system
        equipment.equipItem(item.type, item);
        await wellness.loadHomeData();
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
      Alert.alert('Error', 'Failed to equip item. Please try again.');
    }
  };
  
  const handleUnequip = async (item: EquipmentItem) => {
    try {
      // Find the corresponding backend gear item by ID
      const backendGearItem = equipment.backendGear.find(gear => 
        gear.id.toString() === item.id
      );
      
      if (backendGearItem) {
        await equipment.unequipBackendGear(backendGearItem.id);
        // Refresh gear data after unequipping
        await equipment.loadBackendGear();
        // Refresh home data to update stats immediately
        await wellness.loadHomeData();
      } else {
        // Fallback to local equipment system
        equipment.unequipItem(item.type);
        await wellness.loadHomeData();
      }
    } catch (error) {
      console.error('Failed to unequip item:', error);
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
          colors={["rgba(78, 230, 230, 0.4)", "rgba(6, 182, 212, 0.4)"]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Icon name={icon} size={18} color={isActive ? "#4ee6e6" : "#9CA3AF"} />
      <Text
        style={[theme.styles.tabText, isActive && {
          color: '#4ee6e6',
          fontWeight: '700',
          textShadowColor: '#4ee6e6',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }]}
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
            "rgba(78, 230, 230, 0.3)",
            "rgba(6, 182, 212, 0.2)",
            "rgba(78, 230, 230, 0.3)",
          ]}
          style={[theme.styles.characterFrame, {
            borderColor: '#d4af37',
            borderWidth: 2,
            shadowColor: '#d4af37',
            shadowOffset: { width: 2, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 12,
          }]}
        >
          <View style={theme.styles.characterFrameInner}>
            {/* Use CharacterPreview component for consistent display with CharacterCreatorScreen */}
            <CharacterPreview
              selectedName={character.getCharacterName()}
              baseAsset={character.getBaseAsset(false)}
              background={character.getCurrentBackgroundAsset(false)}
              hairSheet={character.getHairAsset(false)}
              clothesSheet={character.getClothesAsset(false)}
              eyesSheet={character.getEyesAsset(false)}
              eyebrowsSheet={character.getEyebrowsAsset(false)}
              mouthSheet={character.getMouthAsset(false)}
              hairIndex={character.getHairIndex()}
              clothesIndex={character.getClothesIndex()}
              eyesIndex={character.getEyesIndex()}
              eyebrowsIndex={character.getEyebrowsIndex()}
              mouthIndex={backendCharacter?.selected_mouth_type ?? character.selectedMouthType}
              size={170}
            />

            {/* Character Level and Status */}
            <View style={theme.styles.characterLevelBadge}>
              <LinearGradient
                colors={["#4ee6e6", "#06b6d4"]}
                style={theme.styles.levelBadgeGradient}
              >
                <Text style={{
                  ...theme.styles.levelBadgeText,
                  color: '#0a0b0f',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}>
                  Lv.{characterData.level || 1}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>



        {/* Character Mood Bubble */}
        <View style={theme.styles.characterMoodBubble}>
          <LinearGradient
            colors={["rgba(244, 241, 232, 0.95)", "rgba(212, 175, 55, 0.8)"]}
            style={[theme.styles.moodBubbleGradient, {
              borderColor: '#d4af37',
              shadowColor: '#8b4513',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }]}
          >
            <Text style={{
              ...theme.styles.moodBubbleText,
              color: '#2c1810',
              fontSize: 12,
              fontStyle: 'italic',
              textAlign: 'center',
            }}>
              "Ready to explore the depths of memory..."
            </Text>
          </LinearGradient>
        </View>


      </View>
    );
  };

  return (
    <View style={[theme.styles.archiveContainer, { paddingTop: 50 }]}>
      <StatusBar
        barStyle={
          theme.themeMode === "dark" ? "light-content" : "dark-content"
        }
        backgroundColor="#0a0b0f"
      />

      {/* Gothic Background - Keep existing gradients */}
      <LinearGradient
        colors={[
          theme.theme.archiveGradientStart,
          theme.theme.archiveGradientMiddle,
          theme.theme.archiveGradientEnd,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Atmospheric Overlay - Enhanced to match login screen */}
      <View style={[theme.styles.atmosphericOverlay, { opacity: 0.15 }]} />

      <View style={theme.styles.archivepassages}>
        {/* Archive Header - Updated to match login screen styling */}
        <View style={theme.styles.archiveHeader}>
          <LinearGradient
            colors={[
              "rgba(10, 11, 15, 0.9)",
              "rgba(30, 41, 59, 0.8)",
              "rgba(10, 11, 15, 0.9)",
            ]}
            style={theme.styles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={theme.styles.archiveHeaderpassages}>
              <View style={theme.styles.archiveHeaderLeft}>
                <LinearGradient
                  colors={["#4ee6e6", "#06b6d4", "#0891b2"]}
                  style={theme.styles.archiveHeaderIcon}
                >
                  <Image 
                    source={archiveHeaderIcon}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                    resizeMode="contain"
                  />
                  <View style={theme.styles.archiveHeaderIconOverlay}>
                    <Icon name="zap" size={12} color="#ffe066" />
                  </View>
                </LinearGradient>
                <View style={theme.styles.archiveHeaderTextContainer}>
                  <Text style={{
                    ...theme.styles.archiveHeaderTitle,
                    color: '#4ee6e6',
                    fontSize: 32,
                    fontWeight: 'bold',
                    letterSpacing: 4,
                    textShadowColor: 'rgba(78, 230, 230, 0.5)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 8,
                  }}>
                    The Archive
                  </Text>
                  <Text style={{
                    ...theme.styles.archiveHeaderSubtitle,
                    color: '#d4af37',
                    fontSize: 16,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}>
                    Keeper of Memory • Curator of Hidden Knowledge
                  </Text>
                  <View style={theme.styles.archiveStatusIndicator}>
                    <View style={[theme.styles.archiveStatusDot, { backgroundColor: '#4ee6e6' }]} />
                    <Text style={{
                      ...theme.styles.archiveStatusText,
                      color: '#4ee6e6',
                      fontSize: 12,
                      fontStyle: 'italic',
                      opacity: 0.8,
                    }}>
                      Archive systems active
                    </Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </LinearGradient>
        </View>

        {/* Tab Navigation - Updated styling */}
        <View style={theme.styles.archiveTabContainer}>
          <LinearGradient
            colors={[
              "rgba(10, 11, 15, 0.8)",
              "rgba(30, 41, 59, 0.9)",
              "rgba(10, 11, 15, 0.8)",
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
                  title="Ancient Tomes"
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

                <TabButton
                  title="Restoration"
                  icon="heart"
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
              {/* Avatar Showcase Section - Updated styling */}
              <View style={theme.styles.avatarShowcaseSection}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[theme.styles.avatarShowcaseGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  {/* Header - Updated to match login screen */}


                  {/* Character Info Bar - Updated styling */}
                  <View style={theme.styles.characterInfoBar}>
                    <View style={theme.styles.characterDetails}>
                      <Text style={{
                        ...theme.styles.characterRarity,
                        color: '#4ee6e6',
                        fontSize: 18,
                        fontWeight: 'bold',
                        textShadowColor: 'rgba(78, 230, 230, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Memory Archivist
                      </Text>
                      <Text style={{
                        ...theme.styles.characterClass,
                        color: '#d4af37',
                        fontSize: 13,
                        fontStyle: 'italic',
                        fontWeight: '600',
                      }}>
                        Keeper of Hidden Knowledge
                      </Text>
                    </View>
                    
                    {/* Character Name - Updated styling */}
                    <View style={{
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      flex: 1,
                      marginLeft: 16
                    }}>
                      <Text style={{
                        ...theme.styles.characterName,
                        textAlign: 'right',
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#ffe066',
                        textShadowColor: 'rgba(255, 224, 102, 0.5)',
                        textShadowOffset: { width: 0, height: 2 },
                        textShadowRadius: 4,
                      }}>
                        {character.getCharacterName() || "Unnamed Character"}
                      </Text>
                    </View>



                  </View>

                  {/* Essence Resonance Indicator - Moved above character preview */}
                  <View style={{
                    marginTop: 12,
                    marginBottom: 8,
                    alignSelf: 'center'
                  }}>
                    <LinearGradient
                      colors={["rgba(78, 230, 230, 0.8)", "rgba(6, 182, 212, 0.8)"]}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#4ee6e6',
                        shadowColor: '#4ee6e6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                      }}
                    >
                      <Icon name="zap" size={14} color="#0a0b0f" />
                      <Text style={{
                        color: '#0a0b0f',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}>
                        {character.backendCharacter?.experience_progress_percentage}% Experience to Next Level
                      </Text>
                    </LinearGradient>
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
                          onPress={async () => {
                            try {
                              // Refresh gear data before opening modal
                              await equipment.loadBackendGear();
                              setShowEquipmentModal(true);
                            } catch (error) {
                              console.error('Failed to load gear data:', error);
                              Alert.alert('Error', 'Failed to load equipment data. Please try again.');
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                            ]}
                            style={[theme.styles.gearSlotGradient, {
                              borderColor: '#d4af37',
                              borderWidth: 1,
                              shadowColor: '#d4af37',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={theme.styles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={theme.styles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
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
                                );
                              }
                            })()}
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
                          onPress={async () => {
                            try {
                              // Refresh gear data before opening modal
                              await equipment.loadBackendGear();
                              setShowEquipmentModal(true);
                            } catch (error) {
                              console.error('Failed to load gear data:', error);
                              Alert.alert('Error', 'Failed to load equipment data. Please try again.');
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                            ]}
                            style={[theme.styles.gearSlotGradient, {
                              borderColor: '#d4af37',
                              borderWidth: 1,
                              shadowColor: '#d4af37',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={theme.styles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={theme.styles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
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
                                );
                              }
                            })()}
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
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[theme.styles.foundationsSectionGradient, {
                    borderColor: '#d4af37',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  <View style={theme.styles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                    <Text style={{
                      ...theme.styles.foundationsTitle,
                      color: '#4ee6e6',
                      fontSize: 20,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 4,
                    }}>
                      Archive Foundations
                    </Text>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={{
                    ...theme.styles.foundationsSubtitle,
                    color: '#d4af37',
                    fontSize: 14,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}>
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
                                "rgba(10, 11, 15, 0.9)",
                                "rgba(30, 41, 59, 0.7)",
                                "rgba(10, 11, 15, 0.9)",
                              ]}
                              style={[theme.styles.foundationCardGradient, {
                                borderColor: '#d4af37',
                                borderWidth: 1,
                                shadowColor: '#d4af37',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 4,
                              }]}
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
                                "rgba(10, 11, 15, 0.9)",
                                "rgba(30, 41, 59, 0.7)",
                                "rgba(10, 11, 15, 0.9)",
                              ]}
                              style={[theme.styles.foundationCardGradient, {
                                borderColor: '#d4af37',
                                borderWidth: 1,
                                shadowColor: '#d4af37',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.2,
                                shadowRadius: 4,
                                elevation: 4,
                              }]}
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
              {/* Refresh Progress Button */}
              <View style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
                flexDirection: 'row',
                gap: 8
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.1)',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.4)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: 'rgba(78, 230, 230, 0.2)',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2,
                    justifyContent: 'center',
                    flex: 1
                  }}
                  onPress={() => {
                    restartAllStories();
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="refresh-cw" size={16} color="rgba(78, 230, 230, 0.7)" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: 'rgba(78, 230, 230, 0.7)',
                    fontSize: 14,
                    fontWeight: '500'
                  }}>
                    Restart All Stories
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 2,
                    borderColor: '#d4af37',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                  onPress={async () => {
                    try {
                      const debugInfo = await apiService.debugStoryFiltering();
                      console.log('=== STORY FILTERING DEBUG INFO ===');
                      console.log('Total stories:', debugInfo.totalStories);
                      console.log('Character stories:', debugInfo.characterStories);
                      console.log('Personality stories:', debugInfo.personalityStories);
                      console.log('User trait:', debugInfo.userTrait);
                      console.log('Character story titles:', debugInfo.characterStoryTitles);
                      console.log('Personality story titles:', debugInfo.personalityStoryTitles);
                      console.log('All story details:', debugInfo.allStoryDetails);
                      Alert.alert(
                        'Story Filtering Debug',
                        `Total: ${debugInfo.totalStories}\nCharacter: ${debugInfo.characterStories}\nPersonality: ${debugInfo.personalityStories}\nUser Trait: ${debugInfo.userTrait || 'None'}\n\nCheck console for details.`
                      );
                    } catch (error) {
                      console.error('Debug failed:', error);
                      Alert.alert('Debug Failed', 'Check console for error details.');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="help-circle" size={16} color="#d4af37" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: '#d4af37',
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    Debug Filtering
                  </Text>
                </TouchableOpacity>
              </View>

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
                          handleOpenStory(Story);
                        }}
                        activeOpacity={0.8}
                      >
                    <LinearGradient
                      colors={
                        [
                          "rgba(10, 11, 15, 0.95)",
                          "rgba(30, 41, 59, 0.8)",
                          "rgba(10, 11, 15, 0.95)",
                        ] as const
                      }
                      style={[theme.styles.chronicleGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
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
                          colors={["rgba(78, 230, 230, 0.4)", "rgba(6, 182, 212, 0.4)", "rgba(78, 230, 230, 0.4)"] as const}
                          style={[theme.styles.chronicleButtonGradient, {
                            shadowColor: 'rgba(78, 230, 230, 0.2)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 4,
                          }]}
                        >
                          <Icon name="book-open" size={18} color="rgba(78, 230, 230, 0.9)" />
                          <Text style={{
                            ...theme.styles.chronicleButtonText,
                            color: 'rgba(78, 230, 230, 0.9)',
                            fontWeight: '600',
                          }}>
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
              <View style={[theme.styles.centeredMessageContainer, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>

                <Text style={[theme.styles.centeredMessageTitle, { 
                  fontSize: 18, 
                  marginBottom: 12,
                  color: 'rgba(78, 230, 230, 0.8)',
                  fontWeight: '600',
                  letterSpacing: 2,
                  textShadowColor: 'rgba(78, 230, 230, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  📝Current Journal Prompts
                </Text>
                <TouchableOpacity
                  style={{
                    marginBottom: 16,
                    backgroundColor: 'rgba(78, 230, 230, 0.3)',
                    borderRadius: 20,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.5)',
                    shadowColor: 'rgba(78, 230, 230, 0.2)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {
                    const unlockedAreas = ["entrance"]; // Add more areas as needed
                    const completedStories = Array.from(archive.completedStories);
                    wellness.loadCategoryPrompts(unlockedAreas, completedStories);
                  }}
                >
                  <Text style={{
                    color: 'rgba(78, 230, 230, 0.9)',
                    fontSize: 14,
                    fontWeight: '600',
                    textShadowColor: 'rgba(78, 230, 230, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Load Prompts
                  </Text>
                </TouchableOpacity>
                
                {/* Display Current Prompts */}
                <View style={{ width: '100%', marginBottom: 20 }}>
                  {['journal', 'draw', 'voice'].map((category) => {
                    const prompt = wellness.categoryPrompts[category as keyof typeof wellness.categoryPrompts];
                    return (
                      <View key={category} style={{
                        backgroundColor: 'rgba(78, 230, 230, 0.1)',
                        padding: 12,
                        marginBottom: 8,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#4ee6e6',
                        shadowColor: '#4ee6e6',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 4,
                      }}>
                        <Text style={{
                          color: 'rgba(78, 230, 230, 0.7)',
                          fontSize: 14,
                          fontWeight: '600',
                          marginBottom: 4,
                          textTransform: 'capitalize',
                          textShadowColor: 'rgba(78, 230, 230, 0.2)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          {category} Quest:
                        </Text>
                        <Text style={{
                          color: '#ffe066',
                          fontSize: 12,
                          lineHeight: 16,
                          textShadowColor: 'rgba(255, 224, 102, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
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
              
              <View style={[theme.styles.centeredMessageContainer, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <Icon
                  name="edit-3"
                  size={40}
                  color="#4ee6e6"
                  style={{ marginBottom: 16 }}
                />
                <Text style={[theme.styles.centeredMessageTitle, {
                  color: 'rgba(78, 230, 230, 0.8)',
                  fontSize: 24,
                  fontWeight: '600',
                  letterSpacing: 2,
                  textShadowColor: 'rgba(78, 230, 230, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>The Codex</Text>
                <Text style={[theme.styles.centeredMessageText, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your personal journal for reflections, insights, and tracking
                  your journey of self-discovery.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(78, 230, 230, 0.3)',
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(78, 230, 230, 0.5)',
                    shadowColor: 'rgba(78, 230, 230, 0.2)',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 4,
                    marginTop: 16,
                  }}
                  onPress={() => ui.setIsCodexVisible(true)}
                >
                  <Text style={{
                    color: 'rgba(78, 230, 230, 0.9)',
                    fontSize: 16,
                    fontWeight: '600',
                    textShadowColor: 'rgba(78, 230, 230, 0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Open Your Journal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mind Defender Tab */}
          {ui.activeTab === "defender" && (
            <View style={theme.styles.tabpassagesArea}>
              {/* Main Game Section */}
              <View style={[
                theme.styles.centeredMessageContainer,
                {
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  marginBottom: 16,
                  borderRadius: 12,
                  backgroundColor: 'rgba(10, 11, 15, 0.95)',
                  borderWidth: 2,
                  borderColor: '#d4af37',
                  shadowColor: '#d4af37',
                  shadowOffset: { width: 2, height: 6 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                  elevation: 12,
                  alignSelf: 'center',
                  maxWidth: '100%'
                }
              ]}>
                <Text style={[theme.styles.centeredMessageTitle, {
                  color: '#4ee6e6',
                  fontSize: 24,
                  fontWeight: 'bold',
                  letterSpacing: 2,
                  textShadowColor: 'rgba(78, 230, 230, 0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }]}>
                  ⚡ Mind Defender
                </Text>
                <Text style={[theme.styles.centeredMessageText, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  A mini-game to train your focus and resilience against intrusive thoughts.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2a8a8a',
                    borderRadius: 20,
                    paddingVertical: 12,
                    paddingHorizontal: 24,
                    borderWidth: 2,
                    borderColor: '#2a8a8a',
                    shadowColor: '#2a8a8a',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    marginTop: 16,
                  }}
                  onPress={() => ui.setIsThoughtDefenderVisible(true)}
                >
                  <Text style={{
                    color: '#ffffff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textShadowColor: 'rgba(0, 0, 0, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }}>
                    Play Now
                  </Text>
                </TouchableOpacity>
              </View>



              {/* Performance Scenarios */}
              <View style={[theme.styles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[theme.styles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="target" size={20} color="#4ee6e6" />
                  <Text style={[theme.styles.foundationsTitle, {
                    color: '#4ee6e6',
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.5)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }]}>
                    Skill Progression Levels
                  </Text>
                  <Icon name="target" size={20} color="#4ee6e6" />
                </View>
                <Text style={[theme.styles.foundationsSubtitle, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your performance contributes to overall foundation growth
                </Text>

                  <View style={theme.styles.foundationsGrid}>
                    {/* Excellent Performance */}
                    <TouchableOpacity
                      style={theme.styles.foundationCard}
                      onPress={() => Alert.alert(
                        "🏆 Master Level Performance",
                        "High score + Win + Long survival\n\n✨ Experience: +400+\n🧠 Awareness: +3\n💪 Resilience: +3\n🤝 Connection: +2\n⚖️ Balance: +2\n\n🎯 Strategy: Focus on accuracy, survive long, clear positive thoughts!\n\n📈 Contributes significantly to foundation growth"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[theme.styles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={theme.styles.foundationIconContainer}>
                          <Text style={theme.styles.foundationIcon}>
                            🏆
                          </Text>
                        </View>
                        <View style={theme.styles.foundationValueContainer}>
                          <Text style={theme.styles.foundationValue}>
                            12
                            <Text style={theme.styles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={theme.styles.foundationLevel}>
                            Master Level
                          </Text>
                        </View>
                        <View style={theme.styles.foundationProgressContainer}>
                          <View style={theme.styles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#FCD34D", "#F59E0B"]}
                              style={[theme.styles.foundationProgressFill, { width: "100%" }]}
                            />
                          </View>
                          <Text style={theme.styles.xpToNext}>
                            Maximum performance achieved
                          </Text>
                        </View>
                        <Text style={theme.styles.foundationLabel}>
                          Master
                        </Text>
                        <Text style={theme.styles.foundationDescription}>
                          Contributes to foundation growth
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Mixed Performance */}
                    <TouchableOpacity
                      style={theme.styles.foundationCard}
                      onPress={() => Alert.alert(
                        "🔄 Adept Level Performance",
                        "Decent score + Loss + Moderate effort\n\n✨ Experience: +200\n🧠 Awareness: +1\n💪 Resilience: +1\n🤝 Connection: +2\n⚖️ Balance: 0\n\n🎯 Strategy: Focus on positive thoughts, improve accuracy!\n\n📈 Steady foundation building progress"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[theme.styles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={theme.styles.foundationIconContainer}>
                          <Text style={theme.styles.foundationIcon}>
                            🔄
                          </Text>
                        </View>
                        <View style={theme.styles.foundationValueContainer}>
                          <Text style={theme.styles.foundationValue}>
                            4
                            <Text style={theme.styles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={theme.styles.foundationLevel}>
                            Adept Level
                          </Text>
                        </View>
                        <View style={theme.styles.foundationProgressContainer}>
                          <View style={theme.styles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#06B6D4", "#0891B2"]}
                              style={[theme.styles.foundationProgressFill, { width: "33%" }]}
                            />
                          </View>
                          <Text style={theme.styles.xpToNext}>
                            8 XP to next level
                          </Text>
                        </View>
                        <Text style={theme.styles.foundationLabel}>
                          Adept
                        </Text>
                        <Text style={theme.styles.foundationDescription}>
                          Steady foundation building
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Poor Performance */}
                    <TouchableOpacity
                      style={theme.styles.foundationCard}
                      onPress={() => Alert.alert(
                        "⚠️ Novice Level Performance",
                        "Low score + Quick loss + Low accuracy\n\n✨ Experience: +50\n🧠 Awareness: -1\n💪 Resilience: -1\n🤝 Connection: +1\n⚖️ Balance: -1\n\n🎯 Strategy: Practice accuracy, focus on survival time!\n\n📈 Learning phase - every attempt builds experience"
                      )}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={[
                          "rgba(10, 11, 15, 0.9)",
                          "rgba(30, 41, 59, 0.7)",
                          "rgba(10, 11, 15, 0.9)",
                        ]}
                        style={[theme.styles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={theme.styles.foundationIconContainer}>
                          <Text style={theme.styles.foundationIcon}>
                            ⚠️
                          </Text>
                        </View>
                        <View style={theme.styles.foundationValueContainer}>
                          <Text style={theme.styles.foundationValue}>
                            -2
                            <Text style={theme.styles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={theme.styles.foundationLevel}>
                            Novice Level
                          </Text>
                        </View>
                        <View style={theme.styles.foundationProgressContainer}>
                          <View style={theme.styles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#EF4444", "#DC2626"]}
                              style={[theme.styles.foundationProgressFill, { width: "8%" }]}
                            />
                          </View>
                          <Text style={theme.styles.xpToNext}>
                            14 XP to next level
                          </Text>
                        </View>
                        <Text style={theme.styles.foundationLabel}>
                          Novice
                        </Text>
                        <Text style={theme.styles.foundationDescription}>
                          Learning and growing
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* Tips Section */}
              <View style={[theme.styles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[theme.styles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="lightbulb" size={20} color="#4ee6e6" />
                  <Text style={[theme.styles.foundationsTitle, {
                    color: '#4ee6e6',
                    fontWeight: 'bold',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.5)',
                    textShadowOffset: { width: 0, height: 2 },
                    textShadowRadius: 4,
                  }]}>
                    Progression Tips
                  </Text>
                  <Icon name="lightbulb" size={20} color="#4ee6e6" />
                </View>
                <Text style={[theme.styles.foundationsSubtitle, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Maximize your mental wellness gains
                </Text>

                  <View style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12
                  }}>
                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#FCD34D',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        🎯 Accuracy First
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Focus on hitting negative thoughts accurately. High accuracy boosts Awareness and Balance.
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#10B981',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        💚 Prioritize Positive Thoughts
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Tap green thoughts for power-ups and Connection gains. They're always beneficial!
                      </Text>
                    </View>

                    <View style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: 12,
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <Text style={{
                        color: '#06B6D4',
                        fontSize: 14,
                        fontWeight: 'bold',
                        marginBottom: 4
                      }}>
                        ⏱️ Survive Longer
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Focus on survival time to boost Resilience. Even losses can be valuable with good effort.
                      </Text>
                    </View>

                    <View style={{
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
                        marginBottom: 4
                      }}>
                        🎮 Practice Makes Progress
                      </Text>
                      <Text style={{
                        color: theme.theme.archiveText,
                        fontSize: 12,
                        lineHeight: 16
                      }}>
                        Don't worry about losses - they're part of learning. Focus on gradual improvement over time.
                      </Text>
                    </View>
                  </View>
              </View>
            </View>
          )}

          {/* Restoration Tab - Updated to use actual story data */}
          {ui.activeTab === "restoration" && (
            <View style={theme.styles.archiveTabpassagesArea}>
              {/* Loading state */}
              {isLoadingStories ? (
                <View style={theme.styles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={theme.styles.centeredMessageTitle}>
                    Loading Archive Data...
                  </Text>
                  <Text style={theme.styles.centeredMessageText}>
                    Retrieving your journey statistics from the Archive...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Story Progress Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="book-open" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: 'rgba(78, 230, 230, 0.8)',
                          fontSize: 20,
                          fontWeight: '600',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.3)',
                          textShadowOffset: { width: 0, height: 1 },
                          textShadowRadius: 2,
                        }}>
                          Story Progress
                        </Text>
                        <Icon name="book-open" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your journey through the ancient stories
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        {/* Stories Completed Card */}
                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const completedCount = stories.filter(story => story.exploration >= 100).length;
                            const totalStories = stories.length;
                            const completionRate = totalStories > 0 ? Math.round((completedCount / totalStories) * 100) : 0;
                            Alert.alert(
                              "Stories Completed",
                              `You have completed ${completedCount} out of ${totalStories} available stories.\n\nCompletion Rate: ${completionRate}%`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                🏆
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.filter(story => story.exploration >= 100).length}
                                <Text style={theme.styles.foundationMaxValue}>
                                  /{stories.length}
                                </Text>
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                {stories.length > 0 ? Math.round((stories.filter(story => story.exploration >= 100).length / stories.length) * 100) : 0}% Complete
                              </Text>
                            </View>
                            <View style={theme.styles.foundationProgressContainer}>
                              <View style={theme.styles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#10B981", "#059669"]}
                                  style={[
                                    theme.styles.foundationProgressFill,
                                    {
                                      width: `${stories.length > 0 ? (stories.filter(story => story.exploration >= 100).length / stories.length) * 100 : 0}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Stories Completed
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Tales you've fully explored and mastered
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(78, 230, 230, 0.6)',
                              shadowColor: 'rgba(78, 230, 230, 0.3)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.4,
                              shadowRadius: 2,
                              elevation: 2,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        {/* Chapters Explored Card */}
                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                            const exploredChapters = stories.reduce((total, story) => {
                              if (story.exploration > 0) {
                                // Estimate chapters explored based on progress
                                const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                return total + chaptersExplored;
                              }
                              return total;
                            }, 0);
                            Alert.alert(
                              "Chapters Explored",
                              `You have explored approximately ${exploredChapters} out of ${totalChapters} total chapters across all stories.`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                📖
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.reduce((total, story) => {
                                  if (story.exploration > 0) {
                                    const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                    return total + chaptersExplored;
                                  }
                                  return total;
                                }, 0)}
                                <Text style={theme.styles.foundationMaxValue}>
                                  /{stories.reduce((total, story) => total + (story.chapter_count || 0), 0)}
                                </Text>
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Chapters Explored
                              </Text>
                            </View>
                            <View style={theme.styles.foundationProgressContainer}>
                              <View style={theme.styles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#06B6D4", "#0891B2"]}
                                  style={[
                                    theme.styles.foundationProgressFill,
                                    {
                                      width: `${(() => {
                                        const totalChapters = stories.reduce((total, story) => total + (story.chapter_count || 0), 0);
                                        const exploredChapters = stories.reduce((total, story) => {
                                          if (story.exploration > 0) {
                                            const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                            return total + chaptersExplored;
                                          }
                                          return total;
                                        }, 0);
                                        return totalChapters > 0 ? (exploredChapters / totalChapters) * 100 : 0;
                                      })()}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Chapters Explored
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Story chapters you've ventured through
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(78, 230, 230, 0.6)',
                              shadowColor: 'rgba(78, 230, 230, 0.3)',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.4,
                              shadowRadius: 2,
                              elevation: 2,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        {/* Revelations Unlocked Card */}
                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const totalRevelations = stories.reduce((total, story) => total + (story.revelations || 0), 0);
                            Alert.alert(
                              "Revelations Unlocked",
                              `You have unlocked ${totalRevelations} profound revelations across all your story explorations.`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.reduce((total, story) => total + (story.revelations || 0), 0)}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Revelations Found
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Hidden Truths
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Profound insights you've discovered
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Journal Progress Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="edit-3" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Journal Progress
                        </Text>
                        <Icon name="edit-3" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your reflections and insights captured in the Archive
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const recentReflections = wellness.homeData?.recent_reflections || [];
                            const journalEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'journal').length;
                            const drawEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'draw').length;
                            const voiceEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'voice').length;
                            
                            Alert.alert(
                              "Journal Entries",
                              `Total reflections: ${recentReflections.length}\n\n📝 Journal entries: ${journalEntries}\n🎨 Drawing entries: ${drawEntries}\n🎤 Voice entries: ${voiceEntries}`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                📝
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {(wellness.homeData?.recent_reflections || []).length}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Total Entries
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Reflections
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Your captured thoughts and insights
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const recentReflections = wellness.homeData?.recent_reflections || [];
                            const journalEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'journal');
                            const latestEntry = journalEntries[0];
                            
                            if (latestEntry) {
                              Alert.alert(
                                "Latest Journal Entry",
                                `"${latestEntry.title}"\n\n${latestEntry.content.substring(0, 100)}${latestEntry.content.length > 100 ? '...' : ''}\n\nPrompt: ${latestEntry.prompt}`,
                                [{ text: "Continue Exploring", style: "default" }]
                              );
                            } else {
                              Alert.alert(
                                "No Journal Entries",
                                "You haven't written any journal entries yet. Start reflecting to capture your thoughts!",
                                [{ text: "Continue Exploring", style: "default" }]
                              );
                            }
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {(wellness.homeData?.recent_reflections || []).filter((reflection: any) => reflection.entry_type === 'journal').length}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Journal Entries
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Written Reflections
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Your thoughts captured in words
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const recentReflections = wellness.homeData?.recent_reflections || [];
                            const drawEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'draw');
                            const voiceEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'voice');
                            const totalCreative = drawEntries.length + voiceEntries.length;
                            
                            Alert.alert(
                              "Creative Expressions",
                              `🎨 Drawing entries: ${drawEntries.length}\n🎤 Voice entries: ${voiceEntries.length}\n\nTotal creative expressions: ${totalCreative}`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                🎨
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {(wellness.homeData?.recent_reflections || []).filter((reflection: any) => 
                                  reflection.entry_type === 'draw' || reflection.entry_type === 'voice'
                                ).length}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Creative Entries
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Artistic Expression
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Your drawings and voice recordings
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Archive Progress Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="archive" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Archive Progress
                        </Text>
                        <Icon name="archive" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Your discoveries and insights within the Archive
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const totalProgress = stories.reduce((total, story) => total + (story.exploration || 0), 0);
                            const averageProgress = stories.length > 0 ? Math.round(totalProgress / stories.length) : 0;
                            Alert.alert(
                              "Overall Progress",
                              `Average exploration progress: ${averageProgress}%\n\nTotal stories available: ${stories.length}`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                📊
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.length > 0 ? Math.round(stories.reduce((total, story) => total + (story.exploration || 0), 0) / stories.length) : 0}%
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Average Progress
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Overall Progress
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Your journey through all stories
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const storiesInProgress = stories.filter(story => story.exploration > 0 && story.exploration < 100).length;
                            Alert.alert(
                              "Stories In Progress",
                              `You have ${storiesInProgress} stories currently in progress.\n\nKeep exploring to unlock more revelations!`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                🔄
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.filter(story => story.exploration > 0 && story.exploration < 100).length}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                In Progress
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Active Explorations
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Stories you're currently exploring
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={theme.styles.foundationCard}
                          onPress={() => {
                            const unstartedStories = stories.filter(story => story.exploration === 0).length;
                            Alert.alert(
                              "Stories Available",
                              `You have ${unstartedStories} stories waiting to be discovered.\n\nBegin your journey to unlock new wisdom!`,
                              [{ text: "Continue Exploring", style: "default" }]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={[
                              "rgba(10, 11, 15, 0.9)",
                              "rgba(30, 41, 59, 0.7)",
                              "rgba(10, 11, 15, 0.9)",
                            ]}
                            style={[theme.styles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={theme.styles.foundationIconContainer}>
                              <Text style={theme.styles.foundationIcon}>
                                🔓
                              </Text>
                            </View>
                            <View style={theme.styles.foundationValueContainer}>
                              <Text style={theme.styles.foundationValue}>
                                {stories.filter(story => story.exploration === 0).length}
                              </Text>
                              <Text style={theme.styles.foundationLevel}>
                                Available
                              </Text>
                            </View>
                            <Text style={theme.styles.foundationLabel}>
                              Untold Tales
                            </Text>
                            <Text style={theme.styles.foundationDescription}>
                              Stories waiting to be discovered
                            </Text>
                            {/* Interactive Indicator */}
                            <View style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#4ee6e6',
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: 0.8,
                              shadowRadius: 4,
                              elevation: 4,
                            }} />
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Settings Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="settings" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Archive Settings
                        </Text>
                        <Icon name="settings" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        Customize your journey through The Archive
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            Alert.alert(
                              "Character Customization",
                              "Would you like to return to the character creator to modify your avatar?",
                              [
                                { text: "Cancel", style: "cancel" },
                                { 
                                  text: "Customize", 
                                  onPress: () => {
                                    // Navigate to character creator
                                    router.push('/(onboarding)/character-creator');
                                  }
                                }
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Customize Avatar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            theme.toggleTheme();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            {theme.themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            Alert.alert(
                              "Logout",
                              "Are you sure you want to leave The Archive?",
                              [
                                { text: "Cancel", style: "cancel" },
                                { 
                                  text: "Logout", 
                                  style: "destructive",
                                  onPress: () => auth.logout()
                                }
                              ]
                            );
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Leave Archive
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>

                  {/* Mental Health Resources Section */}
                  <View style={theme.styles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[theme.styles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={theme.styles.foundationsHeader}>
                        <Icon name="heart" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...theme.styles.foundationsTitle,
                          color: '#4ee6e6',
                          fontSize: 20,
                          fontWeight: 'bold',
                          letterSpacing: 2,
                          textShadowColor: 'rgba(78, 230, 230, 0.5)',
                          textShadowOffset: { width: 0, height: 2 },
                          textShadowRadius: 4,
                        }}>
                          Mental Health Support
                        </Text>
                        <Icon name="heart" size={20} color="#4ee6e6" />
                      </View>
                      <Text style={{
                        ...theme.styles.foundationsSubtitle,
                        color: '#d4af37',
                        fontSize: 14,
                        fontStyle: 'italic',
                        textAlign: 'center',
                        marginBottom: 16,
                        textShadowColor: 'rgba(212, 175, 55, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        If you're struggling, these resources are here to help
                      </Text>

                      <View style={theme.styles.foundationsGrid}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            University Counseling
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://health-services.d.umn.edu/counseling-services/crisis-and-mental-health-emergency';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Crisis Hotline
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://www.sph.umn.edu/current/resources/mental-health/';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Student Wellness
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{
                            backgroundColor: '#2a8a8a',
                            borderRadius: 20,
                            paddingVertical: 12,
                            paddingHorizontal: 24,
                            borderWidth: 2,
                            borderColor: '#2a8a8a',
                            shadowColor: '#2a8a8a',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.4,
                            shadowRadius: 8,
                            elevation: 8,
                            marginBottom: 8,
                            width: '48%',
                          }}
                          onPress={() => {
                            const url = 'https://mentalhealth.umn.edu/';
                            Linking.openURL(url).catch((err: any) => console.error('Error opening URL:', err));
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 'bold',
                            textShadowColor: 'rgba(0, 0, 0, 0.3)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 2,
                            textAlign: 'center',
                          }}>
                            Mental Health Info
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                </>
              )}
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
          onStatGain={() => {}} // This would be handled by the master state
          onArtifactUnlock={(artifact: string) => archive.handleArtifactUnlock({ name: artifact } as any)}
          onSkillLearned={(skill: string) => archive.handleSkillLearned([skill])}
          onStoryComplete={handleStoryCompleteLocal as any}
        />
      )}

      {/* Chapter Selection Modal */}
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
        backendGear={equipment.backendGear}
        equippedGear={equipment.equippedGear}
      />

    </View>
  );
};

export default ArchiveInterface;
