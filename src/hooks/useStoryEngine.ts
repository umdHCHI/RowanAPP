import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { apiService } from '../services/apiService';

interface Passage {
  passage_id: string;
  content: string;
  passage_type: 'narration' | 'dialogue' | 'decision' | 'ending';
  choices: Choice[];
}

interface Choice {
  id: number;
  text: string;
  target_id: string;
}

interface StoryState {
  story: any;
  passage: Passage;
  progress: any;
  chapter_title: string;
  chapter_number?: number;
}

interface UseStoryEngineProps {
  storyId: string | number;
  chapterId?: number;
}

const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

export const useStoryEngine = ({ storyId, chapterId }: UseStoryEngineProps) => {
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    const startStoryFlow = async () => {
      setLoading(true);
      setError(null);
      setStoryState(null);

      try {
        let startingPassageId: string;
        let chapterTitle: string | undefined;
        let chapterNumber: number | undefined;

        // Special handling: Introduction story (ID 12) should use standard restart
        const isIntroductionStory = Number(storyId) === 12;

        if (chapterId && !isIntroductionStory) {
          // For chapters (except Introduction), fetch the chapter's passages and find the first one by order

          // First, get chapter info
          const chapters = await retryApiCall(
            () => apiService.getChapters(storyId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );

          const currentChapter = chapters.find((ch: any) => ch.id === chapterId);
          if (!currentChapter) {
            throw new Error(`Chapter ${chapterId} not found for story ${storyId}`);
          }

          chapterTitle = currentChapter.title;
          chapterNumber = currentChapter.chapter_number;

          // Get all passages for this chapter
          const chapterPassages = await retryApiCall(
            () => apiService.getChapterPassages(storyId, chapterId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );

          if (!chapterPassages || chapterPassages.length === 0) {
            throw new Error(`No passages found for chapter ${chapterId}`);
          }

          // Find the first passage by order (lowest order number)
          const firstPassage = chapterPassages
            .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))[0];

          if (!firstPassage || !firstPassage.passage_id) {
            throw new Error(`No valid starting passage found for chapter ${chapterId}`);
          }

          startingPassageId = firstPassage.passage_id;

          // Also call restartChapter to initialize progress
          try {
            await retryApiCall(
              () => apiService.restartChapter(storyId, chapterId),
              3,
              Platform.OS === 'web' ? 500 : 1000
            );
          } catch (restartError) {
            // Non-critical - silently continue
          }
        } else if (chapterId && isIntroductionStory) {
          // For Introduction story with chapters, use restartChapter
          const restartResponse = await retryApiCall(
            () => apiService.restartChapter(storyId, chapterId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );

          startingPassageId = restartResponse.starting_passage;
          if (!startingPassageId) {
            throw new Error("Chapter restart did not provide a starting passage ID.");
          }

          // Fetch chapter info
          const chapters = await retryApiCall(
            () => apiService.getChapters(storyId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );

          const currentChapter = chapters.find((ch: any) => ch.id === chapterId);
          if (currentChapter) {
            chapterTitle = currentChapter.title;
            chapterNumber = currentChapter.chapter_number;
          }
        } else {
          // For stories without chapters, use the standard restart flow
          const restartResponse = await retryApiCall(
            () => apiService.restartStory(storyId),
            3,
            Platform.OS === 'web' ? 500 : 1000
          );

          startingPassageId = restartResponse.starting_passage;
          if (!startingPassageId) {
            throw new Error("Story restart did not provide a starting passage ID.");
          }
        }

        // Fetch the starting passage using the ID
        const initialState = await retryApiCall(
          () => apiService.getPassage(Number(storyId), startingPassageId),
          3,
          Platform.OS === 'web' ? 500 : 1000
        );

        if (!initialState || !initialState.passage) {
          throw new Error("Failed to fetch the initial passage.");
        }

        // Override chapter info if we have it
        if (chapterTitle !== undefined) {
          initialState.chapter_title = chapterTitle;
        }
        if (chapterNumber !== undefined) {
          initialState.chapter_number = chapterNumber;
        }

        setStoryState(initialState);

      } catch (err: any) {
        let errorMessage = 'Failed to load story.';

        if (err.message) {
          errorMessage = err.message;
        } else if (err.response) {
          errorMessage = `Network error: ${err.response.status} - ${err.response.statusText}`;
        } else if (err.request) {
          errorMessage = 'Network request failed. Please check your connection.';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    startStoryFlow();
  }, [storyId, chapterId]);

  const makeChoice = useCallback(async (choice: Choice) => {
    if (loading || !storyId || !choice?.target_id) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const nextState = await retryApiCall(
        () => apiService.makeChoice(storyId, choice.target_id),
        3,
        Platform.OS === 'web' ? 500 : 1000
      );

      if (!nextState || !nextState.passage) {
        throw new Error(`Failed to fetch passage for choice target: ${choice.target_id}`);
      }

      const currentChapterTitle = storyState?.chapter_title;
      const currentChapterNumber = storyState?.chapter_number;

      const updatedState = {
        ...nextState,
        chapter_title: nextState.chapter_title || currentChapterTitle,
        chapter_number: nextState.chapter_number || currentChapterNumber,
      };

      setStoryState(updatedState);
      return updatedState;

    } catch (err: any) {
      let errorMessage = 'Failed to process choice.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response) {
        errorMessage = `Network error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Network request failed. Please check your connection.';
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId, loading, storyState]);

  const currentPassage = storyState?.passage || null;
  const availableChoices = currentPassage?.choices || [];
  
  const isNarration = currentPassage?.passage_type === 'narration' || currentPassage?.passage_type === 'dialogue';
  const isDecision = currentPassage?.passage_type === 'decision';
  const isEnding = currentPassage?.passage_type === 'ending';
  const hasMultipleChoices = availableChoices.length > 1;
  const hasChoices = availableChoices.length > 0;

  return {
    loading,
    error,
    currentPassage,
    chapterTitle: storyState?.chapter_title || null,
    chapterNumber: storyState?.chapter_number || null,
    makeChoice,
    isInitialized: !!storyState,
    isEnding,
    hasMultipleChoices,
    hasChoices,
    isDecision,
    availableChoices,
  };
};
