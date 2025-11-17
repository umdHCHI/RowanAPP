import { useMemo } from 'react';
import { GameData } from '../types';

export interface ProgressionLevel {
  name: string;
  icon: string;
  current: number;
  max: number;
  progress: number; // 0-100
  color: string[];
  description: string;
  requirements: string;
}

export interface ThoughtDefenderProgression {
  masterLevel: ProgressionLevel;
  adeptLevel: ProgressionLevel;
  noviceLevel: ProgressionLevel;
  totalGames: number;
  winRate: number;
  averageAccuracy: number;
  totalSurvivalTimeSeconds: number;
  highestScore: number;
  highestLevel: number;
}

/**
 * Calculate progression levels based on Thought Defender performance
 *
 * Master Level: Based on wins, high scores, and mastery
 * Adept Level: Based on overall participation and moderate performance
 * Novice Level: Based on learning curve and improvement potential
 *
 * Note: This hook expects the backend to aggregate ThoughtDefenderRunDTO data
 * and return it in the thought_defender_stats field of GameData.
 *
 * Backend aggregation requirements:
 * - total_games: Count of all runs logged
 * - total_wins: Count of runs where result === 'win'
 * - total_losses: Count of runs where result === 'lose'
 * - highest_score: Max score across all runs
 * - highest_level: Max level reached across all runs
 * - total_waves_cleared: Sum of wavesCleared from all runs
 * - average_accuracy: Average of accuracy across all runs (0-1)
 * - total_shots_fired: Sum of shotsFired from all runs
 * - total_hits: Sum of hits from all runs
 * - total_survival_time_ms: Sum of durationMs from all runs
 * - difficulties_played: Array of unique difficulty values from runs
 */
export const useThoughtDefenderProgression = (gameData?: GameData | null): ThoughtDefenderProgression => {
  return useMemo(() => {
    const stats = gameData?.thought_defender_stats;

    // Default empty progression
    if (!stats || stats.total_games === 0) {
      return {
        masterLevel: {
          name: 'Master Level',
          icon: '🏆',
          current: 0,
          max: 12,
          progress: 0,
          color: ['#FCD34D', '#F59E0B'],
          description: 'Not yet achieved',
          requirements: 'Win games at high difficulty with excellent accuracy'
        },
        adeptLevel: {
          name: 'Adept Level',
          icon: '🔄',
          current: 0,
          max: 12,
          progress: 0,
          color: ['#06B6D4', '#0891B2'],
          description: 'Start playing to build progress',
          requirements: 'Play games and maintain decent performance'
        },
        noviceLevel: {
          name: 'Novice Level',
          icon: '⚠️',
          current: 0,
          max: 12,
          progress: 0,
          color: ['#EF4444', '#DC2626'],
          description: 'Begin your journey',
          requirements: 'Play your first games to learn the basics'
        },
        totalGames: 0,
        winRate: 0,
        averageAccuracy: 0,
        totalSurvivalTimeSeconds: 0,
        highestScore: 0,
        highestLevel: 0
      };
    }

    const {
      total_games,
      total_wins,
      total_losses,
      highest_score,
      highest_level,
      total_waves_cleared,
      average_accuracy,
      total_survival_time_ms,
      difficulties_played
    } = stats;

    const winRate = total_games > 0 ? total_wins / total_games : 0;
    const totalSurvivalTimeSeconds = Math.floor(total_survival_time_ms / 1000);
    const avgSurvivalPerGame = total_games > 0 ? totalSurvivalTimeSeconds / total_games : 0;

    // Master Level Calculation (Max 12)
    // Based on: wins (40%), high scores (30%), accuracy (20%), difficulty variety (10%)
    let masterPoints = 0;
    masterPoints += Math.min(4.8, total_wins * 0.4); // Up to 4.8 from wins (12 wins = max)
    masterPoints += Math.min(3.6, (highest_score / 1000) * 0.3); // Up to 3.6 from score (12000+ = max)
    masterPoints += Math.min(2.4, average_accuracy * 2.4); // Up to 2.4 from accuracy (100% = max)
    masterPoints += Math.min(1.2, difficulties_played.length * 0.3); // Up to 1.2 from variety (4 difficulties = max)
    const masterCurrent = Math.min(12, Math.floor(masterPoints));
    const masterProgress = Math.min(100, (masterCurrent / 12) * 100);

    // Adept Level Calculation (Max 12)
    // Based on: participation (50%), waves cleared (30%), survival time (20%)
    let adeptPoints = 0;
    adeptPoints += Math.min(6, total_games * 0.5); // Up to 6 from playing (12 games = max)
    adeptPoints += Math.min(3.6, (total_waves_cleared / 10) * 0.3); // Up to 3.6 from waves (120 waves = max)
    adeptPoints += Math.min(2.4, (avgSurvivalPerGame / 30) * 0.3); // Up to 2.4 from survival (avg 100s/game = max)
    const adeptCurrent = Math.min(12, Math.floor(adeptPoints));
    const adeptProgress = Math.min(100, (adeptCurrent / 12) * 100);

    // Novice Level Calculation (Max 12, can go negative)
    // This represents "struggle points" - lower is better, showing improvement needed
    // Based on: loss rate (50%), low accuracy (30%), quick deaths (20%)
    let novicePoints = 0;
    const lossRate = total_games > 0 ? total_losses / total_games : 0;
    novicePoints += lossRate * 6; // Up to 6 from losses (100% loss = max)
    novicePoints += (1 - average_accuracy) * 3.6; // Up to 3.6 from poor accuracy (0% = max)
    novicePoints += avgSurvivalPerGame < 30 ? 2.4 : 0; // 2.4 if dying quickly
    const noviceCurrent = Math.min(12, Math.floor(novicePoints));
    const noviceProgress = Math.min(100, (noviceCurrent / 12) * 100);

    // Generate descriptions
    const masterDescription = masterCurrent >= 10
      ? 'Maximum performance achieved!'
      : masterCurrent >= 6
        ? 'Excellent mastery demonstrated'
        : masterCurrent >= 3
          ? 'Building towards mastery'
          : 'Mastery awaits';

    const adeptDescription = adeptCurrent >= 10
      ? 'Significant foundation built!'
      : adeptCurrent >= 6
        ? 'Steady foundation building'
        : adeptCurrent >= 3
          ? 'Foundation taking shape'
          : 'Starting to build foundation';

    const noviceDescription = noviceCurrent <= 2
      ? 'Strong fundamentals established'
      : noviceCurrent <= 5
        ? 'Learning phase - keep practicing'
        : noviceCurrent <= 8
          ? 'Building understanding'
          : 'Early learning stage';

    return {
      masterLevel: {
        name: 'Master Level',
        icon: '🏆',
        current: masterCurrent,
        max: 12,
        progress: masterProgress,
        color: ['#FCD34D', '#F59E0B'],
        description: masterDescription,
        requirements: `${12 - masterCurrent} points to max (win more, score higher, improve accuracy)`
      },
      adeptLevel: {
        name: 'Adept Level',
        icon: '🔄',
        current: adeptCurrent,
        max: 12,
        progress: adeptProgress,
        color: ['#06B6D4', '#0891B2'],
        description: adeptDescription,
        requirements: `${12 - adeptCurrent} points to max (play more, clear waves, survive longer)`
      },
      noviceLevel: {
        name: 'Novice Level',
        icon: '⚠️',
        current: noviceCurrent,
        max: 12,
        progress: noviceProgress,
        color: ['#EF4444', '#DC2626'],
        description: noviceDescription,
        requirements: noviceCurrent > 0
          ? 'Reduce by improving win rate and accuracy'
          : 'Excellent - minimal struggle detected!'
      },
      totalGames: total_games,
      winRate: winRate * 100,
      averageAccuracy: average_accuracy * 100,
      totalSurvivalTimeSeconds,
      highestScore: highest_score,
      highestLevel: highest_level
    };
  }, [gameData]);
};
