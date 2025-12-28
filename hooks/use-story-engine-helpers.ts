import { Platform } from 'react-native'
import { storyService } from '@/api/services/story.service'
import { normalizeChoices } from '@/utils/story-helpers'
import { INTRODUCTION_STORY_ID } from '@/utils/story-constants'

const DEFAULT_MAX_RETRIES = 3

/**
 * Retry an API call with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/**
 * Get platform-specific retry delay
 */
function getRetryDelay(): number {
  return Platform.OS === 'web' ? 500 : 1000
}

/**
 * Check if a story is the introduction story
 */
export function isIntroductionStory(storyId: string | number): boolean {
  return Number(storyId) === INTRODUCTION_STORY_ID
}

/**
 * Find the starting chapter from a list of chapters
 */
export function findStartingChapter(chapters: any[]) {
  if (!chapters || chapters.length === 0) return null

  // Find the starting chapter (is_starting_chapter: true) or the first chapter by chapter_number
  const startingChapter =
    chapters.find((ch: any) => ch.is_starting_chapter) ||
    chapters.sort((a: any, b: any) => (a.chapter_number || 0) - (b.chapter_number || 0))[0]

  return startingChapter || null
}

/**
 * Get starting passage ID for a story
 */
export async function getStartingPassageId(
  storyId: string | number,
  chapterId?: number
): Promise<{
  startingPassageId: string
  chapterTitle?: string
  chapterNumber?: number
}> {
  const isIntro = isIntroductionStory(storyId)
  const retryDelay = getRetryDelay()

  // If chapterId is provided, use it directly
  if (chapterId) {
    try {
      const restartResponse = await retryApiCall(
        () => storyService.restartStory(storyId, chapterId),
        DEFAULT_MAX_RETRIES,
        retryDelay
      )

      if (restartResponse.starting_passage) {
        // Get chapter info for title
        const chapters = await retryApiCall(
          () => storyService.getChapters(storyId),
          DEFAULT_MAX_RETRIES,
          retryDelay
        ).catch(() => null)

        const currentChapter = chapters?.find((ch: any) => ch.id === chapterId)
        return {
          startingPassageId: restartResponse.starting_passage,
          chapterTitle: currentChapter?.title,
          chapterNumber: currentChapter?.chapter_number,
        }
      }
    } catch (error) {
      console.error(`Failed to restart story ${storyId} with chapter ${chapterId}:`, error)
    }
  }

  // Try to find the first chapter if no chapterId provided
  if (!chapterId && !isIntro) {
    try {
      const chapters = await retryApiCall(
        () => storyService.getChapters(storyId),
        DEFAULT_MAX_RETRIES,
        retryDelay
      )

      const startingChapter = findStartingChapter(chapters)
      if (startingChapter) {
        const actualChapterId = startingChapter.id
        const restartResponse = await retryApiCall(
          () => storyService.restartStory(storyId, actualChapterId),
          DEFAULT_MAX_RETRIES,
          retryDelay
        )

        if (restartResponse.starting_passage) {
          return {
            startingPassageId: restartResponse.starting_passage,
            chapterTitle: startingChapter.title,
            chapterNumber: startingChapter.chapter_number,
          }
        }
      }
    } catch (error) {
      console.log(`Could not fetch chapters for story ${storyId}, using standard story flow`)
    }
  }

  // Use standard story flow
  if (isIntro && chapterId) {
    // For Introduction story with chapters, use restartChapter
    const restartResponse = await retryApiCall(
      () => storyService.restartChapter(storyId, chapterId),
      DEFAULT_MAX_RETRIES,
      retryDelay
    )

    if (!restartResponse.starting_passage) {
      throw new Error('Chapter restart did not provide a starting passage ID.')
    }

    // Fetch chapter info
    const chapters = await retryApiCall(
      () => storyService.getChapters(storyId),
      DEFAULT_MAX_RETRIES,
      retryDelay
    )

    const currentChapter = chapters.find((ch: any) => ch.id === chapterId)
    return {
      startingPassageId: restartResponse.starting_passage,
      chapterTitle: currentChapter?.title,
      chapterNumber: currentChapter?.chapter_number,
    }
  } else {
    // For stories without chapters, use the standard restart flow
    const restartResponse = await retryApiCall(
      () => storyService.restartStory(storyId),
      DEFAULT_MAX_RETRIES,
      retryDelay
    )

    if (!restartResponse.starting_passage) {
      throw new Error('Story restart did not provide a starting passage ID.')
    }

    return {
      startingPassageId: restartResponse.starting_passage,
    }
  }
}

/**
 * Normalize passage state from API response
 */
export function normalizePassageState(state: any, chapterTitle?: string, chapterNumber?: number) {
  // Normalize choices
  if (state.passage?.choices && Array.isArray(state.passage.choices)) {
    state.passage.choices = normalizeChoices(state.passage.choices)
  }

  // Override chapter info if provided
  if (chapterTitle !== undefined) {
    state.chapter_title = chapterTitle
  }
  if (chapterNumber !== undefined) {
    state.chapter_number = chapterNumber
  }

  return state
}

