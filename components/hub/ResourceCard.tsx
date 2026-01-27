import React from 'react'
import { ImageBackground, Dimensions, Pressable as RNPressable, View, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import type { StoryCard } from '@/types/hub'
import { usePageFlipSound } from '@/utils/usePageFlipSound'
import { Text } from '@/components/ui'

const { height } = Dimensions.get('window')

interface ResourceCardProps {
  card: StoryCard
  onPress: () => void
}

export function ResourceCard({ card, onPress }: ResourceCardProps) {
  const playPageFlipSound = usePageFlipSound()

  function handlePress() {
    playPageFlipSound()
    onPress()
  }

  return (
    <View style={styles.wrapper}>
      <RNPressable onPress={handlePress} style={styles.pressable}>
        <View style={styles.container}>
          <ImageBackground
            source={require('../../assets/UI/cards/libraryResource.jpg')}
            style={styles.imageBackground}
            resizeMode="cover"
            imageStyle={styles.imageStyle}
          >
            <View style={styles.overlay} />
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.labelContainer}>
                  <Text variant="label" numberOfLines={1}>
                    {card.label}
                  </Text>
                </View>
                <MaterialCommunityIcons 
                  name="arrow-right" 
                  size={24} 
                  color="#ffffffcc"
                />
              </View>
              <Text variant="heading" size={2} >
                {`${card.label} Resources`}
              </Text>
              <Text variant="body" size={2} >
                View attributes and equipment
              </Text>
            </View>
          </ImageBackground>
        </View>
      </RNPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#161622',
  },
  container: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
    gap: 2,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressable: {
    flex: 1,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  imageStyle: {
    opacity: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
})
