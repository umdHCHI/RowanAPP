import { useEffect } from 'react'
import type { GameDirectorMetrics, UseGameDirectorOptions } from '@/types/hooks'
import { useDdaGameStore } from '@/stores/dda-game-store'
import { DDA_CONFIG, DEFAULT_METRICS } from '@/utils/vantage-constants'


/**
 * Thin hook that syncs game inputs into the game-director store, runs DDA/EI intervals,
 * and returns current metrics. State lives in Zustand; this hook orchestrates.
 */
export function useGameDirector({
  isPlaying,
  playerLastHitAt,
  projectilesSpawned,
  thoughtsDestroyed,
  gameStartTime,
  lastShotAt = 0,
  lastEnemyDestroyedAt = 0,
}: UseGameDirectorOptions): GameDirectorMetrics {
  const metrics = useDdaGameStore((s) => s.metrics)
  const setInputs = useDdaGameStore((s) => s.setInputs)
  const recordHit = useDdaGameStore((s) => s.recordHit)
  const evaluate = useDdaGameStore((s) => s.evaluate)
  const updateEI = useDdaGameStore((s) => s.updateEI)
  const reset = useDdaGameStore((s) => s.reset)

  const inputs: UseGameDirectorOptions = {
    isPlaying,
    playerLastHitAt,
    projectilesSpawned,
    thoughtsDestroyed,
    gameStartTime,
    lastShotAt,
    lastEnemyDestroyedAt,
  }

  useEffect(() => {
    setInputs(isPlaying ? inputs : null)
  }, [
    isPlaying,
    playerLastHitAt,
    projectilesSpawned,
    thoughtsDestroyed,
    gameStartTime,
    lastShotAt,
    lastEnemyDestroyedAt,
  ])

  useEffect(() => {
    if (playerLastHitAt != null && playerLastHitAt > 0) recordHit(playerLastHitAt)
  }, [playerLastHitAt, recordHit])

  useEffect(() => {
    if (!isPlaying) {
      reset()
      return
    }
  }, [isPlaying, reset])

  useEffect(() => {
    if (!isPlaying) return
    evaluate()
    const intervalId = setInterval(evaluate, DDA_CONFIG.EVALUATION_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [isPlaying, evaluate])

  useEffect(() => {
    if (!isPlaying) return
    updateEI()
    const intervalId = setInterval(updateEI, DDA_CONFIG.EI_UPDATE_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [isPlaying, updateEI])

  return metrics ?? DEFAULT_METRICS
}
