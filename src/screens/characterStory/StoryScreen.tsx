import {
  Alert,
  Animated,
  createGlobalStyles,
  Dimensions,
  Icon,
  LinearGradient,
  Modal,
  React,
  Text,
  TouchableOpacity,
  useCallback,
  useEffect,
  useState,
  View,
  useContext,
} from "../../imports";
import {
  useCurrentPassage,
  extractTemplateChoices,
} from "../../utils/storyUtils";
import { applyTemplateReward } from "../../utils/rewardsUtils";
import { AuthContext } from "../../context/AuthContext";
import { AuthContextType } from "../../types/user";
import { useTheme } from "../../context/ThemeContext";
import { GameData, Character } from "../../types/user";

import { archiveService } from "../../services/archiveService";
import {
  getCopingToolMapping,
  testCopingToolsSetup,
} from "../../services/testBackendIntegration";
import {
  Story,
  Chapter,
  Passage,
  Choice,
  StoryScreenProps,
  SavedRewards,
} from "../../types/story";

const { width, height } = Dimensions.get("window");
const { characterId } = useContext(AuthContext) as AuthContextType;

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
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);

  // Use passages from the story prop - chapter too
  const passages = story?.chapters?.flatMap((ch) => ch.passages || []) || [];
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterRewards, setChapterRewards] = useState<Chapter[]>([]);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const [currentStory, setCurrentStory] = useState<Story>(story);

  // State declarations
  const [currentId, setCurrentId] = useState<string>(
    String(story.starting_passage_id || (passages[0]?.id ?? "start"))
  ); //not sure if I need this
  const [totalStatGains, setTotalStatGains] = useState<Record<string, number>>(
    {}
  );

  //skill and level ups as shown in UserProfile and GameData
  const [recentGains, setRecentGains] = useState<GameData[]>([]);
  const [showStatGain, setShowStatGain] = useState(false);
  const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]); //no need this is unlocked story
  const [learnedSkills, setLearnedSkills] = useState<GameData[]>([]);
  const [showArtifactUnlock, setShowArtifactUnlock] = useState(false);
  const [newArtifact, setNewArtifact] = useState<any>(null);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  //rewards will need to be moved

  //This will need to be updated to use the new coping tool mapping
  const [copingToolMapping, setCopingToolMapping] = useState<
    Record<string, number>
  >({});
  const [savedRewards, setSavedRewards] = useState<SavedRewards>({});

  // Animations
  const fadeAnim = new Animated.Value(0);
  const statGainAnim = new Animated.Value(0);
  const passageAnim = new Animated.Value(0);
  const artifactUnlockAnim = new Animated.Value(0);

  // Story meta
  const StoryID = story.id;
  const StoryTitle = story.title || "Unknown Story";
  const StorySubtitle = story.description || "";
  const StoryAtmosphere = ""; // Add if you have this field
  const StoryDifficulty = ""; // Add if you have this field
  const StoryRarity = "Common"; // Add if you have this field
  const StoryImage = story.image || null;
  const StoryMinLevel = story.min_level || 1; // Default to 1 if not provided

  // Chapter meta
  const ChapterID = chapter.id;
  const ChapterTitle = chapter?.title || "Unknown Chapter";
  const ChapterDescription = chapter?.content || "";
  const ChapterImage = chapter?.image || null;
  const ChapterRequirements = chapter?.requirements || 1; // Default to 1 if not provided
  const ChapterPassages = chapter?.passages || passages; // Use chapter passages if available

  //Passages meta
  const PassageID = passage?.id || currentId; //this needs to change to fit id
  const PassageContent = passage?.content || "";
  const PassageType = passage.passage_type;
  const PassageMood = passage?.mood || "neutral"; // Default to neutral if not provided
  const PassageChoices = passage?.choices || choices || [];
  const PassageImage = passage?.background_image || null; // Add if you have this field
  const PassageOrder = passage.order;

  // fetch and store the coping tool mapping and saved rewards in your component’s state
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

  // Effect to ensure current passage is found when currentId changes
  useEffect(() => {
    if (currentId && passages && passages.length > 0) {
      const foundPassage = passages.find(
        (p: any) => String(p.id) === String(currentId)
      );
      if (!foundPassage && passages[0]) {
        setCurrentId(String(passages[0].id));
      }
    } else if (passages && passages.length > 0 && !currentId) {
      setCurrentId(String(passages[0].id));
    } else if (!passages || passages.length === 0) {
      console.error("No passages available for story:", story?.id);
    }
  }, [currentId, passages, story?.id]);

  // Effect for modal visibility and initialization
  useEffect(() => {
    if (visible) {
      // Reset state when opening
      setCurrentId(
        String(story.starting_passage_id || (passages[0]?.id ?? "start"))
      );
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
  }, [visible, story]);

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

  // Rewards mapping for p4_action choices
  const choiceRewards = {
    confront: {
      add_item: "binders_quill_of_mastery",
      experience: 50,
      item_name: "Binder's Quill of Mastery",
      item_description:
        "A quill that writes with the ink of determination, granting clarity in moments of challenge.",
      gear_type_id: null, // Will be set dynamically when gear types are available
      stat_bonuses: {
        focus_bonus: 5,
        confidence_bonus: 3,
      },
    },
    avoid: {
      add_item: "ear_rune_of_will",
      experience: 30,
      item_name: "Ear Rune of Will",
      item_description:
        "A protective rune that shields the mind from overwhelming noise and distractions.",
      gear_type_id: null, // Will be set dynamically when gear types are available
      stat_bonuses: {
        resilience_bonus: 5,
        mindfulness_bonus: 3,
      },
    },
    assist: {
      add_item: "guides_bookmark_of_kinship",
      experience: 40,
      item_name: "Guide's Bookmark of Kinship",
      item_description:
        "A bookmark that opens doors to hidden knowledge and connections with others.",
      gear_type_id: null, // Will be set dynamically when gear types are available
      stat_bonuses: {
        empathy_bonus: 5,
        organization_bonus: 3,
      },
    },
  };

  // Debug: Force process if we have template syntax but no choices
  const [debugProcessedCurrent, setDebugProcessedCurrent] = useState<any>(null);

  // Add more debug logging
  useEffect(() => {
    console.log("Passages array:", passages);
    console.log("Current ID:", currentId);
    console.log("Current passage found:", debugProcessedCurrent);
    console.log("Story data structure:", {
      title: story?.title,
      passagesCount: passages?.length,
      firstPassage: passages?.[0],
      isChapterBased: chapter.chapter_number > 0,
    });

    // Log all passage IDs for debugging
    if (passages && passages.length > 0) {
      console.log(
        "Available passage IDs:",
        passages.map((p: any) => p.id)
      );
    }

    // Choices debug logging
    if (debugProcessedCurrent) {
      console.log("=== CHOICES RENDERING DEBUG ===");
      console.log("debugProcessedCurrent ID:", debugProcessedCurrent?.id);
      console.log("debugProcessedCurrent text:", debugProcessedCurrent?.text);
      console.log(
        "debugProcessedCurrent choices:",
        debugProcessedCurrent?.choices
      );
      console.log(
        "debugProcessedCurrent choices length:",
        debugProcessedCurrent?.choices?.length
      );
      console.log(
        "debugProcessedCurrent choices type:",
        typeof debugProcessedCurrent?.choices
      );
      console.log(
        "debugProcessedCurrent choices is array:",
        Array.isArray(debugProcessedCurrent?.choices)
      );

      if (!debugProcessedCurrent?.choices) {
        console.log("No choices found - returning null");
      } else if (debugProcessedCurrent.choices.length === 0) {
        console.log("Choices array is empty - returning null");
      } else {
        console.log(
          "About to map choices, count:",
          debugProcessedCurrent.choices.length
        );
        debugProcessedCurrent.choices.forEach((choice: any, idx: number) => {
          console.log("Rendering choice:", idx, choice);
          console.log("Choice text:", choice.text);
          console.log("Choice type:", typeof choice);
        });
        console.log("=== END CHOICES RENDERING DEBUG ===");
      }
    }
  }, [passages, currentId, debugProcessedCurrent, story, story]);

  // Function to handle tap-to-continue for narration passages
  const handlePassageTap = async () => {
    if (!debugProcessedCurrent || isLoadingPassage) return;
    if (
      (debugProcessedCurrent.passageType === "narration" ||
        debugProcessedCurrent.passageType === "dialogue") &&
      (!debugProcessedCurrent.choices ||
        debugProcessedCurrent.choices.length === 0)
    ) {
      // Use ChapterPassages to find the next passage by order
      const currentPassages = ChapterPassages || passages;
      const currentIdx = currentPassages.findIndex(
        (p: any) => p.passage_id === currentId
      );
      if (currentIdx !== -1 && currentIdx + 1 < currentPassages.length) {
        const nextPassage = currentPassages[currentIdx + 1];
        if (nextPassage && nextPassage.passage_id) {
          setCurrentId(nextPassage.passage_id);
        }
      }
    }
  };

  const handleChoice = async (choice: any) => {
    const {
      next,
      statEffects,
      skillsLearned,
      artifactUnlock,
      isEnding,
      finalRewards,
      wisdomGained,
      choiceId,
      isTemplateChoice,
    } = choice;

    // Handle template choices (from backend template syntax)
    if (isTemplateChoice && choiceId) {
      const reward = choiceRewards[choiceId as keyof typeof choiceRewards];
      if (reward) {
        await applyTemplateReward(choiceId, reward, {
          setChapterRewards,
          setTotalStatGains,
          setRecentGains,
          setShowStatGain,
          archiveService,
          storyId: StoryID,
          chapterId: chapter.id || 1,
          copingToolMapping,
          Alert,
          setUnlockedArtifacts,
          setNewArtifact,
          setShowArtifactUnlock,
          onArtifactUnlock,
        });
      }
      // For template choices, we don't send to backend - just show the result directly
      if (choice.choicepassages) {
        const fallbackPassage = {
          id: `choice_fallback_${choiceId}`,
          text: choice.choicepassages,
          atmosphere: "mysterious",
          passageType: "result",
          choices: [
            {
              text: "Continue to Chapter Summary",
              next: "chapter_complete",
              statEffects: {},
              description: "View your chapter rewards and progress",
              skillsLearned: [],
              isChapterEnd: true,
            },
          ],
        };

        setCurrentId(fallbackPassage.id);

        setTimeout(() => setCurrentId(fallbackPassage.id), 500);
        return;
      }
    }

    // Handle chapter completion
    if (next === "chapter_complete" || choice.isChapterEnd) {
      console.log("Chapter complete, showing summary");

      // Save final chapter rewards to backend
      if (Object.keys(chapterRewards).length > 0) {
        try {
          // Calculate total experience from stat gains
          const totalExperience = Object.values(totalStatGains).reduce(
            (sum: number, amount: number) => sum + amount,
            0
          );

          // Map frontend stat names to backend wellness stats
          const wellnessGains: any = {};
          Object.entries(totalStatGains).forEach(([stat, amount]) => {
            if (stat !== "Experience") {
              let backendStat = stat;
              switch (stat) {
                case "Sight Beyond Sight":
                  backendStat = "awareness";
                  break;
                case "Unbreakable Will":
                  backendStat = "resilience";
                  break;
                case "Heart's Compass":
                  backendStat = "connection";
                  break;
                case "Elemental Harmony":
                  backendStat = "balance";
                  break;
                default:
                  backendStat = stat.toLowerCase();
              }
              wellnessGains[backendStat] = amount;
            }
          });

          await archiveService.saveStoryCompletion(
            String(story?.id || ""),
            totalExperience,
            wellnessGains
          );
          console.log("Successfully saved chapter completion to backend");
        } catch (error) {
          console.error("Failed to save chapter completion to backend:", error);
          // Continue even if backend save fails
        }
      }

      setShowChapterComplete(true);
      return;
    }

    // Handle stat effects
    if (statEffects) {
      const newRecentGains: { [key: string]: number } = {};

      Object.entries(statEffects).forEach(([statName, amount]) => {
        newRecentGains[statName] = amount as number;
        setTotalStatGains((prev) => ({
          ...prev,
          [statName]: (prev[statName] || 0) + (amount as number),
        }));

        // Call parent callback for stat gain
        if (onStatGain) {
          onStatGain({ [statName]: amount as number });
        }
      });

      setRecentGains(newRecentGains);
      setShowStatGain(true);
    }

    // Handle skills learned
    if (skillsLearned && skillsLearned.length > 0) {
      setLearnedSkills((prev) => [...prev, ...skillsLearned]);
      if (onSkillLearned) {
        onSkillLearned(skillsLearned);
      }
    }

    // Handle artifact unlock
    if (
      artifactUnlock &&
      artifactDatabase[artifactUnlock as keyof typeof artifactDatabase]
    ) {
      const artifact =
        artifactDatabase[artifactUnlock as keyof typeof artifactDatabase];
      setNewArtifact(artifact);
      setUnlockedArtifacts((prev) => [...prev, artifactUnlock]);
      setShowArtifactUnlock(true);

      if (onArtifactUnlock) {
        onArtifactUnlock(artifact);
      }
    }

    // Check if this is an ending choice
    if (isEnding || (!next && (finalRewards || wisdomGained))) {
      // End of Story - show completion summary
      const totalGainsText = Object.entries(totalStatGains)
        .map(([stat, amount]) => `${stat}: +${amount}`)
        .join("\n");

      const artifactsText =
        unlockedArtifacts.length > 0
          ? `\n\n🎭 Artifacts Unlocked:\n${unlockedArtifacts.join("\n")}`
          : "";

      const skillsText =
        learnedSkills.length > 0
          ? `\n\n🎯 Coping Skills Learned:\n${learnedSkills.join(", ")}`
          : "";

      const finalRewardsText =
        finalRewards && finalRewards.length > 0
          ? `\n\n🏆 Final Rewards:\n${finalRewards.join("\n")}`
          : "";

      const wisdomText = wisdomGained
        ? `\n\n📜 Wisdom Gained:\n"${wisdomGained}"`
        : "";

      Alert.alert(
        "📚 Story Mastered! ✨",
        `Your journey through the ${StoryTitle} has transformed your understanding:\n\n⚡ Archive Foundations Strengthened:\n${totalGainsText}${artifactsText}${skillsText}${finalRewardsText}${wisdomText}\n\nYour character has grown significantly through these choices. The wisdom you've gained will serve you well in future challenges.`,
        [{ text: "Return to Archive", onPress: onClose }]
      );

      if (onStoryComplete) {
        onStoryComplete({
          storyId: story?.id || "",
          finalRewards: finalRewards || [],
          skillsLearned: learnedSkills,
          totalStatGains: totalStatGains,
        });
      }
    } else if (next) {
      // Handle chapter-based story flow
      if (story?.isChapterBased && story?.passages?.chapterId) {
        try {
          console.log("Chapter-based story: fetching next passage:", next);
          // For chapter-based stories, we need to fetch the actual passage passages
          const nextPassage = await archiveService.getPassage(story.id, next);
          if (nextPassage?.passage?.passages) {
            // Update the current passage with the fetched passages
            const updatedPassages = story.passages.map((p: any) =>
              p.id === next ? { ...p, text: nextPassage.passage.passages } : p
            );

            // Update the story data with the new passage passages
            const updatedstory = {
              ...story,
              passages: updatedPassages,
            };

            // Update the state instead of directly modifying Story.passages
            setCurrentstory(updatedstory);

            console.log(
              "Updated passage passages:",
              nextPassage.passage.passages
            );
          }
        } catch (error) {
          console.error("Failed to fetch passage passages:", error);
        }
      }

      // Update current passage ID
      setTimeout(() => setCurrentId(next), 500);
    }
  };

  // Safety check: ensure current passage is found - moved after all hooks
  const isLoading = !debugProcessedCurrent;

  if (isLoading) {
    console.warn("Current passage not found for ID:", currentId);
    console.log("Available passages:", passages);
    console.log("Story data:", story);
    console.log("Story:", story);
  }

  // Add fallback for when no passages are available
  const hasValidPassages = passages && passages.length > 0;
  const hasValidstory = story || story;
  const hasValidStory = story && (story.title || story.id);

  const StatGainNotification = () => {
    if (!showStatGain) return null;

    return (
      <Animated.View
        style={[
          globalStyles.StoryStatGainNotification,
          {
            opacity: statGainAnim,
            transform: [
              {
                translateY: statGainAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(16, 185, 129, 0.95)", "rgba(34, 197, 94, 0.95)"]}
          style={globalStyles.StoryStatGainGradient}
        >
          <Icon name="trending-up" size={20} color="#065F46" />
          <View style={globalStyles.StoryStatGainpassages}>
            <Text style={globalStyles.StoryStatGainTitle}>
              Archive Foundations Strengthened!
            </Text>
            {Object.entries(recentGains).map(([stat, amount]) => (
              <Text key={stat} style={globalStyles.StoryStatGainText}>
                {stat} +{amount}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ArtifactUnlockNotification = () => {
    if (!showArtifactUnlock || !newArtifact) return null;

    return (
      <Animated.View
        style={[
          globalStyles.StoryArtifactUnlockNotification,
          {
            opacity: artifactUnlockAnim,
            transform: [
              {
                scale: artifactUnlockAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.8, 1.1, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(168, 85, 247, 0.95)", "rgba(139, 92, 246, 0.95)"]}
          style={globalStyles.StoryArtifactUnlockGradient}
        >
          <Icon name="gift" size={24} color="#FCD34D" />
          <View style={globalStyles.StoryArtifactUnlockpassages}>
            <Text style={globalStyles.StoryArtifactUnlockTitle}>
              🎭 New Artifact Unlocked! ✨
            </Text>
            <Text style={globalStyles.StoryArtifactUnlockName}>
              {newArtifact.name}
            </Text>
            <Text style={globalStyles.StoryArtifactUnlockDescription}>
              {newArtifact.description}
            </Text>
            <View style={globalStyles.StoryArtifactPowers}>
              {newArtifact.powers
                .slice(0, 2)
                .map((power: string, index: number) => (
                  <Text key={index} style={globalStyles.StoryArtifactPowerText}>
                    • {power}
                  </Text>
                ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const ChapterCompletionModal = () => {
    if (!showChapterComplete) return null;

    const totalExperience = Object.values(chapterRewards).reduce(
      (sum: number, reward: any) => sum + (reward.experience || 0),
      0
    );
    const earnedItems = Object.values(chapterRewards)
      .map((reward: any) => reward.item_name)
      .filter(Boolean);

    return (
      <Modal
        visible={showChapterComplete}
        transparent
        onRequestClose={() => setShowChapterComplete(false)}
      >
        <>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(30, 41, 59, 0.95)",
                "rgba(51, 65, 85, 0.8)",
                "rgba(30, 41, 59, 0.95)",
              ]}
              style={{
                padding: 24,
                borderRadius: 16,
                width: "90%",
                maxWidth: 400,
              }}
            >
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <Icon name="award" size={40} color="#FCD34D" />
                <Text
                  style={{
                    color: "#FCD34D",
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 8,
                  }}
                >
                  Chapter Complete!
                </Text>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontSize: 16,
                    textAlign: "center",
                    marginBottom: 16,
                  }}
                >
                  You have completed Chapter {story?.passages?.chapterId || 1}{" "}
                  of {StoryTitle}
                </Text>

                {totalExperience > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Icon name="trending-up" size={20} color="#10B981" />
                    <Text
                      style={{ color: "#10B981", fontSize: 18, marginLeft: 8 }}
                    >
                      +{totalExperience} Experience
                    </Text>
                  </View>
                )}

                {earnedItems.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: "#A855F7",
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                        marginBottom: 8,
                      }}
                    >
                      Items Earned:
                    </Text>
                    {earnedItems.map((itemName: string, index: number) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Icon name="gift" size={16} color="#FCD34D" />
                        <Text
                          style={{
                            color: "#E0E7FF",
                            fontSize: 14,
                            marginLeft: 8,
                          }}
                        >
                          {itemName}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#7C3AED",
                  padding: 16,
                  borderRadius: 8,
                  alignItems: "center",
                }}
                onPress={() => {
                  setShowChapterComplete(false);
                  onClose();
                }}
              >
                <Text
                  style={{ color: "#E0E7FF", fontSize: 16, fontWeight: "bold" }}
                >
                  Return to Archive
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      </Modal>
    );
  };

  const getRarityColors = (rarity: string): readonly [string, string] => {
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

  const getChoiceIcon = (choice: any) => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes("Sight Beyond Sight")) return "👁️";
      if (stats.includes("Unbreakable Will")) return "⚓";
      if (stats.includes("Heart's Compass")) return "🔗";
      if (stats.includes("Elemental Harmony")) return "⚖️";
    }
    return "📜";
  };

  const getChoiceColor = (choice: any): readonly [string, string] => {
    if (choice.statEffects) {
      const stats = Object.keys(choice.statEffects);
      if (stats.includes("Sight Beyond Sight")) return ["#3B82F6", "#06B6D4"];
      if (stats.includes("Unbreakable Will")) return ["#059669", "#10B981"];
      if (stats.includes("Heart's Compass")) return ["#DC2626", "#F472B6"];
      if (stats.includes("Elemental Harmony")) return ["#D97706", "#FCD34D"];
    }
    return ["#6B7280", "#9CA3AF"];
  };

  // Effect to handle template processing state updates
  useEffect(() => {
    if (debugProcessedCurrent && debugProcessedCurrent !== current) {
      // If the processed current passage is different from the original current passage,
      // it means we have template processing that needs to be applied to the story data
      const updatedPassages = story.passages.map((p: any) =>
        p.id === currentId ? debugProcessedCurrent : p
      );

      const updatedstory = { ...story, passages: updatedPassages };
      setCurrentstory(updatedstory);
    }
  }, [debugProcessedCurrent, current, currentId, story]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <>
        {!visible || !hasValidStory ? null : !hasValidstory ? (
          // Error state - no story data at all
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
              Story data not found for ID: {story?.id || "Unknown"}
            </Text>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                margin: 20,
                textAlign: "center",
              }}
            >
              This story may not be available in the current Archive.
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
        ) : !hasValidPassages ? (
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
              No passages available for: {StoryTitle}
            </Text>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                margin: 20,
                textAlign: "center",
              }}
            >
              This story may not have any passages yet.
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
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                margin: 20,
                textAlign: "center",
              }}
            >
              Preparing your journey through the Archive.
            </Text>
          </View>
        ) : !debugProcessedCurrent ? (
          // Fallback state - current passage still not found after fallbacks
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.8)",
            }}
          >
            <Icon
              name="alert-circle"
              size={40}
              color="#EF4444"
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
              Unable to load story passages
            </Text>
            <Text
              style={{
                color: "#9CA3AF",
                fontSize: 14,
                margin: 20,
                textAlign: "center",
              }}
            >
              Please try again or contact support.
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
        ) : (
          // Main passages
          <View style={globalStyles.StoryModalOverlay}>
            <View style={globalStyles.StoryModalpassages}>
              {/* Header */}
              <View style={globalStyles.StoryHeader}>
                <View style={globalStyles.StoryHeaderLeft}>
                  <View style={globalStyles.StoryTitleRow}>
                    <Text style={globalStyles.StoryTitle}>
                      {StoryTitle}
                      {ChapterTitle && (
                        <Text style={{ color: "#FCD34D", fontSize: 14 }}>
                          {" "}
                          (Chapter {ChapterID})
                        </Text>
                      )}
                    </Text>
                    <View style={globalStyles.StoryRarityBadge}>
                      <Text style={globalStyles.StoryRarityText}>
                        {StoryRarity}
                      </Text>
                    </View>
                  </View>
                  <Text style={globalStyles.StorySubtitle}>
                    {StorySubtitle}
                  </Text>
                  <View style={globalStyles.StoryDifficultyRow}>
                    <Icon name="target" size={10} color={theme.rarityEpic} />
                    <Text style={globalStyles.StoryDifficultyText}>
                      {StoryDifficulty}
                    </Text>
                  </View>
                  <View style={globalStyles.StoryAtmosphereRow}>
                    <Icon name="wind" size={10} color={theme.statusInfo} />
                    <Text style={globalStyles.StoryAtmosphereText}>
                      {StoryAtmosphere}
                    </Text>
                  </View>
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
                {/* Temporary test button for gear types */}
                <TouchableOpacity
                  style={[globalStyles.StoryCloseButton, { marginRight: 40 }]}
                  onPress={async () => {
                    console.log("Testing coping tools setup...");
                    await testCopingToolsSetup();
                    // Reload coping tool mapping after setup
                    const mapping = await getCopingToolMapping();
                    setCopingToolMapping(mapping);
                  }}
                >
                  <Icon
                    name="settings"
                    size={16}
                    style={globalStyles.StoryCloseIcon}
                  />
                </TouchableOpacity>
                {/* Rewards viewer button */}
                <TouchableOpacity
                  style={[globalStyles.StoryCloseButton, { marginRight: 80 }]}
                  onPress={() => {
                    console.log("Current saved rewards:", savedRewards);
                    console.log("Current chapter rewards:", chapterRewards);
                    console.log("Current total stat gains:", totalStatGains);

                    const totalExperience = Object.values(
                      chapterRewards
                    ).reduce(
                      (sum: number, reward: any) =>
                        sum + (reward.experience || 0),
                      0
                    );
                    const earnedItems = Object.values(chapterRewards)
                      .map((reward: any) => reward.item_name)
                      .filter(Boolean);

                    // Build comprehensive rewards display
                    let rewardsText: string = "📊 Current Rewards Status\n\n";

                    // Chapter rewards (current session)
                    if (Object.keys(chapterRewards).length > 0) {
                      rewardsText += "🎯 Chapter Rewards (This Session):\n";
                      Object.entries(chapterRewards).forEach(
                        ([choice, reward]: [string, any]) => {
                          rewardsText += `• ${choice}: ${reward.experience} XP + ${reward.item_name}\n`;
                        }
                      );
                      rewardsText += "\n";
                    }

                    // Backend saved data
                    if (savedRewards) {
                      rewardsText += "💾 Backend Saved Data:\n";
                      if (savedRewards.characterStats) {
                        rewardsText += `• Level: ${savedRewards.level}\n`;
                        rewardsText += `• Total Experience: ${
                          savedRewards.totalExperience
                        }/${savedRewards.experienceNeeded} (${Math.round(
                          savedRewards.experienceProgress * 100
                        )}%)\n`;
                        rewardsText += `• Wellness Average: ${savedRewards.wellnessAverage}/20\n`;
                        rewardsText += `• Equipped Tools: ${savedRewards.equippedToolsCount}\n`;

                        if (
                          savedRewards.wellnessStats &&
                          Object.keys(savedRewards.wellnessStats).length > 0
                        ) {
                          rewardsText += `• Wellness Stats:\n`;
                          Object.entries(savedRewards.wellnessStats).forEach(
                            ([stat, value]) => {
                              rewardsText += `  - ${stat}: ${value}/20\n`;
                            }
                          );
                        }
                      }
                      if (
                        savedRewards.characterGear &&
                        savedRewards.characterGear.length > 0
                      ) {
                        rewardsText += `• Gear Owned: ${savedRewards.characterGear.length} items\n`;
                      }
                      if (
                        savedRewards.storyProgress &&
                        savedRewards.storyProgress.length > 0
                      ) {
                        rewardsText += `• Stories Started: ${savedRewards.totalStoriesStarted}\n`;
                        rewardsText += `• Stories Completed: ${savedRewards.storiesCompleted}\n`;

                        // Show current story progress if available
                        const currentStory = savedRewards.storyProgress.find(
                          (progress: any) =>
                            progress.story_title === StoryTitle ||
                            progress.story === story?.id
                        );
                        if (currentStory) {
                          rewardsText += `• Current Story Progress: ${currentStory.progress_percentage}%\n`;
                          rewardsText += `• Passages Visited: ${currentStory.passages_visited_count}\n`;
                          rewardsText += `• Choices Made: ${currentStory.choices_made_count}\n`;
                        }
                      }
                      if (
                        savedRewards.characterCopingTools &&
                        savedRewards.characterCopingTools.length > 0
                      ) {
                        rewardsText += `• Coping Tools Owned: ${savedRewards.characterCopingTools.length} tools\n`;
                      }
                      rewardsText += "\n";
                    }

                    // Current session totals
                    rewardsText += `📈 This Session:\n`;
                    rewardsText += `• Experience Gained: ${totalExperience}\n`;
                    rewardsText += `• Coping Tools Earned: ${
                      earnedItems.join(", ") || "None yet"
                    }\n`;
                    rewardsText += `• Skills Learned: ${
                      learnedSkills.join(", ") || "None yet"
                    }\n`;

                    Alert.alert("📊 Rewards Status", rewardsText, [
                      { text: "OK", style: "default" },
                    ]);
                  }}
                >
                  <Icon
                    name="award"
                    size={16}
                    style={globalStyles.StoryCloseIcon}
                  />
                </TouchableOpacity>
                {/* Test button to check rewards */}
                <TouchableOpacity
                  style={[globalStyles.StoryCloseButton, { marginRight: 120 }]}
                  onPress={async () => {
                    try {
                      console.log("Testing reward system...");

                      // Fetch latest character data
                      const latestRewards =
                        await archiveService.getCharacterRewards("test");
                      console.log("Latest character rewards:", latestRewards);

                      // Show current status
                      Alert.alert(
                        "🧪 Reward System Test",
                        `Character Level: ${latestRewards.level}\n` +
                          `Total Experience: ${latestRewards.totalExperience}\n` +
                          `Coping Tools Owned: ${
                            latestRewards.characterCopingTools?.length || 0
                          }\n` +
                          `Stories Completed: ${latestRewards.storiesCompleted}\n\n` +
                          `Current Session:\n` +
                          `• Experience Gained: ${Object.values(
                            chapterRewards
                          ).reduce(
                            (sum: number, reward: any) =>
                              sum + (reward.experience || 0),
                            0
                          )}\n` +
                          `• Items Earned: ${
                            Object.values(chapterRewards)
                              .map((reward: any) => reward.item_name)
                              .filter(Boolean)
                              .join(", ") || "None"
                          }`,
                        [{ text: "OK", style: "default" }]
                      );
                    } catch (error) {
                      console.error("Test failed:", error);
                      Alert.alert(
                        "Test Failed",
                        "Could not fetch latest rewards data"
                      );
                    }
                  }}
                >
                  <Icon
                    name="test-tube"
                    size={16}
                    style={globalStyles.StoryCloseIcon}
                  />
                </TouchableOpacity>
              </View>
              {/* Main passages */}
              <View style={globalStyles.StoryMainpassages}>
                {/* Current atmosphere */}
                {debugProcessedCurrent?.atmosphere && (
                  <View style={globalStyles.StoryCurrentAtmosphere}>
                    <Icon name="eye" size={12} color={theme.statusInfo} />
                    <Text style={globalStyles.StoryAtmosphereText}>
                      ✦ {debugProcessedCurrent.atmosphere} ✦
                    </Text>
                  </View>
                )}
                {/* Passage text */}
                <TouchableOpacity
                  style={globalStyles.StoryPassageContainer}
                  onPress={handlePassageTap}
                  activeOpacity={
                    debugProcessedCurrent?.passageType === "narration" &&
                    (!debugProcessedCurrent?.choices ||
                      debugProcessedCurrent?.choices.length === 0)
                      ? 0.8
                      : 1
                  }
                  disabled={
                    debugProcessedCurrent?.passageType !== "narration" &&
                    debugProcessedCurrent?.passageType !== "dialogue"
                  }
                >
                  <Text style={globalStyles.StoryPassageText}>
                    {debugProcessedCurrent?.text || "NO TEXT FOUND"}
                  </Text>

                  {/* Show tap-to-continue indicator for narration passages */}
                  {(debugProcessedCurrent?.passageType === "narration" ||
                    debugProcessedCurrent?.passageType === "dialogue") &&
                    (!debugProcessedCurrent?.choices ||
                      debugProcessedCurrent?.choices.length === 0) && (
                      <View style={{ marginTop: 16, alignItems: "center" }}>
                        <LinearGradient
                          colors={[
                            "rgba(168, 85, 247, 0.8)",
                            "rgba(139, 92, 246, 0.8)",
                          ]}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                            flexDirection: "row",
                            alignItems: "center",
                          }}
                        >
                          <Icon name="chevron-down" size={16} color="#FCD34D" />
                          <Text
                            style={{
                              color: "#FCD34D",
                              marginLeft: 8,
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            Tap to continue
                          </Text>
                        </LinearGradient>
                      </View>
                    )}

                  {/* Show loading indicator */}
                  {isLoadingPassage && (
                    <View
                      style={{
                        marginTop: 16,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="loader" size={20} color="#A855F7" />
                      <Text
                        style={{
                          color: "#A855F7",
                          marginLeft: 8,
                          fontSize: 14,
                        }}
                      >
                        Loading passage...
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {/* Choices */}
                <View style={globalStyles.StoryChoicesContainer}>
                  {(() => {
                    if (!debugProcessedCurrent?.choices) {
                      return null;
                    }

                    if (debugProcessedCurrent.choices.length === 0) {
                      return null;
                    }

                    const choiceElements = debugProcessedCurrent.choices.map(
                      (choice: any, idx: number) => {
                        return (
                          <TouchableOpacity
                            key={idx}
                            style={globalStyles.StoryChoiceButton}
                            onPress={() => handleChoice(choice)}
                            activeOpacity={0.8}
                          >
                            <View style={globalStyles.StoryChoiceRow}>
                              <Text style={globalStyles.StoryChoiceIcon}>
                                {getChoiceIcon(choice)}
                              </Text>
                              <Text style={globalStyles.StoryChoiceText}>
                                {choice.text}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }
                    );

                    return choiceElements;
                  })()}
                </View>
              </View>
            </View>
          </View>
        )}
        <StatGainNotification />
        <ArtifactUnlockNotification />
        <ChapterCompletionModal />
      </>
    </Modal>
  );
};

export default StoryScreen;
