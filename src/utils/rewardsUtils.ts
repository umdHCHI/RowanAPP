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
  // Check for story_effects first (primary source for passage rewards)
  if (passage.story_effects && Object.keys(passage.story_effects).length > 0) {
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
  
  // Check for effects field (fallback format)
  if (passage.effects && Object.keys(passage.effects).length > 0) {
    const newReward: StoryReward = {
      type: 'passage',
      source: passage.passage_id,
      effects: passage.effects,
      timestamp: Date.now()
    };

    return {
      ...tracker,
      rewards: [...tracker.rewards, newReward]
    };
  }
  
  return tracker; // No rewards in this passage
}

// Apply rewards from a choice (secondary source - only if no passage rewards)
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

    // Handle direct stat gains from story_effects (new format)
    // These are direct stat values like awareness: 2, connection: 1, experience: 10
    Object.entries(effects).forEach(([key, value]) => {
      // Skip non-stat fields
      if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness'].includes(key)) {
        return;
      }
      
      // Handle direct stat values (awareness, connection, experience, etc.)
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        totalStatGains[key] = (totalStatGains[key] || 0) + numValue;
      }
    });

    // Handle legacy stats object format
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
  return !!(
    (passage.story_effects && Object.keys(passage.story_effects).length > 0) ||
    (passage.effects && Object.keys(passage.effects).length > 0)
  );
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
  console.log('=== CREATING NOTIFICATIONS FROM EFFECTS ===');
  console.log('Effects object:', effects);
  console.log('Effects type:', typeof effects);
  console.log('Effects keys:', effects ? Object.keys(effects) : 'No effects');
  const notifications: Array<{
    message: string;
    type: 'experience' | 'item' | 'skill' | 'stat' | 'artifact';
  }> = [];

  // Handle direct stat gains from story_effects (new format)
  // These are direct stat values like awareness: 2, connection: 1, experience: 10
  Object.entries(effects).forEach(([key, value]) => {
    // Skip non-stat fields
    if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness'].includes(key)) {
      return;
    }
    
    // Handle direct stat values (awareness, connection, experience, etc.)
    const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
    if (!isNaN(numValue) && numValue > 0) {
      if (key === 'experience') {
        notifications.push({
          message: `+${numValue} Experience`,
          type: 'experience'
        });
      } else {
        notifications.push({
          message: `+${numValue} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
          type: 'stat'
        });
      }
    }
  });

  // Handle experience (direct or from stats) - legacy format
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
  
  // Add experience notification (only if not already added above)
  if (experienceGain > 0 && !notifications.some(n => n.type === 'experience')) {
    notifications.push({
      message: `+${experienceGain} Experience`,
      type: 'experience'
    });
  }

  // Handle stats (exclude experience as it's handled separately) - legacy format
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

// Debug function to test reward detection
export function debugRewardDetection(passage: Passage, choice?: Choice): void {
  console.log('=== DEBUGGING REWARD DETECTION ===');
  console.log('Passage ID:', passage.passage_id);
  console.log('Passage story_effects:', passage.story_effects);
  console.log('Passage effects:', passage.effects);
  console.log('Has passage rewards:', hasPassageRewards(passage));
  
  if (choice) {
    console.log('Choice ID:', choice.id);
    console.log('Choice effects:', choice.effects);
    console.log('Has choice rewards:', hasChoiceRewards(choice));
  }
  
  // Test notification creation
  if (passage.story_effects) {
    console.log('Testing story_effects notifications:');
    const storyNotifications = createNotificationFromEffects(passage.story_effects);
    console.log('Story notifications:', storyNotifications);
  }
  
  if (passage.effects) {
    console.log('Testing effects notifications:');
    const effectsNotifications = createNotificationFromEffects(passage.effects);
    console.log('Effects notifications:', effectsNotifications);
  }
  
  if (choice && choice.effects) {
    console.log('Testing choice notifications:');
    const choiceNotifications = createNotificationFromEffects(choice.effects);
    console.log('Choice notifications:', choiceNotifications);
  }
  
  console.log('=== END DEBUGGING ===');
}

// Test function for the new story_effects format
export function testNewRewardFormat(): void {
  console.log('=== TESTING NEW REWARD FORMAT ===');
  
  // Test passage with new story_effects format
  const testPassage: Passage = {
    id: 1,
    chapter: 1,
    passage_id: "test-passage-1",
    content: "Test passage content",
    passage_type: "narration",
    speaker: null,
    required_conditions: {},
    story_effects: {
      awareness: 2,
      connection: 1,
      experience: 10
    },
    mood: "",
    background_music: "",
    background_image: null,
    order: 1,
    choices: []
  };
  
  console.log('Test passage:', testPassage);
  
  // Test reward detection
  console.log('Has passage rewards:', hasPassageRewards(testPassage));
  
  // Test notification creation
  const notifications = createNotificationFromEffects(testPassage.story_effects);
  console.log('Notifications created:', notifications);
  
  // Test reward tracker
  const tracker = initializeRewardTracker("test-story");
  const updatedTracker = applyPassageRewards(tracker, testPassage);
  console.log('Updated tracker:', updatedTracker);
  
  // Test total rewards calculation
  const totalRewards = calculateTotalRewards(updatedTracker);
  console.log('Total rewards:', totalRewards);
  
  console.log('=== END TESTING NEW REWARD FORMAT ===');
}

// Reward system for journal entries and activities
export interface JournalReward {
  experience: number;
  wellnessStats: {
    awareness?: number;
    resilience?: number;
    connection?: number;
    balance?: number;
  };
  message: string;
}

export interface RewardResult {
  success: boolean;
  rewards: JournalReward;
  newLevel?: number;
  levelsGained?: number;
  error?: string;
}

// Calculate rewards based on entry type and skill category
export const calculateJournalRewards = (
  entryType: 'journal' | 'draw' | 'voice',
  skillCategory: string,
  difficulty: string = 'Beginner'
): JournalReward => {
  // Base experience for completing any journal entry
  let baseExperience = 50;
  
  // Bonus experience based on entry type
  const typeBonuses = {
    journal: 0,    // Base type
    draw: 25,      // Drawing is more creative
    voice: 30      // Voice recording is more personal
  };
  
  // Bonus experience based on difficulty
  const difficultyBonuses = {
    'Beginner': 0,
    'Intermediate': 25,
    'Advanced': 50
  };
  
  // Skill category bonuses - using correct backend wellness attribute names
  const skillBonuses: Record<string, { exp: number; awareness?: number; resilience?: number; connection?: number; balance?: number }> = {
    'Self-Compassion': { exp: 20, awareness: 2, resilience: 1 },
    'Social Connection': { exp: 15, connection: 2, awareness: 1 },
    'Stress Management': { exp: 25, resilience: 2, balance: 1 },
    'Emotional Awareness': { exp: 30, awareness: 3, connection: 1 },
    'Personal Growth': { exp: 35, balance: 2, awareness: 1 }
  };
  
  const skillBonus = skillBonuses[skillCategory] || { exp: 10, awareness: 1 };
  
  const totalExperience = baseExperience + 
    typeBonuses[entryType] + 
    difficultyBonuses[difficulty as keyof typeof difficultyBonuses] + 
    skillBonus.exp;
  
  // Generate wellness stat gains
  const wellnessStats: JournalReward['wellnessStats'] = {};
  
  // Base wellness gains for completing any entry
  wellnessStats.awareness = (wellnessStats.awareness || 0) + 1;
  
  // Add skill-specific wellness gains
  if (skillBonus.awareness) wellnessStats.awareness += skillBonus.awareness;
  if (skillBonus.resilience) wellnessStats.resilience = skillBonus.resilience;
  if (skillBonus.connection) wellnessStats.connection = skillBonus.connection;
  if (skillBonus.balance) wellnessStats.balance = skillBonus.balance;
  
  // Generate reward message
  const messages = {
    journal: "📝 Reflection recorded!",
    draw: "🎨 Creative expression captured!",
    voice: "🎤 Voice memo saved!"
  };
  
  const baseMessage = messages[entryType];
  const skillMessage = `Your ${skillCategory} practice grows stronger.`;
  
  return {
    experience: totalExperience,
    wellnessStats,
    message: `${baseMessage} ${skillMessage}`
  };
};

// Calculate level progression
export const calculateLevelProgress = (
  currentExperience: number,
  experienceGained: number
): { newLevel: number; levelsGained: number; experienceNeeded: number } => {
  const baseExperienceNeeded = 1000;
  const currentLevel = Math.floor(currentExperience / baseExperienceNeeded) + 1;
  const newTotalExperience = currentExperience + experienceGained;
  const newLevel = Math.floor(newTotalExperience / baseExperienceNeeded) + 1;
  const levelsGained = newLevel - currentLevel;
  const experienceNeeded = baseExperienceNeeded - (newTotalExperience % baseExperienceNeeded);
  
  return {
    newLevel,
    levelsGained,
    experienceNeeded
  };
};

// Format reward message for display
export const formatRewardMessage = (reward: JournalReward, levelsGained: number = 0): string => {
  let message = reward.message;
  
  if (reward.experience > 0) {
    message += `\n\n✨ +${reward.experience} Experience`;
  }
  
  if (levelsGained > 0) {
    message += `\n🎉 Level Up! You gained ${levelsGained} level${levelsGained > 1 ? 's' : ''}!`;
  }
  
  // Add wellness stat gains
  const wellnessGains = [];
  if (reward.wellnessStats.awareness) wellnessGains.push(`Awareness +${reward.wellnessStats.awareness}`);
  if (reward.wellnessStats.resilience) wellnessGains.push(`Resilience +${reward.wellnessStats.resilience}`);
  if (reward.wellnessStats.connection) wellnessGains.push(`Connection +${reward.wellnessStats.connection}`);
  if (reward.wellnessStats.balance) wellnessGains.push(`Balance +${reward.wellnessStats.balance}`);
  
  if (wellnessGains.length > 0) {
    message += `\n💪 ${wellnessGains.join(', ')}`;
  }
  
  return message;
};