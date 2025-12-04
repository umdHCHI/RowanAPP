export type TDDifficulty = 'easy' | 'normal' | 'hard' | string;
export type TDResult = 'win' | 'lose' | 'quit';

/**
 * Game completion data passed from ThoughtDefenderModal to parent components
 * Used for stats tracking and UI updates
 */
export interface ThoughtDefenderGameData {
  score: number;
  level: number;
  won: boolean;
  difficulty: string;
  accuracy: number;
  missedShots: number;
  dynamicDifficultyMultiplier: number;
  shotsFired: number;
  hits: number;
}

/**
 * Full game run data sent to backend API
 */
export interface ThoughtDefenderRunDTO {
  score: number;
  level: number;
  wavesCleared: number;
  shotsFired: number;
  hits: number;
  accuracy: number;         // 0..1
  livesRemaining: number;
  durationMs: number;
  difficulty: TDDifficulty;
  result: TDResult;
  perksUsed?: string[];
  powerupsCollected?: number;
  missedShots?: number; //accuracy penalty
  dynamicDifficultyMultiplier?: number; // Track if game ramped up difficulty
  startedAt: string;        // ISO
  finishedAt: string;       // ISO
  clientVersion?: string;
}

export interface ThoughtDefenderRunResponse {
  ok: boolean;
  message?: string;
  // optional passthrough data from backend
  gameData?: any;
  progressRecordId?: number | string;
}

