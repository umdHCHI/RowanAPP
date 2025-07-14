import { useCallback, useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

interface UseSimplifiedStoryLoaderProps {
  storyId: string;
  chapterId?: number;
}

export const useSimplifiedStoryLoader = ({ storyId, chapterId }: UseSimplifiedStoryLoaderProps) => {
  const [storyData, setStoryData] = useState<any>(null);
  const [currentPassage, setCurrentPassage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize story using new backend structure
  useEffect(() => {
    const initializeStory = async () => {
      if (!storyId || isInitialized) return;

      setLoading(true);
      setError(null);

      try {
        console.log('🎬 Starting story using new backend:', storyId);

        // Start the story first
        const startResult = await apiService.startNewStory(parseInt(storyId));
        console.log('✅ Story started:', startResult);

        // Get the current passage
        const currentPassageResult = await apiService.getCurrentPassage(parseInt(storyId));
        console.log('✅ Current passage loaded:', currentPassageResult);

        if (!currentPassageResult) {
          throw new Error('Failed to load current passage');
        }

        // Set the current passage
        setCurrentPassage(currentPassageResult.passage || currentPassageResult);
        setStoryData({
          id: storyId,
          currentPassage: currentPassageResult.passage || currentPassageResult
        });

        setIsInitialized(true);
      } catch (err: any) {
        console.error('❌ Failed to initialize story:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeStory();
  }, [storyId, chapterId, isInitialized]);

  // Navigate to a specific passage using your existing getPassage method
  const navigateToPassage = useCallback(async (passageId: string): Promise<void> => {
    if (!storyData) return;

    try {
      setLoading(true);
      console.log(`📄 Navigating to passage: ${passageId}`);

      // Use your existing getPassage method
      const passage = await apiService.getPassage(parseInt(storyId), passageId);
      
      if (passage) {
        setCurrentPassage(passage);
        console.log(`✅ Navigated to: ${passageId}`);
      } else {
        throw new Error(`Passage not found: ${passageId}`);
      }
    } catch (error: any) {
      console.error('Navigation failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [storyData, storyId]);

  // Handle choice selection using new backend structure
  const handleChoice = useCallback(async (choice: any): Promise<void> => {
    if (!storyData || !currentPassage) return;

    try {
      console.log('🎯 Handling choice:', choice.text);
      console.log('Choice object:', choice);

      // Extract the target passage ID from the choice
      // The backend provides target_id, not target_passage_id
      const targetPassageId = choice.target_id || 
                             choice.target_passage_id || 
                             choice.next_passage_info?.passage_id || 
                             choice.next_passage_id || 
                             choice.next;

      if (!targetPassageId) {
        console.error('No target passage ID found in choice:', choice);
        setError('Invalid choice - no target passage found');
        return;
      }

      console.log('🎯 Target passage ID:', targetPassageId);

      // Use the getPassage endpoint since the backend doesn't have a make_choice endpoint
      try {
        console.log('Backend has no make_choice endpoint, fetching target passage directly');
        const passageResult = await apiService.getPassage(parseInt(storyId), targetPassageId);
        console.log('Target passage result:', passageResult);
        
        // Check if story is completed
        if (passageResult?.progress?.is_completed) {
          console.log('🏁 Story completed!');
          setCurrentPassage({
            ...currentPassage,
            content: 'Story Complete! 🎉',
            choices: []
          });
          return;
        }
        
        // If the backend returns the next passage, use it
        if (passageResult?.passage) {
          console.log('Backend returned next passage:', passageResult.passage);
          setCurrentPassage(passageResult.passage);
          return; // Exit early since backend handled navigation
        }

        // If no passage returned, try to get the current passage
        console.log('No passage in result, getting current passage');
        const currentPassageResult = await apiService.getCurrentPassage(parseInt(storyId));
        if (currentPassageResult?.passage) {
          setCurrentPassage(currentPassageResult.passage);
        }
      } catch (error) {
        console.warn('Backend choice failed:', error);
        setError('Failed to make choice. Please try again.');
      }
    } catch (error: any) {
      console.error('Choice handling failed:', error);
      setError(error.message);
    }
  }, [storyData, currentPassage, storyId]);

  // Get next passage for tap-to-continue
  const getNextPassage = useCallback((): string | null => {
    if (!storyData?.passages || !currentPassage) return null;

    const currentIndex = storyData.passages.findIndex(
      (p: any) => p.passage_id === currentPassage.passage_id
    );
    
    if (currentIndex === -1 || currentIndex >= storyData.passages.length - 1) {
      return null;
    }
    
    return storyData.passages[currentIndex + 1]?.passage_id || null;
  }, [storyData, currentPassage]);

  // Handle tap-to-continue for narration passages
  const handleTapToContinue = useCallback(async (): Promise<void> => {
    const nextPassageId = getNextPassage();
    if (nextPassageId) {
      await navigateToPassage(nextPassageId);
    }
  }, [getNextPassage, navigateToPassage]);

  // Calculate progress
  const progress = {
    current: storyData?.passages ? 
      storyData.passages.findIndex((p: any) => p.passage_id === currentPassage?.passage_id) + 1 : 0,
    total: storyData?.passages?.length || 0,
    percentage: storyData?.passages ? 
      Math.round(((storyData.passages.findIndex((p: any) => p.passage_id === currentPassage?.passage_id) + 1) / storyData.passages.length) * 100) : 0
  };

  return {
    // Data
    storyData,
    currentPassage,
    loading,
    error,
    isInitialized,
    progress,

    // Actions
    navigateToPassage,
    handleChoice,
    handleTapToContinue,

    // Utils
    hasChoices: currentPassage?.choices?.length > 0,
    canContinue: !!getNextPassage(),
    isComplete: !getNextPassage() && (!currentPassage?.choices || currentPassage.choices.length === 0),
    isNarration: currentPassage?.passage_type === 'narration' || currentPassage?.passageType === 'narration'
  };
};
