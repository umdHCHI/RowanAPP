import React from 'react'
import { View, Image } from 'react-native'
import { useGameStore, type AttributeLevel } from '@/stores/game-store'
import { Card, Text, useTheme } from 'react-native-paper'

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
  const theme = useTheme()

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
              ? theme.colors.primary
              : theme.colors.surfaceVariant,
            borderRadius: 4,
          }
          // @ts-expect-error - key is a valid React prop but TypeScript doesn't recognize it on View
          return <View key={`bar-${index}`} style={style} />
        })}
      </View>
    )
  }

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
      <Text
        variant="titleLarge"
        style={{
          color: theme.colors.onSurface,
          marginBottom: 20,
          letterSpacing: 0.5,
          paddingHorizontal: 8,
        }}
      >
        Your Attributes
      </Text>
      {attributeConfig.map((attr) => {
        const level = attributes[attr.key]
        return (
          // @ts-expect-error - children (Card.Content) are present but TypeScript checks props before seeing JSX children
          <Card
            key={attr.key}
            style={{
              backgroundColor: theme.colors.surface,
              marginBottom: 16,
            }}
          >
            {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
            <Card.Content style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
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
                  {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: theme.colors.onSurface,
                      letterSpacing: 0.3,
                    }}
                  >
                    {attr.label}
                  </Text>
                  {/* @ts-expect-error - children are present but TypeScript checks props before seeing JSX children */}
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '500',
                    }}
                  >
                    {level}/5
                  </Text>
                </View>
                {renderAttributeBar(level)}
              </View>
            </Card.Content>
          </Card>
        )
      })}
    </View>
  )
}
