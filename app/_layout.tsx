import { ThemeProvider } from '../src/context/ThemeContext';
import TabNavigator from '../src/navigation/TabNavigator';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TabNavigator />
    </ThemeProvider>
  );
}
