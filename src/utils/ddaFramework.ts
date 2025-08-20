/**
 * Dynamic Difficulty Adjustment (DDA) Framework
 * Based on research by Sepulveda et al., 2019
 * 
 * This framework implements three approaches:
 * 1. Time-based DDA (Difficulty = N-Z/D)
 * 2. Reference Player's Difficulty (RPD)
 * 3. Performance vs Expected Performance
 */

export interface PlayerPerformance {
  // N: Performance measure (count of times to repeat) for current user
  actionCount: number;
  // D: Time duration for current user to perform their action
  duration: number; // in milliseconds
  // Score achieved
  score: number;
  // Level reached
  level: number;
  // Whether the player won
  won: boolean;
  // Accuracy percentage
  accuracy: number;
  // Survival time in seconds
  survivalTime: number;
}

export interface BaselinePerformance {
  // Z: Baseline performance measure for reference player
  baselineActionCount: number;
  // Baseline duration
  baselineDuration: number;
  // Best score for first level (for RPD calculation)
  bestFirstLevelScore: number;
  // Expected performance at time t
  expectedPerformance: number;
}

export interface DDAResult {
  difficulty: number; // 0 to 1
  ease: number; // 0 to 1
  rpd: number; // Reference Player's Difficulty
  performanceRatio: number; // Current vs Expected performance
  recommendedAdjustment: 'increase' | 'decrease' | 'maintain';
  adjustmentReason: string;
}

export interface DDAConfig {
  // Minimum and maximum difficulty bounds
  minDifficulty: number;
  maxDifficulty: number;
  // Target ease level (optimal challenge)
  targetEase: number;
  // How much to adjust difficulty per calculation
  adjustmentStep: number;
  // Whether to use RPD for adjustments
  useRPD: boolean;
  // Whether to use performance ratio for adjustments
  usePerformanceRatio: boolean;
}

/**
 * Calculate difficulty using the time-based DDA formula
 * Difficulty = (N - Z) / D
 * where:
 * - N = current player's action count
 * - Z = baseline action count
 * - D = current player's duration
 */
export function calculateTimeBasedDifficulty(
  currentPerformance: PlayerPerformance,
  baseline: BaselinePerformance
): number {
  const { actionCount, duration } = currentPerformance;
  const { baselineActionCount, baselineDuration } = baseline;
  
  // Ensure duration is not zero to avoid division by zero
  if (duration <= 0) return 0;
  
  // Calculate difficulty using the formula
  const difficulty = (actionCount - baselineActionCount) / duration;
  
  // Normalize to 0-1 range
  return Math.max(0, Math.min(1, difficulty));
}

/**
 * Calculate ease level
 * Ease = 1 - Difficulty
 */
export function calculateEase(difficulty: number): number {
  return 1 - difficulty;
}

/**
 * Calculate Reference Player's Difficulty (RPD)
 * RPD = (S1 - S2) / S1
 * where:
 * - S1 = best score for first level
 * - S2 = user's score for first level
 */
export function calculateRPD(
  currentScore: number,
  bestFirstLevelScore: number
): number {
  if (bestFirstLevelScore <= 0) return 0;
  
  const rpd = (bestFirstLevelScore - currentScore) / bestFirstLevelScore;
  return Math.max(0, Math.min(1, rpd));
}

/**
 * Calculate performance ratio
 * Performance = Current Performance / Expected Performance
 */
export function calculatePerformanceRatio(
  currentPerformance: PlayerPerformance,
  expectedPerformance: number
): number {
  if (expectedPerformance <= 0) return 1;
  
  // Calculate a composite performance score
  const currentScore = (currentPerformance.score * 0.4) + 
                      (currentPerformance.level * 0.3) + 
                      (currentPerformance.accuracy * 0.2) + 
                      (currentPerformance.survivalTime * 0.1);
  
  return currentScore / expectedPerformance;
}

/**
 * Main DDA calculation function that combines all approaches
 */
export function calculateDDA(
  currentPerformance: PlayerPerformance,
  baseline: BaselinePerformance,
  config: DDAConfig = getDefaultDDAConfig()
): DDAResult {
  // Calculate time-based difficulty
  const difficulty = calculateTimeBasedDifficulty(currentPerformance, baseline);
  const ease = calculateEase(difficulty);
  
  // Calculate RPD
  const rpd = calculateRPD(currentPerformance.score, baseline.bestFirstLevelScore);
  
  // Calculate performance ratio
  const performanceRatio = calculatePerformanceRatio(currentPerformance, baseline.expectedPerformance);
  
  // Determine recommended adjustment
  let recommendedAdjustment: 'increase' | 'decrease' | 'maintain' = 'maintain';
  let adjustmentReason = 'Optimal challenge level maintained';
  
  // Use RPD for adjustment if enabled
  if (config.useRPD) {
    if (rpd >= 0.5) {
      recommendedAdjustment = 'decrease';
      adjustmentReason = `RPD (${rpd.toFixed(2)}) >= 0.5 - decreasing difficulty to increase engagement`;
    } else {
      recommendedAdjustment = 'increase';
      adjustmentReason = `RPD (${rpd.toFixed(2)}) < 0.5 - increasing difficulty for better challenge`;
    }
  }
  
  // Use performance ratio for adjustment if enabled
  if (config.usePerformanceRatio) {
    if (performanceRatio < 0.8) {
      recommendedAdjustment = 'decrease';
      adjustmentReason = `Performance ratio (${performanceRatio.toFixed(2)}) < 0.8 - decreasing difficulty`;
    } else if (performanceRatio > 1.2) {
      recommendedAdjustment = 'increase';
      adjustmentReason = `Performance ratio (${performanceRatio.toFixed(2)}) > 1.2 - increasing difficulty`;
    } else {
      recommendedAdjustment = 'maintain';
      adjustmentReason = `Performance ratio (${performanceRatio.toFixed(2)}) optimal - maintaining difficulty`;
    }
  }
  
  // Use ease level for adjustment if neither RPD nor performance ratio is enabled
  if (!config.useRPD && !config.usePerformanceRatio) {
    if (ease < config.targetEase - 0.1) {
      recommendedAdjustment = 'decrease';
      adjustmentReason = `Ease (${ease.toFixed(2)}) below target (${config.targetEase}) - decreasing difficulty`;
    } else if (ease > config.targetEase + 0.1) {
      recommendedAdjustment = 'increase';
      adjustmentReason = `Ease (${ease.toFixed(2)}) above target (${config.targetEase}) - increasing difficulty`;
    } else {
      recommendedAdjustment = 'maintain';
      adjustmentReason = `Ease (${ease.toFixed(2)}) at optimal level (${config.targetEase})`;
    }
  }
  
  return {
    difficulty,
    ease,
    rpd,
    performanceRatio,
    recommendedAdjustment,
    adjustmentReason
  };
}

/**
 * Get default DDA configuration
 */
export function getDefaultDDAConfig(): DDAConfig {
  return {
    minDifficulty: 0.1,
    maxDifficulty: 0.9,
    targetEase: 0.5, // Optimal challenge level
    adjustmentStep: 0.1,
    useRPD: true,
    usePerformanceRatio: true
  };
}

/**
 * Apply DDA adjustment to game difficulty parameters
 */
export function applyDDAAdjustment(
  currentDifficulty: string,
  ddaResult: DDAResult,
  config: DDAConfig = getDefaultDDAConfig()
): string {
  const difficultyLevels = ['zen', 'normal', 'intense', 'nightmare'];
  const currentIndex = difficultyLevels.indexOf(currentDifficulty);
  
  if (currentIndex === -1) return currentDifficulty;
  
  let newIndex = currentIndex;
  
  switch (ddaResult.recommendedAdjustment) {
    case 'decrease':
      newIndex = Math.max(0, currentIndex - 1);
      break;
    case 'increase':
      newIndex = Math.min(difficultyLevels.length - 1, currentIndex + 1);
      break;
    case 'maintain':
    default:
      newIndex = currentIndex;
      break;
  }
  
  return difficultyLevels[newIndex];
}

/**
 * Create baseline performance from first game session
 */
export function createBaselineFromFirstGame(
  firstGamePerformance: PlayerPerformance
): BaselinePerformance {
  return {
    baselineActionCount: firstGamePerformance.actionCount,
    baselineDuration: firstGamePerformance.duration,
    bestFirstLevelScore: firstGamePerformance.score,
    expectedPerformance: (firstGamePerformance.score * 0.4) + 
                        (firstGamePerformance.level * 0.3) + 
                        (firstGamePerformance.accuracy * 0.2) + 
                        (firstGamePerformance.survivalTime * 0.1)
  };
}

/**
 * Update baseline performance based on new data
 */
export function updateBaselinePerformance(
  currentBaseline: BaselinePerformance,
  newPerformance: PlayerPerformance,
  learningRate: number = 0.1
): BaselinePerformance {
  return {
    baselineActionCount: currentBaseline.baselineActionCount * (1 - learningRate) + 
                        newPerformance.actionCount * learningRate,
    baselineDuration: currentBaseline.baselineDuration * (1 - learningRate) + 
                     newPerformance.duration * learningRate,
    bestFirstLevelScore: Math.max(currentBaseline.bestFirstLevelScore, newPerformance.score),
    expectedPerformance: currentBaseline.expectedPerformance * (1 - learningRate) + 
                        ((newPerformance.score * 0.4) + 
                         (newPerformance.level * 0.3) + 
                         (newPerformance.accuracy * 0.2) + 
                         (newPerformance.survivalTime * 0.1)) * learningRate
  };
}

/**
 * Calculate adaptive difficulty modifiers based on DDA result
 */
export function calculateAdaptiveModifiers(
  baseModifiers: any,
  ddaResult: DDAResult,
  config: DDAConfig = getDefaultDDAConfig()
): any {
  const adjustmentFactor = ddaResult.recommendedAdjustment === 'increase' ? 1.2 :
                          ddaResult.recommendedAdjustment === 'decrease' ? 0.8 : 1.0;
  
  return {
    thoughtSpeed: baseModifiers.thoughtSpeed * adjustmentFactor,
    spawnRate: baseModifiers.spawnRate * (1 / adjustmentFactor), // Inverse relationship
    negativeThoughtChance: Math.min(0.9, baseModifiers.negativeThoughtChance * adjustmentFactor),
    powerUpChance: Math.max(0.1, baseModifiers.powerUpChance * (1 / adjustmentFactor)),
    scoreMultiplier: baseModifiers.scoreMultiplier,
    livesStart: Math.max(1, Math.round(baseModifiers.livesStart * (1 / adjustmentFactor))),
    waveTarget: Math.round(baseModifiers.waveTarget * adjustmentFactor),
    levelScaling: baseModifiers.levelScaling,
    maxLevels: baseModifiers.maxLevels
  };
} 