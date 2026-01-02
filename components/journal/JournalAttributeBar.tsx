import { View, Image, StyleSheet } from 'react-native'
import { Text } from 'react-native-paper'
import { attributeImages } from '@/utils/attribute-images'
import type { AttributeLevel } from '@/stores/game-store'

interface JournalAttributeBarProps {
  attributes: AttributeLevel
}

export function JournalAttributeBar({ attributes }: JournalAttributeBarProps) {
  const attributeConfig = [
    { key: 'connection' as const, label: 'Connection' },
    { key: 'courage' as const, label: 'Courage' },
    { key: 'exploration' as const, label: 'Exploration' },
    { key: 'fear' as const, label: 'Fear' },
  ]

  return (
    <View style={styles.attributeBar}>
      {attributeConfig.map((attr) => {
        const level = attributes[attr.key]
        const imageSource = attributeImages[attr.key][level as keyof typeof attributeImages.connection]
        return (
          <View key={attr.key} style={styles.attributeItem}>
            <Image
              source={imageSource}
              style={styles.attributeIcon}
              resizeMode="contain"
            />
            <Text style={styles.attributeValue}>{level}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  attributeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 60,
  },
  attributeItem: {
    alignItems: 'center',
    gap: 4,
  },
  attributeIcon: {
    width: 32,
    height: 32,
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5E6D3',
  },
})

