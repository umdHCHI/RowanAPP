import { z } from 'zod'
import type { Character } from '../stores/game-store'
import type { StoryChapter } from '../types/story'

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

/**
 * Attributes Response
 */
export interface AttributesResponse {
  connection: number
  courage: number
  exploration: number
  fear: number
  experience?: number
  lumens?: number
  total_lumens?: number
}

/**
 * Attributes Update Request
 */
export interface AttributesUpdateRequest {
  connection?: number
  courage?: number
  exploration?: number
  fear?: number
}

/**
 * API Error Response
 */
export interface ApiError {
  message: string
  code?: string
  status?: number
  errors?: Record<string, string[]>
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
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

export const StoryChapterResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  chapter_number: z.number(),
  is_starting_chapter: z.boolean(),
  story_title: z.string(),
  user_username: z.string(),
  passage_count: z.number(),
  created_at: z.string(),
})

export const StoryResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  starting_passage_id: z.string(),
  min_level: z.number(),
  category: z.string(),
  rarity: z.string(),
  revelations: z.array(z.string()),
  estimated_time_minutes: z.number(),
  atmosphere: z.string(),
  difficulty: z.string(),
  personality_focus: z.array(z.string()),
  is_repeatable: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  chapters: z.array(StoryChapterResponseSchema),
  chapter_count: z.number(),
  total_passages: z.number(),
})

export const StoryProgressUpdateSchema = z.object({
  currentChapter: z.number().min(0).optional(),
  voidClarity: z.number().min(0).max(100).optional(),
  visitedLocations: z.array(z.string()).optional(),
  completedChoices: z.record(z.string(), z.string()).optional(),
})

export type StoryResponse = z.infer<typeof StoryResponseSchema>
export type StoryChapterResponse = z.infer<typeof StoryChapterResponseSchema>
export type StoryProgressResponse = z.infer<typeof StoryProgressSchema>
export type StoryProgressUpdateRequest = z.infer<typeof StoryProgressUpdateSchema>


// ============================================================================
// Journal Schemas
// ============================================================================

export const JournalEntryCreateSchema = z.object({
  prompt: z.number(),
  entry_type: z.string().min(1),
  content: z.string().min(1),
  duration_seconds: z.number().nullable().optional(),
})

export const JournalEntryUpdateSchema = z.object({
  prompt: z.number().optional(),
  entry_type: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  duration_seconds: z.number().nullable().optional(),
})

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
})

export type JournalEntryCreateRequest = z.infer<typeof JournalEntryCreateSchema>
export type JournalEntryUpdateRequest = z.infer<typeof JournalEntryUpdateSchema>
export type JournalEntryResponse = z.infer<typeof JournalEntryResponseSchema>

// ============================================================================
// Journal Prompts Schemas
// ============================================================================

export const JournalPromptResponseSchema = z.object({
  id: z.number(),
  prompt_id: z.string(),
  text: z.string(),
  category: z.string(),
  skill_category: z.string(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  is_active: z.boolean(),
  order: z.number(),
  required_story_id: z.number().nullable(),
  required_passage_id: z.number().nullable(),
  personality_traits: z.array(z.string()),
  unlocked: z.boolean(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type JournalPromptResponse = z.infer<typeof JournalPromptResponseSchema>


// ============================================================================
// User Schemas
// ============================================================================

export const UserCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const UserUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  notifications_enabled: z.boolean().optional(),
})

export const UserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
})

export type UserCreateRequest = z.infer<typeof UserCreateSchema>
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>



const RecentReflectionSchema = z.object({
  id: z.number(),
  character: z.string(),
  entry_type: z.string(),
  title: z.string(),
  content: z.string(),
  prompt: z.string(),
  skill_category: z.string(),
  map_area: z.string(),
  difficulty: z.string(),
  wellness_gains: z.record(z.string(), z.unknown()),
  tools_unlocked: z.array(z.string()),
  created_at: z.string(),
})



const StoryChoiceSchema = z.object({
  choice_id: z.string(),
  timestamp: z.string(),
  choice_text: z.string(),
})

const StoryProgressSchema = z.object({
  id: z.number(),
  user: z.number(),
  user_username: z.string(),
  story: z.number(),
  story_title: z.string(),
  story_category: z.string(),
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
})




export type CharacterFullProfile = z.infer<typeof CharacterSchema>
export type UserFullProfileResponse = z.infer<typeof CharacterSchema>