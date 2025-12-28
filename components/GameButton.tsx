import { useState } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import * as Haptics from 'expo-haptics'

interface GameButtonProps {
  normalImage: any
  selectedImage: any
  pressedImage: any
  label: string
  onPress: () => void
  width?: number
  height?: number
}

export function GameButton({
  normalImage,
  selectedImage,
  label,
  onPress,
  width = 200,
  height = 60,
}: GameButtonProps) {
  const [isSelected, setIsSelected] = useState(false)

  function handlePress() {
    setIsSelected(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  function handlePressIn() {
    setIsSelected(true)
  }

  function handlePressOut() {
    setIsSelected(false)
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.container, { width, height }]}>
        <Image
          source={isSelected ? selectedImage : normalImage}
          style={[styles.image, { width, height }]}
          resizeMode="stretch"
        />
        <View style={styles.textContainer}>
          <Text style={styles.text}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontFamily: 'FontTitle-White',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
})

