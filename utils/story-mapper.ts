import type { StoryData } from '@/stores/game-store'
import type { StoryCard, CardStatus } from '@/types/hub'

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
 * Check if a story is the Introduction story
 */
function isIntroductionStory(story: StoryData): boolean {
  const titleLower = story.title.toLowerCase()
  return titleLower.includes('introduction') || titleLower === 'introduction'
}

/**
 * Map API stories to StoryCard format for the hub
 */
export function mapStoriesToCards(stories: StoryData[]): StoryCard[] {
  if (!stories || stories.length === 0) {
    return []
  }

  // Helper function to map a story to a card
  function mapStoryToCard(story: StoryData, index: number, isIntroduction = false): StoryCard {
    // Determine status based on story data and user progress
    let status: CardStatus = 'available'
    if (story.min_level > 1) {
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
      revelations: story.revelations || [],
    }
  }

  // Find the Introduction story
  const introductionStory = stories.find(isIntroductionStory)

  // Filter stories: only show those with empty personality_focus array (no personality focus)
  // Also exclude Introduction from this list
  const otherStories = stories
    .filter(
      (story) => !isIntroductionStory(story) && (!story.personality_focus || story.personality_focus.length === 0)
    )
    .sort((a, b) => {
      // Extract chapter numbers from titles (e.g., "Chapter Two" -> 2, "Chapter Three" -> 3)
      function extractChapterNumber(title: string): number | null {
        const match = title.match(/Chapter\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|\d+)/i)
        if (!match) return null
        
        const chapterText = match[1].toLowerCase()
        const numberMap: Record<string, number> = {
          'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
          'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        }
        
        return numberMap[chapterText] || parseInt(chapterText, 10)
      }
      
      const aChapter = extractChapterNumber(a.title)
      const bChapter = extractChapterNumber(b.title)
      
      // If both have chapter numbers, sort by chapter number
      if (aChapter !== null && bChapter !== null) {
        return aChapter - bChapter
      }
      
      // If only one has a chapter number, the one without comes first (base story before numbered chapters)
      if (aChapter === null && bChapter !== null) {
        return -1
      }
      if (aChapter !== null && bChapter === null) {
        return 1
      }
      
      // If neither has chapter numbers, sort by ID descending (newer stories first)
      return b.id - a.id
    })

  // Map Introduction story to card (if found) - explicitly set hasResources to false
  const introductionCard = introductionStory
    ? mapStoryToCard(introductionStory, 0, true)
    : null

  // Map other stories to cards
  const otherStoryCards: StoryCard[] = otherStories.map((story, index) =>
    mapStoryToCard(story, index + 1, false)
  )

  // Return Introduction first, then other stories with empty personality_focus
  if (introductionCard) {
    return [introductionCard, ...otherStoryCards]
  }

  // If no Introduction found, return only stories with empty personality_focus
  return otherStoryCards
}

