import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { MasterStateProvider } from '../src/context/MasterStateContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MasterStateProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(character)/character" />
            <Stack.Screen name="(personality)/personality" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
          </Stack>
        </MasterStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}