import { Stack } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import { MasterStateProvider } from '../src/context/MasterStateContext';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <MasterStateProvider>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(character)" />
              <Stack.Screen name="(personality)" />
              <Stack.Screen name="profile" />
              <Stack.Screen name="settings" />
            </Stack>
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </MasterStateProvider>
  );
}