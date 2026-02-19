import { Platform } from "react-native";
import { API_CONFIG } from "@/api/constants";
import { storyService } from "@/api/services/story.service";
import type { StoryChoice } from "@/types/story";
import type { StoryData } from "@/stores/game-store";
import { PROLOGUE_STORY_ID } from "@/utils/story-constants";

/**
 * Get full image URL from a relative or absolute image path
 * Handles both absolute URLs and relative paths
 * Media files are typically served from the server root, not under /api/
 */
export function getStoryImageUrl(
  imagePath: string | null | undefined,
): string | null {
  if (!imagePath) return null;

  // Full URL already
  if (/^https?:\/\//i.test(imagePath)) return imagePath;

  // Normalize slashes
  const trimmed = imagePath.trim();

  // If API base isn't set, we can't build a full URL
  if (!API_CONFIG.BASE_URL)
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // Derive origin from API base (works even if BASE_URL changes)
  // Wrap in try-catch to handle invalid URLs (OSStatus error -50 on iOS/React Native)
  let origin: string;
  try {
    // Ensure BASE_URL is an absolute URL before constructing URL object
    const baseUrl = API_CONFIG.BASE_URL.trim();
    if (!/^https?:\/\//i.test(baseUrl)) {
      // BASE_URL is relative, can't build full URL - return relative path
      const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
      const looksLikeMedia =
        !path.startsWith("/media/") &&
        !path.startsWith("/static") &&
        !path.startsWith("/assets") &&
        !path.startsWith("/uploads");
      return looksLikeMedia ? `/media${path}` : path;
    }

    const apiUrl = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    origin = apiUrl.origin;
  } catch {
    // URL construction failed (e.g., invalid URL, OSStatus error -50)
    // Return relative path as fallback
    const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const looksLikeMedia =
      !path.startsWith("/media/") &&
      !path.startsWith("/static") &&
      !path.startsWith("/assets") &&
      !path.startsWith("/uploads");
    return looksLikeMedia ? `/media${path}` : path;
  }

  // Normalize to leading slash
  let path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // If caller forgot /media but it's clearly a media file path, add it.
  // (Only do this when it's NOT already under /media or /static)
  const looksLikeMedia =
    !path.startsWith("/media/") &&
    !path.startsWith("/static") &&
    !path.startsWith("/assets") &&
    !path.startsWith("/uploads");

  if (looksLikeMedia) {
    path = `/media${path}`;
  }

  return `${origin}${path}`;
}
/**
 * Normalize choices from API response to StoryChoice format
 * Handles various API response formats.
 * Deduplicates by (text, target_id) to avoid duplicate choices from API or dual-source merging.
 */
export function normalizeChoices(choices: any[]): StoryChoice[] {
  if (!Array.isArray(choices)) {
    return [];
  }

  const seen = new Set<string>();
  return choices
    .map((choice: any) => {
      const text = choice.text || choice.choice_text || choice.label || "";
      const rawTargetId =
        choice.target_id || choice.target_passage_id || choice.target || "";
      const nextPassageId = choice?.next_passage_info?.passage_id || "";
      const successPassageId = choice?.success_passage_id || "";
      const failurePassageId = choice?.failure_passage_id || "";
      const primaryTarget = String(rawTargetId).trim();
      const fallbackTargets = [
        String(nextPassageId).trim(),
        String(successPassageId).trim(),
        String(failurePassageId).trim(),
      ].filter((id) => id.length > 0);
      const isNumericOnly = /^\d+$/.test(primaryTarget);
      const isSameAsChoiceId =
        typeof choice?.id !== "undefined" &&
        String(choice.id).trim() === primaryTarget;
      const shouldFallback =
        !primaryTarget ||
        isSameAsChoiceId ||
        (isNumericOnly && fallbackTargets.length > 0);
      const targetId = shouldFallback
        ? fallbackTargets[0] || ""
        : primaryTarget;
      return {
        id: choice.id || choice.choice_id,
        text: String(text).trim(),
        target_id: String(targetId).trim(),
      };
    })
    .filter((choice) => {
      if (choice.target_id.length === 0) return false;
      const key = `${choice.text}|${choice.target_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * Find the next available story after the current one
 */
export function findNextStory(
  stories: StoryData[],
  currentStoryId: string | number,
): StoryData | null {
  if (!stories || stories.length === 0) return null;

  const currentStoryIdNum =
    typeof currentStoryId === "string"
      ? parseInt(currentStoryId, 10)
      : currentStoryId;

  const currentIndex = stories.findIndex(
    (story) => story.id === currentStoryIdNum,
  );

  if (currentIndex === -1 || currentIndex === stories.length - 1) {
    return null;
  }

  // Find the next visible, available story (skip hidden; min_level <= 1 means unlocked)
  for (let i = currentIndex + 1; i < stories.length; i++) {
    const story = stories[i];
    if (story.is_hidden) continue;
    const isAvailable = (story.min_level ?? 1) <= 1;
    if (isAvailable) return story;
  }

  return null;
}

/**
 * Journal Entry Reward type
 */
export type JournalEntryReward = {
  kind: "journal_entry";
  journalEntryId: string;
  sourcePassageId?: string;
};

/**
 * Minigame Reward type
 */
export type MinigameReward = {
  kind: "minigame";
  level: string;
  isTutorial?: boolean;
  sourcePassageId?: string;
};

function parseBooleanFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function hasMinigameTutorialFlag(passage: any): boolean {
  const effects =
    passage?.story_effects && Object.keys(passage.story_effects).length > 0
      ? passage.story_effects
      : passage?.effects;

  if (!effects) return false;
  return parseBooleanFlag(effects.minigame_tutorial);
}

export function buildStoryMinigameRoute(params: {
  isTutorial: boolean;
  storyId?: string | number;
}): string {
  const storyIdValue =
    params.storyId != null ? encodeURIComponent(String(params.storyId)) : "";
  if (params.isTutorial) {
    return `/vantage?level=0&tutorial=true&from=story${
      storyIdValue ? `&storyId=${storyIdValue}` : ""
    }`;
  }
  return `/vantage?tutorial=false&from=story${
    storyIdValue ? `&storyId=${storyIdValue}` : ""
  }`;
}

/**
 * Extract journal entry reward from a passage
 * Supports both story_effects (preferred) and effects (fallback)
 * Handles string form (journal prompt id) and object form (keyed by trait)
 */
export function getJournalEntryRewardFromPassage(
  passage: any,
  primaryTrait?: string,
): JournalEntryReward | null {
  const effects =
    passage?.story_effects && Object.keys(passage.story_effects).length > 0
      ? passage.story_effects
      : passage?.effects;

  if (!effects) return null;
  if (!effects.journal_entry) return null;

  const je = effects.journal_entry;
  // string form
  if (typeof je === "string") {
    return {
      kind: "journal_entry",
      journalEntryId: je,
      sourcePassageId: passage?.passage_id ?? passage?.id,
    };
  }

  // object keyed by trait form
  if (je && typeof je === "object" && !Array.isArray(je) && primaryTrait) {
    const key = String(primaryTrait ?? "")
      .toLowerCase()
      .trim();
    const id = je[key];
    if (typeof id === "string") {
      return {
        kind: "journal_entry",
        journalEntryId: id,
        sourcePassageId: passage?.passage_id ?? passage?.id,
      };
    }
  }

  return null;
}

/**
 * Extract minigame reward from a passage
 * Supports both story_effects (preferred) and effects (fallback)
 * Checks for minigame_levelOne or other minigame level keys
 * Also checks for minigame_tutorial flag to determine if tutorial should be shown
 */
export function getMinigameRewardFromPassage(
  passage: any,
): MinigameReward | null {
  const effects =
    passage?.story_effects && Object.keys(passage.story_effects).length > 0
      ? passage.story_effects
      : passage?.effects;

  if (!effects) return null;

  // Check for minigame_levelOne or other minigame level keys
  const minigameLevel =
    effects.minigame_levelOne ||
    effects.minigame_levelTwo ||
    effects.minigame_levelThree ||
    effects.minigame_level;

  if (!minigameLevel) return null;

  // Determine the level from the key found
  let level = "levelOne";
  if (effects.minigame_levelOne) level = "levelOne";
  else if (effects.minigame_levelTwo) level = "levelTwo";
  else if (effects.minigame_levelThree) level = "levelThree";
  else if (effects.minigame_level) level = String(effects.minigame_level);

  // Check if minigame_tutorial flag is set
  const isTutorial = parseBooleanFlag(effects.minigame_tutorial);

  return {
    kind: "minigame",
    level,
    isTutorial,
    sourcePassageId: passage?.passage_id ?? passage?.id,
  };
}

/**
 * Check if passage has minigame option enabled
 * Returns true if story_effects.minigame or effects.minigame is true
 */
export function hasMinigameOption(passage: any): boolean {
  const effects =
    passage?.story_effects && Object.keys(passage.story_effects).length > 0
      ? passage.story_effects
      : passage?.effects;

  if (!effects) return false;
  return effects.minigame === true;
}

/**
 * Experience/Lumens Reward type
 */
export type ExperienceReward = {
  kind: "experience" | "lumens";
  amount: number;
  sourcePassageId?: string;
};

/**
 * Extract experience/lumens reward from a passage
 * Supports both story_effects (preferred) and effects (fallback)
 * Checks for experience, lumens, or exp keys
 */
export function getExperienceRewardFromPassage(
  passage: any,
): ExperienceReward | null {
  const effects =
    passage?.story_effects && Object.keys(passage.story_effects).length > 0
      ? passage.story_effects
      : passage?.effects;

  if (!effects) return null;

  // Check for experience, lumens, or exp keys (support legacy misspelling "expierence")
  const experienceAmount =
    effects.experience ||
    effects.expierence ||
    effects.lumens ||
    effects.exp ||
    effects.lumen;

  if (
    !experienceAmount ||
    typeof experienceAmount !== "number" ||
    experienceAmount <= 0
  ) {
    return null;
  }

  return {
    kind: "lumens", // Use 'lumens' as the display name
    amount: experienceAmount,
    sourcePassageId: passage?.passage_id ?? passage?.id,
  };
}

/**
 * Normalize speaker name for display
 * If speaker name starts with "Cur", replace it with "The Curator"
 */
export function normalizeSpeakerName(
  speakerName: string | null | undefined,
): string | null {
  if (!speakerName) return null;

  // Check if speaker name starts with "Cur" (case-insensitive)
  if (
    String(speakerName ?? "")
      .trim()
      .toLowerCase()
      .startsWith("cur")
  ) {
    return "The Curator";
  }

  return speakerName;
}

/**
 * Default maximum retries for API calls
 */
export const DEFAULT_MAX_RETRIES = 3;

/**
 * Retry an API call with exponential backoff
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = DEFAULT_MAX_RETRIES,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      const status = (error as any)?.status ?? (error as any)?.response?.status;
      const isClientError =
        typeof status === "number" && status >= 400 && status < 500;
      const isRetriableClientError = status === 408 || status === 429;
      if (isClientError && !isRetriableClientError) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Get platform-specific retry delay
 */
export function getRetryDelay(): number {
  return Platform.OS === "web" ? 500 : 1000;
}

/**
 * Check if a story is the prologue story (ID 28)
 */
export function isIntroductionStory(storyId: string | number): boolean {
  const id = Number(storyId);
  return id === PROLOGUE_STORY_ID;
}

/**
 * Get starting passage ID for a story
 */
export async function getStartingPassageId(storyId: string | number): Promise<{
  startingPassageId: string;
}> {
  const retryDelay = getRetryDelay();

  const restartResponse = await retryApiCall(
    () => storyService.restartStory(Number(storyId)),
    DEFAULT_MAX_RETRIES,
    retryDelay,
  );

  const startingPassageId =
    restartResponse?.starting_passage ||
    restartResponse?.starting_passage_id ||
    restartResponse?.story?.starting_passage_id ||
    restartResponse?.story?.starting_passage ||
    restartResponse?.passage?.passage_id ||
    restartResponse?.passage?.id;

  if (!startingPassageId) {
    throw new Error("Story restart did not provide a starting passage ID.");
  }

  return {
    startingPassageId: String(startingPassageId),
  };
}

/**
 * Normalize passage state from API response
 * Backend already provides speaker_image, speaker_name, passage_type, passage_id.
 * Preserves EMA payload when backend returns ema_required (e.g. terminal passage on study day 1–5).
 */
export function normalizePassageState(state: any) {
  // Normalize choices
  if (state.passage?.choices && Array.isArray(state.passage.choices)) {
    state.passage.choices = normalizeChoices(state.passage.choices);
  }

  // EMA: map backend fields to emaRequest for post-story survey
  const emaRequired = state.ema_required === true;
  const storyCompletionId =
    state.story_completion_id != null
      ? Number(state.story_completion_id)
      : undefined;
  const studyDay =
    state.study_day != null ? Number(state.study_day) : undefined;
  if (
    emaRequired &&
    typeof storyCompletionId === "number" &&
    typeof studyDay === "number"
  ) {
    state.emaRequest = {
      storyCompletionId,
      studyDay,
    };
  } else {
    state.emaRequest = undefined;
  }

  return state;
}
