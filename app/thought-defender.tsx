import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useThoughtDefenderGame } from '@/hooks/use-thought-defender-game'
import { GAME_CONFIG, type Difficulty } from '@/utils/thought-defender-constants'
import {
  GameHeader,
  GameArea,
  GamePlayer,
  GameProjectile,
  GameEnemyProjectile,
  GameNegativeThought,
  GamePowerUp,
  GameBoss,
  GameOverlay,
  GameOverDialog,
  BossIncomingMoment,
  DebugHitboxes,
  FloatingThoughtEchoLayer,
} from '@/components/minigame'

export default function ThoughtDefender() {
  const router = useRouter()
  const { updateAttribute, addMemory } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const [showGameOverDialog, setShowGameOverDialog] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [bossDefeated, setBossDefeated] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const gameStartTimeRef = useRef<number>(0)

  // Calculate responsive game dimensions
  const gameDimensions = useMemo(() => {
    const horizontalPadding = 16
    const availableWidth = screenWidth - horizontalPadding * 2
    const availableHeight = screenHeight - insets.top - insets.bottom
    
    // Reserve space for header (~120px), controls (~100px), and padding
    const headerHeight = 120
    const controlsHeight = 100
    const verticalPadding = 16
    const reservedHeight = headerHeight + controlsHeight + verticalPadding * 3
    
    const gameWidth = Math.min(availableWidth, 400) // Max width for larger screens
    const gameHeight = Math.min(
      availableHeight - reservedHeight,
      gameWidth * 1.2 // Maintain aspect ratio
    )
    
    return { gameWidth, gameHeight }
  }, [screenWidth, screenHeight, insets.top, insets.bottom])

  const game = useThoughtDefenderGame({
    gameWidth: gameDimensions.gameWidth,
    gameHeight: gameDimensions.gameHeight,
    difficulty,
    onGameOver: (score, won, bossDef) => {
      setFinalScore(score)
      setGameWon(won)
      setBossDefeated(bossDef)
      setShowGameOverDialog(true)
      
      const durationSec = Math.floor(
        (performance.now() - gameStartTimeRef.current) / 1000
      )

      // Defer memory save and attribute updates to avoid state update during render
      setTimeout(() => {
        // Save memory
        const memory = {
          id: `thought-defender-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: won ? 'Thought Defender Victory' : 'Thought Defender Session',
          description: won
            ? `Defeated the big bad and sealed the breach! Score: ${score}`
            : `Practiced reframing negative thoughts. Score: ${score}`,
          type: 'THOUGHT_DEFENDER',
          content: JSON.stringify({
            score,
            durationSec,
            cleared: score / GAME_CONFIG.SCORE_PER_HIT, // Approximate thoughts cleared
            spawned: Math.floor(score / GAME_CONFIG.SCORE_PER_HIT) + (bossDef ? 1 : 0),
            won,
            bossDefeated: bossDef,
            difficulty,
          }),
          createdAt: new Date().toISOString(),
        }
        addMemory(memory)
        
        // Reward based on score
        if (score >= 200) {
          updateAttribute('courage', 1)
        }
        if (score >= 100) {
          updateAttribute('exploration', 1)
        }
      }, 0)
    },
  })

  // Track game start time
  useEffect(() => {
    if (game.isPlaying) {
      gameStartTimeRef.current = performance.now()
    }
  }, [game.isPlaying])

  function handleStartGame() {
    haptics.mediumImpact()
    playPageFlipSound()
    game.startGame()
  }

  const handleShootWithHaptics = useCallback(() => {
    if (!game.isPlaying || game.gameOver) return
    try {
      const shot = game.tryShoot()
      if (shot) {
        haptics.selection()
      }
    } catch (error) {
      console.error('Error in handleShootWithHaptics:', error)
    }
  }, [game.isPlaying, game.gameOver, game.tryShoot, haptics])

  function handlePlayAgain() {
    setShowGameOverDialog(false)
    handleStartGame()
  }

  function handleBackToHub() {
    setShowGameOverDialog(false)
    router.replace('/hub')
  }

  const handleEchoDone = useCallback((id: string) => {
    game.removeThoughtEcho(id)
  }, [game])

  return (
    <View
      className="flex-1 bg-archive-dark"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View className="flex-1 justify-between px-4" style={{ paddingTop: 16, paddingBottom: 8 }}>
        {/* Header - Fixed at top */}
        <View className="flex-shrink-0" style={{ marginTop: 8 }}>
            <GameHeader
              score={game.score}
              lives={game.lives}
              wave={game.wave}
              bossActive={!!game.boss}
              multishotActive={game.multishotActive}
              fastShootActive={game.fastShootActive}
              shieldActive={game.shieldActive}
              onTitlePress={game.handleHeaderPress}
            />
        </View>

        {/* Game Area - Flexible middle section */}
        <View className="flex-1 justify-center items-center min-h-0">
          {gameDimensions.gameWidth > 0 && gameDimensions.gameHeight > 0 ? (
            <GameArea
              width={gameDimensions.gameWidth}
              height={gameDimensions.gameHeight}
              onPlayerMove={game.isPlaying && !game.gameOver ? game.setPlayerXFromInput : undefined}
              onShoot={game.isPlaying && !game.gameOver ? handleShootWithHaptics : undefined}
              playerLastHitAt={game.playerLastHitAt}
            >
            {game.debugHitboxes && (
              <DebugHitboxes
                playerX={game.playerX}
                playerY={game.playerY}
                projectiles={game.projectiles}
                negativeThoughts={game.negativeThoughts}
                powerUps={game.powerUps}
              />
            )}
            {/* Floating Thought Echoes - rendered behind gameplay */}
            <FloatingThoughtEchoLayer
              echoes={game.thoughtEchoes}
              gameWidth={gameDimensions.gameWidth}
              gameHeight={gameDimensions.gameHeight}
              onEchoDone={handleEchoDone}
            />
            {/* Gameplay objects */}
            {game.negativeThoughts.map((thought) => (
              <GameNegativeThought key={thought.id} thought={thought} />
            ))}
            {game.powerUps.map((powerUp) => (
              <GamePowerUp key={powerUp.id} powerUp={powerUp} />
            ))}
            {game.projectiles.map((proj) => (
              <GameProjectile key={proj.id} projectile={proj} />
            ))}
            {game.enemyProjectiles.map((proj) => (
              <GameEnemyProjectile key={proj.id} projectile={proj} />
            ))}
            <GamePlayer x={game.playerX} y={game.playerY} shieldActive={game.shieldActive} />


            {game.boss && (
              <GameBoss
                boss={game.boss}
                lastHitAt={game.boss.lastHitAt}
              />
            )}

            {game.bossIncoming && <BossIncomingMoment />}

            {!game.isPlaying && !game.gameOver && (
              <GameOverlay 
                type="start" 
                difficulty={difficulty}
                onStart={handleStartGame}
                onDifficultyChange={setDifficulty}
              />
            )}

            {game.gameOver && gameWon && (
              <GameOverlay type="victory" score={game.score} />
            )}

            {game.gameOver && !gameWon && (
              <GameOverlay 
                type="gameOver" 
                score={game.score}
                won={gameWon}
                bossDefeated={bossDefeated}
                conqueredThoughts={game.conqueredThoughts}
                onDismiss={() => setShowGameOverDialog(false)}
                onPlayAgain={handlePlayAgain}
                onBackToHub={handleBackToHub}
              />
            )}
            </GameArea>
          ) : null}
        </View>

      </View>

      <GameOverDialog
        visible={showGameOverDialog}
        score={finalScore}
        won={gameWon}
        bossDefeated={bossDefeated}
        conqueredThoughts={game.conqueredThoughts}
        onDismiss={() => setShowGameOverDialog(false)}
        onPlayAgain={handlePlayAgain}
        onBackToHub={handleBackToHub}
      />
    </View>
  )
}
