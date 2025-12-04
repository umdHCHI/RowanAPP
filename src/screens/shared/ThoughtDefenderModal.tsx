import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../../context/MasterStateContext";
import { DIFFICULTY_LEVELS, POWER_UPS } from '../../data/archivePaths';
import { convertGameDataToPerformance, useDDA } from "../../hooks/useDDA";
import { useProgressLogger } from "../../hooks/useProgressLogger";
import { apiService, TDifficulty } from "../../services/apiService";
import { DifficultyConfig, GameState, Projectile, Thought } from '../../types/index';
import { ThoughtDefenderGameData, ThoughtDefenderRunDTO } from "../../types/thoughtDefender";
import { GameData } from "../../types/user";
import {
  formatThoughtDefenderRewardMessage,
  processThoughtDefenderCompletion
} from "../../utils/rewardsUtils";
import { ConfettiAnimation } from "./thoughtDefender/components/ConfettiAnimation";
import { DifficultySelect } from "./thoughtDefender/components/DifficultySelect";
import { GameHUD } from "./thoughtDefender/components/GameHUD";
import { StartScreen } from "./thoughtDefender/components/StartScreen";
import { GAME_HEIGHT, GAME_WIDTH, PADDLE_WIDTH } from "./thoughtDefender/constants";
import { useGameLoop } from "./thoughtDefender/hooks/useGameLoop";
import { useThoughtsForCharacter } from "./thoughtDefender/hooks/useThoughtsForCharacter";
import { clampPlayerPosition } from "./thoughtDefender/physics";
import { styles } from "./thoughtDefender/styles";

const { width } = Dimensions.get("window");





interface ThoughtDefenderModalProps {
  visible: boolean;
  onClose: () => void;
  onScoreUpdate?: (data: ThoughtDefenderGameData) => void;
  isFullScreen?: boolean;
  primaryTrait?: string; // Optional prop for primary trait
}

const ThoughtDefenderModal: React.FC<ThoughtDefenderModalProps> = ({
  visible,
  onClose,
  onScoreUpdate,
  isFullScreen = false,
  primaryTrait,
}) => {
  const { ui } = useMasterState();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  
  
  // Game data from API
  const [apiGameData, setApiGameData] = useState<GameData | null>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState<boolean>(false);
  const spawnAccRef = useRef<number>(0);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [playerX, setPlayerX] = useState<number>(
    GAME_WIDTH / 2 - PADDLE_WIDTH / 2
  );
  const [canShoot, setCanShoot] = useState<boolean>(true);
  const [isDraggingPaddle, setIsDraggingPaddle] = useState<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [totalThoughtsSpawned, setTotalThoughtsSpawned] = useState<number>(0);
  const [positiveThoughtsCleared, setPositiveThoughtsCleared] = useState<number>(0);
  const [negativeThoughtsCleared, setNegativeThoughtsCleared] = useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [missedShots, setMissedShots] = useState<number>(0);
  const [powerupsCollected, setPowerupsCollected] = useState<number>(0);
  const [uniqueThoughtsDefeated, setUniqueThoughtsDefeated] = useState<Set<string>>(new Set());
  const [uniqueThoughtsCollected, setUniqueThoughtsCollected] = useState<Set<string>>(new Set());
  
  // Dynamic difficulty scaling
  const [dynamicDifficultyMultiplier, setDynamicDifficultyMultiplier] = useState<number>(1.0);
  const [lastDifficultyRamp, setLastDifficultyRamp] = useState<number>(0);
  const [showDifficultyRampNotification, setShowDifficultyRampNotification] = useState<boolean>(false);
  
  // Confetti animations
  const [confettiAnimations, setConfettiAnimations] = useState<Array<{
    id: number;
    visible: boolean;
    position: { x: number; y: number };
    text: string;
  }>>([]);
  const confettiIdCounter = useRef<number>(0);

  const {
    ddaState,
    calculateDifficulty,
    updateBaseline,
    getAdaptiveDifficulty,
    getAdaptiveModifiers
  } = useDDA();

  const logger = useProgressLogger({
    game: 'thought_defender',
    flushIntervalMs: 4000,
    maxBuffer: 200
  });

  const { wellness, character, theme, archive } = useMasterState();
  const homeData = wellness.homeData;
  const backendCharacter = character.backendCharacter;
  const hasHomeData = homeData && 'userProfile' in homeData ? homeData.userProfile?.character : homeData;
  const hasBackendCharacter = backendCharacter;

  // Silent wellness gain function that doesn't show alerts
  // This is used during game completion to avoid duplicate alerts
  const gainWellnessSilently = async (gains: Record<string, number>) => {
    try {
      if (!backendCharacter?.id) return;

      const id = Number(backendCharacter.id);
      if (!id || isNaN(id)) return;

      // Filter to only positive values
      const payload = Object.fromEntries(
        Object.entries(gains).filter(([, v]) => typeof v === 'number' && v > 0)
      );

      // Only make API call if there are positive gains
      if (Object.keys(payload).length === 0) return;

      // Call API and silently update character state (no alerts)
      await apiService.gainWellness(id, payload);
      // Successfully updated - the character state will refresh on next screen navigation
    } catch (error) {
      console.error('Failed to gain wellness:', error);
      // Fail silently to avoid interrupting game completion flow
    }
  };

  // Fetch game data when modal opens
  useEffect(() => {
    if (visible && !isLoadingGameData && !apiGameData) {
      const fetchGameData = async () => {
        setIsLoadingGameData(true);
        try {
          const data = await apiService.fetchUserGameData();
          setApiGameData(data);
          
          // Initialize score and level from API
          if (data.score) setScore(data.score);
          if (data.level) setLevel(data.level);
          
        } catch (error) {
          console.error('[ThoughtDefender] Failed to load game data:', error);
          // Continue with default values if API fails
        } finally {
          setIsLoadingGameData(false);
        }
      };
      
      fetchGameData();
    }
  }, [visible, isLoadingGameData, apiGameData]);

  const { positiveThoughts: POSITIVE_THOUGHTS, negativeThoughts: NEGATIVE_THOUGHTS } = useThoughtsForCharacter({
    apiGameData,
    character,
    hasHomeData: !!hasHomeData,
    hasBackendCharacter: hasBackendCharacter !== null,
    primaryTrait,
  });

  const [gameState, setGameState] = useState<GameState>({
    wave: 1,
    thoughtsInWave: 0,
    thoughtsCleared: 0,
    scoreMultiplier: 1,
    timeSlowActive: false,
    shieldActive: false,
    multiShotActive: false,
    fastShootActive: false,
    waveComplete: false,
  });

  // Consolidated game state refs
  const gameStateRef = useRef({
    thoughtIdCounter: 0,
    projectileIdCounter: 0,
    gameEnded: false,
    level,
    lives,
    gameStarted,
    dynamicDifficultyMultiplier,
  });

  // Sync refs only when needed
  useEffect(() => {
    gameStateRef.current.level = level;
  }, [level]);

  useEffect(() => {
    gameStateRef.current.lives = lives;
  }, [lives]);

  useEffect(() => {
    gameStateRef.current.gameStarted = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    gameStateRef.current.dynamicDifficultyMultiplier = dynamicDifficultyMultiplier;
  }, [dynamicDifficultyMultiplier]);

  const getDifficultyConfig = useCallback((): DifficultyConfig => {
    const baseDifficulty = DIFFICULTY_LEVELS[selectedDifficulty] || DIFFICULTY_LEVELS.normal;
    
    if (ddaState.lastResult) {
      const adaptiveModifiers = getAdaptiveModifiers(baseDifficulty.modifiers);
      return {
        ...baseDifficulty,
        modifiers: adaptiveModifiers
      };
    }
    
    return baseDifficulty;
  }, [selectedDifficulty, ddaState.lastResult, getAdaptiveModifiers]);

  // Use optimized game loop hook (after getDifficultyConfig is defined)
  useGameLoop({
    gameStarted,
    lives,
    gameState,
    thoughts,
    projectiles,
    setThoughts,
    setProjectiles,
    setScore,
    setLives,
    setHits,
    setMissedShots,
    setNegativeThoughtsCleared,
    setGameState,
    getDifficultyConfig,
    logger,
    level,
    onThoughtDefeated: useCallback((thoughtText: string) => {
      setUniqueThoughtsDefeated((prev) => new Set([...prev, thoughtText]));
    }, []),
    onEnemyDefeated: useCallback((position: { x: number; y: number }, text: string) => {
      const id = ++confettiIdCounter.current;
      setConfettiAnimations((prev) => [
        ...prev,
        { id, visible: true, position, text },
      ]);
      // Remove animation after it completes
      setTimeout(() => {
        setConfettiAnimations((prev) => prev.filter((anim) => anim.id !== id));
      }, 1000);
    }, []),
  });

  // Check if player is doing "too well" and ramp up difficulty
  const checkDynamicDifficultyAdjustment = useCallback(() => {
    if (!gameStarted || lives <= 0) return;
    
    const currentTime = Date.now();
    const timeSinceLastRamp = currentTime - lastDifficultyRamp;
    
    // Only check every 10 seconds
    if (timeSinceLastRamp < 10000) return;
    
    // Calculate current performance metrics
    const accuracy = shotsFired > 0 ? hits / shotsFired : 0;
    const survivalTime = (currentTime - gameStartTime) / 1000;
    const scoreRate = survivalTime > 0 ? score / survivalTime : 0;
    const thoughtClearRate = survivalTime > 0 ? (positiveThoughtsCleared + negativeThoughtsCleared) / survivalTime : 0;
    
    // Thresholds for "dominating" performance
    const isDominating = 
      accuracy >= 0.8 && // 80%+ accuracy
      scoreRate > 10 && // Scoring fast
      lives >= 2 && // Not taking damage
      thoughtClearRate > 0.8 && // Clearing thoughts efficiently
      survivalTime > 30; // At least 30 seconds in
    
    const isExcelling = 
      accuracy >= 0.9 && // 90%+ accuracy
      scoreRate > 15 && // Scoring very fast
      lives >= 3 && // Full health
      thoughtClearRate > 1.0 && // Clearing thoughts very efficiently
      survivalTime > 45; // At least 45 seconds in
    
    if (isExcelling && dynamicDifficultyMultiplier < 1.5) {
      // Ramp up significantly
      setDynamicDifficultyMultiplier(prev => Math.min(1.5, prev + 0.15));
      setLastDifficultyRamp(currentTime);
      setShowDifficultyRampNotification(true);
      setTimeout(() => setShowDifficultyRampNotification(false), 3000);
      logger.waveStart(level); // Log difficulty increase
    } else if (isDominating && dynamicDifficultyMultiplier < 1.3) {
      // Ramp up moderately
      setDynamicDifficultyMultiplier(prev => Math.min(1.3, prev + 0.1));
      setLastDifficultyRamp(currentTime);
      setShowDifficultyRampNotification(true);
      setTimeout(() => setShowDifficultyRampNotification(false), 3000);
      logger.waveStart(level); // Log difficulty increase
    }
  }, [gameStarted, lives, shotsFired, hits, score, gameStartTime, positiveThoughtsCleared, negativeThoughtsCleared, lastDifficultyRamp, dynamicDifficultyMultiplier, level, logger]);

  // Run dynamic difficulty check periodically
  useEffect(() => {
    if (!gameStarted) return;
    
    const interval = setInterval(() => {
      checkDynamicDifficultyAdjustment();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, [gameStarted, checkDynamicDifficultyAdjustment]);

  const handleGameOver = async (finalStats: {
    score: number;
    level: number;
    wavesCleared: number;
    shotsFired: number;
    hits: number;
    livesRemaining: number;
    durationMs: number;
    difficulty: string;
    result: 'win' | 'lose' | 'quit';
    perksUsed?: string[];
    powerupsCollected?: number;
    startedAt: number;   // epoch ms
    finishedAt: number;  // epoch ms
  }) => {
    const accuracy = finalStats.shotsFired > 0 ? finalStats.hits / finalStats.shotsFired : 0; // updating math so that it's not just based on hits

    const payload: ThoughtDefenderRunDTO = {
      score: finalStats.score,
      level: finalStats.level,
      wavesCleared: finalStats.wavesCleared,
      shotsFired: finalStats.shotsFired,
      hits: finalStats.hits,
      accuracy, //thanks trevor! 
      livesRemaining: finalStats.livesRemaining,
      durationMs: finalStats.durationMs,
      difficulty: finalStats.difficulty,
      result: finalStats.result,
      perksUsed: finalStats.perksUsed ?? [],
      powerupsCollected: finalStats.powerupsCollected ?? 0,
      missedShots: missedShots,
      dynamicDifficultyMultiplier: dynamicDifficultyMultiplier,
      startedAt: new Date(finalStats.startedAt).toISOString(),
      finishedAt: new Date(finalStats.finishedAt).toISOString(),
      clientVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? 'web',
    };

    try {
      await archive.logThoughtDefenderRun(payload);
    } catch {
    }
    
    // Update game data API with new score and level
    if (apiGameData?.id) {
      try {
        const updatedGameData = await apiService.updateGameDataScore(apiGameData.id, {
          score: finalStats.score,
          level: finalStats.level,
          difficulty_levels: apiGameData.difficulty_levels.includes(finalStats.difficulty) 
            ? apiGameData.difficulty_levels 
            : [...apiGameData.difficulty_levels, finalStats.difficulty]
        });
        
        setApiGameData(updatedGameData);
      } catch (error) {
        console.error('[ThoughtDefender] Failed to update game data:', error);
        // Non-critical error, continue with game flow
      }
    }
  };

  const getCurrentWaveTarget = useCallback((): number => {
    const difficulty = getDifficultyConfig();
    const levelBonus = Math.floor((level - 1) * difficulty.modifiers.waveTarget * difficulty.modifiers.levelScaling);
    return difficulty.modifiers.waveTarget + levelBonus;
  }, [getDifficultyConfig, level]);

  const handlePlayerMove = useCallback((x: number): void => {
    setPlayerX(clampPlayerPosition(x - PADDLE_WIDTH / 2));
  }, []);

  const shoot = useCallback((): void => {
    if (!canShoot) {
      return;
    }
    
    if (!gameStarted) {
      return;
    }

    const shootSpeed = gameState.fastShootActive ? 100 : 200;
    const projectileSpeed = 10; // Increased from 8 for snappier bullets

    const centerX = playerX + PADDLE_WIDTH / 2;
    const newProjectiles: Projectile[] = gameState.multiShotActive
      ? [
          { id: ++gameStateRef.current.projectileIdCounter, x: centerX - 25, y: GAME_HEIGHT - 60, speed: projectileSpeed },
          { id: ++gameStateRef.current.projectileIdCounter, x: centerX, y: GAME_HEIGHT - 60, speed: projectileSpeed },
          { id: ++gameStateRef.current.projectileIdCounter, x: centerX + 25, y: GAME_HEIGHT - 60, speed: projectileSpeed },
        ]
      : [{ id: ++gameStateRef.current.projectileIdCounter, x: centerX, y: GAME_HEIGHT - 60, speed: projectileSpeed }];

    setProjectiles((prev) => [...prev, ...newProjectiles]);

    setShotsFired((prev) => prev + (gameState.multiShotActive ? 3 : 1)); //might eed to compute from projectiles
    setCanShoot(false);
    setTimeout(() => setCanShoot(true), shootSpeed);
  }, [
    canShoot,
    gameStarted,
    playerX,
    gameState.fastShootActive,
    gameState.multiShotActive,
  ]);

  const activatePowerUp = useCallback((powerUpType: string): void => {
    const powerUp = POWER_UPS[powerUpType as keyof typeof POWER_UPS];
    if (!powerUp) return;

    logger.powerupCollected(level, powerUpType);

    switch (powerUpType) {
      case "shield":
        setGameState((prev) => ({ ...prev, shieldActive: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, shieldActive: false })),
          powerUp.duration
        );
        break;
      case "multishot":
        setGameState((prev) => ({ ...prev, multiShotActive: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, multiShotActive: false })),
          powerUp.duration
        );
        break;
      case "slowtime":
        setGameState((prev) => ({ ...prev, timeSlowActive: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, timeSlowActive: false })),
          powerUp.duration
        );
        break;
      case "extralife":
        setLives((prev) => Math.min(prev + 1, 5));
        break;
      case "multiplier":
        setGameState((prev) => ({ ...prev, scoreMultiplier: 2 }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, scoreMultiplier: 1 })),
          powerUp.duration
        );
        break;
      case "fastshoot":
        setGameState((prev) => ({ ...prev, fastShootActive: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, fastShootActive: false })),
          powerUp.duration
        );
        break;
    }
  }, [logger, level]);

  const spawnThought = useCallback((): void => {
    if (!gameStarted || lives <= 0) return;
    
    if (POSITIVE_THOUGHTS.length === 0 || NEGATIVE_THOUGHTS.length === 0) {
      return;
    }

    const difficulty = getDifficultyConfig();

    const levelMultiplier = 1 + (level - 1) * difficulty.modifiers.levelScaling;
    const negativeChance = Math.min(difficulty.modifiers.negativeThoughtChance + (level - 1) * 0.1, 0.9);
    const isPositive = Math.random() > negativeChance;
    
    
    let text: string;
    let powerUpType: string | undefined;

    if (isPositive) {
      const positiveThought =
        POSITIVE_THOUGHTS[Math.floor(Math.random() * POSITIVE_THOUGHTS.length)];
      text = positiveThought.text;
      powerUpType = Math.random() < difficulty.modifiers.powerUpChance ? positiveThought.powerUp : undefined;
    } else {
      text =
        NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)];
    }

    // Slower base speed for better readability
    const baseSpeed = isPositive 
      ? 0.5 + Math.random() * (difficulty.modifiers.thoughtSpeed * 0.5)
      : 0.8 + Math.random() * (difficulty.modifiers.thoughtSpeed * 0.6);
    
    const levelSpeed = baseSpeed * levelMultiplier;
    // Apply dynamic difficulty multiplier if player is dominating (but cap it lower)
    const finalSpeed = levelSpeed * Math.min(gameStateRef.current.dynamicDifficultyMultiplier, 1.2);

    const newThought: Thought = {
      id: ++gameStateRef.current.thoughtIdCounter,
      text,
      isPositive,
      x: Math.random() * (GAME_WIDTH - 120),
      y: -50,
      speed: finalSpeed,
      powerUpType: powerUpType as any,
    };

    setThoughts((prev) => {
      const updated = [...prev, newThought];
      return updated;
    });

    setGameState((prev) => ({
      ...prev,
      thoughtsInWave: prev.thoughtsInWave + 1,
    }));
    
    setTotalThoughtsSpawned(prev => prev + 1);
  }, [gameStarted, lives, level, getDifficultyConfig, POSITIVE_THOUGHTS, NEGATIVE_THOUGHTS]);

  // Game loop is now handled by useGameLoop hook
  const handleThoughtPress = (thought: Thought): void => {
    if (!thought.isPositive) {
      // No points for tapping negative thoughts (optional: add a tiny penalty or nothing)
      return;
    }
  
    const difficulty = getDifficultyConfig();
    const basePoints = 25 * difficulty.modifiers.scoreMultiplier;
    const points = Math.round(basePoints * gameState.scoreMultiplier);
  
    setScore((prev) => prev + points);
  
    if (thought.powerUpType) {
      activatePowerUp(thought.powerUpType);
      setPowerupsCollected((prev) => prev + 1);
    }
  
    // Track unique thoughts collected
    setUniqueThoughtsCollected((prev) => new Set([...prev, thought.text]));
  
    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    setGameState((prev) => ({
      ...prev,
      thoughtsCleared: prev.thoughtsCleared + 1,
    }));
  
    setPositiveThoughtsCleared((prev) => prev + 1);
  
    // Optional: if your logger has a dedicated "collect" call, use it; otherwise keep enemyDestroyed
    logger.enemyDestroyed(level, 'thought', points);
  };

  const startGame = useCallback((): void => {
    gameStateRef.current.gameEnded = false;
    
    const adaptiveDifficulty = getAdaptiveDifficulty(selectedDifficulty);
    if (adaptiveDifficulty !== selectedDifficulty) {
      setSelectedDifficulty(adaptiveDifficulty);
    }
    
    const difficulty = getDifficultyConfig();

    setScore(0);
    setLives(difficulty.modifiers.livesStart);
    setLevel(1);
    setThoughts([]);
    setProjectiles([]);
    setPlayerX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setCanShoot(true);
    setGameState({
      wave: 1,
      thoughtsInWave: 0,
      thoughtsCleared: 0,
      scoreMultiplier: 1,
      timeSlowActive: false,
      shieldActive: false,
      multiShotActive: false,
      fastShootActive: false,
      waveComplete: false,
    });
    setGameStarted(true);
    setShowDifficultySelect(false);
    
    setGameStartTime(Date.now());
    setTotalThoughtsSpawned(0);
    setPositiveThoughtsCleared(0);
    setNegativeThoughtsCleared(0);
    setShotsFired(0);
    setHits(0);
    setMissedShots(0);
    setPowerupsCollected(0);
    setUniqueThoughtsDefeated(new Set());
    setUniqueThoughtsCollected(new Set());
    
    // Reset dynamic difficulty and counters
    setDynamicDifficultyMultiplier(1.0);
    setLastDifficultyRamp(0);
    setShowDifficultyRampNotification(false);
    gameStateRef.current.thoughtIdCounter = 0;
    gameStateRef.current.projectileIdCounter = 0;

    const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty].name as TDifficulty;
    logger.start(difficultyName);
    logger.waveStart(1);
  }, [selectedDifficulty, getDifficultyConfig, getAdaptiveDifficulty, logger]);

  const checkWinCondition = useCallback(async (): Promise<void> => {
    const difficulty = getDifficultyConfig();
    const currentWaveTarget = getCurrentWaveTarget();

    if (gameState.thoughtsCleared >= currentWaveTarget) {
      setGameState((prev) => ({ ...prev, waveComplete: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, waveComplete: false })),
          8000
        );

      if (level >= difficulty.modifiers.maxLevels) {
        if (gameStateRef.current.gameEnded) {
          return;
        }
        gameStateRef.current.gameEnded = true;
        
        setGameStarted(false);
        
        const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const totalThoughtsCleared = positiveThoughtsCleared + negativeThoughtsCleared;
        const currentExperience = character.backendCharacter?.experience || 0;
        
        const gameEndTime = Date.now();
        const performance = convertGameDataToPerformance(
          score,
          level,
          true,
          totalThoughtsCleared,
          totalThoughtsSpawned,
          survivalTime,
          gameStartTime,
          gameEndTime
        );
        
        const ddaResult = calculateDifficulty(performance);
        updateBaseline(performance);
        
        handleGameOver({
          score,
          level,
          wavesCleared: gameState.wave,
          shotsFired,
          hits,
          livesRemaining: lives,
          durationMs: Date.now() - gameStartTime,
          difficulty: selectedDifficulty,
          result: 'win',
          powerupsCollected,
          startedAt: gameStartTime,
          finishedAt: Date.now(),
        });

        const durationMs = Date.now() - gameStartTime;
        const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty].name as TDifficulty;
        logger.end({
          duration_ms: durationMs,
          waves_cleared: level,
          kills: positiveThoughtsCleared + negativeThoughtsCleared,
          score,
          difficulty: difficultyName,
          quit_reason: 'completed',
          accuracy: shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : undefined,
        });
        
        const rewardResult = processThoughtDefenderCompletion(
          score,
          level,
          true,
          selectedDifficulty,
          totalThoughtsCleared,
          totalThoughtsSpawned,
          survivalTime,
          currentExperience
        );
        
        if (rewardResult.success) {
          if (ui.researchCondition === "character") {
            await character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
          } else {
            await character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
          }
          
          const backendWellnessStats: Record<string, number> = {};
          if (rewardResult.rewards.wellnessStats.exploration !== undefined) {
            backendWellnessStats.awareness = rewardResult.rewards.wellnessStats.exploration;
          }
          if (rewardResult.rewards.wellnessStats.courage !== undefined) {
            backendWellnessStats.resilience = rewardResult.rewards.wellnessStats.courage;
          }
          if (rewardResult.rewards.wellnessStats.connection !== undefined) {
            backendWellnessStats.connection = rewardResult.rewards.wellnessStats.connection;
          }
          if (rewardResult.rewards.wellnessStats.fear !== undefined) {
            backendWellnessStats.balance = rewardResult.rewards.wellnessStats.fear;
          }

          // Apply wellness gains silently (no alert popups)
          gainWellnessSilently(backendWellnessStats);
          
          const rewardMessage = formatThoughtDefenderRewardMessage(
            rewardResult.rewards, 
            rewardResult.levelsGained || 0
          );
          
          if (onScoreUpdate) onScoreUpdate({ 
            score, 
            level, 
            won: true, 
            difficulty: selectedDifficulty,
            accuracy: shotsFired > 0 ? hits / shotsFired : 0,
            missedShots,
            dynamicDifficultyMultiplier,
            shotsFired,
            hits
          });

          // Delay showing rewards so player can see final game state
          setTimeout(() => {
            const defeatedList = Array.from(uniqueThoughtsDefeated);
            const collectedList = Array.from(uniqueThoughtsCollected);
            const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
              ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              : '';
            
            Alert.alert(
              ' You have overcome your negative thoughts! ',
              `${rewardMessage}\n\n Against all odds you have conquered the ${difficulty.name} difficulty, and overcome your negative thoughts. You are one step closer to tackling anything that comes your way ${homeData?.userProfile?.character?.name}.${thoughtsSummary}`,
              [
                { text: '🎉 PLAY AGAIN', onPress: () => setShowDifficultySelect(true) },
                { text: '❌ EXIT', onPress: onClose }
              ]
            );
          }, 800);
        } else {
          if (onScoreUpdate) onScoreUpdate({ 
            score, 
            level, 
            won: true, 
            difficulty: selectedDifficulty,
            accuracy: shotsFired > 0 ? hits / shotsFired : 0,
            missedShots,
            dynamicDifficultyMultiplier,
            shotsFired,
            hits
          });

          // Delay showing rewards so player can see final game state
          setTimeout(() => {
            const defeatedList = Array.from(uniqueThoughtsDefeated);
            const collectedList = Array.from(uniqueThoughtsCollected);
            const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
              ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              : '';
            
            Alert.alert(
              'You have overcome your negative thoughts!',
              `CONGRATULATIONS!\n\nDifficulty: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${homeData?.userProfile?.character?.level}\n\n🧠 YOU HAVE MASTERED YOUR MIND!${thoughtsSummary}`,
              [
                { text: '🎉 PLAY AGAIN', onPress: () => setShowDifficultySelect(true) },
                { text: '❌ EXIT', onPress: onClose }
              ]
            );
          }, 800);
        }
        return;
      }

      setLevel((prev) => prev + 1);
      setLives((prev) => Math.min(prev + 1, 5));
      setGameState((prev) => ({
        ...prev,
        wave: prev.wave + 1,
        thoughtsInWave: 0,
        thoughtsCleared: 0,
      }));

      logger.waveStart(level + 1);
    }
  }, [gameState.thoughtsCleared, level, score, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig, getCurrentWaveTarget, gameStartTime, positiveThoughtsCleared, negativeThoughtsCleared, totalThoughtsSpawned, character, logger, ui]);

  const endGame = useCallback(async (): Promise<void> => {
    if (gameStateRef.current.gameEnded) {
      return;
    }
    gameStateRef.current.gameEnded = true;
    
    setGameStarted(false);

    const difficulty = getDifficultyConfig();
    
    const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const totalThoughtsCleared = positiveThoughtsCleared + negativeThoughtsCleared;
    const currentExperience = character.backendCharacter?.experience || 0;
    
    const gameEndTime = Date.now();
    const performance = convertGameDataToPerformance(
      score,
      level,
      false,
      totalThoughtsCleared,
      totalThoughtsSpawned,
      survivalTime,
      gameStartTime,
      gameEndTime
    );
    
    const ddaResult = calculateDifficulty(performance);
    updateBaseline(performance);
    
    handleGameOver({
      score,
      level,
      wavesCleared: gameState.wave - 1,
      shotsFired,
      hits,
      livesRemaining: lives,
      durationMs: Date.now() - gameStartTime,
      difficulty: selectedDifficulty,
      result: 'lose',
      powerupsCollected,
      startedAt: gameStartTime,
      finishedAt: Date.now(),
    });

    const durationMs = Date.now() - gameStartTime;
    const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty].name as TDifficulty;
    logger.end({
      duration_ms: durationMs,
      waves_cleared: level,
      kills: positiveThoughtsCleared + negativeThoughtsCleared,
      score,
      difficulty: difficultyName,
      quit_reason: 'dead',
      accuracy: shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : undefined,
    });
    
    const rewardResult = processThoughtDefenderCompletion(
      score,
      level,
      false,
      selectedDifficulty,
      totalThoughtsCleared,
      totalThoughtsSpawned,
      survivalTime,
      currentExperience
    );
    
    if (rewardResult.success) {
      if (ui.researchCondition === "character") {
        await character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
      } else {
        await character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
      }
      
      const backendWellnessStats: Record<string, number> = {};
      if (rewardResult.rewards.wellnessStats.exploration !== undefined) {
        backendWellnessStats.awareness = rewardResult.rewards.wellnessStats.exploration;
      }
      if (rewardResult.rewards.wellnessStats.courage !== undefined) {
        backendWellnessStats.resilience = rewardResult.rewards.wellnessStats.courage;
      }
      if (rewardResult.rewards.wellnessStats.connection !== undefined) {
        backendWellnessStats.connection = rewardResult.rewards.wellnessStats.connection;
      }
      if (rewardResult.rewards.wellnessStats.fear !== undefined) {
        backendWellnessStats.balance = rewardResult.rewards.wellnessStats.fear;
      }

      // Apply wellness gains silently (no alert popups)
      gainWellnessSilently(backendWellnessStats);

      const rewardMessage = formatThoughtDefenderRewardMessage(
        rewardResult.rewards,
        rewardResult.levelsGained || 0
      );
      
      if (onScoreUpdate) onScoreUpdate({ 
        score, 
        level, 
        won: false, 
        difficulty: selectedDifficulty,
        accuracy: shotsFired > 0 ? hits / shotsFired : 0,
        missedShots,
        dynamicDifficultyMultiplier,
        shotsFired,
        hits
      });

      // Delay showing rewards so player can see final game state
      setTimeout(() => {
        const defeatedList = Array.from(uniqueThoughtsDefeated);
        const collectedList = Array.from(uniqueThoughtsCollected);
        const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
          ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
          : '';
        
        Alert.alert(
          '💀 DEFEATED 💀',
          `The negative thoughts overwhelmed you!\n\nDIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n${rewardMessage}\n\nEven in defeat, you've gained resilience. Try again!${thoughtsSummary}`,
          [
            { text: '🔄 RETRY', onPress: () => setShowDifficultySelect(true) },
            { text: '❌ EXIT', onPress: onClose }
          ]
        );
      }, 800);
    } else {
      if (onScoreUpdate) onScoreUpdate({ 
        score, 
        level, 
        won: false, 
        difficulty: selectedDifficulty,
        accuracy: shotsFired > 0 ? hits / shotsFired : 0,
        missedShots,
        dynamicDifficultyMultiplier,
        shotsFired,
        hits
      });

      // Delay showing rewards so player can see final game state
      setTimeout(() => {
        const defeatedList = Array.from(uniqueThoughtsDefeated);
        const collectedList = Array.from(uniqueThoughtsCollected);
        const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
          ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
          : '';
        
        Alert.alert(
          '💀 DEFEATED 💀',
          `The negative thoughts overwhelmed you!\n\nDIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\nKeep training your mental defenses and try again!${thoughtsSummary}`,
          [
            { text: '🔄 RETRY', onPress: () => setShowDifficultySelect(true) },
            { text: '❌ EXIT', onPress: onClose }
          ]
        );
      }, 800);
    }
  }, [score, level, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig, gameStartTime, positiveThoughtsCleared, negativeThoughtsCleared, totalThoughtsSpawned, character, logger, ui]);
  // for HUD display - lives can't be less than the difficulty's lives start or 3
  const maxHudLives = Math.max(
    getDifficultyConfig().modifiers.livesStart,
    3,
    lives
  );

  // Spawn system - separate from game loop for better performance
  useEffect(() => {
    if (!gameStarted || lives <= 0) {
      spawnAccRef.current = 0;
      return;
    }

    let lastSpawnTime = Date.now();
    const spawnInterval = setInterval(() => {
      const now = Date.now();
      const dtMs = now - lastSpawnTime;
      lastSpawnTime = now;

      const difficulty = getDifficultyConfig();
      const baseSpawnMs = 2000 * difficulty.modifiers.spawnRate;
      const levelSpawnMs = Math.max(
        800,
        baseSpawnMs - (Math.max(0, level - 1) * 150)
      ) / gameStateRef.current.dynamicDifficultyMultiplier;

      spawnAccRef.current += dtMs;
      while (spawnAccRef.current >= levelSpawnMs) {
        spawnThought();
        spawnAccRef.current -= levelSpawnMs;
      }
    }, 100); // Check every 100ms for spawning

    return () => clearInterval(spawnInterval);
  }, [gameStarted, lives, level, getDifficultyConfig, spawnThought]);


  // Check win condition
  useEffect(() => {
    if (!gameStarted) return;
    checkWinCondition();
  }, [gameStarted, gameState.thoughtsCleared, level, checkWinCondition]);

  // End game when lives reach 0
  useEffect(() => {
    if (gameStarted && lives <= 0) {
      setTimeout(endGame, 500);
    }
  }, [lives, gameStarted, endGame]);

  // Reset when modal closes
  useEffect(() => {
    if (!visible) {
      setGameStarted(false);
      setShowDifficultySelect(false);
      gameStateRef.current.gameEnded = false;
      spawnAccRef.current = 0;
    }
  }, [visible]);


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalpassages}>
          {/* Header */}
          <View style={styles.header}>
            {gameStarted && (
              <GameHUD
                score={score}
                lives={lives}
                maxHudLives={maxHudLives}
                level={level}
                thoughtsCleared={gameState.thoughtsCleared}
                currentWaveTarget={getCurrentWaveTarget()}
                shotsFired={shotsFired}
                hits={hits}
                selectedDifficulty={selectedDifficulty}
                getDifficultyConfig={getDifficultyConfig}
              />
            )}
          </View>

          {/* Game Area */}
          <View style={[
            styles.gameArea,
            { 
              height: gameStarted ? GAME_HEIGHT : 'auto',
            }
          ]}>
            {!gameStarted && showDifficultySelect ? (
              <DifficultySelect
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
                onStartGame={startGame}
                onBack={() => setShowDifficultySelect(false)}
              />
            ) : !gameStarted ? (
              <StartScreen
                theme={theme}
                isLoadingGameData={isLoadingGameData}
                apiGameData={apiGameData}
                selectedDifficulty={selectedDifficulty}
                onStartGame={startGame}
                onSelectDifficulty={() => setShowDifficultySelect(true)}
              />
            ) : (
              // Game Screen - Simplified touch handling
              <View style={styles.gameContainer}>
                {/* Power-up Status */}
                <View style={styles.powerUpStatus}>
                  {gameState.shieldActive && (
                    <Text style={styles.powerUpIcon}>🛡️</Text>
                  )}
                  {gameState.multiShotActive && (
                    <Text style={styles.powerUpIcon}>⚡</Text>
                  )}
                  {gameState.timeSlowActive && (
                    <Text style={styles.powerUpIcon}>⏰</Text>
                  )}
                  {gameState.scoreMultiplier > 1 && (
                    <Text style={styles.powerUpIcon}>✨</Text>
                  )}
                  {gameState.fastShootActive && (
                    <Text style={styles.powerUpIcon}>🚀</Text>
                  )}
                  {dynamicDifficultyMultiplier > 1.0 && (
                    <Text style={[styles.powerUpIcon, { color: '#ff0041' }]}>
                      ⚡x{dynamicDifficultyMultiplier.toFixed(1)}
                    </Text>
                  )}
                </View>

                {/* Debug Info */}
                <Text style={styles.debugText}>
                  T: {thoughts.length} | P: {projectiles.length} | Hit: {hits}/{shotsFired} | Miss: {missedShots} | Diff: x{dynamicDifficultyMultiplier.toFixed(1)}
                </Text>
                
                {/* Final Level Indicator */}
                {level >= getDifficultyConfig().modifiers.maxLevels && (
                  <View style={{
                    position: 'absolute',
                    top: 25,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 50
                  }}>
                    <Text style={{
                      color: '#FCD34D',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textShadowColor: '#000',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 8
                    }}>
                      🏆 FINAL LEVEL! 🏆
                    </Text>
                  </View>
                )}
                
                {/* Dynamic Difficulty Ramp Notification */}
                {showDifficultyRampNotification && (
                  <View style={{
                    position: 'absolute',
                    top: level >= getDifficultyConfig().modifiers.maxLevels ? 60 : 25,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 50
                  }}>
                    <Text style={{
                      color: '#ff0041',
                      fontSize: 14,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textShadowColor: '#000',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                      backgroundColor: 'rgba(255,0,0,0.8)',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: '#ff0041'
                    }}>
                      ⚠️ DIFFICULTY INCREASED! ⚠️
                    </Text>
                  </View>
                )}

                {/* Background touch area for tap-to-shoot */}
                <View
                  style={styles.backgroundTouchArea}
                  onStartShouldSetResponder={() => !isDraggingPaddle}
                  onResponderGrant={(evt) => {
                    const { locationX, locationY } = evt.nativeEvent;
                    touchStartTimeRef.current = Date.now();
                    touchStartPosRef.current = { x: locationX, y: locationY };
                  }}
                  onResponderRelease={(evt) => {
                    const touchDuration = Date.now() - touchStartTimeRef.current;
                    const { locationX, locationY } = evt.nativeEvent;
                    const dx = Math.abs(locationX - touchStartPosRef.current.x);
                    const dy = Math.abs(locationY - touchStartPosRef.current.y);

                    // If it's a quick tap (not a drag), shoot
                    if (touchDuration < 200 && dx < 10 && dy < 10) {
                      shoot();
                    }
                  }}
                >
                  {/* Shooting Zone Visual Indicator */}
                  <View
                    style={styles.shootingZone}
                    pointerEvents="none"
                  >
                    {gameState.waveComplete && (
                      <Text style={styles.shootingZoneText}>WAVE COMPLETE!</Text>
                  )}
                  </View>
                </View>
                
                {/* Floating transparent text background for thoughts */}
                {thoughts.map((thought) => (
                  <View
                    key={`thought-text-${thought.id}`}
                    style={[
                      styles.thoughtFloatingText,
                      {
                        position: "absolute",
                        left: thought.x - 40,
                        top: thought.y - 50,
                        width: 120,
                      },
                    ]}
                    pointerEvents="none"
                  >
                    <Text style={styles.thoughtFloatingTextLabel} numberOfLines={2}>
                      {thought.text}
                    </Text>
                  </View>
                ))}
                
                {/* Thoughts - Sprite-based enemies and positive thoughts */}
                {thoughts.map((thought) => (
                  <TouchableOpacity
                    key={`thought-${thought.id}`}
                    style={[
                      styles.thoughtSprite,
                      {
                        position: "absolute",
                        left: thought.x,
                        top: thought.y,
                      },
                    ]}
                    onPress={() => {
                      handleThoughtPress(thought);
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Image
                      source={
                        thought.isPositive
                          ? require("../../../assets/thoughtDefender/positiveThought.png")
                          : require("../../../assets/thoughtDefender/negativeThought.png")
                      }
                      style={[
                        styles.thoughtSpriteImage,
                        thought.powerUpType && styles.thoughtSpriteImagePowerUp,
                      ]}
                      resizeMode="contain"
                    />
                    {thought.powerUpType && (
                      <View style={styles.powerUpBadgeContainer}>
                        <Text style={styles.powerUpBadge}>
                          {
                            POWER_UPS[
                              thought.powerUpType as keyof typeof POWER_UPS
                            ]?.icon
                          }
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
                
                {/* Player - Draggable Sprite */}
                <View
                  style={[
                    styles.player,
                    {
                      left: playerX,
                      opacity: isDraggingPaddle ? 0.9 : 1,
                      transform: [{ scale: isDraggingPaddle ? 1.05 : 1 }]
                    }
                  ]}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={(evt) => {
                    setIsDraggingPaddle(true);
                    touchStartTimeRef.current = Date.now();
                    const { locationX } = evt.nativeEvent;
                    touchStartPosRef.current = { x: locationX, y: 0 };
                  }}
                  onResponderMove={(evt) => {
                    const { pageX } = evt.nativeEvent;
                    // Convert pageX to game area relative position
                    const gameAreaLeft = (width - GAME_WIDTH) / 2;
                    const relativeX = pageX - gameAreaLeft;
                    const newX = Math.max(
                      0,
                      Math.min(GAME_WIDTH - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2)
                    );
                    setPlayerX(newX);
                  }}
                  onResponderRelease={(evt) => {
                    const touchDuration = Date.now() - touchStartTimeRef.current;
                    const { locationX } = evt.nativeEvent;
                    const dx = Math.abs(locationX - touchStartPosRef.current.x);

                    setIsDraggingPaddle(false);

                    // If it's a quick tap on the paddle (not a drag), shoot
                    if (touchDuration < 200 && dx < 10) {
                      shoot();
                    }
                  }}
                >
                  <Image
                    source={require("../../../assets/thoughtDefender/user.png")}
                    style={styles.playerSprite}
                    resizeMode="contain"
                  />
                </View>

                {/* Projectiles */}
                {projectiles.map((projectile) => (
                  <Image
                    key={`projectile-${projectile.id}`}
                    source={require("../../../assets/thoughtDefender/projectile.png")}
                    style={[
                      styles.projectileSprite,
                      {
                        left: projectile.x - 8,
                        top: projectile.y - 8,
                      },
                    ]}
                    resizeMode="contain"
                  />
                ))}
                
                {/* Confetti Animations */}
                {confettiAnimations.map((confetti) => (
                  <ConfettiAnimation
                    key={confetti.id}
                    visible={confetti.visible}
                    position={confetti.position}
                    text={confetti.text}
                  />
                ))}
              </View>
            )}

            {/* Scan Lines Effect */}
            <View style={styles.scanLines} pointerEvents="none" />
          </View>

          {/* Instructions */}
          {gameStarted && (
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>
                🎮 CONTROLS 🎮
              </Text>
              <Text style={styles.instructionText}>
                DRAG SHIELD 🛡️ TO MOVE
              </Text>
              <Text style={styles.instructionText}>
                TAP TO SHOOT ⚡
              </Text>
              <Text style={styles.instructionText}>
                TAP GREEN FOR POWER-UPS 💚
              </Text>
              <Text style={[styles.instructionText, { color: '#ff0041' }]}>
                ⚠️ MISSED SHOTS COST POINTS!
              </Text>
            </View>
          )}

          
          <TouchableOpacity onPress={onClose} style={ styles.exitButton }>
            <Text style={styles.exitButtonText}>🚪 EXIT GAME</Text>
          </TouchableOpacity>
            
        </View>
      </View>
    </Modal>
  );
};


export default ThoughtDefenderModal;