import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useMasterState } from '../context/MasterStateContext';
import { usePersonality } from '../context/PersonalityContext';
import { apiService } from '../services/apiService';
import { getResearchCondition } from '../utils/researchCondition';

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

  const masterState = useMasterState();
  const { auth, character, wellness } = masterState;
  const { primaryTrait, isLoading: personalityLoading } = usePersonality();

  // Determine research condition using the utility function
  // Pass the full masterState so it can find the profile data
  const researchCondition = getResearchCondition(masterState);

  console.log('🔍 useStoryEngine initialized:', {
    storyId,
    chapterId,
    researchCondition,
    primaryTrait,
    personalityLoading,
    hasAuth: !!auth?.user
  });

  useEffect(() => {
    if (!storyId) {
      setLoading(false);
      return;
    }

    // Wait for personality data to load if user is in personality condition
    if (researchCondition === "personality" && personalityLoading) {
      console.log('⏳ Waiting for personality data to load...');
      return;
    }

    const startStoryFlow = async () => {
      setLoading(true);
      setError(null);
      setStoryState(null);

      try {
        // Check if user is allowed to access this story based on research condition
        console.log('🔍 useStoryEngine: Checking story access', {
          storyId,
          researchCondition,
          primaryTrait
        });

        let allowedStories: any[] = [];
        try {
          if (researchCondition === "personality" && primaryTrait) {
            console.log('📊 Fetching stories for personality:', primaryTrait);
            allowedStories = await apiService.getStoriesByPersonality(primaryTrait, true);
          } else {
            console.log('📚 Fetching all available stories for character user');
            allowedStories = await apiService.getAvailableStories();
          }

          console.log('✅ Allowed stories fetched:', allowedStories.length, 'stories');
          console.log('📋 Story IDs:', allowedStories.map(s => s.id));

          const allowedStoryIds = allowedStories.map(s => s.id);
          const hasAccess = allowedStoryIds.includes(Number(storyId));

          console.log('🔐 Access check:', {
            requestedStoryId: storyId,
            hasAccess,
            allowedStoryIds
          });

          // TEMPORARY: Disable 403 check while debugging
          if (!hasAccess && allowedStories.length > 0) {
            console.warn('⚠️ TEMPORARY: Access check disabled - allowing story access anyway');
            // throw new Error("You do not have access to this story (403 Forbidden).");
          }

          // If no stories were returned at all, skip the check (might be loading issue)
          if (allowedStories.length === 0) {
            console.warn('⚠️ No allowed stories returned - skipping access check');
          }
        } catch (accessError: any) {
          console.error('❌ Error checking story access:', accessError);
          // Don't block story access if the access check itself fails
          // This prevents blocking users due to API errors
          if (accessError.message?.includes('403 Forbidden')) {
            throw accessError; // Re-throw 403 errors
          }
          console.warn('⚠️ Skipping access check due to error');
        }

        // Always use restartStory to get the proper starting passage ID
        console.log('📡 Calling apiService.restartStory with:', { storyId, chapterId });
        const restartResponse = await retryApiCall(
          () => apiService.restartStory(storyId, chapterId),
          3,
          Platform.OS === 'web' ? 500 : 1000
        );
        console.log('✅ restartStory response:', restartResponse);

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
        console.error('❌ Story loading error:', {
          error: err,
          status: err?.response?.status,
          data: err?.response?.data,
          message: err?.message,
          storyId,
          chapterId
        });

        let errorMessage = 'Failed to load story.';
        if (err?.response?.status === 403) {
          // Check if it's a "story already completed" error
          if (err?.response?.data?.error === 'Story restart not allowed') {
            errorMessage = err?.response?.data?.message || 'This story has already been completed and cannot be replayed.';
          } else {
            errorMessage = 'You do not have permission to access this story.';
          }
        } else if (err.message) {
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
  }, [storyId, chapterId, auth.authToken, researchCondition, primaryTrait, personalityLoading]);

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