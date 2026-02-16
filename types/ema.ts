/**
 * EMA (Ecological Momentary Assessment) types
 * Used for post-story surveys on study days 1–5.
 */

export interface EmaPrompt {
  id: string
  label: string
  type: 'scale'
  min: number
  max: number
}

export interface EmaPromptsResponse {
  day: number
  prompts: EmaPrompt[]
}

export interface EmaSubmitRequest {
  story_completion_id: number
  answers: Record<string, number>
}

export interface EmaResponse {
  id: number
  story_completion_id?: number
  story_completion?: number
  study_day: number
  answers: Record<string, number>
  submitted_at: string
  completed_on?: string
  user?: number
  user_data?: unknown
  story_data?: unknown
}

/** Paginated list from GET /api/ema/responses/ */
export interface EmaListResponse {
  count: number
  next: string | null
  previous: string | null
  results: EmaResponse[]
}

/** Payload to show EMA form after story completion (from passage or complete response). */
export interface EmaRequestPayload {
  storyCompletionId: number
  studyDay: number
}
