/**
 * API Configuration Constants
 *
 * Source of truth (recommended):
 *   app.config.js -> expo.extra.apiUrl / expo.extra.apiToken
 *
 * Fallback:
 *   .env -> EXPO_PUBLIC_API_URL / EXPO_PUBLIC_API_TOKEN
 *
 * Your backend base should be:
 *   https://backend.131.212.41.8.nip.io/api/
 *
 * NOTE:
 * - Most endpoints live under /api/...
 * - Auth endpoints live at the root (no /api): /auth/login/, /auth/logout/
 */

type ApiConfig = {
  /**
   * API base URL (should include /api/)
   * Example: https://backend...nip.io/api/
   */
  BASE_URL: string
  /**
   * Root URL (no /api/)
   * Example: https://backend...nip.io/
   */
  ROOT_URL: string
  AUTH_TOKEN: string
  TIMEOUT: number
  MAX_RETRIES: number
  RETRY_DELAY: number
}

function normalizeUrl(url: string): string {
  if (!url) return ''
  let u = url.trim()

  if (!u.endsWith('/')) u += '/'
  return u
}

function ensureApiBaseUrl(url: string): string {
  if (!url) return ''
  const normalized = normalizeUrl(url)
  if (normalized.endsWith('/api/')) return normalized
  if (normalized.endsWith('/api')) return `${normalized}/`
  return `${normalized}api/`
}

function deriveRootUrl(url: string): string {
  if (!url) return ''
  const normalized = normalizeUrl(url)
  if (normalized.endsWith('/api/')) return normalized.slice(0, -'api/'.length)
  if (normalized.endsWith('/api')) return normalized.slice(0, -'api'.length)
  return normalized
}

function safeGetExpoExtra(): { apiUrl?: string; apiToken?: string } {
  try {
    // Avoid static import to reduce init issues
    const Constants = require('expo-constants').default
    const extra = Constants?.expoConfig?.extra ?? {}
    return {
      apiUrl: extra.apiUrl,
      apiToken: extra.apiToken,
    }
  } catch {
    return {}
  }
}

function getConfigValue(key: 'apiUrl' | 'apiToken'): string {
  const extra = safeGetExpoExtra()

  // Prefer expo.extra (works in dev + builds)
  if (key === 'apiUrl' && extra.apiUrl) return String(extra.apiUrl)
  if (key === 'apiToken' && extra.apiToken) return String(extra.apiToken)

  // Fallback to env vars (mostly useful in dev)
  if (key === 'apiUrl') return process.env.EXPO_PUBLIC_API_URL ?? ''
  if (key === 'apiToken') return process.env.EXPO_PUBLIC_API_TOKEN ?? ''

  return ''
}

// --- FINAL CONFIG ---
const rawBaseUrl = getConfigValue('apiUrl')
const rawToken = getConfigValue('apiToken')

export const API_CONFIG: ApiConfig = {
  BASE_URL: ensureApiBaseUrl(rawBaseUrl), // e.g. https://.../api/
  ROOT_URL: deriveRootUrl(rawBaseUrl), // e.g. https://.../
  AUTH_TOKEN: rawToken,
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
}

/**
 * Helper to build absolute URLs safely
 * Usage: apiUrl(API_ENDPOINTS.GAME_RECORD_PROGRESS)
 */
export function apiUrl(path: string): string {
  const base = API_CONFIG.BASE_URL
  if (!base) return path // avoid crashing; you'll see it quickly in logs
  const p = path.startsWith('/') ? path.slice(1) : path
  return `${base}${p}`
}

/**
 * API Endpoints (aligned to nova/urls.py)
 *
 * Authentication: DRF Token Authentication
 * Format: Authorization: Token <token>
 * 
 * nova/urls.py:
 *   /api/                -> users.urls + characters.urls
 *   /api/story/          -> story.urls
 *   /api/journal/        -> journal.urls
 *   /api/game/           -> game.urls
 *   /api/personality/    -> personality.urls
 */
export const API_ENDPOINTS = {
  // --- Authentication (DRF Token Auth) ---
  // Some deployments mount auth under /api/, others at root; client can fall back automatically.
  USER_LOGIN: '/auth/login/',
  USER_LOGOUT: '/auth/logout/',

  // --- Characters (included at /api/...) ---
  CHARACTERS: '/characters/',
  CHARACTER_BY_ID: (id: string | number) => `/characters/${id}/`,

  // --- Users (included at /api/...) ---
  USER_FULL_PROFILE: (id: string | number) => `/users/${id}/full_profile/`,
  USER: '/user',
  USER_BY_ID: (id: string | number) => `/users/${id}/`,
  USER_CREATE: '/user/create',
  USER_VERIFY_EMAIL: '/user/verify-email',
  USER_RESET_PASSWORD: '/user/reset-password',
  USER_FORGOT_PASSWORD: '/user/forgot-password',

  // --- Story (mounted at /api/story/...) ---
 
  STORY_CHAPTER: (chapterId: number | string) => `/story/chapters/${chapterId}/`,
  STORY: '/story',
  STORY_STORIES: '/story/stories/',
  STORY_PROGRESS: '/story/record_progress',

  // --- Journal (mounted at /api/journal/...) ---
  JOURNAL_CODEX_ENTRIES: '/journal/codex-entries/',
  JOURNAL_ENTRY_BY_ID: (id: string | number) => `/journal/codex-entries/${id}/`,
  JOURNAL_PROMPTS: '/journal/journal-prompts/',

  // --- Game (mounted at /api/game/...) ---
  GAME_MY_DATA: '/game/game-data/my-data/',       // DRF action on GameDataViewSet
  GAME_STATS: '/game/game-data/stats/',           // DRF action on GameDataViewSet

  // Record progress endpoint
  GAME_RECORD_PROGRESS: '/game/progress/record_progress/',

  // Vantage endpoint
 VANTAGE_RUN: '/game/game-data/thought-defender/run/',

  // Wellness endpoint (your urls.py currently wires this oddly; leaving the URL you exposed)
  GAME_GAIN_WELLNESS: '/game/gain-wellness/',

  // --- Media (served by Caddy from /media/...) ---
  // Not an API route; this is for images/files.
  MEDIA: '/media/',



  //Random other endpoints
    
    // Equipment endpoints
    EQUIPMENT: '/equipment',
    EQUIPMENT_BY_ID: (id: string) => `/equipment/${id}`,
    
    // Attributes endpoints
    ATTRIBUTES: '/attributes',
    ATTRIBUTES_UPDATE: '/attributes/update',
    

} as const
