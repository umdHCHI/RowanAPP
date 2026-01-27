import type { RefObject  } from 'react'
import type { VantageDdaMetrics, VantageDirector } from '@/types/hooks'

export function createVantageDirector(
  ddaMetricsRef?: RefObject <VantageDdaMetrics | undefined>
): VantageDirector {
  const getMetrics = () => ddaMetricsRef?.current

  const getTimeScale = (hasFragments: boolean) => {
    if (!hasFragments) {
      return 1
    }
    const stressSignal = getMetrics()?.pressureScore ?? 0.5
    const raw = 0.85 - stressSignal * 0.25
    return Math.max(0.85, raw)
  }

  const getMoveSpeedMultiplier = () => getMetrics()?.moveSpeed ?? 1

  const getFormationDelay = (baseTickMs: number) => {
    const multiplier = getMetrics()?.formationTickMultiplier ?? 1
    return baseTickMs * multiplier
  }

  const getFormationStepMultipliers = () => {
    const moveSpeedMultiplier = getMoveSpeedMultiplier()
    const stressSignal = getMetrics()?.pressureScore ?? 0.5

    const horizontal =
      moveSpeedMultiplier < 1
        ? 0.5 + moveSpeedMultiplier * 0.4
        : 1 + (moveSpeedMultiplier - 1) * 0.3

    let vertical = 1
    if (stressSignal > 0.7) {
      vertical = 0.65
    } else if (stressSignal < 0.3) {
      const lowStressFactor = 1 - stressSignal / 0.3
      vertical = 1.1 + lowStressFactor * 0.15
    }

    return { horizontal, vertical }
  }

  const getEnemyFireInterval = (baseInterval: number) => {
    const stressSignal = getMetrics()?.pressureScore ?? 0.5
    if (stressSignal > 0.7) {
      return baseInterval * 1.3
    }
    if (stressSignal < 0.3) {
      const lowStressFactor = 1 - stressSignal / 0.3
      return baseInterval * (0.5 + lowStressFactor * 0.3)
    }
    return baseInterval
  }

  const getBossFireCooldown: VantageDirector['getBossFireCooldown'] = ({
    baseCooldown,
    recentBossHits,
    timeSinceLastBossHit,
  }) => {
    const stressSignal = getMetrics()?.pressureScore ?? 0.5

    if (recentBossHits.length >= 8 || timeSinceLastBossHit < 200) {
      return Math.max(1100, baseCooldown * 0.8)
    }

    if (recentBossHits.length >= 6) {
      return baseCooldown * 0.9
    }

    if (stressSignal < 0.25) {
      const lowStressFactor = 1 - stressSignal / 0.25
      const cooldownReduction = 100 * lowStressFactor
      return Math.max(1200, baseCooldown - cooldownReduction)
    }

    if (stressSignal > 0.7) {
      return baseCooldown * 1.2
    }

    return baseCooldown
  }

  const getWellnessProbability = () => {
    const stressSignal = getMetrics()?.pressureScore ?? 0.5
    return 0.35 + 0.4 * stressSignal
  }

  const getPowerUpChanceMultiplier = () => getMetrics()?.powerUpChance ?? 1

  return {
    getTimeScale,
    getMoveSpeedMultiplier,
    getFormationDelay,
    getFormationStepMultipliers,
    getEnemyFireInterval,
    getBossFireCooldown,
    getWellnessProbability,
    getPowerUpChanceMultiplier,
  }
}
