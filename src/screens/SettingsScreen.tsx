import { Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { styles, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.subtitle}>Appearance</Text>
        <Text style={styles.text}>Current theme: {isDark ? 'Dark' : 'Light'}</Text>
        <View style={styles.button} onTouchEnd={toggleTheme}>
          <Text style={styles.buttonText}>
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </Text>
        </View>
      </View>
    </View>
  );
} 