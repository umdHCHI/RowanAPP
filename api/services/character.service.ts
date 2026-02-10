import { apiClient } from "../client";
import { API_ENDPOINTS } from "../constants";
import type {
  ApiResponse,
  CharacterCreateRequest,
  CharacterUpdateRequest,
  CharacterResponse,
  ApiError,
} from "../types";

export const characterService = {
  async ensureFullCharacter(
    response: ApiResponse<CharacterResponse>
  ): Promise<ApiResponse<CharacterResponse>> {
    const data = response?.data
    if (!data) return response

    const hasCosmetics =
      data.selected_base_model != null &&
      data.selected_background_color != null &&
      data.selected_background_type != null &&
      data.selected_hair_color != null &&
      data.selected_hair_style != null &&
      data.selected_shirt_color != null &&
      data.selected_shirt_type != null &&
      data.selected_eye_color != null &&
      data.selected_eye_type != null &&
      data.selected_eyebrow_color != null &&
      data.selected_eyebrow_style != null &&
      data.selected_mouth_type != null

    if (hasCosmetics) return response

    const mine = await characterService.getMine()
    return mine.success ? mine : response
  },
  async getMine(): Promise<ApiResponse<CharacterResponse>> {
    const response = await apiClient.get<CharacterResponse>(API_ENDPOINTS.CHARACTER_MINE, {
      skipVersion: true,
    });
    const isWrapped =
      !!response &&
      typeof response === 'object' &&
      Object.prototype.hasOwnProperty.call(response as object, 'success') &&
      Object.prototype.hasOwnProperty.call(response as object, 'data');
    const normalized = isWrapped
      ? (response as ApiResponse<CharacterResponse>)
      : ({ success: true, data: response as unknown as CharacterResponse } as ApiResponse<CharacterResponse>);
    return normalized;
  },

  async create(
    data: CharacterCreateRequest,
  ): Promise<ApiResponse<CharacterResponse>> {
    /**
     * Some deployments expose the character ViewSet at `/characters/`,
     * others at `/characters/characters/`. To be robust against both,
     * we try the canonical `/characters/` first, then fall back.
     */
    try {
      return await apiClient.post<CharacterResponse>(
        API_ENDPOINTS.CHARACTERS,
        data,
        { skipVersion: true },
      );
    } catch (error: any) {
      const status = (error as ApiError)?.status;

      // If it's not a simple routing issue, rethrow
      if (status && status !== 404 && status !== 405) {
        throw error;
      }

      // Fallback to the legacy/alternate path
      return apiClient.post<CharacterResponse>(
        API_ENDPOINTS.CHARACTER_CREATE,
        data,
        { skipVersion: true },
      );
    }
  },

  async updateCustomization(
    data: CharacterUpdateRequest,
  ): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.patch<CharacterResponse>(
      API_ENDPOINTS.CHARACTER_UPDATE_CUSTOMIZATION,
      data,
      { skipVersion: true },
    );
  },

  async gainLumens(amount: number = 1): Promise<ApiResponse<CharacterResponse>> {
    try {
      const response = await apiClient.post<CharacterResponse>(
        API_ENDPOINTS.CHARACTER_GAIN_LUMENS,
        { amount },
        { skipVersion: true },
      );

      const isWrapped =
        !!response &&
        typeof response === 'object' &&
        Object.prototype.hasOwnProperty.call(response as object, 'success') &&
        Object.prototype.hasOwnProperty.call(response as object, 'data');

      const normalized = isWrapped
        ? (response as ApiResponse<CharacterResponse>)
        : ({ success: true, data: response as unknown as CharacterResponse } as ApiResponse<CharacterResponse>);
      return await characterService.ensureFullCharacter(normalized);
    } catch (error: any) {
      const message = String(error?.message || '').toLowerCase();
      const status = (error as ApiError)?.status;

      const xpWasAdded =
        message.includes('xp added') ||
        message.includes('experience added') ||
        message.includes('lumens added');

      if (xpWasAdded || status === 200) {
        const mine = await characterService.getMine();
        if (mine.success) return mine;
      }

      throw error;
    }
  },
};
