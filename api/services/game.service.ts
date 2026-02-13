import { apiClient } from '../client'
import { API_ENDPOINTS } from '../constants'
import type { ApiResponse } from '../types'

/**
 * Game Service
 * Aligned to Django game app: GameDataViewSet and game/urls.py
 * - GET/POST /api/game/game-data/my-data/
 * - GET /api/game/game-data/stats/
 * - POST /api/game/record-progress/
 * - POST /api/game/game-data/vantage/run/
 * - GET|POST|PATCH /api/game/gain-wellness/
 */

export interface GameDataResponse {
  score?: number
  vantage_times_played?: number
  vantage_wins?: number
  vantage_losses?: number
  vantage_lumens_gathered?: number
  vantage_thoughts_reframed?: number
  vantage_thoughts_defeated?: number
  last_played?: string
  current_story_id?: string
  current_passage_id?: string
  completed_story_ids?: string[]
  completed_prompts?: unknown[]
  [key: string]: unknown
}

export interface GameStatsResponse {
  score?: number
  completed_prompts_count?: number
  vantage_times_played?: number
  vantage_wins?: number
  vantage_losses?: number
  last_played?: string
  current_story_id?: number | string
  current_passage_id?: string
}

export interface RecordProgressRequest {
  story_id: number | string
  passage_id: string
}

export interface RecordProgressResponse {
  current_story_id: string
  current_passage_id: string
}

export interface VantageRunRequest {
  run_id: string
  won: boolean
  score: number
  lumens_gathered?: number
  thoughts_reframed?: number
  thoughts_defeated?: number
}

export interface VantageRunResponse {
  ok: boolean
  game_data?: GameDataResponse
}

export interface WellnessStatsResponse {
  connection?: number
  balance?: number
  awareness?: number
  resilience?: number
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as any)) {
    return (raw as { data: T }).data
  }
  return raw as T
}

export const gameService = {
  /** GET /api/game/game-data/my-data/ */
  async getMyData(): Promise<ApiResponse<GameDataResponse>> {
    const raw = await apiClient.get<GameDataResponse>(API_ENDPOINTS.GAME_MY_DATA, {
      skipVersion: true,
    })
    const data = unwrap<GameDataResponse>(raw)
    const hasSuccess = raw && typeof raw === 'object' && 'success' in (raw as object)
    if (hasSuccess && (raw as ApiResponse<GameDataResponse>).success === false) {
      return raw as ApiResponse<GameDataResponse>
    }
    return { success: true, data: data ?? ({} as GameDataResponse) }
  },

  /** GET /api/game/game-data/stats/ */
  async getStats(): Promise<ApiResponse<GameStatsResponse>> {
    const raw = await apiClient.get<GameStatsResponse>(API_ENDPOINTS.GAME_STATS, {
      skipVersion: true,
    })
    const data = unwrap<GameStatsResponse>(raw)
    const hasSuccess = raw && typeof raw === 'object' && 'success' in (raw as object)
    if (hasSuccess && (raw as ApiResponse<GameStatsResponse>).success === false) {
      return raw as ApiResponse<GameStatsResponse>
    }
    return { success: true, data: data ?? ({} as GameStatsResponse) }
  },

  /** POST /api/game/record-progress/ (story_id, passage_id required) */
  async recordProgress(
    payload: RecordProgressRequest
  ): Promise<ApiResponse<RecordProgressResponse>> {
    return apiClient.post<RecordProgressResponse>(
      API_ENDPOINTS.GAME_RECORD_PROGRESS,
      payload,
      { skipVersion: true },
    )
  },

  /** POST /api/game/game-data/vantage/run/ */
  async vantageRun(payload: VantageRunRequest): Promise<ApiResponse<VantageRunResponse>> {
    const raw = await apiClient.post<VantageRunResponse>(
      API_ENDPOINTS.VANTAGE_RUN,
      payload,
      { skipVersion: true },
    )
    const data = unwrap<VantageRunResponse>(raw)
    const hasSuccess = raw && typeof raw === 'object' && 'success' in (raw as object)
    if (hasSuccess && (raw as ApiResponse<VantageRunResponse>).success === false) {
      return raw as ApiResponse<VantageRunResponse>
    }
    return { success: true, data: data ?? { ok: true } }
  },

  /** GET /api/game/gain-wellness/ (read) or POST/PATCH (update) */
  async getWellness(): Promise<ApiResponse<WellnessStatsResponse>> {
    const raw = await apiClient.get<WellnessStatsResponse>(API_ENDPOINTS.GAME_GAIN_WELLNESS, {
      skipVersion: true,
    })
    const data = unwrap<WellnessStatsResponse>(raw)
    return { success: true, data: data ?? ({} as WellnessStatsResponse) }
  },

  /** PATCH /api/game/gain-wellness/ */
  async updateWellness(
    payload: Partial<WellnessStatsResponse>
  ): Promise<ApiResponse<{ message?: string }>> {
    return apiClient.patch<{ message?: string }>(
      API_ENDPOINTS.GAME_GAIN_WELLNESS,
      payload,
      { skipVersion: true },
    )
  },
}
