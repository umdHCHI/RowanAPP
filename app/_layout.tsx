import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PaperProvider } from 'react-native-paper'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'
import { setAudioModeAsync } from 'expo-audio'
import { archiveTheme } from '../theme/paper-theme'
import '../global.css'

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
  const [fontsLoaded, fontError] = useFonts({
    'BeyondWonderland': require('../assets/fonts/BeyondWonderland.ttf'),
    'CrimsonPro-Medium-Italic': require('../assets/fonts/CrimsonPro-Medium-Italic.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'FontTitle-White': require('../assets/fonts/manaspc.ttf'),
    'FontText-Gold': require('../assets/fonts/manaspc.ttf'),
    'VT323-Regular': require('../assets/fonts/VT323-Regular.ttf'),
  })

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
        <PaperProvider theme={archiveTheme}>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen 
                name="character-creator" 
                options={{ 
                  contentStyle: { backgroundColor: '#000000' },
                  animation: 'fade',
                }} 
              />
              <Stack.Screen name="hub" />
              <Stack.Screen name="story" />
              <Stack.Screen name="journal" />
              <Stack.Screen name="vantage" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="about" />
              <Stack.Screen name="resources" />
              <Stack.Screen name="story-overview" />
              <Stack.Screen name="crisis-help" />
              <Stack.Screen name="api-test" />
            </Stack>
          </SafeAreaProvider>
        </PaperProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}

