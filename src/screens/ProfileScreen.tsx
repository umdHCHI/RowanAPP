import { Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const { styles } = useTheme();

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.title}>Profile Screen</Text>
    </View>
  );
} 