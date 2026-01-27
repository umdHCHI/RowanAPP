import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { useVantageGame, useGameDirector } from '@/hooks'
import { GAME_CONFIG, type Difficulty } from '@/utils/vantage-constants'
import { useAwardExperience, useRequireAuth } from '@/api'
import {
  GameArea,
  GamePlayer,
  GameProjectile,
  GameEnemyProjectile,
  GameNegativeThought,
  GameFragment,
  GamePowerUp,
  GameBoss,
  GameOverlay,
  BossIncomingMoment,
  DebugHitboxes,
  DebugHUD,
} from '@/components/minigame'

export default function Vantage() {
  useRequireAuth() // Redirects to login if not authenticated
  
  const router = useRouter()
  const params = useLocalSearchParams<{ storyId?: string; tutorial?: string }>()
  const storyId = params.storyId
  const isTutorial = params.tutorial === 'true'
  const { addMemory, character, updateLumen } = useGameStore()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()
  const awardExperience = useAwardExperience()
  const { width: screenWidth, height: screenHeight } = useWindowDimensions()
  const [gameWon, setGameWon] = useState(false)
  const [bossDefeated, setBossDefeated] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal')
  const gameStartTimeRef = useRef<number>(0)
  const ddaMetricsRef = useRef<{ formationTickMultiplier: number; moveSpeed: number; powerUpChance: number; pressureScore: number } | undefined>(undefined) as React.MutableRefObject<{ formationTickMultiplier: number; moveSpeed: number; powerUpChance: number; pressureScore: number } | undefined>
  
  // Use onLayout to measure actual playfield bounds (full screen)
  const [gameBounds, setGameBounds] = useState<{ width: number; height: number } | null>(null)
  const prevBoundsRef = useRef<{ width: number; height: number } | null>(null)
  
  // Use screen dimensions initially, then update when layout is measured
  // Ensure we always have valid dimensions (at least 100x100)
  const gameWidth = gameBounds?.width ?? Math.max(100, Math.round(screenWidth))
  const gameHeight = gameBounds?.height ?? Math.max(100, Math.round(screenHeight))
  
  // Guard onLayout to prevent infinite update loops
  // Only update state when dimensions actually change by >= 2 pixels
  const handleGameAreaLayout = useCallback((event: any) => {
    const rawW = event.nativeEvent.layout.width
    const rawH = event.nativeEvent.layout.height
  
    // Round to prevent fractional jitter
    const width = Math.round(rawW)
    const height = Math.round(rawH)
  
    const prev = prevBoundsRef.current
  
    // Only update once (when prev is null) OR when width/height changed by >= 2 pixels
    if (!prev) {
      prevBoundsRef.current = { width, height }
      setGameBounds({ width, height })
    } else {
      const widthDiff = Math.abs(width - prev.width)
      const heightDiff = Math.abs(height - prev.height)
      if (widthDiff >= 2 || heightDiff >= 2) {
        prevBoundsRef.current = { width, height }
        setGameBounds({ width, height })
      }
    }
  }, [])



  const game = useVantageGame({
    gameWidth,
    gameHeight,
    difficulty,
    ddaMetricsRef,
    onGameOver: (score, won, bossDef) => {
      setGameWon(won)
      setBossDefeated(bossDef)
      
      const durationSec = Math.floor(
        (performance.now() - gameStartTimeRef.current) / 1000
      )

      // Defer memory save and attribute updates to avoid state update during render
      setTimeout(async () => {
        // Save memory
        const memory = {
          id: `vantage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        
        // Award 1 lumen for completing the mini game
        try {
          await awardExperience.mutateAsync(1)
        } catch (error) {
          // Log error but don't block the game completion
          console.error('Failed to award experience:', error)
        }
        
        // Reward based on score
        if (score >= 200) {
          updateLumen('lumens', 1)
        }
        if (score >= 100) {
          updateLumen('lumens', 1)
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

  // Dynamic Difficulty Adjustment (must be after game hook to access game state)
  const ddaMetrics = useGameDirector({
    isPlaying: game.isPlaying,
    playerLastHitAt: game.playerLastHitAt,
    projectilesSpawned: game.projectilesSpawned,
    thoughtsDestroyed: game.thoughtsDestroyed,
    gameStartTime: game.gameStartTime,
    lastShotAt: game.lastShotAt,
    lastEnemyDestroyedAt: game.lastEnemyDestroyedAt,
  })

  // Update DDA metrics ref so game hook can access them
  useEffect(() => {
    if (game.isPlaying) {
      ddaMetricsRef.current = {
        formationTickMultiplier: ddaMetrics.formationTickMultiplier,
        moveSpeed: ddaMetrics.moveSpeed,
        powerUpChance: ddaMetrics.powerUpChance,
        pressureScore: ddaMetrics.pressureScore, // For fragment wellness probability
      }
    } else {
      ddaMetricsRef.current = undefined
    }
  }, [game.isPlaying, ddaMetrics.formationTickMultiplier, ddaMetrics.moveSpeed, ddaMetrics.powerUpChance, ddaMetrics.pressureScore])
  
  const handlePlayerMove = useCallback((x: number) => {
    game.setPlayerXFromInput(x)
  }, [game])

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
    handleStartGame()
  }

  function handleBackToHub() {
    router.replace('/hub')
  }

  function handleBackToResources() {
    playPageFlipSound()
    const resourcesUrl = storyId ? `/resources?storyId=${storyId}` : '/resources'
    router.push(resourcesUrl)
  }


  return (
    <View
      className="flex-1 bg-archive-dark"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Compact HUD overlay at top - Only show when playing */}
      {(game.isPlaying || game.gameOver) && (
        <View style={[styles.hud, { top: insets.top + 8 }]} pointerEvents="none">
          <Text style={styles.hudText}>Score: {game.score}</Text>
          <Text style={styles.hudText}>Lives: {game.lives}</Text>
          {game.wave > 0 && (
            <Text style={[styles.hudText, styles.hudWave]}>Wave: {game.wave}</Text>
          )}
        </View>
      )}

      {/* Game Area - Full screen */}
      {game.isPlaying || game.gameOver ? (
        <View 
          className="flex-1" 
          onLayout={handleGameAreaLayout}
        >
          {gameWidth > 0 && gameHeight > 0 ? (
            <GameArea
              width={gameWidth}
              height={gameHeight}
                onPlayerMove={game.isPlaying && !game.gameOver ? handlePlayerMove : undefined}
                onShoot={game.isPlaying && !game.gameOver ? handleShootWithHaptics : undefined}
                playerLastHitAt={game.playerLastHitAt}
                isTutorial={isTutorial && game.isPlaying}
              >
              {game.debugHitboxes && (
                <>
                  <DebugHitboxes
                    playerX={game.playerX}
                    playerY={game.playerY}
                    projectiles={game.projectiles}
                    negativeThoughts={game.negativeThoughts}
                    powerUps={game.powerUps}
                  />
                  <DebugHUD
                    stressSignal={ddaMetrics.pressureScore}
                    emotionalIntensity={ddaMetrics.emotionalIntensity}
                    wave={game.wave}
                    visible={game.debugHitboxes}
                  />
                </>
              )}
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
              {game.fragments?.map((fragment) => (
                <GameFragment
                  key={fragment.id}
                  fragment={fragment}
                  onTap={game.handleFragmentTap}
                  gameHeight={gameHeight}
                  gameWidth={gameWidth}
                />
              ))}
              <GamePlayer x={game.playerX} y={game.playerY} shieldActive={game.shieldActive} />


              {game.boss && (
                <GameBoss
                  boss={game.boss}
                  lastHitAt={game.boss.lastHitAt}
                  telegraphActive={game.bossTelegraphActive}
                  telegraphLabel={game.bossTelegraphLabel}
                  difficultyLevel={ddaMetrics.difficultyLevel}
                />
              )}

              {game.bossIncoming && <BossIncomingMoment />}
              </GameArea>
            ) : null}
        </View>
      ) : null}

      {/* Start Screen Overlay - Outside GameArea to ensure it's always visible */}
      {!game.isPlaying && !game.gameOver && (
        <GameOverlay 
          type="start" 
          difficulty={difficulty}
          onStart={handleStartGame}
          onDifficultyChange={setDifficulty}
          onDismiss={handleBackToResources}
        />
      )}

      {/* Victory Overlay */}
      {game.gameOver && gameWon && (
        <GameOverlay 
          type="victory" 
          score={game.score}
          conqueredThoughts={game.conqueredThoughts || []}
          defeatedNegativeThoughts={game.defeatedNegativeThoughts || []}
          onPlayAgain={handlePlayAgain}
          onBackToHub={handleBackToHub}
        />
      )}

      {/* Game Over Overlay - This internally renders GameOverDialog, so we don't need a separate one */}
      {game.gameOver && !gameWon && (
        <GameOverlay 
          type="gameOver" 
          score={game.score}
          won={gameWon}
          bossDefeated={bossDefeated}
          conqueredThoughts={game.conqueredThoughts || []}
          defeatedNegativeThoughts={game.defeatedNegativeThoughts || []}
          onDismiss={() => {}}
          onPlayAgain={handlePlayAgain}
          onBackToHub={handleBackToHub}
        />
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  hudText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.92)',
    fontWeight: '600',
  },
  hudWave: {
    color: 'rgba(212, 175, 55, 0.9)',
  },
})
