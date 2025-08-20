/**
 * Personality-specific reward calculation and processing utilities
 * This module handles different reward types, multipliers, and bonuses based on user personality traits
 */

// ===== PERSONALITY TRAIT CONFIGURATIONS =====

interface PersonalityRewardConfig {
  // Base reward multiplier for this personality type
  baseMultiplier: number;
  
  // Preferred stat gains (which stats get bonus for this personality)
  preferredStats: string[];
  
  // Preferred coping tools for this personality type
  preferredTools: string[];
  
  // Quest bonus multiplier for quests related to this personality
  questBonus: number;
  
  // Story completion messages
  completionMessages: {
    regular: string;
    intro: string;
  };
}

const PERSONALITY_REWARD_CONFIGS: Record<string, PersonalityRewardConfig> = {
  // Openness to Experience - Creative, curious, intellectually adventurous
  openness: {
    baseMultiplier: 1.2,
    preferredStats: ['awareness', 'connection'],
    preferredTools: [
      'Explorer\'s Notebook',
      'Creativity Compass',
      'Mind Map',
      'Idea Journal',
      'Art Therapy',
      'Music Meditation',
      'Nature Walk'
    ],
    questBonus: 1.3,
    completionMessages: {
      regular: "Your curiosity has unveiled new insights, expanding your understanding of yourself and the world around you.",
      intro: "Welcome, curious soul! Your journey of discovery begins here, where every story holds the potential for new insights."
    }
  },

  // Conscientiousness - Organized, disciplined, goal-oriented
  conscientiousness: {
    baseMultiplier: 1.15,
    preferredStats: ['balance', 'resilience'],
    preferredTools: [
      'Goal Tracker',
      'Daily Planner',
      'Habit Builder',
      'Time Manager',
      'Priority Matrix',
      'Achievement Log',
      'Progress Monitor'
    ],
    questBonus: 1.4,
    completionMessages: {
      regular: "Your dedication and systematic approach have led to meaningful progress on your wellness journey.",
      intro: "Welcome, organized achiever! Your methodical nature will serve you well in building lasting wellness habits."
    }
  },

  // Extraversion - Social, energetic, outgoing
  extraversion: {
    baseMultiplier: 1.1,
    preferredStats: ['connection', 'balance'],
    preferredTools: [
      'Social Support Network',
      'Group Activity Planner',
      'Communication Skills',
      'Peer Mentor',
      'Team Building',
      'Public Speaking',
      'Leadership Skills'
    ],
    questBonus: 1.25,
    completionMessages: {
      regular: "Your energy and social connections have enriched this experience, creating positive ripples in your community.",
      intro: "Welcome, energetic connector! Your story will flourish through the relationships and experiences you build."
    }
  },

  // Agreeableness - Cooperative, trusting, empathetic
  agreeableness: {
    baseMultiplier: 1.25,
    preferredStats: ['connection', 'awareness'],
    preferredTools: [
      'Empathy Builder',
      'Conflict Resolution',
      'Compassion Practice',
      'Helping Others',
      'Active Listening',
      'Kindness Journal',
      'Volunteer Work'
    ],
    questBonus: 1.35,
    completionMessages: {
      regular: "Your compassionate heart has not only healed yourself but has also brought comfort to others along the way.",
      intro: "Welcome, kind soul! Your empathetic nature will be a guiding light in both your own journey and in helping others."
    }
  },

  // Neuroticism (Emotional Sensitivity) - Emotionally reactive, stress-prone
  neuroticism: {
    baseMultiplier: 1.3,
    preferredStats: ['resilience', 'balance'],
    preferredTools: [
      'Stress Reduction',
      'Anxiety Management',
      'Emotional Regulation',
      'Calm Breathing',
      'Grounding Techniques',
      'Worry Time',
      'Self-Soothing'
    ],
    questBonus: 1.5,
    completionMessages: {
      regular: "You've shown tremendous courage in facing your challenges, transforming sensitivity into strength and wisdom.",
      intro: "Welcome, brave heart! Your emotional depth, while challenging, is also your greatest source of wisdom and growth."
    }
  }
};

// ===== REWARD MULTIPLIER FUNCTIONS =====

/**
 * Get personality-specific reward multiplier
 * @param personalityType - User's primary personality trait
 * @param storyId - ID of the completed story (for future story-specific bonuses)
 * @returns Multiplier value for rewards
 */
export const getPersonalityRewardMultiplier = (
  personalityType: string, 
  storyId?: string
): number => {
  if (!personalityType) return 1.0;
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) return 1.0;
  
  // Base multiplier for this personality type
  let multiplier = config.baseMultiplier;
  
  // Future: Add story-specific bonuses
  // if (storyId && isStoryPersonalityFocused(storyId, personalityType)) {
  //   multiplier += 0.1; // 10% bonus for personality-focused stories
  // }
  
  return multiplier;
};

/**
 * Apply personality-specific stat bonuses
 * @param originalStats - Original stat gains from story
 * @param personalityType - User's primary personality trait
 * @param multiplier - Base multiplier to apply
 * @returns Adjusted stat gains with personality bonuses
 */
export const applyPersonalityStatBonuses = (
  originalStats: Record<string, number>,
  personalityType: string,
  multiplier: number = 1.0
): Record<string, number> => {
  if (!personalityType) return originalStats;
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) return originalStats;
  
  const adjustedStats: Record<string, number> = {};
  
  Object.entries(originalStats).forEach(([stat, value]) => {
    let adjustedValue = value * multiplier;
    
    // Apply additional bonus for preferred stats
    if (config.preferredStats.includes(stat.toLowerCase())) {
      adjustedValue *= 1.2; // 20% bonus for preferred stats
    }
    
    adjustedStats[stat] = Math.floor(adjustedValue);
  });
  
  return adjustedStats;
};

/**
 * Apply personality-specific quest progress bonuses
 * @param originalProgress - Original quest progress from story
 * @param personalityType - User's primary personality trait
 * @returns Adjusted quest progress with personality bonuses
 */
export const applyPersonalityQuestBonuses = (
  originalProgress: Record<string, number>,
  personalityType: string
): Record<string, number> => {
  if (!personalityType) return originalProgress;
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) return originalProgress;
  
  const adjustedProgress: Record<string, number> = {};
  
  Object.entries(originalProgress).forEach(([questId, progress]) => {
    // Apply bonus for quests related to this personality type
    let adjustedValue = progress;
    if (questId.toLowerCase().includes(personalityType.toLowerCase())) {
      adjustedValue = Math.floor(progress * config.questBonus);
    }
    
    adjustedProgress[questId] = adjustedValue;
  });
  
  return adjustedProgress;
};

/**
 * Check if a coping tool is preferred for a specific personality type
 * @param toolName - Name of the coping tool
 * @param personalityType - User's primary personality trait
 * @returns True if the tool is preferred for this personality type
 */
export const isToolPreferredForPersonality = (
  toolName: string,
  personalityType: string
): boolean => {
  if (!personalityType || !toolName) return false;
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) return false;
  
  // Check if tool name matches any preferred tools (case-insensitive, partial match)
  return config.preferredTools.some(preferredTool => 
    toolName.toLowerCase().includes(preferredTool.toLowerCase()) ||
    preferredTool.toLowerCase().includes(toolName.toLowerCase())
  );
};

/**
 * Get personality-specific story completion message
 * @param personalityType - User's primary personality trait
 * @param isIntroStory - Whether this is the introduction story
 * @returns Personalized completion message
 */
export const getPersonalityCompletionMessage = (
  personalityType: string,
  isIntroStory: boolean = false
): string => {
  if (!personalityType) {
    return isIntroStory 
      ? "Welcome to your wellness journey! Every story you complete brings you closer to understanding yourself."
      : "Your journey continues to unfold, revealing new insights and growth opportunities.";
  }
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) {
    return isIntroStory 
      ? "Welcome to your wellness journey! Every story you complete brings you closer to understanding yourself."
      : "Your journey continues to unfold, revealing new insights and growth opportunities.";
  }
  
  return isIntroStory ? config.completionMessages.intro : config.completionMessages.regular;
};

/**
 * Get preferred coping tools for a personality type
 * @param personalityType - User's primary personality trait
 * @returns Array of preferred tool names
 */
export const getPreferredToolsForPersonality = (personalityType: string): string[] => {
  if (!personalityType) return [];
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  return config ? config.preferredTools : [];
};

/**
 * Get preferred wellness stats for a personality type
 * @param personalityType - User's primary personality trait
 * @returns Array of preferred stat names
 */
export const getPreferredStatsForPersonality = (personalityType: string): string[] => {
  if (!personalityType) return [];
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  return config ? config.preferredStats : [];
};

/**
 * Calculate total personality bonus for a reward
 * @param baseReward - Base reward amount
 * @param personalityType - User's primary personality trait
 * @param rewardType - Type of reward ('experience', 'stats', 'quest')
 * @returns Total bonus amount
 */
export const calculatePersonalityBonus = (
  baseReward: number,
  personalityType: string,
  rewardType: 'experience' | 'stats' | 'quest' = 'experience'
): number => {
  if (!personalityType) return 0;
  
  const config = PERSONALITY_REWARD_CONFIGS[personalityType.toLowerCase()];
  if (!config) return 0;
  
  let multiplier = config.baseMultiplier - 1; // Convert to bonus (e.g., 1.2 becomes 0.2)
  
  if (rewardType === 'quest') {
    multiplier = config.questBonus - 1;
  }
  
  return Math.floor(baseReward * multiplier);
};

// ===== EXPORT PERSONALITY CONFIGS FOR EXTERNAL USE =====
export { PERSONALITY_REWARD_CONFIGS };

// Re-export personality filter utilities
  export {
    filterByPersonality, matchesUserPersonality, normalizePersonalitySlug
  } from './personalityFilter';

