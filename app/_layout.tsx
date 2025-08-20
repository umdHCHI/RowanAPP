import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/context/AuthContext';
import { MasterStateProvider } from '../src/context/MasterStateContext';
import { PersonalityProvider } from '../src/context/PersonalityContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
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