import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
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
      const manager = new StoryRewardManager(
        story.id.toString(),
        (message: string, type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact') => {
          showFloatingNotification(message, type);
        },
        (completionData: any) => {
          onStoryComplete?.(completionData);
        },
        apiService,
        parseInt(characterId, 10)
      );
      
      setRewardManager(manager);
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
    try {
      // Mark story as completed in backend
      if (story?.id) {
        await apiService.completeStoryProgress(story.id, 'story_completion');
      }

      // Calculate final rewards and stats
      const finalRewards = ['Experience Points', 'Memory Fragments', 'Insight Tokens'];
      const skillsLearned = ['Resilience', 'Self-Awareness', 'Emotional Intelligence'];
      const totalStatGains = {
        awareness: 5,
        resilience: 3,
        connection: 2,
        balance: 4
      };

      // Call the completion handler
      if (onStoryComplete) {
        onStoryComplete({
          storyId: story?.id || '',
          finalRewards,
          skillsLearned,
          totalStatGains
        });
      }

      // Show completion notification
      showFloatingNotification('Story Completed!', 'experience');
      
      // Close the story after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      // Handle completion error
    }
  };

  const autoAdvanceToNext = async () => {
    try {
      const nextPassageId = await getNextPassageInSequence();
      
      if (nextPassageId) {
        // Load the next passage using the story engine
        const nextPassage = await getCurrentPassage();
        
        if (nextPassage) {
          // The story engine will handle updating the current passage
          // Just update the current ID to trigger the engine
          setCurrentId(nextPassageId);
          
          // Update progress
          if (story?.id) {
            const progress = await apiService.getOrCreateStoryProgress(story.id);
            if (progress) {
              await apiService.updateStoryProgress(progress.id, {
                current_passage_id: nextPassageId,
                passages_visited: [...(progress.passages_visited || []), nextPassageId]
              });
            }
          }
        }
      } else {
        // No more passages - story is complete
        await handleStoryCompletion();
      }
    } catch (error) {
      // Handle auto-advance error
    }
  };

  const handlePassageTap = async () => {
    if (storyLoading) return;

    if (currentPassage?.passage_type === 'ending') {
      // This is an ending passage
      await handleStoryCompletion(currentPassage.passage_id);
    } else if (hasChoices) {
      // Show choices - the story engine handles this
      // The choices should already be available in availableChoices
    } else {
      // Auto-advance to next passage
      await autoAdvanceToNext();
    }
  };

  const getNextPassageInSequence = async (): Promise<string | null> => {
    try {
      // For now, use a simple sequential approach
      // In a real implementation, you'd use the story's passage graph
      const allPassages = (story?.passages as any)?.passages || [];
      const currentIndex = allPassages.findIndex((p: any) => p.passage_id === currentPassage?.passage_id);
      
      if (currentIndex >= 0 && currentIndex < allPassages.length - 1) {
        return allPassages[currentIndex + 1].passage_id;
      }
      
      return null; // No more passages
    } catch (error) {
      return null;
    }
  };

  const handleChoice = async (choice: any) => {
    try {
      // Record the choice in progress
      if (story?.id) {
        const progress = await apiService.getOrCreateStoryProgress(story.id);
        if (progress) {
          const choiceRecord = {
            choice_id: choice.id || Date.now(),
            choice_text: choice.text,
            timestamp: new Date().toISOString()
          };
          
          await apiService.updateStoryProgress(progress.id, {
            choices_made: [...(progress.choices_made || []), choiceRecord]
          });
        }
      }

      // Use the story engine's makeChoice function
      await makeChoice(choice);
    } catch (error) {
      // Handle choice error
    }
  };

  // Add fallback for when no passages are available
  const hasValidPassages = currentPassage && currentPassage.passage_id;
  const hasValidStory = story && (story.title || story?.id);



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
                    const currentPassageData = currentPassage;
                    const hasChoices = currentPassageData?.choices && currentPassageData.choices.length > 0;
                    const isNarration = currentPassageData?.passageType === "narration" || 
                                       currentPassageData?.passage_type === "narration" ||
                                       currentPassageData?.passageType === "dialogue" || 
                                       currentPassageData?.passage_type === "dialogue";
                    const isEnding = currentPassageData?.passage_type === "ending";
                    
                    // Show completion button for ending passages
                    if (isEnding && !isCompletingStory) {
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
                    
                    if (!availableChoices || availableChoices.length === 0) {
                      return null; // No choices to display
                    }
                    
                    return availableChoices.map((choice: any, idx: number) => {
                      
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
