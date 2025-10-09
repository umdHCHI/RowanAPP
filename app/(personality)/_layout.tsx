import { Stack } from 'expo-router';

export default function PersonalityLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="personality"
        options={{
          title: 'Personality',
        }}
      />
    </Stack>
  );
} 