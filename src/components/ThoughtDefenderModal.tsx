import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");
const GAME_WIDTH = width * 0.9;
const GAME_HEIGHT = height * 0.6;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 20;

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
      waveTarget: 15,
      levelScaling: 0.2,
      maxLevels: 3,
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
      waveTarget: 20,
      levelScaling: 0.3,
      maxLevels: 5,
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
      waveTarget: 25,
      levelScaling: 0.4,
      maxLevels: 7,
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
      waveTarget: 30,
      levelScaling: 0.5,
      maxLevels: 10,
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

// Enhanced thought arrays with power-up types
const POSITIVE_THOUGHTS = [
  { text: "I am capable", powerUp: undefined },
  { text: "I can handle this", powerUp: undefined },
  { text: "I am growing", powerUp: undefined },
  { text: "I am resilient", powerUp: "shield" },
  { text: "I am worthy", powerUp: undefined },
  { text: "I am enough", powerUp: undefined },
  { text: "I am learning", powerUp: "multiplier" },
  { text: "I am strong", powerUp: "extralife" },
  { text: "I am focused", powerUp: "slowtime" },
  { text: "I am powerful", powerUp: "multishot" },
  { text: "I am quick", powerUp: "fastshoot" },
];

const NEGATIVE_THOUGHTS = [
  "I can't do this",
  "I'm not good enough",
  "I always fail",
  "I'm a burden",
  "I'm worthless",
  "I'm a failure",
  "I'm not smart enough",
  "I'm not strong enough",
];

interface ThoughtDefenderModalProps {
  visible: boolean;
  onClose: () => void;
  onScoreUpdate?: (data: { score: number; level: number; won: boolean; difficulty: string }) => void;
}

const ThoughtDefenderModal: React.FC<ThoughtDefenderModalProps> = ({
  visible,
  onClose,
  onScoreUpdate,
}) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [showDifficultySelect, setShowDifficultySelect] = useState<boolean>(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [playerX, setPlayerX] = useState<number>(
    GAME_WIDTH / 2 - PADDLE_WIDTH / 2
  );
  const [canShoot, setCanShoot] = useState<boolean>(true);

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

  const getDifficultyConfig = useCallback((): DifficultyConfig => {
    return DIFFICULTY_LEVELS[selectedDifficulty] || DIFFICULTY_LEVELS.normal;
  }, [selectedDifficulty]);

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
    console.log("🎮 Player moved to:", newX);
  };

  const shoot = useCallback((): void => {
    if (!canShoot || !gameStarted) {
      console.log("❌ Cannot shoot:", { canShoot, gameStarted });
      return;
    }

    console.log("🔫 Shooting!");

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
        console.log(
          "✅ Multi-shot created. Total projectiles:",
          updated.length
        );
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
        console.log(
          "✅ Projectile created. Total projectiles:",
          updated.length
        );
        return updated;
      });
    }

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
    console.log("🌟 Activating power-up:", powerUpType);

    const powerUp = POWER_UPS[powerUpType as keyof typeof POWER_UPS];
    if (!powerUp) return;

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
        console.log("❤️ Extra life gained!");
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
  }, []);

  const spawnThought = useCallback((): void => {
    if (!gameStarted || lives <= 0) return;

    const difficulty = getDifficultyConfig();

    // Difficulty scaling
    const levelMultiplier = 1 + (level - 1) * difficulty.modifiers.levelScaling;
    const negativeChance = Math.min(difficulty.modifiers.negativeThoughtChance + (level - 1) * 0.1, 0.9); // Increase negative thoughts
    const isPositive = Math.random() > negativeChance;
    
    console.log('🎯 Spawning thought - Difficulty:', difficulty.name, 'Level:', level, 'Negative chance:', negativeChance.toFixed(2));
    
    let text: string;
    let powerUpType: string | undefined;

    if (isPositive) {
      const positiveThought =
        POSITIVE_THOUGHTS[Math.floor(Math.random() * POSITIVE_THOUGHTS.length)];
      text = positiveThought.text;
      // 30% chance for power-up on positive thoughts
      powerUpType = Math.random() < difficulty.modifiers.powerUpChance ? positiveThought.powerUp : undefined;
      console.log('💚 Positive thought:', text, powerUpType ? `with power-up: ${powerUpType}` : 'no power-up');
    } else {
      text =
        NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)];
      console.log("💀 Negative thought:", text);
    }

    // Speed increases with level and time slow effect
    const baseSpeed = isPositive 
      ? 1 + Math.random() * difficulty.modifiers.thoughtSpeed
      : 2 + Math.random() * 2 * difficulty.modifiers.thoughtSpeed;
    
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
      console.log(
        "🧠 Thought spawned:",
        text,
        powerUpType ? `[${powerUpType}]` : "",
        "Speed:",
        finalSpeed.toFixed(1),
        "Total thoughts:",
        updated.length
      );
      return updated;
    });

    // Track wave progress
    setGameState((prev) => ({
      ...prev,
      thoughtsInWave: prev.thoughtsInWave + 1,
    }));
  }, [gameStarted, lives, level, gameState.timeSlowActive, getDifficultyConfig]);

  const updateGame = useCallback((): void => {
    if (!gameStarted || lives <= 0) return;

    // Update projectiles
    setProjectiles((prev) => {
      const updated = prev
        .map((p) => ({ ...p, y: p.y - p.speed }))
        .filter((p) => p.y > -20);

      if (updated.length !== prev.length) {
        console.log(
          "⚡ Projectiles updated:",
          prev.length,
          "->",
          updated.length
        );
      }
      return updated;
    });

    // Update thoughts
    setThoughts((prev) => {
      const updated = prev
        .map((t) => ({ ...t, y: t.y + t.speed }))
        .filter((t) => {
          // Remove thoughts that reached bottom and handle life loss
          if (t.y > GAME_HEIGHT - 60) {
            if (!t.isPositive) {
              // Only lose life if shield is not active
              if (!gameState.shieldActive) {
                setLives((currentLives) => {
                  const newLives = Math.max(0, currentLives - 1);
                  console.log("💀 Life lost! Lives remaining:", newLives);
                  return newLives;
                });
              } else {
                console.log("🛡️ Shield protected from negative thought!");
              }
            } else {
              console.log("💚 Missed positive thought");
            }
            return false;
          }
          return true;
        });

      return updated;
    });

    // Check collisions
    setProjectiles((prevProjectiles) => {
      let updatedProjectiles = [...prevProjectiles];

      setThoughts((prevThoughts) => {
        let updatedThoughts = [...prevThoughts];

        // Check each projectile against each negative thought
        for (let i = updatedProjectiles.length - 1; i >= 0; i--) {
          const projectile = updatedProjectiles[i];

          for (let j = updatedThoughts.length - 1; j >= 0; j--) {
            const thought = updatedThoughts[j];

            if (!thought.isPositive) {
              const dx = projectile.x - (thought.x + 35);
              const dy = projectile.y - (thought.y + 17.5);
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 40) {
                // Collision detected
                updatedProjectiles.splice(i, 1);
                updatedThoughts.splice(j, 1);

                // Score with multiplier
                const difficulty = getDifficultyConfig();
                const basePoints = 15 * difficulty.modifiers.scoreMultiplier;
                const points = Math.round(basePoints * gameState.scoreMultiplier);
                setScore(prevScore => {
                  const newScore = prevScore + points;
                  console.log(
                    "💥 Hit! Score:",
                    newScore,
                    gameState.scoreMultiplier > 1
                      ? `(x${gameState.scoreMultiplier})`
                      : ""
                  );
                  return newScore;
                });

                // Track cleared thoughts
                setGameState((prev) => ({
                  ...prev,
                  thoughtsCleared: prev.thoughtsCleared + 1,
                }));

                break;
              }
            }
          }
        }

        return updatedThoughts;
      });

      return updatedProjectiles;
    });
  }, [gameStarted, lives, gameState.shieldActive, gameState.scoreMultiplier, getDifficultyConfig]);

  const handleThoughtPress = (thought: Thought): void => {
    console.log(
      "🎯 Thought pressed:",
      thought.text,
      "isPositive:",
      thought.isPositive,
      "powerUp:",
      thought.powerUpType
    );

    if (!gameStarted || !thought.isPositive) {
      console.log("❌ Cannot catch - game not started or negative thought");
      return;
    }

    console.log(
      "💚 Positive thought caught!",
      thought.powerUpType ? `Power-up: ${thought.powerUpType}` : "No power-up"
    );

    // Calculate score with multiplier
    const difficulty = getDifficultyConfig();
    const basePoints = 25 * difficulty.modifiers.scoreMultiplier;
    const points = Math.round(basePoints * gameState.scoreMultiplier);
    setScore(prev => {
      const newScore = prev + points;
      console.log("📈 Score increased by", points, "new total:", newScore);
      return newScore;
    });

    // Activate power-up if available
    if (thought.powerUpType) {
      console.log("🌟 Activating power-up:", thought.powerUpType);
      activatePowerUp(thought.powerUpType);
    }

    // Remove thought and track progress
    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    setGameState((prev) => ({
      ...prev,
      thoughtsCleared: prev.thoughtsCleared + 1,
    }));

    console.log("✅ Thought removed and progress updated");
  };

  const startGame = useCallback((): void => {
    console.log('🚀 Starting game with difficulty:', selectedDifficulty);
    
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
    
    console.log('✅ Game started with', difficulty.modifiers.livesStart, 'lives!');
  }, [selectedDifficulty, getDifficultyConfig]);

  const checkWinCondition = useCallback((): void => {
    const difficulty = getDifficultyConfig();
    const currentWaveTarget = getCurrentWaveTarget();

    // Win conditions
    const TARGET_SCORE = (500 + (level - 1) * 200) * difficulty.modifiers.scoreMultiplier; // Increasing target score
    
    console.log('🎯 Checking win condition - Cleared:', gameState.thoughtsCleared, 'Target:', currentWaveTarget, 'Score:', score, 'Target Score:', TARGET_SCORE);
    
    // Check if wave is complete
    if (gameState.thoughtsCleared >= currentWaveTarget) {
      console.log("🌊 Wave completed!");
      setGameState((prev) => ({ ...prev, waveComplete: true }));
        setTimeout(
          () => setGameState((prev) => ({ ...prev, waveComplete: false })),
          8000
        );
      

      // Check for overall victory
      if (level >= difficulty.modifiers.maxLevels) {
        // VICTORY!
        console.log("🏆 VICTORY ACHIEVED!");
        setGameStarted(false);

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
        
        if (onScoreUpdate) onScoreUpdate({ score, level, won: true, difficulty: selectedDifficulty });
        
        Alert.alert(
          '🏆 VICTORY! 🏆',
          `CONGRATULATIONS!\n\nDifficulty: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 YOU HAVE MASTERED YOUR MIND!`,
          [
            { text: '🎉 PLAY AGAIN', onPress: () => setShowDifficultySelect(true) },
            { text: '❌ EXIT', onPress: onClose }
          ]
        );
        return;
      }

      // Next level
      console.log("📈 Advancing to next level:", level + 1);
      setLevel((prev) => prev + 1);
      setLives((prev) => Math.min(prev + 1, 5)); // Bonus life for completing wave
      setGameState((prev) => ({
        ...prev,
        wave: prev.wave + 1,
        thoughtsInWave: 0,
        thoughtsCleared: 0,
      }));
    }
  }, [gameState.thoughtsCleared, level, score, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig, getCurrentWaveTarget]);

  const endGame = useCallback((): void => {
    console.log("🎮 Game Over!");
    setGameStarted(false);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);

    const difficulty =getDifficultyConfig();
    
    if (onScoreUpdate) onScoreUpdate({ score, level, won: false, difficulty: selectedDifficulty });
    
    Alert.alert(
      '⚡ GAME OVER ⚡',
      `DIFFICULTY: ${difficulty.name}\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 MIND DEFENDED!`,
      [
        { text: '🔄 RETRY', onPress: () => setShowDifficultySelect(true) },
        { text: '❌ EXIT', onPress: onClose }
      ]
    );
  }, [score, level, onScoreUpdate, onClose, selectedDifficulty, getDifficultyConfig]);

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
    console.log('🔄 Starting game loops with difficulty:', difficulty.name);
    
    gameLoopRef.current = setInterval(updateGame, 16) as unknown as number; // ~60 FPS

    // Spawn rate increases with level (faster spawning = more difficulty)
    const baseSpawnRate = 2000;
    const difficultySpawnRate = baseSpawnRate * difficulty.modifiers.spawnRate;
    const levelSpawnRate = Math.max(800, difficultySpawnRate - (level - 1) * 150);
    spawnLoopRef.current = setInterval(spawnThought, levelSpawnRate) as unknown as number;
    
    console.log('✅ Game loops started with spawn rate:', levelSpawnRate + 'ms', 'Difficulty modifier:', difficulty.modifiers.spawnRate);
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    };
  }, [gameStarted, updateGame, spawnThought, level, getDifficultyConfig]);

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
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    }
  }, [visible]);

  const renderDifficultySelect = () => (
    <View style={styles.difficultyScreen}>
      <View style={styles.difficultyOptions}>
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
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity 
        style={styles.startButton} 
        onPress={startGame}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>
        START {DIFFICULTY_LEVELS[selectedDifficulty].name}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setShowDifficultySelect(false)}
        activeOpacity={0.8}
      >
        <Text style={styles.backButtonText}>← BACK</Text>
      </TouchableOpacity>
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
                  <Text style={styles.hudLabel}>WAVE</Text>
                  <Text style={styles.hudValue}>
                    {gameState.wave.toString().padStart(2, "0")}
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
          <View style={styles.gameArea}>
            {!gameStarted && showDifficultySelect ? (
              renderDifficultySelect()
            ) : !gameStarted ? (
              // Start Screen
              <View style={styles.startScreen}>
                <Text style={styles.startSubtitle}>PROTECT YOUR THOUGHTS!</Text>

                <View style={styles.startInstructions}>
                  <Text style={styles.startInstructionText}>
                    💚 TAP positive thoughts for power-ups
                  </Text>
                  <Text style={styles.startInstructionText}>
                    ⚡ SHOOT negative thoughts to defend
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🏆 Complete waves to win the game
                  </Text>
                  <Text style={styles.startInstructionText}>
                    🛡️ Collect power-ups for special abilities
                  </Text>
                </View>

                <Text style={styles.startSubtitle}>CURRENT DIFFICULTY:</Text>
                <Text style={styles.startSubtitle}>{DIFFICULTY_LEVELS[selectedDifficulty].icon}{DIFFICULTY_LEVELS[selectedDifficulty].name}</Text>

                <TouchableOpacity
                  style={styles.difficultySelectButton}
                  onPress={() => setShowDifficultySelect(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.difficultySelectButtonText}>🎯SELECT DIFFICULTY🎯</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.startButton} 
                  onPress={startGame}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>🚀 START GAME 🚀</Text>
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

                {/* Background touch area for movement */}
                <View
                  style={styles.backgroundTouchArea}
                  onTouchStart={(evt) => {
                    const { locationX, locationY } = evt.nativeEvent;
                    console.log("🎮 Background touch:", {
                      locationX,
                      locationY,
                    });

                    // Move player
                    handlePlayerMove(locationX);

                    // Shoot if in bottom area
                    if (locationY > GAME_HEIGHT * 0.66) {
                      console.log("🎯 Background touch in shooting zone");
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
                    console.log('🎯 Shooting zone overlay pressed');
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
                      console.log(
                        "🎯 THOUGHT TAPPED:",
                        thought.text,
                        "isPositive:",
                        thought.isPositive
                      );
                      handleThoughtPress(thought);
                    }}
                    activeOpacity={0.8}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <View style={styles.thoughtpassages} pointerEvents="none">
                      <Text style={styles.thoughtIcon}>
                        {thought.isPositive ? "💚" : "💀"}
                        {thought.powerUpType && (
                          <Text style={styles.powerUpBadge}>
                            {
                              POWER_UPS[
                                thought.powerUpType as keyof typeof POWER_UPS
                              ]?.icon
                            }
                          </Text>
                        )}
                      </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalpassages: {
    width: GAME_WIDTH,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    borderWidth: 4,
    borderColor: "#00ff41",
    padding: 16,
    alignItems: "center",
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  title: {
    color: "#00ff41",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "#00aa2a",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#0f0f23",
    borderWidth: 2,
    borderColor: "#00ff41",
    padding: 8,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  hudItem: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
    minWidth: 0,
  },
  hudLabel: {
    color: "#00ff41",
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
    width: GAME_WIDTH - 32,
    height: GAME_HEIGHT,
    backgroundColor: "#0f0f23",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#00ff41",
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
    color: "#00ff41",
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  difficultyTitle: {
    color: '#00ff41',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#00aa2a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  difficultySubtitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    opacity: 0.8,
  },
  difficultyOptions: {
    width: '100%',
    marginBottom: 20,
  },
  difficultyOption: {
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#333366',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDifficulty: {
    borderColor: '#00ff41',
    backgroundColor: '#1a2e1a',
    shadowColor: '#00ff41',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 1,
  },
  difficultyDescription: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  difficultyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  difficultyStatText: {
    color: '#00ff41',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    flex: 1,
  },
   difficultySelectButton: {
    backgroundColor: '#ff6600',
    borderWidth: 3,
    borderColor: '#cc5500',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultySelectButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    paddingVertical: 10,
    marginTop: 0,
    shadowColor: '#666666',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  startScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  startTitle: {
    color: '#00ff41',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: '#00aa2a',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  startSubtitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1,
  },
  startInstructions: {
    marginBottom: 32,
    alignItems: "center",
  },
  startInstructionText: {
    color: "#00ff41",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  startButton: {
    backgroundColor: "#00ff41",
    borderWidth: 3,
    borderColor: "#00aa2a",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: "#00ff41",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    color: '#0f0f23',
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
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    textAlign: "center",
    fontStyle: "italic",
  },
  shootingZone: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GAME_HEIGHT * 0.34,
    backgroundColor: "rgba(0, 255, 65, 0.05)",
    borderTopWidth: 1,
    borderColor: "rgba(0, 255, 65, 0.3)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Lower than thoughts but higher than background
    elevation: 10,
  },
  shootingZoneText: {
    color: "rgba(0, 255, 65, 0.5)",
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
    borderRadius: 35,
    borderWidth: 2,
    width: 75,
    height: 75,
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
  thoughtIcon: {
    fontSize: 12,
    marginBottom: 2,
    position: "relative",
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
    color: "#00ff41",
  },
  instructions: {
    marginBottom: 16,
    backgroundColor: "#0f0f23",
    borderWidth: 2,
    borderColor: "#00ff41",
    borderRadius: 4,
    padding: 12,
    width: "100%",
  },
  instructionTitle: {
    color: "#00ff41",
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