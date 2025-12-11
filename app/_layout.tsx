import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/components/auth/context/AuthContext';
import { MasterStateProvider } from '../src/context/MasterStateContext';
import { PersonalityProvider } from '../src/context/PersonalityContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    // Global handler for unhandled promise rejections
    // Suppresses the "Unable to activate keep awake" error from expo-keep-awake
    const handler = (event: PromiseRejectionEvent) => {
      const errorMessage = event?.reason?.message || '';
      if (errorMessage.includes('keep awake') || errorMessage.includes('KeepAwake')) {
        // Suppress expo-keep-awake errors (these are non-critical)
        event.preventDefault();
        console.log('[RootLayout] Suppressed keep-awake error:', errorMessage);
        return;
      }
    };

    // For web only - check both window exists AND addEventListener is available
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('unhandledrejection', handler as any);
      return () => window.removeEventListener('unhandledrejection', handler as any);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MasterStateProvider>
            <PersonalityProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(character)" />
                <Stack.Screen name="(personality)" />
              </Stack>
            </PersonalityProvider>
          </MasterStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}