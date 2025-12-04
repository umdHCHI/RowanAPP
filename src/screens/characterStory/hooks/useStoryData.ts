import { useState } from 'react';
import { apiService } from '../../../services/apiService';

export const useStoryData = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);

  const loadStories = async () => {
    setIsLoadingStories(true);
    try {
      const backendStories = await apiService.getCharacterStories();
      const allProgressRecords = await apiService.getStoryProgressRecords('');
      const progressMap = new Map(allProgressRecords.map((p: any) => [p.story, p]));

      const storiesWithProgress = backendStories.map((story: any) => {
        const progress = progressMap.get(story.id);
        return {
          ...story,
          exploration: progress?.progress_percentage || 0,
          revelations: progress?.choices_made_count || 0,
          backgroundImage: story.id === 12 || story.id === '12' || story.title?.toLowerCase().includes('introduction') 
            ? require('../../../../assets/UI/backgrounds/forest.png')
            : require('../../../../assets/UI/backgrounds/hauntedlibrary.png')
        };
      });

      setStories(storiesWithProgress);
      
    } catch (error) {
      setStories([]);
    } finally {
      setIsLoadingStories(false);
    }
  };

  return {
    stories,
    isLoadingStories,
    loadStories,
    setStories
  };
};