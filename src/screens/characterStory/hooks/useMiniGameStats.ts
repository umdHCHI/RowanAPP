import { useState } from 'react';
import {
    ThoughtDefenderGameData,
    ThoughtDefenderStats,
    calculateUpdatedThoughtDefenderStats,
    requiresStatTracking,
    showDrawingSuccessAlert
} from '../utils/miniGameHelpers';

interface UseMiniGameStatsProps {
  archiveContext: any; // MasterStateContext archive object
}

export const useMiniGameStats = ({ archiveContext }: UseMiniGameStatsProps) => {
  const [thoughtDefenderStats, setThoughtDefenderStats] = useState<ThoughtDefenderStats | null>(null);

  /**
   * Handle mini-game completion - updates stats and shows notifications
   * Supports both ThoughtDefender (stat tracking) and Drawing (simple alert)
   */
  const handleMiniGameComplete = (
    gameType: 'thoughtDefender' | 'drawing',
    data: ThoughtDefenderGameData | any
  ) => {
    // Submit to archive context (triggers API call in MasterStateContext)
    archiveContext.handleMiniGameComplete(gameType, data);

    // Update ThoughtDefender stats after game completes
    if (gameType === 'thoughtDefender' && data && requiresStatTracking(gameType)) {
      setThoughtDefenderStats(prev => 
        calculateUpdatedThoughtDefenderStats(prev, data as ThoughtDefenderGameData)
      );
    }

    // Show drawing completion alert (ThoughtDefenderModal handles its own alerts)
    if (gameType === 'drawing') {
      showDrawingSuccessAlert();
    }
  };

  return {
    thoughtDefenderStats,
    setThoughtDefenderStats,
    handleMiniGameComplete
  };
};