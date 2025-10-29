// utils/personalityFilter.ts
import { toPersonalityKey } from '../types/personality';

/** Filter stories by personality focus */
export function filterStoriesByPersonality(
  stories: Array<{ id: string | number; title?: string; personality_focus?: string[] }>,
  userPersonalityType: string,
  includeGeneral: boolean = false
): Array<{ id: string | number; title?: string; personality_focus?: string[] }> {
  const userTraitKey = toPersonalityKey(userPersonalityType);
  if (!userTraitKey) return stories;

  return stories.filter(story => {
    // Always include Introduction stories
    if (story.id === 12 || story.id === '12' || story.title?.toLowerCase().includes('introduction')) {
      return true;
    }

    const storyPersonalityFocus = story.personality_focus;
    
    // If no personality_focus or empty array, it's a general story
    const isGeneralStory = !storyPersonalityFocus || !Array.isArray(storyPersonalityFocus) || storyPersonalityFocus.length === 0;
    
    if (isGeneralStory) {
      return includeGeneral;
    }
    
    // Check if any of the story's personality focus matches the user's trait
    return storyPersonalityFocus.some(focus => {
      const storyFocusKey = toPersonalityKey(focus);
      return storyFocusKey === userTraitKey;
    });
  });
}
