/**
 * DDA (Dynamic Difficulty Adjustment) game store.
 * Holds DDA state, pressure/EI calculations, and computed metrics.
 * Session-only (not persisted). Reset when game stops.
 */

import { create } from 'zustand'
import type { GameDirectorMetrics } from '@/types/hooks'
import { DDA_CONFIG } from '@/utils/vantage-constants'
import { DdaGameState, DdaGameActions, initialState } from '@/types/dda'


function runEvaluate(get: () => DdaGameState, set: (partial: Partial<DdaGameState>) => void) {
  const state = get()
  const { inputs } = state
  if (!inputs?.isPlaying) return

  const now = performance.now()
  const gameStartTime = inputs.gameStartTime || now
  const timeSinceStart = now - gameStartTime
  const timeSinceLastEvaluation = now - state.lastEvaluationTime
  const lastShotAt = inputs.lastShotAt ?? 0
  const lastEnemyDestroyedAt = inputs.lastEnemyDestroyedAt ?? 0
  const { projectilesSpawned, thoughtsDestroyed } = inputs

  if (timeSinceStart < DDA_CONFIG.MIN_EVALUATION_WINDOW) {
    set({ lastEvaluationTime: now })
    return
  }

  const recentHits = state.hitHistory.filter((t) => t >= state.lastEvaluationTime)
  const hitFrequency = recentHits.length / (timeSinceLastEvaluation / 60000)
  const normalizedHitFrequency = Math.min(hitFrequency / 30, 1)

  const projectilesInWindow = projectilesSpawned - state.lastProjectilesSpawned
  const thoughtsInWindow = thoughtsDestroyed - state.lastThoughtsDestroyed
  let accuracy = 0.5
  if (projectilesInWindow > 0) {
    accuracy = Math.min(thoughtsInWindow / projectilesInWindow, 1)
  } else if (projectilesInWindow === 0 && thoughtsInWindow > 0) {
    accuracy = 1
  }
  const accuracyPressure = 1 - accuracy

  let survivalWindowPressure = 0.5
  if (state.hitHistory.length >= 2) {
    const sortedHits = [...state.hitHistory].sort((a, b) => a - b)
    const intervals: number[] = []
    for (let i = 1; i < sortedHits.length; i++) {
      intervals.push(sortedHits[i] - sortedHits[i - 1])
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const normalizedInterval = Math.max(0, Math.min(1, (2000 - avgInterval) / 8000))
    survivalWindowPressure = normalizedInterval
  } else if (state.hitHistory.length === 1) {
    const timeSinceHit = now - state.hitHistory[0]
    survivalWindowPressure = Math.max(0, Math.min(1, (5000 - timeSinceHit) / 5000))
  } else {
    survivalWindowPressure = 0
  }

  let shootActivityPressure = 0
  if (lastShotAt > 0) {
    shootActivityPressure = Math.min(1, (now - lastShotAt) / DDA_CONFIG.SHOOT_INACTIVITY_THRESHOLD)
  } else {
    shootActivityPressure = 0.3
  }

  let killActivityPressure = 0
  if (lastEnemyDestroyedAt > 0) {
    const timeSinceLastKill = now - lastEnemyDestroyedAt
    if (timeSinceLastKill < 500) {
      killActivityPressure = -0.2
    } else {
      killActivityPressure = Math.min(1, timeSinceLastKill / DDA_CONFIG.KILL_INACTIVITY_THRESHOLD)
    }
  } else {
    killActivityPressure = 0.3
  }

  let calculatedPressure =
    normalizedHitFrequency * DDA_CONFIG.HIT_FREQUENCY_WEIGHT +
    accuracyPressure * DDA_CONFIG.ACCURACY_WEIGHT +
    survivalWindowPressure * DDA_CONFIG.SURVIVAL_WINDOW_WEIGHT +
    shootActivityPressure * DDA_CONFIG.SHOOT_ACTIVITY_WEIGHT +
    Math.max(-0.2, killActivityPressure) * DDA_CONFIG.KILL_ACTIVITY_WEIGHT

  const lastHitTime = state.hitHistory.length > 0 ? Math.max(...state.hitHistory) : 0
  const timeSinceLastHit = lastHitTime > 0 ? now - lastHitTime : Infinity
  if (timeSinceLastHit > DDA_CONFIG.STRESS_DECAY_THRESHOLD) {
    const currentPressure = state.lastPressureScore || 0.5
    const decayedPressure = Math.max(0, currentPressure - DDA_CONFIG.STRESS_DECAY_RATE)
    calculatedPressure = calculatedPressure * 0.7 + decayedPressure * 0.3
  }

  const lastPressureScore = Math.max(0, Math.min(1, calculatedPressure))

  let newDifficulty = state.lastDifficultyLevel
  if (lastPressureScore > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
    newDifficulty = Math.max(
      DDA_CONFIG.MIN_DIFFICULTY,
      state.lastDifficultyLevel * DDA_CONFIG.DIFFICULTY_DECREASE_RATE
    )
  } else if (lastPressureScore < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
    newDifficulty = Math.min(
      DDA_CONFIG.MAX_DIFFICULTY,
      state.lastDifficultyLevel + DDA_CONFIG.DIFFICULTY_INCREASE_RATE
    )
  }

  const difficultyDelta = Math.abs(newDifficulty - state.lastDifficultyLevel)
  const difficultyLevel = difficultyDelta > 0.1 ? newDifficulty : state.difficultyLevel
  const lastDifficultyLevel = difficultyDelta > 0.1 ? newDifficulty : state.lastDifficultyLevel

  set({
    pressureScore: lastPressureScore,
    lastPressureScore,
    difficultyLevel,
    lastDifficultyLevel,
    lastEvaluationTime: now,
    lastProjectilesSpawned: projectilesSpawned,
    lastThoughtsDestroyed: thoughtsDestroyed,
  })
}

function runUpdateEI(get: () => DdaGameState, set: (partial: Partial<DdaGameState>) => void) {
  const state = get()
  if (!state.inputs?.isPlaying) return

  const stressSignal = state.pressureScore
  const alpha = DDA_CONFIG.EI_EMA_ALPHA
  let targetEI = state.currentEI

  if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
    const lowTarget = Math.min(0.3, stressSignal * 0.4)
    targetEI = Math.max(0, state.currentEI - DDA_CONFIG.EI_THERAPEUTIC_DECAY_RATE)
    targetEI = Math.max(targetEI, lowTarget)
  } else if (stressSignal < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
    targetEI = Math.min(1, state.currentEI + DDA_CONFIG.EI_RISE_RATE)
  } else {
    targetEI = alpha * stressSignal + (1 - alpha) * state.currentEI
  }

  const smoothedEI = alpha * targetEI + (1 - alpha) * state.currentEI
  const currentEI = Math.max(0, Math.min(1, smoothedEI))

  set({ currentEI, emotionalIntensity: currentEI })
}

function runComputeAndStoreMetrics(
  get: () => DdaGameState,
  set: (partial: Partial<DdaGameState>) => void
) {
  const state = get()
  if (!state.inputs?.isPlaying) return

  const stressSignal = state.pressureScore
  const EI = state.emotionalIntensity
  const difficultyLevel = state.difficultyLevel

  const normalizedDifficulty =
    (difficultyLevel - DDA_CONFIG.MIN_DIFFICULTY) /
    (DDA_CONFIG.MAX_DIFFICULTY - DDA_CONFIG.MIN_DIFFICULTY)

  const baselineFormationTickMultiplier = 1.5 - normalizedDifficulty * 1.0
  const baselineMoveSpeed = 0.6 + normalizedDifficulty * 0.8
  const baselinePowerUpChance = 2.0 - normalizedDifficulty * 1.7

  let formationTickScaler = 1.0
  if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
    formationTickScaler = 0.5 + (1 - stressSignal) * 0.5
  } else if (stressSignal < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
    const lowStressFactor = 1 - stressSignal / DDA_CONFIG.LOW_PRESSURE_THRESHOLD
    formationTickScaler = 0.4 + lowStressFactor * 0.3
  } else {
    formationTickScaler = 0.8 + EI * 0.4
  }

  let moveScaler = 1.0
  if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
    moveScaler = 0.25 + (1 - stressSignal) * 0.5
  } else if (stressSignal < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
    const lowStressFactor = 1 - stressSignal / DDA_CONFIG.LOW_PRESSURE_THRESHOLD
    moveScaler = 1.1 + lowStressFactor * 0.2
  } else {
    moveScaler = 0.85 + EI * 0.25
  }

  let powerUpScaler = 1.0
  if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
    powerUpScaler = 1.0 + (stressSignal - DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) * 0.5
  }

  const rawFormationTickMultiplier = baselineFormationTickMultiplier * (1 / formationTickScaler)
  const rawMoveSpeed = baselineMoveSpeed * moveScaler
  const powerUpChance = baselinePowerUpChance * powerUpScaler

  const lastFt = state.lastFormationTickMultiplier || rawFormationTickMultiplier
  const lastMs = state.lastMoveSpeed || rawMoveSpeed
  const smoothedFormationTickMultiplier = DDA_CONFIG.SMOOTHING_ALPHA * rawFormationTickMultiplier + (1 - DDA_CONFIG.SMOOTHING_ALPHA) * lastFt
  const smoothedMoveSpeed = DDA_CONFIG.SMOOTHING_ALPHA * rawMoveSpeed + (1 - DDA_CONFIG.SMOOTHING_ALPHA) * lastMs

  const metrics: GameDirectorMetrics = {
    formationTickMultiplier: Math.max(0.3, Math.min(2.5, smoothedFormationTickMultiplier)),
    moveSpeed: Math.max(0.2, Math.min(1.6, smoothedMoveSpeed)),
    powerUpChance: Math.max(0.2, Math.min(2.3, powerUpChance)),
    difficultyLevel,
    pressureScore: stressSignal,
    emotionalIntensity: EI,
  }

  set({
    lastFormationTickMultiplier: smoothedFormationTickMultiplier,
    lastMoveSpeed: smoothedMoveSpeed,
    metrics,
  })
}

export const useDdaGameStore = create<DdaGameState & DdaGameActions>()((set, get) => ({
  ...initialState,

  setInputs: (inputs) => {
    const state = get()
    if (!inputs) {
      set({ inputs: null })
      return
    }
    if (inputs.isPlaying && state.lastEvaluationTime === 0) {
      set({
        inputs,
        lastEvaluationTime: inputs.gameStartTime || performance.now(),
        lastProjectilesSpawned: inputs.projectilesSpawned,
        lastThoughtsDestroyed: inputs.thoughtsDestroyed,
      })
    } else {
      set({ inputs })
    }
  },

  recordHit: (timestamp) => {
    if (!(timestamp > 0)) return
    set((s) => {
      const next = [...s.hitHistory, timestamp].slice(-10)
      return { hitHistory: next }
    })
  },

  evaluate: () => {
    runEvaluate(get, set)
    runComputeAndStoreMetrics(get, set)
  },

  updateEI: () => {
    runUpdateEI(get, set)
    runComputeAndStoreMetrics(get, set)
  },

  computeAndStoreMetrics: () => {
    runComputeAndStoreMetrics(get, set)
  },

  reset: () => {
    set(initialState)
  },

  getMetrics: () => get().metrics,
}))
