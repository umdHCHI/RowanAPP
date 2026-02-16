import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { storyService } from "@/api/services/story.service";
import { usePassageChoices, storyKeys } from "@/api/hooks/use-story";
import type { StoryChoice } from "@/types/story";
import type { UseStoryEngineResult, UseStoryEngineProps } from "@/types/hooks";
import { useStoryStore } from "@/stores/story-store";
import { useStoryCompletionStore } from "@/stores/story-completion-store";
import {
  retryApiCall,
  getStartingPassageId,
  normalizePassageState,
  normalizeChoices,
  DEFAULT_MAX_RETRIES,
  getRetryDelay,
} from "@/utils/story-helpers";
import type { TextSpeed } from "@/stores/game-store";

function extractErrorMessage(err: any): string {
  if (err?.message) return err.message;
  if (err?.response) {
    return `Network error: ${err.response.status} - ${err.response.statusText}`;
  }
  if (err?.request)
    return "Network request failed. Please check your connection.";
  return "An unexpected error occurred.";
}

function areChoicesEqual(
  a: StoryChoice[] | undefined,
  b: StoryChoice[],
): boolean {
  if (!a) return false;
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i];
    const right = b[i];
    if (String(left?.id ?? "") !== String(right?.id ?? "")) return false;
    if (String(left?.text ?? "") !== String(right?.text ?? "")) return false;
    if (String(left?.target_id ?? "") !== String(right?.target_id ?? ""))
      return false;
  }
  return true;
}

/** Get retry delay based on text speed preference */
function getRetryDelayForSpeed(textSpeed?: TextSpeed): number {
  const baseDelay = getRetryDelay();
  // FAST mode: minimal retry delays for snappy progression
  if (textSpeed === "fast") return 100;
  // Normal mode: standard delay
  if (textSpeed === "normal") return baseDelay;
  // Slow mode: slightly longer delay
  if (textSpeed === "slow") return baseDelay * 1.5;
  return baseDelay;
}

export function useStoryEngine({
  storyId,
  shouldRestart = false,
  textSpeed,
}: UseStoryEngineProps): UseStoryEngineResult {
  const engineState = useStoryStore((state) => state.engineState);
  const isLoading = useStoryStore((state) => state.isLoading);
  const error = useStoryStore((state) => state.error);
  const storyTitle = useStoryStore((state) => state.storyTitle);
  const currentPassage = useStoryStore((state) => state.currentPassage);
  const choices = useStoryStore((state) => state.choices);
  const isInitialized = useStoryStore((state) => state.isInitialized);
  const isEnding = useStoryStore((state) => state.isEnding);
  const isDecision = useStoryStore((state) => state.isDecision);
  const hasChoices = useStoryStore((state) => state.hasChoices);
  const hasMultipleChoices = useStoryStore((state) => state.hasMultipleChoices);
  const pendingEmaRequest = useStoryStore((state) => state.pendingEmaRequest);
  const setEngineState = useStoryStore((state) => state.setEngineState);
  const setLoading = useStoryStore((state) => state.setLoading);
  const setError = useStoryStore((state) => state.setError);
  const setStoryId = useStoryStore((state) => state.setStoryId);
  const clearHistory = useStoryStore((state) => state.clearHistory);
  const clearStoryCompleted = useStoryCompletionStore(
    (state) => state.clearStoryCompleted,
  );
  const passagePkMapRef = useRef<Map<string, string>>(new Map());
  const passageIdMapRef = useRef<Map<string, string>>(new Map());
  const [currentPassagePk, setCurrentPassagePk] = useState<string | null>(null);
  const startedRef = useRef(false);

  function fillPassageMapsFromList(passages: any[]) {
    const map = new Map<string, string>();
    const reverseMap = new Map<string, string>();
    passages.forEach((item: any) => {
      if (item?.passage_id && item?.id) {
        map.set(String(item.passage_id), String(item.id));
        reverseMap.set(String(item.id), String(item.passage_id));
      }
    });
    passagePkMapRef.current = map;
    passageIdMapRef.current = reverseMap;
  }

  const hydratePassageMaps = useCallback(async () => {
    if (passagePkMapRef.current.size > 0 && passageIdMapRef.current.size > 0)
      return;
    const passages = await retryApiCall(
      () => storyService.getStoryPassages(Number(storyId)),
      DEFAULT_MAX_RETRIES,
      getRetryDelay(),
    );
    fillPassageMapsFromList(passages);
  }, [storyId]);

  /** Resolve passage pk from passage; uses pre-filled maps so usually sync. */
  const resolvePassagePk = useCallback((passage: any): string | null => {
    if (!passage) return null;
    if (passage.id) return String(passage.id);
    if (passage.passage_id) {
      const existing = passagePkMapRef.current.get(String(passage.passage_id));
      return existing ?? null;
    }
    return null;
  }, []);

  const queryClient = useQueryClient();
  const { data: passageChoices } = usePassageChoices(currentPassagePk);

  useEffect(() => {
    setStoryId(storyId ?? null);
  }, [storyId, setStoryId]);

  // Reset so startStoryFlow re-runs when storyId or restart intent changes (e.g. user taps "Restart this Book")
  useEffect(() => {
    startedRef.current = false;
    passagePkMapRef.current = new Map();
    passageIdMapRef.current = new Map();
  }, [storyId, shouldRestart]);

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    async function startStoryFlow() {
      if (startedRef.current) return;
      startedRef.current = true;
      setLoading(true);
      setError(null);
      setEngineState(null);

      try {
        let initialState: any = null;
        let startingPassageId: string | null = null;

        async function fetchPassageWithMaps(passageId: string) {
          const [passageState, passages] = await Promise.all([
            retryApiCall(
              () => storyService.getPassage(Number(storyId), passageId),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            ),
            retryApiCall(
              () => storyService.getStoryPassages(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            ),
          ]);
          fillPassageMapsFromList(passages);
          return passageState;
        }

        async function restartFromBeginning(clearCompletion: boolean) {
          clearHistory();
          if (clearCompletion) {
            clearStoryCompleted(Number(storyId));
          }

          const restartResponse = await retryApiCall(
            () => storyService.restartStory(Number(storyId)),
            DEFAULT_MAX_RETRIES,
            getRetryDelay(),
          );

          startingPassageId =
            restartResponse?.starting_passage_id ||
            restartResponse?.starting_passage ||
            restartResponse?.story?.starting_passage_id ||
            restartResponse?.story?.starting_passage ||
            null;

          if (!startingPassageId) {
            const { startingPassageId: fromRestart } =
              await getStartingPassageId(storyId);
            startingPassageId = fromRestart;
          }

          if (restartResponse?.passage) {
            const passages = await retryApiCall(
              () => storyService.getStoryPassages(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            );
            fillPassageMapsFromList(passages);
            initialState = restartResponse;
          } else if (startingPassageId) {
            initialState = await fetchPassageWithMaps(
              String(startingPassageId),
            );
          }
        }

        if (shouldRestart) {
          await restartFromBeginning(true);
        } else {
          const progress =
            await storyService.getStoryProgressByStoryId(storyId);

          const progressStatus = String(progress?.status ?? "").toLowerCase();
          const progressCompleted =
            progress?.is_completed === true || progressStatus === "completed";

          if (!progress) {
            const startResponse = await retryApiCall(
              () => storyService.startStory(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            );

            startingPassageId =
              startResponse?.starting_passage_id ||
              startResponse?.starting_passage ||
              startResponse?.story?.starting_passage_id ||
              startResponse?.story?.starting_passage ||
              null;

            if (startResponse?.passage) {
              const passages = await retryApiCall(
                () => storyService.getStoryPassages(Number(storyId)),
                DEFAULT_MAX_RETRIES,
                getRetryDelay(),
              );
              fillPassageMapsFromList(passages);
              initialState = startResponse;
            } else if (startingPassageId) {
              initialState = await fetchPassageWithMaps(
                String(startingPassageId),
              );
            }
          } else if (progressCompleted) {
            // Completed runs should start fresh on normal entry.
            await restartFromBeginning(false);
          } else {
            const resumePassageId = progress?.current_passage_id
              ? String(progress.current_passage_id).trim()
              : null;

            if (resumePassageId) {
              initialState = await fetchPassageWithMaps(resumePassageId);
            } else {
              const restartResponse = await retryApiCall(
                () => storyService.restartStory(Number(storyId)),
                DEFAULT_MAX_RETRIES,
                getRetryDelay(),
              );
              startingPassageId =
                restartResponse?.starting_passage_id ||
                restartResponse?.starting_passage ||
                restartResponse?.story?.starting_passage_id ||
                restartResponse?.story?.starting_passage ||
                null;
              if (restartResponse?.passage) {
                const passages = await retryApiCall(
                  () => storyService.getStoryPassages(Number(storyId)),
                  DEFAULT_MAX_RETRIES,
                  getRetryDelay(),
                );
                fillPassageMapsFromList(passages);
                initialState = restartResponse;
              } else if (startingPassageId) {
                initialState = await fetchPassageWithMaps(
                  String(startingPassageId),
                );
              }
            }
          }
        }

        if (!initialState || !initialState.passage) {
          throw new Error("Failed to fetch the initial passage.");
        }

        const normalizedState = normalizePassageState(initialState);
        setEngineState(normalizedState);
      } catch (err: any) {
        const message = extractErrorMessage(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    startStoryFlow();
  }, [
    storyId,
    shouldRestart,
    clearHistory,
    clearStoryCompleted,
    setEngineState,
    setError,
    setLoading,
  ]);

  useEffect(() => {
    if (!engineState?.passage) {
      setCurrentPassagePk(null);
      return;
    }
    const passagePk = resolvePassagePk(engineState.passage);
    setCurrentPassagePk(passagePk);
  }, [
    engineState?.passage,
    engineState?.passage?.passage_id,
    resolvePassagePk,
  ]);

  // Only merge passageChoices when they belong to the CURRENT passage.
  // When we navigate to a new passage, currentPassagePk lags by one render (updated in a separate effect).
  // Without this guard, we would overwrite the new passage's choices with the previous passage's choices,
  // causing wrong or duplicated choices—especially visible on story_effect reward passages.
  useEffect(() => {
    if (!passageChoices || !engineState?.passage) return;

    const passagePk = resolvePassagePk(engineState.passage);
    if (currentPassagePk !== passagePk) return;

    const normalizedChoices = normalizeChoices(passageChoices);
    if (areChoicesEqual(engineState.passage.choices, normalizedChoices)) return;
    setEngineState({
      ...engineState,
      passage: {
        ...engineState.passage,
        choices: normalizedChoices,
      },
    });
  }, [
    passageChoices,
    engineState?.passage,
    engineState?.passage?.passage_id,
    currentPassagePk,
    resolvePassagePk,
    setEngineState,
  ]);

  const makeChoice = useCallback(
    async (choice: StoryChoice) => {
      if (isLoading || !storyId || !choice?.target_id) return null;

      setLoading(true);
      setError(null);

      try {
        await hydratePassageMaps();
        const rawTargetId = String(choice.target_id).trim();
        const isNumericTarget = /^\d+$/.test(rawTargetId);
        const targetPassageId = isNumericTarget
          ? passageIdMapRef.current.get(rawTargetId) || rawTargetId
          : rawTargetId;
        const delayMs = getRetryDelayForSpeed(textSpeed);

        // Fire-and-forget makeChoice logging call (for FAST mode, don't wait for it)
        // This records the choice on the backend but doesn't block UI progression
        const isFastMode = textSpeed === "fast";
        const makeChoicePromise = retryApiCall(
          () =>
            storyService.makeChoice(
              storyId,
              String(targetPassageId),
              choice.text,
              {
                story_id: storyId,
                choice_id: choice.id,
              },
            ),
          DEFAULT_MAX_RETRIES,
          delayMs,
        ).catch(() => {
          // Logging shouldn't block traversal
        });

        // Don't await makeChoice in FAST mode; fetch the next passage immediately
        if (!isFastMode) {
          await makeChoicePromise;
        }

        let nextPassageState: any = null;
        try {
          nextPassageState = await retryApiCall(
            () =>
              storyService.getPassage(Number(storyId), String(targetPassageId)),
            DEFAULT_MAX_RETRIES,
            delayMs,
          );
        } catch (firstErr) {
          // Some backends expect passage by PK; try PK if targetPassageId looks like UUID and we have a mapping
          const pk = passagePkMapRef.current.get(String(targetPassageId));
          if (pk) {
            nextPassageState = await retryApiCall(
              () => storyService.getPassage(Number(storyId), String(pk)),
              DEFAULT_MAX_RETRIES,
              delayMs,
            );
          }
          if (!nextPassageState) throw firstErr;
        }

        if (!nextPassageState || !nextPassageState.passage) {
          throw new Error("Failed to load the next passage.");
        }

        // Normalize choices
        const normalizedState = normalizePassageState(nextPassageState);

        setEngineState(normalizedState);
        // Invalidate passage-choices so revisiting the same passage refetches (avoids stale filtered list)
        queryClient.invalidateQueries({
          queryKey: [...storyKeys.all, "passage-choices"],
        });
        return normalizedState;
      } catch (err: any) {
        const message = extractErrorMessage(err);
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      storyId,
      isLoading,
      textSpeed,
      hydratePassageMaps,
      queryClient,
      setEngineState,
      setError,
      setLoading,
    ],
  );

  return {
    isLoading,
    error,
    currentPassage,
    storyTitle,
    makeChoice,
    isInitialized,
    isEnding,
    isDecision,
    hasChoices,
    hasMultipleChoices,
    choices,
    pendingEmaRequest,
  };
}
