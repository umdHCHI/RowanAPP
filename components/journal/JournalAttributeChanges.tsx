import { View, Image, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { attributeImages } from '@/utils/attribute-images'
import type { AttributeLevel } from '@/stores/game-store'
import type { JournalContent } from '@/types/journal'

interface JournalAttributeChangesProps {
  changes?: JournalContent['attributeChanges']
  attributes: AttributeLevel
}

export function JournalAttributeChanges({ changes, attributes }: JournalAttributeChangesProps) {
  if (!changes) return null

  const attributeConfig = [
    { key: 'connection' as const, images: attributeImages.connection },
    { key: 'courage' as const, images: attributeImages.courage },
    { key: 'exploration' as const, images: attributeImages.exploration },
    { key: 'fear' as const, images: attributeImages.fear },
  ]

  return (
    <View style={styles.attributeChangesContainer}>
      {attributeConfig.map((attr) => {
        const change = changes[attr.key]
        if (change === undefined || change === 0) return null
        
        const currentLevel = attributes[attr.key]
        const displayLevel = Math.max(1, Math.min(5, currentLevel))
        const imageSource = attr.images[displayLevel as keyof typeof attributeImages.connection]
        const sign = change > 0 ? '+' : ''
        
        return (
          <View key={attr.key} style={styles.attributeChangeItem}>
            <Image
              source={imageSource}
              style={styles.attributeChangeIcon}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.attributeChangeText,
                { color: change > 0 ? '#4CAF50' : '#F44336' },
              ]}
            >
              {sign}{change}
            </Text>
          </View>
        )
      })}
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
  },
  attributeChangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attributeChangeIcon: {
    width: 20,
    height: 20,
  },
  attributeChangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
})

