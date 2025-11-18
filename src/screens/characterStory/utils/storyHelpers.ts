import { Story } from '../../../types';

export type ProgressFilter = 'all' | 'completed' | 'in-progress' | 'not-started';
export type SortOption = 'title' | 'progress' | 'recent';

/**
 * Filter and sort stories based on progress and user preferences
 * Used in both StoryCatalogScreen and PassagesTab
 */
export const filterAndSortStories = (
  stories: Story[],
  storyProgress: Record<number, any>,
  progressFilter: ProgressFilter,
  sortBy: SortOption
): Story[] => {
  let filteredStories = [...stories];

  // Apply progress filter
  switch (progressFilter) {
    case 'completed':
      filteredStories = filteredStories.filter(story =>
        storyProgress[story.id]?.is_completed
      );
      break;
    case 'in-progress':
      filteredStories = filteredStories.filter(story => {
        const progress = storyProgress[story.id];
        return progress && !progress.is_completed && progress.passages_visited_count > 0;
      });
      break;
    case 'not-started':
      filteredStories = filteredStories.filter(story =>
        !storyProgress[story.id] || storyProgress[story.id].passages_visited_count === 0
      );
      break;
    default:
      // 'all' - no filtering
      break;
  }

  // Apply sorting
  filteredStories.sort((a, b) => {
    const progressA = storyProgress[a.id];
    const progressB = storyProgress[b.id];

    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');

      case 'recent':
        const lastPlayedA = progressA?.last_played
          ? new Date(progressA.last_played).getTime()
          : 0;
        const lastPlayedB = progressB?.last_played
          ? new Date(progressB.last_played).getTime()
          : 0;
        return lastPlayedB - lastPlayedA;

      case 'progress':
      default:
        // Archive-specific: prioritize intro stories
        const storyOrder: Record<number, number> = {
          12: 1, // Intro story
          27: 2, // Follow-up
          2: 3   // Advanced
        };

        const orderA = storyOrder[a.id] || 999;
        const orderB = storyOrder[b.id] || 999;

        if (orderA !== orderB) {
          return orderA - orderB;
        }

        // Then sort by progress percentage
        const progressPercentA = progressA?.progress_percentage || 0;
        const progressPercentB = progressB?.progress_percentage || 0;
        return progressPercentB - progressPercentA;
    }
  });

  return filteredStories;
};

/**
 * Calculate summary statistics for story progress
 * Used in progress summary display
 */
export const calculateProgressStats = (
  storyProgress: Record<number, any>
): {
  completed: number;
  inProgress: number;
  notStarted: number;
  averageProgress: number;
} => {
  const progressValues = Object.values(storyProgress);

  return {
    completed: progressValues.filter((p: any) => p.is_completed).length,
    inProgress: progressValues.filter(
      (p: any) => !p.is_completed && p.passages_visited_count > 0
    ).length,
    notStarted: progressValues.filter(
      (p: any) => !p || p.passages_visited_count === 0
    ).length,
    averageProgress: Math.round(
      progressValues.reduce((acc: number, p: any) =>
        acc + (p.progress_percentage || 0), 0
      ) / Math.max(progressValues.length, 1)
    )
  };
};

/**
 * Get rarity colors for story cards
 * Follows Archive's RPG aesthetic
 */
export const getRarityColors = (rarity: string): readonly [string, string] => {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();

  switch (normalizedRarity) {
    case "Legendary":
      return ["#F97316", "#FCD34D"]; // Orange-gold gradient
    case "Epic":
      return ["#A855F7", "#F472B6"]; // Purple-pink gradient
    case "Rare":
      return ["#3B82F6", "#06B6D4"]; // Blue-cyan gradient
    default:
      return ["#6B7280", "#9CA3AF"]; // Gray gradient
  }
};

/**
 * Get rarity glow effect
 */
export const getRarityGlow = (rarity: string): string => {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();

  switch (normalizedRarity) {
    case "Legendary":
      return "rgba(249, 115, 22, 0.3)";
    case "Epic":
      return "rgba(168, 85, 247, 0.3)";
    case "Rare":
      return "rgba(59, 130, 246, 0.3)";
    default:
      return "rgba(107, 114, 128, 0.2)";
  }
};
