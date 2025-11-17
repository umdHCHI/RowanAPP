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
import { useStoryEngine } from '../../hooks/useStoryEngine';
import { apiService } from '../../services/apiService';
import { createGlobalStyles } from '../../styles/globalStyles';
import { Chapter, Choice, Passage, Story } from '../../types/story';
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
 
const selectProfileAndCharacter = (homeData?: any) => {
  const hd = homeData ?? null;
  const profile = hd?.userProfile ?? hd ?? null;
  const backendCharacter = hd?.character ?? profile?.character ?? null;
  return { profile, backendCharacter };
};

  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(null);
  const [rewardNotification, setRewardNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
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
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }>>([]);

  const [isShowingNotification, setIsShowingNotification] = useState(false);


  const notificationQueueRef = useRef<Array<{
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
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
    if (visible && story?.id && isInitialized) {
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
          researchCondition = homeData.userProfile.profile.research_group.condition === "A" ? "character" : "personality";
        } else {
          // Fallback: check completion_type
          const completionType = homeData?.userProfile?.completion_type;
          if (completionType) {
            researchCondition = completionType === "character" ? "character" : "personality";
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
        const characterId = researchCondition === "character" ? (homeData?.userProfile?.character?.id || homeData?.character?.id || 0) : 0;


        // Equipment array: only for character users
        const equippedGear = researchCondition === "character" ? (homeData?.userProfile?.character?.equipped_gear || homeData?.character?.equipped_gear || []) : [];
        
        const manager = new StoryRewardManager(
          story.id.toString(),
          showRewardNotification,
          handleStoryCompletionWithRewards,
          apiService,
          characterId,       // Character users get their character ID, personality users get 0
          equippedGear,      // Character users get their equipment array, personality users get []
          0,                 // storyReplayCount
          researchCondition, // "character" | "personality" - NOW in correct position
          userId,            // Personality users get their user ID, character users get undefined
          primaryTrait       // User's primary personality trait
        );
        setRewardManager(manager);
        
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
    if (rewardManager && currentPassage && isInitialized) {
      // Build passage object for reward processing
      // Note: Quest filtering is handled by StoryRewardManager based on research condition
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

      // Let StoryRewardManager handle all quest filtering based on research condition
      rewardManager.handlePassageVisit(passageForRewards);
    }
  }, [currentPassage?.passage_id, rewardManager, isInitialized]);

  const showRewardNotification = (
    message: string,
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest',
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

  const handlePassageTap = () => {
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