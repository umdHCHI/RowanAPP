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
    type: 'experience' | 'lumens' | 'item' | 'skill' | 'stat' | 'artifact' | 'upgrade' | 'strengthen' | 'new' | 'quest',
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
    console.log(`🔍 [useStoryRewardManager] Checking initialization conditions:`, {
      visible,
      storyId,
      isInitialized,
      hasWellnessHomeData: !!wellnessHomeData,
      personalityLoading,
      hasRewardManager: !!rewardManager
    });

    if (visible && storyId && isInitialized) {
      console.log(`✅ [useStoryRewardManager] Conditions met - initializing...`);

      const initializeRewardManager = async () => {
        const homeData = wellnessHomeData as any;

        // Wait for homeData to load before initializing
        if (!homeData) {
          console.log(`⚠️ [useStoryRewardManager] No homeData - waiting...`);
          return;
        }

        // Skip if RewardManager already exists (prevents duplicate initialization)
        if (rewardManager) {
          console.log(`⏭️ [useStoryRewardManager] RewardManager already exists - skipping`);
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

        console.log(`📊 [useStoryRewardManager] Research condition: ${researchCondition}`);

        // For personality users, wait until personality data is loaded
        if (researchCondition === "personality" && personalityLoading) {
          console.log(`⏳ [useStoryRewardManager] Personality data still loading - waiting...`);
          return;
        }

        // Get userId for personality users (needed for coping tool acquisition)
        let userId = undefined;
        if (researchCondition === "personality") {
          userId = homeData?.userProfile?.id;
        }

        // Character ID: Both user types need this for wellness stats
        // Character users: full character functionality
        // Personality users: need character ID for wellness stat storage
        const characterId = homeData?.userProfile?.character?.id || homeData?.character?.id || 0;

        // Equipment array: only for character users
        const equippedGear = researchCondition === "character"
          ? (homeData?.userProfile?.character?.equipped_gear || homeData?.character?.equipped_gear || [])
          : [];

        console.log(`🎯 [useStoryRewardManager] Creating StoryRewardManager:`, {
          researchCondition,
          characterId,
          userId,
          primaryTrait,
          hasEquippedGear: equippedGear.length > 0
        });

        // Initialize StoryRewardManager with dual-path support
        const manager = new StoryRewardManager(
          storyId.toString(),
          showRewardNotification,
          handleStoryCompletionWithRewards,
          apiService,
          characterId,       // Both user types: character ID for wellness stat storage
          equippedGear,      // Character users: equipment array, Personality users: []
          0,                 // storyReplayCount (future feature)
          researchCondition, // "character" | "personality"
          userId,            // Personality users: user ID for coping tool acquisition
          primaryTrait       // User's primary personality trait (for quest filtering)
        );

        console.log(`✅ [useStoryRewardManager] StoryRewardManager created successfully`);
        setRewardManager(manager);

        // Create or get story progress record
        const storyProgress = await apiService.getOrCreateStoryProgress(storyId, {
          current_passage_id: currentPassage?.passage_id || '',
          story_variables: {}
        });
      };

      initializeRewardManager();
    } else {
      console.log(`⚠️ [useStoryRewardManager] Conditions not met for initialization`);
    }
  }, [visible, storyId, chapterId, isInitialized, primaryTrait, personalityLoading, wellnessHomeData]);

  return {
    rewardManager
  };
};
