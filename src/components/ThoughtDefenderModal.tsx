import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useMasterState } from "../context/MasterStateContext";
import { convertGameDataToPerformance, useDDA } from "../hooks/useDDA";
import { useProgressLogger } from "../hooks/useProgressLogger";
import { TDifficulty } from "../services/apiService";
import { ThoughtDefenderRunDTO } from "../types/thoughtDefender";
import {
  formatThoughtDefenderRewardMessage,
  processThoughtDefenderCompletion
} from "../utils/rewardsUtils";
import { uiIcons } from "../assets/ui/index";


const { width, height } = Dimensions.get("window");
const GAME_WIDTH = width * 0.9;
const GAME_HEIGHT = height * 0.6;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 20;


//find new thoughts
const CharacterArchetypes = {
  //The Architect(Conscientiousness)
  scholar: {
    positiveThoughts:[
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
    ]
  },
  //The Voice(Extraversion)
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
    ]
  },
  //The Mirror(Neuroticism)
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
    ]
  },
  //The Healer(Agreeableness)
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
    ]
  },
  // The Seeker(Openness)
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
    ]
  }
};

//46 characters max

const getCharacterArchetype = (characterData: { selectedBaseModel: any; selectedHairStyle: any; selectedEyeType: any; selectedMouthType: any; selectedShirtType: any; }) => {
    const total = characterData.selectedBaseModel + characterData.selectedHairStyle + characterData.selectedEyeType +
      characterData.selectedMouthType + characterData.selectedShirtType;
    
    if (total % 5 === 0) return CharacterArchetypes.scholar;
    if (total % 5 === 1) return CharacterArchetypes.warrior;
    if (total % 5 === 2) return CharacterArchetypes.sage;
    if (total % 5 === 3) return CharacterArchetypes.healer;
    return CharacterArchetypes.explorer;
};

const getPersonalityArchetype = (personalityData: string) => {
  if (personalityData == "Openness") return CharacterArchetypes.explorer;
    if (personalityData == "Conscientiousness") return CharacterArchetypes.scholar;
  if (personalityData == "Extraversion") return CharacterArchetypes.warrior;
  if (personalityData == "Agreeableness") return CharacterArchetypes.healer;
  if (personalityData == "Neuroticsm") return CharacterArchetypes.sage;
  return CharacterArchetypes.explorer
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
    name: 'ZEN',
    icon: '🧘',
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
    }
  },
  normal: {
    name: 'BALANCED',
    icon: '🎯',
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
    }
  },
  intense: {
    name: 'INTENSE',
    icon: '💪',
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
    }
  },
  nightmare: {
    name: 'NIGHTMARE',
    icon: '💀',
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
    }
  }
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
  onScoreUpdate?: (data: {
    score: number;
    level: number;
    won: boolean;
    difficulty: string;
  }) => void;
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
  
  // Update thoughts ref whenever thoughts state changes
  useEffect(() => {
    thoughtsRef.current = thoughts;
  }, [thoughts]);
  
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  
  // Update projectiles ref whenever projectiles state changes
  useEffect(() => {
    projectilesRef.current = projectiles;
  }, [projectiles]);
  const [playerX, setPlayerX] = useState<number>(
    GAME_WIDTH / 2 - PADDLE_WIDTH / 2
  );
  const [canShoot, setCanShoot] = useState<boolean>(true);

  // Game statistics for reward system
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [totalThoughtsSpawned, setTotalThoughtsSpawned] = useState<number>(0);
  const [positiveThoughtsCleared, setPositiveThoughtsCleared] = useState<number>(0);
  const [negativeThoughtsCleared, setNegativeThoughtsCleared] = useState<number>(0);
  
  // Game statistics for logging
  const [shotsFired, setShotsFired] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [powerupsCollected, setPowerupsCollected] = useState<number>(0);

  // DDA (Dynamic Difficulty Adjustment) system
  const {
    ddaState,
    calculateDifficulty,
    updateBaseline,
    getAdaptiveDifficulty,
    getAdaptiveModifiers
  } = useDDA();

  // Event-based progress logger
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

  const getThoughtsForCharacter = useCallback(() => {
    
    if (hasHomeData && hasBackendCharacter) {
      // Extract character appearance data for archetype calculation
      const characterData = {
        selectedBaseModel: character.selectedBaseModel || 0,
        selectedHairStyle: character.selectedHairStyle || 0,
        selectedEyeType: character.selectedEyeType || 0,
        selectedMouthType: character.selectedMouthType || 0,
        selectedShirtType: character.selectedShirtType || 0
      };
      
      const characterArchetype = getCharacterArchetype(characterData);
      
      return {
        positiveThoughts: characterArchetype.positiveThoughts,
        negativeThoughts: characterArchetype.negativeThoughts
      };
    }
    if (primaryTrait) {
      const personalityArchetype = getPersonalityArchetype(primaryTrait);
      return {
        positiveThoughts: personalityArchetype.positiveThoughts,
        negativeThoughts: personalityArchetype.negativeThoughts
      };
    }
    
    
    return {
      positiveThoughts: CharacterArchetypes.scholar.positiveThoughts,
      negativeThoughts: CharacterArchetypes.scholar.negativeThoughts
    };
  }, [hasHomeData, hasBackendCharacter, character, primaryTrait]);

  const { positiveThoughts: POSITIVE_THOUGHTS, negativeThoughts: NEGATIVE_THOUGHTS} = getThoughtsForCharacter();

  // New game state
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

  const gameLoopRef = useRef<number>(0);
  const spawnLoopRef = useRef<number>(0);
  const thoughtIdCounter = useRef<number>(0);
  const projectileIdCounter = useRef<number>(0);
  const thoughtsRef = useRef<Thought[]>([]);
  const gameEndedRef = useRef<boolean>(false);

  const getDifficultyConfig = useCallback((): DifficultyConfig => {
    const baseDifficulty = DIFFICULTY_LEVELS[selectedDifficulty] || DIFFICULTY_LEVELS.normal;
    
    // Apply DDA adaptive modifiers if available
    if (ddaState.lastResult) {
      const adaptiveModifiers = getAdaptiveModifiers(baseDifficulty.modifiers);
      return {
        ...baseDifficulty,
        modifiers: adaptiveModifiers
      };
    }
    
    return baseDifficulty;
  }, [selectedDifficulty, ddaState.lastResult, getAdaptiveModifiers]);

  // Handle Thought Defender game over and logging
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
    const accuracy = finalStats.shotsFired > 0 ? finalStats.hits / finalStats.shotsFired : 0;

    const payload: ThoughtDefenderRunDTO = {
      score: finalStats.score,
      level: finalStats.level,
      wavesCleared: finalStats.wavesCleared,
      shotsFired: finalStats.shotsFired,
      hits: finalStats.hits,
      accuracy,
      livesRemaining: finalStats.livesRemaining,
      durationMs: finalStats.durationMs,
      difficulty: finalStats.difficulty,
      result: finalStats.result,
      perksUsed: finalStats.perksUsed ?? [],
      powerupsCollected: finalStats.powerupsCollected ?? 0,
      startedAt: new Date(finalStats.startedAt).toISOString(),
      finishedAt: new Date(finalStats.finishedAt).toISOString(),
      clientVersion: process.env.EXPO_PUBLIC_APP_VERSION ?? 'web',
    };

    // Non-blocking save with subtle UI feedback
    console.log('🕹️ Saving Thought Defender run...');
    try {
      await archive.logThoughtDefenderRun(payload);
      console.log('✅ Thought Defender run saved successfully');
    } catch (error) {
      console.error('❌ Failed to save Thought Defender run:', error);
    }
  };

  const getCurrentWaveTarget = useCallback((): number => {
    const difficulty = getDifficultyConfig();
    const levelBonus = Math.floor((level - 1) * difficulty.modifiers.waveTarget * difficulty.modifiers.levelScaling);
    return difficulty.modifiers.waveTarget + levelBonus;
  }, [getDifficultyConfig, level]);

  const handlePlayerMove = (x: number): void => {
    const newX = Math.max(
      0,
      Math.min(GAME_WIDTH - PADDLE_WIDTH - 32, x - PADDLE_WIDTH / 2)
    );
    setPlayerX(newX);
  };

  const shoot = useCallback((): void => {
    if (!canShoot) {
      return;
    }
    
    if (!gameStarted) {
      return;
    }

    const shootSpeed = gameState.fastShootActive ? 100 : 200; // Faster shooting with power-up
    const projectileSpeed = 8;

    if (gameState.multiShotActive) {
      // Multi-shot: 3 projectiles
      const projectiles = [
        {
          id: ++projectileIdCounter.current,
          x: playerX + PADDLE_WIDTH / 2 - 25,
          y: GAME_HEIGHT - 60,
          speed: projectileSpeed,
        },
        {
          id: ++projectileIdCounter.current,
          x: playerX + PADDLE_WIDTH / 2,
          y: GAME_HEIGHT - 60,
          speed: projectileSpeed,
        },
        {
          id: ++projectileIdCounter.current,
          x: playerX + PADDLE_WIDTH / 2 + 25,
          y: GAME_HEIGHT - 60,
          speed: projectileSpeed,
        },
      ];

      setProjectiles((prev) => {
        const updated = [...prev, ...projectiles];
        return updated;
      });
    } else {
      // Normal single shot
      const newProjectile: Projectile = {
        id: ++projectileIdCounter.current,
        x: playerX + PADDLE_WIDTH / 2,
        y: GAME_HEIGHT - 60,
        speed: projectileSpeed,
      };

      setProjectiles((prev) => {
        const updated = [...prev, newProjectile];
        return updated;
      });
    }

    setShotsFired(prev => prev + 1);
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

    // Log powerup collected event
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
        setLives((prev) => Math.min(prev + 1, 5)); // Max 5 lives
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

    // Difficulty scaling
    const levelMultiplier = 1 + (level - 1) * difficulty.modifiers.levelScaling;
    const negativeChance = Math.min(difficulty.modifiers.negativeThoughtChance + (level - 1) * 0.1, 0.9); // Increase negative thoughts
    const isPositive = Math.random() > negativeChance;
    
    
    let text: string;
    let powerUpType: string | undefined;

    if (isPositive) {
      const positiveThought =
        POSITIVE_THOUGHTS[Math.floor(Math.random() * POSITIVE_THOUGHTS.length)];
      text = positiveThought.text;
      // 30% chance for power-up on positive thoughts
      powerUpType = Math.random() < difficulty.modifiers.powerUpChance ? positiveThought.powerUp : undefined;
    } else {
      text =
        NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)];
    }

    // Speed increases with level and time slow effect
    const baseSpeed = isPositive 
      ? 1 + Math.random() * difficulty.modifiers.thoughtSpeed
      : 2 + Math.random() * difficulty.modifiers.thoughtSpeed;
    
    const levelSpeed = baseSpeed * levelMultiplier;
    const finalSpeed = gameState.timeSlowActive ? levelSpeed * 0.5 : levelSpeed;

    const newThought: Thought = {
      id: ++thoughtIdCounter.current,
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

    // Track wave progress and statistics
    setGameState((prev) => ({
      ...prev,
      thoughtsInWave: prev.thoughtsInWave + 1,
    }));
    
    // Track total thoughts spawned for reward calculation
    setTotalThoughtsSpawned(prev => prev + 1);
  }, [gameStarted, lives, level, gameState.timeSlowActive, getDifficultyConfig, POSITIVE_THOUGHTS, NEGATIVE_THOUGHTS]);

  const updateGame = useCallback((): void => {
    if (!gameStarted || lives <= 0) return;
    

    // Track collisions for coordinated updates
    let collisionData = { thoughtsToRemove: new Set<number>(), projectilesToRemove: new Set<number>() };

    // Update thoughts and handle collisions
    setThoughts((prev) => {
      // First, update positions and handle thoughts reaching bottom
      let updated = prev
        .map((t) => ({ ...t, y: t.y + t.speed }))
        .filter((t) => {
          // Remove thoughts that reached bottom and handle life loss
          if (t.y > GAME_HEIGHT - 60) {
            if (!t.isPositive) {
              // Only lose life if shield is not active
              if (!gameState.shieldActive) {
                setLives((currentLives) => {
                  const newLives = Math.max(0, currentLives - 1);
                  // Log player hit event (non-blocking)
                  logger.playerHit(level, 1, newLives);
                  return newLives;
                });
              }
              // Track negative thoughts cleared when they reach bottom
              setNegativeThoughtsCleared(prev => prev + 1);
            } 
            // Track cleared thoughts
            setGameState((prev) => ({
              ...prev,
              thoughtsCleared: prev.thoughtsCleared + 1,
            }));

            return false;
          }
          return true;
        });

      // Then handle collisions with projectiles using the projectiles ref
      const currentProjectiles = projectilesRef.current;
      

      // Check each projectile against each negative thought
      for (let i = currentProjectiles.length - 1; i >= 0; i--) {
        const projectile = currentProjectiles[i];

        for (let j = updated.length - 1; j >= 0; j--) {
          const thought = updated[j];

          if (!thought.isPositive && !collisionData.thoughtsToRemove.has(thought.id)) {
            const dx = projectile.x - (thought.x + 40);
            const dy = projectile.y - (thought.y + 20);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 42) { // Normal collision radius
              // Collision detected - mark thought and projectile for removal
              collisionData.thoughtsToRemove.add(thought.id);
              collisionData.projectilesToRemove.add(projectile.id);

              // Score with multiplier
              const difficulty = getDifficultyConfig();
              const basePoints = 15 * difficulty.modifiers.scoreMultiplier;
              const points = Math.round(basePoints * gameState.scoreMultiplier);
              setScore(prevScore => {
                const newScore = prevScore + points;
                return newScore;
              });

              // Track cleared thoughts
              setGameState((prev) => ({
                ...prev,
                thoughtsCleared: prev.thoughtsCleared + 1,
              }));
              
              // Track negative thoughts cleared by projectiles
              setNegativeThoughtsCleared(prev => prev + 1);
               
              // Track hits for logging
              setHits(prev => prev + 1);
               
              // Log enemy destroyed event (non-blocking)
              logger.enemyDestroyed(level, 'thought', points);

              break;
            }
          }
        }
      }

      // Remove thoughts that were hit by projectiles
      return updated.filter(thought => !collisionData.thoughtsToRemove.has(thought.id));
    });

    // Update projectiles separately after thoughts are updated
    setProjectiles((prev) => {
      const updated = prev
        .map((p) => ({ ...p, y: p.y - p.speed }))
        .filter((p) => p.y > -20)
        .filter(projectile => !collisionData.projectilesToRemove.has(projectile.id));
      return updated;
    });
  }, [gameStarted, lives, gameState.shieldActive, gameState.scoreMultiplier, getDifficultyConfig, logger, level, positiveThoughtsCleared, negativeThoughtsCleared, gameStartTime, score, selectedDifficulty, character, ui, onScoreUpdate]);

  const handleThoughtPress = (thought: Thought): void => {

    // Calculate score with multiplier
    const difficulty = getDifficultyConfig();
    const basePoints = 25 * difficulty.modifiers.scoreMultiplier;
    const points = Math.round(basePoints * gameState.scoreMultiplier);
    setScore(prev => {
      const newScore = prev + points;
      return newScore;
    });

    if (!thought.isPositive) {
      return;
    }

    // Activate power-up if available
    if (thought.powerUpType) {
      activatePowerUp(thought.powerUpType);
      setPowerupsCollected(prev => prev + 1);
    }

    // Remove thought and track progress
    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    setGameState((prev) => ({
      ...prev,
      thoughtsCleared: prev.thoughtsCleared + 1,
    }));
    
    // Track positive thoughts cleared for reward calculation
    setPositiveThoughtsCleared(prev => prev + 1);
    
    // Track hits for logging
    setHits(prev => prev + 1);

    // Log enemy destroyed event
    logger.enemyDestroyed(level, 'thought', points);
  };

  const startGame = useCallback((): void => {
    // Reset game ended flag
    gameEndedRef.current = false;
    
    // Apply adaptive difficulty if DDA is available
    const adaptiveDifficulty = getAdaptiveDifficulty(selectedDifficulty);
    if (adaptiveDifficulty !== selectedDifficulty) {
      setSelectedDifficulty(adaptiveDifficulty);
    }
    
    const difficulty = getDifficultyConfig();

    // Reset game state
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
    setActivePowerUps([]);
    setGameStarted(true);
    setShowDifficultySelect(false);
    
    // Initialize game statistics for reward system
    setGameStartTime(Date.now());
    setTotalThoughtsSpawned(0);
    setPositiveThoughtsCleared(0);
    setNegativeThoughtsCleared(0);
    
    // Initialize game statistics for logging
    setShotsFired(0);
    setHits(0);
    setPowerupsCollected(0);

    // Start event-based logging
    const difficultyName: TDifficulty = DIFFICULTY_LEVELS[selectedDifficulty].name as TDifficulty;
    logger.start(difficultyName);
    // If you already track wave 1 begin:
    logger.waveStart(1);
  }, [selectedDifficulty, getDifficultyConfig, getAdaptiveDifficulty, logger]);

  const checkWinCondition = useCallback((): void => {
    const difficulty = getDifficultyConfig();
    const currentWaveTarget = getCurrentWaveTarget();


    // Win conditions
    // Check if wave is complete
    if (gameState.thoughtsCleared >= currentWaveTarget) {
      setGameState((prev) => ({ ...prev, waveComplete: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, waveComplete: false })),
          8000
        );
      

      // Check for overall victory
      if (level >= difficulty.modifiers.maxLevels) {
        // Prevent multiple victory calls
        if (gameEndedRef.current) {
          return;
        }
        gameEndedRef.current = true;
        
        // VICTORY!
        setGameStarted(false);

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
        
        // Calculate game statistics for reward system
        const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
        const totalThoughtsCleared = positiveThoughtsCleared + negativeThoughtsCleared;
        const currentExperience = character.backendCharacter?.experience || 0;
        
        // Calculate DDA for winning scenario
        const gameEndTime = Date.now();
        const performance = convertGameDataToPerformance(
          score,
          level,
          true, // won
          totalThoughtsCleared,
          totalThoughtsSpawned,
          survivalTime,
          gameStartTime,
          gameEndTime
        );
        
        // Calculate DDA and update baseline
        const ddaResult = calculateDifficulty(performance);
        updateBaseline(performance);
        
        
        // Log the Thought Defender run
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

        // Log session end for event-based logging (non-blocking)
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
        
        // Process rewards using the new reward system
        const rewardResult = processThoughtDefenderCompletion(
          score,
          level,
          true, // won
          selectedDifficulty,
          totalThoughtsCleared,
          totalThoughtsSpawned,
          survivalTime,
          currentExperience
        );
        
        if (rewardResult.success) {
          // Apply rewards to character based on research condition
          // Use resonance for character condition, experience for personality condition
          if (ui.researchCondition === "character") {
            character.gainResonance(rewardResult.rewards.experience, 'ThoughtDefender');
          } else {
            character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
          }
          
          // Map frontend attribute names to backend attribute names
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
          
          character.gainWellness(backendWellnessStats);
          
          // Show detailed reward message
          const rewardMessage = formatThoughtDefenderRewardMessage(
            rewardResult.rewards, 
            rewardResult.levelsGained || 0
          );
          
          if (onScoreUpdate) onScoreUpdate({ 
            score, 
            level, 
            won: true, 
            difficulty: selectedDifficulty 
          });

          // apiService.updateGameData({score: score}); // Commented out - endpoint only supports GET

          Alert.alert(
            '🏆 VICTORY! 🏆',
            `${rewardMessage}\n\n🧠 YOU HAVE MASTERED YOUR MIND!`,
            [
              { text: '🎉 PLAY AGAIN', onPress: () => setShowDifficultySelect(true) },
              { text: '❌ EXIT', onPress: onClose }
            ]
          );
        } else {
          // Fallback to original behavior if reward processing fails
          if (onScoreUpdate) onScoreUpdate({ 
            score, 
            level, 
            won: true, 
            difficulty: selectedDifficulty 
          });

          // apiService.updateGameData({score: score}); // Commented out - endpoint only supports GET

          Alert.alert(
            '🏆 VICTORY! 🏆',
            `CONGRATULATIONS!\n\nDifficulty: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 YOU HAVE MASTERED YOUR MIND!`,
            [
              { text: '🎉 PLAY AGAIN', onPress: () => setShowDifficultySelect(true) },
              { text: '❌ EXIT', onPress: onClose }
            ]
          );
        }
        return;
      }

      // Next level
      setLevel((prev) => prev + 1);
      setLives((prev) => Math.min(prev + 1, 5)); // Bonus life for completing wave
      setGameState((prev) => ({
        ...prev,
        wave: prev.wave + 1,
        thoughtsInWave: 0,
        thoughtsCleared: 0,
      }));

      // Log wave start for the new level
      logger.waveStart(level + 1);
    }
  }, [gameState.thoughtsCleared, level, score, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig, getCurrentWaveTarget, gameStartTime, positiveThoughtsCleared, negativeThoughtsCleared, totalThoughtsSpawned, character, logger, ui]);

  const endGame = useCallback((): void => {
    // Prevent multiple endGame calls
    if (gameEndedRef.current) {
      return;
    }
    gameEndedRef.current = true;
    
    setGameStarted(false);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);

    const difficulty = getDifficultyConfig();
    
    // Calculate game statistics for reward system
    const survivalTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const totalThoughtsCleared = positiveThoughtsCleared + negativeThoughtsCleared;
    const currentExperience = character.backendCharacter?.experience || 0;
    
    // Calculate DDA performance metrics
    const gameEndTime = Date.now();
    const performance = convertGameDataToPerformance(
      score,
      level,
      false, // won will be determined by game state
      totalThoughtsCleared,
      totalThoughtsSpawned,
      survivalTime,
      gameStartTime,
      gameEndTime
    );
    
    // Calculate DDA and update baseline
    const ddaResult = calculateDifficulty(performance);
    updateBaseline(performance);
    
    
    // Log the Thought Defender run
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

    // Log session end for event-based logging (non-blocking)
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
    
    // Process rewards using the new reward system
    const rewardResult = processThoughtDefenderCompletion(
      score,
      level,
      false, // lost
      selectedDifficulty,
      totalThoughtsCleared,
      totalThoughtsSpawned,
      survivalTime,
      currentExperience
    );
    
    if (rewardResult.success) {
      // Apply rewards to character (even for losses, players get some rewards)
      // Use resonance for character condition, experience for personality condition
      if (ui.researchCondition === "character") {
        character.gainResonance(rewardResult.rewards.experience, 'ThoughtDefender');
      } else {
        character.gainExperience(rewardResult.rewards.experience, 'ThoughtDefender');
      }
      
      // Map frontend attribute names to backend attribute names
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
      
      character.gainWellness(backendWellnessStats);
      
      // Show detailed reward message
      const rewardMessage = formatThoughtDefenderRewardMessage(
        rewardResult.rewards, 
        rewardResult.levelsGained || 0
      );
      
      if (onScoreUpdate) onScoreUpdate({ 
        score, 
        level, 
        won: false, 
        difficulty: selectedDifficulty 
      });

      // apiService.updateGameData({score: score}); // Commented out - endpoint only supports GET

      Alert.alert(
        '⚡ GAME OVER ⚡',
        `${rewardMessage}\n\n🧠 MIND DEFENDED!`,
        [
          { text: '🔄 RETRY', onPress: () => setShowDifficultySelect(true) },
          { text: '❌ EXIT', onPress: onClose }
        ]
      );
    } else {
      // Fallback to original behavior if reward processing fails
      if (onScoreUpdate) onScoreUpdate({ 
        score, 
        level, 
        won: false, 
        difficulty: selectedDifficulty 
      });

      // apiService.updateGameData({score: score}); // Commented out - endpoint only supports GET

      Alert.alert(
        '⚡ GAME OVER ⚡',
        `DIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 MIND DEFENDED!`,
        [
          { text: '🔄 RETRY', onPress: () => setShowDifficultySelect(true) },
          { text: '❌ EXIT', onPress: onClose }
        ]
      );
    }
  }, [score, level, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig, gameStartTime, positiveThoughtsCleared, negativeThoughtsCleared, totalThoughtsSpawned, character, logger, ui]);

  // Check win condition
  useEffect(() => {
    if (gameStarted) {
      checkWinCondition();
    }
  }, [gameStarted, checkWinCondition]);

  // Game loop effect
  useEffect(() => {
    if (!gameStarted) return;

    const difficulty = getDifficultyConfig();
    
    gameLoopRef.current = setInterval(updateGame, 16) as unknown as number; // ~60 FPS

    // Spawn rate increases with level (faster spawning = more difficulty)
    const baseSpawnRate = 2000;
    const difficultySpawnRate = baseSpawnRate * difficulty.modifiers.spawnRate;
    const levelSpawnRate = Math.max(800, difficultySpawnRate - ((level - 1) * 150));
    
    spawnLoopRef.current = setInterval(spawnThought, levelSpawnRate) as unknown as number;
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    };
  }, [gameStarted, level]);

  // Check for game over
  useEffect(() => {
    if (gameStarted && lives <= 0) {
      setTimeout(endGame, 500);
    }
  }, [lives, gameStarted, endGame]);

  // Cleanup on modal close
  useEffect(() => {
    if (!visible) {
      setGameStarted(false);
      setShowDifficultySelect(false);
      gameEndedRef.current = false; // Reset game ended flag
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    }
  }, [visible]);

  const renderDifficultySelect = () => (
    <View style={styles.difficultyScreen}>
      <Text style={styles.difficultyTitle}>SELECT DIFFICULTY</Text>
      
      {/* DDA Status Display */}
      {!ddaState.isFirstGame && ddaState.lastResult && (
        <View style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#4ee6e6'
        }}>
          <Text style={{
            color: '#4ee6e6',
            fontSize: 14,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8
          }}>
            🧠 Adaptive Difficulty Active
          </Text>
          <Text style={{
            color: '#ccc',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 4
          }}>
            Games played: {ddaState.gamesPlayed}
          </Text>
          <Text style={{
            color: '#ccc',
            fontSize: 12,
            textAlign: 'center',
            marginBottom: 4
          }}>
            Difficulty: {(ddaState.lastResult.difficulty * 100).toFixed(1)}% | 
            Ease: {(ddaState.lastResult.ease * 100).toFixed(1)}%
          </Text>
          <Text style={{
            color: '#FCD34D',
            fontSize: 11,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
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
                selectedDifficulty === key && styles.selectedDifficulty
              ]}
              onPress={() => setSelectedDifficulty(key)}
              activeOpacity={0.8}
            >
              <Text style={styles.difficultyName}>{config.icon}{config.name}</Text>
              
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
              
              <Text style={{
                color: '#FCD34D',
                fontSize: 10,
                fontWeight: 'bold',
                textAlign: 'center',
                marginTop: 4
              }}>
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
                    {"♡".repeat(Math.max(0, 3 - lives))}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>LEVEL</Text>
                  <Text style={[
                    styles.hudValue,
                    level >= getDifficultyConfig().modifiers.maxLevels && { color: '#FCD34D', fontWeight: 'bold' }
                  ]}>
                    {level}/{getDifficultyConfig().modifiers.maxLevels}
                    {level >= getDifficultyConfig().modifiers.maxLevels && ' 🏆'}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>PROGRESS</Text>
                  <Text style={styles.hudValue}>
                    {gameState.thoughtsCleared}/{getCurrentWaveTarget()}
                  </Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>DIFFICULTY</Text>
                  <Text style={styles.hudValue}>{DIFFICULTY_LEVELS[selectedDifficulty].icon}</Text>
                </View>
              </View>
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
              renderDifficultySelect()
            ) : !gameStarted ? (
              // Start Screen
              <View style={[styles.startScreen, { backgroundColor: theme.theme.archiveBackground }]}>
                <Text style={styles.startTitle}>PROTECT YOUR THOUGHTS!</Text>

                <View style={styles.startInstructions}>
                  <Text style={styles.startInstructionText}>
                    💚 TAP positive thoughts for power-ups
                  </Text>
                  <Text style={styles.startInstructionText}>
                    ⚡ SHOOT negative thoughts to defend
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🏆 Complete {getDifficultyConfig().modifiers.maxLevels} levels to win
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🛡️ Collect power-ups for special abilities
                  </Text>
                </View>

                <Text style={styles.startSubtitle}>CURRENT DIFFICULTY:</Text>
                <Text style={styles.startSubtitle}>{DIFFICULTY_LEVELS[selectedDifficulty].icon}{DIFFICULTY_LEVELS[selectedDifficulty].name}</Text>

                <TouchableOpacity 
                  style={styles.startButton} 
                  onPress={startGame}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>🚀 START GAME 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.difficultySelectButton}
                  onPress={() => setShowDifficultySelect(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.difficultySelectButtonText}>🎯SELECT DIFFICULTY🎯</Text>
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
                </View>

                {/* Debug Info */}
                <Text style={styles.debugText}>
                  T: {thoughts.length} | P: {projectiles.length} | X:{" "}
                  {Math.round(playerX)}
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

                {/* Background touch area for movement */}
                <View
                  style={styles.backgroundTouchArea}
                  onTouchStart={(evt) => {
                    const { locationX, locationY } = evt.nativeEvent;

                    // Move player
                    handlePlayerMove(locationX);

                    // Shoot if in bottom area
                    if (locationY > GAME_HEIGHT * 0.66) {
                      shoot();
                    }
                  }}
                  onTouchMove={(evt) => {
                    const { locationX } = evt.nativeEvent;
                    handlePlayerMove(locationX);
                  }}
                >
                  {/* Shooting Zone Overlay */}
                <TouchableOpacity 
                  style={styles.shootingZone}
                  onPress={() => {
                    shoot();
                  }}
                  activeOpacity={0.7}
                >
                  {gameState.waveComplete && (
                    <Text style={styles.shootingZoneText}>WAVE COMPLETE!</Text>
                )}
                </TouchableOpacity>
                </View>
                
                {/* Thoughts - High priority for tapping */}
                {thoughts.map((thought) => (
                  <TouchableOpacity
                    key={`thought-${thought.id}`}
                    style={[
                      styles.thought,
                      {
                        left: thought.x,
                        top: thought.y,
                        backgroundColor: thought.isPositive
                          ? "#00ff41"
                          : "#ff0041",
                        borderColor: thought.isPositive ? "#00aa2a" : "#aa0020",
                        borderWidth: thought.powerUpType ? 3 : 2,
                        shadowColor: thought.powerUpType
                          ? "#ffff00"
                          : thought.isPositive
                          ? "#00ff41"
                          : "#ff0041",
                        shadowOpacity: thought.powerUpType ? 1 : 0.8,
                        shadowRadius: thought.powerUpType ? 12 : 0,
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
                      <Text style={styles.thoughtText}>{thought.text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                
                {/* Player */}
                <View style={[styles.player, { left: playerX }]}>
                  <Text style={styles.playerText}>🛡️</Text>
                </View>

                {/* Projectiles */}
                {projectiles.map((projectile) => (
                  <View
                    key={`projectile-${projectile.id}`}
                    style={[
                      styles.projectile,
                      {
                        left: projectile.x - 4,
                        top: projectile.y - 4,
                      },
                    ]}
                  >
                    <Text style={styles.projectileText}>⚡</Text>
                  </View>
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
                🎮 ENHANCED CONTROLS 🎮
              </Text>
              <Text style={styles.instructionText}>
                TAP GREEN THOUGHTS FOR POWER-UPS
              </Text>
              <Text style={styles.instructionText}>
                SHOOT RED THOUGHTS TO SURVIVE
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 18,
  },
  modalpassages: {
    width: Math.min(GAME_WIDTH, width * 0.95),
    maxWidth: 400,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d4af37',
    padding: 16,
    alignItems: "center",
    shadowColor: '#d4af37',
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
    color: '#4ee6e6',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
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
    flex: 1,
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  difficultyTitle: {
    color: '#4ee6e6',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  difficultySubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  difficultyOptionsContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 16,
    minHeight: 0,
  },
  difficultyOptions: {
    width: '100%',
    flex: 1,
  },
  difficultyButtonsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  difficultyOption: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: '#d4af37',
    borderRadius: 12,
    padding: height < 700 ? 12 : 16,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: height < 700 ? 70 : 80,
  },
  selectedDifficulty: {
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    shadowColor: '#d4af37',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  difficultyName: {
    color: '#d4af37',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  difficultyDescription: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  difficultyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
    flexWrap: 'wrap',
  },
  difficultyStatText: {
    color: '#d4af37',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
   difficultySelectButton: {
    backgroundColor: '#d4af37',
    borderWidth: 2,
    borderColor: '#b8860b',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultySelectButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  backButton: {
    backgroundColor: '#666666',
    borderWidth: 2,
    borderColor: '#888888',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 52,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  startScreen: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  startTitle: {
    color: '#4ee6e6',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(78, 230, 230, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  startSubtitle: {
    color: '#d4af37',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  exitButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderWidth: 3,
    borderColor: 'rgba(245, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: 'rgba(255, 0, 0, 0.8)',
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonText: {
    color: '#0f0f23',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  startHint: {
    color: '#d4af37',
    fontSize: 12,
    fontWeight: '600',
    textAlign: "center",
  },
  shootingZone: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GAME_HEIGHT * 0.34,
    backgroundColor: "rgba(212, 175, 55, 0.05)",
    borderTopWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
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
    bottom: 20,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: '#fe9900',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e28802',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff9901',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  playerText: {
    fontSize: 16,
    color: "#0f0f23",
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