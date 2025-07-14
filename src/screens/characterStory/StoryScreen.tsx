import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FloatingRewardNotification from '../../components/FloatingRewardNotification';
import { useMasterState } from '../../context/MasterStateContext';
import { useStoryEngine } from '../../hooks/useStoryEngine';
import { apiService } from '../../services/apiService';
import { createGlobalStyles } from '../../styles/globalStyles';
import { Chapter, Passage, Story } from '../../types/story';
import { StoryRewardManager } from '../../utils/storyRewardIntegration';

const { width, height } = Dimensions.get("window");

interface StoryScreenProps {
  visible: boolean;
  onClose: () => void;
  story: Story;
  chapter?: Chapter;
  passage?: Passage;
  choices?: any[];
  onStatGain?: (statName: string, amount: number) => void;
  onArtifactUnlock?: (artifact: any) => void;
  onSkillLearned?: (skills: string[]) => void;
  onStoryComplete?: (completionData: any) => void;
}

const StoryScreen: React.FC<StoryScreenProps> = ({
  visible,
  onClose,
  story,
  chapter,
  passage,
  choices,
  onStatGain,
  onArtifactUnlock,
  onSkillLearned,
  onStoryComplete,
}) => {
  // Context and theme
  const { theme, auth } = useMasterState();
  const { characterId } = auth;
  const globalStyles = createGlobalStyles(theme.theme);

  // Use the new story engine instead of progressive loader
  const {
    storyState,
    currentPassage,
    availableChoices,
    progress,
    loading: storyLoading,
    error: storyError,
    isInitialized,
    isStoryCompleted,
    makeChoice,
    getCurrentPassage,
    hasChoices,
    canContinue,
    isNarration
  } = useStoryEngine({
    storyId: String(story?.id || "")
  });

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterRewards, setChapterRewards] = useState<Chapter[]>([]);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story>(story);
  
  // State declarations
  const [currentId, setCurrentId] = useState<string>("");
  const [totalStatGains, setTotalStatGains] = useState<Record<string, number>>({});
  const autoAdvanceTargetRef = useRef<string | null>(null);
  const lastAutoAdvancedPassageRef = useRef<string | null>(null);
  const [recentGains, setRecentGains] = useState<Record<string, number>>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<any>(null);
  const [showSkillLearned, setShowSkillLearned] = useState(false);
  const [newSkills, setNewSkills] = useState<string[]>([]);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isCompletingStory, setIsCompletingStory] = useState(false);
  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(null);
  const [savedRewards, setSavedRewards] = useState<any>({});

  // Floating notification state
  const [notificationQueue, setNotificationQueue] = useState<Array<{
    id: string;
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
  }>>([]);
  const [currentNotification, setCurrentNotification] = useState<{
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
  } | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const passageAnim = useRef(new Animated.Value(0)).current;
  const statGainAnim = useRef(new Animated.Value(0)).current;
  const artifactUnlockAnim = useRef(new Animated.Value(0)).current;
  const skillLearnedAnim = useRef(new Animated.Value(0)).current;

  // Story meta
  const StoryID = story?.id || 0;
  const StoryTitle = story?.title || "Unknown Story";
  const StorySubtitle = story?.description || "";
  const StoryAtmosphere = ""; // Add if you have this field
  const StoryDifficulty = ""; // Add if you have this field
  const StoryRarity = "Common"; // Add if you have this field
  const StoryImage = story?.image || null;
  const StoryMinLevel = story?.min_level || 1; // Default to 1 if not provided

  // Chapter meta
  const ChapterID = chapter?.id || 0;
  const ChapterTitle = chapter?.title || "Unknown Chapter";
  const ChapterDescription = chapter?.content || "";
  const ChapterImage = chapter?.image || null;
  const ChapterRequirements = chapter?.requirements || 1; // Default to 1 if not provided
  const ChapterPassages = chapter?.passages || []; // Use chapter passages if available

  //Passages meta
  const PassageID = passage?.passage_id || passage?.id || currentId;
  const PassageContent = passage?.content || "";
  const PassageType = passage?.passage_type || "narration";
  const PassageMood = passage?.mood || "neutral"; // Default to neutral if not provided
  const PassageChoices = passage?.choices || choices || [];
  const PassageImage = passage?.background_image || null; // Add if you have this field
  const PassageOrder = passage?.order || 0;

  // Initialize reward manager when story changes
  useEffect(() => {
    if (story?.id && characterId) {
      console.log('=== INITIALIZING REWARD MANAGER ===');
      console.log('Story ID:', story.id);
      console.log('Character ID:', characterId);
      
      const manager = new StoryRewardManager(
        story.id.toString(),
        (message: string, type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact') => {
          console.log('=== SHOWING FLOATING NOTIFICATION ===');
          console.log('Message:', message);
          console.log('Type:', type);
          showFloatingNotification(message, type);
        },
        (completionData: any) => {
          console.log('=== STORY COMPLETION CALLBACK ===');
          console.log('Completion data:', completionData);
          onStoryComplete?.(completionData);
        },
        apiService,
        parseInt(characterId, 10)
      );
      
      console.log('Reward manager created:', manager);
      setRewardManager(manager);
    } else {
      console.log('Cannot initialize reward manager - missing story ID or character ID');
      console.log('Story ID:', story?.id);
      console.log('Character ID:', characterId);
    }
  }, [story?.id, characterId, onStoryComplete]);

  // Notification queue management
  useEffect(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      const nextNotification = notificationQueue[0];
      setCurrentNotification(nextNotification);
      setNotificationQueue(prev => prev.slice(1));
    }
  }, [notificationQueue, currentNotification]);

  // Show floating notification
  const showFloatingNotification = (message: string, type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact') => {
    const notificationId = Date.now().toString();
    setNotificationQueue(prev => [...prev, { id: notificationId, message, type }]);
  };

  // Hide current notification
  const hideCurrentNotification = () => {
    setCurrentNotification(null);
  };

  // fetch and store the coping tool mapping and saved rewards in your component's state
  useEffect(() => {
    // TEMPORARY: Disabled to prevent unnecessary API calls before login
    console.log('StoryScreen: Skipping data loading - forcing login screen');
    // const loadData = async () => {
    //   try {
    //     const mapping = await apiService.getAvailableCopingTools();
    //     // Convert CopingTool[] to Record<string, number>
    //     const toolMapping: Record<string, number> = {};
    //     mapping.forEach((tool: any) => {
    //       toolMapping[tool.name] = tool.id;
    //     });
    //     setCopingToolMapping(toolMapping);

    //     // Load saved rewards from backend
    //     if (characterId) {
    //       const rewards = await apiService.getCharacterRewards(characterId);
    //       if (rewards) {
    //         setSavedRewards(rewards as SavedRewards);
    //       }
    //     }
    //   } catch (error) {
    //     console.error("Error loading data:", error);
    //   }
    // };

    // if (characterId) {
    //   loadData();
    // }
  }, [characterId]);


  // Add effect to handle stat gain animation
  useEffect(() => {
    if (showStatGain) {
      Animated.sequence([
        Animated.timing(statGainAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(statGainAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowStatGain(false);
      });
    }
  }, [showStatGain]);

  // Add effect to handle artifact unlock animation
  useEffect(() => {
    if (showArtifactUnlock && newArtifact) {
      Animated.sequence([
        Animated.timing(artifactUnlockAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(4000),
        Animated.timing(artifactUnlockAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowArtifactUnlock(false);
      });
    }
  }, [showArtifactUnlock, newArtifact]);

  // Initialize current passage when progressive loader is ready
  useEffect(() => {
    if (isInitialized && currentPassage && currentPassage.passage_id) {
      setCurrentId(currentPassage.passage_id);
    }
  }, [isInitialized, currentPassage]);

  // Update current passage when currentId changes
  useEffect(() => {
    if (currentId && currentPassage) {
      // Track passage rewards when passage is loaded
      if (rewardManager && currentPassage) {
        // Convert to proper Passage type
        const passageData: any = {
          ...currentPassage,
          chapter: chapter?.id || 1,
          passage_id: currentPassage.passage_id,
          content: currentPassage.content,
          passage_type: currentPassage.passage_type,
          speaker: currentPassage.speaker,
          required_conditions: currentPassage.required_conditions || {},
          story_effects: currentPassage.story_effects || {},
          mood: currentPassage.mood,
          background_music: currentPassage.background_music,
          background_image: currentPassage.background_image,
          order: currentPassage.order,
          choices: currentPassage.choices || []
        };
        rewardManager.handlePassageVisit(passageData).catch(error => {
          console.error('Error handling passage rewards:', error);
        });
      }
    }
  }, [currentId, currentPassage, rewardManager]);
  // Debug logging for current passage
  useEffect(() => {
    console.log("=== CURRENT PASSAGE DEBUG ===");
    console.log("currentId:", currentId);
    console.log("currentPassage:", currentPassage);
    console.log("currentPassage content:", currentPassage?.content);
    console.log("currentPassage choices:", currentPassage?.choices?.length || 0);
    console.log("currentPassage type:", currentPassage?.passage_type);
    console.log("isAutoAdvancing:", isAutoAdvancing);
    console.log("isLoadingPassage:", isLoadingPassage);
    console.log("=== END CURRENT PASSAGE DEBUG ===");
  }, [currentId, currentPassage, isAutoAdvancing, isLoadingPassage]);

  // Debug effect for auto-advance logic
  useEffect(() => {
    if (currentPassage) {
      const hasChoices = currentPassage.choices && currentPassage.choices.length > 0;
      const isNarration = currentPassage.passage_type === "narration" || 
                         currentPassage.passage_type === "dialogue";
      
      console.log("=== AUTO-ADVANCE LOGIC DEBUG ===");
      console.log("Passage ID:", currentPassage.passage_id);
      console.log("Passage type:", currentPassage.passage_type);
      console.log("Is narration:", isNarration);
      console.log("Has choices:", hasChoices);
      console.log("Choices count:", currentPassage.choices?.length || 0);
      console.log("Should auto-advance:", isNarration && !hasChoices);
      console.log("isAutoAdvancing:", isAutoAdvancing);
      console.log("isLoadingPassage:", isLoadingPassage);
      console.log("=== END AUTO-ADVANCE LOGIC DEBUG ===");
    }
  }, [currentPassage, isAutoAdvancing, isLoadingPassage]);
  // Effect to ensure current passage is found when currentId changes
  useEffect(() => {
    // Only reset if we don't have a currentId and we have loaded passages
    // Don't reset if we already have a currentId (to preserve choice navigation)
    if (!currentId && currentPassage && currentPassage.passage_id) {
      setCurrentId(currentPassage.passage_id);
    } else if (!currentPassage || !currentPassage.passage_id) {
      console.error("No current passage available for story:", story?.id);
    }
  }, [currentPassage, story?.id]); // Removed currentId from dependencies to prevent interference
  
  // Effect for modal visibility and initialization
  useEffect(() => {
    if (visible && !currentId) { // Only reset if no currentId is set
      // Reset state when opening for the first time
      const startingPassageId = (() => {
        if (currentPassage && currentPassage.passage_id) {
          return currentPassage.passage_id;
        }
        return ""; // Don't default to numeric ID
      })();
      
      setCurrentId(startingPassageId);
      setTotalStatGains({});
      setUnlockedArtifacts([]);
      setLearnedSkills([]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, story, currentPassage]); // Removed currentId from dependencies

  // Effect for passage animation when currentId changes
  useEffect(() => {
    if (currentId) {
      passageAnim.setValue(0);
      Animated.timing(passageAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [currentId]);

  // Effect to handle passage type logic (auto-advance or story completion)
  useEffect(() => {
    if (!currentPassage || isLoadingPassage || isAutoAdvancing || isCompletingStory) return;
    
    // Skip all processing for ending passages - they should only show the completion button
    if (currentPassage.passage_type === "ending") {
      console.log("=== ENDING PASSAGE DETECTED - SKIPPING AUTO-ADVANCE LOGIC ===");
      console.log("Ending passage ID:", currentPassage.passage_id);
      console.log("Ending passages should only show completion button, not auto-advance");
      return;
    }
  
    const isNarration =
      currentPassage.passage_type === "narration" ||
      currentPassage.passage_type === "dialogue";
    const isEnding = currentPassage.passage_type === "ending";
    const hasRealChoices =
      Array.isArray(currentPassage.choices) && currentPassage.choices.length > 0;
    const isLoaded = currentPassage.isLoaded;
  
    // Avoid re-processing the same passage (but allow ending passages to be processed)
    if (lastAutoAdvancedPassageRef.current === currentPassage.passage_id && currentPassage.passage_type !== "ending") {
      console.log("Already processed this passage:", currentPassage.passage_id);
      return;
    }
  
        // Handle ending passage - show completion button (don't auto-trigger)
    if (isEnding && isLoaded && currentPassage.passage_id) {
      console.log("=== STORY ENDING DETECTED ===");
      console.log("Passage type:", currentPassage.passage_type);
      console.log("Current passage ID:", currentPassage.passage_id);
      console.log("Ending passage detected - user should see completion button");

      // Don't mark ending passages as auto-advanced - they should show the completion button
      // lastAutoAdvancedPassageRef.current = currentPassage.passage_id;
      setIsAutoAdvancing(false);
      setIsLoadingPassage(false);

      // Don't auto-trigger story completion - let user click the button
      return;
    }
  
    // Handle auto-advance for narration passages without choices
    if (
      isNarration &&
      !hasRealChoices &&
      isLoaded &&
      currentPassage.passage_id
    ) {
      console.log("=== AUTO-ADVANCE TRIGGERED ===");
      console.log("Passage type:", currentPassage.passage_type);
      console.log("Has choices:", hasRealChoices);
      console.log("Current passage ID:", currentPassage.passage_id);
      console.log("Auto-advancing to next passage...");
  
      lastAutoAdvancedPassageRef.current = currentPassage.passage_id;
      autoAdvanceTargetRef.current = currentPassage.passage_id;
      setIsAutoAdvancing(true);
  
      const autoAdvanceTimer = setTimeout(() => {
        if (currentPassage.passage_id !== autoAdvanceTargetRef.current) {
          console.log("⛔️ Passage changed before timer triggered. Skipping auto-advance.");
          setIsAutoAdvancing(false);
          return;
        }
  
        console.log("✅ Auto-advance timer confirmed. Advancing passage:", currentPassage.passage_id);
        autoAdvanceToNext();
      }, 2000);
  
      console.log("Timer set for passage:", currentPassage.passage_id);
  
      return () => {
        console.log("Clearing auto-advance timer for passage:", currentPassage.passage_id);
        clearTimeout(autoAdvanceTimer);
        setIsAutoAdvancing(false);
      };
    }
  }, [currentPassage, isLoadingPassage, isAutoAdvancing, currentId]);
  
//reset auto advance when passage changes
useEffect(() => {
  if (currentId !== lastAutoAdvancedPassageRef.current) {
    console.log("Resetting last auto-advance ref for new passage:", currentId);
    lastAutoAdvancedPassageRef.current = null;
  }
  
  // Special handling for ending passages - ensure they're not marked as auto-advanced
  if (currentPassage?.passage_type === "ending") {
    console.log("Ending passage detected - clearing auto-advance ref to allow completion button");
    lastAutoAdvancedPassageRef.current = null;
    // Also reset loading states for ending passages
    setIsAutoAdvancing(false);
    setIsLoadingPassage(false);
  }
}, [currentId, currentPassage?.passage_type]);
console.log("Auto-advance ref reset for passage:", lastAutoAdvancedPassageRef.current);

// Special effect to handle ending passages
useEffect(() => {
  if (currentPassage?.passage_type === "ending") {
    console.log("=== ENDING PASSAGE SPECIAL HANDLING ===");
    console.log("Ending passage detected, ensuring proper state for completion button");
    
    // Reset all auto-advance and loading states
    setIsAutoAdvancing(false);
    setIsLoadingPassage(false);
    lastAutoAdvancedPassageRef.current = null;
    
    console.log("States reset for ending passage");
  }
}, [currentPassage?.passage_type, currentPassage?.passage_id]);


  // Additional effect to handle auto-advance when currentId changes and new passage has no choices
  useEffect(() => {
    if (currentId && currentPassage && !isLoadingPassage && !isAutoAdvancing) {
      // Skip ending passages - they should not auto-advance
      if (currentPassage.passage_type === "ending") {
        console.log("=== ENDING PASSAGE DETECTED - SKIPPING AUTO-ADVANCE (currentId change) ===");
        return;
      }
      const hasChoices = currentPassage.choices && currentPassage.choices.length > 0;
      const isNarration = currentPassage.passage_type === "narration" || 
                         currentPassage.passage_type === "dialogue";
      
      // Check if we've already auto-advanced this passage (but allow ending passages)
      if (lastAutoAdvancedPassageRef.current === currentPassage.passage_id && currentPassage.passage_type !== "ending") {
        console.log("Already auto-advanced this passage:", currentPassage.passage_id);
        return;
      }
      
      // Auto-advance if it's a narration/dialogue passage with no choices (but not ending passages)
      if (isNarration && !hasChoices && currentPassage.passage_type !== "ending") {
        console.log("=== AUTO-ADVANCE TRIGGERED (currentId change) ===");
        console.log("Passage type:", currentPassage.passage_type);
        console.log("Has choices:", hasChoices);
        console.log("Current passage ID:", currentPassage.passage_id);
        console.log("Auto-advancing to next passage...");
        
        // Mark this passage as auto-advanced
        lastAutoAdvancedPassageRef.current = currentPassage.passage_id;
        setIsAutoAdvancing(true);
        
        // Add a small delay to let the user read the content
        const autoAdvanceTimer = setTimeout(() => {
          console.log("Auto-advance timer triggered for passage:", currentPassage.passage_id);
          autoAdvanceToNext();
        }, 2000); // 2 second delay
        
        return () => {
          console.log("Clearing auto-advance timer for passage:", currentPassage.passage_id);
          clearTimeout(autoAdvanceTimer);
          setIsAutoAdvancing(false);
        };
      }
    }
  }, [currentId, currentPassage, isLoadingPassage, isAutoAdvancing]);

  // Force auto-advance check when passage changes
  useEffect(() => {
    if (currentPassage && !isLoadingPassage && !isAutoAdvancing) {
      // Skip ending passages - they should not auto-advance
      if (currentPassage.passage_type === "ending") {
        console.log("=== ENDING PASSAGE DETECTED - SKIPPING AUTO-ADVANCE (force check) ===");
        return;
      }
      const hasChoices = currentPassage.choices && currentPassage.choices.length > 0;
      const isNarration = currentPassage.passage_type === "narration" || 
                         currentPassage.passage_type === "dialogue";
      
      // Check if we've already auto-advanced this passage (but allow ending passages)
      if (lastAutoAdvancedPassageRef.current === currentPassage.passage_id && currentPassage.passage_type !== "ending") {
        console.log("Already auto-advanced this passage:", currentPassage.passage_id);
        return;
      }
      
      if (isNarration && !hasChoices && currentPassage.passage_type !== "ending") {
        console.log("=== FORCE AUTO-ADVANCE CHECK ===");
        console.log("Passage ID:", currentPassage.passage_id);
        console.log("Passage type:", currentPassage.passage_type);
        console.log("Has choices:", hasChoices);
        console.log("Triggering auto-advance...");
        
        // Mark this passage as auto-advanced
        lastAutoAdvancedPassageRef.current = currentPassage.passage_id;
        setIsAutoAdvancing(true);
        
        const forceAutoAdvanceTimer = setTimeout(() => {
          console.log("Force auto-advance timer triggered for passage:", currentPassage.passage_id);
          autoAdvanceToNext();
        }, 2000);
        
        return () => {
          console.log("Clearing force auto-advance timer for passage:", currentPassage.passage_id);
          clearTimeout(forceAutoAdvanceTimer);
          setIsAutoAdvancing(false);
        };
      }
    }
  }, [currentPassage?.passage_id, currentPassage?.choices?.length, isLoadingPassage, isAutoAdvancing]);
  // Function to handle story completion when ending passage is reached
  const handleStoryCompletion = async (endingPassageId?: string) => {
    console.log('=== HANDLE STORY COMPLETION CALLED ===');
    console.log('isLoadingPassage:', isLoadingPassage);
    console.log('isCompletingStory:', isCompletingStory);
    console.log('endingPassageId:', endingPassageId);
    console.log('Story ID:', StoryID);
    console.log('Current ID:', currentId);
    
    if (isLoadingPassage || isCompletingStory) {
      console.log('Story completion blocked - already loading or completing');
      return;
    }
    
    console.log('Setting isCompletingStory to true');
    setIsCompletingStory(true);
    setIsLoadingPassage(true);
    
    try {
      console.log("=== HANDLING STORY COMPLETION ===");
      console.log("Story ID:", StoryID);
      console.log("Current passage ID:", currentId);
      console.log("Ending passage ID:", endingPassageId);
      console.log("Total stat gains:", totalStatGains);
      
      // First, handle reward manager completion to save accumulated rewards
      if (rewardManager) {
        console.log('=== HANDLING REWARD MANAGER COMPLETION ===');
        await rewardManager.handleStoryCompletion(savedRewards);
      }
      
      // Use the ending passage ID if provided, otherwise use current passage ID
      const passageIdForCompletion = endingPassageId || currentId;
      
      // Call the story completion API
      console.log('Calling apiService.completeStoryFromEnding...');
      console.log('Parameters:', {
        storyId: String(StoryID),
        passageId: passageIdForCompletion,
        totalStatGains,
        journalEntries: []
      });
      
      const completionResult = await apiService.completeStoryFromEnding(
        String(StoryID),
        passageIdForCompletion,
        totalStatGains,
        [] // journal entries - can be enhanced later
      );
      
      console.log("Story completion result:", completionResult);
      console.log("Result structure:", Object.keys(completionResult || {}));
      console.log("Story completed flag:", completionResult?.story_completed);
      console.log("Rewards earned:", completionResult?.rewards_earned);
      
      // Handle the completion response - be more flexible with the response structure
      const isCompleted = completionResult?.story_completed === true || completionResult?.story_completed === "true";
      
      if (isCompleted) {
        // Check if this is an "already completed" response
        const isAlreadyCompleted = completionResult?.message?.includes('already completed');
        
        if (isAlreadyCompleted) {
          // Story was already completed - show a simple completion message and close
          console.log('=== STORY ALREADY COMPLETED ===');
          console.log('Showing already completed message and closing modal');
          
          // Even for already completed stories, we should still save any accumulated rewards
          console.log('=== SAVING REWARDS FOR ALREADY COMPLETED STORY ===');
          if (rewardManager) {
            await rewardManager.handleStoryCompletion(savedRewards);
          }
          
          // For already completed stories, close immediately without alert
                      console.log('=== ALREADY COMPLETED - CLOSING MODAL IMMEDIATELY ===');
            onStoryComplete?.({
              storyId: String(StoryID),
              finalRewards: [],
              skillsLearned: [],
            totalStatGains: totalStatGains
          });
          onClose();
          
          // Also try to show a brief alert for user feedback
          setTimeout(() => {
            try {
              Alert.alert(
                "🏆 Story Completed",
                `You have already completed "${story?.title || 'this story'}".\n\nYour progress has been saved.`,
                [{ text: "OK" }]
              );
            } catch (alertError) {
              console.error('Alert.alert failed:', alertError);
            }
          }, 100);
        } else {
          // Normal completion with rewards
          // Build comprehensive awards message
          const storyTitle = completionResult?.story_title || completionResult?.story_id || story?.title || 'this story';
          const xpEarned = completionResult?.rewards_earned?.xp_earned || 0;
          const finalRewards = completionResult?.rewards_earned?.final_rewards || [];
          const skillsLearned = completionResult?.rewards_earned?.skills_learned || [];
          const statGains = completionResult?.rewards_earned?.stat_gains || {};
          const journalEntries = completionResult?.rewards_earned?.journal_entries || [];
          
          let awardsMessage = `🎉 Congratulations! You have completed "${storyTitle}"!\n\n`;
          
          // Add XP earned
          if (xpEarned > 0) {
            awardsMessage += `✨ Experience Points: +${xpEarned} XP\n\n`;
          }
          
          // Add final rewards/items
          if (finalRewards.length > 0) {
            awardsMessage += `🎁 Items Earned:\n${finalRewards.map((reward: string) => `• ${reward}`).join('\n')}\n\n`;
          }
          
          // Add skills learned
          if (skillsLearned.length > 0) {
            awardsMessage += `📚 Skills Learned:\n${skillsLearned.map((skill: string) => `• ${skill}`).join('\n')}\n\n`;
          }
          
          // Add stat gains
          if (Object.keys(statGains).length > 0) {
            awardsMessage += `📈 Stat Improvements:\n${Object.entries(statGains).map(([stat, gain]) => `• ${stat}: +${gain}`).join('\n')}\n\n`;
          }
          
          // Add journal entries
          if (journalEntries.length > 0) {
            awardsMessage += `📖 New Journal Entries:\n${journalEntries.map((entry: string) => `• ${entry}`).join('\n')}\n\n`;
          }
          
          // Add level up notification if applicable
          if (completionResult?.player_data?.leveled_up) {
            awardsMessage += `🎊 LEVEL UP! ${completionResult.player_data.old_level} → ${completionResult.player_data.level}\n\n`;
          }
          
          // Show comprehensive awards alert
          console.log('=== SHOWING COMPLETION ALERT ===');
          console.log('Alert message:', awardsMessage);
          
                      // Close the modal immediately and show alert separately
            console.log('=== NORMAL COMPLETION - CLOSING MODAL IMMEDIATELY ===');
            onStoryComplete?.({
              storyId: String(StoryID),
              finalRewards: finalRewards,
              skillsLearned: skillsLearned,
            totalStatGains: { ...totalStatGains, ...statGains }
          });
          onClose();
          
          // Show the rewards alert after a brief delay
          setTimeout(() => {
            try {
              Alert.alert(
                "🏆 Story Completion Rewards",
                awardsMessage,
                [{ text: "Claim Rewards" }]
              );
            } catch (alertError) {
              console.error('Alert.alert failed:', alertError);
            }
          }, 200);
        }
      } else {
        console.warn("Story completion API call succeeded but story_completed is false");
        console.log("Full completion result:", completionResult);
        
                  // Still close the story and show a generic completion message
          console.log('=== COMPLETION FALSE - CLOSING MODAL IMMEDIATELY ===');
          onStoryComplete?.({
            storyId: String(StoryID),
            finalRewards: [],
            skillsLearned: [],
          totalStatGains: totalStatGains
        });
        onClose();
        
        // Show a brief alert for user feedback
        setTimeout(() => {
          try {
            Alert.alert(
              "Story Completed",
              `You have reached the end of "${story?.title || 'this story'}".\n\nYour progress has been saved.`,
              [{ text: "Continue" }]
            );
          } catch (alertError) {
            console.error('Alert.alert failed:', alertError);
          }
        }, 200);
      }
    } catch (error) {
      console.error("Error handling story completion:", error);
      
      // Even if story completion API fails, try to save accumulated rewards
      console.log('=== SAVING REWARDS DESPITE API ERROR ===');
      if (rewardManager) {
        try {
          await rewardManager.handleStoryCompletion(savedRewards);
        } catch (rewardError) {
          console.error('Error saving rewards despite API error:', rewardError);
        }
      }
      
              // Show error message but still allow user to continue
        console.log('=== ERROR CASE - CLOSING MODAL IMMEDIATELY ===');
        onStoryComplete?.({
          storyId: String(StoryID),
          finalRewards: [],
          skillsLearned: [],
        totalStatGains: totalStatGains
      });
      onClose();
      
      // Show a brief alert for user feedback
      setTimeout(() => {
        try {
          Alert.alert(
            "Story Completed",
            `You have reached the end of "${story?.title || 'this story'}".\n\nThere was an issue saving your progress, but your completion has been recorded.`,
            [{ text: "Continue" }]
          );
        } catch (alertError) {
          console.error('Alert.alert failed:', alertError);
        }
      }, 200);
    } finally {
      setIsLoadingPassage(false);
      setIsAutoAdvancing(false);
      setIsCompletingStory(false);
    }
  };

  // Function to auto-advance to the next passage in sequence
  const autoAdvanceToNext = async () => {
    if (isLoadingPassage) return;

    setIsLoadingPassage(true);
    try {
      console.log("=== AUTO-ADVANCE TO NEXT ===");
      console.log("Current passage ID:", currentId);
      console.log("Story ID:", StoryID);
      
      // Get the next passage using the getCurrentPassage endpoint
      console.log("Getting next passage via getCurrentPassage endpoint");
      const nextPassageData = await apiService.getCurrentPassage(StoryID);
      
      if (nextPassageData?.passage) {
        const nextPassage = {
          id: nextPassageData.passage.passage_id,
          passage_id: nextPassageData.passage.passage_id,
          content: nextPassageData.passage.content,
          passage_type: nextPassageData.passage.passage_type,
          speaker: nextPassageData.passage.speaker_name,
          required_conditions: nextPassageData.passage.required_conditions || {},
          story_effects: nextPassageData.passage.story_effects || {},
          mood: nextPassageData.passage.mood,
          background_music: nextPassageData.passage.background_music,
          background_image: nextPassageData.passage.background_image,
          choices: nextPassageData.passage.choices || []
        };
        
        console.log("Auto-advance: Setting next passage:", nextPassage.passage_id);
        console.log("Auto-advance: Next passage has choices:", nextPassage.choices?.length || 0);
        console.log("Auto-advance: Next passage type:", nextPassage.passage_type);
        
        // Update the current passage in the story engine
        // This will trigger the useStoryEngine hook to update currentPassage
        // and potentially trigger auto-advance logic again if the next passage has no choices.
        // We need to ensure the story engine's state is updated before setting currentId.
        // For now, we'll just set currentId directly.
        setCurrentId(nextPassage.passage_id);
        
        // Reset auto-advancing state to allow auto-advance to trigger for passages without choices
        setIsAutoAdvancing(false);
      } else {
        console.log("No next passage found - story may be complete");
        setIsAutoAdvancing(false);
      }
    } catch (error) {
      console.error("Error in auto-advance:", error);
      setIsAutoAdvancing(false);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  // Function to handle tap-to-continue for narration passages
  const handlePassageTap = async () => {
    if (isLoadingPassage) return;

    setIsLoadingPassage(true);
    try {
      console.log("=== TAP TO CONTINUE ===");
      console.log("Current passage ID:", currentId);
      console.log("Story ID:", StoryID);
      console.log("Chapter ID:", chapter?.id || (story as any)?.chapterId || 'none');
      console.log("Passage ID:", PassageID);
      
      // Get the next passage using the getCurrentPassage endpoint
      console.log("Getting next passage via getCurrentPassage endpoint");
      const nextPassageData = await apiService.getCurrentPassage(StoryID);
      
      if (nextPassageData?.passage) {
        const nextPassage = {
          id: nextPassageData.passage.passage_id,
          passage_id: nextPassageData.passage.passage_id,
          content: nextPassageData.passage.content,
          passage_type: nextPassageData.passage.passage_type,
          speaker: nextPassageData.passage.speaker_name,
          required_conditions: nextPassageData.passage.required_conditions || {},
          story_effects: nextPassageData.passage.story_effects || {},
          mood: nextPassageData.passage.mood,
          background_music: nextPassageData.passage.background_music,
          background_image: nextPassageData.passage.background_image,
          choices: nextPassageData.passage.choices || []
        };
        
        console.log("Auto-advance: Setting next passage:", nextPassage.passage_id);
        console.log("Auto-advance: Next passage has choices:", nextPassage.choices?.length || 0);
        console.log("Auto-advance: Next passage type:", nextPassage.passage_type);
        
        // Check if this is an ending passage
        if (nextPassage.passage_type === "ending") {
          console.log("=== ENDING PASSAGE DETECTED FROM TAP ===");
          console.log("Next passage is an ending, showing completion button");
          setCurrentId(nextPassage.passage_id);
          setIsAutoAdvancing(false);
          // Don't auto-trigger story completion - let user click the button
          return;
        }
        
        // Update the current passage in the story engine
        // This will trigger the useStoryEngine hook to update currentPassage
        // and potentially trigger auto-advance logic again if the next passage has no choices.
        // We need to ensure the story engine's state is updated before setting currentId.
        // For now, we'll just set currentId directly.
        setCurrentId(nextPassage.passage_id);
        
        // Reset auto-advancing state to allow auto-advance to trigger for passages without choices
        setIsAutoAdvancing(false);
        
        // Check if the next passage has no choices and should auto-advance
        const hasChoices = nextPassage.choices && nextPassage.choices.length > 0;
        const isNarration = nextPassage.passage_type === "narration" || 
                           nextPassage.passage_type === "dialogue";
        
        if (isNarration && !hasChoices) {
          console.log("=== MANUAL AUTO-ADVANCE TRIGGERED FROM TAP ===");
          console.log("Next passage has no choices, will auto-advance after delay");
          
          // Set a timeout to auto-advance
          setTimeout(() => {
            console.log("Manual auto-advance timeout triggered for passage:", nextPassage.passage_id);
            console.log("Current passage ID:", currentPassage?.passage_id);
            console.log("Expected passage ID:", nextPassage.passage_id);
            
            // Check if we're still on the same passage (or if currentPassage is null, proceed anyway)
            if (!currentPassage || currentPassage.passage_id === nextPassage.passage_id) {
              console.log("Executing manual auto-advance for passage:", nextPassage.passage_id);
              autoAdvanceToNext();
            } else {
              console.log("Passage changed, skipping manual auto-advance");
            }
          }, 2000);
        }
      } else {
        console.log("No next passage found - story may be complete");
        // Could show a completion message here
        
        // Check if this is the end of the story
        if (currentPassage && !currentPassage.choices) {
          console.log("Story appears to be complete - no more passages and no choices");
          // You could trigger story completion here if needed
        }
      }
    } catch (error) {
      console.error("Error handling passage tap:", error);
    } finally {
      setIsLoadingPassage(false);
      setIsAutoAdvancing(false);
    }
  };

  // Helper function to get the next passage ID in sequence
  const getNextPassageInSequence = async (): Promise<string | null> => {
    try {
      const chapterId = chapter?.id || (story as any)?.chapterId || undefined;
      
      if (!chapterId) {
        console.log("No chapter ID, trying to get next passage from story passages");
        // For non-chapter stories, try to get next passage from story passages
        if (story?.passages && Array.isArray(story.passages)) {
          const currentIndex = story.passages.findIndex((p: any) => p.passage_id === currentId);
          if (currentIndex !== -1 && currentIndex < story.passages.length - 1) {
            return story.passages[currentIndex + 1].passage_id;
          }
        }
        return null;
      }
      
      console.log("Getting next passage for chapter:", chapterId);
      
      // For chapter-based stories, use the new story engine
      // This function is no longer needed with the new backend structure
      return null;
    } catch (error) {
      console.error("Error getting next passage in sequence:", error);
      return null;
    }
  };

  const handleChoice = async (choice: any) => {
    if (isLoadingPassage) return;

    setIsLoadingPassage(true);
    try {
      console.log("=== MAKING CHOICE ===");
      console.log("Choice object:", choice);
      console.log("Choice ID:", choice.id);
      console.log("Choice text:", choice.text);
      console.log("Choice target_id:", choice.target_id);
      console.log("Choice target_passage_id:", choice.target_passage_id);
      console.log("Choice next_passage_info:", choice.next_passage_info);
      console.log("=== END CHOICE DEBUG ===");

      // Track choice rewards
      if (rewardManager && currentPassage) {
        console.log('=== CHOICE DATA FOR REWARD TRACKING ===');
        console.log('Choice data:', choice);
        console.log('Choice effects:', choice.effects);
        console.log('Choice effects type:', typeof choice.effects);
        console.log('Choice effects keys:', choice.effects ? Object.keys(choice.effects) : 'null');
        
        rewardManager.handleChoiceMade(choice, currentPassage.passage_id).catch(error => {
          console.error('Error handling choice rewards:', error);
        });
      }

      // Use the progressive loader's getPassageByChoice method which handles the new choice-making system
      const nextPassage = await makeChoice(choice);
      
      if (!nextPassage) {
        console.error("Could not load next passage after choice");
        throw new Error("Could not load next passage after choice");
      }
      
      console.log("Next passage data:", nextPassage);
      console.log("Next passage type:", nextPassage.passage_type);
      console.log("Next passage content preview:", nextPassage.content?.substring(0, 100) + "...");

      // Check if story is completed or if next passage is an ending
      if (nextPassage.passage_type === "ending") {
        console.log("=== ENDING PASSAGE DETECTED AFTER CHOICE ===");
        console.log("Ending passage ID:", nextPassage.passage_id);
        console.log("Ending passage content:", nextPassage.content);
        console.log("Updating UI to show ending passage with completion button...");
        
        // Update the current passage to show the ending passage
        setCurrentId(nextPassage.passage_id);
        
        console.log("UI updated - user should now see the completion button");
        
        // Don't auto-trigger story completion - let user click the button
        return;
      }

      // Update current passage with the next passage data
      console.log("Setting next passage:", nextPassage.passage_id);
      console.log("Next passage has choices:", nextPassage.choices?.length || 0);
      console.log("Next passage type:", nextPassage.passage_type);
      
      setCurrentId(nextPassage.passage_id);
      
      // Reset auto-advancing state to allow auto-advance to trigger for passages without choices
      setIsAutoAdvancing(false);
      
      // Check if the next passage has no choices and should auto-advance
      const hasChoices = nextPassage.choices && nextPassage.choices.length > 0;
      const isNarration = nextPassage.passage_type === "narration" || 
                         nextPassage.passage_type === "dialogue";
      
      console.log("=== CHOICE RESULT ANALYSIS ===");
      console.log("Next passage ID:", nextPassage.passage_id);
      console.log("Next passage type:", nextPassage.passage_type);
      console.log("Has choices:", hasChoices);
      console.log("Choices count:", nextPassage.choices?.length || 0);
      console.log("Is narration:", isNarration);
      console.log("Should auto-advance:", isNarration && !hasChoices);
      console.log("=== END CHOICE RESULT ANALYSIS ===");
      
      if (isNarration && !hasChoices) {
        console.log("=== MANUAL AUTO-ADVANCE TRIGGERED FROM CHOICE ===");
        console.log("Next passage has no choices, will auto-advance after delay");
        
        // Set a timeout to auto-advance to the next passage in sequence
        setTimeout(async () => {
          console.log("Manual auto-advance timeout triggered for passage:", nextPassage.passage_id);
          console.log("Current passage ID:", currentPassage?.passage_id);
          console.log("Expected passage ID:", nextPassage.passage_id);
          
          // Check if we're still on the same passage (or if currentPassage is null, proceed anyway)
          if (!currentPassage || currentPassage.passage_id === nextPassage.passage_id) {
            console.log("Executing manual auto-advance for passage:", nextPassage.passage_id);
            
            // Use the new autoAdvanceToNext function
            autoAdvanceToNext();
          } else {
            console.log("Passage changed, skipping manual auto-advance");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error handling choice:", error);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  // Add fallback for when no passages are available
  const hasValidPassages = currentPassage && currentPassage.passage_id;
  const hasValidStory = story && (story.title || story?.id);

  // Debug props to understand what data is being passed
  useEffect(() => {
    if (visible) {
      console.log("=== STORYSCREEN PROPS DEBUG ===");
      console.log("Story:", story);
      console.log("Chapter:", chapter);
      console.log("Passage:", passage);
      console.log("Choices:", choices);
      console.log("Story title:", story?.title);
      console.log("Chapter title:", chapter?.title);
      console.log("Passage content:", passage?.content);
      console.log("=== END STORYSCREEN PROPS DEBUG ===");
    }
  }, [visible, story, chapter, passage, choices]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Floating Reward Notification */}
      <FloatingRewardNotification
        visible={!!currentNotification}
        message={currentNotification?.message || ''}
        type={currentNotification?.type || 'stat'}
        onHide={hideCurrentNotification}
      />
      <>
        {!visible || !hasValidStory ? null : !hasValidPassages ? (
          // Error state - no passages available
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 18,
                margin: 20,
                textAlign: "center",
              }}
            >
              No passages available for: {story?.title || "Unknown Story"}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 20,
                backgroundColor: "#333",
                borderRadius: 8,
                marginTop: 20,
              }}
            >
              <Text style={{ color: "white" }}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : isLoadingPassage || isCompletingStory ? (
          // Loading state - current passage not found or story completing
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <Ionicons
              name="refresh-circle"
              size={40}
              color="#A855F7"
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                margin: 20,
                textAlign: "center",
              }}
            >
              {isCompletingStory ? "Completing story..." : "Loading passage..."}
            </Text>
          </View>
        ) : (
          // Main content
          <View style={globalStyles.StoryModalOverlay}>
            <View style={globalStyles.StoryModalpassages}>
              {/* Header */}
              <View style={globalStyles.StoryHeader}>
                <View style={globalStyles.StoryHeaderLeft}>
                  <Text style={globalStyles.StoryTitle}>
                    {story?.title || "Unknown Story"}
                  </Text>
                  <Text style={globalStyles.StorySubtitle}>
                    {chapter?.title && chapter.title !== story?.title 
                      ? chapter.title 
                      : `Chapter ${chapter?.chapter_number || 1}`
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  style={globalStyles.StoryCloseButton}
                  onPress={onClose}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    style={globalStyles.StoryCloseIcon}
                  />
                </TouchableOpacity>
              </View>
                {/* Main content */}
              <ScrollView 
                style={globalStyles.StoryMainpassages}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                  flexGrow: 1,
                  paddingBottom: 20 // Add bottom padding for better mobile experience
                }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Passage text */}
                <TouchableOpacity
                  style={globalStyles.StoryPassageContainer}
                  onPress={handlePassageTap}
                  activeOpacity={(() => {
                    const currentPassageData = currentPassage;
                    const hasChoices = currentPassageData?.choices && currentPassageData.choices.length > 0;
                    const isNarration = currentPassageData?.passageType === "narration" || 
                                       currentPassageData?.passage_type === "narration" ||
                                       currentPassageData?.passageType === "dialogue" || 
                                       currentPassageData?.passage_type === "dialogue";
                    
                    // Make tappable if it's narration/dialogue and has no choices, and not completing story
                    return (isNarration && !hasChoices && !isCompletingStory) ? 0.8 : 1;
                  })()}
                  disabled={isCompletingStory}
                >
                  <Text style={globalStyles.StoryPassageText}>
                    {(() => {
                      // Show loading state if currently fetching
                      if (storyLoading) {
                        return "Loading passage content...";
                      }
                      
                      // Show error if fetch failed
                      if (storyError) {
                        return `Error loading passage: ${storyError}`;
                      }
                      
                      // Prioritize fetched passage content from backend
                      if (currentPassage?.content) {
                        return currentPassage.content;
                      }
                      
                      // Fallback to the direct passage prop
                      if (passage?.content) {
                        return passage.content;
                      }
                      
                      return "No passage content available";
                    })()}
                  </Text>
                  
                  {/* Show tap-to-continue indicator or completion button */}
                  {(() => {
                    console.log('=== RENDER LOGIC EXECUTING ===');
                    const currentPassageData = currentPassage;
                    const hasChoices = currentPassageData?.choices && currentPassageData.choices.length > 0;
                    const isNarration = currentPassageData?.passageType === "narration" || 
                                       currentPassageData?.passage_type === "narration" ||
                                       currentPassageData?.passageType === "dialogue" || 
                                       currentPassageData?.passage_type === "dialogue";
                    const isEnding = currentPassageData?.passage_type === "ending";
                    
                    console.log('=== PASSAGE TYPE DEBUG ===');
                    console.log('currentPassageData:', currentPassageData);
                    console.log('passage_type:', currentPassageData?.passage_type);
                    console.log('isEnding:', isEnding);
                    console.log('isNarration:', isNarration);
                    console.log('hasChoices:', hasChoices);
                    
                    // Show completion button for ending passages
                    console.log('=== COMPLETION BUTTON LOGIC ===');
                    console.log('isEnding:', isEnding);
                    console.log('isCompletingStory:', isCompletingStory);
                    console.log('Should show button:', isEnding && !isCompletingStory);
                    console.log('lastAutoAdvancedPassageRef:', lastAutoAdvancedPassageRef.current);
                    console.log('currentPassage.passage_id:', currentPassageData?.passage_id);
                    console.log('currentPassage type:', currentPassageData?.passage_type);
                    console.log('currentPassage content preview:', currentPassageData?.content?.substring(0, 100));
                    
                    if (isEnding && !isCompletingStory) {
                      console.log('=== RENDERING COMPLETION BUTTON ===');
                      return (
                        <TouchableOpacity
                          style={{
                            backgroundColor: (isCompletingStory || isLoadingPassage) ? '#666' : '#A855F7',
                            paddingHorizontal: 20,
                            paddingVertical: 12,
                            borderRadius: 8,
                            marginTop: 20,
                            alignSelf: 'center',
                            minWidth: 150,
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: 'white',
                            opacity: (isCompletingStory || isLoadingPassage) ? 0.6 : 1
                          }}
                          onPress={() => {
                            console.log('=== COMPLETE STORY BUTTON CLICKED ===');
                            console.log('Current passage ID:', currentPassageData.passage_id);
                            console.log('Story ID:', StoryID);
                            console.log('Current passage type:', currentPassageData.passage_type);
                            console.log('isCompletingStory:', isCompletingStory);
                            console.log('isLoadingPassage:', isLoadingPassage);
                            console.log('Triggering story completion...');
                            
                            // Call handleStoryCompletion directly without delay
                            handleStoryCompletion(currentPassageData.passage_id);
                          }}
                          disabled={isCompletingStory || isLoadingPassage}
                          activeOpacity={0.8}
                        >
                          <Text style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold'
                          }}>
                            {isCompletingStory ? '🎉 Processing...' : '🏆 Complete Story'}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                    
                    // Show tap-to-continue for narration passages without choices
                    if (isNarration && !hasChoices && !storyLoading && !isEnding) {
                      return (
                        <Text style={{
                          color: '#A855F7',
                          fontSize: 14,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          marginTop: 10,
                          opacity: 0.7
                        }}>
                          {isAutoAdvancing ? "Continuing automatically..." : "Tap to continue..."}
                        </Text>
                      );
                    }
                    console.log('=== RENDER LOGIC COMPLETED - RETURNING NULL ===');
                    return null;
                  })()}
                  
                  {/* Debug info for choices */}
                  {__DEV__ && (
                    <Text style={{
                      color: '#666',
                      fontSize: 10,
                      textAlign: 'center',
                      marginTop: 5
                    }}>
                      Debug: Choices: {currentPassage?.choices?.length || 0} | Type: {currentPassage?.passage_type}
                    </Text>
                  )}
                  
                  {/* Show completion status */}
                  {isCompletingStory && (
                    <View style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      padding: 15,
                      borderRadius: 8,
                      marginTop: 15,
                      borderWidth: 1,
                      borderColor: '#A855F7',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        color: '#A855F7',
                        fontSize: 14,
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        🎉 Processing Story Completion...
                      </Text>
                      <Text style={{
                        color: '#A855F7',
                        fontSize: 12,
                        textAlign: 'center',
                        marginTop: 5,
                        opacity: 0.8
                      }}>
                        Calculating rewards and updating progress
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Choices */}
                <View style={globalStyles.StoryChoicesContainer}>
                  {(() => {
                    // Prioritize choices from fetched passage
                    const availableChoices = currentPassage?.choices || 
                                           passage?.choices || 
                                           choices || [];
                    
                    console.log("=== CHOICES RENDER DEBUG ===");
                    console.log("Available choices:", currentPassage?.choices);
                    console.log("Choices length:", currentPassage?.choices?.length);
                    console.log("Available choices:", currentPassage?.choices);
                    currentPassage?.choices?.forEach((choice: { target_id: any; target_passage_id: any; next_passage_info: any; }, index: any) => {
                      console.log(`Choice ${index}:`, choice);
                      console.log(`Target ID:`, choice.target_id);
                      console.log(`Target Passage ID:`, choice.target_passage_id);
                      console.log(`Next Passage Info:`, choice.next_passage_info);
                    });
                    console.log("Choices length:", availableChoices.length);
                    console.log("=== END CHOICES RENDER DEBUG ===");
                    
                    if (!availableChoices || availableChoices.length === 0) {
                      return null; // No choices to display
                    }
                    
                    return availableChoices.map((choice: any, idx: number) => {
                      console.log(`Choice ${idx}:`, choice);
                      
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            globalStyles.StoryChoiceButton,
                            (isLoadingPassage || isCompletingStory) && { opacity: 0.5 }
                          ]}
                          onPress={() => handleChoice(choice)}
                          activeOpacity={0.8}
                          disabled={isLoadingPassage || isCompletingStory}
                        >
                          <Text style={globalStyles.StoryChoiceText}>
                            {choice.text || choice.choice_text || `Choice ${idx + 1}`}
                          </Text>
                          
                          {/* Show choice effects preview if available */}
                          {(choice.stat_effects || choice.effects) && (
                            <Text style={{
                              fontSize: 12,
                              color: '#888',
                              marginTop: 5,
                              fontStyle: 'italic'
                            }}>
                              {Object.entries(choice.stat_effects || choice.effects || {})
                                .map(([stat, value]) => `${stat}: +${value}`)
                                .join(', ')}
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    });
                  })()}
                  
                  {/* Debug info for development */}
                  {__DEV__ && (
                    <Text style={{
                      color: '#666',
                      fontSize: 10,
                      textAlign: 'center',
                      marginTop: 10
                    }}>
                      Debug: Passage ID {currentId} | Loading: {storyLoading ? 'Yes' : 'No'}
                    </Text>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </>
    </Modal>
  );
};

export default StoryScreen;
