import React from 'react'
import { View, StyleSheet } from 'react-native'
import type { StoryCard } from '@/types/hub'

interface ProgressIndicatorProps {
  card: StoryCard
  isLast: boolean
}

export function ProgressIndicator({ card, isLast }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {/* Top line */}
      <View style={styles.line} />
      
      {/* Circle indicator */}
      <View style={styles.circle}>
        <View style={styles.circleInner} />
      </View>
      
      {/* Bottom line */}
      {!isLast && <View style={styles.line} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  line: {
    width: 1.5,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.27)',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  circleInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
})

