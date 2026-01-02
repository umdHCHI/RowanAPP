import { View, Text, Pressable, StyleSheet } from 'react-native'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import type { Difficulty } from '@/utils/thought-defender-constants'
import type { ConqueredThought } from '@/types/game'
import { GameOverDialog } from './GameOverDialog'

interface GameOverlayProps {
  type: 'start' | 'gameOver' | 'victory'
  score?: number
  difficulty?: Difficulty
  bossDefeated?: boolean
  won?: boolean
  conqueredThoughts?: ConqueredThought[]
  onStart?: () => void
  onDifficultyChange?: (difficulty: Difficulty) => void
  onDismiss?: () => void
  onPlayAgain?: () => void
  onBackToHub?: () => void
}

export function GameOverlay({ 
  type, 
  score, 
  difficulty = 'normal',
  bossDefeated = false,
  won = false,
  conqueredThoughts = [],
  onStart,
  onDifficultyChange,
  onDismiss,
  onPlayAgain,
  onBackToHub,
}: GameOverlayProps) {
  const playPageFlipSound = usePageFlipSound()

  function handleStart() {
    playPageFlipSound()
    onStart?.()
  }

  function handleDifficultySelect(selectedDifficulty: Difficulty) {
    playPageFlipSound()
    onDifficultyChange?.(selectedDifficulty)
  }

  if (type === 'start') {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.card} pointerEvents="auto">
          <Text style={styles.title}>Thought Defender</Text>
          <View style={styles.caption}>
            <Text style={styles.captionText}>
              Reframe negative thoughts by shooting them with positive energy!
            </Text>
          </View>
          
          {/* Difficulty Selection */}
          {onDifficultyChange && (
            <View style={styles.difficultyContainer}>
              <Text style={styles.difficultyLabel}>Difficulty</Text>
              <View style={styles.difficultyButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.difficultyButton,
                    difficulty === 'easy' && styles.difficultyButtonActive,
                    pressed && styles.difficultyButtonPressed,
                  ]}
                  onPress={() => handleDifficultySelect('easy')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    difficulty === 'easy' && styles.difficultyButtonTextActive,
                  ]}>
                    Easy
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.difficultyButton,
                    difficulty === 'normal' && styles.difficultyButtonActive,
                    pressed && styles.difficultyButtonPressed,
                  ]}
                  onPress={() => handleDifficultySelect('normal')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    difficulty === 'normal' && styles.difficultyButtonTextActive,
                  ]}>
                    Normal
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.difficultyButton,
                    difficulty === 'hard' && styles.difficultyButtonActive,
                    pressed && styles.difficultyButtonPressed,
                  ]}
                  onPress={() => handleDifficultySelect('hard')}
                >
                  <Text style={[
                    styles.difficultyButtonText,
                    difficulty === 'hard' && styles.difficultyButtonTextActive,
                  ]}>
                    Hard
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
          
          {onStart && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleStart}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </Pressable>
          )}
        </View>
      </View>
    )
  }

  if (type === 'victory') {
    return (
      <View style={styles.container} pointerEvents="box-none">
        <View style={styles.card} pointerEvents="auto">
          <Text style={styles.title}>Victory!</Text>
          <Text style={styles.subtitle}>You've sealed the breach.</Text>
          {score !== undefined && (
            <Text style={styles.scoreText}>Final Score: {score}</Text>
        )}
        </View>
      </View>
    )
  }

  return (
    <GameOverDialog 
      visible={true} 
      score={score || 0} 
      won={won} 
      bossDefeated={bossDefeated} 
      conqueredThoughts={conqueredThoughts} 
      onDismiss={onDismiss || (() => {})} 
      onPlayAgain={onPlayAgain || (() => {})} 
      onBackToHub={onBackToHub || (() => {})} 
    />
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    elevation: 1000, // Android z-index
  },
  card: {
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    padding: 24,
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  scoreText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 20,
    color: 'rgba(212, 175, 55, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  caption: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 20,
    maxWidth: 280,
  },
  captionText: {
    fontFamily: 'CrimsonPro-Medium-Italic',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.92)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButton: {
    borderColor: 'rgba(212, 175, 55, 0.6)',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: 'rgba(212, 175, 55, 0.9)',
    fontWeight: '600',
  },
  difficultyContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  difficultyLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    fontWeight: '600',
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    minWidth: 70,
  },
  difficultyButtonActive: {
    borderColor: 'rgba(212, 175, 55, 0.8)',
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  difficultyButtonPressed: {
    opacity: 0.7,
  },
  difficultyButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  difficultyButtonTextActive: {
    color: 'rgba(212, 175, 55, 0.95)',
  },
})
