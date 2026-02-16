import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type {
  EmaPromptsResponse,
  EmaSubmitRequest,
  EmaResponse,
  EmaListResponse,
} from '@/types/ema'

function unwrapData<T>(response: unknown): T {
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: T }).data
  }
  return response as T
}

/**
 * EMA Service
 * Ecological Momentary Assessment: prompts and responses after story completion (study days 1–5).
 */
export const emaService = {
  /**
   * Fetch prompts for the EMA form.
   * GET /api/ema/prompts/?day={1|2|3|4|5}
   */
  async getPrompts(day: number): Promise<EmaPromptsResponse> {
    const clamped = Math.min(5, Math.max(1, day))
    const endpoint = `${API_ENDPOINTS.EMA_PROMPTS}?day=${clamped}`
    const response = await apiClient.get<EmaPromptsResponse>(endpoint)
    const raw = unwrapData<EmaPromptsResponse>(response)
    if (raw && typeof raw === 'object' && 'prompts' in raw) {
      return raw as EmaPromptsResponse
    }
    return { day: clamped, prompts: [] }
  },

  /**
   * Submit EMA response.
   * POST /api/ema/responses/
   */
  async submitResponse(payload: EmaSubmitRequest): Promise<EmaResponse> {
    const response = await apiClient.post<EmaResponse>(
      API_ENDPOINTS.EMA_SUBMIT_RESPONSE,
      payload
    )
    return unwrapData<EmaResponse>(response) as EmaResponse
  },

  /**
   * List current user's EMA responses (paginated).
   * GET /api/ema/responses/
   * Used to detect if user already responded for a study day.
   */
  async getResponsesList(): Promise<EmaResponse[]> {
    let url: string | null = API_ENDPOINTS.EMA_SUBMIT_RESPONSE
    const all: EmaResponse[] = []
    while (url) {
      const response = await apiClient.get<EmaListResponse | EmaResponse[]>(url, {
        suppressErrorLog: true,
      })
      const raw = unwrapData<EmaListResponse | EmaResponse[]>(response)
      if (Array.isArray(raw)) {
        all.push(...(raw as EmaResponse[]))
        break
      }
      const list = raw as EmaListResponse
      if (list?.results && Array.isArray(list.results)) {
        all.push(...list.results)
        url = list.next ?? null
        continue
      }
      break
    }
    return all
  },

  /**
   * Check if user already responded for a study day.
   * Uses GET /api/ema/responses/ and filters by study_day.
   */
  async getMyResponse(day: number): Promise<EmaResponse | null> {
    const list = await this.getResponsesList()
    const d = Math.min(5, Math.max(1, day))
    const found = list.find((r) => r.study_day === d)
    return found ?? null
  },

  /**
   * Check if user already has an EMA response for this story completion.
   * GET /api/ema/responses/ then find by story_completion (or story_completion_id).
   * Used to show "Data already collected" instead of the form.
   */
  async getResponseForStoryCompletion(
    storyCompletionId: number
  ): Promise<EmaResponse | null> {
    const list = await this.getResponsesList()
    const found = list.find(
      (r) =>
        r.story_completion === storyCompletionId ||
        (r as any).story_completion_id === storyCompletionId
    )
    return found ?? null
  },

  /**
   * Edit a response within 24h.
   * PATCH /api/ema/responses/{id}/
   */
  async patchResponse(
    id: number,
    answers: Record<string, number>
  ): Promise<EmaResponse> {
    const response = await apiClient.patch<EmaResponse>(
      API_ENDPOINTS.EMA_RESPONSE_BY_ID(id),
      { answers }
    )
    return unwrapData<EmaResponse>(response) as EmaResponse
  },
}
