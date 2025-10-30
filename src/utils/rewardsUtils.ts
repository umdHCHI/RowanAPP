import { uiIcons } from '../assets/ui';
import { PersonalityWellnessAttributes } from '../imports';
import { CopingTools, convertEquipmentToCopingTool } from '../types/personality';
import {
  EquipmentUpgrade,
  JournalReward,
  QuestProgress,
  StoryReward,
  StoryRewardTracker,
  ThoughtDefenderResult,
  ThoughtDefenderReward
} from '../types/rewards';
import { Choice, Passage, SavedRewards } from '../types/story';

// ===== REWARD SYSTEM - INTEGRATED WITH EXISTING TYPES =====
// This system tracks rewards throughout the story and applies them at completion
// Works with the existing SavedRewards interface and backend data structure

// Helper function to determine reward type based on research condition
export const getRewardType = (researchCondition: "character" | "personality"): "experience" | "resonance" => {
  return researchCondition === "character" ? "resonance" : "experience";
};

// Helper function to get the appropriate reward field name
export const getRewardFieldName = (researchCondition: "character" | "personality"): string => {
  return getRewardType(researchCondition);
};

// Helper function to map stat names for personality users
// Maps character-specific stats to wellness attributes
const mapStatNameForPersonalityUser = (statName: string): string => {
  const statMap: Record<string, string> = {
    'exploration': 'awareness',
    'courage': 'resilience',
    'fear': 'balance',
    'awareness': 'awareness',
    'resilience': 'resilience',
    'connection': 'connection',
    'balance': 'balance'
  };
  return statMap[statName.toLowerCase()] || statName;
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

// Complete filtering function for personality users
// Converts character gear to personality-specific coping tools
export function filterEffectsForPersonalityUser(
  effects: Record<string, any>,
  primaryTrait: string
): Record<string, any> {
  const filteredEffects = { ...effects };
  
  // Remove resonance (personality users get experience instead)
  delete filteredEffects.resonance;
  
  // Convert character items/artifacts to coping tools
  if (filteredEffects.rewards || filteredEffects.artifacts) {
    const characterItems = [...(filteredEffects.rewards || []), ...(filteredEffects.artifacts || [])];
    if (characterItems.length > 0 && primaryTrait) {
      filteredEffects.tools = characterItems
        .map((itemName: string) => {
          // Use personality-aware mapping
          const convertedTool = convertEquipmentToCopingTool(itemName, primaryTrait as any);
          return convertedTool || itemName.toLowerCase().replace(/\s+/g, '_');
        })
        .filter((toolId: string | null): toolId is string => toolId !== null);
    }
    delete filteredEffects.rewards;
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
      // STRICT VALIDATION: Quest MUST follow the pattern {trait}_{number}
      const questTraitMatch = questId.match(/^([a-zA-Z]+)_(\d+)$/);
      if (questTraitMatch && primaryTrait) {
        const [, questTrait] = questTraitMatch;
        const normalizedQuestTrait = questTrait.toLowerCase().trim();
        const normalizedPrimaryTrait = primaryTrait.toLowerCase().trim();

        console.log(`🔍 Filtering quest: "${questId}" - Quest trait: "${normalizedQuestTrait}", Primary trait: "${normalizedPrimaryTrait}"`);

        // EXACT match required - no partial matches
        return normalizedQuestTrait === normalizedPrimaryTrait;
      }
      console.log(`❌ Excluding quest: "${questId}" - invalid format or no match`);
      return false; // Only include quests that match the personality pattern
    });

    if (filteredEffects.quests.length === 0) {
      delete filteredEffects.quests;
    }
  }

  // Filter quest_progress by personality trait (if quest_progress exists)
  if (filteredEffects.quest_progress && primaryTrait) {
    const originalQuestProgress = filteredEffects.quest_progress;
    filteredEffects.quest_progress = originalQuestProgress.filter((questId: string) => {
      // STRICT VALIDATION: Quest MUST follow the pattern {trait}_{number}
      const questTraitMatch = questId.match(/^([a-zA-Z]+)_(\d+)$/);
      if (questTraitMatch && primaryTrait) {
        const [, questTrait] = questTraitMatch;
        const normalizedQuestTrait = questTrait.toLowerCase().trim();
        const normalizedPrimaryTrait = primaryTrait.toLowerCase().trim();

        console.log(`🔍 Filtering quest_progress: "${questId}" - Quest trait: "${normalizedQuestTrait}", Primary trait: "${normalizedPrimaryTrait}"`);

        // EXACT match required - no partial matches
        return normalizedQuestTrait === normalizedPrimaryTrait;
      }
      console.log(`❌ Excluding quest_progress: "${questId}" - invalid format or no match`);
      return false; // Only include quests that match the personality pattern
    });

    if (filteredEffects.quest_progress.length === 0) {
      delete filteredEffects.quest_progress;
    }
  }
  
  return filteredEffects;
}

// Filter effects for character users
export function filterEffectsForCharacterUser(
  effects: Record<string, any>
): Record<string, any> {
  const filteredEffects = { ...effects };
  
  // Convert experience to resonance for character users
  if (filteredEffects.experience) {
    filteredEffects.resonance = filteredEffects.experience;
    delete filteredEffects.experience;
  }
  
  // Remove tools (character users don't get coping tools)
  delete filteredEffects.tools;
  
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
          const mappedStatName = mapStatNameForPersonalityUser(key);
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
            const mappedStatName = mapStatNameForPersonalityUser(stat);
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

    // Handle items/rewards (only for character users)
    if (effects.rewards && researchCondition === "character") {
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

    // Handle artifacts (only for character users)
    if (effects.artifacts && researchCondition === "character") {
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
            const mappedStatName = mapStatNameForPersonalityUser(wellnessStat);
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
  researchCondition: "character" | "personality" = "personality",
  primaryTrait?: string
): Array<{
  message: string;
  type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'quest';
  icon?: string;
  iconImage?: any;
  statName?: string;
}> {
  const notifications: Array<{
    message: string;
    type: 'experience' | 'resonance' | 'item' | 'skill' | 'stat' | 'artifact' | 'quest';
    icon?: string;
    iconImage?: any;
    statName?: string;
  }> = [];

  // Map stat names to frontend display names and icons
  // For PERSONALITY users: Use personality-specific wellness attribute labels (e.g., "Lantern of Focus", "Keeper's Breath")
  // For CHARACTER users: Use generic stat names (Awareness, Resilience, Connection, Balance)

  // Helper function to get personality-specific stat label
  const getPersonalityStatLabel = (statName: string, personalityTrait?: string): string => {
    if (!personalityTrait) return statName;

    // Normalize the stat name to wellness property
    const normalizedStat = statName.toLowerCase();
    const wellnessProperty = ['awareness', 'resilience', 'connection', 'balance'].includes(normalizedStat)
      ? normalizedStat
      : normalizedStat === 'exploration' ? 'awareness'
      : normalizedStat === 'courage' ? 'resilience'
      : normalizedStat === 'fear' ? 'balance'
      : normalizedStat;

    // Get personality-specific attributes
    const personalityKey = personalityTrait.charAt(0).toUpperCase() + personalityTrait.slice(1).toLowerCase();
    const personalityAttributes = PersonalityWellnessAttributes[personalityKey as keyof typeof PersonalityWellnessAttributes];

    if (personalityAttributes) {
      const attribute = personalityAttributes.attributes.find(
        attr => attr.wellnessProperty === wellnessProperty
      );
      if (attribute) {
        return attribute.label;
      }
    }

    // Fallback to generic names
    return statName.charAt(0).toUpperCase() + statName.slice(1);
  };

  const characterStatDisplayNames: Record<string, string> = {
    'awareness': 'Awareness',
    'exploration': 'Awareness',
    'resilience': 'Resilience',
    'courage': 'Resilience',
    'connection': 'Connection',
    'balance': 'Balance',
    'fear': 'Balance'
  };

  const getStatDisplayName = (statName: string): string => {
    if (researchCondition === 'personality' && primaryTrait) {
      return getPersonalityStatLabel(statName, primaryTrait);
    }
    return characterStatDisplayNames[statName.toLowerCase()] || statName;
  };

  // Helper function to get personality-specific icon (returns string emoji or image object)
  const getPersonalityStatIcon = (statName: string, personalityTrait?: string): string | any => {
    if (!personalityTrait) return '✨';

    // Normalize the stat name to wellness property
    const normalizedStat = statName.toLowerCase();
    const wellnessProperty = ['awareness', 'resilience', 'connection', 'balance'].includes(normalizedStat)
      ? normalizedStat
      : normalizedStat === 'exploration' ? 'awareness'
      : normalizedStat === 'courage' ? 'resilience'
      : normalizedStat === 'fear' ? 'balance'
      : normalizedStat;

    // Get personality-specific attributes
    const personalityKey = personalityTrait.charAt(0).toUpperCase() + personalityTrait.slice(1).toLowerCase();
    const personalityAttributes = PersonalityWellnessAttributes[personalityKey as keyof typeof PersonalityWellnessAttributes];

    if (personalityAttributes) {
      const attribute = personalityAttributes.attributes.find(
        attr => attr.wellnessProperty === wellnessProperty
      );
      if (attribute) {
        return attribute.icon; // Can be string (emoji) or image object
      }
    }

    // Fallback to generic icons
    const defaultIcons: Record<string, string> = {
      'awareness': '🧘',
      'resilience': '💚',
      'connection': '🤝',
      'balance': '⚖️'
    };
    return defaultIcons[wellnessProperty] || '✨';
  };

  const getStatIcon = (statName: string): string | any => {
    if (researchCondition === 'personality' && primaryTrait) {
      return getPersonalityStatIcon(statName, primaryTrait);
    }
    // Character users get default icons
    const defaultIcons: Record<string, string> = {
      'awareness': '🧘',
      'resilience': '💚',
      'connection': '🤝',
      'balance': '⚖️',
      'exploration': '🧘',
      'courage': '💚',
      'fear': '⚖️'
    };
    return defaultIcons[statName.toLowerCase()] || '✨';
  };

  // Map stat names to image assets (for character users)
  const statImages: Record<string, any> = {
    'awareness': uiIcons.sectionIcons.exploration,
    'resilience': uiIcons.sectionIcons.courage,
    'connection': uiIcons.sectionIcons.balance,
    'balance': uiIcons.sectionIcons.fear,
    'exploration': uiIcons.sectionIcons.exploration,
    'courage': uiIcons.sectionIcons.courage,
    'fear': uiIcons.sectionIcons.fear
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
        const icon = key === 'experience' ? '⭐' : '🌟';
        notifications.push({
          message: `+${numValue} ${rewardLabel}`,
          type: key as 'experience' | 'resonance',
          icon: icon
        });
      } else {
        const displayName = getStatDisplayName(key);
        const icon = getStatIcon(key);

        // For personality users, icon might be an image object
        // For character users, use iconImage from statImages
        const isIconObject = typeof icon === 'object';
        const iconImage = isIconObject
          ? icon
          : (researchCondition === 'character' ? statImages[key] : undefined);
        const iconText = isIconObject ? undefined : icon;

        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat',
          icon: iconText,
          iconImage: iconImage,
          statName: key
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
    const icon = rewardType === 'experience' ? '⭐' : '🌟';
    notifications.push({
      message: `+${rewardGain} ${rewardLabel}`,
      type: rewardType,
      icon: icon
    });
  }

  // Handle stats (exclude experience as it's handled separately)
  if (effects.stats) {
    Object.entries(effects.stats).forEach(([stat, value]) => {
      if (stat === 'experience') return;
      
      const numValue = typeof value === 'number' ? value : parseInt(value as string, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const displayName = getStatDisplayName(stat);
        const icon = getStatIcon(stat);

        // For personality users, icon might be an image object
        // For character users, use iconImage from statImages
        const isIconObject = typeof icon === 'object';
        const iconImage = isIconObject
          ? icon
          : (researchCondition === 'character' ? statImages[stat] : undefined);
        const iconText = isIconObject ? undefined : icon;

        notifications.push({
          message: `+${numValue} ${displayName}`,
          type: 'stat',
          icon: iconText,
          iconImage: iconImage,
          statName: stat
        });
      }
    });
  }

  // Handle items/rewards (only for character users)
  if (effects.rewards && researchCondition === "character") {
    if (Array.isArray(effects.rewards)) {
      effects.rewards.forEach((reward: string) => {
        notifications.push({
          message: `Gained ${reward}`,
          type: 'item',
          icon: '🎁'
        });
      });
    } else if (typeof effects.rewards === 'string') {
      notifications.push({
        message: `Gained ${effects.rewards}`,
        type: 'item',
        icon: '🎁'
      });
    }
  }

  // Handle skills
  if (effects.skills) {
    if (Array.isArray(effects.skills)) {
      effects.skills.forEach((skill: string) => {
        notifications.push({
          message: `Learned ${skill}`,
          type: 'skill',
          icon: '📚'
        });
      });
    } else if (typeof effects.skills === 'string') {
      notifications.push({
        message: `Learned ${effects.skills}`,
        type: 'skill',
        icon: '📚'
      });
    }
  }

  // Handle artifacts (only for character users)
  if (effects.artifacts && researchCondition === "character") {
    if (Array.isArray(effects.artifacts)) {
      effects.artifacts.forEach((artifact: string) => {
        notifications.push({
          message: `Found ${artifact}`,
          type: 'artifact',
          icon: '💎'
        });
      });
    } else if (typeof effects.artifacts === 'string') {
      notifications.push({
        message: `Found ${effects.artifacts}`,
        type: 'artifact',
        icon: '💎'
      });
    }
  }

  // Handle quest progress - only create notifications for quests that should be processed
  if (effects.quest_progress && Array.isArray(effects.quest_progress)) {
    effects.quest_progress.forEach((questId: string) => {
      // For personality users, only create notifications for their personality type
      if (researchCondition === 'personality' && primaryTrait) {
        const questTraitMatch = questId.match(/^(\w+)_\d+$/);
        if (questTraitMatch) {
          const [, questTrait] = questTraitMatch;
          if (questTrait.toLowerCase() !== primaryTrait.toLowerCase()) {
            return; // Skip quest notifications for other personality types
          }
        }
      }
      
      notifications.push({
        message: 'Quest Progress Updated!',
        type: 'quest',
        icon: '🎯'
      });
    });
  } else if (effects.quests) {
    // Only create notifications for quests that match the user type
    if (Array.isArray(effects.quests)) {
      effects.quests.forEach((questId: string) => {
        // For character users, skip personality-specific quests in notifications
        if (researchCondition === 'character') {
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch) {
            return; // Skip personality quest notifications for character users
          }
        }
        
        // For personality users, only create notifications for their personality type
        if (researchCondition === 'personality' && primaryTrait) {
          const questTraitMatch = questId.match(/^(\w+)_\d+$/);
          if (questTraitMatch) {
            const [, questTrait] = questTraitMatch;
            if (questTrait.toLowerCase() !== primaryTrait.toLowerCase()) {
              return; // Skip quest notifications for other personality types
            }
          }
        }
        
        const questInfo = getQuestInfo(questId);
        if (questInfo) {
          notifications.push({
            message: `Quest Progress: ${questInfo.title}`,
            type: 'quest',
            icon: '🎯'
          });
        } else {
          notifications.push({
            message: `Quest Progress: ${questId}`,
            type: 'quest',
            icon: '🎯'
          });
        }
      });
    } else if (typeof effects.quests === 'string') {
      // For character users, skip personality-specific quests in notifications
      if (researchCondition === 'character') {
        const questTraitMatch = effects.quests.match(/^(\w+)_\d+$/);
        if (questTraitMatch) {
          return notifications; // Skip personality quest notifications for character users
        }
      }
      
      // For personality users, only create notifications for their personality type
      if (researchCondition === 'personality' && primaryTrait) {
        const questTraitMatch = effects.quests.match(/^(\w+)_\d+$/);
        if (questTraitMatch) {
          const [, questTrait] = questTraitMatch;
          if (questTrait.toLowerCase() !== primaryTrait.toLowerCase()) {
            return notifications; // Skip quest notifications for other personality types
          }
        }
      }
      
      const questInfo = getQuestInfo(effects.quests);
      if (questInfo) {
        notifications.push({
          message: `Quest Progress: ${questInfo.title}`,
          type: 'quest',
          icon: '🎯'
        });
      } else {
        notifications.push({
          message: `Quest Progress: ${effects.quests}`,
          type: 'quest',
          icon: '🎯'
        });
      }
    }
  }

  return notifications;
}


// Reward system for journal entries and activities
// Types imported from ../types/rewards

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
// Types imported from ../types/rewards

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
// Types imported from ../types/rewards

// Backend gear type mapping - expanded to include all equipment from assets
export const BACKEND_GEAR_MAPPING: Record<string, number> = {
  // Original equipment
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
  "Stone of Self-Compassion": 13,
  
  // Focus Items
  "Scroll of Stillness": 14,
  "Magic Wand": 15,
  "Topaz Staff": 16,
  "Sapphire Staff": 17,
  "Torch": 18,
  "Meditation Focus": 19,
  "Breathing Tool": 20,
  "Journal": 21,
  
  // Comfort Layers
  "Social Comfort": 22,
  "Hobby Protection": 23,
  "Nature Comfort": 24,
  "Comfort Layer I": 25,
  "Comfort Layer II": 26,
  "Comfort Layer III": 27,
  
  // Mind Shields
  "Boundary Shield": 28,
  "Affirmation Shield": 29,
  "Routine Shield": 30,
  "Wizard Hat": 31,
  "Basic Helm": 32,
  "Iron Helmet": 33,
  "Leather Helmet": 34,
  
  // Ground Stones
  "Exercise Boots": 35,
  "Sleep Boots": 36,
  "Nutrition Boots": 37,
  "Iron Boots": 38,
  "Leather Boots": 39,
  
  // Combat Gear
  "Iron Sword": 40,
  "Golden Sword": 41,
  "Iron Shield": 42,
  "Wooden Shield": 43
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
// Type imported from ../types/rewards

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