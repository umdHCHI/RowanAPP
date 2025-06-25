import { Text, TouchableOpacity, View, useTheme } from "../imports";

export default function ProfileScreen() {
  const { styles, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Profile</Text>
      
      <View style={styles.card}>
        <Text style={styles.subtitle}>Appearance</Text>
        <Text style={styles.text}>Current theme: {isDark ? 'Dark' : 'Light'}</Text>
        <TouchableOpacity style={styles.button} onPress={toggleTheme}>
          <Text style={styles.buttonText}>
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 