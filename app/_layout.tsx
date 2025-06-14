import { Stack , Slot} from 'expo-router';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '../src/context/OnboardingContext';
import { ThemeProvider } from '../src/context/ThemeContext';



export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OnboardingProvider>
          <Stack screenOptions={{ headerShown: true }}>
            <Slot />
          </Stack>
        </OnboardingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}