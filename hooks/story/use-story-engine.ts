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

const storyDebug = (..._args: unknown[]) => {};

function extractErrorMessage(err: any): string {
  if (err?.message) return err.message;
  if (err?.response) {
    return `Network error: ${err.response.status} - ${err.response.statusText}`;
  }
  if (err?.request)
    return "Network request failed. Please check your connection.";
  return "An unexpected error occurred.";
}

function isNotFoundError(err: any): boolean {
  const status = err?.status ?? err?.response?.status;
  return status === 404;
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
  const sessionRunIdRef = useRef(0);

  const isStorySessionActive = useCallback(
    (runId: number, expectedStoryId: string | number | null | undefined) => {
      if (runId !== sessionRunIdRef.current) return false;
      const activeStoryId = useStoryStore.getState().storyId;
      return String(activeStoryId ?? "") === String(expectedStoryId ?? "");
    },
    [],
  );

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

  // On story switch/restart intent change, clear volatile engine state first,
  // then set active storyId to avoid stale passage history being stamped with new storyId.
  useEffect(() => {
    storyDebug("session-reset", {
      storyId: String(storyId ?? ""),
      shouldRestart,
      previousStoreStoryId: String(useStoryStore.getState().storyId ?? ""),
      previousPassageId:
        useStoryStore.getState().currentPassage?.passage_id ?? null,
    });
    startedRef.current = false;
    passagePkMapRef.current = new Map();
    passageIdMapRef.current = new Map();
    setCurrentPassagePk(null);
    clearHistory();
    setEngineState(null);
    setError(null);
    setLoading(false);
    setStoryId(storyId ?? null);
  }, [
    storyId,
    shouldRestart,
    clearHistory,
    setEngineState,
    setError,
    setLoading,
    setStoryId,
  ]);

  useEffect(() => {
    const runId = ++sessionRunIdRef.current;
    storyDebug("run-created", { runId, storyId: String(storyId ?? "") });

    if (!storyId) {
      clearHistory();
      setEngineState(null);
      setError(null);
      setLoading(false);
      return;
    }

    async function startStoryFlow() {
      if (startedRef.current) return;
      startedRef.current = true;
      if (!isStorySessionActive(runId, storyId)) {
        storyDebug("run-dropped-before-start", {
          runId,
          storyId: String(storyId ?? ""),
          storeStoryId: String(useStoryStore.getState().storyId ?? ""),
        });
        return;
      }
      storyDebug("run-start", { runId, storyId: String(storyId ?? "") });
      // New story session: always clear prior story transcript to avoid cross-story mixing
      clearHistory();
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
          if (!isStorySessionActive(runId, storyId)) {
            storyDebug("fetch-passage-maps-dropped", {
              runId,
              storyId: String(storyId ?? ""),
              passageId,
            });
            return null;
          }
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

          if (!isStorySessionActive(runId, storyId)) {
            storyDebug("restart-response-dropped", {
              runId,
              storyId: String(storyId ?? ""),
            });
            return;
          }

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

          storyDebug("restart-resolved", {
            runId,
            storyId: String(storyId ?? ""),
            startingPassageId,
          });

          if (restartResponse?.passage) {
            const passages = await retryApiCall(
              () => storyService.getStoryPassages(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            );
            if (!isStorySessionActive(runId, storyId)) {
              storyDebug("restart-passages-dropped", {
                runId,
                storyId: String(storyId ?? ""),
              });
              return;
            }
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

          if (!isStorySessionActive(runId, storyId)) {
            storyDebug("progress-dropped", {
              runId,
              storyId: String(storyId ?? ""),
            });
            return;
          }

          const progressStatus = String(progress?.status ?? "").toLowerCase();
          const progressCompleted =
            progress?.is_completed === true || progressStatus === "completed";

          if (!progress) {
            const startResponse = await retryApiCall(
              () => storyService.startStory(Number(storyId)),
              DEFAULT_MAX_RETRIES,
              getRetryDelay(),
            );

            if (!isStorySessionActive(runId, storyId)) {
              storyDebug("start-response-dropped", {
                runId,
                storyId: String(storyId ?? ""),
              });
              return;
            }

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
              if (!isStorySessionActive(runId, storyId)) {
                storyDebug("start-passages-dropped", {
                  runId,
                  storyId: String(storyId ?? ""),
                });
                return;
              }
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
              try {
                initialState = await fetchPassageWithMaps(resumePassageId);
              } catch (err) {
                if (isNotFoundError(err)) {
                  await restartFromBeginning(false);
                } else {
                  throw err;
                }
              }
            } else {
              const restartResponse = await retryApiCall(
                () => storyService.restartStory(Number(storyId)),
                DEFAULT_MAX_RETRIES,
                getRetryDelay(),
              );
              if (!isStorySessionActive(runId, storyId)) {
                storyDebug("resume-restart-dropped", {
                  runId,
                  storyId: String(storyId ?? ""),
                });
                return;
              }
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
                if (!isStorySessionActive(runId, storyId)) {
                  storyDebug("resume-passages-dropped", {
                    runId,
                    storyId: String(storyId ?? ""),
                  });
                  return;
                }
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

        if (!isStorySessionActive(runId, storyId)) {
          storyDebug("initial-state-dropped", {
            runId,
            storyId: String(storyId ?? ""),
          });
          return;
        }

        if (!initialState || !initialState.passage) {
          throw new Error("Failed to fetch the initial passage.");
        }

        const normalizedState = normalizePassageState(initialState);
        storyDebug("set-engine-initial", {
          runId,
          storyId: String(storyId ?? ""),
          engineStoryId: String(normalizedState?.story?.id ?? ""),
          passageId: normalizedState?.passage?.passage_id ?? null,
        });
        setEngineState(normalizedState);
      } catch (err: any) {
        if (!isStorySessionActive(runId, storyId)) {
          storyDebug("run-error-dropped", {
            runId,
            storyId: String(storyId ?? ""),
          });
          return;
        }
        const message = extractErrorMessage(err);
        storyDebug("run-error", {
          runId,
          storyId: String(storyId ?? ""),
          message,
          status: err?.status ?? err?.response?.status ?? null,
        });
        setError(message);
      } finally {
        if (isStorySessionActive(runId, storyId)) {
          setLoading(false);
          storyDebug("run-finished", {
            runId,
            storyId: String(storyId ?? ""),
          });
        }
      }
    }

    startStoryFlow();
  }, [
    storyId,
    shouldRestart,
    clearHistory,
    clearStoryCompleted,
    isStorySessionActive,
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

      const runId = sessionRunIdRef.current;
      const isActiveChoiceSession = () => isStorySessionActive(runId, storyId);

      if (!isActiveChoiceSession()) {
        storyDebug("choice-dropped-before-start", {
          runId,
          storyId: String(storyId ?? ""),
          targetId: String(choice.target_id ?? ""),
          choiceId: String(choice.id ?? ""),
        });
        return null;
      }

      storyDebug("choice-start", {
        runId,
        storyId: String(storyId ?? ""),
        targetId: String(choice.target_id ?? ""),
        choiceId: String(choice.id ?? ""),
      });

      setLoading(true);
      setError(null);

      try {
        if (!isActiveChoiceSession()) return null;
        await hydratePassageMaps();
        if (!isActiveChoiceSession()) return null;
        const rawTargetId = String(choice.target_id).trim();
        const mappedFromPassageId = passagePkMapRef.current.get(rawTargetId);
        const mappedFromPk = passageIdMapRef.current.get(rawTargetId);
        const fallbackTargetId =
          mappedFromPassageId && mappedFromPassageId !== rawTargetId
            ? mappedFromPassageId
            : mappedFromPk && mappedFromPk !== rawTargetId
              ? mappedFromPk
              : null;
        const delayMs = getRetryDelayForSpeed(textSpeed);

        // Fire-and-forget makeChoice logging call (for FAST mode, don't wait for it)
        // This records the choice on the backend but doesn't block UI progression
        const isFastMode = textSpeed === "fast";
        const performMakeChoice = async (targetId: string) => {
          if (!isActiveChoiceSession()) return;
          storyDebug("choice-makeChoice-request", {
            runId,
            storyId: String(storyId ?? ""),
            targetId,
          });
          await retryApiCall(
            () =>
              storyService.makeChoice(storyId, String(targetId), choice.text, {
                story_id: storyId,
                choice_id: choice.id,
              }),
            DEFAULT_MAX_RETRIES,
            delayMs,
          );
        };

        const makeChoicePromise = (async () => {
          try {
            await performMakeChoice(rawTargetId);
          } catch (err) {
            if (isNotFoundError(err) && fallbackTargetId) {
              await performMakeChoice(fallbackTargetId);
            } else {
              throw err;
            }
          }
        })().catch(() => {
          // Logging shouldn't block traversal
        });

        // Don't await makeChoice in FAST mode; fetch the next passage immediately
        if (!isFastMode) {
          await makeChoicePromise;
        }

        if (!isActiveChoiceSession()) return null;

        let nextPassageState: any = null;
        try {
          nextPassageState = await retryApiCall(
            () => storyService.getPassage(Number(storyId), String(rawTargetId)),
            DEFAULT_MAX_RETRIES,
            delayMs,
          );
        } catch (firstErr) {
          if (!isActiveChoiceSession()) return null;
          // Some backends expect passage by PK; try PK if targetPassageId looks like UUID and we have a mapping
          const pk = passagePkMapRef.current.get(String(rawTargetId));
          const passageId = passageIdMapRef.current.get(String(rawTargetId));
          if (pk || passageId) {
            const fallbackId = pk || passageId;
            nextPassageState = await retryApiCall(
              () =>
                storyService.getPassage(Number(storyId), String(fallbackId)),
              DEFAULT_MAX_RETRIES,
              delayMs,
            );
          }
          if (!nextPassageState) throw firstErr;
        }

        if (!nextPassageState || !nextPassageState.passage) {
          throw new Error("Failed to load the next passage.");
        }

        if (!isActiveChoiceSession()) return null;

        // Normalize choices
        const normalizedState = normalizePassageState(nextPassageState);

        storyDebug("choice-set-engine", {
          runId,
          storyId: String(storyId ?? ""),
          engineStoryId: String(normalizedState?.story?.id ?? ""),
          passageId: normalizedState?.passage?.passage_id ?? null,
        });

        setEngineState(normalizedState);
        // Invalidate passage-choices so revisiting the same passage refetches (avoids stale filtered list)
        queryClient.invalidateQueries({
          queryKey: [...storyKeys.all, "passage-choices"],
        });
        return normalizedState;
      } catch (err: any) {
        if (!isActiveChoiceSession()) return null;
        const message = extractErrorMessage(err);
        storyDebug("choice-error", {
          runId,
          storyId: String(storyId ?? ""),
          targetId: String(choice.target_id ?? ""),
          message,
          status: err?.status ?? err?.response?.status ?? null,
        });
        setError(message);
        return null;
      } finally {
        if (isActiveChoiceSession()) {
          setLoading(false);
          storyDebug("choice-finished", {
            runId,
            storyId: String(storyId ?? ""),
            targetId: String(choice.target_id ?? ""),
          });
        }
      }
    },
    [
      storyId,
      isLoading,
      textSpeed,
      hydratePassageMaps,
      isStorySessionActive,
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
