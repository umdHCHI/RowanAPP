import { useState, useEffect, useRef } from 'react'
import { GAME_CONFIG, DIFFICULTY_CONFIGS, type Difficulty } from '@/utils/thought-defender-constants'
import { THOUGHT_PATTERNS, type ThoughtPattern } from '@/utils/thought-defender-helpers'
import type {
  Projectile,
  EnemyProjectile,
  NegativeThought,
  PowerUp,
  PowerUpType,
  Boss,
  ThoughtEcho,
  ConqueredThought,
} from '@/types/game'

interface UseThoughtDefenderGameOptions {
  gameWidth: number
  gameHeight: number
  difficulty: Difficulty
  onGameOver: (score: number, won: boolean, bossDefeated: boolean) => void
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

export function useThoughtDefenderGame({
  gameWidth,
  gameHeight,
  difficulty,
  onGameOver,
}: UseThoughtDefenderGameOptions) {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty]
  const playerStartX = gameWidth / 2 - GAME_CONFIG.PLAYER_WIDTH / 2
  const getPlayerY = () => gameHeight - GAME_CONFIG.PLAYER_BOTTOM_OFFSET - GAME_CONFIG.PLAYER_HEIGHT
  
  const [playerX, setPlayerX] = useState<number>(playerStartX)
  const playerXRef = useRef<number>(playerStartX)
  const targetPlayerXRef = useRef<number>(playerStartX) // For smooth movement
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

  // Refs for latest state (prevents stale closures in collision checks)
  const negativeThoughtsRef = useRef<NegativeThought[]>([])
  const projectilesRef = useRef<Projectile[]>([])
  const powerUpsRef = useRef<PowerUp[]>([])
  const bossRef = useRef<Boss | null>(null)
  const shieldActiveRef = useRef<boolean>(false)

  // Sync refs with state
  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

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

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (isPlaying && !gameOver) {
      startGameLoop()
      startFormationLoop()
    } else {
      stopGameLoop()
      stopFormationLoop()
      stopBossFormationLoop()
    }

    return () => {
      stopGameLoop()
      stopFormationLoop()
      stopBossFormationLoop()
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
      const deltaSeconds = deltaTime / 1000

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
      setNegativeThoughts((prev) =>
        prev.map((thought) => {
          // Only move thoughts that have speed > 0 (falling thoughts from boss)
          if (thought.speed > 0) {
            return {
              ...thought,
              y: thought.y + thought.speed * gameSpeed * deltaSeconds,
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
    const allPatterns = THOUGHT_PATTERNS.filter((p) => p.monsterKey === monsterKey)
    
    // For this wave, exclude patterns already used in this wave
    const availableForWave = allPatterns.filter(
      (pattern) => !waveDefeatedPatterns.has(pattern.id)
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

      for (let row = 0; row < GAME_CONFIG.INVADERS_ROWS; row++) {
        for (let col = 0; col < GAME_CONFIG.INVADERS_COLS; col++) {
          const index = row * GAME_CONFIG.INVADERS_COLS + col
          const pattern = availablePatterns[index % availablePatterns.length]

          if (pattern) {
            const x = GAME_CONFIG.INVADER_START_X + col * (GAME_CONFIG.THOUGHT_WIDTH + GAME_CONFIG.INVADER_H_GAP)
            const y = GAME_CONFIG.INVADER_START_Y + row * (GAME_CONFIG.THOUGHT_HEIGHT + GAME_CONFIG.INVADER_V_GAP)

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

        // Check if formation hits wall
        if (currentDir === 1 && maxX + GAME_CONFIG.FORMATION_STEP_X >= gameWidth) {
          newDir = -1
          stepDown = true
        } else if (currentDir === -1 && minX - GAME_CONFIG.FORMATION_STEP_X <= 0) {
          newDir = 1
          stepDown = true
        }

        if (stepDown) {
          setFormationDir(newDir)
        }

        // Move formation
        const stepX = stepDown ? 0 : GAME_CONFIG.FORMATION_STEP_X * currentDir
        const stepY = stepDown ? GAME_CONFIG.FORMATION_STEP_Y : 0

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

      formationTimerRef.current = setTimeout(formationStep, formationTickMs)
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
            vy: 6,
          }
          setEnemyProjectiles((prev) => [...prev, enemyProjectile])
        } else {
          // Regular downward shot
          const enemyProjectile: EnemyProjectile = {
            id: `enemy-proj-${Date.now()}-${bossBurstRemainingRef.current}`,
            x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
            y: spawnY,
            vy: 5.5,
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
        // Create echoes for destroyed thoughts and track conquered patterns
        const destroyedThoughts = thoughtsNow.filter((t) => hitThoughtIds.has(t.id))
        destroyedThoughts.forEach((thought) => {
          // Spawn floating echo (only shows phrase)
          spawnThoughtEcho({
            id: thought.id,
            text: thought.text || '…',
            x: thought.x,
            y: thought.y,
          })

          // Track conquered thought if it has a pattern
          if (thought.patternId && !defeatedThoughtIdsRef.current.has(thought.patternId)) {
            defeatedThoughtIdsRef.current.add(thought.patternId)
            setWaveDefeatedPatterns((prev) => new Set([...prev, thought.patternId!]))
            const pattern = THOUGHT_PATTERNS.find((p) => p.id === thought.patternId)
            if (pattern) {
              setConqueredThoughts((prev) => {
                // Only add if not already present (unique by id)
                if (prev.some((ct) => ct.id === pattern.id)) {
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

          // Spawn powerup from defeated invader (based on difficulty)
          if (thought.speed === 0 && Math.random() < difficultyConfig.powerUpSpawnChance) {
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
          w: GAME_CONFIG.PROJECTILE_WIDTH,
          h: GAME_CONFIG.PROJECTILE_HEIGHT,
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
      setProjectiles((prev) => [...prev, ...newProjectiles])
    } else {
      // Only shoot if no projectiles on screen (limit to 1)
      setProjectiles((prev) => {
        if (prev.length >= 1) return prev
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

  function spawnThoughtEcho(thought: { id: string; text: string; x: number; y: number }) {
    setThoughtEchoes((prev) => {
      const next: ThoughtEcho[] = [
        ...prev,
        {
          id: `echo-${thought.id}-${Date.now()}`,
          text: thought.text,
          x: thought.x,
          y: thought.y,
          createdAt: Date.now(),
        },
      ]
      // Cap to avoid clutter (max 6 active echoes)
      return next.slice(-6)
    })
  }

  function removeThoughtEcho(echoId: string) {
    setThoughtEchoes((prev) => prev.filter((e) => e.id !== echoId))
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
    setBossTelegraphActive(false)
    setBossTelegraphLabel(undefined)
    bossNextFireAtRef.current = 0
    bossBurstRemainingRef.current = 0
    bossNextBurstShotAtRef.current = 0
    bossBurstCountRef.current = 0
    stopBossFormationLoop()
    setThoughtEchoes([])
    setConqueredThoughts([])
    defeatedThoughtIdsRef.current.clear()
    setWaveDefeatedPatterns(new Set())
    setWave(1)
    setFormationDir(1)
    setFormationTickMs(difficultyConfig.formationTickMs)
    setGameSpeed(GAME_CONFIG.DEFAULT_GAME_SPEED)
    const startX = gameWidth / 2 - GAME_CONFIG.PLAYER_WIDTH / 2
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
    playerLastHitAt,
    thoughtEchoes,
    conqueredThoughts,
    wave,
    gameSpeed,
    multishotActive,
    fastShootActive,
    shieldActive,
    debugHitboxes,
    // Actions
    shoot,
    setVelocity,
    setPlayerXFromInput,
    tryShoot,
    startGame,
    endGame,
    handleHeaderPress,
    removeThoughtEcho,
  }
}
