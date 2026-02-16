/**
 * Hook Return Type Interfaces
 *
 * All hook return type interfaces are centralized here for better organization
 * and easier maintenance. Hook-specific option interfaces remain in their
 * respective hook files as they are implementation details.
 */

import type { StoryPassage, StoryChoice, StoryHistoryItem } from "./story";
import type { EmaRequestPayload } from "./ema";
import type { StoryCard } from "./hub/hub";
import type { StoryResponse, UserFullProfileResponse } from "@/api/types";
import type { GameDataResponse } from "@/api";
import type { Power, TextSpeed } from "@/stores/game-store";
import type { StoryProgressItem } from "@/utils/resources-mapper";
import type {
  Projectile,
  EnemyProjectile,
  NegativeThought,
  PowerUp,
  Boss,
  ConqueredThought,
  Fragment,
  ThoughtEcho,
  PowerUpType,
} from "./game";
import { RefObject } from "react";
import { type StoreApi } from "zustand";
import { type Difficulty, DIFFICULTY_CONFIGS } from "@/utils/vantage-constants";

// Type helper to extract ProfileCharacter from UserFullProfileResponse
type ProfileCharacter =
  | NonNullable<NonNullable<UserFullProfileResponse["profile"]>["character"]>
  | undefined;

// ============================================================================
// Hub/Profile Hooks
// ============================================================================

export interface UseHubProfileResult {
  isLoading: boolean;
  error: Error | null;
}

export interface UseStoryCardsResult {
  storyCards: StoryCard[];
  isLoading: boolean;
  error: Error | null;
}

// ============================================================================
// Resources Hooks
// ============================================================================

export interface ResourceItem {
  id: string;
  title: string;
  type: string;
  description?: string;
  isLocked?: boolean;
  duration?: string;
  backgroundImage?: any;
}

export interface MemoryItem {
  id: string;
  title: string;
  type: string;
  description?: string;
  category?: string;
  modality?: "journal" | "draw" | "voice" | "journal_reward";
  content?: string;
  createdAt?: string;
  // Story progress fields
  storyId?: number;
  storyCategory?: string;
  progressPercentage?: number;
  isCompleted?: boolean;
  passagesVisitedCount?: number;
  choicesMadeCount?: number;
  startedAt?: string;
  lastPlayed?: string;
  completedAt?: string | null;
  // Passage IDs to fetch and display
  passageIds?: string[];
}

export type TabType = "powers" | "resources" | "memories";

export interface UseResourcesResult {
  isLoading: boolean;
  resources: ResourceItem[];
  character: ProfileCharacter | undefined;
  memories: MemoryItem[];
  characterName: string;
  avatarConfig: string | null;
  powers: (Power & { isNew?: boolean })[];
  markPowersSeen: () => void;
  experience: number;
  resourceCounts: number;
  profileData: UserFullProfileResponse | undefined;
  storiesData: StoryResponse[] | undefined;
  journalEntries: any[];
  storyProgress: StoryProgressItem[];
  gameData: GameDataResponse | undefined;
}

// ============================================================================
// Story Hooks
// ============================================================================

export interface EngineState {
  story: any;
  passage: StoryPassage & { choices: StoryChoice[] };
  progress: any;
  /** Set when backend returns ema_required (e.g. after reaching an ending on study day 1–5). */
  emaRequest?: EmaRequestPayload | null;
}

export interface UseStoryEngineResult {
  isLoading: boolean;
  error: string | null;
  currentPassage: StoryPassage | null;
  storyTitle: string | null;
  makeChoice: (choice: StoryChoice) => Promise<EngineState | null>;
  isInitialized: boolean;
  isEnding: boolean;
  isDecision: boolean;
  hasChoices: boolean;
  hasMultipleChoices: boolean;
  choices: StoryChoice[];
  /** When set, show EMA survey modal (study day 1–5, no prior response). */
  pendingEmaRequest: EmaRequestPayload | null;
}

export interface UseStoryHistoryResult {
  history: StoryHistoryItem[];
  addChoice: (choice: { id: number | string; text: string }) => void;
  addReward: (reward: {
    id: string;
    type: "journal_entry" | "minigame" | "power" | "skill" | "gear" | "lumens";
    title: string;
    subtitle?: string;
    journalEntryId?: string;
    minigameLevel?: string;
    minigameIsTutorial?: boolean;
    lumensAmount?: number;
  }) => void;
}
export interface UseStoryHistoryProps {
  currentPassage: StoryPassage | null;
}

export interface UseStoryEngineProps {
  storyId: string | number;
  /** When true, restart from the beginning. When false/undefined, resume from last passage if progress exists. */
  shouldRestart?: boolean;
  /** Text speed preference; affects API retry delays (FAST mode uses minimal delays). */
  textSpeed?: TextSpeed;
}

export interface UseStoryAutoAdvanceProps {
  hasChoices: boolean;
  isLoading: boolean;
  currentPassage: StoryPassage | null;
  choices: StoryChoice[];
  textSpeed: TextSpeed;
  isPaused: boolean;
  onAutoAdvance: (choice: StoryChoice) => void;
}

// ============================================================================
// Notification Hooks
// ============================================================================

export interface NotificationTime {
  hour: number;
  minute: number;
}

export interface UseNotificationsResult {
  notificationsEnabled: boolean;
  notificationTime: NotificationTime;
  requestPermissions: () => Promise<boolean>;
  cancelAllNotifications: () => Promise<void>;
  updateNotificationTime: (time: NotificationTime) => void | Promise<void>;
}

// ============================================================================
// Game Hooks
// ============================================================================

export interface GameDirectorMetrics {
  formationTickMultiplier: number; // Multiplier for formation tick intervals (lower = faster movement)
  moveSpeed: number; // Velocity multiplier for thoughts and enemy projectiles
  powerUpChance: number; // Multiplier for power-up spawn chance
  difficultyLevel: number; // 1-10, for debugging/display
  pressureScore: number; // 0-1, current pressure assessment (stressSignal)
  emotionalIntensity: number; // 0-1, EMA-smoothed emotional intensity (EI)
}

export interface UseVantageGameResult {
  playerX: number;
  playerY: number;
  score: number;
  lives: number;
  gameOver: boolean;
  isPlaying: boolean;
  projectiles: Projectile[];
  enemyProjectiles: EnemyProjectile[];
  negativeThoughts: NegativeThought[];
  powerUps: PowerUp[];
  boss: Boss | null;
  bossIncoming: boolean;
  bossTelegraphActive: boolean;
  bossTelegraphLabel?: string;
  playerLastHitAt: number;
  conqueredThoughts: ConqueredThought[];
  defeatedNegativeThoughts: ConqueredThought[];
  fragments: Fragment[];
  wave: number;
  gameSpeed: number;
  multishotActive: boolean;
  fastShootActive: boolean;
  shieldActive: boolean;
  debugHitboxes: boolean;
  projectilesSpawned: number;
  thoughtsDestroyed: number;
  gameStartTime: number;
  lastShotAt: number;
  lastEnemyDestroyedAt: number;
  shoot: () => boolean;
  setVelocity: (velocity: number) => void;
  setPlayerXFromInput: (x: number) => void;
  tryShoot: () => boolean;
  startGame: () => void;
  endGame: (won: boolean, bossDefeated: boolean) => void;
  handleHeaderPress: () => void;
  handleFragmentTap: (fragmentId: string) => void;
}

export interface UseVantageFragmentsResult {
  spawnFragments: (thought: NegativeThought) => void;
  spawnHitFragment: () => void;
  updateFragments: (deltaTime?: number) => void;
  handleFragmentTap: (fragmentId: string) => void;
}

export interface UseGameDirectorOptions {
  isPlaying: boolean;
  playerLastHitAt?: number; // Timestamp of last player hit
  projectilesSpawned: number; // Total projectiles spawned (tracked externally)
  thoughtsDestroyed: number; // Total thoughts destroyed (tracked externally)
  gameStartTime: number; // When the game started (performance.now())
  lastShotAt?: number; // Timestamp of last player shot
  lastEnemyDestroyedAt?: number; // Timestamp of last enemy destroyed
}

export interface VantageDdaMetrics {
  formationTickMultiplier: number;
  moveSpeed: number;
  powerUpChance: number;
  pressureScore: number;
}

export interface VantageDirector {
  getTimeScale: (hasFragments: boolean) => number;
  getMoveSpeedMultiplier: () => number;
  getFormationDelay: (baseTickMs: number) => number;
  getFormationStepMultipliers: () => {
    horizontal: number;
    vertical: number;
  };
  getEnemyFireInterval: (baseInterval: number) => number;
  getBossFireCooldown: (params: {
    baseCooldown: number;
    recentBossHits: number[];
    timeSinceLastBossHit: number;
  }) => number;
  getWellnessProbability: () => number;
  getPowerUpChanceMultiplier: () => number;
}

export interface ProjectileControllerOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  playerXRef: RefObject<number>;
  targetPlayerXRef: RefObject<number>;
  velocityRef: RefObject<number>;
  director: VantageDirector;
}

export interface VantageProjectileController {
  updatePlayerPosition: (deltaSeconds: number) => void;
  updateEntities: (deltaSeconds: number, gameSpeed: number) => void;
}

export type Updater<T> = T | ((prev: T) => T);

export type VantageGameStore = StoreApi<VantageGameState>;

export interface VantageGameState {
  playerX: number;
  setPlayerX: (next: Updater<number>) => void;
  score: number;
  setScore: (next: Updater<number>) => void;
  lives: number;
  setLives: (next: Updater<number>) => void;
  gameOver: boolean;
  setGameOver: (next: Updater<boolean>) => void;
  isPlaying: boolean;
  setIsPlaying: (next: Updater<boolean>) => void;
  projectiles: Projectile[];
  setProjectiles: (next: Updater<Projectile[]>) => void;
  enemyProjectiles: EnemyProjectile[];
  setEnemyProjectiles: (next: Updater<EnemyProjectile[]>) => void;
  negativeThoughts: NegativeThought[];
  setNegativeThoughts: (next: Updater<NegativeThought[]>) => void;
  powerUps: PowerUp[];
  setPowerUps: (next: Updater<PowerUp[]>) => void;
  boss: Boss | null;
  setBoss: (next: Updater<Boss | null>) => void;
  bossIncoming: boolean;
  setBossIncoming: (next: Updater<boolean>) => void;
  bossTelegraphActive: boolean;
  setBossTelegraphActive: (next: Updater<boolean>) => void;
  bossTelegraphLabel?: string;
  setBossTelegraphLabel: (next: Updater<string | undefined>) => void;
  playerLastHitAt: number;
  setPlayerLastHitAt: (next: Updater<number>) => void;
  playerHp: number;
  setPlayerHp: (next: Updater<number>) => void;
  playerIFrameUntil: number;
  setPlayerIFrameUntil: (next: Updater<number>) => void;
  gameSpeed: number;
  setGameSpeed: (next: Updater<number>) => void;
  multishotActive: boolean;
  setMultishotActive: (next: Updater<boolean>) => void;
  fastShootActive: boolean;
  setFastShootActive: (next: Updater<boolean>) => void;
  shieldActive: boolean;
  setShieldActive: (next: Updater<boolean>) => void;
  debugHitboxes: boolean;
  setDebugHitboxes: (next: Updater<boolean>) => void;
  thoughtEchoes: ThoughtEcho[];
  setThoughtEchoes: (next: Updater<ThoughtEcho[]>) => void;
  conqueredThoughts: ConqueredThought[];
  setConqueredThoughts: (next: Updater<ConqueredThought[]>) => void;
  defeatedNegativeThoughts: ConqueredThought[];
  setDefeatedNegativeThoughts: (next: Updater<ConqueredThought[]>) => void;
  fragments: Fragment[];
  setFragments: (next: Updater<Fragment[]>) => void;
  formationTickMs: number;
  setFormationTickMs: (next: Updater<number>) => void;
  wave: number;
  setWave: (next: Updater<number>) => void;
  waveDefeatedPatterns: Set<string>;
  setWaveDefeatedPatterns: (next: Updater<Set<string>>) => void;
}

export interface CreateVantageStoreParams {
  playerStartX: number;
  initialLives: number;
  initialFormationTickMs: number;
}

export interface VantageLoopsOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  director: VantageDirector;
  projectileController: VantageProjectileController;
  collisionEngine: VantageCollisionEngine;
  formationController: VantageFormationController;
  bossManager: VantageBossManager;
  updateFragments: (deltaTime: number) => void;
  fragmentsRef: RefObject<Fragment[]>;
  negativeThoughtsRef: RefObject<NegativeThought[]>;
  enemyProjectilesRef: RefObject<EnemyProjectile[]>;
  powerUpsRef: RefObject<PowerUp[]>;
  bossRef: RefObject<Boss | null>;
  enemyNextFireAtRef: RefObject<number>;
  animationFrameRef: RefObject<number | null>;
  formationTimerRef: RefObject<NodeJS.Timeout | null>;
  enemyFireTimerRef: RefObject<NodeJS.Timeout | null>;
  bossFormationTimerRef: RefObject<NodeJS.Timeout | null>;
  lastDebugLogRef: RefObject<number>;
  shouldHoldEnemyActions?: () => boolean;
  onBossDefeated: () => void;
  onPlayerDefeated: () => void;
}

export interface VantageLoopController {
  startGameLoop: () => void;
  stopGameLoop: () => void;
  startFormationLoop: () => void;
  stopFormationLoop: () => void;
  startBossFormationLoop: () => void;
  stopBossFormationLoop: () => void;
  startEnemyFireLoop: () => void;
  stopEnemyFireLoop: () => void;
}

export interface FragmentSystemOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  director: VantageDirector;
  playerXRef: RefObject<number>;
  getPlayerY: () => number;
  fragmentTTLRef: RefObject<Map<string, number>>;
  fragmentGlobalCooldownRef: RefObject<number>;
  fragmentPhraseCooldownRef: RefObject<Map<string, number>>;
}

export interface FormationStepParams {
  wave: number;
  bossActive: boolean;
  onPlayerDefeated: () => void;
}

export interface VantageFormationController {
  spawnInvaderWave: (monsterKey: string, waveNumber: number) => void;
  stepFormation: (params: FormationStepParams) => void;
  resetWaveState: () => void;
}

export interface CollisionEngineOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  playerXRef: RefObject<number>;
  getPlayerY: () => number;
  shieldActiveRef: RefObject<boolean>;
  negativeThoughtsRef: RefObject<NegativeThought[]>;
  enemyProjectilesRef: RefObject<EnemyProjectile[]>;
  powerUpsRef: RefObject<PowerUp[]>;
  defeatedThoughtIdsRef: RefObject<Set<string>>;
  thoughtsDestroyedRef: RefObject<number>;
  lastEnemyDestroyedAtRef: RefObject<number>;
  spawnFragments: (thought: NegativeThought) => void;
  handlePlayerHit: (damage?: number) => void;
  handlePowerUp: (type: PowerUpType) => void;
  director: VantageDirector;
  difficultyConfig: (typeof DIFFICULTY_CONFIGS)[Difficulty];
}

export interface VantageCollisionEngine {
  checkCollisions: (currentTime?: number) => void;
}

export interface FormationControllerOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  difficultyConfig: (typeof DIFFICULTY_CONFIGS)[Difficulty];
  director: VantageDirector;
  formationDirRef: RefObject<1 | -1>;
  projectilesClearedForWaveRef: RefObject<number>;
  getPlayerY: () => number;
  triggerBoss: () => void;
}

// Boss Logic here: -------------------------------------------------------------
type DifficultyConfig = (typeof DIFFICULTY_CONFIGS)[Difficulty];

export interface BossManagerOptions {
  store: VantageGameStore;
  gameWidth: number;
  gameHeight: number;
  difficultyConfig: DifficultyConfig;
  playerXRef: RefObject<number>;
  bossVelocityXRef: RefObject<number>;
  bossVelocityYRef: RefObject<number>;
  bossNextFireAtRef: RefObject<number>;
  bossBurstRemainingRef: RefObject<number>;
  bossNextBurstShotAtRef: RefObject<number>;
  bossBurstCountRef: RefObject<number>;
  bossHitsRef: RefObject<number[]>;
  lastBossHitAtRef: RefObject<number>;
  director: VantageDirector;
}

export interface TriggerBossParams {
  onBossActivated: () => void;
}

export interface UpdateBossCombatParams {
  deltaTime: number;
  currentTime: number;
  onBossDefeated: () => void;
}

export interface VantageBossManager {
  triggerBoss: (params: TriggerBossParams) => void;
  updateBossCombat: (params: UpdateBossCombatParams) => void;
  stepBossMovement: () => void;
  resetBossState: () => void;
}
