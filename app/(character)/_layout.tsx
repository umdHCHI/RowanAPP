import { Stack } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function CharacterLayout() {
  const { theme } = useTheme();
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="character"
        options={{
          title: 'Character',
        }}
      />
      <Stack.Screen
        name="creator"
        options={{
          title: 'Create Character',
        }}
      />
    </Stack>
  );
} 