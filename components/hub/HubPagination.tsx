import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import type { StoryCard } from '@/types/hub/hub'
import { useHaptics } from '@/utils/useHaptics'

interface HubPaginationProps {
  cards: StoryCard[]
  activeIndex: number
  onDotPress: (index: number) => void
}

export function HubPagination({ cards, activeIndex, onDotPress }: HubPaginationProps) {
  const haptics = useHaptics()

  function handleDotPress(index: number) {
    haptics.selection()
    onDotPress(index)
  }

  return (
    <View style={styles.container}>
      {cards.map((card, index) => {
        const isActive = index === activeIndex
        return (
          <Pressable
            key={index}
            onPress={() => handleDotPress(index)}
            style={[
              styles.dot,
              isActive && styles.dotActive,
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
})
