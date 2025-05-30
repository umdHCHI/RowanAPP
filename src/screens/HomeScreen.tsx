import { Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function HomeScreen() {
  const { styles } = useTheme();

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Home Screen</Text>
    </View>
  );
} 