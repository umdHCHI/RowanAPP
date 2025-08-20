import { useCallback, useEffect, useState } from 'react';
import { AsyncStorage } from '../imports';
import {
  BaselinePerformance,
  DDAConfig,
  DDAResult,
  PlayerPerformance,
  applyDDAAdjustment,
  calculateAdaptiveModifiers,
  calculateDDA,
  createBaselineFromFirstGame,
  getDefaultDDAConfig,
  updateBaselinePerformance
} from '../utils/ddaFramework';

const DDA_STORAGE_KEY = 'thoughtDefender_dda_baseline';
const DDA_CONFIG_KEY = 'thoughtDefender_dda_config';

export interface DDAState {
  baseline: BaselinePerformance | null;
  config: DDAConfig;
  lastResult: DDAResult | null;
  isFirstGame: boolean;
  gamesPlayed: number;
}

export interface UseDDAReturn {
  ddaState: DDAState;
  calculateDifficulty: (performance: PlayerPerformance) => DDAResult;
  updateBaseline: (performance: PlayerPerformance) => void;
  getAdaptiveDifficulty: (baseDifficulty: string) => string;
  getAdaptiveModifiers: (baseModifiers: any) => any;
  resetDDA: () => void;
  updateConfig: (newConfig: Partial<DDAConfig>) => void;
}

export function useDDA(): UseDDAReturn {
  const [ddaState, setDdaState] = useState<DDAState>({
    baseline: null,
    config: getDefaultDDAConfig(),
    lastResult: null,
    isFirstGame: true,
    gamesPlayed: 0
  });

  // Load DDA state from storage on mount
  useEffect(() => {
    loadDDAState();
  }, []);

  const loadDDAState = useCallback(async () => {
    try {
      const [baselineData, configData] = await Promise.all([
        AsyncStorage.getItem(DDA_STORAGE_KEY),
        AsyncStorage.getItem(DDA_CONFIG_KEY)
      ]);

      const baseline = baselineData ? JSON.parse(baselineData) : null;
      const config = configData ? JSON.parse(configData) : getDefaultDDAConfig();

      setDdaState(prev => ({
        ...prev,
        baseline,
        config,
        isFirstGame: !baseline
      }));
    } catch (error) {
      console.error('Failed to load DDA state:', error);
    }
  }, []);

  const saveDDAState = useCallback(async (newState: Partial<DDAState>) => {
    try {
      const promises = [];
      
      if (newState.baseline !== undefined) {
        promises.push(AsyncStorage.setItem(DDA_STORAGE_KEY, JSON.stringify(newState.baseline)));
      }
      
      if (newState.config !== undefined) {
        promises.push(AsyncStorage.setItem(DDA_CONFIG_KEY, JSON.stringify(newState.config)));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save DDA state:', error);
    }
  }, []);

  const calculateDifficulty = useCallback((performance: PlayerPerformance): DDAResult => {
    if (!ddaState.baseline) {
      // If no baseline exists, create one from this performance
      const baseline = createBaselineFromFirstGame(performance);
      setDdaState(prev => ({
        ...prev,
        baseline,
        isFirstGame: false,
        gamesPlayed: 1
      }));
      saveDDAState({ baseline, gamesPlayed: 1 });
      
      // Return neutral result for first game
      return {
        difficulty: 0.5,
        ease: 0.5,
        rpd: 0,
        performanceRatio: 1,
        recommendedAdjustment: 'maintain',
        adjustmentReason: 'First game - establishing baseline'
      };
    }

    // Calculate DDA using existing baseline
    const result = calculateDDA(performance, ddaState.baseline, ddaState.config);
    
    setDdaState(prev => ({
      ...prev,
      lastResult: result,
      gamesPlayed: prev.gamesPlayed + 1
    }));

    return result;
  }, [ddaState.baseline, ddaState.config, saveDDAState]);

  const updateBaseline = useCallback((performance: PlayerPerformance) => {
    if (!ddaState.baseline) return;

    const updatedBaseline = updateBaselinePerformance(
      ddaState.baseline,
      performance,
      0.1 // Learning rate
    );

    setDdaState(prev => ({
      ...prev,
      baseline: updatedBaseline
    }));

    saveDDAState({ baseline: updatedBaseline });
  }, [ddaState.baseline, saveDDAState]);

  const getAdaptiveDifficulty = useCallback((baseDifficulty: string): string => {
    if (!ddaState.lastResult) return baseDifficulty;

    return applyDDAAdjustment(baseDifficulty, ddaState.lastResult, ddaState.config);
  }, [ddaState.lastResult, ddaState.config]);

  const getAdaptiveModifiers = useCallback((baseModifiers: any): any => {
    if (!ddaState.lastResult) return baseModifiers;

    return calculateAdaptiveModifiers(baseModifiers, ddaState.lastResult, ddaState.config);
  }, [ddaState.lastResult, ddaState.config]);

  const resetDDA = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([DDA_STORAGE_KEY, DDA_CONFIG_KEY]);
      setDdaState({
        baseline: null,
        config: getDefaultDDAConfig(),
        lastResult: null,
        isFirstGame: true,
        gamesPlayed: 0
      });
    } catch (error) {
      console.error('Failed to reset DDA:', error);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<DDAConfig>) => {
    const updatedConfig = { ...ddaState.config, ...newConfig };
    setDdaState(prev => ({
      ...prev,
      config: updatedConfig
    }));
    saveDDAState({ config: updatedConfig });
  }, [ddaState.config, saveDDAState]);

  return {
    ddaState,
    calculateDifficulty,
    updateBaseline,
    getAdaptiveDifficulty,
    getAdaptiveModifiers,
    resetDDA,
    updateConfig
  };
}

/**
 * Helper function to convert ThoughtDefender game data to PlayerPerformance
 */
export function convertGameDataToPerformance(
  score: number,
  level: number,
  won: boolean,
  thoughtsCleared: number,
  totalThoughts: number,
  survivalTime: number,
  gameStartTime: number,
  gameEndTime: number
): PlayerPerformance {
  const duration = gameEndTime - gameStartTime;
  const accuracy = totalThoughts > 0 ? (thoughtsCleared / totalThoughts) * 100 : 0;
  
  // Estimate action count based on game events
  // This could be refined based on actual game mechanics
  const actionCount = thoughtsCleared + (won ? level * 5 : 0);
  
  return {
    actionCount,
    duration,
    score,
    level,
    won,
    accuracy,
    survivalTime
  };
} 