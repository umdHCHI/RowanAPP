import { View, Text, ImageBackground, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/game-store'
import { CharacterAvatar } from '@/components/CharacterAvatar'

export default function Index() {
  const router = useRouter()
  const { hasCreatedCharacter, character } = useGameStore()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start()

    // Navigate based on game state
    const timer = setTimeout(() => {
      if (hasCreatedCharacter) {
        router.replace('/hub')
      } else {
        router.replace('/character-creator')
      }
    }, 2500)

    return () => clearTimeout(timer)
  }, [hasCreatedCharacter, router, fadeAnim])

  return (
    <ImageBackground
      source={require('../hauntedlibrary.png')}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)' }} />
      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#C4B5FD', marginBottom: 16, letterSpacing: 2 }}>
          The Archive
        </Text>
        {character?.avatar && (
          <View style={{ marginBottom: 16 }}>
            <CharacterAvatar avatarConfig={character.avatar} size={120} />
          </View>
        )}
        <Text style={{ fontSize: 18, color: 'rgba(196, 181, 253, 0.7)', fontStyle: 'italic' }}>
          Your journey begins in the void...
        </Text>
      </Animated.View>
    </ImageBackground>
  )
}
