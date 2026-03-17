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

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useReducer,
  type RefObject,
} from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { shallow } from "zustand/shallow";
import {
  createVantageGameStore,
  createVantageDirector,
  createVantageProjectileController,
  createVantageBossManager,
  createVantageFormationController,
  createVantageCollisionEngine,
  createVantageLoopController,
  useVantageFragments,
} from "./vantage/index";
import type { StoreApi } from "zustand";
import {
  GAME_CONFIG,
  DIFFICULTY_CONFIGS,
  type Difficulty,
} from "@/utils/vantage-constants";
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
} from "@/types/game";
import type {
  UseVantageGameResult,
  VantageGameStore,
  VantageGameState,
} from "@/types/hooks";
import type { DdaFinal, DdaSnapshot, VantageRunStats } from "@/types/game";
import { useDdaGameStore } from "@/stores/dda-game-store";

function generateRunId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function useThrottledStore<S, T>(
  store: StoreApi<S>,
  selector: (state: S) => T,
  equalityFn: (a: T, b: T) => boolean,
  throttleMs: number = GAME_CONFIG.RENDER_THROTTLE_MS,
): T {
  const [, forceUpdate] = useReducer((n: number) => n + 1, 0);
  const lastRef = useRef<T>(selector(store.getState()));
  const selectorRef = useRef(selector);
  const equalityRef = useRef(equalityFn);
  selectorRef.current = selector;
  equalityRef.current = equalityFn;

  useEffect(() => {
    let pending = false;
    let tid: ReturnType<typeof setTimeout> | null = null;
    const unsub = store.subscribe(() => {
      if (pending) return;
      pending = true;
      tid = setTimeout(() => {
        pending = false;
        const next = selectorRef.current(store.getState());
        if (!equalityRef.current(lastRef.current, next)) {
          lastRef.current = next;
          forceUpdate();
        }
      }, throttleMs);
    });
    return () => {
      unsub();
      if (tid != null) clearTimeout(tid);
    };
  }, [store, throttleMs]);

  return selector(store.getState());
}

interface UseVantageGameOptions {
  gameWidth: number;
  gameHeight: number;
  difficulty: Difficulty;
  isTutorialLevelZero?: boolean;
  onGameOver: (
    score: number,
    won: boolean,
    bossDefeated: boolean,
    runStats?: VantageRunStats,
  ) => void;
  ddaMetricsRef?: RefObject<
    | {
        formationTickMultiplier: number;
        moveSpeed: number;
        powerUpChance: number;
        pressureScore: number;
      }
    | undefined
  >;
}

/**
 * Main hook orchestrating the Vantage/Thought Defender mini-game.
 * Handles player state, enemy formations, boss encounters, DDA inputs, and UI events.
 */
export function useVantageGame({
  gameWidth,
  gameHeight,
  difficulty,
  isTutorialLevelZero = false,
  onGameOver,
  ddaMetricsRef,
}: UseVantageGameOptions): UseVantageGameResult {
  const difficultyConfig = DIFFICULTY_CONFIGS[difficulty];
  const getPlayerStartX = () => gameWidth / 2 - GAME_CONFIG.PLAYER_WIDTH / 2;
  const getPlayerY = useCallback(
    () =>
      gameHeight - GAME_CONFIG.PLAYER_BOTTOM_OFFSET - GAME_CONFIG.PLAYER_HEIGHT,
    [gameHeight],
  );

  const storeRef = useRef<VantageGameStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createVantageGameStore({
      playerStartX: getPlayerStartX(),
      initialLives: difficultyConfig.initialLives,
      initialFormationTickMs: difficultyConfig.formationTickMs,
    });
  }
  const store = storeRef.current;

  const {
    setPlayerX,
    setScore,
    setLives,
    setGameOver,
    setIsPlaying,
    setProjectiles,
    setEnemyProjectiles,
    setNegativeThoughts,
    setPowerUps,
    setBoss,
    setBossIncoming,
    setBossTelegraphActive,
    setBossTelegraphLabel,
    setPlayerLastHitAt,
    setPlayerHp,
    setPlayerIFrameUntil,
    setGameSpeed,
    setMultishotActive,
    setFastShootActive,
    setShieldActive,
    setDebugHitboxes,
    setThoughtEchoes,
    setConqueredThoughts,
    setDefeatedNegativeThoughts,
    setFragments,
    setFormationTickMs,
    setWave,
    setWaveDefeatedPatterns,
  } = store.getState();

  const {
    playerX,
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
    playerIFrameUntil,
    gameSpeed,
    multishotActive,
    fastShootActive,
    shieldActive,
    debugHitboxes,
    thoughtEchoes,
    conqueredThoughts,
    defeatedNegativeThoughts,
    fragments,
    formationTickMs,
    wave,
    waveDefeatedPatterns,
  } = useThrottledStore(
    store,
    (state: VantageGameState) => ({
      playerX: state.playerX,
      score: state.score,
      lives: state.lives,
      gameOver: state.gameOver,
      isPlaying: state.isPlaying,
      projectiles: state.projectiles,
      enemyProjectiles: state.enemyProjectiles,
      negativeThoughts: state.negativeThoughts,
      powerUps: state.powerUps,
      boss: state.boss,
      bossIncoming: state.bossIncoming,
      bossTelegraphActive: state.bossTelegraphActive,
      bossTelegraphLabel: state.bossTelegraphLabel,
      playerLastHitAt: state.playerLastHitAt,
      playerIFrameUntil: state.playerIFrameUntil,
      gameSpeed: state.gameSpeed,
      multishotActive: state.multishotActive,
      fastShootActive: state.fastShootActive,
      shieldActive: state.shieldActive,
      debugHitboxes: state.debugHitboxes,
      thoughtEchoes: state.thoughtEchoes,
      conqueredThoughts: state.conqueredThoughts,
      defeatedNegativeThoughts: state.defeatedNegativeThoughts,
      fragments: state.fragments ?? [],
      formationTickMs: state.formationTickMs,
      wave: state.wave,
      waveDefeatedPatterns: state.waveDefeatedPatterns,
    }),
    shallow,
  );

  const playerXRef = useRef<number>(getPlayerStartX());
  const targetPlayerXRef = useRef<number>(getPlayerStartX());
  const velocityRef = useRef<number>(0);

  const projectilesSpawnedRef = useRef<number>(0);
  const thoughtsDestroyedRef = useRef<number>(0);
  const lastEnemyDestroyedAtRef = useRef<number>(0);
  const bossHitsRef = useRef<number[]>([]);
  const lastBossHitAtRef = useRef<number>(0);
  const fragmentTTLRef = useRef<Map<string, number>>(new Map());
  const formationDirRef = useRef<1 | -1>(1);
  const projectilesClearedForWaveRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const defeatedThoughtIdsRef = useRef<Set<string>>(new Set());
  const lastShotAtRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);
  const playerHpFractionRef = useRef<number>(0);
  const formationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpTimersRef = useRef<Map<PowerUpType, NodeJS.Timeout>>(new Map());
  const bossFormationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bossVelocityXRef = useRef<number>(3);
  const bossVelocityYRef = useRef<number>(2);
  const bossNextFireAtRef = useRef<number>(0);
  const bossBurstRemainingRef = useRef<number>(0);
  const bossNextBurstShotAtRef = useRef<number>(0);
  const bossBurstCountRef = useRef<number>(0);
  const runIdRef = useRef<string>("");
  const runStartTimestampRef = useRef<number>(0);
  const endGameLockedRef = useRef<boolean>(false);
  const projectileIdRef = useRef<number>(0);
  const headerPressCountRef = useRef<number>(0);
  const headerPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDebugLogRef = useRef<number>(0);
  const enemyFireTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enemyNextFireAtRef = useRef<number>(0);
  const tutorialEnemyReleaseAtRef = useRef<number>(0);
  const thoughtEchoTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const thoughtEchoCooldownRef = useRef<Map<string, number>>(new Map());
  const bossLoopStarterRef = useRef<() => void>(() => {});
  const fragmentGlobalCooldownRef = useRef<number>(0);
  const fragmentPhraseCooldownRef = useRef<Map<string, number>>(new Map());
  const ddaSnapshotsRef = useRef<DdaSnapshot[]>([]);
  const ddaSnapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotCountsRef = useRef<{
    shots: number;
    kills: number;
    hits: number;
  }>({
    shots: 0,
    kills: 0,
    hits: 0,
  });
  const totalHitsTakenRef = useRef<number>(0);

  const negativeThoughtsRef = useRef<NegativeThought[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const enemyProjectilesRef = useRef<EnemyProjectile[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const shieldActiveRef = useRef<boolean>(false);
  const fragmentsRef = useRef<Fragment[]>([]);
  const thoughtEchoesRef = useRef<ThoughtEcho[]>([]);

  useEffect(() => {
    playerXRef.current = playerX;
    negativeThoughtsRef.current = negativeThoughts;
    projectilesRef.current = projectiles;
    enemyProjectilesRef.current = enemyProjectiles;
    powerUpsRef.current = powerUps;
    bossRef.current = boss;
    shieldActiveRef.current = shieldActive;
    fragmentsRef.current = fragments;
    thoughtEchoesRef.current = thoughtEchoes;
  }, [
    playerX,
    negativeThoughts,
    projectiles,
    enemyProjectiles,
    powerUps,
    boss,
    shieldActive,
    fragments,
    thoughtEchoes,
  ]);

  useEffect(() => {
    if (gameWidth > 0 && gameHeight > 0) {
      const newX = gameWidth / 2 - GAME_CONFIG.PLAYER_WIDTH / 2;
      playerXRef.current = newX;
      targetPlayerXRef.current = newX;
      setPlayerX(newX);
    }
  }, [gameWidth, gameHeight]);

  const captureDdaSnapshot = useCallback(() => {
    const ddaState = useDdaGameStore.getState();
    const metrics = ddaState.metrics;
    if (!metrics || !runStartTimestampRef.current) return;

    const now = Date.now();
    const elapsedMs = Math.max(0, now - runStartTimestampRef.current);
    const currentState = store.getState();
    const shots = projectilesSpawnedRef.current;
    const kills = thoughtsDestroyedRef.current;
    const hits = totalHitsTakenRef.current;
    const last = lastSnapshotCountsRef.current;

    const snapshot: DdaSnapshot = {
      elapsed_ms: elapsedMs,
      difficulty_level: metrics.difficultyLevel,
      pressure_score: metrics.pressureScore,
      emotional_intensity: metrics.emotionalIntensity,
      formation_tick_multiplier: metrics.formationTickMultiplier,
      move_speed: metrics.moveSpeed,
      power_up_chance: metrics.powerUpChance,
      lives_remaining: currentState.lives,
      score: currentState.score,
      shots_delta: Math.max(0, shots - last.shots),
      kills_delta: Math.max(0, kills - last.kills),
      hits_delta: Math.max(0, hits - last.hits),
    };

    lastSnapshotCountsRef.current = { shots, kills, hits };
    ddaSnapshotsRef.current.push(snapshot);
  }, [store]);

  const endGame = useCallback(
    (won: boolean, bossDefeated: boolean) => {
      if (endGameLockedRef.current) return;
      endGameLockedRef.current = true;
      const state = store.getState();
      const latestScore = state.score;
      captureDdaSnapshot();
      if (ddaSnapshotIntervalRef.current) {
        clearInterval(ddaSnapshotIntervalRef.current);
        ddaSnapshotIntervalRef.current = null;
      }
      const ddaState = useDdaGameStore.getState();
      const finalDifficulty =
        ddaState.metrics?.difficultyLevel ?? ddaState.difficultyLevel;
      const finalPressure =
        ddaState.metrics?.pressureScore ?? ddaState.pressureScore;
      const finalEmotionalIntensity =
        ddaState.metrics?.emotionalIntensity ?? ddaState.emotionalIntensity;
      const appVersion =
        (Constants?.expoConfig as { version?: string } | undefined)?.version ??
        (Constants as { manifest?: { version?: string } } | undefined)?.manifest
          ?.version;
      const ddaFinal: DdaFinal = {
        total_shots: projectilesSpawnedRef.current,
        total_kills: thoughtsDestroyedRef.current,
        total_hits_taken: totalHitsTakenRef.current,
        final_difficulty: finalDifficulty,
        final_pressure: finalPressure,
        final_emotional_intensity: finalEmotionalIntensity,
        device_platform: Platform.OS,
        app_version: appVersion,
      };
      setGameOver(true);
      setIsPlaying(false);
      const endedAt = Date.now();
      const runStats: VantageRunStats = {
        runId: runIdRef.current,
        levelReached: state.wave,
        thoughtsReframed: state.conqueredThoughts?.length ?? 0,
        thoughtsDefeated: state.defeatedNegativeThoughts?.length ?? 0,
        projectilesSpawned: projectilesSpawnedRef.current,
        thoughtsDestroyed: thoughtsDestroyedRef.current,
        totalHitsTaken: totalHitsTakenRef.current,
        ddaFinal,
        ddaSnapshots: ddaSnapshotsRef.current,
        startedAt: new Date(runStartTimestampRef.current).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        durationMs: Math.round(endedAt - runStartTimestampRef.current),
      };
      onGameOver(latestScore, won, bossDefeated, runStats);
    },
    [store, setGameOver, setIsPlaying, onGameOver],
  );

  const handlePlayerHit = useCallback(
    (damage: number = 1.0) => {
      const now = performance.now();
      if (now < playerIFrameUntil) return;
      if (shieldActiveRef.current) {
        shieldActiveRef.current = false;
        setShieldActive(false);
        return;
      }
      playerHpFractionRef.current += damage;
      const uniqueHitTimestamp = now + Math.random() * 0.1;
      const fullDamage = Math.floor(playerHpFractionRef.current);
      if (fullDamage >= 1) {
        playerHpFractionRef.current -= fullDamage;
        totalHitsTakenRef.current += fullDamage;
        setPlayerHp((hp) => {
          const newHp = hp - fullDamage;
          if (newHp <= 0) {
            endGame(false, false);
            return 0;
          }
          setPlayerIFrameUntil(now + GAME_CONFIG.PLAYER_IFRAME_DURATION_MS);
          setPlayerLastHitAt(uniqueHitTimestamp);
          return newHp;
        });
        setLives((l) => {
          const newLives = l - fullDamage;
          if (newLives <= 0) {
            endGame(false, false);
            return 0;
          }
          return newLives;
        });
      } else {
        setPlayerLastHitAt(uniqueHitTimestamp);
      }
    },
    [
      endGame,
      playerIFrameUntil,
      setLives,
      setPlayerHp,
      setPlayerIFrameUntil,
      setPlayerLastHitAt,
      setShieldActive,
    ],
  );

  const handlePowerUp = useCallback(
    (type: PowerUpType) => {
      const existingTimer = powerUpTimersRef.current.get(type);
      if (existingTimer) clearTimeout(existingTimer);
      switch (type) {
        case "extraLife":
          setLives((l) => l + 1);
          break;
        case "slowTime": {
          setGameSpeed(GAME_CONFIG.SLOW_TIME_SPEED_MULTIPLIER);
          const slowTimer = setTimeout(() => {
            setGameSpeed(GAME_CONFIG.DEFAULT_GAME_SPEED);
            powerUpTimersRef.current.delete("slowTime");
          }, GAME_CONFIG.SLOW_TIME_DURATION);
          powerUpTimersRef.current.set("slowTime", slowTimer);
          break;
        }
        case "fastShoot": {
          setFastShootActive(true);
          const fastTimer = setTimeout(() => {
            setFastShootActive(false);
            powerUpTimersRef.current.delete("fastShoot");
          }, GAME_CONFIG.FAST_SHOOT_DURATION);
          powerUpTimersRef.current.set("fastShoot", fastTimer);
          break;
        }
        case "multishot": {
          setMultishotActive(true);
          const multiTimer = setTimeout(() => {
            setMultishotActive(false);
            powerUpTimersRef.current.delete("multishot");
          }, GAME_CONFIG.MULTISHOT_DURATION);
          powerUpTimersRef.current.set("multishot", multiTimer);
          break;
        }
        case "multiplier":
          setScore(
            (s) =>
              s +
              Math.floor(
                GAME_CONFIG.SCORE_MULTIPLIER_BONUS *
                  difficultyConfig.scoreMultiplier,
              ),
          );
          break;
        case "shield": {
          setShieldActive(true);
          const shieldTimer = setTimeout(() => {
            setShieldActive(false);
            powerUpTimersRef.current.delete("shield");
          }, GAME_CONFIG.SHIELD_DURATION);
          powerUpTimersRef.current.set("shield", shieldTimer);
          break;
        }
      }
    },
    [
      difficultyConfig,
      setFastShootActive,
      setGameSpeed,
      setLives,
      setMultishotActive,
      setScore,
      setShieldActive,
    ],
  );

  const director = useMemo(
    () => createVantageDirector(ddaMetricsRef),
    [ddaMetricsRef],
  );

  const { spawnFragments, updateFragments, handleFragmentTap } =
    useVantageFragments({
      store,
      gameWidth,
      gameHeight,
      director,
      playerXRef,
      getPlayerY,
      fragmentTTLRef,
      fragmentGlobalCooldownRef,
      fragmentPhraseCooldownRef,
    });

  const projectileController = useMemo(
    () =>
      createVantageProjectileController({
        store,
        gameWidth,
        gameHeight,
        playerXRef,
        targetPlayerXRef,
        velocityRef,
        director,
      }),
    [store, gameWidth, gameHeight, director],
  );

  const bossManager = useMemo(
    () =>
      createVantageBossManager({
        store,
        gameWidth,
        gameHeight,
        difficultyConfig,
        playerXRef,
        bossVelocityXRef,
        bossVelocityYRef,
        bossNextFireAtRef,
        bossBurstRemainingRef,
        bossNextBurstShotAtRef,
        bossBurstCountRef,
        bossHitsRef,
        lastBossHitAtRef,
        director,
      }),
    [store, gameWidth, gameHeight, difficultyConfig, director],
  );

  const formationController = useMemo(
    () =>
      createVantageFormationController({
        store,
        gameWidth,
        gameHeight,
        difficultyConfig,
        director,
        formationDirRef,
        projectilesClearedForWaveRef,
        getPlayerY,
        triggerBoss: () =>
          bossManager.triggerBoss({
            onBossActivated: () => bossLoopStarterRef.current(),
          }),
      }),
    [
      store,
      gameWidth,
      gameHeight,
      difficultyConfig,
      director,
      bossManager,
      formationDirRef,
      projectilesClearedForWaveRef,
      bossLoopStarterRef,
      getPlayerY,
    ],
  );

  const collisionEngine = useMemo(
    () =>
      createVantageCollisionEngine({
        store,
        gameWidth,
        gameHeight,
        playerXRef,
        getPlayerY,
        shieldActiveRef,
        negativeThoughtsRef,
        enemyProjectilesRef,
        powerUpsRef,
        defeatedThoughtIdsRef,
        thoughtsDestroyedRef,
        lastEnemyDestroyedAtRef,
        spawnFragments,
        handlePlayerHit,
        handlePowerUp,
        director,
        difficultyConfig,
      }),
    [
      store,
      gameWidth,
      gameHeight,
      director,
      difficultyConfig,
      getPlayerY,
      spawnFragments,
      negativeThoughtsRef,
      enemyProjectilesRef,
      powerUpsRef,
      defeatedThoughtIdsRef,
      thoughtsDestroyedRef,
      lastEnemyDestroyedAtRef,
      handlePlayerHit,
      handlePowerUp,
    ],
  );

  const loopController = useMemo(
    () =>
      createVantageLoopController({
        store,
        gameWidth,
        gameHeight,
        director,
        projectileController,
        collisionEngine,
        formationController,
        bossManager,
        updateFragments,
        fragmentsRef,
        negativeThoughtsRef,
        enemyProjectilesRef,
        powerUpsRef,
        bossRef,
        enemyNextFireAtRef,
        animationFrameRef,
        formationTimerRef,
        enemyFireTimerRef,
        bossFormationTimerRef,
        lastDebugLogRef,
        shouldHoldEnemyActions: () =>
          isTutorialLevelZero &&
          performance.now() < tutorialEnemyReleaseAtRef.current,
        onBossDefeated: () => {
          setTimeout(
            () => endGame(true, true),
            GAME_CONFIG.BOSS_DEFEATED_DELAY_MS,
          );
        },
        onPlayerDefeated: () => endGame(false, false),
      }),
    [
      store,
      gameWidth,
      gameHeight,
      director,
      projectileController,
      collisionEngine,
      formationController,
      bossManager,
      updateFragments,
      fragmentsRef,
      negativeThoughtsRef,
      enemyProjectilesRef,
      powerUpsRef,
      bossRef,
      enemyNextFireAtRef,
      animationFrameRef,
      formationTimerRef,
      enemyFireTimerRef,
      bossFormationTimerRef,
      lastDebugLogRef,
      isTutorialLevelZero,
      endGame,
    ],
  );

  useEffect(() => {
    bossLoopStarterRef.current = () => loopController.startBossFormationLoop();
  }, [loopController]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      loopController.startGameLoop();
      loopController.startFormationLoop();
      loopController.startEnemyFireLoop();
    } else {
      loopController.stopGameLoop();
      loopController.stopFormationLoop();
      loopController.stopBossFormationLoop();
      loopController.stopEnemyFireLoop();
    }
    return () => {
      loopController.stopGameLoop();
      loopController.stopFormationLoop();
      loopController.stopBossFormationLoop();
      loopController.stopEnemyFireLoop();
    };
  }, [isPlaying, gameOver, loopController]);

  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (ddaSnapshotIntervalRef.current) {
        clearInterval(ddaSnapshotIntervalRef.current);
        ddaSnapshotIntervalRef.current = null;
      }
      return;
    }

    lastSnapshotCountsRef.current = {
      shots: projectilesSpawnedRef.current,
      kills: thoughtsDestroyedRef.current,
      hits: totalHitsTakenRef.current,
    };

    ddaSnapshotIntervalRef.current = setInterval(captureDdaSnapshot, 10000);
    return () => {
      if (ddaSnapshotIntervalRef.current) {
        clearInterval(ddaSnapshotIntervalRef.current);
        ddaSnapshotIntervalRef.current = null;
      }
    };
  }, [isPlaying, gameOver, captureDdaSnapshot]);

  useEffect(() => {
    if (boss && isPlaying && !gameOver) {
      loopController.startBossFormationLoop();
    } else {
      loopController.stopBossFormationLoop();
    }
  }, [boss, isPlaying, gameOver, loopController]);

  useEffect(() => {
    if (isPlaying && !gameOver) {
      loopController.stopFormationLoop();
      loopController.startFormationLoop();
    }
  }, [formationTickMs, isPlaying, gameOver, loopController]);

  function shoot() {
    if (!isPlaying || gameOver) return false;
    if (projectilesRef.current.length >= GAME_CONFIG.MAX_PROJECTILES) {
      return false;
    }
    const now = performance.now();
    const cooldown = fastShootActive
      ? GAME_CONFIG.FAST_SHOOT_COOLDOWN
      : GAME_CONFIG.SHOOT_COOLDOWN;
    if (now - lastShotAtRef.current < cooldown) return false;
    lastShotAtRef.current = now;
    const currentPlayerY = getPlayerY();
    if (multishotActive) {
      const centerX = playerXRef.current + GAME_CONFIG.PLAYER_WIDTH / 2;
      const baseId = projectileIdRef.current;
      projectileIdRef.current += 1;
      const timestamp = Date.now();
      const newProjectiles: Projectile[] = [
        {
          id: `proj-${timestamp}-${baseId}-0`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2 - 15,
          y: currentPlayerY,
        },
        {
          id: `proj-${timestamp}-${baseId}-1`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2,
          y: currentPlayerY,
        },
        {
          id: `proj-${timestamp}-${baseId}-2`,
          x: centerX - GAME_CONFIG.PROJECTILE_WIDTH / 2 + 15,
          y: currentPlayerY,
        },
      ];
      projectilesSpawnedRef.current += newProjectiles.length;
      setProjectiles((prev) => [...prev, ...newProjectiles]);
    } else {
      const nextId = projectileIdRef.current;
      projectileIdRef.current += 1;
      const timestamp = Date.now();
      setProjectiles((prev) => {
        projectilesSpawnedRef.current += 1;
        return [
          ...prev,
          {
            id: `proj-${timestamp}-${nextId}`,
            x:
              playerXRef.current +
              GAME_CONFIG.PLAYER_WIDTH / 2 -
              GAME_CONFIG.PROJECTILE_WIDTH / 2,
            y: currentPlayerY,
          },
        ];
      });
    }
    return true;
  }

  function setPlayerXFromInput(x: number) {
    if (!isPlaying || gameOver) return;
    const clampedX = Math.max(
      0,
      Math.min(
        gameWidth - GAME_CONFIG.PLAYER_WIDTH,
        x - GAME_CONFIG.PLAYER_WIDTH / 2,
      ),
    );
    targetPlayerXRef.current = clampedX;
    playerXRef.current = clampedX;
    setPlayerX(clampedX);
  }

  function setVelocity(velocity: number) {
    velocityRef.current = velocity;
  }

  function toggleDebugHitboxes() {
    setDebugHitboxes((prev) => !prev);
  }

  function handleHeaderPress() {
    headerPressCountRef.current += 1;
    if (headerPressTimerRef.current) clearTimeout(headerPressTimerRef.current);
    headerPressTimerRef.current = setTimeout(() => {
      if (
        headerPressCountRef.current >=
        GAME_CONFIG.DEBUG_TOGGLE_HEADER_PRESS_COUNT
      ) {
        toggleDebugHitboxes();
      }
      headerPressCountRef.current = 0;
    }, GAME_CONFIG.DEBUG_TOGGLE_HEADER_PRESS_TIMEOUT_MS);
  }

  function startGame() {
    endGameLockedRef.current = false;
    setIsPlaying(true);
    setGameOver(false);
    setScore(GAME_CONFIG.INITIAL_SCORE);
    setLives(difficultyConfig.initialLives);
    setPlayerHp(difficultyConfig.initialLives);
    setPlayerIFrameUntil(0);
    playerHpFractionRef.current = 0;
    setProjectiles([]);
    setEnemyProjectiles([]);
    setNegativeThoughts([]);
    setPowerUps([]);
    setBoss(null);
    setBossIncoming(false);
    setPlayerLastHitAt(0);
    projectilesSpawnedRef.current = 0;
    thoughtsDestroyedRef.current = 0;
    lastEnemyDestroyedAtRef.current = 0;
    totalHitsTakenRef.current = 0;
    ddaSnapshotsRef.current = [];
    lastSnapshotCountsRef.current = { shots: 0, kills: 0, hits: 0 };
    bossHitsRef.current = [];
    lastBossHitAtRef.current = 0;
    setBossTelegraphActive(false);
    setBossTelegraphLabel(undefined);
    bossNextFireAtRef.current = 0;
    bossBurstRemainingRef.current = 0;
    bossNextBurstShotAtRef.current = 0;
    bossBurstCountRef.current = 0;
    loopController.stopBossFormationLoop();
    loopController.stopEnemyFireLoop();
    setThoughtEchoes([]);
    setConqueredThoughts([]);
    setFragments([]);
    setDefeatedNegativeThoughts([]);
    fragmentTTLRef.current.clear();
    fragmentGlobalCooldownRef.current = 0;
    fragmentPhraseCooldownRef.current.clear();
    defeatedThoughtIdsRef.current.clear();
    thoughtEchoTimersRef.current.forEach((timer) => clearTimeout(timer));
    thoughtEchoTimersRef.current.clear();
    thoughtEchoCooldownRef.current.clear();
    setWaveDefeatedPatterns(new Set());
    setWave(1);
    projectilesClearedForWaveRef.current = 0;
    formationDirRef.current = 1;
    setFormationTickMs(difficultyConfig.formationTickMs);
    setGameSpeed(GAME_CONFIG.DEFAULT_GAME_SPEED);
    const startX = getPlayerStartX();
    playerXRef.current = startX;
    targetPlayerXRef.current = startX;
    setPlayerX(startX);
    velocityRef.current = 0;
    lastShotAtRef.current = 0;
    projectileIdRef.current = 0;
    runIdRef.current = generateRunId();
    runStartTimestampRef.current = Date.now();
    gameStartTimeRef.current = performance.now();
    setMultishotActive(false);
    setFastShootActive(false);
    setShieldActive(false);
    powerUpTimersRef.current.forEach((timer) => clearTimeout(timer));
    powerUpTimersRef.current.clear();
    tutorialEnemyReleaseAtRef.current = isTutorialLevelZero
      ? performance.now() + GAME_CONFIG.TUTORIAL_LEVEL0_ENEMY_DELAY_MS
      : 0;
    setTimeout(() => {
      const currentState = store.getState();
      if (currentState.isPlaying && !currentState.gameOver) {
        formationController.spawnInvaderWave("void_eater", 1);
      }
    }, 0);
  }

  useEffect(() => {
    return () => {
      powerUpTimersRef.current.forEach((t) => clearTimeout(t));
      powerUpTimersRef.current.clear();
      thoughtEchoTimersRef.current.forEach((t) => clearTimeout(t));
      thoughtEchoTimersRef.current.clear();
      if (headerPressTimerRef.current)
        clearTimeout(headerPressTimerRef.current);
    };
  }, []);

  return {
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
    defeatedNegativeThoughts,
    fragments,
    wave,
    gameSpeed,
    multishotActive,
    fastShootActive,
    shieldActive,
    debugHitboxes,
    projectilesSpawned: projectilesSpawnedRef.current,
    thoughtsDestroyed: thoughtsDestroyedRef.current,
    gameStartTime: gameStartTimeRef.current,
    lastShotAt: lastShotAtRef.current,
    lastEnemyDestroyedAt: lastEnemyDestroyedAtRef.current,
    shoot,
    setVelocity,
    setPlayerXFromInput,
    tryShoot: shoot,
    startGame,
    endGame,
    handleHeaderPress,
    handleFragmentTap,
    toggleDebugHitboxes,
  };
}
