import React from 'react'
import { View, StyleSheet, ImageBackground } from 'react-native'

interface StoryBackgroundProps {
  isEnding?: boolean
  isIntroduction?: boolean
  storyId?: string | number
}

export function StoryBackground({ isEnding = false, isIntroduction = false, storyId }: StoryBackgroundProps) {
  return (
    <ImageBackground
      source={require('../../assets/UI/hauntedlibrary.png')}
      style={styles.backgroundContainer}
      resizeMode="cover"
    >
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
})
