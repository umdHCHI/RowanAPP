import { GAME_CONFIG } from '@/utils/vantage-constants'
import { THOUGHT_PATTERNS, type ThoughtPattern } from '@/utils/vantage-helpers'
import type { NegativeThought } from '@/types/game'
import type { VantageFormationController, FormationControllerOptions, FormationStepParams } from '@/types/hooks'


export function createVantageFormationController({
  store,
  gameWidth,
  difficultyConfig,
  director,
  formationDirRef,
  projectilesClearedForWaveRef,
  getPlayerY,
  triggerBoss,
}: FormationControllerOptions): VantageFormationController {
  const pendingWaveAdvances = new Set<number>()
  let lastEnemyFireAt = 0
  let nextEnemyFireInMs = 900
  const spawnInvaderWave = (monsterKey: string, waveNumber: number) => {
    const { setNegativeThoughts, setWaveDefeatedPatterns } = store.getState()
    try {
      setWaveDefeatedPatterns(new Set())
      const allPatterns = THOUGHT_PATTERNS.filter((p: ThoughtPattern) => p.monsterKey === monsterKey)
      if (allPatterns.length === 0) {
        console.warn('No available patterns for wave', waveNumber, 'monster:', monsterKey)
        return
      }

      const invaders: NegativeThought[] = []
      const spacingX = GAME_CONFIG.THOUGHT_WIDTH + GAME_CONFIG.INVADER_H_GAP
      const gridWidth = (GAME_CONFIG.INVADERS_COLS - 1) * spacingX + GAME_CONFIG.THOUGHT_WIDTH
      const startX = Math.max(12, (gameWidth - gridWidth) / 2)
      const startY = 60

      for (let row = 0; row < GAME_CONFIG.INVADERS_ROWS; row += 1) {
        for (let col = 0; col < GAME_CONFIG.INVADERS_COLS; col += 1) {
          const index = row * GAME_CONFIG.INVADERS_COLS + col
          const pattern = allPatterns[index % allPatterns.length]
          if (!pattern) {
            continue
          }
          const x = startX + col * spacingX
          const y = startY + row * (GAME_CONFIG.THOUGHT_HEIGHT + GAME_CONFIG.INVADER_V_GAP)
          invaders.push({
            id: `invader-${waveNumber}-${row}-${col}-${Date.now()}`,
            x,
            y,
            speed: 0,
            text: pattern.phrase,
            patternId: pattern.id,
          })
        }
      }

      setNegativeThoughts(invaders)
    } catch (error) {
      console.error('Error spawning invader wave:', error)
    }
  }

  const handleWaveCleared = (wave: number, bossActive: boolean) => {
    const { setProjectiles, setEnemyProjectiles, setWave, setFormationTickMs } = store.getState()
    
    if (projectilesClearedForWaveRef.current !== wave) {
      projectilesClearedForWaveRef.current = wave
      setProjectiles([])
      setEnemyProjectiles([])
    }

    if (pendingWaveAdvances.has(wave)) {
      return
    }
    pendingWaveAdvances.add(wave)

    if (wave < difficultyConfig.wavesBeforeBoss) {
      setTimeout(() => {
        pendingWaveAdvances.delete(wave)
        const nextWave = wave + 1
        setWave(nextWave)
        setFormationTickMs((tick) =>
          Math.max(difficultyConfig.minFormationTickMs, tick * difficultyConfig.formationSpeedupPerClear)
        )
        spawnInvaderWave('void_eater', nextWave)
      }, 1000)
    } else if (!bossActive) {
      pendingWaveAdvances.delete(wave)
      triggerBoss()
    }
  }

  const stepFormation = ({ wave, bossActive, onPlayerDefeated }: FormationStepParams) => {
    const { setNegativeThoughts } = store.getState()
    let waveCleared = false
    let firingEnemy: NegativeThought | null = null

    setNegativeThoughts((prev) => {
      if (prev.length === 0) {
        waveCleared = true
        return prev
      }

      const { horizontal, vertical } = director.getFormationStepMultipliers()
      const scaledStepX = GAME_CONFIG.FORMATION_STEP_X * horizontal
      const scaledStepY = GAME_CONFIG.FORMATION_STEP_Y * vertical

      let minX = Infinity
      let maxX = -Infinity
      prev.forEach((invader) => {
        minX = Math.min(minX, invader.x)
        maxX = Math.max(maxX, invader.x + GAME_CONFIG.THOUGHT_WIDTH)
      })

      const currentDir = formationDirRef.current
      let newDir = currentDir
      let stepDown = false

      if (currentDir === 1 && maxX + scaledStepX >= gameWidth) {
        newDir = -1
        stepDown = true
      } else if (currentDir === -1 && minX - scaledStepX <= 0) {
        newDir = 1
        stepDown = true
      }

      if (stepDown) {
        formationDirRef.current = newDir
      }

      const stepX = stepDown ? 0 : scaledStepX * currentDir
      const stepY = stepDown ? scaledStepY : 0
      const playerY = getPlayerY()

      const willReachPlayer = prev.some(
        (invader) => invader.y + GAME_CONFIG.THOUGHT_HEIGHT + stepY >= playerY
      )

      if (willReachPlayer) {
        onPlayerDefeated()
        return prev
      }

      const nextInvaders = prev.map((invader) => ({
        ...invader,
        x: invader.x + stepX,
        y: invader.y + stepY,
      }))

      if (!bossActive) {
        const now = Date.now()
        if (now - lastEnemyFireAt >= nextEnemyFireInMs) {
          const rowHeightTolerance = GAME_CONFIG.THOUGHT_HEIGHT + GAME_CONFIG.INVADER_V_GAP
          let maxY = -Infinity
          for (const thought of nextInvaders) {
            if (thought.y > maxY) {
              maxY = thought.y
            }
          }
          const bottomRowEnemies = nextInvaders.filter(
            (thought) => Math.abs(thought.y - maxY) <= rowHeightTolerance / 2
          )
          const candidates = bottomRowEnemies.length > 0 ? bottomRowEnemies : nextInvaders
          if (candidates.length > 0) {
            const randomIndex = Math.floor(Math.random() * candidates.length)
            firingEnemy = candidates[randomIndex]
            lastEnemyFireAt = now
            nextEnemyFireInMs = director.getEnemyFireInterval(900 + Math.random() * 500)
          }
        }
      }

      return nextInvaders
    })

    if (waveCleared) {
      handleWaveCleared(wave, bossActive)
    }

    if (firingEnemy) {
      const { setEnemyProjectiles, playerX } = store.getState()
      const baseEnemyProjectileSpeed = 300
      const playerCenterX = playerX + GAME_CONFIG.PLAYER_WIDTH / 2
      const enemyCenterX = firingEnemy.x + GAME_CONFIG.THOUGHT_WIDTH / 2
      const maxDistance = Math.max(120, GAME_CONFIG.THOUGHT_WIDTH * 6)
      const normalizedDx = Math.max(-1, Math.min(1, (playerCenterX - enemyCenterX) / maxDistance))
      const vx = normalizedDx * 120

      setEnemyProjectiles((prev) => [
        ...prev,
        {
          id: `enemy-proj-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          x: enemyCenterX - GAME_CONFIG.ENEMY_PROJECTILE_WIDTH / 2,
          y: firingEnemy.y + GAME_CONFIG.THOUGHT_HEIGHT,
          vx,
          vy: baseEnemyProjectileSpeed,
        },
      ])
    }
  }

  const resetWaveState = () => {
    formationDirRef.current = 1
    projectilesClearedForWaveRef.current = 0
    pendingWaveAdvances.clear()
    lastEnemyFireAt = 0
    nextEnemyFireInMs = 900
  }

  return {
    spawnInvaderWave,
    stepFormation,
    resetWaveState,
  }
}
