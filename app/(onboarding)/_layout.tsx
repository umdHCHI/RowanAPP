import { Stack } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function OnboardingLayout() {
  const { onboardingTheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: onboardingTheme.background,
        },
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          title: "Welcome",
        }}
      />
      <Stack.Screen
        name="character-creator"
        options={{
          title: "Create Character",
        }}
      />
      <Stack.Screen
        name="personality-test"
        options={{
          title: "Personality Test",
        }}
      />
    </Stack>
  );
}
