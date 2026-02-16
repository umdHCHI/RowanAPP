import { apiClient } from "../client";
import { API_ENDPOINTS } from "../constants";
import type {
  JournalEntryResponse,
  JournalEntryCreateRequest,
  JournalEntryCreateWithMediaRequest,
  JournalEntryUpdateRequest,
  JournalEntryUpdateWithMediaRequest,
  JournalPromptResponse,
  ApiResponse,
  PaginatedResponse,
} from "../types";

/**
 * Journal Service
 * Handles all journal-related API calls
 */
export const journalService = {
  /**
   * Get all journal entries (paginated)
   * Note: This endpoint doesn't use version prefix
   */
  async getAll(
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<JournalEntryResponse>> {
    const response = await apiClient.get<JournalEntryResponse[]>(
      `${API_ENDPOINTS.JOURNAL_COMPLETED_ENTRIES}?page=${page}&limit=${limit}`,
      { skipVersion: true },
    );
    // If your API returns pagination metadata, it should be in the response
    // Adjust this based on your actual API structure
    return response as PaginatedResponse<JournalEntryResponse>;
  },

  /**
   * Get a journal entry by ID
   * Note: This endpoint doesn't use version prefix
   */
  async getById(id: string): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.get<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id),
      {
        skipVersion: true,
      },
    );
  },

  /**
   * Create a new journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async create(
    data: JournalEntryCreateRequest,
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.post<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_COMPLETED_ENTRIES,
      data,
      {
        skipVersion: true,
      },
    );
  },

  /**
   * Create a journal entry with media (multipart/form-data).
   * - Draw: prompt + draw_image (PNG file) + optional content. Field name: draw_image.
   * - Voice: prompt + voice_audio (audio file, m4a/webm/mp3) + optional content. Field name: voice_audio.
   * Do not set Content-Type; client sets it with boundary for FormData.
   */
  async createWithMedia(
    data: JournalEntryCreateWithMediaRequest,
  ): Promise<ApiResponse<JournalEntryResponse>> {
    const form = new FormData();
    form.append("prompt", String(data.prompt));
    form.append("content", data.content ?? "");

    if (data.imageUri) {
      form.append("draw_image", {
        uri: data.imageUri,
        type: "image/png",
        name: "drawing.png",
      } as any);
    }
    if (data.audioUri) {
      const audioType = data.audioMimeType ?? "audio/m4a";
      const audioName = data.audioFileName ?? "voice-memo.m4a";
      form.append("voice_audio", {
        uri: data.audioUri,
        type: audioType,
        name: audioName,
      } as any);
    }

    return apiClient.post<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_COMPLETED_ENTRIES,
      form,
      { skipVersion: true },
    );
  },

  /**
   * Update a journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async update(
    id: string,
    data: JournalEntryUpdateRequest,
  ): Promise<ApiResponse<JournalEntryResponse>> {
    return apiClient.patch<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id),
      data,
      { skipVersion: true },
    );
  },

  /**
   * Update a journal entry with media (multipart PATCH).
   * - Draw: content + draw_image (PNG). Field name: draw_image.
   * - Voice: content + voice_audio. Field name: voice_audio.
   * Use when updating an existing entry and the user has new image/audio to upload.
   */
  async updateWithMedia(
    id: string,
    data: JournalEntryUpdateWithMediaRequest,
  ): Promise<ApiResponse<JournalEntryResponse>> {
    const form = new FormData();
    form.append("content", data.content ?? "");
    if (data.entry_type) form.append("entry_type", data.entry_type);
    if (data.duration_seconds != null)
      form.append("duration_seconds", String(data.duration_seconds));

    if (data.imageUri) {
      form.append("draw_image", {
        uri: data.imageUri,
        type: "image/png",
        name: "drawing.png",
      } as any);
    }
    if (data.audioUri) {
      const audioType = data.audioMimeType ?? "audio/m4a";
      const audioName = data.audioFileName ?? "voice-memo.m4a";
      form.append("voice_audio", {
        uri: data.audioUri,
        type: audioType,
        name: audioName,
      } as any);
    }

    return apiClient.patch<JournalEntryResponse>(
      API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id),
      form,
      { skipVersion: true },
    );
  },

  /**
   * Delete a journal entry
   * Note: This endpoint doesn't use version prefix
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.JOURNAL_ENTRY_BY_ID(id), {
      skipVersion: true,
    });
  },

  /**
   * Get all journal prompts
   * Note: This endpoint returns an array directly, not wrapped in ApiResponse
   */
  async getPrompts(): Promise<JournalPromptResponse[]> {
    // Skip version prefix as this endpoint doesn't use versioning
    const response = await apiClient.get<JournalPromptResponse[]>(
      API_ENDPOINTS.JOURNAL_PROMPTS,
      { skipVersion: true },
    );
    const normalizePrompt = (
      prompt: Partial<JournalPromptResponse>,
      index: number,
    ): JournalPromptResponse => {
      return {
        id: Number(prompt.id ?? 0),
        prompt_id: String(prompt.prompt_id ?? ""),
        text: String(prompt.text ?? ""),
        category: String(prompt.category ?? "journal"),
        skill_category: String(
          prompt.skill_category ?? prompt.category ?? "reflection",
        ),
        difficulty: (prompt.difficulty ??
          "Beginner") as JournalPromptResponse["difficulty"],
        is_active: prompt.is_active ?? true,
        order: Number.isFinite(prompt.order) ? Number(prompt.order) : index + 1,
        required_story_id: prompt.required_story_id ?? null,
        required_passage_id: prompt.required_passage_id ?? null,
        personality_traits: Array.isArray(prompt.personality_traits)
          ? prompt.personality_traits
          : [],
        unlocked: prompt.unlocked ?? true,
        completed: prompt.completed ?? false,
        created_at: String(prompt.created_at ?? ""),
        updated_at: String(prompt.updated_at ?? ""),
      };
    };

    // Handle direct array responses
    if (Array.isArray(response)) {
      return response.map(normalizePrompt);
    }

    if (response && typeof response === "object") {
      // If wrapped in ApiResponse, extract data
      if ("data" in response) {
        const data = (response as ApiResponse<JournalPromptResponse[]>).data;
        if (Array.isArray(data)) return data.map(normalizePrompt);

        // Handle nested pagination: { data: { results: [...] } }
        if (data && typeof data === "object" && "results" in data) {
          const results = (data as { results: unknown }).results;
          if (Array.isArray(results)) return results.map(normalizePrompt);
          return [];
        }
      }

      // Handle DRF-style pagination: { results: [...] }
      if ("results" in response) {
        const results = (response as { results: unknown }).results;
        if (Array.isArray(results)) return results.map(normalizePrompt);
        return [];
      }
    }

    return [];
  },

  /**
   * Get a journal prompt by its prompt_id
   * Fetches all prompts and finds the one matching the promptId
   */
  async getJournalPromptById(
    promptId: string,
  ): Promise<JournalPromptResponse | null> {
    const prompts = await this.getPrompts();
    const prompt = prompts.find((p) => p.prompt_id === promptId);
    return prompt || null;
  },
};
