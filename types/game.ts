// Thought Defender game types

export interface Projectile {
  id: string;
  x: number;
  y: number;
}

export interface EnemyProjectile {
  id: string;
  x: number;
  y: number;
  vy: number;
  vx?: number; // Optional horizontal velocity for angled shots
  isBoss?: boolean; // Flag to differentiate boss projectiles
}

export interface NegativeThought {
  id: string;
  x: number;
  y: number;
  speed: number;
  text?: string;
  patternId?: string;
}

export interface ConqueredThought {
  id: string;
  phrase: string;
  counterRecord: string;
}

export interface DdaSnapshot {
  elapsed_ms: number;
  difficulty_level: number;
  pressure_score: number;
  emotional_intensity: number;
  formation_tick_multiplier: number;
  move_speed: number;
  power_up_chance: number;
  lives_remaining: number;
  score: number;
  shots_delta: number;
  kills_delta: number;
  hits_delta: number;
}

export interface DdaFinal {
  total_shots: number;
  total_kills: number;
  total_hits_taken: number;
  final_difficulty: number;
  final_pressure: number;
  final_emotional_intensity: number;
  device_platform?: string;
  app_version?: string;
}

export interface ThoughtEcho {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface Fragment {
  id: string;
  x: number;
  y: number;
  text: string;
  ttlMs: number;
  kind: "negative" | "wellness";
  patternId: string;
  phrase: string;
  counterRecord: string;
}

export type PowerUpType =
  | "slowTime"
  | "multishot"
  | "fastShoot"
  | "extraLife"
  | "multiplier"
  | "shield";

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
}

export interface Boss {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  phase: "spawning" | "active";
  movePhase?: number; // For sin wave movement (legacy)
  direction?: 1 | -1; // For formation movement
  lastHitAt?: number; // Timestamp of last hit for visual feedback
}

export interface VantageGameState {
  playerX: number;
  score: number;
  lives: number;
  gameOver: boolean;
  isPlaying: boolean;
  projectiles: Projectile[];
  negativeThoughts: NegativeThought[];
  powerUps: PowerUp[];
  gameSpeed: number;
  shootCooldown: number;
  multishotActive: boolean;
  fastShootActive: boolean;
  shieldActive: boolean;
}

/** Run stats passed from Vantage game to screen when a run ends (for backend submission). */
export interface VantageRunStats {
  runId: string;
  levelReached: number;
  thoughtsReframed: number;
  thoughtsDefeated: number;
  projectilesSpawned: number;
  thoughtsDestroyed: number;
  totalHitsTaken: number;
  ddaFinal?: DdaFinal;
  ddaSnapshots?: DdaSnapshot[];
  startedAt: string;
  endedAt: string;
  durationMs: number;
}
