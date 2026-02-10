import React from 'react'
import { View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard } from '@/types/hub'

interface ProgressIndicatorProps {
  card: StoryCard
  showBottomLine?: boolean
}

export function ProgressIndicator({ card, showBottomLine = true }: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      {/* Top line */}
      <View style={styles.line} />
      
      {/* Arrow indicator */}
      <View style={styles.arrowWrap}>
        <MaterialCommunityIcons name="arrow-down" size={20} color="#ffffff" />
      </View>
      
      {/* Bottom line */}
      {showBottomLine && <View style={styles.line} />}
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
  arrowWrap: {
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
})

