import type { StoryCard, CardStatus } from '@/types/hub'
import type { StoryProgressResponse, StoryResponse } from '@/api/types'
import { getStoryImageUrl } from '@/utils/story-helpers'
import { isStoryUnlocked } from '@/utils/story-constants'

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  // Handle empty or falsy strings
  if (!text || text.trim().length === 0) return text
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/** Prologue is story 1 (first card, no resources). */
function isPrologueStory(story: StoryResponse): boolean {
  const titleLower = String(story.title ?? '').toLowerCase()
  return titleLower.includes('prologue') || titleLower === 'prologue'
}

/**
 * Map API stories to StoryCard format for the hub
 * 
 * @param stories - Array of story data from API
 * @param userCreatedAt - User creation date for daily unlock calculation (optional)
 */
export function mapStoriesToCards(
  stories: StoryResponse[],
  userCreatedAt?: string | Date | null,
  progressList?: StoryProgressResponse[]
): StoryCard[] {
  if (!stories || stories.length === 0) {
    return []
  }

  const progressByStoryId = new Map<number, StoryProgressResponse>()
  if (Array.isArray(progressList)) {
    progressList.forEach((item) => {
      if (typeof item?.story === 'number') {
        progressByStoryId.set(item.story, item)
      }
    })
  }

  // Helper function to map a story to a card
  function mapStoryToCard(story: StoryResponse, index: number, isPrologue = false): StoryCard {
    // Determine status based on story data and user progress
    let status: CardStatus = 'available'
    
    // Check daily unlock system first (for non-prologue stories)
    if (!isPrologue) {
      const isUnlocked = isStoryUnlocked(story.id, userCreatedAt)
      if (!isUnlocked) {
        status = 'locked'
      }
    }
    
    // Also check level requirement (legacy check)
    if ((story.min_level ?? 1) > 1 && status !== 'locked') {
      status = 'locked'
    }

    const progress = progressByStoryId.get(story.id)
    const completionCount = Number(progress?.story_variables?.completion_count ?? 0)

    if (status !== 'locked' && completionCount > 0) {
      status = 'completed'
    }

    // Prologue (story 1) never has resources
    const hasResources = !isPrologue

    // Truncate backend data to prevent overflow in card. Prologue is 1; others are 2, 3, ...
    const label = isPrologue ? 'PROLOGUE' : `STORY ${index + 2}`

    return {
      id: `story-${story.id}`,
      label,
      title: truncateText(story.title, 50),
      subtitle: truncateText(story.atmosphere || 'THE ARCHIVE', 30),
      tagline: story.description || 'Your journey awaits',
      storyId: story.id,
      status,
      hasResources,
      imageUrl: getStoryImageUrl(story.image),
      revelations: story.revelations || [],
    }
  }

  // Drop only stories marked hidden by the backend
  const visibleStories = stories.filter((story) => !story.is_hidden)

  // Prologue is story 1 (first card)
  const prologueStory = visibleStories.find(isPrologueStory)
  const otherStories = visibleStories
    .filter((story) => !isPrologueStory(story))
    .sort((a, b) => a.id - b.id)

  const prologueCard = prologueStory
    ? mapStoryToCard(prologueStory, 0, true)
    : null
  const otherStoryCards: StoryCard[] = otherStories.map((story, index) =>
    mapStoryToCard(story, index, false)
  )

  if (prologueCard) {
    return [prologueCard, ...otherStoryCards]
  }
  return otherStoryCards
}

