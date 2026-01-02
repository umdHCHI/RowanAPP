// Thought Defender game types

export interface Projectile {
  id: string
  x: number
  y: number
}

export interface EnemyProjectile {
  id: string
  x: number
  y: number
  vy: number
  vx?: number // Optional horizontal velocity for angled shots
}

export interface NegativeThought {
  id: string
  x: number
  y: number
  speed: number
  text?: string
  patternId?: string
}

export interface ConqueredThought {
  id: string
  phrase: string
  counterRecord: string
}

export interface ThoughtEcho {
  id: string
  text: string
  x: number
  y: number
  createdAt: number
}

export type PowerUpType = 'slowTime' | 'multishot' | 'fastShoot' | 'extraLife' | 'multiplier' | 'shield'

export interface PowerUp {
  id: string
  x: number
  y: number
  type: PowerUpType
}

export interface Boss {
  id: string
  x: number
  y: number
  hp: number
  maxHp: number
  phase: 'spawning' | 'active'
  movePhase?: number // For sin wave movement (legacy)
  direction?: 1 | -1 // For formation movement
  lastHitAt?: number // Timestamp of last hit for visual feedback
}

export interface ThoughtDefenderGameState {
  playerX: number
  score: number
  lives: number
  gameOver: boolean
  isPlaying: boolean
  projectiles: Projectile[]
  negativeThoughts: NegativeThought[]
  powerUps: PowerUp[]
  gameSpeed: number
  shootCooldown: number
  multishotActive: boolean
  fastShootActive: boolean
  shieldActive: boolean
}

