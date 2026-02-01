
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
    enemyNextFireAtRef.current = Date.now() + 900 + Math.random() * 500
  }

  const stopEnemyFireLoop = () => {
    enemyNextFireAtRef.current = 0
    enemyFireTimerRef.current = null
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
