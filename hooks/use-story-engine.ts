import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { storyService } from '@/api/services/story.service'

interface EngineChoice {
  id: number | string
  text: string
  target_id: string
}

interface EnginePassage {
  passage_id: string
  content: string
  passage_type: 'narration' | 'dialogue' | 'decision' | 'ending'
  choices: EngineChoice[]
}

interface EngineState {
  story: any
  passage: EnginePassage
  progress: any
  chapter_title: string
  chapter_number?: number
}

interface UseStoryEngineProps {
  storyId: number
  chapterId?: number
}

const DEFAULT_MAX_RETRIES = 3

async function retryApiCall<T>(
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
        const introductionStory = await retryApiCall(
          () => storyService.getStoryById(storyId),
          DEFAULT_MAX_RETRIES,
          Platform.OS === 'web' ? 500 : 1000
        )

        if (!introductionStory) {
          throw new Error('Story not found. Please try again later.')
        }

        let startingPassageId = introductionStory.starting_passage_id

        if (!startingPassageId) {
          const restartResponse = await retryApiCall(
            () => storyService.restartStory(storyId, chapterId),
            DEFAULT_MAX_RETRIES,
            Platform.OS === 'web' ? 500 : 1000
          )

          if (!restartResponse.starting_passage) {
            throw new Error('Story restart did not provide a starting passage.')
          }

          startingPassageId = restartResponse.starting_passage
        }

        const initialState = await retryApiCall(
          () => storyService.getPassage(storyId, startingPassageId),
          DEFAULT_MAX_RETRIES,
          Platform.OS === 'web' ? 500 : 1000
        )

        if (!initialState || !initialState.passage) {
          throw new Error('Failed to load the opening passage.')
        }

        // Normalize choices: handle both target_id and target_passage_id
        if (initialState.passage?.choices && Array.isArray(initialState.passage.choices)) {
          initialState.passage.choices = initialState.passage.choices.map((choice: any) => ({
            id: choice.id || choice.choice_id,
            text: choice.text || choice.choice_text || choice.label,
            target_id: choice.target_id || choice.target_passage_id || choice.target,
          }))
          console.log('📖 Normalized choices:', initialState.passage.choices)
        } else {
          console.log('⚠️ No choices found in passage:', initialState.passage)
        }

        setEngineState(initialState)
      } catch (err: any) {
        let message = 'Failed to load story.'

        if (err?.message) {
          message = err.message
        } else if (err?.response) {
          message = `Network error: ${err.response.status} - ${err.response.statusText}`
        } else if (err?.request) {
          message = 'Network request failed. Please check your connection.'
        }

        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    startStoryFlow()
  }, [storyId, chapterId])

  const makeChoice = useCallback(
    async (choice: EngineChoice) => {
      if (isLoading || !storyId || !choice?.target_id) return null

      setIsLoading(true)
      setError(null)

      try {
        const nextState = await retryApiCall(
          () => storyService.makeChoice(storyId, choice.target_id),
          DEFAULT_MAX_RETRIES,
          Platform.OS === 'web' ? 500 : 1000
        )

        if (!nextState || !nextState.passage) {
          throw new Error(`Failed to load the next passage.`)
        }

        // Normalize choices: handle both target_id and target_passage_id
        if (nextState.passage?.choices && Array.isArray(nextState.passage.choices)) {
          nextState.passage.choices = nextState.passage.choices.map((choice: any) => ({
            id: choice.id || choice.choice_id,
            text: choice.text || choice.choice_text || choice.label,
            target_id: choice.target_id || choice.target_passage_id || choice.target,
          }))
          console.log('📖 Normalized choices:', nextState.passage.choices)
        } else {
          console.log('⚠️ No choices found in passage:', nextState.passage)
        }

        const currentChapterTitle = engineState?.chapter_title
        const currentChapterNumber = engineState?.chapter_number

        const updatedState: EngineState = {
          ...nextState,
          chapter_title: nextState.chapter_title || currentChapterTitle,
          chapter_number: nextState.chapter_number || currentChapterNumber,
        }

        setEngineState(updatedState)
        return updatedState
      } catch (err: any) {
        let message = 'Failed to process choice.'

        if (err?.message) {
          message = err.message
        } else if (err?.response) {
          message = `Network error: ${err.response.status} - ${err.response.statusText}`
        } else if (err?.request) {
          message = 'Network request failed. Please check your connection.'
        }

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


