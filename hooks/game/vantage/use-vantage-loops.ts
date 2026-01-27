
import { GAME_CONFIG } from '@/utils/vantage-constants'
import type {VantageLoopsOptions, VantageLoopController} from '@/types/hooks'



export function createVantageLoopController({
  store,
  director,
  projectileController,
  collisionEngine,
  formationController,
  bossManager,
  updateFragments,
  fragmentsRef,
  negativeThoughtsRef,
  enemyProjectilesRef,
  powerUpsRef,
  bossRef,
  enemyNextFireAtRef,
  animationFrameRef,
  formationTimerRef,
  enemyFireTimerRef,
  bossFormationTimerRef,
  lastDebugLogRef,
  onBossDefeated,
  onPlayerDefeated,
}: VantageLoopsOptions): VantageLoopController {
  const startGameLoop = () => {
    if (animationFrameRef.current !== null) {
      return
    }

    let lastTime = performance.now()

    const gameLoop = (currentTime: number) => {
      const state = store.getState()
      const { isPlaying, gameOver, gameSpeed, debugHitboxes } = state
      if (!isPlaying || gameOver) {
        stopGameLoop()
        return
      }

      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      const timeScale = director.getTimeScale(fragmentsRef.current.length > 0)
      const deltaSeconds = (deltaTime / 1000) * timeScale

      projectileController.updatePlayerPosition(deltaSeconds)
      projectileController.updateEntities(deltaSeconds, gameSpeed)
      updateFragments(deltaTime)

      const fresh = store.getState()
      negativeThoughtsRef.current = fresh.negativeThoughts
      enemyProjectilesRef.current = fresh.enemyProjectiles
      powerUpsRef.current = fresh.powerUps
      fragmentsRef.current = fresh.fragments
      bossRef.current = fresh.boss

      collisionEngine.checkCollisions(currentTime)
      bossManager.updateBossCombat({ deltaTime, currentTime, onBossDefeated })

      if (debugHitboxes && currentTime - lastDebugLogRef.current >= 1000) {
        console.log('Debug Hitboxes:', {
          projectiles: store.getState().projectiles.length,
          thoughts: store.getState().negativeThoughts.length,
          powerUps: store.getState().powerUps.length,
          bossHp: bossRef.current?.hp,
        })
        lastDebugLogRef.current = currentTime
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  const stopGameLoop = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  const startFormationLoop = () => {
    if (formationTimerRef.current) {
      return
    }

    const formationStep = () => {
      const { isPlaying, gameOver, boss, wave } = store.getState()
      if (!isPlaying || gameOver || boss) {
        stopFormationLoop()
        return
      }

      formationController.stepFormation({
        wave,
        bossActive: Boolean(boss),
        onPlayerDefeated,
      })

      const nextDelay = director.getFormationDelay(store.getState().formationTickMs)
      formationTimerRef.current = setTimeout(formationStep, nextDelay)
    }

    formationTimerRef.current = setTimeout(formationStep, 0)
  }

  const stopFormationLoop = () => {
    if (formationTimerRef.current) {
      clearTimeout(formationTimerRef.current)
      formationTimerRef.current = null
    }
  }

  const startBossFormationLoop = () => {
    if (bossFormationTimerRef.current) {
      return
    }

    const step = () => {
      const { isPlaying, gameOver, boss } = store.getState()
      if (!isPlaying || gameOver || !boss) {
        stopBossFormationLoop()
        return
      }

      bossManager.stepBossMovement()
      bossFormationTimerRef.current = setTimeout(step, 16)
    }

    bossFormationTimerRef.current = setTimeout(step, 16)
  }

  const stopBossFormationLoop = () => {
    if (bossFormationTimerRef.current) {
      clearTimeout(bossFormationTimerRef.current)
      bossFormationTimerRef.current = null
    }
  }

  const startEnemyFireLoop = () => {
    if (enemyFireTimerRef.current) {
      return
    }

    const enemyFireStep = () => {
      const { isPlaying, gameOver, boss } = store.getState()
      if (!isPlaying || gameOver || boss) {
        stopEnemyFireLoop()
        return
      }

      const now = Date.now()
      const thoughtsNow = negativeThoughtsRef.current

      if (thoughtsNow.length === 0) {
        enemyNextFireAtRef.current = now + 100
        enemyFireTimerRef.current = setTimeout(enemyFireStep, 100)
        return
      }

      if (now >= enemyNextFireAtRef.current) {
        const { setEnemyProjectiles } = store.getState()
        const rowHeightTolerance = GAME_CONFIG.THOUGHT_HEIGHT + GAME_CONFIG.INVADER_V_GAP
        let maxY = -Infinity
        for (const thought of thoughtsNow) {
          if (thought.y > maxY) {
            maxY = thought.y
          }
        }

        const bottomRowEnemies = thoughtsNow.filter(
          (thought) => Math.abs(thought.y - maxY) <= rowHeightTolerance / 2
        )

        if (bottomRowEnemies.length > 0) {
          const randomIndex = Math.floor(Math.random() * bottomRowEnemies.length)
          const firingEnemy = bottomRowEnemies[randomIndex]
          const baseEnemyProjectileSpeed = 300

          setEnemyProjectiles((prev) => [
            ...prev,
            {
              id: `enemy-proj-${Date.now()}-${Math.random().toString(36).slice(2)}`,
              x: firingEnemy.x + GAME_CONFIG.THOUGHT_WIDTH / 2 - GAME_CONFIG.ENEMY_PROJECTILE_WIDTH / 2,
              y: firingEnemy.y + GAME_CONFIG.THOUGHT_HEIGHT,
              vy: baseEnemyProjectileSpeed,
            },
          ])
        }

        const baseInterval = 900 + Math.random() * 500
        const adjustedInterval = director.getEnemyFireInterval(baseInterval)
        enemyNextFireAtRef.current = now + adjustedInterval
      }

      enemyFireTimerRef.current = setTimeout(enemyFireStep, 100)
    }

    enemyNextFireAtRef.current = Date.now() + 900 + Math.random() * 500
    enemyFireTimerRef.current = setTimeout(enemyFireStep, 100)
  }

  const stopEnemyFireLoop = () => {
    if (enemyFireTimerRef.current) {
      clearTimeout(enemyFireTimerRef.current)
      enemyFireTimerRef.current = null
    }
  }

  return {
    startGameLoop,
    stopGameLoop,
    startFormationLoop,
    stopFormationLoop,
    startBossFormationLoop,
    stopBossFormationLoop,
    startEnemyFireLoop,
    stopEnemyFireLoop,
  }
}
