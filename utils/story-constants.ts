import type { TextSpeed } from "@/stores/game-store";

/**
 * Auto-advance speed configuration for story text
 * Based on reading speed (Words Per Minute - WPM)
 *
 * Average word length in English: ~5 characters (including space)
 * Word count estimation: contentLength / 5
 *
 * WPM targets:
 * - Slow: 100-150 WPM (using 125 WPM average)
 * - Normal: ~250 WPM (average of 238 non-fiction and 260 fiction)
 * - Fast: 400-700 WPM (using 550 WPM average)
 */
export const AUTO_ADVANCE_SPEED: Record<
  TextSpeed,
  { wordDelay: number; minDelay: number; maxDelay: number }
> = {
  // Slow: 125 WPM = 60,000ms / 125 words = 480ms per word
  slow: { wordDelay: 480, minDelay: 2000, maxDelay: 15000 },
  // Normal: 250 WPM = 60,000ms / 250 words = 240ms per word
  normal: { wordDelay: 240, minDelay: 1500, maxDelay: 8000 },
  // Fast: 550 WPM = 60,000ms / 550 words = 109ms per word
  fast: { wordDelay: 109, minDelay: 800, maxDelay: 4000 },
};

/**
 * Prologue is story 1 on the hub (first card, no resources). Backend uses ID 28.
 */
export const PROLOGUE_STORY_ID = 28;

/**
 * Check if a choice text is a "Continue" choice (includes partial match; used e.g. for history)
 */
export function isContinueChoice(choiceText: string): boolean {
  return String(choiceText ?? "")
    .toLowerCase()
    .includes("continue");
}

/** Exact "Continue" / "continue" only (trimmed). Used for auto-advance vs showing as button. */
export function isExactContinueChoice(choiceText: string): boolean {
  return (
    String(choiceText ?? "")
      .trim()
      .toLowerCase() === "continue"
  );
}

/**
 * Study day for EMA: days since profile creation in local time, capped at 5.
 * Day 1 = creation day (local), day 2 = next calendar day, etc.
 * @param createdAt - Profile created_at (e.g. "2025-08-08T00:20:34.033107Z") or Date
 * @returns 1–5
 */
export function getStudyDayFromCreatedAt(
  createdAt: string | Date | null | undefined,
): number {
  if (createdAt == null) return 1;
  const start = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  if (Number.isNaN(start.getTime())) return 1;
  const now = new Date();
  const startLocal = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );
  const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = nowLocal.getTime() - startLocal.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const day = Math.min(5, Math.max(1, diffDays + 1));
  return day;
}

/**
 * Calculate which stories should be unlocked based on user creation date
 *
 * Rules:
 * - Day 0 (new user): Stories 28 and 29 unlocked
 * - Day 1 (after 24 hours): Story 30 unlocked
 * - Day 2 (after 48 hours): Next story unlocked, and so on
 *
 * @param userCreatedAt - User creation date as ISO string or Date object
 * @returns Set of unlocked story IDs
 */
export function getUnlockedStoryIds(
  userCreatedAt: string | Date | null | undefined,
): Set<number> {
  const unlockedIds = new Set<number>();

  // If no creation date, unlock only the first two stories (28, 29)
  if (!userCreatedAt) {
    unlockedIds.add(28);
    unlockedIds.add(29);
    return unlockedIds;
  }

  // Parse creation date
  const createdAt =
    typeof userCreatedAt === "string" ? new Date(userCreatedAt) : userCreatedAt;

  // If invalid date, unlock only the first two stories
  if (isNaN(createdAt.getTime())) {
    unlockedIds.add(28);
    unlockedIds.add(29);
    return unlockedIds;
  }

  // Calculate days since creation (using 24-hour periods)
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  // Day 0: Stories 28 and 29 are always unlocked
  unlockedIds.add(28);
  unlockedIds.add(29);

  // After day 0, unlock one story per day starting from story 30
  // Day 1 unlocks story 30, Day 2 unlocks story 31, etc.
  // We start counting from story 30, so day 1 = story 30, day 2 = story 31, etc.
  const startingStoryId = 30;
  const maxDays = diffDays;

  // Unlock stories based on days passed
  // Day 0: stories 28, 29 (already added)
  // Day 1: story 30
  // Day 2: story 31
  // Day N: story 30 + (N - 1)
  for (let day = 1; day <= maxDays; day++) {
    const storyId = startingStoryId + (day - 1);
    unlockedIds.add(storyId);
  }

  return unlockedIds;
}

/**
 * Check if a story is unlocked based on user creation date
 *
 * @param storyId - The story ID to check
 * @param userCreatedAt - User creation date as ISO string or Date object
 * @param prologueStoryId - When provided (e.g. from backend progress story_title "Prologue"), this story is always unlocked
 */
export function isStoryUnlocked(
  storyId: number,
  userCreatedAt: string | Date | null | undefined,
  prologueStoryId?: number | null,
): boolean {
  if (prologueStoryId != null && storyId === prologueStoryId) return true;
  if (storyId === PROLOGUE_STORY_ID) return true;
  const unlockedIds = getUnlockedStoryIds(userCreatedAt);
  return unlockedIds.has(storyId);
}
