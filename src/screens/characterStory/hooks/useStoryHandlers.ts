import { useState } from 'react';
import { Alert } from 'react-native';
import { Story } from '../../../types/story';

interface UseStoryHandlersProps {
  ui: any;
  archive: any;
  wellness: any;
  equipment: any;
}

export const useStoryHandlers = ({
  ui,
  archive,
  wellness,
  equipment
}: UseStoryHandlersProps) => {
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [isChapterScreenVisible, setIsChapterScreenVisible] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);

  const handleOpenStory = async (storyToOpen: Story) => {
    setSelectedStory(storyToOpen);
    
    if (storyToOpen.chapter_count && storyToOpen.chapter_count > 0) {
      setIsChapterScreenVisible(true);
    } else {
      // useStoryEngine will handle restartStory
      const storyWithoutChapter = {
        ...storyToOpen,
        chapterId: undefined,
      };
      ui.openStory(storyWithoutChapter);
    }
  };

  const handleChapterSelect = async (chapterId: number) => {
    if (!selectedStory?.id) {
      Alert.alert("Error", "No story selected. Please try again.");
      return;
    }

    setIsChapterScreenVisible(false);

    const storyWithChapterInfo = {
      ...selectedStory,
      chapterId: chapterId,
      passages: undefined,
    };
    
    ui.openStory(storyWithChapterInfo);
  };

  const handleCloseStory = () => {
    ui.closeStory();
  };

  const handleStoryCompleteLocal = async (completionData: any) => {
    archive.handleStoryComplete(completionData.storyId);
    handleCloseStory();
    
    
    // Just refresh UI data to show updated stats
    if (isRefreshingData) {
      return;
    }
    
    setIsRefreshingData(true);
    
    try {
      // Refresh data from backend to show updated values
      await wellness.loadHomeData();
      await equipment.loadBackendGear();
      
      // Update local archive state for UI display
      if (completionData?.finalRewards?.length > 0) {
        completionData.finalRewards.forEach((reward: string) => {
          archive.handleArtifactUnlock({
            name: reward,
            type: 'story_reward',
            equipped: false,
            resonance: 1,
            description: `Earned from completing story ${completionData.storyId}`,
            rarity: 'Common'
          });
        });
      }
      
      if (completionData?.skillsLearned?.length > 0) {
        archive.handleSkillLearned(completionData.skillsLearned);
      }
      
      Alert.alert(
        "🎉 Story Completed!", 
        "You have successfully completed this story and earned rewards!"
      );
    } finally {
      setIsRefreshingData(false);
    }
  };

  return {
    selectedStory,
    isChapterScreenVisible,
    isRefreshingData,
    setIsChapterScreenVisible,
    handleOpenStory,
    handleChapterSelect,
    handleCloseStory,
    handleStoryCompleteLocal
  };
};