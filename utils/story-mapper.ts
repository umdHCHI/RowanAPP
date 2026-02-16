import type { StoryCard, CardStatus } from "@/types/hub/hub";
import type { StoryProgressResponse, StoryResponse } from "@/api/types";
import { getStoryImageUrl } from "@/utils/story-helpers";
import { isStoryUnlocked, PROLOGUE_STORY_ID } from "@/utils/story-constants";

/**
 * Truncate text to a maximum length, adding ellipsis if needed
 */
function truncateText(text: string, maxLength: number): string {
  // Handle empty or falsy strings
  if (!text || text.trim().length === 0) return text;
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

function normalizeStoryThemes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }
    } catch {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return [];
}

/** Prologue is story 1 (first card, no resources). Prefer id from backend progress (story_title "Prologue"). */
function isPrologueStory(
  story: StoryResponse,
  prologueStoryIdFromBackend?: number | null,
): boolean {
  if (
    prologueStoryIdFromBackend != null &&
    story.id === prologueStoryIdFromBackend
  )
    return true;
  if (story.id === PROLOGUE_STORY_ID) return true;
  const titleLower = String(story.title ?? "").toLowerCase();
  return titleLower.includes("prologue") || titleLower === "prologue";
}

/**
 * Map API stories to StoryCard format for the hub
 *
 * @param stories - Array of story data from API
 * @param userCreatedAt - User creation date for daily unlock calculation (optional)
 */
export function mapStoriesToCards(
  stories: StoryResponse[],
  userCreatedAt?: string | Date | null,
  progressList?: StoryProgressResponse[],
  completedStoryIds?: number[],
): StoryCard[] {
  if (!stories || stories.length === 0) {
    return [];
  }

  const completedStoryIdSet = new Set(
    (completedStoryIds ?? []).map((id) => Number(id)),
  );

  const progressByStoryId = new Map<number, StoryProgressResponse>();
  if (Array.isArray(progressList)) {
    progressList.forEach((item) => {
      if (typeof item?.story === "number") {
        progressByStoryId.set(item.story, item);
      }
    });
  }

  // Derive prologue story id from backend progress (story_title "Prologue") so we don't hardcode IDs
  const prologueStoryIdFromBackend =
    progressList?.find((p) =>
      String(p.story_title ?? "")
        .toLowerCase()
        .includes("prologue"),
    )?.story ?? null;

  // Helper function to map a story to a card
  function mapStoryToCard(
    story: StoryResponse,
    index: number,
    isPrologue: boolean,
    resolvedPrologueStoryId: number,
  ): StoryCard {
    let status: CardStatus = "available";

    if (!isPrologue) {
      const isUnlocked = isStoryUnlocked(
        story.id,
        userCreatedAt,
        resolvedPrologueStoryId,
      );
      if (!isUnlocked) status = "locked";
    }

    if ((story.min_level ?? 1) > 1 && status !== "locked") status = "locked";

    const progress = progressByStoryId.get(story.id);
    const statusValue = String(progress?.status ?? "").toLowerCase();
    const completedFromBackend =
      progress?.is_completed === true || statusValue === "completed";
    const completionCount = Number(
      progress?.story_variables?.completion_count ?? 0,
    );
    const completedLocally = completedStoryIdSet.has(story.id);

    if (
      status !== "locked" &&
      (completedFromBackend || completionCount > 0 || completedLocally)
    ) {
      status = "completed";
    }

    const inProgress =
      status === "available" &&
      !!progress &&
      !completedFromBackend &&
      completionCount === 0;

    const hasResources = !isPrologue;
    const label = isPrologue ? "Prologue" : `Book ${index + 1}`;
    const normalizedStoryThemes = normalizeStoryThemes(story.story_themes);

    return {
      id: `story-${story.id}`,
      label,
      title: truncateText(story.title, 50),
      subtitle: truncateText(story.atmosphere || "THE ARCHIVE", 30),
      tagline: story.description || "Your journey awaits",
      storyId: story.id,
      status,
      isPrologue,
      inProgress,
      hasResources,
      imageUrl: getStoryImageUrl(story.image),
      storyThemes:
        normalizedStoryThemes.length > 0
          ? normalizedStoryThemes
          : story.revelations || [],
    };
  }

  const visibleStories = stories.filter((story) => !story.is_hidden);

  // Prologue is story 1 (first card). Use backend progress story_title "Prologue" for id when available.
  const prologueStory =
    (prologueStoryIdFromBackend != null
      ? visibleStories.find((s) => s.id === prologueStoryIdFromBackend)
      : null) ??
    visibleStories.find((s) => isPrologueStory(s, prologueStoryIdFromBackend));
  const resolvedPrologueStoryId: number =
    prologueStory?.id ?? prologueStoryIdFromBackend ?? PROLOGUE_STORY_ID;
  const otherStories = visibleStories
    .filter((s) => !isPrologueStory(s, prologueStoryIdFromBackend))
    .sort((a, b) => a.id - b.id);

  const prologueCard = prologueStory
    ? mapStoryToCard(prologueStory, 0, true, resolvedPrologueStoryId)
    : null;
  const otherStoryCards: StoryCard[] = otherStories.map((story, index) =>
    mapStoryToCard(story, index, false, resolvedPrologueStoryId),
  );

  if (prologueCard) {
    return [prologueCard, ...otherStoryCards];
  }
  return otherStoryCards;
}
