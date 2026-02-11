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
 * - All endpoints live under /api/...
 * - Auth endpoints live under /auth/...
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

function safeGetExpoExtra(): { apiUrl?: string; apiToken?: string; bugReportUrl?: string } {
  try {
    // Avoid static import to reduce init issues
    const Constants = require('expo-constants').default
    const extra = Constants?.expoConfig?.extra ?? {}
    return {
      apiUrl: extra.apiUrl,
      apiToken: extra.apiToken,
      bugReportUrl: extra.bugReportUrl,
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
 * URL for the bug-report middleware (api/report-bug.ts → Resend).
 * - If EXPO_PUBLIC_BUG_REPORT_URL is set, use it (e.g. native or custom host).
 * - On web, use relative '/api/report-bug' so the same origin that serves the app
 *   (and the middleware) receives the request.
 * - On native without that env, falls back to apiUrl('report-bug').
 */
export function getBugReportUrl(): string {
  const extra = safeGetExpoExtra()
  const explicit = extra.bugReportUrl ?? process.env.EXPO_PUBLIC_BUG_REPORT_URL ?? ''
  if (explicit && explicit.trim()) return explicit.trim()
  // Web: same-origin request to the middleware
  if (typeof window !== 'undefined' && window.location?.origin) return '/api/report-bug'
  return apiUrl('report-bug')
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
  // Backend: /api/auth/login/
  USER_LOGIN: "/auth/login/",

  // --- Characters (included at /api/...) ---
  CHARACTERS: "/characters/",
  CHARACTER_MINE: "/characters/my_character/",
  // Character create endpoint (matches backend router)
  CHARACTER_CREATE: "/characters/characters/",
  CHARACTER_UPDATE_CUSTOMIZATION: "/characters/update_customization/",
  CHARACTER_GAIN_LUMENS: "/characters/gain-xp/",
  // CHARACTER_BY_ID: (id: string | number) => `/characters/${id}/`,

  // --- Users (included at /api/...) ---
  USER_FULL_PROFILE: `/users/me/`,
  USER: "/users/",
  USER_BY_ID: (id: string | number) => `/users/${id}/`,

  // --- Story (mounted at /api/story/...) ---

  STORY: "/story",
  STORY_STORIES: "/story/stories/",
  STORY_PROGRESS: "/story/story-progress/",
  STORY_PROGRESS_BY_ID: (id: string | number) => `/story/stories/${id}/progress/`,

  // --- Journal (mounted at /api/journal/...) ---
  JOURNAL_COMPLETED_ENTRIES: "/journal/completed-entries/",
  JOURNAL_ENTRY_BY_ID: (id: string | number) => `/journal/completed-entries/${id}/`,
  JOURNAL_PROMPTS: "/journal/journal-prompts/",

  // --- Game (mounted at /api/game/...) ---
  GAME_MY_DATA: "/game/game-data/my-data/", // DRF action on GameDataViewSet
  GAME_STATS: "/game/game-data/stats/", // DRF action on GameDataViewSet

  // Record progress endpoint
  GAME_RECORD_PROGRESS: "/game/progress/record_progress/",

  // Vantage endpoint
  VANTAGE_RUN: "/game/game-data/thought-defender/run/",

  // Wellness endpoint (your urls.py currently wires this oddly; leaving the URL you exposed)
  GAME_GAIN_WELLNESS: "/game/gain-wellness/",

  // --- Media (served by Caddy from /media/...) ---
  // Not an API route; this is for images/files.
  MEDIA: "/media/",

  //Random other endpoints

  // Equipment endpoints
  EQUIPMENT: "/equipment",
  EQUIPMENT_BY_ID: (id: string) => `/equipment/${id}`,

  // Attributes endpoints
  ATTRIBUTES: "/attributes",
  ATTRIBUTES_UPDATE: "/attributes/update",
} as const;
