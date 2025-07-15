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

      console.log('🎯 Target passage ID:', targetPassageId);

      // Get the next passage directly
      const nextPassage = await apiService.getPassage(Number(storyId), targetPassageId);
      
      if (!nextPassage) {
        throw new Error('Failed to get next passage');
      }

      console.log('✅ Next passage loaded:', nextPassage);

      // Try to update progress, but don't fail if it doesn't work
      try {
        const currentProgress = await apiService.getStoryProgress(storyId);
        if (currentProgress) {
          console.log('Current progress before choice:', currentProgress);
          
          // Get the current passage ID from the current passage
          const currentPassageId = currentPassage?.passage?.passage_id;
          console.log('Current passage ID:', currentPassageId);
          console.log('Target passage ID:', targetPassageId);
          
          // Build the updated passages_visited array
          const currentPassagesVisited = currentProgress.passages_visited || [];
          const updatedPassagesVisited = [...currentPassagesVisited];
          
          // Add current passage if not already in the list
          if (currentPassageId && !updatedPassagesVisited.includes(currentPassageId)) {
            updatedPassagesVisited.push(currentPassageId);
            console.log('Added current passage to visited:', currentPassageId);
          }
          
          // Add target passage if not already in the list
          if (!updatedPassagesVisited.includes(targetPassageId)) {
            updatedPassagesVisited.push(targetPassageId);
            console.log('Added target passage to visited:', targetPassageId);
          }
          
          // Update progress with new passage and choice
          const updateData = {
            current_passage_id: targetPassageId,
            passages_visited: updatedPassagesVisited,
            choices_made: [...(currentProgress.choices_made || []), {
              choice_id: choice.id,
              choice_text: choice.text,
              timestamp: new Date().toISOString()
            }],
            is_completed: false,
            completion_type: ''
          };
          
          console.log('Updating progress with choice data:', updateData);
          const updateResult = await apiService.updateStoryProgress(currentProgress.id, updateData);
          console.log('Progress update result:', updateResult);
          
          // Calculate and log progress percentage
          const progressCalculation = await apiService.calculateAndUpdateProgress(storyId, currentProgress.id);
          if (progressCalculation) {
            console.log('Progress calculation result:', progressCalculation);
            console.log(`Story progress: ${updatedPassagesVisited.length} passages visited`);
          }
        }
      } catch (progressError) {
        console.warn('Progress tracking failed, but story continues:', progressError);
        // Don't throw - story should continue even if progress tracking fails
      }

      setStoryState(nextPassage);
      setLoading(false);
      return nextPassage;
    } catch (error) {
      console.error('Failed to make choice:', error);
      setError(error instanceof Error ? error.message : 'Failed to make choice');
      setLoading(false);
      return null;
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
        // Try to update progress, but don't fail if it doesn't work
        try {
          const currentProgress = await apiService.getStoryProgress(storyId);
          if (currentProgress && currentPassage.passage) {
            const passageId = currentPassage.passage.passage_id;
            console.log('Current passage ID for progress tracking:', passageId);
            
            const updatedPassagesVisited = [...(currentProgress.passages_visited || [])];
            
            // Only add if not already in the list
            if (!updatedPassagesVisited.includes(passageId)) {
              updatedPassagesVisited.push(passageId);
              console.log('Added passage to visited list:', passageId);
              
              const updateData = {
                current_passage_id: passageId,
                passages_visited: updatedPassagesVisited
              };
              
              console.log('Updating progress with passage visit:', updateData);
              const updateResult = await apiService.updateStoryProgress(currentProgress.id, updateData);
              console.log('Passage visit update result:', updateResult);
              
              // Calculate and update progress percentage
              const progressCalculation = await apiService.calculateAndUpdateProgress(storyId, currentProgress.id);
              if (progressCalculation) {
                console.log('Progress calculation after passage visit:', progressCalculation);
              }
            } else {
              console.log('Passage already visited:', passageId);
            }
          }
        } catch (progressError) {
          console.warn('Progress tracking failed, but story continues:', progressError);
          // Don't throw - story should continue even if progress tracking fails
        }
        
        setStoryState(currentPassage);
        setLoading(false);
        return currentPassage;
      }
      
      setLoading(false);
      return null;
    } catch (error) {
      console.error('Failed to get current passage:', error);
      setError(error instanceof Error ? error.message : 'Failed to get current passage');
      setLoading(false);
      return null;
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