// rewardFiltering.ts
import { toPersonalityKey } from '../types/personality';

type Rewards = {
  experienceGained?: number;
  totalStatGains?: Record<string, number>;
  skillsLearned?: Array<string | { name: string; personality?: string }>;
  questsUpdated?: Record<string, number>; // Legacy field name
  questProgress?: Record<string, number>; // Current field name
  items?: Array<{ id?: number; name: string; personality?: string }>;
  gear?: Array<{ id?: number; name: string; personality?: string }>;
};

const isCommonQuest = (questKey: string) =>
  /^general_|^common_|^global_/i.test(questKey);

export function filterRewardsByPersonality(
  base: Rewards,
  userPersonalityInput: string | null | undefined,
  userType: "character" | "personality" = "personality"
): Rewards {
  const trait = toPersonalityKey(userPersonalityInput); // e.g., 'Agreeableness'
  const result: Rewards = { ...base };

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
    // For personality users, keep common quests and those that start with the user trait prefix
    if (questData) {
      const prefix = trait ? `${trait.toLowerCase()}_` : '';
      console.log(`🔍 Filtering quests for personality user with trait: ${trait}`);
      console.log(`🔍 Quest prefix to match: ${prefix}`);
      console.log(`🔍 Original quest data:`, questData);
      
      const filteredQuests = Object.fromEntries(
        Object.entries(questData).filter(([k]) => {
          const isCommon = isCommonQuest(k);
          const matchesTrait = trait ? k.toLowerCase().startsWith(prefix) : false;
          const shouldKeep = isCommon || matchesTrait;
          
          console.log(`🔍 Quest ${k}: isCommon=${isCommon}, matchesTrait=${matchesTrait}, shouldKeep=${shouldKeep}`);
          return shouldKeep;
        })
      );
      
      console.log(`🔍 Filtered quest data:`, filteredQuests);
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
    // Personality users only get items/gear tagged for their trait
    const filterPG = <T extends { personality?: string }>(arr?: T[]) =>
      (arr ?? []).filter((it) => {
        if (!trait) return false;
        if (!it.personality) return false;
        return toPersonalityKey(it.personality) === trait;
      });

    result.items = filterPG(base.items);
    result.gear = filterPG(base.gear);
  }

  return result;
}
