import { useState, useEffect, useRef } from 'react'

export interface GameDirectorMetrics {
  formationTickMultiplier: number // Multiplier for formation tick intervals (lower = faster movement)
  moveSpeed: number // Velocity multiplier for thoughts and enemy projectiles
  powerUpChance: number // Multiplier for power-up spawn chance
  difficultyLevel: number // 1-10, for debugging/display
  pressureScore: number // 0-1, current pressure assessment (stressSignal)
  emotionalIntensity: number // 0-1, EMA-smoothed emotional intensity (EI)
}

export interface UseGameDirectorOptions {
  isPlaying: boolean
  playerLastHitAt?: number // Timestamp of last player hit
  projectilesSpawned: number // Total projectiles spawned (tracked externally)
  thoughtsDestroyed: number // Total thoughts destroyed (tracked externally)
  gameStartTime: number // When the game started (performance.now())
}

const DDA_CONFIG = {
  // Pressure calculation weights (0-1)
  HIT_FREQUENCY_WEIGHT: 0.4,
  ACCURACY_WEIGHT: 0.35,
  SURVIVAL_WINDOW_WEIGHT: 0.25,

  // Pressure thresholds
  HIGH_PRESSURE_THRESHOLD: 0.7, // If pressure > 0.7, player is struggling
  LOW_PRESSURE_THRESHOLD: 0.3, // If pressure < 0.3, player is doing well

  // Difficulty adjustment rates
  DIFFICULTY_DECREASE_RATE: 0.8, // How much to decrease difficulty when struggling (0.8 = decrease by 20%)
  DIFFICULTY_INCREASE_RATE: 0.05, // How much to increase difficulty when doing well (per evaluation)

  // Difficulty bounds
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,

  // Evaluation interval
  EVALUATION_INTERVAL_MS: 5000, // Recalculate every 5 seconds

  // Minimum time window for calculations (in ms)
  MIN_EVALUATION_WINDOW: 3000, // Need at least 3 seconds of data

  // Emotional Intensity (EI) smoothing
  EI_UPDATE_INTERVAL_MS: 1000, // Update EI every 1 second for smoother transitions
  EI_EMA_ALPHA: 0.15, // EMA smoothing factor (0-1, lower = smoother)
  EI_THERAPEUTIC_DECAY_RATE: 0.05, // When stressSignal is high, EI decays at this rate per update
  EI_RISE_RATE: 0.02, // When stressSignal is low, EI can rise at this rate per update
} as const

export function useGameDirector({
  isPlaying,
  playerLastHitAt,
  projectilesSpawned,
  thoughtsDestroyed,
  gameStartTime,
}: UseGameDirectorOptions): GameDirectorMetrics {
  const [difficultyLevel, setDifficultyLevel] = useState(5) // Start at middle difficulty
  const [pressureScore, setPressureScore] = useState(0.5) // Start neutral (this is stressSignal)
  const [emotionalIntensity, setEmotionalIntensity] = useState(0.5) // Start neutral

  // Track history for calculations
  const hitHistoryRef = useRef<number[]>([]) // Timestamps of hits
  const lastEvaluationTimeRef = useRef<number>(0)
  const lastProjectilesSpawnedRef = useRef<number>(0)
  const lastThoughtsDestroyedRef = useRef<number>(0)
  const lastDifficultyLevelRef = useRef<number>(5)
  const lastEIUpdateTimeRef = useRef<number>(0)
  const currentEIRef = useRef<number>(0.5) // Track EI for EMA smoothing

  // Initialize evaluation time
  useEffect(() => {
    if (isPlaying && lastEvaluationTimeRef.current === 0) {
      lastEvaluationTimeRef.current = gameStartTime || performance.now()
      lastProjectilesSpawnedRef.current = projectilesSpawned
      lastThoughtsDestroyedRef.current = thoughtsDestroyed
    }
  }, [isPlaying, gameStartTime, projectilesSpawned, thoughtsDestroyed])

  // Track hits for survival window calculation
  useEffect(() => {
    if (playerLastHitAt && playerLastHitAt > 0) {
      hitHistoryRef.current.push(playerLastHitAt)
      // Keep only last 10 hits for rolling window
      if (hitHistoryRef.current.length > 10) {
        hitHistoryRef.current = hitHistoryRef.current.slice(-10)
      }
    }
  }, [playerLastHitAt])

  // Reset when game stops
  useEffect(() => {
    if (!isPlaying) {
      hitHistoryRef.current = []
      lastEvaluationTimeRef.current = 0
      lastProjectilesSpawnedRef.current = 0
      lastThoughtsDestroyedRef.current = 0
      lastEIUpdateTimeRef.current = 0
      setDifficultyLevel(5)
      setPressureScore(0.5)
      setEmotionalIntensity(0.5)
      lastDifficultyLevelRef.current = 5
      currentEIRef.current = 0.5
    }
  }, [isPlaying])

  // Main DDA evaluation loop
  useEffect(() => {
    if (!isPlaying) return

    const evaluateDifficulty = () => {
      const now = performance.now()
      const timeSinceStart = now - (gameStartTime || now)
      const timeSinceLastEvaluation = now - lastEvaluationTimeRef.current

      // Need minimum time window for meaningful calculations
      if (timeSinceStart < DDA_CONFIG.MIN_EVALUATION_WINDOW) {
        lastEvaluationTimeRef.current = now
        return
      }

      // Calculate hit frequency (higher = more pressure)
      // Measure hits per minute in evaluation window
      const recentHits = hitHistoryRef.current.filter(
        (hitTime) => hitTime >= lastEvaluationTimeRef.current
      )
      const hitFrequency = recentHits.length / (timeSinceLastEvaluation / 60000) // hits per minute
      const normalizedHitFrequency = Math.min(hitFrequency / 30, 1) // Cap at 30 hits/min = max pressure

      // Calculate accuracy (lower = more pressure)
      // Accuracy = thoughts destroyed / projectiles spawned
      const projectilesInWindow = projectilesSpawned - lastProjectilesSpawnedRef.current
      const thoughtsInWindow = thoughtsDestroyed - lastThoughtsDestroyedRef.current

      let accuracy = 0.5 // Default neutral
      if (projectilesInWindow > 0) {
        accuracy = Math.min(thoughtsInWindow / projectilesInWindow, 1)
      } else if (projectilesInWindow === 0 && thoughtsInWindow > 0) {
        // Edge case: thoughts destroyed but no projectiles (maybe other means)
        accuracy = 1
      }

      // Invert accuracy for pressure (low accuracy = high pressure)
      const accuracyPressure = 1 - accuracy

      // Calculate survival window (shorter = more pressure)
      // Average time between hits in recent history
      let survivalWindowPressure = 0.5 // Default neutral
      if (hitHistoryRef.current.length >= 2) {
        const sortedHits = [...hitHistoryRef.current].sort((a, b) => a - b)
        const intervals: number[] = []
        for (let i = 1; i < sortedHits.length; i++) {
          intervals.push(sortedHits[i] - sortedHits[i - 1])
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        // Normalize: < 2 seconds = high pressure, > 10 seconds = low pressure
        const normalizedInterval = Math.max(0, Math.min(1, (2000 - avgInterval) / 8000))
        survivalWindowPressure = normalizedInterval
      } else if (hitHistoryRef.current.length === 1) {
        // Only one hit, check time since hit
        const timeSinceHit = now - hitHistoryRef.current[0]
        survivalWindowPressure = Math.max(0, Math.min(1, (5000 - timeSinceHit) / 5000))
      } else {
        // No hits recently = low pressure
        survivalWindowPressure = 0
      }

      // Weighted pressure score
      const calculatedPressure =
        normalizedHitFrequency * DDA_CONFIG.HIT_FREQUENCY_WEIGHT +
        accuracyPressure * DDA_CONFIG.ACCURACY_WEIGHT +
        survivalWindowPressure * DDA_CONFIG.SURVIVAL_WINDOW_WEIGHT

      setPressureScore(calculatedPressure)

      // Adjust difficulty based on pressure (legacy, kept for compatibility)
      let newDifficulty = lastDifficultyLevelRef.current

      if (calculatedPressure > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
        // Player struggling: decrease difficulty
        newDifficulty = Math.max(
          DDA_CONFIG.MIN_DIFFICULTY,
          lastDifficultyLevelRef.current * DDA_CONFIG.DIFFICULTY_DECREASE_RATE
        )
      } else if (calculatedPressure < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
        // Player doing well: gradually increase difficulty
        newDifficulty = Math.min(
          DDA_CONFIG.MAX_DIFFICULTY,
          lastDifficultyLevelRef.current + DDA_CONFIG.DIFFICULTY_INCREASE_RATE
        )
      }
      // If pressure is in middle range, maintain current difficulty

      // Smooth difficulty changes (avoid jitter)
      const difficultyDelta = Math.abs(newDifficulty - lastDifficultyLevelRef.current)
      if (difficultyDelta > 0.1) {
        setDifficultyLevel(newDifficulty)
        lastDifficultyLevelRef.current = newDifficulty
      }

      // Update tracking refs
      lastEvaluationTimeRef.current = now
      lastProjectilesSpawnedRef.current = projectilesSpawned
      lastThoughtsDestroyedRef.current = thoughtsDestroyed
    }

    // Initial evaluation
    evaluateDifficulty()

    // Set up interval for periodic evaluation
    const intervalId = setInterval(evaluateDifficulty, DDA_CONFIG.EVALUATION_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [
    isPlaying,
    playerLastHitAt,
    projectilesSpawned,
    thoughtsDestroyed,
    gameStartTime,
  ])

  // Emotional Intensity (EI) update loop - runs more frequently for smooth transitions
  useEffect(() => {
    if (!isPlaying) return

    const updateEI = () => {
      const now = performance.now()
      const stressSignal = pressureScore // Use pressureScore as stressSignal

      // Therapeutic window behavior:
      // - When stressSignal is high, EI should trend downward or be capped low
      // - When stressSignal is low, EI can rise gradually
      
      let targetEI = currentEIRef.current

      if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
        // High stress: EI should decay or be capped low
        // Decay EI towards a lower value (e.g., stressSignal * 0.3, but cap at 0.3)
        const lowTarget = Math.min(0.3, stressSignal * 0.4)
        targetEI = Math.max(0, currentEIRef.current - DDA_CONFIG.EI_THERAPEUTIC_DECAY_RATE)
        // Don't let it go below the low target
        targetEI = Math.max(targetEI, lowTarget)
      } else if (stressSignal < DDA_CONFIG.LOW_PRESSURE_THRESHOLD) {
        // Low stress: EI can rise gradually
        targetEI = Math.min(1, currentEIRef.current + DDA_CONFIG.EI_RISE_RATE)
      } else {
        // Medium stress: EI can drift towards stressSignal with smoothing
        // Use EMA to smooth towards stressSignal
        const alpha = DDA_CONFIG.EI_EMA_ALPHA
        targetEI = alpha * stressSignal + (1 - alpha) * currentEIRef.current
      }

      // Apply EMA smoothing to prevent jitter
      const alpha = DDA_CONFIG.EI_EMA_ALPHA
      const smoothedEI = alpha * targetEI + (1 - alpha) * currentEIRef.current
      
      // Clamp to [0, 1]
      const clampedEI = Math.max(0, Math.min(1, smoothedEI))
      
      currentEIRef.current = clampedEI
      setEmotionalIntensity(clampedEI)
      lastEIUpdateTimeRef.current = now
    }

    // Initial update
    updateEI()

    // Set up interval for periodic EI updates
    const intervalId = setInterval(updateEI, DDA_CONFIG.EI_UPDATE_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [isPlaying, pressureScore])

  // Map EI + stressSignal to game parameters (with difficulty baseline)
  // This implements wellbeing-oriented pacing rather than skill mastery difficulty
  const metrics: GameDirectorMetrics = (() => {
    const stressSignal = pressureScore
    const EI = emotionalIntensity

    // Baseline from difficulty (for compatibility with easy/normal/hard selector)
    const normalizedDifficulty = (difficultyLevel - DDA_CONFIG.MIN_DIFFICULTY) /
      (DDA_CONFIG.MAX_DIFFICULTY - DDA_CONFIG.MIN_DIFFICULTY)
    
    // Baseline formation tick multiplier (from difficulty)
    // Lower value = faster formation movement (shorter tick intervals)
    const baselineFormationTickMultiplier = 1.5 - normalizedDifficulty * 1.0 // 1.5 (hard/fast) down to 0.5 (easy/slow)
    
    // Baseline move speed (from difficulty)
    const baselineMoveSpeed = 0.6 + normalizedDifficulty * 0.8 // 0.6 (easy) up to 1.4 (hard)
    
    // Baseline power-up chance (from difficulty)
    const baselinePowerUpChance = 2.0 - normalizedDifficulty * 1.7 // 2.0 (easy) down to 0.3 (hard)

    // Director scalers based on EI and stressSignal (therapeutic window behavior)
    // Formation pacing: as EI rises, move faster; when stressSignal is high, move slower
    let formationTickScaler = 1.0
    if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
      // High stress: increase tick multiplier (slower movement, gentler pacing)
      formationTickScaler = 0.7 + (1 - stressSignal) * 0.3 // 0.7 to 1.0, slower when stress is higher
    } else {
      // Normal/low stress: decrease tick multiplier as EI rises (faster movement)
      formationTickScaler = 0.8 + EI * 0.4 // 0.8 to 1.2, faster when EI is higher (inverted: lower = faster)
    }

    // Movement pacing: as EI rises, move slightly faster; when stressSignal is high, slow down
    // Make effects more visible with wider range
    let moveScaler = 1.0
    if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
      // High stress: slow down movement significantly (gentler pacing, more noticeable)
      moveScaler = 0.5 + (1 - stressSignal) * 0.4 // 0.5 to 0.9, much slower when stress is higher
    } else {
      // Normal/low stress: slightly faster as EI rises
      moveScaler = 0.85 + EI * 0.25 // 0.85 to 1.1, faster when EI is higher
    }

    // Power-up pacing: when stressSignal is high, slightly increase powerUpChance
    let powerUpScaler = 1.0
    if (stressSignal > DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) {
      // High stress: increase power-up chance (supportive)
      powerUpScaler = 1.0 + (stressSignal - DDA_CONFIG.HIGH_PRESSURE_THRESHOLD) * 0.5 // 1.0 to 1.15
    } else {
      // Normal/low stress: standard power-up chance
      powerUpScaler = 1.0
    }

    // Apply scalers to baselines
    // Note: formationTickMultiplier is inverted - lower value = faster movement
    // So we invert the scaler: when we want slower, we multiply by > 1
    const formationTickMultiplier = baselineFormationTickMultiplier * (1 / formationTickScaler)
    const moveSpeed = baselineMoveSpeed * moveScaler
    const powerUpChance = baselinePowerUpChance * powerUpScaler

    return {
      formationTickMultiplier: Math.max(0.3, Math.min(2.5, formationTickMultiplier)),
      moveSpeed: Math.max(0.5, Math.min(1.6, moveSpeed)),
      powerUpChance: Math.max(0.2, Math.min(2.3, powerUpChance)),
      difficultyLevel,
      pressureScore: stressSignal,
      emotionalIntensity: EI,
    }
  })()

  return metrics
}
