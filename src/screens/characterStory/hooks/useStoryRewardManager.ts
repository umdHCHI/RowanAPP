import { useState, useEffect } from 'react';
import { apiService } from '../../../services/apiService';
import { StoryRewardManager } from '../../../utils/storyRewardIntegration';

interface UseStoryRewardManagerProps {
  visible: boolean;
  storyId: number;
  chapterId: number | null;
  isInitialized: boolean;
  currentPassage: any;
  primaryTrait: string;
  personalityLoading: boolean;
  wellnessHomeData: any;
  showRewardNotification: (
    message: string,
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest',
    icon?: string,
    iconImage?: any,
    statName?: string
  ) => void;
  handleStoryCompletionWithRewards: (completionData: any) => Promise<void>;
}

/**
 * Hook for managing StoryRewardManager lifecycle
 * Follows Archive pattern: Dual research condition (Character vs Personality) reward systems
 */
export const useStoryRewardManager = ({
  visible,
  storyId,
  chapterId,
  isInitialized,
  currentPassage,
  primaryTrait,
  personalityLoading,
  wellnessHomeData,
  showRewardNotification,
  handleStoryCompletionWithRewards
}: UseStoryRewardManagerProps) => {
  const [rewardManager, setRewardManager] = useState<StoryRewardManager | null>(null);

  // Initialize RewardManager when story opens
  useEffect(() => {
    if (visible && storyId && isInitialized) {
      const initializeRewardManager = async () => {
        const homeData = wellnessHomeData as any;

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
        // Archive research design: homeData.userProfile.profile.research_group.condition
        if (homeData?.userProfile?.profile?.research_group?.condition) {
          researchCondition = homeData.userProfile.profile.research_group.condition === "A" ? "character" : "personality";
        } else {
          // Fallback: check completion_type (legacy field)
          const completionType = homeData?.userProfile?.completion_type;
          if (completionType) {
            researchCondition = completionType === "character" ? "character" : "personality";
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
        const characterId = researchCondition === "character"
          ? (homeData?.userProfile?.character?.id || homeData?.character?.id || 0)
          : 0;

        // Equipment array: only for character users
        const equippedGear = researchCondition === "character"
          ? (homeData?.userProfile?.character?.equipped_gear || homeData?.character?.equipped_gear || [])
          : [];

        // Initialize StoryRewardManager with dual-path support
        const manager = new StoryRewardManager(
          storyId.toString(),
          showRewardNotification,
          handleStoryCompletionWithRewards,
          apiService,
          characterId,       // Character users: character ID, Personality users: 0
          equippedGear,      // Character users: equipment array, Personality users: []
          0,                 // storyReplayCount (future feature)
          researchCondition, // "character" | "personality"
          userId,            // Personality users: user ID, Character users: undefined
          primaryTrait       // User's primary personality trait (for quest filtering)
        );

        setRewardManager(manager);

        // Create or get story progress record
        const storyProgress = await apiService.getOrCreateStoryProgress(storyId, {
          current_passage_id: currentPassage?.passage_id || '',
          story_variables: {}
        });
      };

      initializeRewardManager();
    }
  }, [visible, storyId, chapterId, isInitialized, primaryTrait, personalityLoading, wellnessHomeData]);

  return {
    rewardManager
  };
};
