import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { ProjectileControllerOptions, VantageProjectileController  } from '@/types/hooks'



export function createVantageProjectileController({
  store,
  gameWidth,
  gameHeight,
  playerXRef,
  targetPlayerXRef,
  velocityRef,
  director,
}: ProjectileControllerOptions): VantageProjectileController {
  const clampX = (value: number) =>
    Math.max(0, Math.min(gameWidth - GAME_CONFIG.PLAYER_WIDTH, value))

  const updatePlayerPosition = (deltaSeconds: number) => {
    const { setPlayerX } = store.getState()
    const velocity = velocityRef.current

    if (velocity !== 0) {
      const newX = playerXRef.current + velocity * deltaSeconds
      const clampedX = clampX(newX)
      playerXRef.current = clampedX
      targetPlayerXRef.current = clampedX
      setPlayerX(clampedX)
      return
    }

    const currentX = playerXRef.current
    const targetX = targetPlayerXRef.current
    if (Math.abs(currentX - targetX) <= 0.5) {
      return
    }

    const lerpFactor = 0.35
    const newX = currentX + (targetX - currentX) * lerpFactor
    const clampedX = clampX(newX)
    playerXRef.current = clampedX
    setPlayerX(clampedX)
  }

  const updateProjectiles = (deltaSeconds: number, gameSpeed: number) => {
    const { setProjectiles } = store.getState()
    setProjectiles((prev) =>
      prev
        .map((p) => ({
          ...p,
          y: p.y - GAME_CONFIG.PROJECTILE_SPEED * gameSpeed * deltaSeconds,
        }))
        .filter((p) => p.y > -GAME_CONFIG.PROJECTILE_HEIGHT)
    )
  }

  const updateEnemyProjectiles = (deltaSeconds: number, gameSpeed: number) => {
    const { setEnemyProjectiles } = store.getState()
    const moveSpeedMultiplier = director.getMoveSpeedMultiplier()
    setEnemyProjectiles((prev) =>
      prev
        .map((p) => {
          const baseVy = p.vy || 300
          const adjustedVy = baseVy * moveSpeedMultiplier
          return {
            ...p,
            x: p.x + (p.vx ?? 0) * gameSpeed * moveSpeedMultiplier * deltaSeconds,
            y: p.y + adjustedVy * gameSpeed * deltaSeconds,
          }
        })
        .filter((p) => p.y < gameHeight + 40 && p.x > -40 && p.x < gameWidth + 40)
    )
  }

  const updateNegativeThoughts = (deltaSeconds: number, gameSpeed: number) => {
    const { setNegativeThoughts } = store.getState()
    const moveSpeedMultiplier = director.getMoveSpeedMultiplier()
    setNegativeThoughts((prev) =>
      prev
        .map((thought) => {
          if (thought.speed > 0) {
            return {
              ...thought,
              y: thought.y + thought.speed * gameSpeed * moveSpeedMultiplier * deltaSeconds,
            }
          }
          return thought
        })
        .filter((thought) => {
          if (thought.speed > 0) {
            return thought.y < gameHeight + 100
          }
          return true
        })
    )
  }

  const updatePowerUps = (deltaSeconds: number, gameSpeed: number) => {
    const { setPowerUps } = store.getState()
    setPowerUps((prev) =>
      prev
        .map((p) => ({
          ...p,
          y: p.y + GAME_CONFIG.POWERUP_SPEED * gameSpeed * deltaSeconds,
        }))
        .filter((p) => p.y < gameHeight + 100)
    )
  }

  const updateEntities = (deltaSeconds: number, gameSpeed: number) => {
    updateProjectiles(deltaSeconds, gameSpeed)
    updateEnemyProjectiles(deltaSeconds, gameSpeed)
    updateNegativeThoughts(deltaSeconds, gameSpeed)
    updatePowerUps(deltaSeconds, gameSpeed)
  }

  return {
    updatePlayerPosition,
    updateEntities,
  }
}
