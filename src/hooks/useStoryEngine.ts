import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

interface UseStoryEngineProps {
  storyId: string | number;
}

interface StoryState {
  story: any;
  passage: any;
  progress: any;
  chapter_title: string;
}

export const useStoryEngine = ({ storyId }: UseStoryEngineProps) => {
  const [storyState, setStoryState] = useState<StoryState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize story using new backend structure
  useEffect(() => {
    if (!storyId) return;

    const startStoryFlow = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`🚀 Resetting story: ${storyId}`);

        // STEP 1: Restart the story. This response contains the correct starting passage ID.
        const restartResponse = await apiService.restartStory(storyId);
        const startingPassageId = restartResponse.starting_passage;
        
        if (!startingPassageId) {
          throw new Error("Story restart did not provide a starting passage ID.");
        }
        
        console.log(`✅ Story restarted. Starting at passage: ${startingPassageId}`);

        // STEP 2: Fetch that specific starting passage directly.
        const initialState = await apiService.getPassage(Number(storyId), startingPassageId);
        console.log(`✅ Initial passage fetched successfully.`);
        setStoryState(initialState);

      } catch (err: any) {
        console.error('Failed to start story flow:', err);
        setError(err.message || 'Failed to load story.');
      } finally {
        setLoading(false);
      }
    };

    startStoryFlow();
  }, [storyId]);

  // Make a choice and get the next passage
  const makeChoice = useCallback(async (choice: any) => {
    if (!storyId) return null;

    setLoading(true);
    setError(null);
    
    try {
      console.log(`🎯 Making choice:`, choice.text);
      console.log('Choice object:', choice);
      
      // Extract the target passage ID from the choice
      // The backend provides target_id, not target_passage_id
      const targetPassageId = choice.target_id || 
                             choice.target_passage_id || 
                             choice.next_passage_info?.passage_id || 
                             choice.next_passage_id || 
                             choice.next;

      if (!targetPassageId) {
        throw new Error('No target passage ID found in choice');
      }

      console.log(`🎯 Target passage ID: ${targetPassageId}`);
      
      // Since the backend doesn't have a make_choice endpoint, 
      // we'll directly fetch the target passage
      console.log('Backend has no make_choice endpoint, fetching target passage directly');
      const passageResult = await apiService.getPassage(Number(storyId), targetPassageId);
      console.log('✅ Target passage fetched successfully:', passageResult);
      
      // Update the story state with the new passage
      if (passageResult) {
        setStoryState(passageResult);
      }
      
      // Return the passage data in the format expected by StoryScreen
      return passageResult?.passage || passageResult || null;
    } catch (err: any) {
      console.error('Failed to make choice:', err);
      setError(err.message || 'Failed to make choice.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  // Get current passage (useful for tap-to-continue)
  const getCurrentPassage = useCallback(async () => {
    if (!storyId) return null;

    setLoading(true);
    setError(null);
    
    try {
      console.log(`📖 Getting current passage for story: ${storyId}`);
      
      const currentPassage = await apiService.getCurrentPassage(storyId);
      console.log('✅ Current passage fetched:', currentPassage);
      
      if (currentPassage) {
        setStoryState(currentPassage);
      }
      
      return currentPassage;
    } catch (err: any) {
      console.error('Failed to get current passage:', err);
      setError(err.message || 'Failed to get current passage.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  // Manual restart method
  const restartStory = useCallback(async () => {
    if (!storyId) return null;

    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Manually restarting story: ${storyId}`);
      
      const restartResponse = await apiService.restartStory(storyId);
      const startingPassageId = restartResponse.starting_passage;
      
      if (!startingPassageId) {
        throw new Error("Story restart did not provide a starting passage ID.");
      }
      
      console.log('✅ Story restarted successfully');
      
      // Fetch the specific starting passage directly
      const newState = await apiService.getPassage(Number(storyId), startingPassageId);
      console.log('✅ New passage fetched after restart:', newState);
      
      if (newState) {
        setStoryState(newState);
      }
      
      return newState;
    } catch (err: any) {
      console.error('Failed to restart story:', err);
      setError(err.message || 'Failed to restart story.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  // Check if story is completed
  const isStoryCompleted = storyState?.progress?.is_completed || false;

  // Get current passage data
  const currentPassage = storyState?.passage || null;

  // Get available choices
  const availableChoices = currentPassage?.choices || [];

  // Get progress information
  const progress = storyState?.progress || {
    passages_visited: [],
    is_completed: false,
    progress_percentage: 0
  };

  return {
    // State
    storyState,
    currentPassage,
    availableChoices,
    progress,
    loading,
    error,
    isInitialized: !!storyState,
    isStoryCompleted,

    // Actions
    makeChoice,
    getCurrentPassage,
    restartStory,

    // Utils
    hasChoices: availableChoices.length > 0,
    canContinue: !isStoryCompleted && availableChoices.length === 0,
    isNarration: currentPassage?.passage_type === 'narration'
  };
}; 