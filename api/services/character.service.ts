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
    if (mine.success && mine.data) {
      return mine as ApiResponse<CharacterResponse>
    }
    return response
  },
  async getMine(): Promise<ApiResponse<CharacterResponse | null>> {
    try {
      const response = await apiClient.get<CharacterResponse>(
        API_ENDPOINTS.CHARACTER_MINE,
        {
          skipVersion: true,
          suppressErrorLog: true,
        },
      );
      const isWrapped =
        !!response &&
        typeof response === 'object' &&
        Object.prototype.hasOwnProperty.call(response as object, 'success') &&
        Object.prototype.hasOwnProperty.call(response as object, 'data');
      const normalized = isWrapped
        ? (response as ApiResponse<CharacterResponse>)
        : ({
            success: true,
            data: response as unknown as CharacterResponse,
          } as ApiResponse<CharacterResponse>);
      return normalized;
    } catch (error: any) {
      const status = (error as ApiError)?.status;
      if (status === 404) {
        return {
          success: false,
          data: null,
          message: 'Character not found',
        } as ApiResponse<CharacterResponse | null>;
      }
      throw error;
    }
  },

  /** POST /api/characters/characters/ (Django CharacterViewSet) */
  async create(
    data: CharacterCreateRequest,
    options: { suppressErrorLog?: boolean } = {},
  ): Promise<ApiResponse<CharacterResponse>> {
    return apiClient.post<CharacterResponse>(
      API_ENDPOINTS.CHARACTER_CREATE,
      data,
      { skipVersion: true, suppressErrorLog: options.suppressErrorLog },
    );
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
        if (mine.success && mine.data) {
          return mine as ApiResponse<CharacterResponse>;
        }
      }

      throw error;
    }
  },
};
