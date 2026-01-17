import { View, Text, Pressable, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import type { Difficulty } from '@/utils/vantage-constants'
import type { ConqueredThought } from '@/types/game'
import { GameOverDialog } from './GameOverDialog'

interface GameOverlayProps {
  type: 'start' | 'gameOver' | 'victory'
  score?: number
  difficulty?: Difficulty
  bossDefeated?: boolean
  won?: boolean
  conqueredThoughts?: ConqueredThought[]
  defeatedNegativeThoughts?: ConqueredThought[]
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
  defeatedNegativeThoughts = [],
  onStart,
  onDifficultyChange,
  onDismiss,
  onPlayAgain,
  onBackToHub,
}: GameOverlayProps) {
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()

  function handleStart() {
    playPageFlipSound()
    onStart?.()
  }

  function handleDifficultySelect(selectedDifficulty: Difficulty) {
    playPageFlipSound()
    onDifficultyChange?.(selectedDifficulty)
  }

  function handleClose() {
    haptics.lightImpact()
    playPageFlipSound()
    if (onDismiss) {
      onDismiss()
    } else if (onBackToHub) {
      onBackToHub()
    }
  }

  if (type === 'start') {
    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => {}} // Prevent back button from closing
      >
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="box-none">
          <View style={styles.card} pointerEvents="auto">
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.title}>Vantage</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <View style={styles.caption}>
            <Text style={styles.captionText}>
              Help regain control of The Archive and Seal the breach to calm your mind.
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
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleStart}
            >
              <Text style={styles.secondaryButtonText}>Start Game</Text>
            </Pressable>
          )}
        </View>
      </View>
      </Modal>
    )
  }

  function handlePlayAgain() {
    playPageFlipSound()
    onPlayAgain?.()
  }

  function handleBackToHub() {
    playPageFlipSound()
    onBackToHub?.()
  }

  if (type === 'victory') {
    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="box-none">
          <View style={styles.card} pointerEvents="auto">
            <Text style={styles.title}>Victory!</Text>
            <Text style={styles.subtitle}>You've sealed the breach.</Text>
            {score !== undefined && (
              <Text style={styles.scoreText}>Final Score: {score}</Text>
            )}
            {(conqueredThoughts.length > 0 || defeatedNegativeThoughts.length > 0) && (
              <View style={styles.archiveSection}>
                <Text style={styles.archiveTitle}>Archive Record</Text>
                
                {/* Positive thoughts (conquered/reframed) */}
                {conqueredThoughts.length > 0 && (
                  <>
                    <Text style={styles.thoughtCategoryTitle}>Reframed Thoughts</Text>
                    {conqueredThoughts.slice(0, 3).map((thought) => (
                      <View key={`positive-${thought.id}`} style={styles.thoughtRecord}>
                        <Text style={styles.thoughtPhrase}>"{thought.phrase}"</Text>
                        <Text style={styles.counterRecord}>{thought.counterRecord}</Text>
                      </View>
                    ))}
                  </>
                )}
                
                {/* Negative thoughts (defeated) */}
                {defeatedNegativeThoughts.length > 0 && (
                  <>
                    {conqueredThoughts.length > 0 && defeatedNegativeThoughts.length > 0 && (
                      <View style={styles.thoughtDivider} />
                    )}
                    <Text style={styles.thoughtCategoryTitle}>Defeated Thoughts</Text>
                    {defeatedNegativeThoughts.slice(0, 3).map((thought) => (
                      <View key={`negative-${thought.id}`} style={styles.thoughtRecord}>
                        <Text style={styles.thoughtPhrase}>"{thought.phrase}"</Text>
                        <Text style={styles.counterRecord}>{thought.counterRecord}</Text>
                      </View>
                    ))}
                  </>
                )}
              </View>
            )}
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleBackToHub}
              >
                <Text style={styles.secondaryButtonText}>Back to Archive</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePlayAgain}
              >
                  <Text style={styles.buttonText}>Play Again</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  return (
      <GameOverDialog 
        visible={true} 
        score={score || 0} 
        won={won} 
        bossDefeated={bossDefeated} 
        conqueredThoughts={conqueredThoughts} 
        defeatedNegativeThoughts={defeatedNegativeThoughts}
        onDismiss={onDismiss || (() => {})} 
        onPlayAgain={onPlayAgain || (() => {})} 
        onBackToHub={onBackToHub || (() => {})} 
      />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  headerSpacer: {
    width: 24,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'BeyondWonderland',
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.9,
  },
  scoreText: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginTop: 8,
  },
  caption: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 12,
    borderRadius: 24,
    marginBottom: 20,
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captionText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#ffffffaa',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  primaryButton: {
    borderColor: '#ffffff',
    backgroundColor: '#15111f',
  },
  secondaryButton: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: '#15111f',
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  difficultyLabel: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    marginBottom: 12,
  },
  difficultyButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  difficultyButtonActive: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  difficultyButtonPressed: {
    opacity: 0.7,
  },
  difficultyButtonText: {
    fontFamily: 'FontTitle-White',
    fontSize: 18,
    color: '#ffffffaa',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  difficultyButtonTextActive: {
    fontFamily: 'FontTitle-White',
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  archiveSection: {
    width: '100%',
    marginTop: 16,
    marginBottom: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  archiveTitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginBottom: 12,
  },
  thoughtRecord: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  thoughtPhrase: {
    fontFamily: 'VT323-Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 24,
    opacity: 0.9,
  },
  counterRecord: {
    fontFamily: 'System',
    fontSize: 13,
    color: '#ffffffaa',
    textAlign: 'center',
    lineHeight: 18,
  },
  thoughtCategoryTitle: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 3,
    color: '#ffffffcc',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  thoughtDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 12,
    marginHorizontal: 8,
  },
})
