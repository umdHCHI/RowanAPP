/**
 * API Module - Main Export File
 *
 * This module provides a complete API structure for the application.
 * Import from here for easy access to all API functionality.
 */

// Client
export { apiClient } from "./client";

// Constants
export { API_CONFIG, API_ENDPOINTS } from "./constants";

// Types
export type * from "./types";

// Services
export { characterService } from "./services/character.service";
export { storyService } from "./services/story.service";
export { journalService } from "./services/journal.service";
export { userService } from "./services/user.service";
export {
  gameService,
  type GameDataResponse,
  type GameStatsResponse,
  type RecordProgressRequest,
  type RecordProgressResponse,
  type VantageData,
  type VantageRunRequest,
  type VantageRunResponse,
} from "./services/game.service";

export { emaService } from "./services/ema.service";

// Hooks - Character
export {
  useMyCharacter,
  useCreateCharacter,
  useUpdateCharacterCustomization,
  useGainLumens,
  characterKeys,
} from "./hooks/use-character";

// Hooks - Story
export {
  useStoryProgress,
  useStoryProgressByStoryId,
  useUpdateStoryProgress,
  useStories,
  useStoryPassage,
  storyKeys,
} from "./hooks/use-story";

// Hooks - Attributes
export { useExperienceLumens } from "./hooks/use-lumens";

// Hooks - Journal
export {
  useJournalEntries,
  useJournalEntry,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  journalKeys,
} from "./hooks/use-journal";

// Hooks - User
export { useUser, useUserFullProfile, userKeys } from "./hooks/use-user";

// Hooks - EMA
export {
  useEmaPrompts,
  useSubmitEma,
  useEmaMyResponse,
  useEmaResponseForStory,
  emaKeys,
} from "./hooks/use-ema";

// Hooks - Game
export { useSubmitVantageRun, useGameMyData, gameKeys } from "./hooks/use-game";

// Hooks - Auth
export {
  useAuthUserId,
  useIsAuthenticated,
  useCurrentUser,
  useCurrentUserFullProfile,
  useAuthActions,
  useRequiredAuthUserId,
} from "./hooks/use-auth";
export { useRequireAuth } from "./hooks/use-require-auth";
