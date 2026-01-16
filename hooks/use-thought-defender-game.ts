/**
 * Affective-DDA Loop & Fragment-Based Reframing System
 * 
 * stressSignal (pressureScore): Core input from DDA director, measures player pressure
 *   - Derived from hit frequency, accuracy, and survival window
 *   - High stressSignal = player struggling, needs gentler pacing
 * 
 * emotionalIntensity (EI): EMA-smoothed emotional intensity [0..1]
 *   - Updated every 1s with EMA smoothing (alpha ~0.15)
 *   - Therapeutic window behavior:
 *     * When stressSignal is high: EI trends downward or is capped low
 *     * When stressSignal is low: EI can rise gradually
 *   - Drives wave pacing (spawn rate, movement speed, power-up frequency)
 * 
 * High stressSignal changes:
 *   - Gentler pacing: slower spawns, slower movement, more power-ups
 *   - More wellness fragments: wellnessProbability = 0.35 + 0.40 * stressSignal
 *   - TimeScale slowdown: 0.60 at high stress, 0.85 at low stress (when fragments exist)
 * 
 * Fragment System:
 *   - When negative thought is defeated: spawn 1-3 fragments at enemy position
 *   - Fragments are tappable: wellness fragments log to conqueredThoughts (phrase + counterRecord)
 *   - Negative fragments can be converted to wellness fragments on tap
 *   - Fragments have TTL and fade out
 */

import { useState, useEffect, useRef, type MutableRefObject } from 'react'
import { GAME_CONFIG, DIFFICULTY_CONFIGS, type Difficulty } from '@/utils/vantage-constants'
import { THOUGHT_PATTERNS, type ThoughtPattern } from '@/utils/vantage-helpers'
import type {
  Projectile,
  EnemyProjectile,
  NegativeThought,
  PowerUp,
  PowerUpType,
  Boss,
  ThoughtEcho,
  ConqueredThought,
  Fragment,
} from '@/types/game'

interface UseVantageGameOptions {
  gameWidth: number
  gameHeight: number
  difficulty: Difficulty
  onGameOver: (score: number, won: boolean, bossDefeated: boolean) => void
  ddaMetricsRef?: MutableRefObject<{
    formationTickMultiplier: number // Multiplier for formation tick intervals (lower = faster)
    moveSpeed: number // Velocity multiplier for thoughts and enemy projectiles
    powerUpChance: number // Multiplier for power-up spawn chance
    pressureScore: number // stressSignal for fragment wellness probability
  } | undefined>
}

type Rect = { x: number; y: number; w: number; h: number }

function rectsIntersect(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  )
}

export function useVantageGame({
  gameWidth,
  gameHeight,
  difficulty,
  onGameOver,
  ddaMetricsRef,
}: UseVantageGameOptions) {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty]
  const getPlayerStartX = () => gameWidth / 2 - GAME_CONFIG.PLAYER_WIDTH / 2
  const getPlayerY = () => gameHeight - GAME_CONFIG.PLAYER_BOTTOM_OFFSET - GAME_CONFIG.PLAYER_HEIGHT
  
  const [playerX, setPlayerX] = useState<number>(getPlayerStartX())
  const playerXRef = useRef<number>(getPlayerStartX())
  const targetPlayerXRef = useRef<number>(getPlayerStartX()) // For smooth movement
  const velocityRef = useRef<number>(0)
  const [score, setScore] = useState<number>(GAME_CONFIG.INITIAL_SCORE)
  const [lives, setLives] = useState<number>(difficultyConfig.initialLives)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [enemyProjectiles, setEnemyProjectiles] = useState<EnemyProjectile[]>([])
  const [negativeThoughts, setNegativeThoughts] = useState<NegativeThought[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [boss, setBoss] = useState<Boss | null>(null)
  const [bossIncoming, setBossIncoming] = useState<boolean>(false)
  const [bossTelegraphActive, setBossTelegraphActive] = useState<boolean>(false)
  const [bossTelegraphLabel, setBossTelegraphLabel] = useState<string | undefined>(undefined)
  const [playerLastHitAt, setPlayerLastHitAt] = useState<number>(0)
  const [playerHp, setPlayerHp] = useState<number>(difficultyConfig.initialLives)
  const [playerIFrameUntil, setPlayerIFrameUntil] = useState<number>(0)
  const [gameSpeed, setGameSpeed] = useState<number>(GAME_CONFIG.DEFAULT_GAME_SPEED)
  const [multishotActive, setMultishotActive] = useState(false)
  const [fastShootActive, setFastShootActive] = useState(false)
  const [shieldActive, setShieldActive] = useState(false)
  const [debugHitboxes, setDebugHitboxes] = useState(false)
  const [thoughtEchoes, setThoughtEchoes] = useState<ThoughtEcho[]>([])
  const [conqueredThoughts, setConqueredThoughts] = useState<ConqueredThought[]>([])
  const [fragments, setFragments] = useState<Fragment[]>([])

  // DDA tracking
  const projectilesSpawnedRef = useRef<number>(0)
  const thoughtsDestroyedRef = useRef<number>(0)
  
  // Fragment TTL tracking
  const fragmentTTLRef = useRef<Map<string, number>>(new Map())

  // Formation state (Space Invaders style)
  const [formationDir, setFormationDir] = useState<1 | -1>(1)
  const [formationTickMs, setFormationTickMs] = useState<number>(difficultyConfig.formationTickMs)
  const [wave, setWave] = useState(1)
  const [waveDefeatedPatterns, setWaveDefeatedPatterns] = useState<Set<string>>(new Set())

  const animationFrameRef = useRef<number | null>(null)
  const defeatedThoughtIdsRef = useRef<Set<string>>(new Set())
  const lastShotAtRef = useRef<number>(0)
  const gameStartTimeRef = useRef<number>(0)
  const formationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const bossAttackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const powerUpTimersRef = useRef<Map<PowerUpType, NodeJS.Timeout>>(new Map())
  const bossFormationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const bossNextFireAtRef = useRef<number>(0)
  const bossBurstRemainingRef = useRef<number>(0)
  const bossNextBurstShotAtRef = useRef<number>(0)
  const bossBurstCountRef = useRef<number>(0) // Track burst count for aimed shots
  const headerPressCountRef = useRef<number>(0)
  const headerPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastDebugLogRef = useRef<number>(0)
  const enemyFireTimerRef = useRef<NodeJS.Timeout | null>(null)
  const enemyNextFireAtRef = useRef<number>(0)
  const thoughtEchoTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const thoughtEchoCooldownRef = useRef<Map<string, number>>(new Map()) // text -> lastSpawnAt

  // Refs for latest state (prevents stale closures in collision checks)
  const negativeThoughtsRef = useRef<NegativeThought[]>([])
  const projectilesRef = useRef<Projectile[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const bossRef = useRef<Boss | null>(null)
  const shieldActiveRef = useRef<boolean>(false)
  const fragmentsRef = useRef<Fragment[]>([])
  const thoughtEchoesRef = useRef<ThoughtEcho[]>([])

  // Sync refs with state
  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  // Update player position when game dimensions change
  useEffect(() => {
    if (gameWidth > 0 && gameHeight > 0) {
      const newX = getPlayerStartX()
      playerXRef.current = newX
      targetPlayerXRef.current = newX
      setPlayerX(newX)
    }
  }, [gameWidth, gameHeight])

  useEffect(() => {
    negativeThoughtsRef.current = negativeThoughts
  }, [negativeThoughts])

  useEffect(() => {
    projectilesRef.current = projectiles
  }, [projectiles])

  useEffect(() => {
    powerUpsRef.current = powerUps
  }, [powerUps])

  useEffect(() => {
    bossRef.current = boss
  }, [boss])

  useEffect(() => {
    shieldActiveRef.current = shieldActive
  }, [shieldActive])

  useEffect(() => {
    fragmentsRef.current = fragments
  }, [fragments])

  useEffect(() => {
    thoughtEchoesRef.current = thoughtEchoes
  }, [thoughtEchoes])

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (isPlaying && !gameOver) {
      startGameLoop()
      startFormationLoop()
      startEnemyFireLoop()
    } else {
      stopGameLoop()
      stopFormationLoop()
      stopBossFormationLoop()
      stopEnemyFireLoop()
    }

    return () => {
      stopGameLoop()
      stopFormationLoop()
      stopBossFormationLoop()
      stopEnemyFireLoop()
    }
  }, [isPlaying, gameOver, formationTickMs])

  function startGameLoop() {
    if (animationFrameRef.current !== null) return

    let lastTime = performance.now()

    function gameLoop(currentTime: number) {
      if (!isPlaying || gameOver) {
        stopGameLoop()
        return
      }

      const deltaTime = currentTime - lastTime
      lastTime = currentTime
      
      // Apply timeScale when fragments exist (gentler under stress)
      const stressSignal = ddaMetricsRef?.current?.pressureScore ?? 0.5
      const hasFragments = fragmentsRef.current.length > 0
      const timeScale = hasFragments
        ? 0.85 - (stressSignal * 0.25) // 0.85 at low stress, 0.60 at high stress
        : 1.0
      
      const deltaSeconds = (deltaTime / 1000) * timeScale

      // Update player position based on velocity (for arrow buttons)
      if (velocityRef.current !== 0) {
        const newX = playerXRef.current + velocityRef.current * deltaSeconds
        const clampedX = Math.max(
          0,
          Math.min(gameWidth - GAME_CONFIG.PLAYER_WIDTH, newX)
        )
        playerXRef.current = clampedX
        targetPlayerXRef.current = clampedX
        setPlayerX(clampedX)
      } else {
        // Smooth interpolation for gesture-based movement
        const currentX = playerXRef.current
        const targetX = targetPlayerXRef.current
        if (Math.abs(currentX - targetX) > 0.5) {
          // Lerp with 0.35 factor for smooth following
          const lerpFactor = 0.35
          const newX = currentX + (targetX - currentX) * lerpFactor
          const clampedX = Math.max(
            0,
            Math.min(gameWidth - GAME_CONFIG.PLAYER_WIDTH, newX)
          )
          playerXRef.current = clampedX
          setPlayerX(clampedX)
        }
      }

      // Move projectiles up
      setProjectiles((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y - GAME_CONFIG.PROJECTILE_SPEED * gameSpeed * deltaSeconds,
          }))
          .filter((p) => p.y > -GAME_CONFIG.PROJECTILE_HEIGHT)
      )

      // Move enemy projectiles down (with optional horizontal movement)
      // Note: vy already includes moveSpeedMultiplier from spawn time, so don't multiply again
      setEnemyProjectiles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + (p.vx ?? 0) * gameSpeed * deltaSeconds,
            y: p.y + p.vy * gameSpeed * deltaSeconds,
          }))
          .filter((p) => p.y < gameHeight + 40 && p.x > -40 && p.x < gameWidth + 40)
      )

      // Move falling thoughts (from boss attacks) down
      // Apply DDA moveSpeed multiplier if available
      const moveSpeedMultiplier = ddaMetricsRef?.current?.moveSpeed ?? 1
      setNegativeThoughts((prev) =>
        prev.map((thought) => {
          // Only move thoughts that have speed > 0 (falling thoughts from boss)
          if (thought.speed > 0) {
            return {
              ...thought,
              y: thought.y + thought.speed * gameSpeed * moveSpeedMultiplier * deltaSeconds,
            }
          }
          return thought // Formation invaders don't move here
        }).filter((thought) => {
          // Remove falling thoughts that go off screen, keep formation invaders
          if (thought.speed > 0) {
            return thought.y < gameHeight + 100
          }
          return true
        })
      )

      // Move power-ups down
      setPowerUps((prev) =>
        prev
          .map((p) => ({
            ...p,
            y: p.y + GAME_CONFIG.POWERUP_SPEED * gameSpeed * deltaSeconds,
          }))
          .filter((p) => p.y < gameHeight + 100)
      )

      // Update fragments (TTL and removal)
      updateFragments(deltaTime)

      // Check collisions first (may update boss HP)
      checkCollisions()

      // Update boss attacks (only during boss phase) - movement handled by formation loop
      // Runs after collisions so phase is accurate
      updateBossCombat(deltaTime, currentTime)

      // Debug logging (throttled to 1s)
      if (debugHitboxes && currentTime - lastDebugLogRef.current >= 1000) {
        console.log('Debug Hitboxes:', {
          projectiles: projectilesRef.current.length,
          thoughts: negativeThoughtsRef.current.length,
          powerUps: powerUpsRef.current.length,
          bossHp: bossRef.current?.hp,
        })
        lastDebugLogRef.current = currentTime
      }

      // Check wave completion and boss trigger (handled in formation loop)

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }

  function stopGameLoop() {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  function getAvailableThoughtPatternsForWave(monsterKey: string, waveNumber: number): ThoughtPattern[] {
    // Get all patterns for this monster
    const allPatterns = THOUGHT_PATTERNS.filter((p: ThoughtPattern) => p.monsterKey === monsterKey)
    
    // For this wave, exclude patterns already used in this wave
    const availableForWave = allPatterns.filter(
      (pattern: ThoughtPattern) => !waveDefeatedPatterns.has(pattern.id)
    )

    return availableForWave
  }

  function spawnInvaderWave(monsterKey: string, waveNumber: number) {
    try {
      const availablePatterns = getAvailableThoughtPatternsForWave(monsterKey, waveNumber)
      
      // Safety check: if no patterns available, don't crash
      if (availablePatterns.length === 0) {
        console.warn('No available patterns for wave', waveNumber)
        return
      }

      const totalInvaders = GAME_CONFIG.INVADERS_ROWS * GAME_CONFIG.INVADERS_COLS
      const invaders: NegativeThought[] = []

      // Reset wave defeated patterns for new wave
      setWaveDefeatedPatterns(new Set())

      // Center the formation horizontally
      const spacingX = GAME_CONFIG.THOUGHT_WIDTH + GAME_CONFIG.INVADER_H_GAP
      const gridWidth = (GAME_CONFIG.INVADERS_COLS - 1) * spacingX + GAME_CONFIG.THOUGHT_WIDTH
      const startX = Math.max(12, (gameWidth - gridWidth) / 2) // Center with minimum 12px padding
      const startY = 60 // Start near top of playfield

      for (let row = 0; row < GAME_CONFIG.INVADERS_ROWS; row++) {
        for (let col = 0; col < GAME_CONFIG.INVADERS_COLS; col++) {
          const index = row * GAME_CONFIG.INVADERS_COLS + col
          const pattern = availablePatterns[index % availablePatterns.length]

          if (pattern) {
            const x = startX + col * spacingX
            const y = startY + row * (GAME_CONFIG.THOUGHT_HEIGHT + GAME_CONFIG.INVADER_V_GAP)

            invaders.push({
              id: `invader-${waveNumber}-${row}-${col}-${Date.now()}`,
              x,
              y,
              speed: 0, // Not used in formation mode
              text: pattern.phrase,
              patternId: pattern.id,
            })
          }
        }
      }

      setNegativeThoughts(invaders)
    } catch (error) {
      console.error('Error spawning invader wave:', error)
    }
  }

  function startFormationLoop() {
    if (formationTimerRef.current) return

    function formationStep() {
      if (!isPlaying || gameOver || boss) {
        stopFormationLoop()
        return
      }

      setNegativeThoughts((prev) => {
        if (prev.length === 0) {
          // Wave cleared - check for next wave or boss
          // Only trigger boss if boss doesn't already exist
          if (wave < difficultyConfig.wavesBeforeBoss) {
            // Next wave
            setTimeout(() => {
              const nextWave = wave + 1
              setWave(nextWave)
              setFormationTickMs((tick) =>
                Math.max(
                  difficultyConfig.minFormationTickMs,
                  tick * difficultyConfig.formationSpeedupPerClear
                )
              )
              spawnInvaderWave('void_eater', nextWave)
            }, 1000) // Brief pause between waves
          } else if (!bossRef.current) {
            // Trigger boss only if it doesn't exist
            triggerBoss()
          }
          return prev
        }

        // Apply DDA to formation step sizes (calculate before wall checks)
        const ddaStressSignal = ddaMetricsRef?.current?.pressureScore ?? 0.5
        const ddaMoveSpeed = ddaMetricsRef?.current?.moveSpeed ?? 1.0
        
        // Formation horizontal speed multiplier
        const formationSpeedMultiplier = ddaMoveSpeed < 1.0 
          ? 0.5 + (ddaMoveSpeed * 0.4) // When slowed, scale 0.5-0.9
          : 1.0 + ((ddaMoveSpeed - 1.0) * 0.3) // When sped up, scale 1.0-1.18
        
        // DDA stepY multiplier: directly scale vertical movement based on pressureScore
        // High pressureScore (>0.7): slower downward movement (0.65x)
        // Low pressureScore (<0.3): faster downward movement (1.05x)
        let stepYMultiplier = 1.0
        if (ddaStressSignal > 0.7) {
          stepYMultiplier = 0.65 // Much slower when struggling
        } else if (ddaStressSignal < 0.3) {
          stepYMultiplier = 1.05 // Slightly faster when doing well
        }
        
        // Calculate scaled step sizes
        const scaledStepX = GAME_CONFIG.FORMATION_STEP_X * formationSpeedMultiplier
        const scaledStepY = GAME_CONFIG.FORMATION_STEP_Y * stepYMultiplier

        // Calculate formation bounds
        let minX = Infinity
        let maxX = -Infinity

        prev.forEach((invader) => {
          minX = Math.min(minX, invader.x)
          maxX = Math.max(maxX, invader.x + GAME_CONFIG.THOUGHT_WIDTH)
        })

        const currentDir = formationDir
        let newDir = currentDir
        let stepDown = false

        // Check if formation hits wall (using scaled step size)
        if (currentDir === 1 && maxX + scaledStepX >= gameWidth) {
          newDir = -1
          stepDown = true
        } else if (currentDir === -1 && minX - scaledStepX <= 0) {
          newDir = 1
          stepDown = true
        }

        if (stepDown) {
          setFormationDir(newDir)
        }

        // Move formation with DDA-scaled step sizes
        const stepX = stepDown 
          ? 0 
          : scaledStepX * currentDir
        const stepY = stepDown 
          ? scaledStepY
          : 0

        const playerY = getPlayerY()

        // Check lose condition (formation reached player)
        const willReachPlayer = prev.some(
          (invader) => invader.y + GAME_CONFIG.THOUGHT_HEIGHT + stepY >= playerY
        )

        if (willReachPlayer) {
          endGame(false, false)
          return prev
        }

        // Update positions
        return prev.map((invader) => ({
          ...invader,
          x: invader.x + stepX,
          y: invader.y + stepY,
        }))
      })

      // Apply DDA formationTickMultiplier: lower = faster spawns (lower tick interval)
      const formationTickMultiplier = ddaMetricsRef?.current?.formationTickMultiplier ?? 1.0
      const ddaAdjustedTick = formationTickMs * formationTickMultiplier
      formationTimerRef.current = setTimeout(formationStep, ddaAdjustedTick)
    }

    formationStep()
  }

  function stopFormationLoop() {
    if (formationTimerRef.current) {
      clearTimeout(formationTimerRef.current)
      formationTimerRef.current = null
    }
  }

  function triggerBoss() {
    setBossIncoming(true)
    setTimeout(() => {
      setBossIncoming(false)
      const newBoss: Boss = {
        id: 'boss',
        x: gameWidth / 2 - GAME_CONFIG.BOSS_WIDTH / 2,
        y: 50,
        hp: difficultyConfig.bossHp,
        maxHp: difficultyConfig.bossHp,
        phase: 'active',
        direction: 1, // For Space Invaders movement
      }
      setBoss(newBoss)
      // Initialize boss combat state
      bossNextFireAtRef.current = Date.now() + 1000 // First attack after 1 second
      bossBurstRemainingRef.current = 0
      bossNextBurstShotAtRef.current = 0
      bossBurstCountRef.current = 0
      // Start boss movement loop (Space Invaders style)
      startBossFormationLoop()
    }, 1500)
  }

  function startBossFormationLoop() {
    if (bossFormationTimerRef.current) return

    function bossFormationStep() {
      if (!isPlaying || gameOver) {
        stopBossFormationLoop()
        return
      }

      setBoss((prev) => {
        if (!prev || prev.phase !== 'active') return prev

        const currentDir = prev.direction || 1
        let newX = prev.x + GAME_CONFIG.BOSS_SPEED * currentDir
        let newDir = currentDir
        let newY = prev.y

        // Check if boss hits wall - bounce and step down
        if (newX + GAME_CONFIG.BOSS_WIDTH >= gameWidth) {
          newX = gameWidth - GAME_CONFIG.BOSS_WIDTH
          newDir = -1
          newY = Math.min(prev.y + GAME_CONFIG.BOSS_STEP_DOWN, gameHeight * 0.45)
        } else if (newX <= 0) {
          newX = 0
          newDir = 1
          newY = Math.min(prev.y + GAME_CONFIG.BOSS_STEP_DOWN, gameHeight * 0.45)
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          direction: newDir,
        }
      })

      bossFormationTimerRef.current = setTimeout(bossFormationStep, formationTickMs * 0.8) // Faster than formation
    }

    bossFormationStep()
  }

  function stopBossFormationLoop() {
    if (bossFormationTimerRef.current) {
      clearTimeout(bossFormationTimerRef.current)
      bossFormationTimerRef.current = null
    }
  }

  function startEnemyFireLoop() {
    if (enemyFireTimerRef.current) return
    
    // Initialize first fire time
    const baseInterval = 900 + Math.random() * 500 // 900-1400ms
    enemyNextFireAtRef.current = Date.now() + baseInterval
    
    function enemyFireStep() {
      if (!isPlaying || gameOver || boss) {
        stopEnemyFireLoop()
        return
      }
      
      const now = Date.now()
      const thoughtsNow = negativeThoughtsRef.current
      
      if (thoughtsNow.length === 0) {
        // No enemies, schedule next check
        enemyNextFireAtRef.current = now + 1000
        enemyFireTimerRef.current = setTimeout(enemyFireStep, 1000)
        return
      }
      
      // Check if it's time to fire
      if (now >= enemyNextFireAtRef.current) {
        // Find bottom-most enemy (lowest y value = closest to player)
        let bottomEnemy: NegativeThought | null = null
        let lowestY = -Infinity
        
        for (const thought of thoughtsNow) {
          if (thought.y > lowestY) {
            lowestY = thought.y
            bottomEnemy = thought
          }
        }
        
        if (bottomEnemy) {
          // Spawn enemy projectile from bottom-most enemy
          // Use pixels per second (similar to player projectiles at 400)
          const enemyProjectileSpeed = 300 // pixels per second (slightly slower than player projectiles)
          const moveSpeedMultiplier = ddaMetricsRef?.current?.moveSpeed ?? 1.0
          const projectileSpeed = enemyProjectileSpeed * moveSpeedMultiplier
          
          const enemyProjectile: EnemyProjectile = {
            id: `enemy-proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: bottomEnemy.x + GAME_CONFIG.THOUGHT_WIDTH / 2 - GAME_CONFIG.ENEMY_PROJECTILE_WIDTH / 2,
            y: bottomEnemy.y + GAME_CONFIG.THOUGHT_HEIGHT,
            vy: projectileSpeed,
          }
          
          setEnemyProjectiles((prev) => [...prev, enemyProjectile])
        }
        
        // Schedule next fire (with DDA scaling)
        const stressSignal = ddaMetricsRef?.current?.pressureScore ?? 0.5
        let intervalMultiplier = 1.0
        if (stressSignal > 0.7) {
          // High stress: longer interval (gentler)
          intervalMultiplier = 1.3
        } else if (stressSignal < 0.3) {
          // Low stress: shorter interval (more intense)
          intervalMultiplier = 0.8
        }
        
        const baseInterval = (900 + Math.random() * 500) * intervalMultiplier
        enemyNextFireAtRef.current = now + baseInterval
      }
      
      // Schedule next check (check every 100ms)
      enemyFireTimerRef.current = setTimeout(enemyFireStep, 100)
    }
    
    enemyFireStep()
  }

  function stopEnemyFireLoop() {
    if (enemyFireTimerRef.current) {
      clearTimeout(enemyFireTimerRef.current)
      enemyFireTimerRef.current = null
    }
  }

  // Boss firing - Space Invaders style bursts
  function updateBossCombat(deltaTime: number, currentTime: number) {
    const bossNow = bossRef.current
    if (!bossNow || bossNow.phase !== 'active') return

    const now = Date.now()

    // Start a new burst if cooldown is ready and no burst is active
    if (now >= bossNextFireAtRef.current && bossBurstRemainingRef.current === 0) {
      bossBurstRemainingRef.current = GAME_CONFIG.BOSS_BURST_COUNT
      bossNextBurstShotAtRef.current = now
      bossNextFireAtRef.current = now + GAME_CONFIG.BOSS_FIRE_COOLDOWN_MS
      bossBurstCountRef.current += 1
    }

    // Fire shots in the burst
    if (bossBurstRemainingRef.current > 0 && now >= bossNextBurstShotAtRef.current) {
      const currentBoss = bossRef.current
      if (currentBoss) {
        const centerX = currentBoss.x + GAME_CONFIG.BOSS_WIDTH / 2
        const spawnY = currentBoss.y + GAME_CONFIG.BOSS_HEIGHT - 6

        // Every 4th burst, fire an aimed shot instead
        const isAimedBurst = bossBurstCountRef.current % 4 === 0 && bossBurstRemainingRef.current === GAME_CONFIG.BOSS_BURST_COUNT

        if (isAimedBurst) {
          // Aimed shot at player
          const playerCenterX = playerXRef.current + GAME_CONFIG.PLAYER_WIDTH / 2
          const dx = playerCenterX - centerX
          const maxDistance = gameWidth * 0.5
          const normalizedDx = Math.max(-1, Math.min(1, dx / maxDistance))
          const vx = normalizedDx * 2.0 // Clamp between -2 and 2

          const enemyProjectile: EnemyProjectile = {
            id: `enemy-proj-${Date.now()}-aimed`,
            x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
            y: spawnY,
            vx,
            vy: 300, // pixels per second (consistent with regular enemy projectiles)
          }
          setEnemyProjectiles((prev) => [...prev, enemyProjectile])
        } else {
          // Regular downward shot
          const enemyProjectile: EnemyProjectile = {
            id: `enemy-proj-${Date.now()}-${bossBurstRemainingRef.current}`,
            x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
            y: spawnY,
            vy: 300, // pixels per second (consistent with regular enemy projectiles)
          }
          setEnemyProjectiles((prev) => [...prev, enemyProjectile])
        }

        bossBurstRemainingRef.current -= 1
        bossNextBurstShotAtRef.current = now + GAME_CONFIG.BOSS_BURST_GAP_MS
      }
    }
  }

  function checkCollisions() {
    const currentPlayerX = playerXRef.current
    const currentPlayerY = getPlayerY()

    const playerRect: Rect = {
      x: currentPlayerX,
      y: currentPlayerY,
      w: GAME_CONFIG.PLAYER_WIDTH,
      h: GAME_CONFIG.PLAYER_HEIGHT,
    }

    // Snapshot latest state from refs (prevents stale closure bugs)
    const thoughtsNow = negativeThoughtsRef.current
    const bossNow = bossRef.current
    const powerUpsNow = powerUpsRef.current

    // --- 1) Projectiles vs negative thoughts ---
    setProjectiles((projs) => {
      if (projs.length === 0 || thoughtsNow.length === 0) return projs

      const hitThoughtIds = new Set<string>()
      const remainingProjs: Projectile[] = []

      for (const proj of projs) {
        const projectileRect: Rect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.PROJECTILE_WIDTH,
          h: GAME_CONFIG.PROJECTILE_HEIGHT,
        }

        let hit = false
        for (const thought of thoughtsNow) {
          if (hitThoughtIds.has(thought.id)) continue

          const thoughtRect: Rect = {
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

        if (!hit) remainingProjs.push(proj)
      }

      if (hitThoughtIds.size > 0) {
        // Track destroyed thoughts for DDA
        thoughtsDestroyedRef.current += hitThoughtIds.size

        // Spawn fragments only on meaningful events (wellness fragment events)
        // Only spawn when a wellness fragment would be created (not for every kill)
        const destroyedThoughts = thoughtsNow.filter((t) => hitThoughtIds.has(t.id))
        
        // Check if any destroyed thought should spawn a wellness fragment
        destroyedThoughts.forEach((thought) => {
          const stressSignal = ddaMetricsRef?.current?.pressureScore ?? 0.5
          const wellnessProbability = 0.35 + 0.40 * stressSignal
          
          // Fragments disabled - removed from game
          // if (Math.random() < wellnessProbability * 0.3) {
          //   spawnFragments(thought)
          // }

          // Track conquered thought if it has a pattern (legacy - now handled by fragment taps)
          // Keep this for backwards compatibility but fragments are the primary mechanism
          if (thought.patternId && !defeatedThoughtIdsRef.current.has(thought.patternId)) {
            defeatedThoughtIdsRef.current.add(thought.patternId)
            setWaveDefeatedPatterns((prev) => new Set([...prev, thought.patternId!]))
          }

          // Spawn powerup from defeated invader (based on difficulty + DDA)
          const powerUpSpawnChance = difficultyConfig.powerUpSpawnChance * (ddaMetricsRef?.current?.powerUpChance ?? 1)
          if (thought.speed === 0 && Math.random() < powerUpSpawnChance) {
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
              type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)] as PowerUpType,
            }
            setPowerUps((prev) => [...prev, newPowerUp])
          }
        })

        // Remove thoughts that were hit (use functional update, no stale array)
        setNegativeThoughts((prev) => prev.filter((t) => !hitThoughtIds.has(t.id)))
        // Score once per destroyed thought (with difficulty multiplier)
        setScore((s) => s + Math.floor(hitThoughtIds.size * GAME_CONFIG.SCORE_PER_HIT * difficultyConfig.scoreMultiplier))
      }

      return remainingProjs
    })

    // --- 2) Projectiles vs boss ---
    // Use bossRef snapshot for hit test, then setBoss functional update for HP.
    if (bossNow && bossNow.phase === 'active') {
      const bossRect: Rect = {
        x: bossNow.x,
        y: bossNow.y,
        w: GAME_CONFIG.BOSS_WIDTH,
        h: GAME_CONFIG.BOSS_HEIGHT,
      }

      setProjectiles((projs) => {
        if (projs.length === 0) return projs

        const remainingProjs: Projectile[] = []
        let bossHits = 0

        for (const proj of projs) {
          const projectileRect: Rect = {
            x: proj.x,
            y: proj.y,
            w: GAME_CONFIG.PROJECTILE_WIDTH,
            h: GAME_CONFIG.PROJECTILE_HEIGHT,
          }

          if (rectsIntersect(projectileRect, bossRect)) {
            bossHits += 1
          } else {
            remainingProjs.push(proj)
          }
        }

        if (bossHits > 0) {
          const hitTimestamp = Date.now()
          setBoss((prev) => {
            if (!prev) return null
            const prevHp = prev.hp
            let newHp = prevHp - bossHits
            
            // CRITICAL: Guard against any healing - HP can only go down
            if (newHp > prevHp) {
              newHp = prevHp
            }
            
            if (newHp <= 0) {
              setScore((s) => s + Math.floor(100 * difficultyConfig.scoreMultiplier))
              // Stop boss firing and movement
              stopBossFormationLoop()
              bossNextFireAtRef.current = 0
              bossBurstRemainingRef.current = 0
              setTimeout(() => endGame(true, true), 500)
              return null
            }
            return { ...prev, hp: newHp, lastHitAt: hitTimestamp }
          })
          // Small score per boss hit (with difficulty multiplier)
          setScore((s) => s + Math.floor(bossHits * 5 * difficultyConfig.scoreMultiplier))
        }

        return remainingProjs
      })
    }

    // --- 3) Player vs negative thoughts + thoughts reaching bottom ---
    // Do this in ONE setNegativeThoughts pass so we do not multi-hit in a single frame.
    setNegativeThoughts((prev) => {
      if (prev.length === 0) return prev

      let hitsOnPlayer = 0
      let bottomHits = 0

      const remaining = prev.filter((thought) => {
        const thoughtRect: Rect = {
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
        // Apply hits sequentially so shield only blocks one, same as your prior intent.
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

    // --- 4) Enemy projectiles vs player ---
    const now = Date.now()
    setEnemyProjectiles((prev) => {
      if (prev.length === 0) return prev

      const remaining: EnemyProjectile[] = []

      for (const proj of prev) {
        const projectileRect: Rect = {
          x: proj.x,
          y: proj.y,
          w: GAME_CONFIG.ENEMY_PROJECTILE_WIDTH,
          h: GAME_CONFIG.ENEMY_PROJECTILE_HEIGHT,
        }

        if (rectsIntersect(playerRect, projectileRect)) {
          // Hit player - always consume projectile
          if (shieldActiveRef.current) {
            shieldActiveRef.current = false
            setShieldActive(false)
            // Projectile is consumed, don't add to remaining
          } else if (now >= playerIFrameUntil) {
            // Only apply damage if not in iFrames
            handlePlayerHit()
            // Projectile is consumed, don't add to remaining
          } else {
            // In iFrames - projectile still consumed but no damage
            // Projectile is consumed, don't add to remaining
          }
        } else {
          remaining.push(proj)
        }
      }

      return remaining
    })

    // --- 5) Player vs power-ups ---
    // Make pickup deterministic and always based on the current playerRect.
    setPowerUps((prev) => {
      if (prev.length === 0) return prev

      const remaining: PowerUp[] = []
      const collected: PowerUp[] = []

      for (const powerUp of prev) {
        // Drop if beyond bottom
        if (powerUp.y >= gameHeight) continue

        const powerUpRect: Rect = {
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
        // Small score for pickup (once per pickup, with difficulty multiplier)
        setScore((s) => s + Math.floor(collected.length * 5 * difficultyConfig.scoreMultiplier))
        collected.forEach((p) => handlePowerUp(p.type))
      }

      return remaining
    })
  }

  function handlePlayerHit() {
    const now = Date.now()
    
    // Check iFrames - ignore damage if still invulnerable
    if (now < playerIFrameUntil) {
      return
    }
    
    if (shieldActiveRef.current) {
      shieldActiveRef.current = false
      setShieldActive(false)
      return
    }

    // Fragments disabled - removed from game
    // spawnHitFragment()

    // Apply damage
    setPlayerHp((hp) => {
      const newHp = hp - 1
      if (newHp <= 0) {
        endGame(false, false)
        return 0
      }
      // Set iFrames and hit flash only when damage applies
      setPlayerIFrameUntil(now + 900)
      setPlayerLastHitAt(now)
      return newHp
    })
    
    // Also update lives for compatibility
    setLives((l) => {
      if (l <= 1) {
        endGame(false, false)
        return 0
      }
      return l - 1
    })
  }

  function handlePowerUp(type: PowerUpType) {
    const existingTimer = powerUpTimersRef.current.get(type)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    switch (type) {
      case 'extraLife':
        setLives((l) => l + 1)
        break

      case 'slowTime':
        setGameSpeed(GAME_CONFIG.SLOW_TIME_SPEED_MULTIPLIER)
        const slowTimer = setTimeout(() => {
          setGameSpeed(GAME_CONFIG.DEFAULT_GAME_SPEED)
          powerUpTimersRef.current.delete('slowTime')
        }, GAME_CONFIG.SLOW_TIME_DURATION)
        powerUpTimersRef.current.set('slowTime', slowTimer)
        break

      case 'fastShoot':
        setFastShootActive(true)
        const fastTimer = setTimeout(() => {
          setFastShootActive(false)
          powerUpTimersRef.current.delete('fastShoot')
        }, GAME_CONFIG.FAST_SHOOT_DURATION)
        powerUpTimersRef.current.set('fastShoot', fastTimer)
        break

      case 'multishot':
        setMultishotActive(true)
        const multiTimer = setTimeout(() => {
          setMultishotActive(false)
          powerUpTimersRef.current.delete('multishot')
        }, GAME_CONFIG.MULTISHOT_DURATION)
        powerUpTimersRef.current.set('multishot', multiTimer)
        break

      case 'multiplier':
        setScore((s) => s + Math.floor(GAME_CONFIG.SCORE_MULTIPLIER_BONUS * difficultyConfig.scoreMultiplier))
        break

      case 'shield':
        setShieldActive(true)
        const shieldTimer = setTimeout(() => {
          setShieldActive(false)
          powerUpTimersRef.current.delete('shield')
        }, GAME_CONFIG.SHIELD_DURATION)
        powerUpTimersRef.current.set('shield', shieldTimer)
        break
    }
  }

  function shoot() {
    if (!isPlaying || gameOver) return false

    const now = performance.now()
    const cooldown = fastShootActive
      ? GAME_CONFIG.FAST_SHOOT_COOLDOWN
      : GAME_CONFIG.SHOOT_COOLDOWN

    if (now - lastShotAtRef.current < cooldown) return false

    lastShotAtRef.current = now

    const currentPlayerY = getPlayerY()
    
    if (multishotActive) {
      const centerX = playerXRef.current + GAME_CONFIG.PLAYER_WIDTH / 2
      const newProjectiles: Projectile[] = [
        {
          id: `proj-${Date.now()}-0`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2 - 15,
          y: currentPlayerY,
        },
        {
          id: `proj-${Date.now()}-1`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
          y: currentPlayerY,
        },
        {
          id: `proj-${Date.now()}-2`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2 + 15,
          y: currentPlayerY,
        },
      ]
      projectilesSpawnedRef.current += newProjectiles.length
      setProjectiles((prev) => [...prev, ...newProjectiles])
    } else {
      // Only shoot if no projectiles on screen (limit to 1)
      setProjectiles((prev) => {
        if (prev.length >= 1) return prev
        projectilesSpawnedRef.current += 1
        const newProjectile: Projectile = {
          id: `proj-${Date.now()}`,
          x:
            playerXRef.current +
            GAME_CONFIG.PLAYER_WIDTH / 2 -
            GAME_CONFIG.PROJECTILE_WIDTH / 2,
          y: currentPlayerY,
        }
        return [...prev, newProjectile]
      })
    }
    
    return true
  }

  // Exposed functions for gesture controls
  function setPlayerXFromInput(x: number) {
    if (!isPlaying || gameOver) return
    
    // Clamp x to bounds (x is touch position, need to center player on it)
    const clampedX = Math.max(
      0,
      Math.min(gameWidth - GAME_CONFIG.PLAYER_WIDTH, x - GAME_CONFIG.PLAYER_WIDTH / 2)
    )
    targetPlayerXRef.current = clampedX
    // Update immediately for responsiveness, lerp will smooth it
    playerXRef.current = clampedX
    setPlayerX(clampedX)
  }

  function tryShoot() {
    return shoot()
  }

  function setVelocity(velocity: number) {
    velocityRef.current = velocity
  }

  function toggleDebugHitboxes() {
    setDebugHitboxes((prev) => !prev)
  }

  function handleHeaderPress() {
    headerPressCountRef.current += 1
    if (headerPressTimerRef.current) {
      clearTimeout(headerPressTimerRef.current)
    }
    headerPressTimerRef.current = setTimeout(() => {
      if (headerPressCountRef.current >= 3) {
        toggleDebugHitboxes()
      }
      headerPressCountRef.current = 0
    }, 500)
  }


  // Fragment spawn cooldowns
  const fragmentGlobalCooldownRef = useRef<number>(0) // Last spawn time
  const fragmentPhraseCooldownRef = useRef<Map<string, number>>(new Map()) // phrase -> lastSpawnAt

  function spawnFragments(thought: NegativeThought) {
    const now = Date.now()
    
    // Hard cap: max 2 fragments visible at once
    if (fragments.length >= 2) {
      return
    }
    
    // Global cooldown: do not spawn more often than once every 700ms
    if (now - fragmentGlobalCooldownRef.current < 700) {
      return
    }
    
    // Choose a ThoughtPattern (prefer the one that the defeated enemy represents)
    let pattern: ThoughtPattern | undefined
    if (thought.patternId) {
      pattern = THOUGHT_PATTERNS.find((p: ThoughtPattern) => p.id === thought.patternId)
    }
    
    // If no pattern found, pick a random one from available patterns
    if (!pattern) {
      const availablePatterns = THOUGHT_PATTERNS.filter(
        (p: ThoughtPattern) => p.monsterKey === 'void_eater'
      )
      if (availablePatterns.length > 0) {
        pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
      }
    }

    if (!pattern) return // No pattern available

    // Per-phrase cooldown: 2000ms to prevent repeats
    const phraseKey = pattern.phrase
    const lastSpawnAt = fragmentPhraseCooldownRef.current.get(phraseKey)
    if (lastSpawnAt && now - lastSpawnAt < 2000) {
      return
    }

    // Calculate wellness fragment probability based on stressSignal
    const stressSignal = ddaMetricsRef?.current?.pressureScore ?? 0.5
    const wellnessProbability = 0.35 + 0.40 * stressSignal // 0.35 at low stress, 0.75 at high stress

    // Spawn only 1 fragment (rare event)
    const isWellness = Math.random() < wellnessProbability
    const kind: 'negative' | 'wellness' = isWellness ? 'wellness' : 'negative'
    
    // Fragment text based on kind
    let text: string
    if (kind === 'wellness') {
      // Wellness fragment: short prompt or trimmed counterRecord
      const counterText = pattern.counterRecord
      text = counterText.length <= 40 
        ? counterText 
        : 'Try a kinder thought'
    } else {
      // Negative fragment: short piece of phrase
      const phraseText = pattern.phrase
      text = phraseText.length <= 30 
        ? phraseText 
        : phraseText.substring(0, 27) + '...'
    }

    // Position fragments in top third of playfield, not on top of formation
    const bubbleMaxWidth = 220 // Smaller max width for readability
    const playerY = getPlayerY()
    
    // Spawn in top third of playfield
    let fragmentX = thought.x
    let fragmentY = Math.max(60, Math.min(thought.y - 60, gameHeight * 0.35))
    
    // Clamp x inside playfield bounds (account for maxWidth)
    fragmentX = Math.max(8, Math.min(fragmentX, gameWidth - bubbleMaxWidth - 8))

    const fragment: Fragment = {
      id: `fragment-${thought.id}-${Date.now()}`,
      x: fragmentX,
      y: fragmentY,
      text,
      ttlMs: 1000, // Short TTL: will be randomized below
      kind,
      patternId: pattern.id,
      phrase: pattern.phrase,
      counterRecord: pattern.counterRecord,
    }

    // Randomize TTL between 900-1100ms
    fragment.ttlMs = 900 + Math.random() * 200
    fragmentTTLRef.current.set(fragment.id, Date.now() + fragment.ttlMs)

    // Update cooldowns
    fragmentGlobalCooldownRef.current = now
    fragmentPhraseCooldownRef.current.set(phraseKey, now)

    setFragments((prev) => {
      const next = [...prev, fragment]
      // Hard cap to 2
      return next.slice(-2)
    })
  }
  
  // Spawn a negative fragment when player is hit
  function spawnHitFragment() {
    const now = Date.now()
    
    // Hard cap: max 2 fragments visible at once
    if (fragments.length >= 2) {
      return
    }
    
    // Global cooldown
    if (now - fragmentGlobalCooldownRef.current < 700) {
      return
    }
    
    // Pick a random negative pattern
    const availablePatterns = THOUGHT_PATTERNS.filter(
      (p: ThoughtPattern) => p.monsterKey === 'void_eater'
    )
    if (availablePatterns.length === 0) return
    
    const pattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
    const phraseKey = pattern.phrase
    
    // Per-phrase cooldown
    const lastSpawnAt = fragmentPhraseCooldownRef.current.get(phraseKey)
    if (lastSpawnAt && now - lastSpawnAt < 2000) {
      return
    }
    
    // Spawn negative fragment near player
    const bubbleMaxWidth = 220
    const playerY = getPlayerY()
    const fragmentX = Math.max(8, Math.min(playerXRef.current, gameWidth - bubbleMaxWidth - 8))
    const fragmentY = Math.max(60, Math.min(playerY - 80, gameHeight * 0.35))
    
    const fragment: Fragment = {
      id: `fragment-hit-${Date.now()}`,
      x: fragmentX,
      y: fragmentY,
      text: pattern.phrase.length <= 30 ? pattern.phrase : pattern.phrase.substring(0, 27) + '...',
      ttlMs: 900 + Math.random() * 200, // 900-1100ms
      kind: 'negative',
      patternId: pattern.id,
      phrase: pattern.phrase,
      counterRecord: pattern.counterRecord,
    }
    
    fragmentTTLRef.current.set(fragment.id, Date.now() + fragment.ttlMs)
    fragmentGlobalCooldownRef.current = now
    fragmentPhraseCooldownRef.current.set(phraseKey, now)
    
    setFragments((prev) => {
      const next = [...prev, fragment]
      return next.slice(-2)
    })
  }

  function updateFragments(deltaTime: number) {
    const now = Date.now()
    
    setFragments((prev) => {
      return prev.filter((fragment) => {
        const ttl = fragmentTTLRef.current.get(fragment.id)
        if (ttl && now >= ttl) {
          fragmentTTLRef.current.delete(fragment.id)
          return false // Remove expired fragment
        }
        return true
      })
    })
  }

  function handleFragmentTap(fragmentId: string) {
    const fragment = fragments.find((f) => f.id === fragmentId)
    if (!fragment) return

    if (fragment.kind === 'wellness') {
      // Wellness fragment: append to conqueredThoughts
      setConqueredThoughts((prev) => {
        // Only add if not already present (unique by id)
        if (prev.some((ct) => ct.id === fragment.patternId)) {
          return prev
        }
        return [
          ...prev,
          {
            id: fragment.patternId,
            phrase: fragment.phrase,
            counterRecord: fragment.counterRecord,
          },
        ]
      })
      // Remove the fragment
      setFragments((prev) => prev.filter((f) => f.id !== fragmentId))
      fragmentTTLRef.current.delete(fragmentId)
    } else {
      // Negative fragment: convert to wellness fragment in place
      setFragments((prev) =>
        prev.map((f) =>
          f.id === fragmentId
            ? {
                ...f,
                kind: 'wellness' as const,
                text: f.counterRecord.length <= 40 
                  ? f.counterRecord 
                  : 'Try a kinder thought',
              }
            : f
        )
      )
    }
  }

  function startGame() {
    setIsPlaying(true)
    setGameOver(false)
    setScore(GAME_CONFIG.INITIAL_SCORE)
    setLives(difficultyConfig.initialLives)
    setPlayerHp(difficultyConfig.initialLives)
    setPlayerIFrameUntil(0)
    setProjectiles([])
    setEnemyProjectiles([])
    setNegativeThoughts([])
    setPowerUps([])
    setBoss(null)
    setBossIncoming(false)
    setPlayerLastHitAt(0)
    projectilesSpawnedRef.current = 0
    thoughtsDestroyedRef.current = 0
    setBossTelegraphActive(false)
    setBossTelegraphLabel(undefined)
    bossNextFireAtRef.current = 0
    bossBurstRemainingRef.current = 0
    bossNextBurstShotAtRef.current = 0
    bossBurstCountRef.current = 0
    stopBossFormationLoop()
    stopEnemyFireLoop()
    enemyNextFireAtRef.current = 0
    setThoughtEchoes([])
    setConqueredThoughts([])
    setFragments([])
    fragmentTTLRef.current.clear()
    fragmentGlobalCooldownRef.current = 0
    fragmentPhraseCooldownRef.current.clear()
    enemyNextFireAtRef.current = 0
    defeatedThoughtIdsRef.current.clear()
    // Clear all echo timers
    thoughtEchoTimersRef.current.forEach((timer) => clearTimeout(timer))
    thoughtEchoTimersRef.current.clear()
    thoughtEchoCooldownRef.current.clear()
    setWaveDefeatedPatterns(new Set())
    setWave(1)
    setFormationDir(1)
    setFormationTickMs(difficultyConfig.formationTickMs)
    setGameSpeed(GAME_CONFIG.DEFAULT_GAME_SPEED)
    const startX = getPlayerStartX()
    playerXRef.current = startX
    targetPlayerXRef.current = startX
    setPlayerX(startX)
    velocityRef.current = 0
    lastShotAtRef.current = 0
    gameStartTimeRef.current = performance.now()
    setMultishotActive(false)
    setFastShootActive(false)
    setShieldActive(false)
    powerUpTimersRef.current.forEach((timer) => clearTimeout(timer))
    powerUpTimersRef.current.clear()
    
    // Spawn initial wave after state has settled
    setTimeout(() => {
      if (isPlaying && !gameOver) {
        spawnInvaderWave('void_eater', 1)
      }
    }, 500)
  }

  function endGame(won: boolean, bossDefeated: boolean) {
    setGameOver(true)
    setIsPlaying(false)
    onGameOver(score, won, bossDefeated)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopGameLoop()
      stopFormationLoop()
      stopBossFormationLoop()
      powerUpTimersRef.current.forEach((timer) => clearTimeout(timer))
      powerUpTimersRef.current.clear()
      thoughtEchoTimersRef.current.forEach((timer) => clearTimeout(timer))
      thoughtEchoTimersRef.current.clear()
      if (headerPressTimerRef.current) {
        clearTimeout(headerPressTimerRef.current)
      }
    }
  }, [])

  return {
    // State
    playerX,
    playerY: getPlayerY(),
    score,
    lives,
    gameOver,
    isPlaying,
    projectiles,
    enemyProjectiles,
    negativeThoughts,
    powerUps,
    boss,
    bossIncoming,
    bossTelegraphActive,
    bossTelegraphLabel,
    playerLastHitAt,
    conqueredThoughts,
    fragments,
    wave,
    gameSpeed,
    multishotActive,
    fastShootActive,
    shieldActive,
    debugHitboxes,
    // DDA tracking
    projectilesSpawned: projectilesSpawnedRef.current,
    thoughtsDestroyed: thoughtsDestroyedRef.current,
    gameStartTime: gameStartTimeRef.current,
    // Actions
    shoot,
    setVelocity,
    setPlayerXFromInput,
    tryShoot,
    startGame,
    endGame,
    handleHeaderPress,
    handleFragmentTap,
  }
}
