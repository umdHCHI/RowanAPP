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

// Add the filtering function for personality users
export function filterEffectsForPersonalityUser(
  effects: Record<string, any>,
  primaryTrait: string
): Record<string, any> {
  const filteredEffects = { ...effects };
  
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
  
  // Filter tools by personality trait (if tools exist)
  if (filteredEffects.tools && primaryTrait) {
    const originalTools = filteredEffects.tools;
    filteredEffects.tools = originalTools.filter((toolId: string) => {
      const personalityTools = CopingTools[primaryTrait as keyof typeof CopingTools];
      if (personalityTools) {
        return personalityTools.some((tool: any) => tool.id === toolId);
      }
      return true;
    });
    
    if (filteredEffects.tools.length === 0) {
      delete filteredEffects.tools;
    }
  }
  
  // Filter quests by personality trait (if quests exist)
  if (filteredEffects.quests && primaryTrait) {
    const originalQuests = filteredEffects.quests;
    filteredEffects.quests = originalQuests.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        return questTrait.toLowerCase() === primaryTrait.toLowerCase();
      }
      return true;
    });
    
    if (filteredEffects.quests.length === 0) {
      delete filteredEffects.quests;
    }
  }
  
  // Filter quest_progress by personality trait (if quest_progress exists)
  if (filteredEffects.quest_progress && primaryTrait) {
    const originalQuestProgress = filteredEffects.quest_progress;
    filteredEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
      const questTraitMatch = questId.match(/^(\w+)_\d+$/);
      if (questTraitMatch && primaryTrait) {
        const questTrait = questTraitMatch[1];
        return questTrait.toLowerCase() === primaryTrait.toLowerCase();
      }
      return true;
    });
    
    if (filteredEffects.quest_progress.length === 0) {
      delete filteredEffects.quest_progress;
    }
  }
  
  return filteredEffects;
}

// Calculate total rewards from all collected rewards
export function calculateTotalRewards(
  tracker: StoryRewardTracker, 
  researchCondition: "character" | "personality" = "personality", 
  primaryTrait?: string
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
  
  const rewardType = getRewardType(researchCondition);
  const rewardFieldName = getRewardFieldName(researchCondition);

  // Process all rewards
  tracker.rewards.forEach((reward) => {
    let effects = reward.effects;
    
    // Filter effects for personality users FIRST
    if (researchCondition === "personality" && primaryTrait) {
      effects = filterEffectsForPersonalityUser(effects, primaryTrait);
    }

    // Handle direct stat gains from story_effects (new format)
    Object.entries(effects).forEach(([key, value]) => {
      // Skip non-stat fields
      if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness', 'quests', 'quest_progress', 'tools'].includes(key)) {
        return;
      }
      
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        // Map frontend stat names to backend wellness attribute names for personality users
        if (researchCondition === "personality") {
          let mappedStatName = key;
          
          switch (key.toLowerCase()) {
            case 'awareness':
              mappedStatName = 'awareness';
              break;
            case 'resilience':
              mappedStatName = 'resilience';
              break;
            case 'connection':
              mappedStatName = 'connection';
              break;
            case 'balance':
              mappedStatName = 'balance';
              break;
            case 'exploration':
              mappedStatName = 'awareness';
              break;
            case 'courage':
              mappedStatName = 'resilience';
              break;
            case 'fear':
              mappedStatName = 'balance';
              break;
            default:
              mappedStatName = key;
          }
          
          totalStatGains[mappedStatName] = (totalStatGains[mappedStatName] || 0) + numValue;
        } else {
          totalStatGains[key] = (totalStatGains[key] || 0) + numValue;
        }
      }
    });

    // Handle legacy stats object format
    if (effects.stats) {
      Object.entries(effects.stats).forEach(([stat, value]) => {
        // Skip experience/resonance as it's handled separately to avoid double-counting
        if (stat === 'experience' || stat === 'resonance') {
          return;
        }
        
        const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
        if (!isNaN(numValue)) {
          if (researchCondition === "personality") {
            let mappedStatName = stat;
            
            switch (stat.toLowerCase()) {
              case 'awareness':
                mappedStatName = 'awareness';
                break;
              case 'resilience':
                mappedStatName = 'resilience';
                break;
              case 'connection':
                mappedStatName = 'connection';
                break;
              case 'balance':
                mappedStatName = 'balance';
                break;
              case 'exploration':
                mappedStatName = 'awareness';
                break;
              case 'courage':
                mappedStatName = 'resilience';
                break;
              case 'fear':
                mappedStatName = 'balance';
                break;
              default:
                mappedStatName = stat;
            }
            
            totalStatGains[mappedStatName] = (totalStatGains[mappedStatName] || 0) + numValue;
          } else {
            totalStatGains[stat] = (totalStatGains[stat] || 0) + numValue;
          }
        }
      });
    }

    // Handle experience/resonance (direct or from stats)
    let rewardGain = 0;
    
    if (effects[rewardFieldName]) {
      const rewardValue = typeof effects[rewardFieldName] === 'number' 
        ? effects[rewardFieldName] 
        : parseInt(effects[rewardFieldName] as string, 10);
      if (!isNaN(rewardValue)) {
        rewardGain += rewardValue;
      }
    }
    
    if (effects.stats && effects.stats[rewardFieldName] && effects[rewardFieldName] === undefined) {
      const rewardValue = typeof effects.stats[rewardFieldName] === 'number' 
        ? effects.stats[rewardFieldName] 
        : parseInt(effects.stats[rewardFieldName] as string, 10);
      if (!isNaN(rewardValue)) {
        rewardGain += rewardValue;
      }
    }
    
    if (rewardGain > 0) {
      totalStatGains[rewardFieldName] = (totalStatGains[rewardFieldName] || 0) + rewardGain;
    }

    // Handle items/rewards (only for character users after filtering)
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

    // Handle artifacts (only for character users after filtering)
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
          if (researchCondition === "personality") {
            let mappedStatName = wellnessStat;
            
            switch (wellnessStat.toLowerCase()) {
              case 'exploration':
                mappedStatName = 'awareness';
                break;
              case 'courage':
                mappedStatName = 'resilience';
                break;
              case 'fear':
                mappedStatName = 'balance';
                break;
              default:
                mappedStatName = wellnessStat;
            }
            
            totalStatGains[mappedStatName] = (totalStatGains[mappedStatName] || 0) + numValue;
          } else {
            totalStatGains[`wellness_${wellnessStat}`] = (totalStatGains[`wellness_${wellnessStat}`] || 0) + numValue;
          }
        }
      });
    }

    // Handle quest progress (after filtering)
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

    // Handle tools (only for personality users after filtering)
    if (effects.tools) {
      if (Array.isArray(effects.tools)) {
        skillsLearned.push(...effects.tools);
      } else if (typeof effects.tools === 'string') {
        skillsLearned.push(effects.tools);
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
  return !!(choice.effects && Object.keys(choice.effects).length > 0);
}

// Helper function to get reward summary for UI display
export function getRewardSummary(
  tracker: StoryRewardTracker,
  researchCondition: "character" | "personality" = "personality",
  primaryTrait?: string
): {
  totalRewards: number;
  totalStatGains: number;
  totalSkills: number;
  totalJournalEntries: number;
  totalQuestProgress: number;
} {
  const calculatedRewards = calculateTotalRewards(tracker, researchCondition, primaryTrait);
  
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

  const rewardType = getRewardType(researchCondition);
  const rewardFieldName = getRewardFieldName(researchCondition);

  // Handle direct stat gains from story_effects
  Object.entries(effects).forEach(([key, value]) => {
    if (['rewards', 'artifacts', 'skills', 'journal_entry', 'stats', 'wellness'].includes(key)) {
      return;
    }
    
    const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
    if (!isNaN(numValue) && numValue > 0) {
      if (key === 'experience' || key === 'resonance') {
        const rewardLabel = key === 'experience' ? 'Experience' : 'Resonance';
        notifications.push({
          message: `+${numValue} ${rewardLabel}`,
          type: key as 'experience' | 'resonance'
        });
      } else {
        const displayName = statDisplayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat'
        });
      }
    }
  });

  // Handle experience/resonance from stats (legacy format)
  let rewardGain = 0;
  
  if (effects.stats && effects.stats[rewardFieldName] && effects[rewardFieldName] === undefined) {
    const rewardValue = typeof effects.stats[rewardFieldName] === 'number' 
      ? effects.stats[rewardFieldName] 
      : parseInt(effects.stats[rewardFieldName] as string, 10);
    if (!isNaN(rewardValue) && rewardValue > 0) {
      rewardGain += rewardValue;
    }
  }
  
  if (rewardGain > 0 && !notifications.some(n => n.type === rewardType)) {
    const rewardLabel = rewardType === 'experience' ? 'Experience' : 'Resonance';
    notifications.push({
      message: `+${rewardGain} ${rewardLabel}`,
      type: rewardType
    });
  }

  // Handle stats (exclude experience as it's handled separately)
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([stat, value]) => {
      if (stat === 'experience') return;
      
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const displayName = statDisplayNames[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat'
        });
      }
    });
  }

  // Handle items/rewards
  if (effects.rewards) {
    if (Array.isArray(effects.rewards)) {
      effects.rewards.forEach((reward: string) => {
        const message = researchCondition === "personality" ? `Acquired ${reward}` : `Gained ${reward}`;
        notifications.push({
          message,
          type: 'item'
        });
      });
    } else if (typeof effects.rewards === 'string') {
      const message = researchCondition === "personality" ? `Acquired ${effects.rewards}` : `Gained ${effects.rewards}`;
      notifications.push({
        message,
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
        const message = researchCondition === "personality" ? `Acquired ${artifact}` : `Found ${artifact}`;
        notifications.push({
          message,
          type: researchCondition === "personality" ? 'item' : 'artifact'
        });
      });
    } else if (typeof effects.artifacts === 'string') {
      const message = researchCondition === "personality" ? `Acquired ${effects.artifacts}` : `Found ${effects.artifacts}`;
      notifications.push({
        message,
        type: researchCondition === "personality" ? 'item' : 'artifact'
      });
    }
  }

  // Handle quest progress
  if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
    effects.quest_progress.forEach(() => {
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

// Comprehensive list of available equipment items for rewards
export const AVAILABLE_EQUIPMENT_ITEMS = {
  focus: [
    "Ancient Scroll",
    "Lens of Gentle Seeing",
    "Notebook of the Wanderer",
    "Compass of Quiet Knowing"
  ],
  comfort: [
    "Cloak of True Form",
    "Wrap of Rooted Memory",
    "Shield of Flexible Boundaries"
  ],
  shield: [
    "Mask of Discernment",
    "Crown of Becoming",
    "Helm of the Unmasked"
  ],
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
    return getRandomEquipmentReward('focus');
  }
  
  return getRandomEquipmentReward('focus');
};

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
  let baseExperience = 50;
  
  const typeBonuses = {
    journal: 0,
    draw: 25,
    voice: 30
  };
  
  const difficultyBonuses = {
    'Beginner': 0,
    'Intermediate': 25,
    'Advanced': 50
  };
  
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
  
  const wellnessStats: JournalReward['wellnessStats'] = {};
  wellnessStats.awareness = (wellnessStats.awareness || 0) + 1;
  
  if (skillBonus.awareness) wellnessStats.awareness += skillBonus.awareness;
  if (skillBonus.resilience) wellnessStats.resilience = skillBonus.resilience;
  if (skillBonus.connection) wellnessStats.connection = skillBonus.connection;
  if (skillBonus.balance) wellnessStats.balance = skillBonus.balance;
  
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
    exploration?: number;
    courage?: number;
    connection?: number;
    fear?: number;
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
  survivalTime: number
): ThoughtDefenderReward => {
  let baseExperience = 25;
  
  const difficultyMultipliers = {
    'zen': 0.8,
    'normal': 1.0,
    'intense': 1.2,
    'nightmare': 1.5
  };
  
  const difficultyMultiplier = difficultyMultipliers[difficulty as keyof typeof difficultyMultipliers] || 1.0;
  
  const scoreBonus = Math.floor(score / 200) * 5;
  const levelBonus = level * 10;
  const winBonus = won ? 50 : 15;
  const accuracy = totalThoughts > 0 ? (thoughtsCleared / totalThoughts) * 100 : 0;
  const accuracyBonus = Math.floor(accuracy / 20) * 3;
  const timeBonus = Math.floor(survivalTime / 60) * 8;
  
  const totalExperience = Math.floor(
    (baseExperience + scoreBonus + levelBonus + winBonus + accuracyBonus + timeBonus) * difficultyMultiplier
  );
  
  const wellnessStats: ThoughtDefenderReward['wellnessStats'] = {};
  
  const explorationGain = Math.floor(accuracy / 15) - (accuracy < 30 ? 1 : 0);
  wellnessStats.exploration = Math.max(-2, Math.min(3, explorationGain));
  
  const courageGain = Math.floor(survivalTime / 60) + (difficultyMultiplier > 1.2 ? 1 : 0) - (survivalTime < 30 ? 1 : 0);
  wellnessStats.courage = Math.max(-1, Math.min(3, courageGain));
  
  const connectionGain = Math.max(0, Math.floor(thoughtsCleared / 8));
  wellnessStats.connection = Math.min(2, connectionGain);
  
  const fearGain = Math.floor((accuracy + (won ? 30 : -10)) / 20);
  wellnessStats.fear = Math.max(-1, Math.min(2, fearGain));
  
  const foundationGains: ThoughtDefenderReward['foundationGains'] = {};
  
  if (accuracy > 70) {
    foundationGains['Sight Beyond Sight'] = Math.floor(accuracy / 25);
  }
  
  if (difficultyMultiplier > 1.5 || survivalTime > 120) {
    foundationGains['Unbreakable Will'] = Math.floor(survivalTime / 60) + (won ? 1 : 0);
  }
  
  if (thoughtsCleared > 20) {
    foundationGains['Heart\'s Compass'] = Math.floor(thoughtsCleared / 15);
  }
  
  if (accuracy > 60 && survivalTime > 60) {
    foundationGains['Elemental Harmony'] = Math.floor((accuracy + survivalTime / 10) / 30);
  }
  
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
  
  if (reward.experience > 0) {
    notifications.push({
      message: `+${reward.experience} Experience`,
      type: 'experience'
    });
  }
  
  Object.entries(reward.wellnessStats).forEach(([stat, value]) => {
    if (value !== undefined && value !== 0) {
      const sign = value >= 0 ? '+' : '';
      notifications.push({
        message: `${stat.charAt(0).toUpperCase() + stat.slice(1)} ${sign}${value}`,
        type: 'wellness'
      });
    }
  });
  
  Object.entries(reward.foundationGains).forEach(([foundation, value]) => {
    if (value && value > 0) {
      notifications.push({
        message: `${foundation} +${value}`,
        type: 'foundation'
      });
    }
  });
  
  if (reward.performance.score > 1000) {
    notifications.push({
      message: "🏆 High Score Achievement!",
      type: 'achievement'
    });
  }
  
  return notifications;
};

// ===== EQUIPMENT UPGRADE SYSTEM =====

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
    upgradeChance: 0.8,
    nextRarity: "Rare" as const
  },
  Rare: {
    maxLevel: 5,
    statBonusPerLevel: 2,
    upgradeChance: 0.6,
    nextRarity: "Epic" as const
  },
  Epic: {
    maxLevel: 7,
    statBonusPerLevel: 3,
    upgradeChance: 0.4,
    nextRarity: "Legendary" as const
  },
  Legendary: {
    maxLevel: 10,
    statBonusPerLevel: 5,
    upgradeChance: 0.2,
    nextRarity: "Legendary" as const
  }
};

// Equipment base stats and upgrade paths
export const EQUIPMENT_BASE_STATS: Record<string, {
  baseStats: Record<string, number>;
  upgradePaths: string[];
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  backendId: number;
}> = {
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

// Backend gear type mapping
export const BACKEND_GEAR_MAPPING: Record<string, number> = {
  "Ancient Scroll": 1,
  "Lens of Gentle Seeing": 2,
  "Notebook of the Wanderer": 3,
  "Compass of Quiet Knowing": 4,
  "Cloak of True Form": 5,
  "Wrap of Rooted Memory": 6,
  "Shield of Flexible Boundaries": 7,
  "Mask of Discernment": 8,
  "Crown of Becoming": 9,
  "Helm of the Unmasked": 10,
  "Foundation of Inner Stone": 11,
  "Roots of Connection": 12,
  "Stone of Self-Compassion": 13
};

// Enhanced function to get backend gear type ID
export const getBackendGearTypeId = (itemName: string): number | null => {
  const normalizedName = itemName.toLowerCase().trim();
  
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    if (normalizedName === name.toLowerCase()) {
      return id;
    }
  }
  
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    if (normalizedName.includes(name.toLowerCase()) || 
        name.toLowerCase().includes(normalizedName)) {
      return id;
    }
  }
  
  for (const [name, id] of Object.entries(BACKEND_GEAR_MAPPING)) {
    const baseName = name.toLowerCase();
    if (normalizedName.includes(baseName)) {
      return id;
    }
  }
  
  return null;
};

// Get rarity colors for upgraded items
export const getRarityColors = (rarity: "Common" | "Rare" | "Epic" | "Legendary"): string[] => {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  
  switch (normalizedRarity) {
    case "Common":
      return ["#9d9d9d", "#c0c0c0"];
    case "Rare":
      return ["#0070dd", "#4fc3f7"];
    case "Epic":
      return ["#a335ee", "#e1bee7"];
    case "Legendary":
      return ["#ff8000", "#ffd54f"];
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

// Get ALL quest IDs from a personality type
export const getQuestRewardByTheme = (theme: string, personalityType: string): string[] => {
  const personalityQuests = PersonalityQuests[personalityType as keyof typeof PersonalityQuests];
  if (!personalityQuests) {
    return [];
  }
  
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