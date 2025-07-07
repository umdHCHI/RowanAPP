export function applyChoiceReward(
    choice: any,
    updateStats: (gains: any) => void,
    showNotification: (msg: string) => void
  ) {
    if (choice.rewards) {
      updateStats(choice.rewards);
      showNotification(`You gained: ${Object.keys(choice.rewards).join(", ")}`);
    }
  }
export function applyPassageRewards(
    passage: any,
    updateStats: (gains: any) => void,
    showNotification: (msg: string) => void
  ) {
    if (passage.rewards) {
      updateStats(passage.rewards);
      showNotification(`You gained: ${Object.keys(passage.rewards).join(", ")}`);
    }
  }

// Helper function to handle story completion rewards
export function handleStoryCompletionRewards(
  completionData: {
    storyId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: Record<string, number>;
    xpEarned?: number;
  },
  context: {
    apiService: any;
    onStoryComplete?: (data: any) => void;
    Alert: any;
  }
) {
  try {
    console.log('=== HANDLING STORY COMPLETION REWARDS ===');
    console.log('Completion data:', completionData);
    
    // Show completion notification with rewards
    const rewardText = [];
    if (completionData.xpEarned) {
      rewardText.push(`${completionData.xpEarned} XP`);
    }
    if (completionData.finalRewards.length > 0) {
      rewardText.push(`Items: ${completionData.finalRewards.join(', ')}`);
    }
    if (completionData.skillsLearned.length > 0) {
      rewardText.push(`Skills: ${completionData.skillsLearned.join(', ')}`);
    }
    if (Object.keys(completionData.totalStatGains).length > 0) {
      const statText = Object.entries(completionData.totalStatGains)
        .map(([stat, value]) => `+${value} ${stat}`)
        .join(', ');
      rewardText.push(`Stats: ${statText}`);
    }
    
    const rewardMessage = rewardText.length > 0 ? `\n\nRewards earned:\n${rewardText.join('\n')}` : '';
    
    context.Alert.alert(
      "🎉 Story Completed!",
      `Congratulations! You have successfully completed this story.${rewardMessage}`,
      [
        {
          text: "Continue Exploring",
          onPress: () => {
            if (context.onStoryComplete) {
              context.onStoryComplete(completionData);
            }
          }
        }
      ]
    );
    
  } catch (error) {
    console.error('Error handling story completion rewards:', error);
    context.Alert.alert(
      "Story Completed",
      "You have completed this story!",
      [{ text: "Continue", style: "default" }]
    );
  }
}
// Utility to handle template choice rewards in a reusable way
export async function applyTemplateReward(
  choiceId: string,
  reward: any,
  context: {
    setChapterRewards: (fn: (prev: any) => any) => void;
    setTotalStatGains: (fn: (prev: any) => any) => void;
    setRecentGains: (gains: any) => void;
    setShowStatGain: (show: boolean) => void;
    apiService: any;
    storyId: string | number;
    chapterId: string | number;
    copingToolMapping: Record<string, any>;
    Alert: any;
    setUnlockedArtifacts?: (fn: (prev: any) => any) => void;
    setNewArtifact?: (artifact: any) => void;
    setShowArtifactUnlock?: (show: boolean) => void;
    onArtifactUnlock?: (artifact: any) => void;
  }
) {
  // Update reward with actual coping tool ID if available
  const updatedReward = {
    ...reward,
    gear_type_id: context.copingToolMapping[choiceId] || null,
  };

  context.setChapterRewards((prev) => ({ ...prev, [choiceId]: updatedReward }));

  // Add experience to total stat gains
  context.setTotalStatGains((prev: any) => ({
    ...prev,
    Experience: (prev["Experience"] || 0) + updatedReward.experience,
  }));

  // Show reward notification
  context.setRecentGains({ Experience: updatedReward.experience });
  context.setShowStatGain(true);

  // Save rewards to backend
  try {
    await context.apiService.saveChoiceRewards(
      context.storyId,
      context.chapterId,
      { [choiceId]: updatedReward }
    );
    console.log("Successfully saved choice reward to backend");
  } catch (error) {
    console.error("Failed to save choice reward to backend:", error);
    // Continue even if backend save fails
  }

  // Acquire coping tool if gear_type_id is provided
  if (updatedReward.gear_type_id) {
    try {
      console.log("Acquiring coping tool with ID:", updatedReward.gear_type_id);
      const acquiredTool = await context.apiService.acquireCopingTool(
        updatedReward.gear_type_id
      );
      console.log("Successfully acquired coping tool:", acquiredTool);

      // Show coping tool acquisition notification
      context.Alert.alert(
        "🎁 New Coping Tool Acquired!",
        `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}`,
        [{ text: "Excellent!", style: "default" }]
      );
    } catch (error) {
      console.error("Failed to acquire coping tool:", error);
      // Still show the reward even if coping tool acquisition fails
      context.Alert.alert(
        "🎁 Reward Earned!",
        `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}\n\n(Note: Coping tool acquisition failed, but your reward has been recorded)`,
        [{ text: "Continue", style: "default" }]
      );
    }
  } else {
    // No coping tool to acquire, just show the reward
    context.Alert.alert(
      "🎁 Reward Earned!",
      `You have earned: ${updatedReward.item_name}\n\n${updatedReward.item_description}\n\n(Note: Coping tools not yet configured in backend)`,
      [{ text: "Excellent!", style: "default" }]
    );
  }
}