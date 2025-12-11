import { Stack } from 'expo-router';
import { useAuth } from '../../src/components/auth/context/AuthContext';
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
    </Stack>
  );
} 