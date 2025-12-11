import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMasterState } from "../../context/MasterStateContext";
//import { DIFFICULTY_LEVELS, POWER_UPS } from '../../data/archivePaths';
import { convertGameDataToPerformance, useDDA } from "../../hooks/useDDA";
import { useProgressLogger } from "../../hooks/useProgressLogger";
import { apiService, TDifficulty } from "../../services/apiService";
//import { DifficultyConfig, GameState, Projectile, Thought } from '../../types/index';
import { ThoughtDefenderGameData, ThoughtDefenderRunDTO } from "../../types/thoughtDefender";
import { GameData } from "../../types/user";
import {
  formatThoughtDefenderRewardMessage,
  processThoughtDefenderCompletion,
} from "../../utils/rewardsUtils";

const { width, height } = Dimensions.get("window");
const GAME_WIDTH = width * 0.9;
const GAME_HEIGHT = Math.min(height * 0.5, 400); // Reduced and capped to ensure it fits
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 50;

const CharacterArchetypes = {
  scholar: {
    positiveThoughts: [
      { text: "Break into steps", powerUp: "slowtime" },
      { text: "Planning saves time", powerUp: "multiplier" },
      { text: "Stick with plans", powerUp: "extralife" },
      { text: "Details prevent problems", powerUp: "fastshoot" },
      { text: "Organize for results", powerUp: "shield" },
      { text: "persistence pays off", powerUp: "multishot" },
      { text: "Complete tasks thoroughly", powerUp: "slowtime" },
      { text: "I can wait for a better future", powerUp: "multiplier" },
    ],
    negativeThoughts: [
      "If I don't do this perfectly, it's not worth doing",
      "I should have planned better",
      "this mistake proves I'm incompetent",
      "I can't relax until everything on my list is complete",
      "Other people are so disorganized and irresponsible",
      "I'm behind schedule and everything is falling apart",
      "I should be more productive",
      "I'm wasting time",
      "If I don't control everything, something will go wrong",
    ],
  },
  warrior: {
    positiveThoughts: [
      { text: "Socialization energizes me", powerUp: "fastshoot" },
      { text: "Networking brings opportunities", powerUp: "shield" },
      { text: "Make challenges fun", powerUp: "extralife" },
      { text: "People spark creativity", powerUp: "multishot" },
      { text: "Express ideas confidently", powerUp: "shield" },
      { text: "Stimulation improves performance", powerUp: "multiplier" },
      { text: "collaboration creates energy", powerUp: "slowtime" },
      { text: "Inspire with enthusiasm", powerUp: "fastshoot" },
    ],
    negativeThoughts: [
      "I need to be around people right now or I'll feel empty",
      "If I'm alone too long, something must be wrong with me",
      "I should be more exciting and entertaining",
      "Quiet people probably think I'm annoying",
      "I can't handle this boring, repetitive task",
      "If I'm not the center of attention, I must be failing",
      "I need stimulation now; this is unbearable",
    ],
  },
  sage: {
    positiveThoughts: [
      { text: "Sensitivity notices details", powerUp: "slowtime" },
      { text: "Awareness helps preparation", powerUp: "multiplier" },
      { text: "Depth understands complexity", powerUp: "shield" },
      { text: "Concern motivates improvement", powerUp: "extralife" },
      { text: "Risk awareness informs", powerUp: "fastshoot" },
      { text: "Learn from challenges", powerUp: "multishot" },
      { text: "Processing reveals priorities", powerUp: "slowtime" },
      { text: "Deep feelings connect", powerUp: "multiplier" },
    ],
    negativeThoughts: [
      "What if everything goes wrong?",
      "I always mess things up",
      "They probably think I'm stupid",
      "This feeling will never go away",
      "I can't handle this stress",
      "Something bad is definitely going to happen",
      "I'm not good enough",
      "Everyone else has it figured out except me",
      "I should be over this by now",
      "This anxiety proves I'm weak",
    ],
  },
  healer: {
    positiveThoughts: [
      { text: "Find win-win solutions", powerUp: "extralife" },
      { text: "Understand their perspective", powerUp: "shield" },
      { text: "Trust good intentions", powerUp: "slowtime" },
      { text: "Help others succeed", powerUp: "multishot" },
      { text: "Maintain harmony", powerUp: "multiplier" },
      { text: "collaborate over compete", powerUp: "fastshoot" },
      { text: "Build lasting relationships", powerUp: "extralife" },
      { text: "Show empathy", powerUp: "shield" },
    ],
    negativeThoughts: [
      "I can't say no or they won't like me anymore",
      "I should put their needs before mine",
      "If I disagree, I'll hurt their feelings",
      "I'm being selfish for wanting this",
      "I must have done something wrong if they're upset",
      "I can't handle conflict",
      "I need to fix this immediately",
    ],
  },
  explorer: {
    positiveThoughts: [
      { text: "Try different approaches", powerUp: "fastshoot" },
      { text: "New perspectives help", powerUp: "multishot" },
      { text: "Challenge my beliefs", powerUp: "shield" },
      { text: "Combine different ideas", powerUp: "multiplier" },
      { text: "Explore new concepts", powerUp: "extralife" },
      { text: "Connect unrelated things", powerUp: "slowtime" },
      { text: "Change when needed", powerUp: "fastshoot" },
      { text: "Abstract becomes practical", powerUp: "multishot" },
    ],
    negativeThoughts: [
      "I can't decide because a better option may exist",
      "This work is meaningless and beneath my potential",
      "What if I'm missing out on something more interesting?",
      "I have so many ideas but I never finish anything",
      "Other people don't understand my creative vision",
      "This conventional approach is boring and uninspiring",
      "I should be innovating more in my life",
    ],
  },
};
const FRAME_MS = 1000 / 60; // 60 fps constant

const getCharacterArchetype = (characterData: {
  selectedBaseModel: any;
  selectedHairStyle: any;
  selectedEyeType: any;
  selectedMouthType: any;
  selectedShirtType: any;
}) => {
  const total =
    characterData.selectedBaseModel +
    characterData.selectedHairStyle +
    characterData.selectedEyeType +
    characterData.selectedMouthType +
    characterData.selectedShirtType;

  if (total % 5 === 0) return CharacterArchetypes.scholar;
  if (total % 5 === 1) return CharacterArchetypes.warrior;
  if (total % 5 === 2) return CharacterArchetypes.sage;
  if (total % 5 === 3) return CharacterArchetypes.healer;
  return CharacterArchetypes.explorer;
};

const getPersonalityArchetype = (personalityData: string) => {
  if (personalityData == "Openness") return CharacterArchetypes.explorer;
  if (personalityData == "Conscientiousness")
    return CharacterArchetypes.scholar;
  if (personalityData == "Extraversion") return CharacterArchetypes.warrior;
  if (personalityData == "Agreeableness") return CharacterArchetypes.healer;
  if (personalityData === "Neuroticism") return CharacterArchetypes.sage;
  return CharacterArchetypes.explorer;
};

// TypeScript Interfaces
interface Position {
  x: number;
  y: number;
}

interface Thought {
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

interface Projectile {
  id: number;
  x: number;
  y: number;
  speed: number;
}

interface PowerUp {
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

interface GameState {
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

interface DifficultyConfig {
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

const DIFFICULTY_LEVELS: Record<string, DifficultyConfig> = {
  zen: {
    name: "ZEN",
    icon: "🧘",
    modifiers: {
      thoughtSpeed: 0.6,
      spawnRate: 1.5,
      negativeThoughtChance: 0.25,
      powerUpChance: 0.5,
      scoreMultiplier: 0.8,
      livesStart: 5,
      waveTarget: 8,
      levelScaling: 0.1,
      maxLevels: 2,
    },
  },
  normal: {
    name: "BALANCED",
    icon: "🎯",
    modifiers: {
      thoughtSpeed: 1.0,
      spawnRate: 1.0,
      negativeThoughtChance: 0.4,
      powerUpChance: 0.3,
      scoreMultiplier: 1.0,
      livesStart: 3,
      waveTarget: 12,
      levelScaling: 0.15,
      maxLevels: 3,
    },
  },
  intense: {
    name: "INTENSE",
    icon: "💪",
    modifiers: {
      thoughtSpeed: 1.25,
      spawnRate: 0.7,
      negativeThoughtChance: 0.6,
      powerUpChance: 0.2,
      scoreMultiplier: 1.5,
      livesStart: 2,
      waveTarget: 15,
      levelScaling: 0.2,
      maxLevels: 4,
    },
  },
  nightmare: {
    name: "NIGHTMARE",
    icon: "💀",
    modifiers: {
      thoughtSpeed: 1.5,
      spawnRate: 0.5,
      negativeThoughtChance: 0.75,
      powerUpChance: 0.15,
      scoreMultiplier: 2.0,
      livesStart: 1,
      waveTarget: 18,
      levelScaling: 0.25,
      maxLevels: 5,
    },
  },
};

// Power-up definitions
const POWER_UPS = {
  shield: {
    name: "🛡️ SHIELD",
    description: "Temporary invincibility",
    duration: 5000,
    icon: "🛡️",
  },
  multishot: {
    name: "⚡ MULTI-SHOT",
    description: "Shoot 3 projectiles",
    duration: 8000,
    icon: "⚡",
  },
  slowtime: {
    name: "⏰ SLOW TIME",
    description: "Slow down thoughts",
    duration: 6000,
    icon: "⏰",
  },
  extralife: {
    name: "❤️ EXTRA LIFE",
    description: "Gain one life",
    duration: 0,
    icon: "❤️",
  },
  multiplier: {
    name: "✨ SCORE x2",
    description: "Double score for 10s",
    duration: 10000,
    icon: "✨",
  },
  fastshoot: {
    name: "🚀 RAPID FIRE",
    description: "Faster shooting",
    duration: 7000,
    icon: "🚀",
  },
};

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
  const [showDifficultySelect, setShowDifficultySelect] =
    useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("normal");
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  // Game data from API
  const [apiGameData, setApiGameData] = useState<GameData | null>(null);
  const [isLoadingGameData, setIsLoadingGameData] = useState<boolean>(false);
  const spawnAccRef = useRef<number>(0);

  useEffect(() => {
    thoughtsRef.current = thoughts;
  }, [thoughts]);

  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);

  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);
  const [playerX, setPlayerX] = useState<number>(
    GAME_WIDTH / 2 - PADDLE_WIDTH / 2
  );
  const [canShoot, setCanShoot] = useState<boolean>(true);
  const [isDraggingPaddle, setIsDraggingPaddle] = useState<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [totalThoughtsSpawned, setTotalThoughtsSpawned] = useState<number>(0);
  const [positiveThoughtsCleared, setPositiveThoughtsCleared] =
    useState<number>(0);
  const [negativeThoughtsCleared, setNegativeThoughtsCleared] =
    useState<number>(0);
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [missedShots, setMissedShots] = useState<number>(0);
  const [powerupsCollected, setPowerupsCollected] = useState<number>(0);

  // Dynamic difficulty scaling
  const [dynamicDifficultyMultiplier, setDynamicDifficultyMultiplier] =
    useState<number>(1.0);
  const [lastDifficultyRamp, setLastDifficultyRamp] = useState<number>(0);
  const [showDifficultyRampNotification, setShowDifficultyRampNotification] =
    useState<boolean>(false);

  const {
    ddaState,
    calculateDifficulty,
    updateBaseline,
    getAdaptiveDifficulty,
    getAdaptiveModifiers,
  } = useDDA();

  const logger = useProgressLogger({
    game: "thought_defender",
    flushIntervalMs: 4000,
    maxBuffer: 200,
  });

  const { wellness, character, theme, archive } = useMasterState();
  const homeData = wellness.homeData;
  const backendCharacter = character.backendCharacter;
  const hasHomeData =
    homeData && "userProfile" in homeData
      ? homeData.userProfile?.character
      : homeData;
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
        Object.entries(gains).filter(([, v]) => typeof v === "number" && v > 0)
      );

      // Only make API call if there are positive gains
      if (Object.keys(payload).length === 0) return;

      // Call API and silently update character state (no alerts)
      await apiService.gainWellness(id, payload);
      // Successfully updated - the character state will refresh on next screen navigation
    } catch (error) {
      console.error("Failed to gain wellness:", error);
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
          console.error("[ThoughtDefender] Failed to load game data:", error);
          // Continue with default values if API fails
        } finally {
          setIsLoadingGameData(false);
        }
      };

      fetchGameData();
    }
  }, [visible, isLoadingGameData, apiGameData]);

  const getThoughtsForCharacter = useCallback(() => {
    // First, try to use API personality data if available
    if (apiGameData?.personality_data) {
      const personalityData = apiGameData.personality_data;

      // Find the highest trait
      const traits = {
        openness: personalityData.openness,
        conscientiousness: personalityData.conscientiousness,
        extraversion: personalityData.extraversion,
        agreeableness: personalityData.agreeableness,
        neuroticism: personalityData.neuroticism,
      };

      const highestTrait = Object.entries(traits).reduce(
        (max, [key, value]) => (value > max.value ? { key, value } : max),
        { key: "openness", value: traits.openness }
      );

      const traitMap: Record<string, keyof typeof CharacterArchetypes> = {
        openness: "explorer",
        conscientiousness: "scholar",
        extraversion: "warrior",
        agreeableness: "healer",
        neuroticism: "sage",
      };

      const archetypeKey = traitMap[highestTrait.key] || "scholar";
      const archetype = CharacterArchetypes[archetypeKey];

      return {
        positiveThoughts: archetype.positiveThoughts,
        negativeThoughts: archetype.negativeThoughts,
      };
    }

    if (hasHomeData && hasBackendCharacter) {
      const characterData = {
        selectedBaseModel: character.selectedBaseModel || 0,
        selectedHairStyle: character.selectedHairStyle || 0,
        selectedEyeType: character.selectedEyeType || 0,
        selectedMouthType: character.selectedMouthType || 0,
        selectedShirtType: character.selectedShirtType || 0,
      };

      const characterArchetype = getCharacterArchetype(characterData);

      return {
        positiveThoughts: characterArchetype.positiveThoughts,
        negativeThoughts: characterArchetype.negativeThoughts,
      };
    }
    if (primaryTrait) {
      const personalityArchetype = getPersonalityArchetype(primaryTrait);
      return {
        positiveThoughts: personalityArchetype.positiveThoughts,
        negativeThoughts: personalityArchetype.negativeThoughts,
      };
    }

    return {
      positiveThoughts: CharacterArchetypes.scholar.positiveThoughts,
      negativeThoughts: CharacterArchetypes.scholar.negativeThoughts,
    };
  }, [hasHomeData, hasBackendCharacter, character, primaryTrait, apiGameData]);

  const {
    positiveThoughts: POSITIVE_THOUGHTS,
    negativeThoughts: NEGATIVE_THOUGHTS,
  } = getThoughtsForCharacter();

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
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);

  const thoughtIdCounter = useRef<number>(0);
  const projectileIdCounter = useRef<number>(0);
  const thoughtsRef = useRef<Thought[]>([]);
  const gameEndedRef = useRef<boolean>(false);

  // Keep latest functions/values without re-creating the RAF loop
  const updateGameRef = useRef<(dt: number) => void>(() => {});
  const spawnThoughtRef = useRef<() => void>(() => {});
  const getDifficultyRef = useRef<() => DifficultyConfig>(
    () => DIFFICULTY_LEVELS.normal
  );

  const levelRef = useRef(level);
  const livesRef = useRef(lives);
  const gameStartedRef = useRef(gameStarted);
  const dynamicDifficultyRef = useRef(dynamicDifficultyMultiplier);

  const getDifficultyConfig = useCallback((): DifficultyConfig => {
    const baseDifficulty =
      DIFFICULTY_LEVELS[selectedDifficulty] || DIFFICULTY_LEVELS.normal;

    if (ddaState.lastResult) {
      const adaptiveModifiers = getAdaptiveModifiers(baseDifficulty.modifiers);
      return {
        ...baseDifficulty,
        modifiers: adaptiveModifiers,
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
    const thoughtClearRate =
      survivalTime > 0
        ? (positiveThoughtsCleared + negativeThoughtsCleared) / survivalTime
        : 0;

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
      setDynamicDifficultyMultiplier((prev) => Math.min(1.5, prev + 0.15));
      setLastDifficultyRamp(currentTime);
      setShowDifficultyRampNotification(true);
      setTimeout(() => setShowDifficultyRampNotification(false), 3000);
      logger.waveStart(level); // Log difficulty increase
    } else if (isDominating && dynamicDifficultyMultiplier < 1.3) {
      // Ramp up moderately
      setDynamicDifficultyMultiplier((prev) => Math.min(1.3, prev + 0.1));
      setLastDifficultyRamp(currentTime);
      setShowDifficultyRampNotification(true);
      setTimeout(() => setShowDifficultyRampNotification(false), 3000);
      logger.waveStart(level); // Log difficulty increase
    }
  }, [
    gameStarted,
    lives,
    shotsFired,
    hits,
    score,
    gameStartTime,
    positiveThoughtsCleared,
    negativeThoughtsCleared,
    lastDifficultyRamp,
    dynamicDifficultyMultiplier,
    level,
    logger,
  ]);

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
    result: "win" | "lose" | "quit";
    perksUsed?: string[];
    powerupsCollected?: number;
    startedAt: number; // epoch ms
    finishedAt: number; // epoch ms
  }) => {
    const accuracy =
      finalStats.shotsFired > 0 ? finalStats.hits / finalStats.shotsFired : 0; // updating math so that it's not just based on hits

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
      clientVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? "web",
    };

    try {
      await archive.logThoughtDefenderRun(payload);
    } catch {}

    // Update game data API with new score and level
    if (apiGameData?.id) {
      try {
        const updatedGameData = await apiService.updateGameDataScore(
          apiGameData.id,
          {
            score: finalStats.score,
            level: finalStats.level,
            difficulty_levels: apiGameData.difficulty_levels.includes(
              finalStats.difficulty
            )
              ? apiGameData.difficulty_levels
              : [...apiGameData.difficulty_levels, finalStats.difficulty],
          }
        );

        setApiGameData(updatedGameData);
      } catch (error) {
        console.error("[ThoughtDefender] Failed to update game data:", error);
        // Non-critical error, continue with game flow
      }
    }
  };

  const getCurrentWaveTarget = useCallback((): number => {
    const difficulty = getDifficultyConfig();
    const levelBonus = Math.floor(
      (level - 1) *
        difficulty.modifiers.waveTarget *
        difficulty.modifiers.levelScaling
    );
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

  const activatePowerUp = useCallback(
    (powerUpType: string): void => {
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
    },
    [logger, level]
  );

  const spawnThought = useCallback((): void => {
    if (!gameStarted || lives <= 0) return;

    if (POSITIVE_THOUGHTS.length === 0 || NEGATIVE_THOUGHTS.length === 0) {
      return;
    }

    const difficulty = getDifficultyConfig();

    const levelMultiplier = 1 + (level - 1) * difficulty.modifiers.levelScaling;
    const negativeChance = Math.min(
      difficulty.modifiers.negativeThoughtChance + (level - 1) * 0.1,
      0.9
    );
    const isPositive = Math.random() > negativeChance;

    let text: string;
    let powerUpType: string | undefined;

    if (isPositive) {
      const positiveThought =
        POSITIVE_THOUGHTS[Math.floor(Math.random() * POSITIVE_THOUGHTS.length)];
      text = positiveThought.text;
      powerUpType =
        Math.random() < difficulty.modifiers.powerUpChance
          ? positiveThought.powerUp
          : undefined;
    } else {
      text =
        NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)];
    }

    const baseSpeed = isPositive
      ? 1 + Math.random() * difficulty.modifiers.thoughtSpeed
      : 2 + Math.random() * difficulty.modifiers.thoughtSpeed;

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

    setTotalThoughtsSpawned((prev) => prev + 1);
  }, [
    gameStarted,
    lives,
    level,
    getDifficultyConfig,
    POSITIVE_THOUGHTS,
    NEGATIVE_THOUGHTS,
  ]);

  const updateGame = useCallback(
    (dtMs: number = FRAME_MS): void => {
      // dtMs is the time since the last frame in milliseconds
      if (!gameStarted || lives <= 0) return;
      const globalSpeedScale = gameState.timeSlowActive ? 0.5 : 1; // time slow active slows down everything
      const f = (dtMs / FRAME_MS) * globalSpeedScale; // frame scaling factor
      let collisionData = {
        thoughtsToRemove: new Set<number>(),
        projectilesToRemove: new Set<number>(),
      };

      setThoughts((prev) => {
        let updated = prev
          .map((t) => ({ ...t, y: t.y + t.speed * f })) //moving thoughts through each frame
          .filter((t) => {
            if (t.y > GAME_HEIGHT - 60) {
              if (!t.isPositive) {
                if (!gameState.shieldActive) {
                  setLives((currentLives) => {
                    const newLives = Math.max(0, currentLives - 1);
                    logger.playerHit(level, 1, newLives);
                    return newLives;
                  });
                }
                setNegativeThoughtsCleared((prev) => prev + 1);
              }
              setGameState((prev) => ({
                ...prev,
                thoughtsCleared: prev.thoughtsCleared + 1,
              }));

              return false;
            }
            return true;
          });

        const currentProjectiles = projectilesRef.current;

        for (let i = currentProjectiles.length - 1; i >= 0; i--) {
          const projectile = currentProjectiles[i];

          for (let j = updated.length - 1; j >= 0; j--) {
            const thought = updated[j];

            if (
              !thought.isPositive &&
              !collisionData.thoughtsToRemove.has(thought.id)
            ) {
              const dx = projectile.x - (thought.x + 40);
              const dy = projectile.y - (thought.y + 20);
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 42) {
                collisionData.thoughtsToRemove.add(thought.id);
                collisionData.projectilesToRemove.add(projectile.id);

                const difficulty = getDifficultyConfig();
                const basePoints = 15 * difficulty.modifiers.scoreMultiplier;
                const points = Math.round(
                  basePoints * gameState.scoreMultiplier
                );
                setScore((prevScore) => {
                  const newScore = prevScore + points;
                  return newScore;
                });

                setGameState((prev) => ({
                  ...prev,
                  thoughtsCleared: prev.thoughtsCleared + 1,
                }));

                setNegativeThoughtsCleared((prev) => prev + 1);
                setHits((prev) => prev + 1);
                logger.enemyDestroyed(level, "thought", points);

                break;
              }
            }
          }
        }

        return updated.filter((t) => !collisionData.thoughtsToRemove.has(t.id)); //filtering out thoughts that have been removed
      });

      setProjectiles((prev) => {
        const projectileSpeedScale = gameState.fastShootActive ? 1.2 : 1;
        const f = (dtMs / FRAME_MS) * (gameState.timeSlowActive ? 0.5 : 1); // same factor used for thoughts

        // Track missed shots and apply penalty
        const difficulty = getDifficultyConfig();
        const missedPenalty = Math.floor(
          5 * difficulty.modifiers.scoreMultiplier
        ); // Scaled by difficulty

        return prev
          .map((p) => ({ ...p, y: p.y - p.speed * projectileSpeedScale * f }))
          .filter((p) => {
            const isOffScreen = p.y <= -20;
            if (isOffScreen && !collisionData.projectilesToRemove.has(p.id)) {
              // This shot missed - apply penalty
              setMissedShots((prev) => prev + 1);
              setScore((prevScore) => Math.max(0, prevScore - missedPenalty));
            }
            return !isOffScreen;
          })
          .filter((p) => !collisionData.projectilesToRemove.has(p.id));
      });
    },
    [
      gameStarted,
      lives,
      gameState.shieldActive,
      gameState.scoreMultiplier,
      gameState.timeSlowActive,
      gameState.fastShootActive,
      getDifficultyConfig,
      logger,
      level,
      score,
    ]
  );
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

    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    setGameState((prev) => ({
      ...prev,
      thoughtsCleared: prev.thoughtsCleared + 1,
    }));

    setPositiveThoughtsCleared((prev) => prev + 1);

    // Optional: if your logger has a dedicated "collect" call, use it; otherwise keep enemyDestroyed
    logger.enemyDestroyed(level, "thought", points);
  };

  const startGame = useCallback((): void => {
    gameEndedRef.current = false;

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

    // Reset dynamic difficulty
    setDynamicDifficultyMultiplier(1.0);
    setLastDifficultyRamp(0);
    setShowDifficultyRampNotification(false);
    gameStateRef.current.thoughtIdCounter = 0;
    gameStateRef.current.projectileIdCounter = 0;

    const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty]
      .name as TDifficulty;
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
        gameEndedRef.current = true;

        setGameStarted(false);

        // Cancel RAF - handled by useEffect cleanup
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const totalThoughtsCleared =
          positiveThoughtsCleared + negativeThoughtsCleared;
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
          result: "win",
          powerupsCollected,
          startedAt: gameStartTime,
          finishedAt: Date.now(),
        });

        const durationMs = Date.now() - gameStartTime;
        const difficultyName: TDifficulty = DIFFICULTY_LEVELS[
          selectedDifficulty
        ].name as TDifficulty;
        logger.end({
          duration_ms: durationMs,
          waves_cleared: level,
          kills: positiveThoughtsCleared + negativeThoughtsCleared,
          score,
          difficulty: difficultyName,
          quit_reason: "completed",
          accuracy:
            shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : undefined,
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
          if (ui.researchCondition === "A") {
            character.gainLumens(
              rewardResult.rewards.experience,
              "ThoughtDefender"
            );
          } else {
            character.gainExperience(
              rewardResult.rewards.experience,
              "ThoughtDefender"
            );
          }

          const backendWellnessStats: Record<string, number> = {};
          if (rewardResult.rewards.wellnessStats.exploration !== undefined) {
            backendWellnessStats.awareness =
              rewardResult.rewards.wellnessStats.exploration;
          }
          if (rewardResult.rewards.wellnessStats.courage !== undefined) {
            backendWellnessStats.resilience =
              rewardResult.rewards.wellnessStats.courage;
          }
          if (rewardResult.rewards.wellnessStats.connection !== undefined) {
            backendWellnessStats.connection =
              rewardResult.rewards.wellnessStats.connection;
          }
          if (rewardResult.rewards.wellnessStats.fear !== undefined) {
            backendWellnessStats.balance =
              rewardResult.rewards.wellnessStats.fear;
          }

          // Apply wellness gains silently (no alert popups)
          gainWellnessSilently(backendWellnessStats);

          const rewardMessage = formatThoughtDefenderRewardMessage(
            rewardResult.rewards,
            rewardResult.levelsGained || 0
          );

          if (onScoreUpdate)
            onScoreUpdate({
              score,
              level,
              won: true,
              difficulty: selectedDifficulty,
              accuracy: shotsFired > 0 ? hits / shotsFired : 0,
              missedShots,
              dynamicDifficultyMultiplier,
              shotsFired,
              hits,
            });

          // Delay showing rewards so player can see final game state
          setTimeout(() => {
            const defeatedList = Array.from(uniqueThoughtsDefeated);
            const collectedList = Array.from(uniqueThoughtsCollected);
            const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
              ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              : '';
            
            Alert.alert(
              " You have overcome your negative thoughts! ",
              `${rewardMessage}\n\n Against all odds you have conquered the ${difficulty.name} difficulty, and overcome your negative thoughts. You are one step closer to tackling anything that comes your way ${homeData?.userProfile?.character?.name}.`,
              [
                {
                  text: "🎉 PLAY AGAIN",
                  onPress: () => setShowDifficultySelect(true),
                },
                { text: "❌ EXIT", onPress: onClose },
              ]
            );
          }, 800);
        } else {
          if (onScoreUpdate)
            onScoreUpdate({
              score,
              level,
              won: true,
              difficulty: selectedDifficulty,
              accuracy: shotsFired > 0 ? hits / shotsFired : 0,
              missedShots,
              dynamicDifficultyMultiplier,
              shotsFired,
              hits,
            });

          // Delay showing rewards so player can see final game state
          setTimeout(() => {
            const defeatedList = Array.from(uniqueThoughtsDefeated);
            const collectedList = Array.from(uniqueThoughtsCollected);
            const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
              ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
              : '';
            
            Alert.alert(
              "You have overcome your negative thoughts!",
              `CONGRATULATIONS!\n\nDifficulty: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${homeData?.userProfile?.character?.level}\n\n🧠 YOU HAVE MASTERED YOUR MIND!`,
              [
                {
                  text: "🎉 PLAY AGAIN",
                  onPress: () => setShowDifficultySelect(true),
                },
                { text: "❌ EXIT", onPress: onClose },
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
  }, [
    gameState.thoughtsCleared,
    level,
    score,
    onScoreUpdate,
    onClose,
    selectedDifficulty,
    getDifficultyConfig,
    getCurrentWaveTarget,
    gameStartTime,
    positiveThoughtsCleared,
    negativeThoughtsCleared,
    totalThoughtsSpawned,
    character,
    logger,
    ui,
  ]);

  const endGame = useCallback(async (): Promise<void> => {
    if (gameStateRef.current.gameEnded) {
      return;
    }
    gameEndedRef.current = true;

    setGameStarted(false);

    const difficulty = getDifficultyConfig();

    const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const totalThoughtsCleared =
      positiveThoughtsCleared + negativeThoughtsCleared;
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
      result: "lose",
      powerupsCollected,
      startedAt: gameStartTime,
      finishedAt: Date.now(),
    });

    const durationMs = Date.now() - gameStartTime;
    const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty]
      .name as TDifficulty;
    logger.end({
      duration_ms: durationMs,
      waves_cleared: level,
      kills: positiveThoughtsCleared + negativeThoughtsCleared,
      score,
      difficulty: difficultyName,
      quit_reason: "dead",
      accuracy:
        shotsFired > 0 ? Math.round((hits / shotsFired) * 100) : undefined,
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
      if (ui.researchCondition === "A") {
        character.gainLumens(
          rewardResult.rewards.experience,
          "ThoughtDefender"
        );
      } else {
        character.gainExperience(
          rewardResult.rewards.experience,
          "ThoughtDefender"
        );
      }

      const backendWellnessStats: Record<string, number> = {};
      if (rewardResult.rewards.wellnessStats.exploration !== undefined) {
        backendWellnessStats.awareness =
          rewardResult.rewards.wellnessStats.exploration;
      }
      if (rewardResult.rewards.wellnessStats.courage !== undefined) {
        backendWellnessStats.resilience =
          rewardResult.rewards.wellnessStats.courage;
      }
      if (rewardResult.rewards.wellnessStats.connection !== undefined) {
        backendWellnessStats.connection =
          rewardResult.rewards.wellnessStats.connection;
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

      if (onScoreUpdate)
        onScoreUpdate({
          score,
          level,
          won: false,
          difficulty: selectedDifficulty,
          accuracy: shotsFired > 0 ? hits / shotsFired : 0,
          missedShots,
          dynamicDifficultyMultiplier,
          shotsFired,
          hits,
        });

      // Delay showing rewards so player can see final game state
      setTimeout(() => {
        const defeatedList = Array.from(uniqueThoughtsDefeated);
        const collectedList = Array.from(uniqueThoughtsCollected);
        const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
          ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
          : '';
        
        Alert.alert(
          "💀 DEFEATED 💀",
          `The negative thoughts overwhelmed you!\n\nDIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n${rewardMessage}\n\nEven in defeat, you've gained resilience. Try again!`,
          [
            { text: "🔄 RETRY", onPress: () => setShowDifficultySelect(true) },
            { text: "❌ EXIT", onPress: onClose },
          ]
        );
      }, 800);
    } else {
      if (onScoreUpdate)
        onScoreUpdate({
          score,
          level,
          won: false,
          difficulty: selectedDifficulty,
          accuracy: shotsFired > 0 ? hits / shotsFired : 0,
          missedShots,
          dynamicDifficultyMultiplier,
          shotsFired,
          hits,
        });

      // Delay showing rewards so player can see final game state
      setTimeout(() => {
        const defeatedList = Array.from(uniqueThoughtsDefeated);
        const collectedList = Array.from(uniqueThoughtsCollected);
        const thoughtsSummary = defeatedList.length > 0 || collectedList.length > 0
          ? `\n\n💭 THOUGHTS DEFEATED (${defeatedList.length}):\n${defeatedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n💚 THOUGHTS COLLECTED (${collectedList.length}):\n${collectedList.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
          : '';
        
        Alert.alert(
          "💀 DEFEATED 💀",
          `The negative thoughts overwhelmed you!\n\nDIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\nKeep training your mental defenses and try again!`,
          [
            { text: "🔄 RETRY", onPress: () => setShowDifficultySelect(true) },
            { text: "❌ EXIT", onPress: onClose },
          ]
        );
      }, 800);
    }
  }, [
    score,
    level,
    onScoreUpdate,
    onClose,
    selectedDifficulty,
    getDifficultyConfig,
    gameStartTime,
    positiveThoughtsCleared,
    negativeThoughtsCleared,
    totalThoughtsSpawned,
    character,
    logger,
    ui,
  ]);
  // for HUD display - lives can't be less than the difficulty's lives start or 3
  const maxHudLives = Math.max(
    getDifficultyConfig().modifiers.livesStart,
    3,
    lives
  );

  const stepGame = useCallback((ts: number) => {
    if (!gameStartedRef.current || livesRef.current <= 0) return;

    if (lastTsRef.current == null) lastTsRef.current = ts;
    const dtMsRaw = ts - lastTsRef.current;
    lastTsRef.current = ts;

    // Avoid micro-dt and runaway dt after tab/app pauses
    const dtMs = Math.max(0, Math.min(dtMsRaw, 100));

    // 1) advance world
    updateGameRef.current(dtMs);

    // 2) time-based spawns
    const difficulty = getDifficultyRef.current();
    const baseSpawnMs = 2000 * difficulty.modifiers.spawnRate; // 2s on 'normal'
    const lvl = levelRef.current;
    let levelSpawnMs = Math.max(800, baseSpawnMs - Math.max(0, lvl - 1) * 150);

    // Apply dynamic difficulty - faster spawns if player is dominating
    levelSpawnMs = levelSpawnMs / dynamicDifficultyRef.current;

      spawnAccRef.current += dtMs;
      while (spawnAccRef.current >= levelSpawnMs) {
        spawnThought();
        spawnAccRef.current -= levelSpawnMs;
      }
    }, 100); // Check every 100ms for spawning

    rafRef.current = requestAnimationFrame(stepGame);
  }, []);

  // Check win condition
  useEffect(() => {
    if (!gameStarted) return;
    checkWinCondition();
  }, [gameStarted, gameState.thoughtsCleared, level, checkWinCondition]);

  useEffect(() => {
    if (!gameStarted) return;
    lastTsRef.current = null; // reset once at (re)start
    spawnAccRef.current = 0; // reset once at (re)start
    rafRef.current = requestAnimationFrame(stepGame);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [gameStarted, stepGame]); // stepGame is stable (empty deps), so this runs only when gameStarted toggles

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
      gameEndedRef.current = false;

      // cancel RAF explicitly
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  }, [visible]);

  // Keep refs in sync with latest values/functions
  useEffect(() => {
    updateGameRef.current = updateGame;
  }, [updateGame]);
  useEffect(() => {
    spawnThoughtRef.current = spawnThought;
  }, [spawnThought]);
  useEffect(() => {
    getDifficultyRef.current = getDifficultyConfig;
  }, [getDifficultyConfig]);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);
  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);
  useEffect(() => {
    dynamicDifficultyRef.current = dynamicDifficultyMultiplier;
  }, [dynamicDifficultyMultiplier]);

  const renderDifficultySelect = () => (
    <View style={styles.difficultyScreen}>
      <Text style={styles.difficultyTitle}>SELECT DIFFICULTY</Text>

      {!ddaState.isFirstGame && ddaState.lastResult && (
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#4ee6e6",
          }}
        >
          <Text
            style={{
              color: "#4ee6e6",
              fontSize: 14,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            🧠 Adaptive Difficulty Active
          </Text>
          <Text
            style={{
              color: "#ccc",
              fontSize: 12,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Games played: {ddaState.gamesPlayed}
          </Text>
          <Text
            style={{
              color: "#ccc",
              fontSize: 12,
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            Difficulty: {(ddaState.lastResult.difficulty * 100).toFixed(1)}% |
            Ease: {(ddaState.lastResult.ease * 100).toFixed(1)}%
          </Text>
          <Text
            style={{
              color: "#FCD34D",
              fontSize: 11,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {ddaState.lastResult.adjustmentReason}
          </Text>
        </View>
      )}

      <View style={styles.difficultyOptionsContainer}>
        <ScrollView
          style={styles.difficultyOptions}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.difficultyOption,
                selectedDifficulty === key && styles.selectedDifficulty,
              ]}
              onPress={() => setSelectedDifficulty(key)}
              activeOpacity={0.8}
            >
              <Text style={styles.difficultyName}>
                {config.icon}
                {config.name}
              </Text>

              <View style={styles.difficultyStats}>
                <Text style={styles.difficultyStatText}>
                  Speed: {(config.modifiers.thoughtSpeed * 100).toFixed(0)}%
                </Text>
                <Text style={styles.difficultyStatText}>
                  Lives: {config.modifiers.livesStart}
                </Text>
                <Text style={styles.difficultyStatText}>
                  Score: {(config.modifiers.scoreMultiplier * 100).toFixed(0)}%
                </Text>
              </View>

              <Text
                style={{
                  color: "#FCD34D",
                  fontSize: 10,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                Win: {config.modifiers.maxLevels} levels
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.difficultyButtonsContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowDifficultySelect(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={startGame}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>
            START {DIFFICULTY_LEVELS[selectedDifficulty].name}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
              <View style={styles.hud}>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>SCORE</Text>
                  <Text style={styles.hudValue}>
                    {score.toString().padStart(6, "0")}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>LIVES</Text>
                  <Text style={styles.hudValue}>
                    {"♥".repeat(Math.max(0, lives))}
                    {"♡".repeat(Math.max(0, maxHudLives - lives))}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>LEVEL</Text>
                  <Text
                    style={[
                      styles.hudValue,
                      level >= getDifficultyConfig().modifiers.maxLevels && {
                        color: "#FCD34D",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {level}/{getDifficultyConfig().modifiers.maxLevels}
                    {level >= getDifficultyConfig().modifiers.maxLevels &&
                      " 🏆"}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>PROGRESS</Text>
                  <Text style={styles.hudValue}>
                    {gameState.thoughtsCleared}/{getCurrentWaveTarget()}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>ACCURACY</Text>
                  <Text
                    style={[
                      styles.hudValue,
                      {
                        color:
                          shotsFired > 0
                            ? hits / shotsFired >= 0.7
                              ? "#00ff41"
                              : hits / shotsFired >= 0.5
                              ? "#FCD34D"
                              : "#ff0041"
                            : "#ffffff",
                      },
                    ]}
                  >
                    {shotsFired > 0
                      ? `${Math.round((hits / shotsFired) * 100)}%`
                      : "--"}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>DIFFICULTY</Text>
                  <Text style={styles.hudValue}>
                    {DIFFICULTY_LEVELS[selectedDifficulty].icon}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Game Area */}
          <View
            style={[
              styles.gameArea,
              {
                height: gameStarted ? GAME_HEIGHT : "auto",
              },
            ]}
          >
            {!gameStarted && showDifficultySelect ? (
              <DifficultySelect
                selectedDifficulty={selectedDifficulty}
                onSelectDifficulty={setSelectedDifficulty}
                onStartGame={startGame}
                onBack={() => setShowDifficultySelect(false)}
              />
            ) : !gameStarted ? (
              // Start Screen
              <View
                style={[
                  styles.startScreen,
                  { backgroundColor: theme.theme.archiveBackground },
                ]}
              >
                <Text style={styles.startTitle}>
                  Light your way through the darkness
                </Text>

                {/* Loading indicator */}
                {isLoadingGameData && (
                  <Text style={styles.startInstructionText}>
                    ⏳ Loading your progress...
                  </Text>
                )}

                {/* Display current score if available */}
                {apiGameData && (
                  <View style={{ marginBottom: 12, alignItems: "center" }}>
                    <Text
                      style={{
                        color: "#d4af37",
                        fontSize: 14,
                        fontWeight: "bold",
                      }}
                    >
                      Current Score: {apiGameData.score || 0} | Level:{" "}
                      {apiGameData.level || 1}
                    </Text>
                    {apiGameData.personality_data && (
                      <Text
                        style={{
                          color: "#4ee6e6",
                          fontSize: 11,
                          fontStyle: "italic",
                          marginTop: 4,
                        }}
                      >
                        Personality-based thoughts active
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.startInstructions}>
                  <Text style={styles.startInstructionText}>
                    📚 In this wing, loose thoughts slip from the shelves. Some
                    are shadows, some are anchors.
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🛡️ Touch and drag the golden shield at the bottom to move it
                    left and right.
                  </Text>
                  <Text style={styles.startInstructionText}>
                    ⚡ Tap anywhere to shoot bolts upward. Tap the shield to
                    shoot while moving!
                  </Text>
                  <Text style={styles.startInstructionText}>
                    💚 Tap green thoughts directly to welcome them in. They
                    grant power-ups and help steady you.
                  </Text>
                  <Text
                    style={[styles.startInstructionText, { color: "#ff0041" }]}
                  >
                    ⚠️ Letting red thoughts reach the bottom costs lives. Firing
                    wildly wastes energy and lowers your score.
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🏆 Clear enough thoughts to complete each wave. Survive all
                    levels to restore this shelf of The Archive.
                  </Text>
                </View>

                <Text style={styles.startSubtitle}>CURRENT DIFFICULTY:</Text>
                <Text style={styles.startSubtitle}>
                  {DIFFICULTY_LEVELS[selectedDifficulty].icon}
                  {DIFFICULTY_LEVELS[selectedDifficulty].name}
                </Text>

                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startGame}
                  activeOpacity={0.8}
                  disabled={isLoadingGameData}
                >
                  <Text style={styles.startButtonText}>🚀 START GAME 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.difficultySelectButton}
                  onPress={() => setShowDifficultySelect(true)}
                  activeOpacity={0.8}
                  disabled={isLoadingGameData}
                >
                  <Text style={styles.difficultySelectButtonText}>
                    🎯SELECT DIFFICULTY🎯
                  </Text>
                </TouchableOpacity>

                <Text style={styles.startHint}>
                  Tap to begin your mental defense!
                </Text>
              </View>
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
                    <Text style={[styles.powerUpIcon, { color: "#ff0041" }]}>
                      ⚡x{dynamicDifficultyMultiplier.toFixed(1)}
                    </Text>
                  )}
                </View>

                {/* Debug Info */}
                <Text style={styles.debugText}>
                  T: {thoughts.length} | P: {projectiles.length} | Hit: {hits}/
                  {shotsFired} | Miss: {missedShots} | Diff: x
                  {dynamicDifficultyMultiplier.toFixed(1)}
                </Text>

                {/* Final Level Indicator */}
                {level >= getDifficultyConfig().modifiers.maxLevels && (
                  <View
                    style={{
                      position: "absolute",
                      top: 25,
                      left: 0,
                      right: 0,
                      alignItems: "center",
                      zIndex: 50,
                    }}
                  >
                    <Text
                      style={{
                        color: "#FCD34D",
                        fontSize: 16,
                        fontWeight: "bold",
                        textAlign: "center",
                        textShadowColor: "#000",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                        backgroundColor: "rgba(0,0,0,0.7)",
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      🏆 FINAL LEVEL! 🏆
                    </Text>
                  </View>
                )}

                {/* Dynamic Difficulty Ramp Notification */}
                {showDifficultyRampNotification && (
                  <View
                    style={{
                      position: "absolute",
                      top:
                        level >= getDifficultyConfig().modifiers.maxLevels
                          ? 60
                          : 25,
                      left: 0,
                      right: 0,
                      alignItems: "center",
                      zIndex: 50,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ff0041",
                        fontSize: 14,
                        fontWeight: "bold",
                        textAlign: "center",
                        textShadowColor: "#000",
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 2,
                        backgroundColor: "rgba(255,0,0,0.8)",
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 2,
                        borderColor: "#ff0041",
                      }}
                    >
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
                    const touchDuration =
                      Date.now() - touchStartTimeRef.current;
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
                  <View style={styles.shootingZone} pointerEvents="none">
                    {gameState.waveComplete && (
                      <Text style={styles.shootingZoneText}>
                        WAVE COMPLETE!
                      </Text>
                    )}
                  </View>
                </View>

                {/* Thoughts - High priority for tapping */}
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
                    <View style={styles.thoughtpassages} pointerEvents="none">
                      <View style={styles.thoughtIconContainer}>
                        {thought.isPositive ? (
                          <Text style={styles.thoughtIcon}>💚</Text>
                        ) : (
                          <Image
                            source={uiIcons.sectionIcons.bluegreenghost}
                            style={styles.thoughtImage}
                            resizeMode="contain"
                          />
                        )}
                        {thought.powerUpType && (
                          <Text style={styles.powerUpBadge}>
                            {
                              POWER_UPS[
                                thought.powerUpType as keyof typeof POWER_UPS
                              ]?.icon
                            }
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}

                {/* Player - Draggable Paddle */}
                <View
                  style={[
                    styles.player,
                    {
                      left: playerX,
                      opacity: isDraggingPaddle ? 0.9 : 1,
                      transform: [{ scale: isDraggingPaddle ? 1.05 : 1 }],
                    },
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
                      Math.min(
                        GAME_WIDTH - PADDLE_WIDTH,
                        relativeX - PADDLE_WIDTH / 2
                      )
                    );
                    setPlayerX(newX);
                  }}
                  onResponderRelease={(evt) => {
                    const touchDuration =
                      Date.now() - touchStartTimeRef.current;
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
              <Text style={styles.instructionTitle}>🎮 CONTROLS 🎮</Text>
              <Text style={styles.instructionText}>DRAG SHIELD 🛡️ TO MOVE</Text>
              <Text style={styles.instructionText}>TAP TO SHOOT ⚡</Text>
              <Text style={styles.instructionText}>
                TAP GREEN FOR POWER-UPS 💚
              </Text>
              <Text style={[styles.instructionText, { color: "#ff0041" }]}>
                ⚠️ MISSED SHOTS COST POINTS!
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>🚪 EXIT GAME</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  modalpassages: {
    width: Math.min(GAME_WIDTH, width * 0.95),
    maxWidth: 400,
    maxHeight: height * 0.95,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d4af37",
    padding: 16,
    alignItems: "center",
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    color: "#4ee6e6",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(78, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    padding: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  hudItem: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
  },
  hudLabel: {
    color: "#d4af37",
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },
  hudValue: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  gameArea: {
    width: Math.min(GAME_WIDTH - 32, width * 0.95 - 32),
    maxWidth: 368,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    position: "relative",
    overflow: "hidden",
    marginBottom: 16,
  },
  gameContainer: {
    width: "100%",
    height: GAME_HEIGHT,
    position: "relative",
  },
  backgroundTouchArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 1,
  },
  debugText: {
    position: "absolute",
    top: 5,
    left: 5,
    color: "#d4af37",
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    zIndex: 100,
  },
  powerUpStatus: {
    position: "absolute",
    top: 5,
    right: 5,
    flexDirection: "row",
    zIndex: 100,
  },
  powerUpIcon: {
    fontSize: 16,
    marginHorizontal: 2,
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyScreen: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  difficultyTitle: {
    color: "#4ee6e6",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(78, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  difficultySubtitle: {
    color: "#d4af37",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
  difficultyOptionsContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 16,
    minHeight: 0,
  },
  difficultyOptions: {
    width: "100%",
    flex: 1,
  },
  difficultyButtonsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  difficultyOption: {
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "#d4af37",
    borderRadius: 12,
    padding: height < 700 ? 12 : 16,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: height < 700 ? 70 : 80,
  },
  selectedDifficulty: {
    borderColor: "#d4af37",
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    shadowColor: "#d4af37",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  difficultyName: {
    color: "#d4af37",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
  },
  difficultyDescription: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  difficultyStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 8,
    flexWrap: "wrap",
  },
  difficultyStatText: {
    color: "#d4af37",
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  difficultySelectButton: {
    backgroundColor: "#d4af37",
    borderWidth: 2,
    borderColor: "#b8860b",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  difficultySelectButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: "#666666",
    borderWidth: 2,
    borderColor: "#888888",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#666666",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
    minWidth: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  startScreen: {
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  startTitle: {
    color: "#4ee6e6",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(78, 230, 230, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  startSubtitle: {
    color: "#d4af37",
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 4,
  },
  startInstructions: {
    marginBottom: 10,
    alignItems: "center",
  },
  startInstructionText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: "#d4af37",
    borderWidth: 2,
    borderColor: "#b8860b",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    minHeight: 48,
    flex: 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  exitButton: {
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    borderWidth: 3,
    borderColor: "rgba(245, 0, 0, 0.7)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: "rgba(255, 0, 0, 0.8)",
    shadowRadius: 8,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  exitButtonText: {
    color: "#0f0f23",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
  startHint: {
    color: "#d4af37",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  shootingZone: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GAME_HEIGHT * 0.2,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderTopWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.4)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Lower than thoughts but higher than background
    elevation: 10,
  },
  shootingZoneText: {
    color: "rgba(212, 175, 55, 0.5)",
    fontSize: 20,
    fontWeight: "bold",
  },
  player: {
    position: "absolute",
    bottom: 15,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: "#ff9d00",
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffd700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    zIndex: 200,
    elevation: 200,
    // Much larger touch area for easier grabbing
    padding: 20,
    margin: -20,
  },
  playerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  playerText: {
    fontSize: 28,
    color: "#0f0f23",
    textShadowColor: "#ffd700",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  thought: {
    position: "absolute",
    padding: 8,
    borderRadius: 40,
    borderWidth: 2,
    width: 80,
    height: 80,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 100, // High elevation for Android
    zIndex: 100, // High z-index for iOS
  },
  thoughtpassages: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  thoughtIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
    position: "relative",
  },
  thoughtIcon: {
    fontSize: 24,
  },
  thoughtImage: {
    width: 32,
    height: 32,
  },
  powerUpBadge: {
    fontSize: 8,
    position: "absolute",
    top: -4,
    right: -4,
    textShadowColor: "#ffff00",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  thoughtText: {
    color: "#ffffff",
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "center",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    outline: "1px solid #000",
  },
  projectile: {
    position: "absolute",
    width: 8,
    height: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
    elevation: 50,
  },
  projectileText: {
    fontSize: 8,
    color: "#d4af37",
  },
  instructions: {
    marginBottom: 16,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  instructionTitle: {
    color: "#d4af37",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  instructionText: {
    color: "#ffffff",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  scanLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    opacity: 0.1,
    // Create scan line effect with linear gradient
    backgroundImage:
      Platform.OS === "web"
        ? "linear-gradient(transparent 50%, rgba(0, 255, 65, 0.03) 50%)"
        : undefined,
    ...(Platform.OS === "web"
      ? {
          backgroundSize: "100% 4px",
        }
      : {}),
  },
});

export default ThoughtDefenderModal;
