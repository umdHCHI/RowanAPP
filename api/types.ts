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

export const CharacterCreateSchema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.string().optional(),
  selected_base_model: z.number().optional(),
  selected_skin_color: z.number().optional(),
  selected_background_color: z.number().optional(),
  selected_background_type: z.number().optional(),
  selected_hair_color: z.number().optional(),
  selected_hair_style: z.number().optional(),
  selected_shirt_color: z.number().optional(),
  selected_shirt_type: z.number().optional(),
  selected_eye_color: z.number().optional(),
  selected_eye_type: z.number().optional(),
  selected_eyebrow_color: z.number().optional(),
  selected_eyebrow_style: z.number().optional(),
  selected_mouth_type: z.number().optional(),
})

export const CharacterUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  avatar: z.string().optional(),
  experience: z.number().min(0).optional(),
  selected_base_model: z.number().optional(),
  selected_skin_color: z.number().optional(),
  selected_background_color: z.number().optional(),
  selected_background_type: z.number().optional(),
  selected_hair_color: z.number().optional(),
  selected_hair_style: z.number().optional(),
  selected_shirt_color: z.number().optional(),
  selected_shirt_type: z.number().optional(),
  selected_eye_color: z.number().optional(),
  selected_eye_type: z.number().optional(),
  selected_eyebrow_color: z.number().optional(),
  selected_eyebrow_style: z.number().optional(),
  selected_mouth_type: z.number().optional(),
})

export const CharacterResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
})

export type CharacterCreateRequest = z.infer<typeof CharacterCreateSchema>
export type CharacterUpdateRequest = z.infer<typeof CharacterUpdateSchema>
export type CharacterResponse = z.infer<typeof CharacterResponseSchema>

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
// Equipment Schemas
// ============================================================================

export const EquipmentResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['weapon', 'armor', 'helmet', 'boots']),
  imagePath: z.string(),
  unlocked: z.boolean().default(false),
  unlockedAt: z.number().optional(),
})

export type EquipmentResponse = z.infer<typeof EquipmentResponseSchema>

export const EquipmentUnlockSchema = z.object({
  equipmentId: z.string(),
})

export type EquipmentUnlockRequest = z.infer<typeof EquipmentUnlockSchema>

// ============================================================================
// Attributes Schemas
// ============================================================================

export const AttributesResponseSchema = z.object({
  connection: z.number().min(1).max(5),
  courage: z.number().min(1).max(5),
  exploration: z.number().min(1).max(5),
  fear: z.number().min(1).max(5),
})

export const AttributesUpdateSchema = z.object({
  connection: z.number().min(1).max(5).optional(),
  courage: z.number().min(1).max(5).optional(),
  exploration: z.number().min(1).max(5).optional(),
  fear: z.number().min(1).max(5).optional(),
})

export type AttributesResponse = z.infer<typeof AttributesResponseSchema>
export type AttributesUpdateRequest = z.infer<typeof AttributesUpdateSchema>

// ============================================================================
// Journal Schemas
// ============================================================================

export const JournalEntryCreateSchema = z.object({
  prompt: z.number(),
  entry_type: z.string().min(1),
  content: z.string().min(1),
})

export const JournalEntryUpdateSchema = z.object({
  prompt: z.number().optional(),
  entry_type: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
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

// ============================================================================
// User Profile Schemas
// ============================================================================

const PersonalityTraitScoresSchema = z.object({
  openness: z.number(),
  conscientiousness: z.number(),
  extraversion: z.number(),
  agreeableness: z.number(),
  neuroticism: z.number(),
})

const PersonalityProfileSummarySchema = z.object({
  dominant_trait: z.string(),
  scores: PersonalityTraitScoresSchema,
  last_updated: z.string(),
})

export const PersonalityProfileSchema = z.object({
  id: z.number(),
  user: z.number(),
  openness: z.number(),
  conscientiousness: z.number(),
  extraversion: z.number(),
  agreeableness: z.number(),
  neuroticism: z.number(),
  profile_summary: PersonalityProfileSummarySchema,
  last_updated: z.string(),
})

export const UserProfileCoreSchema = z.object({
  research_group: z.string().nullable(),
  has_completed_onboarding: z.boolean(),
  completion_type: z.string(),
  completion_data_id: z.number(),
  notifications_enabled: z.boolean().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const WellnessStatSchema = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.number(),
  color: z.string(),
})

const CharacterConfigSchema = z.object({
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

export const CharacterFullProfileSchema = z.object({
  id: z.number(),
  user: z.string(),
  name: z.string(),
  level: z.number(),
  experience: z.number(),
  experience_needed: z.number(),
  awareness: z.number(),
  resilience: z.number(),
  connection: z.number(),
  balance: z.number(),
  memories_explored: z.number(),
  coping_skills_learned: z.number(),
  insights_discovered: z.number(),
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
  personality_traits: z.array(z.string()),
  coping_tools: z.array(z.string()),
  equipped_gear: z.array(z.unknown()),
  wellness_stats: z.array(WellnessStatSchema),
  experience_needed_for_next_level: z.number(),
  experience_progress_percentage: z.number(),
  wellness_average: z.number(),
  memory_progress: z.string(),
  character_config: CharacterConfigSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

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

const ArchiveMetricSchema = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.string(),
  progress: z.number(),
})

const SurveySchema = z.object({
  id: z.number(),
  user: z.number(),
  answers: z.record(z.string(), z.number()),
  big_five_scores: PersonalityTraitScoresSchema,
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

const QuestDefinitionSchema = z.object({
  quest_id: z.string(),
  title: z.string(),
  description: z.string(),
  total_steps: z.number(),
  personality_focus: z.string(),
})

const QuestProgressSchema = z.object({
  id: z.number(),
  quest: QuestDefinitionSchema,
  progress: z.number(),
  is_completed: z.boolean(),
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

const WellnessBonusesSchema = z.object({
  exploration: z.number(),
  courage: z.number(),
  connection: z.number(),
  fear: z.number(),
})

const ToolSchema = z.object({
  id: z.number(),
  name: z.string(),
  tool_type: z.string(),
  subtype: z.string(),
  description: z.string(),
  emoji_icon: z.string(),
  awareness_bonus: z.number(),
  resilience_bonus: z.number(),
  connection_bonus: z.number(),
  balance_bonus: z.number(),
  level_required: z.number(),
  memories_required: z.number(),
  insights_required: z.number(),
  wellness_bonuses: WellnessBonusesSchema,
  personality_type: z.string().nullable(),
  tool_id: z.string(),
  is_unlocked_for_character: z.boolean(),
  created_at: z.string(),
})

const UserSummarySchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  profile: UserProfileCoreSchema.nullable(),
  personality_profile: PersonalityProfileSchema.nullable(),
  character: z.unknown().nullable(),
  survey: z.unknown().nullable(),
})

export const UserFullProfileResponseSchema = z.object({
  user: UserSummarySchema,
  profile: UserProfileCoreSchema,
  character: CharacterFullProfileSchema.nullable(),
  equipped_gear: z.array(z.unknown()),
  recent_reflections: z.array(RecentReflectionSchema),
  archive_metrics: z.array(ArchiveMetricSchema),
  survey: SurveySchema.nullable(),
  personality_profile: PersonalityProfileSchema.nullable(),
  quest_progress: z.array(QuestProgressSchema),
  story_progress: z.array(StoryProgressSchema),
  available_tools: z.array(ToolSchema),
})

export type PersonalityProfile = z.infer<typeof PersonalityProfileSchema>
export type UserProfileCore = z.infer<typeof UserProfileCoreSchema>
export type CharacterFullProfile = z.infer<typeof CharacterFullProfileSchema>
export type UserFullProfileResponse = z.infer<typeof UserFullProfileResponseSchema>