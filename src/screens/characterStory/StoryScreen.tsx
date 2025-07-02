
import { useMasterState } from "../../context/MasterStateContext";
import { usePassageFetcher } from "../../hooks/useCurrentPassage";
import {
  Animated,
  Dimensions,
  Icon,
  Modal,
  React,
  Text,
  TouchableOpacity,
  useEffect, useState,
  View
} from "../../imports";
import { archiveService } from "../../services/archiveService";
import {
  getCopingToolMapping
} from "../../services/testBackendIntegration";
import { createGlobalStyles } from "../../styles/globalStyles";
import {
  Chapter,
  SavedRewards,
  Story,
  StoryScreenProps
} from "../../types/story";
import {
  useCurrentPassage
} from "../../utils/storyUtils";

const { width, height } = Dimensions.get("window");

const artifactDatabase = {
  "Clarity Lens of Mindful Sight": {
    name: "Clarity Lens of Mindful Sight",
    type: "Focus Relic",
    rarity: "Legendary",
    description:
      "A crystalline lens revealing the true shape of anxious thoughts.",
    powers: [
      "Enhanced focus",
      "Anxiety pattern recognition",
      "Present-moment anchoring",
    ],
    statBoosts: { "Sight Beyond Sight": 2 },
  },
  "Guardian Ward of Boundaries": {
    name: "Guardian Ward of Boundaries",
    type: "Protective Seal",
    rarity: "Epic",
    description: "An ethereal barrier against overwhelming expectations.",
    powers: [
      "Pressure resistance",
      "Boundary setting",
      "Perfectionism protection",
    ],
    statBoosts: { "Unbreakable Will": 2 },
  },
  "Foundation Stone of Grounding": {
    name: "Foundation Stone of Grounding",
    type: "Stability Anchor",
    rarity: "Rare",
    description: "A rustic stone that roots you in reality when stress looms.",
    powers: ["Stress grounding", "Reality anchoring", "Panic prevention"],
    statBoosts: { "Elemental Harmony": 2 },
  },
  "Sanctuary Shroud of Comfort": {
    name: "Sanctuary Shroud of Comfort",
    type: "Comfort Codex",
    rarity: "Epic",
    description: "A worn Story that wraps the mind in collective solace.",
    powers: ["Social comfort", "Belonging enhancement", "Isolation protection"],
    statBoosts: { "Heart's Compass": 2 },
  },
  "Empathy Conduit Artifact": {
    name: "Empathy Conduit Artifact",
    type: "Connection Keystone",
    rarity: "Epic",
    description:
      "A heart-shaped gem that amplifies compassion when guiding others.",
    powers: [
      "Emotional resonance",
      "Listener's clarity",
      "Support amplification",
    ],
    statBoosts: { "Heart's Compass": 3 },
  },
  "Toolkit Story Artifact": {
    name: "Toolkit Story Artifact",
    type: "Strategy Story",
    rarity: "Rare",
    description: "A pocket Story filled with diverse coping methods.",
    powers: [
      "Adaptive strategy recall",
      "Creative problem-solving",
      "Perspective shift",
    ],
    statBoosts: { "Sight Beyond Sight": 2, "Heart's Compass": 1 },
  },
};

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
  const globalStyles = createGlobalStyles(theme.theme);  // Use passages from the story prop - handle both chapter-based and direct passage structures
  const passages = story?.chapters?.flatMap((ch) => ch.passages || []) || 
                   (story as any)?.passages?.passages || 
                   (story as any)?.passages || 
                   [];
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterRewards, setChapterRewards] = useState<Chapter[]>([]);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story>(story);
  // State declarations
  const [currentId, setCurrentId] = useState<string>(() => {
    console.log("=== INITIAL PASSAGE SELECTION ===");
    console.log("Available passages:", passages);
    
    if (passages && passages.length > 0) {
      // Try to find starting passage by is_starting_chapter or order
      let startingPassage = passages.find((p: any) => 
        p.is_starting_chapter || (p.order !== undefined && p.order === 0)
      );
      
      // If no specific starting passage, use the one with lowest order
      if (!startingPassage) {
        const sortedPassages = [...passages].sort((a, b) => (a.order || 0) - (b.order || 0));
        startingPassage = sortedPassages[0];
      }
      
      console.log("Selected starting passage:", startingPassage);
      // Use numeric ID format (1, 2, 3, etc.) instead of string IDs
      const passageId = String(startingPassage?.passage_id || startingPassage?.id || "1");
      console.log("Initial currentId set to:", passageId);
      return passageId;
    }
    
    console.log("No passages available, defaulting to '1'");
    return "1"; // Start with numeric ID 1 instead of "start"
  });
  const [totalStatGains, setTotalStatGains] = useState<Record<string, number>>(
    {}
  );

  //skill and level ups as shown in UserProfile and GameData
  const [recentGains, setRecentGains] = useState<Record<string, number>>({});
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]); //no need this is unlocked story
  const [learnedSkills, setLearnedSkills] = useState<string[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<any>(null);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  //rewards will need to be moved

  //This will need to be updated to use the new coping tool mapping
  const [copingToolMapping, setCopingToolMapping] = useState<
    Record<string, number>
  >({});
  const [savedRewards, setSavedRewards] = useState<SavedRewards>({});

  // Debug: Force process if we have template syntax but no choices
  const [debugProcessedCurrent, setDebugProcessedCurrent] = useState<any>(null);

  // Animations
  const fadeAnim = new Animated.Value(0);
  const statGainAnim = new Animated.Value(0);
  const passageAnim = new Animated.Value(0);
  const artifactUnlockAnim = new Animated.Value(0);

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
  const ChapterPassages = chapter?.passages || passages; // Use chapter passages if available

  //Passages meta
  const PassageID = passage?.passage_id || passage?.id || currentId;
  const PassageContent = passage?.content || "";
  const PassageType = passage?.passage_type || "narration";
  const PassageMood = passage?.mood || "neutral"; // Default to neutral if not provided
  const PassageChoices = passage?.choices || choices || [];
  const PassageImage = passage?.background_image || null; // Add if you have this field
  const PassageOrder = passage?.order || 0;

  // fetch and store the coping tool mapping and saved rewards in your component's state
  useEffect(() => {
    const loadData = async () => {
      try {
        const mapping = await getCopingToolMapping();
        setCopingToolMapping(mapping);
        console.log("Loaded coping tool mapping:", mapping);

        if (characterId) {
          const rewards = await archiveService.getCharacterRewards(characterId);
          setSavedRewards(rewards);
          console.log("Loaded saved rewards:", rewards);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
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

  const current = useCurrentPassage(passages, currentId);
    // Update debugProcessedCurrent when current changes or when passages change
  useEffect(() => {
    console.log("=== DEBUG PROCESSED CURRENT UPDATE ===");
    console.log("current:", current);
    console.log("passages:", passages);
    console.log("currentId:", currentId);
    
    if (current) {
      console.log("Setting debugProcessedCurrent from current:", current);
      console.log("Current passage content:", current.content);
      setDebugProcessedCurrent(current);
    } else if (passages && passages.length > 0) {
      console.log("No current found, searching passages array...");
      // If we have passages but no current, try to find the right one
      if (currentId) {
        const foundPassage = passages.find((p: any) => 
          String(p.passage_id) === String(currentId) || 
          String(p.id) === String(currentId)
        );
        console.log("Found passage by ID:", foundPassage);
        if (foundPassage) {
          console.log("Found passage content:", foundPassage.content);
          setDebugProcessedCurrent(foundPassage);
        } else {          // If not found by ID, use the first passage
          console.log("Passage not found by ID, using first passage:", passages[0]);
          console.log("First passage content:", passages[0]?.content);
          setDebugProcessedCurrent(passages[0]);
          setCurrentId(String(passages[0]?.passage_id || passages[0]?.id || "1"));
        }
      } else {
        // No currentId, use the first passage
        console.log("No currentId, using first passage:", passages[0]);
        console.log("First passage content:", passages[0]?.content);
        setDebugProcessedCurrent(passages[0]);
        setCurrentId(String(passages[0]?.passage_id || passages[0]?.id || "1"));
      }
    } else {
      console.log("No passages available");
      setDebugProcessedCurrent(null);
    }
    console.log("=== END DEBUG PROCESSED CURRENT UPDATE ===");
  }, [current, passages, currentId]);
    // Debug logging for current passage
  useEffect(() => {
    console.log("=== CURRENT PASSAGE DEBUG ===");
    console.log("currentId:", currentId);
    console.log("passages array length:", passages?.length);
    console.log("current passage result:", current);
    console.log("current passage content:", current?.content);
    console.log("debugProcessedCurrent:", debugProcessedCurrent);
    console.log("debugProcessedCurrent content:", debugProcessedCurrent?.content);
    
    // Additional debugging for passage finding
    if (passages && passages.length > 0 && currentId) {
      const foundPassage = passages.find((p: any) => 
        String(p.passage_id) === String(currentId) || 
        String(p.id) === String(currentId)
      );
      console.log("Direct passage search result:", foundPassage);
      console.log("Direct passage content:", foundPassage?.content);
      console.log("First passage in array:", passages[0]);
      console.log("First passage content:", passages[0]?.content);
      
      // Log all passage IDs for debugging
      console.log("All passage IDs:", passages.map((p: any) => ({
        id: p.id,
        passage_id: p.passage_id,
        content_preview: p.content?.substring(0, 50) + "..."
      })));
    }
    
    console.log("=== END CURRENT PASSAGE DEBUG ===");
  }, [currentId, passages, current, debugProcessedCurrent]);
  // Effect to ensure current passage is found when currentId changes
  useEffect(() => {
    if (currentId && passages && passages.length > 0) {
      const foundPassage = passages.find(
        (p: any) => String(p.id) === String(currentId)
      );
      if (!foundPassage && passages[0]) {
        setCurrentId(String(passages[0]?.id || "1"));
      }
    } else if (passages && passages.length > 0 && !currentId) {
      setCurrentId(String(passages[0]?.id || "1"));
    } else if (!passages || passages.length === 0) {
      console.error("No passages available for story:", story?.id);
    }
  }, [currentId, passages, story?.id]);
  // Effect for modal visibility and initialization
  useEffect(() => {
    if (visible) {
      // Reset state when opening
      const startingPassageId = (() => {
        if (passages && passages.length > 0) {
          const sortedPassages = [...passages].sort((a, b) => (a.order || 0) - (b.order || 0));
          return String(sortedPassages[0]?.passage_id || sortedPassages[0]?.id || "1");
        }
        return "1"; // Use numeric ID 1 instead of "start"
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
  }, [visible, story, passages]);

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
  // Function to handle tap-to-continue for narration passages
  const handlePassageTap = async () => {
    if (!debugProcessedCurrent || isLoadingPassage || passageLoading) return;
    
    const currentPassageData = fetchedPassage || debugProcessedCurrent;
    
    // Only allow tap-to-continue for narration/dialogue passages without choices
    if (
      (currentPassageData.passageType === "narration" ||
        currentPassageData.passageType === "dialogue" ||
        currentPassageData.passage_type === "narration" ||
        currentPassageData.passage_type === "dialogue") &&
      (!currentPassageData.choices || currentPassageData.choices.length === 0)
    ) {
      console.log("=== TAP-TO-CONTINUE ===");
      console.log("Current passage ID:", currentId);
      
      // Track progress for the current passage
      if (story?.id && currentId) {
        await archiveService.saveProgress(
          String(story.id),
          currentId,
          undefined, // no choice for tap-to-continue
          {}, // story_variables
          {} // player_state
        );
      }
      
      // Find next passage by order in the passages array
      const currentPassages = ChapterPassages || passages;
      const currentIdx = currentPassages.findIndex(
        (p: any) => String(p.passage_id) === String(currentId) || String(p.id) === String(currentId)
      );
      
      if (currentIdx !== -1 && currentIdx + 1 < currentPassages.length) {
        const nextPassage = currentPassages[currentIdx + 1];
        if (nextPassage) {
          // Use the passage_id from the next passage (could be "p2_shelves", "p3_decision", etc.)
          const nextId = String(nextPassage.passage_id || nextPassage.id);
          console.log("Advancing to next passage from array:", nextId);
          setCurrentId(nextId);
        }
      } else {
        console.log("No next passage found in array, story may be complete");
      }
    }
  };

  const handleChoice = async (choice: any) => {
    console.log("=== CHOICE SELECTED ===");
    console.log("Choice data:", choice);
    
    setIsLoadingPassage(true);
    
    try {
      // Track progress for the current passage and choice
      if (story?.id && currentId) {
        await archiveService.saveProgress(
          String(story.id),
          currentId,
          String(choice.id),
          {}, // story_variables
          {} // player_state
        );
      }
      
      // Look for the next passage ID in various possible properties
      const nextPassageId = choice.next_passage_id || 
                           choice.next || 
                           choice.nextPassageId || 
                           choice.target || 
                           choice.passage_id ||
                           choice.id;
      
      if (nextPassageId) {
        console.log("Found next passage ID:", nextPassageId);
        
        // Apply any stat effects from the choice
        if (choice.stat_effects || choice.effects || choice.statEffects) {
          const effects = choice.stat_effects || choice.effects || choice.statEffects;
          console.log("Applying stat effects:", effects);
          
          // Update total stat gains
          const newStatGains = { ...totalStatGains };
          Object.entries(effects).forEach(([stat, value]) => {
            newStatGains[stat] = (newStatGains[stat] || 0) + (value as number);
          });
          setTotalStatGains(newStatGains);
          
          // Show stat gain animation
          setRecentGains(effects);
          setShowStatGain(true);
          
          // Call the callback if provided
          if (onStatGain) {
            onStatGain(effects);
          }
        }
        
        // Handle artifact unlocks
        if (choice.artifact_unlock || choice.artifactUnlock) {
          const artifactName = choice.artifact_unlock || choice.artifactUnlock;
          console.log("Unlocking artifact:", artifactName);
          const artifact = (artifactDatabase as any)[artifactName] || { name: artifactName };
          setNewArtifact(artifact);
          setShowArtifactUnlock(true);
          
          if (onArtifactUnlock) {
            onArtifactUnlock(artifactName);
          }
        }
        
        // Handle skills learned
        if (choice.skills_learned || choice.skills || choice.skillsLearned) {
          const skills = choice.skills_learned || choice.skills || choice.skillsLearned;
          console.log("Learning skills:", skills);
          setLearnedSkills(prev => [...prev, ...skills]);
          
          if (onSkillLearned) {
            skills.forEach((skill: string) => onSkillLearned([skill]));
          }
        }
        
        // Check if this is an ending
        if (choice.is_ending || choice.is_end || choice.isEnding) {
          console.log("Story ending reached");
          
          // Save game data for story completion
          if (story?.id) {
            const finalRewards = choice.final_rewards || choice.finalRewards || [];
            const score = Object.values(totalStatGains).reduce((sum: number, value: any) => sum + value, 0);
            
            await archiveService.saveGameData(
              String(story.id),
              currentId,
              score,
              finalRewards, // unlocked_areas
              learnedSkills // completed_prompts
            );
          }
          
          if (onStoryComplete) {
            onStoryComplete({
              storyId: String(story?.id || ""),
              finalRewards: choice.final_rewards || choice.finalRewards || [],
              skillsLearned: learnedSkills,
              totalStatGains
            });
          }
          return;
        }
        
        // Navigate to next passage with a small delay for smooth transition
        setTimeout(() => {
          console.log("Navigating to passage:", nextPassageId);
          setCurrentId(String(nextPassageId));
        }, 300);
        
      } else {
        // No next passage specified, try to advance by order in passages array
        console.log("No next passage ID specified, trying array advancement");
        const currentPassages = ChapterPassages || passages;
        const currentIdx = currentPassages.findIndex(
          (p: any) => String(p.passage_id) === String(currentId) || String(p.id) === String(currentId)
        );
        
        if (currentIdx !== -1 && currentIdx + 1 < currentPassages.length) {
          const nextPassage = currentPassages[currentIdx + 1];
          if (nextPassage) {
            const nextId = String(nextPassage.passage_id || nextPassage.id);
            console.log("Advancing to next passage from array:", nextId);
            setTimeout(() => setCurrentId(nextId), 300);
          }
        } else {
          console.warn("Could not determine next passage");
        }
      }
    } catch (error) {
      console.error("Error handling choice:", error);
    } finally {
      setIsLoadingPassage(false);
    }
  };

  // Add fallback for when no passages are available
  const hasValidPassages = passages && passages.length > 0;
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
  // Fetch current passage content from backend
  const {
    passage: fetchedPassage,
    story: fetchedStory,
    progress: fetchedProgress,
    loading: passageLoading,
    error: passageError  } = usePassageFetcher(
    String(story?.id || ""),
    currentId || "1" // Use numeric ID 1 as fallback instead of starting_passage_id
  );

  // Safety check: ensure current passage is found or being loaded
  const isLoading = !debugProcessedCurrent || passageLoading;

  // Debug logging for fetched passage
  useEffect(() => {
    if (fetchedPassage) {
      console.log("=== FETCHED PASSAGE DEBUG ===");
      console.log("Fetched passage:", fetchedPassage);
      console.log("Fetched passage content:", fetchedPassage.content);
      console.log("Fetched choices:", fetchedPassage.choices);
      console.log("Passage loading:", passageLoading);
      console.log("Passage error:", passageError);
      console.log("=== END FETCHED PASSAGE DEBUG ===");
    }
  }, [fetchedPassage, passageLoading, passageError]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
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
        ) : isLoading ? (
          // Loading state - current passage not found
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <Icon
              name="loader"
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
              Loading passage...
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
                  <Icon
                    name="x"
                    size={16}
                    style={globalStyles.StoryCloseIcon}
                  />
                </TouchableOpacity>
              </View>
                {/* Main content */}
              <View style={globalStyles.StoryMainpassages}>
                {/* Passage text */}
                <TouchableOpacity
                  style={globalStyles.StoryPassageContainer}
                  onPress={handlePassageTap}
                  activeOpacity={(() => {
                    const currentPassageData = fetchedPassage || debugProcessedCurrent;
                    const hasChoices = currentPassageData?.choices && currentPassageData.choices.length > 0;
                    const isNarration = currentPassageData?.passageType === "narration" || 
                                       currentPassageData?.passage_type === "narration" ||
                                       currentPassageData?.passageType === "dialogue" || 
                                       currentPassageData?.passage_type === "dialogue";
                    
                    // Make tappable if it's narration/dialogue and has no choices
                    return (isNarration && !hasChoices) ? 0.8 : 1;
                  })()}
                >
                  <Text style={globalStyles.StoryPassageText}>
                    {(() => {
                      // Show loading state if currently fetching
                      if (passageLoading) {
                        return "Loading passage content...";
                      }
                      
                      // Show error if fetch failed
                      if (passageError) {
                        return `Error loading passage: ${passageError}`;
                      }
                      
                      // Prioritize fetched passage content from backend
                      if (fetchedPassage?.content) {
                        return fetchedPassage.content;
                      }
                      
                      // Fallback to the current processed passage content
                      if (debugProcessedCurrent?.content) {
                        return debugProcessedCurrent.content;
                      }
                      
                      // Fallback to the direct passage prop
                      if (passage?.content) {
                        return passage.content;
                      }
                      
                      // Final fallback to first available passage
                      if (passages && passages.length > 0 && passages[0]?.content) {
                        return passages[0].content;
                      }
                      
                      return "No passage content available";
                    })()}
                  </Text>
                  
                  {/* Show tap-to-continue indicator */}
                  {(() => {
                    const currentPassageData = fetchedPassage || debugProcessedCurrent;
                    const hasChoices = currentPassageData?.choices && currentPassageData.choices.length > 0;
                    const isNarration = currentPassageData?.passageType === "narration" || 
                                       currentPassageData?.passage_type === "narration" ||
                                       currentPassageData?.passageType === "dialogue" || 
                                       currentPassageData?.passage_type === "dialogue";
                    
                    if (isNarration && !hasChoices && !passageLoading) {
                      return (
                        <Text style={{
                          color: '#A855F7',
                          fontSize: 14,
                          fontStyle: 'italic',
                          textAlign: 'center',
                          marginTop: 10,
                          opacity: 0.7
                        }}>
                          Tap to continue...
                        </Text>
                      );
                    }
                    return null;
                  })()}
                </TouchableOpacity>
                {/* Choices */}
                <View style={globalStyles.StoryChoicesContainer}>
                  {(() => {
                    // Prioritize choices from fetched passage
                    const availableChoices = fetchedPassage?.choices || 
                                           debugProcessedCurrent?.choices || 
                                           passage?.choices || 
                                           choices || [];
                    
                    console.log("=== CHOICES RENDER DEBUG ===");
                    console.log("Available choices:", availableChoices);
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
                            isLoadingPassage && { opacity: 0.5 }
                          ]}
                          onPress={() => handleChoice(choice)}
                          activeOpacity={0.8}
                          disabled={isLoadingPassage}
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
                      Debug: Passage ID {currentId} | Loading: {passageLoading ? 'Yes' : 'No'}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </>
    </Modal>
  );
};

export default StoryScreen;
