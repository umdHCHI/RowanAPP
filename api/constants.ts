/**
 *Contact the HCI team for ENV file
 */

type ApiConfig = {
  BASE_URL: string;

  ROOT_URL: string;
  AUTH_TOKEN: string;
  TIMEOUT: number;
  MAX_RETRIES: number;
  RETRY_DELAY: number;
};

function normalizeUrl(url: string): string {
  if (!url) return "";
  let u = url.trim();

  if (!u.endsWith("/")) u += "/";
  return u;
}

function ensureApiBaseUrl(url: string): string {
  if (!url) return "";
  const normalized = normalizeUrl(url);
  if (normalized.endsWith("/api/")) return normalized;
  if (normalized.endsWith("/api")) return `${normalized}/`;
  return `${normalized}api/`;
}

function deriveRootUrl(url: string): string {
  if (!url) return "";
  const normalized = normalizeUrl(url);
  if (normalized.endsWith("/api/")) return normalized.slice(0, -"api/".length);
  if (normalized.endsWith("/api")) return normalized.slice(0, -"api".length);
  return normalized;
}

function safeGetExpoExtra(): { apiUrl?: string; apiToken?: string } {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require("expo-constants").default;
    const extra = Constants?.expoConfig?.extra ?? {};
    return {
      apiUrl: extra.apiUrl,
      apiToken: extra.apiToken,
    };
  } catch {
    return {};
  }
}

function getConfigValue(key: "apiUrl" | "apiToken"): string {
  const extra = safeGetExpoExtra();

  if (key === "apiUrl" && extra.apiUrl) return String(extra.apiUrl);
  if (key === "apiToken" && extra.apiToken) return String(extra.apiToken);

  if (key === "apiUrl") return process.env.EXPO_PUBLIC_API_URL ?? "";
  if (key === "apiToken") return process.env.EXPO_PUBLIC_API_TOKEN ?? "";

  return "";
}

const rawBaseUrl = getConfigValue("apiUrl");
const rawToken = getConfigValue("apiToken");

export const API_CONFIG: ApiConfig = {
  BASE_URL: ensureApiBaseUrl(rawBaseUrl),
  ROOT_URL: deriveRootUrl(rawBaseUrl),
  AUTH_TOKEN: rawToken,
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export function apiUrl(path: string): string {
  const base = API_CONFIG.BASE_URL;
  if (!base) return path;
  const p = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${p}`;
}

export function getBugReportStoreUrl(): string {
  return apiUrl(API_ENDPOINTS.BUG_REPORT);
}

export const API_ENDPOINTS = {
  // --- Auth (users.urls) ---
  USER_LOGIN: "/auth/login/",
  USER_REGISTER: "/auth/register/",

  // --- Bug report (Django stores + sends email via Resend) ---
  BUG_REPORT: "report-bug/",

  // --- Users ---
  USER_FULL_PROFILE: "/users/me/",
  USER: "/users/",
  USER_BY_ID: (id: string | number) => `/users/${id}/`,

  // --- Characters (api/characters/) ---
  CHARACTERS: "/characters/characters/",
  CHARACTER_MINE: "/characters/characters/my_character/",
  CHARACTER_CREATE: "/characters/characters/",
  CHARACTER_UPDATE_CUSTOMIZATION:
    "/characters/characters/update_customization/",
  CHARACTER_GAIN_LUMENS: "/characters/characters/gain-lumens/",

  // --- Story (api/story/) ---
  STORY: "/story/",
  STORY_STORIES: "/story/stories/",
  STORY_BY_ID: (id: string | number) => `/story/stories/${id}/`,
  STORY_PROGRESS: "/story/story-progress/",
  STORY_PROGRESS_BY_ID: (id: string | number) =>
    `/story/stories/${id}/progress/`,
  STORY_START: (id: string | number) => `/story/stories/${id}/start/`,
  STORY_RESTART: (id: string | number) => `/story/stories/${id}/restart/`,
  STORY_GET_PASSAGE: (storyId: string | number, passageId: string) =>
    `/story/stories/${storyId}/passage/${passageId}/`,
  STORY_PASSAGES: "/story/passages/",
  STORY_PASSAGE_CHOICES: (passagePk: string | number) =>
    `/story/passages/${passagePk}/choices/`,
  STORY_MAKE_CHOICE: (storyId: string | number) =>
    `/story/stories/${storyId}/make-choice/`,
  STORY_COMPLETE: (storyId: string | number) =>
    `/story/stories/${storyId}/complete/`,

  // --- Journal (api/journal/) ---
  JOURNAL_COMPLETED_ENTRIES: "/journal/completed-entries/",
  JOURNAL_ENTRY_BY_ID: (id: string | number) =>
    `/journal/completed-entries/${id}/`,
  JOURNAL_PROMPTS: "/journal/journal-prompts/",

  // --- Game (api/game/, GameDataViewSet) ---
  GAME_MY_DATA: "/game/game-data/my-data/",
  GAME_STATS: "/game/game-data/stats/",
  GAME_RECORD_PROGRESS: "/game/record-progress/",
  VANTAGE_RUN: "/game/game-data/vantage/run/",
  GAME_GAIN_WELLNESS: "/game/gain-wellness/",

  // --- EMA (api/ema/) ---
  EMA_PROMPTS: "/ema/prompts/",
  EMA_SUBMIT_RESPONSE: "/ema/responses/",
  EMA_RESPONSES_ME: (day: number) => `/ema/responses/me/?day=${day}`,
  EMA_RESPONSE_BY_ID: (id: number) => `/ema/responses/${id}/`,

  // --- Research (api/research/) ---
  RESEARCH_MY_DATA: "/research/my_research_data/",

  // --- Media (root, not under /api/) ---
  MEDIA: "/media/",

  // --- Deprecated: no Django app (use character/profile for lumens) ---
  EQUIPMENT: "/equipment/",
  EQUIPMENT_BY_ID: (id: string) => `/equipment/${id}/`,
  ATTRIBUTES: "/attributes/",
  ATTRIBUTES_UPDATE: "/attributes/update/",
} as const;
