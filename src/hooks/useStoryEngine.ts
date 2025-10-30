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
        // Always use restartStory to get the proper starting passage ID
        const restartResponse = await retryApiCall(
          () => apiService.restartStory(storyId, chapterId),
          3,
          Platform.OS === 'web' ? 500 : 1000
        );

        const startingPassageId = restartResponse.starting_passage;
        if (!startingPassageId) {
          throw new Error("Story restart did not provide a starting passage ID.");
        }

        // Fetch the starting passage state
        const initialState = await retryApiCall(
          () => apiService.getPassage(Number(storyId), startingPassageId),
          3,
          Platform.OS === 'web' ? 500 : 1000
        );

        if (!initialState) {
          throw new Error("Failed to fetch the initial passage.");
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