/**
 * API Configuration Constants
 * Update these values when you have your backend endpoints ready
 */

export const API_CONFIG = {
  // Base URL for your API - update this when you have your backend ready
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://131.212.41.8/api/',
  
  // API version
  VERSION: 'v1',
  
  // Authentication token
  AUTH_TOKEN: process.env.EXPO_PUBLIC_API_TOKEN || '8a71299900898a32febbca89ef5638a406475348',
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const

/**
 * API Endpoints
 * Add your endpoint paths here as you receive them
 */
export const API_ENDPOINTS = {
  // Character endpoints
  CHARACTERS: '/characters',
  CHARACTER_BY_ID: (id: string) => `/characters/${id}`,
  
  // Story endpoints
  STORY: '/story',
  STORY_STORIES: '/story/stories/',
  STORY_CHAPTER: (chapterId: number) => `/story/chapters/${chapterId}`,
  STORY_PROGRESS: '/story/progress',
  
  // Equipment endpoints
  EQUIPMENT: '/equipment',
  EQUIPMENT_BY_ID: (id: string) => `/equipment/${id}`,
  
  // Attributes endpoints
  ATTRIBUTES: '/attributes',
  ATTRIBUTES_UPDATE: '/attributes/update',
  
  // Journal endpoints
  JOURNAL_ENTRY_BY_ID: (id: string) => `/journal/codex-entries/${id}`,
  JOURNAL_PROMPTS: '/journal/journal-prompts/',

  // Journal writing endpoints
  JOURNAL_WRITING: 'journal/codex-entries/',

  // User endpoints
  USER: '/user',
  USER_BY_ID: (id: string | number) => `/user/${id}`,
  USER_CREATE: '/user/create',
  USER_UPDATE: (id: string | number) => `/user/${id}/update`,
  USER_DELETE: (id: string | number) => `/user/${id}/delete`,
  USER_LOGIN: '/user/login',
  USER_LOGOUT: '/user/logout',
  USER_VERIFY_EMAIL: '/user/verify-email',
  USER_RESET_PASSWORD: '/user/reset-password',
  USER_FORGOT_PASSWORD: '/user/forgot-password',

  // Full user profile endpoint (matches GET /api/users/:id/full_profile/)
  USER_FULL_PROFILE: (id: string | number) => `/users/${id}/full_profile/`,
} as const
