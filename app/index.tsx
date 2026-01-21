import { View, Text, ImageBackground, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useCurrentUserFullProfile, useIsAuthenticated } from '@/api'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { useGameStore } from '@/stores/game-store'

export default function Index() {
  const router = useRouter()
  const isAuthenticated = useIsAuthenticated()
  const { data: profileData, isLoading: isLoadingProfile } = useCurrentUserFullProfile()
  const { character } = useGameStore()
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start()

    // Navigate based on auth state first
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/login')
        return
      }

      // If authenticated, route based on whether the user has a character yet
      const hasCharacter = !!profileData?.character
      router.replace(hasCharacter ? '/hub' : '/character-creator')
    }, 800)

    return () => clearTimeout(timer)
  }, [isAuthenticated, profileData?.character, router, fadeAnim])

  return (
    <ImageBackground
      source={require('../assets/UI/hauntedlibrary.png')}
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
          {isAuthenticated ? (isLoadingProfile ? 'Reading your file...' : 'Welcome back...') : 'Sign in to continue...'}
        </Text>
      </Animated.View>
    </ImageBackground>
  )
}
