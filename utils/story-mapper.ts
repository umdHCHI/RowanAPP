import type { StoryData } from '@/stores/game-store'
import type { StoryCard, CardStatus } from '@/types/hub'
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

/**
 * Check if a story is the Introduction story -- wait Trevor might have created a different function somewhere.... 
 */
function isIntroductionStory(story: StoryData): boolean {
  const titleLower = story.title.toLowerCase()
  return titleLower.includes('introduction') || titleLower === 'introduction'
}

/**
 * Map API stories to StoryCard format for the hub
 * 
 * @param stories - Array of story data from API
 * @param userCreatedAt - User creation date for daily unlock calculation (optional)
 */
export function mapStoriesToCards(
  stories: StoryData[],
  userCreatedAt?: string | Date | null
): StoryCard[] {
  if (!stories || stories.length === 0) {
    return []
  }

  // Helper function to map a story to a card
  function mapStoryToCard(story: StoryData, index: number, isIntroduction = false): StoryCard {
    // Determine status based on story data and user progress
    let status: CardStatus = 'available'
    
    // Check daily unlock system first (for non-introduction stories)
    if (!isIntroduction) {
      const isUnlocked = isStoryUnlocked(story.id, userCreatedAt)
      if (!isUnlocked) {
        status = 'locked'
      }
    }
    
    // Also check level requirement (legacy check) //remove legacy check>? 
    if (story.min_level > 1 && status !== 'locked') {
      // Check if user meets level requirement (you can enhance this)
      status = 'locked'
    }

    // Check if story has chapters, but Introduction should never have resources
    const hasResources = isIntroduction ? false : (story.chapters && story.chapters.length > 0)

    // Truncate backend data to prevent overflow in card
    // Title: max 50 chars (for display card titles)
    // Subtitle: max 30 chars (usually short like "THE ARCHIVE")
    // Tagline: no truncation - card can scroll to show full description
    return {
      id: `story-${story.id}`,
      label: story.category === 'main' ? `STORY ${index + 1}` : story.category.toUpperCase(),
      title: truncateText(story.title, 50),
      subtitle: truncateText(story.atmosphere || 'THE ARCHIVE', 30),
      tagline: story.description || 'Your journey awaits',
      chapterId: story.id,
      status,
      hasResources,
      imageUrl: getStoryImageUrl(story.image),
      revelations: story.revelations || [],
    }
  }

  // Find the Introduction story
  const introductionStory = stories.find(isIntroductionStory)

  // Filter stories: only show those with empty personality_focus array (no personality focus)
  // Also exclude Introduction from this list
  // Note: We still include locked stories in the list so users can see what's coming
  const otherStories = stories
    .filter(
      (story) => !isIntroductionStory(story) && (!story.personality_focus || story.personality_focus.length === 0)
    )
    .sort((a, b) => {
      // Sort by ID ascending (28, 29, 30, etc.)
      return a.id - b.id
    })

  // Map Introduction story to card (if found) - explicitly set hasResources to false
  const introductionCard = introductionStory
    ? mapStoryToCard(introductionStory, 0, true)
    : null

  // Map other stories to cards
  // Story numbering starts at 1 for the first non-introduction story
  const otherStoryCards: StoryCard[] = otherStories.map((story, index) =>
    mapStoryToCard(story, index, false)
  )

  // Return Introduction first, then other stories with empty personality_focus
  if (introductionCard) {
    return [introductionCard, ...otherStoryCards]
  }

  // If no Introduction found, return only stories with empty personality_focus
  return otherStoryCards
}

