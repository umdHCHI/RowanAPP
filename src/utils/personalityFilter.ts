// utils/personalityFilter.ts
type PersonalityTag = string | string[];

type PersonalityTagged = {
  // support multiple possible shapes coming from story_effect
  for_personality?: PersonalityTag;
  personality?: PersonalityTag;
  personalities?: PersonalityTag;
};

export function normalizePersonalitySlug(x: string) {
  return (x || '').trim().toLowerCase().replace(/\s+/g, '_');
}

export function matchesUserPersonality(tags: PersonalityTag, userSlug: string) {
  const wanted = Array.isArray(tags) ? tags : [tags];
  const target = normalizePersonalitySlug(userSlug);
  return wanted.some(t => normalizePersonalitySlug(t) === target);
}

/** Generic array filter for rewards/items/gear that might carry personality tags */
export function filterByPersonality<T extends PersonalityTagged>(
  list: T[] | undefined,
  userSlug: string
): T[] {
  if (!Array.isArray(list)) return [];
  return list.filter(item => {
    const tag = item.for_personality ?? item.personality ?? item.personalities;
    return tag ? matchesUserPersonality(tag, userSlug) : true; // keep if no tag
  });
}
