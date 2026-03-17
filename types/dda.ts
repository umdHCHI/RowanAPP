import { DDA_CONFIG } from "@/utils/vantage-constants";
import {
  UseGameDirectorOptions,
  GameDirectorMetrics,
  PressureComponents,
} from "./hooks";

export interface DdaGameState {
  // Inputs (fed by useGameDirector from game loop)
  inputs: UseGameDirectorOptions | null;

  // Core DDA state
  difficultyLevel: number;
  pressureScore: number;
  emotionalIntensity: number;
  pressureComponents: PressureComponents;

  // Tracking state (replaces refs)
  hitHistory: number[];
  lastEvaluationTime: number;
  lastProjectilesSpawned: number;
  lastThoughtsDestroyed: number;
  lastDifficultyLevel: number;
  currentEI: number;
  lastPressureScore: number;
  lastMoveSpeed: number;
  lastFormationTickMultiplier: number;

  // Computed metrics (null when !isPlaying)
  metrics: GameDirectorMetrics | null;
}

export interface DdaGameActions {
  setInputs: (inputs: UseGameDirectorOptions | null) => void;
  recordHit: (timestamp: number) => void;
  evaluate: () => void;
  updateEI: () => void;
  computeAndStoreMetrics: () => void;
  reset: () => void;
  getMetrics: () => GameDirectorMetrics | null;
}

export const initialState: DdaGameState = {
  inputs: null,
  difficultyLevel: DDA_CONFIG.INITIAL_DIFFICULTY,
  pressureScore: DDA_CONFIG.INITIAL_NEUTRAL,
  emotionalIntensity: DDA_CONFIG.INITIAL_NEUTRAL,
  pressureComponents: {
    hit: 0,
    accuracy: 0,
    survival: 0,
    shoot: 0,
    kill: 0,
  },
  hitHistory: [],
  lastEvaluationTime: 0,
  lastProjectilesSpawned: 0,
  lastThoughtsDestroyed: 0,
  lastDifficultyLevel: DDA_CONFIG.INITIAL_DIFFICULTY,
  currentEI: DDA_CONFIG.INITIAL_NEUTRAL,
  lastPressureScore: DDA_CONFIG.INITIAL_NEUTRAL,
  lastMoveSpeed: DDA_CONFIG.INITIAL_MOVE,
  lastFormationTickMultiplier: DDA_CONFIG.INITIAL_MOVE,
  metrics: null,
};
