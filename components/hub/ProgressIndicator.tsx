import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard } from '@/types/hub'

interface ProgressIndicatorProps {
  card: StoryCard
  isLast: boolean
}

export function ProgressIndicator({ card, isLast }: ProgressIndicatorProps) {
  const isLocked = card.status === 'locked'
  
  return (
    <View style={styles.progressContainer}>
      {/* Top line */}
      <View style={styles.progressLine} />
      
      {/* Circle or Lock indicator */}
      <View style={[
        styles.progressIndicator,
        isLocked && styles.progressIndicatorLocked
      ]}>
        {isLocked ? (
          <MaterialCommunityIcons name="lock" size={14} color="#ffffff88" />
        ) : (
          <View style={styles.progressIndicatorInner} />
        )}
      </View>
      
      {/* Bottom line */}
      {!isLast && <View style={styles.progressLine} />}
    </View>
  )
}

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressLine: {
    width: 1.5,
    height: 40,
    backgroundColor: '#ffffff44',
  },
  progressIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#ffffff66',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  progressIndicatorLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  progressIndicatorInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
})

