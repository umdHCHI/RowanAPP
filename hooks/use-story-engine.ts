import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { storyService } from '@/api/services/story.service'
import type { StoryPassage, StoryChoice } from '@/types/story'
import {
  retryApiCall,
  getStartingPassageId,
  normalizePassageState,
} from './use-story-engine-helpers'
import { normalizeChoices } from '@/utils/story-helpers'

interface EngineState {
  story: any
  passage: StoryPassage & { choices: StoryChoice[] }
  progress: any
  chapter_title: string
  chapter_number?: number
}

interface UseStoryEngineProps {
  storyId: string | number
  chapterId?: number
}

const DEFAULT_MAX_RETRIES = 3

function getRetryDelay(): number {
  return Platform.OS === 'web' ? 500 : 1000
}

function extractErrorMessage(err: any): string {
  if (err?.message) return err.message
  if (err?.response) {
    return `Network error: ${err.response.status} - ${err.response.statusText}`
  }
  if (err?.request) return 'Network request failed. Please check your connection.'
  return 'An unexpected error occurred.'
}

export function useStoryEngine({ storyId, chapterId }: UseStoryEngineProps) {
  const [engineState, setEngineState] = useState<EngineState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!storyId) {
      setIsLoading(false)
      return
    }

    async function startStoryFlow() {
      setIsLoading(true)
      setError(null)
      setEngineState(null)

      try {
        // Get starting passage ID and chapter info
        const { startingPassageId, chapterTitle, chapterNumber } =
          await getStartingPassageId(storyId, chapterId)

        // Fetch the starting passage using the ID
        const initialState = await retryApiCall(
          () => storyService.getPassage(Number(storyId), startingPassageId),
          DEFAULT_MAX_RETRIES,
          getRetryDelay()
        )

        if (!initialState || !initialState.passage) {
          throw new Error('Failed to fetch the initial passage.')
        }

        // Normalize the passage state
        const normalizedState = normalizePassageState(
          initialState,
          chapterTitle,
          chapterNumber
        )

        setEngineState(normalizedState)
      } catch (err: any) {
        const message = extractErrorMessage(err)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    startStoryFlow()
  }, [storyId, chapterId])

  const makeChoice = useCallback(
    async (choice: StoryChoice) => {
      if (isLoading || !storyId || !choice?.target_id) return null

      setIsLoading(true)
      setError(null)

      try {
        const nextState = await retryApiCall(
          () => storyService.makeChoice(storyId, choice.target_id),
          DEFAULT_MAX_RETRIES,
          getRetryDelay()
        )

        if (!nextState || !nextState.passage) {
          throw new Error('Failed to load the next passage.')
        }

        // Normalize choices
        const normalizedState = normalizePassageState(nextState)

        // Preserve chapter info from current state
        const updatedState: EngineState = {
          ...normalizedState,
          chapter_title:
            normalizedState.chapter_title || engineState?.chapter_title || '',
          chapter_number:
            normalizedState.chapter_number ?? engineState?.chapter_number,
        }

        setEngineState(updatedState)
        return updatedState
      } catch (err: any) {
        const message = extractErrorMessage(err)
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [storyId, isLoading, engineState]
  )

  const currentPassage = engineState?.passage || null
  const choices = currentPassage?.choices || []

  const isNarration =
    currentPassage?.passage_type === 'narration' ||
    currentPassage?.passage_type === 'dialogue'
  const isDecision = currentPassage?.passage_type === 'decision'
  const isEnding = currentPassage?.passage_type === 'ending'
  const hasChoices = choices.length > 0
  const hasMultipleChoices = choices.length > 1

  return {
    isLoading,
    error,
    currentPassage,
    chapterTitle: engineState?.chapter_title || null,
    chapterNumber: engineState?.chapter_number || null,
    makeChoice,
    isInitialized: !!engineState,
    isEnding,
    isDecision,
    hasChoices,
    hasMultipleChoices,
    choices,
  }
}
