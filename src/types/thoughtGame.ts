// TypeScript Interfaces


export interface Thought {
  id: number;
  text: string;
  isPositive: boolean;
  x: number;
  y: number;
  speed: number;
  powerUpType?:
    | "shield"
    | "multishot"
    | "slowtime"
    | "extralife"
    | "multiplier"
    | "fastshoot";
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  speed: number;
}

export interface PowerUp {
  type:
    | "shield"
    | "multishot"
    | "slowtime"
    | "extralife"
    | "multiplier"
    | "fastshoot";
  duration: number;
  active: boolean;
}

export interface GameState {
  wave: number;
  thoughtsInWave: number;
  thoughtsCleared: number;
  scoreMultiplier: number;
  timeSlowActive: boolean;
  shieldActive: boolean;
  multiShotActive: boolean;
  fastShootActive: boolean;
  waveComplete: boolean;
}

export interface DifficultyConfig {
  name: string;
  icon: string;
  modifiers: {
    thoughtSpeed: number;
    spawnRate: number;
    negativeThoughtChance: number;
    powerUpChance: number;
    scoreMultiplier: number;
    livesStart: number;
    waveTarget: number;
    levelScaling: number;
    maxLevels: number;
  };
}