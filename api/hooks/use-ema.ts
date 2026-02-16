import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { emaService } from '../services/ema.service'
import type { EmaSubmitRequest } from '@/types/ema'

export const emaKeys = {
  all: ['ema'] as const,
  prompts: (day: number) => [...emaKeys.all, 'prompts', day] as const,
  myResponse: (day: number) => [...emaKeys.all, 'my-response', day] as const,
  responseForStory: (storyCompletionId: number) =>
    [...emaKeys.all, 'response-for-story', storyCompletionId] as const,
}

/**
 * Fetch EMA prompts for a study day (1–5).
 * Use study_day from story completion response.
 */
export function useEmaPrompts(studyDay: number | null) {
  const day = studyDay != null ? Math.min(5, Math.max(1, studyDay)) : null
  return useQuery({
    queryKey: emaKeys.prompts(day ?? 0),
    queryFn: () => emaService.getPrompts(day!),
    enabled: day != null && day >= 1 && day <= 5,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Submit EMA response (story_completion_id + answers).
 */
export function useSubmitEma() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: EmaSubmitRequest) => emaService.submitResponse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emaKeys.all })
    },
  })
}

/**
 * Check if user already responded for a study day (e.g. GET /me/?day=X).
 */
export function useEmaMyResponse(day: number | null) {
  const d = day != null ? Math.min(5, Math.max(1, day)) : null
  return useQuery({
    queryKey: emaKeys.myResponse(d ?? 0),
    queryFn: () => emaService.getMyResponse(d!),
    enabled: d != null && d >= 1 && d <= 5,
    staleTime: 60 * 1000,
  })
}

/**
 * Check if user already has an EMA response for this story completion.
 * If so, show "Data already collected"; otherwise show the form.
 */
export function useEmaResponseForStory(storyCompletionId: number | null) {
  return useQuery({
    queryKey: emaKeys.responseForStory(storyCompletionId ?? 0),
    queryFn: () => emaService.getResponseForStoryCompletion(storyCompletionId!),
    enabled: storyCompletionId != null && storyCompletionId > 0,
    staleTime: 60 * 1000,
  })
}
