import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useGameStore } from '@/stores/game-store'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { useHaptics } from '@/utils/useHaptics'
import { getTextSpeedLabel, getTextSpeedIcon } from '@/utils/story-speed'
import { STORY_COLORS, STORY_SPACING, STORY_FONT_SIZES, STORY_LAYOUT } from './story-theme'

interface StoryHeaderProps {
  isPaused: boolean
  onTogglePause: () => void
}

export function StoryHeader({ isPaused, onTogglePause }: StoryHeaderProps) {
  const router = useRouter()
  const playPageFlipSound = usePageFlipSound()
  const haptics = useHaptics()
  const { soundMuted, toggleSoundMute, textSpeed, cycleTextSpeed } = useGameStore()

  const speedLabel = getTextSpeedLabel(textSpeed)
  const speedIconName = getTextSpeedIcon(textSpeed)

  function handleClose() {
    haptics.mediumImpact()
    playPageFlipSound()
    router.push('/hub')
  }

  function handleSoundToggle() {
    haptics.lightImpact()
    toggleSoundMute()
    playPageFlipSound()
  }

  function handleSpeedToggle() {
    haptics.lightImpact()
    cycleTextSpeed()
    playPageFlipSound()
  }

  function handlePauseToggle() {
    haptics.lightImpact()
    onTogglePause()
    playPageFlipSound()
  }

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.headerButton}
        onPress={handleClose}
      >
        <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.controlsGroup}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handlePauseToggle}
        >
          <MaterialCommunityIcons 
            name={isPaused ? 'play' : 'pause'} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, styles.speedButton]}
          onPress={handleSpeedToggle}
        >
          <MaterialCommunityIcons 
            name={speedIconName as any}
            size={24}
            color={STORY_COLORS.text}
          />
          <Text style={styles.speedLabel}>{speedLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleSoundToggle}
        >
          <MaterialCommunityIcons 
            name={soundMuted ? 'volume-off' : 'volume-high'} 
            size={24} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </View>
      {/* Bottom divider */}
      <View style={styles.divider} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: STORY_LAYOUT.headerTop,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: STORY_SPACING.xl,
    paddingBottom: STORY_SPACING.md,
    zIndex: STORY_LAYOUT.headerZIndex,
  },
  headerButton: {
    width: STORY_LAYOUT.headerButtonSize,
    height: STORY_LAYOUT.headerButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedButton: {
    marginRight: STORY_SPACING.md,
  },
  speedLabel: {
    position: 'absolute',
    bottom: -STORY_SPACING.md,
    fontSize: STORY_FONT_SIZES.xs,
    color: STORY_COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: STORY_SPACING.xl,
    right: STORY_SPACING.xl,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
})

