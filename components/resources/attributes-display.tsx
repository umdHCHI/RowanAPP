import React from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { useGameStore, type AttributeLevel } from '@/stores/game-store'

interface AttributeDisplayProps {
  showImages?: boolean
  attributes?: AttributeLevel
}

/**
 * Convert raw attribute value to level (1-5)
 * Divides by 5 and rounds, clamping to 1-5 range
 */


export function AttributesDisplay({ showImages = false, attributes: propsAttributes }: AttributeDisplayProps) {
  const { attributes: storeAttributes } = useGameStore()
  const attributes = propsAttributes ?? storeAttributes

  const connectionImages: Record<number, any> = {
    1: require('../../assets/attributes/connection/connectionLv1.png'),
    2: require('../../assets/attributes/connection/connectionLv2.png'),
    3: require('../../assets/attributes/connection/connectionLv3.png'),
    4: require('../../assets/attributes/connection/connectionLv4.png'),
    5: require('../../assets/attributes/connection/connectionLv5.png'),
  }

  const courageImages: Record<number, any> = {
    1: require('../../assets/attributes/courage/courageLv1.png'),
    2: require('../../assets/attributes/courage/courageLv2.png'),
    3: require('../../assets/attributes/courage/courageLv3.png'),
    4: require('../../assets/attributes/courage/courageLv4.png'),
    5: require('../../assets/attributes/courage/courageLv5.png'),
  }

  const explorationImages: Record<number, any> = {
    1: require('../../assets/attributes/exploration/explorationLv1.png'),
    2: require('../../assets/attributes/exploration/explorationLv2.png'),
    3: require('../../assets/attributes/exploration/explorationLv3.png'),
    4: require('../../assets/attributes/exploration/explorationLv4.png'),
    5: require('../../assets/attributes/exploration/explorationLv5.png'),
  }

  const fearImages: Record<number, any> = {
    1: require('../../assets/attributes/fear/fear1.png'),
    2: require('../../assets/attributes/fear/fearLv2.png'),
    3: require('../../assets/attributes/fear/fearLv3.png'),
    4: require('../../assets/attributes/fear/fearLv4.png'),
    5: require('../../assets/attributes/fear/fearLv5.png'),
  }

  const attributeConfig = [
    {
      key: 'connection' as const,
      label: 'Connection',
      images: connectionImages,
    },
    {
      key: 'courage' as const,
      label: 'Courage',
      images: courageImages,
    },
    {
      key: 'exploration' as const,
      label: 'Exploration',
      images: explorationImages,
    },
    {
      key: 'fear' as const,
      label: 'Fear',
      images: fearImages,
    },
  ]

  function renderAttributeBar(level: number, maxLevel: number = 5) {
    return (
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {Array.from({ length: maxLevel }).map((_, index) => {
          const isFilled = index < level
          const style = {
            flex: 1,
            height: 8,
            backgroundColor: isFilled
              ? '#D4A574'
              : 'rgba(0, 0, 0, 0.4)',
            borderRadius: 4,
          }
          return <View key={`bar-${index}`} style={style} />
        })}
      </View>
    )
  }

  return (
    <View style={{ paddingHorizontal: 24 }}>
      <Text style={styles.title}>
        Your Attributes
      </Text>
      {attributeConfig.map((attr) => {
        const level = attributes[attr.key]
        return (
          <View
            key={attr.key}
            style={styles.card}
          >
            <View style={styles.cardContent}>
              {showImages && attr.images[level] && (
                <Image
                  source={attr.images[level]}
                  style={{ width: 50, height: 50, marginRight: 12 }}
                  resizeMode="contain"
                />
              )}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.attributeLabel}>
                    {attr.label}
                  </Text>
                  <Text style={styles.attributeValue}>
                    {level}/5
                  </Text>
                </View>
                {renderAttributeBar(level)}
              </View>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontFamily: 'System',
    fontSize: 20,
    fontWeight: '500',
    color: '#F5E6D3',
    marginBottom: 20,
    letterSpacing: 0.5,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attributeLabel: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#F5E6D3',
    letterSpacing: 0.3,
  },
  attributeValue: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#D4A574',
    fontWeight: '500',
  },
})
