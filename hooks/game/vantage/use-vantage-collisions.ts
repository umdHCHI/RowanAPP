import { GAME_CONFIG } from '@/utils/vantage-constants'
import { THOUGHT_PATTERNS, type ThoughtPattern } from '@/utils/vantage-helpers'
import type {
  Projectile,
  EnemyProjectile,
  PowerUp,
  PowerUpType,
} from '@/types/game'
import type {  VantageCollisionEngine, CollisionEngineOptions } from '@/types/hooks'



const rectsIntersect = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w &&
  a.x + a.w > b.x &&
  a.y < b.y + b.h &&
  a.y + a.h > b.y

export function createVantageCollisionEngine({
  store,  
  gameHeight,
  playerXRef,
  getPlayerY,
  shieldActiveRef,
  negativeThoughtsRef,
  enemyProjectilesRef,
  defeatedThoughtIdsRef,
  thoughtsDestroyedRef,
  lastEnemyDestroyedAtRef,
  spawnFragments,
  handlePlayerHit,
  handlePowerUp,
  director,
  difficultyConfig,
}: CollisionEngineOptions): VantageCollisionEngine {
  const checkCollisions = (currentTime: number = performance.now()) => {
    const {
      setProjectiles,
      setNegativeThoughts,
      setEnemyProjectiles,
      setPowerUps,
      setDefeatedNegativeThoughts,
      setWaveDefeatedPatterns,
      setScore,
      setShieldActive,
    } = store.getState()
    const playerRect = {
      x: playerXRef.current,
      y: getPlayerY(),
      w: GAME_CONFIG.PLAYER_WIDTH,
      h: GAME_CONFIG.PLAYER_HEIGHT,
    }

    const thoughtsNow = negativeThoughtsRef.current
    const enemyProjectilesNow = enemyProjectilesRef.current

    setProjectiles((projs) => {
      if (projs.length === 0 || thoughtsNow.length === 0) {
        return projs
      }

      const hitThoughtIds = new Set<string>()
      const remainingProjs: Projectile[] = []

      for (const proj of projs) {
        const projectileRect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.PROJECTILE_WIDTH,
          h: GAME_CONFIG.PROJECTILE_HEIGHT,
        }

        let hit = false
        for (const thought of thoughtsNow) {
          if (hitThoughtIds.has(thought.id)) {
            continue
          }

          const thoughtRect = {
            x: thought.x,
            y: thought.y,
            w: GAME_CONFIG.THOUGHT_WIDTH,
            h: GAME_CONFIG.THOUGHT_HEIGHT,
          }

          if (rectsIntersect(projectileRect, thoughtRect)) {
            hitThoughtIds.add(thought.id)
            hit = true
            break
          }
        }

        if (!hit) {
          remainingProjs.push(proj)
        }
      }

      if (hitThoughtIds.size > 0) {
        thoughtsDestroyedRef.current += hitThoughtIds.size
        lastEnemyDestroyedAtRef.current = currentTime
        const destroyedThoughts = thoughtsNow.filter((t) => hitThoughtIds.has(t.id))

        destroyedThoughts.forEach((thought) => {
          if (thought.speed === 0) {
            spawnFragments(thought)
          }

          if (thought.patternId) {
            const pattern = THOUGHT_PATTERNS.find((p: ThoughtPattern) => p.id === thought.patternId)
            if (pattern) {
              setDefeatedNegativeThoughts((prev) => {
                if (prev.some((ct) => ct.id === thought.patternId)) {
                  return prev
                }
                return [
                  ...prev,
                  {
                    id: pattern.id,
                    phrase: pattern.phrase,
                    counterRecord: pattern.counterRecord,
                  },
                ]
              })
            }
          }

          if (thought.speed === 0) {
            const powerUpSpawnChance =
              difficultyConfig.powerUpSpawnChance * director.getPowerUpChanceMultiplier()
            if (Math.random() < powerUpSpawnChance) {
              const powerUpTypes: PowerUpType[] = [
                'slowTime',
                'multishot',
                'fastShoot',
                'extraLife',
                'multiplier',
                'shield',
              ]
              const newPowerUp: PowerUp = {
                id: `powerup-${Date.now()}-${Math.random()}`,
                x: thought.x + GAME_CONFIG.THOUGHT_WIDTH / 2 - GAME_CONFIG.POWERUP_WIDTH / 2,
                y: thought.y + GAME_CONFIG.THOUGHT_HEIGHT,
                type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
              }
              setPowerUps((prev) => [...prev, newPowerUp])
            }
          }

          if (thought.patternId && !defeatedThoughtIdsRef.current.has(thought.patternId)) {
            defeatedThoughtIdsRef.current.add(thought.patternId)
            setWaveDefeatedPatterns((prev) => new Set([...prev, thought.patternId!]))
          }
        })

        setNegativeThoughts((prev) => prev.filter((t) => !hitThoughtIds.has(t.id)))
        setScore((s) =>
          s + Math.floor(hitThoughtIds.size * GAME_CONFIG.SCORE_PER_HIT * difficultyConfig.scoreMultiplier)
        )
      }

      return remainingProjs
    })

    setProjectiles((projs) => {
      if (projs.length === 0 || enemyProjectilesNow.length === 0) {
        return projs
      }

      const hitEnemyProjectileIds = new Set<string>()
      const remainingProjs: Projectile[] = []

      for (const proj of projs) {
        const projectileRect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.PROJECTILE_WIDTH,
          h: GAME_CONFIG.PROJECTILE_HEIGHT,
        }

        let hit = false
        for (const enemyProj of enemyProjectilesNow) {
          if (hitEnemyProjectileIds.has(enemyProj.id)) {
            continue
          }

          const enemyProjectileRect = {
            x: enemyProj.x,
            y: enemyProj.y,
            w: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
            h: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
          }

          if (rectsIntersect(projectileRect, enemyProjectileRect)) {
            hitEnemyProjectileIds.add(enemyProj.id)
            hit = true
            break
          }
        }

        if (!hit) {
          remainingProjs.push(proj)
        }
      }

      if (hitEnemyProjectileIds.size > 0) {
        setEnemyProjectiles((prev) => prev.filter((ep) => !hitEnemyProjectileIds.has(ep.id)))
      }

      return remainingProjs
    })

    setNegativeThoughts((prev) => {
      if (prev.length === 0) {
        return prev
      }

      let hitsOnPlayer = 0
      let bottomHits = 0

      const remaining = prev.filter((thought) => {
        const thoughtRect = {
          x: thought.x,
          y: thought.y,
          w: GAME_CONFIG.THOUGHT_WIDTH,
          h: GAME_CONFIG.THOUGHT_HEIGHT,
        }

        const hitPlayer = rectsIntersect(playerRect, thoughtRect)
        if (hitPlayer) {
          hitsOnPlayer += 1
          return false
        }

        const hitBottom = thought.y >= gameHeight
        if (hitBottom) {
          bottomHits += 1
          return false
        }

        return true
      })

      const totalHits = hitsOnPlayer + bottomHits
      if (totalHits > 0) {
        for (let i = 0; i < totalHits; i += 1) {
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false
            setShieldActive(false)
          } else {
            handlePlayerHit()
          }
        }
      }

      return remaining
    })

    setEnemyProjectiles((prev) => {
      if (prev.length === 0) {
        return prev
      }

      const remaining: EnemyProjectile[] =   []

      for (const proj of prev) {
        const projectileRect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
          h: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
        }

        if (rectsIntersect(playerRect, projectileRect)) {
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false
            setShieldActive(false)
          } else {
            const damage = proj.isBoss ? 0.5 : 0.25
            handlePlayerHit(damage)
          }
        } else {
          remaining.push(proj)
        }
      }

      return remaining
    })

    setPowerUps((prev) => {
      if (prev.length === 0) {
        return prev
      }

      const remaining: PowerUp[] = []
      const collected: PowerUp[] = []

      for (const powerUp of prev) {
        if (powerUp.y >= gameHeight) {
          continue
        }

        const powerUpRect = {
          x: powerUp.x,
          y: powerUp.y,
          w: GAME_CONFIG.POWERUP_WIDTH,
          h: GAME_CONFIG.POWERUP_HEIGHT,
        }

        if (rectsIntersect(playerRect, powerUpRect)) {
          collected.push(powerUp)
        } else {
          remaining.push(powerUp)
        }
      }

      if (collected.length > 0) {
        setScore((s) => s + Math.floor(collected.length * 5 * difficultyConfig.scoreMultiplier))
        collected.forEach((p) => handlePowerUp(p.type))
      }

      return remaining
    })
  }

  return {
    checkCollisions,
  }
}
