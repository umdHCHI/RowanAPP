import { View, Text, ImageBackground, Animated } from 'react-native'
import { useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { CharacterAvatar } from '@/components/character/CharacterAvatar'
import { getDefaultSplashAvatarConfig } from '@/utils/character-avatar-config'

/**
 * Splash / loading screen. Shown briefly on app load, then always navigates to Login.
 * Uses a default avatar with a random assets per load.
 * First screen after splash is Login → Character Creator (handled by useLogin).
 */
export default function Index() {
  const router = useRouter()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const [defaultAvatarConfig] = useState(() => getDefaultSplashAvatarConfig())

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start()

    const timer = setTimeout(() => {
      router.replace('/login')
    }, 1200)

    return () => clearTimeout(timer)
  }, [router, fadeAnim])

  return (
    <View className="splashScreenContainer">
    <ImageBackground
      source={require('../assets/UI/hauntedlibrary.png')}
      resizeMode="cover"
      className="backgroundImage"
    >
      <Animated.View
        className="splashScreenTextContainer"
        style={{ opacity: fadeAnim }}
      >
        <Text className="splashScreenTextTitle">
          The Archive
        </Text>
        <View className="splashScreenTextAvatar">
          <CharacterAvatar avatarConfig={defaultAvatarConfig} size={120} />
        </View>
        <Text className="splashScreenTextSubtitle">
          Loading...
        </Text>
      </Animated.View>
    </ImageBackground>
    </View>
    )
}
