import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import InlineRewardDisplay from "../../components/rewards/InlineRewardDisplay";
import { useMasterState } from "../../context/MasterStateContext";
import { usePersonality } from "../../context/PersonalityContext";
import { useStoryEngine } from "../../hooks/useStoryEngine"; // Make sure this path is correct
import { apiService } from "../../services/apiService";
import { createGlobalStyles } from "../../styles/globalStyles";
import { Chapter, Choice, Passage, Story } from "../../types/story";
import { getQuestInfo } from "../../utils/rewardsUtils";
import { StoryRewardManager } from "../../utils/storyRewardIntegration";
import { getStoryBackground } from "./utils/storyBackgrounds";
interface StoryScreenProps {
  visible: boolean;
  onClose: () => void;
  story: Story; // We need the story object for its ID, title, and attached chapterId
  chapter: Chapter;
  passage: Passage;
  choices: Choice[];
  onStatGain: (stat: string, amount: number) => void;
  onArtifactUnlock: (artifact: string) => void;
  onSkillLearned: (skill: string) => void;
  onStoryComplete?: (completionData: any) => void;
}

/**
 * StoryScreen - Interactive story display with persistent reward tracking system
 *
 * This screen displays interactive stories and includes an inline reward system
 * that shows rewards directly within the story content and keeps them visible
 * throughout the story session for easy progress tracking.
 *
 * Key features:
 * - Persistent inline reward display integrated with story content
 * - Accumulated reward tracking - rewards stay visible throughout the story
 * - Reward queue system for smooth sequential animations
 * - Personality-specific reward styling and images
 * - Character user attribute images for visual appeal
 * - Non-intrusive reward presentation that enhances the story experience
 * - Rewards reset automatically when starting a new story
 */

const StoryScreen: React.FC<StoryScreenProps> = ({
  visible,
  onClose,
  story,
  chapter,
  onStoryComplete,
}) => {
  const {
    theme,
    auth,
    onboarding,
    character,
    equipment,
    archive,
    ui,
    wellness,
  } = useMasterState();
  const {
    primaryTrait,
    isPersonalityUser,
    isLoading: personalityLoading,
  } = usePersonality();
  const globalStyles = createGlobalStyles(theme.theme);

  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(
    null
  );

  // Accumulated rewards display state
  const [accumulatedRewards, setAccumulatedRewards] = useState<
    Array<{
      id: string;
      message: string;
      type:
        | "experience"
        | "lumens"
        | "item"
        | "skill"
        | "stat"
        | "artifact"
        | "upgrade"
        | "strengthen"
        | "new"
        | "quest";
      icon?: string;
      iconImage?: any;
      statName?: string;
      visible: boolean;
    }>
  >([]);

  const [rewardQueue, setRewardQueue] = useState<
    Array<{
      message: string;
      type:
        | "experience"
        | "lumens"
        | "item"
        | "skill"
        | "stat"
        | "artifact"
        | "upgrade"
        | "strengthen"
        | "new"
        | "quest";
      icon?: string;
      iconImage?: any;
      statName?: string;
    }>
  >([]);

  const [isProcessingRewards, setIsProcessingRewards] = useState(false);

  const rewardQueueRef = useRef<
    Array<{
      message: string;
      type:
        | "experience"
        | "lumens"
        | "item"
        | "skill"
        | "stat"
        | "artifact"
        | "upgrade"
        | "strengthen"
        | "new"
        | "quest";
      icon?: string;
      iconImage?: any;
      statName?: string;
    }>
  >([]);
  const isProcessingRewardsRef = useRef(false);

  useEffect(() => {
    rewardQueueRef.current = rewardQueue;
  }, [rewardQueue]);

  useEffect(() => {
    isProcessingRewardsRef.current = isProcessingRewards;
  }, [isProcessingRewards]);

  const {
    loading,
    error,
    currentPassage,
    availableChoices,
    makeChoice,
    isInitialized,
    isEnding,
    hasMultipleChoices,
    hasChoices,
    isDecision,
    chapterTitle,
    chapterNumber,
  } = useStoryEngine({
    storyId: story?.id,
    chapterId: chapter?.id,
  });

  const resolveMediaSource = React.useCallback((image?: string | ImageSourcePropType | null) => {
    if (!image) {
      return undefined;
    }

    if (typeof image === 'number') {
      return image;
    }

    if (typeof image === 'object' && 'uri' in image) {
      return image as ImageSourcePropType;
    }

    const stringValue = image as string;
    if (/^https?:\/\//i.test(stringValue) || stringValue.startsWith('data:')) {
      return { uri: stringValue };
    }

    const sanitizedBase = apiBaseUrl.replace(/\/api\/?$/, '/');
    const normalizedPath = stringValue.startsWith('/') ? stringValue.slice(1) : stringValue;
    return { uri: `${sanitizedBase}${normalizedPath}` };
  }, []);

  const storyImageSource: ImageSourcePropType | undefined = React.useMemo(() => {
    return resolveMediaSource(story?.image || undefined);
  }, [resolveMediaSource, story?.image]);

  const passageImageSource: ImageSourcePropType | undefined = React.useMemo(() => {
    const passageMedia = currentPassage
      ? (currentPassage as any).background_image || (currentPassage as any).speaker_image
      : undefined;
    return resolveMediaSource(passageMedia || undefined);
  }, [resolveMediaSource, currentPassage]);

  const renderImage = (
    source: ImageSourcePropType | undefined,
    options: { height?: number; marginBottom?: number; label?: string } = {}
  ) => {
    if (!source) {
      return null;
    }

    const { height = 220, marginBottom = 18, label = `${story?.title || 'Story'} artwork` } = options;

    return (
      <Image
        source={source}
        style={{
          width: '100%',
          height,
          borderRadius: 18,
          marginBottom,
          borderWidth: 1,
          borderColor: 'rgba(212, 175, 55, 0.35)',
          alignSelf: 'center'
        }}
        resizeMode="cover"
        accessibilityLabel={label}
      />
    );
  };

  useEffect(() => {
    if (visible && story?.id && isInitialized) {
      // Clear accumulated rewards when starting a new story
      setAccumulatedRewards([]);
      setRewardQueue([]);
      rewardQueueRef.current = [];

      const initializeRewardManager = async () => {
        const homeData = wellness.homeData as any; // Type assertion for flexible backend structure

        // Wait for homeData to load before initializing
        if (!homeData) {
          return;
        }

        // Skip if RewardManager already exists (prevents duplicate initialization)
        if (rewardManager) {
          return;
        }

        let researchCondition: "character" | "personality" = "personality";

        // Determine research condition: Group A = Character, Group B = Personality
        // homeData structure: wellness.homeData.userProfile.profile.research_group.condition

        if (homeData?.userProfile?.profile?.research_group?.condition) {
          researchCondition =
            homeData.userProfile.profile.research_group.condition === "A"
              ? "character"
              : "personality";
        } else {
          // Fallback: check completion_type
          const completionType = homeData?.userProfile?.completion_type;
          if (completionType) {
            researchCondition =
              completionType === "character" ? "character" : "personality";
          } else {
          }
        }

        // For personality users, wait until personality data is loaded
        if (researchCondition === "personality" && personalityLoading) {
          return;
        }

        // Get userId for personality users (needed for coping tool acquisition)
        let userId = undefined;
        if (researchCondition === "personality") {
          userId = homeData?.userProfile?.id;
        }

        // Character ID: for character users (Group A)
        const characterId =
          researchCondition === "character"
            ? homeData?.userProfile?.character?.id ||
              homeData?.character?.id ||
              0
            : 0;

        // Equipment array: only for character users
        const equippedGear =
          researchCondition === "character"
            ? homeData?.userProfile?.character?.equipped_gear ||
              homeData?.character?.equipped_gear ||
              []
            : [];

        const manager = new StoryRewardManager(
          story.id.toString(),
          addRewardToDisplay,
          handleStoryCompletionWithRewards,
          apiService,
          characterId, // Character users get their character ID, personality users get 0
          equippedGear, // Character users get their equipment array, personality users get []
          0, // storyReplayCount
          researchCondition, // "character" | "personality" - NOW in correct position
          userId, // Personality users get their user ID, character users get undefined
          primaryTrait // User's primary personality trait
        );
        setRewardManager(manager);

        const storyProgress = await apiService.getOrCreateStoryProgress(
          story.id,
          {
            current_passage_id: currentPassage?.passage_id || "",
            story_variables: {},
          }
        );
      };

      initializeRewardManager();
    }
  }, [
    visible,
    story?.id,
    chapter?.id,
    isInitialized,
    primaryTrait,
    personalityLoading,
    wellness.homeData,
  ]);

  // Monitor accumulated rewards state changes
  useEffect(() => {}, [accumulatedRewards]);

  useEffect(() => {
    if (rewardManager && currentPassage && isInitialized) {
      const passageForRewards: Passage = {
        id: (currentPassage as any).id || 0,
        chapter: (currentPassage as any).chapter || null,
        passage_id: currentPassage.passage_id,
        content: currentPassage.content,
        passage_type: currentPassage.passage_type,
        speaker: (currentPassage as any).speaker || null,
        required_conditions: (currentPassage as any).required_conditions || {},
        story_effects: (currentPassage as any).story_effects || {},
        effects: (currentPassage as any).effects || {},
        mood: (currentPassage as any).mood || "",
        background_music: (currentPassage as any).background_music || "",
        background_image: (currentPassage as any).background_image || null,
        order: (currentPassage as any).order || 0,
        choices: (currentPassage.choices || []).map((choice: any) => ({
          id: choice.id,
          passage: (currentPassage as any).id || 0,
          text: choice.text,
          target_id: choice.target_id || "",
          target_passage_id: choice.target_passage_id,
          next_passage: choice.next_passage,
          next_passage_id: choice.next_passage_id,
          choice_type: choice.choice_type || "normal",
          requirements: choice.requirements || {},
          effects: choice.effects || {},
          success_passage_id: choice.success_passage_id,
          failure_passage_id: choice.failure_passage_id,
          required_conditions: choice.required_conditions || {},
          order: choice.order || 0,
        })),
      };

      const passageEffects = (currentPassage as any).story_effects || {};
      const questIds = passageEffects.quest_progress || passageEffects.quests;

      if (questIds && Array.isArray(questIds)) {
        const validQuests = questIds.filter((questId: string) => {
          const questInfo = getQuestInfo(questId);
          return questInfo && questInfo.personalityType === primaryTrait;
        });

        if (validQuests.length > 0) {
          passageForRewards.story_effects = {
            ...passageForRewards.story_effects,
            quest_progress: validQuests,
            quests: validQuests, // Also update 'quests' field to match
          };
        } else {
          // Remove both quest fields if no valid quests
          if (passageForRewards.story_effects) {
            delete passageForRewards.story_effects.quest_progress;
            delete passageForRewards.story_effects.quests;
          }
        }
      }

      rewardManager.handlePassageVisit(passageForRewards);
      lastProcessedPassageRef.current = currentPassage.passage_id;
    }
  }, [currentPassage?.passage_id, rewardManager, isInitialized, primaryTrait]);

  const addRewardToDisplay = (
    message: string,
    type:
      | "experience"
      | "lumens"
      | "item"
      | "skill"
      | "stat"
      | "artifact"
      | "upgrade"
      | "strengthen"
      | "new"
      | "quest",
    icon?: string,
    iconImage?: any,
    statName?: string
  ) => {
    // Add to queue first
    const newReward = { message, type, icon, iconImage, statName };
    setRewardQueue((prev) => {
      const newQueue = [...prev, newReward];
      rewardQueueRef.current = newQueue;
      return newQueue;
    });

    // Process the queue if not already processing
    if (!isProcessingRewardsRef.current) {
      setTimeout(() => {
        processRewardQueue();
      }, 100);
    }
  };

  const processRewardQueue = () => {
    if (isProcessingRewardsRef.current) {
      return;
    }

    if (rewardQueueRef.current.length === 0) {
      isProcessingRewardsRef.current = false;
      setIsProcessingRewards(false);
      return;
    }

    // Set flag to prevent concurrent execution
    isProcessingRewardsRef.current = true;
    setIsProcessingRewards(true);

    const nextReward = rewardQueueRef.current[0];

    // Remove from queue
    rewardQueueRef.current = rewardQueueRef.current.slice(1);
    setRewardQueue((prev) => prev.slice(1));

    // Add to accumulated rewards with unique ID
    const rewardId = `reward_${Date.now()}_${Math.random()}`;
    const accumulatedReward = {
      id: rewardId,
      message: nextReward.message,
      type: nextReward.type,
      icon: nextReward.icon,
      iconImage: nextReward.iconImage,
      statName: nextReward.statName,
      visible: false, // Start as hidden for animation
    };

    setAccumulatedRewards((prev) => [...prev, accumulatedReward]);

    // Trigger animation after a brief delay
    setTimeout(() => {
      setAccumulatedRewards((prev) =>
        prev.map((reward) =>
          reward.id === rewardId ? { ...reward, visible: true } : reward
        )
      );
    }, 100);
  };

  const onRewardAnimationComplete = () => {
    // Continue processing the next reward in queue after animation completes
    setTimeout(() => {
      isProcessingRewardsRef.current = false;
      setIsProcessingRewards(false);
      processRewardQueue();
    }, 200);
  };

  const handleStoryCompletionWithRewards = async (completionData: any) => {
    onStoryComplete?.(completionData);
  };

  const handlePassageTap = () => {
    if (loading) return;

    if (isEnding) {
      if (rewardManager) {
        const homeData = wellness.homeData as any; // Type assertion

        const currentSavedRewards = {
          characterStats: homeData?.character ? [homeData.character] : [],
          totalExperience: homeData?.character?.experience || 0,
          wellnessStats: homeData?.character?.wellness_stats || {},
          storiesCompleted: 0,
        };

        rewardManager.handleStoryCompletion(currentSavedRewards);
      } else {
        onStoryComplete?.({ storyId: story.id });
      }
    }
  };

  const handleChoiceSelect = async (choice: any) => {
    if (rewardManager && currentPassage) {
      const choiceForRewards: Choice = {
        id: choice.id,
        passage: (currentPassage as any).id || 0,
        text: choice.text,
        target_id: choice.target_id || "",
        target_passage_id: choice.target_passage_id,
        next_passage: choice.next_passage,
        next_passage_id: choice.next_passage_id,
        choice_type: choice.choice_type || "normal",
        requirements: choice.requirements || {},
        effects: choice.effects || {},
        success_passage_id: choice.success_passage_id,
        failure_passage_id: choice.failure_passage_id,
        required_conditions: choice.required_conditions || {},
        order: choice.order || 0,
      };

      await rewardManager.handleChoiceMade(
        choiceForRewards,
        currentPassage.passage_id
      );
    }

    makeChoice(choice);
  };

  const renderContent = () => {
    if (loading && !isInitialized) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <ActivityIndicator size="large" color="#4ee6e6" />
          <Text
            style={[
              globalStyles.centeredMessageTitle,
              {
                color: "#4ee6e6",
                textShadowColor: "rgba(78, 230, 230, 0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              },
            ]}
          >
            Loading Story...
          </Text>
          <Text
            style={[globalStyles.centeredMessageText, { color: "#d4af37" }]}
          >
            Story ID: {story?.id}, Chapter ID: {story?.chapterId || "None"}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text
            style={[
              globalStyles.centeredMessageTitle,
              {
                color: "#ef4444",
                textShadowColor: "rgba(239, 68, 68, 0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              },
            ]}
          >
            Error Loading Story
          </Text>
          <Text
            style={[globalStyles.centeredMessageText, { color: "#d4af37" }]}
          >
            {error}
          </Text>
          <Text
            style={[
              globalStyles.centeredMessageText,
              { fontSize: 12, marginTop: 10, color: "#d4af37" },
            ]}
          >
            Story ID: {story?.id}, Chapter ID: {story?.chapterId || "None"}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "rgba(42, 138, 138, 0.2)",
              padding: 12,
              borderRadius: 8,
              marginTop: 16,
              borderWidth: 1,
              borderColor: "#2a8a8a",
              shadowColor: "#2a8a8a",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }}
            onPress={() => {
              onClose();
              setTimeout(() => {}, 100);
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                textAlign: "center",
                fontWeight: "600",
              }}
            >
              Retry Loading
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentPassage) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <Text
            style={[
              globalStyles.centeredMessageTitle,
              {
                color: "#4ee6e6",
                textShadowColor: "rgba(78, 230, 230, 0.5)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              },
            ]}
          >
            Ready to begin.
          </Text>
          <Text
            style={[globalStyles.centeredMessageText, { color: "#d4af37" }]}
          >
            Story ID: {story?.id}, Chapter ID: {story?.chapterId || "None"}
          </Text>
        </View>
      );
    }

    const canTap = false; // Disable tapping on passage content when ending - use button instead

    return (
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          paddingVertical: 20,
        }}
      >
        <TouchableOpacity
          activeOpacity={canTap ? 0.7 : 1}
          onPress={handlePassageTap}
          style={{ padding: 20 }}
        >
          <Text
            style={[
              globalStyles.StoryPassageText,
              {
                color: "#ffe066",
                fontSize: 16,
                lineHeight: 24,
                textShadowColor: "rgba(255, 224, 102, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              },
            ]}
          >
            {currentPassage.content}
          </Text>

          {/* Accumulated reward displays */}
          {accumulatedRewards.map((reward) => (
            <InlineRewardDisplay
              key={reward.id}
              visible={reward.visible}
              message={reward.message}
              type={reward.type}
              icon={reward.icon}
              iconImage={reward.iconImage}
              statName={reward.statName}
              personalityTrait={primaryTrait}
              onComplete={onRewardAnimationComplete}
            />
          ))}

          {isEnding && (
            <TouchableOpacity
              style={{
                backgroundColor: "rgba(78, 230, 230, 0.2)",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: "#4ee6e6",
                shadowColor: "#4ee6e6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginTop: 20,
                alignSelf: "center",
                minWidth: 200,
              }}
              onPress={handlePassageTap}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: "#4ee6e6",
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                  textShadowColor: "rgba(78, 230, 230, 0.5)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                  letterSpacing: 1,
                }}
              >
                🏆 Complete Story
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <View style={globalStyles.StoryChoicesContainer}>
          {hasChoices &&
            availableChoices.map((choice: any, index: number) => (
              <TouchableOpacity
                key={choice.id || index}
                style={[
                  globalStyles.StoryChoiceButton,
                  {
                    backgroundColor: "#2a8a8a",
                    borderColor: "#2a8a8a",
                    borderWidth: 2,
                    shadowColor: "#2a8a8a",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.4,
                    shadowRadius: 8,
                    elevation: 8,
                    alignSelf: "center",
                    marginRight: 20,
                    borderRadius: 20,
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                  },
                ]}
                onPress={() => handleChoiceSelect(choice)}
                disabled={loading}
              >
                <Text
                  style={[
                    globalStyles.StoryChoiceText,
                    {
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: 16,
                    },
                  ]}
                >
                  {choice.text}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    );
  };

  const chapterHeader =
    chapterTitle && chapterNumber
      ? `Chapter ${chapterNumber}: ${chapterTitle}`
      : "Chapter";

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={globalStyles.StoryModalOverlay}>
        <View
          style={[
            globalStyles.StoryModalpassages,
            {
              borderColor: "#d4af37",
              borderWidth: 2,
              shadowColor: "#d4af37",
              shadowOffset: { width: 2, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
              overflow: "hidden",
            },
          ]}
        >
          <ImageBackground
            source={getStoryBackground(story)}
            style={{ flex: 1 }}
            imageStyle={{
              opacity: 0.4,
              resizeMode: "cover",
              width: "100%",
              height: "100%",
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(10, 11, 15, 0.8)",
              }}
            >
              <View
                style={[
                  globalStyles.StoryHeader,
                  {
                    borderBottomColor: "#d4af37",
                    borderBottomWidth: 2,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    backgroundColor: "rgba(10, 11, 15, 0.9)",
                  },
                ]}
              >
                <Text
                  style={[
                    globalStyles.StoryTitle,
                    {
                      color: "#4ee6e6",
                      fontSize: 24,
                      fontWeight: "bold",
                      letterSpacing: 2,
                      textShadowColor: "rgba(78, 230, 230, 0.5)",
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                      flex: 1,
                      textAlign: "left",
                    },
                  ]}
                >
                  {chapterHeader}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "rgba(239, 68, 68, 0.2)",
                    padding: 8,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: "#ef4444",
                    shadowColor: "#ef4444",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                    width: 36,
                    height: 36,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <View
                style={[
                  globalStyles.StoryMainpassages,
                  {
                    flex: 1,
                    backgroundColor: "transparent",
                    borderColor: "transparent",
                    borderWidth: 0,
                    shadowColor: "transparent",
                    elevation: 0,
                  },
                ]}
              >
                {renderContent()}
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

export default StoryScreen;
