import { z } from "zod";
/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Attributes Response
 */
export interface AttributesResponse {
  connection: number;
  courage: number;
  exploration: number;
  fear: number;
  experience?: number;
  lumens?: number;
  total_lumens?: number;
}

/**
 * Attributes Update Request
 */
export interface AttributesUpdateRequest {
  connection?: number;
  courage?: number;
  exploration?: number;
  fear?: number;
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// ============================================================================
// Character Schemas
// ============================================================================

export const CharacterSchema = z.object({
  id: z.number(),
  username: z.string(),
  research_condition: z.string().nullable().optional(),

  // backend field
  experience: z.number(),

  // cosmetics
  selected_base_model: z.number(),
  selected_skin_color: z.number(),
  selected_hair_style: z.number(),
  selected_hair_color: z.number(),
  selected_eye_type: z.number(),
  selected_eye_color: z.number(),
  selected_eyebrow_style: z.number(),
  selected_eyebrow_color: z.number(),
  selected_mouth_type: z.number(),
  selected_shirt_type: z.number(),
  selected_shirt_color: z.number(),
  selected_background_type: z.number(),
  selected_background_color: z.number(),

  character_config: z
    .object({
      selected_base_model: z.number(),
      selected_skin_color: z.number(),
      selected_hair_style: z.number(),
      selected_hair_color: z.number(),
      selected_eye_type: z.number(),
      selected_eye_color: z.number(),
      selected_eyebrow_style: z.number(),
      selected_eyebrow_color: z.number(),
      selected_mouth_type: z.number(),
      selected_shirt_type: z.number(),
      selected_shirt_color: z.number(),
      selected_background_type: z.number(),
      selected_background_color: z.number(),
    })
    .optional(),

  created_at: z.string(),
  updated_at: z.string(),
});

export type CharacterResponse = z.infer<typeof CharacterSchema>;

export const CharacterCreateSchema = CharacterSchema.pick({
  selected_base_model: true,
  selected_skin_color: true,
  selected_hair_style: true,
  selected_hair_color: true,
  selected_eye_type: true,
  selected_eye_color: true,
  selected_eyebrow_style: true,
  selected_eyebrow_color: true,
  selected_mouth_type: true,
  selected_shirt_type: true,
  selected_shirt_color: true,
  selected_background_type: true,
  selected_background_color: true,
}).partial();

export type CharacterCreateRequest = z.infer<typeof CharacterCreateSchema>;
export type CharacterUpdateRequest = CharacterCreateRequest;

// ============================================================================
// Story Schemas
// ============================================================================

export const StoryPassageRefSchema = z.object({
  id: z.number(),
  passage_id: z.string(),
  passage_type: z.string(),
  story_id: z.number(),
});

export const StoryResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  starting_passage_id: z.string(),
  estimated_time_minutes: z.number(),
  is_hidden: z.boolean().optional(),
  is_repeatable: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  passage_count: z.number().optional(),
  total_passages: z.number().optional(),
  min_level: z.number().optional(),
  rarity: z.string().optional(),
  story_themes: z.array(z.string()).optional(),
  revelations: z.array(z.string()).optional(),
  atmosphere: z.string().optional(),
  personality_focus: z.array(z.string()).optional(),
  passages: z.array(StoryPassageRefSchema).optional(),
});

export const StoryProgressUpdateSchema = z.object({
  currentChapter: z.number().min(0).optional(),
  voidClarity: z.number().min(0).max(100).optional(),
  visitedLocations: z.array(z.string()).optional(),
  completedChoices: z.record(z.string(), z.string()).optional(),
});

export type StoryResponse = z.infer<typeof StoryResponseSchema>;
export type StoryProgressResponse = z.infer<typeof StoryProgressSchema>;
export type StoryProgressUpdateRequest = z.infer<
  typeof StoryProgressUpdateSchema
>;

/** Request body for POST /api/story/stories/{id}/complete/ (all optional; echoed in rewards_earned). */
export interface StoryCompleteRequest {
  final_rewards?: unknown;
  skills_learned?: unknown;
  stat_gains?: unknown;
  journal_entries?: unknown;
  coping_tools?: unknown;
  gear_items?: unknown;
}

/** Completion payload returned by story complete endpoint (EMA flow uses study_day, story_completion_id, ema_required). */
export interface StoryCompletionPayload {
  is_completed: boolean;
  completed_at: string;
  completed_on: string;
  study_day: number;
  ema_required: boolean;
  story_completion_id: number;
}

/** Response from POST /api/story/stories/{id}/complete/ */
export interface StoryCompleteResponse {
  message?: string;
  story_completed?: boolean;
  story_id?: number;
  story_title?: string;
  /** Completion payload (may be nested under completion or at top level). */
  completion?: StoryCompletionPayload;
  is_completed?: boolean;
  completed_at?: string;
  completed_on?: string;
  study_day?: number;
  ema_required?: boolean;
  story_completion_id?: number;
  rewards_earned?: Record<string, unknown>;
  game_data?: { completed_stories_count?: number; lumens_total?: number };
  character_data?: { lumens?: number; levels_gained?: number };
}

// ============================================================================
// Journal Schemas
// ============================================================================

export const JournalEntryCreateSchema = z.object({
  prompt: z.number(),
  entry_type: z.string().min(1),
  content: z.string().min(1),
  duration_seconds: z.number().nullable().optional(),
});

export const JournalEntryUpdateSchema = z.object({
  prompt: z.number().optional(),
  entry_type: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  duration_seconds: z.number().nullable().optional(),
});

export const JournalEntryResponseSchema = z.object({
  id: z.number(),
  prompt: z.number(),
  prompt_id: z.string(),
  prompt_text: z.string(),
  entry_type: z.string(),
  content: z.string(),
  content_preview: z.string(),
  skill_category: z.string(),
  difficulty: z.string(),
  word_count: z.number(),
  duration_seconds: z.number().nullable(),
  username: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type JournalEntryCreateRequest = z.infer<
  typeof JournalEntryCreateSchema
>;
export type JournalEntryUpdateRequest = z.infer<
  typeof JournalEntryUpdateSchema
>;
export type JournalEntryResponse = z.infer<typeof JournalEntryResponseSchema>;

/** Payload for creating a journal entry with media (multipart: draw_image or voice_audio). */
export interface JournalEntryCreateWithMediaRequest {
  prompt: number;
  /** Optional text; can be blank for draw/voice. */
  content?: string;
  /** Local URI of PNG image → sent as form field draw_image (drawing.png). */
  imageUri?: string | null;
  /** Local URI of audio file → sent as form field voice_audio. Backend accepts m4a, webm, mp3. */
  audioUri?: string | null;
  /** Mime type for voice file (e.g. audio/m4a, audio/mp3). Defaults to audio/m4a. */
  audioMimeType?: string | null;
  /** Filename for voice upload (e.g. voice-memo.m4a). Defaults to voice-memo.m4a. */
  audioFileName?: string | null;
}

/** Payload for updating a journal entry with media (multipart PATCH: draw_image or voice_audio). */
export interface JournalEntryUpdateWithMediaRequest extends JournalEntryUpdateRequest {
  /** Local URI of PNG image → sent as form field draw_image (drawing.png). */
  imageUri?: string | null;
  /** Local URI of audio file → sent as form field voice_audio. */
  audioUri?: string | null;
  audioMimeType?: string | null;
  audioFileName?: string | null;
}

// ============================================================================
// Journal Prompts Schemas
// ============================================================================

export const JournalPromptResponseSchema = z.object({
  id: z.number(),
  prompt_id: z.string(),
  text: z.string(),
  category: z.string(),
  skill_category: z.string(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  is_active: z.boolean(),
  order: z.number(),
  required_story_id: z.number().nullable(),
  required_passage_id: z.number().nullable(),
  personality_traits: z.array(z.string()),
  unlocked: z.boolean(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type JournalPromptResponse = z.infer<typeof JournalPromptResponseSchema>;

// ============================================================================
// User Schemas
// ============================================================================

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  notifications_enabled: z.boolean().optional(),
  profile: z
    .object({
      enable_daily_reminders: z.boolean().optional(),
      daily_reminder_time: z.string().nullable().optional(),
    })
    .optional(),
});

const StoryChoiceSchema = z.object({
  choice_id: z.string(),
  timestamp: z.string(),
  choice_text: z.string(),
});

const StoryProgressSchema = z.object({
  id: z.number(),
  user: z.number(),
  user_username: z.string(),
  story: z.number(),
  story_title: z.string(),
  story_category: z.string(),
  status: z.string().optional(),
  current_passage_id: z.string(),
  passages_visited: z.array(z.string()),
  passages_visited_count: z.number(),
  choices_made: z.array(StoryChoiceSchema),
  choices_made_count: z.number(),
  story_variables: z.record(z.string(), z.unknown()),
  is_completed: z.boolean(),
  completion_type: z.string(),
  started_at: z.string(),
  last_played: z.string(),
  completed_at: z.string(),
  progress_percentage: z.number(),
  is_hidden: z.boolean().optional(),
});

// ============================================================================
// User Full Profile Schema
// ============================================================================

const CharacterCustomizationSchema = CharacterSchema.pick({
  selected_base_model: true,
  selected_skin_color: true,
  selected_hair_style: true,
  selected_hair_color: true,
  selected_eye_type: true,
  selected_eye_color: true,
  selected_eyebrow_style: true,
  selected_eyebrow_color: true,
  selected_mouth_type: true,
  selected_shirt_type: true,
  selected_shirt_color: true,
  selected_background_type: true,
  selected_background_color: true,
});

const ProfileCharacterSchema = z.object({
  id: z.number(),
  lumens: z.number(),
  experience: z.number().optional(),
  name: z.string().optional(),
  level: z.number().optional(),
  memories_explored: z.number().optional(),
  customization: CharacterCustomizationSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

const UserProfileSchema = z.object({
  has_completed_onboarding: z.boolean().optional(),
  has_seen_tutorial: z.boolean().optional(),
  enable_daily_reminders: z.boolean().optional(),
  daily_reminder_time: z.string().nullable().optional(),
  has_completed_character_creation: z.boolean().optional(),
  has_character: z.boolean().optional(),
  has_game_data: z.boolean().optional(),
  notifications_enabled: z.boolean().optional(),
  character: ProfileCharacterSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// User list item shape (GET /api/users/ results item); matches backend with optional profile
export const UserResponseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  username: z.string(),
  email: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profile: UserProfileSchema.optional(),
});

export type UserCreateRequest = z.infer<typeof UserCreateSchema>;
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;

/** DRF-style paginated list from GET /api/users/ */
export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserResponse[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserFullProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  date_joined: z.string().optional(),
  created_at: z.string().optional(),
  profile: UserProfileSchema.optional(),
  story_progress: z.array(StoryProgressSchema).optional(),
});

export type CharacterFullProfile = z.infer<typeof CharacterSchema>;
export type UserFullProfileResponse = z.infer<typeof UserFullProfileSchema>;
