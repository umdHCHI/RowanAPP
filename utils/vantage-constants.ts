export type Difficulty = 'easy' | 'normal' | 'hard'

export interface DifficultyConfig {
  // Formation speed
  formationTickMs: number
  formationSpeedupPerClear: number
  minFormationTickMs: number // Minimum speed after speedups
  
  // Player
  initialLives: number
  
  // Boss
  bossHp: number
  bossAttackInterval: number // ms between boss attacks
  wavesBeforeBoss: number
  
  // Power-ups
  powerUpSpawnChance: number // 0-1
  
  // Scoring multiplier
  scoreMultiplier: number
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    formationTickMs: 600, // Slower movement
    formationSpeedupPerClear: 0.95, // Slower speedup
    minFormationTickMs: 250, // Won't get too fast
    initialLives: 5,
    bossHp: 20,
    bossAttackInterval: 3000, // Slower attacks
    wavesBeforeBoss: 2,
    powerUpSpawnChance: 0.2, // 20% chance
    scoreMultiplier: 0.8, // Lower score rewards
  },
  normal: {
    formationTickMs: 450, // Current default
    formationSpeedupPerClear: 0.92, // Current default
    minFormationTickMs: 180, // Current minimum
    initialLives: 3,
    bossHp: 30,
    bossAttackInterval: 2000, // Current default
    wavesBeforeBoss: 3,
    powerUpSpawnChance: 0.1, // 10% chance (current default)
    scoreMultiplier: 1.0, // Normal scoring
  },
  hard: {
    formationTickMs: 320, // Faster movement
    formationSpeedupPerClear: 0.88, // Faster speedup
    minFormationTickMs: 120, // Can get very fast
    initialLives: 2,
    bossHp: 45,
    bossAttackInterval: 1500, // Faster attacks
    wavesBeforeBoss: 4,
    powerUpSpawnChance: 0.05, // 5% chance (rare)
    scoreMultiplier: 1.5, // Higher score rewards
  },
}

export const GAME_CONFIG = {
  // Player (increased size for better mobile navigation)
  PLAYER_WIDTH: 70,
  PLAYER_HEIGHT: 70,
  PLAYER_MOVE_SPEED: 300, // pixels per second
  PLAYER_BOTTOM_OFFSET: 120, // Increase this value to move player higher on screen

  // Projectiles
  PROJECTILE_WIDTH: 10,
  PROJECTILE_HEIGHT: 20,
  // Enemy projectiles (smaller, defeatable by player projectiles)
  ENEMY_PROJECTILE_WIDTH: 12,
  ENEMY_PROJECTILE_HEIGHT: 20,
  PROJECTILE_SPEED: 400, // pixels per second
  SHOOT_COOLDOWN: 100, // ms - allow rapid tapping
  FAST_SHOOT_COOLDOWN: 50, // ms - very fast for rapid tapping

  // Negative Thoughts (Invaders)
  THOUGHT_WIDTH: 40,
  THOUGHT_HEIGHT: 40,
  THOUGHT_MIN_SPEED: 50, // pixels per second (for powerups falling)
  THOUGHT_MAX_SPEED: 150, // pixels per second (for powerups falling)
  THOUGHT_SPAWN_INTERVAL: 1000, // ms (legacy, not used in formation mode)

  // Formation (Space Invaders style)
  INVADERS_ROWS: 3,
  INVADERS_COLS: 6,
  INVADER_H_GAP: 12,
  INVADER_V_GAP: 14,
  INVADER_START_X: 20,
  INVADER_START_Y: 80,
  FORMATION_STEP_X: 10,
  FORMATION_STEP_Y: 18,
  FORMATION_TICK_MS: 450, // Default, overridden by difficulty
  FORMATION_SPEEDUP_PER_CLEAR: 0.92, // Default, overridden by difficulty

  // Power-ups
  POWERUP_WIDTH: 30,
  POWERUP_HEIGHT: 30,
  POWERUP_SPAWN_CHANCE: 0.1, // Default, overridden by difficulty
  POWERUP_SPEED: 100, // pixels per second (falling speed)

  // Game loop
  GAME_LOOP_INTERVAL: 16, // ~60fps

  // Scoring
  SCORE_PER_HIT: 10,
  SCORE_MULTIPLIER_BONUS: 50,

  // Power-up durations (ms)
  SLOW_TIME_DURATION: 5000,
  MULTISHOT_DURATION: 10000,
  FAST_SHOOT_DURATION: 10000,
  SHIELD_DURATION: 15000,

  // Game speed
  SLOW_TIME_SPEED_MULTIPLIER: 0.5,
  DEFAULT_GAME_SPEED: 1,

  // Initial state
  INITIAL_LIVES: 3, // Default, overridden by difficulty
  INITIAL_SCORE: 0,

  // Boss
  BOSS_TRIGGER_SCORE: 500,
  BOSS_TRIGGER_TIME: 45000, // 45 seconds (legacy, not used in wave mode)
  BOSS_WIDTH: 80,
  BOSS_HEIGHT: 80,
  BOSS_HP: 30, // Default, overridden by difficulty
  BOSS_STEP_X: 12, // Boss formation step
  BOSS_STEP_Y: 20, // Boss formation step down
  BOSS_ATTACK_INTERVAL: 2000, // Default, overridden by difficulty
  // Boss Space Invaders style movement
  BOSS_SPEED: 2.2, // Pixels per movement tick
  BOSS_STEP_DOWN: 10, // Pixels to step down when bouncing
  BOSS_FIRE_COOLDOWN_MS: 1400, // Base cooldown between bursts (slower to prevent overwhelming)
  BOSS_BURST_COUNT: 1, // Number of shots per burst
  BOSS_BURST_GAP_MS: 120, // Time between shots in a burst
} as const

// Debug flag for hitboxes
export const DEBUG_HITBOXES = false

