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
}