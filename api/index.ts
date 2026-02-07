/**
 * API Module - Main Export File
 * 
 * This module provides a complete API structure for the application.
 * Import from here for easy access to all API functionality.
 */

// Client
export { apiClient } from './client'

// Constants
export { API_CONFIG, API_ENDPOINTS } from './constants'

// Types
export type * from './types'

// Services
export { characterService } from './services/character.service'
export { storyService } from './services/story.service'
export { equipmentService } from './services/equipment.service'
export { attributesService } from './services/attributes.service'
export { journalService } from './services/journal.service'
export { userService } from './services/user.service'

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
} from './hooks/use-story'

// Hooks - Equipment
export {
  useEquipment,
  useUnlockedEquipment,
  useEquipmentById,
  useUnlockEquipment,
  equipmentKeys,
} from './hooks/use-equipment'

// Hooks - Attributes
export {
  useAttributes,
  useUpdateAttributes,
  useExperienceLumens,
  attributesKeys,
} from './hooks/use-attributes'

// Hooks - Journal
export {
  useJournalEntries,
  useJournalEntry,
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  journalKeys,
} from './hooks/use-journal'

// Hooks - User
export {
  useUser,
  useUserFullProfile,
  userKeys,
} from './hooks/use-user'

// Hooks - Auth
export {
  useAuthUserId,
  useIsAuthenticated,
  useCurrentUser,
  useCurrentUserFullProfile,
  useAuthActions,
  useRequiredAuthUserId,
} from './hooks/use-auth'
export { useRequireAuth } from './hooks/use-require-auth'