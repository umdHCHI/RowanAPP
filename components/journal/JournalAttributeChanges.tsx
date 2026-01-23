import { View, Image, Text, StyleSheet } from 'react-native'

import { useGameStore } from '@/stores/game-store'



export function JournalAttributeChanges() {
  const lumens = useGameStore((state) => state.lumens.lumens)
  // Show the reward amount (1 lumen) rather than total
  // The total will update after query invalidation, but we want to show the reward immediately
  return (
    <View style={styles.attributeChangesContainer}>
      <Text style={styles.attributeChangeText}>+1 Lumens</Text>
      <Text style={styles.attributeChangeText}>Total {lumens} helping you seal the Void</Text>
      
    </View>
  )
}

const styles = StyleSheet.create({
  attributeChangesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  attributeChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#15111f',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attributeChangeIcon: {
    width: 20,
    height: 20,
  },
  attributeChangeText: {
    fontFamily: 'FontTitle-White',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#ffffff',
  },
})

