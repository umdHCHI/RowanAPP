import { useState } from 'react';
import { apiService } from '../../../services/apiService';
import { Story } from '../../../types';

interface UseStoryProgressProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
}

export const useStoryProgress = ({ stories, onSelectStory }: UseStoryProgressProps) => {
  const [storyProgress, setStoryProgress] = useState<Record<number, any>>({});
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  /**
   * Load progress records for all stories
   * Follows Archive pattern: backend progress tracking for research data
   */
  const loadStoryProgress = async (storyList: Story[]) => {
    if (!storyList || storyList.length === 0) return;

    setIsLoadingProgress(true);
    try {
      const allProgress = await apiService.getStoryProgressRecords('');

      if (allProgress && allProgress.length > 0) {
        // Create map of story ID → progress for efficient lookup
        const progressMap: Record<number, any> = {};
        allProgress.forEach((progress: any) => {
          progressMap[progress.story] = progress;
        });

        setStoryProgress(progressMap);
      } else {
        setStoryProgress({});
      }
    } catch (error) {
      setStoryProgress({});
    } finally {
      setIsLoadingProgress(false);
    }
  };

  /**
   * Handle story selection with automatic progress initialization
   * Follows Archive pattern: restart story + ensure progress record exists
   */
  const handleStorySelection = async (selectedStory: Story) => {
    try {
      // Attempt to restart story (resets state machine)
      try {
        await apiService.restartStory(selectedStory.id);
      } catch (restartError) {
        // Silently handle - story may not have been started yet
      }

      const progress = storyProgress[selectedStory.id];

      if (progress) {
        // Existing progress - continue story
        onSelectStory(selectedStory);
      } else {
        // New story - create progress record
        try {
          const newProgress = await apiService.createStoryProgress(selectedStory.id, {
            current_passage_id: selectedStory.starting_passage_id || '',
            story_variables: {}
          });

          setStoryProgress(prev => ({
            ...prev,
            [selectedStory.id]: newProgress
          }));

          onSelectStory(selectedStory);
        } catch (progressError) {
          // Fallback: open story even if progress creation fails
          onSelectStory(selectedStory);
        }
      }
    } catch (error) {
      // Last resort: just open the story
      onSelectStory(selectedStory);
    }
  };

  /**
   * Refresh progress data - useful after story completion
   */
  const refreshStoryProgress = async () => {
    try {
      await loadStoryProgress(stories);
    } catch (error) {
      // Silently handle refresh error
    }
  };

  return {
    storyProgress,
    isLoadingProgress,
    loadStoryProgress,
    refreshStoryProgress,
    handleStorySelection
  };
};
