import { DDA_CONFIG } from "@/utils/vantage-constants"
import { UseGameDirectorOptions, GameDirectorMetrics } from "./hooks"


export interface DdaGameState {
    // Inputs (fed by useGameDirector from game loop)
    inputs: UseGameDirectorOptions | null
  
    // Core DDA state
    difficultyLevel: number
    pressureScore: number
    emotionalIntensity: number
  
    // Tracking state (replaces refs)
    hitHistory: number[]
    lastEvaluationTime: number
    lastProjectilesSpawned: number
    lastThoughtsDestroyed: number
    lastDifficultyLevel: number
    currentEI: number
    lastPressureScore: number
    lastMoveSpeed: number
    lastFormationTickMultiplier: number
  
    // Computed metrics (null when !isPlaying)
    metrics: GameDirectorMetrics | null
  }
  
  export interface DdaGameActions {
    setInputs: (inputs: UseGameDirectorOptions | null) => void
    recordHit: (timestamp: number) => void
    evaluate: () => void
    updateEI: () => void
    computeAndStoreMetrics: () => void
    reset: () => void
    getMetrics: () => GameDirectorMetrics | null
  }

  export const initialState: DdaGameState = {
    inputs: null,
    difficultyLevel: DDA_CONFIG.INITIAL_DIFFICULTY,
    pressureScore: DDA_CONFIG.INITIAL_NEUTRAL,
    emotionalIntensity: DDA_CONFIG.INITIAL_NEUTRAL,
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
  }