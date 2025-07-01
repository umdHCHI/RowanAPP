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
// Utility to handle template choice rewards in a reusable way
export async function applyTemplateReward(
  choiceId: string,
  reward: any,
  context: {
    setChapterRewards: (fn: (prev: any) => any) => void;
    setTotalStatGains: (fn: (prev: any) => any) => void;
    setRecentGains: (gains: any) => void;
    setShowStatGain: (show: boolean) => void;
    archiveService: any;
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
    await context.archiveService.saveChoiceRewards(
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
      const acquiredTool = await context.archiveService.acquireCopingTool(
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