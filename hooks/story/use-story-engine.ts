import { useCallback, useEffect, useRef, useState } from 'react'
import { storyService } from '@/api/services/story.service'
import { usePassageChoices } from '@/api/hooks/use-story'
import type { StoryChoice } from '@/types/story'
import type { UseStoryEngineResult, EngineState, UseStoryEngineProps } from '@/types/hooks'
import {
  retryApiCall,
  getStartingPassageId,
  normalizePassageState,
  normalizeChoices,
  DEFAULT_MAX_RETRIES,
  getRetryDelay,
} from '@/utils/story-helpers'


function extractErrorMessage(err: any): string {
  if (err?.message) return err.message
  if (err?.response) {
    return `Network error: ${err.response.status} - ${err.response.statusText}`
  }
  if (err?.request) return 'Network request failed. Please check your connection.'
  return 'An unexpected error occurred.'
}

export function useStoryEngine({ storyId }: UseStoryEngineProps): UseStoryEngineResult {
  const [engineState, setEngineState] = useState<EngineState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const passagePkMapRef = useRef<Map<string, string>>(new Map())
  const passageIdMapRef = useRef<Map<string, string>>(new Map())
  const [currentPassagePk, setCurrentPassagePk] = useState<string | null>(null)
  const startedRef = useRef(false)

  const hydratePassageMaps = useCallback(async () => {
    if (passagePkMapRef.current.size > 0 && passageIdMapRef.current.size > 0) return
    const passages = await retryApiCall(
      () => storyService.getStoryPassages(Number(storyId)),
      DEFAULT_MAX_RETRIES,
      getRetryDelay()
    )
    const map = new Map<string, string>()
    const reverseMap = new Map<string, string>()
    passages.forEach((item: any) => {
      if (item?.passage_id && item?.id) {
        map.set(String(item.passage_id), String(item.id))
        reverseMap.set(String(item.id), String(item.passage_id))
      }
    })
    passagePkMapRef.current = map
    passageIdMapRef.current = reverseMap
  }, [storyId])

  const resolvePassagePk = useCallback(async (passage: any): Promise<string | null> => {
    if (!passage) return null
    if (passage.id) return String(passage.id)
    if (passage.passage_id) {
      const existing = passagePkMapRef.current.get(String(passage.passage_id))
      if (existing) return existing
    }

    const passages = await retryApiCall(
      () => storyService.getStoryPassages(Number(storyId)),
      DEFAULT_MAX_RETRIES,
      getRetryDelay()
    )
    const map = new Map<string, string>()
    const reverseMap = new Map<string, string>()
    passages.forEach((item: any) => {
      if (item?.passage_id && item?.id) {
        map.set(String(item.passage_id), String(item.id))
        reverseMap.set(String(item.id), String(item.passage_id))
      }
    })
    passagePkMapRef.current = map
    passageIdMapRef.current = reverseMap
      if (passage?.passage_id) {
        const resolved = map.get(String(passage.passage_id)) || null
      return resolved
    }
    return null
  }, [storyId])

  const { data: passageChoices } = usePassageChoices(currentPassagePk)

  useEffect(() => {
    startedRef.current = false
  }, [storyId])

  useEffect(() => {
    if (!storyId) {
      setIsLoading(false)
      return
    }

    async function startStoryFlow() {
      if (startedRef.current) return
      startedRef.current = true
      setIsLoading(true)
      setError(null)
      setEngineState(null)

      try {
        const startResponse = await retryApiCall(
          () => storyService.restartStory(Number(storyId)),
          DEFAULT_MAX_RETRIES,
          getRetryDelay()
        )

        let initialState: any = startResponse

        if (!initialState?.passage) {
          const startingPassageId =
            startResponse?.starting_passage_id ||
            startResponse?.starting_passage ||
            startResponse?.story?.starting_passage_id ||
            startResponse?.story?.starting_passage

          if (startingPassageId) {
            initialState = await retryApiCall(
              () => storyService.getPassage(Number(storyId), String(startingPassageId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay()
            )
          } else {
            const { startingPassageId: restartPassageId } = await getStartingPassageId(storyId)
            initialState = await retryApiCall(
              () => storyService.getPassage(Number(storyId), restartPassageId),
              DEFAULT_MAX_RETRIES,
              getRetryDelay()
            )
          }
        }

        if (!initialState || !initialState.passage) {
          throw new Error('Failed to fetch the initial passage.')
        }

        // Normalize the passage state
        const normalizedState = normalizePassageState(initialState)

        setEngineState(normalizedState)
      } catch (err: any) {
        const message = extractErrorMessage(err)
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    startStoryFlow()
  }, [storyId])

  useEffect(() => {
    let isActive = true

    async function setPassagePk() {
      if (!engineState?.passage) {
        if (isActive) setCurrentPassagePk(null)
        return
      }
      const passagePk = await resolvePassagePk(engineState.passage)
      if (isActive) setCurrentPassagePk(passagePk)
    }

    setPassagePk()

    return () => {
      isActive = false
    }
  }, [engineState?.passage?.passage_id, resolvePassagePk])

  useEffect(() => {
    if (!passageChoices || !engineState?.passage) return

    setEngineState((prev) => {
      if (!prev?.passage) return prev
      if (prev.passage.choices === passageChoices) return prev
      return {
        ...prev,
        passage: {
          ...prev.passage,
          choices: normalizeChoices(passageChoices),
        },
      }
    })
  }, [passageChoices, engineState?.passage?.passage_id])

  const makeChoice = useCallback(
    async (choice: StoryChoice) => {
      if (isLoading || !storyId || !choice?.target_id) return null

      setIsLoading(true)
      setError(null)

      try {
        await hydratePassageMaps()
        const rawTargetId = String(choice.target_id).trim()
        const isNumericTarget = /^\d+$/.test(rawTargetId)
        const targetPassageId = isNumericTarget
          ? passageIdMapRef.current.get(rawTargetId) || rawTargetId
          : rawTargetId
        try {
          await retryApiCall(
            () =>
              storyService.makeChoice(storyId, String(targetPassageId), choice.text, {
                story_id: storyId,
                choice_id: choice.id,
              }),
            DEFAULT_MAX_RETRIES,
            getRetryDelay()
          )
        } catch {
          // Logging shouldn't block traversal
        }

        let nextPassageState
        nextPassageState = await retryApiCall(
          () => storyService.getPassage(Number(storyId), String(targetPassageId)),
          DEFAULT_MAX_RETRIES,
          getRetryDelay()
        )

        if (!nextPassageState || !nextPassageState.passage) {
          throw new Error('Failed to load the next passage.')
        }

        // Normalize choices
        const normalizedState = normalizePassageState(nextPassageState)

        setEngineState(normalizedState)
        return normalizedState
      } catch (err: any) {
        const message = extractErrorMessage(err)
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [storyId, isLoading, engineState, hydratePassageMaps]
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
    storyTitle: engineState?.story?.title || null,
    makeChoice,
    isInitialized: !!engineState,
    isEnding,
    isDecision,
    hasChoices,
    hasMultipleChoices,
    choices,
  }
}
