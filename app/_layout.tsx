import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../src/context/AuthContext';
import { MasterStateProvider } from '../src/context/MasterStateContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <MasterStateProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(character)" />
              <Stack.Screen name="(personality)" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="settings" />
            </Stack>
          </MasterStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}