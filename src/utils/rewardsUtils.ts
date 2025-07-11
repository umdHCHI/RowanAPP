import { Choice, Passage, SavedRewards } from '../types/story';

// ===== REWARD SYSTEM - INTEGRATED WITH EXISTING TYPES =====
// This system tracks rewards throughout the story and applies them at completion
// Works with the existing SavedRewards interface and backend data structure

export interface StoryReward {
  type: 'passage' | 'choice';
  source: string; // passage_id or choice_id
  effects: Record<string, any>; // The actual effects from backend
  timestamp: number;
}

export interface StoryRewardTracker {
  storyId: string;
  rewards: StoryReward[];
  totalStatGains: Record<string, number>;
  finalRewards: string[];
  skillsLearned: string[];
  journalEntries: string[];
}

// Initialize a new reward tracker for a story
export function initializeRewardTracker(storyId: string): StoryRewardTracker {
  return {
    storyId,
    rewards: [],
    totalStatGains: {},
    finalRewards: [],
    skillsLearned: [],
    journalEntries: []
  };
}

// Apply rewards from a passage (from story_effects field)
export function applyPassageRewards(
  tracker: StoryRewardTracker,
  passage: Passage
): StoryRewardTracker {
  if (!passage.story_effects || Object.keys(passage.story_effects).length === 0) {
    return tracker; // No rewards in this passage
  }

  const newReward: StoryReward = {
    type: 'passage',
    source: passage.passage_id,
    effects: passage.story_effects,
    timestamp: Date.now()
  };

  return {
    ...tracker,
    rewards: [...tracker.rewards, newReward]
  };
}

// Apply rewards from a choice (from effects field)
export function applyChoiceRewards(
  tracker: StoryRewardTracker,
  choice: Choice,
  passageId: string
): StoryRewardTracker {
  if (!choice.effects || Object.keys(choice.effects).length === 0) {
    return tracker; // No rewards in this choice
  }

  const newReward: StoryReward = {
    type: 'choice',
    source: `${passageId}_choice_${choice.id}`,
    effects: choice.effects,
    timestamp: Date.now()
  };

  return {
    ...tracker,
    rewards: [...tracker.rewards, newReward]
  };
}

// Calculate total rewards from all collected rewards
export function calculateTotalRewards(tracker: StoryRewardTracker): {
  totalStatGains: Record<string, number>;
  finalRewards: string[];
  skillsLearned: string[];
  journalEntries: string[];
} {
  const totalStatGains: Record<string, number> = {};
  const finalRewards: string[] = [];
  const skillsLearned: string[] = [];
  const journalEntries: string[] = [];

  // Process all rewards
  tracker.rewards.forEach(reward => {
    const effects = reward.effects;

    // Handle stat gains (excluding experience as it's handled separately)
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([stat, value]) => {
        // Skip experience as it's handled separately to avoid double-counting
        if (stat === 'experience') return;
        
        const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          totalStatGains[stat] = (totalStatGains[stat] || 0) + numValue;
        }
      });
    }

    // Handle experience (direct or from stats)
    let experienceGain = 0;
    
    // Check for experience directly in effects
    if (effects.experience) {
      const expValue = typeof effects.experience === 'number' 
        ? effects.experience 
        : parseInt(effects.experience as string, 10);
      if (!isNaN(expValue)) {
        experienceGain += expValue;
      }
    }
    
    // Check for experience in stats (only if not already counted from direct field)
    if (effects.stats && effects.stats.experience && effects.experience === undefined) {
      const expValue = typeof effects.stats.experience === 'number' 
        ? effects.stats.experience 
        : parseInt(effects.stats.experience as string, 10);
      if (!isNaN(expValue)) {
        experienceGain += expValue;
      }
    }
    
    // Add total experience gain
    if (experienceGain > 0) {
      totalStatGains.experience = (totalStatGains.experience || 0) + experienceGain;
    }

    // Handle items/rewards
    if (effects.rewards) {
      if (Array.isArray(effects.rewards)) {
        finalRewards.push(...effects.rewards);
      } else if (typeof effects.rewards === 'string') {
        finalRewards.push(effects.rewards);
      }
    }

    // Handle skills
    if (effects.skills) {
      if (Array.isArray(effects.skills)) {
        skillsLearned.push(...effects.skills);
      } else if (typeof effects.skills === 'string') {
        skillsLearned.push(effects.skills);
      }
    }

    // Handle journal entries
    if (effects.journal_entry) {
      journalEntries.push(effects.journal_entry);
    }

    // Handle artifacts
    if (effects.artifacts) {
      if (Array.isArray(effects.artifacts)) {
        finalRewards.push(...effects.artifacts);
      } else if (typeof effects.artifacts === 'string') {
        finalRewards.push(effects.artifacts);
      }
    }

    // Handle wellness stats
    if (effects.wellness) {
      Object.entries(effects.wellness).forEach(([wellnessStat, value]) => {
        const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          totalStatGains[`wellness_${wellnessStat}`] = (totalStatGains[`wellness_${wellnessStat}`] || 0) + numValue;
        }
      });
    }
  });

  return {
    totalStatGains,
    finalRewards: [...new Set(finalRewards)], // Remove duplicates
    skillsLearned: [...new Set(skillsLearned)], // Remove duplicates
    journalEntries: [...new Set(journalEntries)] // Remove duplicates
  };
}

// Handle story completion rewards - integrates with SavedRewards
export function handleStoryCompletionRewards(
  tracker: StoryRewardTracker,
  currentSavedRewards: SavedRewards
): {
  updatedSavedRewards: SavedRewards;
  completionData: {
    storyId: string;
    finalRewards: string[];
    skillsLearned: string[];
    totalStatGains: Record<string, number>;
    journalEntries: string[];
  };
} {
  const calculatedRewards = calculateTotalRewards(tracker);

  // Update SavedRewards with new gains
  const updatedSavedRewards: SavedRewards = {
    ...currentSavedRewards,
    // Update character stats if they exist
    characterStats: currentSavedRewards.characterStats?.map(character => ({
      ...character,
      // Apply stat gains to character
      ...calculatedRewards.totalStatGains
    })),
    // Update experience
    totalExperience: (currentSavedRewards.totalExperience || 0) + (calculatedRewards.totalStatGains.experience || 0),
    // Update wellness stats
    wellnessStats: {
      ...currentSavedRewards.wellnessStats,
      ...calculatedRewards.totalStatGains
    },
    // Update story progress
    storiesCompleted: (currentSavedRewards.storiesCompleted || 0) + 1
  };

  return {
    updatedSavedRewards,
    completionData: {
      storyId: tracker.storyId,
      finalRewards: calculatedRewards.finalRewards,
      skillsLearned: calculatedRewards.skillsLearned,
      totalStatGains: calculatedRewards.totalStatGains,
      journalEntries: calculatedRewards.journalEntries
    }
  };
}

// Helper function to check if a passage has rewards
export function hasPassageRewards(passage: Passage): boolean {
  return !!(passage.story_effects && Object.keys(passage.story_effects).length > 0);
}

// Helper function to check if a choice has rewards
export function hasChoiceRewards(choice: Choice): boolean {
  return !!(choice.effects && Object.keys(choice.effects).length > 0);
}

// Helper function to get reward summary for UI display
export function getRewardSummary(tracker: StoryRewardTracker): {
  totalRewards: number;
  totalStatGains: number;
  totalSkills: number;
  totalJournalEntries: number;
} {
  const calculatedRewards = calculateTotalRewards(tracker);
  
  return {
    totalRewards: calculatedRewards.finalRewards.length,
    totalStatGains: Object.keys(calculatedRewards.totalStatGains).length,
    totalSkills: calculatedRewards.skillsLearned.length,
    totalJournalEntries: calculatedRewards.journalEntries.length
  };
}

// Helper function to format rewards for display
export function formatRewardsForDisplay(tracker: StoryRewardTracker): {
  statGains: Array<{ stat: string; value: number }>;
  items: string[];
  skills: string[];
  journalEntries: string[];
} {
  const calculatedRewards = calculateTotalRewards(tracker);
  
  return {
    statGains: Object.entries(calculatedRewards.totalStatGains).map(([stat, value]) => ({
      stat,
      value
    })),
    items: calculatedRewards.finalRewards,
    skills: calculatedRewards.skillsLearned,
    journalEntries: calculatedRewards.journalEntries
  };
}

// Helper function to create notification messages from effects
export function createNotificationFromEffects(effects: Record<string, any>): Array<{
  message: string;
  type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
}> {
  const notifications: Array<{
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
  }> = [];

  // Handle experience (direct or from stats)
  let experienceGain = 0;
  
  // Check for experience directly in effects
  if (effects.experience) {
    const expValue = typeof effects.experience === 'number' 
      ? effects.experience 
      : parseInt(effects.experience as string, 10);
    if (!isNaN(expValue) && expValue > 0) {
      experienceGain += expValue;
    }
  }
  
  // Check for experience in stats (only if not already counted from direct field)
  if (effects.stats && effects.stats.experience && effects.experience === undefined) {
    const expValue = typeof effects.stats.experience === 'number' 
      ? effects.stats.experience 
      : parseInt(effects.stats.experience as string, 10);
    if (!isNaN(expValue) && expValue > 0) {
      experienceGain += expValue;
    }
  }
  
  // Add experience notification
  if (experienceGain > 0) {
    notifications.push({
      message: `+${experienceGain} Experience`,
      type: 'experience'
    });
  }

  // Handle stats (exclude experience as it's handled separately)
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([stat, value]) => {
      // Skip experience as it's handled separately
      if (stat === 'experience') return;
      
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        notifications.push({
          message: `+${numValue} ${stat.charAt(0).toUpperCase() + stat.slice(1)}`,
          type: 'stat'
        });
      }
    });
  }

  // Handle items/rewards
  if (effects.rewards) {
    if (Array.isArray(effects.rewards)) {
      effects.rewards.forEach((reward: string) => {
        notifications.push({
          message: `Gained ${reward}`,
          type: 'item'
        });
      });
    } else if (typeof effects.rewards === 'string') {
      notifications.push({
        message: `Gained ${effects.rewards}`,
        type: 'item'
      });
    }
  }

  // Handle skills
  if (effects.skills) {
    if (Array.isArray(effects.skills)) {
      effects.skills.forEach((skill: string) => {
        notifications.push({
          message: `Learned ${skill}`,
          type: 'skill'
        });
      });
    } else if (typeof effects.skills === 'string') {
      notifications.push({
        message: `Learned ${effects.skills}`,
        type: 'skill'
      });
    }
  }

  // Handle artifacts
  if (effects.artifacts) {
    if (Array.isArray(effects.artifacts)) {
      effects.artifacts.forEach((artifact: string) => {
        notifications.push({
          message: `Found ${artifact}`,
          type: 'artifact'
        });
      });
    } else if (typeof effects.artifacts === 'string') {
      notifications.push({
        message: `Found ${effects.artifacts}`,
        type: 'artifact'
      });
    }
  }

  return notifications;
}