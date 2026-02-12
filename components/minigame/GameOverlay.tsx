import { useMemo, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import type { Difficulty } from '@/utils/vantage-constants'
import type { ConqueredThought } from '@/types/game'
import { GameOverDialog } from './GameOverDialog'
import { Button, Text as UiText } from '@/components/ui'

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
  const [visible, setVisible] = useState(true)
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const insets = useSafeAreaInsets()
  const lumensAwarded = won && bossDefeated ? 1 : 0

  const conqueredKey = conqueredThoughts.map((c) => c.id).join(',')
  const defeatedKey = defeatedNegativeThoughts.map((t) => t.id).join(',')
  const oneReframed = useMemo(() => {
    if (conqueredThoughts.length === 0) return null
    return conqueredThoughts[Math.floor(Math.random() * conqueredThoughts.length)]
  }, [conqueredKey, conqueredThoughts])
  const oneDefeated = useMemo(() => {
    if (defeatedNegativeThoughts.length === 0) return null
    return defeatedNegativeThoughts[Math.floor(Math.random() * defeatedNegativeThoughts.length)]
  }, [defeatedKey, defeatedNegativeThoughts])

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
    setVisible(false)
    onDismiss?.()
    if (!onDismiss && onBackToHub) {
      onBackToHub()
    }
  }

  if (type === 'start') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
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
            <Button variant="primary" onPress={handleStart} fullWidth hapticType="light">
              <UiText variant="title" size={1} align="center">Start Game</UiText>
            </Button>
          )}
        </View>
      </View>
      </Modal>
    )
  }

  function handlePlayAgain() {
    playPageFlipSound()
    setVisible(false)
    onPlayAgain?.()
  }

  function handleBackToHub() {
    playPageFlipSound()
    setVisible(false)
    onBackToHub?.()
  }

  function handleGameOverDismiss() {
    playPageFlipSound()
    setVisible(false)
    onDismiss?.()
  }

  function handleGameOverPlayAgain() {
    playPageFlipSound()
    setVisible(false)
    onPlayAgain?.()
  }

  function handleGameOverBackToHub() {
    playPageFlipSound()
    setVisible(false)
    onBackToHub?.()
  }

  if (type === 'victory') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleBackToHub}
      >
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} pointerEvents="box-none">
          <View style={styles.card} pointerEvents="auto">
            <Text style={styles.title}>Victory!</Text>
            <Text style={styles.subtitle}>You've sealed the breach.</Text>
            {lumensAwarded > 0 ? (
              <Text style={styles.lumensText}>Lumens Gathered: {lumensAwarded}</Text>
            ) : (
              <Text style={styles.noLumensText}>No Lumens Gathered</Text>
            )}
            {(oneReframed || oneDefeated) && (
              <View style={styles.archiveSection}>
                <Text style={styles.archiveTitle}>Archive Record</Text>

                {oneReframed && (
                  <>
                    <Text style={styles.thoughtCategoryTitle}>Reframed Thoughts</Text>
                    <View style={styles.thoughtRecord}>
                      <Text style={styles.thoughtPhrase}>"{oneReframed.phrase}"</Text>
                      <Text style={styles.counterRecord}>{oneReframed.counterRecord}</Text>
                    </View>
                  </>
                )}

                {oneDefeated && (
                  <>
                    {oneReframed && oneDefeated && <View style={styles.thoughtDivider} />}
                    <Text style={styles.thoughtCategoryTitle}>Defeated Thoughts</Text>
                    <View style={styles.thoughtRecord}>
                      <Text style={styles.thoughtPhrase}>"{oneDefeated.phrase}"</Text>
                      <Text style={styles.counterRecord}>{oneDefeated.counterRecord}</Text>
                    </View>
                  </>
                )}
              </View>
            )}
            <View style={styles.buttonRow}>
              <View style={styles.buttonSlot}>
                <Button variant="secondary" size="small" onPress={handleBackToHub} fullWidth hapticType="light">
                  <UiText variant="title" size={1} align="center">Back to Archive</UiText>
                </Button>
              </View>
              <View style={styles.buttonSlot}>
                <Button variant="primary" size="small" onPress={handlePlayAgain} fullWidth hapticType="light">
                  <UiText variant="title" size={1} align="center">Play Again</UiText>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  // Game over: use same pattern as start/victory—overlay owns visible, dialog receives it.
  // Back button and action buttons set visible false then invoke parent callbacks.
  return (
    <GameOverDialog
      visible={visible}
      score={score ?? 0}
      won={won}
      bossDefeated={bossDefeated}
      lumensAwarded={lumensAwarded}
      conqueredThoughts={conqueredThoughts}
      defeatedNegativeThoughts={defeatedNegativeThoughts}
      onDismiss={handleGameOverDismiss}
      onPlayAgain={handleGameOverPlayAgain}
      onBackToHub={handleGameOverBackToHub}
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
  lumensText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFD700',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  noLumensText: {
    fontFamily: 'BeyondWonderland',
    fontSize: 18,
    color: '#ffffffcc',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
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
    justifyContent: 'center',
  },
  buttonSlot: {
    flex: 1,
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
