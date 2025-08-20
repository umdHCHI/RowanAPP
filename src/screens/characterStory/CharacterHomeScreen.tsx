import { characterHomeScreenStyles, getStoryStyles } from "@/src/styles/globalStyles";
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
import { getDisplayPrompt } from "../../utils/codexUtils";
// Import StoryScreen directly to avoid circular dependency issues
import React from "react";
import { archiveHeaderIcon, equipmentIcons } from "../../assets/equipment";

import { apiService } from "../../services/apiService";

import ChapterScreen from "./ChapterScreen";
import StoryScreen from "./StoryScreen";

const { width, height } = Dimensions.get("window"); //remove

// Tutorial steps for first-time users
const TUTORIAL_STEPS = [
  {
    id: 1,
    title: "🎮 Welcome to The Archive!",
    message: "This is your personal stress management adventure game. You'll navigate through interactive stories, equip wellness gear, and build your mental resilience. Let's learn how to play!",
    highlight: "header",
    tip: "The Archive is your safe space to explore and grow. Take your time with each feature!"
  },
  {
    id: 2,
    title: "📚 Your Character & Stats",
    message: "This is your character! Your wellness stats (Awareness, Resilience, Connection, Balance) show your progress. Each stat represents different aspects of mental wellness. Click on them to see detailed information and track your growth.",
    highlight: "character",
    tip: "Higher stats unlock new stories and equipment. Focus on areas that feel most challenging to you."
  },
  {
    id: 3,
    title: "⚔️ Equipment System",
    message: "Equip items to boost your stats! Weapons improve focus and concentration, armor provides comfort and social support, helmets help set healthy boundaries, and boots keep you grounded and active. Each piece of gear has unique benefits.",
    highlight: "equipment",
    tip: "Mix and match gear to create your perfect wellness loadout. Different combinations work for different situations!"
  },
  {
    id: 4,
    title: "📖 Story Adventures",
    message: "The 'Tomes' tab contains interactive stories where you make choices and learn coping strategies. Each choice affects your character's growth and can unlock new paths. Stories are designed to help you practice real-life stress management techniques.",
    highlight: "tomes",
    tip: "There are no wrong choices! Each path teaches valuable lessons. Replay stories to explore different outcomes."
  },
  {
    id: 5,
    title: "🔧 Restoration & Growth",
    message: "The 'Restoration' tab shows your progress through stories and unlocks new content as you complete adventures. Track your achievements, see your growth over time, and discover new challenges as you level up.",
    highlight: "restoration",
    tip: "Progress is saved automatically. You can always return to stories you've started and continue your journey."
  },
  {
    id: 6,
    title: "📝 The Codex",
    message: "Your personal journal for reflections and insights. Record your thoughts, draw your feelings, or record voice memos to track your journey. The Codex helps you reflect on your experiences and see patterns in your growth.",
    highlight: "codex",
    tip: "Regular journaling can help you identify triggers and track your progress. Try to write something every day!"
  },
  {
    id: 7,
    title: "🎯 Daily Quests",
    message: "Complete daily wellness activities like journaling, drawing, or voice recording to earn experience and strengthen your character. These quests are designed to build healthy habits and provide structure to your wellness routine.",
    highlight: "quests",
    tip: "Daily quests refresh each day. Even small activities count - consistency is more important than perfection!"
  },
  {
    id: 8,
    title: "🌟 You're Ready!",
    message: "Congratulations! You now know the basics of The Archive. Explore stories, equip gear, and build your wellness foundations. Remember: every choice helps you grow stronger, and there's no rush. Take your time and enjoy the journey!",
    highlight: "none",
    tip: "You can always restart this tutorial by clicking the '?' button in the top right corner. Happy adventuring!"
  }
];

// Helper function to correctly extract profile and character data from homeData
const selectProfileAndCharacter = (homeData?: any) => {
  const hd = homeData ?? null;
  const profile = hd?.userProfile ?? hd ?? null; // works for unified or legacy
  const backendCharacter = hd?.character ?? profile?.character ?? null;
  return { profile, backendCharacter };
};

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
    wellness
  } = useMasterState();

  const router = useRouter();
  const homeStyles = characterHomeScreenStyles(theme.characterHomeScreenTheme);
  const homeTheme = theme.characterHomeScreenTheme;
  // Local state for stories
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  // Debug data flow on component mount (commented out to prevent endless loop)
  // useEffect(() => {
  //   const runDebug = async () => {
  //     // Wait a bit for the context to load
  //     setTimeout(async () => {
  //       console.log('🔍 DEBUG: Auto-running data flow debug...');
  //       try {
  //         const debugResult = await apiService.debugCharacterHomeData();
  //         console.log('📊 DEBUG: Auto-debug results:', debugResult);
  //       } catch (error) {
  //         console.error('❌ DEBUG: Auto-debug failed:', error);
  //       }
  //     }, 2000);
  //   };
  //   
  //   runDebug();
  // }, []);

  // Chapter selection state
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const storyStyles = getStoryStyles(theme.theme);

  // Tutorial functions
  const startTutorial = () => {
    setShowTutorial(true);
    setCurrentTutorialStep(0);
  };

  const nextTutorialStep = () => {
    if (currentTutorialStep < TUTORIAL_STEPS.length - 1) {
      setCurrentTutorialStep(currentTutorialStep + 1);
    } else {
      completeTutorial();
    }
  };

  const previousTutorialStep = () => {
    if (currentTutorialStep > 0) {
      setCurrentTutorialStep(currentTutorialStep - 1);
    }
  };

  const completeTutorial = async () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    try {
      await AsyncStorage.setItem('hasSeenTutorial', 'true');
    } catch (error) {
      console.log('Could not save tutorial completion');
    }
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
    AsyncStorage.setItem('hasSeenTutorial', 'true').catch(() => {});
  };

  // Check if user has seen tutorial on component mount
  useEffect(() => {
    const checkTutorialStatus = async () => {
      try {
        const tutorialSeen = await AsyncStorage.getItem('hasSeenTutorial');
        if (tutorialSeen === 'true') {
          setHasSeenTutorial(true);
        } else {
          // Show tutorial for first-time users after a short delay
          setTimeout(() => {
            if (!hasSeenTutorial) {
              startTutorial();
            }
          }, 2000);
        }
      } catch (error) {
        console.log('Could not check tutorial status');
      }
    };
    
    checkTutorialStatus();
  }, []);

  // Helper function to get equipped gear for a specific slot
  const getEquippedGearForSlot = (slot: 'weapon' | 'armor' | 'helmet' | 'boots') => {
    console.log('🔧 getEquippedGearForSlot:', {
      slot,
      equippedGear: equipment.equippedGear,
      gearCount: equipment.equippedGear.length
    });
    
    const foundGear = equipment.equippedGear.find(gear => gear.gear_type.slot === slot);
    console.log('🔧 Found gear for slot', slot, ':', foundGear);
    
    return foundGear;
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

  // Calculate wellness stats for Archive Foundations display
  const wellnessStatsForDisplay = (() => {
    // Extract character data from the proper backend structure using the helper
    const homeData = wellness.homeData;
    const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);
    
    // Normalize backendCharacter - unwrap arrays and nested .character
    const normalizedBackendCharacter = (() => {
      let char: any = character.backendCharacter;
      
      // Unwrap arrays
      if (Array.isArray(char)) {
        char = char[0];
      }
      
      // Unwrap nested .character
      if (char && typeof char === 'object' && 'character' in char) {
        char = char.character;
      }
      
      return char;
    })();
    
    console.log('🔍 Archive Foundations Debug:', {
      hasHomeData: !!homeData,
      hasUserProfile: !!userProfile,
      userProfileKeys: userProfile ? Object.keys(userProfile) : [],
      backendCharacterData,
      normalizedBackendCharacter,
      normalizedBackendCharacterKeys: normalizedBackendCharacter ? Object.keys(normalizedBackendCharacter) : [],
      homeDataType: homeData && 'userProfile' in homeData ? 'PersonalityHomeData' : 'UserProfile',
      completionType: userProfile?.completion_type || (normalizedBackendCharacter as any)?.completion_type,
      hasCompletionDataId: !!(userProfile?.completion_data_id || (normalizedBackendCharacter as any)?.completion_data_id)
    });
    
    // First, try to get the actual wellness_stats array from the normalized character object
    const characterWellnessStats = (normalizedBackendCharacter as any)?.wellness_stats || backendCharacterData?.wellness_stats;
    if (characterWellnessStats && Array.isArray(characterWellnessStats) && characterWellnessStats.length > 0) {
      console.log('✅ Using actual wellness_stats from backend:', characterWellnessStats);
      return characterWellnessStats;
    }
    
    // Second, prioritize building stats from character.awareness/resilience/connection/balance
    if (normalizedBackendCharacter && (
      (normalizedBackendCharacter as any).awareness !== undefined || 
      (normalizedBackendCharacter as any).resilience !== undefined ||
      (normalizedBackendCharacter as any).connection !== undefined ||
      (normalizedBackendCharacter as any).balance !== undefined
    )) {
      console.log('✅ Building wellness stats from individual character values:', {
        awareness: (normalizedBackendCharacter as any).awareness,
        resilience: (normalizedBackendCharacter as any).resilience,
        connection: (normalizedBackendCharacter as any).connection,
        balance: (normalizedBackendCharacter as any).balance
      });
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
    
    // Third, fall back to wellness_average if available
    const wellnessAverage = (normalizedBackendCharacter as any)?.wellness_average || backendCharacterData?.wellness_average;
    if (wellnessAverage !== undefined) {
      console.log('⚠️ Falling back to wellness_average distribution');
      const baseValue = Math.floor(wellnessAverage * 5); // Convert 0-1 scale to 0-20 scale
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
    
    // Fourth, if user has completion_type: 'character' but no character data, create default character stats
    const completionType = userProfile?.completion_type || (normalizedBackendCharacter as any)?.completion_type;
    const hasCompletionDataId = !!(userProfile?.completion_data_id || (normalizedBackendCharacter as any)?.completion_data_id);
    
    if (completionType === 'character' && hasCompletionDataId) {
      console.log('⚠️ User has character completion_type but no wellness data - creating default character stats');
      return [
        { 
          icon: "🧘", 
          label: "Awareness", 
          value: 0, 
          color: "#4A90E2" 
        },
        { 
          icon: "💪", 
          label: "Resilience", 
          value: 0, 
          color: "#2ECC71" 
        },
        { 
          icon: "🤝", 
          label: "Connection", 
          value: 0, 
          color: "#E74C3C" 
        },
        { 
          icon: "⚖️", 
          label: "Balance", 
          value: 0, 
          color: "#F39C12" 
        }
      ];
    }
    
    // Final fallback to archive foundations
    console.log('⚠️ No character wellness data found, using archive foundations fallback');
    return archive.archiveFoundations;
  })();

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
      ui.setMemoryStories(storiesWithProgress);
    } catch (error) {
      console.error("Failed to load stories:", error);
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  // Debug function to test data flow
  const debugDataFlow = async () => {
    try {
      console.log('🔍 DEBUG: Testing data flow...');
      const debugResult = await apiService.debugCharacterHomeData();
      
      Alert.alert(
        'Data Flow Debug Results',
        `Success: ${debugResult.success}\n\n` +
        `Profile: ${debugResult.dataSummary.hasProfile ? '✅' : '❌'}\n` +
        `Character: ${debugResult.dataSummary.hasCharacter ? '✅' : '❌'}\n` +
        `Experience: ${debugResult.dataSummary.hasExperience ? '✅' : '❌'}\n` +
        `Wellness Stats: ${debugResult.dataSummary.hasWellnessStats ? '✅' : '❌'}\n` +
        `Equipped Gear: ${debugResult.dataSummary.hasEquippedGear ? '✅' : '❌'}\n\n` +
        `Level: ${debugResult.dataSummary.characterLevel || 'N/A'}\n` +
        `Experience: ${debugResult.dataSummary.characterExperience || 'N/A'}\n\n` +
        `Errors: ${debugResult.errors.length > 0 ? debugResult.errors.join('\n') : 'None'}`
      );
    } catch (error) {
      console.error('Debug failed:', error);
      Alert.alert('Debug Error', 'Failed to run debug: ' + error);
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
            console.log(`🧹 Successfully cleared ${storyCacheKeys.length} cache keys`);
          } else {
            console.log('🧹 No story cache keys found to clear');
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
      console.log('🔄 CharacterHomeScreen: Loading data on focus...');
      loadStories();
      equipment.loadBackendGear();
      
      // Load complete home data which includes all character information
      console.log('🔄 CharacterHomeScreen: Loading home data...');
      wellness.loadHomeData().then(() => {
        console.log('✅ CharacterHomeScreen: Home data loaded successfully');
        console.log('📊 CharacterHomeScreen: Current homeData:', wellness.homeData);
        
        // Debug equipment data
        console.log('🔧 CharacterHomeScreen: Equipment data:', {
          equippedGear: equipment.equippedGear,
          backendGear: equipment.backendGear,
          inventory: equipment.inventory
        });
        
        // Now load character data from the homeData (optimized - no redundant API call)
        console.log('🔄 CharacterHomeScreen: Loading character data from homeData...');
        character.loadCharacter();
      }).catch((error) => {
        console.error('❌ CharacterHomeScreen: Failed to load home data:', error);
      });

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

  //Equipment handlers - now using backend gear system might need to be removed 
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
  
  const handleUnequip = async (item: EquipmentItem) => { //might need to be removed 
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
      style={[homeStyles.tabButton, isActive && homeStyles.activeTab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isActive && (
        <LinearGradient
          colors={[homeTheme.tabIsActiveGradient, homeTheme.tabIsActiveSecondaryGradient]}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      <Icon name={icon} size={18} color={isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor} />
      <Text
        style={[
          homeStyles.tabText,
          isActive ? homeStyles.tabTextActive : homeStyles.tabTextInactive,
          { color: isActive ? homeTheme.tabTextColor : homeTheme.tabTextSecondColor }
        ]}
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

    // Debug logging to see what data is available
    console.log('🔍 CharacterDisplay - homeData:', homeData);
    console.log('🔍 CharacterDisplay - backendCharacter:', backendCharacter);
    console.log('🔍 CharacterDisplay - homeData type check:', homeData && 'userProfile' in homeData ? 'PersonalityHomeData' : 'CharacterHomeData');
    
    // Check if homeData is PersonalityHomeData (fallback for admin users)
    const isPersonalityHomeData = homeData && 'userProfile' in homeData;
    
    if (isPersonalityHomeData) {
      console.log('🔍 CharacterDisplay - Using PersonalityHomeData fallback for admin user');
      console.log('🔍 CharacterDisplay - userProfile:', (homeData as any).userProfile);
      // Character data is now directly on UserProfile, not nested under profile.character
      console.log('🔍 CharacterDisplay - userProfile.character:', (homeData as any).userProfile?.character);
    } else {
      console.log('🔍 CharacterDisplay - Using regular character data');
      console.log('🔍 CharacterDisplay - homeData?.name:', backendCharacter?.name);
      console.log('🔍 CharacterDisplay - homeData?.wellness_stats:', (homeData as any)?.wellness_stats);
      console.log('🔍 CharacterDisplay - homeData?.equipped_gear:', (homeData as any)?.equipped_gear);
    }

    // Check if we have character data from home_data endpoint
    const hasHomeData = homeData;
    const hasBackendCharacter = backendCharacter;

    if (!hasHomeData && !hasBackendCharacter) {
      return (
        <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={homeStyles.characterFrame}
          >
            <View style={homeStyles.characterFrameInner}>
              <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
                No character created yet
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    // Extract character data properly from the nested structure using the helper
    let characterData, characterAppearanceData, wellnessStats, characterName;
    
    const { profile: userProfile, backendCharacter: backendCharacterData } = selectProfileAndCharacter(homeData);
    
    if (isPersonalityHomeData) {
      // For admin users with PersonalityHomeData fallback, provide default character values
      characterName = userProfile?.username || userProfile?.email || "Admin User";
      characterData = {
        name: characterName,
        level: 1,
        // Provide default appearance values
        selected_hair_style: 0,
        selected_shirt_type: 0,
        selected_eye_type: 0,
        selected_eyebrow_style: 0,
        selected_mouth_type: 0
      };
      characterAppearanceData = characterData;
      wellnessStats = null; // Admin users don't have wellness stats
    } else {
      // For character users, extract data from the proper backend character object
      if (backendCharacterData) {
        // Use the actual character data from backend
        characterData = {
          name: backendCharacterData.name || userProfile?.username || character.getCharacterName(),
          level: backendCharacterData.level || 1,
          experience: backendCharacterData.experience || 0,
          experience_progress_percentage: backendCharacterData.experience_needed || 0,
          wellness_average: backendCharacterData.wellness_average || 0,
          character_config: backendCharacterData.character_config || null,
          equipped_gear: backendCharacterData.equipped_gear || []
        };
        characterAppearanceData = backendCharacterData.character_config || backendCharacterData;
        characterName = backendCharacterData?.name || userProfile?.username || userProfile?.email || character.getCharacterName();
        
        console.log('✅ CharacterDisplay - Using backend character data:', {
          name: characterName,
          level: backendCharacterData.level,
          experience_progress_percentage: backendCharacterData.experience_needed,
          wellness_average: backendCharacterData.wellness_average,
          equippedGear: backendCharacterData.equipped_gear,
          wellnessStats: backendCharacterData.wellness_stats
        });
      } else {
        // Fallback to legacy structure if character object not found
        characterData = {
          name: userProfile?.username || character.getCharacterName(),
          level: 1,
          experience: 0,
          experience_progress_percentage: userProfile?.experience_needed || 0,
          wellness_average: userProfile?.wellness_average || 0,
          character_config: userProfile?.character_config || null,
          equipped_gear: userProfile?.equipped_gear || []
        };
        characterAppearanceData = userProfile?.character_config || characterData;
        characterName = characterData.name;
        
        console.log('⚠️ CharacterDisplay - Using legacy structure fallback:', {
          name: characterName,
          level: characterData.level
        });
      }
      
      wellnessStats = null; // Will be calculated from wellness_stats in wellnessStatsForDisplay
    }



    // Ensure characterData is not null before using it
    if (!characterData) {
      return (
        <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
          <LinearGradient
            colors={[
              "rgba(139, 92, 246, 0.3)",
              "rgba(79, 70, 229, 0.2)",
              "rgba(6, 182, 212, 0.3)",
            ]}
            style={homeStyles.characterFrame}
          >
            <View style={homeStyles.characterFrameInner}>
              <Text style={[homeStyles.archiveText, { textAlign: "center" }]}>
                Character data unavailable
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    }

    return (
      <View style={homeStyles.centralCharacterDisplay || homeStyles.centralCharacterDisplay}>
        <LinearGradient
          colors={[
            "rgba(78, 230, 230, 0.3)",
            "rgba(6, 182, 212, 0.2)",
            "rgba(78, 230, 230, 0.3)",
          ]}
          style={homeStyles.characterFrame}
        >
                      <View style={homeStyles.characterFrameInner}>
              {/* Use CharacterPreview component for consistent display with CharacterCreatorScreen */}

              <CharacterPreview
                selectedName={characterName}
                baseAsset={character.getBaseAsset(false)}
                background={character.getCurrentBackgroundAsset(false)}
                hairSheet={character.getHairAsset(false)}
                clothesSheet={character.getClothesAsset(false)}
                eyesSheet={character.getEyesAsset(false)}
                eyebrowsSheet={character.getEyebrowsAsset(false)}
                mouthSheet={character.getMouthAsset(false)}
                hairIndex={(characterAppearanceData as any)?.selected_hair_style || character.getHairIndex() || 0}
                clothesIndex={(characterAppearanceData as any)?.selected_shirt_type || character.getClothesIndex() || 0}
                eyesIndex={(characterAppearanceData as any)?.selected_eye_type || character.getEyesIndex() || 0}
                eyebrowsIndex={(characterAppearanceData as any)?.selected_eyebrow_style || character.getEyebrowsIndex() || 0}
                mouthIndex={(characterAppearanceData as any)?.selected_mouth_type || character.selectedMouthType || 0}
                size={homeStyles.characterFrame?.height || 180}
                fitToFrame
              />

            {/* Character Level and Status */}
            <View style={homeStyles.characterLevelBadge}>
              <LinearGradient
                colors={["#4ee6e6", "#06b6d4"]}
                style={homeStyles.levelBadgeGradient}
              >
                <Text style={homeStyles.levelBadgeText}>
                  Lv.{characterData?.level || 1}
                </Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>



        {/* Character Mood Bubble */}
        <View style={homeStyles.characterMoodBubble}>
          <LinearGradient
            colors={["rgba(244, 241, 232, 0.95)", "rgba(212, 175, 55, 0.8)"]}
            style={homeStyles.moodBubbleGradient}
          >
            <Text style={homeStyles.moodBubbleText}>
              "Ready to explore the depths of memory..."
            </Text>
          </LinearGradient>
        </View>


      </View>
    );
  };

  // Tutorial Modal Component
  const TutorialModal = () => {
    if (!showTutorial) return null;
    
    const currentStep = TUTORIAL_STEPS[currentTutorialStep];
    const isFirstStep = currentTutorialStep === 0;
    const isLastStep = currentTutorialStep === TUTORIAL_STEPS.length - 1;
    
    return (
      <View style={StyleSheet.absoluteFillObject}>
        {/* Semi-transparent overlay */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 1000,
        }} />
        
        {/* Tutorial content */}
        <View style={{
          position: 'absolute',
          top: '20%',
          left: 20,
          right: 20,
          backgroundColor: 'rgba(10, 11, 15, 0.95)',
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#4ee6e6',
          padding: 24,
          zIndex: 1001,
          shadowColor: '#4ee6e6',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 20,
        }}>
          {/* Progress indicator */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: index === currentTutorialStep ? '#4ee6e6' : 'rgba(78, 230, 230, 0.3)',
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
          
          {/* Step title */}
          <Text style={{
            color: '#4ee6e6',
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 16,
            textShadowColor: 'rgba(78, 230, 230, 0.5)',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}>
            {currentStep.title}
          </Text>
          
          {/* Step message */}
          <Text style={{
            color: '#ffffff',
            fontSize: 16,
            lineHeight: 24,
            textAlign: 'center',
            marginBottom: 16,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            {currentStep.message}
          </Text>
          
          {/* Pro tip */}
          {currentStep.tip && (
            <View style={{
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(212, 175, 55, 0.3)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 24,
            }}>
              <Text style={{
                color: '#d4af37',
                fontSize: 14,
                fontStyle: 'italic',
                textAlign: 'center',
                textShadowColor: 'rgba(212, 175, 55, 0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                💡 Pro Tip: {currentStep.tip}
              </Text>
            </View>
          )}
          
          {/* Navigation buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            {/* Skip button */}
            <TouchableOpacity
              onPress={skipTutorial}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 25,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'transparent',
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 14,
                fontWeight: '500',
              }}>
                Skip Tutorial
              </Text>
            </TouchableOpacity>
            
            {/* Navigation buttons */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              {!isFirstStep && (
                <TouchableOpacity
                  onPress={previousTutorialStep}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 25,
                    backgroundColor: 'rgba(78, 230, 230, 0.2)',
                    borderWidth: 1,
                    borderColor: '#4ee6e6',
                    marginRight: 12,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    color: '#4ee6e6',
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    ← Previous
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                onPress={nextTutorialStep}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 25,
                  backgroundColor: '#4ee6e6',
                  shadowColor: '#4ee6e6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: '#0a0b0f',
                  fontSize: 16,
                  fontWeight: 'bold',
                }}>
                  {isLastStep ? 'Get Started!' : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Tutorial Highlight Component for pulsing effects
  const TutorialHighlight = ({ children, isHighlighted, style }: { 
    children: React.ReactNode; 
    isHighlighted: boolean; 
    style?: any;
  }) => {
    const [pulseOpacity, setPulseOpacity] = useState(0.3);
    
    useEffect(() => {
      if (isHighlighted) {
        const pulseInterval = setInterval(() => {
          setPulseOpacity(prev => prev === 0.3 ? 0.8 : 0.3);
        }, 800);
        
        return () => clearInterval(pulseInterval);
      }
    }, [isHighlighted]);
    
    if (!isHighlighted) return <>{children}</>;
    
    return (
      <View style={[style, { position: 'relative' }]}>
        {children}
        <View style={{
          position: 'absolute',
          top: -4,
          left: -4,
          right: -4,
          bottom: -4,
          borderWidth: 3,
          borderColor: '#4ee6e6',
          borderRadius: 8,
          opacity: pulseOpacity,
          zIndex: 999,
        }} />
      </View>
    );
  };

  return (
    <View style={[homeStyles.archiveContainer, { paddingTop: 20 }]}>
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
      <View style={[homeStyles.atmosphericOverlay, { opacity: 0.15 }]} />

      <View style={homeStyles.archivepassages}>
        {/* Archive Header - Updated to match login screen styling */}
        <View style={homeStyles.archiveHeader}>
          <LinearGradient
            colors={[
              "rgba(10, 11, 15, 0.9)",
              "rgba(30, 41, 59, 0.8)",
              "rgba(10, 11, 15, 0.9)",
            ]}
            style={homeStyles.archiveHeaderGradient}
          >
            <BlurView intensity={15} style={homeStyles.archiveHeaderpassages}>
              <View style={homeStyles.archiveHeaderLeft}>
                <LinearGradient
                  colors={["#4ee6e6", "#06b6d4", "#0891b2"]}
                  style={homeStyles.archiveHeaderIcon}
                >
                  <Image 
                    source={archiveHeaderIcon}
                    style={{
                      width: 24,
                      height: 24,
                    }}
                    resizeMode="contain"
                  />
                  <View style={homeStyles.archiveHeaderIconOverlay}>
                    <Icon name="zap" size={12} color="#ffe066" />
                  </View>
                </LinearGradient>
                
                {/* Debug Button - Remove in production */}
                <TouchableOpacity
                  onPress={debugDataFlow}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: -10,
                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>D</Text>
                </TouchableOpacity>
                
                {/* Tutorial Button */}
                <TouchableOpacity
                  onPress={startTutorial}
                  style={{
                    position: 'absolute',
                    top: -10,
                    right: 30,
                    backgroundColor: 'rgba(78, 230, 230, 0.8)',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                  }}
                >
                  <Text style={{ color: '#0a0b0f', fontSize: 10, fontWeight: 'bold' }}>?</Text>
                </TouchableOpacity>
                <View style={homeStyles.archiveHeaderTextContainer}>
                  <Text style={{
                    ...homeStyles.archiveHeaderTitle,
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
                    ...homeStyles.archiveHeaderSubtitle,
                    color: '#d4af37',
                    fontSize: 16,
                    fontStyle: 'italic',
                    marginBottom: 4,
                  }}>
                    Keeper of Memory • Curator of Hidden Knowledge
                  </Text>
                  
                  {/* Tutorial Button - More prominent */}
                  {!hasSeenTutorial ? (
                    <View style={{
                      alignItems: 'center',
                      marginTop: 8,
                    }}>
                      <Text style={{
                        color: '#ffe066',
                        fontSize: 12,
                        fontStyle: 'italic',
                        marginBottom: 8,
                        textAlign: 'center',
                        textShadowColor: 'rgba(255, 224, 102, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 2,
                      }}>
                        New to The Archive? Start here!
                      </Text>
                      <TouchableOpacity
                        onPress={startTutorial}
                        style={{
                          backgroundColor: 'rgba(78, 230, 230, 0.2)',
                          borderWidth: 1,
                          borderColor: '#4ee6e6',
                          borderRadius: 20,
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                          alignSelf: 'center',
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={{
                          color: '#4ee6e6',
                          fontSize: 14,
                          fontWeight: '600',
                          textAlign: 'center',
                        }}>
                          🎮 Start Tutorial
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={startTutorial}
                      style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        borderWidth: 1,
                        borderColor: '#d4af37',
                        borderRadius: 20,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        marginTop: 8,
                        alignSelf: 'center',
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={{
                        color: '#d4af37',
                        fontSize: 12,
                        fontWeight: '500',
                        textAlign: 'center',
                      }}>
                        📚 Tutorial
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View style={homeStyles.archiveStatusIndicator}>
                    <View style={[homeStyles.archiveStatusDot, { backgroundColor: '#4ee6e6' }]} />
                    <Text style={{
                      ...homeStyles.archiveStatusText,
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
        <View style={homeStyles.archiveTabContainer}>

            <BlurView intensity={20} style={homeStyles.archiveTabpassages}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={homeStyles.archiveTabScrollpassages}
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
       
        </View>

        {/* Tab passages */}
        <ScrollView
          style={homeStyles.archiveTabpassagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Entrance Hall Tab */}
          {ui.activeTab === "entrance" && (
            <View style={homeStyles.tabpassagesArea}>
              {/* Avatar Showcase Section - Updated styling */}
              <View style={homeStyles.avatarShowcaseHeader}>
                <LinearGradient
                  colors={[
                    "rgba(10, 11, 15, 0.95)",
                    "rgba(30, 41, 59, 0.8)",
                    "rgba(10, 11, 15, 0.95)",
                  ]}
                  style={[homeStyles.archiveHeaderGradient, {
                    borderColor: '#9e8532ff',
                    borderWidth: 2,
                    shadowColor: '#d4af37',
                    shadowOffset: { width: 2, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 12,
                  }]}
                >
                  {/* Header  */}


                  {/* Character Info Bar - Updated styling */}
                  <View style={homeStyles.characterInfoBar}>
                    <View style={homeStyles.characterDetails}>
                      <Text style={homeStyles.characterName}>
                        Memory Archivist
                      </Text>
                      <Text style={homeStyles.characterClass}>
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
                      <Text style={homeStyles.foundationsTitle}>
                        {(() => {
                          // Extract character name from the proper backend structure using the helper
                          const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(wellness.homeData);
                          return backendCharacter?.name || userProfile?.username || userProfile?.email || character.getCharacterName() || "Unnamed Character";
                        })()}
                      </Text>
                    </View>



                  </View>

                  {/* XP Progress */}
                  <View style={{ alignItems: 'center' }}>
                    <View style={homeStyles.experienceProgressContainer}>
                      <LinearGradient
                        colors={["rgba(78, 230, 230, 0.8)", "rgba(6, 182, 212, 0.8)"]}
                        style={homeStyles.experienceProgressGradient}
                      >
                        <Icon name="zap" size={14} color="#0a0b0f" />
                        <Text style={homeStyles.experienceProgressText}>
                          {(() => {
                            // Extract experience data from the proper backend structure using the helper
                            const homeData = wellness.homeData;
                            const { profile: userProfile, backendCharacter } = selectProfileAndCharacter(homeData);

                            const currentExperience = backendCharacter?.experience || 0;
                            const experienceNeeded = backendCharacter?.experience_needed_for_next_level || backendCharacter?.experience_needed || 1000;
                            const progressPercentage = backendCharacter?.experience_progress_percentage || 0;
                            
                            console.log('🔍 Experience Progress Debug:', {
                              hasHomeData: !!homeData,
                              hasUserProfile: !!userProfile,
                              hasBackendCharacter: !!backendCharacter,
                              currentExperience,
                              experienceNeeded,
                              progressPercentage,
                              characterKeys: backendCharacter ? Object.keys(backendCharacter) : []
                            });
                            
                            if (progressPercentage !== undefined) {
                              return `${Math.round(progressPercentage)}% (${currentExperience}/${experienceNeeded} XP)`;
                            } else if (currentExperience !== undefined && experienceNeeded !== undefined) {
                              const calculatedPercentage = Math.round((currentExperience / experienceNeeded) * 100);
                              return `${calculatedPercentage}% (${currentExperience}/${experienceNeeded} XP)`;
                            } else {
                              return 'Experience data loading...';
                            }
                          })()}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>

                  {/* Main Character Display with Gear - Updated for Backend Integration */}
                  <View style={homeStyles.characterDisplaySection}>
                    {/* Left Gear Column */}
                    <View style={homeStyles.gearColumnLeft}>
                      {[
                        {
                          type: "focus" as keyof EquippedItems,
                          label: "Focus Item",
                          icon: "🔮",
                          slot: "weapon" as const,
                        },
                        {
                          type: "shield" as keyof EquippedItems,
                          label: "Mind Shield",
                          icon: "🛡️",
                          slot: "helmet" as const,
                        },
                      ].map((slot, i) => (
                        <TouchableOpacity
                          key={i}
                          style={homeStyles.gearSlot}
                          onPress={async () => {
                            try {
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
                              homeTheme.gearSlotGradientStart,
                              homeTheme.gearSlotGradientEnd,
                            ]}
                            style={homeStyles.gearSlotGradient}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={homeStyles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
                                  <View style={homeStyles.emptyGearSlot}>
                                    <Text style={homeStyles.gearSlotIcon}>
                                      {slot.icon}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {slot.label}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLockedText}>
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
                    <View style={homeStyles.gearColumnRight}>
                      {[
                        {
                          type: "comfort" as keyof EquippedItems,
                          label: "Comfort Layer",
                          icon: "📜",
                          slot: "armor" as const,
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
                          style={homeStyles.gearSlot}
                          onPress={async () => {
                            try {
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
                              homeTheme.gearSlotGradientStart,
                              homeTheme.gearSlotGradientEnd,
                            ]}
                            style={homeStyles.gearSlotGradient}
                          >
                            {(() => {
                              const equippedGear = getEquippedGearForSlot(slot.slot);
                              if (equippedGear) {
                                const gearImage = getGearSlotImage(equippedGear);
                                return (
                                  <View style={homeStyles.equippedGearSlot}>
                                    <Image 
                                      source={gearImage}
                                      style={{
                                        width: 32,
                                        height: 32,
                                        marginBottom: 4,
                                      }}
                                      resizeMode="contain"
                                    />
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {equippedGear.gear_type.name}
                                    </Text>
                                  </View>
                                );
                              } else {
                                return (
                                  <View style={homeStyles.emptyGearSlot}>
                                    <Text style={homeStyles.gearSlotIcon}>
                                      {slot.icon}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLabel}>
                                      {slot.label}
                                    </Text>
                                    <Text style={homeStyles.gearSlotLockedText}>
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
                  {ui.researchCondition === "survey" ? null : null}
                </LinearGradient>
              </View>

              {/* Archive Foundations Section - Updated to use home_data metrics */}
              <View style={homeStyles.foundationsSection}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={homeStyles.foundationsSectionGradient}
                >
                  <View style={homeStyles.foundationsHeader}>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                    <Text style={homeStyles.foundationsTitle}>
                      Archive Foundations
                    </Text>
                    <Icon name="anchor" size={20} color="#4ee6e6" />
                  </View>
                  <Text style={homeStyles.foundationsSubtitle}>
                    The ethereal pillars that support your mental architecture
                  </Text>

                  <View style={homeStyles.foundationsGrid}>
                    {/* Use pre-calculated wellness stats */}
                    {wellnessStatsForDisplay.map((foundation: any, index: number) => {
                      // Handle both wellness_stats format and archive foundations format
                      const isWellnessStats =
                        "label" in foundation && "value" in foundation;

                      if (isWellnessStats) {
                        // Format from backend wellness_stats - proper calculation
                        const currentValue = foundation.value || 0;
                        const maxValue = 20; // Assuming max wellness value is 20
                        const currentLevel = Math.floor(currentValue / 5) + 1; // Levels 1-4 based on 0-20 scale
                        const progressInCurrentLevel = currentValue % 5; // Progress within current level (0-4)
                        const xpToNextLevel = currentValue >= maxValue ? 0 : 5 - progressInCurrentLevel;
                        
                        return (
                          <TouchableOpacity
                            key={index}
                            style={homeStyles.foundationCard}
                            onPress={() =>
                              Alert.alert(
                                `${foundation.label} - Level ${currentLevel}`,
                                `Your ${foundation.label.toLowerCase()} foundation\n\n🎯 Current Value: ${currentValue}/${maxValue}\n📈 Progress in Level ${currentLevel}: ${progressInCurrentLevel}/5\n⚡ XP needed for next level: ${xpToNextLevel}`
                              )
                            }
                            activeOpacity={0.8}
                          >
                            <LinearGradient
                              colors={[
                                homeTheme.foundationCardGradientStart,
                                homeTheme.foundationCardGradientMiddle,
                                homeTheme.foundationCardGradientEnd,
                              ]}
                              style={homeStyles.foundationCardGradient}
                            >
                              <View
                                style={homeStyles.foundationIconContainer}
                              >
                                <Text style={homeStyles.foundationIcon}>
                                  {foundation.icon}
                                </Text>
                              </View>

                              <View
                                style={homeStyles.foundationValueContainer}
                              >
                                <Text style={homeStyles.foundationValue}>
                                  {currentValue}
                                  <Text style={homeStyles.foundationMaxValue}>
                                    /{maxValue}
                                  </Text>
                                </Text>
                                <Text style={homeStyles.foundationLevel}>
                                  Level {currentLevel}
                                </Text>
                              </View>

                              <View
                                style={homeStyles.foundationProgressContainer}
                              >
                                <View
                                  style={homeStyles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={[
                                      foundation.color,
                                      foundation.color,
                                    ]}
                                    style={[
                                      homeStyles.foundationProgressFill,
                                      {
                                        width: `${Math.min((currentValue / maxValue) * 100, 100)}%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text style={homeStyles.xpToNext}>
                                  {currentValue >= maxValue ? "Max Level!" : `${xpToNextLevel} XP to next level`}
                                </Text>
                              </View>

                              <Text style={homeStyles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={homeStyles.foundationDescription}>
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
                            style={homeStyles.foundationCard}
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
                                homeTheme.foundationCardGradientStart,
                                homeTheme.foundationCardGradientMiddle,
                                homeTheme.foundationCardGradientEnd,
                              ]}
                              style={homeStyles.foundationCardGradient}
                            >
                              <View
                                style={homeStyles.foundationIconContainer}
                              >
                                <Text style={homeStyles.foundationIcon}>
                                  {foundation.icon}
                                </Text>
                                {foundation.recentGain > 0 && (
                                  <View style={homeStyles.recentGainBadge}>
                                    <LinearGradient
                                      colors={["#10B981", "#34D399"]}
                                      style={homeStyles.recentGainGradient}
                                    >
                                      <Text style={homeStyles.recentGainText}>
                                        +{foundation.recentGain}
                                      </Text>
                                    </LinearGradient>
                                  </View>
                                )}
                              </View>

                              <View
                                style={homeStyles.foundationValueContainer}
                              >
                                <Text style={homeStyles.foundationValue}>
                                  {foundation.value}
                                  <Text style={homeStyles.foundationMaxValue}>
                                    /{foundation.maxValue}
                                  </Text>
                                </Text>
                                <Text style={homeStyles.foundationLevel}>
                                  Level {Math.floor(foundation.value / 5) + 1}
                                </Text>
                              </View>

                              <View
                                style={homeStyles.foundationProgressContainer}
                              >
                                <View
                                  style={homeStyles.foundationProgressBar}
                                >
                                  <LinearGradient
                                    colors={foundation.colors as any}
                                    style={[
                                      homeStyles.foundationProgressFill,
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
                                <Text style={homeStyles.xpToNext}>
                                  {5 - (foundation.value % 5)} XP to next unlock
                                </Text>
                              </View>

                              <Text style={homeStyles.foundationLabel}>
                                {foundation.label}
                              </Text>
                              <Text style={homeStyles.foundationDescription}>
                                {foundation.description}
                              </Text>

                              <View style={homeStyles.nextUnlockContainer}>
                                <Icon name="lock" size={10} color="#FCD34D" />
                                <Text style={homeStyles.nextUnlockText}>
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

          {/* Ancient Stories Tab - Show Story list directly */}
          {ui.activeTab === "tomes" && (
            <View style={homeStyles.tabpassagesArea}>
       

              {isLoadingStories ? (
                <View style={storyStyles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                                  <Text style={storyStyles.centeredMessageTitle}>
                  Loading Stories...
                </Text>
                  <Text style={storyStyles.centeredMessageText}>
                    Fetching ancient wisdom from the Archive...
                  </Text>
                </View>
              ) : stories.length > 0 ? (
                stories.map((Story, index) => (
                                        <TouchableOpacity
                        key={index}
                        style={storyStyles.chronicleCard}
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
                      style={[storyStyles.chronicleGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={storyStyles.chronicleTopBorder} />

                      <View style={storyStyles.chronicleHeader}>
                        <View style={storyStyles.chronicleInfo}>
                          <Text style={storyStyles.chronicleTitle}>
                            {Story.title || "Untitled Story"}
                          </Text>
                          <View style={storyStyles.chronicleBadges}>
                            <View style={storyStyles.categoryBadge}>
                              <Text style={storyStyles.categoryBadgeText}>
                                {Story.category || "Unknown"}
                              </Text>
                            </View>
                            <View style={storyStyles.difficultyBadge}>
                              <Text style={storyStyles.difficultyBadgeText}>
                                {Story.difficulty || "Unknown"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View style={storyStyles.chronicleDescriptionContainer}>
                        <Text style={storyStyles.chronicleDescription}>
                          {Story.description || "No description available"}
                        </Text>
                        <Text style={storyStyles.chronicleAtmosphere}>
                          ✦ {Story.atmosphere || "Mysterious atmosphere"} ✦
                        </Text>
                      </View>

                      <View style={storyStyles.explorationContainer}>
                        <View style={storyStyles.explorationHeader}>
                          <Icon name="compass" size={16} color="#06B6D4" />
                          <Text style={storyStyles.explorationLabel}>
                            Exploration Progress
                          </Text>
                          <Text style={storyStyles.explorationValue}>
                            {Story.exploration || 0}%
                          </Text>
                        </View>
                        <View style={storyStyles.explorationBar}>
                          <LinearGradient
                            colors={["#06B6D4", "#A855F7", "#4F46E5"] as const}
                            style={[
                              storyStyles.explorationFill,
                              { width: `${Story.exploration || 0}%` },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={storyStyles.chronicleStats}>
                        <View style={storyStyles.chronicleStat}>
                          <Icon name="key" size={16} color="#FCD34D" />
                          <Text style={storyStyles.chronicleStatText}>
                            {Story.revelations || 0} revelations
                          </Text>
                        </View>
                        <View style={storyStyles.chronicleStat}>
                          <Icon name="clock" size={16} color="#FB923C" />
                          <Text style={storyStyles.chronicleStatText}>
                            {Story.timeToComplete || "Unknown time"}
                          </Text>
                        </View>
                      </View>

                      <View style={storyStyles.chronicleButton}>
                        <LinearGradient
                          colors={["rgba(78, 230, 230, 0.4)", "rgba(6, 182, 212, 0.4)", "rgba(78, 230, 230, 0.4)"] as const}
                          style={[storyStyles.chronicleButtonGradient, {
                            shadowColor: 'rgba(78, 230, 230, 0.2)',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 4,
                            elevation: 4,
                          }]}
                        >
                          <Icon name="book-open" size={18} color="rgba(78, 230, 230, 0.9)" />
                          <Text style={{
                            ...homeStyles.chronicleButtonText,
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
                <View style={homeStyles.centeredMessageContainer}>
                  <Icon
                    name="book"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={homeStyles.centeredMessageTitle}>
                    No Stories Available
                  </Text>
                  <Text style={homeStyles.centeredMessageText}>
                    The Archive is currently empty. Check back later for new
                    wisdom to discover.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Codex Tab */}
          {ui.activeTab === "codex" && (
            <View style={homeStyles.tabpassagesArea}>
              {/* Journal Prompts Test Section */}
              <View style={[homeStyles.centeredMessageContainer, {
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                overflow: 'hidden',
              }]}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />

                <Text style={[homeStyles.centeredMessageTitle, { 
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
              
              <View style={[homeStyles.centeredMessageContainer, {
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
                overflow: 'hidden',
              }]}>
                <LinearGradient
                  colors={[
                    homeTheme.foundationCardGradientStart,
                    homeTheme.foundationCardGradientMiddle,
                    homeTheme.foundationCardGradientEnd,
                  ]}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Icon
                    name="edit-3"
                    size={40}
                    color="#4ee6e6"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={[homeStyles.centeredMessageTitle, {
                    color: 'rgba(78, 230, 230, 0.8)',
                    fontSize: 24,
                    fontWeight: '600',
                    letterSpacing: 2,
                    textShadowColor: 'rgba(78, 230, 230, 0.3)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                  }]}>The Codex</Text>
                </View>
                <Text style={[homeStyles.centeredMessageText, {
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
            <View style={homeStyles.tabpassagesArea}>
              {/* Main Game Section */}
              <View style={[
                homeStyles.centeredMessageContainer,
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
                <Text style={[homeStyles.centeredMessageTitle, {
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
                <Text style={[homeStyles.centeredMessageText, {
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
              <View style={[homeStyles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[homeStyles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="target" size={20} color="#4ee6e6" />
                  <Text style={[homeStyles.foundationsTitle, {
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
                <Text style={[homeStyles.foundationsSubtitle, {
                  color: '#d4af37',
                  textShadowColor: 'rgba(212, 175, 55, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }]}>
                  Your performance contributes to overall foundation growth
                </Text>

                  <View style={homeStyles.foundationsGrid}>
                    {/* Excellent Performance */}
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
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
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🏆
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            12
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Master Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#FCD34D", "#F59E0B"]}
                              style={[homeStyles.foundationProgressFill, { width: "100%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            Maximum performance achieved
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Master
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Contributes to foundation growth
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Mixed Performance */}
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
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
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            🔄
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            4
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Adept Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#06B6D4", "#0891B2"]}
                              style={[homeStyles.foundationProgressFill, { width: "33%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            8 XP to next level
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Adept
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Steady foundation building
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Poor Performance */}
                    <TouchableOpacity
                      style={homeStyles.foundationCard}
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
                        style={[homeStyles.foundationCardGradient, {
                          borderColor: '#d4af37',
                          borderWidth: 1,
                          shadowColor: '#d4af37',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 4,
                          elevation: 4,
                        }]}
                      >
                        <View style={homeStyles.foundationIconContainer}>
                          <Text style={homeStyles.foundationIcon}>
                            ⚠️
                          </Text>
                        </View>
                        <View style={homeStyles.foundationValueContainer}>
                          <Text style={homeStyles.foundationValue}>
                            -2
                            <Text style={homeStyles.foundationMaxValue}>
                              /12
                            </Text>
                          </Text>
                          <Text style={homeStyles.foundationLevel}>
                            Novice Level
                          </Text>
                        </View>
                        <View style={homeStyles.foundationProgressContainer}>
                          <View style={homeStyles.foundationProgressBar}>
                            <LinearGradient
                              colors={["#EF4444", "#DC2626"]}
                              style={[homeStyles.foundationProgressFill, { width: "8%" }]}
                            />
                          </View>
                          <Text style={homeStyles.xpToNext}>
                            14 XP to next level
                          </Text>
                        </View>
                        <Text style={homeStyles.foundationLabel}>
                          Novice
                        </Text>
                        <Text style={homeStyles.foundationDescription}>
                          Learning and growing
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
              </View>

              {/* Tips Section */}
              <View style={[homeStyles.foundationsSection, {
                backgroundColor: 'rgba(10, 11, 15, 0.95)',
                borderColor: '#d4af37',
                borderWidth: 2,
                shadowColor: '#d4af37',
                shadowOffset: { width: 2, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 12,
              }]}>
                <View style={[homeStyles.foundationsHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 1,
                }]}>
                  <Icon name="lightbulb" size={20} color="#4ee6e6" />
                  <Text style={[homeStyles.foundationsTitle, {
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
                <Text style={[homeStyles.foundationsSubtitle, {
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
            <View style={homeStyles.archiveTabpassagesArea}>
              {/* Loading state */}
              {isLoadingStories ? (
                <View style={homeStyles.centeredMessageContainer}>
                  <Icon
                    name="loader"
                    size={40}
                    color="#A855F7"
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={homeStyles.centeredMessageTitle}>
                    Loading Archive Data...
                  </Text>
                  <Text style={homeStyles.centeredMessageText}>
                    Retrieving your journey statistics from the Archive...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Story Progress Section */}
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="book-open" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
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
                        ...homeStyles.foundationsSubtitle,
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

                      <View style={homeStyles.foundationsGrid}>
                        {/* Stories Completed Card */}
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🏆
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.filter(story => story.exploration >= 100).length}
                                <Text style={homeStyles.foundationMaxValue}>
                                  /{stories.length}
                                </Text>
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                {stories.length > 0 ? Math.round((stories.filter(story => story.exploration >= 100).length / stories.length) * 100) : 0}% Complete
                              </Text>
                            </View>
                            <View style={homeStyles.foundationProgressContainer}>
                              <View style={homeStyles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#10B981", "#059669"]}
                                  style={[
                                    homeStyles.foundationProgressFill,
                                    {
                                      width: `${stories.length > 0 ? (stories.filter(story => story.exploration >= 100).length / stories.length) * 100 : 0}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Stories Completed
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: 'rgba(78, 230, 230, 0.4)',
                              borderWidth: 1,
                              shadowColor: 'rgba(78, 230, 230, 0.2)',
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.2,
                              shadowRadius: 4,
                              elevation: 4,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📖
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.reduce((total, story) => {
                                  if (story.exploration > 0) {
                                    const chaptersExplored = Math.ceil((story.exploration / 100) * (story.chapter_count || 1));
                                    return total + chaptersExplored;
                                  }
                                  return total;
                                }, 0)}
                                <Text style={homeStyles.foundationMaxValue}>
                                  /{stories.reduce((total, story) => total + (story.chapter_count || 0), 0)}
                                </Text>
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Chapters Explored
                              </Text>
                            </View>
                            <View style={homeStyles.foundationProgressContainer}>
                              <View style={homeStyles.foundationProgressBar}>
                                <LinearGradient
                                  colors={["#06B6D4", "#0891B2"]}
                                  style={[
                                    homeStyles.foundationProgressFill,
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
                            <Text style={homeStyles.foundationLabel}>
                              Chapters Explored
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.reduce((total, story) => total + (story.revelations || 0), 0)}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Revelations Found
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Hidden Truths
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="edit-3" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
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
                        ...homeStyles.foundationsSubtitle,
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

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const recentReflections: any[] = [];
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📝
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                0
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Total Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Reflections
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const recentReflections: any[] = [];
                            const journalEntries = recentReflections.filter((reflection: any) => reflection.entry_type === 'journal');
                            const latestEntry = journalEntries[0];
                            
                            if (latestEntry) {
                              Alert.alert(
                                "Latest Journal Entry",
                                `"${latestEntry.title}"\n\n${latestEntry.content.substring(0, 100)}${latestEntry.content.length > 100 ? '...' : ''}\n\nPrompt: ${getDisplayPrompt(latestEntry.prompt)}`,
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                ✨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                0
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Journal Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Written Reflections
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
                          onPress={() => {
                            const recentReflections: any[] = [];
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🎨
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                0
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Creative Entries
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Artistic Expression
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="archive" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
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
                        ...homeStyles.foundationsSubtitle,
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

                      <View style={homeStyles.foundationsGrid}>
                        <TouchableOpacity
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                📊
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.length > 0 ? Math.round(stories.reduce((total, story) => total + (story.exploration || 0), 0) / stories.length) : 0}%
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Average Progress
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Overall Progress
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🔄
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.filter(story => story.exploration > 0 && story.exploration < 100).length}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                In Progress
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Active Explorations
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                          style={homeStyles.foundationCard}
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
                            style={[homeStyles.foundationCardGradient, {
                              borderColor: '#4ee6e6',
                              borderWidth: 2,
                              shadowColor: '#4ee6e6',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.4,
                              shadowRadius: 8,
                              elevation: 8,
                            }]}
                          >
                            <View style={homeStyles.foundationIconContainer}>
                              <Text style={homeStyles.foundationIcon}>
                                🔓
                              </Text>
                            </View>
                            <View style={homeStyles.foundationValueContainer}>
                              <Text style={homeStyles.foundationValue}>
                                {stories.filter(story => story.exploration === 0).length}
                              </Text>
                              <Text style={homeStyles.foundationLevel}>
                                Available
                              </Text>
                            </View>
                            <Text style={homeStyles.foundationLabel}>
                              Untold Tales
                            </Text>
                            <Text style={homeStyles.foundationDescription}>
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
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="settings" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
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
                        ...homeStyles.foundationsSubtitle,
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

                      <View style={[homeStyles.foundationsGrid, {
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }]}>
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
                            minHeight: 50,
                          }}
                          onPress={() => {
                            console.log('🎨 Customize Avatar button pressed!');
                            console.log('🎨 Router object:', router);
                            console.log('🎨 Router push function:', typeof router?.push);
                            
                            // Test with immediate navigation first
                            try {
                              console.log('🎨 Attempting direct navigation...');
                              router.push('/(onboarding)/character-creator');
                              console.log('🎨 Direct navigation call completed');
                            } catch (error) {
                              console.error('🎨 Direct navigation error:', error);
                              Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
                            }
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
                            minHeight: 50,
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
                            minHeight: 50,
                          }}
                          onPress={() => {
                            console.log('🚪 Logout button pressed!');
                            console.log('🚪 Auth object:', auth);
                            console.log('🚪 Auth logout function:', typeof auth?.logout);
                            
                            // Test with immediate logout first
                            if (auth && auth.logout) {
                              try {
                                console.log('🚪 Attempting direct logout...');
                                auth.logout();
                                console.log('🚪 Direct logout call completed');
                              } catch (error) {
                                console.error('🚪 Direct logout error:', error);
                                Alert.alert('Logout Error', `Failed to logout: ${error.message}`);
                              }
                            } else {
                              console.error('🚪 Auth or logout function not available');
                              Alert.alert('Error', 'Logout function not available');
                            }
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
                  <View style={homeStyles.foundationsSection}>
                    <LinearGradient
                      colors={[
                        "rgba(10, 11, 15, 0.95)",
                        "rgba(30, 41, 59, 0.8)",
                        "rgba(10, 11, 15, 0.95)",
                      ]}
                      style={[homeStyles.foundationsSectionGradient, {
                        borderColor: '#d4af37',
                        borderWidth: 2,
                        shadowColor: '#d4af37',
                        shadowOffset: { width: 2, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }]}
                    >
                      <View style={homeStyles.foundationsHeader}>
                        <Icon name="heart" size={20} color="#4ee6e6" />
                        <Text style={{
                          ...homeStyles.foundationsTitle,
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
                        ...homeStyles.foundationsSubtitle,
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

                      <View style={homeStyles.foundationsGrid}>
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

      {/* Tutorial Modal */}
      <TutorialModal />

    </View>
  );
};

export default ArchiveInterface;
