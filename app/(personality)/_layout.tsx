import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';

export default function PersonalityLayout() {
  const { theme } = useTheme();
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color={theme.notification || '#FF3B30'} />
          </TouchableOpacity>
        ),
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