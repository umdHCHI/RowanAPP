import { GAME_CONFIG } from '@/utils/vantage-constants'
import type { VantageBossManager, BossManagerOptions, TriggerBossParams, UpdateBossCombatParams } from '@/types/hooks'


export function createVantageBossManager({
  store,
  gameWidth,
  gameHeight,
  difficultyConfig,
  playerXRef,
  bossVelocityXRef,
  bossVelocityYRef,
  bossNextFireAtRef,
  bossBurstRemainingRef,
  bossNextBurstShotAtRef,
  bossBurstCountRef,
  bossHitsRef,
  lastBossHitAtRef,
  director,
}: BossManagerOptions): VantageBossManager {
  const triggerBoss = ({ onBossActivated }: TriggerBossParams) => {
    const { setProjectiles, setEnemyProjectiles, setBoss, setBossIncoming } = store.getState()
    setProjectiles([])
    setEnemyProjectiles([])
    setBossIncoming(true)

    setTimeout(() => {
      setBossIncoming(false)
      const initialVelX = Math.random() > 0.5 ? 3 : -3
      const initialVelY = Math.random() > 0.5 ? 2 : -2
      bossVelocityXRef.current = initialVelX
      bossVelocityYRef.current = initialVelY

      setBoss(() => ({
        id: 'boss',
        x: gameWidth / 2 - GAME_CONFIG.BOSS_WIDTH / 2,
        y: 50,
        hp: difficultyConfig.bossHp,
        maxHp: difficultyConfig.bossHp,
        phase: 'active',
        direction: initialVelX > 0 ? 1 : -1,
      }))

      bossNextFireAtRef.current = Date.now() + 1000
      bossBurstRemainingRef.current = 0
      bossNextBurstShotAtRef.current = 0
      bossBurstCountRef.current = 0

      setTimeout(onBossActivated, 50)
    }, 1500)
  }

  const updateBossCombat = ({ deltaTime, currentTime, onBossDefeated }: UpdateBossCombatParams) => {
    const { setProjectiles, setEnemyProjectiles, setBoss, setScore } = store.getState()
    const bossNow = store.getState().boss
    if (!bossNow || bossNow.phase !== 'active') {
      return
    }

    const now = Date.now()

    if (now >= bossNextFireAtRef.current && bossBurstRemainingRef.current === 0) {
      bossBurstRemainingRef.current = GAME_CONFIG.BOSS_BURST_COUNT
      bossNextBurstShotAtRef.current = now

      const recentBossHits = bossHitsRef.current.filter((hitTime) => now - hitTime < 2000)
      const timeSinceLastBossHit = now - lastBossHitAtRef.current
      const bossFireCooldown = director.getBossFireCooldown({
        baseCooldown: GAME_CONFIG.BOSS_FIRE_COOLDOWN_MS,
        recentBossHits,
        timeSinceLastBossHit,
      })
      bossNextFireAtRef.current = now + bossFireCooldown
      bossBurstCountRef.current += 1
    }

    if (bossBurstRemainingRef.current > 0 && now >= bossNextBurstShotAtRef.current) {
      const currentBoss = store.getState().boss
      if (currentBoss) {
        const centerX = currentBoss.x + GAME_CONFIG.BOSS_WIDTH / 2
        const spawnY = currentBoss.y + GAME_CONFIG.BOSS_HEIGHT - 6
        const baseBossProjectileSpeed = 300
        const isAimedBurst =
          bossBurstCountRef.current % 4 === 0 &&
          bossBurstRemainingRef.current === GAME_CONFIG.BOSS_BURST_COUNT

        if (isAimedBurst) {
          const playerCenterX = playerXRef.current + GAME_CONFIG.PLAYER_WIDTH / 2
          const dx = playerCenterX - centerX
          const maxDistance = gameWidth * 0.5
          const normalizedDx = Math.max(-1, Math.min(1, dx / maxDistance))
          const vx = normalizedDx * 2

          setEnemyProjectiles((prev) => [
            ...prev,
            {
              id: `enemy-proj-${Date.now()}-aimed`,
              x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
              y: spawnY,
              vx,
              vy: baseBossProjectileSpeed,
              isBoss: true,
            },
          ])
        } else {
          setEnemyProjectiles((prev) => [
            ...prev,
            {
              id: `enemy-proj-${Date.now()}-${bossBurstRemainingRef.current}`,
              x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
              y: spawnY,
              vy: baseBossProjectileSpeed,
              isBoss: true,
            },
          ])
        }

        bossBurstRemainingRef.current -= 1
        bossNextBurstShotAtRef.current = now + GAME_CONFIG.BOSS_BURST_GAP_MS
      }
    }

    const bossRect = {
      x: bossNow.x,
      y: bossNow.y,
      w: GAME_CONFIG.BOSS_WIDTH,
      h: GAME_CONFIG.BOSS_HEIGHT,
    }

    setProjectiles((projs) => {
      if (projs.length === 0) {
        return projs
      }

      const remainingProjs = [] as typeof projs
      let bossHits = 0

      for (const proj of projs) {
        const projectileRect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.PROJECTILE_WIDTH,
          h: GAME_CONFIG.PROJECTILE_HEIGHT,
        }

        if (
          projectileRect.x < bossRect.x + bossRect.w &&
          projectileRect.x + projectileRect.w > bossRect.x &&
          projectileRect.y < bossRect.y + bossRect.h &&
          projectileRect.y + projectileRect.h > bossRect.y
        ) {
          bossHits += 1
        } else {
          remainingProjs.push(proj)
        }
      }

      if (bossHits > 0) {
        const hitTimestamp = Date.now()
        bossHitsRef.current.push(hitTimestamp)
        if (bossHitsRef.current.length > 10) {
          bossHitsRef.current = bossHitsRef.current.slice(-10)
        }
        lastBossHitAtRef.current = hitTimestamp

        setBoss((prev) => {
          if (!prev) {
            return null
          }
          const prevHp = prev.hp
          let newHp = prevHp - bossHits
          if (newHp > prevHp) {
            newHp = prevHp
          }
          if (newHp <= 0) {
            setScore((s) => s + Math.floor(100 * difficultyConfig.scoreMultiplier))
            bossNextFireAtRef.current = 0
            bossBurstRemainingRef.current = 0
            onBossDefeated()
            return null
          }
          setScore((s) => s + Math.floor(bossHits * 5 * difficultyConfig.scoreMultiplier))
          return { ...prev, hp: newHp, lastHitAt: hitTimestamp }
        })
      }

      return remainingProjs
    })
  }

  const stepBossMovement = () => {
    const { setBoss } = store.getState()
    setBoss((prev) => {
      if (!prev || prev.phase !== 'active') {
        return prev
      }

      let vx = bossVelocityXRef.current
      let vy = bossVelocityYRef.current
      let newX = prev.x + vx
      let newY = prev.y + vy

      if (newX <= 0) {
        newX = 0
        vx = -vx
      } else if (newX + GAME_CONFIG.BOSS_WIDTH >= gameWidth) {
        newX = gameWidth - GAME_CONFIG.BOSS_WIDTH
        vx = -vx
      }

      if (newY <= 0) {
        newY = 0
        vy = -vy
      } else if (newY + GAME_CONFIG.BOSS_HEIGHT >= gameHeight * 0.6) {
        newY = gameHeight * 0.6 - GAME_CONFIG.BOSS_HEIGHT
        vy = -vy
      }

      bossVelocityXRef.current = vx
      bossVelocityYRef.current = vy

      return {
        ...prev,
        x: newX,
        y: newY,
        direction: vx > 0 ? 1 : -1,
      }
    })
  }

  const resetBossState = () => {
    bossNextFireAtRef.current = 0
    bossBurstRemainingRef.current = 0
    bossNextBurstShotAtRef.current = 0
    bossBurstCountRef.current = 0
    bossHitsRef.current = []
    lastBossHitAtRef.current = 0
  }

  return {
    triggerBoss,
    updateBossCombat,
    stepBossMovement,
    resetBossState,
  }
}
