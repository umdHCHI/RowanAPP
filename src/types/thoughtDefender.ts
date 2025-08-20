export type TDDifficulty = 'easy' | 'normal' | 'hard' | string;
export type TDResult = 'win' | 'lose' | 'quit';

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
