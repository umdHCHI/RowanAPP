import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import type { StoryCard } from '@/types/hub'
import { useHaptics } from '@/utils/useHaptics'
import { usePageFlipSound } from '@/utils/usePageFlipSound'

interface HubPaginationProps {
  cards: StoryCard[]
  activeIndex: number
  onDotPress: (index: number) => void
}

export function HubPagination({ cards, activeIndex, onDotPress }: HubPaginationProps) {
  const haptics = useHaptics()
  const playPageFlipSound = usePageFlipSound()

  function handleDotPress(index: number) {
    haptics.selection()
    playPageFlipSound()
    onDotPress(index)
  }

  return (
    <View style={styles.paginationContainer}>
      {cards.map((card, index) => {
        const isActive = index === activeIndex
        return (
          <TouchableOpacity
            key={card.id}
            onPress={() => handleDotPress(index)}
          >
            <View
              style={[
                styles.paginationDot,
                isActive && styles.paginationDotActive
              ]}
            />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff66',
  },
  paginationDotActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
})

