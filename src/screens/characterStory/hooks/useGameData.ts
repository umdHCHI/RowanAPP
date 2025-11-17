import { useState } from 'react';
import { apiService } from '../../../services/apiService';

export const useGameData = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState(false);

  const loadGameData = async (loadStoriesCallback: () => Promise<void>) => {
    setIsLoadingGameData(true);
    try {
      const comprehensiveGameData = await apiService.getComprehensiveGameData();
      setGameData(comprehensiveGameData);
      await loadStoriesCallback();
    } catch (error) {
      setGameData(null);
    } finally {
      setIsLoadingGameData(false);
    }
  };

  return {
    gameData,
    isLoadingGameData,
    loadGameData,
    setGameData
  };
};