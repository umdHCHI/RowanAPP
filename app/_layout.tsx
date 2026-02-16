/* eslint-disable import/no-duplicates */
import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { setAudioModeAsync } from 'expo-audio'
import '../global.css'
import { colors } from '@/theme/design-tokens'
import { fontAssetMap } from '@/theme/fonts'
// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
})

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssetMap)

  // Configure audio mode on app start - this is critical for audio playback
  useEffect(() => {
    async function configureAudio() {
      await setAudioModeAsync({
        playsInSilentMode: true, // Allow audio to play even when device is in silent mode (iOS)
        allowsRecording: false, // We're not recording, so set to false
      })
    }
    configureAudio()
  }, [])

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen 
              name="character-creator" 
              options={{ 
                contentStyle: { backgroundColor: colors.archive.darker },
                animation: 'fade',
              }} 
            />
            <Stack.Screen name="hub" />
            <Stack.Screen name="story" />
            <Stack.Screen name="journal" />
            <Stack.Screen name="vantage" />
            <Stack.Screen name="about" />
            <Stack.Screen name="resources" />
            <Stack.Screen name="crisis-help" />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

