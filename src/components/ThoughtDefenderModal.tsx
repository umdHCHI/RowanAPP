import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { GameState, PowerUp, Projectile, Thought } from "../types";


// Simple custom button component for the game
const GameButton = ({ title, onPress, style, color = "darkBrown" }: any) => (
  <TouchableOpacity
    style={[
      {
        backgroundColor: color === "darkBrown" ? "#8B4513" : "#4CAF50",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: color === "darkBrown" ? "#654321" : "#45a049",
      },
      style,
    ]}
    onPress={onPress}
  >
    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
      {title}
    </Text>
  </TouchableOpacity>
);


const { width, height } = Dimensions.get("window");
const GAME_WIDTH = width * 0.9;
const GAME_HEIGHT = height * 0.6;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 20;




// Power-up definitions --- power ups from from story 
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

// Enhanced thought arrays with power-up types -- needs to be altered from stroy/person 
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
  onScoreUpdate?: (data: {
    score: number;
    level: number;
    won: boolean;
  }) => void;
  isFullScreen?: boolean;
}

const ThoughtDefenderModal: React.FC<ThoughtDefenderModalProps> = ({
  visible,
  onClose,
  onScoreUpdate,
  isFullScreen = false,
}) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
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
  });
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([]);

  const gameLoopRef = useRef<number>(0);
  const spawnLoopRef = useRef<number>(0);
  const thoughtIdCounter = useRef<number>(0);
  const projectileIdCounter = useRef<number>(0);

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
          x: playerX + PADDLE_WIDTH / 2 - 10,
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
          x: playerX + PADDLE_WIDTH / 2 + 10,
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

    // Difficulty scaling
    const difficultyMultiplier = 1 + (level - 1) * 0.3;
    const baseNegativeChance = Math.min(0.4 + (level - 1) * 0.1, 0.8); // Increase negative thoughts
    const isPositive = Math.random() > baseNegativeChance;

    console.log(
      "🎯 Spawning thought - Level:",
      level,
      "Difficulty:",
      difficultyMultiplier,
      "Negative chance:",
      baseNegativeChance
    );

    let text: string;
    let powerUpType: string | undefined;

    if (isPositive) {
      const positiveThought =
        POSITIVE_THOUGHTS[Math.floor(Math.random() * POSITIVE_THOUGHTS.length)];
      text = positiveThought.text;
      // 30% chance for power-up on positive thoughts
      powerUpType = Math.random() < 0.3 ? positiveThought.powerUp : undefined;
      console.log(
        "💚 Positive thought:",
        text,
        powerUpType ? `with power-up: ${powerUpType}` : "no power-up"
      );
    } else {
      text =
        NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)];
      console.log("💀 Negative thought:", text);
    }

    // Speed increases with level and time slow effect
    const baseSpeed = isPositive
      ? 1 + Math.random() * difficultyMultiplier
      : 2 + Math.random() * 2 * difficultyMultiplier;

    const finalSpeed = gameState.timeSlowActive ? baseSpeed * 0.5 : baseSpeed;

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
  }, [gameStarted, lives, level, gameState.timeSlowActive]);

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

            // Track cleared thoughts
            setGameState((prev) => ({
              ...prev,
              thoughtsCleared: prev.thoughtsCleared + 1,
            }));

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
              const dx = projectile.x - (thought.x + 60);
              const dy = projectile.y - (thought.y + 25);
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 30) {
                // Collision detected
                updatedProjectiles.splice(i, 1);
                updatedThoughts.splice(j, 1);

                // Score with multiplier
                const points = 15 * gameState.scoreMultiplier;
                setScore((prevScore) => {
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
  }, [gameStarted, lives]);

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
    const points = 25 * gameState.scoreMultiplier;
    setScore((prev) => {
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
    console.log("🚀 Starting game...");

    // Reset game state
    setScore(0);
    setLives(3);
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
    });
    setActivePowerUps([]);
    setGameStarted(true);

    console.log("✅ Game started!");
  }, []);

  const checkWinCondition = useCallback((): void => {
    // Win conditions
    const TARGET_SCORE = 500 + (level - 1) * 200; // Increasing target score
    const THOUGHTS_PER_WAVE = 20 + (level - 1) * 5; // More thoughts per wave as level increases

    console.log(
      "🎯 Checking win condition - Cleared:",
      gameState.thoughtsCleared,
      "Target:",
      THOUGHTS_PER_WAVE,
      "Score:",
      score,
      "Target Score:",
      TARGET_SCORE
    );

    // Check if wave is complete
    if (gameState.thoughtsCleared >= THOUGHTS_PER_WAVE) {
      console.log("🌊 Wave completed!");

      // Check for overall victory
      if (level >= 5 || score >= TARGET_SCORE) {
        // VICTORY!
        console.log("🏆 VICTORY ACHIEVED!");
        setGameStarted(false);

        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);

        if (onScoreUpdate) onScoreUpdate({ score, level, won: true });

        Alert.alert(
          "🏆 VICTORY! 🏆",
          `CONGRATULATIONS!\n\nFINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 YOU HAVE MASTERED YOUR MIND!`,
          [
            { text: "🎉 PLAY AGAIN", onPress: startGame },
            { text: "❌ EXIT", onPress: onClose },
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

      Alert.alert(
        "🌊 WAVE COMPLETE! 🌊",
        `Excellent mental defense!\n\nLevel: ${
          level + 1
        }\nBonus Life Awarded!\nTarget Score: ${TARGET_SCORE}\n\nGet ready for stronger thoughts!`,
        [
          {
            text: "💪 CONTINUE",
            onPress: () => console.log("Next wave starting..."),
          },
        ]
      );
    }
  }, [
    gameState.thoughtsCleared,
    level,
    score,
    onScoreUpdate,
    onClose,
    startGame,
  ]);

  const endGame = useCallback((): void => {
    console.log("🎮 Game Over!");
    setGameStarted(false);

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);

    if (onScoreUpdate) onScoreUpdate({ score, level, won: false });

    Alert.alert(
      "⚡ GAME OVER ⚡",
      `FINAL SCORE: ${score}\nLEVEL REACHED: ${level}\n\n🧠 MIND DEFENDED!`,
      [
        { text: "🔄 RETRY", onPress: startGame },
        { text: "❌ EXIT", onPress: onClose },
      ]
    );
  }, [score, level, onScoreUpdate, onClose, startGame]);

  // Check win condition
  useEffect(() => {
    if (gameStarted) {
      checkWinCondition();
    }
  }, [gameStarted, checkWinCondition]);

  // Game loop effect
  useEffect(() => {
    if (!gameStarted) return;

    console.log("🔄 Starting game loops...");

    gameLoopRef.current = setInterval(updateGame, 16) as unknown as number; // ~60 FPS

    // Spawn rate increases with level (faster spawning = more difficulty)
    const spawnRate = Math.max(1000, 2000 - (level - 1) * 200); // From 2s to 1s minimum
    spawnLoopRef.current = setInterval(
      spawnThought,
      spawnRate
    ) as unknown as number;

    console.log("✅ Game loops started with spawn rate:", spawnRate + "ms");

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    };
  }, [gameStarted, updateGame, spawnThought, level]);

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
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (spawnLoopRef.current) clearInterval(spawnLoopRef.current);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={!isFullScreen}
      animationType={isFullScreen ? "none" : "fade"}
      onRequestClose={onClose}
    >
      <View style={isFullScreen ? { flex: 1, backgroundColor: '#0a0b0f' } : styles.modalContainer}>
        <View style={styles.modalpassages}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⚡ THOUGHT DEFENDER ⚡</Text>
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
                    {gameState.thoughtsCleared}/{20 + (level - 1) * 5}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Game Area */}
          <View style={styles.gameArea}>
            {!gameStarted ? (
              // Start Screen
              <View style={styles.startScreen}>
                <Text style={styles.startTitle}>🧠 MIND DEFENSE 🧠</Text>
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
                />

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

                {/* Shooting Zone Overlay */}
                <TouchableOpacity
                  style={styles.shootingZone}
                  onPress={() => {
                    console.log("🎯 Shooting zone overlay pressed");
                    shoot();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.shootingZoneText}>🎯 TAP TO SHOOT</Text>
                </TouchableOpacity>

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
                DRAG TO MOVE • TAP GREEN FOR POWER-UPS • SHOOT ZONE FOR RAPID
                FIRE
              </Text>
              <Text style={styles.instructionText}>
                🌟 GLOWING THOUGHTS = POWER-UPS • 🏆 CLEAR WAVES TO WIN!
              </Text>
            </View>
          )}

         
            <GameButton
              title="🚪 EXIT GAME"
              color="darkBrown"
              onPress={onClose}
              style={{ width: 150 }}
            />
         
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
    borderRadius: 4,
  },
  hudItem: {
    alignItems: "center",
    flex: 1,
  },
  hudLabel: {
    color: "#00ff41",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  hudValue: {
    color: "#ffffff",
    fontSize: 14,
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
  startScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  startTitle: {
    color: "#00ff41",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#00aa2a",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    letterSpacing: 2,
  },
  startSubtitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  startButtonText: {
    color: "#0f0f23",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
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
    fontSize: 12,
    fontWeight: "bold",
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    backgroundColor: "#00ff41",
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#00aa2a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00ff41",
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
    borderRadius: 4,
    borderWidth: 2,
    width: 120,
    height: 50,
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
