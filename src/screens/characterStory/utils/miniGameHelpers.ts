import { Alert } from 'react-native';

/**
 * ThoughtDefender game statistics type
 */
export interface ThoughtDefenderStats {
  totalGames: number;
  highScore: number;
  maxLevel: number;
  totalMissedShots: number;
  averageAccuracy: number;
  maxDynamicDifficulty: number;
  gamesWon: number;
  gamesLost: number;
}

/**
 * ThoughtDefender game completion data from modal
 */
export interface ThoughtDefenderGameData {
  score: number;
  level: number;
  won: boolean;
  difficulty: string;
  accuracy: number;
  missedShots: number;
  dynamicDifficultyMultiplier: number;
  shotsFired: number;
  hits: number;
}

/**
 * Calculate updated ThoughtDefender statistics after game completion
 * Pure function with no side effects - follows Archive utility pattern
 */
export const calculateUpdatedThoughtDefenderStats = (
  previousStats: ThoughtDefenderStats | null,
  gameData: ThoughtDefenderGameData
): ThoughtDefenderStats => {
  // First game ever played
  if (!previousStats) {
    return {
      totalGames: 1,
      highScore: gameData.score || 0,
      maxLevel: gameData.level || 1,
      totalMissedShots: gameData.missedShots || 0,
      averageAccuracy: gameData.accuracy || 0,
      maxDynamicDifficulty: gameData.dynamicDifficultyMultiplier || 1.0,
      gamesWon: gameData.won ? 1 : 0,
      gamesLost: gameData.won ? 0 : 1,
    };
  }

  // Calculate incremental stats
  const totalGames = previousStats.totalGames + 1;
  const newTotalMissed = previousStats.totalMissedShots + (gameData.missedShots || 0);
  const newAvgAccuracy = 
    ((previousStats.averageAccuracy * previousStats.totalGames) + (gameData.accuracy || 0)) / totalGames;

  return {
    totalGames,
    highScore: Math.max(previousStats.highScore, gameData.score || 0),
    maxLevel: Math.max(previousStats.maxLevel, gameData.level || 1),
    totalMissedShots: newTotalMissed,
    averageAccuracy: newAvgAccuracy,
    maxDynamicDifficulty: Math.max(
      previousStats.maxDynamicDifficulty,
      gameData.dynamicDifficultyMultiplier || 1.0
    ),
    gamesWon: previousStats.gamesWon + (gameData.won ? 1 : 0),
    gamesLost: previousStats.gamesLost + (gameData.won ? 0 : 1),
  };
};

/**
 * Show success notification for drawing completion
 * Matches Archive's RPG-themed notification style
 */
export const showDrawingSuccessAlert = () => {
  Alert.alert(
    "🎨 Creative Expression Recorded",
    "Your drawing has been added to the Archive.",
    [{ text: "Continue Creating", style: "default" }]
  );
};

/**
 * Determine if game type requires stat tracking
 */
export const requiresStatTracking = (gameType: 'thoughtDefender' | 'drawing'): boolean => {
  return gameType === 'thoughtDefender';
};