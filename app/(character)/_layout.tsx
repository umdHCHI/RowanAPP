import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function CharacterLayout() {
  const { theme } = useTheme();
  const { logout } = useAuth();

  const headerRight = () => (
    <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
      <Ionicons name="log-out-outline" size={24} color={theme.notification || '#FF3B30'} />
    </TouchableOpacity>
  );

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerRight,
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