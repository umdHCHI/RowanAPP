import { Stack } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        passagesStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
        }}
      />
    </Stack>
  );
}
