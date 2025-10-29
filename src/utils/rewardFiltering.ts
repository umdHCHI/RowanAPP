// rewardFiltering.ts
import { toPersonalityKey } from '../types/personality';
import { ProcessedRewards } from '../types/rewards';

const isCommonQuest = (questKey: string) =>
  /^general_|^common_|^global_/i.test(questKey);

export function filterRewardsByPersonality(
  base: ProcessedRewards,
  userPersonalityInput: string | null | undefined,
  userType: "character" | "personality" = "personality"
): ProcessedRewards {
  const trait = toPersonalityKey(userPersonalityInput); // e.g., 'Agreeableness'
  const result: ProcessedRewards = { ...base };

  // Handle quest progress - support both legacy and current field names
  const questData = base.questProgress || base.questsUpdated;
  
  // For character users, remove personality-specific quests entirely
  if (userType === "character") {
    if (questData) {
      const filteredQuests = Object.fromEntries(
        Object.entries(questData).filter(([k]) => isCommonQuest(k))
      );
      result.questProgress = filteredQuests;
      result.questsUpdated = filteredQuests; // Keep both for compatibility
    }
  } else {
    // For personality users, keep common quests and those that EXACTLY match the user trait
    if (questData) {
      const filteredQuests = Object.fromEntries(
        Object.entries(questData).filter(([questId]) => {
          const isCommon = isCommonQuest(questId);

          // STRICT VALIDATION: Quest MUST follow the pattern {trait}_{number}
          const questTraitMatch = questId.match(/^([a-zA-Z]+)_(\d+)$/);
          let matchesTrait = false;

          if (questTraitMatch && trait) {
            const [, questTrait] = questTraitMatch;
            const normalizedQuestTrait = questTrait.toLowerCase().trim();
            const normalizedUserTrait = trait.toLowerCase().trim();

            // EXACT match required - no partial matches
            matchesTrait = normalizedQuestTrait === normalizedUserTrait;

            console.log(`🔍 rewardFiltering - Quest: "${questId}", Quest trait: "${normalizedQuestTrait}", User trait: "${normalizedUserTrait}", Matches: ${matchesTrait}`);
          }

          const shouldKeep = isCommon || matchesTrait;

          if (!shouldKeep) {
            console.log(`❌ rewardFiltering - Excluding quest: "${questId}"`);
          }

          return shouldKeep;
        })
      );

      result.questProgress = filteredQuests;
      result.questsUpdated = filteredQuests; // Keep both for compatibility
    }
  }

  // Skills: filter based on user type
  if (base.skillsLearned) {
    if (userType === "character") {
      // Character users get all skills (no personality filtering)
      result.skillsLearned = base.skillsLearned;
    } else {
      // Personality users only get skills tagged for their trait
      result.skillsLearned = base.skillsLearned.filter((s) => {
        const name = typeof s === 'string' ? s : s.name;
        const tag =
          typeof s === 'string' ? undefined : (s.personality ?? undefined);
        if (!trait) return false; // if user has no trait, keep nothing
        if (!tag) return false;   // treat untagged as not personality-specific
        const tagKey = toPersonalityKey(tag);
        return tagKey === trait;
      });
    }
  }

  // Items / Gear: filter based on user type
  if (userType === "character") {
    // Character users get all items/gear (no personality filtering)
    result.items = base.items || [];
    result.gear = base.gear || [];
  } else {
    // Personality users get NO gear/equipment - they only get coping tools
    result.items = [];
    result.gear = [];
  }

  return result;
}
