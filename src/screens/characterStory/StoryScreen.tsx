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
import FloatingRewardNotification from '../../components/FloatingRewardNotification';
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
  const { theme, character } = useMasterState();
  const { primaryTrait, isPersonalityUser } = usePersonality();
  const globalStyles = createGlobalStyles(theme.theme);
  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(null);
  const [rewardNotification, setRewardNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  }>({
    visible: false,
    message: '',
    type: 'stat'
  });

  const [notificationQueue, setNotificationQueue] = useState<Array<{
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  }>>([]);

  const [isShowingNotification, setIsShowingNotification] = useState(false);


  // Use refs to track current state for queue processing
  const notificationQueueRef = useRef<Array<{
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest';
  }>>([]);
  const isShowingNotificationRef = useRef(false);

  // Keep refs in sync with state
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
    chapterId: story?.chapterId,
  });

  // Initialize reward manager when story starts
  useEffect(() => {
    console.log('=== CHECKING REWARD MANAGER INITIALIZATION ===');
    console.log('Visible:', visible);
    console.log('Story ID:', story?.id);
    console.log('Character backendCharacter:', character.backendCharacter);
    console.log('Character ID:', character.backendCharacter?.id);
    
    if (visible && story?.id && isInitialized) {
      const initializeRewardManager = async () => {
        try {
          // Check if we have a valid character from backend AND personality profile
          const characterId = character.backendCharacter?.id;
          const hasCharacter = characterId && characterId > 0;
          const hasPersonalityProfile = primaryTrait && primaryTrait.length > 0;
          
          // Determine research condition based on personality profile first, then character existence
          // If user has a personality profile, they should be treated as personality user
          // regardless of whether they have a character (backend might be wrong)
          const researchCondition = hasPersonalityProfile ? "personality" : (hasCharacter ? "character" : "personality");
          
          console.log('=== ENHANCED USER TYPE DETERMINATION ===');
          console.log('Backend character ID:', characterId);
          console.log('Has valid character:', hasCharacter);
          console.log('Has personality profile:', hasPersonalityProfile);
          console.log('Primary trait:', primaryTrait);
          console.log('Research condition:', researchCondition);
          
          // Get user ID for personality users
          let userId = undefined;
          if (!hasCharacter) {
            try {
              const userProfile = await apiService.getProfile();
              userId = userProfile?.id;
              console.log('User ID for personality user:', userId);
            } catch (error) {
              console.warn('Failed to get user ID for personality user:', error);
            }
          }
          
          // Initialize reward manager with appropriate condition
          console.log('=== INITIALIZING STORY REWARD MANAGER ===');
          console.log('Story ID:', story.id);
          console.log('Character ID:', characterId || 'None (personality user)');
          console.log('Research condition:', researchCondition);
          
          const manager = new StoryRewardManager(
            story.id.toString(),
            showRewardNotification,
            handleStoryCompletionWithRewards,
            apiService,
            characterId || 0, // Use 0 for personality users
            [], // playerInventory
            0, // storyReplayCount
            researchCondition,
            userId, // userId for personality users
            primaryTrait // personality trait for coping tool conversion
          );
          setRewardManager(manager);
          console.log('✅ Reward manager initialized for', researchCondition, 'user with trait:', primaryTrait);
          
          // Create or get StoryProgress record to enable story progression
          try {
            console.log('=== CREATING/GETTING STORY PROGRESS ===');
            console.log('Story ID:', story.id);
            const storyProgress = await apiService.getOrCreateStoryProgress(story.id, {
              current_passage_id: currentPassage?.passage_id || '',
              story_variables: {}
            });
            console.log('✅ StoryProgress record ready:', storyProgress?.id);
          } catch (progressError) {
            console.error('❌ Failed to create/get StoryProgress:', progressError);
            // Don't fail the story - just log the error and continue
          }
          
        } catch (error) {
          console.error('❌ Error initializing reward manager:', error);
        }
      };
      
      initializeRewardManager();
    } else {
      console.log('❌ Cannot initialize reward manager:', {
        visible,
        storyId: story?.id,
        characterId: character.backendCharacter?.id
      });
    }
  }, [visible, story?.id, character.backendCharacter?.id, isInitialized]);

  // Handle passage rewards when a new passage is loaded
  useEffect(() => {
    if (rewardManager && currentPassage && isInitialized) {
      console.log('=== HANDLING PASSAGE REWARDS ===');
      console.log('Current passage:', currentPassage.passage_id);
      console.log('Passage story_effects:', (currentPassage as any).story_effects);
      
      // Convert the passage to the expected format for the reward manager
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
      
      console.log('=== DEBUGGING PASSAGE FOR REWARDS ===');
      console.log('Original passage story_effects:', (currentPassage as any).story_effects);
      console.log('Converted passage story_effects:', passageForRewards.story_effects);
      console.log('Has story_effects:', Object.keys(passageForRewards.story_effects || {}).length > 0);
      console.log('Story_effects keys:', Object.keys(passageForRewards.story_effects || {}));
      console.log('Has quests:', passageForRewards.story_effects?.quests);
      
      // Check quest validity for personality match
      const passageEffects = (currentPassage as any).story_effects || {};
    
      // Check if there are quests in this passage (both formats)
      const questIds = passageEffects.quest_progress || passageEffects.quests;

      if (questIds && Array.isArray(questIds)) {
        console.log('=== CHECKING QUEST PERSONALITY MATCH ===');
        console.log('User primary trait:', primaryTrait);
        console.log('Quest IDs in passage:', questIds);
        
        // Verify each quest belongs to the user's personality type
        const validQuests = questIds.filter((questId: string) => {
          const questInfo = getQuestInfo(questId);
          const isValid = questInfo && questInfo.personalityType === primaryTrait;
          
          console.log(`Quest ${questId}: ${isValid ? 'VALID' : 'INVALID'} for ${primaryTrait} user`);
          return isValid;
        });
        
        console.log('Valid quests for this user:', validQuests);
        
        if (validQuests.length !== questIds.length) {
          console.warn('⚠️ Some quests in this passage do not match user personality type');
          console.warn('❌ QUEST MISMATCH DETECTED:', {
            userTrait: primaryTrait,
            questIds: questIds,
            validQuests: validQuests,
            invalidQuests: questIds.filter((id: string) => !validQuests.includes(id))
          });
        }
      }
      
      rewardManager.handlePassageVisit(passageForRewards);
    }
  }, [currentPassage?.passage_id, rewardManager, isInitialized, primaryTrait]);

  // Monitor notification queue state for debugging
  useEffect(() => {
    console.log(`📊 Notification queue state changed:`, {
      queueLength: notificationQueue.length,
      queueRefLength: notificationQueueRef.current.length,
      isShowing: isShowingNotification,
      isShowingRef: isShowingNotificationRef.current,
      currentNotification: rewardNotification
    });
  }, [notificationQueue, isShowingNotification, rewardNotification]);

  // Show reward notifications with queue system
  const showRewardNotification = (message: string, type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest') => {
    console.log(`🎁 REWARD QUEUED: ${message} (${type})`);
    console.log(`Current queue length: ${notificationQueueRef.current.length}, Showing: ${isShowingNotificationRef.current}`);
    
    // The conversion from equipment to coping tools is now handled in StoryRewardManager
    // So we can directly use the message and type provided
    
    // Add to queue
    setNotificationQueue(prev => {
      const newQueue = [...prev, { message, type }];
      console.log(`Queue updated, new length: ${newQueue.length}`);
      return newQueue;
    });
    
    // If not currently showing a notification, start showing them
    if (!isShowingNotificationRef.current) {
      console.log('🔄 Starting notification queue processing');
      // Use setTimeout to ensure state is updated before processing
      setTimeout(() => {
        processNotificationQueue();
      }, 100); // Small delay to ensure state is updated
    }
  };

  // Process the notification queue
  const processNotificationQueue = () => {
    console.log(`🔄 Processing notification queue...`);
    console.log(`Current queue length: ${notificationQueueRef.current.length}, Showing: ${isShowingNotificationRef.current}`);
    
    if (isShowingNotificationRef.current) {
      console.log(`⏳ Already showing notification, skipping processing`);
      return;
    }
    
    if (notificationQueueRef.current.length === 0) {
      console.log('✅ Queue empty, stopping notification processing');
      setIsShowingNotification(false);
      return;
    }
    
    const nextNotification = notificationQueueRef.current[0];
    console.log(`📢 Showing notification: ${nextNotification.message} (${nextNotification.type})`);
    
    // Show the next notification
    setRewardNotification({
      visible: true,
      message: nextNotification.message,
      type: nextNotification.type
    });
    
    setIsShowingNotification(true);
    
    // Remove the notification from the queue
    setNotificationQueue(prev => {
      const remainingNotifications = prev.slice(1);
      console.log(`Remaining in queue: ${remainingNotifications.length}`);
      return remainingNotifications;
    });
  };

  // Hide reward notification and process next in queue
  const hideRewardNotification = () => {
    console.log('👋 Hiding current notification, processing next in queue');
    setRewardNotification(prev => ({ ...prev, visible: false }));
    setIsShowingNotification(false);
    
    // Process next notification in queue after a delay
    setTimeout(() => {
      processNotificationQueue();
    }, 1000); // 1 second delay between notifications
  };

  // Handle story completion with accumulated rewards
  const handleStoryCompletionWithRewards = async (completionData: any) => {
    console.log('=== STORY COMPLETION WITH REWARDS ===');
    console.log('Completion data:', completionData);
    
    // Call the original onStoryComplete callback
    onStoryComplete?.(completionData);
  };

  const handlePassageTap = () => {
    if (loading) return;

    if (isEnding) {
      console.log('🏆 Story ending reached. Triggering completion.');
      
      // Handle story completion with rewards
      if (rewardManager) {
        // Get current saved rewards from master state
        const currentSavedRewards = {
          characterStats: character.backendCharacter ? [character.backendCharacter] : [],
          totalExperience: character.backendCharacter?.experience || 0,
          wellnessStats: character.backendCharacter?.wellness_stats || {},
          storiesCompleted: 0 // This will be updated by the reward manager
        };
        
        rewardManager.handleStoryCompletion(currentSavedRewards);
      } else {
        onStoryComplete?.({ storyId: story.id });
      }
    }
    // Removed the automatic choice triggering for single choices - now they will be shown as buttons
  };

  const handleChoiceSelect = async (choice: any) => {
    console.log('=== HANDLING CHOICE SELECTION ===');
    console.log('Choice:', choice);
    console.log('Current passage ID:', currentPassage?.passage_id);
    console.log('Reward manager exists:', !!rewardManager);
    
    // Handle choice rewards if no passage rewards were found
    if (rewardManager && currentPassage) {
      console.log('✅ Processing choice with reward manager');
      // Convert the choice to the expected format for the reward manager
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
      
      console.log('Choice for rewards:', choiceForRewards);
      console.log('Choice effects:', choiceForRewards.effects);
      
      await rewardManager.handleChoiceMade(choiceForRewards, currentPassage.passage_id);
    } else {
      console.log('❌ Cannot process choice rewards:', {
        hasRewardManager: !!rewardManager,
        hasCurrentPassage: !!currentPassage
      });
    }
    
    // Make the choice
    makeChoice(choice);
  };
  
  // Main render function
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
              // Close and reopen the story to retry
              onClose();
              setTimeout(() => {
                // This will trigger a reload of the story engine
                console.log('Retrying story load...');
              }, 100);
            }}
          >
            <Text style={{ color: '#ffffff', textAlign: 'center', fontWeight: 'bold' }}>
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

  // Create the chapter header using the chapter information from the hook
  const chapterHeader = chapterTitle && chapterNumber ? 
    `Chapter ${chapterNumber}: ${chapterTitle}` : 
    'Chapter';
    
  // Log chapter information for debugging
  console.log(`📖 StoryScreen chapter info: ${chapterTitle} (${chapterNumber})`);
  console.log(`📖 Story chapterId: ${story?.chapterId}`);
  console.log(`📖 Chapter header: ${chapterHeader}`);

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
        </View>
        <FloatingRewardNotification
          visible={rewardNotification.visible}
          message={rewardNotification.message}
          type={rewardNotification.type}
          onHide={hideRewardNotification}
        />
    </Modal>
  );
};

export default StoryScreen;