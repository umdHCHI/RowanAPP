import { CopingTools } from '../types/personality';
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
  questProgress: Record<string, number>; // e.g., {"neuroticism_1": 1, "openness_2": 2}
}

// Helper function to determine reward type based on research condition
export const getRewardType = (researchCondition: "character" | "personality"): "experience" | "resonance" => {
  return researchCondition === "character" ? "resonance" : "experience";
};

// Helper function to get the appropriate reward field name
export const getRewardFieldName = (researchCondition: "character" | "personality"): string => {
  return getRewardType(researchCondition);
};

// Initialize a new reward tracker for a story
export function initializeRewardTracker(storyId: string): StoryRewardTracker {
  return {
    storyId,
    rewards: [],
    totalStatGains: {},
    finalRewards: [],
    skillsLearned: [],
    journalEntries: [],
    questProgress: {}
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
export function calculateTotalRewards(
  tracker: StoryRewardTracker, 
  researchCondition: "character" | "personality" = "personality"
): {
  totalStatGains: Record<string, number>;
  finalRewards: string[];
  skillsLearned: string[];
  journalEntries: string[];
  questProgress: Record<string, number>;
} {
  const totalStatGains: Record<string, number> = {};
  const finalRewards: string[] = [];
  const skillsLearned: string[] = [];
  const journalEntries: string[] = [];
  const questProgress: Record<string, number> = {};
  
  // Determine reward type based on research condition
  const rewardType = getRewardType(researchCondition);
  const rewardFieldName = getRewardFieldName(researchCondition);

  // Process all rewards
  tracker.rewards.forEach(reward => {
    const effects = reward.effects;

    // Handle direct stat gains from story_effects (new format)
    // These are direct stat values like awareness: 2, connection: 1, experience: 10, resonance: 10
    Object.entries(effects).forEach(([key, value]) => {
      // Skip non-stat fields
      if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness', 'quests'].includes(key)) {
        return;
      }
      
      // Handle direct stat values (awareness, connection, experience, resonance, etc.)
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        totalStatGains[key] = (totalStatGains[key] || 0) + numValue;
      }
    });

    // Handle legacy stats object format
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([stat, value]) => {
        // Skip experience/resonance as it's handled separately to avoid double-counting
        if (stat === 'experience' || stat === 'resonance') return;
        
        const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          totalStatGains[stat] = (totalStatGains[stat] || 0) + numValue;
        }
      });
    }

    // Handle experience/resonance (direct or from stats)
    let rewardGain = 0;
    
    // Check for reward directly in effects
    if (effects[rewardFieldName]) {
      const rewardValue = typeof effects[rewardFieldName] === 'number' 
        ? effects[rewardFieldName] 
        : parseInt(effects[rewardFieldName] as string, 10);
      if (!isNaN(rewardValue)) {
        rewardGain += rewardValue;
      }
    }
    
    // Check for reward in stats (only if not already counted from direct field)
    if (effects.stats && effects.stats[rewardFieldName] && effects[rewardFieldName] === undefined) {
      const rewardValue = typeof effects.stats[rewardFieldName] === 'number' 
        ? effects.stats[rewardFieldName] 
        : parseInt(effects.stats[rewardFieldName] as string, 10);
      if (!isNaN(rewardValue)) {
        rewardGain += rewardValue;
      }
    }
    
    // Add total reward gain
    if (rewardGain > 0) {
      totalStatGains[rewardFieldName] = (totalStatGains[rewardFieldName] || 0) + rewardGain;
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

    // Handle quest progress (for both character and personality users)
    // Support both legacy 'quests' field and new 'quest_progress' field
    if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
      effects.quest_progress.forEach((questId: string) => {
        questProgress[questId] = (questProgress[questId] || 0) + 1;
      });
    } else if (effects.quests) {
      // Legacy support for character users
      if (Array.isArray(effects.quests)) {
        effects.quests.forEach((questId: string) => {
          questProgress[questId] = (questProgress[questId] || 0) + 1;
        });
      } else if (typeof effects.quests === 'string') {
        questProgress[effects.quests] = (questProgress[effects.quests] || 0) + 1;
      }
    }
  });

  return {
    totalStatGains,
    finalRewards: [...new Set(finalRewards)], // Remove duplicates
    skillsLearned: [...new Set(skillsLearned)], // Remove duplicates
    journalEntries: [...new Set(journalEntries)], // Remove duplicates
    questProgress
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
    questProgress: Record<string, number>;
    experienceGained: number;
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
      journalEntries: calculatedRewards.journalEntries,
      questProgress: calculatedRewards.questProgress,
      experienceGained: calculatedRewards.totalStatGains.experience || 0
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
  const hasRewards = !!(choice.effects && Object.keys(choice.effects).length > 0);
  return hasRewards;
}

// Helper function to get reward summary for UI display
export function getRewardSummary(tracker: StoryRewardTracker): {
  totalRewards: number;
  totalStatGains: number;
  totalSkills: number;
  totalJournalEntries: number;
  totalQuestProgress: number;
} {
  const calculatedRewards = calculateTotalRewards(tracker);
  
  return {
    totalRewards: calculatedRewards.finalRewards.length,
    totalStatGains: Object.keys(calculatedRewards.totalStatGains).length,
    totalSkills: calculatedRewards.skillsLearned.length,
    totalJournalEntries: calculatedRewards.journalEntries.length,
    totalQuestProgress: Object.keys(calculatedRewards.questProgress).length
  };
}

// Helper function to format rewards for display
export function formatRewardsForDisplay(tracker: StoryRewardTracker): {
  statGains: Array<{ stat: string; value: number }>;
  items: string[];
  skills: string[];
  journalEntries: string[];
  questProgress: Array<{ questId: string; progress: number }>;
} {
  const calculatedRewards = calculateTotalRewards(tracker);
  
  return {
    statGains: Object.entries(calculatedRewards.totalStatGains).map(([stat, value]) => ({
      stat,
      value
    })),
    items: calculatedRewards.finalRewards,
    skills: calculatedRewards.skillsLearned,
    journalEntries: calculatedRewards.journalEntries,
    questProgress: Object.entries(calculatedRewards.questProgress).map(([questId, progress]) => ({
      questId,
      progress
    }))
  };
}

// Helper function to create notification messages from effects
export function createNotificationFromEffects(
  effects: Record<string, any>, 
  researchCondition: "character" | "personality" = "personality"
): Array<{
  message: string;
  type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'quest';
}> {
  const notifications: Array<{
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'quest';
  }> = [];

  // Map stat names to frontend display names
  const statDisplayNames: Record<string, string> = {
    'awareness': 'Exploration',
    'resilience': 'Courage', 
    'connection': 'Connection',
    'balance': 'Fear'
  };

  // Determine reward type based on research condition
  const rewardType = getRewardType(researchCondition);
  const rewardFieldName = getRewardFieldName(researchCondition);

  // Handle direct stat gains from story_effects (new format)
  // These are direct stat values like awareness: 2, connection: 1, experience: 10, resonance: 10
  Object.entries(effects).forEach(([key, value]) => {
    // Skip non-stat fields
    if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness'].includes(key)) {
      return;
    }
    
    // Handle direct stat values (awareness, connection, experience, resonance, etc.)
    const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
    if (!isNaN(numValue) && numValue > 0) {
      if (key === 'experience' || key === 'resonance') {
        const rewardLabel = key === 'experience' ? 'Experience' : 'Resonance';
        notifications.push({
          message: `+${numValue} ${rewardLabel}`,
          type: key as 'experience' | 'resonance'
        });
      } else {
        // Use mapped display name if available, otherwise capitalize the stat name
        const displayName = statDisplayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat'
        });
      }
    }
  });

  // Handle experience/resonance (direct or from stats) - legacy format
  // Only process if reward wasn't already handled in the direct stat processing above
  let rewardGain = 0;
  
  // Check for reward in stats (only if not already counted from direct field)
  if (effects.stats && effects.stats[rewardFieldName] && effects[rewardFieldName] === undefined) {
    const rewardValue = typeof effects.stats[rewardFieldName] === 'number' 
      ? effects.stats[rewardFieldName] 
      : parseInt(effects.stats[rewardFieldName] as string, 10);
    if (!isNaN(rewardValue) && rewardValue > 0) {
      rewardGain += rewardValue;
    }
  }
  
  // Add reward notification (only if not already added above)
  if (rewardGain > 0 && !notifications.some(n => n.type === rewardType)) {
    const rewardLabel = rewardType === 'experience' ? 'Experience' : 'Resonance';
    notifications.push({
      message: `+${rewardGain} ${rewardLabel}`,
      type: rewardType
    });
  }

  // Handle stats (exclude experience as it's handled separately) - legacy format
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([stat, value]) => {
      // Skip experience as it's handled separately
      if (stat === 'experience') return;
      
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        // Use mapped display name if available, otherwise capitalize the stat name
        const displayName = statDisplayNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat'
        });
      }
    });
  }

  // Handle items/rewards - Convert to coping tools for personality users
  if (effects.rewards) {
    if (Array.isArray(effects.rewards)) {
      effects.rewards.forEach((reward: string) => {
        if (researchCondition === "personality") {
          // For personality users, try to convert equipment to coping tools
          // This will be handled by the frontend notification system
          // Just create a generic notification that will be converted later
          notifications.push({
            message: `Acquired ${reward}`,
            type: 'item'
          });
        } else {
          // For character users, show traditional equipment
          notifications.push({
            message: `Gained ${reward}`,
            type: 'item'
          });
        }
      });
    } else if (typeof effects.rewards === 'string') {
      if (researchCondition === "personality") {
        notifications.push({
          message: `Acquired ${effects.rewards}`,
          type: 'item'
        });
      } else {
        notifications.push({
          message: `Gained ${effects.rewards}`,
          type: 'item'
        });
      }
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

  // Handle artifacts - Convert to coping tools for personality users
  if (effects.artifacts) {
    if (Array.isArray(effects.artifacts)) {
      effects.artifacts.forEach((artifact: string) => {
        if (researchCondition === "personality") {
          // For personality users, artifacts become coping tools
          notifications.push({
            message: `Acquired ${artifact}`,
            type: 'item'
          });
        } else {
          // For character users, show traditional artifacts
          notifications.push({
            message: `Found ${artifact}`,
            type: 'artifact'
          });
        }
      });
    } else if (typeof effects.artifacts === 'string') {
      if (researchCondition === "personality") {
        notifications.push({
          message: `Acquired ${effects.artifacts}`,
          type: 'item'
        });
      } else {
        notifications.push({
          message: `Found ${effects.artifacts}`,
          type: 'artifact'
        });
      }
    }
  }

      // Handle quest progress (for both character and personality users)
  // Support both legacy 'quests' field and new 'quest_progress' field
  if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
    effects.quest_progress.forEach((questId: string) => {
      // We don't need the full quest title here, just a generic message.
      // The main quest log will show the updated numbers.
      notifications.push({
        message: 'Quest Progress Updated!',
        type: 'quest'
      });
    });
  } else if (effects.quests) {
    // Legacy support for character users
    if (Array.isArray(effects.quests)) {
      effects.quests.forEach((questId: string) => {
        const questInfo = getQuestInfo(questId);
        if (questInfo) {
          notifications.push({
            message: `🎯 Quest Progress: ${questInfo.title}`,
            type: 'quest'
          });
        } else {
          notifications.push({
            message: `🎯 Quest Progress: ${questId}`,
            type: 'quest'
          });
        }
      });
    } else if (typeof effects.quests === 'string') {
      const questInfo = getQuestInfo(effects.quests);
      if (questInfo) {
        notifications.push({
          message: `🎯 Quest Progress: ${questInfo.title}`,
          type: 'quest'
        });
      } else {
        notifications.push({
          message: `🎯 Quest Progress: ${effects.quests}`,
          type: 'quest'
        });
      }
    }
  }

  return notifications;
}

// Debug function to test reward detection
export function debugRewardDetection(passage: Passage, choice?: Choice): void {
  const passageHasRewards = hasPassageRewards(passage);
  
  if (choice) {
    const choiceHasRewards = hasChoiceRewards(choice);
  }
  
  // Test notification creation
  if (passage.story_effects) {
    const storyNotifications = createNotificationFromEffects(passage.story_effects);
  }
  
  if (passage.effects) {
    const effectsNotifications = createNotificationFromEffects(passage.effects);
  }
  
  if (choice && choice.effects) {
    const choiceNotifications = createNotificationFromEffects(choice.effects);
  }
}

// Test function for the new story_effects format
export function testNewRewardFormat(): void {
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
  
  // Test reward detection
  const hasRewards = hasPassageRewards(testPassage);
  
  // Test notification creation
  const notifications = createNotificationFromEffects(testPassage.story_effects);
  
  // Test reward tracker
  const tracker = initializeRewardTracker("test-story");
  const updatedTracker = applyPassageRewards(tracker, testPassage);
  
  // Test total rewards calculation
  const totalRewards = calculateTotalRewards(updatedTracker);
}

// Comprehensive list of available equipment items for rewards - UPDATED TO MATCH BACKEND
export const AVAILABLE_EQUIPMENT_ITEMS = {
  // Focus Items (Weapons)
  focus: [
    "Ancient Scroll",
    "Lens of Gentle Seeing",
    "Notebook of the Wanderer",
    "Compass of Quiet Knowing"
  ],
  
  // Comfort Layers (Armor)
  comfort: [
    "Cloak of True Form",
    "Wrap of Rooted Memory",
    "Shield of Flexible Boundaries"
  ],
  
  // Mind Shields (Helmets)
  shield: [
    "Mask of Discernment",
    "Crown of Becoming",
    "Helm of the Unmasked"
  ],
  
  // Ground Stones (Boots)
  ground: [
    "Foundation of Inner Stone",
    "Roots of Connection",
    "Stone of Self-Compassion"
  ]
};

// Helper function to get random equipment reward
export const getRandomEquipmentReward = (category?: keyof typeof AVAILABLE_EQUIPMENT_ITEMS): string => {
  if (category) {
    const items = AVAILABLE_EQUIPMENT_ITEMS[category];
    return items[Math.floor(Math.random() * items.length)];
  }
  
  // Get random category
  const categories = Object.keys(AVAILABLE_EQUIPMENT_ITEMS) as (keyof typeof AVAILABLE_EQUIPMENT_ITEMS)[];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const items = AVAILABLE_EQUIPMENT_ITEMS[randomCategory];
  
  return items[Math.floor(Math.random() * items.length)];
};

// Helper function to get equipment reward by story theme
export const getEquipmentRewardByTheme = (theme: string): string => {
  const themeLower = theme.toLowerCase();
  
  if (themeLower.includes('meditation') || themeLower.includes('focus') || themeLower.includes('stillness')) {
    return getRandomEquipmentReward('focus');
  }
  
  if (themeLower.includes('social') || themeLower.includes('comfort') || themeLower.includes('protection')) {
    return getRandomEquipmentReward('comfort');
  }
  
  if (themeLower.includes('boundary') || themeLower.includes('shield') || themeLower.includes('protection')) {
    return getRandomEquipmentReward('shield');
  }
  
  if (themeLower.includes('ground') || themeLower.includes('exercise') || themeLower.includes('movement')) {
    return getRandomEquipmentReward('ground');
  }
  
  if (themeLower.includes('combat') || themeLower.includes('battle') || themeLower.includes('warrior')) {
    return getRandomEquipmentReward('focus'); // Default to focus for combat themes
  }
  
  // Default to focus items
  return getRandomEquipmentReward('focus');
};

// Test function for the new story_effects format with items and skills
export function testStoryEffectsWithItems(): void {
  // Test passage with comprehensive story_effects
  const testPassage: Passage = {
    id: 1,
    chapter: 1,
    passage_id: "test-passage-with-items",
    content: "You find an ancient scroll and learn a new skill!",
    passage_type: "narration",
    speaker: null,
    required_conditions: {},
    story_effects: {
      awareness: 2,
      connection: 1,
      experience: 15,
      rewards: ["Ancient Scroll"],
      skills: ["Meditation Mastery"]
    },
    mood: "",
    background_music: "",
    background_image: null,
    order: 1,
    choices: []
  };
  
  // Test reward detection
  const hasRewards = hasPassageRewards(testPassage);
  
  // Test notification creation
  const notifications = createNotificationFromEffects(testPassage.story_effects);
  
  // Test reward tracker
  const tracker = initializeRewardTracker("test-story-with-items");
  const updatedTracker = applyPassageRewards(tracker, testPassage);
  
  // Test total rewards calculation
  const totalRewards = calculateTotalRewards(updatedTracker);
}

// Test function for choice rewards (based on the actual log data)
export function testChoiceRewards(): void {
  // Test choice with the exact data from the logs
  const testChoice: Choice = {
    id: 586,
    passage: 49,
    text: "Who are you?",
    target_id: "8fde25ff-095a-411b-8fbc-95ab834d6fda",
    target_passage_id: "",
    next_passage: null,
    next_passage_id: "",
    choice_type: "normal",
    requirements: {},
    effects: {
      experience: 10,
      rewards: ["Ancient Scroll"],
      stats: {
        awareness: 2
      }
    },
    success_passage_id: "",
    failure_passage_id: "",
    required_conditions: {},
    order: 0
  };
  
  // Test reward detection
  const hasRewards = hasChoiceRewards(testChoice);
  
  // Test notification creation
  const notifications = createNotificationFromEffects(testChoice.effects);
  
  // Test reward tracker
  const tracker = initializeRewardTracker("test-choice-story");
  const updatedTracker = applyChoiceRewards(tracker, testChoice, "test-passage-id");
  
  // Test total rewards calculation
  const totalRewards = calculateTotalRewards(updatedTracker);
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

// Mini-game reward system for ThoughtDefender
export interface ThoughtDefenderReward {
  experience: number;
  wellnessStats: {
    exploration?: number; // Maps to backend 'awareness'
    courage?: number;     // Maps to backend 'resilience'
    connection?: number;  // Maps to backend 'connection'
    fear?: number;        // Maps to backend 'balance'
  };
  foundationGains: {
    'Sight Beyond Sight'?: number;
    'Unbreakable Will'?: number;
    'Heart\'s Compass'?: number;
    'Elemental Harmony'?: number;
  };
  message: string;
  difficulty: string;
  performance: {
    score: number;
    level: number;
    thoughtsCleared: number;
    accuracy: number;
    survivalTime: number;
  };
}

export interface ThoughtDefenderResult {
  success: boolean;
  rewards: ThoughtDefenderReward;
  newLevel?: number;
  levelsGained?: number;
  error?: string;
}

// Calculate rewards for ThoughtDefender mini-game
export const calculateThoughtDefenderRewards = (
  score: number,
  level: number,
  won: boolean,
  difficulty: string,
  thoughtsCleared: number,
  totalThoughts: number,
  survivalTime: number // in seconds
): ThoughtDefenderReward => {
  // Base experience calculation - MUCH LOWER
  let baseExperience = 25; // Base for completing a game (was 100)
  
  // Difficulty multipliers - REDUCED
  const difficultyMultipliers = {
    'zen': 0.8,
    'normal': 1.0,
    'intense': 1.2,
    'nightmare': 1.5
  };
  
  const difficultyMultiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;
  
  // Performance bonuses - REDUCED
  const scoreBonus = Math.floor(score / 200) * 5; // 5 exp per 200 points (was 10 per 100)
  const levelBonus = level * 10; // 10 exp per level reached (was 25)
  const winBonus = won ? 50 : 15; // Smaller bonus for winning (was 200/50)
  const accuracy = totalThoughts > 0 ? (thoughtsCleared / totalThoughts) * 100 : 0;
  const accuracyBonus = Math.floor(accuracy / 20) * 3; // 3 exp per 20% accuracy (was 5 per 10%)
  
  // Survival time bonus (longer survival = more exp) - REDUCED
  const timeBonus = Math.floor(survivalTime / 60) * 8; // 8 exp per 60 seconds (was 15 per 30)
  
  const totalExperience = Math.floor(
    (baseExperience + scoreBonus + levelBonus + winBonus + accuracyBonus + timeBonus) * difficultyMultiplier
  );
  
  // Wellness stat gains based on performance - MAPPED TO BACKEND NAMES
  const wellnessStats: ThoughtDefenderReward['wellnessStats'] = {};
  
  // Calculate base performance metrics
  const performanceScore = (accuracy * 0.4) + (survivalTime / 10) + (won ? 50 : 0);
  
  // Map to backend wellness attribute names
  // Frontend -> Backend mapping:
  // exploration -> awareness
  // courage -> resilience  
  // connection -> connection
  // fear -> balance
  
  // Exploration (Awareness): Based on accuracy and quick thinking
  // Can gain or lose based on performance
  const explorationGain = Math.floor(accuracy / 15) - (accuracy < 30 ? 1 : 0);
  wellnessStats.exploration = Math.max(-2, Math.min(3, explorationGain)); // Cap at -2 to +3
  
  // Courage (Resilience): Based on survival time and difficulty
  // Rewards persistence, penalizes quick losses
  const courageGain = Math.floor(survivalTime / 60) + (difficultyMultiplier > 1.2 ? 1 : 0) - (survivalTime < 30 ? 1 : 0);
  wellnessStats.courage = Math.max(-1, Math.min(3, courageGain)); // Cap at -1 to +3
  
  // Connection: Based on positive thoughts cleared
  // Always positive, but amount varies
  const connectionGain = Math.max(0, Math.floor(thoughtsCleared / 8));
  wellnessStats.connection = Math.min(2, connectionGain); // Cap at +2
  
  // Fear (Balance): Based on consistent performance
  // Can gain or lose based on consistency
  const fearGain = Math.floor((accuracy + (won ? 30 : -10)) / 20);
  wellnessStats.fear = Math.max(-1, Math.min(2, fearGain)); // Cap at -1 to +2
  
  // Foundation attribute gains
  const foundationGains: ThoughtDefenderReward['foundationGains'] = {};
  
  // Sight Beyond Sight: Based on accuracy and quick thinking
  if (accuracy > 70) {
    foundationGains['Sight Beyond Sight'] = Math.floor(accuracy / 25);
  }
  
  // Unbreakable Will: Based on difficulty and survival
  if (difficultyMultiplier > 1.5 || survivalTime > 120) {
    foundationGains['Unbreakable Will'] = Math.floor(survivalTime / 60) + (won ? 1 : 0);
  }
  
  // Heart's Compass: Based on positive thoughts and connection
  if (thoughtsCleared > 20) {
    foundationGains['Heart\'s Compass'] = Math.floor(thoughtsCleared / 15);
  }
  
  // Elemental Harmony: Based on balanced performance
  if (accuracy > 60 && survivalTime > 60) {
    foundationGains['Elemental Harmony'] = Math.floor((accuracy + survivalTime / 10) / 30);
  }
  
  // Generate reward message
  let message = won ? "🏆 Mind Defense Victory!" : "⚡ Mind Defense Complete!";
  message += `\n\nScore: ${score} | Level: ${level} | Accuracy: ${accuracy.toFixed(1)}%`;
  
  if (totalExperience > 200) {
    message += "\n\n✨ Exceptional performance!";
  } else if (totalExperience > 150) {
    message += "\n\n🌟 Great job!";
  } else {
    message += "\n\n💪 Keep practicing!";
  }
  
  return {
    experience: totalExperience,
    wellnessStats,
    foundationGains,
    message,
    difficulty,
    performance: {
      score,
      level,
      thoughtsCleared,
      accuracy,
      survivalTime
    }
  };
};

// Calculate level progression for mini-game rewards
export const calculateMiniGameLevelProgress = (
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

// Format ThoughtDefender reward message for display
export const formatThoughtDefenderRewardMessage = (
  reward: ThoughtDefenderReward, 
  levelsGained: number = 0
): string => {
  let message = reward.message;
  
  if (reward.experience > 0) {
    message += `\n\n✨ +${reward.experience} Experience`;
  }
  
  if (levelsGained > 0) {
    message += `\n🎉 Level Up! You gained ${levelsGained} level${levelsGained > 1 ? 's' : ''}!`;
  }
  
  // Add wellness stat gains (can be positive or negative)
  const wellnessGains = [];
  if (reward.wellnessStats.exploration !== undefined) {
    const sign = reward.wellnessStats.exploration >= 0 ? '+' : '';
    wellnessGains.push(`Exploration ${sign}${reward.wellnessStats.exploration}`);
  }
  if (reward.wellnessStats.courage !== undefined) {
    const sign = reward.wellnessStats.courage >= 0 ? '+' : '';
    wellnessGains.push(`Courage ${sign}${reward.wellnessStats.courage}`);
  }
  if (reward.wellnessStats.connection !== undefined) {
    const sign = reward.wellnessStats.connection >= 0 ? '+' : '';
    wellnessGains.push(`Connection ${sign}${reward.wellnessStats.connection}`);
  }
  if (reward.wellnessStats.fear !== undefined) {
    const sign = reward.wellnessStats.fear >= 0 ? '+' : '';
    wellnessGains.push(`Fear ${sign}${reward.wellnessStats.fear}`);
  }
  
  if (wellnessGains.length > 0) {
    message += `\n💪 ${wellnessGains.join(', ')}`;
  }
  
  // Add foundation attribute gains
  const foundationGains = [];
  if (reward.foundationGains['Sight Beyond Sight']) {
    foundationGains.push(`Sight Beyond Sight +${reward.foundationGains['Sight Beyond Sight']}`);
  }
  if (reward.foundationGains['Unbreakable Will']) {
    foundationGains.push(`Unbreakable Will +${reward.foundationGains['Unbreakable Will']}`);
  }
  if (reward.foundationGains['Heart\'s Compass']) {
    foundationGains.push(`Heart's Compass +${reward.foundationGains['Heart\'s Compass']}`);
  }
  if (reward.foundationGains['Elemental Harmony']) {
    foundationGains.push(`Elemental Harmony +${reward.foundationGains['Elemental Harmony']}`);
  }
  
  if (foundationGains.length > 0) {
    message += `\n🔮 ${foundationGains.join(', ')}`;
  }
  
  return message;
};

// Process ThoughtDefender completion and return structured result
export const processThoughtDefenderCompletion = (
  score: number,
  level: number,
  won: boolean,
  difficulty: string,
  thoughtsCleared: number,
  totalThoughts: number,
  survivalTime: number,
  currentExperience: number = 0
): ThoughtDefenderResult => {
  try {
    const rewards = calculateThoughtDefenderRewards(
      score,
      level,
      won,
      difficulty,
      thoughtsCleared,
      totalThoughts,
      survivalTime
    );
    
    const levelProgress = calculateMiniGameLevelProgress(currentExperience, rewards.experience);
    
    return {
      success: true,
      rewards,
      newLevel: levelProgress.newLevel,
      levelsGained: levelProgress.levelsGained
    };
  } catch (error) {
    return {
      success: false,
      rewards: {
        experience: 0,
        wellnessStats: {},
        foundationGains: {},
        message: "Error calculating rewards",
        difficulty,
        performance: {
          score,
          level,
          thoughtsCleared,
          accuracy: 0,
          survivalTime
        }
      },
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

// Create notifications from ThoughtDefender rewards
export const createThoughtDefenderNotifications = (
  reward: ThoughtDefenderReward
): Array<{
  message: string;
  type: 'experience' | 'wellness' | 'foundation' | 'achievement';
}> => {
  const notifications: Array<{
    message: string;
    type: 'experience' | 'wellness' | 'foundation' | 'achievement';
  }> = [];
  
  // Experience notification
  if (reward.experience > 0) {
    notifications.push({
      message: `+${reward.experience} Experience`,
      type: 'experience'
    });
  }
  
  // Wellness stat notifications (can be positive or negative)
  Object.entries(reward.wellnessStats).forEach(([stat, value]) => {
    if (value !== undefined && value !== 0) {
      const sign = value >= 0 ? '+' : '';
      notifications.push({
        message: `${stat.charAt(0).toUpperCase() + stat.slice(1)} ${sign}${value}`,
        type: 'wellness'
      });
    }
  });
  
  // Foundation attribute notifications
  Object.entries(reward.foundationGains).forEach(([foundation, value]) => {
    if (value && value > 0) {
      notifications.push({
        message: `${foundation} +${value}`,
        type: 'foundation'
      });
    }
  });
  
  // Achievement notification for high scores
  if (reward.performance.score > 1000) {
    notifications.push({
      message: "🏆 High Score Achievement!",
      type: 'achievement'
    });
  }
  
  return notifications;
};

// Test function for ThoughtDefender rewards
export function testThoughtDefenderRewards(): void {
  // Test different scenarios
  const testScenarios = [
    {
      name: "Beginner Win",
      score: 500,
      level: 3,
      won: true,
      difficulty: "Beginner",
      thoughtsCleared: 25,
      totalThoughts: 30,
      survivalTime: 180
    },
    {
      name: "Expert Loss",
      score: 1200,
      level: 5,
      won: false,
      difficulty: "Expert",
      thoughtsCleared: 40,
      totalThoughts: 50,
      survivalTime: 300
    },
    {
      name: "Master Victory",
      score: 2500,
      level: 8,
      won: true,
      difficulty: "Master",
      thoughtsCleared: 60,
      totalThoughts: 65,
      survivalTime: 600
    },
    {
      name: "Poor Performance",
      score: 100,
      level: 1,
      won: false,
      difficulty: "Beginner",
      thoughtsCleared: 5,
      totalThoughts: 20,
      survivalTime: 15
    },
    {
      name: "Mixed Performance",
      score: 800,
      level: 4,
      won: false,
      difficulty: "Advanced",
      thoughtsCleared: 30,
      totalThoughts: 45,
      survivalTime: 120
    }
  ];
  
  testScenarios.forEach(scenario => {
    const result = processThoughtDefenderCompletion(
      scenario.score,
      scenario.level,
      scenario.won,
      scenario.difficulty,
      scenario.thoughtsCleared,
      scenario.totalThoughts,
      scenario.survivalTime
    );
    
    const formattedMessage = formatThoughtDefenderRewardMessage(result.rewards, result.levelsGained || 0);
    const notifications = createThoughtDefenderNotifications(result.rewards);
  });
}

// ===== EQUIPMENT UPGRADE SYSTEM =====
// This system handles duplicate items by upgrading them instead of skipping
// Provides motivation for replaying stories with enhanced rewards

export interface EquipmentUpgrade {
  itemName: string;
  currentLevel: number;
  newLevel: number;
  statBonus: number;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  upgradeMessage: string;
}

export interface UpgradedEquipmentReward {
  originalItem: string;
  upgradedItem: string;
  upgrade: EquipmentUpgrade;
  isUpgrade: boolean;
}

// Equipment upgrade tiers and progression
export const EQUIPMENT_UPGRADE_TIERS = {
  Common: {
    maxLevel: 3,
    statBonusPerLevel: 1,
    upgradeChance: 0.8, // 80% chance to upgrade on replay
    nextRarity: "Rare" as const
  },
  Rare: {
    maxLevel: 5,
    statBonusPerLevel: 2,
    upgradeChance: 0.6, // 60% chance to upgrade on replay
    nextRarity: "Epic" as const
  },
  Epic: {
    maxLevel: 7,
    statBonusPerLevel: 3,
    upgradeChance: 0.4, // 40% chance to upgrade on replay
    nextRarity: "Legendary" as const
  },
  Legendary: {
    maxLevel: 10,
    statBonusPerLevel: 5,
    upgradeChance: 0.2, // 20% chance to upgrade on replay
    nextRarity: "Legendary" as const // Stays legendary
  }
};

// Equipment base stats and upgrade paths - UPDATED TO MATCH BACKEND GEAR TYPES
export const EQUIPMENT_BASE_STATS: Record<string, {
  baseStats: Record<string, number>;
  upgradePaths: string[];
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  backendId: number; // Add backend gear type ID
}> = {
  // Focus Items (Weapons)
  "Ancient Scroll": {
    baseStats: { mindfulness: 1, focus: 1 },
    upgradePaths: ["Enhanced Ancient Scroll", "Master Ancient Scroll", "Transcendent Ancient Scroll"],
    rarity: "Common",
    backendId: 1
  },
  "Lens of Gentle Seeing": {
    baseStats: { mindfulness: 2, focus: 2 },
    upgradePaths: ["Enhanced Lens of Gentle Seeing", "Master Lens of Gentle Seeing", "Transcendent Lens of Gentle Seeing"],
    rarity: "Rare",
    backendId: 2
  },
  "Notebook of the Wanderer": {
    baseStats: { focus: 1, resilience: 1, organization: 1 },
    upgradePaths: ["Enhanced Notebook of the Wanderer", "Master Notebook of the Wanderer", "Transcendent Notebook of the Wanderer"],
    rarity: "Common",
    backendId: 3
  },
  "Compass of Quiet Knowing": {
    baseStats: { mindfulness: 1, resilience: 1, empathy: 1 },
    upgradePaths: ["Enhanced Compass of Quiet Knowing", "Master Compass of Quiet Knowing", "Transcendent Compass of Quiet Knowing"],
    rarity: "Rare",
    backendId: 4
  },
  
  // Comfort Items (Armor)
  "Cloak of True Form": {
    baseStats: { resilience: 2, empathy: 1 },
    upgradePaths: ["Enhanced Cloak of True Form", "Master Cloak of True Form", "Transcendent Cloak of True Form"],
    rarity: "Rare",
    backendId: 5
  },
  "Wrap of Rooted Memory": {
    baseStats: { resilience: 1, empathy: 3 },
    upgradePaths: ["Enhanced Wrap of Rooted Memory", "Master Wrap of Rooted Memory", "Transcendent Wrap of Rooted Memory"],
    rarity: "Epic",
    backendId: 6
  },
  "Shield of Flexible Boundaries": {
    baseStats: { confidence: 1, resilience: 2, organization: 1 },
    upgradePaths: ["Enhanced Shield of Flexible Boundaries", "Master Shield of Flexible Boundaries", "Transcendent Shield of Flexible Boundaries"],
    rarity: "Rare",
    backendId: 7
  },
  
  // Mind Shields (Helmets)
  "Mask of Discernment": {
    baseStats: { mindfulness: 1, confidence: 1, resilience: 1 },
    upgradePaths: ["Enhanced Mask of Discernment", "Master Mask of Discernment", "Transcendent Mask of Discernment"],
    rarity: "Common",
    backendId: 8
  },
  "Crown of Becoming": {
    baseStats: { confidence: 3, resilience: 1 },
    upgradePaths: ["Enhanced Crown of Becoming", "Master Crown of Becoming", "Transcendent Crown of Becoming"],
    rarity: "Epic",
    backendId: 9
  },
  "Helm of the Unmasked": {
    baseStats: { confidence: 2, resilience: 2 },
    upgradePaths: ["Enhanced Helm of the Unmasked", "Master Helm of the Unmasked", "Transcendent Helm of the Unmasked"],
    rarity: "Rare",
    backendId: 10
  },
  
  // Ground Stones (Boots)
  "Foundation of Inner Stone": {
    baseStats: { mindfulness: 2, organization: 1 },
    upgradePaths: ["Enhanced Foundation of Inner Stone", "Master Foundation of Inner Stone", "Transcendent Foundation of Inner Stone"],
    rarity: "Rare",
    backendId: 11
  },
  "Roots of Connection": {
    baseStats: { resilience: 1, empathy: 3 },
    upgradePaths: ["Enhanced Roots of Connection", "Master Roots of Connection", "Transcendent Roots of Connection"],
    rarity: "Epic",
    backendId: 12
  },
  "Stone of Self-Compassion": {
    baseStats: { mindfulness: 1, confidence: 1, resilience: 2 },
    upgradePaths: ["Enhanced Stone of Self-Compassion", "Master Stone of Self-Compassion", "Transcendent Stone of Self-Compassion"],
    rarity: "Rare",
    backendId: 13
  }
};

// Backend gear type mapping for easy lookup
export const BACKEND_GEAR_MAPPING: Record<string, number> = {
  // Focus Items (Weapons)
  "Ancient Scroll": 1,
  "Lens of Gentle Seeing": 2,
  "Notebook of the Wanderer": 3,
  "Compass of Quiet Knowing": 4,
  
  // Comfort Items (Armor)
  "Cloak of True Form": 5,
  "Wrap of Rooted Memory": 6,
  "Shield of Flexible Boundaries": 7,
  
  // Mind Shields (Helmets)
  "Mask of Discernment": 8,
  "Crown of Becoming": 9,
  "Helm of the Unmasked": 10,
  
  // Ground Stones (Boots)
  "Foundation of Inner Stone": 11,
  "Roots of Connection": 12,
  "Stone of Self-Compassion": 13
};

// Enhanced function to get backend gear type ID
export const getBackendGearTypeId = (itemName: string): number | null => {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    if (normalizedName === name.toLowerCase()) {
      return id;
    }
  }
  
  // Check for partial matches (for upgraded versions)
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    if (normalizedName.includes(name.toLowerCase()) || 
        name.toLowerCase().includes(normalizedName)) {
      return id;
    }
  }
  
  // Check for base item names in upgraded versions
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    const baseName = name.toLowerCase();
    if (normalizedName.includes(baseName)) {
      return id;
    }
  }
  
  return null;
};

// Check if player already has an item and determine upgrade path
export function checkItemOwnershipAndUpgrade(
  itemName: string,
  playerInventory: string[],
  storyReplayCount: number = 0
): UpgradedEquipmentReward | null {
  const normalizedItemName = itemName.toLowerCase().trim();
  
  // Check if player already has this exact item
  const hasExactItem = playerInventory.some(invItem => 
    invItem.toLowerCase().trim() === normalizedItemName
  );
  
  if (!hasExactItem) {
    // Player doesn't have this item, return as new item
    return {
      originalItem: itemName,
      upgradedItem: itemName,
      upgrade: {
        itemName,
        currentLevel: 0,
        newLevel: 1,
        statBonus: 0,
        rarity: "Common",
        upgradeMessage: "New item acquired!"
      },
      isUpgrade: false
    };
  }
  
  // Player has the item, check for upgrade opportunities
  const baseItem = findBaseItem(itemName);
  if (!baseItem) {
    // Unknown item, can't upgrade
    return null;
  }
  
  const { rarity, upgradePaths } = baseItem;
  const tierConfig = EQUIPMENT_UPGRADE_TIERS[rarity];
  
  // Calculate upgrade chance based on replay count and rarity
  const baseUpgradeChance = tierConfig.upgradeChance;
  const replayBonus = Math.min(storyReplayCount * 0.1, 0.3); // Max 30% bonus from replays
  const totalUpgradeChance = Math.min(baseUpgradeChance + replayBonus, 0.95);
  
  // Roll for upgrade
  if (Math.random() > totalUpgradeChance) {
    // No upgrade this time, but provide a small stat boost
    return {
      originalItem: itemName,
      upgradedItem: itemName,
      upgrade: {
        itemName,
        currentLevel: 1,
        newLevel: 1,
        statBonus: 1, // Small stat boost for replaying
        rarity,
        upgradeMessage: `Item strengthened through repeated use! (+1 to all stats)`
      },
      isUpgrade: false
    };
  }
  
  // Determine upgrade level based on current item and replay count
  const currentLevel = determineCurrentLevel(itemName, playerInventory);
  const maxLevel = tierConfig.maxLevel;
  const newLevel = Math.min(currentLevel + 1, maxLevel);
  
  if (newLevel === currentLevel && newLevel === maxLevel) {
    // Item is at max level, check for rarity upgrade
    if (rarity !== "Legendary") {
      const nextRarity = tierConfig.nextRarity;
      const upgradedItemName = generateUpgradedItemName(itemName, nextRarity);
      
      return {
        originalItem: itemName,
        upgradedItem: upgradedItemName,
        upgrade: {
          itemName: upgradedItemName,
          currentLevel: 1,
          newLevel: 1,
          statBonus: tierConfig.statBonusPerLevel,
          rarity: nextRarity,
          upgradeMessage: `Item transcended to ${nextRarity} rarity!`
        },
        isUpgrade: true
      };
    } else {
      // Legendary item at max level, provide significant stat boost
      return {
        originalItem: itemName,
        upgradedItem: itemName,
        upgrade: {
          itemName,
          currentLevel: currentLevel,
          newLevel: currentLevel,
          statBonus: 5, // Significant stat boost for legendary items
          rarity,
          upgradeMessage: `Legendary item empowered through mastery! (+5 to all stats)`
        },
        isUpgrade: false
      };
    }
  }
  
  // Regular level upgrade
  const upgradedItemName = generateUpgradedItemName(itemName, rarity, newLevel);
  const statBonus = tierConfig.statBonusPerLevel * newLevel;
  
  return {
    originalItem: itemName,
    upgradedItem: upgradedItemName,
    upgrade: {
      itemName: upgradedItemName,
      currentLevel,
      newLevel,
      statBonus,
      rarity,
      upgradeMessage: `Item upgraded to level ${newLevel}! (+${statBonus} to all stats)`
    },
    isUpgrade: true
  };
}

// Find the base item configuration
function findBaseItem(itemName: string) {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Check for exact matches first
  for (const [baseName, config] of Object.entries(EQUIPMENT_BASE_STATS)) {
    if (normalizedName === baseName.toLowerCase()) {
      return { ...config, baseName };
    }
  }
  
  // Check for upgraded versions
  for (const [baseName, config] of Object.entries(EQUIPMENT_BASE_STATS)) {
    if (normalizedName.includes(baseName.toLowerCase()) || 
        baseName.toLowerCase().includes(normalizedName)) {
      return { ...config, baseName };
    }
  }
  
  return null;
}

// Determine current level of an item based on inventory
function determineCurrentLevel(itemName: string, playerInventory: string[]): number {
  const normalizedName = itemName.toLowerCase().trim();
  
  // Check for level indicators in the item name
  if (normalizedName.includes('enhanced')) return 2;
  if (normalizedName.includes('master')) return 3;
  if (normalizedName.includes('transcendent')) return 4;
  if (normalizedName.includes('legendary')) return 5;
  
  // Check for numbered versions
  const levelMatch = normalizedName.match(/level\s*(\d+)/i) || 
                    normalizedName.match(/tier\s*(\d+)/i) ||
                    normalizedName.match(/(\d+)/);
  
  if (levelMatch) {
    return parseInt(levelMatch[1], 10);
  }
  
  // Default to level 1 for base items
  return 1;
}

// Generate upgraded item name
function generateUpgradedItemName(baseName: string, rarity: string, level?: number): string {
  const baseItem = findBaseItem(baseName);
  if (!baseItem) return baseName;
  
  const { upgradePaths } = baseItem;
  
  if (level && level <= upgradePaths.length) {
    return upgradePaths[level - 1];
  }
  
  // Generate based on rarity
  switch (rarity) {
    case "Rare":
      return `Enhanced ${baseName}`;
    case "Epic":
      return `Master ${baseName}`;
    case "Legendary":
      return `Transcendent ${baseName}`;
    default:
      return baseName;
  }
}

// Enhanced random equipment reward that considers player inventory and replay count
export const getUpgradedRandomEquipmentReward = (
  playerInventory: string[],
  storyReplayCount: number = 0,
  category?: keyof typeof AVAILABLE_EQUIPMENT_ITEMS
): UpgradedEquipmentReward | null => {
  // Get base random item
  const baseItem = getRandomEquipmentReward(category);
  
  // Check for upgrade opportunities
  return checkItemOwnershipAndUpgrade(baseItem, playerInventory, storyReplayCount);
};

// Enhanced theme-based equipment reward with upgrade system
export const getUpgradedEquipmentRewardByTheme = (
  theme: string,
  playerInventory: string[],
  storyReplayCount: number = 0
): UpgradedEquipmentReward | null => {
  const baseItem = getEquipmentRewardByTheme(theme);
  return checkItemOwnershipAndUpgrade(baseItem, playerInventory, storyReplayCount);
};

// Get rarity colors for upgraded items
export const getRarityColors = (rarity: "Common" | "Rare" | "Epic" | "Legendary"): string[] => {
  // Normalize rarity to handle both uppercase and lowercase inputs
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  
  switch (normalizedRarity) {
    case "Common":
      return ["#9d9d9d", "#c0c0c0"]; // Gray to light gray
    case "Rare":
      return ["#0070dd", "#4fc3f7"]; // Blue to light blue
    case "Epic":
      return ["#a335ee", "#e1bee7"]; // Purple to light purple
    case "Legendary":
      return ["#ff8000", "#ffd54f"]; // Orange to gold
    default:
      return ["#9d9d9d", "#c0c0c0"];
  }
};

// Create upgrade notification
export const createUpgradeNotification = (upgrade: EquipmentUpgrade): {
  message: string;
  type: 'upgrade' | 'strengthen' | 'new';
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
} => {
  if (upgrade.currentLevel === 0) {
    return {
      message: `Acquired ${upgrade.itemName}!`,
      type: 'new',
      rarity: upgrade.rarity
    };
  }
  
  if (upgrade.currentLevel === upgrade.newLevel) {
    return {
      message: upgrade.upgradeMessage,
      type: 'strengthen',
      rarity: upgrade.rarity
    };
  }
  
  return {
    message: upgrade.upgradeMessage,
    type: 'upgrade',
    rarity: upgrade.rarity
  };
};

// ===== DEMONSTRATION AND TESTING =====

// Example usage of the upgrade system
export const demonstrateUpgradeSystem = () => {
  
  // Simulate player inventory
  const playerInventory = [
    'Ancient Scroll',
    'Lens of Gentle Seeing',
    'Cloak of True Form'
  ];
  
  
  // Test different scenarios
  const testScenarios = [
    { item: 'Ancient Scroll', replayCount: 0 }, // New item
    { item: 'Scroll of Stillness', replayCount: 1 }, // Upgrade existing
    { item: 'Magic Wand', replayCount: 2 }, // Multiple replays
    { item: 'Unknown Item', replayCount: 0 }, // Unknown item
  ];
  
  testScenarios.forEach(({ item, replayCount }) => {
    
    const result = checkItemOwnershipAndUpgrade(item, playerInventory, replayCount);
    
    if (result) {
      console.log({
        originalItem: result.originalItem,
        upgradedItem: result.upgradedItem,
        isUpgrade: result.isUpgrade,
        upgrade: {
          currentLevel: result.upgrade.currentLevel,
          newLevel: result.upgrade.newLevel,
          statBonus: result.upgrade.statBonus,
          rarity: result.upgrade.rarity,
          message: result.upgrade.upgradeMessage
        }
      });
      
      // Show notification example
      const notification = createUpgradeNotification(result.upgrade);
      
      // Show rarity colors
      const colors = getRarityColors(result.upgrade.rarity);
    } else {
      console.log(`No upgrade available for ${item} with ${replayCount} replays`);
    }
  });
  
};

// Test function for random equipment rewards with upgrades
export const testRandomEquipmentRewards = (playerInventory: string[], replayCount: number = 0) => {
  
  // Test different categories
  const categories = ['focus', 'comfort', 'shield', 'ground'] as const;
  
  categories.forEach(category => {
    
    const result = getUpgradedRandomEquipmentReward(playerInventory, replayCount, category);
    
    if (result) {
      console.log({
        originalItem: result.originalItem,
        upgradedItem: result.upgradedItem,
        isUpgrade: result.isUpgrade,
        upgrade: {
          currentLevel: result.upgrade.currentLevel,
          newLevel: result.upgrade.newLevel,
          statBonus: result.upgrade.statBonus,
          rarity: result.upgrade.rarity,
          message: result.upgrade.upgradeMessage
        }
      });
    } else {
      console.log(`No random equipment available for category ${category} with ${replayCount} replays`);
    }
  });
  
};

// ===== QUEST REWARD SYSTEM FOR PERSONALITY USERS =====

import { PersonalityQuests } from '../types/personality';

// Interface for quest progress tracking
export interface QuestProgress {
  questId: string;
  currentProgress: number;
  totalRequired: number;
  isCompleted: boolean;
  questTitle: string;
  questDescription: string;
  questReward: string;
}

// Get quest information by ID
export const getQuestInfo = (questId: string) => {
  for (const [personalityType, quests] of Object.entries(PersonalityQuests)) {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      return {
        ...quest,
        personalityType
      };
    }
  }
  return null;
};

// Calculate quest progress for a personality type
export const calculateQuestProgress = (
  questProgress: Record<string, number>,
  personalityType: string
): QuestProgress[] => {
  const personalityQuests = PersonalityQuests[personalityType as keyof typeof PersonalityQuests] || [];
  
  return personalityQuests.map(quest => {
    const currentProgress = questProgress[quest.id] || 0;
    const isCompleted = currentProgress >= quest.total;
    
    return {
      questId: quest.id,
      currentProgress,
      totalRequired: quest.total,
      isCompleted,
      questTitle: quest.title,
      questDescription: quest.description,
      questReward: quest.reward
    };
  });
};

// Check if a quest was completed in this story
export const checkQuestCompletion = (
  previousProgress: Record<string, number>,
  newProgress: Record<string, number>
): string[] => {
  const completedQuests: string[] = [];
  
  Object.entries(newProgress).forEach(([questId, newValue]) => {
    const previousValue = previousProgress[questId] || 0;
    const questInfo = getQuestInfo(questId);
    
    if (questInfo && newValue >= questInfo.total && previousValue < questInfo.total) {
      completedQuests.push(questId);
    }
  });
  
  return completedQuests;
};

// Create quest completion notifications
export const createQuestNotifications = (
  completedQuests: string[]
): Array<{
  message: string;
  type: 'quest' | 'achievement';
  questId: string;
}> => {
  return completedQuests.map(questId => {
    const questInfo = getQuestInfo(questId);
    if (questInfo) {
      return {
        message: `🎯 Quest Complete: ${questInfo.title}! You earned: ${questInfo.reward}`,
        type: 'quest' as const,
        questId
      };
    }
    return {
      message: `🎯 Quest Complete: ${questId}`,
      type: 'quest' as const,
      questId
    };
  });
};

// Get random quest reward for a personality type
export const getRandomQuestReward = (personalityType: string): string | null => {
  const personalityQuests = PersonalityQuests[personalityType as keyof typeof PersonalityQuests];
  if (!personalityQuests) {
    return null;
  }
  
  const randomQuest = personalityQuests[Math.floor(Math.random() * personalityQuests.length)];
  return randomQuest.id;
};

// Get ALL quest IDs from a personality type (theme = personality type)
export const getQuestRewardByTheme = (theme: string, personalityType: string): string[] => {
  const personalityQuests = PersonalityQuests[personalityType as keyof typeof PersonalityQuests];
  if (!personalityQuests) {
    return [];
  }
  
  // Return all quest IDs from this personality type
  return personalityQuests.map(quest => quest.id);
};

// Helper function to get all quest IDs for a personality type
export const getAllQuestIds = (personalityType: string): string[] => {
  const personalityQuests = PersonalityQuests[personalityType as keyof typeof PersonalityQuests];
  if (!personalityQuests) {
    return [];
  }
  
  return personalityQuests.map(quest => quest.id);
};

// Test quest reward system
export function testQuestRewards() {
  
  // Test quest info retrieval
  
  // Test quest progress calculation
  const testProgress = {
    'neuroticism_1': 5,
    'neuroticism_2': 3,
    'openness_1': 2
  };
  
  
  // Test quest completion detection
  const previousProgress = { 'neuroticism_1': 13 };
  const newProgress = { 'neuroticism_1': 14, 'neuroticism_2': 7 };
  
  
  // Test notifications
  const completedQuests = ['neuroticism_1', 'neuroticism_2'];
  
  // Test random quest rewards
  
  // Test theme-based quest rewards
}

// Test the new quest progress detection for personality players
export function testPersonalityQuestProgressDetection() {
  
  // Test effects with new quest_progress field
  const personalityEffects = {
    experience: 10,
    awareness: 2,
    quest_progress: ['neuroticism_1', 'neuroticism_2'],
    skills: ['Deep Breathing', 'Mindful Observation']
  };
  
  
  // Test notification creation
  const notifications = createNotificationFromEffects(personalityEffects, 'personality');
  
  // Test reward tracker
  const tracker = initializeRewardTracker('test-story-1');
  
  // Test reward calculation
  const mockPassage = {
    passage_id: 'test-passage-1',
    story_effects: personalityEffects
  } as any;
  
  const updatedTracker = applyPassageRewards(tracker, mockPassage);
  
  const totalRewards = calculateTotalRewards(updatedTracker, 'personality');
  
  // Test reward summary
  const summary = getRewardSummary(updatedTracker);
  
  // Test reward formatting
  const formatted = formatRewardsForDisplay(updatedTracker);
  
  // Test legacy effects (character users)
  const characterEffects = {
    experience: 15,
    quests: ['main_quest_1', 'side_quest_2']
  };
  
  const characterNotifications = createNotificationFromEffects(characterEffects, 'character');
}

// Test function to verify gear acquisition and equipping process
export async function testGearAcquisitionAndEquipping(apiService: any, characterId: number): Promise<void> {
  
  try {
    // Test 1: Get available gear types
    const gearTypes = await apiService.get('gearTypes');
    
    // Test 2: Get current gear
    const myGear = await apiService.getMyGear();
    
    // Test 3: Get equipped gear
    const equippedGear = await apiService.getEquippedGear();
    
    // Test 4: Try to acquire a gear item
    if (gearTypes && gearTypes.length > 0) {
      const firstGearType = gearTypes[0];
      
      try {
        const acquiredGear = await apiService.acquireGear(firstGearType.id);
        
        // Test 5: Try to equip the acquired gear
        try {
          const equipResult = await apiService.equipGear(acquiredGear.id);
        } catch (equipError: any) {
          console.log({
            message: equipError.message,
            status: equipError.response?.status,
            data: equipError.response?.data,
            url: equipError.config?.url
          });
        }
      } catch (acquireError: any) {
        console.log({
          message: acquireError.message,
          status: acquireError.response?.status,
          data: acquireError.response?.data,
          url: acquireError.config?.url
        });
      }
    } else {
      console.log('No reward to acquire');
    }
    
  } catch (error: any) {
    console.log({
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
  }
  
}

// Test function to demonstrate the complete quest progress system
export function testCompleteQuestProgressSystem(): void {
  // Test 1: Story effects with quest progress
  const storyEffects = {
    "stats": { "awareness": 2 },
    "quests": ["neuroticism_1"],
    "experience": 10
  };
  
  // Test reward detection
  const hasRewards = hasPassageRewards({ story_effects: storyEffects } as any);
  
  // Test notification creation
  const notifications = createNotificationFromEffects(storyEffects, 'personality');
  
  // Test reward tracker
  const tracker = initializeRewardTracker("test-story-1");
  const mockPassage = { passage_id: 'test-passage-1', story_effects: storyEffects } as any;
  const updatedTracker = applyPassageRewards(tracker, mockPassage);
  
  // Test total rewards calculation
  const totalRewards = calculateTotalRewards(updatedTracker, 'personality');
  
  // Test 2: Choice effects with quest progress
  const choiceEffects = {
    "experience": 5,
    "quest_progress": ["openness_2", "conscientiousness_1"]
  };
  
  // Test choice reward detection
  const hasChoiceRewardsResult = hasChoiceRewards({ effects: choiceEffects } as any);
  
  // Test choice notifications
  const choiceNotifications = createNotificationFromEffects(choiceEffects, 'personality');
  
  // Test choice reward tracker
  const choiceTracker = applyChoiceRewards(updatedTracker, { effects: choiceEffects } as any, 'test-passage-1');
  
  // Test final total rewards
  const finalRewards = calculateTotalRewards(choiceTracker, 'personality');
  
  // Test 3: Quest progress display
  const questProgress = finalRewards.questProgress;
  
  // Test quest info retrieval
  const neuroticismQuest = getQuestInfo('neuroticism_1');
  const opennessQuest = getQuestInfo('openness_2');
  
  // Test quest progress calculation
  const neuroticismProgress = calculateQuestProgress(questProgress, 'Neuroticism');
  const opennessProgress = calculateQuestProgress(questProgress, 'Openness');
  
  // Test 4: Quest completion detection
  const previousProgress = {};
  const newProgress = questProgress;
  const completedQuests = checkQuestCompletion(previousProgress, newProgress);
  
  // Test quest completion notifications
  const completionNotifications = createQuestNotifications(completedQuests);
}

// Simple test function to verify quest progress saving and loading
export function testQuestProgressSaving(): void {
  // Simulate quest progress data
  const questProgress = {
    neuroticism_1: 2,
    openness_2: 1,
    conscientiousness_1: 1
  };
  
  // Simulate backend payload
  const backendPayload = {
    story_id: 'quest_progress',
    passage_id: 'quest_update',
    story_variables: {
      event: 'quest_progress_update',
      quest_progress: questProgress,
      timestamp: new Date().toISOString()
    },
    player_state: {
      quest_progress: questProgress
    }
  };
  
  // Simulate extraction
  const mockRecords = [backendPayload];
  const extracted: Record<string, number> = {};
  
  mockRecords.forEach((record: any) => {
    if (record.story_variables?.event === 'quest_progress_update') {
      const questData = record.story_variables.quest_progress;
      if (questData && typeof questData === 'object') {
        Object.entries(questData).forEach(([questId, progressValue]) => {
          const numValue = typeof progressValue === 'number' ? progressValue : parseInt(progressValue as string, 10);
          if (!isNaN(numValue)) {
            extracted[questId] = (extracted[questId] || 0) + numValue;
          }
        });
      }
    }
  });
  
  const extractedQuestProgress = extracted;
}

// Example showing how quest completion works with the new make_choice approach
export function demonstrateQuestCompletionFlow(): void {
  // Example 1: Story passage with quest completion
  const storyPassageWithQuest = {
    passage_id: "quest-completion-passage",
    content: "You have successfully found the ancient keystone!",
    story_effects: {
      "stats": { "awareness": 2 },
      "quests": ["neuroticism_1"],
      "experience": 10
    }
  };
  
  
  // Example 2: Choice with quest completion
  const choiceWithQuest = {
    id: 123,
    text: "Accept the challenge",
    effects: {
      "experience": 5,
      "quest_progress": ["openness_2", "conscientiousness_1"]
    }
  };
  
  
  // Example 3: Expected make_choice payload
  const expectedPayload = {
    story_id: 7,
    target_passage_id: "quest-completion-passage",
    choice_text: "quest_completed",
    story_variables: {
      event: "quest_completed",
      quest_id: "neuroticism_1",
      quest_title: "Emotional Awareness Challenge",
      reward: {
        xp: 10,
        items: []
      }
    },
    player_state: {
      experience: 150,
      level: 2
    }
  };
  
  
  // Example 4: Quest progress extraction
  const playerProgressRecords = [
    {
      id: 1,
      story_variables: {
        event: "quest_completed",
        quest_id: "neuroticism_1"
      }
    },
    {
      id: 2,
      story_variables: {
        event: "quest_completed",
        quest_id: "openness_2"
      }
    },
    {
      id: 3,
      story_variables: {
        event: "quest_completed",
        quest_id: "neuroticism_1" // Duplicate - should count as 2
      }
    }
  ];
  
  const extractedQuestProgress: Record<string, number> = {};
  playerProgressRecords.forEach(record => {
    if (record.story_variables?.event === 'quest_completed') {
      const questId = record.story_variables.quest_id;
      if (questId) {
        extractedQuestProgress[questId] = (extractedQuestProgress[questId] || 0) + 1;
      }
    }
  });
  
}

// Test function to demonstrate the new quest progress saving with unique passage IDs
export function testNewQuestProgressSaving(): void {
  // Simulate the new API call format
  const testCalls = [
    {
      storyId: 'story_1',
      questSlug: 'neuroticism_1',
      storyVariables: {
        progress: 1,
        source: 'story_passage'
      },
      playerState: {
        quest_progress: { neuroticism_1: 1 }
      }
    },
    {
      storyId: 'story_1', 
      questSlug: 'neuroticism_1',
      storyVariables: {
        progress: 1,
        source: 'story_choice'
      },
      playerState: {
        quest_progress: { neuroticism_1: 1 }
      }
    },
    {
      storyId: 'story_2',
      questSlug: 'openness_2', 
      storyVariables: {
        progress: 1,
        source: 'story_completion'
      },
      playerState: {
        quest_progress: { openness_2: 1 }
      }
    }
  ];
  
  testCalls.forEach((call, index) => {
    const apiCall = {
      story_id: call.storyId,
      passage_id: `quest_${call.questSlug}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
      story_variables: call.storyVariables,
      player_state: call.playerState
    };
  });
}

// Test function to verify quest filtering logic
export function testQuestFilteringLogic(): void {
  // Test cases
  const testCases = [
    {
      name: 'Neuroticism user with neuroticism quest',
      primaryTrait: 'neuroticism',
      questId: 'neuroticism_1',
      shouldKeep: true
    },
    {
      name: 'Neuroticism user with openness quest',
      primaryTrait: 'neuroticism',
      questId: 'openness_1',
      shouldKeep: false
    },
    {
      name: 'Openness user with openness quest',
      primaryTrait: 'openness',
      questId: 'openness_2',
      shouldKeep: true
    },
    {
      name: 'Openness user with neuroticism quest',
      primaryTrait: 'openness',
      questId: 'neuroticism_1',
      shouldKeep: false
    },
    {
      name: 'Conscientiousness user with conscientiousness quest',
      primaryTrait: 'conscientiousness',
      questId: 'conscientiousness_1',
      shouldKeep: true
    },
    {
      name: 'Conscientiousness user with extraversion quest',
      primaryTrait: 'conscientiousness',
      questId: 'extraversion_1',
      shouldKeep: false
    }
  ];
  
  testCases.forEach(testCase => {
    const questTraitMatch = testCase.questId.match(/^(\w+)_\d+$/);
    if (questTraitMatch) {
      const questTrait = questTraitMatch[1];
      const matches = questTrait.toLowerCase() === testCase.primaryTrait.toLowerCase();
      const result = matches === testCase.shouldKeep ? '✅ PASS' : '❌ FAIL';
      
    } else {
    }
  });
  
}

// Test function to verify complete filtering logic
export function testCompleteFilteringLogic(): void {
  
  // Mock effects that should be filtered
  const mockEffects: any = {
    experience: 10,
    resonance: 5, // Should be filtered for personality users
    awareness: 2,
    rewards: ['Ancient Scroll'], // Should be filtered for personality users
    artifacts: ['Magic Wand'], // Should be filtered for personality users
    quests: ['neuroticism_1', 'openness_2'], // Should be filtered based on trait
    quest_progress: ['neuroticism_1', 'conscientiousness_1'] // Should be filtered based on trait
  };
  
  
  // Test personality user with neuroticism trait
  const neuroticismUserEffects = { ...mockEffects };
  
  // Remove resonance (personality users get experience instead)
  if (neuroticismUserEffects.resonance) {
    delete neuroticismUserEffects.resonance;
  }
  
  // Remove character items/artifacts (personality users don't get gear)
  if (neuroticismUserEffects.rewards) {
    delete neuroticismUserEffects.rewards;
  }
  
  if (neuroticismUserEffects.artifacts) {
    delete neuroticismUserEffects.artifacts;
  }
  
  // Filter quests by personality trait
  const primaryTrait = 'neuroticism';
  if (neuroticismUserEffects.quests && primaryTrait) {
    const originalQuests = neuroticismUserEffects.quests;
    neuroticismUserEffects.quests = originalQuests.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === primaryTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (neuroticismUserEffects.quests.length === 0) {
      delete neuroticismUserEffects.quests;
    } else {
    }
  }
  
  // Filter quest_progress by personality trait
  if (neuroticismUserEffects.quest_progress && primaryTrait) {
    const originalQuestProgress = neuroticismUserEffects.quest_progress;
    neuroticismUserEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === primaryTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (neuroticismUserEffects.quest_progress.length === 0) {
      delete neuroticismUserEffects.quest_progress;
    } else {
    }
  }
  
  
  // Test character user
  const characterUserEffects: any = { ...mockEffects };
  
  // Remove experience (character users get resonance instead)
  if (characterUserEffects.experience) {
    delete characterUserEffects.experience;
  }
  
  
}

// Test function to verify complete filtering logic with tools
export function testCompleteFilteringLogicWithTools(): void {
  
  // Mock effects that should be filtered
  const mockEffects: any = {
    experience: 10,
    resonance: 5, // Should be filtered for personality users
    awareness: 2,
    rewards: ['Ancient Scroll'], // Should be filtered for personality users
    artifacts: ['Magic Wand'], // Should be filtered for personality users
    quests: ['neuroticism_1', 'openness_2'], // Should be filtered based on trait
    quest_progress: ['neuroticism_1', 'conscientiousness_1'], // Should be filtered based on trait
    tools: ['tool_assertiveness_scripts', 'tool_emotion_surfing'] // Should be filtered based on trait
  };
  
  
  // Test personality user with neuroticism trait
  const neuroticismUserEffects: any = { ...mockEffects };
  
  // Remove resonance (personality users get experience instead)
  if (neuroticismUserEffects.resonance) {
    delete neuroticismUserEffects.resonance;
  }
  
  // Remove character items/artifacts (personality users don't get gear)
  if (neuroticismUserEffects.rewards) {
    delete neuroticismUserEffects.rewards;
  }
  
  if (neuroticismUserEffects.artifacts) {
    delete neuroticismUserEffects.artifacts;
  }
  
  // Filter tools by personality trait
  const primaryTrait = 'neuroticism';
  if (neuroticismUserEffects.tools && primaryTrait) {
    const originalTools = neuroticismUserEffects.tools;
    neuroticismUserEffects.tools = originalTools.filter((toolId: string) => {
      // Check if this tool belongs to the user's personality type
      const personalityTools = CopingTools[primaryTrait as keyof typeof CopingTools];
      if (personalityTools) {
        const toolExists = personalityTools.some((tool: any) => tool.id === toolId);
        if (!toolExists) {
        } else {
        }
        return toolExists;
      }
      return true;
    });
    
    if (neuroticismUserEffects.tools.length === 0) {
      delete neuroticismUserEffects.tools;
    } else {
    }
  }
  
  // Filter quests by personality trait
  if (neuroticismUserEffects.quests && primaryTrait) {
    const originalQuests = neuroticismUserEffects.quests;
    neuroticismUserEffects.quests = originalQuests.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === primaryTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (neuroticismUserEffects.quests.length === 0) {
      delete neuroticismUserEffects.quests;
    } else {
    }
  }
  
  // Filter quest_progress by personality trait
  if (neuroticismUserEffects.quest_progress && primaryTrait) {
    const originalQuestProgress = neuroticismUserEffects.quest_progress;
    neuroticismUserEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === primaryTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (neuroticismUserEffects.quest_progress.length === 0) {
      delete neuroticismUserEffects.quest_progress;
    } else {
    }
  }
  
  
  // Test personality user with agreeableness trait
  const agreeablenessUserEffects: any = { ...mockEffects };
  
  // Remove resonance (personality users get experience instead)
  if (agreeablenessUserEffects.resonance) {
    delete agreeablenessUserEffects.resonance;
  }
  
  // Remove character items/artifacts (personality users don't get gear)
  if (agreeablenessUserEffects.rewards) {
    delete agreeablenessUserEffects.rewards;
  }
  
  if (agreeablenessUserEffects.artifacts) {
    delete agreeablenessUserEffects.artifacts;
  }
  
  // Filter tools by personality trait
  const agreeablenessTrait = 'agreeableness';
  if (agreeablenessUserEffects.tools && agreeablenessTrait) {
    const originalTools = agreeablenessUserEffects.tools;
    agreeablenessUserEffects.tools = originalTools.filter((toolId: string) => {
      // Check if this tool belongs to the user's personality type
      const personalityTools = CopingTools[agreeablenessTrait as keyof typeof CopingTools];
      if (personalityTools) {
        const toolExists = personalityTools.some((tool: any) => tool.id === toolId);
        if (!toolExists) {
        } else {
        }
        return toolExists;
      }
      return true;
    });
    
    if (agreeablenessUserEffects.tools.length === 0) {
      delete agreeablenessUserEffects.tools;
    } else {
    }
  }
  
  // Filter quests by personality trait
  if (agreeablenessUserEffects.quests && agreeablenessTrait) {
    const originalQuests = agreeablenessUserEffects.quests;
    agreeablenessUserEffects.quests = originalQuests.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && agreeablenessTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === agreeablenessTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (agreeablenessUserEffects.quests.length === 0) {
      delete agreeablenessUserEffects.quests;
    } else {
    }
  }
  
  // Filter quest_progress by personality trait
  if (agreeablenessUserEffects.quest_progress && agreeablenessTrait) {
    const originalQuestProgress = agreeablenessUserEffects.quest_progress;
    agreeablenessUserEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && agreeablenessTrait) {
        const questTrait = questTraitMatch[1];
        const matches = questTrait.toLowerCase() === agreeablenessTrait.toLowerCase();
        if (!matches) {
        } else {
        }
        return matches;
      }
      return true;
    });
    
    if (agreeablenessUserEffects.quest_progress.length === 0) {
      delete agreeablenessUserEffects.quest_progress;
    } else {
    }
  }
  
  
}

// Test function to verify filtering with actual data from logs
export function testFilteringWithActualData(): void {
  
  // Mock the actual story effects that are causing issues
  const actualStoryEffects = {
    experience: 50,
    stats: { awareness: 1 },
    quest_progress: ["openness_1", "agreeableness_3"],
    tools: ["tool_assertiveness_scripts"],
    rewards: ["Ancient Scroll"], // This should be filtered out for personality users
    artifacts: ["Magic Wand"] // This should be filtered out for personality users
  };
  
  
  // Test filtering for different personality types
  const testCases = [
    { personalityType: 'neuroticism', expectedQuests: [] },
    { personalityType: 'openness', expectedQuests: ['openness_1'] },
    { personalityType: 'agreeableness', expectedQuests: ['agreeableness_3'] },
    { personalityType: 'conscientiousness', expectedQuests: [] },
    { personalityType: 'extraversion', expectedQuests: [] }
  ];
  
  testCases.forEach(testCase => {
    
    // Simulate the filtering logic
    const filteredEffects: any = { ...actualStoryEffects };
    
    // Remove resonance (personality users get experience instead)
    if (filteredEffects.resonance) {
      delete filteredEffects.resonance;
    }
    
    // Remove character items/artifacts (personality users don't get gear)
    if (filteredEffects.rewards) {
      delete filteredEffects.rewards;
    }
    
    if (filteredEffects.artifacts) {
      delete filteredEffects.artifacts;
    }
    
    // Filter tools by personality trait
    if (filteredEffects.tools && testCase.personalityType) {
      const originalTools = filteredEffects.tools;
      filteredEffects.tools = originalTools.filter((toolId: string) => {
        // Check if this tool belongs to the user's personality type
        const personalityTools = CopingTools[testCase.personalityType as keyof typeof CopingTools];
        if (personalityTools) {
          const toolExists = personalityTools.some((tool: any) => tool.id === toolId);
          if (!toolExists) {
          } else {
          }
          return toolExists;
        }
        return true;
      });
      
      if (filteredEffects.tools.length === 0) {
        delete filteredEffects.tools;
      } else {
      }
    }
    
    // Filter quest_progress by personality trait
    if (filteredEffects.quest_progress && testCase.personalityType) {
      const originalQuestProgress = filteredEffects.quest_progress;
      filteredEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
        const questTraitMatch = questId.match(/^(\w+)_\d+$/);
        if (questTraitMatch && testCase.personalityType) {
          const questTrait = questTraitMatch[1];
          const matches = questTrait.toLowerCase() === testCase.personalityType.toLowerCase();
          if (!matches) {
          } else {
          }
          return matches;
        }
        return true;
      });
      
      if (filteredEffects.quest_progress.length === 0) {
        delete filteredEffects.quest_progress;
      } else {
      }
    }
    
  });
  
}