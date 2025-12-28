import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'

const { width, height } = Dimensions.get('window')
const GAME_WIDTH = width - 32
const GAME_HEIGHT = height * 0.7

interface Projectile {
  id: string
  x: number
  y: number
}

interface NegativeThought {
  id: string
  x: number
  y: number
  speed: number
}

interface PowerUp {
  id: string
  x: number
  y: number
  type: 'slowTime' | 'multishot' | 'fastShoot' | 'extraLife' | 'multiplier' | 'shield'
}

export default function ThoughtDefender() {
  const router = useRouter()
  const { updateAttribute } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - 25)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [projectiles, setProjectiles] = useState<Projectile[]>([])
  const [negativeThoughts, setNegativeThoughts] = useState<NegativeThought[]>([])
  const [powerUps, setPowerUps] = useState<PowerUp[]>([])
  const [gameSpeed, setGameSpeed] = useState(1)
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isPlaying && !gameOver) {
      startGameLoop()
      startSpawnLoop()
    } else {
      stopGameLoop()
      stopSpawnLoop()
    }

    return () => {
      stopGameLoop()
      stopSpawnLoop()
    }
  }, [isPlaying, gameOver])

  function startGameLoop() {
    gameLoopRef.current = setInterval(() => {
      // Move projectiles up
      setProjectiles((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y - 10 * gameSpeed }))
          .filter((p) => p.y > 0)
      )

      // Move negative thoughts down
      setNegativeThoughts((prev) =>
        prev.map((thought) => ({
          ...thought,
          y: thought.y + thought.speed * gameSpeed,
        }))
      )

      // Move power-ups down
      setPowerUps((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y + 2 * gameSpeed,
        }))
      )

      // Check collisions
      checkCollisions()
    }, 16) // ~60fps
  }

  function stopGameLoop() {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current)
      gameLoopRef.current = null
    }
  }

  function startSpawnLoop() {
    function spawn() {
      if (!isPlaying || gameOver) return

      // Spawn negative thought
      const newThought: NegativeThought = {
        id: Date.now().toString(),
        x: Math.random() * (GAME_WIDTH - 40),
        y: -40,
        speed: 1 + Math.random() * 2,
      }
      setNegativeThoughts((prev) => [...prev, newThought])

      // Occasionally spawn power-up
      if (Math.random() < 0.1) {
        const powerUpTypes: PowerUp['type'][] = [
          'slowTime',
          'multishot',
          'fastShoot',
          'extraLife',
          'multiplier',
          'shield',
        ]
        const newPowerUp: PowerUp = {
          id: `powerup-${Date.now()}`,
          x: Math.random() * (GAME_WIDTH - 40),
          y: -40,
          type: powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)],
        }
        setPowerUps((prev) => [...prev, newPowerUp])
      }

      spawnTimerRef.current = setTimeout(spawn, 1000 / gameSpeed)
    }
    spawn()
  }

  function stopSpawnLoop() {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current)
      spawnTimerRef.current = null
    }
  }

  function checkCollisions() {
    // Check projectile vs negative thought collisions
    setProjectiles((projs) => {
      const remainingProjs: Projectile[] = []
      const hitThoughtIds = new Set<string>()

      projs.forEach((proj) => {
        const hitThought = negativeThoughts.find(
          (thought) =>
            proj.x < thought.x + 40 &&
            proj.x + 10 > thought.x &&
            proj.y < thought.y + 40 &&
            proj.y + 10 > thought.y
        )

        if (hitThought) {
          hitThoughtIds.add(hitThought.id)
          setScore((s) => s + 10)
        } else {
          remainingProjs.push(proj)
        }
      })

      setNegativeThoughts((thoughts) =>
        thoughts.filter((t) => !hitThoughtIds.has(t.id))
      )

      return remainingProjs
    })

    // Check player vs negative thought collisions
    negativeThoughts.forEach((thought) => {
      if (
        thought.y + 40 > GAME_HEIGHT - 60 &&
        thought.y < GAME_HEIGHT - 20 &&
        thought.x < playerX + 50 &&
        thought.x + 40 > playerX
      ) {
        handlePlayerHit()
        setNegativeThoughts((prev) => prev.filter((t) => t.id !== thought.id))
      }
    })

    // Check player vs power-up collisions
    powerUps.forEach((powerUp) => {
      if (
        powerUp.y + 40 > GAME_HEIGHT - 60 &&
        powerUp.y < GAME_HEIGHT - 20 &&
        powerUp.x < playerX + 50 &&
        powerUp.x + 40 > playerX
      ) {
        handlePowerUp(powerUp.type)
        setPowerUps((prev) => prev.filter((p) => p.id !== powerUp.id))
      }
    })
  }

  function handlePlayerHit() {
    setLives((l) => {
      if (l <= 1) {
        endGame()
        return 0
      }
      return l - 1
    })
  }

  function handlePowerUp(type: PowerUp['type']) {
    switch (type) {
      case 'extraLife':
        setLives((l) => l + 1)
        break
      case 'slowTime':
        setGameSpeed((s) => Math.max(0.5, s - 0.3))
        setTimeout(() => setGameSpeed(1), 5000)
        break
      case 'fastShoot':
        // Would increase shoot speed
        break
      case 'multishot':
        // Would enable multishot
        break
      case 'multiplier':
        setScore((s) => s + 50)
        break
      case 'shield':
        // Would provide temporary shield
        break
    }
  }

  function shoot() {
    if (!isPlaying || gameOver) return

    haptics.lightImpact()
    const newProjectile: Projectile = {
      id: Date.now().toString(),
      x: playerX + 20,
      y: GAME_HEIGHT - 60,
    }
    setProjectiles((prev) => [...prev, newProjectile])
  }

  function movePlayer(direction: 'left' | 'right') {
    const moveAmount = 10
    if (direction === 'left') {
      setPlayerX((x) => Math.max(0, x - moveAmount))
    } else {
      setPlayerX((x) => Math.min(GAME_WIDTH - 50, x + moveAmount))
    }
  }

  function startGame() {
    haptics.mediumImpact()
    playPageFlipSound()
    setIsPlaying(true)
    setGameOver(false)
    setScore(0)
    setLives(3)
    setProjectiles([])
    setNegativeThoughts([])
    setPowerUps([])
    setGameSpeed(1)
  }

  function endGame() {
    setGameOver(true)
    setIsPlaying(false)
    
    // Reward based on score
    if (score >= 200) {
      updateAttribute('courage', 1)
    }
    if (score >= 100) {
      updateAttribute('exploration', 1)
    }

    Alert.alert(
      'Game Over',
      `Final Score: ${score}\n\nYou've practiced reframing negative thoughts!`,
      [
        {
          text: 'Play Again',
          onPress: startGame,
        },
        {
          text: 'Back to Archive',
          onPress: () => router.replace('/hub'),
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thought Defender</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Score: {score}</Text>
          <Text style={styles.statText}>Lives: {lives}</Text>
        </View>
      </View>

      <View style={[styles.gameArea, { width: GAME_WIDTH, height: GAME_HEIGHT }]}>
        {/* Player */}
        <View
          style={[
            styles.player,
            {
              left: playerX,
              bottom: 20,
            },
          ]}
        >
          <Image
            source={require('../assets/thoughtDefender/user.png')}
            style={styles.playerImage}
            resizeMode="contain"
          />
        </View>

        {/* Projectiles */}
        {projectiles.map((proj) => (
          <View
            {...({ key: proj.id } as any)}
            style={[
              styles.projectile,
              {
                left: proj.x,
                top: proj.y,
              },
            ]}
          >
            <Image
              source={require('../assets/thoughtDefender/projectile.png')}
              style={styles.projectileImage}
              resizeMode="contain"
            />
          </View>
        ))}

        {/* Negative Thoughts */}
        {negativeThoughts.map((thought) => (
          <View
            {...({ key: thought.id } as any)}
            style={[
              styles.negativeThought,
              {
                left: thought.x,
                top: thought.y,
              },
            ]}
          >
            <Image
              source={require('../assets/thoughtDefender/negativeThought.png')}
              style={styles.thoughtImage}
              resizeMode="contain"
            />
          </View>
        ))}

        {/* Power-ups */}
        {powerUps.map((powerUp) => (
          <View
            {...({ key: powerUp.id } as any)}
            style={[
              styles.powerUp,
              {
                left: powerUp.x,
                top: powerUp.y,
              },
            ]}
          >
            <Image
              source={require('../assets/thoughtDefender/shield.png')}
              style={styles.powerUpImage}
              resizeMode="contain"
            />
          </View>
        ))}

        {!isPlaying && !gameOver && (
          <View style={styles.startOverlay}>
            <Text style={styles.startText}>
              Reframe negative thoughts by shooting them with positive energy!
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        )}

        {gameOver && (
          <View style={styles.startOverlay}>
            <Text style={styles.startText}>Game Over</Text>
            <Text style={styles.scoreText}>Final Score: {score}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            haptics.selection()
            movePlayer('left')
          }}
          onPressIn={() => {
            haptics.selection()
            const interval = setInterval(() => movePlayer('left'), 50)
            setTimeout(() => clearInterval(interval), 500)
          }}
        >
          <Text style={styles.controlText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.shootButton]}
          onPress={shoot}
        >
          <Text style={styles.controlText}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            haptics.selection()
            movePlayer('right')
          }}
          onPressIn={() => {
            haptics.selection()
            const interval = setInterval(() => movePlayer('right'), 50)
            setTimeout(() => clearInterval(interval), 500)
          }}
        >
          <Text style={styles.controlText}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  gameArea: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  player: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerImage: {
    width: 50,
    height: 50,
  },
  projectile: {
    position: 'absolute',
    width: 10,
    height: 20,
  },
  projectileImage: {
    width: 10,
    height: 20,
  },
  negativeThought: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  thoughtImage: {
    width: 40,
    height: 40,
  },
  powerUp: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  powerUpImage: {
    width: 30,
    height: 30,
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startText: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreText: {
    fontSize: 24,
    color: '#6B46C1',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: GAME_WIDTH,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  controlButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderRadius: 8,
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shootButton: {
    backgroundColor: '#6B46C1',
  },
  controlText: {
    fontSize: 24,
    color: '#E0E0E0',
  },
})

