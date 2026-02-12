import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { storyService } from '@/api/services/story.service'
import { usePassageChoices, storyKeys } from '@/api/hooks/use-story'
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

export function useStoryEngine({ storyId, shouldRestart = false }: UseStoryEngineProps): UseStoryEngineResult {
  const [engineState, setEngineState] = useState<EngineState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const passagePkMapRef = useRef<Map<string, string>>(new Map())
  const passageIdMapRef = useRef<Map<string, string>>(new Map())
  const [currentPassagePk, setCurrentPassagePk] = useState<string | null>(null)
  const startedRef = useRef(false)

  function fillPassageMapsFromList(passages: any[]) {
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
  }

  const hydratePassageMaps = useCallback(async () => {
    if (passagePkMapRef.current.size > 0 && passageIdMapRef.current.size > 0) return
    const passages = await retryApiCall(
      () => storyService.getStoryPassages(Number(storyId)),
      DEFAULT_MAX_RETRIES,
      getRetryDelay()
    )
    fillPassageMapsFromList(passages)
  }, [storyId])

  /** Resolve passage pk from passage; uses pre-filled maps so usually sync. */
  const resolvePassagePk = useCallback((passage: any): string | null => {
    if (!passage) return null
    if (passage.id) return String(passage.id)
    if (passage.passage_id) {
      const existing = passagePkMapRef.current.get(String(passage.passage_id))
      return existing ?? null
    }
    return null
  }, [])

  const queryClient = useQueryClient()
  const { data: passageChoices } = usePassageChoices(currentPassagePk)

  // Reset so startStoryFlow re-runs when storyId or restart intent changes (e.g. user taps "Restart this Book")
  useEffect(() => {
    startedRef.current = false
    passagePkMapRef.current = new Map()
    passageIdMapRef.current = new Map()
  }, [storyId, shouldRestart])

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
        let initialState: any = null
        let startingPassageId: string | null = null

        if (!shouldRestart) {
          const progress = await storyService.getStoryProgressByStoryId(storyId)
          const resumePassageId =
            progress?.current_passage_id
              ? String(progress.current_passage_id).trim()
              : null
          if (resumePassageId) {
            const [passageState, passages] = await Promise.all([
              retryApiCall(
                () => storyService.getPassage(Number(storyId), resumePassageId),
                DEFAULT_MAX_RETRIES,
                getRetryDelay()
              ),
              retryApiCall(
                () => storyService.getStoryPassages(Number(storyId)),
                DEFAULT_MAX_RETRIES,
                getRetryDelay()
              ),
            ])
            if (passageState?.passage) {
              fillPassageMapsFromList(passages)
              // Don't resume on an ending passage: restart from beginning so the story can be replayed
              const isEndingPassage =
                passageState.passage?.passage_type === 'ending'
              if (!isEndingPassage) {
                initialState = passageState
              }
            }
          }
        }

        if (!initialState?.passage) {
          const startResponse = await retryApiCall(
            () => storyService.restartStory(Number(storyId)),
            DEFAULT_MAX_RETRIES,
            getRetryDelay()
          )

          startingPassageId =
            startResponse?.starting_passage_id ||
            startResponse?.starting_passage ||
            startResponse?.story?.starting_passage_id ||
            startResponse?.story?.starting_passage ||
            null

          initialState = startResponse?.passage ? startResponse : null

          if (!initialState?.passage) {
            if (!startingPassageId) {
              const { startingPassageId: fromRestart } = await getStartingPassageId(storyId)
              startingPassageId = fromRestart
            }
            if (startingPassageId) {
              const [passageState, passages] = await Promise.all([
                retryApiCall(
                  () => storyService.getPassage(Number(storyId), String(startingPassageId)),
                  DEFAULT_MAX_RETRIES,
                  getRetryDelay()
                ),
                retryApiCall(
                  () => storyService.getStoryPassages(Number(storyId)),
                  DEFAULT_MAX_RETRIES,
                  getRetryDelay()
                ),
              ])
              fillPassageMapsFromList(passages)
              initialState = passageState
            }
          } else {
            const passages = await retryApiCall(
              () => storyService.getStoryPassages(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay()
            )
            fillPassageMapsFromList(passages)
          }
        }

        if (!initialState || !initialState.passage) {
          throw new Error('Failed to fetch the initial passage.')
        }

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
  }, [storyId, shouldRestart])

  useEffect(() => {
    if (!engineState?.passage) {
      setCurrentPassagePk(null)
      return
    }
    const passagePk = resolvePassagePk(engineState.passage)
    setCurrentPassagePk(passagePk)
  }, [engineState?.passage?.passage_id, engineState?.passage?.id, resolvePassagePk])

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

        let nextPassageState: any = null
        try {
          nextPassageState = await retryApiCall(
            () => storyService.getPassage(Number(storyId), String(targetPassageId)),
            DEFAULT_MAX_RETRIES,
            getRetryDelay()
          )
        } catch (firstErr) {
          // Some backends expect passage by PK; try PK if targetPassageId looks like UUID and we have a mapping
          const pk = passagePkMapRef.current.get(String(targetPassageId))
          if (pk) {
            nextPassageState = await retryApiCall(
              () => storyService.getPassage(Number(storyId), String(pk)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay()
            )
          }
          if (!nextPassageState) throw firstErr
        }

        if (!nextPassageState || !nextPassageState.passage) {
          throw new Error('Failed to load the next passage.')
        }

        // Normalize choices
        const normalizedState = normalizePassageState(nextPassageState)

        setEngineState(normalizedState)
        // Invalidate passage-choices so revisiting the same passage refetches (avoids stale filtered list)
        queryClient.invalidateQueries({ queryKey: [...storyKeys.all, 'passage-choices'] })
        return normalizedState
      } catch (err: any) {
        const message = extractErrorMessage(err)
        setError(message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [storyId, isLoading, engineState, hydratePassageMaps, queryClient]
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
