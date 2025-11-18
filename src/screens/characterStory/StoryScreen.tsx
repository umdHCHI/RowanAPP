import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FloatingRewardNotification from '../../components/rewards/FloatingRewardNotification';
import { useMasterState } from '../../context/MasterStateContext';
import { usePersonality } from '../../context/PersonalityContext';
import { useStoryEngine } from '../../hooks/useStoryEngine'; // Make sure this path is correct
import { apiService } from '../../services/apiService';
import { createGlobalStyles } from '../../styles/globalStyles';
import { Chapter, Choice, Passage, Story } from '../../types/story';
import { getQuestInfo } from '../../utils/rewardsUtils';
import { StoryRewardManager } from '../../utils/storyRewardIntegration';
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
  const { primaryTrait, isPersonalityUser, isLoading: personalityLoading } = usePersonality();
  const globalStyles = createGlobalStyles(theme.theme);

  // Personality trait is loaded from PersonalityContext
 


  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(null);
  const [lastUsedPrimaryTrait, setLastUsedPrimaryTrait] = useState<string | null>(null);
  const [rewardNotification, setRewardNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }>({
    visible: false,
    message: '',
    type: 'stat'
  });

  const [notificationQueue, setNotificationQueue] = useState<Array<{
    message: string;
    type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }>>([]);

  const [isShowingNotification, setIsShowingNotification] = useState(false);


  const notificationQueueRef = useRef<Array<{
    message: string;
    type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }>>([]);
  const isShowingNotificationRef = useRef(false);

  useEffect(() => {
    notificationQueueRef.current = notificationQueue;
  }, [notificationQueue]);

  useEffect(() => {
    isShowingNotificationRef.current = isShowingNotification;
  }, [isShowingNotification]);

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

  useEffect(() => {
    console.log(`🔍 [StoryScreen RewardManager] Checking initialization:`, {
      visible,
      hasStoryId: !!story?.id,
      isInitialized,
      primaryTrait,
      personalityLoading,
      hasRewardManager: !!rewardManager,
      lastUsedPrimaryTrait
    });

    if (visible && story?.id && isInitialized) {
      console.log(`✅ [StoryScreen RewardManager] Basic conditions met - initializing...`);

      const initializeRewardManager = async () => {
        // Load homeData if not available
        let homeData = wellness.homeData as any;
        if (!homeData && wellness.loadHomeData) {
          console.log(`📊 [StoryScreen RewardManager] Loading homeData...`);
          await wellness.loadHomeData();
          homeData = wellness.homeData as any;
        }

        // Wait for homeData to load before initializing
        if (!homeData) {
          console.log(`⚠️ [StoryScreen RewardManager] No homeData available - waiting...`);
          return;
        }

        console.log(`📊 [StoryScreen RewardManager] HomeData loaded`);

        // CHANGED: Allow reinitialization if primaryTrait changes
        // This fixes the issue where manager is created with default "Openness" before real trait loads
        if (rewardManager && lastUsedPrimaryTrait === primaryTrait) {
          console.log(`⏭️ [StoryScreen RewardManager] Manager exists with same trait - skipping`);
          return; // Skip reinitialization if trait hasn't changed
        }

        if (rewardManager) {
          console.log(`🔄 [StoryScreen RewardManager] Trait changed - resetting manager`);
          setRewardManager(null);
        }

        let researchCondition: "character" | "personality" = "personality";

        // Determine research condition: Group A = Character, Group B = Personality
        if (homeData?.userProfile?.profile?.research_group?.condition) {
          researchCondition = homeData.userProfile.profile.research_group.condition === "A" ? "character" : "personality";
        } else {
          // Fallback: check completion_type
          const completionType = homeData?.userProfile?.completion_type;
          if (completionType) {
            researchCondition = completionType === "character" ? "character" : "personality";
          }
        }

        console.log(`📊 [StoryScreen RewardManager] Research condition: ${researchCondition}`);

        // For personality users, wait until personality data is loaded
        if (researchCondition === "personality" && personalityLoading) {
          console.log(`⏳ [StoryScreen RewardManager] Personality data still loading - waiting...`);
          return;
        }

        // For personality users, determine the correct trait to use
        // IMPORTANT: Use backend trait directly to avoid timing issues with PersonalityContext
        let traitToUse = primaryTrait;
        if (researchCondition === "personality") {
          const backendTrait = homeData?.userProfile?.personality_profile?.profile_summary?.dominant_trait;

          if (backendTrait) {
            // Normalize backend trait (lowercase → Title Case)
            const normalizedBackendTrait = backendTrait.charAt(0).toUpperCase() + backendTrait.slice(1).toLowerCase();
            traitToUse = normalizedBackendTrait;

            console.log(`🔍 [StoryScreen RewardManager] Using backend trait for accuracy:`, {
              backendTrait,
              normalizedBackendTrait,
              frontendTrait: primaryTrait,
              usingTrait: traitToUse
            });
          } else {
            console.log(`⚠️ [StoryScreen RewardManager] No backend trait found - using frontend trait:`, primaryTrait);
          }
        }

        // Get userId for personality users (needed for coping tool acquisition)
        let userId = undefined;
        if (researchCondition === "personality") {
          userId = homeData?.userProfile?.id;
        }

        // Character ID: Both user types need this for wellness stats
        const characterId = homeData?.userProfile?.character?.id || homeData?.character?.id || 0;

        // Equipment array: only for character users
        const equippedGear = researchCondition === "character" ? (homeData?.userProfile?.character?.equipped_gear || homeData?.character?.equipped_gear || []) : [];

        console.log(`🎯 [StoryScreen RewardManager] Creating StoryRewardManager:`, {
          storyId: story.id,
          researchCondition,
          characterId,
          userId,
          primaryTrait: traitToUse,
          hasEquippedGear: equippedGear.length > 0
        });

        const manager = new StoryRewardManager(
          story.id.toString(),
          showRewardNotification,
          handleStoryCompletionWithRewards,
          apiService,
          characterId,       // Both user types: character ID for wellness stat storage
          equippedGear,      // Character users: equipment array, Personality users: []
          0,                 // storyReplayCount
          researchCondition, // "character" | "personality"
          userId,            // Personality users: user ID for coping tool acquisition
          traitToUse         // User's primary personality trait (from backend for accuracy)
        );

        console.log(`✅ [StoryScreen RewardManager] StoryRewardManager created successfully`);
        setRewardManager(manager);
        setLastUsedPrimaryTrait(traitToUse); // Track which trait was used for this manager
        console.log(`✅ [StoryScreen RewardManager] RewardManager set in state`);


        const storyProgress = await apiService.getOrCreateStoryProgress(story.id, {
          current_passage_id: currentPassage?.passage_id || '',
          story_variables: {}
        });
      };
      
      initializeRewardManager();
    }
  }, [visible, story?.id, chapter?.id, isInitialized, primaryTrait, personalityLoading, wellness.homeData]);

  // Monitor reward notification state changes
  useEffect(() => {
  }, [rewardNotification]);

  useEffect(() => {
    console.log(`🔍 [StoryScreen] Passage reward check:`, {
      hasRewardManager: !!rewardManager,
      hasCurrentPassage: !!currentPassage,
      isInitialized,
      passageId: currentPassage?.passage_id
    });

    if (rewardManager && currentPassage && isInitialized) {
      console.log(`✅ [StoryScreen] All conditions met - processing passage rewards for: ${currentPassage.passage_id}`);

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
        mood: (currentPassage as any).mood || '',
        background_music: (currentPassage as any).background_music || '',
        background_image: (currentPassage as any).background_image || null,
        order: (currentPassage as any).order || 0,
        choices: (currentPassage.choices || []).map((choice: any) => ({
          id: choice.id,
          passage: (currentPassage as any).id || 0,
          text: choice.text,
          target_id: choice.target_id || '',
          target_passage_id: choice.target_passage_id,
          next_passage: choice.next_passage,
          next_passage_id: choice.next_passage_id,
          choice_type: choice.choice_type || 'normal',
          requirements: choice.requirements || {},
          effects: choice.effects || {},
          success_passage_id: choice.success_passage_id,
          failure_passage_id: choice.failure_passage_id,
          required_conditions: choice.required_conditions || {},
          order: choice.order || 0
        }))
      };


      const passageEffects = (currentPassage as any).story_effects || {};
      const questIds = passageEffects.quest_progress || passageEffects.quests;

      if (questIds && Array.isArray(questIds)) {

        const validQuests = questIds.filter((questId: string) => {
          const questInfo = getQuestInfo(questId);
          const isValid = questInfo && questInfo.personalityType === primaryTrait;
          return isValid;
        });


        if (validQuests.length > 0) {
          passageForRewards.story_effects = {
            ...passageForRewards.story_effects,
            quest_progress: validQuests,
            quests: validQuests  // Also update 'quests' field to match
          };
        } else {
          // Remove both quest fields if no valid quests
          if (passageForRewards.story_effects) {
            delete passageForRewards.story_effects.quest_progress;
            delete passageForRewards.story_effects.quests;
          }
        }
      }

      console.log(`📦 [StoryScreen] Calling rewardManager.handlePassageVisit with passage:`, {
        passageId: passageForRewards.passage_id,
        story_effects: passageForRewards.story_effects,
        effects: passageForRewards.effects
      });

      rewardManager.handlePassageVisit(passageForRewards);
    } else {
      console.log(`⚠️ [StoryScreen] Skipping reward processing - conditions not met`);
    }
  }, [currentPassage?.passage_id, rewardManager, isInitialized, primaryTrait]);

  const showRewardNotification = (
    message: string,
    type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest',
    icon?: string,
    iconImage?: any,
    statName?: string
  ) => {

    // Add to queue and update ref immediately
    const newNotification = { message, type, icon, iconImage, statName };
    setNotificationQueue(prev => {
      const newQueue = [...prev, newNotification];
      // Update ref immediately to avoid race condition
      notificationQueueRef.current = newQueue;
      return newQueue;
    });

    if (!isShowingNotificationRef.current) {
      setTimeout(() => {
        processNotificationQueue();
      }, 100);
    } else {
    }
  };

  const processNotificationQueue = () => {

    if (isShowingNotificationRef.current) {
      return;
    }

    if (notificationQueueRef.current.length === 0) {
      isShowingNotificationRef.current = false;
      setIsShowingNotification(false);
      return;
    }

    // Set flag immediately to prevent concurrent execution
    isShowingNotificationRef.current = true;
    setIsShowingNotification(true);

    const nextNotification = notificationQueueRef.current[0];

    // Remove from ref immediately to prevent duplicate processing
    notificationQueueRef.current = notificationQueueRef.current.slice(1);

    setRewardNotification({
      visible: true,
      message: nextNotification.message,
      type: nextNotification.type,
      icon: nextNotification.icon,
      iconImage: nextNotification.iconImage,
      statName: nextNotification.statName
    });

    // Update state to match ref
    setNotificationQueue(prev => {
      const newQueue = prev.slice(1);
      return newQueue;
    });
  };

  const hideRewardNotification = () => {
    setRewardNotification(prev => ({ ...prev, visible: false }));
    setIsShowingNotification(false);

    // Wait for hide animation (300ms) before processing next notification
    setTimeout(() => {
      processNotificationQueue();
    }, 400); // Wait 400ms for hide animation to complete
  };

  const handleStoryCompletionWithRewards = async (completionData: any) => {
    onStoryComplete?.(completionData);
  };

  const handlePassageTap = async () => {
    if (loading) return;

    if (isEnding) {

      if (rewardManager) {
        const homeData = wellness.homeData as any; // Type assertion

        const currentSavedRewards = {
          characterStats: homeData?.character ? [homeData.character] : [],
          totalExperience: homeData?.character?.experience || 0,
          wellnessStats: homeData?.character?.wellness_stats || {},
          storiesCompleted: 0
        };

        try {
          await rewardManager.handleStoryCompletion(currentSavedRewards);
        } catch (error: any) {
          console.error(`❌ [StoryScreen] Error during story completion:`, error.message);
          console.error(`   Full error:`, error);
          // Still call onStoryComplete to close the story even if rewards fail
        }
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
        target_id: choice.target_id || '',
        target_passage_id: choice.target_passage_id,
        next_passage: choice.next_passage,
        next_passage_id: choice.next_passage_id,
        choice_type: choice.choice_type || 'normal',
        requirements: choice.requirements || {},
        effects: choice.effects || {},
        success_passage_id: choice.success_passage_id,
        failure_passage_id: choice.failure_passage_id,
        required_conditions: choice.required_conditions || {},
        order: choice.order || 0
      };
      
      await rewardManager.handleChoiceMade(choiceForRewards, currentPassage.passage_id);
    }
    
    makeChoice(choice);
  };
  
  const renderContent = () => {
    if (loading && !isInitialized) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <ActivityIndicator size="large" color="#4ee6e6" />
          <Text style={[globalStyles.centeredMessageTitle, { color: '#4ee6e6', textShadowColor: 'rgba(78, 230, 230, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Loading Story...</Text>
          <Text style={[globalStyles.centeredMessageText, { color: '#d4af37' }]}>
            Story ID: {story?.id}, Chapter ID: {story?.chapterId || 'None'}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={globalStyles.centeredMessageContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
          <Text style={[globalStyles.centeredMessageTitle, { color: '#ef4444', textShadowColor: 'rgba(239, 68, 68, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Error Loading Story</Text>
          <Text style={[globalStyles.centeredMessageText, { color: '#d4af37' }]}>{error}</Text>
          <Text style={[globalStyles.centeredMessageText, { fontSize: 12, marginTop: 10, color: '#d4af37' }]}>
            Story ID: {story?.id}, Chapter ID: {story?.chapterId || 'None'}
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: 'rgba(42, 138, 138, 0.2)',
              padding: 12,
              borderRadius: 8,
              marginTop: 16,
              borderWidth: 1,
              borderColor: '#2a8a8a',
              shadowColor: '#2a8a8a',
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
            <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: '600' }}>
              Retry Loading
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!currentPassage) {
        return (
                    <View style={globalStyles.centeredMessageContainer}>
            <Text style={[globalStyles.centeredMessageTitle, { color: '#4ee6e6', textShadowColor: 'rgba(78, 230, 230, 0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>Ready to begin.</Text>
            <Text style={[globalStyles.centeredMessageText, { color: '#d4af37' }]}>
              Story ID: {story?.id}, Chapter ID: {story?.chapterId || 'None'}
            </Text>
        </View>
        );
    }

    const canTap = false; // Disable tapping on passage content when ending - use button instead

    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', paddingVertical: 20 }}>
        <TouchableOpacity 
          activeOpacity={canTap ? 0.7 : 1} 
          onPress={handlePassageTap}
          style={{ padding: 20 }}
        >
          <Text style={[globalStyles.StoryPassageText, {
            color: '#ffe066',
            fontSize: 16,
            lineHeight: 24,
            textShadowColor: 'rgba(255, 224, 102, 0.3)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }]}>
            {currentPassage.content}
          </Text>
          {isEnding && (
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(78, 230, 230, 0.2)',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 25,
                borderWidth: 2,
                borderColor: '#4ee6e6',
                shadowColor: '#4ee6e6',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                marginTop: 20,
                alignSelf: 'center',
                minWidth: 200,
              }}
              onPress={handlePassageTap}
              activeOpacity={0.7}
            >
              <Text style={{
                color: '#4ee6e6',
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                textShadowColor: 'rgba(78, 230, 230, 0.5)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
                letterSpacing: 1,
              }}>
                🏆 Complete Story
              </Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        <View style={globalStyles.StoryChoicesContainer}>
          {hasChoices && availableChoices.map((choice: any, index: number) => (
            <TouchableOpacity
              key={choice.id || index}
              style={[globalStyles.StoryChoiceButton, {
                backgroundColor: '#2a8a8a',
                borderColor: '#2a8a8a',
                borderWidth: 2,
                shadowColor: '#2a8a8a',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
                alignSelf: 'center',
                marginRight: 20,
                borderRadius: 20,
                paddingVertical: 6,
                paddingHorizontal: 12,
              }]}
              onPress={() => handleChoiceSelect(choice)}
              disabled={loading}
            >
              <Text style={[globalStyles.StoryChoiceText, {
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: 16,
              }]}>{choice.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const chapterHeader = chapterTitle && chapterNumber ? 
    `Chapter ${chapterNumber}: ${chapterTitle}` : 
    'Chapter';

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
        <View style={globalStyles.StoryModalOverlay}>
            <View style={[globalStyles.StoryModalpassages, {
              borderColor: '#d4af37',
              borderWidth: 2,
              shadowColor: '#d4af37',
              shadowOffset: { width: 2, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 12,
            }]}>
                <View style={[globalStyles.StoryHeader, {
                  borderBottomColor: '#d4af37',
                  borderBottomWidth: 2,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }]}>
                    <Text style={[globalStyles.StoryTitle, {
                      color: '#4ee6e6',
                      fontSize: 24,
                      fontWeight: 'bold',
                      letterSpacing: 2,
                      textShadowColor: 'rgba(78, 230, 230, 0.5)',
                      textShadowOffset: { width: 0, height: 2 },
                      textShadowRadius: 8,
                      flex: 1,
                      textAlign: 'left',
                    }]}>{chapterHeader}</Text>
                    <TouchableOpacity 
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        padding: 8,
                        borderRadius: 20,
                        borderWidth: 2,
                        borderColor: '#ef4444',
                        shadowColor: '#ef4444',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4,
                        elevation: 4,
                        width: 36,
                        height: 36,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }} 
                      onPress={onClose}
                    >
                        <Ionicons name="close" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
                <View style={[globalStyles.StoryMainpassages, {
                  backgroundColor: 'rgba(10, 11, 15, 0.95)',
                  borderColor: '#d4af37',
                  borderWidth: 1,
                  shadowColor: '#d4af37',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 4,
                }]}>
                    {renderContent()}
                </View>
            </View>
            {/* Reward notification overlay - positioned at Modal level for proper z-index */}
            <FloatingRewardNotification
              visible={rewardNotification.visible}
              message={rewardNotification.message}
              type={rewardNotification.type}
              icon={rewardNotification.icon}
              iconImage={rewardNotification.iconImage}
              statName={rewardNotification.statName}
              onHide={hideRewardNotification}
            />
        </View>
    </Modal>
  );
};

export default StoryScreen;